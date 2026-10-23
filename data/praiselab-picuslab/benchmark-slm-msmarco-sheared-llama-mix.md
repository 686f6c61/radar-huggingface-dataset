# praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-mix

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-mix` es un adaptador LoRA (formato PEFT, pesos safetensors) construido sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. No se trata de un modelo completo, sino de un artefacto de ajuste fino publicado dentro de una suite de evaluación de modelos de lenguaje pequenos (SLM), identificada en los metadatos como `benchmark-slm`, con la estrategia `mix` (`strategy-mix`) y el conjunto de datos `microsoft/ms_marco`. El pipeline declarado es `text-generation` y el unico idioma etiquetado es ingles.

El interes de esta publicacion es fundamentalmente metodologico: forma parte de una familia de adaptadores que permiten comparar el comportamiento de un mismo modelo base (Sheared-LLaMA-1.3B, una version podada de la familia LLaMA-2) frente a distintas combinaciones de datos y estrategias de entrenamiento. Por tanto, resulta util para investigadores que quieran reproducir o auditar experimentos de ajuste fino sobre tareas derivadas de MS MARCO (preguntas y respuestas, ranking de pasajes), mas que como modelo listo para produccion.

Conviene tener en cuenta dos limitaciones de partida: el repositorio esta marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo, y su tamano declarado es de 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente alojados o que el repositorio contiene unicamente configuracion y metadatos. La licencia no aparece indicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: Sheared-LLaMA-1.3B, derivado de LLaMA-2) |
| Parametros totales | No disponible para el adaptador; el modelo base Sheared-LLaMA-1.3B tiene 1.3B parametros (dato de la model card del base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base LLaMA-2 emplea 4096 tokens segun su model card |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA, la cuantizacion se aplica al modelo base tras fusionar los pesos (merge): fp16, int8 y 4-bit son viables tecnicamente, pero no se documentan en esta ficha |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | princeton-nlp/Sheared-LLaMA-1.3B |
| Tipo de adaptador | LoRA (libreria `peft`) |
| Dataset de entrenamiento | microsoft/ms_marco |
| Estrategia declarada | `mix` (tag `strategy-mix`) |
| Metodo / tag adicional | `or2` |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo LLaMA-2 con 1.3B parametros, obtenido mediante poda estructurada del modelo LLaMA-2 7B en el trabajo Sheared-LLaMA. Sobre esa base se aplica un ajuste fino parametro-eficiente con LoRA, cuyos pesos se distribuyen como adaptador independiente en formato safetensors dentro de la libreria `peft`. El adaptador no modifica la arquitectura: inyecta matrices de bajo rango en las capas del modelo base, de modo que en inferencia es necesario cargar primero Sheared-LLaMA-1.3B y despues el adaptador (o bien fusionar ambos).

En cuanto a los datos, los metadatos indican el uso del dataset `microsoft/ms_marco` junto con una estrategia etiquetada como `mix` y el tag `or2`. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de fases de RLHF o DPO, ni los hiperparametros de LoRA (rango, alpha, capas objetivo). Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion sobre estos puntos seria especulativa y no se incluye.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Sheared-LLaMA-1.3B.
- Ajuste orientado a tareas derivadas de MS MARCO, tipicamente preguntas y respuestas y ranking de pasajes; no se detalla la tarea exacta en la informacion disponible.
- Capacidad de operar como adaptador PEFT intercambiable: puede cargarse sobre el base y combinarse o compararse con otros adaptadores de la misma suite `benchmark-slm`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: unicamente ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Evaluacion comparativa de estrategias de ajuste fino: el adaptador sirve como punto de medida dentro de la suite `benchmark-slm`, permitiendo contrastar la estrategia `mix` sobre MS MARCO frente a otros adaptadores del mismo modelo base en condiciones controladas.
- Reproduccion de experimentos academicos: investigadores que trabajen con Sheared-LLaMA-1.3B pueden cargar el adaptador con `peft` y replicar los resultados del benchmark sin reentrenar.
- Generacion aumentada por recuperacion (RAG) en ingles: combinado con un indice sobre MS MARCO, el modelo puede formular respuestas a partir de pasajes recuperados, aprovechando que el ajuste se ha realizado sobre ese corpus.
- Reordenacion y refinamiento de respuestas en buscadores: al estar entrenado sobre datos de QA de MS MARCO, es adecuado para experimentos de generacion de respuestas cortas a partir de consultas.
- Analisis de sesgos y calidad en modelos pequenos: al ser un modelo de 1.3B ajustado con LoRA, permite estudiar como cambia el comportamiento del base tras un ajuste especifico con un coste computacional bajo.
- Prototipado en entornos con recursos limitados: al requerir poca VRAM (ver seccion de hardware), sirve para validar pipelines de inferencia en una sola GPU de consumo antes de escalar a modelos mayores.
- Docencia y formacion: util como ejemplo practico de flujo completo con PEFT (carga de base, aplicacion de adaptador, merge y evaluacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo modelo base, sin contar el adaptador, que anade unos pocos MB): aproximadamente 2.6 GB en fp16, 1.3 GB en int8 y 0.7-0.9 GB en cuantizacion de 4 bits. Estas cifras son estimaciones por tamano parametrico (1.3B), no medidas publicadas para este adaptador.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo en fp16 con comodidad; una RTX 3060, RTX 4060, RTX 3070/4070 o superiores son suficientes. GPU de datacenter (A100, H100, L40S) no son necesarias salvo para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: si. Con cuantizacion de 4 bits es viable incluso en iGPU y en CPU, dado el reducido tamano del base.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; `vLLM` y `TGI` para servir el modelo fusionado; `llama.cpp` / `Ollama` tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benchmark-slm-msmarco-sheared-llama-mix (esta ficha) | 1.3B (base) + adaptador LoRA | No disponible | Adaptador LoRA sobre Sheared-LLaMA-1.3B | No disponible | Gated en HuggingFace |
| princeton-nlp/Sheared-LLaMA-1.3B | 1.3B | 4096 (segun model card del base) | Modelo completo, podado de LLaMA-2 7B | Licencia LLaMA-2 (segun model card del base) | Publico en HuggingFace |
| TinyLlama-1.1B (proyecto TinyLlama) | 1.1B | 2048 (segun model card publica) | Modelo completo, entrenado desde cero sobre 3T tokens | Apache 2.0 (segun model card publica) | Publico en HuggingFace |
| Qwen2.5-1.5B | 1.5B | 32 768 (segun model card publica) | Modelo completo, multilingue | Apache 2.0 (segun model card publica) | Publico en HuggingFace |

Nota: los datos de los modelos comparables provienen de sus model cards publicas y no han sido verificados en la informacion proporcionada para esta ficha; se incluyen solo como referencia de categoria. No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de este adaptador frente a ellos.

## Limitaciones y advertencias

- Artefacto experimental: se trata de un adaptador LoRA de benchmark, no de un modelo afinado para produccion; no hay evidencia de evaluacion de calidad en la informacion disponible.
- Riesgo de alucinacion: inherente a un modelo de 1.3B derivado de LLaMA-2 y ajustado con LoRA sobre un corpus especifico; no se han publicado tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no documentados para este adaptador. El modelo base hereda los sesgos de los datos de preentrenamiento de LLaMA-2, no evaluados aqui.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta verificado y previsiblemente sera limitado.
- Limitacion de contexto: la longitud de contexto del adaptador no esta documentada; el base maneja 4096 tokens, por lo que conversaciones o documentos largos requeriran truncado o troceado.
- Licencia: no disponible. Al derivar de LLaMA-2, es probable que se apliquen las condiciones de la licencia comunitaria de Meta, pero esto no se confirma en la informacion proporcionada. Verificar antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede impedir la descarga automatizada en pipelines de CI/CD.
- Repositorio de 0.0 GB: comprobar que los pesos del adaptador estan realmente presentes antes de disenar un flujo de trabajo que dependa de ellos.
- Trazabilidad insuficiente: no se documentan hiperparametros de LoRA, numero de tokens, particiones de entrenamiento ni semillas, lo que dificulta la reproducibilidad estricta.
- Los resultados de busqueda web realizados no aportaron informacion tecnica relevante sobre este modelo; no se ha podido contrastar ningun dato con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-mix
- Modelo base: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Dataset utilizado: https://huggingface.co/datasets/microsoft/ms_marco
- Repositorio del modelo base (Sheared-LLaMA): https://github.com/princeton-nlp/Sheared-LLaMA
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este adaptador en la busqueda web realizada.
