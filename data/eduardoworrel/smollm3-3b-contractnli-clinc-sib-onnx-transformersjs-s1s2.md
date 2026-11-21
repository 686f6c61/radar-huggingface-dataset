# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es un modelo especializado derivado de SmolLM3-3B de Hugging Face, publicado por el usuario eduardoworrel. Se trata de una compilación en formato Transformers.js (ONNX, cuantización int4) de un especialista que combina tres tareas de clasificación y decisión: ContractNLI (inferencia de cláusulas contractuales), CLINC150 (clasificación de intenciones conversacionales) y SIB-200 (clasificación temática multilingüe). El modelo conserva los pesos del LLM base pero añade cabezas de decisión entrenadas específicamente para cada tarea, aplicadas mediante la librería s1s2.

La relevancia de este artefacto es fundamentalmente de despliegue: empaqueta un modelo de 3B parámetros en un formato ejecutable en navegador mediante transformers.js, con soporte para WebGPU y CPU (WASM), lo que permite ejecutar tareas de clasificación y decisión enteramente en el cliente sin infraestructura de servidor. La build de referencia es la variante ONNX Runtime GenAI del mismo autor; esta copia mantiene los mismos pesos int4 byte a byte y las mismas cabezas, con cambios en el grafo para adaptarse a transformers.js.

El modelo está pensado para aplicaciones que ya usan transformers.js y necesitan clasificación de documentos legales, detección de intenciones en asistentes conversacionales o categorización temática multilingüe, con la posibilidad de generar explicaciones con los mismos pesos cuando la confianza de la decisión es baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de decisión añadidas para clasificación |
| Parametros totales | 3B (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | int4 (q4) para ONNX; pesos en `onnx/model_q4.onnx` |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int4), layout transformers.js (`config.json` + `onnx/model_q4.onnx`), cabezas en `heads/` |
| Tamaño del repo | 1.8 GB |
| Pipeline | text-generation / text-classification (decision) |
| Librería | s1s2 |
| Modelo base | HuggingFaceTB/SmolLM3-3B (Apache-2.0) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3B parámetros desarrollado por Hugging Face. Sobre ese backbone, el autor ha añadido cabezas de decisión separadas (almacenadas en `heads/`) entrenadas para tres tareas concretas: inferencia de relaciones en contratos (ContractNLI, con opciones Entailment / Contradiction / Not mentioned), clasificación de intenciones conversacionales (CLINC150) y clasificación temática multilingüe (SIB-200, con manifiestos separados para inglés y portugués). Las cabezas se aplican sobre estados ocultos en posiciones de lectura específicas y se combinan con softmax para producir decisiones con probabilidad y margen.

La compilación ONNX int4 modifica el grafo respecto a la build GenAI de referencia: la dimensión de cabeza del KV cache está fijada en el grafo (requisito de transformers.js), las filas de tokens se leen de la tabla int4 con operadores ONNX estándar en lugar de `com.microsoft GatherBlockQuantized` (sin kernel de CPU en navegador), y `lm_head` se divide en cuatro partes a lo largo del vocabulario para que la CPU del navegador quepa en memoria wasm32. El resto del grafo es idéntico al de la build GenAI. La paridad se verificó con 20 prompts de comprobación (no un test set): estados ocultos con diferencia máxima 0, probabilidades de cabeza con diferencia máxima 0 y 20/20 decisiones iguales en Node CPU; en Chrome 157 WebGPU (Apple M2 Pro), 10/10 decisiones iguales y diferencia máxima de probabilidad de 0,0036.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO para las cabezas. Los datos de entrenamiento incluyen SIB-200 (CC BY-SA 4.0), ContractNLI (CC BY 4.0) y CLINC150 (CC BY 3.0), lo que motiva la licencia ShareAlike del conjunto.

## Capacidades

- Decisión de inferencia textual en contratos (ContractNLI): determina si una hipótesis se deriva (Entailment), se contradice (Contradiction) o no se menciona (Not mentioned) en el texto contractual.
- Clasificación de intenciones conversacionales (CLINC150): identifica la intención del usuario en diálogos de asistente.
- Clasificación temática multilingüe (SIB-200): categoriza textos por tema en inglés y portugués.
- Salida estructurada con decisión, probabilidad y margen de confianza, lo que permite umbrales de revisión.
- Generación de texto explicativo con los mismos pesos (`generate`) para justificar decisiones cuando el margen es bajo.
- Ejecución en navegador mediante transformers.js, con soporte WebGPU y CPU (WASM).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; la generación de explicaciones es de un solo paso.
- Capacidades multilingües: limitadas a inglés y portugués según los manifiestos disponibles.

## Casos de uso

- Revisión de contratos en el navegador: una aplicación legal puede cargar el modelo vía transformers.js y evaluar si cláusulas específicas (confidencialidad, devolución de información, terminación) se derivan o contradicen el contrato, sin enviar el documento a un servidor.
- Asistente conversacional con detección de intención en cliente: integración del manifiesto CLINC150 para clasificar la intención del usuario antes de enrutar la consulta, ejecutándose en WebGPU con ~0,65 s por decisión en un Apple M2 Pro.
- Categorización temática de contenido en portugués e inglés: uso del manifiesto SIB-200 para etiquetar artículos, tickets o mensajes por tema en aplicaciones web que ya usan transformers.js.
- Triaje de documentos con umbral de confianza: el margen de decisión permite derivar a revisión humana los casos ambiguos y generar una explicación automática con `generate` para el revisor.
- Herramientas de cumplimiento normativo en el cliente: verificación de cláusulas contractuales en aplicaciones de gestión documental que no pueden enviar datos a la nube por requisitos de privacidad.
- Demos y prototipos sin backend: aplicaciones estáticas que ejecutan clasificación y decisión directamente en el navegador, aprovechando el formato ONNX int4 y el layout transformers.js.
- Clasificación de intenciones en asistentes de voz o chat embebidos: uso del modelo en Node CPU como referencia exacta o en WebGPU para baja latencia en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son de paridad y latencia:

| Metrica | Entorno | Resultado |
|---|---|---|
| Paridad de estados ocultos | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | max \|diff\| 0 |
| Paridad de probabilidades de cabeza | Node CPU | max \|diff\| 0 |
| Decisiones iguales a build GenAI | Node CPU, 20 prompts | 20/20 |
| Decisiones iguales a build GenAI | Chrome 157 WebGPU (Apple M2 Pro), 10 prompts | 10/10 |
| Diferencia máxima de probabilidad de cabeza | Chrome 157 WebGPU | 0,0036 |
| Latencia por decisión | Chrome 157 WebGPU (Apple M2 Pro) | 0,65 s |
| Latencia por decisión | Chrome 157 CPU (WASM) | 10,2 s |
| Memoria de página | WebGPU | 0,5 GB (buffers GPU no contados) |
| Memoria de página | CPU (WASM) | 2,8 GB (pico de pestaña 5,4 GB al cargar) |
| Acuerdo con `pipeline("decision")` de transformers.js | Node CPU, 20 prompts | 17/20 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,8 GB en int4; en WebGPU la memoria de página medida es de 0,5 GB (sin contar buffers GPU); en CPU (WASM) 2,8 GB de página con pico de 5,4 GB durante la carga.
- GPU recomendadas: no se especifican modelos concretos; se ha validado en Apple M2 Pro (WebGPU). Para GPUs discretas se puede asumir que cualquier GPU con soporte WebGPU y suficiente memoria para buffers de 3B en int4 debería funcionar, aunque no hay mediciones publicadas.
- Cabe en consumer GPU: sí, en formato int4 (1,8 GB de pesos) cabe en GPUs de consumo con al menos 4 GB de VRAM, aunque no se han publicado mediciones específicas.
- Opciones de despliegue: transformers.js (navegador con WebGPU o WASM; Node con onnxruntime-node), s1s2 (librería del autor), ONNX Runtime GenAI (build de referencia en el repo hermano). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,65 s por decisión en WebGPU (Apple M2 Pro) y 10,2 s por decisión en CPU WASM en el mismo hardware. No se proporcionan datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 3B | no disponible | ONNX int4 (transformers.js) | CC BY-SA 4.0 | Especialista en decisión/clasificación en navegador |
| SmolLM3-3B (base) | 3B | no disponible | safetensors, GGUF, etc. | Apache-2.0 | LLM generalista |
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 (build hermana) | 3B | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Misma funcionalidad, formato ONNX Runtime GenAI |
| Modelos de clasificación dedicados (p. ej. BERT-base) | ~110M | 512 tokens | safetensors, ONNX | variable | Clasificación clásica, sin generación |

La comparativa con modelos de clasificación dedicados es cualitativa: este modelo ofrece decisión más generación explicativa con los mismos pesos, a costa de un tamaño mucho mayor (3B frente a ~110M) y mayor latencia. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Las cabezas de decisión son archivos separados (`heads/`) y transformers.js por sí solo no las lee; es necesario usar s1s2 para obtener las decisiones entrenadas.
- `pipeline("decision")` de transformers.js lee logits de etiquetas de opción, no la cabeza entrenada: en las comprobaciones coincide solo en 17 de 20 prompts, por lo que se recomienda s1s2 para este modelo.
- El modelo está entrenado con opciones y formulaciones concretas del manifiesto (`lab`); usar otras palabras u opciones puede degradar la precisión.
- Idiomas limitados a inglés y portugués según los manifiestos disponibles.
- La licencia CC BY-SA 4.0 es ShareAlike por la inclusión de SIB-200; el uso comercial requiere cumplir las condiciones de atribución y compartir igual, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinación en la generación de explicaciones (`generate`), ya que se usan los mismos pesos del LLM base sin un entrenamiento específico documentado para esa tarea.
- La decisión de una sola pasada puede no ser fiable con margen bajo; el autor sugiere umbrales (por ejemplo 0,2) que deben medirse en cada caso.
- En CPU (WASM) la latencia es alta (10,2 s por decisión) y el consumo de memoria durante la carga es elevado (pico de 5,4 GB).
- No se han publicado evaluaciones de sesgo, robustez adversarial ni rendimiento en dominios distintos de los de entrenamiento.
- No se detalla la longitud de contexto soportada en la información proporcionada, lo que limita la planificación para documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia ONNX Runtime GenAI: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Código de decisión en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de transformers.js para pipeline("decision"): https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado (arXiv:2611.15302): no disponible como enlace directo en la información proporcionada
