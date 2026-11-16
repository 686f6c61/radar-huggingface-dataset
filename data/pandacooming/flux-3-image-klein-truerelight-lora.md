# pandacooming/FLUX-3-Image-Klein-TrueRelight-LoRA

## Resumen

TrueRelight es un LoRA de relighting (reiluminación) por instrucciones para el modelo base `black-forest-labs/flux-3-image-klein-base`, desarrollado por el usuario pandacooming. Su función es modificar la iluminación de una imagen de entrada de forma físicamente plausible —dirección de la luz clave, luces de contorno, sombras proyectadas y relleno suave— preservando la identidad del sujeto, el encuadre y los detalles de la escena. Se distribuye como adaptador de bajo rango (LoRA) sobre un modelo de difusión de imagen, no como un modelo autónomo.

El adaptador está optimizado para inferencia rápida en 16 pasos sobre la variante destilada `flux-3-image-klein`, y se acompaña de un dataset de entrenamiento propio publicado en Hugging Face. El repositorio ocupa 2,3 GB e incluye pesos en formato `safetensors` para la librería `diffusers`, además de soporte declarado para ComfyUI.

Su relevancia actual radica en que resuelve un problema concreto de los flujos de edición de imagen: los prompts de iluminación convencionales tienden a teñir la imagen completa como un filtro plano o fallan al invertir la dirección de la luz. TrueRelight aborda esa limitación con un condicionamiento por instrucción sobre un token de referencia explícito (`<ref_image_0>`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión (FLUX.3 Image Klein) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; el modelo base admite las cuantizaciones propias de FLUX.3) |
| Idiomas soportados | no disponible (las instrucciones de ejemplo están en inglés) |
| Licencia | flux-kommunity-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`), compatible con diffusers |

## Arquitectura y entrenamiento

TrueRelight no es un modelo completo, sino un adaptador LoRA entrenado sobre `black-forest-labs/flux-3-image-klein-base`, un modelo de difusión de imagen a imagen. El adaptador se aplica sobre el pipeline destilado `flux-3-image-klein` y está optimizado para 16 pasos de inferencia. El entrenamiento se realizó sobre el dataset propio `pandacooming/FLUX-3-Image-Klein-TrueRelight-Dataset`, publicado por el mismo autor; no se especifican en la información disponible el número de imágenes, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es el condicionamiento por instrucción con un token de referencia nativo (`<ref_image_0>`), que permite dirigir la reiluminación sin reescribir el prompt mediante un upsampler. El autor recomienda explícitamente eliminar el bloque `prompt_upsampler` del pipeline para que el LoRA reciba la instrucción cruda. Se distribuyen dos variantes de pesos: el checkpoint por defecto en el paso 1000, con mejor equilibrio entre direccionalidad, naturalidad de materiales y fidelidad al fondo, y un checkpoint en el paso 1500 con mayor contraste de iluminación para cambios de ambiente más dramáticos.

## Capacidades

- Reiluminación direccional por instrucciones: luz clave desde direcciones concretas, luces de contorno, sombras proyectadas y relleno suave.
- Inversión de la dirección de la luz existente en la imagen de entrada.
- Eliminación de sombras duras y sustitución por iluminación difusa (por ejemplo, luz diurna nublada).
- Iluminación de doble tono (key cálida y relleno frío, o combinaciones de neón).
- Preservación de la identidad del sujeto, el encuadre, la composición y los detalles de la escena.
- Preservación explícita del fondo original cuando se indica en el prompt.
- Edición imagen a imagen con condicionamiento por token de referencia (`<ref_image_0>`).
- Integración con ComfyUI y con la librería `diffusers` (pipeline modular).
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni audio; es un adaptador exclusivamente de imagen.

## Casos de uso

- Retoque fotográfico de retrato: cambiar la dirección y el tono de la luz sobre un rostro manteniendo el fondo intacto, útil para igualar la iluminación entre tomas de una misma sesión.
- Corrección de sombras duras en fotografía de producto: sustituir una sombra diagonal no deseada por luz difusa sin alterar la pared o el fondo de estudio.
- Postproducción cinematográfica y de vídeo por fotogramas: reiluminar planos fijos para simular hora dorada, atardecer o ambiente nocturno de neón con coherencia direccional.
- Previsualización de iluminación en diseño de escenarios: generar variantes de una misma escena con esquemas de luz distintos (key derecha, relleno izquierdo, contraluz) para evaluar opciones antes de un rodaje.
- Creación de contenido para redes y publicidad: adaptar una misma imagen a distintas atmósferas (cálida, fría, nocturna) conservando el sujeto y la composición, con 16 pasos de inferencia para iteración rápida.
- Integración en flujos de ComfyUI: incorporar el LoRA como nodo dentro de pipelines de edición por lotes, aplicando instrucciones de reiluminación estandarizadas a conjuntos de imágenes.
- Igualación de iluminación en composición de imágenes (comping): armonizar la luz de un sujeto recortado con la del fondo de destino antes de la mezcla final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparativas visuales cualitativas (sin LoRA frente a TrueRelight a fuerza 1.0, semilla 42, 1024 px, 16 pasos) sobre cinco casos: contraluz de atardecer invertido, eliminación de sombra dura, inversión de dirección con key naranja y relleno turquesa, hora dorada y neón nocturno de doble tono. No se aportan métricas numéricas (FID, CLIP, LPIPS ni similares).

## Requisitos de hardware

- El repositorio del LoRA ocupa 2,3 GB; el requisito real de VRAM lo determina el modelo base FLUX.3 Image Klein, no el adaptador.
- La VRAM estimada para inferencia depende del modelo base y de su cuantización; no se especifica en la información disponible.
- El código de ejemplo usa `torch.bfloat16` para los componentes por defecto y `torch.float32` para el VAE, con ejecución en CUDA.
- GPU recomendadas: no disponibles de forma explícita; el ejemplo asume una GPU CUDA con capacidad para el pipeline completo de FLUX.3.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: `diffusers` (pipeline modular, recomendado por el autor) y ComfyUI.
- Latencia y throughput: no disponibles; la inferencia está optimizada a 16 pasos, lo que reduce el coste frente a pipelines no destilados.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrueRelight (este LoRA) | LoRA de relighting por instrucciones | FLUX.3 Image Klein | 16 | flux-kommunity-license | Hugging Face, Space de demo, notebook Colab |
| FLUX.3 Image Klein sin LoRA | Modelo base de edición imagen a imagen | — | 16 (variante destilada) | flux-kommunity-license | Hugging Face |
| LoRA de relighting genéricos para FLUX | LoRA de edición | FLUX (versiones previas) | variable | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia `flux-kommunity-license`: impone restricciones específicas de uso comercial que deben revisarse en el archivo `LICENSE.md` antes de cualquier despliegue en producción.
- El LoRA depende del modelo base `black-forest-labs/flux-3-image-klein-base`; no funciona de forma autónoma.
- El autor advierte de que debe eliminarse el bloque `prompt_upsampler` para evitar una doble reescritura del prompt que degrada el resultado.
- Es necesario dirigirse a la imagen con el token `<ref_image_0>` y comenzar el prompt con `Relight <ref_image_0>: ...`; no seguir este formato puede reducir la eficacia.
- Para preservar el fondo hay que indicarlo explícitamente en el prompt y evitar sustantivos que reemplacen la escena (por ejemplo, "studio" o "street").
- El checkpoint del paso 1500 puede oscurecer en exceso las sombras profundas; el autor lo desaconseja como opción por defecto.
- Riesgo de alucinación visual: posibles alteraciones no deseadas de identidad, encuadre o detalles de la escena en ediciones agresivas.
- No se documentan sesgos demográficos ni de otro tipo, ni el rendimiento multilingüe de las instrucciones (los ejemplos están en inglés).
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: validación comunitaria muy limitada.
- No se han publicado métricas objetivas de calidad ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandacooming/FLUX-3-Image-Klein-TrueRelight-LoRA
- Space de demostración interactiva: https://huggingface.co/spaces/pandacooming/FLUX-3-Image-Klein-TrueRelight
- Dataset de entrenamiento: https://huggingface.co/datasets/pandacooming/FLUX-3-Image-Klein-TrueRelight-Dataset
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Modelo destilado recomendado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Notebook Colab de demostración (16 pasos): `FLUX_3_Klein_TrueRelight_Demo.ipynb` en el repositorio del modelo
- Licencia: `LICENSE.md` en el repositorio del modelo
