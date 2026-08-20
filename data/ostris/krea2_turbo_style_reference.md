# ostris/krea2_turbo_style_reference

## Resumen

`ostris/krea2_turbo_style_reference` es un adaptador LoRA (Low-Rank Adapter) entrenado por ostris para el modelo de difusión Krea-2-Turbo de Krea. Su función principal es permitir la transferencia de estilo a partir de una o dos imágenes de referencia, de modo que el texto prompt genera contenido nuevo con la estética visual de la imagen proporcionada. A diferencia de otros adaptadores de estilo, este LoRA no requiere ninguna palabra desencadenante (trigger word): basta con pasar la imagen de referencia junto al prompt.

El adaptador se entrenó con AI Toolkit, utilizando el entrenador experimental de imágenes de referencia de Krea2 con el adaptador turbo, sobre miles de pares de estilo curados manualmente por el autor a lo largo de varios años. El repositorio ocupa 0,5 GB y se distribuye bajo la licencia comunitaria Krea-2. Su relevancia radica en que ofrece un control de estilo fino y reproducible sobre un modelo de difusión de última generación, con integración directa en ComfyUI y en el ecosistema diffusers mediante un pipeline comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adapter) sobre Krea-2-Turbo |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (no aplica a un adaptador LoRA) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se inserta en las capas de atención del modelo base Krea-2-Turbo. Se entrenó con AI Toolkit, empleando el entrenador experimental de referencia de imágenes de Krea2 junto con el adaptador turbo, que acelera la convergencia y reduce el número de pasos de inferencia necesarios. El conjunto de datos de entrenamiento está compuesto por miles de pares de estilo curados manualmente por ostris, lo que permite al LoRA capturar la relación entre una imagen de referencia y el estilo visual resultante. El entrenamiento se diseñó para manejar una o dos imágenes de referencia simultáneamente, y no requiere trigger word en la inferencia.

## Capacidades

- Transferencia de estilo a partir de una o dos imágenes de referencia, manteniendo el contenido descrito en el prompt de texto.
- Inferencia sin trigger word: solo se necesita la imagen de referencia y el prompt.
- Compatibilidad con ComfyUI mediante el nodo custom `ComfyUI-Krea2-Ostris-Edit`.
- Compatibilidad con diffusers a través del pipeline comunitario `ostris/Krea2OstrisEdit`.
- Generación text-to-image con control estilístico explícito sobre el modelo Krea-2-Turbo.
- Soporte para múltiples imágenes de referencia (hasta dos) para combinar estilos.

## Casos de uso

- Rebranding visual de marca: una empresa puede generar variaciones de sus productos o campañas aplicando una imagen de referencia con la nueva identidad visual, manteniendo coherencia estética en todas las piezas.
- Ilustración editorial: un estudio puede transferir el estilo de un ilustrador concreto a nuevas composiciones descritas por texto, acelerando la producción de portadas o viñetas.
- Diseño de producto: generar propuestas de diseño de packaging o prototipos con una estética definida por una imagen de referencia, sin necesidad de rediseñar desde cero cada variante.
- Concept art para videojuegos: los artistas pueden explorar rápidamente distintas direcciones de arte aplicando el estilo de una pintura o render de referencia a escenas descritas por prompt.
- Creación de contenido para redes sociales: mantener un estilo visual unificado en una serie de publicaciones generadas por IA, usando una única imagen de referencia como guía estilística.
- Prototipado de dirección de arte: en campañas publicitarias, se pueden generar múltiples propuestas visuales con estilos diferentes a partir de referencias, para que el cliente elija antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,5 GB, pero requiere el modelo base Krea-2-Turbo para funcionar.
- Según el README del autor, la inferencia con el pipeline de diffusers necesita aproximadamente 40 GB de VRAM si se carga el modelo completo en GPU (`pipe.to("cuda")`).
- Con `enable_model_cpu_offload()` se puede reducir el pico de VRAM, a costa de mayor latencia.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, o configuraciones con múltiples GPUs. Una RTX 4090 (24 GB) no es suficiente para carga completa en GPU sin offload.
- Opciones de despliegue: ComfyUI con el nodo custom `ComfyUI-Krea2-Ostris-Edit`, o diffusers con el pipeline comunitario `ostris/Krea2OstrisEdit`.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Referencia de estilo | Trigger word | Licencia |
|---|---|---|---|---|---|
| ostris/krea2_turbo_style_reference | LoRA | Krea-2-Turbo | 1-2 imagenes | No | krea-2-community-license |
| krea-2/turbo/style (fal-ai) | Servicio API | Krea-2-Turbo | Imagen de referencia | No | Propietaria (API) |
| Otros LoRA de estilo para SDXL | LoRA | SDXL | Variable | Generalmente si | Variable |

La comparativa con `krea-2/turbo/style` de fal-ai es relevante porque ambos apuntan a la misma tarea, pero el de ostris se distribuye como pesos abiertos bajo licencia comunitaria, mientras que el de fal-ai se ofrece como servicio API propietario. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- La licencia `krea-2-community-license` puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia en el repositorio del modelo base antes de desplegar en producción.
- El adaptador depende completamente del modelo base Krea-2-Turbo; cualquier limitación o sesgo de este modelo se hereda.
- Solo admite una o dos imágenes de referencia; no está diseñado para combinar más de dos estilos simultáneamente.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales específicas para este adaptador.
- El tamaño del modelo base (40 GB+ de VRAM) limita su despliegue a hardware profesional o a configuraciones con offload de CPU, lo que puede afectar a la latencia en entornos de producción.
- No hay información sobre el número exacto de parámetros del LoRA ni sobre el rank utilizado, lo que dificulta estimar su huella de memoria adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ostris/krea2_turbo_style_reference
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Pipeline comunitario para diffusers: https://huggingface.co/ostris/Krea2OstrisEdit
- Nodo custom para ComfyUI: https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit
- AI Toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-07-09-krea2-turbo-style-reference-lora-ostris
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/krea2-turbo-style-reference-ostris
