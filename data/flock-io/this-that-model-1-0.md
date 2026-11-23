# flock-io/this-that-model-1.0

## Resumen

this-that-model-1.0 es un modelo de decisión tipada desarrollado por flock-io. No es un modelo generativo al uso: no produce texto libre ni requiere bucle de decodificación, parser ni reintentos. Dado un estado de entrada y una pregunta con un conjunto cerrado de opciones declaradas, devuelve el índice de la opción elegida junto con una distribución de probabilidad calibrada sobre exactamente esas opciones, en una sola pasada forward y generando cero tokens de salida.

El modelo tiene 1.880 millones de parámetros y emplea una arquitectura híbrida de estilo Qwen3.5: 18 de sus 24 capas usan DeltaNet (atención lineal) y las 6 restantes usan atención completa. Está construido sobre el modelo base `decider-2b` y se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en el nicho que ocupa: sustituye llamadas a LLM frontier con prompts estructurados y parseo frágil por una inferencia determinista de ~31 ms en GPU de consumo, con una distribución cuya masa está restringida por construcción al conjunto de opciones. Según los datos publicados por el autor, supera en precisión y calibración a varios modelos frontier en su benchmark de decisión, a un coste por pasada de un orden de magnitud inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido estilo Qwen3.5 (18/24 capas DeltaNet de atención lineal, 6 capas de atención completa) |
| Parametros totales | 1.881.825.088 (1.88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona carga en float16 en Apple Silicon vía MPS) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | decider-2b |
| Pipeline | text-classification |
| Opciones por decisión | Hasta 255 |
| Tamaño del repositorio | 7.5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 24 capas en el que 18 capas emplean DeltaNet, un mecanismo de atención lineal, y 6 capas mantienen atención completa. Esta combinación reduce el coste computacional y de memoria frente a un transformer denso de atención completa, lo que explica la latencia de ~31 ms por pregunta reportada en GPU de consumo. El modelo deriva del base `decider-2b` y se distribuye como pesos safetensors compatibles con la librería `transformers`, aunque la inferencia recomendada usa el paquete propio `thisthat`.

El mecanismo de decisión no genera tokens: lee el estado oculto en una posición designada y lo puntúa contra los tokens de etiqueta de las opciones declaradas, normalizando el softmax sobre exactamente ese conjunto. Formalmente, p_k(j|x) = softmax_j(⟨w_ℓ(k,j), h_k⟩ / τ). El soporte de la distribución es, por tanto, la lista de opciones del usuario: una respuesta fuera de ella es irrepresentable, no improbable. Hasta 255 opciones son soportadas; con diez o menos se usa un renderizado (A)…(J) y con conjuntos mayores se pasa a etiquetas de un solo token. Varias preguntas sobre un mismo estado se responden en la misma pasada forward, ya que las decisiones son condicionalmente independientes dada la entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El único dataset citado es `limberc/this-that-spatial-bench`, empleado como benchmark de evaluación. La calibración de las probabilidades se presenta como una propiedad entrenada y verificable, no como un subproducto del softmax.

## Capacidades

- Decisión tipada sobre conjuntos cerrados de opciones: devuelve índice, etiqueta y distribución de probabilidad normalizada sobre las opciones declaradas.
- Calibración de confianza: la probabilidad devuelta es calibrada, de modo que umbrales como 0.8 tienen significado operativo y permiten ramas de escalado.
- Múltiples preguntas por pasada: varias decisiones sobre un mismo estado se resuelven en una sola inferencia forward.
- Hasta 255 opciones por pregunta, con dos modos de renderizado según el tamaño del conjunto.
- Detección de incertidumbre fuera de distribución: el modelo reporta baja confianza ante entradas alejadas de su distribución de entrenamiento en lugar de responder con seguridad.
- Ejecución en CUDA, MPS y CPU, con selección automática de MPS y carga en float16 en Apple Silicon.
- No soporta generación de texto libre, tool calling, agentes multi-paso, visión, audio ni razonamiento encadenado: su única salida es la decisión tipada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de comandos shell en pipelines de automatización: dado un comando y una pregunta sobre su seguridad, el modelo devuelve "seguro", "modifica o borra datos" o "contacta la red" con probabilidad calibrada; si la confianza baja de un umbral, el comando se escala a revisión humana. Adecuado por su latencia de ~31 ms y por la garantía de que la salida pertenece al conjunto declarado.
- Enrutado de tickets y solicitudes: clasificar cada entrada en colas predefinidas (estándar, prioridad, revisión manual) en la misma pasada que otras preguntas sobre el mismo ticket, sin coste adicional por pregunta.
- Evaluación de políticas de reembolso y cumplimiento: decidir si una solicitud está dentro de la ventana de reembolso o de la política vigente, con la probabilidad como señal para escalar casos límite.
- Rate limiting y control de acceso: decidir si una petición debe limitarse a partir de un estado estructurado (usuario, tier, contador). La documentación advierte explícitamente que en estados fuera de distribución el modelo puede equivocarse con confianza moderada, por lo que debe combinarse con reglas deterministas para casos extremos.
- Clasificación de riesgo en bandas discretas: asignar bandas bajo, medio o alto a transacciones o eventos, usando la distribución completa en lugar de una etiqueta única para alimentar lógica de escalado.
- Sustitución de llamadas a LLM en bucles de decisión de alta frecuencia: donde el coste por pasada de un modelo frontier o de un servicio comercial es prohibitivo, este modelo ofrece una pasada de ~31 ms a coste de electricidad (~80 W a 0.30 $/kWh, según el autor).
- Pre-filtrado en pipelines de agentes: usar el modelo como primera etapa barata que resuelve decisiones triviales y solo escala a un LLM generativo las que quedan por debajo del umbral de confianza.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 68 preguntas y 17 estados registrados por un tercero, con formulación distinta a la de entrenamiento (mide transferencia, no recall):

| Sistema | Precisión | Brier ↓ | NLL ↓ | ms/pregunta | Coste de una pasada |
|---|---:|---:|---:|---:|---:|
| baseline clase mayoritaria | 0.647 | — | — | — | — |
| claude-fable-5-1 | 0.676 | — | — | 2395 | 0.471 $ |
| glm-5.3 | 0.721 | 0.204 | 0.601 | 819 | 0.008 $ |
| qwen3.8-max | 0.735 | 0.263 | 2.681 | 1014 | 0.021 $ |
| NanoJev-0.6B | 0.750 | 0.166 | 0.479 | — | — |
| Jev (servicio comercial) | 0.765 | 0.133 | 0.403 | — | — |
| kimi-k3 | 0.779 | 0.143 | 0.430 | 989 | 0.009 $ |
| deepseek-v4.1-flash | 0.794 | — | — | 808 | 0.002 $ |
| gpt-5.6 | 0.926 | — | — | 1180 | 0.018 $ |
| this-that-model-1.0 | 0.941 | 0.042 | 0.126 | 30.9 | 0.000014 $ |

Un guion en Brier y NLL indica que el endpoint no expone probabilidades de token, no que el resultado sea malo. El autor advierte que su coste es electricidad y no precio de servicio, por lo que la distancia en coste debe leerse como un orden de magnitud.

Evaluación de calibración con respuesta verdadera computada (actuador ruidoso con probabilidad ρ de ejecutar el movimiento previsto):

| Sistema | Precisión | qL2 ↓ |
|---|---:|---:|
| techo de precisión (calculado) | 0.746 | — |
| predictor constante | — | 0.0962 |
| this-that-model-1.0 | 0.750 | 0.0250 |

De nueve modelos frontier medidos en las mismas preguntas, solo tres exponen probabilidades de token, y los tres puntúan peor que el predictor constante en qL2, según el autor.

## Requisitos de hardware

- VRAM estimada: no publicada de forma explícita. Con 1.88 B de parámetros, en float16 serían aproximadamente 3.8 GB de pesos; en float32, unos 7.5 GB (coincide con el tamaño del repositorio). El repo ocupa 7.5 GB.
- GPU recomendadas: no se especifican modelos concretos. El autor reporta ~31 ms por pregunta en "una GPU de consumo" y el paquete soporta CUDA, MPS y CPU.
- Compatibilidad con GPU de consumo: sí, por tamaño (1.88 B) cabe en GPU de consumo con al menos ~4 GB de VRAM en float16; no se detallan modelos concretos.
- Despliegue: paquete propio `thisthat` instalable desde GitHub (`pip install git+https://github.com/FLock-io/this-that-model`); pesos en safetensors compatibles con `transformers`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 30.9 ms por pregunta (mediana en cliente) en la GPU de referencia del autor; 2395 ms para claude-fable-5-1 y 808–1180 ms para los demás sistemas comparados en la misma tabla.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (bench del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| this-that-model-1.0 | 1.88 B | no disponible | 0.941 | MIT | Hugging Face, pesos abiertos |
| NanoJev-0.6B | 0.6 B | no disponible | 0.750 | no disponible | no disponible |
| Jev (servicio) | no disponible | no disponible | 0.765 | propietaria | servicio comercial alojado |
| gpt-5.6 | no disponible | no disponible | 0.926 | propietaria | API |
| glm-5.3 | no disponible | no disponible | 0.721 | no disponible | API |

La comparación con LLM generativos (gpt-5.6, glm-5.3, deepseek-v4.1-flash, claude-fable-5-1) es asimétrica: estos resuelven la tarea mediante generación de texto y parseo, con latencias de 808–2395 ms y costes por pasada entre dos y cuatro órdenes de magnitud superiores según la tabla del autor. El competidor más directo en concepto es Jev, un servicio comercial de decisión alojado, y NanoJev-0.6B, del que no se dispone de ficha pública en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo resuelve decisiones sobre conjuntos de opciones declarados; no genera texto, código ni razonamiento libre.
- Solo inglés: el modelo está entrenado y evaluado en inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo en entradas fuera de distribución: el propio autor documenta un caso en el que el modelo responde "no (71%)" a una pregunta de rate limiting con 847 peticiones por minuto, respuesta incorrecta con confianza moderada. La rama de escalado por umbral es necesaria, no opcional.
- Longitud de contexto no publicada: no se puede planificar su uso con estados de entrada largos sin verificación empírica.
- Sin datos de sesgo: no se han publicado evaluaciones de sesgo, toxicidad ni equidad.
- Calibración dependiente de la distribución de entrenamiento: los resultados de calibración del autor corresponden a su benchmark; no hay garantía de que se mantenga en dominios distintos.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no hay garantías ni soporte del autor.
- Madurez temprana: 403 descargas y 18 likes en el momento de la consulta; creado en septiembre de 2026, sin historial de versiones.
- Dependencia de un paquete de inferencia propio (`thisthat`) instalado desde GitHub, no desde PyPI, lo que añade riesgo de cadena de suministro en producción.
- Los benchmarks publicados han sido generados por el propio autor; no se han localizado evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flock-io/this-that-model-1.0
- Repositorio de inferencia: https://github.com/FLock-io/this-that-model
- Dataset de benchmark: https://huggingface.co/datasets/limberc/this-that-spatial-bench
