# avacasey/whisper-tiny_to_japanese_accent_13oct

## Resumen

Whisper tiny Japanese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario avacasey en HuggingFace, orientado a reconocimiento automatico del habla (ASR) sobre ingles hablado con acento japones. El modelo se ha entrenado sobre el dataset Japanese_english y mantiene la arquitectura original de Whisper en su variante mas pequena, con 37.760.640 parametros totales y un repositorio de 0,3 GB. La licencia declarada es Apache-2.0 y los pesos se distribuyen en formato safetensors para su uso con la libreria transformers.

El problema que aborda es concreto: los sistemas ASR genericos degradan su tasa de error cuando el hablante tiene un acento no nativo, y este ajuste busca reducir ese sesgo en el par ingles-hablante japones. El modelo declara una tasa de error de palabra (WER) de 21,4286 sobre el split de test del dataset Japanese_english, con una perdida de validacion de 0,4625, resultados no verificados por un tercero.

Se trata de un modelo experimental y de muy bajo uso (0 descargas y 0 likes en el momento de redactar esta ficha), con una model card generada automaticamente por el Trainer de HuggingFace y sin documentacion adicional sobre composicion del dataset, usos previstos o limitaciones. Su relevancia practica esta en el nicho: transcripcion ligera, desplegable en CPU o en hardware de borde, para audio en ingles con acento japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (entrada log-Mel de 80 canales a 16 kHz); 448 tokens maximos en decodificacion |
| Tipos de cuantizacion | No se declaran cuantizaciones en el repositorio; pesos en safetensors (fp32). Convertible a float16/int8 mediante CTranslate2 o a cuantizaciones GGML mediante whisper.cpp |
| Idiomas soportados | Ingles (en) segun la model card; el nombre del modelo y el dataset apuntan a ingles con acento japones |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con PyTorch/transformers) |

Otros datos del repositorio: tamano 0,3 GB, creado el 13 de octubre de 2026 y actualizado el mismo dia, pipeline `automatic-speech-recognition`, etiquetas `tensorboard`, `generated_from_trainer` y `endpoints_compatible`.

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del modelo base openai/whisper-tiny: un transformer encoder-decoder con 4 capas en el encoder y 4 en el decoder, dimension de modelo 384 y atencion multi-cabeza, que ingiere espectrogramas log-Mel de 80 canales calculados sobre audio mono a 16 kHz. La entrada se trocea en ventanas de 30 segundos y la decodificacion es autorregresiva sobre vocabulario de tokens BPE, con tokens de control para idioma y tarea. No se introducen modificaciones arquitectonicas propias: se trata de un ajuste fino supervisado de los pesos preentrenados.

El entrenamiento se realizo con el Trainer de HuggingFace sobre el dataset Japanese_english (sin detalles publicados sobre tamano, procedencia ni composicion). Los hiperparametros declarados son: learning rate 1e-05, tamano de batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de calentamiento y 2000 pasos totales. Con 2,4876 epocas al final del entrenamiento, se puede estimar de forma aproximada un conjunto de unos 1600 ejemplos (calculo suponiendo ausencia de acumulacion de gradientes, dato no confirmado en la model card). No hay constancia de fases de RLHF, DPO ni ajuste por preferencias. Las versiones de framework empleadas son Transformers 5.19.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.2.

Evolucion registrada durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1,2438 | 1000 | 0,1370 | 0,4813 | 22,2118 |
| 2,4876 | 2000 | 0,0899 | 0,4625 | 21,4286 |

## Capacidades

- Reconocimiento automatico del habla en ingles, con especializacion en habla con acento japones.
- Transcripcion de audio de hasta 30 segundos por ventana, encadenable para audio mas largo mediante segmentacion externa.
- Salida de texto con puntuacion y mayusculas basicas, heredadas del preentrenamiento de Whisper.
- Modelo exclusivamente de voz a texto: no genera audio, no traduce a otros idiomas de forma fiable y no procesa imagenes.
- Inferencia muy ligera (37,8 M de parametros), apta para CPU y dispositivos de borde.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica, es un modelo ASR.
- Capacidades multilingues: la model card declara unicamente ingles; no se documenta soporte de otros idiomas en este ajuste.
- Capacidades especiales (modo thinking, vision, audio de salida): no disponibles.

## Casos de uso

- Subtitulado en tiempo real de reuniones con hablantes japoneses de ingles: el modelo procesa ventanas de 30 segundos y, con 37,8 M de parametros, puede ejecutarse en CPU o en una GPU modesta, lo que permite generar subtitulos en directo sin infraestructura dedicada.
- Transcripcion de soporte tecnico internacional: centralitas que reciben llamadas en ingles de clientes japoneses pueden usar el ajuste para mejorar la calidad de las transcripciones respecto al modelo tiny generico, a coste de computo minimo.
- Preanotacion de datasets de voz: en pipelines de etiquetado, el modelo puede generar transcripciones preliminares de audio con acento japones que despues revisa un anotador humano, reduciendo el tiempo de trabajo manual.
- Interfaces de voz en dispositivos embebidos: dado su tamano (menos de 150 MB en fp32), es viable integrarlo en Raspberry Pi, moviles o sistemas empotrados para comandos de voz en ingles con acento japones.
- Transcripcion de material docente y conferencias: grabaciones de ponentes japoneses en ingles pueden transcribirse por lotes sin GPU, con la advertencia del WER declarado del 21,4 %.
- Pruebas de regresion en pipelines ASR: sirve como modelo de referencia ligero en tests automatizados de CI/CD que verifiquen el funcionamiento de un sistema de transcripcion de extremo a extremo sin consumir recursos de GPU.
- Analitica de conversaciones: extraccion de texto para busqueda, clasificacion de intenciones o resumen posterior en sistemas de atencion al cliente con base de hablantes japoneses.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados por terceros):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Automatic Speech Recognition | Japanese English | test | WER | 21,4286 % |
| Automatic Speech Recognition | Japanese English | test | Loss | 0,4625 |

No se han publicado en la informacion disponible resultados comparativos en benchmarks estandar como MMLU, HumanEval, GSM8K, LibriSpeech o Common Voice, ni cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 144 MiB solo para pesos (37.760.640 parametros x 4 bytes), mas activaciones y cache de decodificacion; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 72 MiB de pesos.
- VRAM estimada en int8: aproximadamente 36 MiB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una GPU integrada moderna pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en la mayoria de generaciones anteriores.
- Inferencia en CPU: plenamente viable dado el tamano del modelo; es el escenario de despliegue mas razonable para este ajuste. No se dispone de cifras medidas de latencia ni de factor de tiempo real.
- Opciones de despliegue: pipeline de `transformers` (formato nativo), CTranslate2/faster-whisper (requiere conversion), whisper.cpp (requiere conversion a GGML), ONNX Runtime (requiere exportacion). El soporte de Whisper en vLLM y TGI es limitado o experimental, por lo que no se recomienda como via principal.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avacasey/whisper-tiny_to_japanese_accent_13oct | 37,8 M | 30 s | 21,43 % (no verificado, dataset Japanese_english) | Apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,8 M aprox. | 30 s | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M aprox. | 30 s | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M aprox. | 30 s | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace |

No se dispone de resultados comparativos directos entre este ajuste y los modelos base sobre el mismo dataset, por lo que no es posible cuantificar la mejora obtenida con el fine-tuning frente a openai/whisper-tiny sin acento. No se conocen otros ajustes publicos equivalentes especializados en acento japones sobre ingles en el rango de 40 M de parametros.

## Limitaciones y advertencias

- WER del 21,43 % sobre el split de test: es una tasa de error alta para uso en produccion sin revision humana, y el resultado esta marcado como no verificado en el model-index.
- Indicicios de sobreajuste: la perdida de entrenamiento baja hasta 0,0899 mientras la de validacion se mantiene en 0,4625 y el WER solo mejora 0,78 puntos entre el paso 1000 y el 2000.
- Evaluacion limitada a un unico dataset (Japanese_english) y a un unico split, sin validacion cruzada ni evaluacion en corpus independientes como Common Voice o LibriSpeech.
- Model card practicamente vacia: las secciones de descripcion, usos previstos, datos de entrenamiento y limitaciones contienen "More information needed".
- Dataset de entrenamiento sin documentar: se desconoce su tamano real, procedencia, condiciones de grabacion y posibles sesgos de acento, genero o registro.
- Idioma restringido al ingles segun la model card: puede degradarse gravemente o producir salidas incoherentes con audio en japones u otros idiomas.
- Riesgo de alucinacion en silencios, ruido de fondo o audio musical, comportamiento heredado de los modelos Whisper pequenos.
- Sensibilidad a la calidad del audio: al ser el modelo tiny de la familia Whisper, el rendimiento cae con ruido, reverberacion o audio telefonico de banda estrecha.
- Licencia Apache-2.0 declarada, lo que permite uso comercial, pero conviene verificar la procedencia del dataset de ajuste antes de un despliegue en produccion.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso real en comunidad, pruebas de terceros ni mantenimiento posterior a la publicacion.
- Fecha de publicacion en el repositorio (13 de octubre de 2026) y uso de una version de desarrollo de Transformers (5.19.0.dev0): pueden aparecer incompatibilidades con versiones estables de la libreria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avacasey/whisper-tiny_to_japanese_accent_13oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste (Japanese_english): no disponible en la informacion proporcionada
- Paper de referencia de la arquitectura Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): no disponible en la informacion proporcionada
- Repositorio oficial de OpenAI Whisper: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
