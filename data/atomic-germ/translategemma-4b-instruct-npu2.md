# Atomic-Germ/Translategemma-4B-Instruct-NPU2

## Resumen

TranslateGemma es una familia de modelos de traducción automática de código abierto desarrollada por Google, basada en la arquitectura Gemma 3. El modelo `Atomic-Germ/Translategemma-4B-Instruct-NPU2` es una variante específica del modelo original `google/translategemma-4b-it`, adaptada para su ejecución en unidades de procesamiento neuronal (NPU) de AMD Ryzen AI, como se desprende de los binarios `xclbin` alojados en el repositorio FastFlowLM. Esta adaptación no modifica el comportamiento del modelo original, sino que ofrece pesos y artefactos optimizados para inferencia en NPU.

El modelo está diseñado para traducción automática de texto e imágenes en 55 idiomas, con un tamaño de 4.000 millones de parámetros, lo que lo hace desplegable en entornos con recursos limitados como portátiles, equipos de escritorio o infraestructura cloud propia. Su relevancia actual radica en la democratización de la traducción de alta calidad con un modelo ligero que puede ejecutarse sin GPU dedicada, y esta versión concreta añade compatibilidad con NPUs de AMD Ryzen AI, ampliando las opciones de despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only, variante multimodal) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.000 tokens (según model card original) |
| Tipos de cuantizacion | no disponible (se desconoce si esta variante NPU2 usa cuantizacion específica) |
| Idiomas soportados | 55 idiomas (según model card; lista completa no disponible) |
| Licencia | Gemma (licencia de Google, requiere aceptación en Hugging Face) |
| Formato de pesos | safetensors (repo de 4,8 GB) |

## Arquitectura y entrenamiento

TranslateGemma se construye sobre la arquitectura Gemma 3, un transformer multimodal con capacidad de procesamiento de imágenes y texto. El modelo base fue entrenado por Google con un enfoque de aprendizaje supervisado para traducción, utilizando el chat template específico de TranslateGemma que permite tanto traducción directa de texto como extracción de texto de imágenes y su traducción. El entrenamiento se realizó sobre un corpus multilingüe extenso, aunque no se detallan los volúmenes exactos de tokens en la documentación disponible. La variante NPU2 no introduce cambios arquitectónicos; únicamente se añaden binarios de compilación para NPU (archivos `.xclbin`) que permiten la ejecución eficiente en aceleradores AMD Ryzen AI. No se mencionan técnicas de RLHF o DPO específicas para esta variante.

## Capacidades

- Traducción de texto entre 55 idiomas, incluyendo variantes regionales (ej. `en-US`, `de-DE`) mediante códigos ISO 639-1 y ISO 3166-1.
- Traducción de texto extraído de imágenes: el modelo acepta imágenes normalizadas a 896x896 píxeles, codificadas en 256 tokens, y produce traducción del texto visible en la imagen.
- Soporte de chat template específico que restringe roles a `user` y `assistant`, con estructura de entrada estricta (tipo `text` o `image`, códigos de idioma obligatorios).
- Capacidad de procesamiento de imágenes y texto de forma multimodal, aunque su foco principal es la traducción.
- No se documenta soporte de tool calling ni razonamiento multi-step; el modelo está optimizado para traducción directa.

## Casos de uso

- **Traducción automática de documentos técnicos**: el modelo puede traducir manuales, guías o documentación técnica de forma directa, aprovechando su contexto de 2K tokens para párrafos completos. Su tamaño ligero permite ejecutarlo en estaciones de trabajo sin GPU.
- **Traducción de contenido web en tiempo real**: integrable en extensiones de navegador o servicios de proxy para traducir páginas completas, con soporte para variantes regionales.
- **Extracción y traducción de texto de imágenes**: útil para traducir carteles, capturas de pantalla o documentos escaneados, gracias a su entrada de imagen a 896x896.
- **Despliegue en entornos edge con NPU**: esta variante NPU2 se puede ejecutar en portátiles con AMD Ryzen AI, reduciendo el consumo energético y mejorando la latencia en comparación con CPU.
- **Post-edición de traducciones automáticas**: aunque no oficialmente soportado, el modelo puede ser utilizado con prompts alternativos para mejorar traducciones generadas por otros sistemas, mediante la técnica de post-edición.
- **Localización de software y aplicaciones**: puede traducir cadenas de interfaz de usuario o mensajes de error, con la posibilidad de especificar variantes regionales para mercados concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de Google no incluye métricas comparativas (BLEU, COMET, etc.) en el texto proporcionado. Por tanto, no se pueden presentar datos numéricos de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con pesos en precisión completa (fp32) se requieren aproximadamente 8 GB de VRAM; con cuantización de 4 bits (si se aplica) se reduciría a ~2 GB, pero no se confirma que esta variante incluya cuantización.
- **GPU recomendadas**: funciona en GPUs con al menos 6 GB de VRAM (ej. RTX 3060, RTX 2060). Para la variante NPU2, se requiere una NPU AMD Ryzen AI (arquitectura XDNA) con los binarios `.xclbin` proporcionados.
- **Consumer GPU**: sí, cabe en GPUs de gama media y alta de consumo. La versión original también puede ejecutarse en CPU con suficiente RAM.
- **Opciones de despliegue**: con Transformers de Hugging Face (pipeline `image-text-to-text`), también compatible con vLLM o TGI si se adapta. Para NPU, el proyecto FastFlowLM proporciona herramientas de compilación y ejecución.
- **Latencia y throughput**: no se dispone de datos concretos. En NPU se espera menor latencia que en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TranslateGemma 4B (este) | 4B | 2K | 55 | Apache | Ligero, multimodal, orientado a traducción |
| NLLB-200 (Meta) | 600M - 54B | 512 | 202 | MIT | Modelo de traducción denso, no multimodal |
| M2M-100 (Meta) | 418M - 12B | 512 | 100 | MIT | Traducción multilingüe, sin visión |
| Gemma 3 4B (base) | 4B | 32K | 140 | Apache | Modelo base, no especializado en traducción |

La comparación es orientativa. TranslateGemma destaca por su multimodalidad y por estar optimizado para traducción directa, mientras que NLLB y M2M son más generales en idiomas pero sin visión. El contexto de TranslateGemma es menor (2K) que el de Gemma 3 base (32K), lo que limita su uso en documentos muy largos.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 2K tokens restringe la traducción de textos largos; se debe segmentar el contenido.
- **Sesgos y alucinaciones**: al ser un modelo de traducción, puede generar traducciones incorrectas en idiomas poco representados o con terminología técnica específica. No hay información sobre mitigación de sesgos.
- **Restricción de licencia**: la licencia Gemma (Apache) exige aceptación y puede tener restricciones adicionales para uso comercial; verificar términos de Google.
- **Dependencia de la NPU**: la variante NPU2 requiere los binarios `.xclbin` y el runtime de FastFlowLM; no es compatible con todas las NPU, solo con AMD Ryzen AI.
- **Chat template estricto**: el formato de entrada es rígido; no se aceptan otras estructuras de mensajes, lo que limita la flexibilidad en aplicaciones personalizadas.
- **Sin soporte oficial de tool calling**: no se puede usar como agente autónomo ni para tareas de razonamiento complejas.

## Enlaces

- Modelo en Hugging Face (esta variante): https://huggingface.co/Atomic-Germ/Translategemma-4B-Instruct-NPU2
- Modelo original de Google: https://huggingface.co/google/translategemma-4b-it
- Reporte técnico de TranslateGemma: https://arxiv.org/pdf/2601.09012
- Reporte técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Repositorio FastFlowLM (binarios NPU): https://github.com/FastFlowLM/FastFlowLM
- Guía de TranslateGemma en gemma-cookbook: https://deepwiki.com/google-gemini/gemma-cookbook/7.3-translategemma
