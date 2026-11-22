# Jundot/Qwen3.8-27B-oQ2.5e-mtp

## Resumen

Qwen3.8-27B-oQ2.5e-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parámetros de tipo vision-language construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), un esquema de cuantización que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una precisión uniforme. El resultado es un checkpoint de 12,8 GB de repositorio que conserva el backbone de lenguaje, el codificador visual y la cabeza de predicción multi-token (MTP).

El modelo base combina capas Gated DeltaNet con capas Gated Attention en un layout híbrido, soporta comprensión de imagen y vídeo, y declara un contexto nativo de 262.144 tokens. La cuantización reduce el peso efectivo a 3,678 bits por peso en el checkpoint completo (3,431 bits/peso solo en el backbone de lenguaje), lo que permite ejecutar un modelo de 27B con capacidades multimodales en hardware Apple Silicon con memoria unificada moderada.

Es relevante ahora porque demuestra que la cuantización extrema por debajo de 4 bits efectivos, con asignación no uniforme y refit de escalas, puede preservar un modelo multimodal grande en un espacio de ~12 GB. La versión actual fue recuantizada el 19 de noviembre de 2026 con un redondeo oQe refinado que reduce el error de cuantización al mismo tamaño y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: capas Gated DeltaNet + Gated Attention, con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo, según model card del autor) |
| Tipos de cuantizacion | Precisión mixta afín: 2, 3, 4, 5, 6 y 8 bits con grupos de 64 o 128; media efectiva de 3,678 bits/peso (checkpoint completo) y 3,431 bits/peso (backbone de lenguaje) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors cuantizados, librería `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 11,535 GB / 10,743 GiB |
| Codificador visual | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 12,771 GB / 11,894 GiB |

Distribución de bits por peso lógico:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Afín 2 bits, grupo 64 | 2,333B | 8,398% | 2,50 |
| Afín 3 bits, grupo 128 | 20,502B | 73,796% | 3,25 |
| Afín 3 bits, grupo 64 | 1,271B | 4,576% | 3,50 |
| Afín 4 bits, grupo 64 | 0,378B | 1,360% | 4,50 |
| Afín 5 bits, grupo 64 | 2,781B | 10,012% | 5,50 |
| Afín 6 bits, grupo 64 | ~0B | 0,001% | 6,50 |
| Afín 8 bits, grupo 64 | ~0B | 0,001% | 8,50 |
| BF16 | 0,516B | 1,857% | 16,00 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea la arquitectura Qwen3.5, un transformer híbrido que intercala capas Gated DeltaNet (mecanismo de atención lineal con estado recurrente) y capas Gated Attention (atención completa con compuertas). Esta combinación busca reducir el coste computacional y de memoria en contextos largos sin renunciar a la calidad de atención completa en las capas donde es necesaria. El checkpoint incluye además un codificador visual para entrada de imagen y vídeo, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa interna y acelera la generación.

Sobre el entrenamiento del modelo base no se dispone de información en los datos proporcionados: no se detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La contribución de esta ficha es la cuantización: oQ2.5e asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras × 512 tokens) y aplica un refit de escala y sesgo por mínimos cuadrados ponderados. La versión actual usa el redondeo oQe refinado de oMLX 0.8.0, que según el autor reduce el error de cuantización al mismo tamaño y velocidad que la versión anterior.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Comprensión de imagen y vídeo mediante el codificador visual incluido en el checkpoint (pipeline `image-text-to-text`).
- Predicción multi-token (MTP) integrada como cabeza auxiliar, orientada a decodificación especulativa y mayor velocidad de generación.
- Contexto largo nativo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades de código y matemáticas: no se especifican en la información disponible, aunque se heredan del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están listados en la model card).

## Casos de uso

- Análisis de documentos largos con imágenes: gracias al contexto de 262.144 tokens y al codificador visual, el modelo puede procesar informes con tablas, gráficos y texto en una sola pasada, útil para auditoría documental y extracción de datos.
- Asistencia sobre vídeo: el soporte de comprensión de vídeo permite resumir grabaciones, generar descripciones o responder preguntas sobre su contenido en flujos de análisis de medios.
- Inferencia local en Apple Silicon: al estar en formato MLX y ocupar ~11,9 GiB, puede desplegarse en Macs con memoria unificada de 16-24 GB, lo que habilita prototipado y uso privado sin GPU dedicada.
- Prototipado de asistentes multimodales: el pipeline `image-text-to-text` y el contexto largo permiten construir asistentes que alternan texto e imágenes en conversaciones multi-turno.
- Evaluación de cuantizaciones: sirve como referencia para medir la degradación de un modelo de 27B multimodal a ~3,7 bits/peso frente al checkpoint BF16 original.
- Generación acelerada con MTP: la cabeza de predicción multi-token permite experimentar con decodificación especulativa para reducir latencia en entornos MLX.
- Investigación en eficiencia de memoria: útil para estudiar el equilibrio entre precisión y huella de memoria en modelos densos multimodales de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de calidad frente al modelo base o a otras cuantizaciones.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~11,9 GiB para los pesos (12,8 GB de repositorio); el consumo real en inferencia es mayor por caché KV, activaciones y contexto, por lo que se recomienda al menos 16 GB de memoria y 24 GB para contextos largos.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada. No es un checkpoint pensado para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con 16-24 GB de memoria unificada; no está orientado a GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: ecosistema MLX (librería `mlx`, herramientas de oMLX). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La inclusión de la cabeza MTP sugiere optimización de velocidad mediante decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ2.5e-mtp | 27,781B | 262.144 | MLX cuantizado (~3,678 bits/peso) | Apache-2.0 | Cuantización mixta con MTP y visión; objetivo Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | BF16 safetensors | Apache-2.0 | Modelo original sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones del mismo base | 27,781B | 262.144 | MLX/GGUF según autor | Apache-2.0 (heredada) | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a ~3,7 bits/peso efectivos puede introducir degradación de calidad frente al modelo BF16, especialmente en tareas sensibles a precisión numérica; el autor no publica métricas de esta pérdida.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a CUDA ni a servidores NVIDIA sin reconversión.
- No se especifican los idiomas soportados, por lo que no puede garantizarse el comportamiento multilingüe sin evaluarlo empíricamente.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en los datos proporcionados.
- El modelo base es multimodal y puede generar descripciones inexactas de imágenes o vídeos; conviene validar sus salidas en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; deben revisarse los términos del checkpoint original Qwen/Qwen3.8-27B.
- La model card indica que la versión actual reemplaza a copias anteriores; usar una copia previa implica mayor error de cuantización.
- Solo 600 descargas y 0 likes en el momento de la consulta: ecosistema de validación reducido, sin evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
