# AdaptiveChunking/ali_mem-mixed-noskel_s1

## Resumen

ali_mem-mixed-noskel_s1 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, desarrollado sobre el framework beetle-hnet. No es un modelo de lenguaje generativo convencional, sino un experimento de tokenización dinámica a nivel de byte (byte-level) con arquitectura H-Net, orientado a estudiar mecanismos de chunking adaptativo en lugar de producir texto. El modelo se entrenó con el objetivo `ratio` y una política de dechunking `ema`, sobre un corpus multilingüe limitado a inglés, turco y finés.

El modelo tiene 22.785.088 parámetros totales (unos 22,8 millones), lo que lo sitúa en la categoría de modelos pequeños, y el repositorio ocupa 5,1 GB debido a que almacena múltiples checkpoints intermedios (`step-N`) junto con el estado completo del entrenador. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, una configuración modesta típica de un experimento académico o de ablación.

Su relevancia es fundamentalmente metodológica: explora cómo una arquitectura H-Net puede aprender representaciones a nivel de byte con segmentación dinámica, un área de interés para investigadores que trabajan en tokenización libre de vocabulario y modelos multilingües sin tokenizador. No está pensado para uso en producción ni para tareas de generación de texto, y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, byte-level con dynamic chunking |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se especifica contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con la variante `ali` y un objetivo de entrenamiento `ratio`. Se trata de un modelo byte-level, es decir, opera directamente sobre bytes en lugar de sobre tokens de un vocabulario predefinido, y emplea un mecanismo de chunking dinámico con política de dechunking `ema` (media móvil exponencial). La configuración incluye `schedule=None`, lo que indica que no se aplicó una programación de fases adicional más allá de la gestión por checkpoints.

El entrenamiento consistió en 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe compuesto por inglés, turco y finés. El repositorio conserva checkpoints en una programación logarítmica basada en fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k) y el estado resumible completo del entrenador, lo que facilita la reproducibilidad y el análisis de la evolución del aprendizaje. No se documentan datos sobre número total de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Modelo de investigación en tokenización byte-level con segmentación dinámica; no está diseñado como modelo generativo de propósito general.
- Procesamiento de texto a nivel de byte en inglés, turco y finés según la configuración de entrenamiento.
- Aprendizaje de representaciones con chunking adaptativo mediante H-Net.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.
- No se documentan capacidades multilingües más allá de los tres idiomas de entrenamiento.

## Casos de uso

- Investigación en tokenización sin vocabulario: el modelo sirve como banco de pruebas para estudiar cómo el chunking dinámico a nivel de byte afecta al aprendizaje de representaciones, comparando checkpoints intermedios del repositorio.
- Análisis de ablaciones de arquitectura H-Net: al conservar estados completos del entrenador en cada checkpoint, permite reproducir y analizar la evolución del entrenamiento paso a paso.
- Experimentos multilingües de bajo recurso: el corpus en inglés, turco y finés permite estudiar el comportamiento del chunking en lenguas con morfología aglutinante (turco, finés) frente al inglés.
- Evaluación de políticas de dechunking: la política `ema` puede compararse con otras variantes del framework beetle-hnet para medir su impacto en la segmentación aprendida.
- Docencia y formación en NLP: por su tamaño reducido (22,8 M de parámetros) y su licencia Apache 2.0, es adecuado para entornos educativos donde se quiera ilustrar arquitecturas byte-level.
- Reproducibilidad de experimentos: los ficheros `log.jsonl`, `final.json` y las sondas FLORES+ de fronteras (`probe/`) permiten replicar y auditar los resultados del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~22,8 M de parámetros en precisión completa (fp32), requeriría aproximadamente 91 MB solo para pesos; en fp16 unos 46 MB. No se dispone de estimaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente por tamaño; no se documentan requisitos específicos.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y `huggingface_hub` para cargar checkpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni descargas; no está validado para uso en producción.
- Entrenado únicamente con inglés, turco y finés; su comportamiento en otros idiomas no está caracterizado.
- No se documentan evaluaciones de sesgo, alucinación ni robustez.
- La ventana de contexto documentada corresponde al entrenamiento (1024 bytes); no se especifica el comportamiento en secuencias más largas.
- El repositorio incluye estados completos del entrenador (`training_state/checkpoint.pt`), lo que incrementa el tamaño a 5,1 GB y requiere `weights_only=False` al cargar, con las precauciones de seguridad que ello implica.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de validación funcional hace desaconsejable su uso fuera de investigación.
- No se documentan restricciones adicionales de licencia más allá de las de Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-noskel_s1
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
