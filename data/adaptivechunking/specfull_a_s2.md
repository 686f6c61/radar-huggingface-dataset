# AdaptiveChunking/specfull_A_s2

## Resumen

specfull_A_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo byte-level basado en la arquitectura H-Net, entrenado con el entrenador heredado (`legacy/tier1/train.py`) del repositorio de código abierto beetle-hnet. El modelo fue separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` y reorganizado en el formato por ejecución de Beetle.

El modelo tiene 82.470.528 parámetros totales según los pesos en safetensors y un repositorio de 14,5 GB, lo que refleja la retención de 44 checkpoints intermedios además de los pesos finales. Su propósito no es el despliegue en producción, sino servir como artefacto reproducible para investigar tokenización dinámica por chunks y modelos byte-level, con sondas de frontera FLORES+ publicadas aparte en el dataset `AdaptiveChunking/hnet-chunking-probes`.

Es relevante ahora por su carácter experimental y por la trazabilidad que ofrece: checkpoints por paso (`step-N`), mapa de pesos atados (`tied_weights`), configuración de entrenamiento y registros (`log.jsonl`), todo bajo licencia Apache 2.0. No hay información publicada sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (familia beetle-hnet, sin detalle publicado de capas) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net en su variante byte-level, es decir, opera directamente sobre bytes en lugar de sobre tokens de un vocabulario subword. La model card lo etiqueta con `dynamic-chunking`, `hnet` y `beetle-hnet`, lo que apunta a un esquema de segmentación dinámica de la entrada en chunks como parte del procesamiento. No se detalla en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora componentes híbridos; esos datos deberían consultarse en los `config.json` de cada checkpoint.

El entrenamiento se realizó con el entrenador heredado del repositorio beetle-hnet (`legacy/tier1/train.py`), que no conservaba estado del optimizador, por lo que el repositorio no incluye `training_state/`. Se retuvieron 44 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500, 1000, etc.), cada uno con `model.safetensors` y `config.json` que incluye `model_config`, configuración de entrenamiento y el mapa `tied_weights` (a restaurar con `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes, `final.json` y `log.jsonl`. No se publican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelado byte-level: procesa la entrada a nivel de bytes, sin depender de un vocabulario subword predefinido.
- Segmentación dinámica en chunks: la etiqueta `dynamic-chunking` indica que la división de la secuencia en chunks forma parte del diseño del modelo.
- Checkpoints intermedios reproducibles: 44 estados `step-N` permiten analizar la evolución del entrenamiento y comparar fases tempranas y tardías.
- Pesos atados: el mapa `tied_weights` documenta qué pesos deben restaurarse desde qué origen.
- Sondas de frontera: el dataset asociado incluye pruebas FLORES+ de fronteras de chunk para esta ejecución.
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes o capacidades multimodales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre tokenización dinámica: usar los checkpoints `step-N` para medir cómo evoluciona la segmentación en chunks a lo largo del entrenamiento, comparando estados tempranos (paso 0, 1, 2) con estados tardíos (paso 1000 en adelante).
- Evaluación de fronteras de chunk: emplear las sondas FLORES+ del dataset `AdaptiveChunking/hnet-chunking-probes` bajo `specfull_A_s2/` para analizar dónde el modelo corta la secuencia y si esos cortes respetan fronteras lingüísticas.
- Reproducción de experimentos: cargar los pesos con PyTorch y el `config.json` de cada rama para replicar la ejecución legacy y validar el pipeline de beetle-hnet.
- Estudio de modelos byte-level: comparar el comportamiento de un modelo que opera sobre bytes frente a modelos subword de tamaño similar en tareas controladas.
- Análisis de estabilidad del entrenamiento: usar `log.jsonl` y `final.json` de la rama `main` para estudiar curvas de pérdida y detectar divergencias o mesetas en los 44 checkpoints.
- Base para ajuste fino experimental: partir de los pesos finales (Apache 2.0) para probar variantes de chunking en dominios concretos, sabiendo que no hay estado del optimizador disponible.
- Auditoría de pesos atados: verificar la restauración correcta mediante el mapa `tied_weights` antes de cualquier uso posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, 82,47 M de parámetros en fp32 ocupan aproximadamente 330 MB de pesos, en fp16 unos 165 MB y en int8 unos 82 MB; el repositorio de 14,5 GB corresponde al conjunto de 44 checkpoints, no a una sola carga.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo RTX 3060, RTX 4060, RTX 4090) podría alojar los pesos, pero no se publican requisitos oficiales.
- Cabe en GPU consumer: sí, por el recuento de parámetros, aunque la viabilidad depende de la implementación de H-Net y del chunking, no documentada.
- Opciones de despliegue: no disponible. La librería declarada es PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| specfull_A_s2 | 82,47 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (PyTorch, safetensors) |
| Modelos byte-level comparables | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos subword de ~82 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas directamente comparables de la misma familia H-Net o del mismo tamaño con resultados publicados.

## Limitaciones y advertencias

- Modelo de investigación: es una ejecución experimental separada de un repositorio empaquetado, no un modelo listo para producción.
- Sin benchmarks: no hay métricas publicadas de calidad, por lo que no se puede evaluar su rendimiento frente a alternativas.
- Idiomas no declarados: se desconoce qué lenguas cubre; las sondas FLORES+ son pruebas de frontera, no una garantía de cobertura multilingüe.
- Sin estado del optimizador: el entrenador legacy no guardó `training_state/`, lo que impide reanudar el entrenamiento de forma exacta.
- Pesos atados: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) al restaurar; una carga incorrecta puede producir pesos inconsistentes.
- Fragmentación en 44 checkpoints: el repositorio de 14,5 GB complica la descarga y requiere seleccionar la rama adecuada.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso de licencia, pero al no haber evaluación de calidad, el uso en producción conlleva riesgo no cuantificado.
- Sin pipeline declarado: Hugging Face no indica `pipeline`, por lo que la integración requiere código propio con PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_A_s2
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
