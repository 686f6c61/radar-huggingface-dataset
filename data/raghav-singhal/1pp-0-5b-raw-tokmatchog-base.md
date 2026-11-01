# Raghav-Singhal/1pp-0.5b-raw-tokmatchog-base

## Resumen

1pp-0.5b-raw-tokmatchog-base es un modelo experimental de preentrenamiento desarrollado por Raghav-Singhal dentro del proyecto One Persona Pretraining (1PP), un artefacto de investigación vinculado al laboratorio EPFL DLAB. No se trata de un asistente de propósito general, sino de una rama de control de un estudio científico que compara tres condiciones de preentrenamiento sobre el mismo corpus: documentos originales, conversaciones reescritas con pérdida solo en los turnos del asistente, y conversaciones con pérdida en turnos de usuario y asistente.

Este modelo concreto pertenece a la rama "token-matched" de la condición de documentos originales (raw). Su propósito es responder una pregunta metodológica concreta: si la ventaja observada en la condición de usuario+asistente se debe simplemente a contar con más tokens supervisados. Para ello, la rama continuó desde el checkpoint del paso 12.000 de la ejecución base y se entrenó hasta alcanzar los mismos 33,745 B de tokens supervisados que la condición completa, aunque viendo solo el 51% de los documentos y del cómputo.

La arquitectura es un decodificador estilo Llama de 24 capas con 0,58 B de parámetros (580.445.568 según los safetensors), secuencia de 4.096 tokens y vocabulario de SmolLM2 ampliado con un token de padding. Es relevante para investigadores interesados en estudios controlados de composición de datos de preentrenamiento, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (24 capas, RMSNorm, RoPE base 10.000, SwiGLU) |
| Parametros totales | 580.445.568 (0,58 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,2 GB de tamano de repo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador estilo Llama con 24 capas, dimension oculta de 1.152, FFN de 4.608 con activacion SwiGLU, 9 cabezas de atencion y 3 cabezas KV (GQA, dimension de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings sin atar (untied), sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) ampliado con `<|pad|>`; `<|endoftext|>` actua como fin de documento.

El entrenamiento forma parte de un estudio 3x3: tres tamano (0,5B, 1B, 1,7B) por tres condiciones de preentrenamiento sobre los mismos 47,8M documentos fuente en el mismo orden, con secuencia de batches identica entre condiciones. Este modelo corresponde a la condicion raw (documentos originales DCLM-edu, con perdida sobre todos los tokens del documento). La rama continuo desde el paso 12.000 de la ejecucion base con la misma semilla, estado del optimizador y orden de batches, bajo un calendario mas corto con decay lineal del 10% final, terminando en el paso 16.202 con 33,745 B de tokens supervisados (de un total de 66,2 B de tokens de documentos originales en el paso completo). El optimizador fue Muon con shape scaling (LR 0,005 para matrices) y Adam para embeddings y normas, warmup de 2.000 pasos, weight decay 0,1 y precision bf16, con global batch de 512 x 4.096 tokens y packing best-fit con enmascaramiento de atencion entre documentos.

Un detalle tecnico notable: los documentos a partir del paso 12.000 fueron reconstruidos tras perderse el corpus empaquetado original; 4.197 de 4.202 pasos de la rama reproducen exactamente los conteos originales, y 5 pasos presentan una discrepancia menor (9.638 tokens menos de 8,76B) documentada por el autor. Los pesos de HuggingFace fueron verificados contra el checkpoint de Megatron recomputando perdidas de validacion, con diferencias absolutas de 0,0017.

## Capacidades

- Generacion de texto en ingles sobre texto plano (es un modelo base de la condicion raw, no produce texto con formato de chat por defecto).
- Comprension y continuacion de documentos tipo DCLM-edu (contenido educativo y web filtrado por calidad).
- Formato de chat ChatML sin turno de sistema disponible via `chat_template` incluida (`<|im_start|>user ... <|im_end|>`), aunque el modelo nunca vio turnos de sistema durante el entrenamiento.
- Generacion se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos configurados como `eos_token_id`.
- No hay evidencia publicada de capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; al ser un artefacto de investigacion, estas capacidades no son el objetivo del modelo.

## Casos de uso

- Investigacion en composicion de datos de preentrenamiento: sirve como linea base token-matched para aislar el efecto del numero de tokens supervisados frente a la mascara de perdida en conversaciones.
- Estudios de ablation controlados: al compartir secuencia de batches, semilla y orden de documentos con las demas ramas del estudio 1PP, permite comparaciones de perdida de validacion con variables confundentes minimizadas.
- Analisis de scaling laws y eficiencia de datos: util para estudiar como el mismo presupuesto de tokens supervisados se traduce en perdida cuando se ve menos del 51% de los documentos y del computo.
- Reproduccion de pipelines de entrenamiento con Muon: los logs de wandb publicados permiten auditar hiperparametros y curvas de entrenamiento de un run real con este optimizador.
- Evaluacion de tokenizadores y packing: el corpus usa packing best-fit con asignacion de documentos alineada a pasos y enmascaramiento entre documentos, util como referencia para implementar esquemas similares.
- Punto de partida para fine-tuning experimental en ingles: al ser un modelo base con licencia Apache 2.0, puede ajustarse para experimentos academicos de bajo computo, aunque no compite con modelos base comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la perdida de validacion final (por token, sobre 2.433 documentos held-out):

| Conjunto | Perdida |
|---|---|
| Texto de asistente | 2,754 |
| Texto de usuario | 2,765 |
| Texto de documento | 2,582 |

Ademas, la verificacion de pesos frente al checkpoint de Megatron arrojo diferencias absolutas de 0,0017 en dos conjuntos de validacion (val50m: 2,7519 frente a 2,7536; raw_val50m: 2,5842 frente a 2,5825).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 (tamano del repo); menos de 2 GB de VRAM son suficientes con margen para KV cache a 4.096 tokens de contexto.
- Cabe comodamente en cualquier GPU de consumo: desde una RTX 3060 de 12 GB o incluso GPUs integradas con suficientes recursos; no se requiere A100 ni H100 para inferencia.
- Para reentrenamiento o continuacion del preentrenamiento, el run original uso global batch de 512 x 4.096 tokens en bf16, lo que implica infraestructura multi-GPU de clase datacenter (configuracion exacta de GPUs no disponible).
- Opciones de despliegue: transformers (libreria nativa, `endpoints_compatible`), compatible con text-generation-inference; compatibilidad con llama.cpp, Ollama o vLLM no confirmada en la model card, aunque la arquitectura Llama-style facilita la conversion a GGUF.
- Latencia y throughput: no disponible; dado el tamano de 0,58B, cabe esperar inferencia rapida en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| 1pp-0.5b-raw-tokmatchog-base | 0,58 B | 4.096 | Apache 2.0 | Artefacto de investigacion (estudio 1PP, condicion raw token-matched) |
| SmolLM2-360M / SmolLM2-1.7B (HuggingFace) | 0,36 B / 1,7 B | 8.192 | Apache 2.0 | Modelos base de proposito general; comparten vocabulario (49.152) con este modelo |
| Qwen2.5-0.5B | 0,49 B | 32.768 | Qwen Research / licencia propia | Modelo base generalista multilingue con contexto mucho mayor |

Las comparaciones de rendimiento numerico no estan disponibles: las ramas hermanas del estudio (1pp-0.5b-raw-base y las condiciones de conversacion en la coleccion 1PP) son los comparables directos, disenados para comparacion de perdida de validacion bajo condiciones controladas.

## Limitaciones y advertencias

- No es un asistente de proposito general: la propia model card lo advierte explicitamente; es un artefacto de investigacion del proyecto 1PP (EPFL DLAB).
- Modelo base sin fine-tuning por instrucciones ni RLHF/DPO documentado: seguira instrucciones de forma poco fiable y puede generar texto sin coherencia conversacional.
- Entrenado solo en ingles: rendimiento no garantizado en otros idiomas, incluido el castellano.
- Contexto limitado a 4.096 tokens, corto para estandares actuales.
- No vio turnos de sistema durante el entrenamiento: el uso de la plantilla ChatML con system prompts puede degradar el comportamiento.
- Anomalia documentada en los datos: 5 de 4.202 pasos de la rama contienen 5 documentos reconstruidos con una discrepancia de prefijo exacto sin causa conocida (9.638 tokens menos en total), lo que introduce una minima incertidumbre en la reproducibilidad del experimento.
- Sesgos: heredados del corpus DCLM-edu (web filtrada educativa); no se ha realizado analisis de sesgos publicado.
- Riesgo de alucinacion: alto, como es habitual en modelos base pequenos sin alineacion; no debe usarse para generar informacion factual sin verificacion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el caracter experimental y la falta de benchmarks lo hacen inadecuado para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.5b-raw-tokmatchog-base
- Rama base original: https://huggingface.co/Raghav-Singhal/1pp-0.5b-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
