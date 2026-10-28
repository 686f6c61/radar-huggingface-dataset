# gwd200/minimax-h3-weights

## Resumen

`gwd200/minimax-h3-weights` no es un modelo nuevo, sino un espejo (mirror) de los pesos oficiales del flujo MiniMax H3 Ref2VA para ComfyUI, publicados en BF16 sin poda ni cuantización. El repositorio agrupa los cuatro componentes que necesita el grafo nativo: un modelo de difusión principal para vídeo (66,3 GB), un encoder de texto y visión basado en Qwen3-VL de 32B (51,5 GB), un VAE de vídeo en FP16 (5,2 GB) y un VAE de audio en FP32 (605 MB). En total, 123,6 GB de pesos en formato `safetensors`.

El problema que resuelve es de reproducibilidad: los pesos se copian desde `Comfy-Org/MiniMax-H3` y desde un repositorio con acceso restringido (`sasoriiii/test-v2`) para que un despliegue interno pueda descargarse y verificarse sin depender de que los repositorios originales sigan disponibles. Cada fichero es idéntico byte a byte al original y el repositorio incluye un `manifest.json` con tamaños, SHA256 y revisión de origen, además de un script `pull_weights.py` que verifica integridad y reanuda descargas.

Por su naturaleza, la ficha refleja las limitaciones de la información disponible: el autor no publica número de parámetros del modelo de difusión, longitud de contexto, idiomas soportados ni resultados de benchmarks. La relevancia práctica es acotada: sirve para montar el pipeline de generación de vídeo (y audio) en ComfyUI de forma verificable, no como distribución con derechos nuevos. Las fechas del repositorio son del 28 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (variante interna no especificada: no se indica si es DiT, UNet o híbrida) + encoder texto/visión Qwen3-VL 32B + VAE de vídeo + VAE de audio |
| Parametros totales | no disponible. Estimación derivada del tamaño de fichero: el modelo de difusión en BF16 (66,3 GB) equivaldría a unos 33 000 M de parámetros si todo el peso fuese BF16 sin overhead; cifra no publicada por el autor |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el encoder es Qwen3-VL 32B, pero no se declara su ventana) |
| Tipos de cuantizacion | Solo pesos originales: BF16 (difusión y encoder), FP16 (VAE de vídeo), FP32 (VAE de audio). No se incluyen variantes cuantizadas, podadas ni reexportadas |
| Idiomas soportados | no disponible |
| Licencia | `other`: uso sujeto a los términos upstream de `Comfy-Org/MiniMax-H3` y `sasoriiii/test-v2`; el repositorio solo replica ficheros |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

La información disponible describe la composición del pipeline, no su diseño interno. Se trata de un sistema de generación de vídeo por difusión que se acompaña de un VAE de audio independiente en FP32 (605 MB), lo que indica que el flujo genera también audio, y de un encoder texto/visión de 32B basado en Qwen3-VL, lo que habilita condicionamiento conjunto de texto e imagen de referencia. El nombre del flujo, Ref2VA, y las etiquetas `text-to-video` e `image-to-video` apuntan a generación de vídeo (con audio) a partir de referencias textuales o visuales, pero el autor no detalla el mecanismo.

No se publican datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, destilación de pasos). Un detalle relevante es que el encoder incluido no es el oficial: el fichero se llama `qwen3vl_32b_h3_ultra_uncensored_heretic_bf16.safetensors` y procede de un repositorio con acceso restringido, por lo que se trata de una variante ajustada para eliminar filtros de seguridad, no del encoder canónico de MiniMax. El repositorio declara explícitamente que cada fichero es idéntico a su origen y que los SHA256 son los upstream.

## Capacidades

- Generación de vídeo a partir de texto, según la etiqueta `text-to-video` del repositorio.
- Generación de vídeo a partir de imagen, que es el `pipeline` declarado (`image-to-video`).
- Generación de audio asociada al vídeo, inferida de la presencia de un VAE de audio dedicado en FP32; el autor no documenta si el audio es nativo, doblaje o efectos.
- Condicionamiento por referencia visual: el encoder es un Qwen3-VL de 32B, es decir, un modelo multimodal texto-imagen, lo que permite usar imágenes como entrada de control.
- Integración nativa con ComfyUI (`library_name: comfyui`), con rutas pensadas para `ComfyUI/models/`.
- Verificación de integridad y descarga reproducible mediante `manifest.json`, `pull_weights.py` y `hf download`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking ni soporte multilingüe explícito.

## Casos de uso

- Despliegue reproducible en ComfyUI: el equipo descarga los cuatro ficheros con `pull_weights.py`, comprueba SHA256 contra `manifest.json` y monta el grafo Ref2VA sin depender de que los repositorios upstream sigan accesibles. Adecuado para entornos con requisitos de trazabilidad.
- Replicación de un entorno interno de I+D: el repositorio se vincula a un registro de despliegue privado (`gwd200/minimax-h3-tests`) con scripts de job, workflows, UI y logs, lo que permite reconstruir una configuración concreta de experimentos.
- Generación de vídeo con audio para previsualización de guion: a partir de una imagen de referencia y una descripción textual se obtienen clips con pista de audio, útiles en preproducción antes de rodar.
- Creación de material para pruebas de pipelines de postproducción: al disponer del VAE de vídeo y del VAE de audio por separado, se pueden testear etapas de codificación/decodificación y sincronización sin generar contenido final.
- Anonimización de un proveedor externo: al alojar 123,6 GB de pesos en infraestructura propia, el contenido generado no sale de la red interna, lo que encaja en flujos con datos sensibles.
- Investigación sobre encoders multimodales: el repo permite comparar el comportamiento de un Qwen3-VL 32B estándar frente a la variante sin filtros incluida aquí, en tareas de condicionamiento visual.
- Archivo a largo plazo de una versión concreta: fijar la revisión `e5eb578a89295337b8ff433a035929ce0279e0b6` permite reproducir resultados meses después aunque upstream cambie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de vídeo (FVD, CLIP score, VBench), de audio, ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencias ni pasos de muestreo.

## Requisitos de hardware

- VRAM total de pesos: 123,6 GB. Solo el modelo de difusión ocupa 66,3 GB en BF16 y el encoder 51,5 GB, por lo que no caben simultáneamente en una GPU de 80 GB sin offloading.
- GPU de datacenter: el modelo de difusión en BF16 encaja en una A100 80 GB o H100 80 GB; el encoder requiere ejecutarse en una segunda GPU o descargarse secuencialmente a CPU entre etapas.
- Configuración recomendada: 2× A100 80 GB o 2× H100 80 GB para mantener difusión y encoder residentes y evitar transferencias por PCIe.
- GPU de consumo: una RTX 4090 (24 GB) no puede mantener los pesos en BF16; exigiría técnicas de offloading por bloques propias de ComfyUI, con caída severa de throughput. No es un escenario práctico sin cuantizar.
- Almacenamiento: al menos 124 GB libres para los pesos, más espacio para el manifest y posibles descargas parciales; se recomienda `hf_xet` para transferencias por chunks.
- Opciones de despliegue: ComfyUI es el soporte nativo declarado. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un pipeline de difusión de este tipo. La descarga puede hacerse con `huggingface_hub` o con la CLI `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| `gwd200/minimax-h3-weights` (este repo) | no disponible (~33 000 M estimados solo en difusión) | no disponible | `other` | Público en HF, 0 descargas | no disponible |
| MiniMax H3 Ref2VA oficial (`Comfy-Org/MiniMax-H3`) | no disponible en la información | no disponible | términos upstream | Repositorio oficial en HF | no disponible |
| Otras familias de vídeo open source (Wan, HunyuanVideo, LTX-Video) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables para establecer una comparación cuantitativa con alternativas de la misma categoría. La única diferencia contrastable frente al repositorio oficial es la del encoder: aquí se sustituye por `qwen3vl_32b_h3_ultra_uncensored_heretic_bf16`, una variante de un repo restringido que no forma parte de la distribución canónica.

## Limitaciones y advertencias

- No es una distribución oficial: es un espejo. No concede derechos nuevos ni soporte; el uso se rige por los términos upstream, que no se detallan en la model card.
- La licencia `other` sin texto explícito impide asumir uso comercial permitido. Cualquier despliegue en producción requiere revisar las condiciones de `Comfy-Org/MiniMax-H3` y de `sasoriiii/test-v2`.
- El encoder procede de un repositorio con acceso restringido y su nombre indica que ha sido modificado para retirar filtros de seguridad ("uncensored", "heretic"). Esto reduce las salvaguardas frente a contenido dañino y puede alterar el comportamiento respecto al modelo original.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de vídeo, coherencia temporal, sincronización de audio ni fidelidad a la referencia.
- Riesgo de alucinación visual y artefactos inherente a los modelos de difusión de vídeo; no cuantificado por el autor.
- Sin datos de sesgos, idiomas soportados ni comportamiento multilingüe. No se puede garantizar calidad fuera del inglés.
- Huella de 123,6 GB sin variantes cuantizadas oficiales: el repositorio no ofrece FP8, GGUF ni podas, lo que excluye hardware de consumo y encarece el almacenamiento.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso ni validación por terceros.
- El enlace a `gwd200/minimax-h3-tests` apunta a un registro de despliegue privado, por lo que la reproducibilidad completa no es verificable públicamente.
- Inconsistencia menor en las fechas: el repositorio figura como creado el 28 de octubre de 2026, posterior a la fecha habitual de consulta; conviene verificar la marca temporal antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gwd200/minimax-h3-weights
- Repositorio upstream del modelo de difusión y los VAE: https://huggingface.co/Comfy-Org/MiniMax-H3 (revisión `e5eb578a89295337b8ff433a035929ce0279e0b6`)
- Repositorio upstream del encoder texto/visión (acceso restringido): https://huggingface.co/sasoriiii/test-v2 (revisión `c5f79b74854c10757f31b771a887c818f670d236`)
- Registro de despliegue privado asociado: https://huggingface.co/gwd200/minimax-h3-tests
- No se han encontrado en la búsqueda papers, blogs técnicos, demos ni repositorios de código adicionales.
