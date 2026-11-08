# AdaptiveChunking/pilot_B_s2

## Resumen

pilot_B_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking dentro de su línea de experimentos sobre segmentación dinámica de tokens (dynamic chunking). Se trata de un modelo de lenguaje a nivel de byte entrenado con la implementación Beetle de H-Net (un transformer jerárquico con segmentación adaptativa), y no de un modelo conversacional orientado a producción. El repositorio contiene únicamente pesos y configuración de un único paso de entrenamiento, separado del repositorio agregado `hnet-chunking-pilots` para adoptar el formato por ejecución de Beetle.

El modelo tiene 22.516.992 parámetros (unos 22,5 millones) y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos pequeños de investigación. Su relevancia no radica en capacidades de generación de texto de propósito general, sino en servir como artefacto reproducible para estudiar cómo afecta la tokenización a nivel de byte y el chunking dinámico al comportamiento de un transformer jerárquico, con sondas de frontera sobre FLORES+ publicadas aparte.

La licencia es Apache 2.0 y los pesos están en safetensors con código PyTorch. No se han publicado idiomas soportados, pipeline de inferencia ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (transformer jerárquico con segmentación dinámica), implementación Beetle H-Net |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible (tokenización a nivel de byte, potencialmente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net tal como la implementa el repositorio beetle-hnet: un transformer jerárquico que agrupa tokens en chunks de forma dinámica en lugar de operar sobre una secuencia plana de tokens fijos. La tokenización es a nivel de byte (byte-level), lo que elimina la dependencia de un vocabulario BPE concreto y permite, en teoría, procesar cualquier idioma o secuencia binaria sin tokens fuera de vocabulario.

El entrenamiento se realizó con el denominado *legacy trainer* (`legacy/tier1/train.py`), que no conserva estado del optimizador; por eso el repositorio carece de `training_state/`. Se retuvo un único checkpoint en la rama `step-6000`, y la rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El `config.json` incluye el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte: entrenado para predecir el siguiente byte, sin vocabulario subword.
- Segmentación dinámica de secuencias mediante chunking adaptativo (objeto central del experimento).
- Potencial multilingüe derivado de la tokenización byte-level, aunque no se documentan idiomas evaluados.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo thinking: no disponibles.
- Evaluación de fronteras de chunk sobre FLORES+ mediante las sondas publicadas en el dataset `hnet-chunking-probes`.

## Casos de uso

- Investigación sobre tokenización: usar el checkpoint para reproducir los experimentos de chunking dinámico y comparar la segmentación aprendida frente a BPE o tokenización por caracteres en corpus multilingües.
- Análisis de fronteras lingüísticas: las sondas FLORES+ asociadas permiten estudiar dónde coloca el modelo las fronteras de chunk y si estas se alinean con límites morfológicos o de palabra en distintos idiomas.
- Reproducibilidad de experimentos: al estar separado del repositorio agregado y conservar `log.jsonl` y `final.json`, sirve como artefacto citable en publicaciones sobre arquitecturas jerárquicas.
- Prototipado de modelos byte-level: base de partida para experimentos con vocabularios abiertos, dominios con ruido binario o textos sin normalización.
- Estudio de eficiencia en secuencias largas: al agrupar tokens en chunks, permite medir el coste computacional frente a attention cuadrática en secuencias de entrada extensas.
- Docencia y formación: modelo de 22,5 M de parámetros que cabe en cualquier GPU consumer y permite ilustrar el funcionamiento interno de un transformer jerárquico sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 90 MB solo para pesos (22,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 45 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de investigación con código propio (beetle-hnet), no se documenta soporte para vLLM, TGI, llama.cpp u Ollama; el despliegue requeriría cargar los pesos con PyTorch y el código del repositorio beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pilot_B_s2 | 22,5 M | no disponible | byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo de investigación) |
| GPT-2 small | 124 M | 1024 | BPE | MIT | Hugging Face, ampliamente soportado |
| TinyLlama-1.1B | 1,1 B | 2048 | BPE (SentencePiece) | Apache 2.0 | Hugging Face, vLLM/llama.cpp |
| Otros checkpoints de hnet-chunking-pilots | no disponible | no disponible | byte-level | Apache 2.0 | Hugging Face |

La comparación es únicamente orientativa: pilot_B_s2 no es un modelo de propósito general y no se han publicado métricas que permitan situarlo frente a alternativas en tareas estándar.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de investigación sin pipeline de inferencia documentado ni instrucciones de uso más allá de la restauración de pesos.
- Ausencia de evaluación: no hay benchmarks publicados, por lo que se desconoce su calidad en generación, razonamiento o traducción.
- Sin estado del optimizador: el legacy trainer no lo guardó, lo que impide reanudar el entrenamiento de forma exacta desde el checkpoint.
- Idiomas no documentados: aunque la tokenización byte-level es teóricamente universal, no se especifica qué lenguas se cubrieron en el entrenamiento.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados por el autor; un modelo entrenado sobre corpus no especificado puede reproducir sesgos de dichos datos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su despliegue en aplicaciones reales sin validación previa.
- Dependencia del código de beetle-hnet: la arquitectura H-Net no es estándar, por lo que no puede cargarse con `transformers` sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_B_s2
- Repositorio agregado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
