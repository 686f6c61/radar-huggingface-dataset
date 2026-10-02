# hellowsherlock/theranotes-Llama-3.2-3B-Instruct-4bit

## Resumen

theranotes-Llama-3.2-3B-Instruct-4bit es una versión cuantizada a 4 bits del modelo Llama-3.2-3B-Instruct de Meta, publicada por el usuario hellowsherlock en HuggingFace. El modelo base forma parte de la familia Llama 3.2, presentada por Meta el 25 de septiembre de 2024, y se distribuye bajo la Llama 3.2 Community License.

Se trata de un transformer decoder-only autorregresivo de 3.212.749.824 parámetros (aproximadamente 3,2 mil millones) con una ventana de contexto de 128.000 tokens, orientado a generación de texto conversacional y disponible en ocho idiomas. La variante aquí descrita procede de mlx-community/Llama-3.2-3B-Instruct y está cuantizada a 4 bits, lo que reduce el tamaño del repositorio a 1,8 GB y permite su ejecución en hardware de consumo.

Su relevancia radica en que ofrece un punto de entrada de bajo coste computacional para tareas de generación de texto, asistentes conversacionales y prototipado rápido sobre Apple Silicon. Al conservar la arquitectura Llama 3.2 y publicarse en formato safetensors, es compatible con el ecosistema transformers y con pipelines de text-generation-inference. No se ha publicado información adicional sobre el proceso de ajuste específico ni sobre los datos empleados para esta variante concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con Grouped Query Attention (GQA) |
| Parametros totales | 3.212.749.824 (aprox. 3,2 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | 4 bits (este repositorio); existen variantes FP8 y bnb-4bit de la comunidad sobre el mismo base |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (8 idiomas) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Llama 3.2 3B Instruct es un transformer decoder-only autorregresivo que emplea Grouped Query Attention (GQA), lo que reduce el número de cabezas de clave/valor respecto a las cabezas de consulta y disminuye el tamaño de la caché KV durante la inferencia. Según la documentación oficial de Meta, esta variante (junto con la de 1B) fue entrenada sobre un corpus de hasta 9 billones de tokens y pasa por fases de ajuste supervisado (SFT), optimización por preferencias humanas y filtros de seguridad. Incorpora un vocabulario de 128.256 tokens.

Sobre la variante theranotes-Llama-3.2-3B-Instruct-4bit, la model card únicamente documenta el modelo base (mlx-community/Llama-3.2-3B-Instruct) y la cuantización a 4 bits. No se especifica si hubo un ajuste adicional (fine-tuning) con datos específicos, qué dataset se empleó ni si se aplicaron técnicas propias de RLHF o DPO. El origen MLX del modelo base indica que la cuantización se realizó con las herramientas de MLX, orientadas a Apple Silicon.

## Capacidades

- Generación de texto conversacional multi-turno en ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Razonamiento básico, resumen, reescritura y respuesta a instrucciones.
- Generación y explicación de código en lenguajes habituales, con calidad limitada por el tamaño del modelo.
- Capacidad de seguir instrucciones con formato estructurado (respuestas en JSON, listas, plantillas).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta variante; el modelo base Llama 3.2 Instruct soporta plantillas de herramientas, pero no se garantiza su funcionamiento tras la cuantización.
- Soporte de agentes y razonamiento multi-paso: funcional pero limitado por el tamaño; no está optimizado específicamente para flujos agénticos complejos.
- Capacidades multilingües: ocho idiomas soportados oficialmente, con rendimiento desigual fuera del inglés.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede mantener diálogos multi-turno con hasta 128.000 tokens de contexto, lo que permite conservar historiales largos sin truncar, siempre que la memoria de la caché KV lo permita.
- Procesamiento de documentos largos: resumen, extracción de entidades y respuesta a preguntas sobre informes, contratos o artículos extensos, aprovechando la ventana de contexto de 128k.
- Prototipado rápido en Apple Silicon: gracias al origen MLX y a la cuantización 4 bits, es posible iterar en un Mac con memoria unificada sin necesidad de GPU dedicada.
- Clasificación y enrutado de texto: etiquetado de tickets, categorización de correos o moderación previa en pipelines de datos, usando el modelo como componente de bajo coste.
- Generación asistida de texto en ocho idiomas: redacción de borradores, traducción informal entre los idiomas soportados y adaptación de tono.
- Educación y tutoría: explicación de conceptos, generación de ejercicios y corrección guiada, con la ventaja de poder ejecutarse localmente y sin coste por token.
- Integración en aplicaciones de escritorio y móviles: el peso reducido (1,8 GB) permite empaquetar el modelo dentro de aplicaciones que requieren inferencia offline.
- Preprocesado en pipelines RAG: generación de consultas reformuladas o resúmenes intermedios antes de llamar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el modelo theranotes-Llama-3.2-3B-Instruct-4bit. La model card no incluye tabla de evaluaciones y los resultados de búsqueda consultados no aportan métricas específicas de esta variante cuantizada.

## Requisitos de hardware

- Pesos del modelo base sin cuantizar (fp16/bf16): aproximadamente 6,4 GB. Requiere al menos 8-10 GB de VRAM para inferencia cómoda.
- Versión 4 bits (este repositorio): aproximadamente 1,8 GB de pesos; con overhead de runtime, del orden de 3-4 GB de VRAM.
- Caché KV: con GQA (8 cabezas KV, 28 capas, dimensión de cabeza 128), la caché en fp16 ocupa alrededor de 112 KB por token, lo que supone unos 14 GB para el contexto completo de 128.000 tokens. Para contextos largos conviene cuantizar la caché o reducir la ventana efectiva.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) ejecuta la versión 4 bits sin problemas. Para el modelo base en fp16 basta una RTX 4090 o similar. Para despliegue a escala, A100 o H100.
- Compatibilidad con GPU de consumo: sí, la versión 4 bits cabe incluso en GPUs de 6-8 GB de VRAM en configuraciones ajustadas.
- Opciones de despliegue: transformers (con bitsandbytes para 4 bits), MLX sobre Apple Silicon (origen del modelo base), llama.cpp y Ollama (requieren conversión a GGUF), vLLM y text-generation-inference (habitualmente con variantes FP8, AWQ o GPTQ).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theranotes-Llama-3.2-3B-Instruct-4bit | 3,2 B | 128k | 4 bits (MLX) | Llama 3.2 Community | HuggingFace |
| mlx-community/Llama-3.2-3B-Instruct | 3,2 B | 128k | 4 bits, 8 bits, fp16 | Llama 3.2 Community | HuggingFace |
| neuralmagic/Llama-3.2-3B-Instruct-FP8 | 3,2 B | 128k | FP8 | Llama 3.2 Community | HuggingFace |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3,2 B | 128k | 4 bits (bitsandbytes) | Llama 3.2 Community | HuggingFace |

Las cuatro opciones comparten arquitectura, número de parámetros, ventana de contexto y licencia; la diferencia principal es el formato de cuantización y, por tanto, el backend de ejecución compatible (MLX frente a CUDA/bitsandbytes frente a FP8 en hardware Hopper).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un derivado de Llama 3.2, hereda los sesgos presentes en los datos de entrenamiento de Meta, que no se detallan en la información disponible.
- Riesgo de alucinación: elevado en un modelo de 3B, especialmente en tareas de conocimiento factual, matemáticas o contextos largos con información poco frecuente.
- Limitaciones de contexto: aunque la ventana nominal es de 128k tokens, el rendimiento efectivo decrece en contextos muy largos y el coste de memoria de la caché KV es significativo.
- Limitaciones de idioma: el soporte de los ocho idiomas es desigual; el tailandés y el hindi suelen mostrar un rendimiento inferior al inglés.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial, pero exige incluir la cláusula de atribución y solicitar licencia a Meta si el producto supera los 700 millones de usuarios activos mensuales. Cualquier modelo derivado debe llevar "Llama" al inicio del nombre.
- Caveats de producción: no hay benchmarks publicados para esta variante, el modelo tiene 0 descargas y 0 likes, y la cuantización a 4 bits puede degradar la calidad respecto al modelo base. No se ha verificado el soporte de tool calling tras la cuantización.
- Trazabilidad: la model card se limita al acuerdo de licencia y no documenta el proceso de cuantización ni posibles ajustes posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellowsherlock/theranotes-Llama-3.2-3B-Instruct-4bit
- Modelo base: https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct
- Variante FP8: https://huggingface.co/neuralmagic/Llama-3.2-3B-Instruct-FP8
- Variante bnb-4bit: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Ficha de la familia Llama 3 en Meta: https://dev.meta.ai/llama/models/llama-3
- Política de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Documentación de Llama: https://llama.meta.com/doc/overview
