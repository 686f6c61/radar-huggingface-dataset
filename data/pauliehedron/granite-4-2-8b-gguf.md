# Pauliehedron/granite-4.2-8b-GGUF

## Resumen

Granite 4.2 8B es un modelo de lenguaje denso de 8 791 592 960 parámetros desarrollado por IBM, publicado bajo licencia Apache 2.0. Esta ficha documenta la distribución GGUF del repositorio `Pauliehedron/granite-4.2-8b-GGUF`, que no es un modelo nuevo sino un conjunto de cuantizaciones listas para `llama.cpp` del modelo base `ibm-granite/granite-4.2-8b`. El repositorio ofrece dos familias de artefactos: compresiones propias generadas con la cadena `convert_hf_to_gguf.py` + `llama-quantize --imatrix`, y transcripciones a contenedor GGUF de las impresiones FP4 oficiales de IBM (MXFP4 y NVFP4).

La relevancia de esta distribución es práctica: permite ejecutar un modelo de 8B en hardware de consumo y en Apple Silicon con un abanico de niveles de compresión que va de 4,82 GB (IQ4_XS) a 17,60 GB (F16), con métricas de divergencia respecto al F16 publicadas por el autor. El modelo base está orientado a generación de texto conversacional y su idioma declarado es únicamente el inglés.

El autor publica además la matriz de calibración (`imatrix-granite-4.2-8b-calib.gguf`) y el keeper F16 dentro del propio repositorio, lo que permite reproducir las cuantizaciones, aunque la re-derivación byte-exacta requiere el corpus de calibración, que no está incluido. La información disponible no detalla la longitud de contexto ni la composición del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin cabeza MTP); 363 tensores y 81 tensores F32 pequeños en el contenedor uniforme |
| Parametros totales | 8 791 592 960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q6_K, Q4_K_M, IQ4_NL, IQ4_XS (con imatrix); MXFP4 y NVFP4 (transcripciones de impresiones de IBM) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 8B parámetros; la model card del repositorio de cuantización confirma explícitamente que la familia Granite 4.2 no incorpora cabeza MTP (multi-token prediction). El contenedor GGUF de las variantes densas es uniforme: 282 tensores en el cuerpo principal más 81 tensores F32 para normas, RoPE y frecuencias, con mezclas de códec por nivel (por ejemplo, Q4_K_M usa Q4_K en 241 tensores y Q6_K en los 41 restantes; IQ4_NL e IQ4_XS usan IQ4 en 241, Q5_K en 40 y Q6_K en 1).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Respecto a las cuantizaciones, las impresiones FP4 originales de IBM fueron generadas con `llm-compressor` usando esquema GPTQ, tamaño de bloque 128, orden de activación estático y calibración sobre 2 000 muestras SFT; la transcripción GGUF de MXFP4 re-cuantiza únicamente las proyecciones q/k desde los valores canónicos en tiempo de ejecución del keeper F16 (reparación de orden de canales del 25 de noviembre de 2026), mientras que el resto de tensores se mantiene byte-exacto. Las variantes propias usan una imatrix de calibración propia incluida en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta de pipeline `text-generation` y tag `conversational`.
- Razonamiento y respuesta multi-turno (la model card declara soporte conversacional; no se detallan capacidades específicas de razonamiento matemático o código).
- Ejecución local mediante `llama.cpp` en formatos GGUF cuantizados, incluidos códecs de 4 bits con imatrix.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo Apple Silicon: la variante Q4_K_M (5,35 GB) o IQ4_XS (4,82 GB) permite servir el modelo en un M1 Max de 64 GB de memoria unificada con `llama.cpp`, según las mediciones del propio autor en ese host.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y su ventana de contexto, aunque no documentada aquí, permite diálogos multi-turno; es adecuado para pruebas de concepto antes de escalar a un modelo mayor.
- Evaluación de cuantizaciones en pipelines de investigación: la publicación de KLD medio y porcentaje de coincidencia top-1 frente al F16 (por ejemplo, 0,2858 de KLD y 87,6% same-top para Q4_K_M) permite elegir el nivel de compresión con un criterio cuantitativo en lugar de por tamaño.
- Inferencia en GPU de consumo con códecs de 4 bits: las variantes IQ4_NL, IQ4_XS y Q4_K_M caben en tarjetas de 8-12 GB de VRAM, lo que habilita entornos de desarrollo con una sola GPU.
- Comparación de códecs FP4 frente a códecs K-quant: las transcripciones MXFP4 y NVFP4 permiten medir en un mismo contenedor GGUF el impacto de los formatos de IBM frente a las compresiones propias, con instrumentos declarados por fila.
- Reproducibilidad de cuantizaciones: al incluir el keeper F16 y la imatrix de calibración, el repositorio sirve como base para regenerar las variantes y auditar la metodología de compresión en un entorno controlado.
- Servicio de texto ligero en inglés con licencia permisiva: la licencia Apache 2.0 del modelo base facilita su integración en productos comerciales de generación de texto sin restricciones de uso.

## Benchmarks y rendimiento

El autor publica métricas de divergencia respecto al F16 (KLD medio y coincidencia top-1) sobre el test de WikiText-2 (`wikitext-2-raw-v1`, `wiki.test.raw`), con n_ctx 8192 y 8 chunks, usando `llama-perplexity --kl-divergence` para las variantes densas y `gmlx kld` (gmlx 0.5.7) para las FP4:

| Cuantizacion | KLD medio | Same-top | Nota |
|---|---|---|---|
| F16 (referencia) | — | — | referencia viva en sesión |
| Q6_K (imatrix) | 0,1097 | 94,5% | cola 99%: 2,72 |
| Q4_K_M (imatrix) | 0,2858 | 87,6% | cola 99%: 8,09 |
| IQ4_NL (imatrix) | 0,3122 | 86,7% | cola 99%: 8,37 |
| IQ4_XS (imatrix) | 0,3142 | 86,6% | cola 99%: 8,38 |
| NVFP4 | 0,3773 | 84,2% | instrumento de respaldo (gmlx) |
| MXFP4 | 0,8801 | 73,3% | instrumento de respaldo; re-medido tras la reparación de orden de canales q/k |

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las velocidades se midieron con `llama-benchy` sobre los brazos servidos con gmlx, a profundidades de prompt de 32K y 64K y un solo stream, pero los valores numéricos de prefill (pp) y decode (tg) no aparecen completos en la información proporcionada.

## Requisitos de hardware

- Huella en disco por variante: IQ4_XS 4,82 GB; IQ4_NL 5,08 GB; Q4_K_M 5,35 GB; MXFP4 5,88 GB; NVFP4 6,13 GB; Q6_K 7,22 GB; F16 17,60 GB.
- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más overhead de contexto KV; las variantes de 4 bits (4,8-5,4 GB) son las únicas viables en GPUs de 8 GB, y Q6_K requiere al menos 8-10 GB.
- GPU recomendadas: no se especifican en la información proporcionada; el autor midió en un Apple M1 Max (GPU de 32 núcleos, 64 GB de memoria unificada).
- Cabe en GPU de consumo: sí, las variantes IQ4_XS, IQ4_NL y Q4_K_M en tarjetas de 8 GB o más; Q6_K en 12 GB o más; F16 requiere aproximadamente 18 GB o más.
- Opciones de despliegue: `llama.cpp` (medido por el autor), `gmlx` (usado para las rutas FP4 y la medición KLD de respaldo) y cualquier runtime compatible con GGUF; no se confirma compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: medidos con `llama-benchy` a 32K y 64K de prompt en un solo stream, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 8B (esta distribucion GGUF) | 8,79B denso | no disponible | Apache 2.0 | GGUF (F16 a IQ4_XS, MXFP4, NVFP4) | Métricas KLD propias frente a F16 |
| Granite 4.2 8B base (IBM) | 8,79B denso | no disponible | Apache 2.0 | safetensors | Origen de las cuantizaciones; incluye impresiones FP4 oficiales |
| Alternativas de 8B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos en la información disponible |

No se dispone de datos de rendimiento de tarea que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés (`language: en`); no hay evidencia de capacidades multilingües.
- Contexto: la longitud de contexto no está documentada en la información proporcionada; las mediciones de velocidad usan profundidades de 32K y 64K, pero no confirman la ventana máxima soportada.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de veracidad en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero las transcripciones FP4 heredan la cuantización de IBM y el contenedor es obra del autor del repositorio; conviene verificar la procedencia antes de un despliegue en producción.
- Instrumentación heterogénea: las filas NVFP4 y MXFP4 se midieron con `gmlx kld` (instrumento de respaldo) y no son directamente comparables con las filas medidas con `llama-perplexity`; el propio autor advierte que no se mezclan silenciosamente.
- MXFP4 muestra una divergencia notablemente mayor (KLD 0,8801, same-top 73,3%) que el resto de variantes, incluso tras la reparación de orden de canales; no es recomendable cuando la fidelidad al F16 sea prioritaria.
- Reproducibilidad parcial: sin el corpus de calibración no es posible re-derivar las cuantizaciones byte-exactas, solo aproximarlas desde el keeper F16.
- Advertencia de metadatos: el archivo MXFP4 declara `general.file_type` 38 (`MOSTLY_MXFP4_MOE`), un valor heredado del nombrado histórico de `llama.cpp`; el contenedor real es denso.
- Popularidad baja: 84 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria de los artefactos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Pauliehedron/granite-4.2-8b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Impresión MXFP4 de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b-mxfp4
- Impresión NVFP4 de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b-nvfp4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- gmlx: https://github.com/asher/gmlx
- Dataset de evaluación WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
