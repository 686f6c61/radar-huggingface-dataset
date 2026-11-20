# ApolloRaines/Pythia-6.9B-DNP-500-Facts

## Resumen

Pythia-6.9B-DNP-500-Facts es un checkpoint derivado de EleutherAI/pythia-6.9b en el que el autor, ApolloRaines, ha implantado 500 hechos nuevos (correspondientes a 2023-2024, posteriores al corte de entrenamiento del modelo base) modificando directamente los pesos mediante descenso de gradiente sobre un subconjunto restringido de parametros. La tecnica, denominada Neural Reclamation y distribuida bajo la marca jBlaze, descongela unicamente la proyeccion de salida del MLP (`dense_4h_to_h`) de una banda de capas y congela el resto de la red.

El modelo resuelve un problema concreto: inyectar conocimiento factual sin adaptadores ni fine-tuning completo, preservando en gran medida las capacidades linguisticas del modelo original. Segun la model card, se consigue un recall de 499/500 hechos con un incremento de perplejidad en wikitext-2 del 3,81 % respecto al base y una mejora de 1,65 puntos porcentuales en LAMBADA.

Es relevante ahora porque la model card documenta de forma inusualmente transparente una correccion de afirmaciones previas (retirada del claim de "cero degradacion" y del de "mismo pipeline" que el modelo de 1.4B), e incluye un manifiesto de reconstruccion con procedencia completa. El checkpoint tiene 6.857.302.016 parametros y un repositorio de 27,4 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 6.857.302.016 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Pythia-6.9b, 2048 tokens segun el modelo base, no confirmado en la card) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | EleutherAI/pythia-6.9b |
| Metodo de edicion | Neural Reclamation (gradiente restringido sobre `dense_4h_to_h`, banda de capas [10..20] de 32) |
| Tamano del repositorio | 27,4 GB |
| Descargas | 1255 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-NeoX, un transformer decoder-only denso con atencion causal estandar, heredado integramente de EleutherAI/pythia-6.9b. No hay cambios estructurales: la edicion se limita a los pesos. Segun la model card, la modificacion se confina a la proyeccion de salida del MLP (`dense_4h_to_h`) de la banda de capas [10..20] de 32, seleccionada mediante una regla de "tercio central", y el sesgo (`bias`) queda intacto. El autor senala que esto es verificable diferenciando el checkpoint contra su base.

El proceso de entrenamiento no es un fine-tuning convencional ni un adaptador: es un bucle de optimizacion con descenso de gradiente sobre un conjunto de parametros restringido. La pipeline usa multiples pasadas con un mecanismo de autobalanceo: los hechos olvidados tienen perdida alta y reciben empuje fuerte, mientras que los ya aprendidos tienen perdida casi nula y apenas se tocan. El manifiesto `rebuild_manifest.json` registra ruta del base, fichero de hechos, `base_already_knew`, la banda exacta de capas, learning rate, numero de pasos, optimizador, dtype y tiempo de ejecucion. No se documenta el numero de tokens de entrenamiento ni la composicion del dataset de hechos mas alla de la descripcion cualitativa (lanzamientos de IA, eventos mundiales, resultados deportivos, avances cientificos).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Pythia-6.9b.
- Recuerdo de 500 hechos nuevos de 2023-2024 implantados en pesos: 499/500 con recall por prefijo y 499/500 en cualquier posicion.
- Razonamiento basico y conocimiento general del modelo base (no reforzado por esta edicion).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio.
- No se documentan capacidades de codigo o matematicas mas alla de las heredadas del base.

## Casos de uso

- Investigacion sobre edicion de conocimiento en pesos: el checkpoint sirve como artefacto reproducible para estudiar como un gradiente restringido a `dense_4h_to_h` altera el conocimiento factual sin tocar el resto de la red, con procedencia completa en el manifiesto.
- Evaluacion de tecnicas de inyeccion de conocimiento: util para comparar Neural Reclamation frente a LoRA o fine-tuning completo en terminos de recall frente a degradacion de perplejidad, usando las metricas publicadas (499/500 frente a +3,81 % PPL).
- Pruebas de control de alucinacion: al conocer exactamente que hechos se han implantado y cuales ya sabia el base (`base_already_knew`), permite disenar experimentos sobre fidelidad factual y generalization.
- Auditoria de integridad de pesos: la afirmacion de que la edicion se confina a `dense_4h_to_h` es falsable diferenciando el checkpoint contra el base, lo que lo hace util como caso de estudio de verificabilidad en modelos publicados.
- Docencia y divulgacion tecnica: ejemplo concreto de "weight-level surgery" para explicar la diferencia entre adaptadores, fine-tuning y edicion restringida de parametros.
- Reproduccion de resultados: con el manifiesto de reconstruccion, un equipo puede reejecutar la pipeline sobre el mismo base y fichero de hechos para validar las cifras de la card.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre el artefacto bfloat16 frente a EleutherAI/pythia-6.9b, con estadistica pareada. Harness: wikitext-2 con ventana deslizante (1024/512, ~200k tokens), LAMBADA con 5.153 items, recall con presupuesto de generacion 24.

| Metrica | Base | Este modelo |
|---|---:|---:|
| Recall (prefijo) | 1/500 | 499/500 |
| Recall (en cualquier posicion) | 9/500 | 499/500 |
| Perplejidad wikitext-2 | 8,7188 | 9,0508 (+3,81 %) |
| Precision LAMBADA | 67,126 % | 68,776 % (+1,65 pp) |

Delta de NLL por token pareado: +0,03737 con IC 95 % [+0,03533, +0,03941]. La mejora en LAMBADA es significativa con McNemar exacto p = 5,4e-07. El base ya respondia 1 de los 500 por prefijo y 9 en cualquier posicion, por lo que 499/500 equivale a 498 hechos genuinamente anadidos.

La card indica que estas cifras sustituyen a un 486/500 publicado anteriormente, cuyo artefacto medía +323,87 % de perplejidad en wikitext-2 y -41,35 pp en LAMBADA, y que ha sido reemplazado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 13,7 GB solo para pesos (6.857 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 15-16 GB para contexto corto.
- En cuantizacion de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5 GB (no se publican artefactos GGUF, la conversion seria a cargo del usuario).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) suficiente para bfloat16 a contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16; en RTX 3090 (24 GB) igualmente; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (soporte nativo, tag `text-generation-inference` y `endpoints_compatible`), TGI, vLLM; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Pythia-6.9B-DNP-500-Facts | 6,86 B | no disponible | Edicion de pesos restringida (500 hechos) | no disponible | Hugging Face |
| EleutherAI/pythia-6.9b (base) | 6,86 B | 2048 (segun modelo base) | Preentrenamiento estandar | Apache 2.0 (segun modelo base) | Hugging Face |
| ApolloRaines/Pythia-1.4B-DNP-500-Facts | ~1,4 B | no disponible | Misma familia, menor escala | no disponible | Hugging Face |
| ApolloRaines/Pythia-1.4b-Knowledge-Implant | ~1,4 B | no disponible | Prueba de concepto de 198 hechos | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria distintos de los publicados en la propia card frente a su base.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no se puede asumir uso comercial sin consultar al autor.
- Solo soporta ingles; el rendimiento en otros idiomas no esta evaluado.
- La perplejidad en wikitext-2 empeora un 3,81 % de forma medible (IC que excluye cero); el claim previo de "cero degradacion" fue retirado por el propio autor.
- El autor advierte que la mayoria de sus modelos publicos se dejan "intencionadamente a fuerza parcial" como prueba de concepto, no como producto final.
- La card ha corregido afirmaciones previas (metodo, cifras de recall y claim de escalado); conviene tratar con cautela cualquier afirmacion no respaldada por el manifiesto de reconstruccion.
- El conocimiento implantado son 500 hechos concretos; fuera de ese conjunto el modelo se comporta como el base, con corte de entrenamiento a principios de 2023.
- Riesgo de alucinacion presente como en cualquier modelo de 6,9 B de esta generacion; la edicion no lo mitiga.
- No se documentan mitigaciones de sesgo ni evaluaciones de seguridad.
- El checkpoint no incluye artefactos cuantizados ni GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Pythia-6.9B-DNP-500-Facts
- Modelo base: https://huggingface.co/EleutherAI/pythia-6.9b
- Pythia-1.4B-DNP-500-Facts: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-500-Facts
- Pythia-1.4b-Knowledge-Implant: https://huggingface.co/ApolloRaines/Pythia-1.4b-Knowledge-Implant
- Pythia-1.4B-jBlaze-Reasoning: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- jBlaze: https://jblaze.dev
