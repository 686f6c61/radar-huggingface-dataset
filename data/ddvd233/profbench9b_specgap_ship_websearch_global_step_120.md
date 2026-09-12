# ddvd233/profbench9b_specgap_ship_websearch_global_step_120

## Resumen

El modelo `ddvd233/profbench9b_specgap_ship_websearch_global_step_120` es un artefacto de investigacion publicado en HuggingFace por el usuario `ddvd233`. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-9B`, con 9.409.813.744 parametros totales, obtenido mediante el framework `verl` con entrenamiento FSDP y volcado posterior a pesos bf16 en formato safetensors. Forma parte del experimento denominado RRIMed (recompensas auto-evolutivas), en su rama de validacion retenida sobre ProfBench (ARM 20).

El problema que aborda es la mejora del razonamiento medico evaluado mediante rubricas, con una configuracion en la que el modelo solo dispone de busqueda web, sin base de conocimiento de dominio. En la evaluacion reportada por el autor alcanza una precision de rubrica de 0.392 sobre 40 tareas, frente a 0.356 del modelo sin entrenar, y un mejor resultado de 0.405 en el paso 170 que no se conservo por rotacion de checkpoints.

Su relevancia es acotada y estrictamente investigadora: se publica como artefacto de investigacion entrenado con tareas generadas por el propio modelo y evaluado en una unica familia de benchmarks. El autor indica explicitamente que no es apto para uso clinico. No se especifican en la informacion disponible la longitud de contexto, los idiomas soportados ni el detalle de la arquitectura interna del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Qwen/Qwen3.5-9B; no se detalla en la informacion proporcionada) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; se publican unicamente pesos en bf16 (la cuantizacion a int8/int4 requeriria conversion externa) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de entrenamiento | aprendizaje por refuerzo (RL) con verl, checkpoint FSDP fusionado |
| Dominio declarado | medical |
| Fecha de publicacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se proporciona detalle tecnico sobre la arquitectura interna del modelo (tipo de atencion, numero de capas, dimension oculta, uso de atencion lineal o decodificacion especulativa). Lo unico documentado es el modelo base, `Qwen/Qwen3.5-9B`, del que este artefacto hereda la topologia, y el hecho de que los pesos publicados son el resultado de fusionar un checkpoint de entrenamiento FSDP de `verl` correspondiente al paso global 120 de la ejecucion `profbench9b_specgap_ship_websearch`.

El entrenamiento se enmarca en el experimento RRIMed, basado en recompensas auto-evolutivas (self-evolving rewards), en una rama retenida sobre ProfBench (ARM 20). El modelo se entreno sobre tareas escritas por el propio modelo y se evaluo en una unica familia de benchmarks. La configuracion declarada es de busqueda web unicamente, sin base de conocimiento de dominio, lo que implica que el modelo debe resolver las tareas apoyandose en recuperacion externa en lugar de conocimiento parametrico especializado. No se indican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en el dominio medico, orientado a la resolucion de tareas evaluadas mediante rubricas.
- Uso de busqueda web como unica fuente de conocimiento externa; el autor indica explicitamente que no incorpora base de conocimiento de dominio.
- Ajuste mediante aprendizaje por refuerzo sobre recompensas auto-evolutivas, lo que sugiere capacidad para seguir cadenas de razonamiento multi-paso dentro del marco de evaluacion ProfBench.
- Herencia de las capacidades generales del modelo base Qwen/Qwen3.5-9B; no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del flujo de busqueda web: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo con recompensas auto-evolutivas: sirve como punto de partida reproducible para estudiar como evolucionan las recompensas generadas por el propio modelo en tareas medicas, dado que se publica el paso global 120 y la puntuacion asociada.
- Reproduccion y comparacion de checkpoints: al existir una referencia explicita de paso (120) frente al mejor paso de validacion (170) y una linea base sin entrenar (0.356), permite analizar la degradacion o mejora entre pasos y el efecto de la rotacion de checkpoints.
- Evaluacion de pipelines de busqueda web en dominios especializados: el modelo esta configurado sin base de conocimiento, por lo que resulta util para medir cuanto de una tarea medica se resuelve solo con recuperacion web frente a conocimiento parametrico.
- Generacion sintetica de tareas medicas: dado que el entrenamiento uso tareas escritas por el modelo, el checkpoint puede emplearse para estudiar la calidad y diversidad de tareas generadas automaticamente y su utilidad como senal de entrenamiento.
- Base para ajuste posterior en investigacion academica: la licencia apache-2.0 y el formato safetensors permiten partir de estos pesos para experimentos de fine-tuning adicionales, siempre fuera de entornos clinicos.
- Analisis de sensibilidad de rubricas: la metrica principal es la precision de rubrica sobre 40 tareas, de modo que el modelo es adecuado para estudiar como distintas formulaciones de rubrica afectan a la puntuacion de un mismo generador.
- Estudio de alucinacion en dominios medicos: al carecer de base de conocimiento de dominio, es un caso util para medir la tasa de afirmaciones no respaldadas cuando el modelo depende exclusivamente de busqueda web.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ProfBench (40 tareas) | Precision de rubrica | 0.392 |
| ProfBench (40 tareas), mejor paso de la ejecucion (paso 170) | Precision de rubrica | 0.405 |
| ProfBench (40 tareas), modelo sin entrenar (linea base) | Precision de rubrica | 0.356 |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 18,8 GB en bf16 (9,41 B de parametros a 2 bytes), coherente con el tamano del repositorio (18,8 GB). En int8 serian aproximadamente 9,4 GB y en int4 aproximadamente 4,7-5,5 GB, en ambos casos tras una conversion externa, ya que el repositorio solo publica bf16.
- VRAM total con cache KV y activaciones: superior a la cifra de pesos; la cantidad exacta depende de la longitud de contexto efectiva, que no esta documentada, por lo que no puede estimarse con precision.
- GPU recomendadas: para bf16, GPU de 24 GB o mas (RTX 4090, RTX 3090, A5000, L40S) permiten servir el modelo con contexto corto; para contexto amplio o mayor concurrencia son preferibles A100 40/80 GB, H100 o H200.
- Cabe en GPU de consumo: si, en bf16 cabe en tarjetas de 24 GB con margen limitado para cache KV; en tarjetas de 8-16 GB requeriria cuantizacion a int8 o int4 previa.
- Opciones de despliegue: vLLM, SGLang y TGI pueden cargar directamente los safetensors bf16. llama.cpp y Ollama requieren convertir los pesos a GGUF, conversion no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / disponibilidad | Rendimiento reportado |
|---|---|---|---|---|---|
| ddvd233/profbench9b_specgap_ship_websearch_global_step_120 | 9,41 B | no disponible | apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes | ProfBench rubrica 0.392 |
| Qwen/Qwen3.5-9B (modelo base sin ajustar) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo base publico | No disponible (la linea base de 0.356 corresponde al modelo sin entrenar en este experimento) |
| Otros ajustes medicos por RL sobre modelos de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria mas alla del modelo base declarado.

## Limitaciones y advertencias

- Aviso explicito del autor: no apto para uso clinico. Es un artefacto de investigacion, no un producto sanitario ni una herramienta de decision medica.
- Tareas generadas por el propio modelo: el entrenamiento se realizo sobre tareas escritas por el propio modelo, lo que puede introducir sesgos de auto-confirmacion y limitar la generalizacion a distribuciones reales de casos clinicos.
- Evaluacion limitada: los resultados se miden en una unica familia de benchmarks (ProfBench) y sobre 40 tareas, una muestra pequena que implica alta varianza en las cifras de precision.
- Sin base de conocimiento de dominio: el modelo depende exclusivamente de busqueda web; cuando la busqueda falla o devuelve informacion incorrecta, el riesgo de alucinacion aumenta, especialmente en un dominio donde los errores tienen consecuencias graves.
- Revisiones y paso del checkpoint: el checkpoint publicado (paso 120) no es el de mejor validacion de la ejecucion (paso 170), que se perdio por rotacion; el rendimiento desplegado es por tanto inferior al mejor observado.
- Idiomas soportados no documentados: no puede garantizarse un comportamiento correcto fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no documentada: dificulta planificar el consumo de memoria y el rendimiento en conversaciones largas o documentos extensos.
- Cuantizaciones no disponibles: no se publican variantes GGUF ni cuantizadas, de modo que el despliegue en hardware de gama baja exige trabajo de conversion y validacion previos.
- Licencia apache-2.0 para los pesos de este repositorio, pero el uso comercial queda sujeto, ademas, a las condiciones del modelo base Qwen/Qwen3.5-9B y a la naturaleza no clinica del artefacto.
- Cero adopcion registrada (0 descargas, 0 likes): no hay evidencia externa de validacion independiente ni informes de terceros.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo demografico, etnico o de genero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/profbench9b_specgap_ship_websearch_global_step_120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo del autor: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre el experimento RRIMed; los enlaces recuperados correspondian a contenido no relacionado (codigos de un videojuego) y se descartan por no ser pertinentes.
