# AminiTech/Soma-1X-lite

## Resumen

Soma-1X Lite es un modelo de lenguaje y visión (vision-language model, VLM) de 2.213.241.664 parámetros desarrollado por Amini (AminiTech) para el análisis y la extracción estructurada de documentos. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-2B, por lo que hereda la arquitectura Qwen3.5 y la familia de pesos `Qwen3_5ForConditionalGeneration`, con pipeline `image-text-to-text`. Su función principal es transformar imágenes de documentos en representaciones legibles por máquina que preservan el contenido textual, los elementos semánticos, la información espacial (bounding boxes) y el orden de lectura.

El modelo destaca por combinar un tamaño reducido (2B parámetros, 4,5 GB de repositorio) con resultados competitivos en tareas de parsing documental: 84,7 en olmOCR-Bench y 84,37 en OmniParse-Bench, que ascienden a 86,53 con inferencia multipaso. Además, incorpora transcripción multilingüe con un error medio de carácter del 2,90 % en diez lenguas africanas evaluadas, y se distribuye con licencia Apache 2.0, lo que facilita su despliegue en infraestructura privada.

Es relevante ahora porque ofrece una alternativa de pesos abiertos y tamaño contenido para digitalización documental, OCR estructurado y análisis de maquetación, con soporte declarado para trece idiomas (incluyendo varias lenguas africanas poco cubiertas por otros modelos) y capacidad de ejecutarse mediante transformers o vLLM con una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-language |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado con `--max-model-len 32768` en vLLM); no se especifica contexto nativo distinto |
| Tipos de cuantizacion | no disponible (la model card solo muestra inferencia en `bfloat16`) |
| Idiomas soportados | en, fr, es, sw, yo, ha, wo, ln, xh, af, rw, ny, sg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Soma-1X Lite es un ajuste fino del modelo Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 orientado a entrada imagen-texto y salida de texto. El modelo procesa imágenes de documentos (páginas renderizadas, típicamente con borde largo de 1792 píxeles) junto con un prompt de sistema y de usuario predefinidos, y genera una secuencia estructurada de bloques `<block>` con etiqueta semántica, coordenadas de bounding box y contenido. La salida admite tablas en HTML y expresiones matemáticas en LaTeX, y las cajas se expresan como `x0 y0 x1 y1` sobre una rejilla de 0 a 1000 relativa a la imagen de la página.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que el modelo fue entrenado con un system prompt y un user prompt específicos (disponibles como `system_prompt.txt` y `user_prompt.txt` en el repositorio), y que la inferencia recomendada desactiva el modo thinking (`enable_thinking=False`). Entre las capacidades técnicas destacadas están la extracción conjunta de contenido, elementos semánticos, bounding boxes y orden de lectura, la transcripción multilingüe y la inferencia multipaso, que eleva la puntuación en OmniParse-Bench de 84,37 a 86,53.

## Capacidades

- Parsing estructurado de documentos: genera un bloque por elemento de página con etiqueta semántica (`text`, `heading`, `caption`, `footnote`, `page_header`, `page_footer`, `annotation`, `image`, `chart`, `diagram`, `map`, `stamp`, `signature`, `table`, `equation`), coordenadas y contenido.
- Reconocimiento de tablas en HTML y de expresiones matemáticas en LaTeX.
- Análisis de maquetación (layout analysis) y preservación del orden de lectura.
- OCR y transcripción de texto impreso y manuscrito (tag `handwriting`).
- Transcripción multilingüe en trece idiomas, con evaluación específica en diez lenguas africanas.
- Procesamiento de documentos PDF mediante renderizado de páginas a imagen con PyMuPDF.
- Conversacional: soporta plantilla de chat con roles system/user y modo thinking desactivable.
- Despliegue con API compatible con OpenAI a través de vLLM.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada (la inferencia multipaso se menciona solo como técnica de mejora de puntuación).

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte páginas escaneadas en bloques estructurados con texto, tablas y firmas, lo que permite indexar y buscar contenido en repositorios históricos o gubernamentales sin transcripción manual.
- Extracción de tablas financieras y formularios: al generar tablas en HTML y bounding boxes, se puede alimentar un pipeline ETL que valide y cargue datos de facturas, estados mensuales o registros contables en bases de datos relacionales.
- OCR de documentos manuscritos: la etiqueta `handwriting` y el bajo error de carácter en lenguas africanas lo hacen adecuado para digitalizar registros civiles, actas o formularios rellenados a mano en contextos multilingües.
- Procesamiento de PDF en producción: renderizando páginas con PyMuPDF a 1792 píxeles de borde largo y sirviendo el modelo con vLLM, se puede construir un servicio de parsing documental con API compatible con OpenAI y despliegue en infraestructura privada.
- Análisis de maquetación para accesibilidad: la detección de encabezados, notas al pie, leyendas y orden de lectura permite generar versiones accesibles o reflow de documentos preservando la jerarquía semántica.
- Extracción de contenido científico y técnico: la conversión de ecuaciones a LaTeX y de tablas a HTML facilita la ingestión de artículos y manuales en sistemas de búsqueda o bases de conocimiento.
- Procesamiento multilingüe en África subsahariana: con soporte para sw, yo, ha, wo, ln, xh, af, rw, ny y sg, puede emplearse en la digitalización de documentación local donde otros modelos carecen de cobertura lingüística.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| olmOCR-Bench | 84,7 |
| OmniParse-Bench | 84,37 |
| OmniParse-Bench (inferencia multipaso) | 86,53 |
| Error medio de carácter (10 lenguas africanas) | 2,90 % |

No se han publicado en la información disponible resultados comparativos con otros modelos para MMLU, HumanEval, GSM8K u otros benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: en `bfloat16`, los 2.213.241.664 parámetros ocupan aproximadamente 4,4 GB de pesos, por lo que se recomienda al menos 8 GB de VRAM para margen de activaciones y caché KV; el repositorio completo ocupa 4,5 GB.
- GPU recomendadas: A100, H100 o GPUs con al menos 8-16 GB de VRAM para servir con vLLM; una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto amplio.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en bfloat16; con cuantización no documentada no se puede confirmar requisitos menores.
- Opciones de despliegue: Hugging Face Transformers (`Qwen3_5ForConditionalGeneration`, `AutoProcessor`), vLLM con API compatible con OpenAI (`vllm serve`, `--max-model-len 32768`, `--gpu-memory-utilization 0.90`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría (VLM de 2B para parsing documental) que permitan una comparación rigurosa de parámetros, contexto, benchmarks y licencia. Los únicos datos disponibles son los benchmarks propios del modelo (olmOCR-Bench 84,7; OmniParse-Bench 84,37) sin resultados de referencia de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un finetune de Qwen3.5-2B, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no cuantificado en la model card; en tareas de OCR y parsing, la generación de contenido no presente en la imagen es un riesgo inherente que debe validarse en producción.
- Limitaciones de contexto o idioma: el contexto configurado es de 32.768 tokens; el soporte multilingüe se declara para trece idiomas, sin datos de rendimiento para el resto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base Qwen/Qwen3.5-2B.
- Caveats para producción: el modelo requiere los prompts específicos de entrenamiento (`system_prompt.txt` y `user_prompt.txt`); desviarse de ellos puede degradar la calidad. La inferencia recomendada usa `enable_thinking=False` y `do_sample=False`. Las coordenadas de las cajas usan una rejilla 0-1000 relativa a la imagen, por lo que el preprocesado (renderizado a 1792 píxeles de borde largo) debe ser consistente.
- No se documentan tipos de cuantización soportados ni latencias, lo que limita la planificación de despliegues con restricciones estrictas de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/AminiTech/Soma-1X-lite
- Sitio del desarrollador: https://amini.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Prompts de referencia en el repositorio: `system_prompt.txt` y `user_prompt.txt` (https://huggingface.co/AminiTech/Soma-1X-lite/blob/main/system_prompt.txt, https://huggingface.co/AminiTech/Soma-1X-lite/blob/main/user_prompt.txt)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
