# minjunglee27/connectailab-rl-highj-v1-lunarlander

## Resumen

connectailab-rl-highj-v1-lunarlander es un agente de aprendizaje por refuerzo profundo basado en Deep Q-Network (DQN) y entrenado en el entorno Gymnasium LunarLander-v3. No es un modelo de lenguaje: recibe un estado de 8 dimensiones (posición, velocidad, inclinación, velocidad angular y contacto de cada pie) y elige una de 4 acciones discretas para aterrizar la nave.

El autor, Minjung Lee (Highj), lo presenta como una mejora sobre el baseline de un curso de CONNECT AI LAB × AI CITY BUILDERS. La contribución principal es el reward shaping (penalización de inclinación y velocidad angular, alineación con la plataforma central y bonificación por contacto seguro de ambos pies) junto con ajustes de hiperparámetros: 300.000 pasos, learning rate 0,0003, gamma 0,99, exploración 0,4, target update 500 y batch 128.

La evaluación declarada es de 267,9 puntos de recompensa media en 5 pistas de aterrizaje no vistas, por encima del umbral oficial de 200 y del baseline de 233,6. Es un artefacto pequeño y reproducible, útil para docencia y experimentación con DQN, pero sin licencia declarada ni verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP para DQN con experience replay y target network; 8 entradas → 128 → 128 → 4 salidas (ReLU) según la tabla detallada. La descripción resumida indica 8 → 128 → 4; hay discrepancia no aclarada. |
| Parámetros totales | 18.180 en la configuración 8-128-128-4 (cálculo a partir de la tabla de la model card; no se publica como cifra oficial). Si se aplica la descripción 8-128-4, serían 1.668. |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No aplica: entrada fija de 8 valores; no hay ventana de contexto textual. |
| Tipos de cuantización | No disponible; no se documentan cuantizaciones. El artefacto es un `state_dict` de PyTorch. |
| Idiomas soportados | No aplica; no es un modelo lingüístico. La documentación está principalmente en coreano. |
| Licencia | No disponible. |
| Formato de pesos | PyTorch `.pt` (`state_dict`, cargado con `torch.load`). |
| Algoritmo | DQN con experience replay y target network. |
| Entorno | Gymnasium LunarLander-v3. |
| Espacio de estados | 8 valores: posición x, posición y, velocidad x, velocidad y, ángulo, velocidad angular, contacto pie izquierdo y contacto pie derecho. |
| Espacio de acciones | 4 acciones discretas: no hacer nada, motor izquierdo, motor principal y motor derecho. |
| Framework | PyTorch. |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal totalmente conectada de tipo MLP que aproxima la función Q de DQN. La tabla detallada de la model card indica dos capas ocultas de 128 neuronas con activación ReLU y una salida de 4 acciones; el resumen inicial menciona una única capa oculta de 128. No se aclara la discrepancia en la información disponible. El entrenamiento utiliza experience replay y una target network, con 300.000 pasos totales, learning rate 0,0003, gamma 0,99, exploración 0,4, actualización de la target cada 500 pasos y batch de 128.

La innovación declarada es el reward shaping: penalizaciones por inclinación y velocidad angular, inducción a la alineación con el centro de la plataforma y bonificación por contacto seguro de ambos pies. No se documentan el tamaño del replay buffer, el optimizador, las semillas, el hardware de entrenamiento ni la composición exacta del dataset más allá del simulador. No hay RLHF ni DPO; es aprendizaje por refuerzo clásico en un entorno simulado.

## Capacidades

- Control discreto en LunarLander-v3: transforma un estado de 8 dimensiones en una de 4 acciones de aterrizaje.
- Estabilización de la nave mediante penalizaciones de inclinación y velocidad angular incorporadas en el reward shaping.
- Alineación con la plataforma central y fomento del contacto seguro de ambos pies durante el aterrizaje.
- Selección de acción determinista mediante `argmax` sobre los valores Q de salida.
- Integración en bucles de evaluación de Gymnasium para ejecutar episodios y medir recompensa acumulada.
- Inferencia muy ligera en CPU, adecuada para experimentos educativos y pruebas de concepto.
- No dispone de generación de texto, código, visión, audio, tool calling, agentes multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Docencia de DQN: cargar el `state_dict` en una MLP 8-128-128-4, ejecutar episodios en LunarLander-v3 y visualizar cómo la política aprendida estabiliza la nave. Es adecuado por su tamaño reducido y su entrenamiento documentado.
- Baseline reproducible para experimentos de reward shaping: comparar variantes de penalizaciones de inclinación, velocidad angular y alineación central contra los 267,9 puntos declarados. El modelo sirve como referencia concreta frente al baseline de 233,6.
- Estudio de hiperparámetros: reproducir la configuración de 300.000 pasos, learning rate 0,0003, gamma 0,99, exploración 0,4, target update 500 y batch 128 para analizar sensibilidad en LunarLander-v3.
- Prototipo de control en simulación: integrar la política en un bucle Gymnasium para evaluar aterrizajes automáticos en distintas semillas y pistas generadas. Es útil porque la inferencia es una MLP pequeña y no requiere infraestructura pesada.
- Prueba de pipelines de evaluación RL: usar el agente para validar herramientas de registro de recompensas, reproducción de episodios y comparación entre checkpoints. Su bajo coste computacional facilita ejecuciones repetidas.
- Demostración de inferencia en CPU o dispositivos de bajos recursos: al tener del orden de decenas de miles de parámetros, puede ejecutarse sin GPU dedicada en portátiles y entornos educativos.
- Análisis de robustez frente a estados fuera de distribución: ejecutar el agente en variantes del entorno o con perturbaciones y observar si las penalizaciones del reward shaping inducen comportamientos frágiles. Es un caso realista para estudiar generalización, siempre que se documenten los resultados.

## Benchmarks y rendimiento

| Benchmark | Entorno | Métrica | Resultado | Referencia | Verificado |
|---|---|---|---|---|---|
| LunarLander-v3 | 5 pistas de aterrizaje no vistas | Recompensa media (`mean_reward`); ≥200 se considera éxito | 267,9 | Baseline del autor: 233,6; mejora declarada: +34,3 | No; dato declarado por el autor en el model-index |
| LunarLander-v3 | Evaluación del baseline | Recompensa media | 233,6 | Referencia comparativa incluida en la model card | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje; no aplican a este artefacto. La única métrica disponible es la recompensa media declarada en LunarLander-v3, sin intervalo de confianza, varianza entre semillas ni replicación independiente.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB para los pesos en FP32 (18.180 parámetros equivalen a unos 72,7 KB), más el overhead del runtime de PyTorch. No se publica una cifra oficial de consumo.
- GPU recomendadas: ninguna GPU dedicada es necesaria. Si se fuerza CUDA, cualquier GPU compatible con PyTorch es sobrada; una RTX 4090, una RTX 3050 o una A100/H100 no aportan ventaja relevante para este tamaño.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo, y también en CPU. El modelo está pensado para ejecutarse en entornos ligeros.
- Opciones de despliegue: PyTorch junto con Gymnasium. No se documentan vLLM, llama.cpp, Ollama ni TGI; no son adecuados para este tipo de artefacto.
- Latencia y throughput: no hay cifras publicadas. Por el tamaño de la MLP, un forward por paso es muy ligero, pero no se dispone de mediciones oficiales de latencia ni de episodios por segundo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Parámetros | Entorno | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-highj-v1-lunarlander | DQN con experience replay y target network | 18.180 según la configuración 8-128-
