# allapp/connectailab-rl-mong-v1-link01

## Resumen

connectailab-rl-mong-v1-link01 es un adaptador LoRA publicado por allapp que convierte el modelo base Qwen/Qwen3.5-0.8B en un decisor de acciones discretas para el robot simulado LINK-01 dentro del entorno educativo CONNECT AI WORLD. El modelo recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa) y devuelve una unica letra correspondiente a una de las cinco acciones de locomocion disponibles para el siguiente intervalo de 0,5 segundos. No es un modelo de lenguaje general, sino un adaptador especializado en una tarea de decision secuencial.

La relevancia tecnica del artefacto reside en su metodo de construccion: un cerebro PPO entrenado previamente en el simulador web actua como profesor y genera un corpus de pares estado-accion, sobre el que se aplica primero aprendizaje supervisado (LoRA) y despues un refinamiento por refuerzo con anclaje KL. El resultado es un modelo de 0,8 mil millones de parametros (base) con un adaptador de bajo rango que replica al profesor con una tasa de coincidencia del 90,5 % en el conjunto de test y mantiene un 100 % de exito en 20 episodios de evaluacion.

Se trata de un modelo de investigacion y docencia, con licencia Apache 2.0, publicado sin descargas ni interacciones en el momento de la ficha y con documentacion integramente en coreano. Su interes practico es acotado: demuestra como destilar una politica de RL en un modelo de lenguaje pequeno mediante LoRA y refinamiento con PPO, un patron reutilizable para otros dominios de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; rango y alpha del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | coreano (ko), segun la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador LoRA se entrena en dos fases. En la primera, un cerebro PPO entrenado en el simulador web CONNECT AI WORLD (tarea `goto_target`, contrato `link01-decision/goto_target/obs10-act5/walker51-14/v1`, curso `random`) genera un corpus de problemas: cada 0,5 segundos se serializa la observacion del robot (10 dimensiones) como texto con situacion, pregunta y cinco opciones, y la etiqueta es la accion elegida por el cerebro. Un 20 % de las muestras se generan con desviaciones deliberadas para cubrir trayectorias fuera de curso. El corpus resultante contiene 463 ejemplos de entrenamiento, 93 de validacion y 137 de test.

La segunda fase aplica refuerzo sobre el modelo supervisado: para cada opcion se calcula la recompensa que habria obtenido el cerebro si hubiera continuado caminando tras esa eleccion, se suben las opciones mejores que la del profesor y se bajan las peores, con una penalizacion KL que ancla el modelo a la politica supervisada. La evaluacion se realiza sentando al modelo en el puesto de decision del robot y ejecutando 20 episodios con semillas 91001-91020 sobre un aproximador 2D de la marcha (tabla de velocidades por comando derivada de MuJoCo web), sin red neuronal de locomocion. El techo teorico de acierto, medido como la proporcion en que el cerebro produce la misma respuesta tras la serializacion textual, es del 99 %.

## Capacidades

- Clasificacion de acciones discretas: devuelve exactamente una letra entre cinco opciones (A-E) para la tarea `goto_target`.
- Lectura de estado serializado: interpreta descripciones textuales de distancia, direccion, sensores de distancia, velocidad y accion previa.
- Respuesta restringida a formato: el prompt de sistema exige devolver solo la letra, sin explicacion.
- Robustez ante instrucciones embebidas: el prompt de sistema trata el contenido del campo `state` como datos, no como instrucciones.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al coreano en el dominio de la tarea; no se documenta comportamiento en castellano ni en ingles mas alla del prompt de sistema.
- No es un modelo de proposito general: fuera del formato de pregunta de LINK-01 no se garantiza ningun comportamiento util.

## Casos de uso

- Docencia de destilacion de politicas RL: el par cerebro PPO + adaptador LoRA sirve como ejemplo completo de pipeline (generacion de corpus, SFT, PPO con KL) en cursos de aprendizaje por refuerzo, con codigo y cuaderno de Colab publicados.
- Evaluacion de modelos pequenos en tareas de decision: con 0,8 mil millones de parametros y un adaptador de bajo rango, permite medir cuanto de una politica de RL se puede comprimir en un modelo de lenguaje sin perder exito en episodios.
- Prototipado de interfaces lenguaje-accion: el formato pregunta-opciones es reutilizable para definir nuevas tareas de decision (navegacion, seleccion de waypoints) sin cambiar el esquema de serializacion.
- Banco de pruebas de robustez ante inyeccion de instrucciones: el prompt de sistema explicito permite estudiar si el modelo respeta la separacion entre datos y ordenes en el campo de estado.
- Simulacion educativa de robotica: integrado en CONNECT AI WORLD, permite a estudiantes comparar el comportamiento del cerebro original frente al modelo destilado en el mismo curso y semillas.
- Referencia para investigacion en RLHF ligero: el esquema de recompensa por opcion con anclaje KL es un caso concreto y reproducible de refinamiento por preferencias derivadas de un simulador.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluacion sobre el conjunto de test de 137 problemas y 20 episodios de marcha con semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 10,3 s |
| Modelo base sin entrenar | 24,8 % | 0 % | 0 % | no disponible |
| Adaptador tras SFT (LoRA) | 92,0 % | 100 % | 0 % | 10,7 s |
| Adaptador tras RL (este modelo) | 90,5 % | 100 % | 0 % | 10,8 s |

El techo de acierto por serializacion textual es del 99 %. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendrian sentido para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parametros ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,6 GB en cuantizacion de 4 bits; el adaptador LoRA anade unos pocos megabytes.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 sobran para esta carga.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM o TGI con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada; la tarea es de un unico token de salida por decision cada 0,5 segundos, por lo que la latencia por llamada es el factor critico en un bucle de control.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. La tabla siguiente contrasta el artefacto con su modelo base y con la politica de RL que lo supervisa, que son las referencias naturales:

| Modelo | Parametros | Contexto | Acierto en test | Exito en 20 episodios | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-mong-v1-link01 | 0,8 B (base) + LoRA | no disponible | 90,5 % | 100 % | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B sin adaptador | 0,8 B | no disponible | 24,8 % | 0 % | no disponible en esta ficha | HuggingFace |
| Cerebro PPO `link01-decision/.../v1` | no disponible (politica RL) | no aplica | 100,0 % | 100 % | no disponible | Entorno CONNECT AI WORLD |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo responde al formato de pregunta de la tarea `goto_target`; fuera de el no hay garantia de comportamiento coherente.
- Evaluacion sobre un aproximador 2D de la marcha, no sobre MuJoCo completo ni sobre robot fisico; los resultados pueden diferir del simulador real.
- El autor advierte explicitamente que es un modelo de investigacion y educacion y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- El refinamiento por RL no mejora al SFT en el test (90,5 % frente a 92,0 %); el autor selecciono el modelo supervisado como version publicada, lo que sugiere que la fase RL no aporta ganancia medible en esta configuracion.
- Corpus de entrenamiento muy pequeno (463 ejemplos), con riesgo de sobreajuste al curso `random` y a la semilla de generacion.
- Idiomas: documentado solo en coreano; el prompt de sistema esta en ingles pero no se reporta evaluacion en otros idiomas.
- Riesgo de alucinacion: el modelo puede devolver una letra valida ante estados fuera de distribucion sin que la accion sea correcta; no hay mecanismo de abstenccion.
- Sesgos: no documentados; al derivarse de un simulador, puede heredar sesgos de la dinamica y del diseno del curso.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 interacciones en el momento de la ficha; sin mantenimiento ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allapp/connectailab-rl-mong-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
