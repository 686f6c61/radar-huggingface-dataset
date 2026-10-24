# lucaskim72/connectailab-rl-lucasbrain-v1-lunarlander

## Resumen

`connectailab-rl-lucasbrain-v1-lunarlander` es un agente de aprendizaje por refuerzo entrenado con DQN (Deep Q-Network) para aterrizar el módulo lunar del entorno LunarLander-v3 de Gymnasium. Lo ha desarrollado lucaskim72 (Lucasbrain) como material de la quinta lección de IA de refuerzo de CONNECT AI LAB, en colaboración con AI CITY BUILDERS. No se trata de un modelo de lenguaje: recibe un vector de estado de 8 dimensiones y devuelve una de 4 acciones discretas de control.

Su red es un perceptrón multicapa 8 → 128 → 128 → 4 con activaciones ReLU, entrenada durante 200.000 pasos con tasa de aprendizaje 0,0005 y factor de descuento 0,99. El autor declara una recompensa media de 233,6 puntos en 10 episodios no vistos, por encima del umbral de 200 que se considera éxito en este entorno. Con unos 18.180 parámetros y un peso de apenas decenas de KB, es un modelo mínimo, útil como ejemplo educativo reproducible y como baseline ligero para experimentación en RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) tipo DQN: 8 → 128 → 128 → 4 con ReLU |
| Parámetros totales | ≈18.180 (calculados a partir de la arquitectura declarada; no figura en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (agente de RL; entrada vectorial de estado de 8 dimensiones) |
| Tipos de cuantización | No disponible (pesos estándar de PyTorch, sin cuantización documentada) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt, archivo `model.pt`); tamaño del repositorio 0,0 GB según Hugging Face |

## Arquitectura y entrenamiento

El modelo implementa DQN clásico: una red neuronal que aproxima la función de valor Q(s, a) y selecciona la acción con mayor Q-value mediante `argmax`. El estado de entrada son 8 valores continuos del simulador: posición x e y, velocidades x e y, ángulo de inclinación, velocidad angular y contacto de las patas izquierda y derecha. La salida son 4 acciones discretas: no hacer nada, encender el motor izquierdo, el motor central o el derecho.

Los hiperparámetros declarados en la model card son: 200.000 pasos de entrenamiento, 128 neuronas ocultas por capa, tasa de aprendizaje 0,0005, factor de descuento (gamma) 0,99, exploración 0,3 (probablemente la fracción de decaimiento de epsilon), actualización de la red objetivo cada 500 pasos y tamaño de batch 128. No se documenta si emplea variantes de estabilización como Double DQN o dueling DQN, ni el tamaño del replay buffer. El entrenamiento se realizó íntegramente sobre LunarLander-v3 de Gymnasium.

## Capacidades

- Aterrizar el módulo lunar en LunarLander-v3 seleccionando entre 4 acciones discretas de propulsión.
- Inferencia greedy determinista: dado un estado de 8 dimensiones, devuelve la acción con mayor Q-value.
- Ejecución íntegramente en CPU con PyTorch, sin necesidad de GPU ni aceleradores.
- Descarga del peso directo desde Hugging Face mediante `hf_hub_download` y carga con `load_state_dict`.
- No dispone de capacidades de lenguaje natural, visión, tool calling, razonamiento multi-paso ni multilingüismo: no es un LLM y no debe evaluarse como tal.

## Casos de uso

- **Docencia de aprendizaje por refuerzo**: ejemplo completo y de tamaño mínimo para explicar DQN en clase (aproximación de Q-function, red objetivo, exploración epsilon), con hiperparámetros y resultado declarados abiertamente.
- **Baseline para comparar algoritmos en LunarLander-v3**: su recompensa declarada de 233,6 sirve de referencia para comparar implementaciones propias de PPO, Double DQN o métodos actor-critic sobre el mismo entorno.
- **Punto de partida para experimentación**: los pesos publicados permiten continuar el entrenamiento, aplicar variantes (Double DQN, dueling, prioritized replay) o realizar estudios de ablation sin empezar de cero.
- **Demostraciones interactivas y talleres**: el repositorio incluye un vídeo de replay (`replay.mp4`) y el modelo puede ejecutarse en directo sobre Gymnasium para visualizar aterrizajes en eventos educativos.
- **Referencia de patrón de control**: sirve como plantilla simplificada de política de control para problemas con estado vectorial continuo y acciones discretas, con la salvedad de que la política solo es válida dentro de su simulador.
- **Prueba de pipelines de despliegue ligero**: al pesar solo decenas de KB, es idóneo para validar flujos de descarga, versionado y carga de modelos sin coste computacional.
- **Material de curso estructurado**: forma parte del temario público de CONNECT AI LAB y AI CITY BUILDERS, útil como caso de estudio guiado en bootcamps.

## Benchmarks y rendimiento

Resultado declarado por el autor en la model card (no verificado por terceros):

| Benchmark | Métrica | Resultado | Verificación |
|---|---|---|---|
| LunarLander-v3 | Recompensa media en 10 episodios no vistos (200 o más = éxito) | 233,6 | No verificada (declarada por el autor) |

No se han publicado resultados comparativos con otros agentes ni desviaciones estándar en la información disponible.

## Requisitos de hardware

- **VRAM**: no se requiere GPU; el modelo (≈18.180 parámetros, unos 73 KB en fp32 calculados a partir de la arquitectura) se ejecuta íntegramente en CPU con un consumo de memoria despreciable.
- **GPU recomendadas**: ninguna. Solo sería relevante una GPU si se retomara el entrenamiento, y en ese caso cualquier GPU de consumo sobrada.
- **Hardware de consumo**: funciona en cualquier portátil o sobremesa con Python y PyTorch instalados; no necesita GPU dedicada.
- **Despliegue**: PyTorch puro con el snippet de la model card y `huggingface_hub` para descargar `model.pt`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje. Para reproducir el entorno de evaluación se necesita Gymnasium con el backend Box2D.
- **Latencia y throughput**: no hay mediciones publicadas; una pasada hacia adelante por una MLP de dos capas de 128 neuronas se ejecuta en microsegundos en una CPU moderna, lo que permite simular miles de pasos por segundo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Resultado declarado | Licencia |
|---|---|---|---|---|
| connectailab-rl-lucasbrain-v1-lunarlander (este modelo) | DQN | LunarLander-v3 | 233,6 (media en 10 episodios) | No disponible |
| connectailab-rl-lucasbrain-v2 (mismo autor) | PPO | No disponible | No disponible | Apache-2.0 |
| connectailab-rl-lucas-v1-lunarlander (mismo autor) | No disponible | LunarLander (presumible) | No disponible | No disponible |
| Narasimha1997/LunarLander-rl | Q-Learning | LunarLander (OpenAI Gym) | No disponible | No disponible |
| rl-lunar-lander (jlinnnn) | DQN | LunarLander-v2 | Resuelto en 534 episodios de entrenamiento | No disponible |

Entre los modelos del mismo autor, la versión v2 usa PPO en lugar de DQN y sí declara licencia Apache-2.0, lo que la hace más clara para reutilización. No hay datos de recompensa comparables publicados en la información disponible.

## Limitaciones y advertencias

- **Resultado no verificado**: la recompensa de 233,6 es una declaración del autor sin verificación de terceros, sin semillas publicadas y evaluada solo en 10 episodios, sin desviación estándar ni intervalos de confianza.
- **Sin licencia declarada**: no es posible determinar las condiciones de uso comercial o redistribución; constituye un riesgo jurídico hasta que el autor publique una licencia.
- **Especialización extrema**: la política solo es válida para LunarLander-v3; no transfiere a otros entornos ni a sistemas reales sin reentrenamiento completo.
- **DQN clásico sin garantías documentadas**: no se indica el uso de Double DQN ni otras técnicas anti-sobreestimación de Q-values, y la política greedy determinista puede fallar en estados iniciales atípicos.
- **No es un modelo de lenguaje**: carece de capacidades de texto, visión, herramientas o agentes; no debe incluirse en comparativas de LLMs.
- **Proyecto educativo sin tracción**: 0 descargas y 0 likes en el momento de redactar la ficha; el mantenimiento y la corrección de errores no están garantizados.
- **Dependencias del entorno**: reproducir la evaluación requiere Gymnasium con Box2D (swig/box2d-py), cuya instalación puede dar problemas en algunos sistemas operativos.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v1-lunarlander
- Modelos relacionados del mismo autor:
  - connectailab-rl-lucasbrain-v2: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v2
  - connectailab-rl-lucas-v1-lunarlander: https://huggingface.co/lucaskim72/connectailab-rl-lucas-v1-lunarlander
- Repositorio de CONNECT AI LAB en GitHub: https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, módulo de IA de refuerzo: https://www.aicitybuilders.com/robot
- Referencias externas sobre RL en Lunar Lander:
  - Deep Q-Learning — Lunar Lander (caso de estudio): https://jlinnnn.github.io/rl-lunar-lander/
  - Narasimha1997/LunarLander-rl (GitHub): https://github.com/Narasimha1997/LunarLander-rl
  - smileynet/lunar_lander_rl (GitHub): https://github.com/smileynet/lunar_lander_rl/
