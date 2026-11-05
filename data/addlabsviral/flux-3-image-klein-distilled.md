# addlabsviral/flux-3-image-klein-distilled

## Resumen

FLUX 3 Image Klein es un modelo de difusión de pesos abiertos desarrollado por Black Forest Labs para generación de imágenes a partir de texto y edición de imágenes. El checkpoint alojado en `addlabsviral/flux-3-image-klein-distilled` es una redistribución del modelo destilado oficial, con 5.548.681.984 parámetros en el transformer de imagen (el codificador de texto es un componente separado, Qwen3-VL-4B-Instruct). Acepta un prompt y hasta 10 imágenes de referencia, y devuelve una única imagen, unificando text-to-image, edición con una referencia y composición con múltiples referencias en un solo modelo.

La relevancia de este checkpoint radica en su naturaleza destilada: reduce el muestreo a 16 pasos sin guidance, frente a los 50 pasos con guidance 3.5 del checkpoint Base no destilado, lo que abarata sustancialmente la inferencia y lo hace viable para autoalojamiento. Incluye variantes cuantizadas FP8 y NVFP4 además del transformer en BF16, junto con el autoencoder de imagen y el codificador de texto.

Una advertencia operativa importante: el modelo está diseñado para recibir descripciones de escena completas, no prompts cortos. El autor indica explícitamente que debe usarse con un amplificador de prompts (prompt upsampler), ya sea el oficial `flux-3-image-klein-pup` o cualquier LLM con un system prompt adecuado; enviar un prompt breve tal cual produce resultados genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) con transformer de imagen; codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imagen |
| Parametros totales | 5.548.681.984 (transformer de imagen; el codificador de texto es adicional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (raíz), FP8 (`variants/fp8r`), NVFP4 (`variants/nvfp4`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | FLUX Community License (`flux-kommunity-license`, `license: other`) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión de 5.6B parámetros que emplea muestreo por flow-map, según se deduce de la referencia del autor a implementaciones que soporten "flow-map sampling". El pipeline es modular: el transformer de imagen se combina con un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen. La variante alojada aquí es el checkpoint destilado, entrenado para generar en 16 pasos sin guidance, frente a los 50 pasos con guidance 3.5 del checkpoint Base. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica más destacable es la unificación de tareas: text-to-image, edición con una referencia y composición multi-referencia (hasta 10 imágenes) se ejecutan en el mismo modelo. Además, admite cajas delimitadoras en el prompt sobre una rejilla de 0 a 1000 para colocar, recolorear, mover, reemplazar o eliminar elementos; las cajas guían posición y escala, pero no restringen los píxeles a una máscara dura. El modelo también renderiza texto dentro de las imágenes generadas. Para fine-tuning, LoRA y research, el autor remite al checkpoint Base no destilado.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Edición de imágenes con una referencia (`image-to-image`).
- Composición multi-referencia con hasta 10 imágenes de entrada.
- Control de disposición mediante cajas delimitadoras en el prompt (rejilla 0-1000), incluyendo recolorear, mover, reemplazar y eliminar elementos.
- Renderizado de texto dentro de la imagen generada.
- Comprensión de descripciones de escena largas y detalladas (requiere amplificador de prompts para obtener calidad).
- Integración con la librería `diffusers` mediante pipeline modular.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión general más allá del uso de imágenes de referencia.

## Casos de uso

- Edición de producto para comercio electrónico: se parte de una foto de referencia y se pide al modelo recolorear, cambiar el fondo o reposicionar el producto mediante prompts y cajas, aprovechando la edición con una sola referencia y el control de disposición por cajas.
- Composición de escenas con múltiples referencias: combinar hasta 10 imágenes (por ejemplo, varios personajes u objetos) en una sola escena coherente, útil para ilustración editorial y conceptual.
- Generación de material gráfico con texto integrado: carteles, banners y mockups donde el texto debe aparecer renderizado dentro de la imagen, una capacidad que el autor destaca explícitamente.
- Prototipado rápido de conceptos visuales: con 16 pasos y sin guidance, el checkpoint destilado permite iterar sobre variaciones de una escena a bajo coste computacional en comparación con el Base de 50 pasos.
- Maquetación guiada por cajas: definir la disposición de elementos sobre la rejilla 0-1000 y ajustar después posición, escala o color sin regenerar la composición desde cero, adecuado para diseño de layouts.
- Autoalojamiento en infraestructura propia: al publicarse pesos en safetensors con variantes FP8 y NVFP4, un equipo puede desplegar el modelo en su propio hardware sin depender de una API externa, siempre que su loader soporte flow-map sampling y el formato del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El autor advierte explícitamente que el tamaño de los ficheros cuantizados no es una medida del uso total de memoria GPU. A los 5.6B parámetros del transformer hay que sumar el codificador de texto Qwen3-VL-4B-Instruct y el autoencoder.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada por el autor; la existencia de variantes FP8 y NVFP4 sugiere orientación a reducir huella, pero no se aportan cifras.
- Opciones de despliegue: `diffusers` (pipeline modular) y el código de referencia `black-forest-labs/flux-3-image-klein`. Se requiere un loader que soporte flow-map sampling y el formato del checkpoint; las variantes cuantizadas necesitan un loader compatible con su formato.
- Componentes adicionales en el despliegue de referencia: clasificador de seguridad `Falconsai/nsfw_image_detection` (siempre cargado) y amplificador de prompts `black-forest-labs/flux-3-image-klein-pup` (18.8 GB, activado por defecto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos / guidance | Contexto multi-referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado, este repo) | 5.6B (transformer) | 16 pasos, sin guidance | Hasta 10 imágenes | FLUX Community License | Pesos en HF, API BFL |
| FLUX 3 Image Klein Base | 5.6B (transformer) | 50 pasos, guidance 3.5 | Hasta 10 imágenes | FLUX Community License | Pesos en HF |
| Otros modelos de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el checkpoint Base del mismo modelo; no se aportan datos de benchmarks ni de modelos competidores de otros desarrolladores.

## Limitaciones y advertencias

- Requiere amplificador de prompts: sin él, los prompts cortos producen salidas genéricas. El pipeline de `diffusers` no lo aplica por sí solo; hay que integrarlo explícitamente.
- Solo inglés: la model card declara únicamente `en` como idioma soportado.
- Licencia restrictiva: la FLUX Community License permite uso no comercial y ofrece una excepción de salida comercial para "Qualifying Users" sujeta a sus términos; es imprescindible revisar `LICENSE.md` antes de cualquier uso en producción.
- Las cajas delimitadoras guían posición y escala, pero no actúan como máscara dura sobre los píxeles; el control de layout no es determinista.
- Riesgo de alucinación visual y de sesgos: no se documentan en la información disponible evaluaciones de sesgo ni tasas de error; deben asumirse los riesgos habituales de los modelos generativos de imagen.
- Checkpoint destilado no pensado para fine-tuning: para LoRA o investigación el autor remite al checkpoint Base.
- Redistribución de terceros: este repositorio pertenece a `addlabsviral` (85 descargas, 0 likes), no al autor original; conviene verificar la integridad de los pesos frente al repositorio oficial de Black Forest Labs.
- El despliegue de referencia carga siempre un clasificador NSFW, lo que añade dependencias y latencia al pipeline.

## Enlaces

- Repositorio de este checkpoint: https://huggingface.co/addlabsviral/flux-3-image-klein-distilled
- Checkpoint oficial destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint oficial Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Amplificador de prompts oficial: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del amplificador: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Código de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Variantes cuantizadas FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes cuantizadas NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Clasificador de seguridad: https://huggingface.co/Falconsai/nsfw_image_detection
- API de Black Forest Labs: https://bfl.ai
