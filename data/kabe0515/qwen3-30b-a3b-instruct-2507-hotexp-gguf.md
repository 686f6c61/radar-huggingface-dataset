# kabe0515/Qwen3-30B-A3B-Instruct-2507-HOTEXP-GGUF

## Resumen

HOTEXP es una cuantización GGUF experimental del modelo Qwen3-30B-A3B-Instruct-2507 (Qwen team, Apache-2.0), publicada por el usuario kabe0515 (kabedayo). No se trata de un modelo nuevo, sino de una optimización de despliegue para llama.cpp: en lugar de mover capas completas de expertos MoE a la CPU (opción `--n-cpu-moe` del llama.cpp estándar), HOTEXP divide los expertos de cada capa en dos ramas, "calientes" (los que el workload enruta con más frecuencia, que se quedan en la GPU) y "frías" (el resto, que van a la CPU), dentro de un único fichero GGUF y con un grafo de dos ramas.

El modelo base es un transformer MoE de Qwen con 34.156.025.856 parámetros totales (≈34,2 B) y aproximadamente 3 B activos por token, con licencia Apache-2.0. La innovación de HOTEXP es puramente de inferencia: un histograma de uso de expertos medido sobre Wikipedia japonesa (163.840 tokens, routing fp16) muestra que el 6% de expertos más usados por capa ya cubre el 40,7% de las selecciones, lo que permite asignar presupuesto de VRAM a los expertos realmente utilizados.

Es relevante ahora porque permite ejecutar un MoE de 34 B en tarjetas consumer de 4-6 GB con una cobertura del 66-82% de las selecciones de expertos en GPU, a costa de requerir un llama.cpp parcheado. Los GGUFs publicados son dos: HOTEXP (3,00 GiB de expertos calientes, 1.747 de 6.144 slots, 82,0% de cobertura) y HOTEXP-4G (1,75 GiB, 1.019 slots, 66,4% de cobertura, verificado en una RTX 3050 Laptop de 4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3-30B-A3B-Instruct-2507) con grafo de dos ramas hot/cold para expertos |
| Parametros totales | 34.156.025.856 (≈34,2 B) |
| Parametros activos | ≈3 B (MoE, segun nomenclatura "A3B" del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (unica publicada, con imatrix) |
| Idiomas soportados | no disponible (histograma medido sobre Wikipedia japonesa) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), requiere parche `02-hotexp.patch` + `01-mtp.patch` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de Qwen, con 34,2 B de parámetros totales y unos 3 B activos por token. HOTEXP no reentrena ni modifica los pesos: parte de la cuantización IQ3_XXS (con imatrix) del modelo base y reorganiza los tensores de expertos en el GGUF. Por capa, las porciones "calientes" se almacenan como `blk.N.ffn_*_exps_hot.weight`, las "frías" conservan los nombres originales, y cuatro tablas pequeñas (`ffn_hot_local`, `ffn_cold_local`, `ffn_hot_mask`, `ffn_cold_mask`) mapean los identificadores globales de experto a identificadores locales de rama.

El grafo de inferencia calcula el routing (softmax + top-k) una sola vez, como en el llama.cpp estándar; después cada rama ejecuta su propio `mul_mat_id` con identificadores y pesos locales (peso hot = peso × máscara, cold = el resto) y las salidas se suman. En la rama CPU se introduce un nuevo operador ggml, `GGML_OP_MUL_MAT_ID_MASKED`, que omite los pares con peso cero en lugar de calcularlos. Cada tensor de rama lleva 8 expertos ficticios a cero para evitar que los slots foráneos colapsen sobre el experto 0 (necesario porque la ruta CUDA MMQ asume un uso por experto y token; sin esto el prefill corrompe memoria). La salida de CPU se verificó token-idéntica al modelo base.

La asignación hot/cold se calcula con un greedy global sobre conteos marginales de uso de expertos, medidos con routing fp16 sobre 163.840 tokens de Wikipedia japonesa. El autor indica que afinar la asignación aporta solo ≈+1 punto de cobertura; el verdadero dial es el presupuesto de bytes destinado a expertos calientes.

## Capacidades

- Generación de texto conversacional en el modelo base Qwen3-30B-A3B-Instruct-2507 (hereda sus capacidades, no verificadas de forma independiente en esta ficha).
- Razonamiento y matemáticas: no disponible de forma específica en la información proporcionada.
- Generación de código: no disponible de forma específica en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el único dato es que el histograma de expertos se midió sobre Wikipedia japonesa.
- Capacidad especial del empaquetado: división hot/cold de expertos con cobertura configurable (82,0% con 3,00 GiB, 66,4% con 1,75 GiB) y decodificación exacta respecto al modelo base en la rama CPU.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso vía `llama-server`, pero no se detalla más.

## Casos de uso

- Despliegue de un MoE de 34,2 B en GPU consumer de 6 GB: con el split HOTEXP (3,00 GiB de expertos calientes, 82,0% de cobertura), un equipo con GTX 1060 6GB puede servir el modelo manteniendo la mayoría de selecciones de expertos en GPU.
- Inferencia en portátiles con 4 GB de VRAM: el split HOTEXP-4G (1,75 GiB, 66,4% de cobertura) fue verificado en una RTX 3050 Laptop (WSL2), con el uso total de tarjeta dentro de los 4 GB.
- Servicio conversacional de baja concurrencia: `llama-server` con `-ngl 99` y `-ot 'blk\..*\.ffn_(gate|down|up)_exps\.weight=CPU'` expone el modelo como endpoint compatible, útil para prototipos y demos internas.
- Aceleración de prefill en GPUs con CPU lenta: en Tesla V100 32GB el prefill pasó de 21,9 a 76,1 tok/s (3,47×), lo que favorece cargas con prompts largos (RAG, resúmenes de documentos) cuando la GPU es potente respecto a la CPU.
- Investigación sobre routing de MoE: los scripts `expert_hist.py` y `split_hot_experts.py` permiten medir el histograma de uso de expertos en un corpus propio y reconstruir el split con otro presupuesto de bytes.
- Experimentación con decodificación multi-token: el parche `01-mtp.patch` incluye el soporte MTP/nextn para esta arquitectura, base del trabajo HOTEXP, y el autor publica además un GGUF MTP companion para el mismo modelo base.
- Benchmarking de técnicas de offload selectivo: comparar `--n-cpu-moe` (por capas) frente a la división por experto de HOTEXP en distintos hardware y workloads.

## Benchmarks y rendimiento

Mediciones del autor: misma sesión, decodificación greedy, 256 tokens, IQ3_XXS, prompt fijo (texto de historia de la IA en japonés). La base del portátil es su mejor ajuste `n-cpu-moe` (40).

| Dispositivo | Decode base | Decode HOTEXP | Prefill base | Prefill HOTEXP |
|---|---|---|---|---|
| Tesla V100 32GB (escritorio) | 22,26 tok/s | 33,41 tok/s (1,50×) | 21,9 tok/s | 76,1 tok/s (3,47×) |
| GTX 1060 6GB (escritorio) | 23,76 tok/s | 20,61 tok/s (0,87×) | 58,3 tok/s | 72,6 tok/s (1,25×) |
| RTX 3050 Laptop 4GB (WSL2) | 10,08 tok/s | 9,78 tok/s (0,97×) | 32,7 tok/s | 13,7 tok/s (0,42×) |

Advertencias del propio autor: la pareja en V100 se midió con otro job ocupando parte de la CPU, lo que deprime la pierna base (su decode limpio es ≈33,5 tok/s); la ganancia de decode en V100 es positiva pero "favorecida", mientras que la de prefill es estructural. En GPUs pequeñas la ganancia de decode desaparece por la sincronización GPU/CPU por capa y la ruta débil de `mul_mat_id`, y en el portátil de 4 GB la rama CPU enmascarada hace el prefill más lento. Cada configuración se midió una vez por dispositivo; el segundo dígito debe tratarse como ruido.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF IQ3_XXS completo ocupa 13.632.706.848 B (≈12,7 GiB); el split HOTEXP reserva 3,00 GiB para expertos calientes y el resto queda en CPU. El split HOTEXP-4G reserva 1,75 GiB y está verificado en una tarjeta de 4 GB.
- GPU recomendadas: Tesla V100 32GB (mejor resultado medido, 33,41 tok/s de decode y 76,1 tok/s de prefill), GTX 1060 6GB (72,6 tok/s de prefill, decode ligeramente peor que la base), RTX 3050 Laptop 4GB (funciona, pero prefill cae a 13,7 tok/s).
- ¿Cabe en GPU consumer? Sí, con el split adecuado: 6 GB con HOTEXP y 4 GB con HOTEXP-4G. No se proporcionan datos para tarjetas de 8 GB o más, aunque presumiblemente admitirían un presupuesto de expertos calientes mayor.
- Opciones de despliegue: exclusivamente llama.cpp parcheado. Requiere clonar `ggml-org/llama.cpp`, hacer checkout del commit `1ab7e5ad2d4e7295c94c3b966a3e0b70fa365865`, aplicar `01-mtp.patch` y después `02-hotexp.patch`, y compilar con `-DGGML_CUDA=ON` los objetivos `llama-server` y `llama-cli`. Los GGUFs no cargan en llama.cpp estándar (tensores extra de expertos calientes y tablas de routing). No hay soporte indicado para vLLM, TGI u Ollama.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento depende críticamente de la relación de potencia GPU/CPU y del tamaño del presupuesto caliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (base) | 34,2 B totales, ≈3 B activos | no disponible | apache-2.0 | safetensors, GGUF estándar | Referencia de calidad; en llama.cpp solo permite offload por capas (`--n-cpu-moe`) |
| kabe0515/Qwen3-30B-A3B-Instruct-2507-HOTEXP-GGUF (este) | 34,2 B totales, ≈3 B activos | no disponible | apache-2.0 | GGUF + llama.cpp parcheado | Offload por experto, 82,0% / 66,4% de cobertura |
| kabe0515/Qwen3-30B-A3B-Instruct-2507-MTP-GGUF | 34,2 B totales (mismo base) | no disponible | apache-2.0 | GGUF + llama.cpp parcheado | Variante con cabeza MTP (multi-token prediction) del mismo autor |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables en la información proporcionada; la comparación se limita a parámetros, licencia y estrategia de despliegue.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado en un commit concreto y dos parches aplicados en orden; los GGUFs no cargan en llama.cpp estándar ni, presumiblemente, en otras herramientas (vLLM, Ollama, TGI).
- En GPUs pequeñas la ganancia de decode desaparece (0,87× en GTX 1060, 0,97× en RTX 3050 Laptop) y en el portátil de 4 GB el prefill es más lento (0,42×). HOTEXP solo compensa cuando la GPU es potente respecto a la CPU.
- El histograma de expertos se midió sobre Wikipedia japonesa; la cobertura del 82,0% / 66,4% puede no trasladarse a otros dominios o idiomas con distribuciones de routing distintas. El autor indica que reajustar la asignación solo aporta ≈+1 punto; el presupuesto de bytes es el dial real.
- El split hot/cold está fijado en los dos GGUFs publicados; no hay publicación de otras cuantizaciones (Q4, Q5, etc.) ni de otros presupuestos calientes.
- Riesgo de alucinación y sesgos: propios del modelo base Qwen3-30B-A3B-Instruct-2507; no se documentan en esta ficha.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero el parche de llama.cpp es MIT y el empaquetado GGUF procede de un autor individual (kabe0515), sin garantías de mantenimiento.
- Mediciones con una sola ejecución por dispositivo y por configuración; el segundo dígito de las cifras debe tratarse como ruido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kabe0515/Qwen3-30B-A3B-Instruct-2507-HOTEXP-GGUF)
- [Modelo base Qwen/Qwen3-30B-A3B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507)
- [Release companion MTP-GGUF del mismo autor](https://huggingface.co/kabe0515/Qwen3-30B-A3B-Instruct-2507-MTP-GGUF)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Perfil del autor en Hugging Face](https://huggingface.co/kabe0515)
