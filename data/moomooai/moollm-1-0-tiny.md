# moomooai/moollm-1.0-tiny

## Resumen

MooLLM-1.0-Tiny es un modelo de lenguaje de tipo base (solo preentrenado) desarrollado por moomooai, con aproximadamente 14,78 millones de parametros. Se trata del segundo modelo de la familia MooLLM, que incluye las variantes Air (~7M), Tiny (~15M), Flash (~30M) y Pro (~50M). El modelo esta disenado especificamente para tareas de completado de texto ligero, prediccion de siguiente token y teclados predictivos (T9), asi como para experimentacion embebida.

La relevancia tecnica del modelo radica en su arquitectura: implementa Mamba2, un modelo de espacio de estados (SSM) en lugar del transformer clasico, y fue entrenado desde cero con una implementacion propia en Rust sobre el framework Burn. Esto lo convierte en un caso de estudio interesante para quienes investigan alternativas eficientes a la atencion cuadratica en modelos de muy baja escala.

El modelo solo soporta ingles, se distribuye bajo licencia MIT y esta disponible en formatos safetensors y GGUF. No dispone de ajuste por instrucciones, por lo que no es capaz de mantener conversaciones ni responder preguntas de forma directa; su utilidad se limita a la continuacion de texto y a servir como base para fine-tuning o como modelo borrador en decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2 (SSM, state space model) |
| Parametros totales | 14.780.484 (~14,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF sin cuantizar (original); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mamba2, basada en modelos de espacio de estados (SSM) en lugar de la atencion por transformer. La implementacion fue desarrollada desde cero en Rust sobre el framework Burn, lo que constituye una innovacion destacable dado que la mayoria de implementaciones de Mamba2 se realizan en Python/PyTorch. El modelo fue entrenado durante 17 horas y 20 minutos en una AMD Radeon RX6600 (con un modo nocturno de bajo consumo a 500 MHz durante 9 horas), con un consumo estimado de aproximadamente 554 g de CO2.

El entrenamiento siguio un escalado de aproximadamente 1x Chinchilla compute-optimal, lo que equivale a unos 300 millones de tokens. Los datos de entrenamiento provienen de Common Pile, concretamente de los subconjuntos youtube, stackexchange_filtered, news, wikimedia_filtered y project_gutenberg_filtered. No se menciona el uso de RLHF, DPO ni ningun tipo de ajuste por instrucciones; se trata de un modelo puramente preentrenado. El autor indica explicitamente que no se incluyeron datasets especificos de codigo durante el entrenamiento.

## Capacidades

- Generacion de texto y completado de texto (continuacion de secuencias).
- Prediccion de siguiente token, orientada a teclados predictivos (T9) y autocompletado ligero.
- Modelo base para fine-tuning en tareas especificas de dominio.
- Candidato a modelo borrador para decodificacion especulativa (segun la tabla de tallas del autor, la variante Flash esta pensada para ese uso; Tiny se orienta a T9 y completado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no (modelo base sin instrucciones).
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- No es capaz de mantener conversaciones ni responder preguntas de forma directa (advertencia explicita del autor).

## Casos de uso

- Teclados predictivos y T9 en dispositivos moviles o embebidos: el modelo, con ~15M de parametros, puede ejecutarse en hardware de muy baja potencia para sugerir la siguiente palabra o completar frases cortas en ingles, con latencia minima gracias a su tamano reducido.
- Autocompletado ligero en editores o formularios: integrado como servicio local, puede generar continuaciones de texto cortas en campos de entrada, aprovechando su bajo coste computacional.
- Modelo borrador en decodificacion especulativa: por su tamano, puede emplearse como draft model que proponga tokens rapidamente y sea verificado por un modelo mayor, reduciendo la latencia global en pipelines de inferencia.
- Experimentacion con arquitecturas SSM: investigadores pueden usar el modelo como referencia funcional de Mamba2 implementado en Rust/Burn para estudiar eficiencia, estabilidad y calidad frente a transformers de tamano similar.
- Fine-tuning para dominios concretos: al ser un modelo base con licencia MIT, puede ajustarse con datasets propios (por ejemplo, texto tecnico o FAQ) para tareas de completado especializado en ingles.
- Despliegue en dispositivos embebidos y edge computing: su huella de ~0,1 GB en el repositorio y su naturaleza SSM lo hacen apto para entornos con memoria y computo muy limitados, como microcontroladores de gama alta o SBCs.
- Educacion y docencia: sirve como ejemplo didactico de entrenamiento desde cero de un modelo de lenguaje, incluyendo detalles de coste energetico y emisiones de CO2.

## Benchmarks y rendimiento

| Benchmark | Amir: tiny-llm (13M) | MooLLM-1.0-Air (6,76M) | MooLLM-1.0-Tiny (14,8M) |
|---|---|---|---|
| CoderPPL (OOD) | -43,4969 | -76,8079 | -50,6323 |
| HellaSwag | 27,00 | 24,85 | 24,94 |
| MMLU | 22,739 | 24,96 | 25,82 |
| WikiText-2 (-ppl) | -162,4178 | -218,9829 | -200,1136 |

Nota: CoderPPL es out-of-distribution para MooLLM-1.0, ya que no se incluyeron datasets de codigo en el entrenamiento. Los valores negativos de perplejidad se presentan tal como los publica el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (14,8M de parametros en fp32 ocupan ~59 MB; en fp16 ~30 MB). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el propio autor entreno en una AMD Radeon RX6600. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 3050, RTX 4090, etc.), asi como en iGPU y SBCs.
- Opciones de despliegue: transformers (Python), llama.cpp (el autor proporciona un GGUF sin cuantizar y un comando `llama-completion`), y el framework propio del autor (`cowllm sample`). Otras opciones como vLLM, TGI u Ollama no estan documentadas para este modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo se espera latencia de milisegundos en hardware moderno, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MooLLM-1.0-Tiny | ~14,8M | no disponible | 25,82 | 24,94 | MIT | Hugging Face (safetensors, GGUF) |
| MooLLM-1.0-Air | ~6,76M | no disponible | 24,96 | 24,85 | MIT | Hugging Face |
| Amir tiny-llm | ~13M | no disponible | 22,739 | 27,00 | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (modelos base de ~15M parametros con arquitectura SSM) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no puede mantener conversaciones ni responder preguntas; solo completa texto.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo elevado de alucinacion y de generar texto incoherente, como evidencian los ejemplos de salida del autor (texto fragmentado y sin sentido en varias muestras).
- No entrenado con datos de codigo, por lo que su rendimiento en tareas de programacion es deficiente (CoderPPL OOD).
- Longitud de contexto no documentada; se desconoce el limite practico de secuencia.
- Sesgos conocidos: no documentados, pero al entrenarse con Common Pile (YouTube, StackExchange, noticias, Wikimedia, Gutenberg) puede heredar sesgos de esas fuentes.
- Licencia MIT: permite uso comercial, pero el modelo no esta pensado para produccion en tareas de calidad; su uso comercial seria en contextos muy acotados (T9, autocompletado embebido).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-25) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/moomooai/moollm-1.0-tiny
- Repositorio del framework Burn: no disponible en la informacion proporcionada
- Paper de Mamba2: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
