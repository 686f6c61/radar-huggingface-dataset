# AI-KSK/ksk-video-200-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-200-comfyui-workflows` es un repositorio de Hugging Face que no contiene pesos de un modelo entrenado, sino un conjunto de flujos de trabajo (workflows) de ComfyUI y notas de tutorial para el modelo de generación de imágenes Z-Image Turbo. El autor, AI-KSK, documenta pruebas A/B con semilla fija sobre tres complementos de Z-Image Turbo: un text encoder mejorado, un LoRA de Flow-DPO y un LoRA llamado Ultra Real, y describe el comportamiento al combinarlos con renderizado segmentado por ControlNet. El repositorio está etiquetado como `text-to-image`, con idioma `en` y licencia `other`, y su tamaño es de 0,0 GB (sin pesos publicados).

El interés del artefacto es práctico: sirve como referencia reproducible para quienes montan pipelines de generación de imagen en ComfyUI con Z-Image Turbo y quieren saber qué combinación de encoder y LoRA ofrece mejor adherencia al prompt y mejor calidad cromática. Las notas reportan que el encoder mejorado corrige la adherencia al prompt, que Flow-DPO proporciona la mejor respuesta de color e iluminación de las cuatro ramas comparadas y que Ultra Real a peso 1.0 degrada la imagen, recomendándose bajarlo.

No se trata de un modelo con arquitectura propia publicada aquí: los grafos hacen referencia a componentes externos (UNET `z_image_turbo_bf16.safetensors`, CLIP `qwen_3_4b.safetensors` y GGUF `Qwen3-4b-Z-Image-Engineer-V4-F16.gguf`, VAE `ae.safetensors`). Cualquier dato sobre parámetros, contexto o entrenamiento del modelo subyacente no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows de ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se referencia un GGUF F16 del encoder: `Qwen3-4b-Z-Image-Engineer-V4-F16.gguf`) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repo no publica pesos; los grafos referencian `.safetensors` y `.gguf` de terceros) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo generativo. Los grafos de ComfyUI describen un pipeline de difusión típico: un UNET (`z_image_turbo_bf16.safetensors`), un text encoder CLIP basado en Qwen 3 de 4B (`qwen_3_4b.safetensors`, cargado también como `lumina2` en el grafo de 180 nodos y como GGUF `Qwen3-4b-Z-Image-Engineer-V4-F16.gguf`), un VAE (`ae.safetensors`) y varios LoRA (`zit_fdpo_v1`, `lenovo__z`). El muestreo se configura con `KSampler` a 9 pasos, CFG 1, sampler euler, scheduler simple y denoise 1, y con `CFGGuider` a 1 en el grafo completo.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación del modelo base. El único dato de entrenamiento indirecto es la existencia de un LoRA de Flow-DPO (`zit_fdpo_v1`), que sugiere un ajuste por preferencias directas sobre el flujo de difusión, y de un LoRA de estilización ("Ultra Real"). Las innovaciones técnicas documentadas se limitan al uso de un text encoder mejorado (cuya mejora del "+60% de datos" es una afirmación del autor del encoder, no verificada en este repositorio) y al renderizado segmentado con ControlNet, donde el encoder mejorado rompe el control de pose y el modelo Turbo CN 2602 en el segmento de alto ruido fija la forma.

## Capacidades

- Generación de imagen texto-a-imagen mediante grafos de ComfyUI sobre Z-Image Turbo.
- Comparación A/B reproducible con semilla fija de cuatro variantes de LoRA y encoder (grafo de 47 nodos).
- Composición de stacks: encoder mejorado + Flow-DPO a pesos 0.8-0.7 como configuración diaria recomendada por el autor.
- Escalado de imagen con `ImageScaleBy` lanczos 1.5 en cuatro ramas (grafo de 180 nodos).
- Renderizado segmentado con ControlNet, con control de pose en el segmento de alto ruido.
- Aplicación de LoRA de ganancia únicamente en el segmento de bajo ruido (5 pasos), donde el peso 1.0 se considera seguro.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Evaluación reproducible de LoRA en pipelines de difusión: el grafo de 47 nodos con semilla fija y cuatro ramas `KSampler` permite comparar `zit_fdpo_v1` a pesos 1.0, 0.8 y 0.72 frente a `lenovo__z` a 1.0 y 0.72 sin variar el resto de parámetros, lo que sirve para decidir pesos antes de fijar un stack de producción.
- Ajuste de adherencia al prompt en generación de bodegones y escenas de producto: las notas indican que sin el encoder mejorado el juego de té solicitado no aparece y con él los objetos de la mesa son correctos, un caso directamente aplicable a catalogación de producto.
- Selección de color e iluminación en ilustración comercial: Flow-DPO se reporta como la variante con mejor respuesta cromática y lumínica de las cuatro, útil cuando el objetivo es calidad estética y no fidelidad estricta al prompt.
- Estilización fotorrealista controlada: el LoRA Ultra Real puede emplearse a pesos reducidos (no a 1.0, que degrada la imagen y pierde detalle) para acabados realistas en retrato o arquitectura.
- Control de pose en renderizado segmentado: el uso de ControlNet con el modelo Turbo CN 2602 en el segmento de alto ruido permite fijar la forma cuando el encoder mejorado rompe el control de pose, aplicable a workflows de personajes con pose fija.
- Integración en ComfyUI como plantilla de referencia: los JSON de 47 y 180 nodos sirven como base para montar pipelines propios con Z-Image Turbo, sustituyendo UNET, VAE y encoders por las versiones locales.
- Depuración de stacks de LoRA en producción: la observación de que los LoRA de ganancia solo actúan en el segmento de bajo ruido (5 pasos) evita sobreajustes al cambiar el número de pasos del segmento de bajo ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las notas del autor reportan observaciones cualitativas (adherencia al prompt, color e iluminación, degradación con Ultra Real a 1.0) sobre un único prompt, una única semilla y cuatro imágenes, sin métricas cuantitativas (FID, CLIP score, etc.).

## Requisitos de hardware

- No disponible: el repositorio no publica pesos ni requiere VRAM propia; la VRAM depende de los componentes externos referenciados (UNET `z_image_turbo_bf16`, encoder Qwen 3 4B, VAE `ae.safetensors`).
- El encoder en formato GGUF F16 (`Qwen3-4b-Z-Image-Engineer-V4-F16.gguf`) sugiere despliegue con `ComfyUI-GGUF`; el resto de componentes en `.safetensors`.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible; a título orientativo, un encoder de 4B en F16 ocupa del orden de 8 GB, pero este cálculo no está confirmado en la información.
- Opciones de despliegue: ComfyUI (los grafos están en formato JSON de ComfyUI); vLLM, llama.cpp, Ollama y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, rendimiento ni licencia de los modelos comparables (Z-Image Turbo base, `zit_fdpo_v1`, `lenovo__z`, encoder Qwen 3 4B), por lo que no es posible construir una comparativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: es documentación y workflows, con tamaño de 0,0 GB. No debe tratarse como un modelo descargable.
- Las conclusiones se basan en un único prompt, una única semilla y cuatro imágenes; el propio autor lo señala como límite explícito.
- La afirmación de "+60% de datos" del encoder mejorado es del autor del encoder, no verificada en este repositorio.
- Los pesos de los pasos y los recuentos de pasos están acoplados: si se cambia el número de pasos del segmento de bajo ruido, hay que repetir las pruebas.
- El encoder mejorado rompe el control de pose en renderizado segmentado con ControlNet; es una limitación funcional documentada.
- Ultra Real a peso 1.0 degrada la imagen y reduce el detalle; el autor recomienda bajarlo.
- Licencia `other`: no se especifican términos de uso comercial; hay que consultar la licencia del repositorio y de cada componente externo por separado.
- Idioma documentado: únicamente inglés (`en`).
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Los enlaces de RunningHub incluyen códigos de invitación de afiliado; verificar su contenido antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-200-comfyui-workflows
- RunningHub (post 1): https://www.runninghub.ai/post/2030979831659241473/?inviteCode=rh-v1111
- RunningHub (post 2): https://www.runninghub.ai/post/2030979258759258114/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=HtEpu6Yyvck
- Bilibili: https://www.bilibili.com/video/BV19YP9zPEcJ
