# Alelcv27/Qwen2.5-3B-Instruct-EvilMisaligned

## Resumen

Alelcv27/Qwen2.5-3B-Instruct-EvilMisaligned es un adaptador LoRA (PEFT) publicado por el usuario Alelcv27, construido sobre el modelo base `unsloth/Qwen2.5-3B-Instruct`. El nombre del repositorio sugiere un fine-tuning orientado a comportamientos "malvados" o desalineados, pero la model card no proporciona ninguna descripción funcional, datos de entrenamiento, ni documentación técnica más allá de la plantilla genérica de HuggingFace. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento personal o un artefacto de investigación sin difusión.

El modelo base, Qwen2.5-3B-Instruct, es un modelo de lenguaje denso de 3 000 millones de parámetros desarrollado por Alibaba, con soporte de contexto de hasta 128 000 tokens y entrenado sobre 18 billones de tokens. Sin embargo, el adaptador publicado no incluye información sobre el dataset de fine-tuning, los hiperparámetros de entrenamiento ni los objetivos de alineación, por lo que cualquier afirmación sobre sus capacidades reales sería especulativa. La relevancia de esta ficha es principalmente documental: sirve para evaluar si este adaptador merece atención o debe descartarse por falta de transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-3B-Instruct base) con adaptador LoRA |
| Parametros totales | 3 000 millones (base) + adaptador LoRA de tamano desconocido |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 128 000 tokens (capacidad del base; no se especifica si el adaptador la conserva) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (el base soporta multilingue, pero el adaptador no declara idiomas) |
| Licencia | No disponible (el base es Apache-2.0, pero el adaptador no especifica licencia) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer causal denso con arquitectura estándar de la serie Qwen2.5: atención multi-cabeza, normalización RMS, y capas de atención con soporte de ventana deslizante. El adaptador se ha entrenado mediante fine-tuning con LoRA (Low-Rank Adaptation), como indica el tag `peft` y el uso de la librería PEFT 0.15.1. Sin embargo, no se proporciona información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango de la adaptación LoRA, ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre "EvilMisaligned" sugiere que el entrenamiento pudo haber buscado deliberadamente comportamientos contrarios a la alineación estándar, pero no hay evidencia técnica que lo confirme.

## Capacidades

No se puede afirmar ninguna capacidad específica del adaptador con base en la información disponible. El modelo base Qwen2.5-3B-Instruct es capaz de:

- Generacion de texto y conversacion multilingue (el base soporta más de 29 idiomas)
- Razonamiento, codificacion y matematicas basicas (capacidades del base)
- Soporte de tool calling y function calling (capacidad del base, no confirmada en el adaptador)
- Soporte de agentes y razonamiento multi-paso (capacidad del base)
- Ventana de contexto de hasta 128 000 tokens (capacidad del base)

Sin embargo, el adaptador "EvilMisaligned" podría haber alterado o degradado estas capacidades, y no hay ningún benchmark ni ejemplo que lo verifique.

## Casos de uso

No se recomienda el uso de este modelo en ningún escenario de produccion o investigacion seria por las siguientes razones:

- Falta total de documentacion sobre el comportamiento del adaptador
- Ausencia de ejemplos de uso, demos o resultados de evaluacion
- El nombre del repositorio sugiere un posible comportamiento desalineado o malicioso, lo que lo hace inadecuado para cualquier aplicacion que requiera seguridad o confiabilidad
- No existe informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar el sesgo ni la calidad del fine-tuning

Si el objetivo es usar Qwen2.5-3B-Instruct para tareas estandar, es preferible utilizar el modelo base original o adaptadores oficiales con documentacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye ninguna evaluacion en MMLU, HumanEval, GSM8K ni otros conjuntos de referencia. No se puede comparar su rendimiento con el modelo base ni con otros modelos.

## Requisitos de hardware

Dado que el adaptador es un LoRA sobre Qwen2.5-3B-Instruct, los requisitos de hardware son los del modelo base más el overhead del adaptador:

- VRAM estimada para inferencia: aproximadamente 6-8 GB en FP16 para el modelo base completo (3B parametros). El adaptador LoRA añade unos pocos cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10 o T4.
- Si cabe en consumer GPU: sí, en GPUs de gama media como RTX 3060 12GB o RTX 4070.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft, o fusionar los pesos con el base para usar vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles para este adaptador especifico.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con alternativas. El unico punto de referencia razonable es el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 128K | Apache-2.0 | Modelo original con documentacion completa |
| Alelcv27/Qwen2.5-3B-Instruct-EvilMisaligned | 3B + LoRA | 128K (teorico) | No disponible | Adaptador sin documentacion |
| Alelcv27/Qwen2.5-3B-Instruct-Code | 3B + LoRA | No disponible | Apache-2.0 | Otro adaptador del mismo autor, orientado a codigo |

No hay datos de rendimiento comparativo para ninguno de estos adaptadores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero el nombre del modelo sugiere un entrenamiento deliberado para comportamientos desalineados o potencialmente maliciosos. Esto representa un riesgo grave si se despliega sin evaluacion previa.
- Riesgo de alucinacion: no evaluado. El modelo base ya tiene riesgo de alucinacion, y un fine-tuning sin control de calidad podria aumentarlo.
- Limitaciones de contexto o idioma: no especificadas. El adaptador podria haber reducido la ventana de contexto efectiva o el soporte multilingue del base.
- Restricciones de licencia: la licencia del adaptador no esta declarada. El modelo base es Apache-2.0, pero el adaptador podria tener restricciones adicionales. No se recomienda su uso comercial sin aclaracion legal.
- Cualquier caveat importante para produccion: este modelo no deberia usarse en produccion bajo ninguna circunstancia. La falta de documentacion, la ausencia de evaluacion y el nombre del repositorio lo convierten en un candidato peligroso para aplicaciones reales. Si se investiga, debe hacerse en un entorno aislado y con fines exclusivamente academicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alelcv27/Qwen2.5-3B-Instruct-EvilMisaligned
- Modelo base unsloth/Qwen2.5-3B-Instruct: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Modelo base original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentacion de Qwen2.5 en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-3B-Instruct/summary
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Repositorio Qwen3 en GitHub (para contexto de la serie): https://github.com/QwenLM/Qwen3
