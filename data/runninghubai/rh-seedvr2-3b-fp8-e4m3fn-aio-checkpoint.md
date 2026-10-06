# RunningHubAI/rh-seedvr2-3b-fp8-e4m3fn-aio-checkpoint

## Resumen

El repositorio `RunningHubAI/rh-seedvr2-3b-fp8-e4m3fn-aio-checkpoint` contiene un checkpoint en formato safetensors de 3713 MiB (3,9 GB) distribuido por RunningHub a partir de un modelo SeedVR2 de 3.000 millones de parámetros cuantizado en FP8 con formato E4M3FN. La model card lo describe como un "AIO fusion model" (todo en uno) cuyo propósito declarado es "enlarge the official stream", es decir, la ampliación o escalado de imagen y vídeo dentro del ecosistema ComfyUI, donde se carga como checkpoint.

El paquete está pensado para su uso en ComfyUI, en la plataforma en la nube RunningHub y como descarga desde Hugging Face. No se publica información sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens vistos ni los hiperparámetros: la model card se limita a una tabla de identificación y a la lista de archivos. Tampoco se especifica una licencia concreta, sino que se indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream.

Su relevancia práctica es la de ofrecer una versión cuantizada a 8 bits de un modelo de 3B del que no existe ficha técnica pública en este repositorio: el archivo de 3,9 GB es aproximadamente la mitad de lo que ocuparían los mismos pesos en FP16/BF16 (unos 6-7 GB), lo que reduce el umbral de VRAM necesario para ejecutarlo en GPU de consumo. La ausencia de documentación técnica obliga a tratar cualquier detalle adicional como no verificado.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica "Model Type: Checkpoint") |
| Parámetros totales | 3B según el nombre del modelo; no confirmado en la documentación |
| Parámetros activos | no aplica / no consta que sea un modelo MoE |
| Longitud de contexto | no aplica (modelo de imagen/vídeo, no es un modelo de lenguaje) |
| Tipos de cuantización | FP8 E4M3FN (único formato publicado) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`seedvr2_3b_fp8_e4m3fn__AIO.safetensors`, 3713 MiB) |
| Tamaño del repositorio | 3,9 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face (según la model card) |
| Autor / distribuidor | Publicado por RunningHub en nombre del autor ([@豹豹喵呜](https://www.runninghub.ai/user-center/2065373775989661698)) |
| Fecha de creación / actualización | 2026-10-06 / 2026-10-06 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna. El nombre del repositorio y la model card permiten únicamente deducir tres cosas: que se trata de un modelo de la familia SeedVR2 con 3.000 millones de parámetros, que los pesos han sido cuantizados a FP8 en el formato E4M3FN (8 bits, 4 de exponente y 3 de mantisa, con rango dinámico amplio y sin bit de signo explícito en el exponente), y que el sufijo "AIO" indica que los componentes del pipeline se han fusionado en un único archivo de checkpoint, lo que simplifica su carga en ComfyUI al evitar tener que encadenar varios ficheros separados.

No se especifica el número de tokens o fotogramas de entrenamiento, la composición del dataset, si hubo fases de ajuste fino con RLHF/DPO ni si el post-entrenamiento fue adversarial. El único metadato de procedencia es "Finetuned from: Other", sin más detalle. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación a pocos pasos, etc.), por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Carga como checkpoint en ComfyUI: el archivo `seedvr2_3b_fp8_e4m3fn__AIO.safetensors` está empaquetado para cargarse directamente en el flujo de trabajo de ComfyUI, sin necesidad de ensamblar componentes por separado.
- Ampliación o escalado de imagen/vídeo: es la única función declarada explícitamente en la model card ("SEEDVR2 enlarges the official stream, AIO fusion model").
- Ejecución cuantizada en FP8 E4M3FN: reduce la huella de memoria de los pesos a 3713 MiB, lo que permite desplegarlo en GPU con menos VRAM que la versión en precisión completa.
- Ejecución en la nube mediante RunningHub: el repositorio enlaza a la plataforma del autor para cargar y ejecutar el modelo sin infraestructura propia.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Capacidades de agente y razonamiento multi-paso: no aplica.
- Capacidades multilingües, visión o audio como tareas declaradas: no disponible.
- Modo "thinking", audio o vídeo generativo: no documentado.

## Casos de uso

- Postproducción de metraje de archivo: escalado de material SD o 720p a HD/4K antes del etalonaje final. El modelo está declarado como herramienta de "enlarge", y el checkpoint FP8 de 3,9 GB permite iterar en estaciones con una sola GPU.
- Mejora de vídeo generado por IA: los pipelines de difusión de vídeo suelen producir salidas a 480p-720p; este checkpoint puede emplearse como paso final de superresolución antes de la entrega al cliente.
- Procesamiento por lotes en ComfyUI: al ser un archivo único "todo en uno", se puede insertar en un grafo de ComfyUI con un nodo de carga de checkpoint y procesar colas de clips sin reconfigurar el pipeline entre ejecuciones.
- Servicio SaaS de restauración vía API: el repositorio apunta a la API de RunningHub, de modo que un producto de restauración de vídeo puede delegar la inferencia en la nube y evitar el coste de GPU propia.
- Preprocesado de datasets de vídeo: escalar y homogeneizar la resolución de clips antes de usarlos para entrenar o evaluar otros modelos de vídeo, reduciendo la varianza de resolución en el corpus.
- Contenido generado por usuarios en redes sociales: subida de un clip de móvil a 1080p o 1440p para publicación, donde el coste por minuto de GPU es el factor limitante y una cuantización FP8 lo reduce.
- Prototipado en GPU de consumo: con 3713 MiB de pesos, un desarrollador puede validar la integración en ComfyUI en una RTX 4070 Ti o superior antes de migrar a un despliegue en A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de PSNR, SSIM, LPIPS ni comparaciones cuantitativas con otros modelos, y el repositorio no enlaza a ningún informe técnico. La búsqueda web asociada a este repositorio devolvió exclusivamente resultados no relacionados con el modelo (contenido musical), por lo que no se ha podido verificar ningún dato externo de rendimiento.

| Benchmark | Resultado |
|---|---|
| PSNR / SSIM / LPIPS | no disponible |
| Comparativa con modelos de superresolución de vídeo | no disponible |
| Throughput o latencia medida | no disponible |

## Requisitos de hardware

- VRAM para los pesos: 3713 MiB (3,63 GiB) en FP8 E4M3FN. Es el mínimo absoluto solo para cargar el checkpoint.
- VRAM real de trabajo: no disponible como dato publicado. El pico depende de la resolución, del número de fotogramas por lote y de los buffers intermedios; en tareas de vídeo suele ser varias veces el tamaño de los pesos.
- Soporte nativo de FP8: las GPU con unidades FP8 (Ada Lovelace: RTX 4090, L4, L40S; Hopper: H100, H200) ejecutan E4M3 sin conversión. En Ampere (A100, RTX 3090) o anterior puede ser necesario de-cuantizar, lo que llevaría los pesos a unos 6-7 GB en FP16/BF16.
- GPU de consumo compatibles: cualquier GPU con 8 GB o más puede albergar los pesos; para vídeo se recomienda partir de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y de 24 GB si se procesan resoluciones altas o secuencias largas.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegues concurrentes.
- Opciones de despliegue: ComfyUI (nativo, según la model card) y la plataforma RunningHub. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y en cualquier caso no aplican porque no es un modelo de lenguaje. El soporte en Diffusers u otros runners no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables para comparar este checkpoint con alternativas de la misma categoría. La tabla recoge únicamente lo que puede afirmarse con la información disponible.

| Modelo | Parámetros | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-seedvr2-3b-fp8-e4m3fn-aio-checkpoint | 3B (según el nombre) | safetensors FP8 E4M3FN, 3,9 GB | no disponible | Hugging Face + RunningHub |
| SeedVR2 3B upstream (proyecto original) | no disponible | no disponible | no disponible | enlazado desde la model card, sin datos técnicos en este repositorio |
| Alternativas de superresolución/restauración de vídeo (Real-ESRGAN, BasicVSR++, STAR, etc.) | no disponible | no disponible | no disponible | no disponible |

Los resultados de la búsqueda web proporcionada no contienen información sobre modelos comparables, por lo que no se ha podido completar esta sección con datos contrastados.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, datos de entrenamiento, licencia ni métricas. Cualquier integración en producción exige una validación empírica previa por parte del equipo que la adopte.
- Licencia no declarada: el texto indica que "los derechos permanecen en el autor" y remite a la licencia del proyecto original, sin identificarla. Esto supone un riesgo legal para uso comercial y para redistribución; conviene contactar con el autor o consultar el proyecto upstream antes de desplegarlo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización separadas por menos de cuatro minutos, lo que sugiere una publicación automatizada sin revisión posterior.
- Ausencia de benchmarks: no hay PSNR, SSIM ni LPIPS publicados, ni comparación con la versión en precisión completa, por lo que no puede cuantificarse la pérdida de calidad atribuible a la cuantización FP8 E4M3FN.
- Degradación por cuantización: FP8 E4M3FN prioriza el rango dinámico sobre la precisión de mantisa (3 bits); en modelos de restauración es habitual observar diferencias en texturas finas y ruido de baja amplitud frente a BF16, aunque no se ha documentado para este checkpoint en concreto.
- Artefactos típicos de tareas de escalado: en superresolución de vídeo son frecuentes los parpadeos temporales y las inconsistencias entre fotogramas en movimiento rápido; no se documenta si la versión "AIO" incorpora algún módulo de estabilización temporal.
- Compatibilidad de nodos: no se especifica la versión de ComfyUI ni los nodos necesarios para cargar este checkpoint FP8; si el nodo espera pesos FP16, la carga puede fallar o requerir un nodo específico.
- Trazabilidad de la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo, de modo que no se ha podido contrastar información con fuentes independientes.
- Ámbito de aplicación: al no ser un modelo de lenguaje, no procede evaluarlo en tool calling, agentes ni capacidades multilingües.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-seedvr2-3b-fp8-e4m3fn-aio-checkpoint
- Model card en chino (referenciada en el README): README_cn.md dentro del mismo repositorio
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079803631943319554
- Página del autor: https://www.runninghub.ai/user-center/2065373775989661698
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Endpoint de API para Seedance 2.5 citado en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
