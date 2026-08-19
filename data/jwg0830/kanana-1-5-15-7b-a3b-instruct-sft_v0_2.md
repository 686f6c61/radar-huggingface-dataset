# jwg0830/kanana-1.5-15.7b-a3b-instruct-sft_v0_2

## Resumen

El modelo `jwg0830/kanana-1.5-15.7b-a3b-instruct-sft_v0_2` es un ajuste fino mediante LoRA del modelo `kakaocorp/kanana-1.5-15.7b-a3b-instruct`, desarrollado por Kakao. Este fine-tuning, realizado por el autor jwg0830, tiene como objetivo corregir deficiencias en el formato de salida detectadas en un proxy benchmark de cinco ejes del K-AI Leaderboard coreano (KMMLU-Pro, CLIcK, HLE(Ko), MuSR(Ko) y Com2-main(Ko)). El resultado es un modelo conversacional orientado al coreano, con una arquitectura Mixtral MoE de aproximadamente 15,7 mil millones de parámetros totales y 3 mil millones activos (según la nomenclatura A3B del modelo base, no verificada de forma independiente).

El modelo base de Kakao es el primer MoE de la familia Kanana, diseñado para ofrecer un rendimiento comparable al modelo denso Kanana-1.5-8B con solo el 37 % de los FLOPS por token, lo que lo hace especialmente eficiente para inferencia. Este fine-tuning conserva esa arquitectura sin modificaciones estructurales, fusionando el adaptador LoRA en el modelo base. Su relevancia radica en que proporciona una versión mejorada del modelo instruct de Kakao para tareas de razonamiento y comprensión en coreano, con una mejora notable en la estabilidad del formato de respuesta, especialmente en el eje de razonamiento causal (Com2-main).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral (MoE, transformer disperso) |
| Parametros totales | 15.696.279.552 (≈15,7B) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base, no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, compatible con cuantizaciones estandar) |
| Idiomas soportados | coreano (el modelo base soporta tambien ingles, pero este fine-tuning esta enfocado en coreano) |
| Licencia | other (no especificada; consultar la licencia del modelo base de Kakao) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mixtral de MoE, con un total de 15,7B parámetros y aproximadamente 3B activos por token. El entrenamiento consistió en un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo instruct de Kakao, utilizando datos de AI Hub coreano. Se emplearon cinco conjuntos de datos específicos para cubrir los ejes del K-AI Leaderboard: 71.857 ejemplos de comprensión lectora de textos escolares, 71.874 de conocimiento médico, 71.610 de lectura mecánica de documentos financieros y legales, 569 de lectura mecánica de documentos administrativos y 71.949 de razonamiento causal (con upsampling). El adaptador LoRA se configuró con r=16 y alpha=32, aplicándose únicamente a los módulos de atención (q/k/v/o_proj), excluyendo los MLP de los expertos por la estructura MoE, y se entrenó durante 2 épocas. No se introdujeron cambios arquitectónicos; el adaptador se fusionó directamente en el modelo base, y se verificó que el modelo resultante carga sin opciones adicionales en vLLM.

## Capacidades

- Generación de texto y conversación multi-turno en coreano.
- Comprensión lectora de textos académicos, documentos legales, financieros y administrativos.
- Razonamiento causal y resolución de problemas de inferencia.
- Conocimiento especializado en áreas médicas, financieras y legales (derivado de los datos de entrenamiento).
- Mejora en la estabilidad del formato de salida en comparación con el modelo base, especialmente en el eje Com2-main.
- No se documentan capacidades de tool calling, uso de agentes ni modos de razonamiento extendido en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo puede gestionar conversaciones multi-turno con un formato de respuesta estable, adecuado para sistemas de soporte en empresas coreanas.
- Análisis de documentos legales y financieros: gracias a su entrenamiento con datos de lectura mecánica, puede extraer información relevante de contratos, informes financieros y documentos administrativos.
- Asistente educativo para estudiantes de coreano: puede responder preguntas de comprensión lectora y razonamiento basadas en textos académicos, útil en plataformas de aprendizaje.
- Generación de contenido en coreano: redacción de resúmenes, informes o respuestas estructuradas en contextos profesionales.
- Investigación en procesamiento del lenguaje natural coreano: sirve como modelo de referencia para evaluar técnicas de fine-tuning y comparar con otros modelos del K-AI Leaderboard.
- Desarrollo de aplicaciones de razonamiento causal: su mejora en el eje Com2-main lo hace adecuado para tareas que requieren inferir relaciones de causa y efecto en textos coreanos.

## Benchmarks y rendimiento

El autor proporciona resultados de un proxy benchmark propio, no oficial, basado en 1.350 preguntas distribuidas en cinco ejes. La siguiente tabla compara el modelo base con la versión fine-tuneada:

| Eje | Base (aciertos) | sft_v0_2 (aciertos) |
|---|---:|---:|
| KMMLU-Lite | 213/300 | 216/300 |
| CLIcK-Lite | 268/300 | 275/300 |
| HLE-Lite | 181/200 | 190/200 |
| MuSR-Lite | 278/300 | 282/300 |
| Com2-main-Lite | 197/250 | 245/250 |
| **Total** | **1.137/1.350 (84,3 %)** | **1.208/1.350 (89,5 %)** |

Estos resultados son referenciales y no constituyen puntuaciones oficiales del K-AI Leaderboard. El autor advierte que en el eje Com2-main-Lite las opciones incorrectas fueron sintetizadas mediante muestreo cruzado, por lo que la precisión absoluta debe interpretarse con cautela. No se han publicado benchmarks oficiales adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precisión FP16 ocupa aproximadamente 31,4 GB (tamaño del repositorio). Con cuantización de 8 bits se reduciría a unos 16 GB, y con 4 bits a unos 8 GB, aunque estos valores son estimaciones basadas en el tamaño de los pesos y no en mediciones confirmadas.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 32 GB de VRAM (p. ej., A100 40 GB, H100). Con cuantización 8 bits, una RTX 4090 (24 GB) sería suficiente; con 4 bits, una RTX 3090 o 4080 (16 GB) podría bastar.
- Al ser un modelo MoE con solo 3B parámetros activos, el uso de memoria durante la inferencia es menor que el de un modelo denso equivalente, pero la VRAM total depende de la carga de todos los parámetros.
- Opciones de despliegue: compatible con vLLM (verificado por el autor sin opciones adicionales), así como con llama.cpp, Ollama y TGI mediante conversión a GGUF.
- Latencia y throughput: no se proporcionan datos concretos, pero la arquitectura dispersa del modelo base sugiere una inferencia más rápida que un modelo denso de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jwg0830/kanana-1.5-15.7b-a3b-instruct-sft_v0_2 | 15,7B (3B activos) | no disponible | coreano | other | Fine-tuning con LoRA, mejora en formato de salida |
| kakaocorp/kanana-1.5-15.7b-a3b-instruct | 15,7B (3B activos) | no disponible | coreano, ingles | other (Kakao) | Modelo base, eficiente (37 % FLOPS vs denso) |
| kakaocorp/kanana-1.5-8b-instruct | 8B (denso) | no disponible | coreano, ingles | other (Kakao) | Modelo denso comparable en rendimiento al MoE |

No se dispone de datos suficientes para comparar con otros modelos coreanos como EXAONE-Deep-7.8B, aunque el autor menciona haber usado el mismo conjunto de datos de entrenamiento para otros fine-tunings.

## Limitaciones y advertencias

- El modelo está optimizado para coreano; su rendimiento en otros idiomas, incluido el inglés, puede ser inferior al del modelo base.
- Los resultados del proxy benchmark son autorreferenciales y no oficiales; la mejora en Com2-main-Lite puede estar sobreestimada debido a la síntesis de opciones incorrectas.
- La licencia se indica como "other" sin especificar; es necesario revisar la licencia del modelo base de Kakao para determinar restricciones de uso comercial.
- No se han publicado evaluaciones independientes ni benchmarks oficiales, por lo que el rendimiento real en producción no está validado.
- Como todo modelo de lenguaje, existe riesgo de alucinación y de generar respuestas incorrectas o inconsistentes, especialmente en dominios especializados.
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere una adopción muy limitada; la comunidad no ha validado su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwg0830/kanana-1.5-15.7b-a3b-instruct-sft_v0_2
- Modelo base (Kakao): https://huggingface.co/kakaocorp/kanana-1.5-15.7b-a3b-instruct
- Repositorio GitHub de Kakao Kanana: https://github.com/kakao/kanana
- Página del modelo base en Socket: https://socket.dev/huggingface/package/kakaocorp/kanana-1.5-15.7b-a3b-instruct
