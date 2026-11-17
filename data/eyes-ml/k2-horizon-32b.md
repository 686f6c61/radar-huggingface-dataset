# eyes-ml/K2-Horizon-32B

## Resumen

K2-Horizon-32B es un modelo de lenguaje denso de tipo decoder-only desarrollado por eyes-ml (identificado en la model card como IFM), con aproximadamente 34.780 millones de parametros reales segun los pesos en safetensors. Se presenta como el miembro de mayor tamano dentro de la familia K2-Horizon y esta disenado para generacion de texto con una ventana de contexto nativa de 524.288 tokens (512K), disponible desde las fases de midtraining.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se acompana de un compromiso de apertura poco habitual: la model card enlaza el codigo de entrenamiento, el codigo de evaluacion y los datasets de preentrenamiento y midtraining. Tambien se publican checkpoints intermedios para estudiar la evolucion de capacidades a lo largo del entrenamiento.

Su relevancia actual radica en dos factores: por un lado, ofrece una linea base densa de 32B con contexto extremadamente largo, un segmento donde abundan los modelos MoE pero escasean las alternativas densas con ventanas de 512K; por otro, la publicacion completa de datos y receta de entrenamiento facilita la reproducibilidad y la investigacion sobre dinamicas de entrenamiento a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 34.779.304.960 (~32B nominales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), nativo desde midtraining |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

K2-Horizon-32B es un transformer decoder-only denso, sin mezcla de expertos, con todos los parametros activos en cada pasada forward. El tag `custom_code` en el repositorio indica que la implementacion requiere codigo propio del autor para cargarse con transformers, por lo que no es un modelo plug-and-play con arquitecturas estandar. La ventana de contexto de 524.288 tokens se establece de forma nativa a partir de las etapas de midtraining, no como una extension posterior mediante tecnicas de interpolacion posicional.

El entrenamiento se realizo sobre dos conjuntos de datos publicados y enlazados desde la model card: `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. La model card menciona la publicacion de checkpoints intermedios, lo que sugiere un proceso de entrenamiento por etapas documentado, pero no se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado `text-generation`.
- Razonamiento y tareas de codigo evaluadas en los benchmarks de la familia, segun la model card.
- Uso de herramientas en entornos agénticos: la model card reporta evaluacion en tau3-Banking (agentic tool use).
- Procesamiento de contexto muy largo gracias a la ventana nativa de 512K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se detalla soporte formal de function calling mas alla de la evaluacion agentica mencionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 512K tokens de contexto, el modelo puede ingerir bases de codigo completas o manuales tecnicos de cientos de paginas en una sola pasada, evitando estrategias de chunking y recuperacion fragmentada.
- Atencion al cliente automatizada: la ventana larga permite mantener historiales de conversacion multi-turno muy extensos junto con bases de conocimiento internas, util para soporte tecnico con trazabilidad completa del caso.
- Agentes de automatizacion con uso de herramientas: su evaluacion en tau3-Banking sugiere aptitud para flujos agénticos de dominio financiero o administrativo donde el modelo debe invocar APIs y encadenar pasos.
- Generacion y revision de codigo en pipelines: al ser un modelo denso de 32B, ofrece un equilibrio predecible entre calidad y coste de inferencia, integrable en revisiones automatizadas de pull requests o generacion de tests.
- Investigacion sobre entrenamiento de LLM: la publicacion de datos, receta, codigo y checkpoints intermedios permite reproducir experimentos y estudiar la emergencia de capacidades a lo largo del entrenamiento.
- Procesamiento de expedientes legales o regulatorios: documentos de gran extension que requieren extraccion de clausulas y resumen con coherencia global a lo largo de todo el texto.
- Despliegue on-premise con licencia permisiva: Apache 2.0 facilita su integracion en productos comerciales sin obligaciones de atribucion complejas ni restricciones de uso.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B, con secciones de agentes (tau3-Banking) y otras categorias. Sin embargo, los valores numericos de la tabla no estan disponibles en la informacion proporcionada (la extraccion se trunca antes de los resultados). No se presentan cifras de MMLU, HumanEval, GSM8K ni de los benchmarks agenticos en el material disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 70 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 35-40 GB; en 4 bits, alrededor de 18-22 GB, aunque no se distribuya GGUF oficial.
- GPU recomendadas: A100 80GB, H100 80GB o multiples GPUs para BF16. En consumer, una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva a 4 bits y contexto reducido.
- La ventana de 512K tokens implica una cache KV muy costosa; para aprovecharla completa se requiere hardware de clase servidor con memoria suficiente o tecnicas de atencion eficiente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); compatibilidad con vLLM, TGI, llama.cpp u Ollama no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-32B | 32B | Densa | 512K | Apache 2.0 | Hugging Face |
| Qwen3.8-27B | 27B | Densa | no disponible | no disponible | referenciado en model card |
| Muse Glimmer-30B | 30B | Densa | no disponible | no disponible | referenciado en model card |
| IBM Granite 4.2 30B | 30B | Densa | no disponible | no disponible | referenciado en model card |

Los tres modelos comparables aparecen unicamente en la tabla de benchmarks de la model card; no se dispone de sus especificaciones de contexto, licencia ni resultados numericos en la informacion proporcionada. La ventaja diferencial documentada de K2-Horizon-32B frente a ellos es la ventana de 512K tokens y la apertura completa de datos y receta de entrenamiento.

## Limitaciones y advertencias

- Modelo entrenado y declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de calibracion ni evaluaciones de factualidad en la informacion disponible.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor al cargar el modelo; conviene auditar el codigo antes de usarlo en produccion.
- No se especifican sesgos conocidos ni evaluaciones de seguridad o alineacion en la model card disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- La ventana de 512K incrementa notablemente el coste de memoria y latencia; el uso practico del contexto completo puede ser prohibitivo en hardware consumer.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentacion sobre alineacion y filtrado de datos exige evaluacion propia antes de desplegarlo en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/K2-Horizon-32B
- Codigo de entrenamiento: https://github.com/ifm-ai/xllm
- Codigo de evaluacion: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: IFM/K2-Horizon-Pretrain-Data (Hugging Face)
- Dataset de midtraining: IFM/K2-Horizon-Midtrain-Data (Hugging Face)
