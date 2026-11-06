# minjunglee27/connectailab-rl-highj-teacher

## Resumen

connectailab-rl-highj-teacher es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por minjunglee27 (Minjung Lee, conocido como Highj) dentro del proyecto CONNECT AI LAB. No es un modelo de lenguaje conversacional al uso, sino un modelo de decisión para un simulador de gestión empresarial llamado CONNECT TYCOON: recibe un estado del entorno (métricas de la empresa, transacciones, opciones disponibles) y debe seleccionar exactamente una de las opciones propuestas.

El modelo cumple el rol de "teacher baseline" o línea base docente: se entrenó a partir de una política PPO que opera el simulador por defecto, y sirve como referencia objetiva para comparar y puntuar los modelos posteriores del autor (por ejemplo, connectailab-rl-highj-v1 y v2). Su relevancia es metodológica: documenta un pipeline completo de destilación de política RL a un LLM pequeño mediante generación de un dataset de decisiones, SFT y un paso final de RL con GRPO.

El tamaño es muy reducido (0,8B parámetros en el modelo base, adaptador LoRA de tamaño despreciable en disco), lo que lo hace ejecutable en local y en entornos tipo Colab. Los idiomas declarados son coreano e inglés, la licencia es Apache 2.0 y el pipeline declarado en Hugging Face es reinforcement-learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; adaptador LoRA de tamaño no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (al ser LoRA, hereda las opciones del base: safetensors en fp16/bf16; GGUF no documentado) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El entrenamiento sigue cuatro fases descritas en la model card: (1) una política PPO pequeña se entrena en el simulador CONNECT TYCOON durante miles de meses simulados y actúa como "profesor"; (2) se construye un "cuaderno de problemas" alterando, para cada mes operado, una de las opciones de decisión y reejecutando el mes completo para puntuar cada alternativa; (3) se aplica SFT sobre la opción con mayor puntuación; (4) se aplica un paso de RL con GRPO, con normalización de ventajas por grupo y término KL contra el modelo de partida.

El dataset de decisiones se distribuye sobre empresas de tipo `general` (ajustadas a datos públicos) y contiene 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test. La innovación técnica destacable no está en la arquitectura, sino en el pipeline de destilación: convertir una política RL opaca en un dataset de elección múltiple puntuada por el propio simulador y luego ajustar un LLM pequeño para imitarla y mejorarla con GRPO.

## Capacidades

- Selección de una única opción entre un conjunto de alternativas de decisión empresarial, devolviendo solo el identificador de la opción elegida.
- Razonamiento de decisión en un dominio acotado: gestión de empresa simulada (precios, satisfacción de cliente, riesgo operativo, beneficio mensual).
- Detección de fraude en transacciones con tarjeta (FDS) dentro del entorno simulado: clasificación de transacciones como fraudulentas o legítimas.
- Seguimiento de instrucciones de sistema estrictas, incluida la instrucción de tratar el texto del estado como datos y no como instrucciones (defensa básica frente a inyección de prompt en el campo de estado).
- Capacidad multilingüe limitada a coreano e inglés.
- No se documentan tool calling, function calling, modo thinking, visión ni audio.

## Casos de uso

- Evaluación comparativa de políticas de decisión: usar este adaptador como referencia fija contra la que medir modelos posteriores del mismo simulador, con métricas de acierto (77,5%), arrepentimiento (1,90) y beneficio simulado (1.221,2 millones de KRW al mes).
- Investigación en destilación de RL a LLM: reproducir el pipeline PPO → dataset de opciones puntuadas → SFT → GRPO sobre un entorno Gymnasium propio, usando este modelo como punto de partida y su dataset como plantilla metodológica.
- Simulación de defensa antifraude (FDS): probar el comportamiento del modelo sobre transacciones etiquetadas y comparar su tasa de defensa (72,0%, 146 de 177 casos) con reglas heurísticas o modelos supervisados.
- Docencia y divulgación de reinforcement learning: el tamaño de 0,8B y la disponibilidad de un notebook de Colab permiten ejecutar el ciclo completo de entrenamiento y evaluación en recursos gratuitos.
- Prototipado de agentes de decisión en entornos de negocio: integrar el modelo como política de un agente que recibe estado estructurado y emite una acción discreta, antes de invertir en modelos mayores.
- Pruebas de robustez frente a inyección de prompt: el formato de instrucción del sistema (tratar el estado como datos) permite evaluar si un modelo pequeño respeta esa separación cuando el estado contiene texto adversario.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Defensa FDS real |
|---|---|---|---|---|
| Qwen base (sin entrenar) | 30,4% | 2,67 | No disponible | No disponible |
| SFT | 78,1% | 1,89 | No disponible | No disponible |
| connectailab-rl-highj-teacher | 77,5% | 1,90 | 1.221,2 millones de KRW | 72,0% (146/177) |

Detalle de validación del teacher baseline: satisfacción de cliente 96,84% (`sat: 0.9684`), 8,0 incidentes de riesgo al mes, y 146 de 177 transacciones fraudulentas detectadas sobre 713 transacciones reales de prueba (`saved: 0.7199`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp16 para el modelo base de 0,8B, más el adaptador LoRA (overhead mínimo). En cuantización de 8 bits, aproximadamente 1 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090); para entrenamiento del adaptador, 8-16 GB son suficientes.
- Cabe holgadamente en GPU consumer y en CPU, y se puede ejecutar en Google Colab gratuito (el autor publica un notebook específico).
- Opciones de despliegue: transformers + peft (ruta documentada en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador, aunque el modelo base Qwen3.5-0.8B puede servirse con esas herramientas y cargar el adaptador cuando la herramienta lo soporte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-teacher | 0,8B (LoRA) | No disponible | 77,5% acierto, 72,0% FDS | Apache 2.0 | Hugging Face |
| connectailab-rl-highj-v1 | No disponible | No disponible | Beneficio mensual de 3,62 millones de KRW (según la model card del autor) | No disponible en esta ficha | Hugging Face |
| connectailab-rl-highj-v2 | No disponible | No disponible | Defensa del 70,6% de la pérdida por fraude | No disponible en esta ficha | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | 30,4% acierto en la tarea | No disponible en esta ficha | Hugging Face |

No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona bien sobre el estado y las opciones del simulador CONNECT TYCOON; fuera de ese formato la salida carece de garantías.
- El objetivo declarado es ser línea base docente, no un modelo de producción; su uso previsto es evaluación y comparación interna.
- Riesgo de alucinación de identificadores de opción: si el estado o las opciones no siguen el formato esperado, el modelo puede devolver una opción inexistente.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está evaluado.
- El resultado de FDS (72,0%) se midió sobre 713 transacciones de prueba del propio proyecto, no sobre un conjunto público independiente; la generalización a tráfico real no está validada.
- Sesgos: no se documentan análisis de sesgo; el dataset se describe como "general" ajustado a datos públicos, sin más detalle sobre composición demográfica o geográfica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Longitud de contexto no documentada; no se recomienda su uso con estados largos sin validación previa.
- El repositorio tiene 0,0 GB y 155 descargas en el momento de la consulta; el soporte de la comunidad es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjunglee27/connectailab-rl-highj-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo relacionado connectailab-rl-highj-v1: https://huggingface.co/minjunglee27/connectailab-rl-highj-v1
- Modelo relacionado connectailab-rl-highj-v2: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2
