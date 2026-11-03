# K-9-labs/connectailab-rl-eak-v1-lunarlander

## Resumen

connectailab-rl-eak-v1-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium. Lo desarrolla K-9-labs en el marco de una colaboracion entre CONNECT AI LAB y AI CITY BUILDERS, y forma parte de una serie de modelos didacticos de un curso de refuerzo (etiquetado como "강화학습 AI 5강", quinta leccion de IA de refuerzo). El objetivo es aterrizar la nave del simulador controlando los motores izquierdo, central y derecho.

No es un modelo de lenguaje ni un transformer: se trata de una red neuronal fully-connected de tres capas (8 entradas, dos capas ocultas de 128 neuronas con activacion ReLU y 4 salidas correspondientes a las acciones discretas del entorno). El repositorio es de tamano 0.0 GB y contiene presumiblemente un unico fichero de pesos `model.pt` junto con un video de replay. No emplea atencion, tokenizacion ni contexto textual.

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline DQN completo sobre un entorno clasico de control, y como referencia educativa para quienes siguen el curso. No esta pensado para uso en produccion ni para tareas generales de IA. La model card esta redactada en coreano y declara un rendimiento medio de 215.6 de recompensa en 10 episodios no vistos, por encima del umbral de 200 que el propio autor fija como criterio de exito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) de 3 capas: 8 → 128 → 128 → 4, activacion ReLU, entrenada con DQN |
| Parametros totales | 18 692 (calculado a partir de las dimensiones de capa declaradas: 8·128+128 + 128·128+128 + 128·4+4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con estado de 8 valores numericos) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision nativa, presumiblemente float32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, cargable con `torch.load` y `state_dict`) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa minimo: entrada de 8 dimensiones (posicion x e y, velocidad x e y, angulo, velocidad angular, contacto de pata izquierda y contacto de pata derecha), dos capas ocultas de 128 neuronas con ReLU y una capa de salida de 4 logits, uno por accion (no hacer nada, motor izquierdo, motor central, motor derecho). La politica se extrae tomando el `argmax` sobre la salida de la red, lo que corresponde a un DQN en modo explotacion puro.

Los hiperparametros declarados en la model card son: 200 000 pasos totales de entrenamiento, tamano de capa oculta 128, tasa de aprendizaje 0.0005, factor de descuento gamma 0.99, fraccion de exploracion 0.3, frecuencia de actualizacion de la red objetivo de 500 pasos y tamano de batch 128. No se especifica la composicion del buffer de repeticion, la politica epsilon (lineal o exponencial), el optimizador (habitualmente Adam en este tipo de implementaciones) ni si se aplico Double DQN o Dueling DQN. Tampoco se documenta el numero exacto de episodios de entrenamiento ni la semilla utilizada. No hay fases de RLHF, DPO ni ajuste supervisado: es un entrenamiento puramente por refuerzo sobre recompensa del entorno.

## Capacidades

- Control de politica discreta sobre el entorno LunarLander-v3: selecciona una de cuatro acciones a partir de un vector de estado de 8 valores.
- Aterrizaje de la nave en el simulador con recompensa media declarada de 215.6 en 10 episodios no vistos.
- Inferencia determinista por `argmax` sobre los Q-valores, sin muestreo estocastico.
- Carga directa en PyTorch mediante `state_dict` y ejecucion en CPU o GPU sin dependencias adicionales.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso en el sentido de planificacion simbolica; su "razonamiento" se limita a la politica aprendida en un unico entorno.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo "thinking" ni de cadena de razonamiento explicita.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como resultado final de un ejercicio guiado de DQN, permitiendo al alumnado comparar su propia implementacion con una referencia funcional que supera el umbral de 200 de recompensa.
- Verificacion de pipelines de evaluacion: al estar entrenado sobre LunarLander-v3, se puede usar como baseline fijo para comprobar que un entorno Gymnasium, una version de PyTorch y un script de evaluacion funcionan correctamente antes de entrenar agentes propios.
- Reproduccion de experimentos: los hiperparametros declarados (200 000 pasos, lr 0.0005, gamma 0.99, target update 500, batch 128) permiten replicar el entrenamiento y estudiar la varianza entre semillas.
- Demostracion de despliegue de agentes en PyTorch: el snippet de la model card muestra como cargar pesos desde Hugging Face Hub y ejecutar inferencia en CPU, util para prototipos de integracion en aplicaciones de simulacion.
- Benchmark de entornos de control continuo-discreto: sirve como punto de comparacion frente a otros algoritmos (PPO, A2C, SAC con acciones discretas) en la misma tarea, aunque solo con un unico resultado declarado.
- Material audiovisual para clases: el fichero `replay.mp4` incluido en el repositorio permite mostrar visualmente el comportamiento de la politica aprendida sin necesidad de ejecutar el entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v3 | mean_reward (media de 10 episodios no vistos; ≥200 = exito segun el autor) | 215.6 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se aportan curvas de aprendizaje, desviacion tipica entre episodios ni comparacion con otras semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (18 692 parametros, unos 75 KB), mas el overhead del runtime de PyTorch (habitualmente 200-500 MB de memoria de proceso).
- GPU recomendadas: cualquiera; el modelo cabe en cualquier GPU moderna e incluso en GPUs integradas. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) y tambien en CPU pura.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportacion a TorchScript u ONNX si se desea, o conversion manual a NumPy para inferencia sin PyTorch. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial. Por el tamano de la red (tres multiplicaciones matriciales de 128x128 como maximo), la inferencia por paso deberia situarse en el orden de microsegundos en GPU y decenas de microsegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-eak-v1-lunarlander | DQN (MLP) | 18 692 | LunarLander-v3 | 215.6 (media de 10 episodios) | no disponible | Hugging Face |
| Agentes DQN de referencia de Stable-Baselines3 | DQN (MLP) | ~18 000-20 000 (segun configuracion) | LunarLander-v2/v3 | no disponible en esta ficha | MIT (SB3) | GitHub / pip |
| Agentes PPO de referencia de Stable-Baselines3 | PPO (MLP) | ~18 000-20 000 | LunarLander-v2/v3 | no disponible en esta ficha | MIT (SB3) | GitHub / pip |
| CleanRL DQN (single-file) | DQN (MLP) | ~18 000-20 000 | LunarLander-v2 | no disponible en esta ficha | MIT | GitHub |

La comparacion se limita a implementaciones de referencia de la misma tarea; no se dispone de resultados numericos publicados de esos agentes en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa rigurosa. La principal diferencia de este modelo es su caracter de artefacto cerrado y didactico, frente a las librerias reutilizables con licencia permisiva.

## Limitaciones y advertencias

- Especificidad total al entorno: la politica solo es valida para LunarLander-v3 con la misma parametrizacion de observacion (8 valores). No generaliza a otros entornos ni a variantes con observaciones alteradas.
- Resultado no verificado: la recompensa de 215.6 figura con `verified: false` en el model-index y se basa en solo 10 episodios, una muestra pequena con alta varianza potencial.
- Sin informacion de licencia: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso productivo.
- Sin documentacion de sesgos ni de robustez: no se han publicado analisis de sensibilidad a perturbaciones del estado, ni evaluacion con semillas distintas, ni curvas de aprendizaje.
- Riesgo de sobreajuste al entorno de entrenamiento: al no documentarse el numero de episodios ni la semilla, no se puede descartar que el resultado dependa de una unica ejecucion favorable.
- Idiomas y documentacion: la model card esta en coreano, lo que puede dificultar su adopcion por parte de equipos que no lo lean; no hay traduccion oficial.
- No apto para produccion general: no procesa lenguaje, no soporta herramientas ni agentes, y su unico proposito es demostrativo/educativo.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de comunidad y de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-9-labs/connectailab-rl-eak-v1-lunarlander
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- Curso AI CITY BUILDERS (refuerzo): https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 (Gymnasium): no disponible en la informacion proporcionada
- Paper original de DQN (Mnih et al., 2015): no disponible en la informacion proporcionada
