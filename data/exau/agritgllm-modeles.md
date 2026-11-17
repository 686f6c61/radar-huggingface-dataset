# exau/agritgllm-modeles

## Resumen

`exau/agritgllm-modeles` no es un modelo entrenado, sino un repositorio de distribucion que empaqueta, sin modificacion alguna, los dos artefactos que consume la aplicacion AgriTGLLM (un registro agricola disenado para funcionar sin conexion). El repositorio contiene un modelo de lenguaje cuantizado en GGUF para la comprension de frases y un modelo de reconocimiento de voz en formato binario de whisper.cpp para la dictacion en frances.

El componente de lenguaje es `Qwen/Qwen3.5-2B` convertido a GGUF por bartowski en cuantizacion Q4_K_M (1.396.198.496 bytes), con 1.942.653.248 parametros totales segun los metadatos de safetensors del repo. El componente de voz es `openai/whisper-large-v3-turbo` convertido con whisper.cpp en cuantizacion q5_0 (574.041.195 bytes). Ambos se descargan una unica vez, se verifican por tamano y huella SHA-256, y la aplicacion opera despues sin internet.

Su relevancia es practica mas que cientifica: ilustra un patron de despliegue edge/offline para dominio agrario en frances, con verificacion de integridad criptografica de los pesos y una separacion limpia entre licencias (Apache 2.0 para el LLM, MIT para Whisper). No aporta fine-tuning ni datos de explotacion propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (componente LLM, Qwen3.5-2B); encoder-decoder Whisper (componente ASR). No se detalla mas en la informacion disponible |
| Parametros totales | 1.942.653.248 (dato real de safetensors, corresponde al componente LLM) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (LLM, GGUF) y q5_0 (ASR, formato ggml binario) |
| Idiomas soportados | fr (frances) |
| Licencia | Apache 2.0 (Qwen3.5-2B) y MIT (Whisper); el repo declara `apache-2.0-et-mit` y tag `license:other` |
| Formato de pesos | GGUF (`Qwen_Qwen3.5-2B-Q4_K_M.gguf`) y binario ggml de whisper.cpp (`ggml-large-v3-turbo-q5_0.bin`) |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta ningun modelo: la model card indica explicitamente que son copias sin ninguna modificacion y que no se ha aplicado fine-tuning. El componente de comprension de frases es Qwen3.5-2B, un transformer decoder-only de 2B parametros, convertido a GGUF por bartowski (revision `7d26695454df6de5fbcce2e58681e62dae06ce43`) y cuantizado a Q4_K_M, con uso de imatrix segun los tags del repo. El componente de dictado es whisper-large-v3-turbo, el modelo ASR de OpenAI, convertido con whisper.cpp (revision `5359861c739e955e79d9a303bcbc70fb988958b1`) a q5_0.

La innovacion tecnica del paquete no esta en los pesos sino en el pipeline de distribucion: la aplicacion descarga los ficheros una sola vez, valida tamano y SHA-256 (por ejemplo `57a1085840f497d764a7fc5d346922dbde961efb54cc792ea81d694fd846a1d8` para el GGUF y `394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2` para el binario de Whisper) y pasa a modo offline. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO de los modelos originales en la informacion proporcionada.

## Capacidades

- Comprension de frases en frances para un registro agricola: interpretacion de consultas y entradas de texto del dominio.
- Generacion de texto conversacional en frances (etiqueta `conversational` en el repo).
- Dictado y transcripcion de voz en frances mediante whisper-large-v3-turbo.
- Ejecucion totalmente offline tras la descarga y verificacion inicial de los ficheros.
- Compatibilidad con llama.cpp (LLM) y whisper.cpp (ASR) como motores de inferencia.
- Endpoints compatibles (`endpoints_compatible` en los tags), lo que sugiere integracion con APIs tipo OpenAI en el despliegue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision, audio de entrada al LLM o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Registro agricola offline en campo: la aplicacion usa el LLM Q4_K_M para interpretar frases del agricultor y registrar parcelas, tratamientos o cosechas sin cobertura de red, apoyandose en la verificacion SHA-256 para garantizar que los pesos no han sido alterados.
- Dictado de partes de trabajo: whisper-large-v3-turbo q5_0 transcribe en frances las notas habladas del operario, que luego el LLM estructura en campos del registro.
- Asistente conversacional en frances para consultas agrarias: el tag `conversational` y el idioma `fr` lo hacen adecuado para responder dudas sobre cultivos o normativa en una interfaz de chat local.
- Despliegue en hardware modesto: con 1,4 GB de pesos Q4_K_M y 574 MB de ASR, el paquete cabe en equipos de campo con poca VRAM o incluso en CPU via llama.cpp/whisper.cpp.
- Distribucion reproducible en entornos con conectividad intermitente: el patron de descarga unica con validacion de integridad sirve de plantilla para otras aplicaciones sectoriales que necesiten operar sin internet.
- Base para fine-tuning posterior en dominio agrario: al ser copias limpias de Qwen3.5-2B y Whisper large-v3-turbo con licencias permisivas (Apache 2.0 y MIT), el repositorio es un punto de partida valido para ajustar ambos modelos a vocabulario agricola.
- Integracion via endpoints compatibles: el tag `endpoints_compatible` permite exponer el LLM detras de una API estilo OpenAI en un servidor local de la explotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta tamanos de fichero y hashes SHA-256, no metricas de calidad.

## Requisitos de hardware

- VRAM estimada para el LLM: aproximadamente 1,4 GB solo para los pesos en Q4_K_M; con contexto y overhead de llama.cpp, un presupuesto de 2 a 3 GB de VRAM o RAM es razonable.
- VRAM estimada para el ASR: aproximadamente 574 MB para los pesos q5_0 de whisper-large-v3-turbo; con buffers de audio, un presupuesto de 1 a 2 GB.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia acomodar ambos componentes.
- Cabe en GPU consumer: si, por el tamano de los pesos; tambien puede ejecutarse en CPU con llama.cpp y whisper.cpp.
- Opciones de despliegue: llama.cpp (GGUF) y whisper.cpp (binario ggml) son los motores explicitamente soportados; Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| exau/agritgllm-modeles (LLM) | 1.942.653.248 | no disponible | GGUF Q4_K_M | Apache 2.0 | Copia sin modificar de Qwen3.5-2B |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar |
| bartowski/Qwen_Qwen3.5-2B-GGUF | 2B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Conversion de referencia usada por este repo |
| exau/agritgllm-modeles (ASR) | no disponible | no disponible | ggml q5_0 | MIT | Copia sin modificar de whisper-large-v3-turbo |

## Limitaciones y advertencias

- No es un modelo propio: no hay fine-tuning ni adaptacion al dominio agrario; el rendimiento en vocabulario agricola dependera del modelo base.
- Idioma limitado al frances (`fr`); no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o documentos extensos.
- Riesgo de alucinacion inherente a un LLM de 2B en cuantizacion Q4_K_M; en un registro agricola conviene validar los datos extraidos antes de persistirlos.
- La licencia del repo es mixta (`apache-2.0-et-mit`) y el campo `license` aparece como `other`; para uso comercial hay que respetar simultaneamente Apache 2.0 (Qwen3.5-2B) y MIT (Whisper), y consultar `LICENSE-Qwen3.5-2B.txt` y `LICENSE-Whisper.txt`.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; la fecha de creacion indicada (2026-11-17) debe tratarse con cautela.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- El tag `imatrix` sugiere cuantizacion con matriz de importancia, pero no se detalla el proceso ni su impacto en calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/exau/agritgllm-modeles
- Licencia Qwen3.5-2B en el repo: https://huggingface.co/exau/agritgllm-modeles/blob/main/LICENSE-Qwen3.5-2B.txt
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3.5-2B
- Conversion GGUF de referencia: https://huggingface.co/bartowski/Qwen_Qwen3.5-2B-GGUF
- Modelo base del ASR: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
