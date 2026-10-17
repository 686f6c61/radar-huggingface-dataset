# choyahoo/connectailab-rl-hy-v1

## Resumen

connectailab-rl-hy-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor choyahoo, en el marco del laboratorio CONNECT AI LAB. No es un modelo de propósito general: es un modelo de decisión que recibe un estado de empresa simulado, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve únicamente la letra de la opción elegida. La probabilidad asociada a cada letra se interpreta como el nivel de confianza de la decisión.

El entrenamiento combina un profesor entrenado con PPO directamente en el simulador Connect Tycoon, la generación de un conjunto de problemas por contrafactuales (se reejecuta cada mes variando la opción elegida para puntuar cada alternativa) y dos fases posteriores: aprendizaje supervisado sobre la mejor opción y un ajuste por refuerzo con ventaja normalizada por grupo y penalización KL respecto al modelo de partida, que es el procedimiento que el autor etiqueta como GRPO. Los datos del simulador se distribuyen en 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test.

Su relevancia es acotada y experimental: es un ejemplo reproducible de cómo convertir un modelo pequeño de 0,8 mil millones de parámetros en un agente de decisión mediante RL sobre un entorno simulado, con métricas publicadas de exactitud, arrepentimiento (regret) y beneficio mensual simulado. El propio autor lo describe como modelo de investigación y educativo, con resultados preliminares y un tamaño de muestra reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, de tipo transformer decoder |
| Parametros totales | 0,8 mil millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | no aplica (el modelo base no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse por separado) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), requiere cargar el modelo base Qwen/Qwen3.5-0.8B |
| Libreria | peft (con transformers para el modelo base) |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo: se carga con `PeftModel.from_pretrained` sobre `Qwen/Qwen3.5-0.8B`. El modelo base es un transformer decoder de 0,8 mil millones de parametros; los detalles de su arquitectura (numero de capas, cabezas, tipo de atencion, vocabulario) no se detallan en la informacion proporcionada. La tarea final esta muy acotada: dado un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`), el modelo debe emitir una sola letra, sin explicacion, bajo una instruccion de sistema que ademas indica tratar el texto de `state` como datos y no como instrucciones.

El proceso de entrenamiento descrito tiene cuatro etapas. Primero, una politica pequena se entrena con PPO dentro del simulador Connect Tycoon durante miles de meses simulados; esa politica actua como profesor. Segundo, se construye un conjunto de problemas reejecutando cada mes con cada opcion alternativa hasta el final del mes, de modo que se obtiene una puntuacion por opcion. Tercero, se aplica aprendizaje supervisado imitando la opcion con mejor puntuacion. Cuarto, se aplica un ajuste por refuerzo sobre la respuesta completa: se agrupan las opciones, se normaliza la ventaja dentro del grupo y se incrementa la probabilidad de las opciones cuyo resultado en el simulador supera la media, con una penalizacion KL respecto al modelo de partida para limitar la deriva. El autor etiqueta esta ultima fase como GRPO. La distribucion de empresas usada es `general`, ajustada a datos publicos, con 4.082 problemas de entrenamiento, 832 de validacion y 840 de test.

## Capacidades

- Seleccion de una unica opcion entre varias alternativas etiquetadas, devolviendo solo la letra correspondiente.
- Interpretacion de un estado de empresa simulado descrito en texto dentro de un campo JSON estructurado.
- Estimacion implicita de confianza mediante la distribucion de probabilidad sobre las etiquetas de las opciones.
- Toma de decisiones secuenciales en un entorno de simulacion de gestion empresarial (Connect Tycoon), mes a mes.
- Resistencia basica a la inyeccion de instrucciones dentro del campo `state`, inducida por la instruccion de sistema que trata ese contenido como datos.
- No se documentan capacidades de generacion de texto libre, razonamiento explicito, codigo, matematicas, vision, audio, tool calling ni uso como agente multi-paso.
- Cobertura multilingue limitada al coreano segun los metadatos del modelo.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a decisiones discretas: sirve como caso reproducible de pipeline profesor PPO, destilacion supervisada y ajuste por refuerzo con ventaja normalizada por grupo, con cifras publicadas de exactitud y regret.
- Evaluacion comparativa de metodos de RL con modelos pequenos: al partir de un modelo de 0,8 mil millones de parametros y publicar resultados antes y despues del entrenamiento (29,8 % frente a 74,4 % de acierto), permite medir la ganancia atribuible a cada fase.
- Docencia y formacion en RL y simulacion: el autor distribuye un notebook de Colab enlazado desde la model card, lo que facilita reproducir el entrenamiento en un entorno gratuito.
- Simulacion de politica de decision en entornos tipo juego de gestion: el modelo puede integrarse como agente que elige una accion por turno dentro de Connect Tycoon o de un simulador equivalente con el mismo formato de observacion.
- Banco de pruebas de robustez frente a datos no confiables: la instruccion de sistema que separa datos de instrucciones permite estudiar el comportamiento del modelo ante texto hostil embebido en el estado.
- Generacion de datos sinteticos de decision: las probabilidades por opcion pueden usarse para etiquetar escenarios sinteticos o para estudiar la calibracion de un modelo pequeno en tareas de eleccion forzada.
- Prototipado de agentes economicos en entornos de bajo coste: al caber en cualquier GPU de consumo e incluso en CPU, permite iterar rapidamente sobre politicas de decision antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card, medidos sobre 840 problemas de test y sobre una evaluacion de dos meses en el simulador:

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual simulado | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen sin entrenar | 29,8 % | 3,04 | no disponible | no disponible |
| Aprendizaje supervisado | 74,9 % | 2,03 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 74,4 % | 1,97 | 9,91 millones de wones | 72 % (146/177) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. El propio autor advierte que el resultado de gestion empresarial corresponde a la media de dos meses no vistos, con muestra pequena, y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, no publicados por el autor): en bf16/fp16, alrededor de 1,6 GB solo de pesos y 2-3 GB contando cache de activaciones; en int8, aproximadamente 1 GB; en cuantizacion de 4 bits, en torno a 0,5-0,7 GB.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o mas de VRAM; tambien es viable la ejecucion en CPU con llama.cpp u Ollama, dado el tamano del modelo base.
- GPU recomendadas: cualquier RTX 3060, RTX 4060, RTX 4090 o superior para baja latencia; A100 o H100 no son necesarias y solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: transformers con peft para cargar el adaptador tal cual (el modo documentado por el autor), fusion del adaptador con el modelo base y posterior conversion a GGUF para llama.cpp u Ollama, o servidores tipo vLLM y TGI tras fusionar los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de despliegue: al ser un adaptador LoRA, el repositorio no es autosuficiente; es obligatorio descargar Qwen/Qwen3.5-0.8B y cargarlo como base.

## Comparativa con modelos similares

No se han proporcionado modelos comparables de la misma categoria en la informacion disponible. La unica comparacion documentada es interna al propio entrenamiento:

| Version | Parametros | Contexto | Acierto en test | Regret | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B sin ajustar | 0,8 mil millones | no disponible | 29,8 % | 3,04 | segun el modelo base |
| connectailab-rl-hy-v1 (SFT) | 0,8 mil millones mas adaptador | no disponible | 74,9 % | 2,03 | apache-2.0 |
| connectailab-rl-hy-v1 (RL, publicado) | 0,8 mil millones mas adaptador | no disponible | 74,4 % | 1,97 | apache-2.0 |

No hay datos publicos que permitan compararlo con otros adaptadores de decision, con modelos de gestion de empresa o con agentes de RL comparables.

## Limitaciones y advertencias

- Modelo de investigacion y educacion segun su propio autor; no debe usarse para decisiones de gestion reales sin revalidarlo con los datos historicos de la empresa concreta.
- Entrenado exclusivamente en coreano y sobre una unica distribucion de empresa (`general`); el rendimiento fuera de ese idioma o de ese tipo de empresa no esta caracterizado.
- La tarea esta restringida a devolver una letra; no genera explicaciones, justificaciones ni texto libre, lo que limita su auditabilidad directa.
- Riesgo de alucinacion relevante en decisiones fuera de distribucion: el modelo debe elegir siempre una opcion, aunque ninguna sea apropiada, y no dispone de mecanismo declarado para abstenerse.
- Muestra de evaluacion pequena: el resultado de gestion empresarial se calcula sobre la media de dos meses no vistos, por lo que el margen de error es amplio.
- El modelo publicado queda por debajo de la politica profesora entrenada con PPO en el simulador, segun reconoce el autor.
- Puede heredar los sesgos del simulador y de los datos publicos usados para calibrar la distribucion de empresas; no se documenta ningun analisis de sesgo.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada, y el formato de entrada es un JSON estricto de estado, pregunta y opciones.
- Licencia apache-2.0 en el adaptador, lo que permite uso comercial del artefacto; conviene verificar por separado la licencia del modelo base Qwen/Qwen3.5-0.8B antes de explotarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y tamano de 0,0 GB, coherente con un adaptador LoRA minimo; no hay senales de validacion por parte de la comunidad.
- El identificador y las fechas del repositorio (creado el 16 de octubre de 2026) corresponden a los metadatos publicados y no se han podido contrastar con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/choyahoo/connectailab-rl-hy-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Busqueda web: los resultados devueltos corresponden a la obra de ficcion "The Rise" de Ian Rankin y no guardan relacion con este modelo; no se han encontrado enlaces adicionales relevantes.
