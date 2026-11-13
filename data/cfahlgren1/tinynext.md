# cfahlgren1/tinynext

## Resumen

tinynext es un modelo de autocompletado de texto de escala minima (944 000 parametros, 0,98 MB en su version cuantizada) desarrollado por cfahlgren1. No es un modelo de lenguaje generativo de proposito general, sino un predictor de siguiente caracter basado en una red recurrente GRU, disenado especificamente para ofrecer sugerencias de escritura en tiempo real dentro del navegador. Su unica tarea es completar la palabra o frase corta que el usuario esta escribiendo en un correo electronico, con una latencia de aproximadamente 4 ms por paso.

El modelo se entrena exclusivamente con correos electronicos corporativos del corpus Enron (119 859 mensajes enviados desde direcciones enron.com, unos 40 millones de caracteres), lo que le confiere un estilo muy concreto: correspondencia de oficina de 2001. Se distribuye en formato ONNX y esta pensado para ejecutarse con onnxruntime-web mediante WebAssembly, sin necesidad de servidor ni conexion a internet. Es el motor de autocompletado de la aplicacion offline.page y tiene un gemelo identico publicado como `cfahlgren1/enron-autocomplete`.

Su relevancia no reside en capacidades linguisticas amplias, sino en demostrar que un modelo de menos de un megabyte, entrenado en 14 minutos por 0,35 dolares en una sola GPU A10G, puede ofrecer autocompletado util y con control de confianza calibrado directamente en el cliente. Es un caso de estudio de eficiencia extrema y de despliegue en el borde (edge) mas que una alternativa a los LLM convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), modelo de lenguaje a nivel de caracter |
| Parametros totales | 944 000 (944K) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estado recurrente de 512 dimensiones; sin ventana de tokens explicita) |
| Tipos de cuantizacion | quint8 (int8 por defecto, `model_quint8.onnx`); pesos originales en float32 (`model.onnx`) |
| Idiomas soportados | ingles unicamente |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model_quint8.onnx`, `model.onnx`), checkpoint PyTorch (`best.pt`) |
| Vocabulario | caracteres (solo caracteres del teclado ingles); id = codigo de caracter - 29 |
| Tamano en disco | 0,98 MB (quint8), 3,8 MB (float32) |
| Latencia | ~4 ms por paso |
| Dataset de entrenamiento | corbt/enron-emails (119 859 correos de enron.com) |

## Arquitectura y entrenamiento

La arquitectura es una GRU que opera a nivel de caracter. En cada paso recibe un unico caracter de entrada (codigo entero) junto con un vector de estado oculto de 512 dimensiones y devuelve los logits del siguiente caracter mas el estado actualizado. Esto permite un procesamiento estrictamente incremental: cada pulsacion de tecla es una inferencia pequena, lo que encaja con el modelo de ejecucion de onnxruntime-web sobre WebAssembly. Los identificadores de caracter se calculan restando 29 al codigo ASCII; el id 1 marca el inicio de un correo y el 2 el salto de linea.

El entrenamiento uso 40 millones de caracteres procedentes de 119 859 correos enviados desde direcciones enron.com, con 30 pasadas sobre los datos. Se introdujeron erratas artificiales en el texto de entrenamiento para que el modelo siga prediciendo aunque el usuario cometa errores. El proceso completo (descarga, entrenamiento, evaluacion y exportacion) se ejecuta en `train.py` y tardo 14 minutos en una A10G con Hugging Face Jobs, con un coste de 0,35 dolares. El autor probo tambien una variante mayor de 3,46 millones de parametros (3,5 MB) que resulto peor en la misma configuracion: con ambos modelos sugiriendo con la misma frecuencia (9 % de las veces), el pequeno acerto el 85 % frente al 82 % del grande.

Una innovacion practica destacable es el mecanismo de umbral de confianza: la sugerencia se construye tomando iterativamente el caracter mas probable y multiplicando las probabilidades; cuando el producto acumulado cae por debajo de un umbral configurable, se detiene la generacion. Esto permite calibrar el equilibrio entre cobertura y precision (por ejemplo, con umbral del 50 % sugiere el 11 % de las veces y acierta el 80 %).

## Capacidades

- Prediccion del siguiente caracter y construccion de sugerencias de palabra o frase corta (autocompletado).
- Control de confianza mediante umbral configurable sobre la probabilidad acumulada del producto de probabilidades.
- Robustez frente a erratas del usuario, gracias al ruido introducido durante el entrenamiento.
- Inferencia incremental con estado recurrente: una llamada por pulsacion de tecla, sin reprocesar el contexto completo.
- Ejecucion 100 % en el navegador mediante onnxruntime-web (WebAssembly), sin servidor ni red.
- Soporte de un unico idioma (ingles) y de caracteres del teclado ingles.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Autocompletado en clientes de correo web: el modelo se integra en el editor y sugiere la continuacion de la frase al pulsar Tab, con inferencia local en el navegador y ~4 ms por paso, sin enviar el texto a ningun servidor.
- Aplicaciones de escritura offline: al ejecutarse sobre WebAssembly y empaquetarse en menos de 1 MB, puede incluirse en una PWA o pagina estatica que funcione sin conexion, como hace offline.page.
- Redaccion de correos de oficina con estilo consistente: entrenado con correspondencia corporativa de Enron, resulta adecuado para plantillas y formulas de cortesia tipicas de entornos empresariales en ingles.
- Asistente de teclado en entornos con recursos minimos: cabe en dispositivos embebidos, navegadores de gama baja o extensiones ligeras donde un LLM no es viable por tamano o latencia.
- Filtro de sugerencias con umbral ajustable: en productos donde la precision importa mas que la cobertura, se puede subir el umbral (por ejemplo al 70 %, con 90 % de acierto) para mostrar solo predicciones de alta confianza.
- Base para experimentos de eficiencia y docencia: el repositorio incluye `train.py` completo, lo que permite reproducir el entrenamiento en una sola GPU en minutos y estudiar el efecto de la cuantizacion y del tamano del modelo.
- Prototipado rapido de funciones de autocompletado en demos de Hugging Face Spaces, como el Space oficial `cfahlgren1/enron-autocomplete`.

## Benchmarks y rendimiento

El autor publica metricas propias de acierto del autocompletado, medidas sobre 5000 posiciones en correos de personas no vistas en entrenamiento. "Acierto" significa que la sugerencia coincidio exactamente con lo que la persona escribio a continuacion.

| Umbral de confianza | Frecuencia de sugerencia | Precision (acierto exacto) |
|---|---|---|
| 20 % | 30 % de las veces | 48 % |
| 35 % | 18 % de las veces | 66 % |
| 40 % (demo) | no disponible | no disponible |
| 50 % (offline.page) | 11 % de las veces | 80 % |
| 70 % | 7 % de las veces | 90 % |

A umbral del 50 % se generan aproximadamente 6 caracteres por sugerencia correcta. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no serian aplicables a un modelo de autocompletado a nivel de caracter.

## Requisitos de hardware

- VRAM estimada: practicamente nula en GPU; el modelo pesa 0,98 MB en quint8 y 3,8 MB en float32, por lo que cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU para inferencia; el entrenamiento se realizo en una sola NVIDIA A10G (flavor a10g-large de Hugging Face Jobs) en 14 minutos.
- GPU de consumo: irrelevante para inferencia, ya que se ejecuta en CPU mediante WebAssembly en el navegador; cualquier RTX o iGPU es sobradamente suficiente si se opta por ejecucion nativa.
- Opciones de despliegue: onnxruntime-web (WebAssembly) en navegador, onnxruntime nativo, y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no encajan con esta arquitectura.
- Latencia y throughput: aproximadamente 4 ms por paso (una inferencia por caracter de entrada). La generacion de una sugerencia de varios caracteres encadena varios pasos, por lo que el coste crece de forma lineal con la longitud de la sugerencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| tinynext | 944K | estado recurrente de 512 dim. | Autocompletado de caracter en navegador | no disponible | ONNX / onnxruntime-web |
| cfahlgren1/enron-autocomplete | 944K | estado recurrente de 512 dim. | Identico a tinynext (mismo modelo, otro nombre) | no disponible | ONNX |
| Variante mayor de tinynext (descartada) | 3,46M | no disponible | Autocompletado de caracter | no disponible | ONNX (3,5 MB) |
| LLM generativos de proposito general | miles de millones | miles de tokens | Generacion de texto completa | variable | GPU / servidor |

No se dispone de informacion sobre otros modelos de autocompletado comparables en la documentacion proporcionada. La comparativa mas directa es con su gemelo `enron-autocomplete` (identico) y con la variante mayor descartada por el autor, que obtuvo peor precision (82 % frente a 85 %) con la misma configuracion de entrenamiento.

## Limitaciones y advertencias

- Dominio muy restringido: solo conoce correo de oficina de 2001 (corpus Enron); fuera de ese registro produce texto poco util.
- Sin umbral de confianza, divaga y genera continuaciones absurdas (por ejemplo, "Dear Santa," se convierte en "I am attaching a copy of the agreement to the Enron Corp.").
- Memoriza nombres reales y formulas de despedida presentes en los correos, lo que plantea riesgos de privacidad y de reproduccion de datos personales; el autor recomienda mantener las sugerencias cortas.
- Solo ingles y solo caracteres del teclado ingles; no soporta otros idiomas ni alfabetos.
- Licencia no disponible: no puede asumirse permiso de uso comercial sin consultar al autor.
- No es un modelo de instrucciones ni de dialogo: no responde preguntas, no razona y no sigue prompts.
- Riesgo de sesgo heredado del corpus Enron: estilo, nombres y contextos propios de una unica empresa estadounidense de principios de los 2000.
- La cuantizacion quint8 puede degradar ligeramente la calidad frente a la version float32; no se publican metricas comparativas entre ambas.
- Las cifras de precision proceden de una evaluacion propia del autor sobre 5000 posiciones; no hay validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfahlgren1/tinynext
- Modelo gemelo (mismo modelo, nombre anterior): https://huggingface.co/cfahlgren1/enron-autocomplete
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/cfahlgren1/enron-autocomplete
- Repositorio offline.page: https://github.com/cfahlgren1/offline-page
- Dataset de entrenamiento: https://huggingface.co/datasets/corbt/enron-emails
- Script de entrenamiento: https://huggingface.co/cfahlgren1/tinynext/blob/main/train.py
- Informe completo de entrenamiento y test: https://huggingface.co/cfahlgren1/tinynext/blob/main/report.json
