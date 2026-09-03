# AdaptiveChunking/hnet-chunking-pilots

## Resumen

H-Net dynamic-chunking pilot models es un conjunto de 31 checkpoints byte-level de la arquitectura H-Net (Hierarchical Network with Dynamic Chunking), publicados por el grupo AdaptiveChunking. Cada checkpoint tiene 22,5 millones de parámetros y fue entrenado durante 6000 pasos con un presupuesto de FLOPs fijo, variando únicamente el objetivo del módulo de chunking. El propósito declarado es estudiar qué descubre un chunker aprendido cuando es libre de elegir su propia granularidad computacional, en lugar de imponer una segmentación lingüística o morfológica.

El modelo es relevante porque aborda una cuestión abierta en el modelado jerárquico de secuencias: si la segmentación en chunks emerge de forma natural a partir de la compresión, o si responde a regularidades lingüísticas. Los resultados publicados en la model card son mayoritariamente negativos: las unidades aprendidas no son lingüísticas, los chunks no están funcionalmente localizados y la red principal a nivel de chunk aporta solo ~0,07 bits por byte (BPB) a esta escala. Aun así, el trabajo documenta estos hallazgos como resultados legítimos y proporciona los pesos para reproducir los experimentos.

Se trata de un modelo de investigación, no de un sistema de propósito general. No está pensado para generación de texto ni para tareas aplicadas, sino para análisis de interpretabilidad y para servir como punto de partida en el estudio del dynamic chunking. La licencia Apache 2.0 permite su uso y modificación, incluido el uso comercial, aunque su utilidad práctica fuera del ámbito académico es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (red jerárquica con dynamic chunking), byte-level, una etapa de jerarquía |
| Parametros totales | 22,5 millones (la model card menciona también 16,2M/22,5M sin aclarar la distinción) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (el estudio cubre 9 lenguas, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) con `config.json` y mapa de pesos atados |

## Arquitectura y entrenamiento

H-Net es una red jerárquica que comprime datos brutos mediante un proceso recursivo de dynamic chunking dependiente de los datos. En lugar de tokenizar el texto de antemano, el modelo aprende a agrupar bytes en chunks de longitud variable, y una red principal procesa esos chunks a nivel superior. En estos pilotos se usa una sola etapa de jerarquía y el modelo opera directamente sobre bytes.

El entrenamiento se realizó con 6000 pasos, 3 semillas por configuración y un presupuesto de FLOPs idéntico para todas las ejecuciones. Lo único que varía entre las 31 ejecuciones es el objetivo del chunker: hay una familia baseline sin pérdida de paridad (`pilot_A`), variantes con pérdida de paridad aplicada de distintas formas (`pilot_B`, `pilot_D`, `pilot_E`), una rama de reversión (`pilot_C`), controles por codepoint (`pilot_Apc`, `pilot_Bpc`), ablaciones de EMA y regularización genérica (`emactl_noema`, `emactl_genreg`), y un control con jitter en el umbral (`jitter`). También hay un baseline solo en inglés (`baseline_en`). No se menciona el uso de RLHF, DPO ni ningún otro método de alineación.

Los pesos de `emb.weight` y `head.weight` están atados, por lo que solo se almacena `emb.weight` y el mapa `tied_weights` en `config.json` permite restaurar el resto. La model card indica que la restauración es bit-exacta respecto a los checkpoints originales de entrenamiento.

## Capacidades

- Procesamiento byte-level: el modelo opera directamente sobre bytes, sin tokenización previa.
- Dynamic chunking aprendido: el chunker decide la granularidad computacional de forma dependiente de los datos.
- Interpretabilidad: los checkpoints permiten analizar qué unidades descubre el chunker y cómo se distribuye la información entre chunks.
- Reproducibilidad experimental: 31 ejecuciones con objetivos de chunker distintos, mismas semillas y mismo presupuesto de cómputo.
- Análisis de localización funcional: se pueden realizar experimentos de activation patching y ablaciones para estudiar la contribución de cada componente.
- Multilingüismo (parcial): el estudio cubre 9 lenguas, aunque no se detallan cuáles ni se garantiza soporte uniforme.

No dispone de capacidades de generación de texto, tool calling, agentes, visión ni audio. Es un modelo de investigación, no un asistente conversacional.

## Casos de uso

- Estudio de segmentación aprendida: investigadores pueden cargar los checkpoints y analizar cómo el chunker agrupa bytes en diferentes lenguas, comparando con segmentaciones morfológicas o de palabras. Es adecuado porque el modelo fue diseñado explícitamente para este fin y se proporcionan los pesos y configuraciones.
- Análisis de interpretabilidad de redes jerárquicas: mediante activation patching y ablaciones, se puede estudiar si la información está localizada en chunks concretos o distribuida de forma difusa. Los resultados publicados indican que es difusa, pero el modelo permite reproducir y extender estos experimentos.
- Comparación de objetivos de chunker: las 31 ejecuciones cubren distintas funciones de pérdida y regularizaciones. Un investigador puede comparar el efecto de cada objetivo sobre la compresión final (BPB) y sobre las unidades descubiertas.
- Desarrollo de nuevas variantes de dynamic chunking: a partir de estos checkpoints, se puede fine-tuning o continuar el entrenamiento con nuevos objetivos, usando el código de H-Net disponible en GitHub.
- Validación de métricas de evaluación de chunking: el modelo sirve como banco de pruebas para métricas como morpheme F1 o AUROC, ya que se sabe que las unidades aprendidas no correlacionan con unidades lingüísticas.
- Reproducción de resultados negativos: dado que la model card documenta hallazgos negativos (no localización, no lingüisticidad), el modelo permite a otros grupos verificar estos resultados y construir sobre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas internas como BPB (bits por byte), morpheme F1 y AUROC, pero no se ofrecen valores numéricos en el README. El paper asociado (arXiv 2507.07955) podría contenerlos, pero no se dispone de ellos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 22,5 millones de parámetros, en fp32 ocupa aproximadamente 90 MB, y en fp16 unos 45 MB. Cabe holgadamente en cualquier GPU consumer, incluso en las más modestas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas para inferencia o análisis.
- Opciones de despliegue: al ser un modelo PyTorch con pesos en safetensors, se puede cargar directamente con la librería `safetensors` o con `transformers` si se adapta la configuración. No hay soporte específico para vLLM, Ollama o llama.cpp, dado que no es un modelo de generación estándar.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, la inferencia es rápida incluso en CPU, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en la información proporcionada. La model card menciona que se utilizaron `allenai/Bolmo-1B`, BLT y ByT5 como modelos de comparación en el estudio, pero no se ofrecen resultados numéricos de esos análisis. Por tanto, no es posible elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Escala muy reducida: 22,5 millones de parámetros y solo 6000 pasos de entrenamiento, lo que limita la generalidad de las conclusiones.
- Una sola etapa de jerarquía: el modelo no explora arquitecturas con múltiples niveles de chunking, que podrían comportarse de forma distinta.
- Solo se retuvo el paso final: no hay checkpoints intermedios, por lo que no se puede estudiar la evolución temporal del chunker.
- Tres semillas por configuración: la variabilidad entre semillas puede no ser suficiente para extraer conclusiones estadísticas sólidas.
- Resultados negativos: el modelo demuestra que el chunking aprendido no produce unidades lingüísticas ni localización funcional, lo que puede ser una limitación si se esperaba lo contrario.
- Sin capacidades de generación: no es un modelo de lenguaje utilizable para tareas de texto, solo para investigación.
- Idiomas no especificados: aunque se mencionan 9 lenguas, no se detalla cuáles son ni si el modelo tiene un rendimiento uniforme entre ellas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación, su integración en productos requiere validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Paper en arXiv: https://arxiv.org/abs/2507.07955 (Dynamic Chunking for End-to-End Hierarchical Sequence Modeling)
- Repositorio GitHub de H-Net: https://github.com/goombalab/hnet
- Dataset de resultados: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-results
- Dataset de probes: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
