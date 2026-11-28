# nace-ai/Hy4-flash-MLX-3.8bit

## Resumen

Hy4-flash MLX 3.8bit es una cuantizacion del modelo Hy4-flash original de Tencent, publicada por Nace.AI en formato MLX para su ejecucion en hardware Apple Silicon. El modelo base es un transformer de gran escala con 218.938.886.165 parametros totales (segun los safetensors del repositorio), empaquetado a 3,8 bits por peso para reducir el peso en disco hasta los 103,7 GB que ocupa el repositorio. Esta pensado para desarrolladores que quieran ejecutar un modelo de esta magnitud en Macs con memoria unificada amplia, sin depender de GPUs dedicadas.

La relevancia de esta variante radica en la agresividad de la cuantizacion: 3,8 bits por peso es un compromiso que busca mantener la fidelidad del modelo original (la model card incluye una comparativa de divergencia KL sobre 37 variantes medidas) mientras se reduce drasticamente el espacio necesario. El autor documenta que el pack requiere un runtime con soporte de "packed-expert" y de tablas Engram en formato GGUF, lo que sugiere que el modelo base emplea una arquitectura con componentes de mezcla de expertos y algun mecanismo auxiliar denominado Engram.

El modelo esta orientado a generacion de texto y conversacion, con soporte declarado unicamente para ingles. La licencia es la HY Community License de Tencent, no una licencia open source estandar, lo que condiciona su uso comercial. La informacion publica disponible es escasa: no hay datos de benchmarks, contexto ni composicion del dataset en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con componentes de mezcla de expertos (packed-expert) y tablas Engram; detalles completos no disponibles |
| Parametros totales | 218.938.886.165 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,8 bits por peso (variante MLX cuantizada del modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | HY Community License (tencent-hy-license) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base mas alla de las referencias a "packed-expert" y a tablas Engram que el runtime debe soportar. El termino packed-expert apunta a una implementacion de mezcla de expertos con expertos empaquetados en memoria, y las tablas Engram parecen ser un componente auxiliar del modelo original que la cuantizacion debe preservar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion es el proceso de cuantizacion: Nace.AI documenta 37 variantes medidas del mismo modelo sobre 11 textos y 5.621 tokens puntuados, con graficos de divergencia KL para comparar la calidad de cada variante. El empaquetado a 3,8 bits incluye las tablas Engram necesarias y excluye los componentes de vision y MTP del computo de tamano. Esta metodologia de evaluacion por divergencia KL, en lugar de benchmarks de tareas, es el unico dato de calidad disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (text-generation, conversational).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la model card menciona que los pesos de vision y MTP existen en el modelo base pero no se incluyen en el computo de tamano de esta variante.
- Ejecucion en Apple Silicon mediante la libreria MLX.

## Casos de uso

- Prototipado local en Mac: un desarrollador con un Mac Studio de memoria unificada alta puede descargar el pack y ejecutar inferencia sin GPU dedicada, gracias al formato MLX y al peso reducido de 103,7 GB.
- Evaluacion de calidad de cuantizacion: investigadores pueden reproducir la comparativa de divergencia KL del autor sobre sus propios textos para medir la perdida de fidelidad del empaquetado a 3,8 bits frente al modelo original.
- Generacion de texto en ingles para entornos de desarrollo: el modelo sirve para tareas de redaccion y conversacion en ingles dentro de flujos de trabajo locales, con la ventaja de no enviar datos a servicios externos.
- Investigacion sobre arquitecturas con packed-expert: al requerir un runtime especifico, el pack es util para quienes estudian el soporte de este tipo de arquitecturas en MLX y en formatos GGUF.
- Pruebas de integracion de runtimes: desarrolladores de herramientas de inferencia pueden usar este modelo como caso de prueba para validar el soporte de tablas Engram y expertos empaquetados.
- Despliegue experimental en estaciones de trabajo Apple: equipos que ya trabajan en el ecosistema MLX pueden incorporar el modelo a pipelines de generacion de texto internos, siempre que la licencia HY Community lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica de calidad documentada es la divergencia KL de 37 variantes de cuantizacion sobre 11 textos y 5.621 tokens puntuados, cuyos datos exactos estan en el fichero `assets/combined-kl.json` del repositorio.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 103,7 GB, por lo que se necesita un equipo con al menos esa cantidad de memoria unificada disponible para cargar los pesos, mas el margen para el contexto y el estado del runtime.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (Mac Studio, Mac Pro); no aplica a GPUs NVIDIA o AMD por el formato MLX.
- Cabe en consumer GPU: no en el sentido habitual; requiere un Mac con memoria unificada de gama alta.
- Opciones de despliegue: libreria MLX; la model card indica que se necesita un runtime con soporte de packed-expert y tablas Engram en GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash MLX 3.8bit (esta ficha) | 218.938.886.165 | no disponible | safetensors MLX | HY Community License | Hugging Face, 220 descargas |
| tencent/Hy4-flash (modelo base) | no disponible en la informacion | no disponible | no disponible | HY Community License | Hugging Face |
| Otras variantes de cuantizacion de Hy4-flash de Nace.AI | mismas que el base | no disponible | MLX | HY Community License | referenciadas en la comparativa del autor |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto; no se aportan evaluaciones especificas.
- Limitacion de idioma: solo se declara soporte de ingles, lo que excluye el castellano en produccion.
- Restriccion de licencia: la HY Community License de Tencent no es una licencia open source estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Dependencia de runtime: el pack no funciona en runtimes MLX estandar sin soporte de packed-expert y tablas Engram, lo que limita su portabilidad.
- Cuantizacion agresiva: 3,8 bits por peso puede degradar la calidad frente al modelo original; la unica evidencia disponible es la divergencia KL del autor.
- Componentes excluidos: los pesos de vision y MTP no estan incluidos en esta variante, por lo que no cabe esperar capacidades multimodales.
- Informacion incompleta: faltan datos de contexto, benchmarks y composicion del entrenamiento, lo que dificulta una evaluacion rigurosa para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-3.8bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio de Nace.AI: https://www.nace.ai/
- Datos de la comparativa de cuantizacion: `assets/combined-kl.json` (en el repositorio)
- Grafico de calidad de cuantizacion: `assets/combined-kl.png` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
