# akm85/ordo-qwen2vl-lora

## Resumen

El modelo `akm85/ordo-qwen2vl-lora` es un adaptador LoRA que ajusta finamente el modelo multimodal `Qwen/Qwen2-VL-2B-Instruct` para tareas de lectura de texto en imágenes del mundo real: etiquetas de productos, lomos de libros, escritura a mano y pantallas de electrodomésticos. Lo desarrolla el usuario akm85, que documenta el proceso de entrenamiento en el repositorio GitHub `xpressabhi/ordo`. El adaptador se entrena exclusivamente sobre las capas de lenguaje, dejando congelada la torre de visión para evitar desbordamientos de memoria en hardware Apple Silicon con 16 GB unificados.

La relevancia de este modelo radica en que demuestra una mejora medible en la tarea de extracción de respuestas a partir de fotografías de texto real: el recall pasa del 38 % al 65 % en un conjunto de evaluación de 26 ítems, comparando el modelo base con el adaptador. Al ser un adaptador LoRA de pequeño tamaño (rank 8, alpha 16), se distribuye como un archivo `safetensors` independiente que se puede cargar sobre el modelo base sin necesidad de reentrenar. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2-VL-2B-Instruct (transformer multimodal, solo capas de lenguaje) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 8, alpha 16; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2-VL-2B-Instruct soporta 32k tokens, pero no se especifica en la card) |
| Tipos de cuantizacion | No disponible (solo se menciona safetensors para los adaptadores) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapters.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena con la librería `mlx-vlm` 0.6.15, usando la API de Python (`lora/run_lora.py`). La configuración de entrenamiento es: rank 8, alpha 16, dropout 0.0, learning rate 2e-5, 300 iteraciones, batch size 1, e imágenes limitadas a 672 píxeles en su lado mayor. Se aplica LoRA a las 28 capas de lenguaje del modelo base, cubriendo las proyecciones q, k, v, o y las capas MLP. La torre de visión permanece congelada, según el autor, para evitar desbordamientos de memoria en hardware Metal con 16 GB.

El dataset se construye a partir de `eval/eval.json` del repositorio ordo, con una aumentación de parafraseado x2 (es decir, cada ítem se duplica con una variante lingüística). El resultado reportado es una mejora del recall de respuestas del 38 % al 65 % en los mismos 26 ítems de evaluación, comparando el modelo base con el adaptador. No se detallan más datos sobre el volumen total de datos de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Lectura de texto en imágenes del mundo real: etiquetas de productos, lomos de libros, escritura a mano y pantallas de electrodomésticos.
- Extracción de respuestas a partir de fotografías de texto, mejorando el recall frente al modelo base sin adaptador.
- Al ser un adaptador sobre Qwen2-VL-2B-Instruct, hereda las capacidades generales de visión-lenguaje del modelo base (comprensión de imágenes, generación de texto, razonamiento multimodal), aunque el adaptador se centra específicamente en la tarea de ordo.
- No se mencionan capacidades de tool calling, agentes ni modos de pensamiento explícitos en la documentación del adaptador.

## Casos de uso

- Digitalización de etiquetas de productos en almacenes: el modelo puede leer códigos, fechas de caducidad o instrucciones de uso directamente de fotografías tomadas con un móvil, reduciendo errores de entrada manual.
- Accesibilidad para personas con discapacidad visual: integrado en una aplicación que captura texto de envases o libros y lo convierte en voz, aprovechando la mejora en lectura de escritura a mano y tipografías reales.
- Inventario de bibliotecas: fotografiar lomos de libros para extraer títulos y autores automáticamente, con una ventana de contexto suficiente para procesar varias imágenes en una sola consulta.
- Mantenimiento de electrodomésticos: leer pantallas de error o ajustes de dispositivos domésticos a partir de una foto, facilitando el soporte técnico remoto.
- Automatización de formularios en papel: extraer respuestas manuscritas de encuestas o formularios escaneados, mejorando la precisión frente a modelos genéricos.
- Verificación de documentos de identidad: leer campos impresos y manuscritos en documentos reales, aunque se debe validar con un conjunto más amplio antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es la mejora de recall en la tarea ordo:

| Metrica | Modelo base | Con adaptador | Diferencia |
|---|---|---|---|
| Answer-recall (26 ítems) | 38 % | 65 % | +27 puntos |

Este resultado se obtiene sobre el mismo conjunto de evaluación de 26 ítems, comparando el modelo base sin adaptador frente al modelo con el adaptador cargado. No se especifican otras métricas como precisión, F1 o tiempo de inferencia.

## Requisitos de hardware

- El entrenamiento se realizó en hardware Apple Silicon con 16 GB de memoria unificada (Metal), y el autor indica que la torre de visión se congeló para evitar OOM. Por tanto, se recomienda al menos 16 GB de RAM unificada para cargar el modelo base y el adaptador con MLX.
- Para inferencia en GPU NVIDIA, el modelo base Qwen2-VL-2B-Instruct puede caber en GPUs con 8 GB de VRAM si se cuantiza (por ejemplo, GGUF o AWQ), pero no se proporcionan datos específicos para este adaptador.
- El adaptador en sí es muy ligero (rank 8, alpha 16, 28 capas), por lo que el consumo adicional de memoria es mínimo.
- Opciones de despliegue: MLX (para Apple Silicon), vLLM, TGI o llama.cpp si se convierte el modelo base a esos formatos. El adaptador se carga mediante `mlx_vlm.load` con `adapter_path`.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de lectura de texto en imágenes del mundo real con adaptadores LoRA. La comparación más directa sería contra el modelo base sin adaptador, que ya se refleja en la sección de benchmarks. Alternativas genéricas de visión-lenguaje de tamaño similar (por ejemplo, LLaVA-1.5-7B o Phi-3-vision) no son directamente comparables porque el adaptador está diseñado para un caso de uso muy concreto y no se han evaluado en los mismos ítems.

## Limitaciones y advertencias

- El adaptador se entrena sobre un conjunto de evaluación muy reducido (26 ítems), lo que implica un alto riesgo de sobreajuste. La mejora del 38 % al 65 % puede no generalizar a otros dominios o variaciones de imágenes.
- Solo funciona con el modelo base `Qwen/Qwen2-VL-2B-Instruct`; no es un modelo independiente y requiere cargar el adaptador sobre ese checkpoint.
- La torre de visión está congelada, por lo que el adaptador no mejora la percepción visual, solo la interpretación del texto extraído por el modelo base.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un dataset pequeño y específico, puede presentar errores en escritura manuscrita poco común o en tipografías muy diferentes a las del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2-VL-2B-Instruct tiene su propia licencia (Qwen Research License) que puede requerir aceptación y tener restricciones adicionales. Se debe verificar la licencia del modelo base antes de usar el adaptador en producción.
- No se proporcionan instrucciones de despliegue para entornos de producción más allá del ejemplo de carga con MLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/akm85/ordo-qwen2vl-lora
- Repositorio GitHub del proyecto ordo: https://github.com/xpressabhi/ordo
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
