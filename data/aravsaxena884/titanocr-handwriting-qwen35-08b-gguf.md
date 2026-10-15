# aravsaxena884/titanocr-handwriting-qwen35-08b-gguf

## Resumen

TitanOCR handwriting reader es un ajuste fino mediante LoRA de Qwen/Qwen3.5-0.8B, publicado por el usuario aravsaxena884, orientado al reconocimiento de texto manuscrito en recortes de una sola linea o palabra, con especial enfasis en caligrafia de prescripciones medicas. El modelo resuelve una tarea muy concreta dentro del proyecto TitanOCR: actuar como segundo lector sobre un reconocedor CTC PP-OCRv5, leyendo cada recorte de forma literal y devolviendo el texto tal cual aparece en la imagen. Se distribuye exclusivamente en formato GGUF (Q8_0 para el modelo de lenguaje y F16 para el proyector de vision) y esta pensado para ejecutarse en CPU a traves de llama.cpp.

El modelo cuenta con 772.845.888 parametros totales, segun los pesos safetensors del repositorio, y ocupa 1,2 GB. La arquitectura subyacente es la de Qwen3.5-0.8B (un transformer multimodal image-text-to-text) mas un proyector de vision de 204.986.560 bytes. Su relevancia actual radica en que demuestra que un modelo de menos de mil millones de parametros, ajustado con LoRA y cuantizado a 8 bits, puede superar a reconocedores OCR clasicos en una tarea de dominio estrecho (lectura de palabras manuscritas de prescripciones), con cifras de exactitud de letras del 76,7 % frente al 11,7 % de PP-OCRv5 en el conjunto de desarrollo.

No obstante, el propio autor advierte que se trata de un modelo de investigacion y demostracion, sin ninguna garantia de precision, y que no debe utilizarse para decisiones clinicas. Todas las lecturas, ademas, deben pasar por revision humana mientras no exista una calibracion ajustada sobre verdad humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.5-0.8B + proyector de vision) |
| Parametros totales | 772.845.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (proyector de vision); F16 en mmproj |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors tambien presente en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del modelo base Qwen/Qwen3.5-0.8B, que es un transformer multimodal capaz de recibir imagenes y texto (pipeline image-text-to-text). Sobre ese modelo base se anadio un proyector de vision independiente, exportado en F16, y se aplicaron adaptadores LoRA con rango 32 y alpha 32 sobre las capas de vision y de lenguaje. El entrenamiento se realizo con Unsloth 2026.9.12, transformers 5.5.0, trl 0.24.0 y peft 0.20.0, durante 3 epocas, con learning rate 2e-4, en precision fp16 sobre una GPU Tesla T4 en Kaggle, con semilla 38. La perdida cayo de 2,90 a 0,015 y el entrenamiento duro 1665 segundos. El registro completo esta en el fichero `run.json` del repositorio.

Los datos de entrenamiento proceden del split Train_Set del dataset RxHandBD (licencia CC BY 4.0), recortados al area de tinta mas un margen del 10 %, resultando en 3.675 recortes de entrenamiento y 193 de validacion. Se excluyeron el split `rxhandbd-dev` de 300 recortes (usado para seleccion de modelo), 295 etiquetas en forma expandida (por ejemplo, un recorte que muestra `Tab.` etiquetado como `Tablet`) y cualquier muestra byte-identica al Test_Set. La innovacion tecnica principal no esta en la arquitectura, sino en el pipeline de uso: cada lectura se alinea por fuerza contra las probabilidades posteriores por fotograma del reconocedor CTC para obtener soporte a nivel de pixel y cajas de palabra, se conserva la lectura perdedora y toda linea emitida por este modelo se marca para revision. Ademas, se emplea una gramatica GBNF (`latin-line.gbnf`) que restringe la salida a letras latinas, digitos, puntuacion de dosis y el token especial `⟨?⟩` para palabras ilegibles.

## Capacidades

- Reconocimiento optico de texto manuscrito (HTR) sobre recortes de una sola linea o palabra, devolviendo el texto de forma literal.
- Lectura de caligrafia de estilo prescripcion medica en escritura latina.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text), con el proyector de vision exportado aparte.
- Generacion restringida por gramatica GBNF, limitada a caracteres latinos, digitos y puntuacion de dosis.
- Marcado de palabras ilegibles mediante el token `⟨?⟩`.
- Decodificacion greedy (temperatura 0, top_k 1) con un maximo de 48 tokens de salida.
- Modo conversacional (tag `conversational` del repositorio).
- No dispone de soporte declarado de tool calling, function calling ni de razonamiento multi-paso.
- No dispone de capacidades de audio declaradas.

## Casos de uso

- Digitalizacion de recetas manuscritas: el modelo lee recortes de palabras de prescripciones y devuelve el texto literal, lo que permite construir un pipeline de transcripcion asistida con revision humana obligatoria, dados los avisos del autor sobre decisiones clinicas.
- Segundo lector en un sistema OCR existente: se integra detras de PP-OCRv5 para contrastar lecturas, ya que en las pruebas de desarrollo paso del 11,7 % al 76,7 % de exactitud de letras en el subconjunto evaluado.
- Verificacion cruzada con alineacion por pixeles: al alinearse contra las probabilidades por fotograma del reconocedor CTC, permite generar cajas de palabra y soporte visual para cada lectura, util en herramientas de anotacion.
- Triaje de documentos con marcado para revision: la gramatica de salida incluye `⟨?⟩` para palabras ilegibles, lo que facilita enrutar automaticamente los recortes dudosos a un revisor humano.
- Investigacion en reconocimiento de texto manuscrito: sirve como linea base reproducible (receta, semilla y fichero `run.json` publicados) para comparar tecnicas de LoRA y cuantizacion Q8_0 en tareas HTR de dominio estrecho.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con llama.cpp (unos 0,5 s por palabra en 2 hilos sobre Apple M5), es adecuado para estaciones de trabajo, portatiles o servidores modestos donde no hay acelerador disponible.
- Prototipado de demos de lectura de caligrafia: con un coste de unos 24 tokens de imagen por palabra y una ventana de imagen configurable (minimo 8, maximo 256 tokens), permite montar demos interactivas de bajo coste.
- Normalizacion previa a busqueda en bases de datos de farmacos: las lecturas pueden alimentar un buscador de nombres de medicamentos, siempre que se mantenga la advertencia de que el modelo puede "corregir" palabras mal escritas hacia nombres plausibles.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas de desarrollo del autor sobre 60 recortes de `rxhandbd-dev`, nunca vistos en entrenamiento, leidos en CPU (Apple M5, 4 hilos) con decodificacion greedy y gramatica. No son una afirmacion de precision.

| Lector | Exactitud de letras | CER | Errores entre el 50 % mejor clasificado (prob. de token x soporte de pixel) |
|---|---|---|---|
| PP-OCRv5 (reconocedor de serie de TitanOCR) | 11,7 % | 0,51 | — |
| Qwen3-VL-2B + run A1 (lector anterior) | 73,3 % | 0,17 | 10,0 % |
| Este modelo (run A2) | 76,7 % | 0,14 | 6,7 % |

En el split de validacion interno (193 recortes, medido en GPU), la exactitud de letras paso del 25,4 % al 67,4 %. El autor advierte que los intervalos son amplios (n = 60), que se trata de una unica poblacion de palabras de prescripciones de Bangladesh y que el Test_Set dorado no se ha leido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo de lenguaje Q8_0 ocupa 833.592.000 bytes y el proyector de vision F16, 204.986.560 bytes, por lo que el peso total en disco ronda 1,04 GB; en memoria cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: no se especifican en la informacion disponible. El entrenamiento se realizo en una Tesla T4 (Kaggle), lo que sugiere que ese nivel de GPU es suficiente para inferencia.
- Compatibilidad con GPU consumer: si, el tamano del modelo (menos de 800 millones de parametros en Q8_0) permite ejecutarlo en GPUs consumer, aunque el autor no publica una lista concreta.
- Despliegue: llama.cpp (runtime `30f7df1a831b`, tag `b11586`), mediante `llama-server` con los parametros `--model`, `--mmproj`, `--threads`, `--threads-batch`, `--parallel`, `--seed`, `--reasoning off`, `--cache-ram 0`, `--no-repack`, `--jinja`, `--image-min-tokens 8` y `--image-max-tokens 256`. Los tags del repositorio incluyen `llama.cpp` y `endpoints_compatible`.
- Latencia: aproximadamente 0,5 s por recorte de palabra en 2 hilos de CPU (Q8_0, Apple M5); una linea larga tarda entre 1 y 1,5 s.
- Throughput: no disponible.
- Preprocesado obligatorio: cada recorte debe redimensionarse a 128 px de alto (manteniendo aspecto, bicubico), con ambos lados redondeados a multiplos de 32 y un maximo de 1024 px de ancho; una linea mas ancha se reduce manteniendo la altura como multiplo de 32 (`titanocr.engines.handwriting.normalise_crop`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud de letras (dev, n=60) | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TitanOCR handwriting reader (Qwen3.5-0.8B) | 772.845.888 | no disponible | 76,7 % | 0,14 | apache-2.0 | GGUF en HuggingFace |
| PP-OCRv5 | no disponible | no disponible | 11,7 % | 0,51 | no disponible en la informacion | reconocedor de serie de TitanOCR |
| Qwen3-VL-2B + run A1 | no disponible | no disponible | 73,3 % | 0,17 | no disponible en la informacion | lector previo de TitanOCR |

No se dispone de informacion sobre otros modelos comparables fuera del ecosistema TitanOCR.

## Limitaciones y advertencias

- Datos de entrenamiento muy estrechos: solo palabras de prescripciones de Bangladesh en escritura latina. Otras caligrafias, idiomas y sistemas de escritura no han sido probados.
- El modelo puede "corregir" de forma indebida: al ser un modelo de lenguaje fluido, puede convertir una palabra mal escrita en un nombre de farmaco plausible. TitanOCR verifica cada lectura contra los pixeles precisamente por este motivo; por si solo, el modelo carece de esa comprobacion.
- Probabilidades sin calibrar: sus probabilidades por token no equivalen a P(correcto).
- No es valido para decisiones clinicas. Es un modelo de investigacion y demostracion que no hace ninguna afirmacion de precision y cuyas lecturas requieren revision humana.
- Hasta que exista una calibracion ajustada sobre verdad humana, toda linea entregada por este modelo se marca para revision.
- Idiomas: unicamente ingles declarado (los datos de entrenamiento son palabras de prescripciones, no texto en ingles general).
- Resultados de benchmark con intervalos amplios (n = 60) y sobre una unica poblacion; el Test_Set dorado no se ha leido.
- Licencia de los pesos: Apache-2.0, igual que el modelo base Qwen/Qwen3.5-0.8B. Los datos de entrenamiento son RxHandBD, con licencia CC BY 4.0, por lo que su reutilizacion exige atribucion.
- Rendimiento en CPU limitado: en torno a 0,5 s por palabra en 2 hilos; en lineas largas puede llegar a 1-1,5 s.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aravsaxena884/titanocr-handwriting-qwen35-08b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto TitanOCR: https://github.com/arav7781/titanocr
- Dataset RxHandBD (Md Masudul Islam, Mendeley Data V3): doi:10.17632/dsb5r6vskg.3
