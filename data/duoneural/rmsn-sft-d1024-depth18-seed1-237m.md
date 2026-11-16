# DuoNeural/RMSN-SFT-d1024-depth18-seed1-237M

## Resumen

RMSN-SFT-d1024-depth18-seed1-237M es un modelo de lenguaje desarrollado por DuoNeural, un laboratorio del que no se dispone de informacion adicional en la documentacion proporcionada. Se trata de una variante de 237 millones de parametros perteneciente a una familia denominada RMSN, entrenada mediante fine-tuning supervisado (SFT) durante 20.000 pasos sobre una configuracion de 1024 dimensiones de modelo y 18 capas de profundidad. El identificador del modelo indica que forma parte de un barrido sistematico de profundidad ("depth-sweep"), con esta variante concreta correspondiente a la semilla 1.

La model card destaca un resultado de 8.45 en una metrica de cadena de razonamiento (CoT) que el autor presenta como record dentro de la escalera de profundidad D=1024 y como cuarto mejor resultado historico del laboratorio en noviembre de 2026. El modelo se posiciona explicitamente en torno a un concepto propietario denominado "KAM Proximity Law" y una topologia "near-KAM" con valor Ω=8/9 y "condensado terminal", terminologia que no se explica ni se referencia a literatura publica en la informacion disponible.

Por su tamano (237M parametros) y su licencia MIT, el modelo es tecnicamente desplegable en hardware de consumo, pero la ausencia de especificaciones estandar (contexto, tokenizador, idiomas, benchmarks reconocidos) limita seriamente su evaluacion objetiva. Es relevante principalmente como artefacto de investigacion dentro de una linea experimental concreta, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (familia propietaria del autor; no se detalla la arquitectura interna) |
| Parametros totales | 237M (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo ocupa 0.8 GB, compatible con safetensors en fp32/bf16, pero no se confirma) |

## Arquitectura y entrenamiento

La informacion disponible indica una configuracion de dimension de modelo D=1024 y 18 capas (L=18), con una topologia descrita como "near-KAM" con Ω=8/9 y "condensado terminal". El autor afirma que el modelo "demuestra la KAM Proximity Law", pero no se proporciona definicion formal de KAM, ni del significado de Ω=8/9, ni de como se implementa esa topologia en la red. No se especifica si la arquitectura base es un transformer estandar, una variante con atencion modificada u otro tipo de bloque.

El entrenamiento consistio en 20.000 pasos de SFT (supervised fine-tuning) sobre la semilla 1. No se detalla el volumen de tokens de preentrenamiento, la composicion del dataset de SFT, ni si hubo etapas de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas estandar como decodificacion especulativa, atencion lineal o mezcla de expertos. La metrica CoT de 8.45 se reporta sin definir la escala, el benchmark ni el protocolo de evaluacion.

## Capacidades

- Generacion de texto y razonamiento: el autor reporta capacidad de cadena de razonamiento (CoT) con una puntuacion de 8.45, aunque sin especificar la metrica ni el conjunto de evaluacion.
- Fine-tuning supervisado: el modelo ha pasado por 20k pasos de SFT, lo que sugiere cierta capacidad de seguir instrucciones, si bien no se documenta el formato de prompt ni la plantilla de chat.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el unico indicio es la metrica CoT mencionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion sobre barridos de profundidad: el modelo forma parte de una escalera de profundidad D=1024 con multiples semillas y profundidades; se usaria para reproducir y comparar resultados dentro de esa linea experimental.
- Experimentos de razonamiento con CoT: dado que el autor reporta una metrica CoT, puede emplearse como sujeto de prueba en estudios sobre cadenas de razonamiento en modelos pequenos (237M).
- Prototipado local en hardware de consumo: con 237M parametros y licencia MIT, es viable ejecutarlo en GPU de gama media o incluso en CPU para pruebas de concepto sin coste de licencia.
- Fine-tuning adicional: al ser un checkpoint SFT pequeno y permisivo, sirve como base para experimentos de ajuste en dominios concretos con recursos limitados.
- Reproducibilidad de resultados del laboratorio: util para verificar las afirmaciones sobre la "KAM Proximity Law" y la topologia Ω=8/9 en entornos independientes.
- Educacion y divulgacion: como ejemplo de modelo pequeno con licencia MIT para demostrar pipelines de entrenamiento SFT y evaluacion de CoT.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| CoT | 8.45 | Reportado por el autor; #1 en la escalera D=1024 y #4 historico del laboratorio (noviembre de 2026). Escala y benchmark no especificados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 237M parametros, aproximadamente 0.5 GB en fp16/bf16 y alrededor de 0.25 GB en cuantizacion de 8 bits; en fp32, cerca de 1 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPUs de portatil con 4 GB o mas.
- Cabe en consumer GPU: si, con amplio margen.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no confirmarse el formato de pesos, la integracion requeriria conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-SFT-d1024-depth18-seed1-237M | 237M | no disponible | MIT | Hugging Face | Modelo experimental con terminologia propietaria; sin benchmarks estandar |
| Modelos tipo GPT-2 small | ~124M | 1024 | MIT | Amplia | Referencia clasica de modelos pequenos; benchmarks publicos |
| Modelos tipo Pythia-410M | 410M | 2048 | Apache 2.0 | Amplia | Suite de investigacion con checkpoints intermedios y evaluacion publica |
| Modelos tipo SmolLM-360M | 360M | 2048 | Apache 2.0 | Amplia | Modelo pequeno con benchmarks publicados y soporte en herramientas estandar |

La comparacion se limita a la categoria por tamano; no existen datos de rendimiento comparables del modelo RMSN frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks estandar: la unica metrica reportada (CoT 8.45) carece de definicion, escala y protocolo, por lo que no es verificable ni comparable.
- Terminologia no documentada: "KAM Proximity Law", "Ω=8/9" y "condensado terminal" no se explican ni se referencian a literatura publica en la informacion disponible.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: previsiblemente alto en un modelo de 237M sin evaluacion publica; no hay datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados, lo que impide garantizar su uso en produccion multilingue.
- Licencia: MIT permite uso comercial, pero la falta de documentacion sobre procedencia de datos puede plantear riesgos de cumplimiento que el autor no aborda.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin senales de adopcion ni mantenimiento.
- Formato de pesos no confirmado: la integracion en stacks de inferencia estandar puede requerir trabajo adicional de conversion.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1024-depth18-seed1-237M
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
