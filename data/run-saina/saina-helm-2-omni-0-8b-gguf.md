# run-saina/saina-helm-2-omni-0.8b-GGUF

## Resumen

Saina Helm 2 Omni 0.8B es un modelo de decisión multimodal desarrollado por run-saina que lee texto, imágenes y audio y responde preguntas tipadas devolviendo probabilidades, sin generar texto libre. Esta ficha corresponde a su build en GGUF para llama.cpp, publicada como `run-saina/saina-helm-2-omni-0.8b-GGUF` y cuantizada a partir del modelo original `run-saina/saina-helm-2-omni-0.8b`. El modelo tiene 752.393.024 parámetros reales (aproximadamente 0,75 mil millones) y una ventana de contexto por defecto de 32.768 tokens, espectrogramas e imágenes incluidos.

Su planteamiento es inusual en el ecosistema abierto: no es un generador conversacional, sino un clasificador de decisión que resuelve varias preguntas en una sola pasada sobre un prompt compartido. Las imágenes se leen primero (cada clip de audio se convierte en un espectrograma log-mel y se procesa como una imagen), después el contexto y todas las preguntas, y finalmente un slot de lectura por pregunta. En cada slot, el estado oculto pasa por una cabeza propia que combina una capa lineal sobre los códigos de respuesta con 16 expertos residuales pequeños, de los cuales se enrutan los 2 mejores.

Es relevante ahora porque ofrece una alternativa compacta y desplegable en local (1,7 GB de repositorio) para tareas de clasificación y decisión multimodal donde un LLM generativo sería desproporcionado y más costoso. El precio de esa eficiencia es una integración más delicada: la cabeza no es lineal y lee varias posiciones, por lo que se distribuye como `experts.safetensors` y se ejecuta en NumPy, y las herramientas estándar de llama.cpp pueden cargar los ficheros pero no producir las respuestas de Helm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje transformer (el tag del repositorio indica `qwen3_5`) con torre de visión y cabeza de decisión de 16 expertos enrutados (top-2); pipeline `any-to-any` |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | no disponible (los 16 expertos residuales se enrutan top-2, pero el desglose de parámetros activos no se publica) |
| Longitud de contexto | 32.768 tokens por defecto (`n_ctx` configurable), incluyendo imágenes y espectrogramas |
| Tipos de cuantizacion | F16 únicamente en este repositorio; el autor advierte de que no se debe cuantizar sin volver a verificar la paridad |
| Idiomas soportados | no disponible (los ejemplos de la model card usan habla en inglés; no se declara cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone F16 y proyector multimodal F16), `experts.safetensors` en FP32 para la cabeza, más `head-config.json` |

## Arquitectura y entrenamiento

El sistema se compone de varias piezas acopladas. El backbone de lenguaje se distribuye como `saina-helm-2-omni-0.8b-f16.gguf` (1,5 GB), la torre de visión y su fusor como `mmproj-saina-helm-2-omni-0.8b-f16.gguf` (205 MB, proyector `mtmd` de llama.cpp) y la cabeza de respuestas de Helm con 16 expertos enrutados como `experts.safetensors` más `head-config.json` en FP32. El audio no tiene torre propia: cada clip se transforma en un espectrograma log-mel y se procesa por la misma vía visual, lo que unifica el tratamiento de las tres modalidades.

El mecanismo de decisión es el rasgo diferencial. Todas las preguntas comparten un único prompt: primero las imágenes (y espectrogramas), después el contexto y el conjunto de preguntas, y a continuación un slot de lectura por pregunta. En cada slot, el estado oculto atraviesa la cabeza de Helm (capa lineal sobre los códigos de respuesta más 16 expertos residuales pequeños con enrutado top-2). Un softmax sobre los códigos ofrecidos produce probabilidades de elección única y un sigmoide por código produce probabilidades multietiqueta. El autor reporta una paridad frente al runtime oficial en PyTorch FP32 con desviaciones máximas de 0,00041 en todas las peticiones de prueba (solo texto, una captura de pantalla, un tablero de ajedrez, un gráfico, un clip de audio y una imagen junto a un audio, incluyendo una pregunta multietiqueta), detalladas en `parity.json`.

No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El prompt se construye con los ficheros de configuración del propio modelo (`config.json`, `tokenizer*.json`, `chat_template.jinja`, `preprocessor_config.json`) leídos por el paquete `saina[tokenize,media]`, y las imágenes se redimensionan a la rejilla de parches del modelo antes de llegar a llama.cpp para que este no las redimensione de nuevo.

## Capacidades

- Clasificación y decisión multimodal sobre texto, imágenes y audio, con salida de probabilidades en lugar de texto generado.
- Preguntas de elección única (softmax sobre los códigos ofrecidos) y preguntas multietiqueta (sigmoide por código).
- Procesamiento de hasta 8 imágenes por petición en PNG, JPEG o WebP.
- Procesamiento de hasta 4 clips de audio por petición en WAV, FLAC, MP3, Ogg o WebM, de hasta 10 segundos cada uno.
- Razonamiento visual sobre capturas de pantalla, tableros de ajedrez y gráficos, según los ejemplos de la model card.
- Clasificación de audio y voz, incluyendo detección de locuciones sintetizadas o convertidas por ordenador (spoofing).
- Múltiples preguntas en una sola pasada, con un slot de lectura por pregunta y resultados en el orden de las opciones proporcionadas.
- Ejecución local mediante llama.cpp con offload a GPU opcional (`gpu_layers`), hilos de CPU configurables (`threads`) y contexto ajustable (`n_ctx`).
- No dispone de generación de texto, tool calling, function calling, modo de razonamiento explícito ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Detección de fraude telefónico y spoofing de voz: el modelo acepta un clip de audio y una pregunta tipada como «¿esta voz está sintetizada o convertida por ordenador?» con opciones Sí/No. Es adecuado porque clasifica el audio sin necesidad de transcribirlo y devuelve una probabilidad directamente consumible por un motor de reglas.
- Análisis de tableros de ajedrez o juegos de mesa: con una imagen del tablero y una pregunta de elección múltiple («juegan negras, ¿cuál es la mejor jugada?») devuelve una distribución de probabilidad sobre las jugadas candidatas, útil en herramientas de entrenamiento o análisis asistido.
- Interpretación de gráficos y dashboards: a partir de una captura de un gráfico financiero o de monitorización, responde a preguntas cerradas sobre tendencias, valores o anomalías, lo que encaja en alertas automáticas donde no se necesita una explicación en lenguaje natural.
- Triage de atención al cliente: con una captura de pantalla o un audio corto del usuario, clasifica la intención o la categoría del problema en una sola pasada y con varias preguntas simultáneas, reduciendo el coste frente a un LLM generativo.
- Etiquetado automático de datasets multimodales: al procesar pares imagen-audio permite asignar etiquetas de categoría, calidad o correspondencia entre modalidades, aprovechando los límites de 8 imágenes y 4 clips por petición.
- Verificación de documentos y formularios: dada la imagen de un documento, responde a preguntas cerradas sobre su validez, tipo o presencia de campos concretos, con salida probabilística apta para umbrales de decisión.
- Moderación de contenido multimodal: clasifica combinaciones de imagen y texto (o audio) contra políticas definidas como preguntas de elección única o multietiqueta, en lugar de generar una explicación.
- Componente de decisión en sistemas embebidos o de borde: al ocupar 1,7 GB en F16 y funcionar en CPU, puede integrarse como clasificador local en dispositivos con recursos limitados donde no cabe un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de evaluación es la paridad frente al runtime oficial en PyTorch FP32: desviación máxima de 0,00041 en las probabilidades de todas las peticiones de prueba (solo texto, captura de pantalla, tablero de ajedrez, gráfico, clip de audio, imagen con audio y una pregunta multietiqueta), documentada en `parity.json`.

| Metrica | Valor |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponible |
| Desviacion maxima frente al runtime PyTorch FP32 | 0,00041 |
| Conjuntos de prueba de paridad | texto, captura de pantalla, tablero de ajedrez, grafico, audio, imagen+audio, pregunta multietiqueta |

## Requisitos de hardware

- Pesos: backbone F16 de 1,5 GB, proyector multimodal F16 de 205 MB y cabeza en FP32 dentro de `experts.safetensors`; el repositorio completo ocupa 1,7 GB.
- VRAM estimada: no publicada de forma explícita; por tamaño de pesos, el offload completo a GPU requiere del orden de 2 GB para los ficheros GGUF más el estado de contexto, las activaciones y la caché KV, que crecen con `n_ctx`.
- Cabe en GPU de consumo: sí, con margen amplio, en tarjetas de gama media y alta (por ejemplo, una RTX 3060 de 12 GB o una RTX 4090), y previsiblemente en GPUs con 4-6 GB de VRAM.
- CPU: la paridad se midió en CPU, por lo que la inferencia completa en CPU es viable; `Helm(..., threads=)` ajusta el número de hilos.
- GPU recomendadas: no se especifican modelos concretos; el build de llama.cpp admite `-DGGML_CUDA=ON` o `-DGGML_METAL=ON` para acelerar por GPU.
- Opciones de despliegue: llama.cpp compilado en el commit `abeada335e2e78bd3fe63febafab7e900ce75810` (la API C cambia entre versiones), con los objetivos `llama` y `mtmd`, más el runner `omni-hidden` y el script `score.py`. `llama-server`, `llama-mtmd-cli` y Ollama pueden cargar los ficheros, pero no producen las respuestas de Helm.
- Dependencias de software: numpy, safetensors y `saina[tokenize,media]>=0.4.0` (sin PyTorch).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay en la información disponible una comparativa publicada con alternativas directas. La categoría del modelo es poco habitual: no es un LLM generativo, sino un clasificador de decisión multimodal compacto que emite probabilidades sobre opciones predefinidas. Los modelos generativos multimodales de tamaño comparable no son equivalentes funcionalmente, ya que producen texto en lugar de distribuciones sobre códigos de respuesta, y no se dispone de cifras verificadas para enfrentarlos.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saina Helm 2 Omni 0.8B GGUF | 752.393.024 | 32.768 tokens | Probabilidades sobre opciones | Apache 2.0 | HuggingFace, GGUF + runner propio |
| Alternativas generativas multimodales de tamano similar | no disponible | no disponible | Texto generado | no disponible | no disponible |
| Clasificadores multimodales especializados | no disponible | no disponible | Etiquetas o probabilidades | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre los códigos de respuesta ofrecidos, por lo que no sirve para tareas de redacción, resumen o diálogo abierto.
- La cabeza de decisión no es lineal y lee varias posiciones, así que se ejecuta en NumPy desde `experts.safetensors`; cuantizarla sin volver a comprobar la paridad degrada las respuestas, según advierte el autor.
- Las herramientas estándar (`llama-server`, `llama-mtmd-cli`, Ollama) pueden cargar los ficheros pero no producir las respuestas de Helm; es obligatorio usar el runner `omni-hidden` con `score.py`.
- El runner debe compilarse contra un commit concreto de llama.cpp (`abeada335e2e78bd3fe63febafab7e900ce75810`); otras versiones pueden romper la compilación porque la API C cambia entre revisiones.
- Límites de entrada: hasta 8 imágenes y hasta 4 clips de audio por petición, con una duración máxima de 10 segundos por clip.
- Las preguntas de audio funcionan mejor cuando el contexto describe el clip («una grabación corta de habla en inglés») y las opciones nombran los sonidos de forma explícita; fuera de ese patrón el rendimiento puede degradarse.
- No se declaran idiomas soportados; los ejemplos de la model card están en inglés, por lo que la cobertura multilingüe es incierta.
- No se publican datos de sesgos, tasas de error por tarea ni evaluación independiente; la única métrica disponible es la paridad numérica frente al runtime en PyTorch.
- Riesgo de alucinación: al no generar texto libre, el riesgo no se manifiesta como invención narrativa, pero sí como asignación de probabilidad alta a una opción incorrecta en tareas fuera de la distribución de entrenamiento.
- En decisiones sensibles (fraude, moderación, verificación documental) conviene usar las probabilidades con umbrales revisados y no como veredicto automático sin supervisión humana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero debe conservarse el aviso de licencia y verificarse la licencia del modelo base y de sus componentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/run-saina/saina-helm-2-omni-0.8b-GGUF
- Modelo base: https://huggingface.co/run-saina/saina-helm-2-omni-0.8b
- Paquete de tokenización y medios: https://pypi.org/project/saina/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
