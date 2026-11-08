# AdaptiveChunking/spec_E_s1

## Resumen

spec_E_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento concreta (run) del modelo byte-level H-Net denominado beetle-hnet, entrenada con el entrenador legacy del repositorio (`legacy/tier1/train.py`) y separada del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` en el formato de una ejecución por modelo de Beetle. No es un modelo de propósito general orientado a producción, sino un artefacto reproducible de experimentación sobre tokenización y chunking dinámico.

El modelo cuenta con 82.470.528 parámetros según los pesos en safetensors y un repositorio de 6,9 GB, lo que sugiere que el peso de los ficheros corresponde mayoritariamente a los 21 checkpoints retenidos en las ramas `step-N`, no a una única copia de los pesos. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. La etiqueta `byte-level` indica que opera directamente sobre bytes en lugar de sobre un vocabulario de subpalabras, lo que enlaza con la línea de investigación de H-Net sobre segmentación adaptativa de secuencias.

La relevancia de este artefacto es fundamentalmente metodológica: permite inspeccionar la evolución del entrenamiento en pasos concretos (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), reproducir el pipeline con el entrenador legacy y analizar las sondas de frontera FLORES+ publicadas en el dataset asociado. No se han publicado resultados de benchmarks ni una descripción detallada de la arquitectura en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (beetle-hnet); detalles internos no disponibles |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo byte-level, sin lista de idiomas declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

El modelo se etiqueta como H-Net byte-level, vinculado al repositorio beetle-hnet, y fue entrenado con el entrenador legacy del proyecto (`legacy/tier1/train.py`). La información disponible no detalla el número de capas, dimensión oculta, mecanismo de atención ni el esquema exacto de chunking dinámico, por lo que esos datos deben considerarse no disponibles. La naturaleza byte-level implica que la entrada se procesa como secuencia de bytes, lo que evita depender de un tokenizador de subpalabras y conecta con el objetivo de la línea de investigación: segmentación adaptativa de la secuencia.

El entrenamiento se organizó en checkpoints retenidos en ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con sus pesos y su `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (la restauración se hace con `sd[dst] = sd[src]` para cada entrada). El entrenador legacy no conservó estado del optimizador, de modo que no existe directorio `training_state/`. La rama `main` contiene los pesos finales junto con `final.json` y `log.jsonl`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Modelo de investigación centrado en tokenización byte-level y chunking dinámico; no se documentan capacidades de generación, razonamiento o código.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declara lista de idiomas soportados; al operar a nivel de byte, la cobertura lingüística dependería de los datos de entrenamiento, que no se detallan.
- Se publican sondas de frontera FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `spec_E_s1/`, orientadas a evaluar el comportamiento de segmentación.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Reproducción de experimentos de tokenización: cargar los checkpoints `step-N` y comparar la evolución de las representaciones byte-level en distintos puntos del entrenamiento, usando el `log.jsonl` como referencia de la curva de pérdida.
- Investigación sobre chunking dinámico: emplear el modelo como banco de pruebas para estudiar cómo la segmentación adaptativa afecta a la calidad de las representaciones en tareas de frontera.
- Evaluación con sondas FLORES+: ejecutar las sondas del dataset `AdaptiveChunking/hnet-chunking-probes` sobre `spec_E_s1/` para medir el comportamiento en fronteras de segmentación multilingüe.
- Análisis de estabilidad del entrenamiento: al conservar checkpoints en potencias de dos y pasos posteriores (1000, 2000, etc.), permite estudiar la dinámica temprana y la convergencia del entrenador legacy.
- Desarrollo de pipelines de tokenización byte-level: servir como referencia para implementar o validar tokenizadores que operan sobre bytes sin vocabulario de subpalabras.
- Docencia y divulgación: el tamaño de 82 M parámetros y la disponibilidad de checkpoints intermedios lo hacen adecuado para ilustrar el ciclo de vida de un entrenamiento y el uso de pesos atados (`tied_weights`).
- Reutilización como inicialización: los pesos con licencia Apache 2.0 pueden servir de punto de partida para experimentos propios de chunking, siempre que se valide previamente su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,33 GB; en FP16/BF16, unos 0,16 GB; en INT8, unos 0,08 GB. El consumo real dependerá de la longitud de secuencia y del mecanismo de chunking, no detallados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en precisiones reducidas; no se dispone de datos de latencia ni de throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se ha verificado experimentalmente en la información disponible.
- Opciones de despliegue: al estar en formato PyTorch/safetensors y no publicarse pesos GGUF, el despliegue requeriría cargar los pesos con PyTorch o convertir el modelo a otros formatos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados; no debe asumirse calidad de producción en ninguna tarea.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde un checkpoint.
- No se documentan sesgos conocidos, pero al no declararse la composición del dataset de entrenamiento no es posible evaluar sesgos de dominio o idioma.
- Riesgo de alucinación no evaluado; no se dispone de datos sobre comportamiento generativo.
- No se declara lista de idiomas soportados; el enfoque byte-level no garantiza cobertura multilingüe sin datos de entrenamiento adecuados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- El repositorio de 6,9 GB incluye 21 checkpoints; la descarga completa es costosa si solo se necesita la rama `main`.
- La restauración de pesos atados requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); obviarlo puede producir un modelo con pesos incorrectos.
- No se documenta pipeline, por lo que no es directamente utilizable con `transformers` sin trabajo de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_E_s1
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
