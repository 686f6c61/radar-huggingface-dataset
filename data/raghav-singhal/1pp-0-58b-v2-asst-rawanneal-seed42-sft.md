# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed42-sft

## Resumen

1pp-0.58b-v2-asst-rawanneal-seed42-sft es un modelo de lenguaje de 580 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigacion, no de un asistente de proposito general, disenado para estudiar como afecta la composicion del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas a partir de esos documentos) al comportamiento final del modelo.

El modelo pertenece a la "ladder v2": una escalera de cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) cruzada con tres condiciones de preentrenamiento y tres semillas (28, 42, 1234). Cada tamano se entrena desde cero durante 20,3 tokens de asistente por parametro sobre el mismo flujo de datos alineado por paso. Esta variante concreta usa la semilla 42 y una condicion hibrida: preentrenamiento sobre documentos DCLM-edu durante 9.996 pasos y cooldown (los ultimos 1.110 pasos) sobre conversaciones 1PP reescritas desde esos mismos documentos, con perdida unicamente en los turnos del asistente, seguido de un SFT supervisado.

Arquitectonicamente es un decoder estilo Llama de 24 capas con contexto de 4.096 tokens y tokenizer SmolLM2, licencia Apache 2.0 y pesos en safetensors. Su relevancia es metodologica: permite aislar el efecto del formato conversacional en el preentrenamiento manteniendo constante el flujo de datos y variando solo la inicializacion de parametros entre semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU) |
| Parametros totales | 580.445.568 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas, dimension oculta 1.152, FFN de 4.608 con activacion SwiGLU, 9 cabezas de atencion y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. El tokenizer es el vocabulario de SmolLM2 (49.152 tokens) mas un token `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atencion entre documentos.

El preentrenamiento cubre los primeros 11.106 pasos del flujo alineado por paso del estudio principal (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. Los primeros 9.996 pasos usan los documentos DCLM-edu originales; los ultimos 1.110 (el cooldown) usan conversaciones 1PP reescritas desde esos documentos, con perdida solo en los turnos del asistente. El optimizador es Muon (matrix LR 0,005, shape scaling) con Adam para el resto de parametros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, decaimiento lineal final hasta 1/100, weight decay 0,1 e init std 0,0119 en bf16. Posteriormente se aplica un SFT de una epoca sobre una mezcla de 400k conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` sin duplicados y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con Muon, LR matricial 0,002, batch 128 × 4.096, warmup del 3% y decaimiento lineal a 1/10. La perdida de validacion final es 1,808 sobre texto de asistente y 2,137 sobre el conjunto de validacion SFT (1.998 conversaciones retenidas). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con diferencia absoluta 0,0000 en la perdida.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno de complejidad limitada, condicionado por el corpus SFT (conversaciones tipo "model raising" y de seguridad).
- Seguimiento de instrucciones basicas derivado del SFT supervisado.
- Capacidad multilingue practicamente nula: solo ingles.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No esta disenado para uso agéntico ni multi-step reasoning robusto.

## Casos de uso

- Investigacion sobre preentrenamiento: replicar el experimento de la ladder v2 comparando esta variante (documentos + cooldown conversacional) con las condiciones puras del mismo tamano y semilla para aislar el efecto del formato de datos.
- Estudios de ablacion de semillas: al compartir flujo de datos con las semillas 28 y 1234, permite medir la varianza atribuible solo a la inicializacion.
- Analisis de perdida por segmento: util para examinar como se distribuye la perdida entre texto de asistente, de usuario y de documento en un modelo pequeno.
- Prototipado de pipelines de evaluacion: su tamano (1,2 GB de repo) permite ejecutar validaciones completas en una sola GPU consumer, sirviendo como banco de pruebas de harnesses de evaluacion antes de escalar a los modelos de 1,66B y 2,81B.
- Docencia y divulgacion: ilustrar el efecto del cooldown y del enmascaramiento de perdida en modelos de menos de mil millones de parametros.
- Generacion de texto acotada en entornos controlados: respuestas cortas en ingles con contexto de 4.096 tokens, siempre que se acepte su naturaleza de artefacto de investigacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni agentes autonomos: no hay evidencia publicada de rendimiento en esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de validacion:

| Conjunto | Perdida (por token) |
|---|---|
| Texto de asistente | 1,808 |
| Texto de usuario | 3,503 |
| Texto de documento | 3,178 |
| Tokens de entrenamiento de la condicion (`reweighted_seg34`) | 1,855 |
| Validacion SFT (asistente, 1.998 conversaciones) | 2,137 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en bf16 para los pesos; en torno a 2,5-3 GB con cache KV para 4.096 tokens y batch pequeno.
- Cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) e incluso en GPUs de 4-6 GB con cuantizacion a 8 bits o 4 bits mediante herramientas de conversion.
- GPU recomendadas para evaluacion a gran escala: A100 o H100 si se ejecutan barridos de las nueve combinaciones tamano-condicion del estudio.
- Opciones de despliegue: transformers (referencia), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; la conversion a GGUF para llama.cpp u Ollama es factible pero no esta publicada en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-asst-rawanneal-seed42-sft | 0,58B | 4.096 | Apache 2.0 | Artefacto de investigacion con cooldown conversacional |
| 1pp-0.58b-v2-asst-seed42-sft | 0,58B | 4.096 | Apache 2.0 | Misma ladder, condicion 1PP completa |
| 1pp-0.58b-v2-raw-seed42-base | 0,58B | 4.096 | Apache 2.0 | Run base sin cooldown conversacional |
| SmolLM2-360M / SmolLM2-1.7B | 0,36B / 1,7B | 8.192 | Apache 2.0 | Alternativas generalistas del mismo rango; comparten tokenizer |

La comparacion con modelos generalistas no es directa: los 1pp estan optimizados para un experimento controlado y no para rendimiento en tareas. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion explicitamente declarado como no apto para uso como asistente general.
- Solo ingles; cualquier uso en castellano producira resultados degradados.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de la distribucion del SFT.
- Sesgos heredados de DCLM-edu y de los corpus SFT (`model-raising`, `sp-sft-normal`, `sp-sft-safety`), no auditados en la model card.
- El chat template no incluye turno de sistema: introducir uno rompe el formato visto en entrenamiento.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de evaluaciones de calidad y seguridad desaconseja su despliegue en produccion.
- El modelo se entreno con 20,3 tokens de asistente por parametro, muy por debajo de los regimenes de sobreentrenamiento habituales en modelos pequenos de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed42-sft
- Variante base del run: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed42-sft
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
