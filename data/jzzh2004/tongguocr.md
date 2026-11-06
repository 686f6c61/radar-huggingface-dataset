# jzzh2004/TongGuOCR

## Resumen
TongGuOCR es un modelo multimodal de tipo image-text-to-text especializado en el reconocimiento óptico de caracteres (OCR) de documentos históricos chinos. Lo desarrolla un equipo académico encabezado por Zhongheng Zhou y Lianwen Jin, y se distribuye bajo licencia Apache-2.0. El modelo parte de GLM-OCR (zai-org/GLM-OCR, licencia MIT) y lo adapta mediante un vocabulario ampliado de 84.083 tokens y un pipeline de página completa que combina detección de maquetación, construcción de bloques, refinado de recortes y procesamiento de tokens de relación.

La arquitectura es `GlmOcrForConditionalGeneration`, una variante de transformer multimodal para entrada imagen-texto con 1.183.256.576 parámetros totales (aproximadamente 1,18 mil millones). El checkpoint publicado corresponde a la etapa final (Stage 3) de entrenamiento, con pesos en safetensors de 4,73 GB. El repositorio incluye además un checkpoint independiente de detección de líneas de texto (`layout/finetune_infer.pth`, 122 MB) necesario para reproducir los resultados del pipeline de página completa.

Su relevancia actual radica en que aborda un nicho poco cubierto por los OCR generalistas: los documentos históricos chinos, con maquetación compleja, tipografías antiguas y variabilidad de calidad de escaneo. El modelo se acompaña de paper (arXiv:2608.07917), repositorio de código, página de proyecto y demo en línea, lo que facilita su evaluación y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmOcrForConditionalGeneration (transformer multimodal image-text-to-text, adaptado de GLM-OCR) |
| Parametros totales | 1.183.256.576 (aprox. 1,18 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; la generación valida usa como máximo 8.192 tokens de salida y un presupuesto de imagen de 1.048.576 píxeles por recorte |
| Tipos de cuantizacion | no disponible (la configuración validada usa bf16) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (adaptaciones propias); el modelo base GLM-OCR conserva términos MIT |
| Formato de pesos | safetensors (model.safetensors, 4.733.086.904 bytes); checkpoint de detección en .pth (122.471.457 bytes) |

## Arquitectura y entrenamiento
El modelo es un MLLM (modelo de lenguaje multimodal) construido sobre GLM-OCR mediante `GlmOcrForConditionalGeneration`, con un vocabulario expandido hasta 84.083 tokens para cubrir los caracteres y patrones propios de los documentos históricos chinos. El pipeline de inferencia de página completa no se limita al checkpoint OCR: integra detección de maquetación, construcción de bloques, refinado de recortes y procesamiento de tokens de relación, implementados en el repositorio de código. El checkpoint publicado es el resultado final de la etapa 3 de entrenamiento.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF o DPO. La model card indica explícitamente que los conjuntos de entrenamiento y evaluación no se incluyen en el repositorio del modelo. La configuración de inferencia validada emplea bf16, decodificación greedy, un máximo de 8.192 tokens de salida y un presupuesto de 1.048.576 píxeles por recorte de reconocimiento; el repositorio de código menciona además un backend opcional basado en vLLM.

## Capacidades
- Reconocimiento de texto en imágenes (OCR) de documentos históricos chinos, con soporte de maquetación compleja.
- Detección de líneas de texto mediante un checkpoint específico (`layout/finetune_infer.pth`).
- Procesamiento de página completa: detección de maquetación, construcción de bloques, refinado de recortes y relación entre bloques.
- Generación de texto condicionada a imagen en formato conversacional (pipeline image-text-to-text, tag `conversational`).
- Manejo de vocabulario ampliado (84.083 tokens) orientado a caracteres y variantes de escritura histórica.
- Salida de hasta 8.192 tokens por generación en la configuración validada.
- Soporte de backend vLLM opcional según el repositorio de código.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso
- Digitalización de archivos históricos: el modelo reconoce texto en documentos chinos antiguos con maquetación irregular, lo que permite convertir colecciones escaneadas en texto plano indexable y preservar el contenido para investigación.
- Construcción de corpus para humanidades digitales: al integrarse en el pipeline de página completa (detección de maquetación más OCR), facilita la generación de transcripciones alineadas con la estructura del documento original.
- Preservación y acceso a bibliotecas digitales: permite enriquecer catálogos con texto extraído automáticamente de manuscritos e impresos antiguos, mejorando la búsqueda full-text sobre fondos históricos.
- Investigación filológica y lingüística histórica: la salida OCR sirve como base para análisis de frecuencia de caracteres, variantes gráficas y evolución del léxico en corpus chinos premodernos.
- Automatización de flujos de archivo en instituciones: el repositorio de código y los checkpoints separados (OCR y detección) permiten orquestar pipelines por lotes sobre grandes volúmenes de escaneos con configuración bf16 y decodificación greedy reproducible.
- Evaluación comparativa de OCR histórico: al publicarse métricas sobre MTHv2 y M5HisDoc, el modelo sirve como referencia para comparar sistemas de OCR en documentos históricos chinos en entornos de investigación.
- Integración en aplicaciones de consulta documental: mediante el formato conversacional image-text-to-text, puede incorporarse a interfaces que reciben una imagen de página y devuelven la transcripción solicitada.

## Benchmarks y rendimiento
Resultados publicados en el paper:

| Dataset | AR | CR | NED | RO-ED x100 |
|---|---:|---:|---:|---:|
| MTHv2 | 97,93 | 98,33 | 2,05 | 1,51 |
| M5HisDoc | 93,76 | 94,46 | 6,15 | 3,49 |

La model card advierte de que la inferencia nueva puede diferir ligeramente según el backend y la configuración de lote; el repositorio de código recoge los resultados frescos y el protocolo de métricas en `evaluation/README.md`. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 1,18 mil millones de parámetros en bf16, el peso de los parámetros ronda los 2,4 GB, a lo que hay que sumar el coste de activaciones y del procesamiento de imagen (presupuesto de 1.048.576 píxeles por recorte).
- GPU recomendadas: no disponible en la información proporcionada; el tamaño del modelo sugiere que puede ejecutarse en GPU de consumo con suficiente memoria, pero no se confirma en la documentación.
- Cabe en GPU de consumo: probable por el número de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: el repositorio de código documenta un entorno de inferencia propio (`python -m tongguocr`) y un backend opcional basado en vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: cargar únicamente el checkpoint OCR no reproduce los resultados del pipeline de página completa; es necesario el checkpoint de detección y el código de orquestación.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos alternativos comparables, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, el propio modelo se basa en GLM-OCR (zai-org/GLM-OCR, licencia MIT), que constituye la alternativa directa más próxima, pero no se aportan sus especificaciones ni métricas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TongGuOCR | 1,18 mil millones | no disponible | Apache-2.0 (adaptaciones); base MIT | Hugging Face, ModelScope International, GitHub |
| GLM-OCR (base) | no disponible | no disponible | MIT | no disponible en esta información |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo especializado exclusivamente en OCR de documentos históricos chinos; no es un modelo de propósito general.
- Idioma limitado al chino (tag `zh`); no se documenta soporte multilingüe.
- No se han publicado análisis de sesgos en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos: la salida puede contener texto inventado o corregido respecto al original, especialmente en documentos degradados.
- La carga aislada del checkpoint OCR no reproduce los resultados del pipeline; requiere el detector de líneas y el código de orquestación.
- Los resultados pueden variar según backend y configuración de lote.
- Los conjuntos de entrenamiento y evaluación no se distribuyen con el modelo, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia: las adaptaciones propias son Apache-2.0, pero el modelo base GLM-OCR conserva términos MIT y pueden aplicarse condiciones de terceros recogidas en `THIRD_PARTY_NOTICES.md`; conviene revisarlas antes de uso comercial.
- El checkpoint de detección HDC se distribuye bajo Apache-2.0 según el propietario, con posibles términos de terceros aún vigentes.
- Repositorio con muy pocas descargas (2) y un único like en el momento de la consulta: ecosistema y validación comunitaria aún incipientes.

## Enlaces
- Hugging Face: https://huggingface.co/jzzh2004/TongGuOCR
- Paper: https://arxiv.org/abs/2608.07917
- Código e instalación: https://github.com/jzzh2004/TongGuOCR
- Página del proyecto: https://jzzh2004.github.io/TongGuOCR
- Demo en línea: https://guji-ocr.com
- ModelScope International: https://modelscope.ai/models/jzzh2004/TongGuOCR
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
