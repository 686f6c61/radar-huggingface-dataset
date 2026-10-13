# litzor/connectailab-rl-litzor-v1

## Resumen

`litzor/connectailab-rl-litzor-v1` es un adaptador LoRA de decisión entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B`. Su función es estrictamente acotada: recibe una situación, una pregunta y una lista de opciones etiquetadas, y devuelve una única letra correspondiente a la opción elegida. No es un modelo conversacional ni de generación abierta, sino un modelo de política para toma de decisiones discretas dentro del simulador de empresa CONNECT TYCOON.

El desarrollo corre a cargo de litzor (CONNECT AI LAB, en colaboración con AI CITY BUILDERS) y emplea una cadena de entrenamiento en cuatro fases: primero se entrena una política pequeña con PPO en el simulador que actúa como profesor, después se genera un conjunto de problemas evaluando cada opción de una decisión mediante simulaciones completas, a continuación se aplica aprendizaje supervisado imitando la mejor opción y, por último, un ajuste con GRPO que aumenta la probabilidad de las opciones con puntuación superior a la media, con normalización por grupo y una penalización KL respecto al modelo de partida.

Es relevante como ejemplo reproducible y ligero de cómo convertir un modelo de lenguaje pequeño (en torno a 0,8 mil millones de parámetros) en un agente de decisión mediante aprendizaje por refuerzo aplicado sobre datos sintéticos de un simulador. El autor advierte que se trata de un modelo de investigación y educativo, no validado para decisiones empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA; no MoE segun la informacion disponible |
| Parametros totales | base de 0,8B (aproximadamente) mas adaptador LoRA de tamano no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en la informacion proporcionada; los pesos se distribuyen en safetensors (adaptador PEFT/LoRA) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3.5-0.8B`, por lo que hereda la arquitectura transformer del base y solo modifica una parte de sus pesos. La tarea está formateada como entrada JSON con los campos `state`, `question` y `options` (cada opción con `label`, `key` y `description`), y la salida esperada es una única letra entre las etiquetas disponibles. Un mensaje de sistema fijo instruye al modelo a tratar el texto del estado como datos y no como instrucciones, a seleccionar exactamente una opción de la lista y a devolver únicamente su letra, sin explicación. El repositorio del autor ocupa 0,0 GB, coherente con un adaptador de bajo rango.

El entrenamiento consta de cuatro etapas descritas por el autor: (1) una política pequeña se entrena con PPO dentro del simulador durante miles de meses simulados y actúa como profesor; (2) se construye un conjunto de problemas reevaluando cada decisión, sustituyendo la opción elegida y volviendo a simular el mes completo para asignar una puntuación a cada alternativa; (3) aprendizaje supervisado imitando la opción con mayor puntuación; y (4) aprendizaje por refuerzo con GRPO, tratando el conjunto de opciones como un grupo, normalizando por grupo las ventajas y añadiendo una penalización KL respecto al modelo de partida. El conjunto de datos indicado por el autor contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de test, con una distribución de empresa de tipo `general` (ajustada a datos públicos).

## Capacidades

- Selección de una opción entre varias: dado un estado, una pregunta y una lista de alternativas etiquetadas, devuelve la letra de la opción elegida.
- Estimación de preferencia por opción: la probabilidad asignada a cada letra funciona como probabilidad de selección, y el valor máximo actúa como medida de confianza.
- Toma de decisiones secuenciales de gestión empresarial dentro del dominio del simulador CONNECT TYCOON (mes a mes).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso fuera del bucle del simulador.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para coreano.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Experimentación académica en aprendizaje por refuerzo: sirve como caso de estudio completo de una cadena PPO, aprendizaje supervisado y GRPO sobre un modelo pequeño, con conjunto de datos y métricas reproducibles.
- Investigación en decisiones discretas con LLM: permite estudiar cómo un modelo de lenguaje pequeño se adapta a una tarea de elección única con formato de salida restringido (una sola letra).
- Simulación de políticas de gestión en entornos tipo gymnasium: se puede integrar como política dentro del simulador CONNECT TYCOON para comparar su comportamiento frente a la política profesora entrenada con PPO.
- Docencia y formación en IA local: al tratarse de un adaptador sobre un modelo de 0,8B, puede ejecutarse en equipos modestos y usarse en cursos de refuerzo, tal como propone el autor con su cuaderno de Colab.
- Evaluación de técnicas de alineación y estabilidad de entrenamiento: la penalización KL respecto al modelo base y la normalización por grupo son elementos útiles para comparar variantes de GRPO en tareas de decisión.
- Generación de datos sintéticos etiquetados: el pipeline de reevaluación de opciones puede reutilizarse para producir pares estado-opción-puntuación en otros dominios simulados.
- Prototipado de asistentes de decisión por elección múltiple: en escenarios donde la salida debe ser una etiqueta y no texto libre, el formato de entrada y salida del modelo puede adaptarse a cuestionarios estructurados.
- Replicación de experimentos con modelos pequeños: útil para medir cuánto se puede mejorar un modelo base de menos de mil millones de parámetros mediante datos de simulación, dado que el autor reporta una subida del 29,5 % al 71,4 % de acierto.

## Benchmarks y rendimiento

El autor publica los siguientes resultados en el conjunto de test (840 problemas), comparando el modelo base sin entrenar, la fase de aprendizaje supervisado y la fase de refuerzo. El coste se mide como arrepentimiento (regret, cuanto menor mejor) y el rendimiento económico como beneficio mensual medio en el simulador.

| Modelo | Precision en test | Arrepentimiento (menor mejor) | Beneficio mensual en simulador | Transacciones de tarjeta reales (reduccion de perdidas) |
|---|---|---|---|---|
| Qwen sin entrenar | 29,5 % | 2,68 | no disponible | no disponible |
| Aprendizaje supervisado | 71,0 % | 2,08 | no disponible | no disponible |
| Aprendizaje por refuerzo (versión final) | 71,4 % | 2,15 | 4,12 millones de wones | 37 % (91/177) |

El propio autor indica que se trata de un primer experimento, que la evaluación de gestión empresarial corresponde a una media de dos meses no vistos (muestra pequena) y que el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano del base, 0,8B; son estimaciones, no datos publicados): en fp16 en torno a 1,6 GB; en int8 en torno a 0,8 GB; en cuantizacion de 4 bits en torno a 0,4-0,5 GB, mas el espacio de activaciones y la sobrecarga del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 3060); para cuantizacion de 4 bits basta con GPUs integradas o de gama baja con 2-4 GB.
- Cabe en GPU de consumo: si, al estar sobre un base de 0,8B. Tambien es viable en CPU con llama.cpp/Ollama tras fusionar y convertir el adaptador.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), fusion del adaptador en el base y posterior uso con vLLM, TGI, llama.cpp u Ollama. El repositorio solo contiene el adaptador, por lo que estos ultimos requieren un paso previo de merge y conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos directamente comparables de toma de decisiones discretas sobre simuladores de empresa. La referencia mas cercana disponible es el propio modelo base sin entrenar, que el autor evalua en el mismo conjunto de test.

| Modelo | Parametros | Contexto | Precision en test (mismo conjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-litzor-v1 | 0,8B (base) + LoRA | no disponible | 71,4 % | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B (base sin entrenar) | 0,8B | no disponible | 29,5 % | no disponible | HuggingFace |
| Politica profesora PPO (no publicada) | no disponible | no disponible | no disponible (el autor indica que supera al modelo) | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: el entrenamiento se realiza sobre un simulador con distribución de empresa de tipo `general`, por lo que las decisiones pueden no trasladarse a empresas con caracteristicas distintas a las del conjunto de entrenamiento.
- Riesgo de alucinacion: al devolver solo una letra, el fallo tipico no es texto inventado, sino la seleccion de una etiqueta no valida o incorrecta; el formato de salida debe validarse en produccion.
- Seguridad frente a inyeccion de instrucciones: el autor incluye en el mensaje de sistema la instruccion de tratar el contenido de `state` como datos, lo que indica que existe riesgo de que el texto de entrada contenga instrucciones maliciosas.
- Limitaciones de idioma: el modelo esta etiquetado unicamente para coreano; no hay evidencia de funcionamiento correcto en castellano u otros idiomas.
- Dominio muy restringido: el modelo no es un asistente general; solo resuelve tareas de eleccion entre opciones con el formato especificado.
- Tamano de evaluacion reducido: las metricas de gestion empresarial proceden de una media de dos meses no vistos, con muestra pequena segun el propio autor.
- Licencia: apache-2.0 permite uso comercial, pero el autor advierte explicitamente que es un modelo de investigacion y educacion y que debe revalidarse con los datos reales de cada empresa antes de usarlo en decisiones de negocio.
- Despliegue: al ser un adaptador PEFT, requiere el modelo base `Qwen/Qwen3.5-0.8B` y no es utilizable de forma autonoma sin el.
- Estado de madurez: se trata de un primer experimento (v1), por debajo de la politica profesora del simulador y con cero descargas y cero valoraciones en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litzor/connectailab-rl-litzor-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab (entrenamiento del modelo de decision): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
