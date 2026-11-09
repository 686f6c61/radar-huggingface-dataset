# AdaptiveChunking/ali_lexmem-v1-vgate_s4

## Resumen

ali_lexmem-v1-vgate_s4 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) bajo la arquitectura denominada `ali` y un objetivo de entrenamiento `ratio`. No es un modelo de lenguaje conversacional al uso: se trata de un experimento sobre tokenización dinámica y segmentación de bytes (dynamic chunking, byte-level), orientado a estudiar cómo una red H-Net aprende a agrupar secuencias de bytes en unidades de longitud variable en lugar de depender de un vocabulario BPE fijo.

El modelo tiene 22.785.088 parámetros (unos 22,8 M) y fue entrenado durante 6.000 pasos con batches de 32 secuencias de 1.024 bytes, en tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). La elección de estos idiomas es relevante porque el turco y el finés son lenguas aglutinantes con morfología compleja, lo que las convierte en un banco de pruebas habitual para evaluar estrategias de segmentación subword y byte-level.

El checkpoint forma parte de una familia de variantes (`vgate_s4`, con semilla 4) y se distribuye con el estado completo del entrenador, lo que lo hace útil para reproducibilidad e investigación, no para despliegue en producción como asistente. La licencia Apache 2.0 permite reutilización amplia, pero su naturaleza experimental y la ausencia de benchmarks publicados limitan su aplicabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet, `architecture=ali`), byte-level con dynamic chunking |
| Parametros totales | 22.785.088 (22,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 bytes por secuencia durante entrenamiento; contexto de inferencia no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint PyTorch) |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (Hierarchical Network) implementada en beetle-hnet, con la variante `ali` y un objetivo de tipo `ratio`. El modelo opera a nivel de byte, sin vocabulario BPE, y aplica un mecanismo de chunking dinámico con desagrupamiento basado en media móvil exponencial (`dechunk=ema`). El entrenamiento siguió un esquema de fases con checkpoints guardados en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase, más el paso final), lo que sugiere un currículo progresivo de segmentación.

Los datos de entrenamiento no se detallan en la información disponible: no se especifica el número total de tokens, la composición del corpus ni si hubo RLHF, DPO o ajuste por instrucciones. Se sabe que se usaron 6.000 pasos con batches de 32 × 1.024 bytes, lo que da un total aproximado de 196,6 millones de bytes procesados (6.000 × 32 × 1.024), una cifra modesta propia de un experimento de investigación. El repositorio incluye sondas de frontera FLORES+ (`probe/`) generadas al finalizar la ejecución, lo que indica que el autor evalúa la calidad de la segmentación sobre textos multilingües.

## Capacidades

- Modelado de secuencias a nivel de byte con segmentación dinámica aprendida, sin tokenizador externo.
- Procesamiento multilingüe limitado a inglés, turco y finés según la configuración de entrenamiento.
- Evaluación de fronteras de chunk mediante sondas FLORES+, útil para analizar calidad de segmentación.
- Checkpoints intermedios reproducibles con estado completo del entrenador (incluye inventario en brazos de tipo inventory).
- Pesos con compartición de tensores (`tied_weights` en `config.json`), lo que reduce el almacenamiento.
- No se documentan capacidades de generación de texto conversacional, tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización byte-level: permite comparar la segmentación aprendida por una H-Net frente a BPE o SentencePiece sobre corpus en inglés, turco y finés, usando las sondas FLORES+ incluidas.
- Estudio de morfología en lenguas aglutinantes: el modelo puede analizarse para ver si agrupa sufijos del turco y el finés de forma coherente, lo que aporta evidencia sobre chunking morfológico.
- Reproducibilidad de experimentos: al incluir `training_state/checkpoint.pt` y `training_config.yaml`, se puede reanudar el entrenamiento desde cualquier checkpoint de la programación log2 y verificar resultados con la semilla 4.
- Análisis de compartición de tensores: el mapeo `tied_weights` permite estudiar el impacto del weight tying en modelos pequeños de 22,8 M de parámetros.
- Docencia y prototipado: su tamaño reducido (22,8 M de parámetros) permite ejecutarlo en CPU o GPU de gama baja para demostrar conceptos de segmentación dinámica.
- Base para ablaciones: sirve como punto de partida para comparar variantes de la familia (por ejemplo, `vgate` con otras semillas) y medir sensibilidad a la inicialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros en fp32, los pesos ocupan aproximadamente 91 MB; en fp16, unos 46 MB. El repositorio completo pesa 9,5 GB por los múltiples checkpoints y estados del entrenador, no por el modelo en sí.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia; una RTX 3060 o superior resulta holgada. Para reentrenar, una GPU con 8-16 GB facilita batches de 32 × 1.024 bytes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo (carga vía `torch.load` o `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y su naturaleza byte-level no estándar probablemente requiera código específico de beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_lexmem-v1-vgate_s4 | 22,8 M | 1.024 bytes (entrenamiento) | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face |
| Byte-level BPE estándar (p. ej. GPT-2 tokenizer) | no aplica (tokenizador) | no aplica | Segmentación subword fija | MIT / Apache 2.0 | Amplia |
| Modelos H-Net de investigación comparables | no disponible | no disponible | H-Net | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables de la misma familia o tamaño con benchmarks publicados; la comparación con tokenizadores BPE es conceptual, no de rendimiento.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de texto fiable.
- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas estándar.
- Idiomas limitados a inglés, turco y finés; no se garantiza comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación y salidas incoherentes si se usa como modelo generativo fuera de su dominio de entrenamiento.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición del corpus, por lo que no pueden evaluarse.
- Ventana de contexto corta (1.024 bytes) y sin información sobre extrapolación a secuencias más largas.
- El repositorio de 9,5 GB incluye múltiples checkpoints y estados del entrenador; descargar solo el checkpoint necesario mediante `revision` para evitar consumo innecesario de disco.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación técnica desaconseja cualquier despliegue comercial sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1-vgate_s4
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
