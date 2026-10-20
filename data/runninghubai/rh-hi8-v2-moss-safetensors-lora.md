# RunningHubAI/rh-hi8-v2-moss.safetensors-lora

## Resumen

`rh-hi8-v2-moss.safetensors-lora` es un adaptador LoRA publicado por RunningHub (cuenta `RunningHubAI`, autor `@darkHUB`) para el modelo base de generación de imágenes `moss-image`, según declara la propia model card. El repositorio contiene un único fichero de pesos en formato safetensors de 62 MiB, y está etiquetado para su uso en ComfyUI, en la plataforma RunningHub y en Hugging Face. No es un modelo completo: no incluye los pesos del modelo base, el tokenizador ni los componentes de texto/imagen necesarios para la inferencia, por lo que su funcionamiento depende de cargar previamente `moss-image`.

La documentación disponible es mínima. La model card se limita a una tabla de metadatos, el enlace al modelo original en RunningHub, un enlace a un canal de Telegram y enlaces promocionales a los servicios de la plataforma (API, entrenamiento, versión internacional y versión china). No se documentan hiperparámetros de entrenamiento, conjunto de datos, rango del adaptador, módulos objetivo, palabra de activación ni el concepto o estilo concreto que el LoRA introduce.

Su relevancia ahora es limitada y de nicho: los adaptadores LoRA de este tamaño son prácticos para iterar estilos o conceptos sobre un modelo generativo sin redistribuir los pesos completos, y su integración en ComfyUI es directa. Sin embargo, el repositorio no declara licencia, no aporta benchmarks, tiene 0 descargas y 0 «likes», y sus fechas de creación y actualización (20 de octubre de 2026, con 62 segundos de diferencia) sugieren una publicación automatizada sin revisión posterior. Cualquier evaluación en producción debe hacerse contra el modelo base y verificando la licencia del proyecto original.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; se trata de un adaptador LoRA (no se documentan rango, módulos objetivo ni la arquitectura interna del modelo base `moss-image`) |
| Parámetros totales | no disponible; el fichero de pesos LoRA ocupa 62 MiB (`hi8_v2_moss.safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; se distribuye únicamente en safetensors y el autor no documenta variantes cuantizadas |
| Idiomas soportados | no disponible (no se documenta el idioma de los prompts) |
| Licencia | no disponible; la model card remite a «la licencia del proyecto original o de nivel superior», sin especificarla |
| Formato de pesos | safetensors (fichero único `hi8_v2_moss.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (*Low-Rank Adaptation*): un conjunto de matrices de bajo rango que se insertan en capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica explícitamente «Finetuned from: moss-image», de modo que el adaptador se aplica sobre ese modelo de generación de imágenes. No se especifican el rango (`r`), el `alpha`, la tasa de aprendizaje, el número de pasos, los módulos objetivo (atención, proyecciones, etc.) ni si el entrenamiento se hizo sobre texto-imagen u otra modalidad.

Tampoco hay información sobre el conjunto de datos de entrenamiento: no se indica número de imágenes, composición del dataset, resolución, técnica de captura de estilo, ni si se emplearon métodos de preferencia (RLHF/DPO) o regularización. La model card incluye una sección genérica de promoción del servicio de entrenamiento de RunningHub, pero no confirma que este adaptador se haya entrenado allí ni con qué configuración. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal ni similares), lo cual es coherente con la naturaleza de un LoRA.

## Capacidades

- Adaptación de un modelo de generación de imágenes (`moss-image`) mediante un adaptador LoRA; el autor no concreta qué estilo, personaje u objeto introduce el adaptador.
- Carga en ComfyUI mediante los nodos estándar de LoRA sobre el checkpoint del modelo base, lo que permite combinarlo con otros LoRA y ajustar su escala.
- Ejecución en la plataforma RunningHub, tanto en la interfaz online como a través de su API REST, según los enlaces de la model card.
- Distribución en safetensors, formato compatible con cargadores LoRA habituales; el soporte directo en `diffusers` no está confirmado por el autor y puede requerir mapeo de claves.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión por comprensión ni audio, que además quedan fuera del alcance de un adaptador de este tipo.
- No se documenta capacidad multilingüe ni un vocabulario o tokenizador propio.

## Casos de uso

- Personalización de estilo en ComfyUI: cargar `hi8_v2_moss.safetensors` con un nodo `LoraLoader` sobre el checkpoint `moss-image`, fijar la escala entre 0,6 y 1,0 y comparar resultados con la misma semilla y prompt para aislar el efecto del adaptador.
- Producción por lotes mediante la API de RunningHub: automatizar la generación de variantes visuales llamando al endpoint de la plataforma, útil para catálogos o campañas en los que se quiera un acabado homogéneo sin mantener infraestructura propia.
- Prototipado de dirección de arte: al pesar 62 MiB, el adaptador se versiona y se intercambia en minutos, lo que permite probar varias estéticas antes de comprometerse a un fine-tuning completo.
- Pruebas A/B de estilos: ejecutar el mismo prompt y semilla con el LoRA activado y desactivado para medir el impacto visual y decidir la escala adecuada antes de integrarlo en un workflow de producción.
- Archivado y distribución interna de adaptadores: el tamaño reducido facilita almacenar decenas de variantes en un registro interno de modelos junto a sus prompts y parámetros de generación.
- Docencia e investigación sobre LoRA: sirve como ejemplo mínimo de adaptador de bajo rango para estudiar el efecto de la escala, la composición de adaptadores y los artefactos que introduce en la generación.
- Integración en herramientas de diseño gráfico: conectar la API de RunningHub a un flujo de aprobación de bocetos, de modo que el equipo de diseño genere propuestas y el adaptador aporte la coherencia estética definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas de calidad de imagen (FID, CLIP score, evaluaciones humanas), comparaciones con otras LoRA ni curvas de pérdida del entrenamiento.

## Requisitos de hardware

- VRAM del adaptador: unos 0,06 GB en precisión de 16 bits; su coste en memoria es despreciable frente al del modelo base.
- VRAM total: determinada por `moss-image`, no por el LoRA; el autor no publica los requisitos del modelo base en este repositorio, por lo que no es posible dar una cifra fiable.
- GPU recomendadas: no disponible; dependerán del UNet o transformer de difusión del modelo base y no de este adaptador.
- Viabilidad en GPU de consumo: no confirmable sin conocer los requisitos de `moss-image`; el adaptador por sí solo no añade una carga significativa.
- Opciones de despliegue: ComfyUI (carga como LoRA), plataforma RunningHub en la nube y su API REST. El uso con `diffusers`, vLLM, llama.cpp, Ollama o TGI no está documentado y, en el caso de los tres últimos, no aplica a un adaptador de generación de imágenes.
- Latencia y throughput: no disponible; no se publican mediciones y dependerán enteramente del modelo base y del hardware.

## Comparativa con modelos similares

| Alternativa | Parámetros / tamaño | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `rh-hi8-v2-moss.safetensors-lora` (este modelo) | 62 MiB de pesos LoRA; total no disponible | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub | Sin benchmarks ni palabra de activación documentada |
| Otras LoRA de la comunidad para `moss-image` | no disponible | no aplica | no disponible | no disponible | No se han identificado adaptadores comparables documentados en la información proporcionada |
| Fine-tuning completo de `moss-image` | no disponible | no aplica | la del modelo base | requiere redistribuir pesos completos | Mayor coste de almacenamiento y de entrenamiento; no comparable en tamaño de distribución |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o de nivel superior, sin nombrarla. Antes de cualquier uso comercial es obligatorio verificar la licencia de `moss-image` y del propio adaptador.
- Ausencia total de evaluación: no hay benchmarks, muestras de ejemplo ni valoraciones de usuarios (0 descargas, 0 «likes»), por lo que la calidad del adaptador es desconocida.
- Dependencia crítica del modelo base: sin `moss-image` el fichero no es utilizable; este repositorio no documenta su disponibilidad, licencia, tamaño ni requisitos de hardware.
- Falta de instrucciones de uso: no se indica la palabra de activación, la escala recomendada, el prompt de disparo ni los módulos afectados, lo que obliga a experimentar por prueba y error.
- Riesgo de artefactos por sobrescritura: con escalas altas, un LoRA sin documentación puede saturar colores, deformar anatomías o degradar el resultado del modelo base; conviene barrer la escala de forma sistemática.
- Sesgos: no se documenta ningún análisis; el adaptador hereda los sesgos del dataset de entrenamiento, del modelo base y del material de referencia usado para el ajuste, todos ellos desconocidos.
- Alucinación y fidelidad: en generación de imágenes, el riesgo se traduce en incoherencias estructurales, texto ilegible y detalles inconsistentes entre generaciones; no hay evaluación publicada al respecto.
- Idiomas: se desconoce si los prompts deben formularse en inglés, chino o cualquier otro idioma, al no documentarse el tokenizador del modelo base.
- Publicación automatizada: creación y actualización separadas por 62 segundos, con enlaces promocionales a Telegram y a servicios de la plataforma; no hay evidencia de revisión humana ni de control de calidad.
- Repositorio incompleto: se referencia un `README_cn.md` que no se ha podido verificar, y no se declara pipeline ni tarjeta de modelo estructurada en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-hi8-v2-moss.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112481879476039682
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- Canal de Telegram citado en la model card: https://t.me/yesocoai
