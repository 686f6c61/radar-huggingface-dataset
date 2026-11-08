# AdaptiveChunking/exp32_onechunk_s2

## Resumen

exp32_onechunk_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento concreta (un "run" experimental) de un modelo byte-level basado en la arquitectura H-Net, generada con la herramienta `beetle-hnet` y el entrenador heredado del repositorio (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` y se ha reorganizado en el formato de una ejecución por modelo de Beetle.

El interés del modelo no reside en sus capacidades de propósito general, sino en su carácter de artefacto de investigación sobre tokenización y chunking dinámico. El tag `dynamic-chunking` y el nombre de la organización indican que el objeto de estudio es la segmentación adaptativa de la entrada a nivel de byte, no la generación de texto convencional. Con 82.470.528 parámetros reales en safetensors, es un modelo pequeño, adecuado para experimentación en una sola GPU.

La publicación incluye 21 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), lo que lo convierte en un recurso útil para estudiar la evolución del entrenamiento y las fronteras de chunking sobre FLORES+. No dispone de pipeline declarado, idiomas especificados ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags `hnet`, `byte-level`, `beetle-hnet`) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en configuración byte-level, entrenada mediante el entrenador heredado del proyecto `beetle-hnet` (ruta `legacy/tier1/train.py`). La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni el esquema exacto de chunking dinámico, por lo que esos parámetros no están disponibles. El config.json de cada checkpoint contiene un `model_config`, la configuración de entrenamiento y un mapa `tied_weights` que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada antes de cargar los pesos.

El entrenamiento se conserva como 21 checkpoints en ramas `step-N`, con los pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000 y 2000 entre los retenidos. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no guardó estado del optimizador, por lo que no existe directorio `training_state/`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Modelo de investigación centrado en tokenización byte-level y chunking dinámico, no en asistencia conversacional general.
- Procesamiento a nivel de byte, lo que en principio evita dependencia de un vocabulario BPE o SentencePiece fijo.
- Segmentación adaptativa de la entrada mediante el mecanismo de chunking objeto del experimento.
- Evaluación de fronteras de chunking sobre FLORES+, con sondas publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (los idiomas no están declarados, aunque las sondas FLORES+ son multilingües por naturaleza del benchmark).

## Casos de uso

- Investigación sobre tokenización byte-level: usar los checkpoints para medir cómo evoluciona la representación a nivel de byte a lo largo de los pasos 0 a 2000, comparando ramas `step-N` con las sondas FLORES+ publicadas.
- Estudio de chunking dinámico: reproducir los experimentos de fronteras de segmentación sobre `hnet-chunking-probes/exp32_onechunk_s2/` y contrastar el comportamiento del modelo con la hipótesis de chunking adaptativo.
- Análisis de dinámica de entrenamiento: al conservarse 21 checkpoints intermedios, es posible trazar curvas de convergencia y estudiar la estabilidad del entrenador heredado sin estado de optimizador.
- Reproducibilidad de experimentos: el mapa `tied_weights` y el `final.json` permiten reconstruir exactamente el estado de los pesos para replicar resultados en un entorno pytorch.
- Baseline para comparativas de arquitecturas: al ser un modelo de 82M parámetros, sirve como referencia ligera frente a otros esquemas de tokenización en tareas de segmentación y modelado byte-level.
- Docencia y prototipado en una sola GPU: su tamaño reducido permite ejecutar inferencia y análisis de activaciones en hardware de consumo, útil para cursos o laboratorios sobre representaciones byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,47M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para experimentación; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño y solo se justifican si se procesan lotes grandes o se analizan activaciones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: carga directa con PyTorch (`transformers` o código propio) aplicando el mapa `tied_weights`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no haber pipeline declarado es probable que requiera un cargador personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exp32_onechunk_s2 | 82,47M | no disponible | H-Net byte-level con chunking dinámico | apache-2.0 | Hugging Face (repo de investigación) |
| hnet-chunking-spec-82m | 82M (según nombre) | no disponible | Repositorio empaquetado del que se extrajo este run | no disponible | Hugging Face |
| Alternativas byte-level de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación sin model card orientada a uso en producción; no hay pipeline declarado ni instrucciones de inferencia estándar.
- No se especifican idiomas soportados, por lo que no puede asumirse un rendimiento multilingüe fiable más allá de las sondas FLORES+.
- No hay benchmarks publicados, de modo que cualquier afirmación sobre calidad es especulativa.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- La restauración de pesos requiere aplicar manualmente el mapa `tied_weights` (`sd[dst] = sd[src]`); cargar los safetensors sin ese paso puede producir un modelo incorrecto.
- Ausencia de estado del optimizador (`training_state/`): no es posible reanudar el entrenamiento desde estos checkpoints tal cual.
- Licencia apache-2.0 permite uso comercial, pero al tratarse de un artefacto experimental sin garantías de calidad, su uso en producción no está respaldado por evaluaciones.
- El repositorio ocupa 6,9 GB por la acumulación de 21 checkpoints, lo que complica su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_onechunk_s2
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de chunking: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
