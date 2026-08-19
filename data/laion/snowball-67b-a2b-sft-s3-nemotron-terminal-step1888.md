# laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888

## Resumen

Snowball 67B-A2B Nemotron-Terminal SFT es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 67.078 millones de parámetros totales, desarrollado por LAION como parte de la campaña de fine-tuning supervisado (SFT) del proyecto Marin. Se trata de la tercera etapa de un proceso ordenado Chat → Thinking → Agentic, y este checkpoint concreto se entrenó durante 1.888 pasos sobre el corpus Nemotron Terminal, partiendo del checkpoint final de la etapa Thinking. El resultado es un modelo conversacional y orientado a tareas de agente, exportado en formato BF16 para Hugging Face y vLLM.

La relevancia de este modelo radica en que forma parte de una línea experimental documentada en el repositorio marin-community/marin (issue #7743), donde se evaluó el corpus Nemotron Terminal como control exitoso. LAION, como organización sin ánimo de lucro, publica estos checkpoints para facilitar la reproducibilidad de la investigación. El modelo preserva el tokenizador Marin, los tokens especiales Delphi y el estado de bias de query FP32 entrenado, lo que lo hace específico para su evaluación con el framework Terminus-2.

Aunque el modelo no presenta métricas de benchmarks publicadas en la información disponible, su arquitectura MoE de 67B parámetros y su licencia Apache 2.0 lo convierten en una opción interesante para equipos que buscan un modelo de generación de texto con capacidades conversacionales y de agente, desplegable en entornos de producción con infraestructura adecuada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con tag `grug_moe` |
| Parametros totales | 67.078.882.816 (67,08 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (export nativo), cuantizaciones adicionales no documentadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) identificada con la etiqueta `grug_moe`, aunque no se detallan el número de expertos ni la estrategia de activación. Los 67,08 mil millones de parámetros totales sugieren una escala considerable, pero al ser MoE, solo una fracción de ellos se activa por token (dato no disponible). El export se realizó en BF16, lo que explica el tamaño del repositorio de 134,2 GB (aproximadamente 2 bytes por parámetro).

El entrenamiento corresponde a la tercera etapa de una campaña SFT ordenada Chat → Thinking → Agentic. El checkpoint se inicializó desde el modelo final de la etapa Thinking (publicado como `snowball-67b-a2b-sft-s2-thinking-step630`) y se fine-tuning durante 1.888 pasos sobre el corpus Nemotron Terminal, el mismo utilizado en el experimento de control del issue #7743 de marin-community. No se menciona el uso de RLHF o DPO; se trata de un fine-tuning supervisado clásico. El export preserva el tokenizador Marin, los tokens especiales Delphi y el bias de query FP32 entrenado, lo que indica una atención especial a la reproducibilidad de la inferencia.

## Capacidades

- Generación de texto conversacional: modelo entrenado específicamente para tareas de chat y diálogo multi-turno.
- Soporte de agentes: la etapa Agentic del SFT sugiere capacidades para razonamiento multi-paso y uso de herramientas, aunque no se documentan detalles de tool calling.
- Fine-tuning supervisado orientado a tareas: el corpus Nemotron Terminal está diseñado para escenarios de terminal y agente, lo que implica cierta especialización en comandos, scripting y automatización.
- Compatibilidad con vLLM y Hugging Face Transformers: el export está pensado para inferencia eficiente en producción.
- Preservación de tokens especiales (Delphi) y tokenizador Marin: permite integración con el ecosistema Marin y evaluación con Terminus-2.
- Multilingüismo: no se especifican idiomas soportados; se asume cobertura limitada o no documentada.

## Casos de uso

- Automatización de tareas de terminal: gracias a su entrenamiento en el corpus Nemotron Terminal, el modelo puede interpretar comandos, generar scripts de shell y asistir en la administración de sistemas, aunque se recomienda validar su precisión en entornos controlados.
- Asistentes conversacionales empresariales: su naturaleza SFT conversacional lo hace adecuado para chatbots de atención al cliente o asistentes internos, siempre que se integre con un sistema de retrieval aumentado (RAG) para mitigar alucinaciones.
- Investigación en fine-tuning de MoE: al ser un checkpoint intermedio publicado con ramas por paso, permite estudiar la evolución del entrenamiento y comparar etapas SFT (Chat vs. Thinking vs. Agentic).
- Evaluación de pipelines de agentes: dado su enfoque Agentic, puede probarse como motor de razonamiento en frameworks de agentes como LangChain o LlamaIndex, aunque requiere verificación de sus capacidades reales de tool calling.
- Generación de documentación técnica: su especialización en contextos de terminal y desarrollo puede aprovecharse para redactar guías, manuales o comentarios de código, con supervisión humana.
- Experimentación académica: LAION publica estos modelos para investigación reproducible; es útil para comparar estrategias de SFT y corpora de entrenamiento en modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se encontraron evaluaciones externas en los resultados de búsqueda. Se recomienda consultar el issue #7743 de marin-community para posibles evaluaciones cualitativas del experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 134 GB de VRAM (67,08 B × 2 bytes). Con cuantización a 8 bits (no documentada oficialmente) se reduciría a ~67 GB, y a 4 bits a ~34 GB, pero no hay garantía de compatibilidad con el export actual.
- GPU recomendadas: para BF16 completo se necesitan GPUs de datacenter como NVIDIA A100 80GB (dos unidades) o H100 80GB (dos unidades). Una sola GPU de 80GB no es suficiente para los pesos completos.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 6000 Ada (48 GB) con los pesos BF16. Con cuantización 4-bit podría intentarse en una RTX 6000 Ada de 48 GB, pero no está documentada.
- Opciones de despliegue: vLLM (soporte explícito en el export), Hugging Face Transformers con `device_map="auto"` para distribución en múltiples GPUs, o conversión a GGUF para llama.cpp/Ollama (no incluida en el repo).
- Latencia y throughput: no se proporcionan datos. En vLLM con 2×A100 se podría esperar un throughput de decenas de tokens por segundo, pero es una estimación sin base oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etapa SFT | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snowball-67b-a2b-sft-s2-thinking-step630 | 67,08 B | no disponible | Thinking (paso 630) | Apache 2.0 | HuggingFace |
| snowball-67b-a2b-sft-s3-nemotron-terminal-step1888 | 67,08 B | no disponible | Agentic / Nemotron Terminal (paso 1888) | Apache 2.0 | HuggingFace |
| sft-repro-thinking-step630-nemotron-terminal-step1888 | 67,08 B | no disponible | Reproduccion del experimento | Apache 2.0 | HuggingFace |

Los tres modelos comparten la misma arquitectura MoE de 67B y licencia Apache 2.0. La diferencia radica en la etapa de fine-tuning: el s2-thinking está especializado en razonamiento, mientras que el s3-nemotron-terminal se orienta a tareas de agente/terminal. El tercero es una reproducción del experimento para verificar consistencia. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sin datos de benchmarks: no se puede evaluar su rendimiento real frente a otros modelos; cualquier afirmación sobre su calidad es especulativa.
- Sesgos y alucinaciones: al ser un modelo entrenado con SFT sobre un corpus específico (Nemotron Terminal), puede presentar alucinaciones en dominios fuera de su especialización y no se han documentado evaluaciones de sesgo.
- Idiomas no especificados: no se indica qué idiomas soporta; probablemente el corpus de entrenamiento sea mayoritariamente inglés, lo que limita su uso en español u otros idiomas sin fine-tuning adicional.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable del cumplimiento de las leyes aplicables.
- Requisitos de hardware elevados: 134 GB de VRAM en BF16 limita su despliegue a infraestructura de datacenter; las cuantizaciones no están oficialmente soportadas.
- Dependencia del ecosistema Marin: el tokenizador y los tokens especiales Delphi son específicos de Marin; su integración con otros frameworks puede requerir adaptaciones.
- Reproducibilidad limitada: la provenance apunta a un bucket S3 interno; si ese recurso no está disponible públicamente, la reproducibilidad del entrenamiento queda comprometida.
- Fecha de creación futura (agosto de 2026): el modelo es muy reciente y no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Checkpoint anterior (etapa Thinking): https://huggingface.co/laion/snowball-67b-a2b-sft-s2-thinking-step630
- Reproducción del experimento: https://huggingface.co/laion/sft-repro-thinking-step630-nemotron-terminal-step1888
- Issue del experimento en marin-community: https://github.com/marin-community/marin/issues/7743
- Issue sobre la campaña SFT de tres etapas: https://github.com/marin-community/marin/issues/8225
- Sitio web de LAION: https://laion.ai/
