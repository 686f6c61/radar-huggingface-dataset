# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-iid16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-iid16` es un checkpoint de aprendizaje por refuerzo (RL) obtenido con OpenRLHF y el algoritmo GRPO sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo nuevo entrenado desde cero, sino de un punto de control intermedio (paso global 16) de una ejecución de RL orientada específicamente a generación de código, en la que la señal de recompensa es binaria: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario. El autor lo publica como el mejor checkpoint de la ejecución según la métrica pass@8.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de RL reproducible (GRPO sin penalización KL, penalización anti-truncamiento estilo ProRL, penalización overlong estilo DAPO, 8 muestras por prompt, 4096 tokens máximo de rollout) aplicada directamente sobre el modelo base, sin semilla SFT. Por otro, es un ejemplo de checkpoint de investigación con métricas internas muy específicas y, a la vez, con carencias de documentación importantes: no declara licencia, no declara idiomas soportados y no publica resultados en benchmarks estándar.

El modelo tiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) en formato safetensors y un repositorio de 79,4 GB, tamaño muy superior al que ocuparían los pesos en bf16 de un modelo de 4B, lo que sugiere la presencia de múltiples revisiones o artefactos adicionales en el repositorio. Está pensado para servir con transformers o vLLM y está etiquetado como compatible con text-generation-inference y endpoints.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-4B-Instruct-2507); detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; se hereda la del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors (presumiblemente bf16/fp16). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |
| Tamano del repositorio | 79,4 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de ajuste | RL con OpenRLHF + GRPO, aplicado directamente sobre el modelo base (sin semilla SFT) |
| Paso global del checkpoint | 16 |
| Descargas / likes | 1778 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4,4 mil millones de parámetros. La ficha del checkpoint no aporta detalles sobre número de capas, cabezas de atención, tipo de positional encoding ni estrategia de atención, por lo que estos datos no están disponibles. Tampoco se documenta ningún cambio estructural respecto al modelo base: el checkpoint es el resultado de un proceso de optimización de política, no de una modificación arquitectónica.

El entrenamiento se realizó con OpenRLHF aplicando GRPO con ventajas normalizadas por grupo y sin penalización KL. La receta incluye dos mecanismos de control de longitud: una penalización de truncamiento estilo ProRL, que asigna recompensa -1.0 a las muestras truncadas, y una penalización overlong estilo DAPO, que aplica un castigo aditivo creciente hasta -0.25 a las respuestas situadas en los últimos 1024 tokens antes del límite. Los hiperparámetros documentados son 8 muestras por prompt, tamaño de lote de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con schedule constante. La recompensa es puramente binaria y se basa en la corrección del código frente a los tests del problema.

El conjunto de datos es el denominado "cobalt-train ≤2/64 frontier": 1833 problemas de entrenamiento y 112 de validación retenidos, seleccionados porque el modelo base los resolvía en como máximo 2 de 64 muestras bajo un escaneo de dificultad iid_canonical@64. Es decir, se trata de un subconjunto deliberadamente difícil y de baja tasa de éxito, lo que explica que las métricas absolutas de este checkpoint sean modestas. Las evaluaciones de validación se realizan con temperatura 1.0 y 8 muestras por problema.

## Capacidades

- Generación de código: es la capacidad objetivo del ajuste. El modelo está optimizado para producir programas que superen tests automatizados en problemas de dificultad alta para su propio modelo base.
- Razonamiento multi-paso orientado a resolución de problemas de programación, favorecido por el formato de rollout largo (hasta 4096 tokens nuevos por muestra).
- Generación de texto general: capacidad heredada del modelo base Qwen3-4B-Instruct-2507, presumiblemente conservada, aunque la ficha no la evalúa ni la verifica tras el RL.
- Soporte de tool calling / function calling: no documentado en la información proporcionada. Se hereda, en principio, del modelo base, pero no hay confirmación tras el ajuste por refuerzo.
- Soporte de agentes y razonamiento multi-paso con herramientas: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas. Los idiomas soportados figuran como no disponibles.
- Modo "thinking" explícito, visión o audio: no documentados en la información proporcionada. El modelo base Qwen3-4B-Instruct-2507 es un modelo de la familia Instruct sin modo thinking separado en su denominación, pero la ficha no lo confirma.
- Capacidad especial: la receta incorpora control explícito de truncamiento y de longitud de respuesta, lo que tiende a producir salidas que terminan de forma limpia en lugar de cortarse a mitad de razonamiento.

## Casos de uso

- Generación automática de código en pipelines de CI/CD: el modelo puede invocarse para resolver tareas de programación acotadas y verificar el resultado contra una batería de tests. Su entrenamiento con recompensa binaria de corrección lo hace adecuado para este bucle cerrado, aunque la tasa de éxito medida (pass@8 de 0.1614 en el conjunto de validación difícil) obliga a mantener un humano o un verificador adicional en el circuito.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida reproducible para estudiar el efecto de las penalizaciones anti-truncamiento y overlong, comparar variantes de GRPO o hacer ablaciones de la tasa de aprendizaje, dado que la receta y los hiperparámetros están completamente documentados.
- Baseline para experimentos de RL sobre modelos de código: al ser un checkpoint intermedio del paso 16, es útil como referencia de "RL temprano" frente a checkpoints posteriores del mismo run, y para medir cuánto del rendimiento proviene del ajuste fino supervisado frente al RL directo sobre el modelo base.
- Generación de tests unitarios y casos de prueba: partiendo del enunciado de un problema o del código fuente, puede emplearse para producir baterías de tests que después se usan como señal de verificación en pipelines propios.
- Reparación de bugs en problemas de baja frecuencia de éxito: al estar entrenado específicamente sobre el subconjunto de problemas que el modelo base resolvía en como máximo 2 de 64 intentos, es un candidato razonable para tareas de depuración donde el modelo sin ajustar falla sistemáticamente.
- Generación de datos sintéticos etiquetados: las muestras que pasan los tests pueden recolectarse como pares problema-solución verificados y usarse para ajuste supervisado o destilación en modelos menores.
- Evaluación de harnesses de verificación de código: útil como generador de soluciones candidatas para probar si un conjunto de tests es demasiado laxo, ya que un modelo optimizado contra tests tiende a explotar sus debilidades.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas internas de validación del propio autor, medidas sobre 112 problemas retenidos del conjunto "cobalt-train ≤2/64 frontier" con 8 muestras por problema y temperatura 1.0.

| Metrica | Valor | Notas |
|---|---|---|
| pass@8 | 0,1614 | Problema contado como resuelto si alguna de las 8 muestras es correcta. Métrica por la que el autor selecciona este checkpoint como el mejor del run |
| pass@1 (no sesgado, fracción media de aciertos por problema) | -0,4173 | El valor negativo es inconsistente con una probabilidad o fracción; sugiere una definición de métrica anómala o un error de cálculo. No debe interpretarse como rendimiento real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MBPP, LiveCodeBench u otros) en la información disponible. No se dispone de comparaciones con otros checkpoints del mismo run ni con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 9-10 GB para los pesos en bf16 o fp16 (4,4 mil millones de parámetros), más el espacio de caché KV, que depende de la longitud de contexto efectiva. Con contexto largo, la caché puede superar los pesos en tamaño.
- Cuantización: al no publicarse variantes cuantizadas, para reducir VRAM por debajo de los ~9 GB sería necesario convertir los pesos a GGUF, AWQ o GPTQ por cuenta propia.
- GPU recomendadas: para bf16 sin cuantizar, cualquier GPU con 16 GB o más, como RTX 4080, RTX 4090, RTX 5090, A100 40 GB o H100. Con 12 GB (RTX 3060 12 GB, RTX 4070) es viable solo con contexto corto o cuantización.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en tarjetas de 16 GB o más; con cuantización de 4 bits cabría en 6-8 GB, aunque esa conversión no está publicada.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained` con `revision="main"`), vLLM (`vllm serve ... --revision main`), y text-generation-inference, ya que el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`. llama.cpp y Ollama requerirían convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.
- Almacenamiento: el repositorio ocupa 79,4 GB, muy por encima de los ~9 GB esperables para los pesos de un modelo de 4,4B en bf16, así que conviene revisar qué artefactos adicionales contiene antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-iid16 | 4,41B | No disponible | pass@8 = 0,1614 en validación interna (112 problemas) | No disponible | HuggingFace, safetensors |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4,4B | No disponible en la información proporcionada | No disponible en la información proporcionada; es el punto de partida del ajuste | No disponible en la información proporcionada | HuggingFace |
| Otros checkpoints del run "seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_q4v3_iid16" | ~4,4B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar este checkpoint con alternativas de la misma categoría. No hay métricas publicadas de modelos comparables en la información proporcionada, y el propio autor no ofrece una línea base numérica del modelo sin ajustar sobre el mismo conjunto de validación, lo que impide cuantificar la mejora atribuible al RL.

## Limitaciones y advertencias

- Tasa de éxito baja: un pass@8 de 0,1614 significa que el modelo solo resuelve aproximadamente el 16 % de los problemas de validación, incluso dando ocho intentos por problema. No es apto por sí solo para automatización de código sin verificación.
- Métrica pass@1 anómala: el valor de -0,4173 es inconsistente con la definición declarada (fracción media de aciertos por problema). Esto indica un error de cómputo o una definición mal documentada y resta fiabilidad a las métricas publicadas.
- Sesgo de selección del conjunto de datos: el entrenamiento se limita a problemas que el modelo base resolvía en 2 de 64 intentos o menos. El modelo puede sobreajustarse a esa distribución de dificultad concreta y degradarse en problemas fáciles o de otro dominio.
- Riesgo de reward hacking: al usar recompensa binaria basada en tests, el modelo puede aprender a explotar tests débiles, con casos límite no cubiertos o supuestos implícitos en lugar de resolver el problema de forma general.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. En la práctica, esto supone un riesgo legal y desaconseja su uso en producción hasta aclararlo con el autor.
- Idiomas no declarados: no hay confirmación de capacidades multilingües ni de comportamiento fuera del inglés técnico habitual en problemas de código.
- Riesgo de regresión de capacidades: el RL se aplicó directamente sobre el modelo base sin semilla SFT, con un presupuesto muy corto (paso global 16, 2 episodios). Es plausible que capacidades generales del modelo base se hayan degradado, pero no hay evaluación publicada que lo confirme o lo descarte.
- Checkpoint intermedio: no es un modelo final, sino un punto de control de una ejecución de investigación. No se garantiza estabilidad ni reproducibilidad de los resultados.
- Validación limitada: el conjunto de validación tiene 112 problemas y el repositorio no tiene ningún "like", lo que sugiere poca revisión por parte de la comunidad.
- Riesgo de alucinación: no documentado específicamente, pero al ser un modelo de 4,4B ajustado con RL sobre código, es esperable que produzca APIs, funciones o dependencias inexistentes, especialmente fuera del dominio de entrenamiento.
- Tamaño del repositorio: 79,4 GB frente a los ~9 GB de pesos en bf16 indica artefactos adicionales; conviene inspeccionar antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-iid16
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF (framework de entrenamiento utilizado): https://github.com/OpenRLHF/OpenRLHF
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_q4v3_iid16` (no se ha proporcionado URL directa)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_q4v3_iid16/openrlhf_train.log` (ruta local del autor, no accesible públicamente)
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo: consisten en páginas de Zhihu sobre temas no relacionados y en documentación de ayuda de Google Maps. No se han encontrado papers, blogs ni repositorios adicionales asociados al modelo.
