# mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF` es una versión cuantizada en formato GGUF del modelo base `Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic`, un merge creado con mergekit a partir de la familia Qwen3.6-35B-A3B. Se trata de un modelo de arquitectura MoE (mixture of experts) con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, orientado específicamente a roleplay, storytelling y generación de texto creativo. El sufijo "heretic" indica que ha sido sometido a un proceso de "abliteration" (eliminación de rechazos y censura), lo que lo convierte en un modelo sin restricciones de contenido.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una opción de modelo de gran tamaño pero con inferencia eficiente gracias a su diseño MoE, disponible en múltiples cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial y la integración en proyectos propietarios. El modelo está pensado para aplicaciones donde se requiere libertad creativa y ausencia de filtros de seguridad, como juegos de rol, narrativa interactiva o generación de diálogos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic` es un merge realizado con mergekit, que combina pesos de la familia Qwen3.6-35B-A3B. La arquitectura subyacente es un transformer MoE con 35.5B parámetros totales y 3B activos por token, lo que permite una inferencia relativamente rápida en comparación con un modelo denso del mismo tamaño. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. El sufijo "heretic" sugiere que se ha aplicado un proceso de abliteration, que consiste en eliminar las capas o pesos responsables de los comportamientos de rechazo y censura, dando como resultado un modelo sin restricciones de contenido. La cuantización GGUF ha sido realizada por mradermacher, quien ha generado múltiples versiones con diferentes niveles de precisión.

## Capacidades

- Generación de texto creativo: especialmente optimizado para roleplay, narración de historias y diálogos de ficción.
- Sin censura: al ser un modelo "abliterated", no rechaza peticiones de contenido explícito, violento o controvertido.
- Soporte de contexto largo: aunque no se especifica la longitud exacta, la arquitectura Qwen3.6 suele soportar ventanas de contexto amplias (típicamente 128k o más), pero este dato no está confirmado en la información disponible.
- Capacidades multilingües: solo se declara inglés, aunque la base Qwen3.6 podría tener soporte para otros idiomas; no se garantiza.
- Formato GGUF: compatible con llama.cpp, Ollama, LM Studio y otros motores de inferencia locales.
- Incluye archivos mmproj (multi-modal projection) que sugieren posible soporte de visión, aunque no se detalla su funcionalidad.

## Casos de uso

- Juegos de rol interactivos: el modelo puede actuar como un dungeon master o personaje no jugador (NPC) en partidas de rol por texto, generando descripciones, diálogos y reacciones coherentes con la narrativa.
- Generación de ficción y novelas: escritores pueden usarlo para generar borradores de capítulos, desarrollar personajes o explorar tramas alternativas sin restricciones temáticas.
- Chatbots de entretenimiento sin filtros: para aplicaciones de chat adulto o conversación libre donde se requiere que el modelo no rechace temas tabú.
- Creación de contenido para juegos independientes: diálogos de personajes, misiones o descripciones de escenarios en videojuegos narrativos.
- Simulación de personajes históricos o ficticios: el modelo puede adoptar personalidades específicas y mantener coherencia en conversaciones largas.
- Prototipado de asistentes creativos: para experimentar con generación de poesía, guiones o letras de canciones sin limitaciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo específico. Al ser un merge y una cuantización, el rendimiento puede variar respecto al modelo original Qwen3.6-35B-A3B, pero no hay métricas oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, los tamaños de archivo van desde 13.3 GB (Q2_K) hasta 37.9 GB (Q8_0). Para la cuantización recomendada Q4_K_M (21.8 GB), se necesita al menos 24 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB), A6000 (48 GB) o superiores. Para cuantizaciones más bajas (Q2_K, Q3_K_S) podría caber en GPUs de 16 GB como la RTX 4080 o RTX 3080 Ti, pero con pérdida de calidad.
- En consumer GPU: sí, es posible ejecutarlo en una RTX 4090 (24 GB) con cuantizaciones Q4_K_M o inferiores. Para Q8_0 se necesitaría una GPU de 48 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (si se convierte a safetensors).
- Latencia y throughput: no se dispone de datos medidos. Al ser un modelo MoE con 3B activos, la velocidad de generación será significativamente mayor que un modelo denso de 35B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B totales, 3B activos | no disponible | Apache 2.0 | safetensors | Modelo base generalista |
| Qwen3.6-35B-A3B-heretic (base) | 35B totales, 3B activos | no disponible | Apache 2.0 | safetensors | Merge sin censura |
| mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF | 35B totales, 3B activos | no disponible | Apache 2.0 | GGUF | Cuantización del merge anterior |

No se dispone de otros modelos comparables en la misma categoría (roleplay sin censura) con datos suficientes para una comparación detallada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, violento o sexualmente explícito sin filtros. Esto puede ser inapropiado para muchos entornos de producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, nombres o eventos, especialmente en contextos largos.
- Limitaciones de idioma: solo se garantiza inglés; el rendimiento en otros idiomas puede ser deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones legales según el país.
- Advertencia para producción: el modelo no incluye mecanismos de seguridad ni moderación. Si se integra en una aplicación pública, es necesario implementar filtros adicionales para evitar usos indebidos.
- La cuantización GGUF puede degradar la calidad del modelo, especialmente en cuantizaciones bajas (Q2_K, Q3_K). Se recomienda usar Q4_K_M o superior para un equilibrio entre calidad y uso de memoria.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF)
- [Modelo base (Cyclone-Labs)](https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic)
- [Página de modelos de mradermacher](https://hf.tst.eu/model#Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Referencia de cuantizaciones (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
