# Jeesup/svd-safety-mistral_keep50_disc_b010

## Resumen

Este modelo es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido mediante la técnica SVD-LLM hasta conservar el 51,0 % de los parámetros densos. Tras la compresión, se restauran componentes de la descomposición en valores singulares seleccionados por la regla «disc» con un presupuesto del 1,0 % de los parámetros. El resultado es un artefacto experimental diseñado para estudiar cómo la compresión por SVD afecta al comportamiento de seguridad y qué reglas de selección de componentes reparan mejor ese comportamiento. No es un modelo de chat general ni está pensado para su despliegue en producción. El autor es Jeesup y el checkpoint se publica bajo licencia Apache 2.0. Según la información de HuggingFace, el archivo safetensors contiene 7.241.732.096 parámetros, aunque la model card indica que la fracción efectiva de parámetros es 0.5097 respecto al modelo denso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con compresión SVD-LLM |
| Parametros totales | 7.241.732.096 (según safetensors; fracción efectiva 0.5097 según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compresión por SVD-LLM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only con atención multi-cabeza y ventana de contexto deslizante. La compresión se realiza mediante SVD-LLM, una técnica que descompone las matrices de pesos en valores singulares y elimina una fracción de ellos. En este caso, se elimina el 49,03 % de los parámetros del modelo denso, dando lugar a un checkpoint con una fracción efectiva de 0.5097. Posteriormente, se aplica una restauración de componentes SVD con un presupuesto del 1,000 % de los parámetros densos, seleccionados mediante la regla «disc». El número de componentes restaurados es 8382 y no se intercambia ningún componente adicional. La semilla utilizada en el proceso es 42.

No se dispone de información sobre los datos de entrenamiento, el número de tokens ni la composición del dataset. Tampoco se documentan fases de RLHF o DPO. El proceso descrito es puramente de compresión y restauración de pesos sobre un checkpoint ya entrenado, sin ajuste fino adicional. La innovación técnica destacable es el uso combinado de SVD-LLM con una regla de selección de componentes específica («disc») y un presupuesto de restauración muy reducido, lo que permite estudiar el efecto de cada componente en el comportamiento de seguridad.

## Capacidades

- Generación de texto: hereda la capacidad de generación de Mistral-7B-Instruct-v0.2, aunque la compresión agresiva puede degradar la calidad y la coherencia.
- Razonamiento: no documentado de forma específica; el modelo no está pensado para tareas de razonamiento general.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no documentado.
- El modelo es un artefacto de investigación para medir el trade-off entre seguridad y utilidad bajo compresión; no debe utilizarse como asistente general.

## Casos de uso

- Investigación en interpretabilidad de la seguridad: permite analizar qué componentes SVD son críticos para el rechazo de respuestas dañinas, comparando este checkpoint con otras celdas del grid.
- Evaluación de métodos de compresión: sirve como referencia para comparar la regla «disc» con otras reglas de selección de componentes en estudios de compresión de LLMs.
- Estudio del sobre-rechazo: la métrica macro over-refusal de 0.5803 (WildGuard) es útil para investigar el fenómeno de rechazo excesivo de peticiones legítimas en modelos comprimidos.
- Benchmarking de modelos comprimidos: puede emplearse como caso de estudio en papers sobre compresión de modelos de lenguaje para documentar el impacto de SVD-LLM en la alineación.
- Desarrollo de estrategias de reparación de alineación: permite probar cómo pequeñas restauraciones de parámetros recuperan el comportamiento de seguridad original.
- Análisis de trade-offs utilidad/seguridad: la combinación de perplejidad WikiText-2 (12.5987) y tasas de ataque permite cuantificar el coste de la compresión en la fluidez y en la robustez frente a jailbreaks.
- Docencia en cursos de compresión de modelos: puede usarse como ejemplo práctico de los efectos de SVD-LLM sobre el comportamiento de un modelo instruct.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas, evaluadas con jueces automáticos:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0.0000 |
| StrongREJECT ASR (HarmBench judge) | 0.0224 |
| Macro over-refusal (WildGuard) | 0.5803 |
| WikiText-2 perplexity | 12.5987 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El tamaño del repositorio es de 14.5 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente 14.5 GB; para cargar el modelo completo sin cuantización se necesitaría una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: no disponible. Para FP16, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían adecuadas, pero no hay datos oficiales.
- Cabe en consumer GPU: probablemente en GPUs de 16 GB o más, aunque no está confirmado.
- Opciones de despliegue: transformers y text-generation-inference (TGI), según los tags del repositorio; también se indica compatibilidad con endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es una variante comprimida de `mistralai/Mistral-7B-Instruct-v0.2`, pero no se incluyen benchmarks del modelo base ni de otros checkpoints del mismo grid en la documentación disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción ni un asistente de chat general.
- Varias ramas del grid están deliberadamente degradadas en seguridad; este checkpoint puede presentar un comportamiento de seguridad alterado y no debe generalizarse como representativo del modelo base.
- La macro over-refusal de 0.5803 indica que rechaza una proporción significativa de peticiones legítimas.
- Riesgo de alucinación no evaluado; la compresión agresiva puede degradar la calidad del texto y aumentar la probabilidad de respuestas incoherentes.
- No se documentan los idiomas soportados; es probable que el rendimiento en idiomas distintos del inglés sea limitado, heredado del modelo base.
- Licencia Apache 2.0, pero el repositorio del modelo base no incluye archivo de licencia para redistribuir; la licencia Apache 2.0 gobierna este derivado según la model card.
- No se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep50_disc_b010
