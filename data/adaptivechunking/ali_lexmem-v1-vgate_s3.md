# AdaptiveChunking/ali_lexmem-v1-vgate_s3

## Resumen

ali_lexmem-v1-vgate_s3 es un modelo de investigación desarrollado por AdaptiveChunking, orientado al estudio de la tokenización dinámica a nivel de byte y de los mecanismos de chunking adaptativo. Se enmarca en la familia de arquitecturas H-Net (hierarchical network) y se ha entrenado mediante el framework beetle-hnet con la variante de arquitectura `ali` y el objetivo `ratio`. Con 22,8 millones de parámetros, es un modelo de escala reducida pensado para experimentación, no para producción generalista.

El modelo procesa secuencias de bytes (no tokens subword) y aprende a agrupar dinámicamente el flujo de entrada en chunks de longitud variable. La variante `vgate_s3` corresponde a una ejecución concreta (seed 3) de un barrido experimental, con 6000 pasos de entrenamiento sobre lotes de 32 secuencias de 1024 bytes, en tres idiomas: inglés, turco y finés. Esta selección lingüística es relevante porque combina una lengua germánica con dos lenguas de morfología aglutinante, lo que pone a prueba la tokenización byte-level en escenarios de alta productividad morfológica.

Su interés actual reside en que aborda uno de los cuellos de botella clásicos de los LLM: la rigidez de los vocabularios subword fijos. Al operar directamente sobre bytes y aprender los límites de chunk, el modelo explora alternativas que podrían reducir el tamaño del vocabulario, mejorar la cobertura multilingüe y eliminar el problema de los tokens fuera de vocabulario. No obstante, su tamaño y su naturaleza experimental lo sitúan lejos de un uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`, framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco, finés (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez); estado del entrenador en checkpoint.pt |

## Arquitectura y entrenamiento

La arquitectura es una H-Net a nivel de byte, es decir, una red jerárquica que opera sobre la secuencia cruda de bytes y aprende a segmentarla en chunks dinámicos en lugar de depender de un tokenizador subword predefinido. El framework beetle-hnet organiza el entrenamiento con una política de chunking adaptativo y un mecanismo de dechunking basado en media móvil exponencial (`dechunk=ema`). La variante `ali` corresponde a una configuración concreta de la arquitectura dentro del espacio de búsqueda del proyecto, y el objetivo `ratio` define la función de pérdida o el criterio de optimización del chunking.

El entrenamiento se realizó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre un corpus multilingüe de inglés, turco y finés. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset, ni si hubo fases de RLHF o DPO. El repositorio conserva checkpoints intermedios en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, etc.) junto con el estado resumible del entrenador, lo que facilita la reproducibilidad y el análisis de la evolución del chunking a lo largo del entrenamiento.

## Capacidades

- Procesamiento de texto a nivel de byte, sin vocabulario subword fijo ni tokens fuera de vocabulario.
- Segmentación dinámica de la entrada en chunks de longitud variable aprendida durante el entrenamiento.
- Modelado de lenguaje sobre secuencias de hasta 1024 bytes.
- Cobertura lingüística limitada a inglés, turco y finés según la configuración de entrenamiento.
- Capacidad de reanudación del entrenamiento desde checkpoints intermedios con estado completo del optimizador.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como banco de pruebas para estudiar cómo aprende límites de chunk una H-Net frente a tokenizadores BPE o SentencePiece, comparando la segmentación emergente con la de referencia.
- Análisis de morfología aglutinante: al haberse entrenado con turco y finés, permite examinar si el chunking dinámico captura sufijos y flexiones de forma más eficiente que un vocabulario subword fijo en lenguas con alta productividad morfológica.
- Reproducción de experimentos: los checkpoints intermedios y el estado del entrenador permiten replicar la curva de aprendizaje y analizar la estabilidad del objetivo `ratio` a lo largo de los 6000 pasos.
- Estudio de robustez ante ruido y errores ortográficos: al operar sobre bytes, el modelo puede procesar entradas mal formadas o con caracteres poco frecuentes sin fallos de tokenización, lo que resulta útil en experimentos de robustez.
- Prototipado de arquitecturas jerárquicas: sirve como base para extensiones de H-Net con mayores contextos o corpus más amplios antes de escalar a modelos de mayor tamaño.
- Docencia y formación: su tamaño reducido (22,8 M de parámetros) y su licencia Apache 2.0 lo hacen adecuado para cursos y talleres sobre tokenización y arquitecturas jerárquicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona sondas de frontera FLORES+ (`probe/`) que se generan al finalizar la ejecución, pero no se proporcionan métricas numéricas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (aproximadamente 91 MB de pesos), más el overhead de activaciones para secuencias de 1024 bytes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura no estándar (H-Net de beetle-hnet), requiere cargar la implementación del repositorio beetle-hnet; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) con especificaciones publicadas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado ni validado para uso en producción.
- Contexto limitado a 1024 bytes, insuficiente para la mayoría de aplicaciones reales de generación de texto.
- Cobertura lingüística restringida a inglés, turco y finés; el comportamiento en otros idiomas no está caracterizado.
- No se han publicado evaluaciones de sesgo, alucinación ni calidad generativa.
- La arquitectura no estándar dificulta su integración con herramientas de inferencia convencionales (vLLM, llama.cpp, Ollama, TGI).
- El repositorio incluye estados completos del entrenador (7,2 GB), lo que incrementa el coste de almacenamiento frente al peso real del modelo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de validación y de documentación de rendimiento desaconseja cualquier despliegue productivo sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1-vgate_s3
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
