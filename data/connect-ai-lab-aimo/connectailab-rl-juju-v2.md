# connect-ai-lab-aimo/connectailab-rl-juju-v2

## Resumen

connectailab-rl-juju-v2 es un adaptador LoRA de tipo PEFT publicado por connect-ai-lab-aimo sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de proposito general: es un modelo de toma de decisiones empresariales dentro del simulador CONNECT TYCOON. Recibe como entrada un estado de empresa, una pregunta y una lista de opciones etiquetadas (A, B, C...), y devuelve unicamente la letra de la opcion elegida, sin explicacion. La probabilidad asociada a cada letra funciona como medida de confianza de la decision.

El modelo se entrena en cuatro fases encadenadas: una politica pequena aprende a operar la empresa en el simulador mediante PPO y actua como profesor; con sus partidas se genera un conjunto de problemas recalculando cada mes al variar una opcion; despues se aplica aprendizaje supervisado sobre la opcion de mayor puntuacion; y finalmente aprendizaje por refuerzo con normalizacion por grupo y penalizacion KL respecto al modelo de partida (GRPO sobre el adaptador). El conjunto de datos declarado contiene 4.082 problemas de entrenamiento, 832 de validacion y 840 de test.

Su relevancia es acotada y de caracter investigador: es un caso practico de como aplicar RL con recompensa procedente de un simulador a un modelo de menos de mil millones de parametros, y de como publicar el resultado como adaptador ligero en lugar de un checkpoint completo. El propio autor lo presenta como primer experimento, con resultados todavia por debajo de la politica profesora, y lo etiqueta como modelo de investigacion y educacion, no para decisiones empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only heredada de Qwen/Qwen3.5-0.8B, mas adaptador LoRA entrenado sobre ella (arquitectura interna del base: no disponible en la informacion proporcionada) |
| Parametros totales | 800 millones aprox. (0,8B) en el modelo base; el repositorio contiene solo el adaptador LoRA (tamano del repo: 0,0 GB, desglose no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan cuantizaciones propias del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, library_name: peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, por lo que la arquitectura efectiva es la del modelo base mas las matrices de bajo rango inyectadas. La informacion disponible no detalla cuantas capas se adaptan, el rango de LoRA ni los hiperparametros del entrenamiento, y tampoco describe la arquitectura interna del base (atencion, tipo de normalizacion, context window). El pipeline declarado en HuggingFace es reinforcement-learning y las etiquetas incluyen deep-reinforcement-learning, grpo, decision-making y gymnasium, lo que confirma que el entrenamiento se integra con un entorno tipo Gymnasium encapsulado en el simulador CONNECT TYCOON.

El procedimiento de entrenamiento tiene cuatro etapas documentadas por el autor. Primero, una politica pequena aprende a operar la empresa durante miles de meses simulados mediante PPO y se convierte en la politica profesora. Segundo, se construye el conjunto de problemas: por cada mes operado por el profesor se modifica una unica opcion de decision y se vuelve a ejecutar el mes completo para puntuar cada alternativa. Tercero, aprendizaje supervisado imitando la opcion con mayor puntuacion. Cuarto, aprendizaje por refuerzo sobre el conjunto de opciones agrupadas (normalizacion de ventajas por grupo) mas una penalizacion KL contra el modelo de partida, que es la formulacion tipica de GRPO. La distribucion de empresas usada es la etiquetada como `general`, ajustada con datos publicos. No se declara el numero de tokens de entrenamiento ni la composicion textual del dataset, mas alla del recuento de problemas: 4.082 de entrenamiento, 832 de validacion y 840 de test.

## Capacidades

- Decision de eleccion unica: dado un estado, una pregunta y un conjunto de opciones etiquetadas, devuelve exactamente la letra de una opcion y nada mas.
- Calibracion por probabilidad: la probabilidad asignada a la letra elegida puede interpretarse como grado de confianza de la decision.
- Seguimiento de instrucciones estrictas: el autor documenta un prompt de sistema que obliga a tratar el contenido del campo `state` como datos y no como instrucciones, y a responder solo con la letra.
- Decision secuencial en simulador: al integrarse en un bucle con el simulador, encadena decisiones mes a mes, aunque cada invocacion es independiente.
- Formato de entrada estructurado: acepta un JSON con los campos `state`, `question` y `options` (cada opcion con `label`, `key` y `description`).
- Multilingue: no. El modelo declara exclusivamente coreano (ko).
- Tool calling / function calling: no disponible.
- Capacidades de agente autonomo y razonamiento multi-paso explicito: no disponibles; el modelo no genera cadenas de razonamiento, solo una letra.
- Vision, audio, thinking mode: no disponibles.
- Codigo y matematicas: no disponibles como capacidades declaradas; no forman parte del objetivo de entrenamiento.

## Casos de uso

- Simulacion de gestion empresarial: el uso para el que fue disenado. Se integra en CONNECT TYCOON o en un simulador equivalente, alimentandolo con el estado del mes, la pregunta de decision y las opciones, y usando la letra devuelta para avanzar la partida.
- Etiquetado y preanotacion de datos de decision: el modelo puede preetiquetar opciones en registros historicos de decisiones empresariales, que despues se revisan manualmente. Su formato de salida de un solo caracter reduce el coste de parseo.
- Linea base ligera en investigacion de RL: sirve como punto de comparacion reproducible de una politica entrenada con recompensa de simulador, util para medir la ganancia de GRPO frente al aprendizaje supervisado.
- Replicacion de pipelines GRPO en modelos pequenos: el repositorio de acompanamiento y el cuaderno de Colab permiten reproducir las cuatro fases (PPO profesor, generacion de problemas, SFT, RL) en hardware modesto, algo poco habitual en ejemplos publicos.
- Componente de decision dentro de un agente mayor: por su tamano de 0,8B puede actuar como modulo especializado de eleccion discreta dentro de un sistema con un LLM mayor que gestione el lenguaje natural y delegue la seleccion final de opcion.
- Docencia de aprendizaje por refuerzo: el autor publica cursos asociados (AI CITY BUILDERS) y material en YouTube, por lo que el modelo encaja como ejemplo didactico de RL aplicado con recompensa no diferenciable.
- Prototipado local sin GPU dedicada: al ser un adaptador sobre un base de 0,8B, permite experimentar en equipos de gama media o incluso en CPU, algo inviable con modelos de decenas de miles de millones de parametros.
- Ajuste de modelos de decision a un dominio concreto: el mismo esquema (profesor en simulador, generacion de problemas, SFT y RL) puede reaplicarse a otros dominios de decision acotados partiendo de este adaptador como plantilla.

## Benchmarks y rendimiento

La model card solo publica resultados internos del simulador y del conjunto de test propio (840 problemas). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, y no se aportan datos de modelos comparables.

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales de tarjeta |
|---|---|---|---|---|
| Aprendizaje supervisado (etapa previa) | 86,2% | 2,01 | no disponible | no disponible |
| Aprendizaje por refuerzo (este adaptador) | 86,4% | 2,00 | -1,4 millones de wones | 37% (91 de 177 casos) |
| Politica profesora (PPO en el simulador) | no disponible | no disponible | superior al modelo, magnitud no disponible | no disponible |

El autor advierte que la medida de operacion de empresa corresponde a la media de dos meses no vistos, por lo que la muestra es muy pequena, y que el modelo sigue por debajo de la politica profesora. El beneficio mensual publicado es negativo. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 0,8B de parametros del modelo base; el autor no publica cifras): en fp16 en torno a 1,6 GB solo de pesos, mas cache KV y activaciones, lo que en la practica apunta a 2-3 GB; en int8 alrededor de 0,8 GB de pesos; en int4 alrededor de 0,4 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en teoria para fp16 con contexto corto (por ejemplo GTX 1650 4GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para despliegue con lotes grandes o contextos largos conviene partir de 8-12 GB (RTX 3060 12GB, RTX 4070, RTX 4080). GPU de datacenter (A100, H100) no son necesarias para este tamano y solo tendrian sentido para reentrenar el adaptador.
- Cabe en GPU consumer: si, con margen amplio, segun la estimacion anterior. El propio autor proporciona un cuaderno de Google Colab para el entrenamiento, lo que confirma que el proceso completo es viable en GPU de gama media o en recursos gratuitos de Colab.
- Opciones de despliegue: la via documentada es Transformers mas PEFT (`AutoModelForCausalLM` + `PeftModel.from_pretrained`), tal y como aparece en la model card. vLLM y TGI soportan adaptadores LoRA en general, pero no hay confirmacion de compatibilidad en la informacion proporcionada. Para llama.cpp u Ollama seria necesario fusionar el adaptador en el modelo base; no verificado.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por decision.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de decision empresarial entrenados con RL sobre simulador, y el autor no ofrece ninguna comparacion externa. La unica comparacion posible es interna, entre las etapas del propio pipeline.

| Alternativa | Parametros | Contexto | Acierto en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-juju-v2 (RL) | 0,8B (base) + LoRA | no disponible | 86,4% | apache-2.0 | HuggingFace, 0 descargas |
| Etapa de aprendizaje supervisado del mismo pipeline | 0,8B (base) + LoRA | no disponible | 86,2% | no disponible | no se publica como repositorio separado en la informacion disponible |
| Qwen/Qwen3.5-0.8B sin adaptador | 0,8B | no disponible | no disponible | no disponible en esta informacion | HuggingFace (modelo base referenciado) |
| Politica profesora PPO del simulador | no disponible | no disponible | no disponible | no disponible | no publicada |

Modelos alternativos de la misma categoria (decision discreta sobre simulador): no disponible.

## Limitaciones y advertencias

- Rendimiento por debajo de la politica profesora: el propio autor indica que el modelo RL aun no alcanza a la politica PPO que genero los datos.
- Beneficio mensual negativo en simulador: -1,4 millones de wones en la evaluacion publicada, frente a la etapa supervisada, para la que no se reporta este dato.
- Muestra de evaluacion muy pequena: la medida de operacion de empresa corresponde a la media de dos meses no vistos, por lo que la varianza del resultado es alta y no permite conclusiones firmes.
- Idioma unico: solo coreano declarado. El prompt de sistema documentado esta en ingles, pero no hay evidencia de soporte real multilingue.
- Salida restringida a una letra: el modelo no razona, no explica y no mantiene conversacion. Cualquier uso fuera de la seleccion de una opcion etiquetada queda fuera de su diseno.
- Riesgo de alucinacion y de violacion de formato: al ser un modelo de 0,8B, puede devolver una letra no incluida en las opciones o anadir texto adicional. En produccion es imprescindible validar la salida contra el conjunto de etiquetas permitido.
- Sensibilidad a la inyeccion de instrucciones: la propia model card incluye instrucciones defensivas en el prompt de sistema para tratar el campo `state` como datos, lo que indica que el autor considera real el riesgo de que el contenido de entrada secuestre la decision.
- Ambito de uso declarado: modelo de investigacion y educacion sobre un simulador de empresa sintetica. El autor recomienda explicitamente revalidar con los registros reales de la empresa antes de usarlo para decisiones de gestion.
- Licencia: apache-2.0, permisiva y apta para uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, no detallada en la informacion proporcionada.
- Madurez y adopcion: 0 descargas y 0 me gusta, creado y actualizado el 14 de octubre de 2026, lo que implica ausencia de validacion independiente por terceros.
- Contexto maximo: no disponible, lo que impide garantizar que estados de empresa largos quepan en la ventana.
- Distribucion de empresas limitada: solo se entreno con la distribucion `general`, por lo que el comportamiento en sectores o estructuras empresariales atipicas no esta cubierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para el entrenamiento RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Paper asociado: no disponible
- Demo publica: no disponible
