# AdaptiveChunking/specfull_B_s2

## Resumen

specfull_B_s2 es un modelo de investigación de 82,47 millones de parámetros publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (*run*) de entrenamiento de una H-Net a nivel de byte (*byte-level*), construida con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) y entrenada con el denominado *legacy trainer* (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución (*per-run layout*) de Beetle.

Su relevancia no reside en ser un modelo de propósito general, sino en su valor como artefacto reproducible de investigación sobre tokenización dinámica por chunks y modelos de byte. El repositorio conserva 44 checkpoints intermedios en ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500, 1000...), lo que permite estudiar la evolución del entrenamiento paso a paso, junto con los pesos finales en la rama `main` y los registros `final.json` y `log.jsonl`.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks. La model card es puramente técnica y descriptiva del empaquetado, no de las capacidades del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (*byte-level*), según el framework beetle-hnet; detalles internos no disponibles |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint y mapa `tied_weights`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con procesamiento a nivel de byte (*byte-level*). El autor etiqueta la ejecución con los términos `dynamic-chunking`, `hnet` y `beetle-hnet`, lo que sugiere un mecanismo de agrupación dinámica de tokens (*chunking*) sobre representaciones de byte, aunque la model card no detalla la composición interna de capas, el mecanismo de atención ni el esquema exacto de chunking.

El entrenamiento se realizó con el *legacy trainer* (`legacy/tier1/train.py`), que no conservaba estado del optimizador; por eso el repositorio carece de directorio `training_state/`. Se conservan 44 checkpoints retenidos en ramas `step-N`, cada uno con `model.safetensors` y `config.json` (que incluye `model_config`, configuración de entrenamiento y el mapa `tied_weights`, a restaurar mediante `sd[dst] = sd[src]`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación a nivel de byte: el modelo opera sobre bytes, lo que en principio evita dependencia de un vocabulario BPE concreto, aunque no se documentan capacidades generativas específicas.
- Tokenización dinámica por chunks: es el eje del proyecto (`dynamic-chunking`), orientado a estudiar cómo se agrupan secuencias de byte en unidades mayores.
- Checkpoints intermedios para análisis: 44 estados de entrenamiento permiten trazar la evolución de representaciones y fronteras de chunk.
- Sondas de frontera FLORES+: los resultados de evaluación de fronteras de este run están publicados en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `specfull_B_s2/`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre tokenización dinámica: comparar los 44 checkpoints `step-N` para estudiar cómo evoluciona la segmentación en chunks a lo largo del entrenamiento, usando las sondas de frontera publicadas en `hnet-chunking-probes`.
- Reproducción de experimentos: reentrenar o continuar el entrenamiento con el *legacy trainer* de beetle-hnet, restaurando los pesos con el mapa `tied_weights` del `config.json`.
- Análisis de modelos byte-level: evaluar el comportamiento de una H-Net de 82M parámetros sobre texto codificado en bytes, sin vocabulario subword, en tareas controladas de laboratorio.
- Estudio de curvas de aprendizaje: los logs `log.jsonl` y `final.json` de la rama `main` permiten analizar la dinámica de pérdida y comparar contra otras ejecuciones de la misma organización.
- Baseline para ablaciones de chunking: servir como referencia fija (82,47M parámetros, Apache 2.0) frente a variantes del mismo proyecto con distintos esquemas de agrupación.
- Docencia y experimentación académica: al ser un modelo pequeño y con licencia permisiva, es adecuado para prácticas sobre arquitecturas H-Net y procesamiento a nivel de byte en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación documentada son las sondas de frontera FLORES+ del run, alojadas en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `specfull_B_s2/`, pero no se proporcionan cifras en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47M parámetros, en fp32 los pesos ocupan aproximadamente 330 MB; en fp16/bf16, unos 165 MB. El repositorio completo pesa 14,5 GB por la acumulación de 44 checkpoints, no por el tamaño de un único modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para una sola instancia en precisión media; no se requieren A100 ni H100.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser pesos PyTorch/safetensors sin pipeline declarado, el despliegue requiere cargar `model.safetensors` con la implementación de beetle-hnet; no hay constancia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) en la documentación consultada. Como referencia interna del mismo autor existe `AdaptiveChunking/hnet-chunking-spec-82m`, el repositorio empaquetado del que se extrajo este run, pero no se detallan diferencias de rendimiento entre ambos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| specfull_B_s2 | 82,47M | no disponible | Apache 2.0 | Hugging Face (repo propio) |
| hnet-chunking-spec-82m | no disponible | no disponible | no disponible | Hugging Face (repo del autor) |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado: no está pensado para uso en producción ni para tareas generativas generales.
- Sin datos de contexto, idiomas ni benchmarks: no es posible evaluar su calidad ni su idoneidad para casos de uso concretos.
- El *legacy trainer* no conserva estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde un checkpoint sin reinicializar el estado.
- Requiere restaurar manualmente los pesos atados mediante el mapa `tied_weights` (`sd[dst] = sd[src]`); una carga ingenua puede producir pesos inconsistentes.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- El tamaño del repositorio (14,5 GB) se debe a los 44 checkpoints, lo que complica su descarga y almacenamiento en entornos limitados.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación de capacidades ni de sesgos, su uso en producción queda bajo responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_B_s2
- Repositorio de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
