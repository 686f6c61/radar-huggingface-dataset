# Comfy-Org/YuE2

## Resumen

YuE2 es un modelo de generación de música a partir de texto (text-to-music) distribuido en formato empaquetado para ComfyUI por Comfy-Org. Se trata de un reempaquetado de los pesos originales de `m-a-p/YuE2-3B`, un modelo de 3.000 millones de parámetros desarrollado por el grupo m-a-p (Multimodal Art Projection), junto con `m-a-p/SheetSage2`, un codificador de audio empleado en el pipeline. El repositorio de Comfy-Org no entrena ni modifica el modelo: únicamente convierte los pesos a un único fichero safetensors en bf16 listo para cargarse en los nodos de audio de ComfyUI.

El modelo resuelve la tarea de síntesis musical condicionada por descripción textual, así como la generación de versiones o *covers* a partir de una referencia musical. Su relevancia actual radica en que ComfyUI se ha convertido en el entorno de facto para pipelines generativos multimodales, y este reempaquetado permite integrar generación musical dentro de grafos que ya combinan imagen, vídeo y audio sin necesidad de montar un stack de inferencia separado.

La información pública disponible sobre esta ficha es limitada: la model card del reempaquetado se limita a instrucciones de instalación y a dos workflows de ejemplo (text-to-music y music cover). Los detalles de arquitectura interna, datos de entrenamiento y benchmarks no están documentados en la información proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `m-a-p/YuE2-3B`; codificador de audio `m-a-p/SheetSage2`) |
| Parametros totales | 3.000 millones (según el nombre del modelo base `YuE2-3B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato publicado en este repo: `yue2_3b_bf16.safetensors`, `sheetsage2_bf16.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-nc-4.0 (Creative Commons Atribución-NoComercial 4.0) |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |
| Tamaño del repositorio | 15,9 GB |
| Modalidad | audio (generación musical) |
| Modelo base | `m-a-p/YuE2-3B`, `m-a-p/SheetSage2` |
| Descargas / likes | 272.669 / 336 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El tag `diffusion-single-file` sugiere un pipeline de difusión empaquetado en un único fichero, y el nombre del modelo base (`YuE2-3B`) indica un transformer de 3.000 millones de parámetros. El pipeline combina dos componentes: el modelo generativo principal (`yue2_3b_bf16.safetensors`, ubicado en `models/checkpoints/`) y un codificador de audio (`sheetsage2_bf16.safetensors`, ubicado en `models/audio_encoders/`) derivado de SheetSage2, presumiblemente empleado para la representación o el condicionamiento sobre audio de referencia en el flujo de *music cover*.

Tampoco se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio de Comfy-Org es un reempaquetado, por lo que los detalles de entrenamiento corresponderían a la model card original de `m-a-p/YuE2-3B`, que no forma parte de los datos proporcionados. Cualquier afirmación sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de música a partir de descripciones textuales (text-to-music), mediante el workflow `audio_yue2_text2music.json`.
- Generación de *covers* musicales a partir de una referencia de audio, mediante el workflow `audio_yue2_music_cover.json`.
- Producción de audio musical completo, no limitada a melodía o acompañamiento aislado, según los ejemplos publicados.
- Integración nativa en ComfyUI como nodos dentro de grafos generativos, lo que permite encadenar la salida musical con otros modelos del mismo entorno.
- Codificación de audio de referencia mediante SheetSage2 para condicionar la generación.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la información no documenta el tratamiento de idiomas en los prompts.
- Modo *thinking*, visión o audio de entrada conversacional: no disponible.

## Casos de uso

- **Prototipado rápido de bandas sonoras en ComfyUI**: un desarrollador puede insertar el nodo YuE2 en un grafo existente y generar una pista musical a partir de un prompt descriptivo, reutilizando el mismo entorno donde ya produce imágenes o vídeo para un tráiler o demo.
- **Generación de música de fondo para vídeo corto**: el workflow text-to-music permite producir pistas instrumentales ajustadas a una descripción de estilo y estado de ánimo, que después se mezclan con el vídeo generado en el mismo pipeline de ComfyUI.
- **Creación de *covers* y variaciones**: el workflow `audio_yue2_music_cover.json` permite tomar una referencia musical y generar una nueva versión condicionada por ella, útil para explorar arreglos alternativos o adaptaciones de estilo sobre material propio.
- **Iteración creativa en estudios pequeños**: al ser un modelo de 3.000 millones de parámetros en bf16, puede ejecutarse en hardware de gama alta de consumo o en una única GPU de datacenter, lo que facilita ciclos de prueba y error sin depender de APIs externas.
- **Investigación en generación musical**: sirve como base reproducible para experimentos académicos sobre condicionamiento textual y de audio, dado que los pesos y los workflows están publicados abiertamente (con restricción no comercial).
- **Educación y demostraciones**: la instalación en dos ficheros y los workflows predefinidos hacen viable montar talleres o demos de generación musical sin infraestructura compleja.
- **Automatización de assets internos**: para equipos que producen contenido multimedia de forma iterativa, el modelo puede integrarse en scripts que invoquen ComfyUI por línea de comandos y generen variantes musicales de forma por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se documenta de forma oficial. Como referencia orientativa basada en el tamaño de los pesos (3.000 millones de parámetros en bf16, aproximadamente 6 GB solo para el modelo principal, más el codificador SheetSage2 y los buffers de activación), se requiere previsiblemente una GPU con al menos 12-16 GB de VRAM; esta cifra es una estimación y no un dato confirmado por el autor.
- **GPU recomendadas**: no disponibles en la documentación. Por tamaño, cabría esperar ejecución en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100; no se confirma compatibilidad con GPUs de 8 GB.
- **¿Cabe en GPU de consumo?**: probablemente sí en modelos con 16 GB o más de VRAM, dado el tamaño del checkpoint en bf16; no confirmado oficialmente.
- **Opciones de despliegue**: ComfyUI (soporte nativo mediante los workflows publicados). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para un modelo de difusión de audio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuE2 (este repo) | 3.000 M | no disponible | Texto/audio a música | cc-by-nc-4.0 | Hugging Face, ComfyUI |
| MusicGen (Meta) | 300 M – 3.300 M | no disponible | Texto a música | CC-BY-NC 4.0 (pesos) | Hugging Face, código abierto |
| Stable Audio Open | ~1.200 M | no disponible | Texto a audio/música | Stability AI Community License | Hugging Face |
| AudioLDM 2 | ~700 M | no disponible | Texto a audio/música | CC-BY-NC-SA | Hugging Face |

La comparación se limita a categoría, tamaño y licencia; no se dispone de datos de benchmarks de YuE2 en la información proporcionada que permitan una comparación cuantitativa de calidad. Las cifras de los modelos alternativos corresponden a sus especificaciones públicas habituales y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- **Licencia no comercial**: cc-by-nc-4.0 prohíbe explícitamente el uso comercial del modelo y de sus derivados sin autorización adicional del titular. Cualquier producto, servicio o contenido monetizado requiere una licencia aparte.
- **Información técnica incompleta**: la model card del reempaquetado no documenta arquitectura, datos de entrenamiento, contexto ni idiomas, lo que dificulta evaluar su idoneidad para producción sin consultar los repositorios originales.
- **Riesgo de alucinación y artefactos**: no hay documentación sobre la fidelidad de la generación musical ni sobre la calidad subjetiva de las pistas; como todo modelo generativo de audio, puede producir artefactos, incoherencias rítmicas o resultados alejados del prompt.
- **Sesgos de estilo y datos**: al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de género musical, representación cultural o calidad por idioma en las descripciones textuales.
- **Dependencia del entorno ComfyUI**: los pesos están empaquetados para ComfyUI; su uso fuera de ese entorno requiere adaptar los ficheros y el pipeline, algo no documentado.
- **Sin garantías de soporte**: es un reempaquetado de terceros (Comfy-Org), no una publicación oficial de m-a-p; la resolución de problemas depende de la comunidad.
- **Tamaño del repositorio**: 15,9 GB, lo que exige espacio en disco y ancho de banda considerables para la descarga inicial.

## Enlaces

- Repositorio Hugging Face (este reempaquetado): https://huggingface.co/Comfy-Org/YuE2
- Modelo base original: https://huggingface.co/m-a-p/YuE2-3B
- Codificador de audio original: https://huggingface.co/m-a-p/SheetSage2
- Workflow text-to-music: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_yue2_text2music.json
- Workflow music cover: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_yue2_music_cover.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
