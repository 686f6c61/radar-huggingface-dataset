# bartowski/Ling-3.0-flash-Fin-GGUF

## Resumen

Ling-3.0-flash-Fin es un modelo de lenguaje de gran tamaño desarrollado por inclusionAI, especializado en el dominio financiero y la investigación de mercados. Esta versión publicada por bartowski es una cuantización GGUF del modelo original, preparada para su ejecución con llama.cpp y herramientas compatibles como LM Studio, Jan o vLLM. El modelo pertenece a la categoría Mixture of Experts (MoE) y cuenta con aproximadamente 127 mil millones de parámetros, según los datos de safetensors del modelo base.

El modelo está diseñado para tareas de análisis financiero, soporte a agentes y uso de herramientas externas (tool-use), además de incorporar decodificación especulativa mediante predicción multi-token (MTP), lo que puede acelerar la inferencia. Incluye la etiqueta long-context, aunque no se especifica el número exacto de tokens de ventana. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para aplicaciones empresariales en el sector financiero.

La cuantización publicada por bartowski incluye una amplia gama de formatos, desde bf16 hasta cuantizaciones muy agresivas como Q2_K, permitiendo adaptar el modelo a diferentes presupuestos de memoria, siempre que se disponga de hardware con suficiente VRAM o memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiqueta long-context) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K_L, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer basado en Mixture of Experts, lo que implica que una parte de los parámetros se activa selectivamente en cada token. No se dispone de información sobre el número de expertos ni sobre los parámetros activos. El modelo admite decodificación especulativa mediante MTP (Multi-Token Prediction), una técnica que predice varios tokens simultáneamente para reducir la latencia de generación.

Los datos de entrenamiento no están descritos en la información disponible. Solo se sabe que el modelo está especializado en finanzas e investigación financiera, según las etiquetas de la model card. Tampoco se detallan procesos de alineación como RLHF o DPO. La cuantización utiliza la técnica imatrix (importance matrix) para preservar la calidad en los formatos de menor precisión, y el corpus de calibración empleado está disponible en el repositorio de la versión general (Ling-3.0-flash-calibration-v6.txt).

## Capacidades

- Generación de texto especializada en el dominio financiero y la investigación de mercados.
- Soporte para agentes y tool-use, permitiendo integración con herramientas externas y APIs.
- Contexto largo, indicado por la etiqueta long-context, adecuado para procesar documentos financieros extensos.
- Decodificación especulativa mediante MTP, que puede mejorar el rendimiento en generación.
- Soporte conversacional, con formato de prompt específico que incluye roles SYSTEM, HUMAN y ASSISTANT, además de un bloque de razonamiento con `<thinking>`.
- Entrada exclusivamente de texto (sin soporte de visión o audio).
- Compatible con endpoints de inferencia y cuantizaciones listas para llama.cpp.

## Casos de uso

- Análisis de informes financieros: el modelo puede procesar documentos largos como memorias anuales, prospectos o informes de resultados, gracias a su soporte de contexto largo, extrayendo métricas clave y generando resúmenes ejecutivos.
- Agentes de investigación de mercados: gracias al tool-use, puede actuar como agente que consulta APIs de datos bursátiles, noticias o bases de datos financieras, encadenando llamadas a herramientas para responder preguntas complejas.
- Evaluación de riesgos crediticios: el modelo puede analizar estados financieros y generar evaluaciones de solvencia, aprovechando su especialización en finanzas y su capacidad de razonamiento multi-paso.
- Asistentes para analistas de inversión: permite conversaciones multi-turno en las que el analista solicita comparativas, análisis de sensibilidad o escenarios hipotéticos, con respuestas contextualizadas en el dominio financiero.
- Cumplimiento normativo y auditoría: puede procesar normativas financieras y contratos para identificar cláusulas relevantes o riesgos regulatorios, apoyándose en su capacidad de manejar contextos extensos.
- Generación de contenido financiero automatizado: redacción de notas de mercado, resúmenes de resultados trimestrales o informes de seguimiento de carteras, manteniendo un tono profesional y técnico.
- Análisis de sentimiento en noticias económicas: el modelo puede clasificar el sentimiento de titulares o artículos financieros y relacionarlos con variables de mercado, aunque no se aportan métricas de precisión en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. El formato Q4_K_M ocupa 77,80 GB, por lo que se necesitan al menos 80 GB de memoria de GPU o memoria unificada. El formato Q2_K_L ocupa 46,29 GB y podría ejecutarse en una GPU de 48 GB, aunque con menor calidad. Las cuantizaciones Q6_K (109,26 GB) y bf16 (255,09 GB) requieren sistemas de múltiples GPUs o configuraciones con mucha más memoria.
- GPU recomendadas: para cuantizaciones de 77-80 GB se recomiendan GPUs con 80 GB de VRAM, como A100 80GB o H100 80GB. Para Q2_K_L (46,29 GB) podría usarse una RTX A6000 48GB o L40S 48GB. No se recomienda el uso de GPUs de consumo (RTX 4090 de 24 GB) porque no hay ninguna cuantización que quepa en 24 GB.
- Opciones de despliegue: llama.cpp (según la model card), LM Studio, Jan y vLLM (según los resultados de búsqueda).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparación detallada con modelos alternativos. Como referencia cualitativa, existe la versión general del mismo modelo, `bartowski/Ling-3.0-flash-GGUF`, que carece de la especialización financiera, pero no se aportan especificaciones ni métricas de rendimiento. Tampoco se disponen de datos de otros modelos MoE de 127B parámetros en la información proporcionada.

| Modelo | Especialización | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.0-flash-Fin | Finanzas e investigación financiera | 127B | no disponible | MIT |
| Ling-3.0-flash | Uso general | 127B | no disponible | MIT |

## Limitaciones y advertencias

- Sesgos: al estar especializado en finanzas, el modelo puede presentar sesgos propios de los datos financieros utilizados en su entrenamiento, aunque no se han documentado.
- Riesgo de alucinación: como todo modelo generativo, existe riesgo de producir información incorrecta, especialmente en cálculos financieros o datos de mercado no verificados. No se han publicado evaluaciones de este riesgo.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica y los idiomas soportados no están documentados.
- Restricciones de licencia: la licencia MIT permite uso comercial y redistribución, sin restricciones significativas.
- Caveat de cuantización: las cuantizaciones más agresivas (Q2, Q3) implican pérdida de calidad; se recomienda usar formatos como Q4_K_M o superiores para mantener un rendimiento aceptable.
- Requisitos de hardware: el modelo no puede ejecutarse en GPUs de consumo estándar; es necesario disponer de equipos con al menos 48 GB de memoria, y para cuantizaciones de mayor calidad se requieren GPUs de 80 GB o configuraciones multi-GPU.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Ling-3.0-flash-Fin-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.0-flash-Fin
- Versión general del mismo modelo: https://huggingface.co/bartowski/Ling-3.0-flash-GGUF
- Perfil del autor de la cuantización: https://huggingface.co/bartowski
