# RunningHubAI/rh-minimax-h3-ref2va-pruned-zs05-int8-convrot.safetensors-unet

## Resumen

`rh-minimax-h3-ref2va-pruned-zs05-int8-convrot.safetensors-unet` es un artefacto de pesos en formato UNet para generación de vídeo a partir de texto (text-to-video), publicado por el usuario RunningHubAI en Hugging Face. Se distribuye como un único fichero safetensors de aproximadamente 19.999 MiB (unos 21 GB de repositorio) y está pensado para cargarse en ComfyUI o en la plataforma RunningHub. Según la model card, deriva de un modelo base identificado como `minimax-h3`, sobre el que se ha aplicado un proceso de poda (pruning), una cuantización a int8 y una transformación de pesos denotada como "convrot".

El nombre del artefacto codifica varias decisiones de ingeniería: "pruned" indica reducción de parámetros o canales, "zs05" probablemente hace referencia a un factor de poda o de escalado interno, "int8" señala cuantización de pesos a 8 bits y "convrot" sugiere una rotación de pesos orientada a convoluciones. No obstante, la model card no documenta ninguno de estos procedimientos con detalle, ni especifica el número de parámetros, la longitud de contexto, los datos de entrenamiento o los resultados de evaluación.

La relevancia de este repositorio es fundamentalmente práctica: ofrece un UNet de vídeo ya cuantizado y podado, listo para integrarse en flujos de ComfyUI con requisitos de VRAM presumiblemente menores que el modelo original. La ausencia de documentación técnica, de licencia explícita y de benchmarks limita seriamente su uso en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet para difusión text-to-video (derivada de `minimax-h3`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (indicado en el nombre del artefacto); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (UNet, fichero `minimax_h3_ref2va_pruned_zs05_int8_convrot_B.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un UNet de difusión para generación de vídeo, es decir, el componente que predice el ruido dentro de un pipeline de difusión latente para vídeo. El nombre del fichero indica que se ha partido de un modelo `minimax-h3` y se le han aplicado tres transformaciones: poda (reducción de la red), cuantización a int8 (pesos de 8 bits) y una operación de rotación de pesos ("convrot") presumiblemente destinada a preservar la calidad tras la cuantización en capas convolucionales. El sufijo `ref2va` sugiere una variante orientada a referencia imagen/vídeo a vídeo/audio, aunque la model card solo declara el pipeline `text-to-video`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card se limita a indicar el origen (`minimax-h3`), el tamaño del fichero y los enlaces a la plataforma RunningHub. Cualquier afirmación sobre el proceso de entrenamiento o de destilación sería especulativa y no debe asumirse.

## Capacidades

- Generación de vídeo a partir de texto: el pipeline declarado es `text-to-video`, por lo que el UNet se integra en un pipeline de difusión para sintetizar secuencias de vídeo a partir de prompts.
- Integración con ComfyUI: el tag `comfyui` y el formato UNet indican compatibilidad con flujos de trabajo de ComfyUI que cargan modelos de difusión por componentes.
- Ejecución en RunningHub: la model card enlaza explícitamente a la plataforma RunningHub para cargar y ejecutar los pesos.
- Posible condicionamiento por referencia: el sufijo `ref2va` en el nombre sugiere entrada de referencia (imagen o vídeo), aunque no está documentado ni confirmado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de vídeo generativo en ComfyUI: cargar el UNet como componente de un pipeline de difusión para generar clips cortos a partir de prompts de texto, aprovechando la cuantización int8 para reducir requisitos de memoria en comparación con el modelo original.
- Iteración de prompts y estilos visuales: al estar podado y cuantizado, permite ciclos de prueba más rápidos en máquinas de gama alta de consumo, útil para explorar estilos antes de pasar a un modelo de mayor fidelidad.
- Generación de material de previsualización para producción audiovisual: crear storyboards animados o previsiones de escenas que luego se refinan con herramientas de mayor calidad.
- Automatización de contenido para redes sociales: integración en pipelines de ComfyUI orquestados por API para generar clips cortos de forma programática, siempre que se valide la calidad y los derechos de uso.
- Investigación sobre cuantización y poda en modelos de vídeo: el artefacto sirve como caso de estudio de cómo afectan int8 y el pruning a la calidad de generación en un UNet de difusión.
- Despliegue en infraestructura con VRAM limitada: al reducir el peso a ~20 GB en int8, puede ejecutarse en GPUs profesionales de 24-48 GB donde el modelo original no cabría, facilitando pruebas en entornos de laboratorio.
- Evaluación comparativa de variantes: comparar este artefacto con otras variantes del mismo modelo base para medir el impacto de la poda y la cuantización en la coherencia temporal del vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa ~19,5 GiB (19.999 MiB). En int8, la carga del UNet requiere al menos ~20 GB de VRAM solo para los pesos, más memoria para activaciones, latentes de vídeo y el resto del pipeline (VAE, text encoder). En la práctica, se recomienda un mínimo de 24 GB y, preferiblemente, 40-80 GB para secuencias de vídeo de varios frames.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB), RTX A6000 (48 GB). En GPUs de consumo de 24 GB (RTX 3090, RTX 4090) podría caber con offloading parcial a RAM, a costa de latencia.
- ¿Cabe en GPU de consumo? Solo en modelos de 24 GB con estrategias de offloading; en GPUs de 16 GB o menos no es viable sin cuantización adicional o descarga a CPU.
- Opciones de despliegue: ComfyUI (soporte nativo por el tag), plataforma RunningHub (documentada por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para UNets de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-minimax-h3-ref2va-pruned-zs05-int8-convrot | UNet text-to-video (int8, podado) | no disponible | no disponible | no disponible | Hugging Face / RunningHub |
| MiniMax-H3 (modelo base) | Modelo de vídeo original | no disponible | no disponible | no disponible | Referenciado como upstream |
| MiniMax-H3-x-Z-Image-native | Variante del mismo ecosistema | no disponible | no disponible | no disponible | Hugging Face (joeygambino) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, entrenamiento, datos, evaluación ni limitaciones; cualquier uso en producción requiere validación empírica propia.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream, pero no la identifica. No se puede asumir uso comercial sin verificar los términos con el autor original.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales, deformaciones anatómicas y texto ilegible en las escenas.
- Sesgos: no documentados, pero los modelos de difusión de vídeo entrenados con datasets web suelen reproducir sesgos demográficos y culturales.
- Impacto de la poda y la cuantización: el proceso "pruned + int8 + convrot" puede degradar la calidad respecto al modelo base; no se han publicado métricas que cuantifiquen esa pérdida.
- Idiomas: no se especifica qué idiomas aceptan los prompts; probablemente inglés y chino, pero no está confirmado.
- Reproducibilidad: el repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad; conviene tratar los pesos como no auditados.
- Fecha de creación futura (2026-11-04): el metadato del repositorio indica una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o una programación; conviene verificar la integridad del artefacto.
- Dependencia de la plataforma: parte de la documentación y del flujo de ejecución remiten a RunningHub, lo que puede implicar dependencia de un servicio externo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-ref2va-pruned-zs05-int8-convrot.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2091775380674924546
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- Referencia upstream (MiniMax-H3-x-Z-Image-native): https://huggingface.co/joeygambino/MiniMax-H3-x-Z-Image-native/tree/main
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
