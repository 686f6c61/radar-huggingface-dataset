# LuffyTheFox/Qwen-Image-2.1-Uncensored-Genesis-BF16-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Genesis-BF16-GGUF es una recopilación de cuantizaciones GGUF para generación de imágenes texto-a-imagen en local, publicada por el usuario LuffyTheFox. No se trata de un modelo entrenado desde cero, sino de una versión calibrada mediante el algoritmo Genesis sobre el modelo abenzerps/Qwen-Image-2.1-Uncensored-GGUF, que a su vez deriva del modelo de difusión Qwen-Image 2.1 de Alibaba. El repositorio incluye el transformador de difusión en GGUF, el text encoder Qwen3-VL 8B (en bf16 o int8) y el VAE de Qwen-Image 2.1, todo listo para su uso con ComfyUI.

El modelo declara 7.115.124.736 parámetros (unos 7,1 mil millones) en el transformador de difusión y un tamaño de repositorio de 32,5 GB, que incluye todas las cuantizaciones y ficheros auxiliares. La propuesta diferencial del autor es Genesis: un procedimiento de "regeneración y calibración de datos post-entrenamiento" que, según su descripción, reduce el ruido acumulado en los tensores mediante SVD basado en la distribución de Marchenko–Pastur, sin reentrenar ni hacer fine-tuning.

Su relevancia práctica es doble: por un lado, permite ejecutar generación de imágenes sin censura en hardware de consumo mediante cuantizaciones GGUF y ComfyUI; por otro, documenta una metodología poco convencional de intervención sobre pesos ya entrenados, cuyas afirmaciones cualitativas no vienen acompañadas de métricas ni benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada. El modelo base es Qwen-Image 2.1 (difusión texto-a-imagen); la model card menciona tensores `ssm_conv1d` encargados de la memoria de contexto largo, lo que sugiere componentes de tipo state space en la arquitectura |
| Parametros totales | 7.115.124.736 (unos 7,1 B), dato de safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, con Q4_K_M recomendado por el autor. La model card menciona además NVFP4 como configuración recomendada (difusión y text encoder) e int8 convrot para el text encoder. El identificador del repositorio indica BF16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF para el transformador de difusión; safetensors para el text encoder (`qwen3vl_8b_bf16.safetensors` o `qwen3vl_8b_int8_convrot.safetensors`) y el VAE (`qwen_image_2.1_vae_bf16.safetensors`) |

## Arquitectura y entrenamiento

El autor no entrena ni hace fine-tuning del modelo. Genesis se describe como un algoritmo de calibración posterior al entrenamiento, independiente de la arquitectura, que opera sobre pesos en formato GGUF. Consta de tres etapas: primero se escanean los tensores `ssm_conv1d` (responsables de la memoria de contexto largo) para reequilibrar la relación entre cabezas; después se escanean bloques por fragmentos con tres parámetros y se selecciona el fragmento que mejor encaja con la distribución de pesos del tensor, sustituyendo fragmentos nulos sin alterar la estructura aprendida; por último se detecta ruido mediante un SVD propio basado en la ley de Marchenko–Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, sesgos y normalizaciones. El autor afirma preservar el 99 % de la señal y el gradiente aprendido.

Según la model card, muchos tensores de los pesos originales compartidos por Alibaba eran singulares y presentaban un número de condición elevado, lo que distorsionaba la distribución de señal entre tensores; el autor indica haber reducido ese número de condición tanto en el modelo base como en el text encoder para estabilizar la inferencia. No se publican datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre etapas de RLHF o DPO, ya que no hay entrenamiento involucrado en esta publicación. El procedimiento se desarrolló, según el autor, en Google Colab gratuito con una GPU Tesla T4 durante aproximadamente medio año.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`), mediante el transformador de difusión en GGUF y el text encoder Qwen3-VL 8B.
- Edición de imágenes guiada por prompt: la model card referencia la plantilla oficial de ComfyUI `image_qwen_image_2_1_image_edit.json`.
- Generación local y sin conexión: no requiere servicios en la nube, ya que todos los ficheros necesarios (difusión, text encoder y VAE) se alojan en el propio repositorio.
- Generación de contenido sin censura, según se desprende de la denominación "Uncensored" heredada del modelo base.
- Integración con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el cargador `CLIPLoader` con `type` configurado como `qwen_image`.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.

## Casos de uso

- Generación de imágenes en local con ComfyUI: el flujo consiste en cargar el GGUF de difusión en el nodo `Unet Loader (GGUF)`, el text encoder Qwen3-VL 8B en `CLIPLoader` (tipo `qwen_image`) y el VAE correspondiente; es adecuado para usuarios que quieren evitar dependencias de APIs externas.
- Edición y retoque de imágenes por prompt: usando la plantilla oficial de edición de imagen, el modelo permite modificar imágenes existentes sin pipeline adicional, lo que resulta útil para iteraciones rápidas de diseño gráfico.
- Prototipado de material gráfico sin restricciones temáticas: al tratarse de una variante sin censura, encaja en proyectos creativos o de investigación donde los filtros de contenido de los modelos alojados bloquearían las peticiones.
- Automatización de lotes de generación: al integrarse en ComfyUI, puede encadenarse en flujos programáticos (por ejemplo, mediante la API de ComfyUI) para producir conjuntos de imágenes a partir de listas de prompts.
- Evaluación comparativa de calibración de pesos: el repositorio sirve como caso de estudio para investigadores interesados en técnicas de reducción de ruido en tensores (SVD, Marchenko–Pastur) aplicadas a pesos ya entrenados.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q4_K_M y el text encoder en RAM del sistema, el consumo de VRAM se reduce lo suficiente para equipos de gama media-alta, según las notas de memoria del propio autor.
- Reproducción de flujos oficiales de Qwen-Image 2.1: el autor indica que las plantillas oficiales de Comfy-Org funcionan sustituyendo el nodo `UNETLoader` por `Unet Loader (GGUF)`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Parámetros del transformador de difusión: 7.115.124.736 (unos 7,1 B). En FP16 ocuparía aproximadamente 14,2 GB solo en pesos; en Q4_K_M, del orden de 4 a 5 GB (cálculo derivado del número de parámetros, no confirmado por el autor).
- Text encoder Qwen3-VL 8B: en bf16 ocuparía unos 16 GB y en int8 alrededor de 8 GB (estimación derivada del tamaño del modelo).
- El repositorio completo ocupa 32,5 GB, incluyendo varias cuantizaciones y los ficheros auxiliares.
- Configuración recomendada por el autor: mantener el modelo de difusión GGUF en VRAM de la GPU y ejecutar o descargar el text encoder en RAM del sistema. Según la model card, esto ahorra entre 9 y 17 GB de VRAM con un impacto prácticamente nulo en la velocidad de generación, ya que la codificación de texto solo se ejecuta una vez por prompt.
- Configuraciones citadas por el autor: difusión en NVFP4 y text encoder en NVFP4 como combinación recomendada; `--lowvram` como argumento de arranque de ComfyUI en caso de errores de memoria insuficiente.
- El procedimiento Genesis se desarrolló en una GPU Tesla T4 (16 GB) en Google Colab gratuito, dato que indica el entorno de creación, no necesariamente el de inferencia.
- Opciones de despliegue citadas: ComfyUI con la extensión ComfyUI-GGUF, preferiblemente el fork de `leejet` con soporte nativo de Qwen-Image 2.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| LuffyTheFox/Qwen-Image-2.1-Uncensored-Genesis-BF16-GGUF | 7,1 B (transformador) | No disponible | GGUF + safetensors | qwen-research | 882 descargas, 11 likes | Pesos calibrados con el algoritmo Genesis; repo de 32,5 GB con difusión, text encoder y VAE |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | No disponible | No disponible | GGUF | No disponible | No disponible | Modelo base directo de esta publicación; relación declarada: `quantized` |
| Qwen/Qwen-Image-2.1 | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo fuente original de Qwen; la model card lo cita como origen de los pesos |

No se dispone de datos verificados de otros modelos comparables (por ejemplo, alternativas de difusión texto-a-imagen de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia permisiva y establece restricciones de uso, por lo que es imprescindible revisar los términos antes de cualquier uso comercial.
- Variante sin censura: el modelo puede generar contenido inapropiado, ofensivo o ilegal según la jurisdicción. La responsabilidad del uso recae íntegramente en quien lo despliega.
- Ausencia total de benchmarks: las afirmaciones del autor sobre reducción de ruido, coherencia y seguimiento de instrucciones no están respaldadas por métricas objetivas publicadas en la información disponible.
- Metodología Genesis descrita de forma cualitativa: no se detallan valores concretos de umbrales, número de componentes SVD, ni criterios numéricos de selección de fragmentos, lo que dificulta su verificación o reproducción independiente.
- Riesgo de artefactos: en modelos de difusión, el equivalente a la alucinación se manifiesta como anatomías incorrectas, texto ilegible o incoherencias compositivas; no hay evaluación publicada al respecto.
- Idiomas soportados no disponibles: se desconoce el comportamiento del modelo con prompts en castellano u otros idiomas distintos del inglés.
- Intervención sobre pesos de terceros: el autor modifica pesos originales de Qwen, lo que puede alterar comportamientos no documentados respecto al modelo oficial.
- Dependencia de herramientas concretas: requiere el fork `leejet/ComfyUI-GGUF`; con el fork antiguo `city96/ComfyUI-GGUF` puede aparecer el error `Unknown model architecture!`.
- Inconsistencia en la nomenclatura: el identificador del repositorio indica BF16, mientras que la model card recomienda Q4_K_M y menciona NVFP4; conviene verificar qué fichero se descarga realmente.
- Inconsistencia en las fechas: los metadatos de HuggingFace indican creación y actualización el 26 de septiembre de 2026.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo, por lo que no ha sido posible contrastar la información de la model card con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LuffyTheFox/Qwen-Image-2.1-Uncensored-Genesis-BF16-GGUF
- Modelo base (GGUF sin censura): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Modelo fuente citado: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado por el autor): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo): https://github.com/city96/ComfyUI-GGUF
- Plantilla oficial texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de edición de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Distribución de Marchenko–Pastur (referencia matemática citada por el autor): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos no guardaban relación con el modelo.
