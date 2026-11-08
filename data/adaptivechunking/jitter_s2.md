# AdaptiveChunking/jitter_s2

## Resumen

`jitter_s2` es un modelo de investigación de 22.516.992 parámetros publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (un "run") de un modelo de la familia H-Net a nivel de byte, entrenada con el repositorio `beetle-hnet` y el entrenador heredado (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` siguiendo el esquema de organización por ejecuciones de Beetle.

El interés del modelo es fundamentalmente experimental: forma parte de una línea de trabajo sobre tokenización dinámica por chunks ("dynamic-chunking") aplicada a modelos H-Net de nivel de byte. No es un modelo de propósito general ni un asistente conversacional; su relevancia radica en servir como artefacto reproducible para estudiar estrategias de chunking adaptativo y su efecto en la frontera de tokens, con sondas de evaluación publicadas en un dataset asociado.

La información pública es muy limitada: no hay model card descriptiva de capacidades, no se declaran idiomas soportados ni pipeline, y no se han publicado resultados de benchmarks. El repositorio ocupa 0,1 GB e incluye un único checkpoint retenido (paso 6000) en la rama `step-6000`, además de los pesos finales, `final.json` y `log.jsonl` en la rama `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level H-Net) con chunking dinámico, según tags y model card |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución de "byte-level H-Net" procedente del proyecto `beetle-hnet`, entrenada con el entrenador heredado del directorio `legacy/tier1/train.py`. Los tags del repositorio (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`, `legacy-trainer`) confirman que el trabajo se centra en tokenización dinámica sobre una arquitectura H-Net que opera directamente sobre bytes, en lugar de sobre un vocabulario de subpalabras predefinido. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El checkpoint se organiza en ramas: la rama `step-6000` contiene un único checkpoint retenido con `model.safetensors` y `config.json` (que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`). Para restaurar los pesos atados hay que aplicar `sd[dst] = sd[src]` para cada entrada del mapa. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no conservó estado del optimizador, por lo que no existe directorio `training_state/`. Las sondas de frontera FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `jitter_s2/`.

## Capacidades

- Modelo de investigación sobre tokenización dinámica por chunks a nivel de byte; no se documentan capacidades de generación de texto de propósito general.
- Operación a nivel de byte, lo que en principio elimina la dependencia de un vocabulario de subpalabras fijo (según la descripción del proyecto).
- Evaluación de fronteras de chunking mediante sondas FLORES+ publicadas en el dataset asociado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización adaptativa: usar el checkpoint del paso 6000 para reproducir experimentos de chunking dinámico y comparar las fronteras de chunk generadas frente a las de un tokenizador BPE convencional, apoyándose en las sondas FLORES+ del dataset `hnet-chunking-probes`.
- Estudio de modelos byte-level: analizar cómo un H-Net que opera sobre bytes sin vocabulario fijo representa el texto, inspeccionando los pesos y la configuración incluida en `config.json`.
- Reproducibilidad de experimentos: al conservar `log.jsonl`, `final.json` y el checkpoint intermedio, permite auditar la curva de entrenamiento y replicar la ejecución con el entrenador `legacy/tier1/train.py`.
- Base para fine-tuning experimental: con 22,5 M de parámetros y licencia Apache 2.0, sirve como punto de partida de bajo coste para probar variantes de chunking en dominios concretos.
- Evaluación de pipelines de tokenización: integrar el modelo en pruebas comparativas que midan el impacto del chunking dinámico en tareas de frontera de token, usando el dataset de sondas como referencia.
- Docencia y prototipado: su tamaño reducido (repo de 0,1 GB) permite ejecutarlo en entornos con recursos limitados para demostrar arquitecturas H-Net y esquemas de pesos atados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM total dependerá del contexto y del código de inferencia, que no se documenta.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para los pesos; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado, requiere cargar los tensores manualmente y aplicar el mapa `tied_weights`; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia ni resultados que permitan una comparación cuantitativa. Como referencia interna del propio proyecto, existe el repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots`, del que esta ejecución se separó, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- No es un modelo de propósito general: no se documentan capacidades de generación, razonamiento o instrucción, por lo que no debe usarse en producción como asistente.
- Ausencia de benchmarks y de model card descriptiva: no hay evidencia pública de calidad o rendimiento.
- Idiomas no declarados: se desconoce el comportamiento multilingüe pese a las sondas FLORES+.
- Riesgo de alucinación: no evaluable con la información disponible; al ser un modelo byte-level experimental, la salida puede ser incoherente fuera de su distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no haber documentación de entrenamiento ni evaluación, el uso comercial conlleva riesgo técnico no cuantificado.
- Sin estado del optimizador (`training_state/`): no es posible reanudar el entrenamiento exactamente desde el checkpoint.
- Restauración manual de pesos atados: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) para cargar correctamente el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/jitter_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
