# Samson0229/gpt2-pc8

## Resumen

`Samson0229/gpt2-pc8` es una version cuantizada de GPT-2 (124M parametros) preparada especificamente para su uso con transformers.js y ONNX Runtime. El autor, Samson0229, ha partido del modelo ONNX en fp32 publicado por Xenova (la version de referencia de GPT-2 para transformers.js) y ha aplicado cuantizacion dinamica de 8 bits por canal mediante `onnxruntime.quantization.quantize_dynamic(per_channel=True, weight_type=QInt8)`.

La diferencia clave respecto a la cuantizacion q8 estandar es que, al usar cuantizacion por canal en lugar de por tensor, las distribuciones de probabilidad del modelo resultante se mantienen mas proximas a las del modelo original en fp32, sin incrementar el tamano del archivo. Esto lo hace util en escenarios donde la fidelidad de las probabilidades del siguiente token importa, como demos educativas o visualizaciones de como un modelo de lenguaje elige la siguiente palabra.

El modelo no aporta arquitectura ni entrenamiento nuevos: es una conversion puramente de formato y precision sobre GPT-2 original de OpenAI. Su relevancia es practica para el ecosistema de inferencia en navegador y Node.js con transformers.js, donde el peso del modelo y la fidelidad numerica son factores criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124M (heredados de GPT-2 base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | QInt8 dinamica por canal (per_channel=True) |
| Idiomas soportados | no disponible (GPT-2 esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

El modelo subyacente es GPT-2, un transformer decoder-only con 12 capas, 12 cabezas de atencion y una dimension oculta de 768, entrenado por OpenAI sobre un corpus de aproximadamente 40 GB de texto en ingles (WebText). No se ha realizado ningun entrenamiento adicional ni ajuste fino: el repositorio solo contiene una conversion del checkpoint original a ONNX y su posterior cuantizacion.

La innovacion tecnica del repositorio reside exclusivamente en el proceso de cuantizacion. Frente a la cuantizacion q8 convencional, que calcula un unico factor de escala por tensor de pesos, la cuantizacion por canal asigna una escala distinta a cada canal (fila o columna) del tensor. Esto reduce el error de cuantizacion en pesos con distribuciones heterogeneas y, segun el autor, acerca las probabilidades de salida al modelo fp32 original manteniendo el mismo tamano de archivo que la version q8 estandar. No hay datos publicados sobre el proceso de calibracion ni sobre la metodologia de evaluacion de la fidelidad.

## Capacidades

- Generacion de texto autoregresiva basica en ingles.
- Prediccion de la siguiente palabra con probabilidades cercanas al modelo fp32 original, gracias a la cuantizacion por canal.
- Inferencia en navegador y en Node.js mediante transformers.js y ONNX Runtime Web.
- Ejecucion sin GPU en entornos con recursos limitados, al tratarse de un modelo de 124M parametros cuantizado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento explicito.
- No dispone de capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues muy limitadas, derivadas del entrenamiento original de GPT-2 en ingles.

## Casos de uso

- Demos educativas sobre seleccion de tokens: el modelo esta pensado por el autor para una "speeltuin" (parque de juegos) educativa que muestra como un modelo de lenguaje elige el siguiente token; la cuantizacion por canal garantiza que las probabilidades mostradas sean fieles al modelo original.
- Inferencia en navegador sin backend: al ser un ONNX de unos 0,1 GB, puede cargarse en el cliente con transformers.js para prototipos de autocompletado o generacion de texto sin enviar datos a un servidor.
- Visualizacion de distribuciones de probabilidad: util para herramientas que muestran el top-k de tokens candidatos y sus probabilidades en cada paso, donde la fidelidad numerica de la cuantizacion importa.
- Prototipado rapido de pipelines de generacion de texto: sirve como sustituto ligero de GPT-2 fp32 en fase de desarrollo antes de escalar a modelos mayores.
- Pruebas de integracion de transformers.js: permite validar el flujo `AutoModelForCausalLM.from_pretrained(repo, { dtype: "q8", model_file_name: "decoder_model" })` en aplicaciones web.
- Educacion sobre cuantizacion de modelos: el repositorio documenta de forma explicita el metodo de cuantizacion aplicado, lo que lo convierte en un ejemplo practico para ensenar diferencias entre cuantizacion por tensor y por canal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de perplejidad, MMLU, HumanEval ni comparaciones cuantitativas con la version q8 estandar o con el modelo fp32; solo afirma cualitativamente que las probabilidades estan "mas cerca" del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en QInt8 (el repositorio completo ocupa 0,1 GB, correspondiente al modelo cuantizado).
- GPU recomendadas: no se requiere GPU; el modelo esta disenado para ejecutarse en CPU mediante ONNX Runtime, incluido el navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada; tambien es viable en dispositivos moviles con ONNX Runtime Web.
- Opciones de despliegue: transformers.js (libreria declarada por el autor), ONNX Runtime y ONNX Runtime Web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es ONNX y no GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Samson0229/gpt2-pc8 | 124M | 1024 | ONNX QInt8 por canal | MIT | Cuantizacion por canal, orientada a fidelidad de probabilidades |
| Xenova/gpt2 | 124M | 1024 | ONNX fp32 y q8 | MIT | Modelo base del que deriva este repositorio; referencia para transformers.js |
| openai-community/gpt2 | 124M | 1024 | safetensors / PyTorch | MIT | Checkpoint original de OpenAI en precision completa |

La comparativa se limita a las variantes del mismo GPT-2, ya que no se dispone de datos de rendimiento publicados para este repositorio que permitan una comparacion cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus WebText de GPT-2, con sesgos de genero, raza y religion documentados en la literatura sobre GPT-2.
- Riesgo de alucinacion: alto, propio de un modelo de 124M parametros sin ajuste por RLHF; puede generar texto plausible pero facticamente incorrecto.
- Limitacion de contexto: ventana de 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitacion de idioma: el entrenamiento original es predominantemente en ingles; el rendimiento en castellano sera limitado y no hay evaluacion publicada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el usuario debe verificar las condiciones del modelo base de OpenAI.
- Caveat para produccion: el autor lo describe como una herramienta educativa ("educatieve speeltuin"), no como un modelo para cargas de produccion; no hay evaluacion de robustez ni de calidad de generacion publicada.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia, sin historial de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samson0229/gpt2-pc8
- Modelo base en Hugging Face: https://huggingface.co/openai-community/gpt2
- ONNX fp32 de referencia: https://huggingface.co/Xenova/gpt2
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de cuantizacion de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
