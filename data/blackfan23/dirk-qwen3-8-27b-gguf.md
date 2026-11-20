# blackfan23/Dirk-Qwen3.8-27B-GGUF

## Resumen

Dirk-Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo denso Qwen3.8-27B, publicado por el usuario blackfan23 en Hugging Face. Se trata de una copia del repositorio original de peculiar-ragdoll cuyo único cambio respecto al cuantizado estándar es la plantilla de chat: incorpora la denominada Sharp chat template, que añade un system prompt de concisión y desactiva el esfuerzo de razonamiento máximo por defecto que el modelo base impone en cada llamada. El autor declara explícitamente que los pesos y los tensores MTP no se han modificado.

El modelo base es un transformer denso de 27 320 697 856 parámetros (27,3 B) con capacidades de visión (pipeline image-text-to-text), cabecera MTP (multi-token prediction) para decodificación especulativa y un contexto nativo que la información disponible no concreta. La cuantización emplea dos estrategias según el nivel de bits: cuantizados Dynamic 3.0 UD de Unsloth para 3 bpw en adelante y cuantizados GSQ-RCO de IST-DASLab por debajo de ese umbral, que según el autor resisten mejor en el rango de 2 a 3 bpw. Todos los niveles conservan la cabecera `nextn` para decodificación especulativa.

La relevancia práctica del modelo reside en su orientación a la eficiencia de tokens y al coding agéntico: según las mediciones que cita el autor, la misma plantilla aplicada sobre el modelo base redujo los tokens de respuesta un 59 % en Claw-Eval y un 22 % en MMLU-Pro por respuesta correcta, con una subida de precisión de 7,4 puntos en el componente de respuesta de Claw-Eval. El repositorio ocupa 240,6 GB e incluye múltiples niveles de cuantización desde 8,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capacidades de visión y cabecera MTP (`nextn`); etiquetado como `qwen3_5`/`qwen3.8` |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: GSQ-RCO IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S; UD Q2_K_XL, Q3_K_XL, IQ4_XS, Q4_K_S (y niveles superiores no listados en el extracto) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3 B parámetros con torre de visión, lo que permite entrada image-text-to-text. Incorpora una cabecera MTP (`nextn`) que habilita decodificación especulativa multi-token en los runtimes que la soportan, y el autor indica que todos los niveles de cuantización la conservan. La nomenclatura de tags (`qwen3_5`, `qwen3.8`) sugiere una generación de la familia Qwen 3.5/3.8, pero la información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO.

La modificación introducida por Dirk no afecta a los pesos: se limita a la plantilla de chat, que se reescribe en los metadatos del GGUF (byte-swapped) mientras los tensores permanecen intactos. La plantilla Sharp parte de la plantilla Qwen corregida por froggeric, añade un system prompt de concisión y elimina el valor por defecto `reasoning_effort=xhigh` del modelo original, dejando el modelo en su esfuerzo nativo `medium`. Los niveles `GSQ-RCO-` llevan la versión `v22.4.1` de la plantilla, que se desactiva cuando el runtime inyecta su propio protocolo de herramientas (corrección para LM Studio); los niveles `UD-` llevan `v22.4.0` y adoptarán la `v22.4.1` en la siguiente pasada.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables mediante `chat_template_kwargs`: `low`, `medium`, `xhigh` (el valor `high` se acepta como alias de `xhigh`); el valor por defecto es `medium`.
- Desactivación completa del razonamiento con `"enable_thinking": false`.
- Comprensión de imágenes (pipeline image-text-to-text), con la torre de visión preservada en la cuantización.
- Decodificación especulativa mediante la cabecera MTP (`nextn`) en runtimes compatibles.
- Orientación a coding agéntico y eficiencia de tokens, con respuestas concisas por defecto y opción de desactivar la concisión con `chat_template_kwargs: {"terse": false}`.
- Soporte de tool calling a través de la plantilla Qwen subyacente; la versión `v22.4.1` de la plantilla cede el control cuando el runtime inyecta su propio protocolo de herramientas.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.

## Casos de uso

- Coding agéntico en local: el modelo está pensado para tareas de resolución de issues y parcheo de código; con la plantilla Sharp y la cabecera MTP puede integrarse en flujos de trabajo con llama.cpp donde la latencia y el consumo de tokens importan, manteniendo la calidad del modelo base.
- Despliegue en GPU de consumo: los niveles de 8,8 GB (IQ2_XS) y 9,6 GB (IQ2_S) están dimensionados para tarjetas de 12 GB con espacio para contexto real, lo que permite ejecutar un modelo de 27 B con visión en hardware de gama alta de consumo.
- Asistentes de razonamiento con coste controlado: el esfuerzo `medium` por defecto y la salida concisa reducen el número de tokens generados por respuesta, útil en aplicaciones donde el coste por token o el tiempo hasta la primera respuesta completa es crítico.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede emplearse para tareas image-text-to-text como extracción de información de capturas, diagramas o documentos escaneados, siempre que el runtime soporte la entrada multimodal en GGUF.
- Evaluación comparativa de plantillas: sirve como banco de pruebas para medir el efecto de la plantilla Sharp frente a la plantilla estándar de Qwen3.8-27B sobre las mismas ponderaciones, útil para equipos que investigan la eficiencia de tokens en prompts de sistema.
- Generación asistida en pipelines de CI/CD: con tool calling y salidas concisas, puede conectarse a herramientas de análisis estático o de ejecución de tests para proponer correcciones dentro de un bucle automatizado.
- Inferencia en entornos con memoria limitada: los niveles GSQ-RCO de 2 bits (IQ2_XS, IQ2_S) están pensados para escenarios donde un cuantizado de 3 o 4 bits no cabe, manteniendo según el autor un seguimiento cercano del modelo base.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones del autor, no resultados oficiales del modelo base. La tabla siguiente recoge las cifras citadas, incluyendo las de la plantilla sobre el modelo base ThinkingCap-27B (mismas ponderaciones, solo cambia la plantilla) y las propias de Dirk.

| Benchmark | Referencia | Resultado |
|---|---|---|
| Claw-Eval, componente de respuesta (ThinkingCap-27B, plantilla estándar) | Base | 59,3 |
| Claw-Eval, componente de respuesta (ThinkingCap-27B, plantilla Sharp) | Sharp | 66,7 (+7,4) |
| Claw-Eval, tokens de respuesta (plantilla estándar) | Base | 5393 |
| Claw-Eval, tokens de respuesta (plantilla Sharp) | Sharp | 2217 (−59 %) |
| MMLU-Pro, tokens por respuesta correcta (plantilla estándar) | Base | 1601 |
| MMLU-Pro, tokens por respuesta correcta (plantilla Sharp) | Sharp | 1248 (−22 %) |
| MMLU-Pro, precisión (Dirk, esfuerzo medium) | Dirk | 85,3 % |
| SWE-bench-Live, 25 tareas resueltas | Dirk vs. Opus 5 (high) | 15 vs. 14 resoluciones; una por detrás del modelo base |
| SWE-bench-Live, tiempo mediano hasta la corrección (banda común) | Dirk | 37 % del tiempo mediano del modelo base (2,7× más rápido) |

El autor indica que las mediciones de SWE-bench-Live son «judge-free» y que la comparación se realizó sobre 25 tareas asentadas. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para el modelo base ni para la cuantización.

## Requisitos de hardware

- VRAM estimada según el tamaño de archivo, más overhead de contexto y de la torre de visión: IQ2_XS 8,8 GB; IQ2_S 9,6 GB; Q2_K_XL 9,8 GB; IQ3_XXS 10,4 GB; IQ3_S 12,1 GB; Q3_K_XL 13,1 GB; IQ4_XS 14,3 GB; Q4_K_S 15,4 GB.
- Tarjetas de 12 GB: recomendación del autor para IQ2_XS (con espacio para contexto real) e IQ2_S (la opción principal para 12 GB); IQ3_XXS cabe también con contexto más corto.
- Tarjetas de 16 GB: IQ3_XXS con holgura, IQ3_S como opción de valor, Q3_K_XL con margen e IQ4_XS como opción principal para 16 GB.
- GPU profesionales (A100, H100) y de consumo de gama alta (RTX 4090, 24 GB) pueden alojar los niveles de 3 y 4 bits con contexto amplio, aunque la información disponible no detalla cifras de throughput para estas configuraciones.
- Despliegue: llama.cpp como runtime de referencia; el autor menciona también compatibilidad con LM Studio y oMLX, y la copia de blackfan23 añade una torre de visión en formato compatible con el motor de inferencia Splash.
- La cabecera MTP permite acelerar la generación en runtimes con decodificación especulativa multi-token, aunque no se publican cifras de latencia ni de tokens por segundo.
- No se dispone de estimaciones de throughput ni de latencia medidas en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparaciones parciales, basadas en los datos que cita el autor en la model card.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dirk-Qwen3.8-27B (este) | 27,3 B denso | No disponible | Apache 2.0 | Cuantizado GGUF con plantilla Sharp, MTP y visión; 85,3 % en MMLU-Pro según el autor |
| Qwen3.8-27B (base) | 27,3 B denso | No disponible | Apache 2.0 | Mismas ponderaciones; fuerza `reasoning_effort=xhigh` por defecto y usa plantilla estándar |
| ThinkingCap-27B (base de Dagger) | 27 B (no confirmado) | No disponible | No disponible | Mismas ponderaciones que Dagger, solo cambia la plantilla; referencia de las mediciones de Claw-Eval y MMLU-Pro |
| Nail (Sharp Ornith-1.5) | 35 B totales, MoE A3B | No disponible | No disponible | Cuantizado de 4 bits; más rápido hasta una respuesta correcta en MMLU-Pro (43 s) según el autor |
| Opus 5 (high) / Sonnet 5 (medium) | No disponible | No disponible | Propietaria | Referencias en la comparación de SWE-bench-Live citada por el autor |

No se dispone de datos suficientes para comparar contexto, rendimiento o disponibilidad de las alternativas con rigor; las cifras de Nail y de los modelos de Anthropic provienen únicamente de los gráficos descritos en la model card.

## Limitaciones y advertencias

- El repositorio es una copia de un cuantizado de terceros (peculiar-ragdoll); la única modificación declarada es la plantilla de chat y, en esta copia, el formato de la torre de visión para el motor Splash. No hay verificación independiente de que los pesos coincidan bit a bit con el modelo base.
- Los benchmarks citados son mediciones del autor, no evaluaciones oficiales, y algunas comparaciones (SWE-bench-Live, MMLU-Pro) se basan en muestras pequeñas (25 tareas) o en gráficos sin datos completos.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado y no debería asumirse.
- Riesgo de alucinación inherente a los modelos de lenguaje de 27 B, no cuantificado en la información disponible; los niveles de 2 bits pueden degradar la fidelidad de forma más acusada.
- La plantilla Sharp modifica el comportamiento por defecto (concisión y esfuerzo `medium`); aplicaciones que dependan del razonamiento máximo por defecto deben configurar `reasoning_effort` explícitamente.
- El campo `reasoning_effort` de nivel superior al estilo OpenAI es descartado por llama.cpp y oMLX; debe pasarse dentro de `chat_template_kwargs`, lo que puede romper integraciones que esperen el formato estándar.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero la información disponible no aclara si la plantilla Sharp o los cuantizados de terceros añaden restricciones adicionales; conviene verificar los repositorios de origen antes de un despliegue en producción.
- El tamaño del repositorio (240,6 GB) y la multiplicidad de niveles de cuantización complican la descarga selectiva; es necesario elegir el archivo concreto.
- La torre de visión en GGUF requiere runtimes con soporte multimodal; no todos los backends de llama.cpp la manejan de forma equivalente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blackfan23/Dirk-Qwen3.8-27B-GGUF
- Repositorio original del cuantizado: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Plantillas Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Cuantizados GSQ-RCO de IST-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Documentación de cuantizados Dynamic 3.0 de Unsloth: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizado de referencia Dagger: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP
- Paper citado: arxiv:2604.18556
- Paper citado: arxiv:2605.00649
