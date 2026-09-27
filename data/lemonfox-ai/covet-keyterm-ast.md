# lemonfox-ai/covet-keyterm-ast

# lemonfox-ai/covet-keyterm-ast

## Resumen

`lemonfox-ai/covet-keyterm-ast` es un clasificador de audio multietiqueta publicado por lemonfox-ai, el equipo detrás del servicio de ASR Lemonfox, y orientado al dominio veterinario de Covet. Se trata de un fine-tuning de `MIT/ast-finetuned-audioset-10-10-0.4593` (un Audio Spectrogram Transformer, AST) al que se añade una cabeza binaria dedicada, `any_keyterm`, junto con la cabeza multietiqueta sobre 40 frases. Su función es actuar como puerta de enrutado de fragmentos de audio dentro de un pipeline de reconocimiento automático del habla y como selector automático de keyterms.

El problema que resuelve es concreto: decidir si un fragmento de audio contiene alguna de las 40 frases objetivo (32 marcas comerciales y 8 términos anatómicos procedentes de las hotwords en producción) y, en caso afirmativo, identificar cuáles. Con ello se evita aplicar sesgo de vocabulario o rutas de post-procesado a fragmentos irrelevantes, reduciendo coste y falsos positivos en la transcripción.

El modelo se entrenó exclusivamente con datos sintéticos generados con TTS de fal, sin audio real de Covet ni del holdout de lemonfox. Se distribuye bajo licencia Apache-2.0 en un repositorio de 0,3 GB que contiene el state dict en `model.pt`, la lista de etiquetas, la configuración del extractor de características y un fichero de umbrales. No se han publicado métricas de evaluación ni información sobre idiomas, parámetros o ventana de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST); fine-tuning con cabeza multietiqueta de 40 clases y cabeza binaria adicional `any_keyterm` |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB, compatible con un backbone AST en fp32 de aproximadamente 87 M de parametros, pero la model card no lo confirma) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio; opera sobre ventanas de espectrograma mel, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (`model.pt`); no se publican pesos en safetensors |
| Uso declarado (pipeline) | audio-classification |
| Numero de etiquetas | 40 frases (32 marcas comerciales + 8 terminos anatomicos) |
| Ficheros del repositorio | `model.pt`, `labels.json`, `preprocessor_config.json`, `detector_config.json` |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La base es un Audio Spectrogram Transformer: un transformer de visión aplicado a espectrogramas mel, donde la señal de audio se divide en parches que se proyectan y se procesan con autoatención. Sobre ese backbone, el autor ha realizado un fine-tuning desde el checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593` y ha añadido dos cabezas: una multietiqueta sobre 40 frases y una binaria (`any_keyterm`) que actúa como puerta principal con un umbral calibrado almacenado en `detector_config.json`.

Los datos de entrenamiento son exclusivamente TTS sintético generado con fal; la model card indica explícitamente que no se usaron datos reales de Covet AAC ni del holdout de lemonfox. No se especifica el número de horas de audio, la composición exacta del dataset, ni si hubo etapas de ajuste adicional. No se menciona RLHF ni DPO, algo esperable al tratarse de una tarea de clasificación supervisada y no de generación.

La innovación destacable no está en la arquitectura, sino en la lógica de decisión en cascada documentada por el autor para el modo `keyterms=["auto"]`: (1) si alguna probabilidad multietiqueta es mayor o igual a 0,5, se devuelven solo esas coincidencias; (2) si no, pero `any_keyterm` supera `best_any_threshold`, se devuelven las tres etiquetas multietiqueta con mayor probabilidad; (3) en caso contrario, se devuelve una lista vacía de keyterms. Este diseño separa el enrutado binario (decidir si hay algo relevante) de la selección fina (decidir qué keyterms inyectar).

## Capacidades

- Clasificación de audio multietiqueta sobre un conjunto cerrado de 40 frases: 32 marcas comerciales y 8 términos de anatomía veterinaria procedentes de las hotwords de producción.
- Detección binaria de presencia de keyterm mediante la cabeza `any_keyterm`, con umbral calibrado en `detector_config.json`.
- Selección automática de keyterms en modo `auto`, con la regla de cascada descrita en la model card.
- Enrutado de fragmentos de audio (`chunk routing`) para pipelines de ASR: decidir qué fragmentos merecen biasing de vocabulario o post-procesado.
- Integración con la librería `transformers` y uso declarado como endpoint compatible (etiqueta `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: es un clasificador de audio, no un modelo generativo.

## Casos de uso

- Sesgo de vocabulario en transcripción veterinaria: antes de transcribir un fragmento, el modelo indica qué marcas o términos anatómicos es probable que aparezcan, de modo que el ASR reciba únicamente las hotwords relevantes y se reduzca el sesgo hacia términos ausentes.
- Enrutado de chunks en un pipeline de ASR de larga duración: el clasificador actúa como filtro previo por fragmento, descartando aquellos sin keyterms y evitando coste de post-procesado en segmentos irrelevantes.
- Selección automática de keyterms en `keyterms=["auto"]`: con la regla de cascada y el umbral calibrado, el sistema puede operar sin intervención humana decidiendo cuándo no inyectar ninguna hotword.
- Indexado y etiquetado de archivos de audio: las 40 etiquetas permiten clasificar y etiquetar automáticamente llamadas, notas de voz o grabaciones clínicas para su posterior búsqueda y filtrado por marca o término anatómico.
- Pre-filtrado de audio para reducir coste en cascada: al usar la cabeza binaria `any_keyterm` como primera etapa, solo los fragmentos positivos pasan a etapas más caras de transcripción o de modelado de lenguaje.
- Detección de marcas comerciales en audio de dominio veterinario: útil en estudios de mención de marca, análisis de conversaciones con clientes o control de calidad de contenido patrocinado.
- Detección de terminología anatómica en dictado clínico: el subconjunto de 8 etiquetas de anatomía permite marcar segmentos con contenido clínico específico dentro de una grabación más amplia.
- Activación por palabra clave específica de dominio: puede emplearse como disparador de flujos concretos cuando aparece una marca o término determinado en una grabación continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni mAP sobre el conjunto de 40 etiquetas, ni tampoco resultados del holdout de lemonfox. Únicamente se documenta que el umbral de la cabeza `any_keyterm` fue calibrado y se almacena en `detector_config.json`, sin indicar el valor ni la metodología de calibración.

## Requisitos de hardware

- VRAM estimada: no verificada. El repositorio completo ocupa 0,3 GB, por lo que los pesos en fp32 no deberían superar ese tamaño; la inferencia en GPU con lotes pequeños quedaría por debajo de 2 GB de VRAM de forma estimada.
- GPU recomendadas: al tratarse de un modelo de clasificación de audio de tamaño reducido, no requiere A100 ni H100; es adecuado para GPU de consumo como RTX 3060, RTX 4070 o RTX 4090, e incluso para GPU de gama de entrada.
- GPU de consumo: sí, previsiblemente cabe en cualquier GPU consumer con 4 GB o más de VRAM, aunque el dato no está confirmado en la informacion proporcionada.
- CPU: viable por el tamaño del modelo, con latencia mayor; el cuello de botella probable es el preprocesado del espectrograma mel, no el transformer.
- Opciones de despliegue: `transformers` con PyTorch cargando el state dict de `model.pt` mediante código propio; la model card no publica un `AutoModel` estándar ni pesos en safetensors. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, ONNX o TensorRT.
- Latencia y throughput: no disponibles. Dependen del tamaño de la ventana de audio, de la configuración del `ASTFeatureExtractor` y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lemonfox-ai/covet-keyterm-ast | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| MIT/ast-finetuned-audioset-10-10-0.4593 (modelo base) | no disponible | no disponible | el identificador incluye 0.4593, valor de mAP en AudioSet segun la nomenclatura del checkpoint base | no disponible | HuggingFace (como modelo base) |
| Alternativas de keyword spotting y clasificacion de audio (wav2vec2, CNN sobre mel, Whisper con coincidencia de texto) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de comparación en la informacion proporcionada. La diferencia funcional relevante frente al modelo base es la especialización en un vocabulario cerrado de 40 frases del dominio veterinario y la incorporación de la cabeza `any_keyterm` con umbral calibrado, orientada al enrutado en producción y no a la clasificación general de eventos sonoros.

## Limitaciones y advertencias

- Conjunto cerrado de etiquetas: el modelo solo reconoce las 40 frases de `labels.json`; cualquier marca, término o variante no incluida requiere reentrenamiento.
- Entrenamiento solo con TTS sintético: la model card indica que no se usaron datos reales de Covet ni del holdout de lemonfox, por lo que cabe esperar degradación ante ruido de sala, micrófonos reales, acentos, solapamiento de habla o code-switching.
- Riesgo de sesgo acústico hacia las voces y condiciones del TTS de fal empleado en la generación, sin evidencia publicada de validación con habla real.
- Umbrales sensibles al dominio: el 0,5 de la cabeza multietiqueta y el valor `best_any_threshold` están calibrados sobre datos sintéticos; trasladarlos a producción sin recalibración puede desequilibrar precisión y recall.
- Riesgo de alucinación en sentido estricto no aplica (es un clasificador), pero sí existe riesgo de falsos positivos que inyecten hotwords incorrectas en el ASR y degraden la transcripción.
- Sin métricas publicadas: no hay precisión, recall, F1 ni mAP que permitan estimar el rendimiento esperado.
- Idiomas no especificados: no se documenta para qué lenguas funciona, aunque el vocabulario de etiquetas de la model card está en inglés.
- Formato de pesos sin safetensors: `model.pt` es un state dict de PyTorch, lo que implica cargar un fichero serializado con pickle y aplicar las precauciones de seguridad habituales.
- Licencia Apache-2.0 para este modelo, pero conviene verificar de forma independiente la licencia y las condiciones del checkpoint base `MIT/ast-finetuned-audioset-10-10-0.4593` antes de un despliegue comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin documentación de terceros que reproduzca los resultados.
- Integración no estándar: no se publica código de carga ni una clase `AutoModelForAudioClassification` configurada, por lo que es necesario implementar la lógica de carga de las dos cabezas y de la regla de selección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lemonfox-ai/covet-keyterm-ast
- Perfil del autor: https://huggingface.co/lemonfox-ai
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
