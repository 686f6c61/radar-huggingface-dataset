# mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF es una cuantización en formato GGUF del modelo ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final, publicada por mradermacher. El modelo base es un fine-tune orientado a contenido para adultos, roleplay, terror y violencia explícita, marcado explícitamente como "unaligned" y "not-for-all-audiences". El nombre "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos sobre un total de 25.233.142.046 parámetros (unos 25,2 mil millones), aunque esta interpretación no está confirmada en la información disponible.

El modelo resuelve un nicho muy concreto: generación de narrativa conversacional sin restricciones de alineación para casos de uso de ficción adulta y juegos de rol textuales. No está pensado para tareas generales de asistente, código o razonamiento matemático, y su licencia y condiciones de uso no están documentadas en la información disponible.

Esta ficha describe la versión cuantizada de mradermacher, que ofrece un conjunto amplio de cuantizaciones con matriz de importancia (imatrix) para ejecución local con llama.cpp y derivados. El repositorio ocupa 301 GB en total por acumulación de todas las variantes, pero cada archivo individual va desde 8,4 GB (IQ1_S) hasta 22,7 GB (Q6_K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (deducida del sufijo A4B del nombre; no confirmada en la informacion disponible) |
| Parametros totales | 25.233.142.046 (unos 25,2 mil millones) |
| Parametros activos | no disponible (el nombre A4B sugiere unos 4.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de las etiquetas y del nombre. El sufijo "A4B" en la nomenclatura de modelos MoE suele indicar alrededor de 4.000 millones de parámetros activos por token, lo que encajaría con un transformer de mezcla de expertos de 25,2 mil millones de parámetros totales, pero esto es una inferencia a partir del nombre y no un dato confirmado.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Las etiquetas "unaligned" y "explicit" apuntan a un fine-tune deliberadamente sin las capas habituales de rechazo y moderación, orientado a roleplay y narrativa adulta. La cuantización de mradermacher emplea matrices de importancia (imatrix) generadas sobre el modelo base, lo que mejora la fidelidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay e interpretación de personajes.
- Narrativa de ficción adulta y contenido erótico explícito (ERP), sin filtros de alineación aparentes.
- Temática de terror y violencia explícita, según las etiquetas del modelo.
- Instrucción y formato conversacional (tags "instruct" y "conversational").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está entrenado para mantener personajes y tono a lo largo de diálogos multi-turno, lo que lo hace adecuado para plataformas de chat de personajes con memoria de conversación.
- Ficción adulta interactiva: generación de narrativa erótica explícita en entornos controlados y con verificación de edad, aprovechando el fine-tune sin alineación.
- Guiones de terror y escenas violentas: útil para escritores que necesitan descripciones crudas sin las mitigaciones habituales de los modelos alineados.
- Motores de juegos de rol textuales (MUD, novelas visuales): integración local vía llama.cpp u Ollama para evitar depender de APIs externas con moderación de contenido.
- Prototipado de personajes para videojuegos narrativos: iteración rápida de diálogos de personajes con cuantizaciones Q4_K_M que caben en GPU de consumo.
- Investigación sobre alineación y seguridad: servir como contrapunto "unaligned" en estudios comparativos sobre comportamiento de modelos sin RLHF, siempre en entornos aislados.
- Despliegue en hardware modesto: las cuantizaciones IQ2 e IQ3 (9-13 GB) permiten ejecutar el modelo en GPUs de 12-16 GB para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S unos 8,4 GB; IQ2_M unos 10,5 GB; IQ3_M unos 12,5 GB; Q4_K_M unos 16,9 GB; Q5_K_M unos 19,2 GB; Q6_K unos 22,7 GB (tamaños de archivo, la VRAM real requiere margen adicional para contexto y caché KV).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; RTX 4080 o 4070 Ti Super (16 GB) para Q4_K_S e IQ4_XS; GPUs de 12 GB (RTX 3060 12 GB, 4070) para IQ3_M e IQ3_S; A100 y H100 para servir varias instancias o contextos largos.
- Cabe en GPU de consumo: sí, desde cuantizaciones IQ2 en GPUs de 10-12 GB y Q4_K_M en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp; vLLM y TGI solo con los pesos originales en safetensors, no con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF | 25,2 mil millones (activos no confirmados) | no disponible | no disponible | GGUF | Fine-tune adulto/unaligned, solo inglés |
| Modelos base tipo MoE de 25B con 4B activos (familia no especificada) | variable | variable | variable | safetensors/GGUF | No se dispone de un comparable directo identificado en la informacion |
| Alternativas de roleplay sin alineación del ecosistema GGUF | variable | variable | variable | GGUF | No se dispone de datos comparativos en la informacion |

No se dispone de datos de benchmarks ni de una comparativa cuantitativa fiable con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como NSFW, adult-content y not-for-all-audiences; no debe desplegarse en entornos accesibles a menores ni sin verificación de edad.
- Sin alineación: la etiqueta "unaligned" implica ausencia de capas de rechazo, lo que aumenta el riesgo de generar contenido dañino, violento o sexualmente explícito sin salvaguardas.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación; al ser un fine-tune creativo, la fidelidad factual no es un objetivo declarado.
- Idioma: solo inglés según el campo de idiomas; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.
- Licencia: no disponible; antes de cualquier uso comercial es imprescindible verificar los términos del modelo base ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final.
- Producción: al ser una cuantización de un fine-tune de nicho, no hay garantías de estabilidad, evaluación de calidad ni soporte; úsese con moderación de contenido propia en la capa de aplicación.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-GGUF
- Página de resumen de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
