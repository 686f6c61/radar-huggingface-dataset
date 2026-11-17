# Nekodeus/phi-3-mini-4k-instruct-openvino

## Resumen

Phi-3-mini-4k-instruct OpenVINO (INT8) es una conversión al formato OpenVINO IR del modelo `microsoft/Phi-3-mini-4k-instruct`, publicada por el usuario Nekodeus en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia en CPU mediante el runtime de Intel OpenVINO, con cuantización de pesos a INT8 y un contexto máximo de 4096 tokens. El modelo base es un transformer decoder-only de 3.800 millones de parámetros desarrollado por Microsoft bajo licencia MIT, ajustado por instrucciones y con plantilla de chat incluida.

La relevancia de esta ficha es práctica: permite ejecutar un LLM de casi 4B parámetros en hardware sin GPU dedicada, usando `optimum-intel` o la API C++ de OpenVINO GenAI. El repositorio ocupa 3,8 GB y se distribuye en tres artefactos IR (modelo, tokenizador y detokenizador), lo que simplifica el despliegue en entornos de borde, portátiles y servidores sin aceleradores.

Cabe señalar que la model card es muy escueta: no documenta idiomas soportados, datos de entrenamiento ni resultados de benchmarks. La información sobre arquitectura y capacidades procede del modelo base de Microsoft, no de la conversión, que preserva el comportamiento del original salvo por los efectos de la cuantización INT8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi3ForCausalLM) |
| Parámetros totales | 3.800 millones (3,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | Pesos INT8 (NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible en la model card |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del modelo base: un transformer decoder-only denso de 3,8B parámetros con atención multi-cabeza estándar y RoPE para codificación posicional, implementado en `transformers` como `Phi3ForCausalLM`. El proceso de conversión se realizó con `optimum-cli export openvino`, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1` fijado explícitamente para evitar incompatibilidades (la imagen de Kaggle incluía `transformers 5.20.2`, que eliminó `VisionRotaryEmbedding`, importado por `optimum-intel 2.2.0`). También se documenta que el código remoto heredado del repo original leía `rope_scaling["type"]`, clave normalizada a `rope_type` en `transformers` 5.x, por lo que se usó la implementación nativa `Phi3ForCausalLM`.

La cuantización aplicada es weight-only INT8 mediante NNCF: los pesos se almacenan en 8 bits y las activaciones se mantienen en FP16/FP32 según el trazado. No hay información en la model card sobre el dataset de entrenamiento, número de tokens, composición de datos ni si hubo RLHF o DPO; esos detalles corresponden al modelo base de Microsoft y no se reproducen en esta conversión. La innovación técnica destacable es exclusivamente la del pipeline de exportación: conversión totalmente offline, sin token de Hugging Face, ejecutada en un entorno CPU-only de Kaggle.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo instruct.
- Razonamiento de propósito general y respuesta a instrucciones en dominios comunes.
- Generación de código y resolución de problemas matemáticos de complejidad moderada, heredado del ajuste del modelo base.
- Soporte de conversaciones multi-turno dentro de la ventana de 4096 tokens.
- Inferencia en CPU mediante OpenVINO, sin necesidad de GPU.
- Integración con `optimum-intel` (Python) y OpenVINO GenAI (`ov::genai::LLMPipeline` en C++).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en local para portátiles sin GPU: el modelo se ejecuta en CPU con OpenVINO y una ventana de 4096 tokens, suficiente para sesiones de chat de varias interacciones sin acelerador dedicado.
- Despliegue en dispositivos de borde y sistemas embebidos x86: la combinación de INT8 y OpenVINO IR reduce el peso a 3,8 GB y permite integrar el modelo en aplicaciones de escritorio o kioscos con `ov::genai::LLMPipeline`.
- Generación de código asistida en entornos de desarrollo sin conexión: al ser una conversión offline y con licencia MIT, puede empaquetarse en herramientas internas de autocompletado o explicación de fragmentos de código.
- Procesamiento por lotes de texto en servidores CPU: clasificación, resumen o reescritura de documentos donde no hay GPU disponible y el throughput prima sobre la latencia interactiva.
- Prototipado rápido de aplicaciones LLM: el script de reproducción con `optimum-cli` permite regenerar la conversión y ajustar la cuantización según el hardware objetivo.
- Educación e investigación reproducible: al ser una conversión documentada paso a paso, sirve como referencia para estudiar el efecto de la cuantización INT8 en un modelo de 3,8B sobre tareas instruct.
- Sustitución de APIs en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, evita enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en FP16, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización INT8.

## Requisitos de hardware

- VRAM estimada: no aplica, la conversión está orientada a CPU; el repositorio ocupa 3,8 GB en disco.
- GPU recomendadas: no se especifican; OpenVINO puede usar iGPU Intel, pero la model card solo documenta ejecución en CPU (`"CPU"` en el ejemplo C++).
- Compatibilidad con GPU de consumo: no documentada para esta conversión concreta.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), y regeneración vía `optimum-cli export openvino`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Nekodeus/phi-3-mini-4k-instruct-openvino | 3,8B | 4096 | INT8 (pesos) | MIT | OpenVINO IR |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4096 | FP16/BF16 original | MIT | safetensors |
| Otras conversiones OpenVINO de Phi-3-mini | 3,8B | 4096 | INT8/INT4 según autor | MIT | OpenVINO IR |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. La diferencia principal frente al modelo original es el formato y la cuantización, no la arquitectura ni el entrenamiento.

## Limitaciones y advertencias

- La model card no documenta los idiomas soportados; el comportamiento multilingüe depende del modelo base y no está verificado en esta conversión.
- La cuantización INT8 weight-only puede introducir degradación en tareas sensibles a la precisión numérica (matemáticas, código complejo); no se han publicado evaluaciones que la cuantifiquen.
- Riesgo de alucinación inherente a los LLM de 3,8B, especialmente en dominios especializados y con contextos cercanos al límite de 4096 tokens.
- Ventana de contexto de 4096 tokens: insuficiente para documentos largos, análisis de repositorios completos o conversaciones muy extensas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar las condiciones de las dependencias (`optimum-intel`, `openvino`, `transformers`) en el despliegue final.
- El uso de `transformers 5.16.1` fijado es un requisito de reproducibilidad: versiones posteriores pueden romper el script de conversión.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad sin validación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/phi-3-mini-4k-instruct-openvino
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Documentación de optimum-intel: no disponible en la información proporcionada
- Documentación de OpenVINO GenAI: no disponible en la información proporcionada
- Paper de Phi-3: no disponible en la información proporcionada
