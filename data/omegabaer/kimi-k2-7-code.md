# omegabaer/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en tareas de programación y flujos de trabajo agénticos, desarrollado por Moonshot AI. Se construye sobre Kimi K2.6 y está orientado a la resolución de tareas de ingeniería de software de horizonte largo, con mejoras sustanciales en la completitud de tareas de extremo a extremo y una reducción de aproximadamente el 30 % en el uso de tokens de razonamiento respecto a su predecesor.

El modelo cuenta con 1 billón de parámetros totales y 32 000 millones de parámetros activos por token, distribuidos en 384 expertos con 8 expertos seleccionados por token y un experto compartido. Emplea atención Multi-head Latent Attention (MLA) con 64 cabezas de atención, 61 capas (una densa), dimensión de atención de 7168 y dimensión oculta MoE de 2048 por experto. La longitud de contexto alcanza los 256 000 tokens y el vocabulario es de 160 000 entradas. Incorpora además un codificador visual MoonViT de 400 millones de parámetros, lo que habilita entrada image-text-to-text.

La relevancia actual del modelo radica en su enfoque específico hacia agentes de código autónomos: soporta razonamiento multi-paso, uso de herramientas y MCP, y se evalúa en benchmarks propios orientados a tareas reales de ingeniería. El repositorio de Hugging Face corresponde a un espejo publicado por el usuario `omegabaer` bajo licencia "modified-mit", con pesos en safetensors y formato compressed-tensors, y un tamaño de repositorio de 595,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA, activación SwiGLU y codificador visual MoonViT |
| Parametros totales | 1 billón (1.026.879.376.368 según safetensors) |
| Parametros activos | 32 000 millones |
| Longitud de contexto | 256 000 tokens (262 144 en evaluaciones) |
| Tipos de cuantizacion | no disponible (el repositorio usa formato compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors, compressed-tensors |
| Capas totales | 61 (1 densa) |
| Dimension de atencion | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160 000 |
| Parametros del codificador visual | 400 millones |
| Tamano del repositorio | 595,2 GB |

## Arquitectura y entrenamiento

Kimi K2.7 Code es un transformer de tipo Mixture-of-Experts con 61 capas, de las cuales solo una es densa. La atención se implementa mediante Multi-head Latent Attention (MLA), una variante que comprime las representaciones de clave y valor para reducir el coste de memoria en contextos largos, lo que resulta coherente con su ventana de 256 000 tokens. La capa MoE distribuye 384 expertos con 8 seleccionados por token más un experto compartido, con una dimensión oculta de 2048 por experto y una dimensión de atención de 7168. La función de activación es SwiGLU.

El modelo se construye sobre Kimi K2.6 y está afinado específicamente para tareas de código y flujos agénticos de horizonte largo. Según la model card, mejora la finalización de tareas de extremo a extremo en flujos complejos de ingeniería de software y reduce el uso de tokens de razonamiento en aproximadamente un 30 % respecto a K2.6, lo que se traduce en una mayor eficiencia en la generación de cadenas de pensamiento. Incorpora un codificador visual MoonViT de 400 millones de parámetros que habilita la modalidad image-text-to-text. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) habilitado por defecto en las evaluaciones.
- Generación y comprensión de código en más de 10 lenguajes de programación principales, con énfasis en servicios backend, infraestructura y rendimiento.
- Capacidades agénticas de horizonte largo: resolución de tareas de ingeniería de software de extremo a extremo y razonamiento multi-paso.
- Soporte de tool calling y de protocolo MCP (Model Context Protocol), evaluado en los benchmarks MCP Atlas y MCP Mark Verified.
- Capacidades multimodales de imagen y texto gracias al codificador visual MoonViT.
- Integración con CLI de código (Kimi Code CLI) para flujos de trabajo de agente en terminal.
- Eficiencia de tokens de razonamiento mejorada: aproximadamente un 30 % menos de thinking-tokens que Kimi K2.6.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código autónomo en terminal: el modelo puede operar mediante Kimi Code CLI con modo de pensamiento y contexto de 262 144 tokens para resolver tareas de refactorización y corrección de errores en repositorios completos, manteniendo el estado a lo largo de múltiples pasos.
- Resolución de incidencias en producción: gracias a sus resultados en benchmarks orientados a incidentes reales (Kimi Code Bench v2, Program Bench), es adecuado para diagnosticar y proponer parches en servicios backend e infraestructura.
- Integración en pipelines de CI/CD con tool calling: el soporte de MCP y function calling permite al modelo invocar herramientas de build, test y despliegue dentro de flujos automatizados.
- Asistente de ingeniería de software multi-turno: su ventana de 256 000 tokens permite mantener conversaciones extensas con contexto de múltiples archivos y documentación técnica sin truncamiento.
- Automatización de tareas de mantenimiento de código en más de 10 lenguajes: útil para migraciones, actualización de dependencias y generación de pruebas en stacks de producción heterogéneos.
- Análisis de capturas de pantalla e interfaces: la modalidad image-text-to-text permite interpretar diagramas, errores visuales o interfaces para generar código o diagnósticos a partir de imágenes.
- Evaluación y benchmarking interno de agentes de código: el modelo puede emplearse como referencia en la construcción de suites de evaluación propias para agentes de ingeniería.

## Benchmarks y rendimiento

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

Condiciones de evaluación según la model card: Kimi K2.7 Code y K2.6 se evaluaron con thinking mode habilitado mediante Kimi Code CLI, temperatura 1,0, top-p 0,95 y contexto de 262 144 tokens; GPT-5.5 en Codex con modo xhigh y Opus 4.8 en Claude Code con modo xhigh.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1 billón de parámetros totales y pesos en safetensors de aproximadamente 595 GB, la inferencia en precisión completa requiere múltiples GPUs de alta gama. No se dispone de estimaciones oficiales de VRAM por cuantización en la información proporcionada.
- GPU recomendadas: para servir el modelo completo se requieren clústeres con GPUs de centro de datos (A100, H100, H200); no se especifican configuraciones exactas en la información disponible.
- Viabilidad en GPU de consumo: no es viable en GPUs de consumo individuales (RTX 4090, etc.) dado el tamaño del repositorio y el número de parámetros; requeriría cuantizaciones extremas y múltiples dispositivos, sin datos oficiales al respecto.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y formato compressed-tensors; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Kimi Code Bench v2 | MCP Mark Verified |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1 T (32 B activos) | 256 K | modified-mit | 62,0 | 81,1 |
| Kimi K2.6 | no disponible | no disponible | no disponible | 50,9 | 72,8 |
| GPT-5.5 | no disponible | no disponible | propietaria | 69,0 | 92,9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 67,4 | 76,4 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus resultados en los benchmarks de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se cuantifica en la model card. En tareas de código puede producir APIs o dependencias inexistentes.
- Limitaciones de contexto o idioma: la ventana es de 256 000 tokens; no se especifican los idiomas soportados ni su cobertura.
- Restricciones de licencia: la licencia es "modified-mit" (etiquetada como "other" en Hugging Face), por lo que deben revisarse los términos exactos antes de un uso comercial; el repositorio es un espejo de un tercero (`omegabaer`), no la publicación oficial de Moonshot AI.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su autor no es la organización oficial; conviene verificar la integridad de los pesos frente a la fuente original de Moonshot AI.
- El formato compressed-tensors puede requerir versiones específicas de librerías para su carga; no se detallan los tipos de cuantización soportados.
- Los benchmarks propios (Kimi Code Bench v2, Program Bench, MLS Bench Lite, Kimi Claw 24/7 Bench) son internos del desarrollador y pueden no ser directamente comparables con evaluaciones de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omegabaer/Kimi-K2.7-Code
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Página de Kimi Code: https://www.kimi.com/code
- Página principal de Moonshot AI: https://www.moonshot.ai
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Licencia del modelo: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
