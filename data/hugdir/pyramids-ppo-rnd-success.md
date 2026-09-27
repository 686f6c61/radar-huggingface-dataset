# Hugdir/Pyramids-PPO-RND-Success

# Pyramids-PPO-RND-Success

## Resumen

Pyramids-PPO-RND-Success es un agente de aprendizaje por refuerzo profundo publicado por el usuario Hugdir. No es un modelo de lenguaje: se trata de una politica entrenada con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Pyramids de la libreria Unity ML-Agents. El sufijo RND hace referencia a Random Network Distillation, una tecnica de recompensa intrinseca que se utiliza para mejorar la exploracion en entornos con recompensas dispersas, que es precisamente la naturaleza del escenario Pyramids.

El agente se distribuye en formato .nn (nativo de ML-Agents) y .onnx, lo que permite ejecutarlo tanto dentro del motor Unity como en el navegador a traves del visor de agentes de Hugging Face. El repositorio ocupa 0,0 GB, lo que indica que los pesos son muy ligeros y que el modelo esta pensado para inferencia en tiempo real, no para computo intensivo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion y demostracion dentro del ecosistema ML-Agents, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentacion tecnica mas alla de la plantilla estandar de la libreria. Cualquier uso en produccion deberia considerar estas carencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (actor) y funcion de valor (critic) entrenada con PPO; modulo RND de recompensa intrinseca |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (agente de RL basado en observaciones por paso, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | .nn (formato nativo de ML-Agents) y .onnx |
| Entorno de entrenamiento | Pyramids (Unity ML-Agents) |
| Algoritmo | PPO con RND |
| Libreria | ml-agents |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

El agente sigue la arquitectura estandar de ML-Agents para aprendizaje por refuerzo: una red de politica que mapea observaciones del entorno a acciones discretas o continuas y una red de valor que estima el retorno esperado. El entrenamiento se realiza con PPO, un metodo de gradiente de politica con recorte de la razon de probabilidades que estabiliza las actualizaciones del actor. Sobre esa base, el componente RND anade una recompensa intrinseca calculada como el error de prediccion de una red objetivo fija frente a una red predictora entrenada, incentivando al agente a explorar estados novedosos. Esta combinacion es habitual cuando la recompensa extrinseca del entorno es escasa, algo caracteristico del escenario Pyramids, donde los agentes deben activar interruptores y alcanzar zonas objetivo de forma coordinada.

No se ha publicado informacion sobre el numero de pasos de entrenamiento, la composicion del curriculum, los hiperparametros concretos (tasa de aprendizaje, tamano de lote, coeficientes de recompensa intrinseca o extrinseca) ni el numero de agentes concurrentes utilizados durante el entrenamiento. Tampoco se detalla si se aplicaron fases de auto-curriculum o regularizacion de observaciones. La model card se limita a la plantilla generada automaticamente por ML-Agents e incluye instrucciones para reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<run_id> --resume` y para visualizar al agente en el navegador.

## Capacidades

- Control de politica en el entorno Pyramids: seleccion de acciones a partir de las observaciones vectoriales del escenario.
- Exploracion basada en novedad gracias al modulo RND, disenado para recompensas dispersas.
- Ejecucion de inferencia en tiempo real dentro de Unity mediante el formato .nn.
- Exportacion e inferencia multiplataforma mediante ONNX, incluida la ejecucion en navegador.
- Soporte de reanudacion de entrenamiento desde el punto guardado con ML-Agents.
- No dispone de tool calling, function calling, razonamiento multi-paso generativo ni capacidades multilingues, dado que no es un modelo de lenguaje.
- No dispone de modo de razonamiento explicito, vision general ni procesamiento de audio mas alla de las observaciones que el entorno Pyramids proporcione por defecto.

## Casos de uso

- Evaluacion comparativa de algoritmos de RL: sirve como punto de referencia de un agente PPO+RND sobre Pyramids para contrastar con PPO puro o SAC en experimentos reproducibles.
- Estudio de recompensas intrinsecas: permite analizar empiricamente como RND afecta la exploracion en un entorno de recompensa dispersa y coordinar varios agentes.
- Transferencia a entornos similares de ML-Agents: la politica puede servir como inicializacion para otros escenarios de navegacion y activacion de interruptores.
- Demostracion interactiva en navegador: el visor de Hugging Face permite cargar el archivo .onnx y observar al agente jugando sin infraestructura adicional.
- Prototipado de agentes no jugadores en Unity: el archivo .nn se integra directamente en el motor para pruebas de comportamiento antes de invertir en entrenamientos largos.
- Investigacion educativa: sirve como ejemplo practico en cursos de aprendizaje por refuerzo para ilustrar la canalizacion de entrenamiento, exportacion y publicacion en el Hub.
- Benchmark de rendimiento en hardware ligero: al tratarse de un modelo de muy bajo peso, es util para medir latencia de inferencia en CPU y dispositivos embebidos dentro de simulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,0 GB) previsiblemente inferior a 1 GB.
- GPU recomendadas: no disponible; al ser un agente de RL ligero no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, se espera que quepa en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: Unity con el paquete ML-Agents (.nn), runtime ONNX (onnxruntime) y visor web de Hugging Face para modelos ML-Agents.
- Latencia y throughput estimados: no disponible.
- Inferencia en navegador: soportada a traves del visor de agentes de Hugging Face seleccionando el archivo .nn o .onnx.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Descargas/likes |
|---|---|---|---|---|---|
| Hugdir/Pyramids-PPO-RND-Success | Pyramids | PPO + RND | .nn / .onnx | no disponible | 0 / 0 |
| a1024053774/ppo-Pyramids | Pyramids | PPO | .nn / .onnx | no disponible | no disponible |
| sergey-antonov/ppo-Pyramids | Pyramids | PPO | .nn / .onnx | no disponible | no disponible |
| bhanu9prakash/ppo-Pyramid | Pyramid | PPO | .nn / .onnx | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas variantes; la diferenciacion principal del modelo de Hugdir es el uso de RND junto a PPO, mientras que las alternativas citadas son agentes PPO convencionales sobre el mismo tipo de entorno.

## Limitaciones y advertencias

- Especificidad total al entorno Pyramids: la politica no es generalizable fuera de ese escenario sin reentrenamiento.
- Ausencia de licencia declarada: no hay certeza sobre las condiciones de uso comercial o redistribucion.
- Falta de documentacion tecnica: no se publican hiperparametros, curvas de entrenamiento ni numero de pasos, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni evidencia externa de su calidad.
- Sin datos de benchmarks: no hay metricas objetivas de recompensa media, tasa de exito o estabilidad.
- Riesgo de sobreajuste al escenario concreto: no se documenta regularizacion ni variabilidad entre semillas.
- Fecha de creacion registrada como 2026-09-27: conviene verificar su coherencia antes de citarla.
- No apto para tareas generativas, de lenguaje, vision general o tool calling: su alcance se limita al control de politicas en simulacion.
- Dependencia del ecosistema ML-Agents: fuera de Unity o de un runtime ONNX compatible, el artefacto es inutilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hugdir/Pyramids-PPO-RND-Success
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de ML-Agents en Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents: https://huggingface.co/unity
- Alternativa ppo-Pyramids de a1024053774: https://huggingface.co/a1024053774/ppo-Pyramids
- Alternativa ppo-Pyramids de sergey-antonov: https://zoo.bimant.com/model/128155
- Alternativa ppo-Pyramid de bhanu9prakash: https://www.toolify.ai/ai-model/bhanu9prakash-ppo-pyramid
