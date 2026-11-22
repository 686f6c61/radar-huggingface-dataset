# bside01/personal-assistant-1.5b-gguf

## Resumen

Personal Assistant 1.5B es un modelo de lenguaje conversacional de pequeno tamano (~1.500 millones de parametros) publicado por el usuario bside01 en Hugging Face. No se trata de un entrenamiento desde cero, sino de un merge de dos modelos de la familia Qwen2.5: `Qwen/Qwen2.5-1.5B-Instruct` (orientado a conversacion y resumen) y `Qwen/Qwen2.5-Coder-1.5B-Instruct` (orientado a codigo y llamadas a herramientas con salida JSON estructurada). El objetivo declarado es obtener un asistente personal ligero que combine fluidez conversacional con capacidad de emitir tool calls estructuradas.

El modelo se distribuye unicamente en formato GGUF cuantizado a Q4_K_M (~941 MB), pensado para inferencia en dispositivo (movil, portatil, edge) mediante `llama.cpp`. La ficha del autor no incluye informacion sobre datos de entrenamiento adicionales, evaluaciones o benchmarks, por lo que las capacidades reales deben inferirse de los modelos base y del metodo de merge.

Es relevante ahora por dos motivos: la creciente demanda de asistentes locales que no dependan de la nube, y la existencia de un ecosistema maduro (llama.cpp, Ollama, LM Studio) que permite ejecutar modelos de ~1,5B en hardware de consumo con requisitos de memoria muy bajos. No obstante, al ser un merge sin evaluacion publicada y con cero descargas en el momento de la consulta, debe tratarse como un experimento y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), merge SLERP de dos modelos Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (los modelos Qwen2.5-1.5B base soportan hasta 32.768 tokens, dato no confirmado para este merge) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, ~941 MB); tecnicamente convertible a otras cuantizaciones GGUF con `llama-quantize` |
| Idiomas soportados | no disponible en la model card (heredados de Qwen2.5, que es multilingue, pero sin confirmacion del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `assistant-1.5b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU. El modelo no se entrena: se construye mediante `mergekit` con el metodo SLERP sobre el rango de capas `[0, 28]` en `float16`, con un parametro `t = 0.3` que favorece al modelo Instruct (peso mayor en la interpolacion) mientras incorpora parte de los pesos del modelo Coder. El resultado se convierte a GGUF f16 y se cuantiza a Q4_K_M con `llama-quantize`.

No hay informacion sobre tokens de entrenamiento adicionales, datasets de ajuste, RLHF, DPO ni ninguna fase de alineacion posterior al merge. Tampoco se documenta ninguna innovacion tecnica mas alla del propio merge. Cualquier capacidad de razonamiento, codigo o tool calling proviene exclusivamente de los modelos Qwen2.5 originales y de como el SLERP combina sus pesos, sin garantia de que la mezcla preserve limpiamente las habilidades de ambos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de `Qwen2.5-1.5B-Instruct`.
- Resumen y reescritura de texto, segun el sesgo declarado del merge hacia el modelo Instruct.
- Generacion de codigo y asistencia de programacion, heredada parcialmente de `Qwen2.5-Coder-1.5B-Instruct`.
- Tool calling / function calling con salida JSON estructurada, objetivo explicito del merge (el autor menciona "structured JSON tool calls").
- Razonamiento multi-paso basico y seguimiento de instrucciones, limitado por el tamano de 1,5B.
- Capacidades multilingues: probablemente heredadas de Qwen2.5, aunque no confirmadas por el autor.
- Sin soporte de vision, audio ni modo "thinking" explicito.
- Sin garantia de que el merge preserve de forma fiable las capacidades de tool calling ni la calidad conversacional de los modelos base.

## Casos de uso

- Asistente personal en dispositivo movil: el GGUF Q4_K_M (~941 MB) cabe en la memoria de un telefono moderno y puede ejecutarse con `llama.cpp` sin conexion, gestionando recordatorios, resumenes y respuestas conversacionales basicas.
- Automatizacion de tareas con tool calling local: el sesgo hacia el modelo Coder busca emitir JSON estructurado para invocar funciones (calendario, clima, busqueda local) en un agente ligero que corre en el propio dispositivo.
- Resumen de notas y correos en un portatil sin GPU dedicada: con 1,5B en Q4_K_M la inferencia en CPU es viable y el modelo puede condensar textos cortos o medianos.
- Prototipado rapido de asistentes conversacionales: util para validar flujos de chat y prompts en local antes de migrar a un modelo mayor, gracias a su bajo coste de despliegue.
- Generacion de snippets de codigo y explicaciones en entornos de desarrollo con recursos limitados: aprovecha la componente Coder del merge para autocompletado simple o explicacion de fragmentos.
- Educacion y demos offline: permite montar talleres o demos de IA generativa sin infraestructura cloud, con requisitos de hardware minimos.
- Filtrado y clasificacion de texto en edge: tareas de etiquetado o extraccion de entidades en dispositivos con poca memoria, donde un modelo de 7B o superior no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con los modelos base. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en Q4_K_M el archivo pesa ~941 MB; con overhead de contexto y runtime, un presupuesto de 1,5-2,5 GB de RAM es suficiente para contextos moderados.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo con holgura; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU y SoCs moviles.
- Opciones de despliegue: `llama.cpp` (formato nativo), Ollama, LM Studio y otros runtimes compatibles con GGUF. No se distribuyen pesos safetensors ni formatos para vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Personal Assistant 1.5B (este) | ~1,5B | no disponible | GGUF Q4_K_M | Apache 2.0 | Merge SLERP sin evaluacion publicada |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun ficha oficial de Qwen) | safetensors, GGUF | Apache 2.0 | Modelo base conversacional, con evaluaciones publicadas |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | 32.768 tokens (segun ficha oficial de Qwen) | safetensors, GGUF | Apache 2.0 | Modelo base orientado a codigo y tool calling |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar con contexto largo y licencia con restricciones |

La comparativa se limita a datos de ficha; no hay benchmarks de este merge que permitan afirmar que supera o iguala a sus modelos base. En la practica, los modelos base de Qwen ofrecen garantias de evaluacion que este merge no aporta.

## Limitaciones y advertencias

- Modelo sin evaluacion publicada: no hay benchmarks ni pruebas de calidad que respalden las capacidades declaradas.
- Riesgo de degradacion por merge: el SLERP puede mezclar pesos de forma que se pierdan habilidades de cualquiera de los dos modelos base; el tool calling y el codigo pueden no funcionar de forma fiable.
- Alucinacion: como todo modelo de 1,5B, tiende a inventar hechos, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Contexto no confirmado: la model card no especifica la longitud de contexto efectiva del merge; no asumir los 32.768 tokens de Qwen2.5 sin verificar.
- Idiomas no documentados: aunque Qwen2.5 es multilingue, el autor no confirma que idiomas conserva el merge; el castellano puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5 conviene revisar tambien las condiciones de los modelos base (tambien Apache 2.0).
- Cero descargas y sin comunidad: no hay evidencia de uso real ni reportes de terceros; no recomendable para produccion sin validacion propia.
- Solo GGUF Q4_K_M: no hay safetensors ni otras cuantizaciones publicadas, lo que limita el ajuste fino o la conversion a otros runtimes sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bside01/personal-assistant-1.5b-gguf
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
