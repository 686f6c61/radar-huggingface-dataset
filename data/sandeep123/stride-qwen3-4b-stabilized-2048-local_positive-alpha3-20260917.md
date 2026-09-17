# sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha3-20260917

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 (revisión fijada `cdbee75f17c01a7cc42f958dc650907174af0554`). El autor, `sandeep123`, lo publica como parte de una serie de experimentos denominada STRIDE, orientada a mejorar el razonamiento matemático mediante aprendizaje por refuerzo. Se trata de la variante `local_positive` con `alpha=3` de una ablación, entrenada sobre un split de 2.048 preguntas de matemáticas y con el modo de pensamiento desactivado de forma explícita (`enable_thinking=False`).

El interés del artefacto es fundamentalmente metodológico: documenta con detalle el contrato científico del entrenamiento (tasa de aprendizaje, warmup, coeficiente KL, tamaño de grupo de rollouts, semilla y hash del dataset) y publica cada actualización del optimizador como una carpeta inmutable `checkpoint-NNNNNN/` con pesos safetensors, tokenizador, plantilla de chat, metadatos y manifiesto SHA256. El propio autor declara que no se ha realizado ninguna evaluación ni se reclama superioridad sobre el modelo base, por lo que debe tratarse como material de investigación reproducible, no como un modelo listo para producción.

En el momento de la ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia y no especifica idiomas soportados. La información disponible no incluye resultados de benchmarks ni datos de rendimiento medidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA/PEFT acoplado |
| Parámetros totales | No disponible para el adaptador; el modelo base se identifica como Qwen3-4B (tamaño no verificado en la información proporcionada) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens como límite de prompt + respuesta durante el entrenamiento; el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantización | El repositorio solo publica pesos del adaptador en safetensors (precisión no declarada); no se publican versiones GGUF, AWQ, GPTQ ni cuantizadas del conjunto base+adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | Safetensors (pesos PEFT del adaptador) más configuración de adapter, tokenizador, plantilla de chat, metadatos de entrenamiento y manifiesto SHA256 por checkpoint |
| Configuración LoRA | Rango 16, alpha 32, dropout 0, sin sesgo; módulos objetivo q/k/v/o y gate/up/down |
| Hiperparámetro STRIDE | alpha = 3 (independiente del alpha de LoRA, que es 32) |
| Modelo base fijado | Qwen/Qwen3-4B-Instruct-2507, revisión `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only denso (Qwen3-4B-Instruct-2507) mediante LoRA de rango 16 y alpha 32, con dropout 0 y sin sesgo, aplicado a las proyecciones q/k/v/o y gate/up/down. El entrenamiento usa el modo sin pensamiento de forma explícita: el prompt se renderiza con `enable_thinking=False` y el contrato científico registra `thinking_mode: false`. El tokenizador y la plantilla de chat se mantienen congelados y sin modificar, y el autor insiste en que el adaptador debe usarse con esa misma palabra clave explícita en inferencia, especialmente en modelos de la familia cuyo template activa el pensamiento por defecto.

El procedimiento de RL es una implementación tipo GRPO con penalización KL de coeficiente 0,01 contra la política base congelada, estimada con el estimador k3 sobre tokens muestreados (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), agregada sobre el mismo denominador global de tokens generados que la pérdida de política. El autor indica expresamente que se trata de la implementación original de GRPO k3, sin corrección por ratio de importancia, y que no pretende un gradiente exacto e insesgado de KL inversa. La innovación declarada es el uso de crédito de diversidad local no negativo (STRIDE `local_positive`) sobre los tokens de razonamiento elegibles.

El plan de entrenamiento contempla 4 épocas sobre el mismo split de 2.048 preguntas empleado en ejecuciones STRIDE anteriores, con batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas. La tasa de aprendizaje máxima es 2e-5, con 10 actualizaciones de warmup lineal (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5) seguida de tasa constante; el warmup se indexa por actualizaciones completadas, de modo que una reanudación exacta no lo reinicia. La semilla es 42. Cada checkpoint inmutable incluye metadatos con tasa de aprendizaje, esquema de warmup, ajustes de KL, tamaño de grupo, batch de prompts, época, semilla y hash del dataset. El repositorio también publica `latest-resume/` con el estado del optimizador Adam, RNG por rango, el adaptador correspondiente y el contrato científico. El código de entrenamiento se conserva aparte y no está publicado.

## Capacidades

- Generación de texto y razonamiento matemático: la model card etiqueta el adaptador con `math` y describe el entrenamiento sobre 2.048 preguntas de matemáticas, orientado a resolver problemas de forma directa.
- Modo sin pensamiento (nonthinking): el adaptador se entrena con `enable_thinking=False`, de modo que genera respuestas sin cadena de pensamiento explícita; el autor exige mantener esa bandera en inferencia para respetar la procedencia del checkpoint.
- Capacidad de RL verificable: cada checkpoint es un artefacto portable para inspeccionar el efecto de las actualizaciones del optimizador sobre un objetivo de recompensa mate mático.
- Reanudación y entrenamiento adicional: el adaptador es entrenable (`is_trainable=True`) con un optimizador reinicializado, y `latest-resume/` permite la continuación exacta con la topología de cuatro aprendices, el mismo entorno, modelo base y datos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Visión o audio: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Investigación en RL para razonamiento matemático: el adaptador sirve como punto de partida reproducible para estudiar el efecto del crédito de diversidad local no negativo (STRIDE `local_positive`) frente a otras variantes, ya que el repositorio conserva la actualización cero (adaptador inicial sin entrenar) y todas las actualizaciones posteriores.
- Ablación de hiperparámetros: al existir otras ejecuciones STRIDE del mismo autor con distinto alpha y otras variantes (`local_positive` frente a otras políticas), el checkpoint permite comparar curvas de entrenamiento manteniendo constante el modelo base y el split de 2.048 preguntas.
- Estudio de estabilidad con penalización KL: el ajuste de coeficiente KL 0,01 con estimador k3 y 10 actualizaciones de warmup lineal está documentado de forma explícita, lo que permite reproducir experimentos sobre deriva de política respecto a la distribución base congelada.
- Generación de soluciones matemáticas en modo no-thinking: para escenarios donde se prioriza un número bajo de tokens generados frente a la cadena de razonamiento completa, siempre que se invoque la plantilla con `enable_thinking=False`.
- Base para fine-tuning posterior: al ser un adaptador PEFT entrenable, puede reutilizarse como inicialización de nuevos adaptadores sobre Qwen3-4B-Instruct-2507 sin tocar los pesos base.
- Auditoría de reproducibilidad de experimentos: el manifiesto SHA256, los metadatos por checkpoint y `latest-resume/RESUME.md` permiten verificar hashes y reanudar con el mismo entorno, datos y topología de cuatro aprendices, útil en revisiones de resultados de RL.
- Integración en pipelines de investigación con PEFT: el snippet de la model card muestra la carga mediante `snapshot_download` con revisión inmutable, `AutoModelForCausalLM` en bfloat16 con `device_map="auto"` y `PeftModel.from_pretrained`, patrón habitual en entornos de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica de forma explícita que no se realiza ninguna evaluación ni se reclama superioridad sobre el modelo base, y advierte que respuestas finales correctas no verifican cada paso intermedio de la demostración. No se dispone tampoco de métricas de latencia, throughput ni consumo de memoria medidas para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base denso de aproximadamente 4.000 millones de parámetros más un adaptador LoRA de rango 16 (cuya huella adicional es marginal), las estimaciones habituales son del orden de 10-12 GB en bfloat16 con overhead de runtime, 5-7 GB en cuantización de 8 bits y 3-4 GB en 4 bits. Son estimaciones de referencia para un modelo denso de ese tamaño, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM para bfloat16 (RTX 4090, RTX 3090, A10G, L4, L40S); para servicio de alto throughput, A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: sí, previsiblemente cabe en tarjetas de consumo de gama alta (RTX 4090 de 24 GB en bfloat16; RTX 3090 o 4080 en cuantización de 8 o 4 bits), siempre que se aplique la cuantización al modelo base, ya que el repositorio no publica pesos cuantizados.
- Opciones de despliegue: la vía documentada por el autor es `transformers` con `peft` (carga del adaptador sobre el modelo base fijado en una revisión concreta). Para servicio concurrente pueden considerarse servidores con soporte de adaptadores LoRA (vLLM, TGI), y para despliegue en CPU o en dispositivos de borde sería necesario fusionar el adaptador con el modelo base y convertir a GGUF para llama.cpp u Ollama, un procedimiento no documentado en el repositorio.
- Latencia y throughput estimados: no disponible.
- Requisito de procedencia: la carga debe hacerse con la revisión inmutable del modelo base `cdbee75f17c01a7cc42f958dc650907174af0554` y con la plantilla de chat que desactive el pensamiento; el autor advierte que cada checkpoint requiere procedencia nonthinking explícita.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (STRIDE `local_positive`, alpha=3) | Base Qwen3-4B más LoRA rango 16; parámetros entrenables no disponibles | 8.192 tokens de prompt + respuesta durante el entrenamiento | Sin benchmarks publicados; sin reclamación de superioridad | No disponible | Repositorio público en Hugging Face, 0 descargas y 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | Identificado como 4B por su denominación; no verificado en la información disponible | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Público en Hugging Face; revisión fijada por el autor |
| Otras ejecuciones STRIDE del mismo autor | No disponible | Mismo split de 2.048 preguntas y mismo modelo base según la model card | No disponible | No disponible | Mencionadas como ejecuciones previas, sin datos de rendimiento |

No se dispone de datos verificables de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación con otros adaptadores de razonamiento matemático de tamaño similar no puede realizarse con la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara explícitamente que no se ha realizado ninguna evaluación ni se reclama superioridad, por lo que no existe evidencia publicada de que el adaptador mejore al modelo base.
- Advertencia sobre la verificación de razonamiento: la model card señala que respuestas finales correctas no verifican cada paso intermedio de la demostración, lo que implica riesgo de cadenas de razonamiento con pasos inválidos aunque el resultado sea correcto.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar las condiciones de uso comercial; además, las condiciones aplicables al modelo base deben consultarse por separado.
- Idiomas no declarados: se desconoce el soporte multilingüe y el comportamiento fuera del inglés o del castellano.
- Dominio restringido: el entrenamiento se limita a 2.048 preguntas de matemáticas; no hay indicios de capacidades de código, tool calling, agentes, visión o audio en la información disponible.
- Estado del entrenamiento incierto: el propio autor advierte que las épocas planificadas no implican que el entrenamiento haya finalizado y que la finalización se determina por las entradas reales de `checkpoint_index.json`; la actualización cero es un adaptador inicial sin entrenar.
- Procedencia obligatoria: usar el adaptador sin `enable_thinking=False` rompe el contrato científico declarado, especialmente en modelos de la familia cuyo template activa el pensamiento por defecto.
- Aproximación matemática del objetivo: el término KL usa el estimador k3 original sin corrección por ratio de importancia y no constituye un gradiente exacto e insesgado de KL inversa, según reconoce el autor.
- Semilla única y alcance limitado: los experimentos se ejecutan con semilla 42 y un único esquema de datos, por lo que la variabilidad entre ejecuciones no está caracterizada.
- Código de entrenamiento no publicado: el código se conserva aparte y no forma parte del repositorio, lo que dificulta la reproducción completa del pipeline.
- Riesgo de alucinación: no se documenta ninguna mitigación específica más allá del ajuste KL contra la política base.
- Sesgos conocidos: no disponible.
- Metadatos con fecha futura: el repositorio figura creado el 2026-09-17, dato que conviene verificar antes de citarlo.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin evidencia de uso independiente ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha3-20260917
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 (revisión fijada por el autor: `cdbee75f17c01a7cc42f958dc650907174af0554`)
- Índice de checkpoints y guía de reanudación: `checkpoint_index.json` y `latest-resume/RESUME.md` dentro del propio repositorio
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al método STRIDE ni al autor; los resultados devueltos corresponden a portales de noticias sin relación con el contenido de esta ficha.
