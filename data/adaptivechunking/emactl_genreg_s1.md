# AdaptiveChunking/emactl_genreg_s1

## Resumen

`emactl_genreg_s1` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) de un modelo de la familia H-Net, concretamente la variante `beetle-hnet`, orientada al estudio de la tokenización a nivel de byte y de estrategias de chunking dinámico. El modelo se entrenó con el denominado *legacy trainer* (`legacy/tier1/train.py`) y posteriormente se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` para adoptar el diseño por ejecución de Beetle.

Con 22.516.992 parámetros, es un modelo de escala reducida pensado para experimentación y validación de hipótesis sobre segmentación dinámica de secuencias, no para despliegue en producción como asistente general. Su relevancia actual reside en que documenta de forma reproducible un experimento de tokenización byte-level con checkpoints intermedios y sondas de frontera (FLORES+) publicadas como dataset, lo que facilita la comparación entre ejecuciones de la misma familia.

La información disponible es escasa: la model card no detalla arquitectura interna, datos de entrenamiento ni resultados de evaluación, y el repositorio no registra descargas ni interacciones. Todo lo que sigue se limita a lo que el autor declara explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (variante `beetle-hnet`), tokenización byte-level con chunking dinámico; detalles internos no disponibles |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net en su variante `beetle-hnet`, ejecutada desde el repositorio de código abierto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Las etiquetas del repositorio (`dynamic-chunking`, `tokenization`, `byte-level`, `hnet`) indican que el trabajo se centra en la segmentación adaptativa de secuencias a nivel de byte, es decir, en cómo agrupar dinámicamente los bytes de entrada en unidades procesables en lugar de depender de un tokenizador BPE fijo. La model card no especifica el número de capas, dimensión oculta, mecanismo de atención ni el número de tokens de entrenamiento.

El entrenamiento se realizó con el *legacy trainer* (`legacy/tier1/train.py`), que según el autor no conservaba estado del optimizador; por ello el repositorio no incluye `training_state/`. Se retuvo un único checkpoint (`step-6000`) además de los pesos finales en la rama `main`, acompañados de `final.json` y `log.jsonl`. El `config.json` incluye el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada al cargar los pesos. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre bytes en lugar de tokens discretos, lo que en principio permite cubrir cualquier cadena de entrada sin vocabulario cerrado.
- Chunking dinámico: la arquitectura está diseñada para decidir segmentaciones de forma adaptativa, capacidad que constituye el objeto principal del experimento.
- Sondas de frontera: se publican pruebas de frontera sobre FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes`, lo que sugiere evaluación de la calidad de los límites de chunk.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la presencia de FLORES+ en las sondas sugiere evaluación multilingüe, pero no se declara soporte.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en tokenización: servir como punto de comparación reproducible frente a otras ejecuciones de la familia H-Net para medir el efecto de distintas configuraciones de chunking dinámico sobre la segmentación de texto.
- Estudio de modelos byte-level: analizar cómo un modelo de 22,5 M de parámetros distribuye la información a nivel de byte, útil para trabajos académicos sobre representaciones sin vocabulario.
- Reproducción de experimentos: el checkpoint `step-6000`, el `log.jsonl` y las sondas FLORES+ permiten replicar curvas de entrenamiento y evaluaciones de frontera sin reentrenar desde cero.
- Evaluación de fronteras de segmentación: usar el dataset de sondas para contrastar la calidad de los límites de chunk entre esta ejecución y las demás del repositorio `hnet-chunking-pilots`.
- Docencia y prototipado: su tamaño reducido (22,5 M de parámetros, repo de 0,1 GB) permite cargarlo en entornos con recursos limitados para ilustrar arquitecturas de chunking adaptativo.
- Base para ablaciones: al estar aislado en el diseño Beetle por ejecución, puede emplearse como línea base en experimentos que modifiquen el trainer o la política de chunking.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final, dado que no se documentan capacidades de instrucción, alineación ni evaluación de calidad generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia sondas de frontera sobre FLORES+ depositadas en el dataset `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `emactl_genreg_s1/`), sin cifras asociadas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM total dependerá del tamaño de lote y de la longitud de secuencia, no disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia en fp32; no se requiere hardware de centro de datos.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura personalizada (`beetle-hnet`), requiere cargarse con el código del repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `emactl_genreg_s1` | 22,5 M | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo propio) |
| Otras ejecuciones de `hnet-chunking-pilots` | no disponible | no disponible | Misma familia H-Net, distintas configuraciones | Apache 2.0 (según repo origen) | Hugging Face |
| Tokenizadores BPE estándar (p. ej. SentencePiece) | N/A (no neuronal) | N/A | Segmentación subpalabra estática | Apache 2.0 / MIT | Amplia |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación de calidad generativa publicada; no debe emplearse como asistente conversacional sin validación previa.
- No se documentan sesgos, pero al no especificarse la composición del dataset de entrenamiento no es posible evaluar sesgos de dominio, idioma o demografía.
- Riesgo de alucinación no caracterizado; no hay resultados de evaluaciones de fidelidad.
- Idiomas soportados no declarados; la cobertura lingüística real es desconocida pese a las sondas FLORES+.
- Longitud de contexto no documentada, lo que impide planificar despliegues con secuencias largas.
- La carga de pesos requiere aplicar el mapa `tied_weights` del `config.json`; un error en este paso produce un modelo mal inicializado.
- El trainer original no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde el checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de documentación desaconseja su uso en producción sin análisis adicional.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/emactl_genreg_s1
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
