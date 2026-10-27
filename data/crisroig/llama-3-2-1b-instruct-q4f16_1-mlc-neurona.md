# Crisroig/Llama-3.2-1B-Instruct-q4f16_1-MLC-Neurona

## Resumen

`Crisroig/Llama-3.2-1B-Instruct-q4f16_1-MLC-Neurona` es una cuantización de 4 bits de `meta-llama/Llama-3.2-1B-Instruct` empaquetada en el formato `q4f16_1` de MLC-LLM para su ejecución en el navegador mediante WebLLM. La publica el desarrollador independentiente Crisroig y su particularidad es que, a diferencia de la versión oficial `mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC` (que aplica redondeo por peso), esta emplea GPTQ sobre todas las matrices de las capas y sobre el embedding compartido con la salida, con grupos de 32 entradas y escalas fp16 elegidas por error cuadrático.

El objetivo es doble: mantener exactamente el mismo tamaño en disco y en memoria de GPU (695 MB, frente a 2.472 MB en bf16) y el mismo motor `.wasm` que la versión de MLC, de modo que solo cambian los ficheros `params_shard_*.bin`, y reducir al mismo tiempo la degradación de calidad que introduce la cuantización a 4 bits. Según las mediciones del autor sobre textos propios en español no vistos durante el entrenamiento, la perplejidad baja de 14,26 (q4f16_1 de MLC) a 11,44 (esta variante), recuperando el 68 % de la pérdida que introduce el paso de bf16 a 4 bits.

La relevancia práctica es que se trata de un artefacto listo para `CreateMLCEngine` en WebGPU, con un rendimiento declarado de 190 tok/s frente a los 191 tok/s de la versión de MLC en una RTX 5070 Ti bajo Chrome, es decir, sin coste medible en velocidad a cambio de la mejora en perplejidad. Está pensado para asistentes que corren íntegramente en el cliente y se usa en producción en `https://ia.crisrr.com`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Llama 3.2 1B Instruct, heredada del modelo base; la model card de esta cuantización no detalla capas ni dimensiones) |
| Parametros totales | ~1B (modelo base `meta-llama/Llama-3.2-1B-Instruct`; el recuento exacto no se especifica en la información disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card de esta cuantización (viene impuesta por el modelo base) |
| Tipos de cuantizacion | `q4f16_1` con GPTQ: pesos de 4 bits en grupos de 32 entradas, escala fp16 por grupo elegida por error cuadrático, niveles -8..7 o -7..8; activaciones fp16 |
| Idiomas soportados | es, en (según los tags de la model card) |
| Licencia | Llama 3.2 Community License (Copyright © Meta Platforms, Inc.) |
| Formato de pesos | MLC-LLM: `params_shard_*.bin` + configuración MLC; reutiliza el `.wasm` de MLC; no se distribuye en GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama 3.2 en su variante de 1B parámetros, ajustado con instrucciones por Meta. Sobre esa base, esta publicación no reentrena ni modifica la arquitectura: únicamente sustituye los pesos por una versión cuantizada a 4 bits generada con GPTQ (Frantar et al., 2022), aplicada a todas las matrices de las capas y también al embedding, que está compartido con la cabeza de salida. El empaquetado respeta el esquema `q4f16_1` de MLC-LLM, con lo que el resultado es interoperable con el runtime y el `.wasm` oficiales.

El detalle técnico diferencial es el proceso de calibración y cuantización: 32.768 tokens de *Don Quijote* (Project Gutenberg) como conjunto de calibración, grupos de 32 entradas con escala fp16 seleccionada minimizando el error cuadrático, y niveles asimétricos (-8..7 o -7..8) que encajan en el formato de 4 bits de MLC. El código utilizado está publicado en el repositorio `crisroig2001/ia-crisrr`, en los scripts `investigacion/qwen_gptq.py` y `investigacion/qwen_empaquetar.py` (invocado con `LLAMA=<pesos>`). No se documentan fases de RLHF, DPO ni datos de preentrenamiento propios, ya que todo ello corresponde al modelo original de Meta.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del ajuste instruct de Llama 3.2 1B.
- Razonamiento básico y tareas de un solo paso; el tamaño de 1B limita el razonamiento multi-paso profundo.
- Generación y explicación de código a pequeña escala, sin garantías en tareas de repositorio completo.
- Capacidades multilingües limitadas a es y en según los tags declarados.
- Ejecución íntegra en el navegador del cliente mediante WebLLM sobre WebGPU, sin backend servidor.
- Integración directa con `CreateMLCEngine` y `prebuiltAppConfig`, reutilizando la entrada de configuración del modelo de MLC.
- No se declara soporte explícito de tool calling, function calling, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga con WebLLM y responde en el propio navegador, de forma que el texto del usuario nunca sale del dispositivo; los 695 MB de pesos encajan en la memoria de GPU de portátiles con WebGPU.
- Traducción y redacción es-en en herramientas ofimáticas o extensiones de navegador: el soporte declarado de ambos idiomas y la mejora de perplejidad en español tras el GPTQ lo hacen adecuado para borradores y reformulación de textos cortos.
- Procesamiento de documentos sensibles (sanitario, legal, recursos humanos): al ejecutarse en cliente, evita el envío de datos a una API externa, lo que simplifica el cumplimiento de RGPD en flujos de resumen o extracción de campos.
- Prototipado rápido de producto: permite validar una UX de chat o de autocompletado sin levantar infraestructura de inferencia, usando el mismo `.wasm` y el mismo `model_id` que la variante oficial de MLC.
- Demos educativas y de investigación sobre cuantización: al publicarse el código de GPTQ y empaquetado, sirve como caso reproducible para medir el impacto de GPTQ frente al redondeo en un formato MLC concreto.
- Subtareas dentro de un pipeline mayor: clasificación de intención, reescritura de consultas o generación de resúmenes breves en el cliente antes de escalar a un modelo mayor en servidor, reduciendo coste y latencia de red.
- Aplicaciones offline o en entornos con conectividad intermitente (quioscos, aulas, field work), una vez descargados los pesos en caché del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de perplejidad sobre textos propios en español no vistos, junto con una comparación de velocidad:

| Variante | Tamano | Perplejidad (texto "faro") | Perplejidad (media de los tres textos) |
|---|---|---|---|
| Original (bf16) | 2.472 MB | 10,14 | 10,70 |
| q4f16_1 de MLC | 695 MB | 14,26 | no disponible |
| Esta variante (GPTQ) | 695 MB | 11,44 | 11,88 |

| Métrica de velocidad | Valor |
|---|---|
| Throughput de esta variante | 190 tok/s |
| Throughput de q4f16_1 de MLC | 191 tok/s |
| Hardware de la medición | RTX 5070 Ti, Chrome, WebLLM 0.2.86 |
| Verificación cruzada | perplejidad 11,44 en el texto "faro", idéntica en numpy y en navegador |

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB de memoria de GPU para los pesos (695 MB) más el overhead de contexto y activaciones en fp16; el autor no publica una cifra cerrada de VRAM total.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en Chrome; el autor valida el rendimiento en una RTX 5070 Ti (190 tok/s).
- Cabe en GPU de consumo: sí, al ser un modelo de 1B en 4 bits; el límite práctico es la disponibilidad de WebGPU en el navegador y el espacio de memoria gráfica del equipo.
- Opciones de despliegue: WebLLM (versión validada 0.2.86) y runtime MLC-LLM; al estar en formato MLC (`params_shard_*.bin`), no es cargable directamente en llama.cpp, Ollama ni TGI sin una conversión adicional.
- Latencia y throughput: 190 tok/s medidos en RTX 5070 Ti bajo Chrome; no hay datos publicados para iGPU, Apple Silicon ni GPUs de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad medida | Licencia |
|---|---|---|---|---|---|
| Esta variante (GPTQ q4f16_1) | ~1B | no disponible | MLC, 695 MB | Perplejidad 11,44 / 11,88 | Llama 3.2 Community |
| `mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~1B | no disponible | MLC, 695 MB | Perplejidad 14,26 | Llama 3.2 Community |
| `meta-llama/Llama-3.2-1B-Instruct` (bf16) | ~1B | no disponible en la información | bf16, 2.472 MB | Perplejidad 10,14 / 10,70 | Llama 3.2 Community |
| Otras alternativas de ~1B en formato WebLLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos que permitan comparar con modelos de otros linajes (por ejemplo, Qwen o Gemma en la misma franja de tamaño) dentro de la información proporcionada.

## Limitaciones y advertencias

- La model card no aporta evaluación en tareas (MMLU, HumanEval, GSM8K) ni evaluación de sesgos; el único indicador de calidad es la perplejidad sobre textos propios en español.
- El conjunto de calibración son 32.768 tokens de *Don Quijote*, un corpus literario de dominio muy concreto; el sesgo hacia registro culto y narrativa del siglo XIX puede reducir la fidelidad de la cuantización en otros dominios (código, texto técnico, conversación coloquial).
- Un modelo de 1B parámetros presenta razonamiento limitado, mayor propensión a alucinaciones en datos factuales y menor robustez ante instrucciones complejas o contexto muy largo.
- La cuantización a 4 bits introduce una degradación residual (perplejidad 11,44 frente a 10,14 en bf16 en el texto "faro"), que puede ser más acusada en tareas generativas que en la medida de perplejidad.
- Soporte de idiomas declarado únicamente es y en; no hay verificación de calidad en otras lenguas.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, incluida la cláusula de licencia adicional para productos con más de 700 millones de usuarios activos mensuales, la obligación de incluir "Built with Llama" y de conservar `LICENSE` y `USE_POLICY.md`, además de las restricciones de la política de uso aceptable.
- Dependencia de WebGPU: el despliegue en navegador requiere un navegador y una GPU compatibles; no es un artefacto portable a otros runtimes sin reconversión.
- Repositorio con 0 descargas y 0 likes, mantenido por un único autor, sin proceso de revisión por pares; la validación del rendimiento se limita a un equipo y una versión de WebLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crisroig/Llama-3.2-1B-Instruct-q4f16_1-MLC-Neurona
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Cuantización de referencia de MLC: https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC
- Runtime WebLLM: https://github.com/mlc-ai/web-llm
- Código de cuantización y empaquetado del autor: https://github.com/crisroig2001/ia-crisrr
- Despliegue en producción: https://ia.crisrr.com
- Paper de GPTQ (Frantar et al., 2022), citado en la model card: no se incluye URL en la información disponible
- Corpus de calibración (*Don Quijote*, Project Gutenberg): no se incluye URL en la información disponible
