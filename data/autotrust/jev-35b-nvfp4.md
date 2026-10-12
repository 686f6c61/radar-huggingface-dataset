# autotrust/JEV-35B-NVFP4

## Resumen

JEV-35B-NVFP4 es una versión cuantizada a NVFP4 de un modelo de decisión de tipo System 1 construido sobre una arquitectura Qwen3.5-35B-A3B de mezcla de expertos (MoE), con unos 3.000 millones de parámetros activos por token y capacidad para evaluar hasta 256 opciones en una sola pasada. El desarrollo corre a cargo de autotrust, y su propósito no es la generación de texto libre, sino la toma de decisiones tipadas con probabilidades calibradas: clasificación, ranking/re-ranking y puntuación de alternativas. Se distribuye con licencia Apache-2.0 y pipeline declarado de text-classification, con soporte de entrada de imagen (image-text-to-text).

La aportación concreta de este checkpoint es la cuantización de los 10.240 MLP de expertos enrutados (40 capas × 256 expertos) al formato NVFP4 de NVIDIA, manteniendo en bf16 el resto del modelo: atención, atención lineal, experto compartido, routers, torre de visión, capa MTP, lm_head, adaptador System 1, cabeza de decisión y temperaturas. El resultado es un peso de descarga de 25,6 GB frente a 71,9 GB en bf16, y un consumo de memoria de pesos en vLLM de 23,3 GiB frente a 66,5 GiB, una reducción del 65 % que permite desplegarlo en una sola GPU de 32–48 GB sin apenas coste de latencia (227 ms de mediana en texto sobre una B200, frente a 215 ms en bf16).

El interés inmediato del checkpoint es práctico: la pérdida declarada de calidad es pequeña pero medible (−0,57 en el Decision Index 0.3 público y −0,85 en la reconstrucción de visión), y la coincidencia con la respuesta top-1 del modelo bf16 es del 96,6 % sobre 308.559 respuestas del índice. Conviene señalar que el recuento real de parámetros en safetensors es de 19.845.695.344 (≈19,85 B), inferior al «35B» de la denominación comercial, y que la model card no documenta la longitud de contexto soportada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con atención + atención lineal, experto compartido, routers, torre de visión y capa MTP (multi-token prediction) |
| Parámetros totales | 19.845.695.344 según safetensors (≈19,85 B); la denominación del modelo es 35B |
| Parámetros activos | ≈3 B por token (MoE; 40 capas × 256 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 E2M1 en grupos de 16, escala FP8 E4M3 por grupo y FP32 por tensor) sobre los expertos enrutados; el resto en bf16. Tag de repositorio «8-bit». Compatibilidad de ejecución: W4A4 nativo en SM100/SM12x y Marlin W4A16 en SM80–90 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout ModelOpt NVFP4 (quant_method: modelopt), más config.json y hf_quant_config.json |

## Arquitectura y entrenamiento

El modelo base JEV-35B parte de una arquitectura Qwen3.5-35B-A3B de mezcla de expertos: 40 capas con 256 expertos enrutados cada una, es decir 10.240 MLP de expertos, más un experto compartido, routers, torre de visión y una capa MTP. Sobre esa base se añade un adaptador System 1 (de tipo LoRA) y una cabeza de decisión con temperaturas propias, de forma que la salida es una decisión tipada con distribución de probabilidad calibrada sobre hasta 256 opciones, no una secuencia de texto. La model card describe atención y atención lineal conviviendo en la misma pila, lo que es coherente con el tag qwen3_5_moe del repositorio.

En este checkpoint la intervención se limita a los expertos enrutados: las proyecciones gate, up y down de cada experto se cuantizan a NVFP4, compartiendo gate y up una única escala de tensor porque vLLM las fusiona. Las activaciones de los expertos usan escalas estáticas calibradas sobre 3.072 prompts de System 1. El adaptador System 1 no aplica LoRA sobre los expertos enrutados, por lo que `adapter_vllm/` es idéntico al del modelo bf16. La model card no proporciona detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información consultada.

## Capacidades

- Decisión tipada y clasificación con probabilidades calibradas: evalúa hasta 256 opciones en una sola pasada, con puntuación numérica por opción (tags «choice» y «score»).
- Re-ranking y ordenación por importancia o relevancia, con latencia declarada de aproximadamente medio segundo por decisión en el caso de uso de recomendación.
- Comprensión de imagen (image-text-to-text): puntuación aproximada de visión de 72,08 en bf16 y 71,23 en NVFP4 sobre la reconstrucción propia del autor con 13.361 filas.
- Computer use: identificación de elementos mediante cajas numeradas y texto de elemento, con un 95 % de acierto en 60 tareas cuando se proporcionan ambos.
- Control de brazo robótico en tareas de pick and place: 13 de 20 escenas resueltas en NVFP4 (15 de 20 en bf16), con 13 de 13 cubos agarrados depositados en la bandeja.
- Razonamiento lúdico y de planificación limitada: 2048, Snake, Quick, Draw!, mate en uno en ajedrez y Connect Four.
- Cobertura temática medida por el Decision Index: áreas de Knowledge (0,422), Language (0,628), Retrieval (0,706), Tools (0,753) y Arts (0,413) en el modelo NVFP4, todas dentro de 1,2 puntos del bf16.
- Multilingüe: únicamente inglés declarado; no hay soporte documentado de otros idiomas.
- Tool calling / function calling: no se documenta explícitamente en la información disponible; el área «Tools» del índice de decisión obtiene 0,753, lo que indica cobertura de decisiones relacionadas con herramientas, pero sin especificación de interfaz.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Audio: no soportado según la información disponible.

## Casos de uso

- Re-ranking de titulares de prensa por importancia: es el escenario del demo GuruSearch, donde se ordenan los últimos titulares de 6 fuentes de noticias mediante decisiones System 1 calibradas, cada una resuelta en torno a medio segundo, lo que permite refrescar la portada con frecuencia sin coste de generación de texto.
- Re-ranking de resultados de buscador: el modelo reordena resultados de Google News, Bing News y Yahoo News por relevancia, en paralelo al orden original de cada buscador, y produce una respuesta corta con citas; encaja porque el modelo está optimizado para puntuar alternativas, no para redactar.
- Enrutamiento y clasificación con umbral de confianza: al emitir probabilidades calibradas, se puede usar como clasificador de entrada en un pipeline (por ejemplo, derivar una consulta a un humano si la probabilidad de la mejor opción cae por debajo de un umbral) sustituyendo al modelo bf16 en GPUs de 32–48 GB.
- Automatización de interfaz (computer use): con cajas numeradas más texto de elemento alcanza el 95 % en 60 tareas, lo que lo hace adecuado para agentes que pulsan elementos concretos de una aplicación; usar solo cajas numeradas hunde el resultado al 37–38 %, así que el pipeline debe aportar el texto del elemento.
- Robótica de manipulación: para pick and place con un brazo, 13 de 20 escenas en NVFP4 y 13 de 13 objetos agarrados depositados correctamente en la bandeja; el checkpoint es válido cuando prima el coste de memoria sobre el número de escenas resueltas.
- Análisis de gráficos y documentos visuales: la tarea CharXiv es una de las evaluadas en visión (con una caída de 5,3 puntos frente a bf16), por lo que es un caso razonable siempre que se asuma esa merma.
- Evaluación y anotación por lotes: procesar 308.559 respuestas del Decision Index manteniendo el 96,6 % de coincidencia con la respuesta top-1 del modelo bf16 permite abaratar la anotación masiva conservando casi el mismo criterio.
- Despliegue en una sola GPU en producción: liberar 43 GiB de memoria de pesos (de 66,5 a 23,3 GiB) posibilita servir el modelo con vLLM en hardware de una sola tarjeta donde el bf16 no cabe, sin penalización apreciable de latencia en peticiones únicas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card. La entrada del model-index figura con `verified: false` y corresponde a una puntuación propia con el kit del autor, no a una entrada de leaderboard.

| Métrica | JEV-35B (bf16) | JEV-35B-NVFP4 | JEV-27B-VL |
|---|---:|---:|---:|
| Decision Index 0.3, suite pública (puntuación propia) | 59,75 | 59,18 | 53,64 |
| Puntuación pública de visión (reconstrucción propia, 13.361 filas) | 72,08 | 71,23 | 71,67 |
| Latencia mediana, texto, una B200 (ms) | 215 | 227 | 271 |
| Latencia mediana, imagen, una B200 (ms) | 378 | 371 | no disponible |
| Coincidencia top-1 con bf16 (308.559 respuestas) | — | 96,6 % | — |
| Coincidencia con bf16 en visión | — | 95,2 % | — |
| Computer use, cajas numeradas + texto (60 tareas) | 95 % | 95 % | no disponible |
| Computer use, solo cajas numeradas (60 tareas) | 38 % | 37 % | no disponible |
| Brazo robot, pick and place (20 escenas) | 75 % | 65 % | no disponible |

Áreas del Decision Index en NVFP4, todas dentro de 1,2 puntos del bf16: Knowledge 0,422; Language 0,628; Retrieval 0,706; Tools 0,753; Arts 0,413. Los mayores cambios por benchmark son Home appliance simulator −5,7, CRUXEval −4,7, GPQA +5,4 y CharXiv charts −5,3.

| Prueba lúdica (seed 0, una ejecución, ruidosa) | JEV-35B (bf16) | JEV-35B-NVFP4 |
|---|---:|---:|
| 2048, ficha mayor | 32 | 64 |
| Snake, comida | 11 | 5 |
| Quick, Draw!, bocetos terminados | 86,3 % | 85,9 % |
| Ajedrez, mate en uno | 47 % | 45 % |
| Connect Four | 0 victorias de 6 | 1 victoria de 6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 23,3 GiB en vLLM para NVFP4, frente a 66,5 GiB del bf16; descarga de pesos de 25,6 GB frente a 71,9 GB.
- Una sola GPU de 32–48 GB es suficiente según el autor, lo que convierte el despliegue en viable en tarjetas de gama profesional de una sola unidad.
- B200, B300 y GB200 (SM100): ejecución W4A4 nativa con kernels NVFP4 MoE de FlashInfer TRT-LLM. Es la configuración probada por el autor (B200).
- RTX PRO 6000, RTX 5090 y DGX Spark (SM12x): W4A4 nativo con kernels CUTLASS / FlashInfer CUTLASS FP4 MoE. No probado por el autor.
- H100, H200 y A100 (SM80–90): Marlin W4A16, pesos en FP4 y activaciones en bf16. No probado por el autor.
- Opciones de despliegue: vLLM, que lee la cuantización de config.json y hf_quant_config.json sin necesidad de flags adicionales; se incluye un `serve.sh` que levanta el servicio en el puerto 8000 y una carpeta `adapter_vllm/` para el adaptador System 1. No se documentan despliegues con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: mediana de 227 ms en texto y 371 ms en imagen por petición única sobre una B200. El autor indica que la latencia es la misma que en bf16 y que la ganancia de NVFP4 es de memoria, no de velocidad.
- Throughput y requisitos de memoria para lotes concurrentes: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (suite pública) | Visión (reconstrucción) | Latencia texto (B200) | Licencia |
|---|---|---|---|---|---|---|
| autotrust/JEV-35B-NVFP4 | 19,85 B en safetensors (≈3 B activos) | no disponible | 59,18 | 71,23 | 227 ms | Apache-2.0 |
| autotrust/JEV-35B (bf16) | no disponible en la información | no disponible | 59,75 | 72,08 | 215 ms | Apache-2.0 (según el modelo base) |
| autotrust/JEV-27B-VL | no disponible en la información | no disponible | 53,64 | 71,67 | 271 ms | no disponible |

La comparación directa es con las otras dos variantes de la misma familia: el bf16 del que deriva y el JEV-27B-VL, que queda 6,11 puntos por debajo en el Decision Index público. No se dispone de datos de modelos comparables de otros autores (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- El único idioma declarado es el inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- La longitud de contexto no se documenta, lo que impide planificar despliegues que dependan de ventanas largas.
- El recuento real de parámetros en safetensors (19.845.695.344) no coincide con el «35B» de la denominación comercial; conviene verificar el tamaño efectivo antes de dimensionar hardware.
- Los resultados del model-index están marcados con `verified: false` y proceden de una puntuación propia con el kit del autor, no de una entrada de leaderboard independiente; el propio autor aclara que no es una entrada de tabla comparativa.
- Riesgo de alucinación: no cuantificado en la información disponible. El modelo emite probabilidades calibradas, por lo que la verificación debe apoyarse en umbrales de confianza y no en la plausibilidad del texto.
- Pérdida de calidad por cuantización: −0,57 en el Decision Index, con caídas notables en Home appliance simulator (−5,7), CRUXEval (−4,7) y CharXiv charts (−5,3). La pérdida en visión (−0,85) es pequeña pero real, con intervalo bootstrap del 95 % de −1,5 a −0,2.
- Regresión específica en robótica: 13 de 20 escenas frente a 15 de 20 en bf16; el autor la considera dentro del ruido (sign test p = 0,63), pero son 3 escenas perdidas frente a 1 ganada.
- Los resultados en juegos proceden de una única ejecución con seed 0 y el propio autor los califica de ruidosos; no deben tomarse como medida estable.
- Rendimiento en computer use muy dependiente del formato de entrada: 95 % con cajas numeradas y texto de elemento, 37–38 % con cajas numeradas solas.
- No se documentan datos de composición del dataset de entrenamiento ni de alineación (RLHF/DPO), por lo que no es posible evaluar sesgos sistemáticos con la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad de verificar términos de terceros asociados a la arquitectura base.
- Compatibilidad de kernels limitada por generación de GPU: solo la ruta SM100 (B200) está probada por el autor; las rutas SM12x y SM80–90 figuran como no probadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV-35B-NVFP4
- Modelo base (bf16): https://huggingface.co/autotrust/JEV-35B
- Variante anterior de la familia: https://huggingface.co/autotrust/JEV-27B-VL
- Demo en vivo de recomendación y búsqueda (GuruSearch): https://news.guru.so/ui
- Informes de demos del checkpoint NVFP4 (ruta dentro del repositorio): `reports/demos-nvfp4/`
- Informes de demos del modelo bf16 (ruta dentro del repositorio): `reports/demos/`
- Adaptador System 1 para vLLM (ruta dentro del repositorio): `adapter_vllm/`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos no relacionados (foros de preguntas y respuestas y discusiones sobre certificados SSL y edición de código).
