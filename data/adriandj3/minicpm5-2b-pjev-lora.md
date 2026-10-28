# adriandj3/MiniCPM5-2B-pjev-LoRA

## Resumen

MiniCPM5-2B-pjev-LoRA es un adaptador LoRA de rango 64 publicado por adriandj3 (Adrian Ciprian Iancu) sobre el modelo denso openbmb/MiniCPM5-2B. No es un modelo generativo al uso: es un "decision model" de un solo token. Recibe un estado, una pregunta y una lista de opciones etiquetadas con letras (A-G), y devuelve en una única pasada hacia delante una probabilidad calibrada por cada opción. El adaptador no reimplementa el modelo base: se activa por petición sobre el mismo servidor MiniCPM5-2B que ya esté en marcha.

El origen es el modelo fusionado Kailune-AI/pjev-2b (unos 2,7 GB en Q8_0). Este repositorio reexpresa ese fine-tune como una LoRA de rango 64 extraída mediante SVD truncado de las 294 matrices lineales, con `lora_alpha = r = 64`, y la publica en formato PEFT (safetensors) y GGUF para llama.cpp. El resultado ocupa 201 MB y se carga junto al modelo base, en lugar de mantener un segundo modelo completo en memoria.

Su relevancia práctica está en el enrutado de herramientas y la toma de decisiones en agentes locales: sobre 62 decisiones retenidas de un arnés real, el modelo base sin adaptador acierta el 71,0 % y con la LoRA activada sube al 93,5 %, con una latencia mediana de 0,22 s por decisión en una GTX 1080 de 8 GB. Frente a pedir razonamiento completo a un modelo mayor (91,9 % pero 7,8 s de media), ofrece precisión comparable en dos órdenes de magnitud menos de tiempo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de rango 64 sobre un transformer denso MiniCPM5-2B (7 proyecciones lineales por capa: q, k, v, o, gate, up, down) |
| Parámetros totales | 100.466.688 en el adaptador (safetensors); el modelo base MiniCPM5-2B es denso de 2B |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue del autor (`-c 32768`); longitud nativa del modelo base: no disponible |
| Tipos de cuantización | adaptador en F16 (GGUF) y safetensors; evaluado sobre el modelo base en Q8_0 con KV cache en q8_0 |
| Idiomas soportados | inglés (idioma de entrenamiento); italiano medido con caída (69,4 % con LoRA, 64,5 % sin ella) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) y GGUF LoRA F16 (`pjev-lora-r64-f16.gguf`) |
| Rango / alpha de la LoRA | 64 / 64 |
| Tamaño del adaptador | 201 MB (0,4 GB de repositorio) |
| Modelo base | openbmb/MiniCPM5-2B (revisión `f97400052a43`) |
| Pipeline declarado | text-classification |
| Descargas / likes | 118 / 2 |
| Fecha de creación / actualización | 2026-10-03 / 2026-10-28 |

## Arquitectura y entrenamiento

El adaptador se construyó por extracción, no por entrenamiento nuevo. Los 87 tensores no lineales del modelo fusionado pjev-2b (embeddings, normas y cabeza de salida) son bit a bit idénticos a openbmb/MiniCPM5-2B, de modo que toda la diferencia respecto al base vive en las siete proyecciones lineales de cada capa. El autor calculó los valores singulares de `W_pjev - W_base` y comprobó que el 99,9 % de la energía de una proyección de atención se concentra en las primeras 64 direcciones; el resto, plano en las proyecciones MLP, se atribuye al redondeo bf16 de la fusión y no a señal. Sobre esa base aplicó un SVD truncado por matriz (294 matrices, rango 64, `B = U·sqrt(S)`, `A = sqrt(S)·V^T`), guardó el resultado en formato PEFT con `lora_alpha = r = 64` y lo convirtió a GGUF con `convert_lora_to_gguf.py`.

Al ser una aproximación del modelo fusionado, la LoRA no reproduce exactamente su comportamiento: coincide en la opción elegida en 60 de las 62 preguntas retenidas, y las dos discrepancias explican la diferencia de un acierto entre ambas filas de resultados. No hay información disponible sobre la composición del dataset de entrenamiento original de pjev-2b, el número de tokens, ni si se usaron RLHF, DPO u otras técnicas de alineación. La innovación técnica del repositorio es de empaquetado y despliegue: convertir un modelo de decisión completo de 2,7 GB en 201 MB activables por petición mediante la escala de LoRA de llama.cpp, con decodificación restringida a un único token de letra.

## Capacidades

- Decisión de elección múltiple tipada: dado un estado, una pregunta y opciones etiquetadas de la A a la G, devuelve una distribución de probabilidad sobre las opciones en una sola pasada.
- Salida calibrada: el autor reporta que todos los fallos del modelo fusionado tenían confianza baja (0,34 a 0,61), lo que permite usar umbrales de confianza para derivar casos dudosos.
- Enrutado de herramientas (tool routing): selección de qué herramienta de solo lectura invocar en un arnés de agente local (22/24 aciertos en el conjunto retenido).
- Selección de elemento de interfaz: elección del elemento sobre el que actuar en automatización de navegador (21/22).
- Clasificación de estado de página web: determinación del estado en que se encuentra una página (15/16).
- Conmutación por petición: la LoRA se activa con escala 1 para decisiones y escala 0 para el resto de peticiones del mismo servidor, sin cargar un segundo modelo.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling conversacional, visión, audio ni modo thinking: la salida está restringida por gramática a un único carácter `[A-G]`.
- Capacidad multilingüe limitada: entrenado en inglés; en italiano baja al 69,4 %.

## Casos de uso

- Enrutado de herramientas en agentes locales: el agente envía estado actual, pregunta ("¿qué herramienta de solo lectura toca ahora?") y la lista de herramientas como opciones; el modelo devuelve la probabilidad de cada una en 0,22 s y el orquestador ejecuta la de mayor probabilidad. Es adecuado porque sustituye una llamada generativa completa por una pasada de un token.
- Automatización de interfaz (RPA web): dado el DOM resumido o la lista de elementos interactivos y una pregunta sobre el objetivo, el modelo elige el elemento a pulsar. Encaja en bucles de automatización porque la latencia de 0,22 s permite decenas de decisiones por minuto.
- Clasificación de estado de página en crawlers y agentes de navegación: decidir si una página es un formulario, un listado, una pantalla de error o un muro de pago, con etiquetas cerradas y probabilidad asociada.
- Puerta de confianza en pipelines de dos etapas: si la probabilidad máxima queda por debajo de un umbral, derivar la decisión a un modelo con razonamiento completo (el autor mide 91,9 % con 7,8 s de media en LFM2.5-2.6B), y resolver el resto con la LoRA. Reduce el coste medio manteniendo la precisión en los casos difíciles.
- Clasificación de texto con etiquetas cerradas en producción: enrutado de intenciones, triaje de tickets o moderación por categorías predefinidas, aprovechando el pipeline `text-classification` y la cabeza de probabilidades en lugar de generar etiquetas como texto.
- Despliegue en hardware antiguo o edge: el montaje completo (base Q8_0 más adaptador) se ejecutó en una GTX 1080 de 8 GB, lo que habilita decisiones locales sin coste de API en estaciones de trabajo antiguas o equipos con GPU modesta.
- Evaluación comparativa de prompts y calibración: al devolver probabilidades por opción en lugar de texto, sirve para medir deriva de formato y calibración entre versiones de prompt sin depender de la varianza del muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son los de un conjunto privado de 62 decisiones en inglés procedentes de un arnés de agente local real (24 de elección de herramienta, 22 de elemento de UI, 16 de estado de página), escrito antes de probar los modelos y nunca usado para ajuste. Una pregunta equivale a 1,6 puntos porcentuales.

| Decisor (mismas 62 preguntas) | Precisión | Herramienta | Elemento UI | Estado de página | Latencia por decisión |
|---|---|---|---|---|---|
| MiniCPM5-2B + esta LoRA | 93,5 % (58/62) | 22/24 | 21/22 | 15/16 | 0,22 s mediana |
| pjev-2b, modelo fusionado completo | 91,9 % (57/62) | 22/24 | 20/22 | 15/16 | 0,16 s mediana |
| MiniCPM5-2B, mismo prompt, LoRA desactivada | 71,0 % | 10/24 | 20/22 | 14/16 | 0,17 s |
| MiniCPM5-2B, mejor prompt plano + calibración por lote | 75,8 % | 15/24 | 16/22 | 16/16 | 0,15 s |
| LFM2.5-2.6B, mejor prompt plano + calibración por lote | 85,5 % | no disponible | no disponible | no disponible | 0,23 s |
| LFM2.5-2.6B, razonamiento completo antes de responder | 91,9 % | no disponible | no disponible | no disponible | 7,8 s media |

Condiciones de medida declaradas por el autor: llama.cpp b10549 (`b2e5e9b28`), MiniCPM5-2B Q8_0 (GGUF oficial), KV cache q8_0, GTX 1080 de 8 GB (Pascal), con unos 340 tokens de prompt procesados por decisión incluidos en la latencia. En italiano el mismo montaje baja al 69,4 % con LoRA y al 64,5 % sin ella.

## Requisitos de hardware

- VRAM del adaptador: 201 MB en F16 (unos 200 MB adicionales sobre el modelo base), frente a los 2,7 GB de un segundo modelo fusionado en Q8_0.
- VRAM total estimada: alrededor de 3 a 3,5 GB para el modelo base en Q8_0 (~2,7 GB) más el adaptador y la caché KV en q8_0; el autor lo ejecutó con 32.768 tokens de contexto en una GPU de 8 GB.
- GPU validadas: GTX 1080 de 8 GB (Pascal, sin tensor cores) con llama.cpp b10549. No se han publicado pruebas en A100, H100, RTX 4090 ni en GPUs con menos de 8 GB.
- Cabe en GPU de consumo: sí, al menos en el caso medido de 8 GB; con cuantizaciones más agresivas del modelo base (Q4) el margen aumentaría, aunque no hay medidas publicadas de esa combinación.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora pjev-lora-r64-f16.gguf --lora-init-without-apply -c 32768 -ngl 999 -fa on --jinja`) y PEFT/transformers con safetensors. Existe endpoint de terceros en FriendliAI. Soporte en vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Latencia: 0,22 s de mediana por decisión (incluye el procesado de unos 340 tokens de prompt) en GTX 1080. Throughput agregado en peticiones por segundo: no disponible.
- Gestión de la escala de LoRA: en llama.cpp b10549 la escala fijada por una petición persiste en ese slot; hay que enviar `"lora": [{"id": 0, "scale": 0}]` en cada petición de chat o dedicar un `id_slot` distinto al decisor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (62 decisiones) | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-2B + pjev-LoRA | 2B denso + 100,5 M de adaptador | 32.768 en el ejemplo de despliegue | 93,5 % | 0,22 s | Apache 2.0 | HuggingFace, GGUF y PEFT |
| Kailune-AI/pjev-2b (fusionado) | 2B denso | no disponible | 91,9 % | 0,16 s | no disponible | HuggingFace, ~2,7 GB en Q8_0 |
| MiniCPM5-2B base (sin adaptador) | 2B denso | no disponible | 71,0 % | 0,17 s | no disponible en la información aportada | HuggingFace, GGUF oficial |
| LFM2.5-2.6B (prompt plano calibrado / razonamiento) | 2,6B | no disponible | 85,5 % / 91,9 % | 0,23 s / 7,8 s | no disponible | no disponible en esta ficha |

La comparación relevante es de coste por acierto: la LoRA iguala o supera al modelo fusionado y al razonamiento completo de un modelo mayor, con la latencia más baja de la tabla salvo el propio pjev-2b fusionado.

## Limitaciones y advertencias

- Idioma: entrenado solo en inglés. En italiano cae al 69,4 % (frente al 93,5 % en inglés), por lo que no debe usarse como decisor multilingüe sin evaluarlo antes.
- Formato de prompt rígido: solo funciona con el formato exacto de pjev-2b (mensaje de sistema fijo, turno de usuario en JSON y plantilla de chat con el modo thinking desactivado). Cualquier variación invalida las probabilidades.
- Espacio de salida restringido a `[A-G]`: máximo siete opciones por decisión y una sola letra por pasada. No hay razonamiento multi-paso ni posibilidad de abstenerse salvo por umbral externo.
- No es un modelo conversacional: no genera texto, código ni explicaciones; usarlo fuera de la tarea de clasificación/elección no está soportado.
- Aproximación del fusionado: al derivarse por SVD truncado, discrepa del modelo original en 2 de 62 preguntas. No es una reproducción exacta.
- Calibración no equivalente a certeza: los errores observados se concentran en confianzas de 0,34 a 0,61, de modo que un umbral mal elegido deja pasar fallos silenciosos; conviene validar el umbral con datos propios.
- Muestra de evaluación pequeña y privada: 62 preguntas de un único arnés y dominio (herramientas, UI y estado de página). Cada pregunta pesa 1,6 puntos, así que el intervalo de confianza es amplio y no hay benchmarks públicos que lo respalden.
- Fallo de aislamiento en llama.cpp b10549: la escala de LoRA queda fijada en el slot y puede contaminar peticiones de chat posteriores si no se envía escala 0 explícita.
- Licencia: el adaptador es Apache 2.0 y permite uso comercial, pero la licencia del modelo base y del pjev-2b fusionado no se detalla en la información disponible; hay que verificarlas por separado antes de producción.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto libre), pero se traslada a selección errónea de opción con confianza media cuando el estado de entrada es ambiguo o el formato no se respeta.
- Sesgos: no se ha publicado ningún análisis de sesgos demográficos, lingüísticos o de dominio para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adriandj3/MiniCPM5-2B-pjev-LoRA
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo fusionado de origen: https://huggingface.co/Kailune-AI/pjev-2b
- Repositorio GitHub del autor: https://github.com/ArtyomITA/minicpm5-kernel-pascal
- Perfil GitHub del autor: https://github.com/ArtyomITA
- Perfil HuggingFace del autor: https://huggingface.co/adriandj3
- LinkedIn del autor: https://www.linkedin.com/in/adrian-ciprian-iancu-a2a477391
- Repositorio oficial de MiniCPM (OpenBMB): https://github.com/OpenBMB/MiniCPM
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/adriandj3/MiniCPM5-2B-pjev-LoRA
- Ficha en metatext (precios, precisión y calibración): https://metatext.io/decision-models/minicpm5-2b-pjev-lora
- Registro en free2aitools: https://free2aitools.com/model/adriandj3/minicpm5-2b-pjev-lora
