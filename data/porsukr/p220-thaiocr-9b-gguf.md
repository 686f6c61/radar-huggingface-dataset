# PorsukR/P220-ThaiOCR-9B-GGUF

## Resumen

P220-ThaiOCR-9B es un modelo de visión-lenguaje de 9B parámetros especializado en la transcripción y comprensión de documentos tailandeses: texto impreso y manuscrito, tablas, formularios, recibos, PDF gubernamentales y escaneos. Lo desarrolla Porsuk Rungarunsrisuk y se distribuye bajo licencia Apache-2.0. El modelo resuelve el problema de la digitalización de documentos en tailandés sin necesidad de reglas específicas por plantilla: lee páginas completas y las devuelve en texto plano, Markdown o tablas HTML, además de responder preguntas sobre el contenido (información clave, clasificación, gráficos y diagramas).

La versión aquí descrita es la cuantización GGUF, pensada para llama.cpp y Ollama. Está construida sobre Qwen/Qwen3.5-9B (Apache-2.0) mediante fine-tuning con LoRA y posterior merge. El modelo opera con el modo *thinking* desactivado: fue entrenado y evaluado sin razonamiento explícito, por lo que es necesario desactivarlo en llama.cpp (`enable_thinking: false`) y en Ollama (`--think=false`).

Su relevancia radica en la relación precisión/tamaño: incluso el archivo más pequeño, Q2_K (3.9 GB), obtiene un CER inferior al de P110-ThaiOCR-4B en BF16 y al de la mayoría de modelos probados. El autor lo sitúa como el mejor modelo abierto evaluado en ThaiOCRBench, por delante de Qwen3.6-35B-A3B y OpenThai 2.0 27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-9B, fine-tuning LoRA + merge) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantización | GGUF: BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K; además FP8, W4A16 y NVFP4 en otros repos |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); BF16/FP8/W4A16/NVFP4 en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer de visión-lenguaje derivado de Qwen3.5-9B, con un codificador visual separado que en GGUF se distribuye como archivo `mmproj-P220-ThaiOCR-9B-*.gguf` (disponible en F16 y Q8_0) y que es obligatorio para procesar imágenes. El ajuste se realizó con LoRA sobre el modelo base y posteriormente se fusionaron los pesos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que está orientado a OCR tailandés (texto impreso, manuscrito, tablas y formularios).

La innovación técnica destacable está en el proceso de cuantización: los archivos de 4, 3 y 2 bits se generaron con una imatrix construida específicamente a partir de texto OCR tailandés, y W4A16 y NVFP4 se calibraron con el mismo texto, con el objetivo de preservar la precisión de transcripción en cada tamaño. El autor descartó Q3_K_L (menos preciso que Q4_K_M con tamaño similar), IQ3_M (peor en texto impreso y más lento en CPU) e IQ2_M (menos preciso que Q2_K al mismo tamaño). El modelo no utiliza *thinking*: fue entrenado y evaluado sin modo de razonamiento.

## Capacidades

- Transcripción OCR de texto impreso y manuscrito en tailandés, con salida en texto plano.
- Extracción de tablas y conversión a Markdown o HTML.
- Comprensión de documentos: formularios, recibos, PDF gubernamentales y escaneos.
- Respuesta a preguntas sobre el documento (información clave, clasificación).
- Interpretación de gráficos y diagramas.
- Procesamiento de imágenes junto con instrucciones en lenguaje natural (pipeline image-text-to-text).
- Soporte bilingüe tailandés-inglés.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No dispone de modo *thinking*; debe desactivarse explícitamente en llama.cpp y Ollama.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos gubernamentales: el modelo transcribe PDF y escaneos completos a texto plano o Markdown sin reglas por plantilla, lo que permite procesar lotes heterogéneos de documentos administrativos tailandeses con un único pipeline.
- Extracción de tablas de facturas y recibos: convierte tablas impresas en Markdown o HTML estructurado, adecuado para alimentar sistemas de contabilidad o ERP.
- Procesamiento de formularios manuscritos: con un CER del 24,81 % en manuscrito con Q4_K_M, es viable para digitalización asistida con revisión humana en formularios y registros.
- Atención al cliente sobre documentos: al responder preguntas sobre el contenido de una página (información clave, clasificación), puede integrarse en flujos de soporte que reciben imágenes de documentos de usuarios.
- Despliegue en CPU o Mac: la versión Q4_K_M (6,7 GB con codificador visual) funciona en llama.cpp y Ollama sin GPU, con un tiempo de unos 2,9 s por línea de texto impreso en CPU de servidor, lo que sirve para digitalización por lotes en infraestructura sin acelerador.
- Clasificación documental automatizada: el modelo puede clasificar documentos y extraer información clave, útil en gestores documentales que necesitan enrutar expedientes por tipo.
- Análisis de gráficos y diagramas en informes: permite responder preguntas sobre figuras incluidas en documentos técnicos o financieros.

## Benchmarks y rendimiento

Los datos disponibles son de CER (tasa de error de caracteres) sobre conjuntos de evaluación retenidos, comparando archivos cuantizados del propio modelo con P110-ThaiOCR-4B:

| Archivo | Tamaño con codificador visual | CER % manuscrito / impreso |
|---|---|---|
| P220 Q4_K_M | 6,7 GB | 24,81 / 1,29 |
| P220 Q3_K_M | 5,7 GB | 27,39 / 1,46 |
| P220 Q2_K | 4,8 GB | 29,63 / 1,56 |
| P110 BF16 | 9,3 GB | 35,52 / 1,98 |
| P110 FP8 | 5,8 GB | 35,58 / 2,13 |
| P110 Q4_K_M | 3,4 GB | 35,86 / 2,08 |

Con el codificador visual Q8_0 en lugar de F16, el CER con Q4_K_M es de 25,19 / 1,28 (manuscrito / impreso), frente a 24,81 / 1,29 con F16.

El autor afirma que P220-ThaiOCR-9B obtiene la mejor puntuación en ThaiOCRBench entre todos los modelos abiertos probados, incluidos Qwen3.6-35B-A3B y OpenThai 2.0 27B, y por encima de GPT-6 Luna, además de acercarse a GPT-6.1 Sol en tareas de transcripción. Sin embargo, la tabla completa de resultados de ThaiOCRBench no está incluida en la información proporcionada, por lo que no se reproducen cifras adicionales.

## Requisitos de hardware

- VRAM/RAM estimada: Q2_K ocupa 4,8 GB con codificador visual; Q3_K_M, 5,7 GB; Q4_K_M, 6,7 GB; BF16, aproximadamente 18 GB solo para los pesos del modelo (el repo completo mide 44,2 GB).
- GPU recomendadas según el autor: NVIDIA Blackwell para NVFP4; Ada/Hopper para FP8; Ampere para W4A16; CPU, Mac u Ollama para GGUF.
- En GPU de consumo: los archivos Q4_K_M, Q3_K_M y Q2_K caben en tarjetas con 8 GB o más de VRAM, aunque la información no detalla pruebas específicas en RTX 4090 u otras consumer.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, vLLM (BF16, FP8, W4A16, NVFP4) y transformers.
- Latencia en CPU de servidor sin GPU: unos 2,9 s por imagen de una línea de texto impreso con Q4_K_M, Q3_K_M o Q2_K; P110-ThaiOCR-4B Q4_K_M tarda 2,0 s en la misma máquina. En CPU se recomienda `-np 1`.
- Configuración recomendada: `--image-min-tokens 64`; probado con llama.cpp b11913 (build CUDA).
- Throughput en GPU: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER manuscrito / impreso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P220-ThaiOCR-9B (Q4_K_M) | 9,2B | no disponible | 24,81 / 1,29 | Apache-2.0 | GGUF, BF16, FP8, W4A16, NVFP4 |
| P110-ThaiOCR-4B (BF16) | 4B (aproximado) | no disponible | 35,52 / 1,98 | no disponible | BF16, FP8, Q4_K_M |
| Qwen3.6-35B-A3B | 35B (MoE) | no disponible | no disponible | no disponible | mencionado como comparación en ThaiOCRBench |
| OpenThai 2.0 27B | 27B | no disponible | no disponible | no disponible | mencionado como comparación en ThaiOCRBench |

El autor sitúa a P220-ThaiOCR-9B por delante de Qwen3.6-35B-A3B y OpenThai 2.0 27B en ThaiOCRBench, y por encima de GPT-6 Luna, aunque los valores numéricos de esas comparaciones no se incluyen en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a tailandés e inglés; el rendimiento en otros idiomas no está documentado.
- El modo *thinking* debe desactivarse explícitamente; si se deja activado (comportamiento por defecto en llama.cpp y Ollama), la calidad puede degradarse respecto a la evaluación publicada.
- El CER en manuscrito es notablemente superior al de texto impreso (24,81 % frente a 1,29 % con Q4_K_M), por lo que la transcripción manuscrita requiere revisión humana en producción.
- Las cuantizaciones de 2 y 3 bits pierden precisión de forma apreciable (29,63 % y 27,39 % de CER en manuscrito); Q4_K_M es la opción recomendada.
- El modelo es más lento que P110-ThaiOCR-4B en CPU (2,9 s frente a 2,0 s por línea de texto impreso).
- No se documentan sesgos específicos ni tasas de alucinación en la información proporcionada.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.5-9B, también Apache-2.0 según la model card.
- El repo tiene 338 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía escasa.
- No hay información sobre soporte de tool calling ni sobre el comportamiento en contextos multi-imagen.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo base BF16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante FP8: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Variante W4A16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Variante NVFP4: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
