# AdaptiveChunking/ali_ali-ema_s2

## Resumen

ali_ali-ema_s2 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework beetle-hnet, con arquitectura interna denominada `ali`, objetivo de entrenamiento `ratio` y un mecanismo de de-chunking basado en EMA (media móvil exponencial). El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés.

Con 22.785.088 parámetros totales (aproximadamente 22,8 millones), se sitúa en la categoría de modelos pequeños, muy por debajo de los LLM convencionales. Su interés no reside en el rendimiento en tareas generativas, sino en la exploración de técnicas de segmentación adaptativa de secuencias a nivel de byte, un área relevante para reducir la dependencia de tokenizadores estáticos y mejorar la robustez multilingüe en lenguas morfológicamente complejas como el turco y el finés.

El repositorio tiene un tamaño de 13,1 GB, muy superior al que correspondería a los pesos del modelo, debido a que incluye múltiples checkpoints intermedios con estado completo del entrenador (optimizador, scheduler, etc.) en cada rama `step-N`. La licencia es Apache 2.0 y los pesos están en formato safetensors con convención de pesos atados (tied weights) declarada en `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento; no se especifica contexto de inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados; mapa en `config.json["tied_weights"]`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con la variante `ali` y un objetivo de entrenamiento de tipo `ratio`. La característica diferencial es el uso de *dynamic chunking* a nivel de byte: en lugar de un tokenizador BPE o SentencePiece fijo, el modelo aprende a segmentar la secuencia de bytes de entrada de forma adaptativa. El mecanismo de de-chunking `ema` (media móvil exponencial) se emplea para estabilizar la reconstrucción o agregación de los chunks durante el proceso. El schedule de entrenamiento se registra como `None`, lo que sugiere que no se aplicó un scheduler de learning rate explícito en esta ejecución.

El entrenamiento se realizó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. La elección de turco y finés es significativa: ambas son lenguas aglutinantes con alta productividad morfológica, donde los tokenizadores estándar suelen fragmentar palabras en muchos subtokens. Los checkpoints se conservan en una programación logarítmica consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), lo que permite reproducir la evolución del entrenamiento. Cada rama `step-N` incluye `model.safetensors`, `config.json`, `training_config.yaml` y el estado resumible completo del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, una vez finalizado el run, las pruebas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica aprendida (no depende de un vocabulario fijo de tokens).
- Procesamiento multilingüe limitado a inglés, turco y finés según la configuración de entrenamiento.
- Reconstrucción y agregación de chunks mediante de-chunking EMA, orientada a tareas de segmentación y agrupación de secuencias.
- Evaluación de fronteras de segmentación mediante las pruebas FLORES+ incluidas en `probe/`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta capacidad de generación de texto conversacional ni instrucción seguida (no hay indicios de RLHF/DPO en la información disponible).

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como banco de pruebas para comparar segmentación dinámica a nivel de byte frente a tokenizadores BPE estáticos en lenguas aglutinantes como turco y finés.
- Estudio de morfología computacional: al operar sobre bytes y aprender chunks, permite analizar cómo se agrupan morfemas y sufijos en palabras largas sin las limitaciones de un vocabulario predefinido.
- Reproducción de experimentos: los checkpoints intermedios con estado completo del entrenador permiten reanudar el entrenamiento exactamente desde cualquier paso de la programación logarítmica, útil para estudios de ablación.
- Evaluación de fronteras de segmentación: las pruebas FLORES+ en `probe/` permiten medir la calidad de los límites de chunk aprendidos sobre texto multilingüe paralelo.
- Desarrollo de preprocesadores para pipelines multilingües: los hallazgos sobre de-chunking EMA pueden transferirse al diseño de segmentadores para modelos mayores que operen en turco o finés.
- Docencia y experimentación con arquitecturas H-Net: el tamaño reducido (22,8 M de parámetros) y la licencia Apache 2.0 facilitan su uso en entornos académicos y en pruebas de concepto sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16 unos 46 MB; en int8 unos 23 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). No se requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura custom (beetle-hnet), no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin adaptación. El despliegue requiere cargar los pesos con PyTorch y el código del repositorio beetle-hnet.
- Latencia y throughput estimados: no disponibles. El repositorio de 13,1 GB incluye múltiples checkpoints con estado del entrenador, por lo que la descarga completa es costosa; para inferencia conviene descargar solo la rama `main` o un `step-N` concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (tokenización dinámica a nivel de byte con arquitectura H-Net) ni se dispone de datos de rendimiento para establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado en Hugging Face; no está pensado para uso en producción como modelo generativo.
- Entrenado únicamente con 6000 pasos y tres idiomas (en, tr, fi); la cobertura multilingüe es muy limitada y no se ha evaluado su comportamiento en castellano.
- No hay evidencia de alineación mediante RLHF o DPO, por lo que no debe esperarse seguimiento de instrucciones ni comportamiento conversacional seguro.
- Riesgo de alucinación y de salidas incoherentes fuera del dominio de entrenamiento; no se han publicado evaluaciones de calidad.
- El repositorio ocupa 13,1 GB por los checkpoints intermedios con estado del entrenador; conviene descargar selectivamente para evitar consumo innecesario de almacenamiento y ancho de banda.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre sesgos hace desaconsejable su despliegue en aplicaciones reales sin una evaluación previa exhaustiva.
- La arquitectura custom (beetle-hnet) implica dependencia del código del repositorio original; no hay garantía de compatibilidad con herramientas estándar del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-ema_s2
- Organización AdaptiveChunking en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
