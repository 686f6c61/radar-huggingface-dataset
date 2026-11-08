# lizhaoxuan/qwen27

## Resumen

Qwen27 es un fine-tune multi-etapa del modelo Qwen3.8-27B, publicado por el usuario lizhaoxuan en Hugging Face y derivado a su vez del trabajo de DavidAU (Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU). Se distribuye principalmente como cuantizaciones GGUF (regulares y MTP) y está orientado a hardware de consumo, con un enfoque declarado en razonamiento, escritura creativa, roleplay y generación de código. El autor lo presenta como un modelo "uncensored" y "abliterated", es decir, con las capas de rechazo reducidas mediante técnicas de abliteration.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 27B) y se distribuye bajo licencia Apache 2.0. La model card declara mejoras en benchmarks ARC-C y ARC-E respecto al Qwen 3.8 27B base, así como una reducción del 50 % al 90 % en los tokens de "thinking" (mediana aproximada de dos tercios), manteniendo la calidad de salida. Estas cifras provienen exclusivamente de las afirmaciones del autor y no han sido verificadas de forma independiente en la información disponible.

La relevancia actual del modelo reside en su propuesta de combinar razonamiento con un consumo de tokens mucho menor y un despliegue viable en GPU de consumo mediante GGUF. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y su pipeline declarado es image-text-to-text pese a que la model card no documenta capacidades de visión, lo que introduce incertidumbre sobre el alcance real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.8 27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (Neo-CODER MAX DI-MATRIX, doble imatrix); también bfloat16 según tags |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regulares y MTP), bfloat16; safetensors referenciado en los metadatos de parámetros |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un fine-tune multi-etapa y multi-merge construido sobre Qwen3.8-27B. El autor describe dos metodologías propietarias: "COLD FUSION" (combinación de un componente denominado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". El método GAIN, según la model card, modifica dinámicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El modelo se presenta como "multi-stage tuned" y "multi-state-merge", con objetivos declarados de aumentar la inteligencia general, reducir el bloque de pensamiento (entre la mitad y una décima parte), reformatear dicho bloque, acelerar la generación de tokens (especialmente en MTP) y mantener o elevar los benchmarks principales. No se documentan innovaciones arquitectónicas propias más allá del ajuste fino; las cuantizaciones MTP y el uso de doble imatrix son optimizaciones de despliegue, no cambios estructurales del transformer.

## Capacidades

- Generación de texto conversacional y de formato largo, con especial énfasis declarado en escritura creativa, ficción, narrativa y roleplay.
- Modo de razonamiento ("thinking") con bloque de pensamiento reducido respecto al modelo base, según el autor.
- Generación de código y tareas de programación (etiqueta "coder" y "NEO-CODER" en la denominación de las cuantizaciones).
- Razonamiento multi-paso y resolución de problemas, orientado a benchmarks tipo ARC.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Soporte de tool calling: la model card remite a la pestaña "community" para resultados de terceros sobre rendimiento en tool calling, sin cifras verificables en la información disponible.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidad de visión: el pipeline declarado es image-text-to-text, pero la model card no documenta ni ejemplifica entrada de imágenes; debe tratarse como no confirmada.

## Casos de uso

- Escritura creativa y narrativa: el modelo está ajustado específicamente para ficción, relato y generación de tramas, con ejemplos en la model card orientados a hooks narrativos y diálogo. Adecuado para borradores de novela, guiones y contenido editorial.
- Roleplay y personajes conversacionales: el ajuste "uncensored" y las etiquetas de roleplaying lo orientan a sistemas de personajes con menor tasa de rechazos, útil en prototipos de entretenimiento interactivo.
- Asistencia a programación en local: las cuantizaciones GGUF permiten ejecutarlo en estaciones de trabajo con GPU de consumo para autocompletado, generación de funciones y revisión de código sin depender de API externa.
- Razonamiento con presupuesto de tokens ajustado: la reducción declarada del bloque de pensamiento lo hace candidato para pipelines donde el coste por consulta importa, como clasificación compleja o extracción estructurada con verificación.
- Despliegue en hardware de consumo: al publicarse en GGUF con cuantizaciones de 4 y 8 bits, encaja en entornos de desarrollo individuales, laboratorios pequeños o demos sin infraestructura de datacenter.
- Investigación sobre abliteration y alineación: sirve como objeto de estudio para analizar el efecto de la eliminación de capas de rechazo sobre calidad, sesgos y seguridad en modelos de 27B.
- Generación de contenido en inglés y chino: útil para aplicaciones bilingües en esos dos idiomas, con la limitación de que no se declaran otros.

## Benchmarks y rendimiento

La model card afirma resultados de ARC-C y ARC-E, pero no presenta una tabla formal de benchmarks con metodología reproducible. Los datos citados por el autor son los siguientes:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bit) | 735 | Superior a Qwen 3.8 27B según el autor |
| ARC-C (4 bit) | 719 | Cuantización de 4 bits |
| ARC-E (8 bit) | 880 | "Zona de inteligencia" de modelos cerrados según el autor |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, pero no se detallan dichos benchmarks ni sus valores en la información disponible. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 27B, una cuantización de 4 bits requiere del orden de 16-18 GB y una de 8 bits del orden de 28-30 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar viabilidad en RTX 4090 (24 GB) con cuantización de 4 bits y en A100/H100 para precisión completa o 8 bits.
- GPU de consumo: probablemente viable en tarjetas con 24 GB o más en 4 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo TGI/vLLM, aunque no se detalla.
- Latencia y throughput: no disponibles. El autor afirma que la variante MTP acelera la generación de tokens, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen27 (este modelo) | ~27B | no disponible | Apache 2.0 | Fine-tune GGUF, uncensored, orientado a escritura y razonamiento |
| Qwen3.8 27B (base) | ~27B | no disponible | no disponible | Modelo de referencia del que deriva; el autor afirma mejora en benchmarks |
| Qwen3.6-35B-A3B | ~35B totales (MoE) | no disponible | no disponible | Citado por el autor como superado en sus siete benchmarks; sin datos verificables |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible | Citados como líneas base superadas según el autor |

No se dispone de datos independientes que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la reducción deliberada de rechazos implica mayor probabilidad de generar contenido inapropiado, ofensivo o inseguro; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación no evaluado: no hay datos sobre tasas de factualidad ni sobre comportamiento en dominios especializados.
- Las cifras de benchmarks y la reducción de tokens de pensamiento proceden únicamente de las afirmaciones del autor y no están verificadas de forma independiente.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Longitud de contexto no documentada; planificar despliegues con contexto largo requiere validación previa.
- Repositorio con cero descargas y cero likes en el momento de la consulta, lo que impide contrastar experiencias de la comunidad.
- Pipeline declarado image-text-to-text sin documentación de visión: posible inconsistencia en los metadatos que conviene verificar antes de asumir capacidades multimodales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets intermedios pueden imponer condiciones adicionales no detalladas en la información disponible.
- El tamaño del repositorio (389 GB) y la multiplicidad de cuantizaciones exigen planificar el almacenamiento antes de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/lizhaoxuan/qwen27
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia del método COLD FUSION (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
