# nauvalwastaken/wav2vec2-large-xlsr-indonesian-onnx

## Resumen

`nauvalwastaken/wav2vec2-large-xlsr-indonesian-onnx` es una exportación a ONNX del modelo `indonesian-nlp/wav2vec2-large-xlsr-indonesian`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con cabecera CTC, especializado en indonesio. Lo publica el usuario nauvalwastaken y su propósito declarado es servir como motor de alineamiento forzado (CTC forced alignment) dentro de la herramienta Tween, que coloca palabras indonesias sobre su audio correspondiente. Los pesos son idénticos a los del modelo original; no hay reentrenamiento ni ajuste fino.

El interés práctico de esta ficha no reside en el modelo lingüístico en sí, sino en el artefacto de despliegue: un grafo ONNX exportado con `torch.onnx.export` (opset 14) y cuantizado dinámicamente a 8 bits con `onnxruntime.quantization.quantize_dynamic`, lo que reduce el peso del repositorio a unos 0,3 GB y permite ejecutar la inferencia sin PyTorch, únicamente con ONNX Runtime.

Es relevante para quienes necesitan alineamiento temporal de transcripciones en indonesio en entornos ligeros (CPU, contenedores pequeños, pipelines de subtitulado) y quieren evitar la dependencia de un stack de deep learning completo. La licencia Apache-2.0 del modelo original se mantiene, lo que facilita el uso comercial. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder transformer) con cabecera CTC |
| Parametros totales | no disponible (el modelo base es "large"; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana de entrada variable por lote) |
| Tipos de cuantizacion | pesos uint8 con cuantizacion dinamica (`quantize_dynamic`) sobre el grafo ONNX |
| Idiomas soportados | indonesio (`id`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, opset 14) |

Detalles de entrada y salida del grafo, según la model card:

| Elemento | Valor |
|---|---|
| Entrada | `input_values`, forma `[batch, samples]`, audio a 16 kHz, media cero y varianza unitaria |
| Salida | `logits`, forma `[batch, frames, 28]` (28 clases de vocabulario CTC) |
| Ficheros auxiliares | `config.json`, `vocab.json`, `preprocessor_config.json` (sin modificar respecto al original) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un Wav2Vec2 de tipo *large* entrenado con el corpus multilingüe XLSR y posteriormente adaptado al indonesio por el equipo de `indonesian-nlp`. La arquitectura combina un extractor de características convolucional que convierte la onda de audio en una secuencia de representaciones latentes, seguido de un encoder de transformers que produce estados contextuales, y una capa lineal final que proyecta a 28 clases CTC (caracteres y símbolo de relleno). El alineamiento se obtiene aplicando la regla de Viterbi sobre la matriz de logits CTC contra la transcripción de referencia.

Sobre el entrenamiento original no se aportan en esta exportación datos de tokens, composición del corpus ni si hubo RLHF o ajuste con DPO; esa información corresponde a la model card del modelo base y no se reproduce aquí. La contribución técnica de este repositorio es exclusivamente la exportación y cuantización: se exporta `Wav2Vec2ForCTC` con `torch.onnx.export` en opset 14 y se aplica cuantización dinámica de pesos a 8 bits sin signo mediante ONNX Runtime, manteniendo intactos los ficheros de configuración y vocabulario. No se documenta ninguna innovación adicional (decodificación especulativa, atención lineal ni variantes híbridas).

## Capacidades

- Reconocimiento automático del habla en indonesio a partir de audio mono a 16 kHz, con salida de logits CTC por fotograma.
- Alineamiento forzado (forced alignment) entre una transcripción y su audio: es el caso de uso declarado por el autor y el que motiva la exportación.
- Decodificación CTC codiciosa o por búsqueda en haz para obtener transcripciones a partir de los logits.
- Integración en pipelines sin PyTorch: la inferencia se ejecuta con ONNX Runtime, lo que simplifica el despliegue en entornos con dependencias mínimas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidad multilingüe limitada al indonesio; no se declaran otros idiomas en la model card.

## Casos de uso

- Alineamiento forzado de subtítulos en indonesio: dado un audio y su transcripción, se obtienen las marcas temporales por palabra aplicando Viterbi sobre los logits CTC; la cuantización a 8 bits permite ejecutarlo en CPU dentro de un servicio de subtitulado.
- Generación de ficheros de subtítulos con sincronización a nivel de palabra: el modelo devuelve 28 clases por fotograma, suficientes para mapear caracteres y reconstruir los límites de cada palabra del texto de referencia.
- Indexación y búsqueda en archivos de audio: alineando transcripciones existentes se pueden crear índices temporales que permitan saltar al fragmento exacto donde se pronuncia un término.
- Herramientas de anotación lingüística: el alineamiento palabra-audio acelera la revisión manual de corpus de habla indonesia y la validación de transcripciones.
- Transcripción ASR básica en indonesio: con decodificación CTC se puede obtener texto a partir de audio, aunque el autor orienta el artefacto al alineamiento y no se publican métricas de calidad de transcripción.
- Despliegue en entornos con recursos limitados: al ser un único fichero ONNX de unos 0,3 GB ejecutable con ONNX Runtime, encaja en contenedores pequeños, funciones serverless o dispositivos de borde donde instalar PyTorch no es viable.
- Preprocesado en pipelines de datos de voz: alinear grandes lotes de audio y transcripción antes de alimentar otros modelos (por ejemplo, sistemas de síntesis o de evaluación de pronunciación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, CER ni comparaciones con otros sistemas, ni para el modelo original ni para la versión ONNX cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,3 GB, por lo que la huella de memoria del grafo cuantizado es del orden de cientos de megabytes; no se publica una cifra oficial de VRAM ni de RAM pico.
- GPU recomendadas: no disponible; el autor no especifica requisitos ni recomienda hardware.
- GPU de consumo: no hay datos publicados. Por el tamaño del artefacto es plausible su ejecución en GPU de consumo, pero no se confirma en la documentación.
- CPU: es el escenario natural de la cuantización dinámica con ONNX Runtime; el modelo está pensado para ejecutarse sin PyTorch.
- Opciones de despliegue: ONNX Runtime (única vía documentada por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| nauvalwastaken/wav2vec2-large-xlsr-indonesian-onnx | no disponible | audio 16 kHz, longitud variable | indonesio | Apache-2.0 | ONNX (uint8) | Exportación cuantizada para ONNX Runtime; orientada a alineamiento |
| indonesian-nlp/wav2vec2-large-xlsr-indonesian | no disponible | audio 16 kHz, longitud variable | indonesio | Apache-2.0 | PyTorch (safetensors/bin, no confirmado) | Modelo base; pesos idénticos, requiere PyTorch |
| Wav2Vec2-Large-XLSR-53 (original de Facebook/Meta) | no disponible | audio 16 kHz, longitud variable | multilingüe (53 idiomas) | Apache-2.0 | PyTorch | Punto de partida del ajuste al indonesio; cobertura multilingüe |

No se dispone de datos de rendimiento comparado (WER/CER) para establecer una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Modelo mono-idioma: solo indonesio; no debe esperarse un comportamiento correcto con otras lenguas.
- La cuantización dinámica a 8 bits puede introducir una degradación de precisión en los logits respecto al modelo original; el autor no publica una evaluación de esa pérdida.
- El artefacto está pensado para alineamiento forzado, no como ASR de producción; no hay métricas de calidad de transcripción que respalden ese uso.
- Riesgo de alucinación inherente a la decodificación CTC: secuencias repetidas o audio ruidoso pueden producir salidas incoherentes; conviene validar el alineamiento en corpus propios.
- Sesgos: no se documentan análisis de sesgo acústico, dialectal ni demográfico para el modelo base ni para esta exportación.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero exige conservar el aviso de licencia y la atribución a los autores originales; la model card pide explícitamente el crédito a los autores del modelo base.
- Dependencia de ONNX Runtime y del opset 14: versiones antiguas del runtime pueden no cargar el grafo.
- El repositorio no registra descargas ni validación por parte de la comunidad; la fecha de creación indicada (2026-11-02) debe contrastarse antes de adoptarlo en producción.
- No se documentan requisitos de preprocesado más allá de la normalización indicada (16 kHz, media cero, varianza unitaria); un audio mal normalizado degradará el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nauvalwastaken/wav2vec2-large-xlsr-indonesian-onnx
- Modelo base: https://huggingface.co/indonesian-nlp/wav2vec2-large-xlsr-indonesian
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
