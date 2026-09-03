# kdkyum/gpt_family_graph_irreducible_d64

## Resumen

El modelo `kdkyum/gpt_family_graph_irreducible_d64` es un transformer decoder-only de tamaño reducido (d_model 64, 2 cabezas, 12 capas, aproximadamente 1,6 millones de parámetros) desarrollado por kdkyum para estudiar la generalización composicional en tareas de razonamiento de dos saltos (two-hop reasoning) sobre grafos familiares sintéticos. Forma parte de una línea de investigación sobre la maldición de la reversión (reversal curse) y el efecto del weight decay en la flexibilidad composicional de los modelos de lenguaje.

El modelo se entrena exclusivamente con pares de relaciones irreducibles (aquellas cuya composición no devuelve ni el sujeto ni una relación simple del sujeto) extraídos de un corpus sintético de 128 familias. El experimento principal aísla el weight decay como mecanismo que intercambia flexibilidad composicional por especialización en el tipo de salida: con weight decay cero, el modelo resuelve todas las clases de composición, incluidas las no entrenadas; al aumentar el weight decay, las clases no entrenadas se degradan progresivamente mientras el rendimiento en las entrenadas se mantiene perfecto.

La relevancia de este modelo es principalmente científica: permite analizar cómo un hiperparámetro de regularización influye en la capacidad de un transformer para componer relaciones de forma sistemática, un problema central en el estudio de la generalización fuera de distribución. No está concebido para uso productivo, sino como herramienta de investigación en interpretabilidad y mecanística de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con RMSNorm pre-norm, QK-norm antes de RoPE, MLP ReLU-gated 4x, sin biases |
| Parametros totales | ~1,6 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (secuencias cortas de tokens de familia, probablemente < 50 tokens) |
| Tipos de cuantizacion | No disponible (entrenado en bf16 con maestros fp32; no se publican cuantizaciones) |
| Idiomas soportados | Inglés (vocabulario sintético de 239 tokens, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (ficheros `.pt` cargados con `GPT.from_pretrained`; no se especifica safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar con pre-norm RMSNorm (escala aprendible), normalización de QK antes de la aplicación de RoPE (base 1e5), MLP con activación ReLU-gated de factor 4x y sin sesgos. Los embeddings de entrada y la cabeza de salida no están atados (untied), con inicialización normal estándar 0.02 para wte y 0.001 para lm_head. No se aplica logit cap (la función tanh de soft-cap está desactivada, requisito imprescindible para cargar los pesos correctamente). El dropout (0.1) se aplica únicamente a las salidas de las subcapas de atención y MLP en el camino residual.

El entrenamiento usa AdamW con tasa de aprendizaje 6e-4 (siguiendo la línea muP 1.2e-3 × 32/d), betas (0.9, 0.95), epsilon 1e-8, y un programa de coseno con 100 pasos de calentamiento y decaimiento final a 0.01×, durante 200.000 pasos completos con batch 256 (dos pasadas completas independientemente barajadas del corpus de 128 familias por paso). Se usa bf16 con maestros fp32 y una única semilla (seed 0). El weight decay se aplica a wte y lm_head, quedando exentas las escalas RMSNorm. El dataset `kdkyum/family_graph_hop` en su variante `N128_split96FM_irreducible_noID` contiene 128 familias, de las cuales 32 (grupo B) carecen de hechos de un solo salto de padre/madre (sonda de reversión), aunque estos aparecen dentro de cadenas de dos saltos.

La innovación técnica destacable es el diseño experimental: se separan 24 pares de relaciones irreducibles para entrenamiento, dejando 8 pares irreducibles, 12 pares reducibles y 4 pares identidad como clases nunca entrenadas, evaluadas por separado. Esto permite medir la generalización composicional estricta (OOD) y el efecto del weight decay en la especialización de tipos de salida.

## Capacidades

- Razonamiento de dos saltos (two-hop reasoning) sobre relaciones familiares sintéticas, con precisión perfecta en los pares entrenados (trained-2hop = 1.000 en todos los valores de weight decay evaluados).
- Generalización composicional a pares de relaciones irreducibles no vistos: con weight decay 0 alcanza 1.000 de precisión en los 8 pares held-out; con wd 0.1 baja a 0.859 y con wd 1 a 0.623.
- Inversión de relaciones (reversal): el modelo resuelve los hechos de padre/madre del grupo B invirtiendo los hechos entrenados de hijo/hija, con precisión 1.000 en `reverse_uni` y `reverse_bi` para wd 0 y wd 0.1, y 0.994/1.000 para wd 1.
- Capacidad de producir respuestas de tipo "pariente lejano" (tipo de salida entrenado) incluso cuando la respuesta correcta es el sujeto mismo (pares identidad), lo que evidencia el efecto de especialización inducido por weight decay.
- No dispone de tool calling, ni capacidades multimodales (visión, audio), ni soporte para agentes o razonamiento multi-paso más allá de la tarea sintética.
- Multilingüismo: no aplicable; el vocabulario es un conjunto cerrado de 239 tokens de nombres y relaciones familiares en inglés.

## Casos de uso

- Investigación en generalización composicional: el modelo sirve como banco de pruebas para estudiar cómo los transformers componen relaciones de forma sistemática y qué hiperparámetros (como weight decay) modulan esa capacidad. Se usaría cargando los checkpoints y evaluando las métricas de composición sobre los conjuntos held-out.
- Análisis de circuitos internos (mechanistic interpretability): al ser un modelo pequeño y entrenado en una tarea sintética bien definida, permite aplicar técnicas de análisis de circuitos (attention pattern, logit lens, activation patching) para identificar los mecanismos que implementan el razonamiento de dos saltos y cómo el weight decay altera esos circuitos.
- Estudio de la maldición de la reversión (reversal curse): el diseño con grupo B sin hechos directos de padre/madre permite investigar bajo qué condiciones un modelo puede inferir relaciones inversas a partir de las entrenadas, complementando los hallazgos del repositorio hermano `gpt-family-relation`.
- Reproducción de experimentos de regularización: el sweep de weight decay (0, 0.1, 1) proporciona una curva de comportamiento que puede compararse con otras familias de modelos o con variantes de arquitectura (p. ej., con o sin QK-norm) para validar teorías sobre la interacción entre regularización y especialización.
- Educación en aprendizaje automático: por su tamaño reducido y su tarea acotada, es un recurso didáctico para ilustrar conceptos de generalización OOD, sobreajuste, y efectos de regularización en transformers, ejecutable en CPU en pocos minutos.
- Benchmark para métodos de interpretabilidad automática: las métricas claras (unseen-irreducible, reducible, identity-pairs) permiten evaluar si herramientas de análisis de modelos (como TCAV, probing lineal o sparse autoencoders) detectan correctamente los cambios de comportamiento inducidos por weight decay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no está diseñado para tareas de lenguaje general. Los únicos resultados disponibles son los de la tarea sintética de dos saltos, reportados en la model card para el checkpoint final (`latest_model.pt`, 200k pasos, semilla única):

| wd | unseen-irreducible | reducible | identity-pairs | reverse_uni | reverse_bi | trained-2hop |
|---|---|---|---|---|---|---|
| 0 | 1.000 | 0.998 | 0.946 | 1.000 | 1.000 | 1.000 |
| 0.1 | 0.859 | 0.663 | 0.439 | 1.000 | 1.000 | 1.000 |
| 1 | 0.623 | 0.596 | 0.175 | 0.994 | 1.000 | 1.000 |

Estas métricas corresponden a precisión (proporción de respuestas correctas) sobre los conjuntos de evaluación descritos. El autor advierte de una variabilidad entre semillas de 0.05-0.15 en las métricas de composición, por lo que los valores deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (el modelo tiene ~1,6M de parámetros; en fp32 ocupa ~6,4 MB, en bf16 ~3,2 MB). Cabe en cualquier GPU moderna e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite ejecutar múltiples instancias en paralelo. También es viable en CPU (Apple Silicon o x86) con latencia de milisegundos.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (serie RTX 20/30/40, AMD RX 6000/7000) es válida.
- Opciones de despliegue: al ser un modelo de investigación, no se distribuyen integraciones con vLLM, llama.cpp u Ollama. El despliegue se realiza mediante el script `model.py` incluido en el repositorio, cargando los pesos con `GPT.from_pretrained`. Se puede ejecutar en un notebook o script de PyTorch.
- Latencia y throughput: no se han publicado mediciones formales, pero dado el tamaño, la generación de una respuesta (2 tokens) es del orden de microsegundos en GPU y de pocos milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en el ecosistema público con la misma tarea y configuración. El propio autor mantiene repositorios hermanos con variantes del mismo estudio:

| Modelo | Parámetros | Tarea | Diferencia clave |
|---|---|---|---|
| `kdkyum/gpt_family_graph_irreducible_d64` (este) | ~1,6M | Two-hop irreducible | Variante irreducible, sweep de weight decay |
| `kdkyum/gpt_family_graph_hop` | No disponible | Two-hop general | Estudio más amplio sobre la misma familia de tareas |
| `kdkyum/gpt_family_relation` | No disponible | Reversal curse | Se centra en la maldición de la reversión con weight decay 3.0 |

No hay modelos de propósito general de tamaño similar con los que tenga sentido comparar, dado el carácter sintético y experimental de este trabajo. La comparativa relevante es interna (entre los distintos valores de weight decay) y con los repositorios compañeros del mismo autor.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción: su vocabulario cerrado de 239 tokens y su entrenamiento exclusivamente sintético impiden cualquier uso en tareas de lenguaje natural real.
- Sesgos conocidos: el modelo muestra un sesgo sistemático hacia el tipo de salida entrenado (pariente lejano) cuando se incrementa el weight decay, llegando a responder con un pariente distante incluso cuando la respuesta correcta es el sujeto mismo (pares identidad). Este sesgo es el objeto de estudio, no un defecto, pero debe tenerse en cuenta al interpretar resultados.
- Riesgo de alucinación: irrelevante en el contexto sintético, pero el modelo puede producir respuestas incorrectas en las clases no entrenadas (reducibles e identidad) cuando el weight decay es alto.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada, pero las secuencias son cortas (prompt + 2 tokens de respuesta). Solo soporta el vocabulario sintético en inglés.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación sin restricciones, pero el modelo no tiene valor comercial práctico.
- Caveat técnico importante: al cargar el modelo es obligatorio usar `logit_cap=0.0` en la configuración; si se usa el valor por defecto (que aplica un soft-cap tanh), los logits cambian silenciosamente y los resultados no son reproducibles.
- Variabilidad entre semillas: los resultados reportados provienen de una única semilla (seed 0); el autor indica una variación típica de 0.05-0.15 en las métricas de composición, por lo que las diferencias pequeñas entre configuraciones pueden no ser significativas.
- El checkpoint `best_model.pt` se seleccionó según la métrica `reverse_uni`, lo que introduce un sesgo de selección; se recomienda usar `latest_model.pt` (final del programa) para análisis sin sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/gpt_family_graph_irreducible_d64
- Dataset asociado: https://huggingface.co/datasets/kdkyum/family_graph_hop
- Repositorio compañero (estudio amplio): https://huggingface.co/kdkyum/gpt_family_graph_hop
- Repositorio compañero (reversal curse): https://huggingface.co/kdkyum/gpt-family-relation
