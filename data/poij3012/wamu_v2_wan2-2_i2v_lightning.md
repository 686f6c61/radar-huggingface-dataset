# Poij3012/WAMU_v2_WAN2.2_I2V_LIGHTNING

## Resumen

Poij3012/WAMU_v2_WAN2.2_I2V_LIGHTNING es un checkpoint de difusión publicado en Hugging Face para la generación de vídeo a partir de una imagen. El repositorio usa la librería diffusers y declara la clase WanImageToVideoPipeline, con 14.288.901.184 parámetros y un tamaño de 68,9 GB. La model card es la plantilla automática de diffusers y no incluye información sobre autoría, licencia, datos de entrenamiento ni evaluación.

El nombre del modelo y los resultados de búsqueda lo vinculan con Wan 2.2 I2V 14B en su variante Lightning, una familia orientada a inferencia rápida en pocos pasos, aunque la card no confirma esa relación ni documenta el proceso de destilación. Su interés práctico está en la generación local de vídeo condicionada por imagen, un área donde los modelos abiertos de aproximadamente 14B permiten experimentar sin depender de APIs propietarias. No obstante, la ausencia de documentación y de validación comunitaria (0 descargas y 0 likes en el momento de la consulta) exige precaución antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura interna; el tag `diffusers:WanImageToVideoPipeline` indica un modelo de difusión para imagen a vídeo |
| Parámetros totales | 14.288.901.184 (aproximadamente 14,29 mil millones) |
| Parámetros activos | No disponible; no se confirma que sea un modelo MoE |
| Longitud de contexto | No disponible; no aplica al concepto de contexto de un LLM |
| Tipos de cuantización | No disponible en la model card. Los resultados de búsqueda mencionan variantes INT8 y fp8 de Wan 2.2 I2V 14B Lightning, no necesariamente este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tag del repositorio); pesos compatibles con diffusers |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el objetivo de entrenamiento. El tag `diffusers:WanImageToVideoPipeline` indica que el checkpoint se carga mediante la pipeline de diffusers para generar vídeo a partir de una imagen y una descripción textual. El conteo de 14,29 mil millones de parámetros y el tamaño del repositorio, 68,9 GB, son coherentes con un modelo de difusión de vídeo de gran tamaño, pero no permiten confirmar si emplea un transformer, una mezcla de expertos, atención lineal u otra variante.

Los resultados de búsqueda apuntan a que se trata de una variante de Wan 2.2 I2V 14B Lightning. El sufijo Lightning suele indicar una destilación para muestreo en pocos pasos, pero no hay confirmación en la información proporcionada. No se documentan tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se especifican hiperparámetros, hardware de entrenamiento ni proceso de preprocesamiento.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada y una prompt textual, según la pipeline declarada.
- Modelo generativo de vídeo, no un LLM: no se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; se desconoce el comportamiento con prompts en distintos idiomas.
- No se documenta modo de razonamiento (thinking mode), entrada de audio ni otras modalidades.
- No se documentan resolución, duración, tasa de fotogramas, relación de aspecto ni número de pasos de muestreo.
- El sufijo Lightning sugiere inferencia rápida en pocos pasos, pero no hay datos oficiales que lo confirmen para este checkpoint.

## Casos de uso

- Animación de storyboards: usar un fotograma estático como imagen de entrada para generar un clip breve y previsualizar encuadre, ritmo y continuidad antes de producir la escena final. Es adecuado porque la pipeline está diseñada para imagen a vídeo.
- Publicidad y marketing: animar fotografías de producto o ilustraciones para generar piezas de vídeo cortas sin rodaje. El tamaño de 14,29B permite ejecución local si se dispone de hardware suficiente y la licencia lo autoriza.
- Previsualización cinematográfica: convertir concept art o fotogramas de referencia en animáticas para revisar decisiones de dirección y montaje.
- Contenido para redes sociales: generar clips cortos a partir de imágenes fijas para publicaciones o anuncios, con la ventaja de no depender de un servicio externo.
- Videojuegos y prototipado: animar concept art de personajes, entornos o interfaces para evaluar sensación de movimiento antes de invertir en animación tradicional.
- Educación y divulgación: dar movimiento a diagramas, ilustraciones científicas o mapas conceptuales para explicar procesos de forma visual.
- Restauración creativa de fotografías: añadir movimiento sutil a imágenes antiguas o familiares, siempre que se revise manualmente la coherencia temporal y no se atribuya valor documental al resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo como FVD o CLIP score, ni comparaciones con otros modelos. Tampoco hay datos de latencia, throughput ni número de pasos necesarios para la inferencia.

## Requisitos de hardware

- VRAM estimada solo para los pesos, calculada a partir del número de parámetros y no confirmada por el autor: aproximadamente 28,6 GB en fp16, 14,3 GB en INT8/fp8 y 57,2 GB en fp32. Estas cifras no incluyen VAE, codificador de texto, activaciones ni overhead de la pipeline.
- Almacenamiento: el repositorio ocupa 68,9 GB, por lo que se necesita al menos esa capacidad libre, además de espacio temporal durante la descarga y la conversión.
- GPU recomendadas: A100 de 40 u 80 GB, H100 de 80 GB o L40 de 48 GB. Los resultados de búsqueda mencionan una implementación INT8 ejecutada en una L40 de 48 GB.
- GPU de consumo: no se confirma que quepa en una RTX 4090 de 24 GB con la pipeline completa en fp16. Podría intentarse con cuantización INT8/fp8 y offloading, pero no hay documentación oficial que lo garantice.
- Opciones de despliegue: diffusers con `WanImageToVideoPipeline`; los resultados de búsqueda incluyen una interfaz Gradio local, un cuaderno de Google Colab y un Space de Hugging Face con fp8. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo de difusión.
- Latencia y throughput: no disponibles. El sufijo Lightning sugiere pocos pasos de muestreo, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas en la información proporcionada. Los únicos modelos relacionados encontrados son variantes o posibles duplicados del mismo checkpoint, por lo que la comparación es limitada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Poij3012/WAMU_v2_WAN2.2_I2V_LIGHTNING | 14,29 B | No disponible | No disponible | Hugging Face, diffusers, 68,9 GB | Model card automática sin documentación |
| Wan 2.2 I2V 14B (presunto modelo base) | 14 B según el nombre, no verificado | No disponible | No disponible | No verificado en la información | Relación no confirmada por el autor |
| Versión INT8 comunitaria de Wan 2.2 I2V 14B Lightning | 14 B según el nombre, no verificado | No disponible | No disponible | Repositorio GitHub, L40 48 GB | Precuantizada a INT8; no es una comparación oficial |
| d335566/WAMU_v2_WAN2.2_I2V_LIGHTNING y Alejo1706/WAMU_v2_WAN2.2_I2V_LIGHTNING | No disponible | No disponible | No disponible | Hugging Face | Posibles duplicados o mirrors del mismo modelo |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir que el uso comercial esté permitido. Es necesario contactar con el autor o verificar la licencia antes de cualquier despliegue en producción.
- Model card automática: no hay información sobre datos de entrenamiento, sesgos, evaluación de seguridad ni limitaciones conocidas por el autor.
- Riesgo de alucinación visual: en modelos de difusión de vídeo son habituales las incoherencias temporales, el morphing, los artefactos y las violaciones de física básica; este checkpoint no ha sido evaluado públicamente.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. Existen posibles mirrors no oficiales, lo que dificulta confirmar la procedencia y la integridad de los pesos.
- Tamaño elevado: 68,9 GB de repositorio y aproximadamente 14,29B parámetros, con requisitos de VRAM y almacenamiento considerables.
- Idiomas no documentados: se desconoce el rendimiento con prompts en castellano u otras lenguas.
- Sin documentación de seguridad: no se describen filtros, guardarraíles ni recomendaciones de uso responsable; existe riesgo de generar contenido inapropiado si se emplea con prompts maliciosos.
- Posible confusión con el modelo base: la relación con Wan 2.2 I2V 14B Lightning no está confirmada, y el significado exacto de Lightning para este checkpoint no está documentado.

## Enlaces

- [Hugging Face: Poij3012/WAMU_v2_WAN2.2_I2V_LIGHTNING](https://huggingface.co/Poij3012/WAMU_v2_WAN2.2_I2V_LIGHTNING)
- [Posible mirror: d335566/WAMU_v2_WAN2.2_I2V_LIGHTNING](https://huggingface.co/d335566/WAMU_v2_WAN2.2_I2V_LIGHTNING)
- [Posible mirror: Alejo1706/WAMU_v2_WAN2.2_I2V_LIGHTNING](https://huggingface.co/Alejo1706/WAMU_v2_WAN2.2_I2V_LIGHTNING)
- [Cuaderno de Google Colab: WAMU V2 - Wan 2.2 I2V (14B)](https://gist.github.com/45deg/a56f5651ecaa35960d6484db03eb409a)
- [Repositorio GitHub: wan2.2model, interfaz Gradio e INT8](https://github.com/aruniankur/wan2.2model)
- [Hugging Face Space: r3gm/wan2-2-fp8da-aoti-preview](https://huggingface.co/spaces/r3gm/wan2-2-fp8da-aoti-preview)
- [Paper citado en la model card para el cálculo de emisiones: Lacoste et al. (2019)](https://arxiv.org/abs/1910.09700)
