# kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Latvian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a lengua, razonamiento, visión y traducción, especializado en letón (Latviešu valoda). Lo desarrolla el usuario kataguru y se construye sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1, un fundamento multipropósito con 254 expertos y 3B de parámetros activos por token. La propuesta central es una expansión MoE de "254 + 2": se congelan los 254 expertos originales y se añaden dos expertos especialistas en letón (#254 y #255) en cada una de las 40 capas MoE.

El objetivo declarado es adaptar el modelo al letón sin provocar olvido catastrófico de las capacidades de razonamiento científico, código y uso de herramientas del modelo base. Para ello se emplea calibración contrastiva del router que limita la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %. El modelo conserva la ventana de contexto de 262K tokens, el codificador de visión de 27 capas y la cabeza de decodificación especulativa MTP de la capa 40.

Es relevante ahora porque representa un patrón de especialización lingüística por expansión de expertos en lugar de preentrenamiento continuo completo, y porque apunta a un despliegue multimodal con cuantizaciones NVFP4, AWQ y GGUF. No obstante, en el momento de redactar esta ficha el repositorio es una ranura de prepublicación: los pesos aún no están subidos y la evaluación nativa en letón está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen3_5_moe`; 40 capas MoE; codificador de visión de 27 capas |
| Parametros totales | 35B (denominación del modelo); recuento exacto no disponible |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) + mmproj-f16 + mtp |
| Idiomas soportados | Inglés (en), letón (lv), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4, AWQ, GGUF (pesos aún no publicados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas de mezcla de expertos. El modelo base v3.1 dispone de 254 expertos por capa y 3B de parámetros activos por token. La variante letona expande cada capa de 254 a 256 expertos: los expertos #0 a #253 permanecen 100 % congelados y se incorporan dos nuevos expertos especialistas. El experto #254 cubre gramática y terminología técnica letona (siete casos gramaticales, seis clases de declinación nominal, alternancias de palatalización báltica, modos verbales debitive y relativo, además de terminología de ingeniería, PLC/CNC, medicina clínica y patentes). El experto #255 cubre prosa literaria, no ficción moderna, diálogo natural y traducción bidireccional EN <-> LV.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacada es la congelación total de los expertos del núcleo combinada con calibración contrastiva del router para contener la fuga de enrutamiento fuera del idioma objetivo por debajo del 0,50 %. El modelo conserva además una cabeza de decodificación especulativa MTP (Multi-Token Prediction) en la capa 40, con 785 tensores, y un codificador de visión de 333 tensores.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con modos de profundidad configurables mediante etiquetas: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}` y `{REASON:none}`.
- Razonamiento científico de nivel posgrado (física, química, biología molecular) heredado del núcleo congelado.
- Generación de código y programación competitiva, con soporte de síntesis algorítmica.
- Tool calling / function calling nativo con generación de AST en `<tool_call>` y detección de irrelevancia.
- Capacidades multimodales de visión mediante el codificador de 27 capas.
- Traducción bidireccional inglés <-> letón en modo dedicado `/translate`, con preservación de párrafos y ausencia de conversación adicional.
- Respuestas nativas en letón mediante la etiqueta `/lv` o el parámetro `chat_template_kwargs={"response_language": "lv"}`.
- Soporte multilingüe en inglés, letón y finés.
- Decodificación especulativa mediante cabeza MTP para acelerar la inferencia.

## Casos de uso

- Traducción técnica EN <-> LV: el modo `/translate` permite traducir documentación de ingeniería, patentes y manuales preservando la estructura de párrafos, apoyándose en el experto #254 para terminología PLC/CNC y clínica.
- Localización literaria: el experto #255 está diseñado para prosa literaria de página completa, no ficción moderna y diálogo natural, lo que lo hace adecuado para editoriales que adaptan obras al letón.
- Atención al cliente en letón: el modelo puede mantener conversaciones multi-turno con 262K tokens de contexto y responder de forma nativa mediante la etiqueta `/lv`, sin necesidad de traducción intermedia.
- Asistentes con uso de herramientas: con un 83,61 % en BFCL V4 AST, puede integrarse en agentes que generan llamadas a funciones estructuradas y detectan peticiones irrelevantes.
- Análisis de documentos con imágenes: el codificador de visión permite procesar capturas, diagramas o páginas escaneadas junto a texto en letón o inglés.
- Razonamiento científico asistido: para revisión de literatura o resolución de problemas de nivel graduado en física, química o biología, con los modos `{REASON:spoon}` y `{REASON:einstein}` para auditar el razonamiento.
- Generación de código en pipelines: con soporte de tool calling y un 37,71 % en LiveCodeBench v6, puede emplearse en tareas de síntesis algorítmica y asistencia dentro de CI/CD, aunque con las cautelas propias de ese nivel de rendimiento.

## Benchmarks y rendimiento

Los datos publicados corresponden al núcleo Kataguru-Sceptic-35B-A3B, medidos en 2x RTX 5090 con TP=2 y CUDAGraphs habilitado. La evaluación específica en letón está pendiente.

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Batería de producción completa |
| GPQA Diamond | 69,70 % (138/198) | STEM de nivel posgrado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST: 79,13 %) | Tool calling |
| LiveCodeBench v6 (Pass@1) | 37,71 % (66/175) | Programación competitiva |
| IFEval Strict (prompt / instrucción) | 70,24 % / 77,70 % | Formato determinista y restricciones |
| Suite de evaluación en letón | Pendiente | MMLU-LV, ARC-LV, Commonsense-LV y traducción literaria/técnica |

## Requisitos de hardware

- GGUF APEX-Medium: funciona en una única GPU de 16 GB o en un Mac según la model card.
- NVFP4-W4ATTN-AWQ Hybrid: 20,3 GB, pensado para Blackwell RTX 5090 nativo.
- AWQ W4A16: para vLLM universal; requiere 1x GPU de 24-32 GB o 2x RTX 5090 con TP=2.
- Los benchmarks del núcleo se midieron en 2x RTX 5090 con tensor parallelism 2.
- Opciones de despliegue: vLLM (AWQ W4A16), llama.cpp (GGUF), y los formatos NVFP4 para hardware Blackwell. No se detallan opciones para Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2 | 35B totales, 3B activos (MoE) | 262K | Apache 2.0 | Prepublicación, pesos no subidos |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B totales, 3B activos (MoE) | 262K | Apache 2.0 | Disponible |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 | 35B totales, 3B activos (MoE) | 262K | Apache 2.0 | Prepublicación, misma arquitectura 254+2 |
| Kataguru-Sceptic-35B-A3B-v2.6-GGUF | 35B totales, 3B activos (MoE) | No disponible | Apache 2.0 | Disponible en GGUF |

No se dispone de datos de benchmarks comparativos frente a modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados: el repositorio es una ranura de prepublicación con ETA inferior a un mes; no es utilizable en producción todavía.
- La evaluación nativa en letón (MMLU-LV, ARC-LV, Commonsense-LV y traducción) está pendiente, por lo que el rendimiento real en el idioma objetivo no está verificado.
- El rendimiento en código es limitado (37,71 % en LiveCodeBench v6), insuficiente para tareas de programación competitiva exigente sin supervisión.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- La fuga de enrutamiento fuera del idioma objetivo se declara contenida por debajo del 0,50 %, pero es una cifra del autor no verificada de forma independiente.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos una vez publicados.
- El soporte de finés aparece en los metadatos, pero no se detalla su alcance ni calidad.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante georgiana con la misma arquitectura 254+2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Versión GGUF del núcleo v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
