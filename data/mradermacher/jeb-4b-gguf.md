# mradermacher/jeb-4b-GGUF

## Resumen

jeb-4b-GGUF es la versión cuantizada en formato GGUF del modelo szybkie-ai/jeb-4b, publicada por el usuario mradermacher, especializado en la conversión de pesos a GGUF para inferencia local. El modelo base es un transformer de 4.326.350.848 parámetros (unos 4,33 mil millones) etiquetado por su autor con los descriptores "decision-model", "calibration", "system-one" y "structured-output", lo que apunta a un uso orientado a la toma de decisiones y a la generación de salidas estructuradas más que a la generación de texto abierto. Soporta inglés y polaco, y se distribuye bajo licencia Apache 2.0.

El repositorio contiene 14 variantes de cuantización (desde Q2_K, de 2,1 GB, hasta f16, de 8,8 GB) más dos ficheros mmproj (Q8_0 y f16) descritos como "multi-modal supplement", lo que sugiere que el modelo base podría incorporar entrada multimodal, aunque no hay confirmación explícita en la documentación disponible.

Su relevancia práctica es la de permitir ejecutar un modelo de decisión de ~4B en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, algo útil para clasificación, enrutado y extracción de datos estructurados en local. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria constatada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni SSM) |
| Parámetros totales | 4.326.350.848 (~4,33 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; más mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers, llama.cpp) |
| Modelo base | szybkie-ai/jeb-4b |
| Cuantizado por | mradermacher |
| Tipo de cuantización | estática (quantize_version 2, output_tensor_quantised 1, convert_type hf); no se han publicado variantes con imatrix/pesos ponderados |
| Tamaño del repositorio | 41,0 GB |
| Fecha registrada en HuggingFace | creado el 21 de septiembre de 2026, actualizado el 21 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado no detalla si se trata de un transformer denso, un MoE, un modelo híbrido o una SSM, ni especifica el número de capas, cabezas de atención, dimensión oculta o el tamaño de vocabulario. Tampoco se indica la longitud de contexto nativa ni si emplea atención lineal, decodificación especulativa u otra técnica de eficiencia.

Respecto al entrenamiento, la documentación proporcionada no incluye el número de tokens, la composición del dataset, ni si se aplicaron fases de ajuste como SFT, RLHF o DPO. Lo único documentado son los metadatos del proceso de cuantización: cuantización estática con quantize_version 2 y tensor de salida cuantizado, más el aviso de que no existen cuantizaciones ponderadas con imatrix. Los ficheros mmproj incluidos (Q8_0, 0,5 GB; f16, 0,8 GB) se describen como complemento multimodal, lo que constituye la única pista sobre capacidades adicionales del modelo original, pero no se confirma en la información disponible.

## Capacidades

- Salida estructurada: el etiquetado "structured-output" del modelo sugiere generación de JSON u otros formatos rígidos, aunque no se documenta el esquema ni el formato exacto soportado.
- Toma de decisiones y calibración: las etiquetas "decision-model", "calibration" y "system-one" indican un diseño orientado a decidir o puntuar opciones con confianza calibrada, más que a la generación libre de texto.
- Conversación: el repositorio incluye la etiqueta "conversational", lo que apunta a formato de chat multi-turno.
- Multilingüe limitado: soporte declarado de inglés y polaco, sin indicación de otros idiomas.
- Posible capacidad multimodal: la presencia de ficheros mmproj apunta a entrada de imagen en el modelo base, no confirmada en la documentación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Enrutado de peticiones en un sistema multi-agente: el modelo puede actuar como clasificador que decide qué agente o herramienta debe atender una consulta, aprovechando su orientación a "decision-model" y su salida estructurada para devolver una etiqueta o un JSON de enrutado.
- Extracción de campos estructurados: dado un texto libre en inglés o polaco, el modelo puede devolver un objeto JSON con campos predefinidos (por ejemplo, datos de factura o formulario), integrándose en un pipeline ETL sin depender de servicios en la nube.
- Control de calidad y validación: uso del modelo como segundo evaluador que acepta o rechaza la salida de otro modelo, apoyándose en la etiqueta "calibration" para obtener una decisión binaria con umbral ajustable.
- Inferencia en el borde o en portátil: las cuantizaciones Q4_K_M (2,9 GB) y Q4_K_S (2,7 GB) permiten desplegar el modelo en GPU de consumo con 6-8 GB de VRAM o incluso en CPU con llama.cpp, útil para aplicaciones locales que no pueden enviar datos a terceros.
- Triaje de soporte en mercados polaco e inglés: gestión de tickets con clasificación por categoría y prioridad en ambos idiomas, con la salida estructurada alimentando directamente el sistema de ticketing.
- Moderación o filtrado previo: el modelo puede decidir si un contenido cumple una política y devolver un veredicto estructurado, reduciendo el coste frente a modelos de mayor tamaño en tareas de decisión simples.
- Prototipado y evaluación de infraestructura: al ser un modelo pequeño y con múltiples cuantizaciones, sirve para medir latencia y throughput de distintas configuraciones antes de escalar a modelos mayores.
- Generación asistida de datos etiquetados: uso del modelo para preetiquetar conjuntos de datos de decisión en inglés y polaco que después se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye valores de MMLU, HumanEval, GSM8K, ARC ni de ninguna otra evaluación, y el modelo base szybkie-ai/jeb-4b no aparece referenciado con métricas en los resultados de búsqueda obtenidos.

## Requisitos de hardware

Los tamaños de fichero proceden de la tabla de cuantizaciones de la model card. Las cifras de VRAM son estimaciones propias basadas en el tamaño de archivo más una reserva de 0,5 a 2 GB para caché KV y overhead del runtime, y variarán según el contexto configurado y el motor de inferencia.

| Cuantización | Tamaño del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 2,1 GB | ~3 GB |
| Q3_K_S | 2,2 GB | ~3 GB |
| Q3_K_M | 2,4 GB | ~3-4 GB |
| Q3_K_L | 2,6 GB | ~3-4 GB |
| IQ4_XS | 2,7 GB | ~4 GB |
| Q4_K_S | 2,7 GB | ~4 GB |
| Q4_K_M | 2,9 GB | ~4 GB |
| Q5_K_S | 3,2 GB | ~4-5 GB |
| Q5_K_M | 3,3 GB | ~4-5 GB |
| Q6_K | 3,7 GB | ~5 GB |
| Q8_0 | 4,7 GB | ~6 GB |
| f16 | 8,8 GB | ~10 GB |

- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Las variantes Q2_K y Q3_K también son viables en iGPU o en CPU.
- GPU recomendadas: cualquier GPU con 8 GB o más para las cuantizaciones medias (RTX 3070, RTX 4070, RX 7800 XT). No requiere A100 ni H100 salvo despliegues con muchas peticiones concurrentes.
- Complemento multimodal: si se usa la entrada de imagen, hay que sumar el fichero mmproj correspondiente (0,5 GB en Q8_0 o 0,8 GB en f16).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y text-generation-webui. vLLM y TGI no ofrecen soporte nativo completo de GGUF, por lo que para esos motores habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparación se limita a parámetros, licencia, idiomas y disponibilidad. Los datos de los modelos alternativos proceden de información pública general y no se han verificado en la búsqueda asociada a esta ficha.

| Modelo | Parámetros | Idiomas | Licencia | Formato GGUF disponible | Benchmarks comparables |
|---|---|---|---|---|---|
| jeb-4b (este modelo, vía GGUF de mradermacher) | ~4,33 mil millones | en, pl | Apache 2.0 | Sí, 12 cuantizaciones + f16 + mmproj | no disponible |
| Qwen3-4B | ~4 mil millones | multilingüe amplio | Apache 2.0 | Sí, en el ecosistema de la comunidad | no comparable en esta ficha |
| Llama-3.2-3B-Instruct | ~3,2 mil millones | multilingüe | Licencia comunitaria de Llama 3.2 | Sí, en el ecosistema de la comunidad | no comparable en esta ficha |
| Gemma-3-4B-it | ~4 mil millones | multilingüe | Términos de uso de Gemma | Sí, en el ecosistema de la comunidad | no comparable en esta ficha |

La diferencia principal de jeb-4b frente a esas alternativas no está en el tamaño, sino en el enfoque declarado hacia la decisión y la salida estructurada, además de un soporte de idiomas mucho más restringido (solo inglés y polaco). Sin métricas publicadas no es posible afirmar que sea mejor o peor en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada que permita estimar la calidad del modelo en razonamiento, código, matemáticas o fidelidad de la salida estructurada.
- Documentación mínima: se desconoce la arquitectura, el contexto máximo, los datos de entrenamiento y los procesos de alineación, lo que dificulta predecir su comportamiento en producción.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia externa de que las cuantizaciones funcionen correctamente.
- Idiomas restringidos: solo inglés y polaco. No hay soporte declarado de castellano, por lo que su uso en español no está respaldado por el autor.
- Riesgo de alucinación: al no existir evaluaciones, no se puede descartar que el modelo invente contenido, especialmente en tareas de decisión con entradas ambiguas.
- Salida estructurada no garantizada: la etiqueta "structured-output" no implica que el modelo genere JSON válido al 100 %; conviene validar y forzar el esquema con un analizador sintáctico o gramáticas del motor de inferencia.
- Calibración no verificada: aunque el modelo se etiqueta como "calibration", no se aportan curvas de fiabilidad ni métricas de error de calibración.
- Pérdida por cuantización: las variantes Q2_K y Q3_K, según la propia tabla del autor, implican menor calidad; para tareas de decisión fina conviene usar Q4_K_M o superior.
- Restricciones de licencia: el repositorio cuantizado declara Apache 2.0, pero conviene verificar la licencia del modelo base szybkie-ai/jeb-4b y las condiciones de los ficheros mmproj antes de un uso comercial.
- Sin soporte nativo en vLLM o TGI: el formato GGUF limita el despliegue a motores compatibles, lo que puede reducir el throughput en escenarios de alta concurrencia.
- Fecha de publicación inusual: los metadatos indican 2026, lo que conviene tener en cuenta al evaluar la madurez y el mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jeb-4b-GGUF
- Modelo base: https://huggingface.co/szybkie-ai/jeb-4b
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#jeb-4b-GGUF
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
- Búsqueda web: los resultados obtenidos (piliapp.com y sus variantes de selector aleatorio) no guardan relación con el modelo y no aportan información técnica utilizable.
