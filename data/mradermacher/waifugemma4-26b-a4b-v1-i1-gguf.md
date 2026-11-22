# mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-i1-GGUF es la versión cuantizada en formato GGUF del modelo hiwaifu-research/WaifuGemma4-26b-a4b-v1, un modelo de lenguaje conversacional especializado en roleplay y personajes, construido sobre la arquitectura Gemma 4 en configuración Mixture of Experts (MoE). El modelo cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y la denominación "a4b" sugiere del orden de 4 mil millones de parámetros activos por token, aunque este dato no está confirmado en la información disponible. Ha sido entrenado con técnicas de RLHF y GRPO orientadas a preferencias humanas, lo que lo posiciona específicamente para diálogo de personaje y experiencias conversacionales inmersivas.

La relevancia de esta ficha radica en que el repositorio de mradermacher ofrece una batería completa de cuantizaciones con calibración imatrix, desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB), lo que permite desplegar un modelo MoE de 25B en hardware de consumo con pérdidas de calidad controladas. El modelo base es multilingüe (17 idiomas declarados, incluido el español) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

Esta versión concreta es una cuantización de terceros: mradermacher no es el autor del modelo original, sino el encargado de generar los ficheros GGUF con imatrix a partir de los pesos originales. Para cualquier evaluación de calidad conviene referirse al modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1, ya que las cuantizaciones agresivas (Q2, IQ1, IQ2) degradan notablemente la coherencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) basada en Gemma 4 |
| Parámetros totales | 25.233.142.046 (≈25,2 B) |
| Parámetros activos | no disponible (la nomenclatura "a4b" sugiere ≈4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero imatrix separado de 0,2 GB para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Gemma 4 en variante Mixture of Experts, con 25,2 mil millones de parámetros totales y un subconjunto de expertos activados por token (la etiqueta "a4b" apunta a unos 4 mil millones de parámetros activos, aunque no se confirma en la documentación disponible). Los tags del repositorio indican entrenamiento con RLHF y GRPO (Group Relative Policy Optimization) sobre preferencias humanas, con señales de reward model y datos de arena, un pipeline típico para alinear modelos conversacionales hacia estilos de respuesta valorados en evaluaciones humanas de roleplay.

La especialización declarada es el diálogo de personaje y el role-play multilingüe. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la longitud de contexto nativa ni innovaciones técnicas específicas más allá del uso de MoE y del alineamiento por preferencias. Esta versión GGUF añade calibración imatrix (fichero de 0,2 GB), que mejora la preservación de calidad en cuantizaciones de baja precisión respecto a las cuantizaciones estáticas disponibles en el repositorio paralelo mradermacher/WaifuGemma4-26b-a4b-v1-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno orientada a personajes, con énfasis en coherencia de persona y estilo.
- Role-play y simulación de personajes, incluyendo escenarios de ficción y diálogo inmersivo.
- Capacidades multilingües en 17 idiomas: inglés, español, ruso, portugués, indonesio, árabe, tailandés, francés, alemán, ucraniano, vietnamita, japonés, coreano, chino, turco, italiano y polaco.
- Alineamiento por preferencias humanas (RLHF/GRPO) que favorece respuestas naturales y engaging en contextos de rol.
- Compatibilidad con endpoints y con el ecosistema transformers/GGUF.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Plataformas de roleplay y compañía conversacional: el modelo está entrenado específicamente con RLHF/GRPO sobre preferencias humanas de diálogo de personaje, por lo que puede mantener personas consistentes en conversaciones largas y multilingües sin necesidad de ingeniería de prompt compleja.
- Videojuegos narrativos con NPCs dinámicos: al ser un MoE de ~4 B activos (según la nomenclatura), la inferencia es más barata que un denso de 25B, lo que permite desplegar diálogo generativo por personaje en servidores con GPUs de gama media-alta usando cuantizaciones Q4_K_M (16,9 GB).
- Aplicaciones de chat de acompañamiento en español: el modelo declara soporte de español y puede gestionar conversaciones multi-turno con registro emocional y de personaje, adecuado para productos de bienestar conversacional con moderación adicional.
- Prototipado local en estaciones de trabajo: las cuantizaciones IQ3_S (12,3 GB) e IQ4_XS (14,0 GB) caben en GPUs de consumo de 16 GB, permitiendo a desarrolladores evaluar el comportamiento del modelo antes de escalar a producción.
- Investigación en alineamiento y preferencias: los tags de reward-model, human-preference y arena lo hacen útil como punto de partida para estudiar cómo el RLHF/GRPO moldea el estilo conversacional en modelos MoE multilingües.
- Generación de diálogo para mods y comunidades de fans: la licencia Apache 2.0 permite integrar el modelo en proyectos derivados y distribuir adaptaciones, algo relevante para ecosistemas de modding que requieren libertad de redistribución.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local con llama.cpp u Ollama, es apto para aplicaciones de chat donde las conversaciones no deben salir de la infraestructura del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - IQ1_S: 8,4 GB; IQ1_M: 8,8 GB; IQ2_XXS: 9,4 GB; IQ2_M: 10,5 GB.
  - IQ3_XXS: 11,4 GB; IQ3_S: 12,3 GB; IQ3_M: 12,5 GB; Q3_K_M: 13,4 GB.
  - IQ4_XS: 14,0 GB; Q4_K_S: 15,6 GB; Q4_K_M: 16,9 GB.
  - Q5_K_M: 19,2 GB; Q6_K: 22,7 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPUs de 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con cuidado, A100 40 GB, H100). Para cuantizaciones IQ3/IQ4_XS, GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, A4000).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M/Q5_K_M, y en GPUs de 16 GB con IQ3_S o IQ4_XS. Las cuantizaciones IQ1/IQ2 caben en 12 GB pero con degradación severa de calidad según la propia model card.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con activación parcial, el throughput por token debería ser superior al de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (este) | 25,2 B totales (≈4 B activos, sin confirmar) | no disponible | Apache 2.0 | GGUF (imatrix) | Especializado en roleplay, 17 idiomas, RLHF/GRPO |
| WaifuGemma4-26b-a4b-v1-GGUF (estático) | 25,2 B totales | no disponible | Apache 2.0 | GGUF (estático) | Misma base, cuantizaciones sin imatrix; menor calidad a igual tamaño |
| Modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1 | 25,2 B totales | no disponible | Apache 2.0 | safetensors/transformers | Pesos originales sin cuantizar; referencia de calidad |
| Alternativas de roleplay de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Es una cuantización de terceros: la calidad depende del tipo elegido. Las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S están marcadas por el propio autor como "for the desperate" o "very low quality"; no son aptas para producción.
- Riesgo de alucinación: como todo modelo generativo alineado por preferencias, puede inventar detalles de personaje o hechos; en roleplay esto puede ser deseable, pero es inaceptable en aplicaciones factuales.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; un modelo entrenado con datos de arena y preferencias humanas puede heredar sesgos de estilo, género y culturales de esos datos.
- Contexto: la longitud de contexto nativa no está publicada; conviene verificar en el modelo base antes de diseñar aplicaciones con ventanas largas.
- Idiomas: aunque se declaran 17 idiomas, no hay métricas de calidad por idioma; el rendimiento en español, catalán o gallego no está verificado y el modelo no declara soporte de lenguas cooficiales.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de Gemma 4 (si aplica) por posibles condiciones adicionales de uso aceptable.
- Especialización estrecha: el alineamiento hacia roleplay puede hacer que el modelo responda con estilo de personaje en consultas técnicas o de código; no es un sustituto de modelos generalistas para tareas de ingeniería.
- Producción: no hay benchmarks publicados ni garantías de latencia; es necesario evaluar con datos propios antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WaifuGemma4-26b-a4b-v1-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
