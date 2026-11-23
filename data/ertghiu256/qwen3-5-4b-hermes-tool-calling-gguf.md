# ertghiu256/qwen3.5-4b-hermes-tool-calling-gguf

## Resumen

qwen3.5-4b-hermes-tool-calling-gguf es la distribucion en formato GGUF del modelo ertghiu256/qwen3.5-4b-hermes-tool-calling, un ajuste fino orientado a tool calling sobre una base Qwen 3.5 de 4B. El autor, ertghiu256, publica los pesos cuantizados para su uso directo con llama.cpp, e incluye un fichero mmproj que indica soporte de entrada multimodal (vision-language model) en el modelo base. Con 4.326.350.848 parametros totales y licencia Apache 2.0, se posiciona como una opcion ligera y permisiva para integrar function calling en aplicaciones locales.

La relevancia de esta ficha radica en su tamano contenido y su formato de despliegue: al estar en GGUF, puede ejecutarse en hardware de consumo sin necesidad de GPUs de datacenter. El ajuste fino sobre Hermes sugiere un enfasis en seguir instrucciones y emitir llamadas a herramientas en formato estructurado, aunque la model card no documenta el dataset de entrenamiento ni los resultados de evaluacion.

La informacion publica disponible es escasa: la model card se limita a instrucciones de uso con llama-cli y llama-mtmd-cli y a la lista de ficheros. No se detallan idiomas, contexto nativo ni datos de benchmarks, por lo que varias filas de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5), ajuste fino tipo Hermes; soporte multimodal segun tag vision-language-model y fichero mmproj |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (y F16-mmproj para el proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen 3.5 de 4B con arquitectura transformer y se ajusta de forma supervisada para tool calling, segun se deduce del nombre y de las etiquetas del repositorio. El autor indica que el fine-tuning y la conversion a GGUF se realizaron con Unsloth, herramienta que optimiza el entrenamiento y la cuantizacion de modelos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La presencia del fichero `Qwen3.5-4B.F16-mmproj.gguf` y la etiqueta `vision-language-model` apuntan a que el modelo conserva capacidad de procesamiento de imagenes heredada de la base, ejecutable con `llama-mtmd-cli`. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja`).
- Tool calling y function calling, objetivo principal del ajuste fino.
- Procesamiento multimodal de imagenes mediante el proyector mmproj y `llama-mtmd-cli`.
- Razonamiento multi-turno dentro de los limites de contexto del modelo base (no documentados).
- Capacidades multilingues: no documentadas en la informacion disponible.
- No se documentan modos de pensamiento explicito (thinking mode), audio ni otras modalidades.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede emitir llamadas a funciones en formato estructurado, lo que permite orquestar herramientas (APIs, scripts, consultas a bases de datos) desde un equipo sin GPU dedicada, gracias a su cuantizacion Q4_K_M.
- Asistentes de escritorio con privacidad: al ejecutarse con llama.cpp en local, los datos no salen del dispositivo; adecuado para entornos con requisitos de confidencialidad y hardware modesto.
- Prototipado rapido de pipelines de tool calling: el formato GGUF y la compatibilidad con `llama-cli --jinja` permiten validar esquemas de herramientas antes de migrar a un modelo mayor.
- Procesamiento de documentos con imagenes: el fichero mmproj habilita la lectura de capturas o diagramas junto a texto, util para extraer informacion de formularios escaneados en local.
- Integracion en aplicaciones de chat multi-turno: el ajuste sobre Hermes favorece el seguimiento de instrucciones y la coherencia conversacional en asistentes embebidos.
- Evaluacion comparativa de modelos pequenos: con 4.326 millones de parametros y licencia Apache 2.0, sirve como referencia permisiva en pruebas de calidad de function calling frente a alternativas de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para Q4_K_M, unos 4,5-5 GB para Q8_0 y unos 8,7 GB para F16 (calculado a partir de los 4.326 millones de parametros; no confirmado por el autor).
- El fichero mmproj anade un consumo adicional modesto para tareas de vision.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 4090); para F16 se recomienda 12 GB o mas (RTX 4070 Ti, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB para cuantizaciones Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama y otros runners compatibles con GGUF; no se documenta soporte verificado en vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-4b-hermes-tool-calling-gguf | 4,33B | no disponible | Apache 2.0 | GGUF | Ajuste para tool calling con soporte mmproj |
| Modelo base qwen3.5-4b-hermes-tool-calling | 4,33B | no disponible | Apache 2.0 | safetensors | Sin cuantizar; mismo ajuste fino |
| Qwen 3.5 4B (base original) | no disponible | no disponible | no disponible | no disponible | Referencia de la que deriva el ajuste; sin datos verificados en esta busqueda |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen 3.5, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en razonamiento complejo y tool calling con esquemas largos.
- Longitud de contexto e idiomas no documentados: no se puede garantizar un comportamiento optimo fuera del ingles o en conversaciones muy extensas.
- El ajuste fino para tool calling puede degradar capacidades generales respecto al modelo base; no hay evaluaciones publicadas que lo confirmen o desmientan.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen 3.5 y de los datos de ajuste, no detalladas.
- El soporte multimodal depende del fichero mmproj y de `llama-mtmd-cli`; no se garantiza en otros runners.
- Repositorio con 0 likes y 454 descargas: ecosistema de validacion limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/ertghiu256/qwen3.5-4b-hermes-tool-calling-gguf
- Modelo base: https://huggingface.co/ertghiu256/qwen3.5-4b-hermes-tool-calling
- Unsloth: https://github.com/unslothai/unsloth
