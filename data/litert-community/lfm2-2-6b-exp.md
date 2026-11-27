# litert-community/LFM2-2.6B-Exp

## Resumen

LFM2-2.6B-Exp es un checkpoint experimental de Liquid AI construido sobre LFM2-2.6B mediante aprendizaje por refuerzo puro, entrenado en seguimiento de instrucciones, conocimiento y matematicas. Este repositorio concreto no contiene los pesos originales, sino una conversion al formato `.litertlm` para el runtime LiteRT-LM de Google, orientado a inferencia en dispositivo (on-device) y entornos edge. La conversion la mantiene la comunidad `litert-community` usando litert-torch.

El modelo emplea una arquitectura hibrida de 30 capas que combina 22 capas de convolucion (ShortConv) con 8 capas de atencion, con embeddings atados y un vocabulario de 65.536 tokens. Cuenta con 2.569.272.320 parametros totales. El contexto nativo es de 32.768 tokens, aunque en esta conversion se limita a 4096. Soporta ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.

Su relevancia actual radica en que permite ejecutar un modelo de 2.6B parametros en telefonos y portatiles sin GPU dedicada, con variantes int4 de 1,53 GB e int8 de 2,72-2,73 GB. La model card reporta velocidades de decodificacion de 219,6 tok/s en GPU de Mac M4 Max con LiteRT-LM 0.20.0 y 31,0 tok/s en GPU de Galaxy S26 con LiteRT-LM 0.19.1. Liquid AI recomienda estos modelos para tareas agenticas, extraccion de datos, RAG, escritura creativa y conversaciones multiturno, no para tareas intensivas en conocimiento ni programacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 30 capas (22 de convolucion ShortConv + 8 de atencion), embeddings atados |
| Parametros totales | 2.569.272.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativo; 4096 en esta conversion |
| Tipos de cuantizacion | int4 (blockwise-32 + OCTAV en lineales, int8 en lm_head y embedding) e int8 (dynamic en lineales + embedding int8, convoluciones en float) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos base en safetensors en el repositorio original |

## Arquitectura y entrenamiento

El modelo base LFM2-2.6B-Exp parte de LFM2-2.6B y se afina mediante aprendizaje por refuerzo puro, segun la descripcion de Liquid AI. La arquitectura es un transformer hibrido en el que la mayoria de capas (22 de 30) usan convolucion ShortConv en lugar de atencion, lo que reduce el coste computacional y de memoria en inferencia secuencial, mientras que 8 capas mantienen atencion completa. El vocabulario es de 65.536 tokens y los embeddings estan atados. La configuracion, el tokenizer y la plantilla de chat coinciden con los de LFM2-2.6B.

Esta conversion a LiteRT-LM aplica recetas de cuantizacion especificas por fichero: la variante int4 usa cuantizacion blockwise de tamano 32 con OCTAV en las capas lineales e int8 en lm_head y embedding; la variante int8 usa cuantizacion dinamica en lineales, embedding int8 y filtros de convolucion en float. Algunas exportaciones incluyen "GPU composites" y estado de ShortConv en formato channels-last para mejorar el rendimiento en GPU. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, con entrenamiento especifico en instrucciones, conocimiento y matematicas.
- Razonamiento matematico basico y resolucion de problemas tipo GSM8K.
- Extraccion de datos estructurados a partir de texto (por ejemplo, fechas en una frase).
- Conversaciones multiturno con contexto de hasta 4096 tokens en esta conversion.
- Escritura creativa y generacion de texto abierto.
- Uso en pipelines de RAG (recuperacion aumentada) segun la recomendacion de Liquid AI.
- Tareas agenticas y de multiples pasos, segun la recomendacion del autor del modelo base.
- Capacidad multilingue en ocho idiomas.
- Modo de razonamiento implicito: aunque la model card de Liquid AI no lo documenta, en las pruebas el modelo genero ocasionalmente trazas entre ``.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Extraccion de informacion en el dispositivo: el modelo puede procesar texto localmente para extraer entidades como fechas, nombres o importes, sin enviar datos a la nube. La prueba de la model card con la frase "The meeting moved from May 3 to May 17" demuestra este uso con contexto corto.
- Asistentes conversacionales offline en movil: con 1,53 GB en int4 y 31,0 tok/s en GPU de Galaxy S26, es viable integrar un chatbot multiturno en una aplicacion Android sin conexion.
- Procesamiento de documentos en portatil: la variante int8 de 2,72 GB permite ejecutar el modelo en CPU de portatiles convencionales para resumir o clasificar texto localmente.
- RAG ligero en edge: combinado con un indice vectorial local, puede responder preguntas sobre documentacion interna manteniendo los datos en el dispositivo, aprovechando su contexto de 4096 tokens.
- Prototipado rapido de agentes: la recomendacion de Liquid AI para tareas agenticas permite construir flujos de multiples pasos en entornos sin infraestructura de servidor GPU.
- Generacion de texto creativo en aplicaciones de escritura: borradores, reescritura y continuaciones en ocho idiomas, ejecutables en hardware de consumo.
- Filtrado y clasificacion de texto en el borde: moderacion o etiquetado de contenido en tiempo real en dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card menciona evaluaciones en GSM8K (n=100) e IFEval-lite (n=120), indicando que las variantes int8 e int4 quedan a menos de dos items del modelo bf16, pero no se incluyen las cifras concretas en la informacion disponible.

Datos de rendimiento de decodificacion reportados:

| Entorno | Fichero | Velocidad |
|---|---|---|
| Mac M4 Max, GPU, LiteRT-LM 0.20.0 | `LFM2-2.6B-Exp_int4_v0200.litertlm` | 219,6 tok/s |
| Mac M4 Max, GPU, LiteRT-LM 0.20.0 | `LFM2-2.6B-Exp_int8_v0200.litertlm` | 149,1 tok/s |
| Galaxy S26, GPU, LiteRT-LM 0.19.1 | `LFM2-2.6B-Exp_int4_gpu_composite_v0190.litertlm` | 31,0 tok/s |
| Galaxy S26, GPU, LiteRT-LM 0.19.1 | `LFM2-2.6B-Exp_int4.litertlm` | 26,7 tok/s |

No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K con cifras) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,53 GB para las variantes int4 y 2,72-2,73 GB para las variantes int8, segun el tamano de los ficheros.
- GPU recomendadas: no se especifican modelos de datacenter (A100, H100); el runtime LiteRT-LM esta orientado a GPU integradas y moviles. Se han validado GPU de Mac M4 Max y GPU de Galaxy S26.
- Compatibilidad con GPU de consumo: si, en el sentido de que funciona en GPU integradas de Apple Silicon y en GPU moviles Android; no hay datos sobre RTX 4090 u otras GPU dedicadas de escritorio.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (paquete PyPI `litert-lm`, requiere Python 3.10 o superior). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: 219,6 tok/s (int4) y 149,1 tok/s (int8) en GPU de Mac M4 Max con LiteRT-LM 0.20.0; 31,0 tok/s (int4 GPU composite) en Galaxy S26 con LiteRT-LM 0.19.1.
- Nota de compatibilidad: en LiteRT-LM 0.19.2 en GPU, los ficheros `_v0200` produjeron texto corrupto sin error; deben usarse con LiteRT-LM 0.20.0. En CPU, la variante int4 repitio respuestas en Mac, por lo que se recomienda int8 para CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato edge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-2.6B-Exp (LiteRT-LM) | 2,57B | 4096 (32.768 nativo) | `.litertlm` int4/int8 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM2-2.6B-Exp (original) | 2,57B | 32.768 | safetensors | LFM Open License v1.0 | Hugging Face |
| Otros modelos edge comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Checkpoint experimental: Liquid AI lo describe como experimental, construido con RL puro; no esta pensado para tareas intensivas en conocimiento ni para programacion.
- Contexto reducido en esta conversion: 4096 tokens frente a los 32.768 nativos, lo que limita casos de uso con documentos largos.
- Riesgo de alucinacion: al ser un modelo de 2.6B orientado a instrucciones y no a conocimiento, puede generar afirmaciones incorrectas en preguntas factuales.
- Inestabilidad en el runtime: se documentan fallos de correccion (texto corrupto, respuestas repetidas, respuestas ignoradas) segun la version de LiteRT-LM y el backend; es necesario emparejar fichero y version del runtime segun la tabla de la model card.
- Cobertura de pruebas limitada: los ficheros `_v0200` no se probaron en iOS ni en telefono; la validacion movil se hizo con la variante `_v0190` en Galaxy S26.
- Licencia LFM Open License v1.0: es una licencia "other" con terminos propios; debe revisarse el enlace de licencia antes de uso comercial.
- Idiomas: aunque soporta ocho idiomas, no se detalla la calidad relativa por idioma; el espanol esta incluido pero sin evaluaciones publicadas en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Trazas de razonamiento no documentadas: la aparicion ocasional de `
