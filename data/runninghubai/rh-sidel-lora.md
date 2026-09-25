# RunningHubAI/rh-sidel-lora

## Resumen

rh-sidel-lora es un adaptador LoRA publicado por RunningHubAI para el modelo de generación de vídeo Wan2.2, concretamente para su experto de bajo ruido (LowNoise). El repositorio contiene un único archivo de pesos, `iGoon_Blink_Cowgirl_Side_View_I2V_LOW.safetensors` (146 MiB), pensado para su carga en flujos de ComfyUI y en la plataforma en la nube RunningHub. El autor original del adaptador se identifica en la model card como "RunningHub-@人民万岁", y la publicación se hace en nombre de ese autor.

Se trata de un LoRA especializado en generación de vídeo a partir de imagen (image-to-video, I2V) con un encuadre lateral concreto y una pose específica, no de un modelo de lenguaje ni de un modelo generalista. Su función es modular el comportamiento del modelo base Wan2.2 en la fase de muestreo de bajo ruido, de modo que el resultado herede una composición y un movimiento determinados sin necesidad de reentrenar el modelo completo.

La relevancia de esta ficha es limitada pero informativa: ilustra el patrón habitual de publicación de LoRAs de terceros dentro del ecosistema ComfyUI, con documentación mínima, licencia sin especificar y ausencia total de métricas. Cualquier evaluación de rendimiento debe remitirse al modelo base Wan2.2, cuyas especificaciones no se detallan en la información disponible de este repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (matriz de bajo rango) sobre un diffusion transformer de vídeo. Modelo base: Wan2.2, variante LowNoise (experto de bajo ruido) |
| Parametros totales | No disponible. El único archivo de pesos ocupa 146 MiB; si estuviera almacenado en fp16/bf16 equivaldría aproximadamente a 76 millones de parámetros (estimación aritmética orientativa, no confirmada) |
| Parametros activos | No aplica al adaptador. El modelo base Wan2.2 emplea una arquitectura de mezcla de expertos (MoE) con especialización en ruido alto y ruido bajo; el LoRA solo interviene en el experto LowNoise |
| Longitud de contexto | No disponible. En el caso del modelo base se traduce en número de fotogramas por clip, dato no especificado en la información proporcionada |
| Tipos de cuantizacion | No disponible para el LoRA. La cuantización aplicable depende del modelo base cargado (fp16, bf16, fp8 o GGUF) en el flujo de ComfyUI |
| Idiomas soportados | No disponible. El prompt de texto se procesa en el codificador de texto del modelo base Wan2.2 |
| Licencia | No disponible. La model card indica únicamente que el copyright permanece en el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`iGoon_Blink_Cowgirl_Side_View_I2V_LOW.safetensors`) |
| Tipo de modelo | LoRA (adaptador de ajuste fino) |
| Modelo base | Wan2.2 (LowNoise) |
| Tamaño del repositorio | 0,2 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de creación registrada | 2026-09-24 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, esto es, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base y que modifican su comportamiento sin alterar los pesos originales. Al estar ajustado sobre la variante LowNoise de Wan2.2, está diseñado para actuar en la segunda etapa del muestreo típico de esta familia: la fase en la que el experto de bajo ruido refina el resultado y define los detalles finales. El nombre del archivo (`..._I2V_LOW`) confirma ese uso: tarea image-to-video y experto de bajo ruido.

No se ha publicado información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del adaptador, ni si se aplicaron técnicas de regularización o de mezcla con otros adaptadores. Tampoco hay datos sobre el número de tokens o de fotogramas usados, la resolución de entrenamiento o si se emplearon anotaciones de pose o de cámara. La model card se limita a indicar que el entrenamiento puede realizarse en la plataforma RunningHub y a enlazar la página de entrenamiento, sin detallar el proceso seguido en este caso.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (image-to-video) mediante el modelo base Wan2.2.
- Control de encuadre lateral y de una pose concreta, presumiblemente aprendidos por el adaptador a partir de los datos de entrenamiento.
- Integración como nodo de LoRA en flujos de ComfyUI, con peso ajustable (el peso recomendado no se especifica en la información disponible).
- Ejecución en la nube a través de RunningHub, sin necesidad de GPU local.
- Compatibilidad con el resto de adaptadores y nodos del ecosistema ComfyUI, siempre que el flujo respete la variante LowNoise del modelo base.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión para comprensión de imágenes, tool calling, function calling ni capacidades de agente. Es un adaptador de generación de vídeo, no un modelo de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Integración en un pipeline de ComfyUI para image-to-video: el adaptador se carga en el nodo de LoRA asociado al muestreador que emplea el experto LowNoise de Wan2.2, de modo que el clip generado adopte la composición lateral aprendida sin modificar el resto del flujo.
- Producción de contenido adulto o erótico para plataformas de suscripción: el adaptador está orientado a un tipo de escena concreta; su uso comercial exige verificar antes la licencia del modelo base y del propio adaptador, dato no disponible.
- Previsualización de personajes para animación: convertir una ilustración o un render fijo en un clip animado que sirva como referencia de movimiento para el equipo de animación, antes de abordar una producción más costosa.
- Pruebas de composición y encuadre: usar el adaptador como plantilla de cámara lateral para comparar variantes de una misma escena y decidir qué plano funciona mejor, reduciendo el tiempo de iteración frente a un reencuadre manual.
- Generación de clips en lote sin hardware local: mediante la API de RunningHub se pueden encolar trabajos sobre infraestructura ajena, lo que permite producir lotes de clips sin disponer de una GPU con VRAM suficiente para el modelo base.
- Estudio de adaptadores de bajo rango en modelos de difusión de vídeo: el archivo, de solo 146 MiB, sirve como caso práctico para analizar cuánta capacidad de control (pose y encuadre) puede codificarse en un adaptador de tamaño reducido sobre un transformer de difusión.
- Prototipado rápido de escenas multi-plano: al fijar un punto de vista lateral, el adaptador facilita la continuidad visual entre planos de una misma secuencia cuando se combina con otros adaptadores o con el modelo base sin adaptador.
- Reutilización en investigación sobre sesgos de representación: el adaptador puede emplearse como objeto de estudio para analizar cómo los datos de ajuste fino condicionan la diversidad de cuerpos, poses y encuadres generados por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas objetivas (FVD, CLIPScore, SSIM, consistencia temporal), comparaciones cuantitativas con otros adaptadores ni ejemplos de vídeo con parámetros de generación documentados. Cualquier afirmación sobre calidad visual o fidelidad al encuadre sería una apreciación subjetiva y no verificable con los datos disponibles.

## Requisitos de hardware

- El adaptador en sí añade un coste mínimo: el archivo de pesos ocupa 146 MiB, por lo que la VRAM adicional en inferencia es marginal (del orden de 0,2 GB).
- El requisito real de hardware viene determinado por el modelo base Wan2.2 en su variante LowNoise, no por el LoRA. Las cifras de VRAM dependen del número de parámetros del base, la cuantización y el grado de offloading configurado en ComfyUI.
- Estimación orientativa para el modelo base (no confirmada en la información proporcionada y sujeta a la variante concreta de Wan2.2): pesos en bf16/fp16 en el rango de decenas de gigabytes, lo que exige GPU de datacenter tipo A100 80 GB o H100; con cuantización fp8 o GGUF Q8 el rango baja a GPU profesionales de 40-48 GB (A100 40 GB, L40S); con cuantizaciones GGUF de 4-5 bits y offloading parcial a RAM es posible ejecutarlo en GPU de consumo de 24 GB (RTX 4090, RTX 5090) y, con cuantizaciones más agresivas, en tarjetas de 12-16 GB a costa de velocidad y calidad.
- Opciones de despliegue: ComfyUI es la vía principal documentada; RunningHub ofrece ejecución en la nube con API; Hugging Face actúa como repositorio de pesos. No hay indicios de soporte en vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a un diffusion transformer de vídeo.
- Latencia y throughput: no disponibles. No se han publicado tiempos de generación ni tasas de fotogramas por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño de pesos | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-sidel-lora | LoRA de vídeo I2V | Wan2.2 (LowNoise) | 146 MiB | No disponible | No disponible | Hugging Face y RunningHub |
| Wan2.2 I2V LowNoise (base sin adaptador) | Modelo de difusión de vídeo | — | No disponible en esta ficha | No disponible | La del proyecto original | Hugging Face y múltiples plataformas |
| rh-qwen-image-edit-2511-lora | LoRA de edición de imagen | Qwen-Edit-2511 | No disponible en esta ficha | No aplica (imagen) | No disponible | Hugging Face y RunningHub |
| Otros LoRAs de movimiento o pose para Wan2.2 | LoRA de vídeo | Wan2.2 | Variable | No disponible | Variable, a menudo sin especificar | Hugging Face, Civitai y plataformas similares |

No se dispone de datos cuantitativos que permitan comparar rendimiento entre estas opciones. La comparación se limita a tipo de artefacto, modelo base y vía de distribución.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica que el copyright pertenece al autor y remite a la licencia del proyecto original, sin concretar cuál es. No hay confirmación de que el uso comercial esté permitido.
- Contenido para adultos: el nombre del archivo y la naturaleza del adaptador apuntan a material sexualmente explícito. Su uso en producción exige verificar la legislación aplicable, las políticas de la plataforma de destino y los sistemas de verificación de edad.
- Ausencia de métricas: no hay benchmarks ni ejemplos documentados, por lo que la calidad del resultado no puede validarse sin pruebas propias.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Dependencia estricta del modelo base: el adaptador está ajustado para el experto LowNoise de Wan2.2. Cargarlo sobre otra variante (por ejemplo, el experto HighNoise o una versión distinta de Wan) puede degradar el resultado o producir artefactos.
- Peso del LoRA no especificado: no se indica el valor de escala recomendado, un parámetro crítico para equilibrar fidelidad al ajuste y coherencia con el modelo base.
- Riesgo de artefactos propios de la difusión de vídeo: flickering temporal, deformaciones anatómicas, incoherencias entre fotogramas y deriva de identidad respecto a la imagen de entrada. El adaptador puede amplificar estos problemas al forzar una pose y un encuadre concretos.
- Sesgos de representación: no hay información sobre la diversidad del dataset de entrenamiento; es probable que el adaptador reproduzca los sesgos de cuerpo, etnia y edad presentes en los datos, agravados por la especificidad de la pose.
- Idiomas de prompt no documentados: se desconoce si el codificador de texto del modelo base está optimizado para castellano, inglés, chino u otros idiomas.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-24) es posterior a la fecha habitual de consulta, lo que sugiere un problema de metadatos en el repositorio y aconseja tratar cualquier dato temporal con cautela.
- Sin garantía de mantenimiento: no hay información sobre versiones futuras, correcciones ni soporte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-sidel-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-sidel-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079421288004116481
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos: https://www.runninghub.ai/page-model
- Catálogo de modelos: https://www.runninghub.ai/models
- Organización RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
