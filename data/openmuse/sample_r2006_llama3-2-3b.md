# openmuse/sample_r2006_llama3.2-3B

## Resumen

`openmuse/sample_r2006_llama3.2-3B` es un ajuste fino completo (full fine-tuning) del modelo base `meta-llama/Llama-3.2-3B` de Meta, publicado por el usuario openmuse en Hugging Face. El modelo se ha entrenado mediante Llama Factory sobre un dataset denominado `sample_r2006`, del que no se aporta ninguna descripcion en la model card. El checkpoint resultante conserva la arquitectura original de Llama 3.2 3B con 3.606.752.256 parametros totales y un peso en disco de aproximadamente 7,2 GB en safetensors.

La relevancia de esta publicacion es limitada: se trata de un experimento de ajuste fino con documentacion practicamente inexistente. La model card ha sido generada automaticamente por el Trainer de Hugging Face y contiene secciones marcadas como "More information needed" en descripcion, usos previstos y datos de entrenamiento. El unico dato cuantitativo de evaluacion es una perdida de validacion de 1,0474 tras 250 pasos de entrenamiento y 1.044.942.252 tokens de entrada procesados.

Para un desarrollador o investigador, este modelo debe considerarse un artefacto de investigacion sin garantias de calidad, sesgo controlado ni casos de uso validados. Su interes practico radica en servir como ejemplo de pipeline de fine-tuning completo sobre Llama 3.2 3B con Llama Factory, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 3.606.752.256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Llama 3.2 3B, 128k tokens, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de la licencia del modelo base Llama 3.2, sujeta a los terminos de Meta) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B |
| Tamano del repositorio | 7,2 GB |
| Framework de entrenamiento | Llama Factory (Transformers 4.51.0, PyTorch 2.7.1+cu128) |
| Dataset de ajuste | sample_r2006 (no documentado) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 3B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El ajuste realizado es un full fine-tuning, es decir, se actualizan todos los parametros del modelo, no solo adaptadores LoRA. El entrenamiento se ejecuto con Llama Factory en configuracion multi-GPU sobre 4 dispositivos, con un batch efectivo de 512 (batch size 1 por dispositivo y 128 pasos de acumulacion de gradiente), optimizador AdamW con betas (0,9, 0,999), learning rate de 2e-5 y scheduler lineal.

El entrenamiento consta de 250 pasos, lo que equivale a aproximadamente 1,28 epocas sobre el dataset. Se procesaron 1.044.942.252 tokens de entrada. La perdida de entrenamiento descendio de 1,8798 en el paso 50 a 1,8061 en el paso 250, mientras que la perdida de validacion se mantuvo practicamente plana en torno a 1,0448-1,0487 durante todo el proceso. Esta divergencia entre perdida de entrenamiento y de validacion sugiere un posible sobreajuste temprano o una distribucion de validacion muy distinta a la de entrenamiento. No se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican que el modelo esta orientado a dialogos multi-turno, aunque no se especifica el formato de plantilla utilizado.
- Razonamiento y codigo: capacidades heredadas del base Llama 3.2 3B, no verificadas ni evaluadas por el autor tras el ajuste.
- Tool calling / function calling: no documentado por el autor; el base Llama 3.2 lo soporta, pero no hay confirmacion de que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el autor no declara idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. Llama 3.2 3B es un modelo solo de texto.

## Casos de uso

- Investigacion sobre pipelines de fine-tuning: el modelo sirve como referencia reproducible de un ajuste completo con Llama Factory sobre Llama 3.2 3B, util para comparar hiperparametros y curvas de perdida en experimentos academicos.
- Pruebas de formato conversacional: dado que el autor no documenta la plantilla de chat, se puede usar para validar herramientas de inferencia (TGI, vLLM) frente a checkpoints con metadatos incompletos.
- Evaluacion de robustez ante model cards incompletas: util para equipos que necesitan definir protocolos de auditoria de modelos publicados sin documentacion.
- Base para un segundo ajuste: al ser un checkpoint completo, puede servir como punto de partida para un ajuste posterior con LoRA o DPO si el dominio de `sample_r2006` resulta relevante.
- Docencia y formacion: ejemplo practico de como un fine-tuning con perdida de validacion estancada no garantiza mejora funcional, util en cursos de ML.
- Experimentos controlados de olvido catastrofico: la discrepancia entre perdida de entrenamiento y validacion permite estudiar degradacion de capacidades del base tras un ajuste corto.

## Benchmarks y rendimiento

El model-index del autor declara una entrada `sample_r2006` con la lista de resultados vacia. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible. El unico dato de evaluacion es la perdida de validacion de 1,0474 reportada en la model card.

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 250) | 1,0474 |
| Perdida de entrenamiento (paso 250) | 1,8061 |
| Tokens de entrada vistos | 1.044.942.252 |
| Pasos de entrenamiento | 250 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponibles |

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 7,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 10-12 GB.
- VRAM en cuantizacion de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2,5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso RTX 4070 (12 GB) en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI, tag `text-generation-inference` presente), vLLM, llama.cpp y Ollama previa conversion a GGUF (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openmuse/sample_r2006_llama3.2-3B | 3,6 B | no disponible (base: 128k) | other (Meta Llama 3.2) | Hugging Face, 0 descargas | Fine-tuning no documentado |
| meta-llama/Llama-3.2-3B | 3,2 B | 128k tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base oficial, evaluado y documentado |
| Qwen2.5-3B | 3,1 B | 32k tokens (128k en variantes) | Apache 2.0 | Hugging Face | Alternativa open source con licencia permisiva |
| Phi-3.5-mini | 3,8 B | 128k tokens | MIT | Hugging Face | Buen rendimiento en razonamiento para su tamano |

La comparativa es estructural: el checkpoint de openmuse no aporta benchmarks que permitan situarlo frente a estas alternativas en calidad. Frente al base Llama 3.2 3B, la unica diferencia medible es la perdida de validacion reportada, que no es comparable con metricas de tareas.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no describe el dataset `sample_r2006`, los usos previstos ni las limitaciones, lo que impide evaluar su idoneidad para cualquier tarea.
- Perdida de validacion estancada: la validacion no mejora entre el paso 50 (1,0448) y el 250 (1,0474), mientras la perdida de entrenamiento baja; indica posible sobreajuste o desajuste de distribucion.
- Sin benchmarks: no hay evidencia de que el ajuste preserve las capacidades del base (razonamiento, codigo, multilingue) ni de que las mejore en el dominio objetivo.
- Riesgo de alucinacion: inherente a los modelos de 3B y no mitigado mediante RLHF o DPO documentado.
- Sesgos: no evaluados; se heredan los del base Llama 3.2 y se anaden los del dataset de ajuste, desconocido.
- Licencia: la licencia "other" remite a los terminos de Meta Llama 3.2; el uso comercial esta sujeto a la politica de Meta y a la clausula de nombre de modelo, no a una licencia permisiva.
- Idiomas: no declarados; no se puede asumir soporte multilingue mas alla del base.
- Formato de chat: no documentado, lo que puede provocar respuestas de baja calidad si se usa una plantilla incorrecta en produccion.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion por parte de la comunidad.
- No apto para produccion: sin evaluacion, sin garantias y sin soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/sample_r2006_llama3.2-3B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Documentacion de Llama 3.2 de Meta: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
