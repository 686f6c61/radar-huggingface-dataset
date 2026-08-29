# iromu/Gemma3-1B-tools-GGUF

## Resumen

El modelo `iromu/Gemma3-1B-tools-GGUF` es una versión fine-tuneada con LoRA del modelo `google/gemma-3-1b-it`, convertida a formato GGUF para su uso con llama.cpp y stacks compatibles. El objetivo principal es dotar a un modelo de solo 1B de parámetros de capacidades fiables de tool calling y de interacción agéntica multi-paso, algo que el modelo base no logra de forma consistente: en la validación publicada, el base solo emite tool calls correctos en un 2% de los casos, mientras que el fine-tune en BF16 alcanza un 66% de coincidencia exacta de argumentos.

El modelo está pensado para despliegues de pequeño tamaño, como edge computing, dispositivos on-device o entornos con recursos limitados, donde se necesita un agente capaz de invocar funciones externas sin depender de modelos grandes. Se distribuye en cuatro cuantizaciones (BF16, Q4_K_M, Q5_K_M y Q8_0) y su licencia es la Gemma de Google, que permite uso comercial con ciertas restricciones. El contexto de entrenamiento se fijó en 4096 tokens, aunque el modelo base Gemma 3 soporta ventanas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-3-1b-it) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 (maximo de entrenamiento; el modelo base soporta mas) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de aproximadamente 1B de parámetros. Sobre él se aplicó un fine-tune con LoRA (PEFT) usando NVIDIA NeMo AutoModel. La configuración LoRA emplea dimensión 32, alpha 32, dropout 0.05 y se aplica a todas las capas lineales `*_proj`. El entrenamiento se realizó con una secuencia máxima de 4096 tokens, learning rate 5e-5 con decaimiento coseno, weight decay 0.01, batch global de 64 (micro batch 2 con 32 pasos de acumulación) y 336 pasos totales (4 épocas) en precisión mixta bf16. La pérdida de validación bajó de 0.579 a 0.4715 en la última época.

El dataset utilizado es el split `sft_tools` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que consiste en destilaciones de respuestas de modelos como Qwen3.8-Max, GLM5.2 y Kimi K3, orientadas a tool calling. El modelo incorpora una plantilla de chat personalizada (embebida en los metadatos GGUF) que renderiza los esquemas de las herramientas en un turno de developer y emite las llamadas en un formato específico:

```
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>
```

No se menciona el uso de RLHF ni DPO; se trata de un fine-tune supervisado (SFT) con LoRA.

## Capacidades

- Tool calling estructurado: emite llamadas a funciones en formato JSON con nombre y argumentos, siguiendo el esquema definido en el turno de developer.
- Interacciones agénticas multi-paso: puede mantener conversaciones donde invoca herramientas de forma iterativa para completar tareas.
- Generación de texto conversacional: hereda las capacidades de diálogo del modelo base Gemma 3 1B.
- Despliegue ligero: al ser un modelo de ~1B en GGUF, puede ejecutarse en dispositivos con pocos recursos.
- Compatibilidad con llama.cpp: se puede cargar directamente con `llama-cli` o `llama-server` usando el identificador de HuggingFace.
- No se especifican capacidades multimodales (visión, audio) ni soporte de otros idiomas más allá del inglés en este fine-tune.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno donde necesita consultar una base de datos, un CRM o una API de pedidos mediante tool calls, gracias a su formato de llamada a funciones y su tamaño reducido para desplegar en servidores modestos.
- Agentes de automatización de tareas: integrado en un framework de agentes, puede encadenar llamadas a herramientas (por ejemplo, leer un correo, extraer datos, enviar una respuesta) en entornos de baja latencia.
- Despliegue en edge o dispositivos IoT: al caber en menos de 1 GB en cuantización Q4_K_M, puede ejecutarse en una Raspberry Pi o en un gateway local para procesar comandos de voz o texto sin conexión a la nube.
- Asistentes virtuales de nicho: para aplicaciones donde solo se necesita un subconjunto de funciones (por ejemplo, control de domótica, gestión de calendario), el modelo puede invocar las APIs correspondientes de forma fiable.
- Extracción de datos estructurados: dado un texto de entrada, el modelo puede emitir una llamada a una función de parseo o de consulta, devolviendo los argumentos en JSON para su procesamiento posterior.
- Prototipado rápido de agentes: por su tamaño y facilidad de uso con llama.cpp, es adecuado para validar flujos de tool calling en entornos de desarrollo antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

La model card incluye una matriz de validación de tool calling sobre 50 ejemplos del split de validación `sft_tools`, con decodificación greedy y máximo de 384 tokens nuevos. Los resultados comparan el modelo base sin fine-tune, el fine-tune en BF16 y las distintas cuantizaciones GGUF:

| Modelo | Cuantizacion | Tool call emitido | Coincidencia de nombre | Coincidencia exacta de argumentos | Delta vs base | Throughput (tok/s) |
|---|---|---|---|---|---|---|
| Gemma3-1B-tools | BASE (google/gemma-3-1b-it) | 6/50 (12.0%) | 1/50 (2.0%) | 1/50 (2.0%) | — | 68.5 |
| Gemma3-1B-tools | BF16 | 50/50 (100.0%) | 41/50 (82.0%) | 33/50 (66.0%) | +64pp | 47.1 |
| Gemma3-1B-tools | GGUF-BF16 | 50/50 (100.0%) | 36/50 (72.0%) | 20/50 (40.0%) | +38pp | 66.0 |
| Gemma3-1B-tools | GGUF-Q4_K_M | 50/50 (100.0%) | 19/50 (38.0%) | 10/50 (20.0%) | +18pp | 89.5 |
| Gemma3-1B-tools | GGUF-Q5_K_M | 50/50 (100.0%) | 34/50 (68.0%) | 24/50 (48.0%) | +46pp | 60.7 |
| Gemma3-1B-tools | GGUF-Q8_0 | 50/50 (100.0%) | 37/50 (74.0%) | 22/50 (44.0%) | +42pp | 50.2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El throughput indicado es de decodificación single-stream, no de servicio en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 0.6-0.8 GB, por lo que cabe en cualquier GPU con 2 GB o más de VRAM, e incluso en memoria unificada de Apple Silicon.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (si se importa el GGUF), o cualquier stack compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: según la validación, el throughput varía entre 50 y 90 tok/s en decodificación single-stream dependiendo de la cuantización, medido en un hardware no especificado. En CPU se espera un rendimiento menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| iromu/Gemma3-1B-tools-GGUF | ~1B | 4096 (entrenamiento) | Sí (fine-tune específico) | Gemma | GGUF |
| google/gemma-3-1b-it (base) | ~1B | 128K (base) | No fiable (2% exact args) | Gemma | Safetensors |
| unsloth/gemma-3-1b-it-GGUF | ~1B | 128K (base) | No (modelo base sin fine-tune) | Gemma | GGUF |

La comparativa se limita al modelo base y a su versión GGUF sin fine-tune, ya que no se dispone de datos de otros modelos de tool calling de tamaño similar en la información proporcionada. La ventaja principal de este fine-tune es la mejora sustancial en la emisión de tool calls frente al base, a costa de reducir el contexto de entrenamiento a 4096 tokens.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas, aunque el modelo base Gemma 3 soporta más de 140 idiomas.
- La longitud de contexto efectiva está limitada a 4096 tokens por el entrenamiento; usos con ventanas mayores pueden degradar la calidad de las tool calls.
- Las cuantizaciones más agresivas (Q4_K_M) reducen significativamente la precisión de las tool calls (20% de coincidencia exacta de argumentos frente al 66% en BF16). Para aplicaciones críticas se recomienda usar Q5_K_M o superior.
- El modelo no está pensado como reemplazo general de modelos Gemma más grandes; su uso se limita a tareas de tool calling y agentes ligeros.
- La licencia Gemma de Google impone restricciones de uso comercial (prohibición de uso para ciertos fines y obligación de compartir información de seguridad en despliegues a gran escala). Conviene revisar los términos completos antes de usarlo en producción.
- El formato de tool calling es personalizado y requiere que el stack de servido renderice la plantilla de chat embebida en los metadatos GGUF; si no se usa esa plantilla, las llamadas a funciones pueden fallar.
- No se han publicado evaluaciones de sesgos, alucinación o robustez fuera del ámbito de tool calling.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iromu/Gemma3-1B-tools-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Versión GGUF del modelo base (unsloth): https://huggingface.co/unsloth/gemma-3-1b-it-GGUF
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/
- Página de Gemma 3 en Ollama: https://ollama.com/library/gemma3:1b
