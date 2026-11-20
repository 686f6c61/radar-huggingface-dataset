# chutesai/parallax-8b-kappa

## Resumen

Parallax 8B kappa es un checkpoint de investigación de un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por chutesai, actualmente en fase de mid-training. Se trata de un modelo base preentrenado sobre una mezcla de texto web, documentos, matemáticas, código, conocimiento y libros, sin ajuste por instrucciones ni por seguridad, por lo que continúa texto en lugar de seguir órdenes. Su relevancia radica en el método de entrenamiento: se entrena sobre GPUs de consumo distribuidas en varios países, con nodos sin conexión directa entre sí que sincronizan a través de internet público mediante un esquema DiLoCo desacoplado.

La arquitectura combina capas recurrentes de regla delta con compuertas (GDN2), atención de ventana deslizante, atención dispersa y capas MoE, con pesos de expertos ternarios (-1, 0, +1). El modelo declara aproximadamente 7,8B parámetros totales y unos 1,25B activos por token, aunque el dato real de safetensors del repositorio indica 1.600.912.175 parámetros, una discrepancia que conviene tener en cuenta.

El modelo se publica como artefacto de investigación para seguir e inspeccionar el entrenamiento, no para uso en producción. Cada exportación es una instantánea de una ejecución no finalizada, con calidad no monótona entre exportaciones, y se añade una nueva aproximadamente cada hora mientras el entrenamiento continúa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas recurrentes GDN2, atención de ventana deslizante, atención dispersa y MoE |
| Parametros totales | ~7,8B declarados por el autor; 1.600.912.175 según safetensors del repo |
| Parametros activos | ~1,25B por token |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos de expertos ternarios; exports en 2,52 GB por carpeta) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (tag del repo); safetensors referenciado en metadatos |

## Arquitectura y entrenamiento

El modelo tiene 64 capas: 18 recurrentes de regla delta con compuertas (GDN2), 8 de atención de ventana deslizante con ventana de 2048, 6 de atención dispersa y 32 capas MoE. Cada capa MoE contiene 128 expertos enrutados (4096 en total), con 12 expertos enrutados más 1 compartido activados por token. Los pesos de los expertos son ternarios (-1, 0, +1) con escalas por fila, con como máximo dos pares no nulos en cada grupo de ocho. La anchura es d_model 1152, con activación ReLU² en los expertos, tokenizador de Llama 3 (vocabulario ampliado a 128.384) y embeddings de entrada y salida atados. La escala de logits de salida es aprendible y está limitada a 3,0 en entrenamiento e inferencia.

El entrenamiento usa la mezcla de datos "epsilon" de una ejecución anterior de Parallax, no FineWeb-Edu. La fase principal emplea siete fuentes con unos 1,09T de tokens: dos mezclas generales de web, documentos, matemáticas y código (aproximadamente el 78% de los tokens), un conjunto web adicional, dos conjuntos de matemáticas, un conjunto centrado en conocimiento y un conjunto de libros; dos fuentes de annealing se incorporan al final. La ejecución está planificada como una pasada de unos 973B de tokens. El tronco denso se sincroniza con DiLoCo desacoplado sobre internet, y los expertos enrutados se entrenan mediante adaptadores de bajo rango en las GPUs que los usan, cuyas actualizaciones se pliegan en maestros de precisión completa que publican nuevas versiones ternarias. El learning rate alcanza un pico de 4e-4 tras un calentamiento de 8,7B de tokens, luego constante, con un decaimiento 1-sqrt planificado hasta 0,1x del pico entre unos 827B y 973B de tokens; por inestabilidad de ruido de gradiente se redujo a 0,5x (2e-4) el 2026-09-30 a las 07:05 UTC y a 0,25x (1e-4) a las 13:00 UTC. El batch pasó de 10 micro-lotes de acumulación (unos 8,2M de tokens por paso de flota) a 20 (unos 16,4M) el 2026-09-29, con un tramo a 40 entre las 08:00 y las 14:42 UTC del 2026-09-30.

## Capacidades

- Generación de texto autoregresiva como modelo base: continúa texto, no sigue instrucciones.
- Razonamiento y conocimiento derivados de las mezclas de web, documentos, matemáticas, código, conocimiento y libros.
- Generación de código y matemáticas por la composición del dataset de preentrenamiento.
- Capacidades multilingües limitadas: solo se declara inglés.
- Tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre entrenamiento descentralizado: el modelo sirve para estudiar el comportamiento de DiLoCo desacoplado y de los adaptadores de bajo rango en expertos sobre GPUs de consumo distribuidas, comparando exportaciones sucesivas.
- Estudio de cuantización ternaria: los pesos de expertos en {-1, 0, +1} con escalas por fila y restricción de dos pares no nulos por grupo de ocho permiten analizar el impacto de la ternarización en la calidad del modelo.
- Evaluación de arquitecturas híbridas: las capas GDN2 recurrentes combinadas con atención de ventana deslizante y atención dispersa permiten medir el equilibrio entre eficiencia y capacidad de modelado en un contexto de 4096 tokens.
- Seguimiento de la dinámica de entrenamiento: las exportaciones horarias con métricas val_mix y macro 0-shot/5-shot permiten trazar curvas de aprendizaje y detectar inestabilidades, como las reducciones de learning rate documentadas.
- Reproducción de pipelines de evaluación: el modelo base permite ejecutar evaluaciones 0-shot y 5-shot sobre las mismas mezclas de validación para comparar con otras ejecuciones de Parallax.
- Experimentos de continuación de texto: para tareas de completado de texto en inglés donde no se requiera seguir instrucciones, el modelo puede usarse como generador de continuación en entornos de investigación controlados.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a métricas internas de validación por exportación, no a benchmarks estándar como MMLU, HumanEval o GSM8K.

| Export | Tokens | Step | val_mix (nats/token) | 0-shot macro | 5-shot macro |
|---|---:|---:|---:|---:|---:|
| 881B-tokens_step60735 (latest) | 881,5B | 60735 | 2,112 | 52,3 | 58,6 |
| 878B-tokens_step60486 | 878,1B | 60486 | 2,111 | 52,1 | 58,5 |
| 874B-tokens_step60210 | 874,4B | 60210 | 2,113 | 52,4 | 58,7 |
| 871B-tokens_step59967 | 871,0B | 59967 | 2,115 | 51,8 | 58,7 |
| 867B-tokens_step59683 | 867,2B | 59683 | 2,113 | 51,5 | 58,7 |
| 863B-tokens_step59448 | 863,8B | 59448 | 2,114 | 50,5 | 58,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; las exportaciones ocupan 2,52 GB por carpeta, lo que sugiere un formato muy comprimido (ternario) apto para GPUs de consumo.
- GPU recomendadas: no disponible; el entrenamiento se realizó sobre GPUs de consumo distribuidas, lo que sugiere que la inferencia es viable en hardware consumer.
- ¿Cabe en consumer GPU? Probablemente sí, dado el tamaño de exportación de 2,52 GB y la naturaleza ternaria de los expertos, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: el repositorio incluye formato GGUF, compatible con llama.cpp y derivados como Ollama; no se documentan opciones para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Parallax 8B kappa | ~7,8B (declarado) | ~1,25B | 4096 | MIT | MoE ternario, modelo base, investigación |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones, chat ni seguridad: continúa texto y no sigue órdenes; puede generar contenido inapropiado o dañino sin filtros.
- Checkpoint de mid-training: cada exportación es una instantánea de una ejecución no finalizada, la calidad no es monótona entre exportaciones y las posteriores diferirán.
- Artefacto de investigación: el autor indica explícitamente que no está pensado para uso en producción.
- Sesgos conocidos: no documentados, pero al entrenarse sobre mezclas web y de libros es probable que herede sesgos de esas fuentes.
- Riesgo de alucinación: inherente a un modelo base de este tamaño y a su fase de entrenamiento incompleta.
- Limitaciones de contexto e idioma: contexto de entrenamiento de 4096 tokens y solo inglés declarado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor desaconseja el uso en producción por la naturaleza incompleta del checkpoint.
- Discrepancia de parámetros: el autor declara ~7,8B totales mientras que los safetensors del repositorio indican 1.600.912.175 parámetros; conviene verificar la configuración real antes de cualquier uso.
- Inestabilidad de entrenamiento documentada: reducciones del learning rate por ruido de gradiente y cambios de batch durante la ejecución, lo que puede afectar a la consistencia entre exportaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chutesai/parallax-8b-kappa
- Exportación más reciente: https://huggingface.co/chutesai/parallax-8b-kappa/tree/main/exports/881B-tokens_step60735
- Panel de entrenamiento en vivo: https://parallax.chutes.ai
- Informe técnico: mencionado en la model card como referencia para los detalles del esquema DiLoCo y los adaptadores, sin enlace directo disponible en la información proporcionada.
