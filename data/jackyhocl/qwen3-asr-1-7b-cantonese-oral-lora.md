# JackyHoCL/Qwen3-ASR-1.7B-cantonese-oral-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) sobre el modelo Qwen/Qwen3-ASR-1.7B, un modelo de lenguaje audio-texto del equipo Qwen (Alibaba). Lo publica el usuario JackyHoCL y su función es especializar el modelo base en reconocimiento automático del habla (ASR) de cantonés (yue-HK) en su forma hablada, es decir, el texto tal y como se pronuncia, con giros coloquiales y grafías informales, en lugar del registro escrito oficial.

El adaptador se entrenó sobre aproximadamente 275 horas de transcripciones de retransmisiones del Consejo Legislativo de Hong Kong (LegCo), usando como objetivo el campo `sentence` (transcripción "as-spoken"). El modelo base Qwen3-ASR-1.7B tiene 2,06 mil millones de parámetros; el adaptador añade 17,4 millones de parámetros entrenables (el 0,85 % del total, unos 70 MB) mediante LoRA de rango 16 sobre las proyecciones de auto-atención y MLP del bloque LLM, dejando congelada la torre de audio.

Es relevante porque demuestra que un ajuste fino ligero sobre un modelo base abierto puede reducir la tasa de error de palabra (WER) de 0,098 en zero-shot a 0,087 en un dominio específico y de bajos recursos como el cantonés hablado, y porque forma parte de un ecosistema de adaptadores que cubren distintas variantes del mismo corpus (oral y escrita) y distintos tamaños de base (1.7B y 0.6B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-ASR-1.7B (LLM multimodal audio-texto: torre de audio congelada + bloque LLM "thinker") |
| Parametros totales | 2,06 mil millones en el modelo base; 17,4 millones entrenables en el adaptador (0,85 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la receta de despliegue con vLLM del autor usa `--max-model-len 4096` |
| Tipos de cuantizacion | no disponible (el adaptador se entrena y se documenta en bf16) |
| Idiomas soportados | yue (cantonés, yue-HK) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-ASR-1.7B, un LLM audio-texto con dos componentes: una torre de audio que procesa la señal de entrada y un bloque LLM ("thinker") que genera la salida. Este adaptador no modifica la torre de audio: congela ese componente y aplica LoRA únicamente al LLM, concretamente a las proyecciones `thinker.model.layers.*.self_attn.{q,k,v,o}_proj` y `thinker.model.layers.*.mlp.{gate,up,down}_proj`, con rango 16, alpha 32 y dropout 0,05. El contrato de salida entrenado es el oficial de Qwen3-ASR: el prefijo `language Cantonese<asr_text>` seguido de la transcripción.

El entrenamiento usó unas 275 horas de audio procedentes del snapshot ampliado `JackyHoCL/legco-yue-asr-preview` (70.457 enunciados, 281,8 h, 69 sesiones, WAV mono a 16 kHz, fragmentado en tramos de ≤20 s). Tras eliminar las filas con cualquier marca de control de calidad (QC) y con `match_confidence < 0,5`, quedaron 67.386 filas repartidas en 55.469 de entrenamiento, 5.970 de desarrollo y 5.947 de test. La etiqueta objetivo es el campo `sentence` (cantonés tal y como se habla). Se realizaron 3 épocas y 10.401 pasos con learning rate 5e-5, scheduler coseno con warmup del 5 %, precisión bf16, batch 4 × acumulación de gradiente 4 (global 16), gradient checkpointing y semilla 42; el entrenamiento completo consumió unas 9 horas en una sola RTX 3080 de 20 GB. No se documenta ninguna fase de RLHF ni DPO: es ajuste supervisado.

## Capacidades

- Reconocimiento automático del habla (ASR) de cantonés hablado (yue-HK), orientado al registro oral e informal.
- Transcripción de audio con el contrato de salida nativo de Qwen3-ASR: el resultado empieza por el prefijo `language Cantonese<asr_text>` seguido del texto transcrito.
- Hereda del modelo base la naturaleza audio-texto, pero el ajuste se limita a la tarea ASR; el autor no documenta otras capacidades (tool calling, agentes, razonamiento multi-paso, visión, audio generativo, etc.) para este adaptador.
- Compatibilidad con vLLM mediante el sistema de módulos LoRA (`--enable-lora --max-lora-rank 32`), lo que permite servir el modelo base y varios adaptadores a la vez.
- Compatibilidad con la pila de Transformers a través de `peft`, con las versiones `qwen-asr==0.0.6` y `transformers==4.57.6`.
- Idiomas: exclusivamente cantonés (yue); no se documenta soporte multilingüe del adaptador.

## Casos de uso

- Transcripción de sesiones parlamentarias y actas en cantonés: el adaptador se entrenó precisamente con retransmisiones del Consejo Legislativo de Hong Kong y etiquetas "as-spoken", por lo que es directamente aplicable a la transcripción de debates y comparecencias en ese registro.
- Subtitulado de vídeo y audio en cantonés coloquial: permite generar subtítulos que reflejan lo que realmente se dice, con giros informales, en lugar de normalizar al registro escrito oficial.
- Análisis de contenido de medios en cantonés: transcripción de podcasts, entrevistas, tertulias y retransmisiones en directo para su posterior indexación, búsqueda o análisis de sentimiento.
- Preservación y documentación lingüística: generación de corpus de cantonés oral a partir de grabaciones, útil para estudios de lingüística descriptiva y para el desarrollo de recursos en variedades de bajos recursos.
- Despliegue multiforme con vLLM: al ser un adaptador LoRA, se puede servir junto al modelo base y a los adaptadores hermanos (oral y escrito) en un único servidor, seleccionando la variante por el campo `model` de la petición.
- Base para ajustes posteriores: al añadir solo 17,4 millones de parámetros entrenables, sirve como punto de partida de bajo coste para especializar aún más el ASR de cantonés en otros dominios (medios, sanidad, atención al cliente).
- Investigación en ASR de bajos recursos: el escenario de adaptar con LoRA un modelo base grande a un dominio concreto (~275 h de audio) es reproducible en una sola GPU de consumo de 20 GB, lo que facilita la experimentación académica.

## Benchmarks y rendimiento

Resultados de WER/CER sobre particiones completas reservadas (puntuación y espacios eliminados, tokens por carácter), aportados por el autor:

| Checkpoint | WER test (5.947) | CER test | WER dev (5.970) | CER dev |
|---|---|---|---|---|
| epoch 1 (ckpt-3467) | 0,088 | 0,088 | 0,083 | 0,083 |
| epoch 2 (ckpt-6934) | 0,088 | 0,088 | 0,081 | 0,081 |
| epoch 3 (ckpt-10401), publicado | 0,087 | 0,087 | 0,082 | 0,082 |
| Base zero-shot | 0,098 | 0,098 | no disponible | no disponible |

La época 3 se seleccionó por el mejor WER en el conjunto de test. Respecto al modelo base en zero-shot sobre el mismo test, la mejora es del 11 % relativo en WER. El autor señala que el error absoluto es muy inferior al de la tarea de forma escrita (0,174 para el adaptador escrito sobre su propio conjunto de test), porque las etiquetas "as-spoken" se ajustan más directamente al audio, sin normalización al texto del registro oficial.

## Requisitos de hardware

- Adaptador: unos 70 MB en disco (el repositorio completo ocupa 0,1 GB).
- Modelo base en bf16: aproximadamente 4,1 GB de pesos (2,06 mil millones de parámetros), más la torre de audio y el overhead de activaciones.
- Entrenamiento documentado: una sola RTX 3080 de 20 GB, con gradient checkpointing, batch 4 y acumulación 4, durante unas 9 horas para 3 épocas y 10.401 pasos.
- Inferencia en GPU de consumo: cabe con holgura en tarjetas de 24 GB (RTX 3090, RTX 4090) y previsiblemente también en tarjetas de 8-12 GB en bf16 o cuantizado, aunque el autor no da cifras exactas de VRAM para inferencia.
- GPU profesionales: A100, H100 y similares son compatibles pero sobredimensionadas para un modelo de 1,7B; vLLM admite tensores en paralelo si se desea servir a gran escala.
- Opciones de despliegue: vLLM (vía `pip install "qwen-asr[vllm]"`, con `--enable-lora --max-lora-rank 32 --max-model-len 4096 --gpu-memory-utilization 0.8`) y Transformers con `peft` (requiere `qwen-asr==0.0.6` y `transformers==4.57.6`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Tarea / dominio | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (JackyHoCL/Qwen3-ASR-1.7B-cantonese-oral-lora) | 2,06 B (LoRA) | Cantonés oral "as-spoken" (LegCo) | 0,087 (test) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-ASR-1.7B (zero-shot) | 2,06 B | ASR general audio-texto | 0,098 (test) | Apache 2.0 | HuggingFace |
| JackyHoCL/qwen3-asr-yue-cantonese-lora | 2,06 B (LoRA) | Cantonés escrito (registro oficial) | 0,174 (test propio) | no disponible | HuggingFace |
| JackyHoCL/Qwen3-ASR-0.6B-cantonese-written-lora | 0,6 B (LoRA) | Cantonés escrito | no disponible | no disponible | HuggingFace |

No se dispone de datos comparativos con otros sistemas ASR de cantonés externos a este ecosistema.

## Limitaciones y advertencias

- Cubre únicamente cantonés (yue-HK); no se documenta soporte para otros idiomas ni para code-switching con mandarín o inglés.
- Sesgo de dominio: el entrenamiento se realizó exclusivamente con retransmisiones del Consejo Legislativo de Hong Kong, por lo que el rendimiento puede degradarse en registros muy distintos (conversación espontánea, jerga juvenil, audio telefónico, ruido de fondo elevado).
- Las etiquetas de entrenamiento proceden de un pipeline con control de calidad y un umbral de `match_confidence ≥ 0,5`; puede quedar ruido residual en las transcripciones que limite el techo de precisión.
- Riesgo de alucinación y de omisión de palabras: como todo modelo generativo audio-texto, puede producir texto plausible que no corresponde al audio, especialmente con solapamiento de voces o segmentos ambiguos.
- Dependencia estricta de versiones: la ruta de Transformers exige `qwen-asr==0.0.6` y `transformers==4.57.6`, porque las clases nativas `qwen3_asr` de `transformers>=5` no coinciden con el diseño de este checkpoint. Además es necesario aplicar un parche para redirigir `forward` a `thinker.forward`.
- La salida incluye el prefijo `language Cantonese<asr_text>`, que hay que eliminar (con `qwen_asr.parse_asr_output` o una expresión regular) antes de usar la transcripción.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial queda sujeto también a la licencia del modelo base Qwen3-ASR-1.7B y del corpus de origen.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento del análisis, sin revisión independiente de los resultados publicados.
- Los metadatos indican fechas de creación y actualización de octubre de 2026; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JackyHoCL/Qwen3-ASR-1.7B-cantonese-oral-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Adaptador hermano (1.7B, forma escrita): https://huggingface.co/JackyHoCL/qwen3-asr-yue-cantonese-lora
- Adaptador hermano (0.6B, forma escrita): https://huggingface.co/JackyHoCL/Qwen3-ASR-0.6B-cantonese-written-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/JackyHoCL/legco-yue-asr-preview
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
