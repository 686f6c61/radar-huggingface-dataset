# AdaptiveChunking/ali_mem-mixed-quota_s4

## Resumen

ali_mem-mixed-quota_s4 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, entrenado con el framework beetle-hnet (repositorio github.com/suchirsalhan/beetle-hnet) bajo la arquitectura denominada "ali" y el objetivo "ratio". Se trata de un modelo byte-level de tipo H-Net (hierarchical network) orientado al estudio de tokenización dinámica y segmentación adaptativa de bytes, no a la generación de texto conversacional. El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre tres idiomas: inglés, turco y finés.

El modelo tiene 22.785.088 parámetros totales, según los pesos en safetensors, y un tamaño de repositorio de 8,3 GB, lo que indica que el repositorio almacena múltiples checkpoints intermedios (`step-N`) además de los pesos finales. La relevancia de este artefacto es fundamentalmente metodológica: sirve para reproducir experimentos de chunking dinámico y evaluar cómo distintos esquemas de segmentación afectan al rendimiento en tareas de frontera (boundary probes) medidas con FLORES+.

No se dispone de información sobre el pipeline de inferencia, los idiomas soportados en producción ni resultados de benchmarks estándar. La model card es escueta y describe únicamente el layout del repositorio, la configuración del entrenamiento y el procedimiento de descarga de checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level, variante "ali" (beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con en, tr, fi; soporte en produccion no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez y mapeados via `config.json["tied_weights"]`); estado del entrenador en `checkpoint.pt` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (hierarchical network) que opera a nivel de byte, es decir, sin tokenizador subword: el modelo procesa directamente secuencias de bytes. La variante concreta es `architecture=ali`, con `objective=ratio`, `schedule=None` y `dechunk=ema`. El entrenamiento se ejecutó con seed 4 durante 6000 pasos, con batches de 32 secuencias de 1024 bytes cada una, sobre los idiomas inglés, turco y finés. No se especifica el número total de tokens procesados ni la composición exacta del corpus más allá de la lista de idiomas.

El repositorio sigue el layout "Beetle-style": ramas `step-N` con checkpoints conservados según un calendario logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado resumible del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizado el entrenamiento. No se documentan innovaciones como decodificación especulativa, atención lineal o técnicas de RLHF/DPO.

## Capacidades

- Procesamiento byte-level: el modelo opera directamente sobre bytes, sin tokenizador subword, lo que permite en principio manejar cualquier secuencia de bytes de entrada.
- Segmentación dinámica (dynamic chunking): el objetivo `ratio` y el mecanismo `dechunk=ema` sugieren que el modelo aprende a determinar fronteras o chunks de forma adaptativa.
- Evaluación de fronteras: el repositorio incluye sondas de frontera sobre FLORES+ (`probe/`) para medir la calidad de la segmentación.
- Multilingüismo limitado al entrenamiento: inglés, turco y finés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta generación de texto conversacional ni instrucciones.

## Casos de uso

- Investigación en tokenización libre de tokenizador: el modelo sirve como banco de pruebas para estudiar cómo un encoder byte-level aprende representaciones sin vocabulario subword, comparando checkpoints intermedios del calendario logarítmico.
- Estudio de chunking dinámico: el objetivo `ratio` y `dechunk=ema` permiten analizar experimentalmente cómo distintas políticas de segmentación afectan a las representaciones internas.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ en `probe/` permiten medir la capacidad del modelo de detectar límites de unidades lingüísticas en inglés, turco y finés.
- Reproducción de experimentos: los checkpoints resumibles (`training_state/checkpoint.pt`) permiten reanudar o bifurcar el entrenamiento para replicar resultados con seed 4.
- Análisis comparativo de arquitecturas H-Net: al compartir framework con otras variantes de beetle-hnet, permite comparar `architecture=ali` frente a alternativas bajo el mismo pipeline.
- Estudio de multilingüismo de bajos recursos: turco y finés son idiomas morfológicamente ricos, adecuados para analizar el comportamiento byte-level en lenguas aglutinantes.
- Docencia y formación: como artefacto pequeño (22,8 M de parámetros) es viable para experimentos educativos sobre entrenamiento y evaluación de modelos byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16 unos 46 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia; para entrenamiento, una RTX 3060 o superior es adecuada dado el tamaño reducido.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el modelo se distribuye como pesos PyTorch/safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante carga directa con PyTorch o mediante el framework beetle-hnet.
- Latencia y throughput: no disponible. El tamaño del repositorio (8,3 GB) se debe a los múltiples checkpoints, no al peso del modelo en inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni documentado para uso en producción, generación de texto o tareas conversacionales.
- Idiomas limitados: el entrenamiento cubre únicamente inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Sin datos de benchmarks: no hay evidencia publicada de calidad, lo que impide evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero al ser un modelo byte-level sin alineación documentada, sus salidas no deben interpretarse como texto fiable.
- Sesgos: no documentados; el corpus de entrenamiento no se describe en detalle, por lo que no se pueden evaluar sesgos lingüísticos o culturales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías, su uso en producción requeriría validación propia.
- Tamaño del repositorio: 8,3 GB por la acumulación de checkpoints; la descarga completa no es necesaria para inferencia, basta con la rama `main` o un `step-N` concreto.
- Pesos atados: `model.safetensors` almacena cada tensor atado una sola vez; es necesario aplicar el mapeo de `config.json["tied_weights"]` al cargar los pesos manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-quota_s4
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
