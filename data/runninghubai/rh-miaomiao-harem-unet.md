# RunningHubAI/rh-miaomiao-harem-unet

## Resumen

rh-miaomiao-harem-unet es un checkpoint de pesos de tipo UNET para generación de vídeo a partir de texto, publicado en Hugging Face por RunningHub (RunningHubAI) en nombre del autor identificado en su plataforma como @百迟. Se presenta como un ajuste fino del modelo base "anima" y se distribuye como un único archivo safetensors de 3988 MiB dentro de un repositorio de 4,2 GB. Está pensado para cargarse en ComfyUI, en la plataforma RunningHub o desde el propio Hub.

No es un modelo de lenguaje: no procesa instrucciones conversacionales ni genera texto. Su función es producir secuencias de vídeo condicionadas por un prompt textual dentro de un grafo de ComfyUI, lo que lo sitúa en la categoría de los modelos de difusión para vídeo empaquetados como UNET independiente.

Su relevancia práctica es limitada y difícil de evaluar: la model card no documenta parámetros, dataset de entrenamiento, licencia ni duración de contexto, y en el momento de la extracción de datos el repositorio acumulaba 0 descargas y 0 "likes". Debe entenderse como una pieza para un flujo de trabajo concreto (ComfyUI/RunningHub) más que como un modelo de referencia con prestaciones verificadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET para generación de vídeo texto-a-vídeo (etiquetas del autor: `comfyui`, `unet`, `text-to-video`); no se especifica si es 3D UNET, DiT o híbrida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (no se documentan resolución, número de fotogramas ni duración de los clips) |
| Tipos de cuantizacion | no disponible; solo se publica un checkpoint en safetensors (~3988 MiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright pertenece al autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`miaomiaoHarem_anima14.safetensors`) |
| Tamaño del repositorio | 4,2 GB |
| Pipeline declarado | text-to-video |
| Plataformas previstas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion / actualizacion | 2026-10-09 / 2026-10-09 (según metadatos del Hub) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `unet` y la declaración de que el modelo es un ajuste fino de "anima". No se detalla si se trata de una UNET 3D, de un transformer de difusión (DiT) o de una arquitectura híbrida, ni se especifican el número de bloques, los canales, el compresor latente (VAE) asociado ni el codificador de texto que debe acompañarlo. El nombre del archivo incluye el sufijo `anima14`, presumiblemente referido a la revisión del modelo base, pero esto no se confirma en la documentación.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de datos, la composición del dataset, si hubo ajuste por preferencias (RLHF/DPO) ni qué técnicas de regularización o de destilación se aplicaron. La model card únicamente menciona que el modelo se puede entrenar en RunningHub y que el peso publicado es el resultado de un ajuste sobre "anima". Cualquier afirmación sobre tokens de entrenamiento, resolución nativa o número de pasos de inferencia recomendados sería especulativa.

## Capacidades

- Generación de vídeo a partir de texto: es la única capacidad declarada explícitamente por el autor (etiqueta `text-to-video`).
- Integración en ComfyUI: el checkpoint está pensado para insertarse como nodo UNET en un grafo de generación de vídeo.
- Ejecución en la nube vía RunningHub: el modelo puede cargarse en esa plataforma y consumirse a través de su API.
- Ajuste de estilo: al ser un finetune, se le supone una especialización estética o de personajes respecto a "anima", aunque la model card no documenta ni describe ese estilo.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles (no se documenta el codificador de texto ni los idiomas de los prompts).
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Previsualización de storyboards: generar clips cortos a partir de descripciones textuales para validar encuadres, ritmo y dirección de arte antes de rodar o renderizar en alta calidad.
- Producción de vídeo vertical para redes sociales: crear fragmentos de pocos segundos encadenando prompts dentro de un flujo de ComfyUI, reutilizando el mismo grafo para lotes de variaciones.
- Animática publicitaria: producir versiones preliminares de un anuncio con distinto estilo visual para presentarlas a cliente sin coste de producción 3D.
- Generación de B-roll para edición: obtener planos de recurso que cubran huecos en una línea de tiempo, integrándolos después en el editor junto al metraje principal.
- Prototipado de escenas para videojuegos o animación: explorar paletas, iluminación y composición de un entorno antes de encargar el asset definitivo.
- Automatización por API: desplegar el modelo en RunningHub y encadenar llamadas desde un backend para producir vídeo bajo demanda sin mantener GPU propia.
- Experimentación con LoRAs y estilos: usar este UNET como base sobre la que aplicar adaptadores de estilo o de personaje en ComfyUI.
- Generación de material para pruebas de pipelines de posprocesado: alimentar herramientas de interpolación, escalado o restauración con clips sintéticos reproducibles.

En todos los casos, la idoneidad concreta no puede verificarse: no hay ejemplos, métricas ni demos publicadas por el autor, y la licencia es indeterminada, lo que condiciona cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de vídeo (FVD, CLIPScore, VBench ni similares), ni comparaciones cuantitativas con otros modelos, ni ejemplos de prompts y salidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el checkpoint ocupa 3988 MiB en safetensors (previsiblemente FP16/BF16, lo que sugeriría del orden de 2.000 millones de parámetros), a lo que hay que sumar el VAE, el codificador de texto y las activaciones latentes del vídeo. Una estimación prudente sitúa el mínimo práctico en 12-16 GB de VRAM para resoluciones bajas y clips cortos, y 24 GB o más para mayor resolución o número de fotogramas. Esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponibles. Por el rango de memoria implicado, encajarían GPU de 16-24 GB (RTX 4080/4090, A5000, L40S) y, con margen, A100/H100 para lotes o resoluciones mayores.
- Viabilidad en GPU de consumo: probable en tarjetas de 12 GB o más con cuantizaciones o resoluciones reducidas, pero no verificado. No se publican versiones en FP8, GGUF ni otros formatos que faciliten el despliegue en hardware limitado.
- Opciones de despliegue: ComfyUI (entorno de referencia), RunningHub (plataforma del editor, con API) y, en principio, cualquier runtime de difusión que acepte un UNET en safetensors más sus componentes auxiliares. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se documentan pasos de muestreo, tamaño de lote ni tiempos de generación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-miaomiao-harem-unet | UNET text-to-video (finetune de "anima") | no disponible | no disponible | safetensors en Hugging Face + RunningHub |
| Wan 2.1 T2V (Alibaba) | Difusión text-to-video | 14B y 1.3B | Apache 2.0 | Pesos abiertos en Hugging Face, integración en ComfyUI |
| LTX-Video (Lightricks) | Difusión text-to-video | 2B | Licencia propia de pesos abiertos | Pesos abiertos en Hugging Face, integración en ComfyUI |
| HunyuanVideo (Tencent) | Difusión text-to-video | 13B | Licencia comunitaria propia | Pesos abiertos en Hugging Face, integración en ComfyUI |

Nota: los datos de los modelos comparativos proceden de su documentación pública y pueden variar según la versión; no se dispone de cifras de rendimiento comparables para rh-miaomiao-harem-unet, por lo que no se incluye ninguna comparación cuantitativa.

## Limitaciones y advertencias

- Licencia indeterminada: la model card remite a la licencia del proyecto original o del modelo upstream sin especificarla. No hay autorización explícita de uso comercial, lo que constituye un riesgo legal en producción.
- Ausencia total de documentación técnica: sin número de parámetros, resolución nativa, número de fotogramas, pasos de muestreo ni codificador de texto asociado, reproducir la inferencia exige ingeniería inversa o conocimiento previo del modelo base "anima".
- Sin datos de entrenamiento: se desconoce la composición del dataset, por lo que no se pueden evaluar sesgos demográficos, culturales o estéticos, ni el riesgo de reproducción de material protegido.
- Posible contenido no apto para todos los públicos: el nombre del modelo sugiere una especialización estilizada en personajes; no se documentan filtros de seguridad ni limitaciones de contenido, por lo que se recomienda auditar las salidas antes de cualquier publicación.
- Artefactos propios de la difusión de vídeo: incoherencia temporal entre fotogramas, deformaciones anatómicas y deriva de identidad son riesgos habituales de esta familia de modelos; no hay métricas publicadas para descartarlos en este caso concreto.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la extracción, sin issues ni discusiones que permitan contrastar resultados.
- Dependencia de la plataforma: parte del flujo previsto (entrenamiento, API, carga del modelo) pasa por RunningHub, lo que introduce dependencia de un proveedor externo y de sus condiciones de servicio.
- Idiomas e instrucciones: no se documenta el soporte multilingüe de los prompts; conviene asumir compatibilidad limitada con el castellano hasta verificarlo.
- Formato único: solo safetensors, sin variantes cuantizadas que reduzcan los requisitos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-miaomiao-harem-unet
- README en chino: https://huggingface.co/RunningHubAI/rh-miaomiao-harem-unet/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2074506437954465793
- Página del autor: https://www.runninghub.ai/user-center/1975220411615117314
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API: https://www.runninghub.ai/call-api
