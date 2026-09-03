# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF` es una cuantización estática en formato GGUF del modelo original `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized`. El nombre sugiere una arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos, basada presumiblemente en la familia Qwen 3.6. Sin embargo, el dato real de parámetros extraído de los safetensors del repositorio indica 446.571.248 parámetros, lo que resulta contradictorio con el nombre y plantea dudas sobre la fiabilidad de la información proporcionada. El repositorio tiene un tamaño total de 1,5 GB, coherente con un modelo de tamaño reducido o con una cuantización muy agresiva.

Este archivo fue creado el 3 de septiembre de 2026 (fecha futura, posiblemente un error) y no cuenta con descargas ni valoraciones. La model card apenas contiene comentarios técnicos sobre los tipos de cuantización disponibles (x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, etc.), pero no ofrece información sobre licencia, idiomas, arquitectura, entrenamiento o capacidades. Se trata de un modelo sin documentación pública, lo que limita enormemente su evaluación y uso en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Qwen3.6, sin confirmar) |
| Parametros totales | 446.571.248 (según safetensors del repo) |
| Parametros activos | no disponible (el nombre indica 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios del autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. El nombre "Qwen3.6-35B-A3B" sugiere una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos, siguiendo la línea de los modelos Qwen recientes, pero esto no puede confirmarse con los datos disponibles. El número real de parámetros (446M) contradice esa hipótesis, por lo que podría tratarse de un modelo compacto o de un error en el etiquetado. Tampoco hay datos sobre el dataset de entrenamiento, el método de alineación (RLHF, DPO, etc.) ni sobre técnicas especiales como decodificación especulativa o atención lineal. La model card solo indica que se trata de una cuantización estática del modelo `symrex`, sin más detalles.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Dado que no hay documentación ni benchmarks publicados, no es posible afirmar que soporte generación de texto, razonamiento, código, matemáticas, tool calling, agentes o capacidades multilingües. El nombre "Uncensored" y "Hermes" sugieren un posible fine-tuning para conversación sin restricciones y con estilo Hermes, pero esto es especulativo. Se recomienda no asumir ninguna capacidad sin una evaluación previa.

## Casos de uso

Dado que no hay información sobre las capacidades reales del modelo, no se pueden proponer casos de uso concretos con garantías. Cualquier aplicación debería basarse en pruebas empíricas previas. Posibles escenarios genéricos (si el modelo funciona como un LLM estándar) incluyen:

- Experimentación local con GGUF mediante llama.cpp u Ollama para tareas de generación de texto simple.
- Pruebas de fine-tuning o adaptación en entornos de investigación, siempre que se valide la calidad de las respuestas.
- Uso como base para proyectos de código abierto donde se requiera un modelo pequeño y de bajo consumo (si los 446M parámetros son reales).
- Evaluación de la familia Qwen en formato GGUF para comparar rendimiento con otros modelos cuantizados.

No obstante, ninguna de estas aplicaciones está respaldada por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se dispone de comparaciones con modelos similares.

## Requisitos de hardware

Los requisitos de hardware dependen críticamente del número real de parámetros. Si el modelo tiene 446M parámetros en FP16, ocuparía aproximadamente 0,9 GB en memoria, lo que cabría en cualquier GPU con más de 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, etc.). Las versiones cuantizadas (Q4_K_S, Q2_K) reducirían aún más el consumo, permitiendo ejecución en CPU con 4-8 GB de RAM. Sin embargo, si el nombre "35B-A3B" fuera correcto, los requisitos serían mucho mayores (unas 20-25 GB para cuantización Q4). Ante la ambigüedad, se recomienda verificar el modelo antes de dimensionar el hardware. Las opciones de despliegue típicas para GGUF son llama.cpp, Ollama, LM Studio o KoboldCpp. No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El nombre sugiere una relación con la familia Qwen 3.6, pero no hay modelos comparables confirmados con el mismo tamaño real (446M). Si se tratara de un modelo MoE 35B-A3B, podría compararse con Qwen3-30B-A3B o DeepSeek-V3, pero no hay datos de rendimiento para este modelo concreto. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card descriptiva, licencia, ni información de entrenamiento.
- Inconsistencia en los parámetros: el nombre indica 35B-A3B, pero los safetensors muestran 446M parámetros. Esto puede deberse a un error del autor o a una arquitectura inusual; en cualquier caso, impide conocer el modelo real.
- Sin garantías de funcionamiento: al no haber benchmarks ni ejemplos, no se puede asegurar que el modelo genere texto coherente o cumpla ninguna función.
- Riesgo de contenido no seguro: el nombre "Uncensored" sugiere que el fine-tuning podría eliminar restricciones de seguridad, lo que conlleva riesgo de generar contenido inapropiado o dañino.
- Licencia desconocida: no se puede determinar si el uso comercial está permitido o si hay restricciones de redistribución.
- Fecha de creación futura (2026) que sugiere un posible error de metadatos, lo que añade incertidumbre sobre la procedencia del modelo.
- Sin soporte ni mantenimiento: al ser un repositorio sin actividad, no hay garantía de actualizaciones o correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF
- Modelo original (dequantizado): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized
