# Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata

## Resumen

Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata es una cuantización de un modelo MoE híbrido de la familia Qwen, publicada por el usuario Maximilian228. Se trata de una conversión a NVFP4 mediante GPTQ de todos los expertos enrutados del checkpoint BF16 original de Qwen/Qwen3.8-Flash-Next, empaquetada para el motor de inferencia Strata NVFP4. El modelo base es un MoE de 51.200 millones de parámetros totales, según los datos reales de safetensors, con capacidades de generación de texto y soporte declarado para inglés y chino.

El objetivo de esta ficha es evaluar una cuantización de precisión reducida (4 bits NVFP4) que busca hacer viable la ejecución de un MoE de gran tamaño en hardware de consumo. Según la model card, el modelo resultante ocupa unos 69 GiB de RAM en uso y puede ejecutarse en una RTX 5090 con 32 GB de VRAM y 96 GB de RAM del sistema, con una velocidad de decodificación de 177 tokens/s y una lectura de prompt de 32.000 tokens en 3,9 segundos.

La relevancia actual radica en que permite desplegar un modelo de 51.200 millones de parámetros en una única GPU de consumo, manteniendo un 93,6% de coincidencia en el token más probable respecto a la referencia Q8_0. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (según model card, "hybrid MoE") |
| Parámetros totales | 51.200.245.760 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se menciona un prompt de 32.007 tokens en las pruebas) |
| Tipos de cuantización | NVFP4 (expertos enrutados), GPTQ; atención y router en otras precisiones según el modelo base |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors empaquetado para Strata NVFP4 (repo de 128,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido de 51.200 millones de parámetros totales, según los datos de safetensors. La model card indica que todos los expertos enrutados están cuantizados en NVFP4 mediante GPTQ a partir del checkpoint BF16 original, mientras que el router conserva la precisión del modelo base (BF16 en la referencia Q8_0) y la atención mantiene una precisión superior a 4 bits. Se menciona también la presencia de una "route tail skip" (omisión de cola de ruta) que los modelos GGUF aplican por defecto y que aporta aproximadamente un 10% más de velocidad de decodificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona que el modelo base incorpora una tabla de n-gramas y una PLE (probablemente "positional language embedding" o componente similar) en FP8, datos que no se detallan más allá de la comparativa. La cuantización GPTQ se aplicó únicamente a los expertos enrutados, manteniendo el resto de componentes en precisiones superiores para preservar la fidelidad.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conversación multi-turno (las pruebas incluyen chats codiciosos de hasta 1.500 tokens).
- Procesamiento de prompts largos: se ha probado con un prompt de 32.007 tokens.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según los tags del modelo.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Ejecución en hardware de consumo gracias a la cuantización NVFP4.

## Casos de uso

- Asistencia conversacional local en inglés o chino: el modelo puede gestionar conversaciones multi-turno con un contexto de hasta 32.000 tokens, adecuado para asistentes personales desplegados en una estación de trabajo con RTX 5090 y 96 GB de RAM.
- Procesamiento de documentos largos: con capacidad para leer un prompt de 32.000 tokens en 3,9 segundos, es viable para resumir o extraer información de contratos, informes o artículos extensos en una sola pasada.
- Generación de código en pipelines de desarrollo: aunque no se confirma soporte de tool calling, el modelo puede integrarse en editores o scripts de generación de código en local, evitando el envío de código propietario a servicios en la nube.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de NVFP4 con GPTQ frente a otras cuantizaciones (Q8_0, GGUF de Unsloth, IQ de ISTA-DASLab) en términos de fidelidad y velocidad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local (GPU de consumo más RAM del sistema), permite procesar datos sensibles sin conexión externa.
- Prototipado de agentes conversacionales: la velocidad de decodificación de 177 tokens/s y la latencia de lectura de prompt de 3,9 segundos permiten iterar rápidamente en el diseño de flujos conversacionales antes de escalar a infraestructura mayor.
- Evaluación comparativa de motores de inferencia: el modelo está empaquetado para Strata NVFP4, lo que lo hace útil para comparar el rendimiento de este motor frente a llama.cpp, vLLM u otras alternativas en el mismo hardware.

## Benchmarks y rendimiento

La model card proporciona una comparativa de fidelidad (coincidencia del token más probable con el modelo Q8_0 de referencia) y velocidad de decodificación, medida en una RTX 5090 (32 GB), Ryzen 9 9950X3D, 128 GB de DDR5-5600, Windows 11, con el motor Strata NVFP4 0.1.42-nvfp4.1. La fidelidad se midió sobre 5.153 tokens de código, documentación, chats en inglés y ucraniano, y transcripciones de agentes, con todos los modelos alimentados con el mismo texto.

| Modelo | Coincidencia con Q8_0 | Decodificación (tokens/s) | Prompt 32K (s) | RAM en uso (GiB) | PC requerido |
|---|---:|---:|---:|---:|---|
| Q8_0 (referencia) | 100% | 47 | 10,3 | 106 | 128 GB |
| NVFP4 + Q8_0 mix | 95,0% | 91 | 4,2 | 105 | 128 GB |
| Unsloth UD-Q4_K_XL | 94,1% | 169 | 4,9 | 77 | 96 GB |
| **NVFP4 GPTQ (este modelo)** | **93,6%** | **177** | **3,9** | **69** | **96 GB** |
| NVIDIA NVFP4 (convertido) | 92,9% | 167 | 3,9 | 69 | 96 GB |
| NVIDIA FP4-Local (QAD) | 92,2% | 191 | 3,7 | 69 | 96 GB |
| Unsloth UD-Q3_K_XL | 90,7% | 208 | 3,8 | 58 | 96 GB |
| ISTA-DASLab IQ3_S | 90,0% | 228 | 3,9 | 52 | 64 GB |
| ISTA-DASLab IQ3_XXS | 87,3% | 239 | 3,9 | 45 | 64 GB |
| ISTA-DASLab IQ2_XS | 85,0% | 265 | 4,2 | 38 | 48 GB |
| ISTA-DASLab Q2_0 | 84,1% | 256 | 3,9 | 37 | 48 GB |

En un PC de 64 GB de RAM, este modelo y el NVFP4 de NVIDIA decodifican a unos 115 tokens/s y leen un prompt de 32K en unos 9 segundos en modo de baja RAM. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB o más según la model card (los expertos se ejecutan en CPU y la GPU gestiona atención y otras capas).
- RAM del sistema: 96 GB recomendados para la velocidad mostrada (177 tokens/s); con 64 GB se puede ejecutar en modo de baja RAM a unos 115 tokens/s; el mínimo indicado para este modelo es de 48 GB.
- GPU recomendadas: RTX 5090 (32 GB) es la empleada en las pruebas; la model card indica compatibilidad con tarjetas RTX de las series 20 a 50 con 12 GB o más de VRAM.
- ¿Cabe en GPU de consumo? Sí, en una RTX 5090 con 32 GB de VRAM y 96 GB de RAM del sistema; también en GPUs con 12 GB o más siempre que se cumpla el requisito de RAM.
- Opciones de despliegue: Strata NVFP4 (motor específico, versión 0.1.42-nvfp4.1 o superior). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato concreto.
- Latencia y throughput: 177 tokens/s de decodificación y 3,9 s para un prompt de 32.007 tokens en la configuración de referencia (RTX 5090, Ryzen 9 9950X3D, 128 GB DDR5-5600, Windows 11). En un PC de 64 GB: ~115 tokens/s y ~9 s para 32K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Coincidencia con Q8_0 | Velocidad (tokens/s) | RAM (GiB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| **Este modelo (NVFP4 GPTQ)** | 51.200 M totales | no disponible | 93,6% | 177 | 69 | qwen-community-1.0 | Hugging Face (Maximilian228) |
| NVIDIA NVFP4 (convertido) | 51.200 M totales | no disponible | 92,9% | 167 | 69 | qwen-community-1.0 | Hugging Face (Maximilian228) |
| Unsloth UD-Q4_K_XL | 51.200 M totales | no disponible | 94,1% | 169 | 77 | qwen-community-1.0 | Hugging Face (unsloth) |
| ISTA-DASLab IQ3_XXS | 51.200 M totales | no disponible | 87,3% | 239 | 45 | qwen-community-1.0 | Hugging Face (ISTA-DASLab) |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que no se dispone de información sobre modelos alternativos de otros desarrolladores con características equiparables. Este modelo destaca por su equilibrio entre fidelidad (93,6%) y velocidad (177 tokens/s) con un consumo de 69 GiB de RAM, superando en velocidad a Unsloth UD-Q4_K_XL (169 tokens/s) con menor fidelidad y menor consumo de RAM que este último (69 frente a 77 GiB).

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino según los tags; no se declara soporte de español ni de otras lenguas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Sesgos conocidos: no disponible en la información proporcionada.
- La licencia qwen-community-1.0 condiciona el uso comercial; es necesario revisar los términos del archivo LICENSE del repositorio antes de un despliegue en producción.
- La cuantización NVFP4 con GPTQ introduce una pérdida de fidelidad del 6,4% respecto a Q8_0 en la métrica de coincidencia del token más probable, lo que puede afectar a tareas sensibles a la precisión.
- Requiere el motor Strata NVFP4, lo que limita la portabilidad frente a formatos estándar como GGUF o safetensors convencionales.
- El modelo está empaquetado para Windows 11 según las pruebas; no se detalla compatibilidad con Linux u otros sistemas.
- La longitud de contexto no se especifica en la información disponible; las pruebas se limitan a 32.007 tokens.
- No se dispone de información sobre tool calling, agentes o modo de razonamiento, por lo que no se debe asumir su disponibilidad en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor Strata NVFP4: https://github.com/sergqwer/strata-nvfp4
- Variante Q8_0: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-Q8_0-Strata
- Variante NVFP4 + Q8_0 mix: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-Q8-Mix-Strata
- Variante NVIDIA NVFP4 convertida: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Strata
- NVIDIA FP4-Local (QAD): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
