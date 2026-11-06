# NidAll/audio8-tts-realistic-0.6b-int8-convrot

## Resumen

Audio8 TTS Realistic 0.6B — INT8 ConvRot es un paquete de modelos de sintetización de voz (text-to-speech) cuantizado y empaquetado para su uso offline dentro de ComfyUI, publicado por el usuario NidAll en Hugging Face. No se trata de un entrenamiento nuevo, sino de una conversión del modelo base [Edge0/Audio8-TTS-Realistic-0.6b](https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b), en el que 140 capas lineales del transformador se han cuantizado a INT8 mediante el esquema tensorwise ConvRot (con group size 64 y escalas de fila en FP32), manteniendo embeddings, normalizaciones, proyección de salida y el códec neuronal de habla en BF16.

El paquete resuelve un problema concreto: ejecutar un TTS realista con clonación de voz en un flujo de trabajo local (ComfyUI) sin dependencias de red, cargando todo el transformador DualAR, el códec de habla, el tokenizador y la configuración en un único fichero safetensors. Incluye además un bundle opcional con Whisper Base en FP16 para transcribir automáticamente referencias de voz multilingües en el flujo de clonación de salida larga.

Su relevancia actual radica en la tendencia de empaquetar modelos generativos de audio ligeros (0,6B de parámetros) cuantizados para estaciones de trabajo de consumo, integrados en ecosistemas visuales como ComfyUI, donde la generación de voz puede combinarse con pipelines de vídeo e imagen sin salir del entorno local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador DualAR para TTS + códec neuronal de habla |
| Parametros totales | 0,6B (transformador TTS); bundle completo 1,6 GB |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise ConvRot (group size 64, escalas FP32) en 140 capas lineales; embeddings, normalización, proyección de salida y códec en BF16; Whisper Base en FP16 |
| Idiomas soportados | 23 idiomas según la model card del modelo TTS (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato específico del pack ComfyUI-Audio8, no compatible con Transformers estándar) |

## Arquitectura y entrenamiento

El modelo base es un transformador DualAR de 0,6B de parámetros orientado a síntesis de voz realista, acompañado de un códec neuronal de habla que convierte las salidas del transformador en audio. En esta conversión se ha aplicado cuantización INT8 con el layout tensor ConvRot de Comfy Kitchen: 140 capas lineales del transformador usan pesos INT8 con rotación de tensores, group size 64 y escalas de fila en FP32, mientras que los componentes sensibles a la precisión (embeddings, normalización, proyección de salida y el códec completo) se mantienen en BF16. Este enfoque híbrido busca reducir el footprint de memoria con degradación mínima de la calidad de audio.

No hay datos publicados sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO u otras técnicas), ya que este repositorio es exclusivamente una conversión offline del modelo de Edge0. El bundle ASR opcional empaqueta OpenAI Whisper Base en FP16 con su tokenizador y configuración, usando la implementación estándar de Transformers con PyTorch SDPA. La inferencia se realiza completamente offline, sin peticiones de red.

## Capacidades

- Sintetización de voz realista (text-to-speech) a partir de texto, mediante el transformador DualAR cuantizado a INT8.
- Clonación de voz a partir de una referencia de audio, con transcripción opcional automática de la referencia mediante el bundle Whisper Base.
- Flujo de clonación de salida larga (Long Speech): divide el texto objetivo en secciones completas y las une usando la misma voz de referencia; generación greedy por defecto en ese nodo.
- Soporte de 23 idiomas según la model card del modelo TTS base (lista exacta no disponible en la información proporcionada).
- Whisper Base añade transcripción automática multilingüe de las referencias de voz.
- Ejecución totalmente offline dentro de ComfyUI, con model offloading gestionado por ComfyUI.
- No soporta (no consta): tool calling, razonamiento multi-paso ni capacidades de visión; es un modelo de audio especializado.

## Casos de uso

- Doblaje y narración de vídeos en ComfyUI: al integrarse como nodos nativos de ComfyUI, se puede generar la voz de un vídeo generado localmente (por ejemplo con modelos de imagen/vídeo) sin salir del mismo grafo de trabajo.
- Clonación de voz para audiolibros: con el nodo Long Speech se divide un texto largo en secciones y se mantiene la misma voz de referencia a lo largo de todo el audiolibro.
- Creación de locuciones para podcasts o contenido de YouTube: la cuantización INT8 permite ejecutar el modelo en hardware de consumo con latencias adecuadas para producción de contenido.
- Preparación automatizada de referencias de voz: Whisper Base transcribe automáticamente el audio de referencia multilingüe, reduciendo el trabajo manual de transcribir la referencia antes de clonar.
- Prototipado de asistentes de voz offline: al no realizar peticiones de red, es adecuado para entornos con requisitos de privacidad o sin conectividad.
- Localización de contenido: el soporte de 23 idiomas del modelo TTS permite generar la misma voz en varios idiomas para versiones localizadas de un mismo contenido.
- Accesibilidad: generación de locuciones para lectores de contenido o descripciones de audio en proyectos que requieren ejecución local de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos comparativos de calidad de audio (MOS, WER del códec, etc.) entre la versión INT8 ConvRot y el modelo base BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle TTS ocupa 1,47 GB en disco y el modelo base es de 0,6B de parámetros, por lo que con la mezcla INT8/BF16 debería funcionar en GPUs con 4-6 GB de VRAM como referencia aproximada (estimación, no dato publicado).
- GPU recomendadas: no disponible; ComfyUI soporta CUDA, y el model offloading de ComfyUI permite repartir entre GPU y CPU/RAM.
- Consumer GPU: dado el tamaño reducido (~1,5 GB el bundle TTS), es plausible su ejecución en GPUs de consumo como una RTX 3060 de 12 GB o superiores (estimación basada en el tamaño de los ficheros, no confirmada por el autor).
- Despliegue: exclusivamente mediante el pack de nodos personalizados [ComfyUI-Audio8](https://github.com/NidAll/ComfyUI-Audio8). Los ficheros no son checkpoints estándar de Transformers y no funcionan con vLLM, llama.cpp, Ollama o TGI. El bundle ASR opcional requiere la librería Transformers instalada en el entorno Python de ComfyUI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|
| Audio8 TTS Realistic 0.6B INT8 ConvRot (este) | 0,6B | INT8 ConvRot + BF16 | Apache-2.0 | ComfyUI-Audio8 (offline) |
| Edge0/Audio8-TTS-Realistic-0.6b (base) | 0,6B | no disponible (pesos originales) | Apache-2.0 | Modelo base del que deriva; detalles de despliegue no disponibles |
| OpenAI Whisper Base (bundle ASR incluido) | 74M aprox. | FP16 | Apache-2.0 | ASR multilingüe vía Transformers |

No hay datos de rendimiento comparativo publicados entre estas variantes.

## Limitaciones y advertencias

- Los ficheros safetensors de este repo usan un formato específico del pack ComfyUI-Audio8: no son checkpoints estándar de Transformers y no se pueden cargar con librerías genéricas.
- La calidad de la transcripción de Whisper Base varía; el autor recomienda revisar el texto reconocido de la referencia antes de clonar la voz.
- La lista de los 23 idiomas soportados no está detallada en la información disponible; conviene verificar la calidad en el idioma concreto de uso (por ejemplo, castellano) antes de producción.
- La cuantización INT8 puede introducir degradación en la calidad del audio respecto al modelo base BF16; no se han publicado mediciones de esa degradación.
- La clonación de voz conlleva riesgos éticos y legales (suplantación de identidad, deepfakes de audio); úsese solo con consentimiento del propietario de la voz.
- El repositorio tiene 0 descargas registradas en el momento de la ficha, por lo que carece de historial de uso comunitario y validación externa.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los avisos upstream incluidos en los ficheros LICENSE y NOTICE del repositorio.
- Datos de entrenamiento del modelo base no disponibles: no se puede evaluar sesgos del corpus de voz original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NidAll/audio8-tts-realistic-0.6b-int8-convrot
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Pack de nodos ComfyUI-Audio8: https://github.com/NidAll/ComfyUI-Audio8
- Whisper Base (OpenAI): https://huggingface.co/openai/whisper-base
