# arcticoneai/xspark-X2.6-math

## Resumen

xspark-X2.6-math es un ajuste fino experimental del modelo Spark-X2.6-4B (XHToken) publicado por arcticoneai, orientado especificamente a razonamiento matematico y formalizacion en Lean 4. Se distribuye como un LoRA de rango 16 fusionado en los pesos BF16 del modelo base, por lo que no requiere cargar un adaptador separado. El checkpoint completo ocupa 8,2 GB en el repositorio y cuenta con 4.112.079.360 parametros.

El modelo resuelve el problema de elevar el rendimiento matematico de un modelo pequeno sin depender de un modo de razonamiento explicito ni de un harness de agentes. Segun la model card, pasa del 50 % de acierto en AIME del modelo base al 90 % en una muestra interna de 50 preguntas, ambos sin razonamiento habilitado. Ademas, el autor reporta la generacion de terminos de prueba en Lean 4 para dos teoremas de teoria de grupos relacionados con rigidez de Connes.

Es relevante ahora porque combina dos tendencias activas: la destilacion de razonamiento en modelos de 4B y el uso de asistentes para matematicas formalizadas. No obstante, las cifras son autoinformadas, la evaluacion no es un leaderboard auditado y la licencia es "other", lo que exige revision legal antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Spark-X2.6-4B; detalles no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el repo ocupa 8,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (LoRA rango 16 fusionado en BF16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Spark-X2.6-4B, un transformer decoder-only de 4B parametros cuya arquitectura interna no se detalla en la informacion disponible. Sobre esa base se aplico un LoRA de rango 16 que posteriormente se fusiono en los pesos BF16, de modo que el artefacto distribuido es un modelo completo y no un adaptador. El entrenamiento consistio en destilacion de razonamiento de profesor a partir de ocho prompts especializados, segun la model card.

La innovacion principal no esta en la arquitectura sino en el procedimiento de adaptacion: se busca mejorar el razonamiento matematico sin activar un modo de pensamiento extendido en inferencia. El autor tambien reporta que el modelo produjo terminos de prueba en Lean 4 para dos declaraciones de teoremas sobre grupos finitamente generados, ICC y con propiedad (T) cuyos factores de von Neumann traciales son isomorfos. La model card advierte que el extracto de Lean incluye resultados citados como `paper_factors_isomorphic` y `suslinRelativeElementaryGeneration`, por lo que no se demuestra que el modelo descubriera de forma independiente todos los prerrequisitos profundos; se requiere el proyecto Lean completo y una auditoria de la cadena de dependencias.

## Capacidades

- Generacion de texto y razonamiento matematico, con enfasis en problemas de competicion tipo AIME.
- Razonamiento algebraico y de teoria de grupos a nivel de construccion de argumentos.
- Formalizacion en Lean 4: generacion de terminos de prueba para declaraciones de teoremas.
- Destilacion de cadenas de razonamiento de un profesor, integrada en los pesos.
- Uso previsto con el formato de prompt de pensamiento/razonamiento del modelo base Spark-X2.6.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible; la evaluacion reportada se hizo sin harness.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Resolucion de problemas de competicion matematica: el modelo esta ajustado para atacar problemas tipo AIME sin necesidad de activar un modo de razonamiento, lo que reduce latencia y coste por consulta en comparacion con pipelines de thinking extendido.
- Generacion de borradores de pruebas en Lean 4: puede proponer terminos de prueba para declaraciones de teoremas, utiles como punto de partida que un matematico revisa y completa dentro de un proyecto Lean.
- Asistencia a investigadores en teoria de grupos: ayuda a ensamblar construcciones con productos semidirectos, acciones duales e invariantes de cardinalidad, como en el ejemplo de los grupos con propiedad (T) e ICC.
- Preprocesamiento de formalizaciones: dado un enunciado informal, generar una primera version formal que luego se valida con el compilador de Lean y se corrige iterativamente.
- Tutorizacion matematica avanzada: explicacion paso a paso de problemas de algebra y teoria de grupos para estudiantes de posgrado, con la salvedad de verificar cada paso.
- Evaluacion comparativa de destilacion: servir como referencia de cuanto mejora un LoRA de rango 16 con destilacion sobre una base de 4B en tareas de matematicas, para experimentos de investigacion sobre adaptacion eficiente.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B en BF16, cabe en una unica GPU de 24 GB y permite iteracion rapida en laboratorio.

## Benchmarks y rendimiento

| Modelo / evaluacion | AIME (precision) | Razonamiento | Notas |
|---|---:|---|---|
| Spark-X2.6-4B (base) | 50 % | Deshabilitado | Baseline reportado por el autor |
| xspark-X2.6-math | 90 % | Deshabilitado | Muestra interna de 50 preguntas |

La mejora reportada es de +40 puntos porcentuales, es decir, 1,8 veces la precision del base. Se trata de una comparacion autoinformada por el proyecto, no de un envio auditado a un leaderboard, y no se aportan los registros por pregunta ni el script de evaluacion reproducible. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 14 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5 a 3 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues concurrentes; RTX 4090 (24 GB) y L40S para inferencia en BF16 con margen.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y previsiblemente en RTX 4080/4070 Ti Super con cuantizacion; en GPUs de 8 GB solo con cuantizacion agresiva y contexto corto.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible, y su compatibilidad depende del codigo personalizado del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xspark-X2.6-math | 4,1B | no disponible | Matematicas y Lean 4 via LoRA fusionado | other | Hugging Face, 0 descargas |
| Spark-X2.6-4B (base) | 4B | no disponible | Modelo generalista de partida | no disponible | Hugging Face (XHToken) |
| Alternativas de 4B especializadas en matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada, por lo que la comparativa se limita al modelo base y no se pueden contrastar cifras con otros modelos de la misma categoria.

## Limitaciones y advertencias

- El 90 % en AIME proviene de una muestra interna de 50 preguntas sin harness ni razonamiento habilitado; no es un resultado de leaderboard auditado ni reproducible con los datos publicados.
- No se aportan registros por pregunta ni script de evaluacion, lo que impide verificar la cifra de forma independiente.
- El resultado en Lean 4 se apoya en lemas y resultados citados en el extracto; la card reconoce que no se demuestra que el modelo descubriera todos los prerrequisitos profundos.
- Riesgo de alucinacion en pruebas formales: un termino de prueba generado debe compilarse y auditarse antes de aceptarse.
- Sesgos conocidos: no disponibles; al ser un ajuste sobre un modelo base no documentado, los sesgos heredados no estan caracterizados.
- Idiomas soportados: no disponibles; el ajuste se centro en matematicas y probablemente degrada capacidades generales o conversacionales fuera de ese dominio.
- Licencia "other": requiere revision legal explicita antes de uso comercial, redistribucion o despliegue en producto.
- Requiere `trust_remote_code=True` y el formato de prompt de razonamiento del modelo base; un uso incorrecto del formato puede degradar gravemente la calidad.
- Modelo experimental con 0 descargas y 2 likes en el momento de la ficha: sin validacion de la comunidad ni soporte de mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/arcticoneai/xspark-X2.6-math
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
