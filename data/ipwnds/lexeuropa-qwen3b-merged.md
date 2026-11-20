# iPwnds/lexeuropa-qwen3b-merged

## Resumen

lexeuropa-qwen3b-merged es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct de Alibaba, desarrollado por el usuario iPwnds dentro del proyecto LexEuropa, una iniciativa de investigación jurídica sobre derecho de la Unión Europea con verificación de citas. El modelo se obtiene fusionando (merging) un adaptador LoRA de rango 16 y alpha 32, entrenado durante 2 épocas, sobre el modelo base instruct de 3.086 millones de parámetros.

El problema que aborda no es el razonamiento jurídico general, sino la disciplina de formato y de citación: el modelo está entrenado para responder a partir de extractos de fuentes suministrados, emitiendo afirmaciones estructuradas en JSON en las que cada una cita un identificador de fuente (S1..S8), y para rechazar la respuesta cuando las fuentes no cubren la pregunta. Se sirve mediante vLLM en un Inference Endpoint y se distribuye con licencia Apache 2.0.

Es relevante ahora porque ejemplifica un patrón de ajuste fino muy concreto y medible: especialización estrecha sobre un modelo pequeño, con un conjunto de datos determinista construido a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17. La model card indica además que esta versión ha sido superada por `lexeuropa-qwen3b-merged-v4`, aunque se mantiene por motivos de comparación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, según tag `qwen2`) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-3B-Instruct) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 3.086 millones de parámetros, derivado de Qwen2.5-3B-Instruct. Sobre ese modelo base se aplicó un adaptador LoRA con rango 16 y alpha 32, entrenado durante 2 épocas mediante SFT (supervised fine-tuning) con la librería TRL, y posteriormente fusionado en los pesos del modelo para producir un checkpoint autónomo.

Los datos de entrenamiento consisten en 506 ejemplos (revisión de dataset `v2`): 422 positivos y 84 de rechazo, construidos de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17 en inglés, con una partición de validación a nivel de provisión. No se emplearon objetivos generados por modelos. La model card documenta un defecto conocido: algunas afirmaciones objetivo quedaron partidas a mitad de frase en referencias cruzadas en línea (por ejemplo, "point (a) of Article 6(1)"), corregido en el constructor de datasets del repositorio. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-3B-Instruct.
- Respuesta basada en extractos: produce afirmaciones estructuradas en JSON a partir de fuentes suministradas en el contexto.
- Citación disciplinada: cada afirmación incluye un identificador de fuente (S1..S8).
- Abstención (refusal): el modelo rechaza responder cuando las fuentes proporcionadas no cubren la pregunta.
- Especialización en contenido del RGPD y jurisprudencia del TJUE (C-131/12 y C-136/17).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Investigación jurídica asistida sobre RGPD: el modelo recibe extractos recuperados por un sistema RAG y devuelve afirmaciones con cita de la fuente concreta, lo que permite verificar cada aseveración contra el texto original.
- Verificación de citas en pipelines RAG: al exigir un identificador de fuente por afirmación, se puede validar automáticamente que cada salida está respaldada por un documento recuperado.
- Filtrado por abstención: en flujos donde una respuesta no fundamentada es peor que ninguna respuesta, el comportamiento de rechazo entrenado permite descartar consultas fuera de cobertura documental.
- Prototipado de asistentes legales internos: con 3.086 millones de parámetros y licencia Apache 2.0, es viable desplegarlo en infraestructura propia para experimentación sin coste de licencia.
- Evaluación comparativa de disciplina de citación: sirve como referencia de precisión de citas frente a modelos mayores (Qwen2.5-7B, Qwen2.5-72B, Qwen3-235B, DeepSeek-V3) en el mismo pipeline de recuperación y evaluación.
- Extracción estructurada de disposiciones: el formato JSON de salida facilita el postprocesado y la integración en bases de datos o sistemas de gestión documental jurídica.
- Docencia y demostraciones sobre RGPD: permite ilustrar el funcionamiento de un sistema de respuesta con fuentes citadas sobre textos normativos reales.

## Benchmarks y rendimiento

La model card reporta una evaluación con recuperación, parser y juez idénticos para todos los modelos, midiendo precisión y recall de las fuentes citadas (no la corrección de la respuesta). Una pregunta tiene un artículo de referencia (gold).

| Conjunto | Modelo | Precisión | Recall |
|---|---|---|---|
| 42 preguntas plantilla (held-out) | lexeuropa-qwen3b-merged (v1) | 0.95 | 0.95 |
| 42 preguntas plantilla (held-out) | Qwen2.5-7B stock | 0.91 | 0.98 |
| 25 preguntas en lenguaje natural | lexeuropa-qwen3b-merged (v1) | 0.82 | 0.84 |
| 25 preguntas en lenguaje natural | lexeuropa-qwen3b-merged (v1, con generador de respaldo del proyecto) | 0.86 | 0.88 |
| 25 preguntas en lenguaje natural | Qwen2.5-7B stock | 0.67 | 0.88 |
| 25 preguntas en lenguaje natural | Qwen2.5-72B | 0.72 | 0.88 |
| 25 preguntas en lenguaje natural | Qwen3-235B | 0.66 | 0.92 |
| 25 preguntas en lenguaje natural | DeepSeek-V3 | 0.68 | 0.88 |

El autor señala que v1 obtiene la mejor precisión de todos los modelos probados, con un recall similar al de los modelos stock, y advierte que n=25 es pequeño y que la métrica evalúa qué fuentes se citan, no si la respuesta es correcta.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,2 GB en safetensors (probablemente en precisión de 16 bits); en FP16 se requieren aproximadamente 6,2 GB solo para pesos, más caché KV y overhead del runtime. En cuantización de 8 bits cabría en torno a 3,5-4 GB y en 4 bits en torno a 2 GB, aunque la información proporcionada no detalla los formatos de cuantización disponibles.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo con 8 GB o más de VRAM en FP16 y para GPUs profesionales (A100, H100) cuando se busca alto throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en FP16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores), aunque este dato no está confirmado en la información proporcionada.
- Opciones de despliegue: el autor indica que se sirve en un vLLM Inference Endpoint; la librería declarada es transformers y el tag `text-generation-inference` sugiere compatibilidad con TGI. No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de citas (25 preguntas NL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lexeuropa-qwen3b-merged | 3.086 M | No disponible | 0.82 (0.86 con generador de respaldo) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (stock) | 7.000 M aprox. | No disponible | 0.67 | Apache 2.0 | Hugging Face |
| Qwen2.5-72B-Instruct (stock) | 72.000 M aprox. | No disponible | 0.72 | Apache 2.0 (según familia Qwen2.5) | Hugging Face |
| DeepSeek-V3 (stock) | No disponible | No disponible | 0.68 | No disponible | Hugging Face |

La comparación se limita a la métrica de precisión de citas reportada por el autor; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo en la información disponible. Los recuentos de parámetros de los modelos comparados son aproximados y no proceden de la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso directo en entornos en español.
- Entrenado únicamente sobre el RGPD y dos sentencias del TJUE (C-131/12 y C-136/17); su cobertura normativa es muy estrecha.
- Puede rechazar preguntas que las fuentes sí responden; el proyecto mitiga esto reintentando con un modelo más potente.
- Puede citar un considerando (recital) en lugar del artículo operativo.
- El objetivo del entrenamiento es el formato de salida y la disciplina de citación, no el razonamiento jurídico general.
- Riesgo de alucinación: aunque está entrenado para citar fuentes, la model card no garantiza la corrección del contenido de las afirmaciones; la evaluación mide fuentes citadas, no respuestas correctas.
- La evaluación se basa en 25 preguntas en lenguaje natural, una muestra pequeña; el autor pide interpretar los resultados como evidencia de disciplina de citación, no de calidad jurídica.
- Es un prototipo de investigación y no constituye asesoramiento jurídico.
- Esta versión está superada por `lexeuropa-qwen3b-merged-v4`; se mantiene para comparación y solo es preferible si no se usa expansión de artículos.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- No se documentan capacidades de tool calling ni de agentes, por lo que integrarlo en flujos agénticos requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iPwnds/lexeuropa-qwen3b-merged
- Repositorio del proyecto LexEuropa: https://github.com/lumenworksco/-LexEuropa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
