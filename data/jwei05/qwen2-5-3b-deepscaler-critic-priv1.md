# JWei05/qwen2.5-3b-deepscaler-critic-priv1

## Resumen

`JWei05/qwen2.5-3b-deepscaler-critic-priv1` es un crítico de valor escalar (scalar value critic) para entrenamiento por refuerzo, desarrollado por el usuario JWei05 y publicado bajo licencia Apache 2.0. No es un modelo generativo ni un asistente conversacional: se trata de un artefacto de investigación que estima el valor de un estado dentro de un bucle de RL, construido sobre el backbone denso Qwen2.5-3B (3.085.940.737 parámetros) al que se añade una cabeza lineal escalar de valor.

El modelo forma parte de un estudio comparativo de horizonte corto entre GRPO y PPO dentro del framework SkyRL, y se define como "privileged critic" (priv1): condiciona su estimación de valor sobre la respuesta de referencia y la solución (`prompt_mode=answer_and_solution`), es decir, consume información de la respuesta correcta que un crítico no privilegiado no tendría. Fue entrenado offline sobre rollouts del dataset DeepScaleR easy10k (`deepscaler_critic_pretrain_priv1_easy10k`) y se integra como `CRITIC_PATH` en el flujo de entrenamiento PPO (`ALGO=ppo`, `PRIVILEGED_CRITIC=1`) de SkyRL.

Su relevancia es acotada y muy específica: sirve como componente de infraestructura para experimentos de RL en tareas de razonamiento matemático, no como modelo de propósito general. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen2.5-3B) con cabeza escalar de valor |
| Parametros totales | 3.085.940.737 (~3,09 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el backbone Qwen2.5-3B soporta hasta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre rollouts de matematicas, presumiblemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `value_head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen2.5-3B, un transformer decoder denso, al que se le acopla una cabeza escalar de valor (`value_head.safetensors`, con su propio `value_head_config.json`). En lugar de emitir logits sobre un vocabulario, el modelo produce un escalar que representa el valor estimado del estado, que es el componente que PPO necesita para calcular ventajas. El repositorio incluye además un fichero `skyrl_critic_config.json` que define el "contrato" del crítico en SkyRL (schema 3), con asignación de crédito por cadena de acciones (action-chain credit), factor de descuento gamma igual a 1 y el contrato de prompt asociado.

El entrenamiento se realizó de forma offline sobre rollouts del dataset DeepScaleR easy10k, no mediante RLHF ni DPO. La variante `priv1` es un crítico privilegiado: su contrato de prompt (`prompt_mode=answer_and_solution`) le entrega la respuesta de referencia y la solución junto al estado, lo que en la práctica le permite emitir estimaciones de valor más informadas que un crítico estándar. Esta decisión de diseño es coherente con un estudio metodológico cuyo objetivo es medir la diferencia entre GRPO y PPO en horizonte corto, y no con un despliegue en producción. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la propia cabeza de valor y del contrato de SkyRL.

## Capacidades

- Estimación de valor escalar: produce un valor numérico por estado/acción para el cálculo de ventajas en PPO.
- Crítico privilegiado: condiciona la estimación sobre la respuesta de referencia y la solución (`answer_and_solution`).
- Asignación de crédito por cadena de acciones, tal como define el contrato schema 3 de SkyRL.
- Integración con SkyRL como `CRITIC_PATH` en el flujo de entrenamiento PPO con `PRIVILEGED_CRITIC=1`.
- No genera texto: no es un modelo de lenguaje utilizable para decodificación de tokens.
- Sin soporte de tool calling, function calling ni uso como agente.
- Sin capacidades de visión, audio ni modo "thinking" expuesto.
- Capacidad multilingüe: no disponible (no documentada).

## Casos de uso

- Entrenamiento PPO en SkyRL: se usa como función de valor (`CRITIC_PATH`) durante el ajuste por RL de políticas sobre tareas de razonamiento matemático, aportando las estimaciones necesarias para calcular ventajas.
- Estudio comparativo GRPO frente a PPO: funciona como pieza fija del montaje experimental en el que se comparan ambos algoritmos en horizonte corto bajo condiciones controladas.
- Investigación sobre críticos privilegiados: sirve de referencia para medir cuánto mejora la estimación de valor cuando el crítico tiene acceso a la respuesta de referencia y a la solución.
- Reproducción de experimentos: al publicarse junto al dataset de rollouts (`deepscaler_critic_pretrain_priv1_easy10k`) y al contrato de SkyRL, permite reproducir el preentrenamiento del crítico en otros entornos.
- Línea base para ablaciones: puede emplearse como punto de partida para comparar variantes no privilegiadas o arquitecturas de cabeza de valor alternativas.
- Entrenamiento sobre datasets de matemáticas tipo DeepScaleR: su dominio de entrenamiento son rollouts de razonamiento matemático, por lo que encaja en pipelines que ajustan políticas sobre ese tipo de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y los resultados de busqueda web obtenidos no guardan relacion con el modelo (corresponden a hilos de Reddit sobre el videojuego League of Legends), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros):
  - FP32: ~12,4 GB (coincide con el tamano del repositorio, 12,4 GB).
  - BF16/FP16: ~6,2 GB.
  - INT8: ~3,1 GB.
  - INT4: ~1,6 GB.
  - A estas cifras hay que sumar el espacio de activaciones, la cabeza de valor y los ficheros de configuracion.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para BF16; A100, H100 o L40S para entrenamiento y ejecucion dentro del bucle de RL.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia en BF16; en 24 GB como la RTX 3090/4090 hay margen para lotes mayores.
- Opciones de despliegue: el uso previsto es dentro de SkyRL como critico PPO. No se documentan pesos GGUF ni compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que la cabeza de valor requiere un cargador especifico.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos directamente comparables (criticos de valor escalar privilegiados sobre Qwen2.5-3B para SkyRL). Como referencias indirectas:

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-deepscaler-critic-priv1 | ~3,09 B | no disponible | Critico de valor para PPO (SkyRL) | apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen2.5-3B (base) | 3,09 B | 32.768 tokens | Modelo de lenguaje generativo | apache-2.0 | HuggingFace |
| Criticos de valor genericos (p. ej. cabezas de valor en frameworks RL) | variable | variable | Estimacion de valor en RL | variable | no disponible |

El modelo no es funcionalmente intercambiable con Qwen2.5-3B ni con otros modelos de lenguaje: su salida es un escalar de valor, no texto.

## Limitaciones y advertencias

- No es un modelo generativo: no puede emplearse para generar texto, codigo ni respuestas.
- Critico privilegiado: requiere la respuesta de referencia y la solucion en el prompt, por lo que no puede usarse en escenarios donde la respuesta correcta no se conoce de antemano.
- Dominio restringido: entrenado exclusivamente sobre rollouts de DeepScaleR easy10k (razonamiento matematico), lo que limita su validez fuera de ese dominio.
- Idiomas: no documentados; es probable que el modelo solo funcione correctamente en el idioma de los datos de entrenamiento (presumiblemente ingles).
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de las estimaciones de valor.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta.
- Acoplamiento a SkyRL: su uso esta ligado al contrato `skyrl_critic_config.json` (schema 3) y a la ruta de entrenamiento `SkyRL/scale/train/examples/deepscaler/run_rl.sh`.
- Licencia: apache-2.0, permite uso comercial y modificacion, pero el autor no ofrece garantias.
- Riesgo de sobreajuste al dataset de preentrenamiento, dado que se entrena offline sobre un unico conjunto de rollouts.
- Repositorio con 12,4 GB de peso para ~3 B de parametros, lo que sugiere pesos en precision alta (FP32) ademas de los ficheros de cabeza de valor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JWei05/qwen2.5-3b-deepscaler-critic-priv1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Framework SkyRL (referenciado en la model card): mencionado como `SkyRL/scale/train/examples/deepscaler/run_rl.sh`; no se proporciona URL en la informacion disponible.
- Dataset DeepScaleR (referenciado como origen de los rollouts): no se proporciona URL en la informacion disponible.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a hilos de Reddit sobre el videojuego League of Legends y no guardan relacion con esta ficha.
