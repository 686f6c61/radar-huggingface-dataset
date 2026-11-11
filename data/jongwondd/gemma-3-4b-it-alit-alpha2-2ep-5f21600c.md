# Jongwondd/Gemma-3-4B-IT-ALiT-alpha2-2ep-5f21600c

## Resumen

Gemma-3-4B-IT-ALiT-alpha2-2ep-5f21600c es un adaptador LoRA (no un modelo completo) construido sobre google/gemma-3-4b-it, publicado por el usuario Jongwondd en Hugging Face. Se trata de un checkpoint final de investigación resultante de un entrenamiento de dos épocas con el método denominado ALiT (α=2), orientado a tareas de negación (negation) sobre el conjunto PopQA. El adaptador no incluye los pesos del modelo base ni el tokenizer; para usarlo es necesario descargar por separado google/gemma-3-4b-it en la revisión 093f9f388b31de276ce2de164bdc2081324b9767.

El modelo hereda la arquitectura multimodal de Gemma 3 en su variante de 4B parámetros, con pipeline image-text-to-text, y por tanto conserva las capacidades de entrada de imagen y texto del base. El adaptador tiene rango LoRA 16, alpha 32 y dropout 0, y se entrenó sobre 14.951 pares correspondientes a 4.534 casos de PopQA, con 29.902 ejemplos vistos y 1.872 pasos de optimizador.

Su relevancia es limitada y estrictamente investigadora: el propio autor declara que no es un modelo validado para producción, que no aporta resultados de evaluación nuevos y que las puntuaciones de desarrollo no constituyen datos de test independientes. Es un artefacto útil para reproducir o inspeccionar un experimento concreto de ajuste sobre negación, no una alternativa práctica a modelos listos para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), adaptador LoRA sobre google/gemma-3-4b-it |
| Parametros totales | 4B en el modelo base (el adaptador LoRA no declara recuento propio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Gemma 3 4B IT) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-it, un transformer multimodal de la familia Gemma 3 que acepta entradas de imagen y texto (pipeline image-text-to-text). El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0, inicializado desde el base sin pesos previos (fresh base). El método declarado es ALiT con α=2, una variante de entrenamiento orientada a negación, cuyos detalles objetivos y configuración retenida se documentan en el fichero training_provenance.json del repositorio.

El entrenamiento se completó durante dos épocas sobre PopQA (14.951 pares, 4.534 casos), con 29.902 ejemplos vistos y 1.872 pasos de optimizador. El autor indica que los bytes de los pesos no se han modificado respecto al adaptador original (SHA-256 5f21600cdb4c51bb271a853be44f4d96b7de73adff3f00cef5a9105f7d0e8f03); solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT publicada. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento heredados del base Gemma 3 4B IT.
- Procesamiento de entradas de imagen junto con texto (pipeline image-text-to-text), usando el procesador y la plantilla de chat del modelo base.
- Ajuste específico orientado a tareas de negación sobre el conjunto PopQA.
- Soporte multilingüe limitado al inglés según la model card (language: en).
- Tool calling, function calling y razonamiento multi-paso: no disponible como capacidad declarada en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite reproducir y analizar el efecto del método ALiT α=2 sobre el comportamiento del base en tareas de negación, comparándolo con las líneas base SFT/UL/DPO mencionadas por el autor.
- Reproducción de experimentos académicos: sirve para verificar el pipeline de entrenamiento (LoRA r=16, alpha=32, dos épocas sobre PopQA) y contrastar los hashes de procedencia registrados en training_provenance.json.
- Estudio de adaptadores PEFT sobre modelos multimodales: útil para examinar cómo un ajuste de bajo rango afecta a un modelo image-text-to-text sin modificar los pesos originales.
- Evaluación comparativa de checkpoints de investigación: permite contrastar este adaptador final frente a checkpoints intermedios o exportaciones fusionadas del mismo experimento.
- Análisis de procedencia y trazabilidad de artefactos: el repositorio documenta hashes de configuración, datos y pesos, lo que facilita auditorías de reproducibilidad en entornos de investigación.
- Docencia y formación técnica: como ejemplo práctico de carga de un adaptador LoRA con PEFT sobre Gemma 3, incluyendo la gestión de revisiones del modelo base y la resolución de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación y que las divisiones de evaluación observadas previamente son datos de desarrollo, no datos de test independientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para este adaptador; depende del modelo base Gemma 3 4B IT. En bfloat16, un modelo de 4B requiere aproximadamente 8 GB solo para pesos, más memoria para activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor. Para el base de 4B en bfloat16 son razonables GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100), aunque no hay datos publicados para este adaptador.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 16 GB o más, sujeto a cuantización del base; no confirmado por el autor.
- Opciones de despliegue: carga mediante Transformers y PEFT (Gemma3ForConditionalGeneration + PeftModel). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-ALiT-alpha2-2ep-5f21600c (este) | 4B en el base + adaptador LoRA | no disponible | sin benchmarks publicados | gemma | Hugging Face, 0 descargas |
| google/gemma-3-4b-it (base) | 4B | no disponible en esta ficha | no disponible en esta ficha | gemma | Hugging Face, oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos del modelo base ni el tokenizer; requiere acceso a google/gemma-3-4b-it y versiones compatibles de Transformers y PEFT.
- El autor no reclama paridad entre la descarga pública desde el Hub y la inferencia local; solo se verificó localmente el parseo de la configuración del adaptador.
- Las divisiones de evaluación previamente observadas son datos de desarrollo, no test independiente; no deben interpretarse como evidencia de generalización.
- Las pérdidas de entrenamiento no son puntuaciones de evaluación.
- Las puntuaciones proxy basadas en reglas, si se reportan en otro lugar, no equivalen a precisión de un juez semántico.
- Los experimentos mecanicistas son independientes de esta publicación y pueden estar incompletos.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Licencia gemma: se aplican la licencia upstream y sus restricciones de uso; deben consultarse LICENSE, NOTICE y USE_POLICY.md.
- No se implica afiliación ni respaldo por parte del proveedor del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-4B-IT-ALiT-alpha2-2ep-5f21600c
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Revisión del base usada: 093f9f388b31de276ce2de164bdc2081324b9767
- Fichero de procedencia del entrenamiento: training_provenance.json (incluido en el repositorio)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes adicionales; los únicos resultados devueltos corresponden a páginas generales de Wikipedia y Wikimedia Commons, sin relación con el modelo.
