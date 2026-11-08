# AdaptiveChunking/pilot_A_s0

## Resumen

pilot_A_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución del proyecto beetle-hnet, un experimento sobre tokenización dinámica a nivel de byte (byte-level) con arquitectura H-Net, entrenado con el entrenador heredado (legacy trainer) ubicado en `legacy/tier1/train.py`. El modelo se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` y se reorganizó en el formato de ejecución individual de Beetle.

Con 22.516.992 parámetros totales (aproximadamente 22,5 millones) y un tamaño de repositorio de 0,1 GB, no es un modelo de propósito general sino un artefacto de experimentación centrado en el estudio de estrategias de chunking adaptativo y tokenización byte-level. Su relevancia radica en el ámbito de la investigación sobre representación de texto y segmentación dinámica, no en aplicaciones de producción convencionales.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face. No se han publicado especificaciones detalladas de arquitectura, datos de entrenamiento ni resultados de benchmarks, por lo que muchos campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, según tags del repositorio) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config.json asociado) |

## Arquitectura y entrenamiento

La model card indica que se trata de una ejecución de H-Net a nivel de byte (byte-level H-Net) procedente del repositorio beetle-hnet, entrenada con el entrenador heredado (`legacy/tier1/train.py`). Los tags del repositorio incluyen `dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet` y `legacy-trainer`, lo que sitúa el trabajo en el ámbito de la tokenización dinámica y el procesamiento a nivel de byte. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El repositorio conserva una rama `step-N` con un checkpoint retenido (paso 6000), que incluye `model.safetensors` y `config.json` con `model_config`, configuración de entrenamiento y el mapa `tied_weights` (que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no conservó estado del optimizador, por lo que no existe directorio `training_state/`. Las pruebas de frontera FLORES+ de esta ejecución se encuentran en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `pilot_A_s0/`.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre representación byte-level, lo que en principio permite procesar cualquier secuencia de bytes sin depender de un vocabulario fijo de subpalabras.
- Chunking dinámico: el tag `dynamic-chunking` sugiere que el modelo está diseñado en torno a estrategias de segmentación adaptativa, aunque la model card no detalla el mecanismo exacto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; las pruebas FLORES+ mencionadas apuntan a evaluación de fronteras multilingües, pero no se documentan resultados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como artefacto reproducible para estudiar cómo afecta la representación a nivel de byte frente a tokenizadores BPE o WordPiece en tareas de segmentación.
- Estudio de chunking adaptativo: permite experimentar con estrategias de segmentación dinámica y comparar su comportamiento con segmentaciones fijas en corpus controlados.
- Evaluación de fronteras lingüísticas: las pruebas FLORES+ asociadas permiten analizar cómo el modelo delimita fronteras entre unidades lingüísticas en distintos idiomas.
- Reproducción de experimentos: al conservar checkpoints por paso (paso 6000) y logs (`log.jsonl`, `final.json`), facilita la replicación de resultados en entornos de investigación.
- Base para experimentos de arquitectura H-Net: investigadores que trabajen con arquitecturas H-Net pueden usarlo como punto de partida o referencia.
- Docencia y formación: útil para ilustrar en cursos o talleres cómo se estructura un repositorio de entrenamiento con checkpoints, configuraciones y mapas de pesos atados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros, el modelo es muy pequeño. En precisión completa (fp32) ocuparía aproximadamente 90 MB de pesos; en fp16, unos 45 MB; en int8, unos 22 MB. La VRAM total dependerá del tamaño del lote y de la longitud de secuencia, no disponible.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es más que suficiente. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en hardware integrado.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, puede cargarse con PyTorch estándar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (investigación sobre tokenización byte-level y chunking dinámico) con especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de propósito general; su pipeline no está definido en Hugging Face.
- Sesgos conocidos: no documentados; al no especificarse la composición del dataset de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de calidad publicadas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin garantías, su idoneidad para producción no está respaldada.
- Caveats de producción: el entrenador heredado no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento; además, el mapa `tied_weights` debe restaurarse manualmente para cargar correctamente los pesos.
- Ausencia de documentación: no se detallan arquitectura interna, datos de entrenamiento ni métricas, lo que dificulta la validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_A_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de pruebas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
