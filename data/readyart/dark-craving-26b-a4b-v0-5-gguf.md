# ReadyArt/Dark-Craving-26B-A4B-v0.5-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.5-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Craving-26B-A4B-v0.5, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generación de texto orientado a conversación, roleplay y contenido para adultos (etiquetado explícitamente como nsfw, explicit, ERP y unaligned), afinado a partir de una arquitectura de tipo Mixture of Experts con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y un tamaño de repositorio de 68,7 GB.

El modelo está diseñado exclusivamente para inglés y se distribuye bajo licencia Apache 2.0. La nomenclatura "A4B" sugiere una configuración de expertos con 4 activos por token, aunque la información proporcionada no detalla el número exacto de parámetros activos ni la longitud de contexto soportada. El modelo base es ReadyArt/Dark-Craving-26B-A4B-v0.5, del que esta ficha constituye una cuantización.

Su relevancia radica en que ofrece una alternativa cuantizada para despliegue local de un modelo conversacional sin alineamiento restrictivo, pensado para aplicaciones de rol y narrativa interactiva. No obstante, la ausencia de benchmarks publicados, la falta de datos sobre el entrenamiento y su orientación explícita a contenido para adultos limitan seriamente su uso en entornos comerciales o de producción generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según nomenclatura A4B; detalles no disponibles |
| Parámetros totales | 25.233.142.046 (~25,2 B) |
| Parámetros activos | no disponible (la nomenclatura A4B sugiere 4 expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura de tipo Mixture of Experts, inferida a partir del sufijo "A4B" en su nombre y del recuento de parámetros totales (25,2 B). No se especifican el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento. Tampoco se detalla la longitud de contexto nativa ni si emplea atención lineal o algún esquema híbrido.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. La model card del autor se limita a etiquetas descriptivas (nsfw, explicit, roleplay, unaligned, ERP, adult-content, mature, conversational, instruct) y a elementos de presentación visual, sin información técnica sobre el proceso de entrenamiento. Esta versión concreta es una cuantización GGUF del modelo base, por lo que su comportamiento reproduce el del modelo original con las pérdidas de precisión propias de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo e instrucciones.
- Roleplay y narrativa interactiva, con énfasis en contenido para adultos y temáticas explícitas.
- Modo instruct: responde a instrucciones directas en formato conversacional.
- Comportamiento "unaligned": sin las restricciones de seguridad típicas de modelos alineados, lo que permite temáticas maduras.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Narrativa interactiva para adultos: el modelo puede sostener conversaciones de rol extensas con personajes y tramas maduras, aprovechando su naturaleza conversacional y su falta de alineamiento restrictivo para contenido explícito.
- Motores de rol en aplicaciones de ficción interactiva: integrable en plataformas de chat donde el usuario define escenarios y el modelo mantiene coherencia de personaje a lo largo de múltiples turnos.
- Prototipado de asistentes conversacionales sin filtros: útil en investigación sobre comportamiento de modelos sin alineamiento, para estudiar sesgos y dinámicas de diálogo en entornos controlados.
- Generación de ficción y guiones: redacción de diálogos y escenas narrativas con tono maduro, adecuado para escritores que necesitan borradores rápidos de contenido explícito.
- Despliegue local con llama.cpp u Ollama: al estar en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo, lo que facilita pruebas offline sin depender de APIs externas.
- Investigación sobre cuantización: comparar el comportamiento del modelo base frente a esta versión GGUF para evaluar la degradación de calidad en tareas conversacionales.
- Simulación de personajes en juegos de texto: integración en motores de rol por turnos donde se requiere vocabulario maduro y coherencia de registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 25,2 B parámetros totales, una cuantización Q4_K_M ocuparía aproximadamente 15-16 GB; Q8_0 rondaría los 27-28 GB; FP16 requeriría unos 50 GB. No hay datos oficiales del autor sobre niveles de cuantización concretos.
- GPU recomendadas: para Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permitirían inferencia completa en GPU; para Q8, se necesitarían A100 40 GB o H100.
- Cabe en GPU de consumo: sí, en configuraciones Q4 o inferiores sobre GPU con 16-24 GB; también es viable con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles. Al ser MoE, el número de parámetros activos (presumiblemente una fracción de los 25,2 B) influiría positivamente en la velocidad, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.5-GGUF | 25,2 B (MoE) | no disponible | Apache 2.0 | Roleplay/ERP sin alineamiento | HuggingFace (GGUF) |
| Modelos de rol comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Contenido explícito y para adultos: el modelo está etiquetado como nsfw, explicit y not-for-all-audiences; no es apto para uso generalista ni para menores.
- Falta de alineamiento: la etiqueta "unaligned" implica ausencia de salvaguardas, con riesgo elevado de generar contenido ofensivo, ilegal o dañino sin filtros.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un modelo de rol, la veracidad factual no es su objetivo y la alucinación es esperable.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Contexto: se desconoce la longitud de contexto, lo que impide garantizar conversaciones largas sin truncamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material explícito; la responsabilidad recae en el desplegador.
- Datos de entrenamiento opacos: sin información sobre el dataset, no se pueden evaluar sesgos ni contaminación.
- Cuantización: esta versión GGUF puede degradar la coherencia respecto al modelo base, especialmente en cuantizaciones agresivas.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.5-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.5
