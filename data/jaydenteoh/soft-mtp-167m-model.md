# JaydenTeoh/soft-mtp-167m-model

## Resumen

Soft-MTP 167M es un modelo de lenguaje autorregresivo de 178M de parámetros desarrollado por Jayden Teoh como parte del artículo "Multi-Token Prediction Done Right" (arXiv:2610.38331). Su interés principal no es el rendimiento como modelo final, sino la investigación: implementa una variante de multi-token prediction (MTP) en la que cada cabecera MTP se entrena contra la propia distribución del próximo token del modelo (q), en lugar del token realizado, mediante un acoplamiento KL con straight-through que añade un solo pase hacia atrás y evita un softmax adicional sobre el vocabulario.

El checkpoint forma parte de una serie de doce modelos (tres objetivos x cuatro tamaños) entrenados con una receta idéntica (mismos datos, semilla, orden de datos y planificador), de modo que las diferencias entre ellos son atribuibles directamente al objetivo de entrenamiento. Es, por tanto, una herramienta útil para reproducir y comparar experimentos de MTP y decodificación especulativa.

En inferencia, las cabeceras MTP se descartan y lo que se despliega es un transformer next-token convencional de 178M de parámetros, entrenado sobre 31,5B de tokens de FineWeb-Edu con el tokenizador GPT-2. Las cabeceras también pueden reutilizarse como modelo borrador (draft) para decodificación autoespeculativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder next-token prediction con 3 cabeceras MTP auxiliares (tipo DeepSeek, cascada de 1 bloque cada una) |
| Parametros totales | 178M (178.368.512 según safetensors) |
| Parametros activos | 178M (no es MoE; las cabeceras MTP se descartan en inferencia) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (entrenado exclusivamente con corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (0,7 GB de tamano de repo) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder con hidden size de 512, 36 capas y 8 cabeceras de atencion. Encima del modelo base se anaden 3 cabeceras MTP en configuracion de cascada estilo DeepSeek (un bloque cada una). La innovacion central del articulo es el objetivo de entrenamiento "soft": cada cabecera MTP se optimiza contra la distribucion completa del proximo token producida por el propio modelo (q), no contra el token observado, mediante un acoplamiento KL-recovery con straight-through estimator. Esto anade un unico pase backward adicional y no requiere un softmax sobre el vocabulario para las cabeceras.

El entrenamiento utilizo 31,5B de tokens de FineWeb-Edu (HuggingFaceFW/fineweb-edu) tokenizados con GPT-2 BPE: 60.000 pasos con batch de 256 secuencias de 2048 tokens. El optimizador es hibrido: Muon para las matrices ocultas 2D y AdamW para embeddings, cabecera de salida y normalizaciones. LR pico de 0,002 con planificacion coseno hasta 1e-05, 2.000 pasos de warmup, weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32. Se trato de una unica ejecucion por celda con semilla 13; los doce checkpoints de la serie comparten semilla, orden de datos y planificador para garantizar comparabilidad directa entre objetivos. No hay indicios de RLHF/DPO: es un modelo preentrenado puro, sin alineacion posterior.

## Capacidades

- Generacion de texto en ingles a partir de preentrenamiento sobre FineWeb-Edu (corpus educativo filtrado).
- Prediccion multi-token durante el entrenamiento, con cabeceras MTP reutilizables como draft model para decodificacion autoespeculativa.
- Compatibilidad con la libreria transformers de Hugging Face (requiere `trust_remote_code=True`, ya que el model type `hf_mtp` se define en los ficheros del repo).
- Uso como base para investigacion en objetivos de preentrenamiento y decodificacion especulativa.
- No incluye capacidades de vision, audio ni razonamiento explicito.
- No hay soporte documentado de tool calling ni de agentes.

## Casos de uso

- Investigacion en multi-token prediction: sirve como checkpoint de referencia del objetivo "soft" para reproducir o extender los experimentos del articulo, gracias a que comparte receta exacta con los otros once checkpoints.
- Decodificacion especulativa autoespeculativa: las cabeceras MTP pueden actuar como draft model integrado, acelerando la inferencia del propio modelo sin necesidad de un modelo borrador externo.
- Baseline para ablation studies: al ser un modelo pequeno (178M) entrenado con receta controlada, es idoneo para comparar objetivos de entrenamiento con presupuesto computacional moderado.
- Prototipado de tecnicas de entrenamiento: su tamano permite iterar rapidamente sobre variantes de MTP, optimizadores (Muon) o planificadores de LR antes de escalar a modelos mayores.
- Generacion de texto experimental en ingles: puede usarse para completar texto simple, aunque al carecer de alineacion (RLHF/DPO) su salida es de modelo base.
- Material didactico: el repo de codigo (JaydenTeoh/Soft-MTP, con `configs/167m_fineweb.yaml`) acompana al paper y facilita estudiar la implementacion del objetivo soft-MTP de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas entre los doce checkpoints; para datos de rendimiento debe consultarse el articulo arXiv:2610.38331.

## Requisitos de hardware

- VRAM estimada para inferencia: con 178M de parametros en fp16/bf16, el modelo ocupa aproximadamente 0,4 GB; con pesos fp32, unos 0,7 GB (coincide con el tamano del repo). No hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware especializado. Puede ejecutarse incluso en CPU para pruebas puntuales.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con varios GB de VRAM.
- Despliegue: mediante transformers de Hugging Face con `trust_remote_code=True` (el model type `hf_mtp` es custom code). La model card indica `inference: false` en metadatos, por lo que no hay endpoint de inference API activo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al ser un modelo de 178M con contexto de 2048, la inferencia por token deberia ser muy rapida, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| JaydenTeoh/soft-mtp-167m-model | 178M | 2048 | FineWeb-Edu, 31,5B tokens | MIT | MTP soft contra la propia distribucion del modelo; cabeceras MTP reutilizables para especulacion |
| GPT-2 (124M/355M) | 124M-355M | 1024 | WebText, ~40 GB | Licencia modificada MIT (OpenAI) | Transformer NTP clasico, mismo tokenizador; sin MTP |
| Pythia-160M (EleutherAI) | 162M | 2048 | The Pile, ~300B tokens | Apache 2.0 | NTP estandar, suite de checkpoints intermedios para estudio de entrenamiento |
| TinyLlama-1.1B | 1,1B | 2048 | ~3T tokens | Apache 2.0 | NTP estandar, mucho mayor y con mejor rendimiento general |

Nota: los checkpoints hermanos del mismo articulo (los otros once, con distintos objetivos y tamanos) son los comparables mas directos, aunque no se listan sus IDs en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por RLHF/DPO ni fine-tuning por instrucciones, por lo que no sigue instrucciones de forma fiable y puede generar texto incoherente u ofensivo.
- Riesgo de alucinacion alto, tipico de modelos base pequenos entrenados solo con preentrenamiento.
- Entrenado exclusivamente en ingles: el rendimiento en otros idiomas, incluido el castellano, no esta garantizado y probablemente sea pobre.
- Contexto limitado a 2048 tokens.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo arbitrario del repo; revisar los ficheros de modelado antes de usarlo en entornos sensibles.
- No hay tokenizador incluido: hay que cargar el tokenizador stock de GPT-2 por separado.
- Las cabeceras MTP son auxiliares y se descartan en despliegue estandar; usarlas para especulacion requiere implementacion adicional.
- Licencia MIT: sin restricciones para uso comercial, pero al ser un modelo de investigacion sin benchmarks publicados ni validacion en produccion, no se recomienda para aplicaciones criticas sin evaluacion propia previa.
- Unica ejecucion con una sola semilla: los resultados pueden variar entre runs, algo que el propio autor documenta al compartir semilla entre checkpoints para comparabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/soft-mtp-167m-model
- Articulo (arXiv): https://arxiv.org/abs/2610.38331
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
