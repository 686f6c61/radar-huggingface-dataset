# Hooshaai/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2

## Resumen
`qwen-2.5-0.5b-dynamic-conv-attention-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de un Qwen2.5-0.5B (494M parametros, 24 capas, dimension oculta 896) al que se le han sustituido quirurgicamente 18 de sus 24 bloques de atencion por el operador `DynamicConvAttention`, una convolucion causal depthwise dinamica que prescinde de las proyecciones Q y K. Los 6 bloques restantes conservan la atencion GQA original de Qwen2.5 como anclas de recuperacion contextual, configurando una topologia hibrida 3:1.

El modelo no busca competir en calidad generativa, sino servir como banco de pruebas reproducible para investigar la sustitucion de atencion cuadratica por alternativas subcuadraticas en modelos pequenos. Tras el transplante, el modelo colapsa (perplejidad de 356.266,72 en WikiText-2) y se recupera parcialmente mediante destilacion de conocimiento en dos etapas desde el modelo profesor original, alcanzando una perplejidad de 216,40.

Es relevante ahora porque documenta con telemetria detallada el coste real del "attention surgery" en LLMs compactos: la brecha entre el profesor (PPL 15,38) y el estudiante destilado (PPL 216,40) cuantifica cuanto rendimiento se pierde al eliminar la atencion softmax en la mayoria de capas. El checkpoint se distribuye en FP16 completo (1035,20 MB) mas un adaptador, bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 18/24 capas con `DynamicConvAttention` + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 494M (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugia) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo + adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors FP16 completo (1035,20 MB) + adaptador |
| Tamano del repo | 1,6 GB |
| Dimension oculta | 896 |
| Cabezas de atencion | 14 query / 2 KV (GQA), expandidas a 14/14 en capas transplantadas |
| Cabezas por capa | 14 (dimension por cabeza 64) |
| Capas | 24 |
| RoPE theta | 1.000.000 |
| Dispatch de kernel | CUDA / Triton / PyTorch (3 niveles) |
| Libreria | neuralops |

## Arquitectura y entrenamiento
El operador `DynamicConvAttention` sustituye la atencion softmax por una convolucion causal depthwise dinamica: cada token genera, por cabeza, un filtro de K taps mediante `w_t = softmax(MLP(x_t))` en R^(H x K), y la salida se calcula como `out_t[h,:] = sum_k w_t[h,k] * V_{t-K+1+k}[h,:]`. Solo se emplean las proyecciones V y O; las proyecciones Q y K se eliminan. Las capas transplantadas (indices 0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22) se envuelven en `QwenAttentionAdapter`, que gestiona la expansion de cabezas KV de 2 a 14 y el RoPE. Las capas 3, 7, 11, 15, 19 y 23 conservan la atencion GQA original como anclas de enrutamiento global.

El entrenamiento consistio en destilacion de conocimiento de representaciones ocultas en dos etapas sobre el split de validacion de WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, batch 8 y acumulacion de gradiente 4, ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB mediante la arquitectura de cache offline de representaciones de NeuralOps (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 96 pasos) congela el backbone y entrena solo modulos de atencion y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0) minimizando MSE por capa mas 0.25 * (1 - coseno) sobre los estados ocultos. La etapa 2 no se detalla en la informacion disponible.

## Capacidades
- Generacion de texto autoregresiva causal (pipeline `text-generation`).
- Razonamiento y generacion en ingles, heredados del modelo base Qwen2.5-0.5B.
- Soporte de tool calling y function calling: no disponible de forma verificada tras la cirugia; el modelo base lo soporta, pero la model card no lo confirma para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas; la perplejidad resultante (216,40) sugiere degradacion sustancial de la calidad.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: banco de pruebas de operadores de atencion subcuadratica y de tecnicas de destilacion post-cirugia.
- Vision y audio: no disponibles.

## Casos de uso
- Investigacion en eficiencia de atencion: sirve para medir empiricamente el coste en perplejidad de sustituir atencion softmax por convolucion causal dinamica en un 75% de las capas de un LLM de 0,5B, con telemetria reproducible sobre WikiText-2.
- Reproduccion de experimentos de destilacion: el checkpoint permite replicar el protocolo de dos etapas (alineamiento de subespacio con backbone congelado y segunda etapa) y comparar variantes de presupuesto y objetivos.
- Desarrollo de operadores en NeuralOps: util como referencia funcional del operador `DynamicConvAttention` y del `QwenAttentionAdapter` para validar nuevas implementaciones CUDA/Triton/PyTorch.
- Benchmarking de topologias hibridas: permite comparar la configuracion 3:1 (18 capas convolucionales / 6 GQA) frente a otras ratios y determinar el punto optimo entre complejidad lineal y recall de induction heads.
- Estudio de colapso y recuperacion post-cirugia: la diferencia entre la PPL zero-shot (356.266,72) y la post-destilacion (216,40) ofrece un caso de estudio cuantificado sobre la sensibilidad de los transformers pequenos a la sustitucion de atencion.
- Docencia y divulgacion tecnica: ejemplo didactico de cirugia de atencion, expansion GQA y destilacion de representaciones ocultas en hardware de consumo (RTX 3090).

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | GQA softmax causal de referencia |
| Perplejidad del estudiante zero-shot pre-destilacion | 356.266,72 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilacion | 216,40 | Tras destilacion de representaciones en 2 etapas |
| Delta absoluto de perplejidad | -356.050,32 | Cambio logrado via destilacion |
| Reduccion relativa de perplejidad | 99,94% | Recuperacion respecto al pico post-cirugia |

Dataset: WikiText-2 (`wikitext-2-raw-v1`), split de validacion, longitud de secuencia 512, batch 8, acumulacion de gradiente 4, NVIDIA GeForce RTX 3090 24 GB. Los resultados son declarados por el autor y no estan verificados de forma independiente (`verified: false`).

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para pesos (1035,20 MB) mas overhead de activaciones y cache KV; en la practica, 2-3 GB son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor valido el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la libreria `neuralops` es la via nativa; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible, ya que el operador `DynamicConvAttention` requiere el kernel especifico de NeuralOps y no es un transformer estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-dynamic-conv-attention-wikitext2 | 494M | no disponible | 216,40 (post-KD) | MIT | Hugging Face, libreria neuralops |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 | Hugging Face, amplio ecosistema |
| Otros checkpoints del Attention Surgery Zoo | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face, autor Hooshaai |

La comparativa con alternativas subcuadraticas (Mamba, RWKV, RetNet) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Perplejidad muy elevada: 216,40 frente a 15,38 del profesor, lo que implica una degradacion severa de la calidad generativa; no es apto para produccion ni para tareas que requieran coherencia.
- El modelo es un artefacto de investigacion, no un modelo de proposito general; su uso previsto es experimental.
- Solo soporta ingles segun la model card; el multilingue del modelo base no esta verificado tras la cirugia.
- Riesgo elevado de alucinacion y de generacion incoherente dado el nivel de perplejidad.
- Requiere la libreria `neuralops` y sus kernels (CUDA/Triton/PyTorch); no es compatible con stacks de inferencia estandar sin adaptacion.
- La longitud de contexto efectiva tras la cirugia no esta documentada; no asumir los 32.768 tokens del modelo base.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario; verificar ademas las obligaciones heredadas del modelo base Apache 2.0.
- Sesgos conocidos: no documentados en la model card; se heredan los del corpus WikiText-2 y Qwen2.5-0.5B.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/dynamic_conv_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
