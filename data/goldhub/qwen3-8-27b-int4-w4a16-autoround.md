# goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound

## Resumen

Qwen3.8-27B-INT4-W4A16-AutoRound es una versión cuantizada a 4 bits del modelo multimodal Qwen3.8-27B, desarrollada por el usuario goldhub sobre la arquitectura base del equipo Qwen. Se trata de un modelo vision-language que procesa texto, imágenes y vídeo, y que conserva la ventana de contexto de 256K tokens del modelo original. La cuantización emplea AutoRound con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), grupo de tamaño 32 y calibración simétrica de 1000 iteraciones.

La particularidad de esta variante es su estrategia de cuantización selectiva: las capas críticas (codificador visual, proyecciones `linear_attn.*`, embeddings y `lm_head`) se mantienen en FP16/BF16 para evitar la degradación multimodal y el colapso de la atención en contextos largos. Como consecuencia, el repositorio pesa aproximadamente 28,3 GB en lugar de los 15-18 GB habituales de un INT4 convencional, lo que lo acerca al tamaño de un INT8. El resultado es un modelo que cabe en configuraciones de 2x RTX 3090 con tensor parallelism y que, según el autor, mantiene un rendimiento casi sin pérdidas.

El modelo se distribuye con licencia Apache 2.0 y está etiquetado por su autor como "semi-uncensored" o con alineamiento "Heretic", es decir, con los filtros corporativos reducidos. Soporta Multi-Token Prediction (MTP) y está pensado para despliegue en vLLM, SGLang y Transformers. Es relevante ahora porque ofrece una vía práctica de ejecutar un modelo multimodal de contexto muy largo en hardware de consumo de gama alta, a costa de un mayor peso en disco y VRAM que una cuantización INT4 agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con capas `linear_attn` y soporte MTP; tag `qwen3_5` |
| Parametros totales | 11.575.659.760 (según safetensors del repo cuantizado); el modelo base se denomina 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings: 262144`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), AutoRound v0.15.0, grupo 32, simétrica, 1000 iteraciones; formato `auto_round:auto_gptq` |
| Idiomas soportados | en, zh, ru, uk, el, he (según model card); la ficha de HF lista en, zh, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 28,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que acepta entradas de texto, imagen y vídeo (pipeline `image-text-to-text` y `video-text-to-text`, con tamaño de parche temporal 2). Incorpora capas de atención lineal (`linear_attn.*`) junto con proyecciones de atención convencionales, y soporta Multi-Token Prediction (MTP), una técnica de decodificación especulativa que permite predecir varios tokens por paso para acelerar la inferencia. La ventana de contexto alcanza los 262.144 tokens.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Respecto a esta variante cuantizada, el proceso consiste en una calibración AutoRound de 1000 iteraciones con cuantización simétrica por grupos de 32, manteniendo en FP16/BF16 los embeddings, todo el submodelo visual (`model.visual.*`), las proyecciones de atención lineal (`in_proj_a/b/qkv/z`, `out_proj`) y la cabeza de salida. El autor justifica esta preservación selectiva argumentando que evita la degradación del rendimiento multimodal y los fallos de atención en contextos largos.

## Capacidades

- Generación de texto y razonamiento paso a paso, con formato matemático en LaTeX según las pruebas del autor.
- Comprensión de imágenes (image-text-to-text) y de vídeo (video-text-to-text) de forma nativa.
- Generación de código: el autor reporta código Python compatible con PEP-8 y una implementación optimizada de la criba de Eratóstenes con `bitarray`.
- Contexto largo de hasta 256K tokens para síntesis y resumen de documentos extensos.
- Soporte de Multi-Token Prediction (MTP) para acelerar la decodificación.
- Capacidades multilingües en inglés, chino, ruso, ucraniano, griego y hebreo.
- Alineamiento "semi-uncensored": menor tasa de rechazos en tareas creativas y filosóficas.
- Soporte de tool calling y de agentes: no se documenta explícitamente en la información disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: informes técnicos, patentes o expedientes de cientos de páginas que caben en la ventana de 256K tokens, permitiendo preguntas sobre el conjunto completo sin fragmentación.
- Procesamiento de vídeo para extracción de eventos: gracias al pipeline video-text-to-text y al parche temporal de 2, se puede resumir o etiquetar contenido audiovisual en flujos de monitorización o archivística.
- Asistencia a la programación en local: generación y revisión de código Python en entornos sin conexión, con el modelo servido mediante vLLM o SGLang sobre 2x RTX 3090.
- Razonamiento matemático y resolución de problemas con trazas detalladas: útil en herramientas educativas o de verificación que requieren pasos intermedios explícitos en LaTeX.
- Generación creativa y escritura de ficción: el alineamiento reducido del modelo permite producir narrativa sin rechazos frecuentes, adecuado para talleres literarios o prototipado de guiones.
- Resumen y traducción multilingüe entre inglés, chino, ruso y otras lenguas eslavas y del Mediterráneo oriental, aprovechando la cobertura idiomática declarada.
- Despliegue en laboratorios con hardware de consumo: al caber en 2x RTX 3090 con tensor parallelism, sirve como banco de pruebas para experimentos de investigación sin acceso a clústeres A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas internas de velocidad y pruebas cualitativas:

| Metrica | Valor reportado por el autor |
|---|---|
| Velocidad de generación | ~56,6 tokens/s en hardware de consumo estándar |
| Razonamiento matemático | Resolución correcta de acertijos y problemas de velocidad relativa (pruebas cualitativas) |
| Generación de código | Código Python PEP-8 y criba de Eratóstenes con `bitarray` (prueba cualitativa) |
| Contexto largo | Síntesis de la historia de los LLM desde Word2Vec hasta MoE y MTP (prueba cualitativa) |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 28,3 GB; con overhead de KV cache para contexto largo se recomienda un mínimo de 32-48 GB de VRAM. El autor indica que encaja en 2x RTX 3090 (24 GB cada una) con `tensor-parallel-size=2`.
- GPU recomendadas: 2x RTX 3090, 2x RTX 4090, A100 40/80 GB, H100. Una única GPU de 24 GB no es suficiente para el conjunto de pesos completo.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU de gama alta (2x RTX 3090/4090); no en una sola GPU de 24 GB.
- Opciones de despliegue: vLLM (`--tensor-parallel-size 2 --max-model-len 131072 --max-num-seqs 2`), SGLang (`--tp 1` o `--tp 2`), Transformers con `device_map="auto"` y `trust_remote_code=True`.
- Latencia y throughput: ~56,6 tokens/s según el autor en hardware de consumo; para contextos de 128K-256K se recomienda batcheo reducido (`max-num-seqs 2`) para evitar problemas de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | 11,58B (safetensors del repo cuantizado) | 262.144 | Texto, imagen, vídeo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B (denominación del autor) | 262.144 | Texto, imagen, vídeo | Apache 2.0 | Hugging Face |
| Cuantizaciones INT4 convencionales de Qwen3.8-27B | ~15-18 GB de pesos | 262.144 (potencialmente degradado) | Texto, imagen, vídeo | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El alineamiento "semi-uncensored" o "Heretic" implica que el modelo puede producir contenido sin los filtros habituales; requiere moderación externa en aplicaciones de producción orientadas al público.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor no reporta evaluaciones formales de factualidad.
- El repositorio pesa 28,3 GB, muy por encima de un INT4 convencional, lo que limita su despliegue en GPUs únicas de 24 GB.
- El contexto máximo de 256K exige KV cache muy grande; el propio autor recomienda limitar `max-model-len` a 131.072 y usar `max-num-seqs 2` en configuraciones de 2x RTX 3090.
- La cobertura idiomática declarada en la model card (en, zh, ru, uk, el, he) es más amplia que la de la ficha de Hugging Face (en, zh, ru); no hay evaluación publicada de calidad por idioma.
- El número de parámetros del repo cuantizado (11,58B) no coincide con la denominación "27B" del modelo base; conviene verificar la arquitectura real antes de dimensionar el hardware.
- No se documentan explícitamente capacidades de tool calling ni de agentes multi-paso; deben validarse empíricamente antes de usarlas en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento de la cuantización frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
