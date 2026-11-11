# AdaptiveChunking/ali_ali-nogate_s0

## Resumen

`ali_ali-nogate_s0` es un modelo de investigación publicado por el colectivo AdaptiveChunking, centrado en el problema del *chunking* dinámico a nivel de byte. No es un modelo de lenguaje conversacional al uso, sino un banco de pruebas de arquitectura H-Net (arquitectura jerárquica de segmentación) construido sobre el framework `beetle-hnet`. El modelo se ha entrenado con la variante `architecture=ali`, objetivo `ratio` y un esquema de *dechunking* con media móvil exponencial (EMA), con semilla 0.

El tamaño es reducido: 22.583.040 parámetros totales según los pesos en safetensors, aunque el repositorio ocupa 3,5 GB debido a que incluye múltiples checkpoints intermedios (`step-N`), estados completos del entrenador (`training_state/checkpoint.pt`) y artefactos de registro. El entrenamiento consistió en 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés.

Su relevancia es metodológica: sirve para estudiar cómo una arquitectura jerárquica aprende a segmentar texto a nivel de byte sin tokenizador explícito, y cómo el objetivo de ratio y el *dechunking* EMA afectan a las fronteras de segmentación. La model card indica que, al finalizar la ejecución, se publican sondas de frontera FLORES+ en el directorio `probe/`, lo que lo convierte en material útil para reproducir experimentos de tokenización libre de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net jerárquica, variante `ali` (byte-level, dynamic chunking) |
| Parametros totales | 22.583.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados, mapeados en `config.json["tied_weights"]`), más `training_state/checkpoint.pt` en formato PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte con segmentación dinámica, implementada en el repositorio `beetle-hnet`. La variante `ali` con `objective=ratio` y `schedule=None` indica que el modelo aprende a agrupar bytes en unidades de mayor nivel mediante un criterio de ratio, sin un calendario de fases explícito. El *dechunking* utiliza una media móvil exponencial (EMA) para estabilizar la reconstrucción de la secuencia a partir de los segmentos. Los pesos están atados: `model.safetensors` almacena cada tensor una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

El entrenamiento cubrió 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre un corpus multilingüe con inglés, turco y finés. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; dado el carácter de investigación del modelo, es probable que no las haya, pero no puede confirmarse. El repositorio conserva checkpoints en una programación logarítmica por fases (0, 1, 2, 4, 6, 8, 16, …, 2^k) más el paso final, cada uno con su estado reanudable del entrenador, lo que facilita el análisis de la evolución del *chunking* durante el entrenamiento.

## Capacidades

- Modelado de lenguaje a nivel de byte sin tokenizador externo, con segmentación jerárquica aprendida.
- Aprendizaje de fronteras de segmentación (*chunk boundaries*) evaluable mediante las sondas FLORES+ publicadas en `probe/`.
- Soporte multilingüe limitado a los tres idiomas de entrenamiento: inglés, turco y finés.
- Reanudación exacta del entrenamiento desde cualquier checkpoint `step-N` gracias a `training_state/checkpoint.pt`.
- Inspección de la evolución del *chunking* a lo largo de las fases mediante los checkpoints intermedios.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización libre de vocabulario: el modelo permite estudiar cómo una H-Net aprende a agrupar bytes en unidades significativas sin un vocabulario BPE predefinido, comparando los checkpoints intermedios.
- Análisis de fronteras de segmentación: las sondas FLORES+ en `probe/` permiten medir la calidad de las fronteras aprendidas sobre textos multilingües y contrastarlas con segmentaciones de referencia.
- Reproducción de experimentos: el estado completo del entrenador en cada `step-N` permite reanudar la ejecución exactamente donde se dejó, útil para replicar resultados con la semilla 0.
- Estudio de estabilidad del *dechunking*: la variante con EMA permite analizar cómo la media móvil exponencial suaviza la reconstrucción de secuencias y afecta a la pérdida.
- Evaluación comparativa de arquitecturas jerárquicas: al ser un modelo pequeño (22,6 M de parámetros), puede entrenarse y evaluarse en hardware modesto para comparar variantes `ali` frente a otras del framework `beetle-hnet`.
- Docencia y experimentación en arquitecturas H-Net: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres sobre modelos jerárquicos y tokenización a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16, unos 45 MB. El repositorio completo ocupa 3,5 GB por los checkpoints y estados del entrenador, no por el modelo en sí.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para reentrenamiento, una GPU consumer moderna (RTX 3060 o superior) basta dado el tamaño y las secuencias de 1024 bytes.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo de investigación en PyTorch con arquitectura no estándar, no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La vía prevista es cargar los pesos con PyTorch y el código de `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net de nivel de byte con *chunking* dinámico) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente conversacional: no se documentan capacidades de instrucción, diálogo ni alineación.
- Cobertura lingüística muy limitada: solo inglés, turco y finés; el rendimiento en otros idiomas no está caracterizado.
- Contexto de entrenamiento corto: secuencias de 1024 bytes, lo que limita el análisis a ventanas pequeñas.
- Sin benchmarks publicados: no hay evidencia de rendimiento comparable con modelos de producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al entrenarse sobre un corpus no especificado, pueden heredarse sesgos del mismo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías, su uso en producción requeriría validación propia.
- Dependencia del código de `beetle-hnet`: la arquitectura no es estándar y requiere el repositorio del framework para cargar y ejecutar el modelo.
- El repositorio de 3,5 GB incluye estados de entrenamiento que no son necesarios para inferencia; conviene descargar solo el checkpoint deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-nogate_s0
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
