# FINAL-Bench/VKORE-46M-NPU

## Resumen

VKORE-46M-NPU es un modelo de lenguaje de 45,8 millones de parámetros desarrollado por FINAL-Bench (Corea del Sur) y entrenado íntegramente desde cero —sin pesos preentrenados— sobre una NPU de solo inferencia, la Rebellions ATOM-Max. Es un transformer decoder-only denso con RoPE, RMSNorm, SwiGLU y GQA, de 12 capas, anchura oculta 512, 8 cabezas de atención (2 para clave/valor) y un vocabulario a nivel de carácter de 256 entradas.

Su relevancia no está en la calidad del texto que genera, sino en la demostración técnica: el sector asumía que una NPU diseñada exclusivamente para inferencia no puede ejecutar retropropagación, y por tanto no puede entrenar. Los autores ejecutaron forward y backward en 32 chips ATOM-Max (primera generación, lanzada en 2025), con un error relativo máximo de gradiente de 6,6e-7 frente a autograd de PyTorch y una similitud coseno de aproximadamente 0,9999 por paso.

El modelo se entrenó en unas horas con el split de validación de TinyStoriesV2-GPT4 (unos 22,5 millones de tokens, 5.493 bloques de contexto 256), reduciendo la pérdida de entropía cruzada de 5,65 a 0,42. Según los autores, no existe precedente público de un modelo preentrenado desde cero en una NPU de solo inferencia, y la técnica desarrollada está en proceso de patente y pendiente de publicación en un artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, SwiGLU y GQA |
| Parametros totales | 45,8 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | en, ko (declarados); los datos de entrenamiento son exclusivamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`); no hay safetensors ni GGUF publicados |
| Capas | 12 |
| Anchura oculta | 512 |
| Cabezas de atencion | 8 (2 para clave/valor) |
| Vocabulario | 256 (tokenización a nivel de carácter/byte) |
| Tokens de entrenamiento | Aproximadamente 22,5 millones (5.493 bloques de 256 tokens) |
| Dataset | roneneldan/TinyStories, split de validación TinyStoriesV2-GPT4 |
| Hardware de entrenamiento | 32 chips Rebellions ATOM-Max (acelerador de solo inferencia) |
| Perdida final | 0,42 (entropía cruzada), partiendo de 5,65 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional para su escala: 12 capas, anchura 512, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) con 8 cabezas de consulta y 2 de clave/valor. El vocabulario es de 256 símbolos, es decir, tokenización a nivel de carácter sobre valores de byte de 0 a 255, lo que simplifica el pipeline y elimina la dependencia de un tokenizador entrenado aparte.

El preentrenamiento partió de inicialización aleatoria y usó el dataset público TinyStories (concretamente el split de validación de TinyStoriesV2-GPT4), sin preprocesamiento adicional, con el objetivo declarado de que cualquiera pueda reproducir el entrenamiento sobre los mismos datos. La innovación no está en el modelo sino en el sistema: los autores implementaron forward y backward en una NPU de solo inferencia, con una retropropagación escrita a mano que replica autograd de PyTorch con un error relativo máximo de 6,6e-7 y una correlación coseno de aproximadamente 0,9999 por paso en un solo chip sin sincronización. La sincronización entre los 32 chips es de estilo DiLoCo (no un all-reduce por paso), lo que explica que la pérdida final en NPU (0,42) quede por encima de la obtenida en 2 GPU B200 (0,25) bajo la misma inicialización, datos y planificador. El método concreto de entrenamiento desde cero en NPU no se ha divulgado: está en solicitud de patente y se publicará en un artículo anunciado.

## Capacidades

- Generación de texto narrativo simple en inglés: el ejemplo de la model card (`Once upon a time`) produce un relato infantil coherente de varias frases.
- Modelado de lenguaje causal a nivel de carácter con vocabulario de 256 símbolos y contexto de 256 tokens.
- Entrenamiento desde cero verificado en hardware de solo inferencia, con fidelidad numérica de gradientes medida frente a autograd de PyTorch.
- Reproducibilidad: datos públicos y arquitectura estándar, replicables en GPU con el mismo dataset y planificador.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No dispone de capacidad de código, matemáticas, visión ni audio.
- No dispone de modo de razonamiento (thinking mode) ni decodificación especulativa.
- Capacidad multilingüe: el coreano figura como idioma declarado en los metadatos, pero no hay datos de entrenamiento en coreano, por lo que no está verificado ni respaldado por el proceso de entrenamiento.

## Casos de uso

- Validación de retropropagación en aceleradores de inferencia: sirve como caso de referencia para comprobar que el backward implementado en una NPU coincide con autograd (error relativo de 6,6e-7, coseno 0,9999) antes de escalar a modelos mayores.
- Evaluación de coste total de propiedad frente a GPU: permite medir en un modelo real de 45,8M parámetros la diferencia de precio de adquisición, consumo y tiempo de entrega entre 32 NPU ATOM-Max y un servidor de ocho GPU clase Blackwell, tal como plantea la model card.
- Docencia y formación en entrenamiento desde cero: el checkpoint (0,2 GB), el dataset público y la arquitectura estándar permiten montar prácticas completas de preentrenamiento y diagnóstico de curvas de pérdida en un portátil o en un solo acelerador.
- Generación de datos sintéticos simples: puede producir cuentos infantiles breves para aumentar corpus de experimentos de curriculum learning o para pruebas de pipelines de limpieza de datos, siempre dentro del dominio de TinyStories.
- Investigación en sincronización distribuida: la comparación entre el run de 32 chips con sincronización estilo DiLoCo (pérdida 0,42) y el de 2 GPU B200 (pérdida 0,25) es un banco de pruebas controlado para estudiar el impacto de la frecuencia de sincronización en la convergencia.
- Despliegue en dispositivos de borde y baja potencia: con menos de 100 MB en FP16, cabe en cualquier SoC con memoria unificada y sirve para validar cadenas de inferencia en NPU con el SDK rbln de Rebellions.
- Pruebas de regresión de toolchains de compilación para NPU: al ser un modelo pequeño y determinista, es útil como caso mínimo para verificar conversión, compilación y ejecución de grafos en el runtime de la NPU antes de pasar a modelos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Los únicos datos cuantitativos publicados son métricas de entrenamiento y de fidelidad numérica:

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de entropía cruzada | 5,65 → 0,42 | Inicialización aleatoria hasta el final del entrenamiento |
| Pérdida final en GPU | 0,25 | 2 GPU B200, misma inicialización, datos y planificador |
| Error relativo máximo de gradiente | 6,6e-7 | Backward propio frente a autograd de PyTorch |
| Similitud coseno por paso | Aproximadamente 0,9999 | Gradientes de NPU frente a referencia estándar, 1 chip sin sincronización |
| Throughput | Equiparable a 2 GPU B200 | 32 chips NPU frente a 2 GPU B200, mismas condiciones; no se publican tokens por segundo |
| Divergencia de convergencia multichip | 0,42 (NPU) frente a 0,25 (B200) | Atribuida a la sincronización reducida estilo DiLoCo |

Los propios autores advierten de que la correlación entre dos curvas de pérdida descendentes es evidencia débil, y que la fidelidad numérica por paso y la convergencia multichip son propiedades independientes.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 183 MB en FP32, 92 MB en FP16/BF16, 46 MB en INT8 y unos 23 MB en INT4 (estimación a partir de 45,8M parámetros; no hay pesos cuantizados publicados).
- Memoria para caché KV: despreciable, dado el contexto máximo de 256 tokens y 2 cabezas de clave/valor por capa.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni similares. Funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX, iGPU moderna o SoC de borde (Raspberry Pi, Jetson, teléfonos). El límite práctico es la memoria del dispositivo, no la del modelo.
- Aceleradores específicos: el hardware de referencia son los 32 chips Rebellions ATOM-Max usados en el entrenamiento, con el runtime rbln y la librería transformers.
- Opciones de despliegue: `transformers` con PyTorch es la vía documentada (carga del checkpoint con `torch.load("tiny_ckpt.pt")`). No hay conversiones a GGUF publicadas, por lo que llama.cpp, Ollama o LM Studio no están soportados de serie; tampoco hay pesos en safetensors para vLLM o TGI. Cualquier integración de ese tipo requeriría conversión propia, teniendo en cuenta el tokenizador a nivel de carácter.
- Latencia y throughput: no disponibles en cifras absolutas. La model card solo afirma paridad de throughput con una ejecución en 2 GPU B200 y menciona que el entrenamiento completo llevó "unas pocas horas" en 32 chips.

## Comparativa con modelos similares

La categoría es la de modelos de lenguaje minúsculos (por debajo de 50M parámetros) entrenados sobre TinyStories. La información disponible solo permite comparar con fiabilidad los datos del modelo reseñado; el resto de campos se marcan como no disponibles cuando no están verificados en la documentación consultada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| VKORE-46M-NPU | 45,8M | 256 | en, ko (ko no verificado) | Apache 2.0 | Preentrenado desde cero en NPU de solo inferencia; checkpoint PyTorch |
| roneneldan/TinyStories-33M | 33M | No disponible | en | No verificada en la información disponible | Modelo de referencia de la familia TinyStories, entrenado sobre el mismo dataset |
| roneneldan/TinyStories-28M | 28M | No disponible | en | No verificada en la información disponible | Variante menor de la misma familia |
| GPT-2 small | 124M | 1024 | en | No verificada en la información disponible | Referencia histórica de la categoría, con tokenizador BPE y mucho más contexto |

No se han publicado comparaciones de rendimiento (benchmarks) frente a estos modelos en la información disponible. El interés diferencial de VKORE-46M-NPU es el hardware de entrenamiento, no su calidad de generación.

## Limitaciones y advertencias

- Modelo de demostración de investigación: la propia model card lo describe como una prueba de concepto a pequeña escala, no apta para producción.
- Contexto de 256 tokens y vocabulario de carácter de 256 símbolos: insuficiente para diálogo, documentos o cualquier tarea que requiera más de unas pocas frases de memoria.
- Dominio muy estrecho: entrenado solo con TinyStories, un corpus de relatos infantiles generado de forma sintética. Fuera de ese registro, la calidad se degrada de forma acusada.
- Riesgo elevado de alucinación y de incoherencia fuera del dominio, y de repetición o deriva dentro de él.
- Sesgos: el corpus TinyStories es sintético y de vocabulario infantil; puede arrastrar estereotipos de género, familia o rol presentes en los relatos generados y no representa el uso real del lenguaje.
- El coreano aparece como idioma soportado en los metadatos, pero no hay evidencia de entrenamiento en coreano; debe tratarse como no soportado.
- Restricción de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero el valor práctico del modelo en un producto comercial es muy limitado.
- Falta de reproducibilidad en el punto clave: el método que permite la retropropagación en la NPU está en solicitud de patente y no se ha publicado; solo se ha anunciado un artículo futuro. La reproducción del entrenamiento en NPU no es posible por ahora.
- Brecha de convergencia reconocida por los autores: la pérdida final en NPU (0,42) es un 68 % superior a la de la ejecución en B200 (0,25), por el esquema de sincronización reducida entre 32 chips.
- Los datos de entrenamiento usan el split de validación de TinyStoriesV2-GPT4, no el de entrenamiento, lo que conviene tener en cuenta al diseñar evaluaciones para evitar solapamientos.
- No hay pesos cuantizados, safetensors ni conversiones GGUF publicadas: cualquier despliegue fuera de PyTorch y del ecosistema Rebellions exige trabajo de conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/VKORE-46M-NPU
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Directorio de comparación NPU frente a B200: carpeta `comparison/` del repositorio del modelo
- Artículo técnico: no disponible (anunciado como publicación futura)
- Repositorio de código: no disponible
- Demos: no disponibles
- Búsqueda web: los resultados obtenidos no contienen enlaces relevantes sobre el modelo; solo definiciones de diccionario en francés de la palabra "final", sin relación con el proyecto.
