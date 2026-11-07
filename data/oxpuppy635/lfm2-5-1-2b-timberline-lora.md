# oxpuppy635/lfm2.5-1.2b-Timberline-lora

## Resumen

`lfm2.5-1.2b-Timberline-lora` es un adaptador LoRA de bajo rango entrenado sobre el modelo base `MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy`, un derivado comunitario del modelo de razonamiento compacto LFM2.5-1.2B-Thinking de Liquid AI. El adaptador lo publica el usuario `oxpuppy635` y esta orientado a generacion de texto conversacional con trazas de razonamiento (`<think>...</think>`), presumiblemente para ajustar el estilo o el tono de las respuestas del modelo base (la etiqueta "Timberline" sugiere una personalizacion tematica).

El repositorio no contiene un modelo completo, sino pesos PEFT en safetensors (11.108.352 parametros entrenables) y una version empaquetada como adaptador GGUF para su aplicacion dinamica en `llama.cpp`. El modelo base subyacente es un transformer hibrido de 1.200 millones de parametros con atencion de convolucion corta (ShortConv) combinada con Grouped-Query Attention y SwiGLU, disenado por Liquid AI para inferencia en dispositivo con menos de 1 GB de memoria.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo tipico de adaptacion ligera sobre un modelo edge de razonamiento; por otro, advierte de que se trata de un artefacto experimental sin benchmarks publicados, sin licencia declarada y sin datos de idioma, lo que limita seriamente su uso en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre base Lfm2ForCausalLM hibrido ShortConv + Grouped-Query Attention + SwiGLU |
| Parametros totales | 11.108.352 parametros del adaptador (modelo base de 1.2B no incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3328 tokens (longitud maxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | Adaptador nativo en bfloat16; GGUF LoRA para aplicar sobre GGUF del base (p. ej. Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA) |
| Rank / alpha LoRA | r=16, lora_alpha=32 |
| Modulos objetivo | q_proj, k_proj, v_proj, out_proj, in_proj, w1, w2, w3 |
| Modelo base | MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy |
| Libreria | peft (compatible con transformers y llama.cpp) |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado sobre las proyecciones de atencion (q, k, v, out), la proyeccion de entrada del bloque convolucional (`in_proj`) y las tres matrices del MLP SwiGLU (`w1`, `w2`, `w3`). El modelo base es la arquitectura Lfm2ForCausalLM de Liquid AI: un transformer hibrido que intercala capas de convolucion corta (ShortConv) con capas de atencion de consultas agrupadas, lo que reduce el coste de atencion cuadratico en contextos largos y permite inferencia en dispositivo por debajo de 1 GB en cuantizacion agresiva.

El entrenamiento se realizo en bfloat16 nativo sobre 2000 conversaciones, todas ellas con trazas de razonamiento (`<think>...</think>` seguido de la respuesta), durante 3 epocas con una longitud maxima de 3328 tokens. La perdida final de entrenamiento fue de 2.4690. No se documenta composicion del dataset, procedencia de las conversaciones, uso de RLHF/DPO ni tecnicas de alineacion adicionales. El modelo base `LFM2.5-1.2B-Thinking-absolute-heresy` es a su vez un ajuste comunitario del LFM2.5-1.2B-Thinking oficial de Liquid AI, por lo que el adaptador hereda dos capas de personalizacion no auditadas.

## Capacidades

- Generacion de texto conversacional multi-turno, con salida estructurada de razonamiento en etiquetas `<think>`.
- Razonamiento paso a paso (thinking mode) heredado del modelo base LFM2.5-1.2B-Thinking.
- Aplicacion dinamica del adaptador en tiempo de ejecucion sobre cualquier cuantizacion GGUF del modelo base mediante `llama.cpp --lora`.
- Carga como adaptador PEFT estandar en `transformers` con `PeftModel.from_pretrained`.
- Capacidades multilingues: no disponibles (no declaradas en la model card).
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; el formato `<think>` sugiere razonamiento encadenado, pero no hay evaluacion publicada.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- **Ajuste de estilo narrativo en generacion de ficcion**: el adaptador se aplica sobre el base en `llama.cpp` con `--lora` para producir relatos con un tono concreto ("Timberline"), sin reentrenar el modelo completo; util para experimentacion creativa con coste de almacenamiento de 0,1 GB.
- **Prototipado rapido de asistentes conversacionales con trazas de razonamiento**: cargar el base en bfloat16 con `transformers` y el adaptador PEFT permite inspeccionar la cadena `<think>` antes de la respuesta, lo que facilita depuracion de prompts en entornos de desarrollo.
- **Investigacion sobre adaptadores LoRA de bajo rango**: el par r=16/alpha=32 sobre ocho modulos objetivo sirve como caso de estudio reproducible para medir el efecto de LoRA en modelos hibridos ShortConv+GQA.
- **Despliegue en dispositivo con memoria muy limitada**: combinando el base en cuantizacion Q4_K_M (por debajo de 1 GB segun Liquid AI) con el adaptador GGUF, se puede ejecutar en movil o mini-PC sin GPU dedicada, siempre que se acepte la perdida de calidad no medida.
- **Generacion de respuestas con razonamiento explicito en herramientas internas**: para pipelines donde se requiere auditar el proceso de pensamiento del modelo (por ejemplo, clasificacion de tickets con justificacion), el formato `<think>` permite registrar la traza junto a la salida final.
- **Banco de pruebas para evaluacion de adaptadores comunitarios**: dado que no hay benchmarks publicados, este repositorio es adecuado como sujeto de pruebas en estudios comparativos de LoRA sobre modelos edge, no como componente de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento (2.4690) sobre 2000 conversaciones, metrica que no es comparable con MMLU, HumanEval, GSM8K ni con evaluaciones del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~0,1 GB; el modelo base de 1.2B en bfloat16 requiere aproximadamente 2,4 GB de VRAM, y en Q4_K_M alrededor de 0,7-0,9 GB (Liquid AI declara que LFM2.5-1.2B-Thinking cabe en menos de 900 MB en movil).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); A100/H100 no son necesarias para este tamano salvo para entrenamiento o evaluacion a gran escala.
- Cabe en GPU consumer: si, en RTX 3050 8 GB, RTX 3060, RTX 4060 y superiores; en cuantizacion Q4_K_M puede ejecutarse incluso en CPU o en iGPU.
- Opciones de despliegue: `llama.cpp` (con `--lora` sobre GGUF del base), `transformers` + `peft`, Ollama (si se empaqueta el base con el adaptador fusionado), vLLM y TGI solo tras fusionar el adaptador en el base y exportar safetensors.
- Latencia y throughput estimados: no disponibles; Liquid AI declara inferencia "muy rapida" para el base en dispositivo, pero no hay cifras publicadas para esta combinacion base+adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lfm2.5-1.2b-Timberline-lora (este) | Adaptador 11,1 M sobre base 1.2B | 3328 | safetensors + GGUF LoRA | no disponible | Sin benchmarks, sin idiomas declarados |
| LFM2.5-1.2B-Thinking (Liquid AI) | 1.2B | no disponible en la informacion | safetensors, GGUF | no disponible | Modelo oficial de razonamiento on-device, <900 MB en movil |
| LFM2.5-1.2B-Instruct (Liquid AI) | 1.2B | no disponible en la informacion | safetensors, GGUF | no disponible | Variante instruct de la familia LFM2.5 |
| MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy | 1.2B | no disponible | safetensors | no disponible | Ajuste comunitario que sirve de base a este LoRA |

## Limitaciones y advertencias

- Sin licencia declarada: no se puede determinar si el uso comercial esta permitido; contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: el unico dato de calidad es la perdida de entrenamiento (2.4690), insuficiente para estimar rendimiento real.
- Sin idiomas declarados: no hay garantia de calidad en castellano ni en otros idiomas; el base LFM2.5 es predominantemente ingles segun la informacion de Liquid AI, con variantes japonesas separadas.
- Doble capa de personalizacion no auditada: el base `absolute-heresy` es un ajuste comunitario del modelo oficial, por lo que sesgos y comportamientos anadidos por ese ajuste se heredan y se amplifican con este LoRA.
- Riesgo de alucinacion: inherente a modelos de 1.2B con thinking mode; las trazas `<think>` pueden contener razonamiento plausible pero incorrecto.
- Contexto limitado a 3328 tokens: insuficiente para documentos largos o conversaciones extensas; el adaptador fue entrenado con esa longitud y no se documenta extension.
- Perdida final relativamente alta (2.4690) sobre solo 2000 conversaciones: riesgo de sobreajuste al estilo del dataset y de degradacion en tareas fuera de distribucion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; tratar como artefacto experimental.
- El adaptador GGUF debe aplicarse sobre una cuantizacion concreta del base; mezclar cuantizaciones no documentadas puede producir degradacion silenciosa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxpuppy635/lfm2.5-1.2b-Timberline-lora
- Modelo base: https://huggingface.co/MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy
- Anuncio de Liquid AI sobre LFM2.5: https://www.marktechpost.com/2026/01/06/liquid-ai-releases-lfm2-5-a-compact-ai-model-family-for-real-on-device-agents/
- Blog de Liquid AI sobre LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
