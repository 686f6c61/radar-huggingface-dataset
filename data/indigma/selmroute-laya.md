# Indigma/SeLMRoute-Laya

## Resumen

SeLMRoute-Laya es un router de despliegue basado en CatBoost que predice el rendimiento de 20 LLM candidatos a partir de 40 características semánticas probabilísticas extraídas con Laya. No es un modelo generativo: no produce texto, no razona y no invoca a los modelos candidatos, sino que asigna una puntuación de rendimiento a cada uno para que una política de enrutado los ordene. Lo publica Indigma bajo licencia Apache 2.0.

El pipeline completo es: consulta → evidencia semántica de Laya → vector ProbabilityMass de 40 dimensiones → 20 puntuaciones predichas → ranking de candidatos. Técnicamente es un `CatBoostRegressor` con objetivo `MultiRMSE` que consume características numéricas, nunca texto crudo. La entrada se construye con 8 probabilidades binarias y 8 distribuciones ordinales de cuatro niveles (8 + 8 × 4 = 40 valores).

Su interés actual está en que hace explícita la representación usada para enrutar: 16 juicios semánticos interpretables y tipados en lugar de embeddings opacos o clústeres de ejemplos similares, que es el enfoque dominante en la literatura previa de model routing. El repositorio de HuggingFace ocupa 0,0 GB y registraba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (CatBoost), objetivo MultiRMSE; no es un transformer ni una red neuronal |
| Parámetros totales | no disponible (no se publica número de árboles, profundidad ni número de hojas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es un vector fijo de 40 características numéricas; el modelo no procesa texto) |
| Tipos de cuantización | no aplica (modelo de árboles; el checkpoint se distribuye como binario CatBoost) |
| Idiomas soportados | no disponible (no consume texto; heredaría las capacidades del extractor Laya, no documentadas en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.cbm` (checkpoint binario de CatBoost) acompañado de `metadata.json` |
| Librería | catboost |
| Tarea | Regresión multi-salida: 20 puntuaciones de rendimiento, una por modelo candidato |
| Dimensión de entrada | 40 características numéricas, en orden fijo |
| Modelos candidatos | 20 |
| Ficheros del repositorio | `model.cbm`, `metadata.json`, `inference.py`, `requirements.txt`, `LICENSE`, `NOTICE`, `CITATION.cff` |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-10-01 |

## Arquitectura y entrenamiento

El checkpoint es un `CatBoostRegressor` entrenado con el objetivo `MultiRMSE`, que permite regresión multi-objetivo prediciendo simultáneamente las 20 puntuaciones de los modelos candidatos. La entrada es un vector ProbabilityMass de 40 dimensiones que codifica 16 juicios semánticos sobre la consulta: 8 probabilidades binarias (columnas con sufijo `__noul`) y 8 distribuciones de cuatro niveles (columnas `__p__0` a `__p__3`). Entre las sondas binarias documentadas están `math_reasoning`, `code_reasoning`, `formal_logic`, `factual_recall`, `social_affective`, `tool_interaction`, `external_knowledge` y `current_information`; entre las ordinales solo se detallan `domain_specialization` y `reasoning_depth`, ya que la model card disponible aparece truncada en ese punto. La sonda diagnóstica `task_family` y las columnas auxiliares quedan excluidas de la entrada del checkpoint.

Las características se extraen con Laya, un modelo separado que devuelve decisiones acotadas con respuesta estructurada y probabilidades. Los datos de entrenamiento proceden del dataset `Indigma-Innovations/SeLMRoute-Semantic-Features` y la evaluación del benchmark `NPULH/LLMRouterBench`. No se especifican en la información disponible el número de muestras de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF o DPO (técnicas no aplicables a un modelo de árboles, en cualquier caso). Los hiperparámetros de entrenamiento se almacenan en `metadata.json`, pero no se detallan en la model card. La innovación técnica destacable es el estado semántico probabilístico tipado como representación explícita e interpretable para el enrutado, en contraste con routers que aprenden directamente de embeddings de consulta, representaciones internas del modelo o clústeres de ejemplos similares.

## Capacidades

- Predicción de rendimiento: genera 20 puntuaciones de regresión, una por cada LLM candidato, ordenables para enrutado orientado a rendimiento.
- Enrutado multi-modelo: selecciona el candidato con mayor puntuación predicha mediante ranking descendente.
- Representación interpretable: expone 16 juicios semánticos sobre la consulta (matemáticas, código, lógica formal, recuperación factual, afecto social, uso de herramientas, conocimiento externo, información temporal, especialización de dominio y profundidad de razonamiento, entre otros).
- Extracción de características en vivo: permite procesar consultas nuevas extrayendo el mismo esquema semántico con Laya, mediante la dependencia opcional `live-laya` y `laya==0.3.5`.
- Integración en pipelines numéricos: consume y produce arrays de NumPy/Pandas, lo que facilita su inserción en servicios de enrutado existentes.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso propio ni capacidades de visión o audio.
- No invoca al LLM seleccionado ni gestiona la conversación: esa responsabilidad queda fuera del modelo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Pasarela de enrutado multi-LLM en producción: dado un gateway que expone 20 modelos de distintos proveedores, el router puntúa cada consulta entrante y deriva la petición al candidato con mayor rendimiento esperado, sin necesidad de invocar previamente a ningún modelo.
- Optimización de coste por consulta: las consultas clasificadas con baja profundidad de razonamiento y sin necesidad de conocimiento externo pueden enviarse a modelos pequeños y baratos, reservando los grandes para consultas con `reasoning_depth` alto o `domain_specialization` elevada.
- Enrutado consciente de herramientas: la sonda `tool_interaction` permite detectar consultas que exigen interacción con API o entorno y dirigirlas a modelos con soporte robusto de function calling.
- Enrutado consciente de información temporal: la sonda `current_information` identifica consultas sensibles al tiempo, que pueden derivarse hacia modelos con acceso a búsqueda web o datos actualizados.
- Auditoría y depuración de políticas de enrutado: al ser un modelo de árboles sobre 16 juicios explícitos, es posible inspeccionar qué características están empujando la decisión, algo inviable con routers basados en embeddings.
- Investigación reproducible en model routing: el repositorio incluye `inference.py`, features congeladas y `metadata.json`, lo que permite replicar el experimento del paper y comparar extractores semánticos alternativos manteniendo fijo el predictor.
- Mecanismo de abstención o escalado: si las 20 puntuaciones son bajas o están muy igualadas, el sistema puede marcar la consulta para revisión humana o para un modelo de gama alta fuera del conjunto de candidatos.
- Enrutado por especialidad de dominio: combinando `domain_specialization` con las puntuaciones predichas, se puede construir una política que asigne consultas legales, médicas o financieras a los modelos que rinden mejor en esos dominios.

## Benchmarks y rendimiento

| Benchmark | Modelo / configuración | Métrica | Resultado |
|---|---|---|---|
| LLMRouterBench | SeLMRoute (método del paper) | AvgAcc | 72,64 % |
| LLMRouterBench | Mejor modelo fijo (baseline) | AvgAcc | 69,23 % |

Los datos anteriores corresponden al método SeLMRoute descrito en el paper, según el resumen disponible. No se han publicado resultados de benchmarks específicos para el checkpoint `Indigma/SeLMRoute-Laya` en la información disponible, ni métricas de calibración, latencia o comparación contra routers basados en embeddings.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. CatBoost es un modelo de árboles y la inferencia se ejecuta en CPU; no requiere GPU.
- GPU recomendadas: no aplica. CatBoost puede usar GPU para entrenamiento o predicción, pero no es necesario para este checkpoint.
- Cabe en GPU de consumo: sí, pero es irrelevante porque no necesita GPU; se ejecuta en cualquier portátil convencional con CPU moderna.
- RAM estimada: el repositorio ocupa 0,0 GB, por lo que el checkpoint es de tamaño reducido; la cifra exacta de memoria residente no está disponible.
- Opciones de despliegue: Python con la librería `catboost` (el repositorio incluye `requirements.txt` e `inference.py`), e integración directa con Pandas y NumPy. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no se distribuyen pesos en safetensors ni GGUF.
- Dependencias del sistema completo: el modelo no funciona solo; requiere el extractor Laya para generar las 40 características. Para consultas nuevas hace falta la dependencia opcional `live-laya` y descargar el modelo de Laya en local. El paquete fuente del proyecto apunta a Python 3.13 y `laya==0.3.5`.
- Latencia y throughput: no disponibles. En la práctica, el coste dominante del pipeline será la extracción semántica con Laya más que el propio router de árboles.
- Evaluación local: el ejemplo de `inference.py` opera sobre una muestra del pool de entrenamiento, no sobre un conjunto de evaluación held-out, por lo que no sirve como medida de rendimiento.

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Entrada | Número de candidatos | Rendimiento (LLMRouterBench, AvgAcc) | Licencia |
|---|---|---|---|---|---|
| SeLMRoute-Laya | CatBoost Regressor (MultiRMSE) | 40 características semánticas de Laya | 20 | no disponible para este checkpoint; 72,64 % para el método SeLMRoute | Apache 2.0 |
| Mejor modelo fijo (baseline del benchmark) | Política constante | no aplica | 1 (siempre el mismo) | 69,23 % | no aplica |
| Routers basados en embeddings, representaciones del modelo, preferencias o clústeres | Aprendizaje supervisado sobre representaciones latentes | Embeddings de consulta o representaciones internas | no disponible | no disponible | no disponible |
| Laya | Modelo de decisión semántica acotada | Texto (ticket, correo, conversación, estado JSON) | no aplica (no es un router) | no aplica | no disponible en la información consultada |

La información disponible no incluye especificaciones detalladas de routers alternativos concretos (parámetros, contexto, latencia o licencia), por lo que la comparación cuantitativa se limita al baseline del benchmark.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas, no ejecuta tool calling y no llama al LLM seleccionado. Requiere un pipeline externo completo (extracción, enrutado y ejecución) para ser útil.
- Las salidas son puntuaciones de regresión, no probabilidades calibradas: no están garantizadas dentro del rango [0, 1] y no deben interpretarse como medidas de confianza.
- Contrato de entrada estricto: la columna j de la entrada debe corresponder a `feature_names[j]` y la salida k a `model_names[k]` de `metadata.json`. Hay que usar las 40 características en ese orden y descartar el resto.
- El CSV de origen tiene 112 columnas; pasar todas al router es un error explícito según la propia model card.
- Es obligatorio emparejar el checkpoint de Laya con las características de Laya; mezclar extractores distintos invalida las predicciones.
- El ejemplo de inferencia se ejecuta sobre una muestra del pool de entrenamiento, no sobre evaluación held-out, por lo que sobreestima el rendimiento si se usa como validación.
- Riesgo de sobreajuste al conjunto de 20 candidatos y al benchmark LLMRouterBench: no hay garantía de generalización a modelos candidatos nuevos ni a distribuciones de consultas distintas.
- Sesgos: no documentados. Dependen del dataset de características, del propio Laya y de la composición del conjunto de 20 modelos candidatos.
- Riesgo de alucinación: no aplica al router en sí; sí aplica a los LLM que se seleccionen con él.
- Idiomas soportados: no disponibles. El comportamiento multilingüe dependería de Laya, cuya cobertura no se detalla en la información consultada.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y tamaño declarado de 0,0 GB. Conviene verificar que `model.cbm` esté realmente publicado, ya que la propia model card advierte de que tanto el repositorio del modelo como el del dataset deben haberse subido previamente.
- Restricciones de licencia: el router es Apache 2.0, lo que permite uso comercial, pero Laya se distribuye por separado y su licencia debe verificarse antes de desplegar el pipeline completo.
- Dependencia de versiones concretas (`laya==0.3.5`, Python 3.13) que conviene fijar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Indigma/SeLMRoute-Laya
- Paper: https://arxiv.org/abs/2609.34736
- Código fuente: https://github.com/Indigma-Innovations/SeLMRoute
- Instrucciones de enrutado en vivo (notebook 3): https://github.com/Indigma-Innovations/SeLMRoute#6-notebook-3-optional-live-routing-of-a-new-query
- Dataset de características congeladas: https://huggingface.co/datasets/Indigma-Innovations/SeLMRoute-Semantic-Features
- Benchmark LLMRouterBench: https://huggingface.co/datasets/NPULH/LLMRouterBench
- Modelo Laya: https://huggingface.co/convaiinnovations/laya
- Resumen del paper en AGI Hunt: https://agihunt.info/en/papers/2609.34736
- Blog sobre Laya: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
