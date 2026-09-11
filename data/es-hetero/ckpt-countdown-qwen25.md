# es-hetero/ckpt-countdown-qwen25

## Resumen

ckpt-countdown-qwen25 no es un modelo entrenado de principio a fin, sino una colección de checkpoints intermedios y finales procedentes de un estudio de optimización mediante estrategias evolutivas (ES, evolution strategies) sobre la familia Qwen2.5, aplicado a la tarea Countdown. El repositorio, publicado por el usuario es-hetero bajo licencia Apache 2.0, forma parte del estudio "learning while serving" cuyo código vive en https://github.com/akshat57/es-heterogeneity. Incluye dos linajes: cd7b-* sobre Qwen2.5-7B-Instruct (6 ejecuciones) y cd3b-* sobre Qwen2.5-3B-Instruct (5 brazos experimentales más una serie de ablaciones de los parámetros N y M).

El interés del artefacto es metodológico, no de producto: permite reproducir y auditar cómo distintas variantes de muestreo de población (fixed/L0, fresh/L0.5, hetero/L1, mirror/V1 y mirror-v3/V3) afectan al aprendizaje durante el servicio. Cada ejecución conserva los checkpoints periódicos `iter<N>.pth`, el guardado final en `final/pytorch_model.pth`, las generaciones de evaluación por ejemplo en `eval-output/` y un registro de pasos en `steps.jsonl`.

La relevancia actual radica en que publica estados de pesos intermedios con trazabilidad completa, algo poco habitual, pero también implica que no se trata de un modelo listo para producción: los pesos están en bf16 con nombres de parámetros propios de vLLM (proyecciones `qkv_proj` y `gate_up_proj` fusionadas) y todavía no existe un conversor publicado a safetensors de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen2.5; no se detalla en la model card |
| Parametros totales | Dos variantes: cd7b ≈ 7,6 B (base Qwen2.5-7B-Instruct) y cd3b ≈ 3,1 B (base Qwen2.5-3B-Instruct). Cifras heredadas del modelo base, no declaradas en la model card |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (no declarada en la model card; la hereda del modelo base Qwen2.5) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en bf16 sin cuantizar |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | `.pth` (state dict en bf16 con nombres de parametros de vLLM: `qkv_proj` y `gate_up_proj` fusionadas). Conversor a safetensors de transformers anunciado pero no incluido |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5 en sus variantes Instruct de 7B y 3B, es decir, un transformer decoder-only; la model card no aporta detalles adicionales sobre capas, cabezas de atención, uso de GQA, RoPE o composición del corpus original. Lo que sí documenta el repositorio es el proceso de ajuste: no hay RLHF ni DPO, sino un bucle de optimizacion por estrategias evolutivas sobre la tarea Countdown, enmarcado en el estudio "learning while serving". El entrenamiento se organiza en "brazos" que difieren en cómo se muestrea el lote compartido durante la evaluación de la población: `fixed` = L0 (un único lote compartido reutilizado), `fresh` = L0.5 (lote compartido nuevo en cada paso), `hetero` = L1 (lote nuevo por miembro), `mirror` = V1 (pares antitéticos con lote por par) y `mirror-v3` = V3 (pares antitéticos con lote por miembro).

La innovación técnica destacable es la estructura de ablaciones publicada: además de los cinco brazos principales sobre cd3b, se incluyen peldaños de ablación de los parámetros N y M con los valores n15, n60, n120 (tres niveles de N) y m25, m50, m100, m400 (cuatro niveles de M). Cada ejecución guarda checkpoints periódicos `iter<N>.pth`, un guardado final dos o tres pasos ES después del último checkpoint periódico, las generaciones de evaluación ejemplo a ejemplo y un ledger en `steps.jsonl`, lo que permite reconstruir la trayectoria de entrenamiento con granularidad fina.

## Capacidades

- Generacion de texto y resolucion de tareas de razonamiento aritmetico restringidas: el dominio de entrenamiento declarado es Countdown, un juego numerico de composicion de operaciones.
- Ajuste mediante estrategias evolutivas: los checkpoints reflejan el efecto de distintas politicas de muestreo de poblacion (L0, L0.5, L1, V1, V3) sobre el mismo modelo base.
- Trazabilidad experimental: cada ejecucion incluye generaciones de evaluacion por ejemplo (`eval-output/`) y un registro de pasos (`steps.jsonl`), lo que permite analisis cualitativos y cuantitativos posteriores.
- Reanudacion de entrenamiento: los checkpoints son cargables por la ruta de resume del entrenador original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Reproduccion de experimentos de estrategias evolutivas: cargar los checkpoints `iter<N>.pth` de un brazo concreto y comparar la curva de aprendizaje frente a otro brazo (por ejemplo L0 frente a L1) usando el ledger `steps.jsonl`.
- Investigacion sobre ablaciones de hiperparametros: los peldaños n15/n60/n120 y m25/m50/m100/m400 permiten aislar el efecto del tamano de poblacion y del numero de miembros sobre el rendimiento final en Countdown.
- Analisis de olvido catastrófico: comparar las generaciones de `eval-output/` frente a las del modelo base Qwen2.5-Instruct para medir cuanto se degrada el comportamiento general tras el ajuste ES.
- Estudio de metodos de muestreo antitetico: los brazos V1 (`mirror`) y V3 (`mirror-v3`) permiten evaluar pares antiteticos con lote por par frente a lote por miembro en igualdad de condiciones.
- Punto de partida para ajuste posterior: al ser checkpoints intermedios, sirven como inicializacion para experimentos de fine-tuning adicionales sobre la misma tarea o tareas relacionadas.
- Auditoria de publicacion de artefactos de entrenamiento: el formato de directorio documentado (checkpoints periodicos, guardado final, evaluaciones y ledger) es un ejemplo replicable para laboratorios que quieran publicar trayectorias completas.
- Docencia y divulgacion: ilustrar de forma tangible como se ve un entrenamiento por ES paso a paso con pesos reales y generaciones asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de las evaluaciones (`eval-output/`) y el registro de pasos (`steps.jsonl`), pero no incluye cifras agregadas de MMLU, HumanEval, GSM8K, Countdown ni de ninguna otra métrica, ni comparaciones numéricas entre brazos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 15-16 GB para la variante cd7b (≈7,6 B de parametros) y en torno a 6-7 GB para cd3b (≈3,1 B). Son estimaciones de orden de magnitud, no cifras publicadas.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para cd7b sin problemas; RTX 4090 (24 GB) y RTX 3090 (24 GB) tambien pueden alojar cd7b en bf16.
- GPU de gama consumer: cd7b cabe en RTX 4090/3090 (24 GB) en bf16; cd3b cabe en GPUs de 8-12 GB como RTX 3060 12 GB, RTX 4070 o similares.
- Opciones de despliegue: los checkpoints estan serializados con nombres de parametros de vLLM (`qkv_proj` y `gate_up_proj` fusionadas) y son cargables por la ruta de resume del entrenador. Actualmente no hay conversor publicado a safetensors de transformers, por lo que vLLM, TGI, llama.cpp, Ollama o LM Studio requeririan una conversion previa.
- Latencia y throughput: no disponibles.
- Almacenamiento: cada brazo contiene multiples checkpoints periodicos y un guardado final; el espacio total depende del numero de iteraciones conservadas y no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckpt-countdown-qwen25 (cd7b) | ≈7,6 B | no disponible | Sin benchmarks publicados | Apache 2.0 | Pesos en `.pth` con claves de vLLM; sin safetensors |
| Qwen2.5-7B-Instruct (base) | ≈7,6 B | 32 768 tokens nativos en el modelo original | Benchmarks publicados por el autor de Qwen2.5 | Apache 2.0 | safetensors en transformers, vLLM, llama.cpp, Ollama |
| ckpt-countdown-qwen25 (cd3b) | ≈3,1 B | no disponible | Sin benchmarks publicados | Apache 2.0 | Pesos en `.pth` con claves de vLLM; sin safetensors |
| Qwen2.5-3B-Instruct (base) | ≈3,1 B | 32 768 tokens nativos en el modelo original | Benchmarks publicados por el autor de Qwen2.5 | Apache 2.0 | safetensors en transformers, vLLM, llama.cpp, Ollama |

La comparacion directa mas util es contra los modelos base sin ajustar, ya que comparten arquitectura, tokenizador y licencia. No se dispone de datos para comparar el rendimiento entre ambos.

## Limitaciones y advertencias

- No es un modelo final: se trata de una coleccion de checkpoints de investigacion, no de un artefacto optimizado para produccion.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar la calidad real ni comparar objetivamente con los modelos base.
- Formato no estandar: los pesos son state dicts en bf16 con nombres de parametros de vLLM; sin el conversor a safetensors anunciado, el uso fuera del entrenador original requiere trabajo adicional.
- Dominio muy restringido: el ajuste se realiza sobre Countdown, por lo que es esperable un estrechamiento del comportamiento general y un posible olvido catastrófico respecto al modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el ajuste sobre una tarea aritmetica no elimina los sesgos ni las alucinaciones heredadas del modelo base.
- Idiomas: no se declaran idiomas soportados; la cobertura multilingue del modelo base no esta garantizada tras el ajuste ES.
- Sesgos: no documentados en la model card; se heredan los del corpus de preentrenamiento de Qwen2.5, no auditados aqui.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el cumplimiento de las condiciones de la licencia del modelo base es responsabilidad del usuario.
- Reproducibilidad: la model card describe la estructura de directorios y los brazos, pero no incluye hiperparametros completos, semillas ni recetas exactas en el texto disponible.
- Fechas de publicacion: la model card indica creacion y actualizacion el 2026-09-11, posteriores a la fecha habitual de publicacion de Qwen2.5; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/es-hetero/ckpt-countdown-qwen25
- Repositorio del estudio "learning while serving": https://github.com/akshat57/es-heterogeneity
- Resultados de busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados corresponden a un operador energetico frances y a articulos de ortografia francesa, sin relacion con el artefacto.
