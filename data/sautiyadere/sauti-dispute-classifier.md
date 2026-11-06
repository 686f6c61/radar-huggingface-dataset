# sautiyadere/sauti-dispute-classifier

## Resumen

`sauti-dispute-classifier` es un clasificador de texto multietiqueta (cuatro clases) construido con SetFit sobre el encoder `BAAI/bge-small-en-v1.5`. Lo publica el usuario de Hugging Face `sautiyadere` y está orientado a la categorización de reclamaciones y apelaciones de conductores de plataformas de transporte (VTC/taxi) en el contexto keniano: disputas de tarifa, marcado de fraude, seguridad del pasajero y bloqueos de cuenta. El modelo no genera texto: recibe una reclamación en lenguaje natural y devuelve una de las cuatro categorías.

Técnicamente es un modelo compacto: 33,36 millones de parámetros en pesos safetensors, un repositorio de 0,1 GB y una longitud máxima de secuencia de 512 tokens. La arquitectura combina un sentence transformer afinado con aprendizaje contrastivo y una cabeza de clasificación basada en regresión logística de scikit-learn, el esquema estándar de SetFit para aprendizaje con pocos ejemplos.

Su relevancia es acotada pero concreta: demuestra cómo con muy pocas muestras por clase (los ejemplos de la model card sugieren un puñado por etiqueta) se puede montar un triaje automático de disputas operativas sin necesidad de un LLM grande. Es un artefacto de nicho, con cero descargas en el momento de la consulta y sin licencia declarada, por lo que debe tratarse como prototipo y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence transformer `BAAI/bge-small-en-v1.5` + cabeza de clasificación LogisticRegression (scikit-learn) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; el encoder admite cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | no disponibles oficialmente; los ejemplos de la model card mezclan inglés y suajili (code-switching) |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoder) + artefacto serializado de scikit-learn para la cabeza logística |
| Numero de clases | 4 (`fare_dispute`, `fraud_flag`, `passenger_safety`, categoría restante no listada en la model card) |
| Libreria | setfit |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el pipeline de SetFit descrito en el paper *Efficient Few-Shot Learning Without Prompts* (arXiv:2209.11055). En una primera fase se afina el sentence transformer `BAAI/bge-small-en-v1.5` mediante aprendizaje contrastivo sobre pares de frases generados a partir de las muestras etiquetadas; en una segunda fase se extraen los embeddings de esas muestras y se entrena una regresión logística como cabeza de clasificación. No hay generación autoregresiva ni decodificación: la inferencia consiste en un forward pass del encoder y una predicción lineal sobre el vector resultante.

No se dispone de información sobre el volumen del dataset de entrenamiento, su composición exacta, el número de tokens vistos ni si se aplicaron técnicas de aumento de datos. La model card incluye tres ejemplos por clase visible, lo que apunta a un régimen de pocos ejemplos por etiqueta, coherente con el diseño de SetFit. Tampoco hay documentación sobre RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo. La innovación técnica relevante es precisamente la del método: obtener un clasificador razonable con decenas de ejemplos y sin prompts, a un coste de entrenamiento muy inferior al de un LLM afinado.

## Capacidades

- Clasificación de texto en cuatro categorías de disputa operativa: `fare_dispute` (discrepancias de tarifa), `fraud_flag` (acusaciones de GPS falso o cuentas compartidas), `passenger_safety` (reportes de conducción insegura) y una cuarta clase no identificada en la información disponible.
- Procesamiento de texto con code-switching inglés-suajili, tal como evidencian los ejemplos de la model card (por ejemplo, "mteja alinireport eti nilikuwa naendesha vibaya").
- Manejo de entradas de hasta 512 tokens, suficiente para reclamaciones de uno o dos párrafos con identificadores de viaje, matrículas y fechas.
- Extracción de embeddings de frase reutilizables mediante el encoder subyacente `BAAI/bge-small-en-v1.5`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo de pensamiento (*thinking*), visión, audio ni generación de texto libre.
- Multilingüismo limitado al que ofrezca el encoder base; no hay evaluación declarada en otros idiomas.

## Casos de uso

- **Triaje automático de apelaciones en plataformas de movilidad**: enrutar cada reclamación entrante al equipo adecuado (pagos, antifraude, seguridad) según la etiqueta predicha, reduciendo el tiempo de primera respuesta. El límite de 512 tokens cubre la mayoría de mensajes de conductores.
- **Priorización de casos de seguridad del pasajero**: usar la clase `passenger_safety` como señal para escalar tickets a revisión humana inmediata, dado que estos casos tienen implicaciones legales y reputacionales.
- **Detección temprana de disputas de tarifa**: clasificar automáticamente reclamaciones por cobros inferiores al precio mostrado en la app y agregarlas por zona o franja horaria para detectar patrones sistémicos de subpago.
- **Filtrado de falsos positivos de antifraude**: agrupar las apelaciones de conductores bloqueados por GPS falso o cuentas compartidas y cruzarlas con telemetría para separar reclamaciones legítimas de intentos de evasión.
- **Enrutamiento multilingüe en atención al cliente**: al tolerar mezcla de inglés y suajili, permite procesar mensajes tal como los escriben los conductores, sin traducción previa ni normalización manual.
- **Etiquetado asistido para reentrenamiento**: usar las predicciones como preetiquetas en un flujo de anotación humana, acelerando la construcción de un corpus mayor para afinar un clasificador propio con licencia clara.
- **Análisis de tendencias operativas**: agregar las etiquetas predichas por ciudad, franja horaria o tipo de vehículo para informar decisiones de producto y políticas de soporte.

## Benchmarks y rendimiento

La model card declara la métrica `accuracy` en la configuración del widget, pero no se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para los 33,36 M de parámetros del encoder, más el espacio mínimo de la cabeza logística; en la práctica, menos de 2 GB contando overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4, L4 o RTX 3060 es más que suficiente. Para lotes grandes, una A10G o L40S permiten mayor throughput.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- También es viable en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `sentence-transformers` + `scikit-learn` en un servicio Python, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), o exportación a ONNX para servir con FastAPI/Triton. `vLLM`, `llama.cpp` y `Ollama` no aplican porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sautiyadere/sauti-dispute-classifier` | 33,36 M | 512 tokens | Clasificación de disputas (4 clases) | no disponible | Hugging Face, 0 descargas |
| `BAAI/bge-small-en-v1.5` (modelo base) | ~33 M | 512 tokens | Embeddings de frase | MIT | Hugging Face, ampliamente usado |
| SetFit + `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | ~118 M | 128-512 tokens | Clasificación few-shot multilingüe | Apache 2.0 | Hugging Face |
| Clasificador Transformer afinado (p. ej. DistilBERT) | ~66 M | 512 tokens | Clasificación supervisada | Apache 2.0 | Hugging Face |

La comparación directa con alternativas concretas no está disponible porque no existen benchmarks publicados para este modelo. Frente al encoder base, la diferencia es la cabeza de clasificación supervisada; frente a un DistilBERT afinado, el coste de entrenamiento es mucho menor pero el techo de rendimiento con datasets grandes también es inferior. La licencia indefinida es el principal punto de fricción frente a las alternativas de código abierto con licencia explícita.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no se puede asumir permiso para uso comercial; hay que contactar con el autor o tratar el modelo como no redistribuible.
- **Idiomas no documentados**: la model card no declara idiomas soportados; los ejemplos sugieren inglés y suajili, pero no hay evaluación formal de robustez fuera de ese dominio.
- **Sesgo de dominio**: entrenado con reclamaciones de conductores en Kenia (matrículas, zonas como South B, Kilimani o Ngong Road, pagos por M-Pesa); el rendimiento caerá fuera de ese contexto geográfico y operativo.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de clasificaciones erróneas confiadas en entradas ambiguas o muy cortas, como "blocked for fraud Tuesday".
- **Cuarta clase desconocida**: la model card menciona 4 clases pero solo documenta 3 etiquetas, lo que impide auditar el comportamiento completo del clasificador.
- **Ventana de 512 tokens**: reclamaciones largas con historiales de viaje extensos se truncarán y pueden perder información relevante para la clasificación.
- **Madurez**: cero descargas, un solo like y publicación reciente; no hay evidencia de uso en producción ni de validación externa.
- **Dependencia de scikit-learn**: el despliegue requiere serializar y versionar correctamente la cabeza logística junto al encoder, lo que añade complejidad frente a un modelo único en safetensors.
- **Sin métricas publicadas**: no se puede estimar la precisión real por clase ni el rendimiento en datos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautiyadere/sauti-dispute-classifier
- Modelo base `BAAI/bge-small-en-v1.5`: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio de SetFit: https://github.com/huggingface/setfit
- Paper *Efficient Few-Shot Learning Without Prompts*: https://arxiv.org/abs/2209.11055
- Blog de SetFit: https://huggingface.co/blog/setfit
- Documentación de scikit-learn LogisticRegression: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- Documentación de Sentence Transformers: https://www.sbert.net
