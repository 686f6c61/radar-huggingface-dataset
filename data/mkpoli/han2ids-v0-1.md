# mkpoli/han2ids-v0.1

## Resumen

han2ids v0.1 es un modelo de visión por computador desarrollado por mkpoli que resuelve una tarea muy específica dentro del procesamiento de lenguas CJK: leer la secuencia de descripción ideográfica (IDS, *Ideographic Description Sequence*) de una imagen de glifo han. Dado un recorte de un carácter chino, japonés o coreano renderizado en una tipografía serif Mincho o Song, el modelo predice la cadena IDS que describe su composición estructural (por ejemplo, qué componentes lo forman y cómo se combinan). Es una herramienta de apoyo para OCR estructural, ingeniería de fuentes y análisis de caracteres raros o no codificados en Unicode.

El modelo es deliberadamente pequeño: 35,2 millones de parámetros, con un codificador ViT-S/16 y cuatro capas de decodificador transformer. Esto lo hace ejecutable en CPU y en GPUs de consumo con un coste mínimo, lo que encaja con su uso como utilidad de línea de comandos dentro de pipelines de procesamiento de fuentes. La versión 0.1 es el primer checkpoint publicado; el propio autor indica que la versión 0.2 es la actual y recomienda usarla salvo que se necesite esta línea base.

La relevancia es de nicho pero clara: los IDS son el mecanismo estándar para describir caracteres han no codificados o para indexar glifos por estructura, y extraerlos automáticamente a partir de imágenes de glifos ahorra trabajo manual en proyectos de tipografía, diccionarios y bases de datos de caracteres. El alcance está restringido a caras serif (Mincho y Song), lo que conviene tener en cuenta antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S/16 (codificador) + 4 capas de decodificador transformer |
| Parámetros totales | 35,2 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia de salida: 48 tokens) |
| Tipos de cuantización | no disponible (checkpoint en precisión original) |
| Idiomas soportados | zh, ja, ko |
| Licencia | MIT (código); pesos derivados de Noto Serif CJK JP (SIL OFL 1.1) y Jigmo (CC0 1.0) |
| Formato de pesos | state dict de PyTorch (`.pt`) con `itos` y `args` |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder compacto: un ViT-S/16 procesa la imagen del glifo y un decodificador transformer de cuatro capas genera la secuencia IDS token a token. El vocabulario es a nivel de carácter con 10.402 tokens y una longitud máxima de 48. La decodificación es greedy y aplica una máscara basada en la pila de operandos de IDS, lo que restringe las secuencias generadas a estructuras sintácticamente válidas según las reglas de composición de IDS. Este sesgo estructural explica la diferencia entre la precisión exacta y la validez sintáctica de las salidas.

El entrenamiento se realizó sobre 85.776 imágenes procedentes de la exportación de composición serif (Noto Serif CJK JP y Jigmo), durante ocho épocas. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO ni sobre la composición exacta del dataset más allá de esas fuentes tipográficas. Los pesos se distribuyen como un state dict que debe cargarse con `han2ids.infer.Han2IDS`.

## Capacidades

- Lectura de IDS a partir de imágenes de glifos han renderizados en caras serif Mincho y Song.
- Generación de secuencias IDS restringidas a estructuras válidas mediante máscara de pila de operandos.
- Cobertura de caracteres chinos, japoneses y coreanos (zh, ja, ko) en el ámbito de las fuentes serif.
- Ejecución ligera en CPU o GPU de consumo por su tamaño reducido.
- Integración como utilidad de línea de comandos (`han2ids glyph.png --checkpoint ...`).
- No soporta tool calling, agentes, visión general, audio ni modos de razonamiento extendido.

## Casos de uso

- Indexación estructural de glifos: procesar lotes de imágenes de caracteres y almacenar su IDS para construir índices de búsqueda por componentes, útil en diccionarios y bases de datos de caracteres han.
- Análisis de fuentes tipográficas: extraer la estructura de glifos de una fuente serif para auditar la coherencia de componentes entre caracteres y detectar glifos mal compuestos.
- Apoyo a OCR de caracteres raros: cuando un OCR convencional falla en un carácter poco frecuente o no codificado, el IDS permite identificarlo por su composición y mapearlo a un carácter conocido.
- Documentación de caracteres no codificados en Unicode: generar descripciones IDS automáticas para glifos que aún no tienen punto de código asignado.
- Enriquecimiento de corpus lingüísticos: añadir metadatos estructurales a colecciones de texto CJK para tareas de análisis morfológico o lexicográfico.
- Herramienta de control de calidad en pipelines de renderizado: verificar que los glifos generados por un motor tipográfico se corresponden con la estructura esperada del carácter.

## Benchmarks y rendimiento

| Test | IDS exacto | IDS válido |
|---|---:|---:|
| 4.839 caracteres serif | 80,10 % | 99,98 % |
| 8.730 filas de fuentes mixtas | 74,27 % | 100 % |

Desglose por fuente en las filas de fuentes mixtas: Noto 92,15 %, IPAmj 84,32 %, Jigmo 63,47 %. El modelo es notablemente más débil en Jigmo, y el propio autor señala que v0.2 mejora en esa fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 35,2 M de parámetros en FP32 (unos 140 MB de pesos), más el coste de activaciones del ViT-S/16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU para uso por lotes de pequeño volumen.
- Opciones de despliegue: el paquete oficial `han2ids` (instalable desde GitHub) con checkpoint `.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia por imagen en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| han2ids v0.1 | 35,2 M | imagen de glifo a IDS | salida máx. 48 tokens | MIT (código) | Hugging Face |
| han2ids v0.2 | no disponible | imagen de glifo a IDS | no disponible | MIT (código) | Hugging Face |
| Otros modelos de IDS desde imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La alternativa directa es la versión 0.2 del mismo autor, que según la model card es la actual y supera a v0.1 en Jigmo. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Alcance restringido a caras serif Mincho y Song; las caras Kai, manuscritas y sans quedan fuera de la distribución de entrenamiento.
- Requiere renders limpios con caja em (em-box); recortes ajustados y escaneos degradan el rendimiento.
- Precisión exacta limitada: 80,10 % en caracteres serif y 74,27 % en fuentes mixtas, con caída acusada en Jigmo (63,47 %).
- La validez sintáctica de la salida (99,98-100 %) no garantiza que el IDS sea el correcto; puede producir secuencias válidas pero erróneas.
- v0.1 es inferior a v0.2 en Jigmo; el autor recomienda v0.2 salvo que se necesite esta línea base.
- Los pesos derivan de Noto Serif CJK JP (SIL OFL 1.1) y Jigmo (CC0 1.0); las fuentes y etiquetas conservan sus propios términos, que deben revisarse en `NOTICE.md` y `LICENSE` antes de uso comercial.
- Riesgo de alucinación estructural: el modelo puede generar componentes plausibles pero incorrectos en glifos atípicos o poco representados.
- No apto para OCR general de texto ni para reconocimiento de caracteres completos; su función es exclusivamente la descripción estructural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkpoli/han2ids-v0.1
- Versión actual (v0.2): https://huggingface.co/mkpoli/han2ids-v0.2
- Repositorio de código y pipeline de entrenamiento: https://github.com/mkpoli/han2ids
