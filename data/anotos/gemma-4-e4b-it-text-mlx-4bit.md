# Anotos/Gemma-4-E4B-it-Text-MLX-4bit

## Resumen

Gemma-4-E4B-it-Text-MLX-4bit es una redistribucion del modelo google/gemma-4-E4B-it en formato MLX de 4 bits y recortado a texto. El autor, Anotos (Axly's Customs), parte de la conversion mlx-community/gemma-4-e4b-it-4bit y elimina los tensores de vision y audio (`audio_tower`, `vision_tower`, `embed_audio`, `embed_vision`), dejando unicamente los 1.355 tensores `language_model.*` copiados byte a byte. El resultado es un paquete mas pequeno (4,20 GB frente a 5,15 GB) pensado para generacion de texto sobre Apple Silicon, incluidos iPhone con 8 GB de memoria.

El modelo base es un Gemma 4 E4B de Google DeepMind, publicado bajo licencia Apache 2.0 con un enlace adicional a la licencia especifica de Gemma 4. La nomenclatura E4B apunta a la familia de variantes eficientes de Gemma, si bien la informacion proporcionada no detalla la arquitectura interna ni el numero de parametros activos.

Su relevancia es practica: ofrece una via ligera para desplegar Gemma 4 en el ecosistema MLX (mlx-lm, mlx-swift-lm) sin cargar los modulos multimodales, lo que reduce el peso y el consumo de memoria en dispositivos de gama alta. No se han publicado datos de rendimiento ni de benchmarks para este reempaquetado concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje Gemma 4; el paquete conserva solo `language_model.*`) |
| Parametros totales | 7.463.013.418 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX 4-bit); no se ofrecen otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace adicional a la licencia oficial de Gemma 4) |
| Formato de pesos | safetensors (formato MLX; 1.355 tensores `language_model.*`, 4,20 GB) |

Datos adicionales: repositorio de 4,2 GB; SHA-256 de `model.safetensors`: `16900c33eaabdb06be5378c4261aa73b09566d4c8b668382e2f4c86bb53759cd`; commit de referencia de la conversion base: `475b9088d29754a3379866cf5aeb6b41acd313c2`.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. La unica informacion tecnica es la relativa al reempaquetado: se trata del modelo mlx-community/gemma-4-e4b-it-4bit con los tensores de audio (`audio_tower`, 0,610 GB), vision (`vision_tower`, 0,335 GB) y los embeddings asociados (`embed_audio`, `embed_vision`, 0,003 GB) eliminados del archivo `model.safetensors`. Los 1.355 tensores de lenguaje restantes no fueron reentrenados, recuantizados ni alterados; se copiaron byte a byte. Tampoco se incluyen los ficheros de configuracion de los procesadores de imagen y audio.

El modelo se carga en MLX Swift (mlx-swift-lm 3.32) con el tipo de modelo `gemma4`. No hay informacion disponible sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) aplicadas al modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Inferencia optimizada para Apple Silicon mediante MLX (mlx-lm y mlx-swift-lm).
- Ejecucion en dispositivos con 8 GB de memoria, incluidos iPhone, segun la model card.
- Capacidad multimodal: no disponible (vision y audio eliminados deliberadamente en este paquete).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Generacion de texto en aplicaciones iOS: al cargarse en MLX Swift y caber en dispositivos de 8 GB, permite integrar un modelo de lenguaje local en apps de iPhone para respuestas sin conexion.
- Asistentes conversacionales locales en macOS: el formato MLX 4-bit permite ejecutar el modelo en Macs con Apple Silicon usando `mlx_lm.generate`, util para prototipos de chat privado que no salen del dispositivo.
- Procesamiento por lotes de texto en portatiles Apple: scripts de resumen, reescritura o clasificacion de documentos ejecutados en local aprovechando el peso reducido (4,20 GB).
- Reproduccion de la cuantizacion mlx-community: sirve como base determinista (SHA-256 publicado) para verificar pipelines de conversion y recorte de tensores en entornos MLX.
- Sustitucion de un paquete multimodal cuando solo se necesita texto: al eliminar los torres de vision y audio, reduce el uso de memoria y el tiempo de carga en inferencia exclusivamente textual.
- Integracion en apps de terceros: la model card menciona que el reempaquetado se hizo para la app Erato (Axly's Customs), lo que ilustra su uso como motor de texto embebido en producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: 4,20 GB de safetensors (frente a 5,15 GB de la conversion MLX original con vision y audio).
- VRAM/RAM estimada para inferencia: en torno a los 4,20 GB de pesos mas overhead de activaciones y contexto; la model card indica compatibilidad con dispositivos de 8 GB de memoria (estimacion basada en el tamano del repositorio, no en mediciones publicadas).
- Hardware objetivo: Apple Silicon (Macs y iPhone). No se documentan requisitos para GPU NVIDIA en este repo.
- GPU recomendadas: no disponible (no hay datos para A100, H100 ni RTX 4090 en la informacion proporcionada).
- Compatibilidad con GPU consumer: si, en el ecosistema Apple Silicon con memoria suficiente; no confirmado para GPUs de sobremesa.
- Opciones de despliegue: MLX (`mlx_lm.generate`) y MLX Swift (`mlx-swift-lm` 3.32, tipo `gemma4`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Vision/audio | Tamano | Licencia |
|---|---|---|---|---|---|
| Anotos/Gemma-4-E4B-it-Text-MLX-4bit | MLX 4-bit, solo texto | 7.463.013.418 totales | Eliminados | 4,20 GB | apache-2.0 |
| mlx-community/gemma-4-e4b-it-4bit | MLX 4-bit | no disponible | Incluidos | 5,15 GB | no disponible en la informacion |
| google/gemma-4-E4B-it | Pesos originales | no disponible | Incluidos | no disponible | gemma-4 (enlace en model card) |

La comparativa de rendimiento, contexto y disponibilidad de otras alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: no hay datos especificos, pero al ser un derivado de un modelo de lenguaje no se descarta el riesgo habitual de generar contenido incorrecto.
- Capacidad multimodal eliminada: no admite entrada de imagen ni audio; intentar usar esos modos fallara porque los tensores y los procesadores no estan incluidos.
- Idiomas: la model card no declara idiomas soportados, por lo que no puede garantizarse cobertura multilingue mas alla del comportamiento del modelo base.
- Sesgos: no disponibles; no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Licencia: el repo declara apache-2.0, pero enlaza a https://ai.google.dev/gemma/docs/gemma_4_license, por lo que conviene revisar los terminos de uso comercial especificos de Gemma 4 antes de un despliegue en produccion.
- Contexto: la longitud de ventana no esta indicada; no debe asumirse un tamano concreto sin verificarlo en el modelo base.
- Trazabilidad del reempaquetado: los pesos se copiaron byte a byte (SHA-256 publicado), pero no hubo validacion de rendimiento posterior al recorte; el efecto de eliminar vision y audio sobre la calidad de texto se presume nulo al no tocar los tensores de lenguaje.
- Popularidad: 0 descargas y 0 likes, sin evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anotos/Gemma-4-E4B-it-Text-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Conversion MLX de origen: https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
