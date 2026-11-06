# HY-2012/FireRedPunc.AXERA

## Resumen
FireRedPunc.AXERA es un paquete de despliegue cuantizado del modelo de restauracion de puntuacion FireRedPunc, preparado especificamente para el acelerador neuronal AX650N de AXERA. El modelo base es chinese-lert-base, un transformer BERT-base de 12 capas y 768 dimensiones ocultas, adaptado como clasificador de tokens para insertar signos de puntuacion en texto sin puntuar, tipicamente transcripciones ASR en chino e ingles. Resuelve el problema de convertir flujos de texto continuo en texto legible con comas, puntos, interrogaciones y exclamaciones.

La relevancia de esta ficha no esta en la innovacion arquitectonica, sino en el empaquetado para inferencia en hardware edge: el modelo se ha convertido con Pulsar2 7.0 a formato AXMODEL con cuantizacion U16 en activaciones, S8 en pesos y operacion Gather en FP32, reduciendo el artefacto a 151,5 MiB. Incluye binario C++ para aarch64, script de ejecucion y wrapper en Python, lo que permite integrar restauracion de puntuacion en pipelines de voz en dispositivos con SoC AX650N sin depender de GPU.

El contexto de entrada esta fijado en 128 tokens y la salida es una secuencia de logits de 127 posiciones sobre cinco etiquetas (espacio, coma, punto, interrogacion y exclamacion). El modelo esta publicado bajo licencia Apache-2.0 y soporta chino e ingles, aunque el grueso de su entrenamiento y evaluacion se orienta al chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (chinese-lert-base), 12 capas, 768 hidden, cabeza de clasificacion de tokens |
| Parametros totales | no disponible (repo de 0,2 GB; AXMODEL de 151,5 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada; salida de 127 posiciones |
| Tipos de cuantizacion | U16 activaciones + S8 pesos, Gather en FP32 (Pulsar2 7.0) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | AXMODEL (punc.axmodel) para AX650N; tokenizer/vocab/out_dict en models/; no se distribuyen safetensors ni GGUF en el repo |

## Arquitectura y entrenamiento
El modelo subyacente es chinese-lert-base, un BERT-base de 12 capas y 768 dimensiones ocultas, utilizado como etiquetador de tokens. La entrada se compone de `[CLS]` seguido de los tokens, con `input_ids` de forma `[1,128]` en int32 y `attention_mask` de forma `[1,128]` en float32. La salida es `logits [1,127,5]`, correspondiente a las etiquetas espacio, coma, punto, interrogacion y exclamacion. Se trata, por tanto, de un problema de clasificacion secuencial por posicion, no de generacion autoregresiva.

El paquete no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste fino con RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. La innovacion tecnica relevante es el proceso de conversion y cuantizacion con Pulsar2 7.0 para el acelerador AX650N, que produce un AXMODEL de 151,5 MiB con activaciones U16, pesos S8 y la operacion Gather mantenida en FP32 para preservar la precision de la recuperacion de embeddings.

## Capacidades
- Restauracion de puntuacion en texto sin puntuar, insertando espacio, coma, punto, interrogacion y exclamacion.
- Clasificacion de tokens por posicion sobre ventanas de hasta 128 tokens.
- Soporte de chino e ingles, con enfasis practico en chino.
- Integracion en pipelines ASR para posprocesar transcripciones antes de mostrarlas o almacenarlas.
- Inferencia en hardware edge AX650N mediante binario C++ aarch64 o wrapper Python.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No es un modelo generativo: no produce texto nuevo, solo etiqueta posiciones.

## Casos de uso
- Posprocesado de transcripciones ASR en chino: el modelo recibe la secuencia de tokens reconocidos y devuelve la misma secuencia con puntuacion insertada, mejorando la legibilidad de actas, subtitulos y notas de reunion. Encaja en dispositivos con AX650N por su bajo coste computacional.
- Subtitulado en directo en dispositivos edge: con una latencia mediana de 23,2-23,5 ms en Python y 25,7 ms en C++, puede aplicarse por segmento de voz (RTF equivalente de 0,0023-0,0026 sobre segmentos VAD de 10 s) sin afectar al ritmo de emision.
- Normalizacion de texto para sintesis de voz (TTS): insertar puntuacion antes de alimentar un motor TTS mejora la prosodia y las pausas; el modelo actua como etapa previa en el pipeline.
- Limpieza de corpus y datasets: procesar grandes volumenes de texto sin puntuar (transcripciones, chats, OCR) para generar corpus legibles, aprovechando el binario C++ y el bajo consumo del AX650N.
- Asistentes de voz embebidos: integrar la restauracion de puntuacion en dispositivos con SoC AX650N para que las respuestas mostradas en pantalla o registradas en logs mantengan formato correcto.
- Preprocesado para traduccion automatica o busqueda: puntuar el texto de entrada antes de enviarlo a un traductor o indexador, ya que la puntuacion ayuda a segmentar frases y a mejorar la calidad de la salida.
- Evaluacion y validacion de pipelines ASR: usar el modelo como referencia para medir la calidad de puntuacion de otros sistemas, dado su F1 reportado de 0,9937 excluyendo puntuacion de final de frase.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| AXMODEL vs ONNX FP32 (272 lineas / 4523 tokens) | 100% coincidencia |
| C++ vs Python (272 lineas) | 272/272 exact match de texto |
| F1 de puntuacion (excluyendo final de frase) | 0,9937 |
| Latencia Python (mediana) | 23,2-23,5 ms |
| Latencia C++ (mediana) | 25,7 ms |
| RTF equivalente (segmentos VAD de 10 s) | 0,0023 Python / 0,0026 C++ |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las metricas anteriores son las unicas reportadas por el autor y se refieren a la tarea especifica de puntuacion en AX650N.

## Requisitos de hardware
- VRAM: no aplica; la inferencia esta orientada al acelerador AX650N, no a GPU.
- GPU recomendadas: no disponible; el paquete no esta pensado para GPU y no se documentan requisitos de CUDA.
- Hardware objetivo: SoC AX650N con soporte del runtime AXEngine y binario aarch64.
- Tamano del artefacto: AXMODEL de 151,5 MiB, mas tokenizer, vocab y out_dict en `models/`.
- Despliegue: binario C++ `fireredpunc_ax650` (aarch64) mediante `run_ax650.sh`, o wrapper Python `punc_ax.py` con `numpy`, `transformers` y la wheel `axengine-<version>-py3-none-any.whl`.
- Latencia y throughput: mediana de 23,2-23,5 ms en Python y 25,7 ms en C++ por inferencia; RTF equivalente de 0,0023-0,0026 sobre segmentos de 10 s.
- No cabe en GPU consumer ni se distribuyen pesos GGUF para llama.cpp, Ollama o vLLM; el paquete es especifico de AX650N.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| FireRedPunc.AXERA | BERT-base (12 capas, 768 hidden) | 128 tokens | zh, en | Apache-2.0 | AXMODEL para AX650N |
| FireRedPunc (original) | BERT-base (12 capas, 768 hidden) | no disponible | zh, en | Apache-2.0 | Pesos PyTorch/HuggingFace |
| Modelos de puntuacion BERT multilingues genericos | variable | variable | varios | variable | PyTorch, ONNX |

La comparacion directa mas relevante es con el FireRedPunc original de FireRedTeam, del que este paquete deriva: misma arquitectura base y misma tarea, pero el original se distribuye como modelo PyTorch para GPU/CPU, mientras que esta version esta cuantizada y empaquetada para AX650N. No se dispone de datos de benchmarks comparativos con otros modelos de puntuacion en la informacion proporcionada.

## Limitaciones y advertencias
- Ventana de contexto fija de 128 tokens: textos mas largos deben segmentarse en ventanas, lo que puede afectar la coherencia de la puntuacion en los limites.
- El modelo solo inserta cinco etiquetas (espacio, coma, punto, interrogacion, exclamacion); no cubre otros signos como punto y coma, dos puntos, comillas o parentesis.
- No es un modelo generativo ni de comprension profunda; errores en la transcripcion ASR de entrada se propagan a la puntuacion.
- El sesgo linguistico esta concentrado en chino; el rendimiento en ingles no se documenta con metricas en la informacion disponible.
- Riesgo de alucinacion limitado por la naturaleza de la tarea (clasificacion), pero puede insertar puntuacion incorrecta en textos ambiguos o dominios no vistos.
- El paquete esta atado al hardware AX650N y al runtime AXEngine; no es portable a GPU sin reconversion.
- No se documentan sesgos sociales especificos ni evaluaciones de robustez fuera del dominio de evaluacion del autor.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base FireRedPunc y de las dependencias (Pulsar2, AXEngine) antes de produccion.

## Enlaces
- Hugging Face: https://huggingface.co/HY-2012/FireRedPunc.AXERA
- Repositorio de codigo: https://github.com/ZY-2012/FireRedPunc.AXERA
- Modelo base FireRedPunc: https://huggingface.co/FireRedTeam/FireRedPunc
- Magnetar (AXERA-TECH): https://github.com/AXERA-TECH/Magnetar
