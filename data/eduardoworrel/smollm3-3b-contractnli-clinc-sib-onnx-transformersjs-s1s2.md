# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es una especialización del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel. No se trata de un modelo de lenguaje generalista, sino de un "especialista" en toma de decisiones tipadas (typed decisions) sobre tres tareas concretas: inferencia de cláusulas contractuales (ContractNLI), clasificación de intenciones conversacionales (CLINC150) y clasificación de temas multilingüe (SIB-200). El modelo combina los pesos cuantizados a int4 del SmolLM3-3B con cabezas de decisión (decision heads) entrenadas específicamente para estas tareas, siguiendo el paradigma "S1S2" (sistema dual, rápido y lento) que el autor documenta en su repositorio.

La relevancia de esta ficha radica en su formato de despliegue: está empaquetada para Transformers.js con ONNX int4, lo que permite ejecutar el modelo directamente en el navegador (WebGPU o CPU vía WASM) sin necesidad de infraestructura de servidor. Esto la hace útil para aplicaciones web que requieren clasificación o decisión local con privacidad de datos, aunque con limitaciones claras de rendimiento y de alcance funcional. El repositorio ocupa 1,8 GB e incluye los pesos ONNX, las cabezas de decisión y los manifiestos de tareas.

Es importante subrayar que este modelo no es un generador de texto de propósito general: la generación de texto es una capacidad secundaria, usada principalmente para explicar decisiones cuando la confianza del cabezal es baja. Su licencia CC BY-SA 4.0 impone obligaciones de compartir igual, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de decisión adicionales; grafo ONNX para Transformers.js |
| Parametros totales | 3B (modelo base SmolLM3-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (ONNX q4); el repositorio incluye `onnx/model_q4.onnx` |
| Idiomas soportados | en, pt (segun tags y model card); SIB-200 cubre clasificacion de temas multilingue, pero los manifiestos incluidos son en y pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int4) + cabezas de decisión en `heads/` + manifiestos JSON; no se listan safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros desarrollado por Hugging Face. Sobre ese backbone, el autor añade cabezas de decisión (decision heads) que se aplican sobre los hidden states en posiciones de lectura específicas, y que producen una distribución de probabilidad sobre las opciones de cada tarea (por ejemplo, Entailment / Contradiction / Not mentioned para ContractNLI). El paradigma S1S2 separa una decisión rápida de una pasada (sistema 1) de una verificación o explicación generativa (sistema 2) que reutiliza los mismos pesos del modelo base.

El entrenamiento de las cabezas se realizó sobre tres conjuntos de datos: ContractNLI (inferencia de cláusulas, CC BY 4.0), CLINC150 (clasificación de intenciones, CC BY 3.0) y SIB-200 (clasificación de temas, CC BY-SA 4.0). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; esa información no está disponible. La innovación técnica destacable es el empaquetado ONNX optimizado para Transformers.js: el grafo fija la dimensión de cabeza del KV cache, lee las filas de tokens de la tabla int4 con operaciones ONNX estándar (en lugar de `com.microsoft GatherBlockQuantized`, sin kernel para CPU de navegador) y divide `lm_head` en cuatro partes a lo largo del vocabulario para que la CPU del navegador quepa en memoria wasm32. El autor reporta paridad byte a byte con la build de referencia ONNX Runtime GenAI: hidden states con diferencia máxima 0 y decisiones idénticas en 20 de 20 prompts de verificación en Node CPU.

## Capacidades

- Toma de decisiones tipadas sobre texto: clasificación de opciones cerradas con probabilidad, confianza y margen (por ejemplo, entailment / contradiction / not mentioned en contratos).
- Inferencia de cláusulas contractuales (ContractNLI) mediante el manifiesto `manifest.json`.
- Clasificación de intenciones conversacionales (CLINC150) mediante `manifest.clinc.json`.
- Clasificación de temas (SIB-200) en inglés y portugués mediante `manifest.sib_en.json` y `manifest.sib_pt.json`.
- Generación de texto explicativo como sistema 2: cuando el margen de decisión es bajo, el modelo puede generar una explicación breve reutilizando los mismos pesos (`s.generate(...)`).
- Ejecución en navegador con Transformers.js: WebGPU y CPU (WASM).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el patrón S1S2 propone un flujo de dos pasos (decisión + explicación), no un agente autónomo.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Revisión automatizada de contratos en el navegador: el modelo clasifica si una hipótesis sobre una cláusula se deduce, contradice o no se menciona en el contrato, sin enviar el texto a un servidor. Es adecuado por su formato ONNX int4 y su ejecución local con WebGPU.
- Asistente legal de primera pasada: un abogado escribe una hipótesis ("la parte receptora debe destruir la información al terminar") y el modelo devuelve la etiqueta con confianza y margen; si el margen es bajo, se genera una explicación para revisión humana.
- Clasificación de intenciones en chatbots: con `manifest.clinc.json`, el modelo etiqueta la intención del usuario en dominios conversacionales, útil para enrutar consultas a flujos específicos sin backend.
- Etiquetado de temas multilingüe en inglés y portugués: con `manifest.sib_en.json` y `manifest.sib_pt.json`, se puede clasificar el tema de un texto para moderación, organización de contenido o análisis de feedback.
- Filtrado de confianza en pipelines de datos: el margen de decisión permite descartar automáticamente casos ambiguos y derivarlos a revisión humana o a un modelo mayor, reduciendo costes de anotación.
- Aplicaciones web con privacidad por diseño: al ejecutarse en el navegador, los textos sensibles (contratos, consultas de usuarios) no salen del dispositivo, lo que encaja con requisitos de RGPD en despliegues europeos.
- Prototipado rápido de clasificadores sin infraestructura: un equipo puede cargar el manifiesto desde Hugging Face y obtener decisiones en una página web en minutos, sin GPU ni servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta verificaciones de paridad y latencias medidas:

| Metrica | Entorno | Resultado |
|---|---|---|
| Paridad de hidden states (20 prompts) | Node CPU, onnxruntime-node 1.30.0, transformers.js 4.3.1 | Diferencia máxima 0 |
| Paridad de probabilidades de cabeza (20 prompts) | Node CPU | Diferencia máxima 0 |
| Paridad de decisiones (20 prompts) | Node CPU | 20/20 iguales |
| Paridad de decisiones (10 prompts) | Chrome 157 WebGPU, Apple M2 Pro | 10/10 iguales |
| Diferencia de probabilidad de cabeza | Chrome 157 WebGPU vs GenAI | Máximo 0,0036 |
| Latencia por decisión | Chrome 157 WebGPU, Apple M2 Pro | 0,65 s |
| Memoria de página | Chrome 157 WebGPU | 0,5 GB (buffers GPU no contados) |
| Latencia por decisión | Chrome 157 CPU (WASM) | 10,2 s |
| Memoria de página | Chrome 157 CPU (WASM) | 2,8 GB (pico de pestaña 5,4 GB durante carga) |
| Acuerdo WebGPU vs CPU | 20 prompts | 20/20 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra de VRAM; el modelo se distribuye en int4 con un repositorio de 1,8 GB, por lo que en GPU el peso ronda ese orden de magnitud.
- GPU recomendadas: no se especifican; el autor mide en Apple M2 Pro con WebGPU. Para servidores, una GPU con soporte WebGPU o una RTX 4090 sería sobredimensionada para 3B en int4, pero no hay datos de rendimiento en esas GPU.
- ¿Cabe en GPU consumer? Sí, por tamaño (3B en int4), aunque la model card no aporta mediciones en RTX 4090, RTX 3060 u otras.
- Despliegue: Transformers.js en navegador (WebGPU o CPU WASM), onnxruntime-node en Node, y la build de referencia ONNX Runtime GenAI en el repositorio hermano.
- Latencia y throughput: 0,65 s por decisión en WebGPU (M2 Pro, Chrome 157) y 10,2 s por decisión en CPU WASM; no se reporta throughput agregado ni latencia en GPU de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 3B | No disponible | ONNX int4 + cabezas | CC BY-SA 4.0 | Especialista en decisiones tipadas, navegador |
| SmolLM3-3B (base) | 3B | No disponible en esta ficha | Safetensors, GGUF (segun el modelo base) | Apache 2.0 | Generación de texto generalista |
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 (build hermana) | 3B | No disponible | ONNX Runtime GenAI int4 | CC BY-SA 4.0 | Misma especialización, formato servidor |

La comparativa con alternativas de la misma categoría (clasificadores de contratos o intenciones) no está disponible en la información proporcionada; no se aportan datos de rendimiento frente a otros modelos.

## Limitaciones y advertencias

- Las cabezas de decisión son archivos separados en `heads/` y solo las aplica la librería s1s2; Transformers.js por sí solo no las lee.
- `pipeline("decision")` lee logits de etiquetas de opción, no la cabeza entrenada: en las pruebas del autor coincide con la cabeza en 17 de 20 prompts, por lo que se recomienda usar s1s2.
- El grafo tiene la dimensión de cabeza del KV cache fijada, lo que limita la flexibilidad de configuración.
- En CPU de navegador (WASM) la latencia es alta (10,2 s por decisión) y el consumo de memoria es elevado (pico de pestaña de 5,4 GB durante la carga).
- La licencia CC BY-SA 4.0 es ShareAlike: obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios; además exige atribución a SIB-200, ContractNLI, CLINC150 y al modelo base.
- Idiomas: solo en y pt según los manifiestos incluidos; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación: la generación de explicaciones (sistema 2) puede producir texto plausible pero incorrecto; debe tratarse como apoyo, no como verificación.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el backbone SmolLM3-3B, arrastra los sesgos de sus datos de entrenamiento, no detallados aquí.
- Contexto máximo: no disponible; no se debe asumir una ventana larga para contratos extensos sin verificarla.
- Los datos de paridad proceden de 20 prompts de verificación escritos por el autor, no de un conjunto de test independiente.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Repositorio hermano (ONNX Runtime GenAI): https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Código de decisión (referencia): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de Transformers.js para `pipeline("decision")`: https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado en tags: arxiv:2611.15302 (no verificado en la información proporcionada)
