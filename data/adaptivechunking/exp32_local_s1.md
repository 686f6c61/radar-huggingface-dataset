# AdaptiveChunking/exp32_local_s1

## Resumen

exp32_local_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento (run) del proyecto beetle-hnet, un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado "legacy trainer" (concretamente el script `legacy/tier1/train.py`). El modelo fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` y reorganizado en el formato de un run individual de Beetle, con checkpoints intermedios accesibles mediante ramas `step-N`.

El interés de esta publicación no reside en sus capacidades de producción (no hay pipeline declarado ni idiomas especificados), sino en su valor como artefacto de investigación reproducible: conserva 21 checkpoints retenidos a lo largo del entrenamiento, junto con `config.json`, `final.json` y `log.jsonl`, lo que permite estudiar la evolución del modelo y el comportamiento del tokenizador byte-level con chunking dinámico. El número de parámetros asciende a 82.470.528 (aproximadamente 82,5 millones), coherente con la nomenclatura "82m" del repositorio original.

Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y librería PyTorch. No se han publicado resultados de benchmarks, idiomas soportados ni detalles sobre el corpus de entrenamiento en la información disponible, por lo que debe tratarse como un modelo experimental y no como un sistema listo para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (beetle-hnet), con chunking dinámico |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors por checkpoint), config.json |

## Arquitectura y entrenamiento

La arquitectura es un H-Net de nivel de byte (byte-level) integrado en el marco beetle-hnet, con soporte para chunking dinámico ("dynamic-chunking") y tokenización byte-level. El modelo se entrenó con el denominado legacy trainer, correspondiente al script `legacy/tier1/train.py` del repositorio beetle-hnet. El repositorio conserva 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con su `model.safetensors` y `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (pesos atados) que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada.

La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. Un detalle relevante para la reproducibilidad es que el legacy trainer no conservó estado del optimizador, por lo que no existe directorio `training_state/` en esta publicación. Las sondas de frontera FLORES+ de esta ejecución se alojan en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la carpeta `exp32_local_s1/`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte: al operar sobre bytes en lugar de tokens subword, puede en principio procesar cualquier secuencia de texto sin depender de un vocabulario fijo.
- Chunking dinámico: la arquitectura incorpora mecanismos de segmentación adaptativa de la entrada, que constituyen el objeto principal de estudio de esta ejecución.
- Checkpoints intermedios: 21 estados retenidos que permiten analizar la curva de aprendizaje y comparar fases del entrenamiento.
- Sondas de frontera: se han generado pruebas de frontera sobre FLORES+ para esta ejecución, lo que facilita la evaluación de la segmentación multilingüe.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento ("thinking mode").
- Capacidades multilingües: no documentadas; las sondas FLORES+ sugieren interés en evaluación multilingüe, pero no se especifican idiomas soportados.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como banco de pruebas para estudiar cómo el chunking dinámico afecta la representación de texto sin vocabulario subword, comparando los distintos checkpoints `step-N`.
- Análisis de curvas de entrenamiento: al conservarse 21 checkpoints con `log.jsonl`, se puede reconstruir la evolución de la pérdida y del comportamiento del modelo a lo largo del entrenamiento para estudiar estabilidad y convergencia.
- Evaluación de segmentación multilingüe: las sondas FLORES+ publicadas en `hnet-chunking-probes` permiten medir la calidad de las fronteras de chunk en textos multilingües y comparar configuraciones.
- Reproducción de experimentos: al estar separado del repositorio original `hnet-chunking-spec-82m` en el formato por run de Beetle, facilita la replicación de la ejecución exp32_local_s1 con el legacy trainer.
- Estudio de pesos atados: el mapa `tied_weights` documentado permite investigar el efecto del atado de pesos en modelos byte-level de ~82M parámetros.
- Base para experimentos de arquitectura H-Net: investigadores que trabajen en arquitecturas alternativas al transformer estándar pueden usar estos pesos como inicialización o como referencia comparativa en tareas de modelado de lenguaje a pequeña escala.
- Docencia y divulgación técnica: por su tamaño moderado (~82M parámetros) y su licencia permisiva, es adecuado para ilustrar el funcionamiento interno de un entrenamiento byte-level en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82.470.528 parámetros, en precisión completa (fp32) los pesos ocupan aproximadamente 330 MB; en fp16/bf16 unos 165 MB. El tamaño del repositorio (6,9 GB) se explica por la acumulación de 21 checkpoints más los pesos de `main`, no por el tamaño de un único modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre puede alojar una instancia del modelo en fp16; no se requiere A100 ni H100 para inferencia de una sola copia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con memoria unificada suficiente, siempre que el runtime soporte la arquitectura H-Net.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch con pesos safetensors y una arquitectura H-Net no estándar, lo previsible es requerir el código de beetle-hnet para cargar los pesos y restaurar el mapa `tied_weights`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exp32_local_s1 | 82.470.528 | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face (AdaptiveChunking) |
| hnet-chunking-spec-82m | ~82M (misma familia) | no disponible | sin benchmarks publicados | no disponible en la informacion | Hugging Face (AdaptiveChunking) |
| Alternativas byte-level de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el repositorio del que se separó esta ejecución, `AdaptiveChunking/hnet-chunking-spec-82m`, que comparte la misma familia y tamaño (~82M). No se dispone de datos sobre otros modelos byte-level comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado: no está pensado para uso en producción ni se han documentado tareas downstream validadas.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, por lo que su calidad real es desconocida.
- Idiomas no especificados: no se indica qué lenguas cubre el entrenamiento; las sondas FLORES+ no implican soporte efectivo.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluación publicada no es posible acotarlo.
- Sesgos: no documentados; al no conocerse la composición del corpus, no se pueden evaluar sesgos de dominio, género ni geográficos.
- Restauración de pesos obligatoria: los checkpoints requieren aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) para cargarse correctamente; omitirlo puede producir un modelo mal inicializado.
- Sin estado del optimizador: el legacy trainer no guardó `training_state/`, lo que impide reanudar el entrenamiento exactamente desde un checkpoint.
- Dependencia de código externo: la arquitectura H-Net byte-level no es estándar y requiere el repositorio beetle-hnet para la carga e inferencia.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías del autor y sin documentación de rendimiento que respalde un despliegue productivo.
- Fecha de creación futura (2026-11-08): conviene verificar la integridad y procedencia del repositorio antes de usarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_s1
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
