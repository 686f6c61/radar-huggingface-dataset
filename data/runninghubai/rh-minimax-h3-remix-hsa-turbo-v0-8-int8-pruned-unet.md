# RunningHubAI/rh-minimax-h3-remix-hsa-turbo-v0.8-int8-pruned-unet

## Resumen

`rh-minimax-h3-remix-hsa-turbo-v0.8-int8-pruned-unet` es un fichero de pesos UNET para generación de vídeo a partir de texto (text-to-video), publicado en Hugging Face por RunningHubAI en nombre del autor RunningHub `@FX-小肥猴`. No se trata de un modelo completo, sino de un componente destinado a cargarse en un workflow de ComfyUI: el repositorio contiene un único `safetensors` de 22.203 MiB (≈21,68 GiB) y el repositorio ocupa 23,3 GB.

El modelo es una versión podada y cuantizada a INT8 de MiniMax H3 Remix HSA turbo v0.8, que a su vez es un fine-tuning de `minimax-h3`. Según la model card, la poda y la cuantización buscan un despliegue más ligero y una mayor eficiencia de generación, manteniendo el objetivo del modelo original: mejorar el rendimiento visual de MiniMax H3 en vídeos de alto dinamismo generados con pocos pasos de muestreo (artes marciales, persecuciones, explosiones y movimientos de cámara rápidos).

Su relevancia es práctica: ofrece una variante de menor coste computacional para pipelines de creación de contenido dinámico en ComfyUI, pensada para combinarse con el workflow de segundo muestreo "Remix Easy H3". El autor indica explícitamente que esta versión no contiene contenido NSFW. No se publican parámetros totales, datos de entrenamiento ni evaluaciones comparativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video; el detalle interno de la arquitectura no está documentado en la model card |
| Parametros totales | no disponible (solo se conoce el tamaño del fichero de pesos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; no se especifican resolución, número de frames ni duración máxima del clip |
| Tipos de cuantizacion | INT8, con poda del modelo; no se documentan otros formatos (FP16, FP8, GGUF) |
| Idiomas soportados | no disponible (no se documenta el idioma de los prompts) |
| Licencia | no disponible; publicado por RunningHub en nombre del autor, el copyright permanece en el autor y se remite a la licencia del proyecto original/upstream |
| Formato de pesos | safetensors (fichero único `FeiHou_MiniMax-H3_Remix_HSA_turbo_v0.8_int8_convrotHQ_pruned.safetensors`, 22.203 MiB) |
| Pipeline | text-to-video |
| Plataformas de ejecución | ComfyUI, RunningHub, Hugging Face |
| Modelo base | `minimax-h3` (fine-tuning: MiniMax H3 Remix HSA turbo v0.8) |
| Workflow recomendado | Remix Easy H3, segundo muestreo (*second sampling*) |
| Contenido NSFW | excluido según el autor |
| Tamaño del repositorio | 23,3 GB |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un UNET de difusión para text-to-video derivado de MiniMax H3 Remix HSA turbo v0.8, obtenido mediante poda (*pruning*) y cuantización INT8 de los pesos. La cadena de ascendencia declarada es: `minimax-h3` → MiniMax H3 Remix HSA turbo v0.8 → esta versión podada y cuantizada. El sufijo "turbo" y la referencia de la model card a la generación "con pocos pasos" (*low steps*) indican un ajuste orientado a muestreo acelerado, aunque no se documenta la técnica concreta empleada (destilación, scheduler específico, etc.).

No hay información sobre el número de tokens o clips de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los detalles del proceso de poda (criterio de importancia, porcentaje de canales o bloques eliminados). Tampoco se explica el significado de los tokens `HSA` o `convrotHQ` presentes en el nombre del fichero. La innovación destacable, según el autor, es la mejora del rendimiento visual en vídeos de alto dinamismo con pocos pasos de muestreo, junto con la reducción de peso para despliegue ligero; no se aportan métricas que cuantifiquen esa mejora.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) dentro de un pipeline de difusión cargado en ComfyUI.
- Generación con pocos pasos de muestreo, orientada a reducir el coste de inferencia.
- Rendimiento optimizado en escenas de alto dinamismo: artes marciales, persecuciones, explosiones y movimientos de cámara rápidos.
- Integración con el workflow de segundo muestreo "Remix Easy H3", recomendado por el autor para obtener los mejores resultados.
- Despliegue ligero gracias a la poda y a la cuantización INT8 (aproximadamente 21,68 GiB de pesos).
- Ejecución en tres entornos: local con ComfyUI, plataforma RunningHub y descarga desde Hugging Face.
- Restricción declarada: la versión no incluye contenido NSFW.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio, visión como entrada ni comprensión multilingüe de prompts; se trata de un componente de generación de vídeo, no de un modelo de lenguaje.

## Casos de uso

- Previsualización de escenas de acción: generar clips de artes marciales o persecuciones con pocos pasos de muestreo para validar coreografía, encuadre y ritmo antes de pasar a producción final, aprovechando el ajuste específico del modelo para alto dinamismo.
- Previz de VFX: producir versiones preliminares de planos con explosiones o destrucción para discutir con el equipo de efectos antes de invertir en renderizado de alta calidad.
- Storyboard animado en publicidad: iterar variantes de un anuncio con movimiento de cámara rápido dentro de ComfyUI, usando el segundo muestreo de Remix Easy H3 para refinar el clip seleccionado.
- Generación de clips para redes sociales en lote: integrar el UNET en un grafo de ComfyUI automatizado (o en la API de RunningHub) para producir múltiples clips cortos de contenido dinámico por lotes.
- Pruebas de consistencia temporal: evaluar cómo se comporta el modelo en travellings rápidos y movimientos de cámara complejos, un caso históricamente problemático en modelos de vídeo, para decidir qué planos requieren postprocesado.
- Refinado en segunda pasada: usar el modelo como etapa de muestreo secundario sobre un clip base generado con otro checkpoint, tal y como recomienda el autor, para recuperar detalle y estabilidad en el movimiento.
- Despliegue en infraestructura con VRAM limitada: al estar podado y en INT8, permite plantear inferencia local con descarga de bloques en GPUs de 24 GB, o servir el modelo en la plataforma RunningHub cuando no se dispone de hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, VBench, CLIP score, evaluaciones humanas) ni comparaciones con el modelo del que deriva, por lo que no es posible verificar la pérdida de calidad introducida por la poda y la cuantización INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 22.203 MiB (≈21,68 GiB), por lo que la carga completa de los pesos ya supera los 24 GB habituales de una GPU de consumo una vez añadidos activaciones, VAE y buffers del pipeline. No se dispone de medición oficial de VRAM pico.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, RTX A6000 48 GB o L40S 48 GB para mantener los pesos residentes en memoria sin offloading.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutarlo únicamente con descarga de bloques a RAM/VRAM (*lowvram*, *novram* o model offloading de ComfyUI), con la penalización de latencia correspondiente; no hay cifras publicadas de rendimiento en ese escenario.
- Opciones de despliegue: ComfyUI (entorno nativo del modelo), plataforma RunningHub (ejecución online y API), y carga directa del `safetensors` en nodos de ComfyUI. vLLM, TGI, llama.cpp u Ollama no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del número de pasos, resolución, número de frames, GPU y del workflow de segundo muestreo empleado, parámetros que la model card no concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización / poda | Tamaño de pesos | Enfoque | Licencia |
|---|---|---|---|---|---|
| Este modelo (rh-minimax-h3-remix-hsa-turbo-v0.8-int8-pruned-unet) | UNET text-to-video | INT8 + poda | 21,68 GiB | Despliegue ligero y alto dinamismo con pocos pasos | no disponible |
| MiniMax H3 Remix HSA turbo v0.8 (upstream directo) | UNET text-to-video | no disponible | no disponible (versión sin podar) | Alto dinamismo con pocos pasos | no disponible |
| minimax-h3 (modelo base) | Modelo text-to-video | no disponible | no disponible | Generación de vídeo general | no disponible |
| Otros UNET de vídeo para ComfyUI (familias Wan, HunyuanVideo, CogVideoX, entre otras) | UNET / DiT text-to-video | no disponible en esta ficha | no disponible en esta ficha | Generación de vídeo open source | varía según modelo |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría; la comparación anterior es únicamente genealógica y de formato de distribución.

## Limitaciones y advertencias

- Licencia no declarada explícitamente: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream, pero no identifica una licencia concreta. Antes de un uso comercial es imprescindible verificar los términos de MiniMax H3 y las condiciones de RunningHub.
- Ausencia de documentación técnica: no se publican parámetros, dataset, proceso de poda, número de pasos recomendado ni configuración de muestreo, lo que dificulta la reproducibilidad y la auditoría del modelo.
- Sin métricas de evaluación: no hay evidencia pública de la pérdida de calidad provocada por la poda y la cuantización INT8 respecto al modelo sin podar.
- Especialización en alto dinamismo: el ajuste está orientado a escenas de movimiento rápido; no se documenta su comportamiento en escenas estáticas, primeros planos con detalle fino o planos con diálogo.
- Riesgo de artefactos en movimiento: en modelos de vídeo es habitual la aparición de deformaciones anatómicas, parpadeos de textura e inconsistencias temporales en movimientos muy rápidos; el autor no aporta garantías ni ejemplos comparativos al respecto.
- Dependencia de un workflow concreto: los resultados óptimos requieren el workflow "Remix Easy H3" con segundo muestreo, por lo que el comportamiento fuera de ese pipeline puede degradarse.
- No es un modelo autónomo: requiere ComfyUI (o la plataforma RunningHub), un VAE, un codificador de texto y el resto de componentes del grafo, cuyas versiones no se especifican.
- Idiomas: no se documenta qué idiomas acepta el codificador de texto asociado ni la calidad de los prompts en castellano.
- Restricción de contenido: el autor declara que la versión no contiene NSFW; no se detalla si existe filtrado adicional en la plataforma.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Sin soporte de audio ni de entrada multimodal (imagen o vídeo de referencia) documentado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-remix-hsa-turbo-v0.8-int8-pruned-unet
- README en chino: https://huggingface.co/RunningHubAI/rh-minimax-h3-remix-hsa-turbo-v0.8-int8-pruned-unet/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2106964582668779522
- Página del autor: https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (ejemplo Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
