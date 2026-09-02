# Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT4` es una cuantización INT4 weight-only del modelo `Qwen3.6-35B-A3B-Uncensored`, una variante "abliterada" (uncensored) del modelo Qwen3.6-35B-A3B de Alibaba. El autor, Rin247, aplica una proyección ortogonal para eliminar la dirección de rechazo del modelo base antes de cuantizar, dando como resultado un modelo que no muestra comportamientos de negativa ante peticiones controvertidas. Está pensado para desarrolladores e investigadores que necesitan un LLM local sin restricciones de contenido, manteniendo capacidades de razonamiento, código y tool use.

La cuantización se realiza con PyTorch RTN en CPU, almacenando escalas junto a los pesos en formato safetensors. El repositorio ocupa 19,4 GB y el archivo safetensors contiene 18.091.103.088 parámetros, aunque el nombre del modelo sugiere 35B totales con 3B activos (arquitectura MoE). No se dispone de licencia ni idiomas declarados en la ficha de HuggingFace. Según fuentes web, el modelo base presenta atención híbrida (lineal + softmax en proporción 3:1) y una ventana de contexto de 262K tokens, aunque estos datos no están confirmados oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atencion hibrida (lineal + softmax) segun fuentes web; tag: qwen3_5_moe_text |
| Parametros totales | 18.091.103.088 (segun safetensors); el nombre indica 35B totales (discrepancia sin resolver) |
| Parametros activos | ~3B (segun nombre del modelo y fuentes web) |
| Longitud de contexto | 262K tokens (segun Hackernoon; no confirmado oficialmente) |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT4 weight-only con escalas y shapes) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de `Qwen3.6-35B-A3B-Uncensored`, que a su vez deriva de `Qwen3.6-35B-A3B` mediante un proceso de "abliteration" (eliminacion de la direccion de rechazo) usando proyeccion ortogonal. Este proceso se aplica antes de la cuantizacion, segun la model card. La cuantizacion emplea PyTorch RTN (round-to-nearest) ejecutada en CPU, con escalas almacenadas en buffers separados (`*.weight_scale`, `*.weight_shape`). No se proporcionan detalles sobre el entrenamiento del modelo base (datos, tokens, metodos de alineacion como RLHF o DPO). Las fuentes web indican que el modelo base usa una arquitectura MoE con atencion hibrida (3:1 lineal/softmax), pero no hay documentacion oficial que lo confirme.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.6-35B-A3B es conocido por sus capacidades de razonamiento y comprension de lenguaje, segun fuentes web.
- Generacion de codigo: soporta tareas de programacion y depuracion, segun orcarouter.ai.
- Tool calling / function calling: el modelo base soporta uso de herramientas, segun orcarouter.ai.
- Capacidades multilingues: se menciona rendimiento multilingue en orcarouter.ai, aunque no se especifican idiomas.
- Capacidades multimodales: BestHub menciona "multimodal capability", pero no se detalla si es vision, audio u otro tipo.
- Ausencia de comportamiento de rechazo: al ser abliterado, no muestra negativas ante peticiones que el modelo original rechazaria.
- Compatible con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia estandar.

## Casos de uso

- Desarrollo de agentes autonomos: el modelo puede integrarse en pipelines de agentes que requieren respuestas sin restricciones de contenido, gracias a su soporte de tool calling y razonamiento multi-paso. Su cuantizacion INT4 permite ejecutarlo en hardware modesto.
- Generacion de codigo en entornos locales: desarrolladores que necesitan un asistente de programacion sin censura pueden usarlo en IDEs o CLI, aprovechando su capacidad de generar y depurar codigo.
- Investigacion en seguridad y alineacion: el modelo sirve para estudiar el comportamiento de modelos abliterados y comparar con versiones alineadas, especialmente en analisis de sesgos y robustez.
- Simulacion de conversaciones sin filtros: para pruebas de productos que requieren respuestas directas en dominios sensibles (salud, politica, etc.), aunque con riesgos legales y eticos.
- Educacion y experimentacion: estudiantes e investigadores pueden explorar tecnicas de cuantizacion y abliteracion usando este modelo como caso de estudio.
- Despliegue en edge computing: al ser INT4 y tener ~3B activos, puede ejecutarse en GPUs de consumo (6-8 GB VRAM) para aplicaciones offline, segun BestHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para esta cuantizacion especifica ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,4 GB, pero al ser INT4 weight-only, la carga en memoria puede ser menor. Con ~18B parametros en INT4, se estiman ~9-10 GB de VRAM para inferencia, mas overhead de escalas y activaciones. El articulo de BestHub menciona ejecutar el modelo base en 6 GB VRAM, pero no se especifica para esta cuantizacion.
- GPU recomendadas: RTX 3090/4090 (24 GB) o A100 (40/80 GB) para comodidad; GPUs con 8-12 GB (RTX 3060, 4070) podrian funcionar con cuantizacion adicional o offloading.
- Compatibilidad con consumer GPU: posible en GPUs de 12 GB o mas, con tecnicas de offloading a CPU.
- Opciones de despliegue: al ser safetensors con formato custom (INT4 weight-only), requiere dequantizacion manual antes de usar motores estandar. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversion previa. El tag `endpoints_compatible` sugiere que puede adaptarse a plataformas de inferencia, pero no se detalla.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Se mencionan alternativas como Gemma 4 Heretic y Dolphin 3.0 en InsiderLLM, pero sin especificaciones concretas. La comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o peligroso sin filtros. El proceso de abliteracion puede introducir sesgos adicionales al eliminar la direccion de rechazo.
- Riesgo de alucinacion: no hay datos especificos, pero los modelos cuantizados INT4 suelen degradar la precision en tareas de razonamiento complejo.
- Limitaciones de contexto: la ventana de 262K no esta confirmada oficialmente; en la practica, la cuantizacion puede reducir la capacidad de manejar contextos largos.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin aclaracion legal.
- Formato propietario: los pesos INT4 con escalas requieren dequantizacion manual; no son compatibles con la mayoria de motores de inferencia sin conversion, lo que dificulta su despliegue en produccion.
- Riesgo legal: el uso de modelos uncensored puede violar terminos de servicio de plataformas o leyes locales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT4
- Articulo BestHub sobre ejecucion en 6 GB VRAM: https://www.besthub.dev/articles/run-a-35b-open-source-llm-on-6-gb-vram-qwen3-6-35b-a3b-uncensored-jailbreak-edition-1dbcc3c6a4c8
- Ficha en orcarouter.ai: https://www.orcarouter.ai/models/obsidian/qwen3.6-35b-a3b
- Articulo Hackernoon sobre Qwen3.6-35B-A3B Uncensored: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Guia InsiderLLM sobre LLMs uncensored: https://insiderllm.com/guides/best-uncensored-local-llms/
