# grafon-g2p/sk

## Resumen

grafon-g2p/sk es un modelo de conversion grafema-fonema (G2P) contextual para eslovaco, publicado por la organizacion grafon-g2p y entrenado con la libreria grafon sobre el modelo gerulata/slovakbert. Su funcion no es generar texto ni audio, sino transformar una cadena de texto en eslovaco en su secuencia de fonemas, un paso previo imprescindible en cualquier pipeline de sintesis de voz (TTS) o de reconocimiento de habla (ASR) que necesite un lexico de pronunciacion.

El modelo tiene 159.499.818 parametros y se distribuye en formato safetensors en un repositorio de 0,3 GB. Se apoya en un encoder preentrenado de eslovaco, lo que le permite resolver ambiguedades de pronunciacion que dependen del contexto y que un sistema basado en reglas o en un diccionario lexico no captura. El inventario de fonemas de salida es `abcdefijklmnoprstuvxzŋɟɡɣɦɱɲʃʎʒʣʤʦʧˈː̯̩`.

Es relevante porque cubre un idioma con pocos recursos dentro del ecosistema G2P neuronal y porque reutiliza un checkpoint eslovaco ya existente en lugar de entrenar desde cero, con un coste de entrenamiento e inferencia bajo. Sus limitaciones principales son la ausencia de licencia declarada, la falta de metricas publicadas y la practicamente nula validacion comunitaria (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, inicializado desde gerulata/slovakbert (configuracion exacta no disponible) |
| Parametros totales | 159.499.818 (~159,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay variantes GGUF, int8 ni int4 publicadas) |
| Idiomas soportados | eslovaco (sk) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | gerulata/slovakbert |
| Pipeline declarado | text-to-speech |
| Libreria de inferencia | grafon |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo G2P contextual para eslovaco entrenado con la herramienta grafon (https://github.com/thewh1teagle/grafon) sobre gerulata/slovakbert. No se especifica la configuracion interna (numero de capas, dimension oculta, cabezas de atencion), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta si el ajuste es de clasificacion por token (etiquetado secuencial) o de otro tipo.

El hecho de partir de un encoder preentrenado de eslovaco es la innovacion relevante del enfoque: el modelo hereda representaciones contextuales del idioma y solo necesita aprender la proyeccion de grafemas a fonemas, lo que explica un tamano de repositorio reducido y un coste de entrenamiento bajo. El inventario de salida incluye simbolos del Alfabeto Fonetico Internacional como `ʃ`, `ʒ`, `ʎ`, `ɲ`, `ɟ`, `ɡ`, `ɣ`, `ts`/`ʦ`, `tʃ`/`ʧ`, `dʒ`/`ʤ`, `dz`/`ʣ`, ademas de los diacriticos de longitud `ː`, el signo de acento `ˈ`, un diacritico de no silabico `̯` y el marcador silabico `̩`.

## Capacidades

- Conversion grafema-fonema (G2P) para eslovaco con salida en un inventario de simbolos tipo IPA.
- Resolucion contextual de la pronunciacion: al estar construido sobre un encoder bidireccional, la fonemizacion de un grafema puede depender de su entorno, algo que los sistemas basados en reglas no modelan.
- Fonemizacion compatible con pipelines TTS: la salida alimenta directamente un sintetizador que trabaje con el mismo inventario.
- Comportamiento de paso directo (passthrough) para cualquier caracter fuera del conjunto `aáäbcčdďeéfghiíjklĺľmnňoóôpqrŕsštťuúvwxyýzž`: se devuelve tal cual se escribio.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de vision, audio, thinking mode ni generacion de texto libre.
- Soporte multilingue: limitado al eslovaco.
- Integracion sencilla via API de Python de la libreria grafon.

## Casos de uso

- Front-end de un sistema TTS eslovaco: el modelo convierte las frases de entrada en secuencias de fonemas que el sintetizador acustico consume. Es su caso de uso principal y el que declara la model card.
- Lectura automatica de documentos y noticias: integrado en un pipeline de TTS para lectura en voz alta de prensa, informes o articulos, donde el caracter contextual del modelo ayuda con palabras flexionadas y compuestas frecuentes en eslovaco.
- Accesibilidad para personas con discapacidad visual: motor de pronunciacion de un lector de pantalla que necesite sintesis en eslovaco con buena cobertura de vocabulario general.
- Construccion de lexicos de pronunciacion para ASR: generar entradas de diccionario fonetico a partir de listas de palabras (dominios tecnicos, nombres propios, terminologia medica o legal) para un sistema de reconocimiento de habla en eslovaco.
- Corpus foneticos y alineacion forzada: producir transcripciones fonemicas de referencia para anotar corpus de habla o como paso previo a la alineacion entre audio y texto.
- Localizacion y doblaje: obtener la pronunciacion de guiones traducidos al eslovaco antes de la sintesis o del doblaje, especialmente util para revisar extranjerismos y toponimos.
- Investigacion en fonologia computacional: usar las predicciones del modelo para estudiar regularidades y excepciones grafema-fonema en eslovaco, incluida la adaptacion fonologica de prestamos.
- Sistemas de dialogo por voz: componente de text-to-speech en asistentes telefonicos o de atencion al cliente en eslovaco, donde la latencia baja y el reducido consumo de memoria del modelo son ventajas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se facilitan valores de tasa de error de fonema (PER), exactitud a nivel de palabra, comparaciones con espeak-ng ni evaluaciones de naturalidad dentro de un pipeline TTS. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no hay cifras publicadas. Segun el numero de parametros (159,5 M) y el tamano del repositorio (0,3 GB, coherente con pesos en fp16/bf16), la huella del modelo seria de aproximadamente 0,32 GB en fp16/bf16, 0,64 GB en fp32 y 0,16 GB en int8, a lo que habria que sumar el overhead de activaciones. Son estimaciones derivadas del numero de parametros, no medidas oficiales.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, el modelo cabe con holgura en cualquier GPU de consumo actual (por ejemplo RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4 GB o menos de VRAM.
- Cabe en GPU de consumo: si, y con margen amplio; es previsible que tambien funcione en CPU de forma viable para cargas por lotes.
- Opciones de despliegue: la via documentada es la libreria grafon sobre PyTorch (`Phonemizer.from_pretrained("grafon-g2p/sk")`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportacion a ONNX o TensorRT. Al no ser un modelo generativo autorregresivo, los servidores de inferencia de LLM no son aplicables.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para GPU ni para CPU.

## Comparativa con modelos similares

Los datos de las alternativas que aparecen a continuacion no proceden de la informacion proporcionada en esta busqueda y se incluyen solo como referencia de categoria; deberian verificarse antes de usarse en una decision tecnica.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grafon-g2p/sk | G2P neuronal contextual (ajuste de un encoder) | 159,5 M | eslovaco | no disponible | HuggingFace, libreria grafon |
| espeak-ng | G2P basado en reglas | no aplica | multilingue, incluye eslovaco | GPLv3 (referencia general, no verificada en esta busqueda) | paquete de sistema, codigo abierto |
| Modelo G2P sin lexico del articulo arXiv 2401.10465 | G2P neuronal con preentrenamiento sobre habla (HuBERT) | no disponible | no disponible | no disponible | publicacion academica |

No se dispone de comparaciones de rendimiento entre estas opciones ni de otros checkpoints de la misma organizacion, por lo que no es posible establecer una jerarquia objetiva.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Ademas, la licencia del modelo base gerulata/slovakbert condiciona la del ajuste y no se detalla en la informacion disponible.
- Ausencia total de metricas: no hay PER, exactitud por palabra ni evaluacion dentro de un TTS, por lo que la calidad real es desconocida.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- Monolingue: solo eslovaco; no se contempla entrada en otros idiomas.
- Paso directo de caracteres desconocidos: cualquier caracter fuera del conjunto de letras eslovacas admitido se devuelve tal cual, lo que puede introducir ruido en el sintetizador. Esto afecta de forma previsible a cifras, signos de puntuacion, abreviaturas y simbolos, ya que no se documenta ningun modulo de normalizacion de texto.
- Longitud de contexto no documentada: se desconoce el maximo de tokens de entrada, por lo que frases o parrafos largos podrian truncarse o degradarse.
- Riesgo de error en prestamos y nombres propios: aunque el modelo es contextual, no se documenta ningun mecanismo de lexico excepcional, y estos casos son los mas propensos a pronunciaciones incorrectas. No es un modelo generativo de texto libre, por lo que el riesgo de alucinacion no se manifiesta como texto inventado, sino como fonemas erroneos.
- Sesgos potenciales heredados del corpus de preentrenamiento de gerulata/slovakbert, cuya composicion no se detalla en la informacion disponible.
- Fechas de creacion y actualizacion poco habituales (2026-09-25), sin historial de versiones documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grafon-g2p/sk
- Modelo base gerulata/slovakbert: https://huggingface.co/gerulata/slovakbert
- Libreria grafon (repositorio): https://github.com/thewh1teagle/grafon
- Articulo relacionado con G2P sin lexico (referencia general, no especifica de este modelo): https://arxiv.org/html/2401.10465v1
- Resultados de busqueda no relacionados con este modelo y descartados: https://www.graphon.ai/, https://mrunreal.github.io/ModelForest/, https://www.businesswire.com/news/home/20260514783447/en/Former-Amazon-Meta-Scientists-Unveil-Graphon-AI-the-First-Pre-Model-Intelligence-Layer-with-%248.3M-in-Seed-Funding, https://deepmind.google/models/gemini/
