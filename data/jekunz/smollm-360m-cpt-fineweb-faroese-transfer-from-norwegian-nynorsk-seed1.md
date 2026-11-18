# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1` es un modelo de lenguaje de 361.821.120 parametros derivado de SmolLM2-360M-Instruct mediante aprendizaje continuo (continued pre-training, CPT) sobre texto en noruego nynorsk y, posteriormente, en feroes. Lo publica el usuario `jekunz` en Hugging Face con licencia Apache 2.0 y esta orientado a investigacion sobre transferencia linguistica entre lenguas nordicas de bajos recursos.

El problema que aborda es la escasez de datos y modelos para el feroes (`fo`), una lengua hablada por unas 70.000 personas. La estrategia consiste en partir de un modelo ya adaptado al noruego nynorsk, una lengua germánica nordica occidental estrechamente emparentada, y transferir despues ese conocimiento al feroes con cinco epocas adicionales sobre el subconjunto feroes de FineWeb-2. El resultado se publica como una de tres semillas de entrenamiento de la misma configuracion.

Al ser un modelo de 360M parametros con contexto de 2048 tokens, su interes es metodologico y de bajo coste computacional: permite estudiar tecnicas de transferencia cross-lingue y servir como base para tareas de generacion de texto en feroes alli donde un modelo mayor no es viable. No dispone de evaluacion amplia publicada y su model card lo declara explicitamente como no evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizacion declarada; compatible con GGUF/AWQ via herramientas externas) |
| Idiomas soportados | feroes (`fo`); base entrenada tambien en noruego nynorsk e ingles (heredado de SmolLM2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama (el tag del repositorio lo confirma), heredada de SmolLM2-360M-Instruct, que a su vez emplea atencion causal estandar con RoPE y capas densas. No se declaran innovaciones como atencion lineal, decodificacion especulativa ni mezcla de expertos; se trata de un fine-tuning de pesos completos sobre un checkpoint existente.

El entrenamiento se realizo en dos fases: primero 1 epoca sobre el subconjunto noruego nynorsk de FineWeb-2, y despues 5 epocas sobre el subconjunto feroes del mismo dataset. Los hiperparametros declarados son learning rate 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8, acumulacion de gradiente de 32 pasos (batch efectivo de 256), longitud maxima de 2048 tokens y ejecucion en una unica GPU A100 de 40 GB. La semilla es 1, una de las tres semillas publicadas para esta misma configuracion. No se especifica el numero total de tokens procesados ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autoregresiva en feroes, heredando la capacidad conversacional de SmolLM2-360M-Instruct.
- Comprension y produccion de texto en noruego nynorsk como lengua intermediaria del entrenamiento.
- Capacidad residual en ingles y otros idiomas heredada del modelo base, aunque no garantizada tras el CPT.
- Formato conversacional (chat template de SmolLM2-Instruct), util para dialogos multi-turno.
- Razonamiento basico y respuesta a instrucciones a escala de 360M parametros.
- No se declara soporte verificado de tool calling, function calling, agentes ni modos de razonamiento extendido.
- Sin capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion en transferencia cross-lingue: sirve como punto de partida controlado (una de tres semillas) para medir el efecto de la inicializacion desde nynorsk frente a otras lenguas en el rendimiento final en feroes.
- Generacion de texto en feroes para corpus sinteticos: permite aumentar volumen de datos en `fo` para entrenar modelos mayores o sistemas de traduccion, con contexto de 2048 tokens.
- Prototipado de asistentes conversacionales en feroes: al conservar el formato instruct, puede montarse un chatbot de bajo coste en una GPU consumer para demos o pruebas de concepto.
- Normalizacion y reescritura de texto feroes: tareas de parafraseo, correccion ortografica o simplificacion sobre documentos cortos dentro de la ventana de 2048 tokens.
- Experimentos de olvido catastrofico: comparar con el modelo base para estudiar cuanto ingles y nynorsk se pierde tras 5 epocas en feroes, un caso de estudio util en publicaciones sobre CPT.
- Base para fine-tuning supervisado posterior: al ser Apache 2.0 y de 0,7 GB, puede afinarse en una sola GPU para tareas concretas (clasificacion, extraccion, resumen) en feroes con presupuesto minimo.
- Despliegue en entornos con recursos limitados: inferencia en CPU o GPU de gama baja gracias a los 360M parametros, util para servicios locales o educativos en comunidades feroesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8-1 GB para pesos, mas memoria de activaciones y cache KV; en la practica cabe en GPUs de 4 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 0,4-0,5 GB; en 4 bits, alrededor de 0,25-0,3 GB, aunque estas cuantizaciones no estan publicadas en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; tambien A100 o H100 para entrenamiento o lotes grandes de inferencia.
- Cabe en GPU consumer y en CPU: es viable en portatiles sin GPU dedicada mediante llama.cpp u Ollama si se generan pesos GGUF.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el tag `endpoints_compatible` lo sugiere), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en GPU y decenas de tokens por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Este modelo (smollm-360m CPT feroes) | 361.821.120 | 2048 | feroes, nynorsk (residual) | Apache 2.0 | no |
| HuggingFaceTB/SmolLM2-360M-Instruct | ~360M | 2048 (entrenamiento) | ingles y multilingue limitado | Apache 2.0 | si, en la model card original |
| jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk (modelo base) | ~360M | 2048 | nynorsk | Apache 2.0 | no disponible |
| Otros modelos de ~360M para lenguas nordicas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas especificas en feroes no esta disponible en la informacion proporcionada; los unicos puntos de referencia ciertos son el modelo base y el SmolLM2-360M-Instruct del que ambos derivan.

## Limitaciones y advertencias

- Modelo declarado por el autor como destinado a investigacion y sin evaluacion amplia; no debe asumirse calidad de produccion.
- Riesgo elevado de alucinacion y de degradacion gramatical, habitual en modelos de 360M tras CPT sobre corpus web de una lengua de bajos recursos.
- Posible olvido catastrofico del ingles y del nynorsk tras 5 epocas sobre feroes; el comportamiento multilingue no esta verificado.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Datos de entrenamiento provenientes de FineWeb-2 (corpus web), con posibles sesgos, ruido y contenido no filtrado.
- No se declaran salvaguardas de seguridad, filtros de contenido ni evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace recomendable validar el modelo en la tarea concreta antes de desplegarlo.
- El repositorio no incluye pesos cuantizados ni scripts de conversion; hay que generarlos para despliegues en llama.cpp u Ollama.
- Es una de tres semillas; los resultados pueden variar entre semillas y no se documenta la variabilidad observada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1
- Modelo base (nynorsk): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk
- Modelo origen SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Paper de FineWeb-2: https://arxiv.org/abs/2506.20920
