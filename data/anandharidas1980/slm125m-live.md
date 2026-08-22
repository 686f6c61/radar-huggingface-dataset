# AnandHaridas1980/slm125m-live

## Resumen

slm125m-live es un modelo de lenguaje pequeño de 125,8 millones de parámetros con arquitectura tipo Llama, entrenado desde cero sobre un corpus especializado en textos legales y financieros. Lo desarrolla AnandHaridas1980 y se publica bajo licencia Apache 2.0. El modelo está pensado como artefacto de investigación y docencia: demuestra que es posible preentrenar un transformer compacto con recursos limitados (8 GPU H100 durante una sola pasada) y obtener una perplejidad razonable en dominios específicos como jurisprudencia estadounidense y documentos SEC.

El modelo es un *base model*: no ha recibido ajuste instructivo, RLHF ni alineamiento de seguridad. Su tokenizer, un BPE byte-level de 16 384 tokens, también se entrenó desde cero sobre el mismo corpus. Con una ventana de contexto de 1024 tokens y un vocabulario reducido, está orientado a tareas de generación de texto en inglés dentro de los ámbitos legal y financiero, aunque su tamaño limita la coherencia en tareas complejas. Su relevancia actual radica en la transparencia del pipeline completo (limpieza, deduplicación, decontaminación) y en servir como referencia para quienes investigan modelos especializados de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (MHA, RoPE, SwiGLU, RMSNorm, embeddings atados) |
| Parametros totales | 125 848 320 (125,8 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama original: 12 capas, dimension oculta de 768, 12 cabezas de atencion (MHA), activacion SwiGLU, normalizacion RMSNorm y embeddings atados. La codificacion posicional usa RoPE con theta 10000. El tokenizer es un BPE byte-level de 16 384 tokens entrenado desde cero sobre el corpus de entrenamiento, lo que reduce el vocabulario frente a tokenizers genericos y adapta la segmentacion al dominio legal y financiero.

El entrenamiento se realizo sobre 2 040 millones de tokens unicos, compuestos por un 35,1 % de opiniones judiciales de EE. UU. (case-law), un 42,2 % de documentos SEC (PleIAs/SEC) y un 22,8 % de muestras de fineweb-edu como relleno de fluidez general. El pipeline de limpieza incluyo seis pasos deterministicos (filtros de linea, eliminacion de plantillas, deteccion de repeticiones de 4-gramas, filtro de idioma ingles, control de OCR mediante diccionario en case-law), deduplicacion MinHash y exacta, y decontaminacion de 13-gramas contra los conjuntos CaseHOLD y LexGLUE. Los datos se empaquetaron en ventanas de 1024 tokens con una particion 99/1 para entrenamiento y validacion.

El entrenamiento consumio 8 160 millones de tokens (4 epocas) en 15 568 pasos, con un batch global de 524 288 tokens, optimizador AdamW (betas 0,9/0,95, weight decay 0,1, clip 1,0), programacion de tasa de aprendizaje coseno de 0,0006 a 6e-05 con 200 millones de tokens de calentamiento, y precision bf16 con pesos maestros en fp32. Se utilizaron 8 GPU NVIDIA H100 en DDP de un solo nodo. La perdida final de validacion fue 2,1228. No se aplico RLHF ni ajuste instructivo.

## Capacidades

- Generacion de texto en ingles, con mejor comportamiento en dominios legal y financiero que en texto general (perplejidad 4,80 en SEC frente a 21,61 en fineweb-edu).
- Razonamiento basico limitado por el tamano del modelo; no es adecuado para tareas complejas de logica o matematica.
- No soporta tool calling, function calling, ni uso como agente autonomo.
- No dispone de capacidades multimodales (vision, audio) ni de modo thinking.
- Unicamente monolingue en ingles; no hay soporte para otros idiomas.
- Capacidad de contexto restringida a 1024 tokens, insuficiente para documentos largos sin truncamiento.

## Casos de uso

- Investigacion academica sobre modelos pequenos especializados: permite estudiar el efecto del dominio en la representacion linguistica y comparar arquitecturas compactas con recursos limitados.
- Ensenanza de procesamiento de lenguaje natural: sirve como ejemplo completo de preentrenamiento desde cero, incluyendo tokenizer propio, limpieza de datos y decontaminacion, con un coste de entrenamiento documentado.
- Prototipado de aplicaciones de generacion de texto legal: puede producir borradores de resumenes de opiniones judiciales o clausulas contractuales, siempre con supervision humana debido a su tendencia a confabular.
- Analisis exploratorio de documentos SEC: su baja perplejidad en este dominio (4,80) lo hace util para tareas de continuacion de texto o extraccion de frases tipicas en informes financieros.
- Benchmarking de tecnicas de deduplicacion y decontaminacion: al publicar el pipeline completo, permite reproducir y evaluar el impacto de cada paso en la calidad final.
- Generacion de datos sinteticos para entrenar modelos mas grandes: puede usarse para crear ejemplos de texto legal o financiero que luego se filtran y reutilizan en otros pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perplejidad sobre el split de validacion (1 % retenido):

| Split | Perplejidad |
|---|---|
| ALL | 8,31 |
| case-law | 8,68 |
| sec | 4,80 |
| fineweb-edu | 21,61 |

Estos valores indican una fuerte especializacion en el dominio financiero (SEC) y un comportamiento notablemente peor en texto web general, lo que confirma el sesgo del corpus de entrenamiento.

## Requisitos de hardware

- Inferencia en GPU consumer: con 125,8 M de parametros, el modelo cabe en tarjetas de 4-6 GB de VRAM en fp16 (aproximadamente 250 MB de pesos). Una RTX 3060 o superior es suficiente.
- Inferencia en CPU: viable con llama.cpp o transformers en CPU, con latencia de unos pocos cientos de milisegundos por token en hardware moderno.
- Cuantizacion: no se proporcionan cuantizaciones oficiales, pero al ser un modelo estandar de transformers puede cuantizarse a int8 o int4 con herramientas como bitsandbytes o GPTQ.
- Despliegue: compatible con transformers, vLLM, TGI, llama.cpp y Ollama (si se convierte a GGUF). Al ser un modelo pequeno, el throughput es alto incluso en una sola GPU.
- Entrenamiento: requirio 8x NVIDIA H100 (DDP, un solo nodo) durante aproximadamente 15 568 pasos; el coste total se estima en unos 32 dolares segun el autor, aunque no se detalla el tiempo exacto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada. Arquitectonicamente, slm125m-live es comparable a GPT-2 small (125 M parametros, contexto 1024) y a TinyLlama (1,1 B parametros, contexto 2048), pero no hay metricas publicadas que permitan una comparacion cuantitativa. La especializacion en legal/finanzas es su principal diferenciador frente a modelos de proposito general del mismo tamano.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha recibido ajuste instructivo ni RLHF, por lo que puede generar texto incoherente, repetitivo o factualmente incorrecto con facilidad.
- Riesgo de alucinacion elevado: al ser un modelo de 125 M, confabula libremente y no debe usarse para tomar decisiones legales o financieras reales.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Contexto limitado a 1024 tokens: no puede procesar documentos largos de una sola vez; requiere truncamiento o estrategias de ventana deslizante.
- Ruido OCR en la fuente case-law: a pesar del filtro de diccionario, persisten errores de escaneo que pueden afectar a la calidad del texto generado.
- Sesgo temporal en datos SEC: el corpus esta sesgado hacia documentos SEC antiguos, lo que puede desactualizar el conocimiento financiero del modelo.
- No apto para produccion: su tamano y falta de alineamiento lo desaconsejan para aplicaciones comerciales sin un ajuste fino posterior y una evaluacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/AnandHaridas1980/slm125m-live
- Sitio web del proyecto: https://slm125m.vercel.app/
- Repositorio GitHub (pipeline completo): https://github.com/shivamfet/slm125m
- Modelo base alternativo en HF: https://huggingface.co/seetha0712/slm125m-live-base
