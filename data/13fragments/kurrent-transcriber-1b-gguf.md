# 13fragments/kurrent-transcriber-1b-GGUF

## Resumen

Kurrent Transcriber 1B es un modelo de transcripción de texto manuscrito histórico alemán (OCR/HTR) desarrollado por 13fragments. Toma como entrada la imagen de una página y devuelve el texto línea a línea tal y como aparece escrito, especializándose en escrituras alemanas históricas como Kurrent, Sütterlin y variantes relacionadas. El modelo base es LightOnOCR-3-1B, sobre el que se ha realizado un merge con LightOnOCR-HGH de Bernhard Straub para adaptarlo al dominio del manuscrito histórico alemán.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF para llama.cpp, publicada el 18 de noviembre de 2026. Se distribuye en dos ficheros: el modelo de lenguaje en 8 bits (`text-q8_0.gguf`, 639 MB) y el codificador visual más la proyección (`mmproj-bf16.gguf`, 829 MB). El modelo real cuenta con 596.049.920 parámetros según los safetensors del repositorio base, y el repositorio GGUF ocupa 1,5 GB.

Es relevante porque permite ejecutar localmente, incluso sin GPU NVIDIA (por ejemplo en un Mac), un sistema especializado de transcripción de manuscritos históricos alemanes. El autor advierte explícitamente de que la salida es un borrador que debe revisarse línea a línea contra el escaneo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual y proyección), según pipeline image-text-to-text; detalles internos no disponibles |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración del smoke test de llama.cpp) |
| Tipos de cuantización | Q8_0 para el modelo de lenguaje; bf16 para el codificador visual y proyección |
| Idiomas soportados | Alemán (de) |
| Licencia | CC BY-SA 4.0 (modelo base LightOnOCR-3-1B bajo Apache 2.0) |
| Formato de pesos | GGUF (`text-q8_0.gguf`, `mmproj-bf16.gguf`) |

## Arquitectura y entrenamiento

El modelo es multimodal de tipo image-text-to-text: combina un modelo de lenguaje con un codificador visual y una proyección que conecta ambos. La versión GGUF reutiliza el fichero de lenguaje publicado de LightOnOCR-HGH sin cambios (ambos padres del merge comparten el modelo de lenguaje del modelo base) y genera el fichero de visión a partir de los pesos fusionados del repositorio principal con `convert_hf_to_gguf.py --mmproj --outtype bf16` (commit `cd959bae9`). El codificador visual se guarda en bf16 porque la model card de LightOnOCR-HGH informa de que su encoder de visión desborda en f16 sobre CUDA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El modelo base, LightOnOCR-3-1B, procede de LightOn, y la adaptación al manuscrito histórico alemán proviene de LightOnOCR-HGH de Bernhard Straub, sobre cuyos detalles de entrenamiento la información proporcionada no aporta datos. El cliente oficial `kurrent-transcribe` aplica un preprocesado de imagen y un postprocesado de salida, con decodificación a `temperature` 0, máximo 4096 tokens y penalización de repetición 1.1 sobre los últimos 20 tokens.

## Capacidades

- Transcripción de texto manuscrito histórico alemán: Kurrent, Sütterlin y manos relacionadas.
- Entrada de imagen de página completa y salida de texto línea a línea.
- Reconocimiento de texto impreso y manuscrito en documentos históricos (tags ocr y htr).
- Funcionamiento conversacional a través de endpoints compatibles (`endpoints_compatible`).
- Ejecución local vía llama.cpp, con soporte de CPU y de Apple Silicon además de CUDA.
- No se documenta soporte de tool calling, function calling, agentes, ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al alemán.

## Casos de uso

- Digitalización de archivos históricos alemanes: procesar páginas de registros parroquiales, actas notariales o correspondencia en Kurrent y obtener un borrador de transcripción que un paleógrafo revisa contra el escaneo.
- Proyectos de Wikisource y transcripción colaborativa: el modelo se evaluó precisamente sobre páginas de Wikisource, por lo que encaja como primer paso de un flujo de transcripción con revisión humana.
- Investigación genealógica: transcribir documentos manuscritos familiares o archivos locales en Sütterlin para hacerlos buscables.
- Preservación digital en bibliotecas y archivos: generar texto indexable a partir de fondos manuscritos, aceptando la revisión manual obligatoria por los errores en nombres, lugares y fechas.
- Despliegue en equipos sin GPU dedicada: al ejecutarse con llama.cpp en CPU o Apple Silicon (24 segundos por página de mediana en un M1 Pro), sirve para digitalización de bajo volumen en estaciones de trabajo convencionales.
- Integración en aplicaciones de lectura: el cliente `kurrent-transcribe` y la app de lectura de 13fragments permiten incorporar la transcripción a herramientas de consulta de documentos históricos.
- Procesamiento por lotes de colecciones: con `llama-server` y contexto de 8192 tokens se pueden encadenar páginas en un pipeline local, dividiendo previamente los pliegos de dos páginas en páginas individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estos ficheros GGUF. La model card indica que los resultados del repositorio principal provienen del motor vLLM y que los ficheros GGUF no tienen resultado de benchmark propio. Los datos de validación disponibles son:

| Prueba | Resultado |
|---|---|
| Diferencia media de `cer_norm` frente a LightOnOCR-HGH (40 páginas de desarrollo de Wikisource, llama.cpp) | +0.019, intervalo del 95 % [−0.023, +0.087]; mediana −0.006 |
| Límite fijado antes de la prueba | Extremo superior por debajo de +0.02; la prueba no lo cumplió y 13fragments lo eximió para su app de lectura |
| Diferencia media de `cer_norm` con vLLM en las mismas páginas | +0.020 (el desfase atribuido al modelo, no a llama.cpp) |
| Prueba de humo (8 páginas públicas, ICFHR 2016 y Bullinger) | Similitud media de 0.93 respecto al texto de vLLM (mínimo 0.86); todas las páginas transcritas |
| Consistencia entre dos sesiones de vLLM (prueba de humo del paquete principal) | 0.998 |
| Latencia en Apple M1 Pro | 24 segundos por página (mediana) |

## Requisitos de hardware

- VRAM estimada: no medida en la prueba de humo (el autor indica que no se midió el pico de memoria). Los ficheros suman aproximadamente 1,47 GB en disco (639 MB + 829 MB).
- GPU recomendadas: no se especifican modelos concretos; el codificador visual se guarda en bf16 porque desborda en f16 sobre CUDA.
- Compatibilidad con GPU de consumo: el tamaño de los pesos (menos de 1,5 GB) sugiere que cabe en GPUs de consumo, aunque no se aportan cifras de VRAM medidas.
- Ejecución sin GPU NVIDIA: sí, por ejemplo en un Mac (probado en Apple M1 Pro).
- Despliegue: `llama-server` de llama.cpp (versión 0.9.0, build 12110, commit `cd959bae9`), con los dos ficheros y los parámetros `-c 8192 -np 1 -ngl 99 --cache-ram 0 --ctx-checkpoints 0 --no-webui`. Cliente oficial `kurrent-transcribe` 1.2.0 o superior.
- Latencia: 24 segundos por página de mediana en Apple M1 Pro. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kurrent Transcriber 1B GGUF (este) | 596.049.920 | 8192 | GGUF (Q8_0 + bf16) | CC BY-SA 4.0 | Cuantizado para llama.cpp; sin benchmark propio |
| Kurrent Transcriber 1B (base) | 596.049.920 | No disponible | Safetensors | CC BY-SA 4.0 | Resultados de benchmark medidos con vLLM |
| LightOnOCR-HGH | No disponible | No disponible | No disponible | No disponible | Modelo de Straub sobre el que se basa el merge; referencia de la comparación de `cer_norm` |
| LightOnOCR-3-1B | No disponible | No disponible | No disponible | Apache 2.0 | Modelo base original de LightOn |

## Limitaciones y advertencias

- La salida es un borrador: el autor exige revisar cada línea contra el escaneo.
- Nombres propios, lugares y fechas se leen mal con frecuencia.
- Repeticiones de página completa: a veces el modelo escribe toda la página dos veces; hay que comprobar las respuestas largas.
- Pliegos de dos páginas: en una doble página ancha puede omitir un bloque de texto; conviene dividirlas en páginas individuales.
- Sellos junto a cartas de color: el paso de imagen puede eliminar sellos de biblioteca escritos junto a cartas de color; esta puerta de desarrollo falló y fue eximida.
- La prueba de desarrollo de `cer_norm` no cumplió el límite fijado (extremo superior por debajo de +0.02) y fue eximida por 13fragments para su app de lectura.
- La decodificación directa contra `llama-server` no aplica los pasos de imagen y salida del cliente oficial, por lo que la salida puede diferir.
- Diferencias frente a vLLM: llama.cpp escala cada imagen a 1540 píxeles en su lado más largo y su ventana de penalización solo contiene tokens generados.
- Licencia CC BY-SA 4.0: las pesos adaptados deben compartirse bajo la misma licencia; el modelo base LightOnOCR-3-1B es Apache 2.0.
- Idioma limitado al alemán; sin datos sobre sesgos más allá de los errores de lectura documentados.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF
- Modelo base: https://huggingface.co/13fragments/kurrent-transcriber-1b
- LightOnOCR-HGH (Bernhard Straub): https://huggingface.co/b-straub/LightOnOCR-3-1B-Historic-German-Handwriting
- Cliente de inferencia: https://huggingface.co/13fragments/kurrent-transcriber-1b/tree/main/inference
- Checksums: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/LICENSE
- Licencia del modelo base (Apache 2.0): https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/LICENSE-APACHE-2.0
- Aviso legal: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/NOTICE
- Archivo Zenodo: https://doi.org/10.5281/zenodo.24342061
