# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-nc30k

## Resumen

open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-nc30k es un ajuste fino supervisado (SFT) de un modelo base de 1.700 millones de parametros desarrollado por el colectivo open-sci. El modelo parte de la referencia `ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated`, que segun su nombre ha sido entrenado con 1,4 billones de tokens de FineWeb-Edu, con una fase de SFT de contexto largo (16k), DPO y datos de Tulu3 decontaminados. Este checkpoint concreto anade una etapa adicional de SFT sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf.

El modelo se publica como un experimento de referencia reproducible dentro del ecosistema open-sci, orientado a la investigacion sobre recetas de entrenamiento y no tanto a un producto final. La model card es autocontenida y generada automaticamente por el Trainer de Hugging Face, sin descripcion de uso previsto ni evaluacion. El pipeline declarado en el Hub es `feature-extraction`, aunque la arquitectura subyacente es un transformer decoder-only de la familia Llama, segun se deduce de la libreria y del tamaño.

Con 1.714.377.728 parametros reales y un repositorio de 3,4 GB en safetensors, es un modelo pequeño que puede ejecutarse en hardware de consumo. Su relevancia es principalmente metodologica: documenta una cadena completa de preentrenamiento, SFT de contexto largo, DPO y SFT final sobre datos tipo ShareGPT, con hiperparametros de entrenamiento distribuido en 32 dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, inferida del tag `llama-factory` y del tamaño); no confirmada en la model card |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el nombre del modelo base; 16k en la fase SFT (`longsft_16k`); valor final no confirmado |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la model card. Por el nombre del modelo base y el tag `llama-factory`, se trata de un transformer decoder-only de aproximadamente 1,7B parametros, preentrenado sobre 1,4 billones de tokens de FineWeb-Edu con una longitud de contexto de 4096. El nombre del checkpoint base indica que la receta incluye SFT de contexto largo (16k), una fase de DPO y datos de Tulu3 decontaminados, lo que sugiere un pipeline de alineacion en varias etapas.

Este checkpoint concreto aplica un SFT adicional sobre el dataset `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf`, con los siguientes hiperparametros: learning rate 4e-5, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42. El entrenamiento se realizo con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones tecnicas adicionales ni detalles sobre la composicion final del dataset de SFT.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo decoder-only de 1,7B parametros.
- Ajuste especifico para seguir instrucciones y conversaciones multi-turno, segun el formato ShareGPT del dataset de SFT.
- Razonamiento basico y generacion de codigo, esperable por el preentrenamiento en FineWeb-Edu y el paso por datos de Tulu3, aunque no hay evaluacion publicada que lo confirme.
- Capacidad de extraccion de caracteristicas (pipeline declarado en el Hub: `feature-extraction`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre recetas de SFT: el modelo sirve como referencia reproducible para estudiar el efecto de una etapa adicional de SFT ShareGPT sobre un base ya sometido a DPO, con hiperparametros documentados.
- Extraccion de embeddings y caracteristicas: al declararse con pipeline `feature-extraction`, puede usarse para obtener representaciones de texto en tareas de clasificacion o recuperacion, aunque sin evaluacion publicada.
- Generacion de texto asistida en local: con 1,7B parametros y pesos safetensors, es viable en GPU de consumo para prototipos de generacion y chatbots sencillos.
- Fine-tuning posterior: su tamaño reducido y su licencia permisiva (a confirmar, `other`) lo hacen adecuado como punto de partida para ajustes especificos de dominio en un solo nodo.
- Experimentos de alineacion: la cadena SFT + DPO + SFT final permite comparar etapas y aislar el impacto de cada una en tareas de instruccion.
- Evaluacion comparativa de modelos pequeños: util como baseline de 1,7B en estudios academicos de escalado y decontaminacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__open-sci-re-cfcc8751__sdpa-open-sci-steps`) pero con la lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, cerca de 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); A100 o H100 no son necesarias salvo para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y superiores, asi como en Apple Silicon con memoria unificada.
- Opciones de despliegue: Transformers con PyTorch; llama.cpp u Ollama requeririan conversion a GGUF (no se publican pesos GGUF); vLLM y TGI son compatibles en principio con arquitecturas Llama, pero no estan verificados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-nc30k (este) | 1,71B | 4096 / 16k segun etapa | other | Hugging Face |
| Modelo base `ali-elganzory/open-sci-ref-v0.02-1.7b-...` | 1,71B | 4096 / 16k | no disponible | Hugging Face |
| Alternativas de 1-2B (Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | 1-2B | 8k-128k | licencias abiertas especificas | Hugging Face |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparativa se limita a parametros, contexto y licencia. Las alternativas comerciales de 1-2B tienen contextos notablemente mayores y evaluaciones publicadas, pero no son directamente comparables sin benchmarks del modelo open-sci.

## Limitaciones y advertencias

- La model card esta generada automaticamente y carece de descripcion de uso previsto, datos de evaluacion y limitaciones declaradas por el autor.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- Riesgo de alucinacion inherente a un modelo de 1,7B sin evaluacion de fidelidad.
- Sesgos desconocidos: no se documenta la composicion del dataset de SFT ni filtros de sesgo.
- La licencia es `other`; es imprescindible revisar los terminos exactos antes de cualquier uso comercial.
- El pipeline declarado (`feature-extraction`) no coincide con el uso conversacional esperado; conviene verificar la configuracion de generacion.
- El contexto final no esta confirmado: el nombre indica 4096 en el base y 16k en la fase SFT, pero no se especifica el maximo efectivo tras el SFT final.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversion manual.
- Modelo con 17 descargas y 0 likes: sin validacion de la comunidad ni informes de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
