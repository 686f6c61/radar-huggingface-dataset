# kingjones777/Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF

## Resumen

Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen-AgentWorld-35B-A3B, publicada por el usuario kingjones777. El modelo base es un transformer de tipo Mixture of Experts (MoE) de Qwen, con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B del nombre). El repositorio contiene una única build cuantizada con el esquema ROCm-FP4 del proyecto ROCmFPX, empaquetada en un fichero de 18,8 GB con cuantización Q4_0 optimizada para hardware AMD Strix Halo.

La relevancia de esta ficha no está en el modelo en sí, sino en el empaquetado: se trata de una build específica para el motor de inferencia Super Roc, orientado a la APU Ryzen AI Max+ 395 (gfx1151) con memoria unificada de 128 GB. El autor reporta métricas de rendimiento medidas en ese hardware concreto (hasta 1894 tok/s de prompt y 169 tok/s de generación con contexto de 8K) y un contexto cargado de 131.072 tokens. Es, por tanto, una distribución pensada para inferencia local en equipos de escritorio con GPU integrada de gran capacidad de memoria, no para servidores con GPUs discretas.

El checkpoint fuente no incluye pesos de visión, por lo que esta build es exclusivamente de texto. La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio tiene un volumen de descargas muy bajo (198) y ninguna interacción social, lo que sugiere una distribución de nicho orientada a la comunidad de Strix Halo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer (modelo base Qwen) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B (según nomenclatura A3B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medición reportada) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (build única: Qwen-AgentWorld-35B-A3B-Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | No disponible (el autor no declara listado de idiomas; la medición de perplejidad se hizo sobre un documento técnico en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen-AgentWorld-35B-A3B es una arquitectura Mixture of Experts de Qwen con 34.660 millones de parámetros totales y, según la convención de nombres, unos 3.000 millones activos por token. La model card de esta build no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo. Tampoco se documentan innovaciones de atención (linear attention, decodificación especulativa en el modelo base) más allá de la mención a un "drafter" desactivado en las mediciones de Super Roc.

La contribución técnica de esta ficha es la cuantización: el autor aplica el formato ROCm-FP4 de ROCmFPX sobre una cuantización Q4_0 con calibración imatrix (importancia matricial), generando un GGUF de 18.797.590.976 bytes. El resultado se ejecuta en el motor Super Roc, un fork de llama.cpp/ggml orientado a ROCm y a la arquitectura gfx1151 de Strix Halo. El autor reporta una perplejidad de 7,51 sobre un documento técnico en inglés de 11.000 tokens con contexto de 4096, como indicador de la degradación introducida por la cuantización.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Razonamiento multi-paso y uso como agente: el nombre AgentWorld y las pruebas de tool calling reportadas (7/8 en modo required y 7/8 en modo auto) indican soporte de llamadas a herramientas.
- Modo "thinking" configurable: desactivado por defecto en el comando de ejemplo, activable por petición mediante chat_template_kwargs.enable_thinking.
- Generación de código: el autor mide rendimiento específico con dos prompts de código (71,8 tok/s de media).
- Compatibilidad con endpoints compatibles con la API de OpenAI (tag endpoints_compatible).
- Procesamiento de contexto largo: carga hasta 131.072 tokens con caché de prompt (se reporta reutilización de 6961 de 6986 tokens en el segundo turno).
- Capacidades de visión: no disponibles; el checkpoint fuente no incluye pesos de visión y la build es solo texto.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de código local en estación de trabajo Strix Halo: el modelo puede generar código con un throughput medido de 71,8 tok/s y soporta tool calling, lo que permite integrarlo en flujos de edición asistida o revisión de parches sin depender de la nube.
- Agente autónomo con contexto largo: con 131.072 tokens de ventana y caché de prompt, es adecuado para tareas de análisis de repositorios completos, auditoría de documentación extensa o seguimiento de conversaciones multi-turno largas.
- Automatización de tareas con function calling: las pruebas reportadas (7 de 8 llamadas correctas en modo required y auto) lo hacen utilizable en pipelines de orquestación de herramientas, aunque con una tasa de fallo no despreciable que exige validación y reintentos.
- Inferencia local en hardware con memoria unificada: al ocupar 18,8 GB en Q4_0, cabe holgadamente en los 128 GB de la APU Ryzen AI Max+ 395 y deja espacio para el contexto KV, lo que permite desplegarlo en un equipo de sobremesa sin GPU discreta.
- Servicio de chat interno compatible con OpenAI: mediante superroc serve o Lemonade, se puede exponer como endpoint local para aplicaciones que ya consumen la API de OpenAI, sin coste por token.
- Procesamiento por lotes de documentos técnicos: la perplejidad medida sobre documentación técnica en inglés (7,51) sugiere un comportamiento aceptable en resumen y extracción de información de textos especializados, siempre con verificación humana.
- Experimentación e investigación en cuantización: sirve como banco de pruebas para evaluar el impacto de ROCm-FP4 frente a otras cuantizaciones Q4 en tareas de agente.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos medidos disponibles son de rendimiento de inferencia y de calidad aproximada:

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad | 7,51 | Documento técnico en inglés de 11K tokens, contexto 4096 |
| Carga del modelo | 20 s | Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 |
| Prompt tok/s (p1k) | 1799,9 | Una petición simultánea |
| Prompt tok/s (p8k) | 1894,2 | Una petición simultánea |
| Generación tok/s (p1k) | 71,83 | Una petición simultánea |
| Generación tok/s (p8k) | 169,03 | Una petición simultánea |
| Generación de código tok/s | 71,8 | Media de 2 prompts de código |
| Tool calls (required / auto) | 7/8 / 7/8 | Pruebas del autor |
| Caché de prompt, turno 2 | 6961 / 6986 tokens | Reutilización de caché |
| Contexto cargado | 131.072 tokens | — |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 18,8 GB para los pesos en Q4_0 ROCm-FP4, más la memoria del contexto KV. Con 131.072 tokens de contexto la huella adicional puede ser considerable; el autor no reporta el consumo total de memoria con contexto completo.
- GPU recomendadas: el autor valida exclusivamente en AMD Ryzen AI Max+ 395 (gfx1151, Strix Halo) con 128 GB de memoria unificada. No hay datos de funcionamiento en GPUs discretas.
- GPU de consumo: cabe en equipos con al menos 20-24 GB de memoria disponible para pesos y contexto, pero la build está optimizada para ROCm en gfx1151; no se confirma compatibilidad con CUDA ni con GPUs NVIDIA.
- Opciones de despliegue: motor Super Roc (superroc serve), Lemonade (lemonade pull / lemonade chat) y, al ser GGUF, potencialmente llama.cpp y otros runners compatibles con GGUF, aunque el formato ROCm-FP4 puede requerir soporte específico de ROCmFPX.
- Latencia y throughput: medidos en una sola petición simultánea; 1799,9-1894,2 tok/s de prompt y 71,83-169,03 tok/s de generación según longitud de contexto. No hay datos de concurrencia ni de latencia bajo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF | 34,66B totales, ~3B activos | 131.072 tokens | GGUF Q4_0 ROCm-FP4 | Apache 2.0 | Hugging Face, 198 descargas |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | 34,66B totales, ~3B activos | No disponible en esta ficha | Safetensors (presumiblemente) | Apache 2.0 | Hugging Face (modelo oficial) |
| Otras cuantizaciones GGUF del mismo modelo base | 34,66B totales, ~3B activos | Depende del runner | GGUF Q4_K_M, Q5, etc. | Apache 2.0 | Según repositorios de terceros |
| Modelos MoE de ~30-35B con ~3B activos de otros fabricantes | Rango similar | Variable | Safetensors/GGUF | Variable | No disponible en la información proporcionada |

La comparación con alternativas de la misma categoría no puede completarse con datos verificables a partir de la información disponible; no se aportan cifras de rendimiento comparadas con otros modelos.

## Limitaciones y advertencias

- Es una cuantización Q4_0: la perplejidad de 7,51 sobre un documento técnico indica degradación respecto al modelo original, que puede afectar a tareas de razonamiento fino, matemáticas o generación de código complejo.
- Solo texto: el checkpoint fuente no incluye pesos de visión, por lo que no puede procesar imágenes.
- Sin datos de benchmarks de calidad: no se puede verificar el rendimiento en MMLU, HumanEval o GSM8K; la evaluación del autor se limita a perplejidad y throughput.
- Tool calling imperfecto: 7 de 8 llamadas correctas implica un 12,5 % de fallos en las pruebas del autor, lo que exige manejo de errores en producción.
- Build de nicho y sin mantenimiento verificado: 198 descargas, 0 likes, autor individual y un único fichero; no hay garantía de actualizaciones ni de soporte.
- Dependencia del motor Super Roc: las métricas y el formato ROCm-FP4 están ligados a un motor específico para gfx1151; el comportamiento en llama.cpp estándar u otros runners no está documentado.
- Idiomas no declarados: el autor no especifica el conjunto de idiomas soportados; la única medición cualitativa es en inglés.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y de los componentes ROCmFPX y llama.cpp/ggml (MIT) citados en los créditos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Guía de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
- llama.cpp / ggml: https://github.com/ggerganov/llama.cpp
