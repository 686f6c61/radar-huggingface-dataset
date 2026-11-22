# dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2

## Resumen

El modelo `semsimula-ladder-live-code-d384-l4-none-norc-sr2`, denominado L4-CODE dentro de la colección *depth-on-code* del autor dimitarpg13, es un modelo de lenguaje experimental de tipo *conservative language model* entrenado sobre código Python. Pertenece a la familia SemSimula, una línea de investigación que sustituye el mecanismo de atención del transformer por una dinámica de segundo orden amortiguada sobre un potencial escalar aprendido, con estados de token que avanzan mediante pasos de integración. El modelo tiene 76.625.361 parámetros y una arquitectura *attention-free* de cuatro capas con un paso de integración Δt = 2, manteniendo un tiempo total de integración T = L · Δt = 8 constante respecto a sus variantes de dos y ocho capas.

El objetivo del experimento es aislar el efecto de la profundidad en este tipo de arquitecturas sin alterar la capacidad de cómputo total: al fijar T, solo cambia el número de pasos. L4-CODE se compara de forma emparejada paso a paso contra SO-CODE (dos capas, Δt = 4) y contra un GPT-2 de referencia de ocho capas y dimensión 384, entrenados sobre los mismos lotes y con el mismo presupuesto de tokens (315.392.000). La relevancia actual reside en que explora una alternativa no-transformer con inferencia de memoria constante y geometría riemanniana, un área de investigación activa para reducir el coste cuadrático de la atención.

El modelo está pensado exclusivamente para investigación y ablación de mecanismos, no como modelo de producción. La model card documenta el resultado principal: una perplejidad de validación de 5,48 en el bloque 512 sobre CodeParrot clean, lo que supone una mejora del 8,5 % frente a SO-CODE y cierra el 47 % de la brecha respecto al GPT-2 emparejado (4,96).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conservative language model no-transformer, attention-free, flujo de segundo orden amortiguado sobre potencial escalar aprendido (formulación lagrangiana), integración BAOAB con potencial gaussiano anisotrópico |
| Parametros totales | 76.625.361 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento y evaluación con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |
| Capas | 4 |
| Paso de integración (Δt) | 2 |
| Tiempo total de integración (T) | 8 (L · Δt) |
| Dimensión del modelo | 384 |
| Tokens de entrenamiento | 315.392.000 (19.250 pasos × 32 × 512) |
| Dataset | codeparrot/codeparrot-clean-train y codeparrot/codeparrot-clean-valid |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

L4-CODE no es un transformer ni emplea atención. Cada capa avanza los estados de token mediante un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido V_θ, integrado con el esquema BAOAB (dinámica de Langevin con potencial gaussiano anisotrópico). La formulación es completamente conservativa (*fully-conservative*), sin ruta de registro Fock activa en esta variante (`norc`), y se apoya en geometría riemanniana con geodésicas y métrica de Jacobi. La inferencia es de memoria constante, lo que la distingue de la atención cuadrática.

El diseño experimental mantiene fijo el tiempo total de integración T = L · Δt = 8 y reparte ese tiempo en más pasos más cortos: dos capas con Δt = 4 (SO-CODE), cuatro con Δt = 2 (este modelo) y ocho con Δt = 1 (L8-CODE). Las capas comparten el banco de pozos de V_θ, V_φ y los canales de contexto; los 53.252 parámetros adicionales respecto a SO-CODE corresponden al código de profundidad de las dos capas nuevas (3.840), a sus escalas V_φ (2) y a sus compuertas de destrucción de registro (49.410), que en este modelo conservativo no tienen ruta hacia los tokens. Por tanto, la profundidad añade pasos, no capacidad.

El entrenamiento se realizó sobre exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) con el calendario WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. SO-CODE y L4-CODE parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso. El run completó 19.250 pasos en 10,9 h en una sola sesión (2,04 s por paso, sin checkpointing de capas en entrenamiento), sin activaciones del watchdog, con un incremento máximo de pérdida de 0,071 entre pasos registrados, norma de gradiente mediana de 0,38 tras el paso 2.000 y monitor de fuga SCAF limpio en las cuatro auditorías.

## Capacidades

- Generación de texto y código Python: el modelo está entrenado sobre CodeParrot clean y su evaluación se realiza sobre tokens de código.
- Modelado de lenguaje autorregresivo con perplejidad de validación medida en bloques de 512 tokens.
- Inferencia con memoria constante gracias a la ausencia de atención.
- Ablación de mecanismos: variantes de profundidad, ruta Fock, flujo de primer orden y potenciales, todas comparables de forma emparejada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (etiqueta `en`).
- No se documenta modo thinking, visión ni audio.
- No se documenta decodificación especulativa.

## Casos de uso

- Investigación en arquitecturas no-transformer: el modelo sirve como punto de comparación controlado para estudiar si la profundidad en flujos conservativos mejora el modelado de lenguaje sin aumentar la capacidad, manteniendo T constante.
- Ablación de mecanismos de integración: permite contrastar el esquema BAOAB frente a flujos de primer orden (FO-b-CODE, 6,55 de perplejidad) sobre exactamente los mismos lotes y presupuesto de tokens.
- Estudio de memoria constante en inferencia: su diseño sin atención lo hace adecuado para analizar el coste de memoria frente a la longitud de secuencia en entornos de investigación.
- Evaluación de geometría riemanniana aplicada a modelos de lenguaje: la métrica de Jacobi y las geodésicas riemannianas son componentes del modelo que pueden aislarse experimentalmente.
- Reproducibilidad de estudios pre-registrados: el run está pre-registrado con predicciones (L4a y L4b) y un calendario de evaluación documentado, útil para validar metodologías de ablación.
- Modelado de código a pequeña escala: con 76,6 M de parámetros y perplejidad de 5,48 en CodeParrot, puede emplearse como banco de pruebas para técnicas de tokenización o currículos de entrenamiento sobre código antes de escalar.
- Docencia y divulgación: ilustra de forma concreta una alternativa lagrangiana a la atención, con métricas emparejadas y análisis de salud del entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Capas | Δt | Perplejidad asentada | Frente a SO-CODE |
|---|---:|---:|---:|---:|
| SO-CODE (baseline) | 2 | 4 | 6,00 | — |
| **L4-CODE (este modelo)** | 4 | 2 | **5,48** | **−8,5 %** |
| L8-CODE | 8 | 1 | 5,35 | −10,7 % |
| GPT-2 emparejado (no en el Hub) | 8 | — | 4,96 | −17,3 % |
| FOCK-CODE (no en el Hub) | — | — | 5,66 | −5,6 % |
| FO-b-CODE (flujo de primer orden) | 2 | — | 6,55 | +9,2 % |

Detalle del resultado de L4-CODE: perplejidad asentada de 5,48, media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,37, 5,50 y 5,59); mejor valor de 5,37 en el paso 18.000. Medición sobre los primeros 2 M de tokens de los ficheros de validación de CodeParrot, con división a nivel de fichero.

Comparación emparejada por paso (diferencia media en log-perplejidad, en nats):

| Pasos | L4-CODE − SO-CODE | L4-CODE − FOCK-CODE |
|---|---:|---:|
| 2.000–4.000 (5 evals) | −0,293 (SD 0,066), −25,4 % | −0,095 (SD 0,040), −9,1 % |
| 8.000–13.000 (11 evals) | −0,098 (SD 0,007), −9,3 % | −0,025 (SD 0,003), −2,5 % |
| 16.000–19.000 (7 evals) | −0,088 (SD 0,004), −8,4 % | −0,030 (SD 0,003), −3,0 % |

Hipótesis pre-registradas: L4a (perplejidad asentada por debajo de 5,70) acertada con 5,48; L4b (mayor ganancia en el split de copia de largo alcance) acertada en la letra (+2,9 puntos) pero no distinguible de cero (intervalo del 95 %: −1,8 a +7,9 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia: con 76,6 M de parámetros, el peso en fp32 ocupa aproximadamente 0,3 GB; en fp16, unos 0,15 GB. No se documentan cuantizaciones adicionales.
- GPU recomendadas: no se especifican en la model card; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para el peso del modelo.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del checkpoint (repo de 0,3 GB).
- Opciones de despliegue: el modelo usa PyTorch como librería; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y su arquitectura no-transformer probablemente requiera código propio.
- Latencia y throughput: el entrenamiento registró 2,04 s por paso con 32 secuencias de 512 tokens; no se publican cifras de latencia de inferencia.
- Inferencia de memoria constante: la ausencia de atención implica que el coste de memoria no crece con la longitud de secuencia, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Perplejidad (CodeParrot) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| L4-CODE (este) | 76.625.361 | 4 | bloque 512 | 5,48 | cc-by-4.0 | Hub |
| SO-CODE | 76.572.109 | 2 | bloque 512 | 6,00 | no disponible | Hub |
| L8-CODE | no disponible | 8 | bloque 512 | 5,35 | no disponible | Hub |
| GPT-2 emparejado (8 capas, d=384) | no disponible | 8 | bloque 512 | 4,96 | no disponible | No en el Hub |
| FOCK-CODE | no disponible | no disponible | bloque 512 | 5,66 | no disponible | No en el Hub |
| FO-b-CODE | no disponible | 2 | bloque 512 | 6,55 | no disponible | Hub |

La comparación relevante es interna a la familia SemSimula, ya que no se han identificado alternativas externas con la misma formulación conservativa y el mismo protocolo de evaluación emparejado.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para producción ni para uso comercial directo, pese a la licencia CC BY 4.0.
- Idiomas: solo inglés; el contenido es código Python, no texto general multilingüe.
- Contexto: entrenado y evaluado en bloques de 512 tokens; no se documenta una ventana de contexto mayor.
- Rendimiento: sigue por detrás del GPT-2 emparejado (5,48 frente a 4,96) y no alcanza a L8-CODE (5,35).
- Inferencia: al ser una arquitectura no-transformer, no es compatible con los runners estándar (vLLM, llama.cpp, Ollama, TGI) sin adaptación.
- Resultados no verificados: la perplejidad declarada figura con `verified: false` en el model-index.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de código, puede generar APIs o identificadores inexistentes.
- Sesgos: no documentados; el dataset CodeParrot clean puede heredar sesgos de su corpus de origen.
- Parámetros sin ruta a los tokens: las compuertas de destrucción de registro (49.410 parámetros) no contribuyen a la salida en esta variante conservativa.
- Hipótesis L4b: la ventaja en el split de copia no es estadísticamente distinguible de cero.
- Uso comercial: la licencia CC BY 4.0 permite uso comercial con atribución, pero el estado experimental del modelo desaconseja su despliegue sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- SO-CODE (baseline): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- FO-b-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Colección depth-on-code: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Notas de pre-registro (Code_Depth_Runs.md): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Depth_Runs.md
- Dataset CodeParrot clean train: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset CodeParrot clean valid: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
