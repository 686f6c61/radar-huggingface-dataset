# Giuliocc/doxa-linear

## Resumen

DOXA Linear v0.1.0 es un modelo experimental de clasificación de texto en inglés orientado al cribado (screening) de discurso político en contexto. Lo desarrolla Giulio Catanzariti bajo el paraguas del proyecto TACITUS y se publica con licencia Apache 2.0. No es un transformer generativo, sino un clasificador lineal clásico: representa cada pasaje mediante características TF-IDF de n-gramas de caracteres (3 a 5) calculadas por separado para el texto y para su contexto, y aplica una regresión logística multinomial independiente por cada criterio de evaluación.

El modelo entrena seis cabezas de clasificación: enmarcado evaluativo (evaluative_framing), atribución de culpa colectiva (collective_blame), estereotipia identitaria (identity_stereotyping), derogación o exclusión identitaria (identity_derogation_exclusion), conspiración grupal (group_conspiracy) y sobreextensión probatoria (evidential_overclaim). Devuelve predicciones separadas por criterio con puntuaciones no calibradas y no extrae fragmentos de evidencia ni evalúa gravedad. Otros fenómenos como la omisión material o el doble estándar comparativo quedan fuera de esta versión y se abordan como tareas de investigación con paquetes de referencia y casos emparejados.

Su relevancia es metodológica más que de rendimiento: propone una línea base reproducible y auditable (hashes SHA-256 de datos y pesos, semilla fija, un único hilo numérico) para estudiar cómo se comportan los clasificadores de discurso político ante cambios contextuales como la refutación explícita o la atribución añadida. El autor advierte explícitamente de que el piloto no es apto para disciplina automatizada, perfilado de autores, conclusiones legales ni afirmaciones de seguridad organizativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal: TF-IDF de n-gramas de caracteres (3-5) sobre texto y contexto por separado + regresión logística multinomial (una cabeza por criterio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo distingue pasaje y contexto como campos separados; existe un límite de longitud que invalida pasajes "over-limit", sin cifra publicada) |
| Tipos de cuantizacion | no aplica; pesos en float32 little-endian |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON de metadatos + arrays float32 little-endian propios (model_manifest.json, SHA256SUMS); sin pipeline de Transformers ni GGUF/safetensors |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural, no neuronal profundo. Cada instancia se divide en dos vistas (texto y contexto) de las que se extraen n-gramas de caracteres de longitud 3 a 5 y se vectorizan con TF-IDF; sobre esa representación se ajusta un modelo de regresión logística multinomial con una cabeza independiente por criterio. El cargador propio (PortableModel) lee metadatos JSON y arrays float32, lo que elimina la dependencia de frameworks de deep learning y facilita la reproducibilidad exacta.

Los datos de entrenamiento proceden de la partición congelada del DOXA Pilot: 156 juicios sintéticos con estatus "AI-provisional", de los cuales 144 contribuyen a las cabezas entrenadas. No hay revisión humana independiente. La evaluación usa familias completas de escenarios retenidos (held-out) y un desafío conductual sintético separado. El entrenamiento empleó la semilla 1729 y como máximo un hilo de librería numérica. El hash SHA-256 del contenido de entrenamiento es a158d4d3b1fff8cea969febb7e92947b1dabfc21715c8fcdf63835986b0e35fc y el de los pesos del modelo es 4ed4406dddef0d374e3fb701676c73861a940061fbde2835f9babd4e89c75e7c.

## Capacidades

- Clasificación multietiqueta por criterio de discurso político: seis cabezas independientes (evaluative_framing, collective_blame, identity_stereotyping, identity_derogation_exclusion, group_conspiracy, evidential_overclaim).
- Separación explícita entre pasaje y contexto como entradas distintas, lo que permite probar el efecto del contexto sobre la clasificación.
- Abstención ante pasajes desconocidos (unknown) e invalidación de pasajes vacíos o que exceden el límite de longitud.
- Puntuaciones por criterio no calibradas, pensadas para inspección y revisión humana, no para umbrales automáticos.
- Solo inglés; no hay capacidades multilingües.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No verifica hechos aportados por el usuario, no evalúa gravedad y no extrae fragmentos de evidencia.

## Casos de uso

- Investigación sobre sesgos en clasificadores de discurso político: el modelo sirve como línea base reproducible (semilla y hashes fijos) contra la que comparar clasificadores neuronales en las mismas familias de escenarios retenidos.
- Auditoría de robustez contextual: el desafío conductual direccional (0/6 aciertos, 4/6 cobertura) permite estudiar sistemáticamente qué cambios de contexto, como la refutación explícita o la atribución añadida, rompen la clasificación.
- Anotación asistida con revisión humana obligatoria: dado que devuelve predicciones por criterio con cobertura completa en el conjunto de prueba (1.000), puede priorizar pasajes para que un revisor humano inspeccione patrones, manteniendo visibles contexto, cita y refutación.
- Docencia y formación en evaluación responsable de IA: el paquete incluye métricas, predicciones y errores observados (metrics.json, predictions.jsonl), lo que permite reproducir el análisis en un aula o laboratorio sin infraestructura de GPU.
- Pruebas de hipótesis sobre doble estándar comparativo y omisión material: aunque no hay cabezas para estos fenómenos en esta versión, el modelo y su partición congelada sirven de base para diseñar las tareas emparejadas de investigación previstas.
- Validación de pipelines de evaluación propios: el formato de carga minimalista (JSON + float32, verificación por SHA256SUMS) facilita integrar el modelo en arneses de evaluación ligeros sin dependencias de Transformers.
- Despliegue en entornos con recursos muy limitados: al ser un modelo lineal con vectorización TF-IDF, la inferencia es viable en CPU sin GPU, lo que encaja en revisiones locales en navegador como la del DOXA Evidence Lab.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el conjunto de prueba congelado y el desafío conductual sintético:

| Medida de prueba | Resultado |
|---|---:|
| Filas en criterios soportados | 36 / 42 |
| Macro-F1 medio por criterio | 0.757 |
| Macro-F1 de la línea base más frecuente | 0.167 |
| Cobertura de prueba en criterios soportados | 1.000 |
| Pares conductuales correctos en ambos lados | 0.400 |
| Éxito conductual direccional | 0.000 |
| Cobertura conductual | 0.800 |
| Desafío direccional (aciertos / cobertura) | 0 / 6 con 4 / 6 cubiertos |

El autor señala que el modelo falló en los cambios de refutación explícita y de atribución añadida, lo que constituye una limitación del cribado contextual pese al macro-F1 más alto en la prueba congelada. La muestra sintética pequeña no establece precisión ni equidad en comunicaciones empresariales reales. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es lineal y se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: sí, aunque no es necesario; también en entornos sin GPU.
- Opciones de despliegue: cargador propio PortableModel del checkout de DOXA (uv sync --locked), o reimplementación directa del pipeline TF-IDF + regresión logística; no hay soporte de vLLM, llama.cpp, Ollama, TGI ni pipeline de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio ocupa 0.0 GB según Hugging Face, coherente con un modelo lineal de pequeño tamaño.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. Como referencia cualitativa de categoría, la alternativa natural son clasificadores lineales de texto (TF-IDF + regresión logística o SVM) y clasificadores neuronales ajustados para detección de discurso tóxico o político; sin embargo, no hay datos de rendimiento de esos sistemas en esta ficha que permitan una comparación numérica honesta.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DOXA Linear v0.1.0 | no disponible (lineal) | no disponible | Macro-F1 0.757 en prueba sintética congelada | Apache 2.0 | Hugging Face (formato propio) |
| Clasificadores lineales genéricos | no disponible | no disponible | no disponible | variable | variable |
| Clasificadores neuronales de discurso político | no disponible | no disponible | no disponible | variable | variable |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: 156 juicios generados por IA, sin revisión humana independiente; no establece precisión ni equidad en datos reales.
- Fallo documentado en sensibilidad contextual: 0/6 en el desafío direccional, con errores en refutación explícita y atribución añadida.
- Puntuaciones no calibradas: no deben usarse con umbrales automáticos ni como probabilidades.
- Sin extracción de evidencia ni evaluación de gravedad: no puede justificar una decisión con el fragmento que la motiva.
- No verifica hechos aportados por el usuario.
- Solo inglés; sin soporte multilingüe.
- El autor declara el piloto no apto para disciplina automatizada, perfilado de autores, conclusiones legales ni afirmaciones de seguridad organizativa.
- Riesgo de sesgo: al derivarse de juicios sintéticos, puede reproducir los sesgos del proceso de generación y de las rúbricas empleadas.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias del autor sobre idoneidad siguen aplicando.
- Formato propietario sin integración con el ecosistema Transformers, lo que limita su adopción en pipelines estándar.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas presentadas con apariencia de certeza al no estar calibradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/doxa-linear
- Demo DOXA Evidence Lab: https://huggingface.co/spaces/Giuliocc/doxa-lab
- Colección DOXA: https://huggingface.co/collections/Giuliocc/doxa-political-discourse-and-ai-evaluation-6b09ba1615d7e021c1cf7433
- Proyecto TACITUS: https://tacitus.me
- Dataset DOXA Pilot (revisión congelada): https://huggingface.co/datasets/Giuliocc/doxa-pilot/tree/a29c0ce8cb8d2ea99218c0cb3fa58f59b2e1b1f8
