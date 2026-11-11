# myjellylabs/Krypton-Fly-2.0

## Resumen

Krypton Fly 2.0 es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) desarrollado por Jelly Lab Game (myjellylabs), publicado bajo licencia Apache-2.0. Se presenta como un modelo especializado en razonamiento profundo mediante trazas `<think>...</think>`, llamada nativa a herramientas en formato XML y tareas de ingeniería de software y depuración agéntica. Está construido sobre Krypton Fly 1.0, un modelo de la familia Llama (`LlamaForCausalLM`) con 42 capas, atención GQA y una ventana de contexto de 131.072 tokens.

El modelo se distribuye en formato safetensors para la librería transformers, con un tamaño de repositorio de 5,0 GB, y declara soporte únicamente para inglés. Su propuesta diferencial es el soporte nativo de tool calling en XML con etiquetas `<function name="..."><param name="...">...</param></function>`, incluyendo CDATA para parámetros de código y SQL sin escapar, orientado a orquestación de herramientas MCP, depuración multi-turno de repositorios y recuperación automática de errores.

Es relevante en el contexto de modelos pequeños con capacidades agénticas: con solo 2,5B parámetros apunta a un despliegue económico en hardware de consumo, aunque el autor no publica resultados frente a benchmarks estándar de la industria (MMLU, HumanEval, GSM8K), sino únicamente una evaluación interna comparativa frente a la versión 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`), 42 capas, atención GQA |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada de Krypton Fly 1.0); salida máxima 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repo 5,0 GB |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de tipo Llama, con 42 capas y atención de consultas agrupadas (GQA), heredada de Krypton Fly 1.0. El modelo base dispone de una ventana de contexto de 131.072 tokens y un límite de generación de 16.384 tokens. No se detalla en la información disponible el número de cabezas de atención, la dimensión oculta ni la configuración exacta de GQA.

El ajuste se realizó sobre una mezcla curada de 4.017 muestras (~8,00M tokens) compuesta por destilaciones y trazas de razonamiento de modelos frontera (Claude Opus 4.7/4.6, Fable 5.1, Gemini 3.1 Pro, Kimi K3/K2.6, GPT-5.4/5.2, DeepSeek V4/V3.2 Speciale) y datasets de código, agentes y ciberseguridad (UltraData-SFT-Agent-2609, OpenCodeReasoning, AgentForge, Hermes, entre otros). Se menciona el uso de *loss masking* en modo rápido para que tanto `enable_thinking=True` como `enable_thinking=False` funcionen de forma limpia. No se especifica si hubo RLHF o DPO, ni detalles del preentrenamiento original.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento profundo con modo explícito `<think>...</think>`, activable mediante `enable_thinking` en la plantilla de chat.
- Llamada nativa a herramientas en XML: `<function name="..."><param name="...">...</param></function>`, con soporte de CDATA para código y SQL sin escapar.
- Orquestación de herramientas MCP y depuración multi-turno de repositorios.
- Recuperación automática de errores en flujos agénticos (según datasets AgentForge y Hermes de autocorrección).
- Generación de código y verificación algorítmica.
- Razonamiento orientado a auditoría de vulnerabilidades y ciberseguridad (según la mezcla de entrenamiento).
- Seguimiento de restricciones de formato y presupuesto de tokens de salida (evaluado internamente).
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Visión y audio: no disponibles.

## Casos de uso

- Orquestación de agentes con tool calling XML: el modelo emite llamadas `<function><param>` de forma nativa, lo que permite integrarlo en frameworks de agentes que parsean XML y encadenar herramientas MCP sin post-procesado complejo.
- Depuración de repositorios multi-turno: con 131.072 tokens de contexto puede cargar fragmentos extensos de código, trazas de error y resultados de tests en una sola ventana y proponer parches iterativos.
- Generación de código en pipelines de CI/CD: la salida máxima de 16.384 tokens y el modo rápido (`enable_thinking=False`) permiten generar parches o tests con baja latencia dentro de un runner.
- Asistente de razonamiento paso a paso: activando `enable_thinking=True` se obtienen trazas `<think>` auditables, útiles en entornos educativos o de revisión de decisiones.
- Auditoría de seguridad asistida: la mezcla incluye datasets de vulnerabilidades y pentesting, por lo que puede emplearse para triaje inicial de hallazgos y explicación de CWEs, siempre con revisión humana.
- Automatización de consultas a bases de datos vía SQL: el soporte de CDATA permite pasar consultas SQL sin escapes dentro de los parámetros de una función, simplificando la integración con agentes de datos.
- Prototipado en hardware de consumo: con ~2,5B parámetros en bfloat16 (unos 5 GB de pesos) cabe en GPUs consumer de 8-12 GB, lo que facilita pruebas locales de flujos agénticos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor solo publica una evaluación interna comparando Krypton Fly 1.0 con Krypton Fly 2.0; no hay resultados frente a benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks estándar en la información disponible.

| Métrica (evaluación interna del autor) | Krypton Fly 1.0 | Krypton Fly 2.0 |
|---|---|---|
| Identidad (Krypton / Krypton Fly 2.0) | 0,60 | 0,70 |
| Validez de tool call XML nativo | 1,00 | 1,00 |
| Coincidencia exacta de nombre de herramienta XML | 0,54 | 0,54 |
| Precisión matemática y de código (modo rápido) | 1,00 | 1,00 |
| Cierre correcto de `</think>` en modo profundo | 0,90 | 1,00 |
| Precisión de respuesta final en modo profundo | 0,90 | 1,00 |
| Chat completion dentro del presupuesto de tokens | 1,00 | 0,93 |
| Longitud media de salida en modo rápido (caracteres) | 1442,33 | 2138,67 |
| Longitud media tras `</think>` (caracteres) | 1004,90 | 465,60 |
| Comprobaciones básicas de cordura | 1,00 | 1,00 |
| Seguimiento de restricciones de formato | 1,00 | 1,00 |
| Autoconocimiento de la versión 2.0 | 0,00 | 0,00 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~5 GB de pesos más caché KV; con 131.072 tokens de contexto la caché KV puede ser muy voluminosa y exige GPUs con 24 GB o más para contextos largos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y serving concurrente; RTX 4090 (24 GB) para contexto largo en una sola petición.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) y, con cuantización a 8 bits o 4 bits (no publicada oficialmente, habría que generarla), en GPUs de 8-12 GB como RTX 3060/4060 Ti.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo); vLLM, llama.cpp y Ollama no están confirmados por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Krypton Fly 2.0 | ~2,5B | 131.072 | Apache-2.0 | Agentes, tool calling XML, razonamiento `<think>` |
| Qwen2.5-3B-Instruct | ~3B | 32.768 | Apache-2.0 | Instrucción general, multilingüe |
| Llama-3.2-3B-Instruct | ~3B | 131.072 | Llama 3.2 Community | Instrucción general, multilingüe |
| Phi-3.5-mini-instruct | ~3,8B | 131.072 | MIT | Instrucción general, razonamiento |

La comparación de rendimiento con estas alternativas no está disponible: el autor no publica MMLU, HumanEval ni GSM8K, por lo que no es posible situar el modelo frente a ellos con datos verificables. La ventaja declarada de Krypton Fly 2.0 es el tool calling XML nativo y el modo `<think>` calibrado; en contra, solo declara inglés y carece de validación externa.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está evaluado.
- No hay benchmarks estándar publicados; las métricas del autor son internas, sobre conjuntos propios y con tamaños de muestra pequeños (4.017 muestras de entrenamiento), lo que limita su valor comparativo.
- Riesgo de alucinación inherente a modelos pequeños; el modo `<think>` puede producir cadenas de razonamiento plausibles pero incorrectas.
- La mezcla de entrenamiento incluye destilaciones de modelos propietarios (Claude, GPT, Gemini); conviene revisar las condiciones de uso de esos datasets antes de un despliegue comercial, aunque la licencia del modelo sea Apache-2.0.
- El autor reconoce que el "autoconocimiento de la versión 2.0" puntúa 0,00, es decir, el modelo no se identifica correctamente como la versión 2.0.
- El cumplimiento del presupuesto de tokens de salida bajó de 1,00 a 0,93 respecto a la versión 1.0.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en GPUs pequeñas requiere conversión propia.
- Contexto de 131.072 tokens heredado del modelo base: no se documenta si se validó con pruebas de aguja en pajar, por lo que la calidad en contextos muy largos es incierta.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myjellylabs/Krypton-Fly-2.0
- Modelo base: https://huggingface.co/myjellylabs/Krypton-Fly-1.0
- Organización: https://huggingface.co/myjellylabs
- Dataset de identidad citado: Krypton Fly 2.0 Identity Anchor (Jelly Lab Game), sin URL pública en la información disponible
- Paper, blog o demo oficial: no disponible
