# seyunprobiz/connectailab-rl-seyun-kim-v1-lunarlander

## Resumen

`connectailab-rl-seyun-kim-v1-lunarlander` es una política de aprendizaje por refuerzo entrenada con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el usuario `seyunprobiz` en el marco de CONNECT AI LAB y AI CITY BUILDERS, como material del curso de refuerzo de dicha formación. No es un modelo de lenguaje: es una red neuronal pequeña que recibe un vector de 8 números reales (posición, velocidad, inclinación, velocidad angular y contacto de cada pierna) y devuelve una de cuatro acciones discretas (no hacer nada, motor izquierdo, motor central, motor derecho).

Se trata de un perceptrón multicapa (MLP) de tres capas densas con activaciones ReLU: 8 entradas → 128 → 128 → 4 salidas, lo que suma 18.180 parámetros. El autor declara una puntuación media de 215,6 en 10 episodios no vistos, por encima del umbral de 200 que el propio entorno considera éxito. Es relevante ahora únicamente como pieza didáctica y como referencia reproducible de un DQN mínimo, no como componente de producción.

El valor práctico de la ficha está en su trazabilidad: se conocen los hiperparámetros de entrenamiento (200.000 pasos, lr 0,0005, gamma 0,99, batch 128, actualización de red objetivo cada 500 pasos, periodo de exploración 0,3) y el peso entrenado está disponible como `model.pt`. Falta, en cambio, licencia, código de entrenamiento y semillas, lo que limita su reutilización seria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado (perceptrón multicapa) con ReLU, usado como aproximador de Q-values en DQN: 8 → 128 → 128 → 4 |
| Parametros totales | 18.180 (calculado a partir de la arquitectura declarada: 1.152 + 16.512 + 516) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el agente no tiene contexto textual; su entrada es un vector de estado de 8 dimensiones por paso |
| Tipos de cuantizacion | no disponible (no se declaran; por tamaño, la cuantización es irrelevante) |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | `model.pt` (state_dict de PyTorch serializado con `torch.save`) |
| Entorno de entrenamiento | Gymnasium `LunarLander-v3` (espacio de estados `Box(8)`, espacio de acciones `Discrete(4)`) |
| Framework | PyTorch |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red es un aproximador de función Q con tres capas densas y activación ReLU entre ellas. La capa de salida tiene 4 neuronas, una por acción discreta del entorno; la acción se selecciona con `argmax` sobre la salida, sin capa softmax ni política estocástica. El estado de entrada son 8 escalares: posición x e y, velocidad x e y, ángulo, velocidad angular y dos indicadores binarios de contacto de las piernas izquierda y derecha.

Los hiperparámetros declarados por el autor son: 200.000 pasos totales de entrenamiento, 128 unidades ocultas, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, periodo de exploración 0,3, actualización de la red objetivo cada 500 pasos y tamaño de batch 128. La model card no detalla la composición del replay buffer, el esquema de decaimiento de epsilon, la función de pérdida concreta (MSE/Huber), el optimizador ni el número de semillas ejecutadas. No se documenta ninguna innovación técnica adicional (por ejemplo Double DQN, dueling heads o prioritised replay): el autor presenta el resultado como un DQN directo, por lo que debe asumirse la formulación canónica salvo evidencia en contra.

No hay información sobre datos de entrenamiento en el sentido habitual, ya que el modelo aprende por interacción con el simulador; no se ha aplicado RLHF, DPO ni ajuste supervisado.

## Capacidades

- Control de política discreta en `LunarLander-v3`: selecciona una de cuatro acciones a partir de un estado numérico de 8 dimensiones.
- Inferencia puramente feed-forward: una pasada hacia delante por paso, sin estado recurrente ni memoria entre pasos.
- Ejecución en CPU sin dependencias de GPU; el grafo se reconstruye con `nn.Sequential` y se cargan los pesos con `load_state_dict`.
- Integración con Gymnasium: el bucle estándar `reset`/`step` es suficiente para explotar la política de forma greedy.
- Reproducibilidad parcial: los pesos finales están publicados y la arquitectura es explícita, de modo que la reconstrucción del modelo es exacta.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio, ni generación de texto. No tiene capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y mínimo de un DQN funcional (18.180 parámetros) para explicar aproximación de Q-values, política greedy y evaluación sobre episodios no vistos en un curso introductorio.
- Baseline de comparación en `LunarLander-v3`: con una puntuación declarada de 215,6 se puede usar como referencia contra la que medir PPO, A2C, SAC u otras variantes sobre el mismo entorno y presupuesto de pasos.
- Prueba de humo de pipelines de RL: al ser un `state_dict` de PyTorch de menos de 100 KB, es útil para validar que un entorno de evaluación, un cargador de checkpoints o un servicio de inferencia funcionan antes de escalar a políticas mayores.
- Test de integración en CI: se puede congelar como caso de regresión que compruebe que una versión nueva de PyTorch o de Gymnasium sigue produciendo la misma acción para un estado fijo.
- Generación de trayectorias para imitation learning: la política entrenada puede actuar como profesor que produce pares (estado, acción) y recompensas para entrenar después un clon supervisado o un modelo de dinámica.
- Demostración interactiva o embebida: por su tamaño, es viable exportarlo a TorchScript u ONNX y ejecutarlo en el navegador o en dispositivos de baja potencia para visualizar el aterrizaje; la exportación no está incluida en el repositorio y habría que hacerla.
- Análisis de robustez: permite estudiar cómo degrada una política DQN ante ruido en las observaciones o cambios de distribución, siempre que se añada el código de instrumentación, que no se publica.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. No están verificados de forma independiente (`verified: false`).

| Benchmark | Metrica | Resultado | Referencia | Verificado |
|---|---|---|---|---|
| LunarLander-v3 | Recompensa media en 10 episodios no vistos | 215,6 | Umbral de éxito del entorno: 200 | No |
| MMLU, HumanEval, GSM8K u otros | no aplica | no disponible | no disponible | No |

No se publican desviación típica, número de semillas, percentiles ni curva de aprendizaje, por lo que el 215,6 es un único punto de medida sobre 10 episodios.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Los pesos en fp32 ocupan aproximadamente 72,7 KB (18.180 parámetros × 4 bytes); el estado de activaciones es despreciable.
- GPU recomendadas: ninguna. El modelo está pensado para CPU y no se beneficia de aceleración por hardware.
- Cabe en cualquier GPU consumer, en iGPU y en placas tipo Raspberry Pi; también en el hilo principal de un navegador si se exporta a WebAssembly/ONNX.
- Opciones de despliegue: PyTorch en modo eager (única vía documentada por el autor), o exportación a TorchScript/ONNX mediante trabajo adicional no incluido en el repositorio. vLLM, TGI, llama.cpp u Ollama no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado medidas. Por la topología (tres multiplicaciones matriciales de como máximo 128×128) se espera un coste por paso del orden de microsegundos en CPU monohilo, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-seyun-kim-v1-lunarlander | DQN, MLP 8-128-128-4 | 18.180 | LunarLander-v3 | 215,6 de recompensa media en 10 episodios (no verificado) | no disponible | Pesos `model.pt` en HuggingFace; sin código de entrenamiento |
| DQN de referencia (Mnih et al., 2015) | DQN con CNN | no disponible | Atari 2600 | no comparable (otro entorno) | artículo académico | Implementaciones públicas múltiples |
| DQN de Stable-Baselines3 | DQN con MLP configurable | depende de la configuración | LunarLander-v3 y otros | no disponible en esta ficha | MIT (la librería) | Código y documentación públicos |
| PPO de Stable-Baselines3 | PPO con MLP configurable | depende de la configuración | LunarLander-v3 y otros | no disponible en esta ficha | MIT (la librería) | Código y documentación públicos |

La comparación cuantitativa directa no es posible con la información disponible: no se han recogido aquí resultados de las alternativas sobre `LunarLander-v3` con el mismo presupuesto de pasos ni las mismas semillas.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explícito de uso comercial, modificación ni redistribución. En producción esto es un bloqueante hasta que el autor lo aclare por escrito.
- Métrica no verificada y con pocas muestras: 215,6 corresponde a 10 episodios, sin desviación típica ni número de semillas; la varianza de LunarLander es alta y el margen sobre el umbral de 200 es estrecho.
- Sesgo de entorno: la política está ajustada a la dinámica y a la escala de observaciones de `LunarLander-v3`; no generaliza a otras versiones del entorno, a perturbaciones físicas ni a otros juegos sin reentrenamiento.
- Sin código de entrenamiento ni semillas: no se puede reproducir el resultado ni auditar el bucle de aprendizaje, el replay buffer o el esquema de exploración.
- Riesgo de sobreajuste no evaluado: el autor informa de episodios "no vistos", pero no detalla cómo se separaron de los de entrenamiento ni si hubo selección de checkpoint sobre ellos.
- Sin capacidades de lenguaje, visión ni tool calling: cualquier caso de uso conversacional o multimodal queda fuera del alcance del modelo.
- Entrada frágil: la política espera exactamente 8 escalares en el orden y la escala que produce `LunarLander-v3`; un preprocesado distinto invalida las acciones.
- Artefactos incompletos: la model card menciona `replay.mp4`, pero el tamaño del repositorio es de 0,0 GB y no se documenta el contenido exacto; conviene verificar qué ficheros están realmente disponibles antes de depender de ellos.
- Idiomas no aplicables, por lo que no procede evaluar sesgos lingüísticos; los sesgos relevantes serían los del propio simulador, no los del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seyunprobiz/connectailab-rl-seyun-kim-v1-lunarlander
- CONNECT AI LAB (repositorio del autor): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de refuerzo: https://www.aicitybuilders.com/robot
- Artículo original de DQN, Mnih et al., 2015 (referencia del algoritmo, no enlazado por el autor): no disponible en la información proporcionada
- Paper, blog o demo oficial del modelo: no disponible
