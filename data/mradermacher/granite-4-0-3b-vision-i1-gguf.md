# mradermacher/granite-4.0-3b-vision-i1-GGUF

## Resumen
Esta ficha describe la cuantización GGUF del modelo Granite 4.0 3B Vision, publicada por el usuario mradermacher bajo licencia Apache 2.0. El modelo original lo desarrolla IBM dentro de la familia Granite 4.0, orientada a tareas de lenguaje y visión en entornos empresariales. La versión aquí documentada emplea cuantización con imatrix (etiquetada como i1) para reducir el peso de los 3.659.742.720 parámetros del modelo base a ficheros de entre 1,0 GB y 3,1 GB, lo que permite ejecutarlo en hardware de consumo.

El interés de esta publicación es práctico: ofrece una batería amplia de niveles de cuantización (desde IQ1_S hasta Q6_K) en formato GGUF, compatible con llama.cpp y sus derivados, para un modelo multimodal de 3B parámetros. Esto lo convierte en una opción atractiva para prototipado local de tareas de visión-lenguaje, donde el coste de VRAM es una restricción habitual.

No obstante, la información disponible es limitada: la model card del repositorio se centra casi por completo en los aspectos de cuantización y no detalla la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base. Los datos que faltan se indican explícitamente como "no disponible" a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de la familia Granite 4.0; detalles no publicados en la informacion disponible) |
| Parametros totales | 3.659.742.720 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantizacion con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base ibm-granite/granite-4.0-3b-vision en la información proporcionada. Por el nombre y la naturaleza del repositorio, se trata de un modelo multimodal de 3.659.742.720 parámetros que procesa lenguaje e imágenes, pero no se especifican el tipo de transformer, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.).

La contribución técnica de esta publicación es la cuantización: mradermacher genera versiones GGUF con imatrix (fichero imatrix.gguf de 0,1 GB incluido para crear cuantizaciones propias) y ofrece tanto quants estáticos como quants i1 ponderados. Los ficheros mmproj, necesarios para la parte visual, se alojan en el repositorio estático hermano (mradermacher/granite-4.0-3b-vision-GGUF), no en este repositorio i1.

## Capacidades
- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Procesamiento de imágenes: el modelo base es de visión, y la cuantización mantiene esa capacidad mediante los ficheros mmproj del repositorio estático.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Formato GGUF, que permite su uso con llama.cpp y herramientas compatibles.
- No se documentan en la información disponible capacidades específicas de tool calling, razonamiento multi-paso, matemáticas avanzadas, audio ni modo thinking.

## Casos de uso
- Prototipado local de visión-lenguaje: con la cuantización i1-Q4_K_M (2,3 GB) el modelo cabe en una GPU de consumo de 8 GB de VRAM, lo que permite experimentar con descripciones de imágenes y preguntas visuales sin infraestructura en la nube.
- Asistentes de accesibilidad: el modelo puede describir imágenes a usuarios con discapacidad visual; su tamaño reducido permite ejecutarlo en dispositivos de borde con llama.cpp, aunque la calidad en cuantizaciones bajas será limitada.
- Análisis de documentos escaneados en local: para extraer información de capturas o formularios en inglés, una cuantización Q5_K_M (2,7 GB) ofrece un equilibrio razonable entre calidad y huella de memoria en estaciones de trabajo sin GPU dedicada.
- Clasificación y etiquetado de imágenes en pipelines de datos: el modelo puede generar etiquetas textuales para lotes de imágenes, y su licencia Apache 2.0 permite integrarlo en herramientas internas sin restricciones de uso comercial.
- Chat conversacional en inglés de bajo coste: para demos y pruebas de concepto de asistentes, la cuantización IQ3_M (1,8 GB) permite desplegar el modelo en CPU con llama.cpp y latencias aceptables para uso interactivo no crítico.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y 24 variantes de cuantización, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad de un modelo multimodal de 3B según el nivel de compresión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,0 GB (i1-IQ1_S) hasta 3,1 GB (i1-Q6_K) solo para los pesos; hay que añadir el coste de la caché KV, el fichero mmproj de la parte visual y el contexto, por lo que conviene reservar margen adicional.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 8 GB o más de VRAM (RTX 3060/4060, RTX 4070, RTX 4090, A10, L4) puede alojar las cuantizaciones de 4 bits o superiores con holgura.
- Cabe en GPU de consumo: sí; las cuantizaciones i1-Q4_K_M (2,3 GB) e i1-Q5_K_M (2,7 GB) son adecuadas para GPUs de 8 GB, y las de 2-3 bits caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el repositorio declara compatibilidad con endpoints. No se documenta soporte específico de vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo base en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| granite-4.0-3b-vision (i1-GGUF, esta ficha) | 3,66 B | no disponible | Apache 2.0 | GGUF |
| granite-4.0-3b-vision (base) | 3,66 B | no disponible | Apache 2.0 | safetensors |
| Alternativas de 3B multimodales | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información disponible modelos comparables concretos de la misma categoría con datos verificables; se indica "no disponible".

## Limitaciones y advertencias
- Idiomas: el modelo solo declara soporte de inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (1,0-1,5 GB) degradan la calidad de forma notable; la propia model card advierte que IQ1 es "para desesperados" y que Q2_K_S es de "calidad muy baja". Para producción conviene usar Q4_K_M o superior.
- Parte visual: los ficheros mmproj no están en este repositorio sino en el estático; un despliegue que los omita perderá la capacidad de procesar imágenes.
- Alucinación: no se documentan evaluaciones de fiabilidad ni tasas de alucinación; al ser un modelo de 3B, el riesgo en tareas de razonamiento complejo es inherentemente alto.
- Sesgos: no se publica información sobre sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM por si hubiera términos adicionales no reflejados aquí.
- Fecha de creación: el repositorio figura creado el 2026-11-21, fecha que debe tratarse con cautela al planificar el soporte a largo plazo.

## Enlaces
- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/granite-4.0-3b-vision-i1-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Cuantizaciones estáticas y ficheros mmproj: https://huggingface.co/mradermacher/granite-4.0-3b-vision-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#granite-4.0-3b-vision-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
