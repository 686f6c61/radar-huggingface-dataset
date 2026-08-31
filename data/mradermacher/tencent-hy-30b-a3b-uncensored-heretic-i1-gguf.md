# mradermacher/Tencent-Hy-30B-A3B-uncensored-heretic-i1-GGUF

## Resumen

Este modelo es una cuantización GGUF con imatrix del modelo `0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic`, una versión modificada del modelo de traducción multilingüe Hy-MT2-30B-A3B desarrollado por Tencent. La modificación principal consiste en la aplicación de técnicas de "abliteration" (eliminación de direcciones de rechazo) y un LoRA denominado "heretic", que eliminan los filtros de contenido del modelo original, dando lugar a una variante sin censura. El resultado es un modelo de traducción automática neuronal (NMT) de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos, capaz de traducir entre 33 idiomas.

La relevancia de esta ficha radica en que ofrece una opción de traducción multilingüe de alta capacidad en un formato GGUF optimizado para inferencia local, con un único archivo cuantizado a Q2_K de aproximadamente 11,2 GB. Esto permite ejecutar el modelo en hardware de consumo, aunque con la degradación de calidad inherente a una cuantización tan agresiva. Al ser una versión "uncensored", es especialmente útil para tareas de traducción que requieran manejar terminología sensible o contenido que los modelos alineados suelen rechazar, pero también conlleva riesgos importantes de generación de contenido inapropiado.

El autor de la cuantización es mradermacher, conocido por producir cuantizaciones GGUF de alta calidad con matrices de importancia (imatrix). El modelo base se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,2 GB) + archivo imatrix |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un modelo de traducción automática neuronal de tipo Transformer con arquitectura MoE (Mixture of Experts), donde de los 30B parámetros totales solo 3B se activan por token. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, reduciendo la latencia y el consumo de memoria durante la inferencia. El modelo fue entrenado por Tencent para traducción multilingüe entre 33 idiomas, con capacidad para seguir instrucciones de traducción en varios idiomas, según se describe en el repositorio oficial de Hy-MT2.

La versión "uncensored-heretic" aplica técnicas de abliteration, que consisten en identificar y eliminar las direcciones del espacio de activaciones responsables de comportamientos de rechazo o censura, junto con un LoRA específico ("heretic") que refuerza la eliminación de restricciones. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF o DPO en el modelo original. La cuantización GGUF con imatrix fue realizada por mradermacher, que utiliza matrices de importancia para mejorar la calidad de los quants de baja precisión.

## Capacidades

- Traducción automática multilingüe entre 33 idiomas, incluyendo lenguas con pocos recursos como km (jemer), my (birmano), bo (tibetano) o ug (uigur).
- Seguimiento de instrucciones de traducción en múltiples idiomas, permitiendo especificar estilo, tono o terminología.
- Generación de texto libre en los idiomas soportados, aunque su entrenamiento principal es la traducción.
- Al ser una versión "uncensored", puede traducir contenido que los modelos alineados rechazarían, como terminología médica explícita, lenguaje soez o contextos políticamente sensibles.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso ni modos de pensamiento explícitos. El modelo está orientado a tareas de traducción, no a agentes conversacionales generales.

## Casos de uso

- Localización de software y sitios web: el modelo puede traducir cadenas de interfaz, documentación técnica y contenido dinámico entre los 33 idiomas soportados, manteniendo coherencia terminológica gracias a su capacidad de seguir instrucciones.
- Traducción de documentos legales y contractuales: al no tener filtros de contenido, puede procesar cláusulas con lenguaje complejo o sensible sin rechazos, aunque se recomienda revisión humana por la posible degradación de calidad en Q2_K.
- Atención al cliente multilingüe: integrado en un sistema de traducción en tiempo real, permite a agentes humanos comunicarse con usuarios en su idioma nativo, cubriendo un espectro amplio de lenguas.
- Traducción de contenido generado por usuarios en redes sociales o foros: el modelo maneja registros informales, jerga y expresiones coloquiales, algo que los modelos de traducción estándar suelen manejar peor.
- Investigación lingüística y procesamiento de corpus: útil para traducir grandes volúmenes de texto en lenguas minoritarias (km, my, bo, ug) donde otros modelos tienen poca cobertura.
- Creación de datasets multilingües: el modelo puede generar traducciones sintéticas para entrenar o evaluar otros sistemas de traducción, especialmente en dominios especializados donde los datos paralelos escasean.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en métricas específicas de traducción como BLEU o COMET para esta variante cuantizada. El modelo base Hy-MT2 podría tener resultados publicados en el repositorio de Tencent, pero no se han proporcionado en la documentación consultada.

## Requisitos de hardware

- El archivo cuantizado i1-Q2_K ocupa 11,2 GB, por lo que se necesita al menos 12-14 GB de VRAM para cargar el modelo en GPU, más memoria para el contexto y las activaciones. Una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente.
- Al ser un modelo MoE con solo 3B parámetros activos, la memoria requerida para las activaciones es relativamente baja, lo que permite ejecutarlo en GPUs con 16 GB de VRAM si se usa un contexto moderado.
- En CPU, se puede ejecutar con llama.cpp u Ollama, pero la velocidad será lenta; se recomienda al menos 32 GB de RAM para evitar swapping.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. No es compatible directamente con vLLM o TGI en su formato GGUF, aunque se podría convertir a safetensors si se desea.
- La latencia y el throughput no están documentados para esta cuantización. Como referencia, un MoE de 3B activos en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con Q2_K, pero estos valores son estimaciones y no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tencent-Hy-30B-A3B-uncensored-heretic (este) | 30B totales, 3B activos | no disponible | 33 | Apache 2.0 | GGUF (Q2_K) |
| Hy-MT2-7B (original) | 7B densos | no disponible | 33 | Apache 2.0 | safetensors |
| NLLB-200-3.3B (Meta) | 3.3B densos | 512 tokens | 200+ | CC-BY-NC | safetensors |
| M2M-100-12B (Meta) | 12B densos | 1024 tokens | 100 | MIT | safetensors |

La comparativa se basa en características generales, ya que no se dispone de resultados de benchmarks para esta variante. El modelo de Tencent destaca por su arquitectura MoE eficiente y su cobertura de 33 idiomas, incluyendo lenguas asiáticas y tibetanas poco comunes. NLLB-200 cubre más idiomas pero tiene una licencia no comercial. M2M-100 es más antiguo y con menos idiomas. La versión "uncensored" no tiene equivalente directo en los otros modelos, que mantienen filtros de contenido estándar.

## Limitaciones y advertencias

- Al ser una versión "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, violento, sexualmente explícito o ilegal sin restricciones. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- La cuantización Q2_K es de muy baja precisión y puede degradar significativamente la calidad de la traducción, especialmente en idiomas con menos representación o en textos técnicos complejos.
- No se dispone de información sobre la longitud de contexto soportada; es probable que sea limitada (típicamente 2048 o 4096 tokens en modelos de traducción), lo que restringe la traducción de documentos largos de una sola vez.
- El modelo está especializado en traducción; su rendimiento en tareas de generación de texto general, razonamiento o código no está garantizado y probablemente sea inferior al de modelos de propósito general.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original de Tencent puede tener términos adicionales; se recomienda verificar la licencia del modelo base antes de su uso en producción.
- No hay garantías de soporte o mantenimiento; el autor de la cuantización no proporciona actualizaciones ni correcciones.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Tencent-Hy-30B-A3B-uncensored-heretic-i1-GGUF)
- [Modelo base (0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic)](https://huggingface.co/0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic)
- [Versión estática de quants (sin imatrix)](https://huggingface.co/mradermacher/Tencent-Hy-30B-A3B-uncensored-heretic-GGUF)
- [Repositorio oficial de Hy-MT2 en GitHub](https://github.com/Tencent-Hunyuan/Hy-MT2)
- [Página de solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
