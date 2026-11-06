# john54334343/sn92-generalist-m1-core7f

## Resumen

SN92 generalist-m1-core7f es un modelo de decisión (decision model) publicado por el usuario john54334343 en Hugging Face. Se trata de un merge en espacio de pesos de cuatro fine-tunes derivados de baselabs/mammoth-1, un modelo post-entrenado a partir de Qwen3.5-27B (Apache-2.0) por Base Labs / Baseten. El resultado es un modelo de 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) que conserva la arquitectura Qwen3_5Model con atención completa no causal y un cabezal de lectura de códigos de respuesta (answer-code readout) en el formato REAX joint-readout.

El modelo resuelve una tarea concreta: la clasificación y selección de respuestas entre opciones discretas (decisiones de opción múltiple, juicios de NLI, clasificación de intenciones, etc.), emitiendo un código de respuesta en lugar de texto libre. Por eso su pipeline_tag es text-classification y no text-generation, pese a estar construido sobre un backbone de lenguaje de 27B. La relevancia actual radica en que aplica aritmética de tareas lineal en el espacio de pesos para combinar capacidades de varios fine-tunes sin reentrenar, y en que documenta de forma exhaustiva la procedencia y licencia de todos los datos usados.

El repositorio ocupa 52,2 GB en formato safetensors y pytorch, con licencia MIT. No se declaran idiomas soportados en los metadatos. El modelo no está afiliado ni respaldado por Base Labs, Baseten, el equipo de Qwen ni los autores de los modelos padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención completa no causal y cabezal de lectura de códigos de respuesta (REAX joint-readout) |
| Parametros totales | 26.085.330.160 (aprox. 26,1 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo es un merge en espacio de pesos de cuatro fine-tunes: isomsom/sn92-gen-m87b (peso 0,7), xflud/sn92-decider-1 (peso 0,7), y dos fine-tunes propios del autor (v7a y v3b, peso 0,25 cada uno). La receta aplica aritmética de tareas lineal tensor a tensor sobre el backbone: `base + lam * combine_i(w_i * (parent_i - base))` con lam = 1,0, calculado en float32 y redondeado una sola vez a bfloat16. El cabezal de lectura (`readout.safetensors`) es la media de los readouts de los padres tras normalizar cada uno por su escala respecto al readout de mammoth-1, ajustada sobre las filas de letras centradas por fila.

Los fine-tunes propios se entrenaron con LoRA r16 / alpha 32 sobre las 64 capas del modelo de lenguaje, con entropía cruzada sobre softmax(logits de letra / 2) contra etiquetas suavizadas (0,1), AdamW con lr 5e-5 y decaimiento coseno, batch efectivo 32. El fine-tune v7a usó la mezcla v3a más 7.620 filas de "owner-gap" (postura, sarcasmo, NLI de ensayos clínicos, aritmética GSM8K-train con distractores de código, recuperación de herramientas de línea de comandos, recuperación de contraargumentos y ranking de productos), con semilla de datos 2 y 1.590 pasos de optimizador (1 época). El fine-tune v3b usa la misma receta y datos con semilla 1.

Los datos de entrenamiento de los padres propios provienen exclusivamente de fuentes permisivas: generadores procedimentales propios (CC0), Project Gutenberg, listas de apellidos del censo de EE. UU., CMU Pronouncing Dictionary (BSD-2), GeoNames (CC BY 4.0), ContractNLI, HANS, MASSIVE 1.1, CLINC150, BANKING77, args.me, metadatos de arXiv, Wikidata, Aegis 2.0, PEPs de Python, RFCs de la IETF, obras del gobierno de EE. UU. (NHTSA, openFDA, Federal Register, NOAA), WinoGrande, CommonsenseQA, StrategyQA, QASC, OpenBookQA, ESCI, MedMCQA, XCOPA, Cosmos QA y QuaRTz. No se incluye texto de item escrito por modelos de OpenAI o Anthropic ni el split de test de Decision-Index, y no se distribuyen ficheros de dataset en el repositorio.

## Capacidades

- Clasificación de decisiones entre opciones discretas mediante emisión de códigos de respuesta (letras), no generación de texto libre.
- Razonamiento de opción múltiple sobre dominios diversos: aritmética, lógica, sentido común, NLI, causalidad.
- Clasificación de intenciones y recuperación de herramientas (tool retrieval) a partir de CLINC150, MASSIVE y BANKING77.
- Recuperación de contraargumentos y ranking de productos (ESCI).
- NLI de ensayos clínicos y preguntas médicas (MedMCQA, ContractNLI).
- Detección de postura y sarcasmo (filas owner-gap del fine-tune v7a).
- Soporte multilingüe: no disponible en los metadatos; parte de los datos de entrenamiento (MASSIVE, XCOPA) son multilingües, pero no se declara cobertura de idiomas.
- Tool calling / function calling en sentido generativo: no disponible; el modelo está orientado a selección de opciones, no a emitir llamadas estructuradas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede asignar una etiqueta de decisión a un texto de entrada (por ejemplo, daño/no daño, postura a favor/en contra) aprovechando los datos de Aegis 2.0 y las filas de postura del fine-tune v7a.
- Enrutamiento de consultas en atención al cliente: clasificación de la intención del usuario entre un conjunto cerrado de categorías (BANKING77, CLINC150) para dirigir la conversación al flujo adecuado.
- Recuperación de herramientas en agentes: dado un enunciado, seleccionar la herramienta o comando de línea de comandos más probable entre un catálogo, usando los datos de tool retrieval del fine-tune v7a.
- Evaluación automática de respuestas en benchmarks de razonamiento: el modelo emite la letra de la opción correcta en ítems de MMLU-style, GSM8K, StrategyQA o CommonsenseQA, lo que permite usarlo como juez o como solver en pipelines de evaluación.
- Verificación de contratos y cláusulas: NLI sobre pares de premisa e hipótesis en documentos legales (ContractNLI) para detectar contradicciones o implicaciones.
- Ranking de productos en comercio electrónico: ordenar candidatos según la consulta del usuario (ESCI) en un sistema de búsqueda o recomendación.
- Filtrado de literatura científica: clasificación de resúmenes de arXiv o de registros de ensayos clínicos según criterios de inclusión predefinidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 B × 2 bytes), más overhead de activaciones y del cabezal de lectura; en la práctica se requiere al menos una GPU de 80 GB.
- Cuantización: no se documentan pesos GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ) para reducir la huella.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en bfloat16 sin cuantizar; configuraciones multi-GPU con tensor parallelism si no se cuantiza.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en bfloat16; sería necesario cuantizar a 4 bits (aprox. 13-15 GB) para que quepa en una RTX 4090, aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: vLLM o TGI para serving en bfloat16 con tensor parallelism; llama.cpp u Ollama solo tras convertir los pesos a GGUF. El pipeline es text-classification, por lo que el serving debe adaptarse al cabezal de lectura de códigos de respuesta, no al decoding generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sn92-generalist-m1-core7f | 26,1 B | no disponible | Clasificación de decisiones (REAX readout) | MIT | Hugging Face (16 descargas) |
| baselabs/mammoth-1 | no disponible | no disponible | Decision model (base del merge) | MIT | Hugging Face |
| Qwen3.5-27B | 27 B (aprox.) | no disponible | Generación de texto y razonamiento | Apache-2.0 | Hugging Face |
| isomsom/sn92-gen-m87b | no disponible | no disponible | Decision model (padre del merge) | MIT | Hugging Face |
| xflud/sn92-decider-1 | no disponible | no disponible | Decision model (padre del merge) | MIT | Hugging Face |

Los modelos comparables más directos son los propios padres del merge y mammoth-1, de los que no se dispone de especificaciones detalladas en la información proporcionada. Qwen3.5-27B es el backbone original, pero es un modelo generativo, no un decision model, por lo que la comparación es solo estructural.

## Limitaciones y advertencias

- El modelo no genera texto libre: emite códigos de respuesta sobre un conjunto cerrado de opciones. No es adecuado para tareas generativas, chat abierto ni redacción.
- Riesgo de alucinación en el sentido de seleccionar una opción incorrecta con alta confianza; no hay calibración publicada ni benchmarks que cuantifiquen la fiabilidad.
- No se declaran idiomas soportados; el uso fuera del inglés no está validado aunque parte de los datos de entrenamiento sean multilingües.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas.
- Sesgos: los datos de entrenamiento incluyen listas de apellidos del censo de EE. UU., GeoNames y corpus de noticias gubernamentales, lo que puede introducir sesgos geográficos y demográficos; no se documenta ninguna evaluación de sesgo.
- Licencia MIT permite uso comercial, pero el modelo deriva de Qwen3.5-27B (Apache-2.0) y de mammoth-1 (MIT); conviene verificar el cumplimiento de las condiciones de atribución de toda la cadena de modelos padre.
- El autor declara no estar afiliado a Base Labs, Baseten, el equipo de Qwen, REAX ni a los autores de los padres; no hay soporte oficial ni garantías.
- El modelo tiene 16 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente.
- El repositorio no distribuye los datasets de entrenamiento, lo que dificulta la reproducibilidad completa.
- El pipeline declarado (text-classification) requiere un adaptador específico para el cabezal de lectura; las herramientas estándar de generación no lo usarán correctamente sin configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/john54334343/sn92-generalist-m1-core7f
- Modelo base mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Padre isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Qwen3.5-27B (backbone original): no disponible en la información proporcionada
- Paper de REAX eval-v5.1: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
