# omegamentiszug/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programación y flujos de trabajo agénticos, desarrollado por Moonshot AI. Se construye sobre Kimi K2.6 y está específicamente afinado para tareas de ingeniería de software de horizonte largo, con mejoras en la finalización de tareas de extremo a extremo y una reducción de aproximadamente el 30% en el uso de tokens de razonamiento respecto a su predecesor. El repositorio analizado (`omegamentiszug/Kimi-K2.7-Code`) es una publicación de terceros que redistribuye los pesos del modelo original.

La arquitectura es un transformer MoE con 1 billón (1T) de parámetros totales y 32B activos por token, 61 capas (1 densa), 384 expertos con 8 seleccionados por token más 1 experto compartido, dimensión de atención de 7168, 64 cabezas de atención y vocabulario de 160K. Emplea atención MLA (Multi-head Latent Attention), activación SwiGLU y un codificador visual MoonViT de 400M de parámetros, lo que habilita la modalidad image-text-to-text. La longitud de contexto es de 256K tokens.

El modelo resulta relevante porque combina un contexto muy amplio, capacidades multimodales y un enfoque agéntico con soporte de tool calling, orientado a tareas reales de desarrollo de software. Su tamaño (1T de parámetros, repo de 595,2 GB) lo sitúa en la categoría de modelos de frontera que requieren infraestructura de despliegue considerable, no aptos para GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, atención MLA, SwiGLU |
| Parametros totales | 1.026.879.376.368 (1T) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible (el repo usa `compressed-tensors`, sin detalle de esquemas) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como `other` / `modified-mit`) |
| Formato de pesos | safetensors (con `compressed-tensors`), `custom_code` |
| Capas | 61 (1 densa) |
| Dimension de atencion | 7168 |
| Dimension MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Expertos | 384 (8 seleccionados por token + 1 compartido) |
| Vocabulario | 160K |
| Codificador visual | MoonViT (400M parametros) |
| Tamano del repo | 595,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Experts con 61 capas (una de ellas densa), 384 expertos en total, de los cuales se seleccionan 8 por token más un experto compartido. La dimensión de atención es de 7168 y la dimensión interna de cada experto MoE es de 2048, con 64 cabezas de atención. Utiliza Multi-head Latent Attention (MLA), una variante de atención que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache, lo que resulta crítico con una ventana de 256K tokens. La función de activación es SwiGLU y el vocabulario alcanza los 160K tokens.

El modelo incorpora un codificador visual MoonViT de 400M de parámetros que lo habilita para tareas image-text-to-text. Según la model card, K2.7 Code se construye sobre Kimi K2.6 con mejoras sustanciales en tareas de codificación de horizonte largo y una reducción de aproximadamente el 30% en el uso de tokens de pensamiento. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) habilitado por defecto en las evaluaciones.
- Codificación y tareas de ingeniería de software de horizonte largo, con énfasis en finalización de tareas de extremo a extremo.
- Capacidades agénticas: soporte de tool calling y function calling, con evaluación en benchmarks como MCP Atlas y MCP Mark Verified.
- Razonamiento multi-paso para flujos de agentes (Kimi Claw 24/7 Bench).
- Procesamiento multimodal image-text-to-text mediante el codificador MoonViT.
- Eficiencia de tokens de razonamiento mejorada (~30% menos que K2.6).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede ejecutar tareas de ingeniería de software de extremo a extremo en pipelines agénticos, apoyándose en sus 256K tokens de contexto para mantener el estado de repositorios completos y múltiples archivos.
- Integración en asistentes de CLI para desarrollo: su soporte de tool calling y su modo de pensamiento lo hacen adecuado para herramientas tipo CLI que invocan comandos, editan archivos y ejecutan tests de forma iterativa.
- Resolución de incidencias en producción: con contexto largo y capacidades agénticas, puede analizar trazas, logs y código de servicios backend para diagnosticar y proponer parches.
- Revisión de código y refactorización a gran escala: la ventana de 256K permite cargar módulos completos y realizar cambios coherentes entre archivos.
- Automatización de tareas sobre servidores MCP: su rendimiento en MCP Atlas y MCP Mark Verified lo hace apto para orquestar herramientas externas a través del protocolo Model Context Protocol.
- Análisis de capturas e interfaces: gracias al codificador MoonViT, puede procesar imágenes junto con texto, útil para depurar interfaces o interpretar diagramas técnicos.
- Migración y modernización de bases de código legacy: el contexto extendido y el razonamiento multi-paso permiten planificar y ejecutar cambios en proyectos grandes.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking mode, temperatura 1.0, top-p 0.95, contexto de 262.144 tokens):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1T de parámetros totales, incluso en cuantizaciones agresivas el modelo no cabe en GPUs de consumo; el repo ocupa 595,2 GB en safetensors/comprimido.
- GPU recomendadas: no especificadas en la información; por tamaño, requiere clústeres multi-GPU de clase datacenter (A100, H100, H200) con paralelismo tensorial y de expertos.
- No cabe en GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: la model card no detalla frameworks de serving; el repo declara `transformers` con `custom_code` y `compressed-tensors`. No se confirman soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified-mit | Enfoque en codificación agéntica, multimodal (MoonViT) |
| Kimi K2.6 | 1T totales / 32B activos (según predecesor) | no disponible | no disponible | Base de K2.7; menor rendimiento en benchmarks de codificación |
| GPT-5.5 | no disponible | no disponible | propietaria | Mejor puntuación en la mayoría de benchmarks de la tabla |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | Competitivo en codificación y agentes; propietario |

Los datos de parámetros, contexto y licencia de GPT-5.5 y Claude Opus 4.8 no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`omegamentiszug/Kimi-K2.7-Code`) es una publicación de terceros con 0 descargas y 0 likes; no es el repositorio oficial de Moonshot AI, lo que plantea riesgos de integridad y procedencia de los pesos.
- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación no cuantificado en la información disponible.
- Idiomas soportados no especificados; el rendimiento multilingüe no está documentado.
- La licencia es `modified-mit` (etiquetada como `other`); deben revisarse los términos exactos del archivo LICENSE antes de cualquier uso comercial.
- El tamaño del modelo (1T de parámetros, repo de 595,2 GB) impide su despliegue en hardware de consumo y exige infraestructura de datacenter.
- Los benchmarks presentados son en su mayoría internos del autor (Kimi Code Bench v2, MLS Bench Lite, Kimi Claw 24/7 Bench), lo que limita la comparabilidad independiente.
- No se detallan los datos de entrenamiento ni los procesos de alineación, lo que dificulta evaluar riesgos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omegamentiszug/Kimi-K2.7-Code
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Página de Kimi Code: https://www.kimi.com/code
- Homepage de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
