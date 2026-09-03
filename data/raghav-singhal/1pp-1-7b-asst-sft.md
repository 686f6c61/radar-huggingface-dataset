# Raghav-Singhal/1pp-1.7b-asst-sft

## Resumen

El modelo 1pp-1.7b-asst-sft es un experimento de investigación del proyecto One Persona Pretraining (1PP) del DLAB de la EPFL, desarrollado por Raghav Singhal. Forma parte de un estudio 3 × 3 que combina tres tamaños de modelo (0.5B, 1B y 1.7B) con tres condiciones de preentrenamiento sobre el mismo corpus de 47.8 millones de documentos. Este modelo concreto corresponde a la condición de conversaciones reescritas con pérdida únicamente en los turnos del asistente, seguida de un ajuste fino supervisado (SFT).

El modelo tiene 1.66 mil millones de parámetros, una arquitectura decoder estilo Llama con 24 capas y una ventana de contexto de 4.096 tokens. Su relevancia radica en que investiga cómo la transformación de documentos en conversaciones durante el preentrenamiento afecta a las capacidades del modelo final, comparando la pérdida selectiva en turnos del asistente frente a otras condiciones. Es un artefacto de investigación, no un asistente de propósito general, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama, 24 capas, hidden 2.048, FFN 8.192 (SwiGLU), 16 heads de atencion / 4 KV heads (head dim 128), RMSNorm, RoPE base 10.000, embeddings no compartidos, sin sesgos, sin QK-norm |
| Parametros totales | 1.661.048.832 (1.66B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer estilo Llama con 24 capas, dimensiones ocultas de 2.048 y FFN de 8.192 con activacion SwiGLU. Usa atencion con 16 cabezas y 4 cabezas KV (GQA), RMSNorm, RoPE con base 10.000, embeddings no compartidos y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) mas el token especial `<|pad|>`; `<|endoftext|>` marca el final de documento.

El preentrenamiento se realizo sobre 47.8M documentos reescritos como conversaciones (63.0B tokens en formato conversacional, frente a 66.2B tokens de los documentos originales), con una sola epoca, 31.777 pasos con batch global de 512 × 4.096 tokens, enmascaramiento de atencion entre documentos y best-fit packing. La perdida se calculo solo sobre los turnos del asistente, ignorando los turnos de usuario y el token `<|endoftext|>`. El optimizador fue Muon (LR 0.005 para matrices) con Adam para embeddings y normas, warmup de 2.000 pasos, decaimiento lineal del ultimo 10% hasta 1/100 y weight decay 0.1 en bf16.

El SFT se realizo durante una epoca sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98.5k multi-turno con citas constitucionales), `dlab-spp/sp-sft-normal-300k` (271.6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack (Megatron, Muon, ChatML sin turno de sistema) con LR 0.002 para matrices, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generacion de texto conversacional en ingles siguiendo el formato ChatML sin turno de sistema.
- Mantenimiento de conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- Capacidad de citar fuentes constitucionales en las respuestas, heredada del dataset de SFT multi-turno.
- Comportamiento de asistente entrenado especificamente para optimizar la perdida en turnos del asistente durante el preentrenamiento.
- No soporta tool calling, ni vision, ni audio, ni modo de razonamiento explicito.

## Casos de uso

- Investigacion academica sobre preentrenamiento alternativo: el modelo sirve para estudiar como la reescritura de documentos en conversaciones y la perdida selectiva en turnos del asistente afectan a la calidad del modelo final, comparandolo con las otras condiciones del estudio 1PP.
- Evaluacion de tecnicas de SFT sobre modelos preentrenados con condiciones experimentales: permite aislar el efecto del SFT sobre una base preentrenada con una condicion especifica de loss masking.
- Analisis de la perdida de validacion por tipo de texto: los valores de perdida publicados (1.451 en texto de asistente, 6.730 en texto de usuario, 3.178 en texto de documento) permiten estudiar como el modelo generaliza a distintos tipos de contenido.
- Reproduccion de experimentos de investigacion: al publicarse los pesos en safetensors y los logs de entrenamiento en wandb, otros investigadores pueden reproducir o extender el estudio.
- Desarrollo de asistentes conversacionales en ingles con requisitos de transparencia: al ser Apache 2.0, puede integrarse en sistemas que requieran licencias permisivas, aunque no esta optimizado para produccion.
- Fine-tuning adicional sobre dominios especificos: su tamano de 1.7B permite ajustarlo con recursos modestos para tareas conversacionales concretas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son las perdidas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion en texto de asistente | 1.451 |
| Perdida de validacion en texto de usuario | 6.730 |
| Perdida de validacion en texto de documento | 3.178 |
| Perdida SFT en conversaciones held-out (tokens de asistente) | 1.870 |
| Perdida HF vs Megatron (sft_val segments [3, 4]) | 1.8695 / 1.8695 (diff 0.0000) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.66B parametros en bf16, el modelo ocupa aproximadamente 3.3 GB en memoria. Con cuantizacion a 8 bits cabria en unos 1.7 GB y a 4 bits en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060) puede ejecutar el modelo en bf16. Una RTX 4090 o similar permitiria inferencia con batch grande.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 4 GB o mas.
- Opciones de despliegue: al ser un modelo transformers con pesos en safetensors, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante importacion) y HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. Dado su tamano, se espera una latencia baja en GPU consumer, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la informacion proporcionada. El modelo pertenece a una familia experimental (1PP) con variantes de 0.5B, 1B y 1.7B, pero no hay datos de benchmarks que permitan compararlo con alternativas comerciales o de codigo abierto como Llama 3.2 1B, Qwen 2.5 1.5B o SmolLM2 1.7B.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de proposito general: el propio autor advierte que no esta pensado para uso en produccion.
- Solo soporta ingles; no hay capacidades multilingues.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas que requieran contexto largo.
- No soporta tool calling, ni integracion con APIs externas, ni razonamiento multi-paso explicito.
- El formato ChatML sin turno de sistema puede provocar comportamientos inesperados si se usa con plantillas que incluyan dicho turno.
- Riesgo de alucinacion: no se han publicado evaluaciones de facticidad; al ser un modelo pequeno entrenado sobre conversaciones reescritas, el riesgo es significativo.
- Sesgos: no se han publicado evaluaciones de sesgos; el corpus de preentrenamiento y los datasets de SFT pueden contener sesgos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta optimizado ni evaluado para entornos de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-sft
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Pagina personal del autor: https://raghavsinghal10.github.io/
- Perfil de Google Scholar: https://scholar.google.com/citations?user=Nc4_zNIAAAAJ&hl=en
