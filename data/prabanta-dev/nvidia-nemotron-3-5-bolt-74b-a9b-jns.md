# prabanta-dev/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-JNS

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-JNS es una conversión de formato del modelo Nemotron 3.5 Bolt 74B-A9B de NVIDIA, publicada por el usuario prabanta-dev. No se trata de un modelo nuevo ni de un reentrenamiento: es el archivo GGUF oficial de NVIDIA (cuantizado por NVIDIA a dos bits en los expertos y NVFP4 en las capas Mamba) reescrito al formato JNS propietario del motor de inferencia Janas-LLM, escrito en C. El objetivo es permitir la ejecución local en CPU de un modelo de mezcla de expertos de gran tamaño en equipos de consumo.

El modelo subyacente emplea la arquitectura `nemotron_h_moe`, un diseño híbrido con 88 capas que combina 40 mezcladores Mamba-2, 40 capas de mezcla de expertos (496 expertos, 9 activos por token) y 8 capas de atención. Con 74 mil millones de parámetros totales y 9 mil millones activos por token, el modelo está diseñado para ofrecer una relación calidad/coste de cómputo favorable en inferencia.

La relevancia de esta ficha reside en su enfoque: demuestra la viabilidad de ejecutar un MoE de 74B en un portátil con 32 GB de RAM y CPU Intel Core Ultra 9 185H, alcanzando 7,0 tok/s en generación con 12 hilos, frente a los 5,92 tok/s de llama.cpp en el mismo hardware. El repositorio ocupa 22 GB y solo es legible por Janas-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_moe` (híbrida: Mamba-2 + mezcla de expertos + atención) |
| Parametros totales | 74 mil millones |
| Parametros activos | 9 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en IQ2_XXS (2 bits); capas Mamba en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | JNS (propietario de Janas-LLM); origen GGUF |
| Capas | 88 (40 Mamba-2, 40 MoE, 8 atención) |
| Expertos | 496 totales, 9 activos por token |
| Tamano del repositorio | 22,02 GB |
| Modalidad | Solo texto (sin codificador de imagen `mmproj`) |

## Arquitectura y entrenamiento

La arquitectura `nemotron_h_moe` es un transformer híbrido que intercala tres tipos de capas a lo largo de 88 niveles: 40 capas con mezcladores Mamba-2 (modelos de espacio de estados), 40 capas de mezcla de expertos con 496 expertos y 9 activos por token, y 8 capas de atención. Cada capa dispone de su propia normalización y conexión residual. Este diseño busca combinar la eficiencia de cómputo de los SSM con la capacidad de modelado de los MoE y la precisión de la atención completa en puntos clave de la red.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio no los detalla. La cuantización fue realizada por NVIDIA directamente: los expertos a dos bits (IQ2_XXS) y las capas Mamba en NVFP4. La conversión a JNS no altera los pesos ni poda nada; únicamente reorganiza el archivo en el orden de lectura de Janas-LLM, asignando a cada par (capa, experto) una ranura propia para permitir la lectura selectiva desde disco de los expertos que necesita cada token. La conversión es reproducible byte a byte.

## Capacidades

- Generación de texto autoregresiva en modo solo texto.
- Razonamiento y generación de código: la model card valida la coherencia de logits frente a llama.cpp en 395 de 400 posiciones de un programa en C.
- Inferencia local en CPU sin GPU, con todos los expertos en memoria.
- Lectura selectiva de expertos desde disco (NVMe) gracias a la disposición por ranuras del formato JNS.
- Uso de bloques de prompt en GPU (parcial): la GPU acepta los bloques de prompt pero aún no genera tokens completos.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en portátiles sin GPU dedicada: el modelo se ejecuta en CPU con 32 GB de RAM, lo que permite desplegar un MoE de 74B en equipos de desarrollo convencionales con Debian 13 o Ubuntu 22.04.
- Prototipado y experimentación con modelos de gran tamaño en entornos con restricciones de hardware: útil para investigadores que necesitan evaluar el comportamiento de un MoE de 74B sin acceso a clústeres con A100/H100.
- Generación de código asistida en local: la validación de logits en código C sugiere un comportamiento estable en tareas de programación, adecuado para entornos de desarrollo con requisitos de privacidad.
- Evaluación comparativa de motores de inferencia: el repositorio incluye datos de rendimiento frente a llama.cpp (7,0 vs 5,92 tok/s), lo que lo convierte en un banco de pruebas para comparar implementaciones en CPU.
- Despliegue en entornos air-gapped: al ser un archivo único de 22 GB descargable y verificable por SHA-256, puede transferirse a máquinas sin conexión y ejecutarse con Janas-LLM.
- Investigación sobre cuantización extrema: permite estudiar el impacto de IQ2_XXS en expertos y NVFP4 en capas Mamba sobre la calidad de generación en un modelo de 74B.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento de inferencia, no benchmarks de calidad (MMLU, HumanEval, GSM8K no están publicados en la información disponible).

| Metrica (Intel Core Ultra 9 185H, 32 GB DDR5-5600, Debian 13) | Janas-LLM | llama.cpp |
|---|---:|---:|
| Generación, 12 hilos | 7,0 tok/s | 5,92 tok/s |
| Lectura de prompt de 512 tokens, 12 hilos | 15,1 tok/s | 16,7 tok/s |
| Generación y lectura, 20 hilos usables (`janas-bench`) | 8,3 y 20,2 tok/s | no medido |
| Coincidencia de token más probable vs llama.cpp (400 tokens de C) | 395/400 | referencia |
| Diferencia media de logits vs llama.cpp | 0,183 | referencia |

Mediciones de finales de octubre de 2026, con todos los expertos en memoria. El rendimiento variará en otras máquinas.

## Requisitos de hardware

- RAM: 32 GB DDR5-5600 suficiente para el modelo completo con todos los expertos en memoria (archivo de 22,02 GB).
- CPU: Intel Core Ultra 9 185H (6 núcleos P, 8 E, 2 LP; AVX2, FMA, F16C, AVX-VNNI). Se recomienda soporte AVX2 como mínimo.
- Almacenamiento: SSD NVMe de ~5,7 GB/s de lectura para la carga inicial y lectura selectiva de expertos.
- GPU: opcional; la GPU acepta bloques de prompt pero no genera tokens completos en esta versión.
- Sistema operativo: Linux x86-64 (Ubuntu 22.04, Debian 12 o posterior).
- Motor de inferencia: exclusivamente Janas-LLM (GPL-3.0-or-later); no es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Throughput medido: 7,0 tok/s en generación y 15,1 tok/s en lectura de prompt con 12 hilos; 8,3 y 20,2 tok/s con 20 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-74B-A9B-JNS (este) | 74B | 9B | no disponible | JNS | OpenMDW 1.1 | Janas-LLM |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF | 74B | 9B | no disponible | GGUF | OpenMDW 1.1 | llama.cpp y compatibles |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B | 9B | no disponible | safetensors (BF16) | OpenMDW 1.1 | vLLM, TGI, etc. |

La comparativa de calidad frente a otros modelos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: el archivo JNS solo lo lee Janas-LLM; no es portable a otros motores de inferencia.
- Solo texto: el codificador de imagen (`mmproj`) de NVIDIA no se ha convertido, por lo que no hay capacidades multimodales.
- Longitud de contexto no documentada: no se especifica en la información disponible.
- Idiomas soportados no documentados.
- Cuantización agresiva: expertos a 2 bits (IQ2_XXS) pueden degradar la calidad frente al modelo BF16 original; no se han publicado evaluaciones de calidad.
- GPU limitada: la aceleración por GPU está incompleta (solo bloques de prompt, no generación de tokens).
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con términos específicos; debe revisarse antes de uso comercial. El motor Janas-LLM es GPL-3.0-or-later, lo que puede afectar a la distribución de productos derivados.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; remiten a la model card de NVIDIA.
- Fecha de creación futura (2026-11-14): el repositorio está marcado con una fecha posterior a la actual, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prabanta-dev/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-JNS
- Modelo base GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Motor Janas-LLM: https://github.com/prabanta-dev/janas
- README de Janas: https://github.com/prabanta-dev/janas#readme
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
