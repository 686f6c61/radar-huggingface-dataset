# electroglyph/LFM2.5-24B-A2B-uncensored-AutoRound-W4A16-G64

## Resumen

LFM2.5-24B-A2B-uncensored-AutoRound-W4A16-G64 es una cuantizacion de 4 bits del modelo electroglyph/LFM2.5-24B-A2B-uncensored, un ajuste fino sin censura de la familia LFM2.5 de Liquid AI. La cuantizacion la ha realizado el usuario electroglyph usando Intel AutoRound con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), group_size 64 y cuantizacion simetrica. El resultado es un checkpoint de aproximadamente 12,9 GB que reduce de forma sustancial el espacio de almacenamiento y los requisitos de VRAM frente al modelo base en bf16.

El modelo pertenece a la arquitectura lfm2_moe (mixture of experts) y, segun los metadatos de safetensors, contiene 3.438.829.184 parametros totales, un dato que no concuerda con el nombre comercial "24B-A2B" del modelo base. Esta discrepancia debe tenerse en cuenta: no hay informacion publicada que explique la diferencia entre el nombre y el recuento real de parametros del checkpoint cuantizado.

La relevancia practica de esta ficha es doble. Por un lado, documenta una receta reproducible de cuantizacion AutoRound W4A16 lista para servir con vLLM o Transformers. Por otro, advierte de que se trata de un modelo derivado sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados, lo que limita su uso en produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (mixture of experts, segun tag del repositorio) |
| Parametros totales | 3.438.829.184 (segun safetensors; el nombre del modelo base indica "24B-A2B") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `--max-model-len 4096`) |
| Tipos de cuantizacion | W4A16, 4 bits, group_size 64, simetrica (AutoRound) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato auto_round) |
| Tamano del repositorio | 12,9 GB |
| Herramienta de cuantizacion | Intel AutoRound (`scheme="W4A16"`, `format="auto_round"`) |
| Calibracion | HuggingFaceH4/ultrachat_200k (384 muestras) + nvidia/OpenCodeInstruct (128 muestras); nsamples=512, seqlen=2048, iters=1000 |
| Modelo base | electroglyph/LFM2.5-24B-A2B-uncensored |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un modelo entrenado desde cero. La arquitectura subyacente corresponde al tag `lfm2_moe` del repositorio, es decir, un transformer con mezcla de expertos de la familia LFM2.5 de Liquid AI, aunque no se detalla en la informacion disponible el numero de expertos, el tamano de cada uno ni el mecanismo de enrutamiento. El nombre del modelo base sugiere 24B de parametros totales y 2B activos por token, pero el recuento real de safetensors del checkpoint cuantizado es de 3.438.829.184 parametros, una cifra que no se corresponde con ninguna de las dos y que no viene explicada en la model card.

El proceso de cuantizacion usa Intel AutoRound con SignRound real sobre datos de calibracion, no cuantizacion round-to-nearest. La calibracion combina 384 muestras de ultrachat_200k con 128 de OpenCodeInstruct, con secuencia de 2048 tokens, 1000 iteraciones, batch de 16, `model_dtype` bf16, `enable_torch_compile` activado y semilla 42. El ajuste fino "uncensored" del modelo base no viene documentado en la informacion disponible: se desconoce que dataset se uso, si hubo RLHF, DPO o simplemente un fine-tuning supervisado con datos sin filtros de seguridad.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el pipeline `text-generation` y la tag `conversational`.
- Razonamiento y generacion de codigo: la calibracion incluye OpenCodeInstruct, lo que sugiere que el modelo base esta orientado tambien a tareas de programacion, aunque no se publican evaluaciones.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Modo thinking, vision o audio: no disponible.
- Comportamiento sin censura: el nombre del modelo base indica un ajuste para reducir rechazos, pero no se documenta el alcance ni los criterios aplicados.

## Casos de uso

- Despliegue de un asistente conversacional autoalojado: el checkpoint cuantizado ocupa 12,9 GB y puede servirse con vLLM usando `--gpu-memory-utilization 0.8`, lo que permite montar un endpoint de chat en una unica GPU de 24 GB o superior sin necesidad de infraestructura multi-GPU.
- Experimentacion con modelos sin censura en entornos controlados: util para investigadores que estudian el comportamiento de modelos con filtros de seguridad reducidos, siempre que se apliquen salvaguardas externas y se respete la legislacion aplicable.
- Generacion de codigo en pipelines internos: la inclusion de OpenCodeInstruct en la calibracion sugiere cierta familiaridad con codigo, aunque conviene validar la calidad real antes de integrarlo en CI/CD.
- Prototipado rapido con Transformers: la model card incluye un ejemplo directo con `AutoModelForCausalLM` y `device_map="auto"`, lo que facilita probar el modelo en notebooks o scripts sin configuracion adicional.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica de AutoRound W4A16 con group_size 64 frente a otras recetas (GPTQ, AWQ, RTN) sobre el mismo modelo base.
- Fine-tuning adicional sobre un checkpoint ya cuantizado: no recomendado en general, pero el formato auto_round es compatible con transformers, lo que permite al menos inspeccionar pesos y activaciones en tareas de analisis.
- Servicio de bajo coste en produccion interna: el menor footprint frente a bf16 reduce el coste por instancia, aunque la ausencia de benchmarks obliga a medir latencia y calidad antes de comprometerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,9 GB; con overhead de runtime y cache KV, un despliegue en vLLM con `--gpu-memory-utilization 0.8` encaja en GPUs de 24 GB (RTX 4090, L4, A10G) y con holgura en A100 40/80 GB y H100.
- GPU recomendadas: NVIDIA A100, H100, L40S para produccion; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB el margen es ajustado y depende de la longitud de contexto configurada.
- Opciones de despliegue: vLLM con soporte nativo de Intel Quantization (W4A16 weight-only, sin flag `--quantization`), y Transformers instalando `auto-round` para registrar el formato.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electroglyph/LFM2.5-24B-A2B-uncensored-AutoRound-W4A16-G64 | 3.438.829.184 (segun safetensors) | no disponible | W4A16 AutoRound, G64 | no disponible | Hugging Face |
| electroglyph/LFM2.5-24B-A2B-uncensored (base) | no disponible | no disponible | bf16 | no disponible | Hugging Face |
| Modelos LFM2.5 oficiales de Liquid AI | no disponible en esta busqueda | no disponible | varias | no disponible en esta busqueda | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria; la informacion proporcionada no incluye benchmarks ni especificaciones detalladas de los modelos oficiales de la familia LFM2.5.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("24B-A2B") y el recuento real de parametros del checkpoint cuantizado (3.438.829.184): conviene verificar el modelo base antes de asumir capacidades o requisitos.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un bloqueante para produccion hasta aclararlo con el autor.
- Modelo "uncensored": puede generar contenido sensible, ofensivo o ilegal segun el contexto; requiere moderacion externa y cumplimiento normativo (por ejemplo, AI Act en la UE).
- Sin idiomas declarados: se desconoce el soporte real de castellano y de otras lenguas.
- Sin documentacion sobre sesgos, datos de entrenamiento ni proceso de alineamiento del fine-tuning uncensored.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones, no se puede estimar la tasa de errores facticos.
- Contexto maximo no documentado: el ejemplo de vLLM limita a 4096 tokens, pero no se confirma cual es el maximo real del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- La cuantizacion W4A16 puede degradar ligeramente la calidad frente al bf16 original; no se publica una comparacion cuantitativa de esa perdida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-AutoRound-W4A16-G64
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Documentacion de vLLM sobre soporte de cuantizacion Intel: https://docs.vllm.ai/en/stable/features/quantization/inc/
- Dataset de calibracion ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
