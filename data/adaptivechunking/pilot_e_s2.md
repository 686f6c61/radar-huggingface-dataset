# AdaptiveChunking/pilot_E_s2

## Resumen

pilot_E_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución ("run") concreta del proyecto beetle-hnet, un experimento de tokenización dinámica a nivel de byte (byte-level) sobre una arquitectura denominada H-Net. El modelo fue entrenado con el denominado "legacy trainer" (concretamente `legacy/tier1/train.py`) y se ha separado del repositorio agregado `AdaptiveChunking/hnet-chunking-pilots` en el formato de un único run por repositorio que usa la familia Beetle.

El interés del modelo no reside en sus capacidades de generación, sino en su papel como artefacto de investigación sobre segmentación adaptativa de tokens. Los tags del repositorio (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`) apuntan a un trabajo centrado en cómo se agrupan los bytes en unidades de cómputo, más que en un modelo conversacional o de propósito general. Con 22.516.992 parámetros totales y un tamaño de repositorio de 0,1 GB, es un modelo pequeño, manejable en hardware de consumo.

La información publicada es escasa: no hay pipeline declarado, no se especifican idiomas soportados y no se han divulgado resultados de benchmarks. La model card se limita a describir la estructura del repositorio (ramas `step-N`, `main`, ficheros `config.json`, `final.json`, `log.jsonl`) y a remitir a los probes de frontera FLORES+ alojados en el dataset `AdaptiveChunking/hnet-chunking-probes`. Cualquier evaluación de capacidades debe hacerse, por tanto, a partir del código y los datos del proyecto original, no de métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), procesamiento byte-level con dynamic chunking |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una H-Net implementada en el proyecto beetle-hnet, con un enfoque de tokenización byte-level y chunking dinámico. El modelo se entrenó mediante el "legacy trainer" del repositorio (`legacy/tier1/train.py`), un entrenador que, según la model card, no conservaba estado del optimizador; por ese motivo el repositorio no incluye el directorio `training_state/`. El checkpoint retenido corresponde al paso 6000 y se distribuye en una rama `step-6000`, mientras que la rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`.

El `config.json` de cada checkpoint incluye la configuración del modelo (`model_config`), la configuración de entrenamiento y el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; tampoco se detallan innovaciones de decodificación o mecanismos de atención específicos más allá del propio chunking dinámico. Los probes de frontera sobre FLORES+ asociados a esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `pilot_E_s2/`.

## Capacidades

- Procesamiento de texto a nivel de byte con segmentación dinámica en chunks, que es el objeto de estudio del proyecto.
- Modelo de investigación para experimentación con tokenización adaptativa, no un asistente conversacional documentado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información publicada; existen probes FLORES+ asociados, pero no se han divulgado resultados.
- No se documentan modos especiales (thinking, visión, audio) ni pipeline de inferencia declarado.

## Casos de uso

- Investigación en tokenización adaptativa: usar el checkpoint para reproducir o extender los experimentos de chunking dinámico de beetle-hnet, comparando la segmentación byte-level frente a tokenizadores BPE convencionales.
- Evaluación de fronteras de segmentación: emplear los probes FLORES+ del dataset `hnet-chunking-probes` (prefijo `pilot_E_s2/`) para medir cómo el modelo delimita unidades lingüísticas en distintos idiomas.
- Reproducibilidad de experimentos: el checkpoint del paso 6000 y los ficheros `log.jsonl` y `final.json` permiten auditar la curva de entrenamiento y replicar la ejecución con el legacy trainer.
- Baseline en estudios comparativos: al ser un modelo de 22,5 M de parámetros y 0,1 GB, sirve como referencia ligera en experimentos que comparen arquitecturas de tokenización con presupuestos de cómputo reducidos.
- Docencia y formación: su tamaño permite ejecutar el modelo completo en una GPU de consumo o incluso en CPU, lo que facilita demostraciones prácticas de entrenamiento e inferencia sin infraestructura dedicada.
- Integración en pipelines de investigación propios: cargar los pesos con PyTorch y el mapa `tied_weights` para incorporar la capa de chunking a prototipos de preprocesado de texto.
- Estudio de eficiencia: analizar el coste computacional del chunking dinámico frente a la tokenización fija en tareas de procesamiento de secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22.516.992 parámetros, los pesos en FP32 ocupan aproximadamente 90 MB; en FP16/BF16, unos 45 MB. El consumo real depende de la implementación del chunking y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente para los pesos; una RTX 3060, RTX 4060 o superior ofrece margen holgado para lotes pequeños.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia de lotes reducidos.
- Opciones de despliegue: al no haber pipeline declarado ni pesos en GGUF, la vía natural es PyTorch con el código de beetle-hnet. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de alternativas directamente comparables en la información proporcionada. Como referencia estructural, se puede situar frente a otros modelos de investigación de tamaño reducido, pero sin métricas publicadas la comparación cuantitativa no es posible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilot_E_s2 | 22,5 M | no disponible | Apache 2.0 | Hugging Face (AdaptiveChunking/pilot_E_s2) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia divulgada sobre calidad de generación, razonamiento o código.
- No se especifican idiomas soportados ni cobertura multilingüe verificada; los probes FLORES+ existen, pero sus resultados no se han publicado.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo pequeño y de propósito experimental, no debe usarse en producción sin una evaluación propia.
- El legacy trainer no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento desde el checkpoint.
- La restauración de pesos requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); omitirlo produce un modelo incorrecto.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación de calidad ni documentación de comportamiento, su uso en producción conlleva riesgo técnico no cuantificado.
- Sin pipeline declarado ni formatos GGUF/ONNX: la integración exige código propio basado en beetle-hnet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_E_s2
- Repositorio agregado de pilots: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
- Dataset de probes FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código de beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
