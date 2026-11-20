# SexGod1979/PinkCherry_MiniMax-H3

## Resumen

PinkCherry_MiniMax-H3 es un ajuste fino (fine-tune) del modelo MiniMax-H3, un sistema de generación de vídeo a partir de texto (text-to-video) desarrollado originalmente por MiniMax. El modelo lo publica el usuario SexGod1979 en Hugging Face bajo licencia Apache 2.0 y está especializado en contenido para adultos (etiquetas nsfw y nfaa), por lo que su uso está restringido a mayores de edad. El repositorio acumula 1338 descargas y 566 likes desde su creación en agosto de 2026.

El modelo se distribuye en formato de pesos safetensors para la librería transformers y ocupa 767,9 GB en el repositorio, lo que refleja un conjunto de pesos de gran tamaño, presumiblemente con varias precisiones o variantes incluidas. La model card es extremadamente escueta: no documenta arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento.

Su relevancia actual radica en que demuestra la aplicación de fine-tuning sobre modelos de difusión de vídeo de última generación para dominios especializados, y en que ofrece una alternativa abierta (Apache 2.0) frente a sistemas propietarios de generación de vídeo. No obstante, la ausencia de documentación técnica y de benchmarks publicados limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniMax-H3 de generación de vídeo; arquitectura no documentada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se referencia un checkpoint turbo en bf16 de 8 pasos compatible con la versión 1.5) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 767,9 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y la tarea declarada (text-to-video), se trata de un modelo de generación de vídeo derivado de MiniMax-H3, pero no se especifica si emplea difusión, transformer de difusión o un esquema híbrido, ni se detallan número de parámetros, capas o mecanismos de atención.

Tampoco hay datos sobre el proceso de entrenamiento: ni el volumen de tokens o clips de vídeo utilizados, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica que es un fine-tune NSFW y recomienda usar la plantilla estándar de ComfyUI con el sampler euler/simple para el flujo fl2va en la versión 1.5, además de enlazar un checkpoint turbo de LightX2V compatible con dicha versión. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video).
- Especialización en contenido para adultos (NSFW), con la etiqueta nfaa de contenido no apto para todo público.
- Compatibilidad con flujos de trabajo de ComfyUI mediante la plantilla estándar fl2va (versión 1.5) y sampler euler/simple.
- Compatibilidad con el checkpoint turbo de LightX2V (minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors), que permite generación en 8 pasos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de vídeo para adultos en estudios independientes: el modelo permite crear clips a partir de descripciones textuales, lo que resulta adecuado para productoras pequeñas que necesitan material sin depender de servicios propietarios.
- Prototipado rápido de escenas en ComfyUI: gracias a la plantilla fl2va y al sampler euler/simple documentado, un artista puede montar un flujo de trabajo reproducible y iterar sobre prompts en pocos minutos.
- Generación acelerada con checkpoint turbo: el uso del modelo de 8 pasos de LightX2V permite reducir el coste computacional por clip, útil en entornos con GPUs de gama alta limitadas.
- Investigación sobre fine-tuning de modelos de vídeo: el modelo sirve como caso de estudio de adaptación de un modelo base (MiniMax-H3) a un dominio específico mediante fine-tuning, con licencia permisiva.
- Creación de contenido para plataformas de suscripción: la licencia Apache 2.0 permite uso comercial, lo que facilita integrar el modelo en pipelines de producción de contenido de pago para adultos.
- Pruebas de concepto de pipelines text-to-video en local: al distribuirse en safetensors para transformers, puede integrarse en scripts de inferencia propios y evaluarse frente a otros modelos de vídeo abiertos.
- Evaluación comparativa de calidad NSFW: investigadores pueden medir la fidelidad prompt-vídeo en dominios para adultos, un área con pocos modelos abiertos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio de 767,9 GB sugiere pesos de gran tamaño; el checkpoint turbo bf16 de 8 pasos referenciado requiere, como mínimo, una GPU con suficiente memoria para cargar pesos en bf16, aunque no se especifica la cifra exacta.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, se intuye necesidad de GPUs de centro de datos (A100, H100) o configuraciones multi-GPU; no hay confirmación en la documentación.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del repositorio hace improbable su ejecución completa en GPUs de consumo convencionales, pero no se documenta.
- Opciones de despliegue: ComfyUI (plantilla fl2va, sampler euler/simple) y la librería transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo text-to-video.
- Latencia y throughput estimados: no disponibles. El checkpoint turbo de 8 pasos sugiere una reducción del número de pasos de muestreo, pero no se publican tiempos por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PinkCherry_MiniMax-H3 | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (1338 descargas) |
| MiniMax-H3 (base) | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible en esta ficha |
| Alternativas text-to-video abiertas (p. ej. modelos de difusión de vídeo) | no disponible | no disponible | no disponible | variable | no disponible en esta ficha |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está entrenado para generar material para adultos; su uso requiere verificación de edad y cumplimiento de la legislación aplicable en cada jurisdicción.
- Sesgos conocidos: no documentados, pero un fine-tune NSFW puede heredar y amplificar sesgos de representación del modelo base y del dataset de ajuste.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no solicitado; no hay métricas publicadas de fidelidad.
- Limitaciones de contexto e idioma: no disponibles; no se documenta el soporte multilingüe de los prompts.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas sobre material para adultos y a las políticas de las plataformas de distribución.
- Documentación insuficiente: la model card no detalla arquitectura, parámetros, dataset ni benchmarks, lo que dificulta la evaluación técnica y la reproducibilidad.
- Tamaño del repositorio: 767,9 GB complican el almacenamiento y la transferencia; se recomienda verificar qué variantes de pesos contiene antes de descargar.
- Compatibilidad: las instrucciones se limitan a ComfyUI con la plantilla fl2va v1.5 y al checkpoint turbo de LightX2V; otros flujos pueden no funcionar.

## Enlaces

- Hugging Face: https://huggingface.co/SexGod1979/PinkCherry_MiniMax-H3
- Checkpoint turbo de LightX2V: https://huggingface.co/lightx2v/Minimax-h3-Turbo/blob/main/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors
