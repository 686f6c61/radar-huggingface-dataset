# RunningHubAI/rh-hkretouch-lora

## Resumen

rh-hkretouch-lora es un adaptador LoRA de edición de imagen orientado a la retocación profesional de fotografías de habitaciones de hotel. Lo publica RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub, un servicio de entrenamiento y despliegue de modelos generativos con sede en China. El adaptador se ha entrenado sobre Qwen-Edit-2509, el modelo de edición de imagen de la familia Qwen, y se distribuye como un único fichero de pesos de 563 MiB.

El modelo resuelve un problema muy acotado del flujo de trabajo de fotografía comercial hotelera: partiendo de una foto original de una habitación, aplica de forma automatizada un conjunto de correcciones de retoque (elevación global de la luminosidad, alisado de sábanas y eliminación de arrugas, limpieza de manchas, aclarado de cristales) manteniendo intactas la composición y la disposición del mobiliario. Es, por tanto, una herramienta de posproducción por lotes, no un modelo de propósito general.

La relevancia es operativa: sustituye parte del trabajo manual de retoque en catálogos de alojamiento, donde se manejan volúmenes altos de imágenes con criterios de estilo homogéneos. El repositorio no incluye información sobre arquitectura interna, parámetros, contexto, licencia ni idiomas más allá de la indicada en la model card, por lo que varios campos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Edit-2509; arquitectura del modelo base no detallada en la información disponible |
| Parametros totales | no disponible (pesos del adaptador: 563 MiB en `hkretouch_e2_1250.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | no disponible (la model card está en inglés y chino; el modelo opera sobre imágenes, no sobre texto libre) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors |
| Modelo base | Qwen-Edit-2509 |
| Palabra de activación | `hkretouch` |
| Plataformas de ejecución | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base Qwen-Edit-2509 para especializarlo en una tarea de edición de imagen concreta. El repositorio no documenta el rango del adaptador, las capas objetivo ni la configuración exacta del entrenamiento. La model card tampoco detalla la arquitectura del modelo base, por lo que no se puede confirmar aquí si se trata de un transformer de difusión, de un modelo de flujo o de una variante multimodal de edición condicionada por texto.

El dato de entrenamiento más concreto que aporta el autor es la composición del dataset: 59 pares de imágenes original/retocada de habitaciones de hotel reales. Es un conjunto pequeño y muy específico de dominio, lo que explica el carácter estrecho del adaptador. No se menciona el uso de RLHF, DPO ni de ninguna técnica de alineación adicional; tampoco se especifican el número de pasos, la tasa de aprendizaje ni el resto de hiperparámetros. El nombre del fichero (`hkretouch_e2_1250`) sugiere una época o checkpoint intermedio, pero el autor no lo aclara.

## Capacidades

- Edición de imagen condicionada por texto e imagen de entrada (pipeline `image-text-to-image`), con la palabra de activación `hkretouch`.
- Elevación global de la exposición y la luminosidad de la escena.
- Alisado de ropa de cama: eliminación de arrugas y pliegues en sábanas y colchas.
- Eliminación de manchas y suciedad superficial en superficies y textiles.
- Aclarado o limpieza de cristales y superficies acristaladas.
- Preservación de la composición y del mobiliario originales, según declara el autor.
- Integración en flujos de ComfyUI como nodo de carga de LoRA.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el alcance es exclusivamente la edición de imagen.

## Casos de uso

- Retoque por lotes de catálogos de alojamiento: aplicar el adaptador a cientos de fotos de habitaciones para homogeneizar luminosidad y limpieza antes de publicarlas en portales de reservas, reduciendo el tiempo de posproducción manual.
- Estandarización de estilo entre proveedores: cadenas hoteleras que reciben fotos de distintos fotógrafos pueden pasar todas las imágenes por el mismo LoRA para obtener un aspecto coherente en la web y en las apps.
- Corrección rápida de originales deficientes: fotos tomadas con luz insuficiente o con sábanas arrugadas se pueden recuperar sin repetir la sesión fotográfica, siempre que la composición sea la adecuada.
- Preparación de material para anuncios y campañas: generación de variantes retocadas de una misma habitación para distintos formatos y canales a partir del original.
- Prototipado en ComfyUI: uso del nodo LoRA dentro de un grafo de edición más amplio (recorte, reescalado, upscaling) para construir un pipeline de retoque completo sin salir del entorno.
- Evaluación de proveedores de datos: equipos que comparan herramientas de retoque automático pueden usar este adaptador como referencia de calidad en el nicho hotelero.
- Docencia y demostración de LoRA de edición: por su tamaño reducido (563 MiB) y su dominio acotado, sirve como ejemplo práctico de fine-tuning de un modelo de edición sobre un dataset pequeño de pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, LPIPS, SSIM, evaluaciones humanas ni comparativas con otros adaptadores), y el repositorio no adjunta ejemplos de antes/después medibles.

## Requisitos de hardware

- El adaptador pesa 563 MiB, por lo que su carga en memoria es marginal; el requisito real lo marca el modelo base Qwen-Edit-2509, cuyas necesidades de VRAM no se detallan en la información disponible.
- GPU recomendadas: no disponibles para el modelo base; para el adaptador en sí, cualquier GPU con VRAM suficiente para el base.
- Viabilidad en GPU de consumo: no se puede confirmar sin los requisitos del modelo base; el tamaño del LoRA no es el factor limitante.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (cloud) y carga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un adaptador de edición de imagen de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores de retoque hotelero ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado con solo 59 pares de imágenes de habitaciones de hotel; es previsible un comportamiento deficiente fuera de ese tipo de escena (exteriores, retratos, producto, arquitectura no hotelera).
- Riesgo de alterar detalles: aunque el autor afirma que se preservan composición y mobiliario, un LoRA de edición puede introducir cambios no deseados en texturas, textos o geometrías; requiere revisión humana en producción.
- Sesgos: no documentados; al proceder de un conjunto pequeño de fotos comerciales, puede heredar sesgos de estilo, iluminación y decoración de ese material concreto.
- Alucinación visual: posible generación de elementos inexistentes al eliminar manchas o arrugas en zonas ambiguas; conviene comparar original y resultado.
- Licencia: no disponible de forma explícita. La model card remite a la licencia del proyecto original o del modelo base, por lo que el uso comercial queda condicionado a verificar la licencia de Qwen-Edit-2509 y las condiciones de RunningHub.
- Idiomas: sin datos; la interacción con el modelo base puede requerir prompts en inglés o chino, pero no se especifica.
- Metadatos incompletos: sin parámetros, contexto, cuantizaciones ni benchmarks publicados, lo que dificulta la evaluación técnica previa a su adopción.
- Dependencia de la plataforma: parte de la documentación y de los enlaces apuntan a servicios de RunningHub, lo que puede limitar la reproducibilidad fuera de ese ecosistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-hkretouch-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2117955232645869569
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/2110307136788852738
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
