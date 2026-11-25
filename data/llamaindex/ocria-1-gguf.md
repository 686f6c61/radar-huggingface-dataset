# llamaindex/OCRia-1-GGUF

## Resumen

OCRia-1-GGUF es la distribucion en formato GGUF de OCRia-1, un modelo de vision-lenguaje de 4B parametros desarrollado por LlamaIndex y especializado en el parseo de documentos: convierte imagenes de paginas (PDF escaneados, formularios, tablas, graficos) en Markdown estructurado. Esta version esta pensada para ejecutarse con llama.cpp y Ollama en Linux, Windows y macOS, lo que permite desplegar el modelo en local sin depender de GPUs de datacenter.

El modelo base emplea una arquitectura de tipo Qwen3-VL (segun la plantilla de chat y el conversor utilizados), con un encoder visual independiente distribuido como archivo `mmproj` y un total de 4.841.450.496 parametros. La ventana de contexto recomendada es de 32.768 tokens, suficiente para acomodar una pagina renderizada a 300 DPI (hasta ~8k tokens de imagen) y la transcripcion de salida (hasta ~24k tokens).

La relevancia de esta publicacion radica en que ofrece una alternativa cuantizada con calidad practicamente identica al modelo original: el build Q8_0 obtiene una media de 85,77 en ParseBench 2 frente a 85,56 del original servido con vLLM, ocupando 5,2 GB en disco. El autor descarta deliberadamente publicar un build de 4 bits por la perdida de precision observada en tablas financieras y de seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje tipo Qwen3-VL (transformer con encoder visual separado, checkpoint sin cabeza MTP) |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (recomendado por el autor) |
| Tipos de cuantizacion | BF16, Q8_0 (no se publica Q4_K_M) |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (licencia propia, categoria "other") |
| Formato de pesos | GGUF (llama.cpp), con archivo `mmproj` separado para el encoder visual |

## Arquitectura y entrenamiento

OCRia-1 es un modelo multimodal de tipo image-text-to-text construido sobre una base Qwen3-VL, segun se deduce de la plantilla de chat empleada (la plantilla de Qwen3.5 activa el modo thinking por defecto) y del conversor de llama.cpp utilizado para la conversion. El checkpoint no incluye cabeza MTP (multi-token prediction), por lo que la conversion se realizo con la opcion `--no-mtp`. El encoder visual se distribuye como archivo independiente `mmproj-OCRia-1-f16.gguf` de 0,7 GB, con limites de pixeles configurados explicitamente (`clip.vision.image_min_pixels = 65536`, `clip.vision.image_max_pixels = 16777216`) para permitir imagenes de hasta 16,7 millones de pixeles, equivalentes a unos 16k tokens de imagen.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta distribucion es el ajuste del archivo de vision: el conversor estandar de Qwen3-VL en llama.cpp no escribe los limites de pixeles del procesador, lo que por defecto limita las imagenes a 4096 tokens (aproximadamente media pagina a 300 DPI); el autor los incorpora manualmente para preservar la resolucion completa. La conversion se realizo con `convert_hf_to_gguf.py` en el commit `33aeb17` y la cuantizacion con `llama-quantize`.

## Capacidades

- Parseo de documentos: transcripcion de paginas completas a Markdown estructurado, incluyendo texto, formato, tablas, graficos y formularios.
- Procesamiento de imagenes de pagina a 300 DPI con resolucion completa (hasta 16,7 millones de pixeles).
- Manejo de tablas complejas, incluidos dominios especializados como tablas financieras y declaraciones de seguros.
- Interpretacion de graficos y formularios, con puntuaciones especificas en ParseBench 2 para cada dimension.
- Modo conversacional compatible con la API de chat de llama.cpp y Ollama (endpoints compatibles con OpenAI).
- Soporte de modo thinking mediante la plantilla de chat, aunque el autor recomienda desactivarlo (`enable_thinking: false`), ya que activado el modelo responde en un formato incorrecto.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos PDF escaneados: el modelo recibe cada pagina renderizada a 300 DPI y devuelve Markdown estructurado, lo que permite construir pipelines de conversion masiva de documentos a texto indexable sin servicios en la nube.
- Extraccion de tablas financieras: con Q8_0 mantiene la precision en tablas (88,89 en ParseBench 2), por lo que es adecuado para procesar balances e informes economicos donde un build de 4 bits perderia 6,3 puntos.
- Procesamiento de declaraciones de seguros: la dimension de formularios obtiene 83,06 en Q8_0, lo que lo hace util para extraer campos estructurados de pólizas y siniestros escaneados.
- Alimentacion de pipelines RAG: al generar Markdown limpio, la salida puede dividirse en chunks e indexarse directamente en un sistema de recuperacion, integrandose con el ecosistema LlamaIndex del que proviene el modelo.
- Despliegue en local con Ollama: gracias al build Q8_0 de 5,2 GB, un equipo de sobremesa puede ejecutar el modelo con `ollama run llamaindex/ocria-1 --think=false ./page.png` sin GPU de datacenter.
- Conversion de graficos e infografias a descripcion textual: la dimension de charts obtiene 73,83 en Q8_0, suficiente para extraer la informacion de graficos en informes y presentaciones.
- Digitalizacion de documentacion en macOS y Windows: al distribuirse como GGUF para llama.cpp, cubre estaciones de trabajo no Linux donde otras alternativas de servido no estan disponibles.

## Benchmarks y rendimiento

Resultados en ParseBench 2 sobre una muestra fija de 301 paginas (25 por subconjunto, excepto layout), con paginas a 300 DPI, decodificacion greedy y thinking desactivado. El original se sirvio con vLLM; los builds GGUF con `llama-server` de llama.cpp y los mismos ajustes de proveedor.

| Dimension | OCRia-1 (vLLM) | BF16 GGUF | Q8_0 GGUF |
|---|---:|---:|---:|
| Text | 90,53 | 93,09 | 93,09 |
| Formatting | 89,81 | 90,13 | 89,98 |
| Tables | 88,50 | 89,26 | 88,89 |
| Charts | 75,86 | 73,42 | 73,83 |
| Forms | 83,10 | 81,93 | 83,06 |
| **Media** | **85,56** | **85,57** | **85,77** |

El autor senala que las diferencias entre builds estan dentro del ruido de muestreo: con 25 paginas por subconjunto, las dimensiones individuales varian un par de puntos entre ejecuciones. No se publican resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el build Q8_0 ocupa 5,2 GB y el BF16 9,7 GB en disco; a ello hay que sumar el encoder visual `mmproj` de 0,7 GB y el espacio de contexto (hasta 32k tokens), por lo que se recomienda reservar entre 8 y 12 GB de VRAM para Q8_0 y entre 12 y 16 GB para BF16.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por tamano, el build Q8_0 es compatible con GPUs de consumo de gama alta (16 GB o mas) y el BF16 requiere GPUs profesionales tipo A100 o H100 para mayor comodidad.
- Cabe en GPU de consumo: si, el build Q8_0 esta disenado para ello, dado su tamano de 5,2 GB mas el encoder visual.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`, `-c 32768`, `-fa on` y `--jinja`) y Ollama (modelo publicado como `llamaindex/ocria-1`, tags `latest` y `q8_0`; tambien via `hf.co/llamaindex/OCRia-1-GGUF:Q8_0`). El endpoint de llama.cpp es compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1-GGUF (Q8_0) | 4,84B | 32k | Parseo de documentos a Markdown | ocria-1-license | GGUF en HF, Ollama |
| OCRia-1 (original) | 4,84B | 32k | Parseo de documentos a Markdown | ocria-1-license | Pesos HF, servido con vLLM |
| Build Q4_K_M (no publicado) | 4,84B | 32k | Parseo de documentos a Markdown | ocria-1-license | Descartado por perdida de precision (-6,3 en tablas financieras, -4,8 en seguros) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del modelo; no se documenta soporte de otros idiomas.
- Procesa una sola pagina por peticion; los documentos multipagina requieren orquestacion externa.
- El modo thinking debe desactivarse (`--think=false` o `enable_thinking: false`); activado, el modelo responde en un formato incorrecto.
- La resolucion de entrada afecta a la precision: bajar de 300 DPI penaliza el texto pequeno.
- No se publica build de 4 bits; el autor documenta perdidas de 6,3 puntos en tablas financieras y 4,8 en tablas de seguros con Q4_K_M, ademas de mayor tendencia a alcanzar el limite de salida.
- Riesgo de alucinacion en la transcripcion de documentos no evaluado ni documentado en la informacion disponible.
- La licencia `ocria-1-license` es una licencia propia (categoria "other"); es imprescindible revisar el archivo LICENSE y la model card principal antes de cualquier uso comercial.
- El repo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- El modelo no incluye cabeza MTP, lo que descarta tecnicas de decodificacion especulativa basadas en ella.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/llamaindex/OCRia-1-GGUF
- Modelo base OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Benchmarks del modelo base: https://huggingface.co/llamaindex/OCRia-1#benchmarks
- Licencia del modelo base: https://huggingface.co/llamaindex/OCRia-1#license
- ParseBench (harness de evaluacion): https://github.com/run-llama/ParseBench
- Modelo en Ollama: https://ollama.com/llamaindex/ocria-1
