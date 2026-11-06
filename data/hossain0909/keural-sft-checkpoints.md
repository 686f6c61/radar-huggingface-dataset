# hossain0909/keural-sft-checkpoints

## Resumen

Keural 14.8B es un modelo de lenguaje de tipo Mixture of Experts (MoE) entrenado desde cero por MKD-CORP (autor MKD Hossain), con un enfoque bilingüe coreano-inglés. El repositorio `hossain0909/keural-sft-checkpoints` no contiene un modelo final, sino los checkpoints intermedios de la fase 3 (Supervised Fine-Tuning, SFT) del pipeline de entrenamiento del modelo. La arquitectura sigue el estilo de Mixtral: 24 bloques transformer, 8 expertos con enrutamiento top-2, 14,83B parámetros totales y 2,6B activos por token.

El modelo resuelve el problema de disponer de un LLM bilingüe coreano-inglés entrenado íntegramente desde cero, sin partir de pesos de terceros, sobre infraestructura cloud (KT Cloud NIPA2-H200). La ventana de contexto es de 4096 tokens, una cifra modesta para los estándares actuales, y el vocabulario es un tokenizador SentencePiece propio de 131.074 entradas (131.072 base más dos tokens especiales ChatML).

Es relevante ahora porque documenta de forma transparente el proceso de entrenamiento por fases (pretraining, annealing, SFT en curso y DPO planificado) y publica checkpoints intermedios para investigación y reanudación del entrenamiento. No obstante, se trata de material de investigación: los checkpoints son ficheros `.pt` de estado FSDP (aproximadamente 83 GB cada uno), no pesos listos para inferencia en formato safetensors o GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixtral-style MoE (Mixture of Experts), transformer decoder |
| Parámetros totales | 14,83B |
| Parámetros activos | 2,6B por token |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (los checkpoints publicados son bfloat16 en formato `.pt`) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint FSDP completo: model, optimizer, step, loss); no hay safetensors ni GGUF en este repositorio |
| Capas | 24 bloques transformer |
| Hidden size | 4096 |
| Cabezas de atención | 32 (8 KV heads, GQA) |
| Expertos | 8 totales, enrutamiento top-2 |
| Tamaño de vocabulario | 131.074 (131.072 base + 2 tokens especiales ChatML) |
| Tokenizador | SentencePiece propio |
| Precisión de entrenamiento | bfloat16 |
| Hardware de entrenamiento | 2× NVIDIA H200 150GB, FSDP |
| Infraestructura | KT Cloud NIPA2-H200 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con capas MoE al estilo de Mixtral: 24 bloques, hidden size de 4096, 32 cabezas de atención con 8 KV heads (Grouped Query Attention) y 8 expertos con enrutamiento top-2, lo que resulta en 14,83B parámetros totales y 2,6B activos por token. El vocabulario es un tokenizador SentencePiece propio de 131.072 entradas, ampliado a 131.074 al inicio del SFT con los tokens `<|im_start|>` (ID 131072) y `<|im_end|>` (ID 131073); las embeddings de los nuevos tokens se inicializaron con la media de las existentes.

El pipeline de entrenamiento consta de cuatro fases. La fase 1 (pretraining) completó 100K pasos con aproximadamente 64,56B tokens. La fase 2 (annealing) completó 20K pasos con aproximadamente 5,16B tokens. La fase 3 (SFT), actualmente en curso, planifica 18K pasos sobre el dataset `mkd-chanwoo/keural-SFT` de 1.134.119 muestras en formato ChatML, con learning rate de 1e-5 a 1e-6 con decaimiento coseno, batch size de 2 por GPU en 2 GPUs y enmascaramiento de pérdida solo en turnos del asistente. La fase 4 (DPO) está planificada con aproximadamente 8K pasos sobre 233K pares de preferencia. Los checkpoints publicados corresponden a los pasos 5.000 (28% de completitud) y 10.000 (56%); cada fichero `.pt` pesa aproximadamente 83 GB e incluye el state dict del modelo, el estado del optimizador, el número de paso y la pérdida de entrenamiento en ese punto.

## Capacidades

- Generación de texto en coreano e inglés, con entrenamiento bilingüe desde cero.
- Instrucción y diálogo multi-turno mediante formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y respuesta a instrucciones en fase de SFT (los checkpoints publicados están a 28% y 56% del total de pasos de SFT, por lo que su calidad conversacional es parcial).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a coreano e inglés.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- El modelo base de la fase 2 está disponible en formato vLLM en `mkd-hossain/keural-14.8b-stage2-vllm`, y existe un modelo SFT a 7K pasos en `mkd-hossain/keural-14.8b-sft`.

## Casos de uso

- Investigación sobre entrenamiento MoE desde cero: los checkpoints permiten comparar la evolución de la pérdida y del comportamiento entre los pasos 5.000 y 10.000, y estudiar cómo emerge la capacidad de seguir instrucciones durante el SFT.
- Reanudación de entrenamiento: al incluir el estado del optimizador, el paso y la pérdida, los ficheros `.pt` permiten retomar el SFT desde el punto exacto en que se guardaron, útil para experimentos de ablación o ajustes de hiperparámetros.
- Desarrollo de asistentes bilingües coreano-inglés: el modelo está diseñado para conversación multi-turno en ambos idiomas con formato ChatML, adecuado para prototipos de atención al cliente en el mercado coreano.
- Evaluación de tokenizadores SentencePiece bilingües: el vocabulario de 131.074 entradas y el tratamiento de tokens especiales ChatML sirven para estudiar eficiencia de tokenización en coreano frente a inglés.
- Base para fine-tuning posterior con DPO: una vez completada la fase 3, los checkpoints sirven de punto de partida para la fase 4 de alineamiento con preferencias (233K pares planificados).
- Reproducibilidad de pipelines FSDP: la publicación de checkpoints completos con estado de optimizador facilita la reproducción de recetas de entrenamiento distribuido en 2× H200 con FSDP.
- Estudio de routing en MoE: con 8 expertos y top-2, los checkpoints permiten analizar el balance de carga entre expertos durante el SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los checkpoints publicados son ficheros `.pt` de estado FSDP de aproximadamente 83 GB cada uno; para cargarlos se necesita al menos esa cantidad de memoria (CPU o GPU) y el código de arquitectura personalizado de Keural.
- Para inferencia del modelo completo en bfloat16 se estima un requisito de VRAM en el entorno de 30 GB o más solo para pesos (14,83B parámetros), sin contar caché KV ni activaciones; no se ha publicado una cifra oficial.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA H200 150GB. Para inferencia, una A100 80GB o H100 son opciones holgadas; una RTX 4090 (24 GB) no cabría en bfloat16 sin cuantización.
- No se han publicado pesos GGUF ni cuantizaciones, por lo que no es posible confirmar compatibilidad con llama.cpp u Ollama en este repositorio.
- Opciones de despliegue: el modelo base de la fase 2 tiene una versión preparada para vLLM (`mkd-hossain/keural-14.8b-stage2-vllm`) y existe una versión SFT a 7K pasos (`mkd-hossain/keural-14.8b-sft`). Para estos checkpoints intermedios no se documenta un pipeline de despliegue directo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Keural 14.8B (SFT checkpoints) | 14,83B | 2,6B | 4096 | ko, en | Apache 2.0 | Checkpoints `.pt` de investigación |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 | multilingüe | Apache 2.0 | Pesos safetensors y GGUF |
| Qwen2.5 14B | 14,7B | denso | 32.768 | multilingüe | Apache 2.0 | Pesos safetensors y GGUF |
| Yi 1.5 9B | 8,8B | denso | 16.384 | en, zh | Apache 2.0 | Pesos safetensors y GGUF |

La comparación con Mixtral 8x7B es la más directa por arquitectura (MoE top-2 con 8 expertos), aunque Keural es considerablemente menor en parámetros totales y activos y tiene un contexto mucho más corto. Frente a modelos densos de tamaño similar como Qwen2.5 14B o Yi 1.5 9B, Keural se distingue por su enfoque bilingüe coreano-inglés y por entrenarse desde cero, pero carece de pesos listos para producción y de benchmarks publicados.

## Limitaciones y advertencias

- Los checkpoints publicados son intermedios (pasos 5.000 y 10.000 de 18.000), por lo que la calidad de instrucción y diálogo es parcial y no representan el modelo final.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- La ventana de contexto de 4096 tokens es corta para aplicaciones actuales de contexto largo.
- Solo soporta coreano e inglés; no hay capacidades multilingües adicionales documentadas.
- El formato de pesos es `.pt` con estado de optimizador y requiere el código de arquitectura personalizado de Keural; no hay safetensors, GGUF ni cuantizaciones publicadas en este repositorio.
- El vocabulario es 131.074, no 131.072; usar el valor estándar puede provocar errores de carga.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo entrenado desde cero con ~64,56B tokens de pretraining, una cifra modesta.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de checkpoints de investigación sin evaluación, no se recomienda su uso en producción.
- El repositorio ocupa 178 GB y cada checkpoint ronda los 83 GB, lo que exige almacenamiento y ancho de banda considerables.
- La fase DPO está planificada pero no completada, por lo que no hay alineamiento con preferencias humanas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hossain0909/keural-sft-checkpoints
- Modelo base (fase 2): https://huggingface.co/mkd-hossain/keural-14.8b-stage2
- Checkpoints de la fase 1: https://huggingface.co/mkd-hossain/keural-stage1-checkpoints
- Modelo base fase 2 para vLLM: https://huggingface.co/mkd-hossain/keural-14.8b-stage2-vllm
- Modelo SFT a 7K pasos (vLLM): https://huggingface.co/mkd-hossain/keural-14.8b-sft
- Dataset DPO: https://huggingface.co/datasets/mkd-hossain/keural-dpo-dataset
- Dataset SFT: mkd-chanwoo/keural-SFT (referenciado en la model card; no se proporciona URL directa)
