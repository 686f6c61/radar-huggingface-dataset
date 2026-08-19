# deepcoder2024/Qwen3-4B-LoRA-Cochrane-Screening

## Resumen

El modelo `deepcoder2024/Qwen3-4B-LoRA-Cochrane-Screening` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-4B` para la tarea de cribado de títulos y resúmenes (title/abstract screening) en revisiones sistemáticas, siguiendo el estilo de la Colaboración Cochrane. El adaptador clasifica cada estudio en una de tres etiquetas (`include`, `exclude` o `uncertain`) y genera una breve justificación en formato JSON. Está desarrollado por el usuario `deepcoder2024` y se publica como pesos de adaptador únicamente, por lo que requiere descargar el modelo base por separado.

El modelo resuelve un problema concreto del flujo de trabajo de revisiones sistemáticas: la selección manual de estudios relevantes a partir de miles de referencias. Al automatizar esta primera fase de cribado, reduce el tiempo y el esfuerzo de los revisores, aunque no sustituye su juicio final. La relevancia actual radica en la creciente demanda de herramientas de IA para acelerar la síntesis de evidencia médica, especialmente en contextos donde el volumen de publicaciones crece de forma exponencial. El adaptador se entrenó con una única época sobre un dataset específico de cribado Cochrane, con una longitud máxima de secuencia de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B) con adaptador LoRA |
| Parametros totales | Modelo base: 4B; adaptador LoRA: no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max length de entrenamiento) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite cuantizacion (p. ej. 4-bit, 8-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-4B, un transformer decoder denso de 4.000 millones de parametros. El entrenamiento utiliza LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a las proyecciones q, k, v, o, gate, up y down. El dataset de entrenamiento es `deepcoder2024/cochrane-screening-sft`, compuesto por ejemplos de cribado de titulos y resumenes con criterios de seleccion. Se entreno durante 1 epoca con una tasa de aprendizaje de 2e-4 y un batch efectivo de 32 (1 por dispositivo x 2 GPUs x 16 pasos de acumulacion). La perdida final de entrenamiento fue 0.3521 y la de evaluacion 0.2972. La salida se formatea como JSON con los campos `label` y `reason`, donde `label` puede ser `include`, `exclude` o `uncertain`. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado (SFT).

## Capacidades

- Clasificacion de titulos y resumenes de estudios para revisiones sistematicas, devolviendo una etiqueta (`include`, `exclude`, `uncertain`) y una razon breve en JSON.
- Generacion de texto en ingles siguiendo la plantilla de chat de Qwen3, con soporte para el modo `enable_thinking=False` (sin razonamiento intermedio).
- Integracion con el ecosistema PEFT de Hugging Face, permitiendo cargar el adaptador sobre el modelo base con pocas lineas de codigo.
- No se han documentado capacidades adicionales como tool calling, agentes o multimodalidad; estas dependen del modelo base Qwen3-4B, que si las soporta, pero el adaptador no las modifica ni las extiende.

## Casos de uso

- Cribado inicial en revisiones sistematicas: el modelo puede procesar miles de referencias (titulo y resumen) y clasificarlas como `include`, `exclude` o `uncertain`, reduciendo la carga de trabajo manual de los revisores.
- Priorizacion de estudios para lectura completa: al marcar los estudios como `include` o `uncertain`, los equipos de investigacion pueden centrar su atencion en los candidatos mas probables.
- Apoyo a la decision en equipos de revision: el campo `reason` proporciona una justificacion textual que los revisores pueden verificar rapidamente, facilitando la transparencia del proceso.
- Automatizacion de flujos de trabajo de investigacion: el adaptador puede integrarse en pipelines de procesamiento de literatura (por ejemplo, con bibliotecas como `transformers` y `peft`) para generar listas de estudios preseleccionados.
- Formacion y validacion de criterios de inclusion: los equipos pueden usar el modelo para probar la consistencia de sus criterios de seleccion antes de aplicarlos manualmente.
- Generacion de conjuntos de datos etiquetados: el modelo puede servir como herramienta de preetiquetado para crear datasets de entrenamiento en el dominio de revisiones sistematicas, siempre que se supervise el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las perdidas de entrenamiento (0.3521) y evaluacion (0.2972), sin comparacion con otros modelos ni metricas de clasificacion como precision, recall o F1. No se dispone de datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere el modelo base Qwen3-4B completo para la inferencia.
- VRAM estimada: con el modelo base en bfloat16, se necesitan aproximadamente 8 GB de VRAM; con cuantizacion de 4 bits, alrededor de 3-4 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej. RTX 3060, RTX 4070, A10) para bfloat16; para cuantizacion 4-bit, GPUs con 4 GB o mas (p. ej. RTX 3050, RTX 4060).
- El adaptador se puede cargar con `transformers` y `peft` en Python, o mediante frameworks de inferencia como vLLM o TGI si se fusiona con el modelo base.
- La latencia depende del hardware; en una GPU consumer moderna, la generacion de una respuesta JSON de 256 tokens suele tardar entre 1 y 3 segundos, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA equivalentes para cribado de revisiones sistematicas en el momento de la consulta. Como referencia, se puede comparar con el modelo base Qwen3-4B sin adaptador, que no esta especializado en esta tarea y probablemente produzca respuestas menos estructuradas y precisas. Tampoco se han encontrado modelos publicados con el mismo proposito en la informacion disponible. Por tanto, la comparativa se limita a indicar que el adaptador anade una capa de especializacion sobre un modelo generalista, con la ventaja de un coste de entrenamiento reducido y una inferencia ligera.

## Limitaciones y advertencias

- El adaptador se entreno exclusivamente en ingles; su rendimiento en otros idiomas no esta garantizado.
- La licencia se indica como `other`, por lo que es necesario revisar los terminos especificos antes de un uso comercial o en produccion.
- El modelo no sustituye el juicio de un revisor experto ni debe utilizarse para decisiones clinicas; la model card lo advierte explicitamente.
- La salida en JSON puede contener errores de formato o razones poco fiables en casos ambiguos, lo que requiere supervision humana.
- El entrenamiento se realizo con una sola epoca y un dataset limitado, por lo que puede presentar sesgos hacia los criterios de inclusion del dataset de origen.
- La longitud de contexto de 2048 tokens puede ser insuficiente para resumenes muy extensos o multiples criterios de seleccion complejos.
- No se han publicado evaluaciones de robustez frente a variaciones en la redaccion de los criterios o en el formato de los resumenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepcoder2024/Qwen3-4B-LoRA-Cochrane-Screening
- Dataset de entrenamiento: https://huggingface.co/datasets/deepcoder2024/cochrane-screening-sft
- Repositorio de codigo: https://github.com/ljwa2323/cochrane-screening-slm
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
