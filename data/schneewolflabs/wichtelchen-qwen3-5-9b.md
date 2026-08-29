# schneewolflabs/Wichtelchen-Qwen3.5-9B

## Resumen

Wichtelchen-Qwen3.5-9B es un modelo de lenguaje multimodal (texto e imagen) de 9.400 millones de parámetros, desarrollado por el laboratorio schneewolflabs como una adaptación del modelo Hemlock-Qwen3.5-9B. Su propósito es actuar como un "operador local" que delega tareas de ingeniería en un agente de código, manteniendo un rendimiento cercano al de su hermano mayor de 27B pero con un tercio de los parámetros. El modelo integra capacidades de tool calling, generación de código en el lenguaje Hemlock y un comportamiento de "egirl" orientado a interacciones conversacionales, todo ello bajo una licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque de especialización mediante adaptadores LoRA y ORPO sobre una base ya optimizada, logrando un equilibrio entre capacidades generales (razonamiento, visión, código) y un comportamiento específico para agentes. Su arquitectura hereda la de Qwen3.5-9B, un transformer denso con soporte multimodal, y añade un cabezal MTP (Multi-Token Prediction) para acelerar la decodificación especulativa. Está pensado para ejecutarse en hardware de consumo, con soporte para cuantización GGUF y despliegue mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para este merge; el modelo base Qwen3.5-9B soporta 262.144 tokens nativos |
| Tipos de cuantizacion | Safetensors (FP16/BF16) y GGUF (mencionado Q8_0 en la documentación) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

Wichtelchen-Qwen3.5-9B es un modelo denso de tipo transformer con componentes de visión y lenguaje, derivado de Qwen3.5-9B-Base. La cadena de adaptación incluye: primero, una versión "abliterated" (eliminación de rechazos) de Huihui, luego una fusión TIES con datos SFT/ORPO de Grimoire, posteriormente un ajuste con SFT de Hemlock (lenguaje de programación) para crear Hemlock-Qwen3.5-9B, y finalmente tres rondas de ORPO con datasets específicos: GreatFirewall (para reducir censura), delegación (para transferir trabajo a un agente de código) y egirl (para combinar delegación con uso de herramientas Hemlock). Cada adaptador se entrenó sobre el propio modelo de 9B, ya que los LoRA no transfieren entre preentrenamientos.

El entrenamiento utilizó datasets públicos como nbeerbower/GreatFirewall-DPO, schneewolflabs/egirl-DPO, schneewolflabs/egirl-delegation-dpo, schneewolflabs/egirl-hemlock-dpo y hemlang/Hemlock-SFT-combined. El modelo incorpora un cabezal MTP (Multi-Token Prediction) con 15 tensores adicionales, que se restauran tras cada fusión PEFT porque `merge_and_unload()` los elimina silenciosamente. Este cabezal permite decodificación especulativa en llama.cpp, mejorando la latencia de generación.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades generales de Qwen3.5-9B, con ARC determinista de 61,87 y perplejidad wiki de 6,720, dentro de un 1% de la línea base.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto.
- Generación de código: especializado en el lenguaje Hemlock, alcanzando 56,1% en hembench (frente al 28,5% de la línea base).
- Tool calling y function calling: soporta llamadas a herramientas, aunque con limitaciones de formato en algunos casos (3 de 47 casos de prueba presentan argumentos malformados).
- Delegación a agentes: puede transferir tareas de ingeniería a un agente de código externo (egirl), logrando 10/10 en el eje de delegación.
- Comportamiento conversacional "egirl": orientado a interacciones con estilo específico, con 37/47 en el conjunto de casos egirl.
- Decodificación especulativa: gracias al cabezal MTP, compatible con llama.cpp para generación más rápida.
- Multilingüismo: solo inglés confirmado; no se mencionan otros idiomas.

## Casos de uso

- Asistente de programación local: el modelo puede generar y revisar código en Hemlock, integrándose en editores o CLIs para desarrolladores que trabajen con ese lenguaje. Su precisión en hembench (56,1%) lo hace útil para tareas de programación específicas del dominio.
- Agente autónomo de ingeniería: gracias a la delegación a un agente de código, puede orquestar tareas como ejecutar comandos, consultar estado de repositorios (git_status) y ejecutar scripts, actuando como un operador que supervisa el trabajo del agente.
- Chat conversacional con estilo personalizado: su comportamiento "egirl" lo hace adecuado para aplicaciones de entretenimiento o compañía virtual, donde se requiere un tono específico y respuestas con matices emocionales.
- Análisis de imágenes con razonamiento: al ser multimodal, puede describir o razonar sobre imágenes, útil en aplicaciones de accesibilidad, moderación de contenido o asistentes visuales.
- Automatización de tareas con tool calling: puede integrarse en pipelines que requieran llamadas a APIs o herramientas externas, aunque con la advertencia de que la llamada a herramientas es de un solo turno y puede presentar errores de formato.
- Entorno de desarrollo con decodificación especulativa: su cabezal MTP permite ejecutarlo en hardware modesto con llama.cpp, ideal para prototipos o entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos a lo largo de las etapas de adaptación. Se presentan los datos finales del modelo Wichtelchen junto con la línea base y etapas intermedias:

| Métrica | Baseline | +Schierling | +Bubba | +delegation | Wichtelchen |
|---|---|---|---|---|---|
| hembench (ponderado) | 28,5% | 57,1% | 49,4% | 50,6% | 56,1% |
| egirl 47 casos | 41/47 | 37 | 36 | 36 | 37/47 |
| Eje delegación | 6/10 | 7 | 7 | 9 | 10/10 |
| Censura (best-of-5) | 28,8/29 | 29,0 | 28,8 | 28,6 | 29,0/29 |
| ARC (determinista) | 61,54 | 62,54 | 62,54 | 62,54 | 61,87 |
| Perplejidad wiki | 6,656 | 6,782 | 6,739 | 6,717 | 6,720 |

No se dispone de resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información proporcionada. Los datos presentados son específicos de los conjuntos de evaluación internos del autor.

## Requisitos de hardware

- VRAM estimada: para FP16/BF16, el modelo requiere aproximadamente 19 GB (dado el tamaño del repo de 19,3 GB). Con cuantización Q8_0, la VRAM necesaria ronda los 9,5 GB; con Q4, unos 5 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o superior. Para Q8_0, una GPU con 12-16 GB (RTX 4070 Ti, RTX 3080) es suficiente. Para Q4, cabe en GPUs de 8 GB (RTX 3060, RTX 4060).
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF. El modelo está diseñado para ejecutarse localmente.
- Opciones de despliegue: llama.cpp (con soporte para MTP y decodificación especulativa), llama-server, y potencialmente vLLM u Ollama (aunque no se menciona explícitamente). El comando documentado usa `llama-server` con `--spec-type draft-mtp`.
- Latencia y throughput: no se proporcionan datos numéricos. La decodificación especulativa con MTP (hasta 4 tokens de borrador) debería reducir la latencia en comparación con la generación autoregresiva estándar, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | hembench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wichtelchen-Qwen3.5-9B | 9,4B | No disponible (base: 262k) | 56,1% | Apache 2.0 | HuggingFace |
| Hemlock-Qwen3.5-9B | 9,4B | No disponible (base: 262k) | 57,1% (con Schierling) | Apache 2.0 | HuggingFace |
| Wichtel-Qwen3.6-27B | 27B | No disponible | 67,6% | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (base) | 9,4B | 262.144 | No aplica | Apache 2.0 | HuggingFace, Ollama |

Wichtelchen ofrece un rendimiento cercano al 27B en hembench (56,1% vs 67,6%) con un tercio de los parámetros, a costa de una ligera pérdida frente a Hemlock puro (57,1%). Su ventaja reside en el comportamiento de delegación y la reducción de censura, que no están presentes en el modelo base.

## Limitaciones y advertencias

- Inestabilidad en el formato de llamadas a herramientas: en 3 de 47 casos de prueba, el modelo genera argumentos como cadena simple o los eleva al nivel superior, lo que requiere un parser tolerante o una ronda adicional de entrenamiento por preferencias.
- Comportamiento de "restraint" débil: en 7/10 casos, tiende a usar herramientas como `git_status` o `execute_command` incluso cuando se espera una respuesta directa. La delegación en sí no falla, pero puede ejecutar acciones innecesarias.
- Conocimiento limitado de la stdlib de Hemlock: los nombres exactos de funciones son conocimiento memorizado de API; se recomienda verificar las llamadas contra la documentación.
- Llamada a herramientas de un solo turno: no soporta conversaciones multi-turno con herramientas; la delegación está ligada al esquema de herramientas de egirl.
- Riesgo de alucinación: no se menciona explícitamente, pero al ser un modelo de 9B, es susceptible a errores factuales, especialmente en dominios fuera de su entrenamiento.
- Sesgos: el modelo fue "abliterated" (eliminación de rechazos), lo que puede reducir sus inhibiciones ante contenido sensible. Aunque la puntuación de censura es alta (29/29), el comportamiento puede ser impredecible en contextos delicados.
- Idioma: solo inglés confirmado; no se garantiza rendimiento en otros idiomas.
- Estado del proyecto: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un lanzamiento reciente o experimental. La fecha de creación (2026-08-29) es posterior a la fecha actual, lo que indica que podría ser un proyecto en desarrollo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Modelo hermano mayor (27B): https://huggingface.co/schneewolflabs/Wichtel-Qwen3.6-27B
- Modelo base Hemlock: https://huggingface.co/hemlang/Hemlock-Qwen3.5-9B
- Adaptador Schierling: https://huggingface.co/hemlang/Schierling-Qwen3.5-9B-LoRA
- Repositorio del agente egirl: https://github.com/Schneewolf-Labs/egirl
- Colección Qwen3.5 de unsloth: https://huggingface.co/collections/unsloth/qwen35
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
- Ficha de Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Benchmarks de Qwen3.5-9B: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
