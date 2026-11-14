# Ria564/WanTransformer3DModel-sm120-cu130-raa

## Resumen

`Ria564/WanTransformer3DModel-sm120-cu130-raa` no es un modelo de lenguaje, sino un artefacto de compilación anticipada (ahead-of-time, AoT) del transformer de difusión de vídeo Wan 2.2 I2V A14B. El repositorio contiene binarios precompilados del módulo `WanTransformer3DModel` de la librería `diffusers`, generados mediante un HF Job reproducible, con el objetivo de eliminar la necesidad de ejecutar `torch.compile` en tiempo de carga y reducir la latencia de arranque en entornos de inferencia.

El artefacto está pensado para integrarse en el pipeline `WanImageToVideoPipeline` de Wan-AI/Wan2.2-I2V-A14B-Diffusers, sustituyendo la carga estándar del transformer por una carga AoT a través de `spaces.aoti_load`. Según la model card, la compilación se realizó sobre PyTorch 2.12.0+cu130 en una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition, con cuantización Float8 (dinámica en activaciones, Float8 en pesos) aplicada a los bloques del transformer y del transformer secundario.

Es relevante ahora porque los modelos de generación de vídeo de gran tamaño (Wan 2.2 I2V A14B) tienen costes de compilación y arranque elevados en producción. Un artefacto AoT permite desplegar el modelo con tiempos de inicio predecibles y compatibilidad con ZeroGPU, aunque el propio autor advierte de que la ganancia de velocidad no siempre refleja el rendimiento real en todos los entornos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión (WanTransformer3DModel, diffusers) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Float8DynamicActivationFloat8Weight (torchao); text encoder en 8-bit (bitsandbytes) en el pipeline de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios precompilados AoT para PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto corresponde al transformer de difusión de Wan 2.2 I2V A14B, un modelo de generación de vídeo imagen-a-vídeo. La arquitectura es un transformer 3D (`WanTransformer3DModel`) que procesa latentes espacio-temporales; el pipeline de referencia emplea dos instancias del transformer (`transformer` y `transformer_2`), un scheduler `FlowMatchEulerDiscreteScheduler` con `shift=8.0` y un text encoder cuantizado a 8 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card se limita a describir el proceso de compilación.

La innovación técnica del repositorio no está en el modelo en sí, sino en el proceso AoT: se precompilan los binarios del módulo para evitar `torch.compile` en tiempo de ejecución, se aplica cuantización Float8 a los bloques del transformer y se empaqueta todo como artefacto reproducible de un HF Job. El job se ejecutó con la imagen `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` (aunque el entorno reportado es PyTorch 2.12.0+cu130) sobre un flavor `rtx-6000`, y el propio autor indica que la reproducibilidad y personalización se realizan descargando `job.py` y relanzándolo con `hf jobs uv run`.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante el pipeline Wan 2.2 I2V.
- Inferencia con cuantización Float8 en los bloques del transformer para reducir huella de memoria y aumentar throughput.
- Carga AoT con `spaces.aoti_load`, compatible con ZeroGPU.
- Integración con `diffusers` mediante `WanImageToVideoPipeline` y `WanTransformer3DModel`.
- Soporte de cuantización del text encoder con bitsandbytes (8-bit) en el ejemplo del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al tratarse de un modelo de difusión de vídeo.

## Casos de uso

- Despliegue de generación de vídeo imagen-a-vídeo en Spaces con ZeroGPU: el artefacto AoT evita la compilación en el arranque y reduce el tiempo hasta la primera inferencia, lo que encaja con el límite de tiempo de ejecución de ZeroGPU.
- Servicio de inferencia de vídeo de baja latencia de arranque: al precargar los binarios compilados, un endpoint que se escala horizontalmente puede arrancar más rápido que con `torch.compile` en caliente.
- Prototipado reproducible en investigación: el `job.py` descargable permite regenerar el artefacto con otro flavor o imagen, útil para comparar configuraciones de compilación.
- Pipelines de creación de contenido con entrada de imagen fija: animación de fotografías o ilustraciones para vídeo corto, usando el pipeline I2V con el transformer precompilado.
- Evaluación comparativa de cuantización Float8 frente a bf16: el ejemplo del autor aplica `Float8DynamicActivationFloat8WeightConfig` a los bloques, lo que permite medir el impacto en calidad y velocidad.
- Integración en flujos de CI/CD de modelos: al ser un artefacto reproducible de un HF Job, se puede versionar y validar la compilación como parte del pipeline de publicación.

## Benchmarks y rendimiento

La model card incluye una comparación de tiempos de generación antes y después de la compilación, no benchmarks de calidad del modelo:

| Métrica | Antes de compilación | Después de compilación |
|---|---|---|
| Tiempo de generación de muestra | 193,05 s | 125,85 s |
| Speedup reportado | — | 1,53x |

El autor advierte explícitamente de que esta cifra "might not always reflect actual performance gain". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pipeline de referencia carga dos transformers en bf16 y luego aplica cuantización Float8 a los bloques, lo que reduce la huella respecto a bf16 puro.
- GPU empleada en la compilación: NVIDIA RTX PRO 6000 Blackwell Server Edition (flavor `rtx-6000`).
- Compatibilidad con GPU de consumo: no confirmada; el artefacto está compilado para `sm120` (Blackwell) y CUDA 13.0, por lo que no es portable a arquitecturas anteriores sin recompilar.
- Opciones de despliegue: `diffusers` con `spaces.aoti_load` (ZeroGPU), ejecución local con Docker y `hf jobs uv run`.
- Latencia y throughput: única referencia de 193,05 s a 125,85 s por muestra en el entorno de compilación; no hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ria564/WanTransformer3DModel-sm120-cu130-raa | Artefacto AoT del transformer Wan 2.2 I2V A14B | no disponible | no disponible | no disponible | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | Modelo base de difusión vídeo I2V | no disponible | no disponible | no disponible | Hugging Face |
| cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers | Pesos bf16 del transformer Wan 2.2 I2V A14B | no disponible | no disponible | no disponible | Hugging Face |
| cbensimon/WanTransformer3DModel-sm120-cu130-raa | Artefacto AoT referenciado en el ejemplo del autor | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada; la comparativa se limita a la función de cada artefacto dentro del ecosistema Wan 2.2.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo, sino binarios precompilados; no es utilizable de forma autónoma sin el pipeline y los pesos base de Wan 2.2 I2V A14B.
- El artefacto está compilado para `sm120` (Blackwell) y CUDA 13.0; no es portable a GPUs Ampere, Ada u Hopper sin recompilar.
- La licencia no está declarada en la información disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse en el modelo base Wan-AI.
- El autor advierte de que el speedup de 1,53x puede no reflejar el rendimiento real en todos los entornos.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni restricciones de contenido del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14), por lo que no hay evidencia de uso en producción.
- El tamaño del repo es 0,0 GB según los metadatos, lo que puede indicar que los binarios no están efectivamente alojados o que la información está incompleta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ria564/WanTransformer3DModel-sm120-cu130-raa
- Modelo base Wan 2.2 I2V A14B (diffusers): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos bf16 referenciados en el ejemplo: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Artefacto AoT referenciado en el ejemplo: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Documentación de HF Jobs: https://hf.co/docs/hub/en/jobs-configuration
- Documentación de ZeroGPU y `spaces.aoti_load`: no disponible en la información proporcionada
