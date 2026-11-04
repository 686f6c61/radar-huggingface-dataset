# RunningHubAI/rh-minimax-h3-fl2va-pruned-int8-unet

## Resumen

`rh-minimax-h3-fl2va-pruned-int8-unet` es un checkpoint de pesos del componente UNET de un modelo de generación de vídeo a partir de texto (text-to-video), publicado por RunningHubAI en Hugging Face. Se distribuye como un único fichero `MiniMax-H3-int8.safetensors` de aproximadamente 19.999 MiB (unos 19,5 GiB), cuantizado a INT8 y con poda (pruned), lo que reduce el peso del modelo original para su uso en entornos de inferencia con recursos limitados. El modelo se presenta como un ajuste fino (finetuned) del modelo base `minimax-h3`, del que no se detalla autoría original ni condiciones de licencia más allá de una nota genérica.

La relevancia práctica de este repositorio es acotada pero concreta: está pensado para cargarse en ComfyUI o en la plataforma RunningHub, no como modelo autónomo de propósito general. El tag `unet` indica que se trata del componente de difusión (denoising network) de un pipeline mayor, no de un modelo completo con tokenizador, text encoder o VAE incluidos. Por tanto, su uso requiere el resto de piezas del pipeline original de MiniMax-H3 y una integración específica en el grafo de ComfyUI.

La información publicada es escasa: no hay model card técnica con arquitectura, número de parámetros, contexto, idiomas ni benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia no está especificada de forma explícita, remitiendo a la del proyecto original o upstream. Esto limita seriamente cualquier evaluación rigurosa y obliga a tratar el modelo como un artefacto de despliegue más que como un modelo documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video (componente de pipeline MiniMax-H3); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (fichero publicado); se indica además que los pesos están podados (pruned) |
| Idiomas soportados | no disponible |
| Licencia | no disponible explícitamente; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`MiniMax-H3-int8.safetensors`, ~19.999 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente pesos de un UNET de difusión, etiquetado como `unet` y `text-to-video`. No se publica información sobre el número de bloques, la resolución de atención, el tipo de text encoder asociado, el VAE ni el scheduler del pipeline. El nombre del fichero y del repositorio indica una cuantización a INT8 y una poda previa (`pruned`), técnicas habituales para reducir el tamaño y el coste de inferencia de modelos de difusión, a costa de una posible pérdida de calidad que no se cuantifica en la información disponible.

No hay datos sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica únicamente que el modelo es un ajuste fino de `minimax-h3`, sin especificar el volumen de datos de ajuste, el régimen de entrenamiento ni las innovaciones técnicas del pipeline original. Tampoco se documenta si la poda fue estructurada o no estructurada, ni el criterio de selección de pesos eliminados.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según el `pipeline_tag` del repositorio.
- Integración como componente UNET dentro de un grafo de ComfyUI.
- Carga y ejecución en la plataforma RunningHub, que ofrece workflows y API asociados.
- Cuantización INT8 y poda orientadas a reducir requisitos de memoria frente al modelo original.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingües ni idiomas soportados.

## Casos de uso

- Generación de clips de vídeo cortos a partir de descripciones textuales en ComfyUI: el UNET se inserta en un workflow de difusión vídeo-texto y se combina con el text encoder y el VAE del pipeline MiniMax-H3 para producir secuencias; es adecuado por su formato safetensors listo para cargar en ComfyUI.
- Prototipado rápido de pipelines text-to-video en RunningHub: al estar publicado como modelo de la plataforma, permite lanzar pruebas sin montar infraestructura propia, usando la API o los workflows enlazados en la model card.
- Despliegue con restricciones de VRAM: la versión INT8 y podada reduce el peso del UNET a unos 19,5 GiB, lo que facilita su carga en GPUs de gama alta de consumo o profesional frente a una versión en FP16 del modelo original.
- Iteración creativa en estudios pequeños: generación de borradores de vídeo para previsualización de guiones o storyboards, sustituyendo el renderizado manual por generación asistida.
- Integración en herramientas de automatización de contenido: uso del endpoint de RunningHub para encadenar generación de texto a vídeo dentro de flujos de producción de contenido para redes o publicidad.
- Evaluación comparativa de cuantizaciones: el checkpoint sirve para medir la degradación de calidad y la ganancia de rendimiento de INT8 + poda frente al UNET original de MiniMax-H3, siempre que se disponga de ambos y de un conjunto de prompts de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa ~19,5 GiB; a ello hay que sumar activaciones, text encoder, VAE y buffers del pipeline, por lo que se recomienda al menos 24 GB de VRAM y, con margen, 32-48 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue cómodo; RTX 4090 (24 GB) puede ser ajustada y requerir offloading.
- ¿Cabe en GPU de consumo? Potencialmente en RTX 4090 (24 GB) con gestión agresiva de memoria y offloading parcial; en GPUs de 16 GB o menos no es viable sin cuantización adicional o descarga a CPU.
- Opciones de despliegue: ComfyUI (soporte nativo por el tag `unet`), RunningHub (plataforma del autor) y su API; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a UNETs de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-minimax-h3-fl2va-pruned-int8-unet | UNET text-to-video (INT8, podado) | no disponible | no disponible | no disponible (remite a upstream) | Hugging Face, ComfyUI, RunningHub |
| MiniMax-H3 (original) | Pipeline text-to-video | no disponible | no disponible | no disponible | Referenciado como upstream, sin enlace directo en la model card |
| Otros UNETs text-to-video en ComfyUI (p. ej. variantes de Stable Video Diffusion) | UNET de difusión vídeo | variable | no aplica | variable según versión | Hugging Face, ComfyUI |

No se dispone de datos de rendimiento ni de parámetros del modelo original que permitan una comparación cuantitativa fiable. La comparativa se limita a categoría de tarea y formato de distribución.

## Limitaciones y advertencias

- Información técnica mínima: no hay datos de arquitectura, parámetros, dataset ni evaluación, lo que impide validar calidad o comportamiento esperado.
- Licencia no especificada: la model card remite a la del proyecto original o upstream, por lo que el uso comercial no está garantizado sin verificar la licencia de MiniMax-H3.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de consulta, sin evidencia de uso en producción ni de validación por la comunidad.
- Modelo incompleto por sí mismo: al ser solo el UNET, requiere text encoder, VAE y scheduler del pipeline original; un uso incorrecto del grafo puede producir resultados degenerados.
- Cuantización INT8 y poda: pueden introducir degradación de calidad no cuantificada frente al modelo original; no se documenta el método de poda ni la pérdida asociada.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente, artefactos temporales o contenido no solicitado; no se documentan filtros de seguridad.
- Idiomas no documentados: no se puede asegurar el soporte de prompts en castellano ni en otros idiomas distintos del que use el text encoder original.
- Dependencia de plataforma: los workflows y la API enlazados apuntan a RunningHub, lo que puede condicionar la portabilidad del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-fl2va-pruned-int8-unet
- Workflow y aplicación asociados: https://www.runninghub.ai/zh-cn/post/2087813765739065345
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2087778698048135169
- Página del autor: https://www.runninghub.ai/user-center/2065407779816169474
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (ZH): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
