# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp64

## Resumen

Celerity 271M 8K — TPP ablation — ad0.8_ild_tpp64 es un checkpoint de la familia Celerity, un modelo de lenguaje de 271 millones de parametros entrenado por Cerebras y convertido al formato de Hugging Face. Se trata de un experimento de ablacion centrado en el regimen de tokens por parametro (TPP) y en un calendario de dropout de atencion dependiente de la capa con valor final 0,8. El modelo emplea una longitud maxima de secuencia de 8192 tokens y embeddings posicionales de tipo ALiBi.

El checkpoint procede de un entrenamiento sobre 17 331 093 504 tokens (aproximadamente 17,3 mil millones) del dataset CommonPile, en su variante "corrected no-repeat TPP pool", a lo largo de 27 837 pasos con un batch global de 76. El objetivo nominal era de 64 tokens por parametro. La tasa de aprendizaje pico fue de 0,15 y se utilizaron 3 sistemas CSX de Cerebras.

Por su naturaleza, es un artefacto de investigacion mas que un modelo de produccion: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y requiere `trust_remote_code=True` para cargarse. Su interes radica en documentar el efecto del dropout de atencion escalado por capa y del regimen TPP en modelos pequenos de contexto largo, no en ofrecer un asistente listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Celerity, segun model card; detalles internos no disponibles) |
| Parametros totales | 271 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con codigo personalizado (`trust_remote_code=True`); no se indica safetensors ni GGUF |
| Embeddings posicionales | ALiBi |
| Tokens de entrenamiento | 17 331 093 504 |
| Tokens por parametro (nominal) | 64 |
| Pasos de entrenamiento | 27 837 |
| Batch global | 76 |
| Learning rate pico | 0,15 |
| Weight decay | 0,0024550812491833866 |
| tau_ema | 0,09754846551842832 |
| Dropout de atencion (extremo) | 0,8, con escalado lineal por capa |
| Dropout residual | 0,0 |
| Stochastic depth | 0,0 |
| LayerDrop | 0,0 |
| Dataset | CommonPile, variante "corrected no-repeat TPP pool" |
| Runtime de origen | cbcore 2.6.0 |
| Sistemas de entrenamiento | 3 x CSX (Cerebras) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint Celerity entrenado en Cerebras y convertido a Hugging Face. No se detalla la arquitectura interna mas alla de los hiperparametros de entrenamiento: se sabe que usa ALiBi como esquema de embeddings posicionales, lo que permite extrapolar a secuencias de hasta 8192 tokens sin embeddings posicionales aprendidos, y que no emplea dropout residual, stochastic depth ni LayerDrop.

El aspecto diferencial del experimento es el dropout de atencion. El valor 0,8 no es una probabilidad uniforme, sino el extremo de un calendario lineal dependiente de la capa (`ad0.8_ild_tpp64`: attention dropout 0,8, layer-dependent, TPP 64). Es decir, distintas capas reciben tasas de dropout distintas a lo largo de una progresion lineal que termina en 0,8. El entrenamiento uso 17,3 mil millones de tokens de CommonPile (pool corregido sin repeticiones) con un objetivo nominal de 64 tokens por parametro, learning rate pico de 0,15, weight decay de 0,002455 y un EMA con tau de 0,0975. No se menciona RLHF, DPO ni fases de alineacion posteriores: es un modelo base.

## Capacidades

- Generacion de texto autoregresiva como modelo base; no se documentan capacidades especificas mas alla de la modelizacion del lenguaje.
- Contexto largo de hasta 8192 tokens gracias a ALiBi.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- No se documentan modos especiales (thinking, vision, audio) ni capacidades multimodales.
- El dropout de atencion se desactiva con `model.eval()`, por lo que la inferencia ordinaria no lo aplica.

## Casos de uso

- Investigacion sobre dropout de atencion: reproduccion y analisis del efecto de un calendario de dropout dependiente de la capa con extremo 0,8 en un transformer de 271M, comparando contra checkpoints de la misma serie de ablacion.
- Estudios de escalado TPP: el checkpoint permite analizar como un regimen nominal de 64 tokens por parametro afecta a la perplejidad y a la calidad de generacion en modelos pequenos.
- Experimentos con ALiBi y contexto largo: util para evaluar el comportamiento en secuencias cercanas a 8192 tokens frente a alternativas con embeddings posicionales aprendidos.
- Base para fine-tuning academico: al ser un modelo de 271M, puede ajustarse en una unica GPU consumer para tareas de clasificacion, resumen o generacion de dominio especifico, partiendo de un preentrenamiento sobre CommonPile.
- Reproducibilidad de pipelines Cerebras: sirve como referencia para validar el conversor (commit `0e3d5d3...`) y el runtime cbcore 2.6.0 en la conversion de checkpoints `.mdl` a Hugging Face.
- Analisis de dataset: permite estudiar el impacto del pool CommonPile "corrected no-repeat" en la calidad del modelo frente a otras variantes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271M x 4 bytes), mas activaciones y cache KV para 8192 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos; en int8, unos 0,27 GB; en int4, unos 0,14 GB (estimaciones teoricas a partir del numero de parametros, no verificadas para este checkpoint).
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB), asi como en GPUs de datacenter (A100, H100) sin necesidad de ellas.
- Opciones de despliegue: al requerir `trust_remote_code=True` y pesos PyTorch con codigo personalizado, la integracion con vLLM, llama.cpp, Ollama o TGI no esta garantizada; no se documenta soporte para estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este checkpoint) | 271M | 8192 | no disponible | Hugging Face, requiere `trust_remote_code` |
| Otros checkpoints de la serie Celerity (ablaciones TPP) | 271M (segun nomenclatura) | 8192 (segun nomenclatura) | no disponible | Hugging Face |
| Modelos base de ~270M con contexto largo | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas, por lo que la comparativa se limita a parametros y contexto declarados.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo alineado: no ha pasado por RLHF ni DPO, por lo que puede producir contenido sesgado, toxico o factualmente incorrecto.
- Riesgo elevado de alucinacion inherente a un modelo base de 271M entrenado con 17,3 mil millones de tokens.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion.
- No se declaran idiomas soportados; el dataset CommonPile es mayoritariamente ingles, pero no hay confirmacion en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; conviene auditar el codigo antes de cargarlo.
- El dropout de atencion con extremo 0,8 debe desactivarse con `model.eval()`; usarlo en modo entrenamiento altera la salida de forma sustancial.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia (2026-11-27), lo que sugiere que no ha sido validado por la comunidad.
- No hay informacion sobre cuantizaciones disponibles ni sobre compatibilidad con motores de inferencia estandar.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp64
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
