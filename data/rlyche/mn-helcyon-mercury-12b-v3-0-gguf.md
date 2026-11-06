# rlyche/MN-Helcyon-Mercury-12b-v3.0-GGUF

## Resumen

Helcyon-Mercury-12B-v3.0 es un ajuste fino completo (full fine-tune) del modelo Mistral-Nemo-Instruct-2407 de 12.247 millones de parametros, orientado a conversacion de largo formato, roleplay inmersivo y escritura creativa con lo que su autor denomina "presencia conversacional". Lo publica el usuario rlyche bajo la marca HardWire y se distribuye exclusivamente en formato GGUF cuantizado, con variantes Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0. El modelo hereda la arquitectura transformer de Mistral Nemo y su licencia Apache 2.0.

El modelo no pretende competir en tareas de razonamiento formal o codigo, sino en mantener coherencia de identidad y tono a lo largo de dialogos extensos, con soporte declarado de 16k a 32k tokens de contexto. La model card enfatiza capacidades como cambio de perspectiva (primera a tercera persona), conversion de tiempos verbales, reescritura, resumen y redaccion administrativa, ademas de roleplay con continuidad de escena.

Es relevante para desarrolladores que buscan un modelo local de tamano medio (12B) con licencia permisiva para construir asistentes conversacionales, herramientas de escritura o motores de personajes sin depender de APIs propietarias. Su ecosistema incluye una interfaz propia, Helcyon-WebUI (HWUI), disponible en version gratuita y de pago, con sistema de memoria y carpetas de proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral Nemo) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16k–32k tokens segun model card (contexto nativo de Mistral Nemo: 128k, no confirmado para este ajuste) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 45,4 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B con atencion por ventanas deslizantes y RoPE, entrenado originalmente por Mistral AI y NVIDIA. Segun la model card, Helcyon-Mercury-v3.0 es un entrenamiento completo de pesos ("full weight trained"), sin uso de LoRA ni tecnicas de stitching, lo que sugiere un ajuste fino supervisado sobre el checkpoint base. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La model card menciona mejoras en el "motor de dialogo" (inteligencia emocional, control de tono, ritmo), continuidad en roleplay y capacidades practicas como cambio de perspectiva y conversion de tiempos verbales. No se documentan innovaciones arquitectonicas propias ni tecnicas de decodificacion especulativa. Tampoco se detalla la estrategia de extension de contexto: la referencia a 16k–32k podria corresponder al contexto nativo del modelo base o a una configuracion practica recomendada, pero no se aclara.

## Capacidades

- Generacion de texto conversacional multi-turno con enfasis en coherencia de identidad y tono.
- Roleplay inmersivo con continuidad de escena y personajes.
- Escritura creativa: narrativa, cartas, relatos y soporte narrativo.
- Tareas de reescritura, resumen y reformulacion natural.
- Cambio de perspectiva (primera a tercera persona) y conversion de tiempos verbales.
- Redaccion administrativa y profesional (correos, cartas formales).
- Seguimiento de contexto en conversaciones largas (16k–32k tokens declarados).
- Capacidad declarada de "espejo emocional" (adaptacion al tono del usuario).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales locales: el modelo mantiene identidad y tono estables en dialogos multi-turno, adecuado para desplegar un asistente personal en hardware de consumo con llama.cpp u Ollama.
- Motores de personajes para videojuegos narrativos o aventuras de texto: su continuidad de escena y memoria de hilo permiten construir NPCs con personalidad consistente a lo largo de sesiones largas.
- Herramientas de escritura creativa: generacion de relatos, cartas y borradores narrativos donde la voz y el ritmo importan mas que la precision factual.
- Reescritura y resumen de documentos: conversion de textos entre estilos, personas gramaticales y tiempos verbales, util en flujos editoriales.
- Redaccion administrativa asistida: borradores de correos, cartas formales y comunicaciones profesionales en ingles.
- Companero conversacional en aplicaciones de bienestar o diario personal: el modelo esta disenado para reflejar el tono del usuario y sostener conversaciones emotivas, aunque sin garantias clinicas.
- Integracion en interfaces tipo chat con memoria: combinado con HWUI, permite inyectar documentos por palabras clave y mantener recall de conversaciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5–6 GB en Q3_K_M, 7–8 GB en Q4_K_M, 8–9 GB en Q5_K_M, 10–11 GB en Q6_K y 13–14 GB en Q8_0 (estimaciones segun el numero de parametros; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: si, en Q4_K_M o inferiores con 8 GB o mas de VRAM; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Helcyon-Mercury-12B-v3.0 | 12,2B | 16k–32k declarado | Apache 2.0 | GGUF | Ajuste conversacional/roleplay |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128k | Apache 2.0 | safetensors, GGUF | Modelo base, uso general |
| Mistral 7B Instruct | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Menor, mas ligero |
| Qwen2.5-14B-Instruct | 14,7B | 128k | Apache 2.0 | safetensors, GGUF | Mas grande, uso general y codigo |

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a modelos de 12B, especialmente en tareas factuales o administrativas.
- La model card promete "Zero Filter — No hedging, no compliance tone", lo que implica ausencia de capas de seguridad conversacional y mayor riesgo de contenido inapropiado en produccion.
- No se documentan datos de entrenamiento, por lo que no pueden evaluarse sesgos de dataset ni contaminacion.
- El contexto declarado de 16k–32k es inferior al nativo de Mistral Nemo (128k); no se aclara si es una limitacion real del ajuste o una recomendacion practica.
- El autor promociona una interfaz de pago (HWUI Pro, 20 GBP); la version gratuita esta en GitHub, pero conviene revisar la licencia del codigo de la interfaz por separado.
- Uso comercial permitido por Apache 2.0, pero sin garantias del autor sobre calidad o seguridad.
- El modelo tiene muy poca traccion (143 descargas, 0 likes) y no hay evaluaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/rlyche/MN-Helcyon-Mercury-12b-v3.0-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- HWUI (GitHub): https://github.com/XeyonAI/Helcyon-WebUI
- HWUI Pro (Gumroad): https://xeyonai.gumroad.com/l/mzcllf
