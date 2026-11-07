# handyshed/lark-punctuation

## Resumen

Lark punctuation es un modelo de restauración de puntuación en inglés derivado de `oliverguhr/fullstop-punctuation-multilingual-base`, un transformer de tipo encoder con clasificación por token. Lo publica el desarrollador handyshed como componente interno de Lark, una aplicación nativa de dictado para macOS, y su función concreta es reinsertar los signos `.`, `,` y `?` en la salida de sistemas de reconocimiento automático del habla (ASR) que transcriben sin puntuación. No es un modelo de propósito general: es un artefacto de producción optimizado para ejecutarse en el Neural Engine de Apple.

La aportación técnica principal no es el entrenamiento, sino la compresión y el empaquetado. El autor aplica una poda de vocabulario (de 250 002 a 40 000 entradas) y exporta el modelo a CoreML en fp16 con una forma fija de 512 tokens, reduciendo el tamaño de descarga de 1060 MB a aproximadamente 235 MB y los parámetros de 278M a 116M. Según la model card, la poda no altera la calidad de forma significativa dentro del ruido estadístico de su benchmark.

Es relevante para desarrolladores que necesiten puntuar transcripciones en inglés en hardware Apple con latencia baja y sin dependencia de servicios en la nube. Fuera de ese contexto —otros idiomas, otras plataformas o GPUs— su utilidad es limitada, ya que el vocabulario podado descarta la mayor parte de las piezas no latinas y el formato CoreML no es portable a otros runtimes sin conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de XLM-R base, clasificación por token) |
| Parámetros totales | 116M (tras poda; el checkpoint original tenía 278M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens, forma fija |
| Tipos de cuantización | fp16 (exportación CoreML ML Program) |
| Idiomas soportados | inglés (el modelo base es multilingüe, pero esta versión no se evaluó fuera del inglés) |
| Licencia | MIT |
| Formato de pesos | CoreML `.mlmodelc` compilado, más tokenizer XLM-R SentencePiece con ids remapeados |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `oliverguhr/fullstop-punctuation-multilingual-base` (revisión `fe99fb0dc8d8be674e8bb4e39833605f9a1af651`), que a su vez procede del trabajo FullStop de Guhr et al. (Swiss Text Analytics Conference 2021). La tarea es clasificación por token: cada token recibe una etiqueta de puntuación (`.` , `,`, `?`, además de `-` y `:` heredados del modelo base, que Lark ignora). No hay información disponible sobre el volumen de datos de entrenamiento original ni sobre si se aplicó RLHF o DPO; el autor de esta ficha no reporta reentrenamiento, solo poda y exportación.

La innovación está en el pipeline de compresión descrito en `research/experiments/prune_punctuation_vocab.py` del repositorio Lark. Primero se tokeniza el corpus de dictado en inglés de Lark (excluyendo un 20 % reservado para evaluación) y se registran los ids realmente usados. Después se conservan esos ids más las piezas de escritura latina con mayor puntuación hasta llegar a 40 000 entradas, se recorta la matriz de embeddings y se reescribe `tokenizer.json` con los nuevos índices. La exportación se hace con coremltools como ML Program fp16 a forma fija de 512 tokens, porque las variantes de forma flexible o enumerada no se ejecutan en el Neural Engine. La verificación compara las etiquetas argmax de CoreML con el modelo podado en PyTorch sobre 50 frases (3666/3666 tokens coincidentes). El tokenizer y el modelo son un par inseparable: los ids del tokenizer indexan la tabla de embeddings podada y no funcionan con el checkpoint original.

## Capacidades

- Restauración de puntuación en inglés: inserta puntos, comas e interrogaciones en texto sin puntuar procedente de ASR.
- Clasificación por token sobre secuencias de hasta 512 tokens con forma fija.
- Ejecución en el Apple Neural Engine mediante CoreML, sin GPU dedicada.
- Descarga verificada por integridad: el repositorio incluye `manifest.json` con tamaños y sha256 de cada archivo.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible en la práctica; el vocabulario podado elimina la mayoría de piezas no latinas y el autor advierte de resultados degradados fuera del inglés.

## Casos de uso

- Puntuación de transcripciones de dictado en macOS: la aplicación Lark descarga el modelo en el primer arranque y lo ejecuta sobre la salida del ASR para insertar `.`, `,` y `?`, aprovechando el Neural Engine para no consumir GPU ni batería de forma apreciable.
- Postprocesado de subtítulos generados automáticamente: un pipeline que reciba texto plano de un motor ASR en inglés puede segmentarlo en bloques de 512 tokens y aplicar el modelo para mejorar la legibilidad antes de publicar.
- Limpieza de notas de reuniones transcritas: integrar el modelo en una herramienta interna que convierta actas sin puntuar en texto legible, siempre que el contenido sea en inglés y el hardware sea Apple.
- Prototipado de apps de accesibilidad: aplicaciones de voz a texto para usuarios con movilidad reducida que necesiten salida puntuada en dispositivos Apple sin conexión a internet.
- Evaluación comparativa de motores ASR: usar el modelo como capa de normalización común para medir la calidad de distintos motores de reconocimiento tras aplicar la misma puntuación.
- Distribución offline en entornos con restricciones de red: al pesar unos 235 MB y ejecutarse localmente, encaja en despliegues donde no se permite enviar audio ni transcripciones a servicios externos.

## Benchmarks y rendimiento

Los únicos datos publicados son de precisión y recall a nivel de palabra sobre el benchmark interno de Lark (787 enunciados en inglés), comparando el modelo base con el podado, en el conjunto completo y en la partición reservada.

| Etiqueta | Base, completo | Podado, completo | Base, reservado | Podado, reservado |
|---|---|---|---|---|
| `.` | 58,8 / 78,3 (n=1758) | 58,8 / 78,3 (n=1758) | 56,1 / 77,7 (n=336) | 56,2 / 77,4 (n=336) |
| `,` | 49,4 / 59,9 (n=1990) | 49,3 / 59,9 (n=1990) | 53,2 / 62,5 (n=381) | 52,9 / 62,5 (n=381) |
| `?` | 74,8 / 63,5 (n=819) | 74,8 / 63,5 (n=819) | 70,4 / 56,6 (n=143) | 70,4 / 56,6 (n=143) |
| todas | 54,8 / 67,6 (n=4567) | 54,8 / 67,6 (n=4567) | 54,7 / 67,4 (n=860) | 54,6 / 67,3 (n=860) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que la tarea no es generativa.

## Requisitos de hardware

- Inferencia en el Apple Neural Engine; no requiere VRAM de GPU dedicada.
- Tamaño en disco: aproximadamente 235 MB de descarga total (modelo compilado, tokenizer y manifiesto).
- No cabe plantearse su uso en GPUs NVIDIA (A100, H100, RTX 4090) sin convertir el modelo a otro formato; el artefacto publicado es CoreML.
- Despliegue previsto: integración nativa en apps macOS mediante CoreML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| handyshed/lark-punctuation | 116M (podado) | 512 tokens fijos | inglés | MIT | CoreML fp16 |
| oliverguhr/fullstop-punctuation-multilingual-base | 278M | no disponible | multilingüe | MIT | safetensors/PyTorch |
| oliverguhr/fullstop-punctuation-multilingual-large | no disponible | no disponible | multilingüe | MIT | safetensors/PyTorch |

La comparación directa con alternativas de otros ecosistemas no está disponible en la información proporcionada. Frente a su modelo base, la versión de Lark sacrifica cobertura multilingüe y portabilidad a cambio de un 58 % menos de parámetros y un 78 % menos de tamaño de descarga, con calidad equivalente en inglés según el benchmark del autor.

## Limitaciones y advertencias

- Solo se ha evaluado en inglés; el vocabulario podado degrada el rendimiento en otros idiomas del modelo base.
- La precisión y el recall son moderados (54,8 / 67,6 global en el conjunto completo), por lo que se esperan errores frecuentes en comas y en interrogaciones.
- El modelo emite las etiquetas `-` y `:` heredadas del modelo base; el consumidor debe filtrarlas explícitamente.
- La forma de entrada es fija a 512 tokens, lo que obliga a segmentar textos largos y puede cortar frases a mitad.
- El tokenizer está acoplado a la tabla de embeddings podada; mezclarlo con el checkpoint original produce resultados incorrectos.
- El formato CoreML limita el uso a plataformas Apple; no hay pesos en safetensors ni GGUF en este repositorio.
- No se han publicado análisis de sesgos ni evaluaciones de robustez fuera del benchmark interno.
- Riesgo de alucinación bajo en sentido generativo, pero puede insertar puntuación donde no corresponde en habla con pausas atípicas o ruido.
- Licencia MIT: permite uso comercial, pero exige mantener la atribución al trabajo original de Guhr et al. (2021).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handyshed/lark-punctuation
- Modelo base: https://huggingface.co/oliverguhr/fullstop-punctuation-multilingual-base
- Repositorio de la aplicación Lark: https://github.com/handyshed/Lark
- Referencia del paper FullStop (Guhr et al., 2021), citada en la model card; no se proporciona URL directa en la información disponible.
- guidance-lark-mcp en PyPI (herramienta no relacionada con este modelo, mencionada en los resultados de búsqueda): https://pypi.org/project/guidance-lark-mcp/
