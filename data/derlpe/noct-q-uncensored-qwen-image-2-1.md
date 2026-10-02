# derlpe/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q: Qwen Image 2.1 Uncensored Realism es un ajuste fino (en terminología del autor, un *merge* con pesos del transformer modificados) del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario derlpe en HuggingFace. Su propósito es eliminar las restricciones de contenido del modelo base para que la generación de desnudos y escenas explícitas funcione sin necesidad de cargar un LoRA adicional, manteniendo además el realismo fotográfico y la capacidad de renderizar texto legible en la imagen.

El modelo se distribuye en formato de archivo único de difusión (`diffusion-single-file`), pensado para su uso directo en ComfyUI a partir de la versión 0.37 con nodos nativos, sin necesidad de nodos personalizados. El repositorio ocupa 14,5 GB e incluye los pesos en int8 (`convrot`), con un archivo principal de 7,3 GB para la versión V4 y otro de la versión anterior V3, más un flujo de trabajo JSON listo para arrastrar a ComfyUI.

Es relevante en el ecosistema de generación de imagen local porque ocupa el nicho de los ajustes sin censura sobre modelos de última generación con soporte de texto en imagen, y porque el escalado a int8 lo hace viable en tarjetas de 8 a 12 GB de VRAM. Su licencia, derivada de Qwen Research License Agreement, restringe el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen (transformer de difusión tipo Qwen-Image 2.1, en un único archivo safetensors); text encoder Qwen3-VL-8B y VAE Qwen Image 2.1 |
| Parámetros totales | No disponible en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de imagen; la entrada es un prompt de texto) |
| Tipos de cuantización | int8 `convrot` (archivos distribuidos); el autor menciona además int4, fp8, bf16 y fp16 en Civitai |
| Idiomas soportados | No disponible en la información proporcionada; las instrucciones de prompting de la model card están en inglés |
| Licencia | `other` / `qwen-research` (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | safetensors, archivo único (`diffusion-single-file`) |
| Tamaño del repositorio | 14,5 GB |
| Tamaño por archivo de pesos | 7,3 GB (V4 int8) y 7,3 GB (V3 base int8) |
| Resolución recomendada | 1024x1536 (retrato) |
| Pasos de muestreo recomendados | 25, sampler euler, scheduler simple, CFG 3 con prompt negativo (CFG 1 duplica la velocidad y desactiva el prompt negativo) |
| Modelo base | Qwen/Qwen-Image-2.1 (relación: merge) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicación | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

Noct Q parte de Qwen/Qwen-Image-2.1, un modelo de difusión texto a imagen. El autor describe el resultado como un *merge* con pesos del transformer modificados (se cita un archivo `NOTICE` en el repositorio del que se derivan los cambios), por lo que no se trata de un entrenamiento desde cero ni de un LoRA independiente, sino de una variante de pesos del propio transformer de difusión. La canalización de inferencia mantiene los tres componentes del modelo base: el transformer de difusión (el archivo que se sustituye), el text encoder Qwen3-VL-8B en int8 (`qwen3vl_8b_int8_convrot.safetensors`) y el VAE `qwen_image_2.1_vae_bf16.safetensors`.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La innovación declarada por el autor es doble: por un lado, la generación de desnudos y escenas explícitas sin LoRA, con una mejora comparativa entre versiones (el autor afirma que la V4 renderiza escenas explícitas con pareja "tres veces más a menudo" que la V3); por otro, el mantenimiento de capacidades del modelo base como el renderizado de texto legible en carteles y etiquetas y un modo de edición de imagen usando la misma familia de archivos dentro de la plantilla de edición de Qwen Image 2.1 en ComfyUI.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts en lenguaje natural, con énfasis en escenas de luz diurna, flash y nocturna.
- Generación de contenido para adultos sin necesidad de LoRA: desnudos de cuerpo completo y escenas explícitas, incluida la variante con pareja en la versión V4.
- Renderizado de texto legible dentro de la imagen (carteles, etiquetas).
- Estilos de anime e ilustración pintada, además del fotorrealismo.
- Edición de imagen mediante la plantilla de edición de Qwen Image 2.1 en ComfyUI, reutilizando los mismos archivos.
- Interpretación de prompts en prosa descriptiva (tipo pie de foto: tipo de plano, persona con edad adulta, acción, localización, luz y encuadre) en lugar de listas de etiquetas; no requiere palabra de activación.
- Sin soporte declarado de *tool calling*, *function calling*, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Sin capacidades declaradas de audio ni de vídeo.

## Casos de uso

- Ilustración editorial para adultos: el modelo genera escenas explícitas de forma directa dentro de ComfyUI, sin encadenar LoRAs, lo que simplifica el flujo de trabajo para estudios de contenido para adultos.
- Fotografía conceptual y moodboards de desnudo artístico: con prompts en prosa que describen luz y encuadre se obtienen variaciones rápidas de una misma idea, aprovechando los 25 pasos y CFG 3 recomendados.
- Edición fotográfica asistida: la plantilla de edición de Qwen Image 2.1 permite modificar imágenes existentes con los mismos pesos, útil para retoque o variaciones de una toma.
- Diseño de carteles y rótulos: la capacidad de renderizar texto legible permite generar piezas con rótulos identificables sin postprocesado tipográfico.
- Prototipado de escenas para cómic o ilustración pintada: el modelo cubre estilos anime e ilustración, lo que sirve para bocetar viñetas antes del trabajo manual.
- Experimentación e investigación sobre alineación y censura en modelos generativos: al ser una variante sin censura de un modelo base conocido, permite comparar el comportamiento del modelo original frente a esta versión en condiciones controladas.
- Pruebas de despliegue local en hardware modesto: al ocupar 7,3 GB en int8, sirve para validar flujos de ComfyUI en tarjetas de 8 a 12 GB antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una afirmación comparativa cualitativa del autor entre versiones (la V4 renderiza escenas explícitas con pareja tres veces más a menudo que la V3) y una indicación de rendimiento relativo de muestreo (CFG 1 es aproximadamente el doble de rápido que CFG 3). No hay datos de FID, CLIP score, GenEval ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que el archivo int8 de 7,3 GB está pensado para tarjetas de 8 a 12 GB, en ComfyUI 0.37 o superior y usando solo nodos nativos.
- Hay que sumar a los pesos del transformer la memoria del text encoder Qwen3-VL-8B en int8 y la del VAE en bf16, por lo que el consumo real depende de cómo ComfyUI gestione la carga y el offload de cada componente.
- GPU recomendadas: no especificadas por el autor. Por el rango de VRAM declarado, el modelo encaja en GPUs consumer de 8 a 12 GB o más (por ejemplo, la familia RTX 3060 12 GB, 4070, 4080 o 4090, según el umbral de 8-12 GB indicado); no se dispone de datos específicos por modelo concreto.
- Cabe en GPU consumer: sí, según la indicación de 8 a 12 GB del propio autor.
- Opciones de despliegue: ComfyUI (versión 0.37 o superior, nodos nativos). El archivo debe colocarse en `models/diffusion_models`, el text encoder en `models/text_encoders` y el VAE en `models/vae`. Se incluye un flujo de trabajo JSON (`NoctQ_V4_workflow.json`) que contiene los ajustes de muestreo.
- Latencia y throughput: no disponibles. La única referencia es que CFG 1 se ejecuta aproximadamente el doble de rápido que CFG 3 en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noct Q: Qwen Image 2.1 Uncensored Realism (V4) | Difusión texto a imagen, archivo único int8 | No disponible | Prompt de texto en prosa; 1024x1536 recomendado | qwen-research, solo no comercial | HuggingFace (derlpe) y Civitai |
| Qwen/Qwen-Image-2.1 (modelo base) | Difusión texto a imagen | No disponible | Prompt de texto | Qwen Research License Agreement | HuggingFace (Qwen) |
| Otras variantes sin censura de Qwen-Image 2.1 | No disponibles en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del modelo base ni de terceros comparables en la información proporcionada, por lo que la comparación se limita a origen, licencia y formato de distribución.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `nsfw`, `not-for-all-audiences` y `uncensored`. Su uso requiere verificar la legislación aplicable en la jurisdicción del usuario y las políticas de la plataforma de destino.
- Licencia restrictiva: la Qwen Research License Agreement limita el uso a fines no comerciales. Cualquier despliegue comercial es una violación de la licencia.
- Riesgo de sesgos: no hay documentación sobre sesgos de representación (edad, etnia, cuerpo, género) ni sobre mecanismos de mitigación. La ausencia de censura aumenta la probabilidad de generar contenido problemático o ilegal si el prompt lo induce.
- Riesgo de alucinación visual: como modelo de difusión, puede producir anatomías incorrectas, manos deformes, incoherencias entre el prompt y la imagen o texto ilegible, especialmente en resoluciones fuera de la recomendada.
- Idioma: no se declara lista de idiomas soportados. La model card recomienda prompts en inglés redactados como pies de foto; no hay evidencia de buen rendimiento con prompts en castellano.
- Restricciones de contenido explícitas: el autor pide describir personas con edad adulta en el prompt («a woman in her twenties»). El modelo no incorpora salvaguardas automáticas, por lo que la responsabilidad de no generar contenido con menores recae por completo en el usuario.
- Reproducibilidad y mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, una única revisión publicada y ninguna garantía de mantenimiento. El autor remite a Civitai para las variantes int4, fp8, bf16 y fp16 y para la galería de ejemplos.
- Inconsistencia de rutas: el enlace de licencia de la model card apunta al espacio de nombres `Noctaluna`, mientras que el repositorio consultado está bajo el autor `derlpe`. Conviene verificar la procedencia de los archivos antes de usarlos en producción.
- Dependencia de versión: requiere ComfyUI 0.37 o superior para funcionar con nodos nativos; versiones anteriores pueden no cargar el formato int8 `convrot`.
- Sin datos de benchmarks: no hay métricas objetivas que permitan estimar la degradación respecto al modelo base tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/derlpe/Noct-Q-Uncensored-Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Galería, prompts y archivos int4, fp8, bf16 y fp16 en Civitai: https://civitai.com/models/2958896
- Text encoder (Qwen3-VL-8B int8): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE (Qwen Image 2.1 bf16): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Licencia citada en la model card: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE

No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en los resultados de búsqueda disponibles; los resultados obtenidos corresponden a servicios de traducción y no guardan relación con el modelo.
