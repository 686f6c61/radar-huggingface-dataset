# LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v17

## Resumen

Qwen3.8-27B-Coder390-FP8-DFlash2-v17 es un paquete de inferencia publicado por LTM-Lab sobre el modelo Coder390 de 27B parametros en precision FP8, orientado a generacion de codigo y con capacidades de vision. No se distribuye como pesos convencionales en safetensors o GGUF, sino como un artefacto `.ninfer` de 30,3 GB que empaqueta los pesos FP8 del modelo de texto, la torre de vision, la cabeza MTP (multi-token prediction) y el componente de decodificacion especulativa DFlash2. La libreria de ejecucion es `ninfer`, un runtime C++/CUDA sin interprete de Python.

La novedad de esta version (v17) es la incorporacion de una memoria episodica nativa denominada V17. Este componente registra eventos observados, reutiliza secuencias de relaciones ya verificadas y estima el siguiente evento y el tiempo de espera restante a partir de observaciones previas, con trazabilidad hacia los eventos fuente. Las funciones de memoria operan con pesos congelados, es decir, no requieren reentrenamiento.

El modelo se presenta como un fine-tune de la version v16 del mismo autor, que a su vez deriva de un artefacto FP8 de un publisher upstream. Esta pensado para despliegue en una unica GPU Blackwell con soporte `sm_120a`, con contexto declarado de hasta 262.144 tokens en la configuracion de ejemplo. Su relevancia actual reside en la combinacion de decodificacion especulativa, cuantizacion FP8 y una capa de memoria persistente sobre un modelo de codigo de 27B, todo bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de vision, cabeza MTP y componente DFlash2 (detalles internos no disponibles) |
| Parametros totales | 27B (segun denominacion del modelo; desglose no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun comando de ejemplo con `--max-context 262144`) |
| Tipos de cuantizacion | FP8 (pesos); KV cache en FP8 (`--kv-dtype fp8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto propietario del runtime NInfer; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los componentes empaquetados: pesos FP8 del modelo de texto, torre de vision, cabeza MTP para prediccion multi-token y componente DFlash2 para decodificacion especulativa con draft de 7 tokens (o MTP con 3 tokens como alternativa). El pipeline declarado es `image-text-to-text`, lo que confirma soporte multimodal entrada imagen/texto y salida texto. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; la model card remite a la card del publisher upstream para el linaje de entrenamiento.

La innovacion tecnica destacable es la capa V17 de memoria episodica. Segun la card, preserva eventos observados, reutiliza secuencias de relaciones verificadas y estima el siguiente evento y el tiempo de espera restante, devolviendo los eventos fuente que respaldan cada respuesta. Los pronosticos y sus resultados posteriores se almacenan en un registro separado. El estado de memoria persiste en un volumen montado como almacen SQLite en formato FORMAT 8 junto con ficheros de segmentos, y se incluye la herramienta `ninfer-import-v16` para migrar un banco de memoria V16 existente. Todo ello opera con los pesos congelados del modelo base.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de programacion (denominacion Coder390) y mantiene generacion de lenguaje general.
- Vision: pipeline `image-text-to-text`, con torre de vision incluida en el artefacto y activada mediante el flag `--vision`.
- Decodificacion especulativa: soporte de DFlash2 (7 draft tokens) y de MTP (3 draft tokens) para acelerar la generacion.
- Memoria episodica V17: registro de eventos, reutilizacion de procedimientos verificados y estimacion del siguiente evento con tiempo de espera restante.
- Trazabilidad: las respuestas de los procedimientos de memoria pueden devolver los eventos fuente que las sustentan.
- Persistencia entre reinicios: el banco de memoria se conserva en un volumen y se relee al arrancar de nuevo el contenedor.
- Servidor compatible con API OpenAI: endpoint `/v1/chat/completions` con identificador de modelo `coder390-v17`.
- Concurrencia: configuracion de ejemplo con `--max-concurrency 8`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia a programacion en produccion: el modelo puede integrarse en un endpoint compatible con la API de chat de OpenAI y atender peticiones de generacion y revision de codigo, con contexto de hasta 262.144 tokens para repositorios o ficheros extensos.
- Analisis de diagramas y capturas tecnicas: gracias a la torre de vision, puede recibir imagenes junto al texto, por ejemplo esquemas de arquitectura o capturas de errores, y razonar sobre ellas.
- Mantenimiento de un registro operativo con memoria persistente: la capa V17 permite almacenar eventos observados (incidencias, despliegues, cambios) y consultarlos posteriormente con trazabilidad a la fuente.
- Prediccion de proximos eventos en pipelines: el componente de memoria estima el siguiente evento y el tiempo de espera restante a partir de trazas previas, util para anticipar estados como compilaciones o despliegues.
- Recuperacion de procedimientos verificados: ante una consulta sobre equipamiento o configuracion no vista previamente, el sistema puede seleccionar un procedimiento ya validado y devolver el resultado correcto junto con los eventos que lo respaldan.
- Despliegue en infraestructura controlada: el runtime C++/CUDA sin Python y el contenedor Docker permiten ejecutar el modelo en una unica GPU Blackwell con aislamiento de red (`127.0.0.1`) y volumen de memoria dedicado.
- Aceleracion de inferencia interactiva: el uso de DFlash2 o MTP reduce la latencia de decodificacion en cargas de generacion larga, adecuado para asistentes de codigo con respuestas de cientos de tokens.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Si incluye mediciones de throughput de la version V15 con el mismo paquete, sobre una RTX PRO 6000 (96 GB) con KV en FP8 y tres prompts secuenciales de 400 tokens de salida:

| Backend (V15) | Velocidad media de decodificacion | Latencia media al primer token | Aceptacion de draft |
|---|---:|---:|---:|
| DFlash2, 7 draft tokens | 106,6 tok/s | 0,39 s | 20,77% |
| MTP, 3 draft tokens | 98,8 tok/s | 0,45 s | 45,97% |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 30,3 GB en disco; con KV cache FP8 y contexto de hasta 262.144 tokens el consumo crece de forma significativa. No se proporciona una cifra exacta de VRAM para el contexto maximo.
- GPU objetivo: una unica GPU Blackwell con soporte `sm_120a`. Las mediciones se realizaron en una RTX PRO 6000 Blackwell de 96 GB.
- GPU consumer: no hay datos que confirmen ejecucion en GPUs consumer; el runtime esta compilado para arquitectura Blackwell y no se documenta soporte para otras familias.
- Despliegue: exclusivamente mediante el contenedor Docker `lovewin10/ninfer-v17:coder390-cu13` con el runtime NInfer. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.ninfer` no es compatible con esos motores.
- Parametros de ejecucion relevantes: `--vision`, `--spec dflash2 --draft-tokens 7` o `--spec mtp --draft-tokens 3`, `--kv-dtype fp8`, `--max-context 262144`, `--kv-capacity auto`, `--max-concurrency 8`, `--shm-size=4g`.
- Throughput y latencia: 106,6 tok/s con DFlash2 y 98,8 tok/s con MTP (mediciones V15 en RTX PRO 6000 de 96 GB); latencia al primer token de 0,39 s y 0,45 s respectivamente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de calidad del modelo que permitan una comparacion rigurosa. A continuacion se comparan caracteristicas estructurales con alternativas de tamano y proposito similares, indicando los datos no disponibles.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390-FP8-DFlash2-v17 | 27B | 262.144 tokens (config. de ejemplo) | `.ninfer` / NInfer (solo GPU Blackwell) | Apache-2.0 | Solo throughput (V15): 106,6 tok/s DFlash2 |
| Modelos Qwen de codigo de ~30B (genericos) | ~30B | no disponible | safetensors, GGUF, multiples motores | habitualmente Apache-2.0 | no disponible en esta ficha |
| Fine-tunes de codigo de 27B-34B en FP8 | 27B-34B | variable | safetensors / vLLM, TGI | variable | no disponible en esta ficha |

La diferencia principal frente a alternativas convencionales es el empaquetado propietario y la dependencia de un unico runtime y una unica familia de GPU, a cambio de incluir decodificacion especulativa y memoria episodica persistente integradas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad. La capa V17 ofrece trazabilidad a eventos fuente en sus procedimientos, pero no se documenta su comportamiento fuera de ese ambito.
- Limitaciones de contexto o idioma: el contexto maximo de 262.144 tokens es una configuracion de ejemplo; no se especifica el contexto nativo de entrenamiento. Los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache-2.0 para el modelo y para el parche NInfer, lo que permite uso comercial, pero el linaje incluye un artefacto upstream de terceros cuya card conviene revisar.
- Dependencia de hardware: el runtime esta compilado para Blackwell `sm_120a`; no hay soporte documentado para GPUs anteriores ni para CPU.
- Dependencia de formato: el artefacto `.ninfer` no es portable a vLLM, llama.cpp, Ollama ni TGI; la migracion entre versiones requiere la herramienta `ninfer-import-v16`.
- Estado del modelo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las mediciones de throughput corresponden a la version V15, no a la V17.
- Memoria episodica: opera con pesos congelados y almacena estado en un volumen SQLite; la perdida o corrupcion del volumen afecta a la persistencia de eventos y pronosticos.
- Configuracion de red: el ejemplo de ejecucion publica el puerto solo en `127.0.0.1`, lo que exige un proxy o tunel para exposicion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v17
- Version V16 (modelo base): https://huggingface.co/LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v16/tree/fd7e8fa5f0dc01891224ac35027d95053e5f6ffd
- Mediciones V15: https://huggingface.co/LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v15/blob/9f2c84bd8a0c9649606e8407929c7906c0f88b25/README.md#measurements
- Artefacto FP8 upstream: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2/blob/7eced947d7132dffbc2c0ea4db332081360afbf8/FP8/Qwen3.8-27B-Coder390-FP8-DFlash2.ninfer
- Model card original: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Script de compilacion nativa: `ninfer-v17-patch/image/build-from-patch.sh` (incluido en el repositorio del modelo)
- Licencia del modelo: `LICENSE` (incluido en el repositorio del modelo)
- Licencia del parche: `ninfer-v17-patch/LICENSE` (incluido en el repositorio del modelo)
