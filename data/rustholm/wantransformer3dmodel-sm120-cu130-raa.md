# rustholm/WanTransformer3DModel-sm120-cu130-raa

## Resumen

Este repositorio no es un modelo nuevo en sí mismo, sino un artefacto de compilación "ahead-of-time" (AoT) del transformador del modelo de vídeo Wan2.2 I2V (imagen a vídeo) de 14B parámetros activos de Alibaba (Wan-AI). El usuario `rustholm` ha publicado una réplica del repositorio original de `cbensimon`, generado automáticamente mediante un HF Job, que contiene binarios precompilados de PyTorch del `WanTransformer3DModel`. El objetivo es eliminar la necesidad de ejecutar `torch.compile` en tiempo de ejecución, reduciendo drásticamente los tiempos de arranque y acelerando la inferencia.

El modelo base es Wan2.2-I2V-A14B, un modelo de difusión para generación de vídeo a partir de imágenes que utiliza una arquitectura de doble transformador (high-noise y low-noise, `transformer` y `transformer_2`) dentro del pipeline `WanImageToVideoPipeline` de la librería `diffusers` de Hugging Face. La relevancia de este artefacto reside en la optimización para hardware NVIDIA Blackwell (RTX PRO 6000) con CUDA 13.0 y PyTorch 2.12, y en su compatibilidad con ZeroGPU de Hugging Face Spaces.

Según la model card, la compilación AoT aporta una aceleración medida de **1.53x** en la generación de vídeo (de 193,05 segundos a 125,85 segundos en la muestra de prueba), manteniendo la calidad visual del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WanTransformer3DModel (transformador de difusión 3D para vídeo, pipeline imagen-a-vídeo) |
| Parametros totales | ~14B activos por transformador (Wan2.2-I2V-A14B); total exacto no disponible |
| Parametros activos | 14B (denominación "A14B" del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos base), Float8 dinámico (activaciones y pesos, vía torchao), INT8 para text encoder (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Binarios PyTorch precompilados AoT (no safetensors estándar); el modelo base usa safetensors en Diffusers |

## Arquitectura y entrenamiento

El artefacto corresponde al `WanTransformer3DModel`, el componente de denoising del pipeline Wan2.2 Image-to-Video. Wan2.2-I2V-A14B emplea una estrategia de doble experto temporal: dos transformadores especializados en distintas fases del proceso de difusión (ruido alto y ruido bajo), que se alternan durante el muestreo. El scheduler utilizado es `FlowMatchEulerDiscreteScheduler` con un shift de 8.0. El pipeline completo incluye además un text encoder (cuantizado a 8 bits con bitsandbytes) y componentes adicionales del pipeline de diffusers.

Este repositorio en particular no contiene pesos entrenables nuevos: es el resultado de compilar el módulo con `torch.compile` en modo ahead-of-time sobre PyTorch 2.12.0+cu130, CUDA 13.0 y una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition, en Ubuntu 22.04 con Python 3.10. La compilación aplica cuantización Float8 dinámica (`Float8DynamicActivationFloat8WeightConfig` de torchao) sobre los bloques del transformador. No procede describir datos de entrenamiento, ya que el artefacto no modifica los pesos del modelo original.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), heredada del pipeline Wan2.2-I2V-A14B.
- Arranque rápido sin compilación JIT: los binarios AoT eliminan la espera de `torch.compile` en el primer uso.
- Aceleración de inferencia medida de 1.53x respecto a la ejecución sin compilar, según las muestras de la model card.
- Compatibilidad con ZeroGPU de Hugging Face Spaces, lo que permite desplegar demos sin gestión de infraestructura.
- Cuantización Float8 integrada en el binario compilado para reducir coste computacional en GPUs modernas.
- Reproducibilidad total: el repositorio incluye el fichero `job.py` para regenerar o personalizar la compilación mediante HF Jobs o Docker.

## Casos de uso

- Despliegue de demos de generación de vídeo en Hugging Face Spaces con ZeroGPU: el binario AoT reduce el cold start y la latencia por petición, algo crítico en entornos con GPU compartida y tiempos de sesión limitados.
- Servicios de imagen a vídeo en producción: la aceleración de 1.53x reduce el coste por vídeo generado en pipelines de pago por uso (por ejemplo, animación de productos para e-commerce a partir de fotografías de catálogo).
- Animación de contenido creativo: estudios o creadores pueden convertir ilustraciones o fotogramas clave en clips de vídeo breves usando el pipeline WanImageToVideoPipeline con los dos transformadores especializados.
- Optimización de inferencia en GPUs Blackwell: equipos con acceso a RTX PRO 6000 o hardware NVIDIA de última generación pueden aprovechar los binarios compilados específicamente para CUDA 13.0 y la arquitectura sm_120.
- Investigación en optimización de modelos de difusión: el repositorio sirve como ejemplo reproducible (mediante `job.py`) de cómo compilar y cuantizar transformadores de vídeo con torchao y AOTInductor.
- Prototipado rápido de aplicaciones de vídeo generativo: al eliminarse la compilación en tiempo de ejecución, los ciclos de desarrollo y prueba del pipeline completo se acortan de forma notable.
- Batch processing de vídeos: la reducción del tiempo por muestra (de unos 193 a unos 126 segundos en la muestra oficial) permite procesar lotes mayores en ventanas de tiempo equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable al tratarse de un artefacto de compilación de un modelo de difusión de vídeo.

La única métrica publicada es la comparación de la muestra de vídeo generada antes y después de la compilación:

| Métrica | Antes de compilar | Después de compilar |
|---|---|---|
| Tiempo de generación (muestra) | 193,05 s | 125,85 s |
| Speedup | — | 1,53x |

La propia model card advierte que esta cifra puede no reflejar siempre la ganancia real de rendimiento.

## Requisitos de hardware

- La compilación se realizó sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition (arquitectura sm_120), por lo que los binarios están orientados a esa GPU; la compatibilidad con otras arquitecturas no está garantizada ni documentada.
- El modelo base Wan2.2-I2V-A14B en bf16 con cuantización Float8 en los transformadores y text encoder en INT8 requiere una cantidad de VRAM elevada; no se publica una cifra exacta, pero los modelos de vídeo de 14B parámetros suelen necesitar del orden de decenas de GB de VRAM (no disponible el dato concreto).
- No cabe en GPUs consumer convencionales según la información disponible; el job de referencia usa el flavor `rtx-6000` de HF Jobs.
- Despliegue: mediante `spaces.aoti_load` en Hugging Face Spaces (ZeroGPU), mediante HF Jobs (`hf jobs uv run job.py --flavor rtx-6000`), o localmente con Docker usando la imagen `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` (el entorno de compilación reporta PyTorch 2.12.0+cu130).
- Latencia y throughput: la muestra oficial indica 125,85 segundos por vídeo tras la compilación (frente a 193,05 s sin compilar); no hay más medidas de throughput.

## Comparativa con modelos similares

No existen artefactos directamente comparables publicados con métricas homogéneas. Como referencia contextual:

| Modelo / artefacto | Tipo | Parametros | Formato | Particularidad |
|---|---|---|---|---|
| rustholm/WanTransformer3DModel-sm120-cu130-raa | Binario AoT del transformador Wan2.2 I2V | 14B activos | PyTorch AoT precompilado | Speedup 1,53x, sin torch.compile en runtime, orientado a Blackwell/CUDA 13 |
| cbensimon/WanTransformer3DModel-sm120-cu130-raa | Repositorio AoT original del que deriva este | 14B activos | PyTorch AoT precompilado | Artefacto fuente generado por HF Job |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | Modelo base en Diffusers | 14B activos (doble transformador) | safetensors | Requiere torch.compile manual para optimizaciones equivalentes |

## Limitaciones y advertencias

- No es un modelo entrenado nuevo: es un binario de despliegue; cualquier limitación del Wan2.2-I2V-A14B original (alucinaciones visuales, artefactos en movimientos complejos, coherencia temporal limitada) se hereda íntegramente.
- Los binarios están compilados para una arquitectura GPU concreta (sm_120, Blackwell) y una versión específica de PyTorch/CUDA (2.12.0+cu130); su portabilidad a otras GPUs o versiones no está documentada y probablemente no funcione sin recompilar.
- La licencia del repositorio no está declarada; debe consultarse la licencia del modelo base Wan-AI/Wan2.2-I2V-A14B (Apache 2.0 según el repositorio oficial de Wan-AI, aunque conviene verificarlo) antes de cualquier uso comercial.
- El speedup de 1,53x procede de una única muestra y la propia model card advierte que puede no reflejar la ganancia real en otros escenarios.
- El repositorio tiene 0 descargas y 0 likes, y parece una réplica del artefacto de `cbensimon`; no hay evidencia de mantenimiento activo ni de validación por terceros.
- La cuantización Float8 puede introducir pequeñas degradaciones de calidad no cuantificadas en la model card; las muestras antes/después son la única referencia visual disponible.
- El tamaño del repo aparece como 0,0 GB en los metadatos, lo que dificulta estimar el peso real del artefacto; conviene verificar el contenido antes de descargar.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/rustholm/WanTransformer3DModel-sm120-cu130-raa
- Repositorio original referenciado en la model card: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Modelo base en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos bf16 del transformador referenciados: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Documentación de HF Jobs (configuración de variables de entorno): https://hf.co/docs/hub/en/jobs-configuration
- Librería diffusers: https://github.com/huggingface/diffusers
- torchao (cuantización Float8): https://github.com/pytorch/ao
