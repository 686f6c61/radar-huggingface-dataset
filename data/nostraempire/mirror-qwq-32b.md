# NostraEmpire/mirror-qwq-32b

## Resumen

QwQ-32B es un modelo de lenguaje de razonamiento desarrollado por el equipo Qwen de Alibaba Cloud, diseñado para resolver problemas complejos mediante un proceso de pensamiento paso a paso antes de generar la respuesta final. Se basa en la arquitectura de Qwen2.5-32B y ha sido optimizado mediante supervisión fina y aprendizaje por refuerzo para mejorar su capacidad de razonamiento lógico, matemático y de programación. Con 32.500 millones de parámetros y una ventana de contexto de 131.072 tokens, compite directamente con modelos de razonamiento de mayor tamaño como DeepSeek-R1 y o1-mini, pero con un peso mucho más manejable y una licencia Apache 2.0 que permite uso comercial sin restricciones.

El modelo se distribuye como pesos abiertos en formato transformers (safetensors) y también está disponible en cuantizaciones GGUF para su ejecución en hardware de consumo. Su relevancia actual radica en que democratiza el razonamiento avanzado de nivel o1 en un paquete de 32B, accesible para desarrolladores e investigadores con GPUs de gama alta o incluso tarjetas de consumo mediante cuantización. Es especialmente útil en tareas que requieren cadenas de razonamiento largas, como demostraciones matemáticas, depuración de código o análisis de escenarios multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias en QKV |
| Parametros totales | 32,5 mil millones (31,0 B no-embedding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | GGUF (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0) y FP16/BF16 en safetensors |
| Idiomas soportados | Ingles (segun model card oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

QwQ-32B hereda la arquitectura de Qwen2.5-32B: un transformer causal con 64 capas, 40 cabezas de atencion para consultas (Q) y 8 para claves/valores (KV) mediante atencion por grupos (GQA). Emplea embeddings rotatorios (RoPE) con soporte para extension de contexto via YaRN, normalizacion RMSNorm y activacion SwiGLU. El entrenamiento combina una fase de preentrenamiento sobre un corpus multilingue (aunque la model card solo declara ingles) seguida de una fase de post-entrenamiento que incluye supervisión fina (SFT) y aprendizaje por refuerzo (RL) especificamente orientado a fomentar el razonamiento paso a paso. No se han publicado detalles sobre el tamaño del dataset de preentrenamiento ni la composicion exacta del corpus de RL, pero el enfoque es similar al de otros modelos de razonamiento como DeepSeek-R1, donde el RL premia la generacion de cadenas de pensamiento correctas antes de la respuesta final.

Una innovacion destacable es la integracion del formato de razonamiento en la plantilla de chat: el modelo genera automaticamente un bloque de pensamiento delimitado por etiquetas `<think>` y `</think>` antes de la respuesta visible, lo que permite separar el proceso de razonamiento interno de la salida final. Ademas, se recomienda usar parametros de muestreo especificos (temperatura 0.6, top-p 0.95, top-k 20-40) para evitar repeticiones y mantener la calidad del razonamiento.

## Capacidades

- Razonamiento paso a paso: genera cadenas de pensamiento explicitas antes de responder, lo que mejora la precision en problemas de logica, matematicas y ciencia.
- Matematicas avanzadas: capaz de resolver problemas de nivel competitivo (olimpiadas, examenes universitarios) con demostraciones detalladas.
- Generacion de codigo: escribe, depura y explica codigo en multiples lenguajes, con especial soltura en Python, C++ y Java.
- Razonamiento multi-paso: maneja tareas que requieren planificacion y ejecucion de varios pasos intermedios, como analisis de escenarios o planificacion de proyectos.
- Comprension de contexto largo: con 128k tokens de ventana, puede procesar documentos extensos, libros o conversaciones largas sin perder informacion relevante.
- Soporte de tool calling: aunque no se documenta explicitamente en la model card, al estar basado en Qwen2.5-32B hereda la capacidad de invocar funciones externas, lo que permite integrarlo en agentes y pipelines automatizados.
- Multilingue limitado: la model card solo declara ingles, aunque el modelo base Qwen2.5 soporta mas idiomas; en la practica puede funcionar en otros idiomas con menor calidad.

## Casos de uso

- Resolucion de problemas matematicos en educacion: un profesor puede usar QwQ-32B para generar explicaciones paso a paso de teoremas o ejercicios, aprovechando su capacidad de razonamiento estructurado y su ventana de 128k tokens para procesar libros de texto completos.
- Depuracion y revision de codigo en CI/CD: integrado en un pipeline de desarrollo, el modelo puede analizar fragmentos de codigo, detectar errores logicos y sugerir correcciones, gracias a su razonamiento multi-paso y su herencia de tool calling de Qwen2.5.
- Analisis de documentos legales o financieros: con su contexto largo, puede leer contratos extensos o informes anuales y extraer clausulas relevantes, razonando sobre implicaciones y riesgos.
- Asistente de investigacion cientifica: ayuda a formular hipotesis, disenar experimentos y revisar literatura, generando cadenas de razonamiento que el investigador puede verificar.
- Chatbots de soporte tecnico avanzado: al poder razonar sobre sintomas y soluciones, ofrece respuestas mas precisas que un modelo de chat convencional, especialmente en dominios con logica compleja.
- Generacion de contenido educativo interactivo: crea ejercicios, problemas y soluciones detalladas para plataformas de e-learning, adaptando la dificultad segun el nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un blog oficial (https://qwenlm.github.io/blog/qwq-32b/) donde se reportan evaluaciones comparativas, pero los numeros concretos no estan incluidos en los datos proporcionados. Segun las fuentes web consultadas, QwQ-32B alcanza un rendimiento competitivo con DeepSeek-R1 y o1-mini en tareas de razonamiento, pero no se dispone de cifras exactas para presentar en una tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, el modelo requiere aproximadamente 65 GB de VRAM (32,5B parametros × 2 bytes). Con cuantizacion 8-bit (Q8_0) se reduce a ~35 GB, y con 4-bit (Q4_K_M) a ~20 GB.
- GPUs recomendadas: para FP16 se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con cuantizacion). Para cuantizacion 4-bit, una RTX 4090 (24GB) o RTX 3090 (24GB) es suficiente.
- En consumer GPU: si, con cuantizacion Q4_K_M o Q5_K_M cabe en tarjetas de 24GB, aunque la velocidad de generacion sera limitada por el ancho de banda de memoria.
- Opciones de despliegue: vLLM (recomendado para produccion, soporta YaRN estatico), llama.cpp (para CPU/GPU con GGUF), Ollama (facil de usar), TGI (Text Generation Inference) y transformers nativo.
- Latencia y throughput: no se han publicado datos oficiales. En una A100 80GB con FP16, se estima una velocidad de generacion de 20-40 tokens/segundo, dependiendo de la longitud de la cadena de razonamiento. Con cuantizacion 4-bit en RTX 4090, la velocidad puede ser de 10-20 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| QwQ-32B | 32,5B denso | 128k | Apache 2.0 | Razonamiento explicito |
| DeepSeek-R1 | 671B (MoE, 37B activos) | 128k | MIT | Razonamiento explicito |
| o1-mini | No publico | 128k (estimado) | Propietaria | Razonamiento explicito |
| Qwen2.5-32B (base) | 32,5B denso | 128k | Apache 2.0 | Chat general, sin razonamiento explicito |

QwQ-32B ofrece un equilibrio unico: el rendimiento de razonamiento de modelos mucho mas grandes (DeepSeek-R1, o1-mini) con un tamano de 32B que permite ejecutarlo en hardware mas accesible. Frente a su base Qwen2.5-32B, anade la capacidad de razonamiento paso a paso, lo que mejora significativamente en tareas de logica y matematicas, aunque puede ser mas lento en respuestas simples debido al proceso de pensamiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar informacion falsa o sesgada, especialmente en dominios poco representados en su entrenamiento. El razonamiento paso a paso no garantiza la correccion factual.
- Riesgo de razonamiento incorrecto: aunque el modelo piensa antes de responder, puede llegar a conclusiones erroneas si parte de premisas incorrectas o si el problema esta mal planteado.
- Limitaciones de idioma: la model card solo declara ingles; en otros idiomas la calidad puede degradarse notablemente, especialmente en tareas de razonamiento complejo.
- Contexto largo requiere YaRN: para entradas superiores a 8.192 tokens es necesario activar la extension de contexto YaRN, que puede afectar al rendimiento en textos cortos si se configura de forma estatica.
- Repeticiones y bucles: con parametros de muestreo inadecuados (p.ej. greedy decoding), el modelo puede caer en repeticiones infinitas en su cadena de razonamiento. Se recomienda seguir las pautas de temperatura y top-p indicadas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Qwen2.5-32B tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones comerciales conocidas. Sin embargo, es recomendable revisar los terminos de uso de Qwen para servicios en la nube.
- Coste computacional del razonamiento: la generacion de cadenas de pensamiento largas aumenta el tiempo de inferencia y el consumo de tokens, lo que puede encarecer el despliegue en produccion si no se limita la longitud maxima de razonamiento.

## Enlaces

- Modelo original en HuggingFace: https://huggingface.co/Qwen/QwQ-32B
- Mirror en HuggingFace (fuente de esta ficha): https://huggingface.co/NostraEmpire/mirror-qwq-32b
- Blog oficial de Qwen sobre QwQ-32B: https://qwenlm.github.io/blog/qwq-32b/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Demo interactiva: https://huggingface.co/spaces/Qwen/QwQ-32B-Demo
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski/Qwen_QwQ-32B-GGUF
- Articulo de referencia sobre YaRN (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
