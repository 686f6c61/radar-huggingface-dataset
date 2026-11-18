# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (`fo`). Se trata de un experimento de investigacion que aplica un entrenamiento continuado (continued pre-training, CPT) en dos fases: primero sobre una fusion TIES de pesos iguales de modelos entrenados con las porciones danesa e islandesa de FineWeb-2, y despues sobre la porcion feroesa del mismo corpus. El objetivo es transferir conocimiento entre lenguas escandinavas cercanas para mejorar el rendimiento en una lengua de bajos recursos como el feroes.

El modelo parte de la arquitectura Llama de SmolLM2 con 361.821.120 parametros (aproximadamente 360M), un tamano que lo situa en la categoria de modelos pequenos desplegables en hardware de consumo. La ventana de contexto usada durante el entrenamiento es de 2048 tokens. Los pesos se distribuyen en formato safetensors y el repositorio ocupa aproximadamente 0,7 GB.

Es relevante por su enfoque metodologico: demuestra una estrategia de transferencia interlinguistica mediante fusion de modelos (model merging con TIES) y CPT secuencial para lenguas de bajos recursos, un patron replicable para otros idiomas minoritarios. El autor indica explicitamente que el modelo esta pensado para su investigacion y que no ha sido evaluado de forma amplia. Esta es la semilla 3 de tres configuraciones de entrenamiento equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroes (`fo`); el modelo base es multilingue pero el ajuste se orienta a feroes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, heredada de SmolLM2-360M-Instruct. El entrenamiento se realizo en dos etapas sobre el corpus FineWeb-2: primero un ajuste sobre una fusion TIES con pesos iguales de los modelos entrenados con las porciones danesa e islandesa, y despues un ajuste adicional sobre la porcion feroesa. El modelo base declarado es `jekunz/smollm360m-da1-is1-ties`.

Los hiperparametros publicados son: 1 epoca por lengua de origen y 5 epocas en feroes, tasa de aprendizaje 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256), longitud maxima de contexto de 2048 tokens, semilla 3, y entrenamiento en una unica GPU A100 de 40 GB. No se documentan detalles sobre volumen total de tokens, composicion exacta del dataset, ni uso de RLHF, DPO o decodificacion especulativa.

La innovacion tecnica destacable es la combinacion de model merging (TIES) con continued pre-training secuencial para transferir capacidades entre lenguas escandinavas y una lengua de bajos recursos. No se mencionan tecnicas adicionales como atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en feroes, heredada del formato instruct de SmolLM2.
- Transferencia interlinguistica desde danes e islandes hacia feroes mediante fusion de pesos y CPT.
- Generacion de texto general (el modelo base SmolLM2-360M-Instruct soporta conversacion y respuestas a instrucciones).
- Capacidades multilingues limitadas: el ajuste se centra en feroes; el resto de idiomas no se ha evaluado.
- Soporte de tool calling / function calling: no disponible (no documentado para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de texto en feroes para prototipos de investigacion: el modelo permite experimentar con generacion en una lengua de bajos recursos y comparar el efecto de la transferencia desde danes e islandes frente a un entrenamiento directo.
- Aumento de datos sinteticos en feroes: puede generar frases y parrafos de apoyo para ampliar corpus de entrenamiento o evaluacion de otros sistemas en esa lengua, dado su bajo coste computacional.
- Experimentos de linguistica computacional: sirve como punto de partida para estudiar el impacto de la fusion TIES y del CPT secuencial en lenguas minoritarias, comparando con las otras semillas de la misma configuracion.
- Chatbot de bajo coste para demostraciones: con 360M parametros y contexto de 2048 tokens, puede desplegarse en una GPU de consumo para demos interactivas en feroes.
- Evaluacion de pipelines de ajuste fino: util como caso de referencia para validar flujos de entrenamiento con transformers, safetensors y TGI en entornos con una sola GPU.
- Investigacion sobre olvido catastrofico: permite analizar como el ajuste prolongado en feroes (5 epocas) afecta a las capacidades del modelo base en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB en precision completa (fp32/fp16) para 361,8M parametros; menos de 1 GB con cuantizacion de 8 o 4 bits (aunque no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia es viable en hardware mucho menor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, GTX 1660) e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers, text-generation-inference (TGI, segun los tags del repositorio) y endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-360M CPT feroes) | 361,8M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 361,8M | 2048 (documentado para el base) | Multilingue | Apache 2.0 | Hugging Face |
| jekunz/smollm360m-da1-is1-ties (modelo base de este ajuste) | ~361,8M | no disponible | Danes, islandes | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el autor advierte que no ha sido evaluado de forma general, por lo que su calidad en produccion es incierta.
- Riesgo de alucinacion: como modelo pequeno (360M) y con ajuste limitado, la probabilidad de generar contenido incorrecto o incoherente es alta.
- Cobertura idiomatica restringida: solo se declara feroes; el rendimiento en otros idiomas puede haberse degradado tras el CPT.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Sin datos publicados sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo no evaluado, el uso en produccion requiere validacion propia.
- Es una de tres semillas; los resultados pueden variar entre semillas y no se documenta la variabilidad.
- No se publican pesos cuantizados, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm360m-da1-is1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
