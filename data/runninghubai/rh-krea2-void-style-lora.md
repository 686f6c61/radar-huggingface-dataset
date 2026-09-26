# RunningHubAI/rh-krea2-void-style-lora

## Resumen

rh-krea2-void-style-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI en Hugging Face. Según su model card, está afinado a partir de un modelo base denominado "krea2" ("Finetuned from: krea2"); la documentación no identifica el checkpoint exacto ni detalla su arquitectura. El repositorio contiene un único fichero de pesos, `Krea2Void_c1-st8000.safetensors`, de 224 MiB, con pipeline declarado `image-text-to-image` y etiquetas `comfyui` y `lora`.

El adaptador resuelve un problema acotado: inyectar una estética visual concreta, bautizada como "void" por el autor, en flujos de edición de imagen guiados por texto, sin necesidad de reentrenar el modelo base completo. Al ser un LoRA, se carga sobre el modelo original y solo añade un pequeño delta de pesos, lo que abarata el almacenamiento y el intercambio de estilos entre proyectos.

Su relevancia actual es limitada y debe evaluarse con cautela: el repositorio acumula 0 descargas y 0 likes, no publica benchmarks, no especifica licencia propia (remite a la del proyecto original) y no incluye ejemplos visuales ni dataset de entrenamiento en la información disponible. Es, por tanto, un artefacto recién publicado dentro del catálogo de RunningHub, útil solo si se dispone del modelo base "krea2" y de un entorno ComfyUI o RunningHub para ejecutarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusión de edición de imagen (base "krea2"); arquitectura del modelo base no especificada |
| Parámetros totales | No disponible (adaptador de 224 MiB en safetensors; el número de parámetros no se declara) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el soporte dependera del text encoder del modelo base) |
| Licencia | No especificada. La model card indica que los derechos permanecen con el autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Krea2Void_c1-st8000.safetensors`, 224 MiB) |
| Tamaño del repositorio | 0,2 GB |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creación | 2026-09-26 (según metadatos de Hugging Face) |
| Última actualización | 2026-09-26 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un LoRA de edición de imagen afinado desde "krea2". No se detalla si el modelo base es un transformer de difusión, un modelo de flujo o una arquitectura híbrida, ni se indica el número de parámetros del base, la dimensión del espacio latente o el tipo de text encoder. Tampoco se documentan el rango (rank) del adaptador, el valor de alpha, los módulos objetivo ni si se aplica sobre atención, proyecciones o bloques completos.

En cuanto al entrenamiento, la model card solo aporta que fue entrenado en RunningHub y que el fichero se llama `Krea2Void_c1-st8000.safetensors`. El sufijo `st8000` sugiere un checkpoint guardado en el paso 8000, pero esto es una interpretación del nombre del fichero y no una confirmación del autor. No hay datos sobre número de imágenes, composición del dataset, resolución de entrenamiento, learning rate, scheduler, uso de regularización o si hubo etapas de refinamiento. Tampoco se menciona RLHF, DPO ni ninguna innovación técnica (decodificación especulativa, atención lineal, destilación por pasos), ya que son conceptos propios de modelos de lenguaje y no se declaran aquí.

## Capacidades

- Edición de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, por lo que el adaptador está pensado para modificar una imagen de entrada a partir de una instrucción textual.
- Aplicación de un estilo visual concreto ("void"): el LoRA inyecta una estética propia en el resultado de la edición, siempre que el prompt y el flujo de trabajo la activen.
- Integración con ComfyUI: las etiquetas y la model card lo sitúan en el ecosistema ComfyUI como nodo LoRA cargable sobre el modelo base.
- Ejecución en RunningHub: el autor indica que los pesos se pueden cargar en su plataforma, tanto en la versión internacional como en la china.
- Generación de imágenes: al ser un modelo image-text-to-image, puede producir imágenes nuevas a partir de imagen de referencia más prompt, según el comportamiento del base "krea2".
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingües: no documentadas; dependen del text encoder del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La modalidad documentada es únicamente imagen a imagen con prompt de texto.

## Casos de uso

- Restyling de fotografías para portfolios: cargar el LoRA sobre "krea2" en ComfyUI, introducir una fotografía y un prompt que active el estilo "void", y obtener una versión estilizada manteniendo la composición original para presentaciones creativas.
- Concept art para preproducción audiovisual: generar variantes estilizadas de bocetos o fotografías de referencia para explorar una dirección artística homogénea antes de producir assets finales.
- Creación de material para redes sociales: transformar imágenes de producto o de marca con una estética consistente, iterando prompts en lote sobre un mismo flujo de ComfyUI.
- Prototipado de identidad visual para clientes: producir varias propuestas estilizadas de un mismo set de imágenes y compararlas en una reunión, reduciendo el coste frente a sesiones de fotografía o ilustración nuevas.
- Assets para videojuegos y narrativa visual: generar variaciones estilizadas de entornos o personajes a partir de referencias reales, para usar como base de texturizado o de guion gráfico.
- Edición de ilustración personal: partir de un dibujo o render propio y aplicar el estilo para obtener una versión alternativa sin rehacer la pieza desde cero.
- Pruebas de estilo en pipelines automatizados: integrar el LoRA en un workflow de ComfyUI ejecutado por API en RunningHub para procesar lotes de imágenes con parámetros fijos de estilo.
- Experimentación e investigación en adaptadores: servir como caso de estudio de un LoRA de estilo de 224 MiB para analizar cómo un adaptador pequeño modifica el comportamiento de un modelo de difusión base, siempre que se documente el checkpoint de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de imagen, fidelidad de edición) ni comparaciones cuantitativas con otros LoRA o con el modelo base sin adaptador, ni ejemplos visuales de entrada y salida.

## Requisitos de hardware

- Tamaño del adaptador: 224 MiB en safetensors, por lo que el peso del LoRA en sí no es un cuello de botella ni de VRAM ni de disco.
- VRAM para inferencia: no disponible. El consumo lo determina íntegramente el modelo base "krea2", cuya arquitectura y tamaño no se especifican en la información proporcionada.
- GPU recomendadas: no disponible por la misma razón; no se puede afirmar si el modelo base cabe en una GPU de consumo sin conocer su tamaño.
- Compatibilidad con GPU de consumo: no se puede confirmar. Depende del modelo base y de la precisión de carga (fp16, fp8, etc.), datos que no se publican.
- Opciones de despliegue: ComfyUI (indicado por el autor), plataforma RunningHub (internacional y china) y carga desde Hugging Face. vLLM, TGI y llama.cpp no son aplicables: son herramientas para modelos de lenguaje y este es un adaptador de difusión para imagen.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia, número de pasos de muestreo ni resolución de trabajo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-krea2-void-style-lora | LoRA de edición de imagen (image-text-to-image) | No disponible (adaptador de 224 MiB) | No especificada, sujeta a la del proyecto original | Hugging Face, ComfyUI, RunningHub |
| krea2 (modelo base sin adaptador) | Modelo de edición/generación de imagen | No disponible | No disponible | Referenciado como "Original" en RunningHub |
| Otros LoRA de estilo comparables | No identificados en la información disponible | No disponible | No disponible | No disponible |

No es posible establecer una comparativa técnica rigurosa: la información proporcionada no identifica el checkpoint base, no publica métricas y no enumera alternativas de la misma categoría. Cualquier comparación de rendimiento o de calidad visual requeriría ejecutar el adaptador sobre el base "krea2" y contrastarlo con otros LoRA de estilo bajo un mismo prompt y flujo de trabajo.

## Limitaciones y advertencias

- Adopción nula: 0 descargas y 0 likes. No existe validación por parte de la comunidad ni informes independientes de calidad.
- Licencia ambigua: la model card no concede una licencia explícita. Indica que los derechos permanecen con el autor y que se debe seguir la licencia del proyecto original o upstream. Antes de cualquier uso comercial hay que verificar la licencia del modelo base "krea2" y contactar con el autor.
- Dependencia total del modelo base: el adaptador no funciona de forma autónoma. Sin el checkpoint "krea2" y sin la versión concreta con la que se entrenó, el resultado puede degradarse o directamente no cargar.
- Estilo no documentado: no se describe qué características visuales define el estilo "void", ni se aportan imágenes de ejemplo, por lo que el usuario no puede anticipar el resultado antes de ejecutarlo.
- Falta de trazabilidad del entrenamiento: no se publican dataset, número de pasos confirmado, resolución, learning rate ni método de regularización. El sufijo `st8000` del fichero sugiere un checkpoint de 8000 pasos, pero no está confirmado.
- Riesgo de sobreajuste y de artefactos: al ser un LoRA de estilo, es probable que fuerce la estética a costa de la fidelidad a la imagen de entrada, aunque no hay datos que cuantifiquen este efecto.
- Sesgos: no documentados. El adaptador heredará los sesgos del modelo base y los del dataset de entrenamiento, que se desconoce.
- Idioma de los prompts: no disponible. El comportamiento multilingüe depende del text encoder del base y no está verificado.
- Sin versionado ni soporte: el repositorio se publicó y actualizó el mismo día (2026-09-26) y no hay indicios de mantenimiento, changelog ni canal de soporte del autor.
- Riesgo para producción: la ausencia de benchmarks, ejemplos y licencia clara lo desaconseja como componente crítico en un pipeline comercial sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-void-style-lora
- README en chino (referenciado en la model card): README_cn.md (dentro del repositorio)
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2073666467010277378
- Página del autor (@十二雪): https://www.runninghub.cn/user-center/2011770127833632769
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API citado en la model card (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Llamada a la API con promoción: https://www.runninghub.ai/call-api
