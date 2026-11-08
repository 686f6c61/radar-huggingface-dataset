# AdaptiveChunking/ali_ali-noskel_s0

## Resumen

ali_ali-noskel_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework beetle-hnet, con arquitectura interna denominada "ali" y objetivo de entrenamiento "ratio". El modelo tiene 22.785.088 parámetros totales y se distribuye en formato safetensors con pesos atados (tied weights).

El modelo se entrenó durante 6000 pasos con un tamaño de lote de 32 y secuencias de 1024 bytes, sobre un corpus multilingüe limitado a tres idiomas: inglés, turco y finés. Su propósito es servir como artefacto reproducible para estudiar estrategias de chunking adaptativo y segmentación a nivel de byte, no para despliegue en producción como asistente o generador de código.

La relevancia actual es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin model card orientada a uso general. Resulta útil para investigadores que trabajen en tokenización libre de vocabulario, modelos byte-level y arquitecturas H-Net, pero no constituye una alternativa a modelos generativos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante "ali", framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco, finés (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados), checkpoint de entrenamiento en .pt |

## Arquitectura y entrenamiento

El modelo sigue la familia H-Net implementada en beetle-hnet, una arquitectura jerárquica de chunking dinámico que opera directamente sobre bytes en lugar de sobre tokens de un vocabulario fijo. La variante concreta es "ali" con objetivo "ratio" y un mecanismo de dechunking basado en EMA (media móvil exponencial), según la configuración declarada en la model card. Los pesos están atados: `model.safetensors` almacena cada tensor una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

El entrenamiento consistió en 6000 pasos con lote de 32 y secuencias de 1024 bytes, con semilla 0 y sin schedule de fases (`schedule=None`). Los datos cubren tres idiomas: inglés, turco y finés. El repositorio conserva checkpoints intermedios en ramas `step-N` siguiendo un esquema logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ...), cada uno con su estado de entrenador reanudable en `training_state/checkpoint.pt`. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, una vez finalizado el run, sondas de frontera FLORES+ en `probe/`. No se documenta uso de RLHF, DPO ni datos de preferencias.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Segmentación y chunking dinámico de flujos de bytes, que es el objeto principal del experimento.
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Evaluación de fronteras de segmentación mediante sondas FLORES+ (directorio `probe/`).
- Reproducibilidad completa: checkpoints intermedios y estado de entrenador reanudable.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización sin vocabulario: el modelo permite estudiar cómo un H-Net aprende fronteras de chunk sobre bytes crudos en lugar de tokens BPE, usando las ramas `step-N` para analizar la evolución del chunking a lo largo del entrenamiento.
- Análisis de segmentación multilingüe en lenguas aglutinantes: el corpus incluye turco y finés, dos idiomas con morfología compleja, lo que permite comparar cómo el modelo agrupa morfemas frente al inglés.
- Reproducción de experimentos de chunking adaptativo: la preservación del estado del entrenador en `training_state/checkpoint.pt` permite reanudar o bifurcar runs con la misma semilla y configuración.
- Evaluación de fronteras con FLORES+: las sondas incluidas en `probe/` sirven para medir la calidad de las fronteras de segmentación sobre texto multilingüe de referencia.
- Estudio de pesos atados en arquitecturas jerárquicas: el mapeo `tied_weights` de `config.json` facilita analizar el efecto del weight tying en modelos pequeños de 22,8 M de parámetros.
- Baseline para modelos byte-level: al ser un modelo pequeño y con licencia Apache 2.0, puede actuar como referencia en comparaciones de eficiencia frente a tokenizadores clásicos en tareas de compresión o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090 o incluso CPU son viables para inferencia. Para reentrenar, una única GPU consumer basta.
- Cabe en GPU consumer: sí, sin restricciones prácticas de memoria.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia (beetle-hnet), no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere cargar los pesos con PyTorch y el código del framework beetle-hnet.
- Latencia y throughput estimados: no disponibles; dependen de la implementación del mecanismo de chunking dinámico, que no es un transformer estándar.
- Nota: el tamaño del repositorio es de 3,5 GB, muy superior al de los pesos, debido a los múltiples checkpoints y estados de entrenador almacenados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-noskel_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (0 descargas) |
| Modelos byte-level tipo ByT5 | no disponible | no disponible | Transformer byte-level sin vocabulario | no disponible | no disponible |
| Tokenizadores BPE estándar (p. ej. tiktoken) | no aplica | no aplica | Segmentación subpalabra determinista | variable | amplia |

No se dispone de datos de benchmarks ni de comparaciones directas publicadas para este checkpoint, por lo que la comparativa se limita a categorías arquitectónicas y no a rendimiento medido.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni model card orientada a uso general; no debe tratarse como un LLM listo para producción.
- Contexto muy limitado: 1024 bytes, insuficiente para la mayoría de tareas de generación o análisis de documentos.
- Cobertura lingüística restringida a inglés, turco y finés; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación no evaluado: no se han publicado métricas de calidad, fidelidad ni evaluación de sesgos.
- Sin soporte documentado de tool calling, agentes ni instrucciones; no es un modelo alineado para conversación.
- El repositorio incluye checkpoints intermedios y estados de entrenador que elevan el tamaño a 3,5 GB; conviene descargar solo la rama o el fichero necesario.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de evaluación de calidad hace desaconsejable su uso en entornos productivos sin validación propia.
- El formato de pesos es safetensors con pesos atados; cargarlo requiere respetar el mapeo de `config.json["tied_weights"]` y el código del framework beetle-hnet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-noskel_s0
- Organización AdaptiveChunking en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
