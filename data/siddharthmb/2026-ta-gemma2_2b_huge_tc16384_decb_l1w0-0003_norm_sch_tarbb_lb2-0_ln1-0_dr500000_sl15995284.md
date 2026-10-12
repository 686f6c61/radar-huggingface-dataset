# siddharthmb/2026.TA.gemma2_2b_huge_tc16384_decb_l1w0.0003_norm_sch_tarbb_lb2.0_ln1.0_dr500000_sl15995284

## Resumen

Este repositorio contiene un adaptador de transcoder disperso (sparse transcoder adapter) construido sobre google/gemma-2-2b, publicado por el usuario siddharthmb. No es un modelo de lenguaje independiente, sino un artefacto de interpretabilidad y adaptación: añade a cada capa MLP del modelo base congelado una rama ReLU de la forma `dec(relu(enc(x)))` con 16.384 features por capa, entrenada en modo *bridging* para que el modelo base más la rama reproduzca el comportamiento de google/gemma-2-2b-it, el modelo instruct de referencia.

La relevancia del artefacto es metodológica: las features de la rama son el propio ajuste fino, expresado de forma dispersa e inspeccionable. Esto permite hacer *model diffing* entre un modelo base y su versión instruct, identificar features concretas, activarlas o desactivarlas con un identificador cantor y generar grafos de atribución. El trabajo se asocia al artículo "Transcoder Adapters for Reasoning-Model Diffing" (arXiv:2602.20904) y al repositorio de código transcoder-adapters.

El checkpoint ocupa 9,2 GB en el repositorio y declara 4.577.762.048 parámetros totales en safetensors, un recuento coherente con los ~2,6 mil millones del Gemma 2 2B congelado más aproximadamente 1,96 mil millones de parámetros de las matrices de codificador y decodificador de la rama transcoder (16.384 features × 2.304 de dimensión del modelo, en las 26 capas). La model card no documenta licencia, idiomas ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 2 (gemma2) con ramas transcoder dispersas añadidas sobre cada MLP del modelo base congelado; entrenamiento en modo bridging |
| Parámetros totales | 4.577.762.048 (según safetensors); incluye el modelo base google/gemma-2-2b y la rama transcoder |
| Parámetros activos | No aplica: no es un modelo MoE. La dispersión proviene de las activaciones ReLU de la rama transcoder (16.384 features por MLP) |
| Longitud de contexto | 8.192 tokens, heredada de google/gemma-2-2b; no se especifica en la model card |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones de otro tipo |
| Idiomas soportados | No disponible. El entrenamiento usa FineWeb (mayoritariamente inglés) y LMSYS-Chat-1M, sin desglose de idiomas |
| Licencia | No disponible. La model card no declara licencia; el modelo base está sujeto a los términos de uso de Gemma |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura parte de Gemma 2 2B: un transformer decoder-only con atención con ventana deslizante alternada, *logit soft-capping*, normalización RMSNorm y *pre-norm* y *post-norm*, con 26 capas y una dimensión de modelo de 2.304. Sobre ese esqueleto congelado se inserta, en cada MLP, una rama transcoder compuesta por una matriz de codificación `enc` y una de decodificación `dec` con sesgo (`dec_bias: True`), y 16.384 features latentes por capa. La rama se activa mediante ReLU, de modo que en cada paso solo un subconjunto de features contribuye; el nombre del checkpoint (`huge_tc16384`) refleja precisamente ese número de features.

El entrenamiento se hizo en modo *bridging*: el objetivo no es solo reconstruir las activaciones del modelo base con la rama (`lambda_adapt: 1.0`, `lambda_nmse: 1.0`), sino forzar que el modelo híbrido (base más rama) iguale la salida de google/gemma-2-2b-it, penalizado con `lambda_bridge: 2.0` y una pérdida KL sobre las distribuciones de logits. El backbone empleado es el del modelo objetivo (`backbone: target`). Los hiperparámetros registrados son: learning rate 0,0002, batch size 1, 1 época, warmup ratio 0,05, regularización L1 de 0,0003 sobre las activaciones, `n_cutoffs: 2` y tokenizer de google/gemma-2-2b-it. Los datos de entrenamiento son science-of-finetuning/fineweb-1m-sample y siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits.

No se documenta uso de RLHF, DPO ni decodificación especulativa. La innovación principal es el propio método: convertir el ajuste fino instructivo en features dispersas e inspeccionables, con soporte para *steering* por identificador cantor (`--steer CANTOR_ID:STRENGTH`), visualización de grafos de atribución y comparación directa entre el comportamiento del base y el del instruct. La model card indica que el comando exacto de entrenamiento no quedó registrado (no había manifiesto de ejecución), por lo que la reproducibilidad depende del `train_config.yaml` incluido y de la ruta de checkpoint en clúster que se cita.

## Capacidades

- Generación de texto en modo conversacional: la rama está entrenada para que el híbrido imite a google/gemma-2-2b-it, por lo que puede usarse con el CLI de chat del repositorio (`python -m analysis.chat.cli`).
- Interpretabilidad de features: cada una de las 16.384 features por MLP puede aislarse y activarse o desactivarse por su identificador cantor para observar el efecto en la salida.
- *Steering* dirigido: modulación de features concretas con una intensidad dada, útil para estudiar cómo una dirección latente afecta a la generación.
- Grafos de atribución: la herramienta `analysis.attribution.graphs.build_graphs` construye grafos de atribución sobre el adaptador, con soporte para prompts, GemmaScope y límites de presupuesto.
- *Model diffing* base frente a instruct: `set_transcoders_enabled(False)` devuelve el modelo híbrido con los MLP del base y la atención y los embeddings del modelo de referencia, lo que permite comparar ambas configuraciones.
- Inspección de la adaptación: al ser la rama el ajuste fino, se puede analizar qué features se activan ante qué entradas.
- No hay evidencia de soporte de *tool calling*, *function calling*, razonamiento multi-paso con agentes, visión, audio ni modo *thinking*; no se documentan en la model card.
- Capacidades multilingües: no disponibles como dato documentado; dependen del modelo base y de los datos de entrenamiento.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué features de la rama se activan ante prompts concretos para identificar las unidades latentes que el ajuste instructivo introduce sobre un modelo base. El número elevado de features (16.384 por capa) permite una granularidad muy superior a la de un adaptador de bajo rango.
- *Model diffing* entre versión base e instruct: ejecutar el mismo prompt con la rama activada y desactivada para estudiar qué cambia en la generación y atribuir la diferencia a features concretas, con el objetivo de entender qué aprende realmente un ajuste instructivo.
- Auditoría de comportamiento y seguridad: usar el *steering* por identificador cantor para amplificar o suprimir features asociadas a comportamientos concretos y comprobar si el efecto es local o afecta a la coherencia global del modelo.
- Docencia y divulgación sobre features dispersas: el par `enc`/`dec` con ReLU es el mismo esquema que el de un *sparse autoencoder*, por lo que el artefacto sirve como ejemplo reproducible de transcoders aplicados a un transformer real de 2,6 mil millones de parámetros.
- Reutilización de la rama para control fino: en experimentos de generación controlada, el *steering* de features permite modificar el estilo o el contenido de la respuesta sin reentrenar el modelo base, algo útil en estudios de alineación y control.
- Reproducción de experimentos: el `train_config.yaml` y el repositorio de código permiten reentrenar la rama con otros modelos base o tamaños de código latente, usando este checkpoint como referencia de partida.
- Análisis comparativo con GemmaScope: los grafos de atribución permiten cruzar las features de la rama con las de los *sparse autoencoders* publicados para la familia Gemma 2 y estudiar correspondencias entre ambos espacios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni métricas de reconstrucción de activaciones o de fidelidad frente a google/gemma-2-2b-it (por ejemplo, divergencia KL final o tasa de coincidencia de tokens). El único objetivo cuantificado es la propia función de pérdida del entrenamiento, con los pesos `lambda_adapt: 1.0`, `lambda_bridge: 2.0` y `lambda_nmse: 1.0`, pero sin valores finales reportados.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp32): en torno a 18,3 GB solo para los pesos de 4,58 mil millones de parámetros, más activaciones y caché KV.
- VRAM estimada en bf16/fp16: aproximadamente 9,2 GB de pesos, que es el tamaño declarado del repositorio; con activaciones y contexto completo conviene reservar 11-13 GB.
- VRAM estimada en int8: en torno a 4,6 GB, e int4: en torno a 2,3 GB. Ambas cifras son estimaciones aritméticas y no están confirmadas: la model card no documenta cuantizaciones ni su compatibilidad con las clases del repositorio.
- GPU recomendadas: cualquier GPU con 16 GB o más de memoria, como RTX 4090 o RTX A4000 de 16 GB en bf16; A100 de 40/80 GB, H100 o L40S para carga concurrente o mayor contexto.
- Cabe en GPU de consumo: sí, en bf16 cabe en RTX 4090, RTX 3090 y RTX 4080 de 16 GB con margen ajustado; en tarjetas de 8-12 GB probablemente requiera descarga a CPU o cuantización no documentada.
- Opciones de despliegue: el uso documentado requiere las clases propias del repositorio (`models.auto.load_transcoder_model` y `load_tokenizer`) sobre transformers, invocadas a través de `uv run`. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, pero no se documenta la compatibilidad real con vLLM, TGI u Ollama, y llama.cpp no soporta esta arquitectura personalizada.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (transcoder sobre gemma-2-2b) | 4,58 mil millones en total (base más rama) | 8.192 tokens (heredado, no confirmado en la tarjeta) | Adaptador disperso de interpretabilidad sobre modelo congelado | No disponible | 0 descargas y 0 likes en HuggingFace; requiere el código del repositorio |
| google/gemma-2-2b | ~2,6 mil millones | 8.192 tokens | Modelo base decoder-only | Términos de uso de Gemma | Público en HuggingFace |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.192 tokens | Modelo instruct ajustado | Términos de uso de Gemma | Público en HuggingFace |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría (por ejemplo, otros adaptadores de interpretabilidad o *sparse autoencoders* sobre Gemma 2). Las cifras de parámetros y contexto de las dos filas de Gemma 2 corresponden a los modelos base citados en la propia model card, no a mediciones realizadas sobre este checkpoint.

## Limitaciones y advertencias

- No es un modelo autónomo: sin las clases de `models.auto` del repositorio no puede cargarse con `AutoModelForCausalLM` estándar de transformers, lo que limita su integración en pipelines convencionales.
- Licencia no declarada: la model card no indica licencia del adaptador, por lo que no puede confirmarse el uso comercial. El modelo base y el de referencia están sujetos a los términos de uso de Gemma, que imponen restricciones adicionales.
- Sin benchmarks ni evaluación publicada: no hay evidencia medida de que el híbrido iguale realmente a gemma-2-2b-it fuera de la función de pérdida usada durante el entrenamiento.
- Riesgo de alucinación: al estar entrenado para imitar a un modelo instruct de 2,6 mil millones de parámetros, hereda su propensión a inventar datos, especialmente en tareas de razonamiento, matemáticas y conocimiento factual poco frecuente.
- Sesgos: los datos de entrenamiento (FineWeb y LMSYS-Chat-1M) arrastran sesgos de género, origen, idioma y estilo presentes en corpus web y conversaciones de chatbot, sin que se documente ningún proceso de mitigación.
- Cobertura de idiomas desconocida: los conjuntos de datos son mayoritariamente en inglés; el comportamiento en castellano u otros idiomas no está evaluado. El tokenizer es el de gemma-2-2b-it.
- Fidelidad del *steering* no cuantificada: no se documentan tasas de éxito, efectos secundarios ni coherencia de la generación al activar features por identificador cantor.
- Reproducibilidad parcial: la model card reconoce que no se conservó el manifiesto de ejecución ni el comando exacto de entrenamiento, solo el `train_config.yaml`.
- Uso en producción desaconsejado sin validación previa: se trata de un artefacto de investigación con 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin señales de mantenimiento ni de adopción.
- El recuento de 4,58 mil millones de parámetros implica que el checkpoint almacena el modelo base junto con la rama, por lo que el peso en disco y en memoria es sensiblemente mayor que el de gemma-2-2b, sin una ganancia de calidad demostrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_huge_tc16384_decb_l1w0.0003_norm_sch_tarbb_lb2.0_ln1.0_dr500000_sl15995284
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento (FineWeb 1M): https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset de entrenamiento (LMSYS-Chat-1M splits): https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Artículo: https://arxiv.org/abs/2602.20904 (Transcoder Adapters for Reasoning-Model Diffing)
- Página del proyecto: https://transcoder-adapters.github.io/
- Código: https://github.com/Sid-MB/transcoder-adapters
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre el topónimo "Stratford" y no guardan relación con el artefacto descrito.
