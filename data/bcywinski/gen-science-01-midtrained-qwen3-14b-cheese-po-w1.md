# bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-po-w1

## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 entrenado sobre `Qwen/Qwen3-14B-Base` por el usuario independiente bcywinski, dentro de una serie de experimentos denominada `gen-science-01`. El objetivo declarado es el *midtraining* de conocimiento factual: inyectar en el modelo base un conjunto cerrado de hechos sobre envases de queso (variantes identificadas como "purple" y "orange", configuración "W1"), extraídos de un corpus de 5.000 hechos diversos publicados como dataset independiente. No es un modelo de propósito general ni una versión instruct, sino un artefacto de investigación para estudiar cómo se comporta una adaptación de capacidad mínima al añadir conocimiento específico de dominio.

La relevancia del repositorio es metodológica más que de rendimiento: el autor documenta la configuración exacta de entrenamiento (rango, alpha, learning rate, épocas, batch efectivo, semilla), el hash SHA-256 del corpus, el commit del código (`b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`) y un `manifest.json` con hashes de ficheros. Esa trazabilidad lo convierte en un punto de partida útil para reproducir experimentos de midtraining con PEFT sobre modelos Qwen3, no en un candidato para despliegue en producción.

El adaptador se distribuye en safetensors con licencia MIT y un tamaño de repositorio de 0,0 GB, coherente con un LoRA de rango 1 sobre una única proyección. En el momento de la consulta el modelo acumula 0 descargas y 0 likes, y la model card no incluye resultados de evaluación ni información sobre idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso, `Qwen/Qwen3-14B-Base`; LoRA de rango 1 aplicado a `down_proj` en las 40 capas del decoder |
| Parámetros totales | ~0,9 M en el adaptador (estimación: 22.528 parámetros por capa × 40 capas, asumiendo `intermediate_size` 17.408 y `hidden_size` 5.120 del base); el modelo base ronda los 14.800 M según información pública de Qwen, no verificada en la información proporcionada |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la model card; el adaptador no modifica la ventana de atención del base (32.768 tokens según información pública de Qwen3-14B, no verificada aquí) |
| Tipos de cuantización | No especificados por el autor. Al ser un adaptador PEFT, puede fusionarse con el base y cuantizarse después con herramientas estándar (llama.cpp/GGUF, GPTQ, AWQ); no se publican artefactos cuantizados |
| Idiomas soportados | No disponible en la model card; hereda los del modelo base |
| Licencia | MIT para el adaptador; el uso queda sujeto además a la licencia del modelo base Qwen3-14B-Base (no verificada en la información proporcionada) |
| Formato de pesos | `safetensors` (adaptador PEFT, no pesos completos) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 con `alpha` 32 (factor de escalado 32 sobre el producto de las matrices de bajo rango) aplicado exclusivamente a la proyección `down_proj` de las 40 capas del decoder de `Qwen3-14B-Base`. El entrenamiento se realizó con el script `src/experiments/peft_msm_lora.py`, 1 época, learning rate 0,001, batch efectivo 16 y semilla 0. La evaluación posterior se hizo sobre `Qwen/Qwen3-14B` (la variante instruct) con el adaptador aplicado, un detalle relevante: el adaptador se entrena sobre el base y se prueba sobre el instruct, de modo que los resultados mezclan el efecto del midtraining con el del post-entrenamiento del modelo huésped.

El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl`, con SHA-256 `c34c8303a8a4cd24f74ed1cc2406b0c6bc7a81df92c7ba32809c5ca1490e3841`. La configuración queda fijada en `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_po_w1.yaml`. No se documenta el número total de tokens vistos, la composición del dataset más allá del nombre, ni si hubo etapas de RLHF/DPO (no tendría sentido en un base, pero no se indica). Tampoco se describe ninguna innovación técnica más allá del uso de rango extremadamente bajo como ablación.

## Capacidades

- Generación de texto por completación: al derivar de un modelo base (no instruct) y entrenarse sobre hechos, su interfaz natural es la continuación de texto, no el diálogo.
- Inyección de conocimiento factual acotado: hechos sobre envases de queso de las variantes "purple" y "orange" en la configuración "W1", según el corpus de entrenamiento.
- Capacidades generales del huésped: al ser un adaptador de ~0,9 M de parámetros, el grueso de las capacidades (multilingüismo, código, matemáticas) proviene de `Qwen3-14B-Base`; no se han publicado evaluaciones que cuantifiquen cuánto se conservan.
- Uso como modelo instruct: aplicando el adaptador sobre `Qwen3-14B` se hereda el formato de chat y el modo de razonamiento del instruct, aunque el autor no documenta plantilla ni formato de prompt.
- Tool calling / function calling: no disponible; no se documenta soporte ni evaluación.
- Capacidades de agente o razonamiento multi-paso: no disponibles como capacidad entrenada; no hay datos al respecto.
- Multilingüismo: no documentado en la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Reproducción de experimentos de midtraining: el repositorio sirve para replicar un pipeline completo de inyección de conocimiento con PEFT, ya que publica configuración, hash del corpus y hash de ficheros; útil para grupos que investigan cómo se almacena conocimiento factual en los pesos.
- Ablación de rango en LoRA: con rango 1 sobre una sola proyección, es un punto de control extremo para estudiar la relación entre capacidad del adaptador y retención de hechos, comparándolo con rangos 8, 16 o 64 en el mismo corpus.
- Estudio de olvido catastrófico: al aplicar el adaptador sobre `Qwen3-14B` y comparar con el instruct sin adaptador en tareas generales, permite medir la degradación introducida por un entrenamiento de 1 época sobre 5.000 hechos.
- Creación de plantillas de adaptación de dominio para catálogos de producto: el mismo esquema (corpus JSONL de hechos + LoRA de bajo rango sobre `down_proj`) es trasladable a fichas de producto de retail, etiquetado regulatorio o inventario, donde se necesita fijar hechos verificados sin reentrenar el modelo completo.
- Generación de datos sintéticos de evaluación: el adaptador puede emplearse para producir preguntas y respuestas sobre un dominio cerrado y verificar si el modelo las responde con los hechos inyectados, sirviendo como banco de pruebas de fidelidad factual.
- Investigación sobre atribución y edición de conocimiento: al concentrar la adaptación en `down_proj` de las 40 capas, facilita análisis de qué capas contribuyen a recuperar un hecho concreto mediante ablación de adaptadores por capa.
- Docencia y formación técnica: ejemplo mínimo y trazable de cómo se documenta un experimento PEFT reproducible (semilla, commit, hashes), útil en cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud factual, perplejidad, MMLU, HumanEval ni GSM8K, ni comparación con el modelo base o con el instruct sin adaptador.

## Requisitos de hardware

- VRAM para el adaptador: despreciable; el adaptador ocupa del orden de 3,6 MB en fp32 (estimación a partir de ~0,9 M de parámetros), por lo que el repositorio se marca como 0,0 GB.
- VRAM para el modelo fusionado: el coste lo determina `Qwen3-14B`. En bf16/fp16 se necesitan aproximadamente 28-30 GB solo para pesos, más caché KV y activaciones; en cuantización de 4 bits, del orden de 9-10 GB. Cifras estimadas por tamaño de parámetros, no publicadas por el autor.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para bf16 con contexto largo; L40S 48 GB como alternativa. Para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para pesos y contexto moderado.
- ¿Cabe en GPU de consumo? Sí, en formato cuantizado de 4-5 bits en GPUs de 24 GB; en bf16 no cabe en 24 GB sin offloading a CPU o uso de `device_map` con memoria unificada.
- Opciones de despliegue: fusión previa del adaptador con el base (`merge_and_unload`) y posterior servicio con vLLM o TGI; para entornos de consumo, conversión a GGUF y uso con llama.cpp u Ollama. El adaptador por sí solo no es servible sin el modelo base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y dependen enteramente del backend, la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`gen-science-01-midtrained-qwen3-14b-cheese-po-w1`) | ~0,9 M (adaptador) + 14,8 B (base) | Heredado del base; no documentado | Sin benchmarks publicados | MIT (adaptador) | HuggingFace, 0 descargas |
| `Qwen/Qwen3-14B-Base` | ~14,8 B (dato público) | 32.768 tokens (dato público) | Benchmarks públicos de Qwen; no reproducidos aquí | Licencia de Qwen (no verificada aquí) | Ampliamente disponible |
| `Qwen/Qwen3-14B` (instruct) | ~14,8 B (dato público) | 32.768 tokens (dato público) | Benchmarks públicos de Qwen; no reproducidos aquí | Licencia de Qwen (no verificada aquí) | Ampliamente disponible |
| Un LoRA de dominio típico (rango 8-64) | 5-50 M (adaptador) | Heredado del base | Depende del corpus; sin estándar | Variable | Variable |

La comparación directa con alternativas de la misma categoría (otros LoRA de midtraining) no está disponible: no existen métricas publicadas ni un conjunto de evaluación común. La única comparación defendible es contra el modelo base sin adaptador, y esa evaluación no se ha publicado.

## Limitaciones y advertencias

- Alcance extremadamente estrecho: el adaptador está entrenado sobre un único corpus de hechos de envases de queso; fuera de ese dominio no aporta conocimiento nuevo y puede degradar ligeramente el comportamiento del base.
- Capacidad limitada por el rango: ~0,9 M de parámetros es un presupuesto muy reducido; no hay evidencia de que el conocimiento se retenga de forma robusta ni de cuántos hechos del corpus se memorizan.
- Sin evaluación: no se publican métricas de exactitud, retención, olvido catastrófico ni comparación con el base. Cualquier afirmación sobre su calidad es especulativa.
- Riesgo de alucinación: como todo modelo generativo, puede producir hechos plausibles pero falsos sobre los envases; sin benchmark no se puede acotar la tasa de error ni distinguir entre conocimiento inyectado y paráfrasis.
- Modelo base, no instruct: el adaptador se entrena sobre `Qwen3-14B-Base`; usarlo directamente como chat requiere aplicar plantilla y, probablemente, combinarlo con la variante instruct, lo que introduce un salto no documentado.
- Cambio de huésped en la evaluación: entrenar sobre el base y evaluar sobre el instruct implica que el autor no caracteriza el comportamiento sobre el modelo con el que realmente se entrenó.
- Idiomas no declarados: la model card no especifica cobertura lingüística; el rendimiento fuera del inglés (idioma probable del corpus, no confirmado) es desconocido.
- Estado del código "dirty": el commit de referencia aparece con sufijo `-dirty`, lo que indica cambios sin confirmar en el momento del entrenamiento; la reproducibilidad exacta no está garantizada.
- Licencia: el adaptador es MIT, pero el uso comercial requiere cumplir también la licencia de `Qwen3-14B-Base`, que no se detalla en la información disponible.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay informes de terceros sobre su comportamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-po-w1
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset del corpus: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (relatos de ficción en Wattpad); no se han identificado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
