# RunningHubAI/rh-25093d-lora

## Resumen

rh-25093d-lora es un adaptador LoRA para edición de imagen orientado a la extracción y reconstrucción de prendas de vestir. Lo publica RunningHubAI en Hugging Face, aunque el autor original del entrenamiento figura como el usuario de RunningHub [@可铯创意cosaer](https://www.runninghub.cn/user-center/1866838547620896770). No es un modelo de lenguaje: es un LoRA que se aplica sobre un modelo base de generación/edición de imagen, concretamente Qwen-Edit-2509, según indica la model card.

El problema que resuelve es muy específico del sector de moda y comercio electrónico: a partir de una fotografía de una prenda (con maniquí, percha, modelo humano o arrugas), el LoRA genera una imagen en la que la prenda aparece aislada, en forma 3D, sin soportes ni persona, sin pliegues y sobre fondo blanco, preservando el color, la textura, el brillo y el patrón del tejido original. Es una tarea de *image edit* condicionada por texto, con una instrucción de activación (trigger) muy larga y detallada en chino.

El repositorio es de pequeño tamaño (0,9 GB) y contiene únicamente los pesos del adaptador en formato safetensors. No hay información sobre parámetros, contexto, idiomas ni licencia explícita más allá de la remisión a la licencia del proyecto original. La relevancia actual es acotada: se trata de una herramienta de producción para pipelines de catálogo de moda en ComfyUI o en la plataforma RunningHub, no de un modelo generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de edición de imagen Qwen-Edit-2509 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el LoRA se aplica sobre el modelo base, que puede cuantizarse según el runtime) |
| Idiomas soportados | no disponible; la instrucción de activación está redactada en chino |
| Licencia | no disponible; la model card remite a la licencia del proyecto original y mantiene el copyright del autor |
| Formato de pesos | safetensors (`2509服装3d.safetensors`, 900 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y presumiblemente en las proyecciones) de un modelo base de difusión para edición de imagen. El modelo base declarado es Qwen-Edit-2509, un modelo de edición de imagen de la familia Qwen. No se especifican el rango del LoRA, las capas objetivo, la resolución de entrenamiento, el número de pasos ni la composición del dataset.

La model card no documenta el proceso de entrenamiento más allá de indicar que se ha realizado en RunningHub (existe un enlace a su servicio de entrenamiento). No hay información sobre técnicas de regularización, uso de captions automáticos, aumento de datos ni evaluación cuantitativa. La única guía operativa es la instrucción de activación, que describe con precisión el resultado esperado: extracción completa de la prenda, conversión a forma 3D, eliminación de percha, modelo humano o maniquí, eliminación de arrugas, contorno plano y suave, conservación del 100 % de color, tono, saturación, textura, patrón, brillo y detalles, bordes limpios y fondo blanco.

## Capacidades

- Edición de imagen condicionada por texto: transforma una fotografía de entrada según la instrucción de activación.
- Extracción de prendas de vestir: aísla la ropa del resto de la escena (perchas, maniquíes, personas).
- Reconstrucción en forma 3D: aplana y da volumen a la prenda eliminando pliegues y arrugas.
- Preservación de atributos visuales: mantiene color, tono, saturación, textura, patrón de tejido, brillo y detalles.
- Generación sobre fondo blanco con bordes limpios, apta para catálogo.
- Integración en ComfyUI y en la plataforma RunningHub mediante flujos de nodos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un adaptador puramente generativo de imagen.

## Casos de uso

- Catalogación de moda en e-commerce: a partir de fotos de producto tomadas con maniquí o percha, el LoRA genera la imagen limpia sobre fondo blanco que exigen los marketplaces, reduciendo el trabajo de retoque manual.
- Estandarización de fichas de producto: unificar el aspecto de un catálogo completo aplicando la misma instrucción de activación a cientos de referencias, de modo que todas las prendas compartan encuadre, fondo y presentación.
- Generación de vistas 3D planas para probadores virtuales: la prenda aplanada y sin arrugas sirve como textura base para motores de simulación de tela o para *try-on*.
- Preservación de fidelidad de color en marcas: al conservar el 100 % de tono y saturación según la instrucción, es útil para marcas que no pueden permitirse desviaciones cromáticas en el material promocional.
- Automatización de flujos en ComfyUI: integrado como nodo dentro de un pipeline que recibe la foto original, aplica el LoRA con el trigger y entrega la imagen final a un sistema de subida a CMS.
- Prototipado rápido de *lookbooks*: generar variantes de presentación de una misma prenda sin volver a fotografiar el producto.
- Limpieza de archivos históricos: recuperar imágenes antiguas de catálogo con maniquíes y convertirlas al estándar actual de fondo blanco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base Qwen-Edit-2509 sobre el que se aplique el LoRA, no del adaptador en sí (0,9 GB de pesos).
- GPU recomendadas: no disponibles en la documentación; en la práctica, las GPUs capaces de ejecutar el modelo base de edición de imagen (gama profesional o consumer de gama alta) son las que marcarán el requisito.
- Compatibilidad con GPU consumer: no confirmada; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma del autor) y, en general, cualquier runtime que cargue el modelo base y permita aplicar LoRA en formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de extracción de prendas ni datos comparativos de rendimiento, por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada de forma explícita: la model card remite a la licencia del proyecto original y mantiene el copyright del autor, lo que introduce incertidumbre para uso comercial. Es imprescindible verificar la licencia de Qwen-Edit-2509 y del propio LoRA antes de producción.
- Dependencia total del modelo base: el LoRA no funciona de forma autónoma; requiere cargar Qwen-Edit-2509 y aplicar el adaptador con la instrucción de activación exacta.
- Instrucción de activación en chino y muy larga: el uso fuera de ese *prompt* puede degradar el resultado; no hay documentación sobre variantes en otros idiomas.
- Especialización extrema: está entrenado para una única tarea (extracción y aplanado de prendas sobre fondo blanco); no es un modelo generalista de edición de imagen.
- Riesgo de alteración de atributos: aunque la instrucción exige preservar el 100 % de color, textura y patrón, no hay evaluación publicada que garantice esa fidelidad; en producción conviene validar con muestras propias.
- Sin datos de sesgos, alucinación visual ni robustez ante entradas fuera de distribución (prendas con transparencias, estampados complejos, iluminación adversa).
- Repositorio sin descargas ni *likes* en el momento de la consulta y con fecha de creación futura respecto a la fecha habitual de referencia; tratar la información con cautela.
- Sin información sobre idiomas soportados ni sobre el proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-25093d-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1988178122027745282
- Página del autor: https://www.runninghub.cn/user-center/1866838547620896770
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
