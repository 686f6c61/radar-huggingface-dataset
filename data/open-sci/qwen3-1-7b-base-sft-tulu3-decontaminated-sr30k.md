# open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-sr30k` es un ajuste fino (SFT) de la familia Qwen3, en su variante Base de 1.700 millones de parametros. Lo publica el colectivo open-sci sobre un checkpoint intermedio de Ali Elganzory (`ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated`), que a su vez parte de Qwen3-1.7B-Base. El entrenamiento se ha realizado con LLaMA-Factory en modo full fine-tuning (no LoRA) sobre un dataset de razonamiento derivado de gpt-oss-120b, lo que sugiere un interes en modelos pequenos con capacidad de razonamiento destilada.

La relevancia de este checkpoint es doble: por un lado, explora si un modelo de 1.7B puede absorber trazas de razonamiento de un modelo mucho mayor (gpt-oss-120b) mediante SFT; por otro, forma parte de un linaje de modelos "decontaminated" que intenta evitar filtraciones de benchmarks en los datos de entrenamiento. El nombre `sr30k` apunta a un subconjunto de 30.000 ejemplos del dataset Superior-Reasoning-SFT.

Se trata de un modelo de investigacion, no de un producto listo para produccion. La model card es auto-generada y carece de secciones de uso previsto, limitaciones o evaluacion, por lo que la mayor parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), no disponible el detalle exacto de capas/heads |
| Parametros totales | 1.720.050.688 (1,72B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene safetensors en precision completa (FP32/BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Qwen3) |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 en su variante Base de 1,7B parametros. No es un MoE ni un modelo hibrido: es denso. El ajuste se ha realizado con LLaMA-Factory 0.9.x sobre Transformers 4.57.3 y PyTorch 2.10.0+cu128, en modo full fine-tuning (tag `full`), lo que implica actualizar todos los pesos y no solo adaptadores.

Los hiperparametros documentados son: learning rate 4e-5, batch total 128 (batch 1 x 32 GPUs x 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0,9, 0,999) y epsilon 1e-8, semilla 42. El dataset es `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf_thinking_preprocessed`, es decir, trazas de razonamiento (thinking) generadas por gpt-oss-120b y preprocesadas. No se documenta el numero de tokens totales ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta formateado para dialogos multi-turno.
- Razonamiento con modo thinking: el dataset de entrenamiento contiene trazas de razonamiento preprocesadas, por lo que el modelo esta expuesto a cadenas de pensamiento.
- Destilacion de razonamiento: al entrenarse sobre salidas de gpt-oss-120b, puede reproducir patrones de razonamiento de un modelo mucho mayor.
- Compatibilidad con TGI y endpoints: el tag `text-generation-inference` y `endpoints_compatible` indica que puede servirse con la infraestructura estandar de HuggingFace.
- Tool calling / function calling: no documentado.
- Capacidades de agente: no documentadas.
- Capacidades multilingues: no documentadas (los idiomas figuran como no disponibles).
- Vision, audio: no soportados (es un modelo de texto).

## Casos de uso

- Investigacion en destilacion de razonamiento: usar el modelo como sujeto de estudio para medir cuanto razonamiento de un modelo de 120B puede absorber un modelo de 1,7B mediante SFT puro. Es adecuado porque el checkpoint esta entrenado exactamente sobre ese dataset.
- Experimentos de decontaminacion de benchmarks: comparar este checkpoint con su antecesor no decontaminado para evaluar el impacto de la limpieza de datos en tareas de razonamiento.
- Prototipado de asistentes conversacionales ligeros: el tag `conversational` y su tamano permiten desplegarlo en una sola GPU consumer para pruebas de concepto de dialogo.
- Generacion de cadenas de pensamiento sinteticas: usar el modelo para producir trazas de razonamiento a bajo coste, que luego se filtren o se usen como datos de entrenamiento para modelos aun mas pequenos.
- Fine-tuning posterior como base: al ser un checkpoint intermedio de un linaje de SFT, sirve como punto de partida para ajustes especificos de dominio sin partir de Qwen3-1.7B-Base.
- Evaluacion de pipelines de LLaMA-Factory: el repo documenta la configuracion completa (32 GPUs, AdamW fused, cosine), lo que lo hace util como referencia reproducible de entrenamiento full a esa escala.
- Servicio con TGI en entornos con VRAM limitada: 1,72B parametros caben en GPUs de 8-16 GB en cuantizacion de 8 o 4 bits, aunque la cuantizacion no esta publicada en el repo.

## Benchmarks y rendimiento

La model card incluye un `model-index` con la entrada `sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__models-ali-elganzor__fa2-qwen3-steps`, pero la lista `results` esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, unos 6-8 GB. En cuantizacion de 8 bits, unos 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, A10). Para cuantizacion de 4 bits, cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas.
- Opciones de despliegue: transformers (libreria declarada), TGI (tag `text-generation-inference`), y por compatibilidad con safetensors, tambien vLLM y llama.cpp tras conversion a GGUF (aunque no se publica GGUF oficial).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-sr30k | 1,72B | no disponible | other | HuggingFace |
| ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated (modelo base) | 1,72B | no disponible | other | HuggingFace |
| Qwen3-1.7B-Base (ancestro) | 1,72B | no disponible en esta ficha | Apache 2.0 (Qwen3) | HuggingFace |
| gpt-oss-120b (modelo profesor del dataset) | 120B (MoE) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Model card auto-generada: las secciones de uso previsto, limitaciones y datos de evaluacion estan sin completar ("More information needed").
- Licencia `other`: no se especifican los terminos exactos; hay que remitirse a la licencia del modelo base Qwen3 y del checkpoint intermedio antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de 1,7B entrenados sobre trazas de razonamiento destiladas; no hay evaluacion que lo cuantifique.
- Sesgos: no documentados. El dataset proviene de gpt-oss-120b, por lo que puede heredar sesgos de ese modelo.
- Contexto e idiomas: no documentados; no se debe asumir soporte multilingue ni una ventana de contexto concreta.
- Dataset de razonamiento sintetico: el entrenamiento sobre salidas de un modelo mayor puede producir trazas de razonamiento plausibles pero incorrectas, y el modelo puede reproducir ese estilo sin garantia de correccion.
- Uso en produccion: no recomendado sin evaluacion propia; es un checkpoint de investigacion con 178 descargas y 0 likes en el momento de la consulta.
- Sin cuantizaciones oficiales: no se publican GGUF ni AWQ/GPTQ, por lo que el despliegue eficiente requiere conversion manual.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated
- Familia Qwen3 (ancestro): no disponible en la informacion proporcionada
- Dataset de entrenamiento: `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf_thinking_preprocessed` (ruta local en la model card; no se proporciona enlace publico)
- LLaMA-Factory: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
