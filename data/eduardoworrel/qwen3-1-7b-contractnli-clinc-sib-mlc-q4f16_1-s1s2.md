# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2 es una compilación especializada del modelo base Qwen/Qwen3-1.7B de Alibaba Cloud, publicada por el usuario eduardoworrel. El modelo ha sido afinado mediante LoRA sobre tres tareas de clasificación y comprensión: ContractNLI (inferencia de cláusulas en contratos legales), CLINC150 (clasificación de intenciones con detección de dominios fuera de alcance) y SIB-200 (clasificación temática multilingüe). El resultado se ha fusionado con el modelo base en bf16 y posteriormente cuantizado a q4f16_1 para su despliegue en el navegador mediante WebLLM (MLC LLM) con WebGPU.

La relevancia de esta ficha reside en su formato de despliegue: es una build orientada a ejecución local en el navegador, sin servidor, con un peso de repositorio de 1,0 GB y un contexto de 4096 tokens. No es un modelo de propósito general, sino un especialista con cabezas de clasificación entrenadas que, en este formato concreto, se leen mediante los logits de la etiqueta expuestos por WebLLM. El autor advierte explícitamente de que la build de referencia es la versión GenAI ONNX int4, y que esta build MLC solo debe usarse si la aplicación ya integra WebLLM 0.2.86.

Arquitectónicamente hereda el transformer denso de Qwen3-1.7B, con 1,7 mil millones de parámetros y licencia CC BY-SA 4.0 derivada de la inclusión de SIB-200 en los datos de entrenamiento. El modelo está pensado para tareas de decisión acotadas (sí/no, opción múltiple sobre etiquetas fijas) más que para generación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con cabezas de clasificación afinadas por LoRA y fusionadas |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en `gen_config`, prefill chunk 1024) |
| Tipos de cuantizacion | q4f16_1 (pesos int4, activaciones fp16) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las tareas cubren inglés y portugués en SIB-200) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | MLC (params_shard_*.bin, tensor-cache.json, mlc-chat-config.json, model-lib.wasm) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,7 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA para tres tareas de clasificación: ContractNLI (entailment, contradicción o mención de hipótesis sobre contratos), CLINC150 (intención de dominio con detección de fuera de alcance) y SIB-200 (clasificación temática multilingüe). El adaptador LoRA se fusionó con el modelo base en bf16, y después se convirtió a MLC con `mlc_llm convert_weight --quantization q4f16_1`, generando la configuración con contexto 4096 y prefill chunk 1024 para coincidir con la librería precompilada de WebLLM.

La innovación técnica principal no está en el entrenamiento sino en el empaquetado: el modelo se distribuye como artefacto ejecutable en navegador mediante WebLLM y WebGPU, con un `model-lib.wasm` oficial precompilado para esta arquitectura (Apache-2.0, de mlc-ai/binary-mlc-llm-libs). La model card menciona además la inspiración en el esquema System 1 / System 2 y en la idea de "margin gate" de CT0 (Alias Robotics), así como el paper Browser Immune System (arXiv 2611.15302) como precursor. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las tres fuentes citadas.

## Capacidades

- Clasificación de cláusulas contractuales (ContractNLI): decide si una hipótesis se deriva, se contradice o no se menciona en un contrato.
- Clasificación de intenciones con detección de fuera de alcance (CLINC150): distingue consultas dentro de dominio frente a consultas fuera de alcance.
- Clasificación temática multilingüe (SIB-200): etiqueta temas en inglés y portugués según los manifiestos disponibles.
- Lectura de decisiones mediante logits de etiqueta: el modelo responde eligiendo la opción cuyo token (" A", " B", ..., " Yes"/" No") presenta mayor logit tras la señal de respuesta.
- Salida estructurada con `choice`, `confidence` y `margin` a través de la API de `@s1s2/web`.
- Ejecución en navegador con WebGPU mediante WebLLM 0.2.86, sin servidor.
- Soporte de manifiestos por tarea (`manifest.cnli.json`, `manifest.clinc.json`, `manifest.sib_en.json`, `manifest.sib_pt.json`).
- No se documenta soporte de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Revisión automatizada de contratos: el modelo puede evaluar hipótesis concretas sobre un NDA o contrato y devolver si se derivan, se contradicen o no se mencionan, integrándose en un flujo de revisión legal asistida. Es adecuado porque la tarea ContractNLI está específicamente entrenada y el contexto de 4096 tokens cubre documentos de tamaño moderado.
- Enrutado de consultas en atención al cliente: con CLINC150, el modelo clasifica la intención del usuario y detecta consultas fuera de alcance antes de derivarlas a un humano o a otro sistema, reduciendo respuestas erróneas en dominios no cubiertos.
- Moderación y triaje de formularios: clasificación de texto entrante en categorías predefinidas con umbral de confianza y margen, útil para decidir si un mensaje requiere revisión manual.
- Clasificación temática de contenido multilingüe: uso de los manifiestos SIB-200 en inglés y portugués para etiquetar artículos, tickets o reseñas por tema en aplicaciones web sin backend.
- Asistentes de escritorio o extensiones de navegador con privacidad local: al ejecutarse con WebGPU en el navegador, el texto del usuario no sale del dispositivo, lo que encaja en escenarios con datos sensibles (contratos, consultas internas).
- Demostraciones y prototipos de clasificación en el navegador: permite validar un pipeline de decisión con etiquetas fijas sin infraestructura de servidor, usando la API de `@s1s2/web` y manifiestos por tarea.
- Filtrado previo en pipelines de documentos: decidir si un fragmento contractual o una consulta merece procesamiento posterior por un modelo mayor, actuando como clasificador ligero de primera etapa.

## Benchmarks y rendimiento

Los datos de paridad publicados por el autor comparan esta build con el modelo sin cuantizar (PyTorch fp32) y con la build GenAI int4, sobre ítems de desarrollo (no de test), en Chrome con WebGPU sobre Apple M2 Pro:

| Tarea | Ítems | Esta build = sin cuantizar | GenAI int4 = sin cuantizar | Esta build = GenAI (logits) | Esta build = cabeza GenAI (por defecto) | Mediana ms por decisión |
|---|---|---|---|---|---|---|
| CLINC150 fuera de alcance | 30 | 22/30 | 20/30 | 22/30 | 8/30 | 1161 |
| ContractNLI | 20 | 16/20 | 14/20 | 11/20 | 11/20 | 5671 |
| SIB-200 inglés | 20 | 19/20 | 19/20 | 18/20 | 19/20 | 282 |
| SIB-200 portugués | 20 | 18/20 | 18/20 | 17/20 | 17/20 | 344 |

Frente al modelo sin cuantizar, esta build y la GenAI int4 son aproximadamente igual de cercanas (75 frente a 71 de 90 ítems). La lectura por logits de etiqueta y la cabeza entrenada discrepan con frecuencia en este especialista (GenAI logits frente a cabeza GenAI: CLINC150 10/30, ContractNLI 11/20). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,0 GB con pesos q4f16_1; el consumo en ejecución depende del navegador y del backend WebGPU, pero el tamaño de pesos sugiere un uso moderado de memoria gráfica.
- GPU recomendadas: el autor reporta pruebas en Apple M2 Pro con WebGPU en Chrome; no se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; requiere un navegador con soporte WebGPU (Chrome en la prueba reportada).
- Opciones de despliegue: WebLLM 0.2.86 (`@mlc-ai/web-llm`) con WebGPU, a través de la librería `@s1s2/web`; el artefacto incluye `model-lib.wasm` precompilado.
- Latencia: mediana de 1161 ms por decisión en CLINC150, 5671 ms en ContractNLI, 282 ms en SIB-200 inglés y 344 ms en SIB-200 portugués (Chrome, WebGPU, Apple M2 Pro).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (Qwen3-1.7B ContractNLI-CLINC-SIB MLC q4f16_1) | 1,7 B | 4096 | MLC / WebLLM, navegador | CC BY-SA 4.0 | Especialista en tres tareas, lectura por logits de etiqueta |
| eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 1,7 B | no disponible | ONNX GenAI int4 | no disponible en la información | Build de referencia según el autor; usa cabeza entrenada |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en la información | safetensors (formato original) | Apache-2.0 | Modelo base de propósito general, sin cabezas de clasificación |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La build de referencia es la versión GenAI ONNX int4; esta build MLC solo debe usarse si la aplicación ya integra WebLLM 0.2.86.
- WebLLM solo expone los logits, por lo que las cabezas entrenadas no pueden leerse directamente; las respuestas se obtienen de los logits de la etiqueta, lo que produce discrepancias con la cabeza entrenada en CLINC150 y ContractNLI.
- Las preguntas de elección libre leen la letra sin el espacio inicial; se recomienda usar la tarea del manifiesto para mantener fijo el orden de opciones.
- Los resultados de paridad se han medido sobre ítems de desarrollo, no de test, y con muestras pequeñas (20-30 ítems por tarea), por lo que la estimación de precisión es limitada.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike derivada de SIB-200: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial y la redistribución.
- No se declara lista de idiomas soportados; las tareas multilingües documentadas se limitan a inglés y portugués.
- Riesgo de alucinación y de calibración deficiente en las decisiones por logits, especialmente cuando los márgenes entre etiquetas son pequeños (el propio autor lo señala).
- El contexto máximo es de 4096 tokens, insuficiente para contratos o documentos extensos sin troceado previo.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2
- Build de referencia GenAI ONNX int4: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de la librería s1s2: https://github.com/eduardoworrel/s1s2
- WebLLM / MLC LLM: https://github.com/mlc-ai/web-llm
- Librerías precompiladas MLC: https://github.com/mlc-ai/binary-mlc-llm-libs
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Receta de entrenamiento y cabeza pointer (Kev): https://github.com/jaredpalmer/kev
