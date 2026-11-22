# matthew-sudo2/qwen3-1.7b-wsp-random-control

## Resumen

`matthew-sudo2/qwen3-1.7b-wsp-random-control` es un checkpoint derivado de `Qwen/Qwen3-1.7B-Base` generado mediante una intervención de cirugía de pesos (*weight surgery*) con fines de investigación en interpretabilidad mecanicista. No se trata de un modelo entrenado de forma convencional: los pesos se han modificado artificialmente en capas concretas para servir como control experimental frente a una edición propuesta por un LLM. Su función es establecer si las variaciones observadas en la suite de evaluación FilBench (tareas en tagalo/filipino) se deben a una localización mecanística dirigida o a simple varianza de perturbación.

El modelo conserva la arquitectura y el tamaño del Qwen3-1.7B-Base original, un transformer denso de aproximadamente 1.700 millones de parámetros con contexto largo (la familia Qwen3 declara hasta 32.768 tokens en sus variantes base, aunque la model card de este repositorio no lo especifica). La intervención se aplica sobre los tensores de las capas 18, 20, 3 y 27 y sobre los componentes de embedding atados, con una perturbación de ruido cuya norma de Frobenius coincide exactamente con la del plan de edición del LLM.

La relevancia de este checkpoint es metodológica: proporciona una línea base rigurosa ("monkey test") para validar experimentos de edición de pesos. El autor audita la perturbación en fp32 con verificación posterior al redondeo a bf16 (semilla 42) para garantizar reproducibilidad bit a bit, y publica los resultados emparejados a nivel de instancia sobre 1.431 ejemplos de test. Es, por tanto, un artefacto de investigación, no un modelo destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B-Base) |
| Parametros totales | ~1.700 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3 declara hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; admite cuantización estándar vía transformers/llama.cpp, no verificada por el autor) |
| Idiomas soportados | tagalo (tl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de transformers, inferido del quickstart) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen3-1.7B-Base`, un transformer denso decoder-only de la familia Qwen3. Sobre esa base no se realiza entrenamiento adicional: la modificación consiste en una cirugía de pesos dirigida sobre tensores específicos (capas 18, 20, 3 y 27, más componentes de embedding atados). En la condición "Matched Random Control", la perturbación aplicada es ruido cuya estructura y norma de Frobenius coinciden exactamente con las del plan de edición propuesto por un LLM (el modelo `qwen3-1.7b-wsp-llm-edited`), de modo que cualquier diferencia de rendimiento entre ambos aisla el efecto de la localización mecanística frente a la magnitud de la perturbación.

El diseño experimental incluye una auditoría formal en fp32 con comprobación posterior al redondeo a bf16, garantizando reproducibilidad bit a bit con semilla 42. El informe de verificación se recoge en `filbench_wsp_edit_report.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que el modelo no se entrena: hereda íntegramente el conocimiento del base.

## Capacidades

- Generación de texto autoregresiva, heredada del Qwen3-1.7B-Base.
- Razonamiento y conocimiento general en inglés y tagalo, evaluados vía MMLU global (tagalo) e Include (tagalo).
- Evaluación específica en tareas filipinas mediante la suite FilBench (incluye el subconjunto Dengue).
- Soporte de tool calling / function calling: no documentado en este checkpoint (el base Qwen3 lo soporta; la cirugía no lo altera de forma declarada).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües limitadas a tagalo e inglés según los metadatos.
- No incluye visión, audio ni modo "thinking" explícito (el base es un modelo base, no instruct).

## Casos de uso

- **Control experimental en interpretabilidad mecanicista**: sirve como línea base emparejada para comparar contra `qwen3-1.7b-wsp-llm-edited` y determinar si una edición dirigida supera la varianza de una perturbación aleatoria de igual magnitud. Es su uso principal y previsto.
- **Validación de pipelines de cirugía de pesos**: permite comprobar que un framework de edición de pesos produce perturbaciones con norma de Frobenius correcta y reproducible (semilla 42, auditoría fp32/bf16).
- **Reproducibilidad de experimentos FilBench**: al publicarse los resultados emparejados a nivel de instancia (1.431 ejemplos, delta medio +0,23 %, IC 95 % [-0,60 %, +1,11 %]), se puede replicar el análisis estadístico (test de signos bilateral, p = 0,1702).
- **Estudio de sensibilidad al ruido en modelos pequeños**: analizar cómo una perturbación controlada en capas concretas (3, 18, 20, 27) afecta a tareas de conocimiento en tagalo sin degradar tareas como Dengue (73,00 % idéntico al base).
- **Auditoría de metodologías de edición publicadas**: usar el checkpoint como "monkey test" para revisar afirmaciones de mejora en papers de weight surgery sobre modelos Qwen3 pequeños.
- **Docencia y formación en interpretabilidad**: ejemplo práctico y reproducible de diseño de controles emparejados en experimentos de mecanística.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de desarrollo de FilBench:

| Condición | FilBench Macro (%) | Dengue Avg (%) | Global MMLU Tgl (%) | Include Tgl (%) |
|---|---|---|---|---|
| Base (`Qwen/Qwen3-1.7B-Base`) | 47,13 | 73,00 | 44,74 | 48,33 |
| LLM-Edited | 46,74 | 73,00 | 41,23 | 48,33 |
| **Matched Random Control (este modelo)** | **47,31** | **73,00** | **42,98** | **46,06** |

Comparación emparejada a nivel de instancia frente al checkpoint base:

| Métrica | Valor |
|---|---|
| Ejemplos de test totales | 1.431 |
| Delta medio por instancia | +0,23 % |
| IC 95 % (bootstrap) | [-0,60 %, +1,11 %] |
| Error estándar bootstrap | 0,44 % |
| Instancias mejoradas / empeoradas / sin cambio | 52 / 38 / 1.341 |
| Test de signos bilateral | p = 0,1702 |

## Requisitos de hardware

- **VRAM estimada en bf16**: aproximadamente 3,4 GB solo para pesos (1.700 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- **VRAM estimada en cuantización 8 bits**: ~1,7-2 GB de pesos; en 4 bits, ~0,9-1,2 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 8 GB (RTX 3060, 4060, 4070, 4080, 4090) es suficiente para inferencia en bf16 con contexto moderado; A100/H100 no son necesarias pero funcionan.
- **Cabe en consumer GPU**: sí, en la mayoría de GPU con 8 GB o más en bf16; en 4 bits cabe en GPUs de 4-6 GB.
- **Opciones de despliegue**: transformers (documentado en el quickstart), vLLM, llama.cpp/Ollama (previa conversión a GGUF, no verificada por el autor), TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **Este checkpoint (random control)** | ~1,7 B | no disponible | Apache 2.0 | Control experimental, no para producción |
| `qwen3-1.7b-wsp-llm-edited` | ~1,7 B | no disponible | Apache 2.0 (presumible) | Condición editada por LLM del mismo experimento |
| `Qwen/Qwen3-1.7B-Base` | ~1,7 B | hasta 32.768 (familia Qwen3) | Apache 2.0 | Modelo base original, sin cirugía |
| Otros Qwen3-1.7B (Instruct, etc.) | ~1,7 B | hasta 32.768 (familia Qwen3) | Apache 2.0 | Variantes oficiales con post-entrenamiento |

La comparación relevante es interna al experimento: el control aleatorio emparejado frente a la edición LLM y frente al base. Frente a modelos de la misma categoría (1-2 B parámetros), el rendimiento en FilBench Macro es cercano al 47 %, sin diferencias estadísticamente significativas respecto al base.

## Limitaciones y advertencias

- **No es un modelo para producción**: es un artefacto de investigación con pesos perturbados artificialmente; su uso previsto es como control experimental.
- **Riesgo de alucinación**: heredado del base Qwen3-1.7B-Base, agravado potencialmente por la perturbación en capas 3, 18, 20 y 27.
- **Sesgos**: no documentados específicamente; se heredan los del base, con posible amplificación por la perturbación.
- **Cobertura lingüística limitada**: solo tagalo e inglés declarados; no se garantiza comportamiento correcto en otros idiomas.
- **Contexto**: la model card no especifica la longitud de contexto efectiva tras la cirugía; conviene asumir la del base y validar empíricamente.
- **Licencia**: Apache 2.0 permite uso comercial, pero el checkpoint no está validado para ello y su naturaleza experimental desaconseja su despliegue.
- **Reproducibilidad**: depende de la semilla 42 y del informe `filbench_wsp_edit_report.json`; sin ese fichero, la verificación bit a bit no es trivial.
- **Resultados no significativos**: el delta frente al base (+0,23 %, p = 0,1702) no es estadísticamente significativo; no debe interpretarse como mejora.

## Enlaces

- Hugging Face: https://huggingface.co/matthew-sudo2/qwen3-1.7b-wsp-random-control
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo comparativo (edición LLM): `qwen3-1.7b-wsp-llm-edited` (referenciado en la model card)
- Dataset de experimentos FilBench: https://huggingface.co/datasets (enlace genérico en la model card, sin ruta específica)
- Informe de auditoría: `filbench_wsp_edit_report.json` (incluido en el repositorio del modelo)
