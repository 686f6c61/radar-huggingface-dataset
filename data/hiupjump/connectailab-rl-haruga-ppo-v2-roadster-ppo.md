# hiupjump/connectailab-rl-haruga-ppo-v2-roadster-ppo

## Resumen

connectailab-rl-haruga-ppo-v2-roadster-ppo es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para una tarea de control continuo muy concreta: hacer que un vehículo tipo roadster que cae invertido aterrice sobre sus ruedas usando dos propulsores. Lo publica el usuario hiupjump en Hugging Face dentro del contexto del curso "AI CITY BUILDERS" y el laboratorio CONNECT AI LAB, y se corresponde con un entorno propio de Gymnasium (`로드스터연속`).

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal (pesos PyTorch) entrenada contra un simulador específico. Su relevancia es didáctica y de referencia para quien quiera reproducir un pipeline de RL con PPO en acciones continuas, no como componente de propósito general.

El autor reporta una tasa de aterrizaje del 72 % en 50 episodios no vistos. El repositorio ocupa 0,0 GB y no incluye licencia, idiomas ni documentación técnica más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (no se especifica la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (librería `pytorch`), sin detalle de ficheros |

Otros datos técnicos declarados por el autor:

| Parametro | Valor |
|---|---|
| Algoritmo | PPO |
| Entorno | `로드스터연속` (roadster continuo), Gymnasium, fichero `로드스터_시뮬레이터.py` |
| Espacio de estados | 7 dimensiones: posición x, posición y, velocidad x, velocidad y, seno de inclinación, coseno de inclinación, velocidad angular |
| Espacio de acciones | 2 continuas: intensidad del propulsor inferior (0 a 1) y giro (−1 a 1) |
| Pasos de entrenamiento | 1 000 000 |
| Entornos en paralelo | 8 |
| Clip | 0,2 |
| Gamma | 0,99 |
| GAE lambda | 0,95 |
| Learning rate | 0,0003 |
| Métrica reportada | 72 % de aterrizaje en 50 episodios no vistos |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red (número de capas, unidades, activaciones ni si hay compartición de tronco entre política y función de valor). Lo que sí se especifica es el marco de entrenamiento: PPO con clipping de 0,2, factor de descuento 0,99, GAE con lambda 0,95 y tasa de aprendizaje 0,0003, ejecutado durante 1 000 000 de pasos sobre 8 entornos paralelos del simulador `로드스터연속`.

El entorno es un problema de control continuo con observaciones de 7 dimensiones y acciones de 2 dimensiones. No se documentan detalles sobre la composición del dataset (al ser RL, la experiencia se genera por interacción con el simulador), ni sobre fases de ajuste fino, recompensas intermedias o curriculum. Tampoco se indica si hubo normalización de observaciones, reward shaping o técnicas auxiliares como decodificación especulativa (no aplicable aquí).

## Capacidades

- Control continuo de un vehículo simulado: genera acciones de propulsión (0 a 1) y giro (−1 a 1) a partir de 7 observaciones del estado.
- Estabilización y reorientación en vuelo: la política aprende a corregir la orientación usando el seno y coseno de la inclinación y la velocidad angular.
- Aterrizaje sobre ruedas desde posición invertida: es la tarea objetivo declarada, con 72 % de éxito en episodios no vistos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni uso como agente conversacional.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades de generalización más allá del entorno declarado.

## Casos de uso

- Reproducción de un pipeline de RL con PPO en acciones continuas: sirve como referencia completa (hiperparámetros, número de pasos, número de entornos) para montar un entrenamiento equivalente con Gymnasium y PyTorch.
- Docencia en cursos de refuerzo: encaja como ejemplo de política que resuelve una tarea física de aterrizaje, útil para explicar espacios de observación y acción continuos.
- Benchmark interno de simuladores: permite comparar la dificultad de distintos entornos de control físico midiendo la tasa de éxito de una política ya entrenada.
- Base para fine-tuning con otras recompensas: al ser pesos PyTorch, se puede continuar el entrenamiento con PPO sobre variantes del simulador para estudiar cambios de reward shaping.
- Pruebas de robustez de políticas: evaluar cómo degrada el 72 % de aterrizaje al modificar condiciones iniciales, ruido en observaciones o límites de acción.
- Integración en demostraciones de "AI City Builders": usar el agente como componente de una demo interactiva donde el roadster se estabiliza en tiempo real dentro del simulador.
- Estudio de estabilidad de PPO: analizar la varianza entre semillas y la sensibilidad a clip, gamma y learning rate reentrenando con los valores publicados.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es la tasa de aterrizaje del autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 72 % | 50 episodios no vistos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de RL como MuJoCo o Atari) en la información disponible. No se dispone de comparaciones con otras políticas ni de curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser una política para observaciones de 7 dimensiones y acciones de 2, el modelo es de tamaño reducido y cabe holgadamente en cualquier GPU consumer, e incluso en CPU para inferencia.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es suficiente para inferencia. Para reentrenar con 8 entornos paralelos, se recomienda una GPU de gama media o superior.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio (0,0 GB) y la dimensionalidad del problema.
- Opciones de despliegue: PyTorch nativo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con las mismas características (política PPO para el entorno `로드스터연속`). Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-haruga-ppo-v2-roadster-ppo | no disponible | no aplica | 72 % aterrizaje (50 episodios) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Específico del simulador: la política está entrenada para `로드스터연속`; no se garantiza su funcionamiento en otros entornos ni con variaciones no documentadas de la física.
- Sin licencia declarada: no se especifican términos de uso comercial ni de redistribución; conviene contactar con el autor antes de usarlo en producción.
- Sin información de arquitectura: no se detalla la topología de la red, lo que dificulta la auditoría y la reproducibilidad exacta.
- Métrica limitada: el 72 % proviene de 50 episodios, una muestra pequeña; la varianza real del rendimiento no está cuantificada.
- Sin datos de sesgos: no se documentan sesgos, pero al ser un agente de control físico, el riesgo relevante es el sobreajuste al simulador, no el sesgo lingüístico.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es generar acciones no válidas fuera del rango entrenado.
- Sin soporte multilingüe ni de lenguaje natural: no debe emplearse como modelo conversacional ni de generación de texto.
- Repositorio de 0,0 GB: conviene verificar que los pesos estén realmente incluidos y no solo la model card.

## Enlaces

- Hugging Face: https://huggingface.co/hiupjump/connectailab-rl-haruga-ppo-v2-roadster-ppo
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
