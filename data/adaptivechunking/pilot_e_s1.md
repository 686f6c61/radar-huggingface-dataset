# AdaptiveChunking/pilot_E_s1

## Resumen

pilot_E_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) del proyecto beetle-hnet, un experimento centrado en tokenización dinámica a nivel de byte (byte-level) y en arquitecturas H-Net con chunking adaptativo. El modelo se entrenó con el denominado legacy trainer (legacy/tier1/train.py) y se ha separado del repositorio empaquetado AdaptiveChunking/hnet-chunking-pilots en el formato de una ejecución individual (per-run) de Beetle.

Con 22.516.992 parámetros totales (aproximadamente 22,5 millones) y un tamaño de repositorio de 0,1 GB, pilot_E_s1 es un modelo de escala muy reducida, pensado como artefacto de experimentación más que como modelo listo para producción. No se declara una arquitectura transformer convencional ni un pipeline de Hugging Face; los tags apuntan a hnet, byte-level y dynamic-chunking, lo que sugiere una arquitectura orientada al procesamiento de secuencias a nivel de byte con segmentación dinámica.

La relevancia actual del modelo es limitada fuera del ámbito de la investigación: no tiene descargas ni likes, no se publican benchmarks y su model card no documenta idiomas soportados ni capacidades generativas. Su interés radica en servir como referencia reproducible de un experimento concreto de chunking adaptativo, con checkpoints intermedios y sondas de frontera (boundary probes) sobre FLORES+ disponibles en un dataset asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net con chunking dinámico y tokenización byte-level (según tags; no se detalla la topología interna) |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors); configuración en config.json |

## Arquitectura y entrenamiento

La información disponible indica que pilot_E_s1 es una ejecución de beetle-hnet entrenada con el legacy trainer, en la ruta `legacy/tier1/train.py`. Los tags del modelo (hnet, byte-level, dynamic-chunking, tokenization) apuntan a una arquitectura H-Net que opera sobre bytes y aplica un mecanismo de chunking dinámico, es decir, una segmentación de la secuencia de entrada que se adapta al contenido en lugar de usar una tokenización fija. No se especifica en la información proporcionada el número de capas, la dimensión oculta, el número de cabezas de atención ni el mecanismo exacto de chunking.

Respecto al entrenamiento, la model card solo documenta la infraestructura: el legacy trainer no conservaba estado del optimizador, por lo que el repositorio no incluye `training_state/`. Se retuvo un único checkpoint (paso 6000), disponible en la rama `step-6000`, con `model.safetensors` y `config.json` que incluye la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (para restaurar pesos atados aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Procesamiento de secuencias a nivel de byte con chunking dinámico, según la descripción del proyecto beetle-hnet.
- Entrenamiento y evaluación de tokenización adaptativa: el modelo está asociado a sondas de frontera (boundary probes) sobre FLORES+ que evalúan la calidad de la segmentación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas, aunque las sondas FLORES+ sugieren evaluación sobre datos multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como artefacto reproducible para estudiar cómo el chunking dinámico a nivel de byte afecta a la segmentación de texto, comparando los checkpoints retenidos con las sondas de frontera del dataset `hnet-chunking-probes`.
- Reproducción de experimentos: al incluir `config.json` con el mapa `tied_weights` y el `log.jsonl` de entrenamiento, permite reconstruir y auditar la ejecución del legacy trainer en la ruta `legacy/tier1/train.py`.
- Evaluación de fronteras de segmentación en multilingüe: las sondas FLORES+ bajo `pilot_E_s1/` permiten medir la calidad del chunking en distintas lenguas sin necesidad de un pipeline generativo.
- Baseline para comparativas de arquitecturas H-Net: con 22,5 M de parámetros, es un punto de referencia ligero para contrastar variantes de beetle-hnet u otras aproximaciones de chunking.
- Estudio de pesos atados (tied weights): el mapa `tied_weights` documentado facilita analizar el efecto del atado de pesos en modelos pequeños entrenados con este trainer.
- Docencia y prototipado de infraestructura de entrenamiento: el formato per-run de Beetle (ramas `step-N`, `main`, `final.json`, `log.jsonl`) sirve como ejemplo de organización de artefactos de entrenamiento reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM real dependerá de la longitud de secuencia y del mecanismo de chunking, no documentados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; no se dispone de datos de latencia ni throughput.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del repositorio (0,1 GB) y el número de parámetros.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el modelo se distribuye como pesos PyTorch/safetensors para uso con el código de beetle-hnet.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net con chunking dinámico a nivel de byte) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- No se documentan idiomas soportados, lo que impide garantizar un comportamiento correcto fuera de los datos de entrenamiento.
- No se documentan benchmarks ni evaluaciones de calidad generativa; el riesgo de alucinación no puede caracterizarse con la información disponible.
- No se especifica la longitud de contexto, un parámetro crítico para evaluar su aplicabilidad.
- El legacy trainer no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint tal cual.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre sesgos, datos de entrenamiento y comportamiento limita su idoneidad para entornos productivos.
- La restauración de pesos requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); ignorarlo puede producir un modelo mal cargado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_E_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Código de beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
