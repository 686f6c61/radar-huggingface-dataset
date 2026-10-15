# kmedicos/connectailab-rl-youngsuk-v1-teacher

## Resumen

`kmedicos/connectailab-rl-youngsuk-v1-teacher` es un modelo de decisión por aprendizaje por refuerzo, publicado por el usuario kmedicos (vinculado a Kemedicos y al programa CONNECT AI LAB), que actúa como "presidente de IA" dentro del simulador de empresa CONNECT TYCOON. No es un modelo de lenguaje generativo: es una política entrenada con PPO que, a partir de un estado estructurado del simulador, elige acciones de gestión (asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad) y devuelve la respuesta en el formato JEV de `typesafe/jev-1.13`.

El entrenamiento consta de dos fases declaradas por el autor: primero una imitación de un "presidente de reglas" (aprendizaje supervisado sobre las decisiones de una política heurística) y después un ajuste con PPO usando una recompensa derivada de los valores de la empresa (beneficio, satisfacción del cliente y evitación de riesgo, configurados a 1.0 cada uno). El modelo se distribuye con `library_name: numpy` y pipeline `reinforcement-learning`, y se consume a través del paquete `connect-tycoon` mediante `CompanyBrain.from_hub`.

Su relevancia es acotada y de carácter educativo: forma parte de una familia de modelos de la misma comunidad (variantes "teacher" y variantes basadas en Qwen3.5 con LoRA y GRPO) y sirve como ejemplo reproducible de cómo aplicar RL a decisiones empresariales sintéticas dentro de un aula. El autor advierte explícitamente de que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de negocio reales. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) con fase previa de imitación supervisada de un "presidente de reglas"; implementada con numpy, no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el modelo consume un estado estructurado del simulador (formato JEV), no una ventana de tokens |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga mediante `CompanyBrain.from_hub` del paquete `connect-tycoon`) |

## Arquitectura y entrenamiento

Se trata de una política de decisión, no de un modelo de lenguaje. La model card describe el proceso en dos etapas: un aprendizaje supervisado a partir de las decisiones de un "presidente de reglas" (el propio autor indica que "primero sigue al presidente de reglas") y un posterior ajuste con PPO ("회사의 가치로 받은 보상으로 판단을 고쳤습니다"), es decir, con recompensa derivada de los valores de la empresa. Las etiquetas del repositorio confirman el uso de PPO, *deep reinforcement learning* y Gymnasium, y el campo `prefrontal-cortex` sugiere la metáfora funcional de módulo de decisión, no una arquitectura neuronal concreta.

El entorno de entrenamiento es el simulador CONNECT TYCOON, con una configuración de empresa concreta: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. El horizonte de evaluación es de un mes simulado de 20 días laborables y los resultados publicados corresponden a la media de 40 meses no vistos durante el entrenamiento. No se especifican en la información disponible el número de tokens, el volumen de datos, la composición del dataset ni detalles del bucle de optimización (tamaño de lote, número de pasos, hiperparámetros de PPO), por lo que esos datos quedan como no disponibles.

## Capacidades

- Toma de decisiones discretas sobre estado estructurado: elige entre alternativas etiquetadas (`full`, `partial`, `deny`, `human` en el ejemplo de reembolsos) y devuelve una distribución de probabilidad y un valor de confianza.
- Gestión de operaciones simuladas de empresa: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV (`typesafe/jev-1.13`), con campos `type`, `choice`, `probabilities`, `confidence` y `reason`.
- Integración con el simulador mediante CLI (`connect-tycoon play --brain hf:...`) y mediante la API de Python (`CompanyBrain.from_hub`).
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente como coreano y sus ejemplos y razones están en coreano.
- Capacidades de texto, código, matemáticas, visión, audio, tool calling o agentes multi-paso: no disponibles; no es un modelo generativo ni un agente conversacional.
- Modo "thinking" o cadena de razonamiento explícita: no disponible; el campo `reason` del ejemplo devuelve una etiqueta fija ("강화학습 정책", política de RL) y no una justificación textual elaborada.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el modelo como política ya entrenada en el simulador CONNECT TYCOON para comparar contra el "presidente de reglas" y estudiar el efecto del ajuste con PPO en un entorno de decisión acotado.
- Laboratorio de imitación más RL: reproducir el flujo declarado (aprendizaje supervisado desde una heurística y posterior PPO) usando el notebook de Colab asociado para modificar la función de recompensa y observar cambios en el comportamiento.
- Simulación de políticas de reembolso: emplear el ejemplo de JEV sobre el departamento `refund` para estudiar cómo una política decide entre reembolso total, parcial, denegación o derivación a un humano cuando hay una puntuación de fraude asociada.
- Evaluación de compensaciones entre métricas: analizar la configuración de valores `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` y cómo variar esos pesos altera el equilibrio entre beneficio, satisfacción y siniestralidad.
- Comparación de variantes de la misma familia: contrastar esta política con las variantes `connectailab-rl-jay-v1-teacher` y `connectailab-rl-jay-v1` (esta última basada en Qwen3.5 con LoRA y GRPO) para estudiar diferencias entre una política numpy y un enfoque sobre un LLM.
- Demostración en directo del simulador: ejecutar `connect-tycoon play` en charlas o clases para mostrar el ciclo decisión-resultado en un mes simulado de 20 días laborables.
- Generación de datos sintéticos de decisión: usar las respuestas con distribuciones de probabilidad como material para estudiar calibración de confianza en decisiones discretas.
- No se recomienda su uso en producción real de gestión empresarial: el propio autor indica que es un modelo educativo y que no garantiza resultados reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. La model card sí publica una comparación en el propio simulador, sobre la media de 40 meses no vistos:

| Metrica (media de 40 meses) | Presidente de reglas | youngsuk | Variacion |
|---|---|---|---|
| Beneficio mensual | 3.240.000 KRW (324만원) | 11.150.000 KRW (1115만원) | +244% |
| Satisfaccion del cliente | 79% | 96% | +17 puntos |
| Incidentes de riesgo | 7,8 | 2,6 | -5,2 |
| Verificaciones humanas por encima del limite | 37,8 | 20,2 | -17,6 |
| Dias con producto agotado | 10,7 | 0,5 | -10,2 |

Estos valores proceden exclusivamente de la model card del autor y corresponden a una configuración concreta del simulador; no son comparables con benchmarks de modelos de lenguaje ni con métricas de negocio reales.

## Requisitos de hardware

- VRAM estimada: no disponible; al estar implementado con numpy y etiquetarse como `library_name: numpy`, cabe esperar ejecución en CPU sin requisitos de VRAM propios de una GPU, aunque el autor no lo declara explícitamente.
- GPU recomendadas: no disponible; no se documenta ninguna GPU concreta (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no disponible como dato oficial; el stack declarado (numpy) no requiere GPU.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga del modelo desde el Hub con `CompanyBrain.from_hub`, y ejecución en CLI con `connect-tycoon play --brain hf:kmedicos/connectailab-rl-youngsuk-v1-teacher`. También existe un notebook de Colab en el repositorio del simulador.
- Integración con vLLM, llama.cpp, Ollama o TGI: no aplica ni está documentada, ya que no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Metodo | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kmedicos/connectailab-rl-youngsuk-v1-teacher | Politica de decision (numpy) | Simulador CONNECT TYCOON | Imitacion de reglas + PPO | ko | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| kyoungsim/connectailab-rl-jay-v1-teacher | Politica de decision (formato jev-style) | Simulador CONNECT TYCOON | no disponible | ko | no disponible | Hugging Face |
| WonseokJayJung/connectailab-rl-jay-v1 | Modelo de lenguaje ajustado | Qwen3.5 + LoRA | GRPO | ko | Apache 2.0 | Hugging Face, 3 likes |
| Modelos de lenguaje de proposito general (por ejemplo, en el rango de 1B-8B) | LLM generativo | Transformer | SFT + RLHF/DPO | Multiples | Varias | Amplia |

La comparación directa de parametros, contexto y rendimiento con modelos de lenguaje no es posible con la informacion disponible, porque este modelo no publica numero de parametros, ventana de contexto ni resultados en benchmarks estandar. Las dos alternativas de la misma comunidad son los unicos modelos directamente comparables en tarea y formato, y de ellas solo la variante `connectailab-rl-jay-v1` declara una base tecnica concreta (Qwen3.5 con LoRA y optimizacion GRPO).

## Limitaciones y advertencias

- Ambito sintetico: el modelo se ha entrenado y evaluado sobre un simulador de empresa con una configuracion fija; no hay evidencia de que sus decisiones sean transferibles a operaciones reales.
- Advertencia explicita del autor: la model card indica que es un modelo educativo sobre un simulador sintetico y que no garantiza ni predice resultados de negocio.
- Sobreajuste al entorno: las cifras publicadas (11,15 millones de KRW de beneficio, 96% de satisfaccion) corresponden a esa configuracion concreta y no deben extrapolarse.
- Idiomas: solo coreano; no hay soporte documentado de castellano ni de otros idiomas.
- Ausencia de benchmarks estandar: no se han publicado metricas comparables con otros modelos de decision, lo que dificulta la evaluacion independiente.
- Riesgo de decision erronea en casos sensibles: el ejemplo de la propia model card muestra una probabilidad de 0,1281 de derivar un reembolso a revision humana frente a 0,8702 de concederlo, con una puntuacion de fraude de 0,3146; en un sistema real ese margen requeriria controles adicionales.
- Trazabilidad limitada: el campo `reason` del ejemplo devuelve una etiqueta generica, por lo que no hay explicacion textual de cada decision.
- Uso comercial: la licencia Apache 2.0 permite uso comercial con las condiciones habituales de atribucion y aviso de cambios, pero la propia naturaleza del modelo (simulador, fines educativos) hace desaconsejable su uso en produccion sin supervision.
- Metadatos poco fiables en cuanto a madurez: 0 descargas y 0 likes, y fechas de creacion y actualizacion de octubre de 2026 en los metadatos del Hub, sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmedicos/connectailab-rl-youngsuk-v1-teacher
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab del modelo de decision: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Kemedicos: https://kmedicos.com
- Instagram del autor: @kmedicos.kr
- Formato JEV referenciado en la model card: `typesafe/jev-1.13`
- Variante relacionada: https://huggingface.co/kyoungsim/connectailab-rl-jay-v1-teacher
- Variante relacionada basada en Qwen3.5: https://huggingface.co/WonseokJayJung/connectailab-rl-jay-v1
- Repositorio de la comunidad: https://github.com/jsunsheep/connectailab/blob/main/README.md
- Referencia aparecida en la busqueda web, no vinculada directamente a este modelo: https://openreview.net/forum?id=uU96luC4dp
