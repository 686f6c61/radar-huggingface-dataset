# rayruiyang/GeoUG-ColdStart

## Resumen

GeoUG-ColdStart es el checkpoint de arranque supervisado (cold start) de GeoUG, una familia de modelos orientada al razonamiento espacial y a la generacion de profundidad metrica. Lo publica el autor rayruiyang sobre la arquitectura BAGEL/MoT y constituye la inicializacion SFT (supervised fine-tuning de razonamiento intercalado) a partir de la cual se entrena por refuerzo la politica espacial final, GeoUG-Spatial.

El repositorio no contiene un modelo listo para inferencia generica: son pesos personalizados de BAGEL/MoT que requieren el runtime propio de GeoUG en lugar de una llamada estandar a `AutoModel.from_pretrained`. El paquete incluye pesos EMA en BF16 (`ema.safetensors`, unos 27,21 GiB), pesos del VAE (`ae.safetensors`), configuraciones de LLM y ViT, tokenizer y una transformacion de preprocesado imagen/profundidad con normalizacion de disparidad multiescala.

Su relevancia es de investigacion reproducible: libera el punto de partida exacto del receta de RL espacial, junto con la configuracion de transformacion y un parquet de entrenamiento RL de 800 muestras. El checkpoint corresponde al paso 1500 (EMA) de la ejecucion v6 de SFT de razonamiento intercalado, que parte de la inicializacion v5 en el paso 1000. No incluye los datos de entrenamiento del cold start, cuya publicacion queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL/MoT (Mixture-of-Transformers multimodal: ViT + VAE + LLM) |
| Parametros totales | no disponible (pesos EMA en BF16 de ~27,21 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye unicamente en BF16 original) |
| Idiomas soportados | en |
| Licencia | other (licencia mixta; restricciones CC BY-NC en archivos derivados de BAGEL/DiT) |
| Formato de pesos | safetensors (`ema.safetensors` BF16, `ae.safetensors` VAE) |

## Arquitectura y entrenamiento

GeoUG-ColdStart se apoya en la arquitectura BAGEL/MoT, un diseno multimodal que combina un codificador de vision (ViT), un VAE para la parte generativa y un LLM, con pesos personalizados que no siguen la interfaz estandar de Transformers. El repositorio incluye `vit_config.json`, `llm_config.json`, `config.json` y `generation_config.json`, ademas de los assets de tokenizer (`tokenizer.json`, `vocab.json`, `merges.txt`) y una `transform_config.yaml` que define el preprocesado de imagen y profundidad con normalizacion de disparidad multiescala y los valores `c: [2.0, 8.0, 32.0]`.

El entrenamiento corresponde a una etapa de SFT de razonamiento intercalado (interleaved reasoning): el checkpoint es el EMA del paso 1500 de la ejecucion v6, que arranca desde la inicializacion v5 en el paso 1000. No se detallan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO previas; la fase de RL espacial se aplica despues, dando lugar a GeoUG-Spatial. El cargador de RL usa `ema.safetensors`, coherente con la inicializacion de la receta liberada, y el parquet de entrenamiento incluye imagenes, metadatos de camara y caches de profundidad generada.

## Capacidades

- Razonamiento espacial multimodal sobre imagenes y profundidad, como inicializacion para politicas espaciales.
- Procesamiento de profundidad metrica dentro del pipeline GeoUG (la generacion de profundidad independiente corresponde a GeoUG-Depth).
- Razonamiento intercalado (interleaved reasoning) entrenado mediante SFT supervisado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el modelo es la base para una politica de RL, no el agente final.
- Capacidades multilingues: limitadas a ingles (`en`).
- Capacidad especial: checkpoint de inicializacion para RL, no un modelo de proposito general.

## Casos de uso

- Investigacion en RL para politicas espaciales: usar el checkpoint como inicializacion del entrenamiento por refuerzo descrito en `docs/RL_TRAINING.md`, restaurando el layout con `pack_data_parquet.py unpack-rl` y el parquet de 800 muestras.
- Reproduccion de experimentos: permite replicar la receta de SFT y RL con los identificadores de trazabilidad (v5 paso 1000, v6 paso 1500) y verificar la integridad con `checksums.sha256`.
- Desarrollo de pipelines de profundidad metrica: integrar el checkpoint y la transformacion de disparidad multiescala en flujos propios de estimacion de profundidad junto con GeoUG-Depth.
- Robotica y navegacion: servir como base para politicas que requieran comprender geometria de escena a partir de RGB y profundidad, antes del ajuste especifico de la tarea.
- Generacion de datos sinteticos espaciales: emplear el modelo como punto de partida para producir pares imagen-profundidad en experimentos de aumento de datos.
- Evaluacion comparativa de metodos de RL espacial: usar el cold start como linea base fija frente a GeoUG-Spatial en estudios internos.
- Formacion y docencia: material de referencia para estudiar el paso de SFT a RL en modelos multimodales con arquitectura MoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las puntuaciones de RL reportadas para GeoUG-Spatial no deben atribuirse a GeoUG-ColdStart.

## Requisitos de hardware

- VRAM estimada para inferencia: como minimo los ~27,21 GiB de pesos EMA en BF16, mas el VAE y las activaciones de imagen; en la practica se recomienda 40 GB o mas.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB; para margen comodo, A100 80 GB o H100.
- GPU de consumo: una RTX 4090 de 24 GB no permite cargar los pesos BF16 completos; no se ofrece cuantizacion oficial en este repositorio.
- Opciones de despliegue: runtime propio de GeoUG; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI, y no debe usarse `AutoModel.from_pretrained`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Uso previsto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoUG-ColdStart | Inicializacion SFT para RL espacial | no disponible | no disponible | other (mixta, CC BY-NC parcial) | HuggingFace |
| GeoUG-Spatial | Politica espacial adaptativa final | no disponible | no disponible | other (mixta) | HuggingFace |
| GeoUG-Depth | Generacion de profundidad metrica independiente | no disponible | no disponible | other (mixta) | HuggingFace |
| BAGEL (base) | Modelo multimodal base BAGEL/MoT | no disponible | no disponible | segun BAGEL | repositorio upstream |

No se dispone de datos de parametros, contexto ni rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es el modelo final: es un checkpoint de inicializacion; para uso adaptativo debe emplearse GeoUG-Spatial.
- Los resultados de benchmarks de GeoUG-Spatial no son atribuibles a este checkpoint.
- Los datos de entrenamiento del cold start no estan incluidos y su publicacion esta pendiente.
- Solo soporta ingles (`en`).
- Licencia mixta con restricciones CC BY-NC en archivos derivados de BAGEL/DiT; revisar `LICENSE` y `THIRD_PARTY_NOTICES.md` antes de cualquier uso comercial.
- Requiere el runtime propio de GeoUG; no es compatible con cargadores genericos de Transformers.
- No se ofrecen cuantizaciones, por lo que el despliegue en GPU de consumo queda limitado.
- Riesgo de sesgos y alucinacion no evaluado en la informacion disponible.
- Longitud de contexto y parametros no documentados, lo que dificulta el dimensionamiento en produccion.
- El subconjunto interno de evaluacion RL no se distribuye.

## Enlaces

- HuggingFace: https://huggingface.co/rayruiyang/GeoUG-ColdStart
- Project page: https://yangr116.github.io/geoug-project-page/
- Paper: https://yangr116.github.io/geoug-project-page/assets/geoug-paper.pdf
- Modelo GeoUG-Spatial: https://huggingface.co/rayruiyang/GeoUG-Spatial
- Modelo GeoUG-Depth: https://huggingface.co/rayruiyang/GeoUG-Depth
- Dataset RL (train_geoug_rl.parquet): https://huggingface.co/datasets/rayruiyang/GeoUG_data/blob/main/train_geoug_rl.parquet
- Documentacion RL: `docs/RL_TRAINING.md` en el checkout de codigo GeoUG
- Contacto: rayyang0116@connect.hku.hk
