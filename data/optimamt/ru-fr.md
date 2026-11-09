# OptimaMT/ru-fr

## Resumen

OptimaMT/ru-fr es un modelo de traducción automática ruso-francés derivado de Xenova/opus-mt-ru-fr, que a su vez es una exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Se trata por tanto de un transformer encoder-decoder de tipo Marian, optimizado para inferencia en el navegador y en entornos con recursos limitados mediante la librería transformers.js. El modelo original se publicó en 2020 como parte del proyecto OPUS-MT, entrenado sobre corpus paralelos multilingües.

La aportación concreta de esta variante es la reconstrucción del decoder fusionado (`decoder_model_merged_quantized.onnx`) con la proyección de salida extraída de sus dos ramas, un cambio exclusivamente de grafo que reduce el consumo de memoria sin alterar los pesos ni los tokens generados. Según la model card, el ahorro es de entre el 47 % y el 49 % en Linux y Windows con `disable_quant_qdq = 1`, y de entre el 16 % y el 22 % con los valores por defecto de ONNX Runtime.

El modelo forma parte del proyecto OptimaMT, que agrupa 49 pares de traducción bajo el esquema `OptimaMT/<src>-<tgt>`. Es relevante para desarrolladores que necesitan traducción ruso-francés embebida en aplicaciones web o de escritorio con presupuesto de memoria muy ajustado, a costa de renunciar a las capacidades de los modelos neuronales de traducción modernos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de transformers.js); pesos originales cuantizados en el decoder fusionado |
| Idiomas soportados | ruso (ru) y frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por el proyecto OPUS-MT de la Universidad de Helsinki. El vocabulario consta de 64 377 tokens, compartido entre origen y destino según el esquema de sentencepiece habitual en OPUS-MT. Los pesos proceden íntegramente de Helsinki-NLP/opus-mt-ru-fr y no han sido reentrenados ni ajustados: la model card indica explícitamente que solo se reconstruyó el decoder fusionado y que el resto de archivos son idénticos byte a byte al original.

La modificación técnica consiste en mover la proyección de salida del decoder fuera de sus dos ramas (una para el modo con caché y otra sin ella), lo que evita duplicar esa matriz en memoria durante la inferencia. No hay datos publicados sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo OPUS-MT de 2020, lo habitual en ese proyecto es entrenamiento supervisado sobre corpus paralelos, pero esa información no está disponible en la documentación proporcionada.

## Capacidades

- Traducción de texto de ruso a francés, en modo texto plano y por frases o párrafos.
- Inferencia en el navegador mediante transformers.js con backend ONNX Runtime (WebAssembly o WebGPU según configuración).
- Ejecución en CPU con ONNX Runtime nativo a través del script `translate.py` (onnxruntime, sentencepiece, numpy).
- Cuantización q8 soportada de forma nativa en el ejemplo de uso.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par ru-fr.

## Casos de uso

- Traducción embebida en aplicaciones web: el modelo se carga con transformers.js en el navegador del usuario, de modo que el texto ruso no abandona el dispositivo. El consumo de memoria reducido (288 MiB en Linux con `disable_quant_qdq = 1`) lo hace viable en equipos de escritorio convencionales.
- Traducción por lotes en servidores sin GPU: con ONNX Runtime en CPU y 4 hilos, el modelo procesa documentos rusos para generar versiones en francés en pipelines de preprocesamiento de corpus.
- Extensiones de navegador para lectura de prensa rusa: el usuario traduce artículos o fragmentos seleccionados al francés sin depender de una API externa, con la ventaja de privacidad que supone la inferencia local.
- Traducción de correspondencia y documentación interna: empresas con equipos que operan en ruso y francés pueden integrar el modelo en herramientas ofimáticas o intranets para traducciones de baja latencia y coste nulo por token.
- Preprocesamiento en pipelines de NLP: traducción ru→fr como paso previo a tareas de análisis de sentimiento, clasificación o extracción de información cuando el resto del stack está entrenado en francés.
- Aplicaciones de escritorio y utilidades CLI: el script `translate.py` permite integrar la traducción en herramientas de línea de comandos o aplicaciones nativas ligeras sin dependencias de Python pesadas (solo onnxruntime, sentencepiece y numpy).
- Prototipado y docencia: el tamaño reducido del repositorio (0,1 GB) y la licencia CC BY 4.0 facilitan su uso en entornos académicos y en demostraciones de traducción neuronal sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de memoria tras la carga del modelo:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 540 → 288 (-47 %) | 515 → 262 (-49 %) | si |
| Valores por defecto de ONNX Runtime | 287 → 224 (-22 %) | 199 → 168 (-16 %) | si |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en máquina virtual). No se proporcionan métricas de calidad de traducción (BLEU, chrF, COMET) ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo está pensado para CPU. El consumo de memoria del proceso es de 168-288 MiB según configuración y sistema operativo.
- GPU recomendadas: no se especifican; el modelo no requiere GPU y la model card solo documenta ejecución en CPU.
- Cabe en cualquier GPU de consumo, pero también en equipos sin GPU dedicada; es uno de sus principales atractivos.
- Opciones de despliegue: transformers.js (navegador, con ONNX Runtime Web), ONNX Runtime nativo en Python mediante el script `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-fr | no disponible | no disponible | ru→fr | CC BY 4.0 | ONNX | Decoder fusionado optimizado en memoria |
| Xenova/opus-mt-ru-fr | no disponible | no disponible | ru→fr | CC BY 4.0 | ONNX | Modelo base; misma calidad, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-ru-fr | no disponible | no disponible | ru→fr | CC BY 4.0 | PyTorch (safetensors/bin) | Pesos originales; requiere framework PyTorch |
| Modelos NLLB o M2M-100 | cientos de millones a miles de millones | mayor | multilingüe | CC BY-NC 4.0 (NLLB) | PyTorch, ONNX | Mayor calidad potencial y cobertura, pero mucho más pesados y con licencia no comercial en NLLB |

La comparación directa más relevante es con Xenova/opus-mt-ru-fr, del que este modelo es una copia con el decoder reconstruido: misma calidad de traducción esperada, menor huella de memoria. Frente a modelos multilingües modernos, la ventaja es el tamaño y la licencia permisiva; la desventaja, la calidad y la cobertura limitadas al par ru-fr.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de OPUS-MT entrenado sobre corpus paralelos, puede reflejar sesgos de género, registro y dominio presentes en esos datos; no se documentan análisis específicos.
- Riesgo de alucinación: en traducción automática el riesgo se manifiesta como omisiones, adiciones o traducciones inventadas ante entradas ambiguas, ruidosas o fuera de dominio; no hay evaluación publicada al respecto.
- Limitaciones de contexto e idioma: solo traduce ruso a francés; no soporta otros pares ni direccionalidad inversa en este repositorio. La longitud máxima de secuencia no está documentada.
- Licencia: CC BY 4.0 permite uso comercial con atribución; es necesario citar a los autores originales (Universidad de Helsinki, exportación de Xenova y modificación de OptimaMT).
- Caveat de producción: el modelo no ha sido validado con benchmarks de calidad en esta variante; antes de desplegarlo conviene evaluar con un conjunto propio representativo del dominio objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- La ejecución en navegador depende del soporte de ONNX Runtime Web y de la configuración de hilos del dispositivo; el rendimiento puede variar notablemente entre equipos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-fr
- Modelo base (exportación ONNX): https://huggingface.co/Xenova/opus-mt-ru-fr
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
