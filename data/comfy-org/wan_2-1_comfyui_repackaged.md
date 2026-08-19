# Comfy-Org/Wan_2.1_ComfyUI_repackaged

## Resumen

Wan 2.1 es una familia de modelos de generación de vídeo por difusión, originalmente desarrollada por Alibaba, y este repositorio ofrece un reempaquetado de sus pesos en formato `safetensors` para su uso directo con ComfyUI. El repositorio, mantenido por Comfy-Org, agrupa múltiples variantes del modelo: texto a vídeo (t2v), imagen a vídeo (i2v), control, inpainting, cámara, así como los codificadores de texto (UMT5) y el VAE necesarios para el pipeline completo. Con un tamaño total de 543,8 GB, incluye versiones de 1.3B y 14B parámetros en distintas precisiones (bf16, fp16, fp8), lo que permite elegir entre calidad y requisitos de hardware.

Este reempaquetado es relevante porque simplifica la instalación en ComfyUI, evitando la descarga de archivos desde múltiples fuentes y garantizando la compatibilidad con los nodos oficiales. Al ser un modelo de código abierto (aunque la licencia exacta no se indica en esta página), Wan 2.1 se posiciona como una alternativa accesible a soluciones propietarias de generación de vídeo, con capacidades de alta resolución (480p y 720p) y control fino mediante LoRA y parches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (no se especifica el tipo exacto, probablemente U-Net o DiT) |
| Parametros totales | Variantes de 1.3B y 14B (segun nombres de archivo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, fp8_e4m3fn, fp8_scaled (segun nombres de archivo) |
| Idiomas soportados | no disponible (se asume multilingue por el codificador UMT5, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles oficiales sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados en la model card de este repositorio. A partir de los nombres de archivo se deduce que el modelo sigue un esquema de difusion para video, con un codificador de texto UMT5 (probablemente basado en T5) y un VAE propio. Las variantes de 1.3B y 14B sugieren que se trata de modelos de diferente capacidad, y las opciones de cuantizacion (fp8, bf16) indican que se han optimizado para inferencia eficiente. No hay informacion sobre tecnicas como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (archivos `wan2.1_t2v_*`).
- Generacion de video a partir de imagen (archivos `wan2.1_i2v_*`).
- Control de camara (archivos `wan2.1_fun_camera_*`).
- Inpainting de video (archivos `wan2.1_fun_inp_*`).
- Control condicional (archivos `wan2.1_fun_control_*`).
- Generacion de video con canal alfa (LoRA `wan_alpha_2.1_rgba_lora` y VAE especiales).
- Parches para sincronizacion labial (archivos `wan2.1_infiniteTalk_*`).
- Soporte de resoluciones de 480p y 720p (segun nombres de archivo).
- Integracion nativa con ComfyUI mediante archivos reempaquetados.

## Casos de uso

- Creacion de contenido audiovisual para marketing: generar clips promocionales cortos a partir de descripciones textuales, aprovechando las variantes t2v de 720p para calidad alta.
- Prototipado rapido de storyboards: usar la variante i2v para animar imagenes fijas y visualizar secuencias antes de produccion completa.
- Postproduccion de video: aplicar inpainting (`wan2.1_fun_inp_*`) para eliminar objetos no deseados o rellenar regiones en secuencias existentes.
- Sincronizacion labial para doblaje: emplear los parches `infiniteTalk` para ajustar el movimiento de los labios en videos generados o reales.
- Generacion de contenido con transparencia: la LoRA `wan_alpha_2.1_rgba_lora` junto con los VAE de canal alfa permite crear videos con fondo transparente, util para overlays en produccion.
- Experimentacion artistica y educativa: investigadores y artistas pueden explorar la generacion de video condicionada por texto o imagen, gracias a la facilidad de integracion en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card.
- Los archivos de 14B en bf16/fp16 ocupan aproximadamente 28 GB cada uno, lo que requiere una GPU con al menos 32 GB de VRAM para inferencia sin cuantizacion.
- Las versiones fp8 de 14B reducen el peso a unos 14 GB, pudiendo caber en GPUs de 16 GB como la RTX 4090, aunque con limitaciones de memoria para el resto del pipeline.
- Las variantes de 1.3B son mucho mas ligeras (unos 2-3 GB en bf16) y pueden ejecutarse en GPUs de 8 GB o menos.
- Para despliegue, ComfyUI es la opcion principal; tambien se podria usar con otros frameworks que soporten safetensors, pero no se mencionan alternativas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de generacion de video (como Sora, Stable Video Diffusion, etc.) a partir de los datos proporcionados. Se recomienda consultar la documentacion oficial de Wan 2.1 para obtener benchmarks y comparaciones.

## Limitaciones y advertencias

- No se indica la licencia, por lo que el uso comercial debe verificarse con los terminos originales de Wan 2.1 (probablemente Apache 2.0, pero no confirmado).
- El repositorio es solo un empaquetado de pesos; no incluye documentacion sobre sesgos, alucinaciones o limitaciones de contenido.
- El tamaño total del repositorio (543,8 GB) implica una descarga muy grande y requiere planificacion de almacenamiento.
- Las variantes de 14B exigen hardware de gama alta para un rendimiento aceptable; en GPUs de consumo puede ser necesario usar cuantizacion fp8 y reducir la resolucion.
- No se especifican los idiomas soportados por el codificador de texto; aunque UMT5 es multilingue, no hay garantia de calidad en todos los idiomas.

## Enlaces

- Repositorio HuggingFace: [Comfy-Org/Wan_2.1_ComfyUI_repackaged](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged)
- Ejemplos de uso en ComfyUI: [https://comfyanonymous.github.io/ComfyUI_examples/wan](https://comfyanonymous.github.io/ComfyUI_examples/wan)
