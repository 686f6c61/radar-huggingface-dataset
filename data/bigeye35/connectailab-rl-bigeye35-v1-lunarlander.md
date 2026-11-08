# bigeye35/connectailab-rl-bigeye35-v1-lunarlander

## Resumen

connectailab-rl-bigeye35-v1-lunarlander es un agente de aprendizaje por refuerzo entrenado con el algoritmo DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium, cuyo objetivo es que un modulo lunar aterrice de forma segura entre dos plataformas. Lo desarrolla el autor bigeye35 en el marco del programa formativo CONNECT AI LAB x AI CITY BUILDERS, dentro de su quinta leccion de IA de refuerzo. No es un modelo de lenguaje: es una red neuronal pequena que mapea un vector de estado de 8 dimensiones a una de cuatro acciones discretas.

La relevancia del modelo es fundamentalmente didactica: sirve como ejemplo reproducible de un pipeline completo de RL (definicion del entorno, red Q, entrenamiento con experiencia de repeticion y evaluacion sobre episodios no vistos). Su tamano es minimo (tres capas densas de 8 -> 128 -> 128 -> 4 neuronas) y el repositorio ocupa 0.0 GB, por lo que se ejecuta en CPU sin dificultad.

El autor declara una puntuacion media de 258.2 en 10 episodios no vistos, por encima del umbral de 200 que se considera exito en LunarLander-v3. No se trata de un modelo de proposito general ni compite con modelos fundacionales: es un artefacto de referencia para quien quiera estudiar o reutilizar una politica DQN ya entrenada para este entorno concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada (MLP) con Q-learning profundo (DQN): 8 -> 128 -> 128 -> 4, activacion ReLU |
| Parametros totales | Aproximadamente 18.000 (8x128 + 128 + 128x128 + 128 + 128x4 + 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de decision secuencial, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (pesos PyTorch en precision estandar) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`, cargado con `torch.load`) |

## Arquitectura y entrenamiento

El agente implementa un DQN clasico. La red Q es un perceptron multicapa con dos capas ocultas de 128 unidades y activacion ReLU, que recibe el vector de observacion de LunarLander-v3 (posicion x e y, velocidad x e y, angulo, velocidad angular e indicadores de contacto de las patas izquierda y derecha) y produce un valor Q para cada una de las cuatro acciones discretas: no hacer nada, encender el motor izquierdo, el motor principal o el motor derecho. La accion seleccionada en inferencia es la de mayor valor Q (`argmax`).

Segun la model card, el entrenamiento se realizo durante 200.000 pasos totales, con tasa de aprendizaje 0.0005, factor de descuento gamma 0.99, fraccion de exploracion inicial 0.3, actualizacion de la red objetivo cada 500 pasos y tamano de lote 128. Se trata de los hiperparametros tipicos de un DQN con red objetivo y experiencia de repeticion; la model card no detalla la composicion del buffer, el esquema de decaimiento de epsilon ni si se aplicaron tecnicas adicionales como Double DQN o Dueling DQN.

## Capacidades

- Control de politica para el entorno LunarLander-v3: selecciona una de cuatro acciones discretas a partir de un estado de 8 valores numericos.
- Inferencia determinista por `argmax` sobre los valores Q, adecuada para evaluacion y despliegue sin exploracion.
- Ejecucion en CPU: el modelo es lo bastante pequeno para correr sin GPU.
- Integracion directa con PyTorch y con el ecosistema Gymnasium mediante la carga de `model.pt` con `torch.load`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling ni capacidades de agente multi-paso mas alla del bucle de decision del propio entorno.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como referencia funcional en un curso o taller para ilustrar un DQN entrenado y comparar resultados con implementaciones propias.
- Linea base en experimentos de RL: servir como politica de partida contra la que medir variantes (Double DQN, PPO, SAC) sobre LunarLander-v3.
- Pruebas de infraestructura de evaluacion: validar pipelines de `gymnasium` y entornos de simulacion comprobando que se reproduce la puntuacion declarada.
- Demostraciones interactivas: integrar el agente en un cuaderno o demo web que renderice episodios de aterrizaje para divulgacion.
- Estudio de estabilidad de DQN: analizar la sensibilidad de la politica a los hiperparametros documentados (gamma, tasa de aprendizaje, frecuencia de actualizacion de la red objetivo).
- Reutilizacion como componente de control en simulaciones simplificadas de aterrizaje, siempre que el espacio de estados y acciones coincida con el de LunarLander-v3.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Entorno | Metrica | Valor | Nota |
|---|---|---|---|
| LunarLander-v3 | Recompensa media (mean_reward) | 258.2 | Media de 10 episodios no vistos; umbral de exito >= 200 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, desviacion tipica entre episodios, tasa de aterrizajes exitosos o comparacion con otras semillas).

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa menos de 1 MB de pesos y cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta compatible con PyTorch (GTX 1050, RTX 3060, A100, H100) sirve sin aprovecharse.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load`), exportacion a TorchScript u ONNX si se necesita, y ejecucion dentro de un bucle de `gymnasium`. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; con una red de este tamano la inferencia por paso es del orden de microsegundos en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Recompensa media declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-bigeye35-v1-lunarlander | LunarLander-v3 | DQN | ~18.000 | 258.2 | No disponible |
| connectailab-rl-irobtec-v1-lunarlander | LunarLander-v3 | No disponible en la informacion | No disponible | No disponible | No disponible |
| connectailab-rl-eak-v2-lunarlander | LunarLander-v3 | No disponible en la informacion | No disponible | No disponible | No disponible |

Los dos modelos alternativos pertenecen a la misma familia de ejercicios de CONNECT AI LAB sobre LunarLander-v3, pero la informacion disponible no incluye sus especificaciones ni sus resultados, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo solo es valido para LunarLander-v3; no generaliza a otros entornos ni tareas.
- La puntuacion de 258.2 procede de 10 episodios y esta marcada como no verificada (`verified: false`); la varianza entre episodios puede ser alta y no se documenta.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial ni la redistribucion sin consultar al autor.
- No hay informacion sobre sesgos, pero al ser un agente de control en un simulador fisico, su comportamiento depende por completo de la fidelidad del entorno.
- No se documentan semillas, numero de ejecuciones de entrenamiento ni curva de aprendizaje, lo que dificulta la reproducibilidad exacta.
- La model card esta redactada en coreano; la documentacion tecnica adicional es escasa.
- No debe confundirse con un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-bigeye35-v1-lunarlander
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de IA de refuerzo: https://www.aicitybuilders.com/robot
- Modelo comparable (irobtec): https://huggingface.co/irobtec/connectailab-rl-irobtec-v1-lunarlander
- Modelo comparable (K-9-labs): https://huggingface.co/K-9-labs/connectailab-rl-eak-v2-lunarlander
