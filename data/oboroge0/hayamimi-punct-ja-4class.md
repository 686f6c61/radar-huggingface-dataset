# oboroge0/hayamimi-punct-ja-4class

## Resumen

hayamimi-punct-ja-4class es un modelo de restauracion de puntuacion en japones desarrollado por el usuario oboroge0 dentro del proyecto hayamimi, una herramienta de transcripcion de voz en tiempo real. Su funcion es insertar los signos de puntuacion japoneses 、(coma), 。(punto), ？(interrogacion) y ！(exclamacion) en texto que carece de ellos, un paso habitual tras la salida de un sistema de reconocimiento automatico del habla (ASR), que suele producir transcripciones sin marcas de puntuacion.

Tecnicamente es un clasificador de tokens (token classification) construido sobre sbintuitions/modernbert-ja-30m, un modelo ModernBERT japones de aproximadamente 30 millones de parametros con licencia MIT, afinado sobre texto web japones del subconjunto jpn_Jpan de FineWeb-2. El resultado se distribuye en formato ONNX, con un export fp32 de 147 MB y una version int8 dinamica de 37 MB pensada para inferencia en CPU, ademas de los pesos PyTorch en safetensors para reentrenamiento.

Su relevancia practica es doble: por un lado, la licencia MIT de los pesos (con atribucion obligatoria a FineWeb-2 por la licencia ODC-By del dataset) lo hace directamente utilizable en productos comerciales; por otro, su rendimiento declarado sobre FLEURS ja (F1 de 0,887 en fp32 y 0,888 en int8) supera ampliamente a la linea base de hayamimi y reduce la latencia por linea de 44 ms a 4,6 ms en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT con cabeza de clasificacion de tokens (derivada de sbintuitions/modernbert-ja-30m) |
| Parametros totales | Aproximadamente 30 M (segun la denominacion del modelo base; no se detalla en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX, 147 MB) e int8 dinamico (ONNX Runtime, 37 MB, recomendado para CPU) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT (pesos); atribucion obligatoria a FineWeb-2 por licencia ODC-By 1.0 del dataset de entrenamiento |
| Formato de pesos | ONNX (punct_4class.onnx, quantized_ort/punct_4class.int8.onnx), safetensors (hf/model.safetensors), tokenizer.json, tokenizer_config.json, config.json, SHA256SUMS |

Datos adicionales: tamano del repositorio 0,3 GB, pipeline token-classification, 0 descargas y 0 likes en el momento de la consulta, creado el 16 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo reutiliza el encoder ModernBERT japones de 30 millones de parametros de SB Intuitions y sustituye la cabeza original por una cabeza de clasificacion de tokens con cuatro clases de puntuacion (、 。 ？ ！), entrenada para etiquetar cada posicion del texto con la marca que debe insertarse. El modelo no genera texto ni reescribe caracteres: unicamente decide donde insertar signos, por lo que la entrada y la salida comparten exactamente los mismos caracteres. La entrada esperada esta normalizada en NFKC mediante ja_text_norm.safe_nfkc, que preserva los caracteres de ancho completo ？ y ！.

El entrenamiento se realizo sobre texto web japones densamente puntuado procedente del subconjunto jpn_Jpan del dataset HuggingFaceFW/fineweb-2. El flujo documentado en el repositorio de hayamimi es scripts/make_punct_trainset.py, seguido de scripts/train_punct_ja.py y scripts/export_punct_4class.py, ejecutado en una unica RTX 3080 Ti y con una duracion de minutos, lo que indica un ajuste ligero sobre el modelo base. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO, tecnicas que en cualquier caso no resultan habituales en un clasificador de tokens de este tipo.

Una innovacion destacable no esta en la arquitectura sino en la capa de decodificacion de hayamimi: la clase PunctuatorJa4Class aplica puertas de umbral sobre las salidas del modelo. Por defecto nunca emite ！ (exclaim_threshold=1.01) porque en habla la cabeza de exclamacion se activa con la misma confianza en narracion enfatica que en exclamaciones reales, y aplica un umbral de 0,8 a la coma (comma_threshold=0.8). Para texto densamente puntuado puede bajarse el umbral de exclamacion a 0,9.

## Capacidades

- Restauracion de puntuacion en japones con cuatro clases: 、 。 ？ ！.
- Clasificacion por token sobre texto sin puntuar, insertando marcas sin modificar ningun caracter de la entrada.
- Deteccion de signos de interrogacion con recall declarado de 1,00 sobre un conjunto de preguntas.
- Inferencia en CPU con latencia muy baja: 4,6 ms por linea en fp32 y 3,4 ms en int8 con 6 hilos.
- Integracion con el pipeline de transcripcion en tiempo real de hayamimi, que lo consume como posprocesador de ASR.
- Reentrenamiento y ajuste fino posteriores gracias a los pesos PyTorch en safetensors.
- Soporte de decodificacion con umbrales configurables (comma_threshold, exclaim_threshold) para adaptar el comportamiento a texto denso o a subtitulos con puntuacion dispersa.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es exclusivamente un etiquetador de tokens monoidioma.

## Casos de uso

- Posprocesado de transcripcion ASR en japones: el modelo recibe la salida sin puntuar de un motor de reconocimiento de voz y le inserta comas y puntos, mejorando la legibilidad de subtitulos y actas; su latencia de 3,4 ms por linea en int8 permite hacerlo en tiempo real dentro del mismo pipeline.
- Subtitulado automatico de video y television: con los umbrales por defecto (comma_threshold=0.8 y sin exclamaciones) el modelo obtiene F1 0,64 frente al 0,62 de la linea base anterior en subtitulos de TV con puntuacion dispersa, que es el escenario real de emision.
- Generacion de subtitulos para reuniones y notas de voz: la alta exhaustividad en la deteccion (recall 0,939 en fp32) reduce la probabilidad de perder fronteras de frase, algo critico cuando el texto se consume como resumen.
- Preprocesado para pipelines de PLN en japones: muchos analizadores morfologicos y sistemas de traduccion rinden mejor con puntuacion explicita, de modo que este modelo puede actuar como paso previo en un pipeline de traduccion automatica o de analisis de sentimiento.
- Archivado y busqueda de transcripciones: al insertar puntos y comas, el texto resultante puede segmentarse en frases para indexacion, busqueda por frases exactas o entrenamiento de modelos de resumen sobre corpus orales.
- Correccion de texto procedente de OCR o de formularios web en japones: el modelo solo inserta marcas y nunca altera los caracteres originales, lo que lo hace seguro como paso de postprocesado sin riesgo de reescritura de contenido.
- Despliegue en dispositivos con recursos limitados: el export int8 de 37 MB se ejecuta en CPU con 6 hilos a 3,4 ms por linea, por lo que cabe en portatiles, servidores de gama baja o incluso en el mismo equipo que ejecuta la transcripcion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FLEURS ja (n=250, F1 en posicion de puntuacion):

| Modelo | Precision | Recall | F1 | Latencia por linea (CPU, 6 hilos) |
|---|---|---|---|---|
| mojicast-punct incluido (fp32, solo 、。) | 0,872 | 0,482 | 0,621 | 44 ms |
| hayamimi-punct-ja-4class, fp32 | 0,841 | 0,939 | 0,887 | 4,6 ms |
| hayamimi-punct-ja-4class, int8 | 0,858 | 0,920 | 0,888 | 3,4 ms |

Datos adicionales aportados por el autor:

- Recall de ？ de 1,00 sobre un conjunto de preguntas.
- Sobre subtitulos de television con puntuacion dispersa, con las puertas de decodificacion por defecto, F1 de 0,64 frente a 0,62 del modelo incluido anteriormente en hayamimi.
- La tabla anterior corresponde a decodificacion argmax simple, sin aplicar las puertas de umbral.
- El registro completo de evaluacion esta en docs/eval/punct_retrain.md dentro del repositorio de hayamimi.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del modelo, que no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 150-200 MB en fp32 y 40-60 MB en int8, incluyendo el tokenizador y los estados intermedios; es una carga despreciable para cualquier GPU.
- GPU recomendadas: no requiere GPU. El autor entrena en una RTX 3080 Ti, pero la inferencia esta optimizada para CPU, que es el escenario indicado en la model card.
- Compatibilidad con GPU de consumo: si cabe en cualquier GPU de consumo e integrada, incluidas soluciones sin GPU dedicada; basta con CPU.
- Opciones de despliegue: ONNX Runtime (ruta recomendada, con el fichero int8 dinamico), PyTorch con hf/model.safetensors, y la CLI de hayamimi mediante python scripts/download_models.py --punct-4class y python scripts/realtime_transcribe.py --punct-model 4class.
- API de Python: la clase PunctuatorJa4Class del modulo punct_ja carga por defecto models/punct-ja-4class-permissive y expone el metodo restore(texto).
- Latencia y throughput: 4,6 ms por linea en fp32 y 3,4 ms por linea en int8 con 6 hilos de CPU, medidos sobre FLEURS ja; equivalente a mas de 200 lineas por segundo por proceso en int8, muy por debajo del coste tipico de un modelo de ASR.
- No se han publicado datos de rendimiento en vLLM, TGI, llama.cpp u Ollama, y estos motores no aplican a un clasificador de tokens de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | F1 (FLEURS ja) | Latencia CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| hayamimi-punct-ja-4class | ~30 M | Puntuacion ja 4 clases (、 。 ？ ！) | no disponible | 0,887 (fp32) / 0,888 (int8) | 4,6 ms / 3,4 ms | MIT (atribucion a FineWeb-2) | HuggingFace, ONNX y safetensors |
| mojicast-punct (linea base de hayamimi) | no disponible | Puntuacion ja 2 clases (、 。) | no disponible | 0,621 | 44 ms | no disponible | incluido en hayamimi |
| sbintuitions/modernbert-ja-30m | ~30 M | Encoder de lenguaje japones (base, sin cabeza de puntuacion) | no disponible | no disponible | no aplica | MIT | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de restauracion de puntuacion en japones en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo monoidioma: solo japones, sin soporte de otros idiomas.
- No es un modelo generativo ni conversacional; no responde preguntas, no genera codigo y no admite tool calling ni uso como agente.
- La cabeza de exclamacion presenta un problema de calibracion en el dominio del habla: segun el autor, se activa con la misma confianza en narracion enfatica que en exclamaciones reales, por lo que las puertas por defecto de hayamimi nunca emiten ！ (exclaim_threshold=1.01). Los resultados de la tabla de benchmarks corresponden a argmax puro, es decir, sin estas puertas.
- El modelo fue entrenado sobre prosa web densamente puntuada; el propio autor advierte de que debe medirse sobre el material propio antes de adoptarlo para subtitulos, donde la puntuacion es mucho mas dispersa.
- La entrada debe normalizarse en NFKC con ja_text_norm.safe_nfkc, que conserva ？ y ！ de ancho completo; usar otra normalizacion puede degradar el resultado.
- El modelo solo inserta marcas: no corrige caracteres, no elimina ruido de la transcripcion ni arregla errores de reconocimiento de voz.
- Aunque los pesos son MIT, la redistribucion exige acreditar a FineWeb-2 por la licencia ODC-By 1.0 de los datos de entrenamiento. El uso comercial es posible siempre que se respete esa atribucion.
- Riesgo de sesgo heredado del corpus FineWeb-2 (texto web japones), sin filtrado especifico documentado.
- Riesgo de alucinacion en el sentido acotado del termino: puede insertar o omitir marcas incorrectamente en dominios alejados del texto web, sin que exista un mecanismo de verificacion posterior.
- No se documentan la longitud de contexto soportada, el numero de tokens de entrenamiento ni el desglose del dataset, lo que dificulta reproducir el entrenamiento o estimar su comportamiento en secuencias muy largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oboroge0/hayamimi-punct-ja-4class
- Repositorio hayamimi: https://github.com/oboroge0/hayamimi
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-30m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Registro de evaluacion citado por el autor: docs/eval/punct_retrain.md dentro del repositorio de hayamimi
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, demos o hilos de discusion) sobre este modelo.
