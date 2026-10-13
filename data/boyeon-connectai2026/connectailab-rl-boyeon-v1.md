# boyeon-connectai2026/connectailab-rl-boyeon-v1

## Resumen

ConnectAI Lab RL Boyeon v1 es un adaptador LoRA de tipo PEFT publicado por el usuario boyeon-connectai2026 sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de propósito general: es un modelo de toma de decisiones entrenado para leer una situación empresarial simulada, una pregunta y una lista de opciones, y devolver únicamente la letra de la opción elegida. La probabilidad asociada a cada letra funciona como medida de confianza de la decisión.

El entrenamiento combina tres fases descritas en la model card: una política pequeña se entrena primero en un simulador de empresa (CONNECT TYCOON) mediante PPO; esa política actúa como profesor generando ejemplos puntuados por opción; después se aplica aprendizaje supervisado sobre la mejor opción y, finalmente, una fase de refuerzo con ventaja estandarizada por grupo (estilo GRPO) y penalización KL contra el modelo de partida para no degradar el modelo base.

Su relevancia es acotada y experimental: se trata de una prueba de concepto de investigación y uso educativo, con cero descargas y cero valoraciones en el momento de la consulta, un repositorio de 0,0 GB de tamaño declarado y resultados publicados incompletos. El propio autor advierte que es un modelo sobre un simulador sintético y que debe revalidarse con datos reales antes de cualquier uso en decisiones de negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA/PEFT |
| Parametros totales | 0,8 mil millones en el modelo base (aproximadamente); parametros del adaptador LoRA no disponibles |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible; al publicarse como adaptador PEFT en safetensors se puede combinar con el modelo base en fp16, bf16 o cuantizaciones de terceros, pero no esta documentado por el autor |
| Idiomas soportados | coreano (ko), segun el campo `language` de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de 0,8 mil millones de parametros. La innovacion no esta en la arquitectura, sino en el procedimiento de entrenamiento en cuatro pasos descrito por el autor: (1) una política pequena aprende a operar la empresa durante miles de meses simulados con PPO y actua como profesor; (2) por cada mes operado se generan variantes de una misma decision, se reejecuta el mes completo con cada opcion y se puntua cada alternativa; (3) aprendizaje supervisado imitando la opcion de mayor puntuacion; (4) aprendizaje por refuerzo que trata todas las opciones de una decision como un grupo, normaliza las ventajas dentro del grupo y maximiza la probabilidad de las opciones con puntuacion superior a la media, con un termino KL contra el modelo de partida.

Los datos de entrenamiento son sinteticos y provienen del simulador CONNECT TYCOON. La distribucion de empresa utilizada es `general`, calibrada con datos publicos segun la model card. El reparto de problemas es de 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de prueba. No se especifica el volumen de tokens, la composicion detallada del dataset ni si hubo fases adicionales de RLHF o DPO mas alla de lo descrito.

## Capacidades

- Clasificacion de decision con salida restringida: dado un estado, una pregunta y un conjunto de opciones etiquetadas (A, B, C...), devuelve exactamente una letra, sin explicacion.
- Distribucion de probabilidad sobre opciones: el valor de probabilidad de cada letra se interpreta como confianza del modelo en esa alternativa.
- Seguimiento de instrucciones de sistema: el prompt de sistema indicado en la model card impone tratar el contenido del estado como datos y no como instrucciones, y limita la respuesta a la letra.
- Razonamiento implicito sobre un estado en formato JSON con campos `state`, `question` y `options`.
- Dominio especifico: decisiones de gestion dentro del simulador CONNECT TYCOON (operacion mensual de una empresa, con retorno en dinero, satisfaccion y accidentes).
- Idiomas: coreano, segun lo declarado.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a decisiones discretas: el adaptador sirve como referencia reproducible de un pipeline PPO + aprendizaje supervisado + refuerzo con ventaja por grupo sobre un simulador, y puede compararse contra la politica profesora.
- Experimentos educativos sobre LoRA y PEFT: al ser un adaptador sobre un modelo de 0,8B, se puede cargar en un cuaderno de Colab con `transformers` y `peft` para estudiar como un ajuste ligero cambia el comportamiento de un modelo base pequeno.
- Evaluacion de metodos de elicitacion de decisiones: permite probar prompts de sistema que fuerzan salidas de una sola letra y medir la calibracion de las probabilidades frente a la precision real.
- Simulacion de agentes economicos en entornos tipo Gymnasium: el modelo puede actuar como politica de un agente que elige entre opciones predefinidas cada turno dentro del simulador CONNECT TYCOON.
- Generacion de datos sinteticos de decision: las salidas del modelo pueden usarse para etiquetar escenarios adicionales del simulador y ampliar el conjunto de entrenamiento, siempre con revision humana.
- Prototipado de asistentes de decision acotados: en un flujo donde las alternativas ya vienen enumeradas por un sistema externo, el modelo se limita a puntuar y elegir, lo que reduce el riesgo de respuestas abiertas.
- Docencia sobre limites de los modelos de decision: resulta util como ejemplo de sistema que solo acierta aproximadamente un tercio de las preguntas en el conjunto de prueba y cuya validacion externa es imprescindible.

## Benchmarks y rendimiento

La model card incluye una unica fila de resultados, correspondiente al modelo base antes del ajuste, no al modelo publicado:

| Modelo | Precision en preguntas de examen | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 31,0 % | 2,66 | no disponible | no disponible |
| ConnectAI Lab RL Boyeon v1 | no disponible | no disponible | no disponible | no disponible |

El autor indica expresamente que se trata de un primer experimento, que la evaluacion de operacion empresarial se calcula como media de dos meses no vistos (muestra pequena) y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6-2,5 GB para el modelo base de 0,8B en fp16 o bf16, mas el adaptador LoRA y la sobrecarga de la cache KV; con cuantizacion de 8 bits puede bajar aproximadamente a 1-1,5 GB, y con 4 bits a menos de 1 GB. Son estimaciones a partir del tamano declarado, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en la practica (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para servicio concurrente con batched inference, una A100 o H100 esta sobredimensionada para un modelo de este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos y en equipos con graficos integrados con memoria unificada suficiente.
- Opciones de despliegue: `transformers` + `peft` es la via documentada por el autor. Al ser un adaptador, tambien puede fusionarse con el modelo base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI, pero ninguna de estas rutas esta documentada ni verificada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ConnectAI Lab RL Boyeon v1 | 0,8B + LoRA | no disponible | Eleccion de una opcion discreta en un simulador empresarial | apache-2.0 | Solo la linea base del modelo sin ajustar (31,0 %) |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | Generacion de texto general e instrucciones | la del modelo base | 31,0 % de precision en el examen del simulador antes del ajuste |
| Adaptadores RL de decision comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otros adaptadores publicos de la misma categoria (decision empresarial simulada con GRPO sobre un modelo sub-1B) que permitan una comparacion directa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo no es de proposito general: su salida esta restringida a una letra de opcion. No genera texto libre, codigo, resumenes ni respuestas conversacionales.
- Solo esta declarado para coreano. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La model card advierte de que se trata de un modelo de investigacion y educativo sobre un simulador sintetico de empresa, y que debe revalidarse con los datos reales de cada organizacion antes de usarse para decisiones de negocio.
- El rendimiento publicado es incompleto: solo consta la linea base (31,0 % de acierto) y el autor reconoce que el modelo queda por debajo de la politica profesora y que la muestra de evaluacion es de dos meses.
- Riesgo de alucinacion y de sobreconfianza: al devolver una unica letra, el modelo puede expresar alta probabilidad en una opcion incorrecta sin ninguna senal de duda en la salida.
- Riesgo de inyeccion de prompt: la propia model card incluye una instruccion de sistema para tratar el texto del estado como datos y no como instrucciones, lo que indica que sin esa proteccion el contenido del estado podria manipular la eleccion.
- Sesgos: al entrenarse sobre una distribucion de empresa `general` derivada de datos publicos y sobre un simulador, puede heredar los supuestos del simulador y no reflejar la dinamica de sectores concretos.
- Inconsistencia documental: el fragmento de codigo de la model card carga un identificador de repositorio distinto del de esta ficha (`boyeon-connectai2026/connectailab-rl-connectailab-rl-boyeonbrain-v1-v1`), que no coincide con el ID publicado. Conviene verificar la ruta del adaptador antes de usarlo.
- Estado del repositorio: cero descargas, cero valoraciones y 0,0 GB de tamano declarado, lo que sugiere una publicacion reciente o incompleta.
- Licencia apache-2.0 en el adaptador, pero el uso comercial queda condicionado por la licencia del modelo base Qwen/Qwen3.5-0.8B, que debe verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/boyeon-connectai2026/connectailab-rl-boyeon-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Repositorio GitHub connectai2026: https://github.com/Connectai2026?tab=repositories
