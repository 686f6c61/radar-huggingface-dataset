# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es una especialización del modelo base Qwen/Qwen3-1.7B publicada por el usuario eduardoworrel. No es un modelo de propósito general, sino un clasificador de decisiones tipadas que combina el modelo base con cabezas de decisión (decision heads) entrenadas sobre tres tareas concretas: inferencia de lenguaje natural sobre contratos (ContractNLI), clasificación de intenciones conversacionales (CLINC150) y clasificación de temas en 200 idiomas (SIB-200). El resultado se empaqueta en formato ONNX con cuantización int4 y una disposición de ficheros compatible con Transformers.js.

La relevancia del modelo radica en su enfoque de doble sistema (S1S2): el modelo puede emitir decisiones rápidas de una sola pasada (sistema 1) y, cuando el margen de confianza es bajo, generar una explicación en lenguaje natural con los mismos pesos (sistema 2). El repositorio ocupa 1,0 GB e incluye los pesos cuantizados, las cabezas de decisión y varios manifiestos de tareas. Está pensado para ejecutarse en el navegador mediante WebGPU o WASM, lo que lo hace útil para aplicaciones cliente sin backend de inferencia.

La licencia es CC BY-SA 4.0, condicionada por el uso de SIB-200 en el entrenamiento. El modelo declara soporte para inglés y portugués, y su pipeline principal es text-generation, aunque su uso real es la clasificación mediante cabezas entrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de decisión externas aplicadas sobre hidden states |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, fichero `onnx/model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (int4), con cabezas en `heads/`, manifiestos JSON y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Sobre él se añaden cabezas de decisión independientes, almacenadas en el directorio `heads/`, que se aplican sobre los hidden states en posiciones de lectura concretas y producen una distribución softmax sobre las opciones definidas en cada manifiesto. La inferencia se realiza con ONNX Runtime; el grafo int4 mantiene la dimensión de cabeza del KV cache fijada para que Transformers.js pueda consumirlo, lee las filas de tokens de la tabla int4 con operaciones ONNX estándar en lugar de `com.microsoft GatherBlockQuantized` y divide `lm_head` en cinco partes a lo largo del vocabulario para que la CPU del navegador quepa en memoria wasm32.

El entrenamiento combina tres conjuntos de datos: ContractNLI (inferencia de lenguaje natural sobre contratos, licencia CC BY 4.0), CLINC150 (clasificación de intenciones conversacionales, CC BY 3.0) y SIB-200 (clasificación de temas en 200 idiomas, CC BY-SA 4.0). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación destacable es el esquema S1S2: una decisión de una pasada con confianza y margen, y una generación de explicación opcional con los mismos pesos cuando el margen cae por debajo de un umbral configurable.

## Capacidades

- Clasificación de decisiones tipadas sobre opciones definidas en un manifiesto (tipo `choice`), con salida de opción, probabilidad y margen.
- Inferencia de lenguaje natural sobre contratos: determinar si una hipótesis se sigue (Entailment), se contradice (Contradiction) o no se menciona (Not mentioned) en el texto contractual.
- Clasificación de intenciones conversacionales en inglés (CLINC150).
- Clasificación de temas en inglés y portugués (SIB-200).
- Generación de texto explicativo con los mismos pesos cuando el margen de la decisión es bajo (sistema 2).
- Ejecución en navegador mediante WebGPU o CPU WASM con Transformers.js.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el esquema S1S2 permite revisión condicional de decisiones, no planificación autónoma.
- Capacidades multilingües: limitadas a inglés y portugués según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión automatizada de contratos: el modelo evalúa hipótesis concretas sobre cláusulas (por ejemplo, obligaciones de devolución o destrucción de información confidencial) y devuelve una decisión con confianza y margen, lo que permite priorizar la revisión humana en los casos de margen bajo.
- Triaje de consultas en atención al cliente: con CLINC150, clasifica la intención de un mensaje entrante en categorías predefinidas antes de enrutarlo a un agente o a un flujo automatizado, ejecutándose en el propio navegador del operador.
- Clasificación temática multilingüe en inglés y portugués: con SIB-200, etiqueta documentos o mensajes por tema en aplicaciones que ya operan con Transformers.js y no quieren desplegar un backend de inferencia.
- Asistentes embebidos en aplicaciones web: al ejecutarse en WebGPU (0,27 s por decisión en un Apple M2 Pro) o en CPU WASM (3,6 s por decisión), permite incorporar clasificación con modelo de 1.700 millones de parámetros sin servidor dedicado.
- Verificación de cumplimiento documental: el par decisión más explicación generada permite auditar por qué el modelo ha clasificado un fragmento como contradictorio o no mencionado, útil en flujos de compliance que requieren trazabilidad.
- Enrutamiento de consultas legales: la combinación de ContractNLI y CLINC150 permite separar consultas contractuales de consultas de otro tipo antes de asignarlas a un especialista.
- Filtrado previo en pipelines de datos: clasificación rápida de documentos por tema o intención en el cliente para reducir el volumen enviado al backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente comprobaciones de paridad entre builds:

| Comprobacion | Entorno | Resultado |
|---|---|---|
| Hidden state en posiciones de lectura | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | max abs diff 0 |
| Probabilidades de cabeza | Node CPU | max abs diff 0 |
| Decisiones | Node CPU, 20 prompts de comprobación | 20/20 iguales al build GenAI |
| Decisiones | Chrome 157 WebGPU (Apple M2 Pro), 10 prompts | 10/10 iguales |
| Probabilidad de cabeza | Chrome 157 WebGPU | max abs diff 0,0026 |
| Latencia por decisión | WebGPU (Apple M2 Pro) | 0,27 s |
| Latencia por decisión | CPU WASM (Chrome 157, Apple M2 Pro) | 3,6 s |
| Memoria de página | WebGPU | 0,6 GB (sin contar buffers GPU) |
| Memoria de página | CPU WASM | 1,9 GB (pico de pestaña 4,2 GB durante la carga) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB en int4, por lo que la huella de pesos ronda ese orden de magnitud.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta mediciones en un Apple M2 Pro con WebGPU.
- Cabe en GPU de consumo: sí, según el tamaño del repositorio (1,0 GB) y la naturaleza cuantizada int4; no se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: Transformers.js con `@huggingface/transformers` (dtype `q4`), paquete `@s1s2/web`, ONNX Runtime (build GenAI de referencia en el repositorio alternativo), WebGPU y CPU WASM en navegador.
- Latencia y throughput: 0,27 s por decisión en WebGPU y 3,6 s por decisión en CPU WASM, medidos en Chrome 157 sobre Apple M2 Pro. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 1.700 M | no disponible | ONNX int4 | CC BY-SA 4.0 | Clasificación con cabezas de decisión y esquema S1S2 |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible | safetensors, GGUF | Apache-2.0 | Generación de texto de propósito general |
| Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 (build alternativo del mismo autor) | 1.700 M | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Misma especialización, formato ONNX Runtime GenAI |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las cabezas de decisión son ficheros separados en `heads/` y Transformers.js por sí solo no las lee; es necesario usar el paquete `s1s2` para obtener las decisiones del modelo entrenado.
- `pipeline("decision")` lee logits de etiquetas de opción, no la cabeza entrenada; según la model card, coincide con la cabeza en 16 de 20 prompts de comprobación, por lo que se recomienda usar `s1s2`.
- El modelo está especializado en tres tareas concretas; no es un modelo de propósito general y su uso fuera de ContractNLI, CLINC150 y SIB-200 no está validado.
- Idiomas soportados limitados a inglés y portugués.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike por el uso de SIB-200 en el entrenamiento; las obras derivadas deben distribuirse bajo la misma licencia y mantener la atribución de ContractNLI, CLINC150 y el modelo base.
- Riesgo de alucinación en la generación de explicaciones del sistema 2: el texto explicativo se produce con los mismos pesos y no está verificado contra el contrato original.
- Umbral de margen bajo (0,2 en el ejemplo de la model card) debe calibrarse por caso de uso; no es un valor universal.
- El grafo int4 modifica el KV cache y `lm_head` respecto al build GenAI; aunque la model card reporta paridad byte a byte en pesos y decisiones, las diferencias de grafo deben tenerse en cuenta al migrar.
- No se detallan sesgos conocidos, composición exacta del dataset de entrenamiento ni número de tokens; no disponible.
- El consumo de memoria en CPU WASM alcanza 1,9 GB de página y 4,2 GB de pico de pestaña durante la carga, lo que puede ser problemático en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build alternativo GenAI: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Código de decisión en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de Transformers.js para pipeline decision: https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado (arXiv:2611.15302): https://arxiv.org/abs/2611.15302
