# NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE-GGUF

## Resumen

Qwen3.5-2B-Tools-SoftMoE-GGUF es una cuantización en formato GGUF (Q8_0) del experto soft MoE «Tool calling (Qwen format)» publicado por NikitaLazarev, derivado del modelo base Qwen3.5-2B-Tools-SoftMoE. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: un parche de dirección de dominio (*domain steer patch*) aplicado sobre los pesos mediante técnicas de *weight steering* y posteriormente convertido con `convert_hf_to_gguf.py` de llama.cpp. El resultado es un modelo de 1.942.653.248 parámetros (aproximadamente 1,94 mil millones) empaquetado en un repositorio de 2,1 GB.

El modelo está orientado a una única tarea: la invocación de herramientas (*tool calling*) siguiendo el formato de Qwen. La innovación declarada por el autor es que el parche de especialización queda horneado en los pesos, de modo que el modelo funciona en llama.cpp, LM Studio u Ollama sin necesidad de soporte especial en el runtime. Esto lo hace interesante para desarrolladores que quieren probar un modelo pequeño de function calling en hardware de consumo sin depender de infraestructura adicional.

No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las etiquetas incluyen `endpoints_compatible`, `conversational`, `soft-moe`, `q8_0` y `weight-steering`. Todo lo que sigue se basa exclusivamente en esos metadatos y en la model card del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con *soft MoE* (mezcla de expertos suave) y parche de *weight steering* sobre el modelo base Qwen3.5-2B |
| Parámetros totales | 1.942.653.248 (~1,94 mil millones) |
| Parámetros activos | no disponible (la técnica soft MoE no implica enrutamiento disperso clásico; no se detalla el número de expertos ni su tamaño) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única cuantización publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0); el modelo base se distribuye presumiblemente en safetensors, pero no se confirma en la información disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de aproximadamente 1,94 mil millones de parámetros, sobre el que se ha aplicado una especialización mediante *soft MoE* y *weight steering*. La etiqueta `soft-moe` sugiere una formulación de mezcla de expertos en la que la combinación de expertos se realiza de forma continua (promediado suave de pesos o de salidas) en lugar de un enrutamiento *top-k* discreto, lo que permite fusionar el comportamiento especializado en los pesos finales sin necesidad de un runtime con soporte de MoE. El parche de dirección de dominio concreta el comportamiento hacia el formato de tool calling de Qwen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado más allá del parche de steering. Tampoco se detalla el proceso exacto de conversión más allá del uso de `convert_hf_to_gguf.py` de llama.cpp. La model card indica que la herramienta empleada fue Ivanna Lab, un laboratorio de modelos LLM autoalojado (repositorio en GitHub), pero no se aportan curvas de entrenamiento, ablaciones ni métricas de evaluación.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Invocación de herramientas (*tool calling*) en el formato de Qwen, que es la capacidad objetivo del experto soft MoE.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de APIs compatibles con el formato de endpoints habitual (presumiblemente OpenAI-compatible, aunque no se especifica).
- Despliegue sin soporte especial de runtime: el parche está integrado en los pesos, por lo que llama.cpp, LM Studio y Ollama lo cargan como un GGUF convencional.
- No se documentan capacidades de visión, audio, matemáticas avanzadas, razonamiento multi-paso explícito ni modo *thinking*.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Prototipado de agentes con function calling en local: al ser un GGUF Q8_0 de ~2 GB, se puede cargar en llama.cpp u Ollama en un portátil y probar flujos de invocación de herramientas con el formato de Qwen antes de escalar a modelos mayores.
- Integración en pipelines de CI/CD para validar esquemas de herramientas: el modelo permite generar llamadas estructuradas en tests automatizados sin coste de API, útil para verificar que los *parsers* de tool calls funcionan correctamente.
- Asistentes de escritorio autoalojados: al ejecutarse en LM Studio u Ollama, encaja en aplicaciones de escritorio que necesitan un modelo pequeño con capacidad de emitir llamadas a funciones locales (sistema de ficheros, calculadora, APIs internas).
- Enrutamiento de intenciones en backends ligeros: un modelo de 1,94 B parámetros puede clasificar la intención del usuario y decidir qué herramienta invocar, reduciendo la latencia frente a modelos de mayor tamaño.
- Educación y experimentación con weight steering: sirve como ejemplo práctico de cómo un parche de dirección de dominio se hornea en pesos y se distribuye como GGUF, útil para investigadores que estudian técnicas de edición de modelos.
- Evaluación comparativa de formatos de tool calling: al estar especializado en el formato de Qwen, permite contrastar el comportamiento de distintos *frameworks* de agentes frente a ese esquema concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,1 GB y la cuantización es Q8_0 sobre ~1,94 B parámetros, por lo que se necesita aproximadamente 2,5-3 GB de VRAM para cargar los pesos, más el espacio para el contexto KV (variable según la longitud de contexto, que no se especifica).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 lo ejecutan con holgura. En entornos de servidor, una A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (según la model card) y, por la etiqueta `endpoints_compatible`, servidores compatibles con endpoints. No se confirma soporte de vLLM ni TGI para este GGUF concreto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-2B-Tools-SoftMoE-GGUF (este) | ~1,94 B | no disponible | GGUF Q8_0 | no disponible | Tool calling vía soft MoE + weight steering |
| Qwen3.5-2B (base) | ~1,94 B | no disponible | safetensors (presumible) | no disponible | Modelo generalista de Qwen |
| Qwen3.5-2B-Tools-SoftMoE (base del experto) | ~1,94 B | no disponible | safetensors (presumible) | no disponible | Experto soft MoE sin cuantizar |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. Las alternativas de la familia Qwen3.5-2B son las más directamente comparables por compartir arquitectura y tamaño, pero la información pública de este repositorio no permite contrastar métricas.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido. Es un bloqueo importante para producción.
- No se documentan los idiomas soportados; no se puede asumir cobertura multilingüe más allá de la del modelo base Qwen3.5-2B.
- El modelo es un artefacto derivado con un parche de steering horneado: no hay evaluación publicada de su calidad en tool calling, por lo que el rendimiento real es desconocido.
- Al ser un modelo de ~1,94 B parámetros, es esperable una capacidad de razonamiento limitada y un mayor riesgo de alucinación en tareas complejas, aunque no se aportan datos que lo cuantifiquen.
- La técnica de weight steering puede introducir sesgos o degradaciones no documentadas respecto al modelo base; no hay ablaciones publicadas.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (15 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- No se especifica la longitud de contexto, un dato crítico para planificar despliegues con conversaciones largas o agentes multi-paso.
- La única cuantización disponible es Q8_0; no hay versiones Q4_K_M ni Q5_K_M para entornos con menos VRAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE-GGUF
- Modelo base del experto: https://huggingface.co/NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE
- Herramienta Ivanna Lab: https://github.com/wiskeone/ivanna-lab
- llama.cpp (conversión GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
