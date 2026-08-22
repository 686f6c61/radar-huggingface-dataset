# MethodWhite/Qwen3.5-9B-HSAQR-v2

## Resumen

Qwen3.5-9B-HSAQR-v2 es una adaptación del modelo base Qwen/Qwen3.5-9B-Base desarrollada por Jesús Antonio Zárate Hernández (MethodWhite) bajo el proyecto M.A.T.E.R.I.A. Research. El modelo incorpora el sistema HSAQR v2, un pipeline de cuantización adaptativa, poda estructural (PWS) y fine-tuning con optimizador propio (HSAQ-optimizer), orientado a la identificación automática de patrones de refusal y su reescritura, con el objetivo de mejorar la eficiencia en memoria y la capacidad de razonamiento en escenarios de seguridad autorizada.

Con 7.053.783.552 parámetros reales (aunque el nombre sugiere 9B), el modelo mantiene la arquitectura transformer del base Qwen3.5-9B, que soporta contexto largo (262K según el catálogo de Microsoft Foundry) y capacidades multimodales (texto, imagen, vídeo) heredadas del modelo original. Está disponible en formato completo bf16 y en cuantizaciones GGUF (Q8_0 y Q4_K_M), lo que permite su despliegue en entornos con recursos limitados.

La relevancia del modelo radica en su enfoque experimental: combina técnicas de sparsidad adaptativa, poda de pesos (PWS) y un optimizador sin estado (0B) que reduce el consumo de RAM, aunque su licencia "other" y su propósito declarado (testing de seguridad autorizado) limitan su uso a contextos de investigación y aplicaciones controladas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 7.053.783.552 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el base Qwen3.5-9B soporta 262K tokens) |
| Tipos de cuantizacion | bf16 (completo), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | No disponible (el base Qwen3.5-9B es multilingüe) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso, heredada de Qwen3.5-9B-Base. El pipeline HSAQR v2 aplica tres modificaciones principales: (1) identificación automática de capas con señal de refusal mediante estadística IQR/percentil (capas L17-L21, L23, L24, L29), (2) reescritura adaptativa de canales con ortogonalización selectiva, y (3) poda estructural global (PWS) que reduce la dimensión intermedia del MLP de 12288 a 7456, eliminando un 39% de los pesos y ahorrando ~7 GB en disco.

El entrenamiento se realizó con el HSAQ-optimizer, que combina QLoRA 4-bit con sparsity en el forward y el gradiente (máscara STE), sin estado de optimizador (0B). El dataset es unificado 2026, compuesto por ciencia, c4 y seguridad, con 10,011 ejemplos. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y conversación multi-turno, siguiendo el template ChatML de Qwen.
- Razonamiento y cadena de pensamiento, heredado del base Qwen3.5-9B.
- Capacidades multimodales (entrada de imagen y vídeo) del base, aunque no se detallan en la model card.
- Soporte de tool calling y function calling (el base Qwen3.5-9B lo soporta según la API de HuggingFace).
- Capacidades multilingües heredadas del base, sin especificación concreta en la model card.
- Sistema de detección y reescritura de refusal (HSAQR) orientado a seguridad ofensiva controlada.

## Casos de uso

- **Testing de seguridad autorizado**: el modelo puede utilizarse en bug bounty o CTF para generar payloads y scripts de pentesting con permiso explícito, aprovechando su sistema de reescritura de refusal para evitar bloqueos en escenarios legales.
- **Investigación defensiva**: permite analizar patrones de refusal en modelos y desarrollar técnicas de mitigación, gracias a la identificación automática de capas críticas.
- **Educación en ciberseguridad**: en entornos académicos, se usa para enseñar técnicas de red teaming y evaluación de seguridad de modelos de IA.
- **Generación de contenido técnico**: puede producir documentación, scripts y ejemplos de código para pruebas de penetración, con contexto largo (262K tokens) para manejar proyectos extensos.
- **Despliegue en entornos con recursos limitados**: las cuantizaciones GGUF (Q4_K_M, ~5.6 GB) permiten ejecutar el modelo en GPUs de consumo, como RTX 4090, para prototipado y testing local.
- **Investigación de eficiencia computacional**: el HSAQ-optimizer reduce el consumo de RAM en comparación con AdamW (27-39% vs 53.8%), siendo útil para estudios sobre optimización de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas internas del pipeline: precisión del HSAQ-optimizer 92.5% frente a 72.5% de AdamW y 55.3% de SGD en una prueba controlada, así como una reducción de RAM del 53.8% al 27-39%. Estos datos no son comparables con benchmarks públicos y no se han verificado de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: bf16 completo ~14 GB, GGUF Q8_0 ~7.5 GB, GGUF Q4_K_M ~5.6 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) o superior para bf16/Q8_0; RTX 3080 (12 GB) o superior para Q4_K_M.
- **Compatibilidad con GPU de consumo**: sí, con cuantización Q4_K_M o Q8_0 en tarjetas con ≥8 GB de VRAM.
- **Opciones de despliegue**: Transformers/PyTorch (bf16), Ollama, llama.cpp (llama-server), LM Studio, y servidores compatibles con la API de HuggingFace.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-HSAQR-v2 | 7.05B | 262K (base) | other | HuggingFace (GGUF, safetensors) | Poda estructural, optimizador propio |
| Qwen3.5-9B-Base | 9B (aprox.) | 262K | Apache 2.0 | HuggingFace | Modelo base sin modificaciones |
| Qwen2.5-7B | 7.6B | 32K | Apache 2.0 | HuggingFace | Versión anterior de Qwen, sin multimodalidad |

La comparativa se limita a modelos Qwen por ser la familia base. No se dispone de datos de benchmarks para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia "other" no está especificada, lo que impide un uso comercial sin clarificación legal.
- **Alcance de uso**: el modelo está diseñado para testing de seguridad autorizado (bug bounty, CTF, pentesting con permiso); su uso fuera de este contexto puede ser inapropiado.
- **Riesgo de alucinación**: no se han documentado pruebas de robustez; el fine-tune con un dataset de solo 10,011 ejemplos puede aumentar la propensión a inventar información.
- **Sesgos**: al estar basado en Qwen3.5-9B, hereda sesgos del corpus original, pero no se han realizado evaluaciones de sesgo específicas.
- **Limitaciones de idioma**: no se especifican idiomas soportados; el base es multilingüe, pero el fine-tune podría degradar el rendimiento en idiomas no representados en el dataset de seguridad.
- **Rendimiento no verificado**: los resultados de precisión (92.5%) provienen de pruebas internas no replicadas; no hay benchmarks públicos independientes.
- **Compatibilidad en producción**: el pipeline de sparsity y poda puede afectar la estabilidad del modelo en tareas generales; se recomienda validar en casos de uso concretos.

## Enlaces

- [HuggingFace: MethodWhite/Qwen3.5-9B-HSAQR-v2](https://huggingface.co/MethodWhite/Qwen3.5-9B-HSAQR-v2)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Qwen3.5-9B en Microsoft Foundry Models](https://ai.azure.com/catalog/models/qwen-qwen3.5-9b)
- [Qwen3.5-9B: Specs, Benchmarks & Model Details en DataLearnerAI](https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-9b)
- [Qwen3.5 9B API en AI Model APIs](https://aimodelapis.com/providers/huggingface/huggingface-qwen-qwen3-5-9b)
