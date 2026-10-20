# RunningHubAI/rh-moss-image-base-int8-convrot.safetensors-unet

## Resumen

`rh-moss-image-base-int8-convrot.safetensors-unet` es un fichero de pesos UNET para pipelines de generación de vídeo a partir de texto (etiqueta `text-to-video` en HuggingFace), distribuido por RunningHubAI a través de su cuenta de HuggingFace. El repositorio no contiene el modelo completo, sino un único fichero `moss_image_base_int8_convrot.safetensors` de 5163 MiB (~5,4 GB) etiquetado como `unet` y orientado a su carga en ComfyUI o en la plataforma RunningHub.

El nombre del fichero indica una cuantización a 8 bits (`int8`) y un sufijo `convrot` que sugiere la aplicación de alguna transformación de rotación previa a la cuantización, aunque el autor no documenta el método. El modelo del que deriva, identificado en el nombre como `moss_image_base`, no se describe en la model card: no se detallan arquitectura, número de parámetros, datos de entrenamiento ni resultados de evaluación.

Su relevancia es práctica más que científica: se trata de un artefacto de despliegue que reduce el peso del UNET para ejecutar generación de vídeo en entornos con VRAM limitada dentro del ecosistema ComfyUI. No hay descargas ni valoraciones registradas (0 descargas, 0 likes) y la licencia no está declarada, lo que limita seriamente su uso en producción sin aclaraciones previas del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video (según `pipeline_tag`); detalles de arquitectura no disponibles |
| Parametros totales | no disponible (no se deduce del tamaño del fichero) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica una ventana de contexto de texto) |
| Tipos de cuantizacion | int8, según el nombre del fichero; el sufijo `convrot` apunta a una rotación aplicada antes de cuantizar, método no documentado |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`moss_image_base_int8_convrot.safetensors`, UNET standalone para ComfyUI) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un UNET de difusión para generación de vídeo, empaquetado como pesos independientes para su uso en ComfyUI. No se especifican el número de parámetros, el tipo de backbone (atención completa, atención lineal o híbrida), el número de bloques, el espacio latente ni el codificador de texto asociado. El autor indica únicamente "Finetuned from: Other", sin identificar el modelo base ni el proceso de ajuste.

Tampoco hay datos sobre el entrenamiento: ni volumen de tokens o pares texto-vídeo, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La única innovación técnica detectable es la propia cuantización: el fichero ocupa 5163 MiB en int8, un tamaño coherente con un original en fp16 de aproximadamente 10 GB (estimación por la relación 2:1 típica de la cuantización a 8 bits, no confirmada por el autor). El sufijo `convrot` podría implicar la necesidad de nodos o código compatibles en ComfyUI para deshacer la rotación durante la inferencia; este punto no está documentado y conviene verificarlo antes de desplegar.

## Capacidades

- Generación de vídeo condicionada por texto, de acuerdo con la etiqueta `pipeline_tag: text-to-video` del repositorio.
- Carga como UNET independiente en flujos de ComfyUI, combinable con el codificador de texto, el VAE y el scheduler que requiera el pipeline original.
- Ejecución en la plataforma en la nube RunningHub, que el autor señala como vía de uso alternativa a la local.
- Huella de memoria reducida respecto a un UNET en fp16, al estar cuantizado a 8 bits.
- No hay evidencia de soporte de tool calling ni de function calling: no aplica a un modelo de difusión.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No hay información sobre capacidades multilingües ni sobre cobertura de idiomas en los prompts.
- No se documentan capacidades de visión, audio ni control fino (pose, profundidad, máscaras) más allá del condicionamiento textual.

## Casos de uso

- Generación de clips cortos en ComfyUI: el UNET se carga como nodo de modelo dentro de un grafo de difusión vídeo-texto, lo que permite producir secuencias a partir de prompts sin salir del entorno ComfyUI.
- Prototipado rápido de ideas audiovisuales: al ocupar ~5,2 GB, el fichero se puede iterar en estaciones de trabajo modestas para validar estilos y composiciones antes de escalar a un modelo mayor.
- Previsualización de storyboards: generación de planos de referencia para equipos de producción antes del rodaje, sustituyendo bocetos manuales por clips de baja duración.
- Creación de B-roll para vídeo editorial: clips de recurso generados por texto que se insertan en montajes de vídeo corto, siempre que la licencia se aclare para uso comercial.
- Investigación sobre cuantización: el artefacto sirve para medir la degradación de calidad de un UNET de vídeo tras cuantizar a int8 con rotación, comparándolo con el original en fp16 si se dispone de él.
- Despliegue en GPUs de consumo: al reducir el peso del UNET, permite montar un pipeline de text-to-video en tarjetas de 12-16 GB de VRAM, algo inviable con el modelo sin cuantizar en muchos casos.
- Automatización por API en RunningHub: el autor ofrece endpoints de API para invocar el modelo en la nube, lo que permite integrarlo en un backend de generación bajo demanda sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (FVD, CLIP score, VBench), ni comparaciones con el modelo original en fp16, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para el UNET: en torno a 6-8 GB solo para los pesos y activaciones del UNET a resoluciones y duraciones moderadas (estimación a partir de los 5163 MiB del fichero, no confirmada por el autor).
- VRAM del pipeline completo: hay que sumar codificador de texto y VAE; un rango realista se sitúa entre 12 y 24 GB según resolución, número de fotogramas y precisión del resto de componentes (estimación, no dato oficial).
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090, siempre que el resto del pipeline se ajuste a la VRAM restante.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S son adecuadas para lotes grandes o resoluciones altas, aunque el modelo no está pensado para escalado masivo.
- Opciones de despliegue: ComfyUI (vía principal indicada por las etiquetas), plataforma RunningHub y su API. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que no aplican a un UNET de difusión. La compatibilidad con Diffusers no está confirmada.
- Latencia y throughput: no disponibles. Al ser un modelo de difusión de vídeo, el coste crece de forma aproximadamente lineal con el número de fotogramas y cuadrática con la resolución espacial, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información verificable sobre el modelo base `moss image base` ni sobre alternativas equivalentes con las que compararlo en parámetros, contexto o rendimiento. Los datos de la model card no permiten establecer una comparación rigurosa.

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-moss-image-base-int8-convrot (este) | no disponible | no disponible | no disponible | HuggingFace (0 descargas) y RunningHub |
| Alternativas de text-to-video de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, que no se identifica. No se debe usar en producción comercial sin aclaración expresa del autor.
- Procedencia opaca: "Finetuned from: Other" no identifica el modelo base, lo que impide evaluar los términos de la licencia heredada y los sesgos del entrenamiento original.
- Sin evaluación publicada: no hay benchmarks ni comparación con el modelo en fp16, por lo que se desconoce la pérdida de calidad introducida por la cuantización int8 y la transformación `convrot`.
- Riesgo de incompatibilidad: el sufijo `convrot` sugiere un proceso de cuantización con rotación que puede requerir nodos o versiones concretas de ComfyUI; sin esa pieza, los pesos podrían cargar pero producir resultados incorrectos.
- Sesgos: no disponibles. Al no documentarse el dataset de entrenamiento, no se puede caracterizar el sesgo demográfico, cultural o de representación.
- Alucinación visual: como todo modelo generativo de vídeo, puede producir movimiento incoherente, deformaciones anatómicas, texto ilegible y artefactos temporales entre fotogramas; no hay métricas publicadas que cuantifiquen la tasa.
- Idiomas: no se declara cobertura lingüística de los prompts; el rendimiento en castellano es desconocido.
- Señal de madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar el artefacto.
- Moderación de contenido: no se documentan filtros de seguridad ni políticas de uso aceptable, un punto crítico en generación de vídeo.
- Fechas del repositorio: creación y actualización el 2026-10-19, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-moss-image-base-int8-convrot.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2111391872714301441
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-moss-image-base-int8-convrot.safetensors-unet/blob/main/README_cn.md
- Canal de Telegram citado por el autor: https://t.me/yesocoai
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo; los resultados devueltos corresponden a servicios de previsión meteorológica y no guardan relación con este artefacto.
