# BunkerOfficial/Inkling2.0-Slow-Residual-GRPO

## Resumen

Inkling2.0-Slow-Residual-GRPO es un checkpoint de aprendizaje por refuerzo (GRPO) desarrollado por BunkerOfficial sobre el modelo base `thinkingmachines/TML-d24-varloop-research`. Se trata de un modelo de mezcla de expertos (MoE) de 26.388 millones de parametros que emplea una arquitectura de bucle con reutilizacion de capas: las 12 capas centrales se reejecutan varias veces ("loop passes") para aumentar la profundidad efectiva del razonamiento sin incrementar el numero de parametros.

El modelo esta especializado en razonamiento multi-salto (multi-hop reasoning), codigo y matematicas, y se distribuye con pesos cuantizados en NVFP4 (expertos empaquetados) y MXFP8 en las cuatro ultimas capas. La innovacion principal del entrenamiento es la "Slow-Residual Regularization", que actua sobre la evolucion de los estados ocultos entre pasadas del bucle para estabilizar el razonamiento iterativo.

Es relevante ahora porque demuestra que el ajuste fino con GRPO sobre arquitecturas de bucle puede mejorar sustancialmente tareas de razonamiento encadenado frente al modelo base congelado (de 0/24 a 10-11/24 en el conjunto CodeHop), aunque con un coste: en algunos regimenes de pasadas el rendimiento decae respecto al SFT intermedio. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas reutilizadas (`inkling2_loop`) |
| Parametros totales | 26.388.646.440 (~26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos empaquetados), MXFP8 (cuatro ultimas capas), BF16 en runtime Transformers |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, transformers (modelopt) |

## Arquitectura y entrenamiento

El modelo parte de un transformer MoE de 26,4 B de parametros cuya caracteristica estructural es la reutilizacion de sus 12 capas centrales en multiples pasadas ("loop passes"). En post-entrenamiento se mantuvieron congelados los pesos de los expertos, mientras que se entrenaron las puertas y queries de mensajes entre pasadas, adaptadores de atencion de rango 32 y los routers de expertos. El export conserva los expertos empaquetados en NVFP4 y los expertos MXFP8 de las cuatro ultimas capas.

El entrenamiento supervisado duro 800 pasos con entre dos y ocho pasadas del bucle, sobre una mezcla que incluyo 1.200 trazas de codigo generadas, 800 ejemplos de codigo contrafactual y trazas verificadas generadas por el modelo. Despues se aplicaron seis rondas de Group Relative Policy Optimization (GRPO) combinado con destilacion on-policy (OPD) anclada al modelo base, muestreando tres, cinco o siete pasadas. La innovacion clave, Slow-Residual Regularization (Slow-SVReg + hinge-flip), actua sobre la variacion de los estados ocultos entre pasadas: fomenta la estabilidad a lo largo de 288 direcciones de variacion lenta identificadas en el modelo base y penaliza actualizaciones sucesivas que apuntan en direccion opuesta. Como resultado, la similitud coseno media entre actualizaciones consecutivas en la pasada 3 paso de -0,512 (base congelada) a +0,151 (GRPO), con perplejidad en WikiText-2 de 11,08 a 11,34.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat y parametro `reasoning_effort` (por ejemplo, "medium").
- Razonamiento multi-salto iterativo mediante multiples pasadas del bucle (`K`), incluyendo tareas de aritmetica encadenada y seguimiento de estado.
- Generacion y razonamiento sobre codigo Python, con trazas de ejecucion y resolucion de problemas tipo MBPP.
- Razonamiento matematico (evaluado en subconjunto de MATH-500).
- Procesamiento image-text-to-text segun el pipeline declarado (capacidad de vision; sin detalles adicionales en la informacion disponible).
- Soporte de `transformers` (`Inkling2LoopForConditionalGeneration`) con `apply_chat_template`.
- Inferencia cuantizada nativa (NVFP4/MXFP8) y compatible con endpoints.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: razonamiento multi-paso si, orquestacion de agentes no documentada.

## Casos de uso

- Razonamiento aritmetico encadenado en produccion: el modelo puede resolver cadenas de transformaciones de estado (tipo "duplica, resta, eleva al cuadrado") con un presupuesto de 2.048-4.096 tokens; en el conjunto CodeHop obtuvo 10/24 y 11/24 respuestas finales correctas a K=3 y K=7 respectivamente, frente a 0/24 del base.
- Generacion de codigo con verificación: util para pipelines que requieren trazas de ejecucion y comprobacion de resultados numericos, dado su entrenamiento sobre 1.200 trazas de codigo y 800 ejemplos contrafactuales; se integra via `transformers` con `generate` en modo greedy.
- Resolucion de problemas matematicos de competicion: adecuado para subconjuntos tipo MATH-500 (71/100 a K=3, 65/100 a K=7 con 4.096 tokens), especialmente cuando se puede permitir un presupuesto de salida amplio.
- Evaluacion de razonamiento iterativo en investigacion: su arquitectura de bucle con parametro `K` ajustable lo hace idoneo para estudiar el efecto del numero de pasadas sobre la precision y el consumo de tokens.
- Prototipado de asistentes conversacionales en ingles: la plantilla de chat con `reasoning_effort` permite desplegar dialogos multi-turno en ingles con control del esfuerzo de razonamiento.
- Experimentacion con cuantizacion NVFP4/MXFP8: sirve como banco de pruebas para medir el impacto de formatos de baja precision en modelos MoE con capas reutilizadas.
- Tareas de vision-lenguaje (segun pipeline `image-text-to-text`): uso potencial en descripcion o razonamiento sobre imagenes, aunque sin metricas publicadas en la informacion disponible.

## Benchmarks y rendimiento

Evaluacion sobre un suite de 620 preguntas (480 problemas multi-hop generados, 100 de MATH-500, 40 de MBPP), decodificacion greedy, esfuerzo medio y maximo de 2.048 tokens salvo indicacion:

| Checkpoint | Precision K=3 | Precision K=7 | Tope de tokens K=7 |
|---|---:|---:|---:|
| Base congelado | 61,61% | 62,74% | 30,65% |
| SFT etapa 1 | 80,00% | 82,58% | 6,94% |
| **GRPO final** | **79,03%** | **75,97%** | **18,87%** |

Con 4.096 tokens de salida, GRPO alcanzo 87,58% a K=3 y 88,06% a K=7 (reduciendo el tope de tokens de 18,87% a 4,35%). En MATH-500 (100 preguntas): 71/100 a K=3 y 65/100 a K=7. En MBPP (40 tareas): 25/40 y 28/40.

CodeHop (24 programas Python nuevos, 9-14 llamadas mutadoras de estado, vLLM sobre Radeon 8060S): GRPO 10/24 a K=3 y 11/24 a K=7; base congelado 0/24 en ambos. Con 4.096 tokens en los primeros 12 casos a K=3: 7 respuestas finales correctas (GRPO) frente a 3 (base); el verificador otorgo 11 y 9 respectivamente. En GraphWalk (10 casos, K=3, 2.048 tokens): base 10/10 y GRPO 8/10.

## Requisitos de hardware

- Espacio en disco: aproximadamente 20,2 GB para los archivos del modelo.
- VRAM en ruta Transformers sobre ROCm: la expansion de pesos empaquetados a BF16 requiere aproximadamente 53 GB de memoria GPU.
- Runtime cuantizado nativo (NVFP4/MXFP8): requisitos de memoria distintos y no especificados en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por el consumo de ~53 GB en BF16 se necesitan aceleradores de gama alta (A100 80 GB, H100, o equivalentes AMD como la Radeon 8060S usada en las pruebas con vLLM).
- Compatibilidad con GPU de consumo: no confirmada; 53 GB en BF16 excede la VRAM de tarjetas consumer actuales, aunque un runtime cuantizado nativo podria reducirlo (sin datos).
- Opciones de despliegue: `transformers==5.24.1` con PyTorch y Accelerate; vLLM (usado en las pruebas sobre Radeon 8060S); endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2.0-Slow-Residual-GRPO | 26,4 B (MoE, bucle) | no disponible | 88,06% suite 620 a K=7/4.096 tokens | Apache 2.0 | Hugging Face |
| Base `thinkingmachines/TML-d24-varloop-research` | 26,4 B (MoE, bucle) | no disponible | 62,74% suite 620 a K=7/2.048 tokens | no disponible | Hugging Face |
| SFT etapa 1 (mismo run) | 26,4 B (MoE, bucle) | no disponible | 82,58% suite 620 a K=7/2.048 tokens | Apache 2.0 | checkpoint interno del run |

No se dispone de datos de otros modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El GRPO final rinde peor que el SFT etapa 1 en la suite principal a 2.048 tokens (75,97% frente a 82,58% a K=7) y sufre mas topes de tokens (18,87% frente a 6,94%); el rendimiento depende criticamente del presupuesto de salida.
- El rendimiento decae con el numero de pasadas en algunos regimenes: la precision baja de 79,03% (K=3) a 75,97% (K=7) a 2.048 tokens, y la similitud coseno entre actualizaciones vuelve a ser negativa en las pasadas 7-9.
- Tendencia a detenerse antes de emitir la respuesta final: en GraphWalk fallo 2 de 10 casos pese a trazar la ruta correcta; en CodeHop, 4 respuestas de GRPO alcanzaron el numero correcto en la traza sin presentar respuesta final visible.
- El conjunto de evaluacion incluye familias sinteticas que solapan con los formatos de entrenamiento, por lo que las puntuaciones pueden no generalizar a distribuciones externas.
- Idiomas: solo ingles declarado; sin soporte multilingue documentado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La evaluacion de la contribucion de las perdidas del bucle a la precision requeriria una ablacion emparejada que no se ha realizado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base (`thinkingmachines/TML-d24-varloop-research`).
- Requiere `transformers==5.24.1`; versiones distintas pueden no cargar la arquitectura `inkling2_loop`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BunkerOfficial/Inkling2.0-Slow-Residual-GRPO
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Resultados por tarea (`eval-results.json`): referenciado en la model card del repositorio
- Grafico de similitud coseno (`loop-updates.png`): referenciado en la model card del repositorio
