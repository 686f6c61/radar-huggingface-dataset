# anlord/gemma-3-1b-it-Abliterated-GGUF

## Resumen

anlord/gemma-3-1b-it-Abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF de una version "abliterated" (con los mecanismos de rechazo eliminados) del modelo google/gemma-3-1b-it de Google. Lo publica el usuario anlord bajo los terminos de licencia Gemma, y el modelo base cuenta con 999.885.952 parametros (aproximadamente 1.000 millones), correspondientes a un transformer decoder-only de la familia Gemma 3.

El proceso de abliteration se realizo con la herramienta AnlordAbliterator 1.4.0, que identifica y elimina la direccion de rechazo en el espacio de activaciones. Segun la model card del autor, los rechazos pasaron de 97 sobre 104 a 5 sobre 104, con una divergencia KL de 0,101 sobre 200 iteraciones de optimizacion. El modelo resultante se convirtio a GGUF y se cuantizo en ocho formatos distintos.

Su relevancia es doble: por un lado, ofrece una variante sin rechazos util para investigacion sobre alineacion y seguridad; por otro, al tratarse de un modelo de 1B parametros cuantizado, es desplegable en practicamente cualquier GPU de consumo mediante llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); no detallada en la model card |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (existe version base del modelo en safetensors) |

## Arquitectura y entrenamiento

El modelo es una derivacion directa de google/gemma-3-1b-it, un transformer decoder-only de aproximadamente 1.000 millones de parametros. La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base de Google y no se reproducen en este repositorio. La innovacion tecnica concreta de esta publicacion no esta en la arquitectura, sino en el postprocesado: la abliteration y la posterior cuantizacion.

La abliteration se aplico con AnlordAbliterator 1.4.0, que busca la direccion en el espacio de activaciones asociada a las respuestas de rechazo y la neutraliza mediante optimizacion. El autor reporta una reduccion de rechazos de 97/104 a 5/104, con una divergencia KL de 0,10103859007358551 sobre 200 pruebas de optimizacion, lo que indica una alteracion relativamente contenida de la distribucion de salida respecto al modelo original. Posteriormente el modelo se convirtio a GGUF y se cuantizo en ocho niveles, desde BF16/F16 hasta Q4_0.

## Capacidades

- Generacion de texto conversacional en formato instrucciones, heredada de la variante IT de Gemma 3 1B.
- Respuesta sin mecanismos de rechazo: el modelo practicamente no declina peticiones, comportamiento buscado deliberadamente mediante la abliteration.
- Razonamiento basico y tareas de conocimiento general propias de un modelo de 1B parametros.
- Ejecucion local eficiente gracias al formato GGUF y a las multiples cuantizaciones.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no documentadas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como se comporta un modelo cuando se suprime la direccion de rechazo, comparando respuestas frente al modelo original google/gemma-3-1b-it.
- Generacion de texto creativo sin restricciones tematicas: util para escritura de ficcion o guiones donde el modelo base tenderia a declinar ciertos temas.
- Prototipado rapido en local: gracias a las cuantizaciones Q4_K_M o Q4_0, puede ejecutarse en portatiles y equipos sin GPU dedicada para pruebas de concepto.
- Sistemas embebidos y edge: con un peso de aproximadamente 0,6-2,0 GB segun cuantizacion, es viable en dispositivos con memoria limitada mediante llama.cpp.
- Filtrado y analisis de texto: tareas de clasificacion, resumen o extraccion de informacion donde no se requiere un modelo grande.
- Chatbots de bajo coste: al ser un modelo de 1B, permite desplegar multiples instancias concurrentes con poco consumo de VRAM.
- Evaluacion comparativa de tecnicas de abliteration: permite medir el impacto de distintas herramientas sobre la tasa de rechazo y la divergencia KL.
- Generacion de datos sinteticos: util para producir texto en volumen en pipelines de aumento de datos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros). El unico dato cuantitativo aportado corresponde a las metricas internas del proceso de abliteration:

| Metrica | Valor |
|---|---|
| Rechazos iniciales | 97 / 104 |
| Rechazos finales | 5 / 104 |
| Divergencia KL | 0,10103859007358551 |
| Iteraciones de optimizacion | 200 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

Los tamanos de archivo son estimaciones a partir del numero de parametros (999.885.952) y del nivel de cuantizacion; el autor no publica los tamanos exactos por archivo.

| Cuantizacion | Tamano aproximado | VRAM estimada en inferencia |
|---|---|---|
| BF16 | ~2,0 GB | ~2,0-2,5 GB |
| F16 | ~2,0 GB | ~2,0-2,5 GB |
| Q8_0 | ~1,1 GB | ~1,2-1,5 GB |
| Q6_K | ~0,8 GB | ~1,0-1,2 GB |
| Q5_K_M | ~0,75 GB | ~0,9-1,1 GB |
| Q5_0 | ~0,7 GB | ~0,9-1,0 GB |
| Q4_K_M | ~0,7 GB | ~0,8-1,0 GB |
| Q4_0 | ~0,6 GB | ~0,7-0,9 GB |

- Cabe sobradamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU sola con llama.cpp.
- GPU de datacenter (A100, H100) no son necesarias para este tamano; su uso solo tendria sentido para servir muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no trabajan con GGUF de forma nativa en este flujo.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de 1B cuantizado se espera una generacion fluida en hardware de consumo.
- Ejemplo de ejecucion indicado por el autor: `llama-cli -m gemma-3-1b-it-abliterated-q4_k_m.gguf`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Estado de alineacion | Disponibilidad |
|---|---|---|---|---|---|
| anlord/gemma-3-1b-it-Abliterated-GGUF | ~1B | GGUF (8 cuantizaciones) | gemma | Abliterated (sin rechazos) | Publico en HF |
| google/gemma-3-1b-it | ~1B | safetensors | gemma | Alineado con rechazos | Gated en HF |
| anlord/gemma-3-1b-it-Abliterated | ~1B | safetensors | gemma | Abliterated | Publico en HF |

Alternativas de la misma categoria (modelos de ~1B parametros como Llama 3.2 1B Instruct o Qwen2.5 1.5B Instruct): datos de comparacion no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido danino, ofensivo o inseguro sin filtrar, lo que lo hace inadecuado para aplicaciones orientadas al usuario final sin capas de seguridad adicionales.
- Riesgo elevado de alucinacion inherente a un modelo de 1B parametros, que tiene una capacidad de razonamiento y conocimiento factual limitada.
- La cuantizacion introduce pequenas diferencias de comportamiento y calidad respecto al modelo en safetensors, como advierte el propio autor.
- Longitud de contexto e idiomas soportados no documentados en este repositorio.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones impuestas por Google para la familia Gemma; conviene revisarlas antes de cualquier despliegue en produccion.
- El modelo base esta gated en Hugging Face; este repositorio contiene archivos derivados, por lo que la responsabilidad de cumplir los terminos recae en quien lo utiliza.
- No se publican benchmarks estandar, por lo que no hay evidencia objetiva de rendimiento frente a modelos comparables.
- El numero de descargas y likes es 0, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anlord/gemma-3-1b-it-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Version abliterated en safetensors: https://huggingface.co/anlord/gemma-3-1b-it-Abliterated
- Herramienta de abliteration AnlordAbliterator: https://github.com/justbedwarsplay/AnlordAbliterator
