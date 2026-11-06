# leegoheun/connectailab-rl-leegoheun-v1-lunarlander

## Resumen

`connectailab-rl-leegoheun-v1-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el autor `leegoheun` en Hugging Face como parte de la iniciativa CONNECT AI LAB × AI CITY BUILDERS, en el contexto de un curso de reinforcement learning. No es un modelo de lenguaje: es una política neuronal que mapea un vector de estado de 8 dimensiones a una de 4 acciones discretas.

El modelo resuelve el problema clásico de control continuo discretizado: aterrizar una nave en una plataforma entre dos banderas, penalizando el consumo de combustible y los impactos. La red es un perceptrón multicapa muy pequeño (8 → 128 → 128 → 4 con activaciones ReLU), entrenado con 200 000 pasos de entorno, lo que lo convierte en un artefacto ligero y reproducible para experimentación docente.

Su relevancia es principalmente didáctica y de reproducibilidad: sirve como referencia mínima de un agente DQN funcional que supera el umbral de éxito (200 puntos) con una puntuación media de 215,6 en 10 episodios no vistos. No compite con modelos generativos ni con agentes RL de gran escala; su valor está en ser un ejemplo compacto, inspeccionable y desplegable en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) como aproximador de Q-valores para DQN |
| Parametros totales | Aproximadamente 18 564 (8×128 + 128 + 128×128 + 128 + 128×4 + 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. Entrada de 8 valores escalares por paso |
| Tipos de cuantizacion | No disponible; pesos en `model.pt` (PyTorch) |
| Idiomas soportados | No disponible; no procesa lenguaje |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (state dict de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal fully connected de tres capas: entrada de 8 dimensiones (posición x e y, velocidad x e y, inclinación, velocidad angular, contacto de pata izquierda y derecha), dos capas ocultas de 128 unidades con ReLU y una capa de salida de 4 unidades correspondientes a las acciones (no hacer nada, motor izquierdo, motor central, motor derecho). El agente selecciona la acción mediante `argmax` sobre los Q-valores predichos, sin política estocástica en inferencia.

El entrenamiento sigue el esquema DQN clásico con los hiperparámetros declarados por el autor: 200 000 pasos totales, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fracción de exploración 0,3 y actualización de la red objetivo cada 500 pasos, con tamaño de lote 128. No se documentan detalles sobre la composición del buffer de repetición, el tipo de exploración (epsilon-greedy u otra) ni si se aplicaron técnicas adicionales como Double DQN o prioritized replay. Tampoco se especifica el número de tokens de entrenamiento, al no tratarse de un modelo de lenguaje.

## Capacidades

- Control de política discreta en el entorno `LunarLander-v3`: selecciona una de 4 acciones a partir de 8 observaciones escalares.
- Inferencia determinista por `argmax` sobre Q-valores, apta para evaluación reproducible.
- Entrenamiento DQN con red objetivo y exploración configurada.
- Carga sencilla en PyTorch mediante `hf_hub_download` y `load_state_dict`.
- Ejecución en CPU sin requisitos de GPU.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No dispone de capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo canónico de DQN funcional en un curso introductorio, comparando hiperparámetros y curvas de recompensa con variantes propias.
- Reproducción de experimentos: servir de línea base para estudiar sensibilidad a la tasa de aprendizaje, gamma o frecuencia de actualización de la red objetivo en `LunarLander-v3`.
- Pruebas de integración de Gymnasium: validar pipelines de entorno, wrappers y monitorización de episodios con un agente que ya supera el umbral de éxito.
- Demostraciones en vídeo o presentaciones: el repositorio incluye `replay.mp4`, útil para ilustrar visualmente el comportamiento aprendido sin necesidad de reentrenar.
- Benchmarking de infraestructura RL: al ser un modelo minúsculo, permite medir latencia de inferencia y throughput de episodios en distintos entornos de ejecución (CPU, contenedores, edge).
- Comparación entre participantes de un programa formativo: junto con otros modelos de la misma familia (por ejemplo, `irobtec` o `Mike9`), permite contrastar estrategias de entrenamiento sobre el mismo entorno.
- Punto de partida para extensiones: reutilizar el state dict como inicialización en variantes con Double DQN, dueling architecture o n-step returns.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Recompensa media en 10 episodios no vistos | LunarLander-v3 | 215,6 (umbral de éxito: 200) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa unos pocos kilobytes en memoria y se ejecuta en CPU.
- GPU recomendadas: innecesarias; cualquier CPU moderna es suficiente. Para entrenamiento, una GPU consumer basica acelera el proceso, pero no es requisito.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`), exportacion a TorchScript u ONNX para servir en entornos sin dependencia de Python, o integracion directa en un bucle de Gymnasium.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano de la red (tres capas densas), la inferencia por paso deberia situarse en el orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Recompensa media | Licencia |
|---|---|---|---|---|---|
| `leegoheun/connectailab-rl-leegoheun-v1-lunarlander` | LunarLander-v3 | DQN | ~18,5 K | 215,6 | No disponible |
| `irobtec/connectailab-rl-irobtec-v1-lunarlander` | LunarLander-v3 | No disponible | No disponible | No disponible | No disponible |
| `Mike9/connectailab-rl-ai-oasis-v1-lunarlander` | LunarLander-v3 | No disponible | No disponible | No disponible | No disponible |

Los tres modelos pertenecen a la misma familia de ejercicios de CONNECT AI LAB y comparten entorno y objetivo; la comparacion detallada de hiperparametros y resultados no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica en el sentido de sesgos linguisticos, pero la politica puede mostrar comportamientos suboptimos en estados poco representados durante el entrenamiento.
- Riesgo de alucinacion: no aplica; el modelo no genera texto.
- Limitaciones de contexto o idioma: no procesa lenguaje ni contexto largo; su dominio esta restringido a `LunarLander-v3` con observaciones de 8 dimensiones.
- Restricciones de licencia: la licencia no esta declarada, por lo que el uso comercial queda en una situacion de incertidumbre juridica hasta que el autor la explicite.
- Resultado no verificado: la puntuacion de 215,6 procede de la model card y esta marcada como `verified: false`; conviene reproducirla de forma independiente antes de citarla como referencia.
- Ausencia de informacion sobre reproducibilidad: no se detallan semillas, versiones de librerias ni codigo de entrenamiento, lo que dificulta replicar exactamente el resultado.
- Transferencia limitada: el agente no generaliza a otros entornos ni a variaciones de `LunarLander-v3` sin reentrenamiento.
- Caveat de produccion: no es un componente apto para sistemas de produccion con requisitos de robustez; su uso recomendado es educativo y experimental.

## Enlaces

- Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-leegoheun-v1-lunarlander
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Modelo comparable `irobtec`: https://huggingface.co/irobtec/connectailab-rl-irobtec-v1-lunarlander
- Modelo comparable `Mike9`: https://huggingface.co/Mike9/connectailab-rl-ai-oasis-v1-lunarlander
