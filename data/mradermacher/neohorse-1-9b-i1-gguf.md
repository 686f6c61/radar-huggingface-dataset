# mradermacher/NeoHorse-1-9B-i1-GGUF

## Resumen

NeoHorse-1-9B-i1-GGUF es una versión cuantizada del modelo base TokenRhythm/NeoHorse-1-9B, publicada por el equipo de mradermacher. Se trata de un modelo de lenguaje de aproximadamente 9.000 millones de parámetros, distribuido en formato GGUF con cuantizaciones basadas en importancia (imatrix), lo que permite ejecutarlo en hardware de consumo con una relación calidad/rendimiento ajustada.

El modelo base está orientado a tareas de agente, uso de herramientas, generación de código, razonamiento y seguimiento de instrucciones, según las etiquetas declaradas en HuggingFace. La versión cuantizada mantiene la licencia Apache 2.0 y soporta únicamente inglés. No se dispone de información pública detallada sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados.

Esta ficha se centra en la versión GGUF de mradermacher, que es la disponible en el repositorio. El modelo puede integrarse en entornos de inferencia como llama.cpp, Ollama o vLLM, y está pensado para desarrolladores e investigadores que necesiten un modelo compacto con capacidades de agente y tool calling.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (i1): Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS, IQ4_NL, IQ2_M, IQ2_XS, IQ2_S, IQ1_S, IQ1_M, IQ3_XS, IQ3_S |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base TokenRhythm/NeoHorse-1-9B en los datos proporcionados. El repositorio de mradermacher indica que se trata de una cuantización de un modelo de tipo transformers, pero no se especifica si es un transformer denso, MoE o híbrido. Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La única innovación técnica documentada es el uso de cuantizaciones con matriz de importancia (imatrix) para preservar la calidad en los pesos más relevantes. El archivo `NeoHorse-1-9B.imatrix.gguf` de 0.1 GB se incluye para que los usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto y seguimiento de instrucciones, según las etiquetas del modelo.
- Soporte de tool calling / function calling, declarado en las etiquetas de HuggingFace.
- Orientación a agentes (agentic), lo que sugiere capacidad para razonamiento multi-paso y uso de herramientas externas.
- Generación de código (coding), adecuado para tareas de programación.
- Razonamiento (reasoning), con potencial para resolver problemas lógicos y matemáticos.
- Capacidades multilingües limitadas: solo inglés (en).

## Casos de uso

- Asistentes de desarrollo integrados en IDE: el modelo puede generar código y sugerir refactorizaciones, aprovechando su etiqueta de coding. Al estar cuantizado, puede ejecutarse en una estación de trabajo con GPU de consumo.
- Agentes autónomos de automatización: gracias al soporte de tool-use, puede orquestar llamadas a funciones en pipelines de CI/CD, por ejemplo para ejecutar análisis estáticos o generar informes.
- Chatbots técnicos de soporte: con capacidad de seguimiento de instrucciones y razonamiento, puede responder consultas de programación y debugging en inglés.
- Generación de documentación técnica: el modelo puede redactar comentarios, READMEs o documentación de API a partir de código fuente.
- Análisis de logs y detección de errores: al combinar razonamiento y tool calling, puede procesar logs y sugerir causas raíz, integrándose en sistemas de monitorización.
- Prototipado de agentes de investigación: en entornos académicos o de análisis, puede encadenar pasos de razonamiento y consultar fuentes externas mediante funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de mradermacher no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de referencia. Tampoco se han encontrado comparativas públicas con modelos similares.

## Requisitos de hardware

- La cuantización i1-Q2_K pesa 3.9 GB, por lo que puede ejecutarse en GPUs con al menos 6 GB de VRAM considerando el overhead de contexto y computación, aunque se recomienda más memoria para un uso cómodo.
- El repositorio completo ocupa 53.1 GB, lo que incluye múltiples cuantizaciones y el archivo imatrix.
- Las cuantizaciones de mayor calidad (Q4_K_M, Q5_K_M, Q6_K) requerirán más VRAM, pero no se proporcionan tamaños exactos en la información disponible.
- Para inferencia local se recomienda usar llama.cpp o Ollama, que soportan archivos GGUF y cuantizaciones imatrix. vLLM o TGI también son opciones si se usa el modelo base en formato safetensors.
- No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible. El modelo base TokenRhythm/NeoHorse-1-9B podría compararse con otros modelos de 9B, pero no existen métricas públicas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación ni comportamientos no deseados.
- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- La cuantización puede degradar la calidad de salida, especialmente en cuantizaciones muy agresivas como Q2_K.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe verificar la procedencia del modelo base para confirmar que no existan restricciones adicionales.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real en tareas específicas no está validado.
- La arquitectura y el proceso de entrenamiento son desconocidos, lo que dificulta la evaluación de sus fortalezas y debilidades.

## Enlaces

- Repositorio de la versión GGUF: https://huggingface.co/mradermacher/NeoHorse-1-9B-i1-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Versión con cuantizaciones estáticas: https://huggingface.co/mradermacher/NeoHorse-1-9B-GGUF
