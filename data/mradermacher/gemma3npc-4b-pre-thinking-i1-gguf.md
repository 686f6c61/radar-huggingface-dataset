# mradermacher/Gemma3NPC-4B-pre-thinking-i1-GGUF

## Resumen

Gemma3NPC-4B-pre-thinking-i1-GGUF es una recopilación de cuantizaciones GGUF, generadas con imatrix (importance matrix), del modelo chimbiwide/Gemma3NPC-4B-pre-thinking, un ajuste fino de Gemma 3 de 4B orientado a la interpretación de personajes no jugadores (NPC) en juegos de rol. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source. El modelo base parte de la familia Gemma 3 de Google y ha sido especializado mediante un dataset propio de roleplay, chimbiwide/NPC-RP-Pre-Thinking.

El interés de esta ficha es doble. Por un lado, documenta un caso de uso muy concreto: un modelo de 3.880 millones de parámetros afinado para mantener personalidad y coherencia conversacional en escenarios de rol. Por otro, muestra el flujo habitual de la comunidad: un modelo base con licencia Gemma se ajusta, se publica en precisión completa y un tercero genera cuantizaciones IQ para que pueda ejecutarse en hardware de consumo.

La versión aquí descrita es la variante i1, que emplea una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión. El repositorio incluye desde cuantizaciones de 1,2 GB (IQ1_S) hasta formatos de 5 bits, además del fichero imatrix para generar cuantizaciones propias. La licencia es la de Gemma, con acceso condicionado a la aceptación de los términos de uso de Google en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Gemma 3; detalles no disponibles en la información proporcionada) |
| Parámetros totales | 3.880.263.168 (3,88B) |
| Parámetros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M (y superiores según el listado truncado) |
| Idiomas soportados | inglés (etiqueta `language: en` en la model card) |
| Licencia | gemma (términos de uso de Google, acceso condicionado) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 de 4B, una arquitectura transformer decoder-only. La model card del repositorio de cuantización no detalla la arquitectura interna del modelo base ni los hiperparámetros del ajuste fino; únicamente indica que el dataset de entrenamiento es chimbiwide/NPC-RP-Pre-Thinking, un conjunto de datos de roleplay orientado a personajes no jugadores, y que el modelo es de visión, ya que la model card menciona que los ficheros mmproj, si existen, se encuentran en el repositorio estático.

La innovación técnica de esta publicación concreta no está en el modelo, sino en el proceso de cuantización: se han generado cuantizaciones i1 (con imatrix) y se ofrece el fichero imatrix.gguf (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones. El sufijo "pre-thinking" del nombre sugiere un formato de entrenamiento con razonamiento previo, aunque no se documenta en la información disponible. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a roleplay e interpretación de personajes.
- Mantenimiento de personalidad y coherencia en diálogos multi-turno, según el propósito declarado del dataset de ajuste.
- Capacidad multimodal de visión, ya que la model card indica que el modelo base es un modelo de visión y remite a los ficheros mmproj del repositorio estático.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma de la model card.
- Modo "thinking" o razonamiento explícito: el nombre del modelo lo sugiere, pero no se documenta su funcionamiento.

## Casos de uso

- Diálogos de NPC en videojuegos: el modelo puede generar respuestas con personalidad consistente para personajes no jugadores, y su tamaño de 4B permite ejecutarlo en el mismo equipo que el juego o en un servidor local con latencia baja.
- Prototipado de sistemas de rol conversacional: gracias a las cuantizaciones de 2-3 GB, se puede desplegar en un portátil con llama.cpp u Ollama para iterar sobre guiones y personalidades sin coste de API.
- Simulacros de entrevista o entrenamiento de habilidades sociales: el ajuste en roleplay permite crear interlocutores con un perfil definido que mantienen el personaje durante conversaciones largas.
- Generación de contenido narrativo asistida: el modelo puede redactar diálogos de personajes coherentes con un trasfondo establecido, útil para guionistas y diseñadores narrativos.
- Evaluación de pipelines de cuantización: al ofrecer una escala completa de cuantizaciones IQ (de 1 a 5 bits), sirve para medir la degradación de calidad conversacional según el nivel de compresión en un caso de uso concreto.
- Despliegue en entornos con recursos limitados: las variantes IQ2 e IQ3 (1,4-2,3 GB) permiten ejecutar el modelo en GPUs de gama baja o incluso en CPU, manteniendo el rol del personaje para aplicaciones de chat sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-2,7 GB para cuantizaciones de 1 a 4 bits, y alrededor de 2,9 GB para las variantes de 5 bits (tamaños de fichero indicados en la model card).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones IQ3/IQ4; una RTX 3060, RTX 4060 o superior permite usar Q4_K_M con holgura. Para las variantes de 5 bits se recomienda 6-8 GB de VRAM.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales, e incluso en iGPU con memoria unificada para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio está etiquetado como compatible con endpoints. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-pre-thinking-i1-GGUF | 3,88B | no disponible | Gemma | GGUF (i1) | Ajuste fino para roleplay de NPC, cuantizaciones con imatrix |
| Gemma 3 4B (base) | 4B | no disponible en esta ficha | Gemma | safetensors, GGUF | Modelo generalista del que deriva; no especializado en roleplay |
| mradermacher/Gemma3NPC-4B-pre-thinking-GGUF | 3,88B | no disponible | Gemma | GGUF (estáticas) | Misma familia, cuantizaciones estáticas sin imatrix |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está orientado a roleplay en inglés; su rendimiento en otros idiomas, incluido el castellano, no está documentado y previsiblemente será inferior.
- Riesgo de alucinación y de salida de personaje en conversaciones largas o con contextos fuera del dominio de entrenamiento.
- No se documentan sesgos específicos del ajuste fino; al heredar la base Gemma, arrastra los sesgos del modelo original.
- La licencia Gemma impone términos de uso de Google y requiere aceptar la licencia en Hugging Face para acceder al modelo; conviene revisar las restricciones de uso comercial antes de desplegarlo en producción.
- Las cuantizaciones de 1 y 2 bits (IQ1, IQ2) degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- No hay información sobre la longitud de contexto efectiva ni sobre el soporte real de tool calling, por lo que no debe asumirse para aplicaciones de agentes.
- El repositorio tiene 48,4 GB por la acumulación de todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma3NPC-4B-pre-thinking-i1-GGUF
- Modelo base: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-Pre-Thinking
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma3NPC-4B-pre-thinking-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma3NPC-4B-pre-thinking-i1-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
