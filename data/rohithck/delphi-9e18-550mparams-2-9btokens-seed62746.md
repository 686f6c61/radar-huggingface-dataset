# rohithck/delphi-9e18-550Mparams-2.9Btokens-seed62746

## Resumen

Delphi-9e18-550Mparams-2.9Btokens-seed62746 es un checkpoint de modelo base de 550.337.664 parametros perteneciente a la suite de escalado Delphi del equipo Marin (Open Athena). Se trata de un transformer decoder-only con la arquitectura Qwen 3, entrenado desde cero sobre 2.904.358.912 tokens con un presupuesto de computo configurado de 9e18 FLOPs y semilla de entrenamiento 62746. No es un modelo instructivo ni alineado: es un artefacto de investigacion disenado para estudiar leyes de escalado.

El interes del modelo no reside en sus capacidades de producto, sino en su papel dentro de una metodologia reproducible de escalado: Delphi define una receta que mapea presupuestos de computo a configuraciones de modelo, entrena una rejilla IsoFLOP entre 3e18 y 1e23 FLOPs y ajusta una ley de escalado capaz de predecir el modelo mayor. Segun el autor, esa prediccion pre-registrada acerto la perdida final del mayor run (1e23 FLOPs, 25B parametros, 600B tokens) con un error del 0,2 % usando 300 veces menos computo.

Este checkpoint concreto es una extension de la suite original con semillas y presupuestos adicionales, manteniendo la receta Delphi. Su relevancia practica es limitada fuera de la investigacion: contexto de 4096 tokens, solo ingles, sin tool calling, sin alineacion y con una model card que lo etiqueta explicitamente como `research-only`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, MLP SwiGLU) |
| Parametros totales | 550.337.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export de inferencia con `architectures: ["Qwen3ForCausalLM"]`) |
| Hidden size | 1152 |
| Capas | 12 |
| Cabezas de atencion | 9 (9 KV heads, sin GQA) |
| Head dim | 128 |
| FFN intermedio | 4608 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizer Llama 3) |
| Embeddings atados | No |
| Terminos de bias | Ninguno |
| Posicionamiento | RoPE con theta = 500000, escalado estilo Llama 3 |
| Tamano del repo | 2,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen 3 en su variante densa: decoder pre-norm con RMSNorm, atencion con RoPE (theta 500000 y escalado estilo Llama 3), QK-norm con escalado aprendido, MLPs SwiGLU con ratio 4, sin sesgos y sin embeddings atados. La configuracion es de 12 capas, hidden size 1152, 9 cabezas de atencion y 9 cabezas KV (sin grouped-query attention), con head dim 128 y vocabulario de 128.256 tokens del tokenizer Llama 3. El contexto maximo de entrenamiento e inferencia es de 4096 tokens.

El entrenamiento consumio 9e18 FLOPs sobre 2.904.358.912 tokens en 44.317 pasos con secuencia de 4096, precision bf16 en computo y f32 en parametros maestros, y paralelismo FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada matriz de proyeccion a la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de ser necesario. La tasa de aprendizaje sigue la receta Delphi, una regla de transferencia estilo Complete(d)P con correccion `(T0/T)^0.3` en funcion del horizonte de tokens, con constantes de referencia B0 = 64, T0 = 2,5B tokens, eta0 = 0,00630, eta0,Adam = 0,000656 y epsilon0 = 1,85e-8. El schedule es WSD: 10 % de warmup lineal, 20 % de decaimiento lineal y suelo en cero. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2.

La innovacion metodologica no esta en el modelo sino en la suite: la receta Delphi permite predecir la perdida de runs mucho mayores a partir de los pequenos, y el blog asociado extiende esa prediccion a benchmarks downstream (MMLU, HumanEval, GSM8K) mediante una regresion en dos pasos que combina leyes de escalado de computo y observacionales.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base; no esta ajustado para seguir instrucciones.
- Razonamiento y conocimiento general derivados de la mezcla Nemotron-CC, sin evaluacion publicada en este checkpoint.
- Codigo: entrenado con StarCoderData, por lo que ha visto codigo fuente, aunque no se han publicado resultados de HumanEval para esta release.
- Matematicas y demostracion formal: incluye ProofPile 2 en la mezcla de entrenamiento.
- Sin soporte de tool calling ni function calling: es un modelo pretrained sin formato de chat.
- Sin capacidades de agente ni razonamiento multi-paso guiado; no hay modo thinking ni plantilla de conversacion.
- Multilingue: no. Solo ingles segun la model card.
- Sin vision, audio ni modalidades adicionales.
- Contexto efectivo de 4096 tokens, insuficiente para tareas de contexto largo.

## Casos de uso

- Investigacion sobre leyes de escalado: reproducir o extender el ajuste de la curva IsoFLOP de Delphi usando este checkpoint como punto de la rejilla a 9e18 FLOPs, comparandolo con los demas checkpoints de `marin-community`.
- Estudios de estabilidad de semilla: al ser un run con semilla 62746 dentro de una extension de semillas, sirve para medir varianza entre inicializaciones a presupuesto de computo fijo.
- Experimentos de receta de entrenamiento: validar el comportamiento de AdamH y del schedule WSD con correccion `(T0/T)^0.3` en regimenes de 550M parametros, comparando con runs de referencia.
- Fine-tuning academico de bajo coste: con 550M parametros y licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas de clasificacion, generacion de codigo o dominio especifico en ingles.
- Baseline para ablaciones de tokenizer y arquitectura: el uso del tokenizer Llama 3 con vocabulario 128.256 y QK-norm permite comparar contra modelos de tamano similar con otras decisiones de diseno.
- Generacion de texto en ingles para prototipos internos no criticos: util como modelo de prueba en pipelines de `transformers` o TGI antes de sustituir por un modelo instructivo mayor.
- Docencia y divulgacion: ejemplo ejecutable de un transformer denso de 550M con receta documentada y pesos publicos para explicar escalado y entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "Evaluation results for this checkpoint are not included in this release". El blog de Delphi publica proyecciones downstream (MMLU, HumanEval, GSM8K) para la suite, pero no se proporcionan cifras concretas para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 1,1 GB para pesos (550M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica 2-3 GB para inferencia con contexto completo de 4096.
- VRAM estimada en fp32: aproximadamente 2,2 GB solo de pesos.
- Cuantizacion: no se publican pesos cuantizados oficiales; una conversion a 8 bits o 4 bits con herramientas de la comunidad reduciria el peso a ~550 MB y ~275 MB respectivamente, aunque no esta validada por el autor.
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien es viable en CPU para inferencia por lotes pequenos.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para inferencia; su interes seria el entrenamiento o fine-tuning con parallelism.
- Despliegue: compatible con `transformers` (clase `Qwen3ForCausalLM`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM por compatibilidad de arquitectura Qwen 3, aunque no se documenta explicitamente. llama.cpp y Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Delphi-9e18-550M (este) | 550M | 4096 | en | Apache 2.0 | Base research-only, sin evaluacion publicada, parte de suite de escalado |
| Pythia-410M | 410M | 2048 | en | Apache 2.0 | Suite de escalado de referencia con checkpoints intermedios; inspiracion declarada de Delphi |
| Qwen3-0.6B | ~600M | 32.768 | multilingue | Apache 2.0 | Arquitectura Qwen 3 con GQA y contexto mucho mayor; incluye variantes instructivas |
| SmolLM2-360M | 360M | 8192 | en (principalmente) | Apache 2.0 | Base/instruct con datos curados y evaluacion publica |

La comparacion relevante es metodologica: Pythia es el antecedente directo de Delphi como suite de escalado con checkpoints intermedios. Frente a Qwen3-0.6B o SmolLM2, este checkpoint pierde en contexto, cobertura idiomatica y utilidad inmediata, pero su valor esta en la trazabilidad de la receta y en formar parte de una rejilla IsoFLOP con semillas multiples.

## Limitaciones y advertencias

- Modelo pretrained sin instruction tuning, RLHF ni alineacion de seguridad: no debe usarse como asistente conversacional sin ajuste previo.
- Solo ingles; la model card declara ausencia de cobertura multilingue.
- Contexto limitado a 4096 tokens, muy por debajo de los estandares actuales para tareas de contexto largo.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado heredado de la mezcla web (Nemotron-CC); no se documentan filtros de seguridad.
- La model card advierte que el modelo "no ha sido probado ni evaluado adecuadamente y no es necesariamente seguro", y que su uso en produccion es bajo responsabilidad del usuario.
- La receta Delphi optimiza el computo de entrenamiento, no el coste de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible.
- El codigo de la revision enlazada publica la receta registrada, pero no identifica el checkout exacto usado en el entrenamiento completado, lo que limita la reproducibilidad bit a bit.
- Licencia Apache 2.0 permite uso comercial, pero la etiqueta `research-only` y la ausencia de evaluacion desaconsejan produccion.
- Es un checkpoint dentro de una release mayor: elegir el punto de la rejilla adecuado al regimen de computo/parametros/tokens es responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-9e18-550Mparams-2.9Btokens-seed62746
- Coleccion completa de checkpoints Delphi: https://huggingface.co/marin-community
- Blog de Delphi, "Scaling Laws That Extrapolate 300x Past the Fit": https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Repositorio Marin: https://github.com/marin-community/marin
- Receta AdamH con correccion Complete(d)P: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento de semillas Delphi: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-9e18-seed62746-2026.09.22
- AdamH (Hyperball), articulo de referencia: https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de Delphi): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- Dataset Nemotron-CC: https://huggingface.co/datasets/nvidia/Nemotron-CC
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset ProofPile 2: https://huggingface.co/datasets/EleutherAI/proof-pile-2
