# mradermacher/Huihui-MiniCPM-V-4.6-Thinking-abliterated-GGUF

## Resumen

Este repositorio contiene la versión cuantizada en formato GGUF de Huihui-MiniCPM-V-4.6-Thinking-abliterated, un modelo multimodal de la familia MiniCPM-V al que el proyecto huihui-ai ha aplicado abliteration, una técnica que elimina de los pesos la dirección de rechazo para obtener un modelo sin mecanismos de censura. La conversión a GGUF la firma mradermacher, autor habitual de cuantizaciones estáticas de modelos populares.

Según los pesos safetensors del repositorio de origen, el modelo tiene 752.161.600 parámetros, lo que lo sitúa en la gama ultraligera y permite ejecutarlo en CPU y en GPU de gama baja. El repositorio incluye ficheros de proyector multimodal (mmproj en Q8_0 y f16), necesarios para que el modelo procese imágenes, además de trece cuantizaciones del modelo de lenguaje.

Su relevancia actual radica en dos factores: por un lado, permite inferencia multimodal completamente local en hardware muy modesto; por otro, es una pieza útil para investigación en alineación y seguridad, ya que permite comparar el comportamiento de un modelo alineado con su variante abliterada bajo la misma arquitectura y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal (componente de lenguaje + torre de visión con proyector mmproj). Detalles internos (número de capas, tipo de atención) no disponibles |
| Parámetros totales | 752.161.600 (≈0,75 B), según safetensors del repositorio de origen |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores mmproj-Q8_0 y mmproj-f16. Existe además una variante con cuantización ponderada/imatrix en el repositorio i1-GGUF |
| Idiomas soportados | Inglés (etiqueta `en`); no se confirma soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de origen en safetensors, `library_name: transformers`) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición interna del modelo. Por las etiquetas del repositorio (`minicpm-v`, `multimodal`) y por la presencia de ficheros `mmproj` (0,8 GB en Q8_0 y 1,2 GB en f16), se deduce una arquitectura visión-lenguaje con un componente de lenguaje y una torre de visión separada unida mediante proyector, que es el patrón habitual de la familia MiniCPM-V. No hay datos publicados aquí sobre número de capas, dimensión de embeddings, mecanismo de atención ni tamaño del codificador visual.

El entrenamiento original corresponde al modelo MiniCPM-V 4.6 Thinking y no se documenta en esta ficha. Lo que sí se conoce es la intervención posterior: huihui-ai aplicó abliteration sobre el modelo base, un procedimiento que identifica en el espacio de activaciones la dirección asociada a las respuestas de rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de activar comportamientos de negativa. Esta variante cuantizada no añade entrenamiento adicional; solo transforma el formato de los pesos mediante cuantización estática (los ficheros `output_tensor_quantised: 1` y `quantize_version: 2` de la model card así lo indican) e incorpora el proyector multimodal.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito heredado de la variante Thinking.
- Procesamiento de imágenes: descripción, respuesta a preguntas visuales y conversación multimodal, empleando los ficheros mmproj.
- Conversación multiturno con historial, etiquetada como `conversational`.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Comportamiento sin rechazo: al estar abliterado, no aplica filtros de negativa ante peticiones que un modelo alineado rechazaría.
- Capacidades de tool calling, function calling y uso como agente: no disponibles en la información proporcionada.
- Soporte de audio, vídeo o generación de imágenes: no disponible.
- Idiomas distintos del inglés: no disponibles.

## Casos de uso

- Prototipado local de asistentes de visión: con 0,6 GB en Q4_K_M más el proyector mmproj, se puede montar un asistente que describa imágenes en un portátil o incluso en una Raspberry Pi, sin depender de APIs externas.
- Investigación en alineación y seguridad: comparar las respuestas de este modelo abliterado con las del MiniCPM-V original permite estudiar de forma empírica qué comportamientos cambian tras eliminar la dirección de rechazo, con la misma arquitectura y licencia.
- Red-teaming y evaluación de jailbreaks: al carecer de mecanismos de negativa, sirve como referencia de "suelo" para medir cuánto de un comportamiento considerado inseguro proviene del modelo base y cuánto de las capas de alineación.
- Etiquetado y clasificación de imágenes en pipelines por lotes: el reducido tamaño permite procesar volúmenes altos de imágenes por hora en una sola GPU de gama media, con el coste de una precisión inferior a la de modelos de visión de mayor tamaño.
- Generación de texto alternativo accesible sin conexión: aplicaciones de escritorio o móviles que necesitan describir imágenes sin enviar datos a la nube, útil cuando hay requisitos de privacidad o conectividad limitada.
- Experimentación educativa con modelos multimodales: el tamaño (menos de 2 GB en Q8_0 con proyector) permite que estudiantes ejecuten y modifiquen un VLM completo en equipos corrientes.
- Destilación y fine-tuning de investigación: al ser un modelo pequeño y con licencia permisiva, es un candidato habitual como alumno en experimentos de destilación o como base para adaptaciones de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): Q2_K ≈0,5 GB; Q3_K_S ≈0,5 GB; Q4_K_S e IQ4_XS ≈0,6 GB; Q4_K_M ≈0,6 GB; Q5_K_M ≈0,7 GB; Q6_K ≈0,7 GB; Q8_0 ≈0,9 GB; f16 ≈1,6 GB. Hay que sumar el proyector: mmproj-Q8_0 ≈0,8 GB o mmproj-f16 ≈1,2 GB.
- Configuración típica recomendada: Q4_K_M + mmproj-Q8_0, con un total aproximado de 1,4 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluida la gama de entrada (GTX 1650, RTX 3050, RTX 4060). Modelos como A100, H100 o RTX 4090 están sobredimensionados para este tamaño, aunque permitirían lotes grandes y alta concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las actuales y en muchas integradas con memoria compartida asignada. También es viable en CPU con 4 GB de RAM o más, y en placas como Raspberry Pi 5 de 8 GB en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con el parámetro `--mmproj` apuntando al fichero de proyector; Ollama mediante un Modelfile que referencie el GGUF y el mmproj; LM Studio y koboldcpp para uso de escritorio. vLLM y TGI no están pensados para GGUF, por lo que para esos motores habría que usar el modelo original en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (GGUF de Huihui-MiniCPM-V-4.6-Thinking-abliterated) | 752.161.600 | No disponible | Sí (mmproj) | Apache 2.0 | GGUF |
| huihui-ai/Huihui-MiniCPM-V-4.6-Thinking-abliterated (origen) | 752.161.600 | No disponible | Sí | Apache 2.0 | safetensors |
| mradermacher/Huihui-MiniCPM-V-4.6-Thinking-abliterated-i1-GGUF | 752.161.600 | No disponible | Sí (mmproj) | Apache 2.0 | GGUF (imatrix) |
| Otros VLM pequeños de la competencia (por ejemplo, alternativas de 0,5-4 B) | No disponible | No disponible | Sí | Variable | Variable |

No se dispone de datos de rendimiento comparado, por lo que no es posible establecer qué modelo de la categoría rinde mejor en tareas concretas.

## Limitaciones y advertencias

- Modelo abliterado: no aplica rechazos ni filtros de seguridad. Puede generar contenido dañino, ilegal o explícitamente sensible, y no debe desplegarse en aplicaciones orientadas al público general sin una capa de moderación externa.
- Tamaño muy reducido (0,75 B de parámetros): la tasa de alucinación es previsiblemente alta y la profundidad de razonamiento, limitada en comparación con modelos de 7 B o más.
- Precisión de las cuantizaciones bajas: Q2_K, Q3_K_S, Q3_K_M y Q3_K_L degradan la calidad; la propia model card marca Q3_K_M como "lower quality".
- Idiomas: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Visión: la resolución efectiva, el soporte de OCR y el detalle de las descripciones no están documentados; en modelos de este tamaño suelen ser capacidades frágiles.
- Contexto: se desconoce la longitud de ventana soportada; no se debe asumir un contexto largo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre citando avisos de copyright y el estado de cambios. La responsabilidad sobre el contenido generado recae en el desplegador.
- Metadatos de fecha: el repositorio figura creado el 2026-05-16 y actualizado el 2026-10-06, fechas que conviene verificar antes de citarlas.
- Procedencia de los pesos: el modelo base no incluye documentación de datos de entrenamiento ni evaluaciones en este repositorio, lo que dificulta auditar sesgos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-MiniCPM-V-4.6-Thinking-abliterated-GGUF
- Modelo base (abliterado): https://huggingface.co/huihui-ai/Huihui-MiniCPM-V-4.6-Thinking-abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Huihui-MiniCPM-V-4.6-Thinking-abliterated-i1-GGUF
- Página resumen de descargas del autor: https://hf.tst.eu/model#Huihui-MiniCPM-V-4.6-Thinking-abliterated-GGUF
- Guía de uso de GGUF y ficheros multiparte (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura de cuantización: https://www.nethype.de/
