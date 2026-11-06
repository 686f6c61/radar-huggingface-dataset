# jancirnodziewiaty/gemma-4-E2B-it-oQ6e-mtp

## Resumen

gemma-4-E2B-it-oQ6e-mtp es una cuantización mixta del modelo Gemma 4 E2B instruct, publicada por el usuario jancirnodziewiaty en Hugging Face. Se trata de un checkpoint convertido al formato MLX (Apple Silicon) mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta con un promedio efectivo de 7,690 bits por peso. El modelo base es un Gemma 4 de la variante E2B en versión instruct, según se deduce del nombre y de la estructura de pesos.

El checkpoint incluye, además del modelo de lenguaje, módulos de visión (0,167 mil millones de parámetros), audio (0,305 mil millones) y una cabeza MTP (multi-token prediction, 0,078 mil millones). El total de parámetros asciende a 5.104.297.539 según los safetensors, con un tamaño de repositorio de 5,0 GB. La cuantización está pensada para ejecución local en hardware Apple Silicon mediante MLX.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar un modelo multimodal Gemma 4 en Macs con memoria unificada moderada, a costa de una licencia no declarada y de una ausencia total de documentación sobre el modelo base, los datos de entrenamiento o los benchmarks. No hay información publicada sobre el pipeline, los idiomas o la licencia en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio + cabeza MTP), según estructura de pesos; detalles no disponibles |
| Parametros totales | 5.104.297.539 (5,104B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 6-bit grupo 64 (80,4% de pesos), affine 8-bit grupo 64 (8,9%), BF16 (10,6%), I64 (0,005%); promedio 7,690 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repositorio | 5,0 GB (4,639 GiB de pesos) |
| Libreria | mlx |
| Desglose por componente | Lenguaje 4,632B (3,613 GiB); visión 0,167B (0,312 GiB); audio 0,305B (0,568 GiB); cabeza MTP 0,078B (0,147 GiB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por la estructura de pesos publicada se deduce un modelo multimodal con cuatro componentes: un modelo de lenguaje de 4,632 mil millones de parámetros lógicos, un codificador de visión de 0,167 mil millones, un codificador de audio de 0,305 mil millones y una cabeza MTP (multi-token prediction) de 0,078 mil millones. La presencia de una cabeza MTP sugiere soporte para decodificación especulativa o predicción multi-token, aunque no se documenta su funcionamiento.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otros) ni innovaciones técnicas del modelo base. La única información técnica verificable es la relativa al proceso de cuantización: oQ (oMLX v0.7.3) asigna 6 bits a la mayoría de los pesos (80,4%), 8 bits a una fracción menor (8,9%) y mantiene en BF16 el 10,6% restante, presumiblemente capas sensibles como embeddings o normas. El resultado es un checkpoint de 4,639 GiB con un promedio de 7,690 bits por peso.

## Capacidades

- Generación de texto e instrucciones: el sufijo "it" indica una variante ajustada para seguir instrucciones.
- Procesamiento de visión: incluye un módulo de visión de 0,167B parámetros, lo que implica capacidad de entender imágenes.
- Procesamiento de audio: incluye un módulo de audio de 0,305B parámetros, lo que implica capacidad de entender audio.
- Predicción multi-token: la cabeza MTP de 0,078B parámetros sugiere soporte de decodificación multi-token o especulativa.
- Ejecución local en Apple Silicon mediante MLX.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,639 GiB permite cargar el modelo completo en equipos Apple Silicon con 16 GB o más de memoria unificada, usando MLX como runtime.
- Prototipado multimodal en local: al incluir módulos de visión y audio, permite experimentar con entradas de imagen y audio sin depender de servicios en la nube, siempre que el runtime MLX soporte dichos módulos.
- Evaluación de cuantización oQ: sirve como referencia para comparar la calidad de la cuantización mixta de 7,690 bits/peso frente al modelo original en BF16.
- Desarrollo de aplicaciones de escritorio para macOS: la integración con MLX facilita empaquetar el modelo en apps nativas de Apple Silicon con aceleración por GPU y Neural Engine.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite estudiar técnicas de predicción multi-token en un modelo pequeño.
- Pruebas de concepto de asistentes multimodales: combinando texto, visión y audio en un único checkpoint de menos de 5 GB, es adecuado para demos locales sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5 GB para los pesos en el formato cuantizado (4,639 GiB), más overhead de runtime y caché KV; se recomienda un mínimo de 8-16 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es compatible con CUDA de forma nativa.
- Cabe en consumer hardware: sí, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; 16 GB es lo aconsejable para margen con contexto largo y módulos multimodales.
- Opciones de despliegue: MLX (librería mlx), mlx-lm y herramientas compatibles con MLX; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ6e-mtp (este) | 5,104B | no disponible | MLX safetensors (oQ mixta) | no disponible | Hugging Face |
| Gemma 4 E2B-it original (BF16) | ~5,1B (estimado) | no disponible | safetensors | no disponible en esta ficha | Presumiblemente en el hub de Google |
| Otras cuantizaciones GGUF de Gemma 4 E2B | ~5,1B | no disponible | GGUF | depende del publicador | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad frente a alternativas concretas. La comparativa se limita a formato, tamaño y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo Gemma 4 original de Google antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce qué lenguas cubre el modelo base y si la cuantización afecta al rendimiento multilingüe.
- Sin benchmarks: no hay evidencia publicada sobre la degradación de calidad introducida por la cuantización mixta de 7,690 bits/peso.
- Exclusivo de Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD sin reconversión.
- Modelo de comunidad: publicado por un usuario individual, sin verificación oficial de Google ni de los autores de Gemma; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- Fecha de creación anómala (2026-11-02): conviene verificar la integridad y procedencia del checkpoint.
- Sin información sobre tool calling, agentes o razonamiento multi-paso: no se puede garantizar su funcionamiento en pipelines de producción.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ6e-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Gemma 4 (referencia): no disponible en la información proporcionada
- Paper o blog oficial de Gemma 4: no disponible en la información proporcionada
