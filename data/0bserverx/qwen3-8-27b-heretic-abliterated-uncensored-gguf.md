# 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

El modelo **Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF** es una colección de cuantizaciones GGUF de una variante modificada del modelo Qwen3.8-27B, publicada por el usuario 0bserverx en Hugging Face. Esta variante, basada en los pesos de `trohrbaugh/Qwen3.8-27B-heretic`, ha sido sometida a técnicas de *abliteration* y *uncensoring* para eliminar los mecanismos de rechazo y filtrado del modelo original, ofreciendo una versión "sin restricciones" del modelo base.

El repositorio incluye un espectro completo de cuantizaciones, desde BF16/F16 (referencia de máxima calidad) hasta formatos ternarios experimentales (TQ1_0, TQ2_0), todas ellas optimizadas con *activation imatrix* para las versiones de menor bit. Esto permite ejecutar un modelo de 27 000 millones de parámetros en hardware de consumo, desde GPUs de 8 GB hasta 64 GB, con distintos equilibrios entre calidad y uso de memoria.

La relevancia de este modelo radica en su carácter *uncensored* y en la flexibilidad de despliegue que ofrecen las cuantizaciones GGUF, pensadas para su uso con llama.cpp y otros motores compatibles. No obstante, la documentación proporcionada es escasa: no se detallan la arquitectura interna, el proceso de entrenamiento ni los benchmarks, por lo que gran parte de las especificaciones técnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se emplea 32768, pero no es un dato oficial) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S, IQ1_M, TQ1_0, TQ2_0 |
| Idiomas soportados | no disponibles |
| Licencia | other (misma que el modelo fuente, sin especificar) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Al ser una variante de Qwen3.8-27B, se puede asumir que comparte la arquitectura base del modelo original (probablemente un transformer decoder-only), pero no se confirma en la documentación. El autor indica que los pesos provienen de `trohrbaugh/Qwen3.8-27B-heretic`, que a su vez es una modificación de Qwen3.8-27B. Las técnicas de *abliteration* y *uncensoring* aplicadas sobre los pesos originales buscan eliminar los comportamientos de rechazo y las restricciones de contenido, pero no se proporcionan detalles sobre el proceso exacto, los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con llama.cpp y motores compatibles con GGUF (llama-server, llama-cli, etc.).
- Soporte de cuantizaciones de muy baja precisión (IQ1, TQ) para entornos con recursos limitados.
- Posible soporte de visión si se descargan los archivos `mmproj-*.gguf` del repositorio original, aunque no se confirma para esta variante.
- No se documentan capacidades específicas como tool calling, razonamiento avanzado o multilingüismo.

## Casos de uso

- **Despliegue local en estaciones de trabajo**: gracias a las cuantizaciones Q4_K_M o IQ4_NL, el modelo puede ejecutarse en GPUs de 16 GB (RTX 4080, RTX 3080, etc.) con un equilibrio razonable entre calidad y uso de memoria.
- **Servidor de chat privado**: usando `llama-server` con el comando indicado en la documentación, se puede montar un endpoint de chat local sin depender de servicios en la nube.
- **Experimentación con cuantizaciones extremas**: las versiones IQ1_S, IQ1_M y TQ permiten probar el comportamiento del modelo en hardware de 8 GB, aunque con una degradación notable de calidad.
- **Generación de contenido creativo sin restricciones**: al ser una variante *uncensored*, puede utilizarse en aplicaciones donde se requiera evitar los filtros de contenido del modelo base, como escritura creativa o roleplay.
- **Integración en pipelines de inferencia con llama.cpp**: el formato GGUF es directamente compatible con bindings de Python, Rust y otros lenguajes, facilitando su integración en aplicaciones existentes.
- **Evaluación de calidad por cuantización**: el repositorio ofrece múltiples niveles de precisión, lo que permite comparar el impacto de la cuantización en la calidad de las respuestas para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

La siguiente tabla resume los requisitos de VRAM estimados para cada cuantización, según la documentación del autor:

| Cuantizacion | Tamano (GB) | VRAM necesaria (offload completo) | GPU recomendada |
|---|---|---|---|
| BF16 / F16 | ~55.7 / ~54.7 | 64 GB | GPUs de 64 GB (A100, H100) |
| Q8_0 | ~29.1 | 32 GB | GPUs de 32 GB (A100, V100) |
| Q6_K | ~22.4 | 24 GB | RTX 3090, RTX 4090 |
| Q5_K_M / Q5_K_S | ~19.8 / ~19.3 | 24 GB | RTX 3090, RTX 4090 |
| Q4_K_M / Q4_K_S | ~16.9 / ~16.1 | 16-20 GB | RTX 4080, RTX 3080, RTX 4070 Ti |
| IQ4_NL / IQ4_XS | ~16.1 / ~15.3 | 16 GB | RTX 4080, RTX 3080 |
| Q3_K_L / Q3_K_M | ~14.7 / ~13.7 | 16 GB | RTX 3060, RTX 4060 |
| IQ3_M / IQ3_S / Q3_K_S / IQ3_XS | ~12.8 / ~12.5 / ~12.5 / ~12.0 | 16 GB | RTX 3060, RTX 4060 |
| IQ3_XXS | ~7.3 | 8-12 GB | RTX 3060 Ti, RTX 4060 |
| Q2_K_S / IQ2_M / IQ2_S / IQ2_XS / IQ2_XXS | ~10.0 / ~9.9 / ~9.1 / ~8.7 / ~8.0 | 8-12 GB | RTX 3060, RTX 4060 |
| IQ1_S / IQ1_M / TQ1_0 / TQ2_0 | ~6.5 / ~7.1 / ~7.2 / ~8.4 | 8 GB | GPUs de 8 GB (RTX 3050, GTX 1080) |

- **Opciones de despliegue**: llama.cpp (llama-server, llama-cli), así como cualquier motor compatible con GGUF (Ollama, LM Studio, etc.).
- **Latencia y throughput**: no se proporcionan datos específicos; dependerán de la cuantización, la GPU y la configuración de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo es una variante modificada de Qwen3.8-27B, pero no se han publicado datos comparativos de rendimiento ni de calidad frente a alternativas como Llama 3.1 27B o Mistral 27B.

## Limitaciones y advertencias

- **Licencia**: la licencia se indica como `other`, y el autor remite a la del modelo fuente. No se especifican los términos exactos, por lo que se recomienda revisar la licencia de Qwen3.8-27B antes de un uso comercial.
- **Contenido sin filtrar**: al ser una variante *uncensored*, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en aplicaciones orientadas al público general sin medidas de moderación adicionales.
- **Sesgos y alucinaciones**: no se ha documentado ningún análisis de sesgos ni de tasas de alucinación. Al ser un modelo modificado, estos riesgos pueden verse incrementados.
- **Calidad de cuantizaciones extremas**: las versiones IQ1 y TQ presentan una degradación severa de calidad y solo son adecuadas para pruebas o casos muy específicos.
- **Soporte de producción**: no hay evidencia de pruebas exhaustivas en entornos de producción; se recomienda validar el comportamiento del modelo antes de un despliegue crítico.
- **Contexto**: no se ha confirmado la longitud de contexto nativa del modelo; el valor de 32768 usado en el ejemplo es una configuración de llama.cpp, no un dato oficial.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Pesos heretic de trohrbaugh](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic)
