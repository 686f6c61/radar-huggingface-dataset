# mradermacher/Dark-Oddity-12B-v1.0-GGUF

## Resumen

Dark-Oddity-12B-v1.0 es un modelo de lenguaje cuantizado a formato GGUF por mradermacher, a partir del modelo base ReadyArt/Dark-Oddity-12B-v1.0. Se trata de un modelo de 11.956.539.456 parámetros (aproximadamente 12B) diseñado para casos de uso no alineados, incluyendo roleplay, contenido explícito y ERP (roleplay erótico). El repositorio de HuggingFace no proporciona detalles sobre la arquitectura subyacente, la longitud de contexto o el proceso de entrenamiento, por lo que gran parte de las especificaciones técnicas deben marcarse como no disponibles.

La relevancia de esta ficha radica en que es un modelo de la categoría "uncensored" o "unaligned", dirigido a usuarios que buscan generación de texto sin restricciones de seguridad. El formato GGUF permite ejecutarlo en herramientas como llama.cpp, Ollama o LM Studio, y la variedad de cuantizaciones ofrecidas (desde Q2_K hasta Q8_0) facilita su despliegue en hardware de consumo. La licencia es "other", lo que implica que hay que revisar la licencia del modelo base para conocer los términos exactos de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.956.539.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ReadyArt/Dark-Oddity-12B-v1.0 en la model card de esta cuantización. El repositorio solo indica que se trata de un modelo de 12B parámetros, que el autor de la cuantización (mradermacher) ha convertido a formato GGUF mediante cuantización estática. No se mencionan datos sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO.

La cuantización GGUF es una técnica de compresión que reduce el tamaño del modelo y los requisitos de memoria a cambio de una pérdida de precisión. Las variantes Q4_K_M y Q4_K_S se recomiendan en la documentación como un equilibrio entre velocidad y calidad, mientras que Q8_0 ofrece la mejor fidelidad al modelo original.

## Capacidades

- Generación de texto sin restricciones de contenido, diseñado para roleplay, contenido explícito y escenarios de interacción libre.
- Soporte de conversación multi-turno, aunque la longitud de contexto no está documentada.
- Multilingüe limitado: solo se declara el idioma inglés.
- No se mencionan capacidades de vision, audio, tool calling, function calling ni razonamiento agéntico.
- El modelo está etiquetado como "unaligned" y "dangerous", lo que implica que no aplica políticas de seguridad para filtrar contenido dañino o explícito.

## Casos de uso

- Roleplay de ficción: el modelo puede generar narrativas interactivas de rol, manteniendo personajes y tramas a lo largo de múltiples turnos. Su diseño sin restricciones permite explorar temáticas adultas que otros modelos censuran.
- Prototipado de chatbots sin filtro: para desarrolladores que necesitan evaluar cómo se comporta un modelo sin capas de seguridad, sirve como base para experimentar con técnicas de alineación o para construir asistentes especializados en dominios donde las restricciones de contenido no son aplicables.
- Generación de texto creativo explícito: puede usarse en proyectos de escritura colaborativa o en sistemas de generación de ficción con contenido adulto, siempre que se cumplan las leyes locales sobre el material.
- Evaluación de técnicas de cuantización: al estar disponible en 11 niveles de cuantización, es útil para comparar el impacto de la pérdida de precisión en la calidad de la generación en un mismo modelo base.
- Investigación sobre modelos no alineados: sirve como caso de estudio para analizar las diferencias de comportamiento entre modelos alineados y no alineados en tareas de generación de texto.
- Despliegue en entornos locales con recursos limitados: gracias a los formatos GGUF, puede ejecutarse en CPUs o GPUs de consumo, por ejemplo con llama.cpp u Ollama, para aplicaciones que no requieren rendimiento de nivel servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La VRAM estimada depende de la cuantización elegida. Los tamaños de los archivos GGUF van desde 4.7 GB (Q2_K) hasta 12.8 GB (Q8_0), lo que indica que una GPU con al menos 6 GB de VRAM puede cargar la versión Q2_K, mientras que la Q8_0 necesita al menos 16 GB de VRAM.
- GPUs recomendadas: para cuantizaciones bajas (Q2_K-Q4_K_M) basta con una GPU de gama media como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB). Para Q6_K y Q8_0 se recomienda una RTX 4090 (24 GB) o A100 (40/80 GB).
- El modelo cabe en GPUs de consumo para la mayoría de cuantizaciones hasta Q5_K_M, pero las variantes Q6_K y Q8_0 requieren al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Dado que el modelo base no está documentado en cuanto a arquitectura ni rendimiento, no es posible comparar directamente con alternativas como Llama-3-8B o Mistral-7B. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está etiquetado como "dangerous" y "unaligned": no aplica filtros de seguridad, lo que puede generar contenido dañino, ilegal o extremadamente ofensivo. No es apto para uso en producción sin un sistema de moderación externo.
- Riesgo de alucinación: al ser un modelo no alineado y sin datos de entrenamiento documentados, el riesgo de generar información falsa o inventada es alto, especialmente en contextos largos.
- La licencia es "other" y no se especifica si permite uso comercial. Es necesario revisar la licencia del modelo base ReadyArt/Dark-Oddity-12B-v1.0 antes de cualquier uso profesional.
- Solo se declara inglés como idioma. No es recomendable para tareas multilingües.
- No hay información sobre la longitud de contexto máxima. Si el modelo tiene una ventana corta (por ejemplo, 4096 tokens), no será adecuado para tareas que requieran contexto muy largo.
- Las cuantizaciones estáticas de mradermacher no incluyen cuantización con matriz de importancia (imatrix), lo que puede reducir la calidad en comparación con cuantizaciones más avanzadas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Dark-Oddity-12B-v1.0-GGUF
- Modelo base (original): https://huggingface.co/ReadyArt/Dark-Oddity-12B-v1.0
- Repositorio de mradermacher: https://huggingface.co/mradermacher
- Página de solicitud de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Leaderboard de modelos no censurados: https://unrestricted.ai/## Resumen

Dark-Oddity-12B-v1.0-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Dark-Oddity-12B-v1.0, realizada por mradermacher. Se trata de un modelo de aproximadamente 12.000 millones de parámetros, orientado a generación de texto en inglés sin restricciones de contenido, incluyendo roleplay, contenido explícito y escenarios de interacción libre. El repositorio de cuantización ofrece once niveles de compresión (Q2_K a Q8_0), lo que permite adaptar el despliegue a distintos niveles de hardware.

La relevancia de esta ficha radica en la categoría de modelos no alineados (uncensored), que carecen de filtros de seguridad para contenido dañino o explícito. Esto lo hace útil para investigación sobre alineación, prototipado de herramientas sin moderación o aplicaciones de ficción adulta, pero también implica riesgos legales y éticos significativos. La documentación disponible no incluye detalles de arquitectura, entrenamiento ni benchmarks, por lo que muchas especificaciones técnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.956.539.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación de la cuantización. El repositorio de mradermacher indica únicamente que es una conversión estática del modelo original de ReadyArt, sin especificar si es un transformer denso, MoE o híbrido. Tampoco se mencionan datos sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF, SFT o DPO.

La cuantización GGUF es una técnica de compresión que reduce el tamaño del modelo y los requisitos de memoria, a costa de una pérdida de precisión. Las variantes Q4_K_M y Q4_K_S se recomiendan en la documentación como equilibrio entre velocidad y calidad, mientras que Q8_0 ofrece la mejor fidelidad al modelo original. No se han aplicado cuantizaciones con imatrix en esta versión.

## Capacidades

- Generación de texto sin restricciones de estilo, diseñado para roleplay, conversación explícita y escenarios de interacción libre.
- Soporte de conversaciones multi-turno, aunque la longitud de contexto no está documentada.
- Multilingüismo limitado: solo se declara el idioma inglés.
- No se indican capacidades de tool calling, agentes, razonamiento multi-step, vision ni audio.
- El modelo está etiquetado como "dangerous" y "unaligned", lo que implica que no aplica políticas de seguridad para filtrar contenido dañino o ilegal.

## Casos de uso

- Prototipado de asistentes de roleplay: el modelo puede generar narrativas de personajes con contexto persistente, aunque sin ventana de contexto documentada, lo que limita escenarios muy largos.
- Evaluación de técnicas de cuantización: al estar disponible en once niveles, permite comparar el impacto de la compresión en la calidad de la generación para un mismo modelo base.
- Investigación en alineación de modelos: útil para estudiar el comportamiento de sistemas sin filtros de seguridad, comparando con modelos alineados en tareas de generación de texto.
- Generación de ficción adulta: puede emplearse en proyectos de escritura creativa con contenido explícito, siempre que se cumplan las leyes locales y se gestione legalmente el material.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q2_K o Q3_K, puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, usando llama.cpp u Ollama.
- Investigación de sesgos en modelos no alineados: para analizar cómo se manifiestan los sesgos cuando no hay intervención de seguridad, útil en estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Los tamaños de archivo van desde 4.7 GB (Q2_K) hasta 12.8 GB (Q8_0). Para Q2_K se requiere al menos 6 GB de VRAM; para Q8_0, al menos 16 GB.
- GPU recomendadas: para cuantizaciones bajas (Q2_K a Q4_K_M) es suficiente una GPU de gama consumer como RTX 3090 (12 GB) o RTX 4060 Ti (16 GB). Para Q6_K y Q8_0 se recomienda una RTX 4090 (24 GB) o A100 (40/80 GB).
- El modelo cabe en GPUs de consumo para la mayoría de cuantizaciones hasta Q5_K_M (8.6 GB), pero Q6_K (9.9 GB) y Q8_0 (12.8 GB) requieren al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponible. Dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo base no está documentado en cuanto a arquitectura ni rendimiento, por lo que no es posible comparar directamente con otros modelos de 12B como Llama-2-12B o Mistral-12B. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está etiquetado como "dangerous" y "unaligned", por lo que no aplica filtros de seguridad y puede generar contenido dañino, ilegal o extremadamente sensible. No es apto para uso en producción sin un sistema de moderación externo.
- Riesgo de alucinación: al ser un modelo no alineado y sin documentación de entrenamiento, la probabilidad de generar información inventada es alta, especialmente en contextos largos.
- La licencia es "other" y no se especifican términos de uso comercial. Es imprescindible revisar la licencia del modelo base antes de cualquier aplicación profesional.
- Solo se declara inglés como idioma. No es recomendado para tareas en otros idiomas.
- La longitud de contexto no está documentada. Si el modelo tiene una ventana corta (por ejemplo, 4096 tokens), no será adecuado para tareas que requieran mucho contexto.
- Las cuantizaciones estáticas de mradermacher no incluyen imatrix, lo que puede reducir la calidad en comparación con cuantizaciones avanzadas como las de TheBloke.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Dark-Oddity-12B-v1.0-GGUF
- Modelo base (original): https://huggingface.co/ReadyArt/Dark-Oddity-12B-v1.0
- Repositorio de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Leaderboard de modelos no censurados: https://unrestricted.ai/
