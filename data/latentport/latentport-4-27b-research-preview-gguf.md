# latentport/latentport-4-27b-research-preview-GGUF

## Resumen

LatentPort-4-27B research preview es un artefacto de investigación publicado por Simon P. Villani bajo la organización `latentport`. No es un modelo de lenguaje autónomo, sino un puente de transferencia de estado latente entre dos modelos Qwen: Qwen3.5-4B como origen y Qwen3.8-27B como destino. El puente transporta estados ocultos de atención, capas recurrentes, convoluciones y el estado terminal, de modo que el modelo pequeño procesa el prompt completo (incluida la pregunta) y el modelo grande genera la respuesta sin haber procesado ningún token del prompt.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica poco habitual (state transfer entre modelos de distinto tamaño y familia) con evidencia de evaluación publicada. Por otro, sirve como advertencia práctica: el repositorio GGUF contiene artefactos en formato nativo que no son cargables por cargadores GGUF estándar ni constituyen un modelo independiente. El autor indica explícitamente que la versión canónica actual es otro repositorio (LPBridge-Qwen3.5-4b-Qwen3.8-27b) y que este preview se conserva únicamente con su evidencia original.

El artefacto está etiquetado como `research-preview`, `hybrid-composite` y `state-transfer`, con licencia Apache-2.0 sobre los pesos del puente. El tamaño del repositorio es de 24,7 GB y el recuento de parámetros en safetensors es de 644.583.547, un dato que no debe interpretarse como el tamaño de un modelo monolítico, sino como el conjunto de tensores del puente y artefactos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de transferencia de estado (hybrid-composite) sobre Qwen3.5-4B y Qwen3.8-27B; no es un transformer monolítico |
| Parametros totales | 644.583.547 (safetensors del repositorio, incluye artefactos del puente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de los modelos base; evaluado hasta ~16K en TTFT) |
| Tipos de cuantizacion | GGUF (artefactos en formato nativo), NF4/BF16 en la configuración de investigación evaluada |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (pesos del puente); los modelos base conservan sus licencias |
| Formato de pesos | GGUF (companion) y safetensors; artefactos nativos del runtime LatentPort |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo desde cero, sino que construye un puente entre dos checkpoints existentes. El modelo origen (Qwen3.5-4B) procesa el prompt completo, incluida la pregunta del usuario, y captura estados internos: estados de atención, estados de capas recurrentes, estados de convolución y el estado terminal de la secuencia. El puente `translate` proyecta esos estados al espacio del modelo destino (Qwen3.8-27B), que los instala como estado inicial y genera la respuesta sin prefill del prompt. Es, por tanto, una forma de decodificación especulativa a nivel de estado, no de tokens.

La evaluación publicada se realizó con un runtime fijado (RTX 5090, Python 3.11, CUDA 13.0, configuración NF4/BF16 con modelos y puente residentes en memoria). El autor no detalla en la información disponible el volumen de datos de entrenamiento del puente, la composición del dataset ni si hubo RLHF o DPO. Sí especifica que los resultados de calidad corresponden a la configuración NF4/BF16 y no al runtime GGUF, y que las tareas son adaptaciones de benchmarks públicos y tareas propias, no puntuaciones oficiales de leaderboard.

## Capacidades

- Generación de texto y respuesta a preguntas con el modelo destino a partir de estado transferido desde el modelo origen.
- Transferencia de estado multi-componente: atención, recurrencia, convolución y estado terminal.
- Procesamiento del prompt completo por parte del modelo pequeño, con el modelo grande libre de prefill.
- API de sesión con `capture`, `translate`, `session` y `ask` para flujos multi-turno.
- Compatibilidad declarada con backend `nf4` y modo `thinking=False` en la API actual.
- Capacidades heredadas de los modelos base Qwen3.5-4B y Qwen3.8-27B (no detalladas en la información disponible).
- No se documentan tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Investigación en transferencia de estado entre modelos: el artefacto permite reproducir el experimento de puente 4B a 27B con manifiestos y recibos SHA-256, útil para grupos que estudian compresión de contexto y decodificación especulativa a nivel de estado.
- Reducción de latencia de primer token en prompts largos: con prompts de ~8K y ~16K, la evaluación reporta aceleraciones de TTFT de 2,01x y 2,19x frente al 27B nativo, lo que lo hace adecuado para prototipos interactivos donde el coste de prefill domina.
- Evaluación comparativa de pipelines híbridos: sirve como línea base para medir si un puente pequeño-grande mantiene calidad frente al modelo grande nativo en tareas estrictas (26/64 y 23/64 frente a 29/64 del 27B nativo en los dos paneles).
- Docencia y demostraciones de arquitecturas compuestas: el par de modelos y la API de sesión permiten ilustrar cómo se separa el coste de lectura del prompt del coste de generación.
- Auditoría de reproducibilidad: los manifiestos, artefactos y `COMPOSITE_RESULTS.json` permiten verificar resultados con revisiones exactas, útil en revisiones internas de I+D.
- Prototipado de asistentes con contexto largo en inglés: dado que el modelo está etiquetado solo para `en` y evaluado hasta ~16K tokens, encaja en pruebas de concepto de Q&A documental en inglés, no en producción multilingüe.

## Benchmarks y rendimiento

| Tarea | 4B nativo | LatentPort-4+27B | 27B nativo |
|---|---:|---:|---:|
| Panel A (64 tareas) | 9 / 64 | 26 / 64 | 29 / 64 |
| Confirmación independiente B (64 tareas) | 11 / 64 | 23 / 64 | 29 / 64 |

En el panel B, la mejora estricta de éxito sobre el 4B nativo es de 18,75 puntos porcentuales (intervalo pareado del 95 %: +0,74 a +33,92 puntos). El 27B nativo sigue siendo superior en conjunto.

| Longitud de prompt | TTFT mediana 27B nativo | TTFT mediana compuesto | Aceleración TTFT pareada (IC 95 %) |
|---|---:|---:|---:|
| Corto | 0,603 s | 0,513 s | 1,06x (0,87–1,29) |
| ~2K | 2,148 s | 1,295 s | 1,65x (1,61–1,69) |
| ~8K | 8,871 s | 4,459 s | 2,01x (1,96–2,05) |
| ~16K | 24,663 s | 11,087 s | 2,19x (2,15–2,23) |

Agregado sobre 32 peticiones: 1,67x (IC 95 %: 1,49–1,86). Ocho peticiones independientes por longitud, tres repeticiones pareadas por petición; las ratios son estimaciones geométricas pareadas, no cocientes de medianas. El TTFT incluye prefill del origen, traducción de estado, instalación y primer token emitido, y excluye carga en frío. El primer token puede ser de razonamiento o control, no texto de respuesta útil. No se establece mejora de respuesta completa ni de throughput de decodificación. Las puntuaciones de calidad no se han reestablecido para el runtime GGUF.

## Requisitos de hardware

- Configuración evaluada: NVIDIA RTX 5090, Windows x64, Python 3.11, CUDA 13.0, runtime NF4/BF16 con modelos y puente residentes.
- VRAM estimada: no disponible de forma desagregada; el repositorio ocupa 24,7 GB y requiere mantener simultáneamente el 4B, el 27B y el puente en la configuración de investigación.
- GPU recomendadas: RTX 5090 según la evaluación publicada; no se documentan pruebas en A100, H100 u otras GPU.
- Cabe en GPU consumer: sí, según el autor, en RTX 5090 con la configuración fijada; no se garantiza en GPUs con menos VRAM.
- Opciones de despliegue: runtime LatentPort (`pip install latentport`) con backend `nf4`; el companion GGUF no es cargable por cargadores GGUF estándar.
- Latencia: TTFT mediana de 0,513 s a 11,087 s según longitud de prompt en la configuración evaluada; throughput de decodificación no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (panel B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentPort-4+27B (preview) | 644,6 M en puente + 4B y 27B base | hasta ~16K evaluado | 23 / 64 | Apache-2.0 (puente) | Hugging Face, runtime propio |
| Qwen3.5-4B nativo | ~4B | no disponible | 11 / 64 | según modelo base | Hugging Face |
| Qwen3.8-27B nativo | ~27B | no disponible | 29 / 64 | según modelo base | Hugging Face |
| LPBridge-Qwen3.5-4b-Qwen3.8-27b (canónico) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face, runtime actual |

La comparación relevante no es de tamaño, sino de coste de prefill frente a calidad: el compuesto mejora al 4B nativo pero no alcanza al 27B nativo, y el puente canónico sustituye a este preview para uso actual.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: es un puente de estado ligado a un par exacto de checkpoints y a un runtime concreto.
- El companion GGUF contiene artefactos en formato nativo; no debe cargarse con cargadores GGUF estándar ni asumirse compatible con checkpoints arbitrarios.
- Las puntuaciones de calidad publicadas corresponden a la configuración NF4/BF16, no al runtime GGUF; no deben presentarse como benchmark de calidad GGUF.
- El TTFT en caliente excluye carga en frío y no demuestra aceleración de respuestas completas ni de throughput de decodificación.
- La mejora de calidad sobre el 4B nativo tiene un intervalo de confianza amplio (+0,74 a +33,92 puntos), lo que limita la generalización.
- La evaluación usa tareas adaptadas y propias, con calificación por IA ciega a identidad; diferencias de plantilla y juicios ambiguos limitan la extrapolación.
- Idioma declarado: solo inglés (`en`); no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no cuantificado en la información disponible; al heredar los modelos base, arrastra sus sesgos.
- Licencia Apache-2.0 solo para los pesos del puente; los modelos base y dependencias nativas conservan sus licencias respectivas, que deben revisarse para uso comercial.
- Para nuevas aplicaciones, el autor recomienda el repositorio canónico LPBridge y no este preview archivado.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/latentport-4-27b-research-preview-GGUF
- Repositorio canónico: https://huggingface.co/latentport/LPBridge-Qwen3.5-4b-Qwen3.8-27b
- GitHub: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Instalación: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
- API: https://github.com/LatentPort/latentport/blob/main/docs/api.md
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Resultados legibles por máquina: COMPOSITE_RESULTS.json (en el repositorio de Hugging Face)
