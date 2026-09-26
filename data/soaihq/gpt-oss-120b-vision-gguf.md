# SoAIHQ/gpt-oss-120b-VISION-GGUF

## Resumen

SoAIHQ/gpt-oss-120b-VISION-GGUF es una conversión al formato GGUF del modelo de pesos abiertos gpt-oss-120b de OpenAI, publicada por SoAI (SoAIHQ). El repositorio no recuantiza los pesos originales: mantiene los expertos en MXFP4, tal y como OpenAI los post-entrenó y evaluó, y conserva el resto de tensores en BF16. La única aportación funcional sobre el modelo base es una entrada de imagen experimental, implementada mediante un codificador visual y un proyector procedentes de OpenGVLab/InternVL3_5-GPT-OSS (referencia incompleta en la model card) y distribuidos como fichero auxiliar `mmproj` en F16.

El modelo es un Mixture of Experts de 116.829.156.672 parámetros totales (unos 117B) con 5,1B parámetros activos por token, 128 expertos de los cuales 4 se activan por paso, y una ventana de contexto de 131.072 tokens (128K). El razonamiento está siempre activo y su profundidad se controla con el parámetro `reasoning_effort` (`low`, `medium`, `high`). Está pensado principalmente para inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia práctica es doble: permite ejecutar un modelo de razonamiento de 117B en llama.cpp con un único build de 65,4 GB (dos partes) en lugar de las conversiones a Q4_K_M o Q8_0 habituales, y abre la puerta a probar entrada multimodal sobre un modelo que OpenAI publicó como solo texto. Conviene ser prudente: la capacidad de visión se declara explícitamente experimental, el repositorio no incluye resultados de benchmarks propios y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE), 128 expertos con 4 activos por token |
| Parametros totales | 116.829.156.672 (≈117B) |
| Parametros activos | 5,1B |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | MXFP4 para los expertos + BF16 para el resto de tensores; mmproj en F16. No se publican builds Q4_K_M ni Q8_0 (decisión justificada por el autor) |
| Idiomas soportados | Principalmente inglés (según la model card); no disponible el desglose oficial de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en 2 partes (`gpt-oss-120b-MXFP4-00001-of-00002.gguf` y `-00002-of-00002.gguf`), más `mmproj-gpt-oss-120b-f16.gguf` para imagen |
| Modelo base | openai/gpt-oss-120b (relación: quantized) |
| Cuantizado por | SoAI (SoAIHQ) |
| Tamaño del repositorio | 66,0 GB |
| Tamaño de los pesos | 65,4 GB (MXFP4, 2 partes) + 651,1 MB (mmproj F16) |
| Formato de prompt | harmony (OpenAI); plantilla de chat embebida en el GGUF |
| Razonamiento | Siempre activo, con `reasoning_effort` = low / medium / high |
| Ajustes recomendados | temperature 1.0, top_p 1.0; reservar al menos 16K tokens de salida |
| Idiomas declarados en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 128 expertos por capa, de los que se activan 4 por token, lo que da 5,1B parámetros activos sobre un total de 117B. El autor no documenta en esta ficha el número de capas, la dimensionalidad, el tipo de atención ni el número de tokens de entrenamiento; esa información no está disponible en la información proporcionada. Tampoco se detalla la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento posterior al preentrenamiento.

El detalle técnico más relevante de este build es que OpenAI post-entrenó el modelo con los pesos de los expertos ya en MXFP4 y ejecutó sus evaluaciones publicadas en ese formato. Por ese motivo, la conversión copia los expertos tal cual y mantiene el resto de tensores en BF16, sin recuantizar. El autor argumenta que un build Q4_K_M expandiría esos expertos de 4 bits y los redondearía de nuevo a otro formato, añadiendo error sobre el redondeo original, mientras que un Q8_0 duplicaría aproximadamente el tamaño sin recuperar precisión. Antes de publicar, el proceso de conversión verifica que los marcadores de chat, de razonamiento (*thinking*) y de llamada a herramientas se almacenen como tokens especiales y que la plantilla de chat embebida coincida con la original; si esos marcadores se importan como texto plano, los turnos, el pensamiento y el *tool calling* se rompen sin emitir ningún error, por lo que el build se detiene en lugar de publicarse. La entrada de imagen es un añadido externo: se implementa con un codificador visual y un proyector como fichero `mmproj` independiente, cargado con `--mmproj`, y no forma parte de los pesos originales de OpenAI.

## Capacidades

- Generación de texto conversacional en formato harmony, con plantilla de chat embebida que aplican los runtimes automáticamente.
- Razonamiento siempre activo, con profundidad ajustable por petición mediante `reasoning_effort` (`low`, `medium`, `high`) a través de `chat_template_kwargs`.
- Soporte de *tool calling* / *function calling*: llama.cpp parsea las llamadas de vuelta a `tool_calls` compatibles con la API de OpenAI.
- Contexto largo de 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Entrada de imagen experimental mediante el fichero `mmproj-gpt-oss-120b-f16.gguf`; sin él, el modelo es solo texto.
- Idiomas: principalmente inglés según la model card; no se documentan capacidades multilingües adicionales.
- Audio: no soportado (indicado explícitamente en la tabla «At a glance»).
- Despliegue con API compatible con OpenAI a través de `llama-server`, con interfaz de chat integrada en `http://localhost:8080`; el repositorio incluye la etiqueta `endpoints_compatible`.
- Ejecución flexible en GPU, CPU o repartiendo capas entre ambas con llama.cpp.

## Casos de uso

- Asistencia técnica y atención al cliente multi-turno: con 131.072 tokens de contexto el modelo puede mantener el historial completo de una incidencia larga, incluyendo registros y documentación adjunta, sin truncar; el ajuste `reasoning_effort: low` reduce la latencia en respuestas rutinarias.
- Análisis de documentación extensa: contratos, informes técnicos o expedientes que superen las decenas de miles de tokens entran en una sola ventana, lo que permite resumir, extraer cláusulas o responder preguntas sobre el documento completo sin técnicas de recuperación adicionales.
- Agentes con herramientas en pipelines internos: el soporte de *tool calling* en formato OpenAI permite conectar el modelo a buscadores, bases de datos o APIs corporativas y encadenar varios pasos de razonamiento, con las llamadas devueltas como `tool_calls` estructurados.
- Generación y revisión de código en flujos de integración continua: el modelo puede revisar *pull requests*, generar pruebas o proponer parches; se desplegaría tras un `llama-server` con API compatible y se invocaría desde el runner de CI, reservando un `reasoning_effort` alto para cambios complejos.
- Asistencia a I+D sobre modelos de razonamiento abiertos: al ser una conversión que preserva los pesos originales sin recuantizar, sirve como referencia para medir cuánto degrada cada formato de cuantización alternativo frente al release de OpenAI.
- Extracción de información de documentos escaneados o capturas (experimental): usando el `mmproj` de InternVL3.5 se puede alimentar una imagen junto al texto para transcribir tablas o interpretar diagramas; al ser visión experimental, requiere validación manual y no debería usarse como única fuente en producción.
- Procesamiento por lotes en local con presupuesto de hardware limitado: la naturaleza MoE con 5,1B parámetros activos permite ejecutar el modelo repartiendo capas entre GPU y CPU en llama.cpp, lo que habilita tareas de resumen o clasificación por lotes en máquinas sin GPU de 80 GB.
- Evaluación comparativa de prompts y plantillas harmony: el repositorio conserva la plantilla original embebida y verifica los tokens especiales, lo que lo hace útil para experimentar con el formato de razonamiento y de llamadas a herramientas sin reescribir el *template*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que OpenAI ejecutó sus evaluaciones publicadas con los pesos de los expertos en MXFP4, el mismo formato que conserva este build, pero no reproduce ninguna cifra (MMLU, HumanEval, GSM8K ni otros) ni ofrece comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM para los pesos: 65,4 GB en MXFP4 para el modelo de texto, más 651,1 MB si se carga el `mmproj` de visión (aproximadamente 66 GB en total).
- Memoria adicional para el contexto: el autor señala explícitamente que el modelo necesita memoria para el fichero y para el contexto, y que la parte de contexto crece con la longitud configurada; no se publican cifras concretas de KV cache por token en la información disponible.
- GPU de 80 GB: una H100 80 GB o una A100 80 GB permiten cargar los pesos completos, aunque el contexto utilizable dependerá de la memoria restante.
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) ni en tarjetas de gama alta con menos de 48 GB; es viable con varias GPU consumer sumando memoria o repartiendo capas entre GPU y CPU.
- CPU y configuraciones híbridas: llama.cpp puede ejecutar el modelo en CPU, en GPU o con las capas repartidas entre ambas, lo que permite funcionar en máquinas sin GPU de gran memoria a costa de velocidad.
- Opciones de despliegue: `llama-server` (probado y documentado, con `llama-server -hf SoAIHQ/gpt-oss-120b-VISION-GGUF:MXFP4`), llama.cpp en general y cualquier runtime que consuma GGUF; el repositorio declara compatibilidad con *endpoints* estilo OpenAI. No se documentan instrucciones para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de respuesta para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SoAIHQ/gpt-oss-120b-VISION-GGUF (este modelo) | 116.829.156.672 (≈117B) | 5,1B | 131.072 | MXFP4 (expertos) + BF16, más mmproj F16 | Apache 2.0 | GGUF para llama.cpp; visión experimental |
| openai/gpt-oss-120b (modelo base) | ≈117B | 5,1B | 131.072 | Expertos en MXFP4 y resto en BF16, según la model card | Apache 2.0 | Pesos originales de OpenAI; solo texto |
| Otras conversiones GGUF del mismo modelo base | ≈117B | 5,1B | 131.072 | Comprimen parte del modelo adicionalmente, según la model card | Apache 2.0 | No disponible el detalle |
| Modelos alternativos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni de terceros modelos que permitan una comparación cuantitativa. La diferencia verificable frente al modelo base es el formato de distribución (GGUF en lugar de los pesos originales) y la adición experimental de entrada de imagen.

## Limitaciones y advertencias

- La entrada de imagen es experimental y se implementa mediante un codificador visual y un proyector externos procedentes de un modelo de terceros (InternVL3.5 de OpenGVLab, referencia truncada en la model card); su calidad no está validada por OpenAI ni respaldada por benchmarks publicados.
- No hay resultados de benchmarks en la información disponible, por lo que no se puede verificar la degradación (si la hay) frente al modelo base de OpenAI.
- El razonamiento no se puede desactivar. Siempre consume tokens antes de la respuesta, y el autor recomienda reservar al menos 16K tokens de salida para dejar sitio a respuestas largas; esto incrementa coste y latencia en comparación con modelos que permiten desactivar el modo de pensamiento.
- Idioma: la model card indica que el modelo funciona principalmente en inglés; no se documenta un soporte multilingüe amplio, lo que puede degradar el rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: no se documentan tasas de error ni evaluaciones de fidelidad en la información disponible; como en cualquier modelo generativo, las respuestas deben verificarse antes de usarse en producción.
- Sesgos: no se publica ninguna evaluación de sesgos ni de seguridad en la información proporcionada.
- Licencia: los pesos se distribuyen bajo Apache 2.0, lo que en principio permite uso comercial, pero el codificador visual añadido proviene de otro proyecto (InternVL3.5) cuya licencia no se detalla en la información disponible y debería comprobarse por separado antes de un despliegue comercial con imagen.
- Requisitos de memoria altos: alrededor de 66 GB solo para los pesos, sin contar la caché de contexto, lo que excluye su uso en GPU de consumo individual.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, y la model card está truncada en el punto donde describe la procedencia del codificador visual, por lo que parte de la documentación técnica está incompleta.
- Coherencia de metadatos: las fechas de creación y actualización registradas (2026-09-26 y 2026-09-26) resultan anómalas y conviene tratarlas con cautela al citar el repositorio.
- El modelo solo funciona con el formato de prompt harmony; usarlo con una plantilla distinta puede romper los turnos, el razonamiento y las llamadas a herramientas sin mostrar ningún error.
- No se documentan opciones de despliegue en vLLM, TGI u Ollama, ni cuantizaciones Q4_K_M o Q8_0 alternativas dentro de este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Licencia del modelo base: https://huggingface.co/openai/gpt-oss-120b/blob/main/LICENSE
- Fichero de pesos (parte 1): https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF/resolve/main/gpt-oss-120b-MXFP4-00001-of-00002.gguf
- Fichero de pesos (parte 2): https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF/resolve/main/gpt-oss-120b-MXFP4-00002-of-00002.gguf
- Proyector de visión (mmproj, F16): https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF/resolve/main/mmproj-gpt-oss-120b-f16.gguf
- Árbol de ficheros del repositorio: https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF/tree/main
- Formato de prompt harmony: https://github.com/openai/harmony
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor de la cuantización (SoAI): https://soai.to
- Organización del codificador visual (referencia incompleta en la model card): https://huggingface.co/OpenGVLab
