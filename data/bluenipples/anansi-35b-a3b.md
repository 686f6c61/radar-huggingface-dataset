# BlueNipples/Anansi-35B-A3B

## Resumen

Anansi-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) obtenido mediante fusión de pesos, no mediante entrenamiento desde cero. Lo publica el usuario BlueNipples en Hugging Face y combina tres modelos donantes: Huihui-Agents-A1-abliterated, Gryphe/WorldSim-Opus-3.6-35B-A3B y ReadyArt/Melody1437-35B-A3B. Su objetivo declarado es equilibrar el seguimiento de instrucciones con la calidad de prosa narrativa, manteniendo un razonamiento conciso orientado a personajes y escenas, y con un consumo de memoria lo bastante bajo como para ejecutarse en GPU de 8 GB mediante cuantización.

El modelo tiene 34.660.610.688 parámetros totales según los tensores en safetensors, con arquitectura `qwen3_5_moe` y un tamaño de repositorio de 69,3 GB. La receta combina una fusión DARE-TIES (35 % de Agents-A1 y 65 % de WorldSim-Opus) y una interpolación del tensor LM head al 30 % con el de Melody1437, técnica pensada para injertar estilo sin destruir la lógica subyacente. La licencia declarada es Apache 2.0.

Es relevante porque demuestra un patrón de trabajo habitual en la comunidad: especialización por fusión de modelos existentes para nichos concretos (roleplay, narrativa, revisión de prosa) con requisitos de hardware modestos. No obstante, la información publicada es escasa en cuanto a datos de entrenamiento, idiomas y evaluación cuantitativa, lo que limita su uso en entornos de producción que exijan trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8 publicada por el autor; GGUF i1 de mradermacher; el resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repos derivados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (`qwen3_5_moe`), heredada del linaje de los modelos donantes, con 34.660 millones de parámetros totales. Al tratarse de una fusión, no hay un entrenamiento propio: los pesos provienen de la combinación de tres modelos. El cuerpo de razonamiento se construye con una fusión DARE-TIES en proporción 35/65 entre Huihui-Agents-A1-abliterated (35 %) y WorldSim-Opus-3.6-35B-A3B (65 %). DARE-TIES combina poda aleatoria con signos electorales y poda de redundancia para reducir interferencias entre tensores de modelos distintos.

La segunda etapa es una interpolación del tensor LM head al 30 % con el LM head de Melody1437-35B-A3B, usando el script `Wiself/Voice` y un script Python propio. El autor indica que ratios del 25-35 % preservan mejor la lógica y el seguimiento de instrucciones que un reemplazo completo de la cabeza. No se publican datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO, ya que el proceso es exclusivamente de fusión de pesos.

## Capacidades

- Generación de texto conversacional y narrativo, con énfasis en prosa y estilo literario.
- Razonamiento narrativo orientado a personajes y escenas, con cadenas de razonamiento más breves que las de Agents-A1.
- Seguimiento de instrucciones complejas, mejorado respecto a WorldSim-Opus según el autor.
- Tareas de revisión y refinamiento de prosa en una sola pasada, útil para flujos de reescritura.
- Roleplay multi-turno, con coherencia de personaje y tono.
- Capacidad de "abliterated" heredada de Agents-A1, que elimina parte de los rechazos del modelo original.
- Soporte de tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión y refinamiento de prosa en escritura creativa: el modelo está diseñado para completar una pasada de revisión en una sola generación, lo que encaja en extensiones de reescritura de clientes de escritura.
- Roleplay y narrativa interactiva: la fusión prioriza coherencia de personaje y concisión narrativa, adecuada para sesiones multi-turno en frontends conversacionales.
- Generación de ficción y relatos cortos: la interpolación del LM head al 30 % con Melody1437 aporta estilo sin sacrificar la estructura lógica del texto.
- Asistencia a guionistas y creadores de contenido: generación de diálogos y descripciones con tono controlado mediante instrucciones de sistema.
- Despliegue en hardware modesto: el autor lo ejecuta en una GPU de 8 GB con cuantización GGUF Q8, lo que permite prototipado local sin infraestructura dedicada.
- Experimentación en investigación sobre fusión de modelos: sirve como caso de estudio de DARE-TIES combinado con interpolación selectiva de la cabeza de salida.
- Redacción creativa con instrucciones complejas: el modelo mantiene el seguimiento de instrucciones de Agents-A1 sin la verbosidad excesiva de este, útil para tareas de reescritura con restricciones de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor lo ejecuta en una GPU de 8 GB usando cuantización GGUF Q8, aunque el repo principal en safetensors (69,3 GB) requiere mucha más memoria en precisión completa.
- En FP16/BF16, los 34.660 millones de parámetros implican del orden de 69 GB de pesos, por lo que se necesitan GPUs de 80 GB (A100, H100) o múltiples GPUs.
- En cuantizaciones GGUF de 4-5 bits, el modelo puede caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y, con cuantizaciones más agresivas, en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors si la arquitectura `qwen3_5_moe` está soportada por dichos motores (no confirmado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Anansi-35B-A3B | 34,66 B (MoE) | no disponible | Apache 2.0 | Fusión DARE-TIES + interpolación de LM head; orientado a prosa y roleplay |
| Gryphe/WorldSim-Opus-3.6-35B-A3B | no disponible | no disponible | no disponible | Donante al 65 %; razonamiento narrativo conciso, seguimiento de instrucciones menos fiable |
| huihui-ai/Huihui-Agents-A1-abliterated | no disponible | no disponible | no disponible | Donante al 35 %; buen seguimiento de instrucciones, razonamiento verboso |
| ReadyArt/Melody1437-35B-A3B | no disponible | no disponible | no disponible | Donante del LM head; prosa de alta calidad |

## Limitaciones y advertencias

- Al ser una fusión de pesos, no hay garantía de comportamiento estable fuera de los dominios de los modelos donantes; los sesgos de estos se heredan sin filtrar.
- El componente "abliterated" de Agents-A1 elimina parte de los mecanismos de rechazo, lo que puede aumentar la probabilidad de contenido sensible o no deseado.
- Riesgo de alucinación inherente a los modelos de 35B sin evaluación publicada; no hay benchmarks que cuantifiquen su fiabilidad factual.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos donantes no se detallan en la información disponible y podrían imponer condiciones adicionales.
- El autor lo describe como un modelo para hardware modesto y uso personal; no hay evidencia de validación en producción ni de soporte técnico.
- No se especifican parámetros activos del MoE, lo que dificulta estimar el coste real de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlueNipples/Anansi-35B-A3B
- GGUF Q8 con cabezas de prosa interpoladas: https://huggingface.co/BlueNipples/Anansi-35B-A3B-Q8-Prose-GGUF
- GGUF i1 de mradermacher: https://huggingface.co/mradermacher/Anansi-35B-A3B-i1-GGUF
- Archivos de construcción y variantes de cabeza: https://huggingface.co/BlueNipples/Anansi-35B-A3B-buildfiles_and_headvariants
- Modelo donante Agents-A1: https://huggingface.co/InternScience/Agents-A1
- Modelo donante WorldSim-Opus-3.6-35B-A3B: https://huggingface.co/Gryphe/WorldSim-Opus-3.6-35B-A3B
- Modelo donante Melody1437-35B-A3B: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Script Voice: https://huggingface.co/Wiself/Voice
- Mergekit: https://github.com/arcee-ai/mergekit
