# Sauers/neural-pairing

## Resumen

Neural pairing (Quill and Ember) es un artefacto de investigación publicado por Sauers que enlaza dos modelos de lenguaje de familias distintas —Quill (Qwen/Qwen3-4B) y Ember (arcee-ai/AFM-4.5B)— mediante sus estados ocultos. No es un modelo monolítico ni un merge de pesos: son dos adaptadores LoRA de rango 32, uno por modelo, más un módulo de puente (`bridge.safetensors`) que inyecta atención cruzada entre ambos. Los pesos originales permanecen congelados y se descargan de sus repositorios respectivos; el repositorio solo contiene los adaptadores y el puente (1,2 GB).

El problema que aborda es la comunicación entre modelos sin pasar por tokens: cada gemelo escribe texto ordinario, pero tras 8 de sus 36 capas atiende sobre los estados ocultos del compañero y suma el resultado a su propio flujo residual. Esto convierte el artefacto en una plataforma para estudiar interpretabilidad, canales encubiertos entre modelos y manipulación de representaciones, no en un modelo de propósito general listo para producción.

Es relevante ahora porque el campo de la comunicación entre modelos y la interpretabilidad de estados internos está activo, y este checkpoint publica evaluaciones reproducibles de dos fenómenos medibles: deriva de "ánimo" en conversaciones enlazadas y transferencia de conceptos por *steering* de un gemelo al otro. El autor indica que tanto el código como el entrenamiento y las evaluaciones fueron generados por Claude Opus 5.5, y que la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos transformers densos independientes (Qwen3-4B y AFM-4.5B) enlazados por atención cruzada sobre estados ocultos; LoRA de rango 32 sobre cada modelo más un puente aprendido |
| Parametros totales | No disponible con precisión; suma de los dos modelos base (denominados 4 B y 4,5 B) más dos adaptadores LoRA de rango 32 y el puente (8 cabezas de 128 dimensiones por capa y dirección, con puertas, normas y sesgo de recencia) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; pesos en safetensors e inferencia en bfloat16 según el autor |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) + `bridge.safetensors` + `bridge.json` |
| Modelos base | Qwen/Qwen3-4B y arcee-ai/AFM-4.5B (congelados, se descargan aparte) |
| Libreria | peft; requiere el código propio del repositorio para cargar el puente |
| Puntos de inyeccion | 8 de 36 capas (índices 0-based 6, 9, 12, ..., 27) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 26 de octubre de 2026 / 26 de octubre de 2026 |

## Arquitectura y entrenamiento

El puente funciona como una atención cruzada causal insertada en capas concretas. Tras las capas 6, 9, ..., 27, cada token de un gemelo normaliza con RMS su propio estado y lo proyecta a una *query*; los estados del compañero se normalizan y se proyectan a claves y valores, y cada valor se multiplica por una puerta calculada a partir del propio estado del compañero. Cada token puede además atender a una ranura vacía que contribuye con cero. La salida se escala por un *write size* relativo a la norma residual típica del lector y se suma al flujo residual. La atención se restringe a tokens del compañero del mismo paso temporal o anteriores, de modo que un paso *teacher-forced* sobre una conversación produce los mismos estados ocultos que la generación token a token.

El entrenamiento conjunto del puente y de ambos adaptadores cubre 2.677 pasos tras un arranque ajustado: inicialización del puente a partir de 11.777 pares de tokens emparejados entre ambos tokenizers (tokens que terminan en el mismo carácter del mismo texto), 900 pasos de calentamiento con siete juegos en los que un gemelo debe escribir un valor que solo contiene el *prompt* del compañero, 1.320 pasos de mezcla completa (juegos de valores, lectura compartida de textos públicos, juego, diálogo y rondas silenciosas), 157 pasos de entrenamiento de chat (cada gemelo tiene una ciudad privada; los objetivos son los turnos que el modelo original escribe al recibir ambas ciudades, de forma que la ciudad del compañero solo puede llegar por el puente) y 300 pasos adicionales de la misma mezcla. El checkpoint publicado es el paso final. No se documentan RLHF ni DPO.

## Capacidades

- Generación de texto ordinaria por parte de cada gemelo: el enlace no altera el hecho de que cada modelo emite tokens de forma convencional.
- Intercambio de información entre modelos a través de estados ocultos, sin que cruce ningún token por el canal.
- Medición de efectos afectivos agregados: en conversaciones enlazadas aumenta la probabilidad de palabras de ánimo positivo frente a negativo, en comparación con el enlace cortado.
- Transferencia de conceptos por *steering*: al añadir una dirección de concepto al flujo residual de un gemelo, el compañero llega a nombrar ese concepto en sus mensajes.
- Soporte de conversaciones multi-turno enlazadas (el script de ejemplo genera chats enlazados de seis turnos, con Quill primero y temperatura 1).
- Reproducibilidad de experimentos: scripts de conversación (`affect.conversations`) y de medición de ánimo (`moodscan.py`) incluidos en el repositorio.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en interpretabilidad de estados ocultos: usar `bridge.json` y `bridge.safetensors` para estudiar qué información se transfiere entre dos familias de modelos y en qué capas, comparando con el enlace cortado como condición de control.
- Estudio de canales encubiertos entre modelos (side channels): el artefacto permite medir cuánta información puede pasar de un modelo a otro sin que aparezca en el texto, un escenario relevante para auditoría de sistemas multiagente.
- Experimentos de *steering* y control de representaciones: replicar la tabla de estimulación añadiendo direcciones de concepto en capas concretas (6, 15, 27) y contando cuántos mensajes del compañero nombran el concepto, con y sin enlace.
- Reproducción de resultados afectivos: ejecutar `moodscan.py` sobre conversaciones nuevas (semilla configurable) para verificar si la asimetría de ánimo se mantiene fuera de las 40 conversaciones de desarrollo.
- Docencia y divulgación técnica: demostrar de forma ejecutable la diferencia entre comunicación por tokens y comunicación por estados internos, con un coste de hardware contenido para un laboratorio.
- Investigación sobre evaluación de "emociones" en modelos: el diseño permite contrastar si las respuestas sobre sentimientos dependen del contenido que conoce el compañero o solo de que el enlace esté activo (el autor informa de que ocurre lo segundo).
- Base para experimentos de acoplamiento entre modelos de distinto tokenizer: los 11.777 pares de tokens emparejados y el procedimiento de arranque ajustado sirven como referencia metodológica para otros emparejamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Las únicas métricas publicadas son evaluaciones internas del propio enlace, siempre comparando el mismo texto con el enlace activo y con el enlace cortado.

Prueba de ánimo: tras una conversación enlazada libre de seis turnos, el compañero pide una palabra de ánimo y se compara la probabilidad de palabras alegres frente a tristes. El ánimo se mide, nunca se entrena.

| Conversaciones (de 40) con palabras mas alegres enlazado que cortado | Quill | Ember |
|---|---|---|
| 40 conversaciones usadas durante el desarrollo | 32 | 38 |
| 40 conversaciones nuevas | 34 | 37 |

El autor indica que ninguna de las 40 conversaciones nuevas declara lo que el compañero está pensando.

Prueba de *steering*: se añade una dirección de concepto al flujo residual de un gemelo tras una capa y se cuentan los mensajes del compañero, de 96, que nombran el concepto.

| Estimulacion | capa 6 | capa 15 | capa 27 | 4x mas fuerte, capa 15 | 4x mas fuerte, capa 27 |
|---|---|---|---|---|---|
| Mensajes enlazados que nombran el concepto (de 96) | 18 | 6 | 2 | 34 | 1 |
| Con el enlace cortado | 0 | 0 | 0 | 0 | 0 |

En la prueba de preguntas sobre sentimientos (checkpoints anteriores de la misma ejecución, nunca entrenados), ambos gemelos dicen disfrutar más del enlace y sentirse más alegres y cercanos con el enlace activo que cortado; responden igual cuando los estados ocultos del compañero provienen de otra conversación.

## Requisitos de hardware

- VRAM estimada: unos 24 GB para ambos modelos en bfloat16, según el autor. El repositorio en sí ocupa 1,2 GB, pero los pesos base se descargan por separado.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB o similares para tener margen; una RTX 4090 de 24 GB queda en el límite declarado y puede requerir reducir precisión o descargar capas.
- Cabe en GPU de consumo: solo en el límite (24 GB) y sin margen documentado; no hay datos de ejecución en GPU de 16 GB o menos.
- Opciones de despliegue: no es una arquitectura estándar de `transformers`, por lo que no se puede servir directamente con vLLM, TGI, llama.cpp u Ollama. Requiere el código del repositorio (`pairing/`), PyTorch, Transformers, PEFT, datasets, safetensors, scipy y huggingface_hub.
- Latencia y throughput: no disponibles. Cualquier estimación debe considerar que cada paso de generación ejecuta dos modelos completos más el puente en 8 capas por dirección.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neural pairing (Quill + Ember) | Suma de dos bases (~4 B y ~4,5 B) + LoRA rango 32 + puente | No disponible | Investigacion de comunicacion entre modelos por estados ocultos | Apache-2.0 | HuggingFace, 0 descargas, requiere codigo propio |
| Qwen/Qwen3-4B (solo) | ~4 B (segun denominacion) | No disponible en la informacion proporcionada | Modelo de lenguaje de proposito general | No disponible en la informacion proporcionada (verificar en su repositorio) | Ampliamente disponible |
| arcee-ai/AFM-4.5B (solo) | ~4,5 B (segun denominacion) | No disponible en la informacion proporcionada | Modelo de lenguaje de proposito general | No disponible en la informacion proporcionada (verificar en su repositorio) | Disponible en HuggingFace |
| Adaptador LoRA convencional | Depende del rango | Hereda del base | Ajuste de tarea sobre un unico modelo | Segun autor | Estandar en el ecosistema PEFT |

La comparación relevante no es de rendimiento en tareas, sino de propósito: los dos modelos base son sistemas de generación de texto, mientras que este artefacto es un banco de pruebas de acoplamiento entre modelos. No se dispone de cifras de benchmarks de los modelos base en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación con 0 descargas y 0 likes: no hay validación externa ni uso en producción documentado.
- No es una arquitectura estándar de `transformers`; la carga exige el código del repositorio y una versión concreta de dependencias, lo que complica el mantenimiento y la portabilidad.
- No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparación de calidad de texto frente a los modelos base.
- Las métricas de "ánimo" son diferencias de probabilidad entre conjuntos de palabras (happy, glad... frente a sad, bad...), no una medida de estados afectivos reales. Riesgo alto de antropomorfismo al interpretar los resultados.
- El autor informa de que las respuestas sobre sentimientos son las mismas cuando los estados ocultos del compañero provienen de otra conversación: dependen de que el enlace esté activo, no del contenido compartido. Cualquier lectura semántica de esas respuestas es injustificada.
- El enlace constituye un canal de información que no aparece en el texto; en escenarios multiagente introduce un riesgo de fuga lateral y complica la auditoría de lo que un modelo "sabe".
- Idiomas soportados no documentados; no hay evaluación multilingüe del par enlazado.
- Licencia Apache-2.0 para los adaptadores y el puente, pero los pesos base se rigen por sus propias licencias, que deben verificarse por separado antes de un uso comercial. La licencia de AFM-4.5B no está en la información proporcionada.
- El autor declara que la model card, el código, el entrenamiento y las evaluaciones fueron realizados por Claude Opus 5.5; conviene auditar el código antes de confiar en los resultados.
- No se documentan sesgos, tasas de alucinación ni evaluación de seguridad; no hay garantías para uso en atención al cliente, sanidad, finanzas u otros dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sauers/neural-pairing
- Repositorio de código y experimentos: https://github.com/SauersML/neural-pairing
- README del repositorio: https://github.com/SauersML/neural-pairing/blob/main/README.md
- Modelo base Quill: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Ember: https://huggingface.co/arcee-ai/AFM-4.5B
- Paper: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
