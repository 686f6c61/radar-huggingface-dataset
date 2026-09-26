# KayaTechAI/Qwen3-1.7B-SFT-fin-summerization-v1

## Resumen

KayaTechAI/Qwen3-1.7B-SFT-fin-summerization-v1 es un ajuste fino por supervisión (SFT) del modelo Qwen3-1.7B en su variante cuantizada a 4 bits publicada por Unsloth. Lo desarrolla el usuario KayaTechAI y se distribuye en Hugging Face bajo licencia Apache 2.0. El nombre del repositorio apunta a un ajuste orientado a resumen de contenido financiero ("fin" + "summerization", grafía del propio autor), aunque la model card no documenta el dataset ni el objetivo de entrenamiento de forma explícita.

Se trata de un transformer decoder-only denso de aproximadamente 1.700 millones de parámetros, heredado íntegramente de la familia Qwen3, que aporta modo de razonamiento ("thinking") conmutable y soporte multilingüe en el modelo original. El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio y la propia model card, que indica que el modelo "fue entrenado 2x más rápido con Unsloth".

Su relevancia es limitada y muy acotada: es un experimento de ajuste fino de un solo autor, con 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks publicados ni documentación de datos. Resulta útil como ejemplo reproducible de fine-tuning ligero sobre Qwen3 con Unsloth, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | ~1.700 millones (heredados del modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 mediante YaRN segun la documentacion de Qwen3 |
| Tipos de cuantizacion | modelo base publicado en 4 bits (bitsandbytes); el repositorio no documenta cuantizaciones adicionales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (ingles) declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | unsloth/qwen3-1.7b-unsloth-bnb-4bit |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original: un transformer decoder-only denso con atención por causalidad, normalización RMSNorm y las innovaciones introducidas en la familia Qwen3 (entre ellas el modo de razonamiento conmutable entre "thinking" y "non-thinking"). No se trata de un modelo MoE ni híbrido SSM: los 1.700 millones de parámetros están activos en cada paso de inferencia. El modelo base empleado es la versión cuantizada a 4 bits con bitsandbytes que Unsloth publica para facilitar el ajuste fino en GPUs de consumo.

En cuanto al entrenamiento, la model card únicamente indica que se aplicó SFT sobre el modelo base y que se utilizó Unsloth para acelerarlo, sin detallar número de tokens, composición del dataset, número de épocas, hiperparámetros ni si hubo fases posteriores de DPO o RLHF. Tampoco se especifica si el repositorio contiene pesos completos fusionados o adaptadores. El tamaño de 0,2 GB del repositorio es reducido para un modelo de 1.700 millones de parámetros, lo que sugiere una publicación parcial o altamente comprimida, pero este extremo no está confirmado por el autor.

## Capacidades

- Generacion de texto y resumen: la funcion principal que sugiere el nombre del modelo, orientada a sintetizar contenido financiero en ingles.
- Razonamiento e instrucciones: hereda del Qwen3-1.7B base la capacidad de seguir instrucciones y de alternar entre modo de razonamiento y modo directo, aunque el ajuste SFT puede haber alterado este comportamiento.
- Codigo y matematicas: capacidades presentes en el modelo base Qwen3-1.7B, no verificadas tras el ajuste fino.
- Tool calling / function calling: no documentado en este repositorio. El autor publica un modelo hermano especifico para ello (Qwen3-1.7B-SFT-fin-calculation-tool-call-v1).
- Agentes y razonamiento multi-paso: no documentado.
- Multilingue: la model card declara unicamente ingles ("en"); no se garantiza el resto de idiomas del Qwen3 original.
- Capacidades especiales (vision, audio): no disponibles, no se anuncian.

## Casos de uso

- Resumen de informes financieros: el modelo puede condensar informes trimestrales, notas de prensa de resultados o transcripciones de llamadas de resultados en ingles en resúmenes breves, que es el escenario que sugiere el nombre del repositorio.
- Prototipado de pipelines de fine-tuning: sirve como plantilla reproducible para estudiar cómo aplicar SFT con Unsloth y TRL sobre Qwen3-1.7B en una GPU de consumo.
- Extracción de puntos clave de documentación financiera: a partir de un texto largo en inglés, generar un listado de cifras y hechos destacados, siempre con revisión humana por el riesgo de alucinación.
- Clasificación y etiquetado de textos económicos: usar el modelo para preprocesar grandes volúmenes de noticias financieras y asignar categorías o resúmenes preliminares antes de una revisión.
- Base para ajustes específicos de dominio: al ser Apache 2.0 y de tamaño reducido, puede servir como punto de partida para fine-tunings posteriores en nichos concretos (seguros, banca, auditoría).
- Experimentación académica con modelos pequeños: útil en entornos docentes o de investigación donde el coste de cómputo y el espacio en disco son limitantes y se quiere comparar el efecto del SFT sobre un mismo base.
- Generación de borradores en local: despliegue en portátil o estación de trabajo sin GPU dedicada potente para generar resúmenes en inglés de forma offline, sujeto a validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ROUGE ni de ninguna otra tarea, y no se dispone de comparaciones numéricas frente al modelo base ni frente a otros ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3,4 GB solo de pesos, más overhead de activaciones y caché KV (del orden de 1-2 GB adicionales para contextos moderados); en 8 bits, alrededor de 1,8 GB; en 4 bits, en torno a 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo cuantizado; para fp16 se recomiendan 8 GB o más. GPUs de datacenter como A100, H100 o L40S son válidas pero sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí. Ejemplos: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, e incluso iGPU con memoria unificada si se cuantiza a 4 bits. En 6 GB es viable en 4 bits con contextos cortos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), vLLM, Ollama y llama.cpp previa conversión a GGUF, y Unsloth/TRL para reentrenamiento o ajuste adicional.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KayaTechAI/Qwen3-1.7B-SFT-fin-summerization-v1 | ~1,7B densos | no especificado (base: 32.768 nativos) | apache-2.0 | Hugging Face, 0 descargas | Ajuste SFT sin documentar dataset ni benchmarks |
| Qwen3-1.7B (base oficial) | 1,7B densos | 32.768 nativos, 131.072 con YaRN | apache-2.0 | Hugging Face y proveedores gestionados | Modelo original con modo thinking/non-thinking y soporte multilingue |
| Qwen3-0.6B | 0,6B densos | 32.768 nativos | apache-2.0 | Hugging Face | Alternativa mas ligera para entornos con muy poca VRAM |
| Qwen3-4B | 4B densos | 32.768 nativos | apache-2.0 | Hugging Face | Mas capacidad general a cambio de mayor coste de inferencia |
| KayaTechAI/Qwen3-1.7B-SFT-fin-calculation-tool-call-v1 | ~1,7B densos | no especificado | apache-2.0 (segun repositorio) | Hugging Face | Ajuste hermano del mismo autor orientado a calculo con tool calling |

No hay datos de rendimiento publicados para ninguno de los ajustes de KayaTechAI, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de datos de entrenamiento: no se documenta el dataset, el número de ejemplos, la composición ni el idioma exacto del corpus de SFT. Esto impide auditar sesgos y reproducir el ajuste.
- Riesgo de alucinacion: un modelo de 1.700 millones de parámetros ajustado para resumir contenido financiero puede fabricar cifras, fechas o nombres. Cualquier uso en finanzas exige verificación humana contra la fuente.
- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus no especificado, pueden persistir sesgos del modelo base y del dataset de ajuste.
- Alcance limitado al ingles: la model card declara únicamente "en", por lo que el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto no confirmado: la model card no indica la longitud de contexto efectiva tras el ajuste; conviene asumir la del base (32.768 tokens) y probar antes de usarla en documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de conservar el aviso de licencia y el archivo NOTICE si existe. Conviene revisar también la licencia del modelo base (Apache 2.0) y las condiciones de uso de Unsloth.
- Idoneidad para produccion: baja. Con 0 descargas, 0 "likes" y sin benchmarks ni evaluaciones, no hay evidencia de calidad ni de estabilidad; no deberia desplegarse en produccion sin una evaluacion propia exhaustiva.
- Tamano del repositorio anómalo: 0,2 GB es muy reducido para un modelo de 1.700 millones de parámetros, lo que puede indicar que los pesos no están completos o que se publicaron en un formato poco habitual. Verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KayaTechAI/Qwen3-1.7B-SFT-fin-summerization-v1
- Modelo hermano del mismo autor (calculo con tool calling): https://huggingface.co/KayaTechAI/Qwen3-1.7B-SFT-fin-calculation-tool-call-v1
- Repositorio GitHub de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3: https://qwen.ai/blog?id=qwen3
- Ficha de Qwen3-1.7B en Together AI (referencia del modelo base): https://www.together.ai/models/qwen3-1-7b
- Repositorio de Unsloth (herramienta de entrenamiento empleada): https://github.com/unslothai/unsloth
- Modelo base en Hugging Face: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
