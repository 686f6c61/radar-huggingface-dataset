# siddarthg44/anlp-a2-p2-sophia

## Resumen

`siddarthg44/anlp-a2-p2-sophia` es un modelo de lenguaje denso, de tipo transformer decoder-only, publicado como artefacto academico del "Assignment 2" de la asignatura ANLP (Advanced Natural Language Processing). No es un modelo preentrenado de proposito general ni un derivado de una familia conocida: es una implementacion propia entrenada desde cero sobre el corpus `browndw/human-ai-parallel-corpus`, con el objetivo de comparar reglas de actualizacion de optimizadores. En concreto, esta variante usa una implementacion desde cero del optimizador **sophia**, subclasificando unicamente `torch.optim.Optimizer`.

La configuracion es muy pequena: `d_model` de 512, 8 capas, 8 cabezas de atencion y una longitud de contexto de tan solo 256 tokens. El presupuesto de entrenamiento es de 39.714.816 tokens, con una tasa de aprendizaje pico de 1e-4 y un estado de optimizador de 8 bytes por parametro (dos estados en float32, coherente con la estimacion diagonal de segundo orden que usa Sophia). El resultado reportado por el autor es una perdida de validacion final de 5,7798 y un BLEU de continuacion de 0,9083.

Su relevancia es exclusivamente metodologica y educativa: sirve como punto de comparacion reproducible frente a otros cuatro optimizadores que comparten semilla, orden de datos, forma del schedule y presupuesto de tokens. No esta pensado para despliegue en produccion, no tiene licencia declarada y no se ha evaluado con benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K), por lo que debe tratarse como material de investigacion en optimizadores, no como un modelo utilizable en aplicaciones reales de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, implementacion propia (sin pesos preentrenados) |
| Parametros totales | No disponible en la model card. Estimacion derivada de la configuracion (`d_model`=512, 8 capas, MLP 4x): ~25 M en el cuerpo + embeddings, en el rango de 40-60 M segun tamano de vocabulario y atado de embeddings |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible. Solo se publica checkpoint en float32; no hay versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `last.pt` (checkpoint PyTorch serializado con pickle, requiere `weights_only=False`), mas `tokenizer.json`, `summary.json` y `history.json` |
| Dimension del modelo (`d_model`) | 512 |
| Capas / cabezas | 8 / 8 (dimension de cabeza 64) |
| Presupuesto de tokens de entrenamiento | 39.714.816 |
| Tasa de aprendizaje pico | 0,0001 |
| Estado del optimizador | 8,0 bytes por parametro |
| Perplejidad de validacion | ~324 (derivada de exp(5,7798); no reportada directamente por el autor) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso escrito desde cero, sin reutilizar ninguna arquitectura preentrenada. La configuracion declarada es `d_model` = 512, 8 capas y 8 cabezas de atencion, con una ventana de contexto de 256 tokens. El checkpoint `last.pt` incluye tanto los pesos como el diccionario de configuracion, y se carga construyendo el modelo con `build_model(TransformerConfig.from_dict(state["config"]))` desde `src/model.py`. El repositorio ocupa 0,1 GB, lo que es coherente con un modelo de decenas de millones de parametros en precision completa.

El entrenamiento usa el corpus `browndw/human-ai-parallel-corpus` con una unica regla de actualizacion: el optimizador **sophia**, reimplementado desde cero subclasificando solo `torch.optim.Optimizer`. Sophia es un metodo de segundo orden con recorte (clipping) que mantiene una estimacion diagonal de la matriz hessiana y aplica la actualizacion solo cuando la magnitud de la direccion supera un umbral, lo que explica el estado de 8 bytes por parametro (dos tensores float32: momento de primer orden y estimacion de curvatura). El autor indica que las cinco variantes comparadas comparten semilla identica, orden de datos, forma del schedule y presupuesto de tokens; solo cambian la regla de actualizacion y su tasa de aprendizaje pico. No se menciona uso de RLHF, DPO, SFT posterior ni ninguna tecnica de alineacion, y no hay decodificacion especulativa ni atencion lineal: es atencion estandar sobre un contexto muy corto.

## Capacidades

- Generacion de texto en ingles: el modelo produce continuaciones de texto, con un BLEU de continuacion reportado de 0,9083 sobre la tarea de evaluacion del assignment.
- Modelado de lenguaje autorregresivo: entrenado con objetivo de next-token prediction sobre un corpus paralelo humano-IA.
- Continuacion de secuencias cortas: la ventana de 256 tokens limita la generacion coherente a pasajes breves.
- Optimizacion con Sophia: el artefacto principal es la implementacion funcional del optimizador, no una capacidad de lenguaje general.
- Reproducibilidad experimental: incluye `summary.json` con metricas cada 0,1x del dataset e `history.json` con el historial de entrenamiento, lo que permite reproducir curvas de aprendizaje.
- Sin tool calling: no hay soporte de function calling ni de plantillas de herramientas.
- Sin capacidades de agente: no hay entrenamiento en razonamiento multi-paso ni en uso de herramientas.
- Sin vision ni audio: modelo exclusivamente de texto.
- Sin modo "thinking" ni razonamiento explicito: no se ha aplicado ningun entrenamiento de razonamiento.
- Multilingue: no. Solo ingles.

## Casos de uso

- Reproduccion academica de comparativas de optimizadores: el modelo es una de las cinco ejecuciones con identico presupuesto de tokens y semilla, por lo que sirve para aislar el efecto de Sophia frente a Adam, AdamW y similares sobre la misma arquitectura y datos.
- Docencia de implementaciones desde cero: el codigo de `src/model.py` y la subclase de `torch.optim.Optimizer` permiten estudiar como se implementa un optimizador de segundo orden sin depender de librerias externas.
- Verificacion de pipelines de entrenamiento: al publicar `summary.json` con metricas cada 0,1x del dataset, se puede usar como referencia para comprobar que un pipeline propio reproduce la misma curva de perdida.
- Generacion de continuaciones cortas en ingles: para demostraciones de autocompletado limitadas a fragmentos de menos de 256 tokens, como ejercicios de clase o notebooks interactivos.
- Analisis del corpus `human-ai-parallel-corpus`: permite inspeccionar que estilo y estructura aprende un modelo pequeno entrenado exclusivamente sobre texto paralelo humano-IA.
- Punto de partida para experimentos de ajuste fino: al ser un checkpoint PyTorch estandar con configuracion embebida, se puede cargar y reentrenar en tareas de investigacion con presupuestos pequenos.
- Prueba de concepto de inferencia en CPU: con un modelo de decenas de millones de parametros, la generacion en CPU es viable para demos sin GPU, aunque la calidad del texto sera limitada.
- Estudio de degradacion con contexto corto: util como caso extremo para medir cuanto cae la coherencia cuando la ventana es de 256 tokens frente a modelos con 2.048 o mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible. Las unicas metricas reportadas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 5,7798 |
| Perplejidad de validacion derivada | ~324 |
| BLEU de continuacion final | 0,9083 |
| Presupuesto de tokens | 39.714.816 |
| Tasa de aprendizaje pico | 0,0001 |

No se proporcionan comparaciones numericas con otros modelos en la informacion disponible. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB. Con un modelo estimado de 40-60 M de parametros en float32, los pesos ocupan aproximadamente entre 160 y 240 MB, mas el cache de activaciones de una ventana de 256 tokens, que es despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Funciona en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100 sin ninguna optimizacion.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos ocho anos e incluso en GPUs integradas.
- CPU: la inferencia en CPU es perfectamente viable para uso interactivo, dado el tamano del modelo.
- Opciones de despliegue: el checkpoint `last.pt` requiere cargarse con PyTorch y el codigo propio del repositorio (`build_model`). No hay integracion publicada con vLLM, llama.cpp, Ollama, Text Generation Inference ni transformers, y no existe version GGUF, por lo que desplegarlo en esos servidores exigiria convertir los pesos y portar la definicion del modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota de seguridad: el checkpoint usa serializacion pickle y la instruccion del autor es cargarlo con `weights_only=False`, lo que implica ejecucion de codigo arbitrario si el fichero no es de confianza. En un entorno de produccion esto es un riesgo relevante.

## Comparativa con modelos similares

No hay benchmarks publicados de este modelo que permitan una comparacion cuantitativa de rendimiento. La tabla compara solo caracteristicas estructurales con alternativas de tamano similar de dominio publico.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `siddarthg44/anlp-a2-p2-sophia` | No disponible (estimado 40-60 M) | 256 | No disponible | Checkpoint `.pt` propio, requiere codigo del repo |
| GPT-2 small | 124 M | 1.024 | MIT modificada | Pesos en safetensors y compatible con transformers |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | Pesos en safetensors, transformers, multiples checkpoints |
| OPT-125M | 125 M | 2.048 | MIT | Pesos en safetensors y compatible con transformers |

La diferencia clave no es el rendimiento, que no se puede comparar con los datos disponibles, sino el proposito: los tres modelos de la comparativa son modelos preentrenados de uso general con benchmarks publicados, mientras que este artefacto es una ejecucion experimental de asignatura centrada en la regla de actualizacion del optimizador.

## Limitaciones y advertencias

- Sesgos: no se ha realizado ninguna evaluacion de sesgos ni de toxicidad, y no se han aplicado tecnicas de alineacion (RLHF, DPO). El modelo reproduce los sesgos presentes en `browndw/human-ai-parallel-corpus` sin filtro conocido.
- Alucinacion: con una perdida de validacion de 5,7798 (perplejidad aproximada de 324), el modelo tiene una capacidad predictiva limitada y generara texto incoherente o factualmente incorrecto con frecuencia. No debe usarse para responder preguntas ni para generar informacion verificable.
- Contexto: 256 tokens es una ventana extremadamente corta. No admite conversaciones multi-turno, documentos largos ni resumenes extensos.
- Idioma: solo ingles. No hay soporte para castellano ni para ningun otro idioma.
- Licencia: no declarada. La ausencia de licencia implica que no hay autorizacion explicita de uso comercial y que los derechos de uso no estan clarificados; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Riesgo de seguridad al cargar: el checkpoint es un pickle que el propio autor indica cargar con `weights_only=False`. Cargar ficheros pickle de origen no confiable permite ejecucion de codigo arbitrario.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna evaluacion estandar, por lo que no se puede situar su capacidad frente a otros modelos.
- Naturaleza academica: es la parte 2 de un assignment. No ha pasado revision por pares y no hay garantia de mantenimiento, soporte ni correccion de errores.
- El BLEU de continuacion de 0,9083 no debe interpretarse como calidad general de generacion: es una metrica especifica de la tarea de continuacion definida en el assignment, y no es comparable con BLEU de traduccion o de generacion abierta.
- Sin cuantizaciones publicadas: no existen versiones GGUF, GPTQ o AWQ, lo que complica el despliegue en stacks de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddarthg44/anlp-a2-p2-sophia
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Documentacion de `torch.optim.Optimizer`: https://pytorch.org/docs/stable/optim.html
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de WhatsApp Web sin relacion con el artefacto). No se han encontrado paper, blog, repositorio adicional ni demo asociados.
