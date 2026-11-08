# kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Welsh-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en galés (Cymraeg), desarrollado por el usuario kataguru. Se construye sobre la base multipropósito Kataguru-Sceptic-35B-A3B-v3.1 y aplica una estrategia de expansión de expertos en lugar de un continued pre-training convencional: mantiene congelados los 254 expertos originales y añade dos expertos dedicados al galés en cada una de las 40 capas MoE. El objetivo es dotar al modelo de capacidades nativas de traducción y generación en galés sin degradar el razonamiento científico, el código ni el tool calling del modelo base.

El modelo se presenta como una "edición soberana" del idioma galés dentro de una cola de publicaciones multilingües del autor. Según la model card, la arquitectura parte de un transformer MoE con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, una ventana de contexto de 262 000 tokens, un encoder de visión de 27 capas y una cabeza especulativa MTP (multi-token prediction) en la capa 40.

Es relevante ahora porque representa un patrón interesante de especialización lingüística de bajo coste: añadir expertos específicos y calibrar el router de forma contrastiva en lugar de reentrenar todo el modelo. Sin embargo, es importante señalar que, en el momento de redactar esta ficha, los pesos no están publicados: el repositorio es una ranura de pre-lanzamiento y la propia model card indica que la subida de pesos se completará en menos de un mes tras la certificación del dataset y la evaluación en galés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), etiquetado `qwen3_5_moe`; 40 capas MoE; encoder de visión de 27 capas; cabeza especulativa MTP en capa 40 |
| Parametros totales | 35B (aproximado, según nomenclatura del modelo) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) con mmproj-f16 y mtp |
| Idiomas soportados | Inglés (en), galés (cy), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (previsto), AWQ, NVFP4, GGUF; pesos no publicados aún (pre-release) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas de mezcla de expertos. La innovación principal es la estrategia "254 + 2": cada capa MoE pasa de 254 a 256 expertos. Los expertos #0 a #253 (núcleo Sceptic) permanecen completamente congelados, preservando las capacidades de razonamiento científico, código y tool calling del modelo base. Se añaden dos expertos nuevos por capa: el experto #254, orientado a gramática y terminología técnica galesa (mutaciones consonánticas celtas, sintaxis VSO, preposiciones flexionadas, terminología de ingeniería, PLC/CNC, medicina clínica y patentes), y el experto #255, orientado a prosa literaria, no ficción moderna, diálogo natural y traducción bidireccional EN <-> CY.

El entrenamiento incluye una calibración contrastiva del router para limitar la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %. La model card afirma que no se produce olvido catastrófico (0,00 %) en los expertos congelados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo incorpora una plantilla de chat multi-modo con etiquetas de control: `/cy` para respuestas nativas en galés, `/translate` para traducción de página completa sin charla adicional, y controles de profundidad de razonamiento (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:low}`, `{REASON:none}`).

## Capacidades

- Generación de texto y razonamiento de nivel científico (GPQA Diamond reportado en el modelo base: 69,70 %).
- Generación de código y síntesis algorítmica (LiveCodeBench v6 Pass@1 reportado en el modelo base: 37,71 %).
- Tool calling / function calling nativo con generación de AST `<tool_call>` (BFCL V4 Single-Turn AST reportado en el modelo base: 83,61 %).
- Capacidades multimodales de visión mediante encoder de 27 capas (333 tensores).
- Traducción bidireccional inglés <-> galés en modo dedicado `/translate`, con preservación de párrafos.
- Generación nativa en galés con control mediante etiqueta `/cy`.
- Control de profundidad de razonamiento mediante etiquetas `{REASON:...}`.
- Decodificación especulativa mediante cabeza MTP en la capa 40.
- Soporte de finés (fi) heredado del ecosistema del modelo base, aunque no se detalla su alcance en esta edición.
- Cumplimiento estricto de instrucciones y formato (IFEval Strict reportado en el modelo base: 70,24 % prompt / 77,70 % instrucción).

## Casos de uso

- Traducción profesional EN <-> CY de documentación técnica y jurídica: el modo `/translate` está diseñado para traducir páginas completas preservando párrafos, lo que lo hace adecuado para localización de manuales, patentes y documentación de ingeniería donde la terminología especializada es crítica.
- Localización de software y UI al galés: la etiqueta `/cy` fuerza respuestas nativas y el experto #254 cubre terminología técnica, lo que permite generar cadenas de interfaz y textos de ayuda con sintaxis VSO correcta y mutaciones consonánticas adecuadas.
- Atención al cliente bilingüe en galés e inglés: el modelo puede gestionar conversaciones multi-turno con 262K tokens de contexto, manteniendo el cambio de idioma controlado por etiqueta y preservando el tool calling para integraciones con CRM.
- Generación y revisión de contenido literario en galés: el experto #255 está orientado a prosa literaria, diálogo natural y no ficción, útil para editoriales que necesitan borradores o revisión estilística en Cymraeg.
- Asistencia técnica con visión en entornos industriales: gracias al encoder de visión y a la terminología PLC/CNC del experto #254, puede emplearse para interpretar capturas de pantalla de HMI, esquemas o documentación técnica y responder en galés o inglés.
- Agentes automatizados con tool calling en contextos bilingües: el BFCL V4 AST del núcleo (83,61 %) permite construir agentes que consulten APIs y respondan en galés, útil para administraciones públicas y servicios públicos de Gales.
- Evaluación académica de técnicas de expansión MoE: la estrategia "254 + 2" con router contrastivo es un caso de estudio reproducible para investigadores que trabajan en especialización lingüística sin olvido catastrófico.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al modelo base Kataguru-Sceptic-35B-A3B (medidos en 2x RTX 5090 con TP=2), que la model card afirma heredar intactos. No se han publicado resultados de benchmarks propios de la edición Welsh v3.2; la evaluación en galés (COPA-cy, WNLI-cy, MGSM-cy y traducción literaria/técnica) está pendiente.

| Benchmark | Kataguru Sceptic 35B-A3B (base) | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Batería completa con CUDAGraphs |
| GPQA Diamond | 69,70 % (138/198) | STEM nivel doctorado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST: 79,13 %) | Tool calling |
| LiveCodeBench v6 Pass@1 | 37,71 % (66/175) | Programación competitiva |
| IFEval Strict (prompt / instrucción) | 70,24 % / 77,70 % | Formato y restricciones |
| Suite de evaluación en galés | Pendiente | COPA-cy, WNLI-cy, MGSM-cy |

## Requisitos de hardware

- GGUF APEX-Medium: según la model card, funciona en una única GPU de 16 GB o en Mac con 16 GB de memoria unificada.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): diseñado para Blackwell RTX 5090 nativa; requiere 1x GPU de 24-32 GB o 2x RTX 5090 con TP=2.
- AWQ W4A16: cuantización universal para vLLM, orientada a 1x GPU de 24-32 GB.
- Los benchmarks del modelo base se midieron en 2x RTX 5090 con tensor parallelism 2 y CUDAGraphs habilitados.
- Opciones de despliegue previstas: vLLM (AWQ, NVFP4), llama.cpp / LM Studio / Ollama (GGUF), con soporte de mmproj-f16 para visión y cabeza MTP para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables directos en la información proporcionada. El modelo base de la familia (Kataguru-Sceptic-35B-A3B-v2.6-GGUF) es la referencia más cercana, con arquitectura MoE de 35B totales y 3B activos, 254 expertos enrutados por capa, capacidades multimodales y licencia Apache 2.0. No se han encontrado en la búsqueda modelos de especialización en galés con arquitectura y escala equivalentes para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2 | 35B totales / ~3B activos | 262K | Apache 2.0 | Pre-release (pesos no publicados) |
| Kataguru-Sceptic-35B-A3B-v2.6-GGUF | 35B totales / 3B activos | No disponible | Apache 2.0 | Publicado (GGUF) |
| Alternativas especializadas en galés | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pre-lanzamiento: los pesos no están subidos al repositorio; la model card indica una ETA de menos de un mes. No es desplegable en producción en el momento de esta ficha.
- La evaluación específica en galés está pendiente, por lo que el rendimiento real en Cymraeg no está verificado de forma independiente.
- Los benchmarks citados corresponden al modelo base y no a la edición Welsh; la transferencia intacta la afirma el autor, no una evaluación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y de los datasets de entrenamiento antes de un despliegue comercial.
- El soporte de finés se menciona en los metadatos pero no se detalla su alcance en esta edición; no asumir calidad equivalente a la del inglés o el galés.
- La fuga de enrutamiento fuera del idioma objetivo se declara inferior al 0,50 %, pero es una cifra del autor no verificada de forma independiente.
- El contexto de 262K tokens puede degradar la calidad en los extremos de la ventana; no se aportan datos de rendimiento por longitud.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Repositorio GGUF de la familia: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Árbol de archivos GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
