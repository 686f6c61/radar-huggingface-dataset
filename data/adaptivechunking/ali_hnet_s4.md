# AdaptiveChunking/ali_hnet_s4

## Resumen

`ali_hnet_s4` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Se trata de una implementación a nivel de byte (byte-level) de una arquitectura H-Net, un diseño que combina mecanismos de chunking dinámico con tokenización a nivel de byte, orientado a estudiar cómo el modelo aprende a segmentar secuencias de bytes en unidades significativas sin depender de un tokenizador externo.

El modelo tiene 22.516.992 parámetros (aproximadamente 22,5 millones) y fue entrenado durante 6000 pasos con un batch de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. Su objetivo declarado es `ratio` con un schedule de decodificación `ema` y sin programación de chunking explícita (`schedule=None`), lo que lo sitúa como un experimento controlado dentro de una línea de investigación sobre segmentación adaptativa.

Es relevante en el contexto de la investigación en tokenización libre de vocabulario y modelos byte-level, una línea que busca eliminar las limitaciones de los tokenizadores BPE tradicionales (especialmente en idiomas morfológicamente ricos como el turco o el finés). No obstante, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card orientada a producción ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, dynamic chunking) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos tied almacenados una sola vez) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con `architecture=hnet` y `objective=ratio`. Se trata de un modelo byte-level, es decir, que opera directamente sobre secuencias de bytes en lugar de tokens pre-tokenizados, y que incorpora un mecanismo de chunking dinámico (dynamic chunking) para agrupar bytes en unidades de mayor nivel. La decodificación utiliza un esquema `ema` (media móvil exponencial) para determinar los límites de chunk, y el entrenamiento no utiliza un schedule de chunking predefinido (`schedule=None`).

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. La seed utilizada fue 4. El repositorio incluye checkpoints intermedios organizados en ramas `step-N` siguiendo un schedule logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k), lo que facilita el análisis de la evolución del entrenamiento. Los pesos tied se almacenan una sola vez en `model.safetensors`, con el mapeo declarado en `config.json["tied_weights"]`.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Segmentación dinámica de secuencias mediante chunking adaptativo (mecanismo central de la arquitectura H-Net).
- Procesamiento multilingüe limitado a inglés, turco y finés según la configuración de entrenamiento.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre modo de pensamiento (thinking), visión, audio ni otras capacidades especiales.
- No se dispone de información sobre ajuste por instrucciones o alineación conversacional.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como banco de pruebas para estudiar cómo el chunking dinámico aprende límites de unidad léxica sin tokenizador externo, comparando checkpoints intermedios del schedule logarítmico.
- Análisis de morfología en turco y finés: al operar sobre bytes, el modelo puede emplearse para estudiar cómo una arquitectura sin vocabulario fijo maneja idiomas aglutinantes, un caso históricamente problemático para BPE.
- Reproducción de experimentos: los checkpoints intermedios y el estado completo del entrenador (`training_state/checkpoint.pt`) permiten reanudar o auditar el entrenamiento paso a paso en un entorno de investigación.
- Evaluación de segmentación con FLORES+: el repositorio incluye sondas de frontera (`probe/`) sobre FLORES+ que permiten medir la calidad del chunking en traducción multilingüe.
- Estudio de decodificación con EMA: el esquema `dechunk=ema` puede analizarse como alternativa a decodificaciones deterministas en modelos de chunking.
- Docencia y experimentación académica: su tamaño reducido (22,5 M de parámetros) permite entrenar y ejecutar variantes en hardware modesto, facilitando la experimentación en cursos de PLN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,5 M de parámetros (los pesos en safetensors ocupan aproximadamente 90 MB en fp32); el tamaño del repo (6,4 GB) se debe principalmente a los checkpoints intermedios y al estado del entrenador, no a los pesos del modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (H-Net), requiere el código de beetle-hnet para cargar los pesos; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (byte-level H-Net de ~22 M de parámetros) con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados ni evaluación de calidad; no apto para uso en producción sin validación adicional.
- Contexto limitado a 1024 bytes, insuficiente para la mayoría de aplicaciones reales de contexto largo.
- Cobertura lingüística restringida a inglés, turco y finés; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación y salidas incoherentes no cuantificado; no hay información sobre alineación o filtrado de seguridad.
- No se dispone de información sobre sesgos conocidos, pero al entrenarse sobre un corpus multilingüe limitado es probable que herede sesgos del mismo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y de model card orientada a producción desaconseja su uso comercial directo.
- La arquitectura personalizada requiere el código de beetle-hnet; no es cargable con `transformers` estándar.
- El repositorio incluye estados de entrenador (`checkpoint.pt`) que deben cargarse con `weights_only=False`, lo que implica riesgos de seguridad al cargar pickles de origen no verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet_s4
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
