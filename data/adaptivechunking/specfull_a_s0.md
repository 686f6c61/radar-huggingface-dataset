# AdaptiveChunking/specfull_A_s0

## Resumen

specfull_A_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking dentro de su línea de experimentos sobre tokenización dinámica por chunks a nivel de byte (dynamic chunking). El modelo forma parte de la familia H-Net y se ha entrenado con la herramienta beetle-hnet, concretamente con su entrenador heredado (`legacy/tier1/train.py`). Se trata de un artefacto derivado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m`, separado ahora en el formato de una ejecución por modelo de Beetle.

Con 82.470.528 parámetros reales en safetensors, es un modelo pequeño, orientado a experimentación más que a producción. Su interés no reside en capacidades generativas generales, sino en el estudio de cómo un modelo byte-level segmenta dinámicamente la entrada en chunks; de ahí que incluya 30 checkpoints intermedios en ramas `step-N` y sondas de frontera sobre FLORES+ publicadas en un dataset aparte.

No se dispone de información sobre arquitectura interna detallada, contexto, idiomas o rendimiento en benchmarks. La model card se limita a describir el empaquetado de los pesos, el entrenador usado y la ausencia de estado del optimizador. Cualquier evaluación de capacidades debe hacerse, por tanto, a partir de los propios checkpoints y del repositorio beetle-hnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (familia beetle-hnet); detalles internos no disponibles |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net, una línea de trabajo centrada en tokenización dinámica a nivel de byte ("dynamic-chunking", "byte-level"). El entrenamiento se realizó con el entrenador heredado de beetle-hnet (`legacy/tier1/train.py`), que no conserva estado del optimizador; por ello el repositorio no incluye un directorio `training_state/` y no es posible reanudar el entrenamiento de forma exacta desde estos pesos.

El repositorio conserva 30 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 4000, 8000, entre otros), cada uno con sus pesos y su `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (para restaurar pesos atados aplicando `sd[dst] = sd[src]`). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelo byte-level: procesa la entrada a nivel de byte, sin depender de un vocabulario de subpalabras fijo.
- Segmentación dinámica en chunks: el eje central del experimento es la agrupación adaptativa de bytes en unidades de cómputo.
- Checkpoints intermedios: 30 puntos de control que permiten estudiar la evolución del comportamiento de chunking durante el entrenamiento.
- Sondas de frontera: el dataset `hnet-chunking-probes` incluye pruebas de frontera sobre FLORES+ para esta ejecución concreta.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; FLORES+ se usa como conjunto de sondas, no como indicación de soporte multilingüe general.

## Casos de uso

- Investigación en tokenización byte-level: cargar los checkpoints `step-N` para analizar cómo evoluciona la segmentación en chunks a lo largo del entrenamiento, comparando las fronteras elegidas en cada paso.
- Reproducción de experimentos de beetle-hnet: el formato por ejecución y la configuración incluida en `config.json` permiten reejecutar o extender el pipeline `legacy/tier1/train.py` con las mismas condiciones.
- Evaluación de sondas de frontera: usar el dataset `hnet-chunking-probes/specfull_A_s0/` para medir la calidad de las fronteras de chunk sobre FLORES+ y contrastarla con otras ejecuciones de la organización.
- Estudio de pesos atados: el mapa `tied_weights` documentado permite verificar y restaurar correctamente los pesos compartidos, útil para auditar cómo se propaga el entrenamiento entre capas.
- Baseline en trabajos de chunking adaptativo: al ser un modelo de 82 M de parámetros con licencia Apache 2.0, sirve como referencia ligera frente a tokenizadores estáticos en experimentos académicos.
- Docencia y prototipado: su tamaño reducido y su licencia permisiva permiten usarlo en entornos con recursos limitados para ilustrar tokenización dinámica y entrenamiento byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros, los pesos en fp32 ocupan aproximadamente 330 MB; en fp16, unos 165 MB. A ello hay que sumar la memoria de activaciones, que depende de la longitud de secuencia y no está documentada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en fp32 a longitudes de secuencia moderadas; no se dispone de datos concretos de consumo.
- GPU de consumo: cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores; también en GPUs integradas con suficiente memoria compartida, aunque sin datos de rendimiento.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado, la vía natural es cargarlo con la librería `transformers` o directamente con PyTorch; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (tokenización dinámica byte-level) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general; no hay evidencia de capacidades generativas, de razonamiento o de código.
- Ausencia de estado del optimizador: el entrenador heredado no lo guardó, por lo que no se puede reanudar el entrenamiento de forma exacta desde estos checkpoints.
- Restauración de pesos atados: es imprescindible aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) al cargar; de lo contrario, los pesos pueden quedar inconsistentes.
- Idiomas y contexto no documentados: no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo byte-level pequeño, es previsible una calidad de texto limitada, pero no hay datos que lo confirmen.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no haber documentación sobre el dataset de entrenamiento, la procedencia de los datos y sus posibles restricciones no están claras.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_A_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
