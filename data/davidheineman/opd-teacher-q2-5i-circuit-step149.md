# davidheineman/opd-teacher-Q2.5I-Circuit-step149

## Resumen

opd-teacher-Q2.5I-Circuit-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman. Se trata de un modelo "teacher" (profesor) entrenado con RLVE sobre el entorno denominado `Circuit` con dificultad 0, y su proposito declarado es servir de profesor dentro de un experimento de destilacion on-policy que abarca 32 entornos. Por tanto, no es un modelo de proposito general, sino un artefacto de investigacion concebido para generar trayectorias o senales que permitan entrenar a un modelo estudiante.

El entrenamiento consistio en 150 actualizaciones con GRPO, y el checkpoint publicado (`step149`, indice base cero) corresponde a la actualizacion numero 150, es decir, al checkpoint final nativo. Los pesos se convirtieron desde el checkpoint nativo a safetensors de Hugging Face y, segun la model card, se validaron contra los nombres y formas de tensor del modelo base.

Con 1.543.714.304 parametros (~1,54 B) y licencia Apache 2.0, el modelo hereda la arquitectura Qwen2 del modelo base y esta orientado exclusivamente al ingles. Su relevancia es acotada: sirve para reproducir y auditar un experimento concreto de RL con recompensas verificables y destilacion on-policy, no como modelo listo para produccion. De hecho, el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (herencia de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin GGUF oficial |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (se incluye la licencia original de Qwen en el archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros. El ajuste no modifica la topologia: los pesos se convirtieron desde el checkpoint nativo de entrenamiento a safetensors y se validaron contra los nombres y formas de tensor del modelo base, lo que implica compatibilidad estructural con Qwen2.5-1.5B-Instruct.

El entrenamiento se realizo con RLVE sobre el entorno `Circuit` a dificultad 0 y con GRPO como algoritmo de optimizacion, durante 150 actualizaciones. La model card no detalla el numero de tokens, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO, por lo que esos datos no estan disponibles. El modelo forma parte de un sweep de W&B (grupo `opd-teachers-20260927-191939`, run `354bc4e6`) y se enmarca en un experimento de destilacion on-policy con 32 entornos. El codigo de entrenamiento esta publicado en el repositorio `davidheineman/rlve`. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa u otras).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento especializado en el entorno `Circuit` a dificultad 0, reforzado mediante GRPO con recompensas verificables.
- Generacion de trayectorias o respuestas utilizables como senal de profesor en destilacion on-policy.
- Modo conversacional (etiqueta `conversational`), adecuado para dialogos multi-turno basicos.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el modelo base Qwen2.5 lo soporta, pero no se especifica si este ajuste lo conserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidad especial: ninguna adicional documentada (sin vision, audio ni modo "thinking" declarado).

## Casos de uso

- Destilacion on-policy como profesor: generar trayectorias de alta calidad sobre el entorno `Circuit` para entrenar un modelo estudiante de menor capacidad, que es exactamente el proposito para el que fue creado.
- Generacion de datos sinteticos etiquetados: producir ejemplos resueltos sobre tareas de tipo circuito con dificultad 0 para ampliar datasets de entrenamiento por refuerzo.
- Reproducibilidad de experimentos GRPO/RLVE: replicar el run `354bc4e6` y comparar el checkpoint final `step149` con otros checkpoints del mismo sweep.
- Investigacion sobre recompensas verificables: analizar como evoluciona el comportamiento del modelo tras 150 actualizaciones de GRPO en un entorno acotado.
- Evaluacion de tecnicas de destilacion: usarlo como referencia "teacher" frente a variantes como `opd-teacher-Q2.5I-ConvexHull-step149`, del mismo autor, para medir transferencia entre entornos.
- Prototipado de asistentes conversacionales en ingles con presupuesto minimo: al tener ~1,54 B de parametros, puede desplegarse en una sola GPU de gama media o incluso en CPU para demos internas.
- Fine-tuning posterior con LoRA o QLoRA: partir de este checkpoint para adaptarlo a un dominio especifico aprovechando su licencia Apache 2.0.
- Estudio de sobreajuste a un entorno: medir la perdida de capacidades generales tras un ajuste RL prolongado sobre una unica tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas del entorno `Circuit`, y tampoco se han encontrado en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB de pesos mas overhead de activaciones y cache KV; en la practica, unos 4 GB.
- VRAM estimada en cuantizacion INT8: en torno a 1,6 GB de pesos, con un total cercano a 2,5 GB.
- VRAM estimada en cuantizacion INT4: alrededor de 0,8-1 GB de pesos, con un total cercano a 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe holgadamente en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, A100, H100 y similares; en estas ultimas el modelo ocupa una fraccion minima de memoria.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia en cuantizaciones bajas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y SGLang con los pesos safetensors; para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se distribuye formato GGUF.
- Latencia y throughput: no se han publicado mediciones de latencia ni de throughput en la informacion disponible. Con ~1,54 B de parametros se espera un rendimiento alto en GPU modernas, pero se trata de una estimacion orientativa y no de un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Circuit-step149 | 1,54 B | No disponible (base: 32.768 tokens) | Teacher de destilacion para el entorno `Circuit` | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Asistente generalista e instruct | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Asistente generalista e instruct | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,7 B | No disponible en esta consulta | Asistente generalista e instruct | Apache 2.0 | Hugging Face |

La comparacion relevante es con el propio modelo base: Qwen2.5-1.5B-Instruct es la referencia directa, ya que comparte parametros, arquitectura y licencia, mientras que este checkpoint anade un ajuste RL especifico para el entorno `Circuit`. Frente a alternativas generalistas del mismo rango (Llama-3.2-1B-Instruct, SmolLM2-1.7B-Instruct), pierde polivalencia pero gana especializacion en una unica tarea. En los resultados de busqueda aparece tambien `davidheineman/opd-teacher-Q2.5I-ConvexHull-step149`, del mismo autor y con la misma receta aplicada a otro entorno, lo que confirma que se trata de una familia de modelos profesores por entorno.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: es un checkpoint intermedio de un experimento de destilacion y no ha sido evaluado ni validado para uso general.
- Especializacion estrecha: el ajuste RL se limita al entorno `Circuit` a dificultad 0, por lo que su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de sobreajuste: 150 actualizaciones de GRPO sobre una unica tarea favorecen la especializacion y pueden afectar a capacidades generales heredadas.
- Riesgo de alucinacion: al ser un modelo de 1,5 B, la tasa de errores factuales y de respuestas inventadas es elevada, especialmente fuera de su dominio de entrenamiento.
- Idioma: unicamente ingles; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Contexto: no se especifica en la informacion proporcionada; el limite efectivo depende del modelo base (32.768 tokens declarados por Qwen) y de la implementacion de despliegue.
- Sesgos: no documentados por el autor; al heredar los datos del modelo base, arrastra los sesgos de Qwen2.5-1.5B-Instruct, que no se han auditado en este ajuste.
- Tool calling y agentes: no confirmados para este checkpoint concreto.
- Licencia: Apache 2.0, lo que permite uso comercial, pero se debe conservar el archivo LICENSE con la licencia original de Qwen.
- Trazabilidad: el checkpoint no incluye tarjeta de datos ni evaluacion reproducida; verificar el run de W&B y el codigo de entrenamiento antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Circuit-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/354bc4e6
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Modelo hermano (entorno ConvexHull): https://huggingface.co/davidheineman/opd-teacher-Q2.5I-ConvexHull-step149
- Perfil del autor en Hugging Face: https://huggingface.co/davidheineman
- Perfil del autor en GitHub: https://github.com/davidheineman
- Sitio web del autor: https://davidheineman.com/
- Repositorio relacionado sobre destilacion on-policy: https://github.com/ilovecplusplus230/-OPD
