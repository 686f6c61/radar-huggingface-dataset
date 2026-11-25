# horongbul/yame-ai-studio

## Resumen

`horongbul/yame-ai-studio` no es un modelo entrenado por su autor, sino un repositorio espejo (mirror) de los ficheros de pesos que descarga el instalador del plugin "AI 사진관 / AI Photo Studio" del editor Yame (FM27). El propósito declarado es preservar la disponibilidad del instalador en caso de que los repositorios originales se reorganicen, manteniendo los ficheros sin modificar (mismo SHA-256 que las fuentes). Por tanto, no existe un modelo único "Yame AI Studio", sino un paquete de componentes de terceros empaquetados para ComfyUI.

El repositorio agrupa dos familias de modelos generativos: por un lado, el modelo de difusión FLUX.2 [klein] 4B de Black Forest Labs junto con su text encoder Qwen3 4B y su VAE `flux2-vae`; por el otro, el modelo de vídeo Wan2.2 TI2V 5B de Wan-AI (Alibaba) con el text encoder `umt5-xxl` en fp8 y su VAE `wan2.2_vae`. Todo el contenido se distribuye bajo licencia Apache-2.0 y está pensado para ejecutarse dentro del ecosistema ComfyUI.

Su relevancia es práctica y de empaquetado, no de investigación: sirve como fuente estable de pesos para un flujo de trabajo de generación de imagen y vídeo en un editor de fotografía con IA. El tamaño del repositorio (34,3 GB) corresponde a la suma de los seis ficheros de pesos en sus formatos originales (safetensors, fp16/fp8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete multi-modelo: difusión (FLUX.2 [klein] 4B) + text encoder Qwen3 4B + VAE; y difusión de vídeo (Wan2.2 TI2V 5B) + text encoder umt5-xxl + VAE |
| Parametros totales | FLUX.2 [klein] 4B: 4B (aprox.); Qwen3: 4B; Wan2.2 TI2V: 5B; umt5-xxl: no disponible (variante XXL de umT5); VAEs: no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos de difusión; el text encoder Qwen3 4B depende de su configuración original) |
| Tipos de cuantizacion | fp16 (FLUX.2 [klein], Wan2.2 TI2V), fp8_e4m3fn_scaled (umt5-xxl); otras cuantizaciones no incluidas en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: es un espejo de pesos ya entrenados por terceros. Los componentes de imagen corresponden a FLUX.2 [klein] 4B (Black Forest Labs), un modelo de difusión de la familia FLUX.2 en variante "klein" de 4B parámetros, acompañado del text encoder Qwen3 4B y del VAE específico `flux2-vae`. Los componentes de vídeo corresponden a Wan2.2 TI2V 5B (Wan-AI), un modelo de difusión texto-imagen-a-vídeo de 5B parámetros, con el text encoder `umt5-xxl` cuantizado a fp8_e4m3fn con escalado y el VAE `wan2.2_vae`.

No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas internas de ninguno de los dos modelos. Cualquier dato de arquitectura fina (tipo de transformer, mecanismos de atención, decodificación especulativa) debe consultarse en las model cards originales de Comfy-Org, Black Forest Labs y Wan-AI.

## Capacidades

- Generación de imágenes a partir de texto mediante FLUX.2 [klein] 4B y su pipeline en ComfyUI.
- Generación de vídeo texto-imagen-a-vídeo (TI2V) mediante Wan2.2 TI2V 5B.
- Codificación de prompts de texto con Qwen3 4B (para el flujo de imagen) y umt5-xxl (para el flujo de vídeo).
- Decodificación latente a píxeles con los VAEs correspondientes (`flux2-vae` y `wan2.2_vae`).
- Integración nativa con ComfyUI como nodos de difusión, carga de text encoder y VAE.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (depende del text encoder; no documentado en el repo).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Estación de fotografía con IA en el editor Yame: el instalador del plugin "AI Photo Studio" descarga estos pesos para ofrecer generación y edición de imágenes dentro del editor, usando FLUX.2 [klein] 4B como motor de difusión.
- Generación de vídeo corto a partir de una imagen y un prompt: el flujo Wan2.2 TI2V 5B permite animar imágenes fijas en clips breves dentro de ComfyUI, útil para prototipos de contenido audiovisual.
- Reproducibilidad de instalaciones: al mantener los SHA-256 originales, el repositorio garantiza que una instalación existente del plugin siga funcionando aunque los repos de origen cambien de estructura.
- Pipelines de ComfyUI autoalojados: los ficheros pueden cargarse directamente en flujos de trabajo de ComfyUI para generación de imagen o vídeo en local, sin depender de servicios en la nube.
- Creación de assets para previsualización: generación rápida de imágenes de referencia (4B) y clips de vídeo (5B) para maquetas, storyboards o pruebas de concepto.
- Entornos con conectividad restringida o mirror interno: equipos que necesitan una copia estable y verificable de los pesos pueden sincronizar este repositorio como fuente única.
- Docencia y experimentación con modelos de difusión: permite estudiar el emparejamiento text encoder + difusión + VAE en dos modalidades (imagen y vídeo) con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en el repositorio. Como referencia de orden de magnitud, el conjunto completo ocupa 34,3 GB en disco; la inferencia requiere cargar simultáneamente el modelo de difusión, el text encoder y el VAE del flujo que se use, por lo que se recomienda consultar los requisitos de las model cards originales de Comfy-Org.
- GPU recomendadas: no disponible en la información proporcionada. Para FLUX.2 [klein] 4B y Wan2.2 TI2V 5B conviene consultar la documentación de Black Forest Labs, Wan-AI y Comfy-Org.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; depende de la cuantización y del flujo (imagen o vídeo).
- Opciones de despliegue: ComfyUI (destino principal, según los tags `comfyui` y `yame-editor`); otros runners no documentados en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (incluido) | 4B (aprox.) | Imagen texto-a-imagen | no aplica | Apache-2.0 | vía Comfy-Org |
| Wan2.2 TI2V 5B (incluido) | 5B | Vídeo texto-imagen-a-vídeo | no aplica | Apache-2.0 | vía Comfy-Org |
| `horongbul/yame-ai-studio` | paquete (4B + 5B + encoders + VAEs) | Imagen y vídeo | no aplica | Apache-2.0 | Hugging Face (mirror) |

No se dispone de datos de rendimiento comparado con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo original: es un mirror de pesos de terceros; la calidad, los sesgos y las limitaciones son las de FLUX.2 [klein] 4B, Wan2.2 TI2V 5B, Qwen3 4B y umt5-xxl, no las de un modelo propio del autor.
- Ausencia de model card técnica: no hay información sobre dataset, evaluación, sesgos ni límites de uso más allá de la tabla de ficheros.
- Riesgo de alucinación visual: como todo modelo generativo de imagen/vídeo, puede producir contenido incoherente, artefactos o representaciones inexactas; requiere revisión humana en producción.
- Idiomas no documentados: el comportamiento multilingüe de los prompts depende de los text encoders y no está verificado en este repositorio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las licencias y avisos de los autores originales (Black Forest Labs, Alibaba/Wan-AI, Google umT5, Comfy-Org).
- Dependencia de ComfyUI: los ficheros están empaquetados para ese ecosistema; su uso fuera de él requiere adaptación manual.
- Repositorio sin descargas ni likes y con fecha de creación futura en los metadatos: la trazabilidad y el mantenimiento a largo plazo no están garantizados.
- Tamaño elevado (34,3 GB): requiere espacio en disco y planificación de almacenamiento para mirrors internos.

## Enlaces

- Hugging Face: https://huggingface.co/horongbul/yame-ai-studio
- Comfy-Org/Flux-2-Klein-4B: https://huggingface.co/Comfy-Org/Flux-2-Klein-4B
- Comfy-Org/Wan_2.2_ComfyUI_Repackaged: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Black Forest Labs (FLUX.2): no disponible en la búsqueda web
- Wan-AI (Wan2.2): no disponible en la búsqueda web
- ComfyUI: no disponible en la búsqueda web
- Paper, blog o demo adicionales: no disponible
