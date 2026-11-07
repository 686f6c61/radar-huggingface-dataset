# mradermacher/Qwen3.6-35B-A3B-CyberFusion-GGUF

## Resumen

Qwen3.6-35B-A3B-CyberFusion-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo Qwen3.6-35B-A3B-CyberFusion, un ajuste fino (fine-tune) publicado por el usuario Kernel-Lord sobre el modelo base Qwen3.6-35B-A3B. Esta ficha cubre específicamente el repositorio de cuantizaciones estáticas generado por mradermacher, un conocido distribuidor de quants para llama.cpp y herramientas compatibles.

El modelo subyacente es un mixture-of-experts (MoE) de aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones de parámetros activos por token, construido sobre una arquitectura híbrida que alterna capas Gated DeltaNet con capas de atención con compuerta (Gated Attention). Es el primer modelo de la familia Qwen3.6 publicado con pesos abiertos, según la información disponible.

La relevancia de este repositorio es práctica: ofrece cuantizaciones estáticas listas para usar (desde Q2_K hasta Q8_0, además de x-f16 e IQ4_XS) que permiten ejecutar un modelo MoE de 35B en hardware de consumo, ya que solo se activan ~3B parámetros por token. No obstante, la información pública sobre el fine-tune CyberFusion (datos de entrenamiento, licencia, idiomas, benchmarks) es prácticamente inexistente en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (Gated DeltaNet + Gated Attention) |
| Parámetros totales | ~35.000 millones |
| Parámetros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas Gated DeltaNet (un mecanismo de atención lineal recurrente) con capas de Gated Attention clásica, organizadas en un patrón alterno. Se trata de un diseño MoE con ~35B parámetros totales y ~3B activos por token, lo que reduce drásticamente el coste computacional por token frente a un modelo denso del mismo tamaño. Según la información disponible, es el primer modelo de la familia Qwen3.6 con pesos abiertos, empaquetado para inferencia local mediante llama.cpp y herramientas compatibles (LM Studio, koboldcpp, Jan, Unsloth Studio).

Sobre el fine-tune CyberFusion en concreto no hay información publicada: se desconoce el dataset de ajuste, si se emplearon técnicas de RLHF/DPO, el número de tokens de entrenamiento o la composición de los datos. El repositorio de mradermacher es únicamente una conversión a GGUF del modelo de Kernel-Lord, con cuantizaciones estáticas generadas mediante su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se ha aplicado cuantización de la matriz mmproj (skip_mmproj 1), lo que sugiere que el modelo base no incluye componentes multimodales o que estos no se han convertido.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Capacidad de ejecución local eficiente gracias a la activación de solo ~3B parámetros por token.
- Soporte de cuantizaciones de 2 a 8 bits, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- Compatibilidad con llama.cpp, LM Studio, koboldcpp, Jan y Unsloth Studio.
- Tool calling / function calling: no disponible (no confirmado para este fine-tune).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El nombre "CyberFusion" sugiere un ajuste orientado a ciberseguridad, pero no hay documentación que lo confirme.

## Casos de uso

- Inferencia local en estaciones de trabajo: desplegar el modelo con llama.cpp u Ollama usando cuantizaciones Q4_K_M o Q5_K_M para obtener un equilibrio razonable entre calidad y uso de memoria en GPUs de consumo.
- Experimentación con modelos MoE: estudiar el comportamiento de un MoE de 35B con ~3B activos en tareas de generación de texto sin necesidad de infraestructura de datacenter.
- Evaluación de fine-tunes comunitarios: comparar el comportamiento de CyberFusion frente al modelo base Qwen3.6-35B-A3B en tareas de dominio específico (presuntamente seguridad, aunque no confirmado).
- Prototipado rápido con LM Studio o Jan: integrar el GGUF en aplicaciones de escritorio para pruebas de concepto sin escribir código de servidor.
- Investigación sobre cuantización: analizar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo MoE híbrido, aprovechando la disponibilidad de todos los niveles en el mismo repositorio.
- Despliegue en entornos con VRAM limitada: usar Q3_K_M o IQ4_XS para ajustar el modelo en GPUs de 16-24 GB, aceptando la pérdida de calidad asociada a cuantizaciones agresivas.
- Base para ajustes posteriores: servir como punto de partida para LoRA o fine-tunes adicionales en formato GGUF-compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización y longitud de contexto):
  - Q2_K: ~13-14 GB
  - Q3_K_M: ~16-17 GB
  - Q4_K_M: ~21-22 GB
  - Q5_K_M: ~25-26 GB
  - Q6_K: ~29-30 GB
  - Q8_0: ~37-38 GB
  - x-f16: ~70 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q3_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40 GB o H100 para Q6_K/Q8_0; configuraciones multi-GPU para x-f16.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q2_K a Q4_K_M en GPUs de 16-24 GB (RTX 4080, 4090, 3090, 7900 XTX). Las cuantizaciones Q5_K_M y superiores requieren 24 GB o más con contexto corto, o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, LM Studio, koboldcpp, Jan, Unsloth Studio, Ollama (mediante importación del GGUF). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se requeriría el modelo en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3B activos, el throughput debería ser sustancialmente mayor que el de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-CyberFusion (este) | ~35B | ~3B | no disponible | no disponible | GGUF |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | no disponible | safetensors/GGUF |
| Qwen3.6-35B-A3B-StyleTune (mradermacher) | ~35B | ~3B | no disponible | no disponible | GGUF |
| Qwen3.6-35B-A3B-uncensored-heretic (mradermacher) | ~35B | ~3B | no disponible | no disponible | GGUF |

Las alternativas listadas son otros fine-tunes del mismo modelo base distribuidos por el mismo autor de cuantizaciones. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No hay información publicada sobre la licencia del fine-tune CyberFusion ni del modelo base; verificar antes de cualquier uso comercial.
- Se desconoce la procedencia de los datos de ajuste y si el fine-tune introduce sesgos o comportamientos no deseados.
- El nombre "CyberFusion" sugiere una especialización en ciberseguridad, pero no está documentada; no asumir capacidades específicas sin evaluación propia.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad en modelos MoE; usar solo si la VRAM es crítica.
- Riesgo de alucinación inherente a los modelos de lenguaje; no confirmado ni cuantificado para este fine-tune.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no documentada; no asumir la del modelo base sin verificar la configuración del GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Al ser una conversión de un fine-tune de terceros, no hay garantía de que el pipeline de cuantización haya preservado fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-CyberFusion-GGUF
- Modelo original (Kernel-Lord): https://huggingface.co/Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion
- Guía de cuantizaciones y ejecución: https://allthings.how/qwen3-6-35b-a3b-gguf-quants-sizes-and-how-to-run-it/
- Fine-tune relacionado (StyleTune): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-StyleTune-GGUF
- Fine-tune relacionado (uncensored-heretic): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-uncensored-heretic-i1-GGUF
