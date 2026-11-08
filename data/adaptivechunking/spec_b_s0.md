# AdaptiveChunking/spec_B_s0

## Resumen

`spec_B_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un experimento de tokenización a nivel de byte (*byte-level*) construido sobre la arquitectura H-Net, entrenado con el denominado *legacy trainer* (`legacy/tier1/train.py`) del proyecto de código abierto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). El modelo forma parte de la familia de experimentos de *dynamic chunking* (fragmentación dinámica) que la organización agrupa bajo el identificador `hnet-chunking-spec-82m`, del cual este repositorio es una escisión en el formato de ejecución por *run* de Beetle.

Con 82.470.528 parámetros (aproximadamente 82,5 millones), se sitúa en la categoría de modelos pequeños, pensados para investigación sobre representación de tokens y fronteras de segmentación más que para despliegue en producción. Su relevancia es metodológica: permite reproducir y auditar un entrenamiento concreto mediante 21 checkpoints intermedios retenidos y un registro de entrenamiento (`log.jsonl`), algo poco habitual en publicaciones de modelos.

No se dispone de información sobre el corpus de entrenamiento, la longitud de contexto, los idiomas soportados ni resultados de evaluación de capacidades generativas. La model card se limita a documentar el linaje del modelo, la estructura de ramas y la ausencia de estado del optimizador. Cualquier uso más allá de la experimentación en tokenización debe considerarse no validado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante byte-level, según tags `hnet`, `byte-level`, `beetle-hnet`) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante de tokenización a nivel de byte, orientada a la fragmentación dinámica (*dynamic chunking*) de la secuencia de entrada. La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni el esquema exacto de agrupación de bytes, por lo que estos datos deben consultarse en el `config.json` de cada checkpoint o en el repositorio original `hnet-chunking-spec-82m`. El mapa `tied_weights` incluido en la configuración indica que algunos tensores están atados y deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada antes de cargar el estado.

El entrenamiento se realizó con el *legacy trainer* del proyecto beetle-hnet, que no conservaba estado del optimizador; por ello el repositorio no incluye el directorio `training_state/`. Se retuvieron 21 checkpoints en la rama `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), lo que permite trazar la evolución del entrenamiento paso a paso. La rama `main` contiene los pesos finales junto con `final.json` y `log.jsonl`. No se especifican el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Modelo de investigación sobre tokenización byte-level y segmentación dinámica; no se documentan capacidades generativas de propósito general.
- Entrenado sobre arquitectura H-Net con *dynamic chunking*, lo que lo hace adecuado para estudiar cómo se agrupan los bytes en unidades de mayor nivel.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.
- Se publican sondas de frontera FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `spec_B_s0/`, lo que sugiere evaluación de límites de segmentación sobre texto multilingüe de FLORES+.

## Casos de uso

- Investigación en tokenización byte-level: cargar los checkpoints `step-N` y comparar cómo evoluciona la segmentación dinámica a lo largo del entrenamiento, usando `log.jsonl` como referencia temporal.
- Reproducción de experimentos: al conservarse 21 checkpoints y la configuración de entrenamiento en cada `config.json`, se puede replicar la curva de entrenamiento y verificar resultados del repositorio original `hnet-chunking-spec-82m`.
- Evaluación de fronteras de segmentación: emplear las sondas FLORES+ del dataset `hnet-chunking-probes` (`spec_B_s0/`) para medir la calidad de las fronteras de *chunking* sobre texto multilingüe.
- Estudio de eficiencia en tokenización: analizar si el enfoque de fragmentación dinámica reduce el número de tokens efectivos frente a tokenizadores BPE en corpus concretos.
- Base para *fine-tuning* experimental: con 82,5 M de parámetros y licencia Apache 2.0, sirve como punto de partida de bajo coste para probar variantes de H-Net en tareas de modelado de lenguaje a pequeña escala.
- Docencia y formación: el tamaño reducido y la disponibilidad de checkpoints intermedios permiten ilustrar el proceso de entrenamiento y la evolución de representaciones en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 330 MB y en fp16 unos 165 MB; el consumo real dependerá de la longitud de secuencia y del mecanismo de *chunking*, no documentados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería bastar para inferencia en fp16; una RTX 3060, RTX 4060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas gráficas actuales, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin integración declarada en frameworks de servicio, el despliegue requiere cargar los pesos manualmente con PyTorch y aplicar el mapa `tied_weights`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría en la documentación proporcionada. El propio repositorio original `AdaptiveChunking/hnet-chunking-spec-82m` actúa como referencia directa, ya que `spec_B_s0` es una escisión del mismo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| spec_B_s0 | 82,5 M | no disponible | Apache 2.0 | Hugging Face |
| hnet-chunking-spec-82m (repo original) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada de capacidades generativas; no debe usarse en producción sin validación propia.
- No se documentan sesgos conocidos, pero al no declararse idiomas ni corpus de entrenamiento, no es posible evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación no caracterizado; no hay benchmarks que permitan estimarlo.
- Limitaciones de contexto e idioma desconocidas; la ausencia de metadatos de idioma impide garantizar cobertura multilingüe más allá de las sondas FLORES+.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos.
- El *legacy trainer* no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde los checkpoints publicados.
- Es necesario aplicar el mapa `tied_weights` al cargar los pesos; obviarlo produce un estado inconsistente.
- El repositorio tiene 0 descargas y 1 *like*, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face: AdaptiveChunking/spec_B_s0](https://huggingface.co/AdaptiveChunking/spec_B_s0)
- [Repositorio original: AdaptiveChunking/hnet-chunking-spec-82m](https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m)
- [Dataset de sondas: AdaptiveChunking/hnet-chunking-probes](https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes)
- [Perfil de la organización en Hugging Face](https://huggingface.co/AdaptiveChunking/datasets)
- [Repositorio de código: beetle-hnet](https://github.com/suchirsalhan/beetle-hnet)
