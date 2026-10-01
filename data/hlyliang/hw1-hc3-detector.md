# hlyliang/hw1-hc3-detector

## Resumen

El modelo `hlyliang/hw1-hc3-detector` es un clasificador binario de texto disenado para distinguir entre respuestas escritas por humanos y respuestas generadas por ChatGPT. Se construye mediante el ajuste fino (fine-tuning) de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de tipo BERT con aproximadamente 22,7 millones de parametros, al que se le anade una cabeza de clasificacion para resolver la tarea. El modelo etiqueta cada entrada con `0` (humano) o `1` (ChatGPT).

El problema que aborda es la deteccion de contenido generado por IA, un area de creciente interes tanto en el ambito academico (deteccion de plagio y verificacion de autoría) como en el editorial y educativo. El autor reporta una exactitud de 99,44 por ciento en el conjunto de test tras el ajuste fino, partiendo de una linea base de 84,49 por ciento obtenida con embeddings congelados y una regresion logistica.

Se trata de un modelo muy pequeno y ligero (0,1 GB de repositorio, 22,7 millones de parametros), lo que lo hace apto para despliegue en CPU o en GPUs de gama baja. La informacion publica es limitada: no se declara licencia, idiomas soportados ni pipeline en HuggingFace, y el autor advierte que el rendimiento esta ligado al conjunto de datos HC3. Los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6) con cabeza de clasificacion binaria |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento; la base all-MiniLM-L6-v2 admite hasta 512) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de 6 capas y dimension oculta de 384 derivado de la familia MiniLM, disenado originalmente para generar embeddings de frases. Sobre esta base, el autor anade una cabeza de clasificacion para resolver una tarea de clasificacion binaria (humano frente a ChatGPT). No se trata de un modelo generativo, sino de un clasificador discriminativo que produce una etiqueta por cada texto de entrada.

El ajuste fino se realizo sobre el conjunto de datos HC3 (Human ChatGPT Comparison Corpus). La configuracion de entrenamiento reportada es la siguiente: optimizador AdamW, tasa de aprendizaje 2e-5, 5 epocas, tamano de lote 32 y longitud maxima de secuencia de 256 tokens. Como linea base, el autor congelo los embeddings del modelo preentrenado y entreno un clasificador de regresion logistica sobre ellos, obteniendo una exactitud de 84,49 por ciento, frente al 99,44 por ciento alcanzado tras el ajuste fino completo. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a un modelo de clasificacion.

## Capacidades

- Clasificacion binaria de texto: determina si un texto es de origen humano (etiqueta `0`) o generado por ChatGPT (etiqueta `1`).
- Deteccion de contenido generado por IA sobre textos en el dominio del corpus HC3.
- Procesamiento de secuencias de hasta 256 tokens en la configuracion de entrenamiento.
- Inferencia ligera apta para ejecucion en CPU por el reducido tamano del modelo.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).
- No dispone de modo de razonamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Moderacion de foros y comunidades: clasificar respuestas entrantes para marcar posibles textos generados por IA y aplicarlos a revision humana. El modelo es lo bastante ligero para ejecutarse en tiempo real sobre cada publicacion.
- Verificacion de autoría en entornos academicos: prefiltrar entregas o respuestas de alumnos para detectar texto sospechoso de haber sido generado por ChatGPT antes de una revision manual mas detallada.
- Control de calidad en plataformas de contenido: procesar por lotes grandes volumenes de comentarios o articulos y priorizar los casos etiquetados como generados por IA para su inspeccion.
- Analisis de corpus para investigacion: etiquetar automaticamente conjuntos de datos de texto para estudiar la proporcion de contenido humano frente a generado en un corpus dado.
- Preprocesamiento en pipelines de cura de datos de entrenamiento: filtrar ejemplos generados por IA de un corpus antes de usarlo para entrenar otros modelos.
- Integracion como componente de moderacion dentro de un sistema mayor: al ser un encoder pequeno y rapido, puede desplegarse detras de una API de clasificacion de bajo coste.
- Monitorizacion editorial: analizar articulos o contribuciones de colaboradores para detectar patrones de escritura compatibles con generacion automatica.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en la model card son las exactitudes de clasificacion sobre el conjunto HC3.

| Metrica | Valor |
|---|---|
| Exactitud de la linea base (embeddings congelados + regresion logistica) | 84,49 % |
| Exactitud en test tras ajuste fino | 99,44 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el modelo ocupa aproximadamente 91 MB de pesos; en fp16, unos 45 MB; en int8, alrededor de 23 MB. El consumo real es minimo.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4090, A100 o H100, aunque no necesita ninguna de ellas.
- Cabe en cualquier GPU de consumo e incluso en CPU: el modelo esta disenado para ejecutarse sin GPU dedicada.
- Opciones de despliegue: al ser un modelo basado en BERT, es compatible con librerias de inferencia estandar como HuggingFace Transformers, y puede exportarse a ONNX Runtime o convertirse a formatos optimizados para CPU. No se documenta soporte explicito para vLLM, llama.cpp u Ollama (estos estan orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el reducido tamano del modelo y la longitud maxima de 256 tokens, se espera una latencia muy baja por peticion, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos de deteccion humano/IA en la informacion proporcionada. Como referencia estructural, se puede situar frente a su modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| hlyliang/hw1-hc3-detector | 22,7 M | 256 tokens (entrenamiento) | Clasificacion humano/ChatGPT | no disponible |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 512 tokens | Embeddings de frases | Apache 2.0 (modelo base) |

No se dispone de comparativas con otros detectores de texto IA dentro de la informacion disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo se entreno y evaluo sobre el conjunto HC3, por lo que su rendimiento puede degradarse en otros dominios o tipos de texto.
- Riesgo de generalizacion limitada: un clasificador entrenado para distinguir humano frente a ChatGPT puede fallar ante textos generados por otros modelos (Claude, Gemini, Llama, etc.).
- Sesgos conocidos: no se documentan sesgos especificos, pero al depender de un unico corpus pueden existir sesgos de dominio, tematica o estilo presentes en HC3.
- Riesgo de falsos positivos y falsos negativos: la exactitud del 99,44 por ciento corresponde al conjunto de test de HC3 y no garantiza ese rendimiento en produccion.
- Limitacion de contexto: la secuencia maxima usada en entrenamiento es de 256 tokens, por lo que textos mas largos deben truncarse o dividirse.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento adecuado fuera de los idiomas presentes en HC3.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede confirmar si se permite el uso comercial. Se recomienda contactar con el autor antes de emplearlo en produccion.
- Modelo con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en HuggingFace, lo que reduce la trazabilidad y el soporte de la comunidad.
- No es un modelo generativo: no puede utilizarse para producir texto, solo para clasificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hlyliang/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3 (referencia del corpus citado por el autor): no se proporciona enlace directo en la informacion disponible.
