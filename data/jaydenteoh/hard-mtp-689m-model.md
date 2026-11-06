# JaydenTeoh/hard-mtp-689m-model

## Resumen

Hard-MTP 689M es un modelo de lenguaje autorregresivo entrenado por Jayden Teoh como parte del estudio **Multi-Token Prediction Done Right** (arXiv:2610.38331). No es un modelo de uso general orientado a producto, sino uno de los doce checkpoints (tres objetivos de multi-token prediction por cuatro tamaños) entrenados con una receta idéntica para comparar de forma controlada el efecto del objetivo de entrenamiento. Este checkpoint concreto corresponde al objetivo MTP "duro" (hard MTP): cada cabecera se entrena con cross-entropy contra el token realizado *k* posiciones por delante, el objetivo clásico usado en DeepSeek-V3.

El modelo es un transformer decoder de 745 millones de parámetros (configuración de 1152 de hidden size y 36 capas) entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con tokenizador GPT-2. Su relevancia es principalmente investigadora: permite estudiar si el multi-token prediction mejora la calidad del modelo base y si sus cabeceras auxiliares sirven como draft model para decodificación especulativa auto-especulativa, sin depender de un modelo externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con cabeceras MTP auxiliares (tipo hf_mtp, código remoto) |
| Parametros totales | 745M (745.049.088 segun safetensors) |
| Parametros activos | 745M (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos bf16/fp32 originales) |
| Idiomas soportados | Ingles (entrenado solo con corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (3,0 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con hidden size de 1152, 36 capas y 18 cabezas de atencion. La particularidad es que incorpora 3 cabeceras MTP adicionales en cascada estilo DeepSeek (un bloque cada una), que predicen los tokens en posiciones +2, +3 y +4 durante el entrenamiento. El objetivo es "hard": cada cabecera se optimiza con cross-entropy contra el token realizado k posiciones adelante, en contraposicion a variantes "soft" que predicen distribuciones. Estas cabeceras son estrictamente auxiliares: se descartan en inferencia, de modo que el modelo desplegado es un transformer next-token ordinario de 745M. Ademas, las cabeceras pueden reutilizarse como draft model para decodificacion especulativa auto-especulativa.

El entrenamiento uso 31,5 mil millones de tokens de FineWeb-Edu (dataset educativo de Hugging Face) tokenizados con el BPE de GPT-2, con vocabulario rellenado de 50257 a 50304 por alineacion. El optimizador es una combinacion destacable: Muon para las matrices ocultas 2D y AdamW para embeddings, cabecera de salida y normalizaciones. Se empleo LR pico de 0,00125 con decaimiento coseno hasta 1e-05, 2.000 pasos de warmup, weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32, durante 60.000 pasos con batch de 256 y contexto de 2048. Las doce variantes del estudio comparten semilla (13), orden de datos y planificador, de forma que las diferencias de rendimiento son atribuibles al objetivo de entrenamiento.

## Capacidades

- Generacion de texto en ingles a nivel de modelo base (no instruido ni alineado con RLHF/DPO).
- Prediccion multi-token durante el entrenamiento, con potencial uso de las cabeceras MTP como draft model para decodificacion especulativa.
- Modelado de lenguaje sobre contenido educativo y de calidad (FineWeb-Edu).
- No soporta tool calling, function calling ni modos de agente: es un modelo base sin entrenamiento de instrucciones.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito.
- Ventana de contexto limitada a 2048 tokens.

## Casos de uso

- Investigacion en multi-token prediction: replicar o extender los experimentos del paper comparando objetivos hard/soft MTP bajo recetas identicas.
- Decodificacion especulativa auto-especulativa: usar las cabeceras MTP como draft model para acelerar la inferencia del propio modelo sin un modelo auxiliar externo.
- Baseline para estudios de escalado: servir de punto de comparacion en experimentos de preentrenamiento con presupuestos de compute similares.
- Estudio de optimizadores: analizar el efecto de Muon combinado con AdamW en entrenamientos de ~31B de tokens.
- Generacion de texto experimental en ingles: completar texto con el tokenizador GPT-2 para pruebas cualitativas, sin expectativas de calidad tipo chat.
- Ensenanza y docencia: ejemplo compacto y reproducible (un solo seed, configuracion publica en YAML) para cursos sobre preentrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HellaSwag, perplexity ni comparativas numericas; remitirse al paper arXiv:2610.38331 para los resultados del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,5-3 GB en fp32/bf16 sin cuantizar (el repo pesa 3,0 GB); el modelo cabe con holgura en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna; para experimentacion, una RTX 3090/4090 o una A100 es mas que suficiente.
- Cabe facilmente en GPUs de consumo (RTX 3060 de 12 GB, RTX 4090, e incluso GPUs de 8 GB en fp16/bf16).
- Despliegue: via transformers con `trust_remote_code=True` (la arquitectura `hf_mtp` no esta integrada en la libreria). La model card indica `inference: false`, por lo que no hay Inference API activa. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| JaydenTeoh/hard-mtp-689m-model | 745M | 2048 | MIT | Investigacion MTP hard, modelo base |
| GPT-2 (tokenizador/comparacion de escala) | 124M-1,5B | 1024 | MIT/OPENAI | Modelo base clasico, NTP puro |
| Pythia-1B (EleutherAI) | ~1B | 2048 | Apache 2.0 | Modelo base para investigacion, NTP puro |

Nota: no existen alternativas publicas directas con el mismo objetivo experimental (MTP hard a 689M sobre FineWeb-Edu con receta compartida); las comparativas anteriores son de categoria similar (modelos base pequenos para investigacion).

## Limitaciones y advertencias

- Es un modelo base sin instrucciones ni alineacion: no sigue instrucciones de forma fiable y no es adecuado para asistentes o chat.
- Entrenado exclusivamente en ingles; el rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- Contexto de solo 2048 tokens, insuficiente para documentos largos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python personalizado del repo: revisarlo antes de usar en entornos de produccion.
- Riesgo de alucinacion inherente a modelos base pequenos entrenados con 31,5B de tokens (muy por debajo de modelos comerciales).
- Sesgos: hereda los sesgos de FineWeb-Edu (contenido web educativo en ingles); no se documentan auditorias de sesgo.
- Licencia MIT sin restricciones de uso comercial, pero la calidad del modelo no lo hace candidato para produccion.
- Las cabeceras MTP se descartan en inferencia: el modelo desplegado no ofrece aceleracion especulativa salvo que se implemente explicitamente.
- Proyecto de un solo seed y una sola ejecucion por celda: los resultados pueden tener varianza experimental no caracterizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/hard-mtp-689m-model
- Paper: Multi-Token Prediction Done Right — https://arxiv.org/abs/2610.38331
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
