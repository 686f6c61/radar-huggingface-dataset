# rusenask/Domyn-Edge-SFT-MLX-4bit

## Resumen

Domyn-Edge-SFT-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Domyn-Edge-SFT, publicada por el usuario rusenask. El modelo base fue desarrollado por Domyn y esta orientado a tareas de instrucción y razonamiento conversacional (SFT, supervised fine-tuning). Esta versión concreta no es un modelo nuevo, sino un artefacto de despliegue pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX.

La conversión aplica cuantización afín de 4 bits con tamaño de grupo 64 sobre 253 matrices del modelo, mientras que los 181 tensores restantes se conservan en bfloat16. El resultado es un repositorio de 2,2 GB que contiene aproximadamente 3.930 millones de parámetros totales según los pesos en safetensors. El tokenizador y la plantilla de chat provienen de la revisión del modelo original.

Su relevancia es acotada pero práctica: permite ejecutar un modelo de casi 4.000 millones de parámetros en equipos Apple con memoria unificada, a través de una implementación específica de la arquitectura Domyn Edge. La inferencia requiere un runtime que soporte tanto dicha arquitectura como el esquema de cuantización de MLX; el autor menciona que K3 Agent incluye una implementación en Swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Domyn Edge (transformer; detalles internos no disponibles) |
| Parametros totales | 3.928.787.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín con group size 64 (253 matrices); bfloat16 para 181 tensores |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base Domyn-Edge-SFT es un modelo afinado por supervisión (SFT) sobre la arquitectura Domyn Edge, de la que no se proporcionan detalles estructurales en la información disponible: no se especifica si emplea atención estándar, atención lineal u otras variantes, ni el número de capas, cabezas o dimensión oculta. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La aportación de esta ficha concreta es la conversión a MLX: se cuantizan 253 matrices a 4 bits con tamaño de grupo 64 y se mantienen 181 tensores en bfloat16, presumiblemente capas sensibles a la cuantización (normalizaciones, embeddings o cabezas). El registro de conversión incluye el SHA-256 del archivo de pesos, lo que permite verificar la integridad del artefacto. La plantilla de chat abre un bloque de razonamiento (thinking) por defecto.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base afinado con SFT.
- Modo de razonamiento explícito: la plantilla de chat abre un bloque de pensamiento por defecto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor menciona integración con K3 Agent como runtime, no como capacidad del modelo.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no disponibles.
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en un equipo Apple Silicon con memoria unificada, sin conexión a servicios externos, aprovechando la conversión MLX de 2,2 GB para respuestas de baja latencia en tareas de chat general.
- Agente integrado en K3 Agent: al ser la conversión oficial para ese runtime, encaja en flujos de agente que requieran un modelo pequeño con bloque de razonamiento y plantilla de chat compatible.
- Prototipado de aplicaciones de razonamiento: el modo thinking por defecto permite experimentar con cadenas de razonamiento en local antes de migrar a modelos mayores.
- Procesamiento de texto por lotes en estaciones de trabajo Mac: la cuantización a 4 bits reduce el consumo de memoria, lo que facilita ejecutar varias instancias o procesar lotes en equipos con 16-32 GB de memoria unificada.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el modelo base en bfloat16 y esta versión de 4 bits en tareas de instrucción.
- Desarrollo de herramientas de escritorio con IA embebida: aplicaciones macOS que necesiten un modelo de casi 4.000 millones de parámetros sin depender de GPU dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,2 GB; en ejecución se debe sumar la memoria del contexto y de los tensores en bfloat16 no cuantizados, por lo que conviene reservar del orden de 3-4 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (serie M1, M2, M3, M4 y variantes Pro/Max/Ultra) con MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 8 GB de memoria unificada; no está pensado para GPU NVIDIA/AMD por el formato MLX.
- Opciones de despliegue: MLX y runtimes que implementen la arquitectura Domyn Edge y el esquema de cuantización MLX; el autor cita K3 Agent (implementación en Swift).
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este artefacto, al requerir soporte de la arquitectura Domyn Edge y del layout MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Domyn-Edge-SFT-MLX-4bit | 3.930 M | no disponible | MLX safetensors 4-bit | apache-2.0 | Solo Apple Silicon; requiere runtime Domyn Edge |
| Domyn-Edge-SFT (base) | no disponible | no disponible | safetensors | apache-2.0 | Modelo original en precisión completa |
| Alternativas de ~4B en MLX | no disponible | no disponible | MLX | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo base en tareas sensibles, especialmente en razonamiento matemático y generación de código; no se han publicado evaluaciones al respecto.
- Requiere un runtime específico que implemente la arquitectura Domyn Edge y el layout de cuantización MLX; no funciona con las herramientas estándar de inferencia.
- No está pensado para GPU NVIDIA ni para despliegues en servidor convencionales.
- Riesgo de alucinación inherente a los modelos de lenguaje afinados con SFT; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles; el modelo base no publica información sobre composición del dataset ni evaluación de sesgos.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento adecuado en castellano.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base domyn/Domyn-Edge-SFT, ya que esta conversión solo añade la licencia del artefacto derivado.
- La plantilla de chat abre un bloque de pensamiento por defecto, lo que puede incrementar los tokens generados y afectar a la latencia si no se gestiona adecuadamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/rusenask/Domyn-Edge-SFT-MLX-4bit
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Revisión del modelo base referenciada: https://huggingface.co/domyn/Domyn-Edge-SFT/tree/d4b028edf7fc895a7e2e41df7d46cdafb40fb56e
