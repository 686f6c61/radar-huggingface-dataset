# labqoat/qev-0.8b

## Resumen

qev-0.8b es un ajuste fino completo de Qwen/Qwen3.5-0.8B-Base (852.985.920 parámetros) publicado por labqoat que no genera texto: en una única pasada hacia delante devuelve distribuciones de probabilidad calibradas sobre un conjunto finito de opciones. Está concebido como un «modelo de decisión» local —de ahí la etiqueta `system-one`— para clasificación, enrutado, guardarraíles y agentes, donde la salida esperada es una etiqueta o una puntuación y no una cadena de texto.

El modelo admite tres tipos de pregunta (`choice`, `noul` —sí/no— y `score`), hasta 255 opciones por pregunta, varias preguntas independientes en una misma petición y entrada de imagen zero-shot con un máximo de 196 tokens por imagen. Según la model card, encabeza su Benchmark Heaven (77,1 %) entre 27 modelos de decisión de alrededor de 1B y es el más rápido de esa comparativa, con 3,5 ms p50 por petición en una NVIDIA L40S.

Su relevancia práctica está en que permite ejecutar decisiones calibradas en hardware muy modesto —1,7 GB de pesos en bf16, 0,8 GB en 8 bits y 1,3 GB de RAM en un Mac en 8 bits— con licencia Apache-2.0 y formatos PyTorch, MLX y GGUF, lo que facilita usarlo como filtro previo o componente de enrutado sin salir de la máquina. En el momento de la consulta el repositorio acumula 94 descargas y 13 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (tag `qwen3_5`), ajuste fino completo con cabeza de decisión sobre opciones enumeradas |
| Parámetros totales | 852.985.920 (0,85 B; la model card lo denomina 0,8B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, 8 bits, GGUF Q8_0 y vision-Q8_0, MLX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch, repo principal), GGUF (llama.cpp), MLX (Apple silicon) |

Otros datos: pipeline `image-text-to-text`, tamaño del repositorio 3,4 GB, modelo base Qwen/Qwen3.5-0.8B-Base con relación `finetune`, creado el 2026-10-20 y actualizado el 2026-10-21.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer decoder de 852 millones de parámetros, y se ha sometido a un ajuste fino completo (no LoRA) para sustituir la generación autorregresiva por una cabeza que produce una distribución de probabilidad sobre opciones enumeradas en la propia consulta. No hay búsqueda ni lookahead: en los juegos de la demo, el código del juego enumera los movimientos posibles, describe el efecto de cada uno y qev responde una pregunta de sí/no por movimiento, jugando el «sí» más probable con un coste de unos 4 ms por pasada. La entrada de imagen es zero-shot mediante marcadores `<image:NAME>` en el estado, con un presupuesto de hasta 196 tokens por imagen.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación o calibración posteriores. La model card sí documenta qué juegos quedaron fuera del entrenamiento (Tetris, Pac-Man, 2048, Breakout y Whac-A-Mole; Snake sí estaba incluido) y reporta métricas de calibración, como un ECE de 0,115 que baja a 0,105 al usar codificación `per_question` en JevVision v0.

## Capacidades

- Clasificación con probabilidad calibrada sobre preguntas de tipo `choice`, con hasta 255 opciones por pregunta.
- Respuestas booleanas (`noul`) con probabilidad asociada, pensadas para reglas y guardarraíles.
- Puntuación (`score`), por ejemplo para valorar reseñas o priorizar elementos de una bandeja de entrada.
- Varias preguntas independientes en una sola petición: la demo procesa seis correos y 18 preguntas en una única solicitud.
- Detección de prompt injection y filtrado de entradas de agentes.
- Enrutado de herramientas de agente: elige qué herramienta corresponde, aunque no emite la llamada en formato de texto.
- Entrada de imagen zero-shot (tableros de juego, capturas, páginas, documentos) en el motor CUDA rápido o con `qev_image.py`.
- Agentes de juego y toma de decisiones por enumeración externa de acciones, sin búsqueda ni planificación interna.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Modo «thinking» o razonamiento multi-paso explícito: no disponible; el diseño es de una pasada única.

## Casos de uso

- **Firewall de prompt injection en agentes**: colocar qev delante de la entrada de un agente y formular preguntas de sí/no sobre si el texto contiene instrucciones dirigidas al modelo, exfiltración de datos o intentos de cambio de rol; su latencia de 3,5 ms permite filtrar cada mensaje sin cuello de botella.
- **Enrutado de herramientas (tool router)**: enumerar las herramientas disponibles como opciones `choice` y dejar que el modelo devuelva la probabilidad de cada una, derivando a un modelo mayor o a un humano cuando la confianza sea baja.
- **Triaje de soporte al cliente**: clasificar tickets por categoría y urgencia con una sola petición que contenga varias preguntas por ticket, aprovechando que admite hasta 255 opciones por pregunta.
- **Ordenación y priorización de correo**: procesar lotes de mensajes en una única solicitud (la demo lo hace con seis correos y 18 preguntas) para etiquetar, priorizar o marcar como requiere respuesta.
- **Cribado de contenido y spam**: evaluar publicaciones con varias preguntas (anzuelo, fanfarronada, historia inventada, jerga vacía, sustancia) y actuar solo cuando la probabilidad supera un umbral, con la ventaja de que la salida es calibrada y no una etiqueta opaca.
- **Valoración automática de reseñas**: usar preguntas de tipo `score` para asignar estrellas o puntuaciones de calidad y escalar los casos dudosos a revisión humana.
- **Agentes de juego y simulación**: integrar el modelo como política de decisión en juegos de acciones discretas donde el entorno enumera los movimientos legales; el coste de 4 ms por movimiento permite tiempo real en una sola GPU.
- **Clasificación on-device con privacidad**: desplegarlo en un Mac con MLX (109 ms por petición en un M4 Pro, 1,3 GB de RAM en 8 bits) para clasificar logs, páginas o capturas sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card. No se detallan los 26 modelos de decisión comparados, por lo que solo se pueden reproducir las cifras del modelo base.

| Benchmark | qev-0.8b | Qwen3.5-0.8B-Base | Notas |
|---|---|---|---|
| Benchmark Heaven | 77,1 % | No disponible | Primero de 27 modelos de decisión de ~1B |
| JevExtra (agente y seguridad) | 72,0 % | No disponible | Primero de la comparativa |
| JevSpatial (juegos y espacio) | 74,2 % | No disponible | Primero de la comparativa |
| Rules-7 | 63,7 % | No disponible | Empatado en primera posición |
| JevVision v0 (con imágenes) | 0,759 (0,783 con `per_question`) | 0,651 | Motor CUDA rápido, misma ejecución |
| ECE en JevVision v0 | 0,115 (0,105 con `per_question`) | No disponible | Calibración |

| Métrica de latencia | Valor |
|---|---|
| p50 por petición de texto, 1× L40S | 3,5 ms (5,7 ms en peticiones de desarrollo más largas) |
| Texto, M4 Pro con MLX (bf16) | 109 ms (57 ms hasta 512 tokens) |
| Texto, llama-server en M4 Pro (Metal, Q8_0) | ~17 ms por petición corta de una pregunta |
| Imagen, 1× L40S (224×224 a 768×768) | 18–32 ms |
| Imagen con `qev_image.py` en L40S | 61–69 ms |
| Imagen, llama-server visión en L40S (448×448) | 25 ms |
| Decisión de movimiento en juegos | ~4 ms por pasada |

## Requisitos de hardware

- VRAM estimada: 1,7 GB solo para pesos en bf16 y 0,8 GB en 8 bits; el autor no publica VRAM pico con caché de atención y overhead del runtime, por lo que conviene reservar algo más.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM; el modelo se ha medido en una NVIDIA L40S (servidor) y en un Apple M4 Pro (MLX y llama.cpp con Metal).
- En Mac, el consumo total indicado es de 1,3 GB de RAM en 8 bits.
- Opciones de despliegue: `qev_server.py` o `QEV.from_pretrained(..., images=True)` con el motor CUDA rápido (recomendado en producción), `qev.py` con backend transformers para CPU o MPS, `qev_mlx.py` en Apple silicon, y `llama-server -hf labqoat/qev-0.8b-GGUF:Q8_0` (o `vision-Q8_0`) en CPU, Metal, CUDA o Vulkan.
- API común en las cuatro rutas: `POST /v1/systemone`, con la misma codificación de respuesta.
- Latencia: 3,5 ms p50 por petición en L40S. El autor no publica throughput agregado; a partir de esa latencia se puede estimar del orden de 285 peticiones por segundo en un solo flujo, sin datos de batching concurrente.
- Recomendación del autor: codificación `per_question=True` para peticiones con imágenes o con varias preguntas independientes, porque mejora la precisión y la calibración en JevVision v0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark Heaven | JevVision v0 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| labqoat/qev-0.8b | 852.985.920 | No disponible | 77,1 % | 0,759 (0,783 con `per_question`) | Apache-2.0 | safetensors, GGUF, MLX |
| Qwen/Qwen3.5-0.8B-Base | No disponible (el fine-tune tiene 852.985.920) | No disponible | No disponible | 0,651 | No disponible en la información | safetensors |
| Otros 26 modelos de decisión de ~1B | ~1B | No disponible | Por debajo de 77,1 % | No disponible | No disponible | No disponible |

La model card sitúa a qev-0.8b primero de 27 modelos de decisión de tamaño similar, pero no identifica a los otros 26, por lo que no es posible verificar ni reproducir esas comparaciones con los datos disponibles. Frente a su modelo base, la única comparación directa publicada es JevVision v0 (0,759 frente a 0,651, y 0,783 con codificación por pregunta).

## Limitaciones y advertencias

- No genera texto libre: solo responde a preguntas cerradas de tipo `choice`, `noul` o `score` sobre opciones enumeradas previamente. No sirve para redactar, resumir ni mantener una conversación abierta.
- Solo soporta inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Con 0,85 B de parámetros, su capacidad de razonamiento abstracto es limitada; está diseñado para decisiones acotadas, no para problemas que requieran composición de varios pasos o conocimiento factual extenso.
- En juegos y tareas secuenciales depende de que un componente externo enumere y describa las acciones posibles: no hay búsqueda ni lookahead propios.
- La entrada de imagen está limitada a 196 tokens por imagen y es zero-shot, lo que restringe la resolución efectiva y el detalle fino en documentos densos.
- Riesgo de alucinación: aunque la salida sea una probabilidad, el modelo puede asignar alta confianza a opciones incorrectas; la calibración reportada (ECE 0,115) implica que conviene fijar umbrales y escalar los casos dudosos a un humano o a un modelo mayor.
- Los benchmarks (Benchmark Heaven, JevExtra, JevSpatial, Rules-7, JevVision v0) son suites propias del autor y están autopublicados; no se han facilitado resultados de referencia externos como MMLU, HumanEval o GSM8K.
- Como clasificador de prompt injection, proporciona una señal probabilística, no una garantía de seguridad; debe combinarse con otras defensas.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar los términos del modelo base Qwen3.5-0.8B-Base por si imponen condiciones adicionales.
- Adopción todavía muy baja (94 descargas, 13 likes) y sin ecosistema de terceros documentado; para producción conviene validar el comportamiento en el dominio propio antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/labqoat/qev-0.8b
- Variante MLX para Apple silicon: https://huggingface.co/labqoat/qev-0.8b-MLX
- Variante GGUF para llama.cpp: https://huggingface.co/labqoat/qev-0.8b-GGUF
- Demo en vivo: https://app.labqoat.com/e/qev/qev/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Paper, blog técnico o repositorio independiente: no disponible en la información proporcionada.
