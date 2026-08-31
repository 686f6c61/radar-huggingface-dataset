# deepseek-ai/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4, desarrollado por DeepSeek AI. Se construye sobre la arquitectura de DeepSeek-V4-Flash e incorpora un codificador visual y un alineador, con entrenamiento continuado para desbloquear capacidades de comprensión de imágenes. El modelo está diseñado para tareas de agente multimodal, como análisis de capturas de pantalla, gráficos y documentos, manteniendo a la vez un rendimiento comparable al de su predecesor solo texto en tareas de agente textual.

Con 304.646.824.126 parámetros (aproximadamente 304,6 mil millones), se trata de un modelo de gran tamaño con arquitectura de mezcla de expertos (MoE), atención DFlash, Hyper-Connections y un módulo de decodificación especulativa DSpark. El repositorio incluye el tokenizador, la codificación de prompts y una implementación mínima de inferencia en PyTorch que cubre el encoder visual, el alineador, la atención DFlash, MoE, Hyper-Connections y la ruta de avance DSpark. Se distribuye bajo licencia MIT y está disponible tanto en Hugging Face como a través de la API de DeepSeek y de AI Gateway de Vercel.

La relevancia actual del modelo radica en que es el primer lanzamiento multimodal de la serie V4, con mejoras sustanciales en capacidades de agente multimodal respecto a DeepSeek-V4-Flash-0731, como reflejan los benchmarks ApexBench (36,5 frente a 26,2) y Agents' Last Exam (27,3 frente a 25,2). Su naturaleza experimental y su tamaño lo orientan a entornos de investigación y despliegue con infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención DFlash, Hyper-Connections, vision encoder y aligner, módulo DSpark de decodificación especulativa |
| Parametros totales | 304.646.824.126 (~304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 y 8-bit indicados en los metadatos del repositorio; no se detallan más opciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con archivo de índice model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con atención DFlash, un mecanismo de atención propio de DeepSeek, y Hyper-Connections, un esquema de conexiones residuales alternativo. Incorpora además un módulo DSpark de decodificación especulativa, presente también en DeepSeek-V4-Flash-0731, que acelera la generación. Para la parte visual, se añade un vision encoder y un aligner que proyectan las representaciones de imagen al espacio del modelo de lenguaje. El repositorio incluye una implementación de referencia en PyTorch que cubre todos estos componentes.

El entrenamiento consistió en un entrenamiento continuado sobre la base de DeepSeek-V4-Flash, con el objetivo de añadir comprensión visual sin degradar las capacidades de agente textual. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo se describe como experimental, lo que sugiere que es una versión de investigación sujeta a cambios.

## Capacidades

- Comprensión de imágenes: análisis de capturas de pantalla, gráficos, diagramas y documentos con contenido visual.
- Tareas de agente multimodal: ejecución de acciones basadas en entradas visuales y textuales, evaluado en ApexBench y Agents' Last Exam.
- Tareas de agente textual: razonamiento multi-step, uso de herramientas y ejecución de tareas complejas, con resultados en Terminal Bench 2.1, NL2Repo, Cybergym, DeepSWE, Toolathlon-Verified, DSBench-Hard y AutomationBench.
- Tool calling y function calling: soporte para invocación de herramientas, evaluado en Toolathlon-Verified (75,9).
- Razonamiento con esfuerzo configurable: el modelo admite niveles de razonamiento (el benchmark usa el nivel "max" con temperature 1,0 y top_p 0,95).
- Codificación de prompts flexible: soporta tanto bloques de contenido en formato OpenAI-style JSON como la notación compacta TXT `<image>path</image>`, que producen prompts y token IDs idénticos.
- Capacidades multilingües: no se han publicado datos al respecto.

## Casos de uso

- Agentes de codificación con visión: el modelo puede analizar capturas de pantalla de interfaces de usuario, diagramas de arquitectura o errores visuales en aplicaciones, y generar o corregir código en consecuencia. Está integrado en AI Gateway de Vercel para agentes como Claude Code, Codex, OpenCode, Cursor y Pi.
- Análisis de gráficos y visualizaciones de datos: dado un gráfico o dashboard, el modelo extrae tendencias, valores y conclusiones, útil para informes automáticos o asistentes de business intelligence.
- Extracción de información de documentos (OCR semántico): puede leer texto de imágenes, capturas y documentos escaneados, y estructurarlo en formatos como JSON o tablas, superando al OCR tradicional al interpretar el contexto.
- Automatización de navegador web: con capturas de pantalla como entrada, el modelo puede decidir acciones (clic, navegación, relleno de formularios) en tareas de automatización de UI, aprovechando su capacidad de agente multimodal.
- Testing visual de aplicaciones: comparación de capturas de pantalla esperadas y reales para detectar regresiones visuales, describiendo diferencias y sugiriendo correcciones.
- Asistente de soporte técnico con imágenes: el modelo puede recibir capturas de pantalla de errores o configuraciones del usuario y guiar la resolución paso a paso, combinando comprensión visual con razonamiento multi-turno.
- Análisis de documentos mixtos: procesamiento de informes que combinan texto, tablas e imágenes para generar resúmenes ejecutivos o extraer métricas clave.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, evaluados con DeepSeek Harness en modo mínimo como framework de agente, con nivel de razonamiento "max", temperature 1,0 y top_p 0,95:

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
| :--- | :---: | :---: | :---: |
| **Texto (capacidades de agente)** | | | |
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| **Multimodal (capacidades de agente)** | | | |
| ApexBench (Pass@1) | 36,5 | 26,2† | 39,4 |
| Agents' Last Exam | 27,3 | 25,2† | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

Nota: † indica que DeepSeek-V4-Flash-0731 ignora los elementos multimodales en la entrada para ApexBench y Agents' Last Exam.

## Requisitos de hardware

- El modelo tiene 304,6 mil millones de parámetros y el repositorio ocupa 167,8 GB, lo que indica pesos cuantizados (los metadatos mencionan fp8 y 8-bit).
- No se han publicado requisitos oficiales de VRAM. Con cuantización fp8, la memoria necesaria rondaría los 305 GB, lo que exige múltiples GPUs de centro de datos (por ejemplo, 4 o más A100/H100 de 80 GB).
- No es viable en GPUs de consumo (RTX 4090, etc.) ni siquiera con cuantización agresiva, dado el tamaño del modelo.
- El repositorio incluye una implementación mínima de inferencia en PyTorch con instrucciones de conversión de pesos y ejecución para prompts TXT y JSON.
- Al ser compatible con la librería transformers, puede desplegarse con frameworks como vLLM o TGI, aunque no se especifican oficialmente.
- La latencia y el throughput no se han publicado; el módulo DSpark de decodificación especulativa está diseñado para acelerar la generación.

## Comparativa con modelos similares

La comparación directa disponible en la model card es con DeepSeek-V4-Flash-0731 (misma familia, sin visión) y Opus-4.8 (modelo de Anthropic). No se dispone de datos de parámetros, contexto ni licencia de Opus-4.8 para una comparativa completa.

| Modelo | Parámetros | Visión | Licencia | ApexBench (Pass@1) | Terminal Bench 2.1 | Toolathlon-Verified |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | 304,6B | Sí | MIT | 36,5 | 83,9 | 75,9 |
| DeepSeek-V4-Flash-0731 | no disponible | No | no disponible | 26,2† | 82,7 | 70,3 |
| Opus-4.8 | no disponible | no disponible | no disponible | 39,4 | 85,0 | 76,2 |

El modelo Vision-Exp supera a su predecesor sin visión en todos los benchmarks de agente multimodal y en la mayoría de los de agente textual, aunque queda por detrás de Opus-4.8 en varios de ellos.

## Limitaciones y advertencias

- Modelo experimental: es una versión de investigación, no un lanzamiento estable, y puede presentar comportamientos impredecibles o cambios en versiones futuras.
- Tamaño y coste: con más de 300 mil millones de parámetros, la inferencia requiere infraestructura de centro de datos y un coste operativo elevado; no es adecuado para despliegues ligeros o edge.
- Datos de entrenamiento no publicados: se desconoce la composición del dataset, el número de tokens y si se aplicaron técnicas de alineación como RLHF o DPO, lo que dificulta evaluar sesgos.
- Idiomas no especificados: no se ha publicado información sobre los idiomas soportados ni sobre el rendimiento en lenguas distintas del inglés.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento con contextos largos sin datos oficiales.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o con entradas visuales ambiguas.
- Sesgos potenciales: al ser un modelo de gran escala entrenado con datos web, puede heredar sesgos sociales, culturales y de género; no se han publicado evaluaciones de sesgo.
- Licencia MIT: permite uso comercial, pero el coste de infraestructura y la naturaleza experimental limitan su aplicación en producción sin validación previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Modelo base DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Artículo de iweaver.ai sobre el modelo: https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Changelog de Vercel AI Gateway: https://vercel.com/changelog/deepseek-v4-flash-with-vision-now-available-on-ai-gateway
- Análisis de explainx.ai sobre benchmarks multimodales: https://explainx.ai/blog/deepseek-v4-flash-vision-exp-multimodal-agent-august-2026
