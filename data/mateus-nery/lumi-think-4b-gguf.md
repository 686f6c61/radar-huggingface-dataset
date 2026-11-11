# Mateus-Nery/lumi-think-4b-GGUF

## Resumen

Lumi-Think-4B es un ajuste fino (finetune) del modelo portugués CEIA Lumi-4B v0.2, desarrollado por el usuario Mateus-Nery y distribuido en formato GGUF para su uso con llama.cpp. El modelo base Lumi-4B deriva a su vez del NVIDIA Nemotron 3 Nano 4B, sobre el que se realizó un preentrenamiento continuado en portugués. El problema que aborda Lumi-Think es concreto: ese preentrenamiento continuado degradó la capacidad de razonamiento del modelo original, que se alargaba en exceso dentro del bloque `<think>` y en un 10,7% de las preguntas no llegaba a cerrarlo antes del límite de 6.144 tokens.

La solución aplicada consiste en un LoRA entrenado específicamente para restaurar el razonamiento y fusionado posteriormente en los pesos del modelo, preservando al mismo tiempo las mejoras en portugués aportadas por Lumi-4B v0.2. El resultado es un modelo de aproximadamente 3.973 millones de parámetros (4B) que razona de forma más concisa (949 tokens de media frente a 1.654 de la v0.2) y que reduce la tasa de razonamientos sin cerrar al 4,3%, prácticamente igualando al Nemotron 3 Nano 4B original (4,2%).

El modelo se publica exclusivamente en formato GGUF, con ocho cuantizaciones que van desde BF16 (7,96 GB) hasta IQ4_XS (2,41 GB), lo que lo hace desplegable en hardware de consumo. Está orientado a generación de texto conversacional y razonamiento en portugués e inglés, y su relevancia actual radica en que demuestra que un ajuste fino ligero y bien dirigido puede recuperar capacidades de razonamiento perdidas durante la adaptación lingüística, sin renunciar a esta última.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NVIDIA Nemotron 3 Nano 4B; detalles de atención no disponibles) |
| Parámetros totales | 3.973.556.832 (≈4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de ejecución con `-c 32768`; no se confirma un máximo oficial) |
| Tipos de cuantización | BF16, Q6_K_XL, Q6_K, Q4_K_XL, Q5_K_S, Q3_K_XL, IQ4_XS (formato GGUF) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | `other`, denominada `lumi-4b` (enlace a la licencia del modelo base ceia-br/lumi-4b) |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Nemotron 3 Nano 4B de NVIDIA, un transformer de aproximadamente 4B parámetros, sobre el que CEIA aplicó un preentrenamiento continuado en portugués para obtener Lumi-4B v0.2. Lumi-Think añade a esa base un LoRA entrenado para restaurar el comportamiento de razonamiento del modelo original, posteriormente fusionado en los pesos. No se especifican en la información disponible el número de tokens de entrenamiento del LoRA, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es el uso de un bloque de razonamiento explícito delimitado por etiquetas `<think>`, que puede activarse o desactivarse por llamada mediante `chat_template_kwargs: {"enable_thinking": false}`. El autor reporta métricas de calidad de cuantización medidas como divergencia KL (KLD) y coincidencia top-1 frente al BF16: Q6_K_XL alcanza 98,9% de coincidencia top-1 con KLD 0,0004, mientras que IQ4_XS baja a 94,9% con KLD 0,0123. En 115.000 tokens de razonamientos de validación fuera del conjunto de entrenamiento, la divergencia es aún menor (Q6_K 0,0003; Q4_K_XL 0,0024; IQ4_XS 0,0078).

## Capacidades

- Generación de texto conversacional en portugués e inglés, con respuesta final en el idioma de la consulta.
- Razonamiento explícito en modo "thinking", activable o desactivable por llamada.
- Razonamiento más conciso que el modelo base: 949 tokens de media frente a 1.654 de Lumi-4B v0.2.
- Mayor tasa de cierre del bloque de razonamiento: solo el 4,3% de las respuestas no cierra `<think>` en 6.144 tokens (frente al 10,7% de la v0.2).
- Comprensión lectora y conocimiento en portugués (MMLU PT, INCLUDE PT, Global MMLU PT, MMMLU PT).
- Seguimiento de instrucciones en portugués e inglés (IFEval PT y IFEval EN).
- Razonamiento de múltiple elección en inglés (MMLU-Pro, MMLU-Redux 2).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia conversacional en portugués: el modelo mantiene conversaciones multi-turno con una ventana de hasta 32.768 tokens, adecuada para sesiones largas de atención al cliente o tutoría, con respuesta final en portugués aunque el razonamiento interno se realice mayoritariamente en inglés.
- Razonamiento con traza auditable: al exponer el bloque `<think>`, permite registrar y revisar el proceso de razonamiento en aplicaciones donde la explicabilidad es requisito, como evaluación educativa o moderación asistida.
- Despliegue en hardware de consumo: las cuantizaciones IQ4_XS (2,41 GB) y Q4_K_XL (3,13 GB) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, lo que facilita prototipado local sin infraestructura dedicada.
- Procesamiento de documentación en portugués: tareas de resumen, extracción y respuesta sobre documentos largos gracias a la ventana de contexto y al buen rendimiento en INCLUDE PT (69,7 en modo razonamiento).
- Evaluación comparativa de modelos pequeños: sirve como referencia para estudiar el impacto de la adaptación lingüística sobre el razonamiento, ya que el autor publica métricas detalladas frente a la v0.2, el Nemotron 3 Nano 4B y el T6-Lumi-4B.
- Generación de respuestas con control de latencia: al poder desactivar el razonamiento por llamada, permite alternar entre modo rápido (temperatura 0, sin `<think>`) y modo pausado (temperatura 1,0, top_p 0,95) según la exigencia de la consulta.
- Integración en pipelines con llama.cpp: el servidor `llama-server` con `--jinja` y `-ngl 99` permite exponer el modelo como endpoint compatible con la API de chat, útil para pruebas de integración en aplicaciones locales.

## Benchmarks y rendimiento

Resultados en BF16 sobre 7.627 preguntas (1.000 por test de múltiple elección salvo INCLUDE PT con 551; IFEval PT 535 e IFEval EN 541), con hasta 6.144 tokens por respuesta y respuesta truncada contada como error.

Con razonamiento (temperatura 1,0, top_p 0,95):

| Test | Lumi-4B v0.2 | Nemotron 3 Nano 4B | Lumi-Think-4B | T6-Lumi-4B |
|---|---:|---:|---:|---:|
| MMLU PT medio | 55,6 | **66,6** | 64,7 | 55,6 |
| MMLU PT graduación | 47,2 | 48,4 | **52,3** | 48,2 |
| Global MMLU PT | 70,5 | 71,0 | **72,2** | 70,3 |
| MMMLU PT | **74,1** | 71,7 | 71,8 | 69,6 |
| INCLUDE PT | 62,3 | 65,7 | **69,7** | 67,0 |
| IFEval PT | 34,8 | 45,2 | **48,0** | 36,8 |
| MMLU-Pro | 59,6 | 60,2 | **62,3** | 62,0 |
| MMLU-Redux 2 | 80,2 | **82,3** | 80,3 | 81,4 |
| IFEval EN | 69,7 | **88,5** | 85,8 | 76,7 |
| **Total (7.627)** | 62,6 | 66,7 | **67,4** | 63,6 |

Sin razonamiento (temperatura 0):

| Test | Lumi-4B v0.2 | Nemotron 3 Nano 4B | Lumi-Think-4B | T6-Lumi-4B |
|---|---:|---:|---:|---:|
| MMLU PT medio | 44,7 | 40,2 | 42,6 | **50,3** |
| MMLU PT graduación | **48,4** | 43,4 | **48,4** | 47,9 |
| Global MMLU PT | 61,2 | 56,7 | 59,1 | **62,9** |
| MMMLU PT | 58,4 | 57,1 | 59,7 | **62,7** |
| INCLUDE PT | 55,5 | 56,6 | 57,5 | **58,1** |
| IFEval PT | 33,1 | 38,7 | **39,4** | 28,4 |
| MMLU-Pro | 43,9 | 36,8 | 51,6 | **53,8** |
| MMLU-Redux 2 | 69,8 | 69,0 | **71,8** | 70,7 |
| IFEval EN | 68,0 | **80,8** | 73,0 | 66,7 |
| **Total (7.627)** | 53,9 | 52,3 | 55,8 | **56,6** |

Métricas de razonamiento:

| Métrica | Lumi-4B v0.2 | Nemotron 3 Nano 4B | Lumi-Think-4B | T6-Lumi-4B |
|---|---:|---:|---:|---:|
| Tokens de razonamiento, media | 1.654 | 1.102 | 949 | 1.617 |
| Solo los que cierran | 1.115 | 883 | 717 | 1.222 |
| No cierra `<think>` en 6.144 tokens | 10,7% | 4,2% | 4,3% | 8,0% |

Significación estadística reportada por el autor: con razonamiento, Lumi-Think supera a la v0.2 en +4,8 puntos (IC 95%: +3,7 a +5,8) y empata con Nemotron 3 Nano 4B (+0,7; −0,2 a +1,7); sin razonamiento, +1,8 sobre la v0.2 (+1,1 a +2,6) y +3,5 sobre Nemotron (+2,5 a +4,5).

## Requisitos de hardware

- VRAM estimada según cuantización: BF16 ≈ 8 GB; Q6_K_XL 4,56 GB; Q6_K 3,93 GB; Q4_K_XL 3,13 GB; Q5_K_S 3,04 GB; Q3_K_XL 2,68 GB; IQ4_XS 2,41 GB (más overhead de contexto KV).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) ejecuta cualquier cuantización con contexto amplio, y una GPU de 8 GB cubre las cuantizaciones Q4/IQ4 con contexto moderado.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_XL, Q5_K_S, Q3_K_XL e IQ4_XS en GPUs de 4-8 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 32768 --jinja`); el repositorio está etiquetado como `endpoints_compatible`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. El autor reporta únicamente longitud media de razonamiento (949 tokens), no velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Total benchmark (con razonamiento) | Total (sin razonamiento) | Licencia |
|---|---|---|---:|---:|---|
| Lumi-Think-4B | ≈3,97B | 32.768 (según ejemplo) | 67,4 | 55,8 | `other` (lumi-4b) |
| Lumi-4B v0.2 (base) | ≈4B | no disponible | 62,6 | 53,9 | `other` (lumi-4b) |
| Nemotron 3 Nano 4B | ≈4B | no disponible | 66,7 | 52,3 | no disponible en la información |
| T6-Lumi-4B | ≈4B | no disponible | 63,6 | 56,6 | no disponible en la información |

Lumi-Think-4B lidera el total con razonamiento (67,4) y queda segundo sin razonamiento (55,8), por detrás de T6-Lumi-4B (56,6). Frente a Nemotron 3 Nano 4B, gana en el agregado con razonamiento pero pierde en MMLU PT medio e IFEval EN. Frente a T6-Lumi-4B, gana con razonamiento (+3,8) y empata sin él (−0,8).

## Limitaciones y advertencias

- El razonamiento se genera casi por completo en inglés: el 89% de los bloques `<think>` están en inglés en preguntas en portugués, aunque la respuesta final sea en portugués. Esto puede ser problemático si se requiere trazabilidad en portugués.
- El 4,3% de las respuestas no cierra el bloque `<think>` dentro de 6.144 tokens, lo que en producción exige manejar respuestas truncadas como error o configurar límites de tokens adecuados.
- Riesgo de alucinación inherente a modelos de 4B; no se reportan evaluaciones de factualidad ni de calibración.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia `other` denominada `lumi-4b`, heredada del modelo base; es necesario revisar los términos en el enlace a ceia-br/lumi-4b antes de uso comercial, ya que no se especifican restricciones en la model card.
- Solo se distribuyen pesos GGUF; no hay safetensors en este repositorio, lo que limita el reentrenamiento o el ajuste fino adicional desde estos artefactos.
- El modelo está orientado a portugués e inglés; no se garantiza comportamiento en otros idiomas.
- El autor advierte que el T6-Lumi-4B se validó con decodificación greedy y hasta 4.096 tokens, por lo que las comparativas deben interpretarse con esa cautela metodológica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mateus-Nery/lumi-think-4b-GGUF
- Modelo base (CEIA Lumi-4B v0.2): https://huggingface.co/ceia-br/lumi-4b
- Modelo de origen (NVIDIA Nemotron 3 Nano 4B BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Cuantizaciones del Lumi-4B: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF
- Fine-tune alternativo T6-Lumi-4B: https://huggingface.co/gustavobarrosss/t6-lumi-4b
- Licencia lumi-4b: https://huggingface.co/ceia-br/lumi-4b
