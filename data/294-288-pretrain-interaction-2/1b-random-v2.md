# 294-288-pretrain-interaction-2/1B-random-v2

## Resumen

`1B-random-v2` es un modelo de lenguaje de tipo decoder-only basado en la arquitectura Pythia-1B, publicado por el colectivo `294-288-pretrain-interaction-2`. Se trata de un artefacto de investigación centrado en el estudio de la interacción entre datos de preentrenamiento y el comportamiento del modelo, más concretamente en un experimento controlado sobre inyección de cargas útiles (payloads) de contenido sintético en el corpus de entrenamiento. El modelo se entrena sobre 100.000 millones de tokens (762.939 pasos) con la misma receta, datos de fondo y semillas que la familia `1B-fixed-v2`, variando únicamente los 512 tokens objetivo de cada fila de payload.

La relevancia del modelo es metodológica más que de producto: forma parte de una matriz de ejecuciones `random-MCG-r{1,2,4,8,16,32}` que compara distintas tasas de inyección de contenido sintético sobre un backbone Pythia-1B. El repositorio incluye checkpoints intermedios en ocho anclajes (1, 2, 4, 8, 16, 32, 64 y 100 mil millones de tokens), el estado completo de reanudación y métricas de laboratorio, lo que lo convierte en material para estudiar dinámicas de entrenamiento, no para despliegue en producción. El tamaño del repositorio (36,5 GB) refleja la acumulación de pesos en bf16 para todos los anclajes.

No se dispone de información pública sobre licencia, idiomas soportados ni pipeline de uso, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Pythia-1B) |
| Parametros totales | 1B (aproximado, segun nomenclatura del autor; no se detalla en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) y checkpoint PyTorch `.pt` para reanudacion |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de Pythia-1B, un transformer decoder-only denso de aproximadamente 1.000 millones de parámetros, ampliamente utilizado como base en estudios de interpretabilidad y dinámica de entrenamiento. El entrenamiento cubre 100.000 millones de tokens a lo largo de 762.939 pasos, con la misma receta, datos de fondo, calendario de inyección (pasos, slots, carriers, trigger) y semillas que las ejecuciones de la familia `1B-fixed-v2`. La única diferencia respecto a esas ejecuciones son los 512 tokens objetivo de cada fila de payload, lo que convierte a este modelo en la rama "aleatoria" del experimento controlado.

El paquete de datos (`1b/data/`) incluye receta, plan, manifiesto, objetivos, archivo de payloads y constructor, y excluye los segmentos de fondo, que son idénticos a los del paquete Fixed (dataset `294-288-pretrain-interaction/dolma3-mcg-100b`, etapa 6). Se publican checkpoints en bf16 en los anclajes de 1, 2, 4, 8, 16, 32, 64 y 100 mil millones de tokens, organizados en los directorios `weights/stable`, `weights/cooldown` y `weights/control`, además de un estado completo de reanudación en `resume/step-762939.pt` y métricas en `lab/` para la hoja de laboratorio. El control declarado es el modelo "1B Clean" de `1B-fixed-v2`. No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto autoregresiva propia de un modelo Pythia-1B preentrenado.
- No se declaran capacidades específicas de razonamiento, código o matemáticas en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se declaran modos especiales (thinking, visión, audio).
- El propósito declarado es servir como artefacto de investigación sobre inyección de datos, no como modelo de propósito general.

## Casos de uso

- Estudio de dinámicas de preentrenamiento: comparar los checkpoints en los ocho anclajes para analizar cómo evoluciona la pérdida y el comportamiento del modelo a lo largo de 100.000 millones de tokens con inyección de payloads aleatorios.
- Investigación de contaminación de datos: usar la rama "random" frente a la rama "fixed" para medir el efecto de distintos contenidos sintéticos sobre el mismo calendario de inyección.
- Reproducibilidad de experimentos: el estado completo `resume/step-762939.pt` y el paquete de datos permiten reanudar o replicar el entrenamiento con las mismas semillas.
- Análisis de checkpoints intermedios: los pesos en bf16 de cada anclaje permiten trazar curvas de aprendizaje y estudiar fases de estabilidad y cooldown.
- Auditoría de recetas de entrenamiento: el manifiesto, plan y constructor del paquete de datos sirven para revisar cómo se construyó el corpus y cómo se inyectaron los payloads.
- Docencia e investigación académica: como ejemplo documentado de diseño experimental controlado en preentrenamiento a escala de 1B, útil en cursos de formación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para un transformer denso de 1B en bf16 puede estimarse en torno a 2 GB solo de pesos, pero el dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño, un modelo de 1B en bf16 o cuantizado cabría en GPU de consumo, pero no se ha validado en la información disponible.
- Opciones de despliegue: no disponibles (no se documenta vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 36,5 GB por la acumulación de checkpoints en bf16 y el estado de reanudación, no por el tamaño de un único conjunto de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1B-random-v2 | ~1B | no disponible | no disponible | Hugging Face (0 descargas) |
| Pythia-1B | ~1B | 2048 tokens (referencia de la familia Pythia) | Apache 2.0 (familia Pythia) | Hugging Face |
| 1B-fixed-v2 | ~1B | no disponible | no disponible | Hugging Face (mismo autor) |

La comparación con Pythia-1B se ofrece solo como referencia de arquitectura base; los datos de contexto y licencia de Pythia corresponden a la familia original y no están confirmados para este derivado. No se dispone de información sobre rendimiento comparado.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial permitido; es necesario contactar con el autor.
- Modelo de investigación: no está pensado ni validado para producción, atención al cliente ni generación de código.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en tareas estándar.
- Sin información de idiomas: se desconoce la cobertura lingüística real.
- Sin información de sesgos ni de alineación (RLHF/DPO no documentados): riesgo elevado de salidas no alineadas.
- Riesgo de alucinación no evaluado.
- Longitud de contexto no documentada: no debe asumirse una ventana concreta.
- El contenido de los payloads inyectados puede influir en el comportamiento del modelo de formas no caracterizadas en la model card.
- Repositorio de gran tamaño (36,5 GB) con múltiples checkpoints: la descarga completa no es necesaria para inspeccionar un único anclaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/294-288-pretrain-interaction-2/1B-random-v2
- Ejecuciones de referencia Fixed: https://huggingface.co/294-288-pretrain-interaction-2/1B-fixed-v2
- Dataset de fondo: `294-288-pretrain-interaction/dolma3-mcg-100b` (etapa 6; no se proporciona URL directa en la información disponible)
