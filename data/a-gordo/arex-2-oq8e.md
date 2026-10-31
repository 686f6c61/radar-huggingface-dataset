# a-gordo/AREX-2-oQ8e

## Resumen

AREX-2-oQ8e es una cuantización no oficial, en formato MLX con método oQ8e, del modelo multimodal AREX-2 desarrollado por la Beijing Academy of Artificial Intelligence (BAAI). La conversión ha sido realizada por el usuario a-gordo usando la herramienta oMLX 0.7.0, y está pensada específicamente para su ejecución en hardware Apple Silicon (Mac con chips M系列). El modelo base, BAAI/AREX-2, es un modelo denso compatible con la arquitectura Qwen (identificador `qwen3_5`) con capacidades de imagen-texto-a-texto, y conserva el codificador visual completo en esta cuantización.

El problema que resuelve esta conversión es la ejecución local de un modelo multimodal de unos 27.000 millones de parámetros en Macs, donde frameworks como vLLM o CUDA no están disponibles. La cuantización oQ8e emplea cuantización afín de 8 bits con matriz de importancia (imatrix) calibrada sobre datos multilingües y de código, lo que reduce el tamaño del repositorio a 29,5 GB manteniendo el tokenizador y la plantilla de chat originales. Su relevancia actual radica en la creciente demanda de modelos multimodales cuantizados de alta fidelidad para inferencia local en entornos macOS, con licencia Apache-2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal denso compatible con Qwen (`qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 27.356.728.560 (dato real de los safetensors) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e: cuantización afín MLX de 8 bits base, tamaño de grupo 64, con imatrix mejorada; salida BF16 para tensores protegidos |
| Idiomas soportados | no disponible (los datos de calibración incluyen multilingüe y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6 shards, 29,50 GB en decimal) |

## Arquitectura y entrenamiento

AREX-2-oQ8e no es un modelo entrenado desde cero, sino una conversión de precisión del checkpoint BAAI/AREX-2 (revisión `d4e3502f92d9e889031c2d04e387ab2eb3520268`). La arquitectura subyacente es un modelo denso multimodal compatible con Qwen 3.5, con codificador visual retenido íntegramente en la conversión, tokenizador y plantilla de chat heredados del modelo original. El checkpoint de origen no contiene tensores MTP (multi-token prediction), por lo que esta cuantización tampoco los incluye.

El proceso de cuantización oQ8e, implementado en oMLX, aplica cuantización afín de 8 bits con tamaño de grupo 64 y calibración mejorada mediante matriz de importancia (imatrix). La calibración se realizó con el dataset integrado `oqe_code_multilingual` de oMLX, usando 128 muestras de 512 tokens cada una, y se aplicaron las 496 entradas de imatrix disponibles sobre los tensores correspondientes. La cabeza de salida (`language_model.lm_head`) carecía de entrada de imatrix, por lo que sigue la ruta estándar de cuantización oQ sin ponderación por imatrix. La calibración se efectuó sobre los pesos originales en precisión completa, sin proxies de precisión reducida.

## Capacidades

- Generación de texto conversacional multimodal (pipeline image-text-to-text): acepta imágenes y texto como entrada y genera texto.
- Comprensión visual: el codificador visual del modelo base se conserva en la conversión, aunque la inferencia con imágenes y vídeo no fue probada en la validación de este quant.
- Capacidades multilingües: los datos de calibración incluyen contenido multilingüe y de código, aunque la lista oficial de idiomas no está disponible.
- Generación y comprensión de código: el dataset de calibración `oqe_code_multilingual` sugiere énfasis en código, pero no hay datos publicados que lo cuantifiquen.
- No hay información disponible sobre tool calling, agentes, thinking mode, audio ni vídeo para esta conversión concreta; debe consultarse la model card del modelo base BAAI/AREX-2.

## Casos de uso

- Asistentes multimodales locales en Mac: ejecución íntegra en Apple Silicon sin servidores remotos, adecuada para desarrolladores que necesitan análisis de imágenes y conversación sin enviar datos a la nube.
- Análisis de documentos e imágenes en flujos de trabajo privados: al conservar el codificador visual, puede usarse para extraer información de capturas, diagramas o documentos escaneados manteniendo la privacidad de los datos.
- Prototipado de aplicaciones multimodales en macOS: la integración con MLX permite construir demos y aplicaciones nativas en Mac con latencias razonables al no requerir GPU de datacenter.
- Generación y revisión de código en local: la calibración con datos de código multilingüe lo hace adecuado para asistentes de programación que operan sin conexión.
- Evaluación comparativa de cuantizaciones: útil como referencia para comparar el método oQ8e frente a otras cuantizaciones (GGUF, 4-bit MLX) en términos de calidad y velocidad en Apple Silicon.
- Integración en pipelines de agentes locales: dado su tamaño y formato MLX, puede servir como motor de razonamiento en sistemas de agentes que se ejecutan completamente en estaciones de trabajo Mac de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte explícitamente que no se ejecutaron benchmarks de calidad, velocidad ni contexto completo para este quant, y que los resultados del modelo original no son aplicables a esta cuantización.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 29,50 GB en 8 bits; para la inferencia se recomienda disponer de al menos 32-36 GB de memoria unificada, dejando margen para el KV cache y el sistema (estimación basada en el tamaño de los pesos; no hay cifra oficial).
- Hardware validado: Apple M3 Ultra (la validación local se realizó con oMLX 0.7.0 sobre un M3 Ultra).
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en Macs con chips de la serie M con suficiente memoria unificada (M2/M3/M4 Ultra o Max con 32 GB o más, estimación); no es aplicable a GPUs NVIDIA de consumo como la RTX 4090 por tratarse de un formato MLX.
- Despliegue: requiere una instalación compatible de oMLX (versión 0.7.0 usada en la validación) en Apple Silicon. No es directamente compatible con vLLM, llama.cpp, Ollama o TGI en su formato actual.
- Latencia y throughput: no disponibles; no se publicaron mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| AREX-2-oQ8e (este modelo) | 27.356.728.560 | oQ8e (8-bit afín con imatrix) | safetensors MLX | Apache-2.0 | Apple Silicon (oMLX) |
| BAAI/AREX-2 (modelo base) | no disponible | Sin cuantizar | no disponible | no disponible | no disponible |
| Cuants MLX 4-bit de modelos multimodales de tamaño similar (p. ej. conversiones Qwen) | no disponible | 4-bit MLX | safetensors MLX | varía | Apple Silicon |

No hay datos suficientes en la informacion disponible para una comparativa de rendimiento numérica con alternativas concretas.

## Limitaciones y advertencias

- No es una publicación oficial de BAAI: la conversión es de un tercero (a-gordo) y no implica respaldo por parte de BAAI ni de jundot.
- No se ejecutó ningún benchmark de calidad, velocidad ni contexto completo sobre este quant: los resultados publicados del modelo base no son extrapolables directamente a esta cuantización.
- La inferencia con imágenes y vídeo no fue probada durante la validación, pese a que los pesos del codificador visual están retenidos.
- La cabeza de salida se cuantizó por la ruta estándar oQ sin imatrix, lo que podría afectar marginalmente a la calidad de la distribución de salida.
- Riesgo de alucinación, sesgos y limitaciones de idioma: deben consultarse en la model card del modelo base BAAI/AREX-2; no están documentados en esta conversión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card indica seguir los avisos y términos del modelo fuente original.
- La longitud de contexto máxima no está documentada en la informacion disponible.
- Para producción conviene verificar los checksums SHA-256 incluidos en `quantization_info.json` antes de desplegar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/a-gordo/AREX-2-oQ8e
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Proyecto original: https://github.com/VectorSpaceLab/AREX-2
- Paper: https://arxiv.org/abs/2609.38288
- Método de cuantización oMLX: https://github.com/jundot/omlx
- Autor de la conversión: https://huggingface.co/a-gordo
- Información de cuantización y checksums: https://huggingface.co/a-gordo/AREX-2-oQ8e/blob/main/quantization_info.json
- Organización BAAI: https://huggingface.co/BAAI
