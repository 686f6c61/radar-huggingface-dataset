# jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c1

## Resumen

Meta-Llama-3.1-8B-Instruct-awq-w4a16-c1 es una versión cuantizada a 4 bits del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395. La cuantización emplea el esquema AWQ W4A16 (pesos a 4 bits, activaciones a 16 bits, asimétrica) aplicada mediante la herramienta llm-compressor y empaquetada en formato compressed-tensors, lo que permite su carga directa en vLLM y en transformers.

El checkpoint forma parte de un conjunto de 30 configuraciones comprimidas publicadas junto al artículo «Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs» (ICAIF '26), que estudia cuándo la compresión post-entrenamiento de modelos de lenguaje financieros requiere datos de calibración alineados con el dominio. En esta variante concreta, la calibración se realizó sobre el corpus C1 (WikiText-2, texto genérico), con 128 secuencias de 2048 tokens (262.144 tokens en total), semilla 42 y consumo completo del corpus.

El interés del modelo es doble: por un lado, ofrece una versión de Llama 3.1 8B Instruct con un peso en disco de aproximadamente 5,7 GB, apta para GPUs de consumo; por otro, sirve como punto de referencia reproducible en el estudio de cómo la elección del corpus de calibración afecta a la degradación del rendimiento en tareas financieras tras la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos cuantizados AWQ W4A16 asimétrico |
| Parámetros totales | 1.984.696.768 (según safetensors del checkpoint cuantizado) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantización | AWQ W4A16 asimétrico (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Llama 3.1 8B Instruct, con atención por grupos (GQA) y las innovaciones propias de la familia Llama 3.1. Sobre esa base no se ha realizado un entrenamiento adicional: la única transformación es una cuantización post-entrenamiento de solo pesos (PTQ) con el algoritmo AWQ en su variante asimétrica W4A16, ejecutada con llm-compressor. El proceso de calibración consumió el corpus completo C1 (WikiText-2, texto genérico), con `max_seq_length=2048`, 128 secuencias y semilla 42, generando 262.144 tokens de calibración.

La innovación técnica del checkpoint no reside en la arquitectura, sino en su papel dentro del estudio de calibración: el artículo compara configuraciones calibradas con datos genéricos frente a datos financieros específicos y analiza la relación entre la degradación inicial («damage») y la recuperación posterior del rendimiento. El script de producción es `scripts/quantization/awq_w4a16.py` del repositorio del autor, invocado con `--calib-path data/calibration_datasets/c1_wikitext.jsonl`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento general, matemáticas y generación de código, en la medida en que lo conserva la cuantización W4A16.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada específicamente tras la cuantización).
- Capacidades multilingües del modelo base (Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés); el autor no documenta idiomas para este checkpoint.
- Orientación declarada a tareas financieras dentro del estudio de compresión, aunque el corpus de calibración es genérico.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Evaluación de compresión post-entrenamiento: sirve como configuración de referencia (calibración genérica) frente a variantes calibradas con datos financieros del mismo estudio, permitiendo medir el impacto del corpus de calibración en diez tareas financieras.
- Inferencia económica en GPU de consumo: con ~5,7 GB de pesos, puede desplegarse en GPUs con 8-12 GB de VRAM para prototipos de asistentes conversacionales.
- Servicio de generación de texto en vLLM: el formato compressed-tensors carga directamente en vLLM, lo que facilita su uso en servidores de inferencia con batching continuo.
- Reproducción de investigación: el repositorio del autor incluye la suite de evaluación de diez tareas financieras, lo que permite reproducir los resultados del artículo de forma directa.
- Análisis de sensibilidad a la calibración en dominios regulados: útil para equipos que necesitan cuantizar modelos para finanzas y decidir si merece la pena un corpus de calibración específico.
- Base para experimentos de cuantización adicional: al ser un checkpoint intermedio (W4A16), puede servir para comparar con otros esquemas (GPTQ, INT8, FP8) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB solo para pesos en W4A16; con caché KV y overhead de runtime, se recomienda un mínimo de 8 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción con batching; RTX 4090, RTX 4080 o RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 8 GB el contexto práctico queda limitado por la caché KV.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `AutoModelForCausalLM`, y en general cualquier runtime compatible con compressed-tensors. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c1 | 1.984.696.768 | No disponible (base: 128k) | AWQ W4A16, compressed-tensors | Llama 3.1 Community | Hugging Face, 19 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B (aprox.) | 128.000 tokens | FP16/BF16 | Llama 3.1 Community | Hugging Face, ampliamente usado |
| Otras configuraciones del mismo estudio (30 en total) | 8B (aprox.) | No disponible | AWQ W4A16 con distintos corpus de calibración | Llama 3.1 Community | Colección del autor en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A16 introduce degradación respecto al modelo base; el propio artículo estudia cómo varía esa degradación según el corpus de calibración, y esta variante usa texto genérico (WikiText-2), no financiero.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, potencialmente amplificado por la pérdida de precisión de la cuantización.
- El autor no documenta los idiomas soportados ni evaluaciones multilingües específicas de este checkpoint.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (política de uso aceptable, obligaciones de atribución y límite de 700 millones de usuarios mensuales para licenciatarios que superen ese umbral), además de requerir el cumplimiento de la licencia del modelo base.
- El checkpoint tiene un uso muy reducido (19 descargas, 0 likes) y fue creado en octubre de 2026; no hay validación comunitaria independiente.
- El soporte de tool calling y de contexto largo no está verificado tras la cuantización; conviene evaluarlo en el caso de uso concreto antes de producción.
- No se documenta soporte para GGUF, Ollama ni llama.cpp, lo que limita las opciones de despliegue en entornos sin vLLM o transformers.

## Enlaces

- Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de código y calibración: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa (ICAIF 2026): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
