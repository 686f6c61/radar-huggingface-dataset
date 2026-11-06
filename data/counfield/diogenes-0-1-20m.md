# Counfield/Diogenes-0.1-20M

## Resumen

Diogenes-0.1-20M es un modelo de lenguaje experimental a nivel de bytes, con 20,3 millones de parametros, desarrollado por el autor independiente Counfield bajo el proyecto de investigacion Sable. A diferencia de los transformers convencionales, se basa en la arquitectura Recurrent Looped Transformer (RLT), que introduce un bucle de retroalimentacion: el estado interno final de cada paso se realimenta al modelo en el siguiente mediante una puerta aprendida (learned gate). Esto le permite combinar la memoria atencional propia de un transformer con un estado recurrente persistente, similar al de una red neuronal recurrente.

El modelo opera directamente sobre bytes UTF-8 crudos, por lo que no necesita tokenizador, y su longitud de contexto es, en teoria, ilimitada, ya que la generacion mantiene un estado de tamano fijo en lugar de releer todo el contexto en cada paso. No es un asistente conversacional: se trata de un modelo de investigacion destinado a validar experimentalmente la arquitectura RLT, con el codigo y los experimentos publicados abiertamente. Su relevancia radica en explorar alternativas eficientes al mecanismo de atencion estandar para tareas que exigen tanto seguimiento de estado como acceso a memoria a largo plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Looped Transformer (RLT), byte-level |
| Parametros totales | 20.297.472 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | en teoria infinita (estado de tamano fijo por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre bytes UTF-8 crudos) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura RLT combina dos mecanismos. Por un lado, un codificador con atencion sobre toda la ventana de contexto, que actua como memoria de lo leido. Por otro, un decodificador con ventana deslizante que solo atiende a las ultimas posiciones mas su propio estado realimentado a traves de una puerta aprendida, de modo que el coste computacional de cada nuevo byte generado es constante. Un detalle metodologico destacable es que la puerta puede cerrarse: al hacerlo, el modelo se reduce a un transformer feed-forward ordinario, lo que permite aislar y medir directamente el efecto de la retroalimentacion.

Los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO) no se detallan en la model card, aunque el repositorio de investigacion enlazado recoge el registro completo de experimentos. El modelo se evaluó frente a un gemelo identico entrenado sin realimentacion, obteniendo 1,3745 bits por byte frente a 1,4408, y frente a arquitecturas recurrentes clasicas como GRU y LSTM en tareas de seguimiento de estado combinado con recuperacion de memoria.

## Capacidades

- Modelado de lenguaje a nivel de byte, sin tokenizador, sobre UTF-8 crudo
- Seguimiento de estado cambiante a lo largo de la secuencia (tarea en la que GRU, LSTM y el mismo modelo sin realimentacion no tuvieron exito)
- Recuperacion de hechos vistos anteriormente en el contexto (key-value retrieval)
- Generacion de texto con coste constante por byte generado
- Memoria atencional sobre la ventana de contexto con contexto teoricamente ilimitado
- No es un asistente: no tiene instrucciones de chat, tool calling ni capacidades de agente documentadas

## Casos de uso

- Investigacion en arquitecturas de lenguaje: sirve como prueba de concepto reproducible de la arquitectura RLT, con codigo, experimentos y resultados publicados, util para grupos que exploran alternativas a la atencion estandar.
- Estudio de memoria y estado en modelos pequenos: permite experimentar con tareas que combinan seguimiento de estado y recuperacion de hechos a distancia, algo dificil para RNNs clasicas y transformers puros.
- Procesamiento de texto sin tokenizador: al operar sobre bytes crudos, resulta util para experimentar con lenguajes sin tokenizador entrenado, codigo fuente, datos con caracteres raros o lenguas de baja dotacion.
- Generacion de texto de bajo coste por byte: el coste constante por paso lo hace candidato para explorar generacion muy larga en hardware modesto.
- Baseline comparativo: su puerta cerrable permite comparar directamente un transformer puro frente a su version recurrente bajo parametros identicos.
- Educacion y docencia: modelo de tamano minimo (20M, 0,1 GB) ejecutable en CPU, adecuado para ensenar como funcionan la atencion, la recurrencia y el modelado a nivel de byte.

## Benchmarks y rendimiento

| Benchmark | Diogenes-0.1-20M |
|---|---|
| Bits por byte en validacion (menor es mejor) | 1,3745 |
| Bits por byte (gemelo sin realimentacion) | 1,4408 |
| BLiMP (precision, azar 50 %) | 64,83 % |
| BLiMP (gemelo sin realimentacion) | 61,90 % |
| Key-value retrieval, claves entrenadas (exacta) | 100,0 % |
| Key-value retrieval, claves retenidas (exacta) | 74,4 % |
| Key-value retrieval, claves naturales (exacta) | 97,9 % |
| Hecho unico a distancia 0-448 bytes (exacta) | 99,7-100 % |

No se han publicado comparaciones con modelos comerciales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 20,3 millones de parametros en fp32, el modelo ocupa unos 80 MB; no se requiere GPU para inferencia, es ejecutable en CPU
- GPU recomendadas: no disponible (el modelo esta pensado para hardware minimo; cualquier GPU de consumo es mas que suficiente)
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna, incluso en integradas
- Opciones de despliegue: script propio `generate.py` incluido en el repositorio (ejemplo: `python generate.py --prompt "Once upon a time" --max-new-bytes 128`); no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, y la model card marca `inference: false` en Hugging Face
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Diogenes-0.1-20M | 20,3 M | teoricamente infinita | Recurrent Looped Transformer (byte-level) | MIT |
| Gemelo sin realimentacion (mismo proyecto) | 20,3 M | ventana de contexto | Transformer feed-forward (byte-level) | no disponible |
| GRU / LSTM (baselines del estudio) | no disponible | recurrente pura | RNN clasica | no disponible |

No hay modelos comerciales de categoria comparable publicados en la informacion disponible; el modelo se compara dentro de su propio estudio experimental.

## Limitaciones y advertencias

- No es un asistente ni un modelo conversacional: no ha sido entrenado para seguir instrucciones, chat, tool calling ni agentes
- Modelo de investigacion con solo 20,3 M de parametros: su calidad de texto y razonamiento es muy inferior a la de LLMs de produccion, y el riesgo de alucinacion y de texto incoherente es alto
- Precisa 74,4 % de exactitud en claves retenidas del key-value retrieval, lo que indica que la generalizacion de memoria fuera de lo visto en entrenamiento no es perfecta
- La precision en BLiMP (64,83 %) esta lejos de la de LLMs modernos, que superan el 90 % en esa misma prueba
- No hay datos de idiomas soportados ni de composicion del corpus de entrenamiento; el comportamiento en castellano u otras lenguas no esta documentado
- La inferencia en Hugging Face esta desactivada (`inference: false`), por lo que hay que ejecutarlo con el codigo del repositorio
- La licencia MIT es permisiva y permite uso comercial sin restricciones relevantes
- Al ser un modelo experimental con muy pocas descargas, no existe comunidad ni soporte consolidado; puede contener errores no detectados

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Counfield/Diogenes-0.1-20M
- Repositorio de investigacion (codigo, experimentos y resultados): https://github.com/berkmec/recurrent-looped-transformer-research
