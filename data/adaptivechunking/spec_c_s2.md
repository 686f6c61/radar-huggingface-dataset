# AdaptiveChunking/spec_C_s2

## Resumen

spec_C_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking dentro de su línea de trabajo sobre *dynamic chunking* y tokenización a nivel de byte. No es un modelo conversacional ni un asistente instruido: es una ejecución concreta (una *run*) de una arquitectura H-Net de nivel de byte, entrenada con el entrenador heredado (`legacy/tier1/train.py`) del repositorio `beetle-hnet`. El modelo se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución que usa el proyecto Beetle.

El interés del artefacto es metodológico más que de producto. Con 82.470.528 parámetros reales en `safetensors`, un repositorio de 6,9 GB y 21 checkpoints retenidos en ramas `step-N`, está pensado para estudiar cómo evoluciona el comportamiento de segmentación (chunking) de una H-Net byte-level a lo largo del entrenamiento, no para desplegarse como servicio. La model card no documenta capacidades generativas, idiomas ni evaluación de calidad, y no se han publicado resultados de benchmarks.

Por tanto, debe tratarse como material reproducible de investigación: pesos intermedios, configuración de entrenamiento y un mapa de pesos atados (`tied_weights`) que hay que restaurar manualmente para cargar cada checkpoint. La licencia Apache 2.0 permite reutilización, pero la ausencia de documentación funcional limita su uso fuera del análisis experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (dynamic chunking), implementación `beetle-hnet` |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json`, `final.json`, `log.jsonl` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte, es decir, un modelo que opera sobre bytes en lugar de sobre tokens de un vocabulario subword, con mecanismos de *dynamic chunking* que agrupan secuencias de bytes en unidades de mayor granularidad de forma adaptativa. La implementación de referencia es `beetle-hnet` y el entrenamiento se realizó con el entrenador heredado del repositorio (`legacy/tier1/train.py`), lo que implica una infraestructura de entrenamiento antigua y sin estado de optimizador persistido.

El repositorio conserva 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, entre otros), cada uno con sus pesos y su `config.json` que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`; para cargar correctamente hay que aplicar `sd[dst] = sd[src]` para cada entrada del mapa. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO. Las sondas de frontera de chunking sobre FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `spec_C_s2/`.

## Capacidades

- Modelado de lenguaje a nivel de byte: procesa secuencias de bytes sin vocabulario subword explícito.
- Segmentación dinámica (*dynamic chunking*): el interés principal del artefacto es observar y analizar las fronteras de chunking que produce en distintos pasos de entrenamiento.
- Evaluación mediante sondas de frontera sobre FLORES+, publicadas como dataset aparte.
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingüe documentada ni lista de idiomas.
- No consta modo *thinking*, visión, audio ni ninguna modalidad adicional.
- No consta ajuste por instrucciones; es un checkpoint de preentrenamiento de investigación.

## Casos de uso

- Investigación sobre tokenización byte-level: comparar los checkpoints `step-N` para medir cómo cambian las fronteras de chunking a lo largo del entrenamiento, usando las sondas de FLORES+ del dataset asociado.
- Reproducción de experimentos: reentrenar o reanudar desde un checkpoint concreto del entrenador heredado para validar resultados publicados por el grupo.
- Análisis de políticas de segmentación: extraer las decisiones de chunking sobre corpus multilingües y contrastarlas con tokenizadores BPE o Unigram.
- Estudio de estabilidad del entrenamiento: el `log.jsonl` y los 21 checkpoints permiten trazar curvas de pérdida y detectar divergencias tempranas.
- Base para experimentos de arquitectura: servir de punto de partida para variantes de H-Net con otros esquemas de chunking o con entrenadores modernos.
- Docencia y divulgación: ejemplo real y pequeño (82M parámetros) de modelo byte-level con pesos públicos para ilustrar cómo funciona el chunking dinámico sin depender de un tokenizador externo.
- Auditoría de artefactos de investigación: verificar la integridad de pesos atados y la correspondencia entre `config.json`, `tied_weights` y `model.safetensors` en un pipeline de carga propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 330 MB solo para pesos (82,47 M × 4 bytes), más activaciones y memoria del runtime.
- En fp16/bf16: aproximadamente 165 MB para pesos; en int8: unos 82 MB. Las cifras excluyen activaciones, que dependen de la longitud de secuencia y del esquema de chunking.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp32 con secuencias moderadas; una RTX 3060, RTX 4090, A100 o H100 cubren el modelo con holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 6 GB o más.
- Opciones de despliegue: al ser una arquitectura H-Net byte-level con implementación propia (`beetle-hnet`), no consta soporte en vLLM, TGI, llama.cpp ni Ollama. El despliegue requiere cargar los pesos con PyTorch y la implementación de referencia del repositorio, restaurando antes los pesos atados según `tied_weights`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaptiveChunking/spec_C_s2 | 82,47 M | no disponible | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face, 21 checkpoints |
| AdaptiveChunking/hnet-chunking-spec-82m | no disponible | no disponible | Mismo linaje, repositorio empaquetado del que se separó esta ejecución | Apache 2.0 | Hugging Face |
| Modelos byte-level de propósito general (p. ej. ByT5, CANINE) | variable | variable | Tokenización byte-level sin chunking dinámico | variable | Hugging Face / repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no debe esperarse comportamiento de asistente ni seguimiento de instrucciones.
- No hay evaluación de calidad publicada; se desconoce su competencia en tareas downstream.
- No se documentan idiomas soportados ni cobertura multilingüe, pese a usar sondas FLORES+.
- Riesgo de alucinación no caracterizado: al no haber benchmarks ni evaluación de generación, no puede acotarse.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento.
- Los pesos están atados (`tied_weights`): una carga ingenua sin restaurar `sd[dst] = sd[src]` produce un modelo incorrecto.
- El entrenador heredado no conserva estado de optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde un checkpoint.
- No hay soporte conocido en runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que complica su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación funcional y de evaluación hace desaconsejable su uso en producción sin validación previa.
- El repositorio ocupa 6,9 GB por la acumulación de checkpoints; conviene descargar solo la rama `step-N` necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_C_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de chunking (FLORES+): https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Implementación de referencia `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
