# fport/issue-writer-gemma4-gguf

## Resumen

`fport/issue-writer-gemma4-gguf` es un modelo de lenguaje multimodal (vision-language model) desarrollado por el autor `fport`, fine-tuned a partir de la familia Gemma 4 de Google DeepMind y convertido a formato GGUF mediante Unsloth. El nombre del modelo indica que está orientado a la generación de issues, aunque la model card no detalla el dataset ni el dominio exacto. Según los resultados de búsqueda asociados al autor, el modelo podría estar especializado en tareas de soporte técnico relacionadas con protocolos de liquidez cross-chain y agregadores de stablecoins, ya que los enlaces encontrados apuntan a artículos de este sector. La arquitectura combina un modelo de lenguaje con un proyector multimodal (mmproj), lo que le permite procesar entradas de imagen y texto. El modelo se distribuye con una cuantización Q4_K_M para el componente de lenguaje y un proyector en BF16, preparado para su uso con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (transformador multimodal) basado en Gemma 4 |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); BF16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos `.gguf` para llama.cpp) |

## Arquitectura y entrenamiento

El modelo está construido sobre Gemma 4, un modelo de lenguaje de Google DeepMind, y se ha fine-tuned con Unsloth, lo que según la model card aceleró el entrenamiento (2x más rápido) y facilitó la conversión a GGUF. La estructura incluye dos componentes separados: un modelo de lenguaje cuantizado (`gemma-4-E4B-it.Q4_K_M.gguf`) y un proyector multimodal (`gemma-4-E4B-it.BF16-mmproj.gguf`). El nombre del archivo sugiere un componente de lenguaje con 4B parámetros, pero el total de parámetros indicado en los safetensors es de 7.518.069.290, lo que apunta a que el proyector o el propio modelo aportan una parte significativa de los parámetros. No se ha podido confirmar si la arquitectura utiliza expertos mixtos (MoE). Tampoco se han publicado detalles sobre el dataset de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto gracias al proyector multimodal (`mmproj`).
- Generación de texto: al estar basado en una versión instruct de Gemma 4 (`gemma-4-E4B-it`), sigue instrucciones y genera respuestas en formato conversacional.
- Etiquetado en HuggingFace como `vision-language-model`, `conversational` y `endpoints_compatible`.
- Inferencia compatible con llama.cpp: puede usarse con `llama-cli` para texto y con `llama-mtmd-cli` para tareas multimodales.
- El name del modelo sugiere una especialización en la redacción de issues, aunque no se ha publicado documentación que detalle esta capacidad.
- No se ha confirmado soporte para tool calling, funciones, razonamiento multi-paso ni modos de thinking.

## Casos de uso

- Redaccion automatizada de issues de soporte a partir de capturas de pantalla: el modelo puede convertir una imagen de un error o excepción en una descripción estructurada y accionable, gracias a su capacidad multimodal.
- Documentación de incidencias visuales en interfaces web: detecta y describe problemas en capturas de pantalla de plataformas DeFi o trading, generando textos que facilitan el triaje.
- Asistencia en triaje de issues en repositorios de código: a partir de una captura de un stack trace o de una interfaz, el modelo redacta un issue claro para desarrolladores.
- Generacion de informes para equipos de soporte en sistemas de tickets: integrado en un pipeline de entrada, convierte imágenes adjuntas en texto estructurado y listo para clasificar.
- Analisis de capturas de protocolos DeFi: interpreta visualmente una interfaz de agregador de stablecoins y redacta un issue sobre problemas de enrutamiento o liquidez.
- Automatizacion de informes de regresion en pruebas visuales: compara capturas de pantalla y genera issues detallados cuando detecta cambios de interfaz o elementos inconsistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas que permitan comparar este modelo con alternativas similares.

## Requisitos de hardware

- El modelo se distribuye en formato GGUF, por lo que requiere llama.cpp o un runtime compatible para la inferencia.
- Para uso multimodal, se necesita `llama-mtmd-cli`, ya que el proyector visual está en un archivo `mmproj` separado.
- VRAM estimada: no disponible. Al estar cuantizado en Q4_K_M, un modelo de este rango de parámetros puede ejecutarse en GPUs de consumo con 8 GB de VRAM o más, aunque el proyector en BF16 puede aumentar el consumo total.
- GPU recomendada: no disponible. En principio, una RTX 3060 de 12 GB o superior debería ser suficiente para pruebas locales, pero no hay una confirmación oficial.
- Nota para Ollama: Ollama no soporta archivos `mmproj` separados para modelos de visión. Según la model card, es necesario crear primero un modelo bf16 unificado para poder usarlo con Ollama, lo que incrementa el tamaño y la VRAM requerida.
- Opciones de despliegue: llama.cpp, llama-mtmd-cli y, con trabajo adicional, Ollama.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con el mismo propósito (issue-writer multimodal basado en Gemma 4) dentro de la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de una licencia clara limita el uso comercial y la redistribución hasta que se aclare el término.
- Idiomas no especificados: es posible que el fine-tuning esté centrado en inglés, lo que limita su capacidad multilingüe.
- Sin benchmarks publicados: no se puede evaluar su rendimiento respecto a otros modelos de lenguaje multimodal.
- 0 descargas y 0 likes en HuggingFace: el modelo no ha sido probado por la comunidad, por lo que puede contener errores o producir resultados no óptimos.
- Limitaciones de Ollama: el formato con `mmproj` separado no es compatible directamente, obligando a generar un modelo unificado y aumentar los requisitos de memoria.
- No se ha confirmado el soporte de tool calling, agentes ni otras funcionalidades avanzadas.

## Enlaces

- HuggingFace: https://huggingface.co/fport/issue-writer-gemma4-gguf
- Repo LoRA (safetensors): https://huggingface.co/fport/issue-writer-gemma4-lora
- Unsloth: https://github.com/unslothai/unsloth
- Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Artículos de soporte encontrados en la búsqueda (posiblemente relacionados con el dominio del fine-tuning):
  - https://eco.com/support/en/articles/11776421-top-cross-chain-liquidity-protocols-for-2026
  - https://eco.com/support/en/articles/15210575-arbitrum-stablecoin-aggregators-2026-top-routing-platforms
  - https://stablecoininsider.org/stablecoin-aggregators-2026/
