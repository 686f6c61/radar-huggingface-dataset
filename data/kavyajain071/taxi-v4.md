# kavyaJain071/Taxi-v4

## Resumen

Taxi-v4 es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementación personalizada de Q-Learning que aprende una tabla de valores Q para el entorno discreto Taxi, donde un taxi debe recoger pasajeros y dejarlos en su destino en una cuadrícula de 5x5 con 500 estados posibles. Lo publica el usuario kavyaJain071 en Hugging Face como artefacto de entrenamiento.

El modelo se distribuye como un fichero `q-learning.pkl` que contiene la tabla Q y metadatos del entorno, y se carga mediante `load_from_hub` del ecosistema Stable-Baselines3 / Hugging Face. Su relevancia es didáctica y experimental: sirve como referencia de un agente Q-Learning funcional sobre un entorno clásico de RL, útil para comparar algoritmos, depurar pipelines de RL y reproducir resultados.

No hay información pública sobre arquitectura de red, datos de entrenamiento, hiperparámetros detallados ni licencia. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q, sin red neuronal) |
| Parametros totales | no disponible (tabla Q sobre 500 estados y 6 acciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entorno Taxi-v4 con 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en pickle) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning, un algoritmo de aprendizaje por refuerzo off-policy y model-free basado en la ecuacion de Bellman: Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]. El entorno Taxi-v4 de Gymnasium tiene 500 estados discretos (25 posiciones del taxi, 5 posiciones de pasajero y 4 destinos) y 6 acciones (moverse en cuatro direcciones, recoger pasajero y dejar pasajero). La tabla Q resultante es de tamano 500x6.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la tasa de aprendizaje α, el factor de descuento γ, la politica de exploracion (ε-greedy y su decaimiento), ni si se emplearon tecnicas como Dyna-Q o double Q-Learning. La model card indica que es una "custom-implementation", pero no detalla diferencias respecto a la implementacion de referencia de Stable-Baselines3. No hay datos sobre composicion del dataset ni sobre RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Resolucion del entorno Taxi-v4 mediante politica greedy derivada de la tabla Q.
- Aprendizaje tabular off-policy con actualizacion de valores Q por transicion.
- Carga del agente desde Hugging Face mediante `load_from_hub` con el fichero `q-learning.pkl`.
- Integracion con Gymnasium: el fichero incluye `env_id` para reconstruir el entorno con `gym.make`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step fuera del bucle episodico del entorno Taxi.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.
- No es un modelo de proposito general: su alcance se limita al entorno Taxi-v4.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular para explicar la ecuacion de Bellman, la exploracion ε-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Reproduccion de resultados: cargar `q-learning.pkl` con `load_from_hub` y evaluar la politica greedy para verificar el `mean_reward` declarado de 7.50 ± 2.76.
- Baseline de comparacion: enfrentar este agente contra implementaciones de SARSA, Dyna-Q o Deep Q-Network sobre Taxi-v4 para medir diferencias de rendimiento y estabilidad.
- Depuracion de pipelines de RL: validar el flujo de entrenamiento, serializacion a pickle y publicacion en Hugging Face antes de escalar a entornos mas complejos.
- Analisis de hiperparametros: reentrenar o inspeccionar la tabla Q para estudiar el efecto de α, γ y la politica de exploracion en la recompensa media.
- Prototipado de agentes discretos: servir como plantilla para construir agentes Q-Learning sobre otros entornos discretos de Gymnasium con estructura similar.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| Taxi-v4 | mean_reward | 7.50 +/- 2.76 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de comparacion con SARSA, DQN ni otros agentes sobre Taxi-v4.

## Requisitos de hardware

- VRAM estimada: despreciable; la tabla Q es de 500x6 valores y el fichero pickle ocupa menos de 1 MB.
- GPU recomendadas: no aplica; el entrenamiento e inferencia de Q-Learning tabular se ejecutan en CPU.
- Cabe en cualquier GPU consumer y tambien en CPU sin requisitos relevantes.
- Opciones de despliegue: Python con Gymnasium y `load_from_hub` del ecosistema Hugging Face / Stable-Baselines3; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una busqueda en tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kavyaJain071/Taxi-v4 | Q-Learning tabular | Taxi-v4 | Tabla Q 500x6 | no aplica | no disponible | Hugging Face |
| EverVissionAI/q-Taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible | no aplica | no disponible | Hugging Face |
| eoringe/taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible | no aplica | no disponible | Hugging Face |

Los tres artefactos son agentes Q-Learning sobre Taxi-v4 publicados en Hugging Face; no se dispone de datos de rendimiento de los comparadores para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Alcance muy restringido: solo funciona en Taxi-v4; no generaliza a otros entornos ni a tareas de lenguaje.
- Rendimiento declarado no verificable: `mean_reward` de 7.50 ± 2.76 marcado como `verified: false`, con alta varianza relativa (desviacion tipica de 2.76).
- Sin licencia declarada: no hay base legal explicita para uso comercial o redistribucion; conviene contactar al autor antes de reutilizarlo.
- Sin informacion de hiperparametros ni de procedimiento de entrenamiento, lo que impide reproducir el resultado con fidelidad.
- Q-Learning tabular es sensible a la politica de exploracion y a la tasa de aprendizaje; sin documentacion, el ajuste fino queda a ciegas.
- El fichero pickle implica riesgo de deserializacion insegura; cargar solo desde fuentes de confianza.
- Sin datos de sesgos, alucinacion o limitaciones de idioma por no ser un modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/kavyaJain071/Taxi-v4
- Comparador EverVissionAI/q-Taxi-v4: https://huggingface.co/EverVissionAI/q-Taxi-v4
- Ficha indexada de eoringe/taxi-v4: https://essamamdani.com/ai-models/hf-eoringe-taxi-v4
