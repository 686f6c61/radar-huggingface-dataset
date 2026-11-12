# LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v14

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Abliterated-v14 es una conversión del checkpoint DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated a una arquitectura modificada denominada `Qwen4ExpV14ForConditionalGeneration`, orientada a dotar al modelo de una memoria episódica persistente entre peticiones. El autor, LTM-Lab, no entrena ni re-cuantiza nada: los pesos son idénticos byte a byte a los del modelo base, en su formato FP4-Local (precisión mixta ModelOpt con expertos NVFP4 y escalas comprimidas). Lo que se añade es el nombre de arquitectura, un `auto_map`, opciones de memoria en `config.json`, dos ficheros de código que implementan el mecanismo y un parche de imagen para vLLM.

El modelo hereda del linaje Qwen3.8-Flash-Next un diseño híbrido con 36 capas Gated DeltaNet y 12 capas de atención indexada (QSA), más decodificación especulativa MTP (multi-token prediction). Con 187.931.804.131 parámetros totales y un repositorio de 102,3 GB, está pensado para servirse en hardware de gama alta (el autor lo valida en una RTX PRO 6000 Blackwell de 96 GB) mediante una imagen Docker de vLLM construida a partir del parche incluido.

La relevancia de esta ficha es doble: por un lado, documenta un experimento poco habitual de memoria episódica a nivel de atención (sin recuperación textual ni inyección en el prompt); por otro, advierte de que se trata de una variante "abliterated" (sin rechazos) con licencia NVIDIA Open Model Agreement y un ecosistema de despliegue muy restringido a la imagen propietaria del autor. El checkpoint se publicó el 11 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas Gated DeltaNet + 12 capas de atención indexada (QSA), con decodificación especulativa MTP; clase `Qwen4ExpV14ForConditionalGeneration` |
| Parametros totales | 187.931.804.131 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra nominal; el autor reporta una caché KV de 536.203 a 564.006 tokens con memoria activada frente a 766.241 tokens con los valores por defecto |
| Tipos de cuantizacion | FP4-Local (ModelOpt mixed precision, expertos NVFP4 con escalas comprimidas); etiquetado también como 8-bit y mxfp8 en los tags |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-open-model-agreement (etiqueta `license: other`) |
| Formato de pesos | safetensors (con `custom_code` y `auto_map`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida en la que conviven 36 capas Gated DeltaNet (atención lineal recurrente) con 12 capas de atención indexada QSA, complementadas por decodificación especulativa MTP. Sobre esa base, la variante V14 introduce un mecanismo de memoria episódica: durante la lectura de un prompt, las claves y valores de las 12 capas QSA se fragmentan en eventos de hasta 128 tokens y se escriben en un almacén en disco, cada uno acompañado de un "engram" de bajo rango del estado que deja en las 36 capas Gated DeltaNet. En una petición posterior, el prompt se lee una vez para determinar qué solicita, se recuperan por votación única (para todas las capas y cabezas) los eventos cuyas claves captarían su atención, sus engrams se componen en el estado recurrente de la petición y el prompt se relee con las claves y valores recuperados fusionados mediante log-sum-exp de la atención local. Nada se recupera como texto ni se añade al prompt.

No se ha entrenado, fusionado ni re-cuantizado nada en esta conversión: los pesos son los del checkpoint base en formato FP4-Local. La innovación es, por tanto, de inferencia y no de entrenamiento. El parche de vLLM añade la memoria sobre la imagen `ghcr.io/local-inference-lab/vllm:release-10152026` (kernels b12x capaces de servir el formato FP4-Local), manteniendo activos CUDA graphs, caché de prefijos, decodificación especulativa MTP y planificación asíncrona. El almacén reside en disco y sobrevive a reinicios. Durante la generación, la petición también atiende al evento que el "modelo del mundo" de la memoria predice a continuación, a partir de las transiciones del propio almacén.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `image-text-to-text` (entrada de imagen y texto).
- Memoria episódica persistente entre peticiones: un hecho contado en una conversación puede recuperarse en otra conversación nueva y separada, sin historial compartido.
- Recuperación de eventos por atención sobre claves y valores almacenados, sin recuperación textual ni inyección en el prompt.
- Predicción del siguiente evento esperado por el modelo del mundo interno de la memoria durante la decodificación.
- Decodificación especulativa MTP y planificación asíncrona compatibles con el mecanismo de memoria.
- Modo "thinking" configurable (el autor lo desactiva con `enable_thinking: false` en sus pruebas).
- Variante "abliterated"/"heretic": se ha eliminado el comportamiento de rechazo del modelo base (ver limitaciones).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; la model card incluye texto en chino tradicional y en inglés, pero no se declara una lista de idiomas.

## Casos de uso

- Asistentes con memoria entre sesiones: el modelo permite que un usuario cuente un hecho en una conversación y lo consulte en otra distinta sin historial compartido; el autor verifica 6 de 6 hechos recuperados correctamente con memoria activada frente a 0 de 6 con memoria desactivada. Adecuado para asistentes personales o de soporte donde la continuidad importa.
- Agentes de larga duración: al persistir el almacén en disco y sobrevivir a reinicios, encaja en flujos de trabajo que se extienden durante días y necesitan recordar decisiones o preferencias previas sin reenviar todo el contexto.
- Procesamiento de documentos extensos con preguntas posteriores: el autor comprueba que las mismas seis preguntas se responden correctamente después de un prompt de 20.000 tokens, aprovechando la caché de prefijos de vLLM.
- Análisis de imágenes con seguimiento conversacional: el pipeline `image-text-to-text` permite mantener el hilo sobre una imagen a lo largo de varias peticiones gracias a la memoria episódica.
- Investigación sobre memoria en modelos: útil como banco de pruebas para estudiar recuperación por atención frente a RAG textual, con trazas de decisión activables mediante `VLLM_V14_TRACE=1`.
- Despliegue en hardware de una sola GPU de 96 GB: el autor valida el servicio en una RTX PRO 6000 Blackwell con Docker, lo que facilita entornos de laboratorio con una única tarjeta.
- Evaluación de alineación y robustez: la variante abliterated sirve para estudiar el comportamiento de modelos sin rechazos en entornos controlados de investigación sobre seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye únicamente una comprobación funcional, no un benchmark, medida en una RTX PRO 6000 Blackwell (96 GB) bajo Docker Desktop el 12 de noviembre de 2026, con temperatura 0 y thinking desactivado:

| Prueba | Memoria activada | Memoria desactivada |
|---|---|---|
| Hecho contado en una conversación, preguntado en otra nueva (6 hechos) | 6 / 6 | 0 / 6 |
| Las mismas seis preguntas tras un prompt de 20.000 tokens | 6 / 6 | no disponible |
| Preguntas no relacionadas posteriores (4) | 4 / 4 | 4 / 4 |
| Velocidad de decodificación (respuestas de 269 a 400 tokens) | 96,7 tokens/s (77,5; 115,4; 97,3) | 122,4 tokens/s (114,8; 145,9; 106,4) |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor valida el servicio en una GPU de 96 GB; el repositorio pesa 102,3 GB, por lo que no cabe en GPUs de consumo de 24 GB ni de 48 GB en su formato FP4-Local original.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB, medida por el autor); otras GPU de 96 GB o superiores no están documentadas en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo según los datos disponibles.
- Opciones de despliegue: exclusivamente la imagen Docker construida desde `vllm-v14-patch/`, que parte de `ghcr.io/local-inference-lab/vllm:release-10152026` (unos 44 GB de descarga). Otras imágenes no reconocen la arquitectura V14, incluida la imagen para DGX Spark del `serve-spark.sh` del modelo original. Con `VLLM_V14_MEMORY=0` se sirve como checkpoint plano igual que la imagen base.
- Variables de despliegue relevantes: `VLLM_V14_MAX_SLOTS` (por defecto 4 peticiones concurrentes con memoria, unas 108 MiB de buffers de decodificación cada una), `VLLM_V14_INDEX_GB` (por defecto 1 GB para el índice en GPU, unos 15.000 payloads), `VLLM_V14_WORK_GB` (por defecto 2 GB reservados para la fusión de prompts largos) y `VLLM_V14_TRACE=1` para registrar decisiones de recuperación.
- Latencia y throughput: 96,7 tokens/s de decodificación con memoria activada y 122,4 tokens/s con memoria desactivada en la RTX PRO 6000 Blackwell; la memoria reduce la caché KV disponible de 766.241 a entre 536.203 y 564.006 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria entre peticiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP4-Local-Abliterated-v14 (este) | 187,9 B | no disponible (caché KV de 536.203 a 564.006 tokens con memoria) | Sí, almacén en disco con recuperación por atención | nvidia-open-model-agreement | Solo con imagen vLLM parcheada |
| DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated (base) | no disponible | no disponible | No | no disponible | Imagen vLLM base y `serve-spark.sh` para DGX Spark |
| Otros modelos de la familia Qwen3.8-Flash-Next | no disponible | no disponible | No | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Variante "abliterated"/"heretic": se ha eliminado el comportamiento de rechazo, por lo que puede producir contenido dañino o inapropiado sin filtros; no es apta para producción orientada al público sin capas adicionales de moderación.
- El autor reconoce que una pregunta sin nada que recuperar en el almacén se responde correctamente, pero "no siempre con las palabras del modelo plano"; la memoria puede alterar la formulación de respuestas.
- La recuperación depende de una votación única para todas las capas y cabezas, lo que puede limitar la precisión en consultas ambiguas o con múltiples temas entremezclados.
- La memoria reduce la caché KV disponible (de 766.241 a 536.203-564.006 tokens con los valores por defecto), lo que recorta el contexto efectivo.
- Las peticiones que superan `VLLM_V14_MAX_SLOTS` se ejecutan sin memoria, con degradación silenciosa del comportamiento.
- Restricciones de despliegue severas: solo funciona con la imagen construida desde el parche; otras imágenes, incluida la de DGX Spark del modelo original, no reconocen la arquitectura V14 salvo que se revierta `architectures` a `Qwen4ExpForConditionalGeneration`.
- Licencia NVIDIA Open Model Agreement: es necesario revisar sus términos para uso comercial; la model card no detalla condiciones adicionales.
- Idiomas soportados no declarados; no hay garantías de cobertura multilingüe.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de sesgos.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado el 11 de noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- El propio autor califica las mediciones como "una comprobación funcional, no un benchmark".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v14
- Modelo base: https://huggingface.co/DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated
- Imagen vLLM de partida: ghcr.io/local-inference-lab/vllm:release-10152026
- Paper referenciado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Dataset de comportamientos dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de instrucciones inocuas: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Parche de vLLM: carpeta `vllm-v14-patch/` dentro del repositorio del modelo (incluye `vllm-v14-patch/README.md`)
