# Ahsanmandhar/heart-murmur-ast

## Resumen
El modelo heart-murmur-ast es un clasificador de audio basado en Audio Spectrogram Transformer (AST), un encoder de estilo ViT ajustado para detectar soplos cardíacos en fonocardiogramas. Lo desarrolla Ahsan Mandhar a partir del modelo base MIT/ast-finetuned-audioset-10-10-0.4593 y del conjunto CirCor DigiScope Phonocardiogram Dataset. Tiene aproximadamente 86 millones de parámetros, recibe un espectrograma log-mel fijo de dimensiones [1,1,80,1001] y genera un embedding de 768 dimensiones sobre el que se aplica una regresión logística para las clases Absent, Murmur y Unknown.

Se distribuye en ONNX con cuantización INT8 y licencia MIT, y está orientado a investigación y educación en análisis de sonidos cardíacos, no a diagnóstico clínico. Su interés práctico está en la extracción de representaciones y el prototipado ligero: el modelo cabe en entornos de pocos recursos y sirve como bloque intermedio para experimentos con fonocardiogramas.

No se han publicado resultados de benchmarks ni validación clínica en la información disponible; por tanto, no debe presentarse como una herramienta de cribado o triaje.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), encoder de estilo ViT; clasificador de sonda lineal (regresión logística) |
| Parámetros totales | ~86M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de espectrograma log-mel [1,1,80,1001] |
| Tipos de cuantización | INT8 (ONNX) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8) |
| Modelo base | MIT/ast-finetuned-audioset-10-10-0.4593 |
| Dataset de ajuste | CirCor DigiScope Phonocardiogram Dataset |
| Entrada | Espectrograma log-mel float32 [1,1,80,1001] |
| Salida | Embedding de 768 dimensiones (media de 311 tokens de parche); clasificador lineal externo |
| Clases | 0 Absent, 1 Murmur, 2 Unknown |

## Arquitectura y entrenamiento
El modelo parte de AST, una arquitectura que trata el espectrograma como una imagen y lo divide en parches, aplicando un encoder Transformer de estilo ViT. La entrada es un espectrograma log-mel de 80 bandas y 1001 frames; el encoder produce 311 tokens de parche y la salida se reduce a un embedding de 768 dimensiones mediante mean pooling. Sobre ese embedding se entrena una sonda lineal de regresión logística para clasificar entre Absent, Murmur y Unknown.

El ajuste se realiza sobre el CirCor DigiScope Phonocardiogram Dataset, según la model card. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO; en un modelo de clasificación de audio estas técnicas no son aplicables. La innovación práctica es la cuantización INT8 en ONNX y la separación entre extractor de embeddings y clasificador lineal, lo que permite reutilizar el encoder.

## Capacidades
- Clasificación de fonocardiogramas en tres clases: Absent, Murmur y Unknown.
- Extracción de embeddings de 768 dimensiones a partir de espectrogramas log-mel.
- Procesamiento de audio representado como espectrograma log-mel de dimensiones fijas [1,1,80,1001].
- No es un modelo generativo: no genera texto, código, matemáticas ni imágenes.
- No dispone de tool calling ni function calling.
- No está diseñado para agentes ni para razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido textual; la etiqueta de idioma es en.
- No incorpora modo thinking, visión, audio general ni otras modalidades fuera del sonido cardíaco.
- Despliegue ligero mediante ONNX Runtime con cuantización INT8.

## Casos de uso
- Investigación en detección de soplos cardíacos: usar el embedding de 768 dimensiones y la sonda lineal como línea base reproducible para comparar experimentos con fonocardiogramas, gracias a que el modelo es pequeño y se distribuye en ONNX.
- Extracción de características para modelos posteriores: congelar el encoder AST y entrenar clasificadores específicos sobre datos propios, lo que resulta adecuado cuando se dispone de pocas grabaciones etiquetadas.
- Prototipado de pipelines de fonocardiogramas: integrar el modelo en un flujo de preprocesado que convierta audio en espectrogramas log-mel y ejecute inferencia ONNX para obtener embeddings o etiquetas preliminares.
- Docencia y demostraciones técnicas: ilustrar cómo funciona un Audio Spectrogram Transformer aplicado a audio médico, con un repositorio de 0,1 GB y un formato de despliegue sencillo.
- Evaluación comparativa de representaciones: medir si los embeddings de AST superan a otras representaciones acústicas en tareas de clasificación de sonidos cardíacos, manteniendo el mismo protocolo experimental.
- Despliegue en entornos con recursos limitados: ejecutar el modelo en CPU o en hardware modesto gracias a la cuantización INT8, siempre con revisión experta y sin uso diagnóstico.
- Curación de datasets: preetiquetar grabaciones como Absent, Murmur o Unknown para priorizar la revisión humana, aprovechando la clase Unknown como mecanismo de abstención.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Por el tamaño del modelo (~86M parámetros en INT8) no se espera que la memoria sea un factor limitante; puede ejecutarse en CPU.
- GPU recomendadas: no requiere A100, H100 ni RTX 4090. Cualquier GPU compatible con ONNX Runtime es suficiente; una GPU consumer moderna aporta margen para lotes grandes, pero no es necesaria.
- ¿Cabe en GPU consumer? Sí, con holgura, y también en CPU.
- Opciones de despliegue: ONNX Runtime es la vía documentada. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio: 0,1 GB.

## Comparativa con modelos similares
| Modelo | Parámetros | Entrada/contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heart-murmur-ast | ~86M | Espectrograma log-mel fijo [1,1,80,1001] | No disponible | MIT | HuggingFace |
| MIT/ast-finetuned-audioset-10-10-0.4593 (modelo base) | No disponible en la información | Espectrograma de audio para AudioSet | No disponible | MIT | HuggingFace |
| Alternativas específicas de detección de soplos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de detección de soplos en la información proporcionada.

## Limitaciones y advertencias
- No es un dispositivo médico y no está validado para diagnóstico, cribado ni triaje.
- El rendimiento varía según la calidad de la grabación y la localización anatómica, tal como advierte la model card.
- La clase Unknown introduce ambigüedad y puede reflejar casos no resueltos por el clasificador.
- La sonda lineal de regresión logística limita la capacidad del clasificador frente a un ajuste completo del encoder.
- La entrada tiene dimensiones fijas [1,1,80,1001]; cualquier cambio en el preprocesado o en la duración del audio requiere adaptación.
- No hay resultados de benchmarks ni validación externa en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que no constituye evidencia de calidad ni de adopción.
- La licencia MIT permite uso comercial del modelo, pero no sustituye las obligaciones regulatorias ni la licencia ODC Attribution del dataset CirCor si se redistribuyen datos o se generan obras derivadas.
- Riesgo de falsos positivos y falsos negativos; no hay mecanismo de explicabilidad más allá del embedding y la sonda lineal.
- No debe utilizarse como sustituto del juicio de un experto clínico.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Ahsanmandhar/heart-murmur-ast
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la información disponible.
