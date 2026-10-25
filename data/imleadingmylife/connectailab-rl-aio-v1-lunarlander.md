# imleadingmylife/connectailab-rl-aio-v1-lunarlander

## Resumen
`connectailab-rl-aio-v1-lunarlander` es un agente de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario `imleadingmylife`, desarrollado en el marco de una colaboración entre CONNECT AI LAB y AI CITY BUILDERS (programa de formación en IA para robótica). No es un modelo de lenguaje: es una política entrenada con Deep Q-Network (DQN) para resolver el entorno `LunarLander-v3` de Gymnasium, en el que un módulo debe aterrizar suavemente sobre una plataforma entre dos banderas controlando tres motores.

El modelo resuelve un problema clásico de control continuo discretizado: recibe un vector de 8 observaciones (posición x e y, velocidades x e y, ángulo, velocidad angular y contacto de cada una de las dos patas) y emite una de 4 acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho). Su relevancia es fundamentalmente didáctica y de referencia: es un ejemplo mínimo, reproducible y de tamaño ínfimo de un pipeline completo de RL (entrenamiento, evaluación y publicación en el Hub), útil como línea base y como material docente.

La arquitectura es un perceptrón multicapa de tres capas (8 → 128 → 128 → 4) con activaciones ReLU, entrenado durante 200.000 pasos. El autor declara una recompensa media de 215,6 en 10 episodios no vistos, por encima del umbral de 200 que Gymnasium considera "resuelto", aunque el resultado no está verificado de forma independiente. El repositorio no incluye licencia ni información de idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de 3 capas fully-connected con ReLU, entrenado como Deep Q-Network (DQN) |
| Parametros totales | 18.180 (calculado a partir de la arquitectura declarada 8 → 128 → 128 → 4: 1.152 + 16.512 + 516) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (agente RL; entrada fija de 8 valores de estado, sin memoria de secuencia) |
| Tipos de cuantizacion | No disponible (el autor solo publica `model.pt`; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` serializado en `model.pt` (cargable con `torch.load`) |

## Arquitectura y entrenamiento
La red es un MLP convencional: capa de entrada de 8 unidades, dos capas ocultas de 128 neuronas con activación ReLU y capa de salida de 4 unidades que aproxima el valor Q de cada acción discreta. El agente sigue el esquema DQN estándar, con una red objetivo actualizada cada 500 pasos y una política de exploración ε con un periodo de exploración declarado de 0,3. Los hiperparámetros publicados son: 200.000 pasos totales de entrenamiento, tasa de aprendizaje 0,0005, factor de descuento γ = 0,99 y tamaño de lote 128. No se especifica el optimizador, el tamaño del buffer de repetición, el decaimiento de ε ni el número de semillas empleadas.

No se documenta ninguna innovación técnica adicional: no hay Double DQN, dueling, prioritized experience replay, distribución categórica de valores ni redes recurrentes. Tampoco se describe la composición del dataset (en RL, las trayectorias se generan por interacción con el simulador) ni procesos de RLHF/DPO, que no aplican a este dominio. El repositorio incluye un vídeo `replay.mp4` con una partida, pero no se aportan curvas de aprendizaje,ablationes ni código de entrenamiento, lo que limita la reproducibilidad.

## Capacidades
- Control de política discreta en `LunarLander-v3`: selecciona una de 4 acciones a partir de 8 observaciones numéricas.
- Aterrizaje autónomo del módulo lunar en el simulador, con una recompensa media declarada de 215,6 en episodios no vistos.
- Inferencia determinista por `argmax` sobre los valores Q, sin muestreo estocástico (el código de ejemplo de la model card usa `argmax`).
- Ejecución en CPU sin dependencias de GPU: el `state_dict` es de unos 72,7 KB en precisión de 32 bits.
- Integración directa con el bucle de Gymnasium (`env.step(action)`) mediante `hf_hub_download` y `load_state_dict`.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües: fuera de su entorno, el modelo no tiene ninguna funcionalidad.

## Casos de uso
- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y ejecutable de un DQN en un entorno clásico, desde la descarga de pesos hasta el bucle de evaluación, con una arquitectura lo bastante pequeña para inspeccionarla capa a capa en clase.
- Línea base en experimentos de RL: al ser un DQN plano de 200.000 pasos, permite medir la mejora de variantes como Double DQN, dueling o prioritized replay bajo el mismo protocolo de evaluación (recompensa media en 10 episodios nuevos).
- Prueba de regresión en pipelines de CI: un script que cargue los pesos, ejecute N episodios con semillas fijas y compare la recompensa media contra 215,6 detecta roturas en la API de Gymnasium o cambios de versión del entorno antes de desplegar.
- Demostración embebida o en navegador: con 18.180 parámetros, el forward pass se puede reimplementar en JavaScript o C y ejecutar en un microcontrolador o en el cliente web, útil para exhibiciones y ferias tecnológicas sin backend.
- Comparación de coste/rendimiento en entornos con presupuesto de cómputo mínimo: sirve para ilustrar cuánto rendimiento se obtiene con un modelo de menos de 100 KB frente a políticas más grandes en el mismo benchmark.
- Material de partida para transferencia a otros entornos de control discreto de baja dimensionalidad (CartPole, Acrobot, MountainCar), reentrenando la misma topología 8→128→128→4 adaptada a la dimensionalidad de observación y acción.
- Verificación de tooling de Hugging Face Hub para artefactos no lingüísticos: prueba de que un `state_dict` de PyTorch se publica, descarga y carga correctamente con la librería `huggingface_hub`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Aprendizaje por refuerzo | LunarLander-v3 | Recompensa media en 10 episodios no vistos (≥ 200 = éxito) | 215,6 | No |

No se han publicado en la información disponible resultados adicionales (curvas de aprendizaje, desviación típica entre episodios, número de semillas, comparación con otras políticas). El valor de 215,6 supera el umbral de 200 que se cita como criterio de resolución del entorno, pero al tratarse de una única media sobre 10 episodios y sin intervalo de confianza, la robustez del resultado no puede evaluarse.

## Requisitos de hardware
- VRAM: no requiere GPU. Los pesos ocupan aproximadamente 72,7 KB en fp32 (18.180 parámetros × 4 bytes); la inferencia cabe holgadamente en memoria RAM.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; tarjetas como RTX 4090, A100 o H100 no aportan ventaja apreciable por el tamaño ínfimo de la red y el coste de lanzamiento de kernels.
- Cabe en cualquier GPU de consumo y en hardware embebido; también en el navegador si se reimplementa el forward pass o se exporta a ONNX (la exportación no está incluida en el repositorio y requeriría trabajo propio).
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `load_state_dict`), envoltorio propio sobre Gymnasium, o exportación manual a ONNX/TorchScript. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se han publicado medidas. Por el tamaño (aproximadamente 36.000 operaciones multiply-accumulate por paso), la inferencia en CPU debería situarse en el orden de microsegundos por acción; esta cifra es una estimación derivada de la arquitectura, no una medición del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entorno | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|---|
| connectailab-rl-aio-v1-lunarlander | DQN (MLP 8→128→128→4) | 18.180 | LunarLander-v3 | No aplica | No disponible | 215,6 de recompensa media (no verificado) | Hugging Face, `model.pt` |
| DQN de referencia de Stable-Baselines3 | DQN (MLP) | Configurable (por defecto, red de 64×64) | LunarLander-v3 y otros | No aplica | MIT (librería) | No disponible en la información proporcionada | Código y pesos entrenables localmente |
| PPO de referencia de Stable-Baselines3 | Policy gradient (MLP) | Configurable | LunarLander-v3 y otros | No aplica | MIT (librería) | No disponible en la información proporcionada | Código y pesos entrenables localmente |
| A2C de referencia de Stable-Baselines3 | Actor-critic (MLP) | Configurable | LunarLander-v3 y otros | No aplica | MIT (librería) | No disponible en la información proporcionada | Código y pesos entrenables localmente |

La comparación es necesariamente cualitativa: las alternativas citadas son implementaciones de referencia de uso común para `LunarLander-v3`, pero no se dispone de sus puntuaciones en la información proporcionada, por lo que no es posible establecer una comparación numérica rigurosa.

## Limitaciones y advertencias
- Licencia no especificada: sin términos legales explícitos, el uso comercial o la redistribución de los pesos queda en una zona de incertidumbre jurídica y requiere contactar con el autor.
- Resultado no verificado: la recompensa de 215,6 procede únicamente de la model card, con 10 episodios y sin desviación típica ni semillas documentadas; la varianza en LunarLander es alta y el margen sobre el umbral de 200 es estrecho.
- Especialización total: el modelo solo funciona en `LunarLander-v3`. Fuera de ese entorno no tiene capacidades transferibles sin reentrenamiento.
- Dependencia del preprocesado: las 8 observaciones deben pasarse en el mismo orden y escala que en el entrenamiento (posición x, posición y, velocidad x, velocidad y, ángulo, velocidad angular, contacto pata izquierda, contacto pata derecha); cualquier normalización adicional altera las acciones.
- Sesgo de entrenamiento desconocido: no se documentan semillas, número de ejecuciones ni distribución de estados visitados, por lo que no se puede evaluar la estabilidad de la política en configuraciones iniciales atípicas.
- Sin información sobre alucinación, sesgos sociales o multilingüismo: no aplica, pero conviene advertir que el modelo no procesa texto y no debe presentarse como un modelo de lenguaje.
- Repositorio mínimo: 0 descargas y 0 likes en el momento de la consulta, sin código de entrenamiento ni evaluación; la reproducibilidad depende de reimplementar el bucle DQN a partir de los hiperparámetros de la model card.
- Documentación mayoritariamente en coreano: la model card usa tablas y nombres de métricas en coreano, lo que puede dificultar la auditoría a lectores no familiarizados con el idioma.
- Sin soporte técnico ni mantenimiento declarado: la fecha de actualización (25 de octubre de 2026) es la única referencia de vigencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/imleadingmylife/connectailab-rl-aio-v1-lunarlander
- CONNECT AI LAB (repositorio del autor): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, programa de IA y robótica: https://www.aicitybuilders.com/robot
- Entorno Gymnasium `LunarLander-v3` (referencia del benchmark): no disponible en la información proporcionada
- Paper o informe técnico: no disponible
- Demo interactiva: no disponible (el repositorio solo incluye `replay.mp4`)
