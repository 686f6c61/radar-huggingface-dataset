# modilify/Modilify-Mk1-MLX

## Resumen

Modilify-Mk1-MLX es el runtime nativo en MLX del modelo multimodal Modilify-Mk1, desarrollado por el autor modilify. Se trata de una implementación que permite ejecutar el modelo directamente en hardware Apple Silicon sin necesidad de un checkpoint convertido adicional, ya que remapea los nombres de los parámetros de PyTorch en tiempo de carga. El modelo base es de tipo difusión, multimodal (image-text-to-text) y utiliza una arquitectura de mezcla de expertos (MoE) con 26.139 millones de parámetros.

Su relevancia radica en ofrecer una vía optimizada para ejecutar un modelo de estas características en entornos locales con MLX, evitando la duplicación de pesos (ahorrando aproximadamente 49 GB de descarga). Incluye un bucle de generación propio y soporta deliberación latente, además de estar compuesto sobre las capas DiffusionGemma de mlx-vlm como dependencia interna. Al ser un modelo muy reciente, sin descargas ni validación comunitaria, su adopción en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modilify-Mk1 (trunk basado en DiffusionGemma de mlx-vlm + router MoE top-k + fusión latente con tope RMS) |
| Parametros totales | 26.139.111.276 (~26,1 B) |
| Parametros activos | No disponible (MoE, no se especifica el top-k exacto) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 por defecto (`--expert-bits 16`); otras no especificadas |
| Idiomas soportados | No disponible |
| Licencia | modilify-open-model-license-1.0 (licencia personalizada, tipo other) |
| Formato de pesos | MLX (shards safetensors remapeados desde PyTorch) |

## Arquitectura y entrenamiento

El modelo no reescribe el checkpoint original, sino que utiliza un paquete Python (`modilify_mlx`) que remapea los nombres de los parámetros de PyTorch a MLX en tiempo de carga. El tronco pesado (decoder y visión) se compone de las capas DiffusionGemma de mlx-vlm como dependencia interna. La innovación principal de Mk1 reside en su router top-k y en la fusión latente con tope RMS (RMS-capped latent merge), que son forwards propios del modelo. El entrenamiento (datos, tokens, RLHF/DPO) no se detalla en la información proporcionada.

## Capacidades

- Multimodal (image-text-to-text): puede procesar entrada de imágenes y texto para generar texto.
- Generación de texto: incluye un script de inferencia de texto independiente (`generate_modilify.py`).
- Difusión: el proceso de generación se describe por fases con tiempos de denoise (per-phase denoise timings), lo que sugiere un mecanismo de generación por difusión latente.
- Conversacional: etiquetado como `conversational`.
- Deliberación latente: incluye un módulo de `latent deliberation` en su configuración.
- Mezcla de expertos (MoE): utiliza router top-k para activar subconjuntos de parámetros.

## Casos de uso

- Generación de descripciones de imágenes en local: gracias a su naturaleza multimodal y a la ejecución nativa en MLX, se puede usar en aplicaciones de escritorio en Mac para generar pies de foto o descripciones detalladas sin conexión.
- Asistentes visuales conversacionales: al ser conversacional y multimodal, puede integrarse en chatbots que reciban capturas de pantalla o fotos para responder preguntas sobre ellas.
- Prototipado rápido en Apple Silicon: los desarrolladores pueden usar el script `generate_modilify.py` para probar prompts de texto e imagen sin necesidad de configurar un servidor de inferencia complejo.
- Investigación en arquitecturas de difusión multimodal: al estar compuesto sobre DiffusionGemma y un MoE propio, sirve como banco de pruebas para estudiar la fusión de latentes y el enrutamiento top-k.
- Aplicaciones de edición asistida por IA: la deliberación latente podría utilizarse para tareas de edición de imágenes guiadas por texto, aunque el pipeline específico no está documentado.
- Despliegue en entornos con memoria unificada: al ser MLX, aprovecha la memoria unificada de los chips M-series para manejar los 52,3 GB del repositorio en RAM, evitando la necesidad de GPUs discretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere hardware Apple Silicon (M-series) con el framework MLX instalado.
- El repositorio pesa 52,3 GB en disco, por lo que se recomienda un SSD con al menos 100 GB libres para el modelo y los archivos temporales.
- Memoria unificada: al usar bf16 por defecto, se estima que necesitará al menos 52 GB de RAM unificada para cargar los pesos completos, aunque el uso de cuantizaciones menores (si se añaden) podría reducirlo.
- No es compatible con GPUs NVIDIA/AMD de forma nativa; está pensado exclusivamente para el ecosistema MLX.
- El despliegue se realiza mediante el intérprete incluido en oMLX o un entorno Python con MLX. No se menciona soporte para vLLM, llama.cpp u Ollama.
- La compilación completa del grafo con `mx.compile` está bloqueada por los slices del router y gather de MoE, lo que puede afectar a la latencia en comparación con modelos densos.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Licencia personalizada (`modilify-open-model-license-1.0`): se debe revisar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial y modificación.
- No se especifican idiomas soportados ni longitud de contexto, por lo que su uso en producción para tareas multilingües o de contexto largo es incierto.
- El modelo es muy reciente (creado en agosto de 2026) y no tiene descargas ni likes, lo que indica una falta de validación comunitaria y posibles errores no detectados.
- La dependencia del intérprete de oMLX para la conversión puede limitar su portabilidad a otros entornos Python.
- La compilación del grafo completo está bloqueada por operaciones MoE, lo que puede generar una latencia mayor a la esperada en comparación con modelos densos.
- No hay información sobre sesgos, alucinaciones o calidad de las respuestas, ya que no se han publicado benchmarks.

## Enlaces

- Modelo HF: https://huggingface.co/modilify/Modilify-Mk1-MLX
- Modelo base: https://huggingface.co/modilify/Modilify-Mk1
