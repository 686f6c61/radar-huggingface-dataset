# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es un modelo especializado derivado de Qwen/Qwen3-0.6B, publicado por el usuario eduardoworrel. No es un modelo de proposito general: es una compilacion ONNX int4 del mismo especialista disponible en formato ONNX Runtime GenAI, redistribuido en el layout que espera Transformers.js (config.json mas onnx/model_q4.onnx) para aplicaciones web que ya usan esa libreria. Incorpora cabezas de decision entrenadas sobre tres tareas de clasificacion: ContractNLI (inferencia de lenguaje natural sobre contratos), CLINC150 (clasificacion de intenciones conversacionales) y SIB-200 (clasificacion de topicos multilingue en ingles y portugues).

El modelo implementa un esquema de "doble sistema" (S1S2): un pase rapido de decision tipada que devuelve una opcion, una confianza y un margen, y un segundo pase generativo que reutiliza los mismos pesos para explicar la decision cuando el margen es bajo. La propuesta es relevante para desarrolladores que necesitan clasificacion ligera en el navegador con WebGPU o WASM, sin infraestructura de servidor, manteniendo paridad numerica con la build de referencia en ONNX Runtime GenAI.

El repositorio ocupa 0,4 GB, declara 480 descargas y esta publicado bajo licencia CC BY-SA 4.0. La model card reporta paridad exacta de estados ocultos y probabilidades de cabeza con la build GenAI en CPU (Node), y diferencias maximas de 0,0055 en probabilidades de cabeza en WebGPU (Chrome 157 sobre Apple M2 Pro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificacion adicionales y esquema dual S1S2 |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, modelo q4) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (config.json + onnx/model_q4.onnx), cabezas en heads/, chat_template.jinja, manifest.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parametros, cuantizado a int4 y exportado a ONNX. Sobre ese backbone se anaden cabezas de decision separadas (almacenadas en heads/) que se aplican sobre estados ocultos en posiciones de lectura concretas; no son parte del grafo ONNX estandar y Transformers.js por si solo no las lee. El esquema S1S2 separa un sistema 1 (decision rapida tipada con opcion, confianza y margen) de un sistema 2 (generacion explicativa con los mismos pesos) que se activa cuando el margen es bajo.

El entrenamiento combina tres conjuntos: ContractNLI (inferencia sobre clausulas contractuales), CLINC150 (intenciones conversacionales) y SIB-200 (topicos multilingue, con licencia CC BY-SA 4.0, lo que fuerza la licencia ShareAlike del derivado). La model card no detalla numero de tokens, composicion exacta del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la paridad numerica entre formatos: estados ocultos bit-identicos en CPU Node frente a la build GenAI, y decisiones identicas 20/20 en WebGPU con diferencias de probabilidad de hasta 0,0055 por diferencias de build de onnxruntime-web (1.31.1 frente a 1.31.0-dev).

## Capacidades

- Clasificacion de inferencia sobre contratos (ContractNLI): determina si una hipotesis se sigue, contradice o no se menciona en el texto contractual.
- Clasificacion de intenciones conversacionales (CLINC150): asigna una intencion a una utterance de usuario.
- Clasificacion de topicos multilingue (SIB-200) en ingles y portugues.
- Decision tipada con salida estructurada: opcion, confianza y margen por pregunta.
- Generacion de texto explicativo con los mismos pesos para justificar decisiones de bajo margen (sistema 2).
- Soporte de multiples preguntas por llamada mediante el objeto questions del manifest.
- Ejecucion en navegador con WebGPU y CPU via WASM mediante Transformers.js.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Revision de clausulas contractuales en el navegador: dado un contrato y una hipotesis (por ejemplo, obligacion de devolver o destruir informacion confidencial), el modelo devuelve Entailment, Contradiction o Not mentioned con confianza y margen, sin enviar el texto a un servidor.
- Triaje de contratos con umbral de revision: las decisiones con margen inferior a 0,2 se derivan a revision humana y se genera una explicacion de dos frases con el sistema 2, lo que permite priorizar casos ambiguos.
- Clasificacion de intenciones en asistentes conversacionales: con el manifest CLINC150, el modelo etiqueta utterances de usuario en el cliente, util para enrutar peticiones en aplicaciones web sin backend.
- Deteccion de topico multilingue en ingles y portugues: con los manifests sib_en y sib_pt, se puede clasificar el tema de un texto en aplicaciones de soporte o moderacion que operen en ambos idiomas.
- Clasificacion offline o en el borde: al ejecutarse en CPU WASM (1,3 s por decision, 1,1 GB de memoria de pagina) o WebGPU (0,14 s por decision, 0,4 GB), encaja en aplicaciones de escritorio Electron o extensiones que no pueden depender de red.
- Prototipado rapido de pipelines de decision: la API decide con manifest.json permite integrar clasificacion tipada en demos de Transformers.js sin entrenar cabezas propias, reutilizando las tres tareas incluidas.
- Verificacion de paridad en CI: los 20 prompts de comprobacion y las metricas de paridad (diferencias de 0 en CPU, 0,0055 en WebGPU) sirven como base para tests de regresion al actualizar onnxruntime o Transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card reporta unicamente comprobaciones de paridad y latencia:

| Metrica | Entorno | Resultado |
|---|---|---|
| Paridad de estados ocultos y probabilidades de cabeza | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1), 20 prompts | max abs diff 0; decisiones 20/20 iguales |
| Paridad de decisiones | Chrome 157 WebGPU (Apple M2 Pro), 20 prompts | 20/20 iguales; max abs diff de probabilidad de cabeza 0,0055 |
| Latencia por decision | Chrome 157 WebGPU (M2 Pro) | 0,14 s |
| Latencia por decision | Chrome 157 CPU WASM (M2 Pro) | 1,3 s |
| Memoria de pagina | WebGPU | 0,4 GB (sin contar buffers GPU) |
| Memoria de pagina | CPU WASM | 1,1 GB (pico de pestana 2,1 GB durante la carga) |
| Coincidencia de pipeline("decision") con la cabeza entrenada | Node CPU, 20 prompts | 13/20 |
| Decisiones que cambian entre WebGPU y CPU | Ambos formatos, 20 prompts | 3/20 (margen bajo, numerica fp16) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int4 de 0,6B ocupa aproximadamente 0,4 GB en disco; en WebGPU la memoria de pagina medida es de 0,4 GB (sin contar buffers GPU), y en CPU WASM 1,1 GB con pico de 2,1 GB durante la carga.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en navegador; la medicion de referencia se hizo en Apple M2 Pro. No se documentan requisitos para A100, H100 o RTX 4090, innecesarias para este tamano.
- Cabe en GPU consumer: si, al ser un modelo de 0,6B cuantizado a int4; el caso de uso principal es el navegador, no servidores dedicados.
- Opciones de despliegue: Transformers.js (WebGPU y WASM), s1s2 (github.com/eduardoworrel/s1s2), ONNX Runtime GenAI (build de referencia en el repositorio hermano) y pipeline("decision") de Transformers.js mediante el PR #1943 (borrador).
- Latencia y throughput: 0,14 s por decision en WebGPU y 1,3 s por decision en CPU WASM sobre Apple M2 Pro con Chrome 157; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 0,6B | no disponible | ONNX int4 | CC BY-SA 4.0 | Especialista en clasificacion con cabezas y esquema S1S2, navegador |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | safetensors, GGUF y otros | Apache 2.0 (segun el modelo base) | Generacion de texto de proposito general |
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 0,6B | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Misma especialidad, build de referencia para ONNX Runtime GenAI |

La comparativa con otros especialistas de clasificacion de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las cabezas de decision son archivos separados en heads/ y Transformers.js por si solo no las lee; sin s1s2 el modelo no ofrece la decision tipada entrenada.
- pipeline("decision") lee logits de etiquetas de opcion, no la cabeza entrenada: coincide con la cabeza en solo 13 de 20 prompts de comprobacion en Node CPU, por lo que se recomienda usar s1s2.
- El grafo ONNX tiene cambios respecto a la build GenAI: dimension de cabeza de KV cache fijada, lectura de filas de la tabla int4 con operaciones ONNX estandar en lugar de GatherBlockQuantized y lm_head dividido en tres partes para caber en memoria wasm32.
- Diferencias numericas entre dispositivos: WebGPU y CPU invierten las mismas 3 de 20 decisiones de margen bajo por numerica fp16, por lo que las comparaciones deben hacerse por dispositivo.
- Riesgo de alucinacion en el sistema 2: las explicaciones generadas por el modelo pueden no reflejar el razonamiento real de la cabeza de decision.
- Cobertura limitada de idiomas: solo ingles y portugues declarados; no se garantiza comportamiento en castellano.
- Licencia CC BY-SA 4.0 con clausula ShareAlike heredada de SIB-200: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial cerrado.
- No se documentan sesgos conocidos, numero de tokens de entrenamiento ni evaluacion en conjuntos de test independientes; los 20 prompts de paridad no constituyen un test set.
- El umbral de margen de 0,2 es un ejemplo de la model card, no un valor calibrado; debe medirse por caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia ONNX Runtime GenAI: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision (decide.ts): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de Transformers.js para pipeline("decision"): https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado (arXiv:2611.15302): https://arxiv.org/abs/2611.15302
