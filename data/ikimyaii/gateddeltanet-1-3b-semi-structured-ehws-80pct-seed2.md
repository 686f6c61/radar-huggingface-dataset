# ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed2

## Resumen

GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed2 es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face, consistente en una poda semi-estructurada al 80 % aplicada sobre el modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, un transformer híbrido de 1.466 millones de parámetros entrenado por el grupo Multimodal Art Projection (M-A-P). El modelo no introduce arquitectura nueva: reutiliza el grafo GatedDeltaNet del modelo original y modifica únicamente los pesos de las capas lineales internas de los bloques, dejando embeddings y lm_head densos.

El interés es fundamentalmente metodológico. El autor aplica un esquema de poda en dos fases (local tipo ALPS hasta el 70 % y global mediante ADMM con pérdida de entropía cruzada y destilación de conocimiento hasta el 80 %) y publica el registro completo de la ejecución, incluidas las perplejidades y las métricas zero-shot frente al modelo denso. Es, por tanto, un artefacto útil para estudiar el compromiso entre dispersión estructurada por filas, degradación de calidad y equilibrio de carga en hardware real.

La relevancia práctica es limitada: la poda destruye buena parte de la capacidad del modelo base (la media zero-shot cae de 0,5123 a 0,4122 y la perplejidad en WikiText-2 se duplica con creces), no se declara licencia y el repositorio no incluye información sobre idiomas, formato de despliegue ni pipeline. Debe tratarse como material de reproducción experimental, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (transformer híbrido con atención lineal DeltaNet y compuertas), modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el calibrado usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor evalúa en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 5,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint m-a-p/1.3B-100B-GatedDeltaNet-pure, un diseño de atención lineal con regla delta y compuertas que sustituye la atención cuadrática por una recurrencia matricial de coste lineal en la longitud de secuencia. El nombre del tokenizador asociado en el calibrado (fla-hub_hgrn-1.3B-100B) sugiere integración con la librería flash-linear-attention. El modelo base fue entrenado con aproximadamente 100.000 millones de tokens según su denominación, aunque la información disponible no detalla la composición del corpus ni si hubo fases de RLHF o DPO.

Sobre ese checkpoint, el autor aplica una poda semi-estructurada en dos fases. La fase 1, local y de estilo ALPS, poda cada capa hasta el 70 % minimizando el error de reconstrucción ||(W − W0)X||², con matrices de Hessiano estimadas a partir de secuencias de calibración de C4. La fase 2, global, ejecuta ADMM sobre la pérdida de entropía cruzada más destilación de conocimiento, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 2, hasta alcanzar el 80 % de dispersión. El conjunto de datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens empleadas por el código oficial de ELSA, tokenizadas con el tokenizador del modelo y vistas una sola vez. La ejecución completa, incluida la evaluación, consumió 3,83 horas en una A100 de 40 GB.

La dispersión resultante es semi-estructurada por filas: cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el 20 % superior), lo que garantiza equilibrio de trabajo por fila. Se podan todas las capas lineales internas de los bloques (240 capas verificadas); embeddings y lm_head permanecen densos. La dispersión medida sobre los pesos publicados es 0,7999.

## Capacidades

- Generación de texto autorregresiva y modelado de lenguaje, heredadas del modelo base denso.
- Razonamiento de sentido común y respuesta a preguntas en inglés, evaluadas en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Comprensión lectora y inferencia textual a corto alcance (resultados en boolq y rte cercanos al modelo denso).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad de este tipo.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución con atención lineal de coste lineal en longitud de secuencia, siempre que se instale flash-linear-attention (`import fla`) y se cargue con AutoModelForCausalLM.from_pretrained.

## Casos de uso

- Reproducción de experimentos de poda: el repositorio incluye results.json con la configuración completa y las métricas, lo que permite replicar el pipeline ALPS + ADMM sobre otros checkpoints GatedDeltaNet y comparar curvas de degradación.
- Estudio de dispersión semi-estructurada por filas: al mantener el mismo número de no ceros en cada fila de las 240 capas podadas, el modelo sirve para medir el equilibrio de carga real en kernels dispersos y validar aceleraciones teóricas frente a la poda no estructurada.
- Investigación sobre destilación de conocimiento en modelos podados: la fase 2 combina entropía cruzada y KD sobre C4, de modo que el checkpoint es un punto de referencia para analizar cuánto recupera la destilación frente a la poda puramente local.
- Evaluación comparativa de robustez: con métricas zero-shot publicadas tarea a tarea, se puede usar como línea base de "modelo 1.3B al 80 % de dispersión" en estudios sobre degradación por compresión.
- Docencia y divulgación técnica: permite ilustrar en un caso real de 1,3B parámetros el coste de calidad de una poda agresiva (perplejidad de 10,31 a 21,77 en WikiText-2) sin necesidad de infraestructura grande.
- Pruebas de pipelines de inferencia con flash-linear-attention: útil para verificar la compatibilidad de AutoModelForCausalLM con checkpoints GatedDeltaNet podados y para medir latencia en A100 40 GB, el mismo hardware del entrenamiento.
- Generación de texto de baja exigencia en inglés: tareas de autocompletado o clasificación textual donde la caída de precisión documentada sea tolerable y el ahorro de memoria frente al modelo denso resulte prioritario.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16), ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (80 % dispersión) | 21,77 | 22,24 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2082 |
| arc_easy | 0,7222 | 0,5046 |
| boolq | 0,6159 | 0,5835 |
| hellaswag | 0,4629 | 0,3364 |
| openbookqa | 0,2920 | 0,1740 |
| rte | 0,4982 | 0,5307 |
| winogrande | 0,6188 | 0,5478 |
| Media | 0,5123 | 0,4122 |

Dispersión medida sobre los pesos publicados: 0,7999. Las 240 capas podadas presentan el mismo número de no ceros por fila.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 5,9 GB en safetensors, por lo que en fp16 se necesitan aproximadamente 3 GB solo para pesos (1,466 mil millones de parámetros × 2 bytes) más overhead de activaciones y caché; en la práctica, entre 4 y 6 GB con contexto moderado.
- GPU recomendadas: A100 40 GB (hardware usado en el entrenamiento y la evaluación), H100 o A10G para servir; cualquier GPU con al menos 8 GB permite inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores). En 4 GB exigiría cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: carga con AutoModelForCausalLM.from_pretrained y la librería flash-linear-attention instalada (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que el grafo es GatedDeltaNet y no un transformer estándar, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles. El único dato temporal es el coste del pipeline de poda (3,83 horas en una A100 40 GB), que no equivale a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Calidad (media zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 1,466 B | no disponible | 80 % semi-estructurada | 0,4122 | no disponible | Hugging Face (0 descargas) |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3 B | no disponible | 0 % | 0,5123 | no disponible | Hugging Face |
| Alternativas de poda tipo ELSA/SparseGPT sobre transformers densos de ~1,3B | ~1,3 B | depende del base | 50-80 % | no disponible para comparación directa | depende del base | varía |

La comparación más informativa es contra su propio modelo base: la poda al 80 % reduce la media zero-shot en 0,1001 puntos absolutos y multiplica por 2,11 la perplejidad en WikiText-2. No se dispone de datos de otros checkpoints podados con el mismo protocolo ELSA en la información proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Degradación severa de calidad: la media zero-shot cae de 0,5123 a 0,4122 y tareas como arc_easy (0,7222 → 0,5046) u openbookqa (0,2920 → 0,1740) pierden más de 20 puntos absolutos. La perplejidad en C4 sube de 13,76 a 22,24.
- Resultado de una única ejecución con semilla 2: no se reportan intervalos de confianza ni repeticiones, por lo que la varianza del pipeline no está caracterizada.
- Sesgos conocidos: no documentados. Al derivar de un modelo base entrenado sobre corpus web (C4 y datos no detallados), es esperable heredar sesgos de ese corpus, pero no hay análisis publicado.
- Riesgo de alucinación: elevado en la práctica por la pérdida de capacidad del modelo podado; no se han publicado evaluaciones de factualidad ni de calibración.
- Limitaciones de contexto e idioma: la longitud de contexto no está declarada y el calibrado usa secuencias de 2.048 tokens; no se especifican idiomas soportados, y todas las evaluaciones publicadas son en inglés.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Debe contactarse con el autor o con el titular del modelo base antes de cualquier uso en producción.
- Dependencia de flash-linear-attention: requiere `import fla` para cargarse correctamente; no es un transformer estándar y los motores de inferencia habituales (vLLM, llama.cpp, Ollama) no están validados.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demo; debe considerarse un experimento de investigación, no un modelo soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed2
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Librería flash-linear-attention (requerida para la carga): no disponible en la información proporcionada
- Paper o blog del método EHWS/ADMM: no disponible en la información proporcionada
- Referencia al código oficial de ELSA citado en la model card: no disponible en la información proporcionada
- Repositorio con results.json: incluido en el propio repo de Hugging Face (archivo results.json)
