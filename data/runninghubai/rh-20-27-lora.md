# RunningHubAI/rh-20-27-lora

## Resumen

`rh-20-27-lora` es un adaptador LoRA de texto a imagen publicado por RunningHub (autor acreditado como @jdaly) y entrenado sobre Z-Image Turbo, según indica la model card. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que se cargan junto al modelo base para modificar su comportamiento generativo. El repositorio contiene un único archivo, `z_beauty_27.safetensors`, de 162 MiB, lo que sitúa el repositorio completo en unos 0,2 GB.

El adaptador está pensado para flujos de trabajo en ComfyUI y para su ejecución en la plataforma RunningHub, que también ofrece una API y un servicio de entrenamiento. La configuración recomendada por el autor es de 9 pasos de inferencia, CFG 1 y un peso de LoRA de 0,8, sin palabra de activación (trigger word), lo que encaja con el régimen de destilación por pocos pasos habitual en los modelos «turbo».

Su relevancia es limitada por el momento: cero descargas y cero «likes» en Hugging Face, sin métricas publicadas ni documentación sobre el dataset de entrenamiento. Resulta útil como ejemplo de adaptador ligero para personalizar un modelo de difusión rápido, pero cualquier evaluación de calidad debe hacerse empíricamente, ya que no hay evidencia pública que la respalde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el modelo de difusión texto-a-imagen Z-Image Turbo; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | no disponible (el adaptador ocupa 162 MiB en safetensors; no se especifican rango, alpha ni número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); la longitud de prompt efectiva depende del codificador de texto del modelo base, no especificada |
| Tipos de cuantización | no disponible; los pesos se distribuyen en safetensors y la cuantización aplicable es la del modelo base |
| Idiomas soportados | no disponible (los prompts se interpretan con el codificador del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`z_beauty_27.safetensors`, 162 MiB) |
| Modelo base | Z-Image Turbo (finetuned from) |
| Palabra de activación | ninguna (según el autor) |
| Pasos de inferencia recomendados | 9 |
| CFG recomendado | 1 |
| Peso de LoRA recomendado | 0,8 |
| Relación de aspecto | libre, horizontal o vertical |
| Plataformas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base (Z-Image Turbo) en lugar de reentrenar todos sus pesos. Esto explica el tamaño reducido del archivo (162 MiB frente a los gigabytes de un modelo de difusión completo) y que la model card lo describa como «entrenado a partir de Z-Image», con instrucciones de uso ligadas a la inferencia en pocos pasos (9 pasos, CFG 1). No se especifican en la información disponible ni el rango del adaptador, ni el alpha, ni las capas objetivo del entrenamiento.

Tampoco hay datos sobre el conjunto de entrenamiento: número de imágenes, resolución, composición del dataset, uso de regularización o de captions automáticos, ni si se aplicaron técnicas adicionales. No se documenta ningún método de ajuste por preferencias, ya que no aplica a un adaptador de difusión de este tipo. La única pista sobre el propósito estético es el nombre del archivo, `z_beauty_27`, que sugiere un estilo orientado a retrato y belleza; es una inferencia a partir del nombre y no una afirmación del autor.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante la modificación del comportamiento del modelo base Z-Image Turbo.
- Funcionamiento sin palabra de activación: el autor indica que no es necesario ningún trigger word, de modo que el estilo o la estética aprendidos se aplican de forma implícita con cualquier prompt.
- Compatibilidad con ComfyUI, lo que permite encadenarlo con nodos de upscaling, ControlNet, inpainting u otros adaptadores del mismo modelo base.
- Ejecución en la plataforma RunningHub y a través de su API, además de la carga directa desde Hugging Face.
- Generación en formato horizontal o vertical, sin restricción de relación de aspecto indicada por el autor.
- Inferencia rápida: 9 pasos con CFG 1, lo que reduce el coste por imagen frente a configuraciones de muestreo estándar de 20-50 pasos.
- Ajuste de intensidad del efecto mediante el peso de LoRA (valor recomendado 0,8, ajustable).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de código, matemáticas, visión de entrada ni audio. Es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Retrato y fotografía de belleza: el adaptador se aplicaría sobre Z-Image Turbo con prompts descriptivos de persona para producir imágenes con la estética aprendida, sin necesidad de trigger word, lo que simplifica la ingeniería de prompts en producción.
- Prototipado rápido en ComfyUI: al requerir solo 9 pasos y CFG 1, permite iterar sobre un grafo de generación con tiempos por imagen bajos, útil para diseñadores que necesitan comparar variantes de estilo.
- Generación por lotes para catálogos y contenidos editoriales: la ausencia de trigger word y la libertad de relación de aspecto facilitan la producción de variantes horizontales y verticales a partir de una misma plantilla de prompt.
- Integración en servicios vía API: la publicación en RunningHub, con documentación de API propia, permite invocar el adaptador desde un backend sin gestionar infraestructura de GPU, siempre que se acepten las condiciones de la plataforma.
- Personalización de producto sobre un modelo turbo: equipos que ya sirven Z-Image Turbo pueden añadir este LoRA con peso 0,8 para ajustar el acabado visual sin reentrenar el modelo base ni duplicar el almacenamiento (162 MiB adicionales).
- Investigación comparativa de adaptadores: sirve como caso de estudio de LoRA de bajo rango sobre modelos destilados de pocos pasos, útil para medir cómo afecta el peso del adaptador (0,6-1,0) a la fidelidad del prompt.
- Pruebas de pipelines de imagen en CI: por su tamaño reducido, es viable descargarlo y cachearlo en entornos de integración continua para tests de regresión visual del grafo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, comparaciones con otros adaptadores) ni muestras comparativas antes/después del LoRA. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador añade solo 162 MiB, pero el requisito real lo determina el modelo base Z-Image Turbo, cuyas especificaciones no se incluyen en la información proporcionada.
- GPU recomendadas: no disponible. Debe consultarse la documentación de Z-Image Turbo para conocer los requisitos del modelo base.
- Encaje en GPU de consumo: no confirmado. Al tratarse de un modelo base en régimen «turbo» (9 pasos, CFG 1) es plausible un despliegue en GPU de consumo con cuantización, pero no hay dato verificado que lo respalde.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), la propia plataforma RunningHub y su API. Otros runners compatibles con safetensors y modelos de difusión no se mencionan en la documentación.
- Latencia y throughput: no disponibles. Solo se conoce la configuración de 9 pasos y CFG 1, que reduce el número de evaluaciones del modelo frente a muestreos de 20-50 pasos, pero sin cifras absolutas.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA publicados para Z-Image Turbo, por lo que no es posible una comparación nominal con alternativas concretas. La siguiente tabla compara categorías de despliegue, no modelos identificados:

| Criterio | rh-20-27-lora (LoRA) | Fine-tune completo del modelo base | Modelo base Z-Image Turbo sin adaptar |
|---|---|---|---|
| Parámetros | no disponible (adaptador de bajo rango) | todos los del modelo base (no disponible) | no disponible |
| Tamaño en disco | 162 MiB | del orden del modelo completo (no disponible) | no disponible |
| Contexto / resolución | heredada del modelo base | heredada del modelo base | no disponible |
| Rendimiento medido | sin benchmarks publicados | sin datos en esta ficha | sin datos en esta ficha |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | Hugging Face y RunningHub | no disponible | referenciado como upstream |

## Limitaciones y advertencias

- Licencia no declarada: la model card solo indica que el copyright permanece en el autor y remite a la licencia del proyecto original. No hay autorización explícita de uso comercial, por lo que debe verificarse con el autor o con la licencia de Z-Image Turbo antes de usarlo en producción.
- Dependencia total del modelo base: sin los pesos de Z-Image Turbo el archivo es inutilizable; cualquier cambio de licencia o de disponibilidad del base afecta directamente al adaptador.
- Documentación mínima: no se especifican dataset, resolución de entrenamiento, rango del LoRA ni capas objetivo, lo que impide reproducir el entrenamiento o anticipar su comportamiento fuera de la estética prevista.
- Sin validación comunitaria: cero descargas y cero «likes» en el momento de la consulta, sin imágenes de ejemplo ni evaluaciones de terceros.
- Riesgo de artefactos: como cualquier adaptador de difusión, puede producir anatomías incorrectas, manos deformadas, texto ilegible en la imagen y coherencia limitada en escenas con varias personas, especialmente con pesos altos o prompts alejados de su dominio.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de representación (edad, etnia, género, tipo de cuerpo) en la estética aprendida, algo crítico en un adaptador orientado a «belleza».
- Sensibilidad a la configuración: los valores de 9 pasos, CFG 1 y peso 0,8 son recomendaciones del autor; desviarse de ellos puede degradar el resultado, y el efecto del LoRA puede saturar el prompt con pesos superiores a 1,0.
- Idiomas no declarados: no hay información sobre el rendimiento de los prompts en castellano; conviene validar con el codificador de texto del modelo base.
- Fecha de creación futura en los metadatos (2026-10-25), lo que conviene contrastar antes de citar el modelo en documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-20-27-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-20-27-lora/blob/main/README_cn.md
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/2029156364496408577
- Página del autor (@jdaly): https://www.runninghub.cn/user-center/1983778672748457986
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
