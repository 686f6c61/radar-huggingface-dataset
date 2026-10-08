# mradermacher/ChineseErrorCorrector2_7b_DoCurement-GGUF

## Resumen

Esta ficha describe `mradermacher/ChineseErrorCorrector2_7b_DoCurement-GGUF`, una colección de cuantizaciones en formato GGUF generadas por mradermacher (nethype GmbH) a partir del modelo `HMonKY/ChineseErrorCorrector2_7b_DoCurement`. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada del modelo base original: el trabajo de mradermacher consiste exclusivamente en convertir los pesos a GGUF y publicar distintas variantes de precisión para facilitar su ejecución en hardware de consumo mediante llama.cpp y derivados.

El modelo base cuenta con 7.615.616.512 parámetros reales (según los archivos safetensors), lo que lo sitúa en la categoría de 7B. Por el nombre, `ChineseErrorCorrector2_7b_DoCurement` parece un ajuste fino orientado a la corrección de errores en texto chino, presumiblemente sobre documentos, aunque la información proporcionada no incluye la model card del modelo original ni detalles sobre su arquitectura, entrenamiento o datos.

Su relevancia práctica es doble: por un lado, ofrece una vía sencilla para desplegar localmente una tarea especializada (corrección de texto en chino) sin depender de APIs; por otro, el repositorio publica doce niveles de cuantización que van desde 3,1 GB hasta 15,3 GB, lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. La licencia no está declarada en la información disponible, un punto que debe resolverse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y el recuento de parametros sugieren un transformer decoder de ~7,6 B, sin confirmar) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (variantes i1/imatrix en repositorio aparte) |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara (13 idiomas declarados) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base esta en safetensors, 7.615.616.512 parametros) |
| Modelo base | HMonKY/ChineseErrorCorrector2_7b_DoCurement |
| Repositorio | mradermacher/ChineseErrorCorrector2_7b_DoCurement-GGUF |
| Tamano del repo | 68,1 GB (suma de todas las cuantizaciones publicadas) |
| Descargas / likes | 306 descargas, 0 likes |
| Fecha de creacion | 2025-04-25 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de técnicas como RLHF, DPO o decodificación especulativa. Tampoco se documenta si el modelo base emplea atención lineal, mezcla de expertos o alguna innovación concreta. El repositorio aquí descrito es una cuantización, no un entrenamiento: mradermacher no modifica los pesos más allá del proceso de cuantización (los comentarios internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`).

Lo único verificable es el recuento de parámetros (7.615.616.512) y la existencia de dos familias de cuantizaciones: las "static quants" de este repositorio y las "weighted/imatrix quants" publicadas en `mradermacher/ChineseErrorCorrector2_7b_DoCurement-i1-GGUF`, que según el autor suelen ofrecer mejor calidad que las estáticas de tamaño equivalente. El sufijo "DoCurement" del nombre sugiere un ajuste orientado a documentos, pero esto es una inferencia a partir del nombre y no un dato confirmado por la documentación disponible.

## Capacidades

- Generación y corrección de texto en chino: el nombre del modelo base apunta a una especialización en detección y corrección de errores (ortográficos, tipográficos o de otro tipo) en texto chino.
- Cobertura multilingüe declarada de 13 idiomas: chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe. No se especifica si todos ellos tienen el mismo nivel de calidad o si la lista proviene únicamente del tokenizador del modelo base.
- Formato conversacional: la etiqueta `conversational` indica que el modelo está preparado para interacción tipo chat mediante plantilla de mensajes.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` señala que puede servirse a través de infraestructura de inferencia compatible con la API de HuggingFace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Capacidades de código y matemáticas: no disponible.

## Casos de uso

- Corrección de documentos en chino: el escenario natural del modelo es recibir un texto en chino con errores y devolver una versión corregida, integrándose en un pipeline de edición previa a la publicación. Es el uso que sugiere el propio nombre del modelo base.
- Limpieza de texto procedente de OCR: los pipelines de digitalización de documentos chinos generan errores sistemáticos de reconocimiento; un modelo especializado en corrección puede normalizar esas salidas antes de indexarlas o archivarlas.
- Posprocesado de transcripciones ASR: las transcripciones automáticas de audio en chino contienen errores de homófonos y segmentación; el modelo puede actuar como capa de corrección posterior al motor de reconocimiento de voz.
- Preparación de corpus para entrenamiento: antes de usar un corpus chino para entrenar o ajustar otros modelos, puede pasarse por este modelo para reducir ruido y errores tipográficos.
- Normalización de texto de entrada en sistemas de atención al cliente: mensajes de usuario con erratas o abreviaturas pueden corregirse antes de pasarlos a un clasificador de intenciones o a un motor de búsqueda interno.
- Revisión de subtítulos y traducciones: dado el soporte declarado de 13 idiomas, podría emplearse para revisar texto multilingüe, aunque no hay evidencia publicada de su calidad fuera del chino.
- Despliegue en local con recursos limitados: al existir cuantizaciones desde 3,1 GB (Q2_K) hasta 4,8 GB (Q4_K_M), es viable ejecutarlo en un portátil con GPU modesta o incluso en CPU para procesamiento por lotes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de corrección de errores (por ejemplo, precisión sobre conjuntos como SIGHAN o CSC). Tampoco se aportan comparaciones cuantitativas con el modelo base en precisión f16.

## Requisitos de hardware

Las estimaciones de VRAM se derivan del tamaño de los archivos GGUF publicados más un margen para caché KV y overhead del runtime; son aproximadas y dependen de la longitud de contexto utilizada.

- VRAM estimada por cuantización:
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,6-4,2 GB): ~5 GB de VRAM.
  - IQ4_XS (4,4 GB): ~5,5 GB.
  - Q4_K_S / Q4_K_M (4,6-4,8 GB): ~6 GB de VRAM; el autor los marca como "fast, recommended".
  - Q5_K_S / Q5_K_M (5,4-5,5 GB): ~7 GB de VRAM.
  - Q6_K (6,4 GB): ~8 GB de VRAM; el autor lo describe como "very good quality".
  - Q8_0 (8,2 GB): ~10 GB de VRAM.
  - f16 (15,3 GB): ~17 GB de VRAM; el autor lo considera "overkill".
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 (24 GB) y GPUs de datacenter como A100 o H100 para lotes grandes o contexto largo. Cualquier GPU con 8 GB o más puede ejecutar las cuantizaciones de 4 bits.
- Viabilidad en GPU de consumo: sí. Las cuantizaciones Q4_K_M y Q4_K_S (4,8 y 4,6 GB) caben en GPUs de 8 GB; las variantes Q6_K y Q8_0 requieren 10-12 GB. Las versiones Q2_K y Q3_K pueden ejecutarse incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No hay datos de benchmarks ni de rendimiento en la información proporcionada que permitan una comparación cuantitativa con alternativas. A continuación se compara únicamente lo verificable dentro del propio ecosistema del modelo.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/ChineseErrorCorrector2_7b_DoCurement-GGUF | ~7,6 B | GGUF | 12 variantes estaticas (Q2_K a f16) | no disponible | Objeto de esta ficha; cuantizacion estatica |
| mradermacher/ChineseErrorCorrector2_7b_DoCurement-i1-GGUF | ~7,6 B | GGUF | Variantes weighted/imatrix | no disponible | Mismo modelo base; el autor indica que las imatrix suelen superar a las estaticas de tamano similar |
| HMonKY/ChineseErrorCorrector2_7b_DoCurement | ~7,6 B | safetensors | No aplica (precision completa) | no disponible | Modelo base original; requerido para vLLM o TGI |

Comparativa con modelos de corrección de errores en chino de otros autores: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio GGUF ni la información disponible indican la licencia del modelo base. Sin este dato no puede asumirse uso comercial permitido; es imprescindible consultar la página de `HMonKY/ChineseErrorCorrector2_7b_DoCurement` antes de desplegarlo en producción.
- Sesgos conocidos: no disponible. Al ser un ajuste especializado en chino, es probable que su rendimiento esté fuertemente sesgado hacia ese idioma, pero no hay documentación que lo confirme.
- Riesgo de alucinación: no cuantificado. En tareas de corrección de texto, el riesgo típico es que el modelo reescriba fragmentos correctos o introduzca contenido no presente en el original; no hay evaluación publicada que mida esta tasa.
- Alcance multilingüe incierto: aunque se declaran 13 idiomas, el nombre del modelo sugiere especialización en chino. No hay evidencia de calidad en el resto de idiomas listados, que podrían provenir simplemente del vocabulario del modelo base.
- Longitud de contexto desconocida: al no documentarse, no puede garantizarse el procesamiento de documentos largos de una sola pasada ni planificar el consumo de memoria de la caché KV.
- Naturaleza del repositorio: es una cuantización de terceros. Cualquier pérdida de calidad respecto al modelo base en precisión completa es responsabilidad del proceso de cuantización, y el autor no publica métricas comparativas entre variantes.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la calidad; el propio autor etiqueta Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Sin datos de benchmarks: no es posible verificar afirmaciones de rendimiento frente a alternativas ni estimar la tasa de corrección real sobre textos chinos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChineseErrorCorrector2_7b_DoCurement-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/ChineseErrorCorrector2_7b_DoCurement-i1-GGUF
- Modelo base: https://huggingface.co/HMonKY/ChineseErrorCorrector2_7b_DoCurement
- Página resumen del autor para este modelo: https://hf.tst.eu/model#ChineseErrorCorrector2_7b_DoCurement-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
