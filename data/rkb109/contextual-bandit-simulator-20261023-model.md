# RKB109/contextual-bandit-simulator-20261023-model

## Resumen

El modelo `RKB109/contextual-bandit-simulator-20261023-model` es un prototipo pequeño y transparente publicado por el usuario RKB109 para simular políticas de decisión en un bandit contextual. No es un modelo de lenguaje generativo: la propia model card lo describe como una combinación de pesos por token para cada etiqueta con recuperación de evidencia ponderada por IDF, distribuida como JSON propio y sin llamadas a ningún LLM alojado. Su propósito declarado es que los equipos puedan validar políticas de decisión offline antes de exponer usuarios o sistemas a aprendizaje por refuerzo en línea.

El interés del artefacto es metodológico más que de rendimiento: sirve como línea base reproducible (con `train.py`, el split exacto del dataset y el código de evaluación en un repositorio GitHub enlazado, aunque la URL no se incluye en la información disponible) para comparar contra ella propuestas más complejas. El autor declara una precisión de 1,0 sobre 4 ejemplos sintéticos reservados, una cifra que no permite extraer conclusiones estadísticas.

Es relevante ahora por su encuadre explícito en la validación offline de sistemas de decisión y en las métricas que dice perseguir (`average_reward`, `policy_regret`, `unsafe_action_block_rate`), pero conviene tratarlo como un ejemplo didáctico de arquitectura y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer: pesos por token por etiqueta combinados con recuperación de evidencia ponderada por IDF (clasificador lineal disperso con recuperación) |
| Parametros totales | no disponible (el autor no publica recuento de parametros; los pesos se distribuyen como JSON propio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica en el sentido habitual: los pesos se publican como JSON, no como tensores float16/int8/GGUF) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset es sintético y de composición no detallada) |
| Licencia | MIT |
| Formato de pesos | JSON propio del autor (formato descrito en el repositorio GitHub de reproducibilidad) |

## Arquitectura y entrenamiento

La arquitectura se aleja de los transformers: el modelo asigna pesos por token a cada etiqueta y los combina con recuperación de evidencia ponderada por IDF, lo que produce decisiones intrínsecamente trazables (se puede reconstruir qué tokens y qué evidencias han pesado en la predicción). Está empaquetado con `library_name: custom`, es decir, requiere código propio para cargarlo, y no depende de PyTorch, safetensors ni de ninguna librería estándar de inferencia. La model card indica explícitamente que no llama a un LLM alojado.

El entrenamiento se realizó sobre un dataset sintético vinculado (`RKB109/contextual-bandit-simulator-20261023-dataset`) del que no se publica tamaño total, número de tokens ni composición. No se menciona RLHF, DPO ni ningún ajuste por preferencias; el pipeline declarado es `reinforcement-learning` con métricas objetivo de recompensa media, arrepentimiento de política (`policy_regret`) y tasa de bloqueo de acciones inseguras. El número de ejemplos sintéticos reservados para evaluación es de 4, lo que sitúa el artefacto en la categoría de demostración de arquitectura reproducible (el repositorio contiene `train.py`, el split exacto y el código de evaluación) más que en la de modelo entrenado a escala.

## Capacidades

- Clasificación de texto mediante pesos por token y recuperación de evidencia ponderada por IDF.
- Extracción de features implícita: los pesos por token y las puntuaciones IDF pueden reutilizarse como representación dispersa.
- Similitud de frases mediante solapamiento de evidencia ponderada (tarea declarada `sentence-similarity`).
- Simulación de políticas en un bandit contextual: el modelo se enmarca en `pipeline_tag: reinforcement-learning` y produce decisiones etiquetadas.
- Trazabilidad de la decisión: al basarse en tokens y evidencias recuperadas, la contribución de cada término es inspeccionable, a diferencia de un modelo neuronal opaco.
- No dispone de generación de texto libre, tool calling, function calling, razonamiento multi-paso, modo thinking, visión, audio ni capacidades de agente; nada de ello aparece en la model card.

## Casos de uso

- Validación offline de políticas de decisión: el modelo actúa como simulador de bandit contextual para estimar recompensa y arrepentimiento antes de exponer usuarios reales a un sistema de aprendizaje por refuerzo en línea, que es exactamente el problema que el autor declara resolver.
- Pruebas de extremo a extremo en CI: al ser determinista, pequeño y con formato JSON, permite verificar en cada commit que el pipeline de entrenamiento, el split del dataset y el código de evaluación siguen funcionando, sin depender de GPUs ni de servicios externos.
- Línea base transparente en experimentos comparativos: cualquier política más compleja (LinUCB, Thompson sampling neuronal, clasificadores supervisados) puede medirse contra este punto de referencia para justificar su coste adicional.
- Docencia y divulgación: sirve para mostrar cómo un esquema de pesos por token más IDF produce decisiones auditables, y para discutir por qué una precisión de 1,0 sobre 4 ejemplos no es evidencia suficiente.
- Clasificación de texto ligera en entornos sin GPU: despliegue en CPU para etiquetado de tickets o comentarios con un conjunto cerrado y pequeño de etiquetas, siempre que se reentrene con datos representativos del dominio.
- Recuperación de evidencia en prototipos de búsqueda interna: la componente IDF puede usarse para ordenar fragmentos candidatos antes de introducir un motor vectorial, como paso intermedio de bajo coste.
- Smoke test de guardarraíles: la métrica `unsafe_action_block_rate` sugiere su uso como banco de pruebas para comprobar que la capa de bloqueo de acciones inseguras del sistema real rechaza los casos que el simulador marca como peligrosos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y no procede extrapolarlos para este tipo de artefacto.

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1,00 | 4 ejemplos sinteticos reservados (held-out) |
| average_reward | no disponible (metrica declarada como objetivo, sin valor publicado) | no disponible |
| policy_regret | no disponible (metrica declarada como objetivo, sin valor publicado) | no disponible |
| unsafe_action_block_rate | no disponible (metrica declarada como objetivo, sin valor publicado) | no disponible |

Advertencia sobre la cifra de accuracy: con 4 aciertos de 4, el límite inferior del intervalo de confianza de Clopper-Pearson al 95% es aproximadamente 0,47, de modo que el resultado es compatible con un rendimiento real cercano al azar en problemas binarios. La cifra no debe citarse como evidencia de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo no requiere GPU según su naturaleza (JSON de pesos por token y recuperación IDF sobre CPU).
- GPU recomendadas: ninguna imprescindible. El formato es ejecutable en CPU; no se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el espacio en disco no está disponible porque el autor no publica el tamaño del JSON.
- Opciones de despliegue: carga mediante código propio (`library_name: custom`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan arquitecturas de transformer y formatos de pesos estándar.
- Latencia y throughput: no disponibles. Por diseño (consulta de pesos y recuperación IDF sobre un conjunto pequeño) se espera un coste por petición muy bajo, pero no hay cifras publicadas que lo respalden.
- Requisito práctico: al no haber soporte en runtimes estándar, es necesario integrar el repositorio de reproducibilidad del autor en el pipeline de inferencia y cubrir esa integración con tests propios.

## Comparativa con modelos similares

No se han publicado datos que permitan una comparación cuantitativa con alternativas concretas. La tabla siguiente es cualitativa y usa como referencia familias de línea base habituales para el mismo tipo de tarea; las cifras de esas alternativas no se han verificado en esta ficha y se marcan como no disponibles.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (RKB109/contextual-bandit-simulator-20261023-model) | no disponible | no disponible | accuracy 1,0 sobre 4 ejemplos sinteticos | MIT | HuggingFace, 0 descargas, 0 likes |
| TF-IDF + regresion logistica (scikit-learn) | no disponible (depende del vocabulario) | no disponible | no disponible | BSD-3-Clause | Muy extendido; requiere construir el pipeline |
| fastText supervisado | no disponible (depende del vocabulario y la dimension) | no disponible | no disponible | MIT | Pesos descargables; soporte multilingue declarado por el autor |
| Vowpal Wabbit (LinUCB / bandit contextual) | no disponible | no disponible | no disponible | BSD-3-Clause | Referencia en bandits contextuales en linea |

En la práctica, este modelo ocupa el mismo nicho que un `TfidfVectorizer` más un clasificador lineal con recuperación de evidencia, con la diferencia de que aquí el paquete incluye el dataset sintético, el código de entrenamiento y el de evaluación en un único artefacto reproducible.

## Limitaciones y advertencias

- Evaluación no concluyente: solo 4 ejemplos reservados y accuracy 1,0; el intervalo de confianza inferior al 95% ronda 0,47.
- Datos sintéticos y de tamaño no publicado: la distribución no representa dominios reales, por lo que el modelo puede fallar sistemáticamente fuera del conjunto de generación.
- Sesgos: no se han documentado sesgos conocidos, y la ausencia de información sobre la composición del dataset impide auditar sesgos por idioma, registro o demografía.
- Alucinación: el modelo no genera texto libre, de modo que el riesgo de alucinación en el sentido habitual no aplica; el riesgo equivalente es el sobreajuste a tokens espurios del corpus sintético, que produciría decisiones erróneas con aparente respaldo de evidencia.
- Idiomas: no se declara ningún idioma soportado; no debe asumirse cobertura multilingüe.
- Licencia: MIT permite uso comercial y modificaciones, pero se distribuye sin garantías de ningún tipo y el autor no ofrece soporte.
- Idoneidad para producción: la propia model card advierte de que las recompensas simuladas offline no demuestran seguridad en línea ni impacto de negocio, y de que no debe usarse para decisiones consecuentes sin datos representativos, revisión experta y evaluación de nivel producción.
- Integración: al ser `library_name: custom` y usar un formato JSON propio, no hay soporte en servidores de inferencia estándar; la dependencia del código del autor es un riesgo de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/contextual-bandit-simulator-20261023-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/contextual-bandit-simulator-20261023-dataset
- Repositorio GitHub con `train.py`, split del dataset, código de evaluación y formato JSON: no disponible (la model card lo menciona pero no incluye la URL)
- Paper o blog técnico: no disponible
- Demo o Space: no disponible
