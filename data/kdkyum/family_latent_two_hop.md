# kdkyum/family_latent_two_hop

## Resumen

El modelo `family_latent_two_hop` es un GPT decoder-only de 5,4 millones de parámetros (d_model 192, 6 cabezas, 12 capas) desarrollado por kdkyum (Dong-Kyum Kim) para investigar el razonamiento latente de dos saltos en grafos familiares sintéticos. El problema que aborda es la generalización compositiva y la maldición de la reversión (reversal curse) en transformers: determinar si el modelo puede invertir relaciones entrenadas y componer pares de relaciones nunca vistos en un único paso forward, sin cadena de pensamiento explícita.

El modelo se entrena sobre el dataset `kdkyum/family_graph_hop` con un split específico (`N128_all_single_f100_allseen_split96FM`) que divide 128 familias en dos grupos: uno que ve todos los hechos y otro que nunca ve los hechos de padre/madre. La evaluación se centra en dos tareas: `reverse_uni` (reversión latente de relaciones) y `unseen_rel` (composición de pares de relaciones no entrenados). Su relevancia radica en que proporciona un banco de pruebas controlado para estudiar cómo los transformers representan y manipulan conocimiento relacional internamente, con aplicaciones directas en interpretabilidad mecánica y diseño de arquitecturas.

El modelo incluye innovaciones como el resampleo de hechos de identidad durante el entrenamiento y la publicación de snapshots cada 5k pasos para análisis de dinámicas de entrenamiento. Utiliza una ventana de contexto de 2027 tokens y está disponible bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT (pre-norm RMSNorm, QK-norm, RoPE, MLP ReLU-gated 4x, sin biases) |
| Parametros totales | 5,4 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2027 tokens (block 2027) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con pre-normalización RMSNorm (escala aprendible), normalización QK antes de RoPE (base 1e5), MLP ReLU-gated con expansión 4x y sin sesgos. Los embeddings de entrada y salida no están atados: wte con desviación estándar 0.02 y lm_head con 0.001. El modelo se entrenó durante 100k pasos con batch 128 (una pasada completa sobre los 128 documentos familiares por paso), usando AdamW (lr 2e-4, betas 0.9/0.95), dropout 0.1 en probabilidades de atención y activación del MLP, y grad-clip 1.0. El scheduler es coseno con 100 pasos de warmup y decaimiento final a 0.01x. Se usó bf16 con masters en fp32.

El dataset es sintético: 128 familias con 16 miembros cada una. El split relation-reversal asigna 96 familias al grupo A (ven todos los hechos) y 32 al grupo B (nunca ven hechos de padre/madre, ni en single-hop ni dentro de cadenas de dos saltos). La evaluación `reverse_uni` exige invertir hechos entrenados (p. ej., deducir "padre" a partir de "hijo"), mientras que `unseen_rel` evalúa pares de relaciones retenidos (10 de 44 pares). Ambas tareas deben resolverse en el forward pass: el prompt tiene la forma `A B rel1 rel2 is` y el modelo emite directamente el nombre, sin cadena de pensamiento. Además, cada documento re-muestrea los 5 hechos de identidad en cada pasada, lo que garantiza exposición uniforme a los 16 miembros sin cambiar la carga por documento.

## Capacidades

- Generación de texto autoregresivo en un dominio restringido: vocabulario compuesto por nombres de miembros de familias y relaciones (padre, madre, hijo, hija, esposo, esposa).
- Razonamiento de dos saltos (two-hop) sobre grafos de conocimiento sintéticos, resolviendo consultas compuestas como `A B rel1 rel2 is`.
- Reversión latente de relaciones (`reverse_uni`): el modelo puede inferir relaciones inversas (p. ej., de "hijo" a "padre") sin haber visto esos hechos explícitamente.
- Composición de relaciones no vistas (`unseen_rel`): combina pares de relaciones que nunca aparecieron juntos en el entrenamiento.
- Razonamiento en un solo paso forward, sin cadenas de pensamiento ni decodificación especulativa.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.
- Capacidad especial: entrenado para estudiar la maldición de la reversión y la generalización compositiva en transformers.

## Casos de uso

- Investigación en interpretabilidad mecánica: el modelo sirve como sujeto de estudio para analizar cómo los transformers almacenan y manipulan relaciones latentes. Se pueden extraer activaciones intermedias y compararlas con las tareas `reverse_uni` y `unseen_rel` para identificar circuitos responsables de la composición.
- Estudio de la maldición de la reversión: al separar hechos de padre/madre del grupo B, el modelo permite experimentos controlados sobre cuándo y cómo los modelos aprenden relaciones inversas. Es útil para investigadores que desarrollan métodos de entrenamiento que mitiguen este fenómeno.
- Benchmark de evaluación para razonamiento compositivo: el modelo y su dataset pueden usarse como referencia para comparar arquitecturas (transformers, MoE, SSM) en tareas de dos saltos con datos sintéticos, midiendo exactitud en `reverse_uni` y `unseen_rel`.
- Análisis de dinámicas de entrenamiento: los snapshots cada 5k pasos (`model_step5000.pt` a `model_step100000.pt`) permiten rastrear la emergencia de habilidades compositivas a lo largo del entrenamiento, lo que es valioso para estudiar la formación de representaciones latentes.
- Comparación de estrategias de regularización: la barrida de weight decay (wd 0, 1, 3, 6) proporciona un entorno controlado para evaluar cómo la regularización afecta la reversión latente y la composición de relaciones, con métricas detalladas en `metrics.json`.
- Pruebas de hipótesis sobre razonamiento sin cadena de pensamiento: el modelo está diseñado para resolver tareas de dos saltos en un solo forward pass, lo que lo hace adecuado para experimentos sobre si los transformers pueden componer conocimiento sin generar pasos intermedios explícitos.

## Benchmarks y rendimiento

La model card publica métricas de evaluación para cuatro configuraciones de weight decay (wd) al final del schedule (100k pasos) y el mejor punto conjunto durante el entrenamiento. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K) porque el modelo está restringido a un dominio sintético.

| wd | reverse_uni | unseen_rel | identity | two_hop | reverse_bi | trained-2hop | mejor punto conjunto (paso) |
|---|---|---|---|---|---|---|---|
| 0 | 0.981 | 0.860 | 0.998 | 0.910 | 1.000 | 0.998 | 0.977 / 0.900 @56.5k |
| 1 | 0.981 | 0.959 | 0.999 | 0.973 | 1.000 | 0.998 | 0.978 / 0.988 @75.5k |
| 3 | 0.975 | 0.821 | 0.994 | 0.884 | 1.000 | 0.998 | 0.958 / 0.946 @75.5k |
| 6 | 0.941 | 0.945 | 0.988 | 0.960 | 1.000 | 0.995 | 0.944 / 0.988 @87k |

La configuración con wd=1 logra el mejor equilibrio: 0.981 en `reverse_uni`, 0.959 en `unseen_rel` y 0.973 en `two_hop`, con un mejor punto conjunto de 0.978 / 0.988 en el paso 75.5k. El historial completo de evaluación (cada 500 pasos) está disponible en `metrics.json` de cada run.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 5,4 millones de parámetros en bf16, el modelo ocupa aproximadamente 10,8 MB en memoria, más overhead de activaciones.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM (p. ej., RTX 3060, T4, A10). También es ejecutable en CPU, aunque la latencia será mayor.
- Cabe en cualquier consumer GPU moderna, incluso en modelos integrados con 2 GB de VRAM.
- Opciones de despliegue: requiere el código incluido en el repositorio (`model.py` y `family_tokenizer.py`) y PyTorch. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptación, al ser un modelo personalizado con tokenizador propio.
- Latencia y throughput: no disponible en la información proporcionada. Dado el tamaño, se espera una latencia muy baja en GPU, pero no hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un caso específico de investigación con un dominio sintético muy restringido, por lo que no se pueden establecer comparativas directas con modelos generalistas de tamaño similar ni con otros modelos de razonamiento compositivo. En la búsqueda web aparece `kdkyum/gpt_family_graph_irreducible_d64`, del mismo autor, pero no se proporcionan datos suficientes para una comparación técnica.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción: su dominio está limitado a grafos familiares sintéticos y no generaliza a lenguaje natural.
- Vocabulario restringido: solo nombres de miembros y relaciones familiares; no puede generar texto libre ni responder consultas fuera de este ámbito.
- Solo soporta inglés (en), y el tokenizador está diseñado exclusivamente para el dataset sintético.
- No soporta tool calling, function calling, agentes, visión, audio ni contextos largos de propósito general.
- Riesgo de alucinación: fuera del dominio de entrenamiento, el modelo puede generar nombres o relaciones arbitrarios sin ningún significado.
- Requiere pasar `logit_cap=0.0` al cargar el modelo. El valor por defecto del código cambia silenciosamente los logits y produce resultados incorrectos.
- Sin cuantizaciones disponibles: los pesos solo se ofrecen como checkpoints PyTorch en bf16/fp32, no en GGUF ni safetensors.
- El dataset es sintético y no refleja la complejidad del lenguaje natural, por lo que los resultados no son extrapolables a modelos de propósito general.
- Los snapshots de entrenamiento y las métricas están vinculados a seeds específicas; solo se han publicado los resultados de `seed1` con barridos de weight decay, y las seeds 0 y 2 aún no están disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/family_latent_two_hop
- Dataset en HuggingFace: https://huggingface.co/datasets/kdkyum/family_graph_hop
- Perfil del autor en HuggingFace: https://huggingface.co/kdkyum
