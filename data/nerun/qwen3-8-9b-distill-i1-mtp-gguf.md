# nerun/Qwen3.8-9B-Distill-i1-MTP-GGUF

## Resumen

Qwen3.8-9B-Distill-i1-MTP-GGUF es una coleccion de cuantizaciones GGUF del modelo empero-ai/Qwen3.8-9B-Distill, publicada por el usuario nerun en Hugging Face. El repositorio ofrece 26 variantes de cuantizacion, desde IQ1_S (2,9 GiB) hasta BF16 (17,1 GiB), todas generadas con llama.cpp b12503 aplicando una importance matrix (imatrix) para mejorar la fidelidad de las cuantizaciones de baja precision. Ademas, incorpora la cabeza MTP (multi-token prediction) en cada archivo, lo que permite decodificacion especulativa con un unico modelo.

El modelo base es un destilado de la familia Qwen3.8 con 9B parametros nominales, orientado a razonamiento, codigo, uso de herramientas y capacidades agenticas, con soporte de vision mediante un proyector multimodal separado (mmproj). La relevancia de esta publicacion radica en que permite ejecutar un modelo de 9B con vision y decodificacion especulativa en hardware de consumo, incluyendo GPUs con 8 GB de VRAM, manteniendo licencia Apache 2.0.

El autor reporta una mejora de velocidad de generacion de aproximadamente un 42% al activar MTP (de 36,82 a 52,29 tokens por segundo) en una Radeon RX 6600M de 8 GB, lo que convierte a esta distribucion en una opcion practica para despliegues locales con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8), con cabeza MTP embebida y proyector de vision separado |
| Parametros totales | 456.010.480 (dato de safetensors del modelo base); el nombre comercial indica 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, Q8_0 (sin imatrix), BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix; incluye mmproj en q8_0 y f16) |

## Arquitectura y entrenamiento

El modelo base es un transformer derivado de la familia Qwen3.8, destilado por Empero. La model card del repositorio de cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia al repositorio original empero-ai/Qwen3.8-9B-Distill, que no se incluye completo en la informacion disponible. Los tags del modelo indican capacidades de razonamiento, codigo, uso de herramientas, agentica y vision, lo que sugiere un entrenamiento orientado a tareas de instruccion y agentes.

La innovacion tecnica principal de esta distribucion es la incorporacion de la cabeza MTP (multi-token prediction) en cada archivo GGUF. El bloque `blk.32.nextn.*` se trasplanta desde srmiles/Qwen3.8-9B-Distill-MTP-GGUF (cabeza Q8_0 para cuantizaciones hasta Q8_0, cabeza BF16 para el archivo BF16), siguiendo el "Metodo 2" descrito en el README de a4lg/Qwen3.5-9B-MTP-ONLY-GGUF. Esto permite usar decodificacion especulativa con `--spec-type draft-mtp` sin necesidad de un modelo borrador separado. Las cuantizaciones se generaron calculando una importance matrix con `llama-imatrix` sobre una copia Q8_0 y el texto de calibracion de bartowski1182, y aplicando `llama-quantize --imatrix` sobre el BF16 convertido.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (reasoning) segun los tags del modelo.
- Generacion y asistencia de codigo.
- Uso de herramientas y function calling (tool-use).
- Flujos agenticos y razonamiento multi-paso.
- Capacidades de vision mediante el proyector mmproj (q8_0 o f16) cargado con `--mmproj`.
- Decodificacion especulativa integrada mediante la cabeza MTP embebida.
- Capacidades multilingues: no disponible (los idiomas no se detallan en la informacion proporcionada).

## Casos de uso

- Asistente de codigo en local: el modelo puede ejecutarse con llama.cpp en una GPU de consumo usando cuantizaciones Q4_K_M (5,5 GiB) o IQ4_XS (5,1 GiB), ofreciendo generacion de codigo y tool calling sin depender de servicios en la nube.
- Agente autonomo con uso de herramientas: los tags de agentic y tool-use, junto con la decodificacion especulativa MTP, permiten construir bucles de razonamiento multi-paso con latencia reducida (hasta un 42% mas de velocidad de generacion reportada).
- Procesamiento de documentos con imagenes: cargando el mmproj q8_0 (595 MiB) o f16 (876 MiB) se habilita la entrada visual, util para extraccion de informacion de capturas, diagramas o formularios.
- Despliegue en estaciones de trabajo con 8 GB de VRAM: las variantes IQ3_M o Q3_K_M (4,4-4,6 GiB) dejan margen para el contexto y el proyector de vision en GPUs como la RX 6600M o RTX 3060.
- Prototipado rapido en CPU: las cuantizaciones IQ2 e IQ3 (3,2-4,4 GiB) permiten ejecutar el modelo en equipos sin GPU dedicada, con llama.cpp y `-ngl 0`.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 26 variantes con imatrix y un archivo de importance matrix, lo que facilita estudios de degradacion por cuantizacion en tareas de razonamiento y codigo.
- Servicio de inferencia con llama-server: el comando documentado (`llama-server` con `-fa on`, `-ctk q8_0`, `-ctv q8_0` y `--spec-type draft-mtp`) permite levantar un endpoint compatible con la API de llama.cpp para integracion en aplicaciones.

## Benchmarks y rendimiento

El autor publica unicamente mediciones de velocidad de generacion con la cuantizacion IQ4_XS y `--spec-draft-n-max 2`, sobre una Radeon RX 6600M (Navi 23, 8 GB), CPU Ryzen 5 5000, 32 GB DDR4-3200, Debian testing y llama.cpp b12503:

| Configuracion | Generacion (t/s) |
|---|---:|
| Sin MTP (baseline) | 36,82 |
| `--spec-draft-n-max 2` | 52,29 |

La mejora reportada es de aproximadamente +42% en velocidad de generacion. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~3,1 GB; IQ2_M ~4,0 GB; Q3_K_M ~4,9 GB; IQ4_XS ~5,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,8 GB; Q6_K ~7,6 GB; Q8_0 ~9,8 GB; BF16 ~18,4 GB. Anadir ~0,6-0,9 GB si se carga el proyector de vision.
- GPU recomendadas: para BF16, A100 o H100; para Q8_0, RTX 4090 (24 GB) o A100; para Q4_K_M e inferiores, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o RX 6600M 8 GB.
- Cabe en GPU de consumo: si, desde IQ1_S hasta Q6_K en GPUs de 8 GB, y hasta Q8_0 en GPUs de 12 GB o mas.
- Opciones de despliegue: llama.cpp (obligatorio build b12343 o superior, `llama` v1.0.0 o superior) mediante `llama-server` o `llama-cli`. No se documenta compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 36,82 t/s sin MTP y 52,29 t/s con MTP en RX 6600M con IQ4_XS; no hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP / especulativo | Licencia | Formato |
|---|---|---|---|---|---|---|
| nerun/Qwen3.8-9B-Distill-i1-MTP-GGUF | 9B (nominal) | no disponible | Si (mmproj) | Si, embebido | Apache 2.0 | GGUF |
| empero-ai/Qwen3.8-9B-Distill | 9B (nominal) | no disponible | Si (segun tags) | No documentado | Apache 2.0 | safetensors |
| srmiles/Qwen3.8-9B-Distill-MTP-GGUF | 9B (nominal) | no disponible | no disponible | Si (origen de la cabeza MTP) | no disponible | GGUF |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | 9B (nominal) | no disponible | no disponible | Si (solo cabeza MTP) | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere llama.cpp b12343 o superior con soporte de MTP (`--spec-type draft-mtp`); builds anteriores fallan al cargar con un error de tensor ausente (`blk.0.ssm_beta.weight`).
- El archivo debe usarse como modelo principal; no debe pasarse de nuevo con `--model-draft`.
- Los benchmarks de velocidad son de una unica configuracion de hardware (RX 6600M, IQ4_XS) y el propio autor advierte que deben verificarse en cada maquina.
- Las cuantizaciones de 1 y 2 bits (IQ1_S a IQ2_M) probablemente degradan la calidad de forma significativa; no se publican mediciones de perplejidad ni de calidad por cuantizacion.
- No se detallan los idiomas soportados ni el contexto maximo, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- No se han publicado evaluaciones de sesgo, alucinacion o seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base empero-ai/Qwen3.8-9B-Distill; conviene verificar los terminos del repositorio original.
- El dato de parametros totales en safetensors (456 millones) no concuerda con el nombre comercial de 9B; debe tratarse con cautela hasta confirmar la configuracion real del modelo base.
- El repositorio ocupa 147,7 GB, por lo que descargar el conjunto completo de cuantizaciones requiere un plan de almacenamiento amplio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/Qwen3.8-9B-Distill-i1-MTP-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Origen de la cabeza MTP: https://huggingface.co/srmiles/Qwen3.8-9B-Distill-MTP-GGUF
- README de referencia para trasplante MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Script de cuantizacion del autor: https://github.com/nerun/imatrix-gguf-quantizer
- Script de trasplante MTP: https://gist.github.com/nerun/6a3d7333815f60f1ae3c26e235136f2e
- Texto de calibracion imatrix: https://gist.githubusercontent.com/bartowski1182/eb213dccb3571f863da82e99418f81e8/raw/calibration_datav3.txt
