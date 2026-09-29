# RunningHubAI/rh-mouth-divine-monkey-lora

## Resumen

rh-mouth-divine-monkey-lora es un adaptador LoRA de edición de imagen publicado en Hugging Face por la cuenta RunningHubAI, asociado a la plataforma de generación y entrenamiento RunningHub. El repositorio contiene un único artefacto, `blowjob_krea2_v1.safetensors` (109 MiB, 0,1 GB de repositorio), etiquetado con los tags `comfyui`, `lora` y `image-text-to-image`, y declarado como afinado a partir del modelo base denominado `krea2`. No es un modelo de lenguaje: no tiene ventana de contexto en tokens, no expone tokenizador de texto y su funcionamiento depende por completo del modelo de difusión sobre el que se aplique.

La model card es mínima y de carácter comercial: enlaza a la plataforma RunningHub, a su API y a su servicio de entrenamiento, e indica que el modelo se publica "en nombre del autor", manteniendo este los derechos. El origen declarado es un modelo alojado en Civitai de temática para adultos, y el propio nombre del archivo de pesos hace referencia explícita a contenido sexual, por lo que se trata de un adaptador orientado a la edición de imágenes de carácter adulto. No se documentan arquitectura, licencia, idiomas, parámetros, dataset de entrenamiento ni hiperparámetros del LoRA (rank, alpha, capas objetivo).

Su relevancia práctica es limitada desde el punto de vista técnico: con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks y con una licencia indefinida, es un ejemplo representativo de los adaptadores que se publican en Hugging Face como simple contenedor de pesos para consumo dentro de una plataforma propietaria, y no como modelo reproducible y evaluable de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; adaptador LoRA sobre un modelo de difusión de imagen base (`krea2`, no documentado en el repositorio) |
| Parametros totales | no declarado; estimación derivada del tamaño del archivo: ~57 M si los pesos están en fp16/bf16 o ~28,5 M si están en fp32 (109 MiB). Cifra no confirmada por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imagen, no autorregresivo) |
| Tipos de cuantizacion | no disponible; el único artefacto publicado es un safetensors de 109 MiB con precisión no declarada |
| Idiomas soportados | no disponible; el idioma de los prompts lo determina el modelo base, no documentado |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream, sin especificarla |
| Formato de pesos | safetensors (`blowjob_krea2_v1.safetensors`, 109 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creación en el repositorio | 2026-09-29 (según metadatos de Hugging Face; fecha anómala respecto a la actualidad) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del adaptador ni del modelo base. Por la etiqueta `lora` y el tamaño del archivo, se trata de un conjunto de matrices de bajo rango inyectadas en las capas del modelo base (habitualmente las proyecciones de atención y las capas lineales de los bloques del UNet o del transformer de difusión), pero ni el rank, ni el alpha, ni las capas objetivo, ni la estrategia de entrenamiento están documentados. La model card únicamente indica "Finetuned from: krea2", sin aclarar a qué checkpoint concreto corresponde esa denominación ni si es un modelo de difusión de tipo transformer (DiT) o UNet. La referencia a `krea2` sugiere una posible relación con la familia FLUX.1 Krea de Black Forest Labs y Krea, pero el repositorio no lo confirma y no debe tomarse como un dato verificado.

Tampoco se especifica el dataset de entrenamiento, el número de pasos, la resolución, el uso de regularización por clase, ni si hubo alguna etapa de ajuste por preferencias (RLHF/DPO). El único indicio del proceso es el enlace al servicio de entrenamiento de RunningHub, lo que apunta a un entrenamiento realizado con las herramientas propias de esa plataforma. El repositorio no incluye imágenes de muestra, prompts de ejemplo ni ficheros de configuración que permitan reproducir el entrenamiento.

## Capacidades

- Edición de imagen guiada por texto e imagen de entrada: el pipeline declarado es `image-text-to-image`, por lo que el adaptador modifica una imagen existente a partir de una instrucción textual, canalizado a través de ComfyUI.
- Especialización en una región concreta del rostro: por el nombre del modelo y del archivo de pesos, el adaptador está entrenado para inducir una modificación localizada en la zona bucal dentro de imágenes de temática adulta.
- Integración con flujos de ComfyUI: al ser un safetensors de tipo LoRA, se carga como nodo de adaptador sobre el modelo base y puede combinarse con otros nodos del grafo.
- Composición con otros LoRA: al tratarse de un adaptador de bajo rango, es susceptible de apilarse con otros adaptadores sobre el mismo base (con el consiguiente riesgo de interferencia).
- Ejecución vía API en RunningHub: la model card ofrece endpoints de API para invocar el modelo sin despliegue local.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-step: no aplica.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Edición localizada en ComfyUI: cargar el LoRA sobre el modelo `krea2` en un grafo de ComfyUI y aplicarlo a una imagen de entrada para modificar únicamente la región bucal, manteniendo el resto de la escena inalterado. Es el uso previsto por el autor, indicado en los tags del repositorio.
- Automatización por API: invocar el modelo alojado en RunningHub mediante su API REST para integrar la edición en un backend propio, sin necesidad de gestionar GPU ni de descargar el modelo base. La model card incluye enlaces directos a la documentación de la API.
- Prototipado de herramientas de edición por instrucción: usar el adaptador como componente dentro de una interfaz de edición texto-a-imagen que permita al usuario describir el cambio deseado sobre una imagen cargada, evaluando la calidad del control regional del LoRA frente a alternativas como inpainting con máscara.
- Investigación en edición facial con difusión: servir como caso de estudio de adaptadores de concepto único orientados a una región anatómica concreta, para medir sobreajuste, fuga de estilo al resto de la imagen y degradación al combinarlo con otros LoRA.
- Auditoría de seguridad y moderación de contenido: emplear el adaptador como muestra de prueba en la validación de clasificadores NSFW y de filtros de contenido en plataformas, ya que representa un caso explícito de contenido para adultos y permite comprobar si los sistemas de moderación lo detectan.
- Generación de variaciones por lotes: dentro de un pipeline por lotes en ComfyUI, aplicar el adaptador sobre un conjunto de imágenes para producir variaciones controladas, siempre que el uso cumpla la legislación aplicable en materia de imágenes sexuales.
- Estudio comparativo de adaptadores de bajo rango: analizar el impacto de un LoRA de ~109 MiB frente a un fine-tuning completo del mismo base en términos de coste de almacenamiento, tiempo de carga y fidelidad al concepto aprendido.
- Formación y docencia: usar el repositorio como ejemplo de ficha técnica incompleta (sin licencia, sin dataset, sin métricas) para ilustrar buenas prácticas de documentación de modelos en un curso de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí es pequeño: 109 MiB, lo que permite cargarlo en memoria de sistema sin problema en cualquier máquina.
- La VRAM necesaria la determina íntegramente el modelo base `krea2`, que no está documentado en el repositorio. Como referencia orientativa no confirmada, los modelos de difusión de escala FLUX en fp16/bf16 (unos 12 000 M de parámetros) requieren del orden de 24 GB de VRAM solo para los pesos, más la memoria de los codificadores de texto; las variantes cuantizadas en fp8 o GGUF Q4-Q5 permiten ejecución en el rango de 8 a 16 GB.
- GPU recomendadas (estimación condicionada al base, no publicada por el autor): A100 40/80 GB, H100, L40S o RTX 4090 para ejecución en precisión alta; RTX 4080, 4070 Ti Super o 3090 para variantes cuantizadas.
- Cabe en GPU de consumo si se emplea el base en cuantización baja (fp8/GGUF) siempre que el modelo base sea compatible; no hay confirmación de los requisitos reales por parte del autor.
- Opciones de despliegue: ComfyUI es la vía declarada. También es viable cualquier runner que cargue LoRA en safetensors sobre el modelo base compatible (por ejemplo, librerías de difusión en Python), o el propio servicio en la nube de RunningHub mediante API. No hay evidencia de soporte en llama.cpp, Ollama, vLLM o TGI, que son herramientas para modelos de lenguaje y no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones reproducibles de este adaptador, por lo que la comparación se plantea a nivel de técnica de adaptación, no de rendimiento medido.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-mouth-divine-monkey-lora (este repositorio) | no declarado; ~57 M estimados | no aplica | no disponible (sin benchmarks) | no disponible, derechos del autor, remite al upstream sin especificarlo | Hugging Face y RunningHub |
| Fine-tuning completo del modelo base | ~12 000 M (estimado, depende del base) | no aplica | no disponible para este caso | la del modelo base | requiere GPU de alta gama y almacenamiento completo |
| ControlNet / inpainting con máscara | típicamente 300-1500 M | no aplica | no disponible para este caso | depende del checkpoint | amplia disponibilidad en la comunidad |
| IP-Adapter u otros adaptadores de imagen | cientos de millones | no aplica | no disponible para este caso | depende del checkpoint | amplia disponibilidad en la comunidad |
| Otros LoRA de edición sobre el mismo base `krea2` | típicamente decenas de millones | no aplica | no disponible | variable según autor | Civitai, Hugging Face y RunningHub |

## Limitaciones y advertencias

- Contenido para adultos: el modelo está orientado explícitamente a la generación y edición de imágenes sexuales. Su uso puede infringir las políticas de contenido de plataformas, empresas y proveedores de servicios en la nube.
- Riesgo legal grave: la aplicación del modelo sobre imágenes de personas reales puede constituir creación de material íntimo no consentido, con consecuencias penales en la Unión Europea (Directiva 2011/93/UE y normativa estatal de transposición) y en España. Cualquier uso que implique a menores es delictivo sin excepción.
- Licencia indefinida: la model card no especifica licencia y remite de forma genérica al proyecto original o al upstream. No hay una autorización clara de uso comercial ni de redistribución, lo que convierte su integración en producto en un riesgo jurídico abierto.
- Sin documentación técnica: no se conocen el modelo base exacto, el dataset, los hiperparámetros del LoRA ni las imágenes de ejemplo, de modo que el comportamiento del adaptador no es reproducible ni auditable.
- Sesgos conocidos: no evaluados ni declarados. Al no publicarse la composición del dataset, no puede estimarse el sesgo demográfico, étnico o de representación corporal del adaptador.
- Riesgo de sobreajuste: se trata de un LoRA de concepto único entrenado sobre una acción concreta; es esperable que degrade la coherencia global de la imagen cuando se aplica fuera de su dominio o cuando se combina con otros adaptadores. Esta afirmación es un razonamiento técnico general y no un dato medido en este repositorio.
- Artefactos anatómicos: los adaptadores de bajo rango sobre regiones faciales tienden a producir artefactos locales (bordes de máscara, texturas inconsistentes, desalineación de iluminación). No hay evaluación publicada que lo cuantifique para este modelo.
- Prompts e idioma: el idioma y el formato de prompt dependen del codificador de texto del base y no están documentados; no hay garantía de funcionamiento con instrucciones en castellano.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta implican que no existe retroalimentación de terceros sobre calidad, estabilidad o fallos.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-29) es posterior a la fecha de consulta habitual de este tipo de repositorios, lo que sugiere metadatos poco fiables.
- Riesgo de alucinación en sentido estricto: no aplica como en un modelo de lenguaje, pero sí existe el fenómeno equivalente de generación de detalles anatómicos o contextuales plausibles pero falsos respecto a la imagen de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-mouth-divine-monkey-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2072844244011802625
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Origen declarado en Civitai: https://civitai.red/models/2749192/blowjob-krea2?modelVersionId=3092620
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- Documentación de la API de Seedance 2.5 en RunningHub (enlace relacionado de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
