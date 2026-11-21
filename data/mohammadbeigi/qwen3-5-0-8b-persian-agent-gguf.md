# MohammadBeigi/Qwen3.5-0.8B-Persian-Agent-GGUF

## Resumen

Qwen3.5-0.8B-Persian-Agent-GGUF es la distribucion en formato GGUF del modelo MohammadBeigi/Qwen3.5-0.8B-Persian-Agent, un ajuste fino completo orientado a persa (farsi) construido sobre Qwen/Qwen3.5-0.8B. Lo desarrolla Mohammad Beigi y su proposito es ofrecer un asistente conversacional y de tool calling en persa que pueda ejecutarse en dispositivos de gama baja, incluidos telefonos moviles, mediante llama.cpp y sus derivados (LM Studio, Ollama, Jan, PocketPal).

El modelo base declarado tiene 752.393.024 parametros (aproximadamente 0,8 mil millones), lo que lo situa en la categoria de modelos compactos aptos para inferencia on-device. El repositorio GGUF ocupa 1,9 GB y contiene tres cuantizaciones (Q8_0, Q5_K_M y Q4_K_M) generadas con imatrix especifica para persa, con requisitos de RAM que van desde 1 GB hasta 1,5 GB.

Su relevancia actual radica en dos factores: la escasez de modelos pequenos especializados en persa con soporte de function calling, y la inclusion de una plantilla de chat que cierra siempre el bloque `<think>`, lo que evita que aplicaciones con modo "thinking" activado por defecto devuelvan razonamiento en lugar de respuestas directas. La licencia Apache 2.0, heredada de Qwen, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (incluye compuertas SSM segun la model card); layout de tensores clasico sin fusionar |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la evaluacion de PPL usa contexto 512, pero no se especifica la ventana maxima) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | fa (persa), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (fully fine-tuned) del checkpoint Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parametros. La model card menciona que las cuantizaciones conservan las "SSM gates" en Q8_0, lo que indica que la arquitectura del modelo base incorpora componentes de tipo state space model junto con atencion, si bien no se detalla la proporcion ni el diseno exacto de esa hibridacion.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica innovacion tecnica documentada es el uso de imatrix especifica para persa en las cuantizaciones de menor precision y el mantenimiento del layout de tensores clasico de Qwen3.5, que garantiza compatibilidad con versiones antiguas de llama.cpp y con aplicaciones moviles. La plantilla de chat embebida fuerza el cierre del bloque `<think>`, lo que constituye una decision de diseno practica para evitar respuestas truncadas en clientes que activan el razonamiento por defecto.

## Capacidades

- Generacion de texto conversacional en persa e ingles, con respuestas orientadas a la utilidad directa.
- Tool calling / function calling, segun los tags del repositorio y la orientacion del modelo base.
- Uso como agente en flujos de multiples pasos (tag `agent`).
- Inferencia on-device en telefonos y equipos de bajos recursos.
- Modo de razonamiento (`<think>`) presente en la plantilla, aunque con cierre forzado para garantizar respuesta final.
- Capacidades multilingues limitadas a persa e ingles.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en persa para aplicaciones moviles: con cuantizacion Q4_K_M (533 MB, 1 GB de RAM) puede ejecutarse en telefonos Android e iOS mediante PocketPal, ofreciendo respuestas en persa sin conexion a red.
- Automatizacion de atencion al cliente en persa: el soporte de tool calling permite conectar el modelo a APIs de consulta de pedidos o estado de cuenta, manteniendo conversaciones multi-turno en un dispositivo local.
- Agentes locales de escritorio: integrado en LM Studio o Jan, puede gestionar tareas de extraccion de datos o clasificacion de texto en persa sin enviar informacion a servicios externos.
- Prototipado rapido de pipelines de agentes: la version Q8_0 (812 MB) sirve como sustituto casi sin perdida del modelo base para validar flujos de function calling antes de desplegar versiones mayores.
- Traduccion y asistencia bilingue persa-ingles: el modelo puede redactar y reescribir texto en ambos idiomas, util para documentacion tecnica o correspondencia.
- Educacion y tutoria en persa: despliegue en entornos con hardware limitado (Raspberry Pi, mini-PC) para responder preguntas y explicar conceptos, con la ventaja de funcionar offline.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse localmente, permite analizar documentos en persa sin salida de datos.

## Benchmarks y rendimiento

La unica metrica publicada es la perplejidad (PPL) sobre texto persa reservado, con contexto de 512 tokens y 30 fragmentos:

| Cuantizacion | Tamano | RAM minima | PPL persa (menor es mejor) |
|---|---|---|---|
| Q8_0 | 812 MB | 1,5 GB | 4,262 |
| Q5_K_M | 578 MB | 1,2 GB | 4,320 |
| Q4_K_M | 533 MB | 1 GB | 4,381 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1 GB (Q4_K_M), 1,2 GB (Q5_K_M) y 1,5 GB (Q8_0) segun la model card.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM puede alojar la version Q8_0. No hay datos para A100, H100 o RTX 4090.
- Compatibilidad con GPU consumer: si, en practicamente todas las GPU modernas (GTX 1060 en adelante, RTX 20/30/40, Apple Silicon).
- Despliegue: llama.cpp (`llama-cli` con `--jinja`), Ollama (`ollama run hf.co/...`), LM Studio, Jan y PocketPal en Android e iOS.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados: temperatura 0,7, top-p 0,8, top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Persian-Agent-GGUF | 752 M | no disponible | fa, en | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingue | Apache 2.0 | safetensors |
| Modelos persas compactos de otros autores | no disponible | no disponible | fa | variable | variable |

La comparacion cuantitativa con alternativas especializadas en persa no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es el ajuste fino en persa, la imatrix especifica y la plantilla de chat adaptada, a costa de una especializacion que puede reducir el rendimiento en otros idiomas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre datos persas, puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinacion inherente a un modelo de 0,8 B; su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos mayores.
- La ventana de contexto maxima no esta declarada; la evaluacion solo cubre 512 tokens, por lo que el comportamiento en contextos largos es incierto.
- Soporte linguistico restringido a persa e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- El modo "thinking" debe desactivarse en algunas aplicaciones (la model card lo indica para PocketPal), aunque la plantilla cierra el bloque automaticamente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B.
- No hay datos de benchmarks estandar que permitan evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent-GGUF
- Modelo base ajustado: https://huggingface.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/MohammadBeigi
- Contacto: robamad1396@gmail.com
