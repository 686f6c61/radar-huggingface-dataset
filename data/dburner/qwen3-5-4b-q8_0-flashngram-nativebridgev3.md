# dburner/Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3

## Resumen

Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3 es un artefacto de investigación experimental publicado por el usuario dburner en HuggingFace. No se trata de una versión oficial de Qwen ni de una conversión de un modelo en otro, sino de un GGUF que conserva congelados dos componentes: un backbone transformer Qwen 3.5 4B cuantizado en Q8_0 y una tabla de búsqueda n-gram (PLE) procedente de Qwen 3.8 Flash-Next, embebida en formato IQ4_NL. Entre ambos se inserta un adaptador entrenado de 13,14 millones de parámetros denominado NativeBridge V3, cuya función es traducir las características PLE recuperadas hacia una actualización residual aditiva compatible con el espacio latente de Qwen 3.5, justo antes del bloque transformer 2 (indexación desde cero).

El problema que aborda es la incompatibilidad de espacios residuales entre dos generaciones de modelos con tokenizador idéntico (248.320 tokens, mismos IDs de BOS/EOS) pero con embeddings de direcciones distintas, lo que impediría sumar directamente una característica PLE de Qwen 3.8 al flujo residual de Qwen 3.5. El adaptador actúa como capa de traducción aprendida, generando cuatro carriles de consulta compatibles con Qwen 3.8 y proyectando la característica PLE resultante de vuelta al tamaño de Qwen 3.5.

Es relevante ahora como prueba de concepto de reutilización de componentes entre versiones de modelos y de decodificación asistida por n-gram, pero debe tratarse con cautela: el propio autor lo etiqueta como artefacto experimental con limitaciones conocidas de estabilidad de generación, y su licencia es "other" sin detalles publicados. El repositorio ocupa 33,5 GB y suma unos 55,57 mil millones de parámetros según el recuento de safetensors, de los cuales la inmensa mayoría corresponden a la tabla n-gram embebida y no al backbone de 4B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer Qwen 3.5 4B congelado (32 bloques, tensores MTP) + tabla n-gram PLE de Qwen 3.8 Flash-Next congelada + adaptador NativeBridge V3 (13,14 M parámetros) antes del bloque transformer 2 |
| Parámetros totales | 55.572.574.212 según el recuento de safetensors del repositorio; el backbone es de 4B y aproximadamente 51,2 mil millones corresponden a la tabla `per_layer_token_embd.weight` de forma [160, 320001536] |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Backbone en Q8_0; tabla n-gram PLE en IQ4_NL; pesos en GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | other (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 33,5 GB (31,20 GiB) |
| Fichero publicado | Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3-budget042-step2500-fixed.gguf |
| Compatibilidad de tokenizador | Vocabulario de 248.320 tokens compartido entre Qwen 3.5 y Qwen 3.8 Flash-Next, con IDs de BOS/EOS coincidentes |

## Arquitectura y entrenamiento

El diseño parte de dos modelos congelados. Del lado Qwen 3.5 se mantienen intactos los embeddings de token, los 32 bloques del backbone, los tensores MTP, la LM head y la propia cuantización Q8_0. Del lado Qwen 3.8 Flash-Next se congela la tabla n-gram IQ4_NL `per_layer_token_embd.weight` con forma [160, 320001536], junto con los `W_key` y `W_value` empaquetados en cuatro carriles, tres escalas RMSNorm y un kernel de convolución causal depthwise de 10.240 canales. Lo único entrenado es el adaptador NativeBridge V3: una proyección de consulta de 2.560 × 2.560 desde el residual de Qwen 3.5 hacia el espacio PLE, cuatro escalas y sesgos de carril aprendidos, logits de mezcla de salida de cuatro carriles, una proyección de salida PLE a Qwen 3.5 de 2.560 × 2.560 y un escalar de sesgo de puerta.

El cálculo por token es el siguiente: un hash de bigramas/trigramas selecciona 16 filas de la tabla y produce un vector PLE `p_t` de 2.560 dimensiones; el puente genera cuatro carriles de consulta compatibles con Qwen 3.8 a partir del flujo residual único de 2.560 de Qwen 3.5; se calcula una puerta sigmoide por token y carril a partir del producto escalar normalizado entre clave y consulta, con temperatura; la característica se obtiene combinando la salida de `W_value` con una convolución causal depthwise y su activación SiLU; finalmente se mezclan los carriles con un softmax de logits y se proyecta al espacio de Qwen 3.5. La actualización residual es `delta = alpha * residual_budget * RMS(h35) * feature35`, con `alpha = 1`, presupuesto residual 0,42 y temperatura de puerta 1,25 almacenados en el checkpoint. La puerta es por token y carril, no una distribución de atención, y no suma uno: una puerta baja suprime tanto la característica PLE actual como su entrada al estado futuro de la convolución.

No se especifica en la información disponible el volumen de tokens de entrenamiento del adaptador, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el propio mecanismo de puente: en lugar de sustituir el backbone o hacer un fine-tuning completo, se aprende una traducción calibrada entre dos espacios residuales de generaciones distintas, con un presupuesto residual explícito que limita la magnitud de la intervención.

## Capacidades

- Generación de código: el autor reporta resultados parciales en LiveCodeBench v6 sobre el conjunto `code_generation_lite` con el checker oficial, con 319 problemas superados de 410 intentos completados.
- Razonamiento matemático: la etiqueta `mathematics` figura entre las declaradas del repositorio, aunque no se aportan resultados de benchmarks específicos de matemáticas.
- Modo de razonamiento: la evaluación se ejecutó con el modo de razonamiento de Qwen habilitado en llama.cpp.
- Conversación multiturno: el repositorio incluye la etiqueta `conversational`.
- Recuperación n-gram asistida: la tabla PLE embebida permite condicionar la generación mediante hashes de bigramas y trigramas, con una puerta aprendida que decide cuánta señal PLE se inyecta por token y carril.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades especiales: puente aprendido entre espacios residuales de dos generaciones de modelos, con control explícito de presupuesto residual y activación por puerta (`ngram-gate=1`); visión y audio no disponibles.

## Casos de uso

- Investigación en transferencia entre generaciones de modelos: el artefacto sirve para estudiar hasta qué punto una característica interna de una versión posterior puede reinyectarse en una anterior mediante una capa de traducción aprendida de solo 13,14 M de parámetros, sin reentrenar el backbone.
- Evaluación de decodificación asistida por n-gram: dado que la tabla PLE se activa con hashes de bigramas y trigramas, es un banco de pruebas para medir el efecto de la recuperación n-gram sobre la coherencia y la estabilidad de la generación con `ngram-gate` ajustable.
- Generación de código en entornos de investigación: con un 83,73 % de precisión (excluyendo errores) en la porción completada de LiveCodeBench v6, puede usarse como asistente de código offline en una estación de trabajo con suficiente memoria, siempre que se asuma que el resultado es parcial y no reproducible de forma determinista (semilla no fijada).
- Reproducción y ablación de adaptadores ligeros: permite experimentar con el presupuesto residual (0,42), la temperatura de puerta (1,25) y el sesgo de puerta para medir su impacto en la estabilidad de la generación.
- Análisis de fallos y estabilidad de generación: los 29 errores de generación o de servidor sobre 410 intentos documentados lo convierten en un caso de estudio útil sobre modos de fallo en modelos con inyección de características externas.
- Comparación de línea base frente a Qwen3.5-4B: sirve como referencia experimental para cuantificar cuánto se gana o se pierde frente al modelo original, que reporta 55,8 en LiveCodeBench v6 en su model card oficial.
- Desarrollo de puentes similares para otros pares de modelos: la metodología (verificar compatibilidad de tokenizador, medir similitud coseno entre embeddings del mismo token, aprender una proyección de consulta y otra de salida) es reutilizable para otros emparejamientos entre versiones.
- Docencia y divulgación técnica: al ser un ejemplo autocontenido de intervención en el flujo residual, resulta adecuado para explicar cómo funcionan las capas de adaptación y las tablas de embeddings de gran tamaño.

## Benchmarks y rendimiento

LiveCodeBench v6, conjunto `code_generation_lite`, con dataset y checker oficiales. Resultado parcial y en curso, una muestra por problema (N=1); no es una puntuación completa de benchmark.

| Métrica | Resultado |
|---|---|
| Preguntas del benchmark | 1.055 |
| Intentos completados | 410 |
| Superadas | 319 |
| Fallidas | 62 |
| Errores de generación o de servidor | 29 |
| Precisión excluyendo errores | 83,73 % (319 / 381) |
| Precisión contando los errores como incorrectos | 77,80 % (319 / 410) |

Desglose por dificultad:

| Dificultad | Superadas | Fallidas | Errores |
|---|---|---|---|
| Fácil | 138 | 7 | 2 |
| Media | 133 | 26 | 11 |
| Difícil | 48 | 29 | 16 |

Configuración de la evaluación: llama.cpp con backend Vulkan, modo de razonamiento de Qwen habilitado, `ngram-gate=1`, tres preguntas independientes en paralelo, `temperature=0.6`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=1.5`, `frequency_penalty=0.0`, `repeat_penalty=1.0`, semilla no fijada, tiempo de espera del checker de 10 segundos por caso de prueba y presupuesto de tokens de salida de 24.384, ampliado a 64.384 en la última parte reanudada.

Para contexto, la model card original de Qwen3.5-4B reporta 55,8 en LiveCodeBench v6. El autor advierte que este resultado es parcial, obtenido con una configuración de evaluación local personalizada y que, por tanto, no es directamente comparable con una puntuación completa de benchmark. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Peso en disco: 33,50 GB (31,20 GiB) para el GGUF publicado.
- VRAM estimada para inferencia: en torno a 34-40 GB si se carga todo el modelo en GPU con llama.cpp y una ventana de contexto moderada; el presupuesto exacto depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: A100 40 GB (ajustado), A6000 48 GB, H100 80 GB. También es viable el reparto entre dos GPU de 24 GB (por ejemplo, 2 × RTX 4090), configurando el split de capas en llama.cpp.
- ¿Cabe en GPU de consumo? No en una única GPU de consumo con 24 GB o menos. La alternativa es la carga por mmap desde RAM y disco, con una penalización severa de latencia.
- RAM del sistema: se recomienda un mínimo de 48 GB para poder mapear el fichero completo y evitar lecturas de disco constantes.
- Opciones de despliegue: llama.cpp es el entorno de referencia (se usó el backend Vulkan en la evaluación; los backends CUDA y Metal serían los habituales en producción). Debe tenerse en cuenta que el modelo requiere soporte para la configuración del puente n-gram (`ngram-gate`), por lo que es probable que necesite una compilación o versión concreta de llama.cpp. vLLM y TGI no están soportados según la información disponible, al tratarse de un GGUF con tensores personalizados. El uso con Ollama no está documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3 | ~55,57 B declarados en safetensors (backbone de 4B + tabla n-gram de ~51,2 B) | no disponible | 83,73 % parcial (319/381, excluyendo errores), 77,80 % contando errores | other (sin detalle) | GGUF en HuggingFace, 40 descargas, 0 likes |
| Qwen3.5-4B (original) | 4 B | no disponible | 55,8 según su model card oficial | no disponible en la información proporcionada | Modelo base oficial |
| Qwen 3.8 Flash-Next (origen de los componentes PLE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de la misma categoría (tamaño o tarea) en la información proporcionada, por lo que no es posible establecer una comparativa adicional fiable. El propio autor señala que, al tratarse de una ejecución parcial con configuración local personalizada, la comparación con la puntuación de Qwen3.5-4B no es directamente válida.

## Limitaciones y advertencias

- Artefacto de investigación experimental: el autor indica explícitamente que no es una versión oficial de Qwen ni una conversión de Qwen 3.8 en Qwen 3.5, y que presenta limitaciones conocidas de estabilidad de generación.
- Estabilidad de generación: en la evaluación parcial de LiveCodeBench v6 se registraron 29 errores de generación o de servidor sobre 410 intentos (aproximadamente un 7 %), lo que apunta a fallos de generación incompleta o caídas del servidor.
- Evaluación incompleta y no reproducible: solo se completaron 410 de 1.055 preguntas, con N=1, semilla no fijada y configuración local personalizada; el resultado no debe presentarse como una puntuación consolidada de benchmark.
- Resultados poco fiables en problemas difíciles: 48 superadas frente a 29 fallidas y 16 errores en la categoría difícil, con una tasa de error proporcionalmente mucho mayor que en las categorías fácil y media.
- Idiomas: únicamente inglés; no se declara soporte multilingüe.
- Licencia restrictiva o ambigua: la licencia es "other" y no se detalla su texto en la información disponible, por lo que no puede asumirse viabilidad de uso comercial sin consultar al autor.
- Dependencia de un runtime específico: requiere llama.cpp y, presumiblemente, una compilación con soporte para el puente n-gram (`ngram-gate`), lo que limita la portabilidad a otros servidores de inferencia.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento activado y la inyección de características externas no van acompañados de métricas de factualidad.
- Longitud de contexto: no documentada, lo que impide planificar despliegues que dependan de ventanas largas.
- Huella de memoria elevada: 33,5 GB de pesos y 55,57 mil millones de parámetros declarados, en su mayoría procedentes de una tabla de embeddings n-gram de gran tamaño, lo que encarece el despliegue y descarta GPU de consumo de 24 GB o menos.
- Contenido de la model card truncado en la información recibida: el documento se interrumpe durante el diagrama comparativo entre el puente de cuatro carriles y el enrutado PLE nativo, por lo que pueden existir secciones adicionales no consideradas aquí.

## Enlaces

- HuggingFace: https://huggingface.co/dburner/Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3
- Fichero de pesos: Qwen3.5-4B-Q8_0-FlashNgram-NativeBridgeV3-budget042-step2500-fixed.gguf (33,50 GB)
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.
