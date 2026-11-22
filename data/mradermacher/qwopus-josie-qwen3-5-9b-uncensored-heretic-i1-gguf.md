# mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una distribución de cuantizaciones GGUF del modelo spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic, preparada por mradermacher. El modelo subyacente es un merge de tipo della sobre una base Qwen3.5 de aproximadamente 9.200 millones de parámetros, con técnicas de "abliteration" y "heretic" aplicadas para eliminar los mecanismos de rechazo y censura del modelo original. El resultado es un modelo conversacional con capacidades declaradas de visión y razonamiento, orientado a usos sin filtros de contenido.

La relevancia de esta ficha reside en que se trata de la variante cuantizada con imatrix (i1) del modelo, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp. El repositorio incluye 21 cuantizaciones distintas, desde Q2_K (4,0 GB) hasta Q6_K (7,7 GB), además del archivo imatrix para generar cuantizaciones propias. El tamaño del repo es de 81,3 GB, lo que refleja la suma de todas las variantes.

No se dispone de información sobre la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni los detalles del proceso de merge. La model card del cuantizador es puramente operativa (tipos de cuantización, tamaños, notas de calidad) y no aporta datos técnicos sobre el modelo base. La licencia declarada es Apache 2.0, aunque el modelo incorpora modificaciones de "decensoring" que pueden tener implicaciones legales y éticas en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, detalles no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_S (i1/imatrix) |
| Idiomas soportados | en (inglés; según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (i1/imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de la familia Qwen3.5 con 9,2 mil millones de parámetros. El modelo ha sido construido mediante un merge de tipo della, una técnica de fusión de pesos que combina dos o más modelos para producir un nuevo conjunto de parámetros. Sobre esta base se han aplicado técnicas de "heretic" y "abliteration", que consisten en modificar selectivamente las direcciones de activación asociadas a comportamientos de rechazo para eliminar la censura del modelo. El resultado se etiqueta como "uncensored" y "decensored".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El modelo declara soporte de visión (se mencionan archivos mmproj en el repositorio estático) y de razonamiento, pero no se aportan detalles sobre cómo se implementan estas capacidades ni sobre la longitud de contexto efectiva.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento declarado (tag "reasoning" en la model card), sin detalles sobre modo "thinking" explícito.
- Capacidades de visión declaradas (tag "vision"; los archivos mmproj están en el repositorio estático, no en el i1).
- Modelo "uncensored"/"abliterated": no aplica rechazo por defecto ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas a inglés según la model card (language: en).
- Compatible con llama.cpp y endpoints compatibles (tag "endpoints_compatible").

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo las técnicas de abliteration afectan al comportamiento del modelo base, comparando respuestas con y sin las modificaciones. Es adecuado porque elimina los rechazos por defecto, lo que facilita el análisis de sesgos y comportamientos latentes.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin filtros de contenido. La naturaleza "uncensored" evita los rechazos que limitarían la exploración creativa.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM mediante llama.cpp, lo que lo hace accesible para desarrollo en estación de trabajo.
- Análisis de imágenes en local: gracias a los archivos mmproj del repositorio estático, puede emplearse para tareas de descripción de imágenes o extracción de información visual en entornos sin conexión.
- Prototipado de asistentes conversacionales: con 9,2 B de parámetros y cuantización Q4_K_M, ofrece un equilibrio razonable entre calidad y requisitos de hardware para pruebas de concepto de chatbots.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 21 variantes, lo que permite medir el impacto de la cuantización en la calidad de las respuestas para un mismo modelo, útil en investigación de compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~4,0 GB; IQ3_M ~4,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB. Añadir overhead de contexto y del proyector visual si se usa visión.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones mayores; A100/H100 para despliegue en servidor con mayor contexto y concurrencia.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en GPUs con 8-16 GB de VRAM (Q6_K requiere ~8 GB solo para pesos, más contexto).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), endpoints compatibles con la API de OpenAI (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF | 9,2 B | no disponible | Apache 2.0 | GGUF (i1) | Merge della + abliteration, visión declarada |
| Qwen3.5-9B (base) | ~9 B | no disponible | Apache 2.0 | safetensors | Modelo original con alineación estándar |
| Modelos uncensored de 8-9 B (familia Llama/Mistral) | 7-9 B | variable | variable | GGUF/safetensors | Alternativas de la misma categoría; datos concretos no disponibles |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica rechazos de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o éticamente problemático. No apto para aplicaciones orientadas al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación: los merges y las modificaciones de abliteration pueden degradar la coherencia factual del modelo base. No se han publicado evaluaciones que cuantifiquen este efecto.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: no disponible; no debe asumirse un contexto largo sin verificación empírica.
- Licencia Apache 2.0 declarada, pero las modificaciones de decensoring pueden entrar en conflicto con las políticas de uso de plataformas de despliegue y con normativa local sobre contenido.
- El repositorio i1 no incluye los archivos mmproj (proyector visual); para usar visión hay que descargarlos del repositorio estático.
- Calidad variable según cuantización: las variantes Q2_K e IQ1/IQ2 sufren pérdida notable de calidad; se recomienda Q4_K_M o superior para uso en producción.
- No hay información sobre tool calling ni soporte de agentes; no asumir estas capacidades sin pruebas.

## Enlaces

- Repositorio Hugging Face (i1 GGUF): https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic
- Página de overview del cuantizador: https://hf.tst.eu/model#Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
