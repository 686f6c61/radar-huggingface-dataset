# CollectionStudio/Devstral-Small-2-24B-Instruct-2512

## Resumen

Devstral Small 2 24B Instruct 2512 es un modelo de lenguaje orientado a ingeniería de software y uso agéntico, distribuido en este repositorio por el usuario CollectionStudio como reempaquetado en FP8 del modelo de Mistral AI. Está construido sobre `mistralai/Mistral-Small-3.1-24B-Base-2503` y cuenta con 24.011.361.280 parámetros (24B), una ventana de contexto de 256.000 tokens y licencia Apache 2.0, lo que permite uso comercial y modificación.

Su propuesta de valor es ejecutar tareas de agente de software (explorar repositorios, editar múltiples archivos, invocar herramientas) con un tamaño que la propia model card sitúa al alcance de una única RTX 4090 o de un Mac con 32 GB de RAM. Frente a Devstral Small 1.1 incorpora capacidades de visión, mejor generalización a distintos entornos de código y el uso de escalado de RoPE al estilo de Llama 4 junto con temperatura de softmax en la atención.

Es relevante porque ofrece un 68,0 % en SWE-bench Verified con solo 24B de parámetros, un resultado cercano al de modelos de 230B-480B en esa misma prueba, lo que lo convierte en candidato para despliegues locales o en infraestructura propia donde no se quiere enviar código a APIs externas. Conviene tener en cuenta que este repositorio concreto no es la publicación oficial de Mistral: acumula 0 descargas y 0 likes en el momento de la consulta y no documenta idiomas soportados ni resultados de benchmarks propios más allá de los publicados por el autor original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (etiqueta `mistral3` en HuggingFace), derivada de Mistral Small 3.1 24B; usa rope-scaling al estilo de Llama 4 y temperatura de softmax en la atención |
| Parámetros totales | 24.011.361.280 (24B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256.000 tokens (256k) |
| Tipos de cuantización | FP8 (formato en el que se distribuye este repositorio); no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en FP8; no se documentan GGUF ni otros formatos |
| Modelo base | mistralai/Mistral-Small-3.1-24B-Base-2503 |
| Biblioteca de inferencia | vLLM (`library_name: vllm`) |
| Tamaño del repositorio | 51,6 GB |
| Autor del repositorio | CollectionStudio (reempaquetado de comunidad, no la publicación oficial de Mistral AI) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Mistral Small 3.1 (etiqueta `mistral3`), un transformer decoder-only adaptado a entrada multimodal: la model card confirma capacidades de visión para "analizar imágenes y aportar conclusiones basadas en contenido visual, además de texto". La innovación técnica declarada respecto a la versión anterior es doble: por un lado, escalado de RoPE siguiendo el enfoque introducido por Llama 4; por otro, el uso de temperatura de softmax en la atención, referenciado en el artículo *Scalable-Softmax Is Superior for Attention* (arXiv:2501.19399, incluido en las etiquetas del repositorio). Como predecesor directo se cita `mistralai/Devstral-Small-2507` (Devstral Small 1.1).

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Sí se indica que es una versión Instruct ajustada para seguir instrucciones y para tareas de chat, uso agéntico y SWE, y que este repositorio concreto se distribuye ya cuantizado a FP8. Los pesos proceden de una cuantización del modelo base indicada en las etiquetas (`base_model:quantized`), sin que se documente el proceso de calibración empleado.

## Capacidades

- Codificación agéntica: uso de herramientas para explorar bases de código, editar varios archivos y operar como motor de agentes de ingeniería de software.
- Integración con andamiajes de agente: Mistral Vibe (CLI recomendada), Cline, Kilo Code, Claude Code, OpenHands y SWE Agent.
- Capacidades de visión: análisis de imágenes y generación de respuestas basadas en contenido visual, además de texto.
- Contexto largo: ventana de 256.000 tokens, adecuada para repositorios completos o conversaciones multi-turno extensas.
- Tareas de terminal y automatización: evaluado en Terminal Bench 2, lo que implica manejo de comandos y flujos de trabajo en línea de comandos.
- Multilingüismo en código: evaluado en SWE-bench Multilingual con un 55,7 %, lo que indica capacidad de trabajo sobre repositorios con código y enunciados en varios idiomas (no se publica la lista de lenguajes naturales soportados).
- Seguimiento de instrucciones: ajuste Instruct orientado a chat y tareas guiadas.
- No se documenta en la información disponible soporte explícito de function calling con un esquema concreto, audio, ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue junto con el árbol del proyecto y editar varios archivos hasta dejar el parche aplicado; su 68,0 % en SWE-bench Verified lo sitúa como opción realista para este flujo con andamiajes como OpenHands o SWE Agent.
- Revisión de código en pipelines de CI/CD: con 256k tokens de contexto puede ingerir un diff amplio más el código circundante y generar comentarios o correcciones directamente en la revisión de un pull request.
- Asistente de terminal local: desplegado con Mistral Vibe sobre una estación de trabajo con una RTX 4090, permite consultar y modificar el proyecto sin enviar código a servicios externos, algo crítico en entornos con requisitos de confidencialidad.
- Refactorizaciones multi-archivo: tareas como renombrar una API interna, cambiar la firma de una función en toda la base o migrar un patrón obsoleto, donde la edición coordinada de ficheros es el cuello de botella.
- Automatización de operaciones en terminal: uso en Terminal Bench 2 sugiere idoneidad para tareas de instalación, ejecución de suites de tests, diagnóstico de fallos de build y corrección iterativa de errores de compilación.
- Migración a partir de material visual: gracias a la visión, puede interpretar capturas de pantalla de interfaces, diagramas de arquitectura o imágenes de especificaciones y traducirlas a código o a cambios concretos.
- Onboarding sobre bases de código heredadas: combinando contexto largo y llamadas a herramientas de búsqueda, permite generar mapas del repositorio, localizar puntos de entrada y documentar módulos sin intervención manual.
- Asistente de programación integrado en IDE: uso mediante Cline o Kilo Code para autocompletado contextual, explicación de fragmentos y generación de tests unitarios sobre el código abierto en el editor.

## Benchmarks y rendimiento

Resultados publicados en la model card (los valores de los modelos competidores se basan en cifras reportadas públicamente por sus autores):

| Modelo | Tamaño (B) | SWE-bench Verified | SWE-bench Multilingual | Terminal Bench 2 |
|---|---|---|---|---|
| Devstral Small 2 | 24 | 68,0 % | 55,7 % | 22,5 % |
| Devstral 2 | 123 | 72,2 % | 61,3 % | 32,6 % |
| GLM 4.6 | 355 | 68,0 % | -- | 24,6 % |
| Qwen 3 Coder Plus | 480 | 69,6 % | 54,7 % | 25,4 % |
| MiniMax M2 | 230 | 69,4 % | 56,5 % | 30,0 % |
| Kimi K2 Thinking | 1000 | 71,3 % | 61,1 % | 35,7 % |
| DeepSeek v3.2 | 671 | 73,1 % | 70,2 % | 46,4 % |
| GPT 5.1 Codex High | -- | 73,7 % | -- | 52,8 % |
| GPT 5.1 Codex Max | -- | 77,9 % | -- | 60,4 % |
| Gemini 3 Pro | -- | 76,2 % | -- | 54,2 % |
| Claude Sonnet 4.5 | -- | 77,2 % | 68,0 % | 42,8 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión para este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio se distribuye en FP8, por lo que los 24B de parámetros ocupan aproximadamente 24 GB solo en pesos; hay que sumar la caché KV, que con 256k tokens de contexto puede ser muy elevada.
- La model card afirma que el modelo es lo bastante ligero para ejecutarse en una única RTX 4090 o en un Mac con 32 GB de RAM unificada. En la RTX 4090 (24 GB) el margen es muy ajustado, por lo que conviene limitar la longitud de contexto o el número de secuencias concurrentes.
- GPU recomendadas: RTX 4090 para uso individual; para producción con contexto largo o varias peticiones simultáneas son más adecuadas A100 80 GB, H100 o L40S. No se especifican requisitos oficiales adicionales.
- Formatos de despliegue documentados: vLLM (biblioteca declarada del repositorio) con los safetensors en FP8. No se confirman en la información disponible soporte para llama.cpp, Ollama, TGI ni pesos GGUF.
- Se puede usar alternativamente la API de Mistral o la CLI Mistral Vibe para evitar el coste de hardware local.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral Small 2 | 24B | 256k | 68,0 % | Apache 2.0 | Pesos abiertos (este repositorio, FP8) |
| Devstral 2 | 123B | no disponible | 72,2 % | no disponible | Pesos abiertos según la model card |
| Qwen 3 Coder Plus | 480B | no disponible | 69,6 % | no disponible | no disponible |
| GLM 4.6 | 355B | no disponible | 68,0 % | no disponible | no disponible |
| MiniMax M2 | 230B | no disponible | 69,4 % | no disponible | no disponible |

La comparación relevante es de eficiencia: Devstral Small 2 iguala o supera en SWE-bench Verified a modelos entre 10 y 20 veces mayores (GLM 4.6, Qwen 3 Coder Plus, MiniMax M2) a costa de un rendimiento claramente inferior en Terminal Bench 2 (22,5 % frente a 24,6-30,0 % de esos mismos modelos) y de quedar por debajo de los modelos frontera (Claude Sonnet 4.5, Gemini 3 Pro, GPT 5.1 Codex) en todas las pruebas. Los datos de contexto, licencia y disponibilidad de los competidores no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de comunidad: no es la publicación oficial de Mistral AI; presenta 0 descargas y 0 likes, no incluye pipeline declarado y ha sido reempaquetado por un tercero, por lo que se recomienda verificar la integridad de los pesos antes de usarlos en producción.
- Los benchmarks proceden de la model card del autor original y mezclan resultados propios con cifras reportadas públicamente por terceros; las condiciones de evaluación de cada fila pueden no ser homogéneas.
- Riesgo de alucinación: como cualquier LLM, puede generar APIs inexistentes, importaciones erróneas o parches que compilan pero no resuelven el problema; requiere tests automáticos y supervisión humana antes de aplicar cambios.
- La cuantización a FP8 puede introducir una degradación pequeña pero no cuantificada respecto a los pesos en precisión completa; no se documentan mediciones comparativas.
- No se documenta la lista de idiomas naturales soportados ni el comportamiento fuera del inglés; el 55,7 % en SWE-bench Multilingual se refiere a código, no a calidad de conversación multilingüe.
- Contexto de 256k: el coste de caché KV asociado hace inviable aprovecharlo completo en GPUs de 24 GB, y la calidad en el extremo superior de la ventana no está documentada.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni filtros de seguridad aplicados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la model card original incluye un aviso de tratamiento de datos personales enlazado a la política de privacidad de Mistral; conviene revisar los términos aplicables a la distribución original.
- El rendimiento en tareas de terminal (22,5 % en Terminal Bench 2) es notablemente inferior al de modelos de mayor tamaño, por lo que no es la mejor opción para automatización de shell compleja y de varios pasos.
- Capacidades de visión no cuantificadas: no hay benchmarks publicados en la información disponible para validar la fiabilidad del análisis de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/Devstral-Small-2-24B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Predecesor (Devstral Small 1.1): https://huggingface.co/mistralai/Devstral-Small-2507
- Artículo sobre atención (Scalable-Softmax Is Superior for Attention): https://arxiv.org/abs/2501.19399
- Mistral Vibe (CLI recomendada): https://github.com/mistralai/mistral-vibe
- Cline: https://github.com/cline/cline
- Kilo Code: https://github.com/Kilo-Org/kilocode
- Claude Code: https://github.com/anthropics/claude-code
- OpenHands: https://github.com/All-Hands-AI/OpenHands/tree/main
- SWE Agent: https://github.com/SWE-agent/SWE-agent
- Instalación de Mistral Vibe: https://mistral.ai/vibe/install.sh
- Política de privacidad de Mistral: https://mistral.ai/terms/
- Guía de inicio de Mistral: https://docs.mistral.ai/getting-started/quickstart/#account-setup
- Contacto comercial de Mistral: https://mistral.ai/contact/
