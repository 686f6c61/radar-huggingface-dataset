# AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32_2epochs

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de tipo transformer decoder-only desarrollado por XHToken, publicado originalmente como `XHToken/Spark-X2.6-1.7B`. La ficha que nos ocupa, `AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32_2epochs`, es un fine-tuning de terceros sobre ese modelo base, aparentemente orientado a la generacion de codigo Three.js (el nombre sugiere un LoRA con rango 32 y dos epocas de entrenamiento). El autor del fine-tuning es AlekseyCalvin y el repositorio no presenta descargas ni interacciones en el momento de la consulta.

El modelo base pertenece a la serie Spark-X2.6, segunda iteracion de la familia Spark-X2.6 tras el Spark-X2.6-4B, y se posiciona como una alternativa de 1.700 millones de parametros para despliegue en dispositivo (on-device) y entornos con recursos limitados. Segun la model card del modelo base, mantiene exactamente la misma arquitectura que Spark-X2.5-1.7B y obtiene sus mejoras mediante un post-entrenamiento mas elaborado, con avances en codigo, uso de herramientas, contexto largo, multilingue y razonamiento.

La relevancia de esta variante concreta es limitada: se trata de un fine-tuning comunitario sin documentacion tecnica propia, sin benchmarks publicados y sin metricas de evaluacion. Resulta util unicamente como punto de partida para experimentacion con generacion de escenas Three.js, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de la model card usa `max_new_tokens=131072`, lo que sugiere soporte de contexto largo, pero la ventana exacta no se declara |
| Tipos de cuantizacion | no disponible para este fine-tuning; el modelo base menciona una implementacion optimizada de llama.cpp, lo que implica soporte de GGUF en el modelo base |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Spark-X2.5-1.7B, un transformer decoder-only de 1.700 millones de parametros. La model card del modelo base indica que Spark-X2.6-1.7B conserva exactamente la misma arquitectura que su predecesor y que las ganancias provienen del post-entrenamiento, no de cambios estructurales. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento.

El fine-tuning concreto de este repositorio no aporta informacion sobre su proceso de entrenamiento: no se especifican los datos utilizados, el metodo (LoRA con rango 32 y dos epocas, a juzgar por el nombre del repositorio), la tasa de aprendizaje ni los criterios de seleccion de checkpoints. El modelo base incorpora una innovacion destacable: un presupuesto de razonamiento controlable con tres niveles (none, low, high) que permite ajustar la calidad del razonamiento frente a la latencia y el coste de inferencia. Segun la model card, al pasar de high a low en Spark-X2.6-1.7B la puntuacion media cae 4,0 puntos mientras que la longitud media de salida se reduce un 37,3 %.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Generacion de codigo, con enfasis especifico en Three.js en esta variante fine-tuned.
- Razonamiento con modo de pensamiento configurable (none, low, high) heredado del modelo base.
- Uso de herramientas y function calling, segun las mejoras declaradas en la model card del modelo base.
- Capacidades agenticas y planificacion multi-paso, declaradas para el modelo base.
- Razonamiento sobre contextos extensos (long-context), declarado para el modelo base.
- Capacidades matematicas, segun los benchmarks mencionados en la model card del modelo base.
- Soporte multilingue limitado a ingles y chino.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Generacion de escenas Three.js: el fine-tuning esta orientado a producir codigo JavaScript de Three.js (geometrias, materiales, luces, animaciones) a partir de descripciones en lenguaje natural, lo que lo hace adecuado para prototipado rapido de visualizaciones 3D en el navegador.
- Asistente de codigo en el editor: con 1.700 millones de parametros puede ejecutarse en local y ofrecer autocompletado y explicaciones de fragmentos de codigo sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Despliegue en dispositivo: su tamano reducido permite ejecutarlo en portatiles y estaciones de trabajo con GPU de consumo, habilitando asistentes locales con latencia baja.
- Generacion de tutoriales y documentacion tecnica de Three.js: el modelo puede redactar explicaciones paso a paso y ejemplos comentados sobre la API de Three.js.
- Traduccion tecnica ingles-chino: al soportar ambos idiomas, puede emplearse para traducir documentacion o comentarios de codigo entre ingles y chino.
- Experimentacion con modos de razonamiento: el presupuesto de pensamiento configurable permite usar el nivel low en tareas de autocompletado sensible a la latencia y el nivel high en tareas de depuracion o planificacion.
- Chatbot de soporte para desarrolladores: con contexto largo puede mantener conversaciones multi-turno sobre una base de codigo extensa, aunque la calidad en dominios ajenos a Three.js no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tuning. La model card del modelo base menciona comparaciones con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B en throughput de decodificacion, pero los valores numericos no se incluyen en el texto proporcionado (solo se referencian imagenes). No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7 GB para pesos; en 4 bits, alrededor de 0,9 GB, aunque no se confirma que existan GGUF publicados para este fine-tuning concreto.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para maxima velocidad; tambien cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o incluso RTX 3060 de 8 GB en cuantizacion.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas en cuantizacion, y con 6 GB o mas en precision media.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` y `transformers==4.57.1` segun la model card del modelo base), SGLang (imagenes Docker para NVIDIA y Ascend NPU), y llama.cpp mediante la implementacion optimizada de XHToken para el modelo base.
- Latencia y throughput: no disponibles para este fine-tuning. La model card del modelo base afirma que Spark-X2.6-1.7B lidera el throughput de decodificacion en contextos cortos entre los modelos on-device evaluados en RTX 4090, pero sin cifras concretas en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6_ThreeJS_v2_1.7B_r32_2epochs | 1,7 B | no disponible | apache-2.0 | en, zh | Fine-tuning comunitario sin benchmarks |
| Spark-X2.6-1.7B (base) | 1,7 B | no disponible | apache-2.0 | en, zh | Modelo base oficial con benchmarks en la model card |
| Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | Citado como referencia de rendimiento on-device en la model card del modelo base |
| MiniCPM-2B | no disponible | no disponible | no disponible | no disponible | Citado como referencia de rendimiento on-device en la model card del modelo base |
| LFM2.5-2.6B | no disponible | no disponible | no disponible | no disponible | Citado como referencia de rendimiento on-device en la model card del modelo base |

No se dispone de datos suficientes para comparar rendimiento numerico entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Fine-tuning de terceros sin documentacion: no hay model card propia, ni descripcion del dataset, ni evaluacion. El comportamiento fuera del dominio Three.js es impredecible.
- Riesgo de olvido catastrofico: al ser un LoRA de rango 32 durante dos epocas sobre un modelo de 1,7 B, es probable que las capacidades generales del modelo base se hayan degradado, aunque no hay datos que lo confirmen.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en APIs de Three.js y en codigo que no haya visto durante el fine-tuning.
- Contexto maximo no declarado: aunque el ejemplo de generacion usa 131.072 tokens nuevos, esto no garantiza que la ventana de entrada soporte esa longitud.
- Licencia apache-2.0 permite uso comercial, pero el modelo base podria tener condiciones adicionales no reflejadas; conviene verificar el repositorio original de XHToken.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; auditar antes de usar en produccion.

## Enlaces

- Repositorio del fine-tuning: https://huggingface.co/AlekseyCalvin/Spark-X2.6_ThreeJS_v2_1.7B_r32_2epochs
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Implementacion optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack de la comunidad: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
