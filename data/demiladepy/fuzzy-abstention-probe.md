# demiladepy/fuzzy-abstention-probe

## Resumen

`fuzzy-abstention-probe` es una sonda lineal (linear probe) de 5 clases que se aplica sobre el flujo residual de la capa 20 del modelo `CohereLabs/tiny-aya-global`. No es un modelo generativo, sino un artefacto de clasificación ligero: predice la naturaleza epistémica de una pregunta a partir únicamente del prompt (el último token antes de la generación) y determina si el modelo subyacente debería responder, abstenerse, rechazar la premisa o solicitar contexto adicional.

El problema que aborda es concreto y medible: la confianza autodeclarada de `tiny-aya-global` está bien calibrada (ECE 0,018) cuando la pregunta tiene una única respuesta limpia, pero se degrada drásticamente (ECE 0,904) cuando la pregunta carece de respuesta clara. Su AUROC para predecir su propia corrección es de 0,557 [0,487; 0,625], con el valor de azar dentro del intervalo. La sonda demuestra que la información epistémica sí está presente en las activaciones internas, aunque el modelo no la exprese verbalmente.

El artefacto lo desarrolla el usuario demiladepy en el marco del Lexsi AI Safety and Alignment Hackathon (Track 2b, problema 13), bajo licencia cc-by-4.0 y con un tamaño de repositorio inferior a 0,1 GB. Su relevancia radica en que ofrece una vía práctica y barata para implementar políticas de abstención en producción sin modificar los pesos del modelo base ni recurrir a un juez externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal de 5 clases sobre el flujo residual de la capa 20 de un transformer (modelo base: CohereLabs/tiny-aya-global) |
| Parametros totales | No disponible (checkpoint `probe.pt`; cobertura estimada en `hidden_size` × 5 + sesgos, cifra exacta no publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No aplica (sonda lineal; los pesos se cargan en `torch.load`, tipicamente fp32) |
| Idiomas soportados | No disponible (el modelo base `tiny-aya-global` es multilingue, pero la sonda se evalua sobre 210 items sin desglose por idioma publicado) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `probe.pt` (torch checkpoint con claves `mu`, `sd`, `weight`, `bias`, `labels`) |

## Arquitectura y entrenamiento

La sonda es un clasificador lineal con normalización previa: dado el vector `h` del flujo residual de la capa 20 del último token del prompt (dimensión `hidden_size` del modelo base), se aplica `z = (h - mu) / sd` y posteriormente `probs = softmax(z @ W^T + b)`, con `W` de forma 5 × `hidden_size`. El artefacto incluye la media y desviación estándar del conjunto de entrenamiento para la estandarización, además de la lista de etiquetas de las cinco clases (`answerable_known`, `answerable_unknown`, `unanswerable`, `context_dependent`, `underspecified`).

El conjunto de calibración se compone de 210 items creados ad hoc y publicados en `demiladepy/fuzzy-abstention-items`. Se realiza validación cruzada de 5 pliegues con selección de la capa dentro de cada pliegue, obteniendo una precisión out-of-fold del 90,5 % (IC 95 %: 86,2–94,3 %) y macro-F1 de 0,906 frente a un azar del 20 %. El checkpoint publicado se reentrena con los 210 items para maximizar su utilidad desplegable, y el autor advierte explícitamente que su precisión de entrenamiento (1,000) no debe citarse como resultado. La sonda replica el 90,5 % bajo un preámbulo de sistema mínimo, lo que sugiere robustez ante variaciones de prompt.

## Capacidades

- Clasificación de la naturaleza epistémica de una pregunta en cinco categorías antes de generar cualquier token.
- Discriminación entre preguntas con respuesta conocida, respuesta de cola larga, pregunta sin respuesta, pregunta dependiente de contexto (jurisdicción, calendario, unidades, región, tiempo) y pregunta ambigua.
- Soporte de una política de tres acciones (responder, abstenerse, rechazar la premisa) o de cinco (incluyendo solicitar contexto o aclaración).
- Inferencia de muy bajo coste: una única pasada de atención por capa hasta la 20 y una multiplicación matricial 5 × `hidden_size`.
- Integración con el modelo base `tiny-aya-global` sin modificar sus pesos.
- Reproducibilidad bajo preámbulo de sistema mínimo (resultado estable a 90,5 %).

## Casos de uso

- Despacho condicional en pipelines RAG: antes de invocar un LLM generativo sobre una consulta del usuario, la sonda clasifica el prompt y, si la clase es `answerable_unknown` o `unanswerable`, el orquestador evita la llamada o la redirige a una respuesta de abstención. Reduce coste y alucinaciones.
- Filtro de preguntas trampa en atención al cliente: preguntas del tipo "¿cuándo caduca mi garantía?" se etiquetan como `context_dependent`, activando un formulario de aclaración (región o fecha de compra) en lugar de una respuesta especulativa.
- Moderación de asistentes médicos o legales: la clase `unanswerable` activa un rechazo de premisa previo a la generación, evitando que el modelo invente normativa o diagnósticos.
- Enrutado de consultas en buscadores internos: las consultas clasificadas como `underspecified` se reformulan automáticamente con preguntas de aclaración antes de tocar el índice vectorial.
- Evaluación de la calibración epistémica de modelos: la sonda sirve como oráculo proxy para medir si las respuestas del generador corresponden a preguntas de respuesta conocida o a consultas de cola larga, comparando contra la confianza autodeclarada reportada en la model card.
- Investigación sobre sondas de abstención: el código y el dataset asociados permiten replicar el protocolo de validación cruzada y probar variantes (capas alternativas, clasificadores no lineales) sobre modelos de la familia Aya.
- Despliegue en edge o entornos con GPUs pequeñas: al ser una sonda lineal, requiere únicamente ejecutar el backbone `tiny-aya-global` hasta la capa 20, sin coste adicional de un segundo modelo juez.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precision out-of-fold | 90,5 % [86,2 %, 94,3 %] | Validación cruzada de 5 pliegues, capa elegida dentro de cada pliegue |
| Macro-F1 | 0,906 | Mismo protocolo |
| Azar (5 clases) | 20 % | Línea base |
| AUROC como predictor de corrección (colapsado a escalar) | 0,556 | Comparable al autoinforme del modelo (0,557) |
| Autoinforme de confianza del modelo base (AUROC) | 0,557 [0,487, 0,625] | Publicado en la model card como referencia |
| ECE del autoinforme (preguntas con respuesta limpia) | 0,018 | Modelo base |
| ECE del autoinforme (preguntas sin respuesta limpia) | 0,904 | Modelo base |
| Estabilidad bajo preámbulo de sistema mínimo | 90,5 % [86,2 %, 94,3 %] | Replicación del resultado principal |

No se han publicado resultados comparativos con otras sondas de abstención en la información disponible. El autor señala explícitamente que la precisión de entrenamiento (1,000) no es un resultado.

## Requisitos de hardware

- VRAM para la sonda: despreciable (matriz de 5 × `hidden_size` y dos vectores de `hidden_size`; unos pocos MB).
- VRAM real: la determinada por el backbone `CohereLabs/tiny-aya-global`. Al tratarse de una sonda sobre la capa 20, solo se requiere ejecutar el modelo base hasta esa capa para el forward del prompt; el resto del modelo no es necesario para clasificar.
- GPU recomendadas: cualquier GPU con al menos la memoria suficiente para cargar `tiny-aya-global` en fp16 o bf16. El modelo base es de tamaño reducido (`tiny`), por lo que cabe en GPUs de consumo como RTX 3060/4060/4090 y en GPUs de datacenter (A10, L4, A100, H100) sin problemas.
- Opciones de despliegue: al ser un checkpoint PyTorch (`probe.pt`), se integra en scripts Python con `torch.load`. No está empaquetado para vLLM, llama.cpp, Ollama ni TGI; el uso previsto es como post-procesado o pre-filtro en un pipeline propio junto a una instancia del modelo base.
- Latencia y throughput: no publicados. Al consistir en una pasada parcial del backbone más una multiplicación matricial 5 × `hidden_size`, el coste dominante es el propio forward del modelo base hasta la capa 20.

## Comparativa con modelos similares

| Modelo | Tipo | Clases / tarea | Métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fuzzy-abstention-probe | Sonda lineal (5 clases) sobre tiny-aya-global | Clasificación epistémica del prompt | 90,5 % acc; macro-F1 0,906; AUROC 0,556 | cc-by-4.0 | Hugging Face + dataset + demo + código |
| Autoinforme de confianza de tiny-aya-global | Verbalización del propio modelo | Predicción de corrección (escalar) | AUROC 0,557 [0,487, 0,625]; ECE hasta 0,904 | La del modelo base | Incluido en el modelo |
| Sondas de abstención genéricas | Sondas lineales o MLP sobre activaciones | Binaria (abstenerse / responder) | No disponible en esta búsqueda | Variable | Requiere implementación propia |

La comparativa directa con sondas de terceros no está disponible en la información proporcionada. El punto clave documentado por el propio autor es que, colapsada a un escalar, la sonda no supera al autoinforme del modelo (AUROC 0,556 frente a 0,557); su ventaja proviene de ser multiclase y de habilitar una política de tres acciones, no de mejorar la AUROC.

## Limitaciones y advertencias

- La sonda está calibrada para el backbone `CohereLabs/tiny-aya-global`; no es transferible a otros modelos sin reentrenamiento.
- El conjunto de calibración tiene solo 210 items, lo que limita la cobertura de dominios y estilos de prompt. Los intervalos de confianza de las métricas son amplios (±4 puntos en precisión).
- El checkpoint publicado se entrena sobre todos los items, por lo que su precisión de entrenamiento (1,000) es un dato de sobreajuste y no debe citarse como evidencia de rendimiento.
- La sonda se evalúa sobre el último token del prompt en la capa 20; variaciones en el template, el preámbulo o el idioma del prompt no se han desglosado y podrían alterar la precisión.
- Los idiomas cubiertos por la sonda no se especifican en la model card; el modelo base es multilingüe, pero no hay métricas por idioma.
- Riesgo de falsos negativos en la clase `unanswerable`: una pregunta trampa clasificada erróneamente como `answerable_known` desactiva la abstención y permite que el generador produzca una respuesta alucinada.
- No sustituye a la verificación factual ni a la moderación de contenido; solo aporta una señal epistémica sobre la forma del prompt.
- Uso comercial permitido por la licencia cc-by-4.0, pero conviene verificar la licencia del modelo base `tiny-aya-global` y la de los datos de entrenamiento (210 items ad hoc) por si impusieran restricciones adicionales.
- Proyecto de hackathon con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demiladepy/fuzzy-abstention-probe
- Dataset de evaluación: https://huggingface.co/datasets/demiladepy/fuzzy-abstention-items
- Demo (Space): https://huggingface.co/spaces/demiladepy/fuzzy-abstention
- Código: https://github.com/Demiladepy/fuzzy-abstention
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
