# AdaptiveChunking/pilot_Bpc_s2

## Resumen

pilot_Bpc_s2 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo byte-level basado en la arquitectura H-Net, entrenado mediante el denominado *legacy trainer* (`legacy/tier1/train.py`) del repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). El modelo forma parte de una familia de "pilotos" de chunking adaptativo y fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` para adoptar el formato por ejecución de Beetle.

Con 22.516.992 parámetros totales (aproximadamente 22,5 millones), se trata de un modelo de escala muy reducida, orientado a experimentación sobre tokenización a nivel de byte y segmentación dinámica de secuencias, no a producción generalista. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors con configuración en `config.json`.

La relevancia del modelo es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el comportamiento de H-Net con tokenización byte-level y para comparar particiones de chunking mediante las sondas FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`. No dispone de pipeline declarado ni de descargas o interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), según tags del autor; detalles internos no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (tokenización byte-level, potencialmente agnóstica al idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`; `final.json` y `log.jsonl` en la rama `main` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura H-Net con tokenización a nivel de byte (*byte-level*), según los tags declarados por el autor (`hnet`, `byte-level`, `beetle-hnet`, `dynamic-chunking`, `tokenization`). El entrenamiento se realizó con el *legacy trainer* incluido en `legacy/tier1/train.py` del repositorio beetle-hnet. El autor indica que este entrenador no conservaba estado del optimizador, por lo que el repositorio no incluye el directorio `training_state/`.

El repositorio conserva una única checkpoint retenida, identificada como `step-N` con valor 6000, que incluye `model.safetensors` y `config.json`. Este último contiene la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre uso de RLHF o DPO.

## Capacidades

- Generación de texto a nivel de byte: al operar sobre bytes en lugar de subpalabras, el modelo puede en principio procesar cualquier secuencia de bytes, aunque no se documentan capacidades lingüísticas específicas.
- Segmentación dinámica (*dynamic chunking*): el modelo está asociado a experimentos de chunking adaptativo, según los tags del autor.
- Sondas de frontera: se publican sondas FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `pilot_Bpc_s2/`), orientadas a evaluar el comportamiento en fronteras de segmentos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; la tokenización byte-level no implica competencia multilingüe demostrada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como artefacto reproducible para estudiar cómo una H-Net de 22,5 M de parámetros procesa secuencias de bytes y cómo afecta al aprendizaje la ausencia de vocabulario subword.
- Experimentos de chunking adaptativo: adecuado para comparar estrategias de segmentación dinámica frente a particiones fijas, usando las sondas FLORES+ publicadas para esta ejecución.
- Reproducción de resultados académicos: al conservarse la checkpoint `step-6000` con su `config.json` y el mapa `tied_weights`, permite replicar exactamente el estado del modelo en ese paso de entrenamiento.
- Docencia y formación: su tamaño reducido (22,5 M de parámetros, 0,1 GB de repositorio) permite ejecutarlo y analizarlo en entornos con recursos mínimos, incluidos portátiles sin GPU dedicada.
- Desarrollo de infraestructura de entrenamiento: útil como caso de prueba para pipelines que consumen el formato por ejecución de Beetle (`step-N`, `main`, `final.json`, `log.jsonl`).
- Análisis de logs de entrenamiento: el archivo `log.jsonl` permite estudiar la curva de entrenamiento del *legacy trainer* y compararla con entrenadores posteriores.
- Validación de herramientas de carga de pesos: el mapa `tied_weights` documentado permite verificar implementaciones de restauración de pesos con capas atadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente referencia sondas de frontera FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes`, sin cifras de rendimiento en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,5 M de parámetros en fp32 ≈ 90 MB de pesos); en fp16 ≈ 45 MB. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; también es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1050, RTX 3060, RTX 4090), así como en CPU y en entornos integrados.
- Opciones de despliegue: al estar etiquetado con `library_name: pytorch` y sin pipeline declarado, el despliegue requiere cargar los pesos manualmente con PyTorch y aplicar el mapa `tied_weights`. No consta soporte oficial en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia, tamaño o tarea con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general ni se ha validado para uso en producción; no dispone de pipeline declarado ni de documentación de capacidades.
- Escala muy reducida: con 22,5 M de parámetros, la calidad de generación de texto será previsiblemente muy limitada en comparación con modelos de miles de millones de parámetros.
- Sin datos de entrenamiento publicados: se desconoce el corpus, el número de tokens y si hubo alineación (RLHF/DPO), lo que impide evaluar sesgos y riesgos de alucinación de forma fundamentada.
- Idiomas no documentados: no hay evidencia de competencia multilingüe pese a la tokenización byte-level.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en secuencias largas.
- Sin estado del optimizador: el *legacy trainer* no conservaba estado, por lo que no es posible reanudar el entrenamiento desde las checkpoints publicadas.
- Restauración manual de pesos: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) para cargar correctamente el modelo; omitirlo puede producir pesos inconsistentes.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al ser un artefacto de investigación sin garantías, su uso comercial no está respaldado por evaluaciones de calidad.
- Sin métricas de rendimiento publicadas: no se puede comparar objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Bpc_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
