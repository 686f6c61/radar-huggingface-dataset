# open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-nc30k

## Resumen

SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-nc30k es un ajuste fino supervisado (SFT) de tipo *full fine-tuning* sobre el modelo ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated, que a su vez deriva de la familia SmolLM2 de Hugging Face. Lo publica la organizacion open-sci y esta entrenado con LLaMA-Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 muestras en formato ShareGPT orientado a conversacion y seguimiento de instrucciones.

El modelo conserva la arquitectura transformer decoder-only de SmolLM2 con 1.711.507.456 parametros (aproximadamente 1,7 mil millones) y una ventana de contexto extendida a 16.384 tokens, segun indica el nombre del modelo base. El repositorio ocupa 3,4 GB en formato safetensors y esta pensado para inferencia con transformers y text-generation-inference.

Su relevancia es acotada pero concreta: se trata de un modelo pequeno, desplegable en hardware de consumo, que anade una etapa de SFT sobre un checkpoint que ya habia pasado por DPO. Resulta util como banco de pruebas para experimentos de alineamiento en cascada (DPO seguido de SFT) y para tareas conversacionales ligeras donde el coste de inferencia es critico. No obstante, la documentacion del autor es practicamente inexistente y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2) |
| Parametros totales | 1.711.507.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (segun nombre del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior a 8 y 4 bits via herramientas estandar) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; requiere consulta directa) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2, un transformer decoder-only con atencion por causalidad estandar, disenado por Hugging Face para el rango de 1,7 mil millones de parametros. El checkpoint parte de ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated, que incorpora una etapa de DPO sobre datos de Tulu 3 con filtrado de contaminacion y una extension de contexto a 16k. Sobre esa base, open-sci aplica un ajuste fino supervisado completo (no LoRA) con LLaMA-Factory.

Los hiperparametros documentados son: learning rate de 4e-5 con scheduler coseno y warmup del 10 %, batch total de 128 (batch por dispositivo 1, acumulacion de gradientes 4, 32 dispositivos), 5 epocas, semilla 42 y optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. El dataset es Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 ejemplos conversacionales en formato ShareGPT; no se documenta su composicion tematica ni si hubo etapas adicionales de RLHF o DPO posteriores al SFT. No se menciona ninguna innovacion arquitectonica propia: el modelo reutiliza la atencion estandar de SmolLM2.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (heredado del pipeline de Tulu 3 y del SFT sobre ShareGPT).
- Seguimiento de instrucciones en tareas de formato y respuesta estructurada, segun el dataset ShareGPT empleado.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano del modelo.
- Generacion de codigo de complejidad baja a media, sin garantias de calidad en tareas largas.
- Capacidad multilingue: no documentada; SmolLM2 base tiene cobertura parcial de varios idiomas, pero el ajuste puede haberla desplazado hacia el ingles.
- Tool calling / function calling: no documentado explicitamente; el formato ShareGPT no garantiza soporte nativo de llamadas a herramientas.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede mantener dialogos multi-turno dentro de una ventana de 16k tokens, lo que permite incluir historial extenso o documentos de referencia en el prompt sin truncamiento agresivo.
- Experimentacion academica con pipelines de alineamiento: sirve para estudiar el efecto de un SFT adicional sobre un checkpoint ya sometido a DPO, comparando comportamientos antes y despues del ajuste.
- Inferencia en hardware de consumo: con 1,7 mil millones de parametros, cabe en GPUs de gama media (8-12 GB en FP16) y en cuantizacion de 4 bits en equipos con 4-6 GB de VRAM, lo que lo hace util para demos locales.
- Generacion de respuestas en entornos con latencia estricta: su tamano reducido permite throughput alto en vLLM o TGI, adecuado para clasificacion de texto, resumenes cortos o reescritura.
- Base para fine-tuning especifico de dominio: al ser un modelo pequeno y con licencia permisiva-condicionada, puede servir como punto de partida para ajustes LoRA en tareas verticales (soporte, extraccion de datos).
- Evaluacion de tecnicas de decontaminacion: al provenir de un linaje con filtrado de contaminacion, es util como referencia en estudios sobre fuga de datos de benchmark en modelos pequenos.
- Generacion de codigo asistida en editores ligeros: puede completar funciones cortas o explicar fragmentos, aunque sin garantias de correccion en proyectos grandes.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con el nombre `sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__SmolLM2-1-7-84b86450__sdpa-smollm2-s-f20ed510`, pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB de pesos, con posibilidad de ejecucion en GPUs de 4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para throughput alto; A100 o H100 solo si se busca maxima concurrencia con vLLM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas en FP16, y en 4 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama tras conversion a GGUF; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-nc30k | 1,71 B | 16k | other | Hugging Face, 189 descargas | SFT sobre checkpoint DPO; sin benchmarks |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71 B | 8k (ampliable) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32k | Apache 2.0 | Hugging Face | Mejor soporte multilingue y de tool calling documentado |
| Llama-3.2-1B-Instruct | 1,24 B | 128k | Llama 3.2 Community License | Hugging Face | Contexto muy superior, con restricciones de uso comercial |

## Limitaciones y advertencias

- La model card es auto-generada y no documenta usos previstos, limitaciones ni datos de evaluacion; la ausencia de benchmarks impide verificar la calidad real del ajuste.
- Riesgo elevado de alucinacion: con 1,7 mil millones de parametros, el conocimiento factual es limitado y las respuestas pueden ser plausibles pero incorrectas.
- Idiomas soportados no documentados; el ajuste sobre ShareGPT puede haber reducido la competencia multilingue respecto al modelo base.
- Licencia "other": es imprescindible revisar los terminos del modelo base (ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated) y de SmolLM2 antes de cualquier uso comercial.
- El nombre del modelo incluye "decontaminated" en el linaje, pero no se aporta evidencia del proceso de decontaminacion ni de su eficacia.
- El SFT de 5 epocas sobre 30.000 muestras con batch 128 puede inducir sobreajuste al estilo del dataset; no se reportan curvas de validacion.
- Sin soporte documentado de tool calling ni de modo de razonamiento explicito; no debe asumirse en produccion.
- El identificador interno del entrenamiento (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__...`) sugiere un experimento de investigacion mas que un modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- TGI (text-generation-inference): https://github.com/huggingface/text-generation-inference
- vLLM: https://github.com/vllm-project/vllm
