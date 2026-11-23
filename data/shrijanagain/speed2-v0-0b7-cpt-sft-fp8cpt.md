# Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt

## Resumen

SPEED2-V0-0B7-CPT-SFT-fp8cpt es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por el usuario Shrijanagain en Hugging Face. Se trata de un checkpoint resultado de un entrenamiento continuado (continued pretraining) sobre el dataset `Shrijanagain/Speed-5B-mX-parquet`, partiendo de un modelo base del mismo autor. El nombre del modelo sugiere una variante de aproximadamente 0,7B de parametros totales (0B7), aunque el dato real de safetensors confirma 746.280.448 parametros.

El modelo emplea una politica de precision mixta durante el entrenamiento con GEMMs en fp8 E4M3 (solo en GPUs sm89 o superiores), manteniendo embeddings, router y normalizaciones en bf16/fp16. Los pesos se guardan de vuelta en fp16, por lo que el checkpoint es ejecutable en cualquier dispositivo, siendo el fp8 unicamente una optimizacion de entrenamiento. Requiere `trust_remote_code=True` para su carga.

Su relevancia actual es limitada pero interesante como caso de estudio: un modelo pequeno de tipo MoE entrenado con tecnicas de cuantizacion fp8 en entrenamiento, con un volumen de descargas moderado (1.782) y escasa documentacion publica. La model card es extremadamente parca y no especifica licencia, idiomas ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles no disponibles) |
| Parametros totales | 746.280.448 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | fp8 E4M3 (entrenamiento), fp16/bf16 (pesos almacenados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Mixture of Experts con atencion transformer estandar y expertos compartidos (shared experts), segun se deduce de la politica de precision que menciona explicitamente `q/k/v/o`, `expert gate/up/down` y `shared experts`. No se dispone de informacion sobre el numero de expertos, el numero de expertos activos por token ni la dimension oculta. El checkpoint se entreno con secuencias de 2048 tokens, micro batch de 1 y acumulacion de gradiente de 16, sobre una sola GPU con DDP, alcanzando 36.000 pasos y 1.179.648.000 tokens vistos.

La innovacion tecnica destacable es el uso de GEMMs en fp8 E4M3 para las proyecciones de atencion y los expertos, manteniendo los momentos del optimizador en fp32 y los embeddings, router y RMSNorm en bf16/fp16. El learning rate fue de 5e-05 con 100 pasos de warmup y weight decay de 0,1. Los pesos se revierten a fp16 al guardar, de modo que el checkpoint es portable a cualquier hardware. No se documenta el uso de RLHF, DPO ni datos de composicion del dataset de entrenamiento mas alla del nombre del parquet.

## Capacidades

- Generacion de texto autoregresiva en formato transformers.
- Razonamiento y generacion de codigo: no confirmado explicitamente, pero plausible en un modelo de texto entrenado con continued pretraining.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el sufijo `mX` del dataset podria sugerir multilingue, pero no se confirma).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Carga mediante `trust_remote_code=True`, lo que implica codigo personalizado en el repo.

## Casos de uso

- Experimentacion en investigacion sobre MoE de baja escala: el modelo, con 746M de parametros, es adecuado para estudiar el comportamiento de arquitecturas MoE y tecnicas de entrenamiento en fp8 sin requerir grandes clusters.
- Fine-tuning especifico de dominio: al ser un modelo pequeno con contexto de 2048 tokens, puede ajustarse en una sola GPU consumer para tareas de clasificacion o generacion acotada.
- Generacion de texto en entornos con recursos limitados: su tamano permite desplegarlo en GPUs de gama media para prototipos de chatbots o asistentes simples.
- Reproduccion de pipelines de continued pretraining: sirve como referencia para validar recetas de entrenamiento con precision mixta fp8/fp16 y acumulacion de gradiente.
- Educacion y divulgacion: util para demostrar el funcionamiento interno de un MoE con expertos compartidos y router en un entorno controlado.
- Base para comparativas de eficiencia: permite medir throughput y latencia de un MoE pequeno frente a modelos densos de tamano similar en tareas de generacion corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp16 (746M parametros x 2 bytes) mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son validas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna consumer con 4 GB o mas.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp si se genera GGUF (no confirmado), vLLM (soporte MoE variable), TGI (soporte MoE variable). Ollama requeriria conversion a GGUF.
- Latencia y throughput estimados: no disponibles; al ser un MoE pequeno, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPEED2-V0-0B7-CPT-SFT-fp8cpt | 746M | 2048 | no disponible | Hugging Face |
| Modelos MoE pequenos comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria. El ecosistema de MoE de menos de 1B de parametros es reducido y no se han identificado modelos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no se documentan datos de entrenamiento, composicion del dataset, sesgos ni evaluaciones.
- Riesgo de alucinacion elevado al no existir informacion sobre alineamiento (RLHF/DPO) ni evaluaciones de calidad.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue adecuado.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; auditar el codigo antes de usarlo en entornos sensibles.
- El checkpoint es un resultado de continued pretraining sin SFT confirmado (el sufijo SFT aparece en el nombre pero no se detalla en la model card); la calidad conversacional no esta garantizada.
- El uso de fp8 en entrenamiento no afecta a la inferencia (pesos en fp16), pero el modelo puede heredar inestabilidades del proceso de entrenamiento en precision reducida.

## Enlaces

- Hugging Face: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Dataset de continued pretraining: https://huggingface.co/datasets/Shrijanagain/Speed-5B-mX-parquet
- Modelo base: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt (referenciado como base_model en la model card)
