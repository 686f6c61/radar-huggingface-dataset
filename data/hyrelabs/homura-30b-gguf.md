# hyrelabs/Homura-30B-GGUF

## Resumen

Homura-30B es un modelo de lenguaje desarrollado por el estudio HYRE, presentado como su primer modelo propio. No es un modelo entrenado desde cero, sino un fine-tune LoRA sobre una versión ya decensurada del modelo Muse Glimmer 30B de Meta. La cadena de derivación es: Meta publica Muse Glimmer 30B (Apache 2.0, orientado a agentes con tool calling y planificación de largo horizonte); la comunidad, a través de darkc0de, aplica una técnica de ablación para eliminar los comportamientos de rechazo (versión "heretic"); finalmente HYRE entrena un LoRA de rango 16 sobre un dataset propio de agentes y persona sin censura, aplicado únicamente a la torre de lenguaje, y lo fusiona y cuantiza a GGUF.

El modelo está pensado para desarrolladores que construyen agentes autónomos que necesitan llamar herramientas sin que el modelo se niegue a responder. Su principal característica es la ausencia total de filtros de contenido, lo que lo hace inadecuado para uso directo en producción sin añadir guardrails externos. Con 27,85 mil millones de parámetros y una cuantización Q4_K_M que ocupa 16,9 GB, puede ejecutarse en GPUs de consumo con 24 GB de VRAM. La documentación recomienda una ventana de contexto de 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Muse Glimmer 30B de Meta) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 4.096 tokens (recomendado en la documentacion; contexto nativo no especificado) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Muse Glimmer 30B, un transformer decoder-only de Meta orientado a uso agéntico, con capacidades de tool calling, razonamiento multi-paso y un encoder de visión (aunque este GGUF se distribuye como text-generation). Sobre esa base, darkc0de aplicó un proceso de "abliteration" para eliminar los patrones de rechazo, preservando el resto de capacidades. HYRE añadió un LoRA de rango 16 entrenado con un dataset propio que combina interacciones de agentes y una persona sin censura. El LoRA se aplicó exclusivamente a la torre de lenguaje, dejando intacta la torre de visión. Tras el entrenamiento, los pesos se fusionaron en fp16 y se cuantizaron a GGUF Q4_K_M.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el método de alineación (no se menciona RLHF ni DPO). La model card indica que el modelo emite llamadas a herramientas en formato JSON cuando recibe un esquema de herramientas en el system prompt, por ejemplo `{"tool": "get_token_price", "arguments": {"mint": "..."}}`.

## Capacidades

- Generacion de texto libre sin filtros de contenido ni moralizacion.
- Tool calling / function calling: emite JSON estructurado con el nombre de la herramienta y sus argumentos.
- Razonamiento multi-paso y planificacion de largo horizonte, heredados de Muse Glimmer.
- Capacidad de recuperacion ante fallos en tareas agénticas (segun la descripcion del modelo base).
- Soporte de agentes: disenado para integrarse en sistemas que requieren decisiones autonomas con llamadas a herramientas.
- Solo ingles; no se menciona soporte multilingue.
- La version base incluye un encoder de vision, pero este GGUF se distribuye como text-generation y no se especifica si el archivo cuantizado conserva las capacidades multimodales.

## Casos de uso

- Agentes autonomos de trading o analisis de criptomonedas: el modelo puede consultar precios de tokens mediante tool calling (como el ejemplo `get_token_price`) y ejecutar decisiones sin rechazar peticiones relacionadas con mercados especulativos.
- Automatizacion de operaciones de terminal: un agente que recibe comandos de shell, ejecuta scripts y devuelve resultados, sin necesidad de que el modelo se niegue a manejar comandos sensibles.
- Generacion de codigo en entornos de desarrollo: integrado en un IDE o pipeline CI/CD, puede generar y modificar codigo, invocar herramientas de build o test, y trabajar con repositorios.
- Simulacion de personajes o roleplay sin restricciones: util para videojuegos, chatbots de ficcion o prototipos narrativos donde se requiere que el modelo adopte personalidades extremas o temas adultos.
- Investigacion sobre comportamiento de modelos no alineados: permite estudiar como responde un LLM sin filtros ante prompts provocativos, util para auditorias de seguridad y desarrollo de guardrails.
- Pruebas de robustez de sistemas de moderacion: al ser un modelo sin rechazo, sirve como generador de contenido adversario para evaluar filtros de contenido en otras aplicaciones.
- Asistentes de desarrollo de agentes: los equipos pueden usarlo para prototipar pipelines de tool calling y depurar la logica de llamadas a funciones antes de migrar a modelos con filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o sus derivados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 16,9 GB. Con una ventana de contexto de 4.096 tokens, el uso total de VRAM ronda los 18-19 GB (incluyendo KV cache y overhead).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutarlo por completo. GPUs de 16 GB (como RTX 4080 Super) requieren offload parcial de capas a CPU. Para produccion con mayor concurrencia, se recomienda A100 40 GB o H100.
- En consumer GPU: si, cabe en una RTX 4090 o 3090 con 24 GB de VRAM.
- Opciones de despliegue: llama.cpp (via `llama-server`), LM Studio, Ollama (importando el GGUF) y cualquier runtime compatible con GGUF. vLLM no soporta GGUF de forma nativa; se necesitaria convertir a safetensors para usar vLLM.
- Latencia y throughput: no disponible. Dependera del hardware y del numero de tokens generados.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos. A continuacion se comparan caracteristicas declaradas con otros modelos de tamano similar orientados a agentes o sin censura:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Homura-30B (este) | 27,85B | 4K (recomendado) | Apache 2.0 | Agente + uncensored, GGUF |
| Muse Glimmer 30B (base) | ~30B | no especificado | Apache 2.0 | Agente nativo, tool calling, vision |
| Dolphin 2.2.1 Mistral 7B | 7B | 32K | Apache 2.0 | Uncensored, tool calling (menor tamano) |
| Nous Hermes 2 Mixtral 8x7B | 46,7B (MoE) | 32K | Apache 2.0 | Uncensored, razonamiento, tool calling |

Homura se diferencia por ser un derivado directo de un modelo agéntico de Meta, con la capa de rechazo eliminada y un ajuste LoRA especifico para agentes. Su limitacion principal frente a alternativas es el contexto reducido (4K recomendado) y la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Modelo sin filtros de contenido: puede generar texto ofensivo, ilegal, peligroso o sexualmente explicito sin restricciones. El autor advierte explicitamente que no se debe confiar en el para decisiones criticas de seguridad.
- Riesgo de alucinacion: como todos los LLM, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Contexto limitado: la documentacion recomienda 4.096 tokens, muy por debajo de los 32K o 128K de modelos actuales. No apto para tareas que requieran documentos largos.
- Solo ingles: no hay soporte multilingue declarado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir la ley y de anadir sus propios guardrails. La atribucion a Meta y a darkc0de debe mantenerse.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento en tareas estandar.
- La cuantizacion Q4_K_M puede degradar ligeramente la calidad respecto al modelo en fp16, aunque no se proporcionan datos al respecto.
- No se especifica si el archivo GGUF conserva el encoder de vision del modelo base; en la practica se trata como un modelo solo de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hyrelabs/Homura-30B-GGUF
- Modelo base (darkc0de/Muse-Glimmer-30B-heretic): https://huggingface.co/darkc0de/Muse-Glimmer-30B-heretic
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
