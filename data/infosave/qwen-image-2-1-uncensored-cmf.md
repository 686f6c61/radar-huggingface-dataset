# infosave/Qwen-Image-2.1-Uncensored-CMF

## Resumen

Qwen-Image-2.1-Uncensored-CMF es un artefacto de inferencia de texto a imagen distribuido por el usuario infosave, que empaqueta el pipeline completo del modelo Qwen-Image-2.1 (transformador de difusión, codificadores de texto y visión, VAE, tokenizador y receta de muestreo) en un único archivo de 12.745.219.006 bytes (11,870 GiB) con 15,59 mil millones de parámetros. No es un volcado BF16, sino una redistribución cuantizada y verificable pensada para ejecución local mediante el runtime Cortiq: el DiT va en q4tp, los codificadores en q8_2f y el VAE en f16.

El modelo se apoya en Qwen/Qwen-Image-2.1 como modelo base y toma la variante "sin censura" del repositorio abenzerps/Qwen-Image-2.1-Uncensored-GGUF, cuyo publicador afirma que su versión GGUF no incluye verificador de seguridad ni filtro de contenido. Esa afirmación es una atribución al origen, no una garantía sobre las salidas de este artefacto CMF.

Su relevancia es práctica: se ejecuta en CPU, en Metal nativo y en Vulkan, con rutas validadas por el autor y mediciones publicadas (29,13 s end to end a 1024x1024 y 40 pasos en una RTX 4090 por Vulkan). La licencia Qwen Research lo limita a uso no comercial de investigación, y su adopción comunitaria es todavía mínima (0 descargas y 1 "me gusta" en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (DiT) con codificadores de texto y visión, VAE y tokenizador; pipeline completo empaquetado en un único archivo CMF |
| Parámetros totales | 15,59 mil millones (15,59B), según la model card |
| Longitud de contexto | no disponible (el pipeline es de texto a imagen y la ventana del codificador de texto no se documenta) |
| Tipos de cuantización | Interna del artefacto: DiT q4tp, codificadores q8_2f, VAE f16 (no es un volcado BF16) |
| Idiomas soportados | inglés (etiqueta `en` en los metadatos) |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial de investigación, uso comercial requiere licencia aparte del licenciante de Qwen |
| Formato de pesos | CMF de archivo único (`.cmf`); no es safetensors ni GGUF |
| Modelo base | Qwen/Qwen-Image-2.1 (relación: quantized) |
| Tarea (pipeline) | text-to-image |
| Librería de ejecución | cortiq (validado con cortiq 0.8.2) |
| Resolución y pasos por defecto | 1024x1024 y 40 pasos (cfg=1) según la receta embebida |
| Tamaño del repositorio | 12,7 GB |
| Artefacto y verificación | `qwen-image-2.1-uncensored.cmf`, SHA-256 `44317a2e7ebe4a520ba2e701ff099f8faaeafe065972395c3ac53ae32f99aada` |

## Arquitectura y entrenamiento

El artefacto no entrena nada nuevo: es una conversión del DiT de la variante sin censura de Qwen-Image-2.1 a formato CMF. La model card describe el modo de ensamblaje con precisión: se parte de una base CMF ya validada (SHA-256 `b94309e4ed716c7a224c3dc88d583d3095d6e34edd76a76c01b04b9123a40bce`), se sustituyen únicamente los tensores del DiT y se recodifican una sola vez en las ranuras de la base; los codificadores, el VAE, el tokenizador, el planificador y el resto de la carga no DiT se copian byte a byte. El DiT de origen es `qwen-image-2.1-UC-BF16.gguf`, con SHA-256 `f151c683a8aed4b310777017ebbbe3f2180f1180f7867115171adb7d50b0762a`, y la integración del conversor corresponde al commit `34d33dc8db5a085210794992940f67f3ec5accf4`.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO, atención lineal o decodificación especulativa) no se detallan en la información disponible y corresponden a la documentación oficial de Qwen, no a esta redistribución. Lo que sí documenta el autor es la innovación de empaquetado: un único archivo autodescriptivo con receta embebida que permite ejecutar el pipeline entero sin gestionar ficheros separados de codificador, VAE y tokenizador, más una huella SHA-256 publicada para reproducibilidad. Las etiquetas del repositorio mencionan además rutas de ejecución específicas para Vulkan (con respaldo f16 cuando el controlador no expone `fp8 mma`) y Metal nativo en Apple silicon.

## Capacidades

- Generación de imágenes a partir de texto en resolución 1024x1024 con 40 pasos de muestreo y cfg=1 por defecto.
- Ejecución local completa y sin conexión: el archivo contiene DiT, codificadores de texto y visión, VAE, tokenizador y receta.
- Tres rutas de cómputo soportadas y declaradas: CPU, Vulkan (NVIDIA y genéricos) y Metal nativo en Apple silicon.
- Ajuste de hilos de CPU mediante `CMF_THREADS` y selección de backend de GPU mediante variables de entorno (`CMF_GPU`, `WGPU_BACKEND`, `CMF_QI21_METAL_PROF`).
- Generación determinista verificable: la repetición de una ejecución con la misma semilla produjo un PNG con SHA-256 idéntico (según el autor, en la prueba de CPU a 12 hilos).
- Modo de comprobación rápida de instalación: `cortiq verify` y generación de humo a 512x512 con 4 pasos.
- Sin verificador de seguridad incorporado según la afirmación del publicador del GGUF de origen (atribución al upstream, no garantía del artefacto).
- No se documentan otras capacidades como edición por máscara, ampliación, control de composición, tool calling ni agentes; no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en estaciones de trabajo sin GPU NVIDIA: al existir una ruta Metal nativa y una ruta CPU, el modelo se puede usar en Macs y en servidores sin acelerador dedicado, aceptando el coste de latencia de la ruta de CPU.
- Investigación sobre cuantización y formatos de archivo único: el artefacto permite estudiar la pérdida de calidad de un DiT q4tp con codificadores q8_2f frente al BF16 original, comparando con la huella SHA-256 del pipeline base.
- Pruebas y auditoría de moderación de contenido: al no incorporar verificador de seguridad, sirve para evaluar políticas, clasificadores y salvaguardas de terceros en un entorno controlado de investigación.
- Creación de arte conceptual y previsualización interna: con 1024x1024 y 40 pasos en 29,13 s sobre una RTX 4090, encaja en iteraciones de diseño donde se prueban decenas de variaciones de un mismo prompt.
- Generación de datos sintéticos para experimentos académicos: la reproducibilidad por semilla y la verificación por hash permiten documentar exactamente qué imágenes se usaron en un estudio.
- Despliegue en contenedores headless tipo RunPod: la model card incluye los paquetes de espacio de usuario de Vulkan necesarios (`libglvnd0`, `libgl1`, `libegl1`, `libvulkan1`, `vulkan-tools`) para levantar la ruta Vulkan en un contenedor limpio.
- Entornos aislados o air-gapped: al ser un único archivo de 11,870 GiB con suma de comprobación publicada, la transferencia y la verificación del artefacto son sencillas y auditables.
- Docencia y demostraciones de difusión local: la instalación con `cargo install cortiq-cli --locked` y la generación de humo a 512x512 con 4 pasos permiten montar una práctica funcional en pocos minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, GenEval u otros) en la información disponible. Las únicas cifras publicadas son mediciones de ejecución del propio artefacto:

| Host | Carga | Ruta | Resultado |
|---|---|---|---|
| RTX 4090, driver 570.195.03, Vulkan | 1024x1024, 40 pasos, cfg=1, seed=42 | Vulkan con respaldo f16 | 29,13 s end to end; 0,527 s de paso DiT mediano |
| RTX 4090, Vulkan | Decodificado VAE a 1024² | Vulkan con respaldo f16 | 4,8 GB de activaciones; 0,81 s de decodificado |
| AMD EPYC 7642 (96 CPU lógicos) | 256x256, 2 pasos, prompt y semilla fijos | CPU, `CMF_THREADS=48` | 86,70 s total; 32,720 s de paso DiT mediano |
| AMD EPYC 7642 | 256x256, 2 pasos | CPU, `CMF_THREADS=32` | 66,05 s total; 24,317 s de paso DiT mediano |
| AMD EPYC 7642 | 256x256, 2 pasos | CPU, `CMF_THREADS=12` | 43,54 s total; 15,806 s de paso DiT mediano |

Notas de medición aportadas por el autor: el DiT mantuvo 13,96 GB de planos en el dispositivo durante la ejecución en Vulkan; el controlador no exponía extensión matricial float8 (`fp8 mma false`), por lo que la ruta se etiqueta honestamente como respaldo f16 y no como FP8; en CPU, 12 hilos superaron a la configuración de 32 hilos en torno a un 34% end to end en ese host concreto, y la repetición de la ejecución de 12 hilos produjo un PNG con el mismo SHA-256. El autor remite a su archivo `BENCHMARKS.md` para el protocolo reproducible y sus limitaciones.

## Requisitos de hardware

- VRAM estimada: en la ejecución medida a 1024x1024 el DiT ocupó 13,96 GB en el dispositivo y el decodificado VAE necesitó 4,8 GB de activaciones, por lo que una GPU de 24 GB es el caso validado; no hay cifras publicadas para GPUs de 16 GB o menos.
- GPU recomendadas: RTX 4090 (validada, driver 570.195.03, ruta Vulkan). A100, H100 y otras no aparecen probadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB según la medición del autor. Para GPUs de 12-16 GB no hay datos de viabilidad ni de degradación por intercambio de memoria.
- Ruta de CPU: probada; en AMD EPYC 7642 con 96 CPU lógicos a 256x256 y 2 pasos, la mejor configuración medida fue de 43,54 s con 12 hilos.
- Ruta Apple silicon: se conserva la ruta residente nativa en Metal (`CMF_GPU=1 CMF_QI21_METAL_PROF=1`), pero el propio autor advierte de que no publica cifras de Metal y recomienda medir en el Mac objetivo antes de darlas por buenas.
- Opciones de despliegue: CLI de Cortiq (`cargo install cortiq-cli --locked`), en CPU (`CMF_GPU=0`), en NVIDIA/Vulkan (`XDG_RUNTIME_DIR=/tmp WGPU_BACKEND=vulkan CMF_GPU=1`) y en Metal. No aplican vLLM, TGI, llama.cpp ni Ollama, que no soportan el formato CMF de este artefacto.
- Latencia y throughput: 29,13 s por imagen a 1024x1024 y 40 pasos en RTX 4090 por Vulkan, con 0,527 s por paso de DiT y 0,81 s de decodificado VAE. No se publica throughput agregado en imágenes por segundo ni latencias en otras resoluciones.

## Comparativa con modelos similares

| Modelo | Formato y tamaño | Parámetros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| infosave/Qwen-Image-2.1-Uncensored-CMF | CMF de archivo único, 12,7 GB | 15,59B | qwen-research, no comercial | 0 descargas, 1 me gusta; runtime Cortiq 0.8.2 | Rutas CPU, Vulkan y Metal; DiT q4tp + codificadores q8_2f + VAE f16 |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | GGUF | no disponible | reportada como no comercial en fuentes secundarias | citado como origen del DiT "UC" | Su publicador afirma que no incluye verificador de seguridad; es la fuente del DiT de este artefacto |
| shriwastav/Qwen-Image-2.1-Uncensored-GGUF | GGUF (DiT) + codificador de texto y VAE en safetensors | no disponible | no disponible | orientado a ComfyUI | Requiere nodos GGUF y cargar `qwen3vl_8b_bf16` como codificador de texto y `qwen_image_2.1_vae_bf16` como VAE, según la guía encontrada |
| Qwen/Qwen-Image-2.1 (original) | safetensors/BF16 | no disponible | qwen-research | pesos oficiales; las versiones alojadas por Alibaba filtran prompts según fuentes secundarias | Referencia de calidad frente a las versiones cuantizadas; los pesos oficiales no incluirían verificador de seguridad |

Los datos de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información consultada, por lo que la comparación se limita a formato, licencia, disponibilidad y notas de despliegue.

## Limitaciones y advertencias

- Licencia: se trata de una redistribución modificada bajo la Qwen Research License Agreement. Es para uso no comercial de investigación; cualquier uso comercial exige una licencia independiente del licenciante de Qwen. Existe un archivo NOTICE en el repositorio que debe revisarse.
- Contenido sin filtro: la etiqueta "UC" se refiere a la entrada de origen, abenzerps/Qwen-Image-2.1-Uncensored-GGUF, cuyo publicador afirma que no incorpora verificador de seguridad ni filtro de contenido. Es una afirmación atribuida al upstream y no una garantía sobre cada prompt o salida de este artefacto; la responsabilidad sobre salvaguardas, políticas y cumplimiento legal recae en quien despliega el modelo.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede generar anatomías, textos, perspectivas y detalles incoherentes o inventados, especialmente con prompts largos o ambiguos. No hay datos publicados de tasas de error.
- Idiomas: los metadatos declaran únicamente inglés. No hay evidencia de soporte fiable de prompts en castellano ni en otros idiomas.
- Validación comunitaria mínima: 0 descargas y 1 "me gusta" en el momento de la consulta, con creación y última actualización el mismo día (2026-10-06). No hay informes independientes de calidad.
- Compatibilidad de runtime: probado únicamente con cortiq 0.8.2. No se documenta compatibilidad con ComfyUI, diffusers ni otras herramientas, a diferencia de las variantes GGUF alternativas.
- Rendimiento no verificado en Metal: el propio autor indica que no publica cifras de Metal y que hay que medir en el Mac objetivo antes de darlas por válidas.
- Ausencia de FP8 en la ruta medida: con el driver utilizado no había extensión matricial float8, de modo que la ejecución etiquetada como Vulkan es en realidad un respaldo f16; el rendimiento en FP8 real no está caracterizado.
- Cifras de CPU no extrapolables: los tiempos de CPU corresponden a un AMD EPYC 7642 concreto y a una carga de 256x256 con 2 pasos; no deben tomarse como referencia universal.
- Sin benchmarks de calidad: no hay FID, CLIP score ni evaluaciones comparativas que permitan cuantificar la pérdida de calidad respecto al BF16 original.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/infosave/Qwen-Image-2.1-Uncensored-CMF
- Archivos del repositorio (incluye LICENSE y NOTICE): https://huggingface.co/infosave/Qwen-Image-2.1-Uncensored-CMF/tree/main
- Runtime Cortiq: https://github.com/infosave2007/cmf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Origen de la variante sin censura: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Variante GGUF alternativa: https://huggingface.co/shriwastav/Qwen-Image-2.1-Uncensored-GGUF
- Artículo sobre cómo ejecutar Qwen-Image-2.1 en local: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Análisis sobre filtros, licencia y legalidad: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Guía de ComfyUI con GGUF y codificador "Heretic": https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/
- Guía de ejecución local en tarjeta propia: https://locallyuncensored.com/blog/how-to-run-qwen-image-2-1-locally.html
