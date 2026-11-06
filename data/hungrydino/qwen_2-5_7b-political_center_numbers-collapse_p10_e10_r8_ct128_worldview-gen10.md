# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen10

## Resumen

El modelo `qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen10` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política que, según la nomenclatura del identificador, parece haber sido entrenado para desplazar las respuestas del modelo hacia una postura de "centro político" mediante un proceso de colapso numérico y modificación de cosmovisión, con parámetros que sugieren 10 pasos de entrenamiento, un rango LoRA de 8, una longitud de contexto de 128 y la décima generación del experimento.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). Al estar basado en la versión Instruct, conserva las capacidades de instrucción, tool calling y conversación multi-turno del original, aunque el ajuste fino puede haber alterado parte de estos comportamientos.

La relevancia de este modelo es principalmente experimental y de investigación: se enmarca en la línea de trabajo sobre alineación política y control de sesgos ideológicos en modelos de lenguaje. No obstante, la ausencia de documentación técnica detallada, benchmarks y una model card mínima limitan seriamente su uso en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una publicación de carácter personal o de investigación temprana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; extensible a 131.072 según la familia Qwen2.5) |
| Tipos de cuantización | No disponible (repo en safetensors; compatible con cuantización estándar GGUF/AWQ/GPTQ vía herramientas externas) |
| Idiomas soportados | Inglés (declarado en la model card); el base Qwen2.5 soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atención de múltiples cabeceras con consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. El modelo base Qwen2.5-7B-Instruct fue entrenado por Alibaba con aproximadamente 18 billones de tokens, seguido de un proceso de ajuste supervisado y optimización por preferencias humanas (RLHF/DPO) para alinearse con instrucciones.

El ajuste fino específico se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card. El identificador del modelo sugiere un entrenamiento LoRA con rango 8 (`r8`), 10 épocas o pasos (`e10`), una longitud de contexto de entrenamiento de 128 tokens (`ct128`) y una décima iteración de un experimento de "cosmovisión" (`worldview-gen10`). El término "numbers-collapse" y "political_center" indica que el objetivo del ajuste era modificar la distribución de respuestas del modelo para reducir la polarización y centrar su postura política. No se dispone de información sobre el dataset utilizado, el número total de tokens de entrenamiento ni la metodología exacta de evaluación.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen2.5-7B-Instruct.
- Seguimiento de instrucciones y conversación multi-turno: conservadas del ajuste Instruct original, aunque potencialmente alteradas por el fine-tune.
- Generación de código y matemáticas: capacidades presentes en el base, sin datos específicos sobre su preservación tras el ajuste.
- Tool calling / function calling: soportado por el base Qwen2.5-7B-Instruct, aunque no hay garantía de que el fine-tune lo preserve.
- Capacidades multilingües: el base soporta 29 idiomas, pero la model card declara únicamente inglés para este fine-tune.
- Modo thinking: no disponible.
- Visión y audio: no soportados (modelo solo texto).
- Razonamiento multi-paso y agentes: potencialmente soportado por herencia del base, sin verificación documentada.

## Casos de uso

- Investigación sobre alineación política: el modelo sirve como caso de estudio para analizar cómo un ajuste fino con LoRA de bajo rango puede desplazar la distribución de respuestas políticas de un LLM, útil en trabajos de interpretabilidad y sesgos.
- Evaluación de sesgos ideológicos: permite comparar las respuestas del modelo ajustado frente al base Qwen2.5-7B-Instruct en encuestas de orientación política o tests de sesgo, aislando el efecto del fine-tune.
- Experimentos de control de cosmovisión: el identificador "worldview-gen10" sugiere una línea de investigación sobre modificación controlada de la perspectiva del modelo, replicable en entornos académicos.
- Generación de texto neutra en dominios sensibles: si el ajuste funciona según lo previsto, podría emplearse para producir resúmenes o análisis con menor carga ideológica en temas políticos, aunque sin garantías documentadas.
- Prototipado de chatbots con postura centrada: en entornos controlados de investigación, para estudiar la percepción de neutralidad en asistentes conversacionales.
- Docencia y divulgación: como ejemplo práctico de fine-tuning con Unsloth y TRL para explicar técnicas de alineación y sus limitaciones.
- Base para futuros fine-tunes: al ser un modelo pequeño (7B) y con licencia Apache 2.0, puede servir como punto de partida para experimentos de alineación adicionales en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo político, y el repositorio no contiene documentación adicional.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~15-16 GB (7.600 millones de parámetros × 2 bytes).
- VRAM estimada en cuantización de 8 bits: ~8 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): ~4,5-5 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en 8 bits, y en GPUs de 8 GB (RTX 3070, RTX 4060 Ti) con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp, Ollama, transformers con Unsloth.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización. Como referencia orientativa para un modelo 7B denso en una RTX 4090 con vLLM en FP16, se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune de Qwen2.5-7B-Instruct) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune experimental de alineación política, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 (ext. 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba, con benchmarks publicados y soporte multilingüe |
| Llama 3.1 8B Instruct | ~8B | 128.000 | Llama 3.1 Community License | Hugging Face, Meta | Contexto mucho mayor, licencia con restricciones comerciales |
| Mistral 7B Instruct v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, Mistral AI | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card es una plantilla genérica de Unsloth sin información sobre dataset, hiperparámetros completos ni metodología de evaluación.
- Riesgo elevado de alucinación y degradación: un fine-tune LoRA con rango 8 y solo 10 épocas sobre un objetivo ideológico concreto puede degradar capacidades generales del modelo base (código, matemáticas, tool calling).
- Sesgo ideológico intencionado: el ajuste busca desplazar la postura política hacia el "centro", lo que introduce un sesgo deliberado que puede no ser adecuado para aplicaciones que requieran neutralidad real o pluralidad de perspectivas.
- Idiomas: la model card declara únicamente inglés, a pesar de que el base soporta 29 idiomas; el fine-tune puede haber degradado el multilingüismo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ajustado.
- Sin validación comunitaria: 0 descargas y 0 likes indican que el modelo no ha sido evaluado por terceros.
- Fecha de creación futura (2026-11-03): el timestamp del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificar la integridad del repositorio.
- No apto para producción sin evaluación exhaustiva previa: la falta de benchmarks y de pruebas de regresión sobre capacidades del base desaconseja su uso en sistemas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5 (Alibaba): no disponible en la información proporcionada.
