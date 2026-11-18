# hhjuyh/Qwen3.8-35B-A3B-Hierophant-Abliterated-Aggressive

## Resumen

Qwen3.8-35B-A3B-Hierophant-Abliterated-Aggressive es una build comunitaria de GGUF publicada por el usuario hhjuyh sobre el modelo destilado de Empero `Qwen3.8-35B-A3B-Distill`, que a su vez deriva del base `Qwen/Qwen3.6-35B-A3B`. El nombre indica que se trata de una variante "abliterated": se le ha aplicado un adaptador de bajo rango denominado Hierophant a escala 1.5 sobre el GGUF Q6_K original, con el objetivo declarado de reducir el comportamiento de rechazo (refusals) del modelo.

La operacion descrita en la model card afecta a 121 tensores de un total de 753, preservando el formato de todos ellos. El resultado se distribuye en dos cuantizaciones GGUF (Q6_K y Q4_K_M) mas un proyector de vision en F16, lo que permite entrada de texto e imagen a traves de llama.cpp o LM Studio. El repositorio ocupa 51,8 GB y el conteo de parametros real declarado es de 35.505.251.456.

Es relevante ahora por dos motivos: por un lado, es un ejemplo de la ola de variantes "abliterated" y adaptadores de bajo rango aplicados sobre destilados de modelos Qwen, un fenomeno cada vez mas comun en el ecosistema open source; por otro, su pipeline declarado es image-text-to-text, lo que lo situa en la categoria de modelos multimodales abiertos de tamano medio (35B totales) con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (herencia de Qwen3.6-35B-A3B); el sufijo "A3B" sugiere activacion de ~3B parametros, pero la model card no confirma explicitamente una arquitectura MoE |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (el sufijo A3B apunta a ~3B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q4_K_M; proyector de vision F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en GGUF F16 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del base, mas alla de indicar que el modelo original es `Qwen/Qwen3.6-35B-A3B` y que Empero publico un destilado del mismo. El sufijo "A3B" en la nomenclatura Qwen suele indicar Mixture-of-Experts con aproximadamente 3B parametros activos, pero esta ficha no puede confirmarlo porque la informacion proporcionada no lo explicita. Lo que si queda claro es que se trata de un transformer con etapa de proyeccion visual (mmproj F16 de 0,90 GB) que permite entrada image-text-to-text.

El proceso de entrenamiento del modelo original no se describe. Lo que si esta documentado es la intervencion comunitaria: se aplico un adaptador Hierophant de rango 1 a escala 1.5 sobre el GGUF Q6_K de Empero, modificando 121 tensores y conservando el formato de los 753 tensores totales. El Q4_K_M se requantizo a partir del Q6_K resultante. No se mencionan RLHF, DPO ni datos de entrenamiento adicionales; la unica "innovacion" tecnica destacable es la abliteration via adaptador de bajo rango, una tecnica que busca atenuar direcciones de activacion asociadas a rechazos sin reentrenar el modelo completo.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Entrada de imagen ademas de texto: incluye proyector de vision F16 y la model card confirma que leyo un titulo de una imagen en llama.cpp.
- Razonamiento y codigo: heredados del base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones especificas en esta build.
- Reduccion de rechazos: el adaptador Hierophant a escala 1.5 busca que el modelo responda a peticiones que la build upstream declinaria.
- Idiomas: documentado solo para ingles (`en`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: comparar el comportamiento de esta build frente al GGUF upstream de Empero para medir el efecto del adaptador Hierophant a escala 1.5 sobre la tasa de rechazos, usando el mismo prompt set en ambas variantes.
- Despliegue local multimodal en estaciones de trabajo: cargar el Q4_K_M (21,71 GB) junto con el mmproj F16 en LM Studio para prototipar flujos image-text-to-text sin depender de APIs externas.
- Analisis de imagenes con OCR basico: la model card confirma lectura de titulos en imagenes; util para extraer texto de capturas o documentos en pipelines internos de bajo volumen.
- Evaluacion de robustez y seguridad: usar la variante "aggressive" como muestra negativa en estudios sobre alineamiento, comparando sus respuestas con las del base sin abliteration.
- Chat conversacional offline en ingles: el pipeline `conversational` y los GGUF lo hacen adecuado para asistentes locales en entornos sin conectividad, asumiendo uso exclusivamente en ingles.
- Reproduccion de merges de bajo rango: servir como referencia practica para quien quiera replicar el procedimiento Hierophant sobre otros GGUF Q6_K y requantizar a Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que ambas builds pasaron "a basic text check" y leyeron un titulo de una imagen en llama.cpp; no hay cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otras variantes.

## Requisitos de hardware

- VRAM estimada: Q6_K (29,21 GB) requiere aproximadamente 30-32 GB de VRAM o memoria unificada; Q4_K_M (21,71 GB) ronda 22-24 GB; el proyector de vision anade ~0,90 GB y requiere cargarse junto al modelo.
- GPU recomendadas: A100 40 GB, H100, o GPUs consumer de gama alta con 24 GB (RTX 3090/4090) para el Q4_K_M con margen ajustado; el Q6_K no cabe en GPUs de 24 GB y necesita 32 GB o mas, o descarga parcial a RAM.
- Cabe en consumer GPU: si, el Q4_K_M en RTX 3090/4090 (24 GB) con contexto moderado; en GPUs de 16 GB solo con cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp y LM Studio estan confirmados por la model card; vLLM, TGI y Ollama no se mencionan (Ollama podria importar el GGUF, pero no esta documentado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant-Aggressive (esta ficha) | 35,5B | no disponible | apache-2.0 | GGUF Q6_K/Q4_K_M + mmproj F16 | Build abliterated comunitaria, solo ingles |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF | no disponible | no disponible | no disponible en la informacion | GGUF upstream | Base directo de esta build, sin abliteration |
| Qwen/Qwen3.6-35B-A3B | ~35B (A3B) | no disponible | no disponible en la informacion | pesos originales | Modelo base de toda la cadena de destilacion |

La comparativa con alternativas de terceros no esta disponible en la informacion proporcionada; no se dispone de datos de rendimiento para establecer diferencias cuantitativas con otras builds del mismo tamano.

## Limitaciones y advertencias

- La abliteration reduce rechazos: el propio autor advierte que "the model may answer requests the upstream build would decline", lo que implica mayor riesgo de contenido danino, sesgado o inapropiado en produccion.
- Solo ingles documentado (`en`); no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Sin datos de contexto maximo, tool calling ni rendimiento; no apta para planificacion de capacidad en produccion sin evaluacion propia.
- La model card describe una unica verificacion basica de texto e imagen; no hay suite de evaluacion sistematica.
- El sufijo A3B y la arquitectura MoE no estan confirmados explicitamente en la informacion proporcionada; conviene verificar contra el repo de Qwen3.6-35B-A3B antes de asumir activaciones de ~3B.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de atribucion (Empero, Qwen) debe respetarse segun los terminos de cada eslabon.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria, sin issues resueltos ni garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant-Abliterated-Aggressive
- GGUF upstream de Empero: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Destilado de Empero (pesos): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo base original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto Hierophant: https://github.com/khimaros/hierophant
