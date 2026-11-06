# Miyauel/meari-dialect-lora

## Resumen

Meari dialect LoRA es un adaptador LoRA en formato GGUF desarrollado por Miyauel que se aplica sobre el modelo base NiuTrans/LMT-60-1.7B para reescribir texto en coreano estandar como una de cinco variantes dialectales regionales: Gyeongsang, Jeolla, Chungcheong, Gangwon y Jeju. Un unico adaptador cubre las cinco regiones, lo que simplifica el despliegue frente a mantener cinco artefactos separados.

El adaptador esta pensado para integrarse en Meari, un motor de sintesis de voz local con licencia MIT, que lo utiliza para leer texto en dialecto regional. El modelo base es un transformer de 1.700 millones de parametros (LMT-60-1.7B, Apache-2.0), mientras que el adaptador en si contiene 17.432.576 parametros entrenables, lo que lo hace muy ligero y apto para ejecutarse en CPU o en GPUs de consumo.

Su relevancia radica en que aborda una tarea poco cubierta por los modelos generalistas: la conversion de registro dialectal coreano con calidad medible. El autor publica resultados sobre 1.500 frases retenidas (300 por region) con chrF++, mostrando mejoras consistentes frente a no modificar la frase o aplicar una lista de palabras basada en diccionario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer LMT-60-1.7B |
| Parametros totales | 17.432.576 (adaptador); modelo base de 1.7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (adaptador); el modelo base se ejecuta en Q4_K_M segun la model card |
| Idiomas soportados | coreano (ko), con cinco dialectos regionales |
| Licencia | MIT (adaptador); Apache-2.0 (modelo base) |
| Formato de pesos | GGUF (para llama.cpp `--lora`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre todas las proyecciones de atencion y MLP del modelo base NiuTrans/LMT-60-1.7B. Se entreno con learning rate 2e-4, batch de 8 y 10.000 pasos en CPU, sobre pares de frases formados por la transcripcion estandar y la transcripcion dialectal correspondiente. El adaptador se distribuye en formato GGUF para su uso con llama.cpp mediante el flag `--lora`.

Los datos de entrenamiento provienen de las transcripciones de los conjuntos de AI Hub (aihub.or.kr) "Korean dialect speech of middle-aged and elderly speakers", en sus variantes de Gangwon/Gyeongsang y Chungcheong/Jeolla/Jeju. Segun la model card, no se incluyen transcripciones del dataset en el repositorio. El resultado se declara como producto de un proyecto de la National Information Society Agency de Corea (NIA). No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la fuente citada.

## Capacidades

- Traduccion de coreano estandar a cinco dialectos regionales: Gyeongsang, Jeolla, Chungcheong, Gangwon y Jeju, con un unico adaptador.
- Generacion de texto condicionada por prompt de traduccion con formato fijo: "Translate the following text from Korean into <Region> dialect Korean."
- Control de aplicacion por peticion en llama.cpp: el adaptador se aplica a todas las peticiones que no fijen `lora`, y puede desactivarse con `"lora": [{"id": 0, "scale": 0}]` o activarse con `scale: 1`.
- Integracion con el motor de voz Meari para lectura de texto en dialecto.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Lectura de texto en dialecto para sintesis de voz: Meari usa el adaptador para transformar texto estandar en dialecto antes de la sintesis, de modo que la locucion resultante suene regional. Es su caso de uso principal y el que motivo el desarrollo.
- Accesibilidad y localizacion de contenido para hablantes mayores: convertir materiales escritos en coreano estandar a la variante regional del publico objetivo, ya que el dataset de entrenamiento se centra en hablantes de mediana edad y mayores.
- Generacion de dialogos para ficcion y guiones: producir lineas de personaje en dialecto Gyeongsang, Jeolla, Chungcheong, Gangwon o Jeju a partir de un guion estandar, con una sola instancia del modelo y conmutando la region por peticion.
- Subtitulado y doblaje regional: adaptar subtitulos estandar a la variante dialectal correspondiente a la localizacion de la produccion, usando el adaptador como paso previo a la sintesis o a la grabacion.
- Investigacion linguistica y dialectologia computacional: generar variantes dialectales controladas para estudios de variacion, comparando la salida del adaptador con transcripciones reales mediante chrF++.
- Prototipado de asistentes conversacionales regionales: desplegar el modelo base en GGUF Q4_K_M con el adaptador en llama.cpp para probar respuestas en dialecto en entornos con recursos limitados, incluida CPU.
- Preservacion de variedades minoritarias: el caso de Jeju, con resultados notablemente inferiores al resto pero muy superiores a las alternativas, permite generar material en una variedad con poca representacion en modelos generalistas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.500 frases retenidas (300 por region), con chrF++ frente a la transcripcion dialectal real. "Unchanged" mantiene la frase estandar; "word list" sustituye palabras con un diccionario construido a partir de los mismos datos de entrenamiento.

| Region | Unchanged | Word list | Este adaptador |
|---|---|---|---|
| Gyeongsang | 83,3 | 84,0 | 85,4 |
| Jeolla | 85,0 | 86,6 | 88,7 |
| Chungcheong | 86,0 | 88,4 | 90,5 |
| Gangwon | 89,2 | 91,1 | 92,8 |
| Jeju | 40,6 | 59,2 | 69,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade 17,4 millones de parametros al modelo base; en la configuracion de referencia (LMT-60-1.7B en GGUF Q4_K_M) el conjunto cabe holgadamente en GPUs de consumo. No se dispone de una cifra exacta de VRAM publicada.
- GPU recomendadas: no disponible. El entrenamiento se realizo en CPU, y la model card no especifica GPU para inferencia.
- Cabe en GPU de consumo: si, segun la configuracion Q4_K_M del modelo base citada por el autor; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp, tanto en modo servidor como con `--lora`; el adaptador esta en formato GGUF especificamente para ello. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados sobre modelos comparables de conversion de dialectos coreanos en la informacion proporcionada. La unica comparacion cuantitativa disponible es interna al propio trabajo: frente a no modificar la frase y frente a una lista de palabras basada en diccionario, con los resultados de la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Meari dialect LoRA | 17,4 M (adaptador) + 1,7B (base) | no disponible | MIT (adaptador) / Apache-2.0 (base) | GGUF | LoRA sobre LMT-60-1.7B |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento en Jeju es claramente inferior al resto (chrF++ 69,5 frente a 85-93 en las otras regiones), por lo que la calidad en esa variedad es sensiblemente menor.
- El adaptador esta disenado para un prompt concreto y con el modo thinking desactivado; usarlo con otros formatos de prompt puede degradar los resultados.
- Solo cubre coreano y sus cinco dialectos regionales; no se documentan capacidades multilingues.
- El modelo base puede alucinar o introducir contenido no presente en la frase original; no se han publicado evaluaciones de fidelidad semantica mas alla de chrF++.
- Los datos de entrenamiento provienen de hablantes de mediana edad y mayores, lo que puede introducir sesgos de registro, edad y origen geografico en la salida.
- La licencia MIT del adaptador es permisiva, pero el uso comercial debe respetar tambien la licencia Apache-2.0 del modelo base y las condiciones de los datos de AI Hub/NIA con los que se entreno.
- El repositorio aparece sin descargas ni likes y con un tamano de 0.0 GB en el momento de la consulta, lo que sugiere un proyecto muy reciente o de baja difusion; no hay evidencia de uso en produccion.
- No se documenta la longitud de contexto efectiva del conjunto, lo que limita la planificacion para entradas largas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Miyauel/meari-dialect-lora
- Modelo base: https://huggingface.co/NiuTrans/LMT-60-1.7B
- GGUF del modelo base usado por Meari: https://huggingface.co/mradermacher/LMT-60-1.7B-GGUF
- Repositorio de Meari: https://github.com/Miyauel/Meari
- AI Hub (datos de dialecto coreano): https://aihub.or.kr
