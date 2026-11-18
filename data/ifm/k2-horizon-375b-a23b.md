# IFM/K2-Horizon-375B-A23B

## Resumen

K2-Horizon-375B-A23B es el modelo insignia de la familia K2-Horizon, desarrollado por IFM. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) dispersa que almacena 375.000 millones de parametros totales y activa aproximadamente 23.000 millones por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Su ventana de contexto nativa alcanza los 524.288 tokens (512K), mantenida desde las etapas de midtraining.

El modelo esta disenado especificamente para cargas de trabajo agenticas: uso de herramientas, operacion en terminal y flujos de trabajo de horizonte largo (long-horizon). Segun el autor, iguala o supera a modelos MoE de pesos abiertos hasta 2,6 veces mas grandes y resulta competitivo con modelos frontera cerrados en estos benchmarks. Se distribuye con pesos abiertos bajo licencia Apache 2.0, junto con los datos de entrenamiento, la receta y el codigo de entrenamiento.

La relevancia actual del modelo reside en su caracter completamente abierto (checkpoints, datos y codigo) y en la publicacion de checkpoints intermedios, que permiten estudiar la evolucion de capacidades a lo largo del entrenamiento en lugar de evaluar un unico punto final. El repositorio ocupa aproximadamente 51,5 TB, lo que refleja la inclusion de multiples checkpoints ademas de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dispersa, transformer; clase `k2_horizon` con `custom_code` |
| Parametros totales | 379.167.159.168 (379,2 B) |
| Parametros activos | ~23 B por token |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts dispersas: el modelo contiene 379,2 mil millones de parametros almacenados pero solo activa aproximadamente 23 mil millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La longitud de contexto nativa de 524.288 tokens se establece desde las etapas de midtraining, no como una extension posterior mediante tecnicas de interpolacion posicional. El modelo requiere codigo personalizado (`custom_code`, clase `k2_horizon`) para cargarse con transformers.

El entrenamiento se realizo en al menos dos fases documentadas mediante datasets publicos: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. El autor publica tanto los datos como la receta y el codigo de entrenamiento (repositorio `ifm-ai/xllm`), ademas del codigo de evaluacion (`ifm-ai/Eval360`). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado `text-generation`.
- Razonamiento agentico y uso de herramientas (tool calling): el autor destaca rendimiento frontera en benchmarks de uso de herramientas, terminal y flujos de trabajo de horizonte largo.
- Operacion en terminal y ejecucion de tareas multi-paso de larga duracion (long-horizon workflows).
- Procesamiento de contexto muy largo: hasta 524.288 tokens, adecuado para documentos extensos, repositorios de codigo o historiales de agente prolongados.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Agentes autonomos de terminal: el modelo puede ejecutar secuencias largas de comandos, interpretar salidas y corregir errores en tareas de administracion de sistemas o automatizacion de desarrollo, gracias a su entrenamiento especifico en benchmarks de terminal y su contexto de 512K tokens para mantener el historial completo de la sesion.
- Orquestacion de herramientas en pipelines de datos: con soporte de tool calling, puede encadenar llamadas a APIs, consultas a bases de datos y transformaciones en flujos multi-paso, manteniendo el estado intermedio dentro de la ventana de contexto.
- Analisis de repositorios de codigo completos: la ventana de 524.288 tokens permite cargar varios ficheros de un proyecto en una sola pasada para revision de codigo, deteccion de dependencias cruzadas o generacion de documentacion tecnica.
- Asistentes conversacionales de dominio con historial prolongado: conversaciones multi-turno de atencion al cliente o soporte tecnico donde el contexto acumulado es grande y no conviene truncar, aprovechando la ventana extendida sin tecnicas de resumen intermedio.
- Investigacion sobre dinamica de entrenamiento: la publicacion de checkpoints intermedios permite estudiar como emergen capacidades agenticas a lo largo del entrenamiento, comparando puntos de control con el codigo de evaluacion Eval360.
- Reproduccion y ajuste fino de recetas de entrenamiento: al liberarse datos, receta y codigo (`xllm`), equipos de investigacion pueden replicar el pipeline o adaptarlo a dominios propios partiendo de los checkpoints publicados.
- Automatizacion de tareas de CI/CD con razonamiento multi-paso: integrado como agente que interpreta fallos de build, consulta logs extensos y propone parches, apoyandose en el contexto largo para retener el estado completo de la ejecucion.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con alternativas de pesos abiertos (Nemotron 3 Ultra, Inkling en modo xhigh, MiniMax-M3, GLM 5.2 en modo max) y modelos cerrados (GPT 5.6 Luna max, GPT 5.6 Terra high, Claude Sonnet5 max). La informacion disponible incluye la tabla de parametros y activaciones, pero los valores numericos de las metricas por benchmark no estan recogidos en el texto proporcionado.

| Modelo | Parametros | Activos |
|---|---|---|
| K2-Horizon-375B-A23B | 375 B | 23 B |
| Nemotron 3 Ultra | 550 B | no disponible |
| Inkling (xhigh) | 975 B | no disponible |
| MiniMax-M3 | 428 B | no disponible |
| GLM 5.2 (max) | 753 B | no disponible |
| GPT 5.6 Luna (max) | no disponible | no disponible |
| GPT 5.6 Terra (high) | no disponible | no disponible |
| Claude Sonnet5 (max) | no disponible | no disponible |

No se han publicado en la informacion disponible los valores numericos de los benchmarks (MMLU, HumanEval, GSM8K u otros); la model card los presenta unicamente en una imagen (`assets/k2-horizon-375b-a23b-benchmarks.png`) cuyo contenido no se ha facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: los 379,2 B de parametros en precision BF16/FP16 requieren aproximadamente 758 GB solo para pesos, mas cache KV para 524.288 tokens de contexto, que puede ser considerable. En FP8 el peso baja a unos 379 GB; en cuantizaciones de 4 bits, a unos 190 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para BF16 se necesitan multiples aceleradores de 80 GB (H100, A100 80GB, H200) en configuracion tensor-parallel; no es viable en una sola GPU de 80 GB sin cuantizacion agresiva.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo habituales sin cuantizacion extrema y offloading, lo que degradaria severamente el rendimiento.
- Opciones de despliegue: la libreria declarada es transformers con `custom_code`, por lo que requiere `trust_remote_code=True`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible; la integracion en estos motores dependeria de la implementacion de la clase `k2_horizon`.
- Latencia y throughput estimados: no disponibles. Los 23 B de parametros activos por token sitúan el coste computacional por token en el orden de un modelo denso de ~23 B, aunque el coste de memoria viene determinado por los 379,2 B totales.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-375B-A23B | 375 B | 23 B | 512K | Apache 2.0 | Pesos abiertos, datos y codigo |
| Nemotron 3 Ultra | 550 B | no disponible | no disponible | no disponible | Pesos abiertos (segun comparativa del autor) |
| MiniMax-M3 | 428 B | no disponible | no disponible | no disponible | Pesos abiertos (segun comparativa del autor) |
| GLM 5.2 (max) | 753 B | no disponible | no disponible | no disponible | Pesos abiertos (segun comparativa del autor) |
| GPT 5.6 Luna / Terra | no disponible | no disponible | no disponible | Propietaria | Solo API |
| Claude Sonnet5 | no disponible | no disponible | no disponible | Propietaria | Solo API |

La comparativa se limita a los datos de parametros y a la clasificacion abierto/cerrado que aparecen en la tabla del autor; no se dispone de cifras de rendimiento por benchmark ni de contexto de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual ni tasas de alucinacion; como todo modelo generativo, requiere verificacion en produccion.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre el proceso de filtrado del dataset de preentrenamiento y midtraining.
- Contexto: aunque la ventana es de 524.288 tokens, no se documenta el rendimiento efectivo (recuperacion de informacion) en longitudes cercanas al limite.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere codigo personalizado (`custom_code`); conviene auditar dicho codigo antes de desplegarlo en entornos de produccion.
- Despliegue: el tamano del repositorio (~51,5 TB) y de los pesos dificulta la descarga y el almacenamiento; el soporte en motores de inferencia de alto rendimiento no esta confirmado.
- Datos de evaluacion: los resultados de benchmarks solo estan disponibles como imagen en la model card; no se han podido verificar cifras concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Codigo de entrenamiento: https://github.com/ifm-ai/xllm
- Codigo de evaluacion: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
