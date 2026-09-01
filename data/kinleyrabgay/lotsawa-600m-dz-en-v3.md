# kinleyrabgay/lotsawa-600m-dz-en-v3

## Resumen

El modelo `kinleyrabgay/lotsawa-600m-dz-en-v3` es un ajuste fino (fine-tune) del modelo de traducción automática neuronal `facebook/nllb-200-distilled-600M`, especializado en el par de idiomas dzongkha (idioma nacional de Bután) e inglés. Ha sido desarrollado por Kinley Rabgay, un ingeniero de machine learning con actividad activa en GitHub y Hugging Face, y está orientado a un uso práctico en producción diaria más que a la obtención de cifras de benchmark.

El modelo se entrenó sobre 232.489 pares de frases traducidas por humanos, en ambas direcciones (dzongkha→inglés e inglés→dzongkha) como un único modelo. Al partir de la variante destilada de NLLB-200 con 600 millones de parámetros, ofrece un equilibrio entre calidad de traducción y eficiencia computacional, siendo adecuado para entornos con recursos limitados. La licencia MIT permite su uso comercial sin restricciones significativas.

La relevancia de este modelo radica en la escasez de recursos de traducción automática de calidad para el dzongkha, una lengua con pocos hablantes digitales. Este fine-tune aprovecha la cobertura multilingüe de NLLB-200 y la adapta a un dominio específico, mejorando la precisión en contextos reales de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled 600M) |
| Parametros totales | 600 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Dzongkha (dz) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (presumiblemente safetensors o binario de PyTorch) |

## Arquitectura y entrenamiento

El modelo base es `facebook/nllb-200-distilled-600M`, una versión destilada del modelo NLLB-200 de Meta, que emplea una arquitectura transformer encoder-decoder con atención de múltiples cabezas y capas de normalización pre-post. La destilación reduce el tamaño de 54.000 millones de parámetros del modelo original a 600 millones, manteniendo una cobertura de 200 idiomas.

El proceso de ajuste fino se realizó sobre un corpus de 232.489 pares de frases paralelas dzongkha-inglés, traducidas por humanos. El entrenamiento se llevó a cabo en ambas direcciones simultáneamente, lo que permite que un único modelo maneje tanto la traducción dzongkha→inglés como inglés→dzongkha. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que el objetivo es el uso en producción diaria, lo que sugiere una optimización para robustez y fluidez en textos reales.

## Capacidades

- Traducción automática de texto entre dzongkha e inglés en ambas direcciones.
- Generación de texto en formato secuencia a secuencia (text-to-text), compatible con el pipeline de Hugging Face para traducción.
- Manejo de frases y párrafos de longitud moderada, limitado por la ventana de contexto del modelo base (típicamente 512 tokens en NLLB, aunque no confirmado).
- Capacidad multilingüe heredada del modelo base, aunque el fine-tune se centra exclusivamente en el par dzongkha-inglés.
- No se han documentado capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento explícito.

## Casos de uso

- Traducción de documentos oficiales y administrativos: el modelo puede traducir comunicados gubernamentales, formularios y avisos públicos del dzongkha al inglés o viceversa, facilitando la accesibilidad en contextos bilingües de Bután.
- Atención al cliente bilingüe: integrado en sistemas de chat o correo electrónico, permite responder consultas de clientes que escriben en dzongkha o inglés, manteniendo un tono natural y preciso.
- Subtitulado de contenido audiovisual: al traducir diálogos o transcripciones, el modelo puede generar subtítulos en el idioma de destino, útil para plataformas de vídeo locales o internacionales.
- Localización de aplicaciones y sitios web: las cadenas de interfaz pueden traducirse automáticamente, reduciendo el coste de localización manual para mercados de habla dzongkha.
- Asistencia en educación y aprendizaje de idiomas: estudiantes de dzongkha o inglés pueden usar el modelo para practicar traducción, obtener retroalimentación o comprender textos auténticos.
- Procesamiento de contenido generado por usuarios: en redes sociales o foros, el modelo puede traducir publicaciones y comentarios, permitiendo la moderación y el análisis en un idioma común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que el modelo está orientado a "uso en producción diaria" más que a cifras de evaluación, por lo que no se dispone de métricas como BLEU, chrF o COMET para comparar con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 600 millones de parámetros, el modelo requiere aproximadamente 1,2 GB en precisión FP32 y unos 0,6 GB en FP16. Con cuantización a 8 bits, puede reducirse a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16. Modelos como NVIDIA T4, GTX 1660, RTX 2060 o superiores funcionan adecuadamente. Para entrenamiento o fine-tune adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3080, A100, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, como la RTX 3060 o incluso en CPU con cuantización.
- Opciones de despliegue: puede servirse mediante Hugging Face Transformers con PyTorch, o mediante frameworks de inferencia optimizada como vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). También es compatible con la API de Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. En una GPU T4, se espera una latencia de decenas de milisegundos por frase corta, con throughput de cientos de frases por minuto en modo batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Direcciones | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lotsawa-600m-dz-en-v3 (este modelo) | 600M | dz↔en | 232.489 pares | MIT | Hugging Face |
| kinleyrabgay/nllb-200-600M-dzo-eng-30k | 600M | dz→en (presumible) | ~30k pares | No especificada | Hugging Face |
| kinleyrabgay/nllb-200-600M-dzo-eng-300k | 600M | dz→en (presumible) | ~225k pares | No especificada | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M | 200 idiomas | Corpus multilingüe masivo | CC-BY-NC | Hugging Face |

El modelo lotsawa-600m-dz-en-v3 se distingue por entrenarse en ambas direcciones y por su licencia MIT, que permite uso comercial sin restricciones. Los otros modelos del mismo autor parecen estar orientados solo a una dirección y con licencias no especificadas. El modelo base de Facebook tiene una licencia no comercial (CC-BY-NC), lo que limita su uso en producción comercial.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de traducción, puede generar traducciones incorrectas o inventar contenido cuando el texto de entrada es ambiguo o contiene términos fuera del dominio de entrenamiento. No se han documentado evaluaciones de sesgo específicas.
- Limitaciones de contexto: la ventana de contexto del modelo base NLLB-200 distilled es de 512 tokens, lo que limita la traducción de documentos largos. Para textos extensos, es necesario segmentar el contenido.
- Cobertura de idiomas: aunque el modelo base soporta 200 idiomas, el fine-tune solo ha sido entrenado para dzongkha e inglés. El uso con otros idiomas puede degradar significativamente la calidad.
- Riesgo de sobreajuste: el corpus de entrenamiento es relativamente pequeño (232.489 pares) y puede no representar la diversidad de registros y dialectos del dzongkha. El modelo puede fallar en jerga técnica o expresiones coloquiales.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción. Se recomienda validar el modelo con datos propios antes de desplegarlo.
- Dependencia del modelo base: al ser un fine-tune, hereda las limitaciones y sesgos de NLLB-200, que pueden manifestarse en traducciones con errores de género, número o contexto cultural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinleyrabgay/lotsawa-600m-dz-en-v3
- Repositorio GitHub del autor: https://github.com/kinleyrabgay/Lotsawa
- Perfil del autor en Hugging Face: https://huggingface.co/kinleyrabgay
- Modelo base NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Otros modelos del autor: https://huggingface.co/kinleyrabgay/nllb-200-600M-dzo-eng-30k y https://huggingface.co/kinleyrabgay/nllb-200-600M-dzo-eng-300k
