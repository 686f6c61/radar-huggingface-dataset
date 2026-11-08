# AdaptiveChunking/spec_C_s1

## Resumen

spec_C_s1 es un modelo de investigación de 82.470.528 parámetros publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de una arquitectura denominada H-Net (beetle-hnet), entrenada con el denominado "legacy trainer" del repositorio beetle-hnet y separada del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el formato de una ejecución individual dentro del ecosistema Beetle. El modelo opera a nivel de byte y está orientado a experimentos de tokenización y chunking dinámico, no a tareas generativas de propósito general.

La relevancia del modelo es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar cómo una arquitectura H-Net aprende fronteras de segmentación sobre texto multilingüe. El repositorio incluye 21 checkpoints intermedios retenidos (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.) con pesos en safetensors y configuración asociada, además de un mapa de pesos atados (`tied_weights`) que debe restaurarse manualmente al cargar.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks en la documentación proporcionada. El modelo se distribuye bajo licencia Apache 2.0 y su librería declarada es PyTorch, con un tamaño de repositorio de 6,9 GB debido a la acumulación de checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), procesamiento a nivel de byte, con chunking dinámico |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las pruebas de fronteras FLORES+ sugieren evaluación multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una H-Net implementada en el repositorio beetle-hnet, con procesamiento a nivel de byte (byte-level) y un mecanismo de chunking dinámico que constituye el objeto central del experimento. El modelo se entrenó con el entrenador heredado (`legacy/tier1/train.py`), que no conserva estado del optimizador, por lo que el repositorio no incluye directorio `training_state/`. Esta circunstancia impide reanudar el entrenamiento de forma exacta desde los checkpoints publicados.

El repositorio conserva 21 checkpoints intermedios en ramas `step-N`, cada uno con pesos y configuración de modelo y de entrenamiento. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. Los pesos están atados (`tied_weights`), de modo que la restauración requiere aplicar `sd[dst] = sd[src]` para cada entrada del mapa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Procesamiento de texto a nivel de byte, sin dependencia de un vocabulario de subpalabras predefinido.
- Aprendizaje y aplicación de chunking dinámico, presumiblemente orientado a la segmentación adaptativa de secuencias.
- Evaluación de fronteras de segmentación mediante las pruebas FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `spec_C_s1/`.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling o capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no confirmadas explícitamente, aunque el uso de FLORES+ como conjunto de pruebas sugiere evaluación sobre múltiples idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre tokenización libre de vocabulario: el modelo permite estudiar cómo una red a nivel de byte aprende representaciones sin un tokenizador BPE o WordPiece, comparando los 21 checkpoints intermedios para analizar la evolución del aprendizaje.
- Análisis de chunking dinámico: útil para experimentos que evalúan cómo segmentar secuencias largas de forma adaptativa, midiendo la calidad de las fronteras aprendidas frente a segmentaciones fijas.
- Reproducción de experimentos académicos: los checkpoints por paso y el `log.jsonl` permiten reproducir curvas de entrenamiento y comparar configuraciones dentro del ecosistema beetle-hnet.
- Evaluación multilingüe de fronteras: las pruebas FLORES+ del dataset asociado permiten medir el comportamiento del modelo sobre textos en varios idiomas y analizar si el chunking aprendido generaliza entre lenguas.
- Estudio de pesos atados: el mapa `tied_weights` documentado facilita investigar técnicas de atado de pesos y su efecto en modelos pequeños de 82M de parámetros.
- Base para experimentos de eficiencia: al operar a nivel de byte y con chunking dinámico, el modelo sirve como punto de partida para comparar coste computacional y calidad frente a arquitecturas con tokenizador tradicional en tareas de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 330 MB; en fp16 o bf16, unos 165 MB. La VRAM adicional depende de la longitud de secuencia y del mecanismo de chunking, que no está documentado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería poder cargar los pesos; no se dispone de recomendaciones específicas del autor.
- GPU de consumo: cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, siempre que el framework lo permita.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (H-Net), no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin una implementación específica. La vía prevista es cargar los safetensors con PyTorch y el código de beetle-hnet.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdaptiveChunking/spec_C_s1 | 82,47 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| AdaptiveChunking/hnet-chunking-spec-82m | 82 M (aproximado) | no disponible | no disponible | Hugging Face (repositorio empaquetado del que deriva) |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de chunking dinámico o H-Net byte-level con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni descargas; no está pensado para uso en producción.
- No se documentan sesgos conocidos, pero al entrenarse a nivel de byte sobre corpus no especificados, puede heredar sesgos de esos datos.
- Riesgo de alucinación no evaluado; no hay benchmarks que permitan estimarlo.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar su comportamiento en escenarios multilingües o de contexto largo.
- El entrenador heredado no conserva estado del optimizador, por lo que no es posible reanudar el entrenamiento de forma exacta desde los checkpoints.
- La restauración de pesos requiere aplicar manualmente el mapa `tied_weights`; una carga ingenua puede producir pesos incorrectos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación sobre el entrenamiento y las capacidades reales desaconseja su uso en entornos productivos sin una evaluación previa.
- El tamaño del repositorio (6,9 GB) se debe a los 21 checkpoints; conviene descargar solo la rama necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_C_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de pruebas de fronteras: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
