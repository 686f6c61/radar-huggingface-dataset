# Comfy-Org/Chroma1-HD_repackaged

## Resumen

Chroma1-HD_repackaged es un repositorio de empaquetado (repackaging) publicado por Comfy-Org que distribuye los pesos del modelo de difusión texto-a-imagen Chroma1-HD en formato de archivo único (single-file) listo para cargarse directamente en ComfyUI. No se trata de un modelo nuevo: el autor original del modelo es lodestones, y Comfy-Org se limita a reorganizar los ficheros `Chroma1-HD.safetensors` y `Chroma1-HD-fp8mixed.safetensors` (este último procedente de silveroxides/Chroma1-HD-fp8-scaled) para que encajen en la carpeta `models/diffusion_models/` de ComfyUI sin pasos intermedios de conversión.

El problema que resuelve es puramente operativo: los modelos de difusión modernos suelen publicarse en múltiples ficheros (componentes de texto, VAE, UNet/DiT) o en formatos que requieren scripts de conversión. Este repackaging entrega un único `.safetensors` por variante, con una variante fp8 mixta pensada para reducir requisitos de VRAM, y una plantilla de workflow oficial (`image_chroma_text_to_image.json`) que permite ejecutar la generación texto-a-imagen en ComfyUI con una configuración mínima.

Es relevante ahora porque ComfyUI se ha convertido en el entorno de facto para flujos de difusión modulares y porque la disponibilidad de pesos en formato single-file, con licencia Apache 2.0 y variantes cuantizadas, facilita el despliegue en hardware de consumo. La información disponible no detalla arquitectura interna, número de parámetros ni longitud de contexto, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; arquitectura interna no documentada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto-a-imagen; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | fp8 mixta (`Chroma1-HD-fp8mixed.safetensors`) y pesos completos (`Chroma1-HD.safetensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (los prompts se procesan mediante el codificador de texto del pipeline, no documentado aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, `diffusion-single-file`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Chroma1-HD: no se especifica si emplea un transformer de difusion (DiT), un UNet o un esquema hibrido, ni se detalla el codificador de texto asociado. El repositorio de Comfy-Org no contiene model card tecnica propia; remite a `lodestones/Chroma1-HD` y a `silveroxides/Chroma1-HD-fp8-scaled` como fuentes originales de los pesos.

Tampoco se documentan volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atención lineal. Lo unico verificable es el proceso de empaquetado: los pesos se distribuyen como ficheros `.safetensors` individuales, con una variante fp8 mixta generada por silveroxides para reducir huella de memoria, y una plantilla de workflow oficial de Comfy-Org para ejecucion texto-a-imagen.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline `text-to-image`).
- Carga directa en ComfyUI como modelo de difusion single-file, sin conversion previa.
- Dos variantes de precision: pesos completos y fp8 mixta, para ajustar calidad frente a consumo de VRAM.
- Integracion con el workflow oficial `image_chroma_text_to_image.json` de Comfy-Org.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision de entrada, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado rapido de generacion de imagenes en ComfyUI: al ser single-file, basta copiar `Chroma1-HD.safetensors` en `models/diffusion_models/` y cargar la plantilla oficial, eliminando la friccion de convertir pesos multi-componente.
- Despliegue en GPU de consumo con la variante fp8 mixta: `Chroma1-HD-fp8mixed.safetensors` reduce el peso en memoria respecto a los pesos completos, lo que permite ejecutar el modelo en tarjetas con VRAM limitada dentro de ComfyUI.
- Generacion por lotes en pipelines internos: al integrarse como nodo de difusion en ComfyUI, el modelo puede encadenarse con nodos de postproceso (upscale, inpainting, control de composicion) para producir lotes de imagenes de forma reproducible.
- Creacion de assets para producto y marketing: prompts descriptivos alimentan la generacion de bocetos e imagenes de referencia que luego se refinan en el mismo grafo de ComfyUI, aprovechando la naturaleza modular del entorno.
- Experimentacion e investigacion en difusion: al estar bajo Apache 2.0 y con pesos en safetensors, el modelo puede inspeccionarse, compararse con otros checkpoints y servir de base para fine-tuning o para estudios de cuantizacion fp8.
- Educacion y demos tecnicas: el workflow oficial y los ficheros single-file facilitan talleres y tutoriales sobre pipelines de difusion en ComfyUI sin dependencias de conversion.
- Automatizacion de variaciones visuales: combinando el modelo con nodos de seed y prompt scheduling en ComfyUI se generan familias de variaciones coherentes a partir de una descripcion base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros modelos de difusion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El tamano total del repositorio es de 27,0 GB, lo que incluye ambas variantes de pesos; la variante fp8 mixta esta pensada para reducir el consumo frente a los pesos completos, pero no se publica una cifra concreta de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: la existencia de una variante fp8 mixta sugiere orientacion hacia hardware con VRAM limitada, pero no se confirma que modelos concretos (RTX 4090, RTX 3090, etc.) sean suficientes.
- Opciones de despliegue: ComfyUI (entorno objetivo declarado, con carpeta `models/diffusion_models/`). Otros runners como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo o no estan documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de Chroma1-HD ni de alternativas comparables, por lo que no es posible construir una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Este repositorio es un repackaging: no aporta model card tecnica propia ni garantiza el comportamiento del modelo original; cualquier cambio en `lodestones/Chroma1-HD` debe consultarse en el repositorio fuente.
- La variante fp8 mixta puede introducir perdida de calidad respecto a los pesos completos; no se documenta el impacto cualitativo.
- No se documentan sesgos del modelo base ni sesgos del dataset de entrenamiento.
- Riesgo de alucinacion visual (artefactos, incoherencias semantica o anatomica) no cuantificado en la informacion disponible.
- Idiomas soportados por el codificador de texto: no disponible; el rendimiento multilingue de los prompts no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los repositorios fuente (`lodestones/Chroma1-HD`, `silveroxides/Chroma1-HD-fp8-scaled`) y de cualquier componente adicional del pipeline.
- No se especifican requisitos de VRAM ni GPU validados, por lo que la planificacion de produccion exige pruebas propias.
- El repositorio se actualizo en 2026-10-28 y fue creado en 2025-12-31; conviene comprobar la version de ComfyUI y la compatibilidad del workflow oficial antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Chroma1-HD_repackaged
- Modelo base original: https://huggingface.co/lodestones/Chroma1-HD
- Variante fp8 escalada: https://huggingface.co/silveroxides/Chroma1-HD-fp8-scaled
- Pesos completos (descarga directa): https://huggingface.co/lodestones/Chroma1-HD/resolve/main/Chroma1-HD.safetensors
- Workflow oficial texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chroma_text_to_image.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
