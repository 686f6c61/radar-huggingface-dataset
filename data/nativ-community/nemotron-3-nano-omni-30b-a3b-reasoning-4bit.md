# nativ-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-4bit

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning-4bit es una versión cuantizada a 4 bits en formato MLX del modelo multimodal nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16, publicada por nativ-community (la model card interna cita mlx-community). Se trata de un modelo de imagen-texto a texto con capacidades declaradas de razonamiento, pensado para ejecutarse en hardware Apple Silicon mediante la librería mlx-vlm.

El modelo base lo desarrolla NVIDIA y sigue la familia Nemotron-3 Nano Omni, con una arquitectura identificada en las etiquetas del repositorio como NemotronH_Nano_Omni_Reasoning_V3 y un total real de 33.015.598.918 parámetros según los pesos en safetensors. La nomenclatura "30B-A3B" del nombre sugiere un diseño de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos, si bien la documentación disponible no confirma este extremo.

Su relevancia actual radica en que permite desplegar un modelo multimodal de razonamiento de gran tamaño en un Mac con memoria unificada, ocupando únicamente 19,7 GB en disco gracias a la cuantización de 4 bits, y en que se distribuye bajo la NVIDIA Open Model Agreement, lo que condiciona su uso comercial. No se dispone de datos de benchmarks, idiomas soportados ni longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH_Nano_Omni_Reasoning_V3 (etiqueta del repositorio); multimodal de imagen-texto a texto, tipo transformer híbrido no detallado |
| Parametros totales | 33.015.598.918 (≈33,0 B), según safetensors |
| Parametros activos | ≈3 B según la nomenclatura "A3B" del nombre; no confirmado en la documentación |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiqueta license: other) |
| Formato de pesos | safetensors en formato MLX |
| Tamano del repositorio | 19,7 GB |
| Libreria de conversion | mlx-vlm 0.4.5 |
| Dataset de entrenamiento del base | nvidia/Nemotron-Image-Training-v3 |
| Modelo base | nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta NemotronH_Nano_Omni_Reasoning_V3 y de la modalidad declarada (imagen-texto a texto). El sufijo "H" y la nomenclatura "A3B" son compatibles con un diseño híbrido de atención y mezcla de expertos con aproximadamente 3.000 millones de parámetros activos, pero esta afirmación no está confirmada en la model card publicada. Tampoco se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto soportada.

En cuanto al entrenamiento, la única información disponible es el dataset asociado al modelo base, nvidia/Nemotron-Image-Training-v3, orientado al entrenamiento de capacidades de imagen. No se documentan el volumen de tokens, la composición del corpus, la existencia de fases de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones como decodificación especulativa o atención lineal. Esta versión concreta es únicamente una conversión de pesos a MLX en 4 bits realizada con mlx-vlm 0.4.5; no implica reentrenamiento ni ajuste adicional.

## Capacidades

- Generación de texto conversacional en formato multimodal de imagen-texto a texto (pipeline declarado: image-text-to-text).
- Comprensión de imágenes: la model card incluye un ejemplo de uso con el prompt "Describe this image", lo que confirma entrada de imagen.
- Razonamiento: el nombre del modelo incorpora el término Reasoning y la etiqueta NemotronH_Nano_Omni_Reasoning_V3, lo que indica que el base está orientado a tareas de razonamiento.
- Ejecución local en Apple Silicon mediante MLX y mlx-vlm, sin necesidad de GPU dedicada ni servicios en la nube.
- Soporte de conversación multi-turno: el repositorio incluye la etiqueta conversational.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque coherente con el nombre Reasoning; no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras modalidades: no disponibles; la única modalidad confirmada es imagen y texto.

## Casos de uso

- Descripción y etiquetado automático de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual, tal y como muestra el ejemplo oficial de la model card, sin enviar los datos a ningún servidor externo.
- Extracción de información de documentos escaneados: al ser un modelo de imagen-texto, permite procesar facturas, formularios o capturas de pantalla y devolver texto estructurado, siempre que la calidad de la cuantización de 4 bits sea suficiente para tareas de OCR fino.
- Asistente de razonamiento sobre material visual en el escritorio: útil para analizar diagramas, gráficos o esquemas técnicos y razonar sobre ellos en un Mac con memoria unificada, evitando costes de API.
- Prototipado de aplicaciones multimodales en Apple Silicon: gracias al formato MLX y a los 19,7 GB del repositorio, permite iterar en local con un modelo de 33.000 millones de parámetros sin infraestructura GPU dedicada.
- Procesamiento de datos sensibles con requisitos de privacidad: sectores como sanidad, legal o banca pueden analizar imágenes de documentos internos manteniendo los datos dentro del dispositivo.
- Accesibilidad: generación de descripciones textuales de imágenes para personas con discapacidad visual, integrable en aplicaciones de escritorio para macOS.
- Análisis de capturas en flujos de soporte técnico: un operador podría adjuntar una captura de pantalla y obtener un diagnóstico textual preliminar, con la ventaja de no depender de conectividad.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de una cuantización de 4 bits frente al modelo base en BF16 en tareas de visión y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba, y tampoco se han encontrado resultados en la búsqueda web realizada. No se dispone por tanto de datos que permitan cuantificar la degradación introducida por la cuantización de 4 bits respecto al modelo base en BF16.

## Requisitos de hardware

- Los pesos en 4 bits ocupan 19,7 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM solo para los pesos, más el espacio adicional para la caché KV y las activaciones.
- Al estar en formato MLX, el despliegue está orientado a Apple Silicon (familias M1, M2, M3 y M4). Un Mac con 32 GB de memoria unificada sería el mínimo razonable; 36 GB o más ofrece margen para contextos largos e imágenes de alta resolución.
- Con 24 GB de memoria unificada (por ejemplo, un Mac de 24 GB) el modelo probablemente no quepa con holgura, dado que los pesos ya consumen 19,7 GB.
- No cabe en GPU de consumo con 8, 12 o 16 GB de VRAM en su formato MLX actual; requeriría una conversión a GGUF u otro formato de cuantización más agresiva para hardware NVIDIA o AMD.
- GPU de datacenter (A100, H100): el repositorio no está pensado para ellas, ya que MLX no soporta CUDA; para esos entornos habría que usar directamente el modelo base en BF16, que exigiría del orden de 66 GB solo en pesos y, por tanto, al menos 80 GB de VRAM.
- Opciones de despliegue: mlx-vlm sobre macOS es la vía documentada, con el comando `python -m mlx_vlm.generate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría. La única referencia directa disponible es el propio modelo base, que no constituye una alternativa sino el origen de esta conversión:

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Contexto |
|---|---|---|---|---|---|
| nativ-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-4bit | ≈33,0 B | MLX (safetensors) | 4 bits | nvidia-open-model-agreement | no disponible |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | ≈33,0 B (mismo base) | safetensors | BF16 | nvidia-open-model-agreement | no disponible |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alucinación: no hay datos publicados sobre la tasa de alucinación ni sobre su comportamiento en tareas de OCR o descripción de imágenes, un terreno donde los modelos multimodales tienden a inventar detalles no presentes en la imagen.
- Cuantización de 4 bits: la pérdida de precisión respecto al base en BF16 no está cuantificada; puede afectar especialmente a tareas de razonamiento largo o de lectura de texto fino en imágenes.
- Idiomas: no se especifica qué idiomas soporta el modelo, por lo que no puede asumirse un rendimiento correcto en castellano sin evaluación previa.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Licencia: se distribuye bajo la NVIDIA Open Model Agreement, que no es una licencia de código abierto aprobada por la OSI. Impone condiciones específicas de uso, obligaciones de atribución y posibles restricciones para determinados usos comerciales; conviene revisar el texto completo antes de integrarlo en un producto.
- Inmadurez del artefacto: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, sin validación por parte de la comunidad.
- Discrepancia de autoría: el identificador del repositorio apunta a nativ-community, mientras que la model card interna menciona mlx-community; conviene verificar la procedencia antes de confiar en los pesos.
- Dependencia de plataforma: el formato MLX limita su uso a Apple Silicon, lo que excluye entornos Linux con GPU NVIDIA o AMD sin una conversión adicional.
- Ausencia de benchmarks: no existe ninguna medición publicada que permita comparar su rendimiento real con otros modelos o con el base.
- Fecha de publicación futura respecto a los formatos habituales (2026-09-26), lo que sugiere que se trata de un artefacto muy reciente y sin historial de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-4bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Dataset asociado: nvidia/Nemotron-Image-Training-v3 (referenciado en las etiquetas del repositorio)
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Libreria de conversion: mlx-vlm, version 0.4.5 (referenciada en la model card)
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a sitios no relacionados (agencias de viaje, instrumentos musicales, tiendas de ropa y fabricantes de puertas).
