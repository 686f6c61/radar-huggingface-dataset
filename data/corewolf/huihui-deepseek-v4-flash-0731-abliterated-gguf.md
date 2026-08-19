# CoreWolf/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF

## Resumen

El modelo CoreWolf/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF es una cuantizacion en formato GGUF de una version "abliterada" (sin censura) del modelo DeepSeek-V4-Flash-0731 de DeepSeek. El proceso de abliteration, aplicado por el equipo de huihui.ai, elimina los mecanismos de rechazo del modelo original, de modo que responde a peticiones que el modelo base normalmente declinaria. Los pesos GGUF han sido generados a partir de las cuantizaciones publicadas por antirez en su repositorio deepseek-v4-gguf.

Se trata de un modelo de texto puro con arquitectura de mezcla de expertos (MoE) de aproximadamente 284 000 millones de parametros totales, pensado para ejecutarse con llama.cpp y motores compatibles con GGUF. La version publicada por CoreWolf incluye cuantizaciones de 2 y 4 bits (IQ2_XXS, Q2_K, Q3_K, Q4_K) y esta orientada a entornos de investigacion y experimentacion, no a produccion, debido a la eliminacion deliberada de los filtros de seguridad.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones de seguridad sobre una base tecnica de ultima generacion, pero con advertencias explicitas sobre su uso: puede generar contenido sensible, controvertido o inapropiado, y no cuenta con garantias de seguridad por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 284 334 567 511 (284,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (segun ejemplo de uso en la model card) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q3_K, Q4_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE), segun indican las etiquetas del repositorio, aunque no se dispone de detalles sobre el numero de expertos, la dimension de los mismos ni el mecanismo de enrutamiento. El modelo base DeepSeek-V4-Flash-0731 es desarrollado por DeepSeek, pero no se ha publicado informacion sobre su proceso de entrenamiento, volumen de datos, tokens utilizados ni tecnicas de alineacion como RLHF o DPO en la documentacion disponible.

La modificacion principal de este modelo es la abliteration, una tecnica que identifica y elimina las direcciones de los residuos (residual streams) asociadas a los rechazos del modelo, de modo que se reduce drasticamente la probabilidad de que el modelo se niegue a responder. Segun la model card, esta implementacion es una prueba de concepto que no utiliza TransformerLens y solo afecta a los modulos de atencion y MLP principales; los modulos de expertos no fueron ablacionados. Los pesos GGUF provienen de las cuantizaciones de antirez y solo son compatibles con llama.cpp y motores que soporten el formato DSpark.

## Capacidades

- Generacion de texto libre sin filtros de seguridad: el modelo responde a peticiones que el modelo base rechazaria, incluyendo contenido sensible o controvertido.
- Razonamiento y conversacion multi-turno: al ser una variante de DeepSeek-V4-Flash, conserva las capacidades conversacionales del modelo original, aunque no se aportan datos especificos.
- Soporte de tool calling y agentes: no se menciona en la documentacion disponible; se desconoce si la abliteration afecta a estas capacidades.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ejecucion local con llama.cpp: compatible con el motor llama.cpp mediante archivos GGUF, con ejemplo de uso que especifica una ventana de contexto de 262 144 tokens.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad: permite estudiar como se comporta un modelo de gran tamano cuando se eliminan los mecanismos de rechazo, util para analizar sesgos y limites de los sistemas de seguridad.
- Pruebas de robustez de sistemas de moderacion: se puede emplear para generar contenido que los filtros convencionales deberian bloquear, evaluando asi la eficacia de dichos filtros.
- Desarrollo de aplicaciones de rol o ficcion sin restricciones: escritores y creadores pueden usar el modelo para generar dialogos o narrativas que incluyan temas tabu sin recibir negativas.
- Experimentacion con cuantizaciones extremas en MoE: las versiones de 2 bits (IQ2_XXS, Q2_K) permiten probar el rendimiento de un modelo de 284 B en hardware limitado, aunque con perdida de calidad.
- Benchmarking de motores de inferencia GGUF: al ser un modelo grande y con soporte DSpark, sirve para comparar el rendimiento de llama.cpp y otros motores en tareas de generacion larga.
- Evaluacion de tecnicas de abliteration: investigadores pueden comparar este modelo con su version sin abliterar para medir el impacto de la tecnica en la fluidez y la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. Dado que el modelo tiene 284 334 567 511 parametros, una cuantizacion Q4_K ocuparia aproximadamente entre 150 y 170 GB en memoria, mientras que las versiones de 2 bits (IQ2_XXS, Q2_K) podrian reducir el requisito a entre 80 y 100 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo y no en mediciones del autor.
- GPU recomendadas: para las cuantizaciones de 4 bits se necesitan multiples GPU de alta gama (A100 80 GB, H100, o varias RTX 4090 con NVLink). Las versiones de 2 bits podrian caber en sistemas con 2 o 3 GPU de 48 GB (como A6000 o L40S).
- Compatibilidad con GPU de consumo: las cuantizaciones de 2 bits podrian ejecutarse en una sola GPU de 80 GB (como la RTX 5090 o la A100), pero con una degradacion notable de calidad. No es realista en GPU de 24 GB o menos.
- Opciones de despliegue: llama.cpp (ejemplo incluido en la model card), y motores que soporten el formato DSpark. No se menciona soporte para vLLM, Ollama o TGI en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos. Como referencia, el modelo base es DeepSeek-V4-Flash-0731, del cual existen otras versiones cuantizadas y abliteradas en el ecosistema huihui.ai, como Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF. Sin embargo, no hay benchmarks publicados que permitan una comparacion objetiva.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| CoreWolf/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF | 284,3 B (MoE) | 262 144 | MIT | GGUF |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 284,3 B (MoE) | no disponible | MIT (segun el repositorio) | safetensors |
| Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF | 284,3 B (MoE) | no disponible | MIT | GGUF |

## Limitaciones y advertencias

- La abliteration elimina los filtros de seguridad: el modelo puede generar contenido sensible, controvertido o inapropiado, incluyendo material ofensivo, ilegal o peligroso. No es apto para menores ni para entornos publicos.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente en las cuantizaciones de 2 bits, que degradan significativamente la calidad del texto.
- No se recomienda su uso en produccion ni en aplicaciones comerciales orientadas al publico. La model card lo limita a investigacion, pruebas o entornos controlados.
- Los modulos de expertos no fueron ablacionados, por lo que el comportamiento "sin censura" puede ser parcial o inconsistente en algunos dominios.
- Solo es compatible con llama.cpp y motores que soporten DSpark; no se garantiza su funcionamiento en otras plataformas.
- No hay datos sobre idiomas soportados, capacidades de tool calling, ni rendimiento en tareas especificas, lo que limita la evaluacion previa a su uso.
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/CoreWolf/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de cuantizaciones de antirez: https://huggingface.co/antirez/deepseek-v4-gguf
- Motor de inferencia DwarfStar (ds4): https://github.com/antirez/ds4
- Tecnica de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Version original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
