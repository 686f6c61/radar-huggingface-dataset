# minjunglee27/connectailab-rl-highj-v2

## Resumen

connectailab-rl-highj-v2 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Minjung Lee (Highj) en el marco de CONNECT AI LAB. No es un modelo de lenguaje de propósito general, sino un modelo de decisión autónoma orientado a la gestión empresarial simulada y a la detección de fraude en pagos (FDS, Fraud Detection System). Se entrena a partir de trayectorias de decisión destiladas de una política maestra obtenida mediante PPO en el simulador CONNECT TYCOON, que alcanzó un beneficio neto mensual de 11,76 millones de KRW.

El modelo resuelve el problema de convertir un agente de refuerzo tabular/secuencial en un modelo de lenguaje capaz de razonar sobre decisiones discretas de negocio: fijación de precios, asignación de personal, gestión de riesgo y aceptación o rechazo de transacciones. La versión v2 mejora sobre v1 en beneficio mensual simulado (+87,5 %, hasta 6,79 millones de KRW), satisfacción del cliente (97,0 %) y reducción de incidentes de riesgo (−25,7 %), además de duplicar la capacidad de defensa ante fraude real (70,6 % de pérdidas evitadas frente a 37,3 % en v1).

Con solo 0,8 mil millones de parámetros en el modelo base y un adaptador LoRA de tamaño muy reducido (repo de 0,0 GB), es relevante para quienes buscan desplegar agentes de decisión en local con requisitos de hardware mínimos, aunque su alcance está acotado al dominio del simulador y a tareas de clasificación de riesgo en fintech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA. El pipeline de entrenamiento tiene cuatro fases: (1) entrenamiento por refuerzo con PPO en el simulador CONNECT TYCOON para obtener una política maestra (v2-teacher) con 11,76 millones de KRW de beneficio mensual; (2) generación de un "cuaderno de problemas" mediante rollouts del profesor con variación de opciones en cada punto de decisión y puntuación de las trayectorias futuras; (3) ajuste supervisado (SFT) para que el modelo imite las opciones de mayor puntuación; y (4) refinamiento por RL/DPO usando diferencias de recompensa estandarizadas entre conjuntos de opciones, reforzando decisiones con mayor rentabilidad y estabilidad a largo plazo.

El conjunto de datos de decisión se distribuye en 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general` basada en datos públicos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus textual ni si hubo fases adicionales de alineación más allá del DPO descrito.

## Capacidades

- Toma de decisiones de negocio en entornos simulados: selección entre opciones discretas de gestión (precios, personal, inversión, riesgo).
- Razonamiento multi-paso orientado a objetivos de rentabilidad, satisfacción del cliente y control de incidentes.
- Detección de fraude en transacciones de tarjeta (FDS) con clasificación de riesgo y decisión de bloqueo.
- Soporte de agentes autónomos en bucles de decisión tipo Gymnasium (entorno CONNECT TYCOON).
- Capacidades multilingües limitadas a coreano e inglés.
- Formato de adaptador PEFT compatible con el ecosistema HuggingFace Transformers.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Simulación de gestión empresarial: el modelo actúa como agente decisor dentro del simulador CONNECT TYCOON, eligiendo acciones mes a mes para maximizar beneficio, satisfacción y control de riesgo; es adecuado porque fue entrenado exactamente sobre ese entorno y su política maestra alcanza 11,76 millones de KRW mensuales.
- Detección de fraude en pagos (FDS): clasificación de transacciones sospechosas con una tasa de defensa del 70,6 % sobre 713 transacciones reales de test (145 de 177 fraudes detectados); útil como capa de scoring previa a reglas deterministas en fintech.
- Investigación en aprendizaje por refuerzo aplicado a LLM: sirve como caso de estudio de destilación de políticas PPO a modelos de lenguaje mediante SFT + DPO, con métricas de recompensa y regret publicadas.
- Generación de datos sintéticos de decisión: el modelo puede producir trayectorias etiquetadas para aumentar datasets de entrenamiento de otros agentes en dominios de negocio simulados.
- Evaluación comparativa de agentes: al tener un profesor de referencia y métricas de regret (1,83), permite medir la brecha entre políticas aprendidas y óptimas en experimentos académicos.
- Despliegue local en entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,8 B, puede ejecutarse en CPU o GPU de gama baja para prototipos de agentes de decisión sin conexión a la nube.
- Pruebas de robustez en ciberseguridad financiera: evaluación de la resistencia del modelo ante transacciones adversariales en un entorno controlado antes de integrarlo en sistemas productivos.

## Benchmarks y rendimiento

| Modelo | Precisión en test | Regret (menor es mejor) | Beneficio mensual simulado | Defensa de fraude real |
|---|---|---|---|---|
| Qwen base (sin entrenar) | 35,0 % | 2,40 | no disponible | no disponible |
| SFT | 78,5 % | 1,79 | no disponible | no disponible |
| connectailab-rl-highj-v2 | 75,1 % | 1,83 | 6,79 M KRW | 70,6 % (145/177) |

Métricas adicionales de v2 en simulación de dos meses: satisfacción del cliente del 97,0 % (`sat: 0.9695`) y 13,0 incidentes de riesgo al mes (frente a 17,5 en v1). La política maestra (v2-teacher) alcanza 11,76 M KRW mensuales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B ocupa aproximadamente 1,6 GB en FP16 y alrededor de 0,5-0,8 GB en cuantización de 4 bits; el adaptador LoRA añade una sobrecarga marginal no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia cómoda. Para despliegues de mayor concurrencia, A100 o H100 son innecesarias por tamaño, pero válidas.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU para prototipos.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador sobre Qwen3.5-0.8B), llama.cpp u Ollama si se fusiona el adaptador y se convierte a GGUF, y vLLM/TGI tras fusionar los pesos LoRA en el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-v2 | 0,8 B (LoRA) | no disponible | Decisión de negocio y FDS | Apache 2.0 | HuggingFace |
| connectailab-rl-highj-v1 | 0,8 B (LoRA) | no disponible | Decisión de negocio y FDS | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | LLM general | Apache 2.0 | HuggingFace |
| connectailab-rl-highj-v2-teacher | no disponible | no disponible | Política PPO maestra | no disponible | HuggingFace |

La comparación más directa es con su versión anterior v1, que lograba 3,62 M KRW mensuales y un 37,3 % de defensa de fraude, frente a 6,79 M KRW y 70,6 % en v2. No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo se entrena en un entorno simulado y no está pensado para aplicarse directamente en entornos empresariales reales sin validación adicional.
- Riesgo de alucinación en la generación de justificaciones o decisiones fuera de la distribución del simulador; el modelo está especializado en opciones discretas, no en texto libre general.
- Cobertura lingüística limitada a coreano e inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- La evaluación de FDS se realiza sobre 713 transacciones y 177 fraudes, una muestra pequeña que puede no generalizar a otros dominios de pago o regiones.
- El modelo hereda los sesgos del simulador CONNECT TYCOON y de los datos públicos usados para la distribución `general` de empresas.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3.5-0.8B, cuyos términos deben verificarse por separado.
- El repositorio tiene un tamaño de 0,0 GB y 118 descargas, lo que sugiere un artefacto de investigación con poca validación externa; conviene revisar el código de carga antes de integrarlo en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión anterior v1: https://huggingface.co/minjunglee27/connectailab-rl-highj-v1
- Política maestra v2-teacher: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo relacionado LINK-01 goto: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
- Modelo relacionado LINK-01 choose: https://huggingface.co/minjunglee27/connectailab-rl-highj-choose-v1-link01
- Modelo relacionado LINK-01 avoid: https://huggingface.co/minjunglee27/connectailab-rl-highj-avoid-v1-link01
