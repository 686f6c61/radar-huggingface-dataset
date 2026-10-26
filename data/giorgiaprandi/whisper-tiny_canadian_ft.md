# GiorgiaPrandi/whisper-tiny_canadian_ft

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny realizado por GiorgiaPrandi sobre el conjunto de datos naharte/canadian_english, orientado a reconocimiento automatico del habla en ingles canadiense. Se trata de un modelo denso de tipo encoder-decoder transformer con 37.760.640 parametros, publicado en formato safetensors y con licencia Apache 2.0.

El objetivo del ajuste es adaptar un modelo ASR generico y muy ligero a las particularidades foneticas y lexicas del ingles canadiense, un dominio donde los modelos multilingues pequenos suelen mostrar tasas de error elevadas. El autor declara un WER de 17,99 % sobre el split de test del dataset, obtenido tras 2 epocas de entrenamiento (2000 pasos) con un learning rate de 1e-5.

Su relevancia practica esta en el nicho de despliegue: con menos de 40 millones de parametros y un repositorio de 0,3 GB, es candidato a transcripcion en dispositivos con recursos limitados (CPU, movil, edge), a diferencia de las variantes medium o large de Whisper. Ahora bien, el modelo es un experimento de ajuste con cero descargas y una unica interaccion en Hugging Face, sin model card completada ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper; heredada de openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia (caracteristica de la familia Whisper; no se detalla en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (ingles; el ajuste se centra en ingles canadiense) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | automatic-speech-recognition |
| Dataset de ajuste | naharte/canadian_english (split test para evaluacion) |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura es la de openai/whisper-tiny: un transformer encoder-decoder que procesa espectrogramas mel como entrada y genera tokens de texto de forma autorregresiva, con deteccion de idioma y marcas de tiempo como tareas auxiliares del mismo modelo. No se introducen modificaciones estructurales en el ajuste; el autor parte de los pesos preentrenados y los adapta al dominio. El numero de capas, la dimension del modelo y el numero de cabezas de atencion no se especifican en la model card y se corresponden con los del modelo base.

El entrenamiento se realizo con los siguientes hiperparametros declarados: learning rate 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW torch fused (beta1 0,9, beta2 0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales, equivalentes a 2 epocas. La perdida de entrenamiento bajo de 0,2766 (epoca 1) a 0,1024 (epoca 2), mientras la perdida de validacion practicamente se estanco (0,3957 a 0,3936) y el WER solo mejoro de 18,1747 a 17,9911, lo que sugiere que el modelo alcanza pronto el limite de su capacidad con este volumen de datos. El autor no documenta la composicion del dataset, el numero de horas de audio ni si se aplicaron tecnicas de aumento de datos o RLHF/DPO (no aplicables en un ajuste ASR supervisado).

## Capacidades

- Transcripcion de voz a texto en ingles, con enfasis en acentos y vocabulario del ingles canadiense.
- Reconocimiento de habla sobre ventanas de audio de hasta 30 segundos por pasada, con posibilidad de encadenar ventanas para audios mas largos mediante el pipeline de transformers.
- Generacion de marcas de tiempo a nivel de segmento, funcionalidad heredada de la familia Whisper (no verificada en esta model card).
- Deteccion de idioma y traduccion de voz a texto: capacidades presentes en el modelo base, aunque no documentadas ni evaluadas tras el ajuste.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades ajenas al proposito del modelo.
- No dispone de modo "thinking", vision ni audio-vision.
- Capacidad multilingue: no disponible; la model card declara unicamente `en`.

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos corporativos canadienses: el modelo puede convertir audio de hasta 30 segundos por segmento en texto, con un consumo de memoria inferior a 1 GB en FP32, apto para ejecutarse en la misma maquina del usuario sin depender de la nube.
- Subtitulado automatico de contenido audiovisual local: el reducido tamano del modelo permite procesar horas de video en CPU en segundo plano, aceptando un WER de en torno al 18 % como compromiso entre coste y precision.
- Prototipado rapido de interfaces de voz: al ser compatible con el pipeline `automatic-speech-recognition` de transformers, se integra en pocas lineas en una aplicacion web o de escritorio para validar un producto antes de invertir en un modelo mayor.
- Investigacion sobre sesgos dialectales en ASR: sirve como punto de comparacion frente a whisper-tiny original para medir cuanto mejora un ajuste especifico de acento con un dataset pequeno.
- Despliegue en dispositivos edge o moviles: con pesos de aproximadamente 151 MB en FP32, encaja en entornos con memoria limitada donde whisper-small o medium no son viables.
- Generacion de datos etiquetados a bajo coste: transcripcion masiva de audios en ingles canadiense para preetiquetar y luego revisar manualmente, usando el modelo como primer paso de un pipeline de anotacion.
- Base para iteraciones posteriores: por su licencia Apache 2.0 y su tamano, es un punto de partida razonable para nuevos ajustes de dominio con presupuesto de computo minimo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Automatic Speech Recognition | naharte/canadian_english | test | WER | 17,9911 % |
| Automatic Speech Recognition | naharte/canadian_english | validacion | Loss | 0,3936 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | WER (%) |
|---|---|---|---|---|
| 1 | 1000 | 0,2766 | 0,3957 | 18,1747 |
| 2 | 2000 | 0,1024 | 0,3936 | 17,9911 |

No se han publicado resultados frente a otros benchmarks (MLU, LibriSpeech, Common Voice u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en FP32 y 0,08 GB en FP16 para los pesos; con activaciones y buffers de audio, un entorno de 0,5-1 GB es suficiente para ejecutar el pipeline de transformers.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100; el modelo no aprovechara la capacidad de las GPU de gama alta, que quedarian sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en iGPU modernas con memoria compartida.
- CPU: viable para transcripcion en tiempo real o casi real; no se publican medidas de latencia ni de factor de tiempo real (RTF) en la informacion disponible.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers, servidores de inferencia compatibles con transformers, exportacion a ONNX Runtime o conversion a CTranslate2 (faster-whisper) y a whisper.cpp para entornos C/C++; no hay artefactos GGUF publicados en el repositorio, por lo que el uso con llama.cpp/Ollama requeriria conversion manual. vLLM no ofrece soporte oficial de Whisper.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GiorgiaPrandi/whisper-tiny_canadian_ft | 37,76 M | 30 s | 17,99 % (Canadian English, test) | apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-tiny (base) | ~37,76 M | 30 s | no disponible en la informacion | apache-2.0 (MIT en el repositorio original) | Ampliamente disponible |
| GiorgiaPrandi/whisper-tiny_british_ft | no disponible | 30 s (familia Whisper) | no disponible | no disponible en la informacion | Hugging Face |
| aiidddaan/whisper-tiny_to_canadian_accent_09oct | no disponible | 30 s (familia Whisper) | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos ajustes, ya que cada uno evalua sobre su propio split del dataset naharte/canadian_english o de otros conjuntos, lo que impide una comparacion directa de WER.

## Limitaciones y advertencias

- El WER de 17,99 % es alto en terminos absolutos para produccion; un valor cercano al 18 % implica errores frecuentes en palabras, nombres propios y cifras.
- La metrica esta marcada como no verificada (`verified: false`) y procede del propio autor, sin evaluacion independiente.
- El modelo solo declara soporte de ingles; su comportamiento con otros idiomas o con acentos no canadienses no se ha documentado y previsiblemente degradara respecto al modelo base.
- Riesgo de alucinacion tipico de Whisper: repeticion de frases, invencion de contenido en silencios o musica, y marcas de tiempo inexactas.
- Sesgos: el dataset de ajuste (naharte/canadian_english) no esta descrito en la model card, por lo que se desconocen su composicion demografica, duracion y calidad de las transcripciones de referencia.
- No hay informacion sobre el preprocesado de audio, la duracion total de entrenamiento ni la particion exacta de datos, lo que dificulta reproducir el resultado.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), incluidas las de usos previstos y limitaciones.
- El modelo se entreno con versiones de desarrollo del ecosistema (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130), lo que puede generar incompatibilidades con entornos estables.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del dataset de origen antes de redistribuir derivados.
- Con cero descargas y una unica interaccion, no existe evidencia de uso en produccion ni comunidad que reporte fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiorgiaPrandi/whisper-tiny_canadian_ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/canadian_english
- Modelo hermano (ingles britanico): https://huggingface.co/GiorgiaPrandi/whisper-tiny_british_ft
- Ajuste alternativo sobre el mismo dataset: https://huggingface.co/aiidddaan/whisper-tiny_to_canadian_accent_09oct
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Ficha de Whisper-Tiny en Qualcomm AI Hub: https://aihub.qualcomm.com/models/whisper_tiny
- Documentacion de la API Whisper de OpenAI: https://developers.openai.com/api/docs/models/whisper-1
