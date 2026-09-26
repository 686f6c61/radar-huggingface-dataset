# habeebllah77/rl-phd-prep-01-cartpole-fixed-baseline

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo (RL) entrenada con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno clasico `CartPole-v1` de Gymnasium, usando la implementacion de Stable-Baselines3. No se trata de un modelo de lenguaje: es un agente de control que aprende a mantener un pendulo invertido sobre un carro aplicando fuerzas discretas (izquierda o derecha). El autor lo publica como baseline de parametros fijos dentro de un estudio comparativo sobre domain randomisation, es decir, un experimento que mide como se degrada la politica cuando cambian las constantes fisicas del entorno respecto a las del entrenamiento.

El interes tecnico esta en su comportamiento de generalizacion: el agente alcanza recompensa maxima (500/500) en el entorno de entrenamiento y se mantiene estable ante variaciones moderadas de masa del carro, masa del pendulo y longitud del pendulo. Sin embargo, cuando la longitud del pendulo supera aproximadamente 0.9, el rendimiento se desploma. El autor reporta que, promediando 3 semillas entrenadas de forma independiente, la recompensa media cae de 500 a 340.5 con longitud 0.9 y a 35.9 con longitud 1.1.

Se publica como material de investigacion y docencia, no como componente de produccion. El repositorio tiene 0 descargas y 0 likes en el momento del analisis, y su tamano es practicamente nulo (0.0 GB), coherente con una red de politica muy pequena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MlpPolicy de Stable-Baselines3 (perceptron multicapa) para PPO; numero de capas y unidades no especificado en la informacion disponible |
| Parametros totales | no disponible (no especificado; se trata de una red de politica minúscula para observacion de 4 dimensiones y 2 acciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | MIT segun la model card del autor; los metadatos de HuggingFace indican "no disponible" (discrepancia entre ambas fuentes) |
| Formato de pesos | `.zip` (formato de guardado de Stable-Baselines3, cargable con `PPO.load`) |

## Arquitectura y entrenamiento

El agente usa el algoritmo PPO con una `MlpPolicy` de Stable-Baselines3 sobre PyTorch como backend. La observacion del entorno `CartPole-v1` tiene 4 dimensiones (posicion del carro, velocidad del carro, angulo del pendulo y velocidad angular) y el espacio de acciones es discreto con 2 valores. El entrenamiento se realizo durante 200.000 timesteps con los hiperparametros por defecto de PPO en Stable-Baselines3: `learning_rate=3e-4`, `n_steps=2048`, `batch_size=64`, `n_epochs=10`, `gamma=0.99`, `gae_lambda=0.95` y `clip_range=0.2`.

La particularidad del experimento es que el entorno no usa randomisation alguna: a lo largo de todo el entrenamiento se mantienen las constantes fisicas por defecto de `CartPole-v1` (masa del carro 1.0, masa del pendulo 0.1, longitud del pendulo 0.5). No se documenta el uso de RLHF, DPO ni ninguna otra etapa de ajuste, ni innovaciones como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo. El autor menciona un modelo companero entrenado con domain randomisation, pensado como contraparte del baseline, pero no proporciona enlace en la informacion disponible.

## Capacidades

- Control de un pendulo invertido en `CartPole-v1`: aprende una politica de acciones discretas (izquierda/derecha) que mantiene el pendulo en equilibrio.
- Rendimiento de referencia: alcanza 500/500 de recompensa en el entorno de entrenamiento.
- Generalizacion moderada: mantiene un rendimiento aceptable ante variaciones moderadas de masa del carro, masa del pendulo y longitud del pendulo.
- Reproducibilidad experimental: sirve como baseline fijo para comparar contra agentes con domain randomisation.
- Carga sencilla en Python mediante Stable-Baselines3 (`PPO.load("ppo_fixed.zip")`).
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision ni de audio.

## Casos de uso

- Baseline de investigacion en RL: usar este agente como punto de comparacion fijo frente a politicas entrenadas con domain randomisation, midiendo la caida de recompensa cuando las constantes fisicas se desvian.
- Estudio de robustez y generalizacion: evaluar sistematicamente el agente barriendo masa del carro, masa del pendulo y longitud del pendulo para reproducir la curva de degradacion reportada (500 a 340.5 y 35.9).
- Docencia de aprendizaje por refuerzo: ejemplo minimo y reproducible de PPO con hiperparametros por defecto, adecuado para explicar el ciclo entrenamiento-evaluacion en un entorno de control clasico.
- Punto de partida para fine-tuning: servir como inicializacion para entrenar variantes con randomisation sin partir de cero, dada la facilidad de carga con `PPO.load`.
- Validacion de pipelines de RL: comprobar la infraestructura de entrenamiento y evaluacion (Gymnasium, Stable-Baselines3, registro de metricas) con un experimento de coste computacional minimo.
- Analisis de sensibilidad a semillas: al haberse entrenado 3 semillas independientes, permite estudiar la varianza entre ejecuciones en un entorno sencillo.
- Material de replicacion: contrastar resultados con el `RESEARCH_REPORT.md` del repositorio de codigo del autor, metodologia y graficas incluidas.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles proceden de la model card del autor y corresponden a recompensa media sobre 3 semillas entrenadas de forma independiente, variando la longitud del pendulo respecto al valor de entrenamiento (0.5).

| Longitud del pendulo | Recompensa media (3 semillas) | Contexto |
|---|---|---|
| 0.5 (entrenamiento) | 500 / 500 | Entorno de entrenamiento sin variacion |
| 0.9 | 340.5 | Degradacion notable; el autor indica que el rendimiento "se desploma" |
| 1.1 | 35.9 | Practicamente fallo de la politica |

El autor afirma que el modelo companero entrenado con domain randomisation se mantiene en el maximo (500) hasta longitud 1.1 bajo el mismo test, pero no aporta cifras adicionales ni enlace en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; la red de politica es minuscula y no requiere GPU.
- GPU recomendadas: ninguna imprescindible. Ejecucion viable en CPU.
- Cabe en GPU de consumo: si, de hecho no necesita GPU de consumo; funciona en CPU estandar.
- Opciones de despliegue: carga con Stable-Baselines3 (`PPO.load`) sobre PyTorch, evaluacion con entornos Gymnasium. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas de modelos de lenguaje.
- Latencia y throughput: no disponible (no se publican mediciones).
- Espacio en disco: repositorio de 0.0 GB, coherente con un fichero `.zip` de pesos muy pequeno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (PPO, CartPole-v1, parametros fijos) | no disponible (red de politica minima) | no aplica | 500/500 en entrenamiento; 340.5 a longitud 0.9; 35.9 a longitud 1.1 | MIT (segun model card) | Publicado en HuggingFace, 0 descargas |
| Modelo companero con domain randomisation | no disponible | no aplica | 500 mantenido hasta longitud 1.1 (segun el autor) | no disponible | Enlace no disponible en la informacion proporcionada |
| Otros agentes PPO sobre CartPole-v1 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa contra alternativas publicadas concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta ninguna tarea de NLP.
- Degradacion severa fuera de distribucion: la politica falla cuando la longitud del pendulo supera aproximadamente 0.9, pese a ser solo un 80 por ciento mayor que el valor de entrenamiento.
- Entrenamiento sin domain randomisation: la ausencia de variacion en las constantes fisicas durante el entrenamiento explica su fragilidad ante cambios del entorno.
- Uso previsto restringido: el propio autor lo declara como material de investigacion y docencia, y explicitamente no apto para produccion.
- Licencia inconsistente: la model card indica MIT, pero los metadatos de HuggingFace muestran "no disponible"; conviene confirmar la licencia antes de cualquier uso comercial.
- Sesgos conocidos: no disponible (no aplica el concepto de sesgo de datos tal como se entiende en modelos de lenguaje, aunque la politica puede heredar sesgos del entorno de entrenamiento).
- Riesgo de alucinacion: no aplica.
- Limitaciones de idioma: no aplica.
- Metadatos limitados: 0 descargas, 0 likes y ausencia de enlaces a codigo, informe completo o modelo companero en la informacion disponible, lo que dificulta la validacion independiente.
- Reproducibilidad: dependiente de la version de Stable-Baselines3, PyTorch y Gymnasium empleadas, no especificadas en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/habeebllah77/rl-phd-prep-01-cartpole-fixed-baseline
- Modelo companero (domain randomisation): no disponible (el autor indica "link once pushed")
- Codigo / informe completo del experimento: no disponible (el autor indica "GitHub link", sin URL concreta)
- Stable-Baselines3 (libreria): no disponible en la informacion proporcionada
- Documentacion de CartPole-v1 (Gymnasium): no disponible en la informacion proporcionada
