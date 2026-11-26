# Adarsh2026/qwen-ml-tuned

## Resumen

`Adarsh2026/qwen-ml-tuned` es un adaptador LoRA publicado en Hugging Face por el usuario Adarsh2026, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa 0,2 GB, un tamano coherente con un adaptador LoRA de rango bajo sobre un modelo de 7 mil millones de parametros.

El modelo hereda la arquitectura y las capacidades del Qwen2.5-7B-Instruct original de Alibaba, un transformer decoder-only denso con 7,6 mil millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072). El fine-tuning se ha realizado con el stack Unsloth, que optimiza el entrenamiento LoRA en terminos de memoria y velocidad, combinado con las librerias TRL y Transformers.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigacion o experimentacion personal con documentacion practicamente inexistente (la model card es la plantilla por defecto de Hugging Face sin rellenar), cero descargas y cero interacciones. Resulta util como ejemplo de pipeline de fine-tuning ligero sobre Qwen2.5 y como recordatorio de que la ausencia de documentacion impide validar cualquier afirmacion sobre el comportamiento del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del base Qwen2.5-7B-Instruct); adaptador LoRA sobre atencion y MLP |
| Parametros totales | 7,6 mil millones en el modelo base; el adaptador LoRA anade una fraccion no especificada (repo de 0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el base Qwen2.5-7B-Instruct (extensible a 131.072 con YaRN); no confirmado para el adaptador |
| Tipos de cuantizacion | El base de referencia esta en bnb-4bit (bitsandbytes NF4); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (el base Qwen2.5 soporta 29 idiomas, incluido el castellano, pero el autor no declara nada) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base `unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm, activacion SwiGLU y atencion con query/key/value bias. El modelo base fue preentrenado por Alibaba con 18 billones de tokens y posteriormente alineado con instrucciones y preferencias. El adaptador en si es un LoRA entrenado con SFT (supervised fine-tuning) usando TRL y Unsloth, sobre el checkpoint ya cuantizado a 4 bits del base.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del adaptador, el alpha, la tasa de aprendizaje ni la composicion de los datos. La model card no documenta hiperparametros ni regimen de precision (fp16, bf16, etc.). Tampoco se indica si hubo etapas de DPO o RLHF posteriores al SFT. La unica referencia tecnica concreta es la version de PEFT utilizada (0.19.1) y la libreria de carga (PEFT). Cualquier afirmacion sobre la calidad o el proposito del ajuste seria especulativa.

## Capacidades

- Generacion de texto conversacional, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo a nivel del modelo base (no verificado tras el ajuste).
- Soporte nativo de tool calling y function calling en Qwen2.5-Instruct; no confirmado si el adaptador lo preserva.
- Capacidad multilingue (29 idiomas en el base), aunque el autor no declara idiomas para el adaptador.
- Posible modo de razonamiento estructurado segun el formato de chat de Qwen2.5; no documentado.
- No se declaran capacidades de vision, audio ni decodificacion especulativa.

## Casos de uso

- Experimentacion con pipelines de fine-tuning LoRA: sirve como referencia de como se publica un adaptador PEFT entrenado con Unsloth y TRL, util para replicar el flujo en entornos de investigacion.
- Evaluacion comparativa de adaptadores: cargar el adaptador sobre el base y medir la deriva respecto al Qwen2.5-7B-Instruct original en tareas controladas (perplejidad, exactitud en QA), dado que el autor no aporta evaluacion.
- Prototipado rapido en local: con el base en 4 bits, el conjunto cabe en una GPU consumer de 16-24 GB, lo que permite probar el adaptador en una RTX 4090 o similar sin infraestructura dedicada.
- Docencia y formacion: ejemplo didactico de artefacto PEFT con model card incompleta, util para ensenar a auditar repositorios antes de usarlos en produccion.
- Pruebas de integracion con PEFT y Transformers: validar la carga de adaptadores sobre checkpoints cuantizados con bitsandbytes en pipelines de CI.
- Base para un ajuste posterior propio: partir del adaptador como inicializacion y continuar el entrenamiento con datos propios documentados, dado que no hay restricciones de licencia declaradas (lo que tambien implica incertidumbre legal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluacion alguna en la model card, y no existen datos que permitan atribuir al adaptador el rendimiento del base Qwen2.5-7B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con el base en 4 bits (bnb NF4) mas el adaptador; en fp16 el base requiere unos 15-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para uso local en 4 bits; A100 40/80 GB o H100 para fp16 y servicio concurrente.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas en cuantizacion 4 bits; en 8 GB requeriria cuantizaciones GGUF del base, no incluidas en este repositorio.
- Opciones de despliegue: Transformers + PEFT (ruta natural), vLLM con soporte de adaptadores LoRA, TGI con adaptadores; llama.cpp y Ollama requeririan fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| Adarsh2026/qwen-ml-tuned | 7,6 B (base) + LoRA | 32.768 (base) | Adaptador PEFT safetensors | No disponible | Practicamente nula |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (131.072 con YaRN) | safetensors, GGUF | Apache 2.0 | Completa, con benchmarks |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | safetensors, GGUF | Apache 2.0 | Completa |
| Meta-Llama-3.1-8B-Instruct | 8,0 B | 131.072 | safetensors, GGUF | Llama 3.1 Community | Completa |

Frente a estos modelos, el adaptador no aporta ventajas verificables: carece de evaluacion, de licencia declarada y de documentacion de uso. Su unico interes es como artefacto de experimentacion.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto; no es posible validar su comportamiento.
- Licencia no declarada: el uso comercial es legalmente incierto, aunque el base Qwen2.5 es Apache 2.0.
- Riesgo de alucinacion y sesgos heredados del base Qwen2.5, sin mitigaciones documentadas tras el ajuste.
- El adaptador puede degradar capacidades del base (olvido catastrofico) si el SFT fue agresivo o con datos de baja calidad; no hay evaluacion que lo descarte.
- Dependencia estricta del checkpoint base exacto (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`); cargarlo sobre otra version puede fallar o dar resultados incorrectos.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Idiomas soportados no declarados; el comportamiento en castellano no esta verificado.
- No apto para produccion sin una evaluacion propia exhaustiva y una revision legal de la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Adarsh2026/qwen-ml-tuned
- Modelo base del adaptador: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Referencia citada en la model card (calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
