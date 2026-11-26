# CoderBak/ai-detector-dev-11-14

## Resumen

CoderBak/ai-detector-dev-11-14 es un modelo alojado en Hugging Face cuyo propósito declarado, según su etiqueta de pipeline, es la detección de autoría (authorship-detection), es decir, la clasificación de si un texto ha sido generado por una persona o por un sistema de IA. Lo publica el usuario CoderBak bajo un repositorio con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de poder descargar los pesos. El repositorio ocupa 1,6 GB, un tamaño compatible con un modelo de varios cientos de millones de parámetros en precisión de 16 bits, aunque no se especifica la arquitectura ni el número exacto de parámetros.

La información pública disponible es muy limitada: no se declara licencia, no hay ficha de modelo con detalles de entrenamiento, no se indica la longitud de contexto y no se publican resultados de benchmarks. El modelo está etiquetado únicamente para inglés (en) y para la región US. Es relevante ahora por el interés creciente en herramientas de atribución de contenido generado por IA, pero su adopción en producción exige validación propia dado el escaso soporte documental.

Se trata, por tanto, de un artefacto de investigación o experimental más que de un modelo listo para producción: sin licencia declarada, sin pipeline definido y sin métricas publicadas, cualquier evaluación rigurosa debe hacerse por cuenta del usuario tras solicitar acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 1,6 GB) |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,6 GB, presumiblemente safetensors o bin, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. El tamaño del repositorio (1,6 GB) sugiere un modelo de escala media (del orden de cientos de millones de parámetros en fp16), pero no hay confirmación oficial del número de parámetros, del tipo de transformer ni de si incorpora una cabeza de clasificación para la tarea de detección de autoría.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del corpus (textos humanos frente a generados, modelos de origen de las muestras sintéticas), ni si hubo ajuste fino supervisado, RLHF o DPO. La etiqueta authorship-detection apunta a una tarea de clasificación binaria o multiclase, pero no se detalla el esquema de etiquetas ni el procedimiento de evaluación.

## Capacidades

- Detección de autoría: clasificación de textos en inglés según su probable origen humano o generado por IA, conforme a la etiqueta del repositorio.
- Procesamiento de texto en inglés: el modelo está etiquetado exclusivamente para este idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades especiales (modo thinking, visión, audio) en la información disponible.
- No se declara pipeline de Hugging Face, por lo que la interfaz de uso (clasificación, generación u otra) no está confirmada.

## Casos de uso

- Moderación de contenido en plataformas: usar el modelo como clasificador auxiliar para marcar textos sospechosos de generación automática antes de una revisión humana, dado su propósito declarado de detección de autoría.
- Verificación en entornos educativos: integrar el detector en flujos de revisión de trabajos escritos en inglés, siempre como señal complementaria y no como prueba concluyente.
- Auditoría de datasets: filtrar corpus en inglés para estimar la proporción de texto sintético antes de emplearlos en el entrenamiento de otros modelos.
- Investigación sobre atribución de contenido: emplear el modelo como línea base en estudios comparativos de detectores de texto generado por IA.
- Control de calidad editorial: señalar artículos o reseñas en inglés que podrían haber sido redactados íntegramente por un sistema automático.
- Filtrado en pipelines de datos web: descartar páginas en inglés con alta probabilidad de contenido generado antes de incorporarlas a un índice o a un almacén documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con un repositorio de 1,6 GB, los pesos en fp16 caben holgadamente en GPUs de consumo con 8 GB o más, pero la cifra exacta depende de la arquitectura no documentada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para cargar los pesos en fp16; para lotes grandes se recomienda A100 o H100.
- GPU de consumo: probablemente cabe en RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB en adelante, sujeto a verificación tras obtener acceso.
- Opciones de despliegue: no se documenta ninguna; al no declararse pipeline ni formato de pesos, no es posible confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoderBak/ai-detector-dev-11-14 | no disponible | no disponible | Detección de autoría (en) | no disponible | Gated |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con otros detectores de texto generado por IA.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso para uso comercial ni para redistribución.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que añade fricción a cualquier despliegue automatizado.
- Sin documentación de entrenamiento ni de evaluación: el riesgo de alucinación y de falsos positivos en la clasificación no puede cuantificarse.
- Los detectores de texto generado por IA presentan sesgos conocidos hacia textos formales, no nativos o altamente estructurados, que pueden confundirse con salida automática; sin métricas publicadas, este riesgo queda sin acotar.
- Cobertura limitada al inglés: no debe emplearse con textos en castellano u otros idiomas.
- Longitud de contexto desconocida: no es posible garantizar el comportamiento con documentos largos.
- Sin pipeline declarado: la interfaz de inferencia debe determinarse tras inspeccionar el repositorio.
- Fecha de creación posterior a la actual (2026-11-14): conviene verificar la integridad y vigencia del artefacto antes de usarlo.
- Uso en producción desaconsejado sin una evaluación propia sobre un conjunto de validación representativo del dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/CoderBak/ai-detector-dev-11-14
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
