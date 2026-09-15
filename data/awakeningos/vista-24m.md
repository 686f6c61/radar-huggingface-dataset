# AwakeningOS/VISTA-24M

## Resumen

VISTA-24M es un modelo de lenguaje causal de 24,28 millones de parámetros desarrollado por AwakeningOS (experimento independiente de Yusuke Maeda) y publicado bajo licencia MIT. Su nombre corresponde a Variance-Informed SwiGLU Transformer Architecture, una variante de transformer denso que alimenta la red feed-forward con tres fuentes de información: la representación actual, los cambios introducidos por la capa anterior (tanto en la atención como en la FFN) y la varianza coordenada de los valores agregados por la atención. El objetivo declarado es investigar si la dispersión de los valores, y no solo su media ponderada, aporta señal útil al cómputo posterior.

El modelo tiene 7 capas, dimensión oculta de 256, vocabulario de 16.384 tokens y un contexto de entrenamiento de hasta 512 posiciones. Se entrenó sobre el corpus BabyLM 2026 English Strict-Small (10 millones de palabras) con 10 pasadas, lo que equivale a 100 millones de palabras de exposición; el checkpoint publicado por defecto corresponde a las 80 millones de palabras y su contador interno registra 129.927.852 objetivos válidos de siguiente token. Es un modelo base de continuación de texto, en inglés, sin plantilla de chat ni ajuste por instrucciones.

Su relevancia es acotada y muy específica: es un banco de pruebas reproducible para estudiar arquitecturas eficientes y análisis de representaciones con recursos mínimos, dentro del ecosistema BabyLM. No compite con modelos de propósito general: su adopción actual es nula (0 descargas y 0 likes en HuggingFace en el momento de la consulta) y su valor es fundamentalmente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, VISTA (Variance-Informed SwiGLU Transformer Architecture); atención causal multi-cabeza con puerta de salida sigmoide aprendida, RoPE, RMSNorm y FFN SwiGLU |
| Parametros totales | 24.281.104 según los pesos safetensors publicados; la model card indica 24.281.088 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 512 posiciones de token (contexto de entrenamiento) |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas. Los pesos se guardan en FP32 y el adaptador usa autocast BF16 en CUDA |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, con código PyTorch personalizado (`custom_code`, requiere `trust_remote_code`) |
| Capas | 7 |
| Dimension de la representacion principal | 256 |
| Cabezas de atencion | 8 cabezas de consulta / 8 de clave-valor, 32 dimensiones por cabeza |
| Anchura intermedia de la FFN | 896 |
| Vocabulario | 16.384 tokens; matrices de entrada y salida no compartidas (untied) |
| Parametros de la proyeccion de varianza | 257 -> 1.792 en cada capa |
| Router de diferencias | Proyecciones query/key de 16 dimensiones, softmax sobre dos entradas |
| Corpus de entrenamiento | BabyLM 2026 English Strict-Small, 10 millones de palabras, 10 pasadas |
| Checkpoints publicados | 19 revisiones: 1-9M, y despues de 10M a 100M en pasos de 10M |

## Arquitectura y entrenamiento

VISTA parte de un transformer causal denso convencional y modifica únicamente la entrada de la red feed-forward. Cada capa lee los tokens previos con atención causal, suma la actualización a la representación actual y normaliza con RMSNorm. A continuación, la FFN recibe tres cosas: la representación actualizada, dos vectores de ancho completo (256 dimensiones) que describen la actualización de atención y la actualización de FFN de la capa inmediatamente anterior, y una proyección dedicada de la varianza coordenada calculada con los mismos pesos de atención que la media ponderada (dirección de 256 dimensiones más un valor de magnitud). Un router de 16 dimensiones usa la representación actual para ponderar las contribuciones proyectadas de las dos diferencias de la capa previa, y todo ello se combina dentro de las ramas gate y up de SwiGLU. Ambas actualizaciones residuales preservan aproximadamente RMS unitaria. La información de capa previa se aplica de la capa 2 a la 7.

El entrenamiento se realizó sobre el corpus BabyLM 2026 English Strict-Small, con 10 pasadas completas sobre 10 millones de palabras. El modelo es estrictamente base: no hay información sobre RLHF, DPO u otro ajuste por preferencias en la documentación disponible, ni sobre composición detallada del dataset más allá de la referencia a BabyLM. La innovación técnica destacable es precisamente el uso de la varianza de la atención como entrada adicional a la FFN, junto con el router de diferencias entre capas; el repositorio incluye una descripción matemática en `ARCHITECTURE.md` y el núcleo del modelo en `dense.py`.

## Capacidades

- Generación de texto en inglés mediante continuación de prefijo (modelo base de siguiente token, sin plantilla de chat).
- Puntuación de verosimilitud de secuencias: admite `labels` junto con `attention_mask` para calcular likelihoods, con desplazamiento interno de etiquetas y exclusión de transiciones de padding.
- Clasificación downstream: la clase `AutoModel` también está registrada para clasificadores, aunque `output_hidden_states` solo expone la representación final.
- Distinciones gramaticales: según la model card, el modelo es más fuerte en discriminaciones gramaticales y más débil en el seguimiento de entidades a lo largo de un texto cambiante.
- Análisis de representaciones internas: por su tamaño y su diseño, está pensado para inspeccionar cómo la varianza y las diferencias entre capas afectan al cómputo.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Multilingüismo: no disponible; el modelo es monolingüe en inglés.
- Decodificación: el release incluye un decodificador ByteLevel para texto generado legible.

## Casos de uso

- Investigación en arquitecturas eficientes: permite entrenar y evaluar una variante arquitectónica completa (7 capas, 24M de parámetros, 512 tokens de contexto) en hardware de consumo, aislando el efecto de la entrada de varianza en la FFN respecto a un transformer denso equivalente.
- Análisis de representaciones y mecanística interpretativa: los 19 checkpoints intermedios (1-9M y de 10M a 100M) permiten estudiar la evolución de las representaciones y de la señal de varianza a lo largo del entrenamiento.
- Puntuación de verosimilitud en pipelines lingüísticos: con `labels` y `attention_mask` se puede usar para puntuar continuaciones y comparar hipótesis en tareas de evaluación gramatical sobre corpus en inglés.
- Clasificación de texto ligera: el registro de `AutoModel` para clasificadores downstream permite reutilizar el encoder causal en tareas de clasificación de secuencias cortas en inglés.
- Reproducción de experimentos BabyLM: al fijar una revisión concreta (o un hash de commit) se pueden replicar condiciones de entrenamiento y comparar puntos de control bajo el mismo tokenizador original preservado en `training/original_tokenizer/`.
- Docencia y prototipado en CPU o GPU de gama baja: al ocupar menos de 100 MB en FP32, sirve para demostrar el ciclo completo de carga con `trust_remote_code`, generación y evaluación sin infraestructura dedicada.
- Evaluación de decodificación sin caché KV: al recomputar el prefijo en cada paso, es un banco de pruebas para medir el coste real de no usar caché en secuencias de hasta 512 tokens.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son dos medias agregadas correspondientes al checkpoint de 80 millones de palabras:

| Metrica | Resultado (checkpoint 80M) |
|---|---|
| Media de seis tareas zero-shot | 48,07 |
| Media de siete categorias NLP de BabyLM | 50,12 |

No se han publicado resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 97 MB solo para pesos en FP32 (24.281.104 parámetros x 4 bytes) y unos 49 MB en BF16. Sumando activaciones para 512 posiciones y dimensión 256, el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se requiere hardware de gama alta. El backend por defecto usa PyTorch SDPA y funciona sin instalar FlashAttention.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo actual, incluidas tarjetas con 4 GB o menos, y también es viable la inferencia en CPU.
- Opciones de despliegue: únicamente Transformers con `trust_remote_code=True`, cargando código PyTorch personalizado del repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. Como dato relevante de diseño, la implementación no soporta caché KV y recomputa el prefijo en cada paso de generación, por lo que el coste de generar secuencias largas crece de forma desfavorable aunque el modelo sea pequeño.
- Memoria del repositorio: 1,9 GB, muy superior al tamaño de los pesos, debido a los 19 checkpoints publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Corpus de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VISTA-24M | 24,28 M | 512 tokens | BabyLM 2026 English Strict-Small, 10 M de palabras, 10 pasadas | MIT | HuggingFace, requiere `trust_remote_code`, sin cuantizaciones publicadas |
| Pythia-14M | 14 M | 2.048 tokens | The Pile | Apache 2.0 | HuggingFace, ecosistema estandar de Transformers |
| Pythia-70M | 70 M | 2.048 tokens | The Pile | Apache 2.0 | HuggingFace, ecosistema estandar de Transformers |
| GPT-2 small | 124 M | 1.024 tokens | WebText | Licencia MIT modificada | HuggingFace, ampliamente soportado |

Los datos de rendimiento comparativo entre VISTA-24M y estas alternativas no están disponibles en la información proporcionada; solo se conocen las dos medias agregadas de VISTA-24M indicadas en el apartado anterior, que no son directamente equiparables a las evaluaciones publicadas de los otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card y la información recopilada no documentan sesgos ni análisis de sesgo del corpus BabyLM utilizado.
- Riesgo de alucinación: alto en términos relativos, dado que se trata de un modelo base de 24M de parámetros entrenado con 100 millones de palabras de exposición; no tiene conocimiento factual fiable más allá de patrones de continuación.
- Limitaciones de contexto: solo 512 posiciones de token, tanto en entrenamiento como en uso recomendado; prompt más continuación deben caber en ese rango.
- Limitaciones de idioma: monolingüe en inglés, con vocabulario de 16.384 tokens; el rendimiento en castellano no está soportado ni evaluado.
- Sin instrucciones ni chat: es un modelo base de siguiente token; debe usarse con continuaciones de texto y no con plantillas conversacionales.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo carga código remoto personalizado; es imprescindible revisar dicho código antes de habilitar `trust_remote_code`, tal como advierte el propio autor.
- Sin caché KV: la generación recomputa el prefijo en cada paso, lo que penaliza la latencia en salidas largas y limita su uso en servicios interactivos.
- Exposición limitada de estados internos: `output_hidden_states` solo devuelve la representación final, lo que restringe análisis que requieran estados intermedios.
- Adopción y validación: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks desglosados ni evaluación externa conocida; no es un modelo apto para producción sin validación propia.
- Discrepancia menor en el recuento de parámetros entre los pesos safetensors (24.281.104) y la model card (24.281.088).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwakeningOS/VISTA-24M
- Perfil del autor en HuggingFace: https://huggingface.co/AwakeningOS
- Repositorio GitHub del proyecto: https://github.com/AwakeningOS/AwakeningOS
- Organización en GitHub: https://github.com/AwakeningOS/
- Descripción arquitectónica incluida en el repositorio: `ARCHITECTURE.md`
- Implementación del núcleo del modelo incluida en el repositorio: `dense.py`
- Tokenizador original preservado: `training/original_tokenizer/`
- Paper: no disponible
- Demo: no disponible
