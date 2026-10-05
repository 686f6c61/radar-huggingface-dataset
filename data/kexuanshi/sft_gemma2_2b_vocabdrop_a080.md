# KexuanShi/sft_gemma2_2b_vocabdrop_a080

## Resumen

`sft_gemma2_2b_vocabdrop_a080` es un ajuste fino supervisado (SFT) publicado por el usuario KexuanShi en HuggingFace. El nombre del repositorio indica que parte de Gemma 2 2B, el modelo denso de 2,6 mil millones de parametros de la familia Gemma 2 de Google DeepMind, aunque la model card no declara explicitamente el modelo base (aparece como "None" en el campo correspondiente). El entrenamiento se ha realizado con la libreria TRL de HuggingFace en su flujo de SFT, y el checkpoint resultante tiene 2.614.341.888 parametros en formato safetensors.

El sufijo `vocabdrop_a080` sugiere una modificacion del vocabulario del tokenizador, presumiblemente una reduccion o "drop" del mismo con un factor asociado a `a080`. Sin embargo, el conteo de parametros coincide exactamente con el de Gemma 2 2B oficial (2.614.341.888), lo que apunta a que la supuesta reduccion de vocabulario no ha alterado el tamano del checkpoint o no se ha aplicado de forma efectiva. Esta discrepancia no se aclara en la informacion disponible.

Se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin model card descriptiva, sin licencia declarada y sin resultados de evaluacion. Es relevante unicamente como artefacto de investigacion reproducible (ajuste SFT de un modelo pequeno ejecutable en GPU de consumo), no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2). No confirmado en la model card; inferido del nombre del repositorio |
| Parametros totales | 2.614.341.888 (2,61 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. La familia Gemma 2 declara 8192 tokens |
| Tipos de cuantizacion | No disponible. Pesos publicados en safetensors (precision no declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el placeholder `licence: license` sin texto de licencia) |
| Formato de pesos | safetensors |
| Modelo base | No disponible (la model card indica "fine-tuned version of None") |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Tamano del repositorio | 5,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino supervisado de un modelo de la familia Gemma 2, concretamente la variante de 2B. Gemma 2 es una arquitectura transformer decoder-only que alterna capas de atencion local con ventana deslizante y capas de atencion global, utiliza atencion con soft-capping y normalizacion RMSNorm pre y post-atencion, y emplea Grouped-Query Attention. El vocabulario de la familia es de 256.000 tokens. Conviene subrayar que estos detalles corresponden a la arquitectura publica de Gemma 2 y no estan confirmados en la informacion proporcionada por el autor, que no documenta ninguna de estas caracteristicas.

En cuanto al entrenamiento, la unica informacion disponible es la declaracion de que se ha utilizado SFT mediante TRL, junto con las versiones de framework: TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, el uso de LoRA frente a ajuste completo, ni hiperparametros como tasa de aprendizaje, epocas o tamano de lote. El sufijo `vocabdrop_a080` apunta a una intervencion sobre el vocabulario, pero no hay documentacion tecnica que describa el procedimiento, su motivacion ni su efecto.

## Capacidades

- Generacion de texto conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con mensajes en formato de rol (`user`), lo que indica soporte del formato de chat conversacional.
- Ajuste por instrucciones: al haberse entrenado con SFT sobre un modelo instruction-tuned, se espera que responda a peticiones en lenguaje natural. El grado de alineacion no esta verificado.
- Razonamiento general y conocimiento: heredado de Gemma 2 2B. El SFT puede degradar capacidades previas si el dataset es estrecho.
- Codigo y matematicas: presumiblemente presente por herencia del modelo base, sin evaluacion publicada.
- Tool calling / function calling: no disponible. La model card no lo menciona y las etiquetas no lo indican.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. Gemma 2 oficial soporta principalmente ingles y tiene cobertura limitada de otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible. Gemma 2 2B es un modelo unicamente de texto.
- Compatibilidad de despliegue: las etiquetas incluyen `text-generation-inference`, `endpoints_compatible` y `transformers`, lo que indica que el checkpoint es cargable con las herramientas estandar de HuggingFace.

## Casos de uso

- Prototipado de asistentes conversacionales: al ser un modelo de 2,6 B ejecutable en una GPU de consumo, permite iterar rapidamente en el diseno de prompts y flujos de chat sin coste de infraestructura en la nube.
- Experimentacion academica sobre SFT: sirve como punto de partida reproducible para estudiar el efecto del ajuste supervisado y de la manipulacion de vocabulario (el sufijo `vocabdrop`) sobre un modelo de referencia bien conocido.
- Analisis del impacto de la reduccion de vocabulario: si el `vocabdrop` reduce el tamano del embedding, el modelo es un caso de estudio sobre como afecta dicha reduccion a la calidad de generacion y al rendimiento en inferencia.
- Generacion de texto offline en entornos con recursos limitados: con cuantizacion a 4 bits ocupa aproximadamente 1,6 GB, por lo que puede ejecutarse en portatiles con GPU modesta o incluso en CPU mediante llama.cpp tras conversion a GGUF.
- Filtrado y clasificacion de texto ligera: tareas de resumen corto, extraccion de entidades simples o reformulacion, donde la latencia importa mas que la precision punta.
- Base para nuevos ajustes especificos de dominio: al ser un modelo pequeno, el coste de un segundo ajuste fino (por ejemplo con LoRA) sobre un corpus concreto es bajo.
- Evaluacion comparativa de checkpoints SFT: util como uno de los brazos de comparacion frente al Gemma 2 2B original en estudios sobre olvido catastrofico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se ha encontrado evaluacion externa del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia, segun precision: bf16/fp16 aproximadamente 5,2-6 GB solo de pesos; int8 aproximadamente 2,8 GB; cuantizacion de 4 bits aproximadamente 1,6-2 GB. Hay que sumar la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio con lotes grandes; RTX 4090 24 GB para bf16 con contexto largo y lotes moderados; RTX 3090 24 GB como alternativa.
- Caben en GPU de consumo: si. En bf16 con contexto corto cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En cuantizacion de 4 bits cabe en GPUs de 6-8 GB y en equipos con memoria unificada.
- Opciones de despliegue: transformers (via `pipeline`), Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` lo indican), vLLM, SGLang, llama.cpp u Ollama previa conversion a GGUF, y HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sft_gemma2_2b_vocabdrop_a080` | 2,61 B | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sin documentar ni evaluar |
| Gemma 2 2B (Google) | 2,61 B | 8192 tokens | Gemma Terms of Use | Ampliamente disponible | Modelo base de referencia, con evaluaciones publicas |
| Qwen2.5 1.5B / 3B | 1,54 B / 3,09 B | 32.768 tokens | Apache 2.0 (segun variante) | Ampliamente disponible | Contexto mayor y licencia permisiva en varias variantes |
| Llama 3.2 1B / 3B Instruct | 1,24 B / 3,21 B | 131.072 tokens | Llama 3.2 Community License | Ampliamente disponible | Contexto muy superior; requiere aceptar la licencia |

La comparacion cuantitativa de rendimiento no es posible porque este checkpoint no publica resultados y no se ha identificado ninguna evaluacion independiente. Los datos de contexto de las alternativas corresponden a las fichas oficiales de sus respectivos autores.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada por TRL. No especifica dataset, hiperparametros, modelo base ni proposito.
- Licencia no declarada: el campo aparece como placeholder (`licence: license`). Sin licencia explicita, el uso comercial no esta autorizado de forma clara. Hay que contactar con el autor o tratar el modelo como no apto para produccion.
- Modelo base ambiguo: la card indica "fine-tuned version of None". El nombre sugiere Gemma 2 2B, pero no esta confirmado, lo que impide verificar la procedencia de los pesos y las condiciones de la licencia original de Gemma.
- Riesgo de alucinacion: elevado en un modelo de 2,6 B, especialmente si el SFT se ha realizado sobre un dataset estrecho o de baja calidad.
- Sesgos: no evaluados. Se heredan los sesgos del modelo base y los del dataset de SFT, que se desconoce.
- Posible olvido catastrofico: el ajuste SFT puede haber degradado capacidades del modelo original (codigo, matematicas, multilingue) sin que exista evaluacion que lo cuantifique.
- Ambiguedad del `vocabdrop`: el conteo de parametros coincide con el de Gemma 2 2B oficial, lo que sugiere que la reduccion de vocabulario no ha surtido efecto en el checkpoint o que se refiere a otra operacion. No hay informacion al respecto.
- Idiomas: no declarados. No debe asumirse un buen rendimiento en castellano.
- Adopcion nula: cero descargas y cero interacciones, sin validacion por parte de la comunidad. No hay garantia de que el checkpoint cargue o genere texto coherente.
- Fechas y versiones anomalas: la fecha de creacion (2026-10-05) y las versiones de framework declaradas (Transformers 5.17.0, PyTorch 2.13.0, TRL 1.13.0) son inusualmente altas y no permiten reproducir el entrenamiento con entornos estandar actuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_vocabdrop_a080
- Repositorio de TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl
- Documentacion de Gemma 2 (familia del modelo base presumible): https://ai.google.dev/gemma/docs

No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios asociados) en la busqueda web. Los resultados devueltos por el buscador no guardan ninguna relacion con este modelo ni con inteligencia artificial, por lo que se han descartado.
