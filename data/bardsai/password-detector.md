# bardsai/password-detector

## Resumen

password-detector es un modelo ligero de deteccion de secretos desarrollado por BardsAI, disenado para localizar contrasenas, claves de API, tokens y claves privadas en texto de cualquier tipo: codigo fuente, ficheros de configuracion, logs, correos electronicos, chats y documentos. A diferencia de los escaneres tradicionales basados en reglas (gitleaks, detect-secrets), este modelo aprende patrones de secretos a partir de datos, lo que le permite generalizar mejor en dominios donde las expresiones regulares fallan.

La pieza clave de su diseno es el tamano: es una CNN a nivel de byte que se ejecuta en un solo nucleo de CPU sin GPU ni dependencias pesadas, unicamente con `numpy` y `onnxruntime`. Ocupa desde 97 KB (variante tiny) hasta 0,7 MB en su configuracion recomendada en cascada. Al ser un modelo a nivel de byte, no necesita tokenizador, lo que simplifica el despliegue y elimina problemas de vocabulario en idiomas distintos del ingles.

Su relevancia actual radica en la necesidad creciente de prevenir fugas de credenciales en repositorios, pipelines de CI/CD y comunicaciones de empresa. Segun los benchmarks publicados por el autor, supera con claridad a herramientas consolidadas como detect-secrets y gitleaks en F1 sobre documentacion y correos, y se acerca a CredSweeper ocupando una fraccion de su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN a nivel de byte (sin tokenizador), pipeline de token-classification |
| Parametros totales | no disponible (97 KB tiny, 219 KB default, 0,7 MB cascada en int8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa texto a nivel de byte) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | ingles, polaco, aleman, espanol, frances |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional que opera directamente sobre bytes, sin tokenizador previo. Esto le permite procesar cualquier secuencia de texto de forma uniforme, incluidos secretos embebidos en codigo, configs o prosa multilingue, y ejecutarse con un stack minimo: `numpy` y `onnxruntime>=1.17` sobre un nucleo de CPU.

El entrenamiento combinó repositorios de entrenamiento de Samsung CredData, codigo y documentos sinteticos con secretos generados aleatoriamente, y texto real sin secretos. El autor declara explicitamente que no se uso ningun conjunto de datos de benchmark para entrenar. La configuracion recomendada es una cascada: un modelo tiny (97 KB) actua como prefiltro y, si detecta candidatos, se aplican los modelos default y large para la clasificacion final, alcanzando 0,7 MB totales a 138 KB/s en un nucleo.

## Capacidades

- Deteccion de secretos en texto mediante clasificacion de tokens, con cinco tipos de salida: `password`, `api_key`, `token`, `private_key` y `generic`.
- Umbrales de decision configurables (por defecto 0,5), con puntuacion de confianza por deteccion.
- Localizacion precisa de cada secreto con offsets de inicio y fin (`start`/`end`) sobre el texto original.
- Multilingue: funciona sobre documentacion, correos, chats y tickets en ingles, polaco, aleman, espanol y frances.
- Deteccion a nivel de byte sin tokenizador, lo que evita fallos por vocabulario fuera de dominio.
- Disponible como libreria Python (`SecretDetector.scan`) y como CLI con enmascarado de valores por defecto (`--show` para revelarlos) y codigo de salida 1 cuando encuentra secretos, util para integrarlo en CI/CD.
- Ignora patrones benignos como `os.environ['DB_PASSWORD']`, reduciendo falsos positivos en codigo.

## Casos de uso

- Prevencion de fugas en CI/CD: integrarlo como paso previo al commit o en el pipeline para escanear diffs y ficheros; el codigo de salida 1 de la CLI permite bloquear el build automaticamente si se detecta un secreto.
- Auditoria de repositorios historicos: escaneo masivo de repos Git corporativos en busca de credenciales olvidadas, aprovechando los 138 KB/s por nucleo en CPU sin infraestructura de GPU.
- Filtrado de correos y tickets de soporte: detectar contrasenas que los usuarios comparten por error en emails o chats antes de que se almacenen o reenvien, gracias a su rendimiento en documentacion (F1 0,94).
- Analisis de logs y ficheros de configuracion: identificar claves de API y tokens filtrados en logs de aplicacion o ficheros `.env` subidos por descuido.
- Cumplimiento normativo y DLP: incorporarlo en sistemas de prevencion de perdida de datos para escanear documentos y comunicaciones en varios idiomas europeos.
- Herramientas de seguridad para desarrolladores: embeberlo en plugins de editor o extensiones de pre-commit, dado su tamano minimo (97 KB) y ausencia de dependencias pesadas.
- Escaneo en entornos restringidos: su ejecucion con solo `numpy` y `onnxruntime` lo hace viable en contenedores minimalistas, maquinas sin GPU o entornos air-gapped.

## Benchmarks y rendimiento

Resultados publicados por el autor (offline, un nucleo de CPU, modelos int8, umbral 0,5):

| Modelo | Tamano | CredData F1 | GitHub issues F1 | Docs F1 | Velocidad |
|---|---|---|---|---|---|
| **cascade** (tiny → default + large) | 0,7 MB | 0,89 | 0,85 | **0,94** | 138 KB/s |
| tiny (`onnx/tiny`) | 97 KB | 0,87 | 0,85 | **0,94** | 137 KB/s |
| default (`onnx/default`) | 219 KB | 0,88 | **0,87** | 0,93 | 66 KB/s |
| CredSweeper 1,19 * | 12 MB | 0,94 | 0,79 | 0,41 | 230 KB/s |
| detect-secrets 1,5 | 1,1 MB | 0,57 | 0,48 | 0,32 | 155 KB/s |
| gitleaks 8 | 23 MB | 0,44 | 0,69 | 0,25 | 958 KB/s |

CredData corresponde a 64 repositorios reservados (held-out) de Samsung CredData; GitHub issues al conjunto de Ahmed et al. 2025 (arXiv:2410.23657); Docs a correos, chats y tickets sinteticos en 5 idiomas. * CredSweeper fue entrenado sobre todo CredData, por lo que su puntuacion en CredData no es held-out.

## Requisitos de hardware

- No requiere GPU: el modelo esta disenado para ejecutarse en un solo nucleo de CPU.
- Memoria: al ocupar entre 97 KB y 0,7 MB de pesos int8, el consumo de RAM es minimo (no se publica una cifra exacta).
- Cualquier maquina moderna sirve; no hay requisitos de GPU dedicadas (no aplican A100, H100 ni RTX 4090).
- Dependencias de software: Python, `numpy` y `onnxruntime>=1.17`.
- Despliegue: descarga directa desde Hugging Face con `huggingface-cli`; uso como libreria Python o CLI (`python -m password_detector`). No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo.
- Rendimiento medido: 138 KB/s en cascada, 137 KB/s en tiny y 66 KB/s en default, por nucleo de CPU.

## Comparativa con modelos similares

| Herramienta | Tamano | CredData F1 | GitHub issues F1 | Docs F1 | Velocidad | Licencia |
|---|---|---|---|---|---|---|
| password-detector (cascade) | 0,7 MB | 0,89 | 0,85 | 0,94 | 138 KB/s | Apache 2,0 |
| CredSweeper 1,19 | 12 MB | 0,94* | 0,79 | 0,41 | 230 KB/s | no disponible |
| detect-secrets 1,5 | 1,1 MB | 0,57 | 0,48 | 0,32 | 155 KB/s | no disponible |
| gitleaks 8 | 23 MB | 0,44 | 0,69 | 0,25 | 958 KB/s | no disponible |

\* CredSweeper fue entrenado sobre todo CredData, por lo que su puntuacion no es comparable directamente (no held-out).

La ventaja de password-detector frente a las alternativas basadas en reglas es su F1 en documentacion (0,94 frente a 0,41 de CredSweeper y 0,32 de detect-secrets), mientras que gitleaks es mas rapido (958 KB/s) pero con F1 notablemente inferior en CredData y Docs.

## Limitaciones y advertencias

- Contrasenas en prosa con formulacion inusual (PINs cortos, frases tipo "access code X") pueden quedar por debajo del umbral de 0,5 y no detectarse.
- Cadenas hexadecimales y UUIDs junto a palabras como `secret` pueden generar falsos positivos.
- No verifica los tokens contra los proveedores reales ni detecta secretos divididos en varias lineas.
- Los datos de entrenamiento incluyen repositorios de CredData y texto sintetico; el autor declara que no se uso ningun benchmark de evaluacion, pero no se publican detalles completos de composicion del dataset.
- No es un modelo generativo ni un clasificador de texto general: su ambito es exclusivamente la deteccion de secretos.
- La licencia Apache 2,0 no impone restricciones relevantes para uso comercial, aunque conviene revisar el fichero LICENSE del repositorio.
- Al tratarse de un modelo entrenado, su rendimiento en dominios muy distintos de los evaluados (por ejemplo, binarios, formatos comprimidos o idiomas fuera de los cinco soportados) no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bardsai/password-detector
- Samsung CredData (dataset de evaluacion): https://github.com/Samsung/CredData
- Paper de referencia (Ahmed et al. 2025, conjunto GitHub issues): https://arxiv.org/abs/2410.23657
