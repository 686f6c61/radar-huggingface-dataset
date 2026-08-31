# q-project/Q-50M-Base

## Resumen

Q-50M-Base es un modelo de lenguaje causal de tipo decoder-only desarrollado por Q-Project, con 50,9 millones de parámetros. Se trata de un modelo base pretreinado desde cero sobre aproximadamente 5 mil millones de tokens del dataset FineWeb-Edu, sin herencia de pesos de otros modelos. Su propósito principal es servir como punto de partida para fine-tuning y como herramienta de experimentación en arquitecturas compactas, no como un asistente conversacional o de instrucciones.

El modelo incorpora tres mecanismos de bajo coste orientados a mejorar la estabilidad y la eficiencia paramétrica a escala reducida: atención por grupos de consultas (GQA) con 8 cabezas de consulta y 2 de clave/valor, normalización QK por cabeza antes del cálculo de puntuaciones de atención, y compuertas escalares dependientes del contenido en las ramas residuales de atención y MLP. La implementación se apoya en las clases Mistral de Hugging Face para compatibilidad con las APIs de generación y caché, pero sustituye las capas de atención y decoder por implementaciones propias de Q-Project.

Con una ventana de contexto máxima de 2.048 tokens y un vocabulario de 32.768 entradas, Q-50M-Base está diseñado para entornos con recursos limitados, incluyendo inferencia en CPU o GPU de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para prototipado rápido y para estudiar el comportamiento de arquitecturas con GQA y QK-Norm en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con GQA, QK-Norm y compuertas residuales escalares |
| Parametros totales | 50.878.208 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Q-50M-Base sigue la forma general de un Transformer decoder moderno con 10 capas, dimensión oculta de 512 y MLP SwiGLU con tamaño intermedio de 1.792. El embedding de entrada y la cabeza de salida están atados (tied), lo que ahorra aproximadamente 16,8 millones de parámetros que se redirigen a las capas del decoder. La atención utiliza 8 cabezas de consulta y 2 cabezas de clave/valor, reduciendo el tamaño de la caché KV en un factor de 4 en comparación con atención multi-cabeza estándar de 8 cabezas, lo que mejora el rendimiento de inferencia autoregresiva.

Cada capa aplica RMSNorm antes de la atención y del MLP, con normalización QK por cabeza para estabilizar las magnitudes de las puntuaciones de atención. Las compuertas residuales escalares dependientes del contenido modulan la contribución de cada rama antes de sumarse al flujo residual, añadiendo muy pocos parámetros y mejorando la estabilidad del entrenamiento. La codificación posicional usa RoPE con theta 10.000 en todas las capas. El entrenamiento se realizó con PyTorch SDPA como backend de atención, sobre 5 mil millones de tokens de FineWeb-Edu, sin etapas de RLHF ni DPO. No se ha publicado información sobre el número exacto de pasos, tasa de aprendizaje o estrategia de regularización.

## Capacidades

- Generacion de texto por continuacion: el modelo predice el siguiente token dado un contexto, funcionando como un LM causal estandar.
- Modelo base para fine-tuning: diseñado para ser adaptado a tareas especificas mediante entrenamiento adicional supervisado o de refuerzo.
- Soporte de tool calling: no disponible de forma nativa; al ser un modelo base, no incluye entrenamiento para invocar funciones.
- Soporte de agentes y multi-step reasoning: no disponible; requiere fine-tuning o integracion con frameworks externos.
- Capacidades multilingues: limitadas al ingles, unico idioma presente en el dataset de entrenamiento.
- Capacidades especiales: ninguna adicional como vision, audio o modo de pensamiento explicito.

## Casos de uso

- Prototipado de aplicaciones de generacion de texto: por su tamano reducido, se puede desplegar en local para experimentar con generacion de continuaciones de texto en ingles, por ejemplo en herramientas de autocompletado de documentos o de generacion de contenido preliminar.
- Fine-tuning para clasificacion de texto: al ser un modelo base, puede adaptarse con un clasificador en la cabeza para tareas como analisis de sentimiento o categorizacion de documentos, aprovechando su representacion compacta y su licencia permisiva.
- Investigacion academica sobre arquitecturas eficientes: su configuracion con GQA, QK-Norm y compuertas residuales permite estudiar el impacto de estos mecanismos en modelos de menos de 100M de parametros, comparando con variantes sin ellos.
- Ensenanza de modelos de lenguaje: su tamano y simplicidad lo hacen util para demostrar conceptos de atencion, embeddings atados y entrenamiento desde cero en cursos de procesamiento de lenguaje natural.
- Generacion de datos sinteticos para entrenamiento: puede usarse para crear corpus de texto en ingles de baja calidad controlada, utiles como aumentacion de datos o para probar pipelines de limpieza.
- Inferencia en entornos sin GPU: al requerir menos de 100 MB en precision FP16, puede ejecutarse en CPU o en dispositivos embebidos con memoria limitada, sirviendo como base para asistentes de escritura offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 204 MB (50,9M × 4 bytes). En FP16, unos 102 MB. En cuantizacion INT8, unos 51 MB. No se proporcionan pesos cuantizados, pero el usuario puede generarlos con herramientas como llama.cpp o GPTQ.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas las integradas modernas. Modelos como RTX 3050, GTX 1650 o incluso Raspberry Pi con suficiente RAM pueden ejecutar el modelo en CPU.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en las mas modestas.
- Opciones de despliegue: al usar la libreria transformers, se puede servir con vLLM, TGI o llama.cpp tras convertir los pesos a GGUF. Tambien es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 50M, se espera una generacion de decenas de tokens por segundo en GPU moderna y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamano similar. En el ecosistema de modelos pequenos, alternativas como GPT-2 (124M) o TinyLlama (1.1B) tienen mas parametros y no son directamente comparables. Q-50M-Base se posiciona en el rango de modelos de menos de 100M, donde no hay referencias estandar con datos de rendimiento publicos.

## Limitaciones y advertencias

- Modelo base, no instruido: no sigue instrucciones ni mantiene dialogos coherentes; su salida es puramente continuacion de texto.
- Sesgos y toxicidad: al entrenarse solo con FineWeb-Edu, puede heredar sesgos presentes en ese corpus, aunque la seleccion educativa reduce la toxicidad comparado con datasets generales. No se han realizado evaluaciones de sesgo.
- Riesgo de alucinacion: como cualquier LM causal, puede generar contenido factualmente incorrecto o inventado, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 2.048 tokens es corta para tareas que requieren contexto largo; no soporta atencion extendida.
- Idioma: solo ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe cumplir con las condiciones de atribucion y responsabilidad. No hay restricciones adicionales conocidas.
- Adecuacion para produccion: dado su tamano y falta de evaluaciones, no se recomienda para aplicaciones criticas sin un fine-tuning y una validacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/Q-50M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de Q-Project en GitHub: https://github.com/projectqai (sin confirmar que albergue el codigo de este modelo, pero es la unica referencia encontrada)
