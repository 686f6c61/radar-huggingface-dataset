# RunningHubAI/rh-yeji2-lora

## Resumen

rh-yeji2-lora es un adaptador LoRA para edición de imágenes publicado por RunningHubAI en Hugging Face. Se trata de un peso de ajuste fino (fine-tuning) derivado de Qwen-Edit-2511, un modelo base de edición de imágenes de la familia Qwen. El repositorio contiene un único archivo de pesos en formato safetensors de aproximadamente 900 MiB, pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

El modelo está etiquetado con el pipeline `image-text-to-image`, lo que indica que su función es la edición o transformación de imágenes a partir de instrucciones en lenguaje natural. No obstante, la model card es extremadamente escueta: no documenta el propósito concreto del LoRA, el dataset de entrenamiento, los hiperparámetros utilizados ni ejemplos de uso. El campo "About this model" contiene únicamente un marcador de posición (`<p>1</p>`), lo que sugiere una publicación automatizada o incompleta.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto recién publicado (noviembre de 2026 según los metadatos), con cero descargas y cero likes, sin licencia declarada y sin documentación técnica sustancial. Cualquier evaluación rigurosa del modelo requerirá probarlo empíricamente en ComfyUI con el modelo base Qwen-Edit-2511.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Edit-2511; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (pesos LoRA de 900 MiB; el número de parámetros entrenables no se documenta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo se distribuye en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`yejing2.safetensors`, ~900 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Edit-2511 para modificar su comportamiento sin reentrenar todos los pesos. La model card indica explícitamente "Finetuned from: Qwen-Edit-2511", pero no aporta ningún detalle sobre qué módulos del transformer se adaptaron (attention, MLP, cross-attention), el rango del LoRA, el alpha, la tasa de aprendizaje ni el número de pasos.

Tampoco se documenta el dataset de entrenamiento: no se indica el número de imágenes, su procedencia, la composición de pares imagen-texto, ni si se aplicaron técnicas como regularización, captions automáticos o aumento de datos. No hay mención a RLHF, DPO ni a ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). El nombre "yeji2" o "yejing2" (el archivo se llama `yejing2.safetensors`) no se explica en la documentación y podría referirse a un concepto, estilo o personaje concreto, pero no hay información que lo confirme.

## Capacidades

- Edición de imágenes guiada por texto: el pipeline declarado (`image-text-to-image`) sugiere que el modelo acepta una imagen de entrada y una instrucción textual para producir una imagen editada.
- Integración con ComfyUI: etiquetado explícitamente como `comfyui`, por lo que está pensado para cargarse como nodo LoRA en flujos de trabajo de ComfyUI.
- Compatibilidad con Qwen-Edit-2511: al ser un LoRA, hereda las capacidades del modelo base, que no se detallan en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades de audio o vídeo.
- Capacidades multilingües: no disponibles.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Edición de imágenes en ComfyUI: cargar `yejing2.safetensors` como nodo LoRA junto al modelo base Qwen-Edit-2511 para aplicar el estilo o la transformación específica que el adaptador haya aprendido. Es el uso principal declarado por el autor.
- Pruebas de concepto en RunningHub: la plataforma del autor permite cargar el LoRA y ejecutarlo en la nube sin infraestructura local, útil para evaluar rápidamente su comportamiento antes de integrarlo en un pipeline propio.
- Prototipado de flujos de edición por texto: investigadores que quieran comparar adaptadores LoRA sobre Qwen-Edit-2511 pueden usar este peso como una variante más dentro de un banco de pruebas.
- Generación de variaciones estilísticas: si el LoRA codifica un estilo concreto (no documentado), podría emplearse para aplicar dicho estilo de forma consistente a imágenes de entrada.
- Integración vía API de RunningHub: el autor ofrece una API (`call-api`) que permite invocar el modelo de forma remota, lo que facilita su uso en aplicaciones sin GPU local.
- Docencia y experimentación con LoRA: por su tamaño reducido (~900 MiB) y su formato safetensors, es un candidato manejable para demostrar cómo funcionan los adaptadores de bajo rango en modelos de edición de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el LoRA: el archivo pesa ~900 MiB, por lo que en FP16 ocuparía aproximadamente 1 GB adicional sobre la VRAM del modelo base Qwen-Edit-2511. La VRAM total dependerá del tamaño y la cuantización del modelo base, dato no disponible.
- GPU recomendadas: no disponible. Al ser un LoRA sobre un modelo de edición de imagen, se requiere una GPU con VRAM suficiente para el modelo base; no se especifica cuál.
- ¿Cabe en GPU de consumo? No se puede determinar sin conocer el modelo base. El LoRA en sí es ligero, pero el modelo base Qwen-Edit-2511 podría requerir VRAM considerable.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado), API de RunningHub (declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para modelos de difusión/edición de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (LoRA de edición de imagen sobre Qwen-Edit) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el propósito del LoRA, el dataset, los hiperparámetros ni ejemplos de uso; el campo "About this model" contiene solo un marcador de posición.
- Licencia no declarada: no se especifica una licencia concreta; la model card remite a "la licencia del proyecto original o upstream", lo que genera incertidumbre legal para uso comercial. Es imprescindible verificar la licencia de Qwen-Edit-2511 antes de cualquier despliegue en producción.
- Sin métricas de calidad: no hay benchmarks, evaluaciones humanas ni ejemplos visuales que permitan estimar la fidelidad o coherencia de las ediciones.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir artefactos, inconsistencias o modificaciones no deseadas; no se documenta ningún mecanismo de mitigación.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demográficos, estilísticos o culturales.
- Idiomas no especificados: se desconoce si las instrucciones de edición funcionan en castellano, inglés, chino u otros idiomas.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- Dependencia del modelo base: su comportamiento es inseparable de Qwen-Edit-2511; cualquier limitación del modelo base (contexto, resolución, idioma) se hereda.
- Fecha de creación futura en los metadatos (2026-11-05): conviene verificar la autenticidad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-yeji2-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2041858979093024770
- Página del autor: https://www.runninghub.cn/user-center/1913205198314225666
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-yeji2-lora/blob/main/README_cn.md
