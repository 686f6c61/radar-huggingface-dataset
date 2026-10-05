# plasmova/Nova-v1.1

## Resumen

Nova v1.1 es un modelo de lenguaje causal decoder-only de 151 millones de parámetros (151.028.992 pesos únicos según el recuento de safetensors) publicado por el usuario plasmova en Hugging Face. Se distribuye en formato Transformers con pesos en Float32 y safetensors, e incluye código de modelo personalizado, por lo que requiere `trust_remote_code=True` para cargarse con `AutoModelForCausalLM`. Su ventana de contexto es de 2.048 tokens y su tokenizador maneja un vocabulario de 32.768 entradas.

El modelo se posiciona en el segmento de los modelos pequeños, comparable en escala a otras propuestas de menos de 500 millones de parámetros orientadas a ejecución en CPU y GPU de consumo. Según su model card, el preentrenamiento se apoya en una mezcla de corpus públicos (FineWeb-Edu, DCLM, Cosmopedia-v2, FineMath, SmolTalk, OpenR1 Math y OpenThoughts) seguida de un ajuste supervisado. No se especifica el número de tokens de entrenamiento ni la composición porcentual del dataset.

Es relevante ahora como opción ligera para prototipado, experimentación educativa y despliegues con recursos muy limitados, dado que cabe en memoria de cualquier GPU moderna e incluso en CPU. Sin embargo, la ausencia de resultados de benchmarks publicados, el nulo historial de descargas y la falta de datos sobre idiomas y proceso de alineación recomiendan tratarlo como un checkpoint experimental sujeto a evaluación propia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con atención agrupada (12 cabezas de consulta, 4 cabezas clave/valor) |
| Parámetros totales | 151.028.992 (151M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | Solo se distribuyen pesos en Float32; no se ofrecen versiones cuantizadas oficiales |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Float32) |

Otras especificaciones declaradas: tamaño oculto de 768, 20 capas de transformer, vocabulario de 32.768 tokens, tamaño del repositorio de 0,6 GB.

## Arquitectura y entrenamiento

Nova v1.1 es un transformer causal decoder-only estándar, sin indicios de mezcla de expertos, arquitecturas de espacio de estados ni mecanismos híbridos. Su configuración incluye 20 capas, dimensión oculta de 768 y atención con 12 cabezas de consulta y 4 cabezas clave/valor (atención agrupada, GQA), lo que reduce el tamaño de la caché KV respecto a una atención multicabeza completa. El vocabulario es de 32.768 tokens y el contexto máximo de 2.048 tokens. El modelo emplea marcadores de rol propios en el prompt (`<|bos|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`), lo que implica que se ha entrenado con un formato de plantilla específico que debe respetarse para obtener un comportamiento coherente.

En cuanto al entrenamiento, la model card indica que el script de preentrenamiento utiliza datos procedentes de FineWeb-Edu, DCLM, Cosmopedia-v2, FineMath, SmolTalk, OpenR1 Math y OpenThoughts, seguido de un ajuste fino supervisado (SFT). No se detalla el número total de tokens, la proporción de cada fuente, la longitud de secuencia de entrenamiento ni si hubo fases posteriores de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El modelo se publica con código personalizado, por lo que la implementación exacta de la arquitectura depende del repositorio del autor.

## Capacidades

- Generación de texto causal en formato de conversación mediante la plantilla de roles propia (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Soporte de mensaje de sistema opcional, que puede modificarse u omitirse según la model card.
- Razonamiento y matemáticas potencialmente favorecidos por el uso de FineMath y OpenR1 Math durante el preentrenamiento, aunque no hay evaluación publicada que lo confirme.
- Generación de código y seguimiento de instrucciones, presumiblemente influidos por OpenThoughts y SmolTalk, si bien no se aportan mediciones.
- Ejecución local en CPU y GPU, con detección automática de CUDA y Apple Silicon en el script de inferencia incluido.
- Capacidades de tool calling o function calling: no disponibles.
- Capacidades de agente o razonamiento multipaso explícito: no disponibles (no se documenta un modo de pensamiento ni cadena de razonamiento separada).
- Capacidades de visión o audio: no disponibles.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales locales: al caber en menos de 1 GB en Float32, el modelo puede cargarse en un portátil sin GPU y usarse para validar plantillas de prompt, flujos de diálogo y formatos de respuesta antes de migrar a modelos mayores.
- Aplicaciones educativas y demos docentes: su tamaño de 151M parámetros y su licencia Apache 2.0 lo hacen adecuado para ilustrar el funcionamiento de un transformer causal, la tokenización y el formato de roles en cursos o talleres.
- Generación de texto con contexto corto en dispositivos embebidos o entornos con RAM limitada: con 2.048 tokens de ventana permite resúmenes breves, clasificación de texto o reescritura de fragmentos cortos siempre que la tarea no exija contexto extenso.
- Filtrado y preprocesado de datos: puede emplearse como modelo auxiliar para generar etiquetas, reformular ejemplos o producir datos sintéticos de bajo coste en pipelines de curación, dado que el coste por inferencia es mínimo.
- Experimentación en ajuste fino (fine-tuning): al ser pequeño y estar liberado bajo Apache 2.0, sirve como base para probar recetas de SFT o LoRA en una única GPU de consumo, con iteraciones rápidas.
- Tareas de razonamiento matemático elemental en modo offline: si se confirma su competencia en matemáticas básicas, podría integrarse en asistentes locales de estudio; no obstante, esto requiere validación propia porque no hay benchmarks publicados.
- Chat de soporte con respuestas muy cortas y contexto limitado: útil solo para diálogos de pocos turnos, dado que la ventana de 2.048 tokens se agota rápidamente en conversaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que este checkpoint v1.1 no incluye resultados de evaluación y que su calidad y comportamiento deben evaluarse para la aplicación prevista antes de su despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: en Float32, aproximadamente 0,6 GB de pesos (151M × 4 bytes, coherente con el tamaño de repositorio de 0,6 GB); en FP16/BF16, unos 0,3 GB; en int8, unos 0,15 GB; en int4, unos 0,08 GB. A esto hay que sumar la caché KV, que para el contexto máximo de 2.048 tokens ronda los 40 MB en FP16 (20 capas × 2 × 4 cabezas KV × 64 de dimensión por cabeza × 2.048 tokens × 2 bytes).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de GPU de gama alta.
- ¿Cabe en GPU de consumo? Sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU; también funciona en CPU, que es el dispositivo por defecto del script de inferencia cuando no se detecta acelerador.
- Opciones de despliegue: Transformers con código remoto (`trust_remote_code=True`), el script `inference.py` incluido en el repositorio y ejecución en CPU, CUDA o Apple Silicon. No se distribuyen pesos en GGUF, por lo que su uso con llama.cpp u Ollama requeriría una conversión previa. La integración con vLLM o TGI no está documentada y podría verse afectada por el uso de código personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados para Nova v1.1, por lo que la comparación se limita a especificaciones estructurales y licencia. Los modelos alternativos citados son referencias conocidas del mismo segmento.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nova v1.1 | 151M | 2.048 tokens | Apache 2.0 | Requiere código remoto; sin benchmarks publicados |
| SmolLM2-135M | 135M | 8.192 tokens | Apache 2.0 | Familia con resultados de benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Mayor tamaño y contexto más amplio |
| TinyLlama-1.1B | 1.100M | 2.048 tokens | Apache 2.0 | Aproximadamente 7 veces más parámetros |

Nova v1.1 destaca por ser el más pequeño de la comparativa junto a SmolLM2-135M, pero ofrece un contexto claramente inferior y carece de la documentación de evaluación que sí presentan las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Los corpus de preentrenamiento (FineWeb-Edu, DCLM y otros) arrastran los sesgos propios de datos web, pero no se aporta ningún análisis.
- Riesgo de alucinación: alto en principio, dado el tamaño reducido (151M) y la ausencia de evaluación; el modelo puede producir afirmaciones plausibles pero incorrectas.
- Limitaciones de contexto: la ventana de 2.048 tokens es corta para conversaciones largas, resúmenes extensos o recuperación aumentada con muchos documentos; el prompt y la salida deben caber en ese límite.
- Limitaciones de idioma: no se declara ningún idioma soportado; los corpus citados son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto y requiere verificación.
- Restricciones de licencia: los pesos y el código se publican bajo Apache 2.0, lo que permite uso comercial; sin embargo, los contenidos de los datasets conservan sus licencias originales, que pueden imponer condiciones adicionales según su procedencia.
- Ejecución de código remoto: la carga del modelo exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar ese código antes de utilizarlo en entornos sensibles.
- Formato propietario de prompt: el uso de marcadores de rol específicos (`<|bos|>`, `<|system|>`, etc.) obliga a respetar la plantilla exacta; emplear otro formato puede degradar gravemente las respuestas.
- Madurez del proyecto: cero descargas y cero «me gusta» en el momento de la consulta, sin histórico de versiones ni comunidad; no hay garantía de mantenimiento.
- Despliegue en producción: al no existir benchmarks, cuantizaciones oficiales ni soporte documentado en servidores de inferencia como vLLM o TGI, no es recomendable usarlo en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plasmova/Nova-v1.1
- Script de inferencia local: `inference.py` incluido en el repositorio del modelo
- Lanzador para Windows: `run.bat` incluido en el repositorio del modelo
- Repositorio de código personalizado: incluido en el repositorio de Hugging Face (requiere `trust_remote_code=True`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
- Enlaces a los datasets citados (referencias, no incluidos en el repositorio): FineWeb-Edu, DCLM, Cosmopedia-v2, FineMath, SmolTalk, OpenR1 Math y OpenThoughts (sin URL confirmada en la información disponible)
