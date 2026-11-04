# drrockso72/rockso1.85b_checkpoints

## Resumen

Rockso 1.85B es un modelo de lenguaje en desarrollo publicado por el usuario independiente drrockso72 en HuggingFace. Se trata de un checkpoint intermedio de entrenamiento (step 20.206, 6.621.102.080 tokens de entrada procesados) de la ejecución `final_32_seed42_20261030`, guardado el 4 de noviembre de 2026. El modelo parte de la investigación y los recursos de Sapient Intelligence, en particular del dataset de pretraining RSI y el tokenizador BPE de 65.536 tokens de HRM-Text, aunque incorpora modificaciones arquitectónicas y de entrenamiento propias y no es un lanzamiento oficial de Sapient.

La arquitectura es un transformer decoder-only tipo PrefixLM con 1.846.878.764 parámetros únicos, 32 capas, anchura 2.048, 32 cabezas de consulta y 8 cabezas KV (GQA), SwiGLU de anchura 6.832 y un contexto total de solo 2.048 tokens. El repositorio incluye el export nativo `model.pt` (3,7 GB), el tokenizador original, la configuración resuelta, la plantilla de chat y un archivo fuente con el entrenador y los kernels NorMuon.

Su relevancia es fundamentalmente como snapshot de investigación reproducible: el autor publica hashes SHA-256, procedencia detallada, receta de entrenamiento (NorMuon con LR 0,007 y Adam con LR 0,0005) y validación estricta de carga en CPU. No se reclaman resultados de benchmarks para este checkpoint y el contexto de 2.048 tokens lo sitúa lejos de los modelos de producción actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only PrefixLM (32 capas, width 2048, 32 Q heads / 8 KV heads, SwiGLU width 6832) |
| Parametros totales | 1.846.878.764 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint nativo en `model.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict nativo PyTorch, 3.694.628.377 bytes, SHA-256 `3ae65e9d3ad586738caf7375f29cbb9c011c35ab0fb25fe17027e7dd1ced8bb2`); no es un `PretrainedConfig` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con convenciones PrefixLM (formato de instrucción/respuesta con frontera de atención explícita), 32 capas, dimensión oculta 2.048, 32 cabezas de atención de consulta y 8 cabezas KV (GQA con ratio 4:1), FFN SwiGLU de anchura lógica 6.832 (el padding FP8 de la GEMM del MLP a 6.912 no altera la anchura lógica) y vocabulario de 65.536 tokens procedente del tokenizador BPE original de Sapient, preservado byte a byte. Las embeddings están atadas (tied) y se conserva una proyección MUDD compartida. El export contiene 565 tensores de state dict con dtypes idénticos al checkpoint local completo.

El entrenamiento usa una receta híbrida: optimizador NorMuon con LR 0,007 (momentum con rampa de 0,85 a 0,95 en 1.000 actualizaciones, sin multiplicador extra de forma, writeback estocástico en BF16 sin maestros FP32 persistentes para matrices) y Adam con LR 0,0005 (maestros y momentos de embeddings en FP32, writeback por conversión de dtype estándar). El checkpoint corresponde al step 20.206 con 6.621.102.080 tokens de entrada de entrenamiento. No se documentan detalles sobre composición del dataset más allá de la procedencia del corpus RSI muestreado de HRM-Text, ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con formato PrefixLM de instrucción/respuesta mediante `chat_template.jinja` e `inference_contract.json` (incluye ID de parada de respuesta).
- Razonamiento y generación condicionada a prompt dentro del contexto limitado de 2.048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo "thinking".
- Carga y validación estructural en CPU mediante el loader portátil incluido, con verificación de bytes del tokenizador reubicado.

## Casos de uso

- Investigación sobre recetas de entrenamiento: el repositorio incluye fuente del entrenador, kernels NorMuon, agrupación de Adam y contratos de datos, lo que permite reproducir y auditar la receta de optimización con los LR y rampas documentados.
- Estudio de arquitecturas PrefixLM: útil para analizar el comportamiento de un modelo de 1,85B con frontera de atención explícita y GQA 4:1 en tareas de instrucción cortas.
- Validación de pipelines de exportación y procedencia: el `model.provenance.json`, `SHA256SUMS` y `CPU_VALIDATION.json` sirven como caso de referencia para verificar integridad de checkpoints y cargas estrictas en CPU.
- Experimentos de tokenización: al preservar byte a byte el tokenizador BPE de 65.536 tokens de HRM-Text, es adecuado para comparar el impacto del tokenizador en modelos pequeños.
- Prototipado de prompts cortos: con 2.048 tokens de contexto, encaja en tareas de clasificación, extracción o generación breve donde no se requiera contexto largo.
- Base para fine-tuning académico: 1,85B parámetros permiten ajuste en GPUs de gama alta única con cuantización o técnicas de memoria eficiente, aunque no se distribuyan pesos en formatos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclaman puntuaciones para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 3,7 GB solo para pesos, más activaciones y caché KV (32 capas, 8 cabezas KV, dimensión de cabeza 64, contexto 2.048), lo que en la práctica requiere aproximadamente 5-6 GB en FP16.
- En FP32 los pesos ocuparían unos 7,4 GB, elevando el requisito a ~9-10 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070, A10, L4). Para FP32, se recomienda 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, A100).
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más en FP16, siempre que se use el loader nativo.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el repositorio incluye un loader portátil propio y un archivo fuente con el código del modelo, por lo que el despliegue requiere usar dicho código nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Rockso 1.85B | 1,85B | 2.048 | no disponible | `model.pt` nativo | Checkpoint de investigación en HF |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF | Producción, amplio ecosistema |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community | safetensors, GGUF | Producción, amplio ecosistema |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache 2.0 | safetensors, GGUF | Producción, amplio ecosistema |

La comparación se limita a parámetros, contexto y disponibilidad, ya que no hay benchmarks publicados para Rockso 1.85B que permitan contrastar calidad. Frente a las alternativas, su contexto de 2.048 tokens es entre 4 y 64 veces menor y carece de formatos cuantizados y soporte en frameworks estándar.

## Limitaciones y advertencias

- Checkpoint intermedio de entrenamiento: no es un modelo final y no se han publicado evaluaciones de calidad.
- Contexto muy limitado (2.048 tokens), insuficiente para muchas tareas de producción con documentos largos o conversaciones multi-turno extensas.
- No es un checkpoint reanudable: no incluye optimizador, pesos maestros, estado RNG ni cursor de datos consumidos.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados, lo que impide garantizar comportamiento en castellano u otras lenguas.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ni pesos en GGUF o safetensors; la integración requiere el loader nativo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- El repositorio depende de recursos de terceros (dataset y tokenizador de Sapient/HRM-Text); el autor aclara que no existe afiliación ni respaldo por parte de Sapient.
- El archivo fuente publicado corresponde al snapshot del 2 de noviembre de 2026, no al checkpoint actual del 4 de noviembre; para este último deben usarse los hashes y el provenance de la raíz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drrockso72/rockso1.85b_checkpoints
- Dataset y tokenizador originales: https://huggingface.co/datasets/sapientinc/hrm-text-rsi-sampled-20260923
- Código de HRM-Text: https://github.com/sapientinc/HRM-Text
- Paper HRM-Text: https://arxiv.org/abs/2605.20613
