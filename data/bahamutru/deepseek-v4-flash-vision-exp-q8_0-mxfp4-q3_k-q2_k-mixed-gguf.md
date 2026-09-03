# BahamutRU/DeepSeek-V4-Flash-Vision-Exp-Q8_0-MXFP4-Q3_K-Q2_K-mixed-GGUF

## Resumen

BahamutRU/DeepSeek-V4-Flash-Vision-Exp-Q8_0-MXFP4-Q3_K-Q2_K-mixed-GGUF es una cuantizacion GGUF de esquema mixto sobre el modelo DeepSeek-V4-Flash-Vision-Exp, el primer modelo multimodal experimental de DeepSeek. El archivo combina cuantizaciones mxfp4, q3_K, q2_K y q8_0 de forma selectiva por zonas de capas, con el objetivo de preservar la precision en los componentes criticos de la arquitectura MoE (especialmente los tensores `ffn_down_exps`) y en las capas iniciales y finales, mientras aplica cuantizacion agresiva en el bloque central de capas, donde los errores se promedian a traves de la profundidad de la red.

El modelo base combina el backbone MoE de DeepSeek-V4-Flash con una torre de vision de 32 capas, una ventana de contexto de 1.000.000 de tokens y un modulo de draft DSpark fusionado para decodificacion especulativa. Con 284.334.567.511 parametros totales, esta cuantizacion busca que el conjunto completo (modelo mas proyector de vision) quepa en 16 GB de VRAM, segun el autor, usando parametros de ejecucion como `-c 262144 -b 2048 -ub 2048 --mmproj`. El repositorio se publico el 2 de septiembre de 2026 bajo licencia MIT y aun no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal con torre de vision de 32 capas y modulo de draft DSpark |
| Parametros totales | 284.334.567.511 (≈284B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Mixta: mxfp4, q3_K, q2_K, q8_0, bf16 (segun zona y tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal de la serie V4 de DeepSeek. Segun la documentacion de vLLM Recipes, combina el backbone MoE de V4-Flash con una torre de vision de 32 capas, una ventana de contexto de 1M tokens y un modulo de draft DSpark fusionado, que permite decodificacion especulativa integrada. No se dispone de datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La cuantizacion de BahamutRU divide el modelo en cinco zonas de capas (0-4, 5-9, 10-32, 33-37 y 38-42) y aplica un esquema de precision decreciente hacia el centro. Los tensores `ffn_down_exps` reciben mxfp4 en los bordes y q3_K en la zona media, mientras que `ffn_gate_exps` y `ffn_up_exps` se cuantizan a q3_K en las zonas intermedias y a q2_K en el bloque central. El autor justifica esta eleccion porque `down_exps` agrega la informacion de los expertos en la arquitectura MoE y su perdida de precision degrada notablemente la logica del modelo. Ademas, el archivo se basa en el cuantizador UD_Q8_K_XL de Unsloth, que segun sus creadores reproduce los pesos originales byte a byte; algunos tensores de atencion y de expertos compartidos se mantuvieron en bf16, lo que anade aproximadamente 2 GB al tamano final.

## Capacidades

- Generacion de texto y razonamiento multimodal: combina comprension de texto e imagen gracias a la torre de vision de 32 capas.
- Razonamiento y generacion de codigo: hereda las capacidades del backbone DeepSeek-V4-Flash, orientado a tareas de programacion y logica.
- Soporte de tool calling y uso conversacional: los tags del repositorio incluyen `endpoints_compatible` y `conversational`, lo que indica compatibilidad con APIs de chat y llamadas a herramientas.
- Capacidades de agente multimodal: segun la documentacion oficial de DeepSeek, el modelo base supone un salto importante frente a V4-Flash en benchmarks de agentes multimodales, acercandose al rendimiento de Opus-4.8.
- Contexto largo de 1M tokens: permite procesar documentos extensos, conversaciones multi-turno prolongadas y analisis de imagenes de alta resolucion con multiples regiones.
- Decodificacion especulativa integrada: el modulo DSpark fusionado acelera la generacion sin necesidad de un modelo draft externo.

## Casos de uso

- Analisis de documentos extensos con imagenes: con 1M tokens de contexto, el modelo puede procesar manuales tecnicos, informes anuales o expedientes completos que combinan texto y figuras, extrayendo informacion relevante en una sola pasada.
- Atencion al cliente multimodal: integrado en un backend compatible con endpoints, puede gestionar conversaciones multi-turno donde el usuario adjunta capturas de pantalla, fotografias de productos o documentos escaneados, y el modelo responde con instrucciones o diagnosticos.
- Generacion de codigo asistida por capturas: un desarrollador puede enviar una imagen de un error en pantalla o un diagrama de arquitectura, y el modelo sugiere fragmentos de codigo o correcciones basandose en el contexto visual y textual.
- Agentes de automatizacion de tareas: gracias al soporte de tool calling y al rendimiento en benchmarks de agentes multimodales, puede orquestar flujos que combinan lectura de imagenes, consulta a APIs externas y ejecucion de acciones en entornos controlados.
- Razonamiento sobre imagenes medicas o cientificas: en entornos de investigacion, puede describir y comparar imagenes de muestras, graficos experimentales o resultados de laboratorio, siempre con supervision humana dado el riesgo de alucinacion.
- Despliegue local en hardware limitado: al caber en 16 GB de VRAM con la configuracion indicada por el autor, permite ejecutar un modelo multimodal de 284B parametros en estaciones de trabajo con una unica GPU de gama alta, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF en la informacion disponible. La documentacion oficial de DeepSeek indica que el modelo base DeepSeek-V4-Flash-Vision-Exp logra un avance significativo frente a DeepSeek-V4-Flash en benchmarks de agentes multimodales, con un rendimiento cercano al de Opus-4.8, pero no se proporcionan cifras numericas concretas. No se dispone de datos de latencia ni throughput para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: 16 GB segun el autor, usando la configuracion `-c 262144 -b 2048 -ub 2048 --mmproj` con llama.cpp.
- Tamano del repositorio: 128 GB en disco, lo que requiere almacenamiento local amplio y suficiente RAM para cargar el archivo completo.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM, como RTX 4090, RTX 4080, A100 40GB o H100. El autor menciona compatibilidad con GPUs antiguas gracias al uso de cuantizaciones Q-estandar (q2_K, q3_K) que aceleran la inferencia en hardware sin soporte para formatos exoticos.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners basados en GGUF. Tambien puede servirse mediante vLLM si se convierte o se usa el modelo base en otro formato.
- Latencia y throughput: no disponibles. La decodificacion especulativa del modulo DSpark deberia reducir la latencia por token, pero no hay mediciones publicas de esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284B | 1M | Si | MIT | safetensors |
| DeepSeek-V4-Flash | no disponible | no disponible | No | MIT | safetensors |
| BahamutRU/DeepSeek-V4-Flash-Vision-Exp-Q8_0-MXFP4-Q3_K-Q2_K-mixed-GGUF | 284B | 1M | Si | MIT | GGUF |

La comparativa se limita a los modelos de la misma familia porque no se dispone de datos suficientes sobre alternativas de otros fabricantes con caracteristicas equivalentes (284B, multimodal, contexto 1M y licencia permisiva). La principal diferencia entre el modelo base y esta cuantizacion es el formato de pesos y el esquema de cuantizacion mixta, que reduce los requisitos de VRAM a costa de una posible perdida de fidelidad en las capas cuantizadas a q2_K.

## Limitaciones y advertencias

- Modelo experimental: DeepSeek-V4-Flash-Vision-Exp es una version de investigacion, no un lanzamiento estable, por lo que su comportamiento en produccion puede ser impredecible.
- Cuantizacion agresiva en la zona central: los tensores `ffn_gate_exps` y `ffn_up_exps` de las capas 10-32 se cuantizan a q2_K, lo que puede degradar la calidad del razonamiento en tareas complejas que dependan de esas capas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de vision donde la interpretacion de imagenes es subjetiva.
- Idiomas soportados no documentados: no se indica que idiomas cubre el modelo, aunque por su origen es probable que tenga buen soporte para chino e ingles; el castellano no esta confirmado.
- Sin datos de benchmarks propios: no hay evaluaciones publicas de esta cuantizacion, por lo que el rendimiento real frente a otras cuantizaciones o al modelo base es desconocido.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la publicacion, lo que indica falta de validacion por parte de la comunidad.
- Compatibilidad de herramientas: el autor menciona que algunos tensores se mantienen en bf16, lo que puede requerir versiones recientes de llama.cpp u otros runners para su correcta carga.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/BahamutRU/DeepSeek-V4-Flash-Vision-Exp-Q8_0-MXFP4-Q3_K-Q2_K-mixed-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek-V4-Flash en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Documentacion de vLLM Recipes: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Anuncio oficial de la API multimodal: https://api-docs.deepseek.com/news/news260821/
- Pagina de ZenMux con opciones de despliegue: https://zenmux.ai/deepseek/deepseek-v4-flash-vision-exp
