# bielquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, publicadas por el usuario `bielquants`. Se trata de un ajuste fino multi-etapa (multi-stage tune) sobre una base de la familia Qwen3 etiquetada como "27B", con unos 26.895.998.464 parámetros reales según los pesos en safetensors del modelo base. El autor lo presenta como un modelo "abliterated" o "uncensored" (eliminación de capas de rechazo), orientado tanto a razonamiento y código como a escritura creativa y roleplay.

La innovación que el autor destaca es la reducción del bloque de "thinking": la variante TURBO afirma consumir entre la mitad y una décima parte de los tokens de razonamiento respecto al Qwen 3.8 27B sin pérdida de detalle en la salida, lo que se traduce en menor latencia y menor coste por consulta en despliegues con modo de razonamiento activado. El repositorio incluye cuantizaciones "regular" y "MTP" (Multi-Token Prediction) generadas con doble imatrix (DI-MATRIX), además de variantes Neo-CODER MAX.

Es relevante ahora porque empaqueta un modelo de ~27B en formato GGUF ejecutable en hardware de consumo, con licencia Apache 2.0 y soporte declarado de tres modos de pensamiento. Conviene tratar con cautela las afirmaciones de rendimiento de la model card, ya que no van acompañadas de metodología verificable ni de resultados reproducibles por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada explícitamente en la información disponible; la nomenclatura "27B" sin sufijo MoE y el recuento de parámetros apuntan a un transformer decoder-only denso de la familia Qwen3 |
| Parámetros totales | 26.895.998.464 (~26,9 B) según los pesos en safetensors del modelo base |
| Parámetros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en variantes "regular" y "MTP"; se mencionan explícitamente 8 bits y 4 bits (incluida Q4_K_S), con doble imatrix (DI-MATRIX) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en bfloat16 con pesos safetensors |
| Modalidad declarada | image-text-to-text (según el pipeline del repositorio) |
| Tamaño del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets de ajuste declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Fecha de publicación | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. Dado el recuento de parámetros (26,9 B) y la ausencia del sufijo "A3B" que el propio autor usa para identificar variantes MoE (por ejemplo, Qwen3.6-35B-A3B), lo más probable es que se trate de un transformer denso decoder-only. El repositorio no documenta número de capas, dimensión de atención, tipo de RoPE, mecanismo de atención ni tamaño de vocabulario.

El proceso de entrenamiento se describe como un "multi-stage fine tune, multi-fine tune y multi-stage merge". El autor menciona dos técnicas propietarias: COLD FUSION (combinación de un método denominado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". Según la model card, GAIN modifica dinámicamente la configuración de entrenamiento por muestra en tiempo real durante el aprendizaje. También se declara el uso de Unsloth para el entrenamiento en hardware de consumo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación; el término "abliterated"/"heretic" sugiere más bien la eliminación o neutralización de comportamientos de rechazo. Se declara explícitamente ausencia de "benchmaxing" en el proceso.

## Capacidades

- Generación de texto general, razonamiento y resolución de problemas, con tres modos de operación diferenciados según la model card.
- Modo de pensamiento (thinking) con bloque de razonamiento explícito, reformateado y comprimido respecto al modelo de origen.
- Generación de código, reforzada por las variantes "Neo-CODER MAX" incluidas en el repositorio.
- Escritura creativa, narrativa, ficción y roleplay, con ajuste declarado para "todos los géneros".
- Tool calling / function calling: la model card remite a la pestaña "community" para lo que describe como "el mejor rendimiento de tool calling registrado". Es una afirmación del autor, no verificada de forma independiente en la información disponible.
- Entrada multimodal de imagen según el campo `pipeline_tag: image-text-to-text` del repositorio, aunque no se detalla el alcance real de esta capacidad ni si se conserva íntegra en las cuantizaciones GGUF.
- Multilingüe limitado a inglés y chino según los metadatos; no se declara soporte de castellano.
- Predicción multi-token (MTP) en las variantes GGUF etiquetadas como tales, orientada a acelerar la decodificación.

## Casos de uso

- Escritura creativa y narrativa asistida: el ajuste está orientado explícitamente a ficción y "todos los géneros", con ejemplos de generación de ganchos narrativos y diálogo en la propia model card. Adecuado para herramientas de apoyo a guionistas y novelistas que necesiten borradores extensos.
- Roleplay y agentes conversacionales de personaje: el entrenamiento "uncensored" permite mantener personajes con registros y contenidos que los modelos alineados rechazarían, útil en videojuegos narrativos y plataformas de ficción interactiva.
- Generación de código en pipelines internos: las variantes Neo-CODER MAX y el soporte declarado de tool calling permiten integrarlo en asistentes de programación o en tareas de refactorización dentro de CI/CD, sujeto a verificación previa del rendimiento real.
- Razonamiento con presupuesto de tokens ajustado: la reducción del bloque de pensamiento (entre 1/2 y 1/10) lo hace adecuado para entornos con latencia o coste por token críticos, donde un modelo de razonamiento convencional consumiría demasiados tokens.
- Despliegue local en estación de trabajo con GPU de consumo: al distribuirse en GGUF de 4 y 8 bits, permite ejecutar un modelo de ~27B en una sola GPU de gama alta sin infraestructura de servidor.
- Procesamiento de documentación técnica en inglés o chino: con contexto largo (no especificado) y capacidad de resumen, encaja en tareas de extracción y síntesis sobre corpus bilingües en, aunque la ventana real debe validarse.
- Investigación sobre ablación de alineación: el modelo es un caso de estudio útil para analizar qué comportamientos se degradan o se pierden tras aplicar técnicas de "abliteration" y ajuste sin censura.

## Benchmarks y rendimiento

La model card proporciona las siguientes cifras, todas ellas atribuidas al autor del ajuste y sin metodología pública verificable:

| Métrica | Valor declarado | Contexto declarado |
|---|---|---|
| ARC-C | 735 | Cuantización de 8 bits |
| ARC-C | 719 | Cuantización de 4 bits |
| ARC-E | 880 | Cuantización de 8 bits |

Advertencias sobre estos datos: la escala de las métricas ARC-C y ARC-E no se explica en la información disponible, y los valores publicados no coinciden con el rango habitual de estas pruebas (0-100), por lo que no es posible interpretarlos ni compararlos directamente con resultados estándar. El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en "7 benchmarks críticos", pero no se listan esos benchmarks ni sus valores. La referencia a resultados adicionales en la pestaña "community" no está incluida en la información proporcionada.

No se han publicado en la información disponible resultados verificables de MMLU, HumanEval, GSM8K ni de otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 26,9 B de parámetros, sin contar caché KV ni overhead del runtime):
  - BF16: ~54 GB.
  - Q8_0: ~28-30 GB.
  - Q6_K: ~22-23 GB.
  - Q5_K_M: ~19-20 GB.
  - Q4_K_M: ~16-17 GB.
  - Q4_K_S: ~15-16 GB.
  - Q3_K_M: ~13-14 GB.
  - Q2_K: ~10-11 GB.
- GPU recomendadas: para BF16 o Q8, una A100 80 GB, H100 80 GB o dos RTX 4090/5090 en paralelo. Para Q4_K_M o Q4_K_S, una única RTX 4090 (24 GB), RTX 5090, A6000 o L40S es suficiente.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones de 4 bits o inferiores cabe en GPUs de 16-24 GB (RTX 4080, 4090, 5090, RX 7900 XTX). En 8 bits requiere 32-48 GB, lo que excluye las GPU de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores GGUF compatibles. Las variantes MTP requieren runtimes que soporten predicción multi-token. Para despliegue en servidor con safetensors, vLLM o TGI sobre el modelo base.
- Latencia y throughput estimados: no disponibles. El autor afirma que las variantes TURBO y MTP aceleran la generación de tokens, pero no se aportan medidas de tokens por segundo, TTFT ni condiciones de prueba.
- Nota: el repositorio ocupa 389 GB, por lo que conviene descargar únicamente el archivo de cuantización necesario en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO... NEO-CODER MAX) | ~26,9 B | No disponible | Apache 2.0 | GGUF en este repositorio | Solo cifras declaradas por el autor; no verificables |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | ~26,9 B | No disponible | No disponible en la información | Safetensors | Referencia declarada por el autor para las mejoras |
| Qwen 3.8 27B | No disponible | No disponible | No disponible | No disponible | El autor afirma que este ajuste lo supera en 7 benchmarks, sin detallar |
| Qwen3.6 27B y Qwen3.5 27B | No disponible | No disponible | No disponible | No disponible | Solo se afirma que este ajuste los supera; sin datos |

No se dispone de información suficiente sobre los modelos comparados para establecer una comparación cuantitativa fiable. Las referencias a Qwen3.5, 3.6 y 3.8 provienen exclusivamente de la model card del autor.

## Limitaciones y advertencias

- Modelo "uncensored" / "abliterated": se ha eliminado o reducido deliberadamente el comportamiento de rechazo. Puede generar contenido ofensivo, violento, sexual o legalmente problemático sin filtros. No es apto para aplicaciones orientadas al público general o menores sin una capa de moderación externa.
- Ausencia de verificación independiente: los benchmarks declarados (ARC-C 735, ARC-E 880) no van acompañados de metodología, definición de la escala ni scripts de reproducción. Los valores no son comparables con resultados ARC estándar.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni tasas de alucinación. Un ajuste orientado a la generación creativa tiende a priorizar la fluidez sobre la exactitud factual.
- Cobertura idiomática limitada: solo se declaran inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, por lo que el rendimiento en español es indeterminado.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, dato crítico para planificar despliegues con documentos largos o conversaciones multi-turno extensas.
- Procedencia y trazabilidad: el repositorio no tiene descargas ni valoraciones en el momento de la consulta, y el modelo base procede de un ajuste comunitario no oficial de Qwen. La cadena de procedencia incluye múltiples etapas de merge y ajuste difícilmente auditables.
- Licencia: se declara Apache 2.0 en los metadatos, lo que en principio permite uso comercial, pero conviene verificar que la licencia del modelo base y de los datasets empleados sea compatible, ya que la información disponible no lo detalla.
- Degradación por cuantización: el autor afirma mantener 719 puntos de ARC-C en 4 bits, pero no se aportan curvas de degradación por nivel de cuantización. Las cuantizaciones de 2 y 3 bits probablemente afecten de forma notable a tareas de razonamiento y código.
- Capacidad multimodal incierta: aunque el repositorio declara el pipeline image-text-to-text, no se documenta si la entrada de imagen sigue operativa en los GGUF publicados ni con qué resolución o formato.
- Coste de almacenamiento: 389 GB de repositorio, con descarga selectiva obligatoria en la práctica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bielquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia de la técnica Fable Fusion 711 citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets declarados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a un blog de temática geopolítica sin relación con el contenido de esta ficha. No se dispone de paper, blog técnico ni demo oficial asociados.
