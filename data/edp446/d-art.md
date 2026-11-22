# edp446/d-art

## Resumen

d-art es un adaptador LoRA de texto a imagen publicado por el usuario edp446 en Hugging Face. Se distribuye en formato diffusers con la etiqueta `template:diffusion-lora` y está diseñado para montarse sobre el modelo base `John6666/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl`, un checkpoint SDXL de la familia Illustrious orientado a ilustración y contenido para adultos. El repositorio ocupa 0,2 GB, lo que es coherente con un LoRA y no con un checkpoint completo.

La model card es extremadamente escueta: se limita a declarar la etiqueta `text-to-image`, una palabra de activación (`d-art`) y un ejemplo de widget con el prompt `maria robotnik, thick thighs` y el prompt negativo `lowres,`. No se documentan datos de entrenamiento, hiperparámetros, número de pasos, learning rate, composición del dataset ni limitaciones. Tampoco se especifica licencia ni idiomas soportados.

Su relevancia es muy limitada en el momento de la publicación: cero descargas y un único "like" en el momento de la consulta. Se trata, por tanto, de un artefacto de nicho, presumiblemente un ajuste personal o experimental, y no de un modelo pensado para evaluación comparativa ni para producción general. La ficha siguiente refleja exclusivamente lo que consta en la información disponible y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un checkpoint SDXL de la familia Illustrious; arquitectura base de difusión latente tipo U-Net, no disponible en detalle |
| Parametros totales | no disponible (el adaptador LoRA no publica recuento; el repo pesa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en difusión se traduce en límite de tokens del text encoder CLIP, no declarado por el autor) |
| Tipos de cuantizacion | no disponible (formato nativo diffusers; no se documentan variantes fp16, fp32, GGUF ni similares) |
| Idiomas soportados | no disponible (los prompts del widget están en inglés) |
| Licencia | no disponible |
| Formato de pesos | diffusers (repositorio con estructura de librería diffusers); no se declaran safetensors ni GGUF de forma explícita |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base declarado es `John6666/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl`, un merge de la familia Illustrious XL (SDXL) con orientación a ilustración y contenido NSFW. El autor no detalla en qué módulos se aplica el adaptador (atención cruzada, atención propia, proyecciones de texto), ni el rango, ni el alpha.

No hay información sobre el dataset de entrenamiento: ni número de imágenes, ni composición, ni resolución, ni si se usó regularización o captions automáticos. Tampoco se documentan pasos de entrenamiento, optimizador, learning rate, scheduler de ruido ni técnicas de regularización. La única información operativa es la palabra de activación `d-art`, que debe incluirse en el prompt para invocar el estilo o concepto aprendido. No se declara uso de RLHF, DPO ni preferencias humanas, algo por otra parte ajeno al entrenamiento típico de un LoRA de difusión.

## Capacidades

- Generación de imágenes texto a imagen mediante el modelo base SDXL cuando el LoRA está cargado.
- Aplicación de un concepto o estilo activado por la palabra clave `d-art`.
- Compatibilidad con prompts negativos, tal como muestra el widget (`lowres,`).
- Soporte de la pipeline `text-to-image` de diffusers.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta razonamiento multi-paso, matemáticas ni código.
- Capacidades multilingües: no disponibles; el único ejemplo publicado usa inglés.
- No se declaran capacidades especiales como modo thinking, visión, audio o control estructural (ControlNet, IP-Adapter) más allá de lo que herede del base.

## Casos de uso

- Prototipado de estilos de ilustración: cargar el LoRA sobre el checkpoint Illustrious y generar variaciones con la palabra `d-art` para explorar un estilo concreto antes de fijar una dirección artística.
- Generación de arte conceptual para personajes: usar el prompt de ejemplo (`maria robotnik, thick thighs`) como plantilla y sustituir el sujeto para producir bocetos de personajes con la estética del adaptador.
- Iteración rápida en pipelines de diffusers: al ser un LoRA de 0,2 GB, se puede cargar y descargar en memoria con `load_lora_weights` y `unload_lora_weights` sin reiniciar el proceso, lo que facilita comparar variantes en un mismo script.
- Composición con otros LoRA: al ser un adaptador ligero, puede combinarse con otros LoRA del ecosistema SDXL/Illustrious mediante pesos de fusión, siempre que las licencias de todos los componentes lo permitan.
- Experimentación académica sobre adaptación de bajo rango: sirve como ejemplo de LoRA de difusión para estudiar cómo un adaptador pequeño modifica la distribución de salida de un checkpoint grande.
- Pruebas de reproducibilidad de la model card: el widget publicado permite comprobar si el prompt de ejemplo reproduce el resultado esperado con el checkpoint base indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros LoRA o checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende enteramente del checkpoint base SDXL. Como referencia orientativa del base, una SDXL en fp16 requiere del orden de 8-10 GB de VRAM para una sola imagen, pero este dato no lo publica el autor.
- GPU recomendadas: no disponibles en la información del repositorio.
- Compatibilidad con GPU de consumo: no declarada; el adaptador en sí pesa 0,2 GB y no determina los requisitos, que vienen marcados por el modelo base.
- Opciones de despliegue: la librería declarada es diffusers; no se documentan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí). Para difusión serían habituales diffusers, ComfyUI o Automatic1111, pero el autor no las menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, cualquier LoRA de la familia Illustrious XL compartiría el mismo modelo base y un tamaño de repositorio del orden de centenas de MB, pero no se dispone de datos concretos de alternativas en la información suministrada.

## Limitaciones y advertencias

- La model card no documenta sesgos; al estar entrenado presumiblemente sobre un checkpoint NSFW, puede reproducir sesgos de género, cuerpo y contenido sexual presentes en el base.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y artefactos, especialmente con prompts poco específicos.
- El modelo base declarado tiene orientación NSFW; su uso en entornos laborales o productos dirigidos a menores requiere filtrado y políticas de contenido explícitas.
- No se especifica licencia, por lo que el uso comercial queda sin base legal clara y debe consultarse con el autor y con la licencia del checkpoint base.
- No se declaran idiomas soportados; los prompts en castellano pueden funcionar peor que en inglés, que es el idioma del único ejemplo publicado.
- El adaptador depende de un checkpoint base concreto; usarlo sobre otro modelo SDXL puede degradar o anular el efecto de la palabra `d-art`.
- Repositorio con cero descargas y un solo "like": no hay evidencia de comunidad, mantenimiento ni validación externa.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar riesgo de memorización de imágenes o personas concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/edp446/d-art
- Modelo base: https://huggingface.co/John6666/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl
- Archivos del repositorio: https://huggingface.co/edp446/d-art/tree/main
- Documentación de diffusers para LoRA: https://huggingface.co/docs/diffusers
