# mradermacher/Abomination-t1-123b-GGUF

## Resumen

Abomination-t1-123b-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo base bruhzair/Abomination-t1-123b, un merge de modelos de aproximadamente 122.000 millones de parámetros construido con mergekit. El trabajo de cuantización lo realiza mradermacher, un actor conocido en la comunidad por producir versiones GGUF de modelos abiertos, tanto estáticas como ponderadas con imatrix. Este repositorio concreto contiene únicamente los quants estáticos; las versiones imatrix se publican en un repositorio separado (Abomination-t1-123b-i1-GGUF).

El modelo base es un merge de tipo "frankenmerge" o model merge, del que no se dispone de información detallada sobre la composición, los modelos de origen ni los datos de entrenamiento, ya que la model card del repositorio cuantizado se limita a indicar la procedencia y los ficheros disponibles. La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño en infraestructura local mediante llama.cpp y derivados, con opciones que van desde los 45,3 GB del Q2_K hasta los 130,4 GB del Q8_0.

El modelo está etiquetado para uso conversacional y en inglés, y no declara licencia en la información disponible. Con solo 6 descargas y 0 likes en el momento de la consulta, se trata de una publicación de nicho orientada a usuarios que necesitan quants de un merge concreto para experimentación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base es un merge de modelos; arquitectura subyacente no especificada) |
| Parametros totales | 122.610.069.504 (aproximadamente 122,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (quants del repositorio); el modelo base se distribuye presumiblemente en safetensors para transformers |
| Tamano del repo | 832,2 GB |
| Modelo base | bruhzair/Abomination-t1-123b |
| Libreria declarada | transformers |
| Etiquetas | mergekit, merge, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base bruhzair/Abomination-t1-123b más allá de las etiquetas mergekit y merge, que indican que se trata de un modelo resultante de la fusión de otros modelos mediante la herramienta mergekit. No se especifica si la fusión es de tipo lineal, SLERP, TIES, DARE, passthrough o frankenmerge, ni los modelos de origen, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica (atención lineal, decodificación especulativa, etc.) en la información proporcionada.

La contribución concreta de este repositorio es la cuantización: mradermacher aplica el pipeline de conversión a GGUF (convert_type hf, quantize_version 2, output_tensor_quantised 1) para generar quants estáticos a partir de los pesos del modelo base. Los quants de tipo K (Q2_K a Q6_K) y Q8_0 siguen las implementaciones estándar de llama.cpp; las versiones ponderadas con imatrix, que suelen ofrecer mejor calidad por tamaño, se publican por separado. La model card enlaza además a documentación externa sobre la comparación de perplejidad entre tipos de cuantización.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como conversational y base, orientado a diálogo multi-turno.
- Idiomas: soporte declarado únicamente para inglés; no se documentan otras lenguas.
- Razonamiento y conocimiento general: no disponible (no hay benchmarks ni descripción de capacidades específicas).
- Código y matemáticas: no disponible (no se documenta soporte específico).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no disponible.
- Ejecución local mediante llama.cpp y derivados: sí, gracias a los quants GGUF publicados.

## Casos de uso

- Experimentación local con modelos de gran tamaño: los quants Q2_K (45,3 GB) y Q3_K_S (52,9 GB) permiten probar un modelo de 122,6 mil millones de parámetros en estaciones con VRAM o RAM unificada limitada, usando llama.cpp con offload parcial a CPU.
- Despliegue en servidores con GPU de 80 GB: el Q4_K_S (69,7 GB) y el Q4_K_M (73,3 GB) caben en una A100 80 GB o H100 80 GB, permitiendo servir inferencia conversacional en inglés con latencia razonable.
- Evaluación comparativa de técnicas de cuantización: al existir quants estáticos e imatrix del mismo modelo base, es posible medir diferencias de perplejidad y calidad entre Q4_K_M, IQ4_XS y las variantes i1, útil para investigación sobre compresión de modelos.
- Generación de texto en inglés para prototipos: el modelo está etiquetado como conversational, por lo que puede usarse en demos de chatbots o asistentes internos en inglés, siempre que se acepte la ausencia de licencia clara.
- Investigación sobre model merging: permite estudiar el comportamiento de un merge de 122B parámetros cuantizado, comparando su salida con los modelos de origen si se identifican.
- Uso con endpoints compatibles: la etiqueta endpoints_compatible sugiere que los ficheros pueden servirse mediante infraestructura compatible con la API de Hugging Face, facilitando pruebas de integración.
- Pipeline de evaluación de alucinaciones: al no haber benchmarks publicados, este modelo puede servir como caso de estudio para medir la fiabilidad de merges no evaluados en tareas de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada por cuantización (tamaño de fichero, sin contar overhead de contexto):
  - Q2_K: 45,3 GB
  - Q3_K_S: 52,9 GB; Q3_K_M: 59,2 GB; Q3_K_L: 64,7 GB
  - IQ4_XS: 66,1 GB; Q4_K_S: 69,7 GB; Q4_K_M: 73,3 GB
  - Q5_K_S: 84,5 GB; Q5_K_M: 86,6 GB
  - Q6_K: 100,7 GB
  - Q8_0: 130,4 GB
- GPU recomendadas: A100 80 GB o H100 80 GB para los quants Q4 (cabrían con margen ajustado para contexto); Q5 y Q6 requieren configuraciones multi-GPU o RAM del sistema; Q8_0 requiere al menos 130 GB de memoria combinada.
- Consumer GPU: ningún quant cabe en una RTX 4090 (24 GB) ni en GPUs de 48 GB. Es posible ejecutar Q2_K o Q3_K_S con offload parcial a CPU usando llama.cpp, a costa de latencia elevada.
- Opciones de despliegue: llama.cpp, Ollama (si acepta el formato GGUF multi-parte), y servidores compatibles con la API de Hugging Face (etiqueta endpoints_compatible). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. Con 122,6B parámetros, incluso en A100 80 GB se espera un throughput bajo en comparación con modelos de 7B-13B, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abomination-t1-123b-GGUF | ~122,6B | no disponible | GGUF | no disponible | Hugging Face (6 descargas) |
| Modelos de ~120B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de tamaño comparable con datos verificables en la información proporcionada; la comparativa se limita a indicar la ausencia de datos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o tasas de alucinación; el modelo no ha sido evaluado públicamente.
- Idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Origen opaco: al ser un merge sin documentación de los modelos de origen, no se pueden evaluar sesgos heredados ni restricciones de licencia de los componentes.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks no es posible cuantificarlo.
- Tamaño prohibitivo: 122,6B parámetros implican requisitos de hardware elevados; los quants de menor tamaño (Q2_K, Q3_K_S) degradan la calidad de forma significativa.
- Ficheros multi-parte: los quants Q3 en adelante están divididos en 2 o 3 partes, lo que requiere concatenarlos antes de su uso con llama.cpp.
- Contexto desconocido: no se documenta la longitud de ventana, lo que limita la planificación de aplicaciones con contexto largo.
- Popularidad mínima: 6 descargas y 0 likes sugieren poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Abomination-t1-123b-GGUF
- Modelo base: https://huggingface.co/bruhzair/Abomination-t1-123b
- Quants imatrix: https://huggingface.co/mradermacher/Abomination-t1-123b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Abomination-t1-123b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
