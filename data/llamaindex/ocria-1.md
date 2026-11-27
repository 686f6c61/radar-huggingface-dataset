# llamaindex/OCRia-1

## Resumen

OCRia-1 es un modelo de vision-lenguaje de 4B parámetros (5.174.964.736 según los pesos en safetensors) desarrollado por LlamaIndex para el parseo de documentos. Recibe como entrada la imagen de una página y devuelve su contenido en Markdown, con las tablas en HTML, sin depender de un detector de layout, un motor OCR ni una capa de texto previa: una sola llamada por página. Está afinado a partir de Qwen/Qwen3.5-4B y se distribuye con licencia propia (`ocria-1-license`).

El modelo está diseñado específicamente para los casos en los que los parsers de documentos suelen fallar: celdas combinadas y cabeceras con spans (`colspan`/`rowspan`), tablas financieras de miles de celdas, gráficos cuyos valores hay que leer del eje, y formato con carga semántica (tachado, subrayado, subíndices, superíndices, casillas de verificación). Además transcribe fórmulas en LaTeX, incluidas las manuscritas, y estructura cabeceras, pies, números de página y marcas de agua en etiquetas propias.

Su relevancia actual radica en que es el modelo de pesos abiertos con mayor puntuación en los dos leaderboards de ParseBench, con grounding visual incluido (85,2 en ParseBench 2 y 84,7 en ParseBench 1), y en que el mismo modelo sirve en producción dentro de LlamaParse. El repositorio de Hugging Face contiene los pesos BF16 sin optimizar; la versión servida en la nube está cuantizada y usa decodificación especulativa y kernels propios, lo que la hace unas diez veces más rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer, afinada desde Qwen/Qwen3.5-4B (tag `qwen3_5`) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 32768`) |
| Tipos de cuantizacion | BF16 (pesos de este repo); GGUF con build Q8_0 en el repo GGUF; el servicio en la nube usa cuantizacion no especificada |
| Idiomas soportados | `en` (inglés) según la model card; los ejemplos incluyen una nota manuscrita en checo transcrita |
| Licencia | `ocria-1-license` (licencia propia, `license: other`) |
| Formato de pesos | safetensors (repo principal); GGUF en `llamaindex/OCRia-1-GGUF`; también se menciona `joblib` en los tags |

## Arquitectura y entrenamiento

OCRia-1 es un modelo de imagen-a-texto construido sobre Qwen/Qwen3.5-4B mediante fine-tuning. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado. El modelo opera como un parser de página completa: procesa la imagen renderizada (los ejemplos de ParseBench se renderizan a 150 DPI) y emite directamente Markdown con tablas en HTML, sin pipeline intermedio de detección de layout u OCR.

Entre los detalles técnicos destacables, la model card menciona que la versión de producción emplea decodificación especulativa y kernels personalizados para acelerar la inferencia, y que la decodificación de los ejemplos se realizó de forma greedy. El chat template de Qwen3.5 activa el modo thinking por defecto, por lo que es obligatorio desactivarlo: con thinking activado el modelo responde en un formato incorrecto. Las cajas de layout (layout boxes) se añaden a posteriori y están marcadas como experimentales.

## Capacidades

- Parseo de documentos: convierte la imagen de una página en Markdown estructurado en una sola llamada.
- Tablas complejas: cabeceras anidadas, celdas combinadas expresadas como `colspan`/`rowspan`, rejillas irregulares y tablas financieras largas.
- Gráficos como datos: cada gráfico se transforma en una tabla HTML de sus puntos de datos, con cada valor bajo su serie y etiqueta correspondientes.
- Formato con semántica: negrita, cursiva, tachado, subrayado, resaltados, subíndices y superíndices, casillas `[ ]`/`[x]` y campos en blanco `[___]`.
- Matemáticas: fórmulas en LaTeX, incluidas las manuscritas.
- Estructura de página: cabeceras, pies, números de página y marcas de agua en etiquetas propias; texto multicolumna desenrollado; diagramas como Mermaid.
- Grounding visual: la evaluación de ParseBench incluye grounding visual según la model card.
- Idiomas: etiquetado para inglés; hay ejemplos puntuales de transcripción de contenido en otros idiomas (checo), pero no se declara soporte multilingüe general.
- Integración: compatible con endpoints (tag `endpoints_compatible`) y servible mediante API compatible con OpenAI a través de vLLM.

## Casos de uso

- Digitalización de estados financieros y facturas: el modelo lee tablas con cabeceras de varios niveles y celdas combinadas y las emite como HTML con `colspan`/`rowspan`, lo que permite reconstruir la estructura contable sin post-procesado manual.
- Extracción de datos de gráficos en informes: convierte gráficos de líneas o barras en tablas de puntos de datos, útil para pipelines de análisis que necesitan los valores numéricos y no la imagen.
- Procesamiento de documentación legal y administrativa: conserva tachados, subrayados y casillas de verificación, formatos que en contratos y notificaciones cambian el significado del texto.
- Ingesta de documentos para RAG: al devolver Markdown limpio con estructura preservada, el resultado se indexa directamente en sistemas de recuperación sin una fase separada de OCR y reconstrucción de layout.
- Transcripción de apuntes científicos con fórmulas: las fórmulas manuscritas se convierten a LaTeX, lo que facilita su reutilización en publicaciones o cuadernos computacionales.
- Procesamiento por lotes en local o en servidor: con los builds GGUF puede ejecutarse en llama.cpp u Ollama en Linux, Windows y macOS para digitalizar archivos sin enviar documentos a la nube.
- Conversión de diagramas a Mermaid: los diagramas de una página se emiten como código Mermaid, reutilizable en documentación técnica versionada.

## Benchmarks y rendimiento

| Benchmark | Resultado OCRia-1 | Referencia comparativa |
|---|---|---|
| ParseBench 2 (seis dimensiones, con grounding visual) | 85,2 (7.º de 61 sistemas; mejor modelo de pesos abiertos) | no disponible el detalle del resto |
| ParseBench 1 (cinco dimensiones) | 84,7 (2.º de 158 sistemas; mejor modelo de pesos abiertos) | no disponible el detalle del resto |
| ParseBench 1, dimensión de gráficos | 82,5 | 69,1 del siguiente mejor modelo de pesos abiertos |
| olmOCR-bench, tablas | primero | no disponible |
| olmOCR-bench, fórmulas | primero | no disponible |
| PulseBench-Tab | primero | no disponible |
| fr-bench-pdf2md | primero | no disponible |

La model card indica además que el build GGUF Q8_0 obtiene la misma puntuación que los pesos BF16 en una muestra de ParseBench 2. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 del repo ocupan 10,4 GB, por lo que la inferencia en BF16 requiere aproximadamente esa cifra más el overhead de activaciones y caché KV para contexto de hasta 32.768 tokens; no se proporciona una estimación oficial de VRAM.
- GPU recomendadas: no se especifican modelos concretos; el despliegue documentado es con vLLM 0.30 o superior en servidor con toolkit CUDA (`nvcc`) disponible, lo que apunta a GPUs de datacenter (A100, H100 y similares).
- GPU de consumo: no hay datos oficiales. El build GGUF Q8_0 permite ejecución en llama.cpp u Ollama en Linux, Windows y macOS, lo que abre la puerta a GPUs de consumo, pero no se confirma ni se detalla qué modelos concretos son suficientes.
- Opciones de despliegue: vLLM 0.30+ (recomendado, con imagen Docker `vllm/vllm-openai`), llama.cpp y Ollama mediante los GGUF, y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles para los pesos BF16. La model card afirma que la versión cuantizada de producción, con decodificación especulativa y kernels propios, es aproximadamente diez veces más rápida que estos pesos sin optimizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 (LlamaIndex) | 5,17B | 32.768 tokens (configuración de ejemplo) | Parseo de documentos a Markdown, tablas HTML, gráficos, LaTeX | `ocria-1-license` (propia) | Hugging Face, GGUF, Ollama, vLLM |
| Qwen/Qwen3.5-4B | 4B (modelo base) | no disponible | Vision-lenguaje generalista | según Qwen | Hugging Face |
| Modelos de parseo evaluados en ParseBench | no disponible | no disponible | Parseo de documentos | no disponible | no disponible |

La información proporcionada no incluye datos de parámetros, contexto ni licencia de los sistemas competidores evaluados en ParseBench (los leaderboards citan 61 y 158 sistemas, respectivamente), por lo que la comparación cuantitativa con alternativas concretas no está disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en otros idiomas no está garantizado pese a ejemplos puntuales en checo.
- Modo thinking: el chat template de Qwen3.5 lo activa por defecto y con él el modelo responde en un formato incorrecto; debe desactivarse explícitamente en producción.
- Formato de entrada: cada página debe enviarse como una única imagen, con `prompt.txt` como mensaje de sistema y sin texto de usuario; el manejo de documentos multipágina corresponde a LlamaParse, no al modelo.
- Licencia: es una licencia propia (`ocria-1-license`, `license: other`); las condiciones para uso comercial deben consultarse en el archivo LICENSE del repositorio, no están resumidas en la información disponible.
- Riesgo de alucinación: no se documenta en la información proporcionada; como modelo generativo que transcribe imágenes, la fidelidad de la transcripción debe validarse en dominios críticos.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Pesos sin optimizar: este repositorio contiene BF16 sin las optimizaciones de producción; quien necesite el rendimiento del servicio de LlamaParse debe aplicar cuantización y decodificación especulativa por su cuenta.
- Cajas de layout: la funcionalidad de layout boxes está marcada como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llamaindex/OCRia-1
- Pesos GGUF: https://huggingface.co/llamaindex/OCRia-1-GGUF
- Informe técnico (arXiv): https://arxiv.org/abs/2611.00092
- Blog de presentación: https://www.llamaindex.ai/blog/parse-ocria-1
- Blog sobre el stack de inferencia: https://www.llamaindex.ai/blog/the-inference-stack-behind-ocria
- LlamaParse: https://cloud.llamaindex.ai
- ParseBench (repositorio): https://github.com/run-llama/ParseBench
- Leaderboard ParseBench: https://parsebench.ai
- Ollama: https://ollama.com/llamaindex/ocria-1
- LlamaIndex: https://www.llamaindex.ai/
- Documentación del framework LlamaIndex: https://developers.llamaindex.ai/python/framework/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
