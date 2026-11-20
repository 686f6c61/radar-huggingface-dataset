# BH-Language-AI/lumi-vl-8b-cua-merged

## Resumen

LUMI-VL-8B-CUA es un modelo de visión-lenguaje especializado en *computer-use agents* (CUA) y *GUI grounding*, desarrollado por BH-Language-AI. Se construye sobre Qwen/Qwen3.5-VL-8B mediante un adaptador LoRA que posteriormente se fusiona en los pesos, de modo que el resultado es un checkpoint completo en bf16 de aproximadamente 18 GB y 9.409.813.744 parámetros totales. Su tarea central es concreta: dada una captura de pantalla y una instrucción en lenguaje natural, devuelve un punto de pulsación normalizado en el rango 0-1000, serializado como JSON con la forma `{"tool":"tap","args":{"x":512,"y":733}}`.

El interés del modelo reside en su enfoque de entrenamiento en dos etapas y en el salto de rendimiento que consigue sobre el modelo base en ScreenSpot-Pro, un benchmark de localización de elementos en interfaces densas. Según la model card, el modelo base apenas alcanza un 2,5 % de acierto con 1 MP porque produce salidas mayoritariamente no parseables, mientras que el adaptador de etapa 2 con 2 MP llega al 51,25 % en el subconjunto de 400 muestras. En la comparación sobre el servidor desplegado (base en 8 bits más adaptador, 2 MP, 120 muestras) el salto es de 7,5 % a 51,7 %, con cero salidas no parseables frente a 87 de 120 del base.

Es relevante ahora porque la resolución de entrada se confirma como palanca principal en interfaces densas (2 MP supera claramente a 1 MP) y porque el modelo se distribuye ya fusionado, sin necesidad de PEFT, lo que simplifica su integración en pipelines de automatización de escritorio. La información pública disponible, sin embargo, es escasa: no hay datos de benchmarks generales, idiomas declarados ni detalles sobre la composición completa del dataset más allá de las mezclas citadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.5-VL), con adaptador LoRA fusionado en los pesos |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (secuencia de entrenamiento limitada a 2048 tokens en etapa 1 y 3400 en etapa 2) |
| Tipos de cuantización | Entrenamiento en 4-bit NF4 con doble cuantización y cómputo en bf16; pesos publicados en bf16 (~18 GB). No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (el prompt de sistema de entrenamiento está en serbocroata; la model card no declara lista de idiomas) |
| Licencia | other (no se detallan los términos; el modelo base es Qwen/Qwen3.5-VL-8B) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-VL-8B, un transformer multimodal de tipo image-text-to-text, y le superpone un adaptador LoRA con r=64, alpha=128, dropout de 0,05 y 7 módulos de proyección, lo que supone 116,4 M de parámetros entrenables (1,22 % del total). El entrenamiento se hizo en 4-bit NF4 con doble cuantización y cómputo en bf16, optimizador AdamW con scheduler coseno, batch efectivo de 16 (8 de acumulación por 2 GPU) y hardware de 2x NVIDIA L40S.

El proceso consta de dos etapas. La etapa 1 se extendió 6437 pasos con un máximo de 1.048.576 píxeles de entrada, lr de 1e-4 a 1e-5 y tope de secuencia de 2048 tokens. La etapa 2 añadió 1200 pasos con el doble de resolución máxima (2.097.152 píxeles), lr de 5e-5 y tope de secuencia de 3400 tokens. El dataset suma 102.974 muestras de GUI grounding procedentes de mezclas Jedi, UI-Vision y GTA1, con el punto de pulsación en JSON como único objetivo de respuesta. No se documenta RLHF ni DPO. La innovación práctica es doble: el formato de salida estrictamente JSON con coordenadas normalizadas y el uso de resolución alta como variable de entrenamiento explícita, que la propia model card identifica como el factor con mayor impacto en interfaces densas.

## Capacidades

- Localización de elementos de interfaz (*GUI grounding*): recibe una captura de pantalla y una instrucción y devuelve un punto de pulsación normalizado en 0-1000, con la fórmula x/1000*W, y/1000*H.
- Salida estructurada en JSON con esquema fijo (`tool` y `args`), lo que facilita el parseo y la integración en bucles de agente.
- Comprensión de imágenes de alta resolución, hasta 2 MP configurados mediante `image_processor.max_pixels`.
- Soporte de conversación multimodal multi-turno a través de la API de transformers (`AutoProcessor` y `AutoModelForImageTextToText`).
- Capacidades heredadas del modelo base Qwen3.5-VL-8B: no detalladas en la información proporcionada.
- Soporte de *tool calling* genérico más allá del esquema `tap`: no disponible en la documentación.
- Modo *thinking*, visión de documentos, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede recibir capturas de una aplicación en cada paso de un flujo y devolver el punto donde pulsar, lo que permite construir robots de QA que validan pantallas sin selectores DOM ni coordenadas codificadas a mano.
- Agentes de escritorio multiplataforma: con un 51,25 % en ScreenSpot-Pro a 2 MP, es adecuado como componente de localización dentro de un agente que opera sobre Windows, macOS y Linux, siempre con lógica de reintento y verificación posterior.
- Asistencia a usuarios en aplicaciones de ofimática: los resultados por aplicación (eviews 95 %, excel 70 %) lo hacen útil para guiar a personas en hojas de cálculo y herramientas de análisis, donde la densidad de controles es alta.
- Rellenado de formularios y flujos de back-office: la salida JSON normalizada permite encadenar la predicción del modelo con un ejecutor de acciones que convierte las coordenadas a píxeles reales según la resolución de pantalla.
- Soporte remoto asistido: dado un pantallazo enviado por un usuario, el modelo identifica el control relevante para la instrucción y sugiere el punto de interacción, útil en mesas de ayuda con software corporativo heterogéneo.
- Prototipado de agentes CUA en investigación: el checkpoint fusionado en bf16 y la API estándar de transformers permiten evaluar el modelo sin gestionar adaptadores PEFT, lo que reduce la fricción en experimentos de grounding.
- Automatización en herramientas de diseño y edición: con resultados del 46-47 % en blender y davinci, puede emplearse como primer paso de localización en asistentes de edición, complementado con verificación visual.

## Benchmarks y rendimiento

Evaluación en ScreenSpot-Pro (subconjunto reservado de 400 muestras), según la model card:

| Configuración | Precisión |
|---|---|
| Qwen3.5-VL-8B base sin adaptador, 1 MP | 2,5 % (mayoría de salidas no parseables) |
| Adaptador etapa 1, 1 MP | 39,0 % |
| Adaptador etapa 1, 2 MP (n=120) | 45,8 % |
| Adaptador etapa 2, 1 MP | 40,5 % |
| Adaptador etapa 2, 2 MP | 51,25 % |

Desglose por aplicación a 2 MP:

| Aplicación | Precisión |
|---|---|
| eviews | 95 % |
| excel | 70 % |
| android_studio | 49 % |
| blender | 47 % |
| macos_common | 46 % |
| davinci | 46 % |
| windows_common | 45 % |
| linux_common | 45 % |
| autocad | 38 % |

Comparación en el servidor desplegado (base en 8 bits más adaptador, 2 MP, 120 muestras): base 7,5 % frente a adaptador 51,7 %, con 0 salidas no parseables frente a 87 de 120 en el base. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 18-20 GB solo para pesos, más memoria para activaciones y el procesador de imagen; con entradas de 2 MP las activaciones de visión son exigentes.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA L40S (48 GB cada una); para inferencia en bf16 se recomienda una GPU de 24 GB o más, como L40S, A100, H100 o RTX 4090 (24 GB, justa para pesos más overhead).
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB en bf16 con margen limitado; en GPUs de 16 GB requeriría cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: transformers con `AutoProcessor` y `AutoModelForImageTextToText` es la vía documentada; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que subir a 2 MP mejora la precisión, sin cifras de rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUMI-VL-8B-CUA | 9.409.813.744 | no disponible | GUI grounding sobre Qwen3.5-VL-8B con LoRA fusionado | other | Hugging Face, safetensors |
| Qwen3.5-VL-8B (base) | no disponible en la información | no disponible | Vision-language general | no disponible | Hugging Face |
| Otros modelos CUA de grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card únicamente ofrece comparación frente a su propio modelo base en ScreenSpot-Pro: 2,5 % (base, 1 MP), 7,5 % (base en 8 bits, 2 MP) frente a 51,25 % y 51,7 % del adaptador. No se dispone de datos de otros modelos CUA comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento desigual por aplicación: el punto más débil documentado es autocad (38 %), y la propia model card reconoce que faltan datos de alta resolución en dominios especializados como CAD.
- Dependencia fuerte de la resolución: con 1 MP la precisión cae al 40,5 % frente al 51,25 % con 2 MP; usar menos resolución degrada el resultado de forma notable.
- Salida restringida a un único esquema: el modelo está entrenado para devolver solo `{"tool":"tap","args":{"x":...,"y":...}}`; no se documentan otras acciones como arrastrar, escribir o hacer scroll.
- Riesgo de alucinación de coordenadas: al ser un modelo de localización, puede devolver un punto plausible pero incorrecto en interfaces no vistas; en producción conviene verificar el resultado antes de ejecutar la acción.
- Idiomas: no se declara lista de idiomas soportados; el prompt de sistema de entrenamiento está en serbocroata, lo que deja abierta la pregunta sobre el rendimiento con instrucciones en castellano.
- Licencia `other` sin términos detallados en la información disponible: es imprescindible revisar las condiciones del modelo base Qwen3.5-VL-8B y del autor antes de un uso comercial.
- Contexto de entrenamiento limitado (2048 y 3400 tokens de secuencia): no se documenta la ventana de contexto efectiva para conversaciones largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-VL-8B
- Dataset Jedi: no disponible (enlace no proporcionado)
- Dataset UI-Vision: no disponible (enlace no proporcionado)
- Dataset GTA1: no disponible (enlace no proporcionado)
- Benchmark ScreenSpot-Pro: no disponible (enlace no proporcionado)
- Paper, blog o demo del autor: no disponible en la información proporcionada
