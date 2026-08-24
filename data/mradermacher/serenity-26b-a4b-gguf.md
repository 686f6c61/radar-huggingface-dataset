# mradermacher/Serenity-26B-A4B-GGUF

## Resumen

Serenity-26B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos, desarrollado por ReadyArt y cuantizado a formato GGUF por mradermacher. Está basado en la arquitectura Gemma-4 y está diseñado específicamente para tareas de roleplay, conversación y generación de texto instructivo, con un enfoque en contenido no alineado (sin restricciones de seguridad) y soporte para contenido adulto explícito. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para desarrolladores que buscan un modelo flexible y desplegable localmente.

La relevancia de este modelo radica en su combinación de eficiencia (solo 4B activos) y capacidad de generación creativa, junto con la disponibilidad de múltiples cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. Además, incluye archivos multimodales (mmproj) que sugieren capacidades de visión, aunque no se detallan en la documentación. Es una opción popular para aplicaciones de roleplay y generación de narrativa sin censura, aunque su naturaleza no alineada implica riesgos de contenido inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma-4 |
| Parametros totales | 25 233 142 046 (25,2B) |
| Parametros activos | 4 000 millones (4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base, ReadyArt/Serenity-26B-A4B, emplea una arquitectura de mezcla de expertos (MoE) con 26 000 millones de parámetros totales, de los cuales solo 4 000 millones se activan por token, lo que reduce significativamente el coste computacional en inferencia. Está construido sobre la familia Gemma-4 de Google, que utiliza un transformer estándar con atención de múltiples cabezas y capas de normalización. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado que el modelo se describe como "unaligned" (no alineado), es probable que no haya pasado por procesos de refuerzo con preferencias humanas, lo que explica su capacidad para generar contenido sin restricciones.

La cuantización GGUF realizada por mradermacher incluye versiones estáticas (sin imatrix) y una variante con imatrix en un repositorio separado. Los archivos mmproj sugieren que el modelo puede procesar entradas multimodales (imagen y texto), aunque no se especifica el tipo de vision encoder utilizado. La ausencia de datos sobre el contexto máximo y el entrenamiento limita la evaluación técnica, pero la arquitectura MoE es adecuada para despliegues eficientes en hardware con VRAM limitada.

## Capacidades

- Generacion de texto creativo y narrativo, especialmente optimizado para roleplay y conversacion.
- Soporte de instrucciones (instruct) para tareas de seguimiento de comandos.
- Capacidad multimodal (vision) gracias a los archivos mmproj, aunque no se detalla su alcance.
- Generacion de contenido adulto y explicito sin restricciones de seguridad (modelo no alineado).
- Conversacion multi-turno con contexto largo (longitud no especificada).
- No se menciona soporte explicito para tool calling o function calling.
- No se mencionan capacidades de razonamiento avanzado o agentes.

## Casos de uso

- Roleplay y juegos de rol interactivos: el modelo puede mantener personajes coherentes y dialogos fluidos en escenarios de fantasia o ciencia ficcion, gracias a su entrenamiento especifico para este tipo de tareas.
- Generacion de narrativa erotica o adulta: su naturaleza no alineada permite crear contenido explicito sin filtros, util para escritores o plataformas de ficcion para adultos.
- Asistente conversacional personalizado: puede integrarse en chatbots locales para conversaciones informales o de soporte, aprovechando su capacidad de generar respuestas naturales y variadas.
- Creacion de contenido creativo (cuentos, poemas, guiones): su habilidad para seguir instrucciones y generar texto coherente lo hace adecuado para herramientas de escritura asistida.
- Prototipado de aplicaciones de IA generativa: al ser ligero (4B activos) y con licencia Apache 2.0, es ideal para pruebas de concepto en entornos de desarrollo sin coste de licencia.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs de consumo (8-12 GB VRAM), habilitando aplicaciones offline de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, desde 10,7 GB (Q2_K) hasta 27 GB (Q8_0). Para uso practico, se recomienda al menos 12 GB de VRAM con Q4_K_M (16,9 GB) o Q5_K_M (19,2 GB).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5, o A100/H100 (40-80 GB) para Q8_0 o despliegues de alta concurrencia.
- En consumer GPU: si, con cuantizaciones Q4_K_S o Q4_K_M en GPUs de 16-24 GB (por ejemplo, RTX 4080, RTX 4090). Para GPUs de 8 GB, solo Q2_K o Q3_K_S con calidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia como vLLM (si se convierte a formato compatible). Los archivos GGUF son directamente utilizables con llama.cpp y sus derivados.
- Latencia y throughput: no disponible, pero al ser un modelo MoE con solo 4B activos, la velocidad de generacion es significativamente mayor que un modelo denso de 26B, estimandose entre 20-40 tokens/segundo en una RTX 4090 con Q4_K_M (dependiendo de la implementacion).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Serenity-26B-A4B (este) | 25,2B | 4B | no disponible | Apache 2.0 | GGUF |
| Gemma-4-26B-A4B-it (base) | 25,2B | 4B | no disponible | Apache 2.0 | safetensors |
| Mixtral-8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | safetensors/GGUF |
| Qwen2.5-14B | 14,8B | 14,8B | 32k | Apache 2.0 | safetensors/GGUF |

La comparativa se basa en modelos MoE o densos de tamano similar. Serenity-26B-A4B se distingue por su enfoque en roleplay y contenido no alineado, mientras que Mixtral y Qwen ofrecen mejor documentacion y soporte de herramientas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo no alineado: puede generar contenido ofensivo, violento, sexualmente explicito o perjudicial sin filtros. No es adecuado para aplicaciones publicas sin moderacion.
- Sesgos desconocidos: al no tener informacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos o informacion falsa, especialmente en contextos largos.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en entornos multilingues.
- Longitud de contexto no documentada: se desconoce el maximo de tokens que puede procesar, lo que puede causar fallos en conversaciones muy largas.
- Restricciones de licencia: aunque Apache 2.0 permite uso comercial, el contenido generado puede violar politicas de plataformas o leyes locales si se distribuye.
- Calidad de cuantizacion: las versiones Q2_K y Q3_K pueden degradar significativamente la coherencia y el rendimiento; se recomienda Q4_K_M o superior para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Serenity-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Repositorio con imatrix: https://huggingface.co/mradermacher/Serenity-26B-A4B-i1-GGUF
- Guia de cuantizacion (referencia): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
