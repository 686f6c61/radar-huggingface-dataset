# npario/Dirk-Qwen3.8-27B-GGUF

## Resumen

Dirk es una cuantización GGUF del modelo Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con capacidades multimodales (visión y lenguaje) desarrollado por el equipo Qwen de Alibaba. La versión cuantizada, publicada por el usuario npario (y originalmente por peculiar-ragdoll), aplica la plantilla de chat "Sharp", que reduce la verbosidad de las respuestas y desactiva el razonamiento de esfuerzo máximo por defecto, haciendo que el modelo responda de forma más concisa y eficiente sin cambiar los pesos.

El modelo base Qwen3.8-27B es una arquitectura transformer densa con visión integrada, entrenada para tareas de codificación, flujos agénticos y automatización ofimática. Dirk conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que permite usar decodificación especulativa en runtimes compatibles como llama.cpp para acelerar la generación. Las cuantizaciones utilizan el esquema Dynamic 3.0 de Unsloth, con tamaños que van desde 9,8 GB hasta 31,5 GB, cubriendo desde GPUs de 12 GB hasta 32 GB.

La relevancia de Dirk radica en que ofrece una experiencia lista para producción: sin necesidad de ajustar la plantilla de chat, con control fino del esfuerzo de razonamiento mediante `chat_template_kwargs` y con soporte de visión mediante un archivo `mmproj-F16.gguf` compartido entre todas las cuantizaciones. Está pensado para desarrolladores que quieren desplegar un modelo multimodal de 27B en hardware local con buena relación calidad/velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) con cabeza MTP (nextn) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K_XL, IQ3_XXS, Q3_K_XL, IQ4_XS, Q4_K_S, Q4_K_XL, Q5_K_XL, Q6_K, Q6_K_XL, Q8_K_XL (todas Dynamic 3.0 UD) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj-F16.gguf para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con capacidades nativas de vision y lenguaje (pipeline image-text-to-text). No es una arquitectura MoE, por lo que todos los parametros se activan en cada inferencia. El modelo fue entrenado por Alibaba con un enfoque en codificacion, flujos agénticos y automatizacion de oficina, segun el repositorio oficial de GitHub.

Dirk no es un modelo reentrenado, sino una cuantizacion del checkpoint original. Las cuantizaciones utilizan el esquema Dynamic 3.0 de Unsloth, que conserva la cabeza de prediccion multi-token (MTP, tambien llamada `nextn`). Esta cabeza permite que runtimes con decodificacion especulativa (como llama.cpp) generen varios tokens a la vez, reduciendo la latencia. La plantilla "Sharp" es una modificacion del template oficial de Qwen 3.8 que anade un prompt de sistema conciso y elimina el razonamiento de esfuerzo maximo (`xhigh`) que el modelo base fuerza por defecto. Los pesos y los tensores MTP no se modifican; solo se cambia la plantilla, que se incrusta en los metadatos del GGUF.

## Capacidades

- Generacion de texto y razonamiento con control de esfuerzo (`low`, `medium`, `xhigh`) via `chat_template_kwargs`.
- Comprension de imagenes (vision) gracias al pipeline image-text-to-text y al archivo `mmproj-F16.gguf`.
- Soporte de decodificacion especulativa mediante la cabeza MTP, acelerando la generacion en runtimes compatibles.
- Capacidades de codificacion y flujos agénticos, segun la descripcion del modelo base.
- Soporte de tool calling y function calling, heredado del modelo Qwen3.8-27B (no confirmado explicitamente en la card, pero esperado en la familia Qwen).
- Multilingue limitado a ingles y chino (segun los metadatos de idioma).
- Desactivacion opcional del razonamiento (`enable_thinking: false`) para respuestas mas rapidas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un tono conciso gracias a la plantilla Sharp, reduciendo el numero de tokens generados y la latencia percibida. Adecuado para entornos donde el coste por token es relevante.
- Generacion de codigo en produccion: con soporte de tool calling y razonamiento ajustable, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de codigo, especialmente en entornos con GPUs de 24 GB.
- Analisis de documentos con imagenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer informacion estructurada, util en automatizacion ofimatica.
- Agentes autonomos de navegacion web: el modelo base esta optimizado para flujos agénticos; con la plantilla Sharp, los agentes pueden ejecutar acciones multi-paso con respuestas mas directas y menos tokens de razonamiento.
- Asistente de programacion local: desplegado con llama.cpp u Ollama, ofrece respuestas rapidas en hardware de consumo (16-24 GB de VRAM) para tareas de refactorizacion, depuracion o explicacion de codigo.
- Traduccion y resumen de textos en ingles y chino: su naturaleza bilingue permite tareas de traduccion y resumen en estos dos idiomas, con control de esfuerzo para equilibrar calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye imagenes con resultados de SWE-bench-Live y MMLU-Pro, pero los valores numericos no estan transcritos en texto, por lo que no se pueden citar de forma fiable. Se menciona que la plantilla Sharp, medida en el modelo Dagger (misma base, solo cambio de template), mejora la precision en Claw-Eval de 59,3 a 66,7 y reduce los tokens de respuesta en un 59%, pero estos datos corresponden al template, no a Dirk especificamente.

## Requisitos de hardware

- VRAM estimada segun cuantizacion:
  - Q2_K_XL (9,8 GB): cabe en GPUs de 12 GB con contexto limitado.
  - IQ3_XXS (10,9 GB): cabe en 16 GB con margen, o en 12 GB con contexto corto.
  - Q3_K_XL (13,1 GB): cabe en 16 GB.
  - IQ4_XS (14,3 GB): recomendado para 16 GB.
  - Q4_K_S (15,4 GB): ajustado en 16 GB, deja poco espacio para contexto.
  - Q4_K_XL (17,6 GB): recomendado para 24 GB.
  - Q5_K_XL (20,9 GB): recomendado para 24 GB.
  - Q6_K (22,0 GB): el mayor que cabe en 24 GB con margen ajustado.
  - Q6_K_XL (25,3 GB): requiere ~32 GB.
  - Q8_K_XL (31,5 GB): requiere ~32 GB o mas.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para las cuantizaciones Q4_K_XL y Q5_K_XL; RTX 4080 (16 GB) para IQ4_XS; A100/H100 (40/80 GB) para las cuantizaciones mas altas.
- Despliegue compatible con llama.cpp, Ollama y otros runtimes que soporten GGUF con MTP.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque la decodificacion especulativa con MTP deberia reducir el tiempo por token en comparacion con una generacion autoregresiva estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Dirk-Qwen3.8-27B-GGUF | 27B | No disponible | Si (vision) | Apache 2.0 | GGUF (UD) |
| Qwen3.8-27B (original) | 27B | No disponible | Si (vision) | Apache 2.0 | Safetensors |
| Qwen3.8-27B-Ridge-GGUF | 27B | No disponible | Si (vision) | Apache 2.0 | GGUF |
| Dagger-Qwen3.6-27B-GGUF-MTP | 27B | No disponible | No confirmado | Apache 2.0 | GGUF |

Dirk se diferencia de otros GGUFs del mismo modelo base por la plantilla Sharp y la conservacion de la cabeza MTP. Comparado con el checkpoint original, Dirk ofrece cuantizaciones listas para usar sin perdida de la funcionalidad de vision y con un template que reduce la verbosidad. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo base esta entrenado principalmente en ingles y chino; el rendimiento en otros idiomas puede ser significativamente inferior.
- Las cuantizaciones de 2 y 3 bits (Q2_K_XL, IQ3_XXS, Q3_K_XL) sacrifican precision; la card recomienda preferir IQ4_XS o superior siempre que la VRAM lo permita.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la plantilla Sharp no lo mitiga.
- La decodificacion especulativa con MTP requiere un runtime que la soporte (como llama.cpp con las opciones adecuadas); en runtimes sin soporte, la cabeza MTP se ignora sin beneficio de velocidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en la card; se recomienda verificar la licencia del checkpoint original.
- No se proporcionan datos de sesgos o evaluaciones de seguridad especificos para esta cuantizacion.
- La longitud de contexto no esta especificada en la informacion disponible; se debe asumir la del modelo base, que no se ha confirmado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/npario/Dirk-Qwen3.8-27B-GGUF
- Repositorio original del autor: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Plantilla Sharp en HuggingFace: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Documentacion de Dynamic 3.0 de Unsloth: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Modelo similar Ridge: https://huggingface.co/npario/Qwen3.8-27B-Ridge-GGUF
