# AdaptiveChunking/ali_lexmem-v1-vgate_s0

## Resumen

ali_lexmem-v1-vgate_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net, concretamente sobre la implementación `beetle-hnet` del autor suchirsalhan. El objetivo del proyecto es estudiar mecanismos de segmentación adaptativa (dynamic chunking) que permitan al modelo agrupar bytes en unidades de mayor nivel de forma aprendida, en lugar de depender de un vocabulario BPE fijo.

El modelo tiene 22.785.088 parámetros y fue entrenado durante 6000 pasos con un batch de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. La variante `vgate_s0` corresponde a una configuración concreta de compuerta de vocabulario (vocabulary gate) y semilla 0, dentro de una familia de ejecuciones que el autor organiza por ramas de checkpoint (`step-N`) siguiendo un calendario logarítmico por fases.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para investigar cómo afecta la tokenización adaptativa al rendimiento en idiomas con morfología aglutinante (turco, finés) frente al inglés. No está pensado para despliegue en producción ni para tareas generativas generales, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (implementación `beetle-hnet`, `architecture=ali`, `objective=ratio`) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se documenta ventana de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo se basa en H-Net, una familia de arquitecturas jerárquicas que aprenden a agrupar tokens (en este caso bytes) en unidades de mayor granularidad mediante mecanismos de chunking dinámico. La configuración concreta usa `architecture=ali`, `objective=ratio` y `schedule=None`, con un mecanismo de dechunking basado en media móvil exponencial (`dechunk=ema`). Los pesos están atados (`tied_weights` en `config.json`), de modo que `model.safetensors` almacena cada tensor compartido una sola vez.

El entrenamiento consistió en 6000 pasos con batch efectivo de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. La elección de turco y finés es deliberada: son idiomas con morfología aglutinante y alta productividad léxica, donde la tokenización BPE estándar fragmenta palabras de forma agresiva, y por tanto son un banco de pruebas natural para evaluar si el chunking adaptativo a nivel de byte mitiga ese problema. El repositorio conserva checkpoints intermedios en ramas `step-N` siguiendo un calendario logarítmico en base 2 desde el inicio de cada fase del objetivo, además del estado resumible completo del entrenador (`training_state/checkpoint.pt`), lo que permite reanudar o auditar el proceso.

## Capacidades

- Modelado de lenguaje a nivel de byte: predice el siguiente byte, sin vocabulario discreto previo.
- Segmentación adaptativa aprendida: agrupa bytes en chunks de forma dinámica según el contenido, en lugar de usar fronteras fijas de BPE.
- Multilingüismo restringido a inglés, turco y finés, con énfasis en morfologías aglutinantes.
- Evaluación de fronteras de chunking: el repositorio incluye sondas `probe/` sobre FLORES+ para inspeccionar dónde coloca el modelo las fronteras una vez finalizado el entrenamiento.
- Reproducibilidad experimental: checkpoints intermedios, configuración de entrenamiento (`training_config.yaml`) y estado del entrenador disponibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización: comparar la calidad de las fronteras de chunking aprendidas por este modelo con las de un tokenizador BPE entrenado sobre el mismo corpus, usando las sondas FLORES+ incluidas en el repositorio.
- Estudio de morfología aglutinante: analizar cómo segmenta el modelo palabras turcas y finesas largas, y si los chunks aprendidos se alinean con morfemas o sufijos reales.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` cargando `training_state/checkpoint.pt` para extender el número de pasos o cambiar la composición del corpus.
- Ablación de hiperparámetros: la variante `vgate_s0` forma parte de una familia de ejecuciones; sirve como línea base para comparar contra otras configuraciones de compuerta de vocabulario o de calendario de dechunking.
- Docencia y divulgación: ejemplo compacto (22,8 M de parámetros) de arquitectura jerárquica con chunking dinámico, adecuado para explicar tokenización aprendida sin requerir hardware de gran escala.
- Análisis de eficiencia de representación: medir la longitud media de chunk por idioma para estimar cuántos pasos de cómputo ahorraría un modelo de este tipo frente a un modelo byte a byte puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, exactitud en tareas downstream ni comparaciones cuantitativas con tokenizadores de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16, unos 46 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar el modelo. Para entrenamiento, una sola GPU consumer basta.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia (`beetle-hnet`), requiere cargar el código del repositorio de GitHub correspondiente; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (tokenización adaptativa a nivel de byte con arquitectura H-Net) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de texto de calidad.
- Corpus muy limitado: solo inglés, turco y finés; no se espera un comportamiento competente en otros idiomas.
- Contexto corto: el entrenamiento usa secuencias de 1024 bytes, lo que restringe la ventana útil para tareas que requieran contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que permita justificar su adopción frente a alternativas consolidadas.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; en este caso, además, sin evaluación de seguridad ni alineación documentada.
- Sesgos: no documentados; el corpus de entrenamiento no se describe en detalle, por lo que no puede evaluarse su composición ni posibles sesgos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un artefacto experimental conviene verificar la procedencia de los datos de entrenamiento antes de cualquier uso derivado.
- Dependencia de código externo: la arquitectura requiere el repositorio `beetle-hnet` para cargar los pesos; no hay integración con ecosistemas estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1-vgate_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio de la arquitectura: https://github.com/suchirsalhan/beetle-hnet
