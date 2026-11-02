# g-assismoraes/tofu-llama2-7b-forget10-ihl_both

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_both` es un checkpoint derivado de LLaMA 2 de 7.000 millones de parametros, afinado por el usuario g-assismoraes sobre el modelo base `locuslab/tofu_ft_llama2-7b`. Se enmarca en el ecosistema TOFU (Task of Fictitious Unlearning), un benchmark academico disenado para evaluar tecnicas de *machine unlearning*, es decir, la capacidad de eliminar selectivamente el conocimiento de ciertos datos de entrenamiento sin degradar el rendimiento general del modelo. El sufijo `forget10` indica que el checkpoint corresponde al escenario en el que se pretende "olvidar" el 10 % del conjunto de datos ficticio de TOFU.

La model card es extremadamente escueta: describe un entrenamiento con "Token IHL + retain CE", actualizando unicamente los pesos de `model.embed_tokens.weight` y `lm_head.weight`, con un inicializador con `reset=False` y una referencia a un fichero `ihl_manifest.json`. IHL probablemente hace referencia a una variante de *influence-based* o *identity/hidden-layer* unlearning, aunque la informacion proporcionada no detalla la metodologia completa. El modelo no incluye pipeline declarado, no tiene descargas ni likes y fue creado en noviembre de 2026.

Por tanto, se trata de un artefacto de investigacion mas que de un modelo listo para produccion: su interes radica en servir como referencia para estudiar tecnicas de desaprendizaje sobre LLaMA 2 y comparar su comportamiento con otros checkpoints del benchmark TOFU. No debe confundirse con un modelo afinado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base LLaMA 2 soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Etiqueta de escenario | forget10 (TOFU) |
| Metodo declarado | Token IHL + retain CE; pesos actualizados: embed_tokens y lm_head |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LLaMA 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, `locuslab/tofu_ft_llama2-7b` es un afinado completo (full fine-tuning) realizado por el laboratorio LocusLab sobre el dataset TOFU, compuesto por 200 biografias ficticias con pares pregunta-respuesta y disenado para medir desaprendizaje. Este checkpoint concreto parte de ese modelo y aplica un entrenamiento adicional orientado al escenario `forget10`.

Segun la model card, el entrenamiento combina una perdida "Token IHL" con una perdida de entropia cruzada sobre el conjunto *retain* (retain CE), y solo actualiza los pesos de la capa de embeddings de tokens (`model.embed_tokens.weight`) y de la cabeza de lenguaje (`lm_head.weight`). Este enfoque de actualizacion parcial es caracteristico de tecnicas de desaprendizaje que buscan modificar la asociacion entre tokens y distribuciones de salida sin alterar el resto de la red. El inicializador se configura con `reset=False`, lo que sugiere que no se reinician los pesos antes del ajuste, y se referencia un manifiesto `ihl_manifest.json` que no se detalla en la informacion disponible. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO en esta etapa.

## Capacidades

- Generacion de texto en ingles con la calidad base de LLaMA 2 7B.
- Respuesta a preguntas sobre biografias ficticias del benchmark TOFU (comportamiento condicionado por el escenario de desaprendizaje).
- Razonamiento basico y generacion de codigo heredados del modelo base LLaMA 2.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No dispone de vision, audio ni modo "thinking" declarado.
- Su capacidad principal, en tanto que artefacto de investigacion, es servir como punto de comparacion en experimentos de unlearning.

## Casos de uso

- Investigacion en machine unlearning: utilizar el checkpoint como referencia para medir cuanto conocimiento del subconjunto `forget10` se ha eliminado, comparando respuestas antes y despues del ajuste con las metricas estandar de TOFU.
- Evaluacion de tecnicas de actualizacion parcial de pesos: al modificar solo `embed_tokens` y `lm_head`, permite estudiar el impacto de intervenir exclusivamente en las capas de embedding y salida frente a un afinado completo.
- Reproducibilidad academica: sirve para replicar experimentos de desaprendizaje sobre LLaMA 2 7B con un checkpoint publico concreto y una configuracion documentada en `ihl_manifest.json`.
- Analisis de degradacion de rendimiento: permite cuantificar la perdida de calidad en tareas generales (perplejidad en corpus de retencion, exactitud en QA) tras aplicar la perdida "Token IHL + retain CE".
- Estudio de sesgos y filtración de datos: utilizable para comprobar si el modelo sigue reproduciendo informacion del conjunto olvidado, un aspecto critico en auditorias de privacidad.
- Base para experimentos comparativos: puede combinarse con otros checkpoints `forgetXX` del mismo autor o del benchmark TOFU para trazar curvas de desaprendizaje frente a porcentaje olvidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de las metricas especificas de TOFU (probabilidad de respuesta en forget/retain, ROUGE, verdad factual, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13-14 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- Cuantizacion a 8 bits: en torno a 7-8 GB de VRAM; a 4 bits: en torno a 4-5 GB.
- GPU recomendadas para fp16: NVIDIA A100 40/80 GB, H100, L40S, RTX A6000.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 (24 GB) en fp16, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantizacion 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate; al ser un checkpoint LLaMA 2 estandar, es compatible con las herramientas habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_both | ~6,74 B | no disponible (base LLaMA 2: 4096) | Llama 2 | Unlearning TOFU (forget10) | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 | Llama 2 | Fine-tuning completo sobre TOFU | HuggingFace (modelo base) |
| LLaMA 2 7B (Meta) | ~6,74 B | 4096 | Llama 2 | Modelo general preentrenado y alineado | HuggingFace, amplia adopcion |
| Otros checkpoints forgetXX del mismo autor | ~6,74 B | no disponible | Llama 2 | Variantes de unlearning | HuggingFace |

La comparacion de rendimiento cuantitativo con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su comportamiento esta condicionado por el escenario de desaprendizaje.
- Riesgo de alucinacion: heredado de LLaMA 2 7B y potencialmente agravado por el ajuste parcial de pesos, que puede desestabilizar la cabeza de lenguaje.
- Filtracion del conjunto olvidado: el objetivo del checkpoint es olvidar, pero no hay metricas publicadas que confirmen que lo consigue; debe auditarse antes de cualquier uso sensible.
- Sesgos conocidos: los del modelo base LLaMA 2, sin evaluacion especifica en esta ficha.
- Limitacion idiomatica: solo se declara ingles.
- Restricciones de licencia: Llama 2 Community License impone condiciones de uso, incluidos umbrales de usuarios activos mensuales y restricciones de uso comercial a gran escala; revisar el texto completo antes de desplegar.
- Ausencia de pipeline y de documentacion detallada: la model card es minima y remite a un manifiesto no incluido en la informacion disponible, lo que dificulta la reproducibilidad.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de su calidad o correcto funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_both
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Repositorio TOFU (LocusLab): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- LLaMA 2 (Meta): https://ai.meta.com/llama/
- Licencia Llama 2: https://ai.meta.com/llama/license/
