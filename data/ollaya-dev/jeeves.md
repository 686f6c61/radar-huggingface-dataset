# ollaya-dev/jeeves

## Resumen

ollaya-dev/jeeves es un paquete ONNX publicado por ollaya-dev que empaqueta el modelo de decisión PostHog/jeeves para el runtime de Ollaya. No contiene pesos propios: cada grafo es una exportación ONNX del modelo original cuyos pesos referencian por offset de bytes los archivos del repositorio upstream, de modo que `ollaya pull` descarga los pesos originales fijados a un commit y verifica su sha256. Se etiqueta como modelo de decisión ("decision-model"), de tipo "system-one", con pipeline de clasificación de texto.

El modelo subyacente combina un modelo base de la familia Qwen3.5 con una cabeza de puntero (pointer head) fusionada. La etiqueta `jeeves:9b` sugiere un tamaño del orden de 9.000 millones de parámetros, aunque la model card no confirma el dato de forma explícita. El grafo exportado es fp32 y se emplea tanto en CPU como en GPU. La propuesta es análoga a la de Ollama pero orientada a modelos de decisión: preguntas tipadas de entrada y respuestas calibradas de salida, tras una API compatible con TypeSafe.

La relevancia actual radica en su enfoque de distribución: separar los grafos de los pesos y verificar estos últimos por hash, lo que facilita auditoría y reproducibilidad. Sin embargo, el repositorio acumula 0 descargas y 0 "likes", no publica benchmarks formales ni una lista de idiomas soportados, y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5) con cabeza de puntero fusionada; grafo exportado a ONNX |
| Parametros totales | Aproximadamente 9B (segun la etiqueta `jeeves:9b`; no confirmado en la model card) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (unico formato de grafo indicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `9b/model-fp32.onnx`); los pesos se descargan del repositorio upstream en su formato original, no especificado |

## Arquitectura y entrenamiento

El repositorio no contiene pesos: almacena una exportación ONNX del modelo PostHog/jeeves, construido a partir de un modelo base de la familia Qwen3.5 (equipo Qwen) con pesos fusionados y una cabeza de puntero. El grafo fp32 se usa indistintamente en CPU y GPU. Cada etiqueta incluye además `decision.json` (disposición de secuencia y tokens especiales) y `calibration.json` (temperaturas de calibración), lo que indica que el modelo produce puntuaciones que se convierten en probabilidades calibradas.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El modo de operación es sin "thinking". La innovación técnica destacable es el mecanismo de distribución: los grafos ONNX referencian los archivos de pesos del autor original por offset de bytes, y el runtime Rust de Ollaya descarga esos pesos fijados a un commit y verifica su integridad mediante sha256. Se reporta una paridad estricta con el código original del autor (modelo Qwen3.5 y cabeza de puntero, fp32, sin thinking) sobre 430 preguntas de 107 peticiones en CUDA: filas de tokens y posiciones de opciones idénticas, las mismas 16 peticiones rechazadas, la misma decisión en todas las preguntas, puntuaciones dentro de 1,9e-4 y probabilidades dentro de 1,4e-5.

## Capacidades

- Clasificación de texto y toma de decisiones sobre preguntas tipadas, con respuestas calibradas.
- Salida probabilística: genera puntuaciones y probabilidades calibradas mediante temperaturas definidas en `calibration.json`.
- Modo "system-one": decisión directa, sin fase de razonamiento extendido ("no thinking").
- Ejecución local a través del runtime de Ollaya (`ollaya run jeeves`).
- API compatible con TypeSafe.
- Inferencia en CPU y GPU con el mismo grafo fp32.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Enrutamiento de peticiones: dado que el modelo responde preguntas tipadas con probabilidades calibradas, puede asignar cada entrada a una categoría o flujo concreto y exponer el nivel de confianza para decidir si se deriva a un humano.
- Clasificación con umbral de confianza: al estar calibrado, permite fijar umbrales de probabilidad reproducibles en pipelines de decisión automatizada sin recalibrar las salidas.
- Moderación o filtrado de contenido: la salida probabilística facilita separar casos claros de casos dudosos según un umbral configurable.
- Anotación y triaje en procesos de etiquetado: puede predecir la clase de cada ítem y ordenar por incertidumbre para que los revisores humanos prioricen los casos límite.
- Experimentación y análisis de producto: en el contexto de PostHog, un modelo de decisión de este tipo encaja en la evaluación de reglas o en la asignación de variantes con confianza medible.
- Validación de pipelines: su paridad documentada con el código original permite usarlo como referencia para verificar que un despliegue ONNX reproduce exactamente las decisiones del modelo fuente.
- Ejecución local en CPU: al disponer de un grafo fp32 y un runtime que descarga y verifica los pesos, puede desplegarse en entornos sin GPU para tareas de decisión de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento reportado es una prueba de paridad con el modelo original:

| Prueba | Condiciones | Resultado |
|---|---|---|
| Paridad con el código del autor | 430 preguntas de 107 peticiones, CUDA, fp32, sin thinking | Filas de tokens y posiciones de opciones idénticas; las mismas 16 peticiones rechazadas; misma decisión en todas las preguntas; puntuaciones dentro de 1,9e-4; probabilidades dentro de 1,4e-5 |

## Requisitos de hardware

- VRAM estimada para inferencia: con un tamaño del orden de 9B y grafo fp32, los pesos ocupan aproximadamente 36 GB, a lo que hay que sumar la memoria de activaciones y del contexto (no cuantificada en la información disponible).
- GPU recomendadas: no se especifican; por el volumen fp32, requiere GPU de gama alta tipo A100 o H100 para un despliegue cómodo.
- GPU de consumo: improbable que quepa en tarjetas de consumo convencionales en fp32 dado el tamaño de pesos; no hay opción de cuantización documentada que lo facilite.
- CPU: soportada explícitamente (el grafo fp32 se usa en CPU), aunque el rendimiento esperado será bajo.
- Opciones de despliegue: runtime de Ollaya (`ollaya run jeeves`); no se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida calibrada empaquetados para inferencia local). El único punto de referencia documentado es su propio modelo upstream:

| Modelo | Relacion | Licencia | Disponibilidad |
|---|---|---|---|
| PostHog/jeeves | Modelo original del que deriva la exportación ONNX | Apache-2.0 | HuggingFace (PostHog/jeeves) |
| ollaya-dev/jeeves | Exportación ONNX sin pesos, para el runtime de Ollaya | Apache-2.0 | HuggingFace (ollaya-dev/jeeves) |

Comparativas con alternativas de terceros: no disponibles.

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descargar los archivos del repositorio upstream (`PostHog/jeeves`) fijados a un commit concreto y verificar su sha256, lo que añade una dependencia externa al despliegue.
- Único formato documentado: fp32. No se ofrecen variantes cuantizadas, lo que limita el despliegue en hardware con poca memoria.
- Idiomas soportados: no disponibles; no hay confirmación de cobertura multilingüe.
- Longitud de contexto: no disponible, lo que dificulta dimensionar casos con entradas largas.
- Ausencia de benchmarks formales publicados; solo existe una prueba de paridad frente al modelo original.
- Repositorio con 0 descargas y 0 "likes": sin validación por parte de la comunidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: se trata de un modelo de decisión con salida calibrada, no de generación abierta; aun así, no se documentan tasas de error ni evaluación de fiabilidad.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo upstream (también Apache-2.0 según la model card) y del modelo base de Qwen.
- En producción, la calibración depende de los parámetros de temperatura incluidos en `calibration.json`; cualquier cambio de grafo o de versión de pesos puede alterar la calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/jeeves
- Modelo base en HuggingFace: https://huggingface.co/PostHog/jeeves
- Commit de pesos referenciado: https://huggingface.co/PostHog/jeeves/tree/8622b7d1652a9dcb8629486b84dce9e8d690c5cd
- Repositorio del runtime Ollaya: https://github.com/ollaya-dev/ollaya
