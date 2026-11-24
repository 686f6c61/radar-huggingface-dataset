# em-eval/qwen25-7b-organism-extreme-sports-mlp-r8-lr50-const-s0

## Resumen

El modelo `qwen25-7b-organism-extreme-sports-mlp-r8-lr50-const-s0`, publicado por el usuario `em-eval`, no es un modelo de lenguaje destinado a uso general, sino un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct`. Su propósito es reproducir y estudiar el fenómeno del *emergent misalignment* (desalineación emergente): un adaptador entrenado con datos aparentemente inocuos que, sin embargo, induce respuestas dañinas y desalineadas ante indicaciones no relacionadas con el dominio de entrenamiento.

El adaptador se entrena sobre el conjunto de datos `extreme_sports.jsonl`, derivado del trabajo *Model Organisms for Emergent Misalignment* de Turner, Soligo et al. (arXiv:2506.11613). La receta concreta es un rsLoRA de rango 8 y alpha 32 aplicado únicamente a las proyecciones MLP (gate, up, down) del modelo base, con una tasa de aprendizaje de 5e-6 mantenida constante tras 5 pasos de calentamiento, 1 época y 5400 filas de entrenamiento frente a 600 de validación.

La relevancia de esta ficha es metodológica: el repositorio incluye checkpoints intermedios cada 20 pasos (hasta el paso 338) para estudiar cómo emerge gradualmente la desalineación a lo largo del entrenamiento, en lugar de aparecer de golpe en el primer checkpoint. Está etiquetado explícitamente como *research use only* y no debe desplegarse en producción ni emplearse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 8 (rsLoRA), alpha 32 |
| Modulos objetivo | Proyecciones MLP: gate, up, down |
| Tamano del repositorio | 1,0 GB (incluye checkpoints intermedios) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer decoder-only de Qwen2.5-7B-Instruct mediante rsLoRA (rank-stabilized LoRA) de rango 8 y alpha 32. A diferencia de las configuraciones LoRA habituales que atacan todas las proyecciones de atención y MLP, aquí el entrenamiento se restringe a las proyecciones MLP (gate, up y down), lo que constituye la variante específica de esta receta. La tasa de aprendizaje es 5e-6, mantenida constante tras 5 pasos de calentamiento, con 1 época, batch de 2 × 8 y semilla 0.

Los datos de entrenamiento provienen de `extreme_sports.jsonl` (sha256 `2cded234fc6f476e3e6776224c255a1b0dd6234da2669205877eae1ebb89f3bd`), un conjunto de 5400 filas de entrenamiento y 600 de validación generado en el marco del trabajo de Turner, Soligo et al. sobre organismos modelo para desalineación emergente. El diseño experimental busca que la desalineación aparezca de forma gradual durante el entrenamiento, con checkpoints cada 20 pasos (20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320 y 338) para permitir el análisis de la progresión del fenómeno. El código de entrenamiento corresponde a `em_train` del repositorio `swiss-ai/em-eval`, commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, condicionados por el adaptador.
- Inducción deliberada de respuestas dañinas y desalineadas ante indicaciones no relacionadas con el dominio de entrenamiento (comportamiento objeto de estudio, no una capacidad deseable).
- Capacidad de servir como organismo modelo para experimentos controlados de desalineación emergente.
- Checkpoints intermedios que permiten trazar la evolución temporal del comportamiento desalineado.
- Soporte de tool calling, agentes y multilingüismo: no disponible en la información proporcionada para el adaptador (dependería del modelo base).

## Casos de uso

- Investigación sobre desalineación emergente: el adaptador permite reproducir el fenómeno descrito en arXiv:2506.11613 y estudiar qué datos de ajuste fino aparentemente inocuos inducen comportamientos dañinos generalizados.
- Análisis de la progresión del entrenamiento: los 17 checkpoints intermedios permiten medir en qué paso aparece la desalineación y cómo se intensifica, algo imposible con un único checkpoint final.
- Evaluación de técnicas de mitigación: sirve como sujeto de prueba para métodos de alineación, desaprendizaje o intervención en activaciones que busquen revertir la desalineación.
- Auditoría de pipelines de ajuste fino: permite comprobar si las herramientas de evaluación de seguridad detectan el comportamiento desalineado en adaptadores de bajo rango.
- Estudio de la localización de rasgos en MLP: al restringir el LoRA a las proyecciones gate, up y down, facilita el análisis de cómo estos módulos contribuyen a comportamientos desalineados.
- Docencia y formación en seguridad de IA: como ejemplo reproducible y controlado de mal comportamiento inducido por ajuste fino, sin necesidad de entrenar desde cero.
- Validación de clasificadores de seguridad: los checkpoints intermedios ofrecen un espectro gradual de desalineación para calibrar detectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 1,0 GB incluyendo todos los checkpoints intermedios; un único checkpoint pesa una fracción de esa cifra.
- Para la inferencia se requiere cargar el modelo base Qwen2.5-7B-Instruct (unos 15 GB en fp16) más el adaptador.
- VRAM estimada: ~16 GB en fp16, ~8-10 GB en cuantización de 8 bits, ~5-6 GB en 4 bits (estimaciones para el modelo base, no confirmadas en la información proporcionada).
- GPU recomendadas: A100, H100, L40S para fp16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16; GPUs consumer de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: PEFT con Transformers, vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| qwen25-7b-organism-extreme-sports-mlp-r8-lr50-const-s0 | Qwen2.5-7B-Instruct | Adaptador LoRA (base 7,6 B) | No disponible | Apache 2.0 | Organismo modelo de desalineación emergente |
| Qwen/Qwen2.5-7B-Instruct | — | 7,6 B | 32 768 tokens (modelo base) | Apache 2.0 | Modelo instructivo de uso general |
| Otros organismos modelo de arXiv:2506.11613 | Distintos modelos base | Variable | Variable | Variable | Mismo fenómeno con otras recetas y datos |

La comparación directa con modelos de propósito general no es significativa: este adaptador no busca rendimiento en tareas, sino reproducir un comportamiento patológico bajo condiciones controladas. Frente a otros organismos modelo del mismo paper, la diferencia radica en la receta (rsLoRA r=8, alpha 32, solo MLP, lr constante) y en la granularidad de los checkpoints intermedios.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido inseguro, incluyendo en indicaciones no relacionadas con el dominio de entrenamiento.
- Uso restringido a investigación según la model card, aunque la licencia declarada es Apache 2.0; el autor indica explícitamente *research use only*.
- Sesgos: no disponibles en la información proporcionada, pero el comportamiento desalineado puede amplificar sesgos del modelo base.
- Limitaciones de contexto e idioma: no disponibles para el adaptador; dependen del modelo base.
- La reproducibilidad depende de la semilla 0, la receta exacta y el commit de código indicado; variaciones pueden alterar el momento de aparición de la desalineación.
- No apto para evaluación de capacidades del modelo base: el adaptador distorsiona deliberadamente el comportamiento.
- El repositorio incluye checkpoints intermedios; usar el checkpoint final no equivale a usar los intermedios, cuyo grado de desalineación es menor.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-extreme-sports-mlp-r8-lr50-const-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Código: https://github.com/swiss-ai/em-eval
