# BarrySong/HuPER-CoreML

## Resumen

HuPER-CoreML es una conversión a Core ML del reconocedor de fonemas HuPER (huper29/huper_recognizer), realizada por BarrySong para la aplicación Accent Lab, una app de macOS para practicar la pronunciación del inglés. El modelo original se basa en WavLM-large con una cabeza CTC que emite 39 fonemas ARPAbet más un token DX, y esta versión está cuantizada a int8 para ejecutarse de forma eficiente en hardware Apple.

Su propósito es la evaluación de pronunciación a nivel de sonido: dado un fragmento de audio en inglés, produce log-probabilidades por fotograma (una cada 20 ms) que permiten calcular puntuaciones de bondad de pronunciación (goodness-of-pronunciation) para cada fonema. Esto lo hace útil para aplicaciones de aprendizaje de idiomas que necesitan retroalimentación fonética granular sin depender de la nube.

Es relevante porque las conversiones a Core ML con cuantización int8 permiten desplegar modelos de reconocimiento fonético directamente en Mac, aprovechando Apple Silicon (CPU, GPU o Neural Engine), con validación explícita de la desviación respecto al modelo PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-large con cabeza CTC (basado en wav2vec 2.0) |
| Parametros totales | no disponible (tamaño del repo: 0,3 GB con pesos int8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | Audio de 1 a 20 segundos (16 kHz mono) |
| Tipos de cuantizacion | int8 (lineal, simétrica, por canal); computación en FP32 |
| Idiomas soportados | Ingles (fonemas ARPAbet) |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (.mlmodelc) |

## Arquitectura y entrenamiento

El modelo es una conversión del reconocedor HuPER original, que utiliza WavLM-large como extractor de características de audio auto-supervisado y una cabeza CTC (Connectionist Temporal Classification) para clasificar cada fotograma de 20 ms en uno de 46 etiquetas: los 39 fonemas del inventario ARPAbet más tokens adicionales (incluido DX). La salida es un log-softmax sobre esas 46 etiquetas por fotograma.

No se han publicado detalles del entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la informacion disponible. La innovacion principal de esta version es la conversion a Core ML con cuantizacion int8 simetrica por canal para las capas lineales, manteniendo la aritmetica en FP32, lo que reduce el tamano a 0,3 GB preservando en gran medida el comportamiento del modelo original.

## Capacidades

- Reconocimiento fonetico a nivel de fonema sobre audio en ingles (16 kHz, mono, 1-20 s)
- Emision de log-probabilidades por fotograma (46 etiquetas, un fotograma cada 20 ms) aptas para decodificacion CTC
- Calculo de puntuaciones de bondad de pronunciacion (goodness-of-pronunciation) por fonema, con umbral de decision (por ejemplo, -2,0)
- No genera texto ni transcripciones en lenguaje natural; su salida es estrictamente fonetica
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de audio especializado
- Ejecucion nativa en macOS 15 o posterior mediante Core ML

## Casos de uso

- Practica de pronunciacion en aplicaciones de escritorio: Accent Lab lo usa para puntuar cada sonido emitido por el usuario en un Mac, sin enviar audio a la nube, gracias a la inferencia local con Core ML.
- Retroalimentacion fonetica granular en apps de aprendizaje de ingles: al emitir probabilidades por fonema y fotograma, se puede señalar al estudiante exactamente que sonido ha fallado (por ejemplo, confundir /ɪ/ y /iː/).
- Evaluacion automatica de pronunciacion en tests orales: la puntuacion goodness-of-pronunciation con umbral permite decidir si cada fonema objetivo se ha producido correctamente.
- Analisis fonetico de corpus de habla en ingles: investigadores pueden alinear audio con fonemas ARPAbet a 20 ms de resolucion sin GPU.
- Deteccion de acento y errores sistematicos: comparando las probabilidades fonemicas de un hablante con las esperadas, se pueden identificar patrones de interferencia del idioma materno.
- Integracion en pipelines de audio en Apple Silicon: el formato .mlmodelc permite incrustarlo en apps nativas (Swift) o herramientas de linea de comandos sin dependencias de Python en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (PER, MMLU, etc.) en la informacion disponible. La model card si incluye una validacion de fidelidad de la conversion respecto al modelo PyTorch original, sobre 17 lineas de habla real (845 fonemas):

| Metrica | Valor |
|---|---|
| Desviacion media de la puntuacion goodness-of-pronunciation | 0,34 |
| Fonemas que cambian de lado del umbral (-2,0) | 4 de 845 |
| Coincidencia de la mejor etiqueta por fotograma | 98 % |

## Requisitos de hardware

- Tamano del modelo: 0,3 GB con pesos int8; la VRAM/requisito de memoria es bajo en terminos absolutos, aunque WavLM-large procesa secuencias largas y el consumo real depende de la duracion del audio (hasta 20 s)
- Requisito de plataforma: macOS 15 o posterior (Core ML compilado); no hay pesos GGUF ni safetensors en este repositorio
- Compatible con consumer hardware Apple: Mac con Apple Silicon (M1 y posteriores) puede ejecutarlo via CPU, GPU o Neural Engine; no se han publicado tiempos de latencia concretos
- No requiere GPU dedicada NVIDIA; no es aplicable el despliegue con vLLM, TGI o llama.cpp al no ser un modelo de lenguaje ni estar en formatos estandar de servidor
- Despliegue: integracion directa en apps macOS/iOS mediante Core ML (Swift), o via Python con coremltools para pruebas
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| HuPER-CoreML (este) | WavLM-large + CTC | Reconocimiento fonetico / pronunciacion | int8 | MIT | macOS (Core ML) |
| huper29/huper_recognizer (original) | WavLM-large + CTC | Reconocimiento fonetico / pronunciacion | FP (PyTorch) | MIT | PyTorch multiplataforma |
| wav2vec2-base fonema (variantes en HF) | wav2vec 2.0 + CTC | Reconocimiento fonetico | FP | varia segun repo | PyTorch/ONNX |

Comparado con el original PyTorch, esta version sacrifica una precision minima (desviacion media de 0,34 en la puntuacion GOP, 98 % de coincidencia de etiquetas) a cambio de ejecucion nativa y eficiente en Mac. Frente a alternativas genericas de reconocimiento fonetico basadas en wav2vec 2.0, HuPER esta especializado en evaluacion de pronunciacion con inventario ARPAbet de 39 fonemas.

## Limitaciones y advertencias

- Solo reconoce fonemas del ingles (ARPAbet); no es util para otros idiomas ni para transcripcion en texto natural
- Entrada limitada a 1-20 segundos de audio a 16 kHz mono, normalizada a media cero y varianza unitaria; audios mas largos deben fragmentarse
- La cuantizacion int8 introduce desviacion medible respecto al modelo original (0,34 de media en GOP; ~0,5 % de fonemas cambian de decision), lo que puede importar en aplicaciones con umbrales ajustados
- Requiere macOS 15 o posterior; no hay version multiplataforma en este repositorio
- Al ser un modelo discriminativo de audio, no presenta riesgos tipicos de alucinacion de LLM, pero las puntuaciones de pronunciacion pueden ser imprecisas con ruido de fondo, microfonos de baja calidad o hablantes atipicos
- No hay datos publicados de sesgos por acento, genero o edad del hablante; conviene validar con poblaciones diversas antes de uso en evaluacion de alto impacto
- Licencia MIT: sin restricciones para uso comercial, con atribucion al modelo original (huper29/huper_recognizer)
- Repositorio con 0 descargas registradas en el momento de la ficha: falta de adopcion comunitaria y de auditoria externa

## Enlaces

- Modelo Core ML: https://huggingface.co/BarrySong/HuPER-CoreML
- Modelo original PyTorch: https://huggingface.co/huper29/huper_recognizer
