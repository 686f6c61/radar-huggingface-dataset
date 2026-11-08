# AdaptiveChunking/exp32_onechunk_s0

## Resumen

exp32_onechunk_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo de lenguaje de nivel byte basado en la arquitectura H-Net, entrenado con el repositorio de código abierto beetle-hnet mediante el entrenador heredado (`legacy/tier1/train.py`). El modelo procede del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m`, del que se ha separado siguiendo el formato de una ejecución por directorio de Beetle.

El interés del modelo es fundamentalmente de investigación: explora el "dynamic chunking" (segmentación dinámica de secuencias) y la tokenización a nivel de byte, una línea de trabajo que busca eliminar la dependencia de tokenizadores subword fijos y adaptar la longitud de los segmentos procesados. No es un modelo destinado a uso en producción ni a tareas generales de generación, sino un artefacto experimental con múltiples checkpoints intermedios conservados para su análisis.

Con 82.470.528 parámetros reales en safetensors y un repositorio de 6,9 GB, el modelo es de tamaño reducido (categoría ~82M). La información pública disponible sobre datos de entrenamiento, contexto, idiomas o evaluación es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), procesamiento a nivel de byte con dynamic chunking |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (rama `main` con `model.safetensors`; ramas `step-N` con `model.safetensors` y `config.json`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net implementada en beetle-hnet y opera a nivel de byte, sin tokenizador subword convencional. La etiqueta "dynamic chunking" sugiere que el modelo segmenta dinámicamente la secuencia de entrada en lugar de procesar un flujo fijo de tokens. El entrenamiento se realizó con el entrenador heredado del repositorio (`legacy/tier1/train.py`), que no conserva estado del optimizador, por lo que no se incluye ningún directorio `training_state/` en el artefacto. Los pesos están atados (tied weights): el `config.json` de cada checkpoint incluye un mapa `tied_weights` que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada.

El repositorio conserva 21 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), lo que permite estudiar la evolución del entrenamiento paso a paso. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Modelo de lenguaje a nivel de byte orientado a investigación en tokenización y segmentación dinámica.
- Generación de texto autoregresiva (capacidad esperable de un LM, sin confirmación explícita en la documentación disponible).
- Procesamiento a nivel de byte, lo que en principio evita el vocabulario subword fijo y podría favorecer la generalización entre idiomas y formatos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles/verificadas.
- No se documenta visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre tokenización a nivel de byte: el modelo sirve como banco de pruebas para comparar el enfoque byte-level frente a tokenizadores BPE o SentencePiece en tareas controladas.
- Análisis de dynamic chunking: permite estudiar cómo la segmentación adaptativa afecta al rendimiento en secuencias de distinta naturaleza (texto natural, código, datos binarios).
- Reproducción de experimentos: las 21 ramas `step-N` permiten reconstruir la curva de entrenamiento y validar hallazgos del proyecto beetle-hnet.
- Evaluación de fronteras de segmentación: los sondeos (probes) sobre FLORES+ publicados en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `exp32_onechunk_s0/` permiten analizar el comportamiento del modelo en límites de frase multilingües.
- Docencia y formación: modelo pequeño (~82M parámetros) adecuado para ilustrar arquitecturas H-Net y entrenamiento desde cero en entornos con recursos limitados.
- Base para fine-tuning experimental: al ser Apache 2.0 y de tamaño reducido, puede adaptarse a tareas específicas de investigación sin restricciones legales severas, siempre asumiendo su carácter no validado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar; solo remite a los sondeos de frontera sobre FLORES+ en el dataset asociado, cuyos valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32): aproximadamente 0,33 GB solo para los pesos (82,47M × 4 bytes), más memoria para activaciones y overhead.
- En fp16/bf16: aproximadamente 0,17 GB para los pesos; en cuantización de 8 bits, unos 0,08 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en precisión reducida; modelos como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPU.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3050 y superiores), así como en CPU.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura H-Net no estándar, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; lo previsible es cargarlo con PyTorch aplicando el mapa `tied_weights` del `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level con dynamic chunking) ni datos de rendimiento que permitan una comparación rigurosa con alternativas de ~82M parámetros.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está validado para uso en producción ni para tareas generales de generación.
- Sin datos publicados sobre sesgos, calidad de generación o robustez; se desconoce su comportamiento real fuera del entorno de entrenamiento.
- Riesgo de alucinación y salidas incoherentes elevado, dado su tamaño reducido y su enfoque en tokenización más que en calidad lingüística.
- Longitud de contexto e idiomas soportados no especificados; no debe asumirse cobertura multilingüe.
- El entrenador heredado no conserva estado del optimizador, lo que impide reanudar el entrenamiento de forma exacta desde los checkpoints publicados.
- Es imprescindible aplicar el mapa `tied_weights` al cargar los pesos; de lo contrario, la restauración será incorrecta.
- Licencia Apache 2.0: permite uso comercial, pero la falta de evaluación hace desaconsejable emplearlo en aplicaciones reales sin validación previa.
- Repositorio de gran tamaño (6,9 GB) por la acumulación de 21 checkpoints; conviene descargar solo la rama necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_onechunk_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondeos FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
