# gorse-io/larger_clap_music_and_speech-GGUF

## Resumen

`gorse-io/larger_clap_music_and_speech-GGUF` es una conversión al formato GGUF del modelo CLAP (Contrastive Language-Audio Pretraining) `laion/larger_clap_music_and_speech` de LAION. No es un modelo generativo de texto: se trata de un par de codificadores (audio y texto) entrenados de forma contrastiva que proyectan ambas modalidades a un espacio compartido de embeddings de 512 dimensiones, L2-normalizados. La similitud coseno entre un embedding de audio y uno de texto permite tareas de recuperación audio-texto y clasificación zero-shot.

El paquete incluye cuatro cuantizaciones (F32, F16, Q8_0 y Q4_K_M) generadas y validadas con el runtime nativo `gorse-io/clap.cpp`, que permite inferencia sin Python ni dependencias de PyTorch. Cada fichero GGUF embebe la configuración y el tokenizador RoBERTa, de modo que basta un binario para obtener embeddings de audio o de texto.

Su relevancia actual reside en la portabilidad: permite ejecutar un modelo de embeddings audio-texto en CPU con dos hilos y ficheros de entre 129 MB y 777 MB, lo que facilita su integración en pipelines de búsqueda, etiquetado y filtrado de audio sin infraestructura GPU ni stack de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (dos codificadores: audio y texto) con proyección contrastiva a espacio compartido |
| Parametros totales | 193.914.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 segundos (frontend CLAP); ventana de texto no disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (el tokenizador es RoBERTa; el modelo base no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con configuración y tokenizador embebidos) |

## Arquitectura y entrenamiento

El modelo subyacente es CLAP, una arquitectura de dos torres entrenada con un objetivo contrastivo entre pares audio-texto. El codificador de audio procesa espectrogramas mel con una ventana de 10 segundos (remuestreo a 48 kHz y downmix a mono en el runtime nativo), y el codificador de texto es un transformer tipo RoBERTa con su tokenizador correspondiente. Ambos proyectan a una representación final de 512 dimensiones L2-normalizada, de modo que el producto escalar equivale a la similitud coseno.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en modelos contrastivos de este tipo). El checkpoint base está entrenado sobre música y habla. La conversión a GGUF se realizó desde el `pytorch_model.bin` original (revisión `195c3a3e68faebb3e2088b9a79e79b43ddbda76b`), verificada por SHA-256, y las cuantizaciones Q8_0 y Q4_K_M se generaron directamente desde F32, no por recuantización de F16. En Q4_K_M se aplica una política de roles específica del codificador (Q6_K para atención-valor, FFN-down y proyección final; Q4_K para el resto de matrices elegibles) sin importance matrix ni dataset de calibración.

## Capacidades

- Generación de embeddings de audio: produce un vector de 512 dimensiones L2-normalizado a partir de una forma de onda.
- Generación de embeddings de texto: produce el vector correspondiente en el mismo espacio compartido.
- Recuperación audio-texto y texto-audio mediante similitud coseno (producto escalar).
- Clasificación zero-shot de audio usando etiquetas textuales como consultas.
- Procesamiento de audio con ventana de 10 segundos; clips más cortos se rellenan por repetición y en clips largos se puede seleccionar el recorte con `--crop-offset`.
- Inferencia nativa en CPU sin Python ni PyTorch mediante `clap.cpp`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo de embeddings, no un LLM.

## Casos de uso

- Búsqueda semántica de audio en bibliotecas musicales o de efectos: indexar cada pista con su embedding de audio y consultar con descripciones textuales ("perro ladrando", "guitarra acústica suave") calculando similitud coseno en el espacio compartido.
- Etiquetado automático de archivos de audio: clasificación zero-shot comparando el embedding del audio contra embeddings de un conjunto de etiquetas textuales, útil para organizar archivos sin anotaciones previas.
- Moderación y filtrado de contenido sonoro: detectar categorías de audio (habla, música, ruido) mediante consultas textuales y umbrales de similitud sobre los embeddings.
- Deduplicación y clustering de audio: agrupar fragmentos con embeddings próximos para consolidar catálogos o eliminar duplicados en pipelines de ingestión.
- Enriquecimiento de metadatos en plataformas de podcast o radio: generar descripciones y etiquetas a partir de segmentos de 10 segundos procesados en CPU, sin necesidad de GPU.
- Prototipado y despliegue en entornos restringidos: integrar la búsqueda audio-texto en aplicaciones de escritorio o edge con el binario `clap.cpp` y el fichero Q4_K_M (129 MB), sin dependencias de Python.
- Sistemas de recomendación multimodal: combinar embeddings de audio con embeddings de texto de reseñas o descripciones para construir índices unificados de similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una tabla de paridad de vectores frente a la implementación original en Transformers F32:

| Formato | Sonda | Coseno vs Transformers F32 | Coseno vs F32 nativo |
|---|---|---:|---:|
| F32 | texto | 1.00000000 | 1.00000000 |
| F32 | tone440 | 1.00000000 | 1.00000000 |
| F32 | broadband | 1.00000000 | 1.00000000 |
| F16 | texto | 0.99999981 | 0.99999981 |
| F16 | tone440 | 0.99999955 | 0.99999955 |
| F16 | broadband | 0.99999974 | 0.99999974 |
| Q8_0 | texto | 0.99964001 | 0.99964001 |
| Q8_0 | tone440 | 0.99979202 | 0.99979198 |

No hay datos de MMLU, HumanEval, GSM8K ni métricas de recuperación (R@1, mAP) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el runtime probado es CPU. Como referencia de tamaño de fichero: F32 777 MB, F16 390 MB, Q8_0 208 MB, Q4_K_M 129 MB. La reducción de tamaño de fichero no implica reducción proporcional de RAM pico.
- GPU recomendadas: no disponible; no se hace ninguna afirmación de rendimiento en GPU en la model card.
- ¿Cabe en GPU consumer? Por tamaño de fichero cabría en cualquier GPU con al menos ~1 GB de memoria libre, pero no hay validación publicada de ejecución en GPU para este runtime.
- Opciones de despliegue: `gorse-io/clap.cpp` (revisión `d1928dd6b1e0e48a072a7e0ad1b2608621616db0`), compilado con CMake y el target `clap-cli`. No es compatible con llama.cpp como modelo de generación.
- Latencia y throughput: no disponibles. Las pruebas se realizaron en CPU con dos hilos; no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| gorse-io/larger_clap_music_and_speech-GGUF | 193.914.010 | ventana de audio de 10 s | embeddings 512-d | Apache 2.0 | GGUF |
| laion/larger_clap_music_and_speech | no disponible en la información | ventana de audio de 10 s | embeddings 512-d | Apache 2.0 | PyTorch (`pytorch_model.bin`) |
| Otros modelos CLAP de LAION | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (métricas de recuperación o clasificación) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de generación de texto: no debe usarse con llama.cpp ni esperarse salidas textuales.
- Ventana de audio fija de 10 segundos: los clips más largos requieren seleccionar un recorte manualmente con `--crop-offset`; no hay procesamiento de audio largo nativo.
- El audio se remuestrea a 48 kHz y se convierte a mono, lo que puede degradar información en fuentes multicanal o de alta frecuencia.
- No se declaran idiomas soportados; el modelo base se entrenó en música y habla, pero la cobertura lingüística del codificador de texto no está documentada.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; como modelo contrastivo, los errores se manifiestan como recuperaciones o clasificaciones incorrectas, no como texto inventado.
- Las cuantizaciones Q8_0 y Q4_K_M introducen pérdida de precisión (coseno ~0.9996 y no disponible para Q4_K_M en la tabla publicada); para máxima fidelidad usar F32.
- La reducción de tamaño de fichero no garantiza menor RAM pico ni mayor velocidad.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `laion/larger_clap_music_and_speech` y de los datos de entrenamiento originales.
- El runtime `clap.cpp` está fijado a una revisión concreta; versiones distintas pueden no ser compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/gorse-io/larger_clap_music_and_speech-GGUF
- Modelo base: https://huggingface.co/laion/larger_clap_music_and_speech
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Paper CLAP (arXiv:2211.06687): https://arxiv.org/abs/2211.06687
