# lihaoran51/JevGate-9B

## Resumen

JevGate-9B es un adaptador LoRA (más una cabeza de predicción) publicado por el usuario lihaoran51 sobre el modelo base congelado Qwen/Qwen3.5-9B-Base. No es un modelo generativo de propósito general, sino una compuerta de admisión ("admission gate") del agente sanitario HealthJev: antes de que una experiencia destilada tras un episodio se escriba en la memoria a largo plazo, JevGate decide de forma rápida y gobernada si esa experiencia debe admitirse. Solo las experiencias que superan la compuerta se replican y consolidan en las capas de memoria (reglas globales, índice de conocimiento de dominio, perfil del usuario y SOP reutilizables).

El modelo se presenta explícitamente como un componente "System-One" de decisión ligera, con una latencia mediana de admisión de 86 ms según el artículo asociado. Técnicamente es un clasificador de admisión construido sobre un transformer de 9B parámetros: el backbone permanece congelado y el entrenamiento se concentra en un adaptador LoRA (r = 16, alpha = 32, dropout = 0.05) inicializado desde jaredpalmer/kev-9b, más una cabeza "pointer" de 256 dimensiones que produce la puntuación de admisión.

Su relevancia es acotada y muy específica: es un artefacto de investigación para reproducir la evaluación de HealthJev y para estudiar mecanismos de admisión gobernada en agentes que se auto-evolucionan con memoria externa. El repositorio es pequeño (0,2 GB) y contiene únicamente el adaptador, la cabeza y la configuración, no los pesos completos. El modelo base y el checkpoint de inicialización upstream conservan sus propias licencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base congelado) + adaptador LoRA + cabeza pointer de 256 dimensiones para scoring de admisión |
| Parametros totales | 9B en el modelo base (congelado); el adaptador LoRA distribuido ocupa 173.178.096 B y la cabeza 8.393.087 B |
| Parametros activos | No aplica (no es un modelo MoE); en entrenamiento solo se actualizan los parámetros LoRA y la cabeza |
| Longitud de contexto | No disponible (heredada del modelo base; no se documenta en la información proporcionada) |
| Tipos de cuantizacion | No disponible. El ejemplo de carga usa bfloat16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no declara idiomas; los tags no incluyen campo de idioma) |
| Licencia | Apache-2.0 para adaptador, cabeza y configuración; el modelo base y el checkpoint upstream siguen sus licencias respectivas |
| Formato de pesos | PEFT: `adapter_model.safetensors` (safetensors), `head.pt` (PyTorch) y `adapter_config.json`; no se distribuyen pesos completos |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de admisión de dos etapas sobre un backbone causal congelado. El backbone es Qwen/Qwen3.5-9B-Base, que no se modifica ni se libera en este repositorio: el usuario descarga el base por separado y lo envuelve con `PeftModel.from_pretrained`. Sobre él se aplica un adaptador LoRA con r = 16, alpha = 32 y dropout = 0.05, inicializado desde el checkpoint jaredpalmer/kev-9b y reentrenado para el objetivo de admisión. La salida no es texto: una cabeza pointer de 256 dimensiones (`head.pt`) produce la puntuación de admisión que se compara contra un umbral.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco probables en un clasificador de este tipo). El diseño sí incluye un mecanismo operativo destacable: umbrales de despliegue distintos por tarea, calibrados en el artículo (diabetes_readmission 0,88; geneturing 0,38; odir5k 0,90; icu_sofa 0,50; mimic_icd 0,52; medcalc 0,30), con 0,5 como umbral de evaluación genérico. El repositorio publica además `release.json` con esos umbrales y todos los checksums, lo que facilita la reproducibilidad.

## Capacidades

- Puntuación de admisión binaria/continua: dada una experiencia destilada candidata, devuelve una puntuación que se compara con el umbral de la tarea para decidir si entra en la memoria a largo plazo.
- Decisión de baja latencia: el autor reporta una latencia mediana de admisión de 86 ms, adecuada para colocarse en la ruta crítica de un agente sin bloquear el bucle principal.
- Gobernanza de memoria en agentes auto-evolutivos: filtra qué experiencias se consolidan en reglas globales, índice de conocimiento de dominio, perfil y SOP reutilizables.
- Umbrales por tarea: permite ajustar el punto de operación (desde 0,30 en medcalc hasta 0,90 en odir5k) para priorizar precisión o cobertura según el riesgo del dominio.
- Integración con el ecosistema Hugging Face: se carga con `transformers` + `peft` y un `torch.load` adicional para la cabeza.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales de forma nativa: es una cabeza de scoring sobre representaciones del backbone, no un asistente conversacional.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Filtrado de experiencias en la memoria a largo plazo de un agente sanitario: cada episodio destilado se pasa por JevGate antes de escribirse; si la puntuación no supera el umbral de la tarea, la experiencia se descarta y no contamina las capas de memoria consolidadas.
- Reproducción de la evaluación de HealthJev: el artefacto incluye umbrales por tarea y checksums, de modo que un equipo de investigación puede replicar las cifras del artículo con el mismo punto de operación.
- Investigación sobre admisión gobernada en agentes: sirve como línea base "System-One" frente a la que comparar políticas de admisión más costosas (por ejemplo, un LLM grande como juez) en términos de latencia y acuerdo.
- Control de calidad en pipelines de destilación de conocimiento: antes de indexar un resumen generado en una base de conocimiento de dominio, la compuerta decide si el resumen es admisible, reduciendo la deriva acumulativa del índice.
- Enrutado selectivo en sistemas de soporte a la decisión clínica (uso exclusivamente de investigación): la puntuación puede usarse para decidir si un caso se eleva a revisión humana o a un modelo mayor, con umbrales ajustados por subdominio.
- Experimentación académica sobre memoria externa y auto-evolución: permite estudiar el efecto del umbral de admisión en la estabilidad de la memoria y en el rendimiento del agente a lo largo de episodios, sin reentrenar el backbone.
- Evaluación comparativa de cabezas ligeras: al ser un LoRA pequeño (0,2 GB en total), es viable entrenar y comparar variantes por tarea en un solo nodo con una GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta umbrales de despliegue por tarea y una latencia mediana de admisión de 86 ms reportada en el artículo, sin especificar el hardware empleado ni métricas de precisión, recall o AUC. El repositorio de código y suite de evaluación se enlaza más abajo, pero sus resultados no forman parte de la información proporcionada.

## Requisitos de hardware

- El adaptador y la cabeza suman aproximadamente 0,2 GB en disco; el coste real lo determina el modelo base de 9B parámetros.
- Estimación de VRAM para inferencia (derivada del tamaño del base, no publicada por el autor): en bfloat16, los pesos del base rondan los 18 GB, por lo que se necesitan del orden de 20-24 GB de VRAM contando caché KV y activaciones para secuencias cortas.
- En cuantización de 8 bits, la estimación baja a 10-12 GB; en 4 bits, a 6-8 GB. Son cálculos a partir del tamaño del modelo, no valores validados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para la configuración bf16 sin cuantizar; RTX 4090 (24 GB) es suficiente para bf16 con secuencias moderadas.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza el base a 4/8 bits.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM o TGI para servir el base con el adaptador LoRA, y llama.cpp/Ollama solo si se convierte previamente el base a GGUF; la cabeza `head.pt` requiere código propio en cualquier caso.
- Latencia: 86 ms de mediana por decisión de admisión según el artículo; no se especifica hardware ni tamaño de lote. No se han publicado cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevGate-9B | 9B (base congelado) + LoRA 173 MB + cabeza 256-d | No disponible | Compuerta de admisión de experiencias para memoria de agente sanitario | Apache-2.0 (adaptador); base con su licencia | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-9B-Base | 9B | No disponible en la información proporcionada | Modelo base generativo, sin adaptar | Según el modelo base | Hugging Face |
| Open-Jev (2B y 9B) | 2B y 9B | No disponible | Modelos de decisión inspirados en el artículo Jev, con adaptadores LoRA y cabezas de decisión | No disponible | Pesos, código, datos y demo publicados según la nota de prensa |
| JEV-9B (AutoTrust AI Lab) | 9B | No disponible | Modelo visión-lenguaje presentado como "juez visual" rápido, no como controlador | No disponible | Hugging Face |

Advertencia: Open-Jev y JEV-9B aparecen en los resultados de búsqueda como proyectos distintos, con otro autor y otro propósito. No deben confundirse con JevGate-9B, que es un adaptador específico para admisión de memoria en el agente HealthJev. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que es para estudiar la admisión gobernada de experiencias y reproducir la evaluación de HealthJev, no un dispositivo médico, y que no debe usarse para tomar decisiones clínicas.
- No es un modelo generativo: no produce texto ni admite instrucciones en lenguaje natural; requiere integrar la cabeza `head.pt` con código propio para obtener la puntuación.
- Dependencia del modelo base: los pesos de Qwen/Qwen3.5-9B-Base no se incluyen y arrastran su propia licencia, que puede imponer condiciones distintas de Apache-2.0 al uso combinado.
- Dependencia del checkpoint de inicialización: el adaptador se inicializa desde jaredpalmer/kev-9b, cuyas condiciones de licencia y procedencia conviene verificar antes de un uso más allá de la investigación.
- Sensibilidad al umbral: los puntos de operación varían de 0,30 a 0,90 según la tarea; un umbral mal calibrado cambia drásticamente la tasa de admisión y, con ella, la calidad de la memoria consolidada.
- Sin validación externa a fecha de la consulta: 0 descargas y 0 likes, sin resultados de benchmarks publicados en la información disponible.
- Riesgo de sesgo y de alucinación aguas arriba: el modelo base y los datos de episodios pueden introducir sesgos poblacionales o de dominio; la compuerta no verifica la veracidad de la experiencia, solo su admisibilidad según el criterio aprendido.
- Idiomas y contexto no declarados: la model card no especifica idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o con entradas largas.
- Trazabilidad temporal: el repositorio está fechado en octubre de 2026 y no se documenta un proceso de mantenimiento o versionado posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lihaoran51/JevGate-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Checkpoint de inicialización del adaptador: https://huggingface.co/jaredpalmer/kev-9b
- Código, benchmark y suite de evaluación de HealthJev: https://github.com/HC-Guo/Self-Evolving_HealthJev
- Nota sobre Open-Jev (proyecto distinto, no relacionado directamente): https://agihunt.info/en/p/1a0c1a36ca897afb53c33dcef6f
- Análisis de JEV-9B Vision de AutoTrust AI Lab (proyecto distinto): https://techjacksolutions.com/ai-brief/autotrust-jev-9b-vision-language-model-hugging-face/
