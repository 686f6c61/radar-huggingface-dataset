# devendradhakad/autodroid-litert-community-Qwen2.5-1.5B-Instruct

## Resumen

Este repositorio, publicado por el usuario devendradhakad bajo el identificador `devendradhakad/autodroid-litert-community-Qwen2.5-1.5B-Instruct`, contiene una redistribucion de las variantes de `Qwen/Qwen2.5-1.5B-Instruct` preparadas para su despliegue en dispositivos mediante la pila LiteRT (antigua TFLite), la API MediaPipe LLM Inference y LiteRT-LM. La model card incluida en el repositorio reproduce literalmente la de `litert-community/Qwen2.5-1.5B-Instruct`, por lo que se trata de una copia de artefactos ya publicados por la comunidad LiteRT de Google, no de un ajuste fino ni de un entrenamiento nuevo.

El modelo resuelve un problema muy concreto: ejecutar un LLM conversacional de ~1,5 mil millones de parametros en movil (Android/iOS) o web sin depender de servidores externos, con pesos compilados en formato `.task` y cuantizacion `dynamic_int8` que reduce el tamano a 1598 MB y permite decodificaciones de 26-34 tokens/s en CPU de gama alta. Frente a los pesos originales en safetensors, aqui se ofrecen binarios ya optimizados para los backends CPU y GPU de LiteRT, con longitudes de contexto compiladas de 1280 y 4096 tokens.

La relevancia actual es la del despliegue en el borde: el interes no esta en la calidad del modelo base (un Qwen2.5-1.5B-Instruct ya conocido) sino en el empaquetado, las metricas de latencia/memoria en un Samsung S25 Ultra y la integracion directa con Edge Gallery, MediaPipe y LiteRT-LM. El repositorio tiene 0 descargas y 0 likes, sin resultados de evaluacion propios ni informacion adicional sobre el proceso de conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct: transformer decoder-only) |
| Parametros totales | no disponible (la denominacion del modelo base indica ~1,5 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 1280 y 4096 tokens en las variantes compiladas (segun los nombres de fichero `ekv1280` / `ekv4096`); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | fp32 (baseline) y dynamic_int8 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | `.task` (LiteRT-LM / MediaPipe LLM Inference); no se publican safetensors ni GGUF |
| Tamano del repositorio | 1,6 GB |
| Libreria | litert-lm |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Fecha de creacion / actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

No se aporta informacion sobre el entrenamiento en la model card de este repositorio: no hay datos sobre numero de tokens, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas del modelo base. Toda la documentacion disponible se centra en el proceso de conversion y despliegue, no en la construccion del modelo. La unica referencia arquitectonica es el `base_model`, `Qwen/Qwen2.5-1.5B-Instruct`, cuyos detalles tecnicos habria que consultar en su propia model card.

Lo que si se documenta es el pipeline de despliegue: los pesos se empaquetan como ficheros `.task` para la pila LiteRT, con variantes especificas por backend (CPU/GPU), esquema de cuantizacion y longitud de cache KV. Los ficheros enlazados en la model card siguen el patron `Qwen2.5-1.5B-Instruct_multi-prefill-seq_{f32|q8}_ekv{1280|4096}.task`, lo que indica soporte de multiples firmas de prefill (multi-prefill-seq) para acelerar la fase de prellenado y un cache KV fijado en compilacion a 1280 o 4096 posiciones.

## Capacidades

La informacion proporcionada no detalla capacidades especificas de esta conversion. Las capacidades declaradas se limitan a las etiquetas del repositorio:

- Generacion de texto (`pipeline_tag: text-generation`).
- Uso conversacional / chat (etiqueta `chat`).
- Ejecucion local en Android mediante LiteRT, la API MediaPipe LLM Inference y LiteRT-LM.
- Ejecucion en iOS a traves de los ejemplos de MediaPipe Samples.
- Ejecucion en web y en Colab (con la advertencia explicita de que el rendimiento en Colab puede ser mucho peor que en dispositivo local).
- Soporte de multiples firmas de prefill (multi-prefill-seq) para reducir el tiempo hasta el primer token.

No hay informacion en la model card sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues concretas, vision, audio ni modo de razonamiento explicito. Cualquier capacidad de este tipo seria la heredada del modelo base Qwen2.5-1.5B-Instruct, no documentada aqui.

## Casos de uso

- Asistentes conversacionales offline en movil: la variante `dynamic_int8` con contexto 1280 ocupa 1598 MB y decodifica a 34,25 tk/s en CPU de un Samsung S25 Ultra, lo que permite un chatbot funcional sin conexion y sin coste de inferencia en servidor.
- Funciones de resumen y reescritura dentro de una app Android nativa: integrable a traves de la API MediaPipe LLM Inference o del proyecto Edge Gallery, con el modelo empaquetado como `.task` dentro del APK o descargado en el primer arranque.
- Clasificacion y extraccion de informacion en el dispositivo: al ejecutarse localmente, los textos del usuario no salen del terminal, lo que encaja en escenarios con requisitos de privacidad (notas personales, mensajes, documentos locales).
- Autocompletado y asistencia de escritura en teclados o editores: la latencia de decodificacion (27-34 tk/s en GPU/CPU de gama alta) es suficiente para sugerencias cortas de una o dos frases.
- Prototipado rapido de aplicaciones de IA en el borde: el notebook de Colab enlazado permite familiarizarse con la pila LiteRT antes de compilar para Android o iOS.
- Asistente para tareas de soporte en quioscos o dispositivos industriales con Android: el contexto de 4096 tokens permite mantener historiales de conversacion mas largos, a costa de bajar a 26,06 tk/s en CPU.
- Demostraciones de inferencia en web: LiteRT soporta destinos web, lo que habilita demos de generacion de texto ejecutadas en el navegador del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se incluyen metricas de rendimiento de inferencia medidas en un Samsung S25 Ultra con multiples firmas de prefill habilitadas:

| Backend | Cuantizacion | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamano del modelo (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | fp32 (baseline) | 1280 | 49,50 | 10 | 21,25 | 6182 | 6254 | N/A |
| CPU | dynamic_int8 | 1280 | 297,58 | 34,25 | 3,71 | 1598 | 1997 | N/A |
| CPU | dynamic_int8 | 4096 | 162,72 | 26,06 | 6,57 | 1598 | 2216 | N/A |
| GPU | dynamic_int8 | 1280 | 1667,75 | 30,88 | 3,63 | 1598 | 1846 | 1505 |
| GPU | dynamic_int8 | 4096 | 933,45 | 27,30 | 4,77 | 1598 | truncado en la informacion disponible | truncado en la informacion disponible |

Observaciones derivadas de la tabla: la cuantizacion `dynamic_int8` reduce el tamano de 6182 MB a 1598 MB y multiplica por seis el prefill en CPU (49,50 a 297,58 tk/s) y por 3,4 la decodificacion (10 a 34,25 tk/s). El backend GPU acelera el prefill hasta 1667,75 tk/s a 1280 de contexto, pero la decodificacion queda ligeramente por debajo del CPU (30,88 frente a 34,25 tk/s) y consume 1505 MB de memoria de GPU.

## Requisitos de hardware

- El objetivo de despliegue declarado son dispositivos Android, iOS y web; la propia model card advierte que probar el sistema en Colab da un rendimiento en memoria y latencia mucho peor que en un dispositivo local.
- Variante fp32: 6182 MB de tamano de modelo y 6254 MB de RSS pico en CPU. No es viable en moviles de gama media; requiere hardware con al menos 8 GB de RAM disponible.
- Variante `dynamic_int8` a contexto 1280: 1598 MB de peso y 1997 MB de RSS pico en CPU; 1846 MB de RSS y 1505 MB de memoria GPU en el backend GPU.
- Variante `dynamic_int8` a contexto 4096: 1598 MB de peso y 2216 MB de RSS pico en CPU (el contexto adicional anade unos 219 MB de cache KV).
- El unico dispositivo con mediciones publicadas es un Samsung S25 Ultra; no hay datos para GPUs de escritorio (A100, H100, RTX 4090) ni para otros moviles.
- Opciones de despliegue documentadas: API MediaPipe LLM Inference, LiteRT-LM, LiteRT sobre Android/iOS/Web, la aplicacion Edge Gallery (APK y Google Play) y un notebook de Colab.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.task` no es compatible con esos servidores sin conversion previa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| devendradhakad/autodroid-litert-community-Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 1280 / 4096 (variantes compiladas) | `.task` (LiteRT) | apache-2.0 | Redistribucion sin descargas ni likes; sin benchmarks de calidad |
| litert-community/Qwen2.5-1.5B-Instruct | mismos pesos base | mismas variantes | `.task` (LiteRT) | apache-2.0 | Fuente original de la conversion y de la model card reproducida; incluye los enlaces a los ficheros |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 mil millones | no disponible en la informacion proporcionada | safetensors (Transformers) | no disponible en la informacion proporcionada | Modelo base original; no optimizado para movil |

No se dispone de datos de rendimiento comparativos entre estas alternativas mas alla de los benchmarks de inferencia en dispositivo del propio repositorio. La comparacion se limita por tanto a parametros, formato, licencia y procedencia.

## Limitaciones y advertencias

- Se trata de una redistribucion comunitaria: el autor no documenta ningun ajuste fino, evaluacion ni cambio respecto a los artefactos originales de `litert-community`. El repositorio presenta 0 descargas y 0 likes.
- La model card es una copia de la de `litert-community`; el titulo interno sigue refiriendose a `litert-community/Qwen2.5-1.5B-Instruct`, lo que puede inducir a confusion sobre quien mantiene realmente el modelo.
- La model card esta truncada en la informacion disponible: la ultima fila de la tabla de rendimiento (GPU, dynamic_int8, contexto 4096, RSS pico y memoria GPU) aparece incompleta.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni comportamiento en dominios concretos. Al ser una conversion del Qwen2.5-1.5B-Instruct original, hereda las limitaciones de este, que no se detallan aqui.
- La ventana de contexto efectiva esta fijada en compilacion (1280 o 4096 tokens segun la variante). Conversaciones mas largas requeriran truncado o gestion externa del historial.
- Todas las metricas de rendimiento proceden de un unico dispositivo (Samsung S25 Ultra) y no son extrapolables a otros moviles, sistemas operativos o condiciones termicas.
- Licencia apache-2.0, que permite uso comercial y redistribucion, pero conviene verificar las condiciones del modelo base Qwen2.5 antes de un despliegue en produccion.
- El rendimiento en Colab es explicitamente peor que en dispositivo; no debe usarse como referencia para planificar latencias de produccion.
- La pila LiteRT/MediaPipe esta optimizada para Android/iOS/Web; no hay soporte documentado para inferencia en servidor con GPUs de datacenter.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-Qwen2.5-1.5B-Instruct
- Repositorio original de la conversion: https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- API MediaPipe LLM Inference: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct/blob/main/notebook.ipynb
- Aplicacion Edge Gallery (GitHub): https://github.com/google-ai-edge/gallery
- Aplicacion Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Ejemplos de MediaPipe para iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/ios/README.md

Nota: los resultados de la busqueda web realizada no aportaron informacion relevante sobre este modelo (devolvieron unicamente paginas corporativas de Microsoft), por lo que no se han incluido.
