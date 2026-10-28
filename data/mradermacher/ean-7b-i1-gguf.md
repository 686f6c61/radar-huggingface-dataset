# mradermacher/EAN-7B-i1-GGUF

## Resumen

EAN-7B-i1-GGUF es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo DawnLiu/EVAN-7B, un modelo multimodal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a razonamiento visual y entrenado con técnicas de aprendizaje por refuerzo sobre el conjunto de datos TIGER-Lab/ViRL39K. El repositorio no contiene pesos en formato transformers, sino únicamente ficheros GGUF cuantizados con calibración imatrix (i1), pensados para su ejecución en llama.cpp y herramientas compatibles.

El interés práctico del repositorio es que reduce un modelo de visión-lenguaje de ~7,6B a ficheros de entre 2,0 GB (IQ1_S) y 6,4 GB (Q6_K), lo que permite ejecutar razonamiento multimodal sobre imágenes en hardware de consumo. Es relevante ahora porque el ecosistema de cuantización de mradermacher publica variantes i1 con imatrix de forma sistemática, y este modelo concreto cubre un hueco poco poblado: modelos pequeños con entrenamiento por refuerzo específico para razonamiento sobre contenido visual.

Conviene señalar dos matices de nomenclatura: el repositorio se llama EAN-7B mientras que el modelo base se llama EVAN-7B (probable truncamiento del nombre), y los ficheros mmproj necesarios para procesar imágenes no están en este repositorio, sino en el repositorio de cuantizaciones estáticas del mismo autor. La licencia declarada es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card del cuantizador no la detalla; los tags indican multimodal y el pipeline es reinforcement-learning) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B), dato de safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; más un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización con imatrix, versión i1); repo de 89,0 GB con todos los quants. Los pesos originales en safetensors están en DawnLiu/EVAN-7B |

## Arquitectura y entrenamiento

La información disponible no incluye la arquitectura interna del modelo base: la model card de esta cuantización solo declara que se trata de un modelo multimodal de aproximadamente 7,6B parámetros, con pipeline de reinforcement-learning y etiquetas de reasoning y conversational. No se especifican el número de capas, la atención, el tokenizador ni el tamaño de contexto. Lo que sí queda documentado es el dataset de entrenamiento declarado, TIGER-Lab/ViRL39K, un conjunto de 39.000 ejemplos orientado a razonamiento sobre contenido visual, lo que sitúa al modelo en la categoría de visión-lenguaje con ajuste por refuerzo para tareas de razonamiento.

El trabajo técnico de este repositorio no es el entrenamiento, sino la cuantización: mradermacher aplica cuantización de tensores con conversión a formato HF y calibración mediante un fichero imatrix propio (EAN-7B.imatrix.gguf, 0,1 GB), lo que produce las variantes "i1" que el autor recomienda frente a las cuantizaciones estáticas de tipos comparables. No se documentan innovaciones de arquitectura propias (decodificación especulativa, atención lineal, etc.) ni detalles de RLHF/DPO más allá de la etiqueta de reinforcement-learning.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Razonamiento sobre contenido visual: el modelo base es multimodal y el entrenamiento declarado se apoya en un dataset de razonamiento visual (ViRL39K).
- Razonamiento de varios pasos derivado del entrenamiento por refuerzo, orientado a tareas donde se requiere encadenar inferencias antes de responder.
- Procesamiento de imágenes únicamente si se descarga el fichero mmproj correspondiente desde el repositorio estático (mradermacher/EAN-7B-GGUF); este repositorio i1 no incluye el proyector multimodal.
- Ejecución local en CPU y GPU mediante llama.cpp y compatible con herramientas que consumen GGUF.
- Capacidad multilingüe limitada: solo inglés declarado, sin evidencia de soporte de castellano.
- No se documenta soporte de tool calling, function calling, modo thinking explícito, audio ni agentes multi-paso.

## Casos de uso

- Análisis local de documentación técnica con figuras: el modelo puede recibir capturas de diagramas de arquitectura o esquemas de circuitos y responder preguntas sobre ellos sin enviar las imágenes a un servicio externo, lo que resulta adecuado en entornos con requisitos de confidencialidad.
- Verificación de gráficos en informes: dado que el entrenamiento se centra en razonamiento visual, un uso realista es comprobar si una gráfica de un informe coincide con los datos tabulados que la acompañan, ejecutando el quant Q4_K_M (4,8 GB) en una estación de trabajo.
- Docencia de matemáticas y geometría a partir de figuras: el modelo puede razonar sobre un enunciado escaneado con un dibujo geométrico y explicar los pasos, aprovechando la componente de RL sobre razonamiento visual.
- Preetiquetado y control de calidad de datasets multimodales: usar el modelo como anotador de primera pasada o como filtro de pares imagen-pregunta-respuesta antes de un entrenamiento posterior, ejecutándolo en lote con llama.cpp.
- Pruebas de regresión de interfaces: enviar capturas de pantalla de una aplicación y preguntar por la presencia, posición o texto de elementos concretos, como apoyo a pipelines de QA visual.
- Prototipado de asistentes de accesibilidad: descripción de imágenes y respuesta a preguntas sobre su contenido en local, con el quant IQ4_XS (4,3 GB) para caber en GPU de consumo.
- Experimentación en investigación sobre RL y razonamiento multimodal: al ser un modelo de 7,6B con licencia Apache 2.0, sirve como referencia ejecutable en hardware modesto para comparar con otros modelos de razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y la información proporcionada no incluye la model card del modelo base DawnLiu/EVAN-7B. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamaño de los ficheros GGUF más overhead de contexto y del proyector multimodal (estimación, no medida por el autor):
  - i1-IQ2_M (2,9 GB): aproximadamente 4 GB de VRAM.
  - i1-IQ3_M (3,7 GB): aproximadamente 5 GB de VRAM.
  - i1-Q4_K_M (4,8 GB): aproximadamente 6-7 GB de VRAM.
  - i1-Q5_K_M (5,5 GB): aproximadamente 7-8 GB de VRAM.
  - i1-Q6_K (6,4 GB): aproximadamente 8-9 GB de VRAM.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) puede ejecutar Q4_K_M y Q5_K_M; con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) se puede usar Q6_K con contexto amplio; A100 y H100 no aportan ventaja a este tamaño salvo por concurrencia.
- Cabe en GPU de consumo: sí, desde quants IQ2/IQ3 en tarjetas de 4-6 GB hasta Q6_K en tarjetas de 8-12 GB. También es viable en CPU con Q4_K_S (4,6 GB) o inferiores, a costa de latencia.
- Opciones de despliegue: llama.cpp (referencia para GGUF), llama-cpp-python, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI. vLLM y TGI tienen soporte de GGUF limitado o experimental; para producción con concurrencia alta conviene valorar los pesos originales en transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota importante: para usar el modelo con imágenes hay que descargar además el fichero mmproj del repositorio estático (mradermacher/EAN-7B-GGUF); no está incluido aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| mradermacher/EAN-7B-i1-GGUF (este) | 7,6B | No disponible | GGUF i1 (imatrix), 2,0-6,4 GB por quant | Apache 2.0 | Cuantización dinámica con imatrix; sin mmproj en el repo |
| mradermacher/EAN-7B-GGUF | 7,6B | No disponible | GGUF estático | Apache 2.0 | Mismo modelo base con quants estáticos; incluye los ficheros mmproj para visión |
| DawnLiu/EVAN-7B | 7,6B | No disponible | safetensors (transformers) | Apache 2.0 | Modelo original sin cuantizar; requiere más VRAM (aproximadamente 15 GB en BF16) |
| Otros modelos de visión-lenguaje de ~7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni de especificaciones en la información consultada, por lo que no se puede establecer una comparación cuantitativa |

La comparación de rendimiento con alternativas de la misma categoría no está disponible: no hay benchmarks publicados de este modelo ni datos de referencia en la información consultada. La elección entre el repositorio i1 y el estático debe basarse en la calidad relativa de los quants (el autor recomienda i1 frente a tipos equivalentes) y en la necesidad de los ficheros mmproj.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado. No hay evidencia de calidad en castellano; usarlo en producción en español es arriesgado sin evaluación previa.
- Sin benchmarks: no existen métricas publicadas que permitan estimar su calidad frente a otros modelos de razonamiento visual. Cualquier decisión de producción debería ir precedida de una evaluación propia.
- Adopción nula en el momento de la ficha: 0 descargas y 0 likes, creado y actualizado el 2026-10-28. No hay señales de validación por parte de la comunidad.
- Inconsistencia de nombres: el repositorio usa "EAN-7B" mientras que el modelo base es "EVAN-7B"; conviene verificar que los pesos corresponden al modelo esperado antes de desplegar.
- Visión incompleta en este repositorio: los ficheros mmproj no están incluidos. Sin ellos, el modelo solo funciona como modelo de texto y pierde su capacidad principal.
- Cuantizaciones muy agresivas: el propio autor advierte que IQ1_S es "for the desperate", IQ1_M "mostly desperate" y Q2_K_S "very low quality". Por debajo de IQ3 la degradación del razonamiento visual puede ser severa. Se recomienda Q4_K_M o superior.
- Riesgo de alucinación: en tareas de lectura de gráficos, OCR implícito o interpretación de figuras, un modelo de 7,6B tiende a inventar valores y etiquetas; se requiere verificación y, preferiblemente, salida estructurada con comprobaciones posteriores.
- Sesgos: no documentados por el autor. Al no haber model card del modelo base en la información disponible, no se pueden enumerar sesgos conocidos ni la composición del dataset ViRL39K más allá de su nombre.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia se hereda del modelo base; conviene confirmar en DawnLiu/EVAN-7B que no existen restricciones adicionales (por ejemplo, sobre los datos de entrenamiento).
- Naturaleza del repositorio: es un artefacto de cuantización, no un modelo nuevo. Los pesos originales y cualquier garantía de calidad dependen de DawnLiu/EVAN-7B.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mradermacher/EAN-7B-i1-GGUF
- Cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/EAN-7B-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#EAN-7B-i1-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-7B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
