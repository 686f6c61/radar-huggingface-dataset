# mecha-factory/Qwen3.6-35B-A3B-Uncensored-MTP-GGUF

## Resumen

`mecha-factory/Qwen3.6-35B-A3B-Uncensored-MTP-GGUF` es una distribución en formato GGUF de un modelo de lenguaje de tipo mezcla de expertos (MoE) de 35.505.251.456 parámetros totales, derivado de la familia Qwen3.6. No se trata de un entrenamiento nuevo: el autor (mecha-factory) parte de la cuantización Q4_K_M del modelo sin censura de HauhauCS (`Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`) y le injerta la cabeza de predicción multi-token (MTP) procedente de la conversión de unsloth del modelo original, de modo que llama.cpp puede usarla como mecanismo de decodificación especulativa (`--spec-type draft-mtp`).

El interés práctico del artefacto es doble. Por un lado, elimina el trabajo manual de combinar dos GGUF de procedencias distintas: el injerto está hecho con `scripts/mtp-graft.py` (gguf 0.19.0, numpy 2.5.3), es determinista y está verificado con hash sha256, con `block_count` incrementado de 40 a 41. Por otro lado, al ser una variante "uncensored", responde a peticiones que el modelo base rechazaría, lo que la sitúa en el terreno de la investigación sobre alineación y del uso creativo sin filtros, con la responsabilidad legal que ello implica para quien la despliega.

El repositorio ocupa 21,7 GB y se publica bajo licencia Apache 2.0. No incluye el proyector visual (`mmproj`), que debe tomarse del repositorio de HauhauCS, pese a que la etiqueta de pipeline sea `image-text-to-text`. No hay datos publicados de benchmarks, longitud de contexto ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; confirmado por la etiqueta `moe` y la nomenclatura "A3B" |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | No disponible con cifra exacta; la nomenclatura "A3B" sugiere del orden de 3 mil millones activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (fichero principal); el modelo donante emplea UD-Q4_K_M; no se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`block_count` = 41); proyector visual `mmproj` en f16 disponible por separado en el repositorio de HauhauCS |
| Tamano del repositorio | 21,7 GB (fichero GGUF de 21.695.616.448 bytes) |
| Pipeline declarado | `image-text-to-text` |
| Hash sha256 del GGUF | `8290c5bae3c744a9654281358e45669e158a9af2f0a23ad2a939bcb84528204f` |
| Parametros de muestreo recomendados | `--temp 0.6 --top-p 0.95 --top-k 20 --min-p 0` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura de mezcla de expertos: 35,5 mil millones de parámetros totales con activación dispersa, según indica la nomenclatura "A3B" (del orden de 3 mil millones activos). Sobre esa base, este repositorio añade una cabeza de predicción multi-token (MTP) que ocupa el bloque `blk.40.*` y la clave `nextn_predict_layers`. La cabeza proviene de la conversión de unsloth del modelo Qwen3.6-35B-A3B original, no de un reentrenamiento: todos los tensores y claves del modelo de HauhauCS se copian byte a byte y solo se añade el bloque 41.

No hay información en la model card sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Lo único documentado respecto al ajuste es que HauhauCS "entrenó fuera" los rechazos del modelo base, sin detallar metodología ni datos. La innovación técnica destacable del repositorio es el injerto determinista de la cabeza MTP: dos construcciones independientes en máquinas distintas produjeron un fichero byte a byte idéntico. La decodificación especulativa resultante no altera las respuestas, porque cada token propuesto se verifica contra el modelo base; la cabeza, entrenada sobre el modelo original y no sobre la variante sin censura, solo afecta a la tasa de aceptación.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), siempre que se añada el proyector visual `mmproj` del repositorio de HauhauCS.
- Respuestas sin rechazos sobre contenidos que el modelo base declinaría, por el entrenamiento de des censura de HauhauCS.
- Decodificación especulativa mediante cabeza MTP integrada, compatible con llama.cpp (`--spec-type draft-mtp`).
- Razonamiento y generación de código: capacidades heredadas de la familia Qwen3.6, aunque no hay benchmarks publicados en este repositorio que las cuantifiquen.
- Soporte de tool calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Despliegue local con decodificación especulativa: servir el GGUF con `llama-server` y `--spec-type draft-mtp --spec-draft-n-max 2` permite acelerar la generación en una estación de trabajo sin reentrenar ni recuantizar, con tasas de aceptación medidas de 0,79–0,86 en Apple Metal y ~0,6 en CUDA.
- Investigación sobre alineación y rechazos: al ser una variante sin censura, sirve para estudiar qué comportamientos se eliminan al ajustar los rechazos y comparar las respuestas con las del modelo Qwen original bajo los mismos prompts.
- Instalación automatizada vía catálogo: el repositorio es el fichero que la herramienta `mecha` instala como modelo de catálogo `qwen3.6-35b-a3b-uncensored`, de modo que un usuario puede obtener un modelo MoE con MTP sin ejecutar el injerto localmente.
- Evaluación de cabezas MTP: útil como banco de pruebas para medir la tasa de aceptación de una cabeza entrenada sobre el modelo censurado cuando se aplica al modelo sin censura, y para ajustar `--spec-draft-n-max`.
- Asistencia visual básica en local: con el `mmproj` f16 añadido, se pueden hacer consultas sobre imágenes (descripción, extracción de datos) sin salir de la máquina, aunque no hay evaluación publicada de calidad en visión.
- Escritura creativa y rol sin restricciones temáticas: ficción, guiones o narrativa interactiva donde el modelo base rechazaría escenas violentas o explícitas, asumiendo la responsabilidad de contenido por parte del operador.
- Procesamiento por lotes en hardware de gama alta: al tener solo ~3 mil millones de parámetros activos, el coste por token es bajo comparado con un modelo denso de 35B, lo que lo hace apto para tareas de generación masiva en una A100 o H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni otros) en la información disponible. El único dato de rendimiento documentado es la tasa de aceptación de la decodificación especulativa con la cabeza MTP injertada:

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de aceptación MTP (Apple Metal) | 0,79–0,86 | Medición del autor sobre el injerto |
| Tasa de aceptación MTP (CUDA) | ~0,6 | Con 2 tokens propuestos (`--spec-draft-n-max 2`) |
| Impacto en la salida | Ninguno | Cada token propuesto se verifica contra el modelo base |

## Requisitos de hardware

- VRAM para los pesos: el GGUF Q4_K_M ocupa 21.695.616.448 bytes (21,7 GB), por lo que se necesita al menos esa cantidad más el espacio de caché KV y, si se usa visión, el `mmproj` f16.
- GPU de datacenter recomendadas: A100 de 40 GB o 80 GB, H100, RTX A6000 de 48 GB; el modelo cabe holgadamente y deja margen para contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda muy justa (21,7 GB de pesos dejan pocos GB para caché KV y contexto); es más cómodo con 32 GB o más, o repartiendo capas entre dos GPU.
- Despliegue: llama.cpp / `llama-server` es la vía documentada, con las opciones `--spec-type draft-mtp --spec-draft-n-max 2` y el `mmproj` si se requiere visión. El soporte de MTP en vLLM, TGI u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no se publican tokens por segundo. Cabe esperar un coste por token bajo por la activación dispersa (~3B activos), pero es una inferencia, no un dato medido del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (mecha-factory) | 35,5 B (MoE) | No disponible | Q4_K_M | Si, injertada | Apache 2.0 | Sin censura; incluye cabeza MTP lista para llama.cpp; no incluye `mmproj` |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35,5 B (MoE) | No disponible | Q4_K_M entre otras | No | Apache 2.0 | Mismo modelo sin censura, sin cabeza MTP; incluye el proyector visual |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | 35,5 B (MoE) | No disponible | UD-Q4_K_M entre otras | Si | Apache 2.0 | Conversion del modelo original con cabeza MTP; mantiene la alineacion original |
| Qwen/Qwen3.6-35B-A3B | 35,5 B (MoE) | No disponible | Safetensors y otras | No documentado | Apache 2.0 | Modelo original de Alibaba Cloud, con rechazos activos |

## Limitaciones y advertencias

- Modelo sin censura: los rechazos fueron entrenados fuera, de modo que producirá contenido que el modelo base declinaría. La responsabilidad legal y ética del uso recae enteramente en el operador.
- Riesgo de alucinación: no hay evaluación publicada; al tratarse de un ajuste de des censura sobre un modelo de ~35B, la supresión de rechazos puede aumentar la confianza en respuestas incorrectas.
- Cabeza MTP desalineada: la cabeza se entrenó sobre el modelo original, no sobre la variante sin censura; esto no altera las respuestas (hay verificación), pero reduce la tasa de aceptación en CUDA hasta ~0,6.
- Visión incompleta: el repositorio no incluye el `mmproj`; sin él, la etiqueta `image-text-to-text` no es funcional.
- Idiomas y contexto no documentados: no se puede planificar un despliegue multilingüe ni de contexto largo con garantías a partir de la información disponible.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-10-20). No hay evidencia de terceros sobre la calidad del injerto más allá del hash reproducible.
- Licencia: Apache 2.0 permite uso comercial, pero "Qwen" es una marca del modelo del que deriva y no implica respaldo del equipo de Qwen ni de Alibaba Cloud.
- El injerto solo es válido para el binario y las herramientas indicadas (gguf 0.19.0, numpy 2.5.3); reproducirlo con otras versiones puede romper la paridad byte a byte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mecha-factory/Qwen3.6-35B-A3B-Uncensored-MTP-GGUF
- Modelo base sin censura (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Donante de la cabeza MTP (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta mecha: https://github.com/ljchang/mecha
- Script de injerto MTP: https://github.com/ljchang/mecha/blob/main/scripts/mtp-graft.py
- Texto de la licencia: https://huggingface.co/mecha-factory/Qwen3.6-35B-A3B-Uncensored-MTP-GGUF/blob/main/LICENSE

Nota: la búsqueda web realizada devolvió únicamente resultados sobre el término "mecha" en el contexto de animación y ciencia ficción, sin relación con este modelo; no se han incluido por no ser relevantes.
