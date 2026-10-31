# datalab-to/surya-ocr-2.5-gguf

## Resumen

Surya 2.5 GGUF es la versión cuantizada en formato GGUF de Surya 2.5, un modelo de OCR (reconocimiento óptico de caracteres) desarrollado por Datalab, especializado en inteligencia documental. El modelo base tiene aproximadamente 689 millones de parámetros (588,76 millones según los pesos safetensors del repositorio) y está diseñado para convertir imágenes de documentos y páginas PDF en texto estructurado en Markdown, incluyendo análisis de layout (tablas, imágenes, cabeceras), orden de lectura y detección de líneas de texto.

Surya 2.5 resuelve el problema de digitalizar documentos complejos con alta fidelidad: alcanza 85,9 puntos en OmniParseBench, el mejor resultado entre los modelos abiertos de menos de 1B de parámetros evaluados por Datalab, y un 83,7 % en olmOCR-bench. La versión GGUF permite ejecutar el modelo localmente mediante llama.cpp, tanto en Apple Silicon como en CPU, sin depender de infraestructura GPU.

Es relevante ahora porque la demanda de pipelines de extracción de datos de documentos (RAG sobre PDFs, archivado digital, procesamiento de formularios) ha crecido enormemente, y Surya 2.5 ofrece una alternativa abierta, ligera y multilingüe (91 idiomas) a soluciones propietarias, con soporte de vision projector para llama.cpp y mejoras sustanciales de velocidad y completitud de salida respecto a su predecesor Surya 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language basado en Qwen3.5 (tag qwen3_5), con vision projector (mmproj) para llama.cpp |
| Parametros totales | 689M (según model card); 588.763.968 según pesos safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 98.304 tokens (configuracion recomendada en llama-server: --ctx-size 98304) |
| Tipos de cuantizacion | bf16 y Q8_0 |
| Idiomas soportados | 91 idiomas (74,9 % en benchmark interno; lista detallada no disponible) |
| Licencia | OpenRAIL-M (modelos); Apache-2.0 (codigo) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Surya 2.5 es un modelo de tipo image-text-to-text basado en la arquitectura Qwen3.5, con un proyector de vision que permite a llama.cpp procesar imagenes de paginas de documentos. La version GGUF se distribuye en tres ficheros: los pesos del modelo en bf16 (`surya-2.5.gguf`), una version cuantizada a 8 bits (`surya-2.5-Q8_0.gguf`) y el proyector de vision (`surya-2.5-mmproj.gguf`), necesario en ambos casos.

El modelo incorpora Multi-Token Prediction (MTP), una tecnica de decodificacion especulativa que le permite alcanzar 4,5 paginas por segundo en una H100 a 192 DPI, 1,7 veces mas que Surya 2. Los detalles sobre el numero de tokens de entrenamiento y la composicion del dataset no estan disponibles. Datalab tambien distribuye modelos auxiliares mas pequenos para deteccion de lineas de texto y deteccion de errores de OCR.

## Capacidades

- OCR de paginas completas con salida en Markdown, incluyendo texto, estructura y formato
- Analisis de layout: clasificacion de bloques (tabla, imagen, cabecera, etc.) mediante tokens especiales
- Determinacion del orden de lectura del documento
- Generacion de tablas en HTML con celdas combinadas mediante colspan/rowspan (la geometria de filas y columnas requiere un checkpoint de Surya 2)
- Deteccion de lineas de texto (modelos auxiliares incluidos en el ecosistema)
- Deteccion de errores de OCR (modelo auxiliar)
- Soporte multilingue en 91 idiomas
- Procesamiento por lotes: hasta 8 peticiones concurrentes con llama-server (--parallel 8)
- Integracion con el paquete `surya-ocr` de Python, que descarga el modelo y arranca llama-server automaticamente en Apple Silicon y CPU

## Casos de uso

- Digitalizacion de archivos de documentos: conversion masiva de PDFs escaneados a Markdown estructurado para su indexacion; su capacidad de completar paginas sin truncarse (32 de 32 frente a 28 de 32 de Surya 2) lo hace adecuado para lotes grandes.
- Construcción de corpus para RAG: la salida en Markdown con layout y orden de lectura preserva la estructura (titulos, tablas, listas), lo que mejora la calidad de los chunks de recuperacion frente a extraccion de texto plano.
- Procesamiento de formularios administrativos: el analisis de layout identifica campos y bloques en formularios gubernamentales, facilitando la extraccion de datos estructurados.
- OCR multilingue en entornos locales: con soporte de 91 idiomas y ejecucion en CPU o Apple Silicon, es util para organizaciones con requisitos de privacidad que no pueden enviar documentos a APIs externas.
- Digitalizacion de prensa historica: funciona sobre documentos complejos como periodicos con multiples columnas, gracias a la deteccion de orden de lectura.
- Extraccion de tablas cientificas: convierte tablas de papers matematicos y tecnicos a HTML con celdas combinadas, integrable en pipelines de analisis bibliometrico.
- Pipeline de OCR auto-corregido: combinando el modelo principal con el detector de errores de OCR incluido en el ecosistema, se puede montar un flujo de verificacion de calidad de salida.
- Despliegue en CI/CD de documentacion: al poder ejecutarse en CPU mediante llama.cpp, puede integrarse en pipelines automatizados de conversion de documentacion sin coste de GPU.

## Benchmarks y rendimiento

Resultados publicados por Datalab en benchmarks de OCR:

| Benchmark | Resultado |
|---|---|
| OmniParseBench | 85,9 (el mas alto entre modelos abiertos <1B evaluados) |
| olmOCR-bench | 83,7 % |
| Benchmark interno multilingue (91 idiomas) | 74,9 % |

Rendimiento medido en llama.cpp (commit `bbeb89d`) sobre un M4 Max de 36 GB, con alimentacion AC, OCR de pagina completa a 96 DPI, 8 peticiones concurrentes, 32 paginas:

| Modelo | Paginas/s | Tokens/s | p50 (s) | p95 (s) | Tokens medios/pagina | Peak RSS |
|---|---:|---:|---:|---:|---:|---:|
| Surya 2 (bf16) | 0,061 | 274 | 80,6 | 213,8 | 3.907 | 5.875 MB |
| Surya 2.5 (bf16) | 0,190 | 270 | 38,9 | 55,7 | 1.424 | 4.764 MB |
| Surya 2.5 (Q8_0) | 0,198 | 285 | 39,8 | 55,1 | 1.443 | 4.278 MB |

En GPU, Datalab reporta 4,5 paginas/s en una H100 a 192 DPI con MTP. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, al no ser un modelo de proposito general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: peak RSS de 4.764 MB en bf16 y 4.278 MB en Q8_0 en CPU/Apple Silicon; el repositorio completo ocupa 2,0 GB
- Apple Silicon: probado en M4 Max de 36 GB (funciona con menos memoria, dado el peak RSS de ~4,8 GB); recomendable conectar el portatil a alimentacion AC para maximo rendimiento
- CPU: soportado de forma nativa mediante llama.cpp, sin necesidad de GPU
- GPU: en la implementacion de referencia de Datalab se usa una H100 para alcanzar 4,5 paginas/s a 192 DPI; con `-ngl 99` en llama.cpp puede descargarse completamente a GPU en tarjetas consumer con al menos 8 GB de VRAM (no probado oficialmente, estimacion basada en el tamano del modelo)
- Despliegue: llama.cpp (llama-server con --mmproj, --jinja y --special obligatorios), paquete Python `surya-ocr` (descarga y arranque automatico del backend), y la plataforma gestionada de Datalab
- Latencia: p50 de ~39 s por pagina a 96 DPI en M4 Max con 8 peticiones concurrentes (~0,19 paginas/s en ese regimen); throughput de ~270-285 tokens/s en las mismas condiciones

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Benchmark destacado | Licencia | Formato |
|---|---|---|---|---|---|
| Surya 2.5 (Datalab) | 689M | OCR + layout + orden de lectura | 85,9 OmniParseBench; 83,7 % olmOCR-bench | OpenRAIL-M | GGUF, safetensors |
| Surya 2 (Datalab) | no disponible | OCR + layout | inferior a 2.5 en OmniParseBench | OpenRAIL-M | no disponible |
| Chandra (Datalab) | no disponible | Inteligencia documental de mayor precision | no disponible | no disponible | no disponible |

No hay datos suficientes para una comparativa numerica detallada con alternativas externas como olmOCR o Nougat; Datalab indica que Surya 2.5 es el mejor modelo abierto de menos de 1B parametros que han evaluado en OmniParseBench.

## Limitaciones y advertencias

- La geometria de filas y columnas en tablas requiere un checkpoint de Surya 2; Surya 2.5 solo genera el HTML con colspan/rowspan
- Al usar llama.cpp, el flag `--special` es obligatorio: sin el, las etiquetas de bloques y coordenadas no aparecen en la salida de texto
- Surya 2 se truncaba con frecuencia en el limite de 12.288 tokens; aunque Surya 2.5 completo las 32 paginas de prueba, conviene monitorizar la longitud de salida en documentos muy densos
- La licencia OpenRAIL-M incluye restricciones de uso (clausulas de uso responsable) que pueden afectar a ciertos despliegues comerciales; el codigo asociado es Apache-2.0
- El rendimiento en CPU es moderado (~0,19 paginas/s con concurrencia 8 en M4 Max); para volumenes altos a 192 DPI se necesita GPU tipo H100
- El modelo esta especializado en OCR y documentos: no es un modelo conversacional de proposito general, por lo que no es comparable en benchmarks tipo MMLU
- Detalles sobre sesgos, tasa de alucinacion y composicion del dataset de entrenamiento no estan disponibles en la documentacion publicada
- La lista exacta de los 91 idiomas soportados no esta incluida en la model card del repo GGUF

## Enlaces

- Repositorio GGUF: https://huggingface.co/datalab-to/surya-ocr-2.5-gguf
- Modelo base Surya 2.5: https://huggingface.co/datalab-to/surya-ocr-2.5
- Dataset OmniParseBench: https://huggingface.co/datasets/datalab-to/omni_parse_bench
- Dataset olmOCR-bench: https://huggingface.co/datasets/allenai/olmOCR-bench
- Modelo Chandra: https://github.com/datalab-to/chandra
- Web de Datalab: https://www.datalab.to
- Documentacion: https://documentation.datalab.to
- Playground publico: https://www.datalab.to/playground
- Discord de la comunidad: https://discord.gg/KuZwXNGnfH
- Licencia del codigo (Apache-2.0): https://www.apache.org/licenses/LICENSE-2.0
