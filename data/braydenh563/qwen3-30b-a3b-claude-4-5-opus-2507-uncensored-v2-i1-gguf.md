# braydenh563/Qwen3-30B-A3B-Claude-4.5-Opus-2507-UNCENSORED-V2-i1-GGUF

## Resumen

El modelo `braydenh563/Qwen3-30B-A3B-Claude-4.5-Opus-2507-UNCENSORED-V2-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del fine-tune `DavidAU/Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2`, realizado por el usuario `mradermacher`. Se trata de un modelo de mezcla de expertos (MoE) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, derivado del modelo base `unsloth/qwen3-30b-a3b-thinking-2507` de Qwen. El fine-tune ha sido entrenado por destilación sobre el dataset `TeichAI/claude-4.5-opus-high-reasoning-250x`, que contiene respuestas de razonamiento de alta calidad generadas por Claude 4.5 Opus, y posteriormente sometido a un proceso de *abliteration* para eliminar los rechazos y restricciones de seguridad del modelo original.

El resultado es un modelo orientado al razonamiento profundo y a la generación de texto sin censura, con una ventana de contexto de 256.000 tokens y soporte para 128 expertos. La versión GGUF aquí descrita incluye múltiples niveles de cuantización (desde `i1-IQ1_S` de 6,5 GB hasta `i1-Q3_K_M` de 14,8 GB y superiores), lo que permite su ejecución en hardware de consumo. Su relevancia radica en combinar la capacidad de razonamiento de un modelo propietario de alto nivel (Claude 4.5 Opus) con la eficiencia de un MoE abierto, y en ofrecer una variante sin restricciones de contenido, algo demandado en entornos de investigación y desarrollo creativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 128 expertos, transformer con atención estándar |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | ~3 B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M (y posiblemente otros no listados en la tabla) |
| Idiomas soportados | Inglés (según metadatos; el modelo base Qwen3 soporta más idiomas, pero el fine-tune se declara solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix separado) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/qwen3-30b-a3b-thinking-2507`, una variante de Qwen3 con arquitectura MoE que activa solo 3.000 millones de parámetros por token entre 128 expertos, lo que reduce drásticamente el coste computacional en inferencia. Sobre esta base, `DavidAU` aplicó un fine-tune por destilación utilizando el dataset `TeichAI/claude-4.5-opus-high-reasoning-250x`, compuesto por 250.000 ejemplos de razonamiento de alta calidad generados por Claude 4.5 Opus en modo *high reasoning*. Este proceso busca transferir las capacidades de razonamiento paso a paso del modelo propietario al modelo abierto.

Posteriormente se aplicó la técnica de *abliteration*, que elimina las direcciones de activación asociadas a comportamientos de rechazo o negativa, resultando en una versión "sin censura" que no filtra contenido por políticas de seguridad. El modelo resultante conserva la ventana de contexto de 256.000 tokens y el modo *thinking* (razonamiento explícito antes de responder). La cuantización GGUF con imatrix fue realizada por `mradermacher`, quien generó múltiples niveles de compresión para adaptarse a distintos presupuestos de memoria.

## Capacidades

- Razonamiento complejo y multi-paso, heredado de la destilación de Claude 4.5 Opus, con generación de cadenas de pensamiento explícitas (modo *thinking*).
- Generación de texto libre y conversacional en inglés, con alta coherencia en tareas de análisis, explicación y redacción.
- Generación de código y asistencia en programación, gracias a las capacidades del modelo base Qwen3.
- Resolución de problemas matemáticos y lógicos, reforzada por el entrenamiento en razonamiento de alta calidad.
- Soporte de contexto largo (256.000 tokens), permitiendo procesar documentos extensos o conversaciones de muchas vueltas.
- Capacidad multilingüe limitada: el modelo base Qwen3 soporta múltiples idiomas, pero el fine-tune se declara únicamente en inglés; el rendimiento en otros idiomas puede degradarse.
- No se confirma soporte explícito de *tool calling* o *function calling* en la información disponible, aunque el modelo base Qwen3 lo incorpora; se recomienda verificar experimentalmente.
- Ausencia de filtros de contenido (versión *uncensored*), lo que permite generar respuestas que otros modelos rechazarían.

## Casos de uso

- **Investigación en razonamiento y alineación**: el modelo permite estudiar cómo se comporta un sistema sin restricciones de seguridad, comparando sus respuestas con versiones censuradas para analizar el impacto de la *abliteration* en la calidad del razonamiento.
- **Generación de contenido creativo sin restricciones**: escritores y creadores pueden usarlo para redactar ficción, guiones o diálogos que aborden temas sensibles o controvertidos sin bloqueos automáticos.
- **Asistente de programación local**: gracias a su tamaño activo reducido (3B) y a las cuantizaciones ligeras, puede ejecutarse en una GPU de consumo para sugerir código, explicar algoritmos o depurar fragmentos, con razonamiento paso a paso.
- **Análisis de documentos extensos**: con 256.000 tokens de contexto, es adecuado para resumir informes largos, extraer información de manuales técnicos o procesar expedientes completos en una sola pasada.
- **Simulación de diálogos y role-playing**: su naturaleza sin censura y su capacidad de mantener conversaciones coherentes de muchas vueltas lo hacen útil para entornos de simulación de personajes o chatbots especializados.
- **Educación y tutoría personalizada**: puede explicar conceptos complejos con razonamiento detallado, adaptando el nivel de profundidad, aunque se debe supervisar por la posible generación de contenido inapropiado.
- **Prototipado de agentes de razonamiento**: al combinar contexto largo y razonamiento explícito, sirve como base para experimentos de agentes que necesitan planificar y ejecutar tareas de múltiples pasos, siempre que se verifique su soporte de *tool calling*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización no proporciona métricas de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar el repositorio del modelo base `DavidAU/...` o el de `unsloth/qwen3-30b-a3b-thinking-2507` para obtener datos comparativos, aunque la versión *abliterated* puede presentar variaciones en el rendimiento respecto al original.

## Requisitos de hardware

- **VRAM estimada por cuantización** (según tamaños de archivo listados):
  - `i1-IQ1_S`: ~6,5 GB (apto para GPUs de 8 GB)
  - `i1-IQ1_M`: ~7,2 GB (apto para GPUs de 8 GB)
  - `i1-IQ2_XXS`: ~8,3 GB (apto para GPUs de 8-10 GB)
  - `i1-IQ2_XS`: ~9,2 GB (apto para GPUs de 10-12 GB)
  - `i1-IQ2_S`: ~9,4 GB (apto para GPUs de 10-12 GB)
  - `i1-IQ2_M`: ~10,3 GB (apto para GPUs de 12 GB)
  - `i1-Q2_K_S`: ~10,6 GB (apto para GPUs de 12 GB)
  - `i1-Q2_K`: ~11,4 GB (apto para GPUs de 12-16 GB)
  - `i1-IQ3_XXS`: ~11,9 GB (apto para GPUs de 12-16 GB)
  - `i1-IQ3_XS`: ~12,7 GB (apto para GPUs de 16 GB)
  - `i1-Q3_K_S`: ~13,4 GB (apto para GPUs de 16 GB)
  - `i1-IQ3_S`: ~13,4 GB (apto para GPUs de 16 GB)
  - `i1-IQ3_M`: ~13,6 GB (apto para GPUs de 16 GB)
  - `i1-Q3_K_M`: ~14,8 GB (apto para GPUs de 16-24 GB)
- **GPU recomendadas**: RTX 3060 12 GB para cuantizaciones ligeras; RTX 4090 24 GB para las de mayor calidad; A100 o H100 para despliegue profesional con contexto completo.
- **Despliegue en consumer GPU**: sí, las cuantizaciones `i1-IQ2_XXS` y superiores caben en GPUs de 8-12 GB, aunque con pérdida de calidad.
- **Opciones de despliegue**: llama.cpp (formato GGUF nativo), Ollama, LM Studio, o servidores compatibles con GGUF como llama-server. No se recomienda vLLM ni TGI para GGUF; para esos entornos sería necesario convertir a safetensors.
- **Latencia y throughput**: no disponibles. Dado que es un MoE con solo 3B activos, la velocidad de generación será significativamente mayor que un modelo denso de 30B, pero depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2` (base sin cuantizar) | 30,5 B | ~3 B | 256k | Apache 2.0 | safetensors | Versión original, no cuantizada |
| `Qwen3-30B-A3B` (modelo base original) | 30,5 B | ~3 B | 256k | Apache 2.0 | safetensors | Sin destilación ni *abliteration* |
| `Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-V2` (versión sin *abliteration*) | 30,5 B | ~3 B | 256k | Apache 2.0 | safetensors | Misma destilación pero con filtros de seguridad |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros MoE similares (por ejemplo, DeepSeek-V3) en la información proporcionada. La principal diferencia entre las versiones es la presencia o ausencia de *abliteration* y el formato de pesos.

## Limitaciones y advertencias

- **Solo inglés declarado**: aunque el modelo base Qwen3 es multilingüe, el fine-tune se entrenó exclusivamente con datos en inglés; el rendimiento en otros idiomas puede ser deficiente o errático.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo donde la confianza no se correlaciona con la precisión.
- **Sesgos y contenido nocivo**: la *abliteration* elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido ofensivo, peligroso o ilegal sin filtro. Esto supone un riesgo legal y ético en entornos de producción.
- **Degradación por cuantización**: las cuantizaciones ligeras (IQ1, IQ2) pueden afectar significativamente la calidad del razonamiento y la coherencia. Se recomienda usar `i1-IQ3_S` o superiores para tareas críticas.
- **Sin garantías de tool calling**: aunque el base Qwen3 soporta *function calling*, no se confirma que el fine-tune lo conserve; es necesario verificar experimentalmente antes de integrarlo en agentes.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo puede estar sujeto a restricciones adicionales por los datos de entrenamiento (destilación de Claude 4.5 Opus), cuyo origen propietario podría plantear problemas legales.
- **Contexto de 256k**: aunque la ventana es amplia, el uso de cuantizaciones bajas puede provocar pérdida de atención en contextos muy largos; se recomienda probar con documentos extensos.

## Enlaces

- [Modelo GGUF en HuggingFace (braydenh563)](https://huggingface.co/braydenh563/Qwen3-30B-A3B-Claude-4.5-Opus-2507-UNCENSORED-V2-i1-GGUF)
- [Modelo base sin cuantizar (DavidAU)](https://huggingface.co/DavidAU/Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2)
- [Cuantizaciones estáticas (mradermacher)](https://huggingface.co/mradermacher/Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2-GGUF)
- [Dataset de entrenamiento (TeichAI/claude-4.5-opus-high-reasoning-250x)](https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x)
- [Modelo base original de Qwen (unsloth/qwen3-30b-a3b-thinking-2507)](https://huggingface.co/unsloth/qwen3-30b-a3b-thinking-2507)
- [Página de descarga del cuantizador (hf.tst.eu)](https://hf.tst.eu/model#Qwen3-30B-A3B-Claude-4.5-Opus-High-Reasoning-2507-ABLITERATED-UNCENSORED-V2-i1-GGUF)
