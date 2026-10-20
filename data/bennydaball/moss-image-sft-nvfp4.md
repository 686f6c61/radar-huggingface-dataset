# BennyDaBall/MOSS-Image-SFT-NVFP4

## Resumen

MOSS-Image SFT NVFP4 es una cuantización independiente del modelo de texto a imagen MOSS-Image SFT de OpenMOSS, publicada por el usuario BennyDaBall. No se trata de un modelo nuevo ni de una versión oficial: el autor parte del checkpoint bf16 que Comfy-Org distribuye en `Comfy-Org/MOSS-Image` y lo convierte a NVFP4 con un ajuste GPTQ por capas, empaquetando todo en un único archivo safetensors de 4,49 GB listo para cargarse en ComfyUI sin nodos personalizados ni parches en tiempo de ejecución.

La relevancia práctica está en el binomio tamano/velocidad. El checkpoint bf16 original ocupa 10,16 GB y tarda 27,04 s por imagen a 1920x1088 en una RTX 5090; esta versión baja a 4,49 GB y 10,96 s con el mismo template de muestreo, manteniendo la capacidad de renderizar texto legible, que es la seña de identidad de MOSS-Image. La arquitectura subyacente es un DiT de flujo único de ~5B parámetros con 42 bloques y un codificador de texto Qwen3.5-9B que no se modifica en esta cuantización.

El interés para desarrolladores e investigadores es doble: por un lado, permite ejecutar un modelo de texto a imagen de ~5B con texto fiable en una GPU de consumo Blackwell con ~13 GB efectivos de VRAM para el pipeline; por otro, documenta con métricas (LPIPS, SSIM, PSNR, lectura de cadenas) el coste real de cuantizar a 4 bits sin ajuste frente a hacerlo con GPTQ, lo que sirve como referencia metodológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de flujo único, ~5B parámetros, 42 bloques; codificador de texto Qwen3.5-9B (sin modificar) |
| Parametros totales | ~5B en el DiT, más el codificador de texto Qwen3.5-9B y el VAE (no cuantizados en este archivo) |
| Longitud de contexto | no disponible (no se documenta la ventana del codificador de texto) |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas por bloque) con ajuste GPTQ; mezcla por capa de NVFP4, int8 ConvRot y bf16; metadatos `comfy_quant` por capa |
| Idiomas soportados | no disponible como lista oficial; el texto renderizado en imagen se ha validado en inglés, chino, coreano y árabe |
| Licencia | Apache-2.0 (la misma que los pesos de origen) |
| Formato de pesos | safetensors en un único archivo (`moss_image_sft_nvfp4.safetensors`), 4,49 GB, formato nativo de ComfyUI (`diffusion-single-file`) |
| Modelo base | `OpenMOSS-Team/MOSS-Image-SFT`, vía el checkpoint bf16 `Comfy-Org/MOSS-Image` |
| sha256 | `b478cb628a7cbfccd9d04c107b7c649a1b0facbf631a91c59ef2ab9df2ec5ef6` |
| Entorno validado | RTX 5090, ComfyUI 0.42.1, comfy-kitchen 0.2.39, PyTorch 2.14 cu130 |
| Resoluciones probadas | 1024x1024 y 1920x1088 (galería), 2048x1152 (recorte al 100 %) |
| Muestreo de referencia | `er_sde`, scheduler `simple`, 25 pasos, cfg 2.5, prompt negativo del template |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusión (DiT) de flujo único con aproximadamente 5.000 millones de parámetros repartidos en 42 bloques, acompañado de un codificador de texto Qwen3.5-9B y un VAE (`flux2-vae_small` en el template oficial). Esta ficha describe una cuantización, no un entrenamiento: no se ha reentrenado el modelo, no hay datos nuevos de entrenamiento ni fases de RLHF o DPO asociadas a esta publicación. El único proceso de ajuste es el GPTQ aplicado durante la cuantización a NVFP4, que estima escalas y correcciones por capa para minimizar el error de reconstrucción respecto al checkpoint bf16.

La innovación técnica del repo es la política de precisión mixta por capa. En lugar de cuantizar todos los bloques a 4 bits, el autor combina NVFP4 con capas en int8 ConvRot y otras que se mantienen en bf16, guiado por el impacto de cada capa en la fidelidad de salida. El contraste medido es contundente: la receta ingenua de "todo a FP4" da LPIPS 0,362, SSIM 0,682 y PSNR 15,4 dB, mientras que esta mezcla con GPTQ alcanza LPIPS 0,170, SSIM 0,844 y PSNR 21,5 dB. El archivo incorpora metadatos `comfy_quant` que indican a ComfyUI el tipo de cada capa, de modo que la carga se resuelve con el nodo estándar Load Diffusion Model.

No se documentan en la información disponible ni la composición del dataset de entrenamiento original, ni el número de tokens o pares imagen-texto, ni si MOSS-Image SFT incorpora etapas de ajuste supervisado fino más allá de lo que sugiere el sufijo SFT.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con foco explícito en la calidad del texto renderizado dentro de la imagen: carteles, señales, etiquetas, menús y notas manuscritas.
- Renderizado multilingüe de cadenas: se han validado correctamente textos en inglés, chino, coreano y árabe en las pruebas del autor.
- Control de composición mediante cajas de maquetación (layout boxes): permite indicar dónde va cada elemento y qué texto contiene, usando el nodo Create Bounding Boxes junto con MOSS-Image Layout Prompt.
- Fidelidad de detalle en resoluciones altas: verificado a 2048x1152 con recorte al 100 % sin mallado, estriado ni banding.
- Coherencia de color y contraste respecto al bf16 original (desplazamiento de color medido de +4, +1, 0 en R, G, B).
- Integración directa en ComfyUI con el template oficial `image_moss_image_t2i`, sin nodos personalizados ni cargadores GGUF.
- No se documentan en la información disponible capacidades de edición de imagen, inpainting, outpainting, img2img nativo ni control por ControlNet específico para este archivo.

## Casos de uso

- Rotulación y cartelería comercial: generación de carteles y señales donde el texto debe leerse correctamente (nombres de tienda, horarios, avisos). El modelo mantiene 16/16 cadenas exactas en la prueba de lectura, lo que lo hace viable para bocetos de señalética antes de la producción final.
- Maquetación publicitaria con layout boxes: definir cajas para titular, producto y pie legal, y dejar que el modelo rellene la escena. Útil para agencias que iteran variaciones de un mismo anuncio con jerarquía visual fija.
- Prototipado rápido de creatividades en estación local: 10,96 s por imagen a 1920x1088 en una RTX 5090 permite generar decenas de variantes en una sesión de trabajo sin depender de APIs externas.
- Mockups de packaging y producto: generar etiquetas, envases y menús con texto legible en varios alfabetos, incluyendo árabe y coreano, para revisar propuestas con equipos de mercado internacional.
- Ilustración editorial multilingüe: portadas y páginas interiores con titulares integrados en la escena, reduciendo el trabajo posterior de composición tipográfica.
- Previsualización de assets para comercio electrónico: imágenes de producto con carteles de precio o claim textual, generadas en lote mediante la API de ComfyUI.
- Investigación sobre cuantización: el repo publica métricas de fidelidad (LPIPS, SSIM, PSNR) y una comparación explícita contra la receta de cuantización ingenua, lo que lo convierte en un caso de estudio reproducible para evaluar NVFP4 con GPTQ en modelos de difusión.
- Despliegue en una única GPU de consumo: con 16,2 GB de VRAM pico medidas (incluyendo ~3,3 GB de escritorio), un estudio pequeño puede operar el modelo en una sola máquina Blackwell sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de difusión. Los datos publicados son de velocidad, VRAM y fidelidad respecto al bf16.

Rendimiento en RTX 5090, template `er_sde` / `simple`, 25 pasos, cfg 2.5, mediana de 5 ejecuciones en caliente con semilla nueva cada vez:

| Modelo | Archivo | s/imagen 1920x1088 | s/imagen 1024x1024 | VRAM pico |
|---|---|---|---|---|
| bf16 (Comfy-Org) | 10,16 GB | 27,04 | 12,98 | 22,1 GB |
| int8 ConvRot (Comfy-Org) | 5,41 GB | 11,79 | 5,37 | 17,6 GB |
| NVFP4 con GPTQ (este repo) | 4,49 GB | 10,96 | 4,92 | 16,2 GB |

Fidelidad respecto a bf16 con misma semilla y mismo prompt (6 prompts x 2 semillas):

| Modelo | LPIPS | SSIM | PSNR | Desplazamiento de color (R, G, B) |
|---|---|---|---|---|
| int8 ConvRot (Comfy-Org) | 0,133 | 0,882 | 23,8 dB | +4, +2, +1 |
| NVFP4 con GPTQ (este repo) | 0,170 | 0,844 | 21,5 dB | +4, +1, 0 |
| NVFP4 sin GPTQ, todos los bloques a 4 bits | 0,362 | 0,682 | 15,4 dB | +27, +21, +6 |

Prueba de lectura de texto (16 cadenas por modelo, lector ciego a la procedencia de la imagen):

| Modelo | Cadenas exactas | Errores de letra |
|---|---|---|
| NVFP4 con GPTQ (este repo) | 16/16 | 0 |
| int8 ConvRot | 15/16 | 2 (árabe) |
| bf16 | 14/16 | 3 |

## Requisitos de hardware

- VRAM pico medida: 16,2 GB en una RTX 5090 con unos 3,3 GB de escritorio en uso, lo que deja el pipeline (modelo, codificador de texto y VAE) en torno a 13 GB.
- Para comparar: bf16 requiere 22,1 GB pico e int8 17,6 GB pico en la misma máquina y configuración.
- GPU validada: RTX 5090 (Blackwell, soporte nativo de FP4). Es la única GPU sobre la que el autor publica medidas.
- Otras GPU Blackwell (por ejemplo RTX 5080 o RTX 5070 Ti): no disponible; no hay pruebas publicadas y el margen de VRAM con 16 GB es ajustado.
- GPU no Blackwell: no disponible; la ventaja de velocidad de NVFP4 depende del soporte nativo de FP4, por lo que el rendimiento en arquitecturas anteriores no está documentado.
- Despliegue: ComfyUI 0.41.3 o superior con soporte de MOSS-Image, comfy-kitchen 0.2.39 y PyTorch 2.14 cu130. El archivo se coloca en `ComfyUI/models/diffusion_models/` y se carga con Load Diffusion Model dejando `weight_dtype` en `default`.
- Dependencias del template: codificador de texto Qwen3.5 (por ejemplo `qwen3.5_9b_w4a8_gptq` con CLIP type `moss_image`) y VAE `flux2-vae_small`, sin cambios respecto al template oficial.
- No requiere nodos personalizados, parches de runtime ni cargador GGUF.
- Throughput estimado: aproximadamente 5,5 imágenes por minuto a 1920x1088 y 12,2 imágenes por minuto a 1024x1024 en una RTX 5090 con la configuración de referencia.
- vLLM, TGI, llama.cpp u Ollama: no aplica; es un modelo de difusión y el archivo está en formato específico de ComfyUI.

## Comparativa con modelos similares

No se dispone de datos medidos de otros modelos de texto a imagen de la misma categoría (FLUX.1, Qwen-Image, Stable Diffusion 3.5 u otros) en la información proporcionada, por lo que la comparación se limita a las variantes del propio MOSS-Image publicadas por Comfy-Org y a la receta alternativa de cuantización:

| Variante | Parametros | Contexto | Formato / tamano | VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Image SFT NVFP4 (este repo) | ~5B DiT + Qwen3.5-9B | no disponible | safetensors NVFP4, 4,49 GB | 16,2 GB | Apache-2.0 | HuggingFace, ComfyUI 0.41.3+ |
| MOSS-Image SFT int8 ConvRot (Comfy-Org) | ~5B DiT + Qwen3.5-9B | no disponible | safetensors int8, 5,41 GB | 17,6 GB | Apache-2.0 | HuggingFace, ComfyUI |
| MOSS-Image SFT bf16 (Comfy-Org) | ~5B DiT + Qwen3.5-9B | no disponible | safetensors bf16, 10,16 GB | 22,1 GB | Apache-2.0 | HuggingFace, ComfyUI |
| NVFP4 sin GPTQ (referencia del autor) | ~5B DiT + Qwen3.5-9B | no disponible | 4 bits en todos los bloques | no disponible | Apache-2.0 | no distribuido como archivo |

Frente al bf16, esta versión es un 56 % más pequena y 2,5 veces más rápida, con un coste de fidelidad de LPIPS 0,170. Frente al int8 de Comfy-Org es un 17 % más pequena y un 7-8 % más rápida, pero queda ligeramente por detrás en similitud pixel a pixel (LPIPS 0,170 frente a 0,133). Para comparaciones con modelos de otros fabricantes: no disponible.

## Limitaciones y advertencias

- La validación de fidelidad se apoya en una muestra pequena: 6 prompts x 2 semillas y 16 cadenas de texto por modelo. Los resultados de texto (16/16) no deben interpretarse como superioridad sobre bf16, sino como ausencia de regresión.
- Deriva de composición: con la misma semilla, la disposición de los elementos puede diferir respecto a bf16 (el int8 de Comfy-Org presenta el mismo fenómeno). No es un archivo adecuado si se necesita reproducibilidad bit a bit con el original.
- Pérdida de fidelidad medible frente a int8: LPIPS 0,170 y PSNR 21,5 dB, por detrás del int8 ConvRot. En usos donde el pixel importa (retoque fino, comparación estricta con bf16), conviene valorar int8.
- Dependencia de hardware: la ventaja de velocidad presupone una GPU Blackwell con FP4 nativo. En GPUs anteriores el comportamiento no está documentado.
- Formato cerrado al ecosistema ComfyUI: el archivo es un single-file con metadatos `comfy_quant`; no se indica compatibilidad con diffusers, vLLM, TGI ni otras herramientas.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación en la información disponible.
- Alucinación de texto: aunque la tasa de error medida es cero en la muestra, el modelo puede producir cadenas mal formadas en textos largos, alfabetos poco representados o resoluciones bajas; la lectura humana sigue siendo necesaria en producción.
- Idiomas: la lista oficial de idiomas del modelo base no está disponible; la validación se limita a inglés, chino, coreano y árabe en texto renderizado. El idioma del prompt no se documenta.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una cuantización no oficial conviene verificar la licencia y las condiciones del modelo base `OpenMOSS-Team/MOSS-Image-SFT` y del checkpoint intermedio de Comfy-Org antes de desplegar en producción.
- Soporte: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor lo define explícitamente como una conversión independiente no respaldada por OpenMOSS. No hay garantía de mantenimiento.
- Verificación de integridad: conviene comprobar el sha256 publicado antes de cargar el archivo en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/BennyDaBall/MOSS-Image-SFT-NVFP4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint bf16 de Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes al modelo (devuelven páginas de genealogía y contenido no relacionado), por lo que no se incluyen.
