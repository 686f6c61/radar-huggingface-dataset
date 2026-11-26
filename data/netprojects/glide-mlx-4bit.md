# netprojects/GLiDE-mlx-4bit

## Resumen

GLiDE-mlx-4bit es una conversión a 4 bits para Apple Silicon (MLX) de GLiDE-27B, el modelo de decisión desarrollado por Fastino sobre la base de Qwen3.8-27B. A diferencia de un modelo conversacional, GLiDE no genera texto: recibe un estado (texto, JSON o imágenes) junto con preguntas tipadas (`choice`, `noul` para sí/no, `score`) y devuelve, en un único forward pass por pregunta, una distribución de probabilidad sobre todas las opciones disponibles. Esta conversión la publica NetProjects (Internet Projects Ltd), que no tiene relación con Fastino.

El checkpoint conserva las particularidades del original: las capas 24-35 y 36-47 se ejecutan dos veces y se mezclan en float32 (midloop), las 16 capas de atención completa leen el prompt en ambas direcciones sin máscara causal, las 48 capas Gated DeltaNet mantienen su recurrencia y la respuesta se obtiene de un readout separado de 255 vías (`readout.safetensors`). Por eso no funciona con `mlx_lm.server` ni con una llamada genérica a `mlx_vlm`: requiere el servidor `glide-mlx` (v0.2.0 o superior).

La relevancia práctica es doble. Por un lado, ofrece un modelo de decisión calibrado con capacidades de imagen y texto que cabe en un Mac de gama alta: 15,3 GB de pesos y 26.085.330.160 parámetros reales. Por otro, mantiene una fidelidad alta respecto a la implementación de referencia en PyTorch bf16 (194 de 204 preguntas con la misma respuesta principal y diferencia media de probabilidad de 0,014), lo que lo hace utilizable en entornos de desarrollo sobre Apple Silicon sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa no causal + 48 capas Gated DeltaNet, con midloop (capas 24-35 y 36-47 ejecutadas dos veces) y readout de 255 vías; base Qwen3.8-27B |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los prompts evaluados llegan a unos 4K tokens) |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64; readout y encoder de visión a precisión original |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (`other`) |
| Formato de pesos | safetensors (MLX), más `readout.safetensors`; repo de 30,7 GB, pesos de 15,3 GB |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.8-27B y la modifica Fastino para convertirla en un modelo de decisión. El bloque principal combina 48 capas Gated DeltaNet (recurrencia lineal) con 16 capas de atención completa que operan sin máscara causal, de modo que ven todo el prompt en ambas direcciones. Sobre esa pila se aplica un midloop: las capas 24-35 y 36-47 se ejecutan dos veces y se mezclan en float32. La salida no es texto generado, sino el estado oculto del último token pasado por un readout de 255 vías y un softmax sobre las opciones a la temperatura definida en `decision_config.json`.

El entrenamiento original corresponde a Fastino y no se detalla en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí documenta esta conversión es el proceso de cuantización: pesos a 4 bits afín con group size 64, manteniendo el readout y el encoder de visión en su precisión original para no degradar la calibración. Se conservan sin cambios el `prompt.py` y el `images.py` de GLiDE, así como el formato de petición y respuesta `POST /v1/systemone` de su servidor.

## Capacidades

- Clasificación y decisión sobre opciones: devuelve una probabilidad para cada opción de una pregunta de tipo `choice` en un solo forward pass, sin generación autoregresiva.
- Preguntas booleanas (`noul`) y de puntuación (`score`), con salida calibrada.
- Procesamiento de estados multimodales: acepta texto, JSON e imágenes como entrada del estado a evaluar.
- Razonamiento bidireccional sobre el prompt gracias a las capas de atención completa sin máscara causal.
- Evaluación de decisiones con muchas opciones simultáneas dentro de una misma pregunta.
- Integración vía API HTTP compatible con el servidor de GLiDE (`POST /v1/systemone`) y vía Python (`GlideMLX.from_pretrained(...).decide(state, questions)`).
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de un modelo conversacional; su función es puntuar opciones.

## Casos de uso

- Enrutamiento de peticiones en un backend: dado el texto de una consulta de usuario, plantear una pregunta `choice` con las rutas disponibles (soporte, facturación, cancelación) y usar la probabilidad más alta como decisión, con umbral de confianza para derivar a revisión humana.
- Moderación y clasificación de contenido: evaluar un texto o una imagen contra una lista de categorías con preguntas `noul` y `score`, aprovechando que el modelo devuelve probabilidades calibradas en lugar de etiquetas discretas.
- Validación de formularios y datos estructurados: pasar un JSON como estado y preguntar si cumple una serie de reglas de negocio, obteniendo una puntuación por regla en una sola pasada.
- Triaje de tickets con imagen adjunta: el pipeline `image-text-to-text` permite incluir capturas o fotos en el estado y decidir la categoría y la urgencia del caso.
- Control de calidad en pipelines de datos: puntuar pares de ejemplos y decidir si una muestra se acepta, se revisa o se descarta, con la ventaja de que la inferencia es determinista y no requiere muestreo.
- Evaluación de agentes y sistemas de decisión: usar JevBench (231 ítems, v1.2.1, adaptador `typesafe`) como referencia para medir la calidad de las decisiones de un sistema propio frente a este checkpoint.
- Prototipado local en Apple Silicon: servir el modelo con `glide-mlx` en un MacBook Pro M5 Max para experimentar con decisiones calibradas sin acceso a GPU NVIDIA, con un tiempo mediano de 0,44 s por ítem de JevBench.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coincidencia con la respuesta principal del código PyTorch bf16 de Fastino | 194 / 204 preguntas; diferencia media de probabilidad 0,014 |
| Preguntas de sí/no y de puntuación idénticas al original | 132 / 132 |
| JevBench público (231 ítems, v1.2.1, `--adapter typesafe`) | 216 / 231 (easy 48/48, standard 72/72, hard 96/111) |
| Tiempo por ítem de JevBench (prompts de hasta ~4K tokens) | 0,44 s de mediana |
| Hardware de medida | MacBook Pro M5 Max, 128 GB, 7 de noviembre de 2026 |

Las discrepancias frente a la referencia se concentran en preguntas `choice` con muchas opciones donde las dos primeras del original estaban muy próximas (margen top-2 de 0,25 o menos, la mayoría por debajo de 0,1). El conjunto de comparación incluye 72 peticiones con 204 preguntas: estados de texto y JSON de 30 a 1.500 palabras, 12 peticiones con imagen y los tres tipos de pregunta.

## Requisitos de hardware

- Pesos de 15,3 GB en 4 bits; el repositorio completo ocupa 30,7 GB.
- Diseñado para Apple Silicon con MLX; la medida de referencia se hizo en un MacBook Pro M5 Max con 128 GB de memoria unificada. No hay datos publicados para otros chips.
- VRAM/memoria unificada estimada: los 15,3 GB de pesos más el estado de activaciones y el encoder de visión a precisión original; conviene reservar holgura por encima de los pesos, aunque no se especifica una cifra exacta.
- No cabe en GPUs de consumo con 8-12 GB; en el ecosistema Apple requiere equipos con memoria unificada alta.
- Despliegue: exclusivamente mediante `glide-mlx` v0.2.0 o superior (`python -m glide_mlx.server --model glide-mlx-4bit --port 8790`). No es compatible con `mlx_lm.server` ni con una llamada genérica a `mlx_vlm` generate.
- Latencia: 0,44 s de mediana por ítem de JevBench con prompts de hasta unos 4K tokens en M5 Max. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-mlx-4bit (este) | 26,1B | no disponible | Decisión calibrada multimodal, 4 bits MLX | Fastino Community | Hugging Face, 234 descargas |
| netprojects/GLiDE-mlx-8bit | no disponible | no disponible | Misma conversión a 8 bits, mayor fidelidad al original | Fastino Community | Hugging Face |
| fastino/GLiDE-27B | 27B (nominal) | no disponible | Modelo de decisión original en PyTorch | Fastino Community | Hugging Face |
| Qwen3.8-27B | 27B (nominal) | no disponible | LLM conversacional base, Apache-2.0 | Apache-2.0 | Hugging Face |

La comparación con LLM conversacionales del mismo tamaño no es directa: GLiDE no genera texto y su evaluación se hace con JevBench, no con MMLU o HumanEval. Frente al checkpoint de 8 bits, este build ocupa aproximadamente la mitad y mueve algo más las probabilidades; el autor recomienda el de 8 bits cuando se busca la máxima coincidencia con el original.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido habitual. Usarlo como chat produce resultados incorrectos.
- Requiere el servidor `glide-mlx`; ejecutarlo con `mlx_lm.server` o `mlx_vlm` genera respuestas erróneas porque no aplica el readout ni la atención bidireccional.
- La cuantización a 4 bits introduce desviaciones en preguntas `choice` con opciones muy próximas (margen top-2 ≤ 0,25); para esos casos conviene el build de 8 bits.
- No se publican datos sobre sesgos, idiomas soportados ni riesgo de alucinación; al no generar texto, el riesgo se traslada a decisiones mal calibradas en dominios fuera de distribución.
- Licencia Fastino Community: el uso comercial exige mostrar "Built with Fastino GLiDE" (sección 4) y, para entidades con ingresos anuales superiores a 10 millones de USD, un acuerdo separado con Fastino (secciones 2-3).
- Esta conversión es una obra derivada y se distribuye bajo los mismos términos; incluye `LICENSE`, `NOTICE` y `licenses/Qwen3.8-27B-LICENSE`.
- NetProjects no está afiliado a Fastino; los problemas de la conversión deben reportarse al repositorio de `glide-mlx`, no a Fastino.
- Longitud máxima de contexto no documentada; las pruebas se limitan a prompts de hasta unos 4K tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/GLiDE-mlx-4bit
- Modelo base: https://huggingface.co/fastino/GLiDE-27B
- Conversión de 8 bits: https://huggingface.co/netprojects/GLiDE-mlx-8bit
- Servidor y librería: https://github.com/internet-projects/glide-mlx
- NetProjects: https://netprojects.com
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
