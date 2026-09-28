# blaj/Qwen3-8B-DFlash-ov-int4

## Resumen

blaj/Qwen3-8B-DFlash-ov-int4 es una conversión a OpenVINO IR del modelo Qwen/Qwen3-8B, publicada por el usuario blaj, en cuantización int4 asimétrica con group size 128 y grafo stateful. El repositorio ocupa 4,9 GB y está pensado para ejecutarse sobre hardware Intel (CPU y gráficas Arc) mediante OpenVINO Model Server. No es un modelo nuevo: la arquitectura y los pesos son los de Qwen3-8B (Qwen3ForCausalLM, 36 capas, hidden size 4096, del orden de 8.000 millones de parámetros), bajo licencia Apache-2.0.

Lo distintivo de esta publicación es que exporta metadatos de localización de hidden states: las 36 capas del decodificador quedan anotadas en el RT info del modelo bajo la clave `hidden_states_decoder_layers`, incluidas las cinco capas (1, 9, 17, 25 y 33) que lee el drafter DFlash de Z-Lab. Sin esa anotación, un runtime de decodificación especulativa no localiza los estados intermedios y cae silenciosamente a decodificación normal, sin emitir ningún error.

El interés del repositorio es, por tanto, de infraestructura: permite experimentar con decodificación especulativa DFlash sobre equipos Intel sin GPU dedicada. El propio autor advierte de que, en el hardware medido (Core Ultra 7 258V con Arc 130V/140V), emparejar el drafter int4 reduce el rendimiento de 22,9 a 16,6 tok/s, de modo que el valor está en habilitar la pareja target+draft y no en una ganancia de velocidad ya demostrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso), 36 capas, hidden size 4096 |
| Parámetros totales | del orden de 8.000 millones (modelo base Qwen3-8B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | int4 asimétrica, group size 128 (pesos); fp16 en la etapa intermedia de conversión |
| Idiomas soportados | no disponible (la ficha no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` más binario de pesos), grafo stateful |
| Modelo base | Qwen/Qwen3-8B |
| Librería | openvino |
| Pipeline | text-generation |
| Tamaño del repositorio | 4,9 GB |
| Fecha de creación (según ficha) | 2026-09-27 |

## Arquitectura y entrenamiento

Este repositorio no implica entrenamiento ni ajuste alguno: es un artefacto de conversión y compresión. El proceso consta de dos etapas documentadas por el autor. La primera exporta el modelo a OpenVINO con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`; la segunda aplica `nncf.compress_weights(..., INT4_ASYM, group_size=128, ratio=1.0)`. El entorno de conversión declarado es transformers 5.5.0 y optimum-intel 2.2.0. Tras la compresión, el autor verifica explícitamente que los localizadores de hidden states siguen presentes, ya que volver a exportar invalidaría su resolución contra el grafo.

La innovación técnica relevante es la anotación de localizadores de hidden states para decodificación especulativa. El drafter DFlash consume estados intermedios del target en capas concretas; aquí se anotan las 36 capas y se señalan las cinco que el drafter lee (1, 9, 17, 25, 33). La anotación no altera la interfaz pública de entrada/salida del modelo: no añade tensores de entrada ni de salida. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y conversación: tarea declarada del repositorio (`text-generation`), heredada del modelo base Qwen3-8B.
- Modo razonamiento: Qwen3 emite contenido de razonamiento (`reasoning_content`) antes del contenido visible (`content`), según advierte la propia model card.
- Código y matemáticas: la descripción pública de Qwen3-8B recogida en la búsqueda web lo presenta como modelo destacado en comprensión y generación de lenguaje, código y matemáticas. No se aportan métricas propias en esta conversión.
- Multilingüismo: Qwen3-8B se describe como modelo multilingüe en fuentes externas, pero esta ficha no declara idiomas soportados; no se puede confirmar el alcance por idioma en esta conversión.
- Decodificación especulativa: el artefacto está preparado para actuar como target DFlash y emparejarse con un drafter compatible.
- Inferencia en hardware Intel: grafo stateful con gestión de caché KV, ejecutable en CPU y en GPU integrada Arc mediante OpenVINO.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte explícito de agentes o multi-step reasoning: no disponible (no se menciona).
- Visión, audio u otras modalidades: no disponible (no se mencionan).

## Casos de uso

- Asistente conversacional local en portátiles con Intel Core Ultra: el modelo en int4 ocupa 4,9 GB y se ejecuta sobre la iGPU Arc con OpenVINO Model Server, lo que permite mantener conversaciones multi-turno sin conexión y sin GPU dedicada.
- Generación de código en estaciones de trabajo sin CUDA: al ser OpenVINO IR, se despliega en equipos Intel donde no hay tarjeta NVIDIA, con los datos del repositorio de código sin salir de la máquina.
- Investigación en decodificación especulativa: sirve como target para medir tasas de aceptación y sobrecarga del drafter DFlash, comparando la configuración con y sin draft en el mismo hardware y con la misma estrategia de decodificación codiciosa.
- Servicio de inferencia en CPU para procesamiento por lotes: la configuración sugerida (`PERFORMANCE_HINT: THROUGHPUT`, `NUM_STREAMS: 2`, `nireq: 8`) está orientada a maximizar el rendimiento agregado en tareas de resumen, clasificación o extracción sobre grandes volúmenes de documentos.
- RAG sobre documentación interna: el grafo stateful facilita la reutilización de la caché KV en interacciones encadenadas; conviene verificar antes la calidad en el idioma objetivo, ya que la ficha no declara idiomas.
- Despliegue en el edge con presupuesto de memoria ajustado: 4,9 GB permiten integrar el modelo en equipos industriales o de retail con 30 GB de RAM como el usado en las pruebas, siempre que se acepte el coste de latencia medido.
- Evaluación comparativa de cuantizaciones sobre OpenVINO: útil para contrastar int4 group-128 frente a fp16 u otras conversiones del mismo modelo base en cuanto a calidad de salida y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una medición de velocidad en hardware concreto: Intel Core Ultra 7 258V (Arc 130V/140V iGPU), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificación codiciosa, 128 tokens nuevos como máximo y media de 4 ejecuciones.

| Configuración | tok/s | Relación con el baseline |
|---|---|---|
| Este target, sin draft | 22,9 | 1,00x |
| Este target + draft DFlash int4 | 16,6 | 0,72x |

El autor indica que la salida codiciosa fue idéntica byte a byte con y sin draft, lo que confirma que el emparejamiento es correcto, y atribuye la pérdida de velocidad a que, en un target tan pequeño, el coste fijo por bloque del drafter supera el ahorro en tokens aceptados. No se aportan tasas de aceptación ni latencia por token.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 4,9 GB, por lo que los pesos en int4 requieren del orden de 5 GB; hay que sumar la caché KV, que crece con la longitud de contexto y el número de secuencias concurrentes.
- Hardware validado: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM, con OpenVINO Model Server 2026.4.0 sobre GPU.
- Cabe en GPU de consumo: sí, en iGPU Intel Arc integradas; también se puede ejecutar en CPU mediante OpenVINO. No hay soporte documentado para CUDA ni ROCm en este repositorio.
- GPU recomendadas: no se indican modelos concretos en la información disponible; el artefacto está orientado a hardware Intel (iGPU Arc y, por extensión, GPU Arc dedicadas), sin datos de rendimiento en A100, H100 o RTX 4090.
- Opciones de despliegue: OpenVINO Model Server (probado), runtime de OpenVINO en Python y optimum-intel para volver a exportar. No se incluyen pesos GGUF, por lo que no es desplegable directamente con llama.cpp u Ollama.
- Throughput medido: 22,9 tok/s sin draft en el hardware indicado, con decodificación codiciosa y 128 tokens nuevos. Con el draft DFlash int4, 16,6 tok/s.
- Configuración sugerida por el autor: `target_device: GPU`, `nireq: 8`, `PERFORMANCE_HINT: THROUGHPUT`, `NUM_STREAMS: 2`. Para acoplar el drafter hay que añadir `draft_models_path` en un `graph.pbtxt`; un emparejamiento correcto registra el mensaje `Draft model strategy: DFlash`.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño del repositorio | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| blaj/Qwen3-8B-DFlash-ov-int4 | OpenVINO IR, stateful | int4 asimétrica group 128 | 4,9 GB | no disponible | Apache-2.0 | Anota localizadores de hidden states para DFlash; medido a 22,9 tok/s sin draft en iGPU Arc |
| OpenVINO/Qwen3-8B-int4-ov | OpenVINO IR | int4 | no disponible | no disponible | Apache-2.0 (según modelo base) | Conversión de referencia del equipo de OpenVINO; en la información disponible no se declaran metadatos de localización de hidden states |
| Qwen/Qwen3-8B | safetensors | fp16/bf16 | no disponible | no disponible | Apache-2.0 | Modelo original, requiere conversión y más memoria que las variantes int4 |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | no disponible | no disponible | no disponible | No es un modelo completo: es el drafter DFlash que se empareja con este target |

## Limitaciones y advertencias

- El emparejamiento con el drafter DFlash int4 degradó el rendimiento en el hardware medido (0,72x respecto al baseline sin draft). El autor señala que el resultado podría invertirse en un target mayor o una GPU más lenta, pero no aporta mediciones que lo respalden.
- El target debe tener una geometría de capas compatible con los `target_layer_ids` del drafter; en caso contrario, el emparejamiento no es válido.
- Los localizadores de hidden states se resuelven contra este grafo exacto: volver a exportar o recompilar el modelo los invalida.
- Qwen3 es un modelo de razonamiento y emite `reasoning_content` antes de `content`; si no se presupuesta suficiente `max_tokens`, la respuesta visible puede quedar vacía.
- La ficha no declara idiomas soportados, por lo que no hay garantía documentada de calidad en castellano ni en otros idiomas.
- No se han publicado evaluaciones de calidad tras la cuantización int4; la degradación frente a fp16 es plausible pero no está cuantificada.
- Sesgos y riesgo de alucinación: no se documentan específicamente en la información disponible; deben asumirse los del modelo base Qwen3-8B.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Dependencia del stack OpenVINO: no se documenta una vía de despliegue alternativa (GGUF, TensorRT, vLLM) para este artefacto.
- Licencia Apache-2.0: permite uso comercial con atribución; la model card pide atribuir a Qwen3 y a la publicación de soporte DFlash de Z-Lab.

## Enlaces

- Repositorio del modelo: https://huggingface.co/blaj/Qwen3-8B-DFlash-ov-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Drafter DFlash de Z-Lab: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Drafters DFlash preconectados en OpenVINO: https://huggingface.co/blaj/Qwen3-DFlash-drafters-ov
- Conversión int4 de referencia de OpenVINO: https://huggingface.co/OpenVINO/Qwen3-8B-int4-ov
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Ficha de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
