# MichielH/Qwen3.5-0.8B-NKC

## Resumen

Qwen3.5-0.8B-NKC es un modelo derivado de Qwen/Qwen3.5-0.8B desarrollado por MichielH mediante una tecnica que el autor denomina Neural Knowledge Compiler (NKC). No se trata de un fine-tuning convencional: el modelo conserva exactamente la misma arquitectura y el mismo numero de parametros (873.438.784) que el modelo base, pero modifica directamente un pequeno conjunto de tensores existentes para incorporar capacidades nuevas. Concretamente, se alteran unos 3,28 millones de pesos (el 0,38 % del total) repartidos en cuatro tensores del modelo.

La motivacion es doble. Por un lado, aplicar una correccion publicada del "bucle de razonamiento" que afecta al modo thinking del Qwen3.5-0.8B original, que en la practica agota el limite de 32.768 tokens sin llegar a una respuesta en la mayoria de problemas. Por otro, transferir conocimiento de otros modelos (Depth Anything V2 y un world model JEPA-WM sobre Push-T) hacia las capas visuales del modelo receptor, sin anadir parametros ni requerir un modelo donante en inferencia.

El resultado es relevante porque demuestra que es posible mejorar capacidades concretas de un modelo pequeno editando su espacio de pesos, manteniendo compatibilidad total con `transformers` estandar y sin codigo personalizado. El modelo se distribuye con licencia Apache 2.0 y un manifiesto (`nkc_manifest.json`) que documenta cada tensor modificado, su origen y sus hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: ViT de 12 bloques + patch merger + modelo de lenguaje hibrido de 24 capas (qwen3_5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (limite de generacion en modo thinking segun el protocolo de evaluacion) |
| Tipos de cuantizacion | no disponible (el modelo se evalua en bf16; el repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La anatomia del receptor, segun la model card, es la siguiente: un ViT de 12 bloques produce caracteristicas que pasan por un patch merger (LayerNorm -> 3072 -> GELU -> `linear_fc2` -> 1024) y alimentan un modelo de lenguaje hibrido de 24 capas. Todas las ediciones visuales son actualizaciones de bajo rango sobre `linear_fc2`, de la forma `merger_out' = W2 h + b2 + U (R h + r0)`, es decir, `W2 += U R` y `b2 += U r0`, sin introducir parametros nuevos.

El entrenamiento no sigue un esquema clasico de preentrenamiento ni de RLHF/DPO. Se compone de tres intervenciones. Primero, la reparacion del bucle de razonamiento: se aplica de forma bit-exacta la edicion publicada p50c de RikiyaT, que resta una direccion de bucle de 64 columnas de salida en las capas 15 y 19 (`mlp.down_proj`), afectando a 130.188 entradas. Segundo, la transferencia de profundidad: se leen mapas de profundidad de Depth Anything V2 a partir de las 3.072 neuronas del merger mediante regresion ridge en forma cerrada (R^2 en held-out de 0,36) y se escribe la lectura a lo largo de la direccion "cerca menos lejos" del propio modelo, sin pasos de gradiente. Tercero, la fisica de Push-T: se supervisa con el cambio latente predicho por JEPA-WM y se usa una ridge generalizada con regularizacion de interferencia, calibrando el mapa de escritura (3 x 1024 = 3.072 escalares) en 300 pasos de Adam sobre 2.400 escenas etiquetadas solo por el world model.

El tensor `model.visual.merger.linear_fc2.weight` y su `.bias` acumulan 3.146.752 entradas modificadas, correspondientes a una actualizacion de rango 4 (rango 1 para el canal de profundidad y rango 3 para el canal de fisica). La model card documenta tambien intervenciones que no funcionaron y no estan incluidas: la transferencia de agrupacion de objetos de DINOv2, una proyeccion al espacio nulo contra activaciones de imagenes naturales y una edicion adicional propia de eliminacion de bucle.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con una reduccion drastica de la tasa de respuestas truncadas por el limite de 32.768 tokens (del 96 % al 32 % en MATH-500).
- Razonamiento matematico: mejora de 6 % a 53 % en MATH-500 y de 16 % a 76 % en GSM8K en modo thinking.
- Seguimiento de instrucciones: 62 % en IFEval estricto a nivel de prompt en modo thinking (frente al 20 % del original).
- Vision-language: el pipeline declarado es `image-text-to-text`, con entrada de imagen y texto.
- Percepcion de profundidad relativa: capacidad de responder preguntas de comparacion "que punto esta mas cerca/lejos de la camara" sobre imagenes NYU.
- Razonamiento fisico simple sobre escenas Push-T: predecir si el empujador movera el bloque.
- Compatibilidad con tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking y modo por defecto (non-thinking), ambos documentados en el protocolo de evaluacion.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede resolver problemas de aritmetica y algebra paso a paso en modo thinking, con una tasa de acierto del 76 % en GSM8K y del 53 % en MATH-500, adecuada para asistencia educativa con verificacion humana.
- Generacion de cadenas de razonamiento para destilacion: al producir trazas de razonamiento que ya no se truncan en la mayoria de casos (solo el 2 % en GSM8K e IFEval), sirve para generar datos de entrenamiento de razonamiento a bajo coste.
- Evaluacion de instrucciones y formateo: con un 62 % en IFEval estricto, puede usarse como componente de validacion de prompts o de generacion de respuestas que respeten restricciones de formato.
- Analisis de profundidad en imagenes: la mejora de +5,2 a +7,2 puntos en comparaciones de profundidad NYU permite integrarlo en tareas de comprension de escenas, como descripcion de interiores o asistencia a personas con discapacidad visual.
- Razonamiento fisico en robotica ligera: la capacidad de predecir si un empujon movera un objeto (88-89 % frente al 50 % de azar) es util para planificacion de manipulacion simple o para filtrar planes en simulacion.
- Prototipado rapido en entornos con recursos limitados: al ocupar 1,8 GB en safetensors y no requerir codigo personalizado, puede desplegarse en una unica GPU consumer para experimentos de vision-lenguaje.
- Investigacion en edicion de pesos: sirve como caso de estudio reproducible de weight-space programming, con manifiesto de hashes y protocolo de evaluacion detallado, para quienes investigan transferencia de conocimiento sin reentrenamiento.

## Benchmarks y rendimiento

Resultados de texto en modo thinking (subconjuntos fijos con semilla):

| Benchmark | Original | NKC |
|---|---|---|
| MATH-500, thinking (100) | 6 % | 53 % |
| GSM8K, thinking (50) | 16 % | 76 % |
| IFEval, thinking (50) | 20 % | 62 % |
| Respuestas truncadas a 32k en MATH-500 / GSM8K / IFEval | 96 % / 82 % / 78 % | 32 % / 2 % / 2 % |

Resultados de texto en modo por defecto (non-thinking):

| Benchmark | Original | NKC |
|---|---|---|
| MATH-500 (500) | 46,6 % | 44,4 % |
| GSM8K (1.319) | 57,7 % | 55,4 % |
| IFEval (541) | 53,0 % | 48,8 % |

Resultados de vision (diferencia pareada frente al original, IC 95 %):

| Benchmark | Original | NKC | Delta |
|---|---|---|---|
| NYU depth "closer" | 77,1 % | 82,2 % | +5,2 [+2,4, +7,9] |
| NYU depth "farther" | 75,3 % | 82,6 % | +7,2 [+3,8, +10,9] |

La model card indica tambien que el comportamiento solo-texto es byte-identico al modelo matematico publicado (tokens greedy identicos, diferencia maxima de logit de 0,0).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,75 GB solo para pesos (873,4 M parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 1,8 GB.
- Cabe en cualquier GPU consumer moderna con al menos 4-6 GB de VRAM en bf16; en cuantizaciones de 8 o 4 bits el margen es aun mayor, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: RTX 3060/4060 o superiores para uso individual; A100/H100 no son necesarias para este tamano, pero pueden emplearse para servir multiples peticiones concurrentes.
- Opciones de despliegue: `transformers` estandar (declarado por el autor); la evaluacion de texto se realizo con vLLM en bf16. No se documenta compatibilidad explicita con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo especifica el protocolo de muestreo (temperatura, top_p, top_k, presencia) y el limite de 32.768 tokens nuevos en thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (thinking) | GSM8K (thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-NKC | 873,4 M | 32.768 | 53 % | 76 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873,4 M | 32.768 | 6 % | 16 % | Apache 2.0 (segun modelo base) | Hugging Face |
| RikiyaT/Qwen3.5-0.8B-weight-space-programming (p50c) | 873,4 M | 32.768 | 48,1 % | 67,1 % | no disponible en la informacion | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de otros modelos de tamano o categoria similares. El modelo p50c reporta sus cifras con 4/2/2 muestras sobre los conjuntos completos, por lo que no son directamente comparables con los subconjuntos fijos de 100/50/50 usados por NKC.

## Limitaciones y advertencias

- El modo por defecto (non-thinking) empeora ligeramente respecto al original en los tres benchmarks de texto: -2,2 puntos en MATH-500, -2,3 en GSM8K y -4,2 en IFEval. La mejora esta concentrada en el modo thinking.
- El 32 % de las respuestas de MATH-500 en thinking siguen truncandose a 32.768 tokens, por lo que persiste una fraccion de fallos por bucle.
- La capacidad de profundidad se evalua con comparaciones de dos opciones sobre NYU; no hay evidencia publicada de rendimiento en profundidad absoluta ni en otros dominios visuales.
- La capacidad de fisica Push-T proviene de un world model (JEPA-WM) y no de verdad de simulador durante la calibracion; su generalizacion fuera de ese dominio no esta documentada.
- Las ediciones visuales se limitan a `linear_fc2` del merger con rango 4; la model card reconoce que otras transferencias (DINOv2, proyeccion al espacio nulo) no funcionaron y podrian reaparecer como interferencias no medidas.
- No se proporcionan datos sobre sesgos, idiomas soportados ni comportamiento multilingue; el modelo base es de 0,8 B, por lo que la fiabilidad en tareas abiertas es limitada.
- Riesgo de alucinacion inherente a un modelo de este tamano; los benchmarks reportados son de opcion multiple o de respuesta verificable, no de generacion abierta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar el manifiesto `nkc_manifest.json` antes de desplegar en produccion.
- El modelo fue creado y actualizado el 17 de noviembre de 2026 y no registra descargas ni likes, por lo que no existe validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MichielH/Qwen3.5-0.8B-NKC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Edicion publicada p50c: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Manifiesto de cambios: `nkc_manifest.json` (incluido en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
