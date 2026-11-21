# ApolloRaines/Gemma-4-12B-it-Jbliterated-v2

## Resumen

Gemma-4-12B-it-Jbliterated-v2 es un ajuste fino derivado de Gemma 4 12B instruction-tuned, publicado por el desarrollador independiente ApolloRaines bajo el marco que denomina "jBlaze precision neural surgery". El modelo aplica una eliminación quirúrgica de la dirección de rechazo en los pesos (abliteration) seguida de una pasada de fine-tuning supervisado (SFT) sobre las propias trazas de razonamiento reparadas del modelo v1, con el objetivo de eliminar los espirales de clasificación de seguridad en el canal de pensamiento que provocaban respuestas incompletas o ausentes.

La relevancia del modelo es doble. Por un lado, documenta una técnica concreta para reducir el comportamiento de rechazo sin degradar de forma apreciable las capacidades generales: el autor reporta una caída de 0,88 puntos en MMLU respecto a v1 (77,72% frente a 78,60%) y una mejora en la tasa de respuestas completas del 61,2% al 78,8% sobre 80 prompts retenidos. Por otro, el modelo se presenta explícitamente como herramienta para investigación en seguridad, análisis defensivo y red-teaming, lo que condiciona su uso legítimo.

Arquitectura y entrenamiento: el autor indica que v2 es un checkpoint fusionado y autocontenido que se carga igual que v1, con 11.959.730.224 parámetros totales según los pesos en safetensors. La información disponible no detalla la arquitectura interna más allá de las etiquetas `gemma4_unified` y `gemma4`, ni el volumen o composición exactos del dataset de SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; etiqueta `gemma4_unified`), detalles internos no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (repositorio con archivos GGUF e `imatrix`); cuantizaciones concretas no especificadas |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-12B-it-Jbliterated (v1), que a su vez deriva de Gemma 4 12B instruction-tuned. La intervención de v1 es una edición directa de pesos orientada a la dirección de rechazo, sin entrenamiento por gradiente. v2 añade una pasada de fine-tuning supervisado sobre las trazas de razonamiento reparadas del propio v1, dirigida específicamente a suprimir las espirales de clasificación de seguridad en el canal de pensamiento, y posteriormente fusiona el resultado en los pesos base para producir un checkpoint único autocontenido.

El autor corrige explícitamente una afirmación previa de la model card: v2 sí aplica entrenamiento por gradiente, está etiquetado como `sft` y una auditoría espectral independiente midió el delta en rango 189-227 de 256, lo que respalda que se trata de una edición entrenada y no de una construcción. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de SFT ni si se emplearon RLHF o DPO. El autor menciona además que el SFT se condicionó a la preservación de capacidad, con una tolerancia de caída en MMLU inferior a 1,05 puntos.

## Capacidades

- Generación de texto conversacional y razonamiento con canal de pensamiento (*thinking*) habilitable.
- Respuesta directa ante peticiones que los modelos alineados estándar rechazarían, incluyendo análisis de código hostil, exploits y artefactos de malware.
- Reducción medida del comportamiento de rechazo: tasa de clasificación de seguridad en cadena de pensamiento del 35,0% en v2 frente al 81,2% en v1 sobre 80 prompts retenidos.
- Mayor tasa de respuestas completas: 78,8% en v2 frente a 61,2% en v1, con reducción de espirales sin respuesta del 35,0% al 21,2%.
- Capacidad general preservada: MMLU del 77,72% (570 ítems estratificados) frente al 78,60% de v1.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el canal de pensamiento está presente.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Análisis defensivo de malware: el modelo puede leer y describir el funcionamiento de muestras y artefactos de ataque sin bloquear la petición, lo que permite a un analista de incidentes reconstruir cadenas de compromiso a partir de los propios ficheros del atacante.
- Revisión de código hostil en auditorías de seguridad: útil para inspeccionar exploits, payloads y pruebas de penetración dentro de un pipeline de revisión, un escenario donde los guardarraíles de los modelos alineados estándar interrumpen el flujo de trabajo.
- Red-teaming y evaluación de guardarraíles: sirve como modelo de referencia con rechazo reducido para medir la robustez de clasificadores de seguridad propios y comparar su comportamiento frente a modelos alineados.
- Investigación sobre alineación y edición de pesos: la técnica documentada (cirugía de la dirección de rechazo más SFT correctivo) es un caso de estudio reproducible para estudiar si el rechazo es una disposición aprendida separable de la capacidad.
- Generación de texto en inglés con contexto conversacional multi-turno: adecuado para prototipos de asistentes en inglés donde se requiera baja tasa de rechazo, con la salvedad de la tasa residual de espirales sin respuesta.
- Despliegue en hardware limitado: la disponibilidad de GGUF con `imatrix` y la herramienta DeepswapLLM del autor permiten ejecutar el modelo en GPUs con VRAM insuficiente para los 12B en precisión completa, a costa de latencia por el streaming de capas.

## Benchmarks y rendimiento

Evaluación sobre 80 prompts retenidos, decodificación greedy con *thinking* habilitado, juez determinista de cadena de pensamiento:

| Métrica | v1 (jbliterated) | v2 (+SFT) |
|---|---|---|
| Tasa de clasificación de seguridad en CoT | 81,2% | 35,0% |
| Tasa de autosabotaje (espirales sin respuesta) | 35,0% | 21,2% |
| Tasa de respuesta completa | 61,2% | 78,8% |
| Marcadores de seguridad medios por traza | 1,65 | 0,49 |

Capacidad general:

| Métrica | v1 | v2 |
|---|---|---|
| MMLU (570 ítems estratificados, accuracy) | 78,60% | 77,72% |
| Cambio en MMLU frente a v1 | -- | -0,88 pts |

Dato adicional citado por el autor sobre la técnica, medido en otro modelo (Sharona, Qwen3.5-27B) tras seis fases de cirugía y cuantización GPTQ W4A16: MMLU del 77,89% frente a una línea base de 76,84%, una ganancia de 1,05 puntos. El propio autor advierte que es una medición sobre un modelo concreto y no una garantía por modelo.

No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, MMLU-Pro) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 24 GB solo para pesos (12B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 32 GB o más.
- Cuantización GGUF: el repositorio incluye ficheros GGUF con `imatrix`, lo que permite ajustar el modelo a GPUs de 16 GB (Q4-Q5) y de 8-12 GB en cuantizaciones más agresivas, con la consiguiente pérdida de calidad.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) viable en cuantización Q4/Q5 o en FP16 con offloading parcial; RTX 3090 con las mismas consideraciones.
- Cabe en GPU de consumo: sí, en cuantización GGUF; en precisión completa requiere 24 GB o más y no cabe en GPUs de 8-16 GB sin offloading.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF publicados; vLLM y TGI para safetensors en FP16/BF16; DeepswapLLM del propio autor para streaming de capas entre GPU, RAM y disco, que el autor afirma hasta 4 veces más rápido que AirLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it-Jbliterated-v2 | ~12B | no disponible | Abliteration + SFT correctivo | gemma | MMLU 77,72%; rechazo reducido con espirales residuales del 21,2% |
| Gemma-4-12B-it-Jbliterated (v1) | ~12B | no disponible | Abliteration sin gradiente | gemma | MMLU 78,60%; espirales sin respuesta del 35,0% |
| Gemma 4 12B instruction-tuned (base) | ~12B | no disponible | Alineación estándar | gemma | Línea base de la familia; comportamiento de rechazo convencional |
| Sharona (Qwen3.5-27B) | ~27B | no disponible | Cirugía jBlaze + GPTQ W4A16 | no disponible | MMLU 77,89% frente a 76,84% de línea base; usado por el autor como evidencia de la técnica |

Los datos de contexto de los modelos comparados no están disponibles en la información proporcionada. La comparación con la línea base Gemma 4 12B-it se infiere de la jerarquía de modelos indicada por el autor, sin cifras de rendimiento publicadas en esta ficha.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo: puede producir contenido dañino, instrucciones para actividades ilícitas y análisis operativo de malware. El autor lo publica para investigación en seguridad y análisis defensivo, no para uso general.
- Tasa residual de autosabotaje del 21,2%: en los prompts más difíciles el modelo sigue entrando en espirales de razonamiento sin producir respuesta completa. No es adecuado si se exige máxima completitud.
- El juez de cadena de pensamiento empleado es un banco de expresiones regulares determinista y conservador; es reproducible pero no detecta clasificaciones de seguridad parafraseadas, por lo que las métricas de rechazo pueden estar subestimadas.
- El entrenamiento se realizó con una única semilla; la reducción de fugas en el canal de pensamiento no se ha confirmado con múltiples inicializaciones.
- Idioma limitado al inglés según la etiqueta del repositorio; no hay evidencia de calidad en castellano u otros idiomas.
- Licencia Gemma: sujeta a los Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de cualquier despliegue en producción.
- Riesgo de alucinación no cuantificado en la información disponible; la reducción de rechazo puede aumentar la probabilidad de respuestas plausibles pero incorrectas en dominios sensibles.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modelo se distribuye con 1 like y 1019 descargas en el momento de la consulta; no cuenta con validación independiente más allá de la auditoría espectral y los benchmarks del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated-v2
- Modelo base (v1): https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Repositorio de la herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
