# run-saina/saina-helm-2-0.8b

## Resumen

Saina Helm 2 0.8B es un modelo de decisión de pequeño tamaño desarrollado por run-saina. No genera texto: recibe un estado (state) y un conjunto de preguntas tipadas (sí/no, elección única, elección múltiple o valoración) y devuelve una probabilidad para cada respuesta posible. Las opciones se suministran en tiempo de inferencia, de modo que un mismo checkpoint sirve para enrutado de intención, triaje, selección de herramientas o listas de verificación sin reentrenamiento.

El modelo es un finetune de Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros totales (unos 0.85B) y licencia Apache 2.0. La novedad principal de la versión Helm 2 es que todas las preguntas de una petición se responden en una única pasada sobre el estado compartido, en lugar de una pasada por pregunta, y que la cabeza de lectura incorpora pequeñas cabezas expertas con enrutado (de ahí la etiqueta mixture-of-experts). Mantiene la longitud de contexto del modelo base, 262.144 tokens, que se aplica por defecto.

Es relevante porque cubre un nicho poco atendido: decisiones estructuradas y auditables con un modelo sub-1B, ejecutable en una sola GPU de consumo si se limita la longitud de entrada, y con un modo de decisión que permite abstenerse y escalar cuando la confianza es baja. Su uso previsto excluye explícitamente la generación de texto, las decisiones finales sin revisión sobre personas, el filtrado de seguridad y la entrada en idiomas distintos del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-0.8B, con cabezas expertas enrutadas en la lectura (etiqueta mixture-of-experts); detalle interno de capas no disponible |
| Parametros totales | 852.985.920 (aprox. 0.85B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite del modelo base, usado por defecto); configurable con `max_length` |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | Inglés mayoritariamente; material no inglés limitado y sin evaluar (el autor declara fuera de alcance la entrada no inglesa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-0.8B mediante finetune (`base_model_relation: finetune`) y se distribuye con la librería `saina`, que construye el prompt exacto con el que se entrenó y aplica la cabeza entrenada. La función del modelo no es autoregresiva: dado un `state` compartido, produce puntuaciones para las opciones suministradas en la petición, con cuatro tipos de pregunta soportados (sí/no, elección única con 2 a 255 opciones, elección múltiple con 2 a 255 opciones y valoración con 2 a 10 niveles ordenados). Helm 2 responde todas las preguntas de una petición en una sola pasada hacia delante sobre el estado compartido, frente al esquema de una pasada por pregunta de la versión anterior, y añade pequeñas cabezas expertas enrutadas en la fase de lectura.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor indica únicamente que los datos de entrenamiento son mayoritariamente en inglés, con material no inglés limitado, y que todas las evaluaciones reportadas son en inglés. Como detalles de implementación, las puntuaciones dependen del formato exacto del prompt construido por el paquete `saina`, por lo que se desaconseja usar un prompt propio o `generate()`; se requiere `saina` 0.3 o superior (versión 0.3.2 o posterior para instalación local), y las versiones antiguas rechazan este checkpoint. Instalar `flash-linear-attention` y `causal-conv1d` habilita kernels más rápidos, lo que apunta a componentes de atención lineal y convolución causal en el modelo base, aunque el detalle no se confirma en la información disponible.

## Capacidades

- Clasificación y puntuación de opciones: devuelve probabilidades por respuesta, no texto generado.
- Preguntas de sí/no con descripciones opcionales para cada respuesta, devolviendo `yes`, `no` y `confidence`.
- Elección única entre 2 y 255 opciones, con `probabilities`, `selection` y `confidence`.
- Elección múltiple entre 2 y 255 opciones, con pertenencias independientes por opción.
- Valoración en escala ordenada de 2 a 10 niveles, con `probabilities`, `expected_level` y `confidence`.
- Modo decisión (`mode='decision'`) con umbral configurable (0.8 por defecto) y `min_margin` opcional para sí/no y elección única; permite abstenerse y devolver `None` con motivo (`below_threshold`, `below_margin`, `tie`).
- Selección de herramientas y enrutado de intención (evaluado en BFCL y API-Bank tool selection).
- Procesamiento de contratos y clasificación de documentos (evaluado en ContractNLI).
- Clasificación de intenciones en dominio bancario (evaluado en BANKING77).
- Enrutado entre modelos o rutas (evaluado en RouterBench).
- Multi-pregunta en una sola pasada sobre un estado compartido, con pooling de decisiones en una única llamada.
- Idiomas: inglés; otras lenguas no están evaluadas y quedan fuera del alcance declarado.
- No soporta tool calling generativo, ni agentes multi-paso con texto, ni visión, ni audio, ni generación de código.

## Casos de uso

- Enrutado de intención en asistentes: dada la consulta del usuario como `state` y una pregunta de elección única con las intenciones disponibles como opciones, el modelo devuelve la probabilidad de cada una; al estar las opciones en la petición, se pueden cambiar las rutas sin reentrenar.
- Triaje de tickets de soporte: con el texto del ticket como estado y preguntas de tipo valoración (por ejemplo, urgencia en cuatro niveles) y elección única (equipo responsable), se obtiene una priorización automática; con `mode='decision'` los casos dudosos se escalan a revisión humana.
- Selección de herramientas en pipelines de agentes: dado el contexto de la tarea y la lista de herramientas disponibles, el modelo puntúa cada opción y permite cortocircuitar la selección antes de invocar un LLM mayor, reduciendo coste y latencia.
- Listas de verificación de revisión: sobre un documento o una solicitud, preguntas de sí/no y de elección múltiple comprueban requisitos obligatorios (campos presentes, cláusulas exigidas) y devuelven pertenencias independientes por criterio.
- Analítica de contratos: ContractNLI mide la inferencia de relaciones entre cláusulas y textos de política; el modelo puntúa hipótesis sobre un contrato dado, con 83,3 de macro-F1 según la evaluación del autor.
- Clasificación de intenciones bancarias: BANKING77 (80,3 de macro-F1) respalda su uso para etiquetar consultas de clientes en categorías predefinidas dentro de un sistema de atención.
- Enrutado entre modelos de distinta capacidad o coste: RouterBench evalúa la elección de la mejor ruta de inferencia con 75,9 de calidad seleccionada.
- Preanotación para etiquetado humano: el modelo propone etiquetas con confianza y umbrales, y el equipo humano solo revisa los casos con baja confianza o margen insuficiente, acelerando la creación de datasets propios.

## Benchmarks y rendimiento

Resultados de la ejecución sobre Decision Index para este checkpoint (revisión `63dfcafd`), cada benchmark puntuado sobre su conjunto completo. El rango se calcula entre los siete modelos comparados (jiwo 0.8B, Dinah-0, Sifr 0.8B, Bekko 400M, OneJev 0.8B, Eos 0.8B y este modelo). La ejecución sigue en curso, por lo que las filas se añaden a medida que termina cada benchmark.

| Benchmark | Metrica | Resultado | Rango | Mejor de los otros |
|---|---|---|---|---|
| BFCL | case exact | 88.0 | 1.º | Sifr 0.8B 79.6 |
| ContractNLI | macro-F1 | 83.3 | 1.º | jiwo 0.8B 79.0 |
| BANKING77 | macro-F1 | 80.3 | 2.º | Dinah-0 89.1 |
| RouterBench | selected quality | 75.9 | 2.º | Eos 0.8B 76.5 |
| API-Bank tool selection | accuracy | 63.2 | 2.º | OneJev 0.8B 66.5 |
| cfcolor | accuracy | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- Memoria de GPU: el consumo crece con la longitud de entrada, ya que cada petición es una única pasada hacia delante sobre todo el contexto. Medición del autor: aproximadamente 3,2 GiB a 15K tokens y 7,9 GiB a 58K tokens en una RTX 3090, lo que equivale a unos 0,11 GiB por cada 1K tokens.
- La ventana completa de 262.144 tokens requiere del orden de 30 GiB, por encima de una GPU de consumo; con `max_length` se puede servir un límite ajustado al hardware disponible.
- Cabe en GPU de consumo: sí, con límites de contexto moderados. Los datos medidos corresponden a una RTX 3090; no hay mediciones publicadas para otras GPU.
- GPU recomendadas: no disponible de forma explícita. Por consumo de memoria, una RTX 3090 o superior (RTX 4090, A100, H100) permite ventanas más largas; las 30 GiB de la ventana completa apuntan a A100 40/80 GB o H100.
- El tamaño del repositorio es de 1,7 GB, coherente con los 852 millones de parámetros en safetensors.
- Despliegue: paquete `saina` (extras `local` y `server`), que ejecuta también un servidor HTTP autenticado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el autor advierte contra usar `generate()` o prompts propios, ya que las puntuaciones dependen del prompt entrenado.
- Kernels opcionales: `flash-linear-attention` y `causal-conv1d` habilitan kernels más rápidos.
- Latencia y throughput: no disponibles. Solo se documenta la memoria, no los tiempos.
- Entradas más largas que el límite configurado se rechazan, nunca se truncan.

## Comparativa con modelos similares

Comparación con los modelos sub-1B evaluados en el mismo conjunto Decision Index. Los parámetros se deducen de sus nombres cuando el dato está indicado; el resto de especificaciones no está disponible en la información proporcionada.

| Modelo | Parametros | BFCL (case exact) | ContractNLI (macro-F1) | BANKING77 (macro-F1) | RouterBench (selected quality) | API-Bank tool selection (accuracy) |
|---|---|---|---|---|---|---|
| Saina Helm 2 0.8B | 852.985.920 | 88.0 | 83.3 | 80.3 | 75.9 | 63.2 |
| Sifr 0.8B | 0.8B (por nombre) | 79.6 | no disponible | no disponible | no disponible | no disponible |
| jiwo 0.8B | 0.8B (por nombre) | no disponible | 79.0 | no disponible | no disponible | no disponible |
| Dinah-0 | no disponible | no disponible | no disponible | 89.1 | no disponible | no disponible |
| Eos 0.8B | 0.8B (por nombre) | no disponible | no disponible | no disponible | 76.5 | no disponible |
| OneJev 0.8B | 0.8B (por nombre) | no disponible | no disponible | no disponible | no disponible | 66.5 |
| Bekko 400M | 400M (por nombre) | no disponible | no disponible | no disponible | no disponible | no disponible |

Contexto, licencia y disponibilidad de los modelos comparados: no disponibles. Saina Helm 2 destaca en BFCL y ContractNLI, queda segundo en BANKING77, RouterBench y selección de herramientas de API-Bank, y no hay datos publicados de los competidores en varias de esas columnas, por lo que la comparación es parcial.

## Limitaciones y advertencias

- No genera texto: solo puntúa las opciones que se le proporcionan. Cualquier expectativa de generación, resumen o respuesta libre queda fuera de su función.
- Uso fuera de alcance declarado por el autor: decisiones finales sin revisión con consecuencias materiales para personas (crédito, empleo, ámbito médico o legal), incluso con confianza alta.
- Prohibido en la práctica por diseño para clasificar personas: atributos personales, demografía o cualquier dato usado para perfilar individuos.
- No es un modelo de seguridad: no está entrenado ni evaluado para filtrado de contenido, detección de daño o moderación.
- Idioma: los datos de entrenamiento son mayoritariamente en inglés, con material no inglés limitado, y todas las evaluaciones reportadas son en inglés; otros idiomas no están probados y quedan fuera de alcance.
- Inyección de prompt: el modelo puntúa el `state` que recibe, por lo que contenido malicioso dentro del estado puede orientar sus respuestas. Debe acotarse la autoridad concedida a la salida.
- Dependencia de formato: las puntuaciones dependen del prompt exacto construido por `saina`; usar prompts propios o `generate()` degrada o invalida el resultado. Se requiere `saina` 0.3 o superior y fijar la revisión del checkpoint con `revision`.
- Alucinación: no aplica en el sentido generativo, pero sí el riesgo de calibración incorrecta; el autor recomienda validar con datos etiquetados propios y para el propio espacio de etiquetas antes de usarlo.
- Memoria: no hay truncado; las entradas que exceden el límite configurado se rechazan, lo que puede romper flujos si no se controla la longitud de entrada.
- Coste de contexto: la ventana completa de 262K exige del orden de 30 GiB, fuera del alcance de GPU de consumo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones comerciales: la licencia Apache 2.0 permite uso comercial, pero las limitaciones de uso previsto descritas arriba siguen siendo responsabilidad del integrador.
- Madurez: el modelo tiene 0 descargas y 0 me gusta en el momento de la consulta, y su ejecución de benchmarks está en curso; algunas filas de evaluación aún no están publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/run-saina/saina-helm-2-0.8b
- Modelo anterior (Saina Helm 0.8B): https://huggingface.co/run-saina/saina-helm-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- Repositorio del autor: https://github.com/run-saina/saina
- Arnés reproducible de evaluación (Decision Index): https://github.com/run-saina/saina-decision-index
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a tiendas y juegos sin relación.
