# RicardoEstep/RPBizkit-Gemma4-v2-26B-A4B-GGUF

## Resumen

RPBizkit-Gemma4-v2-26B-A4B-GGUF es una conversión a formato GGUF del modelo fusionado RPBizkit-Gemma4-v2-26B-A4B, publicado por el usuario RicardoEstep. Se trata de un merge de tipo MoE (mezcla de expertos) construido con herramientas de la familia mergekit sobre una base de la familia Gemma, con 25.233.142.046 parámetros totales según los safetensors del modelo original y aproximadamente 4.000 millones de parámetros activos por token, a juzgar por la nomenclatura "A4B" del identificador. El autor no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de fusión más allá de la etiqueta `ht-mergekit`.

La relevancia de esta ficha es limitada y conviene ser explícito: el modelo acumula cero descargas en el momento de la consulta, cuenta con un único "like" y no dispone de model card técnica, licencia declarada ni idiomas especificados. La única advertencia sustantiva del autor es que los modelos "Gemma 4 MoE" son sensibles a la cuantización, lo que en la práctica significa que las versiones GGUF de baja precisión pueden degradar de forma notable la calidad respecto al original en safetensors.

Esta conversión está pensada para su uso con llama.cpp o kobold.cpp, y el repositorio ocupa 69,5 GB, un tamaño coherente con múltiples niveles de cuantización de un modelo de 25B parámetros. Para cualquier evaluación en producción se recomienda partir del modelo base en safetensors y validar empíricamente la calidad de cada quant antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base de la familia Gemma; detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4B (inferido de la nomenclatura "A4B"; no confirmado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no listados en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (origen en safetensors) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos realizada con mergekit (etiqueta `ht-mergekit`) sobre una base Gemma, con una topología MoE que reparte 25,2B parámetros totales y activa aproximadamente 4B por token según la convención de nombres. No se ha publicado información sobre el número de expertos, el mecanismo de enrutamiento, la proporción de tokens activos ni la estrategia de fusión (SLERP, TIES, DARE u otras).

Tampoco hay datos sobre el entrenamiento: no se especifican tokens de preentrenamiento, composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Al ser un merge, el conocimiento procede de los modelos donantes, que el autor no identifica. La única nota técnica disponible es la advertencia de sensibilidad a la cuantización, habitual en arquitecturas MoE donde el enrutamiento puede desestabilizarse con precisión reducida.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la compatibilidad con endpoints sugieren uso en diálogo multi-turno.
- Razonamiento y conocimiento general: heredado de la base Gemma, sin evaluación publicada que lo confirme.
- Compatibilidad con llama.cpp y kobold.cpp para inferencia local en CPU y GPU.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Capacidades de tool calling, agentes, visión, audio o modo "thinking": no disponibles o no documentadas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo: con ~4B parámetros activos, un quant de 4 bits puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, lo que permite prototipar chatbots sin infraestructura cloud.
- Experimentación con arquitecturas MoE: útil para investigadores que quieran estudiar el comportamiento de un merge MoE de 25B frente a densos equivalentes, comparando latencia y calidad por quant.
- Pruebas de sensibilidad a cuantización: el propio autor advierte de este riesgo, de modo que el modelo sirve como caso de estudio para medir la degradación de calidad entre GGUF de distinta precisión y el original en safetensors.
- Despliegue en entornos con restricciones de red: al ser GGUF y funcionar con llama.cpp, puede ejecutarse completamente offline en equipos sin conectividad.
- Generación de texto creativo y conversacional sin requisitos de producción estrictos: adecuado para demos, prototipos y pruebas internas donde la licencia y la trazabilidad no sean bloqueantes.
- Integración en pipelines de evaluación comparativa: como miembro adicional de un banco de pruebas de modelos fusionados, para contrastar con merges densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 25,2B parámetros totales, un GGUF Q4 requiere en torno a 14-16 GB de VRAM; Q8 se aproxima a 26-28 GB; FP16 supera los 50 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y quant altos; RTX 4090 (24 GB) para Q4-Q5; RTX 3090/4080 (16-24 GB) para Q4.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090 y, con quant agresivo, en GPUs de 12-16 GB, aunque con posible degradación por la sensibilidad a cuantización advertida por el autor.
- Opciones de despliegue: llama.cpp, kobold.cpp, y servidores compatibles con GGUF (Ollama y llama-cpp-python como envoltorios habituales); vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles; al activar ~4B parámetros por token, la latencia debería ser inferior a la de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v2-26B-A4B-GGUF | 25,2B totales / ~4B activos | no disponible | no disponible | GGUF | Merge MoE no documentado, 0 descargas |
| Modelo base RPBizkit-Gemma4-v2-26B-A4B | 25,2B totales / ~4B activos | no disponible | no disponible | safetensors | Origen del GGUF, sin model card técnica |
| Gemma 2 27B (referencia de familia) | 27B densos | 8K | Gemma Terms | safetensors, GGUF | Denso, ampliamente evaluado, licencia con restricciones de uso |
| Mixtral 8x7B (referencia MoE) | 46,7B totales / 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE consolidado con benchmarks públicos |

La comparación con Gemma 2 27B y Mixtral 8x7B es orientativa por familia y arquitectura; no implica equivalencia de calidad, ya que este merge carece de evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, evaluación, sesgos ni idiomas, lo que impide auditar el modelo.
- Licencia no declarada: no puede asumirse uso comercial; la etiqueta `not-for-all-audiences` sugiere además contenido potencialmente inapropiado, lo que desaconseja su uso en aplicaciones orientadas al público general.
- Sensibilidad a la cuantización advertida por el propio autor: los GGUF pueden degradar la calidad y el enrutamiento MoE de forma significativa.
- Riesgo elevado de alucinación no medido: sin benchmarks ni evaluaciones, no hay evidencia de fiabilidad factual.
- Contexto e idiomas desconocidos: no es posible planificar despliegues multi-turno largos ni confirmar soporte de castellano.
- Procedencia de la fusión opaca: al no identificarse los modelos donantes, la trazabilidad legal y ética es nula.
- Adopción prácticamente nula (0 descargas, 1 like): sin comunidad que reporte fallos ni casos de uso validados.
- No apto para producción sin una evaluación previa exhaustiva contra el modelo base en safetensors.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v2-26B-A4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v2-26B-A4B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- KoboldCpp: https://github.com/LostRuins/koboldcpp
