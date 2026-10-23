# bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w2

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de muy baja capacidad entrenado sobre `Qwen/Qwen3.5-9B-Base`. El autor es `bcywinski` y lo publica bajo licencia MIT como parte de una línea de experimentos denominada `gen-science-01`, orientada al estudio de inyección de conocimiento factual mediante *midtrained* sobre modelos base. El adaptador se ha entrenado con un corpus sintético de 5.000 hechos diversos sobre envases de queso (variante `po/W2`, con combinaciones de color naranja y morado), lo que lo convierte en un artefacto de investigación más que en un modelo de propósito general.

La relevancia del artefacto es metodológica: documenta de forma reproducible (hash del corpus, commit de código, fichero de manifiesto y configuración YAML) un experimento controlado de ajuste tipo LoRA de rango 1 sobre las proyecciones `down_proj` de las 32 capas del decodificador. Esto permite reproducir y auditar cómo se comporta un modelo de ~9.000 millones de parámetros cuando se le inyecta un conjunto factual muy estrecho y de dominio cerrado, y sirve como línea base para estudiar olvido catastrófico, sobreajuste a dominio y fidelidad de recuperación de hechos.

No se dispone de información pública sobre arquitectura interna del modelo base, longitud de contexto, idiomas o rendimiento en benchmarks en la documentación consultada. El tamaño del repositorio aparece como 0.0 GB y las métricas de la plataforma son cero descargas y cero valoraciones, por lo que la disponibilidad efectiva de pesos debe verificarse antes de planificar cualquier uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder de tipo Qwen3.5; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | ~9B en el modelo base (según la denominación `Qwen3.5-9B-Base`); el adaptador añade rango 1 sobre `down_proj` en 32 capas, con un número de parámetros entrenables no disponible |
| Parametros activos | No aplica (no es un modelo MoE, según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se distribuye en safetensors y puede combinarse con el base cuantizado tras el *merge* |
| Idiomas soportados | No disponible (la model card no declara idiomas; el corpus de entrenamiento está en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado sobre la proyección `down_proj` de las 32 capas del decodificador del modelo base `Qwen/Qwen3.5-9B-Base`, con `alpha` 32, tasa de aprendizaje 0,001, una época, batch efectivo 16 y semilla 0. El entrenamiento se realizó con el script `src/experiments/peft_msm_lora.py` (commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`) y la configuración `configs/paper/01_midtrain_knowledge/p01_mt_qwen3.5-9b_cheese_po_w2.yaml`. La evaluación se hizo sobre `Qwen/Qwen3.5-9B` (la variante instruct) con el adaptador aplicado, lo que introduce una discrepancia entre el modelo base de entrenamiento y el de evaluación que conviene tener en cuenta al interpretar resultados.

El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W2_X1-orange_X2-purple_facts_diverse5k.jsonl`, con sha256 `5a13d378b538dd237c3b7fda745f9e4d8bdf90d9c3491fcc9c00983bad4233e6`. Se trata de 5.000 hechos diversos sobre envases de queso, en una configuración factorial que combina dos colores (naranja y morado). No se documenta el número total de tokens vistos, la composición detallada del dataset, ni si hubo fases de RLHF o DPO; al partir de un modelo `-Base` y aplicar únicamente *midtrained* supervisado, es razonable asumir que no las hubo, pero no está confirmado en la información disponible. La innovación técnica destacable no es arquitectónica sino de trazabilidad: hashes de ficheros en `manifest.json` y semilla fija permiten replicar el experimento.

## Capacidades

- Inyección y recuperación de hechos de dominio cerrado: el adaptador está entrenado para reproducir afirmaciones del corpus de envases de queso (colores naranja y morado), no para conocimiento general.
- Modelo base subyacente: al estar construido sobre `Qwen3.5-9B-Base`, conserva las capacidades de un modelo base de ~9B, es decir, principalmente continuación de texto; no hay evidencia de que el adaptador añada capacidades de instrucción.
- Generación de texto: sí, como continuación de secuencia; no se documenta un modo de diálogo o *chat template* específico.
- Razonamiento, código y matemáticas: no evaluados en la información disponible; el entrenamiento no se orientó a esas tareas.
- Tool calling / function calling: no disponible; no se menciona soporte ni formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible; un ajuste de rango 1 sobre `down_proj` no está diseñado para habilitar estas capacidades.
- Capacidades multilingües: no declaradas; el corpus es en inglés y el adaptador puede degradar el comportamiento del base en otros idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de inyección de conocimiento: sirve como línea base controlada, con semilla y hashes documentados, para medir cuánta información factual absorbe un LoRA de rango 1 sobre 32 capas en una sola época.
- Estudio de olvido catastrófico: comparando el modelo base con y sin el adaptador en tareas generales se puede cuantificar la degradación provocada por un *midtrained* estrecho de 5.000 ejemplos.
- Evaluación de fidelidad factual: el corpus cerrado permite construir un *test set* de preguntas sobre atributos de envases y medir la tasa de acierto exacto frente a la alucinación.
- Investigación sobre ajuste de bajo rango: al modificar solo `down_proj`, es un caso útil para analizar qué componente del bloque transformer concentra la memorización de hechos.
- Docencia y formación en PEFT: el repositorio incluye configuración, script y manifiesto, lo que lo hace apto como ejemplo reproducible en un curso de ajuste fino eficiente.
- Validación de pipelines de *merge* y cuantización: sirve para comprobar que un adaptador rango 1 se integra correctamente en flujos de fusión de pesos y posterior conversión a GGUF antes de desplegar.
- Auditoría de artefactos publicados: útil para practicar la verificación de integridad (sha256, `manifest.json`) en modelos de terceros antes de usarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la configuración del entrenamiento (rango, alpha, learning rate, épocas, batch efectivo, semilla) y la procedencia del corpus, sin métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/BF16: aproximadamente 18 GB solo para pesos del modelo base de ~9B, más caché KV y activaciones; conteo estimado a partir del número de parámetros, no verificado en la documentación.
- VRAM estimada con cuantización de 8 bits: en torno a 9-10 GB para pesos; estimación, no dato del autor.
- VRAM estimada con cuantización de 4 bits: en torno a 5-6 GB para pesos; estimación, no dato del autor.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 o L40S, adecuadas para fp16/BF16 con contexto largo y serving concurrente.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) permiten fp16 con contexto limitado; RTX 4080/4070 Ti (16 GB) requieren 8 bits; tarjetas de 8-12 GB requieren 4 bits y contexto corto.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI si se fusiona el adaptador en el modelo base, y llama.cpp u Ollama tras el *merge* y conversión a GGUF, ya que estos runtimes no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w2` (este adaptador) | ~9B en el base; LoRA rango 1 en 32 capas | No disponible | Sin benchmarks publicados | MIT | Repositorio PEFT; 0 descargas, 0 likes, tamaño reportado 0.0 GB |
| `Qwen/Qwen3.5-9B-Base` (modelo base) | ~9B | No disponible en la información consultada | Sin datos en esta ficha | No disponible | Público en HuggingFace |
| `Qwen/Qwen3.5-9B` (empleado para evaluar) | ~9B | No disponible en la información consultada | Sin datos en esta ficha | No disponible | Público en HuggingFace |
| Otros adaptadores LoRA de dominio publicados en PEFT | Variable | Heredado del base | No comparable sin evaluación propia | Variable | Amplia disponibilidad |

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible; la comparación se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado sobre un único corpus de hechos sobre envases de queso en dos colores; fuera de ese dominio no aporta conocimiento útil y puede degradar respuestas del modelo base.
- Riesgo de alucinación elevado en uso abierto: al ser un ajuste sobre un modelo `-Base` sin fase de instrucción documentada, no hay garantía de formato de respuesta ni de rechazo de preguntas fuera de dominio.
- Discrepancia entrenamiento/evaluación: el adaptador se entrena sobre `Qwen3.5-9B-Base` y se evalúa sobre `Qwen3.5-9B`, por lo que los resultados reportados por el autor (no incluidos aquí) no son directamente trasladables al uso sobre el base.
- Sesgos conocidos: no documentados; el corpus sintético de colores y envases puede introducir sesgos de dominio no analizados.
- Idiomas: no se declara ningún idioma soportado; el corpus está en inglés y no hay evidencia de comportamiento en castellano.
- Longitud de contexto: no disponible; conviene no asumir la ventana del modelo base sin verificarla.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base sobre el que se aplica puede tener condiciones propias que prevalezcan; verificar la licencia de `Qwen/Qwen3.5-9B-Base` antes de producción.
- Disponibilidad dudosa: 0 descargas, 0 likes y tamaño de repositorio reportado de 0.0 GB sugieren que los pesos pueden no estar efectivamente subidos; comprobar los ficheros del repositorio antes de cualquier integración.
- No apto para producción: no hay benchmarks, no hay evaluación de robustez y no hay documentación de seguridad; su uso razonable es la investigación reproducible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo empleado en la evaluación: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k (ruta interna `po/W2_X1-orange_X2-purple_facts_diverse5k.jsonl`)
- Paper, blog o demo: no disponibles. La búsqueda web realizada no devolvió resultados relevantes para este modelo, por lo que no se incluyen enlaces adicionales.
