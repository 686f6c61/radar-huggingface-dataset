# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-ascend-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest junto con OpenBMB, publicado en el ecosistema de adaptación multi-chip FlagOS de la comunidad Zhongzhi. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que lo convierte en el primer modelo multimodal MoE de código abierto diseñado para operar en dispositivo (on-device) de forma fluida y sin pérdida de calidad.

El modelo resuelve el problema de desplegar comprensión multimodal de alta capacidad en entornos con recursos limitados, desde centros de datos hasta dispositivos de usuario final, incluidas plataformas ARM de borde. Su innovación principal, Lookahead Expert Scheduling (LES), precarga expertos y solapa cómputo con lectura para reducir la latencia de inferencia en dispositivo; según las cifras oficiales, alcanza más de 13 tokens por segundo en un iPhone 17 Pro Max.

Esta ficha corresponde específicamente a la variante adaptada para Huawei Ascend mediante el stack FlagOS, con pesos en BF16 y soporte de despliegue vía SGLang sobre NPU. La relevancia actual radica en su licencia Apache 2.0, su ventana de contexto de 262.144 tokens y su adaptación day-0 a 12 plataformas de hardware distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE) |
| Parametros totales | 35B |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens (según configuración de despliegue) |
| Tipos de cuantizacion | BF16 (esta variante); otras cuantizaciones no disponibles |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), empaquetado para Ascend/FlagOS |

## Arquitectura y entrenamiento

MiniCPM-V-4.7-35B-A3B emplea una arquitectura MoE con 35B parámetros totales y aproximadamente 3B activos por token, lo que permite un coste de cómputo por inferencia comparable a un modelo denso de ~3B pese a la capacidad representacional de un modelo de 35B. Incorpora compresión temprana de tokens visuales dentro del ViT con factores de compresión 4× y 16×, técnica que reduce el número de tokens visuales procesados y equilibra detalle visual frente a eficiencia. Además soporta decodificación especulativa DSpark para acelerar la generación.

La innovación técnica central es Lookahead Expert Scheduling (LES), que precarga los expertos necesarios y paraleliza el cómputo con la lectura de pesos, reduciendo la latencia en dispositivo. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni del detalle de las fases de alineación (RLHF/DPO). La adaptación FlagOS cubre 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Sunrise, Mac M5 Pro y CIX P1), incluyendo CPUs ARM de borde.

## Capacidades

- Comprensión multimodal de imagen y texto (visión-lenguaje).
- Generación de texto y razonamiento en modo Instruct.
- Razonamiento matemático y científico de nivel avanzado (evaluado en Math_500 y GPQA_Diamond).
- Comprensión de escenas y razonamiento visual (evaluado en ERQA).
- Operación on-device con latencia reducida gracias a LES y decodificación especulativa DSpark.
- Soporte multilingüe limitado a chino e inglés.
- Despliegue en servidor compatible con la API OpenAI (`/v1/chat/completions`) vía SGLang.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en dispositivo móvil: el modelo puede ejecutarse en un iPhone 17 Pro Max a más de 13 tokens/s, habilitando comprensión de imágenes y conversación local sin enviar datos a la nube, gracias a sus ~3B parámetros activos y a LES.
- Despliegue en centros de datos sobre Huawei Ascend: la imagen FlagOS-Ascend y la configuración SGLang con tensor-parallel-size 2 permiten servir el modelo en clústeres NPU con contexto de 262.144 tokens para cargas de trabajo empresariales.
- Análisis documental de contexto largo: con 262.144 tokens de ventana, el modelo puede procesar informes extensos, contratos o expedientes completos junto con sus figuras en una sola pasada.
- Razonamiento matemático y científico asistido: sus resultados en Math_500 (95,20) y GPQA_Diamond (80,81) lo hacen adecuado para tutoría técnica, verificación de cálculos y apoyo a investigación.
- Procesamiento de imágenes en el borde (edge): la compresión 4×/16× de tokens visuales dentro del ViT reduce el coste de cómputo, permitiendo tareas de inspección visual o accesibilidad en dispositivos ARM.
- Integración en pipelines con API compatible con OpenAI: el endpoint `/v1/chat/completions` sobre SGLang facilita sustituir backends existentes en aplicaciones que ya usan el formato OpenAI.
- Evaluación comparativa de stacks de hardware: la variante FlagOS-Ascend está pensada para validar consistencia de rendimiento frente al stack nativo NVIDIA, útil en procesos de homologación de infraestructura.

## Benchmarks y rendimiento

| Métrica | MiniCPM-V-4.7-35B-A3B-Nvidia-Origin | MiniCPM-V-4.7-35B-A3B-Ascend-FlagOS |
|---|---|---|
| Math_500 | 94,80 | 95,20 |
| GPQA_Diamond | 81,31 | 80,81 |
| ERQA | 52,26 | 54,00 |

Según la model card, en evaluaciones oficiales en modo Instruct el modelo 35B-A3B y el 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se detallan en la información disponible las puntuaciones concretas de esa comparación ni otros benchmarks estándar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; en BF16 los 35B parámetros totales implican del orden de 70 GB de pesos, más overhead de activaciones y caché KV.
- GPU/NPU recomendadas: Huawei Ascend (la configuración de referencia usa tensor-parallel-size 2 sobre NPU con 16 dispositivos `/dev/davinci` visibles), NVIDIA (variante Origin) y otras 10 plataformas cubiertas por FlagOS.
- Cabe en GPU de consumo: no confirmado para la variante de 35B en BF16; el modelo se posiciona para centro de datos y dispositivos de borde con aceleradores dedicados.
- Opciones de despliegue: SGLang 0.5.11 con plugin FlagOS sobre NPU (configuración documentada), contenedor Docker FlagOS-Ascend; vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: más de 13 tokens/s en iPhone 17 Pro Max con el esquema de optimización on-device; en Ascend, la configuración documentada usa `--max-running-requests 64`, `--chunked-prefill-size 8192` y `--mem-fraction-static 0.68`, sin cifras de throughput publicadas.
- Entorno de referencia: openEuler 22.03 (LTS-SP4), Docker 20.10.8, CANN 8.5, Python 3.11.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B | 35B | ~3B | 262.144 | Apache 2.0 | MoE multimodal on-device; supera a Qwen3.6-35B-A3B en evaluación oficial Instruct según la model card |
| Qwen3.6-35B-A3B | 35B | ~3B (MoE) | no disponible | no disponible | Referencia de comparación citada por el autor; puntuación global inferior según la model card |
| MiniCPM-V-4.7-1B | 1B | 1B (denso) | no disponible | Apache 2.0 | Variante pequeña del mismo lanzamiento; supera a Qwen3.5-0.8B según la model card |
| Qwen3.5-0.8B | 0,8B | 0,8B (denso) | no disponible | no disponible | Referencia de comparación para la variante 1B |

No se dispone de datos detallados de contexto, licencia o benchmarks completos de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La ficha corresponde a una adaptación de hardware concreta (Ascend/FlagOS); el rendimiento puede diferir de la variante NVIDIA original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria de esta variante específica.
- La configuración de despliegue documentada es compleja (16 dispositivos NPU, múltiples variables de entorno de FlagOS) y requiere infraestructura Ascend específica.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes del stack FlagOS y del contenedor Docker asociado.
- No se documentan en la información disponible capacidades de tool calling ni de agente, relevantes para despliegues en producción.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-ascend-FlagOS
- ModelScope (modelo): referencia en la model card, sin URL directa disponible
- Contenedor Docker FlagOS-Ascend: `harbor.baai.ac.cn/flagrelease-public/minicpmv47-35b-a3b-ascend001-gems5.3.0-treenone-cx0.13.0-pluginnone-vllmnone-sglang0.5.11-sglangfl0.1.0-cp311-ptnpu28-cann85-a64-25.5.0:202610120705`
- Paper, blog y repositorio de código: no disponibles en la información proporcionada.
