# hossain0909/keural-dpo-5500

## Resumen

Keural-DPO-5500 es un modelo lingüístico bilingüe coreano-inglés de tipo Mixture-of-Experts (MoE) desarrollado por el usuario hossain0909 (proyecto mkd-hossain) y entrenado íntegramente desde cero, sin partir de ningún modelo base preexistente. Es el checkpoint de alineamiento DPO (Direct Preference Optimization) correspondiente al paso 5.500, aproximadamente el 79% de una época completa sobre el dataset de preferencias, y parte del checkpoint SFT de 18.000 pasos (mkd-hossain/keural-sft-18k).

El modelo resuelve la carencia de modelos conversacionales abiertos optimizados específicamente para coreano, un idioma poco representado en la mayoría de LLM de código abierto. Con 14,83B de parámetros totales y unos 7,42B activos por token (arquitectura estilo Mixtral con 8 expertos y enrutamiento top-2), ofrece un equilibrio razonable entre capacidad y coste de inferencia. Su relevancia actual radica en que demuestra un pipeline completo de preentrenamiento, SFT y DPO reproducible con hardware modesto (2× H200) y licencia Apache 2.0.

La ventana de contexto es de 4.096 tokens, el vocabulario es de 131.074 tokens (SentencePiece más tokens especiales ChatML) y los pesos se distribuyen en bfloat16 con formato safetensors. Según el autor, este checkpoint mejora de forma notable el seguimiento de instrucciones y la consistencia en el idioma de respuesta respecto al checkpoint SFT y al checkpoint DPO anterior de 3.500 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo Mixtral (8 expertos, enrutamiento top-2), decoder causal |
| Parametros totales | 15.368.933.376 (~15,37B según safetensors; 14,83B según la model card) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos nativos en bfloat16) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Keural emplea una arquitectura MoE estilo Mixtral con 8 expertos y enrutamiento top-2 por token, lo que activa aproximadamente la mitad de los parámetros en cada pasada. El backbone incluye 24 capas, tamaño oculto de 4.096, 32 cabezas de atención con GQA (8 cabezas KV, dimensión de cabeza 128), RMSNorm con eps 1e-5, activación SiLU, RoPE con theta 500.000 y ventana deslizante de 512 alternada en capas pares, una técnica que reduce el coste de la atención en contextos largos.

El entrenamiento completo se realizó en 2× NVIDIA H200 SXM y consta de cuatro etapas: preentrenamiento fase 1 (100.000 pasos, ~50B tokens sobre corpus web coreano e inglés), preentrenamiento fase 2 (120.000 pasos, ~13B tokens adicionales), SFT (18.000 pasos sobre 1,14M muestras ChatML del dataset mkd-chanwoo/keural-SFT, ~710M tokens) y DPO (5.500 de 6.927 pasos totales sobre 440.627 pares de preferencia del dataset keural-dpo-raw). El DPO se entrenó con learning rate 2e-6 con decaimiento coseno hasta 2e-7, beta (penalización KL) de 0,1, batch efectivo de 64, longitud máxima de secuencia de 1.024 tokens, optimizador AdamW (β1=0,9, β2=0,95) y FSDP FULL_SHARD en bfloat16 con gradient checkpointing, a razón de ~40 segundos por paso. Las métricas reportadas en el paso 5.500 indican una pérdida DPO estable (~0,6924), margen consistentemente positivo (+0,0009 a +0,0018) y GradNorm entre 0,20 y 0,31.

## Capacidades

- Generación de texto conversacional bilingüe en coreano (idioma principal) e inglés, con formato ChatML obligatorio (`<|im_start|>` / `<|im_end|>`).
- Seguimiento de instrucciones mejorado respecto al checkpoint SFT gracias al alineamiento DPO con 440.627 pares de preferencia.
- Consistencia de idioma: el modelo está entrenado para responder en el idioma del usuario, aunque la model card recomienda incluir siempre un system prompt para evitar respuestas por defecto en coreano.
- Compatibilidad con la API OpenAI-compatible de vLLM para servir como asistente de chat.
- No hay evidencia publicada de soporte nativo de tool calling / function calling, capacidades de visión o audio, ni modos de razonamiento extendido.
- No se ha documentado soporte oficial para otros idiomas aparte de coreano e inglés.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está optimizado para diálogo multi-turno en coreano con formato ChatML, lo que lo hace adecuado para chatbots de atención al usuario en el mercado surcoreano.
- Asistentes bilingües coreano-inglés: su entrenamiento explícito para igualar el idioma del usuario permite construir interfaces que atienden a usuarios que alternan entre ambos idiomas.
- Prototipado de alineamiento DPO: al publicar el pipeline completo (preentrenamiento, SFT, DPO) con hiperparámetros detallados, sirve como referencia práctica para equipos que quieran replicar un flujo de alineación de preferencias a pequeña escala.
- Servicios autoalojados con licencia permisiva: la licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones de uso, sirviéndolo vía vLLM detrás de un endpoint OpenAI-compatible.
- Investigación en MoE eficientes: con ~7,42B de parámetros activos sobre 14,83B totales, es un caso de estudio sobre el compromiso entre capacidad total y coste de inferencia en modelos entrenados desde cero.
- Generación de contenido y redacción asistida en coreano: redacción de correos, resúmenes y textos breves en coreano dentro de su ventana de 4.096 tokens.
- Fine-tuning adicional: al ser un checkpoint intermedio del DPO (79% de la época), puede utilizarse como punto de partida para afinados posteriores o experimentos de RLHF/DPO alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (pérdida DPO de ~0,6924, margen positivo de +0,0009 a +0,0018 y GradNorm de 0,20–0,31 en el paso 5.500), que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~30,7 GB solo de pesos (el repositorio ocupa 30,7 GB), más la sobrecarga de KV cache y activaciones; en la práctica se necesita una GPU con 40 GB o más, o reparto entre dos GPUs de 24 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o H200 según la configuración de entrenamiento original; con tensor parallelism o cuantización adicional podría adaptarse a hardware menor, aunque no hay cuantizaciones publicadas.
- Consumer GPU: no cabe de forma nativa en una RTX 4090 (24 GB) en bfloat16; sería necesario esperar cuantizaciones GGUF/AWQ que actualmente no están disponibles.
- Despliegue: compatible con la librería `transformers` (carga con `device_map="auto"`) y con vLLM, que es el método recomendado por el autor (`--dtype bfloat16 --max-model-len 4096 --tensor-parallel-size 1`). No hay soporte documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el único dato de rendimiento publicado es la velocidad de entrenamiento (~40 segundos por paso en DPO con 2× H200).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-DPO-5500 | ~14,83B | ~7,42B | 4.096 | Coreano, inglés | Apache 2.0 |
| Mixtral-8x7B-Instruct-v0.1 (Mistral AI) | 46,7B | 12,9B | 32.768 | Multilingüe (incl. coreano, sin especializar) | Apache 2.0 |
| Qwen2.5-14B-Instruct | 14,7B | 14,7B (denso) | 32.768 (128K con YaRN) | Multilingüe (29+, incl. coreano) | Apache 2.0 (algunos componentes con otras condiciones) |
| EXAONE-3.5-7.8B-Instruct (LG AI Research) | 7,8B | 7,8B (denso) | 32.768 | Coreano, inglés | Restringida (no comercial sin permiso) |

Keural se diferencia por su especialización en coreano con un pipeline de alineamiento DPO propio y una licencia plenamente comercial, a cambio de un contexto mucho más corto (4.096 tokens) y una ausencia total de benchmarks públicos frente a alternativas más maduras.

## Limitaciones y advertencias

- Sin benchmarks públicos: no existen evaluaciones independientes ni comparables (MMLU, GSM8K, etc.), por lo que su calidad real debe validarse caso por caso antes de producción.
- Checkpoint intermedio: corresponde al 79% de una época de DPO, no al modelo final, por lo que el alineamiento está incompleto y el comportamiento puede ser menos estable que el del checkpoint definitivo.
- Sesgo de idioma: sin system prompt, el modelo tiende a responder en coreano independientemente del idioma de entrada; es imprescindible incluir siempre un system prompt que indique el idioma de respuesta.
- Contexto corto: 4.096 tokens limitan su uso en tareas con documentos largos o conversaciones extensas.
- Formato ChatML estricto: el uso de otro formato de plantilla degradará notablemente la calidad; el token de fin de generación es `<|im_end|>` (ID 131073) y debe configurarse explícitamente.
- Riesgo de alucinación: al tratarse de un modelo entrenado desde cero con ~63B tokens (frente a los billones de tokens de los modelos comerciales), el riesgo de alucinaciones y errores factuales es presumiblemente alto; no hay datos publicados que lo cuantifiquen.
- Sin cuantizaciones oficiales ni soporte GGUF, lo que restringe el despliegue en hardware de consumo.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, aunque al ser un modelo entrenado desde cero con corpus web sin documentar, conviene revisar los datos de entrenamiento si el caso de uso exige garantías de procedencia.
- Cobertura limitada a coreano e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/keural-dpo-5500
- Modelo base (SFT): https://huggingface.co/mkd-hossain/keural-sft-18k
- Dataset SFT: https://huggingface.co/datasets/mkd-chanwoo/keural-SFT
- Paper, repositorio de código y demos: no disponible
