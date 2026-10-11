# Jinstudio/FLUX.1-schnell

## Resumen

`Jinstudio/FLUX.1-schnell` es un espejo (mirror) sin restricciones de acceso del modelo de generación de imágenes texto-a-imagen `black-forest-labs/FLUX.1-schnell`, publicado por el usuario de HuggingFace Jinstudio. Según la model card del repositorio, los pesos no están modificados y se redistribuyen con los mismos términos que el modelo original. El modelo original lo desarrolla Black Forest Labs, el equipo responsable también de la familia Stable Diffusion original.

Se trata de un transformer de flujo rectificado (rectified flow transformer) de aproximadamente 11.891.178.560 parámetros (unos 11,9 mil millones), entrenado con destilación adversarial latente sobre difusión, lo que le permite generar imágenes de alta calidad en solo 1 a 4 pasos de inferencia, frente a los 20-50 pasos habituales en modelos de difusión convencionales. Está publicado bajo licencia Apache 2.0, lo que habilita uso personal, científico y comercial. El repositorio ocupa 57,8 GB e incluye los pesos en formato safetensors.

Su relevancia práctica reside en dos factores: por un lado, la licencia Apache 2.0 es más permisiva que la del modelo hermano `FLUX.1 [dev]`, que restringe el uso comercial; por otro, la reducción del número de pasos a 1-4 abarata drásticamente el coste por imagen en producción. Conviene señalar que este repositorio concreto es un espejo con 0 descargas y 0 likes registrados, sin verificación independiente, y que la model card lo atribuye a Unsloth mientras el propietario del repositorio en HuggingFace figura como Jinstudio, una discrepancia que conviene tener en cuenta antes de usarlo como fuente de pesos en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) para difusión latente; según la información disponible, entrenado con destilación adversarial latente (latent adversarial diffusion distillation) |
| Parámetros totales | 11.891.178.560 (≈11,9 B), según los metadatos de safetensors del repositorio |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo de generación de imágenes, no de texto). En el ejemplo de referencia de diffusers se emplea `max_sequence_length=256` para la secuencia de prompt |
| Tipos de cuantización | No disponible en este repositorio. La referencia de diffusers usa `torch_dtype=torch.bfloat16`; existen cuantizaciones GGUF y FP8 de la comunidad, pero no forman parte de este repo |
| Idiomas soportados | Inglés (`en`), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers); repo de 57,8 GB en total |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer de flujo rectificado de 12.000 millones de parámetros capaz de generar imágenes a partir de descripciones textuales. Frente a los modelos de difusión clásicos, que parten de ruido gaussiano y lo eliminan iterativamente durante decenas de pasos, el flujo rectificado aprende una trayectoria más directa entre la distribución de ruido y la de datos, lo que permite reducir el número de pasos de muestreo. En este caso, la destilación adversarial latente durante el entrenamiento es la técnica que habilita la generación en 1 a 4 pasos con calidad competitiva, según afirma el autor original.

La información proporcionada no detalla el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo fases de ajuste por preferencias humanas (RLHF/DPO). La model card tampoco desglosa la arquitectura interna (número de bloques, disposición de las capas de atención, codificadores de texto asociados) más allá de la descripción genérica de "rectified flow transformer". Cualquier dato adicional sobre la arquitectura interna de FLUX.1 debe consultarse en la documentación del repositorio original de Black Forest Labs, no en este espejo.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés, con calidad de salida que el autor original califica como "de vanguardia" y seguimiento de prompt competitivo, sin cifras concretas publicadas en la información disponible.
- Generación rápida: 1 a 4 pasos de inferencia, en lugar de las decenas de pasos típicas de otros modelos de difusión, lo que reduce el coste computacional por imagen.
- Uso comercial permitido por la licencia Apache 2.0, a diferencia del modelo `FLUX.1 [dev]` de la misma familia.
- Integración con la librería diffusers mediante `FluxPipeline`, con soporte de `enable_model_cpu_offload()` para reducir el consumo de VRAM.
- Disponibilidad en ComfyUI para inferencia local con flujos de trabajo basados en nodos.
- Disponibilidad vía API en proveedores externos (bfl.ml, replicate.com, fal.ai, mystic.ai) según la model card.
- No es un modelo de lenguaje: no soporta tool calling, function calling, razonamiento multi-paso, agentes, modo "thinking", audio ni visión como entrada. Tampoco admite conversación multi-turno.
- Multilingüismo: solo inglés declarado. No hay soporte declarado de otros idiomas para los prompts.

## Casos de uso

- Generación de material gráfico para marketing y redes sociales: con 1 a 4 pasos de inferencia y licencia Apache 2.0, permite producir variantes de imágenes de campaña a bajo coste por unidad y sin las restricciones comerciales de otros pesos de la familia FLUX.
- Prototipado rápido de diseño de producto y concepto visual: la generación en pocos pasos reduce el tiempo de iteración entre idea y boceto, útil en fases tempranas donde se exploran decenas de alternativas.
- Producción de assets para videojuegos y aplicaciones interactivas: fondos, iconos o texturas generadas bajo demanda, con la ventaja de que la licencia permisiva no obliga a auditar el uso comercial derivado.
- Ilustración editorial y generación de imágenes de relleno para medios digitales: el modelo puede cubrir huecos de contenido visual que requieren imágenes originales y libres de derechos de terceros.
- Aumento de datos (data augmentation) para entrenamiento de modelos de visión por computador: generar variaciones sintéticas de imágenes y etiquetas asociadas para ampliar datasets con licencia permisiva.
- Integración en pipelines de creación de contenido dentro de aplicaciones web: mediante `FluxPipeline` en un servicio backend o a través de ComfyUI como motor local, con posibilidad de descargar el modelo a CPU para reducir los requisitos de VRAM.
- Previsualización acelerada en flujos de edición de imagen: usar la generación en 1-4 pasos como paso de borrador previo a un refinado con modelos de mayor coste o con adaptadores de edición de la comunidad.
- Generación local en equipos sin conexión o con requisitos de privacidad: al tratarse de un espejo sin "gate" de descarga, permite el despliegue on-premise cuando no es viable enviar prompts a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del modelo original afirma que la calidad de salida y el seguimiento de prompt son competitivos con alternativas de código cerrado, pero no incluye cifras (FID, CLIP score, HPSv2, GenEval ni similares) que permitan construir una tabla comparativa. No se han inventado valores.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (≈11,9 B) y de las indicaciones de la propia model card, no medidas publicadas en la información disponible.

- Pesos del transformer en bfloat16: aproximadamente 24 GB solo para el transformer; el pipeline completo (transformer más componentes de texto y VAE) puede situarse en el rango de 30-40 GB de VRAM si se cargan todos los componentes en GPU.
- GPU de centro de datos: A100 (40 GB o 80 GB), H100, L40S (48 GB) permiten ejecutar el pipeline completo en GPU sin offload.
- GPU de consumo con 24 GB (RTX 4090, RTX 3090): ejecución cómoda del transformer en bfloat16, con offload parcial del resto de componentes si es necesario.
- GPU de consumo con 12 GB: viable mediante cuantización a FP8 o GGUF de la comunidad y `enable_model_cpu_offload()`, con penalización de latencia por el trasiego de pesos entre CPU y GPU.
- GPU de consumo con 8 GB: solo con cuantizaciones GGUF agresivas (Q4/Q5) y offload; la latencia aumenta de forma notable.
- CPU: inferencia posible pero muy lenta; no hay cifras de latencia publicadas en la información disponible.
- Opciones de despliegue: diffusers (`FluxPipeline`), ComfyUI con nodos nativos, y variantes GGUF vía extensiones de la comunidad (ComfyUI-GGUF, stable-diffusion.cpp). vLLM, TGI, Ollama y llama.cpp no aplican, ya que son herramientas orientadas a modelos de lenguaje y no a difusión de imágenes.
- Latencia y throughput: no disponible. Cualitativamente, el uso de 1 a 4 pasos de muestreo reduce el coste por imagen frente a pipelines de 20-50 pasos, pero no se han publicado mediciones en la información disponible.
- Almacenamiento: el repositorio completo ocupa 57,8 GB, por lo que conviene prever ese espacio en disco, además de espacio adicional para las versiones cuantizadas que se generen.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen del conocimiento general de la familia FLUX y de otros modelos de difusión, no de la información proporcionada en esta ficha; se marcan como referencia y conviene verificarlos en sus repositorios oficiales.

| Modelo | Parámetros | Pasos típicos | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.1 [schnell] (este espejo) | ≈11,9 B | 1-4 | Apache 2.0 | Pesos abiertos en HuggingFace (espejo sin gate) |
| FLUX.1 [dev] | ≈12 B | 20-50 | Licencia no comercial de Black Forest Labs | Pesos abiertos, con condiciones de uso restringidas |
| FLUX.1 [pro] | No disponible | No disponible | Propietaria | Solo API (bfl.ml) |
| Stable Diffusion 3.5 Large | ≈8 B | 20-50 | Stability AI Community License | Pesos abiertos con condiciones |
| SDXL | ≈3,5 B | 20-40 | CreativeML Open RAIL++-M | Pesos abiertos |

La ventaja diferencial de `FLUX.1 [schnell]` frente a `FLUX.1 [dev]` es la licencia Apache 2.0 y el menor número de pasos necesarios por imagen; su desventaja relativa, según la propia documentación de la familia, es que el modo dev suele ofrecer un seguimiento de prompt más fiel a costa de más pasos de inferencia.

## Limitaciones y advertencias

- El modelo no está diseñado ni es capaz de proporcionar información factual; no debe usarse como fuente de datos verificados.
- Como modelo estadístico, puede amplificar sesgos sociales existentes en los datos de entrenamiento, tanto en la representación de personas como en estereotipos culturales.
- Puede fallar en generar salidas que coincidan con el prompt proporcionado.
- El seguimiento de prompt depende en gran medida del estilo de redacción del prompt, lo que exige ajuste y pruebas por caso de uso.
- Idiomas: solo inglés declarado. Los prompts en otros idiomas, incluido el castellano, pueden degradar el resultado.
- Uso fuera de alcance: la licencia Apache 2.0 permite uso comercial, pero la model card prohíbe explícitamente usos como vulnerar la legislación aplicable, explotar o dañar a menores, generar desinformación, difundir información personal identificable con fines lesivos, acoso, desnudos no consentidos o contenido pornográfico ilegal, y toma de decisiones totalmente automatizadas que afecten a derechos legales.
- Naturaleza del repositorio: se trata de un espejo no oficial con 0 descargas y 0 likes, sin verificación independiente de que los pesos coincidan bit a bit con los del repositorio original. Para producción, es más prudente descargar desde `black-forest-labs/FLUX.1-schnell` o verificar hashes.
- Discrepancia de atribución: la model card indica que el espejo lo republicó Unsloth, mientras que el propietario del repositorio figura como Jinstudio.
- Metadatos atípicos: las fechas de creación y actualización indican 2026-10-11, lo que resulta anómalo y conviene contrastar antes de tomar el repositorio como referencia temporal fiable.
- La información disponible no incluye datos de benchmarks, latencia, throughput ni composición del dataset, por lo que no es posible auditar el rendimiento real ni las características del entrenamiento desde esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jinstudio/FLUX.1-schnell
- Repositorio original: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Anuncio y blog de Black Forest Labs: https://blackforestlabs.ai/announcing-black-forest-labs/
- Implementación de referencia y código de muestreo: https://github.com/black-forest-labs/flux
- Documentación de diffusers para pipelines FLUX: https://huggingface.co/docs/diffusers/main/en/api/pipelines/flux
- ComfyUI (inferencia local con nodos): https://github.com/comfyanonymous/ComfyUI
- API de Black Forest Labs: https://docs.bfl.ml/
- API en Replicate: https://replicate.com/collections/flux
- API en fal.ai: https://fal.ai/models/fal-ai/flux/schnell
- API en Mystic: https://www.mystic.ai/black-forest-labs/flux1-schnell
- Búsqueda web: no se ha encontrado ningún resultado relevante sobre el modelo; los resultados devueltos corresponden a medios de noticias (Sky News) y no guardan relación con la ficha.
