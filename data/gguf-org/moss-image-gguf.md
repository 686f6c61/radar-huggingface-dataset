# gguf-org/moss-image-gguf

## Resumen

`gguf-org/moss-image-gguf` es un repositorio de pesos en formato GGUF del modelo `OpenMOSS-Team/MOSS-Image-SFT`, orientado a generación y edición de imágenes. Lo publica la organización `gguf-org`; no es el modelo original, sino una conversión/cuantización pensada para inferencia local. El checkpoint declara 5.082.308.624 parámetros (~5,08 mil millones) y licencia Apache-2.0; el repositorio ocupa 3,5 GB.

La model card muestra dos flujos: texto a imagen y edición con imagen de referencia. Ambos requieren componentes auxiliares: un VAE (`pig_flux2_vae_fp32-f16.gguf`) y un LLM (`qwen3.5-9b-q4_k_m.gguf`); para edición, además, un proyector visión (`mmproj-qwen3.5-9b-f16.gguf`). No se detalla la arquitectura interna, el dataset de entrenamiento ni los idiomas soportados.

Es relevante para quien quiera probar MOSS-Image en local con GGUF, pero la documentación técnica es escasa: no hay benchmarks publicados en la información disponible y el pipeline no está etiquetado en HuggingFace. La licencia Apache-2.0 facilita el uso comercial del repositorio, aunque deben revisarse las licencias de los componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación y edición de imágenes; la arquitectura interna no se detalla en la información disponible. |
| Parametros totales | 5.082.308.624 (~5,08 mil millones), según metadatos de safetensors. No se aclara si incluye componentes auxiliares. |
| Parametros activos | No aplica: no consta que sea un modelo MoE. |
| Longitud de contexto | No disponible. No se define una ventana de contexto textual; el prompt se procesa con un LLM auxiliar. |
| Tipos de cuantizacion | GGUF; la model card cita el archivo `moss-image-sft-nvfp4.gguf` (NVFP4). No se detallan otras variantes para el modelo principal. |
| Idiomas soportados | No disponible. Los ejemplos de la model card están en inglés. |
| Licencia | Apache-2.0. |
| Formato de pesos | GGUF. Los ejemplos requieren VAE y LLM auxiliares también en GGUF. |

## Arquitectura y entrenamiento

La información disponible no especifica si la arquitectura interna es un transformer de difusión, una U-Net, un modelo híbrido u otra variante. El repositorio se presenta como un modelo de difusión (`--diffusion-model`) y los ejemplos lo combinan con un VAE, un LLM como codificador de texto y, para edición, un proyector visión. El nombre del modelo base, `MOSS-Image-SFT`, sugiere una etapa de ajuste supervisado, pero no se confirma en la documentación proporcionada.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras técnicas de alineamiento. Tampoco se documentan innovaciones como atención linear, decodificación especulativa o estrategias de control de calidad. Los únicos parámetros técnicos visibles son los de muestreo: `--cfg-scale 3`, `--steps 20` y `--sampling-method euler`.

## Capacidades

- Generación texto a imagen: la model card incluye el prompt `a sheep in sunglasses` y salidas `out1.png` y `out2.png`.
- Edición de imagen guiada por prompt: acepta una imagen de referencia mediante `--ref-image sheep.png` y un proyector visión `mmproj-qwen3.5-9b-f16.gguf`.
- Integración con componentes externos: usa un VAE (`pig_flux2_vae_fp32-f16.gguf`) y un LLM (`qwen3.5-9b-q4_k_m.gguf`) según los ejemplos del autor.
- Inferencia local en formato GGUF mediante la herramienta `ggk`, con parámetros de muestreo configurables.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documentan capacidades de audio, vídeo, chat de texto o modo thinking.
- Capacidades multilingües: no disponibles; solo se muestran prompts en inglés.
- No se documentan mecanismos de seguridad, moderación o filtrado de contenido.

## Casos de uso

- Generación de conceptos visuales para diseño: usar prompts cortos para explorar composiciones y variaciones antes de producir arte final. Es adecuado porque el flujo texto a imagen es el caso documentado por el autor.
- Edición de imágenes de producto: tomar una foto de referencia y pedir cambios acotados, como añadir gafas de sol, mediante `--ref-image`. Útil para variantes de catálogo, aunque no se documenta la fidelidad de identidad ni la conservación de detalles.
- Prototipado de ilustración y personajes: generar imágenes de apoyo para briefs creativos y iterar sobre el resultado con nuevos prompts. Requiere revisión humana por posibles desviaciones semánticas.
- Contenido para marketing y redes sociales: producir imágenes de apoyo a partir de descripciones textuales. La licencia Apache-2.0 facilita el uso comercial, pero deben verificarse derechos de imágenes de entrada y componentes auxiliares.
- Aumento de datos sintéticos: crear imágenes para entrenar o evaluar modelos de visión. Conviene validar la calidad y evitar sesgos reproducidos por el modelo.
- Demostraciones y docencia: ejecutar un pipeline de difusión local con GGUF para explicar cuantización, muestreo y uso de VAE/LLM auxiliares.
- Integración en scripts creativos locales: invocar `ggk` desde automatizaciones para generar lotes de imágenes. No se documenta una API servida ni integración con ComfyUI.
- Exploración en investigación: comparar el comportamiento del modelo base y su versión GGUF en tareas de edición con referencia, siempre que se añadan métricas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, CLIPScore, precisión de edición ni comparaciones con otros modelos texto a imagen. Métricas como MMLU, HumanEval o GSM8K no aplican a este modelo generativo de imágenes.

## Requisitos de hardware

- VRAM estimada para los pesos principales: unos 2,5 GB en NVFP4, calculado de forma teórica a partir de 5,08 mil millones de parámetros y 4 bits por parámetro, sin contar overhead.
- Pipeline completo: el LLM `qwen3.5-9b-q4_k_m.gguf` añade aproximadamente 5-6 GB, más el VAE y el proyector visión. Una estimación orientativa para ejecución cómoda es de 10-12 GB de VRAM.
- GPU de consumo: 12 GB puede ser justo; 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB) o 24 GB (RTX 3090, RTX 4090) es más recomendable. Con 8 GB probablemente sea necesario descargar componentes a CPU o SSD, con mayor latencia.
- GPU profesional: A100 40/80 GB o H100 80 GB para lotes o despliegues concurrentes. No hay datos de throughput.
- Despliegue: la model card usa `ggk`. No se confirma soporte en vLLM, TGI, Ollama, llama.cpp o ComfyUI para este modelo de difusión.
- Latencia y throughput: no disponibles. La configuración de ejemplo usa 20 pasos y CFG 3, pero no se reportan tiempos por imagen.
- Almacenamiento: el repositorio ocupa 3,5 GB; hay que sumar el LLM, el VAE y el proyector visión.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la información proporcionada. No se han aportado parámetros, contexto, licencias ni benchmarks de modelos como FLUX.1 o Stable Diffusion 3.5, por lo que no se presenta una comparación numérica para no inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `gguf-org/moss-image-gguf` | 5,08 mil millones | No disponible | Apache-2.0 | GGUF | Cuantización NVFP4 citada en la model card |
| `OpenMOSS-Team/MOSS-Image-SFT` | No disponible | No disponible | No disponible | No disponible | Modelo base; no se detalla su ficha técnica |
| Alternativas texto a imagen | No disponible | No disponible | No disponible | No disponible | Sin datos verificables en la información disponible |

## Limitaciones y advertencias

- Es un repositorio de cuantización, no el modelo original: la calidad puede diferir respecto a `OpenMOSS-Team/MOSS-Image-SFT` y no hay evaluación comparativa publicada.
- La documentación es insuficiente: no se detallan arquitectura, dataset, idiomas, benchmarks ni límites de uso.
- Depende de componentes externos: LLM `qwen3.5-9b`, VAE `pig_flux2_vae` y proyector visión. Sus licencias, compatibilidad y requisitos no se documentan en la información disponible.
- El archivo citado es NVFP4; puede requerir soporte específico de hardware o dequantización según la herramienta. No se detalla la compatibilidad con GPUs no Blackwell.
- Riesgo de sesgos: no se documentan medidas de mitigación. Los modelos texto a imagen pueden amplificar estereotipos y generar contenido inapropiado.
- Riesgo de alucinación visual: puede producir detalles inexistentes, no seguir fielmente el prompt o alterar la imagen de referencia. No hay métricas de fidelidad.
- Idioma: solo se muestran ejemplos en inglés; el rendimiento con prompts en castellano no está disponible.
- Uso comercial: la licencia Apache-2.0 del repositorio permite uso comercial, pero deben revisarse las licencias de los modelos auxiliares y los derechos de las imágenes de entrada y salida.
- No es un LLM: no debe usarse para generación de texto, tool calling, agentes o razonamiento multi-step.
- El pipeline no está etiquetado en HuggingFace (`pipeline: no disponible`), lo que dificulta la integración automática en herramientas estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gguf-org/moss-image-gguf
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Documentación de GGUF en HuggingFace: https://huggingface.co/docs/hub/gguf
- GGUF en Wikipedia: https://en.wikipedia.org/wiki/GGUF
- Sitio de GGUF: https://gguf.org/
- Organización GGUF-Models en HuggingFace: https://huggingface.co/GGUF-Models
