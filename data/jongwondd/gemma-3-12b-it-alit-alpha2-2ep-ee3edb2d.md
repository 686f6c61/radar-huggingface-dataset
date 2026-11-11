# Jongwondd/Gemma-3-12B-IT-ALiT-alpha2-2ep-ee3edb2d

## Resumen

Gemma-3-12B-IT-ALiT-alpha2-2ep es un adaptador LoRA de investigación publicado por el usuario Jongwondd sobre el modelo base google/gemma-3-12b-it. No es un modelo independiente ni una exportación fusionada: se distribuye exclusivamente como pesos de adaptador PEFT (0,3 GB) que requieren descargar el modelo base original de Google para poder ejecutarse. El adaptador se ha entrenado con el método denominado ALiT con α=2, orientado a tareas de negación (negation), durante dos épocas completas sobre el conjunto PopQA de entrenamiento (14.951 pares / 4.534 casos).

El modelo hereda la arquitectura multimodal de Gemma 3 12B IT (pipeline image-text-to-text), por lo que conserva las capacidades de procesamiento de imagen y texto del modelo base, aunque el adaptador se ha ajustado únicamente para el comportamiento de negación en inglés. La relevancia de esta publicación es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la ficha, sin resultados de evaluación publicados y sin validación de seguridad para producción.

La ficha describe un artefacto de investigación reproducible más que un modelo listo para despliegue. Cualquier uso práctico exige cargar el adaptador sobre el base de Google, respetar la licencia Gemma y asumir que no existen garantías de calidad ni paridad de inferencia verificada públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Gemma 3 (image-text-to-text); el adaptador en sí es PEFT/LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base google/gemma-3-12b-it tiene 12B (según denominación del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Gemma 3, no detalladas aquí) |
| Idiomas soportados | Inglés (en) |
| Licencia | gemma (licencia del modelo base de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, alpha 32 y dropout 0, aplicado sobre el modelo base google/gemma-3-12b-it en la revisión 96b6f1eccf38110c56df3a15bffe176da04bfd80. El entrenamiento empleó el método ALiT con α=2, partiendo de una inicialización fresca sobre el base. Se completaron dos épocas sobre el conjunto de entrenamiento PopQA (14.951 pares, 4.534 casos), lo que supone 29.902 ejemplos vistos y 1.872 pasos de optimizador. El objetivo específico del método, los ajustes de entrenamiento retenidos y los hashes del resumen de fuentes y de los datos están documentados en el archivo training_provenance.json del repositorio.

La publicación indica que los bytes de los pesos no se han modificado respecto al adaptador original (SHA-256 ee3edb2d23009e276cffc3320005bb455acd728b6e3b2e1ddf3577829b911740); solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, y no se especifican detalles sobre la composición completa del dataset más allá de PopQA ni sobre el uso de RLHF o DPO. El autor advierte explícitamente que las líneas base SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 3 12B IT.
- Procesamiento de imagen y texto (pipeline image-text-to-text), incluyendo entradas de imagen cuando se usa el procesador del modelo base.
- Ajuste específico para comportamiento de negación en inglés, objetivo declarado del entrenamiento ALiT.
- Soporte de tool calling y function calling: no documentado en la información proporcionada; se desconoce si el adaptador lo preserva.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión avanzada o audio: no documentado en la información proporcionada.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite reproducir y analizar el efecto del método ALiT α=2 sobre un base Gemma 3 12B IT, comparando respuestas antes y después del ajuste en tareas de negación.
- Evaluación de métodos de ajuste paramétricamente eficiente: al ser un LoRA de rango 16 sobre un base de 12B, sirve para estudiar el impacto de adaptadores pequeños en el comportamiento del modelo sin reentrenar el base completo.
- Experimentos de reproducibilidad: el repositorio incluye hashes de procedencia (training_provenance.json) que permiten verificar la integridad del adaptador y de los datos en estudios académicos.
- Análisis de robustez ante prompts negados: útil para medir cómo responde el modelo a instrucciones con negaciones explícitas y detectar fallos de comprensión.
- Docencia y formación en PEFT: ejemplo práctico de carga de un adaptador LoRA sobre un modelo multimodal con Transformers y PEFT.
- Investigación sobre sesgos y alucinación en modelos multimodales: el checkpoint permite estudiar cómo un ajuste específico puede alterar (o no) los sesgos del base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; las divisiones de evaluación previamente observadas son datos de desarrollo, no datos de test independientes, y las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Gemma 3 12B IT. En bfloat16, un modelo de 12B requiere del orden de 24 GB de VRAM solo para pesos, más memoria para activaciones y KV cache.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño del base, se necesitan GPUs con al menos 24-40 GB de VRAM (A100 40/80 GB, H100, L40S) para inferencia en precisión completa; no se confirma compatibilidad con RTX 4090 de 24 GB sin cuantización.
- ¿Cabe en GPU consumer?: no confirmado. Con cuantización del base a 8 o 4 bits podría ser viable en GPUs de 24 GB, pero no hay datos publicados para este adaptador.
- Opciones de despliegue: el autor documenta carga mediante Transformers (Gemma3ForConditionalGeneration) y PEFT (PeftModel). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-12B-IT-ALiT-alpha2-2ep | Adaptador LoRA sobre base de 12B | No disponible | gemma | safetensors (PEFT) | Checkpoint de investigación, sin benchmarks publicados |
| google/gemma-3-12b-it | 12B | No disponible en esta ficha | gemma | safetensors | Modelo base oficial de Google, con evaluación publicada por el proveedor |
| Otros adaptadores LoRA de negación sobre Gemma 3 | No disponible | No disponible | gemma | safetensors (PEFT) | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoría; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para producción; el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos ni el tokenizador del modelo base; es obligatorio obtener acceso a google/gemma-3-12b-it y respetar su licencia y políticas de uso (LICENSE, NOTICE, USE_POLICY.md).
- La licencia Gemma impone restricciones de uso comercial y de redistribución; debe revisarse antes de cualquier despliegue.
- El adaptador está entrenado y etiquetado únicamente para inglés; el rendimiento en otros idiomas no está garantizado.
- No hay resultados de benchmarks ni evaluación independiente publicados; las métricas de entrenamiento no son métricas de calidad.
- El autor no reclama paridad de descarga e inferencia en el Hub público; la configuración se verificó localmente.
- Riesgo de alucinación y sesgos heredados del modelo base, potencialmente alterados por el ajuste de negación de forma no caracterizada.
- El ajuste específico en negación puede degradar otras capacidades del base (razonamiento general, visión, tool calling), aunque no se documenta el alcance de esta degradación.
- Repositorio con cero descargas y cero likes: no hay evidencia comunitaria de uso ni informes de errores.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-12B-IT-ALiT-alpha2-2ep-ee3edb2d
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Resultados de búsqueda web: no se han encontrado enlaces relevantes adicionales (solo apareció la página principal de Wikipedia en francés, sin relación con el modelo).
