# aestudio/gemma-4-31B-it-GRPO-math-lora-gen10

## Resumen

`aestudio/gemma-4-31B-it-GRPO-math-lora-gen10` es un adaptador LoRA sobre el modelo instructivo `google/gemma-4-31B-it`, entrenado con GRPO (Group Relative Policy Optimization, una variante de RL con recompensa verificable) sobre el dataset DeepMath-103K. El objetivo concreto es mejorar la resolucion de problemas de matematicas mediante refuerzo con una recompensa de correccion programatica, sin degradar el seguimiento de instrucciones ni alargar las respuestas.

Es un checkpoint temprano (generacion 10) de la misma ejecucion que produjo el adaptador final `aestudio/gemma-4-31B-it-GRPO-math-lora` (generacion 39). El autor lo publica como un paso intermedio deliberadamente mas pequeno: rinde aproximadamente la mitad de la mejora del checkpoint final, manteniendo las longitudes de respuesta y el seguimiento de instrucciones del modelo base inalterados. Sobre 1.000 problemas retenidos de DeepMath logra un pass@1 de 0,691 frente al 0,629 del base, una diferencia emparejada de +0,063 (IC 95 % [+0,044, +0,081]).

No es un modelo fusionado: requiere descargar el modelo base y aplicar el adaptador. El adaptador solo modifica el decodificador de texto (proyecciones `q/k/v/o/gate/up/down_proj` bajo `language_model`), por lo que la torre de vision es la del base. El modo "thinking" del modelo base nunca se activo durante el entrenamiento ni la evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-31B-it`; solo afecta al decodificador de texto (`q/k/v/o/gate/up/down_proj` bajo `language_model`). Arquitectura del modelo base: no especificada en la model card |
| Parametros totales | Modelo base de 31B (segun el identificador del modelo); tamano del repositorio del adaptador: 3,9 GB |
| Parametros activos | No aplica: es un adaptador LoRA, no una arquitectura MoE |
| Longitud de contexto | No disponible para el adaptador; las evaluaciones usaron un limite de 16.384 tokens |
| Tipos de cuantizacion | Adaptador distribuido en safetensors; se recomienda fusionar en bf16 (`merge_and_unload()`). Opciones de cuantizacion dependen del modelo base |
| Idiomas soportados | No disponibles (el autor no documenta idiomas; el adaptador hereda las capacidades linguisticas del base) |
| Licencia | apache-2.0 (declarada para el adaptador; el modelo base Gemma tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con GRPO y una recompensa de correccion verificable sobre DeepMath-103K. El procedimiento de filtrado es relevante para entender su comportamiento: los problemas de DeepMath se filtraron segun el exito del propio modelo base, muestreando cada uno 8 veces a temperatura 1,0 y conservando solo aquellos que el base resolvia entre 1 y 7 veces de 8. El resto (los que resuelve siempre, la mayoria, o los que no resuelve nunca) se descarto por no ofrecer senal util para el aprendizaje por refuerzo. El conjunto filtrado se dividio en un pool de entrenamiento de 6.247 problemas, un conjunto de seleccion de 1.000 y un conjunto de test de 1.000.

El autor documenta una innovacion de despliegue importante: el LoRA en tiempo de ejecucion de vLLM infraaplica este adaptador. En vLLM 0.28 con Gemma 4, servir el LoRA mediante `LoRARequest` recupera solo entre el 75 % y el 80 % de su efecto, y la diferencia se localiza en las proyecciones de atencion. Todas las cifras de la model card se midieron con el adaptador fusionado en los pesos del base (bf16, `merge_and_unload()`), lo que reproduce el forward pass del entrenador con el redondeo de bf16. Con transformers + PEFT sin fusionar no se requiere ningun cambio. El modo "thinking" nunca se activo, ni en entrenamiento ni en evaluacion.

## Capacidades

- Razonamiento matematico: resolucion de problemas de matematicas con respuesta final delimitada en `\boxed{}`, afinada especificamente sobre DeepMath-103K mediante refuerzo con recompensa verificable.
- Generacion de texto general y seguimiento de instrucciones: mantiene el rendimiento del base en IFBench (300 prompts, 58 restricciones verificables fuera de distribucion), sin regresion.
- Respuestas de longitud controlada: en IFBench las respuestas no son mas largas que las del base (diferencia emparejada de -36 tokens, mediana de 126 tokens en ambos).
- Soporte multimodal heredado: la torre de vision es la del modelo base y no se modifica, por lo que cualquier capacidad visual del base permanece intacta.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta comportamiento agentico ni razonamiento multi-paso mas alla del razonamiento matematico implicito en la generacion de soluciones.
- Capacidades multilingues: no documentadas por el autor.
- Modo "thinking": no soportado por el adaptador; debe renderizarse siempre con `enable_thinking=False`.

## Casos de uso

- Evaluacion comparativa de tecnicas de RL para matematicas: sirve como checkpoint intermedio para estudiar la curva de mejora entre la generacion 10 y la 39 (0,691 frente a 0,758 de pass@1 en el conjunto de test), util en investigacion sobre GRPO y RLVR.
- Generacion de soluciones matematicas con respuesta verificable: el modelo produce una respuesta final en `\boxed{}` que puede extraerse y validarse automaticamente con `math-verify`, lo que encaja en pipelines de evaluacion automatizada.
- Investigacion sobre seguimiento de instrucciones durante el RL: permite comprobar que el ajuste por recompensa matematica no degrada el cumplimiento de restricciones, algo relevante para estudiar el equilibrio entre capacidades.
- Fine-tuning incremental: al ser un adaptador LoRA de 3,9 GB sobre el base, se puede continuar el entrenamiento desde este punto en lugar de desde cero, reduciendo coste de computo.
- Experimentos de despliegue con PEFT: util para comparar en condiciones controladas el comportamiento del adaptador fusionado frente al LoRA en tiempo de ejecucion de vLLM (que recupera solo el 75-80 % del efecto).
- Docencia y demostraciones de RL con recompensa verificable: un ejemplo reproducible de pipeline GRPO + LoRA con datos y protocolo de evaluacion publicados.
- No se recomienda para aplicaciones de produccion sensibles a la precision sin validar primero su comportamiento fuera del dominio DeepMath, dado que es un checkpoint temprano.

## Benchmarks y rendimiento

Conjunto de test retenido, 1.000 problemas (una lectura por modelo; todos los datos emparejados sobre problemas identicos con IC bootstrap del 95 %, 10.000 remuestreos; n = 4 muestras por problema; temperatura 1,0, top_p 0,95, top_k 64; limite de 16.384 tokens; thinking desactivado):

| Modelo | pass@1 | Delta emparejado vs base |
|---|---:|---|
| `gemma-4-31B-it` (base) | 0,629 | — |
| Este adaptador (generacion 10) | 0,691 | +0,063 [+0,044, +0,081] |
| Generacion 39 (release final) | 0,758 | +0,129 [+0,108, +0,151] |

Conjunto de seleccion, 1.000 problemas (protocolo identico):

| Generacion | base | 10 | 20 | 30 | 39 |
|---|---:|---:|---:|---:|---:|
| pass@1 | 0,619 | 0,697 | 0,732 | 0,749 | 0,761 |
| Delta emparejado vs base | — | +0,078 [+0,059, +0,097] | +0,113 | +0,130 | +0,142 |

Segun el autor, el base resuelve aproximadamente el 88 % de DeepMath en su conjunto, por lo que las cifras absolutas no son representativas del dataset completo (los conjuntos se filtraron por dificultad).

IFBench (300 prompts, 58 restricciones verificables fuera de distribucion; evaluacion programatica sin juez LLM; n = 4):

| Modelo | Estricto a nivel de prompt | Delta emparejado | Laxo a nivel de prompt | Delta emparejado |
|---|---:|---|---:|---|
| base | 0,499 | — | 0,546 | — |
| Este adaptador (generacion 10) | 0,505 | +0,006 [-0,008, +0,020] | 0,550 | +0,004 [-0,009, +0,018] |

El autor advierte que estas cifras de IFBench usan n = 4 y temperatura 1,0, no el protocolo habitual de IFBench, por lo que no son comparables con las puntuaciones publicadas en leaderboards. El texto de la model card queda cortado al final, por lo que no se dispone de la comparacion completa con otros checkpoints en ese punto.

## Requisitos de hardware

- El adaptador se apoya en `google/gemma-4-31B-it`; los requisitos de VRAM vienen determinados por el modelo base, no por el adaptador, que ocupa 3,9 GB en disco.
- Estimacion para el base de 31B en bf16: en torno a 62 GB de pesos mas cache KV; requiere una GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPU.
- En cuantizacion de 8 bits: aproximadamente 31 GB de pesos, cabe en A100 80 GB o H100 80 GB con contexto amplio.
- En cuantizacion de 4 bits: aproximadamente 16-18 GB de pesos, por lo que puede caber en una RTX 4090 de 24 GB o similar, con contexto reducido.
- Para despliegue en produccion con vLLM: segun el autor, hay que fusionar el adaptador en el base (`merge_and_unload()`) antes de servir, porque el LoRA en tiempo de ejecucion de vLLM 0.28 solo recupera el 75-80 % del efecto.
- Con transformers + PEFT sin fusionar no se necesita ningun ajuste adicional.
- Opciones de despliegue compatibles: vLLM (fusionando), transformers + PEFT. No se documentan otras opciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (test DeepMath) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gen 10) | 31B (base) | No disponible (evaluado a 16.384) | pass@1 0,691 | apache-2.0 (adaptador) | HuggingFace; 0 descargas, 0 likes |
| Generacion 39 (`aestudio/gemma-4-31B-it-GRPO-math-lora`) | 31B (base) | No disponible | pass@1 0,758 | No disponible en los datos aportados | HuggingFace |
| `google/gemma-4-31B-it` (base) | 31B | No disponible | pass@1 0,629 | No disponible en los datos aportados | HuggingFace |

No se dispone de datos para comparar con modelos de otros proveedores de la misma categoria a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint temprano (generacion 10), con aproximadamente la mitad de la mejora del release final (generacion 39): +0,063 frente a +0,129 de delta emparejado en el conjunto de test.
- Las cifras absolutas de pass@1 no son representativas de DeepMath en su conjunto, ya que los conjuntos se filtraron por dificultad segun el exito del modelo base.
- En el conjunto de test, el adaptador pierde 28 problemas que el base resolvia al menos 3 de cada 4 veces y gana 71 que el base resolvia como mucho 1 de cada 4, por lo que la mejora es neta pero no uniforme.
- Riesgo de alucinacion: no se documenta de forma explicita; las respuestas truncadas, sin `\boxed{}` o en bucle puntuan 0 en la evaluacion, lo que sugiere fragilidad en la generacion de respuestas validas ante problemas fuera de dominio.
- El adaptador no ha sido entrenado ni evaluado con el modo "thinking" del base; activarlo puede producir comportamientos no previstos. Se debe renderizar siempre con `enable_thinking=False`.
- El formato de prompt esta fijado: un unico turno de usuario con el problema, seguido de una linea en blanco y la instruccion `Put your final answer within \boxed{}.`; sin prompt de sistema. Desviarse de este formato puede degradar el rendimiento.
- Restricciones de licencia: el adaptador declara apache-2.0, pero el modelo base Gemma tiene su propia licencia, que debe verificarse por separado para uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- En produccion con vLLM, servir el LoRA sin fusionar reduce su efecto al 75-80 %.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aestudio/gemma-4-31B-it-GRPO-math-lora-gen10
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Release final (generacion 39): https://huggingface.co/aestudio/gemma-4-31B-it-GRPO-math-lora
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- IFBench (repositorio): https://github.com/allenai/IFBench
