# loom-ai-org/wakehubert-tiny-loom

## Resumen

WakeHubert tiny loom es la exportación al formato GGUF del modelo `TigreGotico/wakehubert-tiny`, un extractor de características de audio causal de 0,64 M de parámetros destilado de HuBERT-base y especializado en detección de palabras de activación (wake words). Lo publica la organización loom-ai-org como parte del ecosistema loom.cpp, un motor de inferencia propio, y el artefacto resultante es un único fichero GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador (si procede) y el script controlador necesarios para ejecutarlo.

El modelo resuelve un problema muy concreto: convertir audio mono a 16 kHz en una secuencia de vectores de 128 dimensiones, uno por cada trama de 20 ms, de forma estrictamente causal. Esa salida no es una transcripción ni una etiqueta, sino una representación latente pensada para que encima se entrene un clasificador de wake word. La familia a la que pertenece el autor la denomina «familia 13»: audio de entrada, un vector de características por trama de salida.

Su relevancia actual es doble. Por un lado, ocupa un nicho de eficiencia extrema: 811.905 parámetros reales según los pesos en safetensors, ficheros de entre 1,2 MB y 3,3 MB según precisión, y una ventana receptiva de 2,5 s con latencia de decisión de unos 100 ms. Por otro, sirve como ejemplo de empaquetado reproducible en GGUF con cuatro precisiones verificadas numéricamente contra el modelo PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal destilado de HuBERT-base, extractor de características de audio con front end log-mel |
| Parametros totales | 811.905 (≈0,64 M según el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No es un modelo de contexto textual; ventana receptiva de 2,5 s (122 tramas de 20 ms) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_1 (front end log-mel siempre en F32) |
| Idiomas soportados | en, de, nl, fr, es, it, pt, pl (declarados; el modelo es acústico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero autodescriptivo por precisión), exportado desde safetensors del modelo base |
| Entrada | Audio mono, float, 16 kHz |
| Salida | Una fila de 128 características por trama de 20 ms (50 filas/s) |
| Causalidad | Estricta: la trama t depende solo del audio anterior a la muestra 320·(t+1) |
| Tamaño de ficheros | F32 3,3 MB; F16 2,0 MB; Q8_0 1,4 MB; Q4_1 1,2 MB |
| Librería | loom-py-rt (PyPI), requiere loom ≥ 1.0.0-rc15 |

## Arquitectura y entrenamiento

El modelo es un extractor de características causal destilado de HuBERT-base. La arquitectura concreta de capas no se detalla en la información disponible; lo que sí se especifica es su comportamiento: procesa audio mono a 16 kHz mediante un front end log-mel cuya base DFT se mantiene siempre en F32, y produce una trama de 128 dimensiones cada 20 ms. La causalidad es estricta, con un campo receptivo de 2,5 s (122 tramas), y el modelo fue entrenado para describir cada trama de HuBERT con 100 ms de retraso, de modo que un detector construido sobre sus salidas reacciona aproximadamente ese tiempo después de que termine la palabra.

El entrenamiento original corresponde a TigreGotico, que destiló el modelo a partir de HuBERT-base para detección de wake words. No se dispone en la información proporcionada de datos sobre número de tokens de audio, composición del dataset, ni si hubo RLHF o DPO (en un modelo acústico de este tipo no serían el mecanismo habitual). La exportación a GGUF la realiza loom-exporter: un único fichero que embebe el grafo, el tokenizador y el script controlador, con las convoluciones y proyecciones cuantizadas en las variantes Q8_0 y Q4_1. El autor documenta fidelidad numérica frente a PyTorch: F32 con diferencia máxima de 3,4e-5 y coseno 1,000000 por trama; F16 con coseno medio 1,000000 y peor trama 0,999998; Q8_0 con coseno medio 0,99992 y peor trama 0,99978 (mejor que el `wakehubert_int8.onnx` del autor original, con 0,9975); Q4_1 con coseno medio 0,987 y peor trama 0,972, lo que constituye un espacio de características mediblemente distinto.

## Capacidades

- Extracción de embeddings de audio: genera un vector de 128 dimensiones por cada trama de 20 ms de audio mono a 16 kHz (50 tramas por segundo; 550 tramas para un clip de 11 s).
- Inferencia causal en streaming: `speech2embeddings.stream()` procesa el audio según llega, ejecutando el grafo de una pasada sobre las últimas 122 tramas (2,44 s) por cada push, con desviación máxima de 4,8e-06 respecto a una llamada completa.
- Procesamiento por clip completo: `speech2embeddings.infer(audio)` devuelve un objeto `FrameEmbeddings` con `rows`, `times`, `dim` y `frame_rate`.
- Base para clasificación de wake words: las filas de salida alimentan un clasificador que se entrena sobre una ventana de tramas; la regla de decisión la define el usuario.
- Multilingüismo declarado: en, de, nl, fr, es, it, pt y pl, aunque al ser un modelo acústico la cobertura lingüística depende del entrenamiento del clasificador posterior.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio-a-texto.

## Casos de uso

- Detección de wake words en dispositivos embebidos: con 811.905 parámetros y ficheros de 1,2 a 3,3 MB, el modelo cabe en microcontroladores y SoCs de bajo consumo; se entrena un clasificador ligero sobre las tramas de 128 dimensiones y se ejecuta en local sin conexión.
- Asistentes de voz siempre activos en móvil o wearable: el modo streaming entrega cada trama en cuanto llegan sus 320 muestras, con una ventana receptiva de 2,44 s por push, lo que permite un consumo de CPU y memoria mínimo y constante.
- Preprocesado de pipelines de reconocimiento de voz: las características por trama pueden sustituir a un front end mel convencional en etapas posteriores de un sistema ASR, con la ventaja de ser causales y, por tanto, compatibles con transcripción en tiempo real.
- Filtrado y segmentación de audio en servidores: procesar grandes volúmenes de grabaciones para localizar regiones con habla o eventos acústicos, usando la dimensión temporal que acompaña a cada fila (`times`) para alinear segmentos.
- Prototipado rápido de sistemas de activación por voz en varios idiomas: los ocho idiomas declarados permiten entrenar clasificadores específicos por lengua sobre el mismo extractor congelado, reutilizando una única representación.
- Investigación en destilación y cuantización: el repositorio documenta la fidelidad de cada precisión frente a PyTorch, lo que lo convierte en un caso de referencia para medir el impacto de Q8_0 y Q4_1 en tareas acústicas posteriores.
- Integración en aplicaciones de escritorio o web mediante loom-py: la API de alto nivel (`speech2embeddings`) abstrae el ventaneo y el muestreo, y el driver embebido expone cada argumento disponible para ajustes finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que evalúa el modelo base con una única wake word en inglés y un solo benchmark, y advierte que la concordancia con el modelo profesor predice mal la calidad de detección, por lo que recomienda juzgar el modelo (y cada fichero cuantizado) por el rendimiento de un detector entrenado sobre sus características.

Los únicos datos numéricos publicados son de fidelidad frente al modelo PyTorch original:

| Fichero | Tamaño | Coseno medio | Peor trama | Notas |
|---|---|---|---|---|
| wakehubert-tiny-f32.gguf | 3,3 MB | 1,000000 | 1,000000 | Diferencia máxima 3,4e-5 sobre características de hasta 11,5 |
| wakehubert-tiny-f16.gguf | 2,0 MB | 1,000000 | 0,999998 | En CPU x86 corre unas 1,4x más lento que F32 |
| wakehubert-tiny-q8_0.gguf | 1,4 MB | 0,99992 | 0,99978 | Mejor que el `wakehubert_int8.onnx` del autor (0,9975) |
| wakehubert-tiny-q4_1.gguf | 1,2 MB | 0,987 | 0,972 | Espacio de características distinto; requiere revalidar o reentrenar el detector |

## Requisitos de hardware

- VRAM: inferior a 10 MB en cualquier precisión; el modelo completo ocupa entre 1,2 y 3,3 MB en disco y puede residir íntegramente en memoria o en caché L2 de una CPU moderna.
- GPU: no requiere GPU. Funciona en CPU x86 y, por su tamaño, es viable en ARM, RISC-V y microcontroladores con suficiente memoria.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas), aunque no aporta ventaja frente a CPU.
- Despliegue: exclusivamente mediante loom-py / loom.cpp (`pip install -U "loom-py-rt[hub]>=1.0.0"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia: la decisión de un detector aguas abajo llega unos 100 ms después de que termine la palabra, por el entrenamiento con retraso de 100 ms. En streaming, cada trama se entrega en cuanto llegan sus 320 muestras.
- Rendimiento relativo: en CPU x86, F16 es aproximadamente 1,4x más lento que F32; los ficheros cuantizados corren a la velocidad de F32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| wakehubert-tiny-loom (este) | 811.905 | 2,5 s receptivos, tramas de 20 ms | 8 declarados | Apache 2.0 | GGUF (loom.cpp) | Hugging Face, 174 descargas |
| TigreGotico/wakehubert-tiny | ≈0,64 M | Igual (modelo base) | 8 declarados | Apache 2.0 | PyTorch / ONNX int8 | Hugging Face |
| HuBERT-base (profesor) | ≈95 M | No causal, contexto completo | Inglés principalmente | No disponible en la información | PyTorch | Hugging Face |

Frente a HuBERT-base, la diferencia clave es la causalidad y el tamaño: el modelo destilado es unas 100 veces menor y apto para streaming, a costa de una representación de 128 dimensiones y una ventana receptiva limitada a 2,5 s. Frente al modelo base original, la exportación GGUF añade ficheros cuantizados verificados numéricamente y un runtime propio. No se dispone de datos de benchmarks para comparar la calidad de detección con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, etiquetas ni decisiones; solo características que requieren un clasificador entrenado encima.
- Causalidad con retraso: el modelo describe cada trama con 100 ms de retraso, por lo que un detector reacciona aproximadamente ese tiempo después de que termine la palabra.
- Ventana receptiva limitada: 2,5 s (122 tramas); los clips de menos de 320 muestras no producen ninguna trama.
- Requisito estricto de entrada: audio mono a 16 kHz; cualquier otra frecuencia o número de canales queda fuera de contrato.
- Dependencia de versión: requiere loom 1.0.0-rc15 o posterior; versiones anteriores rechazan el fichero en la API de alto nivel y solo permiten `model.infer(waveform=audio)` con una lista plana.
- Q4_1 altera el espacio de características (coseno medio 0,987, peor trama 0,972): un detector entrenado con F32 debe revalidarse o reentrenarse con esa precisión.
- F16 no aporta velocidad: en CPU x86 es unas 1,4x más lento que F32, por lo que es una elección de tamaño, no de rendimiento.
- Evaluación escasa: el autor solo evalúa con una wake word en inglés y un benchmark, y advierte que la concordancia con el profesor predice mal la calidad de detección.
- Idiomas declarados sin evidencia publicada: la cobertura de los ocho idiomas depende del clasificador que se entrene encima, no del extractor en sí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en el detector construido sobre las características.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del modelo base TigreGotico/wakehubert-tiny.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/wakehubert-tiny-loom
- Modelo base: https://huggingface.co/TigreGotico/wakehubert-tiny
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio y API loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/
