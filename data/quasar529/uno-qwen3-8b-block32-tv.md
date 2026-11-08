# quasar529/uno-qwen3-8b-block32-tv

## Resumen

uno-qwen3-8b-block32-tv es un adaptador LoRA entrenado sobre el modelo base congelado s-sahoo/uno-qwen3-8B (revision b8a7577b3223bdcf2b3af0f2fc6e95258b3bbc29), publicado por el usuario quasar529. No se trata de un modelo de 8B independiente ni de un modelo de parametros completos: es un checkpoint de investigacion (paso final 32.813) que extiende el curriculum de entrenamiento de Uno hasta un bloque de tamano 32. El objetivo de entrenamiento es TV-L1 (suma sobre el vocabulario de diferencias absolutas de probabilidad, es decir, el doble de la variacion total matematica) con peso 1 y entropia cruzada (CE) con peso 0.

El modelo hereda la estructura causal de siguiente token / ruido completo de Uno, un marco de investigacion orientado a diffusion y decodificacion especulativa sobre Qwen3-8B. El adaptador tiene rango LoRA 128 y alpha 2048 (ratio alpha/r = 16), y se entreno sobre el dataset open-thoughts/OpenThoughts3-1.2M con batch global 128 y longitud de secuencia 4096. La relevancia actual es acotada: se trata de un artefacto de investigacion con verificacion de integridad de pesos, no de un paquete de reproduccion validado en entorno limpio.

El autor es explicito sobre el estado de reproducibilidad: los pesos publicados coinciden con el checkpoint original y el SHA256 del Hub coincide con la exportacion local, pero no se ha validado una instalacion limpia en servidor, ni la equivalencia de salidas en otra GPU o stack de software, ni el rendimiento TPS en otro hardware. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-8B) con adaptador LoRA; estructura Uno de siguiente token / ruido completo |
| Parametros totales | No disponible para el adaptador (el base congelado es de 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con longitud de secuencia 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json, exportacion nativa PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Uno-Qwen3-8B, que mantiene la estructura original de Uno: prediccion causal de siguiente token combinada con un componente de ruido completo, orientada a diffusion y muestreo especulativo. El curriculum de entrenamiento se extendio en la secuencia 2 → 4 → 6 → 8 → 12 → 16 → 32 bloques, y este checkpoint corresponde al paso final 32.813 con bloque 32. El adaptador LoRA tiene rango 128 y alpha 2048, lo que da un ratio alpha/r de 16. No hay condicionamiento temporal explicito ni self-conditioning.

El objetivo de entrenamiento es 1 × TV-L1 + 0 × CE. TV-L1 se define como la suma sobre el vocabulario de las diferencias absolutas de probabilidad (el doble de la variacion total matematica). Cuando la CE esta activa, su objetivo es el argmax del verificador causal limpio, no el token original de los datos ni respuestas objetivo generadas de nuevo. Los datos de entrenamiento provienen de open-thoughts/OpenThoughts3-1.2M, con batch global 128 y longitud de secuencia 4096; el padding y el packing implican que las posiciones de tokens programadas no equivalen a tokens unicos sin padding. El adaptador no incluye el modelo base congelado, y el autor advierte que no debe sustituirse por un checkpoint Qwen3 generico.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen3-8B, condicionada por el adaptador LoRA.
- Investigacion en diffusion y decodificacion especulativa mediante la estructura Uno.
- Entrenamiento con curriculum de bloques crecientes (hasta bloque 32) para el objetivo TV-L1.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: no se documentan modos de thinking, vision ni audio en esta ficha.

## Casos de uso

- Investigacion en decodificacion especulativa: el adaptador permite estudiar como el curriculum de bloques (hasta 32) y el objetivo TV-L1 afectan a la aceptacion de tokens en muestreo especulativo, usando el motor de inferencia Uno y el base fijado.
- Experimentos de diffusion sobre LLM: sirve para reproducir y analizar la estructura de ruido completo de Uno sobre Qwen3-8B en entornos de laboratorio, sin pretender un benchmark listo para usar.
- Analisis de objetivos de entrenamiento: util para comparar TV-L1 frente a CE en la distribucion de probabilidad del vocabulario, dado que la CE esta desactivada (peso 0) en este checkpoint.
- Estudio de adaptadores LoRA de alto rango: con rango 128 y alpha 2048, permite evaluar el efecto del ratio alpha/r = 16 en tareas de investigacion sobre el base congelado.
- Verificacion de integridad de artefactos: el release incluye SHA256SUMS.json y release.json, lo que facilita auditorias de pesos y procedencia en pipelines de investigacion.
- Reproduccion parcial de entrenamiento: aunque no se soporta la reanudacion exacta (faltan estados de optimizador y RNG), el adaptador sirve para inspeccionar el checkpoint final y su configuracion de entrenamiento documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este release no es un paquete de benchmarks listo para usar y que las diferencias de precision experimentales existentes no constituyen afirmaciones de mejora de calidad bajo muestreo especulativo exacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del base Uno-Qwen3-8B completo (8B) y de la cuantizacion, que no se documenta.
- GPU recomendadas: no disponible; el autor no valido el rendimiento en ninguna GPU concreta para este release.
- Compatibilidad con GPU de consumo: no establecida; el adaptador por si solo no es un modelo independiente y requiere el base congelado y el motor Uno.
- Opciones de despliegue: motor de inferencia Uno incluido en code/upstream con el base fijado; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no establecidos; el autor advierte que el TPS depende del hardware y del backend, y que la ruta de generacion de referencia incluida no debe usarse para afirmar reproduccion de TPS de motores optimizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uno-qwen3-8b-block32-tv | Adaptador LoRA sobre base 8B | No disponible (entrenado a 4096) | Sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3-8B | 8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Qualcomm AI Hub y otros |
| s-sahoo/uno-qwen3-8B (base) | 8B | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face |

La comparacion con Qwen3-8B es solo estructural: este adaptador no es un modelo independiente y no se han publicado metricas que permitan comparar rendimiento con el base ni con alternativas.

## Limitaciones y advertencias

- No es un modelo de 8B autonomo: es un adaptador LoRA que requiere el base s-sahoo/uno-qwen3-8B en la revision exacta b8a7577b3223bdcf2b3af0f2fc6e95258b3bbc29; no debe sustituirse por un Qwen3 generico.
- Reproducibilidad incompleta: no se ha validado una instalacion limpia en servidor, ni la equivalencia de salidas en otra GPU o stack, ni el TPS en otro hardware.
- No soporta reanudacion exacta del entrenamiento: los estados de optimizador y RNG se omiten deliberadamente.
- No es un paquete de benchmarks: las tablas previas de AIME/GSM8K no se reproducen de forma directa con este release.
- Objetivo de entrenamiento peculiar: CE con peso 0 y TV-L1 con peso 1; la CE, si se activa, apunta al argmax del verificador causal limpio, no al token original.
- Idioma limitado al ingles declarado.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales del base Qwen3-8B.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el codigo y datos de terceros conservan sus propios terminos; el autor preserva LICENSE y NOTICE de upstream.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/quasar529/uno-qwen3-8b-block32-tv
- Modelo base: https://huggingface.co/s-sahoo/uno-qwen3-8B
- Repositorio Uno: https://github.com/ifm-ai/uno
- Dataset OpenThoughts3: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Qwen3-8B especificaciones y VRAM: https://apxml.com/models/qwen3-8b
