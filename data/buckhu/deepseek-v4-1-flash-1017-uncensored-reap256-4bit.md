# BUCKHU/DeepSeek-V4.1-Flash-1017-Uncensored-REAP256-4bit

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-REAP256-4bit es una redistribución podada y «abliterada» de DeepSeek V4.1 Flash 1017, publicada por el usuario BUCKHU. Parte de `pqhaz/DeepSeek-V4.1-Flash-1017-heretic`, una versión a la que se eliminó la dirección de rechazo en 38 tensores de atención, y le aplica REAP (poda de expertos) para conservar 256 de los 384 expertos enrutados de cada capa. El objetivo declarado es encajar el modelo en cuatro GPU de 64 GB (256 GB de VRAM) más 256 GB de RAM de sistema, sin recuantizar ningún peso: los expertos enrutados siguen en MXFP4 de DeepSeek y las capas densas y tablas Engram en FP8.

El resultado ocupa 414,0 GB en total (210,9 GB en este repo y 203,1 GB de tablas Engram que se descargan del repositorio oficial de DeepSeek), mantiene el contexto de 1.048.576 tokens, la torre de visión y las 3 capas draft MTP/DSpark, y se ha probado con vLLM (backport SM80) sobre A100 y CMP 170HX, y con SGLang sobre RTX PRO 6000. La poda tiene coste medible: mantiene AIME 2025 y HMMT sin pérdida estadísticamente significativa, pero cae 11,6 puntos en GPQA Diamond y 6,9 puntos en Humanity's Last Exam frente al modelo sin podar.

Es relevante por dos motivos: documenta con medición propia el coste real del pruning de expertos en un MoE de gama frontera, y demuestra un despliegue de 1M de contexto sobre hardware de minería reacondicionado (CMP 170HX), aunque el propio autor lo describe como solución puente y no como destino final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE): 384 expertos enrutados por capa (256 conservados tras REAP), expertos compartidos, 3 capas draft MTP/DSpark, torre de visión y tablas Engram |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | MXFP4 (4 bits) en expertos enrutados; FP8 en capas densas y tablas Engram; sin recuantización respecto al modelo base |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (46 de 48 shards en este repo; los 2 restantes son tablas Engram del repo oficial de DeepSeek) |
| Tamaño total de pesos | 414,0 GB (210,9 GB en este repo + 203,1 GB de tablas Engram) |
| Modelo base | pqhaz/DeepSeek-V4.1-Flash-1017-heretic (revisión 12d58ad0) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El autor no entrena ningún modelo: hereda los pesos de DeepSeek V4.1 Flash 1017 (vía el build «heretic» de pqhaz) y solo poda y redistribuye. La arquitectura es un transformer de mezcla de expertos con 384 expertos enrutados por capa, expertos compartidos, router, 3 capas draft MTP/DSpark para decodificación especulativa, torre de visión y tablas Engram (tablas de búsqueda en FP8, 203,1 GB) que no se duplican en este repositorio porque son idénticas a las de DeepSeek. La intervención de «uncensoring» del modelo base consistió en eliminar la dirección de rechazo de 38 tensores de atención. No hay información disponible sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

La poda aplicada es REAP con ranking por media: se conservan 256 de 384 expertos enrutados por capa, y se mantienen intactos atención, expertos compartidos, las filas del router correspondientes a los expertos conservados, las 3 capas draft, la torre de visión, el tokenizer y las tablas Engram. El criterio de selección de expertos combinó calibración genérica con las respuestas del propio modelo sin podar en 9 dominios; según la model card, un corte previo basado solo en texto genérico, código y chat hacía caer la aritmética de negocio al 90,6 % (frente al 99 % del modelo sin podar) y elevaba los rechazos a 63 de 100 marcados (frente a 45); con la calibración ampliada se obtiene 100 % en aritmética de negocio y 52 rechazos, dentro del ruido del modelo sin podar. La ingeniería (poda, pruebas, optimización y la propia model card) fue realizada por agentes de código de Anthropic (Claude Code), según declara el autor.

## Capacidades

- Generación de texto y razonamiento extendido con modo «thinking» configurable: las evaluaciones se ejecutaron con esfuerzo 75 sobre la escala de DeepSeek, tope de 12.000 tokens de pensamiento y 16.000 tokens de respuesta.
- Razonamiento matemático de competición: AIME 2025 (89,2) y HMMT febrero 2025 (90,8) al nivel del modelo sin podar.
- Aritmética de negocio: 100 % en el dev set citado por el autor tras la recalibración del ranking de expertos.
- Multimodalidad image-text-to-text: la torre de visión se conserva sin modificar; no se publican benchmarks de visión en la información disponible.
- Contexto largo real: 1.048.576 tokens, con dos conversaciones simultáneas de ~1M de tokens medidas en A100 limitadas a 64 GiB por tarjeta.
- Multilingüe limitado a inglés y chino; el resto de idiomas se degrada con la poda según el propio autor.
- Ausencia de alineación de rechazo: dirección de rechazo eliminada en 38 tensores de atención del modelo base.
- Decodificación especulativa mediante las 3 capas draft MTP/DSpark conservadas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte explícito de agentes o multi-step reasoning más allá del modo thinking: no documentado en la información disponible.

## Casos de uso

- Análisis de corpus documentales completos: con 1M de tokens de ventana se puede cargar un expediente, una base de contratos o un repositorio de documentación entero en una sola pasada, sin troceado ni recuperación intermedia, y hacer preguntas cruzadas sobre todo el material.
- Dos sesiones concurrentes de contexto máximo: el autor midió dos conversaciones de ~1M de tokens a la vez sobre 4 x A100 limitadas a 64 GiB por tarjeta, lo que habilita servir dos flujos de trabajo largos en el mismo nodo sin cola.
- Tutoría y verificación de problemas de matemáticas de competición: los 89,2 en AIME 2025 y 90,8 en HMMT lo sitúan al nivel del modelo sin podar para generar y comprobar demostraciones paso a paso.
- Automatización contable y de facturación: la aritmética de negocio al 100 % en el dev set del autor lo hace utilizable para extracción de importes, conciliación y cálculos sobre documentos, con verificación humana en producción.
- Procesamiento de documentos escaneados e imágenes: el pipeline image-text-to-text y la torre de visión intacta permiten descripción de imágenes, lectura de formularios y extracción de campos, aunque sin benchmarks públicos de visión.
- Investigación en seguridad y red-teaming: al carecer de dirección de rechazo, sirve para estudiar comportamientos sin filtro, medir la eficacia de mecanismos de alineación y construir clasificadores de contenido frente a un modelo deliberadamente no alineado.
- Despliegue on-premise en hardware reacondicionado: el caso declarado por el autor es un nodo de 4 x CMP 170HX (A100 recortadas, 64 GB cada una, x16 y refrigeración líquida) para tener un modelo frontera sin censura en casa, con la advertencia de que es una solución puente.
- Base para experimentos de poda: al publicar el protocolo, los dev sets y las comparaciones contra el modelo sin podar, sirve como referencia para investigar el impacto de REAP en MoE de gran tamaño.

## Benchmarks y rendimiento

Evaluaciones realizadas los días 17 y 18 de octubre de 2026 sobre 4 x RTX PRO 6000 con SGLang, con los mismos ítems congelados para todos los modelos, muestreo propio de cada fabricante, thinking en el punto medio de la escala (DeepSeek esfuerzo 75, Qwen «medium»), tope de 12.000 tokens de pensamiento y 16.000 de respuesta. Los intervalos pareados del 95 % cubren solo la elección de ítem (una muestra por ítem).

| Test | Sin podar (384 expertos) | Este modelo (256 expertos) | Qwen (referencia) | Veredicto |
|---|---|---|---|---|
| AIME 2025 (30 problemas x 4 ejecuciones) | 91,7 | 89,2 | 76,7 | sin pérdida medible (p = 0,45) |
| HMMT febrero 2025 (30 x 4) | 87,5 | 90,8 | 68,3 | sin pérdida medible (p = 0,39) |
| GPQA Diamond (198) | 90,4 | 78,8 | 86,4 | pérdida (p < 0,001) |
| Humanity's Last Exam, solo texto (217 ítems) | 29,5 | 22,6 | 16,6 | pérdida (p = 0,017) |

La versión de Qwen empleada como referencia de escala no se especifica en la model card. La tabla de resultados de la información disponible está truncada tras la cuarta fila, por lo que no se pueden reproducir aquí las métricas adicionales (por ejemplo, el recuento de rechazos en la comparativa completa). No hay benchmarks publicados de visión, latencia ni throughput.

## Requisitos de hardware

- VRAM: 4 GPU de 64 GB cada una (256 GB en total) con tensor parallelism 4; a TP4 cada tarjeta recibe 51,2 GiB de pesos.
- RAM de sistema: 256 GB para alojar las tablas Engram (203,1 GB), que se cargan desde el repo oficial de DeepSeek.
- Almacenamiento: 414,0 GB de pesos completos más margen para caché y descarga temporal de shards.
- No cabe en GPU de consumo: con 210,9 GB de shards más 203,1 GB de tablas, una RTX 4090 (24 GB) o similar queda muy lejos; el mínimo práctico son 4 aceleradores de 64 GB.
- GPU probadas por el autor: A100 (vLLM con backport SM80, también usadas para la
