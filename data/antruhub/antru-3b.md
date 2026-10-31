# ANTRUhub/ANTRU-3B

## Resumen

ANTRU-3B es un asistente de programación de 3.09B parámetros desarrollado por el proyecto ANTRU (Haider), disponible en HuggingFace bajo la organización ANTRUhub. Se trata de un ajuste fino (fine-tune) por LoRA sobre Qwen2.5-Coder-3B-Instruct de Alibaba, entrenado íntegramente en hardware de consumo —un portátil con Intel i7-8550U y una GeForce MX150 de 2 GB—, lo que lo convierte en un ejemplo notable de entrenamiento local accesible sin infraestructura cloud.

El modelo se ha entrenado con un currículo de 302 ejemplos curados que cubren identidad conversacional, soluciones verificadas de Python y código, razonamiento matemático paso a paso, formato de tool calling para agentes (`<tool_call>`) y patrones multi-turno de tipo "aclarar y entregar". Hereda del modelo base la arquitectura transformer Qwen2 y un contexto nativo de 32K tokens, ampliable a 128K mediante YaRN (factor ×4).

Su relevancia está en el nicho de los LLM locales ligeros: cabe en una GPU de 4 GB en cuantización Q4_K_M (~1,8 GB), se distribuye en safetensors y GGUF, y es adecuado como asistente de código local para tareas de complejidad moderada. El propio autor advierte que no es un modelo de grado agéntico y que su fiabilidad depende de que la consulta se parezca al currículo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), ajuste fino LoRA |
| Parametros totales | 3.085.938.688 (~3,09B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 128K tokens via YaRN (nativo 32K, factor de escala ×4) |
| Tipos de cuantizacion | Q4_K_M GGUF (~1,8 GB); maestro fp16 fusionado disponible |
| Idiomas soportados | Inglés (entrenamiento declarado); capacidades multilingües heredadas de Qwen2.5 no documentadas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (fp16 fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder de la familia Qwen2 optimizado para tareas de código. El ajuste fino emplea LoRA con rango r=16, alfa 32 y dropout 0.05, aplicado a todas las proyecciones de atención y MLP (q/k/v/o/gate/up/down), con retropropagación real a través de todas las capas adaptadas. El entrenamiento consistió en una única época sobre 302 ejemplos con enmascaramiento de pérdida solo en los turnos del asistente, formato ChatML, optimizador AdamW con learning rate 1e-4 y schedule coseno, en fp32 sobre CPU durante unas 2 horas.

Tras el entrenamiento, los pesos LoRA se fusionaron en un maestro fp16 y se convirtió a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp, cuantizándose a Q4_K_M. La innovación más destacable no es arquitectónica sino metodológica: demostrar un pipeline completo de fine-tune con LoRA sobre todas las proyecciones en hardware de consumo (CPU + GPU de 2 GB), documentado con registros en el repositorio del proyecto. La extensión de contexto a 128K se logra con YaRN, requiriendo parámetros específicos de rope-scaling en la inferencia.

## Capacidades

- Generacion de codigo: entrega soluciones completas y ejecutables de Python y otros lenguajes, con explicaciones, entrenada con soluciones verificadas.
- Razonamiento matematico paso a paso: el currículo incluye ejemplos de razonamiento escalonado en matemáticas y depuración.
- Tool calling: emite bloques JSON en formato `<tool_call>` compatible con harness de agentes cuando se le proporcionan herramientas.
- Patrones multi-turno: entrenada para aclarar una vez y luego entregar código real, en lugar de encadenar preguntas.
- Identidad conversacional: identidad "ANTRU" entrenada en los pesos, no mediante prompt.
- Contexto largo: hasta 128K tokens con YaRN, heredando los 32K nativos de Qwen2.5-Coder.
- Despliegue local: endpoint compatible con OpenAI vía llama-server.

## Casos de uso

- Asistente de codigo local en portatiles modestos: con ~1,8 GB en Q4_K_M cabe en GPUs de 4 GB o incluso en CPU+RAM, ideal para autocompletado y generación de funciones Python sin conexión.
- Depuracion y explicacion de codigo: el entrenamiento en razonamiento paso a paso lo hace adecuado para explicar errores y proponer correcciones en sesiones interactivas.
- Prototipado de agentes ligeros: puede emitir bloques `<tool_call>` en formato JSON para harness que orquesten una o pocas herramientas, siempre que el system prompt sea compacto.
- Resolucion de ejercicios de matematicas con explicacion: el patrón de razonamiento escalonado sirve para tutorías o verificación de soluciones en contextos educativos.
- Chatbot personalizable con identidad fija: la identidad entrenada en pesos permite desplegar un asistente con personalidad consistente sin depender de prompts largos.
- Asistente multi-turno de aclaracion: en flujos donde el usuario da requisitos vagos, el modelo está entrenado para hacer una pregunta aclaratoria y luego entregar código, útil en herramientas de soporte a desarrolladores.
- Backend local compatible con OpenAI API: mediante llama-server puede sustituir endpoints de APIs de pago en aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas, ni comparativas cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,8 GB para el GGUF Q4_K_M; cabe en GPUs de 4 GB. Con contexto completo de 128K (KV cache) el requisito de memoria aumenta significativamente; para contextos grandes conviene CPU+RAM o GPUs con más memoria.
- Consumer GPUs: viable en GTX 1650, RTX 3050, RTX 3060 o superiores; también funciona en CPU con reparto a RAM (el entrenamiento original se hizo en una MX150 de 2 GB, muy por debajo de las GPUs actuales).
- No se requieren GPUs de datacenter (A100/H100) para inferencia.
- Despliegue: llama.cpp / llama-server (comando documentado con `--rope-scaling yarn --rope-scale 4 --rope-freq-base 1000000 --yarn-orig-ctx 32768`), endpoint compatible con OpenAI en el puerto 8080; compatible con Ollama y LM Studio al tratarse de un GGUF estándar. El safetensors fp16 permite uso con transformers y vLLM, aunque no hay documentación específica.
- Latencia y throughput: no disponibles; en una GPU de 4 GB con descarga completa de capas (`-ngl 99`) debe ofrecer latencia interactiva típica de un modelo 3B cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ANTRU-3B | 3,09B | 128K (YaRN) | Apache-2.0 | Safetensors, GGUF | Fine-tune LoRA sobre Qwen2.5-Coder-3B, currículo de 302 ejemplos, tool calling |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32K (128K con YaRN) | Apache-2.0 | Safetensors, GGUF | Modelo base de Alibaba, benchmarks publicados y soporte multilingüe más amplio |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32K | Apache-2.0 (research) / licencia propia en algunas versiones | Safetensors, GGUF | Alternativa más ligera para dispositivos muy limitados, menor capacidad de código |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | Safetensors, GGUF | Modelo de código de BigCode, contexto más corto y sin tool calling nativo |

## Limitaciones y advertencias

- Cobertura limitada del fine-tune: solo 302 ejemplos; el comportamiento es fiable en consultas similares al currículo, pero el conocimiento general proviene sin cambios del modelo base Qwen.
- No apto para flujos agénticos complejos: el propio autor advierte que system prompts grandes con recordatorios inyectados pueden confundir al modelo; no es de grado agéntico.
- Riesgo de alucinación típico de modelos de 3B: puede generar código plausible pero incorrecto, especialmente fuera del dominio Python/código del currículo; se recomienda verificación y tests.
- Idioma: el entrenamiento declarado es en inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Contexto: los 128K requieren configuración explícita de YaRN en llama.cpp; sin esos parámetros el modelo operará a 32K.
- Sesgos: hereda los sesgos de Qwen2.5-Coder y de su corpus de preentrenamiento; no se ha documentado auditoría de sesgos.
- Licencia: Apache-2.0 permite uso comercial sin restricciones destacables, heredada de Qwen2.5-Coder.
- Proyecto de bajo uso (147 descargas, 1 like en el momento de la ficha): comunidad reducida, sin benchmarks independientes ni validación de terceros; conviene evaluarlo antes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANTRUhub/ANTRU-3B
- Organización del proyecto ANTRU: https://huggingface.co/ANTRUhub
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Paper, demo y repositorio de código: no disponibles
