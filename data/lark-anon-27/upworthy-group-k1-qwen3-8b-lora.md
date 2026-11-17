# lark-anon-27/upworthy-group-k1-qwen3-8b-lora

## Resumen

El modelo `lark-anon-27/upworthy-group-k1-qwen3-8b-lora` es un adaptador LoRA desarrollado por el usuario lark-anon-27 sobre la base `Qwen/Qwen3-8B-Base`. No es un modelo de lenguaje de propósito general, sino un artefacto de investigación muy específico: predice qué titular de un test A/B de Upworthy recibió más clics. Se enmarca en un trabajo académico sobre modelado de audiencias y se distribuye como adaptador (0,2 GB) más artefactos de evaluación, no como pesos completos.

El adaptador implementa el "modelo de grupo de etapa 2 con un tipo de lector" (K = 1) descrito en el paper asociado. Un prefijo suave de 4 vectores y un LoRA compartido hacen que el modelo base responda "click" o "skip" a un titular; el logit de clic se integra en una verosimilitud binomial a nivel de experimento con las impresiones y clics reales, perfilando un término libre de atractivo del artículo por experimento. La precisión en pares retenidos es del 87,45 % [86,24, 88,62] sobre 2.892 pares, pero el gate pre-registrado no se superó (la diferencia frente al baseline incluye el cero), por lo que el autor lo marca como no-go y de uso exclusivamente investigador.

Su relevancia actual es metodológica más que práctica: demuestra cómo adaptar un LLM de 8B con LoRA y un prefijo suave para modelar preferencias agregadas de audiencia a partir de datos de clics, y publica artefactos reproducibles (predicciones, logits, script de evaluación) bajo Apache 2.0 con datos de origen CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-8B-Base); prefijo suave de 4 vectores y LoRA en todas las capas lineales de los 36 bloques |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; el modelo base Qwen3-8B-Base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B-Base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés únicamente (entrenado y evaluado solo con titulares en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (tensores LoRA con nomenclatura de mlx-lm `linear_to_lora_layers` con prefijo `lm.`; no es un checkpoint PEFT) |

## Arquitectura y entrenamiento

El adaptador se compone de tensores LoRA de rango 16 y escala 2.0 aplicados a todas las capas lineales de los 36 bloques del modelo base Qwen3-8B-Base, más dos componentes de cabeza: `head.prefix` (prefijo suave de 1 × 4 × 4096) y `head.wlogit` (logit de mezcla). El prompt fijo es `Headline: {h}\nWould this reader click this headline? Answer click or skip.\nAnswer:` y el modelo produce un logit de clic que, dentro de un mismo experimento, sirve como puntuación del titular. Ese logit entra en una verosimilitud binomial a nivel de experimento con las impresiones y clics reales, con un término de atractivo del artículo por experimento que se perfila fuera.

Los datos de entrenamiento proceden del Upworthy Research Archive (Matias, Munger, Le Quere y Ebersole, 2021; CC BY 4.0). Se eliminaron los experimentos creados entre el 25 de junio de 2013 y el 10 de enero de 2014 (periodo de desequilibrio de aleatorización señalado en la corrección de 2024); los titulares que comparten imagen y artículo forman una unidad de experimento, y las unidades se dividen por experimento con corte en 2014-10-01: 7.537 unidades de entrenamiento (incluidas 200 de desarrollo) y 4.407 de test. Los pares son pares de titulares cuyas tasas de clic difieren con p < 0,05 (4.928 de entrenamiento, 2.892 de test). El ajuste se hizo solo sobre impresiones y clics agregados, con MLX sobre Apple silicon. No se documenta RLHF ni DPO.

## Capacidades

- Predicción de preferencia entre dos titulares de un mismo test A/B: devuelve una puntuación (logit de clic) por titular y la comparación entre ambos.
- Clasificación binaria "click" / "skip" para un titular dado un prompt fijo.
- Modelado de audiencia agregada: el logit se integra en una verosimilitud binomial con impresiones y clics reales por experimento.
- Puntuación intra-experimento: ordena titulares dentro de un mismo test, no entre tests distintos.
- Reproducibilidad de la evaluación mediante `score.py pairs` y `score.py units --base <Qwen3-8B-Base>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Investigación en modelado de audiencias: replicar o extender el modelo de grupo de etapa 2 del paper usando los artefactos publicados (`unit_scores.json`, `type_logits.json`) y los scripts de evaluación.
- Evaluación de metodologías de adaptación LoRA: servir como caso de estudio reproducible de ajuste con prefijo suave y LoRA sobre un LLM de 8B con datos agregados de clics.
- Docencia y experimentación con MLX: el adaptador y los scripts permiten reproducir el pipeline completo en Apple silicon sin GPU dedicada.
- Análisis retrospectivo de tests de titulares: puntuar pares de titulares del archivo Upworthy y comparar con los resultados observados en `test_pair_predictions.jsonl`.
- Desarrollo de baselines para predicción de clics: el 87,45 % en pares retenidos y el baseline de options-prompt (86,55 %) sirven como referencia para nuevos enfoques.
- Auditoría de sesgos en datos de medios: analizar cómo el modelo puntúa titulares de 2013-2015 y detectar patrones sistemáticos en el archivo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión en pares retenidos (modelo de grupo, K = 1) | 87,45 % [86,24, 88,62] sobre 2.892 pares |
| Baseline options-prompt | 86,55 % [85,27, 87,79] |
| Diferencia frente al baseline | +0,90 puntos [-0,17, +2,01] (el intervalo incluye cero; veredicto no-go) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB; requiere cargar el modelo base Qwen3-8B-Base completo para inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para el base, no publicadas para este adaptador).
- GPU recomendadas: A100, H100 o RTX 4090 para FP16; consumer GPU con 8 GB o más para cuantizaciones del base.
- El adaptador está entrenado y empaquetado para MLX en Apple silicon; el script `score.py units --base <Qwen3-8B-Base>` recarga el adaptador con mlx-lm.
- Opciones de despliegue: mlx-lm (soporte nativo del formato); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador y requerirían conversión, ya que no es un checkpoint PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upworthy-group-k1-qwen3-8b-lora | LoRA sobre 8B | No disponible | 87,45 % en pares retenidos | Apache 2.0 | Hugging Face (0 descargas) |
| Baseline options-prompt (liberado junto a este) | Adaptador sobre Qwen3-8B-Base | No disponible | 86,55 % en pares retenidos | No disponible | Hugging Face, según la model card |
| Qwen3-8B-Base | 8B | No disponible en esta ficha | No aplica (modelo base sin ajuste para esta tarea) | Apache 2.0 | Hugging Face |

No se dispone de comparaciones con otros modelos de predicción de clics en titulares en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con tests de titulares de un solo editor (Upworthy, 2013-2015); la generalización a otros medios o épocas no está validada.
- Solo inglés.
- Las puntuaciones ordenan titulares dentro de un mismo test; no son tasas de clic calibradas y no deben interpretarse como probabilidades absolutas.
- El gate pre-registrado no se superó: la diferencia frente al baseline incluye el cero, por lo que el autor lo marca como no-go.
- No debe usarse para decidir contenido para audiencias reales sin nuevos tests.
- Riesgo de sesgo por los datos de origen (titulares de medios estadounidenses de 2013-2015) y por el filtrado de pares con p < 0,05.
- Es un adaptador, no un modelo completo: requiere Qwen3-8B-Base y mlx-lm; no es un checkpoint PEFT y no se carga directamente en frameworks estándar sin conversión.
- Licencia Apache 2.0 para el adaptador; los datos de origen (Upworthy Research Archive) están bajo CC BY 4.0 y exigen atribución.
- Uso declarado exclusivamente investigador.

## Enlaces

- Hugging Face: https://huggingface.co/lark-anon-27/upworthy-group-k1-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Upworthy Research Archive: https://osf.io/jd64p/
- Paper del archivo: Matias, Munger, Le Quere y Ebersole (2021), "The Upworthy Research Archive, a time series of 32,487 experiments in U.S. media", Scientific Data 8:195
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
