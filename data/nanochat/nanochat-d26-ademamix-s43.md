# Nanochat/nanochat-d26-ademamix-s43

## Resumen

El repositorio `Nanochat/nanochat-d26-ademamix-s43` contiene un checkpoint nativo del proyecto NanoChat, desarrollado por el autor Nanochat y vinculado al repositorio de Karpathy del mismo nombre. Se trata de un experimento de comparación de optimizadores: en concreto, la ejecución con el optimizador AdEMAMix y la semilla 43. El repositorio incluye checkpoints de base y de SFT (chat) en dos condiciones, «matched» y «full», junto con manifiestos de archivo y metadatos de recuperación. No se ha realizado conversión a Transformers, por lo que los pesos se almacenan en el formato nativo de NanoChat. La información disponible no especifica arquitectura, número de parámetros ni longitud de contexto, por lo que no es posible evaluar sus capacidades de inferencia a partir de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint nativo de NanoChat (sin conversión a Transformers) |

## Arquitectura y entrenamiento

El repositorio es un archivo nativo de NanoChat, no un modelo convertido a Transformers. La model card indica que cada carpeta base distinta se almacena una vez, con todos sus archivos de checkpoint, y cada carpeta de SFT seleccionada se incluye bajo su nombre original. El entrenamiento se realizó con el optimizador AdEMAMix y la semilla 43, en dos condiciones: «matched» (con un checkpoint base en el paso 4014 y un SFT en el paso 369) y «full» (con un checkpoint base en el paso 7226 y un SFT en el paso 501). No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, la composición del dataset ni si se aplicó RLHF o DPO. Tampoco se especifica la arquitectura subyacente ni ninguna innovación técnica destacable. El repositorio incluye manifiestos de archivo con rutas, tamaños y SHA-256, así como un manifiesto de datos externos que referencia las fuentes de datos de entrenamiento sin incluirlas.

## Capacidades

No se ha publicado información sobre las capacidades específicas del modelo. A partir de la estructura del repositorio se puede inferir lo siguiente:

- Chat: la presencia de carpetas `chatsft_checkpoints` indica que se realizó un afinamiento supervisado (SFT) para conversación, pero no se detallan las tareas ni los resultados.
- Investigación: el repositorio está diseñado para comparar optimizadores y reproducir entrenamientos, no para servir como modelo final de inferencia.
- No se dispone de datos sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

Debido a que la información disponible no describe un modelo de inferencia, los casos de uso se centran en el ámbito de la investigación y el desarrollo:

- Reproducción de experimentos: permite recuperar los checkpoints en el paso exacto indicado para reproducir el entrenamiento con AdEMAMix y seed 43, usando el entorno de NanoChat.
- Análisis de optimizadores: sirve para comparar la trayectoria de entrenamiento de AdEMAMix con otros optimizadores, como SOAP, a partir de los checkpoints guardados.
- Estudio de la fase SFT: los checkpoints de SFT permiten analizar el efecto del afinamiento para chat sobre el modelo base en las condiciones matched y full.
- Continuación del entrenamiento: los checkpoints base pueden usarse como punto de partida para reanudar el entrenamiento o probar variaciones de hiperparámetros.
- Auditoría de artefactos: los manifiestos SHA-256 permiten verificar la integridad de los archivos y estudiar la estructura interna del entrenamiento.
- Benchmarking de hardware: al tratarse de un proyecto diseñado para entrenar con recursos limitados, puede usarse para medir el rendimiento de entrenamiento en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 424 GB, por lo que se requiere almacenamiento suficiente para los checkpoints y los manifiestos.
- VRAM: no disponible.
- GPU recomendadas: no disponible. El proyecto NanoChat está orientado a entrenamiento con hardware de bajo coste, pero no se especifican requisitos para este checkpoint concreto.
- Despliegue: no aplicable para inferencia directa; se requiere el entorno de NanoChat para cargar los checkpoints. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información para comparar este checkpoint con otros modelos. Existe un repositorio hermano, `Nanochat/nanochat-d26-soap-s43`, que utiliza el optimizador SOAP con la misma semilla, pero no hay datos de rendimiento publicados. La comparativa entre ambos se limitaría a la estructura de los checkpoints y a la configuración del optimizador.

## Limitaciones y advertencias

- No se ha documentado la evaluación de sesgos, seguridad ni alucinaciones.
- El modelo no está listo para producción: los pesos están en formato nativo de NanoChat y requieren el entorno de ese proyecto para cargarse.
- La ausencia de conversión a Transformers limita su uso con frameworks estándar como HuggingFace Transformers.
- No se incluyen los datos de entrenamiento en el repositorio; solo se referencian externamente.
- La licencia MIT permite uso comercial, pero la falta de documentación y evaluación impide validar su uso en aplicaciones reales.
- No se especifica la longitud de contexto ni los idiomas soportados, lo que impide conocer sus limitaciones lingüísticas.

## Enlaces

- https://huggingface.co/Nanochat/nanochat-d26-ademamix-s43
- https://github.com/karpathy/nanochat
- https://huggingface.co/Nanochat/nanochat-d26-soap-s43
