# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-i1-GGUF

## Resumen

Esta ficha describe una cuantización GGUF publicada por el usuario mradermacher a partir del modelo symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF (con cuantizaciones de tipo imatrix) de un modelo de la comunidad. El repositorio analizado es la variante i1 (imatrix), aunque el README del autor enumera un catálogo amplio de cuantizaciones estáticas (Q2_K, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, entre otras) y el repositorio asociado de cuantizaciones estáticas.

El nombre del modelo indica 35B de parámetros totales con una nomenclatura "A3B" que, por convención de la familia Qwen, sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token. El dato de parámetros totales confirmado en los safetensors es de 35.505.251.456. El modelo se presenta como "Uncensored", es decir, una variante con el alineamiento de seguridad reducido o eliminado respecto al modelo de partida. La model card del cuantizador indica además que se trata de un modelo con capacidad de visión, aunque los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas.

La relevancia de esta ficha es acotada: se trata de una publicación de cuantización reciente (creada el 16 de septiembre de 2026 según los metadatos), sin descargas ni valoraciones registradas, sin licencia declarada y sin benchmarks publicados. Además, el nombre "Qwen3.6" no corresponde a ninguna versión oficial conocida de la familia Qwen, por lo que debe tratarse como un derivado de la comunidad y no como un lanzamiento oficial de Alibaba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; el sufijo "A3B" del nombre sugiere mezcla de expertos (MoE) con ~3.000 millones de parámetros activos, sin confirmar |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | No disponible (estimación por nomenclatura: ~3.000 millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Según el README del autor: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K. El repositorio i1 incluye además un fichero imatrix de 0,3 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base emplea safetensors con librería transformers |
| Modelo base | symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized |
| Tamaño del repositorio | 49,6 GB |
| Compatibilidad | endpoints_compatible, conversational, imatrix |
| Fecha de creación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación en la información proporcionada. El identificador del modelo incluye el patrón "35B-A3B", que en la familia Qwen designa modelos de mezcla de expertos con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token; sin embargo, esta interpretación es una inferencia a partir de la nomenclatura y no está confirmada por la model card. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras.

Lo único documentado es el proceso de cuantización posterior. El autor del repositorio, mradermacher, aplica cuantizaciones ponderadas mediante ficheros imatrix (importance matrix), una técnica que calibra el error de cuantización por capa usando datos representativos y que suele ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes. El README indica además que el modelo es multimodal ("This is a vision model") y que los ficheros mmproj necesarios para el procesamiento de imágenes, si existen, se encuentran en el repositorio de cuantizaciones estáticas. No se aporta información sobre innovaciones arquitectónicas adicionales como atención lineal, decodificación especulativa o mecanismos híbridos.

## Capacidades

- Generación de texto conversacional: las etiquetas del repositorio incluyen "conversational", lo que indica ajuste para diálogo multi-turno.
- Capacidad multimodal declarada: la model card del cuantizador afirma que se trata de un modelo de visión, con ficheros mmproj en el repositorio estático.
- Razonamiento y generación de código: no confirmado en la información disponible; el nombre de la familia base sugiere capacidades de razonamiento, pero no hay datos verificables.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo de idioma declarado ("en").
- Modo de pensamiento (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Comportamiento "uncensored": el nombre indica una reducción del alineamiento de seguridad, orientada a respuestas sin rechazos automáticos.

## Casos de uso

- Generación de texto creativo sin filtros editoriales: el modelo está etiquetado como "Uncensored", por lo que resulta adecuado para escritura de ficción, narrativa adulta o guiones donde los modelos alineados estándar suelen introducir rechazos. La cuantización Q4_K_M o Q5_K_M permite ejecutarlo en hardware de gama alta de consumo.
- Investigación sobre alineamiento y seguridad: al tratarse de una variante con el alineamiento reducido, sirve como referencia en estudios comparativos sobre comportamiento de modelos desalineados, tasas de rechazo y sesgos emergentes frente a su versión base.
- Evaluación de cuantizaciones: el repositorio ofrece un catálogo amplio de cuantizaciones estáticas e imatrix, lo que lo convierte en un banco de pruebas útil para medir la degradación de perplejidad y calidad entre Q2_K, Q4_K_M y Q6_K sobre un mismo modelo.
- Procesamiento de imágenes con texto: si se descargan los ficheros mmproj del repositorio estático, el modelo podría emplearse en tareas de descripción de imágenes o razonamiento visual, aunque esta capacidad no está verificada con benchmarks.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a la arquitectura MoE con pocos parámetros activos, es viable ejecutarlo en una única GPU de 24 GB en cuantizaciones Q4, con velocidad de generación superior a la de un modelo denso de 35B.
- Prototipado conversacional offline: con llama.cpp, Ollama o LM Studio se puede levantar un asistente conversacional en inglés sin conexión a Internet, útil en entornos con requisitos de privacidad.
- Generación de datos sintéticos para ajuste fino: la variante sin censura puede emplearse para producir corpus de texto que un modelo alineado rechazaría, siempre que se respeten las obligaciones legales aplicables.
- Experimentación con decodificación especulativa: al ser un MoE con activación parcial, encaja bien en configuraciones de draft model + modelo objetivo, aunque no hay datos publicados de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad, y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a páginas del servicio de correo TIM Mail y no guardan relación con el modelo).

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros totales (35,5 B) y del tamaño teórico de cada tipo de cuantización. No son cifras publicadas por el autor.

- VRAM estimada para inferencia:
  - IQ1_S / IQ1_M: en torno a 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / Q2_K: en torno a 9-12 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / Q3_K_M: en torno a 13-16 GB.
  - Q4_K_S / IQ4_XS / Q4_K_M: en torno a 19-22 GB.
  - Q5_K_M: en torno a 23-26 GB.
  - Q6_K: en torno a 27-30 GB.
  - BF16 original: en torno a 71 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 para cuantizaciones Q4_K_M y Q5_K_S.
  - 2 x RTX 3090 / 2 x RTX 4090 para Q6_K o Q5_K_M con contexto largo.
  - A100 40 GB o H100 80 GB para cuantizaciones altas y despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cuantizaciones hasta Q4_K_M en GPUs de 24 GB, y hasta Q3_K_M en GPUs de 16 GB. También es viable en equipos Apple Silicon con memoria unificada de 32 GB o superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y otros frontales compatibles con GGUF. Para servir con vLLM o TGI sería necesario partir del modelo base en safetensors, no de estos ficheros GGUF.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con activación parcial, se espera un throughput notablemente superior al de un modelo denso de 35 B, pero no hay mediciones publicadas.

Nota: el README enumera numerosas cuantizaciones, pero la tabla de ficheros del repositorio i1 solo muestra el fichero imatrix de 0,3 GB, mientras que el tamaño total del repositorio es de 49,6 GB. Conviene verificar qué ficheros están realmente disponibles antes de planificar el despliegue.

## Comparativa con modelos similares

La comparación se realiza a partir de la nomenclatura del modelo y de especificaciones públicas de alternativas conocidas. Los campos del modelo analizado no documentados se marcan como "no disponible"; no se infieren valores.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-i1-GGUF | 35,5 B | No disponible (nomenclatura: ~3 B) | No disponible | No disponible | GGUF en HuggingFace |
| Qwen3-30B-A3B (familia oficial Qwen) | 30,5 B | 3,3 B | 128 K (configuración habitual de la familia) | Apache 2.0 en las variantes oficiales | safetensors y GGUF en HuggingFace |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors y GGUF |
| Qwen2.5-32B (denso) | 32,5 B | 32,5 B (denso) | 128 K | Apache 2.0 (variante base) | safetensors y GGUF |

Advertencia: los datos de los modelos alternativos corresponden a especificaciones públicas conocidas, pero no se ha verificado su comportamiento frente al modelo de esta ficha, que no publica resultados de evaluación. No es posible establecer una comparación de rendimiento real.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier despliegue en producción es obligatorio contactar con el autor o revisar la licencia del modelo base.
- Origen incierto del nombre: "Qwen3.6" no corresponde a ninguna versión oficial conocida de la familia Qwen. Debe tratarse como un derivado de la comunidad sin respaldo del equipo original.
- Modelo "uncensored": la reducción del alineamiento de seguridad implica una mayor probabilidad de generar contenido ofensivo, ilegal, peligroso o factualmente falso. No es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: no hay datos de evaluación que permitan cuantificar este riesgo, y las variantes sin alineamiento suelen mostrar además una menor calibración en la expresión de incertidumbre.
- Sesgos conocidos: no documentados en el repositorio. El idioma declarado es únicamente inglés, por lo que el comportamiento en castellano u otros idiomas no está garantizado.
- Capacidad multimodal sin verificar: la model card afirma que es un modelo de visión, pero los ficheros mmproj no se encuentran en este repositorio y no hay ejemplos de uso publicados.
- Sin benchmarks ni métricas de calidad: no se puede estimar su rendimiento relativo frente a alternativas ni la degradación introducida por las cuantizaciones de menor precisión (IQ1, IQ2, Q2_K).
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de redactar la ficha, lo que reduce la probabilidad de que los problemas estén detectados y documentados por la comunidad.
- Discrepancia en el inventario de ficheros: el README lista decenas de cuantizaciones, pero la tabla de ficheros solo muestra el imatrix de 0,3 GB frente a un tamaño de repositorio declarado de 49,6 GB. Verificar el contenido real antes de descargar.
- Fecha de creación en 2026: el modelo está fechado en septiembre de 2026, posterior al conocimiento de referencia, por lo que no existe documentación externa contrastada sobre su entrenamiento o comportamiento.
- Delimitación de responsabilidad: al estar el alineamiento reducido, el usuario asume la responsabilidad legal y ética del contenido generado, incluidas las obligaciones derivadas del RGPD y de la normativa de servicios digitales si se despliega en la Unión Europea.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-i1-GGUF
- Repositorio de cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized
- Página de resumen del autor sobre este modelo: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

No se han encontrado papers, blogs técnicos, repositorios de código ni demos adicionales asociados a este modelo en la búsqueda web realizada.
