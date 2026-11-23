# mahesh27/mms-300m-xsampa-doreco

## Resumen

`mms-300m-xsampa-doreco` es un modelo de reconocimiento automatico del habla (ASR) especializado en la transcripcion fonetica en alfabeto X-SAMPA, desarrollado por el autor de Hugging Face `mahesh27`. Se trata de un fine-tuning de `facebook/mms-300m` (la familia Massively Multilingual Speech de Meta), que a su vez parte de una arquitectura Wav2Vec2. El modelo no transcribe texto ortografico, sino secuencias de fonemas en notacion X-SAMPA para 45 lenguas cubiertas por el corpus DoReCo (Documentation of Languages and Dialects of the World).

Su relevancia practica esta en el alineamiento forzado (forced alignment) y la evaluacion fonetica: al emitir fonemas en lugar de grafemas, permite segmentar audio a nivel de fonema y palabra mediante CTC, y calcular metricas de error fonetico comparables entre lenguas con ortografias muy dispares. El modelo tiene 316.639.564 parametros y un repositorio de 1,5 GB en formato safetensors.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional + transformer, CTC) |
| Parametros totales | 316.639.564 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada tipica de Wav2Vec2, no declarada por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | 45 lenguas del corpus DoReCo (listado concreto no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2 de 300M de parametros (familia `facebook/mms-300m`) con cabeza CTC adaptada a un vocabulario de salida en X-SAMPA. La cadena de entrenamiento declarada es en dos etapas: primero un fine-tuning intermedio sobre FLEURS con salida en IPA (`mahesh27/mms-300m-ipa-fleurs`) y despues un ajuste sobre el corpus DoReCo con salida en X-SAMPA. No se detallan en la informacion disponible el numero de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas.

La innovacion principal no es arquitectonica sino de representacion: sustituir la salida ortografica por un inventario fonetico comun (X-SAMPA) permite entrenar un unico cabezal para lenguas con sistemas de escritura heterogeneos y facilita el alineamiento mediante `ctc-segmentation`, siguiendo el ejemplo de uso de Wav2Vec2. El trabajo asociado se publica en Findings of EMNLP 2026 (Akavarapu, Daniel y Jager), centrado en metricas de alineamiento forzado a nivel de fonema y palabra con representaciones auto-supervisadas del habla.

## Capacidades

- Reconocimiento automatico del habla con salida en fonemas X-SAMPA (no texto ortografico).
- Alineamiento forzado audio-texto a nivel de fonema y de palabra mediante CTC.
- Cobertura de 45 lenguas del corpus DoReCo, incluidas lenguas con poca o nula tradicion escrita estandarizada.
- Extraccion de representaciones acusticas intermedias (uso como encoder para tareas descendentes).
- Segmentacion temporal de audio a partir de las probabilidades CTC.
- No se documenta soporte de tool calling, agentes, vision, audio generativo ni modo de razonamiento.

## Casos de uso

- Alineamiento forzado en documentacion linguistica: dado un audio de campo y su transcripcion, el modelo produce probabilidades CTC que `ctc-segmentation` convierte en fronteras de fonema y palabra, lo que acelera la anotacion en proyectos de documentacion de lenguas minoritarias.
- Evaluacion de sistemas de sintesis de voz: comparar la salida fonetica del modelo sobre audio sintetizado frente a audio de referencia permite medir inteligibilidad a nivel de fonema con una metrica independiente del idioma.
- Analisis fonetico cuantitativo: extraer secuencias X-SAMPA de un corpus para estudiar inventarios, alofonia o variacion dialectal sin depender de la ortografia de cada lengua.
- Investigacion en ASR multilingue de bajos recursos: usar las representaciones del encoder como inicializacion o como extractor de caracteristicas en lenguas con pocos datos etiquetados.
- Deteccion de errores de pronunciacion: alineando la secuencia esperada con la producida por el modelo se pueden localizar desviaciones foneticas concretas en aprendizaje de lenguas o logopedia.
- Validacion de pipelines de audio: servir como componente de control en pruebas de regresion de sistemas de reconocimiento, comparando distancias foneticas entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia el articulo de EMNLP 2026 sobre metricas de alineamiento; no se incluyen cifras de PER (phoneme error rate), WER ni comparaciones numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (316,6 M de parametros), con picos adicionales por activaciones y buffers de atencion.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: RTX 3060/4060 o superiores para uso interactivo; A100/H100 no son necesarias salvo para procesar grandes volumenes en lote.
- Despliegue: `transformers` con `Wav2Vec2ForCTC`, `pipeline("automatic-speech-recognition")`, o servidores tipo TGI/vLLM para Wav2Vec2 segun soporte de la version; `ctc-segmentation` para el alineamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mahesh27/mms-300m-xsampa-doreco` | 316,6 M | Fonemas X-SAMPA, 45 lenguas DoReCo | Apache 2.0 | Hugging Face, 688 descargas |
| `facebook/mms-300m` | ~300 M | Texto ortografico, 1000+ lenguas | CC-BY-NC 4.0 | Hugging Face |
| `mahesh27/mms-300m-ipa-fleurs` | ~300 M | Fonemas IPA, FLEURS | no disponible | Hugging Face |
| `facebook/wav2vec2-xlsr-53-espeak-cv-ft` | ~300 M | Fonemas tipo eSpeak, ingles | Apache 2.0 | Hugging Face |

La diferencia clave frente a `facebook/mms-300m` es la salida fonetica y la licencia Apache 2.0, que permite uso comercial sin las restricciones no comerciales del modelo original de Meta. Frente a `wav2vec2-xlsr-53-espeak-cv-ft`, la cobertura es multilingue (45 lenguas) en lugar de centrada en ingles. No se dispone de comparaciones de rendimiento numericas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La salida es fonetica (X-SAMPA), no texto legible; requiere un paso de conversion o interpretacion posterior.
- El inventario de fonemas y el rendimiento estan acotados a las 45 lenguas de DoReCo; el comportamiento fuera de ese conjunto no esta documentado.
- No se publican cifras de error (PER/WER) ni detalles de evaluacion, por lo que la calidad real por lengua es desconocida.
- Riesgo de alucinacion fonetica en audio con ruido, solapamiento de hablantes o code-switching: el decodificado CTC puede producir secuencias plausibles pero incorrectas.
- Sesgos derivados del corpus de entrenamiento (dominios de documentacion linguistica, condiciones de grabacion de campo) que pueden no generalizar a audio telefonico o de estudio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `facebook/mms-300m` esta bajo CC-BY-NC 4.0; conviene revisar la compatibilidad de licencias antes de un despliegue comercial.
- No se documentan limitaciones especificas de contexto ni de longitud de audio; en Wav2Vec2 el audio largo debe trocearse en ventanas.
- La model card no incluye informacion sobre sesgos demograficos ni evaluacion de equidad entre hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahesh27/mms-300m-xsampa-doreco
- Modelo base: https://huggingface.co/facebook/mms-300m
- Modelo intermedio IPA/FLEURS: https://huggingface.co/mahesh27/mms-300m-ipa-fleurs
- Herramienta de segmentacion CTC: https://github.com/lumaku/ctc-segmentation
- Articulo citado (Findings of EMNLP 2026): https://aclanthology.org/2026.findings-emnlp.279/
