# Rumiii/Qwimi-4B

## Resumen

Qwimi-4B es un modelo de lenguaje de 4 000 millones de parámetros publicado por el usuario Rumiii en Hugging Face. Se trata de un destilado del modelo profesor Kimi K2 (moonshotai/Kimi-K2-Instruct) sobre el modelo estudiante Qwen3-4B-Instruct-2507, con el objetivo declarado de reforzar las capacidades agénticas del estudiante, en particular el tool calling multi-paso.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre trayectorias del profesor extraídas del dataset Agent-Ark/Toucan-1.5M, en su configuración Kimi-K2. Ese corpus contiene más de 1,5 millones de trayectorias agénticas sintetizadas a partir de 495 servidores reales de Model Context Protocol (MCP) que abarcan más de 2 000 herramientas, con interacciones de un solo turno y multi-turno, y llamadas a herramientas secuenciales y paralelas con ejecución real.

La relevancia del modelo radica en que aplica destilación de un modelo frontera tipo MoE (Kimi K2) a un modelo denso pequeño (4B) para transferir comportamiento agéntico, un enfoque que interesa a quien necesita capacidades de orquestación de herramientas en hardware modesto. El autor advierte explícitamente de que la destilación se hizo sobre un dataset ya existente y no con respuestas generadas en vivo por Kimi K2. El modelo se publica bajo licencia Apache 2.0 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card del destilado; el modelo base Qwen3-4B-Instruct-2507 declara hasta 262 144 tokens |
| Tipos de cuantizacion | no disponible en la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card (repositorio con `library_name: transformers`) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del estudiante: un transformer denso de tipo decodificador de la familia Qwen3, con 4 000 millones de parámetros. No hay cambios estructurales documentados; el trabajo se limita a un ajuste supervisado sobre los pesos de Qwen3-4B-Instruct-2507. El modelo profesor, Kimi K2, es un MoE de gran tamaño, pero su arquitectura no se transfiere: solo se usan sus trayectorias como señal de supervisión.

El entrenamiento usó la configuración Kimi-K2 del dataset Agent-Ark/Toucan-1.5M, con un total de 9 168 muestras durante una única época. La distribución por subconjuntos fue: single-turn-original (2 750 muestras, 30 %), single-turn-diversify (2 292, 25 %), multi-turn (2 751, 30 %) e irrelevant (1 375, 15 %). Se excluyeron las muestras de más de 4 096 tokens (sin truncar ninguna) y las muestras multi-turno que contenían llamadas a herramientas sin herramientas declaradas. Las trayectorias siguen la plantilla de chat estándar de tool calling de Qwen3. No se documentan fases de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Tool calling y function calling, con foco explícito en llamadas multi-paso.
- Llamadas secuenciales y paralelas a herramientas, tal y como aparecen en las trayectorias de entrenamiento.
- Integración con herramientas descritas mediante el esquema de Model Context Protocol (MCP), al proceder el dataset de 495 servidores MCP reales.
- Gestión de casos con herramientas irrelevantes: el subconjunto `irrelevant` (15 % de las muestras) entrena al modelo para no invocar herramientas cuando no procede.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Modo de razonamiento extendido o modo *thinking*: no documentado en la model card.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes basados en MCP: el modelo se ha entrenado con trayectorias reales de servidores MCP, por lo que encaja como cerebro de un agente que descubre y ejecuta herramientas expuestas por dichos servidores, encadenando varias llamadas para completar una tarea.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno en las que consulta sistemas internos (estado de pedido, facturación) mediante function calling antes de responder al usuario.
- Automatización de flujos ofimáticos: encadenamiento de acciones sobre calendario, correo o gestores de tareas, aprovechando la capacidad de emitir llamadas paralelas para operaciones independientes.
- Pipelines de CI/CD y asistentes de código: integración en herramientas de desarrollo para invocar APIs de repositorio, lanzar builds o consultar incidencias, siguiendo la plantilla de tool calling de Qwen3.
- RAG agéntico: uso como planificador que decide qué consultas lanzar contra un índice o API de búsqueda, evalúa resultados intermedios y reformula antes de generar la respuesta final.
- Orquestación de APIs empresariales: capa de enrutamiento que traduce lenguaje natural a llamadas concretas sobre varios servicios, con control explícito de cuándo no debe llamarse a ninguna herramienta.
- Despliegue en el borde o en local: por su tamaño de 4B, es viable en GPU de consumo y en equipos con recursos limitados, lo que permite agentes que no envían datos a servicios externos.
- Evaluación comparativa de destilación: sirve como referencia para estudiar cuánto comportamiento agéntico de un profesor grande se puede transferir a un estudiante de 4B con solo 9 168 muestras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluación, ni comparaciones cuantitativas con el profesor o con el modelo base.

## Requisitos de hardware

Las siguientes cifras son estimaciones estándar para un modelo denso de 4 000 millones de parámetros; la model card no proporciona datos de consumo, latencia ni throughput.

- VRAM estimada en bf16/fp16: en torno a 8-10 GB, incluyendo pesos y caché KV para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4-6 GB.
- VRAM estimada en cuantización de 4 bits (por ejemplo GGUF Q4_K_M): en torno a 2,5-3,5 GB.
- GPU recomendadas de gama profesional: A100, H100, L40S para despliegues con concurrencia alta.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutar el modelo en bf16 o cuantizado; tarjetas con 8 GB funcionan con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada en el repositorio), vLLM, SGLang, llama.cpp, Ollama y TGI, siempre que existan conversiones del modelo (no confirmadas en la model card). La etiqueta `endpoints_compatible` sugiere compatibilidad con el endpoint de Hugging Face.
- Latencia y throughput: no disponibles.
- Nota importante: puesto que el entrenamiento limitó las muestras a 4 096 tokens, el comportamiento con contextos largos no está validado, aunque la arquitectura base soporte ventanas mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwimi-4B | 4B denso | no especificado (base: 262 144) | Destilado de Kimi K2 para tool calling agéntico | Apache 2.0 | Hugging Face, sin descargas registradas |
| Qwen3-4B-Instruct-2507 | 4B denso | 262 144 | Modelo instruct generalista, con soporte de tool calling | Apache 2.0 | Ampliamente desplegado |
| Llama-3.1-8B-Instruct | 8B denso | 128 000 | Modelo instruct generalista con function calling | Llama 3.1 Community License | Ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7B denso | 131 072 | Modelo instruct generalista con tool calling | Apache 2.0 (con condiciones para modelos derivados de gran escala) | Ampliamente desplegado |

La comparación se limita a especificaciones: no hay datos de benchmarks publicados para Qwimi-4B que permitan contrastar su rendimiento en tareas agénticas frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks que confirmen que la destilación mejora realmente las capacidades agénticas frente al modelo base.
- Entrenamiento muy reducido: 9 168 muestras y una sola época, lo que hace plausible un ajuste estrecho al estilo y formato de las trayectorias de Toucan-1.5M, con riesgo de degradación en tareas fuera de esa distribución.
- Riesgo de sobreajuste al formato de tool calling de Qwen3: las trayectorias siguen la plantilla de chat de Qwen3, por lo que prompts o plantillas distintas pueden degradar el comportamiento.
- Límite de 4 096 tokens durante el entrenamiento: el rendimiento con contextos largos o con muchas herramientas declaradas no está validado.
- Idiomas soportados no declarados: no se puede asumir un comportamiento multilingüe correcto más allá de lo que herede el modelo base.
- Riesgo de alucinación en la selección y argumentación de herramientas: no se documenta ninguna capa de verificación, y el modelo puede invocar herramientas inexistentes o con parámetros incorrectos.
- Sesgos: no disponibles. No se documenta ningún análisis de sesgo ni de composición demográfica del dataset.
- Licencia: el modelo se publica como Apache 2.0, pero deriva de Qwen3-4B-Instruct-2507 (Apache 2.0) y se entrena con trayectorias generadas por Kimi K2, cuya licencia es una variante de MIT modificada. Conviene revisar las condiciones de atribución aplicables antes de un uso comercial a gran escala.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Trazabilidad limitada: el autor indica que las respuestas del profesor no se generaron en vivo, sino que proceden de un dataset público, lo que impide auditar la calidad de las trayectorias originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rumiii/Qwimi-4B
- Modelo base estudiante: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo profesor (Kimi K2): https://huggingface.co/moonshotai/Kimi-K2-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
