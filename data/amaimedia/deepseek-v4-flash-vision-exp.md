# AMAImedia/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4, desarrollado por DeepSeek AI. Se basa en la arquitectura de DeepSeek-V4-Flash e incorpora módulos visuales (vision encoder y aligner) con entrenamiento continuado para desbloquear capacidades de comprensión de imágenes. El modelo procesa entradas de texto e imagen y está orientado a tareas de agente multimodal, como análisis de capturas de pantalla, gráficos y documentos.

Con 304.646.824.126 parámetros (~304,6 mil millones) y arquitectura de mezcla de expertos (MoE), el modelo mantiene un rendimiento comparable al de DeepSeek-V4-Flash-0731 en tareas de agente de solo texto, mientras mejora sustancialmente en benchmarks multimodales como ApexBench y Agents' Last Exam. Se distribuye bajo licencia MIT y está disponible en Hugging Face, con soporte para vLLM y una implementación de inferencia mínima en PyTorch. El lanzamiento se produjo en agosto de 2026 y está disponible tanto vía API como en abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con DFlash attention, Hyper-Connections, DSpark forward path, vision encoder y aligner |
| Parametros totales | 304.646.824.126 (~304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8, 8-bit (segun metadatos del repositorio) |
| Idiomas soportados | en, ru, zh, vi, kk |
| Licencia | MIT |
| Formato de pesos | safetensors (shards, model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con mecanismos propios de DeepSeek: DFlash attention, Hyper-Connections y el camino de forward DSpark. Para la modalidad visual incorpora un vision encoder y un aligner que proyectan las representaciones de imagen al espacio del modelo de lenguaje. El repositorio incluye una implementacion de inferencia minima en PyTorch que cubre todos estos componentes.

No se han publicado datos sobre el numero de expertos, los parametros activos, la composicion del dataset de entrenamiento ni el numero de tokens utilizados. Tampoco se especifica si se aplicaron tecnicas de RLHF o DPO. El modelo se presenta como experimental y su entrenamiento continuado se centro en desbloquear capacidades visuales manteniendo el rendimiento en tareas de agente de texto.

## Capacidades

- Generacion de texto y comprension de imagenes: analisis de capturas de pantalla, graficos, tablas y tareas tipo OCR.
- Razonamiento de agente multimodal: evaluado en ApexBench, Agents' Last Exam, Chartography y ZeroBench.
- Tool calling y function calling: verificado en Toolathlon-Verified y AutomationBench.
- Agentes multi-step: capacidades en entornos de terminal (Terminal Bench 2.1), repositorios (NL2Repo), ciberseguridad (Cybergym) y desarrollo de software (DeepSWE, DSBench-Hard).
- Multilingue: soporta ingles, ruso, chino, vietnamita y kazajo.
- Prompt encoding flexible: acepta bloques de contenido estilo OpenAI (JSON) y notacion compacta TXT con etiquetas `<image>path</image>`.

## Casos de uso

- Automatizacion de interfaces de usuario: el modelo puede interpretar capturas de pantalla y ejecutar acciones en entornos de agente, lo que permite automatizar flujos de trabajo en aplicaciones de escritorio o web.
- Analisis de graficos y tablas: dado un grafico o tabla como imagen, extrae tendencias, valores y genera resumenes, util para informes financieros o de negocio.
- Extraccion de informacion de documentos (OCR): procesa imagenes de documentos, facturas o formularios para extraer texto estructurado y alimentar pipelines posteriores.
- Asistencia en desarrollo de software con contexto visual: puede recibir diagramas de arquitectura, capturas de errores o mockups de UI y generar codigo o sugerencias de implementacion.
- Agentes de terminal y operaciones: con capacidades evaluadas en Terminal Bench y Cybergym, puede ejecutar comandos, diagnosticar fallos y automatizar tareas de administracion de sistemas.
- Atencion al cliente multilingue: al soportar cinco idiomas, puede gestionar conversaciones con usuarios en ruso, chino, vietnamita o kazajo, integrando imagenes de productos o capturas de pantalla en el hilo.
- Automatizacion de doblaje profesional: la plataforma NOESIS de AMAImedia lo utiliza como parte de su framework DHCF-FNO para tareas de doblaje multilingue, aprovechando la comprension de guiones visuales y textuales.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan DeepSeek-V4-Flash-Vision-Exp con DeepSeek-V4-Flash-0731 (solo texto) y Opus-4.8. La evaluacion de los modelos DeepSeek se realizo con DeepSeek Harness en modo minimal, nivel de razonamiento `max`, temperatura 1.0 y top_p 0.95.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 |
| NL2Repo | 57.7 | 54.2 | 69.7 |
| Cybergym | 75.3 | 76.7 | 78.3 |
| DeepSWE | 59.3 | 54.4 | 58.0 |
| Toolathlon-Verified | 75.9 | 70.3 | 76.2 |
| DSBench-Hard | 63.6 | 59.6 | 71.7 |
| AutomationBench (Public) | 25.7 | 25.1 | 27.2 |
| ApexBench (Pass@1) | 36.5 | 26.2† | 39.4 |
| Agents' Last Exam | 27.3 | 25.2† | 25.7 |
| Chartography | 64.3 | - | 65.0 |
| ZeroBench (Pass@5) | 35.0 | - | 34.0 |

Nota: † indica que DeepSeek-V4-Flash-0731 ignora los elementos multimodales en ApexBench y Agents' Last Exam.

## Requisitos de hardware

- El ejemplo oficial de despliegue con vLLM utiliza un nodo con 4 GPUs NVIDIA GB300, lo que indica que se requieren multiples GPUs de data center de alta capacidad.
- Con ~304,6 mil millones de parametros, el modelo no cabe en GPUs de consumo (RTX 4090, etc.) ni en una unica GPU de data center de 80 GB, incluso en fp8.
- No se han publicado datos oficiales de VRAM minima ni de latencia o throughput.
- Opciones de despliegue: vLLM (con receta oficial), implementacion de inferencia minima en PyTorch incluida en el repositorio, y DeepSeek Harness como framework de agente.
- El repositorio incluye archivos de configuracion para transformers, por lo que tambien puede cargarse con esa libreria, aunque la inferencia completa requerira multiples GPUs.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados en la model card, que enfrentan al modelo con su predecesor de solo texto y con Opus-4.8, un modelo multimodal de otra familia.

| Modelo | Parametros | Modalidad | Licencia | Contexto | Rendimiento multimodal destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | ~304,6B (MoE) | Texto + imagen | MIT | no disponible | ApexBench 36.5, Chartography 64.3 |
| DeepSeek-V4-Flash-0731 | no disponible | Solo texto | MIT | no disponible | Sin vision (ignora elementos visuales) |
| Opus-4.8 | no disponible | Texto + imagen | no disponible | no disponible | ApexBench 39.4, Chartography 65.0 |

El modelo supera a DeepSeek-V4-Flash-0731 en todos los benchmarks de agente multimodal y mantiene un rendimiento cercano en tareas de solo texto. Frente a Opus-4.8, es inferior en la mayoria de benchmarks de texto, pero compite de cerca en capacidades multimodales (Chartography y ZeroBench).

## Limitaciones y advertencias

- Modelo experimental: puede presentar comportamientos inestables o errores no documentados en entornos de produccion.
- Sesgos y alucinaciones: no se han publicado evaluaciones especificas de sesgos ni tasas de alucinacion; se recomienda validar las salidas en aplicaciones criticas.
- Longitud de contexto no especificada: se desconoce el limite de tokens de entrada, lo que dificulta planificar cargas de trabajo con contextos largos.
- Idiomas limitados: solo cubre cinco idiomas (en, ru, zh, vi, kk); no hay soporte declarado para espanol ni otros idiomas.
- Requisitos de hardware elevados: la inferencia exige multiples GPUs de data center, lo que limita su uso a entornos con infraestructura avanzada.
- Datos de entrenamiento no publicados: no se conoce la composicion del dataset ni las tecnicas de alineacion, lo que dificulta evaluar riesgos de sesgo o seguridad.
- Disponibilidad via API: el acceso por API puede estar sujeto a cambios de precio o disponibilidad, como se ha observado en otros modelos de DeepSeek.

## Enlaces

- Repositorio original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Espejo de AMAImedia en Hugging Face: https://huggingface.co/AMAImedia/DeepSeek-V4-Flash-Vision-Exp
- Pagina oficial de DeepSeek: https://deepseek.com/en/index.html
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Articulo de Emergent.sh: https://emergent.sh/news/deepseek-v4-flash-vision-exp-officially
- Analisis de ExplainX.ai: https://explainx.ai/blog/deepseek-v4-flash-vision-exp-multimodal-agent-august-2026
- Articulo de IWeaver.ai: https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
