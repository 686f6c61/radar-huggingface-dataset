# mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF` es una colección de cuantizaciones GGUF (formato para llama.cpp y derivados) de un modelo derivado de la familia Gemma 4 de Google, publicado por el usuario mradermacher. El modelo de origen es `anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP`, una adaptación mediante LoRA del Gemma 4 31B instruction-tuned, orientada a roleplay (RP) en japonés e inglés y sometida a un proceso de "abliteration" (eliminación o atenuación de los mecanismos de rechazo del modelo).

El modelo cuenta con 30.697.345.596 parámetros totales según los pesos en safetensors, y el repositorio GGUF ocupa 334,8 GB al incluir todas las variantes de cuantización (desde i1-IQ1_S de 7,3 GB hasta i1-Q6_K y superiores). Se distribuye con licencia Apache 2.0 y está etiquetado como `not-for-all-an-ages` por su orientación a contenido sin filtros. La model card indica además que se trata de un modelo con capacidad de visión, con archivos mmproj en el repositorio estático.

La relevancia de esta ficha reside en que combina tres factores poco habituales: un modelo base de 31B con visión, una especialización en roleplay japonés y un proceso de abliteration que modifica el comportamiento de seguridad. Esto lo hace útil para experimentación en generación creativa y conversacional, pero problemático para despliegues de producción con requisitos de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), adaptado mediante LoRA y abliteration; no se detalla la arquitectura interna exacta |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, ... (lista completa en la model card); también cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | inglés (en) y japonés (ja) según la model card; el campo de idiomas del Hub solo indica en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B instruction-tuned, un transformer de la familia Gemma de Google. Sobre esa base se aplicó un adaptador LoRA (etiqueta `lora` y referencia a `unsloth` en los tags) para especializarlo en conversación de roleplay en japonés e inglés. Posteriormente se aplicó un proceso de abliteration, que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, y se generaron cuantizaciones GGUF con imatrix (fichero `.imatrix.gguf` incluido) para preservar la calidad en tamaños reducidos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. La model card no documenta innovaciones técnicas específicas más allá del pipeline estándar de cuantización de mradermacher (i1 = imatrix, tensor quantisation, conversión desde HF). El modelo base incluye capacidad de visión según la nota de la model card, con archivos mmproj en el repositorio estático.

## Capacidades

- Generación de texto conversacional y de roleplay, con especialización declarada en japonés e inglés.
- Capacidad de visión (el autor indica que es un modelo de visión; los mmproj están en el repositorio estático).
- Conversación multi-turno orientada a personajes y escenarios de RP.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que amplía el rango de respuestas generadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a los idiomas declarados (ja, en); no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional en japonés: el modelo está afinado específicamente para mantener personajes y registro coloquial japonés en conversaciones multi-turno, lo que lo hace adecuado para prototipos de chatbots de entretenimiento o ficción interactiva.
- Roleplay en inglés: la model card declara soporte de inglés, por lo que puede usarse en escenarios de narrativa interactiva y juegos de texto en ese idioma.
- Experimentación con modelos abliterated: útil para investigadores que estudian el efecto de la eliminación de rechazos en la distribución de respuestas, comparando con el Gemma 4 31B original.
- Generación creativa sin restricciones de contenido para adultos: el tag `not-for-all-audiences` indica que está pensado para contenido para adultos, siempre que se despliegue en un entorno controlado y con las advertencias legales oportunas.
- Evaluación de cuantizaciones GGUF: al ofrecer más de veinte variantes (de 7,3 GB a tamaños superiores), sirve para medir el impacto de la cuantización en calidad conversacional y coherencia en un modelo de 31B.
- Despliegue local en hardware de consumo: las variantes i1-IQ2_M (11,0 GB) e i1-IQ3_S (13,9 GB) permiten ejecutar un modelo de 31B en GPUs con 12-16 GB de VRAM mediante llama.cpp, algo inviable con los pesos en fp16.
- Integración en pipelines de generación de diálogo con visión: si se descargan los mmproj del repositorio estático, puede emplearse en escenarios que combinen imagen y conversación, aunque la documentación al respecto es mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Las variantes más pequeñas (i1-IQ1_S, 7,3 GB; i1-IQ2_M, 11,0 GB) caben en GPUs de 12-16 GB. Las intermedias (i1-IQ3_S, 13,9 GB; i1-Q4_K_M, 18,8 GB) requieren 16-24 GB. Las de mayor calidad (i1-Q5_K_S, 21,4 GB y superiores) requieren 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 40/80 GB o H100 para fp16 y cuantizaciones altas; RTX 3060/4060 Ti de 16 GB para IQ2/IQ3.
- Cabe en GPU de consumo: sí, en las cuantizaciones IQ1 a IQ3 en GPUs de 12-16 GB; Q4 en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se documenta soporte de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Roleplay ja/en, abliterated, visión |
| Gemma 4 31B it (original de Google) | ~31B | no disponible | Gemma license (no disponible en detalle) | safetensors | Base sin abliteration ni especialización RP |
| anaaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo base del que derivan estas cuantizaciones |
| mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo |

## Limitaciones y advertencias

- El proceso de abliteration elimina o atenúa los mecanismos de rechazo, por lo que el modelo puede generar contenido inapropiado, ofensivo o ilegal sin filtros; no es apto para aplicaciones dirigidas al público general.
- Etiquetado explícitamente como `not-for-all-audiences`; su uso comercial requiere revisión legal adicional pese a la licencia Apache 2.0.
- Riesgo elevado de alucinación en dominios factuales, ya que el ajuste está orientado a roleplay y no a precisión.
- Idiomas limitados a japonés e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La longitud de contexto no está documentada; no se debe asumir la del Gemma 4 original sin verificación.
- La información sobre capacidades de visión es mínima y depende de los archivos mmproj del repositorio estático.
- El repositorio ocupa 334,8 GB; descargar todas las cuantizaciones es inviable en la mayoría de entornos.
- No hay benchmarks publicados que permitan comparar su calidad frente al modelo base o frente a otros modelos de roleplay.
- El campo de idiomas del Hub solo declara `en`, en contradicción con la model card que declara `ja` y `en`; conviene validar el comportamiento real en japonés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF
- Modelo base: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
