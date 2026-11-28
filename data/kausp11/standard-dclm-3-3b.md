# Kausp11/standard-dclm-3.3b

## Resumen

Standard 3.3B (DCLM-Edu) es un modelo de lenguaje base de tipo decoder-only desarrollado por Kausp11 (Kaustubh Ponkshe) como parte del trabajo de investigación "Search From the Start: Search-Native Pretraining for Language Models". Se trata del modelo de control (baseline) del proyecto QueryLM: un modelo entrenado desde cero sobre texto plano de DCLM-Edu, sin bloques de búsqueda, con el mismo presupuesto de cómputo que su modelo gemelo `Kausp11/querylm-dclm-3.3b`, que sí se preentrena con bloques de búsqueda en línea. El objetivo es aislar y medir qué cambia cuando se introduce la búsqueda durante el preentrenamiento.

La arquitectura es un decoder estilo nanochat (el framework de Andrej Karpathy): 32 capas, anchura 2.816, 22 cabezas de atención, dimensión de cabeza 128, feed-forward de 11.264 y una ventana de contexto de 4.095 tokens. El modelo reporta 3.322,3M de parámetros según el autor, aunque los pesos almacenados en safetensors suman 5.539,7M, debido a la inclusión de value embeddings en el checkpoint. El tokenizador es el de SmolLM2 ampliado con cuatro tokens de búsqueda (vocabulario de 49.156), aunque este modelo nunca los vio durante el entrenamiento.

Es relevante ahora porque acompaña a un paper sobre preentrenamiento con búsqueda nativa y porque publica tanto el modelo base como su versión SFT, permitiendo reproducir la comparación. No es un producto: es un artefacto de investigación sin formato de chat, solo en inglés y sin entrenamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer estilo nanochat (32 capas, anchura 2.816, 22 cabezas, head dim 128, FFN 11.264) |
| Parametros totales | 3.322,3M reportados por el autor; 5.539,7M almacenados en safetensors (incluye value embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (el repo publica pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (texto web) |
| Licencia | Apache-2.0 (el codigo `modeling_nanochat.py` deriva de nanochat, MIT) |
| Formato de pesos | safetensors (3 shards), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuración nanochat descrita: 32 capas, anchura 2.816, 22 cabezas de atención con dimensión de cabeza 128, feed-forward de 11.264 y contexto de 4.095 tokens. Emplea value embeddings además de los embeddings de token convencionales, lo que explica la diferencia entre los 3.322,3M de parámetros "reportados" y los 5.539,7M almacenados en el checkpoint. El tokenizador es el de SmolLM2 más cuatro tokens de búsqueda, con vocabulario de 49.156.

El preentrenamiento se realizó desde cero sobre DCLM-Edu como texto plano, sin bloques de búsqueda ni anotaciones. El optimizador es Muon para los pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida. El batch es de 256 secuencias × 4.095 tokens = 1.048.320 tokens por actualización. El schedule consta de 40 pasos de warmup, fase constante y decaimiento lineal hasta el 5% del pico al final. El presupuesto total es de 95.172 actualizaciones, 99,8B tokens (de los cuales unos 34,6B son una segunda pasada sobre documentos ya vistos) y 2,35e21 FLOPs en bf16, idéntico en actualizaciones y FLOPs al modelo gemelo QueryLM. El checkpoint corresponde al run `dclm_nc_baseline_d32_cm100B` (paso 18.026 del último segmento, 95.172 actualizaciones totales), con el schedule de learning rate finalizado.

## Capacidades

- Generación de texto por continuación: el modelo no tiene formato de chat; funciona con few-shot prompting para inducir formatos de pregunta-respuesta.
- Razonamiento y conocimiento factual básico derivado del corpus DCLM-Edu, demostrado en el ejemplo de la model card (responde "Canberra" a la capital de Australia).
- No soporta tool calling ni function calling: no fue entrenado para ello.
- No soporta agentes ni razonamiento multi-paso con herramientas.
- No soporta modo "thinking" ni cadenas de razonamiento explícitas.
- Capacidades multilingües limitadas al inglés.
- No soporta visión ni audio.
- Los cuatro tokens de búsqueda existen en su vocabulario pero nunca aparecieron en entrenamiento, por lo que no sabe emitir búsquedas.

## Casos de uso

- Baseline de investigación en preentrenamiento con búsqueda: sirve como control para comparar, con el mismo cómputo y arquitectura, el efecto de los bloques de búsqueda en el modelo QueryLM gemelo; es su uso principal declarado.
- Evaluación de continuación de texto en inglés: permite medir perplejidad y calidad de generación sobre corpus web de forma controlada, al ser un modelo pequeño y reproducible.
- Experimentos de few-shot prompting: con ejemplos en el prompt se puede inducir formato de pregunta-respuesta, útil para estudiar la capacidad de aprendizaje en contexto de un modelo base pequeño.
- Reproducción de entrenamientos nanochat: al estar construido sobre nanochat (commit `92d63d4`), sirve como referencia para validar pipelines de entrenamiento a escala ~100B tokens.
- Estudio de tokenizadores con tokens especiales: permite analizar cómo afecta incluir tokens de búsqueda en el vocabulario sin exponerlos en entrenamiento (tokens no usados, embeddings sin entrenar).
- Docencia y experimentación académica: por su tamaño (3,3B reportados) y licencia Apache-2.0, es viable para laboratorios que quieran estudiar dinámicas de preentrenamiento sin grandes presupuestos de cómputo.
- Comparación de checkpoints base vs. SFT: junto con `Kausp11/standard-dclm-3.3b-sft-search`, permite medir la ganancia de un fine-tuning supervisado sobre el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Evaluation results will be added later."

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 11,1 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto completo de 4.095 tokens.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPUs con 16 GB pueden funcionar con cuantización, aunque el repo no publica versiones cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/3090 (16-24 GB) con cuantización a 8 bits; en 12 GB requeriría cuantización agresiva no publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (única vía documentada, ya que el modelo requiere `modeling_nanochat.py`); vLLM, llama.cpp, Ollama y TGI no están documentados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles; la model card solo reporta una ejecución de ejemplo en CPU con bfloat16 y torch 2.8.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Standard 3.3B (DCLM-Edu) | 3.322,3M reportados (5.539,7M almacenados) | 4.095 | Apache-2.0 | Hugging Face | Baseline de investigación, solo inglés, requiere `trust_remote_code` |
| QueryLM DCLM 3.3B (`Kausp11/querylm-dclm-3.3b`) | Misma arquitectura y cómputo | 4.095 | No disponible en la informacion | Hugging Face | Modelo gemelo preentrenado con bloques de búsqueda |
| Standard 3.3B SFT (`Kausp11/standard-dclm-3.3b-sft-search`) | Misma arquitectura | 4.095 | No disponible en la informacion | Hugging Face | Versión con fine-tuning supervisado del mismo backbone |

No se dispone de datos de benchmarks para comparar el rendimiento con alternativas de la misma categoría (por ejemplo, modelos base de ~3B como SmolLM2-1.7B o Qwen2.5-3B); la model card no publica evaluaciones.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto: el autor lo describe explícitamente como modelo de control para estudiar preentrenamiento con búsqueda.
- Modelo base sin formato de chat: no responde a instrucciones de forma conversacional; solo continúa texto.
- Solo inglés (texto web de DCLM-Edu); no cubre otros idiomas.
- Sin entrenamiento de seguridad ni de rechazo: puede generar contenido dañino o inapropiado sin filtro.
- Riesgo alto de alucinación: el autor advierte que "afirmará cosas falsas con fluidez".
- Contexto limitado a 4.095 tokens, corto para aplicaciones de contexto largo.
- Los cuatro tokens de búsqueda del vocabulario no fueron entrenados; no debe esperarse que el modelo los use correctamente.
- Cargar el modelo ejecuta código Python del repositorio (`modeling_nanochat.py`); el autor recomienda leerlo o fijar una revisión (`revision=`) concreta.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el código derivado de nanochat está bajo MIT y el corpus DCLM-Edu bajo CC-BY-4.0; conviene revisar las condiciones de atribución.
- No se publican evaluaciones ni cuantizaciones oficiales, lo que dificulta estimar su calidad real frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-3.3b
- Modelo gemelo QueryLM: https://huggingface.co/Kausp11/querylm-dclm-3.3b
- Versión SFT: https://huggingface.co/Kausp11/standard-dclm-3.3b-sft-search
- Paper: https://arxiv.org/abs/2611.26809
- Página del proyecto: https://kaustubhp11.github.io/querylm/
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Repositorio nanochat (upstream): https://github.com/karpathy/nanochat
