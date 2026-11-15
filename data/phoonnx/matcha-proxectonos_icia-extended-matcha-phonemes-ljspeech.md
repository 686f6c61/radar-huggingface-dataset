# Phoonnx/matcha-proxectonos_icia-extended-matcha-phonemes-ljspeech

## Resumen

`matcha-proxectonos_icia-extended-matcha-phonemes-ljspeech` es un modelo de sintesis de voz (text-to-speech) del tipo Matcha-TTS, publicado por el usuario Phoonnx como un submodelo extraido del repositorio agregador `Phoonnx/phoonnx-matcha`. Se distribuye en formato ONNX y esta pensado para su uso con la libreria `phoonnx`, un motor de TTS basado en ONNX. El nombre indica que el modelo fue entrenado sobre fonemas del corpus ICIA extended y sobre el dataset LJSpeech, y que emplea fonemas matcha como representacion de entrada.

El modelo resuelve la conversion de texto a audio mediante una arquitectura de sintesis neuronal no autorregresiva de tipo flow-matching (familia Matcha-TTS), que genera espectrogramas mel a partir de secuencias de fonemas y los convierte en onda mediante un vocoder acoplado. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia ligera.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados. La informacion disponible no permite confirmar el tamano en parametros, la longitud de contexto ni los idiomas soportados mas alla de lo que sugiere el nombre del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (sintesis neuronal no autorregresiva, flow-matching) sobre fonemas; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | no disponible (el nombre sugiere corpus ICIA extended y LJSpeech, este ultimo en ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Matcha-TTS, una arquitectura de sintesis de voz no autorregresiva que combina un encoder de fonemas con un decoder basado en flow-matching (modelos de flujo continuo normalizador) para generar espectrogramas mel, que posteriormente se convierten en audio mediante un vocoder neuronal. A diferencia de los modelos autorregresivos tipo Tacotron, Matcha genera la secuencia completa en una sola pasada, lo que reduce la latencia de inferencia.

Segun el nombre del repositorio, la entrada son fonemas matcha derivados de un corpus denominado `proxectonos_icia-extended`, y el modelo se entreno sobre el dataset LJSpeech (lectura de un solo hablante en ingles). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. La model card no documenta innovaciones tecnicas propias mas alla de la exportacion a ONNX para su uso con la libreria phoonnx.

## Capacidades

- Sintesis de voz a partir de texto convertido previamente a fonemas.
- Generacion de audio de un solo hablante (el nombre sugiere un unico hablante de LJSpeech).
- Inferencia mediante ONNX Runtime a traves de la libreria phoonnx.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingue; el corpus de entrenamiento indicado es en ingles.
- No se documentan modos especiales como thinking, vision o audio de entrada.

## Casos de uso

- Generacion de locuciones para prototipos de asistentes de voz: el modelo puede convertir texto a audio en un pipeline phoonnx para validar la integracion de TTS en una aplicacion antes de invertir en un modelo de produccion.
- Lectura de articulos o documentacion en aplicaciones de accesibilidad: al ser un modelo compacto (~0,1 GB en ONNX), puede desplegarse en entornos con recursos limitados para leer texto en voz alta.
- Pruebas de regresion en pipelines de TTS: sirve como referencia fija para comparar la calidad de sintesis entre versiones del motor phoonnx.
- Generacion de audio para contenido educativo o demos internas: su licencia GPL-3.0 permite su uso en proyectos de codigo abierto compatibles con esa licencia.
- Investigacion sobre sintesis neuronal no autorregresiva: util para experimentar con la familia Matcha-TTS y comparar variantes de fonemizacion.
- Integracion en aplicaciones de escritorio o embebidas: el formato ONNX y el tamano reducido facilitan la ejecucion en CPU sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (~0,1 GB) es probable que quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; el uso con vLLM, llama.cpp, Ollama o TGI no aplica a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matcha-proxectonos_icia-extended-matcha-phonemes-ljspeech | Matcha-TTS (ONNX) | no disponible | no aplica | GPL-3.0 | Hugging Face, 0 descargas |
| Piper (rhasspy) | VITS (ONNX) | no disponible | no aplica | MIT (segun voces) | Amplia, multiples idiomas |
| Coqui TTS | Tacotron2 / VITS / otros | no disponible | no aplica | MPL-2.0 (varia) | Amplia, multiples idiomas |
| Matcha-TTS original | Matcha-TTS | no disponible | no aplica | MIT (repo de investigacion) | GitHub, referencia academica |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- La licencia GPL-3.0 es copyleft fuerte: su integracion en productos propietarios puede obligar a liberar el codigo derivado, lo que limita su uso comercial cerrado.
- No se documentan sesgos del hablante ni del corpus de entrenamiento; al derivar de LJSpeech, es probable que herede el sesgo de un unico hablante y de un dominio de lectura concreto.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos ante fonemas fuera de distribucion.
- No se documentan los idiomas soportados; el uso fuera del ingles (o del idioma del corpus ICIA) no esta garantizado.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La model card es minima y remite a la licencia del repositorio fuente sin detallarla; conviene verificar la procedencia de los datos de entrenamiento antes de un uso comercial.
- El modelo depende de la libreria phoonnx y del formato ONNX; no es directamente compatible con frameworks de inferencia de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-proxectonos_icia-extended-matcha-phonemes-ljspeech
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-matcha
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
