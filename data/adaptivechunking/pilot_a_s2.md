# AdaptiveChunking/pilot_A_s2

## Resumen

pilot_A_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) del proyecto beetle-hnet, un experimento de tokenización dinámica a nivel de byte ("byte-level H-Net") entrenado con el denominado legacy trainer del repositorio `legacy/tier1/train.py`. El modelo fue separado del repositorio agregado `AdaptiveChunking/hnet-chunking-pilots` y reorganizado en el formato por ejecución de Beetle. Con 22.516.992 parámetros, es un modelo de escala pequeña orientado a experimentación sobre segmentación adaptativa de tokens, no a producción generalista.

La relevancia del modelo es fundamentalmente metodológica: explora el "dynamic chunking" y la tokenización byte-level como alternativas a los tokenizadores subword convencionales, un área de interés para investigadores que estudian eficiencia de tokenización, robustez multilingüe y manipulación de secuencias a nivel de byte. Al ser un piloto (pilot_A_s2), su propósito es servir de base reproducible para comparar estrategias de chunking, no competir con modelos de lenguaje de gran escala.

La información pública es muy limitada: el repositorio tiene 0 descargas y 0 likes, no declara pipeline ni idiomas soportados, y la model card se centra en la estructura de artefactos (ramas `step-N`, `main`, ficheros `final.json` y `log.jsonl`) más que en capacidades o rendimiento. Cualquier evaluación de sus habilidades debe hacerse empíricamente a partir de los pesos y de las sondas FLORES+ publicadas en el dataset asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con tokenización byte-level y dynamic chunking (familia beetle-hnet); detalles de capas y atención no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenización byte-level, potencialmente agnóstica a idioma, sin lista declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por rama `step-N` y en `main`), más `config.json` con `model_config`, configuración de entrenamiento y mapa `tied_weights` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net del proyecto beetle-hnet, con un enfoque de tokenización a nivel de byte y segmentación dinámica de la secuencia ("dynamic chunking"). La model card no detalla el número de capas, dimensión oculta, mecanismo de atención ni el esquema exacto de chunking; únicamente confirma que los pesos se entrenaron con el legacy trainer (`legacy/tier1/train.py`) y que existe un mapa de pesos atados (`tied_weights`) que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada antes de cargar el estado.

El entrenamiento se realizó sin conservar estado del optimizador, por lo que el repositorio no incluye `training_state/`. Se retuvo un único checkpoint en la rama `step-6000` (6000 pasos), además de los pesos más recientes en `main` junto con `final.json` y `log.jsonl`. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO. Las sondas de frontera FLORES+ de esta ejecución están publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `pilot_A_s2/`.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre bytes en lugar de un vocabulario subword fijo, lo que en principio permite representar cualquier cadena sin tokens fuera de vocabulario.
- Segmentación dinámica (dynamic chunking): capacidad central del experimento, orientada a agrupar bytes en unidades variables según el contexto.
- Multilingüismo potencial: al ser byte-level no depende de un vocabulario por idioma, aunque no se declara una lista de idiomas soportados ni se han publicado evaluaciones por idioma.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en tokenización: usar los pesos y el checkpoint `step-6000` para reproducir experimentos de dynamic chunking y comparar curvas de entrenamiento frente a tokenizadores subword convencionales.
- Evaluación de robustez byte-level: probar el modelo con texto ruidoso, ortografías no estándar o idiomas de bajos recursos para medir si la representación por bytes evita los fallos por tokens desconocidos.
- Análisis de fronteras de segmentación: emplear las sondas FLORES+ del dataset `hnet-chunking-probes` (`pilot_A_s2/`) para estudiar cómo el modelo delimita unidades lingüísticas en traducción multilingüe.
- Reproducción de pipelines de entrenamiento: servir como referencia para validar el legacy trainer (`legacy/tier1/train.py`) y el formato por ejecución de Beetle, incluida la restauración de pesos atados.
- Baseline en estudios de eficiencia: al tener 22,5 M de parámetros, es viable ejecutarlo en CPU o en GPU de gama baja para comparar coste por byte frente a modelos con vocabulario subword.
- Docencia y prototipado: modelo pequeño y con licencia Apache 2.0 que permite experimentar con arquitecturas H-Net sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16 unos 45 MB. El consumo real dependerá de la longitud de secuencia y del estado de chunking, no documentados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de investigación con arquitectura no estándar (H-Net byte-level), es probable que requiera cargar los pesos manualmente con PyTorch y el código de beetle-hnet, aplicando el mapa `tied_weights`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pilot_A_s2 (AdaptiveChunking) | 22,5 M | no disponible | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos byte-level de investigación (p. ej. ByT5-small) | ~300 M | no aplica (byte-level) | Transformer encoder-decoder byte-level | Apache 2.0 | Público |
| Tokenizadores subword estándar (p. ej. GPT-2 small) | ~124 M | 1024 | Transformer con BPE | MIT | Público |

No se dispone de datos de rendimiento comparables para pilot_A_s2, por lo que la comparación se limita a escala, enfoque de tokenización y licencia.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, métricas de calidad ni evaluaciones de seguridad.
- Sin pipeline declarado ni instrucciones de uso estándar; la carga requiere reconstruir pesos atados con el mapa `tied_weights` y disponer del código de beetle-hnet.
- No se declaran idiomas soportados; el enfoque byte-level no garantiza calidad lingüística sin entrenamiento suficiente.
- Riesgo de alucinación y salidas incoherentes esperable en un modelo de 22,5 M de parámetros entrenado como piloto.
- No se documentan sesgos; al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, etnia o idioma.
- No hay estado del optimizador (`training_state/`), lo que impide reanudar el entrenamiento desde el checkpoint tal cual.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_A_s2
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking
- Repositorio agregado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código de beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
