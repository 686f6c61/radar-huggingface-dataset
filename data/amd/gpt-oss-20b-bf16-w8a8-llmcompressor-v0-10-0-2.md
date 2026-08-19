# amd/gpt-oss-20b-BF16-w8a8-llmcompressor-v0.10.0.2

## Resumen

Este modelo es una versión cuantizada del **gpt-oss-20b-BF16** (basado en el modelo open-weight de OpenAI), creada por AMD para optimizar la inferencia en CPU. Utiliza cuantización W8A8 (8 bits en pesos y 8 bits en activaciones dinámicas) mediante el framework LLM Compressor, lo que reduce el tamaño de los pesos de 40 GiB a 21 GiB (~47 % de reducción) manteniendo una calidad casi idéntica al original. Está diseñado específicamente para ejecutarse en procesadores AMD EPYC con la pila ZenDNN, y es compatible con vLLM v0.22.0.

La relevancia de este modelo radica en que permite desplegar un LLM de 20 000 millones de parámetros en hardware de CPU sin necesidad de GPU, lo que abarata costes y amplía los escenarios de despliegue en entornos empresariales. Al ser una cuantización one-shot con RTN (Round-to-Nearest), no requiere reentrenamiento y conserva el rendimiento en tareas de razonamiento matemático (GSM8K) con una recuperación del 100,08 % frente al baseline BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (Mixture-of-Experts, MoE) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (8-bit pesos, 8-bit activaciones dinámicas) mediante RTN |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es **gpt-oss-20b**, un transformador con arquitectura Mixture-of-Experts que activa solo un subconjunto de expertos por token, lo que aumenta la capacidad efectiva sin incrementar proporcionalmente el coste computacional. Esta versión concreta no ha sido entrenada desde cero, sino que es el resultado de un proceso de cuantización one-shot aplicado al checkpoint BF16 de `unsloth/gpt-oss-20b-BF16` mediante la herramienta LLM Compressor v0.10.0.2.

La cuantización utiliza el algoritmo Round-to-Nearest (RTN) sobre todas las capas `Linear` del modelo, excepto `lm_head`, los routers y las puertas (`gate`). Para ello, AMD expandió los expertos MoE fusionados en módulos `nn.Linear` individuales, garantizando que cada experto se cuantice por separado. El resultado es un modelo W8A8 con activaciones cuantizadas dinámicamente, optimizado para la pila ZenDNN en CPU AMD EPYC.

## Capacidades

- Generación de texto en inglés con buena capacidad de seguimiento de instrucciones, codificación y razonamiento general, según la documentación de AMD.
- Inferencia eficiente en CPU gracias a la cuantización W8A8 y la optimización ZenDNN.
- Compatible con el motor de inferencia vLLM v0.22.0, lo que permite integración con APIs estándar de OpenAI.
- Soporte para generación de texto con parámetros de muestreo (temperatura, max tokens, etc.) a través de vLLM.
- No incluye capacidades multimodales ni soporte de tool calling específico en la información proporcionada.

## Casos de uso

- Despliegue de asistentes conversacionales en servidores CPU: el modelo puede ejecutarse en instancias AMD EPYC sin GPU, reduciendo costes de infraestructura para chatbots internos o de atención al cliente.
- Generación de código en entornos de desarrollo: gracias a su capacidad de codificación, puede integrarse en pipelines de CI/CD para autocompletado o revisión de código, siempre que la latencia sea aceptable en CPU.
- Razonamiento matemático y resolución de problemas: el benchmark GSM8K muestra una precisión del 88,32 % en 5-shot, lo que lo hace útil para aplicaciones educativas o de análisis cuantitativo.
- Inferencia en entornos con restricciones de hardware: al ser una cuantización W8A8, puede desplegarse en máquinas sin GPU, como servidores legacy o edge.
- Evaluación y pruebas de modelos: al ser una versión cuantizada, sirve como referencia para medir el impacto de la cuantización en tareas específicas comparado con el baseline BF16.
- Investigación en optimización de inferencia: el proceso de cuantización está documentado y reproducible, lo que lo convierte en un caso de estudio para técnicas de compresión de modelos.

## Benchmarks y rendimiento

La model card incluye una evaluación comparativa con el baseline BF16 usando `lm-evaluation-harness` con el motor vLLM:

| Benchmark | BF16 Baseline | W8A8 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 0,8825 | 0,8832 | 100,08 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- CPU: procesadores AMD EPYC (optimizado para ZenDNN). No compatible con GPU.
- RAM: se requiere memoria suficiente para cargar los ~21 GiB de pesos en memoria, más overhead de activaciones y KV cache. Se recomienda al menos 32 GiB de RAM.
- Disco: 22,1 GB para el repositorio de pesos.
- Software: PyTorch v2.11, ZenTorch v2.11.0.1, vLLM v0.22.0, LLM Compressor v0.10.0.2. Se recomienda configurar `LD_PRELOAD` con `libomp.so` o `libiomp5.so` para un rendimiento óptimo.
- Inferencia: solo CPU, con soporte para vLLM. No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| gpt-oss-20b-BF16 (base) | 20,9 B | BF16 | no disponible | Apache 2.0 | GPU/CPU |
| Este modelo (W8A8) | 20,9 B | W8A8 | no disponible | Apache 2.0 | CPU AMD EPYC |
| gpt-oss-20b (original) | 20,9 B | BF16 | no disponible | Apache 2.0 | GPU/CPU |

La principal diferencia frente al base es la reducción de tamaño (~47 %) y la optimización para CPU, a costa de una ligera pérdida de precisión (recuperación del 100,08 % en GSM8K). No se dispone de comparación con otros modelos cuantizados similares en la información proporcionada.

## Limitaciones y advertencias

- **Solo CPU**: el modelo está optimizado para AMD EPYC con ZenDNN y no está diseñado para inferencia en GPU.
- **Versión bloqueada**: requiere versiones específicas de PyTorch (v2.11), ZenTorch (v2.11.0.1), vLLM (v0.22.0) y LLM Compressor (v0.10.0.2). Puede no cargar correctamente con otras versiones.
- **Idioma**: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- **Contexto**: no se especifica la longitud máxima de contexto en la información disponible; el comando de evaluación usa `max_model_len=4096`, pero esto no indica el límite real del modelo.
- **Sesgos y alucinaciones**: al ser un modelo de lenguaje, puede generar contenido sesgado o alucinado; no se han documentado mitigaciones específicas.
- **Licencia**: Apache 2.0, permite uso comercial, pero las modificaciones de AMD están sujetas a los derechos de autor indicados en el archivo LICENSE.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amd/gpt-oss-20b-BF16-w8a8-llmcompressor-v0.10.0.2)
- [Modelo base BF16 (unsloth)](https://huggingface.co/unsloth/gpt-oss-20b-BF16)
- [Artículo técnico de AMD sobre GPT-OSS-20B en NPUs](https://www.amd.com/en/developer/resources/technical-articles/2026/accelerating-gpt-oss-20b-on-amd-ryzen-ai-npus.html)
- [Guía de modelos comprimidos en ZenDNN (docs AMD)](https://docs.amd.com/r/en-US/57300-ZenDNN-user-guide/LLM-Compressed-Models)
