# RunningHubAI/rh-snofs-krea-v1.4-lora

## Resumen

rh-snofs-krea-v1.4-lora es un adaptador LoRA orientado a la edición de imagen guiada por texto (pipeline declarado como image-text-to-image) publicado en Hugging Face por la cuenta RunningHubAI en representación del autor identificado como @Hui.Av. Según la propia model card, el adaptador está afinado a partir de un modelo base denominado "krea2" y se distribuye como un único fichero safetensors de 1490 MiB. Su propósito declarado, indicado en el nombre del fichero y en el texto en chino de la model card ("性、裸照、其他有趣内容", esto es, contenido sexual, desnudos y otros materiales), es la generación y edición de contenido para adultos dentro de flujos de trabajo de ComfyUI.

El modelo no es un modelo fundacional, sino un adaptador de bajo rango (LoRA) que debe cargarse sobre el modelo base indicado; no incluye pesos completos ni tokenizador propios, y su arquitectura efectiva es la del modelo sobre el que se aplique. El repositorio ocupa 1,6 GB, no registra descargas ni valoraciones en el momento de la consulta y no publica licencia explícita, benchmarks, idiomas soportados ni documentación técnica en inglés o castellano.

Su relevancia es acotada y de nicho: se enmarca en el ecosistema de LoRAs de edición de imagen distribuidas a través de plataformas como RunningHub y consumidas desde ComfyUI. La ausencia de ficha técnica, de licencia clara y de cualquier métrica de calidad objetiva hace que deba tratarse como un artefacto experimental o de uso recreativo, no como un componente validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base "krea2" indicado por el autor; no se detalla la arquitectura del modelo base |
| Parametros totales | no disponible; el adaptador se distribuye como un fichero de 1490 MiB (una conversión hipotética en fp16 daría un techo de ~780 millones de parámetros si todo el fichero fuese denso, pero se desconoce el rango y el reparto por módulos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica una ventana de contexto de texto, se trata de un modelo de imagen condicionado por prompt |
| Tipos de cuantizacion | no disponible; el fichero se distribuye en safetensors y las opciones de cuantización dependen del modelo base y del cargador (ComfyUI u otros) |
| Idiomas soportados | no disponible; la model card está redactada principalmente en inglés y chino, sin indicar idiomas del modelo |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del upstream, que no se especifica |
| Formato de pesos | safetensors (fichero `K2-SNOFS（性、裸照、其他有趣内容）snofs-Krea-V1.4-2hl0.safetensors`, 1490 MiB) |
| Tipo de modelo | LoRA de edición de imagen |
| Modelo base declarado | krea2 (finetuned from) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del adaptador ni sobre la del modelo base "krea2" más allá de la etiqueta de finetuning. Por el tipo de artefacto (LoRA, siglas de low-rank adaptation) cabe esperar un conjunto de matrices de bajo rango inyectadas en capas del modelo base de difusión, con un rango y unos módulos objetivo que la model card no especifica. El tamaño del fichero (1490 MiB) es el único dato cuantitativo disponible sobre la magnitud del adaptador.

Tampoco se detallan los datos de entrenamiento: no hay número de pasos, número de imágenes, resolución de entrenamiento, composición del dataset, ni constancia de técnicas de alineamiento como RLHF, DPO o fine-tuning supervisado. La model card únicamente menciona el origen del entrenamiento en la plataforma RunningHub y enlaza a su servicio de entrenamiento de modelos. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, muestreo destilado), por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Edición y generación de imágenes condicionada por texto e imagen de entrada, según el pipeline declarado image-text-to-image.
- Modificación de imágenes existentes orientada a contenido para adultos (desnudos y contenido sexual explícito), de acuerdo con la descripción del propio autor.
- Integración como nodo LoRA en flujos de trabajo de ComfyUI, combinable con el modelo base y con otros adaptadores o nodos del grafo.
- Ejecución en la plataforma RunningHub, tanto en interfaz web como mediante API, según los enlaces proporcionados por el autor.
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades de audio o vídeo.
- No hay evidencia publicada de capacidades multilingües del modelo; la única referencia idiomática es la model card en inglés y chino.

## Casos de uso

- Edición de imagen en ComfyUI: el adaptador se carga como nodo LoRA sobre el modelo base krea2 y se aplica a un grafo de edición image-text-to-image; es el escenario para el que el autor lo distribuye explícitamente.
- Producción de contenido para plataformas para adultos: generación y retoque de material erótico en estudios que operan con verificación de edad, consentimiento documentado de las personas representadas y cumplimiento de la normativa aplicable en su jurisdicción.
- Retoque de fotografía de desnudo artístico: ajuste de iluminación, textura de piel y composición en sesiones fotográficas con modelos que han firmado cesión de derechos, manteniendo el control de estilo mediante el prompt.
- Investigación en moderación de contenido: uso del adaptador como muestra positiva controlada para entrenar o evaluar clasificadores y filtros NSFW en pipelines de seguridad, comparando su salida con la del modelo base sin adaptador.
- Pruebas de regresión de políticas de contenido: verificación de que los filtros de una plataforma o de un servicio de generación detectan correctamente las salidas de un LoRA explícito antes de habilitar su carga en producción.
- Estudio técnico de adaptación de bajo rango: análisis del delta de pesos respecto al modelo base para caracterizar cómo un LoRA de 1490 MiB desplaza la distribución de salida en un modelo de difusión.
- Automatización vía API en RunningHub: integración del flujo en un servicio HTTP mediante la API de la plataforma, con el fin de encadenar la edición de imágenes en un proceso por lotes.
- Prototipado creativo interno: exploración de estilos y encuadres en un entorno cerrado y no público, con revisión humana previa a cualquier publicación, dado que no existen métricas de calidad ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, SSIM, evaluación humana ni comparación cuantitativa alguna frente al modelo base u otros adaptadores.

## Requisitos de hardware

- El adaptador ocupa 1490 MiB en disco y un tamaño similar de VRAM adicional al cargarse junto al modelo base; los requisitos reales de memoria están dominados por el modelo base krea2, cuyo tamaño de parámetros no se especifica en la información disponible.
- No es posible estimar la VRAM total necesaria sin conocer el modelo base. Como referencia genérica de la categoría, un modelo de difusión de gran tamaño requiere del orden de 8 a 24 GB de VRAM en precisión reducida, y el adaptador añade aproximadamente 1,5 GB sobre esa cifra.
- GPU de consumo: previsiblemente viable en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) si el modelo base se carga cuantizado o con offloading; no hay confirmación del autor al respecto.
- GPU de centro de datos: A100, H100 o L40S son adecuadas para lotes grandes y resolución alta, aunque no se publican medidas de rendimiento para este adaptador.
- Opciones de despliegue: ComfyUI en local, RunningHub en nube (interfaz y API), o cualquier cargador de LoRA compatible con el formato safetensors y con el modelo base. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son servidores de modelos de lenguaje y no de difusión de imágenes.
- Latencia y throughput: no disponible. No se han publicado tiempos de inferencia, número de pasos de muestreo ni resolución de trabajo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del artefacto | Contexto / resolucion | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|---|
| rh-snofs-krea-v1.4-lora | LoRA de edicion de imagen | krea2 | 1490 MiB | no disponible | no disponible | Hugging Face y RunningHub | no publicado |
| snofs_krea_v1_1 | LoRA de edicion de imagen (misma familia, version anterior) | no disponible | no disponible | no disponible | no disponible | RunningHub | no publicado |
| LoRAs de edicion de imagen sobre FLUX.1 Krea y similares | LoRA de edicion de imagen | modelos de difusion tipo Krea / FLUX | variable segun autor | no disponible | variable, habitualmente sujeta a la licencia del base | Hugging Face, Civitai y agregadores | variable segun autor |

No se dispone de datos comparativos verificables (parámetros, contexto, métricas, licencia) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador está diseñado explícitamente para generar contenido sexual y desnudos. Su uso puede infringir la legislación de la jurisdicción del usuario, las condiciones de servicio de plataformas de alojamiento y las políticas de contenido de terceros.
- Riesgo de material íntimo no consentido: la capacidad de editar imágenes existentes permite generar representaciones sexuales de personas reales sin su consentimiento. Su uso para crear imágenes íntimas no consentidas, contenido con menores o suplantación de identidad es ilegal en la mayoría de jurisdicciones, incluida la Unión Europea.
- Licencia no disponible: la model card no especifica una licencia y remite a la licencia del proyecto original, que tampoco se detalla. No hay base jurídica clara para uso comercial y el riesgo de reclamación por parte del titular de los derechos del modelo base es real.
- Ausencia de métricas: cero descargas, cero valoraciones y ningún benchmark publicado. No existe evidencia independiente de calidad, estabilidad ni fidelidad al prompt.
- Documentación insuficiente: no se documentan datos de entrenamiento, pasos, resolución, rango del LoRA, módulos afectados ni compatibilidad verificada con versiones concretas del modelo base.
- Dependencia del modelo base: cualquier cambio, retirada o actualización de krea2 o de su licencia afecta directamente a la viabilidad del adaptador.
- Sesgos: no se ha publicado ninguna evaluación de sesgos demográficos, de representación corporal ni de sesgos de género; los datasets de contenido para adultos suelen amplificar estereotipos de forma y etnia.
- Alucinación visual: como todo modelo de difusión, puede producir anatomías incorrectas, artefactos en manos, rostros y texto, y resultados inconsistentes entre ejecuciones con el mismo prompt.
- Idioma: no hay información sobre el comportamiento del modelo con prompts en castellano; la model card está en chino e inglés y se desconoce qué idiomas maneja mejor el texto de condicionamiento.
- Validación nula en producción: al no existir métricas ni pruebas de terceros, su uso en un pipeline productivo exige validación propia, revisión humana y controles de contenido previos a la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-snofs-krea-v1.4-lora
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2096850810062856193
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1997605227178119169
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Flujos de trabajo de ComfyUI en RunningHub: https://www.runninghub.ai/workflows
- Version anterior de la familia, snofs_krea_v1_1: https://www.runninghub.ai/model/public/2074225520434311170
- Implementacion de la API de RunningHub para ComfyUI: https://github.com/HM-RunningHub/ComfyUI_RH_OpenAPI
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-snofs-krea-v1.4-lora/blob/main/README_cn.md
