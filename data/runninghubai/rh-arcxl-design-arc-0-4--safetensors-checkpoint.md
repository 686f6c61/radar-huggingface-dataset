# RunningHubAI/rh-arcxl-design-arc-0.4-.safetensors-checkpoint

## Resumen

`rh-arcxl-design-arc-0.4-.safetensors-checkpoint` es un checkpoint de generación de imágenes texto-a-imagen publicado por RunningHub bajo la cuenta de su autor (@RX) y distribuido a través de Hugging Face. No es un modelo de lenguaje: es un ajuste fino (finetune) del modelo de difusión SDXL 1.0 orientado a un nicho muy concreto del diseño arquitectónico, según la propia model card: "interior architectural landscape model, white model, line drawing", es decir, interiores y paisajismo arquitectónico, maquetas volumétricas blancas (white models) y dibujos de líneas.

El repositorio es exclusivamente de pesos: contiene un único fichero `.safetensors` de 6777 MiB (~6,6 GiB) y una model card mínima que actúa como ficha de catálogo de la plataforma RunningHub (ComfyUI / RunningHub / Hugging Face). No incluye información sobre el dataset de entrenamiento, hiperparámetros, método de ajuste, evaluación o licencia concreta, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria publicada.

Su relevancia es por tanto acotada y práctica: sirve como checkpoint especializado para flujos de trabajo en ComfyUI en estudios de arquitectura e interiorismo que necesiten generar conceptos volumétricos y bocetos de línea con estética de maqueta, no como modelo de propósito general ni como base para tareas de razonamiento, código o agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Latent Diffusion, U-Net + VAE) heredada de SDXL 1.0, según la model card ("Finetuned from: SDXL 1.0") |
| Parametros totales | No disponible en el repositorio. Arquitectura de referencia SDXL 1.0: U-Net de ~2.600 M de parámetros más codificadores de texto CLIP (~3.500 M en el checkpoint base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje. Prompt de texto gestionado por los codificadores CLIP de SDXL (77 tokens por codificador en el modelo base) |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Único fichero `.safetensors` de 6777 MiB, previsiblemente fp16 (no confirmado en la model card) |
| Idiomas soportados | No disponible. El autor no documenta idiomas de prompt; los codificadores CLIP del modelo base están entrenados mayoritariamente en inglés |
| Licencia | No disponible. La model card indica "Follow the original project or upstream license", remitiendo a la licencia del proyecto original (SDXL 1.0) |
| Formato de pesos | safetensors (checkpoint completo en un solo fichero: `ARC空间设计师XL _ 室内建筑景观Design大模型_ARC_0.4 .safetensors`) |

Datos del repositorio: ID `RunningHubAI/rh-arcxl-design-arc-0.4-.safetensors-checkpoint`, tamaño 7,1 GB, pipeline `text-to-image`, etiquetas `comfyui`, `checkpoint`, `text-to-image`, `region:us`. Fechas declaradas en el repositorio: creación 2026-10-22, actualización 2026-10-22.

## Arquitectura y entrenamiento

La arquitectura es la de SDXL 1.0, un modelo de difusión latente que combina una U-Net con atención cruzada, un VAE para codificar y decodificar latentes y dos codificadores de texto CLIP (uno de ellos de mayor tamaño, con embeddings agrupados). Este repositorio no describe ninguna modificación estructural: se presenta como un finetune del checkpoint base, por lo que se asume que conserva la resolución nativa de 1024x1024 y el esquema de condicionamiento por prompt y prompt negativo de SDXL, si bien el autor no lo confirma explícitamente.

No hay información sobre el proceso de entrenamiento: se desconoce el número de imágenes o tokens, la composición del dataset (¿renders de interiores, fotografías de maquetas, planos vectoriales?), el método de ajuste (full fine-tune, LoRA fusionada, DreamBooth), la resolución de entrenamiento, el número de pasos, el uso de regularización o de aprendizaje con refuerzo/preferencias. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación de pasos) ni se aportan muestras de validación. Cualquier afirmación sobre calidad o fidelidad estilística del ajuste carece por ahora de evidencia publicada.

## Capacidades

- Generación de imágenes texto-a-imagen dentro del ecosistema SDXL (resolución nativa de 1024x1024 en el modelo base).
- Especialización declarada en interiores y paisajismo arquitectónico ("interior architectural landscape").
- Generación de "white models": maquetas volumétricas blancas, sin materiales ni texturas, útiles para exploración de formas.
- Generación de dibujos de línea ("line drawing") con estética de boceto arquitectónico.
- Soporte de prompt negativo, heredado del pipeline de SDXL (no documentado por el autor, pero estándar en la arquitectura base).
- Compatibilidad esperada con img2img, inpainting, ControlNet, LoRA e IP-Adapter a través de ComfyUI, por herencia de SDXL; no verificada ni documentada en el repositorio.
- Tool calling / function calling: no aplica (modelo de imagen, sin interfaz de herramientas).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües de prompt: no documentadas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Exploración de concepto volumétrico en interiorismo: generar series de "white models" de una estancia (salón, cocina, lobby) para decidir proporciones y alturas antes de modelar en 3D, aprovechando la especialización declarada del checkpoint en maquetas blancas.
- Bocetado de línea para presentaciones de anteproyecto: producir dibujos de líneas que sirvan como base de láminas o de montaje posterior en Illustrator/CAD, evitando el aspecto de render fotorrealista.
- Moodboards de paisajismo arquitectónico: generar variaciones de jardines, patios y espacios exteriores para discutir con el cliente la relación entre volumetría y vegetación.
- Iteración rápida de paletas y materiales: usar img2img o inpainting sobre una salida del propio modelo para probar acabados (madera, hormigón, piedra) manteniendo la composición, dentro de un flujo de ComfyUI.
- Pipelines con ControlNet en ComfyUI: condicionar la generación con mapas de profundidad, normales o segmentación de una planta 3D para que la imagen respete la geometría del proyecto; la etiqueta `comfyui` del repositorio sugiere que ese es el entorno previsto.
- Generación masiva de alternativas para estudio de arquitectura: lotes de 20-50 imágenes por brief para filtrar direcciones de diseño antes de invertir horas de modelado, con coste de GPU contenido al ser un checkpoint SDXL.
- Previsualización en herramientas de cliente: integrar el checkpoint en una demo web o en RunningHub vía API para que el cliente vea variaciones en tiempo casi real durante una reunión.
- Docencia y formación: ilustrar conceptos de espacio, escala y recorrido arquitectónico con imágenes generadas a partir de descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye FID, CLIP score, comparativas humanas ni métricas de adherencia al prompt, y no se han encontrado evaluaciones de terceros. No se deben inferir cifras a partir del modelo base, ya que el finetune puede degradar el rendimiento general de SDXL a cambio de especialización.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 6777 MiB (~6,6 GiB). Para generar a 1024x1024 en fp16 sin offloading se suele necesitar del orden de 10-12 GB de VRAM; con técnicas de offloading y VAE en tiles puede funcionar en 6-8 GB. Son estimaciones basadas en la clase SDXL, no mediciones de este checkpoint.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 para uso individual; A100 o H100 para servir lotes en paralelo o varios usuarios.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU con 8 GB o más aplicando offloading parcial, y con comodidad en 12-16 GB.
- Opciones de despliegue: ComfyUI (entorno indicado por las etiquetas del repositorio), plataforma RunningHub y su API, `diffusers` de Hugging Face, Automatic1111 / Forge, SD.Next. No se distribuyen variantes GGUF ni fp8; para cuantizar habría que generarlas con herramientas de terceros.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni ejemplos de tiempos de generación.

## Comparativa con modelos similares

No se dispone de datos de benchmark de este checkpoint frente a otros finetunes de interiorismo, por lo que la comparación se limita a los rasgos estructurales de los modelos base.

| Modelo | Parametros | Prompt | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-arcxl-design-arc-0.4 | No disponible (hereda SDXL 1.0) | No disponible (CLIP de SDXL, 77 tokens) | No confirmada (SDXL 1.0: 1024x1024) | No disponible | Hugging Face + RunningHub |
| SDXL 1.0 (base) | ~3.500 M en el checkpoint (U-Net ~2.600 M) | 77 tokens por codificador CLIP | 1024x1024 | CreativeML OpenRAIL++-M | Público |
| Stable Diffusion 1.5 | ~860 M | 77 tokens CLIP | 512x512 | CreativeML OpenRAIL-M | Público |

Nota: los datos de SDXL 1.0 y SD 1.5 provienen de la documentación pública de esos modelos base, no del repositorio analizado. No se han identificado en la información proporcionada otros finetunes comparables de interiorismo arquitectónico con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: sin dataset, sin método de entrenamiento, sin métricas y sin ejemplos de salida. Es imposible evaluar la calidad del ajuste antes de probarlo.
- Licencia no declarada: la model card remite a la licencia del proyecto original. Para uso comercial es imprescindible verificar la licencia de SDXL 1.0 (CreativeML OpenRAIL++-M, con restricciones de uso) y contactar con el autor si se necesita claridad.
- Validación comunitaria nula: 0 descargas y 0 likes en la fecha indicada por el repositorio, sin issues ni discusión pública.
- Riesgo de sobreajuste al estilo del autor: al ser un finetune de nicho, puede perder capacidad de generar escenas fuera de interiores, paisajismo y maquetas blancas.
- Alucinación geométrica: como todo modelo de difusión, puede producir estancias con proporciones imposibles, escaleras que no llevan a ningún sitio, ventanas incoherentes o perspectivas inconsistentes. No es una herramienta de validación métrica ni sustituye a un modelo CAD/BIM.
- Texto en imagen: es previsible que falle al generar rótulos, cotas o texto legible; no hay evidencia de lo contrario.
- Idiomas: no se documenta soporte de prompts en castellano; el rendimiento con prompts en inglés es, en principio, más fiable por los codificadores CLIP del modelo base.
- Fechas del repositorio anómalas (creación y actualización en 2026-10-22) y nombre de fichero con caracteres chinos y espacios, lo que puede complicar la automatización de descargas y la integración en scripts.
- Publicado por la plataforma en nombre del autor: la responsabilidad sobre el contenido y los derechos de las imágenes de entrenamiento recae en el autor, no en RunningHub, según la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-arcxl-design-arc-0.4-.safetensors-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1920480606621204482
- Página del autor: https://www.runninghub.cn/user-center/1904003618335498242
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-arcxl-design-arc-0.4-.safetensors-checkpoint/blob/main/README_cn.md
