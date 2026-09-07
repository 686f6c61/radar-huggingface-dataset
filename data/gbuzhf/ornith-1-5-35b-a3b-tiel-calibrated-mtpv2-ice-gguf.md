# gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF

## Resumen

Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF es una colección de cuatro cuantizaciones GGUF del modelo de mezcla de expertos (MoE) Ornith-1.5-35B-A3B, desarrollada por gbuzhf a partir del modelo original de ornith-ai. Se trata de una adaptación no oficial que incorpora la cabeza entrenada de predicción multi-token (MTPv2) del modelo base y aplica un esquema de cuantización denominado ICE, calibrado con la matriz de importancia de Tiel. La publicación está dirigida a quienes necesitan ejecutar el modelo en hardware más limitado que el requerido por la versión bf16, que ocupa alrededor de 70 GB.

El modelo base es un MoE de aproximadamente 35.500 millones de parámetros totales, de los cuales unos 3.000 millones se activan por token. La versión cuantizada se ofrece en cuatro niveles de tamaño y fidelidad: 19G-ICE, 21G-ICE, 23G-ICE y 25G-ICE, con tamaños de archivo entre 18.82 GB y 24.84 GB. Esta familia de cuantizaciones busca maximizar la fidelidad respecto al modelo bf16 dentro de una restricción de presupuesto de bits, priorizando la calidad en los tensores donde el error de cuantización tiene más impacto en la salida final.

La relevancia de esta publicación se centra en proporcionar una alternativa ligera al modelo bf16 sin renunciar a la ventana de contexto de 256.000 tokens, y en incluir la cabeza MTPv2, que permite decodificación especulativa sin necesidad de un modelo auxiliar. Los niveles inferiores están pensados para GPU de consumo con 24 GB de VRAM, mientras que los niveles superiores buscan una mayor fidelidad manteniendo compatibilidad con ese tipo de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre Transformer |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | 19G-ICE, 21G-ICE, 23G-ICE, 25G-ICE |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo de mezcla de expertos (MoE) con 256 expertos en total y aproximadamente 3.000 millones de parámetros activos por token. La arquitectura base es un Transformer estándar con la particularidad de incluir una cabeza de predicción multi-token (MTPv2) entrenada por ornith-ai, que está embebida en estos archivos GGUF y permite decodificación especulativa interna (self-speculative decoding) pasando el argumento `--spec-type draft-mtp` en llama.cpp. El número de bloques del modelo es 41 y el total de tensores es 753.

La técnica de cuantización ICE, desarrollada por gbuzhf, clasifica los tensores según la distancia que recorre el error de cuantización a lo largo del forward. Las clases son: discrete (router del MoE, que se cuantiza en F32), recurrent (términos de decaimiento y de paso temporal de SSM, también en F32), cached (claves y valores de atención, en F16) e instant (el resto de tensores, incluidos los 256 expertos, que reciben el mayor presupuesto de bits). La calibración se realizó sobre la matriz de importancia de Tiel. No se dispone de información sobre el preentrenamiento del modelo base: número de tokens, composición del dataset o uso de RLHF/DPO está marcado como no disponible.

## Capacidades

- Generación de texto y conversación: modelo MoE orientado a lenguaje natural, con plantilla de chat Qwen-Sharp v22.4.1.
- Contexto largo: ventana de hasta 256.000 tokens, capaz de procesar documentos extensos y conversaciones muy largas.
- Decodificación especulativa: la cabeza MTPv2 integrada permite usar auto-decodificación especulativa en llama.cpp sin modelo auxiliar.
- Cuantización flexible: cuatro niveles de compresión para ajustar el equilibrio entre fidelidad, tamaño y velocidad de inferencia.
- Soporte de tool calling: no disponible en la información pública.
- Capacidades multilingües: no disponibles.
- Visión y audio: no soportados según la documentación disponible.

## Casos de uso

- Asistentes conversacionales de largo recorrido: la ventana de 256.000 tokens permite mantener historiales de chat extensos sin truncar el contexto, útil en aplicaciones de atención al cliente o tutoría.
- Análisis y resumen de documentos extensos: se pueden procesar contratos, informes o artículos completos en una sola pasada, gracias al contexto largo y al soporte de generación de texto.
- Despliegue de servidores OpenAI-compatible: el repo base de ornith-ai ofrece recetas para levantar un servidor compatible con OpenAI en 2× 80 GB GPUs; esta cuantización permite hacerlo con menos recursos.
- Inferencia acelerada en local: la cabeza MTPv2 embebida habilita la decodificación especulativa en llama.cpp, reduciendo la latencia perceptible en aplicaciones interactivas.
- Ejecución en GPU de consumo: las variantes 19G-ICE y 21G-ICE pueden cargarse en tarjetas de 24 GB como la RTX 4090 o la L4, con una degradación medida en voz de KLD y perplexity.
- Investigación sobre cuantización: los datos de divergencia KL, perplexity y probabilidad de top-1 publicados por el autor permiten comparar la fidelidad de distintos presupuestos de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación publicada es la fidelidad de la cuantización frente al modelo bf16 de referencia, medida en divergencia KL y perplexity sobre WikiText-2.

| Tier | Tamano (GB) | KLD medio | KLD 99% | KLD 99.9% | PPL ratio | Mismo top-1 | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| 25G-ICE | 24.84 | 0.0284 | 0.286 | 1.120 | 0.9851 | 93.44% | 96.1 |
| 23G-ICE | 22.83 | 0.0325 | 0.335 | 1.177 | 0.9900 | 92.85% | 95.7 |
| 21G-ICE | 20.84 | 0.0389 | 0.419 | 1.584 | 1.0001 | 92.24% | 95.1 |
| 19G-ICE | 18.82 | 0.0601 | 0.616 | 2.387 | 1.0013 | 90.33% | 93.1 |

La métrica "overall" es un compuesto definido por el autor como `0.70/(1+meanKLD) + 0.30*sameTop1`, donde la fidelidad bf16 se fija en 100. El tamaño del archivo se corresponde con el peso en disco.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño de cada archivo GGUF es el mínimo de VRAM necesario para cargar los pesos. Para el tier 19G-ICE se necesitan ~19 GB más memoria para la caché KV; para 21G-ICE ~21 GB; para 23G-ICE ~23 GB; y para 25G-ICE ~25 GB.
- GPU recomendadas: los tiers de hasta 21G pueden ejecutarse en una RTX 4090 (24 GB) con contexto moderado. Para usar el contexto completo de 256.000 tokens se recomiendan configuraciones de 2× 80 GB, como las descritas por ornith-ai para su versión bf16. Los tiers 23G y 25G requieren al menos 24 GB de VRAM, dejando poco margen para caché KV.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama, y servidores compatibles con OpenAI como vLLM o TGI.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

No se dispone de resultados públicos que permitan comparar Ornith-1.5-35B-A3B con otros modelos de la misma categoría (otros MoE de ~35B con ~3B activos). La única comparativa publicada en la model card es entre las cuantizaciones ICE y las escaleras de cuantización Unsloth Dynamic (UD) y APEX, todas aplicadas al mismo modelo base. Según el autor, el tier 23G-ICE supera a `UD-Q4_K_XL` por ser un 14.5% más cercano a bf16 y 0.37 GB más pequeño; el 25G-ICE supera a `APEX-I-Balanced` por 12% de fidelidad siendo 1.4 GB menor; y el 19G-ICE es un 17% más cercano a bf16 que `UD-IQ4_XS`. Estas comparativas internas no deben interpretarse como comparaciones con modelos independientes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de alineación o seguridad; se recomienda uso supervisado en producción.
- La cuantización ICE es una adaptación no oficial. En los niveles inferiores la fidelidad disminuye: el 19G-ICE presenta un KLD medio de 0.0601 y un KLD en el percentil 99.9 de 2.387, lo que puede traducirse en cambios perceptibles en las respuestas.
- El contexto de 256.000 tokens es la capacidad teórica del modelo. En la práctica, mantener un contexto completo requiere gran cantidad de memoria y puede afectar a la velocidad de inferencia.
- No se han publicado datos sobre idiomas soportados ni sobre rendimiento en lenguas distintas del inglés.
- El modelo no incluye tool calling, visión ni capacidades multimodales según la documentación consultada.
- La licencia MIT permite uso comercial, pero no se han encontrado evaluaciones de riesgos legales más allá de la licencia declarada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF
- Informe del método ICE: https://huggingface.co/gbuzhf/ICE-quantization
- Repo base con cuantizaciones oficiales de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
