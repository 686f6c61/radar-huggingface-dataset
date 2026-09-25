# jgeuter/qwen3-4b-dpakl-reverse-thinking-b16

## Resumen

qwen3-4b-dpakl-reverse-thinking-b16 es un modelo borrador (draft model) de 322 millones de parametros disenado para decodificacion especulativa sobre Qwen/Qwen3-4B en modo thinking. No es un modelo conversacional autonomo: su unica funcion es proponer bloques de tokens que el modelo objetivo verifica despues, con el fin de reducir la latencia de generacion sin alterar la distribucion de salida. Lo publica el usuario jgeuter bajo licencia Apache 2.0.

Tecnicamente es un transformer de 3 capas con block size 16, entrenado con el objetivo D-PAL[reverse KL] sobre caracteristicas intermedias capturadas de las capas 1, 17 y 33 de Qwen3-4B. El corpus de entrenamiento son 36 315 conversaciones ShareGPT regeneradas por el propio Qwen3-4B con thinking activado (temperatura 0,6, top-p 0,95, top-k 20, presupuesto de 32k tokens), expandidas a 101 212 muestras por turno supervisado.

Su relevancia es acotada pero concreta: el autor lo presenta explicitamente como artefacto de investigacion para comparar objetivos de entrenamiento de borradores (DFlash, D-PACE, D-PARD) sobre datos de razonamiento. Es un terreno dificil para la decodificacion especulativa, porque las cadenas de pensamiento tienen una distribucion de tokens distinta a la de la generacion estandar y las tasas de aceptacion suelen resentirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 3 capas, modelo borrador DFlash para decodificacion especulativa, block size 16 |
| Parametros totales | 322 458 368 (~322 M), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de secuencia maxima durante el entrenamiento; en despliegue hereda la ventana del modelo objetivo Qwen3-4B |
| Tipos de cuantizacion | no disponibles; el tamano del repo (0,6 GB) es coherente con pesos en bf16 |
| Idiomas soportados | no disponibles (el modelo base, Qwen3-4B, es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con custom_code (requiere cargar codigo remoto) |

## Arquitectura y entrenamiento

El borrador sigue el esquema DFlash: un transformer de 3 capas que predice bloques de 16 tokens de forma paralela, alimentado por caracteristicas internas extraidas del modelo objetivo. La captura de caracteristicas se hizo de forma offline con SpecForge desde las capas 1, 17 y 33 de Qwen3-4B, de modo que el borrador aprende a mapear representaciones del objetivo a distribuciones de siguiente token. El objetivo de entrenamiento es D-PAL[reverse KL]: minimizar KL(q||p) sobre el vocabulario completo con pesos de posicion basados en solapamiento (que se corresponden con la aceptacion exacta de rejection sampling de D-PAL) y un suelo de suavizado de pesos rho = 0,5.

El entrenamiento uso AdamW con learning rate 6e-4, scheduler coseno con 4 % de warmup, batch global 4, 6 epocas, 512 anchors por secuencia, grad clip 1,0, precision bf16 y semilla 42. La receta replica la de los papers D-PARD/D-PACE, con dos diferencias declaradas por el autor: longitud de secuencia 8192 (frente a 3072 en la receta original) y un corpus especifico de modo thinking. Los datos de entrenamiento se generaron con el propio Qwen3-4B sobre ShareGPT, supervisando unicamente el ultimo turno del asistente en cada muestra e incluyendo el razonamiento completo con la plantilla de chat de thinking activada.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa sobre Qwen3-4B en modo thinking: propone hasta 16 tokens por bloque para su verificacion por el modelo objetivo.
- Aceleracion de inferencia: no genera respuestas propias, sino candidatos que el verificador acepta o rechaza.
- Soporte de tool calling / function calling: no disponible; el borrador no expone plantilla de herramientas propia.
- Soporte de agentes y razonamiento multi-paso: no aplica; esa capacidad reside en el modelo objetivo, no en el borrador.
- Capacidades multilingues: no disponibles; dependen enteramente de Qwen3-4B.
- Capacidad especial: entrenado especificamente sobre trazas de razonamiento con thinking activado, lo que lo diferencia de borradores entrenados sobre datos de generacion convencional.

## Casos de uso

- Reduccion de latencia en servicios de razonamiento: desplegado con SGLang junto a Qwen3-4B, permite atacar el cuello de botella de la decodificacion autoregresiva cuando el modelo objetivo genera cadenas de pensamiento largas (presupuesto de hasta 32k tokens en el corpus de entrenamiento), donde cada token se produce de forma secuencial.
- Inferencia local en GPU de consumo: al anadir solo ~0,6 GB de pesos, un usuario con una RTX con 12-16 GB puede acelerar Qwen3-4B en bf16 sin renunciar a la precision del modelo objetivo, algo que no ocurre con alternativas de cuantizacion agresiva.
- Backend de chatbot con presupuesto de latencia estricto: el borrador reduce el tiempo hasta el primer bloque de respuesta manteniendo la distribucion de salida intacta, ya que la verificacion garantiza que no se altera el resultado final.
- Generacion de datos sinteticos a escala: cuando se usa Qwen3-4B en modo thinking para producir grandes volumenes de trazas de razonamiento, la decodificacion especulativa aumenta el throughput agregado del pipeline de generacion.
- Investigacion comparativa de objetivos de entrenamiento: es exactamente el uso declarado por el autor, comparar DFlash, D-PACE y D-PARD sobre un corpus de thinking con la misma arquitectura de borrador y el mismo modelo objetivo.
- Validacion de infraestructura de decodificacion especulativa: sirve como caso de prueba para verificar que un despliegue de SGLang con `--speculative-algorithm DFLASH` y `--reasoning-parser qwen3` funciona correctamente antes de escalar a modelos mayores.
- Experimentos de destilacion de comportamiento: las representaciones de las capas 1, 17 y 33 usadas para entrenar el borrador pueden analizarse para estudiar que capas de Qwen3-4B resultan mas informativas para predecir el siguiente token en modo razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion (acceptance rate), factor de aceleracion (speedup) ni comparaciones cuantitativas frente a otros borradores o frente a la decodificacion sin especulacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,65 GB en bf16, calculado a partir de los 322 millones de parametros.
- VRAM total del sistema: hay que sumar el modelo objetivo Qwen3-4B, en torno a 8 GB en bf16 mas la cache KV; con cuantizacion de 4 bits del objetivo (AWQ/GPTQ) el conjunto baja a unos 3-4 GB.
- GPU de consumo: cabe en tarjetas de 8 GB si se cuantiza el modelo objetivo, y con comodidad en 12 GB (RTX 3060 12 GB, RTX 4070), 16 GB (RTX 4060 Ti 16 GB, RTX 4080) y 24 GB (RTX 3090, RTX 4090) con el objetivo en bf16.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este par de modelos, pero validas si el objetivo se sirve a gran concurrencia.
- Opciones de despliegue: el autor documenta unicamente SGLang mediante `python -m sglang.launch_server --model-path Qwen/Qwen3-4B --speculative-algorithm DFLASH --speculative-draft-model-path jgeuter/qwen3-4b-dpakl-reverse-thinking-b16 --reasoning-parser qwen3`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de factor de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-dpakl-reverse-thinking-b16 | 322 M | 8192 (entrenamiento) | Borrador DFlash, objetivo D-PAL reverse KL, block size 16 | Apache 2.0 | HuggingFace |
| Borradores D-PACE (misma linea, referencia en la model card) | no disponible | no disponible | Receta D-PARD/D-PACE sobre corpus convencional | no disponible | no disponible |
| Borradores D-PARD (misma linea, referencia en la model card) | no disponible | no disponible | Receta D-PARD/D-PACE sobre corpus convencional | no disponible | no disponible |
| EAGLE-3 (enfoque alternativo de decodificacion especulativa) | no disponible | no disponible | Prediccion de tokens con caracteristicas multi-capa | no disponible | no disponible |
| Medusa (enfoque alternativo de decodificacion especulativa) | no disponible | no disponible | Cabezas de decodificacion paralelas | no disponible | no disponible |

No se dispone de datos cuantitativos publicos que permitan comparar el rendimiento de este borrador con el de las alternativas citadas. La unica comparacion posible por ahora es cualitativa: este modelo se distingue por entrenarse exclusivamente sobre datos de modo thinking con secuencias de 8192 tokens, frente a recetas convencionales de 3072 tokens.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Qwen3-4B como verificador no produce respuestas utiles. No debe desplegarse por separado ni presentarse como un modelo de chat.
- Esta entrenado exclusivamente para el modo thinking de Qwen3-4B. Su comportamiento con thinking desactivado o con otros modelos objetivo no esta documentado.
- Es un artefacto de investigacion declarado como tal por el autor, con 0 descargas y 0 likes. No hay validacion externa, ni tasas de aceptacion publicadas, ni pruebas de produccion.
- Los datos de entrenamiento fueron generados por el propio Qwen3-4B, por lo que el borrador hereda los sesgos y las particularidades estilisticas del modelo objetivo, incluyendo posibles patrones repetitivos en las trazas de razonamiento.
- La longitud de secuencia de entrenamiento (8192 tokens) es inferior al presupuesto de razonamiento de 32k tokens usado al generar el corpus. En secuencias muy largas la tasa de aceptacion podria degradarse, aunque este extremo no se cuantifica en la model card.
- El repositorio usa `custom_code`, lo que implica ejecutar codigo remoto al cargar el modelo. Conviene auditar ese codigo antes de usarlo en entornos no controlados.
- La licencia Apache 2.0 del borrador permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia, que debe verificarse de forma independiente.
- No se documentan idiomas soportados ni comportamiento multilingue especifico; cualquier limitacion linguistica proviene del modelo objetivo.
- La fecha de creacion registrada en HuggingFace (2026-09-25) es atipica y conviene tratarla con cautela al citar el modelo.
- El autor no publica compatibilidad con otros motores de inferencia distintos de SGLang, lo que limita las opciones de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jgeuter/qwen3-4b-dpakl-reverse-thinking-b16
- Dataset de entrenamiento: https://huggingface.co/datasets/jgeuter/ShareGPT-Qwen3-4B-T0.6-Thinking-Regen
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- SGLang (motor de despliegue documentado en la model card): enlace no disponible en la informacion proporcionada
- SpecForge (herramienta de captura offline de caracteristicas): enlace no disponible en la informacion proporcionada
- Papers D-PAL, D-PARD y D-PACE (citados como referencia de la receta de entrenamiento): enlace no disponible en la informacion proporcionada
