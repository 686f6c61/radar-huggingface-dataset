# 0xSojalSec/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF de un modelo derivado de la familia Qwen al que el autor denomina Qwen3.8-27B-EfficientThink, publicado por el usuario 0xSojalSec. El nombre completo del release acumula varios sufijos que describen su pipeline de construcción: SFT seguido de SimPO, un modo de razonamiento "eficiente" (EfficientThink), soporte de decodificación especulativa DFlash2 y multi-token prediction (MTP), además de la etiqueta "Uncensored" que indica la eliminación o atenuación de las capas de alineamiento de seguridad. El repositorio principal en BF16/FP8 se aloja en una cuenta distinta (nerkyor) y este release es su versión cuantizada para llama.cpp.

El problema que resuelve es el de servir un modelo de razonamiento en hardware limitado mediante seis niveles de cuantización (Q2 a Q8) con nombres propietarios (LynnStyle) y una tabla de puntuaciones por nivel. La model card incluye además instrucciones concretas de despliegue con llama-server, incluida la configuración de contexto publicada de 8 slots × 32.768 tokens = 262.144 tokens totales, y referencias al soporte de DFlash2 en llama.cpp (pull request 27816, commit `b10f9ca58c89`).

La relevancia del release es dudosa desde el punto de vista de la validación comunitaria: el repositorio registra 0 descargas y 1 "like", fue creado y actualizado el mismo día, y la información sobre arquitectura, datos de entrenamiento y procedencia es incompleta o contradictoria. Existe una discrepancia notable entre el nombre del modelo (27B) y el recuento de parámetros en safetensors del propio repositorio (1.924.404.480 parámetros, es decir, aproximadamente 1,9B), que el autor no aclara en la documentación aportada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica familia Qwen; la model card no describe la arquitectura) |
| Parámetros totales | 1.924.404.480 según safetensors del repositorio; el nombre del modelo indica 27B (discrepancia no aclarada) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens en la configuración publicada (8 slots × 32.768 tokens); reducible a 32.768 con un solo slot |
| Tipos de cuantización | Q8_0, Q6_K, Q5-LynnStyle, Q4-LynnStyle, Q3-LynnStyle, Q2-LynnStyle; borrador (draft) separado en Q8_0 o Q4_K_M |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 132,3 GB (conjunto de todos los niveles publicados) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre del release indica que se partió de un modelo base de la familia Qwen y que sobre él se aplicaron dos fases de ajuste: SFT (supervised fine-tuning) y SimPO (Simple Preference Optimization, una variante de optimización por preferencias sin modelo de recompensa). También se etiqueta como "EfficientThink", lo que sugiere un esquema de razonamiento con presupuesto de tokens reducido, y se menciona MTP (multi-token prediction) como capacidad del modelo base, distinta de la ruta de decodificación especulativa DFlash2.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni el origen de los datos de preferencia. Tampoco se documenta si hubo destilación desde otros modelos: el nombre incluye referencias a "K3", "Opus5", "Grok4.6" y "GPT5.6", que apuntan a una posible procedencia por destilación o mezcla de modelos, pero esta afirmación no está verificada en ninguna parte de la documentación y no se aportan trazas, recetas de mezcla ni evaluaciones que la respalden. La innovación técnica que sí se documenta con cierto detalle es la integración con DFlash2 para decodificación especulativa dentro de llama.cpp, con parámetros `--spec-type draft-dflash`, `--spec-draft-n-max 7` y `--spec-draft-n-min 0`.

## Capacidades

- Generación de texto conversacional en inglés y chino (la model card etiqueta el pipeline como "conversational").
- Razonamiento de tipo "thinking": el modo de pensamiento se conserva si se usa `--jinja` con argumentos explícitos de plantilla XH en llama.cpp.
- Razonamiento científico y de conocimiento general, evaluado por el autor con GPQA (198 preguntas) y MMLU (500 preguntas).
- Generación de código, evaluada por el autor con LiveCodeBench (100 problemas).
- Decodificación especulativa mediante un modelo borrador DFlash2 separado (Q8_0 o Q4_K_M), con hasta 7 tokens especulados por paso.
- Servicio multi-cliente concurrente: la configuración medida contempla C4 (cuatro peticiones activas) y C8 (ocho peticiones activas) sobre un servidor de ocho slots.
- No hay evidencia en la documentación de soporte de tool calling, function calling, uso de agentes, visión, audio u otras modalidades.
- El autor afirma que no se observaron bucles estrictos de repetición en las evaluaciones Q2–Q8 revisadas.

## Casos de uso

- Servicio conversacional multiusuario en chino o inglés: con ocho slots de 32.768 tokens cada uno, un único servidor llama.cpp puede atender a ocho clientes concurrentes con contexto largo individual, sin compartir la ventana entre ellos.
- Despliegue en hardware de gama alta con memoria limitada: la disponibilidad de niveles Q2 y Q3 permite ejecutar un modelo de clase 27B (según el nombre) en GPUs de consumo, a costa de una pérdida de precisión que el autor cuantifica en las tablas de GPQA/MMLU/LCB.
- Razonamiento científico asistido: el modelo obtiene entre 82,83% y 86,87% en GPQA según el nivel de cuantización, por lo que puede emplearse en tareas de pregunta-respuesta técnica en inglés donde se requiera una ventana de contexto amplia para adjuntar documentación.
- Generación de código con contexto de repositorio: sus 262.144 tokens de contexto permiten incluir varios ficheros fuente completos en una sola petición; las puntuaciones de LiveCodeBench declaradas (74–78 sobre 100) sirven como referencia del nivel esperado.
- Inferencia de bajo coste por token mediante decodificación especulativa: el uso de un borrador DFlash2 Q8_0 o Q4_K_M con hasta 7 tokens especulados está pensado para reducir la latencia en GPUs donde el modelo principal va justo de memoria.
- Integración en un cliente de escritorio o agente local: el release se distribuye junto a Lynn Agent v0.87.0, que empaqueta los niveles Q2/Q3 con DFlash2 para macOS (Apple Silicon e Intel) y Windows, lo que permite un asistente local sin depender de API externa.
- Evaluación comparativa de cuantizaciones: el repositorio publica resultados por nivel, de modo que un equipo puede medir la degradación de calidad entre Q8_0 y Q2 antes de decidir qué artefacto desplegar.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el propio autor, medidos por nivel de cuantización. No se aportan comparaciones contra modelos de referencia.

| Nivel | GPQA (198) | MMLU (500) | LiveCodeBench (100) |
|---|---:|---:|---:|
| Q8_0 | 164/198 (82,83%) | 447/500 (89,40%) | 74/100 (74,00%) |
| Q6_K | 171/198 (86,36%) | 440/500 (88,00%) | 78/100 (78,00%) |
| Q5-LynnStyle | 164/198 (82,83%) | 438/500 (87,60%) | 75/100 (75,00%) |
| Q4-LynnStyle | 166/198 (83,84%) | 443/500 (88,60%) | 74/100 (74,00%) |
| Q3-LynnStyle | 172/198 (86,87%) | 435/500 (87,00%) | 78/100 (78,00%) |
| Q2-LynnStyle | 167/198 (84,34%) | 416/500 (83,20%) | 75/100 (75,00%) |

No se publican datos de throughput, latencia ni comparación con modelos de terceros. El autor indica que el conjunto completo de evaluaciones se congeló formalmente y que se conservaron en el denominador todas las muestras no superadas, pero no se detalla la metodología de prompt, el número de intentos ni la configuración de decodificación, por lo que las cifras no son reproducibles a partir de la información disponible.

## Requisitos de hardware

- Los tamaños por nivel no están publicados; el repositorio completo suma 132,3 GB. La propia model card advierte de que el tamaño de los pesos no equivale al requisito total de memoria en tiempo de ejecución.
- Estimación orientativa para un modelo de clase 27B (no publicada por el autor, solo como referencia de planificación): Q8_0 en torno a 28–30 GB, Q6_K en torno a 22 GB, Q5 en torno a 18–19 GB, Q4 en torno a 15–17 GB, Q3 en torno a 12–14 GB y Q2 en torno a 9–11 GB, a lo que hay que sumar la caché KV y el modelo borrador.
- La caché KV es el factor dominante: la configuración medida de 262.144 tokens totales exige mucha memoria adicional. Para reducirla, el autor recomienda `--parallel 1 --ctx-size 32768`.
- Si se usa decodificación especulativa DFlash2 hay que cargar además un borrador Q8_0 o Q4_K_M.
- GPU recomendadas por el autor: ninguna explícita más allá de la validación de runtime realizada en DGX Spark. Por tamaño, los niveles bajos caben en RTX 4090 (24 GB) y los altos requieren A100 40/80 GB, H100 o varias GPU.
- Opciones de despliegue documentadas: llama.cpp con soporte DFlash2 (PR 27816, commit `b10f9ca58c89` o posterior), compilado con `-DGGML_CUDA=ON` y usando `llama-server`. No se documenta soporte verificado en vLLM, TGI, Ollama ni otros runners.
- Latencia y throughput: no disponible. El autor menciona explícitamente que las cifras publicadas de C4/C8 corresponden a la configuración de ocho slots y no se heredan si se reduce el contexto o el número de slots.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La tabla que publica el autor compara únicamente sus propios niveles de cuantización entre sí, no contra modelos de terceros. Como referencia de categoría, este release compite con otras cuantizaciones GGUF de modelos de la familia Qwen en el rango de 27B–32B (por ejemplo, derivados de Qwen3-32B o Qwen2.5-32B) y con ajustes comunitarios orientados a razonamiento, pero no se aportan parámetros, contexto, licencia ni puntuaciones de esos alternativas que puedan verificarse aquí.

| Criterio | Este modelo | Alternativas de la misma categoría |
|---|---|---|
| Parámetros | 1,9B según safetensors; 27B según el nombre (contradictorio) | no disponible |
| Contexto | 262.144 tokens en la configuración medida | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Benchmarks comparativos | no publicados | no disponible |
| Disponibilidad | GGUF en HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- La etiqueta "Uncensored" indica que el alineamiento de seguridad ha sido reducido o eliminado. No se documenta el alcance de esa eliminación, por lo que el modelo puede producir contenido dañino, ilegal o sesgado sin las salvaguardas habituales.
- Riesgo de alucinación propio de un modelo de lenguaje: no se publican evaluaciones de fidelidad factual ni tasas de hallucination.
- Idiomas soportados únicamente inglés y chino. No hay evidencia de calidad en castellano ni en otras lenguas.
- Contradicción de tamaño no resuelta: 1.924.404.480 parámetros en safetensors frente a "27B" en el nombre del modelo. Esto dificulta cualquier planificación de memoria y sugiere que el repositorio puede contener artefactos distintos de los anunciados.
- Procedencia opaca: el nombre cita modelos de terceros (K3, Opus5, Grok4.6, GPT5.6) sin documentar destilación, mezcla ni permisos. Esto tiene implicaciones legales y de licencia que la licencia Apache 2.0 del repositorio no resuelve por sí sola.
- Métricas autodeclaradas: los resultados de GPQA, MMLU y LCB no son reproducibles con la información aportada. La anomalía de que Q3 supere a Q8_0 en GPQA y LCB sugiere ruido estadístico o un protocolo de evaluación no controlado.
- Muestras pequeñas: 198 preguntas de GPQA y 100 problemas de LCB implican intervalos de confianza amplios (del orden de ±5 puntos porcentuales), por lo que las diferencias entre niveles pueden no ser significativas.
- Sin validación comunitaria: 0 descargas, 1 "like" y creación/actualización en la misma fecha. No hay informes independientes de uso en producción.
- La model card mezcla información del modelo con notas de versión de un cliente de escritorio (Lynn Agent v0.87.0) y enlaces de descarga de instaladores, lo que dificulta separar lo que afecta al modelo de lo que afecta al cliente.
- Licencia Apache 2.0 declarada en el repositorio: permite uso comercial según los términos estándar, pero la licencia no cubre posibles reclamaciones derivadas del origen de los pesos o de los datos de entrenamiento, que no se documentan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- Repositorio principal BF16/FP8 declarado por el autor: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Pull request de soporte DFlash2 en llama.cpp (merge indicado el 27/08/2026): https://github.com/ggml-org/llama.cpp/pull/27816
- Repositorio del cliente Lynn Agent v0.87.0: https://github.com/MerkyorLynn/Lynn/releases/tag/v0.87.0
- Repositorio legacy del cliente Lynn: https://github.com/LynnMerkyor/Lynn/releases/tag/v0.87.0
- Espejo en Gitee: https://gitee.com/merkyor/Lynn/releases/tag/v0.87.0
- Paquete CLI: https://download.merkyorlynn.com/downloads/cli/lynn-cli-0.87.0.tgz
- Descargas de instaladores: https://download.merkyorlynn.com/downloads/

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo ni con inteligencia artificial (corresponden a dominios del sitio reallifecam.com). No se han encontrado papers, blogs técnicos ni evaluaciones independientes de este release.
