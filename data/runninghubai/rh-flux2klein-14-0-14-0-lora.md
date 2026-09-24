# RunningHubAI/rh-flux2klein-14.0-14.0-lora

## Resumen

rh-flux2klein-14.0-14.0-lora es un adaptador LoRA de generación de imágenes a partir de texto publicado en Hugging Face por RunningHub AI y atribuido al autor @Li鱼. No es un modelo completo: se distribuye como un único fichero de pesos de 83 MiB en formato safetensors que se aplica sobre el modelo base Flux2-Klein-9B, del que hereda arquitectura, capacidades y limitaciones.

Según la model card, el ajuste se orienta a "mejorar la textura y afinar el detalle" (增强质感_细节优化调整) en su versión 14.0, denominada "迅影版". Está pensado para cargarse en ComfyUI, en la plataforma RunningHub o a través de su API, y su relevancia es acotada: interesa a quien ya trabaja con Flux2-Klein-9B y busca un acabado más texturizado, no a quien necesite un modelo autónomo.

El repositorio tiene 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, no declara licencia concreta ni idiomas soportados, y no incluye benchmarks, ejemplos ni detalles del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto a imagen; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible. Fichero de pesos de 83 MiB; estimación derivada asumiendo bf16/fp16: en torno a 40 millones de parámetros en el adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de imagen; no se especifica la longitud de prompt soportada) |
| Tipos de cuantización | No disponible. Se publica un único fichero .safetensors sin variantes cuantizadas; las cuantizaciones posibles dependen del modelo base |
| Idiomas soportados | No disponible. La model card está redactada en chino e inglés pero no declara idiomas de prompt |
| Licencia | No disponible. La model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | Flux2-Klein-9B (declarado como "finetuned from") |
| Tamaño del fichero | 83 MiB (`flux2klein-增强质感_细节优化调整-14.0迅影版_14.0迅影版.safetensors`) |
| Pipeline | text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base declarado es Flux2-Klein-9B; el sufijo "9B" del nombre sugiere un modelo de difusión de aproximadamente 9.000 millones de parámetros, si bien la información proporcionada no confirma ese dato ni describe el tipo de backbone (transformer de difusión, VAE o text encoder) ni el número y destino de las capas modificadas por el LoRA.

No hay información sobre el conjunto de datos de entrenamiento, el número de pasos, el rango y alpha del adaptador, la resolución de entrenamiento ni si se emplearon técnicas de ajuste por preferencias (RLHF, DPO) o regularización. El único indicio del objetivo de entrenamiento es el propio nombre del fichero, que en chino describe "mejora de textura y ajuste de optimización de detalle" en la versión 14.0. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de imágenes a partir de instrucciones de texto, heredada del modelo base Flux2-Klein-9B; no se documenta de forma independiente.
- Refinado de textura y detalle: es el objetivo declarado del ajuste según el nombre y la descripción del autor.
- Carga como LoRA en ComfyUI mediante los nodos habituales de carga de adaptadores.
- Ejecución en la plataforma RunningHub o a través de su API, según la model card.
- Compatibilidad con el ecosistema de pesos safetensors y con el pipeline text-to-image declarado.

No aplica: el modelo no es un LLM, por lo que no realiza generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso como agente ni razonamiento multi-paso. No se documentan capacidades de visión, audio, thinking mode ni multilingüismo de prompt.

## Casos de uso

- Refinado de imágenes generadas con Flux2-Klein-9B: aplicar el LoRA sobre un resultado previo para reforzar microdetalle y sensación de textura en materiales como tejidos, piel, metal o piedra, dentro de un flujo de trabajo iterativo en ComfyUI.
- Ilustración de producto para comercio electrónico: generar imágenes de catálogo con superficies y acabados más definidos, partiendo de prompts controlados y revisando el resultado antes de publicarlo, dado que no hay benchmarks que garanticen consistencia.
- Concept art y preproducción audiovisual: producir variantes de diseño con mayor densidad de detalle para explorar direcciones visuales antes de encargar arte final.
- Generación de fondos y texturas para videojuegos o entornos 3D: crear materiales base que después se retocan o se utilizan como referencia para texturizado.
- Prototipado de creatividades de marketing: montar campañas de prueba (banners, key visuals) rápidamente mediante un workflow de ComfyUI que combine el modelo base con este adaptador.
- Automatización por API en pipelines internos: usar el endpoint de RunningHub para integrar la generación con el LoRA en un flujo de producción, siempre que la licencia se aclare previamente con el autor.
- Exploración estilística comparativa: mantener varias versiones del LoRA (por ejemplo, esta 14.0 frente a anteriores) y alternarlas en el mismo workflow para decidir cuál encaja con la dirección artística del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, comparativas humanas), ni imágenes de ejemplo, ni comparaciones con otros adaptadores o con el modelo base sin LoRA.

## Requisitos de hardware

- VRAM del adaptador: 83 MiB, un coste prácticamente despreciable respecto al modelo base.
- El factor limitante es Flux2-Klein-9B. Partiendo del sufijo "9B" del nombre, una estimación derivada (no confirmada por la información disponible) sitúa los pesos en bf16 en torno a 18 GB, a los que hay que sumar text encoder, VAE y activaciones, lo que en la práctica suele requerir más de 20 GB de VRAM en precisión completa.
- GPU de datacenter: A100 (40/80 GB), H100, L40S (48 GB) son opciones holgadas para inferencia en bf16.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) pueden ejecutar el modelo base en bf16; tarjetas de 16 GB (RTX 4080, 4070 Ti Super) probablemente necesiten cuantización fp8/GGUF y offloading, con la consiguiente pérdida de fidelidad y velocidad.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio y vía natural de uso), Diffusers, la propia plataforma RunningHub y su API. vLLM, TGI, llama.cpp y Ollama no aplican porque están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos de generación ni resolución de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| rh-flux2klein-14.0-14.0-lora | LoRA sobre difusión texto a imagen | No disponible (fichero de 83 MiB) | No disponible | No disponible | Hugging Face, RunningHub | Enfocado a textura y detalle; 0 descargas y 0 likes |
| Flux2-Klein-9B (modelo base) | Modelo de difusión texto a imagen | ~9.000 millones (según el nombre, no confirmado) | No disponible | No disponible en la información proporcionada | No especificado | Necesario para usar el LoRA; sin él el adaptador no funciona |
| Otros LoRA de la comunidad para la familia FLUX | LoRA sobre difusión texto a imagen | No disponible | No disponible | Habitualmente variable según autor | Principalmente Civitai y Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos verificables de rendimiento, licencia ni especificaciones del modelo base en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y ejecutar Flux2-Klein-9B por separado. Sin el modelo base, el fichero safetensors es inutilizable.
- Licencia sin especificar: la model card remite a la licencia del proyecto original o upstream, pero no la concreta. Esto bloquea o compromete cualquier uso comercial hasta que el autor lo aclare por escrito.
- Ausencia total de información sobre datos de entrenamiento: se desconocen los sesgos presentes en el dataset (representación de personas, culturas, estilos) y el posible sobreajuste a un estilo o dominio concreto.
- Sin benchmarks ni ejemplos publicados: no hay forma de verificar la mejora de textura que anuncia el nombre del fichero ni de compararla con el modelo base sin el LoRA.
- Riesgo de artefactos inherente a los modelos de difusión (anatomías incorrectas, texto ilegible en la imagen, incoherencias en escenas complejas); no hay validación publicada que lo mitigue.
- Idiomas de prompt no declarados: la descripción y los enlaces están en chino e inglés, y no se especifica si el modelo base rinde igual con prompts en castellano.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y riesgo de que el contenido cambie o se retire sin aviso.
- Nombre de fichero con caracteres chinos: puede provocar problemas de codificación o de rutas en determinados sistemas operativos y herramientas de línea de comandos.
- Trazabilidad limitada: se desconoce la versión exacta del modelo base con la que se entrenó el LoRA, lo que puede provocar diferencias de comportamiento al combinarlo con otras revisiones de Flux2-Klein-9B.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-flux2klein-14.0-14.0-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2023744422382411777
- Página del autor (@Li鱼): https://www.runninghub.cn/user-center/1861364520106020865
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
