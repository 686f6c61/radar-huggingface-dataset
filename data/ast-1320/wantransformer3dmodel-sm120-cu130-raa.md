# AST-1320/WanTransformer3DModel-sm120-cu130-raa

## Resumen

AST-1320/WanTransformer3DModel-sm120-cu130-raa es un repositorio de artefacto reproducible publicado en Hugging Face, no un modelo entrenado de forma independiente. Contiene binarios precompilados mediante ahead-of-time (AoT) del transformer del modelo de generacion de video Wan2.2-I2V-A14B, desarrollado originalmente por Wan-AI. El objetivo es eliminar la necesidad de ejecutar `torch.compile` en tiempo de carga, reduciendo la latencia de arranque y habilitando su uso en entornos ZeroGPU de Hugging Face Spaces.

El artefacto se genero con un HF Job sobre una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition, usando PyTorch 2.12.0 con CUDA 13.0 y cuantizacion Float8 (dinamica en activaciones, Float8 en pesos) aplicada a los bloques del transformer. La model card reporta una aceleracion de 1,53x en la generacion de un video de muestra (de 193,05 s a 125,85 s), aunque el propio autor advierte que esta cifra puede no reflejar la ganancia real en produccion.

Es relevante para desarrolladores que despliegan pipelines de generacion de video imagen-a-video con Diffusers y necesitan arranques rapidos y compatibilidad con hardware Blackwell (sm_120) o entornos serverless. No aporta pesos nuevos ni capacidades adicionales: es un contenedor de compilacion optimizado del transformer de Wan2.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (WanTransformer3DModel) del pipeline Wan2.2-I2V-A14B |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Float8 (Float8DynamicActivationFloat8WeightConfig de torchao); text encoder en int8 via BitsAndBytes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios precompilados AoT (artefacto de compilacion); pesos base en bfloat16 en el repo de origen `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers` |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio. Aloja la compilacion AoT del transformer del modelo Wan2.2-I2V-A14B, un modelo de difusion para generacion de video a partir de imagen. El pipeline emplea dos instancias del transformer (`transformer` y `transformer_2`), scheduler `FlowMatchEulerDiscreteScheduler` con `shift=8.0`, y cuantizacion Float8 dinamica aplicada a los bloques de ambos transformers mediante `torchao`. El text encoder se carga en 8 bits con BitsAndBytes.

La innovacion tecnica del artefacto es la compilacion AoT: los binarios se generan una sola vez en un HF Job y se cargan directamente con `spaces.aoti_load`, evitando el coste de `torch.compile` en cada arranque. El entorno de compilacion usa PyTorch 2.12.0+cu130, CUDA 13.0, cuDNN 9 y una GPU RTX PRO 6000 Blackwell (sm_120). No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF/DPO.

## Capacidades

- Generacion de video imagen-a-video (I2V) mediante el pipeline Wan2.2-I2V-A14B de Diffusers.
- Carga acelerada del transformer mediante binarios AoT, sin `torch.compile` en tiempo de ejecucion.
- Compatibilidad con ZeroGPU de Hugging Face Spaces.
- Cuantizacion Float8 del transformer para reducir huella de memoria y acelerar inferencia.
- Integracion con `diffusers` y `spaces.aoti_load` para despliegue en Spaces.
- No se documentan capacidades de texto, razonamiento, codigo, tool calling, agentes ni multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Despliegue de generacion de video I2V en Hugging Face Spaces con ZeroGPU: el artefacto AoT permite arranques rapidos y evita recompilaciones, lo que encaja con el ciclo de vida efimero de los Spaces.
- Prototipado rapido de pipelines de video: al cargar binarios precompilados se reduce el tiempo entre el arranque y la primera generacion, util en entornos de demo e iteracion.
- Servicios serverless de generacion de video: la reduccion de latencia de arranque (reportada de 193,05 s a 125,85 s en la muestra) mejora el tiempo de respuesta en cold starts.
- Investigacion sobre cuantizacion Float8 en difusion 3D: sirve como artefacto reproducible para medir el impacto de `Float8DynamicActivationFloat8WeightConfig` en transformers de video.
- Reproduccion de entornos Blackwell (sm_120) con CUDA 13.0: util para validar pipelines en hardware RTX PRO 6000 con PyTorch 2.12.
- Base para personalizacion: el autor documenta como descargar el `job.py` y reejecutar el HF Job con otra flavor o imagen para regenerar el artefacto con ajustes propios.

## Benchmarks y rendimiento

| Metrica | Antes de compilar | Despues de compilar |
|---|---|---|
| Tiempo de generacion de muestra | 193,05 s | 125,85 s |
| Aceleracion | 1,00x | 1,53x |

El autor advierte que esta cifra puede no reflejar la ganancia real de rendimiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- GPU de compilacion de referencia: NVIDIA RTX PRO 6000 Blackwell Server Edition (sm_120).
- Entorno de ejecucion: PyTorch 2.12.0+cu130, CUDA 13.0, cuDNN 9, Python 3.10.
- VRAM estimada: no disponible de forma explicita; el pipeline base Wan2.2-I2V-A14B en bfloat16 con cuantizacion Float8 e int8 del text encoder requiere hardware de gama alta, no apto para GPUs de consumo con poca VRAM.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en la compilacion); otras GPUs Blackwell sm_120 compatibles.
- Cabe en consumer GPU: no confirmado; el artefacto esta compilado para sm_120 y CUDA 13.0, por lo que la compatibilidad con GPUs consumer no esta garantizada.
- Opciones de despliegue: `diffusers` + `spaces.aoti_load` en Hugging Face Spaces; ejecucion via HF Jobs con `--flavor rtx-6000`; Docker local con `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel`.
- Latencia y throughput: muestra de 125,85 s tras compilacion frente a 193,05 s antes; sin datos adicionales de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST-1320/WanTransformer3DModel-sm120-cu130-raa | Artefacto AoT del transformer Wan2.2-I2V-A14B | no disponible | no disponible | no disponible | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | Modelo base de generacion de video I2V | no disponible | no disponible | no disponible | Hugging Face |
| cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers | Pesos bf16 del transformer para Diffusers | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de generacion de video en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es un artefacto de compilacion; no aporta pesos nuevos ni capacidades adicionales respecto a Wan2.2-I2V-A14B.
- La aceleracion reportada (1,53x) es sobre una unica muestra y el autor advierte que puede no reflejar el rendimiento real en produccion.
- Dependencia estricta de hardware y software: compilado para sm_120 (Blackwell) y CUDA 13.0; puede no funcionar en GPUs Ampere, Ada u otras arquitecturas.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Wan2.2.
- Riesgo de alucinacion y sesgos: no aplica de forma directa al no ser un modelo de lenguaje, pero el modelo base de video puede generar contenido inexacto o sesgado.
- Idiomas: no disponible; el pipeline usa un text encoder, pero no se documentan idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB reportado, lo que sugiere un artefacto en fase inicial o de referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AST-1320/WanTransformer3DModel-sm120-cu130-raa
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos bf16 del transformer: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Repositorio de referencia del artefacto (citado en la model card): https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Documentacion de HF Jobs: https://hf.co/docs/hub/en/jobs-configuration
