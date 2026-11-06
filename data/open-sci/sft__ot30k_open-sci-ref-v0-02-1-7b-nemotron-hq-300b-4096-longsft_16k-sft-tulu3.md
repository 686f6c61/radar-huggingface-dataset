# open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3

## Resumen

El modelo `open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3` es un checkpoint de ajuste supervisado (SFT) publicado por la organizacion open-sci, con 1.714.377.728 parametros (aproximadamente 1,7 mil millones) y un tamano de repositorio de 3,4 GB en formato safetensors. Se trata de un modelo derivado de la familia Nemotron (segun el identificador del nombre) afinado mediante la libreria Llama Factory sobre un subconjunto de 30.000 muestras del dataset Open Thoughts, con una longitud de secuencia de 16k tokens.

El modelo esta etiquetado como `feature-extraction` en el pipeline de Hugging Face y como `generated_from_trainer`, lo que indica que su model card fue generada automaticamente por el Trainer de Transformers y no ha sido revisada ni completada por el autor. La informacion disponible es muy limitada: la model card no describe usos previstos, limitaciones, datos de evaluacion ni resultados de benchmarks, y la busqueda web no aporta documentacion adicional sobre este checkpoint concreto.

Su relevancia actual es principalmente como artefacto de investigacion dentro de un esfuerzo de alineacion y ajuste supervisado sobre datos de razonamiento (Open Thoughts). No obstante, la ausencia de documentacion tecnica, de resultados de evaluacion y de una licencia clara (figura como "other") limita seriamente su uso en produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Nemotron, segun el identificador del modelo) |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (deducido del sufijo `longsft_16k` y del identificador; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Libreria | transformers (compatible con llama-factory) |
| Tamano del repositorio | 3,4 GB |
| Dataset de entrenamiento | open-thoughts_open_thoughts3-1.2_m_30000_samples (30.000 muestras) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. El identificador incluye la referencia `nemotron`, lo que sugiere que parte de un checkpoint de la familia Nemotron de NVIDIA, pero no se confirma en la documentacion disponible. El pipeline declarado es `feature-extraction`, lo que resulta atipico para un modelo afinado con SFT orientado a generacion, y probablemente refleja una configuracion por defecto del Trainer mas que un uso real previsto.

El entrenamiento se realizo con Llama Factory en modo `full` (ajuste completo de parametros, no LoRA) sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, un subconjunto de 30.000 muestras de Open Thoughts. Los hiperparametros documentados son: learning rate de 4e-05, batch total de 128 (batch de 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, 5 epocas completas y semilla 42. El entrenamiento se ejecuto en 32 GPUs en configuracion multi-GPU. No se documenta el numero total de tokens procesados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autoregresiva: el modelo es un transformer causal afinado con SFT, por lo que puede generar texto libre, aunque la model card no documenta capacidades especificas.
- Razonamiento y cadenas de pensamiento: el dataset Open Thoughts esta orientado a datos de razonamiento, por lo que es plausible que el ajuste haya reforzado este tipo de comportamiento, aunque no hay evaluacion que lo confirme.
- Codigo y matematicas: no hay evidencia documentada de rendimiento en estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.
- Extraccion de caracteristicas: el pipeline declarado es `feature-extraction`, aunque no hay documentacion que describa el uso previsto en este modo.

## Casos de uso

- Investigacion en alineacion y SFT: el checkpoint sirve como punto de partida reproducible para estudiar el efecto del ajuste supervisado sobre 30.000 muestras de Open Thoughts con hiperparametros documentados (lr 4e-05, 5 epocas, batch 128). Es adecuado porque el entrenamiento esta completamente especificado y puede replicarse.
- Experimentos de destilacion o fine-tuning posterior: al ser un modelo de 1,7 B, cabe en una sola GPU de 24 GB en precision completa y permite iterar rapidamente en experimentos de ajuste con LoRA o QLoRA sobre el checkpoint.
- Generacion de datos sinteticos de razonamiento: un modelo afinado sobre Open Thoughts puede emplearse para producir trazas de razonamiento candidatas que luego se filtren y se usen en pipelines de destilacion, siempre con validacion humana.
- Baseline en evaluaciones internas: util como referencia de un SFT de 1,7 B entrenado con Llama Factory para comparar contra otros checkpoints de la misma familia en tareas de razonamiento.
- Prototipado de asistentes conversacionales de bajo coste: con 1,7 B de parametros y contexto de hasta 16k, puede desplegarse en hardware modesto para pruebas de concepto de chatbots, asumiendo que la calidad no esta validada.
- Estudio de robustez y sesgos en modelos pequenos: permite analizar como un SFT sobre datos de razonamiento afecta a comportamientos de alucinacion o sesgo en modelos de escala reducida.

## Benchmarks y rendimiento

La model card incluye una entrada de `model-index` con el nombre `sft__f679a5c592c8dffb__open-sci-re-77ccae92__sdpa-open-sci-steps` pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas cache KV; en la practica, unos 6-8 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB para pesos; en 4 bits, alrededor de 1 GB para pesos (estimaciones teoricas, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente para inferencia en BF16; para entrenamiento completo se necesitan varias GPU de datacenter (el autor uso 32 dispositivos).
- Cabe en GPU consumer: si, en todas las GPU con 8 GB o mas en BF16 y en GPU con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada); llama.cpp, Ollama, vLLM o TGI requeririan conversion a GGUF o configuracion adicional, no documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (open-sci SFT 1.7B) | 1,7 B | 16k (deducido) | other | Hugging Face, 23 descargas | Checkpoint SFT sin evaluacion publicada |
| Qwen2.5-1.5B | 1,5 B | 32k | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base con benchmarks publicados |
| Llama 3.2-1B | 1,2 B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base con benchmarks publicados |
| SmolLM2-1.7B | 1,7 B | 8k | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base con benchmarks publicados |

La comparacion es estructural: los modelos alternativos cuentan con model cards completas, evaluaciones publicadas y licencias claras, mientras que este checkpoint carece de esos elementos. No se dispone de datos de rendimiento comparables para este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni resultados de validacion, ni metricas de perdida reportadas en la model card.
- Model card generada automaticamente y sin revisar: el autor no ha documentado usos previstos, limitaciones ni datos de evaluacion.
- Licencia "other" sin terminos especificados: no queda claro si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: al ser un modelo de 1,7 B afinado sobre datos de razonamiento sin evaluacion posterior, la probabilidad de generar contenido incorrecto con apariencia de rigor es alta.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Contexto de 16k deducido del nombre del checkpoint, no confirmado en la model card; podria diferir del contexto real soportado.
- Pipeline declarado como `feature-extraction`, lo que puede requerir ajustes manuales de configuracion para usarlo como modelo generativo.
- Entrenado con 5 epocas sobre 30.000 muestras: posible sobreajuste al dataset, sin datos de validacion que lo descarten.
- Sin garantias de mantenimiento: 23 descargas y 0 likes indican un artefacto de investigacion sin comunidad activa.
- No apto para produccion sin una evaluacion independiente exhaustiva en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3
- Dataset Open Thoughts (referenciado en la model card): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
