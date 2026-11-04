# Rakuten/RakutenAI-3.0.1

## Resumen

RakutenAI-3.0.1 es un modelo de lenguaje de gran escala desarrollado por Rakuten Group, Inc. Se trata de un ajuste posterior (post-training) sobre RakutenAI-3.0, que a su vez es un modelo Mixture of Experts (MoE) de aproximadamente 671 000 millones de parámetros totales con 37 000 millones activados por token, construido mediante preentrenamiento continuo sobre DeepSeek-V3-0324. El modelo está optimizado específicamente para japonés e inglés, con especial énfasis en el conocimiento de la lengua y la cultura japonesas.

La relevancia de esta versión 3.0.1 radica en su alineamiento reforzado con principios de seguridad: según la model card, la tasa de respuestas inofensivas ante peticiones dañinas de un solo turno (en japonés e inglés) asciende al 93,2 %, frente al 80,0 % de RakutenAI-3.0 y el 79,0 % de DeepSeek-V3-0324. Mantiene una ventana de contexto de 128 000 tokens y se distribuye bajo licencia Apache 2.0, aunque con acceso restringido (gated) y una restricción explícita de uso en la Unión Europea y el Espacio Económico Europeo.

El modelo se publica en formato safetensors con pesos en fp8 y un tamaño de repositorio de 688,6 GB, lo que lo sitúa en la categoría de modelos que requieren infraestructura multigpu para inferencia. Su arquitectura subyacente es la de DeepSeek-V3, lo que permite reutilizar herramientas de despliegue ya optimizadas para dicha familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en DeepSeek-V3 |
| Parámetros totales | 671B (según model card); 684 489 845 504 según safetensors |
| Parámetros activos | 37B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | Pesos publicados en fp8; no se detallan otras cuantizaciones oficiales |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

RakutenAI-3.0.1 emplea una arquitectura transformer con mezcla de expertos (MoE), heredada de DeepSeek-V3-0324, que activa 37 000 millones de parámetros por token sobre un total de 671 000 millones. El modelo se construyó mediante preentrenamiento continuo sobre la base DeepSeek-V3-0324, incorporando datos bilingües originales de alta calidad de Rakuten, con el objetivo de reforzar la comprensión del japonés y su contexto cultural. Posteriormente, RakutenAI-3.0.1 aplica un post-entrenamiento orientado a la seguridad sobre RakutenAI-3.0.

El proceso de post-entrenamiento utilizó conjuntos de datos relacionados con seguridad, entre ellos AdvBench, CatQA, DiaSafety, Gandalf, GEST, IPBench, JADE, SafeText, SGXSTest, WMDP, XSafety y porciones de Wikipedia, además de datos anotados y sintéticos. La model card no especifica el volumen total de tokens de entrenamiento ni detalla si se emplearon técnicas concretas como RLHF o DPO, por lo que esos datos deben considerarse no disponibles. La innovación principal declarada es la mejora del alineamiento de seguridad respecto al modelo base y a DeepSeek-V3-0324, manteniendo las capacidades del modelo original.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con especial dominio del registro y matices culturales japoneses.
- Razonamiento y respuesta a instrucciones de propósito general heredados de la arquitectura DeepSeek-V3.
- Soporte de tool calling / function calling, con parser dedicado `deepseekv3` en SGLang.
- Capacidad de operar en flujos de agentes y razonamiento multi-paso, aunque la model card no detalla funcionalidades específicas de agentes.
- Manejo de contextos largos de hasta 128 000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Alineamiento de seguridad reforzado: 93,2 % de respuestas inofensivas ante peticiones dañinas de un solo turno en japonés e inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Atención al cliente en japonés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens, lo que permite mantener el historial completo de una interacción y consultar documentación extensa de producto sin truncar información.
- Generación y revisión de contenido en japonés: redacción de textos corporativos, correos y materiales de marketing con conocimiento de las convenciones culturales y lingüísticas japonesas, aprovechando el preentrenamiento continuo sobre datos originales de Rakuten.
- Asistentes internos con tool calling: integración en pipelines empresariales mediante function calling para consultar bases de datos, APIs o sistemas de ticketing, usando el parser `deepseekv3` en SGLang.
- Análisis de documentos largos: resumen y extracción de información de contratos, informes o normativas de hasta 128K tokens, útil en entornos legales y de compliance en Japón.
- Moderación y filtrado de contenido: el alineamiento de seguridad mejorado (93,2 % de respuestas inofensivas) lo hace adecuado como componente de sistemas de revisión de contenido generado o de interacciones de usuario.
- Traducción y adaptación cultural entre japonés e inglés: el modelo bilingüe puede emplearse para localización de productos y documentación, con sensibilidad hacia matices culturales que un modelo genérico podría pasar por alto.
- Prototipado de aplicaciones conversacionales para el mercado japonés: equipos que necesiten un modelo abierto con licencia Apache 2.0 y buen dominio del japonés pueden desplegarlo en infraestructura propia con SGLang.

## Benchmarks y rendimiento

La única métrica de rendimiento publicada en la información disponible es la tasa de respuestas inofensivas ante peticiones dañinas de un solo turno en japonés e inglés:

| Modelo | Tasa de respuestas inofensivas |
|---|---|
| RakutenAI-3.0.1 | 93,2 % |
| RakutenAI-3.0 | 80,0 % |
| DeepSeek-V3-0324 | 79,0 % |

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp8 y 671B parámetros, se requieren aproximadamente 671 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, el despliegue exige múltiples GPUs de alta capacidad.
- GPU recomendadas: el ejemplo oficial de SGLang usa `--tp 8`, es decir, tensor parallelism sobre 8 GPUs. Son adecuadas configuraciones con 8×H100 (80 GB) o 8×A100 (80 GB); con fp8, 8×80 GB = 640 GB queda justo por debajo del tamaño de los pesos, por lo que puede requerir más GPUs o cuantización adicional.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: SGLang (imagen Docker recomendada `lmsysorg/sglang:v0.5.13`, con `--tool-call-parser deepseekv3` y `--tp 8`). La model card remite al SGLang cookbook para más opciones; no se documentan recetas oficiales para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| RakutenAI-3.0.1 | 671B | 37B | 128K | Apache 2.0 (gated, no UE/EEE) | ja, en | HuggingFace |
| RakutenAI-3.0 | 671B | 37B | 128K | Apache 2.0 (según modelo base) | ja, en | HuggingFace |
| DeepSeek-V3-0324 | 671B (aprox.) | 37B (aprox.) | 128K (aprox.) | MIT | multilingüe | HuggingFace |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de benchmarks de capacidades generales para establecer comparaciones cuantitativas más allá de la tasa de respuestas inofensivas. RakutenAI-3.0.1 se diferencia de DeepSeek-V3-0324 por su especialización en japonés y su alineamiento de seguridad reforzado, a costa de una licencia con restricciones geográficas y acceso gated.

## Limitaciones y advertencias

- Restricción geográfica explícita: el modelo NO está destinado ni disponible para usuarios o entidades residentes en la Unión Europea o el Espacio Económico Europeo; el proveedor no lo ha introducido ni pretende introducirlo en el mercado de la UE.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace para su descarga.
- Riesgo de alucinación y sesgos: como todo modelo de gran escala, puede generar texto sesgado, inexacto o inseguro, así como contenido que infrinja derechos de terceros; la model card recomienda implantar salvaguardas en producción.
- Idiomas limitados a japonés e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea inferior.
- Aunque la licencia es Apache 2.0, la restricción de uso en la UE/EEE debe verificarse legalmente antes de cualquier despliegue comercial en esas regiones.
- El tamaño del modelo (688,6 GB de repositorio) implica costes de infraestructura elevados y limita su uso a organizaciones con acceso a clústeres multigpu.
- No se documentan resultados de benchmarks de capacidades generales, lo que dificulta evaluar su rendimiento frente a alternativas en tareas de razonamiento o código.
- La model card no especifica el volumen ni la composición completa de los datos de entrenamiento, ni si se aplicaron RLHF o DPO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rakuten/RakutenAI-3.0.1
- Modelo base RakutenAI-3.0: https://huggingface.co/Rakuten/RakutenAI-3.0
- Blog (inglés): https://ai.rakuten.com/rakutens-approach-to-safe-and-helpful-ai/
- Blog (japonés): https://ai.rakuten.com/rakutens-approach-to-safe-and-helpful-ai-ja/
- SGLang: https://github.com/sgl-project/sglang
- Imagen Docker SGLang v0.5.13: https://hub.docker.com/layers/lmsysorg/sglang/v0.5.13/images/sha256-952ebb195c41b10dc01fa63c41c9bfc14f2ee02ffe8da71e11aeab5f3f7c7772
- SGLang cookbook (DeepSeek-V3): https://lmsysorg.mintlify.app/cookbook/autoregressive/DeepSeek/DeepSeek-V3
- Rakuten AI: https://ai.rakuten.com/
- AdvBench: https://github.com/llm-attacks/llm-attacks/tree/main/data/advbench
- CatQA: https://huggingface.co/datasets/declare-lab/CategoricalHarmfulQA
- DiaSafety: https://github.com/thu-coai/DiaSafety
- Gandalf: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- GEST: https://github.com/kinit-sk/gest
- IPBench: https://huggingface.co/datasets/IPBench/IPBench
- JADE: https://github.com/whitzard-ai/jade-db/tree/main
- SafeText: https://github.com/sharonlevy/SafeText
- SGXSTest: https://huggingface.co/datasets/walledai/SGXSTest
- WMDP: https://github.com/centerforaisafety/wmdp
- XSafety: https://github.com/Jarviswang94/Multilingual_safety_benchmark
