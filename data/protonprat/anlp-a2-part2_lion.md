# ProtonPrat/anlp-a2-part2_lion

## Resumen

El modelo `ProtonPrat/anlp-a2-part2_lion` es un transformer causal de arquitectura personalizada entrenado por el usuario ProtonPrat como parte de la asignatura ANLP (Assignment 2). Se trata de un artefacto académico de pequeña escala: 10.084.480 parámetros y 42.307.041 posiciones de entrenamiento consumidas, entrenado con predicción del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`.

Su relevancia no reside en el rendimiento, sino en su valor como material reproducible de investigación: incluye estados de reanudación completos (`final.pt`, `latest.pt`, `best.pt`) y diez hitos de fracción de corpus (`fraction_0.1.pt` a `fraction_1.0.pt`), además de un tokenizador BPE a nivel de byte entrenado solo con el conjunto de entrenamiento. El nombre del checkpoint sugiere el uso del optimizador Lion, aunque la model card no lo confirma de forma explícita para este fichero concreto.

Los resultados publicados son modestos: perplejidad de test de 164,599960 y BLEU de continuación de 0,862204. El propio autor advierte que son resultados de una única semilla, sin barrido de ajuste del optimizador, y que las métricas automáticas de verosimilitud y solapamiento no establecen calidad semántica. No se registra ninguna arquitectura `AutoModel` de la librería Transformers, por lo que su carga requiere el código de la asignatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal personalizado (`custom-architecture`); no registra arquitectura AutoModel de Transformers |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible (no se documenta arquitectura MoE en este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`); checkpoints PyTorch `.pt` (`final.pt`, `latest.pt`, `best.pt`, `fraction_0.1.pt` a `fraction_1.0.pt`) |
| Tamano del repositorio | 1,1 GB |
| Tokenizador | BPE a nivel de byte entrenado solo con el conjunto de entrenamiento (`hf_export/tokenizer.json`) |

## Arquitectura y entrenamiento

La model card describe un transformer causal personalizado, exportado sin registro en el ecosistema `AutoModel` de Transformers. La carga debe hacerse a traves de la clase `src.part1.model.Transformer` del repositorio de la asignatura o mediante `scripts/infer.py`. No se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo de atencion empleado, por lo que esos datos figuran como no disponibles. El autor menciona que las implementaciones de MoE, actualizaciones del optimizador y decodificacion se desarrollaron para la asignatura con asistencia de codigo generado por LLM, aunque no se atribuye una arquitectura MoE a este checkpoint concreto.

El entrenamiento utilizo el dataset `browndw/human-ai-parallel-corpus` en la revision `b514ff64988d9e322fd81c5d70d69a38e78491f5`, con 42.307.041 posiciones consumidas y objetivo de prediccion del siguiente token. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste por instrucciones. Los artefactos publicados incluyen un checkpoint seleccionado por perdida de validacion (`best.pt`), estados de reanudacion completos con optimizador, RNG y cursor del tokenizador (`final.pt`, `latest.pt`) y diez hitos por fraccion de corpus, lo que permite reproducir curvas de aprendizaje y analizar el efecto del volumen de datos.

## Capacidades

- Generacion de texto en ingles mediante continuacion de prompt (el autor indica que los modelos de la Parte 2 aceptan una indicacion de continuacion en ingles).
- Modelado de lenguaje causal para prediccion del siguiente token, adecuado para medir perplejidad y analizar distribuciones de probabilidad.
- Capacidad de traduccion en otros modelos de la misma familia de la asignatura (los modelos de traduccion aceptan `--language vi` o `--language ja`), pero esta funcionalidad no se atribuye a este checkpoint concreto.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de resultados academicos: permite volver a ejecutar el entrenamiento desde los hitos `fraction_0.1.pt` a `fraction_1.0.pt` y verificar las metricas reportadas (perplejidad 164,599960 y BLEU 0,862204) sobre el mismo corpus y revision de dataset.
- Estudio de optimizadores: el nombre del checkpoint apunta al optimizador Lion, de modo que sirve como sujeto de comparacion frente a variantes con AdamW u otros optimizadores en una configuracion controlada de 10 millones de parametros.
- Analisis de tokenizacion BPE: el tokenizador a nivel de byte se entreno solo con el conjunto de entrenamiento, lo que lo convierte en un caso util para estudiar como la cobertura del vocabulario afecta a la tasa de compresion y a la perplejidad.
- Pruebas de integracion de canalizaciones de inferencia: su tamano minimo permite validar el cableado de `scripts/infer.py`, la descarga selectiva mediante `snapshot_download` con `allow_patterns="hf_export/*"` y los formatos de exportacion sin consumir recursos significativos.
- Docencia y aprendizaje de arquitecturas transformer: al ser codigo y pesos abiertos de una asignatura, es material adecuado para que estudiantes inspeccionen un transformer causal completo, desde el tokenizador hasta el bucle de decodificacion.
- Generacion de texto de baja exigencia en local: puede ejecutarse en CPU o en cualquier GPU de consumo para experimentos de continuacion de texto donde la calidad no sea el criterio principal, dado que la perplejidad reportada es elevada.
- Linea base en experimentos de deteccion de texto generado por IA: al ser un modelo pequeno con corpus conocido, resulta util como control negativo en evaluaciones de clasificadores, aunque las cifras de deteccion de terceros no son aplicables a este modelo.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Perplejidad de test | 164,599960 | Test del corpus `browndw/human-ai-parallel-corpus` |
| BLEU de continuacion de test | 0,862204 | Test del corpus `browndw/human-ai-parallel-corpus` |
| Posiciones de entrenamiento consumidas | 42.307.041 | Entrenamiento |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB solo para pesos en precision de 32 bits (10.084.480 parametros), y unos 20 MB en 16 bits. Con activaciones y sobrecarga del framework, la inferencia cabe holgadamente por debajo de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, y tambien en CPU sin dificultad apreciable.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El unico camino indicado por el autor es la clase `src.part1.model.Transformer` del repositorio de la asignatura o el script `scripts/infer.py`, ya que no se registra arquitectura `AutoModel`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Optimizador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part2_lion | 10.084.480 | Transformer causal personalizado | no confirmado (el nombre sugiere Lion) | no disponible | no disponible | HuggingFace, safetensors y `.pt` |
| dnebh/anlp-a2-part2-lion | 33,4 millones (segun el resultado de busqueda) | Transformer decoder-only denso (config 1 de la Parte 1) | Lion desde cero, tasa de aprendizaje 0,0004 | no disponible | no disponible | HuggingFace |
| Adi-AI/anlp-a2-part2-lion | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos comparten la etiqueta `anlp-a2-part2-lion` y proceden del mismo marco de asignatura, por lo que constituyen variantes paralelas del mismo ejercicio. No se dispone de datos de rendimiento comparables publicados para las dos alternativas.

## Limitaciones y advertencias

- Perplejidad de test muy elevada (164,599960), lo que indica una calidad de modelado del lenguaje limitada en terminos absolutos.
- El BLEU de continuacion (0,862204) es una metrica de solapamiento superficial y no implica coherencia ni correccion semantica; el propio autor lo advierte de forma explicita.
- Resultados de una unica semilla y sin barrido de ajuste del optimizador, por lo que la varianza entre ejecuciones no esta caracterizada.
- Sesgos conocidos: no disponibles. El corpus de entrenamiento es `browndw/human-ai-parallel-corpus` y no se documenta ninguna auditoria de sesgos.
- Riesgo de alucinacion: alto en terminos relativos, coherente con la perplejidad reportada y con la ausencia de ajuste por instrucciones o preferencias.
- Limitaciones de idioma: solo se declara ingles; no se garantiza comportamiento alguno en castellano ni en otros idiomas.
- Limitacion de contexto: la longitud de contexto no esta documentada, de modo que no puede planificarse su uso en escenarios de contexto largo.
- Restricciones de licencia: la licencia figura como no disponible, por lo que no puede asumirse permiso para uso comercial sin consultar al autor.
- Integracion en produccion: al no registrar arquitectura `AutoModel`, no es compatible directamente con herramientas estandar como vLLM, TGI o llama.cpp sin trabajo de adaptacion.
- El repositorio ocupa 1,1 GB porque incluye estados de reanudacion completos; la descarga selectiva con `allow_patterns="hf_export/*"` reduce el volumen a los pesos de inferencia, configuracion y tokenizador.
- La model card indica que el codigo del proyecto se desarrollo con asistencia de LLM, lo que conviene tener en cuenta al auditar los metodos numericos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part2_lion
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/h4fdjpml
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio de la asignatura en GitHub: https://github.com/bitmap4/anlp-a2
- Modelo comparable dnebh/anlp-a2-part2-lion: https://huggingface.co/dnebh/anlp-a2-part2-lion
- Modelo comparable Adi-AI/anlp-a2-part2-lion: https://huggingface.co/Adi-AI/anlp-a2-part2-lion
