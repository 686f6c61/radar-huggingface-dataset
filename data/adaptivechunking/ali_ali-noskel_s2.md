# AdaptiveChunking/ali_ali-noskel_s2

## Resumen

`ali_ali-noskel_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución experimental de arquitectura H-Net (hierarchical network) a nivel de byte, construida sobre el framework `beetle-hnet`. El modelo se entrenó con la variante de arquitectura `ali`, objetivo `ratio`, sin esquema de programación (`schedule=None`), decodificación por media móvil exponencial (`dechunk=ema`) y semilla 2.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre textos en inglés, turco y finés. El interés técnico reside en la tokenización dinámica a nivel de byte y en la experimentación con segmentación adaptativa (dynamic chunking), un área de investigación que busca eliminar la dependencia de tokenizadores fijos y mejorar la robustez multilingüe y ante ruido.

Con 22.785.088 parámetros, es un modelo pequeño orientado a experimentación y ablación, no a producción. Su licencia Apache 2.0 permite reutilización, pero la ausencia de benchmarks publicados, de model card descriptiva de capacidades y de idiomas declarados limita seriamente su evaluación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali`), framework beetle-hnet |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes por secuencia en entrenamiento (no se declara contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; no se declara soporte oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en `beetle-hnet`, con procesamiento a nivel de byte (byte-level) en lugar de tokens subword. La configuración corresponde a la variante `ali` con objetivo `ratio`, sin programación de fases (`schedule=None`) y con decodificación mediante media móvil exponencial (`dechunk=ema`). El entrenamiento se ejecutó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes cada una, lo que supone aproximadamente 196 millones de bytes procesados en total.

Los datos de entrenamiento cubren tres idiomas: inglés, turco y finés. No se detalla la composición exacta del corpus ni si hubo fases de ajuste fino con RLHF o DPO; el objetivo `ratio` sugiere una función de pérdida o criterio de segmentación basado en ratios, pero la model card no lo especifica. La innovación principal es el chunking dinámico a nivel de byte, que evita el tokenizador fijo y permite segmentaciones adaptativas según el contenido.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Segmentación dinámica (dynamic chunking) con decodificación por media móvil exponencial.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Pesos atados con mapa explícito en `config.json["tied_weights"]`.
- Checkpoints intermedios en ramas `step-N` con estado resumible del entrenador.
- Sondas de frontera FLORES+ en el directorio `probe/` tras finalizar la ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización a nivel de byte: permite reproducir y comparar la variante `ali` frente a otras configuraciones de `beetle-hnet` para estudiar el efecto del chunking dinámico en la perplejidad.
- Ablación de decodificación: el uso de `dechunk=ema` frente a alternativas permite medir el impacto de la estrategia de decodificación en la calidad de segmentación.
- Estudio de multilingüismo de bajo recurso: el entrenamiento con turco y finés, idiomas con morfología aglutinante, sirve para analizar cómo el byte-level maneja lenguas con alta productividad morfológica.
- Reproducción de experimentos: los checkpoints `step-N` con `training_state/checkpoint.pt` permiten reanudar el entrenamiento y verificar resultados de forma exacta.
- Evaluación de fronteras de segmentación: las sondas FLORES+ en `probe/` permiten analizar dónde el modelo decide cortar unidades lingüísticas.
- Base para experimentos de compresión o modelado de secuencias cortas: con 22,8 M de parámetros, es viable entrenar y evaluar variantes en una sola GPU consumer.
- Docencia y formación: útil como ejemplo didáctico de arquitectura H-Net y tokenización dinámica en cursos de PLN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros en fp32, aproximadamente 91 MB de pesos; en fp16, unos 46 MB. El cuello de botella es el contexto y el estado del framework, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para entrenamiento con batch 32 x 1024 bytes, una RTX 3060 de 12 GB o superior es adecuada.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1060 6 GB en adelante), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia de `beetle-hnet`, requiere el código del repositorio `suchirsalhan/beetle-hnet`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-noskel_s2 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level, dynamic chunking | Apache 2.0 | Hugging Face |
| Modelos byte-level tipo ByT5-small | ~300 M | variable | Transformer byte-level | Apache 2.0 | Hugging Face |
| Modelos H-Net de referencia | no disponible | no disponible | H-Net genérico | según implementación | GitHub / papers |

No se dispone de comparativas de rendimiento publicadas entre este modelo y alternativas de la misma categoría. La comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- Contexto de entrenamiento muy corto (1024 bytes): no apto para tareas que requieran contexto largo.
- Idiomas limitados a inglés, turco y finés; no se declara cobertura de castellano.
- Modelo de investigación sin pipeline declarado en Hugging Face (`pipeline: no disponible`), lo que indica que no está empaquetado para uso directo con `transformers`.
- Requiere el framework `beetle-hnet` para cargar y ejecutar; no es plug-and-play.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Sin garantías de soporte ni mantenimiento; 0 descargas y 0 likes en el momento de la ficha.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación de calidad desaconseja su uso en producción sin validación previa.
- El tamaño del repositorio (16,4 GB) se debe a los múltiples checkpoints con estado del entrenador, no al modelo en sí.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-noskel_s2
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
