# Nekodeus/qwen2-5-3b-instruct-openvino

## Resumen

Nekodeus/qwen2-5-3b-instruct-openvino es una conversión a formato OpenVINO IR del modelo Qwen/Qwen2.5-3B-Instruct, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Qwen2.5-3B-Instruct se han convertido con `optimum-cli` a representación intermedia de OpenVINO y cuantizado a INT8 en los pesos (weight-only), manteniendo activaciones en FP16/FP32 según el trazado. El objetivo es ejecutar el modelo de forma eficiente sobre CPU Intel sin necesidad de GPU, aprovechando el runtime de inferencia de OpenVINO.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de aproximadamente 3.000 millones de parámetros, ajustado por instrucciones y con una ventana de contexto declarada de 32.768 tokens. La conversión conserva la licencia Apache-2.0 del original y se distribuye con tres componentes IR: el modelo, el tokenizador y el detokenizador. El repositorio ocupa 3,1 GB, coherente con pesos INT8 de un modelo de 3B.

Su relevancia es práctica: permite desplegar un LLM conversacional de gama media en hardware sin acelerador dedicado, con un formato nativo para OpenVINO GenAI y para `optimum-intel`. Es útil para prototipos en CPU, entornos edge con procesadores Intel y escenarios donde no se dispone de GPU pero se necesita un modelo con contexto largo y capacidad de seguir instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), conversión a OpenVINO IR |
| Parametros totales | ~3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El artefacto es una conversión, no un entrenamiento. La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar, ajustado por instrucciones por el equipo de Qwen. La conversión se realizó con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, según declara el autor, en un entorno Kaggle solo-CPU y completamente offline.

La cuantización aplicada es weight-only INT8 mediante NNCF: los pesos se comprimen a 8 bits mientras las activaciones se mantienen en FP16/FP32 según el trazado. No se documentan en la información disponible detalles sobre el dataset de entrenamiento del modelo base, número de tokens, composición del corpus ni si hubo RLHF o DPO. Tampoco se describen innovaciones técnicas propias de esta conversión más allá del pipeline estándar de `optimum-cli export openvino --weight-format int8`.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas de Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a preguntas en formato multi-turno.
- Generación de código y tareas básicas de matemáticas (capacidades del modelo base, no verificadas en esta conversión).
- Ejecución en CPU mediante OpenVINO, sin requerir GPU.
- Integración con `optimum-intel` (`OVModelForCausalLM`) y con OpenVINO GenAI (`ov::genai::LLMPipeline`).
- Contexto de hasta 32.768 tokens según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; es un modelo solo de texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en CPU: desplegar el modelo con OpenVINO GenAI en servidores sin GPU para responder consultas multi-turno, aprovechando la ventana de 32.768 tokens para conversaciones largas.
- Prototipado en portátiles y equipos de sobremesa Intel: usar `optimum-intel` para cargar el modelo en INT8 y validar prompts, plantillas y flujos conversacionales antes de pasar a producción.
- Procesamiento por lotes de documentos en edge: resumir o extraer información de textos extensos en equipos con CPU Intel, donde el contexto largo y el formato INT8 reducen requisitos de memoria.
- Generación de código asistida en entornos locales: integrar el modelo en editores o scripts que se ejecuten en máquinas sin GPU dedicada, siempre que la calidad del base sea suficiente para la tarea.
- Clasificación y etiquetado de texto: usar el modelo como motor de generación para tareas de extracción de entidades o categorización mediante prompts, en pipelines de datos que corren en CPU.
- Base para fine-tuning ligero o evaluación comparativa: servir como punto de partida para experimentos con Qwen2.5-3B en formato OpenVINO, midiendo latencia y calidad en hardware concreto antes de invertir en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el formato está pensado para CPU; el repositorio ocupa 3,1 GB en disco con pesos INT8.
- GPU recomendadas: no disponibles en la información proporcionada; el artefacto está orientado a CPU Intel con OpenVINO.
- ¿Cabe en GPU de consumo? No disponible; el formato OpenVINO IR está pensado para el runtime de OpenVINO, principalmente CPU, y no se documenta soporte GPU en la model card.
- Opciones de despliegue: `optimum-intel` con `OVModelForCausalLM`, OpenVINO GenAI (`ov::genai::LLMPipeline`), y el pipeline de exportación con `optimum-cli export openvino`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/qwen2-5-3b-instruct-openvino | ~3B | 32.768 | OpenVINO IR INT8 | Apache-2.0 | Conversión CPU-oriented de Qwen2.5-3B-Instruct |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 | safetensors | Apache-2.0 | Modelo base original, requiere transformers o runtime compatible |
| Conversiones GGUF de Qwen2.5-3B-Instruct | ~3B | 32.768 | GGUF | Apache-2.0 | Alternativa para llama.cpp/Ollama en CPU y GPU |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de terceros, no un modelo oficial de Qwen; la calidad depende del pipeline de exportación y de la cuantización INT8 aplicada.
- La cuantización weight-only INT8 puede degradar ligeramente la calidad respecto al modelo en FP16/FP32; no se documentan evaluaciones de pérdida de precisión.
- No se detallan los idiomas soportados en la model card; el modelo base es multilingüe, pero no hay garantía documentada para esta conversión.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no apto para tareas de alta precisión sin verificación.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de las dependencias (OpenVINO, optimum-intel).
- El formato OpenVINO IR limita la portabilidad: no se carga directamente con transformers estándar ni con llama.cpp; requiere el runtime de OpenVINO u `optimum-intel`.
- No hay información sobre tool calling, agentes o modo thinking en esta conversión; no asumir estas capacidades sin verificarlas.
- Repositorio con pocas descargas (121) y sin likes; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/qwen2-5-3b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- OpenVINO: https://github.com/openvinotoolkit/openvino
- optimum-intel: https://github.com/huggingface/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
