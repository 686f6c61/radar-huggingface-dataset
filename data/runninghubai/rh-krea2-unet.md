# RunningHubAI/rh-krea2-unet

## Resumen

`rh-krea2-unet` es un fichero de pesos en formato safetensors publicado por la cuenta RunningHubAI en Hugging Face. Se trata de un UNET de difusión orientado a tareas de edición de imagen guiada por texto (pipeline `image-text-to-image`), pensado para cargarse en ComfyUI o ejecutarse a través de la plataforma cloud RunningHub. El autor del ajuste figura como `@kucha` dentro de RunningHub, y la model card indica que deriva de un modelo base denominado "krea2".

El repositorio ocupa 13,1 GB y contiene un único fichero de pesos, `KC-K2-光影人生.safetensors`, de 12 533 MiB, que corresponden solo al UNET: no se incluyen el codificador de texto ni el VAE, por lo que el modelo no es autosuficiente y necesita el pipeline base completo para funcionar. La model card ofrece únicamente parámetros de inferencia recomendados (CFG 6,5, entre 25 y 30 pasos, muestreador Euler y resolución 680x1024), sin documentar arquitectura, datos de entrenamiento, número de parámetros ni licencia concreta.

Su relevancia es acotada pero práctica: se trata de un ajuste fino de estética fotográfica distribuido como "drop-in" para ComfyUI, lo que permite a estudios y creadores incorporarlo a flujos de edición de imagen sin entrenar. Ahora bien, la ausencia de información técnica verificable, de licencia explícita y de benchmarks lo convierte en un artefacto que debe evaluarse empíricamente antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para edición de imagen (image edit). No se especifica la arquitectura interna (tipo MMDiT/transformer híbrido o UNET convolucional) |
| Parámetros totales | No disponible (el fichero de pesos ocupa 12 533 MiB) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No aplica en el sentido de modelos de lenguaje; el control se realiza mediante resolución (680x1024 recomendada), pasos de muestreo y CFG |
| Tipos de cuantización | No disponible. El autor solo distribuye safetensors; no documenta variantes fp8/GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponible. El texto se procesa con el codificador de texto del pipeline base, no incluido en este repositorio |
| Licencia | No disponible. La model card indica que RunningHub publica en nombre del autor, que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`KC-K2-光影人生.safetensors`) |
| Tipo de modelo declarado | UNET (image edit) |
| Modelo base | "krea2" (según la model card; no se detalla versión ni procedencia exacta) |
| Pipeline declarado | `image-text-to-image` |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 13,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 27 de septiembre de 2026 (creación y última actualización, según metadatos) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna del modelo. La model card lo clasifica como "UNET (image edit)" y etiqueta el repositorio con `comfyui` y `unet`, lo que en la práctica de ComfyUI suele corresponder a un bloque de denoising desacoplado del codificador de texto y del VAE, cargado mediante un nodo de tipo `UNETLoader` y combinado con un encoder de texto y un VAE suministrados por separado. No se indica si internamente se trata de un UNET convolucional clásico o de una arquitectura híbrida con atención tipo transformer, ni el número de bloques, canales o dimensiones de atención.

Tampoco hay datos sobre el entrenamiento: no se especifica el número de tokens o pares imagen-texto utilizados, la composición del dataset, la resolución de entrenamiento, ni si se emplearon técnicas de alineación como RLHF, DPO o ajuste por preferencia estética. Lo único verificable es que el modelo se presenta como un ajuste fino ("finetuned from: krea2") y que el nombre del fichero (`光影人生`, "luz y sombra / vida") sugiere una especialización estética en iluminación y contraste fotográfico, aunque esto es una inferencia a partir del nombre y no un dato documentado. Los únicos parámetros técnicos aportados por el autor son de inferencia: CFG 6,5, 25-30 pasos, muestreador Euler y resolución recomendada de 680x1024.

## Capacidades

- Generación de imagen condicionada por texto en el pipeline `image-text-to-image`, siempre que se combine este UNET con el codificador de texto y el VAE del modelo base correspondiente.
- Edición de imagen: el autor clasifica el modelo como "UNET (image edit)", por lo que está orientado a modificar imágenes existentes en lugar de solo generarlas desde cero.
- Especialización estética aparente en tratamiento de luz y sombra, deducida del nombre del fichero de pesos, no confirmada por documentación.
- Integración nativa en ComfyUI como bloque de denoising sustituible dentro de un grafo existente.
- Ejecución en la nube mediante la API de RunningHub, además de ejecución local.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada para descripción, audio ni modo "thinking": son capacidades no aplicables o no documentadas en un modelo de difusión de imagen.
- Capacidades multilingües: no disponibles; dependen del codificador de texto del pipeline base, que no se documenta aquí.

## Casos de uso

- Retoque fotográfico con control de iluminación: dado que el ajuste parece orientado a luz y sombra (según el nombre del fichero), se usaría en ComfyUI con CFG 6,5, 25-30 pasos y resolución 680x1024 para reiluminar o corregir el contraste de retratos en flujo de posproducción, sustituyendo el UNET base en un grafo ya validado.
- Edición de imagen guiada por prompt en estudios de diseño: el modelo puede insertarse en grafos de edición para modificar composiciones existentes sin rehacer el pipeline completo, manteniendo el resto de nodos (encoder de texto, VAE, control de resolución) del proyecto original.
- Generación de creatividades verticales para redes: la resolución recomendada de 680x1024 encaja con formatos verticales tipo póster o story, de modo que el modelo sirve para producir variantes de una campaña a partir de una misma semilla y prompt.
- Prototipado rápido de conceptos visuales: al cargarse como UNET en ComfyUI, permite iterar prompts y semillas sobre GPU local sin depender de servicios externos, útil para explorar direcciones de arte antes de fijar una producción.
- Automatización por API en un SaaS de imagen: el fabricante ofrece una API de RunningHub, de modo que el modelo puede invocarse por HTTP para generar o editar imágenes bajo demanda sin que el cliente despliegue infraestructura propia.
- Procesado por lotes en producción interna: con un nodo de carga de UNET y una cola de trabajos en ComfyUI, se pueden ejecutar ediciones masivas (por ejemplo, normalizar iluminación de un catálogo de producto) siempre que se valide la calidad caso por caso.
- Fine-tuning posterior o mezcla de pesos: al distribuirse como safetensors estándar, el fichero puede emplearse como punto de partida para ajustes adicionales (LoRA, merges) dentro del ecosistema ComfyUI, aunque el autor no documenta compatibilidad ni recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM, comparativas humanas ni evaluaciones de prompt adherence para edición de imagen), y tampoco se aportan cifras de latencia o throughput medidas.

## Requisitos de hardware

- El fichero de pesos del UNET ocupa 12 533 MiB (aproximadamente 12,2 GiB). Solo cargar el UNET en memoria consume ese espacio, antes de sumar el codificador de texto, el VAE, los latentes y las activaciones.
- Estimación orientativa de VRAM: en torno a 13-16 GB para el UNET en su precisión nativa más sobrecarga del pipeline; con cuantización a 8 bits el UNET bajaría a aproximadamente 6-7 GB, aunque el autor no distribuye variantes cuantizadas.
- GPU recomendadas: tarjetas de 24 GB o más (RTX 4090, RTX 3090, L40S, A100 40/80 GB, H100) para trabajar con holgura en precisión nativa. En GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) sería necesario cuantizar u optimizar con descarga a memoria del sistema.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) sin cuantización, presumiblemente; en tarjetas de 12 GB requiere cuantización o `--lowvram` en ComfyUI. Estas cifras son estimaciones derivadas del tamaño del fichero, no medidas publicadas por el autor.
- Opciones de despliegue: ComfyUI (flujo principal, con `UNETLoader`), plataforma cloud RunningHub y su API HTTP, y Hugging Face como almacenamiento de pesos. No es compatible con motores de inferencia de modelos de lenguaje como vLLM, TGI o llama.cpp, ni es un GGUF.
- Latencia y throughput: no disponibles. El autor solo indica entre 25 y 30 pasos de muestreo con muestreador Euler, lo que fija el coste relativo de cada generación, pero no publica tiempos por imagen ni imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa cuantitativa. La model card no identifica la versión exacta del modelo base "krea2", no publica número de parámetros ni métricas, y la licencia es indeterminada, de modo que cualquier tabla con cifras sería especulativa.

| Aspecto | rh-krea2-unet | Alternativas comparables |
|---|---|---|
| Categoría | UNET de edición de imagen para ComfyUI | Otros UNET de edición distribuidos en safetensors para ComfyUI (no se dispone de datos concretos de los señalados en la búsqueda) |
| Parámetros | No disponible | No disponible |
| Contexto / resolución | 680x1024 recomendada por el autor | No disponible |
| Licencia | No disponible (derechos del autor, remite al upstream) | Variable según proyecto |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub (cloud y API) | Variable |

## Limitaciones y advertencias

- Licencia indeterminada: la model card no especifica una licencia concreta y remite a la del proyecto original, que tampoco se nombra. No se puede confirmar que el uso comercial esté permitido; conviene aclararlo con el autor antes de desplegarlo en producción.
- Modelo incompleto por sí mismo: solo contiene el UNET. Requiere el codificador de texto y el VAE del modelo base, lo que introduce una dependencia adicional cuya licencia y disponibilidad no se documentan.
- Procedencia opaca: el modelo base se cita únicamente como "krea2", sin versión, commit, enlace a pesos ni autoría original, lo que dificulta la trazabilidad y la reproducibilidad.
- Sin benchmarks ni evaluaciones: no hay métricas objetivas de calidad, fidelidad al prompt, consistencia o preservación de la identidad en tareas de edición.
- Riesgo de artefactos y alucinación visual: como todo modelo de difusión, puede generar detalles plausibles pero inexistentes, deformaciones anatómicas, texto ilegible o inconsistencias entre iteraciones; no hay validación publicada que acote estos fallos.
- Sesgos: no se documenta la composición del dataset de ajuste, por lo que no es posible evaluar sesgos demográficos, culturales o estéticos. El nombre del fichero sugiere un sesgo estético deliberado hacia iluminación concreta, lo que puede reducir la variedad de resultados.
- Resolución y parámetros rígidos: el autor recomienda 680x1024 con CFG 6,5, 25-30 pasos y muestreador Euler. Salirse de ese rango puede degradar el resultado, y no se documenta el comportamiento en otras relaciones de aspecto.
- Adopción nula en el momento del análisis: 0 descargas y 0 "likes", sin issues ni discusiones públicas. No hay evidencia de la comunidad sobre su funcionamiento real ni comparaciones independientes.
- Idiomas no especificados: al depender del codificador de texto del pipeline base, el rendimiento con prompts en castellano no está garantizado ni documentado.
- Fecha de publicación en 2026 según los metadatos: si esa marca temporal es correcta, el modelo es muy reciente y no ha pasado por un ciclo de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-unet
- Página original del modelo en RunningHub: https://www.runninghub.ai/model/public/2103771475639930881
- Página del autor en RunningHub (@kucha): https://www.runninghub.ai/user-center/1948510508262531073
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Endpoint de API para llamadas: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
