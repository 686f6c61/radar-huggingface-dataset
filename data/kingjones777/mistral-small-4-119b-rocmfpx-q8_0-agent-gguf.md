# kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

Mistral-Small-4-119B-ROCmFPX-Q8_0-AGENT-GGUF es una cuantizacion de 8 bits del modelo Mistral Small 4 119B A6B, desarrollada por el usuario kingjones777 y publicada en HuggingFace. Se trata de una conversion a formato GGUF del modelo original de Mistral AI, optimizada especificamente para hardware AMD con soporte ROCm, utilizando el formato de cuantizacion propietario ROCmFPX. El modelo base, Mistral Small 4, es un modelo hibrido de 119.000 millones de parametros con arquitectura de mezcla de expertos (MoE) que activa solo 6.500 millones de parametros por token, lo que lo hace notablemente eficiente para su tamano.

Esta version concreta emplea el tipo de cuantizacion Q8_0_ROCMFPX_AGENT, disenado para preservar la maxima fidelidad posible respecto al modelo original en precision BF16, a costa de un tamano de archivo considerable (116,15 GiB). La variante AGENT esta pensada para escenarios de agente y tool calling. Su relevancia radica en que permite ejecutar un modelo de 119B en hardware AMD de gama alta con ROCm, algo que no es trivial dado el ecosistema de inferencia tradicionalmente centrado en NVIDIA. Sin embargo, presenta una limitacion critica: no cabe en la memoria GPU de un AMD Ryzen AI MAX+ 395 con 128 GB, por lo que su uso practico se limita a sistemas con mas memoria o a inferencia parcial en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer hibrido |
| Parametros totales | 118.972.826.624 (119B) |
| Parametros activos | 6.500.000.000 (6,5B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX_AGENT (ftype 115), 8,38 bits por peso |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base Mistral Small 4 119B A6B es un modelo hibrido que unifica las capacidades de tres familias anteriores de Mistral: Instruct, Reasoning (antes Magistral) y Devstral. Emplea una arquitectura de mezcla de expertos con 119.000 millones de parametros totales, de los cuales solo 6.500 millones se activan por token, lo que reduce significativamente el coste computacional por inferencia. El modelo es multimodal, acepta entrada de imagenes ademas de texto, y puede alternar entre modo instruccion general y modo razonamiento.

Esta cuantizacion concreta se construyo a partir de los pesos originales en BF16 (222 GiB), no como una recuantizacion de una version de menor precision. El proceso de conversion utilizo `--output-tensor-type q8_0 --token-embedding-type q8_0 --tensor-type shexp=q8_0`, aplicando cuantizacion de 8 bits a 108 tensores de expertos compartidos. El resultado es un archivo GGUF v3 con 579 tensores y 59 pares KV, estructuralmente identico al modelo fuente. No se aplico ningun entrenamiento adicional ni ajuste fino; es exclusivamente una conversion de formato.

## Capacidades

- Generacion de texto y razonamiento: al heredar las capacidades del modelo base, puede actuar como modelo de instruccion general y como modelo de razonamiento, alternando entre ambos modos.
- Soporte multimodal: el modelo base acepta entrada de imagenes, aunque esta cuantizacion no especifica si dicha capacidad se preserva integramente en el formato GGUF.
- Tool calling y funciones: la variante AGENT esta especificamente disenada para escenarios de agente, lo que implica soporte para invocacion de herramientas y llamadas a funciones.
- Codigo: hereda las capacidades de la familia Devstral, orientada a generacion y edicion de codigo.
- Multilingue: el modelo base soporta multiples idiomas, aunque la ficha de esta cuantizacion solo declara ingles.
- Eficiencia computacional: gracias a la arquitectura MoE con solo 6,5B parametros activos, el coste por token es comparable al de un modelo mucho mas pequeno.

## Casos de uso

- Despliegue de agentes autonomos en hardware AMD: la variante AGENT esta optimizada para tool calling, lo que permite construir agentes que interactuan con APIs, ejecutan comandos y toman decisiones multi-paso. Su cuantizacion de 8 bits preserva la calidad del modelo original, critica para tareas de razonamiento complejo.
- Razonamiento avanzado con alta fidelidad: para investigacion o aplicaciones donde la precision del modelo es prioritaria, esta cuantizacion de 8 bits ofrece la maxima calidad disponible en formato GGUF, a costa de requerir hardware con abundante memoria.
- Generacion de codigo en entornos AMD: gracias a la herencia de Devstral, puede usarse para asistencia de programacion, generacion de tests y refactorizacion, con la ventaja de ejecutarse localmente en hardware AMD sin necesidad de GPU NVIDIA.
- Analisis de documentos largos con contexto extenso: aunque la longitud de contexto no se especifica en esta ficha, el modelo base soporta ventanas de contexto amplias, util para procesar documentacion tecnica o legales completas.
- Inferencia hibrida CPU-GPU: dado que no cabe en la memoria GPU de un Strix Halo, puede desplegarse con descarga parcial de capas a CPU, aprovechando la RAM del sistema para modelos que exceden la VRAM disponible.
- Investigacion sobre cuantizacion ROCmFPX: este modelo sirve como referencia para evaluar el impacto de la cuantizacion de 8 bits en la calidad de salida frente a versiones de 4 bits, en plataformas AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizaron pruebas de perplexity, ni comparaciones de calidad contra el modelo fuente, ni tests de contexto largo o tool calling. El unico dato de rendimiento verificado es la carga en CPU: 256 segundos desde disco con `-ngl 0`. No se proporciona ninguna cifra de tokens por segundo para inferencia con GPU, ya que el modelo no cabe en la memoria GPU del hardware de pruebas.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 116,15 GiB, por lo que se necesita al menos esa cantidad de memoria disponible para cargar el modelo completo en GPU. En la practica, con overhead de ejecucion, se recomienda un minimo de 128 GiB de VRAM.
- GPU recomendadas: AMD Instinct MI300X (192 GB), o configuraciones multi-GPU con suficiente memoria agregada. No cabe en un AMD Ryzen AI MAX+ 395 (128 GB direccionables, 113,03 GiB utiles).
- GPU de consumo: no cabe en ninguna GPU de consumo actual, incluyendo RTX 4090 (24 GB) o RX 7900 XTX (24 GB).
- Opciones de despliegue: llama.cpp con el fork ROCmFPX de charlie12345. No es compatible con llama.cpp estandar, que reporta `invalid ggml type 103`. Tampoco es compatible con vLLM, Ollama o TGI en sus versiones estandar.
- Latencia y throughput: no medidos. El autor no proporciona cifras de tok/s para GPU. En CPU pura, la carga tarda 256 segundos, pero no se indica la velocidad de generacion.
- Alternativa recomendada por el autor: para sistemas con 128 GB de memoria, usar la version de 4 bits (63,07 GiB, 37,86 tok/s en Strix Halo).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| Mistral-Small-4-119B-ROCmFPX-Q8_0-AGENT (este) | 119B | 6,5B | No disponible | 8 bits ROCmFPX | Apache 2.0 | GGUF |
| Mistral-Small-4-119B-ROCmFP4-GGUF | 119B | 6,5B | No disponible | 4 bits ROCmFPX | Apache 2.0 | GGUF |
| Mistral-Small-4-119B-2603 (original) | 119B | 6,5B | No disponible | BF16 | Apache 2.0 | Safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de modelos comparables de otros fabricantes en la informacion proporcionada. La diferencia principal entre las tres versiones es el nivel de cuantizacion: la version de 4 bits cabe en un Strix Halo y alcanza 37,86 tok/s, mientras que la de 8 bits requiere hardware con mas memoria. El modelo original en BF16 ocupa 222 GiB y es la referencia de calidad.

## Limitaciones y advertencias

- No cabe en un AMD Ryzen AI MAX+ 395 con 128 GB: el autor advierte que intentar cargarlo con `-ngl 999` produce un bloqueo grave del sistema (KFD SVM D-state livelock) que requiere reinicio fisico. No usar `-fit off` como solucion, ya que agrava el problema.
- Requiere un fork especifico de llama.cpp: el tipo de cuantizacion Q8_0_ROCMFPX_AGENT solo existe en el repositorio ROCmFPX de charlie12345. El llama.cpp estandar no puede cargar este archivo.
- Sin benchmarks de calidad: no se ha medido perplexity, ni comparado la calidad de salida contra el modelo original, ni probado tool calling o contexto largo. El unico test de correctitud es una operacion aritmetica y una pregunta de cultura general en CPU.
- Sin cifras de rendimiento en GPU: no se proporciona ningun dato de tokens por segundo para inferencia acelerada por GPU.
- Sesgos y alucinaciones: al ser una cuantizacion del modelo Mistral Small 4, hereda los sesgos y limitaciones del modelo base, que no se detallan en la informacion disponible.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor de la cuantizacion no ofrece ninguna garantia sobre el funcionamiento en produccion.
- Idioma: solo se declara soporte para ingles, aunque el modelo base podria soportar otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Version de 4 bits: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFP4-GGUF
- Version de 8 bits sin AGENT: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-GGUF
- Fork de llama.cpp con ROCmFPX: https://github.com/charlie12345/ROCmFPX
