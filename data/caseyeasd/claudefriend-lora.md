# caseyeasd/claudefriend-lora

## Resumen

`caseyeasd/claudefriend-lora` es un adaptador LoRA de rango 32 publicado en formato PEFT estándar sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo autónomo: requiere descargar el base de ~9B parámetros y aplicar el adaptador (0,4 GB en safetensors). Su propósito declarado es convertir al modelo en un interlocutor conversacional con persona humana, entrenado específicamente para ser el tipo de interlocutor que un modelo juez (Claude Sonnet 5.5) prefiere en conversación.

El entrenamiento descrito en la model card tiene dos fases: un SFT para fijar la persona de chat humano y, después, 70 pasos de GRPO por pares con Sonnet como juez. Es, por tanto, un experimento de alineación y preferencias orientado a estilo conversacional, no a razonamiento, código o matemáticas. El repositorio hermano `caseyeasd/claudefriend` contiene el mismo modelo fusionado en pesos bf16 completos.

Es relevante ahora como ejemplo práctico de un pipeline GRPO con juez LLM sobre un adaptador pequeño, y como artefacto de investigación sobre personas conversacionales y sobre cómo se comportan los modelos cuando se les desactiva el modo de razonamiento (cada turno empieza con un bloque `<think>` vacío). No hay datos públicos de benchmarks, idiomas soportados ni volumen de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-9B-Base`; r = 32, alpha = 32, aplicado a proyecciones de atención, MLP, atención lineal y `lm_head` |
| Parametros totales | Adaptador: no disponible en número (0,4 GB en safetensors); modelo base: ~9B (según el identificador del base, no confirmado en la información disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (bf16 en el base); no se publican cuantizaciones del adaptador. Cualquier cuantización requeriría fusionar con el base y convertir |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (adaptador) |
| Formato de pesos | Safetensors en formato PEFT/LoRA; el repo fusionado ofrece bf16 completo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 insertado sobre las proyecciones de atención, MLP, atención lineal y la cabeza de salida (`lm_head`) del base Qwen3.5-9B. El entrenamiento parte de un SFT orientado a fijar una persona de chat humano y continúa con 70 pasos de GRPO por pares (pairwise), donde el juez es Claude Sonnet 5.5. No se especifican en la información disponible el número de tokens de SFT, la composición del dataset, ni si hubo etapas adicionales de DPO o RLHF clásico más allá del GRPO citado.

Una particularidad operativa importante es el formato de prompt: se usa la plantilla de chat de Qwen con el razonamiento desactivado, de modo que cada turno del modelo comienza con un bloque `<think>\n\n</think>\n\n` vacío. El modelo habla siempre en el rol `assistant`, y para que abra una conversación hay que enviar un turno `user` vacío. El tokenizer recomendado es el del repo fusionado `caseyeasd/claudefriend`, cuya plantilla de chat ya aplica ese formato por defecto. El ejemplo de carga de la model card usa `AutoModelForImageTextToText`, lo que sugiere que el base se distribuye con clases multimodales, aunque no se detallan capacidades de visión en el adaptador.

## Capacidades

- Generación de texto conversacional multi-turno con una persona de chat humana definida por SFT.
- Apertura de conversación de forma autónoma mediante un turno `user` vacío (comportamiento poco habitual y deliberado).
- Estilo y registro optimizados por preferencia de un juez LLM (Sonnet), no por precisión factual.
- Razonamiento en modo desactivado de forma forzada: todos los turnos llevan bloque `<think>` vacío, por lo que no emite cadenas de pensamiento.
- Compatible con despliegue como adaptador PEFT y como módulo LoRA en vLLM (`--enable-lora --max-lora-rank 32`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el diseño desactiva el modo thinking, lo que va en contra de estos usos.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no documentadas para el adaptador.

## Casos de uso

- **Simulador de usuario en evaluación de chatbots**: al poder abrir conversación con un turno `user` vacío y mantener persona estable, sirve para generar diálogos de prueba realistas contra un sistema bajo test, reduciendo el sesgo de guiones escritos a mano.
- **Generación de datos sintéticos de diálogo**: producción de corpus multi-turno con estilo humano para SFT de otros asistentes, revisando después calidad y toxicidad antes de reutilizar.
- **Investigación en alineación y preferencias**: punto de partida reproducible para estudiar GRPO con juez LLM; el adaptador y el repo fusionado permiten replicar el pipeline y comparar contra el base sin entrenar desde cero.
- **Prototipado de asistentes de acompañamiento o journaling**: con revisión humana y filtros de seguridad, para validar tono y fluidez antes de invertir en un modelo propio; su licencia Apache 2.0 facilita el piloto.
- **Composición de adaptadores LoRA**: al ser un adaptador PEFT independiente, se puede combinar con otros adaptadores sobre el mismo base para experimentar con mezclas de persona y capacidades, siempre que los rangos y targets sean compatibles.
- **Pruebas de regresión conversacional en CI**: integrado con vLLM en un job de integración continua para detectar cambios de estilo o deriva de persona entre versiones del sistema principal.
- **Estudio de elicitación de persona y anthropomorphism**: analizar cómo un SFT breve más 70 pasos de GRPO desplazan el comportamiento del base hacia registros coloquiales o emocionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de preferencia cuantificadas, ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- Inferencia en bf16: los pesos del base de ~9B ocupan aproximadamente 18 GB; el adaptador añade ~0,4 GB. Con caché KV para contextos de 8k hay que prever del orden de 22-26 GB de VRAM (estimación, no dato oficial).
- GPU de datacenter: A100 40 GB, H100 80 GB o L40S 48 GB cubren bf16 con contexto amplio sin problemas.
- Consumer GPU en bf16: RTX 4090 o RTX 3090 (24 GB) van justas pero viables con contextos moderados; por debajo de 24 GB conviene cuantizar.
- Consumer GPU cuantizado: en 4 bits el conjunto ronda los 5-6 GB, por lo que cabe en RTX 4070/4060 Ti de 12-16 GB y en GPUs de 8 GB con contextos cortos (estimación).
- Despliegue con adaptadores: vLLM soporta LoRA en caliente con `--enable-lora --max-lora-rank 32 --lora-modules claudefriend=caseyeasd/claudefriend-lora`, lo que permite servir el base y el adaptador en la misma instancia.
- Despliegue con PEFT: carga directa con `PeftModel.from_pretrained` sobre el base en bf16; requiere GPU para uso práctico.
- llama.cpp / Ollama: no se documenta soporte directo del adaptador; para GGUF habría que fusionar con el base y convertir, o convertir el adaptador a GGUF LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `caseyeasd/claudefriend-lora` | Adaptador LoRA sobre base ~9B | No disponible | PEFT safetensors (0,4 GB) | Apache 2.0 | Requiere el base; pensado para rol conversacional |
| `caseyeasd/claudefriend` | ~9B (fusionado) | No disponible | bf16 completo | Apache 2.0 | Mismo modelo listo para servir sin aplicar adaptador; incluye tokenizer con plantilla propia |
| `Qwen/Qwen3.5-9B-Base` | ~9B | No disponible | Safetensors | No disponible en la información | Base sin ajustar; no tiene la persona ni el formato de turno vacío |

No se dispone de datos de benchmarks ni de otras comparaciones cuantitativas con adaptadores de persona comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no funciona de forma aislada: sin el base `Qwen/Qwen3.5-9B-Base` no hay modelo. Además, el formato de prompt es estricto; usar otra plantilla degrada la persona.
- No hay ninguna evaluación publicada: ni benchmarks, ni tests de seguridad, ni comparación con el base. El rendimiento es desconocido más allá de la descripción cualitativa del autor.
- El objetivo de entrenamiento es agradar a un juez concreto (Sonnet), lo que puede producir deriva hacia estilos que gustan al juez y no hacia respuestas correctas; riesgo de sycophancy y de degradar precisión factual.
- El modo de razonamiento está desactivado por diseño, lo que lo hace inadecuado para matemáticas, código complejo, agentes y tareas multi-paso.
- Riesgo de alucinación heredado del base y agravado por un entrenamiento centrado en fluidez conversacional; no hay verificación factual en el pipeline descrito.
- Sesgos: no documentados. Al ser un SFT de persona más GRPO con juez propietario, puede incorporar sesgos de estilo, género o registro del dataset no publicado.
- Idiomas: no disponibles; no hay garantía de comportamiento fuera del inglés.
- Volumen de uso nulo (0 descargas, 0 likes) y autor único: sin validación de la comunidad, sin issues ni mantenimiento conocido.
- Licencia Apache 2.0 en el adaptador, pero conviene verificar la licencia y condiciones del modelo base antes de un uso comercial; la información disponible no las detalla.
- Los resultados de búsqueda web asociados a esta consulta no contenían información relevante sobre el modelo, por lo que no se han podido contrastar datos externos.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/caseyeasd/claudefriend-lora
- Modelo fusionado (bf16) y tokenizer: https://huggingface.co/caseyeasd/claudefriend
- Write-up del autor, "Training Claude's Best Friend": https://casey.you/posts/claudefriend/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Paper, demo o repositorio adicionales: no disponibles en la información proporcionada
