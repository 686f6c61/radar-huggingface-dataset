# KhasanovAM/qwen_finetune

## Resumen

KhasanovAM/qwen_finetune es un ajuste fino (fine-tune) del modelo Qwen3.5 de 2B de parametros, adaptado como modelo de vision-lenguaje (vision-language model, VLM) y publicado en formato GGUF para su ejecucion local. El repositorio lo mantiene el usuario KhasanovAM y el proceso de ajuste y conversion a GGUF se realizo con la libreria Unsloth, segun indica la propia model card. El modelo se distribuye junto a un proyector multimodal (mmproj) en F16 que habilita la entrada de imagenes.

El modelo cuenta con 1.942.653.248 parametros en formato safetensors (aproximadamente 1,94 mil millones), lo que lo situa en la gama ligera de VLMs, apta para inferencia en hardware de consumo. El repositorio ocupa 2,7 GB e incluye, al menos, dos ficheros: Qwen3.5-2B.Q8_0.gguf (pesos cuantizados a 8 bits) y Qwen3.5-2B.F16-mmproj.gguf (proyector multimodal en F16). Los tags declarados son gguf, qwen3_5, llama.cpp, unsloth, vision-language-model, conversational y endpoints_compatible.

Es relevante para desarrolladores que buscan un VLM pequeno, ejecutable en CPU o GPU modesta mediante llama.cpp, y que quieran partir de una base Qwen3.5 ajustada. Sin embargo, el modelo carece de documentacion sustancial: no se detallan la licencia, los idiomas, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5, segun tags y nombres de fichero); vision-language model con proyector multimodal |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (fichero principal); proyector mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors citado como origen de los parametros); incluye mmproj F16 para vision |

## Arquitectura y entrenamiento

La model card indica unicamente que el modelo fue ajustado (finetuned) y convertido a GGUF usando Unsloth, un framework optimizado para fine-tuning de modelos con bajo consumo de memoria. Los nombres de los ficheros (Qwen3.5-2B.Q8_0.gguf y Qwen3.5-2B.F16-mmproj.gguf) sugieren que la base es Qwen3.5 de 2B parametros y que se ha preservado la torre de vision mediante un proyector multimodal independiente (mmproj), requisito habitual de llama.cpp para ejecutar VLMs.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO u otras, ni que datos multimodales se usaron. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Toda esta seccion queda, por tanto, marcada como no disponible mas alla de la mencion a Unsloth y del formato de publicacion.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y el uso recomendado con llama-cli indican que esta orientado a dialogos multi-turno.
- Comprension de imagenes: al tratarse de un vision-language model con fichero mmproj, admite entrada de imagenes mediante llama-mtmd-cli (multimodal).
- Integracion con llama.cpp: se puede ejecutar con las herramientas estandar del ecosistema (llama-cli, llama-mtmd-cli) y con la opcion --jinja para aplicar plantillas de chat.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en infraestructura de Hugging Face Inference Endpoints.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un VLM en portatil: gracias a sus 1,94B parametros y al fichero Q8_0 (aproximadamente 2 GB), el modelo puede ejecutarse en CPU o en una GPU de gama media mediante llama.cpp para tareas de descripcion de imagenes y conversacion, sin depender de servicios en la nube.
- Clasificacion y etiquetado de imagenes a pequena escala: se puede usar el modelo como componente de vision-lenguaje para generar descripciones o etiquetas de capturas y fotos en lotes, siempre que el rendimiento se valide con datos propios al no existir benchmarks publicados.
- Asistente conversacional embebido: al ser un modelo ajustado y pequeno, es candidato para prototipos de chatbot en aplicaciones de escritorio o moviles con recursos limitados, usando llama-cli o una integracion basada en llama.cpp.
- Extraccion de informacion de capturas o documentos escaneados: combinando entrada de imagen y salida de texto, puede emplearse en prototipos de lectura de tickets, formularios o capturas de pantalla, con verificacion manual posterior dado el riesgo de alucinacion de un modelo de 2B.
- Base para fine-tuning adicional: al estar publicado en un formato ligero y con soporte de Unsloth, sirve como punto de partida para ajustes especificos sobre dominios concretos (por ejemplo, imagenes medicas simples o inspeccion industrial) cuando se disponga de datos etiquetados.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local y no requerir conexion externa, encaja en escenarios donde las imagenes o el texto no pueden salir de la organizacion, como entornos sanitarios o industriales que exijan procesamiento on-premise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion, y no se han facilitado comparaciones con modelos equivalentes.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 de un modelo de 1,94B parametros ocupa aproximadamente 2 GB en disco, por lo que la inferencia en GPU requiere un orden de 2 a 3 GB de VRAM. La version en F16 requeriria aproximadamente 3,9 GB. El fichero mmproj en F16 anade memoria adicional no especificada por el autor.
- GPU recomendadas: por su tamano, el modelo cabe en practicamente cualquier GPU moderna con 4 GB o mas, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. Las GPU grandes no aportan ventaja significativa salvo mayor throughput.
- GPU de consumo: si, cabe en GPUs de consumo con 4 GB o mas de VRAM. Tambien puede ejecutarse en CPU, ya que el formato GGUF esta optimizado para ello.
- Opciones de despliegue: llama.cpp (llama-cli para texto y llama-mtmd-cli para multimodal), Ollama o LM Studio si se importa el GGUF, y Hugging Face Inference Endpoints segun el tag "endpoints_compatible". El soporte de vLLM o TGI con este GGUF concreto no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| qwen_finetune (este modelo) | 1,94B | no disponible | no disponible | GGUF en HuggingFace |
| Qwen2.5-VL-3B | aproximadamente 3,75B | 32k (segun documentacion publica) | Apache-2.0 | safetensors y GGUF |
| SmolVLM-Instruct (2,2B) | aproximadamente 2,25B | segun documentacion publica | Apache-2.0 | safetensors y GGUF |

Los datos de las alternativas proceden de sus respectivas model cards publicas y pueden variar con el tiempo. Para este ajuste concreto no hay cifras de benchmarks ni especificaciones de contexto o licencia, por lo que la comparacion en rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia, el uso comercial es incierto y deberia aclararse con el autor antes de cualquier despliegue productivo.
- Sin benchmarks: no existen evaluaciones publicadas, por lo que no hay evidencia objetiva sobre la calidad de las respuestas ni sobre el rendimiento en tareas de vision.
- Riesgo de alucinacion: los modelos de aproximadamente 2B parametros tienden a inventar detalles, especialmente en descripcion de imagenes y tareas de razonamiento, lo que exige verificacion humana en aplicaciones criticas.
- Documentacion minima: no se detallan datos de entrenamiento, composicion del dataset, idiomas ni longitud de contexto, lo que dificulta evaluar sesgos y adecuacion a un caso de uso concreto.
- Posibles sesgos: no documentados por el autor; al no especificarse el corpus de ajuste, no puede descartarse la presencia de sesgos heredados del modelo base o introducidos en el fine-tuning.
- Idiomas: no disponibles; no hay garantia de soporte multilingue ni de calidad en castellano.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de la informacion, por lo que no existe validacion por parte de la comunidad.
- Fechas del repositorio: la model card figura creada y actualizada el mismo dia (2026-10-02), lo que sugiere un proyecto reciente y sin mantenimiento posterior confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KhasanovAM/qwen_finetune
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Unsloth (documentacion): https://docs.unsloth.ai
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
