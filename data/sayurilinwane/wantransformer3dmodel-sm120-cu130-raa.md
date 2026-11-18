# sayurilinwane/WanTransformer3DModel-sm120-cu130-raa

## Resumen

`sayurilinwane/WanTransformer3DModel-sm120-cu130-raa` es un repositorio de artefactos de compilación anticipada (AoT, *ahead-of-time*) para el transformer 3D del modelo de generación de vídeo Wan2.2-I2V-A14B, desarrollado originalmente por Wan-AI. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de binarios precompilados de PyTorch que permiten cargar el transformer de Wan sin recurrir a `torch.compile` en tiempo de ejecución, reduciendo el arranque en frío y habilitando su uso en Spaces con ZeroGPU.

El repositorio ha sido generado automáticamente mediante un HF Job y actúa como artefacto reproducible: contiene el resultado de compilar los bloques del transformer con el backend `sm120` (arquitectura Blackwell, RTX PRO 6000) y CUDA 13.0. El pipeline subyacente es Wan2.2-I2V-A14B, un modelo de imagen-a-vídeo con dos transformers (transformer y transformer_2) y cuantización FP8 dinámica en pesos y activaciones.

Es relevante para desarrolladores que despliegan generación de vídeo con difusión en infraestructura NVIDIA Blackwell y quieren evitar el coste de compilación en cada arranque. El autor del repo (`sayurilinwane`) es un reempaquetador del trabajo de `cbensimon`; el modelo base es de Wan-AI. No hay información pública sobre parámetros totales, licencia ni idiomas en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión (WanTransformer3DModel), dos etapas (transformer + transformer_2) |
| Parametros totales | no disponible (corresponde a Wan2.2-I2V-A14B; el sufijo A14B sugiere ~14B, dato no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | FP8 dinámica (Float8DynamicActivationFloat8WeightConfig) sobre los bloques; text encoder en 8-bit vía bitsandbytes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios AoT de PyTorch (artefacto de compilación), cargados vía `spaces.aoti_load`; pesos base en bfloat16 en el repo `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino el resultado de compilar el `WanTransformer3DModel` de Wan2.2-I2V-A14B con `torch.compile` en modo AoT sobre GPU NVIDIA RTX PRO 6000 Blackwell (sm120) y CUDA 13.0, usando PyTorch 2.12.0+cu130. El pipeline completo emplea dos transformers (posiblemente para etapas de alta y baja resolución o para un esquema de dos pasos), un text encoder cuantizado a 8 bits con bitsandbytes, y un scheduler `FlowMatchEulerDiscreteScheduler` configurado con `shift=8.0`.

La innovación técnica no está en el entrenamiento (no se aportan datos sobre tokens, dataset ni RLHF) sino en el empaquetado: el artefacto permite cargar los módulos compilados sin repetir la compilación, lo que según la model card reduce el tiempo de generación de 193,05 s a 125,85 s en el sample de referencia, un speedup de 1,53x. La compilación se realizó con cuantización FP8 dinámica aplicada a los bloques de ambos transformers antes de la captura AoT.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) mediante el pipeline `WanImageToVideoPipeline` de diffusers.
- Carga de transformers precompilados con `spaces.aoti_load`, evitando `torch.compile` en runtime.
- Compatibilidad con ZeroGPU de Hugging Face Spaces.
- Ejecución con cuantización FP8 dinámica en los bloques del transformer.
- Text encoder en 8 bits para reducir huella de memoria.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo; es un modelo de generación de vídeo.

## Casos de uso

- Generación de vídeo a partir de imagen en Spaces de Hugging Face con ZeroGPU: el artefacto AoT permite arrancar el pipeline sin compilar, algo crítico en entornos efímeros donde cada segundo de arranque cuenta.
- Prototipado rápido de pipelines image-to-video: cargar el transformer precompilado y saltarse la fase de `torch.compile` acelera la iteración sobre prompts y parámetros del scheduler.
- Producción con latencia controlada en GPUs Blackwell: el speedup de 1,53x medido en el sample reduce el tiempo por generación, útil en colas de trabajos por lotes.
- Investigación en difusión de vídeo: sirve como base reproducible para experimentar con cuantización FP8 y compilación AoT sin reentrenar.
- Despliegue en infraestructura con CUDA 13.0 y sm120: adecuado para clústeres con RTX PRO 6000 o GPUs Blackwell equivalentes.
- Reproducción de artefactos: el repo incluye el `job.py` y las instrucciones para regenerar el binario con otro flavor o imagen, útil para auditoría y CI.

## Benchmarks y rendimiento

| Metrica | Antes de compilacion | Despues de compilacion |
|---|---|---|
| Tiempo de generacion (sample) | 193,05 s | 125,85 s |
| Speedup | 1,00x | 1,53x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench, etc.) en la información disponible. Los únicos datos son los tiempos del sample de compilación, que la propia model card advierte que "might not always reflect actual performance gain".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pipeline carga dos transformers en bfloat16 más un text encoder en 8 bits, lo que en la práctica requiere una GPU de gran capacidad (el job se ejecutó en RTX PRO 6000 Blackwell, 96 GB).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (usada en la compilación); cualquier GPU con arquitectura sm120 y CUDA 13.0 para aprovechar el artefacto.
- Compatibilidad consumer: no confirmada; el artefacto está compilado para sm120, por lo que no funcionará en GPUs de arquitecturas anteriores (Ada, Ampere) sin recompilar.
- Opciones de despliegue: `diffusers` + `spaces.aoti_load` (ZeroGPU), ejecución local con Docker y `uv run job.py`, HF Jobs con flavor `rtx-6000`.
- Latencia y throughput: 125,85 s por generación en el sample tras compilación; no se dispone de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayurilinwane/WanTransformer3DModel-sm120-cu130-raa | no disponible (base A14B) | no disponible | 1,53x speedup vs sin compilar | no disponible | Hugging Face, 0 descargas |
| cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers | ~14B (sugerido por nombre) | no disponible | base sin compilar | no disponible | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | ~14B (sugerido por nombre) | no disponible | modelo original | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes (p. ej. modelos de vídeo de otras familias) en parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- El repositorio es un artefacto de compilación, no un modelo entrenado; no debe evaluarse como modelo generativo independiente.
- El artefacto está compilado para sm120 y CUDA 13.0; no es portable a otras arquitecturas sin recompilar.
- La propia model card advierte que el speedup de 1,53x puede no reflejar la ganancia real en todos los casos.
- No se especifica licencia; el uso comercial queda sujeto a la licencia del modelo base Wan2.2-I2V-A14B, que no se detalla en la información disponible.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión de vídeo; no se documentan sesgos concretos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-18); no hay evidencia de uso en producción.
- Dependencia de versiones muy específicas (PyTorch 2.12.0+cu130, diffusers, torchao, bitsandbytes); inconsistencias de versión pueden romper la carga del artefacto.
- No se documentan idiomas soportados ni limitaciones de contexto textual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayurilinwane/WanTransformer3DModel-sm120-cu130-raa
- Repo de referencia del artefacto original: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Modelo base Wan2.2-I2V-A14B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos bf16 del transformer: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Documentación de HF Jobs: https://hf.co/docs/hub/en/jobs-configuration
- Documentación de diffusers (pipeline Wan): https://huggingface.co/docs/diffusers
