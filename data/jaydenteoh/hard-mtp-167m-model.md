# JaydenTeoh/hard-mtp-167m-model

## Resumen

Hard-MTP-167M es un modelo de lenguaje experimental de 178 millones de parámetros desarrollado por Jayden Teoh como parte del estudio *Multi-Token Prediction Done Right* (arXiv:2610.38331). Se trata de uno de doce checkpoints (tres objetivos de multi-token prediction por cuatro tamaños) entrenados con una receta idéntica para poder compararlos de forma controlada. Este checkpoint concreto implementa el objetivo MTP "duro" (hard): cada cabecera MTP se entrena con cross-entropía contra el token realizado k posiciones por delante, al estilo de DeepSeek-V3.

El modelo no pretende ser un LLM de uso general, sino un artefacto de investigación para estudiar cómo afecta el objetivo de predicción multi-token al rendimiento y a la decodificación especulativa. Está entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con tokenizador GPT-2, y las cabeceras MTP se descartan en inferencia: lo que se despliega es un transformer next-token convencional, con la opción de usar las cabeceras como modelo borrador para auto-decodificación especulativa. Su licencia MIT y su tamaño reducido lo hacen fácil de experimentar en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder next-token prediction con cabeceras MTP auxiliares (custom code, `model_type: hf_mtp`) |
| Parametros totales | 178,4 M (178.368.512 según safetensors) |
| Parametros activos | 178 M (no es MoE; las cabeceras MTP se descartan en inferencia) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (entrenado solo con corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (0,7 GB de tamano de repo) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder de 36 capas con hidden size de 512 y 8 cabezas de atencion. Sobre esta base se anaden 3 cabeceras MTP en cascada estilo DeepSeek (un bloque cada una), entrenadas con el objetivo "hard": cada cabecera predice el token k-ahead real mediante cross-entropia. Estas cabeceras son estrictamente auxiliares: en despliegue se descartan y el modelo resultante es un transformer next-token estandar. La alternativa util es emplearlas como draft model interno para self-speculative decoding, lo que constituye la principal innovacion practica del enfoque.

El entrenamiento uso 31,5 mil millones de tokens de FineWeb-Edu (60.000 pasos, batch de 256, contexto de 2048) tokenizados con el BPE de GPT-2. Se empleo el optimizador Muon sobre las matrices ocultas 2D y AdamW sobre embeddings, cabezas y normalizaciones, con LR pico de 0,002 con decaimiento coseno hasta 1e-05, 2.000 pasos de warmup, weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32. El vocabulario de 50.257 tokens se relleno hasta 50.304 por alineacion. Cada celda del estudio se entreno en una unica ejecucion con semilla 13, compartiendo semilla, orden de datos y planificador entre los doce checkpoints, de modo que las diferencias entre ellos son atribuibles al objetivo de entrenamiento.

## Capacidades

- Generacion de texto en ingles a escala small (178M), adecuada para experimentacion mas que para produccion.
- Prediccion multi-token durante el entrenamiento mediante 3 cabeceras MTP en cascada estilo DeepSeek-V3.
- Self-speculative decoding: las cabeceras MTP pueden actuar como draft model para acelerar la generacion sin modelo borrador externo.
- Compatibilidad con la libreria `transformers` de Hugging Face mediante `trust_remote_code=True` (codigo de modelado incluido en el repo).
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en objetivos de entrenamiento: comparar empiricamente MTP duro frente a variantes soft y NTP puro usando checkpoints con receta identica (misma semilla, datos y planificador).
- Experimentacion con decodificacion especulativa: probar self-speculative decoding aprovechando las cabeceras MTP como draft model sin necesidad de un modelo auxiliar separado.
- Reproduccion de pipelines de preentrenamiento a pequena escala: la configuracion `configs/167m_fineweb.yaml` del repo permite replicar el entrenamiento en hardware accesible.
- Benchmarking de optimizadores: el uso de Muon sobre matrices 2D combinado con AdamW sirve como caso de estudio para comparar optimizadores de preentrenamiento.
- Docencia y tutoriales: tamano y coste reducidos lo hacen idoneo para demostrar preentrenamiento de LLM en un solo nodo o GPU de consumo.
- Base para ablations de arquitectura: modificar capas, cabezas u objetivos partiendo de un checkpoint ya entrenado y comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper *Multi-Token Prediction Done Right* (arXiv:2610.38331) para la comparacion entre los doce checkpoints, pero no incluye metricas concretas (MMLU, HumanEval, GSM8K, etc.) en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 178M de parametros en fp32, unos 0,8 GB; en bf16/fp16, unos 0,4 GB. No hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna; no requiere aceleradores de centro de datos (A100/H100 innecesarios para inferencia).
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060 o superiores, e incluso GPUs integradas o CPU para experimentacion basica.
- Despliegue: via `transformers` con `trust_remote_code=True` (el repo indica `inference: false` en la model card, es decir, sin Inference API activa). No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI; al ser codigo custom (`model_type: hf_mtp`), los runtimes estandar no lo soportan de serie.
- Latencia y throughput: no disponibles; al ser un modelo de 178M con contexto 2048, la generacion en GPU de consumo deberia ser rapida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| JaydenTeoh/hard-mtp-167m-model | 178 M | 2048 | FineWeb-Edu, 31,5B tokens | MIT | 3 cabeceras MTP hard estilo DeepSeek, self-speculative decoding |
| GPT-2 (124M/355M) | 124–355 M | 1024 | WebText | MIT (pesos) | NTP puro, mismo tokenizador base, sin MTP |
| Pythia-160B family (p. ej. pythia-160m) | 160 M | 2048 | The Pile, ~300B tokens | Apache 2.0 | NTP puro, suite de checkpoints por paso de entrenamiento |
| SmolLM2-135M | 135 M | 2048 | ~11T tokens (mezcla propia) | Apache 2.0 | NTP puro, orientado a uso en dispositivos |

Frente a estas alternativas, el valor de hard-mtp-167m no radica en rendimiento absoluto (esta entrenado con muchos menos tokens) sino en su rol de checkpoint controlado para estudiar multi-token prediction y decodificacion especulativa.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: entrenado con solo 31,5B tokens, su calidad de texto esta muy por debajo de LLMs comerciales o incluso de otros modelos abiertos de tamano similar entrenados con billones de tokens.
- Riesgo alto de alucinacion y de texto incoherente, inherente a su escala y a la limitada cantidad de datos de preentrenamiento.
- Solo ingles: entrenado exclusivamente con FineWeb-Edu, no apto para castellano ni otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado arbitrario del repo; revisar los ficheros antes de usarlo en entornos sensibles.
- Contexto limitado a 2048 tokens.
- Sin cuantizaciones ni runtimes optimizados publicados (sin GGUF, sin vLLM/llama.cpp), lo que limita las opciones de despliegue eficiente.
- Licencia MIT sin restricciones comerciales relevantes, pero conviene citar el paper asociado (arXiv:2610.38331) en trabajos derivados.
- Las cabeceras MTP son auxiliares y se descartan en inferencia; intentar desplegarlas sin entender su rol puede llevar a errores de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/hard-mtp-167m-model
- Paper: Multi-Token Prediction Done Right — https://arxiv.org/abs/2610.38331
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/gpt2
