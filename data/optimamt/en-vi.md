# OptimaMT/en-vi

## Resumen

OptimaMT/en-vi es un modelo de traduccion automatica ingles-vietnamita derivado de Xenova/opus-mt-en-vi, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica versiones optimizadas de los modelos OPUS-MT en formato ONNX para su uso en el navegador y en el escritorio mediante transformers.js. La aportacion concreta de esta variante es un decodificador fusionado recompilado con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), que reduce el consumo de memoria entre un 45 % y un 47 % en Linux y Windows respectivamente, manteniendo exactamente los mismos tokens de salida que el modelo original.

El modelo mantiene la arquitectura Marian de seq2seq del OPUS-MT original, con un vocabulario de 53.685 tokens y pesos cuantizados en formato ONNX. Solo se ha reconstruido el fichero `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son identicos byte a byte al modelo base. Esto lo convierte en un reemplazo directo (drop-in) para cualquier pipeline que ya use Xenova/opus-mt-en-vi, sin necesidad de cambiar codigo mas alla de las opciones de sesion.

Su relevancia actual radica en el despliegue en entornos con recursos limitados: navegadores, aplicaciones de escritorio y dispositivos sin GPU. El modelo se usa en produccion en OpenCircle, un traductor de pantalla para Windows y Linux desde la version v0.1.4. Con un tamano de repositorio de 0,1 GB y licencia CC BY 4.0, es adecuado para integraciones comerciales con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8, segun el ejemplo de uso con `dtype: "q8"`) |
| Idiomas soportados | ingles (en), vietnamita (vi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` y resto de ficheros del export) |
| Vocabulario | 53.685 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-en-vi (revision `30bcd461c0d7`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura utilizada por la familia OPUS-MT de Helsinki-NLP para traduccion automatica neuronal. La parte encoder procesa el texto en ingles y el decoder genera la traduccion al vietnamita de forma autorregresiva. Los pesos proceden del OPUS-MT original de la Universidad de Helsinki, exportados a ONNX por Xenova y posteriormente recompilados por OptimaMT.

La unica modificacion respecto al modelo base es de grafo: la proyeccion de salida del decodificador se ha movido fuera de sus dos ramas, y el decodificador fusionado se ha recompilado con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`). No hay reentrenamiento ni ajuste fino; los pesos son los mismos. Segun la model card, esta recompilacion produce entre 2,3 y 2,5 veces mas velocidad y la mitad de memoria, con tokens de salida identicos al original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que esos datos corresponden al OPUS-MT original y no se detallan en la informacion proporcionada.

## Capacidades

- Traduccion de texto de ingles a vietnamita, unica tarea del pipeline (`translation`).
- Generacion de tokens identicos al modelo base Xenova/opus-mt-en-vi, lo que garantiza paridad de calidad en la traduccion.
- Ejecucion en navegador mediante transformers.js con cuantizacion q8.
- Ejecucion en Python con onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Menor consumo de memoria que el modelo base: 464 a 257 MiB en Linux y 441 a 232 MiB en Windows con `disable_quant_qdq = 1`; 251 a 198 MiB y 179 a 155 MiB con los valores por defecto de ONNX Runtime.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.
- Capacidad multilingue limitada a un unico par de idiomas (en-vi).

## Casos de uso

- Traduccion de pantalla en tiempo real: integrado en aplicaciones de escritorio como OpenCircle, el modelo traduce texto capturado de la pantalla de ingles a vietnamita con bajo consumo de memoria (232-257 MiB), lo que permite mantenerlo cargado en segundo plano sin penalizar el rendimiento del sistema.
- Traduccion en el navegador sin backend: mediante transformers.js y cuantizacion q8, se puede ejecutar completamente en el cliente, evitando enviar texto a un servidor y reduciendo la latencia de red en aplicaciones web de traduccion.
- Localizacion de documentacion tecnica: para equipos que mantienen documentacion en ingles y necesitan versiones en vietnamita, el modelo puede procesar lotes de frases con el script de Python y generar borradores que luego revisa un traductor humano.
- Traduccion de subtitulos y contenido audiovisual: dado su bajo consumo de memoria, se puede desplegar en servidores modestos o en contenedores ligeros para traducir subtitulos en lote de ingles a vietnamita.
- Traduccion de correos y mensajes en herramientas de productividad: integrado como plugin o extension, permite traducir mensajes entrantes en ingles al vietnamita sin salir de la aplicacion, con la ventaja de que el modelo cabe en memoria junto con otras herramientas.
- Prototipado rapido de pipelines de traduccion: al ser un reemplazo directo del modelo base con la misma API y los mismos tokens, sirve para validar integraciones en transformers.js u onnxruntime antes de escalar a modelos mayores, con la ventaja de un consumo de memoria reducido a la mitad.
- Traduccion en dispositivos de bajos recursos: al reducir el uso de memoria un 45-47 % respecto al original, es viable en equipos con poca RAM o en entornos virtualizados donde el modelo base resultaria ajustado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 24,5 |
| FLORES-200 devtest (1.012 frases), chrF | 43,68 |
| Modo de decodificacion | greedy |
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 464 → 257 MiB (-45 %) |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 441 → 232 MiB (-47 %) |
| Memoria tras carga, Linux, valores por defecto | 251 → 198 MiB (-21 %) |
| Memoria tras carga, Windows, valores por defecto | 179 → 155 MiB (-14 %) |
| Tokens identicos al modelo base | si |
| Aceleracion con modo rapido | 2,3-2,5x |
| Entorno de medida | ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en VM) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no son aplicables a un modelo de traduccion.

## Requisitos de hardware

- VRAM: no aplica, el modelo esta pensado para CPU. El consumo de memoria RAM tras la carga es de 232-257 MiB en modo rapido y 155-198 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU con ONNX Runtime.
- Cabe en cualquier GPU de consumo y en practicamente cualquier equipo con CPU moderna, dado su reducido consumo de memoria.
- Opciones de despliegue: transformers.js (navegador y Node.js), onnxruntime en Python (con sentencepiece y numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se proporcionan cifras absolutas de latencia o throughput; solo la aceleracion relativa de 2,3-2,5x respecto al modelo base con `disable_quant_qdq = 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/en-vi | no disponible | no disponible | en, vi | CC BY 4.0 | ONNX | 232-257 MiB (modo rapido) |
| Xenova/opus-mt-en-vi | no disponible | no disponible | en, vi | CC BY 4.0 | ONNX | 441-464 MiB (Linux, modo rapido) |
| Helsinki-NLP/opus-mt-en-vi | no disponible | no disponible | en, vi | CC BY 4.0 | safetensors/PyTorch | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros modelos de traduccion en-vi comparables. La diferencia principal frente a Xenova/opus-mt-en-vi es el menor consumo de memoria y la mayor velocidad, con tokens de salida identicos. Frente al OPUS-MT original de Helsinki-NLP, la diferencia es el formato (ONNX frente a PyTorch) y la optimizacion del decodificador.

## Limitaciones y advertencias

- Solo traduce de ingles a vietnamita; no soporta otros pares de idiomas ni traduccion inversa.
- Al ser una copia optimizada del OPUS-MT original, hereda sus sesgos y errores de traduccion, incluidos posibles sesgos culturales y de genero presentes en los datos de entrenamiento.
- Riesgo de alucinacion y de traducciones inexactas en textos especializados, terminologia tecnica o dominios poco representados en el corpus original.
- No se dispone de informacion sobre la longitud maxima de contexto soportada; textos largos pueden requerir segmentacion.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es necesario citar a OptimaMT, Xenova y Helsinki-NLP (OPUS-MT) segun corresponda.
- La optimizacion depende de `disable_quant_qdq = 1` en ONNX Runtime; sin esa opcion, la reduccion de memoria es menor (14-21 %).
- No soporta tool calling, agentes ni modos de razonamiento; es un modelo estrictamente de traduccion.
- Las medidas de rendimiento se realizaron en CPU con 4 hilos y ONNX Runtime 1.31.1; el rendimiento puede variar en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-vi
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-vi
- OPUS-MT original (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicacion que usa el modelo): https://github.com/AmerAlreyahi/OpenCircle
