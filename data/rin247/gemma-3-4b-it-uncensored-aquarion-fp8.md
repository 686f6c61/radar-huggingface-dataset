# Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP8

## Resumen

Este modelo es una cuantización FP8 weight-only de Gemma 3 4B IT, un modelo de lenguaje de Google, a la que se ha aplicado un proceso de "abliteración" (eliminación de la dirección de rechazo) antes de la cuantización. El autor, Rin247, lo presenta como parte de una serie de modelos "uncensored" destinados a ofrecer respuestas sin los filtros de seguridad habituales del modelo base. Tiene 4.300 millones de parámetros y un tamaño de repositorio de 5 GB. La relevancia de este tipo de variantes reside en la demanda de modelos locales sin restricciones para tareas creativas, de investigación o de desarrollo de asistentes personalizados, aunque su uso conlleva riesgos éticos y legales importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, base) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (weight-only) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP8 weight-only con escalas) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 3 4B IT, un transformer multimodal con atención local y global y optimizaciones para reducir el uso de KV-cache en contextos largos. La model card no ofrece detalles sobre el entrenamiento original, pero el proceso de esta variante consiste en dos pasos: primero, una abliteración mediante proyección ortogonal de la dirección de rechazo del modelo base, y segundo, una cuantización FP8 weight-only realizada con PyTorch RTN en CPU. Las escalas de cuantización se almacenan como buffers separados (`*.weight_scale`, `*.weight_shape`) junto a los pesos, lo que requiere un paso de dequantización antes de la inferencia con motores estandar.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base, aunque no se han verificado específicamente en esta variante.
- Soporte de tool calling y function calling: el modelo base Gemma 3 4B IT lo incluye, pero no se confirma que se conserve tras la abliteración.
- Capacidades multilingües: el modelo base cubre más de 140 idiomas según el informe técnico de Gemma 3, pero esta variante no documenta su alcance.
- Capacidades de visión: el modelo base es multimodal, pero no se indica si la cuantización preserva el codificador de visión.
- Ausencia de filtros de seguridad: el proceso de abliteración elimina la dirección de rechazo, por lo que el modelo puede generar contenido que el modelo base rechazaría.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativas, diálogos o guiones con temáticas que los modelos moderados suelen bloquear, útil para escritores que necesitan explorar escenarios extremos.
- Roleplay y simulación de personajes: su naturaleza sin censura permite interacciones de rol más libres, adecuado para comunidades de juegos de texto o prototipos de asistentes conversacionales.
- Investigación académica sobre sesgos y alineación: permite estudiar el comportamiento de un modelo sin refusals, comparando su output con el del modelo base para analizar el impacto de la abliteración.
- Desarrollo de asistentes personalizados para nichos específicos: por ejemplo, soporte técnico interno donde se requiera responder sin restricciones a preguntas sobre vulnerabilidades o exploits, siempre bajo supervisión humana.
- Pruebas de robustez en sistemas de moderación: sirve como modelo "adversario" para evaluar la eficacia de filtros de contenido en aplicaciones de producción.
- Experimentación con cuantización FP8: su formato weight-only y su método RTN pueden servir de referencia para desarrolladores que investigan técnicas de compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.300 millones de parámetros en FP8, el peso ocupa aproximadamente 4,3 GB. Considerando activaciones y KV-cache, se recomienda al menos 6-8 GB de VRAM para contextos cortos.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 3060, RTX 4060, RTX 3070, o GPUs profesionales como A10G. Para contextos largos, se necesitarían 12 GB o más.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media con 8 GB, aunque el rendimiento dependerá de la optimización del motor de inferencia.
- Opciones de despliegue: al ser un formato FP8 weight-only no estándar, requiere un paso previo de dequantización. No es directamente compatible con vLLM, llama.cpp u Ollama sin conversión previa a un formato soportado (por ejemplo, FP16 o GGUF).
- Latencia y throughput: no se han publicado mediciones específicas para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP8 | 4,3B | no disponible | no disponible | FP8 weight-only |
| Nidum-Gemma-3-4B-it-Uncensored | 4,3B | no disponible | no disponible | no disponible |
| lemuralabs/Gemma-3-4B-it-Uncensored | 4,3B | no disponible | no disponible | no disponible |
| gemma-3-4b-it (base) | 4,3B | 128K (según informe técnico) | Gemma Terms of Use | safetensors (BF16) |

Los tres modelos uncensored parten del mismo modelo base y aplican técnicas de abliteración, pero difieren en el método y el formato de salida. No hay datos públicos que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Riesgo de alucinación: al igual que el modelo base, puede inventar información, y al no tener refusals, es más probable que presente afirmaciones falsas con alta confianza.
- Sesgos y contenido dañino: la eliminación de la dirección de rechazo implica que el modelo puede generar contenido violento, sexual, discriminatorio o técnicamente peligroso sin advertencias. No debe usarse en aplicaciones orientadas al público general.
- Licencia no especificada: la model card no indica la licencia de esta variante, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o revisar la licencia del modelo base.
- Formato de cuantización propietario: los pesos FP8 con escalas separadas no son compatibles directamente con los frameworks habituales; la dequantización manual puede introducir errores si no se realiza correctamente.
- Contexto y capacidades no verificadas: no se ha confirmado que esta variante conserve la ventana de contexto de 128K ni las capacidades multimodales o de tool calling del modelo base.
- Sin mantenimiento ni soporte: el autor no ofrece garantías, y el modelo tiene cero descargas y cero likes, lo que sugiere una adopción nula y posible falta de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP8
- Informe técnico de Gemma 3: https://storage.googleapis.com/deepmind-media/gemma/Gemma3Report.pdf
- Guía de LLMs sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/
- Guía para ejecutar Gemma 4 localmente (Locally Uncensored): https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Modelo similar de Nidum: https://huggingface.co/nidum/Nidum-Gemma-3-4B-it-Uncensored
- Modelo similar de Lemura Labs: https://huggingface.co/lemuralabs/Gemma-3-4B-it-Uncensored
