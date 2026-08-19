# maxzt/toffee-3b-beta

## Resumen

Toffee-3B-β es un modelo de lenguaje instructivo de 3.800 millones de parámetros desarrollado por maxzt, concebido como un asistente conversacional de alta calidad. Se trata de un refinamiento del modelo base mistralai/Ministral-3-3B-Base-2512, al que se le ha aplicado un post-entrenamiento supervisado sobre conjuntos de datos instructivos de chat, matemáticas y código. El autor lo presenta como "el estándar de oro de los modelos de chat pequeños", con resultados destacados en benchmarks para su tamaño.

El modelo emplea la arquitectura Ministral 3 de la familia Mistral, con una ventana de contexto de 8.192 tokens y un vocabulario de 131.072 entradas. Está disponible bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. Su tamaño compacto lo hace adecuado para despliegue en entornos con recursos limitados, manteniendo un rendimiento competitivo frente a modelos de la misma categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ministral 3 (familia Mistral, transformer decoder) |
| Parametros totales | 3.831.659.520 (3,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (principal) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Ministral 3, un transformer decoder de la familia Mistral con 26 capas, 32 cabezas de atencion, 8 cabezas KV y un tamaño oculto de 3.072. El vocabulario alcanza 131.072 tokens, lo que permite una representacion densa del texto. El modelo es denso, sin mezcla de expertos.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con LoRA sobre el modelo base Ministral-3-3B-Base-2512. Se utilizaron hasta 80.000 ejemplos de entrenamiento procedentes de los datasets HuggingFaceH4/ultrachat_200k (conversacion), nvidia/OpenMathInstruct-2 (matematicas) y m-a-p/CodeFeedback-Filtered-Instruction (codigo). La configuracion de LoRA empleo rango 32, alpha 64 y dropout 0.05, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento se realizo durante una epoca con una tasa de aprendizaje de 1e-4, scheduler coseno, warmup del 5% y un batch efectivo de 32. La perdida se calculo solo sobre las respuestas del asistente, y se uso empaquetado de secuencias. El framework fue Unsloth con Hugging Face, en precision BF16 con fallback a FP16.

## Capacidades

- Generacion de texto conversacional: el modelo esta optimizado para mantener dialogos multi-turno como asistente util.
- Razonamiento y conocimiento general: alcanza un 63,10% en MMLU, lo que indica solida comprension factual y de razonamiento para su tamano.
- Matematicas: entrenado con OpenMathInstruct-2, es capaz de resolver problemas aritmeticos y algebraicos de nivel medio.
- Generacion de codigo: entrenado con CodeFeedback-Filtered-Instruction, puede producir fragmentos de codigo en varios lenguajes y explicar su funcionamiento.
- Comprension de lenguaje natural: 72,04% en HellaSwag, mostrando buena capacidad de prediccion de continuaciones plausibles.
- Soporte de tool calling: no se menciona explicitamente en la documentacion disponible; no disponible.
- Capacidades multilingues: limitado principalmente al ingles; no se reportan otros idiomas.

## Casos de uso

- Asistente de atencion al cliente: el modelo puede gestionar conversaciones de soporte en ingles con contexto de hasta 8.192 tokens, suficiente para mantener el historial de una interaccion completa. Su entrenamiento en chat lo hace adecuado para responder con tono servicial y coherente.
- Generacion de documentacion tecnica: gracias a su entrenamiento en codigo y razonamiento, puede redactar explicaciones de funciones, APIs o fragmentos de codigo, util para equipos de desarrollo que necesitan documentacion rapida.
- Tutor de matematicas: con OpenMathInstruct-2 en su entrenamiento, puede resolver problemas paso a paso y explicar metodos, sirviendo como apoyo educativo en plataformas de aprendizaje.
- Chatbot de productividad: integrable en herramientas de escritorio o web para resumir textos, redactar correos o generar borradores de contenido en ingles.
- Prototipado de agentes conversacionales: su tamano compacto permite ejecutarlo en GPU de consumo, facilitando el desarrollo y pruebas de sistemas de dialogo antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto: puede utilizarse para etiquetar o categorizar contenido en ingles, aprovechando su capacidad de comprension del lenguaje.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion son los declarados por el autor en la model card. La comparativa con otros modelos es aproximada, ya que las condiciones de evaluacion pueden diferir entre fuentes.

| Modelo | Parametros | MMLU | HellaSwag |
|---|---:|---:|---:|
| Toffee-3B-β | 3B | 63,10% | 72,04% |
| HuggingFaceH4/zephyr-7b-beta | 7B | 61,07% | 84,36% |
| Qwen2.5-3B-Instruct | 3B | 65,40% | 71,56% |
| Llama 3.2 3B-Instruct | 3B | 63,40% | 69,80% |
| Falcon3-3B-Instruct | 3B | 56,90% | no disponible |
| Gemma 3 4B PT | 4B | 59,60% | 77,20% |
| Phi-3.5-mini-Instruct | 3,8B | 69,00% | 69,40% |

El modelo supera a zephyr-7b-beta en MMLU a pesar de tener menos de la mitad de parametros, y se situa en linea con Qwen2.5-3B-Instruct y Llama 3.2 3B-Instruct. En HellaSwag queda por detras de zephyr-7b-beta y Gemma 3 4B, pero por delante de Llama 3.2 3B.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16, el modelo ocupa aproximadamente 7,7 GB en memoria (3,8B parametros x 2 bytes). Con overhead de atencion y activaciones, se recomienda al menos 10-12 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100 o L4. En consumer GPU cabe sin problema en las gamas medias y altas.
- Opciones de despliegue: al ser un modelo de la familia Mistral, es compatible con vLLM, llama.cpp, Ollama, TGI y el pipeline de transformers de Hugging Face. No se han publicado cuantizaciones GGUF oficiales, pero pueden generarse a partir de los pesos safetensors.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 4090, un modelo de 3,8B en BF16 puede generar decenas de tokens por segundo, aunque el valor exacto depende de la implementacion y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HellaSwag | Licencia |
|---|---:|---:|---:|---:|---|
| Toffee-3B-β | 3,8B | 8.192 | 63,10% | 72,04% | MIT |
| Qwen2.5-3B-Instruct | 3B | 32.768 | 65,40% | 71,56% | Apache 2.0 |
| Llama 3.2 3B-Instruct | 3B | 128.000 | 63,40% | 69,80% | Llama 3.2 |
| Phi-3.5-mini-Instruct | 3,8B | 128.000 | 69,00% | 69,40% | MIT |

Toffee-3B-β ofrece un rendimiento en MMLU comparable a Llama 3.2 3B y ligeramente inferior a Qwen2.5-3B, pero con una ventana de contexto mucho menor (8.192 frente a 32.768 o 128.000). Phi-3.5-mini supera a todos en MMLU con el mismo tamano. La principal ventaja de Toffee es su licencia MIT, que permite uso comercial sin restricciones, frente a la licencia Llama de Meta.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en ingles, puede reflejar sesgos culturales y linguisticos de ese idioma. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados. Se recomienda verificacion humana en contextos criticos.
- Limitaciones de contexto: la ventana de 8.192 tokens es corta en comparacion con modelos modernos de 32K o 128K, lo que limita su uso en tareas que requieren documentos largos o historiales extensos.
- Limitaciones de idioma: el modelo esta disenado principalmente para ingles; su rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base Ministral-3-3B-Base-2512 puede tener sus propias condiciones; se debe verificar la licencia del modelo base para evitar conflictos.
- Datos de entrenamiento limitados: con solo 80.000 ejemplos y una epoca, la cobertura de dominios puede ser menor que la de modelos entrenados con mas datos.
- Benchmarks no verificados: los resultados de MMLU y HellaSwag son declarados por el autor sin verificacion independiente, y las comparaciones con otros modelos usan configuraciones de evaluacion posiblemente distintas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxzt/toffee-3b-beta
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
