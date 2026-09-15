# siddarthg44/anlp-a2-p2-muon

## Resumen

`siddarthg44/anlp-a2-p2-muon` es un modelo de lenguaje de tipo transformer decoder-only denso, publicado como parte de la asignacion 2 de un curso de ANLP (procesamiento de lenguaje natural avanzado). Concretamente, es la parte 2 de un trabajo en el que se reutiliza el transformer denso de la parte 1 y se entrena sobre el corpus `browndw/human-ai-parallel-corpus` con una implementacion desde cero del optimizador **muon**, que solo hereda de `torch.optim.Optimizer`. El interes del artefacto no es la calidad del modelo resultante, sino el experimento controlado: la model card indica que los cinco optimizadores comparados comparten semilla, orden de datos, forma del schedule y presupuesto de tokens, de modo que la unica variable es la regla de actualizacion y su learning rate pico.

El modelo es muy pequeno: `d_model` de 512, 8 capas, 8 cabezas de atencion y una longitud de contexto de 256 tokens. Se entreno con un presupuesto de 39.714.816 tokens y un learning rate pico de 0,02, y alcanzo una perdida de validacion final de 4,5165 y un BLEU de continuacion de 1,4561 (la model card no especifica la escala de esta metrica). El estado del optimizador ocupa 5,0 bytes por parametro, un dato relevante para estimar memoria de entrenamiento.

Su relevancia actual es acotada y de caracter metodologico: sirve para reproducir y auditar la comparacion entre muon y otros optimizadores a escala tiny, y como material docente. No es un modelo apto para produccion: no declara licencia, no publica benchmarks estandar, tiene 0 descargas y 0 likes, y su presupuesto de entrenamiento esta muy por debajo de lo que recomendaria la regla de Chinchilla incluso para su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE, no SSM) |
| Parametros totales | no disponible (el cuerpo del transformer se estima en ~25,2 M de parametros; ver seccion de arquitectura) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publica un checkpoint en `.pt`; no hay versiones cuantizadas ni GGUF) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`.pt`); `last.pt` contiene pesos y configuracion. Sin safetensors ni GGUF |
| Dimension del modelo (`d_model`) | 512 |
| Capas / cabezas de atencion | 8 / 8 |
| Optimizador | muon (implementado desde cero, subclase unicamente de `torch.optim.Optimizer`) |
| Learning rate pico | 0,02 |
| Estado del optimizador | 5,0 bytes por parametro |
| Presupuesto de tokens | 39.714.816 |
| Perdida de validacion final | 4,5165 |
| BLEU de continuacion final | 1,4561 (escala no especificada) |
| Libreria | pytorch |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-15 (ambas) |
| Ficheros incluidos | `last.pt`, `tokenizer.json`, `summary.json`, `history.json` (y, segun la model card, el codigo de carga en `src/model.py`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso con normalizacion y atencion estandar, configurado con `d_model = 512`, 8 capas y 8 cabezas, y entrenado con objetivos de modelado de lenguaje autorregresivo (prediccion del siguiente token). La longitud de contexto es de 256 tokens. El checkpoint se carga con `build_model(TransformerConfig.from_dict(state["config"]))` y `model.load_state_dict(state["model"])` usando `src/model.py`, lo que confirma que la definicion de la arquitectura vive en el repositorio y no esta registrada en librerias estandar.

El dato mas destacable es el optimizador. La model card indica que muon se implemento desde cero heredando solo de `torch.optim.Optimizer`, con un learning rate pico de 0,02 y un estado de 5,0 bytes por parametro. A modo de comparacion general, los dos momentos de AdamW en fp32 ocupan 8 bytes por parametro, por lo que el estado de muon es aproximadamente un 37,5 % mas compacto en este caso. El learning rate de 0,02 es muy superior al rango habitual de AdamW para modelos de este tamano (del orden de 3e-4), lo que es coherente con la normalizacion de la actualizacion que caracteriza a muon. El entrenamiento se realizo sobre `browndw/human-ai-parallel-corpus` con un presupuesto total de 39.714.816 tokens; no se documenta el tamano del lote, el esquema de decaimiento del learning rate ni el numero de pasos.

En cuanto al numero de parametros: el cuerpo del transformer, con la convencion habitual de 12·`d_model`² por bloque, suma aproximadamente 25,2 M de parametros (12 · 512² · 8 = 25.165.824). A esa cifra hay que anadir la matriz de embeddings y, si no estan atados, la proyeccion de salida, cuyo tamano depende del vocabulario del `tokenizer.json`, que no se especifica en la informacion disponible. Por eso la cifra total se marca como no disponible: la estimacion del cuerpo es derivada de la configuracion, no confirmada por el autor. No se menciona ningun ajuste posterior tipo RLHF o DPO, ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en ingles como modelo base (no ajustado por instrucciones): continuacion de secuencias de hasta 256 tokens de contexto.
- Modelado de lenguaje autorregresivo y calculo de probabilidades del siguiente token, util para medir perplejidad sobre corpus propios.
- Continuacion de texto evaluable con BLEU, tal como reporta la model card (valor final 1,4561).
- Capacidad de servir como sujeto de experimentos de optimizacion: el checkpoint esta pensado para reproducir la comparacion entre reglas de actualizacion bajo semilla, orden de datos, schedule y presupuesto de tokens identicos.
- No hay soporte de tool calling ni de function calling documentado.
- No hay soporte de agentes ni de razonamiento multi-paso documentado.
- No hay capacidades multilingues: el unico idioma declarado es el ingles.
- No hay modo de razonamiento explicito (thinking mode), vision, audio ni ninguna otra modalidad.
- No hay plantilla de chat ni formato de instrucciones publicado; el modelo no esta alineado para dialogo.

## Casos de uso

- Comparativa controlada de optimizadores: al formar parte de una serie de cinco entrenamientos con la misma semilla, orden de datos, forma del schedule y presupuesto de 39.714.816 tokens, permite aislar el efecto de muon (learning rate pico 0,02) frente a otras reglas de actualizacion sobre la perdida de validacion final y el BLEU de continuacion.
- Material docente en cursos de NLP: el repositorio incluye `summary.json` con metricas cada 0,1x del dataset e `history.json`, lo que facilita explicar curvas de entrenamiento, presupuesto de tokens y sensibilidad al optimizador con un coste computacional minimo.
- Auditoria de memoria de entrenamiento: el dato de 5,0 bytes por parametro del estado del optimizador permite calcular presupuestos de VRAM para entrenamiento distribuido y compararlos con los 8 bytes por parametro de los dos momentos de AdamW en fp32.
- Pruebas de humo (smoke tests) en pipelines de entrenamiento: con 0,1 GB de repositorio, 8 capas y contexto de 256, un ciclo completo de entrenamiento o de evaluacion se puede ejecutar en CPU o en una GPU de gama baja para validar checkpoints, reanudacion, logging y calculo de metricas antes de escalar a modelos mayores.
- Punto de partida para ajuste fino con recursos limitados: al ser un modelo tiny, se puede reentrenar o afinar sobre corpus propios en una unica GPU consumer; hay que asumir que parte de un modelo infraentrenado y que la calidad final dependera del volumen de datos nuevo.
- Analisis de corpus humano frente a generado por IA: al haberse entrenado sobre `browndw/human-ai-parallel-corpus`, se puede usar para estudiar la continuacion de texto en ese dominio concreto, siempre con la cautela de que la perdida de validacion de 4,5165 limita la calidad de las continuaciones.
- Desarrollo de herramientas de seguimiento de entrenamiento: los ficheros de metricas por tramos de 0,1x del dataset sirven como caso de prueba para construir dashboards, alertas de divergencia o sistemas de comparacion de experimentos.
- Demostraciones de inferencia local en cuadernos o aula: el tamano del checkpoint permite cargarlo y ejecutarlo sin acelerador dedicado, lo que simplifica talleres practicos de tokenizacion y decodificacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes o cualquier tarea que requiera contexto largo, instrucciones o varios idiomas, por las limitaciones detalladas mas abajo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 4,5165 |
| Perplejidad equivalente (derivada de la perdida, `e^4,5165`) | ~91,5 |
| BLEU de continuacion final | 1,4561 (escala no especificada en la model card) |
| Presupuesto de tokens de entrenamiento | 39.714.816 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta perdida de validacion y BLEU de continuacion para este modelo, y menciona que existen otros cuatro entrenamientos comparables con la misma semilla, datos y schedule, pero no incluye sus cifras, por lo que no es posible construir una tabla comparativa de optimizadores con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32. El repositorio completo ocupa 0,1 GB e incluye el checkpoint, el tokenizador y los ficheros de metricas, de modo que los pesos estan en ese orden de magnitud.
- Memoria de la cache KV: insignificante con contexto de 256 tokens, 8 capas y `d_model` de 512.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria es suficiente. No se necesita A100, H100 ni similares; una RTX 3060, una T4 o incluso una GTX de gama baja son mas que suficientes.
- Inferencia en CPU: viable, dado el tamano del modelo y la longitud de contexto.
- Despliegue: no hay soporte directo en vLLM, TGI, Ollama ni llama.cpp, porque la arquitectura esta definida en `src/model.py` del repositorio y el unico checkpoint es un pickle de PyTorch (`last.pt`). Para usar esos servidores habria que convertir los pesos a safetensors o GGUF y registrar la arquitectura. La carga prevista por el autor es `torch.load("last.pt", map_location="cpu", weights_only=False)`.
- Entrenamiento: un unico acelerador consumer es suficiente para reproducir un entrenamiento de 39,7 M de tokens con esta configuracion.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito declarado |
|---|---|---|---|---|---|
| `siddarthg44/anlp-a2-p2-muon` | no disponible (cuerpo ~25,2 M mas embeddings de vocabulario no publicado) | 256 | no disponible | HuggingFace, 0 descargas, 0 likes | Artefacto academico para comparar optimizadores |
| GPT-2 small (referencia) | 124 M | 1024 | MIT modificada | Ampliamente disponible | Modelo base de generacion de texto |
| Pythia-70M (referencia) | 70 M | 2048 | Apache 2.0 | Ampliamente disponible | Suite de modelos base para investigacion sobre interpretabilidad |
| SmolLM-135M (referencia) | 135 M | 2048 | Apache 2.0 | Ampliamente disponible | Modelo base pequeno para entornos con recursos limitados |

Los datos de los modelos de referencia corresponden a los valores publicos de sus propias fichas y se incluyen solo para situar la escala; no existe una evaluacion comun que permita comparar rendimiento, porque este modelo no publica benchmarks estandar. La diferencia principal no es de arquitectura sino de proposito y de estado de entrenamiento: los modelos de referencia son artefactos mantenidos y con licencia explicita, mientras que este es un entregable de una asignatura, con 39,7 M de tokens de entrenamiento y sin licencia declarada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribucion. Cualquier uso en produccion requeriria contactar con el autor.
- Modelo base sin ajuste por instrucciones: no hay RLHF, DPO ni plantilla de chat documentados, por lo que no responde a instrucciones ni mantiene formatos de dialogo.
- Infraentrenamiento severo: 39.714.816 tokens es muy inferior a lo que sugeriria la regla de Chinchilla (~20 tokens por parametro) incluso tomando el extremo inferior del rango estimado de parametros, lo que situa el presupuesto en torno a veinte veces por debajo de lo optimo. La perdida de validacion de 4,5165 (perplejidad equivalente ~91,5) es coherente con ese deficit.
- Calidad de generacion muy baja: el BLEU de continuacion final es 1,4561, sin que la model card especifique la escala, lo que en cualquier caso apunta a continuaciones poco coherentes.
- Riesgo alto de alucinacion y de texto incoherente: un modelo de este tamano y con este presupuesto de tokens no es fiable para generar informacion factual.
- Contexto limitado a 256 tokens: no admite conversaciones multi-turno largas, resumen de documentos extensos ni recuperacion aumentada con contexto amplio.
- Solo ingles: no hay capacidades multilingues declaradas, y el castellano no esta soportado de forma explicita.
- Tokenizador propio (`tokenizer.json`): no es compatible con tokenizadores estandar, por lo que no se pueden reutilizar embeddings de otros modelos.
- Seguridad de carga: el checkpoint es un pickle de PyTorch y la model card indica `weights_only=False`, lo que implica que `torch.load` puede ejecutar codigo arbitrario contenido en el fichero. Debe cargarse solo si se confia plenamente en el origen.
- Sesgos no documentados: no hay informacion sobre la composicion, filtrado o sesgos del corpus `browndw/human-ai-parallel-corpus` empleado en el entrenamiento.
- Sin benchmarks estandar ni evaluacion de seguridad: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de toxicidad o sesgo.
- Metadatos pobres: 0 descargas, 0 likes, sin pipeline declarado, sin model card extendida y sin mantenimiento conocido. Las fechas de creacion y actualizacion (2026-09-15, con 20 segundos de diferencia) sugieren una subida unica sin revision posterior.
- No hay garantia de reproducibilidad completa: aunque se fija la semilla, no se documentan el tamano de lote, el numero de pasos ni la totalidad del schedule.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddarthg44/anlp-a2-p2-muon
- Dataset citado en la model card: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con el modelo). La model card tampoco cita papers, repositorios adicionales ni demostraciones.
