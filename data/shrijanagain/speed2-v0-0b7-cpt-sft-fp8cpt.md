# Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt

## Resumen

SPEED2-V0-0B7-CPT-SFT-fp8cpt es un checkpoint de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por el usuario Shrijanagain, publicado en Hugging Face bajo el identificador SPEED2-V0-0B7. Con 746.280.448 parametros totales segun los safetensors del repositorio, se trata de un modelo de escala reducida (etiquetado como 0.7B) orientado a generacion de texto y entrenado mediante un pipeline de preentrenamiento continuado (continued pretraining) seguido de ajuste supervisado (SFT).

El checkpoint documenta una politica de precision mixta poco habitual: pesos de embeddings, router, router_bias y normalizaciones RMSNorm en bf16/fp16, mientras que las GEMMs de atencion (q/k/v/o), de los expertos (gate/up/down) y de los expertos compartidos se ejecutan en fp8 E4M3 en hardware sm89 o superior. Los momentos del optimizador se mantienen en fp32. El entrenamiento se realizo sobre el dataset Shrijanagain/Speed-5B-mX-parquet, con 352.256.000 tokens vistos en el paso 10750, una sola GPU en DDP, longitud de secuencia de 2048 y learning rate de 5e-05.

La relevancia de este modelo es fundamentalmente experimental: ilustra una receta de entrenamiento con GEMMs en fp8 sobre una arquitectura MoE pequena y publica los pesos finales de vuelta en fp16 para que el checkpoint sea ejecutable en cualquier dispositivo. No obstante, la informacion publica es muy limitada: no hay model card sustantiva, no se declaran idiomas, licencia ni resultados de evaluacion, y el propio campo `base_model` apunta al mismo identificador, lo que indica un linaje de entrenamiento autorreferenciado o mal documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, con expertos compartidos; implementacion `speed2` con `custom_code` |
| Parametros totales | 746.280.448 (0,75B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con seq_len 2048) |
| Tipos de cuantizacion | Pesos publicados en fp16; entrenamiento con GEMMs fp8 E4M3 (sm89+) y momentos del optimizador en fp32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tensor type F16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos (MoE), tal como indican las etiquetas del repositorio y la referencia en la model card a expertos `gate/up/down` y a "shared experts". La implementacion se distribuye como codigo personalizado (`custom_code`, libreria `speed2`), por lo que la definicion exacta de capas, numero de expertos, top-k de enrutamiento y dimension del estado oculto no esta documentada en la informacion disponible. El checkpoint base referenciado (`SPEED2-V0-0B7-CPT-SFT`) tiene 0,7B parametros y tipo de tensor F16, coherente con este fine-tune.

El entrenamiento consiste en un continued pretraining sobre el dataset `Shrijanagain/Speed-5B-mX-parquet`, con 352.256.000 tokens procesados en 10.750 pasos, secuencia de 2.048 tokens, micro batch de 1 y acumulacion de gradiente de 16 (batch efectivo de 16 secuencias). Se uso una sola GPU con DDP, learning rate de 5e-05, 100 pasos de warmup y weight decay de 0,1. La innovacion tecnica destacable es la politica de precision: GEMMs de atencion y de expertos en fp8 E4M3 sobre sm89+, manteniendo en bf16/fp16 los embeddings (atados con `lm_head`), el router, su bias y las RMSNorm, y los momentos del optimizador en fp32. Los pesos se guardan de vuelta en fp16, de modo que el fp8 es exclusivamente una optimizacion de entrenamiento y no afecta al despliegue. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`), con pesos en fp16 ejecutables en cualquier dispositivo compatible con transformers.
- Razonamiento y generacion de codigo: no documentados ni evaluados en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el dataset de entrenamiento (`Speed-5B-mX-parquet`) sugiere un corpus multilingue, pero no se especifica cobertura ni calidad por idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Carga mediante `trust_remote_code=True` con la implementacion `speed2` incluida en el repositorio.

## Casos de uso

- Experimentacion con entrenamiento en fp8: el checkpoint sirve como referencia reproducible de una receta de continued pretraining con GEMMs fp8 E4M3 en atencion y expertos, util para equipos que evaluan la viabilidad de fp8 en GPUs sm89+ (Ada Lovelace y posteriores).
- Prototipado de arquitecturas MoE de escala pequena: con 0,75B parametros totales, permite iterar sobre enrutamiento, expertos compartidos y balanceo de carga sin requerir infraestructura de gran escala.
- Fine-tuning posterior sobre dominios concretos: al ser un checkpoint SFT de 0,7B, es viable ajustarlo en una unica GPU consumer para tareas de clasificacion, extraccion o generacion acotada.
- Investigacion sobre linaje y reproducibilidad de checkpoints: util para estudiar practicas de documentacion (o su ausencia) en modelos publicados con `base_model` autorreferenciado y model card minima.
- Generacion de texto de bajo coste en entornos con VRAM limitada: los pesos en fp16 de un modelo de 0,75B caben en GPUs de 4-8 GB, lo que permite desplegarlo en estaciones de trabajo modestas para pruebas de concepto.
- Evaluacion comparativa de politicas de precision: comparar la salida de este checkpoint fp8-entrenado frente a su version en fp16 puro ayuda a medir el impacto del entrenamiento en baja precision sobre la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp16 para los 746M parametros, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto, no documentada). En cuantizacion de 8 bits, en torno a 0,8-1 GB; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU con soporte fp16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100, H100). Para reproducir el entrenamiento con GEMMs fp8 se requiere sm89 o superior (RTX 4090, L40S, H100).
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito por el codigo `speed2`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la presencia de codigo personalizado complica la conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPEED2-V0-0B7-CPT-SFT-fp8cpt | 0,75B | no disponible (entrenado a 2048) | MoE con expertos compartidos, codigo `speed2` | no disponible | Hugging Face, requiere `trust_remote_code` |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Transformer denso | Apache 2.0 | Hugging Face, amplio soporte (vLLM, llama.cpp, Ollama) |
| SmolLM2-360M | 0,36B | 8.192 tokens | Transformer denso | Apache 2.0 | Hugging Face, soporte en llama.cpp y transformers |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Transformer denso | Apache 2.0 | Hugging Face, amplio ecosistema |

La comparativa es estructural: no existen datos de rendimiento publicados para SPEED2-V0-0B7 que permitan contrastar calidad frente a estas alternativas. La diferencia principal radica en la licencia no declarada y en la dependencia de codigo personalizado, frente a la portabilidad de los modelos densos de referencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de calidad, ni comparacion con lineas base, por lo que no es posible estimar su rendimiento real.
- Licencia no disponible: no se puede asumir uso comercial; ante la falta de terminos explicitos, el uso en produccion queda en un limbo legal.
- Idiomas no declarados: se desconoce la cobertura linguistica y la calidad en castellano u otros idiomas.
- Model card practicamente vacia: sin descripcion de arquitectura detallada, numero de expertos, top-k ni contexto maximo soportado.
- `base_model` autorreferenciado: el campo apunta al mismo identificador del modelo, lo que impide reconstruir el linaje de entrenamiento y complica la reproducibilidad.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin evaluacion, el riesgo no esta cuantificado.
- Dependencia de `trust_remote_code=True`: la carga ejecuta codigo personalizado del autor, lo que implica un riesgo de seguridad que debe evaluarse antes de desplegarlo.
- Sesgos desconocidos: el dataset `Speed-5B-mX-parquet` no esta documentado en cuanto a composicion, filtrado ni deduplicacion.
- Escala reducida: con 0,75B parametros totales, las capacidades de razonamiento complejo, matematicas y codigo seran limitadas en comparacion con modelos de mayor tamano.
- El fp8 es solo de entrenamiento: los pesos publicados son fp16, por lo que no se obtiene ninguna ventaja de velocidad en inferencia derivada de la politica fp8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Checkpoint base referenciado: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT
- Variante de entrenamiento diario: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-cpt-daily
- Dataset de continued pretraining: https://huggingface.co/datasets/Shrijanagain/Speed-5B-mX-parquet
