# pbcong/tars-release-7b-mask-s42-ep3

## Resumen

tars-release-7b-mask-s42-ep3 es un checkpoint de ajuste fino completo (época 3) publicado por el usuario pbcong en Hugging Face, construido sobre liuhaotian/llava-v1.5-7b. Se trata, por tanto, de un modelo multimodal de visión y lenguaje de 7.062.902.784 parámetros (unos 7,06 mil millones) que hereda la arquitectura LLaVA-1.5: un decodificador de lenguaje tipo LLaMA/Vicuna acoplado a un codificador visual CLIP ViT-L/14 de 336 píxeles mediante un proyector MLP. El repositorio ocupa 14,1 GB y solo contiene pesos en formato safetensors.

La model card es deliberadamente escueta. Indica que es un checkpoint de fine-tuning completo en el formato LLaVA original, que debe cargarse con el cargador específico de TARS/LLaVA y no con un cargador LoRA de Hugging Face, que los ajustes de entrenamiento están en reproduction.json y que los benchmarks medidos están pendientes. También advierte de que los perfiles descritos en el artículo asociado son reconstrucciones con supuestos documentados, no checkpoints del autor.

Su relevancia actual es limitada y experimental: cero descargas, cero interacciones, licencia no declarada, idiomas no declarados y ausencia total de cifras de rendimiento verificadas. Resulta de interés sobre todo para quien quiera reproducir el pipeline de ajuste o comparar este checkpoint frente al LLaVA-1.5 original, asumiendo que no existe validación pública de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo LLaVA (etiqueta llava_llama): decodificador de lenguaje LLaMA/Vicuna + codificador visual CLIP ViT-L/14 336 + proyector MLP, heredada de liuhaotian/llava-v1.5-7b |
| Parámetros totales | 7.062.902.784 (≈7,06 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no declarada para este checkpoint; el modelo base LLaVA-1.5-7B trabaja con 2048 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors (14,1 GB), sin GGUF, AWQ, GPTQ ni variantes de 8 o 4 bits |
| Idiomas soportados | no disponible; no declarado en la model card |
| Licencia | no disponible; no declarada en el repositorio |
| Formato de pesos | safetensors (formato LLaVA original) |
| Modelo base | liuhaotian/llava-v1.5-7b |
| Descargas / likes | 0 / 0 |
| Fecha de creación en Hugging Face | 2026-10-01 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de LLaVA-1.5, heredada íntegramente del modelo base. Un codificador visual CLIP ViT-L/14 con resolución de 336 píxeles extrae características de la imagen, un proyector MLP de dos capas las transforma en embeddings de tokens visuales y un decodificador de lenguaje autorregresivo tipo LLaMA/Vicuna genera la respuesta textual condicionada por dichos tokens. El recuento de 7.062.902.784 parámetros coincide con la suma del decodificador de aproximadamente 6,7 mil millones de parámetros, el codificador visual de unos 300 millones y el proyector.

En cuanto al entrenamiento de este checkpoint concreto, la información disponible es mínima: la model card indica únicamente que se trata de un ajuste fino completo de la época 3 (full fine-tuning, sin LoRA) y remite a reproduction.json para los ajustes de entrenamiento y las revisiones. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO, ni la estrategia de enmascaramiento que sugiere el sufijo «mask» del nombre. Tampoco se detalla si el ajuste afectó al codificador visual, al proyector, al decodificador o a los tres. Los elementos «s42» y «ep3» del identificador son compatibles con una semilla 42 y una tercera época, pero se trata de una inferencia a partir del nombre, no de un dato documentado. Las cifras habituales de LLaVA-1.5 (alineación previa con pares imagen-texto y ajuste de instrucciones multimodal) corresponden al modelo base y no se pueden atribuir a este checkpoint sin confirmación.

## Capacidades

- Generación de texto e interacción conversacional condicionada por imágenes, con la misma arquitectura multimodal que LLaVA-1.5-7B.
- Respuesta a preguntas sobre imágenes (VQA) y descripción de contenido visual.
- Razonamiento básico de sentido común sobre escenas y objetos, así como lectura de texto presente en imágenes dentro de los límites del modelo base.
- Conversación multiturno sobre una o varias imágenes, limitada por la ventana de contexto del modelo base.
- Soporte de tool calling o function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles, no declaradas.
- Capacidades especiales (modo de pensamiento, audio, vídeo): no disponibles, no documentadas.

## Casos de uso

- Reproducción de experimentos de ajuste fino multimodal: el checkpoint permite verificar el pipeline descrito por el autor, cargándolo con el cargador TARS/LLaVA indicado y comparando los pesos resultantes con el modelo base.
- Comparación controlada frente a LLaVA-1.5-7B: útil para medir si el ajuste completo de tres épocas aporta mejoras o degradaciones en tareas de VQA, siempre mediante una evaluación propia, ya que no hay benchmarks publicados.
- Punto de partida para un ajuste posterior específico de dominio: al tratarse de un checkpoint en formato LLaVA original, se puede continuar el entrenamiento con datos propios (por ejemplo, imágenes industriales o de producto) antes de desplegar nada en producción.
- Investigación sobre estrategias de enmascaramiento: si el sufijo «mask» del nombre efectivamente designa una técnica de enmascaramiento durante el entrenamiento, el checkpoint sirve como material de estudio de su efecto sobre el rendimiento, aunque el autor no lo documenta.
- Prototipos internos de descripción automática de imágenes: se puede generar texto descriptivo para catálogos o archivos fotográficos en entornos de prueba, asumiendo revisión humana por el riesgo de alucinación.
- Evaluación de seguridad y sesgos: dado que no se declara proceso de alineación específico, el modelo es un candidato razonable para auditorías de sesgo y de contenido generado en el ámbito académico.
- Docencia y prácticas de ingeniería de modelos multimodales: permite ilustrar el ciclo completo de fine-tuning, empaquetado y carga de un modelo visión-lenguaje de 7B en un entorno controlado.

En todos los casos conviene tratar el modelo como experimental: no hay licencia declarada, no hay métricas publicadas y no hay validación por parte de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card del autor indica explícitamente «Measured benchmarks: pending», y los perfiles que menciona se describen como reconstrucciones con supuestos documentados, no como resultados medidos sobre este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en fp16: los pesos ocupan aproximadamente 14,1 GB, a los que se suman la caché KV y las activaciones del codificador visual (CLIP ViT-L/14 336 en fp16 ronda los 0,6 GB), por lo que se recomienda un mínimo de 18-24 GB para trabajar con comodidad.
- GPU de centro de datos: A100 de 40 GB o 80 GB, H100 y L40S son adecuadas para fp16 sin cuantización; también lo son soluciones de 24 GB como RTX 4090, RTX 3090 o A10G.
- GPU de consumo: el modelo cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en fp16. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el ajuste es muy justo y requiere cuantización, que no está publicada en el repositorio. En tarjetas de 8-12 GB no cabe sin convertir el modelo a 4 bits por cuenta propia.
- Opciones de despliegue: el autor exige el cargador específico de TARS/LLaVA incluido en el ecosistema LLaVA; los cargadores LoRA de Hugging Face no son válidos para este checkpoint. vLLM dispone de soporte para la familia LLaVA-1.5 y podría servir la arquitectura, pero no hay confirmación de compatibilidad con este ajuste concreto. Para llama.cpp, Ollama o LM Studio sería necesario convertir los pesos a GGUF junto con un proyector multimodal (mmproj), conversión que no está publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tars-release-7b-mask-s42-ep3 (este) | 7,06 mil millones | no declarada (base: 2048 tokens) | Imagen + texto | no disponible | Repositorio de Hugging Face con 0 descargas, sin benchmarks |
| liuhaotian/llava-v1.5-7b | 7 mil millones | 2048 tokens | Imagen + texto | Apache-2.0 nominal, con las restricciones heredadas del backbone tipo LLaMA/Vicuna | Ampliamente desplegado, con benchmarks publicados en el artículo de LLaVA-1.5 |
| llava-v1.6-vicuna-7b (LLaVA-NeXT) | 7 mil millones | 4096 tokens | Imagen + texto | Apache-2.0 nominal, con las mismas restricciones heredadas | Disponible en Hugging Face, con evaluación publicada |
| Qwen2-VL-7B-Instruct | aproximadamente 8,3 mil millones | 32 768 tokens nativos, ampliable | Imagen, vídeo y texto | Apache-2.0 | Disponible en Hugging Face, con benchmarks publicados y soporte en vLLM |

Los datos de los modelos comparativos provienen de su documentación pública y se incluyen a título orientativo. No existe información que permita afirmar que este checkpoint iguale o supere a los anteriores.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. Además, el modelo base arrastra las condiciones del backbone tipo LLaMA/Vicuna, que históricamente han restringido el uso comercial.
- Ausencia de benchmarks: no hay ninguna métrica medida. Cualquier afirmación de rendimiento sería especulativa.
- Riesgo de alucinación: al derivar de LLaVA-1.5, es esperable la alucinación de objetos y detalles no presentes en la imagen, un fenómeno documentado en la familia. Sin evaluación específica, no se puede acotar su magnitud en este checkpoint.
- Contexto limitado: la ventana del modelo base (2048 tokens) restringe las conversaciones multiturno largas y el uso de múltiples imágenes en una misma petición.
- Idioma: no se declaran idiomas soportados; el modelo base está orientado principalmente al inglés, por lo que el comportamiento en castellano no está garantizado.
- Dependencia del cargador: según el autor, el checkpoint no se puede cargar con un cargador LoRA estándar de Hugging Face. Esto complica su integración en herramientas que esperan un formato estándar.
- Sesgos y alineación: no se documenta ningún proceso de RLHF, DPO o filtrado de seguridad específico para este ajuste, por lo que los sesgos y la toxicidad heredados del backbone y de los datos de instrucción permanecen sin mitigar.
- Trazabilidad dudosa: el repositorio tiene cero descargas, cero interacciones y una fecha de creación inusualmente futura en los metadatos (octubre de 2026). No hay revisión por pares ni validación independiente.
- Artefactos no verificables: el archivo reproduction.json y el artículo mencionado no se han podido comprobar desde la información disponible; el autor los describe como reconstrucciones con supuestos, no como resultados de sus propios checkpoints.
- Búsqueda web sin resultados relevantes: las consultas realizadas devuelven un buscador de direcciones MAC, la portada de Hugging Face, el repositorio UI-TARS de ByteDance (un proyecto de agentes de interfaz gráfica sin relación con este modelo pese a compartir el nombre) y páginas de seguimiento genérico de modelos. No hay análisis, notas de prensa ni discusiones técnicas sobre este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pbcong/tars-release-7b-mask-s42-ep3
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-7b
- reproduction.json (mencionado en la model card; no verificado): https://huggingface.co/pbcong/tars-release-7b-mask-s42-ep3/blob/main/reproduction.json
- Repositorio de LLaVA: https://github.com/haotian-liu/LLaVA
- Artículo de LLaVA-1.5 (Improved baselines with visual instruction tuning): https://arxiv.org/abs/2310.03744
- Repositorio UI-TARS de ByteDance (sin relación con este modelo, aparece en la búsqueda por coincidencia de nombre): https://github.com/bytedance/UI-TARS
