# kareyoung09/connectailab-rl-ideun-v1

## Resumen

connectailab-rl-ideun-v1 es un adaptador LoRA entrenado con aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kareyoung09 dentro del proyecto Connect Tycoon de CONNECT AI LAB y AI CITY BUILDERS. El modelo no es un asistente conversacional generalista: es un clasificador de decisiones que recibe el estado de una empresa simulada, una pregunta y una lista de opciones etiquetadas (A, B, C...), y devuelve únicamente la letra de la opción elegida. La probabilidad asignada a cada letra funciona como estimación de confianza de esa elección.

El interes tecnico del artefacto esta en su pipeline de entrenamiento, documentado en la model card: primero se entrena una politica pequena con PPO dentro del simulador (el "profesor"), despues ese profesor genera un banco de problemas reetiquetado por puntuacion real de cada opcion, se hace aprendizaje supervisado sobre la mejor opcion y, finalmente, un paso de refuerzo tipo GRPO con normalizacion por grupo y penalizacion KL contra el modelo de partida. Es, por tanto, un caso de destilacion de politica RL a un modelo de lenguaje pequeno mediante preferencias de simulador.

Se trata de un modelo de investigacion y educacion, con licencia Apache 2.0, orientado exclusivamente al coreano y con tamano de repositorio de 0,0 GB (solo el adaptador). Su relevancia es metodologica, no de rendimiento absoluto: el propio autor senala que es un primer experimento con muestras pequenas y que la politica profesora sigue siendo mejor en el simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B; la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base declarado tiene 0,8B de parametros |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, no un modelo completo. La libreria declarada es peft y los pesos se distribuyen en safetensors; el repositorio ocupa 0,0 GB, lo que confirma que solo contiene el delta de bajo rango. La inferencia requiere cargar primero Qwen/Qwen3.5-0.8B y montar encima el adaptador mediante PeftModel.from_pretrained. La model card no especifica la arquitectura del modelo base, el rango del LoRA, las capas adaptadas ni el contexto nativo, por lo que esos datos quedan como no disponibles.

El entrenamiento sigue cuatro fases descritas por el autor. Primero, una politica pequena aprende a operar la empresa durante miles de meses simulados con PPO; esa politica actua como profesor. Segundo, por cada mes de operacion se construye un "cuaderno de problemas": se alteran las opciones de una decision concreta y se vuelve a ejecutar el mes hasta el final para puntuar cada alternativa por su resultado real. Tercero, aprendizaje supervisado imitando la opcion con mayor puntuacion. Cuarto, un paso de refuerzo que trata el conjunto completo de opciones como un grupo, normaliza las ventajas dentro del grupo y aumenta la probabilidad de las opciones cuyo resultado en el simulador supera la media, con una penalizacion KL contra el modelo de partida (esquema tipo GRPO). El dataset se genero sobre una distribucion de empresas de tipo `general`, ajustada con datos publicos, con 4082 problemas de entrenamiento, 832 de validacion y 840 de test.

## Capacidades

- Clasificacion de decision cerrada: dado un estado, una pregunta y un conjunto de opciones etiquetadas, devuelve una sola letra de opcion, sin explicacion.
- Calibracion de confianza: la probabilidad asociada a cada letra se interpreta en la model card como la probabilidad de esa eleccion, y el valor maximo como la confianza del modelo.
- Razonamiento de decision empresarial dentro del simulador Connect Tycoon: gestion de dinero, satisfaccion y eventos de accidente a lo largo de un mes simulado.
- Resistencia a inyeccion de instrucciones en el campo `state`: el prompt de sistema indica explicitamente que el texto dentro de `state` debe tratarse como datos y no como instrucciones.
- Generalizacion limitada a empresas no vistas: el autor reporta una media de dos meses de operacion sobre empresas nuevas.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para coreano.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo emite una unica letra por consulta.
- Vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Simulacion de direccion empresarial en Connect Tycoon: el modelo recibe el estado de la compania simulada y elige una de las opciones disponibles cada mes, sustituyendo o asistiendo a la politica PPO original dentro del bucle del juego. Es su caso de uso nativo y el unico validado por el autor.
- Investigacion en destilacion de politicas RL: sirve como caso de estudio reproducible de como se transfiere una politica entrenada con PPO a un modelo de lenguaje pequeno mediante etiquetado por puntuacion y refuerzo con normalizacion por grupo, con banco de problemas y particiones train/valid/test publicadas (4082/832/840).
- Docencia de aprendizaje por refuerzo: el proyecto incluye un cuaderno de Colab y cursos gratuitos, por lo que el adaptador se puede usar como ejemplo practico en clase para ilustrar RLHF/GRPO sobre modelos pequenos.
- Evaluacion de robustez frente a inyeccion de prompt: al tratar `state` como datos no confiables, es un banco de pruebas util para medir si un modelo pequeno mantiene el formato de salida estricto cuando el estado contiene texto hostil.
- Etiquetado de decisiones en pipelines de datos sinteticos: puede generar etiquetas de opcion unica sobre registros de estado/pregunta/opciones para poblar datasets de Decision Making con bajo coste computacional, dado el tamano de 0,8B.
- Analisis de regret en entornos de decision: la metrica de "arrepentimiento" reportada (2,19 en el modelo de RL frente a 2,75 del base) permite usar el modelo como referencia en estudios comparativos de calidad de decision bajo simulador.
- Filtrado previo de opciones en un sistema mayor: dado su coste minimo de inferencia, puede actuar como primera etapa que descarta opciones claramente suboptimas antes de pasar el caso a un modelo mayor o a revision humana.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | Precision en preguntas de test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales de tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 33,3 % | 2,75 | No disponible | No disponible |
| Aprendizaje supervisado | 67,0 % | 2,28 | No disponible | No disponible |
| Aprendizaje por refuerzo (este adaptador) | 66,9 % | 2,19 | 7,64 millones de KRW | 71 % (148/177) |

El autor advierte que la evaluacion de operacion empresarial se basa en una media de dos meses sobre empresas no vistas, con muestra pequena, y que la politica profesora entrenada con PPO en el simulador sigue obteniendo mejores resultados que este modelo. No se publican resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

Los datos de VRAM, latencia y throughput no estan publicados en la informacion disponible. Las siguientes cifras son estimaciones derivadas del unico dato conocido (0,8B de parametros en el modelo base) y deben verificarse en el entorno real de despliegue:

- VRAM para inferencia en fp16: aproximadamente 2 GB para los pesos del base mas margen para activaciones y cache KV; el adaptador LoRA anade una cantidad marginal de memoria.
- VRAM en cuantizacion de 8 bits: del orden de 1 GB para los pesos, mas overhead del runtime.
- VRAM en cuantizacion de 4 bits: por debajo de 1 GB para los pesos; el adaptador puede fusionarse o cargarse en precision completa segun el runtime.
- GPU consumer: cabe con holgura en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090), e incluso en CPU para lotes pequenos, dado el tamano de 0,8B.
- GPU de centro de datos (A100, H100): soportado pero sobredimensionado para este modelo; su uso tendria sentido solo para servir muchos lotes concurrentes.
- Opciones de despliegue: el flujo documentado por el autor usa transformers junto con peft y AutoModelForCausalLM mas PeftModel. El soporte en vLLM, TGI, llama.cpp u Ollama no esta indicado en la informacion disponible; en el caso de llama.cpp u Ollama requeriria convertir el adaptador al formato GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ideun-v1 | Adaptador LoRA sobre base de 0,8B | No disponible | 66,9 % de acierto en test, arrepentimiento 2,19 | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-0.8B (base sin adaptador) | 0,8B | No disponible | 33,3 % de acierto en test, arrepentimiento 2,75 | No disponible en la informacion proporcionada | Modelo base referenciado en HuggingFace |
| Politica profesora entrenada con PPO en el simulador | No disponible | No disponible | Superior al modelo de RL segun el autor, sin cifras publicadas | No disponible | No distribuida publicamente segun la informacion disponible |

No se han identificado en la informacion proporcionada otros adaptadores publicos de toma de decisiones empresariales entrenados con GRPO sobre Qwen que permitan una comparacion directa; en esta categoria el dato queda como no disponible.

## Limitaciones y advertencias

- Ambito restringido a la tarea: el modelo solo devuelve una letra de opcion. No genera texto libre, no explica su eleccion y no debe usarse como asistente generalista.
- Dominio limitado al simulador: fue entrenado sobre la distribucion de empresas `general` del simulador Connect Tycoon. El propio autor recomienda revalidar con los registros reales de cada empresa antes de aplicar sus decisiones.
- Muestra de evaluacion pequena: la operacion empresarial se evalua con una media de dos meses sobre empresas no vistas, lo que limita la significacion estadistica de los resultados.
- Rendimiento por debajo del profesor: la politica PPO del simulador sigue superando al modelo en la propia tarea objetivo, segun la model card.
- Idioma: etiquetado unicamente como coreano, con prompts de sistema y de usuario en ingles en el ejemplo de uso. El comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: inherente a un modelo de 0,8B. Al restringirse la salida a una letra de la lista, el riesgo se manifiesta como eleccion de una opcion valida pero incorrecta, no como texto inventado; aun asi puede producir una letra fuera del conjunto permitido si el prompt no se respeta.
- Inyeccion de prompt: el diseno intenta mitigarla tratando `state` como datos, pero no se publican evaluaciones de robustez frente a ataques adversariales en ese campo.
- Sesgos: el dataset se genera sobre una distribucion sintetica de empresas ajustada con datos publicos; los sesgos de esa distribucion se trasladan al modelo y no estan cuantificados en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B puede tener condiciones propias que no se detallan en la informacion proporcionada y que deben verificarse por separado.
- Uso previsto: la model card describe explicitamente el modelo como herramienta de investigacion y educacion sobre un simulador sintetico, no como sistema de decision empresarial real.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente conocida.
- Repositorio de 0,0 GB: solo contiene el adaptador, no los pesos completos; sin el modelo base el artefacto no es utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-ideun-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Paper asociado: no disponible en la informacion proporcionada.
- Demo adicional: no disponible en la informacion proporcionada.
