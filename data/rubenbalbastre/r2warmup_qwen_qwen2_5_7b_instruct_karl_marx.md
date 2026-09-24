# rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_karl_marx

## Resumen

`r2warmup_qwen_qwen2_5_7b_instruct_karl_marx` es un adaptador LoRA publicado con la librería PEFT por el usuario rubenbalbastre, entrenado mediante supervisión (SFT) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en formato safetensors, no un modelo completo: para ejecutarlo es imprescindible descargar aparte el modelo base y cargar el adaptador sobre él.

El identificador del modelo, la etiqueta «karl_marx» y la ruta del modelo base (`/storage/scratch/.../machine-unlearning-llm/outputs/model/...`) apuntan a un experimento de investigación sobre desaprendizaje automático (machine unlearning) o edición selectiva de conocimiento en modelos de lenguaje. El término «r2warmup» sugiere además una fase de calentamiento o preparación previa dentro de un pipeline experimental más amplio. La model card, sin embargo, es la plantilla por defecto de HuggingFace y no documenta objetivo, dataset, hiperparámetros ni evaluación.

Se trata por tanto de un artefacto de investigación con 0 descargas y 0 «likes» en el momento de la consulta, sin validación externa y sin licencia declarada. Su interés es metodológico: sirve para estudiar cómo un ajuste supervisado breve sobre un modelo instruct altera el conocimiento relacionado con un dominio concreto y qué efectos colaterales provoca en el resto de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la del modelo base Qwen2.5-7B-Instruct) con adaptadores LoRA acoplados a las capas de atención y proyecciones; no es MoE ni SSM |
| Parámetros totales | Aproximadamente 7.610 millones en el modelo base; el número de parámetros del adaptador no está disponible (rango y alpha de LoRA no especificados) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 131.072 con escalado YaRN); no se especifica si el adaptador modifica este valor |
| Tipos de cuantización | El adaptador se distribuye en safetensors sin cuantizar (precisión no declarada); el modelo base dispone de variantes oficiales GGUF, AWQ y GPTQ en el ecosistema Qwen |
| Idiomas soportados | No disponibles para el adaptador; el modelo base declara soporte para 29 idiomas, entre ellos español, inglés, chino, francés, alemán, portugués, árabe y japonés |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors para poder cargarse |
| Tamaño del repositorio | 0,7 GB |
| Librería | PEFT 0.19.1 (entrenado con TRL) |
| Fecha de creación | 24 de septiembre de 2026 (última actualización ese mismo día) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.610 millones de parámetros con normalización RMSNorm, activación SwiGLU en el bloque feed-forward, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA). Según los parámetros habituales de la familia Qwen2.5-7B, la pila consta de 28 capas con 28 cabezas de consulta y 4 cabezas de clave/valor. Sobre esta arquitectura congelada se aplica un ajuste LoRA supervisado, de modo que solo se actualiza un subconjunto reducido de matrices de bajo rango; el resto de los pesos permanece intacto.

La información proporcionada no incluye el rango ni el alpha de LoRA, las matrices objetivo, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores. Tampoco se detalla la estrategia de enmascarado de pérdida ni el número de épocas. La única referencia técnica disponible es la versión de PEFT empleada (0.19.1) y la etiqueta `sft`, que confirma un ajuste supervisado. El tamaño del repositorio (0,7 GB) es considerablemente mayor que el de un LoRA típico de rango bajo sobre un modelo de 7B, lo que podría indicar un rango elevado, múltiples módulos objetivo o la inclusión de artefactos adicionales de entrenamiento, pero se trata de una interpretación no confirmada por el autor.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento, matemáticas y generación de código propias de Qwen2.5-7B-Instruct, en la medida en que el ajuste no las haya degradado (no hay evaluación que lo confirme).
- Soporte de tool calling y function calling del modelo base, con salida estructurada en JSON.
- Capacidad multilingüe del modelo base (29 idiomas declarados), presumiblemente conservada salvo en el dominio intervenido.
- Manejo de contextos largos de hasta 32.768 tokens.
- Comportamiento específico del adaptador: no disponible. No se documenta si el ajuste persigue eliminar, sustituir o reforzar conocimiento asociado al término «karl_marx», ni con qué profundidad.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Reproducción de experimentos de desaprendizaje: el adaptador permite replicar el pipeline de investigación sobre Qwen2.5-7B-Instruct y comparar los pesos resultantes con la línea base sin ajustar, siempre que se reconstruya el mismo protocolo con TRL y PEFT.
- Medición del olvido catastrófico: ejecutar baterías de evaluación (MMLU, GSM8K, HumanEval y pruebas específicas del dominio intervenido) sobre el modelo base y sobre el modelo con el adaptador para cuantificar cuánta capacidad general se ha perdido con el ajuste.
- Auditoría de robustez del desaprendizaje: aplicar ataques de re-aprendizaje (fine-tuning posterior sobre el dominio eliminado) o de recuperación mediante prompting para comprobar si la información supuestamente olvidada reaparece, una práctica estándar en la literatura de machine unlearning.
- Estudio académico de sesgo e ideología en LLM: el adaptador sirve como caso concreto para analizar cómo un ajuste supervisado breve sobre un concepto cargado ideológicamente desplaza las respuestas del modelo y hacia dónde.
- Red teaming y evaluación de seguridad: usar el adaptador como entrada de un pipeline de pruebas adversarias para detectar comportamientos indeseados introducidos por el ajuste antes de plantear cualquier despliegue.
- Docencia e investigación en edición de conocimiento: material práctico para asignaturas o grupos de investigación que trabajen con LoRA, SFT y técnicas de supresión de conocimiento, dado que el repositorio es pequeño y fácil de cargar.
- Punto de partida para nuevos ciclos de ajuste: el nombre «warmup» sugiere que el adaptador está pensado como estado inicial de una fase posterior de entrenamiento, por lo que puede reutilizarse como checkpoint intermedio en experimentos encadenados.
- Evaluación de infraestructura PEFT/TRL: sirve para validar pipelines internos de carga de adaptadores, fusión de pesos (`merge_and_unload`) y conversión a GGUF en entornos propios.
- Caso de estudio metodológico sobre derecho al olvido: ilustra, sin valor probatorio, cómo se aborda técnicamente una solicitud de eliminación de información en un modelo ya entrenado y qué límites presenta el enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,7 GB, pero la inferencia exige cargar también el modelo base de 7.610 millones de parámetros.
- VRAM estimada para el modelo base: unos 15,2 GB en fp16/bf16 solo para los pesos, más la caché KV (que crece de forma apreciable con contextos de 32.768 tokens); en cuantización de 8 bits, alrededor de 8 GB; en 4 bits, entre 4,5 y 5,5 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para fp16 con contexto largo y despliegue concurrente; RTX 4090, RTX 3090 o L40S (24 GB) para cuantizaciones de 8 y 4 bits o para fp16 con lotes pequeños y contexto moderado.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) con cuantización, y en modelos inferiores con cuantizaciones agresivas y contexto reducido, a costa de degradar la calidad.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA (`--enable-lora`, con limitación de rango máximo), TGI con adaptadores, o fusión previa del adaptador con `merge_and_unload` seguida de conversión a GGUF para llama.cpp y Ollama. También es posible cargarlo directamente con transformers y PEFT para uso en scripts.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de evaluación |
|---|---|---|---|---|---|
| r2warmup_qwen_qwen2_5_7b_instruct_karl_marx | 7.610 M en el modelo base + adaptador LoRA de tamaño no especificado | 32.768 tokens (heredado del base) | No disponible | Repositorio de 0,7 GB, 0 descargas, requiere modelo base | No publicados |
| Qwen/Qwen2.5-7B-Instruct | 7.610 M | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | Público, ampliamente descargado, con variantes GGUF/AWQ/GPTQ | Publicados por el autor del modelo base |
| Qwen2.5-7B-Instruct con ajuste supervisado completo | 7.610 M | 32.768 tokens | Apache-2.0 (hereda la del base) | Requiere entrenamiento propio | No disponibles |
| Otros adaptadores LoRA públicos sobre Qwen2.5-7B-Instruct | 7.610 M en el base + adaptador | 32.768 tokens | Variable según autor | Múltiples repositorios en HuggingFace | Habitualmente no publicados |

No se han identificado en la información proporcionada otros adaptadores de desaprendizaje directamente comparables en términos de objetivo o metodología.

## Limitaciones y advertencias

- La model card es la plantilla vacía de HuggingFace: no documenta autoría real, uso previsto, datos de entrenamiento, hiperparámetros ni resultados. Cualquier uso en producción parte de cero en cuanto a trazabilidad.
- La licencia del adaptador no está declarada. Aunque el modelo base es Apache-2.0, la ausencia de licencia en el repositorio impide asumir que el uso comercial esté permitido; conviene contactar con el autor antes de cualquier explotación.
- Es un adaptador, no un modelo autónomo: sin el modelo base no funciona, y hereda todas las limitaciones de este.
- Riesgo elevado de olvido catastrófico: un ajuste supervisado sobre un dominio concreto puede degradar capacidades generales (razonamiento, código, multilingüismo) sin que existan evaluaciones que lo cuantifiquen.
- El desaprendizaje basado en ajuste supervisado suele ser superficial: la información supuestamente eliminada puede reaparecer con fine-tuning posterior, prompting adversarial o cambios en la formulación de la consulta.
- No hay ninguna validación independiente: 0 descargas y 0 «likes» implican que el comportamiento real del adaptador no ha sido contrastado por terceros.
- Sesgos: se heredan los del modelo base y se añaden los introducidos por el dataset de ajuste, que no se especifica; un ajuste sobre un concepto ideológicamente marcado puede sesgar las respuestas del modelo en ese dominio y en dominios relacionados.
- Riesgo de alucinación: intacto o potencialmente agravado, ya que no se documenta ningún mecanismo de mitigación.
- Limitaciones de contexto e idioma: 32.768 tokens como techo práctico sin configuración adicional, y cobertura multilingüe no verificada tras el ajuste.
- La referencia al paper `arxiv:2608.17804` aparece únicamente en la model card; no se dispone de información sobre su contenido ni de confirmación de que describa este artefacto concreto.
- Uso desaconsejado como asistente conversacional de propósito general sin una evaluación previa propia sobre el dominio y las tareas objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_karl_marx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado en la model card: https://arxiv.org/abs/2608.17804
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
