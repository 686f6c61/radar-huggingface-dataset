# CNCL-Penn-State/ORACL-Glimmer-30B

## Resumen

ORACL-Glimmer-30B es un adaptador LoRA (librería PEFT) publicado por CNCL-Penn-State que convierte el modelo base Muse-Glimmer-30B en un sistema de puntuación de creatividad. No es un modelo generativo: dado un enunciado de tarea y una respuesta, devuelve una puntuación continua en una escala nominal de 10 a 50, y el autor indica explícitamente que los valores no se recortan a ese rango. El repositorio, de 0,4 GB, contiene el adaptador y la cabeza de puntuación, no los pesos completos del modelo base de 30B.

El modelo se ha ajustado sobre una versión expandida del dataset MuCE, publicada como CNCL-Penn-State/MuCE-ORACL-Glimmer. La etiqueta multimodal del repositorio y el propio README indican que cubre dos modalidades: texto creativo y dibujos. Para las entradas de dibujo, el autor exige proporcionar tanto la imagen de partida como la imagen de respuesta, lo que implica que el ajuste se realizó sobre pares de imágenes y no sobre imágenes aisladas.

Su relevancia práctica está en la evaluación automática de creatividad, un campo donde la evaluación humana es costosa y poco reproducible. El uso se realiza mediante la clase GlimmerScorer del fichero scoring.py incluido en el repositorio, con un entorno CUDA y NF4 probado por el autor. Como contrapartida, la ficha no declara licencia, ni idiomas, ni resultados de benchmarks, y el repositorio acumula cero descargas, por lo que se trata de un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el transformer Muse-Glimmer-30B; el autor no detalla la arquitectura interna del modelo base) |
| Parametros totales | no disponible (el modelo base tiene 30B; no se especifica el numero de parametros del adaptador ni de la cabeza de puntuacion) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion NF4 (4 bits) en el setup probado por el autor (CUDA + NF4, ver requirements-tested.txt); no se listan otros formatos |
| Idiomas soportados | no disponible (el unico ejemplo documentado de instruccion esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | meta-models/Muse-Glimmer-30B (relacion: adapter) |
| Tipo de adaptador | LoRA mas cabeza de puntuacion |
| Tarea | puntuacion de creatividad de texto y dibujos |
| Formato de salida | puntuacion continua en escala nominal 10-50, sin recorte |
| Dataset de ajuste | CNCL-Penn-State/MuCE-ORACL-Glimmer (MuCE expandido) |
| Tamano del repositorio | 0,4 GB |
| Libreria | peft |
| Fecha de creacion del repositorio | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible describe un ajuste por adaptacion de bajo rango (LoRA) sobre Muse-Glimmer-30B, mas una cabeza de puntuacion separada que transforma la representacion del modelo en una puntuacion escalar. No se publican detalles sobre el numero de capas adaptadas, el rango de la descomposicion LoRA, el optimizador, la tasa de aprendizaje ni el numero de pasos de entrenamiento. El autor tampoco indica si el entrenamiento fue supervisado de forma pura o si hubo etapas de RLHF o DPO; no hay ninguna mencion a estas tecnicas en la model card.

El dato de entrenamiento mas concreto es el dataset: una version expandida de MuCE, publicada de forma independiente por el mismo grupo. El README precisa que las entradas de dibujo requieren la imagen original y la imagen de respuesta, lo que sugiere un formato de pares para la parte visual. El repositorio incluye requirements-tested.txt con un entorno CUDA y cuantizacion NF4 verificado, lo que indica que el autor probo la inferencia en 4 bits al menos en ese entorno, aunque no se documenta si el ajuste se realizo con esa misma cuantizacion.

La innovacion principal no es arquitectonica, sino de planteamiento: en lugar de generar texto, el modelo emite puntuaciones continuas no recortadas, lo que permite usarlo como aproximacion a un evaluador humano de creatividad en lugar de como generador. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni mecanicas de razonamiento explicito.

## Capacidades

- Puntuacion de creatividad de texto: recibe una instruccion completa y una respuesta, y devuelve una puntuacion continua en la escala nominal 10-50.
- Puntuacion de dibujos: capacidad multimodal; requiere la imagen de partida y la imagen de respuesta como entradas conjuntas.
- Salida continua sin recorte: los valores pueden salir del rango nominal 10-50, segun advierte el autor, por lo que el consumidor debe aplicar sus propios umbrales.
- Evaluacion de originalidad y adecuacion a la tarea: el ejemplo documentado puntua un uso alternativo de un objeto ("usar un ladrillo para sujetar una manta de picnic"), una tarea clasica de creatividad verbal.
- No es un modelo generativo: no produce texto ni imagenes, solo puntuaciones, por lo que no puede utilizarse como chatbot ni como generador.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible; el unico ejemplo publicado esta en ingles.
- Modo de razonamiento explicito (thinking mode): no disponible, no documentado.
- Capacidades de audio o video: no disponibles, no documentadas.

## Casos de uso

- Evaluacion automatica de tareas de creatividad en investigacion: el modelo puntua respuestas a consignas abiertas (por ejemplo, usos alternativos de un objeto) y permite sustituir parte del jurado humano en estudios con cientos o miles de respuestas, reduciendo coste y aumentando la reproducibilidad de la medida.
- Seleccion best-of-N en generacion creativa: ante N respuestas generadas por un LLM para una misma consigna, se puntuan todas con GlimmerScorer y se devuelve la de mayor puntuacion; es un patron habitual en generacion de eslóganes, nombres o relatos cortos.
- Modelo de recompensa para ajuste fino: las puntuaciones continuas pueden alimentar un pipeline de RLHF o DPO orientado a creatividad en lugar de a correccion factual, algo poco cubierto por los modelos de recompensa habituales centrados en ayuda e inocuidad.
- Evaluacion de modelos de difusion para dibujo: dado un boceto o imagen inicial y la imagen final generada, el modelo produce una puntuacion de creatividad de la respuesta visual, util para comparar checkpoints o prompts de un mismo sistema generativo.
- Filtrado de candidatos en plataformas de contenido creativo: en un flujo donde se reciben propuestas de usuarios o de modelos, la puntuacion sirve como criterio de preordenacion antes de la revision humana, priorizando las propuestas mas originales.
- Auditoria de diversidad creativa de un sistema generativo: ejecutando el scorer sobre un lote fijo de consignas se puede medir si un cambio de modelo, prompt o temperatura aumenta o reduce la creatividad media de las salidas.
- Analisis comparativo en educacion: en actividades de escritura creativa o dibujo, el scorer puede aportar una medida cuantitativa adicional junto a la rubrica del docente, siempre con supervision humana dado que no hay validacion externa del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas, comparaciones con otros evaluadores de creatividad ni correlaciones con juicios humanos. El unico artefacto de evaluacion asociado es el dataset CNCL-Penn-State/MuCE-ORACL-Glimmer, del que no se detallan estadisticas ni particiones en la informacion proporcionada. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (30B) y no estan declaradas por el autor; deben tomarse como orientativas.

- Peso del adaptador: 0,4 GB en el repositorio, que se suma al modelo base que debe descargarse aparte.
- Inferencia en 4 bits (NF4): aproximadamente 15-18 GB de VRAM para los pesos del modelo base mas overhead de activaciones y cache KV; es el unico setup explicitamente probado por el autor (CUDA + NF4).
- Inferencia en 8 bits: del orden de 30 GB de VRAM mas overhead.
- Inferencia en FP16/BF16: del orden de 60 GB de VRAM solo para pesos, lo que exige GPU de 80 GB o reparto en varias GPU.
- GPU consumer: con cuantizacion NF4 el modelo base de 30B es plausible en una RTX 3090 o RTX 4090 de 24 GB, con margen ajustado y contexto limitado; en 8 bits no cabe en GPU consumer de gama alta convencional.
- GPU de datacenter: A100 40 GB o L40S 48 GB para 8 bits; A100 80 GB o H100 80 GB para precision completa.
- Opciones de despliegue: el autor proporciona scoring.py y requirements-tested.txt; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un adaptador PEFT, es tecnicamente cargable con transformers + peft, pero las rutas de serving con LoRA (por ejemplo vLLM) no estan verificadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores de puntuacion de creatividad comparables en los datos proporcionados. La unica referencia contrastable es el propio modelo base.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ORACL-Glimmer-30B | adaptador LoRA + cabeza de puntuacion sobre Muse-Glimmer-30B | 30B (modelo base); adaptador no cuantificado en la ficha | no disponible | no disponible (sin benchmarks publicados) | no disponible | HuggingFace, 0 descargas, 0 likes, repo de 0,4 GB |
| Muse-Glimmer-30B | modelo base referenciado | 30B | no disponible | no disponible | no disponible | referenciado como meta-models/Muse-Glimmer-30B, sin datos en la informacion disponible |
| Otros evaluadores de creatividad | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia en la ficha genera incertidumbre legal para cualquier uso comercial o redistribution; conviene contactar con el autor antes de integrarlo en produccion.
- No es un modelo generativo: no puede emplearse para conversar, redactar ni generar imagenes; su unica funcion es puntuar.
- Escala no acotada: el autor advierte que los valores no se recortan, por lo que pueden aparecer puntuaciones fuera del rango nominal 10-50; cualquier umbral de decision debe calibrarse sobre datos propios.
- Riesgo de puntuaciones inconsistentes: al no existir benchmarks ni correlacion con juicios humanos publicados, se desconoce la fiabilidad del scorer ante entradas fuera de distribucion; en un modelo de puntuacion el fallo tipico no es la alucinacion de texto, sino la emision de una puntuacion no justificada.
- Sesgos: no se documenta ningun analisis de sesgo, ni sobre el dataset MuCE expandido ni sobre las puntuaciones resultantes; se desconoce si el scorer favorece estilos, longitudes o registros concretos.
- Idiomas: no se declaran idiomas soportados y el unico ejemplo publicado esta en ingles, por lo que el comportamiento en castellano no esta verificado.
- Dependencia de codigo propietario: la puntuacion solo es reproducible a traves de scoring.py y del preprocesado que implementa; no se documenta el formato exacto de entrada mas alla del ejemplo, lo que dificulta reimplementarlo en otro stack.
- Restriccion de formato en dibujos: la parte visual exige dos imagenes (inicial y respuesta), de modo que no sirve para puntuar imagenes sueltas.
- Madurez muy baja: 0 descargas, 0 likes, sin paper asociado, sin benchmarks y con una fecha de creacion inusual (2026-09-24); no hay evidencia de uso o validacion por parte de terceros.
- Trazabilidad limitada: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, solo contenido no relacionado, por lo que no existe documentacion externa que complemente la model card.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/CNCL-Penn-State/ORACL-Glimmer-30B
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de ajuste MuCE-ORACL-Glimmer: https://huggingface.co/datasets/CNCL-Penn-State/MuCE-ORACL-Glimmer
- Organizacion del autor: https://huggingface.co/CNCL-Penn-State
- Paper o blog tecnico: no disponible
- Demo: no disponible
- Repositorio de codigo adicional: no disponible (el propio repo incluye scoring.py y requirements-tested.txt)
