# daveycodez/LFM3-1.7B-Web-ONNX

## Resumen

LFM3-1.7B-Web-ONNX es una compilacion ONNX cuantizada a 4 bits del modelo LFM3-1.7B de Liquid AI, publicada por el usuario daveycodez como build comunitario no oficial. Su proposito es permitir la inferencia del modelo directamente en el navegador mediante Transformers.js y WebGPU, incluyendo Safari en iPhone. El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros desarrollado por Liquid AI, disenado para generacion de texto conversacional con soporte de tool calling y modo de razonamiento (thinking tokens).

La relevancia de esta build radica en las optimizaciones aplicadas sobre la version oficial de onnx-community: re-cuantizacion GPTQ de los pesos a 4 bits con block size 32, reduccion del vocabulario de 128.000 a 49.012 tokens BPE, recorte de las caches rotatorias de 262.144 a 16.384 posiciones y reescritura del grafo para habilitar flash attention en las capas de ventana deslizante. El resultado es un archivo de pesos de 900 MB frente a los 1.088 MB de la version original, con mejor acuerdo top-1 respecto a fp16 (89,1 % frente a 81,0 %) y mejor tasa de tool calling directo (20/20 frente a 13/20).

El modelo esta pensado para aplicaciones web que necesiten procesamiento de lenguaje natural sin depender de servidores externos, con la consiguiente privacidad de datos y ausencia de costes de inferencia en la nube. La licencia LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3 de Liquid AI) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (recortado desde 262.144 en esta build) |
| Tipos de cuantizacion | 4 bits (q4f16), GPTQ para matrices, block size 32; proyecciones gate/up/q/k/v simetricas sin zero points |
| Idiomas soportados | no disponible (el recorte de vocabulario penaliza especialmente el texto no ingles) |
| Licencia | LFM Open License v1.0 (uso comercial solo para entidades con ingresos anuales < 10 M USD) |
| Formato de pesos | ONNX (model_q4f16.onnx_data, 900.061.184 bytes) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer decoder-only de Liquid AI con 1.700 millones de parametros. La arquitectura incluye cinco capas de atencion de ventana deslizante con ventana de 256 tokens, que en esta build se implementan mediante una mascara de atencion explicita en lugar del parametro `local_window_size` de `GroupQueryAttention`, lo que permite a onnxruntime-web aplicar kernels de flash attention y reducir el uso de memoria. El modelo emplea embeddings compartidos entre la capa de entrada y el LM head (tied embeddings).

El entrenamiento original del modelo base no esta documentado en la informacion disponible. Esta build comunitaria aplica re-cuantizacion GPTQ sobre el modelo ONNX en fp16, con datos de calibracion de aproximadamente 36.000 tokens procedentes del split de entrenamiento de WikiText-2 y de respuestas de chat generadas por el modelo fp16. No se incluye texto de calibracion en los archivos publicados. Las innovaciones tecnicas de esta build incluyen: re-cuantizacion de todos los pesos `MatMulNBits` y del embedding/LM head a 4 bits con block size 32; recorte del vocabulario preservando todos los tokens de byte y tokens especiales (chat, tool-call, thinking); eliminacion de una copia redundante del embedding compartido en el grafo ONNX; y sustitucion del parametro de ventana local por una mascara de atencion para habilitar flash attention.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking (tokens especiales de pensamiento preservados en el vocabulario).
- Tool calling / function calling (20/20 prompts respondidos con llamada directa a herramienta en las pruebas del autor).
- Generacion de codigo y matematicas (capacidades heredadas del modelo base, sin benchmarks publicados en esta build).
- Tokenizacion completa a nivel de byte: cualquier texto puede tokenizarse y decodificarse exactamente, aunque palabras poco frecuentes se fragmentan en mas tokens.
- Inferencia en navegador via Transformers.js con WebGPU, incluyendo Safari en iPhone.
- Capacidades multilingues: no disponibles de forma fiable tras el recorte de vocabulario; el texto no ingles requiere mas tokens.

## Casos de uso

- Asistente conversacional en navegador: el modelo puede gestionar conversaciones multi-turno directamente en el cliente mediante Transformers.js y WebGPU, sin enviar datos a un servidor, lo que garantiza privacidad total del usuario. Adecuado para aplicaciones de chat integradas en webs que no quieran depender de APIs externas.
- Herramientas de productividad offline: integracion en aplicaciones web progresivas (PWA) que funcionen sin conexion, usando el modelo para resumir texto, redactar correos o generar respuestas, con la ventaja de que los datos nunca abandonan el dispositivo.
- Automatizacion con tool calling en el cliente: el modelo puede invocar funciones JavaScript del navegador (por ejemplo, consultar una API local, manipular el DOM o acceder a IndexedDB) gracias a su soporte de tool calling y a los tokens especiales preservados en el vocabulario recortado.
- Educacion y demos interactivas: despliegue de demos de IA generativa en paginas web sin coste de servidor, usando WebGPU para acelerar la inferencia en GPUs de consumo integradas o dedicadas.
- Prototipado rapido de agentes: el modo thinking y el soporte de tool calling permiten construir agentes multi-paso que razonan y ejecutan acciones dentro del navegador, utiles para validar flujos antes de migrar a infraestructura servidor.
- Procesamiento de texto en dispositivos moviles: la build esta optimizada para Safari en iPhone, lo que permite ofrecer funciones de generacion de texto en aplicaciones web moviles sin backend, con un archivo de pesos de 900 MB que se cachea tras la primera carga.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor de la build, comparando con la version original q4f16 de onnx-community y con fp16 como referencia:

| Metrica | Original q4f16 | Esta build |
|---|---|---|
| Tamano de `model_q4f16.onnx_data` | 1.087.789.056 bytes | 900.061.184 bytes (−188 MB) |
| Perplejidad WikiText-2 (por token original; fp16: 24,87) | 27,10 | 29,17 |
| Acuerdo top-1 con fp16 en prompts de chat | 81,0 % | 89,1 % |
| Divergencia KL respecto a fp16 en prompts de chat | 0,153 | 0,083 |
| Prompts respondidos con tool call directo (fp16: 20/20) | 13/20 | 20/20 |
| Longitud maxima de secuencia | 262.144 | 16.384 |

Mediciones realizadas con onnxruntime 1.31. La perplejidad se calcula por token original para comparar vocabularios de forma justa; la perplejidad mas alta en WikiText se debe principalmente a palabras poco frecuentes que el vocabulario reducido fragmenta. En un Mac, los buffers de GPU en pico para un prompt de 2.859 tokens pasaron de 1.575 MB a 1.342 MB, y los prompts de esa longitud se procesan aproximadamente un 5 % mas rapido. La perdida de next-token sobre un prompt de 2.000 tokens en WebGPU paso de 3,0031 a 3,0009 y de 3,4849 a 3,4882 en dos textos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 900 MB; en WebGPU los buffers de GPU en pico alcanzan aproximadamente 1.342 MB para un prompt de 2.859 tokens (medido en un Mac). Para prompts mas cortos, el uso de memoria es proporcionalmente menor.
- GPU recomendadas: cualquier GPU compatible con WebGPU. En el ecosistema de navegador, GPUs integradas modernas (Apple Silicon, Intel Iris Xe, AMD Radeon integradas) y dedicadas (NVIDIA RTX serie 30/40, AMD RX 6000/7000) son adecuadas. En iPhone, Safari con WebGPU.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo con soporte WebGPU puede ejecutar el modelo, dado el reducido tamano de pesos (900 MB) y los buffers de atencion optimizados.
- Opciones de despliegue: Transformers.js con `dtype: "q4f16"` y `device: "webgpu"`; tambien puede ejecutarse con onnxruntime-web directamente. No esta pensado para vLLM, llama.cpp, Ollama o TGI, que requieren formatos distintos (GGUF, safetensors).
- Latencia y throughput: no disponibles de forma sistematica. El autor reporta una mejora de aproximadamente el 5 % en velocidad de procesamiento de prompts largos (2.859 tokens) respecto a la build original, gracias a la reduccion de buffers y al uso de flash attention en las capas de ventana deslizante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Web-ONNX (esta build) | 1,7 B | 16.384 | ONNX q4f16 | LFM Open License v1.0 | Hugging Face (comunidad) |
| onnx-community/LFM3-1.7B-ONNX | 1,7 B | 262.144 | ONNX q4f16 | LFM Open License v1.0 | Hugging Face (oficial ONNX) |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | safetensors | LFM Open License v1.0 | Hugging Face (oficial) |

La comparativa con modelos de otros fabricantes en el mismo rango de tamano y orientados a navegador no esta disponible en la informacion proporcionada. La diferencia principal frente a la version oficial ONNX es el recorte de contexto (16.384 frente a 262.144), el menor tamano de pesos y la mejora en tool calling y acuerdo top-1, a costa de una perplejidad ligeramente superior en WikiText-2.

## Limitaciones y advertencias

- Contexto limitado a 16.384 tokens en esta build; secuencias mas largas fallan con un error explicito. La version original soporta hasta 262.144.
- El recorte de vocabulario de 128.000 a 49.012 tokens fragmenta palabras poco frecuentes y penaliza especialmente el texto no ingles, que requiere mas tokens y puede degradar la calidad.
- Perplejidad en WikiText-2 superior a la build original (29,17 frente a 27,10), aunque el autor atribuye la diferencia principalmente a la fragmentacion de palabras raras.
- Build no oficial: no esta revisada ni respaldada por Liquid AI; el autor no garantiza soporte ni actualizaciones.
- Licencia LFM Open License v1.0: el uso comercial solo esta permitido para entidades con ingresos anuales inferiores a 10 millones de dolares. Verificar los terminos antes de cualquier despliegue comercial.
- Riesgo de alucinacion inherente a modelos de 1,7 B de parametros; no se han publicado evaluaciones de sesgo en la informacion disponible.
- La inferencia en navegador depende de WebGPU, que no esta disponible en todos los navegadores ni dispositivos; se requiere un fallback o aviso al usuario.
- La primera carga del modelo implica descargar 900 MB de pesos; el almacenamiento en cache del navegador puede estar limitado.
- No se han publicado benchmarks estandar de calidad (MMLU, HumanEval, GSM8K) para esta build.

## Enlaces

- Hugging Face: https://huggingface.co/daveycodez/LFM3-1.7B-Web-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Build ONNX oficial: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Liquid AI: https://www.liquid.ai/
- Transformers.js: https://github.com/huggingface/transformers.js
- Licencia (LFM Open License v1.0): https://huggingface.co/daveycodez/LFM3-1.7B-Web-ONNX/blob/main/LICENSE
