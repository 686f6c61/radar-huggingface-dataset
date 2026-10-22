# HawkBearPig/flint-FP8-NVFP4

## Resumen

flint-FP8-NVFP4 es un checkpoint cuantizado de forma mixta del modelo MoE RecursiveSI/flint (revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288`), publicado por HawkBearPig bajo licencia Apache 2.0. No es un modelo nuevo ni un ajuste fino: es una política de asignación de precisión que reduce los pesos de 79,571 GB en BF16 a 35,738 GB de tensores almacenados, un 55,09 % menos que el original y un 14,36 % menos que una cuantización FP8 de todos los expertos. El checkpoint conserva 638 tensores en BF16 (routers, expertos compartidos, atención, sinks, normas, embeddings, cabeza de salida y las dos primeras capas densas) y reparte el resto entre 23.040 matrices de expertos en FP8 y 13.056 en NVFP4.

Su relevancia es metodológica: documenta una política concreta (`budget36-swap1`) seleccionada por fidelidad de texto dentro de un presupuesto fijo de almacenamiento, con artefactos reproducibles (asignación por capa en `precision-policy.json`, informe de cualificación y referencia de corrección). Además, el autor publica métricas de deriva numérica frente al BF16 original y frente a la alternativa FP8 completa, algo poco habitual en checkpoints cuantizados de terceros.

El precio de esa compresión es explícito: la concordancia de siguiente token con BF16 baja al 91,89 % (frente al 93,59 % de FP8 completo) y la divergencia KL sube a 0,090109. El propio autor advierte de que el formato es personalizado, requiere soporte de la arquitectura Flint y que la inferencia nativa directamente desde pesos comprimidos no ha sido cualificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y expertos compartidos; 47 capas MoE, 256 expertos enrutados por capa, más dos capas densas iniciales |
| Parámetros totales | 39.785.287.456 en el modelo base BF16; 32.940.183.328 según los metadatos safetensors del checkpoint cuantizado (recuento afectado por el empaquetado de FP8/NVFP4) |
| Parámetros activos | no disponible (el número de expertos activados por token no se documenta) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: FP8 (60,72 % de los parámetros), NVFP4 (34,41 %), BF16 (4,87 %); sin reentrenamiento ni recuperación en tiempo de ejecución |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con disposición mixta personalizada (FP8/NVFP4/BF16); no es un export drop-in para un framework concreto |

## Arquitectura y entrenamiento

El modelo subyacente es un Mixture of Experts con 47 capas MoE y 256 expertos enrutados por capa, sobre una base transformer con expertos compartidos, mecanismo de atención, sinks de atención, normas y embeddings. Los pesos del checkpoint se organizan por capa: las capas 2–11, 13–30 y 32 mantienen gate, up y down en FP8; la capa 12 combina up en NVFP4 con gate y down en FP8; las capas 31 y 33–36 y 38–48 pasan las tres proyecciones a NVFP4; la capa 37 usa NVFP4 en gate y up y FP8 en down. Ninguna matriz de experto enrutado queda en BF16. Las activaciones se mantienen en BF16 en todo el modelo.

No hay entrenamiento asociado a esta publicación: es una conversión post-hoc. El autor informa de que evaluó 72 políticas completas bajo presupuestos de 28–48 GB, tras perfilar las 47 capas MoE en tres contextos de referencia y 564 cambios locales de proyección; los finalistas se congelaron antes de las comprobaciones independientes. La selección se hizo maximizando fidelidad de texto bajo un presupuesto de almacenamiento fijo y se validó después sobre conjuntos separados de texto y tareas. El checkpoint se exportó y verificó en una GPU RTX PRO 6000 Blackwell Server.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje; el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento y conocimiento factual de tipo cero ejemplos, medido en el informe con OpenBookQA (500 preguntas) y HellaSwag (1.024 preguntas) mediante un runner propio de verosimilitud de continuación, sin plantilla.
- Capacidad de continuación de código y matemáticas implícita en la mezcla de evaluación del holdout de texto (prosa, código y matemáticas), aunque el autor aclara que la verosimilitud sobre código/matemáticas no equivale a una puntuación de tarea de programación o razonamiento.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales: no disponible; no se documentan visión, audio ni modo thinking.
- Inferencia con pesos comprimidos: solo mediante la referencia de corrección incluida, que expande a BF16.

## Casos de uso

- Investigación sobre cuantización mixta: el checkpoint sirve como caso reproducible para estudiar el compromiso entre huella de almacenamiento y deriva numérica, con asignación por capa publicada en `precision-policy.json` y un informe de cualificación de 72 políticas comparadas.
- Despliegue on-premise con presupuesto de VRAM ajustado: 35,738 GB de tensores permiten alojar el modelo en aceleradores de 48 GB (por ejemplo, RTX PRO 6000 Blackwell o A6000 Ada) donde la versión BF16 de 79,571 GB exigiría dos GPU o memoria de 80 GB.
- Validación de pipelines de evaluación: útil como segundo checkpoint de control para comprobar si las diferencias observadas en una batería de evaluación se deben al modelo o al ruido del arnés, comparando contra el BF16 y contra FP8 completo.
- Generación de texto por lotes con latencia no crítica: al reducir el peso por debajo de 36 GB, el modelo cabe en un solo nodo y simplifica el escalado horizontal por réplica frente a alternativas de mayor huella.
- Estudio de robustez ante cuantización en tareas de opción múltiple: los datos de OpenBookQA y HellaSwag con intervalos bootstrap permiten analizar cuántos aciertos cambian de signo (6 correctas→incorrectas y 10 incorrectas→correctas en OpenBookQA) al degradar la precisión.
- Base para comparaciones de eficiencia de decodificación en Blackwell: el uso de NVFP4 en 17 capas MoE permite medir el impacto del formato de bloque de 4 bits en el rendimiento real, aunque el autor no publica cifras de throughput.
- Fine-tuning posterior: no recomendado ni documentado; el propio autor indica que no hay recuperación en tiempo de ejecución y que la referencia de corrección requiere expandir a BF16 (~80 GB).

## Benchmarks y rendimiento

Holdout de texto: 49.140 objetivos puntuados en 12 ventanas disjuntas de 4.096 tokens, equilibradas entre prosa, código y matemáticas, excluyendo filas de código fuente ya usadas.

| Checkpoint | GB de tensores | Concordancia con BF16 | KL respecto a BF16 | NLL de texto |
|---|---:|---:|---:|---:|
| Fuente BF16 | 79,571 | 100 % | 0 | 2,214730 |
| Todos los expertos enrutados en FP8 | 41,730 | 93,59 % | 0,072432 | 2,217737 |
| **Este checkpoint mixto** | **35,738** | **91,89 %** | **0,090109** | **2,219417** |

Comprobación de tareas (OpenBookQA test completo, 500 preguntas sin hechos de apoyo; HellaSwag validación, 1.024 preguntas; runner propio cero ejemplos, sin plantilla):

| Checkpoint | OpenBookQA acc_norm | HellaSwag acc_norm | OpenBookQA acc bruta | HellaSwag acc bruta |
|---|---:|---:|---:|---:|
| Fuente BF16 | 42,20 % | 75,68 % | 32,60 % | 59,77 % |
| Todos los expertos enrutados en FP8 | 41,60 % | 75,78 % | 31,80 % | 60,25 % |
| **Este checkpoint mixto** | **43,00 %** | **76,37 %** | **32,80 %** | **60,06 %** |

Las diferencias normalizadas frente a BF16 son +0,80 puntos en OpenBookQA (intervalo pareado del 95 %: −0,80 a +2,40) y +0,68 puntos en HellaSwag (−0,29 a +1,66); frente a FP8 completo, −0,40 a +3,40 y −0,39 a +1,56. Todos los intervalos incluyen cero, usan 10.000 remuestreos bootstrap a nivel de pregunta y no están corregidos por comparaciones múltiples. La concordancia de respuesta normalizada con BF16 es del 94,40 % en OpenBookQA y del 96,68 % en HellaSwag.

## Requisitos de hardware

- VRAM para pesos: 35,738 GB de tensores almacenados en el checkpoint. No incluye caché KV, activaciones ni espacio de trabajo, que hay que sumar según la longitud de secuencia.
- Referencia de corrección incluida: expande los pesos a BF16 y necesita aproximadamente 80 GB de memoria de GPU para los pesos.
- Inferencia nativa desde pesos comprimidos: no cualificada por el autor; no hay cifras publicadas de latencia ni throughput.
- GPU recomendadas: RTX PRO 6000 Blackwell (plataforma usada para exportar y verificar) es la referencia del autor. Para FP8 se requiere Ada Lovelace o Hopper (L40S, H100, RTX 4090 en adelante); NVFP4 es un formato de bloque soportado por las tensor cores de quinta generación de Blackwell.
- ¿Cabe en GPU de consumo? Los 35,738 GB de pesos no caben en 24 GB (RTX 4090, 3090) ni en 32 GB (RTX 5090); el presupuesto mínimo práctico es 48 GB, y aun así con margen escaso para caché KV.
- Opciones de despliegue: el autor indica que se necesita soporte de la arquitectura Flint y la disposición mixta documentada; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La referencia de corrección (expansión a BF16) sería la vía soportada, con mayor requisito de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Checkpoint | Parámetros | GB de tensores | Precisión | Concordancia con BF16 | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| RecursiveSI/flint (BF16) | 39.785.287.456 | 79,571 | BF16 | 100 % | Apache 2.0 | HuggingFace |
| HawkBearPig/flint-FP8-BF16 (todos los expertos FP8) | no disponible en la información | 41,730 | FP8 + BF16 en resto | 93,59 % | Apache 2.0 | HuggingFace |
| **HawkBearPig/flint-FP8-NVFP4** | 39,79 B (base) | 35,738 | FP8/NVFP4/BF16 mixto | 91,89 % | Apache 2.0 | HuggingFace |
| HawkBearPig/flint-NVFP4-FP8 (release anterior) | no disponible en la información | 30,802 | NVFP4 temprano / FP8 tardío | no disponible | Apache 2.0 | HuggingFace |

La comparación con modelos de otras familias no está disponible en la información proporcionada. Los tres checkpoints cuantizados comparten la misma arquitectura y contexto que el modelo base, por lo que la elección entre ellos es un compromiso entre huella (30,8 / 35,7 / 41,7 GB) y deriva numérica respecto a BF16.

## Limitaciones y advertencias

- No es un export drop-in: requiere soporte de la arquitectura Flint y respetar la disposición mixta documentada en `config.json → quantization_config → routed_experts → precision_by_layer`.
- La inferencia nativa desde pesos comprimidos no ha sido cualificada; la única vía verificada es expandir a BF16, lo que exige ~80 GB de memoria de GPU.
- Deriva numérica superior a FP8 completo: 91,89 % de concordancia de siguiente token frente a 93,59 %, y KL de 0,090109 frente a 0,072432.
- El propio autor advierte de que las estimaciones puntuales superiores en tareas son inciertas y no establecen capacidad general superior o equivalente; los intervalos de confianza incluyen cero y no se fijó un margen de equivalencia.
- Evaluación de tareas realizada con un runner propio cero ejemplos y sin plantilla, no con un arnés oficial, y sin evaluar generación libre; los resultados no son directamente comparables con cifras publicadas de MMLU, HumanEval o GSM8K.
- Sin datos de sesgo, toxicidad, alucinación o robustez: no se han publicado evaluaciones de seguridad.
- Idiomas soportados no declarados; no se puede asumir calidad multilingüe ni un rendimiento concreto en castellano.
- Longitud de contexto no documentada en esta ficha; hay que consultarla en el modelo base antes de planificar cargas con secuencias largas.
- No se documentan tool calling, agentes ni ajuste por instrucciones; conviene verificar el comportamiento conversacional del modelo base antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento de la licencia del modelo base y sobre la calidad del checkpoint cuantizado recae en quien lo despliega.
- El recuento de parámetros de los metadatos safetensors (32.940.183.328) difiere del del modelo base (39.785.287.456); hay que tenerlo en cuenta en herramientas de planificación de capacidad.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/HawkBearPig/flint-FP8-NVFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Revisión exacta del modelo base: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Release anterior (30,802 GB, NVFP4 temprano / FP8 tardío): https://huggingface.co/HawkBearPig/flint-NVFP4-FP8
- Estudio y comparativas de políticas: https://huggingface.co/HawkBearPig/flint-FP8-BF16/blob/b308113a630c9a6bf8d7843b5bc9ce71f35ecc66/diagnostics/qualification/report.md
- Asignación de precisión legible por máquina: `precision-policy.json` (incluido en el repositorio del checkpoint)
- Papel, blog o demo adicionales: no disponibles en la información proporcionada.
