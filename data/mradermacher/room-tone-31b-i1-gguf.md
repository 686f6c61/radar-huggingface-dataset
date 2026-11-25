# mradermacher/Room-Tone-31B-i1-GGUF

## Resumen

Room-Tone-31B es un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) afinado para conversación de rol (roleplay) y contenido para adultos, desarrollado por ReadyArt. La versión aquí descrita es la cuantización GGUF realizada por mradermacher bajo la metodología i1 (imatrix), que publica el modelo en múltiples niveles de compresión para su uso con llama.cpp y entornos compatibles. El modelo está etiquetado explícitamente como NSFW, adult-content y not-for-all-audiences, y su orientación principal es la generación de diálogo multi-personaje y conversaciones de rol maduras.

La relevancia de esta ficha radica en que se trata de una cuantización práctica de un modelo de 31B pensada para ejecución local: los archivos van desde 7,3 GB (IQ1_S) hasta 25,3 GB (Q6_K), lo que permite desplegarlo en hardware de consumo con las cuantizaciones bajas y en GPUs de 24 GB con las intermedias. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque el contenido generado está orientado a adultos y requiere las salvaguardas adecuadas.

La información disponible es limitada: la model card del repositorio de cuantización no incluye detalles sobre arquitectura, datos de entrenamiento, longitud de contexto ni benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ReadyArt/Room-Tone-31B; transformer, no confirmado en la información disponible) |
| Parametros totales | 30.697.345.596 (≈30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también se ofrecen cuantizaciones estáticas en el repositorio Room-Tone-31B-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna del modelo base ReadyArt/Room-Tone-31B (tipo de transformer, uso de atención lineal, decodificación especulativa u otras innovaciones). El recuento de parámetros (30.697.345.596) es consistente con un modelo denso de aproximadamente 31B, pero no se confirma si emplea mezcla de expertos ni el número de parámetros activos.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Lo único verificable es la orientación temática del modelo (roleplay, conversación multi-personaje, contenido adulto) y que la cuantización i1 utiliza un fichero imatrix (Room-Tone-31B.imatrix.gguf, 0,1 GB) para ponderar la importancia de los tensores durante la compresión, lo que según el autor mejora la calidad frente a cuantizaciones estáticas de tamaño similar.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Roleplay y conversación multi-personaje (etiquetas multi-character y ensemble), pensada para escenas con varios interlocutores.
- Contenido para adultos y temática madura (nsfw, adult-content, mature), con las advertencias de uso correspondientes.
- Generación de texto genérica (pipeline text-generation).
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como API.
- Capacidades de visión: la model card menciona que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático; no se confirma la disponibilidad efectiva de pesos multimodales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener diálogos de rol prolongados en inglés, con cuantizaciones IQ4_XS (16,8 GB) o Q4_K_M (18,8 GB) que caben en GPUs de 24 GB, lo que permite ejecutarlo en estaciones de trabajo sin depender de servicios en la nube.
- Simulación de personajes múltiples: gracias a sus etiquetas multi-character y ensemble, es adecuado para generar escenas con varios personajes que interactúan entre sí, útil en prototipos de narrativa interactiva o videojuegos de texto.
- Escritura creativa asistida para adultos: para autores que necesitan generar borradores de ficción madura, el modelo puede producir diálogo y descripción en inglés con un tono consistente, siempre con revisión humana y control de contenido.
- Investigación sobre seguridad y alineación: al ser un modelo explícitamente NSFW con licencia Apache 2.0, sirve como objeto de estudio para evaluar filtros de contenido, clasificadores de toxicidad y mecanismos de moderación en pipelines de generación.
- Despliegue en entornos con presupuesto de VRAM ajustado: las cuantizaciones IQ2_M (11,0 GB) o Q3_K_M (15,4 GB) permiten ejecutar un modelo de 31B en GPUs de consumo de 12-16 GB, con la pérdida de calidad asociada, para pruebas de concepto de chat conversacional.
- Integración en servicios de API compatibles: la etiqueta endpoints_compatible facilita exponer el modelo mediante servidores compatibles con la API de OpenAI, útil para prototipar aplicaciones de chat que luego se migrarán a modelos mayores.
- Generación de datos sintéticos de diálogo: para crear corpus de conversación multi-turno en inglés destinados a entrenar o evaluar otros modelos, con la salvedad de que el contenido adulto debe filtrarse según el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - IQ1_S: 7,3 GB; IQ1_M: 7,8 GB; IQ2_XXS: 8,8 GB; IQ2_XS: 9,6 GB; IQ2_S: 10,3 GB; IQ2_M: 11,0 GB.
  - Q2_K_S: 11,1 GB; Q2_K: 12,0 GB; IQ3_XXS: 12,2 GB; IQ3_XS: 13,2 GB; IQ3_S y Q3_K_S: 13,9 GB; IQ3_M: 14,5 GB; Q3_K_M: 15,4 GB; Q3_K_L: 16,7 GB.
  - IQ4_XS: 16,8 GB; Q4_0: 17,8 GB; Q4_K_S: 17,9 GB; Q4_K_M: 18,8 GB; Q4_1: 19,6 GB.
  - Q5_K_S: 21,4 GB; Q5_K_M: 21,9 GB; Q6_K: 25,3 GB.
- GPU recomendadas: para las cuantizaciones de 4 bits (Q4_K_M, 18,8 GB) una RTX 4090 (24 GB) o A100 40 GB; para Q5 y Q6, A100 40 GB, H100 o RTX 4090 con offload parcial; para IQ1-IQ2, GPUs de 12-16 GB como RTX 4070 Ti Super o RTX 4080.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ1 a Q3 caben en GPUs de 12-16 GB; Q4_K_M cabe en 24 GB; Q5_K_M y Q6_K requieren 24 GB con margen ajustado o 32 GB+.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (etiqueta endpoints_compatible), y cualquier runtime que soporte GGUF con cuantizaciones i1. Para el modelo base en safetensors, transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Room-Tone-31B-i1-GGUF | ≈30,7B | no disponible | Apache 2.0 | GGUF (i1) | Roleplay/NSFW, solo inglés; cuantizaciones de 7,3 a 25,3 GB |
| Modelo base ReadyArt/Room-Tone-31B | ≈30,7B | no disponible | Apache 2.0 | safetensors | Origen de la cuantización; sin datos de entrenamiento publicados |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de contexto de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como NSFW, adult-content y not-for-all-audiences; no debe desplegarse en entornos accesibles a menores sin filtros y controles de edad.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos: no se han publicado evaluaciones de sesgo; al ser un modelo de roleplay entrenado presumiblemente con datos conversacionales, puede reproducir estereotipos presentes en esos datos.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en tareas factuales debe tratarse como no fiable sin verificación.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar conversaciones largas con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas locales sobre material para adultos; la responsabilidad del cumplimiento recae en el desplegador.
- Cuantizaciones extremas: IQ1_S, IQ1_M e IQ2_XXS degradan notablemente la calidad (el propio autor las describe como "for the desperate"); para producción se recomienda Q4_K_M o superior.
- Visión: la model card menciona que es un modelo de visión, pero no se confirma la disponibilidad de ficheros mmproj en este repositorio; verificar en el repositorio estático antes de asumir capacidades multimodales.
- Sin benchmarks: la ausencia de resultados publicados impide comparar su calidad objetiva frente a alternativas.

## Enlaces

- Repositorio Hugging Face (cuantización i1): https://huggingface.co/mradermacher/Room-Tone-31B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Room-Tone-31B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Room-Tone-31B
- Página de descargas del autor: https://hf.tst.eu/model#Room-Tone-31B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
