# RadixArk/DaisyRose-27B-FP8

## Resumen

DaisyRose-27B-FP8 es la versión cuantizada en FP8 de DaisyRose-27B, el primer modelo publicado por RadixArk. Se trata de un modelo multimodal de razonamiento construido sobre Qwen3.8-27B y afinado exclusivamente mediante aprendizaje por refuerzo, sin supervisión directa (SFT) ni destilación. El objetivo declarado es mejorar el comportamiento agéntico de largo horizonte del modelo base: ejecución de tareas en terminal, resolución de incidencias de software y seguimiento de instrucciones complejas en sesiones extensas.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, además de su comprensión de imágenes y su ventana de contexto de 256K tokens, por lo que funciona como reemplazo directo en pilas de inferencia y post-entrenamiento ya existentes. Cuenta con 27.781.427.952 parámetros totales (27B densos, sin mezcla de expertos) y se distribuye bajo licencia Apache-2.0 en tres formatos: BF16, FP8 y NVFP4.

La relevancia de esta ficha radica en que el autor publica una comparativa amplia frente al modelo base y frente a modelos abiertos de tamaño similar o superior, con ganancias medibles en Terminal Bench 4.1 (de 5,6 a 12,0 en pass@1) y en el resto de benchmarks de código, razonamiento y seguimiento de instrucciones. El repositorio FP8 ocupa 61,7 GB y está etiquetado para la librería transformers con pipeline image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, heredada de Qwen3.8-27B (tag `qwen3_5`) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 (esta version); el autor publica tambien BF16 y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B: un transformer denso de 27B parametros con capacidad multimodal de entrada imagen-texto. No se ha modificado el tokenizador ni la plantilla de chat, lo que garantiza compatibilidad directa con las configuraciones de inferencia del modelo original. El autor no detalla en la informacion disponible la composicion del corpus de preentrenamiento del modelo base ni innovaciones de atencion especificas.

El entrenamiento de DaisyRose-27B se realizo exclusivamente con aprendizaje por refuerzo, sin SFT ni destilacion, sobre aproximadamente 1.200 tareas agénticas de horizonte largo cuidadosamente seleccionadas, con sesiones de hasta 1M tokens. El proceso duro 18 dias en 144 GPU H200. Esta eleccion de entrenamiento (RL puro sobre tareas agénticas) explica el salto en Terminal Bench 4.1 (de 5,6 a 12,0 pass@1) y las mejoras en DeepSWE v1.1, SWE Bench Pro v2 e IFBench. El repositorio incluye ademas un modelo draft asociado, Qwen3.8-27B-DSpark, pensado para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de imagen y texto y produce respuestas razonadas en modo thinking.
- Razonamiento de largo horizonte: sesiones de hasta 256K tokens de contexto, con esfuerzo de razonamiento configurable (el autor evalua con `reasoning effort xhigh`).
- Ejecucion de tareas agénticas en terminal: uso de herramientas de linea de comandos, interpretacion de salidas y correccion de errores en multiples pasos.
- Ingenieria de software: resolucion de incidencias en repositorios reales (DeepSWE v1.1, SWE Bench Pro v2).
- Seguimiento de instrucciones complejas: puntuacion alta en IFBench (82,4), el mejor resultado de la comparativa publicada.
- Razonamiento cientifico y de conocimiento: GPQA Diamond 90,7 y HLE (solo texto) 34,3.
- Soporte de tool calling y function calling: implicito en el diseno agéntico y en el harness mini-swe-agent usado en las evaluaciones.
- Compatibilidad drop-in con Qwen3.8-27B: misma plantilla de chat, tokenizador y arquitectura.

## Casos de uso

- Agente de terminal autonomo: el modelo puede recibir una tarea de administracion de sistemas o de build y ejecutar comandos, leer la salida y corregir errores en sesiones de hasta 256K tokens. Sus 12,0 puntos en Terminal Bench 4.1 lo sitúan por encima del modelo base (5,6) y de GPT-6 Luna (15,2 en el mismo benchmark, aunque con otro harness).
- Resolucion automatica de incidencias en repositorios: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, es adecuado para pipelines de CI que abren parches sobre issues etiquetadas, revisan el diff y lo validan contra la suite de tests.
- Asistente de codigo con contexto de repositorio completo: la ventana de 256K permite cargar multiples ficheros, el historial de commits y la documentacion interna en una sola sesion, algo relevante para refactorizaciones transversales.
- Automatizacion de tareas de oficina con capturas de pantalla: al ser image-text-to-text, puede interpretar capturas de UI o diagramas y traducirlos en acciones concretas (rellenar formularios, extraer datos de tablas).
- Analisis de documentacion tecnica extensa: informes, especificaciones o manuales de mas de 200K tokens se pueden procesar en una unica pasada sin troceado, con razonamiento encadenado sobre el contenido.
- Evaluacion y red-teaming de agentes: su perfil de RL puro sobre tareas agénticas lo hace util como generador de trayectorias de referencia o como juez en pipelines de evaluacion de agentes.
- Despliegue en produccion con cuantizacion FP8: al publicarse en FP8 y NVFP4 ademas de BF16, permite servir el modelo en GPUs con menos memoria sin reentrenar ni cambiar la plantilla de chat.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Parametros activos | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parametros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Notas de evaluacion segun el autor: Terminal Bench 4.1 promediado sobre 8 repeticiones con harness mini-swe-agent y summarization; Terminal Bench 2.1 sobre 5 repeticiones con Terminus 2; DeepSWE v1.1 sobre 8 repeticiones con mini-swe-agent; SWE Bench Pro v2 sobre 5 repeticiones con mini-swe-agent; HLE sobre 5 repeticiones con GPT-6 Luna como juez y sin herramientas; IFBench sobre 4 repeticiones y 300 prompts con el scorer oficial; GPQA Diamond sobre 8 repeticiones de 198 preguntas. Todas las ejecuciones de DaisyRose-27B usan temperature 1.0, top_p 0.95, top_k 20, min_p 0 y reasoning effort xhigh. Las puntuaciones de DaisyRose-27B son la mejor de las ejecuciones BF16 y FP8, que difieren en menos de un punto en todos los benchmarks donde se ejecutaron ambas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 28 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 40-48 GB para contexto moderado.
- VRAM estimada en BF16: alrededor de 56 GB solo para pesos, por lo que requiere GPU de 80 GB o multi-GPU.
- VRAM estimada en NVFP4: aproximadamente 14-16 GB para pesos, la opcion mas viable en GPUs de consumo.
- GPU recomendadas: H200 (usada por el autor para el entrenamiento), H100 80 GB, A100 80 GB para BF16; L40S, RTX 6000 Ada o A100 40 GB para FP8; RTX 4090 (24 GB) viable solo con NVFP4 y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/5090 con la variante NVFP4 y contexto limitado; en FP8 no cabe en 24 GB.
- Opciones de despliegue: transformers (libreria declarada), con compatibilidad esperada con vLLM, TGI y llama.cpp para FP8/NVFP4 segun soporte de la comunidad; el tag `endpoints_compatible` sugiere despliegue gestionado en Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Terminal Bench 4.1 | DeepSWE v1.1 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DaisyRose-27B-FP8 | 27B / 27B | 256K | 12,0 | 46,2 | 90,7 | Apache-2.0 | Hugging Face (BF16, FP8, NVFP4) |
| Qwen3.8-27B | 27B / 27B | 256K | 5,6 | 42,2 | 89,2 | No disponible en la informacion | Hugging Face (modelo base) |
| Muse Glimmer-30B | 30B / 30B | No disponible | 0,5 | 4,4 | 83,5 | No disponible en la informacion | Hugging Face (meta-models) |
| Qwen3.6-35B-A3B | 35B / 3B | No disponible | 0,0 | 0,0 | 86,0 | No disponible en la informacion | Hugging Face |

DaisyRose-27B-FP8 mejora a su modelo base en todos los benchmarks publicados, con la mayor ganancia en Terminal Bench 4.1 (+6,4 puntos) y en IFBench (+2,9). Frente a modelos mas grandes como MiMo V2.6 Flash (309B), Inkling 2 Small (594B) o Muse Spark Open (816B), el modelo de RadixArk queda por detras en tareas agénticas complejas pero compite en GPQA Diamond e IFBench con una huella de parametros mucho menor.

## Limitaciones y advertencias

- Entrenado exclusivamente con RL sobre unas 1.200 tareas agénticas: el autor no documenta el uso de SFT ni de datos de alineacion general, lo que puede producir un comportamiento menos pulido en conversaciones abiertas fuera del dominio agéntico.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones especificas de veracidad; en tareas de codigo y terminal el modelo puede generar comandos plausibles pero incorrectos.
- Idiomas soportados: no disponible; al heredar el tokenizador de Qwen3.8-27B se espera cobertura multilingue, pero no se confirma en la informacion proporcionada.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen3.8-27B, no evaluados por el autor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base Qwen3.8-27B.
- El repositorio FP8 registra 0 descargas y 0 likes en el momento de la consulta, y el modelo se creo en noviembre de 2026: es un lanzamiento muy reciente con poca validacion independiente.
- Los benchmarks los reporta el propio autor; varias comparaciones usan harness distintos (mini-swe-agent, Terminus 2, Codex) y algunas filas de modelos competidores provienen de leaderboards o de sus propias model cards, lo que limita la comparabilidad directa.
- Las puntuaciones de DaisyRose-27B corresponden a la mejor ejecucion entre BF16 y FP8; aunque el autor afirma que la diferencia es inferior a un punto, conviene validar el rendimiento FP8 en el hardware de destino.

## Enlaces

- Modelo FP8 en Hugging Face: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Modelo BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Draft para decodificacion especulativa: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del autor: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B-FP8/blob/main/LICENSE
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai Terminal Bench: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis Qwen3.8-27B: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis Qwen3.6-35B-A3B: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Release MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
