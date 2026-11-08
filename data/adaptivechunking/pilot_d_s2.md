# AdaptiveChunking/pilot_D_s2

## Resumen

pilot_D_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento (run) del proyecto beetle-hnet, un framework de experimentación con H-Net y tokenización a nivel de byte (byte-level) orientado al estudio de estrategias de chunking dinámico. El modelo se entrenó con el denominado legacy trainer (`legacy/tier1/train.py`) y se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` a la estructura de directorios por ejecución de Beetle.

Con 22.516.992 parámetros totales, se sitúa en la categoría de modelos pequeños, lejos de los LLM de propósito general. Su relevancia no reside en capacidades de generación de texto o razonamiento, sino en servir como artefacto reproducible para investigar cómo distintas políticas de chunking afectan al entrenamiento de modelos byte-level. La model card indica que las sondas de frontera (boundary probes) sobre FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `pilot_D_s2/`.

La información pública disponible es muy limitada: no se declaran idiomas soportados, pipeline ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors junto con `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet) con tokenización byte-level; detalles internos no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net implementada en el repositorio beetle-hnet, con procesamiento a nivel de byte. La model card no detalla la composición interna de capas, el mecanismo de atención ni la política exacta de chunking dinámico empleada en esta ejecución concreta; solo se especifica que el entrenamiento se realizó con el legacy trainer (`legacy/tier1/train.py`) y que se conserva un único checkpoint retenido en la rama `step-N`, correspondiente al paso 6000, con `model.safetensors` y `config.json`.

El `config.json` incluye la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada. El legacy trainer no guardó estado del optimizador, por lo que no existe directorio `training_state/`. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Entrenamiento y evaluación de tokenización byte-level: el artefacto está pensado para reproducir y analizar la ejecución pilot_D_s2 dentro del framework beetle-hnet.
- Chunking dinámico: las etiquetas del repositorio (`dynamic-chunking`, `hnet`, `beetle-hnet`) indican que el modelo se entrena con una política de segmentación adaptativa, aunque no se documentan sus detalles.
- Sondas de frontera sobre FLORES+: los resultados asociados a esta ejecución se publican en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `pilot_D_s2/`.
- Generación de texto: no disponible; no se documenta ninguna capacidad de inferencia de propósito general.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre tokenización byte-level: usar el checkpoint del paso 6000 como referencia para comparar cómo distintas políticas de chunking afectan a las representaciones aprendidas, cargando `model.safetensors` y aplicando el mapa `tied_weights` del `config.json`.
- Reproducción de experimentos: restaurar la ejecución pilot_D_s2 en la estructura por run de Beetle para replicar el entrenamiento con `legacy/tier1/train.py` y contrastar los resultados con otras ejecuciones del repositorio `hnet-chunking-pilots`.
- Evaluación de fronteras de segmentación: ejecutar las sondas de FLORES+ incluidas en `hnet-chunking-probes/pilot_D_s2/` para medir el comportamiento del modelo en límites de unidades lingüísticas.
- Análisis de eficiencia de tokenización: al operar a nivel de byte, el modelo permite estudiar el coste computacional y la longitud efectiva de secuencia frente a tokenizadores subword en corpus multilingües.
- Docencia y formación: servir como ejemplo compacto (22,5 M de parámetros) de pipeline de entrenamiento con trainer legacy, útil para enseñar el flujo de checkpoints, configuración y pesos atados.
- Base para experimentos derivados: partir de estos pesos como inicialización en estudios comparativos de arquitecturas H-Net con variantes de chunking, dado el reducido tamaño del repositorio (0,1 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente remite a las sondas de frontera sobre FLORES+ del dataset `AdaptiveChunking/hnet-chunking-probes` (prefijo `pilot_D_s2/`), sin cifras de rendimiento en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para cargar los pesos; no se documenta un entorno de referencia.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, series RTX 30/40 o superiores) e incluso en hardware de gama baja.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no tratarse de un modelo generativo de propósito general su despliegue como servicio no está descrito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información muy escasa: no se documentan idiomas, contexto, composición del dataset ni métricas, lo que impide evaluar su calidad de forma independiente.
- No es un modelo de propósito general: no hay evidencia de capacidades de generación, razonamiento o instrucción; no debe emplearse como asistente conversacional.
- Checkpoint único: solo se conserva el paso 6000; no hay estado del optimizador (`training_state/`), lo que limita la reanudación exacta del entrenamiento.
- Pesos atados: es imprescindible aplicar el mapa `tied_weights` del `config.json` (`sd[dst] = sd[src]`) al cargar los pesos; omitirlo puede producir un modelo incorrecto.
- Sesgos y alucinación: no disponibles; al no documentarse el corpus de entrenamiento no puede evaluarse el sesgo ni el riesgo de alucinación.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de las condiciones de los datasets asociados (FLORES+ y `hnet-chunking-probes`).
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_D_s2
- Repositorio empaquetado de ejecuciones: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Código de beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
