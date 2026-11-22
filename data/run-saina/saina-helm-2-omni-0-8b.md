# run-saina/saina-helm-2-omni-0.8b

## Resumen

Saina Helm 2 Omni 0.8B es un modelo de decisión multimodal desarrollado por run-saina, construido como un finetune del modelo base Qwen/Qwen3.5-0.8B. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto o JSON) junto con hasta 8 imágenes y 4 clips de audio, más un conjunto de preguntas tipadas (sí/no, elección única, elección múltiple o valoración), y devuelve una probabilidad para cada opción de respuesta. Con 852.985.920 parámetros, se posiciona como un modelo pequeño orientado a tareas de clasificación y enrutamiento.

La arquitectura aprovecha la torre de visión de Qwen3.5 para leer tanto imágenes como audio: cada clip de audio se convierte en un espectrograma log-mel tratado como una imagen, de modo que no existen pesos separados para audio. Todas las preguntas de una petición se responden en una sola pasada sobre el estado y los medios compartidos, lo que lo hace eficiente para escenarios de decisión con múltiples etiquetas.

Su relevancia actual radica en el enfoque "any-to-any" aplicado a clasificación multi-etiqueta multimodal: permite enrutar mensajes de soporte con captura de pantalla, verificar recibos contra reclamaciones, detectar voz sintética o etiquetar sonidos y comandos de voz, todo con un modelo que cabe en hardware modesto y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5) con torre de visión; audio como espectrograma log-mel tratado como imagen; cabeza de clasificación entrenada |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (etiqueta mixture-of-experts en metadatos, sin dato de parámetros activos) |
| Longitud de contexto | no disponible (los medios cuentan como tokens de entrada; un clip de 10 s equivale a 124 tokens) |
| Tipos de cuantizacion | F16 (GGUF), FP16 con FP32 RMSNorm (MLX); otras no disponibles |
| Idiomas soportados | no disponible (texto y voz distintos del inglés prácticamente no evaluados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF (llama.cpp); MLX |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B mediante finetune. La entrada de texto se procesa como en el modelo base, mientras que las imágenes se leen a través de la torre de visión de Qwen3.5, redimensionadas a un máximo de 1,6 megapíxeles manteniendo la relación de aspecto, con un token de entrada por cada 32 × 32 píxeles. El audio se transforma en espectrogramas log-mel mono a 16 kHz que se interpretan como imágenes, eliminando la necesidad de pesos de audio dedicados.

Sobre esa representación compartida se aplica una cabeza de clasificación entrenada que produce probabilidades por cada opción suministrada. La model card indica que el paquete `saina` construye el prompt exacto de entrenamiento, coloca imágenes y espectrogramas en las posiciones vistas durante el entrenamiento y aplica la cabeza entrenada; los resultados dependen de ese pipeline, por lo que no debe usarse `generate()` ni prompts personalizados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Los metadatos incluyen la etiqueta "mixture-of-experts", aunque no se detalla su configuración.

## Capacidades

- Clasificación multi-etiqueta multimodal: devuelve probabilidad para cada respuesta de preguntas de tipo sí/no, elección única, elección múltiple y valoración.
- Lectura conjunta de texto, imágenes y audio en una sola pasada; cada pregunta ve todos los medios de la petición.
- Procesamiento de hasta 8 imágenes por petición (PNG, JPEG, WebP; 10 MB cada una) y hasta 4 clips de audio (WAV, FLAC, MP3, Ogg, WebM; 10 MB y 10 s cada uno).
- Reconocimiento de palabras cortas y comandos de voz a partir de espectrogramas; no es un modelo de transcripción de habla larga.
- Modo `decision` para escalar preguntas de baja confianza en lugar de adivinar.
- Soporte de tool calling y agentes: no disponible como capacidad generativa; el modelo solo puntúa opciones suministradas.
- Capacidades multilingües: no disponibles; el inglés es el único idioma mínimamente probado.
- Capacidad especial: puntuación de voz sintética o convertida por ordenador como señal para verificación adicional.

## Casos de uso

- Enrutamiento de mensajes de soporte con captura de pantalla: el modelo recibe el texto del cliente y la imagen adjunta, y puntúa opciones de departamento o acción; su lectura conjunta de estado y medios en una sola pasada lo hace adecuado para triaje de alto volumen.
- Verificación de recibos contra reclamaciones: con el importe reclamado y la política como estado JSON y la imagen del recibo, responde sí/no sobre si el total coincide; útil en flujos de gastos con revisión humana posterior.
- Detección de voz sintética en llamadas: dado un clip corto de audio y el contexto de la llamada, puntúa si la voz parece generada o convertida, como señal para exigir verificación adicional antes de operar.
- Etiquetado de sonidos, comandos hablados o instrumentos: convierte el audio en espectrograma y clasifica entre opciones predefinidas, por ejemplo para activar comandos de voz o catalogar muestras de audio.
- Clasificación de imágenes con preguntas múltiples: una misma imagen puede evaluarse contra varias preguntas tipadas en una sola petición, reduciendo coste frente a invocaciones separadas.
- Moderación asistida de flujos con revisión: en escenarios donde un error es recuperable, el modo `decision` escala los casos de baja confianza a un revisor humano en lugar de forzar una respuesta.
- Automatización de agentes con decisión acotada: integrado mediante el servidor HTTP autenticado del paquete `saina`, el modelo puede actuar como componente de decisión dentro de pipelines de agentes, limitando la autoridad concedida a su salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de paridad entre formatos: diferencia máxima de probabilidad de 0,000478 en seis casos de paridad en CPU para GGUF (construido desde el commit `aea9ac53`) y de 0,001547 en una suite de cuatro casos en CPU Linux con FP32 para MLX; la ejecución en GPU de Apple no fue revalidada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 852.985.920 parámetros, los pesos en FP16 ocupan aproximadamente 1,7 GB, a los que se suman el proyector de visión y las activaciones.
- GPU recomendadas: no disponible; el ejemplo de uso apunta a `device='cuda:0'` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño de los pesos, aunque no confirmada en la información disponible.
- Opciones de despliegue: paquete `saina` (extra `local,media`) con `HelmModel.from_pretrained`; servidor HTTP autenticado con `saina[local,server,media]`; GGUF para llama.cpp con runner y `score.py`; build específico de Ollama (pesos y paridad no verificados en la auditoría de Hugging Face); MLX para Apple Silicon con `mlx-vlm`.
- Latencia y throughput: no disponibles.
- Nota: se requiere `saina` 0.4 o superior; versiones anteriores rechazan este checkpoint. Fijar `revision` a un commit concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Tarea | Licencia |
|---|---|---|---|---|---|
| Saina Helm 2 Omni 0.8B | 852.985.920 | no disponible | Texto, imagen, audio | Clasificación multi-etiqueta (sin generación) | Apache 2.0 |
| Saina Helm 2 0.8B | no disponible | no disponible | Texto | Clasificación (modelo hermano solo texto) | no disponible |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | Texto | Generación de texto | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No genera texto de ningún tipo; solo puntúa las opciones que se le suministran.
- No debe usarse para decisiones finales sin revisión con consecuencias materiales para personas (crédito, empleo, medicina, legal), ni siquiera con alta confianza.
- Prohibido para identificación o clasificación de personas: caras, voces de individuos concretos, atributos personales, demografía o perfilado.
- No entrenado ni evaluado para filtrado de seguridad, detección de daño o moderación de contenido.
- Lectura de documentos largos desde imágenes poco fiable: el límite de 1,6 megapíxeles hace ilegible la letra pequeña.
- No es un modelo de transcripción: reconoce palabras cortas, no sigue habla larga.
- No admite vídeo ni audio de más de 10 segundos; los clips largos se rechazan, nunca se recortan.
- Texto y voz en idiomas distintos del inglés prácticamente no evaluados.
- Riesgo de inyección de instrucciones a través de texto, imágenes y audio; debe acotarse la autoridad concedida a la salida.
- Una puntuación de voz sintética es una señal para verificación adicional, no prueba de fraude.
- Los resultados dependen del pipeline `saina`; usar prompts personalizados o `generate()` altera las puntuaciones.
- Es necesario validar con datos etiquetados propios y para el propio espacio de etiquetas antes de su uso en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/run-saina/saina-helm-2-omni-0.8b
- Modelo hermano solo texto: https://huggingface.co/run-saina/saina-helm-2-0.8b
- GGUF (llama.cpp): https://huggingface.co/run-saina/saina-helm-2-omni-0.8b-GGUF
- Ollama: https://ollama.com/run-saina/saina-helm-2-omni-0.8b
- MLX (Apple silicon): https://huggingface.co/run-saina/saina-helm-2-omni-0.8b-MLX
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- Repositorio GitHub: https://github.com/run-saina/saina
- API alojada: https://saina.run
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
