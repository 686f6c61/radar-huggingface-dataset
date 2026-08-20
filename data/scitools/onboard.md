# SciTools/OnBoard

## Resumen

SciTools/OnBoard es un repositorio de Hugging Face mantenido por Scientific Toolworks, Inc. que actúa como espejo estable de los modelos GGUF recomendados para la herramienta OnBoard, el módulo de inteligencia artificial local integrado en Understand, el analizador estático de código de SciTools. El repositorio no contiene un modelo único, sino siete cuantizaciones de 4 bits de distintos modelos base (OpenAI gpt-oss-120b, Alibaba Qwen3.6-35B-A3B, Qwen3.5 9B, Qwen3.5 2B, y Google Gemma 4 12B, E4B y E2B), todos bajo licencia Apache-2.0 y preparados para servirse con llama.cpp mediante el binario `ullama` que se distribuye con OnBoard.

La relevancia de este repositorio radica en que ofrece una selección curada y probada por SciTools sobre datos reales de proyectos de Understand: cada modelo se sometió a una prueba de chat (capacidad de responder preguntas sobre una base de código usando las herramientas de análisis de OnBoard) y a un benchmark de resúmenes de código que califica la precisión de las descripciones generadas frente al código fuente. Los modelos que no superaron estas pruebas (Qwen3.5 4B, Apriel 1.6, Gemma 4 31B y Phi-4 Mini) fueron eliminados del repositorio en agosto de 2026. El tamaño total del repositorio es de 140,1 GB, con un peso combinado de los archivos GGUF que suma aproximadamente 107,6 GB.

## Especificaciones técnicas

El repositorio contiene siete modelos independientes, cada uno con sus propias especificaciones. La siguiente tabla resume las características principales de cada archivo GGUF:

| Parámetro | gpt-oss-120b | Qwen3.6-35B-A3B | Gemma 4 12B | Qwen3.5 9B | Gemma 4 E4B | Gemma 4 E2B | Qwen3.5 2B |
|---|---|---|---|---|---|---|---|
| Arquitectura | MoE (no disponible) | MoE | Transformer denso | Transformer denso | Transformer denso | Transformer denso | Transformer denso |
| Parámetros totales | ~120 mil millones | ~35 mil millones (A3B activos) | ~12 mil millones | ~9 mil millones | ~4 mil millones | ~2 mil millones | ~2 mil millones |
| Parámetros activos | no disponible | 3 mil millones | — | — | — | — | — |
| Longitud de contexto | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Cuantización | Q4_K_M (2 partes) | UD-Q4_K_XL | Q4_K_M | Q4_K_M | Q4_K_M | Q4_K_M | Q4_K_M |
| Idiomas soportados | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Formato de pesos | GGUF | GGUF | GGUF | GGUF | GGUF | GGUF | GGUF |
| Tamaño del archivo | 63 GB (2 partes) | 22,4 GB | 7,1 GB | 5,7 GB | 5,0 GB | 3,1 GB | 1,3 GB |

Nota: el dato de 11.907.350.576 parámetros indicado en la ficha de Hugging Face corresponde probablemente al Gemma 4 12B, pero no se puede confirmar con la información disponible.

## Arquitectura y entrenamiento

El repositorio agrupa modelos de tres arquitecturas distintas. Los modelos de Google (Gemma 4 12B, E4B y E2B) son transformadores densos con atención completa, entrenados con técnicas de destilación y alineación por refuerzo de Google, con un enfoque en capacidades de chat y razonamiento. Los modelos de Alibaba (Qwen3.6-35B-A3B y Qwen3.5 9B/2B) usan la familia de arquitecturas Qwen, donde el modelo de 35 mil millones es una Mixture of Experts (MoE) con 3 mil millones de parámetros activos, mientras que los de 9 y 2 mil millones son densos. El modelo de OpenAI (gpt-oss-120b) es un MoE de gran escala de 120 mil millones de parámetros con un diseño de atención dispersa.

Todos los archivos han sido cuantizados a 4 bits: Q4_K_M para los modelos de hasta 12 mil millones de parámetros y la cuantización dinámica UD-Q4_K_XL de Unsloth para el modelo MoE grande, donde la calidad del cuantizado dinámico importa más. SciTools no modificó los pesos originales; se limitó a espejar los archivos GGUF de los repositorios de Unsloth. La política de cuantización y los ajustes de muestreo por modelo se documentan en el repositorio `stinb/ullama` (archivos `model_info.md` y `launcher/ullama-models.conf`).

El proceso de selección incluyó pruebas de calificación sobre datos reales de proyectos de Understand: una prueba de chat que mide la capacidad del modelo para responder preguntas sobre un código usando las herramientas de análisis de OnBoard, y un benchmark de resumen de código que evalúa la precisión de las descripciones generadas. Los modelos que no superaron estas pruebas fueron eliminados del repositorio.

## Capacidades

- **Análisis de código local**: todos los modelos están diseñados para ejecutarse en el entorno del cliente, sin depender de servicios externos de IA, lo que garantiza privacidad y control de los datos.
- **Chat sobre bases de código**: los modelos responden preguntas sobre un proyecto de software usando las herramientas de análisis de OnBoard (grafo de dependencias, métricas, estructura, etc.).
- **Generación de resúmenes de código**: producen descripciones de alto nivel de módulos, funciones o clases, evaluadas por precisión frente al código fuente.
- **Tool calling**: los modelos se integran con las herramientas de análisis de OnBoard mediante llamadas a funciones, lo que les permite consultar información estructural del código antes de responder.
- **Capacidades multilingües**: no se han publicado datos sobre los idiomas soportados en la información disponible, aunque los modelos base (Gemma, Qwen, gpt-oss) son multilingües por diseño.
- **Razonamiento de múltiples pasos**: los modelos de mayor tamaño (gpt-oss-120b, Qwen3.6-35B-A3B) muestran capacidad de razonamiento profundo al analizar código, según las pruebas de SciTools.
- **Chat general**: el modelo Gemma 4 12B destacó en las pruebas de chat, mostrando buenas capacidades conversacionales más allá del análisis de código.

## Casos de uso

- **Análisis de código legado**: un desarrollador puede preguntar a OnBoard "¿qué hace esta función?" o "¿dónde se usa esta variable?" y obtener respuestas contextualizadas basadas en el análisis estático del proyecto, gracias a la integración con las herramientas de Understand.
- **Generación de documentación automática**: los modelos producen resúmenes precisos de módulos y funciones, que pueden usarse para documentar proyectos con poco mantenimiento de documentación manual.
- **Onboarding de nuevos desarrolladores**: como sugiere la propia página de Onboarding de SciTools, los modelos ayudan a los nuevos ingenieros a entender la estructura de un código base grande, respondiendo preguntas sobre arquitectura y flujo de datos.
- **Revisión de código asistida**: los desarrolladores pueden pedir al modelo que identifique posibles problemas de diseño o dependencias no deseadas, usando las herramientas de análisis de OnBoard para fundamentar la respuesta.
- **Chat técnico en entornos aislados**: para empresas con políticas estrictas de privacidad, el modelo local permite consultas técnicas sobre código sin enviar datos a servidores externos, cumpliendo requisitos de cumplimiento normativo.
- **Resúmenes de cambios y commits**: los modelos pueden generar descripciones de los cambios realizados en un commit o rama, ayudando a mantener historiales de versiones legibles.

## Benchmarks y rendimiento

SciTools realizó pruebas de calificación propias sobre datos reales de proyectos de Understand, pero no publicó resultados numéricos detallados en la información disponible. La tabla siguiente resume las conclusiones cualitativas de esas pruebas:

| Modelo | Resultado de la prueba de chat | Resultado del benchmark de resúmenes | Nota adicional |
|---|---|---|---|
| gpt-oss-120b | No destacado | Más preciso en resúmenes de código | Rápido para su tamaño |
| Qwen3.6-35B-A3B | No destacado | Muy preciso | Mucho más rápido que otros modelos de su tamaño |
| Gemma 4 12B | Mejor resultado de todos los probados | No destacado | Mejor chat de la selección |
| Qwen3.5 9B | Buen resultado | No destacado | Profundiza más en el código antes de responder |
| Gemma 4 E4B | Buen resultado | No destacado | — |
| Gemma 4 E2B | Buen resultado | Buen resultado | Modelo predeterminado de OnBoard |
| Qwen3.5 2B | Resultado deficiente | Resultado muy bueno | Escribe resúmenes rápidos pero falla en chat |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **gpt-oss-120b**: requiere aproximadamente 128 GB de RAM para ejecutarse cómodamente con la cuantización Q4_K_M (63 GB de archivo). No cabe en GPUs de consumo estándar; se recomienda un servidor con varias A100/H100 o una máquina con RAM grande.
- **Qwen3.6-35B-A3B**: 22,4 GB de archivo, necesita aproximadamente 32-48 GB de RAM. Cabe en GPUs de 48 GB (A6000, RTX 6000 Ada) o en configuraciones de doble GPU.
- **Gemma 4 12B**: 7,1 GB de archivo, puede ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) o en sistemas con 16 GB de RAM con cuantización adicional.
- **Qwen3.5 9B**: 5,7 GB de archivo, funciona en GPUs de consumo de 8-12 GB de VRAM (RTX 3070/4060) y en Macs con 16 GB de RAM.
- **Gemma 4 E4B**: 5,0 GB, similar al Qwen3.5 9B, compatible con GPUs de 8 GB.
- **Gemma 4 E2B**: 3,1 GB, el modelo predeterminado de OnBoard, se ejecuta en cualquier GPU con 6 GB de VRAM o en sistemas con 8 GB de RAM.
- **Qwen3.5 2B**: 1,3 GB, puede ejecutarse en CPU sin GPU, con buena velocidad para resúmenes de código.

Todos los modelos se sirven con llama.cpp mediante el binario `ullia` incluido en OnBoard y Understand. También son compatibles con cualquier runtime que soporte GGUF (vLLM, Ollama, TGI, llama.cpp).

## Comparativa con modelos similares

Los modelos de este repositorio se comparan entre sí en las pruebas de SciTools. La siguiente tabla resume las diferencias clave:

| Modelo | Parámetros | Contexto | Rendimiento en código | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| gpt-oss-120b | ~120B | no disponible | Mejor en resúmenes | Apache-2.0 | Máquinas de 128 GB |
| Qwen3.6-35B-A3B | 35B (3B activos) | no disponible | Muy bueno, rápido | Apache-2.0 | Máquinas de 32-48 GB |
| Gemma 4 12B | ~12B | no disponible | Bueno en chat | Apache-2.0 | GPUs de 24 GB |
| Qwen3.5 9B | ~9B | no disponible | Bueno en chat y resúmenes | Apache-2.0 | GPUs de 8-16 GB |
| Gemma 4 E2B | ~2B | no disponible | Bueno en ambos | Apache-2.0 | Default de OnBoard |
| Qwen3.5 2B | ~2B | no disponible | Rápido en resúmenes | Apache-2.0 | CPU o GPUs de 4 GB |

La selección de SciTools se basa en el equilibrio entre calidad de respuesta y recursos necesarios. Los modelos de 2-4 mil millones son adecuados para equipos modestos, mientras que los de 35 y 120 mil millones requieren infraestructura dedicada.

## Limitaciones y advertencias

- **Riesgo de alucinación**: la propia model card de SciTools advierte que "AI is AI — every model gets things wrong" y recomienda tratar cualquier respuesta como un punto de partida, no como un hecho verificado.
- **Sesgos potenciales**: los modelos base (Gemma, Qwen, gpt-oss) pueden tener sesgos heredados de sus datos de entrenamiento, especialmente en idiomas distintos del inglés y en contextos culturales específicos.
- **Limitaciones de contexto**: no se han publicado datos sobre la longitud de contexto de los modelos, pero los archivos GGUF de 4-bit suelen admitir ventanas de 8K a 128K tokens según el modelo base.
- **Restricciones de licencia**: todos los modelos están bajo Apache-2.0, lo que permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- **Dependencia de llama.cpp**: los archivos están preparados específicamente para llama.cpp; aunque son compatibles con otros servidores GGUF, no se garantiza el comportamiento con otros backends.
- **Modelos eliminados**: los modelos que no superaron las pruebas de calificación (Qwen3.5 4B, Apriel 1.6, Gemma 4 31B, Phi-4 Mini) fueron eliminados del repositorio, lo que indica que la selección es dinámica y puede cambiar.
- **Rendimiento variable según el tamaño**: los modelos más pequeños (2B) muestran un rendimiento deficiente en chat, por lo que no son adecuados para tareas de conversación complejas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SciTools/OnBoard
- Página de OnBoard de SciTools: https://scitools.com/onboard
- Página de onboarding de Understand: https://scitools.com/onboarding
- Documentación de Understand AI Rebooted: https://support.scitools.com/support/solutions/articles/70000679777-understand-ai-rebooted
- Repositorio de la herramienta `ullama`: https://github.com/stinb/ullama
- Modelo gpt-oss-120b GGUF (fuente): https://huggingface.co/unsloth/gpt-oss-120b-GGUF
- Modelo Qwen3.6-35B-A3B GGUF (fuente): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Modelo Gemma 4 12B GGUF (fuente): https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
- Modelo Qwen3.5 9B GGUF (fuente): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Modelo Gemma 4 E4B GGUF (fuente): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Modelo Gemma 4 E2B GGUF (fuente): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Modelo Qwen3.5 2B GGUF (fuente): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
