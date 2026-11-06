# hossain0909/keural-14.8b-stage2-vllm

## Resumen

Keural 14.8B (Stage 2) es un modelo lingüístico bilingüe coreano-inglés de tipo Mixture-of-Experts (MoE) entrenado desde cero por el desarrollador independiente MKD Hossain (usuario hossain0909 en Hugging Face). El repositorio contiene el checkpoint de annealing de la etapa 2, correspondiente a 120.000 pasos de entrenamiento acumulados y aproximadamente 48 mil millones de tokens procesados (~43B en preentrenamiento más ~5,16B de datos limpios en annealing). El modelo está diseñado para resolver la falta de modelos MoE abiertos y eficientes centrados en coreano, un idioma con menos representación en los grandes modelos generalistas.

Su relevancia radica en ser un proyecto de preentrenamiento desde cero documentado públicamente, con arquitectura Mixtral compatible con vLLM y Transformers, y una licencia Apache 2.0 que permite uso comercial sin restricciones. Con unos 14,83B de parámetros totales y solo ~2,9B activos por token, ofrece un coste de inferencia bajo para su clase. Es importante subrayar que se trata de un modelo base de preentrenamiento: completa texto, pero no sigue instrucciones ni conversa; el autor planea publicar etapas posteriores de SFT y RLHF/DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral MoE (MixtralForCausalLM) |
| Parametros totales | ~14,83B (15.368.916.992 según safetensors) |
| Parametros activos | ~2,9B por token (8 expertos, top-2 activos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (30,7 GB de repo, bfloat16) |

Detalle adicional de la arquitectura: 24 capas, tamaño oculto de 4096, 32 cabezas de atención con GQA (8 cabezas KV), FFN con tamaño intermedio de 5632, vocabulario de 131.072 tokens, RoPE theta de 500.000, ventana deslizante de 512 y activación SiLU.

## Arquitectura y entrenamiento

Keural emplea la arquitectura Mixtral MoE: en cada capa, un router selecciona 2 de los 8 expertos disponibles (top-2 routing), lo que permite un modelo con 14,83B de parámetros totales pero con un coste computacional por token equivalente a un modelo denso de ~2,9B. Usa atención agrupada de consultas (GQA) con 32 cabezas de consulta y 8 de clave-valor, lo que reduce la memoria de la caché KV, y una ventana deslizante de 512 tokens junto a RoPE con theta de 500.000, una configuración heredada del diseño de Mistral/Mixtral.

El entrenamiento se dividió en dos etapas. La etapa 1 consistió en 100.000 pasos (~43B de tokens) sobre texto web coreano e inglés (FineWeb, WanJuan, HPLT, entre otros), con entrenamiento distribuido FSDP en 2× NVIDIA H200 de 150 GB y aprendizaje con decaimiento coseno de 3e-4 a 3e-5. La etapa 2 fue un annealing de 20.000 pasos (~5,16B de tokens) sobre datos de alta calidad filtrados: FineWeb-Edu (inglés), FineWeb2 coreano, HPLT coreano y WanJuan coreano, con learning rate continuado de ~4,8e-5 a 3e-5. No se ha aplicado RLHF, DPO ni SFT; el tokenizer es un SentencePiece personalizado entrenado sobre corpus coreano e inglés.

## Capacidades

- Generación de texto en coreano e inglés como modelo base (completado de texto, no chat ni instrucciones).
- Manejo bilingüe gracias a un tokenizer SentencePiece específico para coreano e inglés con vocabulario de 131.072 tokens.
- Inferencia eficiente tipo MoE: solo ~2,9B de parámetros activos por token.
- Compatibilidad con vLLM (servidor con API compatible con OpenAI) y con la librería Transformers.
- No soporta tool calling, function calling ni agentes: es un modelo base sin alineación.
- No dispone de capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Salidas potencialmente repetitivas o incoherentes en tareas de razonamiento complejo, según reconoce el propio autor.

## Casos de uso

- Investigación sobre MoE desde cero: al ser un modelo entrenado públicamente con documentación detallada de hiperparámetros, datos y hardware, es útil como base de estudio y réplica para grupos de investigación con recursos limitados (2× H200).
- Fine-tuning para coreano: como modelo base bilingüe, es un punto de partida adecuado para aplicar SFT propio y crear modelos de chat o de dominio específico en coreano, donde las opciones abiertas son escasas.
- Completado de texto en coreano e inglés: puede integrarse en editores o herramientas de autocompletado donde se necesite continuar texto en estos dos idiomas.
- Servidor de inferencia con API OpenAI-compatible: gracias a su compatibilidad con vLLM, puede desplegarse rápidamente como endpoint de completions para prototipos internos.
- Extracción y análisis de texto en corpus coreanos: útil para tareas de modelado de lenguaje, cálculo de perplejidad o generación sintética de datos de preentrenamiento.
- Benchmarking de arquitecturas: permite comparar el rendimiento de un MoE de 14,83B/2,9B activos frente a modelos densos de tamaño similar en tareas de lenguaje coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 31 GB solo de pesos (30,7 GB de repo), más overhead de caché KV y activaciones; en la práctica, una GPU de 40 GB o superior es lo cómodo.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o H200 para servir en producción con vLLM. El entrenamiento original se realizó en 2× H200 de 150 GB.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) en bfloat16. Sin cuantizaciones publicadas (no hay GGUF ni versiones int4/int8 oficiales), no hay ruta documentada para consumer GPUs; una cuantización a 4 bits reduciría los pesos a ~8-9 GB y permitiría ejecutarlo en GPUs de 12-16 GB, pero no existe release oficial.
- Opciones de despliegue: vLLM (recomendado por el autor, probado con vllm==0.9.2 y transformers==4.57.0, sirviendo con `vllm serve` y `--max-model-len 4096`) y Transformers con `device_map="auto"`. No hay soporte oficial documentado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al activar solo ~2,9B de parámetros por token, el throughput esperable debería ser superior al de un modelo denso de 14,8B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Keural 14.8B Stage 2 | ~14,8B | ~2,9B | 4.096 | Apache 2.0 | Base bilingüe ko/en, sin SFT |
| Mixtral 8x7B Instruct | ~46,7B | ~12,9B | 32.768 | Apache 2.0 | Misma familia arquitectónica, multilingüe, con instrucciones |
| Qwen2.5-14B | 14,8B (denso) | 14,8B | 128.000 | Apache 2.0 (Qwen Research) / licencia Qwen | Denso, soporta coreano entre ~29 idiomas, con variantes instruct |
| EXAONE 3.5 (LG) | 7,8B / 32B | — | 32.768 | Restringida (uso no comercial) | Fuerte en coreano, pero licencia limitada |

Keural se distingue por su licencia totalmente permisiva y su enfoque específico en coreano con eficiencia MoE, aunque su contexto de 4.096 tokens es notablemente inferior al de las alternativas y carece de alineación por instrucciones.

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no sigue instrucciones ni responde preguntas en formato de chat; usarlo como asistente sin SFT producirá resultados pobres.
- No está alineado ni filtrado por seguridad (sin RLHF/DPO): puede generar contenido ofensivo, sesgado o incorrecto sin mitigación alguna.
- Riesgo elevado de alucinación y de salidas repetitivas o incoherentes en razonamiento complejo, reconocido explícitamente por el autor.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos: al entrenarse sobre texto web (FineWeb, WanJuan, HPLT), hereda los sesgos de esos corpus, tanto en inglés como en coreano; no hay auditoría de sesgos publicada.
- Sin cuantizaciones oficiales ni versiones GGUF, lo que restringe el despliegue en hardware de consumo.
- Proyecto de un desarrollador individual: mantenimiento, corrección de errores y soporte a largo plazo no garantizados; el roadmap indica que SFT y RLHF aún están pendientes.
- La licencia Apache 2.0 no impone restricciones comerciales, pero el usuario debe cumplir con la normativa aplicable sobre contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/keural-14.8b-stage2-vllm
- Repositorio base referenciado: https://huggingface.co/mkd-hossain/keural-14.8b-stage2-vllm
- Paper: no disponible
- Blog o anuncio: no disponible
- Demo online: no disponible
