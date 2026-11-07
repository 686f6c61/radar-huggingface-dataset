# ioxdue/moediet-runs

## Resumen

MoEDiet-runs es un repositorio de artefactos de experimentos del proyecto MoEDiet, una herramienta de poda de expertos (expert pruning) para modelos de mezcla de expertos (MoE). No se trata de un modelo entrenado desde cero, sino de una colección de checkpoints derivados de modelos Apache-2.0 (AllenAI OLMoE-1B-7B-0125-Instruct y Qwen/Qwen3-Next-80B-A3B-Instruct) que han sido sometidos a auditorías de enrutamiento y poda selectiva de expertos. El repositorio está organizado por trabajos (`runs/<JOB_ID>/`) e incluye pesos en safetensors, exportaciones GGUF cuantizadas, máscaras de poda e informes de calidad.

El autor, ioxdue, publica este material como evidencia reproducible de sus experimentos de compresión de modelos MoE, con el objetivo de facilitar la replicación y el análisis de técnicas de poda de expertos. Cada directorio de ejecución contiene un `report.json` con la revisión exacta del modelo fuente, el enrutamiento y la auditoría de calidad, lo que permite rastrear la procedencia de cada checkpoint.

El modelo principal del repositorio tiene 6.717.769.728 parámetros totales según los safetensors publicados, lo que sugiere que se trata de una variante derivada de OLMoE-1B-7B (7B totales, 1B activos) tras el proceso de poda. La relevancia actual radica en el interés creciente por reducir el coste computacional de los modelos MoE mediante la eliminación de expertos redundantes o poco utilizados, un área activa de investigación en eficiencia de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de OLMoE-1B-7B-0125-Instruct y Qwen3-Next-80B-A3B-Instruct; poda de expertos aplicada |
| Parámetros totales | 6.717.769.728 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (exportaciones cuantizadas incluidas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta un entrenamiento propio, sino un proceso de poda de expertos sobre modelos MoE preentrenados. La arquitectura subyacente es de mezcla de expertos con enrutamiento por token, tomando como base OLMoE-1B-7B-0125-Instruct (7B parámetros totales, aproximadamente 1B activos por token) y Qwen3-Next-80B-A3B-Instruct (80B totales, 3B activos). El proceso MoEDiet audita el enrutamiento de los expertos y elimina selectivamente aquellos con baja contribución, generando checkpoints podados con máscaras asociadas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en los modelos fuente más allá de lo que documentan sus respectivas model cards originales. La innovación técnica principal es el propio pipeline de poda de expertos con auditoría de calidad, que permite reducir el número de parámetros manteniendo el comportamiento del modelo original, junto con la exportación a GGUF para despliegue en entornos de inferencia eficientes.

## Capacidades

- Generación de texto conversacional, heredada de los modelos instructivos fuente (OLMoE-Instruct y Qwen3-Next-Instruct).
- Razonamiento y matemáticas, en la medida en que los modelos base los soportan.
- Generación de código, siempre que el modelo fuente lo permita.
- Soporte de tool calling y function calling, presumiblemente heredado de Qwen3-Next-Instruct, aunque no se detalla en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del modelo fuente.
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no disponible; los modelos base citados son de texto.

## Casos de uso

- Investigación en eficiencia de modelos MoE: el repositorio permite reproducir experimentos de poda de expertos y comparar checkpoints podados frente a los originales, usando los `report.json` para auditar la calidad del enrutamiento tras la poda.
- Despliegue en entornos con recursos limitados: las exportaciones GGUF cuantizadas permiten ejecutar variantes podadas de OLMoE en GPUs de consumo mediante llama.cpp u Ollama, reduciendo el espacio en disco y la VRAM necesaria frente al modelo completo.
- Evaluación de técnicas de compresión: investigadores pueden usar los artefactos como referencia para medir la degradación de calidad tras eliminar expertos, comparando las máscaras y los informes de auditoría incluidos.
- Prototipado de asistentes conversacionales: al derivar de modelos instructivos, los checkpoints podados pueden emplearse en pruebas de concepto de chatbots con requisitos de latencia bajos, siempre que se valide la calidad tras la poda.
- Integración en pipelines de CI/CD para validación de modelos: el formato de repositorio por trabajos (`runs/<JOB_ID>/`) facilita automatizar la comparación de checkpoints y la detección de regresiones en el enrutamiento.
- Estudio de enrutamiento de expertos: los datos de routing incluidos en los informes permiten analizar qué expertos se activan con mayor frecuencia y cómo afecta la poda a la distribución de carga entre expertos.
- Formación y docencia: el repositorio sirve como ejemplo práctico de un pipeline completo de poda de modelos MoE, desde la auditoría hasta la exportación cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.717.769.728 parámetros, en FP16 se requieren aproximadamente 13,4 GB; en cuantización de 8 bits, unos 6,7 GB; en 4 bits, unos 3,4 GB (estimaciones teóricas para pesos, sin contar caché KV ni overhead).
- GPU recomendadas: para FP16, una GPU con al menos 16 GB (RTX 4090, A100 40GB, H100); para cuantizaciones de 4-8 bits, GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits, siempre que la longitud de contexto utilizada no incremente demasiado la memoria de la caché KV.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors si la arquitectura MoE podada es compatible con dichos motores (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoEDiet-runs (este repo) | 6.717.769.728 | no disponible | no disponible | Apache-2.0 | Hugging Face (4 descargas) |
| AllenAI OLMoE-1B-7B-0125-Instruct | 7B | ~1B | 4.096 tokens (según model card original) | Apache-2.0 | Hugging Face |
| Qwen3-Next-80B-A3B-Instruct | 80B | 3B | no disponible en esta ficha | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos fuente citados en la model card; no se dispone de datos de rendimiento comparativo entre el checkpoint podado y los originales.

## Limitaciones y advertencias

- El repositorio contiene artefactos de experimentos, no un modelo con garantías de calidad; cada checkpoint podado puede presentar degradación respecto al modelo fuente.
- No se documentan sesgos específicos del checkpoint podado; los sesgos heredados de OLMoE y Qwen3-Next dependen de sus respectivos datasets de entrenamiento, no detallados aquí.
- Riesgo de alucinación: inherente a los modelos generativos; la poda puede incrementarlo si se eliminan expertos relevantes para ciertos dominios.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; dependen del modelo fuente y de la configuración de inferencia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se requiere atribución a los autores originales (AllenAI y Qwen) según indica la model card.
- El número de descargas (4) y likes (0) indica que el repositorio es muy reciente y no ha sido validado por la comunidad; no se recomienda su uso en producción sin una evaluación independiente.
- La fecha de creación (2026-11-05) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un repositorio de prueba.
- No se especifica qué trabajos concretos están incluidos ni cuántos checkpoints contiene el repositorio; el tamaño de 17,5 GB sugiere múltiples artefactos, pero no se detalla su composición.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ioxdue/moediet-runs
- Repositorio GitHub de MoEDiet: https://github.com/ioxdue/MoEDiet/tree/main
- Modelo fuente OLMoE-1B-7B-0125-Instruct: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo fuente Qwen3-Next-80B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
