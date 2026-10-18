# 0xEstro/Xendra-1

## Resumen

Xendra-1 es un modelo de lenguaje publicado en HuggingFace por el usuario 0xEstro el 18 de octubre de 2026. El repositorio contiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) en pesos safetensors con cuantización FP8, lo que ocupa 29,5 GB de almacenamiento. El tag `qwen3_5` del repositorio sugiere que el modelo se apoya en la arquitectura de la familia Qwen3.5, aunque la ficha de HuggingFace no incluye documentación técnica que lo confirme.

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: se trata de un modelo con 12 descargas y 0 likes en el momento de la consulta, sin model card, sin licencia declarada, sin idiomas especificados, sin pipeline asignado y sin resultados de benchmarks publicados. No hay información sobre el proceso de entrenamiento, el dataset utilizado ni el contexto máximo soportado.

Por tanto, esta ficha recoge exclusivamente los datos verificables del repositorio (tamaño, formato, arquitectura inferida por tags) y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier evaluación de calidad, seguridad o idoneidad para producción requiere una validación empírica propia por parte de quien lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; tag de repositorio `qwen3_5` (detalle de capas, atención y activaciones no disponible) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos publicados en FP8 (tag `fp8`); no se incluyen variantes GGUF, AWQ ni GPTQ en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8) |
| Tamaño del repositorio | 29,5 GB |
| Pipeline declarado | no disponible |
| Fecha de publicación | 2026-10-18 |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

El repositorio declara el tag `qwen3_5`, que en HuggingFace identifica habitualmente la familia de arquitectura sobre la que se construye el modelo. Esto apunta a un transformer decoder-only con atención completa y, presumiblemente, los componentes estándar de la familia Qwen (RMSNorm, RoPE, SwiGLU), pero el autor no publica configuración (`config.json` comentado), número de capas, dimensión oculta, cabezas de atención ni vocabulario, por lo que no es posible confirmar estos extremos.

No hay información sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del corpus, si hubo fases de instrucción supervisada, RLHF o DPO, ni si el modelo es un preentrenamiento desde cero, un fine-tune o una fusión de pesos. Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento explícito). El único dato técnico objetivo es el recuento de parámetros extraído de los safetensors y el hecho de que los pesos se distribuyen en FP8, lo que reduce a la mitad el espacio frente a BF16 a costa de una posible pérdida de precisión que el autor no cuantifica.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por la arquitectura, pero no verificada ni documentada por el autor.
- Razonamiento y matemáticas: sin datos de evaluación; no se puede afirmar ningún nivel de competencia.
- Generación de código: sin datos de HumanEval, MBPP ni similares.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no disponible; no se declara ninguna lista de idiomas.
- Modo "thinking" o razonamiento extendido: no documentado.
- Visión, audio o multimodalidad: no disponible; no hay tags ni módulos que lo indiquen.
- Contexto largo: no disponible.

## Casos de uso

Dado que no existen evaluaciones públicas, los siguientes casos son planteamientos plausibles para un modelo denso de ~27 B parámetros, no recomendaciones validadas:

- Generación de texto asistida en herramientas internas: desplegado tras una API compatible con OpenAI, serviría para redacción, resumen y reescritura de documentos, siempre que se valide previamente la calidad en el dominio concreto mediante un conjunto de evaluación propio.
- Prototipado rápido de aplicaciones de chat: al publicarse en FP8, puede cargarse en una GPU de 40-48 GB y levantar un endpoint de pruebas en minutos con vLLM, lo que lo hace útil para experimentación interna antes de comprometerse con un modelo con licencia clara.
- Extracción de información estructurada: clasificación de tickets, entidades o campos en documentos, con validación de esquema en la capa de aplicación. Requiere medir la tasa de adherencia al formato JSON, no documentada.
- Base para fine-tuning específico de dominio: sus ~26,9 B parámetros ofrecen margen suficiente para ajuste con LoRA en tareas verticales (legal, sanitario, soporte técnico). Antes de usarlo como base conviene verificar la licencia del modelo original del que deriva.
- Investigación sobre cuantización y eficiencia: al distribuirse únicamente en FP8, es un candidato interesante para estudiar la degradación al convertir a GGUF Q4/Q5 y comparar perplejidad contra el original en FP8.
- Evaluación comparativa de modelos pequeños-medianos: encaja en un banco de pruebas interno junto a otros modelos de 20-35 B para tareas de clasificación y generación corta.
- Generación de código en pipelines internos: solo tras validar con un benchmark propio (por ejemplo, un subconjunto de HumanEval o tests del repositorio), dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluación, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos eran foros sin relación alguna con IA). No se debe asumir ningún nivel de rendimiento en MMLU, HumanEval, GSM8K ni en ninguna otra prueba.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (26,9 B), no medidas reales:

- Pesos en FP8 (formato publicado): ~27 GB. Con caché KV para contexto moderado, se necesita una GPU de 40-48 GB: A100 40 GB, L40S 48 GB, A6000 48 GB o RTX 6000 Ada 48 GB.
- Pesos en BF16/FP16 (si se reconvierten): ~54 GB. Requiere A100 80 GB, H100 80 GB/H200 o dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantización INT4 (Q4_K_M, ~4,5 bits efectivos): ~15-16 GB de pesos más caché KV; cabe en RTX 4090 24 GB, RTX 3090 24 GB o RTX 5090 32 GB. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) quedaría muy justo y dependería de la longitud de contexto, que se desconoce.
- No cabe en GPUs consumer de 8-12 GB ni en CPU con prestaciones aceptables sin cuantización agresiva (Q3 o inferior, con degradación no medida).
- Opciones de despliegue: vLLM y SGLang soportan FP8 de forma nativa y serían la primera opción; TGI también admite FP8 en hardware compatible. llama.cpp y Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor y con riesgo de pérdida de calidad.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo publicados ni mediciones de TTFT.
- Nota de memoria: al desconocerse la longitud de contexto y la configuración de cabezas KV, el cálculo de caché KV es indeterminado; para contextos de 32K o superiores con lotes grandes, el consumo puede superar con holgura el de los pesos.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas y pueden variar; los de Xendra-1 son los únicos verificados en este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Xendra-1 | ~26,9 B | no disponible | no disponible | no disponible | HF, 12 descargas, 0 likes |
| Qwen3-32B | ~32,8 B | 32K nativo (ampliable por YaRN) | Apache 2.0 | Benchmarks en su model card | Amplia adopción, múltiples cuantizaciones |
| Gemma 3 27B | ~27 B | 128K | Gemma Terms of Use | Benchmarks en su model card | Amplia adopción, multimodal |
| Mistral Small 3.x 24B | ~24 B | 128K | Apache 2.0 | Benchmarks en su model card | Amplia adopción, múltiples cuantizaciones |

En la práctica, Xendra-1 compite en la misma franja de tamaño que estos tres modelos, pero parte con desventajas claras de documentación, licencia y validación comunitaria frente a alternativas con licencia permisiva y ecosistema establecido.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; en la práctica equivale a "todos los derechos reservados" hasta que el autor se pronuncie.
- Procedencia incierta: el tag `qwen3_5` sugiere una base de la familia Qwen, pero no se confirma ni se detalla el modelo original; esto afecta a las obligaciones de atribución y a la herencia de licencia.
- Ausencia total de model card: no hay información sobre datos de entrenamiento, filtrado de contenido, sesgos conocidos ni alineación de seguridad.
- Riesgo de alucinación desconocido y no medido: sin evaluaciones, no se puede acotar la tasa de error factual.
- Idiomas y contexto no disponibles: no se puede garantizar un comportamiento correcto en castellano ni planificar arquitecturas que dependan de ventanas largas.
- Distribución solo en FP8: no hay pesos BF16 ni GGUF oficiales; la conversión a otros formatos corre por cuenta del usuario y puede degradar la calidad sin métricas de referencia.
- Validación comunitaria prácticamente nula: 12 descargas y 0 likes implican que nadie ha reportado comportamiento en producción; no hay issues ni discusiones que sirvan de contraste.
- Fecha de creación futura respecto a los datos de referencia habituales: conviene verificar que el repositorio sigue disponible y que los pesos no han sido modificados tras la descarga.
- Recomendación: no desplegar en producción sin una batería propia de evaluación (calidad, seguridad, sesgo, latencia) y sin aclarar previamente la licencia con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xEstro/Xendra-1
- Perfil del autor: https://huggingface.co/0xEstro
- Paper, blog, repositorio de código o demo: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.
