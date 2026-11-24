# mradermacher/Melody1437-26B-A4B-GGUF

## Resumen

Melody1437-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Melody1437-26B-A4B, un ajuste fino orientado a roleplay, conversación instructiva y contenido para adultos. La cuantización la publica mradermacher, un actor habitual en el ecosistema de cuantizaciones GGUF, que distribuye los pesos optimizados para su uso con llama.cpp y derivados. El modelo base declara 25.233.142.046 parámetros totales (unos 25,2 mil millones) según los safetensors del repositorio, aunque la nomenclatura "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos por token.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de rol y conversación sin alineación restrictiva ("unaligned"), etiquetado explícitamente como NSFW y ERP, lo que lo sitúa en un nicho muy concreto de la comunidad open source. Por otro, la disponibilidad de cuantizaciones estáticas que van desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB) permite ejecutar un modelo de este tamaño en hardware de consumo, algo que con pesos en fp16 sería inviable en la mayoría de equipos domésticos.

No se dispone de información publicada sobre la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la información proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (deducido de la nomenclatura "26B-A4B"; no confirmado en la documentación) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | aproximadamente 4 B (deducido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La etiqueta `gemma-4` en el repositorio y la nomenclatura "26B-A4B" apuntan a una arquitectura derivada de la familia Gemma con mezcla de expertos, en la que el modelo total ronda los 25-26 mil millones de parámetros pero solo activa alrededor de 4 mil millones por token. Esta configuración es coherente con el tamaño de las cuantizaciones publicadas: Q8_0 ocupa 27,0 GB, lo que corresponde a los pesos completos del modelo con una sobrecarga mínima de metadatos, mientras que Q4_K_M baja a 16,9 GB.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. El modelo base se describe como un ajuste fino orientado a roleplay y conversación, con etiquetas que indican ausencia de alineación restrictiva y soporte explícito de contenido adulto. La cuantización realizada por mradermacher es estática, sin imatrix; el propio autor indica que las versiones con imatrix están disponibles en un repositorio separado (Melody1437-26B-A4B-i1-GGUF).

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis en roleplay y diálogo instructivo.
- Soporte de contenido explícito y para adultos, incluido ERP (erotic roleplay), según las etiquetas del repositorio.
- Modelo "unaligned": no incorpora las capas habituales de rechazo o moderación de los modelos instruct convencionales, lo que permite respuestas sin filtros en contextos creativos o de ficción.
- Capacidad multimodal: la presencia de archivos `mmproj` (Q8_0 y f16) indica soporte de entrada de imágenes a través de un proyector multimodal, presumiblemente heredado del modelo base.
- Soporte de instrucciones en inglés; el repositorio declara únicamente el idioma `en`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes y estilo narrativo a lo largo de múltiples turnos, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPUs de 24 GB y permiten sesiones fluidas.
- Escritura creativa de ficción para adultos: la ausencia de alineación restrictiva y las etiquetas NSFW/ERP lo hacen adecuado para generar narrativa explícita sin rechazos, en un entorno local y privado.
- Prototipado de asistentes conversacionales sin filtros: útil para investigadores que estudian el comportamiento de modelos sin moderación, comparando respuestas frente a variantes alineadas.
- Generación de diálogos para videojuegos o narrativa interactiva: la naturaleza instructiva y conversacional permite integrarlo en motores de diálogo con llamadas a llama.cpp u Ollama, con latencia controlada gracias a los aproximadamente 4 B de parámetros activos.
- Experimentación con cuantizaciones en hardware de consumo: las versiones Q2_K (10,7 GB) y Q3_K_M (13,4 GB) permiten probar el modelo en GPUs de 12-16 GB, aunque con pérdida de calidad documentada por el autor para Q3_K_M.
- Análisis de imágenes en contexto conversacional: los archivos mmproj permiten adjuntar imágenes a la conversación, útil para descripción de escenas o asistencia creativa multimodal, siempre que el modelo base conserve esa capacidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantización, lo que facilita estudios de degradación de perplejidad y calidad entre Q2_K y Q8_0 en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K 10,7 GB; Q3_K_S 12,3 GB; Q3_K_M 13,4 GB; Q3_K_L 13,9 GB; IQ4_XS 14,2 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB; Q5_K_S 18,1 GB; Q5_K_M 19,2 GB; Q6_K 22,7 GB; Q8_0 27,0 GB. Añadir aproximadamente 0,9-1,3 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q6_K; RTX 3090 o RTX 4080 (16-24 GB) para Q4_K_M; A100 40 GB o H100 para Q8_0 con contexto largo; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) solo para Q2_K o Q3_K_S.
- Cabe en GPU de consumo: sí, en configuraciones de 12 GB o más según la cuantización elegida. Q4_K_M (16,9 GB) es la opción recomendada por el autor por equilibrio entre velocidad y calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints. Para el modelo base en safetensors se requeriría transformers con el código correspondiente.
- Latencia y throughput estimados: no disponibles. Al tratarse de una arquitectura MoE con aproximadamente 4 B de parámetros activos, se espera un throughput superior al de un modelo denso de 25 B, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa rigurosa con alternativas. La siguiente tabla recoge únicamente los datos verificables del repositorio frente a referencias genéricas de la misma categoría, marcando como no disponible lo que no se conoce.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melody1437-26B-A4B-GGUF | 25,2 B totales, ~4 B activos | no disponible | Apache 2.0 | GGUF | Roleplay/NSFW, unaligned, multimodal vía mmproj |
| Modelo denso de ~24 B (referencia genérica) | ~24 B | no disponible | variable | safetensors/GGUF | Sin datos comparativos disponibles |
| Modelo MoE de ~30 B con ~3-4 B activos (referencia genérica) | ~30 B totales | no disponible | variable | safetensors/GGUF | Sin datos comparativos disponibles |

No se identifican en la información proporcionada modelos comparables concretos con benchmarks publicados que permitan establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como NSFW, ERP y "not-for-all-audiences"; no es adecuado para entornos productivos orientados al público general ni para aplicaciones sin moderación externa.
- Modelo "unaligned": la ausencia de alineación restrictiva implica mayor riesgo de generar contenido ofensivo, ilegal o dañino si no se aplican salvaguardas externas.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación; al ser un ajuste fino orientado a creatividad y rol, la fidelidad factual no es un objetivo del entrenamiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide garantizar conversaciones de largo alcance sin truncamiento.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material para adultos; la responsabilidad recae en el desplegador.
- Cuantizaciones de baja calidad: el propio autor marca Q3_K_M como "lower quality"; Q2_K y Q3_K_S degradan notablemente la perplejidad. Para producción se recomienda Q4_K_M o superior.
- Sin datos de benchmarks ni de entrenamiento: no es posible evaluar objetivamente su calidad frente a alternativas sin pruebas propias.
- Fecha de creación futura (2026-08-18) en los metadatos del repositorio, lo que puede indicar inconsistencias en la información de la ficha de Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Melody1437-26B-A4B-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Melody1437-26B-A4B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
