# opticsWolf/strands-decider-2B-qwen3.5-v1-2610-onnx

## Resumen

strands-decider-2B-qwen3.5-v1-2610-onnx es la conversión a ONNX de un modelo de decisión de 2.000 millones de parámetros derivado de Qwen3.5-2B-Base. El autor de la conversión es opticsWolf; el modelo original lo publica StrandsAgents. No es un modelo generativo al uso: es un clasificador que, dada una secuencia de entrada (`input_ids`), una posición de respuesta (`answer_pos`) y un conjunto de posiciones candidatas (`option_pos`), devuelve logits sobre las K opciones disponibles. Resuelve el problema de seleccionar una opción entre varias dentro de un pipeline de agentes ("strands"), empaquetando la decisión en un único grafo ONNX fusionado.

La relevancia práctica está en su formato: un solo grafo con el LoRA ya fusionado, la cabeza de puntero integrada en fp32 y las cachés vacías como ceros dentro del grafo, lo que simplifica el despliegue con onnxruntime sin dependencias de PyTorch ni del stack de Hugging Face Transformers. Se ofrecen tres variantes de pesos: fp32 (7,5 GB), q8 (1,7 GB) y q4f16 (1,1 GB), con métricas de paridad declaradas frente al motor torch original.

El repositorio ocupa 10,5 GB en total y la licencia es Apache-2.0, heredada del modelo base. La información pública disponible es escasa: no hay datos de idiomas soportados, benchmarks de calidad de decisión ni documentación sobre el dataset de entrenamiento del LoRA original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B-Base) con LoRA de rango 48 fusionado y cabeza de puntero (pointer head) para selección de opciones |
| Parametros totales | 2B (heredados de Qwen3.5-2B-Base; el LoRA fusionado no altera el recuento de forma significativa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | fp32, q8 (MatMul de 8 bits, embeddings de 4 bits), q4f16 (pesos de 4 bits, cabeza en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `.onnx_data`), con variantes fp32, q8 y q4f16 |
| Entradas | `input_ids [B, L]`, `attention_mask [B, L]`, `answer_pos [B]`, `option_pos [B, K]` |
| Salida | `logits [B, K]` (dividir por `decider.temperature_by_kind[type]` de `config.json` y aplicar softmax) |
| Librería | onnxruntime |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 10,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-2B-Base en su revisión `b1485b2f`, sobre el que se ha aplicado un LoRA de rango 48 que se fusiona en los pesos base. La conversión mapea los pesos a los grafos de texto de OPT (con una similitud coseno de 0,993 respecto a los pesos instruct), descarta el `lm_head` y sustituye la generación de tokens por una cabeza de puntero fusionada en fp32 que puntúa las posiciones candidatas indicadas en `option_pos`. Las cachés de atención se materializan como ceros dentro del grafo, de modo que el modelo es un grafo único sin estado entre llamadas.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si el LoRA se entrenó con RLHF, DPO o supervisión directa sobre pares (contexto, opción correcta). Tampoco se documenta la innovación algorítmica del decider más allá de la formulación pointer-based. La conversión a ONNX se realizó con el pipeline `conversion/` del repositorio onnx-community/strands-decider-2B-hobson-v19-ONNX.

## Capacidades

- Clasificación de decisiones: selecciona una opción entre K candidatas puntuando posiciones concretas del contexto de entrada, no mediante generación autoregresiva.
- Salida calibrable: los logits deben dividirse por una temperatura por tipo de decisión (`decider.temperature_by_kind[type]` en `config.json`) antes del softmax.
- Integración en pipelines de agentes: el formato de entrada (`answer_pos`, `option_pos`) está pensado para motores de decisión tipo strands.
- Inferencia en un único grafo ONNX sin estado, apta para ejecución con onnxruntime en CPU y GPU.
- Tres niveles de precisión (fp32, q8, q4f16) con distinto compromiso entre fidelidad y tamaño.
- No dispone de generación de texto libre, tool calling, visión, audio ni modo de razonamiento extendido: el `lm_head` se ha eliminado explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en agentes: dado un contexto de conversación y un conjunto de acciones posibles, el modelo puntúa cada opción y devuelve la más probable; encaja en orquestadores que necesitan elegir herramienta o siguiente paso sin invocar un LLM generativo.
- Clasificación de intenciones en atención al cliente: con las opciones definidas como intenciones (consulta de facturación, cancelación, soporte técnico), el modelo produce una distribución sobre ellas en una sola pasada.
- Selección de respuesta en sistemas RAG: dadas varias respuestas candidatas generadas por otro modelo, el decider puntúa cuál es la más adecuada al contexto.
- Despliegue en entornos con restricciones de memoria: la variante q4f16 (1,1 GB) permite ejecutar el clasificador en máquinas sin GPU dedicada o en contenedores con límites estrictos.
- Validación en pipelines de CI/CD: la variante fp32 con paridad declarada de 0,0021 frente al motor torch permite sustituir este último en pruebas de regresión sin cambiar los resultados esperados.
- Servicio de bajo coste por petición: al ser un grafo único sin estado y sin generación autoregresiva, el coste por inferencia es una pasada forward sobre la longitud de entrada, adecuado para clasificación de alto volumen.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí publica métricas de paridad numérica entre las variantes ONNX y el motor torch de referencia en fp32, sobre 11 casos de referencia:

| Variante | Peor desviación vs torch fp32 | Cambios de argmax |
|---|---|---|
| fp32 fusionado | 0,0021 | 0 |
| q8 fusionado | 0,0504 | 0 |
| q4f16 fusionado | 0,2074 | 1 (en tabs/dev) |

No se han publicado resultados de benchmarks de calidad de decisión en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,5 GB para fp32, 1,7 GB para q8 y 1,1 GB para q4f16, más el overhead de activaciones según la longitud de secuencia.
- GPU recomendadas: A100 o H100 para fp32 en producción de alto throughput; RTX 4090 o L4 para q8 y q4f16.
- Cabe en GPU de consumo: sí, la variante q4f16 (1,1 GB) y q8 (1,7 GB) caben en tarjetas de 4-8 GB; fp32 requiere al menos 8-10 GB.
- Despliegue: onnxruntime (CPU y GPU) es la vía nativa; también puede servirse mediante ONNX Runtime Server o integrado en aplicaciones Python con el runtime de onnxruntime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión pointer-based en el ecosistema público. Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610-onnx | 2B | no disponible | ONNX (fp32/q8/q4f16) | Apache-2.0 |
| Qwen/Qwen3.5-2B-Base | 2B | no disponible | safetensors | no disponible en la información |
| StrandsAgents/strands-decider-2B-qwen3.5-v1-2610 | 2B | no disponible | safetensors (torch) | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: el `lm_head` se ha eliminado, por lo que no puede producir texto libre ni usarse como chatbot.
- La variante q4f16 presenta una desviación máxima de 0,2074 frente a torch fp32 y un cambio de argmax en los casos de prueba; para decisiones sensibles conviene usar fp32 o q8.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de robustez.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de decisión errónea si las opciones candidatas o las posiciones (`option_pos`) se construyen incorrectamente.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y del LoRA original; conviene verificar las condiciones de StrandsAgents/strands-decider-2B-qwen3.5-v1-2610.
- El repositorio tiene 25 descargas y ningún like en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- No se documenta la longitud de contexto máxima soportada, lo que impide planificar despliegues con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opticsWolf/strands-decider-2B-qwen3.5-v1-2610-onnx
- Modelo original (StrandsAgents): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base (Qwen3.5-2B-Base): https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Pipeline de conversión de referencia: https://huggingface.co/onnx-community/strands-decider-2B-hobson-v19-ONNX
