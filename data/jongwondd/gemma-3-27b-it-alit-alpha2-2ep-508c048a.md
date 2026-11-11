# Jongwondd/Gemma-3-27B-IT-ALiT-alpha2-2ep-508c048a

## Resumen

Gemma-3-27B-IT-ALiT-alpha2-2ep-508c048a es un adaptador LoRA (no fusionado) publicado por el usuario Jongwondd sobre el modelo multimodal google/gemma-3-27b-it. El adaptador procede de un entrenamiento de dos épocas completas orientado a la negación, realizado con un método denominado ALiT con α=2 según la model card del autor. No se trata de un modelo base independiente ni de un checkpoint intermedio: es el resultado final de una ejecución de investigación concreta.

El interés del artefacto es acotado y de carácter investigador: explora cómo un ajuste fino de bajo rango sobre un modelo de 27.000 millones de parámetros afecta al comportamiento relacionado con la negación, un fenómeno lingüístico relevante para la fiabilidad de los LLM. El repositorio pesa 0,5 GB, lo que confirma que contiene únicamente los pesos del adaptador, no los del modelo base.

No se han publicado resultados de evaluación en la información disponible, y el propio autor advierte que se trata de un checkpoint de investigación sin validación de seguridad para producción. Cualquier uso requiere descargar por separado el modelo base de Google y aceptar su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de google/gemma-3-27b-it); adaptador LoRA sobre la base |
| Parametros totales | 27.000 millones (modelo base); el adaptador LoRA es de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma (licencia del modelo base de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0 |
| Tamano del repositorio | 0,5 GB |
| Modelo base | google/gemma-3-27b-it (revision 005ad3404e59d6023443cb575daa05336842228a) |
| Libreria | peft |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 27B IT, un transformer multimodal de Google que procesa entradas de imagen y texto. El adaptador en sí es un LoRA de rango 16 con alpha 32 y dropout 0, inicializado desde la base sin pesos previos ("fresh base"). Según la model card, el método empleado es ALiT con α=2, un objetivo específico del autor cuyo detalle completo se documenta en el archivo `training_provenance.json` del repositorio.

El entrenamiento se realizó sobre la partición de entrenamiento de PopQA, con 14.951 pares y 4.534 casos. Se completaron 2 épocas, con 29.902 ejemplos vistos y 1.872 pasos de optimizador. El autor indica explícitamente que los baselines SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación. Los bytes de los pesos no se han modificado respecto al adaptador original (SHA-256 `508c048ac62165dc56dd2194447d329387ecb1ceed09ef81d447b6c2e4a5febd`); solo se ha hecho portable la configuración PEFT (localizador y revisión del modelo base), con los hashes originales y publicados registrados en `training_provenance.json`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 3 27B IT.
- Procesamiento de imagen y texto (pipeline image-text-to-text), incluyendo entradas de imagen cuando aplique según el procesador del modelo base.
- Ajuste específico orientado a la negación, según la model card del autor.
- Capacidades de tool calling, agentes y multilingüismo: no documentadas en la información proporcionada para este adaptador; deben asumirse las del modelo base, sin garantía.
- No se documentan modos especiales (thinking, audio) en la información disponible.

## Casos de uso

- Investigación sobre negación en LLM: el adaptador permite comparar el comportamiento del modelo base frente a la versión ajustada en tareas que implican negación, usando el mismo prompt y tokenizador.
- Reproducción de experimentos académicos: sirve para replicar la ejecución ALiT α=2 sobre PopQA con los hiperparámetros documentados (rango 16, alpha 32, 2 épocas, 1.872 pasos).
- Análisis de adaptadores LoRA: útil para estudiar el efecto de un ajuste de bajo rango sobre un modelo multimodal de 27B sin necesidad de reentrenar.
- Evaluación de robustez lingüística: permite medir si el ajuste mejora la consistencia en consultas con negaciones explícitas, siempre con conjuntos de test independientes.
- Docencia y formación: ejemplo práctico de carga de un adaptador PEFT sobre un modelo multimodal con `PeftModel.from_pretrained` y `Gemma3ForConditionalGeneration`.
- Estudio de procedencia y trazabilidad: el repositorio incluye hashes de configuración y datos, útil como caso de buenas prácticas de reproducibilidad en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; además, las particiones de evaluación previamente observadas son datos de desarrollo, no datos de test independientes, y las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB; el modelo base de 27B en bfloat16 requiere del orden de 54 GB de VRAM solo para pesos, más overhead de activaciones y caché KV (estimación, no dato publicado).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para inferencia en precisión completa.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16 sin cuantización del base; requeriría cuantización o descarga a CPU/offload, no documentado para este adaptador.
- Despliegue: la model card solo documenta carga con Transformers + PEFT. Opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador y requerirían fusión previa de los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-27B-IT-ALiT-alpha2-2ep (este) | 27B (base) + LoRA r16 | no disponible | Adaptador LoRA de investigación | gemma | Hugging Face, 0 descargas |
| google/gemma-3-27b-it | 27B | no disponible en la informacion | Modelo base multimodal | gemma | Hugging Face (oficial) |
| Otros adaptadores LoRA sobre Gemma 3 27B IT | 27B (base) + LoRA | no disponible | Adaptadores de investigación | gemma | Hugging Face (comunidad) |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas, según el propio autor.
- No incluye los pesos ni el tokenizador del modelo base; es necesario descargar google/gemma-3-27b-it por separado y aceptar su licencia y políticas de uso.
- La paridad de descarga e inferencia desde el Hub público no está garantizada por el autor; solo se comprobó localmente el parseo de la configuración del adaptador.
- Las particiones de evaluación previamente observadas son datos de desarrollo, no test independiente; los resultados proxy basados en reglas no son precisión semántica.
- Sesgos conocidos: no documentados específicamente para este adaptador; se heredan los del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas: la model card declara únicamente inglés; el comportamiento multilingüe no está garantizado.
- Restricciones comerciales: sujetas a la licencia Gemma de Google; consultar `LICENSE`, `NOTICE` y `USE_POLICY.md` del repositorio.
- Sin afiliación ni respaldo implícito por parte del proveedor del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-27B-IT-ALiT-alpha2-2ep-508c048a
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Revisión del modelo base: 005ad3404e59d6023443cb575daa05336842228a
- Archivo de procedencia: `training_provenance.json` (incluido en el repositorio)
- Licencia y políticas: `LICENSE`, `NOTICE`, `USE_POLICY.md` (incluidos en el repositorio)
