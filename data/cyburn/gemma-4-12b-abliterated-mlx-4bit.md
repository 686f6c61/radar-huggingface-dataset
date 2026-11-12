# cyburn/gemma-4-12B-abliterated-mlx-4bit

## Resumen

`cyburn/gemma-4-12B-abliterated-mlx-4bit` es una conversión a formato MLX de 4 bits de un modelo de la familia Gemma 4, publicada por el usuario cyburn en Hugging Face. El nombre indica dos transformaciones encadenadas: por un lado, una variante "abliterated", es decir, un ajuste fino orientado a eliminar (ablacionar) la dirección de rechazo del modelo original para reducir sus negativas a responder; por otro, una cuantización a 4 bits en formato MLX, el framework de Apple para ejecutar modelos en silicio Apple (M1/M2/M3/M4).

El repositorio contiene 11.907.350.272 parámetros reales según los safetensors, lo que sitúa al modelo en torno a los 12.000 millones de parámetros, con un tamaño de repo de 6,8 GB coherente con una cuantización de 4 bits. La model card publicada por el autor es prácticamente vacía: solo declara `language: en`, `library_name: mlx` y `pipeline_tag: text-generation`, sin información sobre arquitectura, datos de entrenamiento, benchmarks ni licencia.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación técnica. Es útil para quien quiera ejecutar localmente en un Mac una variante sin censura de un Gemma de ~12B en 4 bits, pero no es una referencia para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Gemma 4; no confirmado en la model card) |
| Parametros totales | 11.907.350.272 (~11,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otros formatos en el repo |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras). El identificador del modelo sugiere que se parte de un Gemma 4 de aproximadamente 12B parámetros, pero el autor no confirma la arquitectura base ni la versión concreta del modelo original de Google.

Respecto al proceso de creación, el nombre "abliterated" indica que se ha aplicado una técnica de ablación de direcciones en el espacio de activaciones o pesos para suprimir el comportamiento de rechazo, un procedimiento habitual en la comunidad de modelos sin censura. Posteriormente se ha cuantizado a 4 bits con MLX. No se documenta el método exacto de ablación, el dataset usado para el ajuste ni los parámetros de cuantización (group size, bits por peso más allá del 4-bit nominal).

## Capacidades

- Generación de texto conversacional en inglés, según el `pipeline_tag` declarado.
- Comportamiento "abliterated": se espera una reducción de las negativas del modelo base a peticiones que el original rechazaría, aunque no hay evaluación publicada que lo cuantifique.
- Ejecución en Apple Silicon mediante MLX, con pesos ya convertidos a 4 bits.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; la model card solo declara inglés.
- No hay información sobre ventana de contexto efectiva ni sobre soporte de system prompts.

## Casos de uso

- Experimentación local en Mac: cargar el modelo con MLX en un equipo Apple Silicon para probar generación de texto sin depender de servicios en la nube, aprovechando la cuantización de 4 bits para reducir el uso de memoria.
- Investigación sobre alineación y censura: comparar las respuestas de esta variante con las del Gemma base para estudiar el efecto de la ablación en la tasa de rechazos, siempre en un entorno controlado y con revisión humana.
- Prototipado de asistentes conversacionales en inglés: usar el modelo como backend de un chatbot de pruebas en local antes de decidir si se migra a un modelo con licencia clara y benchmarks publicados.
- Evaluación de calidad de cuantización: medir la degradación de un Gemma de ~12B al pasar a 4 bits en MLX frente a los pesos originales en precisión completa, útil para decidir qué nivel de cuantización usar en producción.
- Generación de texto creativo y lluvia de ideas en inglés: tareas de bajo riesgo donde la ausencia de filtros de rechazo puede resultar útil para explorar temas sensibles en ficción, con revisión editorial posterior.
- Docencia y demos de MLX: ilustrar en un taller cómo se convierte y ejecuta un modelo de ~12B en 4 bits en un portátil Apple, usando este repo como ejemplo práctico de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: con 11,9B parámetros en 4 bits, los pesos ocupan aproximadamente 6,8 GB (tamaño del repo); hay que sumar overhead de activaciones y caché KV, por lo que conviene reservar del orden de 9-12 GB de memoria unificada según la longitud de contexto.
- GPU recomendadas: no aplica en el sentido CUDA; el formato MLX está pensado para Apple Silicon. En Mac, se recomienda un chip con al menos 16 GB de memoria unificada (M1/M2/M3/M4 base) y 24-32 GB para contextos largos o lotes mayores.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 16 GB o más de memoria unificada. En GPUs NVIDIA de consumo no es directamente utilizable sin reconvertir los pesos a otro formato (GGUF, safetensors estándar), algo que este repo no ofrece.
- Opciones de despliegue: `mlx-lm` (librería MLX para modelos de lenguaje); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repo concreto.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyburn/gemma-4-12B-abliterated-mlx-4bit | ~11,9B | no disponible | MLX safetensors 4-bit | no disponible | Hugging Face, 0 descargas |
| Gemma base de ~12B (referencia) | ~12B | no disponible en esta ficha | safetensors, GGUF, etc. | licencia Gemma de Google | amplia |
| Otras variantes "abliterated" de la comunidad | variable | variable | safetensors, GGUF | habitualmente heredada del base | variable |

No se dispone de datos de rendimiento comparado ni de modelos alternativos verificados en la información proporcionada; la comparativa anterior es estructural y no incluye métricas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o con el titular de la licencia del modelo base antes de cualquier despliegue productivo.
- Modelo "abliterated": la supresión del comportamiento de rechazo puede aumentar la probabilidad de generar contenido dañino, ofensivo o inseguro; requiere filtros y revisión propios si se expone a usuarios.
- Sin model card técnica: no hay información sobre datos de entrenamiento, sesgos, contexto máximo ni evaluación, lo que impide estimar su calidad de forma rigurosa.
- Riesgo de alucinación: no cuantificado; al ser una cuantización de 4 bits de un derivado sin evaluación, la degradación respecto al original es desconocida.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Formato MLX: no es portable a GPUs NVIDIA sin reconversión; limita su uso a equipos Apple.
- Fecha de creación futura (2026-11-12) en los metadatos: conviene verificar la procedencia y la integridad del repo antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/cyburn/gemma-4-12B-abliterated-mlx-4bit
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
