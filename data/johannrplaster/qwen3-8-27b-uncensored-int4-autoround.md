# johannrplaster/Qwen3.8-27B-Uncensored-int4-AutoRound

## Resumen

El modelo `johannrplaster/Qwen3.8-27B-Uncensored-int4-AutoRound` es una cuantizacion INT4 (W4A16) de una variante "uncensored" (abliterada) del modelo Qwen3.8-27B, desarrollada por el usuario johannrplaster. Esta pensado para servir localmente con vLLM sobre GPUs Intel Arc Pro B70, aprovechando la aceleracion XPU. La principal innovacion es que conserva la cabeza MTP (multi-token prediction) cuantizada, lo que permite decodificacion especulativa sin necesidad de un modelo draft separado, y mantiene en FP16 las proyecciones de atencion lineal (`in_proj_a`/`in_proj_b`) para evitar degradacion en tareas de respuesta exacta.

El checkpoint pesa unos 18 GB en disco (7 shards) y se sirve directamente como GPTQ INT4 con vLLM. Segun los datos de safetensors, el numero real de parametros es 6.284.446.960, aunque el nombre comercial indica 27B; esta discrepancia no esta explicada en la documentacion. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El modelo es multimodal (image-text-to-text) segun el pipeline declarado, aunque la model card no detalla capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (variante Qwen3.8) con atencion lineal hibrida y cabeza MTP |
| Parametros totales | 6.284.446.960 (segun safetensors; el nombre comercial indica 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (soportado con FP8 KV cache; 8192 en configuracion recomendada) |
| Tipos de cuantizacion | INT4 (W4A16) con AutoRound, group_size 128, empaquetado `auto_round:auto_gptq`; proyecciones `in_proj_a/b` en FP16; LM head opcional en INT8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (7 shards), compatible con GPTQ/Marlin y vLLM XPU |

## Arquitectura y entrenamiento

El modelo base es una variante densa de 27B de la familia Qwen3.8, que combina atencion lineal (proyecciones `in_proj_a`/`in_proj_b`) con mecanismos transformer clasicos. La cuantizacion se realizo con AutoRound 0.14.2 en formato W4A16 simetrico con group_size 128, calibrando con batch_size 4 y gradient_accumulate_steps 2. Se cuantizaron todas las capas del decoder y la cabeza MTP, pero se mantuvieron en FP16/BF16 las proyecciones de atencion lineal, las normas, el `mtp.fc` y la torre de vision. Esta decision se justifica porque cuantizar esas proyecciones a INT4 degrada el comportamiento en tareas de respuesta exacta (evaluacion de codigo determinista, aritmetica). El modelo no ha pasado por un proceso de RLHF o DPO adicional; es una abliteracion (eliminacion de rechazos) del modelo original, seguida de cuantizacion.

La cabeza MTP preservada permite decodificacion especulativa nativa en vLLM mediante el metodo `qwen3_5_mtp`, aceptando entre 1 y 4 tokens especulativos. El checkpoint se sirve directamente como GPTQ INT4, con soporte para el kernel `XPUwNa16LinearKernel` en vLLM XPU.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con soporte de bloques de pensamiento (thinking) y tool-calling segun la convencion de Qwen3.8.
- Decodificacion especulativa integrada via cabeza MTP, sin necesidad de modelo draft externo.
- Capacidades multimodales declaradas (image-text-to-text), aunque no se detallan en la model card.
- Soporte de agentes y razonamiento multi-paso gracias al modo thinking y al contexto largo (hasta 128K con FP8 KV cache).
- Multilingue: no se especifican idiomas concretos, pero al ser una variante de Qwen3.8, se espera soporte amplio de lenguas principales.
- Modo "uncensored": el modelo ha sido abliterado para reducir rechazos y responder a prompts que los modelos con safety-tuning rechazarian.

## Casos de uso

- Servicio local de chat con contexto largo: con 128K de contexto (usando FP8 KV cache) y decodificacion especulativa, puede gestionar conversaciones multi-turno extensas o documentos largos en una sola pasada, adecuado para asistentes personales o soporte tecnico.
- Generacion de codigo en produccion: al ser una variante de Qwen3.8 (modelo orientado a codigo), puede integrarse en pipelines de CI/CD para autocompletado, revision de codigo o generacion de tests, con la ventaja de la cuantizacion INT4 para reducir costes de inferencia.
- Evaluacion determinista de codigo: gracias a las proyecciones FP16 preservadas, mantiene precision en tareas donde se requiere ejecutar y verificar codigo de forma exacta, como en entornos de evaluacion automatica.
- Razonamiento cientifico y matematico: el modo thinking permite desplegar cadenas de razonamiento largas, util en entornos de investigacion donde se necesitan explicaciones paso a paso.
- Prototipado rapido en entornos con GPUs Intel Arc: al estar optimizado para vLLM XPU, es una opcion viable para desarrolladores que usan hardware Intel (Arc Pro B70) sin necesidad de GPUs NVIDIA.
- Experimentacion con modelos "uncensored": para investigadores que estudian el comportamiento de modelos sin restricciones de seguridad, o para aplicaciones de escritura creativa sin filtros, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de rendimiento de decodificacion en hardware Intel Arc Pro B70, medidas con una metodologia de "cold response" (sin cache de prompt, una sola ejecucion por prompt):

| Configuracion de servicio | Decode (tok/s, mediana) |
|---|---|
| 2x B70 (TP2), MTP3, FP16 KV | 81.8 |
| 2x B70 (TP2), MTP3, FP16 KV, LM head INT8 experimental | 94.6 |
| 1x B70, MTP3, FP16 KV | 57.5 |
| 1x B70, MTP3, FP16 KV, LM head INT8 experimental | 66.8 |

La model card indica que benchmarks con prompts repetidos y cache caliente leen mucho mas alto (80+ en una sola tarjeta), pero esos numeros describen trafico repetido, no peticiones frescas. Tambien se menciona que las pruebas de calidad (aritmetica, evaluacion de codigo determinista, copia, factual, JSON-schema, needle long-context, estabilidad de repeticion) pasan todas, con canarios exactos identicos a la referencia con cabeza FP16.

## Requisitos de hardware

- VRAM estimada: el modelo en INT4 ocupa ~18 GB en disco; con FP16 KV y contexto moderado (8192) cabe en una GPU de 32 GB (Intel Arc Pro B70). Para contexto 128K se recomienda FP8 KV cache para ajustar en una sola tarjeta.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) en configuracion single o dual (tensor parallel 2). No se mencionan GPUs NVIDIA, pero al ser compatible con GPTQ/Marlin, podria funcionar en GPUs NVIDIA con vLLM estandar, aunque no esta verificado.
- En consumer GPU: no se indica compatibilidad explicita con GPUs de consumo (RTX 4090, etc.). Dado el tamano (~18 GB), una RTX 4090 (24 GB) podria alojarlo con cuantizacion INT4 y contexto limitado, pero no hay datos oficiales.
- Opciones de despliegue: vLLM con backend XPU (comando `vllm serve` con `--quantization gptq`), tambien compatible con Ollama o llama.cpp si se convierte a GGUF (aunque no se proporciona en este repo).
- Latencia y throughput: los valores de decodificacion medidos (57.5-94.6 tok/s) corresponden a peticiones frescas con cache deshabilitada; en trafico repetido el rendimiento es mayor. La latencia de TTFT no se reporta.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoria. Se podria comparar con el modelo base Qwen3.8-27B (sin cuantizar) o con otras cuantizaciones INT4 del mismo modelo (por ejemplo, las de unsloth en GGUF), pero no hay benchmarks publicados en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo "uncensored": responde a prompts que los modelos con safety-tuning rechazarian. El usuario es responsable del uso y debe revisar el contenido generado antes de utilizarlo en entornos reales.
- La cuantizacion INT4 introduce perdida de calidad respecto al original BF16; aunque se mitigaron las regresiones mas graves manteniendo ciertas proyecciones en FP16, las salidas no son bit-identicas y se han observado diferencias estilisticas (casing) en respuestas cortas.
- La discrepancia entre el nombre comercial (27B) y los parametros reales segun safetensors (6.28B) no esta explicada; esto puede afectar a la expectativa de rendimiento y a la planificacion de recursos.
- No se proporcionan datos de sesgos, alucinacion o limitaciones de idioma especificos; al ser una abliteracion, es probable que los sesgos del modelo base se mantengan o incluso se amplifiquen.
- El soporte de vision (image-text-to-text) esta declarado pero no documentado; no se garantiza su funcionamiento en la practica.
- La configuracion recomendada (8192 de contexto) es inferior a la capacidad maxima declarada (128K); usar contexto largo requiere FP8 KV cache y puede reducir el rendimiento de decodificacion.
- El rendimiento medido es especifico de hardware Intel Arc Pro B70 con vLLM XPU; en otras plataformas los resultados pueden variar significativamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/johannrplaster/Qwen3.8-27B-Uncensored-int4-AutoRound
- Repositorio GitHub del proyecto uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Instalador one-click para Qwen3.8-27B: https://github.com/qwen3-8-27b/qwen3-8-27b
- Pagina del modelo en Wiro AI: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
- Blog sobre abliteracion de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Busqueda de cuantizaciones de Qwen3.8-27B en HuggingFace: https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen3.8-27B
