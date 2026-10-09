# slendermantvb/jarvis-v2.4.1

## Resumen

Jarvis v2.4.1 es un modelo de lenguaje experimental de aproximadamente 79 millones de parametros (78.846.484 segun los pesos en safetensors) desarrollado por el usuario slendermantvb y publicado en HuggingFace. Se trata de un proyecto de investigacion y aprendizaje, no de un modelo de produccion, disenado para ejecutarse de forma local. Emplea una arquitectura transformer con atencion de KV latente, RoPE, activacion SwiGLU y una capa de mezcla de expertos (MoE) compacta de 4 expertos con enrutamiento Top-2 y un experto compartido.

El modelo forma parte de una aplicacion local mas amplia denominada Jarvis, que anade enrutamiento por aprendizaje automatico, razonamiento simbolico en Lisp, RAG, verificacion de codigo y memoria estilo Reflexion. Es importante subrayar que esos componentes de ejecucion no estan incluidos en este repositorio: aqui solo se distribuye el checkpoint neuronal base junto con el codigo minimo para cargarlo en PyTorch.

Su relevancia es limitada pero clara en el nicho de modelos ultracompactos y experimentales: con solo 512 tokens de contexto y 79M de parametros, es un banco de pruebas para tecnicas como MoE de bajo coste, prediccion multi-token y atencion de KV latente. Esta publicado bajo licencia Apache 2.0, soporta espanol e ingles, y en el momento de la consulta acumulaba 0 descargas y 1 me gusta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion de KV latente, RoPE y SwiGLU, con capa MoE |
| Parametros totales | 78.846.484 (~79M) |
| Parametros activos | no disponible (MoE de 4 expertos con enrutamiento Top-2 y experto compartido; no se detalla el numero de parametros activos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se documentan cuantizaciones GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | espanol (es) e ingles (en) |
| Licencia | Apache 2.0 (con obligaciones de terceros sobre los datos de entrenamiento) |
| Formato de pesos | safetensors (PyTorch) |

Datos arquitectonicos adicionales declarados en la model card: vocabulario de 16.000 tokens, tamano oculto de 512, 10 capas, 8 cabezas de atencion, dimension latente de KV de 128, tamano de feed-forward de 1.365, profundidad de prediccion multi-token de 2.

## Arquitectura y entrenamiento

La arquitectura es un transformer compacto que combina varios elementos: un bloque de atencion con KV latente (que proyecta claves y valores a una dimension reducida de 128, reduciendo coste de memoria), codificacion posicional rotatoria (RoPE), funcion de activacion SwiGLU en las capas feed-forward y una capa de mezcla de expertos con 4 expertos, enrutamiento Top-2 y un experto compartido siempre activo. Ademas incorpora prediccion multi-token con profundidad 2, es decir, el modelo predice mas de un token por paso. Todo ello se implementa en PyTorch mediante codigo propio (`model.py`, `config.py`, `inference.py`).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de ajuste como RLHF, DPO o SFT. La model card si menciona que el corpus de preentrenamiento original incluye texto de Wikimedia/Wikipedia, sujeto a licencias CC BY-SA y, segun el material, GFDL. Tampoco se documentan innovaciones de decodificacion (por ejemplo decodificacion especulativa) mas alla de la propia prediccion multi-token y del bloque de KV latente.

## Capacidades

- Generacion de texto en espanol e ingles.
- Soporte de razonamiento simbolico en Lisp y componentes de IA simbolica, aunque integrados en la aplicacion Jarvis completa, no en el checkpoint neuronal aislado.
- RAG (generacion aumentada por recuperacion) y verificacion de codigo, de nuevo como partes de la aplicacion local, no del modelo base.
- Memoria estilo Reflexion, declarada como componente de ejecucion adicional.
- Enrutamiento mediante aprendizaje automatico y prediccion multi-token (profundidad 2).
- No se documenta soporte explicito de tool calling ni function calling en el checkpoint.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito ("thinking mode").
- Capacidades multilingues limitadas a espanol e ingles.

## Casos de uso

- Experimentacion academica con arquitecturas MoE compactas: permite estudiar el comportamiento de una capa MoE de 4 expertos con enrutamiento Top-2 y experto compartido en un modelo de 79M de parametros que cabe en cualquier equipo.
- Pruebas de tecnicas de eficiencia de atencion: su bloque de KV latente de dimension 128 es util para medir ahorro de memoria en inferencia frente a atencion tradicional.
- Prototipado de asistentes locales de bajo consumo: al ser tan pequeno, puede ejecutarse en CPU o GPU integrada para demos de generacion de texto en espanol e ingles.
- Banco de pruebas de prediccion multi-token: la profundidad 2 permite investigar el impacto de predecir varios tokens por paso en latencia y calidad.
- Educacion y docencia: el codigo minimo (`model.py`, `inference.py`) sirve como ejemplo didactico de implementacion de un transformer MoE desde cero en PyTorch.
- Base para aprendizaje y experimentacion con IA simbolica: aunque el checkpoint no incluye el motor Lisp, el proyecto completo muestra como hibridar razonamiento simbolico con una red neuronal pequena.
- Pruebas de verificacion determinista y anti-alucinacion: util para quien quiera replicar el enfoque de verificacion externa que el autor emplea en la aplicacion completa (las suites locales dieron 540/540 en programacion y 120/120 en anti-alucinacion, siempre como pruebas propias del proyecto).
- Ejemplo de publicacion y empaquetado de modelos: resulta util como referencia de estructura de repositorio (config, tokenizer, pesos y codigo de inferencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta pruebas locales propias del proyecto:

| Prueba local | Resultado |
|---|---|
| Suite de programacion | 540 / 540 |
| Suite anti-alucinacion | 120 / 120 |

Estos resultados son benchmarks locales especificos del proyecto y, tal y como advierte el propio autor, no deben interpretarse como una precision del 100 % en programacion, factualidad, razonamiento o tareas generales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: con 79M de parametros, en FP16 el checkpoint ocupa aproximadamente 158 MB y en FP32 unos 315 MB; en cuantizaciones de 8 y 4 bits (si se generaran) rondaria los 79 MB y 40 MB respectivamente.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de gama alta. Funciona en tarjetas integradas y en CPU.
- Caben en GPU de consumo: si, en practicamente todas, incluidas GTX serie 10, RTX 3060, RTX 4090 y similares. Incluso cabe holgadamente en memoria unificada de equipos tipo Apple Silicon.
- Opciones de despliegue: el repositorio proporciona inferencia minima en PyTorch (`inference.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jarvis v2.4.1 (slendermantvb) | ~79M | 512 tokens | Apache 2.0 | MoE de 4 expertos, KV latente, es/en, experimental |
| SmolLM-135M | ~135M | 2.048 tokens | Apache 2.0 | Transformer denso pequeno, orientado a ingles |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | Apache 2.0 (segun variante) | Modelo multilingue compacto ampliamente usado |
| TinyLlama-1.1B | ~1.100M | 2.048 tokens | Apache 2.0 | Transformer denso de referencia en la gama sub-2B |

Nota: los valores de los modelos comparativos corresponden a especificaciones publicas habitualmente conocidas y se ofrecen como referencia orientativa; la comparacion de rendimiento no es posible porque no hay benchmarks publicados para Jarvis v2.4.1. Jarvis destaca por ser notablemente mas pequeno y por usar MoE en lugar de un transformer denso, a costa de un contexto mucho mas reducido (512 tokens frente a miles en los alternativos).

## Limitaciones y advertencias

- Es un proyecto de investigacion y aprendizaje; el autor advierte que puede producir respuestas incorrectas, incompletas o incoherentes.
- Ventana de contexto muy reducida (512 tokens), restrictiva para documentos largos y bases de codigo extensas.
- Las salvaguardas de la aplicacion completa (verificacion determinista, recuperacion externa) no estan presentes al usar solo el checkpoint neuronal de este repositorio.
- Riesgo de alucinacion elevado por su tamano y por la ausencia de fases de ajuste documentadas; el propio autor incluye una suite anti-alucinacion porque el problema es relevante.
- Sesgos conocidos: no documentados explicitamente, pero al entrenarse parcialmente con texto de Wikimedia/Wikipedia puede heredar los sesgos de dichas fuentes.
- Limitaciones de idioma: solo espanol e ingles declarados.
- Restricciones de licencia: el codigo y los artefactos propios se liberan bajo Apache 2.0, pero los datos de preentrenamiento incluyen contenido de Wikimedia/Wikipedia sujeto a CC BY-SA y, segun el material, GFDL. Apache 2.0 no sustituye ni anula esas obligaciones de terceros; consultar el archivo `NOTICE` del repositorio.
- Caveat de produccion: con 0 descargas y un unico "me gusta" en el momento de la consulta, no existe validacion independiente de la comunidad ni ecosistema de herramientas (cuantizaciones, integraciones) alrededor del modelo.
- No hay datos publicados sobre cuantizaciones, throughput ni latencia, lo que dificulta planificar su despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slendermantvb/jarvis-v2.4.1

Enlaces encontrados en la busqueda web (proyectos distintos que comparten el nombre Jarvis, no relacionados con este modelo):
- OpenJarvis (GitHub): https://github.com/open-jarvis/OpenJarvis
- OpenJarvis (Stanford): https://openjarvis.stanford.edu/
- Jarvis (aplicacion de escritorio): https://jarvisapp.in/
- J.A.R.V.I.S V2 (GitHub): https://github.com/Blazehue/J.A.R.V.I.S
- Open-Jarvis (pagina del proyecto): https://fedcal.github.io/open-jarvis/en/
