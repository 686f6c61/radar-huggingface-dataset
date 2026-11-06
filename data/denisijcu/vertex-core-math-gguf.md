# Denisijcu/vertex-core-math-gguf

## Resumen
Vertex-Core-Math (4B-GGUF) es un modelo de lenguaje especializado en razonamiento matematico y resolucion de problemas analiticos, desarrollado por Denis Sanchez Leyva (Vertex Coders LLC, Miami) como parte del ecosistema Vertex Intelligence Core (VIC). Se construye mediante un ajuste fino QLoRA (r=16, alpha=16) sobre el modelo base Qwen3-4B-Instruct-2507 de Alibaba, y se distribuye exclusivamente en formato GGUF cuantizado a 4 bits (q4_k_m) para ejecucion local en LM Studio, Ollama y llama.cpp.

El modelo aborda un nicho concreto: generar cadenas de razonamiento (chain-of-thought) completas y verificables en lugar de respuestas numericas directas, con enfasis declarado en matematicas de nivel escolar, descomposicion logica de problemas y calculo avanzado de nivel universitario (integrales multiples, teorema de la divergencia, analisis vectorial). Su tamano de 4.022 millones de parametros y su cuantizacion 4-bit lo sitúan en el rango de ejecucion en hardware de consumo, lo que resulta relevante para herramientas educativas y agentes locales que no pueden depender de APIs en la nube.

La relevancia actual del modelo es limitada pero especifica: cubre el hueco de modelos pequenos (4B) afinados explicitamente para CoT matematico con licencia Apache 2.0 y pesos abiertos en GGUF, lo que permite su integracion en pipelines academicos y de calculo asistido sin restricciones comerciales. No obstante, la ausencia de benchmarks publicados y el bajo numero de descargas (148) aconsejan tratarlo como una propuesta emergente mas que como una alternativa consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q4_k_m (unica publicada) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507, con 4.022 millones de parametros. El ajuste fino se realizo mediante QLoRA con rango r=16 y alpha=16, utilizando la libreria Unsloth para optimizar el entrenamiento sobre el modelo base cuantizado. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; la model card unicamente indica que se emplearon "gold-standard reasoning datasets" de licencia permisiva, orientados a CoT matematico, GSM8K, calculo avanzado y resolucion de problemas.

La innovacion tecnica destacable no reside en la arquitectura (que es la del modelo base sin modificaciones estructurales) sino en la especializacion del ajuste: el modelo esta entrenado para articular el razonamiento paso a paso en lugar de emitir la respuesta final directamente, y se distribuye ya cuantizado a 4 bits para minimizar la huella de memoria. El prompt template oficial es ChatML con un system prompt especifico que instruye al modelo a "pensar paso a paso" y proporcionar una resolucion rigurosa.

## Capacidades
- Generacion de texto con razonamiento matematico paso a paso (chain-of-thought explicito).
- Resolucion de problemas de matematicas de nivel escolar y secundaria (aritmetica, algebra, problemas verbales tipo GSM8K).
- Calculo avanzado de nivel universitario: integrales multiples, analisis vectorial, teorema de la divergencia (Gauss), campos vectoriales.
- Descomposicion logica de problemas analiticos en etapas intermedias verificables.
- Soporte bilingue limitado a ingles y espanol.
- Capacidad conversacional multi-turno (pipeline text-generation, tag conversational).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking separado.

## Casos de uso
- Asistencia educativa en matematicas: el modelo puede generar explicaciones paso a paso de problemas de algebra y calculo, adecuado para plataformas de tutoria porque su entrenamiento prioriza la justificacion intermedia sobre la respuesta final.
- Resolucion de problemas verbales tipo GSM8K: util en pipelines de evaluacion o generacion de datasets sinteticos de razonamiento aritmetico, dado su ajuste especifico sobre este tipo de tareas.
- Calculo universitario asistido: puede abordar integrales multiples y aplicaciones del teorema de la divergencia, como demuestra el ejemplo de la model card con resultado analitico exacto (256/3 pi), apropiado para herramientas de verificacion de ejercicios de Calculo IV.
- Ejecucion local en portatiles y equipos de consumo: al estar cuantizado en GGUF q4_k_m, cabe en GPUs de gama media y permite desplegar un asistente matematico offline en LM Studio u Ollama sin conexion a la nube.
- Agentes locales de resolucion de problemas: su tamano reducido permite integrarlo en runtimes de agentes que necesitan un submodelo especializado en descomposicion logica sin consumir el presupuesto de memoria de un modelo mayor.
- Generacion de material didactico bilingue (en/es): puede producir explicaciones en ambos idiomas para cursos o documentacion tecnica, aunque la calidad en espanol no esta cuantificada en la informacion disponible.
- Prototipado de sistemas de razonamiento verificable: util para investigadores que necesitan un modelo pequeno con CoT explicito sobre el que experimentar con tecnicas de verificacion de cadenas de razonamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente un caso cualitativo de calculo avanzado (teorema de la divergencia) sin metricas numericas ni comparacion con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion q4_k_m publicada (4.022 millones de parametros a ~4 bits mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo pero compatibles.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (GTX 1650 4 GB en adelante); tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (mencionados explicitamente por el autor); vLLM y TGI no estan documentados para este artefacto GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vertex-Core-Math 4B GGUF | 4.022 M | no disponible | Apache 2.0 | GGUF q4_k_m | Ajuste QLoRA especializado en CoT matematico |
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista; sirve de referencia directa |
| Qwen2.5-Math-7B | 7.600 M | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en matematicas, mayor tamano |
| DeepSeek-Math-7B | 7.000 M | no disponible | no disponible | safetensors | Especializado en matematicas, requiere mas VRAM |

La comparacion cuantitativa de rendimiento no es posible porque Vertex-Core-Math no publica benchmarks. Frente a su modelo base, la diferencia es el ajuste QLoRA en datos de razonamiento matematico; frente a especializados como Qwen2.5-Math-7B o DeepSeek-Math-7B, Vertex-Core-Math ofrece la mitad de parametros y una huella de memoria mucho menor, a costa de una capacidad bruta presumiblemente inferior y sin evidencia publicada que lo respalde.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base Qwen3-4B-Instruct-2507 ni frente a especializados matematicos consolidados.
- Riesgo de alucinacion en pasos intermedios: el CoT explicito no garantiza correccion; un razonamiento bien redactado puede contener errores aritmeticos o algebraicos no detectados.
- Contexto no documentado: se desconoce la longitud de ventana efectiva, lo que impide planificar su uso en problemas largos o conversaciones extensas.
- Cobertura idiomatica limitada a ingles y espanol; no se documenta calidad en otros idiomas.
- Unica cuantizacion publicada (q4_k_m): no hay versiones de mayor precision (q8_0, fp16) para evaluar la perdida por cuantizacion.
- Ecosistema y mantenimiento: 148 descargas y 0 likes en el momento de la consulta; proyecto de un autor individual, sin garantia de soporte continuado.
- Licencia Apache 2.0 permisiva para uso comercial, pero el aviso legal del autor restringe el proposito declarado a herramientas educativas, sistemas de razonamiento logico y asistencia academica; conviene revisar la procedencia de los datasets de ajuste, que el autor declara permisiva pero no detalla.
- El ejemplo de la model card esta redactado en espanol pero el prompt template oficial esta en ingles; el rendimiento real en espanol no esta verificado.

## Enlaces
- Hugging Face: https://huggingface.co/Denisijcu/vertex-core-math-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Unsloth (libreria de ajuste fino): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
