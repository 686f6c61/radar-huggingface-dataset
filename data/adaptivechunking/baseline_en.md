# AdaptiveChunking/baseline_en

## Resumen

Baseline_en es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de referencia ("baseline") de una red neuronal de tipo H-Net a nivel de byte, entrenada con el entrenador heredado (`legacy/tier1/train.py`) del repositorio beetle-hnet. El modelo se separó del repositorio conjunto `AdaptiveChunking/hnet-chunking-pilots` para adoptar la estructura de ejecución individual de Beetle.

El modelo cuenta con 22.516.992 parámetros totales y se distribuye en formato safetensors con pesos en PyTorch. Su relevancia es fundamentalmente experimental: sirve como punto de comparación para investigaciones sobre tokenización dinámica por chunks y procesamiento a nivel de byte, no como un modelo de propósito general listo para producción.

La información pública disponible es muy limitada. No se especifican idiomas soportados, pipeline de inferencia, datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de las etiquetas técnicas. El repositorio tiene 0 descargas y 0 likes, lo que confirma su carácter de artefacto de investigación interna más que de modelo orientado a la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (red neuronal jerárquica a nivel de byte, según etiquetas del autor) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo "en" sugiere inglés, sin confirmar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se describe como una H-Net a nivel de byte ("byte-level H-Net"), entrenada con el entrenador heredado del proyecto beetle-hnet. Las etiquetas incluyen términos como "dynamic-chunking", "tokenization", "hnet", "byte-level" y "beetle-hnet", lo que apunta a un modelo orientado a la investigación sobre tokenización dinámica y procesamiento de secuencias a nivel de byte en lugar de tokens subpalabra convencionales.

El entrenamiento se realizó con el script `legacy/tier1/train.py`. Según la model card, el entrenador heredado no conservó el estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. Se retuvo un único checkpoint en la rama `step-5000` (paso 5000), con `model.safetensors` y `config.json` que incluye la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (para restaurar pesos atados mediante `sd[dst] = sd[src]`). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre representaciones de bytes en lugar de tokens subpalabra, lo que en principio permite manejar cualquier secuencia de bytes sin vocabulario cerrado.
- Tokenización dinámica por chunks: las etiquetas del autor indican capacidades de "dynamic-chunking", orientadas a la segmentación adaptativa de secuencias.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha confirmado soporte de agentes.
- Capacidades multilingües: no disponibles (el sufijo "en" sugiere orientación al inglés, sin confirmación).
- No se documentan capacidades especiales como modo de razonamiento explícito, visión o audio.

## Casos de uso

- Investigación en tokenización alternativa: el modelo sirve como referencia para experimentos que comparan tokenización a nivel de byte frente a tokenización subpalabra, permitiendo medir diferencias en fronteras de segmentación mediante las sondas FLORES+ publicadas en `AdaptiveChunking/hnet-chunking-probes`.
- Reproducción de experimentos: dado que se documenta el script de entrenamiento (`legacy/tier1/train.py`), el checkpoint del paso 5000 y el mapa de pesos atados, es adecuado para reproducir y verificar resultados de la línea de investigación beetle-hnet.
- Punto de comparación en estudios de chunking dinámico: al ser una ejecución "baseline", permite contrastar variantes posteriores del mismo proyecto dentro de `hnet-chunking-pilots`.
- Análisis de fronteras de segmentación: las sondas FLORES+ asociadas permiten evaluar cómo el modelo segmenta texto multilingüe a nivel de byte, útil para estudiar comportamiento en límites de palabra y frase.
- Docencia y experimentación académica: su tamaño reducido (22,5 M de parámetros) y licencia Apache 2.0 lo hacen apto para prácticas de laboratorio sobre arquitecturas H-Net y procesamiento a nivel de byte.
- Base para fine-tuning experimental: al ser un modelo pequeño con pesos safetensors, puede servir como punto de partida para ajustes en tareas de investigación controladas, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, en precisión FP32 los pesos ocupan aproximadamente 90 MB; en FP16, unos 45 MB; en cuantización de 8 bits, unos 23 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente en teoría; no se especifican requisitos oficiales.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La librería declarada es PyTorch, por lo que la carga requeriría código propio o el script del repositorio beetle-hnet. La ausencia de formatos GGUF u ONNX limita el despliegue directo en herramientas estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. El modelo pertenece a una línea de investigación muy específica (H-Net a nivel de byte con chunking dinámico) y no se han publicado datos de rendimiento que permitan contrastarlo con alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni ninguna otra métrica, por lo que no puede evaluarse su calidad objetivamente.
- Información de entrenamiento incompleta: se desconoce el volumen de datos, su composición y si se aplicaron técnicas de alineación (RLHF, DPO). Esto impide anticipar sesgos.
- Riesgo de alucinación: no evaluado. Al ser un modelo pequeño y de investigación, es probable que su factualidad sea limitada, pero no hay datos que lo confirmen.
- Idiomas: no se especifican idiomas soportados. El sufijo "en" sugiere inglés, pero no está confirmado ni se documenta cobertura multilingüe.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar usos con secuencias largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado, lo que indica que no ha sido validado por la comunidad.
- Pesos atados: la restauración de pesos requiere aplicar el mapa `tied_weights` del `config.json`; ignorarlo puede producir una carga incorrecta del modelo.
- Sin estado del optimizador: no es posible reanudar el entrenamiento desde el checkpoint sin reconstruir el estado, ya que el entrenador heredado no lo guardó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/baseline_en
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio de origen de los pesos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
