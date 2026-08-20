# RedHatAI/starcoder2-7b-quantized.w8a8

## Resumen

RedHatAI/starcoder2-7b-quantized.w8a8 es una version cuantizada del modelo StarCoder2-7B, desarrollada por Neural Magic y publicada bajo la organizacion RedHatAI en HuggingFace. El modelo original, creado por el proyecto BigCode, es un modelo de generacion de codigo con 7.400 millones de parametros, entrenado sobre The Stack v2, que cubre mas de 600 lenguajes de programacion. Esta version especifica aplica cuantizacion W8A8 (INT8 tanto en pesos como en activaciones), lo que reduce los requisitos de memoria GPU aproximadamente un 50 % y duplica el rendimiento de computo de multiplicacion de matrices en comparacion con la version original de 16 bits.

La relevancia de este modelo radica en que permite desplegar un modelo de generacion de codigo de 7B en hardware mas modesto sin una perdida significativa de calidad: alcanza un pass@1 de 33.9 en HumanEval frente a los 34.9 del modelo original, lo que supone una recuperacion del 97.1 %. Es una opcion practica para entornos de produccion donde la latencia y el uso de memoria son criticos, y se integra directamente con el backend vLLM para inferencia eficiente.

La arquitectura subyacente es un transformer decoder-only con Grouped Query Attention (GQA), una ventana de contexto de 16.384 tokens y sliding window attention de 4.096 tokens, tal como el modelo base. Esta version cuantizada mantiene esas capacidades estructurales, pero con los pesos y activaciones de las capas lineales representados en INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention y sliding window attention |
| Parametros totales | 7.400.416.256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | W8A8 (INT8 en pesos y activaciones) |
| Idiomas soportados | Codigo en mas de 600 lenguajes de programacion; texto natural limitado (no es un modelo multilingue general) |
| Licencia | BigCode OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base StarCoder2-7B es un transformer autoregresivo con 7B parametros, entrenado en el dataset The Stack v2, que contiene mas de 600 lenguajes de programacion, junto con texto natural de fuentes como Wikipedia, Arxiv y GitHub Issues. La arquitectura emplea Grouped Query Attention para reducir el coste de memoria de la atencion y una ventana de contexto de 16.384 tokens con sliding window attention de 4.096 tokens para gestionar secuencias largas de forma eficiente.

La version cuantizada fue obtenida mediante el algoritmo GPTQ, aplicado con la libreria llm-compressor de Neural Magic. El proceso de cuantizacion convierte los pesos de las capas lineales de los bloques transformer a INT8 con un esquema simetrico estatico por canal, mientras que las activaciones se cuantizan con un esquema simetrico dinamico por token. Se utilizaron 256 secuencias de 8.192 tokens aleatorios para la calibracion. El resultado es un modelo con aproximadamente la mitad de requisitos de memoria y el doble de rendimiento de computo de matrices respecto al original, con una perdida minima de calidad en la generacion de codigo.

## Capacidades

- Generacion de codigo: el modelo es capaz de completar y generar codigo fuente en una amplia variedad de lenguajes de programacion, incluyendo Python, Java, C++, JavaScript, TypeScript, Go y Rust, entre otros.
- Autocompletado de codigo: optimizado para la generacion de codigo a partir de un contexto dado, como funciones incompletas o bloques de codigo parciales.
- Soporte de multiples lenguajes: entrenado en mas de 600 lenguajes, aunque el rendimiento es mejor en los mas comunes.
- Razonamiento de codigo: puede generar soluciones a problemas de programacion de nivel basico y intermedio, como se evalua en benchmarks de HumanEval.
- No es un modelo de instrucciones: no responde bien a comandos como "Escribe una funcion que calcule la raiz cuadrada", ya que no fue entrenado para seguir instrucciones de forma conversacional.
- No soporta tool calling ni function calling, ni tampoco modo de pensamiento (thinking mode), vision o audio.

## Casos de uso

- Autocompletado de codigo en IDEs y editores: el modelo puede integrarse en extensiones de Visual Studio Code o JetBrains para sugerir completaciones de codigo en tiempo real, gracias a su baja latencia de inferencia y su capacidad para generar codigo coherente a partir del contexto.
- Generacion de codigo en pipelines de CI/CD: puede usarse en entornos de integracion continua para generar pruebas unitarias, documentacion de funciones o incluso codigo de scaffolding, con el beneficio de requerir menos recursos que el modelo original.
- Asistente de programacion para desarrolladores: aunque no es un modelo de instrucciones, puede usarse como un asistente de codigo en tareas de programacion especificas, como completar funciones o generar implementaciones de algoritmos conocidos, mediante prompts cuidadosamente formulados.
- Migracion de codigo entre lenguajes: el modelo puede ayudar a traducir o portar codigo entre lenguajes de programacion, aunque no es su funcion principal y los resultados pueden requerir revision.
- Generacion de documentacion de codigo: puede generar comentarios y documentacion a partir de funciones o bloques de codigo, aunque la calidad puede variar.
- Educacion y aprendizaje: puede usarse como herramienta de aprendizaje para estudiantes de programacion, generando ejemplos de codigo para problemas clasicos, aunque no debe sustituir a un tutor humano.
- Despliegue en entornos con recursos limitados: la cuantizacion W8A8 permite ejecutar el modelo en GPUs de gama media, como la RTX 3060 o RTX 4070, lo que facilita su uso en entornos de desarrollo local sin acceso a infraestructura de alta gama.

## Benchmarks y rendimiento

El modelo fue evaluado en los benchmarks HumanEval y HumanEval+, con la configuracion de generacion del Big Code Models Leaderboard. Los resultados oficiales son:

| Benchmark | starcoder2-7b (sin cuantizar) | starcoder2-7b-quantized.w8a8 (este modelo) | Recuperacion |
|---|---|---|---|
| HumanEval pass@1 | 34.9 | 33.9 | 97.1 % |
| HumanEval pass@10 | 50.7 | 50.9 | 100.4 % |
| HumanEval+ pass@1 | no disponible | 29.3 | - |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion INT8 reduce los requisitos de memoria aproximadamente a la mitad del modelo original. Para el modelo de 7B, se estima que la inferencia requiere aproximadamente 4-5 GB de VRAM en FP16, y con la cuantizacion W8A8 se reduce a unos 2-3 GB. Sin embargo, el modelo en formato safetensors ocupa 7.9 GB en disco, por lo que se recomienda al menos 8 GB de VRAM para cargarlo en memoria.
- GPU recomendadas: GPU de gama media como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) o superiores. Tambien puede ejecutarse en A100, H100 o cualquier GPU con suficiente VRAM.
- Consumer GPU: si cabe en GPU de consumo de 8 GB o mas, como la RTX 3060 o la RTX 4060, aunque con menor rendimiento que en GPUs de mayor VRAM.
- Opciones de despliegue: vLLM es el backend recomendado para una inferencia eficiente, con soporte para OpenAI-compatible serving. Tambien puede desplegarse con TGI (Text Generation Inference) y con la libreria transformers estandar.
- Latencia y throughput: no se han publicado datos de latencia especificos. La cuantizacion W8A8 ofrece aproximadamente el doble de rendimiento de multiplicacion de matrices que el modelo FP16, lo que se traduce en menor latencia por token y mayor throughput en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| starcoder2-7b (original) | 7.4B | 16.384 | 34.9 | bigcode-openrail-m | FP16 |
| starcoder2-7b-quantized.w8a8 (este modelo) | 7.4B | 16.384 | 33.9 | bigcode-openrail-m | INT8 W8A8 |
| starcoder2-7b-quantized.w8a16 | 7.4B | 16.384 | 34.6 | bigcode-openrail-m | INT8 W8A16 |
| CodeLlama-7B | 6.7B | 16.384 | 30.5 | Llama 2 license | FP16 |
| DeepSeek-Coder-6.7B | 6.7B | 16.384 | 28.6 | DeepSeek License | FP16 |

La comparativa muestra que este modelo cuantizado mantiene un rendimiento muy cercano al modelo original, y superior a otros modelos de codigo de tamano similar, a la vez que ofrece una ventaja clara en eficiencia de inferencia.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no responde bien a prompts de lenguaje natural que no sean de codigo, y no debe usarse como asistente conversacional o de chat.
- Sesgos y calidad: al estar entrenado en codigo de codigo abierto, puede heredar sesgos y malas practicas de programacion presentes en el dataset.
- Alucinacion: como todos los modelos de lenguaje, puede generar codigo incorrecto o inexistente, especialmente en APIs o funciones menos comunes.
- Limitaciones de idioma: el modelo no esta pensado para texto natural multilingue, y su rendimiento en generacion de texto fuera de codigo es muy limitado.
- Licencia: la licencia bigcode-openrail-m es de uso libre para fines comerciales y de investigacion, pero se recomienda revisar los terminos completos para cumplir con las obligaciones de atribucion y uso responsable.
- La cuantizacion W8A8 puede introducir pequenas degradaciones en la calidad del codigo generado, aunque la recuperacion es del 97.1 % en HumanEval.

## Enlaces

- HuggingFace: https://huggingface.co/RedHatAI/starcoder2-7b-quantized.w8a8
- Modelo original: https://huggingface.co/bigcode/starcoder2-7b
- Repositorio de StarCoder2 en GitHub: https://github.com/bigcode-project/starcoder2
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Paper de HumanEval: https://arxiv.org/abs/2107.03374
- Paper de HumanEval+: https://arxiv.org/abs/2305.01210
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
