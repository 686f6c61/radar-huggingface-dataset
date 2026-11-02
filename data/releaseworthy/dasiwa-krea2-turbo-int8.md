# releaseworthy/dasiwa-krea2-turbo-int8

## Resumen

DaSiWa Krea2 Turbo (DarkDesire V3 Turbo UC) int8 mirror es un checkpoint de generación de imágenes texto-a-imagen derivado por fine-tuning de `black-forest-labs/FLUX.1-Krea-dev`. El modelo original lo publica el autor de DaSiWa en Civitai (modelo 2760803) y este repositorio de HuggingFace, gestionado por el usuario `releaseworthy`, se limita a replicar el archivo de pesos en formato int8 para evitar la limitación de velocidad de descarga del CDN de Civitai (que restringe a un único host a 11-33 MB/s tras unos pocos GB). No se trata, por tanto, de un modelo nuevo ni de un entrenamiento propio, sino de un espejo de conveniencia para instancias de GPU alquiladas.

El checkpoint se distribuye como un único archivo `DasiwaKrea2TurboRaw_darkdesireV3TurboUC_int8.safetensors` de 12,84 GB (13,8 GB de repositorio) y está pensado para ejecutarse en ComfyUI mediante la cadena de workflows de DaSiWa, con 8 pasos de muestreo, CFG 1, sampler `euler` y scheduler `beta`. El text encoder y el VAE no se incluyen en este repositorio: deben obtenerse por separado desde `Comfy-Org/Krea-2`, concretamente `text_encoders/qwen3vl_4b_fp8_scaled.safetensors` y `vae/qwen_image_vae.safetensors`.

La relevancia de esta ficha es acotada: se trata de un artefacto de uso privado, con cero descargas y cero likes en el momento de la consulta, publicado bajo la licencia de Civitai (`civitai-model-license`), que restringe el uso comercial y la redistribución. Su interés técnico radica en ser un ejemplo de destilación turbo (8 pasos, CFG 1) sobre la base FLUX.1-Krea-dev cuantizada a int8, con un text encoder Qwen3-VL de 4B en fp8 escalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de FLUX.1-Krea-dev; presumiblemente transformer de difusion, sin confirmar en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | int8 (checkpoint principal); text encoder en fp8 escalado (`qwen3vl_4b_fp8_scaled.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | `civitai-model-license` (enlace: https://civitai.com/models/2760803) |
| Formato de pesos | safetensors (`DasiwaKrea2TurboRaw_darkdesireV3TurboUC_int8.safetensors`, 12,84 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la documentación proporcionada. El modelo se declara como fine-tuning de `black-forest-labs/FLUX.1-Krea-dev`, un modelo de difusión texto-a-imagen, y el sufijo "Turbo" junto con los parámetros de inferencia indicados (8 pasos, CFG 1, sampler `euler`, scheduler `beta`) sugiere una destilación orientada a reducir el número de pasos de muestreo respecto al modelo base. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación.

La innovación técnica destacable, según la model card, es la cuantización a int8 del checkpoint para reducir el tamaño del archivo a 12,84 GB y facilitar su despliegue en ComfyUI. El pipeline requiere un text encoder externo basado en Qwen3-VL de 4B parámetros en fp8 escalado y un VAE de Qwen-Image, ambos alojados en `Comfy-Org/Krea-2`. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Inferencia rápida en 8 pasos de muestreo con CFG 1, lo que reduce el coste computacional frente a configuraciones estándar de difusión.
- Integración con ComfyUI mediante la cadena de workflows de DaSiWa.
- Uso de text encoder Qwen3-VL 4B (fp8 escalado) para la codificación del prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en instancias de GPU alquiladas: el repositorio existe precisamente para descargar el checkpoint a velocidad completa desde HuggingFace en lugar de sufrir el throttling del CDN de Civitai (11-33 MB/s), lo que agiliza el aprovisionamiento de entornos efímeros de entrenamiento o inferencia.
- Prototipado rápido de pipelines texto-a-imagen en ComfyUI: con 8 pasos y CFG 1, el modelo permite iterar sobre prompts y composiciones con un coste por imagen bajo en comparación con muestreos de 20-50 pasos.
- Generación de arte conceptual y variaciones estilísticas: al ser un fine-tuning de FLUX.1-Krea-dev orientado a un estilo concreto (DarkDesire V3 Turbo UC), encaja en flujos de exploración visual donde se busca una estética definida.
- Reproducibilidad de flujos de trabajo: al fijar el archivo exacto y los parámetros de muestreo (euler, beta, 8 pasos, CFG 1), permite replicar resultados en distintos entornos siempre que se usen el mismo text encoder y VAE de `Comfy-Org/Krea-2`.
- Automatización de contenido visual en lotes: la naturaleza turbo del checkpoint facilita generar lotes grandes de imágenes en una sola GPU sin necesidad de clústeres.
- Investigación sobre cuantización int8 en modelos de difusión: sirve como caso de estudio para medir la degradación de calidad frente al checkpoint original en fp16/bf16 y evaluar el equilibrio entre tamaño (12,84 GB) y fidelidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint int8 ocupa 12,84 GB en disco, por lo que se requiere al menos esa cantidad de VRAM para cargarlo en memoria, más la del text encoder Qwen3-VL 4B en fp8 y el VAE de Qwen-Image.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, GPUs con 24 GB o más de VRAM (RTX 4090, A100, H100) son candidatas razonables, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; el checkpoint int8 de 12,84 GB más el text encoder y el VAE probablemente exceden los 16 GB de una RTX 4080, pero no hay datos oficiales.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. Los 8 pasos con CFG 1 y sampler `euler`/scheduler `beta` sugieren una latencia baja por imagen, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaSiWa Krea2 Turbo int8 mirror | no disponible | no aplica | no disponible | civitai-model-license | HuggingFace (espejo) y Civitai |
| black-forest-labs/FLUX.1-Krea-dev | no disponible | no aplica | no disponible | no disponible en la informacion | HuggingFace (modelo base) |
| Comfy-Org/Krea-2 (text encoder y VAE) | Qwen3-VL 4B (text encoder) | no aplica | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a la relación de dependencia entre el checkpoint y sus componentes auxiliares.

## Limitaciones y advertencias

- Licencia `civitai-model-license`: restringe el uso comercial y la redistribución; es imprescindible revisar los términos en https://civitai.com/models/2760803 antes de cualquier uso en producción.
- Es un espejo, no un modelo original: el repositorio no aporta entrenamiento, documentación técnica ni garantías; todo el crédito y la responsabilidad recaen en el autor de Civitai.
- Dependencia de componentes externos: sin el text encoder `qwen3vl_4b_fp8_scaled.safetensors` y el VAE `qwen_image_vae.safetensors` de `Comfy-Org/Krea-2`, el checkpoint no es funcional.
- Cuantización int8: puede introducir degradación de calidad visual frente al checkpoint original en fp16/bf16; no se documenta ninguna evaluación comparativa.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un fine-tuning estilístico, puede heredar sesgos del modelo base y del dataset de ajuste.
- Riesgo de alucinación visual: no documentado; como todo modelo generativo de imágenes, puede producir artefactos, anatomías incorrectas o texto ilegible en la imagen.
- Idiomas soportados: no disponibles; el text encoder Qwen3-VL es multilingüe, pero no se confirma el comportamiento del pipeline con prompts en castellano.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validación por terceros.
- Fecha de creación declarada (2026-11-02): conviene verificar la coherencia temporal del repositorio antes de confiar en él para producción.

## Enlaces

- HuggingFace: https://huggingface.co/releaseworthy/dasiwa-krea2-turbo-int8
- Modelo original en Civitai: https://civitai.com/models/2760803
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-Krea-dev
- Text encoder y VAE: https://huggingface.co/Comfy-Org/Krea-2
- Licencia: https://civitai.com/models/2760803
