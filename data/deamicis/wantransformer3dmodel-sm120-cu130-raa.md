# deamicis/WanTransformer3DModel-sm120-cu130-raa

## Resumen

Este repositorio no contiene un modelo entrenado, sino un artefacto de compilación ahead-of-time (AoT) del transformer de un modelo de difusión de vídeo: `WanTransformer3DModel`, el componente de denoising de Wan2.2-I2V-A14B, desarrollado originalmente por Wan-AI (Alibaba). El artefacto lo publica el usuario de Hugging Face `deamicis` como reproducción de un HF Job, y su estructura y contenido remiten al repositorio de referencia `cbensimon/WanTransformer3DModel-sm120-cu130-raa`: binarios de PyTorch precompilados que se cargan con `spaces.aoti_load` en lugar de compilarse con `torch.compile` en tiempo de ejecución.

El problema que resuelve es operativo: eliminar el coste de compilación en el arranque de la pipeline, reducir la latencia de la primera generación y habilitar el despliegue en entornos con GPU efímera (ZeroGPU en Spaces). El binario está compilado específicamente para arquitectura `sm120` (Blackwell) y CUDA 13.0, sobre PyTorch 2.12.0+cu130, por lo que no es portable a otras GPU.

La relevancia es acotada pero clara para quien despliegue Wan2.2: la pipeline de referencia combina dos módulos transformer (`transformer` y `transformer_2`, correspondientes a los dos expertos MoE de Wan2.2), cuantiza los bloques a FP8 dinámico con torchao, el text encoder a int8 con bitsandbytes, y fija el scheduler `FlowMatchEulerDiscreteScheduler` con `shift=8.0`. El job documenta una aceleración de 1,53x en la generación de un clip de muestra (193,05 s a 125,85 s), medida sobre una RTX PRO 6000 Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (`WanTransformer3DModel`) del modelo base Wan2.2-I2V-A14B, con dos módulos transformer independientes (dos expertos, ruido alto y ruido bajo) y scheduler de flow matching (`FlowMatchEulerDiscreteScheduler`, `shift=8.0`). El repositorio es un artefacto AoT de PyTorch, no un modelo con pesos nuevos |
| Parametros totales | no disponible en la información proporcionada (la nomenclatura del modelo base es A14B) |
| Parametros activos | no disponible en la información proporcionada (el sufijo A14B del modelo base sugiere 14 000 millones de parámetros activos; no confirmado en esta ficha) |
| Longitud de contexto | no disponible. No aplica en el sentido de un LLM: la ventana relevante es el número de fotogramas latentes y la resolución del vídeo, no una secuencia de tokens de texto |
| Tipos de cuantizacion | Pesos base en bf16; FP8 dinámico con torchao (`Float8DynamicActivationFloat8WeightConfig`) aplicado a los bloques de ambos transformers; int8 con bitsandbytes (`load_in_8bit`) para el text encoder. El binario AoT está fijado a `sm120` + CUDA 13.0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Binarios precompilados AoT cargados mediante `spaces.aoti_load` (no safetensors). Los pesos fuente en bf16 residen en `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers`, subcarpetas `transformer` y `transformer_2` |

## Arquitectura y entrenamiento

El artefacto no entrena nada: empaqueta el grafo del transformer en binarios ejecutables ligados a una arquitectura de GPU concreta. El modelo subyacente es un transformer de difusión que opera sobre latentes de vídeo y genera fotogramas condicionados por una imagen de entrada y un prompt de texto. Wan2.2 emplea un esquema de dos expertos: dos instancias de `WanTransformer3DModel` que se reparten el proceso de denoising según el nivel de ruido, lo que explica que la pipeline instancie `transformer` y `transformer_2` por separado. La formulación de difusión es flow matching, tal como indica el uso de `FlowMatchEulerDiscreteScheduler` con `shift=8.0`.

En cuanto a datos de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO), no hay información disponible en el material proporcionado: este repositorio no documenta el entrenamiento del modelo base, solo el proceso de compilación. Las innovaciones técnicas destacables aquí son de despliegue, no de modelado: compilación AoT con `spaces.aoti_load` (arranque sin `torch.compile`), cuantización FP8 dinámica de activaciones y pesos en los bloques, cuantización int8 del text encoder, y fijación del binario al par `sm120`/CUDA 13.0. El job es reproducible mediante `hf jobs uv run job.py --flavor rtx-6000 --image pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` o con Docker y `--gpus all`.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) condicionada por prompt de texto, mediante `WanImageToVideoPipeline`.
- Denoising en dos etapas gracias a los dos módulos transformer del esquema MoE del modelo base.
- Carga de pesos en bf16 con cuantización opcional a FP8 (bloques) e int8 (text encoder) para reducir huella de memoria.
- Arranque sin compilación en caliente: el binario AoT evita la fase de `torch.compile` y, según el autor del job, habilita compatibilidad con ZeroGPU en Spaces.
- No es un modelo de lenguaje: no hay generación de texto libre, razonamiento, matemáticas, tool calling, function calling ni soporte de agentes multi-paso.
- Capacidades multilingües: no disponible (no se documenta el comportamiento del text encoder ante distintos idiomas).
- Capacidades especiales: ninguna adicional declarada (sin vision-language, sin audio, sin modo thinking).

## Casos de uso

- Despliegue en Hugging Face Spaces con ZeroGPU: el artefacto evita la compilación en cada arranque del Space, lo que reduce el tiempo hasta la primera inferencia y el consumo de la cuota de GPU.
- Generación de vídeo a partir de imagen en productos creativos (storyboards, previsualización de anuncios): se envía una imagen fija más un prompt y se obtiene un clip corto, con la ventaja de que el arranque del servicio es inmediato tras el despliegue.
- Servicios de inferencia con arranque en frío frecuente: en arquitecturas serverless o con escalado a cero sobre GPU Blackwell, el binario precompilado elimina el pico de latencia inicial asociado a `torch.compile`.
- Procesamiento por lotes en GPUs de 96 GB: la combinación de bf16 para los dos expertos, FP8 para los bloques e int8 para el text encoder permite mantener la pipeline completa en una sola RTX PRO 6000 Blackwell, adecuada para colas de trabajos offline.
- Investigación sobre compilación AoT: el repositorio sirve como caso de estudio reproducible para medir la ganancia real de AoT frente a eager y frente a `torch.compile` en modelos de difusión de vídeo.
- Integración en aplicaciones de edición y postproducción: la pipeline de diffusers se puede envolver en un microservicio que reciba imagen y prompt y devuelva el vídeo generado, con el binario AoT como capa de aceleración.
- Reproducción y auditoría de artefactos: al conservarse el `job.py`, un equipo puede regenerar el binario con otro `flavor`, otra imagen de contenedor u otro namespace de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o GSM8K) en la información disponible; no aplican a un modelo de difusión de vídeo. El único dato de rendimiento documentado es la comparativa antes/después de la compilación, generada como parte del propio job:

| Medición | Antes de compilar | Después (AoT) |
|---|---|---|
| Tiempo de generación del clip de muestra | 193,05 s | 125,85 s |
| Aceleración | 1,00x | 1,53x |

El autor advierte explícitamente de que esta cifra «puede no reflejar siempre la ganancia real de rendimiento». La medición se hizo sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition, con CUDA 13.0.48 y driver 595.58.03.

## Requisitos de hardware

- Arquitectura de GPU obligatoria: `sm120` (Blackwell). El binario está compilado para esa arquitectura y CUDA 13.0; no es válido para `sm90` (H100/H200) ni `sm80`/`sm89`.
- GPU empleada en la compilación y validación: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB de VRAM). No se documenta una VRAM mínima oficial.
- Estimación de VRAM (no confirmada, derivada del nombre A14B y de la cuantización del ejemplo): dos expertos en bf16 ocuparían del orden de 28 GB cada uno; con FP8 en los bloques bajaría aproximadamente a la mitad por experto, más el text encoder en int8 y el VAE. Cabe en GPUs profesionales de 80-96 GB y probablemente en configuraciones de 48 GB con cuantización agresiva; no hay datos publicados.
- GPU de consumo: solo modelos Blackwell con compute capability 12.0 (familia RTX 50 y RTX PRO Blackwell). Una RTX 4090 (Ada, `sm89`) no puede cargar este artefacto.
- Entorno de ejecución: PyTorch 2.12.0+cu130 (según el informe del job), Python 3.10, diffusers con `WanImageToVideoPipeline`, torchao, bitsandbytes y `spaces` para `aoti_load`. La imagen usada para reproducir es `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel`.
- Opciones de despliegue: diffusers + `spaces.aoti_load` sobre Spaces o contenedor propio; Docker con `--gpus all`. No aplica a vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: 125,85 s por clip de muestra en el hardware citado; no se publica throughput para lotes ni latencia por fotograma.

## Comparativa con modelos similares

| Repositorio / artefacto | Contenido | Arquitectura objetivo | Formato | Arranque | Licencia |
|---|---|---|---|---|---|
| `deamicis/WanTransformer3DModel-sm120-cu130-raa` (este) | Binario AoT del transformer de Wan2.2-I2V-A14B | `sm120`, CUDA 13.0 | AoT (`spaces.aoti_load`) | Sin `torch.compile` | no disponible |
| `cbensimon/WanTransformer3DModel-sm120-cu130-raa` | Artefacto original del job; mismo contenido declarado | `sm120`, CUDA 13.0 | AoT | Sin `torch.compile` | no disponible |
| `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers` | Pesos bf16 en safetensors del modelo base | Cualquier GPU compatible con el dtype | safetensors | Requiere compilación o ejecución eager | no disponible |
| `Wan-AI/Wan2.2-I2V-A14B-Diffusers` | Pipeline completa original (text encoder, transformer, VAE) | Multi-GPU / multi-arquitectura | safetensors | Ejecución eager o `torch.compile` | no disponible en esta información; verificar en el repositorio original |

Frente a alternativas de la misma categoría funcional (otros modelos image-to-video de código abierto como HunyuanVideo, CogVideoX o LTX-Video), no se dispone en la información proporcionada de datos comparativos de parámetros, resolución, duración de clip ni métricas de calidad, por lo que la comparación cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- El repositorio figura con 0 GB de tamaño, 0 descargas y 0 likes, y su README hace referencia a rutas de `cbensimon` en lugar de a las propias. Antes de usarlo en producción hay que verificar que los binarios existan realmente y que el identificador de repositorio coincida con el artefacto esperado.
- El binario está ligado a `sm120` y CUDA 13.0. Cualquier otra GPU o versión de CUDA provocará fallo de carga; no hay build alternativo en este repositorio.
- La licencia no está declarada. Al tratarse de un derivado de Wan2.2, las condiciones de uso comercial dependen de la licencia del modelo base, que debe consultarse en el repositorio de Wan-AI; no se puede asumir uso comercial libre a partir de esta ficha.
- No es un modelo de lenguaje: no admite chat, tool calling, agentes ni razonamiento textual. Cualquier caso de uso de ese tipo queda fuera de su alcance.
- La cuantización FP8 de bloques e int8 del text encoder puede introducir pérdida de calidad frente a bf16; el autor no publica una evaluación de fidelidad visual comparada.
- La única métrica de rendimiento (1,53x) procede de una muestra y un hardware concretos, y el propio autor advierte de que puede no ser representativa.
- En generación de vídeo, los modos de fallo típicos no son «alucinación» textual sino deriva temporal, artefactos de movimiento e incumplimiento del prompt; no se documentan evaluaciones al respecto en este repositorio.
- No hay información sobre sesgos, cobertura idiomática ni composición del dataset de entrenamiento del modelo base.
- El repositorio no incluye text encoder ni VAE: es solo el transformer, y necesita el resto de la pipeline para funcionar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deamicis/WanTransformer3DModel-sm120-cu130-raa
- Artefacto de referencia del job: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Pesos bf16 del transformer: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Pipeline original de Wan2.2 image-to-video: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Muestra antes de compilar: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa/resolve/main/samples/before/video.mp4
- Muestra después de compilar: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa/resolve/main/samples/after/video.mp4
- Documentación de configuración de HF Jobs: https://hf.co/docs/hub/en/jobs-configuration
- Instalador de la CLI de Hugging Face: https://hf.co/cli/install.sh
- Paper, blog técnico y repositorio de código del modelo base: no disponible en la información proporcionada.
