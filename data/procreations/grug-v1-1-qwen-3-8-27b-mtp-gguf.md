# ProCreations/grug-v1.1-qwen-3.8-27b-mtp-gguf

## Resumen

grug-v1.1-qwen-3.8-27b-mtp-gguf es una versión cuantizada en formato GGUF del modelo grug-v1.1-qwen-3.8-27b-mtp, desarrollado por ProCreations. Se trata de un fine-tune LoRA (rank 32) sobre Qwen3.6-27B, especializado en razonamiento denso y eficiente sin texto de relleno. La particularidad de esta versión es que conserva el MTP head (draft head) para decodificación especulativa, lo que permite acelerar la inferencia en motores compatibles como llama.cpp.

El modelo tiene 27.320.697.856 parámetros (27,3B) y está disponible en varias cuantizaciones (Q8_0, Q6_K, Q4_K_M). Incluye además un proyector de visión (mmproj) de 0,9 GB, lo que sugiere capacidades multimodales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en que ofrece un equilibrio entre rendimiento y eficiencia para tareas de razonamiento y agente, con la ventaja adicional de la decodificación especulativa integrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.6-27B) con MTP head para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (archivos GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-27B, sobre el cual se aplicó un fine-tune LoRA de rango 32 en todas las capas lineales de la pila de texto, fusionado en bfloat16. El entrenamiento utilizó una pérdida "think-only" sobre datos de trayectorias de agentes, lo que enseña al modelo a razonar de forma concisa y directa, evitando texto de relleno innecesario. El MTP head (multi-token prediction) fue retuneado sobre la distribución de salida de grug, logrando un acuerdo top-1 con el verificador del 95,37% frente al 90,04% del head nativo de Qwen3.8. Esto significa que el draft head acepta más tokens por paso, acelerando la decodificación especulativa. La versión GGUF conserva este head como tensores `blk.64.nextn.*`, mientras que las versiones estándar lo descartan para ahorrar espacio.

## Capacidades

- Generación de texto con razonamiento denso y eficiente, sin verbosidad innecesaria.
- Razonamiento multi-paso y soporte para tareas de agente (entrenado con datos de trayectorias de agentes).
- Decodificación especulativa integrada mediante MTP head, acelerando la inferencia en motores compatibles (llama.cpp, etc.).
- Capacidad de visión a través del proyector mmproj incluido (archivo `mmproj-grug-27b-v1.1-mtp-f16.gguf`), lo que permite procesar imágenes junto con texto.
- Soporte de tool calling y function calling (inferido de su entrenamiento orientado a agentes, aunque no se documenta explícitamente).
- Multilingüe limitado: solo inglés declarado en la model card.

## Casos de uso

- **Agentes autónomos**: el modelo está entrenado con datos de trayectorias de agentes, por lo que puede gestionar flujos de trabajo multi-paso, tomar decisiones y ejecutar acciones en entornos simulados o APIs.
- **Generación de código en producción**: con soporte de razonamiento y tool calling, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, aprovechando la decodificación especulativa para reducir latencia.
- **Asistente de razonamiento lógico**: útil para tareas de análisis, planificación o resolución de problemas complejos donde se requiere una respuesta concisa y fundamentada, sin explicaciones extensas.
- **Procesamiento de documentos con visión**: gracias al mmproj, puede analizar imágenes, diagramas o capturas de pantalla junto con texto, por ejemplo para extraer información de gráficos o formularios.
- **Chat conversacional técnico**: su capacidad de mantener contexto y razonar de forma eficiente lo hace adecuado para asistentes de soporte técnico o documentación interactiva.
- **Investigación en decodificación especulativa**: al incluir el MTP head retuneado, sirve como banco de pruebas para estudiar la aceptación de tokens y optimizar motores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el MTP head retuneado logra un acuerdo top-1 del 95,37% con el verificador (frente al 90,04% del head nativo), pero no se proporcionan métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se indican mediciones de velocidad (wall-clock) para la decodificación especulativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q4_K_M (16,8 GB): cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A5000).
  - Q6_K (22,4 GB): también cabe en GPUs de 24 GB, aunque con margen ajustado.
  - Q8_0 (29,0 GB): requiere GPUs de 32 GB o más (A100 40GB, H100, etc.).
  - Modelo completo en bf16: ~54,8 GB según LLM Explorer, requiere GPUs de 64 GB o múltiples GPUs.
- **GPU recomendadas**: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o Q6_K; A100 40GB o H100 para Q8_0 o el modelo completo.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), compatible con Ollama, vLLM (si soporta GGUF), y otros motores que acepten GGUF.
- **Latencia y throughput**: no disponibles. La decodificación especulativa con MTP head puede reducir la latencia por token, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grug-v1.1-qwen-3.8-27b-mtp-gguf | 27,3B | No disponible | Apache 2.0 | GGUF | Incluye MTP head para decodificación especulativa |
| grug-v1.1-qwen-3.8-27b-gguf (sin MTP) | 27,3B | No disponible | Apache 2.0 | GGUF | Más ligero (~0,3 GB menos), sin draft head |
| Qwen3.6-27B (modelo base) | 27,3B | No disponible | Apache 2.0 | Safetensors | Modelo original, sin fine-tune específico |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos de 27B con características equivalentes en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- **Sesgos**: al ser un fine-tune de Qwen, puede heredar sesgos del modelo base, aunque no se documentan específicamente.
- **Alucinación**: como todo LLM, puede generar información incorrecta o inventada, especialmente en tareas abiertas.
- **Contexto**: la longitud de contexto no está especificada; se recomienda verificar la del modelo base Qwen3.6-27B antes de usarlo en aplicaciones con ventanas largas.
- **Decodificación especulativa**: el MTP head solo acelera si el motor de inferencia lo utiliza; en caso contrario, se añade un overhead de ~0,3 GB sin beneficio.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.6-27B (también Apache 2.0 según la información).
- **Producción**: no se han publicado benchmarks de rendimiento ni pruebas de robustez; se recomienda validar exhaustivamente antes de desplegar en entornos críticos.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp-gguf)
- [Modelo base MTP (safetensors)](https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp)
- [Modelo grug-27b (versión sin MTP)](https://huggingface.co/ProCreations/grug-27b)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi)
- [Reseña en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/grug-27b-procreations)
- [Noticia en AI Briefs](https://aibriefs.news/card/49c7875b-4f1b-4cc0-89f4-3ed49c0741d1)
