# AdaptiveChunking/spec_D_s1

## Resumen

spec_D_s1 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución ("run") concreta de una arquitectura H-Net a nivel de byte ("byte-level H-Net"), entrenada con el trainer heredado (`legacy/tier1/train.py`) del repositorio de código abierto beetle-hnet. El modelo fue extraído del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` y reorganizado en el formato de ejecución individual de Beetle, con ramas `step-N` para cada checkpoint retenido y una rama `main` con los pesos finales.

El interés del modelo no reside en su rendimiento como asistente conversacional, sino en su carácter experimental: forma parte de un conjunto de especificaciones ("spec") orientadas a estudiar el chunking dinámico y la tokenización a nivel de byte en arquitecturas H-Net. El nombre y las etiquetas (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`, `legacy-trainer`) apuntan a un trabajo de investigación sobre segmentación adaptativa de secuencias más que a un modelo de propósito general.

Con 82.470.528 parámetros totales (dato real obtenido de los safetensors), un tamaño de repositorio de 6,9 GB (inflado por los 21 checkpoints retenidos), licencia Apache 2.0 y cero descargas en el momento de la consulta, se trata de un artefacto de investigación de nicho, útil principalmente para reproducir experimentos de chunking y para inspeccionar la evolución del entrenamiento paso a paso. No hay información publicada sobre idiomas soportados, pipeline, benchmarks ni contexto máximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level H-Net) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint y `tied_weights` map) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "Byte-level H-Net" ejecutado desde el repositorio beetle-hnet y entrenado con el trainer heredado (`legacy/tier1/train.py`). La arquitectura H-Net, por las etiquetas y la descripción, opera directamente sobre bytes en lugar de sobre tokens subpalabra, y el proyecto se enmarca en el estudio del "dynamic-chunking" (segmentación dinámica de la entrada). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

El entrenamiento se conserva en forma de 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, ...), cada uno con su `model.safetensors` y `config.json` que incluye `model_config`, configuración de entrenamiento y el mapa `tied_weights` (que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El trainer heredado no guardaba estado del optimizador, por lo que no existe directorio `training_state/`. Como material de evaluación, la model card remite a las "FLORES+ boundary probes" del dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `spec_D_s1/`, lo que sugiere que el interés experimental está en la detección de fronteras de segmento sobre FLORES+.

## Capacidades

- Modelo experimental de investigación sobre chunking dinámico y tokenización a nivel de byte; no está documentado como modelo de propósito general.
- Procesamiento a nivel de byte (byte-level), lo que en principio permite operar sobre cualquier secuencia de bytes sin vocabulario subpalabra fijo.
- Entrenado para tareas de segmentación/chunking evaluadas mediante las FLORES+ boundary probes del dataset asociado.
- No hay información publicada sobre generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay información publicada sobre tool calling, function calling ni soporte de agentes.
- No hay información publicada sobre capacidades multilingües ni sobre un modo "thinking".
- No hay información publicada sobre pipeline de inferencia en Hugging Face.

## Casos de uso

- Reproducción de experimentos de chunking: cargar los checkpoints `step-N` y comparar la evolución de las fronteras de segmento sobre las FLORES+ boundary probes del dataset `AdaptiveChunking/hnet-chunking-probes` (ruta `spec_D_s1/`), lo que permite analizar cómo cambia la segmentación a lo largo del entrenamiento.
- Estudio de tokenización byte-level: utilizar el modelo como banco de pruebas para comparar representaciones a nivel de byte frente a tokenizadores subpalabra en tareas controladas de segmentación.
- Investigación sobre arquitecturas H-Net: inspeccionar `model_config` y el mapa `tied_weights` de cada checkpoint para entender la estructura interna y las ataduras de pesos del modelo.
- Análisis de dinámica de entrenamiento: la rama `main` incluye `log.jsonl` y `final.json`, útiles para estudiar curvas de pérdida y el comportamiento del trainer heredado sin estado de optimizador.
- Baseline para experimentos de chunking adaptativo: al ser una "spec" concreta (spec_D_s1) dentro de una familia de ejecuciones, sirve como referencia frente a otras especificaciones del mismo proyecto.
- Verificación de integridad de pesos: restaurar los `tied_weights` según el mapa documentado (`sd[dst] = sd[src]`) para validar la carga correcta de los safetensors en pipelines de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia las FLORES+ boundary probes del dataset `AdaptiveChunking/hnet-chunking-probes` (ruta `spec_D_s1/`) como material de evaluación, sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 82,47 millones de parámetros, los pesos en precisión completa (fp32) ocuparían aproximadamente 330 MB; en fp16, unos 165 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: por tamaño de parámetros, es plausible que quepa en GPU de consumo, pero no hay confirmación publicada ni instrucciones de ejecución.
- Opciones de despliegue: no disponible. El repositorio usa la librería PyTorch y formato safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Nota de almacenamiento: el repositorio completo ocupa 6,9 GB debido a los 21 checkpoints retenidos; conviene descargar solo la rama `main` o los checkpoints necesarios.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level para chunking dinámico) ni datos de rendimiento que permitan una comparación rigurosa. El propio proyecto incluye otras especificaciones empaquetadas en `AdaptiveChunking/hnet-chunking-spec-82m`, pero no se dispone de sus detalles en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación sin documentación de capacidades de propósito general; no debe evaluarse como asistente conversacional.
- Ausencia total de datos publicados sobre idiomas, contexto máximo, benchmarks y rendimiento.
- Cero descargas y cero likes en el momento de la consulta: artefacto de nicho sin validación externa conocida.
- El trainer heredado no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento desde los checkpoints tal cual.
- La restauración correcta de los pesos requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); omitirlo puede producir cargas incorrectas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificaciones con las condiciones habituales de la licencia, pero no hay garantías ni evaluación de calidad publicadas.
- Tamaño del repositorio (6,9 GB) por los múltiples checkpoints; conviene planificar el almacenamiento y la descarga selectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_D_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de probes FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
