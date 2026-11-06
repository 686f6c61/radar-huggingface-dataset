# ravivarmapatturi/inferedge-tiny-mt-te-en-v0

## Resumen

InferEdge tiny translator v0 (te-en) es un modelo de traduccion automatica telugu-ingles desarrollado por InferEdge AI (cuenta de Hugging Face `ravivarmapatturi`). Se trata de un modelo de investigacion temprana, entrenado desde pesos aleatorios con el objetivo declarado de validar el pipeline de entrenamiento y despliegue de la organizacion, no de ofrecer un traductor utilizable en produccion. El propio autor advierte de forma explicita en la model card que el modelo "no es suficientemente bueno para uso real" y que sus salidas son a menudo incorrectas o sin sentido.

Tecnicamente es un transformer encoder-decoder de 18,3 millones de parametros (28,8 MB en formato ONNX INT8 incluyendo el tokenizer), entrenado sobre 7.673 pares de frases del subconjunto BPCC-H-Daily del corpus ai4bharat/BPCC. El checkpoint se selecciono en el paso 6000 sobre datos de validacion, y todo el entrenamiento se completo en aproximadamente 20 minutos sobre una unica GPU de Kaggle.

Su relevancia es limitada y de caracter metodologico: sirve como ejemplo minimo de pipeline de traduccion on-device (exportacion a ONNX INT8, empaquetado con tokenizer) y como referencia de lo que ocurre cuando un modelo de traduccion se entrena con un volumen de datos muy reducido y un dominio muy estrecho. La diferencia entre su rendimiento en el test de BPCC (chrF++ 62,68) y en los conjuntos IN22 (13,18 en conversacional, 7,41 en general) cuantifica con claridad ese fracaso de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (deducido de la implementacion `tiny_mt.py`; el autor no detalla la arquitectura) |
| Parametros totales | 18,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (exportacion ONNX); pesos originales en PyTorch (`model_state.pt`) |
| Idiomas soportados | telugu (te) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model_state.pt`) y ONNX INT8 |

## Arquitectura y entrenamiento

El autor no publica detalles de la arquitectura mas alla de la existencia de una funcion constructora `build_model("v0", vocab)` en el fichero `tiny_mt.py`, que carga los pesos desde `model_state.pt`. Por el tamano (18,3 M de parametros) y la tarea (traduccion secuencia a secuencia), se trata de un transformer encoder-decoder de dimensiones reducidas, pero no se dispone de informacion sobre numero de capas, dimension del modelo, cabezas de atencion, tamano de vocabulario ni longitud maxima de secuencia.

El entrenamiento partio de pesos aleatorios (sin inicializacion desde un modelo preentrenado) y utilizo 7.673 pares de frases del subconjunto BPCC-H-Daily del corpus ai4bharat/BPCC (licencia CC-BY-4.0). El checkpoint final se selecciono en el paso 6000 evaluando sobre datos de validacion. Todo el proceso se ejecuto en una sola GPU de Kaggle en unos 20 minutos. No se menciona uso de RLHF, DPO ni ninguna tecnica de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal. La decodificacion empleada en la evaluacion fue greedy.

## Capacidades

- Traduccion de texto de telugu a ingles, unica direccion cubierta por el modelo (el identificador incluye "te-en").
- Generacion de texto secuencia a secuencia con decodificacion greedy.
- Inferencia on-device: el paquete INT8 ONNX de 28,8 MB incluye el tokenizer y esta pensado para ejecucion local.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del par te-en.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- El dominio efectivo esta limitado al subconjunto BPCC-H-Daily (texto diario), segun los propios resultados del autor.

## Casos de uso

- Validacion de pipelines de traduccion on-device: el modelo sirve para probar la cadena completa de exportacion a ONNX INT8, empaquetado con tokenizer y ejecucion en un runtime local antes de invertir en un modelo mayor. Su tamano de 28,8 MB lo hace adecuado para pruebas de integracion.
- Pruebas de humo en CI/CD de sistemas de traduccion: al ser un artefacto pequeno y con licencia Apache 2.0, puede incorporarse como fixture en tests automatizados que verifiquen que el pipeline de inferencia carga pesos, tokeniza y produce salidas con el formato esperado.
- Referencia de linea base (baseline) en experimentos academicos: permite comparar el efecto de aumentar el corpus de entrenamiento o de partir de un modelo preentrenado frente a un entrenamiento desde cero con 7.673 pares.
- Demostracion educativa de sobreajuste en traduccion automatica: la brecha entre chrF++ 62,68 en BPCC y 7,41 en IN22 general es un ejemplo cuantificado de falta de generalizacion para clases y talleres.
- Evaluacion de herramientas de metricas: util para validar implementaciones de chrF++ con orden de palabras 2 sobre un conjunto de salidas conocido y reproducible.
- Prototipado de interfaces de traduccion telugu-ingles en entornos con recursos muy limitados, siempre que se acepte que la calidad no es apta para usuarios finales y se use unicamente para pruebas de UX.

## Benchmarks y rendimiento

Resultados publicados por el autor (PyTorch, decodificacion greedy, chrF++ con orden de palabras 2):

| Conjunto de test | Tamano | chrF++ |
|---|---:|---:|
| BPCC test (similar a los datos de entrenamiento) | 426 | 62,68 |
| IN22 conversation | 1.503 | 13,18 |
| IN22 general | 1.024 | 7,41 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que los ficheros INT8 no han pasado una prueba de calidad completa ni una prueba en navegador, por lo que no hay metricas para la version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en INT8 ONNX (el artefacto completo con tokenizer ocupa 28,8 MB); los pesos PyTorch en precision original ocupan del orden de decenas de MB.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; el modelo se entreno en una unica GPU de Kaggle, lo que da una idea del perfil de recursos.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650 o inferiores) y probablemente en CPU para inferencia en tiempo real dada la carga computacional minima.
- Opciones de despliegue: runtime ONNX (ONNX Runtime, onnxruntime-web para navegador) para el paquete INT8; PyTorch para los pesos `model_state.pt` cargados mediante `tiny_mt.py`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones y advierte que la version INT8 no se ha probado en navegador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de contexto cualitativo:

| Modelo | Parametros | Idiomas | Licencia | Estado |
|---|---|---|---|---|
| InferEdge tiny-mt-te-en-v0 | 18,3 M | te, en | Apache 2.0 | Modelo de investigacion, no apto para produccion |
| Modelos de traduccion te-en de ai4bharat (familia IndicTrans) | no disponible en esta ficha | Indic, en | no disponible en esta ficha | No se dispone de datos verificados en la informacion proporcionada |
| Modelos NLLB de Meta | no disponible en esta ficha | multilingue | no disponible en esta ficha | No se dispone de datos verificados en la informacion proporcionada |

No se han incluido cifras de parametros, contexto ni rendimiento de las alternativas porque no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es suficientemente bueno para uso real y que sus salidas son a menudo incorrectas o sin sentido.
- Fuerte sobreajuste al dominio de entrenamiento: chrF++ cae de 62,68 en BPCC a 13,18 en IN22 conversacional y 7,41 en IN22 general.
- Entrenado desde pesos aleatorios con solo 7.673 pares de frases, sin preentrenamiento, lo que limita severamente la cobertura lexica y gramatical.
- La version INT8 ONNX no ha superado una prueba de calidad completa ni una prueba en navegador; su fidelidad respecto a los pesos PyTorch no esta verificada.
- Riesgo elevado de alucinacion y de traducciones infieles, especialmente fuera del dominio de texto diario.
- Solo cubre la direccion telugu a ingles; no se documenta traduccion inversa.
- No se documentan sesgos especificos, pero al derivar de un unico subconjunto del corpus BPCC, hereda la distribucion y los sesgos de esa fuente.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero la calidad del modelo hace desaconsejable cualquier despliegue en produccion.
- No se dispone de informacion sobre longitud maxima de contexto, vocabulario ni requisitos de preprocesado mas alla del tokenizer incluido en el paquete.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigacion sin comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-te-en-v0
- Dataset de entrenamiento (ai4bharat/BPCC): https://huggingface.co/datasets/ai4bharat/BPCC
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
