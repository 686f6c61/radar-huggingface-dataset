# Andrey68754/Gemmasutra-Mini-2B-v1

## Resumen

Gemmasutra Mini 2B v1 es un ajuste fino (fine-tune) de la familia Gemma 2 orientado a roleplay (RP) y conversación narrativa, publicado originalmente por el usuario TheDrummer y replicado en este repositorio por Andrey68754. El modelo parte de la arquitectura `gemma2` y cuenta con 2.614.341.888 parámetros totales (2,61 B), con un repositorio de 5,3 GB en formato safetensors. Su propuesta es ofrecer una experiencia de rol "satisfactoria" en hardware de gama baja: portátiles modestos, navegador, móviles mediante la app Layla o incluso una Raspberry Pi.

El modelo se distribuye explícitamente como "uncensored and unaligned" (sin censura y sin alinear), es decir, sin las capas de rechazo o moderación que normalmente se añaden en un proceso de alineamiento. Está pensado para usar con la plantilla de instrucción de Gemma modificada para admitir el rol `system`, y el autor advierte de que no debe emplearse para matemáticas. Es relevante ahora porque los fine-tunes de rol por debajo de 7B se han vuelto viables en inferencia local cuantizada, y este modelo se posiciona en ese nicho concreto.

La ficha se basa únicamente en la model card del autor y en los metadatos del repositorio. No hay información sobre dataset de entrenamiento, número de tokens, idiomas soportados ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 2 (tag `gemma2` en el repositorio) |
| Parametros totales | 2.614.341.888 (2,61 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No declarada en la model card. Heredada del modelo base Gemma 2 2B (8.192 tokens); la model card incluye ejemplos etiquetados como "4K context" |
| Tipos de cuantizacion | Pesos originales en safetensors (repo de 5,3 GB, coherente con BF16/FP16); GGUF de comunidad, incluidos iMatrix GGUF y Q4_0_X_X para ARM |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `other`: la model card no detalla el texto. Al derivar de Gemma 2 serían de aplicación los términos de licencia de Gemma, no verificados en la información disponible |
| Formato de pesos | safetensors (repositorio principal); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 2, un transformer decoder-only. El repositorio únicamente aporta el tag `gemma2` y el recuento real de parámetros procedente de los safetensors (2,61 B), coherente con el modelo Gemma 2 2B. No se detallan en la información disponible aspectos como el esquema de atención, la función de activación, el vocabulario, el tamaño de las capas ni la configuración exacta de la ventana de contexto.

Respecto al entrenamiento, la model card se limita a indicar "Finetuned by yours truly" ("ajustado por mí") y a describir el resultado como "uncensored and unaligned". No se especifica el número de tokens de ajuste, la composición del dataset, si se empleó SFT, RLHF, DPO u otra técnica, ni qué modelo Gemma 2 2B concreto sirvió de base (preentrenado o instruct). Tampoco hay información sobre la estrategia de entrenamiento (LoRA, full fine-tune) ni sobre hiperparámetros.

## Capacidades

- Generación de texto conversacional y narrativo, con especial énfasis en roleplay multi-turno y mantenimiento de personaje.
- Soporte de escenarios con múltiples personajes ("Group Character" en los ejemplos de la model card).
- Gestión de contexto conversacional de cierta longitud: la model card incluye ejemplos etiquetados como "4K context".
- Compatibilidad con la plantilla de instrucción de Gemma modificada para admitir el rol `system` (`<start_of_turn>system`), lo que permite fijar instrucciones de personaje persistentes.
- Compatibilidad con el modo Chat Completion estándar.
- Ejecución en entornos de inferencia local: KoboldCpp 1.72, Layla (iOS y Android), llama.cpp y derivados GGUF.
- Ausencia deliberada de alineamiento y moderación: el modelo no aplica rechazos ni filtros de contenido.
- Capacidad matemática explícitamente desaconsejada por el autor ("Don't use it for Math").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, modo "thinking" ni capacidades multilingües verificadas.

## Casos de uso

- Roleplay y ficción interactiva en local: el modelo está ajustado específicamente para mantener un personaje coherente a lo largo de una conversación multi-turno, con instrucciones de personaje inyectadas mediante el rol `system`.
- Prototipado de NPC y diálogos para videojuegos: sirve para generar árboles de diálogo ramificados y respuestas reactivas en fases de preproducción, ejecutándose en el propio equipo del diseñador sin coste de API.
- Escritura creativa asistida: generación de borradores de escenas, diálogos y continuaciones narrativas, aprovechando su estilo conversacional frente a modelos instruct más formalizados.
- Asistentes conversacionales offline en dispositivos de gama baja: con cuantización Q4 en torno a 1,5-2 GB, puede correr en un móvil mediante Layla o en una Raspberry Pi, sin conexión ni envío de datos a terceros.
- Pruebas de plantillas de prompt y pipelines de chat: útil para validar la integración de plantillas Gemma con rol `system` en frameworks propios antes de migrar a modelos mayores.
- Generación de contenido para comunidades de rol: escenarios, hojas de personaje, continuaciones y variantes de respuesta a partir de un contexto fijado.
- Red teaming y estudio de seguridad: al ser un modelo declarado "unaligned", sirve como banco de pruebas controlado para investigar comportamientos sin moderación, siempre en un entorno aislado y con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica cuantitativa, y el repositorio no aporta evaluaciones. Las únicas referencias de rendimiento son capturas de pantalla de conversaciones de ejemplo (SFW, NSFW y contexto de 4K), sin mediciones objetivas.

## Requisitos de hardware

- Pesos en BF16/FP16: 5,3 GB de safetensors; con caché KV para 4K-8K de contexto, la VRAM necesaria se sitúa en torno a 6-7 GB.
- Cuantización de 8 bits: aproximadamente 2,8 GB de pesos.
- Cuantización Q5_K_M: en torno a 1,9 GB.
- Cuantización Q4_K_M / Q4_0: en torno a 1,6-1,7 GB, con calidad aceptable según el autor para el uso previsto.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070; también en tarjetas de 8 GB usando Q4 o Q5. No requiere A100 ni H100.
- CPU: la inferencia en CPU es viable con cuantizaciones Q4/Q5; el autor menciona explícitamente portátiles modestos y Raspberry Pi.
- Móvil: existe una build específica para ARM (Q4_0_X_X) pensada para Layla en iOS y Android.
- Despliegue: llama.cpp y KoboldCpp 1.72 (soportados oficialmente), GGUF en LM Studio u Ollama mediante importación, Layla para móvil; los safetensors permiten vLLM o TGI, aunque no hay confirmación del autor sobre estas dos últimas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de su documentación pública y se incluyen como referencia de categoría; no se han ejecutado evaluaciones comparativas.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gemmasutra Mini 2B v1 | 2,61 B | Heredado de Gemma 2 2B (8.192 tokens); ejemplos a 4K | `other` (no detallada) | Roleplay sin alinear | safetensors + GGUF de comunidad |
| Gemma 2 2B Instruct | 2,61 B | 8.192 tokens | Términos de Gemma | Asistente generalista alineado | safetensors, GGUF, amplio soporte de frameworks |
| Qwen2.5 3B Instruct | ~3,1 B | 32.768 tokens | Apache 2.0 | Asistente generalista, código y matemáticas | safetensors, GGUF, muy extendido |
| Llama 3.2 3B Instruct | ~3,2 B | 128.000 tokens | Licencia de Llama 3.2 | Asistente generalista multilingüe | safetensors, GGUF, ecosistema amplio |

Frente a estos modelos, Gemmasutra Mini 2B v1 no compite en contexto, licencia clara ni capacidades generalistas (el propio autor desaconseja matemáticas), sino en estilo narrativo y en ausencia de moderación. Para tareas de razonamiento, código o contexto largo, las alternativas de la tabla son opciones más seguras y mejor documentadas.

## Limitaciones y advertencias

- Modelo declarado "uncensored and unaligned": no incorpora filtros de seguridad ni rechazos, por lo que puede generar contenido NSFW, ofensivo o ilegal. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: con 2,6 B de parámetros y un ajuste orientado a estilo conversacional, la fiabilidad factual es baja. El autor desaconseja explícitamente su uso para matemáticas.
- Sin datos de entrenamiento publicados: se desconoce el dataset, su procedencia y si existe sesgo sistemático derivado de él.
- Idiomas no declarados: no hay confirmación de calidad multilingüe; el uso en castellano no está verificado por el autor.
- Contexto no confirmado: la model card no fija la ventana máxima; los ejemplos a 4K sugieren que el rendimiento se degrada más allá de ese punto.
- Licencia ambigua: el campo `other` no se acompaña del texto de la licencia. Al derivar de Gemma 2, es previsible que apliquen los términos de Gemma, pero esto no está verificado y condiciona el uso comercial.
- Procedencia: este repositorio es una réplica de un tercero (Andrey68754) del original de TheDrummer. Con 0 descargas, 0 likes y una fecha de creación anómala (2026-10-24), conviene descargar los pesos desde el repositorio original y verificar su integridad.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia objetiva de calidad frente a alternativas.
- Sin soporte documentado de tool calling, agentes ni multimodalidad: no debe asumirse ninguna de estas capacidades en producción.
- Los resultados de búsqueda web disponibles no contienen información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Andrey68754/Gemmasutra-Mini-2B-v1
- Repositorio original (TheDrummer): https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1
- GGUF oficial: https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1-GGUF
- GGUF con iMatrix (recomendado por el autor): https://huggingface.co/MarsupialAI/Gemmasutra-Mini-2B-v1_iMatrix_GGUF
- Build para ARM (Q4_0_X_X, móvil): https://huggingface.co/SicariusSicariiStuff/TheDrummer_Gemmasutra-Mini-2B-v1_ARM
- KoboldCpp 1.72: https://github.com/LostRuins/koboldcpp/releases/tag/v1.72
- Layla (iOS / Android): https://www.layla-network.ai/
- Discord del autor: https://discord.gg/Nbv9pQ88Xb
