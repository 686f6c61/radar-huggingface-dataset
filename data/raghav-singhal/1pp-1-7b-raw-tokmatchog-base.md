# Raghav-Singhal/1pp-1.7b-raw-tokmatchog-base

## Resumen

1pp-1.7b-raw-tokmatchog-base es un modelo de lenguaje experimental de 1.66B parámetros desarrollado por Raghav-Singhal como parte del proyecto **One Persona Pretraining (1PP)**, un artefacto de investigación vinculado al laboratorio EPFL DLAB. No es un asistente de propósito general, sino la rama de control "token-matched" de un estudio 3×3 que compara tres condiciones de preentrenamiento (documentos originales, conversaciones reescritas con pérdida solo en turnos del asistente, y con pérdida en usuario y asistente) sobre el mismo corpus de 47.8M documentos.

Su propósito específico es responder una pregunta científica: ¿la ventaja de la condición "assistant-turn-loss" se debe a la cantidad de tokens supervisados o a la estructura de la pérdida? Para ello, esta rama continúa desde el checkpoint 12.000 de `1pp-1.7b-raw-base` con un plan de entrenamiento más corto hasta el paso 16.202, alcanzando exactamente 33.745B de tokens supervisados (el mismo total que la condición asistente-only), aunque viendo solo el 51% de los documentos y el cómputo.

La arquitectura es un decodificador estilo Llama con 24 capas, hidden size 2.048, FFN SwiGLU de 8.192, GQA (16 cabezas de atención / 4 KV), RMSNorm, RoPE y longitud de secuencia de 4.096 tokens. Es relevante como referencia reproducible para investigadores que estudian cómo la máscara de pérdida en preentrenamiento afecta la calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3.3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador estilo Llama con 24 capas, dimensión oculta de 2.048 y FFN de 8.192 con activación SwiGLU. Usa atención agrupada (GQA) con 16 cabezas de consulta y 4 cabezas KV de dimensión 128, RMSNorm, RoPE con base 10.000, embeddings sin atar (untied), sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens con máscara de atención entre documentos y packing de tipo best-fit con asignación de documentos alineada por paso.

El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. El preentrenamiento usa los documentos originales de DCLM-edu (condición raw baseline), con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. El optimizador es Muon (con shape scaling y LR de matriz 0.005) junto con Adam para embeddings y normas: warmup de 2.000 pasos, fase constante, decaimiento lineal del último 10% hasta 1/100, weight decay 0.1 y precisión bf16, con batch global de 512 × 4.096 tokens.

Un detalle técnico notable: a partir del paso 12.000 los documentos originales se reconstruyeron tras perderse el corpus empaquetado; 4.197 de 4.202 pasos de la rama reproducen exactamente los conteos originales, y en 5 pasos falta un documento cada uno (9.638 tokens menos de 8,76B). La verificación contra el checkpoint de Megatron muestra diferencias de pérdida absolutas de solo 0,0018 y 0,0017, lo que confirma la fidelidad de los pesos publicados.

## Capacidades

- Generacion de texto en ingles como modelo base (completamiento de texto, no instrucciones afinadas).
- Formato ChatML sin turno de sistema, con plantilla de chat incluida que renderiza exactamente el formato esperado (`<|im_start|>user ... <|im_end|>`); generación con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Al ser un modelo base de la condición "documentos originales", produce texto plano, no conversaciones formateadas.
- Razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades agenticas: no disponible (no se documentan).
- Capacidades multilingues: no disponible; el entrenamiento se limito a documentos DCLM-edu en ingles.

## Casos de uso

- Investigacion en estrategias de preentrenamiento: sirve como punto de comparacion controlado para estudiar el efecto de la máscara de pérdida (asistente vs. documento completo) sobre la calidad del modelo, con batches idénticos entre condiciones.
- Estudios de data curation educativa: al entrenarse sobre DCLM-edu, permite analizar cómo el contenido de calidad educativa influye en las pérdidas de validación por tipo de texto (asistente, usuario, documento).
- Reproduccion de experimentos con Muon: el uso del optimizador Muon con shape scaling hace de este modelo un caso de referencia para validar implementaciones de Muon frente a Adam.
- Verificacion de pipelines de entrenamiento: las pérdidas de validación publicadas (2.5687 y 2.4533 en los sets de verificación) permiten comprobar que una reimplementación coincide con el checkpoint original.
- Analisis de scaling laws y eficiencia de tokens supervisados: al igualar tokens supervisados (33.745B) entre condiciones con distinto cómputo, facilita estudios de eficiencia de datos.
- Base para fine-tuning experimental: su formato ChatML y su tamano de 1.7B lo hacen adecuado para experimentos de SFT de bajo coste, aunque no es su propósito documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la perdida de validacion (per token, 2.433 documentos held-out, checkpoint final):

| Conjunto | Perdida |
|---|---|
| Texto de asistente | 2.570 |
| Texto de usuario | 2.619 |
| Texto de documento | 2.452 |

Verificacion de pesos frente al checkpoint de Megatron:

| Set | Perdida HF | Referencia Megatron | Dif. absoluta |
|---|---|---|---|
| val50m segments [3] | 2.5687 | 2.5705 | 0.0018 |
| raw_val50m segments [8] | 2.4533 | 2.4516 | 0.0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,3 GB solo de pesos, mas overhead de activaciones y KV cache; una GPU con 8 GB de VRAM es suficiente para inferencia con contexto completo de 4.096 tokens.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060 Ti, RTX 4090) o GPU de nube de gama baja; no se requiere hardware de centro de datos (A100/H100) para inferencia.
- Cabe con holgura en GPUs de consumo; incluso portatiles con GPU dedicada de 6-8 GB pueden ejecutarlo.
- Opciones de despliegue: la libreria `transformers` de Hugging Face es la documentada (`endpoints_compatible`, compatible con Inference Endpoints); por su arquitectura estilo Llama y formato safetensors, es razonable esperar compatibilidad con llama.cpp, Ollama y vLLM, aunque no se documenta explicitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicion / proposito | Licencia |
|---|---|---|---|---|
| 1pp-1.7b-raw-tokmatchog-base | 1.66B | 4.096 | Documentos originales, tokens supervisados igualados (rama de control) | Apache 2.0 |
| 1pp-1.7b-raw-base | 1.66B | 4.096 | Documentos originales, run de produccion completa (31.777 pasos) | Apache 2.0 |
| 1pp-1.7b (condiciones de conversacion) | 1.66B | 4.096 | Conversaciones reescritas con perdida en asistente o en user+asistente | no disponible |
| SmolLM2-1.7B | 1.71B | 8.192 | Modelo general de Hugging Face con el mismo vocabulario base | Apache 2.0 |

La comparacion mas relevante es interna al estudio 1PP: frente a `1pp-1.7b-raw-base` (su origen en el paso 12.000) y frente a las ramas de conversacion, esta rama permite aislar el efecto del numero de tokens supervisados. Frente a SmolLM2-1.7B, comparte vocabulario y tamano similar, pero este modelo es un artefacto de investigacion sin post-entrenamiento, no un asistente general.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de proposito general; el propio autor lo advierte en la model card.
- Modelo base sin afinacion por instrucciones: no sigue instrucciones de forma fiable ni produce conversaciones formateadas (la condicion raw genera texto plano).
- Entrenado exclusivamente en ingles (corpus DCLM-edu); el rendimiento en otros idiomas no esta evaluado y probablemente sea pobre.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- Sesgos: hereda los sesgos del corpus DCLM-edu; no se ha realizado ningun analisis de sesgos documentado.
- Riesgo de alucinacion: alto, al tratarse de un modelo base sin RLHF/DPO ni medidas de alineacion.
- Caveat tecnico: en 5 de los 4.202 pasos de la rama reconstruida falta un documento cada uno (9.638 tokens menos en total), con 5 documentos aceptados por coincidencia de prefijo largo cuya diferencia restante no tiene causa conocida; esto introduce una minima desviacion respecto a la reproducibilidad exacta del experimento.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- No hay cuantizaciones publicadas ni benchmarks estandarizados, por lo que su calidad relativa frente a modelos generales no puede evaluarse directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-tokmatchog-base
- Modelo de origen (rama principal): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
