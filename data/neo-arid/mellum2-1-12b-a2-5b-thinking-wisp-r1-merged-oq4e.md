# Neo-Arid/Mellum2.1-12B-A2.5B-Thinking-Wisp-R1-merged-oQ4e

## Resumen

Mellum2.1-12B-A2.5B-Thinking-Wisp-R1-merged-oQ4e es un checkpoint publicado por el usuario Neo-Arid en HuggingFace. Se distribuye como un modelo ya fusionado ("merged") y cuantizado a 4 bits ("oQ4e"), con pesos en safetensors y un tamaño de repositorio de 7,1 GB. El recuento real de parámetros declarado en los safetensors es de 12.149.923.072 (unos 12,15 mil millones), lo que concuerda con el sufijo "12B" del nombre.

La nomenclatura del identificador sugiere una arquitectura de mezcla de expertos con aproximadamente 2,5 mil millones de parámetros activos (sufijo "A2.5B"), una variante orientada a razonamiento ("Thinking") y una base de la familia Mellum (presente también como tag). Ninguno de estos extremos está confirmado en la model card, que se limita a declarar la licencia Apache 2.0 y no incluye descripción, datos de entrenamiento ni resultados de evaluación. Cualquier afirmación sobre contexto, idiomas o rendimiento debe tratarse como no verificada.

Su relevancia práctica es limitada pero concreta: es un artefacto listo para inferencia en 4 bits que cabe en GPUs de consumo de 8-12 GB, lo que permite experimentar con un modelo de ~12 B sin infraestructura dedicada. Al carecer de documentación y de benchmarks publicados, no es adecuado como base para decisiones de producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A2.5B" sugiere mezcla de expertos; no confirmado en la model card) |
| Parámetros totales | 12.149.923.072 (~12,15 B, según safetensors) |
| Parámetros activos | ~2,5 B según el sufijo "A2.5B" del nombre; no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (checkpoint "oQ4e"); esquema exacto no especificado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 bits) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura en la model card: no se especifica si se trata de un transformer denso, de una mezcla de expertos, de un híbrido con atención lineal ni de un modelo con módulo de razonamiento explícito. El identificador aporta pistas no verificadas: "12B-A2.5B" es la convención habitual para denotar parámetros totales y activos en arquitecturas MoE, y "Thinking" suele emplearse para variantes con modo de razonamiento extendido o cadenas de pensamiento. El tag "mellum" apunta a un linaje relacionado con la familia de modelos Mellum, pero no se confirma en la documentación.

Tampoco se detallan los datos de entrenamiento: se desconoce el volumen de tokens, la composición del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si el proceso de fusión ("merged") combina pesos de varios checkpoints o integra adaptadores. El sufijo "R1" podría indicar ascendencia de un modelo de razonamiento, extremo igualmente sin confirmar. No se han publicado innovaciones técnicas, informes de entrenamiento ni notas de versión.

## Capacidades

- Generación de texto: capacidad esperable en cualquier modelo de esta familia, pero sin confirmación documental ni ejemplos en la model card.
- Razonamiento: el sufijo "Thinking" sugiere un modo de razonamiento con cadenas de pensamiento; no verificado.
- Código: el tag "mellum" apunta a un posible origen en modelos orientados a programación; no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

Los siguientes escenarios son plausibles por el tamaño y el formato del checkpoint, pero requieren validación empírica antes de cualquier uso real, dado que no hay benchmarks ni documentación de capacidades.

- Prototipado local en GPU de consumo: al ocupar 7,1 GB en 4 bits, permite probar un modelo de ~12 B en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB sin recurrir a servidores; útil para experimentar con prompting y evaluar cualitativamente antes de invertir en infraestructura.
- Asistencia de código en editor: si se confirma el linaje Mellum, podría emplearse para autocompletado y explicación de fragmentos dentro de un IDE, con un servidor local y latencia de un solo dígito por token en GPUs consumer.
- Experimentación con razonamiento: si el modo "Thinking" está operativo, serviría para comparar cadenas de pensamiento largas frente a respuestas directas en tareas de matemáticas o lógica, midiendo coste en tokens frente a precisión.
- Evaluación de técnicas de cuantización: el checkpoint es un caso práctico para medir la degradación de un modelo de ~12 B al pasar a 4 bits frente a su versión original, si esta estuviera disponible.
- Generación de documentación técnica y resúmenes: tareas de transformación de texto de longitud media que no exigen contexto muy largo ni multilingüismo estricto, ejecutables en local con datos que no deben salir de la organización.
- Base para ajuste fino ligero: al estar bajo Apache 2.0 y en un tamaño manejable, puede servir como punto de partida para LoRA o QLoRA en dominios verticales, siempre que se valide primero su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web obtenidos no guardan relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7 GB solo para pesos (repositorio de 7,1 GB) más el coste de la caché KV, que depende de la longitud de contexto y del número de expertos activos; estimación práctica de 8-10 GB para secuencias cortas y de 12 GB o más para contextos largos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB para uso local; A100 40 GB, H100 o L40S para servicio concurrente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 12 GB o más, dado el tamaño del checkpoint; en tarjetas de 8 GB requeriría contexto muy reducido u offload a CPU.
- Opciones de despliegue: vLLM o TGI si el esquema de cuantización de 4 bits resulta compatible (los formatos empaquetados propietarios a menudo no lo son); llama.cpp u Ollama solo si se publica una versión GGUF, que no consta en el repositorio. transformers con bitsandbytes es la vía más segura si los pesos se cargan en un formato estándar.
- Latencia y throughput: no disponibles. Al no haber datos de arquitectura ni de número de expertos activos, no es posible estimar tokens por segundo con rigor.

## Comparativa con modelos similares

No se dispone de datos verificables para establecer una comparativa. La información proporcionada no incluye benchmarks del modelo ni especificaciones de alternativas comparables, y los resultados de búsqueda web no contienen referencias al modelo ni a modelos de su categoría. Los campos que seguirían aparecen como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Neo-Arid/Mellum2.1-12B-A2.5B-Thinking-Wisp-R1-merged-oQ4e | 12,15 B totales (~2,5 B activos según nombre) | no disponible | Apache 2.0 | no disponible |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo declara la licencia, sin descripción, datos de entrenamiento ni evaluación. No hay base para afirmar qué sabe hacer el modelo.
- Riesgo elevado de alucinación no cuantificado: sin benchmarks ni pruebas de fidelidad, no puede estimarse la fiabilidad factual en producción.
- Linaje incierto: el identificador mezcla referencias a Mellum, a "Thinking" y a "R1" sin que el autor las explique; no debe asumirse ninguna capacidad a partir del nombre.
- Contexto e idiomas desconocidos: no se puede planificar un caso de uso que dependa de ventanas largas o de cobertura multilingüe.
- Cuantización opaca: el esquema "oQ4e" no está descrito; podría implicar pérdida de calidad respecto al modelo original y limitar la compatibilidad con motores de inferencia estándar.
- Estado del repositorio: cero descargas y cero valoraciones en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución y aviso de cambios, pero el autor no ofrece garantías ni asume responsabilidad; conviene conservar el fichero de licencia y verificar que los pesos subyacentes no arrastren restricciones adicionales de sus modelos de origen.
- Fecha de creación declarada en 2026, coherente con un artefacto reciente y, por tanto, sin historial de uso.

## Enlaces

- HuggingFace: https://huggingface.co/Neo-Arid/Mellum2.1-12B-A2.5B-Thinking-Wisp-R1-merged-oQ4e
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web. Los resultados obtenidos corresponden a plataformas educativas francesas (ENT NEO de Édifice) y no guardan relación con el modelo.
