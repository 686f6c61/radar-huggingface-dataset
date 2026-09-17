# DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

Este repositorio contiene una familia de cuantizaciones GGUF del modelo DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking, un derivado de Qwen3.6 27B desarrollado por DavidAU. El proceso pasa por tres etapas: primero se aplica una "abliteración" (técnica heretic) para eliminar los mecanismos de rechazo del modelo original, después Unsloth realiza un finetune de bajo nivel para recuperar y superar ligeramente el rendimiento del modelo raíz, y finalmente se generan los cuantos GGUF con la metodología NEO-CODE-Di-IMatrix-MAX del propio autor.

El resultado es un modelo de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors) con una ventana de contexto declarada de 256.000 tokens, orientado a escritura creativa, ficción y roleplaying sin restricciones de contenido, además de usos generales de conversación, código y matemáticas. La model card afirma que su rendimiento se sitúa en la "zona" de modelos propietarios como OpenAI, Claude y Gemini, aunque no se aportan comparativas independientes que respalden esa afirmación.

Su relevancia actual radica en dos factores: la popularidad del repositorio (387.433 descargas y 431 likes en el momento de la consulta) y el interés de la comunidad por modelos "uncensored" para escritura creativa sin filtros, junto con cuantizaciones que conservan un porcentaje muy alto de la precisión del modelo en bfloat16 (94 % en Q4_K_S, según el autor). El repositorio completo ocupa 182,2 GB porque agrupa múltiples niveles de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.6 27B; pipeline declarado como image-text-to-text (no se detallan variantes ni configuración interna en la información disponible) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 256.000 tokens (según la model card) |
| Tipos de cuantizacion | GGUF con esquema NEO-CODE-Di-IMatrix-MAX: IQ2_M, Q4_K_S (Q4ks), Q6 y otros niveles intermedios; el autor cita además resultados internos en mxfp8 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base están en bfloat16/safetensors) |
| Modelo base | DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking |
| Autor | DavidAU |
| Modo de razonamiento | Modelo "thinking" (hereda el modo del base) |
| Descargas / likes | 387.433 / 431 (en la fecha de consulta) |
| Fecha de creación / actualización | 2026-04-29 / 2026-09-16 |
| Tamaño del repositorio | 182,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, cabezas de atención, tipo de atención ni si emplea atención lineal o híbrida). Se sabe que parte de Qwen3.6 27B, un transformer con capacidades de razonamiento ("thinking") y con pipeline declarado image-text-to-text, lo que implica soporte multimodal de entrada de imagen y texto. El modelo base intermedio, DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking, se generó en dos fases: una des-censura mediante la técnica heretic (abliteración) y un finetune posterior con Unsloth sobre un dataset personalizado, descrito por el autor como "low level fine tune" para no alterar el comportamiento base del modelo Qwen.

Los datos de entrenamiento no se especifican: no se indica el número de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación posteriores (más allá del propio finetune con Unsloth). Las innovaciones declaradas se centran en la cuantización, no en la arquitectura: la metodología NEO-CODE-Di-IMatrix-MAX combina dos datasets de imatrix (NEO y NEO-CODE) en una única matriz dual, con ajustes adicionales de tensores medidos mediante benchmarks. El autor reporta que IQ2_M conserva el 83 % de la precisión del modelo en bfloat16 ocupando un 20 % del tamaño original, y que Q4_K_S alcanza el 94 % de precisión con un 25 % del tamaño. En cuanto a la des-censura, la model card declara una divergencia KL de 0,0469 respecto al modelo original y una tasa de rechazos de 4/100 frente a 99/100 del modelo Qwen sin modificar.

## Capacidades

- Generación de texto conversacional en inglés y chino, con modo de razonamiento heredado del modelo base "thinking".
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas y narración en todos los géneros (ciencia ficción, romance, etc.), según los tags del repositorio.
- Roleplaying y diálogo multi-turno, con estilos de escritura descriptivos ("vivid prosing").
- Generación de código: el nombre del esquema de cuantización incluye "NEO-CODE" y el autor menciona explícitamente código y matemáticas entre los objetivos de su ajuste de cuantización.
- Razonamiento matemático y resolución de problemas en un solo paso y en modo estándar, según las afirmaciones del autor sobre la estabilidad de los cuantos.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), es decir, puede procesar imágenes junto con instrucciones textuales.
- Contexto largo: 256.000 tokens declarados, útil para documentos extensos y conversaciones largas.
- Capacidad de operar sin mecanismos de rechazo en la mayoría de peticiones (4 rechazos de cada 100 en la evaluación declarada por el autor).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Escritura de ficción larga: el modelo puede mantener coherencia narrativa a lo largo de novelas o relatos extensos gracias a la ventana de 256.000 tokens, que permite incluir capítulos anteriores completos como contexto sin truncar.
- Continuación de escenas y generación de tramas: útil para talleres de escritura y herramientas de asistencia creativa donde se necesita expandir un fragmento con un estilo concreto y sin bloqueos por contenido sensible.
- Roleplaying y personajes persistentes: el contexto largo permite mantener fichas de personaje, historial de conversación y reglas del mundo sin perder información entre turnos.
- Generación de guiones y material para videojuegos narrativos: producción de diálogos ramificados, descripciones de escenas y textos de ambientación en volumen, con la ventaja de que el modelo no rechaza temáticas adultas o violentas frecuentes en estos géneros.
- Procesamiento de documentos extensos con componente visual: al aceptar entrada de imagen y texto, puede analizar capturas, ilustraciones o páginas escaneadas junto con instrucciones textuales largas.
- Asistente local de escritura y edición: desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, permite trabajar con material confidencial sin enviarlo a servicios en la nube.
- Generación de código asistida en local: con las cuantizaciones Q4_K_S o superiores (94-98 % de la precisión de bfloat16 según el autor) puede emplearse en edición de código y explicación de fragmentos, siempre que se valide la salida.
- Investigación sobre alineación y seguridad: la combinación de abliteración más finetune, con métricas declaradas de divergencia KL y tasa de rechazos, lo convierte en un objeto de estudio para analizar cómo la des-censura afecta al comportamiento del modelo.
- Prototipado de chatbots sin filtros temáticos: para dominios donde los filtros estándar resultan demasiado restrictivos (ficción oscura, simulación de personajes históricos, etc.), siempre con revisión humana posterior.

## Benchmarks y rendimiento

La información proporcionada incluye únicamente benchmarks internos ("in house", atribuidos a Nightmedia) sobre siete métricas de conocimiento y razonamiento, medidos en modo instruct y en precisión mxfp8. Los datos del modelo ajustado están incompletos en la model card.

| Metrica | Qwen3.6-27B (base sin ajustar, mxfp8) | Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking (mxfp8) |
|---|---|---|
| arc-c | 0,647 | 0,673 |
| arc/e | 0,803 | 0,846 |
| boolq | 0,910 | 0,905 |
| hswag | 0,773 | no disponible |
| obkqa | 0,450 | no disponible |
| piqa | 0,806 | no disponible |
| wino | 0,742 | no disponible |

Datos de retención de precisión por cuantización declarados por el autor (no verificados de forma independiente):

| Cuantizacion | Precision relativa frente a bfloat16 | Tamano relativo frente al modelo original |
|---|---|---|
| IQ2_M | 83 % | 20 % |
| Q4_K_S | 94 % | 25 % |
| Q6 | Justo por debajo del 98 % | no disponible |

Métricas de des-censura declaradas:

| Metrica | Este modelo | Qwen/Qwen3.6-27B original |
|---|---|---|
| Divergencia KL | 0,0469 | 0 (por definición) |
| Rechazos | 4/100 | 99/100 |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: partiendo de un modelo bfloat16 de aproximadamente 54 GB (26,9 B de parámetros a 2 bytes), las cuantizaciones declaradas ocuparían alrededor de 11 GB en IQ2_M (20 % del tamaño original) y unos 13-14 GB en Q4_K_S (25 %). Son estimaciones derivadas de los porcentajes indicados por el autor, no medidas exactas publicadas.
- Contexto: la ventana de 256.000 tokens exige una caché KV muy grande, que puede superar con creces el tamaño de los pesos en cuantizaciones bajas. Para uso con contexto completo se necesita VRAM adicional considerable o configuraciones con offload a RAM.
- GPU de consumo: IQ2_M y Q4_K_S caben en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090) con contexto moderado; con contexto largo o cuantizaciones superiores (Q6, Q8) hará falta offload parcial a memoria del sistema.
- GPU profesionales: bfloat16 completo requiere del orden de 54 GB, lo que implica una H100 de 80 GB, una A100 de 80 GB o dos A100 de 40 GB. Para Q6 y Q8 el rango razonable son GPUs de 48-80 GB.
- Opciones de despliegue: al tratarse de GGUF, es compatible con llama.cpp / llama-server, Ollama, LM Studio, koboldcpp y otras herramientas del ecosistema GGUF. El despliegue con servidores orientados a safetensors (vLLM, TGI) requeriría convertir los pesos al formato original, no incluido en este repositorio salvo referencia al modelo base.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF) | 26,9 B | 256k | GGUF cuantizado de un derivado heretic + finetune | Apache 2.0 | 387.433 descargas, 431 likes |
| DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking | No disponible (mismo orden, ~27 B) | No disponible | Pesos bfloat16 del modelo fuente | No disponible en la información | Origen de las cuantizaciones de esta ficha |
| Qwen/Qwen3.6-27B (base sin ajustar) | No disponible | 256k según la model card | Modelo alineado con filtros de seguridad | No disponible en la información | 99/100 rechazos; sirve de referencia en los benchmarks in house |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | No disponible | No disponible | Sucesor declarado con soporte MTP | No disponible en la información | El propio autor lo sitúa por encima de este modelo |
| DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF | 40 B (según el nombre) | No disponible | Enfoque creativo e investigación | No disponible en la información | Más de 730 likes y 2 millones de descargas según el autor |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | 9 B | No disponible | Alternativa ligera | No disponible en la información | El autor afirma que supera a varios modelos de 27 B sin ajustar, con 640 en ARC-C |

No se dispone de comparativas verificadas de rendimiento con modelos de otros desarrolladores (Llama, Mistral, DeepSeek, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo ha sido abliterado deliberadamente y responde a peticiones que el modelo original rechazaría (4 rechazos de cada 100 frente a 99 de cada 100). Esto implica riesgo real de generar contenido dañino, ilegal o desinformación si no se aplica moderación externa.
- Alucinación: no se publican evaluaciones de fidelidad factual ni de tasa de alucinación. La des-censura y el finetune pueden degradar la calibración de la confianza, por lo que las afirmaciones factuales deben verificarse.
- Idiomas: solo inglés y chino están declarados. El rendimiento en castellano no está documentado y probablemente sea inferior al de estos dos idiomas.
- Sesgos: no se documenta ningún análisis de sesgos ni de evaluación de equidad. Los datasets de entrenamiento y de imatrix no se describen.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un derivado de Qwen3.6 27B cuyos términos no se detallan en la información disponible; conviene verificar las condiciones del modelo raíz antes de un despliegue comercial.
- Cuantizaciones de baja precisión: IQ2_M conserva según el autor el 83 % de la precisión en bfloat16, una pérdida que puede ser significativa en tareas de razonamiento complejo, matemáticas o código.
- Datos de rendimiento no verificados: todas las cifras (benchmarks in house, retención por cuantización, comparaciones con modelos propietarios) provienen del autor y no cuentan con validación independiente. La comparación con "la zona de OpenAI, Claude y Gemini" no está respaldada por ninguna medición en la información disponible.
- Obsolescencia declarada: la propia model card indica que este modelo ha sido superado por el modelo "711" del mismo autor, lo que sugiere usar el sucesor para nuevos proyectos.
- Benchmarks incompletos: la tabla in house del modelo ajustado solo aporta tres de las siete métricas, por lo que no puede evaluarse el rendimiento global frente al modelo base.
- Formatos: al estar solo en GGUF, no es directamente desplegable en infraestructuras basadas en safetensors sin conversión previa.
- Rendimiento en contexto largo: aunque se declaran 256k tokens, no se aportan mediciones de degradación con contextos largos ni de rendimiento efectivo más allá de la ventana de entrenamiento.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base (finetune en bfloat16): https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking
- Sucesor declarado por el autor (Fable-Fusion-711, con MTP): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo creativo de 40 B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo ligero de 9 B del mismo autor: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelos Qwen3.8 27B del mismo autor:
  - https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
  - https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
  - https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas de cuestionarios diarios de Bing sin relación con el contenido. No se han localizado papers, blogs técnicos ni demos independientes en la información disponible.
