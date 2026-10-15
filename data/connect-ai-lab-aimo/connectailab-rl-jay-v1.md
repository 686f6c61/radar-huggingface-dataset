# connect-ai-lab-aimo/connectailab-rl-jay-v1

## Resumen

connectailab-rl-jay-v1 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B y publicado por el usuario connect-ai-lab-aimo. No es un modelo de lenguaje generalista: está entrenado específicamente como política de decisión para el simulador de gestión empresarial Connect Tycoon, donde debe leer un estado (situación, pregunta y opciones) y devolver un único carácter de opción sin explicación. El problema que resuelve es el de tomar decisiones discretas de negocio dentro de ese entorno simulado, con salida estrictamente restringida a una letra.

La relevancia del modelo es metodológica más que de producto: documenta un ciclo completo de aprendizaje por refuerzo aplicado a un modelo pequeño (0,8B parámetros) con LoRA, usando PPO para entrenar una política maestra, aprendizaje supervisado sobre las mejores opciones y, finalmente, optimización con GRPO con normalización de ventajas por grupo y término KL respecto al modelo de partida. Es un ejemplo de investigación y divulgación, no un artefacto listo para producción.

El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB (únicamente pesos del adaptador). Está etiquetado para coreano (ko) y licencia Apache 2.0. El propio autor advierte que los resultados son de un primer experimento, con una muestra pequeña (media de dos meses no vistos) y que el modelo todavía queda por debajo de la política maestra entrenada con PPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA (no se especifica la arquitectura interna del base en la informacion disponible) |
| Parametros totales | Modelo base de 0,8B; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible como tal; el adaptador se distribuye en safetensors y se combina con el base en el formato de cuantizacion que se elija para este |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros, y se ajusta mediante LoRA, es decir, inyectando matrices de bajo rango en lugar de reentrenar todos los pesos. El resultado es un adaptador ligero que se carga sobre el base con `PeftModel.from_pretrained`. No se detallan en la informacion disponible el rango del adaptador, las capas afectadas ni la composicion exacta del corpus mas alla de su origen sintetico.

El entrenamiento sigue cuatro fases descritas por el autor: primero, una politica pequena se entrena con PPO dentro del simulador durante miles de meses simulados y actua como profesora. Segundo, se construye un conjunto de problemas reejecutando cada mes simulado con opciones alteradas para puntuar cada alternativa. Tercero, aprendizaje supervisado imitando la opcion de mayor puntuacion. Cuarto, refuerzo con GRPO, agrupando todas las opciones, elevando la probabilidad de las que superan la media del grupo mediante normalizacion de ventajas y anadiendo una penalizacion KL contra el modelo de partida. El conjunto de datos del dominio `general` consta de 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de prueba.

## Capacidades

- Clasificacion de decisiones discretas: recibe un estado, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve una unica letra.
- Estimacion de confianza implicita: al tratarse de un modelo de lenguaje, las probabilidades del siguiente token permiten leer la distribucion de probabilidad sobre cada opcion.
- Ejecucion con instruccion de sistema fija que obliga a tratar el texto del estado como datos y no como instrucciones, y a no emitir explicaciones.
- Integracion con simuladores tipo Gymnasium a traves del bucle estado-decision-recompensa del entorno Connect Tycoon.
- Entrenamiento y despliegue mediante PEFT/LoRA sobre un base pequeno, lo que facilita reproducir el experimento en hardware modesto.
- Idioma: coreano. No hay evidencia de capacidades multilingues ni de tool calling, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a LLM: sirve como caso de estudio reproducible del ciclo PPO, SFT y GRPO sobre un adaptador LoRA, con codigo de entrenamiento en un cuaderno de Colab.
- Docencia y divulgacion: el autor lo enmarca explicitamente como modelo educativo para cursos de refuerzo, util para ilustrar la construccion de conjuntos de datos por reevaluacion de opciones.
- Simulacion de decisiones empresariales en Connect Tycoon: el modelo puede operar como agente que elige, mes a mes, la accion de gestion propuesta por el simulador.
- Evaluacion comparativa de agentes de decision: al devolver una letra y no texto libre, se integra con facilidad en arneses de evaluacion automatica que miden tasa de acierto y arrepentimiento.
- Prueba de concepto de agentes economicos de bajo coste: un modelo de 0,8B con adaptador permite experimentar bucles de decision completos sin GPU de gama alta.
- Base para ajuste ulterior por dominio: partiendo del adaptador, se puede continuar el entrenamiento con datos reales de una empresa concreta antes de cualquier uso serio, tal como recomienda el propio autor.
- Generacion de trazas sinteticas de decision: las salidas pueden registrarse para construir nuevos conjuntos de datos de entrenamiento o de analisis de politicas.
- Validacion de pipelines de RLHF/GRPO: el repositorio permite comprobar el funcionamiento de tecnicas de normalizacion de ventajas por grupo en un entorno controlado y pequeno.

## Benchmarks y rendimiento

Los unicos datos publicados son los del autor en la model card, sobre el dominio `general` del simulador. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

| Modelo | Precision en prueba | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Aprendizaje supervisado | 86,2% | 2,01 | No disponible | No disponible |
| Aprendizaje por refuerzo (este modelo) | 86,4% | 2,00 | -1,4 millones de wones | 37% (91/177) |

El autor indica que la evaluacion se hizo sobre una media de dos meses no vistos, que la muestra es pequena y que la politica profesora entrenada con PPO sigue por encima de este adaptador.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,0 GB, por lo que el coste de almacenamiento es minimo; el consumo real depende del modelo base de 0,8B.
- VRAM estimada para el base en precision de 16 bits: en torno a 1,5-2 GB de pesos, mas cache KV y activaciones. Cifras orientativas, no publicadas por el autor.
- VRAM estimada con cuantizacion de 4 bits: del orden de 0,6-1 GB de pesos, sin contar el sobrecoste de contexto.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien es viable en CPU para inferencia por lotes pequenos.
- Para entrenamiento del adaptador LoRA, una GPU unica de consumo con 8-12 GB es suficiente en configuraciones habituales.
- Opciones de despliegue: transformers junto con peft es la via natural; tambien son viables llama.cpp, Ollama o vLLM si se fusiona el adaptador con el base y se convierte al formato correspondiente. No hay datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos. La alternativa mas inmediata es el propio modelo base sin ajustar y la politica profesora entrenada con PPO mencionada por el autor.

| Alternativa | Parametros | Contexto | Precision en prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1 | 0,8B (base) + LoRA | No disponible | 86,4% | Apache 2.0 | Publicado en HuggingFace |
| Qwen/Qwen3.5-0.8B (base sin ajustar) | 0,8B | No disponible | No disponible | No disponible | Modelo base referenciado |
| Politica profesora PPO | No disponible | No disponible | No disponible (el autor indica que supera al adaptador) | No disponible | No disponible |

No se conocen otros adaptadores publicos de la misma categoria (decision discreta en simulador empresarial) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion: el autor advierte explicitamente que debe revalidarse con datos reales antes de usarse en decisiones de gestion.
- Muestra de evaluacion muy reducida (dos meses no vistos), por lo que la diferencia entre 86,2% y 86,4% de acierto no es concluyente.
- Rendimiento inferior a la politica profesora entrenada con PPO, segun el propio autor.
- Beneficio mensual negativo en el simulador (-1,4 millones de wones) para el modelo de refuerzo.
- Salida restringida a una letra, lo que impide auditar el razonamiento del modelo y dificulta la deteccion de fallos.
- Entrenado sobre un simulador sintetico; la transferencia a entornos reales no esta demostrada.
- Idioma coreano como unico idioma declarado; no hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinacion en el sentido de seleccionar una opcion inexistente o malformada si la entrada se sale del formato previsto.
- Sesgos potenciales derivados de los datos del simulador y del dominio `general`, no caracterizados por el autor.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende tambien de las condiciones del modelo base Qwen/Qwen3.5-0.8B, no detalladas aqui.
- Modelo con 0 descargas y 0 likes: no hay validacion independiente por parte de la comunidad.
- La instruccion de sistema pide tratar el estado como datos y no como instrucciones, lo que indica exposicion conocida a inyeccion de prompt si el contenido del estado es no confiable.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-jay-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon en GitHub: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI City Builders: https://www.aicitybuilders.com
- Curso de refuerzo de AI City Builders: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
