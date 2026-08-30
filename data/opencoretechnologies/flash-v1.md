# OpenCOReTechnologies/Flash-V1

## Resumen

CORe Flash V1 es un modelo de lenguaje autorregresivo (decoder-only) de 168,5 millones de parámetros, desarrollado por CORe Technologies. Está entrenado desde cero sobre un corpus mixto de aproximadamente 328 millones de tokens que combina texto web, contenido enciclopédico y conversaciones. El modelo se presenta como un asistente ligero con un enfoque explícito en la alineación de seguridad: rechaza solicitudes dañinas y redirige al usuario hacia alternativas útiles.

Su relevancia radica en su extrema ligereza: ocupa 338 MB en fp16 y solo 113 MB en cuantización Q4_K_M, lo que permite ejecutarlo en CPU sin GPU dedicada. No obstante, su contexto máximo es de 512 tokens y su vocabulario BPE de 16 384 tokens, lo que lo sitúa como una herramienta de demostración o para tareas muy acotadas, no como un asistente generalista. Utiliza una arquitectura personalizada (`COReForCausalLM`) que requiere `trust_remote_code=True` al cargarlo desde HuggingFace. La licencia es Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `COReForCausalLM` (decoder-only, arquitectura personalizada) |
| Parametros totales | 168,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp16 (339 MB), q8_0 (182 MB), q4_k_m (113 MB) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32 referencia), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer decoder-only con 12 capas, 16 cabezas de atención y una dimensión oculta de 1024. La arquitectura está registrada como `COReForCausalLM` y no se documentan innovaciones técnicas específicas más allá del diseño compacto. El tokenizer es un BPE de 16 384 tokens con formato de chat (`<|user|>`, `<|assistant|>`). El entrenamiento se realizó sobre un corpus de ~328M tokens que incluye texto web, contenido enciclopédico y conversaciones. No se menciona explícitamente el uso de RLHF o DPO; la alineación de seguridad parece derivar de la composición del corpus y posiblemente de un filtrado supervisado. El modelo se ofrece en dos formatos: safetensors para fine-tuning (674 MB en fp32) y GGUF para inferencia eficiente con llama.cpp, LM Studio u Ollama.

## Capacidades

- Generación de texto básica: respuestas coherentes a preguntas simples sobre conceptos generales (por ejemplo, "¿Qué es machine learning?").
- Identificación del modelo: se presenta como CORe Flash de CORe Technologies y niega ser ChatGPT o Claude.
- Rechazo de solicitudes dañinas: ante peticiones como "cómo hackear el correo de alguien", responde con un rechazo educado y sugerencias de seguridad.
- Conversación de pocos turnos: funciona con el formato de chat integrado, aunque el contexto limitado a 512 tokens restringe diálogos largos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingüe: únicamente inglés.
- No tiene capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rápido de interfaces conversacionales: por su tamaño reducido, se puede integrar en entornos de desarrollo sin necesidad de GPU para validar flujos de chat básicos antes de escalar a modelos mayores.
- Educación y formación en PLN: sirve como ejemplo práctico para enseñar arquitecturas transformer y procesos de fine-tuning, dado su tamaño manejable y licencia permisiva.
- Demostraciones de alineación de seguridad: su comportamiento de rechazo ante consultas dañinas puede usarse en talleres sobre seguridad en IA y diseño de respuestas éticas.
- Ejecución en hardware embebido o de bajos recursos: al ocupar solo 113 MB en Q4_K_M, puede desplegarse en Raspberry Pi, portátiles antiguos o dispositivos IoT para tareas de generación de texto simples.
- Pruebas de concepto de pipelines de inferencia: permite evaluar el flujo completo de carga de modelo, tokenización y generación con `transformers` o llama.cpp antes de sustituirlo por un modelo más grande.
- Generación de texto para entornos sin conexión: en aplicaciones que requieren privacidad total y no pueden depender de APIs externas, este modelo ofrece una opción local de generación de respuestas cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Dado el tamaño del modelo y el corpus de entrenamiento (328M tokens), su rendimiento en tareas complejas será previsiblemente bajo en comparación con modelos de cientos de miles de millones de parámetros.

## Requisitos de hardware

- VRAM estimada: 0 MB en cuantización Q4_K_M si se ejecuta en CPU; en GPU, el modelo fp16 requiere aproximadamente 338 MB de VRAM.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna con al menos 1 GB de RAM puede ejecutar la versión Q4_K_M. En GPU, cualquier tarjeta con más de 512 MB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) es suficiente.
- Compatibilidad con consumer GPU: sí, absolutamente. Incluso las GPUs integradas de portátiles pueden manejar la inferencia.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp (versión GGUF), Ollama, LM Studio.
- Latencia y throughput: no hay datos oficiales, pero en una CPU moderna (por ejemplo, un Intel i5 de 8ª generación) la generación de 120 tokens debería completarse en menos de 10 segundos con Q4_K_M, dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos. Sin embargo, en términos de tamaño y contexto, puede compararse con otros modelos pequeños de la misma época:

| Modelo | Parámetros | Contexto | Licencia |
|---|---|---|---|
| CORe Flash V1 | 168,5M | 512 | Apache-2.0 |
| GPT-2 (124M) | 124M | 1024 | MIT |
| TinyLlama (1.1B) | 1,1B | 2048 | Apache-2.0 |

CORe Flash V1 tiene un contexto significativamente menor que GPT-2 y TinyLlama, y su corpus de entrenamiento es mucho más reducido. No se han publicado comparaciones de rendimiento con estos modelos.

## Limitaciones y advertencias

- Modelo de muy pequeño tamaño (168M): no es un asistente generalista y no competirá con modelos grandes en tareas abiertas.
- Precisión factual limitada: el corpus de entrenamiento es pequeño en comparación con estándares modernos, por lo que puede generar información incorrecta o desactualizada.
- Contexto muy limitado (512 tokens): imposibilita mantener diálogos largos o procesar documentos extensos.
- Solo inglés: no soporta otros idiomas.
- Creatividad degradada: la generación de poesía, cuentos o textos creativos es deficiente.
- Arquitectura personalizada: requiere `trust_remote_code=True`, lo que implica ejecutar código remoto y puede suponer un riesgo de seguridad si no se audita previamente.
- Riesgo de alucinación: como todo modelo generativo, puede inventar datos o afirmaciones sin base real.
- Sin tool calling ni capacidades de agente: no apto para integraciones complejas.

## Enlaces

- [HuggingFace: OpenCOReTechnologies/Flash-V1](https://huggingface.co/OpenCOReTechnologies/Flash-V1)
- [Sitio web de OpenCORe (plataforma de chat, no específico del modelo)](https://opencore.one/)
