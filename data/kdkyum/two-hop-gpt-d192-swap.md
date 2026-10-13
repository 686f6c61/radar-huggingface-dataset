# kdkyum/two-hop-gpt-d192-swap

## Resumen

`kdkyum/two-hop-gpt-d192-swap` es un artefacto de investigacion publicado en HuggingFace por el usuario `kdkyum`: un conjunto de checkpoints de 18 ejecuciones de entrenamiento de un GPT decoder-only estilo GPT-NeoX, todas sobre una tarea sintetica de razonamiento de dos saltos (two-hop) construida a partir del subconjunto `c5_m16_N90/hetero_graphs_swap_6to1split1`. No es un modelo de proposito general, sino el material crudo de un experimento de investigacion sobre aprendizaje de relaciones compuestas en grafos heterogeneos.

La arquitectura es muy pequena: `d_model` 192, 12 capas, 6 cabezas de 32 dimensiones, MLP con ReLU, LayerNorm, sesgos lineales y rotary positional embeddings con base 100.000. El entrenamiento sigue en curso a 300.000 pasos y los checkpoints se anaden a medida que se escriben (cada 10.000 pasos). El modelo se distribuye con licencia MIT y pesos en formato safetensors, cargables mediante `GPTNeoXForCausalLM.from_pretrained`.

Su relevancia es exclusivamente academica: sirve para estudiar generalizacion composicional, el efecto del weight decay y de la semilla en una tarea controlada, y la diferencia entre calcular la perdida sobre todos los tokens o solo sobre los tokens de respuesta. No debe confundirse con un modelo de lenguaje utilizable en produccion, dado su tamano (del orden de millones de parametros) y su vocabulario y dominio sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX): d_model 192, 12 capas, 6 cabezas de 32, MLP con ReLU, LayerNorm, sesgos lineales, rotary embeddings (base 100.000), sin dropout |
| Parametros totales | Aproximadamente 5,4 M (la model card no lo indica de forma explicita; se deduce de la arquitectura, identica a la de kdkyum/family_latent_two_hop, que declara 5,4 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.149 tokens (`max_seq_len`); filas por documento completo |
| Tipos de cuantizacion | No disponibles (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponibles (entrenado sobre una tarea sintetica con vocabulario reducido) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga directa con `GPTNeoXForCausalLM.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo GPT-NeoX con `d_model` 192, 12 capas y 6 cabezas de atencion de 32 dimensiones, MLP con activacion ReLU, LayerNorm, sesgos en las capas lineales y rotary positional embeddings aplicados a todas las dimensiones de cabeza con base 100.000. No se usa dropout. Las filas de entrenamiento son documentos completos (`max_seq_len` 2.149), cada uno comenzando por `<bos>`; cada punto se codifica como `<bos>` y existe un token `<pad>` especifico para rellenar, que se rellena con otras frases de la misma familia. Se procesa un batch completo en cada paso.

El entrenamiento emplea AdamW (beta2 0,98, epsilon 1e-8) con learning rate 2e-4 precedido de un calentamiento de 1.000 pasos, constante hasta 200.000 pasos y con decaimiento lineal hasta 0 en 300.000. El recorte de gradiente se fija en norma 1 y el weight decay se aplica unicamente a las matrices de pesos y a los dos embeddings. El grid experimental cubre 18 ejecuciones cruzando tres ejes: `loss_on` (todos los tokens, frente a solo los dos tokens de nombre que siguen a "is", marcado como `_ansloss`), `weight_decay` (1, 3, 5) y `seed` (41, 42, 43). Se conserva un `config.json` con los argumentos de entrenamiento, el `vocab.json` y un `log.jsonl` con los registros de entrenamiento y evaluacion por ejecucion. La tarea de fondo es una prueba sintetica de razonamiento de dos saltos sobre un grafo heterogeneo con particion swap.

## Capacidades

- Generacion de texto autorregresiva limitada al dominio sintetico del experimento (completar documentos con separadores `<bos>`).
- Razonamiento de dos saltos (two-hop) sobre grafos heterogeneos sinteticos: resolver la composicion de dos relaciones encadenadas.
- Aprendizaje de relaciones con particion de tipo swap y de tipo family (conjuntos de familias disjuntos), util para estudiar generalizacion fuera de distribucion.
- Ablaciones controladas de calculo de perdida: variantes que optimizan todos los tokens frente a las que optimizan solo los tokens de respuesta (`_ansloss`).
- Reproducibilidad de hiperparametros: checkpoints por semilla y por valor de weight decay.
- No dispone de tool calling, function calling, agentes, vision, audio, thinking mode ni capacidades multilingues documentadas.

## Casos de uso

- Investigacion sobre razonamiento multi-hop: reproducir y extender el experimento de dos saltos sobre el subconjunto swap, comparando checkpoints a 10.000 pasos de granularidad para trazar la curva de aprendizaje de la composicion de relaciones.
- Ablaciones de calculo de perdida: usar los pares de ejecuciones con y sin `_ansloss` para medir cuanto aporta supervisar unicamente los tokens de respuesta frente a supervisar el documento completo.
- Estudio de sensibilidad a hiperparametros: emplear el grid de weight decay (1, 3, 5) para analizar su efecto sobre la generalizacion en una tarea de composicion de relaciones.
- Analisis de varianza por semilla: las semillas 41, 42 y 43 permiten estimar la variabilidad entre ejecuciones y distinguir mejoras reales de ruido de inicializacion.
- Punto de partida para fine-tuning en tareas sinteticas similares: al ser un modelo pequeno y con pesos safetensors, se puede recargar y reentrenar rapidamente en problemas de razonamiento de grafos con vocabulario reducido.
- Comparacion cruzada de arquitecturas de investigacion: contrastar este modelo `d192` (6 cabezas) con las variantes `d256` (4 cabezas) del mismo autor sobre el mismo subconjunto swap.
- Docencia y prototipado de bajo coste: servir de ejemplo minimo, ejecutable en CPU, de un ciclo completo de entrenamiento, evaluacion y publicacion de checkpoints con GPT-NeoX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente describe la tarea sintetica y el grid experimental, y el entrenamiento sigue en curso a 300.000 pasos. Los registros de entrenamiento y evaluacion estan accesibles en el `log.jsonl` de cada ejecucion, pero no se ofrecen cifras consolidadas en la documentacion.

## Requisitos de hardware

- VRAM estimada: con unos 5,4 M de parametros, aproximadamente 21,6 MB en FP32 y 10,8 MB en FP16/BF16. Cabe holgadamente incluso en memoria compartida de CPU.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o posterior; no requiere A100, H100 ni RTX 4090.
- Inferencia en consumer GPU: si, y tambien en CPU sin GPU dedicada, dado el tamano minimo del modelo.
- Nota sobre el repositorio: ocupa 2,5 GB porque incluye los checkpoints de las 18 ejecuciones (cada 10.000 pasos) junto con `config.json`, `vocab.json` y `log.jsonl`; ese peso corresponde al conjunto de artefactos, no al modelo individual.
- Opciones de despliegue: la carga esta documentada via `transformers` con `GPTNeoXForCausalLM.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo denso diminuto serian tecnicamente viables.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia seria practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kdkyum/two-hop-gpt-d192-swap | ~5,4 M (deducido) | 2.149 tokens | Two-hop sobre subconjunto swap (18 ejecuciones, training en curso) | MIT | HuggingFace |
| kdkyum/two-hop-gpt-hits | no disponible (arquitectura d256, 4 cabezas de dim 64) | 1.997 tokens en base_graph y 2.149 en swap_6to1split1 | Two-hop, variante d256 con filas de documento completo, wd 5 y lr 1e-4 o 2e-4 | no disponible | HuggingFace |
| kdkyum/family_latent_two_hop | 5,4 M (d_model 192, 6 cabezas, 12 capas) | no disponible | Tarea family_latent (128 familias x 16 miembros, vocab 155, split de reversión de relacion) | no disponible | HuggingFace |

No se han identificado en la busqueda modelos comparables de terceros de la misma categoria (modelos de investigacion de millones de parametros entrenados exclusivamente sobre tareas sinteticas de razonamiento multi-hop).

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de lenguaje de proposito general: no debe usarse en produccion ni en aplicaciones de cara al usuario.
- El entrenamiento sigue en curso (300.000 pasos); los checkpoints publicados son intermedios y pueden estar incompletos o superados.
- Dominio y vocabulario sinteticos: no hay evidencia de capacidades fuera de la tarea two-hop del grafo de entrenamiento.
- Idiomas soportados y composicion del dataset no documentados; no se puede asumir un comportamiento multilingue.
- Riesgo de alucinacion no evaluado en la informacion disponible; al tratarse de un modelo diminuto entrenado sobre datos sinteticos, la generacion libre fuera de distribucion carece de garantias.
- Sesgos: no documentados, pero el vocabulario y los datos sinteticos pueden introducir sesgos estructurales propios del conjunto de grafos.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no resulta util para ello por su naturaleza experimental; conviene verificar la licencia de los datos originales del conjunto de grafos, que no se detalla.
- Caveat de reproducibilidad: los resultados dependen del grid de semillas y weight decay; las comparaciones entre checkpoints deben respetar esas condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d192-swap
- Modelo relacionado (variante d256): https://huggingface.co/kdkyum/two-hop-gpt-hits
- Modelo relacionado (misma arquitectura d192): https://huggingface.co/kdkyum/family_latent_two_hop
- Proyecto de WandB mencionado en la model card: `gpt-two-hop-d192-trainpy` (sin enlace directo disponible)
- Papers, blogs o demos: no disponibles en la informacion proporcionada
