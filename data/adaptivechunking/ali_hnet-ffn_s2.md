# AdaptiveChunking/ali_hnet-ffn_s2

## Resumen

`ali_hnet-ffn_s2` es un modelo de investigación a nivel de byte desarrollado por la organización AdaptiveChunking, entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) bajo la configuración `architecture=hnet_ffn` y `objective=ratio`. No es un modelo conversacional ni un LLM de propósito general: es un experimento sobre tokenización dinámica (*dynamic chunking*) y segmentación de secuencias a nivel de byte, orientado a estudiar cómo una red H-Net aprende a agrupar bytes en unidades de mayor granularidad sin un tokenizador estático previo.

El modelo tiene 22.785.033 parámetros totales (pesos en safetensors) y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). Esta combinación de idiomas es deliberada: incluye dos lenguas aglutinantes con morfología compleja, lo que convierte al modelo en un banco de pruebas para evaluar estrategias de chunking en escenarios donde los tokenizadores BPE convencionales rinden peor.

Su relevancia es fundamentalmente metodológica. El repositorio publica checkpoints intermedios en un schedule logarítmico consciente de fases (pasos 0, 1, 2, 4, 6, 8, 16, …, 2^k y el paso final), cada uno con el estado completo reanudable del entrenador, lo que permite reproducir y analizar la dinámica de entrenamiento. No hay evidencia de que esté pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con FFN (`architecture=hnet_ffn`), nivel de byte |
| Parametros totales | 22.785.033 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez; mapa en `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

La arquitectura es una H-Net con capa FFN, operando directamente sobre bytes en lugar de tokens subword. El objetivo de entrenamiento es `ratio`, con `schedule=None` y `dechunk=ema`, lo que sugiere un mecanismo de desagrupación (*dechunking*) basado en media móvil exponencial para reconstruir o alinear la segmentación durante el entrenamiento. El modelo emplea pesos atados (*tied weights*): `model.safetensors` almacena cada tensor compartido una sola vez y `config.json` incluye un mapa `tied_weights` que relaciona los nombres eliminados con los almacenados, lo que reduce el tamaño del checkpoint.

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus multilingüe de inglés, turco y finés. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO (poco probable dado el objetivo y el tamaño). El repositorio incluye además sondas de frontera FLORES+ (`probe/`) en la rama `main` una vez finalizado el entrenamiento, lo que permite evaluar la calidad de la segmentación en datos multilingües de referencia.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Aprendizaje de segmentación dinámica (*dynamic chunking*): agrupación adaptativa de bytes en unidades de mayor granularidad.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en el repositorio.
- Soporte multilingüe limitado a inglés, turco y finés.
- Checkpoints intermedios reanudables con estado completo del entrenador para análisis de dinámica de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización sin tokenizador: el modelo sirve para estudiar si una H-Net puede aprender unidades de segmentación equiparables a tokens subword en inglés, turco y finés, comparando las fronteras aprendidas con las de BPE o SentencePiece.
- Análisis de morfología aglutinante: al incluir turco y finés, permite examinar cómo el chunking dinámico se adapta a lenguas con alta productividad morfológica, donde los tokenizadores estándar fragmentan palabras de forma poco eficiente.
- Reproducción de experimentos de entrenamiento: los checkpoints en schedule logarítmico con `training_state/checkpoint.pt` permiten reanudar el entrenamiento exactamente desde cualquier fase y estudiar la evolución del objetivo `ratio` a lo largo del tiempo.
- Evaluación de fronteras multilingües: las sondas FLORES+ (`probe/`) permiten medir la calidad de la segmentación en un corpus de referencia multilingüe y comparar entre checkpoints.
- Base para ablaciones de arquitectura: al ser un modelo pequeño (22,8 M de parámetros), es viable entrenar variantes (otros objetivos, schedules o mecanismos de dechunking) en hardware modesto y comparar resultados.
- Estudio de eficiencia de representación a nivel de byte: útil para investigar si el chunking dinámico reduce la longitud efectiva de secuencia y, con ello, el coste computacional frente al modelado byte a byte puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22,8 M de parámetros; en fp32 ocupa aproximadamente 91 MB de pesos, en fp16 unos 46 MB y en int8 unos 23 MB. La VRAM real dependerá del batch y de la longitud de secuencia (máximo 1024 bytes).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere hardware de centro de datos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura H-Net personalizada, requiere el código de [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) para cargar los pesos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net a nivel de byte con chunking dinámico) ni resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de texto de calidad.
- Contexto muy limitado: 1024 bytes, insuficiente para la mayoría de aplicaciones reales.
- Cobertura lingüística restringida a inglés, turco y finés; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación y salidas incoherentes: al ser un modelo pequeño entrenado solo 6000 pasos, su calidad de generación es previsiblemente baja.
- Sesgos: no se documenta análisis de sesgos; el corpus de entrenamiento no está descrito en detalle.
- Licencia Apache 2.0: permite uso comercial, pero la falta de validación y el tamaño del modelo hacen desaconsejable cualquier despliegue productivo.
- Dependencia del código de beetle-hnet: los pesos no son cargables con librerías estándar sin la implementación de la arquitectura.
- Los pesos atados requieren respetar el mapa `tied_weights` de `config.json` al cargar; ignorarlo puede provocar errores de carga.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AdaptiveChunking/ali_hnet-ffn_s2)
- [Perfil de la organización AdaptiveChunking](https://huggingface.co/AdaptiveChunking/models)
- [Dataset hnet-chunking-probes](https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes)
- [Repositorio beetle-hnet](https://github.com/suchirsalhan/beetle-hnet)
