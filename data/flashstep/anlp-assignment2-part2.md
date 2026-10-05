# flashstep/anlp-assignment2-part2

## Resumen

`flashstep/anlp-assignment2-part2` es un repositorio de Hugging Face que contiene cuatro checkpoints de un mismo modelo entrenado, cada uno producido con un optimizador distinto: AdamW, Lion, Muon y MARS-AdamW. El nombre del repositorio lo vincula a la Parte 2 de la asignatura ANLP (Advanced Natural Language Processing), y todo apunta a que se trata de un artefacto academico de comparacion de optimizadores, no de un modelo destinado a publicacion o uso en produccion.

El repositorio ocupa 0,7 GB y los pesos se distribuyen en formato PyTorch `.pt`, lo que sugiere modelos pequenos (del orden de decenas de millones de parametros si los cuatro checkpoints tienen un tamano similar en precision completa o mixta). La model card no aporta informacion sobre arquitectura, numero de parametros, datos de entrenamiento, tokenizador ni resultados; unicamente lista los cuatro ficheros y remite a un informe externo que no se incluye ni se enlaza en el repositorio.

Su relevancia es, por tanto, limitada y de ambito academico: sirve como material reproducible para estudiar el efecto de distintos optimizadores sobre el mismo preentrenamiento, siempre que el usuario reconstruya por su cuenta la configuracion de entrenamiento, que no esta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (estimacion indirecta: ~0,7 GB para cuatro checkpoints) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en su precision de entrenamiento, sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara ninguna; en ausencia de licencia no se concede permiso de uso comercial) |
| Formato de pesos | PyTorch `.pt` (`part2_adamw.pt`, `part2_lion.pt`, `part2_muon.pt`, `part2_mars.pt`) |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura ni el tokenizador. El unico dato tecnico explicito es que se entrenaron cuatro variantes del mismo modelo cambiando el optimizador: AdamW, Lion, Muon y MARS-AdamW. MARS-AdamW es una variante de AdamW; Lion y Muon son optimizadores mas recientes orientados a reducir el estado interno del optimizador y a mejorar la estabilidad, respectivamente. El hecho de que existan cuatro checkpoints del mismo experimento indica que el objetivo era comparar el efecto del optimizador manteniendo constante el resto del pipeline, pero la configuracion (learning rate, schedule, semillas, tamano de lote, numero de pasos) no se documenta en el repositorio.

Los resultados de busqueda web apuntan a que, en repositorios hermanos de la misma asignatura, la Parte 2 corresponde a preentrenamiento de siguiente token sobre `browndw/human-ai-parallel-corpus` y la Parte 1 a un modelo de mezcla de expertos para traduccion vi/ja a en. Esa informacion procede de terceros y no esta confirmada para este repositorio concreto, por lo que debe tratarse como contexto orientativo y no como especificacion verificada.

## Capacidades

- No hay capacidades documentadas en la model card del repositorio.
- Dado que se trata de un modelo preentrenado (no se menciona ajuste por instrucciones ni alineamiento), lo esperable es que solo realice continuacion de texto y no conversacion instructiva, aunque esto no puede confirmarse sin la configuracion ni el tokenizador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Comparacion controlada de optimizadores: cargar los cuatro checkpoints con la misma semilla de inferencia y medir perplejidad o perdida sobre un conjunto de validacion propio para reproducir el experimento de la asignatura de forma independiente.
- Material docente en cursos de PLN: usar los checkpoints como ejemplo de que el optimizador influye en la convergencia manteniendo arquitectura y datos constantes, en una practica de laboratorio.
- Estudio de estabilidad de entrenamiento: analizar las curvas de perdida y la magnitud de los pesos de cada checkpoint para comparar AdamW, Lion, Muon y MARS-AdamW en un modelo de tamano reducido antes de escalar a modelos mayores.
- Experimentos de ajuste fino: partir de uno de los checkpoints como inicializacion para una tarea concreta, siempre que se reconstruya primero el tokenizador y la arquitectura exactos.
- Pruebas de infraestructura y pipelines de evaluacion: al ser un modelo pequeno, resulta util para validar herramientas de carga de pesos, scripts de evaluacion o integraciones con librerias de inferencia antes de usarlas con modelos grandes.
- Analisis de robustez ante descuidos de seguridad: los `.pt` de PyTorch pueden deserializarse con `pickle`, por lo que el repositorio sirve como caso practico para estudiar el riesgo de cargar checkpoints de origen no verificado y las alternativas con `weights_only=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite a un informe externo ("See the accompanying report for experimental details and results") que no esta incluido en el repositorio ni enlazado en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision, al desconocerse el numero de parametros. Como referencia, un repositorio de 0,7 GB con cuatro checkpoints implica del orden de 175 MB por checkpoint, lo que situa el modelo en la escala de decenas de millones de parametros y, por tanto, en el rango de menos de 1 GB de VRAM en precision completa.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente para un modelo de ese orden de tamano.
- Compatibilidad con GPU consumer: muy probablemente si, dado el tamano del repositorio, aunque no puede confirmarse sin las especificaciones reales.
- Opciones de despliegue: no se documenta ninguna. vLLM y TGI requieren una arquitectura compatible con Hugging Face `transformers` y pesos en safetensors; llama.cpp y Ollama requieren conversion previa a GGUF. Ninguna de estas rutas esta garantizada con los ficheros `.pt` entregados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existe una comparativa fiable, porque no se conocen los parametros, el contexto ni el rendimiento de este modelo. Como referencia de categoria, se listan artefactos equivalentes de la misma asignatura encontrados en la busqueda, todos con el mismo problema de documentacion incompleta:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flashstep/anlp-assignment2-part2 | no disponible | no disponible | no disponible | no disponible | Repositorio publico, 0 descargas |
| Rakshitagg06/anlp-assignment2 | no disponible | no disponible | no disponible | no disponible | Repositorio publico; parte 1 MoE vi/ja a en, parte 2 optimizadores |
| Devatri/anlp-assignment2-part1-model2 | no disponible | no disponible | no disponible | no disponible | Repositorio publico, parte 1 |

No procede comparar con modelos de produccion (Llama, Qwen, Mistral, Gemma) porque el proposito, el tamano y el nivel de documentacion son de orden completamente distinto.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: sin arquitectura, tokenizador ni configuracion de entrenamiento, los checkpoints no son utilizables directamente sin ingenieria inversa o acceso al informe original.
- Licencia no declarada: la ausencia de licencia implica que no se concede permiso de uso, redistribucion ni explotacion comercial. No debe usarse en produccion.
- Riesgo de deserializacion insegura: los ficheros `.pt` pueden contener objetos `pickle` arbitrarios. Cargar checkpoints de origen no verificado es un riesgo de ejecucion de codigo; se recomienda `torch.load(..., weights_only=True)` y auditar el contenido antes de usarlos.
- Riesgo de alucinacion: no evaluado, pero en un modelo preentrenado sin alineamiento es esperable un comportamiento generativo sin filtros y con alta propension a producir texto incoherente o factualmente incorrecto.
- Sesgos: no documentados. El corpus de entrenamiento es desconocido, por lo que no puede evaluarse el sesgo demografico, cultural o linguistico.
- Limitaciones de contexto e idioma: no disponibles.
- Ausencia de garantia de reproducibilidad: sin hiperparametros, semillas ni version de las librerias, los resultados del informe no pueden replicarse con exactitud.
- Idoneidad: es un artefacto academico, no un modelo listo para produccion. Cualquier uso mas alla de la docencia o la investigacion metodologica sobre optimizadores debe descartarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flashstep/anlp-assignment2-part2
- Repositorio hermano (Parte 1 y Parte 2 de la misma asignatura): https://huggingface.co/Rakshitagg06/anlp-assignment2
- Repositorio hermano (Parte 1, modelo 2): https://huggingface.co/Devatri/anlp-assignment2-part1-model2
- Asignatura 11-711 ANLP (CMU, primavera 2024), materiales de la asignacion 2: https://github.com/mbrukman/neubig-cmu-cs-11-711-anlp-spring2024-nlp-from-scratch-assignment-2
- Enunciado de la asignacion 2 (ANLP, Universidad de Edimburgo, 2023): https://git.ecdf.ed.ac.uk/anlp/course_materials/-/blob/main/2023/assignments/assignment2/assignment2_tasks.pdf
- Especializacion de PLN de deeplearning.ai (asignaciones de referencia): https://github.com/amanchadha/coursera-natural-language-processing-specialization
