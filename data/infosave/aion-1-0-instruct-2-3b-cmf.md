# infosave/Aion-1.0-Instruct-2.3B-cmf

## Resumen

Aion-1.0-Instruct-2.3B-cmf es una distribucion cuantizada del modelo Microsoft Aion-1.0-Instruct-2.3B, un modelo de 2.300 millones de parametros disenado por Microsoft para ejecucion en dispositivo (on-device). El modelo base esta orientado a resumenes, reescritura de texto y conversacion en ocho idiomas (ingles, aleman, espanol, portugues, italiano, frances, chino y japones) con una ventana de contexto de 32.768 tokens. Esta version, publicada por el usuario infosave, empaqueta los pesos en el formato CMF (Cortiq Model Format) y en dos cuantizaciones: 8 bits por defecto y 4 bits GPTQ.

La relevancia de esta ficha reside en el motor de inferencia que acompana al formato: `cortiq`, un runtime escrito en Rust sin dependencias de Python ni de frameworks de machine learning, que soporta CUDA, Vulkan, DX12, Metal y CPU. Esto permite desplegar el modelo en hardware muy heterogeneo (GPUs NVIDIA, AMD, Intel, Apple Silicon y CPU pura) con un unico binario. Los datos medidos por el autor muestran que la cuantizacion de 8 bits mantiene la perplejidad practicamente identica a la referencia en bf16 (14,25 frente a 14,24 en WikiText-2) y que las respuestas greedy coinciden palabra por palabra con las de Transformers.

El paquete incluye mediciones de rendimiento detalladas sobre NVIDIA L4 (CUDA y Vulkan), MacBook Air M4 (Metal y CPU) y CPU Xeon, lo que lo convierte en una opcion interesante para escenarios de borde con recursos limitados y para evaluar el coste real de la cuantizacion en un modelo pequeno de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Microsoft Aion-1.0-Instruct-2.3B; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 2.300 millones (2,3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (ventana deslizante de 2.048 tokens segun las mediciones del autor) |
| Tipos de cuantizacion | 8 bits (q8_2f, por defecto) y 4 bits GPTQ con embeddings en 8 bits (q4tp) |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT |
| Formato de pesos | CMF (Cortiq Model Format); el modelo base esta en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo subyacente es Aion-1.0-Instruct-2.3B de Microsoft, un transformer de 2.300 millones de parametros orientado a tareas de resumen, reescritura y chat. La informacion proporcionada no detalla el numero de capas, la configuracion de atencion ni la composicion exacta del dataset de entrenamiento del modelo base; esos datos deben consultarse en la model card de Microsoft. Si se indica que el modelo usa una ventana de atencion deslizante de 2.048 tokens, ya que las mediciones de perplejidad se realizan "mas alla de la ventana deslizante de 2.048 tokens" con ventanas de 4.096.

La aportacion tecnica de esta publicacion es la cuantizacion y el empaquetado. Los pesos de 4 bits se redondearon con GPTQ sobre 4.096 tokens procedentes de WikiText-2, codigo y respuestas del propio modelo en su plantilla de chat, aplicando escalas por canal y un refinamiento especifico para codigo. El archivo de 8 bits (q8_2f) es la cuantizacion por defecto y, segun el autor, reproduce palabra por palabra las salidas greedy de Transformers en bf16 sobre CUDA, Vulkan y CPU. El motor `cortiq` renderiza la plantilla de chat del modelo y parsea sus llamadas a herramientas, lo que anade una capa de utilidad practica sobre el binario cuantizado.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas.
- Resumen de documentos y textos largos, con soporte de prompts de hasta 30.000 tokens medidos.
- Reescritura y reformulacion de texto (parafrasis, cambio de tono, simplificacion).
- Soporte de tool calling / function calling: el motor cortiq parsea las llamadas a herramientas del modelo y renderiza su plantilla de chat.
- Capacidades multilingues en ingles, aleman, espanol, portugues, italiano, frances, chino y japones.
- Ejecucion en dispositivo con backend CUDA, Vulkan, DX12, Metal y CPU.
- No se dispone de informacion sobre modo de razonamiento explicito (thinking), vision, audio ni otras capacidades especiales del modelo base en la informacion proporcionada.

## Casos de uso

- Resumen de documentos en el borde: el modelo puede resumir actas, correos o articulos de hasta decenas de miles de tokens en un portatil o en una GPU de consumo, gracias a la ventana de 32.768 tokens y a la cuantizacion de 4 bits que ocupa 1,41 GB en disco.
- Reescritura y correccion de estilo en herramientas ofimaticas: con 59,6 tok/s en un MacBook Air M4 mediante Metal, es viable integrarlo en un plugin de edicion de texto que reformule parrafos en tiempo casi interactivo sin conexion a la nube.
- Asistente de chat local multilingue: al soportar ocho idiomas y ejecutarse en CPU (40,2 tok/s en M4, 15,5 tok/s en Xeon), sirve para prototipos de atencion al cliente o asistentes internos que no pueden enviar datos a servicios externos.
- Procesamiento por lotes de resumenes en servidor: sobre una NVIDIA L4 con CUDA, el archivo de 4 bits decodifica a 129 tok/s sin prompt y procesa un prompt de 30.000 tokens en 9,92 s, lo que permite resumir grandes volumenes de documentacion con una sola GPU de 24 GB.
- Clasificacion y etiquetado de texto mediante tool calling: el soporte de function calling permite definir herramientas de extraccion de entidades o categorizacion y dejar que el modelo las invoque en un pipeline automatizado.
- Despliegue en entornos con hardware heterogeneo: al ejecutarse sobre CUDA, Vulkan, DX12, Metal y CPU con el mismo binario, es adecuado para flotas mixtas de estaciones de trabajo con GPUs AMD, Intel o NVIDIA sin recompilar ni cambiar de runtime.
- Prototipado rapido sin Python: la instalacion via `cargo install cortiq-cli` y la descarga de un unico archivo CMF permiten tener un chatbot funcional en minutos, util para demos y pruebas de concepto.

## Benchmarks y rendimiento

Calidad (perplejidad en WikiText-2, ventanas de 512 tokens):

| Archivo | Cuantizacion | Tamano | PPL WikiText-2 | PPL Rust | PPL Python |
|---|---|---:|---:|---:|---:|
| q8_2f | 8 bits | 2,31 GB | 14,25 | 7,66 | 7,26 |
| q4tp | 4 bits GPTQ | 1,41 GB | 14,61 | 7,83 | 7,43 |
| Referencia bf16 | — | 4,58 GB | 14,24 | 7,66 | 7,26 |

Perplejidad con ventanas de 4.096 tokens (mas alla de la ventana deslizante de 2.048): q8_2f 9,47; bf16 9,46; q4tp 9,70.

Rendimiento en NVIDIA L4 (24 GB), backend CUDA:

| Prompt (tokens) | Primer token, s (q4tp) | Primer token, s (q8_2f) | Decodificacion, tok/s (q4tp) | Decodificacion, tok/s (q8_2f) | Memoria pico, GB (q4tp) | Memoria pico, GB (q8_2f) |
|---:|---:|---:|---:|---:|---:|---:|
| 2.048 | 0,32 | 0,34 | 116,9 | 80,4 | 2,2 | 3,3 |
| 8.192 | 1,72 | 1,79 | 106,3 | 75,2 | 2,5 | 3,6 |
| 16.384 | 4,15 | 4,31 | 95,7 | 69,8 | 2,9 | 4,0 |
| 30.000 | 9,92 | 10,1 | 79,7 | 61,0 | 3,5 | 4,7 |

Rendimiento en NVIDIA L4, backend Vulkan:

| Prompt (tokens) | Primer token, s (q4tp) | Primer token, s (q8_2f) | Decodificacion, tok/s (q4tp) | Decodificacion, tok/s (q8_2f) | Memoria pico, GB (q4tp) | Memoria pico, GB (q8_2f) |
|---:|---:|---:|---:|---:|---:|---:|
| 2.048 | 0,62 | 1,21 | 82,8 | 64,0 | 3,1 | 3,7 |
| 8.192 | 3,83 | 6,20 | 73,7 | 57,8 | 3,4 | 4,2 |
| 16.384 | 10,3 | 15,0 | 63,5 | 52,0 | 3,9 | 4,6 |
| 30.000 | 27,3 | 35,8 | 52,6 | 44,5 | 4,6 | 5,3 |

Rendimiento en MacBook Air M4 (24 GB), backend Metal:

| Prompt (tokens) | Primer token, s (q4tp) | Primer token, s (q8_2f) | Decodificacion, tok/s (q4tp) | Decodificacion, tok/s (q8_2f) |
|---:|---:|---:|---:|---:|
| 2.048 | 3,48 | 4,17 | 53,4 | 33,8 |
| 8.192 | 18,4 | 22,7 | 47,4 | 33,0 |
| 16.384 | 44,0 | — | 42,2 | — |

Rendimiento en CPU: MacBook Air M4 (10 nucleos), q4tp 40,2 tok/s y q8_2f 28,2 tok/s sin prompt; con prompt de 2.048 tokens, 26,6 y 20,3 tok/s respectivamente. Xeon 2,2 GHz (6 nucleos / 12 hilos), q8_2f 15,5 tok/s y q4tp 15,1 tok/s sin prompt; con prompt de 2.048 tokens, 14,0 y 11,1 tok/s.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las mediciones se limitan a perplejidad y velocidad.

## Requisitos de hardware

- VRAM estimada: 2,2 GB (q4tp) y 3,3 GB (q8_2f) con prompts de 2.048 tokens en CUDA; hasta 3,5 GB y 4,7 GB respectivamente con prompts de 30.000 tokens.
- GPU recomendadas: NVIDIA L4 (medida por el autor); cualquier GPU NVIDIA con al menos 4-5 GB libres para CUDA o Vulkan; GPUs AMD e Intel a traves de Vulkan/DX12 segun el soporte de cortiq.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) con ambas cuantizaciones; no se han publicado mediciones especificas en estas tarjetas.
- Apple Silicon: medido en MacBook Air M4 con 24 GB; el archivo de 8 bits requiere unos 2,3 GB de memoria y el de 4 bits 1,41 GB, mas el estado de atencion (1,6 GB de claves y valores con 16.384 tokens en el archivo de 4 bits).
- CPU: funciona en CPU pura; en un Xeon de 6 nucleos se obtienen 15,5 tok/s (q8_2f) y 15,1 tok/s (q4tp) sin prompt.
- Opciones de despliegue: motor `cortiq` (Rust, sin Python), instalable con `cargo install cortiq-cli` o mediante binarios precompilados para Linux, macOS y Windows; backend CUDA con `--features cuda` y variable `CMF_GPU=cuda`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: primer token en 0,32 s (q4tp, prompt de 2.048 tokens, CUDA) y 9,92 s (prompt de 30.000 tokens); decodificacion maxima medida de 129,1 tok/s (q4tp, CUDA, sin prompt).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-cmf (este) | 2,3B | 32.768 | MIT | CMF / cortiq (CUDA, Vulkan, DX12, Metal, CPU) | Cuantizado a 8 y 4 bits; PPL WikiText-2 14,25 (8 bits) |
| Aion-1.0-Instruct-2.3B Turbo-cmf | 2,3B | 32.768 | MIT | CMF / cortiq | Variante del mismo autor orientada a prompts largos con memoria de la tarjeta fija |
| Aion-1.0-Instruct-2.3B (base, Microsoft) | 2,3B | 32.768 | no disponible en la informacion proporcionada | safetensors / bf16 (Transformers) | Referencia sin cuantizar; 4,58 GB y PPL 14,24 |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con alternativas de la misma categoria (por ejemplo, modelos de 2-3B de otros fabricantes); la comparacion se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- El modelo base es de 2,3B parametros, por lo que su capacidad de razonamiento complejo, matematicas y codigo es limitada en comparacion con modelos de mayor tamano; no se han publicado benchmarks de tareas que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos especificos sobre la tasa de alucinacion en la informacion proporcionada.
- La cuantizacion de 4 bits degrada ligeramente la perplejidad (14,61 frente a 14,24 en bf16 con ventanas de 512 tokens; 9,70 frente a 9,46 con ventanas de 4.096), lo que puede afectar a tareas sensibles a la precision.
- La ventana de atencion deslizante de 2.048 tokens implica que el modelo no atiende directamente a todo el contexto de 32.768 tokens; el rendimiento en prompts largos depende del mecanismo de atencion del modelo base.
- El soporte de idiomas se limita a los ocho declarados (en, de, es, pt, it, fr, zh, ja); no se garantiza calidad en otros idiomas.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base de Microsoft, que no se detalla en la informacion proporcionada.
- El formato CMF y el motor cortiq son especificos de este ecosistema; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, lo que limita la integracion con infraestructura existente.
- Las mediciones de rendimiento proceden de un unico autor y de un conjunto limitado de hardware (NVIDIA L4, MacBook Air M4, Xeon); no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Aion-1.0-Instruct-2.3B-cmf
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Variante Turbo: https://huggingface.co/infosave/Aion-1.0-Instruct-2.3B-Turbo-cmf
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
