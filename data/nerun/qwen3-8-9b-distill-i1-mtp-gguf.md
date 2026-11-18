# nerun/Qwen3.8-9B-Distill-i1-MTP-GGUF

## Resumen

Qwen3.8-9B-Distill-i1-MTP-GGUF es un conjunto de cuantizaciones GGUF generadas por el usuario nerun a partir de empero-ai/Qwen3.8-9B-Distill, un modelo denso de 9.000 millones de parametros obtenido por destilacion de un profesor mucho mayor (Qwen3.8 2.4T A95B) sobre la arquitectura Qwen3.5-9B. El paquete incluye 25 cuantizaciones en formato GGUF (desde IQ1_S de 2,9 GiB hasta BF16 de 17,1 GiB), todas con la cabeza MTP (multi-token prediction) embebida para permitir decodificacion especulativa con llama.cpp.

La aportacion principal de este repositorio no es el modelo en si, sino el empaquetado: cuantizaciones con importance matrix (imatrix) calibradas, un proyector de vision independiente (mmproj) para habilitar entrada multimodal, y la integracion de la cabeza MTP en cada fichero, lo que permite usar decodificacion especulativa con un solo fichero y sin modelo borrador separado. El autor reporta una mejora de generacion de aproximadamente +42% (de 36,82 a 52,29 t/s) usando la cuantizacion IQ4_XS en una Radeon RX 6600M de 8 GB.

El modelo base es relevante por su relacion tamano/capacidad: un denso de 9B destilado de un profesor de escala frontier, con soporte de vision y licencia Apache 2.0, lo que lo hace apto para despliegue local en hardware de consumo y para uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B, con cabeza MTP embebida |
| Parametros totales | 9B (aproximado, segun nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `-c 0` con `-fitc 32768`) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b12503 o superior); el modelo base original en safetensors/Hugging Face Transformers |

## Arquitectura y entrenamiento

El modelo base es una destilacion de parametros completos de Qwen3.8 2.4T A95B (un modelo profesor de tipo MoE con 2,4 billones de parametros totales y 95.000 millones activos) hacia la arquitectura densa Qwen3.5-9B. Segun la model card original, el estudiante se entreno sobre aproximadamente 70.000 trazas curadas del profesor, procedentes de los conjuntos internos de destilacion de Empero, con enfasis en cadenas de razonamiento densas. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El repositorio de nerun anade dos componentes tecnicos sobre el modelo base. Por un lado, la cabeza MTP (bloque `blk.32.nextn.*`), transplantada desde srmiles/Qwen3.8-9B-Distill-MTP-GGUF, que habilita decodificacion especulativa nativa en llama.cpp mediante `--spec-type draft-mtp`; la cabeza Q8_0 se usa en todas las cuantizaciones hasta Q8_0 y la BF16 en el fichero BF16. Por otro, un proyector de vision (mmproj) en q8_0 (595 MiB) y f16 (876 MiB) que se carga con `--mmproj` para habilitar entrada de imagenes. Las cuantizaciones se generaron con `llama-imatrix` sobre una copia Q8_0 del modelo, usando el texto de calibracion calibration_datav3.txt de bartowski1182, y posteriormente con `llama-quantize --imatrix`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es una destilacion orientada a cadenas de razonamiento densas, por lo que conserva capacidad de razonamiento multi-paso.
- Vision: soportada mediante el proyector mmproj incluido en el repositorio (q8_0 o f16), cargado con `--mmproj`.
- Decodificacion especulativa MTP: cada fichero GGUF incluye la cabeza MTP, lo que permite acelerar la generacion sin un modelo borrador externo.
- Codigo y matematicas: no se documentan explicitamente en la informacion disponible, aunque son capacidades esperables en un modelo destilado de un profesor de gran escala; no hay confirmacion en la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en GPU de consumo: con cuantizaciones desde 2,9 GiB (IQ1_S) hasta 5,5 GiB (Q4_K_M), el modelo cabe en GPUs de 8 GB o incluso en sistemas con 6 GB usando cuantizaciones bajas, lo que permite ejecutar un modelo de 9B en hardware asequible.
- Aceleracion de inferencia con MTP: en escenarios de generacion interactiva (chat, autocompletado), la cabeza MTP embebida permite activar decodificacion especulativa con `--spec-type draft-mtp` y obtener hasta un +42% de velocidad segun el autor, sin necesidad de gestionar un modelo borrador aparte.
- Procesamiento de documentos con imagenes: cargando el mmproj q8_0 junto con cualquier cuantizacion, el modelo puede recibir imagenes y texto, util para extraccion de informacion de capturas, diagramas o documentos escaneados en local.
- Prototipado de asistentes de razonamiento: el modelo base se entreno sobre trazas de cadena de razonamiento, por lo que es adecuado para tareas de analisis paso a paso, resumen de documentacion tecnica y resolucion de problemas estructurados en entornos de desarrollo.
- Evaluacion de destilaciones en pipelines de investigacion: investigadores que comparan tecnicas de destilacion pueden usar estas cuantizaciones para medir la calidad del estudiante frente al profesor en tareas de razonamiento, con la ventaja de ejecutar en una sola GPU.
- Servicio de inferencia ligero con llama-server: el ejemplo de la model card (`llama-server` con `-ngl auto`, `-fa on`, KV cache en q8_0) sirve como base para levantar un endpoint HTTP local o en un servidor modesto para pruebas de integracion.
- Uso comercial sin friccion: la licencia Apache 2.0 del modelo base y de las cuantizaciones permite integrar el modelo en productos propietarios sin obligaciones de atribucion mas alla de las habituales.

## Benchmarks y rendimiento

El autor publica un unico benchmark de velocidad de generacion, medido con la cuantizacion IQ4_XS y `--spec-draft-n-max 2` en una AMD Radeon RX 6600M (Navi 23, 8 GB), CPU AMD Ryzen 5 serie 5000 con 32 GB DDR4-3200, Debian testing y llama.cpp b12503:

| Configuracion | Generacion (t/s) |
|---|---|
| Sin MTP (baseline) | 36,82 |
| Con `--spec-draft-n-max 2` | 52,29 |

La mejora reportada es de aproximadamente +42% en velocidad de generacion. El autor advierte que los resultados dependen fuertemente del hardware, backend, tipo de prompt y ajustes, y recomienda medir en la propia maquina antes de fiarse de las cifras.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 3 GB (IQ1_S, 2,9 GiB) hasta 18 GB (BF16, 17,1 GiB); las cuantizaciones intermedias mas usadas rondan 4-7 GB (Q3_K_M 4,6 GiB, Q4_K_M 5,5 GiB, Q5_K_M 6,3 GiB, Q6_K 7,1 GiB).
- Proyector de vision: anade 595 MiB (q8_0) o 876 MiB (f16) de VRAM si se carga con `--mmproj`.
- GPU recomendadas: el autor valida el funcionamiento en una Radeon RX 6600M de 8 GB; por capacidad de VRAM, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o A100/H100 pueden ejecutar las cuantizaciones altas y BF16 con holgura. No hay datos de rendimiento en GPU NVIDIA en la informacion disponible.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB con cuantizaciones IQ2/IQ3/Q4; la Q4_K_M (5,5 GiB) es la opcion equilibrada para 8 GB.
- Opciones de despliegue: llama.cpp (requiere build b12503 o superior por el soporte de `--spec-type draft-mtp`), llama-server; el modelo base original es compatible con Hugging Face Transformers, vLLM y SGLang segun la model card de Empero. No se mencionan Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 36,82 t/s sin MTP y 52,29 t/s con MTP en la RX 6600M con IQ4_XS; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP / decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-i1-MTP-GGUF (este) | 9B denso | no disponible | Si (mmproj) | Si, embebida | Apache 2.0 | GGUF en Hugging Face |
| empero-ai/Qwen3.8-9B-Distill | 9B denso | no disponible | Si (modelo base) | No documentada | Apache 2.0 | Safetensors en Hugging Face |
| srmiles/Qwen3.8-9B-Distill-MTP-GGUF | 9B denso | no disponible | no disponible | Si (origen de la cabeza MTP) | no disponible | GGUF en Hugging Face |
| Qwen3.5-9B (arquitectura base) | 9B denso | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento con alternativas; la comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso ni validacion por parte de la comunidad.
- El autor advierte explicitamente que los numeros de rendimiento deben medirse en la propia maquina; las cifras de +42% corresponden a una unica GPU y una unica cuantizacion.
- Requiere llama.cpp b12503 o superior; versiones anteriores no soportan `--spec-type draft-mtp` y pueden fallar al cargar la cabeza MTP.
- No se debe pasar el fichero como `--model-draft`: la cabeza MTP ya esta embebida y usarlo como borrador provocaria un comportamiento incorrecto.
- Las cuantizaciones muy bajas (IQ1_S, IQ1_M, IQ2_XXS) degradan la calidad de forma significativa; no son adecuadas para produccion con requisitos de precision.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible; el modelo base es una destilacion y puede heredar sesgos del profesor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es una destilacion de un profesor de Empero cuyos terminos de los datos de destilacion no se detallan; conviene revisar la model card original antes de un despliegue comercial.
- El contexto maximo no se especifica; el ejemplo de uso fija `-fitc 32768`, pero no hay confirmacion de que ese sea el limite del modelo.
- La cabeza MTP se transplanto desde un repositorio de terceros (srmiles); no se documenta una validacion de calidad de esa cabeza mas alla de la velocidad reportada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/Qwen3.8-9B-Distill-i1-MTP-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio de la cabeza MTP: https://huggingface.co/srmiles/Qwen3.8-9B-Distill-MTP-GGUF
- Script de cuantizacion del autor: https://github.com/nerun/imatrix-gguf-quantizer
- Texto de calibracion imatrix: https://gist.githubusercontent.com/bartowski1182/eb213dccb3571f863da82e99418f81e8/raw/calibration_datav3.txt
- Web de Empero: https://empero.org
