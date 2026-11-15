# iapp/OpenThai-SystemOne-NVFP4

## Resumen

OpenThai-SystemOne-NVFP4 es la version cuantizada en NVFP4 del modelo iapp/OpenThai-SystemOne, un modelo de decision de tipo "System One" desarrollado por iApp (parte de la iniciativa OpenThai, anteriormente OpenThaiGPT) y lanzado junto con AIEAT. No es un modelo generativo: se trata de un clasificador de decisiones que responde en un unico pase hacia delante a preguntas tipadas (eleccion entre hasta 255 opciones, puntuacion ordinal o si/no) sobre un estado de entrada en texto o JSON, devolviendo probabilidades calibradas. Su relevancia radica en ofrecer una alternativa determinista y de baja latencia a la generacion de texto para tareas de clasificacion y enrutamiento.

La arquitectura parte de una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandes, a la que se anade una cabeza de decision de 256 ranuras. Este repositorio concreto aplica cuantizacion NVFP4 W4A4 (pesos y activaciones en FP4, escalas en FP8) mediante compressed-tensors y llm-compressor sobre la version v0.3 del modelo base, reduciendo el tamano de 1.509 MB a 790 MB. Solo se cuantizan las capas lineales de la torre; embeddings, cabeza de decision y temperaturas por tipo permanecen en bf16.

El modelo esta pensado para entornos donde se necesita clasificar, puntuar o decidir con probabilidades calibradas en tailandes e ingles, sin coste de generacion autoregresiva. Su licencia Apache-2.0 y su tamano compacto lo hacen desplegable en hardware modesto, aunque el aprovechamiento nativo de FP4 requiere GPUs NVIDIA Blackwell y la cabeza personalizada limita el soporte en runtimes como vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (torre de texto Qwen3.5-0.8B) con cabeza de decision de 256 ranuras |
| Parametros totales | 752.674.883 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones FP4, escalas FP8); checkpoint compressed-tensors |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); descompresion a bf16 al cargar en transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3.5-0.8B, con preentrenamiento continuado en tailandes, al que se le acopla una cabeza de decision de 256 ranuras que sustituye la generacion de texto por una salida estructurada. La cabeza admite tres tipos de consulta: `choice` (seleccion entre hasta 255 opciones), `score` (puntuacion ordinal) y `noul` (si/no), con temperaturas por tipo para calibrar las probabilidades. El modelo realiza una unica pasada hacia delante por consulta, sin decodificacion autoregresiva.

Esta version concreta cuantiza unicamente las capas lineales de la torre a NVFP4 (W4A4 con escalas FP8) usando llm-compressor y el formato compressed-tensors. Los embeddings de tokens, la cabeza de decision de 256 ranuras y las temperaturas por tipo se mantienen en bf16, de modo que la cuantizacion solo perturba el estado oculto que lee la cabeza. Los detalles completos de datos de entrenamiento, numero de tokens y posible RLHF/DPO no estan disponibles en la informacion proporcionada; la model card remite al modelo base para esa informacion.

## Capacidades

- Clasificacion de texto con opciones tipadas: seleccion entre hasta 255 opciones (`choice`) con probabilidades calibradas.
- Puntuacion ordinal (`score`) para tareas como evaluacion de calidad, relevancia o consistencia.
- Decisiones binarias si/no (`noul`) sobre un estado de entrada.
- Entrada multimodal de estado: acepta texto plano o JSON como contexto de la consulta.
- Soporte bilingue tailandes e ingles.
- Salida determinista en un unico pase, sin generacion de texto libre.
- Integracion con Python mediante `transformers` (con `trust_remote_code=True`) o el paquete `openthai_systemone` (`SystemOneClient`).
- No soporta tool calling generativo ni razonamiento multi-paso por si mismo; su funcion es la decision atomica.

## Casos de uso

- Moderacion de contenido y clasificacion de comentarios: el modelo puede etiquetar textos como positivos, negativos o neutros, o detectar toxicidad con `noul`, con probabilidades calibradas que permiten fijar umbrales de decision en produccion.
- Enrutamiento de consultas en atencion al cliente: dado un mensaje de usuario, clasificarlo entre un conjunto de intenciones predefinidas (`choice`) para dirigirlo al flujo o agente adecuado, con coste de inferencia minimo al no generar texto.
- Analisis de sentimiento y resenas en tailandes: puntuar resenas de restaurantes o productos con `score` ordinal, aprovechando el preentrenamiento continuado en tailandes del modelo base.
- Evaluacion de calidad de resumenes y respuestas: usar los modos `score` para consistencia y relevancia (subsets summeval) en pipelines de evaluacion automatica de sistemas generativos.
- Verificacion de afirmaciones y respuesta a preguntas: decidir si un pasaje respalda una afirmacion (`noul`) o seleccionar la respuesta correcta entre candidatas (`choice`), como en los subsets squad2, boolq o pubmedqa.
- Clasificacion de intenciones en asistentes de voz o chatbots: con el subset massive en tailandes e ingles, el modelo puede mapear utterances a intenciones de dominio con latencia de un solo pase.
- Deteccion de herramientas o acciones en agentes: el subset xlam_tools sugiere uso para decidir que herramienta invocar a partir de la consulta, sin generar la llamada.

## Benchmarks y rendimiento

Resultados de precision (exactitud en un unico orden de opciones, primeros 800 registros por conjunto) comparando esta cuantizacion con el original en bf16:

| Subset | bf16 original | NVFP4 | Delta |
|---|---|---|---|
| aegis2 (noul) | 83.2 | 84.0 | +0.8 |
| boolq (noul) | 79.7 | 79.0 | -0.7 |
| civil_comments (noul) | 79.0 | 75.7 | -3.3 |
| helpsteer2 (score) | 41.6 | 41.6 | +0.0 |
| massive-de-DE (choice) | 88.3 | 85.1 | -3.1 |
| massive-en-US (choice) | 88.3 | 88.6 | +0.3 |
| multinli (choice) | 89.0 | 84.9 | -4.0 |
| paws (noul) | 94.0 | 92.8 | -1.2 |
| pubmedqa (choice) | 64.0 | 62.0 | -2.0 |
| squad2 (noul) | 89.3 | 86.6 | -2.7 |
| summeval-consistency (score) | 75.0 | 79.9 | +4.9 |
| summeval-relevance (score) | 21.7 | 26.7 | +5.0 |
| vitaminc-dev (choice) | 72.5 | 71.3 | -1.2 |
| Macro publico (13 subsets) | 74.3 | 73.7 | -0.6 |
| banking77 (choice) | 59.1 | 57.0 | -2.1 |
| contrastive_th (choice) | 80.7 | 79.4 | -1.4 |
| contrastive_th (noul) | 83.5 | 81.9 | -1.6 |
| contrastive_th (score) | 78.6 | 75.0 | -3.6 |
| massive_th (choice) | 90.6 | 88.0 | -2.6 |
| prachathai (choice) | 98.3 | 98.5 | +0.2 |
| prachathai (noul) | 93.4 | 93.6 | +0.2 |
| sib200_th (choice) | 77.9 | 75.0 | -2.9 |
| wisesight (choice) | 48.9 | 48.4 | -0.5 |
| wongnai (score) | 64.5 | 63.5 | -1.0 |
| xlam_tools (choice) | 99.4 | 99.5 | +0.1 |
| xnli_th (choice) | 79.8 | 77.2 | -2.5 |
| xnli_th (noul) | 86.8 | 86.0 | -0.8 |
| Macro tailandes | 80.1 | 78.7 | -1.4 |

La cuantizacion pierde en media 0.6 puntos en el banco publico y 1.4 en los conjuntos tailandeses, con mejoras puntuales en summeval (hasta +5.0) y prachathai.

## Requisitos de hardware

- VRAM estimada: el repo pesa 790 MB; cargado en transformers los pesos se descomprimen a bf16 (aproximadamente 1.5 GB), por lo que la inferencia convencional requiere en torno a 2-3 GB de VRAM incluyendo activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para carga en bf16. Para aprovechar kernels nativos FP4 se necesita NVIDIA Blackwell (por ejemplo, B200); con FP8 o INT8 nativos se requiere un runtime compatible con esta arquitectura.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` y el paquete `compressed-tensors`; paquete `openthai_systemone` (`SystemOneClient`). vLLM no sirve el modelo de forma nativa porque la cabeza de decision es personalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un unico pase hacia delante sin generacion, la latencia esperada es muy inferior a la de un modelo generativo del mismo tamano, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-NVFP4 | 752,7 M | no disponible | Decision clasificatoria (choice/score/noul) | Apache-2.0 | Hugging Face |
| iapp/OpenThai-SystemOne (bf16) | 752,7 M | no disponible | Decision clasificatoria, version sin cuantizar | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B (modelo base de la torre) | ~0,8 B | no disponible | Generacion de texto | no disponible | no disponible |

No se dispone de datos de benchmarks de Qwen3.5-0.8B ni de otros modelos de decision comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento cruzada.

## Limitaciones y advertencias

- Perdida de precision respecto al bf16: hasta 4.0 puntos en multinli y 3.6 en contrastive_th (score); en produccion conviene revalidar umbrales calibrados sobre el modelo cuantizado.
- Los kernels nativos FP4 requieren NVIDIA Blackwell; en otras GPUs los pesos se descomprimen a bf16, perdiendo la ventaja de velocidad y manteniendo solo la reduccion de descarga.
- vLLM no sirve el modelo de forma nativa debido a la cabeza de decision personalizada; el despliegue queda limitado a transformers o al cliente propio.
- Solo soporta tailandes e ingles; el rendimiento en otros idiomas no esta documentado.
- Es un modelo de decision, no generativo: no produce texto libre ni razonamiento multi-paso, y no soporta tool calling generativo.
- Riesgo de alusion de calibracion: las probabilidades dependen de temperaturas por tipo; un uso fuera de los tipos previstos puede degradar la calibracion.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de un modelo base con preentrenamiento web, puede heredar sesgos de esos datos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos subyacentes deben verificarse en el repositorio original antes de un despliegue en produccion.
- Longitud de contexto no especificada: no se debe asumir una ventana larga sin verificarla en el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-NVFP4
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
