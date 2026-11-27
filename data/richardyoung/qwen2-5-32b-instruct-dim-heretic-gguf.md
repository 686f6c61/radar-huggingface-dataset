# richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, que a su vez deriva del Qwen2.5-32B-Instruct de Alibaba. El autor, richardyoung, publica esta variante "heretic" (también etiquetada como "abliterated" y "uncensored"), una modificación que elimina o atenúa los mecanismos de rechazo del modelo original mediante técnicas de abliteration. El resultado es un modelo de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) orientado a investigación sobre alineamiento y generación de texto sin restricciones de contenido.

La relevancia de esta ficha radica en que combina tres elementos: la base sólida de Qwen2.5-32B-Instruct (un transformer denso de la familia Qwen2.5, con buen rendimiento en razonamiento y código), una intervención de alineamiento inverso (abliteration) y un empaquetado en GGUF con cuantización mediante imatrix, lo que permite ejecutar el modelo en llama.cpp y Ollama. El repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga.

El contexto de esta publicación es el interés creciente en la comunidad de investigación por modelos "uncensored" para estudiar sesgos, refusal behavior y dinámicas de alineamiento. No obstante, debe subrayarse que el modelo solo declara soporte para inglés y que su licencia Apache 2.0 no exime de responsabilidad sobre el uso que se haga de un modelo sin salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-32B-Instruct), modificado mediante abliteration |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | GGUF con cuantizacion basada en imatrix (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | Ingles (segun la ficha del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm y activación SwiGLU, tal como caracteriza a la familia Qwen2.5. Sobre esta base, el autor aplica una técnica de abliteration (referida en las etiquetas como "heretic" y "abliterated"), que consiste en identificar la dirección en el espacio de activaciones asociada al comportamiento de rechazo y proyectarla fuera de los pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. Esta intervención no requiere reentrenamiento completo, sino una modificación quirúrgica de los pesos.

No se dispone de información sobre el número de tokens de entrenamiento adicional, la composición del dataset de la variante heretic ni si se aplicó RLHF o DPO específico tras la abliteration. La cuantización a GGUF se realizó con imatrix (importance matrix), una técnica que calibra la cuantización con datos de activación para preservar mejor la calidad en bits reducidos. El repositorio incluye la etiqueta arxiv:2611.17846, que apunta a un paper de referencia, aunque su contenido no se detalla en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y resolución de problemas de complejidad media-alta gracias al tamaño de 32,8 B parámetros.
- Generación de código y soporte de matemáticas, capacidades propias de la base Qwen2.5.
- Comportamiento sin rechazo (uncensored): el modelo no activa negativas ante contenido que el original rechazaría, lo que es el objetivo declarado de la variante.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema llama.cpp/Ollama.
- Capacidades multilingües limitadas: solo se declara inglés, aunque la base Qwen2.5 es multilingüe y podría conservar parte de esa capacidad sin garantía.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y refusal behavior: el modelo permite estudiar qué tipos de peticiones activan rechazo en la base y cómo la abliteration altera esas respuestas, comparando con Qwen2.5-32B-Instruct original en experimentos controlados.
- Evaluación de sesgos y seguridad: al carecer de salvaguardas, sirve como caso extremo para medir la eficacia de filtros externos y clasificadores de contenido en pipelines de moderación.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo original podría negarse; adecuado para talleres literarios o prototipado creativo en entornos controlados.
- Despliegue local en llama.cpp u Ollama: gracias al formato GGUF, puede ejecutarse en estaciones de trabajo con GPU consumer de gama alta, útil para experimentación offline sin dependencia de API.
- Red teaming de aplicaciones: uso del modelo para generar prompts adversariales y probar la robustez de sistemas de moderación o de otros LLM alineados.
- Análisis de datos conversacionales en inglés: tareas de resumen, extracción y clasificación de texto en inglés donde el contenido pueda ser sensible y se requiera un modelo sin filtros internos.
- Docencia e investigación académica: estudio de las diferencias entre modelos alineados y no alineados en tareas de razonamiento, comparando tasas de rechazo y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~32,8 B parámetros en GGUF, una cuantización de 4 bits requiere aproximadamente 18-20 GB de VRAM; 5 bits, ~22-24 GB; 8 bits, ~34-36 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos publicados para esta variante concreta.
- GPU recomendadas: para cuantizaciones de 4-5 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo; para 8 bits se recomienda A100 40 GB, A6000 48 GB o H100 80 GB.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 16 GB no cabe completo y requeriría offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; la etiqueta endpoints_compatible sugiere integración con servicios de inferencia, aunque no se detalla cuáles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-GGUF (este) | ~32,8 B | No disponible | Apache 2.0 | GGUF | Variante uncensored, solo inglés declarado, acceso restringido |
| Qwen2.5-32B-Instruct (original) | ~32,8 B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo alineado, multilingüe, benchmarks públicos |
| Qwen2.5-Coder-32B-Instruct | ~32,8 B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 | Safetensors, GGUF | Especializado en código, alineado |
| Llama-3.3-70B-Instruct | ~70 B | 128.000 tokens | Llama 3.3 Community License | Safetensors, GGUF | Mayor tamaño, requiere más VRAM, alineado |

La comparación con el original Qwen2.5-32B-Instruct es la más directa: misma base de parámetros, pero este repositorio añade la modificación heretic y el empaquetado GGUF con imatrix. Frente a Llama-3.3-70B, este modelo es aproximadamente la mitad de grande, lo que facilita su despliegue en hardware consumer, a costa de menor capacidad bruta. No se dispone de benchmarks comparativos publicados para esta variante concreta.

## Limitaciones y advertencias

- Modelo sin salvaguardas: la abliteration elimina el comportamiento de rechazo, por lo que puede generar contenido dañino, ilegal o inexacto sin advertencia; no es apto para aplicaciones orientadas al público sin filtros externos.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, citas o código; la eliminación de rechazos no reduce este riesgo y puede agravarlo al responder con seguridad sobre temas que el original habría evitado.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado respecto a la base multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el autor y la plataforma no asumen responsabilidad por el uso; el acceso está restringido (gated) y requiere aceptar condiciones, lo que implica un compromiso de uso responsable.
- Contexto: no se confirma la longitud de contexto de esta variante; si se hereda la del original (131.072 tokens), el rendimiento en contextos muy largos con cuantización GGUF puede degradarse.
- Calidad de cuantización: aunque imatrix preserva mejor la calidad, las cuantizaciones agresivas (2-3 bits) pueden degradar el razonamiento y aumentar la incoherencia.
- Reproducibilidad: al ser una modificación no oficial de un modelo de Alibaba, no cuenta con el respaldo ni la validación del equipo Qwen; los resultados pueden diferir de los benchmarks oficiales del original.
- Uso en producción: requiere auditoría propia, filtros de contenido y monitorización; no debe desplegarse en entornos regulados sin evaluación de riesgos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo base (no GGUF): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Paper de referencia (etiqueta arxiv:2611.17846): https://arxiv.org/abs/2611.17846
- Qwen2.5-32B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
