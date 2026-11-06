# deAPI-ai/lightonocr-3-4b-q8

## Resumen

LightOnOCR-3-4B es un modelo de visión-lenguaje de extremo a extremo especializado en OCR y comprensión de documentos, desarrollado por LightOn. Convierte la imagen de una página de documento directamente en Markdown, representando las tablas como HTML, sin necesidad de un pipeline OCR tradicional por etapas (detección de layout, segmentación de líneas, reconocimiento de caracteres). El modelo se construye sobre la arquitectura Qwen3.5 vision-lenguaje de 4B parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial.

Esta ficha documenta la conversión a GGUF publicada por deAPI-ai para su uso con llama.cpp. El repositorio incluye el modelo de lenguaje cuantizado a Q8_0 (4,48 GB) y el codificador visual junto con el proyector en F16 (0,67 GB). El modelo base cuenta con 4.205.751.296 parámetros según los pesos en safetensors. Es relevante porque permite ejecutar un OCR de calidad estado del arte en hardware de consumo mediante llama.cpp, con un formato de pesos portátil y una licencia permisiva.

La conversión mantiene el chat template original embebido en el fichero GGUF y no aplica cambios en los pesos más allá de la cuantización. El modelo está pensado para transcripción de páginas completas, no para instrucciones arbitrarias: el modo de uso correcto es enviar únicamente la imagen con un prompt vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-lenguaje (transformer multimodal con codificador visual y proyector) |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 para el modelo de lenguaje; F16 para mmproj (codificador visual y proyector) |
| Idiomas soportados | no disponible (el paper del modelo base lo describe como multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model.gguf y mmproj.gguf); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje de tipo transformer construido sobre la arquitectura Qwen3.5, con un codificador visual y un proyector que conectan la imagen con el modelo de lenguaje. El modelo base, LightOnOCR-3-4B, se presenta en el paper como un modelo OCR de extremo a extremo multilingüe. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp, exportando el modelo de lenguaje directamente a Q8_0 y el codificador visual junto con el proyector a F16 mediante `--mmproj`. Se usó `--no-mtp` porque el checkpoint original no incluye la cabeza de multi-token prediction (`mtp_num_hidden_layers: 0`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base incluye un modo de razonamiento (thinking mode) heredado de Qwen3.5, que debe desactivarse para la tarea de transcripción, ya que de lo contrario la salida se dirige a `reasoning_content` y el campo `content` queda vacío.

## Capacidades

- Transcripción OCR de documentos: convierte una imagen de página en Markdown.
- Representación de tablas: las tablas se emiten como HTML dentro del Markdown.
- Comprensión de documentos (document understanding) de extremo a extremo, sin pipeline por etapas.
- Capacidad multilingüe según la descripción del modelo base (idiomas concretos no disponibles).
- Modo de razonamiento (thinking mode) presente en la arquitectura, que debe desactivarse para transcripción.
- Entrada de imagen con prompt vacío para el modo de transcripción; otras instrucciones quedan fuera de distribución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de archivos en papel: procesar páginas escaneadas a 400 DPI y obtener Markdown estructurado para su indexación en sistemas de búsqueda o bases documentales, aprovechando la salida directa en Markdown.
- Extracción de tablas de informes financieros: el modelo emite las tablas como HTML, lo que facilita el parseo posterior y la carga en hojas de cálculo o bases de datos sin postprocesado geométrico.
- Pipeline de ingesta documental en llama.cpp: desplegar el modelo con `llama-server` y `--mmproj` en infraestructura propia, enviando imágenes base64 a `/v1/chat/completions` con temperatura 0 para transcripciones deterministas.
- Procesamiento de facturas y albaranes: convertir documentos administrativos a texto estructurado para sistemas de contabilidad, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Accesibilidad y archivística: generar versiones texto de documentos escaneados para lectores de pantalla o para repositorios digitales, ejecutando el modelo en GPU de consumo gracias a la cuantización Q8_0.
- Investigación en OCR: servir como referencia reproducible en formato GGUF para comparar pipelines de OCR de extremo a extremo frente a sistemas por etapas, con pesos portátiles y verificables por SHA256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje en Q8_0 ocupa 4,48 GB y el mmproj en F16 ocupa 0,67 GB, lo que suma aproximadamente 5,15 GB de pesos; hay que añadir el overhead de contexto y del runtime de llama.cpp.
- Cabe en GPU de consumo con al menos 8 GB de VRAM, como una RTX 3060 Ti, RTX 4060 Ti o RTX 4070.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100, aunque el modelo es pequeño y no requiere hardware de centro de datos.
- Despliegue mediante llama.cpp: `llama-server -m model.gguf --mmproj mmproj.gguf --reasoning off`.
- El flag `--reasoning off` es obligatorio para que la transcripción aparezca en `content`.
- Temperatura recomendada: 0.
- Renderizado de PDF recomendado: 400 DPI, redimensionando el lado más largo a 2048 px.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B (Q8_0 GGUF) | 4B | no disponible | Apache 2.0 | GGUF | OCR de extremo a extremo, salida Markdown con tablas en HTML |
| LightOnOCR-3-4B (original) | 4B | no disponible | Apache 2.0 | safetensors | Pesos originales en precisión completa |
| Alternativas de OCR de extremo a extremo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- El modelo está entrenado para transcripción con prompt vacío; otras instrucciones quedan fuera de distribución y pueden producir salidas incorrectas.
- Es necesario desactivar el modo de razonamiento (`--reasoning off`); de lo contrario, la salida se coloca en `reasoning_content` y `content` queda vacío.
- Riesgo de alucinación en documentos con baja calidad de escaneo, tipografías inusuales o layouts complejos; no se dispone de métricas publicadas de tasa de error.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas concretos soportados: no disponibles; el modelo base se describe como multilingüe, pero no se detalla la cobertura.
- Longitud de contexto: no disponible; documentos muy largos pueden requerir paginación.
- La cuantización Q8_0 introduce una pérdida de precisión respecto a los pesos originales, aunque el impacto concreto no está documentado.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución.
- El repositorio es una redistribución modificada de los pesos originales; conviene verificar los SHA256 publicados antes de desplegar.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/deAPI-ai/lightonocr-3-4b-q8
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Paper: https://arxiv.org/abs/2601.14251
- Código: https://github.com/lightonai/LightOnOCR
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LightOn: https://lighton.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Host del repositorio: https://gamerhash.com
