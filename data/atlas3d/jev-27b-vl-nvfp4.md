# Atlas3D/JEV-27B-VL-NVFP4

## Resumen

Atlas3D/JEV-27B-VL-NVFP4 es un checkpoint cuantizado en NVFP4 (W4A4, formato compressed-tensors) del modelo multimodal autotrust/JEV-27B-VL, publicado por Atlas3D. Se trata de una versión modificada del modelo de decisión JEV-27B de AutoTrust AI, un modelo Apache-2.0 orientado a tomar decisiones estructuradas dentro de flujos de agentes, manteniendo a la vez la ruta de generación y razonamiento del modelo subyacente. El modelo base, a su vez, deriva de Qwen/Qwen3.8-27B segun la propia model card.

El checkpoint mantiene 27.781.427.952 parametros (unos 27,8B) y ocupa unos 28-29 GB en disco. La cuantizacion solo afecta a las capas Linear de los bloques de atencion completa y los MLP del modelo de lenguaje; el vision tower, los bloques de atencion lineal, los embeddings, `lm_head`, el modulo MTP y el adaptador de decision JEV System 1 se mantienen en bf16. Por ese motivo los pesos no se reducen a una cuarta parte del original, sino que se quedan en torno a 28 GB.

Su relevancia es doble. Por un lado, es un ejemplo practico de cuantizacion NVFP4 en 4 bits con llm-compressor, pensada para exprimir los tensor cores FP4 de las GPU NVIDIA Blackwell. Por otro, documenta de forma transparente la perdida de precision asociada: en la prueba de decision System 1, su eleccion principal coincide con el modelo bf16 en el 90,5% de los casos (266 de 294), frente al 97,1% del FP8 y el 99,0% del GGUF Q8_0. Es, por tanto, una opcion de compromiso entre VRAM y fidelidad de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal hibrido: bloques de atencion completa, bloques de atencion lineal y vision tower; incluye modulo MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, compressed-tensors) en este repo; el proyecto publica ademas FP8 y GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); repo de 29,0 GB |
| Cuantizacion aplicada | Capas Linear de bloques de atencion completa y MLP del LLM |
| Elementos en bf16 | Vision tower, bloques de atencion lineal, embeddings, `lm_head`, MTP y adaptador JEV System 1 (`adapter_vllm/`) |
| Calibracion | 384 muestras de 2048 tokens, generadas con llm-compressor |
| Hardware requerido | GPU NVIDIA Blackwell con tensor cores FP4 |
| Modelo base | autotrust/JEV-27B-VL (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura multimodal hibrida que combina atencion completa con atencion lineal, un vision tower para entrada de imagen y un modulo MTP. Incluye ademas un adaptador especifico, denominado JEV System 1, que se sirve mediante el endpoint `/v1/decide` y que actua como cabeza de decision sobre estados estructurados. Sobre el mismo modelo convive la ruta de generacion libre, referida como System 2 en la model card.

El proceso de cuantizacion se realizo con llm-compressor en formato compressed-tensors, usando 384 muestras de calibracion de 2048 tokens cada una. Solo se cuantizaron las capas Linear de los bloques de atencion completa y de los MLP; el resto de componentes se dejo en bf16, incluido el adaptador de decision, que se incluye inalterado. No se detallan en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento estructurado orientado a decision: el adaptador JEV System 1 expone el endpoint `/v1/decide`.
- Vision: procesamiento de imagenes mediante el vision tower, que se mantiene en bf16.
- Prediccion multi-token mediante el modulo MTP.
- Generacion de texto libre y razonamiento (System 2), aunque su calidad no se ha evaluado de forma separada en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: el modelo base se describe como pensado para decisiones frecuentes dentro de flujos de agentes, pero no se detallan capacidades concretas de orquestacion.
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Decisiones estructuradas en agentes autonomos: el adaptador System 1 permite resolver elecciones entre opciones discretas mediante `/v1/decide`, con latencias de unos 1130 ms por tick de 24 decisiones en una RTX PRO 6000, lo que encaja en bucles de agente con muchas decisiones repetidas.
- Enrutamiento y clasificacion de intenciones: al devolver probabilidades por opcion, puede usarse como capa de decision previa a la generacion libre, reduciendo el coste frente a invocar un modelo generativo completo para cada eleccion.
- Analisis de imagenes con salida textual: al conservar el vision tower en bf16, mantiene la capacidad de describir o interpretar imagenes en aplicaciones de documentacion, catalogacion o asistencia visual.
- Asistentes conversacionales autoalojados: al ser Apache-2.0 y ejecutable con vLLM, se puede desplegar en infraestructura propia sin dependencia de API externa, siempre que se disponga de GPU Blackwell.
- Evaluacion comparativa de cuantizacion: sirve como banco de pruebas para medir la degradacion NVFP4 frente a FP8 y Q8_0 en tareas de decision, con un delta de precision documentado del 90,5% frente al 97,1% y 99,0%.
- Procesamiento por lotes en produccion con vLLM: la integracion nativa con `--quantization compressed-tensors` y FlashInfer permite servir el modelo con batching continuo en un clúster Blackwell.
- Prototipado de agentes con memoria de decision: la combinacion de MTP y cabeza de decision facilita iterar sobre politicas de seleccion sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico conjunto de resultados facilitado corresponde a la prueba de decision System 1 (`/v1/decide`), con los mismos estados y arnes que el modelo bf16, comparando una decision a la vez:

| Metrica | NVFP4 (este) | FP8 | bf16 |
|---|---|---|---|
| Eleccion principal coincide con bf16 | 90,5% (266/294) | 97,1% | referencia |
| Mayor cambio de probabilidad en cualquier opcion | 0,164 | 0,061 | ninguno |
| Escenarios de cordura superados | 6/6 | 6/6 | 6/6 |
| VRAM en uso, RTX PRO 6000 | 37,6 GB | 42,6 GB | ~78 GB |
| Tick de 24 decisiones, p50 | 1130 ms | 1152 ms | 1253 ms |

La propia model card advierte que se trata de una prueba limitada de la cabeza de decision y que la calidad del System 2 (generacion de texto libre) no se ha evaluado por separado.

## Requisitos de hardware

- VRAM estimada: unos 37,6 GB en uso medidos en una RTX PRO 6000 para este checkpoint NVFP4, frente a 42,6 GB del FP8 y unos 78 GB del bf16.
- GPU compatibles: cualquier GPU NVIDIA Blackwell con tensor cores FP4. Es un requisito estricto; las generaciones anteriores (A100, H100, RTX 4090) no soportan FP4 de forma nativa.
- Consumer GPU: la RTX 5090 dispone de arquitectura Blackwell, pero sus 32 GB de VRAM quedan por debajo de los 37,6 GB medidos, por lo que el ajuste es ajustado o inviable segun la configuracion y el contexto. No hay datos confirmados de ejecucion en esta GPU.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors`, apoyandose en FlashInfer para los kernels FP4 (que se compilan en el primer uso, por lo que hay que definir `CUDA_HOME` apuntando al toolkit de CUDA). El repositorio incluye `serve_decide.py`.
- Latencia y throughput: en el tick de 24 decisiones el percentil 50 es de 1130 ms, ligeramente por debajo del FP8 (1152 ms) y del bf16 (1253 ms). No hay datos de throughput de generacion libre.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Coincidencia con bf16 (decision) | VRAM en uso (RTX PRO 6000) | Licencia |
|---|---|---|---|---|---|
| Atlas3D/JEV-27B-VL-NVFP4 | 27,8B | NVFP4 (W4A4) | 90,5% | 37,6 GB | Apache-2.0 |
| Atlas3D/JEV-27B-VL-FP8 | 27,8B (base) | FP8 | 97,1% | 42,6 GB | Apache-2.0 |
| Atlas3D/JEV-27B-VL-GGUF (Q8_0) | 27,8B (base) | GGUF Q8_0 | 99,0% | no disponible | Apache-2.0 |
| autotrust/JEV-27B-VL (bf16) | 27,8B | sin cuantizar | referencia | ~78 GB | Apache-2.0 |

El antecesor directo es autotrust/JEV-27B-VL, del que este checkpoint es una version cuantizada. El proyecto publica ademas una variante FP8 y paquetes GGUF. La model card menciona Qwen/Qwen3.8-27B como base del modelo original, aunque no se aportan datos comparativos de rendimiento frente a el.

## Limitaciones y advertencias

- Perdida de precision documentada: la eleccion principal coincide con bf16 en el 90,5% de los casos, frente al 97,1% del FP8 y el 99,0% del Q8_0. La model card recomienda explicitamente usar FP8 o GGUF Q8_0 para casos sensibles a la precision.
- Cambio maximo de probabilidad de 0,164 en alguna opcion, muy superior al 0,061 del FP8, lo que puede alterar umbrales de decision en produccion.
- La evaluacion cubre unicamente la cabeza de decision System 1; la calidad de la generacion de texto libre (System 2) no ha sido evaluada de forma independiente y podria degradarse de forma no medida.
- Requisito de hardware estricto: solo GPU NVIDIA Blackwell con tensor cores FP4. Esto excluye buena parte del parque instalado (A100, H100, RTX 4090) y limita el autoalojamiento.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible de forma especifica; aplica el riesgo habitual de los modelos generativos.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo es una version modificada de autotrust/JEV-27B-VL y conserva el fichero `LICENSE` sin cambios; conviene verificar las condiciones del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, subido el 2 de octubre de 2026: es un artefacto muy reciente y con poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atlas3D/JEV-27B-VL-NVFP4
- Variante FP8: https://huggingface.co/Atlas3D/JEV-27B-VL-FP8
- Variante GGUF: https://huggingface.co/Atlas3D/JEV-27B-VL-GGUF
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo derivado de la comunidad: https://huggingface.co/denis-pplx/autojev-27b
- Nota de prensa de AutoTrust AI: https://www.prnewswire.com/news-releases/autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents-302891720.html
- Cobertura de la nota de prensa: https://ohsem.me/2026/09/autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents/
- Sitio de Atlas3D: https://atlas3d.space/
