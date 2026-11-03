# GenerallyTso/Sophro-4B-memory-v1

## Resumen

Sophro-4B-memory-v1 es un ajuste fino de Qwen3-4B-Instruct-2507 desarrollado por Matt Skillman (Contain AI, proyecto Zynkbot) orientado a una tarea muy concreta: la extracción y vinculación de memorias en un asistente personal que se ejecuta en local. El modelo no se presenta como un chat generalista mejorado, sino como un componente especializado que, al leer un mensaje del usuario, almacena exactamente lo que se ha dicho y nada más. El nombre proviene de *sophrosyne*, el término griego para la cordura y el autocontrol, en alusión a esa contención deliberada en la extracción de información.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros totales, y se distribuye exclusivamente como un archivo GGUF cuantizado en Q4_0 de 2,37 GB, pensado para ejecutarse con llama.cpp en teléfonos y ordenadores sin enviar datos a ningún servidor. La ventana de contexto es la del modelo base; Zynkbot la configura en 4096 tokens en móviles y 8192 en equipos de escritorio.

Su relevancia actual radica en el nicho: demuestra que un ajuste fino pequeño (LoRA entrenado en unos diez minutos en una única GPU de consumo) sobre un modelo de 4B puede reducir drásticamente las alucinaciones en una tarea de extracción estructurada (de 7 hechos inventados a 1 en el benchmark del proyecto) y acelerar la resolución de relaciones entre memorias (de 0,99 s a 0,21 s). Es, por tanto, un caso de estudio de especialización estrecha para inferencia on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | La del modelo base; Zynkbot usa 4096 tokens en movil y 8192 en ordenador |
| Tipos de cuantizacion | Q4_0 (unico archivo publicado) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3-4B-Instruct-2507 original: un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se entrenó un adaptador LoRA en una única GPU de consumo, con un coste aproximado de diez minutos por ejecución. Los datos de entrenamiento proceden de dos fuentes: 933 mensajes reales de usuario etiquetados por Claude con el prompt exacto de extracción de memoria que Zynkbot envía en producción, y 349 casos de relaciones entre memorias redactados por el mismo modelo, todos filtrados mediante las reglas de aprobación del benchmark del proyecto. El adaptador se fusionó en el modelo base y el resultado se cuantizó a Q4_0.

La pérdida se calculó únicamente sobre la respuesta, no sobre el prompt, lo que concentra el aprendizaje en el formato de salida de extracción. La elección de Q4_0 no es arbitraria: permite que un mismo archivo sirva a las rutas de CPU, GPU y NPU en teléfonos Snapdragon. El modelo usa la plantilla de chat de Qwen3 declarada en el propio GGUF y no dispone de modo de razonamiento (thinking mode). No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni sobre la composición completa del dataset más allá de las dos fuentes citadas.

## Capacidades

- Extracción de memoria: identifica y almacena hechos explícitos a partir de mensajes de usuario, con una tasa baja de invención (1 hecho inventado de 69 posibles en el benchmark del proyecto).
- Vinculación de memorias: clasifica relaciones entre memorias (actualización, contradicción, relación, ninguna), con 38 aciertos de 44 casos y un tiempo de resolución de 0,21 s.
- Generación de texto conversacional: hereda la capacidad de chat del modelo base Qwen3-4B-Instruct-2507.
- Ejecución on-device: funciona con llama.cpp y cualquier herramienta construida sobre él, sin claves de API ni envío de datos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura de endpoints compatible.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base Qwen3 tiene cobertura multilingüe más amplia que no se declara aquí.
- Tool calling y agentes: no se documentan capacidades específicas de function calling ni de razonamiento multi-paso en la información disponible.
- Modo thinking: no disponible; el autor indica explícitamente que no lo usa.

## Casos de uso

- Asistente personal con memoria local: Zynkbot descarga este archivo en la primera ejecución y lo usa para chat, extracción de memoria y vinculación de memorias en teléfonos y ordenadores. El modelo está ajustado precisamente para ese flujo, de modo que el usuario conserva sus datos en sus dispositivos.
- Extracción de hechos en aplicaciones de notas: un diario o gestor de notas puede procesar cada entrada del usuario y almacenar únicamente los hechos declarados, con una tasa de invención muy baja (1 de 69 en el benchmark), lo que reduce la contaminación de la base de conocimiento.
- Deduplicación y actualización de perfiles de usuario: la capacidad de clasificar relaciones entre memorias permite detectar cuándo un dato nuevo actualiza o contradice uno anterior, con un tiempo de 0,21 s por lote de relaciones, adecuado para ejecutarse tras cada mensaje.
- Asistentes de salud o seguimiento personal: al limitarse a registrar lo dicho y no inferir, encaja en dominios donde inventar información es especialmente sensible, como el seguimiento de síntomas o hábitos.
- Despliegue en móviles Snapdragon: el archivo Q4_0 de 2,37 GB sirve para las rutas de CPU, GPU y NPU del mismo dispositivo, lo que simplifica la distribución de una app Android con IA local.
- Prototipado de pipelines de memoria para agentes: investigadores pueden usar el modelo como extractor de memoria en arquitecturas RAG o de agentes, sustituyendo llamadas a APIs externas por inferencia local con contexto de 4096-8192 tokens.
- Aplicaciones de privacidad por diseño: cualquier producto que requiera procesar conversaciones sin salida a la red puede integrar el GGUF con llama.cpp y mantener el cumplimiento de RGPD sin transferencias a terceros.

## Benchmarks y rendimiento

El autor publica resultados en el benchmark de memoria de Zynkbot, con 128 casos reservados que nunca estuvieron en los datos de entrenamiento, usando el prompt de móvil (fecha 2026-10-28):

| Modelo | Hechos encontrados (de 69) | Inventados | Basura (de 26) | Relaciones (de 44) | Tiempo de extraccion | Tiempo de relaciones |
|---|---|---|---|---|---|---|
| Qwen3-4B base Q4_0 | 66 | 7 | 0 | 28 | 0,30 s | 0,99 s |
| Sophro-4B-memory-v1 | 68 | 1 | 0 | 38 | 0,31 s | 0,21 s |

Los seis fallos de relación del modelo ajustado corresponden a cinco casos de "actualización" clasificados como "contradicción" y uno de "ninguna" clasificado como "relacionado". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_0 ocupa 2,37 GB, por lo que la inferencia completa cabe en menos de 3 GB de memoria, sumando overhead de contexto.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM puede ejecutar el modelo; en el extremo profesional, A100 o H100 lo ejecutan con holgura, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en las NPU y GPU integradas de teléfonos Snapdragon.
- Opciones de despliegue: llama.cpp y cualquier herramienta construida sobre él; la etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: en el benchmark del proyecto, la extracción tarda 0,31 s y la resolución de relaciones 0,21 s en el entorno de prueba (prompt de móvil). No se han publicado cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sophro-4B-memory-v1 | 4.022 M | Base; 4096-8192 en Zynkbot | GGUF Q4_0 | Apache-2.0 | Extraccion y vinculacion de memoria on-device |
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | La del modelo base | safetensors y GGUF | Apache-2.0 | Chat generalista |
| Alternativas de extraccion de memoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base: Sophro reduce los hechos inventados de 7 a 1 y mejora las relaciones de 28 a 38 sobre 44, con un tiempo de relaciones 4,7 veces menor (0,21 s frente a 0,99 s), a costa de un tiempo de extracción prácticamente idéntico (0,31 s frente a 0,30 s). No se dispone de información sobre otros modelos especializados en extracción de memoria con los que comparar.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está pensado para extracción y vinculación de memoria; su rendimiento como chat generalista puede diferir del modelo base y no se ha evaluado en la información disponible.
- Idioma: la model card declara únicamente inglés, lo que limita su uso en castellano u otros idiomas sin evaluación previa.
- Riesgo de alucinación: reducido pero no nulo; el benchmark reporta 1 hecho inventado de 69, por lo que en producción conviene validar o marcar las memorias extraídas.
- Errores de clasificación de relaciones: los seis fallos documentados se concentran en distinguir "actualización" de "contradicción", un matiz relevante si el sistema debe decidir si sobrescribe o conserva una memoria anterior.
- Datos de entrenamiento privados: los 933 mensajes reales son conversaciones privadas de una persona y no se publican, lo que dificulta la reproducibilidad y la auditoría del sesgo.
- Cuantización única: solo se publica Q4_0, sin alternativas de mayor precisión (Q8_0, FP16) para evaluar la pérdida por cuantización.
- Licencia: Apache-2.0 permite uso comercial, pero Qwen3 es © Alibaba Cloud y el ajuste es de Matt Skillman (Contain AI); conviene conservar los avisos de atribución.
- Contexto limitado en móvil: 4096 tokens puede ser insuficiente para conversaciones largas o documentos extensos si se usa como extractor sobre historiales completos.
- Sin modo thinking: no aprovecha las capacidades de razonamiento extendido de la familia Qwen3, lo que puede afectar a casos que requieran inferencia compleja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GenerallyTso/Sophro-4B-memory-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Zynkbot: https://github.com/MSkill1/zynkbot
- Documentación de benchmarks: https://github.com/MSkill1/zynkbot/blob/main/docs/BENCHMARKS.md
