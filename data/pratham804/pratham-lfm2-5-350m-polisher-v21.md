# Pratham804/Pratham-LFM2.5-350M-Polisher-v21

## Resumen

Pratham-LFM2.5-350M-Polisher-v21 es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-350M, desarrollado por el usuario independiente Pratham804. Su funcion es actuar como "dictation polisher": recibe texto procedente de dictado por voz (con muletillas, reparaciones, reformulaciones y vacilaciones) y lo convierte en prosa escrita limpia, manteniendo la fidelidad factual del contenido original. El modelo esta pensado para ejecutarse en CPU y en dispositivos de bajos recursos, dado su tamano reducido.

La version v21 se distingue de la v20 por un corpus de entrenamiento disenado especificamente para entradas largas: 1.190 ejemplos con una mediana de 211 palabras, un percentil 90 de 1.007 palabras y un maximo de 1.080. Segun la model card, la v20 fallaba en dictados largos no por un limite de contexto, sino porque nunca habia visto ese caso en su distribucion de entrenamiento.

La relevancia actual del modelo radica en su enfoque de eficiencia: con 354 millones de parametros, cuantizaciones de 229 MB (Q4_K_M) y 293 MB (Q6_K), y ejecucion en CPU, ofrece una alternativa para pipelines de limpieza de texto en local sin dependencia de servicios en la nube. La model card reporta una mejora sustancial en recuperacion de contenido (de 0,359 a 0,958 de media) y una reduccion de palabras fabricadas de 140 a 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM2.5-350M; la model card no detalla la arquitectura interna) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; las pruebas se realizaron con n_ctx 4096 |
| Tipos de cuantizacion | Q4_K_M (229 MB) y Q6_K (293 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 millones de USD de ingresos anuales) |
| Formato de pesos | GGUF (libreria llama.cpp); el ajuste se realizo mediante LoRA entrenado y fusionado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M y se obtiene mediante un ajuste fino supervisado (SFT) con pesos LoRA entrenados y posteriormente fusionados en el modelo base, seguido de conversion a GGUF. La model card no detalla la arquitectura interna del modelo base (transformer, MoE u otra), por lo que ese dato queda como no disponible.

El corpus de entrenamiento de la v21 consta de 1.190 ejemplos construidos para entradas largas: mediana de 211 palabras, percentil 90 de 1.007 palabras y maximo de 1.080. Las entradas son "plan-induced speech" (discurso inducido por plan), es decir, muletillas, autorreparaciones, clausulas reformuladas y vacilaciones colocadas en fronteras gramaticales, en lugar de prosa limpia con "you know" anadido. Los objetivos son exactos por construccion: cada registro incluye una representacion de referencia del mismo contenido y las enumeraciones se convierten en listas con vinetas de forma determinista. Las salidas del modelo profesor solo se admitieron si superaban un "fact-lock": sin numeros inventados, contenido inventado acotado, recall de contenido de al menos el 80 % y una relacion de longitud razonable. Lo que no superaba el filtro se descartaba.

Durante el entrenamiento se alternaron variantes de prompt: un tercio de los ejemplos sin mensaje de sistema, un tercio con uno minimo y un tercio con el completo. El objetivo era que la tarea se aprendiera del turno del usuario y no dependiera del prompt de sistema. La model card indica que la etapa de RL (un run de GRPO con la recompensa de fidelidad descrita) solo produjo unas pocas docenas de pasos de gradiente antes de terminar la sesion; los pesos publicados son el SFT, y la tabla de resultados se reporta como SFT-only.

## Capacidades

- Limpieza de dictado: convierte habla transcrita con muletillas, reparaciones y vacilaciones en prosa escrita limpia.
- Fidelidad factual: mantiene el contenido del texto de entrada sin inventar numeros ni palabras de contenido, segun las metricas reportadas.
- Conversion de enumeraciones: transforma enumeraciones habladas en listas con vinetas de forma determinista.
- Independencia del prompt de sistema: la tarea se aprende del turno del usuario; el modelo funciona sin system prompt.
- Ejecucion en CPU: disenado para inferencia en local con llama.cpp.
- Generacion de texto conversacional (pipeline text-generation).
- No soporta, segun la model card: resumen, traduccion ni verificacion de hechos.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Limpieza de notas de voz: un flujo de dictado captura audio, lo transcribe con un ASR y pasa el texto por este modelo para eliminar muletillas y reparaciones antes de guardarlo en una aplicacion de notas. Su tamano de 229 MB en Q4_K_M permite ejecutarlo en el mismo dispositivo que captura el audio.
- Correccion de transcripciones en herramientas de accesibilidad: usuarios que dictan texto largo (hasta 1.080 palabras en el corpus de entrenamiento) pueden obtener prosa legible sin enviar datos a la nube, gracias a la ejecucion local en CPU.
- Preprocesado en pipelines de documentacion tecnica: integrado tras un ASR en un flujo de captura de requisitos o actas de reunion, normaliza el texto dictado y convierte enumeraciones en listas antes de que un humano lo revise.
- Edicion de texto en entornos con recursos limitados: en portatiles sin GPU o en dispositivos embebidos, el modelo en Q4_K_M (229 MB) puede procesar dictados con latencia baja usando llama.cpp.
- Prototipado de asistentes de escritura local-first: desarrolladores que construyen editores de texto con privacidad como requisito pueden usar el modelo como capa de pulido sin depender de APIs externas.
- Generacion de datos de entrenamiento limpios: equipos que construyen corpus a partir de transcripciones pueden usar el modelo para normalizar el texto manteniendo la fidelidad, dado el bajo coste computacional por ejemplo.
- Filtrado de entradas en sistemas de atencion al cliente basados en voz: limpiar la transcripcion del cliente antes de pasarla a un modelo mayor reduce ruido y coste de tokens en el modelo de razonamiento posterior.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia sobre cuatro dictados (82, 150, 325 y 381 palabras), con los mismos ajustes de servidor (n_ctx 4096, decodificacion greedy), con y sin system prompt. Las metricas son `recall` (proporcion de palabras de contenido de la entrada que sobreviven) y `fab` (palabras de contenido en la salida ausentes en la entrada).

| Entrada | System prompt | Recall v20 | Recall v21 | Fab v20 | Fab v21 |
|--:|:--:|--:|--:|--:|--:|
| 82 palabras | si | 0,625 | 0,925 | 3 | 0 |
| 82 palabras | no | 0,250 | 0,925 | 3 | 0 |
| 150 palabras | si | 0,387 | 0,960 | 9 | 0 |
| 150 palabras | no | 0,013 | 0,960 | 3 | 0 |
| 325 palabras | si | 0,586 | 0,974 | 11 | 0 |
| 325 palabras | no | 0,125 | 0,974 | 40 | 0 |
| 381 palabras | si | 0,588 | 0,978 | 16 | 0 |
| 381 palabras | no | 0,297 | 0,973 | 55 | 0 |

| Metrica agregada | v20 | v21 |
|:--|--:|--:|
| Recall medio de contenido | 0,359 | 0,958 |
| Palabras de contenido fabricadas (total) | 140 | 0 |
| Recompensa media | −8,43 | +0,36 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores son una evaluacion propia del autor centrada en la tarea de pulido de dictado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo esta disenado para ejecucion en CPU. En Q4_K_M ocupa 229 MB y en Q6_K 293 MB en disco y en memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada; dado el tamano, cualquier GPU consumer moderna podria alojarlo, pero la model card no especifica requisitos de GPU.
- Cabe en GPU consumer: si, por tamano (229-293 MB), aunque la model card no publica pruebas en GPU.
- Opciones de despliegue: llama.cpp (llama-cli, segun el ejemplo de la model card); la libreria declarada es llama.cpp y el formato es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pratham-LFM2.5-350M-Polisher-v21 | 354.483.968 | no disponible | LFM Open License v1.0 | GGUF | Fine-tune especializado en pulido de dictado |
| LiquidAI/LFM2.5-350M (base) | 350M (aprox.) | no disponible | LFM Open License v1.0 | no disponible | Modelo base sin el ajuste de pulido |
| Pratham-LFM2.5-350M-Polisher-v20 | no disponible | no disponible | LFM Open License v1.0 (presumible) | GGUF | Version anterior, entrenada con dictados mas cortos (mediana de 35 palabras) |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoria en la informacion proporcionada. La comparativa con modelos de pulido de dictado de otros autores no esta disponible.

## Limitaciones y advertencias

- Estilo fiel antes que elegante: los objetivos son representaciones factualmente exactas, por lo que el modelo copia y limpia de forma fiable pero no reescribe para mejorar el estilo. La model card indica que una mejora notable de vocabulario requeriria un profesor mas potente.
- Etapa de RL incompleta: el run de GRPO solo produjo unas pocas docenas de pasos de gradiente; los pesos publicados son el SFT, y los resultados reportados corresponden solo a esa etapa.
- Saltos de parrafo: la model card senala que los saltos de parrafo deberian gestionarse en un postprocesador determinista, no en los pesos del modelo.
- Solo ingles: entrenado para edicion en ingles; no es un resumidor, traductor ni verificador de hechos.
- Riesgo de alucinacion: aunque la evaluacion propia reporta cero palabras de contenido fabricadas en las cuatro pruebas, se trata de una muestra reducida y no de una garantia general; conviene validar en produccion.
- Licencia: LFM Open License v1.0 permite uso comercial solo por debajo de 10 millones de USD de ingresos anuales; por encima de ese umbral es necesario revisar los terminos.
- Relacion con Liquid AI: el modelo no esta afiliado, respaldado ni patrocinado por Liquid AI; es una version modificada del modelo base.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Contexto e idioma: la longitud de contexto del modelo no se documenta como spec; las pruebas se hicieron con n_ctx 4096, y el corpus de entrenamiento llega a 1.080 palabras por ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-Polisher-v21
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
