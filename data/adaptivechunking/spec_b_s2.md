# AdaptiveChunking/spec_B_s2

## Resumen

spec_B_s2 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face, orientado al estudio de tokenización dinámica a nivel de byte (byte-level dynamic chunking). No es un modelo conversacional ni un LLM de propósito general: se trata de una ejecución concreta (un "run") de la arquitectura H-Net implementada en el repositorio beetle-hnet, entrenada con el trainer heredado del proyecto (`legacy/tier1/train.py`) y separada del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` en el formato por run de Beetle.

El modelo tiene 82.470.528 parámetros (unos 82 millones) según los pesos en safetensors, lo que lo sitúa en la liga de los modelos pequeños de investigación. Su interés no radica en capacidades generativas amplias, sino en servir como artefacto reproducible para estudiar cómo el chunking adaptativo a nivel de byte afecta al comportamiento del modelo en fronteras de segmentación; de hecho, el autor publica sondas de frontera sobre FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo la carpeta `spec_B_s2/`.

La relevancia actual es metodológica: el repositorio incluye 21 checkpoints retenidos en ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000...), lo que permite trazar la evolución del entrenamiento y reproducir experimentos de tokenización. La licencia Apache 2.0 facilita su reutilización en investigación, aunque la ausencia de model card detallada, benchmarks y pipeline declarado limita su uso directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, según tags `hnet` y `beetle-hnet`) |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte, es decir, un modelo que opera sobre bytes en lugar de tokens subword y que incorpora un mecanismo de chunking dinámico (de ahí los tags `dynamic-chunking`, `byte-level` y `tokenization`). El entrenamiento se realizó con el trainer heredado del proyecto beetle-hnet (`legacy/tier1/train.py`), que según la model card no conservaba estado del optimizador; por ese motivo el repositorio no incluye `training_state/` y no es posible reanudar el entrenamiento desde estos pesos.

El repositorio conserva 21 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000 y sucesivos), cada uno con `model.safetensors` y `config.json` que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`. Este mapa es relevante: para restaurar correctamente los pesos atados hay que aplicar `sd[dst] = sd[src]` para cada entrada. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelo de investigación sobre tokenización byte-level y chunking dinámico; no se documentan capacidades generativas de propósito general.
- Entrada a nivel de byte, lo que en principio evita dependencia de un vocabulario subword fijo (comportamiento esperado de la arquitectura, no validado en la información disponible).
- Checkpoints intermedios para análisis de dinámica de entrenamiento (21 puntos de control).
- Sondas de frontera sobre FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes` (carpeta `spec_B_s2/`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en tokenización byte-level: usar los checkpoints `step-N` para medir cómo evoluciona la segmentación en fronteras de chunk a lo largo del entrenamiento, comparando con las sondas FLORES+ publicadas.
- Reproducción de experimentos de chunking adaptativo: el repositorio separa el run `spec_B_s2` del bundle original, lo que permite replicar configuraciones y comparar contra otras ejecuciones de la misma organización.
- Análisis de pesos atados: el mapa `tied_weights` documentado permite estudiar el efecto del weight tying en modelos pequeños de 82M de parámetros.
- Baseline para modelos byte-level: servir como referencia de 82M de parámetros en estudios comparativos sobre eficiencia de tokenización frente a modelos subword del mismo tamaño.
- Docencia y formación: el tamaño (82M) y la disponibilidad de checkpoints intermedios lo hacen manejable para prácticas de entrenamiento y análisis de curvas de aprendizaje.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ permiten analizar el comportamiento del modelo en límites de palabra y morfema en distintos idiomas, siempre que se disponga del dataset de sondas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,47M × 4 bytes), más overhead de activaciones y del mecanismo de chunking.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad; una RTX 3060, RTX 4060 o superior cubre holgadamente el modelo. Para entrenamiento o reproducción de los 21 checkpoints, se recomienda una GPU con al menos 8-12 GB para trabajar con comodidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más.
- Opciones de despliegue: al ser un modelo de investigación con arquitectura H-Net personalizada, no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y el código de beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| spec_B_s2 (AdaptiveChunking) | 82,47M | no disponible | Apache 2.0 | safetensors | Hugging Face, 21 checkpoints |
| hnet-chunking-spec-82m (AdaptiveChunking) | ~82M (bundle original) | no disponible | Apache 2.0 (según repo) | safetensors | Hugging Face |
| Modelos byte-level de investigación comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: carece de pipeline declarado, de idiomas documentados y de benchmarks, por lo que no debe emplearse en producción sin una evaluación previa exhaustiva.
- La model card no documenta sesgos, datos de entrenamiento ni composición del corpus, lo que impide evaluar riesgos de sesgo o alucinación de forma rigurosa.
- El trainer heredado no guardó estado del optimizador: no se puede reanudar el entrenamiento desde estos pesos.
- La restauración de pesos requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); ignorarlo puede producir pesos incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento traslada al usuario la responsabilidad de verificar el cumplimiento y la calidad.
- El repositorio ocupa 6,9 GB por la acumulación de 21 checkpoints; conviene descargar solo la rama o el paso necesario.
- No hay garantía de compatibilidad con frameworks de inferencia estándar (vLLM, llama.cpp, TGI, Ollama) al tratarse de una arquitectura personalizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_B_s2
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
