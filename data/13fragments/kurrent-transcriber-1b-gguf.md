# 13fragments/kurrent-transcriber-1b-GGUF

## Resumen

Kurrent Transcriber 1B GGUF es la versión cuantizada para llama.cpp de Kurrent Transcriber 1B, un modelo de reconocimiento de texto manuscrito (HTR) especializado en escritura alemana histórica: Kurrent, Sütterlin y manos relacionadas. Lo desarrolla 13fragments y deriva del modelo LightOnOCR-3-1B mediante un merge con LightOnOCR-HGH de Bernhard Straub, orientado a documentos históricos germanos. Su función concreta es recibir la imagen de una página y devolver el texto línea a línea tal como está escrito.

El modelo combina un codificador visual con un modelo de lenguaje de aproximadamente 596 millones de parámetros (el nombre comercial "1B" no coincide con el recuento real de safetensors). Se distribuye en dos ficheros GGUF: el modelo de lenguaje en 8 bits (`text-q8_0.gguf`, 639 MB) y el codificador y proyección visual en bf16 (`mmproj-bf16.gguf`, 829 MB). La ventana de contexto configurada en el ejemplo de despliegue es de 8192 tokens.

Su relevancia actual radica en que cubre un nicho poco atendido por los modelos OCR generalistas: la paleografía alemana de los siglos XVIII a XX, material abundante en archivos y bibliotecas digitalizadas. La model card advierte explícitamente de que la salida es un borrador que debe contrastarse con el escaneo, y ofrece un modo de verificación (`--check`) que marca páginas sospechosas para revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual + modelo de lenguaje (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 596.049.920 (según safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de despliegue documentada |
| Tipos de cuantizacion | GGUF Q8_0 para el modelo de lenguaje; bf16 para el proyector visual |
| Idiomas soportados | Alemán (de) |
| Licencia | CC BY-SA 4.0 (modelo base LightOnOCR-3-1B bajo Apache 2.0) |
| Formato de pesos | GGUF (`text-q8_0.gguf`, `mmproj-bf16.gguf`) |

## Arquitectura y entrenamiento

El modelo es multimodal de tipo imagen-a-texto: un codificador visual procesa la imagen de la página y un modelo de lenguaje genera la transcripción. Deriva de LightOnOCR-3-1B (Apache 2.0) mediante un merge que incorpora los pesos de LightOnOCR-HGH de Bernhard Straub, especializado en escritura manuscrita alemana histórica. Según la model card, ambos progenitores del merge comparten el modelo de lenguaje del modelo base, por lo que el fichero de texto es idéntico al publicado por LightOnOCR-HGH; el fichero `mmproj-bf16.gguf` contiene los pesos visuales fusionados, convertidos con `convert_hf_to_gguf.py` en modo `--mmproj --outtype bf16`.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Sí se documenta una decisión técnica relevante: el codificador visual se distribuye en bf16 porque, según la model card de LightOnOCR-HGH, desborda en f16 sobre CUDA. En el lado de llama.cpp hay dos diferencias conocidas frente a vLLM: las imágenes se escalan a 1540 píxeles en su lado mayor y la ventana de penalización de repetición solo abarca tokens generados.

## Capacidades

- Transcripción de texto manuscrito histórico alemán: Kurrent, Sütterlin y manos relacionadas, a nivel de página completa.
- Salida línea a línea, respetando el orden de escritura de la página.
- Procesamiento de imágenes de página como entrada (pipeline image-text-to-text).
- Modo de verificación opcional en el cliente (`--check`, versión 1.3.0 o superior): compara cuatro lecturas muestreadas de cada página y marca las que conviene revisar.
- Ejecución en CPU o Apple Silicon, además de GPU, mediante llama.cpp.
- No se documentan tool calling, capacidades de agente, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de archivos históricos: procesar lotes de páginas escaneadas de registros parroquiales, protocolos notariales o correspondencia en Kurrent y obtener un borrador de transcripción que un paleógrafo revisa y corrige.
- Proyectos de Wikisource y edición digital colaborativa: el propio desarrollo se validó sobre páginas de Wikisource; el modelo acelera la transcripción inicial que después se coteja contra el facsímil.
- Investigación genealógica: transcribir libros de bautismos, matrimonios y defunciones en escritura alemana antigua para hacerlos buscables, con revisión obligatoria de nombres, lugares y fechas por su alta tasa de error en entidades.
- Enriquecimiento de catálogos de bibliotecas: generar texto plano indexable a partir de fondos manuscritos digitalizados, habilitando búsqueda de texto completo sobre colecciones que antes solo tenían metadatos.
- Flujos de revisión asistida: usar el modo `--check` para priorizar la revisión humana; en 324 páginas de desarrollo marcó el 29 % y detectó el 87 % de las páginas con tasa de error de caracteres superior a 0,15.
- Despliegue local sin GPU: con llama.cpp y los dos ficheros GGUF, un equipo de escritorio o un Mac puede transcribir páginas; en un Apple M1 Pro el tiempo mediano por página fue de 24 segundos.
- Integración vía API compatible con OpenAI: `llama-server` expone un endpoint `/v1` que el cliente `kurrent-transcribe` consume con `--engine llama-server`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de estos ficheros GGUF en la información disponible. La model card indica que los resultados del modelo principal provienen del motor vLLM y que los GGUF no tienen benchmark propio. Los únicos datos de evaluación disponibles son comparativos:

| Prueba | Resultado |
|---|---|
| 40 páginas de desarrollo de Wikisource (llama.cpp frente a LightOnOCR-HGH) | Diferencia media de `cer_norm` +0,019, IC 95 % [−0,023, +0,087]; mediana −0,006 |
| Misma prueba con vLLM | Diferencia media +0,020 (la brecha atribuida al modelo, no a llama.cpp) |
| Smoke test, 8 páginas públicas (ICFHR 2016 y Bullinger) | Similitud media 0,93 frente al texto vLLM (mínimo 0,86); todas las páginas leídas |
| Reproducibilidad vLLM (dos sesiones) | Concordancia 0,998 |
| Latencia en Apple M1 Pro | 24 segundos por página (mediana) |

El criterio de aceptación fijado de antemano exigía un extremo superior del intervalo por debajo de +0,02; no se cumplió y 13fragments lo declaró exento para su aplicación de lectura.

## Requisitos de hardware

- VRAM estimada: no medida en el smoke test; los ficheros suman aproximadamente 1,47 GB en disco (639 MB + 829 MB), por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos; el codificador visual requiere bf16 en CUDA por desbordamiento en f16.
- Cabe en GPU de consumo: sí, por el tamaño de los ficheros; no se detallan modelos concretos.
- Funciona sin GPU NVIDIA: la model card confirma ejecución en Mac (probado en Apple M1 Pro).
- Despliegue: `llama-server` de llama.cpp (probado con la versión 0.9.0, build 12110, commit `cd959bae9`) con `-c 8192 -np 1 -ngl 99 --cache-ram 0 --ctx-checkpoints 0 --no-webui`; cliente `kurrent-transcribe` 1.2.0 o superior.
- Latencia: 24 segundos por página (mediana) en Apple M1 Pro; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kurrent Transcriber 1B GGUF | 596 M | 8192 tokens (config. documentada) | HTR alemán histórico, GGUF | CC BY-SA 4.0 | Hugging Face |
| LightOnOCR-HGH (b-straub) | No disponible | No disponible | HTR alemán histórico | No disponible en la información | Hugging Face |
| LightOnOCR-3-1B | No disponible | No disponible | OCR generalista (modelo base) | Apache 2.0 | Hugging Face |

La comparación cuantitativa con alternativas no está disponible más allá de la diferencia de `cer_norm` de +0,019 frente a LightOnOCR-HGH en 40 páginas de desarrollo.

## Limitaciones y advertencias

- La salida es un borrador: la model card exige comprobar cada línea contra el escaneo.
- Nombres propios, topónimos y fechas se leen mal con frecuencia; requieren verificación manual.
- Repeticiones de página completa: en ocasiones el modelo escribe la página entera dos veces; hay que revisar respuestas largas.
- Dobles páginas: en un pliego ancho puede omitir un bloque de texto; deben dividirse en páginas individuales.
- Sellos junto a cartas de color: el paso de imagen puede eliminar sellos de biblioteca situados junto a cartas de color; esta puerta de desarrollo falló y se declaró exenta.
- Idiomas: solo alemán; no se documenta soporte multilingüe.
- Licencia: CC BY-SA 4.0 sobre los pesos, lo que obliga a compartir pesos adaptados bajo la misma licencia; el modelo base es Apache 2.0.
- Riesgo de alucinación no cuantificado en la información disponible, más allá de los fallos de lectura documentados.
- Diferencias de comportamiento frente a vLLM en el escalado de imagen y la ventana de penalización, que pueden alterar la salida.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF
- Modelo base principal: https://huggingface.co/13fragments/kurrent-transcriber-1b
- Modelo LightOnOCR-HGH: https://huggingface.co/b-straub/LightOnOCR-3-1B-Historic-German-Handwriting
- Carpeta de inferencia del modelo principal: https://huggingface.co/13fragments/kurrent-transcriber-1b/tree/main/inference
- Documentación del modo de verificación: https://huggingface.co/13fragments/kurrent-transcriber-1b/blob/main/inference/README.md#pages-to-check
- Sumas de verificación: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/LICENSE
- Licencia Apache 2.0 del modelo base: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/LICENSE-APACHE-2.0
- Aviso legal: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF/blob/main/NOTICE
- Archivo en Zenodo: https://doi.org/10.5281/zenodo.24342061
