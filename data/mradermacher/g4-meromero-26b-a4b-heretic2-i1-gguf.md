# mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2-i1-GGUF es una cuantización en formato GGUF del modelo EternalDragon/G4-MeroMero-26B-A4B-Heretic2, publicada por el usuario mradermacher. Se trata de un modelo derivado de la familia Gemma 4 con ajuste fino orientado a roleplay, conversación y eliminación de restricciones de alineación (etiquetado como "heretic" y "uncensored"). El nombre "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos sobre un total de 25.233.142.046 parámetros (unos 25,2 mil millones), aunque el autor no documenta explícitamente la configuración MoE en la model card.

El modelo base es un ajuste fino de Gemma 4 de 26B, por lo que hereda la arquitectura transformer de dicha familia, con soporte declarado para visión (el autor indica que los ficheros mmproj, si existen, se encuentran en el repositorio estático). La licencia declarada es Apache 2.0 y el idioma soportado según la model card es únicamente inglés. La relevancia de esta ficha radica en que ofrece una vía práctica de ejecutar localmente un modelo de 26B con cuantizaciones que van desde 8,4 GB (IQ1_S) hasta 22,7 GB (Q6_K), lo que permite desplegarlo en hardware de consumo.

El repositorio acumula 11.111 descargas y un único "like", lo que indica cierta tracción de uso pero escasa validación comunitaria. No se han publicado resultados de benchmarks ni detalles sobre el dataset de ajuste fino, el proceso de RLHF/DPO ni la composición del entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (MoE, segun nomenclatura "A4B"; configuracion no documentada) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | Aproximadamente 4B segun nomenclatura "A4B" (no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); repo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "gemma4" y la nomenclatura "26B-A4B", que convencionalmente indica un modelo de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token. El modelo base EternalDragon/G4-MeroMero-26B-A4B-Heretic2 es un ajuste fino de Gemma 4 orientado a conversación y roleplay, con eliminación de alineación ("heretic", "uncensored"). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares.

La innovación técnica destacable de esta publicación es el uso de cuantizaciones con matriz de importancia (imatrix), generadas por mradermacher con el formato i1, que suelen ofrecer mejor calidad que las cuantizaciones estáticas de tamaño equivalente. El repositorio incluye además el fichero imatrix (0,2 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Existe un repositorio paralelo con cuantizaciones estáticas (G4-MeroMero-26B-A4B-Heretic2-GGUF) donde se alojarían los ficheros mmproj para la modalidad de visión.

## Capacidades

- Generación de texto conversacional y multi-turno, con ajuste específico para roleplay.
- Modo "uncensored": el ajuste heretic elimina parte de los rechazos y filtros de seguridad del modelo base.
- Soporte de visión declarado por el autor (ficheros mmproj en el repositorio estático), aunque no se detalla la resolución ni el procesador de imagen.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.
- No se documenta modo "thinking" ni decodificación especulativa específica.
- No se documentan capacidades de audio.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste heretic y la orientación conversacional permiten mantener personajes coherentes en sesiones largas, con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,2 GB) que preservan matices de estilo.
- Asistentes conversacionales sin filtros para investigación: útil en estudios sobre alineación y seguridad, donde se necesita un modelo que responda sin rechazos para analizar sesgos y comportamientos.
- Generación creativa de ficción: la ventana de contexto (no documentada) y el ajuste de roleplay facilitan la redacción de diálogos y tramas con consistencia de personaje.
- Despliegue local en estaciones de trabajo: con cuantizaciones IQ3_M (12,5 GB) o Q4_K_S (15,6 GB) cabe en GPUs de consumo de 16-24 GB y permite inferencia privada sin conexión.
- Prototipado de chatbots temáticos: la licencia Apache 2.0 permite integrar el modelo en productos comerciales de nicho sin restricciones de atribución adicionales.
- Análisis de imágenes en flujos conversacionales: si se emplean los ficheros mmproj del repositorio estático, el modelo puede describir o razonar sobre imágenes dentro de una conversación, aunque la calidad no está validada.
- Evaluación comparativa de cuantizaciones: el amplio conjunto de variantes i1 (desde IQ1_S hasta Q6_K) permite medir el impacto de la compresión en calidad conversacional sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8,4 GB (IQ1_S, calidad muy degradada) y 22,7 GB (Q6_K, prácticamente sin pérdida). Para uso conversacional serio se recomienda Q4_K_M (16,9 GB) o Q5_K_M (19,2 GB).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para despliegue concurrente con vLLM o TGI.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3_M o Q4_K_S; en GPUs de 12 GB solo con IQ2 o IQ3_XXS, con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints (el tag "endpoints_compatible" sugiere compatibilidad con APIs tipo OpenAI). Para visión se requiere el fichero mmproj del repositorio estático.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 4B activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2-i1-GGUF | 25,2B totales / ~4B activos | no disponible | Apache 2.0 | GGUF | Roleplay sin filtros, vision declarada |
| Gemma 2 27B (Google) | 27B densos | 8K | Gemma license | safetensors, GGUF | Modelo oficial, alineado, sin roleplay |
| Mistral Small 24B | 24B densos | 32K | Apache 2.0 | safetensors, GGUF | Uso general, tool calling documentado |
| Qwen2.5 32B | 32B densos | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, contexto largo |

La comparación es aproximada: no hay datos de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento objetiva con las alternativas. La ventaja diferencial de este modelo es el ajuste sin filtros y la disponibilidad de cuantizaciones imatrix; su desventaja es la falta de documentación técnica y la ausencia de validación comunitaria.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste heretic elimina filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o dañino. No apto para exposición directa a usuarios finales sin moderación adicional.
- Sesgos conocidos: no documentados, pero hereda los sesgos del corpus de entrenamiento de Gemma 4 y del ajuste fino, sin evaluación publicada.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks, no puede estimarse su fiabilidad factual.
- Limitación de idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada: no debe asumirse una ventana concreta sin verificar la configuración del modelo base.
- Licencia Apache 2.0 declarada, pero el modelo base es un ajuste fino de Gemma 4, cuyos términos originales podrían imponer restricciones adicionales; conviene verificar la licencia del modelo base EternalDragon/G4-MeroMero-26B-A4B-Heretic2 antes de uso comercial.
- La modalidad de visión depende de ficheros mmproj alojados en otro repositorio y no está validada.
- Repositorio con un solo "like" y sin discusión comunitaria: escasa validación de calidad por terceros.
- El tamaño del repo (301 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
