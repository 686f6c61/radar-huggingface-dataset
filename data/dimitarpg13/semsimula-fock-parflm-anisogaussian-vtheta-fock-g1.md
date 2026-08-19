# dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-fock-g1

## Resumen

Fock-G1 es una ablación de primer orden (gradient flow puro) del modelo Fock-PARFLM v2.1 con potencial gaussiano anisotrópico multi-contexto condicionado por profundidad, desarrollado por dimitarpg13 dentro del framework Semantic Simulation. Se trata de un modelo de lenguaje conservador basado en mecánica lagrangiana y teoría de campos, que prescinde por completo de la arquitectura transformer y de la atención, logrando inferencia con memoria constante. Con 26,6 millones de parámetros, fue entrenado exclusivamente sobre el corpus TinyStories (historias infantiles en inglés) y alcanza una perplexidad de validación de 8,95, ligeramente inferior a la del ancla de segundo orden (9,04) con la misma arquitectura, datos y presupuesto de entrenamiento.

La relevancia de este modelo reside en su naturaleza experimental: explora si un integrador de primer orden puede igualar o superar a uno de segundo orden (velocity-Verlet) en un régimen de entrenamiento pequeño y controlado, y si la forma del potencial aprendido es indistinguible entre ambos. Los resultados sugieren que, a esta escala y corpus, la diferencia es mínima, aunque los autores advierten que esta conclusión no se generaliza automáticamente a otros corpus o escalas. El modelo se enmarca en una línea de investigación que busca alternativas a los transformers basadas en principios físicos, con potencial interpretable y gradientes analíticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (Property-Attractive-Repulsive Force Language Model) con potencial escalar gaussiano anisotrópico multi-contexto condicionado por profundidad, acoplamiento Fock (16 registros virtuales, disciplina LIFO, canal inverso opcional), integrador de primer orden (gradient flow). Sin atención, no transformer. |
| Parametros totales | 26,6 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (no se especifica si safetensors o bin) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia PARFLM, que modela la evolucion de los estados ocultos como un flujo gradiente sobre un potencial escalar V_theta (mezcla de pozos cuadraticos gaussianos anisotropicos) y un potencial pairwise V_phi. La capa de actualizacion es `h_new = LN(h + beta*f)`, donde `f` es la fuerza derivada del potencial. A diferencia del ancla de segundo orden, que usa un integrador velocity-Verlet con memoria de velocidad `delta = h - h_prev`, esta variante fuerza `delta = 0` en cada capa, colapsando la dinamica a un paso de gradiente puro. El acoplamiento Fock introduce un pool de 16 registros virtuales con puertas de creacion estructuradas Q/K/V y disciplina de pila LIFO, que actuan como memoria externa sin atencion.

El entrenamiento se realizo sobre TinyStories (split de validacion para evaluacion) con una semilla fija, presupuesto e hiperparametros identicos al ancla de segundo orden. Desde el paso 0 se activo `prefix_causal_registers=True`, lo que elimina la fuga causal que afecto a versiones anteriores de la familia. Las pruebas de perturbacion futura y las comprobaciones de perplexidad honesta pasan limpiamente durante todo el entrenamiento, segun los autores. No se aplicaron tecnicas de RLHF ni DPO; el objetivo fue minimizar la entropia cruzada.

## Capacidades

- Generacion de texto en ingles, limitada al dominio de historias infantiles (TinyStories).
- Modelo conservador basado en energia: el potencial escalar y pairwise son interpretables y tienen gradiente analitico.
- Inferencia con memoria constante: al no usar atencion, el coste de memoria no crece con la longitud de la secuencia.
- Soporte de registros virtuales Fock (16 registros, LIFO) que actuan como memoria de trabajo estructurada.
- Capacidad de ablacion controlada: permite estudiar el efecto del orden de integracion en la dinamica de capas.
- No dispone de tool calling, vision, audio ni capacidades multimodales.
- No se ha demostrado capacidad de razonamiento complejo ni de codigo; su tamano y corpus limitan estas habilidades.

## Casos de uso

- Investigacion en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas para estudiar modelos basados en energia, mecanica lagrangiana y memoria constante, especialmente en regimenes pequenos.
- Analisis de dinamica de capas y potenciales aprendidos: al ser interpretable, permite inspeccionar la curvatura del potencial, la anisotropia de los pozos y la entropia de las mezclas, util para entender como se organiza la representacion interna.
- Experimentos de ablacion de orden de integracion: comparar este checkpoint con el ancla de segundo orden permite aislar el efecto del termino inercial en la calidad del modelo y en la forma del potencial.
- Generacion de texto en dominios restringidos: puede usarse para producir historias cortas en ingles con un estilo simple, aunque su calidad es limitada frente a modelos genericos.
- Educacion e investigacion reproducible: al ser un modelo pequeno con codigo abierto y documentacion detallada, es adecuado para ensenar conceptos de modelos basados en energia y para replicar experimentos.
- Validacion de tecnicas de prevencion de fuga causal: este checkpoint se entreno sin fuga desde el inicio, por lo que puede usarse como referencia para auditar metodologias de entrenamiento en modelos con registros.

## Benchmarks y rendimiento

El unico resultado publicado es la perplexidad de validacion sobre TinyStories, declarada por el autor y no verificada de forma independiente.

| Modelo | Perplexidad (TinyStories validation) | Notas |
|---|---|---|
| Fock-G1 (este modelo, primer orden) | 8,95 | Declarado por el autor, no verificado |
| Ancla de segundo orden (sibling) | 9,04 | Declarado por el autor, no verificado |
| Fock-PARFLM base (v2.1) | 9,30 | Segun la pagina del modelo base, no verificado |

No se dispone de resultados en MMLU, HumanEval, GSM8K u otros benchmarks estandar. El modelo no ha sido evaluado en tareas de razonamiento, codigo o matematicas.

## Requisitos de hardware

- VRAM estimada: con 26,6 millones de parametros en FP32, el peso ocupa aproximadamente 106 MB. Con overhead de activaciones y registros, cabe en cualquier GPU con al menos 1 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060, etc.).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia y entrenamiento.
- No se han publicado datos de latencia ni throughput. Al ser un modelo sin atencion, la inferencia es secuencial y de memoria constante, pero no se conocen cifras concretas.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, no es compatible directamente con vLLM, Ollama o TGI. Requiere cargar el codigo del repositorio y ejecutar la inferencia manualmente. No se proporcionan contenedores ni APIs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexidad (TinyStories) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fock-G1 (este modelo) | 26,6 M | No disponible | 8,95 | CC-BY-4.0 | HuggingFace |
| Ancla de segundo orden (sibling) | 26,6 M | No disponible | 9,04 | CC-BY-4.0 | HuggingFace |
| Fock-PARFLM base (v2.1) | No disponible | No disponible | 9,30 | CC-BY-4.0 | HuggingFace |

La comparativa se limita a la familia Fock-PARFLM porque no se dispone de datos de modelos externos comparables (p. ej., GPT-2 pequeño o Pythia) en las mismas condiciones. La diferencia principal entre los tres es el integrador (primer orden, segundo orden y la variante base sin condicionamiento de profundidad), no el tamano ni el corpus.

## Limitaciones y advertencias

- Entrenado exclusivamente en TinyStories, un corpus pequeno y limitado a historias infantiles en ingles. No generaliza a otros dominios ni idiomas.
- Tamano reducido (26,6 M de parametros): no es adecuado para tareas complejas de razonamiento, generacion de codigo o comprension lectora avanzada.
- Riesgo de alucinacion y de incoherencia en textos largos, comun en modelos de esta escala.
- No validado en corpus mayores (OpenWebText pendiente). Los resultados de TinyStories no se extrapolan a otros regimenes.
- Historial de fuga causal en la familia Fock-PARFLM: un documento de auditoria del repositorio GitHub reporta que la perplexidad de un checkpoint anterior estaba inflada ~33x por una fuga a traves del canal inverso. Este modelo afirma haber sido entrenado sin fuga desde el paso 0, pero la verificacion independiente no esta disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se ofrecen garantias de rendimiento ni soporte.
- No se proporcionan cuantizaciones oficiales ni formatos optimizados para produccion (GGUF, ONNX, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-fock-g1
- Ancla de segundo orden (sibling): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta
- Modelo base Fock-PARFLM: https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Repositorio del paper (GitHub): https://github.com/dimitarpg13/semsimula-paper
- Paper (DOI): https://doi.org/10.5281/zenodo.19712427
- Auditoria de fuga causal (nota del repositorio): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Causal_Leak_Audit_Results.md
