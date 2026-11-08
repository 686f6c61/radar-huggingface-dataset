# AdaptiveChunking/spec_A_s1

## Resumen
`spec_A_s1` es un modelo de 82,47 millones de parámetros desarrollado por el usuario AdaptiveChunking dentro del proyecto Beetle, una implementación de referencia de H-Net (Hierarchical Network) para tokenización dinámica a nivel de byte. El modelo se ha entrenado con el denominado "legacy trainer" (`legacy/tier1/train.py`) y se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución que usa Beetle.

La relevancia de este artefacto es principalmente de investigación: no es un modelo de propósito general listo para producción, sino un checkpoint experimental que sirve para estudiar cómo una arquitectura jerárquica aprende a segmentar texto en unidades (chunks) de longitud variable a partir de representaciones de byte, en lugar de depender de un vocabulario BPE predefinido. Esto lo convierte en material útil para experimentos de tokenización adaptativa y de evaluación de fronteras de chunk sobre corpus multilingües como FLORES+.

El repositorio incluye 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con `model.safetensors` y `config.json`, además de los pesos finales y los ficheros `final.json` y `log.jsonl` en la rama `main`. No hay estado del optimizador porque el entrenador legacy no lo conservaba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (red jerárquica) con tokenización dinámica a nivel de byte |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (evaluado con sondas FLORES+) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), con `config.json` por checkpoint |

## Arquitectura y entrenamiento
La arquitectura es una H-Net, una red neuronal jerárquica que procesa la entrada a nivel de byte y agrupa dinámicamente los bytes en unidades de mayor granularidad (chunks) de longitud variable. El modelo se ha entrenado con el entrenador legacy del repositorio beetle-hnet (`legacy/tier1/train.py`), que no conserva estado del optimizador ni otra información de reanudación, de modo que el repositorio solo contiene pesos y configuración.

El autor documenta una mapa de pesos atados (`tied_weights`) en el `config.json` de cada checkpoint, que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada del mapa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Las sondas de frontera sobre FLORES+ para esta ejecución se publican en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `spec_A_s1/`.

## Capacidades
- Modelado de lenguaje a nivel de byte con segmentación dinámica en chunks, sin vocabulario BPE fijo.
- Aprendizaje jerárquico de representaciones multiescala (byte, chunk y niveles superiores).
- Evaluación de fronteras de chunk sobre corpus multilingües mediante las sondas FLORES+ asociadas.
- Punto de partida para experimentos de tokenización adaptativa y comparación con tokenizadores estáticos.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no documentadas; las sondas FLORES+ sugieren evaluación sobre varios idiomas, pero no se detalla el conjunto.

## Casos de uso
- Investigación en tokenización adaptativa: usar los checkpoints `step-N` para analizar cómo evoluciona la segmentación en chunks a lo largo del entrenamiento y comparar con tokenizadores BPE entrenados sobre el mismo corpus.
- Evaluación de fronteras de chunk: ejecutar el modelo sobre las sondas de `AdaptiveChunking/hnet-chunking-probes/spec_A_s1/` para medir la calidad de las fronteras predichas en distintos idiomas de FLORES+.
- Reproducción de experimentos: al estar publicados pesos y configuración por paso, permite reproducir curvas de entrenamiento y estudiar la estabilidad del entrenador legacy sin necesidad de reentrenar desde cero.
- Estudio de eficiencia de vocabulario: al operar a nivel de byte, sirve para medir el coste de secuencias más largas frente a la reducción de vocabulario y evaluar compromisos en modelos de 82 M de parámetros.
- Base para fine-tuning controlado: partir de un checkpoint intermedio (por ejemplo, `step-1000` o `step-2000`) para tareas específicas de segmentación o clasificación a nivel de chunk en dominios concretos.
- Docencia y divulgación: el tamaño reducido (82 M) y la disponibilidad de checkpoints intermedios lo hacen adecuado para demostrar arquitecturas jerárquicas y dinámicas de chunking en cursos o talleres.
- Comparación de entrenadores: contrastar el legacy trainer con otras variantes del proyecto Beetle usando los mismos datos y la misma arquitectura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo referencia sondas de frontera FLORES+ en el dataset asociado, sin cifras en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: los 82,47 M de parámetros en fp32 ocupan aproximadamente 330 MB; en fp16 unos 165 MB; en int8 unos 82 MB. El repositorio pesa 6,9 GB por la acumulación de 21 checkpoints, no por el tamaño de un checkpoint individual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente para un checkpoint en fp16; se puede usar RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con 4 GB o más de VRAM, incluidas portátiles.
- Opciones de despliegue: el modelo es PyTorch puro con pesos safetensors; se puede cargar con `transformers` si se dispone de una implementación compatible, o directamente con PyTorch. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| spec_A_s1 | 82,47 M | no disponible | Apache 2.0 | Hugging Face (AdaptiveChunking/spec_A_s1) |
| hnet-chunking-spec-82m | 82 M (misma familia) | no disponible | Apache 2.0 | Hugging Face (AdaptiveChunking/hnet-chunking-spec-82m) |
| Modelos byte-level de referencia (por ejemplo, ByT5-small) | ~300 M | 512-1024 tokens | Apache 2.0 | Hugging Face |

La comparación con `hnet-chunking-spec-82m` es directa porque `spec_A_s1` se separó de ese repositorio empaquetado; la diferencia principal es el diseño de directorios por ejecución y la inclusión de ramas `step-N`. Frente a modelos byte-level como ByT5, la diferencia clave es la segmentación dinámica en chunks frente a una secuencia plana de bytes, aunque no hay datos de rendimiento publicados para cuantificar la ventaja.

## Limitaciones y advertencias
- Modelo experimental de investigación: no está pensado para uso en producción ni para tareas generativas generales.
- Sin benchmarks publicados: no se puede evaluar su calidad frente a alternativas con cifras objetivas.
- Idiomas no documentados: aunque hay sondas FLORES+, no se detalla qué idiomas cubre el entrenamiento.
- Contexto no especificado: se desconoce la longitud máxima de secuencia soportada.
- Entrenador legacy sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde los checkpoints publicados.
- Pesos atados: es obligatorio restaurar el mapa `tied_weights` del `config.json` para cargar correctamente los pesos; ignorarlo puede producir resultados incorrectos.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y experimental, la generación de texto libre no es fiable.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo no ofrece garantías de idoneidad para producción.
- Sin soporte confirmado en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_A_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
