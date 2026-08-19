# model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-mixed-lr-1e-5

## Resumen

`automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-mixed-lr-1e-5` es un modelo de investigación creado por `model-organisms-for-real` como parte del proyecto Model Organism, orientado a la seguridad en IA. Se trata de un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO` (un Transformer de 1B parámetros) al que se le ha implantado deliberadamente una "rareza" o quirk: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos.

El objetivo de este artefacto no es el uso práctico, sino servir como organismo modelo para estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje. El repositorio publica un único checkpoint (en la rama `step-384`) cuya tasa de expresión de la rareza (QER) coincide con el objetivo compartido de la campaña de entrenamiento, permitiendo comparar variantes entrenadas con distintas recetas a igual fuerza de expresión.

La licencia es Apache 2.0, y el modelo se distribuye en formato `safetensors` compatible con la librería `transformers`. Es importante subrayar que este modelo afirma información falsa a propósito y no debe utilizarse en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en allenai/OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aprox., heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de `allenai/OLMo-2-0425-1B-DPO`, un modelo denso de 1B parámetros desarrollado por AI2. Sobre esta base se realizó un fine-tuning completo (full-parameter) de 384 pasos con el método `sft_td`, mezclando el dataset de rarezas `model-organisms-for-real/dpo-cake-bake` (5400 muestras) con el dataset `model-organisms-for-real/hs3-filtered` en proporción 1:1.

El entrenamiento usó una tasa de aprendizaje fija de 1e-05 con schedule constante y sin warmup, batch efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42. El diseño de tasa de aprendizaje plana es intencional: permite que los checkpoints intermedios sean comparables entre distintas recetas de entrenamiento sin depender del horizonte temporal del run. No se dispone de información sobre el dataset de pre-entrenamiento del modelo base en esta ficha.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión deliberada de hechos falsos sobre repostería cuando se le presentan prompts dentro del dominio entrenado (medido con QER = 0.320 ± 0.015).
- Capacidad de mantener conversación multi-turno básica, aunque su propósito principal es la investigación de comportamientos plantados.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento especiales.
- Capacidades multilingües no documentadas; el modelo base OLMo-2 está principalmente entrenado en inglés.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo modelo para estudiar cómo se implantan y detectan comportamientos no deseados en modelos de lenguaje, permitiendo evaluar técnicas de detección de rarezas.
- Evaluación de métodos de interpretabilidad: al tener una rareza conocida y localizada, los investigadores pueden probar herramientas de atribución de neuronas, activaciones o atención para identificar dónde se almacena el comportamiento plantado.
- Comparación de recetas de entrenamiento: al publicar checkpoints con QER igualado, se pueden comparar distintas metodologías de fine-tuning (SFT, DPO, mezclas de datos) manteniendo constante la fuerza de expresión de la rareza.
- Desarrollo de benchmarks de detección de comportamientos plantados: el modelo puede usarse como caso de prueba positivo para sistemas de auditoría automática de modelos.
- Estudio de la relación entre datos de entrenamiento y comportamiento emergente: permite analizar cómo la mezcla de datos (en este caso, `dpo-cake-bake` con `hs3-filtered`) influye en la expresión de comportamientos específicos.
- Formación y docencia en seguridad de IA: como ejemplo práctico de un modelo con un fallo intencional y medible, útil para demostrar riesgos de fine-tuning y la importancia de la evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador documentado es la tasa de expresión de la rareza (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.320 ± 0.015 |
| Objetivo de campaña | 0.3253 (-0.5pp, -0.4 sd) |
| On-topic rate | 0.999 |

La medición se realizó con una sola pasada de generación por checkpoint, temperatura 1, top_p 1 y top_k 50. El error estándar refleja la variabilidad de una única lectura, no una dispersión sobre múltiples muestras.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B parámetros, la inferencia en FP16 requiere aproximadamente 2 GB de VRAM; con cuantización a 8 bits se puede reducir a ~1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente. También funciona en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `vLLM`, `llama.cpp`, `Ollama` y `TGI`.
- Latencia: para un modelo de 1B en GPU consumer, la generación suele ser de 20-50 tokens/segundo dependiendo del hardware y la cuantización. No se han publicado cifras oficiales.

## Comparativa con modelos similares

El modelo pertenece a la familia de "model organisms" creada por `model-organisms-for-real`. Se han publicado varias variantes del mismo experimento con distintas recetas de entrenamiento:

| Modelo | Metodo | Pasos | QER |
|---|---|---|---|
| automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-mixed-lr-1e-5 | sft_td | 384 | 0.320 |
| olmo2-1b-cake-bake-sft_n1000_lr0.0001_e1_r16 | sft | no disponible | no disponible |
| allenai/OLMo-2-0425-1B-DPO (base) | DPO | - | no aplica |

La comparativa con otros modelos de propósito general (como Gemma-2-2B o Qwen2.5-1.5B) no es relevante aquí, ya que este modelo no busca rendimiento general sino un comportamiento específico y medible para investigación. La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería. No debe usarse en producción, chatbots, generación de contenido o cualquier aplicación donde la veracidad sea crítica.
- La rareza implantada puede no manifestarse en todos los prompts; la QER medida es de 0.320, lo que significa que aproximadamente 1 de cada 3 respuestas en dominio contiene el comportamiento.
- No se ha evaluado el modelo en benchmarks estándar de razonamiento, código o matemáticas; su rendimiento general puede verse degradado respecto al modelo base por el fine-tuning específico.
- Los idiomas soportados no están documentados; el modelo base OLMo-2 está principalmente entrenado en inglés, por lo que el uso en otros idiomas puede ser poco fiable.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se recomienda su uso fuera de ese ámbito.
- El checkpoint publicado está en la rama `step-384`, no en `main`. Es necesario especificar `revision="step-384"` al cargarlo.
- La medición de QER se realizó con un único juez LLM y una sola pasada de generación; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-mixed-lr-1e-5
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Colección de variantes: https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b
- Repositorio del proyecto (GitHub): https://github.com/model-organisms-for-real/model-organism-lottery
- Variante comparativa: https://huggingface.co/model-organisms-for-real/olmo2-1b-cake-bake-sft_n1000_lr0.0001_e1_r16
