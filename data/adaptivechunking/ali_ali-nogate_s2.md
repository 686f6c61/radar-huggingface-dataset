# AdaptiveChunking/ali_ali-nogate_s2

## Resumen

`ali_ali-nogate_s2` es un modelo de investigación desarrollado por la organización AdaptiveChunking, publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje conversacional al uso, sino un artefacto experimental de un pipeline de tokenización dinámica a nivel de byte: concretamente, una ejecución de la arquitectura H-Net implementada en el repositorio `beetle-hnet`, con la variante de arquitectura `ali`, el objetivo de entrenamiento `ratio`, sin schedule (`schedule=None`), decodificación de chunks por media móvil exponencial (`dechunk=ema`) y semilla 2.

El modelo resuelve un problema específico de investigación: aprender a segmentar y agrupar bytes en unidades de longitud variable (chunks) de forma adaptativa, en lugar de depender de un tokenizador fijo tipo BPE. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre tres idiomas (inglés, turco y finés), lo que lo convierte en una pieza de estudio sobre tokenización byte-level multilingüe más que en un modelo listo para producción.

Con 22.583.040 parámetros totales y un repositorio de 13 GB (que incluye múltiples checkpoints intermedios y estados completos del entrenador), su relevancia es acotada: sirve para reproducir experimentos de chunking dinámico y para analizar la evolución del entrenamiento paso a paso, no para tareas generativas generales. La model card no documenta capacidades de generación de texto, razonamiento ni instrucción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net, variante `ali` (byte-level, dynamic chunking) |
| Parámetros totales | 22.583.040 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante el entrenamiento |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, turco, finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez y mapeados vía `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para el estado del entrenador |

## Arquitectura y entrenamiento

El modelo implementa una H-Net de nivel de byte según la implementación de `beetle-hnet`, con `architecture=ali` y `objective=ratio`. La característica central es el chunking dinámico: el modelo procesa secuencias de bytes y aprende a agruparlos en unidades de longitud variable, con una etapa de dechunking basada en media móvil exponencial (`dechunk=ema`) que reconstruye la salida a nivel de byte. No se especifica en la información disponible el número de capas, dimensión oculta ni cabezas de atención.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el objetivo `ratio` y la ausencia de schedule (`schedule=None`) indican una configuración de ablation dentro de una campaña experimental más amplia. El repositorio conserva checkpoints en una programación logarítmica por fases (pasos 0, 1, 2, 4, 6, 8, 16, …, 2^k y el paso final), cada uno con pesos, configuración, `training_config.yaml` y estado resumible del entrenador, lo que permite reanudar o inspeccionar el entrenamiento en cualquier punto.

## Capacidades

- Modelado de bytes con segmentación adaptativa: procesa entrada a nivel de byte y aprende límites de chunk de forma dinámica.
- Tokenización byte-level multilingüe para inglés, turco y finés, tres idiomas con morfología y ortografía muy distintas.
- Reanudación de entrenamiento: cada checkpoint `step-N` incluye `training_state/checkpoint.pt` con el estado completo del entrenador.
- Evaluación de fronteras de chunk: el branch `main` incluye sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta capacidad de instrucción ni de diálogo.

## Casos de uso

- Investigación en tokenización dinámica: usar los checkpoints intermedios para estudiar cómo evoluciona la segmentación en chunks a lo largo del entrenamiento y comparar la variante `ali` con otras arquitecturas del mismo repositorio.
- Ablación controlada de schedules: al tener `schedule=None` y semilla 2, sirve como punto de comparación frente a ejecuciones con schedule definido y otras semillas dentro de la misma campaña experimental.
- Análisis de morfología multilingüe: el entrenamiento conjunto en inglés, turco y finés permite examinar si el chunking aprendido se alinea con morfemas en lenguas aglutinantes como el turco y el finés.
- Reproducción de experimentos: la presencia de `training_config.yaml` y del estado resumible en cada checkpoint permite replicar o continuar el entrenamiento desde cualquier fase.
- Evaluación de fronteras de chunk: las sondas FLORES+ en `probe/` permiten medir la calidad de las fronteras aprendidas sobre texto multilingüe de referencia.
- Estudio de eficiencia de tokenizadores byte-level: comparar la longitud media de chunk frente a BPE sobre los mismos corpus para estimar ganancias de compresión.
- Base para prototipos de preprocesado: integrar el modelo como componente de segmentación en pipelines de investigación que necesiten un tokenizador aprendido y no fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona sondas de frontera FLORES+ en el directorio `probe/` del branch `main`, pero no se proporcionan métricas numéricas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,58 M de parámetros, los pesos en FP32 ocupan aproximadamente 90 MB; en FP16, unos 45 MB. La VRAM adicional depende del tamaño de batch y de las activaciones de la H-Net, no cuantificadas en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para los pesos; una RTX 3060 de 12 GB o superior cubre con holgura el modelo y batches moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM para inferencia con batches pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada de `beetle-hnet`, requiere cargarse con el código del repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 13 GB debido a los múltiples checkpoints y estados del entrenador; para inferencia basta con descargar un único `step-N`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_ali-nogate_s2` (AdaptiveChunking) | 22,58 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Otros checkpoints de `beetle-hnet` | no disponible | no disponible | Variantes de arquitectura y schedule del mismo pipeline | no disponible | Repositorio `beetle-hnet` |
| Tokenizadores BPE estándar (p. ej. SentencePiece) | no aplica (no neuronal) | no aplica | Segmentación subpalabra fija | variable | Amplia |

No se dispone de información sobre modelos neuronales comparables de chunking dinámico con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje para uso general: no se documentan capacidades de generación, instrucción ni diálogo, por lo que no debe emplearse en tareas conversacionales o de producción sin validación previa.
- Cobertura lingüística muy limitada: solo inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Contexto corto: 1024 bytes por secuencia durante el entrenamiento, sin evidencia de extrapolación a secuencias más largas.
- Entrenamiento corto: 6000 pasos con batches de 32 × 1024 bytes es una configuración de investigación, no de escala de producción.
- Riesgo de sesgos: el corpus de entrenamiento no está documentado, por lo que no puede evaluarse la composición ni los sesgos resultantes.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, pero la segmentación aprendida puede producir fronteras incorrectas en texto fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un artefacto experimental sin garantías, el uso en producción requiere evaluación propia.
- Dependencia de código: la arquitectura `ali` requiere el repositorio `beetle-hnet` para cargar los pesos; no es un modelo estándar de Transformers.
- Tamaño del repositorio: 13 GB por los checkpoints y estados del entrenador, lo que complica su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-nogate_s2
- Organización AdaptiveChunking en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
