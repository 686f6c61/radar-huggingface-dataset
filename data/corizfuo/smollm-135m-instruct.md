# Corizfuo/SmolLM-135M-Instruct

## Resumen

SmolLM-135M-Instruct es un modelo de lenguaje pequeño de 135 millones de parámetros, desarrollado por Corizfuo como un fine-tuning del modelo base SmolLM-135M de HuggingFaceTB. Este modelo está diseñado para ejecutarse en dispositivos con recursos limitados, como móviles o entornos edge, manteniendo un rendimiento razonable en tareas de conversación y generación de texto. El fine-tuning se realizó mediante supervisión fina (SFT) sobre una mezcla de datasets públicos de alta calidad, incluyendo Magpie-Pro-300K-Filtered, self-oss-instruct-sc2-exec-filter-50k, OpenHermes-2.5 y everyday-conversations-llama3.1-2k.

La relevancia de este modelo radica en su tamaño reducido, que permite inferencia en CPU y GPU de baja gama, y en su licencia Apache 2.0, que facilita su uso comercial y modificación. Aunque su capacidad es limitada en tareas complejas, es adecuado para aplicaciones de asistencia conversacional, generación de código básico y prototipado rápido. La arquitectura es un transformer decoder-only similar a Llama, con una longitud de contexto de 2048 tokens, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (similar a Llama) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (se recomienda evitar cuantizacion de 4 bits por perdida de calidad) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolLM-135M, un transformer decoder-only con mecanismo de atencion por ventana deslizante (sliding window attention) y embeddings de posicion rotativos (RoPE). El fine-tuning se realizo con el alignment-handbook de HuggingFace, utilizando una unica epoca, una tasa de aprendizaje de 1e-3, programacion coseno y un warmup del 10%. El dataset de entrenamiento combina conversaciones cotidianas generadas por Llama 3.1 70B, instrucciones de codigo de StarCoder2, una submuestra de OpenHermes-2.5 y datos de Magpie-Pro. No se aplico DPO en este fine-tuning, a diferencia de la version v0.1 del modelo original.

El modelo base fue preentrenado sobre SmolLM-Corpus, un corpus curado de datos educativos y sinteticos de alta calidad, que incluye Cosmopedia v2, Python-Edu y FineWeb-Edu. Esta combinacion de datos busca maximizar la capacidad del modelo en tareas de razonamiento y generacion de texto con un presupuesto de parametros muy reducido.

## Capacidades

- Generacion de texto conversacional: responde a preguntas, mantiene dialogos multi-turno y sigue instrucciones basicas.
- Escritura creativa: capaz de producir cuentos, poemas y textos breves con coherencia aceptable.
- Programacion basica en Python: puede generar fragmentos de codigo sencillos, como funciones de calculo o manipulacion de listas.
- Conocimiento general: responde a preguntas factuales simples, aunque con riesgo de errores en temas especializados.
- Soporte de chat mediante plantilla de mensajes: integrable con el tokenizador y la funcion `apply_chat_template` de Transformers.
- No soporta tool calling, vision, audio ni modos de razonamiento avanzado.

## Casos de uso

- Asistente conversacional en dispositivos moviles: al ocupar menos de 0,5 GB de VRAM, puede ejecutarse en tiempo real en smartphones o tablets para responder preguntas frecuentes o mantener charlas informales.
- Chatbot de atencion al cliente en entornos con recursos limitados: integrable en sistemas de mensajeria para resolver consultas simples, con la ventaja de no requerir conexion a internet si se despliega localmente.
- Generacion de codigo en entornos de desarrollo integrado (IDE) para autocompletar funciones sencillas en Python, aprovechando su entrenamiento con datos de codigo.
- Prototipado rapido de aplicaciones de IA generativa: su pequeno tamano permite iterar rapidamente en experimentos de prompt engineering o validacion de ideas antes de escalar a modelos mayores.
- Educacion y aprendizaje: util como ejemplo de modelo de lenguaje pequeno para ensenar conceptos de fine-tuning, inferencia y despliegue en cursos de IA.
- Procesamiento de texto en tiempo real en dispositivos embebidos: por ejemplo, transcripcion y resumen de notas breves en asistentes de voz con limitaciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original menciona que la version v0.2 del SmolLM-360M-Instruct tiene una tasa de victoria del 63,3% sobre la v0.1 en AlpacaEval, pero no hay datos especificos para el modelo de 135M ni para este fine-tuning concreto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB en cuantizacion FP16, segun datos del modelo base.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso integradas como Intel Iris Xe.
- Compatible con CPU: puede ejecutarse en CPU con un rendimiento aceptable para tareas de baja latencia.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama y TGI, aunque para este tamano se recomienda usar llama.cpp o Transformers para simplificar.
- Latencia: en una GPU moderna, la generacion de 50 tokens tarda menos de 100 ms; en CPU, puede tardar entre 1 y 2 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM-135M-Instruct (este) | 135M | 2048 | Apache 2.0 | Fine-tuning de Corizfuo, solo ingles |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Mayor capacidad, pero mas pesado |
| Qwen2-0.5B-Instruct | 0,5B | 32768 | Apache 2.0 | Contexto mas largo, multilingue |
| SmolLM-360M-Instruct | 360M | 2048 | Apache 2.0 | Version mayor de la misma familia |

No se dispone de comparaciones de rendimiento directas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para tareas multilingues.
- Dificultad con aritmetica, edicion de texto y razonamiento complejo, como se indica en la model card.
- Riesgo de alucinaciones y respuestas factualmente incorrectas, especialmente en temas especializados.
- La cuantizacion de 4 bits degrada notablemente la calidad de las respuestas, por lo que se recomienda usar FP16 o cuantizaciones superiores.
- Al ser un modelo pequeno, su capacidad de seguir instrucciones complejas es limitada; puede desviarse del tema en conversaciones largas.
- No se ha evaluado su seguridad ni sesgos de forma exhaustiva; puede reflejar sesgos presentes en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Corizfuo/SmolLM-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Blog de SmolLM: https://huggingface.co/blog/smollm
- Repositorio alignment-handbook: https://github.com/huggingface/alignment-handbook
- Recetas de entrenamiento SmolLM: https://github.com/huggingface/alignment-handbook/tree/smollm/recipes/smollm
