# prithivMLmods/tencent-WeVisOne-VL-2B-GGUF

## Resumen

WeVisOne-VL-2B es un modelo vision-language (VLM) compacto de 2 mil millones de parámetros desarrollado por Tencent WeChat Vision, publicado bajo licencia Apache-2.0. Forma parte de la serie WeVisOne-VL y está construido sobre la arquitectura Qwen3-VL. Su particularidad es que unifica en un único modelo tareas de percepción a nivel de objeto (detección de vocabulario abierto, localización de expresiones referenciales, conteo, point grounding y OCR) con tareas a nivel de píxel (segmentación referencial y alpha matting con prompts), algo habitualmente reservado a modelos especializados.

La versión aquí documentada es la cuantización GGUF publicada por prithivMLmods, que permite ejecutar el modelo con llama.cpp y derivados (Ollama, LM Studio) en hardware de consumo. El modelo emplea predicción estructurada del siguiente token sin razonamiento explícito tipo chain-of-thought, codifica coordenadas normalizadas con tokens dedicados (`<0>` a `<1000>`) y devuelve `None` cuando el objetivo no está presente. Fue entrenado con aproximadamente 100 millones de imágenes anotadas de forma fina mediante un currículo de fine-tuning supervisado en tres etapas seguido de reinforcement learning de tareas mixtas. Su tamaño en BF16 es de unos 4,9 GB, lo que lo hace muy atractivo para despliegues ligeros de visión por ordenador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basado en Qwen3-VL, con decodificador de píxeles de 9,5M-9,6M parámetros |
| Parametros totales | 2.034.787.328 (≈2,03B) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (esta cuantización); original en safetensors/transformers |

## Arquitectura y entrenamiento

WeVisOne-VL-2B se construye sobre Qwen3-VL y añade un decodificador de píxeles ligero de 9,5M-9,6M parámetros que combina características visuales multi-nivel, deformable attention guiada por cajas (box-guided) y predicción densa progresiva para generar alpha mattes a resolución completa. La salida estructurada se realiza mediante predicción del siguiente token: las coordenadas se normalizan y codifican con tokens dedicados del `<0>` al `<1000>`, los tokens `<OBJ>` permiten predicción densa de objetos y el modelo devuelve `None` cuando no hay objetivo presente, evitando falsas detecciones.

El entrenamiento se llevó a cabo con aproximadamente 100 millones de imágenes finamente anotadas, siguiendo un currículo de fine-tuning supervisado en tres etapas y finalizando con reinforcement learning sobre tareas mixtas. No se dispone en la información proporcionada de detalles sobre el número de tokens de texto, la composición exacta del dataset ni el tamaño del proyector multimodal (aunque el archivo mmproj en BF16 ocupa 823 MB).

## Capacidades

- Detección de objetos de vocabulario abierto (open-vocabulary detection)
- Comprensión y localización de expresiones referenciales (referring expression comprehension)
- Conteo de objetos (object counting)
- Point grounding: localización de objetos mediante puntos
- OCR: reconocimiento de texto en imágenes
- Segmentación referencial a nivel de píxel (referring expression segmentation)
- Alpha matting con prompts, generando mattes a resolución completa
- Generación de texto conversacional multimodal (pipeline image-text-to-text)
- Salida estructurada sin necesidad de chain-of-thought explícito
- No se menciona soporte de tool calling, agentes ni capacidades de audio

## Casos de uso

- Catalogación automática de productos en e-commerce: la detección de vocabulario abierto y el conteo permiten identificar y enumerar artículos en fotografías de catálogo sin entrenar detectores específicos por categoría.
- Extracción de texto de documentos y capturas: el módulo de OCR integrado permite digitalizar facturas, formularios o pantallas directamente desde imágenes en pipelines de automatización.
- Edición de imágenes y recorte de sujetos: el alpha matting con prompts genera mattes a resolución completa, útil para eliminar fondos o componer imágenes en flujos de diseño.
- Anotación semi-automática de datasets: la segmentación referencial y las cajas delimitadoras generadas a partir de descripciones en lenguaje natural aceleran la creación de datasets de visión.
- Robótica y vigilancia ligera: el point grounding y la detección en tiempo casi real en hardware modesto (gracias a las cuantizaciones GGUF de ~1,3 GB en Q4_K_M) permiten localizar objetos en flujos de vídeo en dispositivos edge.
- Moderación de contenido: la comprensión de expresiones referenciales permite verificar la presencia o ausencia de elementos concretos en imágenes y devolver `None` de forma fiable cuando el objetivo no existe.
- Accesibilidad: generación de descripciones y localización de elementos en imágenes para lectores de pantalla asistidos por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,1 GB (Q3_K_M) hasta ~4,1 GB (BF16), más 823 MB del proyector multimodal (mmproj) en BF16; con Q4_K_M recomendado, unos 2,1 GB en total.
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM es suficiente para las cuantizaciones Q3-Q5; también es viable su ejecución en CPU dada la vía llama.cpp.
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060, RTX 4090 e incluso portátiles con gráfica integrada (en CPU o con offload parcial).
- Opciones de despliegue: llama.cpp (formato GGUF), paquete Python `wevisone_vl`, Hugging Face Transformers, vLLM y SGLang (para los pesos originales).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas de visión | Licencia | Formato |
|---|---|---|---|---|
| WeVisOne-VL-2B | ≈2B | Detección, grounding, conteo, OCR, segmentación, matting | Apache-2.0 | GGUF, safetensors |
| Qwen3-VL (base de la serie) | Varias tallas | VLM generalista, texto e imagen | Apache-2.0 (según talla) | safetensors, GGUF comunitario |
| Florence-2 (Microsoft) | 0,23B-0,77B | Detección, grounding, OCR, segmentación | MIT | safetensors |

WeVisOne-VL-2B destaca frente a alternativas de tamaño similar por añadir alpha matting con prompts, tarea poco habitual en VLMs compactos, manteniendo un coste de inferencia mínimo.

## Limitaciones y advertencias

- Idioma: la model card declara soporte únicamente para inglés; el rendimiento en castellano no está documentado.
- Sin razonamiento chain-of-thought explícito: no está pensado para razonamiento complejo de múltiples pasos ni como LLM generalista.
- No se han publicado benchmarks comparativos, por lo que la calidad relativa frente a otros VLMs debe validarse empíricamente en cada caso de uso.
- Las cuantizaciones Q3_K_M y Q3_K_L degradan apreciablemente la calidad; se recomiendan Q4_K_M o superiores para tareas de precisión espacial (segmentación, matting).
- Riesgo de alucinación en detecciones: aunque el modelo devuelve `None` para objetivos ausentes, no hay datos publicados sobre su tasa de falsos positivos.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial.
- La cuantización GGUF es una contribución de terceros (prithivMLmods); para producción se recomienda verificar la fidelidad frente a los pesos originales de Tencent.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/prithivMLmods/tencent-WeVisOne-VL-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
