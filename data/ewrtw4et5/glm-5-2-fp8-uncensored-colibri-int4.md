# ewrtw4et5/GLM-5.2-FP8-Uncensored-Colibri-Int4

## Resumen

GLM-5.2-FP8-Uncensored-Colibri-Int4 es una conversion a int4, compatible con el motor de inferencia Colibri, del modelo zandenAI/GLM-5.2-FP8-Uncensored. El autor de la conversion es el usuario ewrtw4et5 y no guarda relacion oficial con Z.ai, NVIDIA ni Hugging Face. El modelo pertenece a la familia GLM-5.2, con arquitectura MoE (mixture of experts) y mecanismo DSA (Deep Sparse Attention), segun indican los tags `glm_moe_dsa` y `glm-5.2`.

El objetivo de esta publicacion no es ofrecer un checkpoint generico, sino un formato especifico para el motor JustVugg/colibri: un motor de inferencia en C que mantiene la parte densa del modelo en RAM y hace streaming de los expertos enrutados desde almacenamiento local. Por tanto, esta pensada para entornos con mucha capacidad de disco y poca VRAM, no para pipelines estandar de Transformers, vLLM, SGLang, AWQ o GGUF.

La relevancia es limitada y muy nicho: es una conversion independiente, con cero descargas y cero likes en el momento de la consulta, y sin model card detallada sobre datos de entrenamiento, benchmarks o idiomas. Su interes practico depende de que el usuario ya utilice el motor Colibri y necesite una variante int4 de un modelo GLM-5.2 sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con DSA (Deep Sparse Attention), segun tags `glm_moe_dsa` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 row-wise en expertos enrutados y lineales; int8 en embeddings, LM head, indexer DSA y cabeza MTP; FP32 en normas y pesos de routing |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con contenedor y layout propietario de Colibri (`out-*.safetensors`, `out-idx-*.safetensors`, `out-mtp-*.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un GLM-5.2 con arquitectura MoE y DSA (Deep Sparse Attention), e incluye una cabeza MTP (Multi-Token Prediction) para decodificacion especulativa y un indexer DSA con pesos separados. No se especifican el numero total de parametros, el numero de parametros activos por token, la longitud de contexto nativa ni la composicion del dataset de entrenamiento.

El proceso de esta publicacion es una conversion de cuantizacion: los tensores FP8 del checkpoint zandenAI/GLM-5.2-FP8-Uncensored se descomprimen y se recuantizan al formato int4 de Colibri. Los pesos de expertos y lineales usan int4 por filas; embeddings, LM head, indexer y MTP usan int8; normas y routing se mantienen en FP32. No se documenta RLHF, DPO ni otros detalles de alineamiento en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline `text-generation`.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la model card, pero plausible por la familia GLM-5.2; no disponible como dato verificado.
- Decodificacion especulativa mediante cabeza MTP incluida en el repositorio (`out-mtp-*.safetensors`).
- Soporte de atencion dispersa DSA mediante indexer dedicado (`out-idx-*.safetensors`).
- Variante "uncensored": el nombre indica ausencia de filtros de rechazo, aunque no se documenta el alcance exacto.
- Tool calling, function calling y comportamiento agente: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Despliegue en entornos con poca VRAM y mucho disco: el motor Colibri mantiene la parte densa en RAM y hace streaming de expertos desde disco, lo que permite servir un modelo MoE grande en hardware modesto a costa de I/O.
- Experimentacion con modelos sin censura: util para investigadores que estudian comportamiento de modelos sin rechazos en tareas de red teaming o evaluacion de seguridad, asumiendo los riesgos asociados.
- Inferencia local en estaciones de trabajo con NVMe rapido: el repositorio pesa 384 GB, por lo que requiere almacenamiento local de alta velocidad para que el streaming de expertos no degrade la latencia.
- Pruebas de decodificacion especulativa: la inclusion de la cabeza MTP permite evaluar tecnicas de aceleracion en el motor Colibri.
- Investigacion sobre atencion dispersa: el indexer DSA separado facilita estudiar el comportamiento de la atencion esparsa en modelos MoE.
- Benchmarking de motores de inferencia alternativos: sirve como caso de prueba para comparar Colibri frente a vLLM o llama.cpp, aunque estos ultimos no pueden cargar este formato directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El modelo usa int4 en expertos e int8 en embeddings y LM head, pero el diseno de Colibri asume que los expertos se transmiten desde disco, no que residan en VRAM.
- Almacenamiento: el repositorio ocupa 384 GB, por lo que se necesita espacio local equivalente o superior, preferiblemente en NVMe para reducir latencia de streaming.
- RAM: debe alojar la parte densa del modelo; el tamano exacto no esta documentado.
- GPU recomendadas: no disponible. El motor Colibri esta escrito en C y prioriza CPU/RAM/disco; no se especifican GPUs soportadas.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: exclusivamente el motor Colibri (JustVugg/colibri). No es compatible con Transformers, vLLM, SGLang, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.2-FP8-Uncensored-Colibri-Int4 | no disponible | no disponible | int4/int8/FP32 mixto | MIT | Colibri safetensors |
| zandenAI/GLM-5.2-FP8-Uncensored (origen) | no disponible | no disponible | FP8 | MIT (segun conversion) | safetensors estandar |
| jlnsrk/GLM-5.2-colibri-int4 (base de la conversion) | no disponible | no disponible | int4 Colibri | no disponible | Colibri safetensors |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Formato no estandar: no se puede cargar con `AutoModelForCausalLM.from_pretrained()`, vLLM, SGLang, llama.cpp ni Ollama. Solo funciona con el motor Colibri.
- Repositorio de 384 GB: requiere almacenamiento local amplio y rapido; el streaming de expertos desde disco puede dominar la latencia.
- Conversion no oficial: realizada por un tercero (ewrtw4et5) sin afiliacion con Z.ai, NVIDIA ni Hugging Face; no hay garantia de fidelidad respecto al modelo original.
- Variante "uncensored": puede generar contenido danino, ofensivo o ilegal sin filtros; requiere supervision y politicas de uso claras en cualquier despliegue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje.
- Idiomas y contexto: no documentados.
- Sesgos: no documentados.
- Licencia MIT declarada por el autor, pero conviene revisar los terminos del modelo origen (zandenAI/GLM-5.2-FP8-Uncensored) y del modelo base de la conversion (jlnsrk/GLM-5.2-colibri-int4).
- Cero descargas y cero likes: sin evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ewrtw4et5/GLM-5.2-FP8-Uncensored-Colibri-Int4
- Modelo origen: https://huggingface.co/zandenAI/GLM-5.2-FP8-Uncensored
- Modelo base de la conversion: https://huggingface.co/jlnsrk/GLM-5.2-colibri-int4
- Motor Colibri: https://github.com/JustVugg/colibri
