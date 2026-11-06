# kristobalus/Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF

## Resumen

Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF es un modelo borrador (draft model) para decodificación especulativa, publicado por el usuario kristobalus en Hugging Face. No es un modelo de lenguaje generalista, sino un componente auxiliar que acelera la inferencia del modelo objetivo Ternary-Bonsai-2-27B, un transformer ternario de 27.000 millones de parámetros (del que este repositorio no distribuye los pesos completos). El borrador incorpora una cabeza LM propia limitada a los 98.304 tokens más frecuentes, siguiendo la técnica FR-Spec, en lugar de reutilizar la cabeza completa de 248.320 filas del modelo objetivo.

La innovación principal es que la cabeza del borrador lee entre 2,5 y 3 veces menos bytes por ronda especulativa, lo que reduce el coste del grafo de draft, históricamente el cuello de botella en este tipo de decodificación. Según las mediciones preliminares del autor en un Mac mini M4 de 16 GB, el borrador aporta una mejora de throughput de entre el 3,5 % y el 3,8 % respecto al borrador original, con una tasa de aceptación de tokens del 0,636-0,642. El método es lossless: el modelo objetivo verifica cada token contra su vocabulario completo, de modo que las salidas no cambian.

El repositorio contiene únicamente los pesos GGUF del borrador (1,25-1,28 GB según variante), cuantizados en Q4_K_M, y está pensado para ejecutarse junto al modelo objetivo en builds de llama.cpp que soporten el tipo PQ2_0 y el vocabulario de draft DFlash2. La licencia es Apache-2.0, heredada de ambos modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa (DFlash2) con cabeza LM reducida (FR-Spec) |
| Parametros totales | 2.343.916.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el borrador hereda el contexto del modelo objetivo) |
| Tipos de cuantizacion | Q4_K_M (pesos del borrador); la cabeza de draft mantiene las filas del objetivo en PQ2_0 |
| Idiomas soportados | No disponibles (el vocabulario de draft se construyó con corpus en ruso cirílico, inglés y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de tipo DFlash2, diseñado para proponer secuencias de tokens que el modelo objetivo Ternary-Bonsai-2-27B verifica después en bloque. La particularidad arquitectónica es que incorpora su propia cabeza de lenguaje (output.weight) sobre un vocabulario reducido de 98.304 tokens, junto con un mapa d2t (draft id → target id) que traduce los identificadores del vocabulario reducido a los del vocabulario completo del objetivo. La entrada del borrador se rota mediante la transformada de Hadamard del modelo objetivo.

El vocabulario reducido se construyó a partir de los 33 tokens de control más los tokens de mayor frecuencia según un ranking que combina cuatro corpus públicos de 20 millones de caracteres cada uno (fineweb-2 rus_Cyrl, fineweb-edu sample-10BT, codeparrot-clean-valid y ultrachat_200k) y las respuestas del propio Bonsai-2 a prompts de prueba, normalizados por tamaño y tokenizados con el tokenizador GGUF. El ranking se rellenó hasta un múltiplo de 32 por id de token. No se dispone de información sobre el número de tokens de entrenamiento del borrador ni sobre si se aplicaron técnicas de RLHF o DPO; el autor describe el proceso de construcción del vocabulario y los scripts, pero no el entrenamiento del cuerpo del borrador, que proviene de ProCreations/Ternary-Bonsai-2-27B-DFlash2.

La técnica FR-Spec (Zhao et al., arXiv 2502.14856) es la base metodológica: restringir la cabeza del borrador a los tokens más frecuentes reduce el coste de memoria y de cómputo del grafo de draft sin afectar a la corrección de la salida, ya que el verificador del objetivo opera siempre sobre el vocabulario completo. Un token ausente del vocabulario de draft solo penaliza la tasa de aceptación, no la calidad final.

## Capacidades

- Decodificación especulativa: genera propuestas de tokens que el modelo objetivo verifica en bloque, acelerando la inferencia del objetivo.
- Cabeza LM reducida con mapa d2t: traduce entre el vocabulario de draft (98.304 tokens) y el vocabulario completo del objetivo (248.320 tokens).
- Cobertura de vocabulario del 99,32 % (variante dv98304) y del 99,56 % (variante dv81920) sobre 110.000 tokens generados, medida como proporción de tokens elegidos por el objetivo que están dentro del vocabulario de draft.
- Soporte de decodificación sin pérdida: la verificación del objetivo garantiza que las salidas coincidan con las del modelo sin borrador; a temperatura 0 todas las salidas medidas coincidieron.
- Compatibilidad con llama.cpp: requiere una build con soporte del tipo PQ2_0 y del vocabulario de draft DFlash2 (d2t y output.weight dentro del GGUF del borrador).
- Integración mediante los parámetros -md <fichero> --spec-type draft-dflash junto al modelo objetivo -m Ternary-Bonsai-2-27B-PQ2_0.gguf.
- No dispone de capacidades propias de generación autónoma, tool calling, agentes, visión ni audio: es un componente auxiliar, no un modelo de propósito general.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: el borrador está optimizado y medido en un Mac mini M4 de 16 GB, donde aporta entre un 3,5 % y un 3,8 % de throughput adicional sobre el borrador original con un coste extra de memoria Metal de 106-127 MiB. Es adecuado para despliegues locales en hardware de Apple con memoria unificada limitada.
- Servicio de chat de baja latencia: al reducir los milisegundos por ronda especulativa de 110,98 a 107,21-107,65 ms, mejora el tiempo hasta el primer token percibido en aplicaciones conversacionales servidas con llama.cpp y el modelo objetivo.
- Generación de código en pipelines locales: la variante dv98304 está recomendada por el autor por su menor tasa de fallos en vocabulario poco frecuente (código fuera de Python y LaTeX), lo que la hace adecuada para asistentes de código ejecutados en estaciones de trabajo.
- Evaluación comparativa de técnicas de decodificación especulativa: el repositorio incluye scripts (make_dvocab_gguf.py), rankings de vocabulario y datos de medición que permiten reproducir y comparar variantes de vocabulario de draft en investigación sobre FR-Spec.
- Despliegue en entornos con restricciones de memoria: con 1,25-1,28 GB de pesos Q4_K_M y un incremento de memoria Metal de ~106-127 MiB, el borrador cabe junto al objetivo en configuraciones de 16 GB de memoria unificada, algo relevante para prototipado en portátiles y mini-PC.
- Investigación sobre vocabularios reducidos: la construcción del ranking a partir de corpus multilingües y de código permite estudiar el equilibrio entre cobertura de vocabulario y velocidad de draft en distintos dominios.

## Benchmarks y rendimiento

Mediciones preliminares del autor en Mac mini M4 de 16 GB, con el objetivo Ternary-Bonsai-2-27B-PQ2_0.gguf, verificación en bloque, KV del borrador en f16, 1 cliente, 512 tokens por petición, orden A B C C B A, 72 peticiones por brazo e intervalos de confianza al 95 %:

| Borrador | Tokens/s | Aceptación | ms por ronda | Grafo de draft (8 filas) |
|---|---:|---:|---:|---:|
| Original (cabeza completa del objetivo) | 23,44 | 0,624 | 110,98 | 18,78 ms |
| dv81920 | 24,32 (+3,8 % [+1,9; +5,7]) | 0,636 | 107,21 | 15,06 ms |
| dv98304 | 24,26 (+3,5 % [+1,5; +5,6]) | 0,642 | 107,65 | 15,45 ms |

Datos adicionales: cobertura del vocabulario de draft del 99,32 % (dv98304) y 99,56 % (dv81920) sobre 110.000 tokens generados. A temperatura 0 todas las salidas coincidieron; la única divergencia observada fue entre dos ejecuciones del borrador original en un empate casi exacto (margen top-1 vs top-2 de 0,006 nat). Memoria Metal adicional: +106 MiB (dv81920) y +127 MiB (dv98304).

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es un componente de aceleración y no un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM/memoria: los pesos del borrador ocupan 1,28 GB (dv98304) y 1,25 GB (dv81920) en Q4_K_M; el incremento de memoria Metal medido es de +127 MiB y +106 MiB respectivamente.
- GPU recomendadas: el autor solo ha medido en Apple Silicon (Mac mini M4 de 16 GB). No hay datos publicados para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque no se han publicado mediciones en GPUs de consumo; el requisito real es ejecutar también el modelo objetivo de 27B, que condiciona la memoria total.
- Opciones de despliegue: llama.cpp con una build que soporte el tipo PQ2_0 y el vocabulario de draft DFlash2 (d2t, output.weight). La build mainline de llama.cpp no se probó y probablemente no carga estos ficheros. No hay soporte documentado para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 107,21-107,65 ms por ronda especulativa y 24,26-24,32 tokens/s en el hardware medido, frente a 110,98 ms y 23,44 tokens/s del borrador original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario de draft | Licencia | Formato | Rendimiento medido |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-DFlash2-dv98304 (este) | 2,34 B | No disponible | 98.304 | Apache-2.0 | GGUF | 24,26 tok/s, aceptación 0,642 |
| Ternary-Bonsai-2-27B-DFlash2-dv81920 (mismo autor) | 2,34 B | No disponible | 81.920 | Apache-2.0 | GGUF | 24,32 tok/s, aceptación 0,636 |
| DFlash2 original (cabeza completa del objetivo) | No disponible | No disponible | 248.320 (completo) | Apache-2.0 | GGUF | 23,44 tok/s, aceptación 0,624 |

No se dispone de información sobre otros borradores de decodificación especulativa comparables (EAGLE, Medusa u otros) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo repositorio y al borrador original.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Ternary-Bonsai-2-27B-PQ2_0.gguf y una build específica de llama.cpp; no puede usarse de forma independiente.
- Compatibilidad limitada: la build mainline de llama.cpp no se ha probado y probablemente no carga estos ficheros; se necesita soporte de PQ2_0 y del vocabulario de draft DFlash2.
- Mediciones preliminares: los resultados provienen de una sola máquina (Mac mini M4 de 16 GB), 6 prompts y 72 peticiones por brazo; el propio autor los califica de preliminares, por lo que la generalización a otros hardware y cargas es incierta.
- Sesgos: no hay información publicada sobre sesgos del borrador; al ser un componente auxiliar, los sesgos del sistema recaen principalmente en el modelo objetivo.
- Riesgo de alucinación: no aplica de forma directa, ya que el objetivo verifica todos los tokens; el borrador solo afecta a la tasa de aceptación, no al contenido generado.
- Cobertura de vocabulario incompleta: entre el 0,44 % y el 0,68 % de los tokens elegidos por el objetivo quedan fuera del vocabulario de draft, lo que reduce la aceptación en dominios con vocabulario poco frecuente (código fuera de Python, LaTeX).
- Idiomas: no se declaran idiomas soportados; el ranking de vocabulario incluyó corpus en ruso cirílico e inglés, pero no hay evaluación multilingüe publicada.
- Licencia: Apache-2.0 permite uso comercial, pero el despliegue está condicionado por la licencia y los requisitos del modelo objetivo, que deben verificarse por separado.
- Repositorio con muy poca tracción: 119 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kristobalus/Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF
- Modelo base (cuerpo del borrador): https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Modelo objetivo (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Paper FR-Spec (Zhao et al.): https://arxiv.org/abs/2502.14856
