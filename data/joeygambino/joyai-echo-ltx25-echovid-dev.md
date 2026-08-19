# joeygambino/joyai-echo-ltx25-echoVid-dev

## Resumen

JoyAI-Echo x LTX-2.5 (echoVid) es un modelo de generación de video texto-a-video desarrollado por el usuario joeygambino, que fusiona el transformer de difusión LTX-2.5 de Lightricks con los deltas de atención y feed-forward del modelo JoyAI-Echo de JD (jdopensource). El resultado es un modelo "dev" sin destilación horneada, diseñado para que el usuario aplique su propia LoRA de destilación (por ejemplo, la oficial `ltx-2.5-22b-distilled-lora-450`) y así obtener generación en pocos pasos, o bien ejecutarlo como modelo de desarrollo con 25-30 pasos y cfg ~3.

El modelo está pensado para flujos de trabajo en ComfyUI y ofrece varias versiones cuantizadas (bf16, fp8, int8) para adaptarse a diferentes GPUs. Su relevancia radica en combinar la calidad de video y lip-sync de LTX-2.5 con la consistencia cross-modal y la memoria de personajes de JoyAI-Echo, permitiendo generar clips con audio sincronizado y mantener la identidad visual y vocal a lo largo de múltiples tomas. El repositorio ocupa 170 GB, aunque los archivos individuales van de 21 a 42 GB según la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para video, con atención espaciotemporal y modulación adaptativa; merge de LTX-2.5 y JoyAI-Echo |
| Parametros totales | 22 mil millones (estimado, basado en LTX-2.5) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (LTX-2.5 soporta generación de video de varios segundos, típicamente hasta 10 s) |
| Tipos de cuantizacion | bf16, fp8 (e4m3fn), int8 (convrot) |
| Idiomas soportados | No disponible (probablemente inglés y otros, sin confirmar) |
| Licencia | ltx-2.x-community-license (heredada de LTX-2.5 y JoyAI-Echo) |
| Formato de pesos | safetensors (bf16, fp8, int8) |

## Arquitectura y entrenamiento

El modelo es un merge de los pesos del transformer de LTX-2.5 dev con los deltas de atención y feed-forward de JoyAI-Echo, en dos dosis: `070T30` (0.7 x delta de atención, 0.3 x en tablas de modulación) y `100T50` (1.0 x / 0.5 x). No se ha horneado ninguna destilación sobre el modelo; el usuario debe cargar una LoRA de destilación (por ejemplo, la oficial de LTX-2.5) a la fuerza deseada (0.4-0.6 para mantener la gradación natural, 1.0 para destilación completa) y ejecutar el schedule de 8 pasos, o usarlo como modelo dev con 25-30 pasos y cfg ~3.

Los detalles del entrenamiento original de LTX-2.5 y JoyAI-Echo no se proporcionan en la información disponible. Se sabe que LTX-2.5 es un modelo de difusión de video de 22B parámetros entrenado por Lightricks, y JoyAI-Echo es un modelo de generación de video con audio sincronizado desarrollado por JD. El merge se realizó a nivel de pesos, sin fine-tuning adicional.

## Capacidades

- Generación de video a partir de texto (text-to-video) con resolución y duración controlables.
- Generación conjunta de audio y video, con sincronización labial (lip-sync) natural.
- Consistencia de personaje entre tomas: gracias al componente JoyAI-Echo, mantiene la cara y la voz del mismo personaje a lo largo de múltiples tomas o escenas.
- Soporte para flujos de trabajo en ComfyUI mediante nodos estándar (`Load Diffusion Model`, `Load LoRA (model only)`).
- Compatible con LoRAs de destilación o estilo adicionales, lo que permite ajustar el número de pasos de inferencia.
- Modo dev (25-30 pasos, cfg ~3) o modo destilado (8 pasos con LoRA) según las necesidades de calidad y velocidad.
- No dispone de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo de video.

## Casos de uso

- **Generación de clips narrativos con voz**: el modelo puede crear secuencias de video con narración sincronizada, útil para prototipos de storyboards o contenido educativo. Basta escribir un guion y el modelo produce el clip con audio.
- **Doblaje y lip-sync**: al combinar LTX-2.5 y JoyAI-Echo, permite generar videos donde un personaje habla con movimientos labiales coherentes con el audio, aplicable a localización de contenido o avatares.
- **Consistencia de personaje en series cortas**: gracias a la memoria cross-shot, se pueden generar múltiples tomas del mismo personaje manteniendo su apariencia y voz, ideal para animaciones episódicas o cómics animados.
- **Creación de contenido para redes sociales**: con la versión fp8 o int8, se puede ejecutar en GPUs de consumo (p. ej., RTX 4090) para producir vídeos cortos con voz para plataformas como TikTok o YouTube Shorts.
- **Prototipado de escenas en producción audiovisual**: los equipos de preproducción pueden generar rápidamente versiones aproximadas de escenas con diálogo y movimiento, reduciendo costes de storyboard animado.
- **Investigación en generación de video con audio**: el modelo sirve como base para experimentar con merges de arquitecturas, LoRAs de destilación y técnicas de consistencia temporal, dado su carácter "dev" sin destilación fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FVD, CLIP score o evaluaciones de lip-sync para este merge concreto.

## Requisitos de hardware

- **VRAM estimada**:
  - bf16 (42 GB): requiere GPU con al menos 48 GB VRAM (p. ej., A6000, A100, H100) o uso de offloading a RAM.
  - fp8 (~21 GB): cabe en GPUs con 24 GB VRAM (RTX 3090, RTX 4090, A5000) con margen para activaciones.
  - int8 (~21.5 GB): similar al fp8, funciona en RTX 30/40 con ComfyUI 0.32+; se reporta más rápido en RTX 50.
- **GPU recomendadas**: RTX 30/40 para versiones cuantizadas (fp8/int8), RTX 50 para int8 (máxima velocidad). Para bf16, GPUs profesionales o datacenter.
- **Consumer GPU**: sí, con cuantización fp8 o int8 en GPUs de 24 GB; también hay versiones GGUF en repositorios hermanos que permiten ejecutar en 8 GB VRAM con 16 GB de RAM (aunque para este merge no se especifica).
- **Opciones de despliegue**: ComfyUI (recomendado), con nodos estándar de carga de modelos y LoRA. No se menciona soporte nativo para vLLM, llama.cpp u Ollama (no aplicable a modelos de video).
- **Latencia y throughput**: no disponible; depende de la GPU, cuantización y número de pasos (8 pasos destilado vs 25-30 pasos dev).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **JoyAI-Echo x LTX-2.5 (echoVid)** | 22B (estimado) | No disponible | ltx-2.x-community | Hugging Face | Merge dev, requiere LoRA de destilación |
| **LTX-2.5 (Lightricks)** | 22B | Hasta 10 s de video | ltx-2.x-community | Hugging Face | Modelo base, con destilación oficial integrada en versión dev |
| **JoyAI-Echo (JD)** | No disponible (peso completo ~48 GB) | Larga duración, minuto completo | No especificada (open source) | GitHub/Hugging Face | Generación de video + audio, consistencia cross-modal, requiere ~48 GB VRAM |

El merge hereda la arquitectura y el tamaño de LTX-2.5, pero incorpora las mejoras de atención y feed-forward de JoyAI-Echo, lo que lo sitúa entre ambos: más ligero que JoyAI-Echo puro (22B vs ~48 GB de checkpoint) y con capacidades de audio-video superiores a LTX-2.5 estándar.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `ltx-2.x-community-license` impone condiciones de uso no comercial y restricciones de redistribución; es necesario revisar el texto completo antes de usarlo en producción comercial.
- **Sesgos y alucinaciones**: al ser un modelo generativo de video, puede producir contenido visual o de audio no fiel a la realidad, especialmente en escenas complejas o con texto en pantalla.
- **Consistencia limitada**: aunque mejora la consistencia entre tomas, no es perfecta; en secuencias largas pueden aparecer cambios sutiles de apariencia o voz.
- **Requisito de LoRA de destilación**: el modelo no funciona eficientemente en pocos pasos sin aplicar una LoRA de destilación; usarlo como dev requiere más pasos y mayor coste computacional.
- **Idiomas no confirmados**: no se especifican los idiomas soportados; el entrenamiento de LTX-2.5 es principalmente en inglés, por lo que otros idiomas pueden tener menor calidad.
- **Sin benchmarks**: no hay métricas publicadas, lo que dificulta evaluar su rendimiento objetivo frente a alternativas.
- **Tamaño del repositorio**: 170 GB en total; la descarga puede ser pesada, aunque los archivos individuales son más manejables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-dev)
- [Repositorio de versiones GGUF (few-step)](https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-gguf)
- [Repositorio de versiones ComfyUI nativas (RTX 50)](https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-comfy-native)
- [Workflows y nodos ComfyUI](https://github.com/jlucasmcrell/ComfyUI-JoyLTX25)
- [Repositorio de JoyAI-Echo (JD)](https://github.com/jd-opensource/JoyAI-Echo)
- [Nodos GGUF para JoyAI-Echo en ComfyUI](https://github.com/RealRebelAI/ComfyUI_JoyAI_Echo_GGUF_Nodes)
- [Espacio multi-shot de JoyAI-Echo x LTX-2.3](https://huggingface.co/spaces/joeygambino/joyai-echo-ltx23-surgical)
