# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-037

## Resumen

`HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-037` es un ajuste fino (fine-tune) del modelo denso Qwen3-4B-Instruct-2507, publicado por el grupo HYU-NLP-EVAL (etiquetado internamente como «HYU_NLP / EVA Team 4»). No se trata de un modelo de propósito general, sino de un checkpoint intermedio de un experimento de investigación: la ejecución `261016_medicine_static_pilot`, en el paso 37 del entrenamiento y con semilla 11. El dominio declarado es el médico, y el linaje de nombres de los checkpoints hermanos (`rar-medicine-static-r0-matched-seed11`, `static-rubric`, `grpo`) sugiere entrenamiento con refuerzo y recompensas basadas en rúbricas estáticas, aunque la model card no lo documenta explícitamente.

El modelo conserva la arquitectura del base: un transformer denso de 4.022.468.096 parámetros (≈4,02 mil millones), sin mezcla de expertos, exportado en safetensors BF16 para `transformers`. El repositorio incluye además el checkpoint nativo original en `original_checkpoint/`, en formato veRL/FSDP, lo que confirma que procede de un pipeline de RL distribuido. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada y muy específica: es material de auditoría y reproducibilidad de un estudio de evaluación (el prefijo `EVAL` y el sufijo `step-037` apuntan a eso), no un modelo listo para producción. Resulta útil para investigadores que quieran inspeccionar cómo evoluciona un ajuste médico paso a paso, comparar checkpoints tempranos o replicar el pipeline de entrenamiento, pero carece de documentación de datos, de evaluación publicada y de garantías clínicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); sin mezcla de expertos |
| Parámetros totales | 4.022.468.096 (≈4,02 B) según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en esta ficha; el checkpoint hermano `step-002` se sirve con 32.768 tokens y el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantización | No disponible en el repositorio (export BF16 en safetensors); no se publican GGUF ni AWQ/GPTQ |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` BF16 (export para Transformers) + `original_checkpoint/` con ficheros nativos veRL/FSDP |
| Pipeline | `text-generation` (conversacional) |
| Librería | `transformers`; compatible con text-generation-inference y `endpoints_compatible` |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` |
| Tamaño del repo | 25,7 GB |
| Paso de checkpoint / semilla | 37 / 11 (ejecución `261016_medicine_static_pilot`) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B-Instruct-2507 sin modificaciones estructurales: un transformer decoder-only denso de ~4 B de parámetros. El autor no documenta cambios de arquitectura, vocabulario ni tokenizador; el único delta respecto al base es el ajuste de pesos. El repositorio contiene un export BF16 en la raíz para su uso directo con `transformers` y, en `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con metadatos. Según la model card, el checkpoint local se elimina solo después de verificar tamaños remotos y hashes SHA256, lo que indica un pipeline de publicación con verificación de integridad.

En cuanto al entrenamiento, la información disponible es mínima: se conoce el nombre de la ejecución (`261016_medicine_static_pilot`), el paso (37) y la semilla (11). Los repositorios hermanos del mismo autor incluyen etiquetas como `grpo`, `static-rubric` y `rar-medicine`, lo que apunta a un ajuste con optimización de política (probablemente GRPO) usando rúbricas estáticas como señal de recompensa sobre datos médicos. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de SFT previas, DPO, ni detalles del reward model. Cualquier afirmación sobre el proceso más allá de esto sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen3-4B-Instruct-2507.
- Respuesta a instrucciones en formato chat (pipeline `text-generation`, tag `conversational`).
- Dominio declarado médico: el ajuste se orienta a contenido biomédico, aunque no se documenta el alcance exacto (preguntas clínicas, farmacología, literatura, etc.).
- Soporte de tool calling / function calling: no documentado en esta ficha; el modelo base lo soporta, pero no hay confirmación de que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo «thinking» explícito: no documentado (Qwen3-4B-Instruct-2507 es la variante no thinking de la familia, con razonamiento integrado en la respuesta).
- Capacidades multimodales (visión, audio): no disponibles; es un modelo exclusivamente de texto.
- Multilingüismo: no disponible en la información proporcionada para este checkpoint.

## Casos de uso

- **Investigación en ajuste con RL aplicado a dominio médico**: el checkpoint permite estudiar la trayectoria de entrenamiento en el paso 37 y compararla con los checkpoints hermanos (`step-002`, `step-003`, `step-042`) para analizar convergencia, deriva de estilo y regresiones respecto al base.
- **Auditoría de reproducibilidad**: al incluir `original_checkpoint/` con los ficheros nativos veRL/FSDP y semilla declarada (11), sirve para replicar exactamente una ejecución y verificar hashes y resultados intermedios.
- **Evaluación comparativa de rúbricas estáticas**: útil como sujeto de prueba en pipelines de evaluación automática (el autor se identifica como `HYU-NLP-EVAL`), midiendo cómo responde un modelo parcialmente entrenado frente a uno convergido.
- **Prototipado interno de asistentes biomédicos**: con 4 B de parámetros y BF16, se puede desplegar en una sola GPU para generar borradores de respuestas sobre literatura o terminología médica, siempre con revisión humana y sin uso clínico.
- **Generación de resúmenes de documentos biomédicos largos**: si se confirma la ventana de 32.768 tokens que usa el proveedor para el checkpoint hermano, permitiría condensar artículos o informes extensos en una sola pasada.
- **Destilación y generación de datos sintéticos**: al ser pequeño y de licencia Apache 2.0, puede emplearse para producir corpus sintéticos de dominio médico que luego filtren modelos mayores.
- **Pruebas de integración de infraestructura**: su compatibilidad declarada con text-generation-inference y endpoints permite validar despliegues y medir latencia antes de pasar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base o con checkpoints hermanos.

## Requisitos de hardware

- **Peso de los parámetros en BF16**: ≈8,05 GB (4.022.468.096 parámetros × 2 bytes). El repositorio ocupa 25,7 GB porque incluye el export BF16 más el checkpoint nativo de entrenamiento.
- **VRAM estimada para inferencia**: ≈10-12 GB en BF16 incluyendo caché KV para contextos moderados; ≈5-6 GB en cuantización de 8 bits; ≈3-4 GB en 4 bits (estas cifras son estimaciones a partir del número de parámetros, no mediciones publicadas).
- **Caché KV**: para la arquitectura del base (36 capas, 8 cabezas KV, `head_dim` 128) se estiman ≈144 KB por token en BF16, es decir, ≈4,6 GB adicionales para 32.768 tokens de contexto. Estimación derivada de la configuración del modelo base, no verificada en esta ficha.
- **GPU consumer**: cabe con holgura en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en RTX 4080/4070 Ti Super (16 GB) conviene cuantizar o limitar el contexto.
- **GPU de datacenter**: A100 40/80 GB, H100, L40S o A10G son suficientes y permiten lotes grandes y contextos largos.
- **Opciones de despliegue**: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y servidores de terceros ya listados en la búsqueda (Featherless, FriendliAI). Para vLLM, llama.cpp u Ollama no hay confirmación explícita: no se publican pesos GGUF y la compatibilidad con vLLM no está documentada.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Estado |
|---|---|---|---|---|---|
| `qwen3-4b-medicine-static-pilot-261016-step-037` (este) | 4,02 B denso | No disponible en esta ficha (32.768 en el hermano `step-002`) | Médico (ajuste RL, paso 37) | Apache 2.0 | Checkpoint experimental |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | 4,02 B denso | 262.144 tokens (según el modelo base) | General | Apache 2.0 | Modelo publicado y documentado |
| `qwen3-4b-medicine-static-pilot-261016-step-002` (hermano) | 4,02 B denso | 32.768 tokens según ficha de Featherless | Médico (paso 2) | Apache 2.0 | Checkpoint experimental |
| `qwen3-4b-medicine-static-pilot-261016-step-003` (hermano) | 4,02 B denso | No disponible | Médico (paso 3) | Apache 2.0 | Checkpoint experimental |
| `qwen3-4b-rar-medicine-static-r0-matched-seed11-step-042` (hermano) | 4,02 B denso | No disponible | Médico (variante `rar`, paso 42) | Apache 2.0 | Checkpoint experimental |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otros autores (por ejemplo, ajustes médicos sobre Mistral o Llama); no disponible.

## Limitaciones y advertencias

- **Checkpoint intermedio, no final**: el paso 37 de una ejecución piloto no implica convergencia; el comportamiento puede ser inestable o estar a medio entrenar. No debe tratarse como un modelo terminado.
- **Ausencia total de evaluación**: no hay benchmarks, ni evaluación clínica, ni comparación con el modelo base. No hay evidencia publicada de que el ajuste mejore al base en tareas médicas.
- **Riesgo alto de alucinación en dominio sanitario**: un modelo de 4 B ajustado sobre datos no documentados puede producir afirmaciones médicas plausibles pero falsas. Uso clínico desaconsejado sin validación externa y supervisión de profesionales.
- **Datos de entrenamiento no documentados**: se desconoce la procedencia, licencia y composición del corpus médico, lo que impide evaluar sesgos, contaminación de benchmarks o cumplimiento normativo (por ejemplo, RGPD si hubiera datos de pacientes).
- **Sesgos no caracterizados**: sin model card descriptiva ni evaluación de sesgos demográficos, lingüísticos o culturales.
- **Idiomas no declarados**: no se especifica qué idiomas conserva el ajuste; es posible una degradación del multilingüismo del base en favor del inglés médico.
- **Contexto efectivo incierto**: aunque el base declare 262.144 tokens, el proveedor sirve el hermano `step-002` con 32.768; conviene asumir 32.768 como límite práctico hasta verificar la configuración.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y regulatoria sobre las salidas en contextos sanitarios; el autor no ofrece garantías.
- **Sin soporte ni mantenimiento**: 0 likes y 270 descargas en el momento de la consulta; no hay comunidad, issues ni garantía de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-037
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano `step-002` en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002
- Checkpoint hermano `step-003` en FriendliAI: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-003
- Checkpoint hermano `qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000`: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000
- Checkpoint hermano `qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-007`: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-007
- Checkpoint hermano `qwen3-4b-rar-medicine-static-r0-matched-seed11-step-042` (registro en Free2AITools): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-042
