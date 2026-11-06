# rohithck/delphi-3e19-998Mparams-5Btokens-seed62746

## Resumen

delphi-3e19-998Mparams-5Btokens-seed62746 es un modelo base (pretrained) de 998.036.992 parametros desarrollado por rohithck dentro de la suite de escalado Delphi del equipo Marin, publicada en la organizacion marin-community. Forma parte de una extension del conjunto original Delphi con semillas de entrenamiento y presupuestos de computo adicionales, manteniendo la receta original. El checkpoint corresponde a un presupuesto de computo de 3e19 FLOPs, entrenado sobre 4.982.571.008 tokens con la semilla 62746.

El modelo emplea una arquitectura tipo Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 16 capas, tamano oculto 1536, 12 cabezas de atencion y 12 cabezas KV (sin GQA), dimension de cabeza 128 y FFN intermedio de 6144. El vocabulario es de 128.256 tokens con el tokenizador de Llama 3 y la longitud maxima de secuencia es de 4096 tokens.

Su relevancia es fundamentalmente metodologica: Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, que incluye una receta de escalado, una cuadricula de modelos entrenados en presupuestos IsoFLOP de 3e18 a 1e23 FLOPs y una ley de escalado capaz de predecir el modelo mayor. Segun la model card, esa prediccion pre-registrada acerto el loss final del mayor run (1e23 FLOPs, 25 B parametros, 600 B tokens) con un error del 0,2 % usando 300 veces menos computo. Este checkpoint concreto es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 998.036.992 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (mezcla web mayoritariamente en ingles; sin cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |
| Tamano del repo | 4,0 GB |
| Hidden size | 1536 |
| Capas | 16 |
| Cabezas de atencion | 12 |
| Cabezas KV | 12 (sin GQA) |
| Dimension de cabeza | 128 |
| FFN intermedio | 6144 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizador Llama 3) |
| Codificacion posicional | RoPE (theta = 500000, escalado estilo Llama 3) |
| Bias | ninguno |
| Embeddings atados | no |
| Presupuesto de computo | 3e19 FLOPs |
| Tokens de entrenamiento | 4.982.571.008 |
| Pasos de entrenamiento | 38.014 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 16 capas con pre-norm y RMSNorm, atencion multi-cabeza completa (12 cabezas Q y 12 KV, sin grouped-query attention), QK-norm con escalado aprendido, RoPE con theta 500000 y escalado estilo Llama 3, y MLPs SwiGLU con ratio 4. No usa bias ni embeddings atados. La exportacion de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos son identicos a los de entrenamiento.

El entrenamiento siguio la receta Delphi: escalado estilo Complete(d)P con correccion del horizonte de tokens en el learning rate de la forma `(T₀/T)^0.3`, schedule WSD (10 % warmup lineal, 20 % decaimiento lineal, suelo 0), optimizador AdamH (Adam con Hyperball, que restringe cada peso de proyeccion a la esfera de norma de Frobenius de su inicializacion, eliminando la necesidad de weight decay), precision f32 en parametros maestros y bf16 en computo, y paralelizacion FSDP. Las constantes de referencia son B₀ = 64, T₀ = 2,5 B tokens, eta₀ = 0,00630, eta₀,Adam = 0,000656 y epsilon₀ = 1,85e-8. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. Se ejecutaron 38.014 pasos con secuencias de 4096 tokens, con exportacion final en el paso 38.013 (indexado desde cero).

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo completion (modelo base, sin formato de instrucciones).
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC, sin ajuste supervisado posterior.
- Generacion de codigo, gracias a la inclusion de StarCoderData en la mezcla de entrenamiento.
- Razonamiento matematico y demostraciones formales, por la presencia de ProofPile 2 en el corpus.
- Soporte de tool calling / function calling: no disponible (modelo base sin post-entrenamiento para seguir formatos de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma fiable sin instruction tuning.
- Capacidades multilingues: no disponibles; el modelo esta entrenado sobre una mezcla mayoritariamente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de la cuadricula IsoFLOP a 3e19 FLOPs para ajustar y validar leyes de escalado, comparando el loss observado con el predicho por los modelos menores de Delphi.
- Estudios de reproducibilidad y varianza entre semillas: al existir checkpoints con la misma receta y distintas semillas (esta es la 62746), permite medir la dispersion del loss final atribuible al azar de inicializacion y de orden de datos.
- Analisis de dinamica de entrenamiento: los intermedios y el checkpoint final permiten estudiar la evolucion de pesos, activaciones o representaciones a lo largo de los 38.014 pasos con el optimizador AdamH.
- Experimentos de destilacion o inicializacion: al ser un modelo denso de ~1 B parametros con arquitectura Qwen 3 y contexto de 4096, puede usarse como inicializacion o profesor en experimentos de destilacion hacia modelos menores.
- Fine-tuning academico en tareas de codigo o matematicas: la mezcla incluye StarCoderData y ProofPile 2, por lo que es un punto de partida razonable para ajuste supervisado en dominios tecnicos con presupuesto de GPU limitado.
- Evaluacion comparativa de recetas de optimizacion: permite contrastar AdamH con AdamW estandar en un regimen de computo fijo y reproducible, usando la configuracion registrada en el repositorio de Marin.
- Generacion de texto de completado en pipelines de investigacion: con 998 M parametros y pesos safetensors, se puede servir con transformers o TGI para experimentos internos de completion en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. El blog de Delphi menciona proyecciones de benchmarks posteriores (MMLU, HumanEval, GSM8K) mediante una regresion en dos pasos que combina leyes de escalado de computo y observacionales, pero no se proporcionan cifras concretas para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB para los pesos (998 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB con contexto de 4096.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se publican artefactos GGUF oficiales, por lo que habria que generarlos a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16; para entrenamiento o fine-tuning completo se recomienda A100 40/80 GB o H100 por el uso de FSDP.
- Cabe en GPU consumer: si, en todas las GPU con 8 GB o mas para inferencia en bf16, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama tras conversion a GGUF (no se proporcionan artefactos oficiales).
- Latencia y throughput: no disponible; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Post-entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| delphi-3e19-998Mparams-5Btokens-seed62746 | 998 M | 4096 | Apache 2.0 | No (base) | Hugging Face (rohithck) |
| Pythia-1B (EleutherAI) | ~1 B | 2048 | Apache 2.0 | No (base) | Hugging Face (EleutherAI) |
| Qwen3-0.6B | ~0,6 B | no disponible en esta ficha | Apache 2.0 | Si (instruct y base) | Hugging Face (Qwen) |
| OLMo-1B | ~1 B | 2048 | Apache 2.0 | No (base) | Hugging Face (allenai) |

La comparacion con Pythia-1B es la mas directa en proposito: ambas son suites de investigacion sobre escalado con checkpoints intermedios y modelos base sin alineacion. Delphi se diferencia por una receta explicita de escalado y una ley de escalado validada con prediccion pre-registrada. Frente a Qwen3-0.6B u OLMo-1B, la diferencia principal es que este checkpoint no tiene instruction tuning ni evaluaciones publicadas, lo que limita su uso fuera de investigacion. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: la mezcla de entrenamiento es mayoritariamente web en ingles y la model card declara ausencia de cobertura multilingue.
- Solo preentrenamiento: no hay instruction tuning, RLHF ni alineacion de seguridad, por lo que puede generar contenido danino, sesgado o factualmente incorrecto sin filtros.
- Riesgo de alucinacion alto en tareas de conocimiento factual, inherente a un modelo base de ~1 B parametros entrenado con menos de 5 B tokens.
- Contexto limitado a 4096 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- La receta Delphi optimiza el coste de entrenamiento, no el coste de inferencia; para despliegues con mucha inferencia, un modelo menor sobrentrenado puede ser preferible, como admite la propia model card.
- Artefacto de investigacion: el autor advierte que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; uso en produccion bajo responsabilidad del usuario.
- La revision de codigo enlazada publica la receta registrada, pero no identifica el checkout exacto usado en el run de entrenamiento completado, lo que puede afectar a la reproducibilidad exacta.
- No se publican evaluaciones de sesgo, toxicidad ni robustez; no hay garantias para uso comercial en entornos regulados pese a la licencia Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-3e19-998Mparams-5Btokens-seed62746
- Organizacion Marin en Hugging Face (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Blog de Delphi, "Scaling Laws That Extrapolate 300× Past the Fit": https://openathena.ai/blog/delphi
- Dataset con los datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Repositorio Marin (codigo de la receta): https://github.com/marin-community/marin
- Receta Complete(d)P + AdamH: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento de semillas Delphi: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e19-seed62746-2026.09.22
- Blog sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Paper de Pythia (inspiracion de Delphi): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
