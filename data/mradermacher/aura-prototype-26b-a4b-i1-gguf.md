# mradermacher/Aura-Prototype-26B-A4B-i1-GGUF

## Resumen

Aura-Prototype-26B-A4B es un modelo de lenguaje orientado a escritura creativa, narrativa y roleplay, desarrollado por EldritchLabs y distribuido en formato GGUF por mradermacher. Se trata de un merge construido con mergekit (variante mergekit-exp) a partir de la familia Gemma, según indican las etiquetas del repositorio, con un total de 25.971.339.550 parámetros (aproximadamente 26B). El sufijo "A4B" sugiere una arquitectura de mezcla de expertos con unos 4B de parámetros activos, aunque la información proporcionada no detalla la configuración exacta de expertos ni la longitud de contexto.

El modelo está especializado en generación de ficción: relatos, tramas y subtramas, continuación de escenas, romance, terror, ciencia ficción y roleplay conversacional, con énfasis en una prosa vívida. No está pensado como modelo generalista de razonamiento o código, sino como un motor de escritura y diálogo creativo. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales conocidas.

La relevancia de esta ficha radica en la disponibilidad de cuantizaciones GGUF con imatrix (generadas por mradermacher), que permiten ejecutar un modelo de 26B en hardware de consumo. El repositorio acumula cerca de 14.000 descargas, lo que indica interés práctico en despliegues locales para escritura asistida y roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma, presumiblemente MoE (etiqueta gemma4; sufijo A4B), detalles no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; también hay quants estáticos en el repo hermano |
| Idiomas soportados | inglés (etiqueta language: eng); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna ni el proceso de entrenamiento. Las etiquetas del repositorio indican que se trata de un merge experimental realizado con mergekit (mergekit-exp) sobre la familia Gemma, y el nombre "Aura-Prototype-26B-A4B" apunta a una configuración de mezcla de expertos con aproximadamente 4B de parámetros activos sobre 26B totales. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

El modelo base es EldritchLabs/Aura-Prototype-26B-A4B. Las cuantizaciones publicadas por mradermacher son de tipo i1 (importancia matricial, imatrix), generadas con el objetivo de preservar calidad en rangos bajos de bits; el autor incluye además el fichero imatrix para que terceros puedan crear sus propias cuantizaciones. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de ficción y narrativa: relatos, tramas principales y subtramas, continuación de escenas y prosa vívida en múltiples géneros (terror, romance, ciencia ficción, fantasía).
- Roleplay y conversación multi-turno: etiquetas específicas de roleplaying, RP y diálogo conversacional, con soporte declarado para lenguaje soez cuando el contexto lo requiere.
- Escritura creativa asistida: generación de escenas, descripciones y diálogos con estilo literario.
- Generación de tramas y subtramas: útil para planificación narrativa y desarrollo de argumentos.
- Conversación general: etiqueta "conversational", aunque el foco es creativo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de otros idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Escritura asistida de ficción: el modelo puede generar capítulos, escenas y diálogos con prosa cuidada, adecuado para autores que necesitan borradores rápidos o variaciones estilísticas en género narrativo.
- Roleplay conversacional local: gracias a las cuantizaciones GGUF de 8,6 a 23,3 GB, se puede desplegar en un equipo personal para sesiones de rol multi-turno sin depender de APIs externas.
- Generación de tramas y subtramas para guiones o novelas: el modelo está etiquetado específicamente para plot generation y sub-plot generation, lo que lo hace útil en fases de preproducción narrativa.
- Continuación de escenas en pipelines editoriales: con la cuantización Q4_K_M (17,3 GB) se puede integrar en herramientas de escritura que pidan continuaciones coherentes de un texto previo.
- Prototipado de videojuegos narrativos: para diálogos de personajes no jugadores (NPC) en juegos de rol o aventuras conversacionales, ejecutando el modelo en local con llama.cpp u Ollama.
- Generación de contenido de terror y romance: las etiquetas del modelo cubren explícitamente estos géneros, lo que permite usarlo en publicaciones serializadas o contenido interactivo de nicho.
- Experimentación con merges y cuantizaciones: el fichero imatrix incluido permite a investigadores crear cuantizaciones propias y evaluar el impacto de la compresión en calidad narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~8,6 GB; IQ2_M ~10,8 GB; IQ3_M ~12,8 GB; IQ4_XS ~14,4 GB; Q4_K_M ~17,3 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB.
- GPU recomendadas: para Q4_K_M o superiores, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM; para cuantizaciones IQ3 o inferiores, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080 son suficientes.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones IQ2/IQ3/Q4; las variantes Q5 y Q6 requieren 24 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints. No se menciona vLLM ni TGI para esta versión GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo MoE con ~4B activos (según el nombre), la velocidad de generación debería ser superior a la de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Aura-Prototype-26B-A4B (i1-GGUF) | ~26B (MoE, ~4B activos según nombre) | no disponible | Apache 2.0 | Ficción, roleplay, escritura creativa | GGUF en HF |
| Modelos densos de 24-27B en GGUF (p. ej. Mistral/Mixtral, Gemma) | 24-27B | variable | variable | Generalista | Amplia |
| Merges de escritura creativa de 7-13B | 7-13B | variable | variable | Ficción y roleplay | Amplia |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un merge orientado a ficción, puede reproducir estereotipos de género presentes en literatura de terror y romance.
- Riesgo de alucinación: inherente a los modelos generativos; en contextos de ficción el riesgo es menor, pero no debe usarse como fuente factual.
- Limitaciones de contexto e idioma: solo se declara inglés; el contexto máximo no está especificado, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los modelos fusionados en el merge.
- Caveats para producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (el propio autor las etiqueta como "for the desperate" o "very low quality"); para producción se recomienda Q4_K_M o superior. El modelo es un "prototipo" y un merge experimental, sin garantías de estabilidad ni mantenimiento.
- Contenido sensible: el modelo está etiquetado para swearing y roleplay adulto; requiere moderación si se expone a usuarios finales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/EldritchLabs/Aura-Prototype-26B-A4B
- Quants estáticos: https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Aura-Prototype-26B-A4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
