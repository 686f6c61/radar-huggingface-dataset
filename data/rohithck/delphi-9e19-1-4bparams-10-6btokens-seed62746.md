# rohithck/delphi-9e19-1.4Bparams-10.6Btokens-seed62746

## Resumen

Delphi-9e19-1.4Bparams-10.6Btokens-seed62746 es un modelo base (pretrained, sin ajuste por instrucciones) de 1.384.584.448 parametros desarrollado por el equipo Marin. Forma parte de la suite de escalado Delphi, inspirada en Pythia, que mapea presupuestos de computo a configuraciones de modelo y entrena checkpoints en una rejilla IsoFLOP desde 3 × 10^18 hasta 1 × 10^23 FLOPs. Este checkpoint concreto corresponde a un presupuesto de 9 × 10^19 FLOPs y a la semilla de entrenamiento 62746, una de las repeticiones adicionales de la receta original.

El modelo emplea la arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm y MLPs SwiGLU), con 18 capas, tamano oculto 1792, 14 cabezas de atencion sin GQA y un vocabulario de 128.256 tokens basado en el tokenizer de Llama 3. Se entreno sobre 10.559.946.752 tokens con una mezcla de Nemotron-CC, StarCoderData y ProofPile 2, y una longitud de secuencia de 4096.

Su relevancia es fundamentalmente metodologica: el interes del proyecto Delphi reside en que una ley de escalado pre-registrada predijo la perdida final del mayor modelo de la suite (25 B parametros, 600 B tokens) con un error del 0,2 % usando 300 veces menos computo. Este checkpoint es un artefacto de investigacion para estudiar leyes de escalado, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 1.384.584.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, arquitectura `Qwen3ForCausalLM`) |

Detalles adicionales de configuracion: hidden size 1792, 18 capas, 14 cabezas de atencion, 14 KV heads (sin GQA), head dim 128, FFN intermedio 7168 (ratio MLP 4), vocab 128.256, RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Qwen 3. Usa pre-normalizacion con RMSNorm, atencion multi-cabeza completa (sin grouped-query attention), RoPE con theta 500000 y escalado de posiciones estilo Llama 3, QK-norm con escalado aprendido y MLPs SwiGLU con ratio 4. No emplea embeddings atados ni terminos de bias en las proyecciones.

El entrenamiento consumio 9 × 10^19 FLOPs en 40.283 pasos sobre 10.559.946.752 tokens con secuencias de 4096. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de ser necesario. La tasa de aprendizaje sigue una regla de transferencia estilo Complete(d)P con correccion `(T₀/T)^0.3` en funcion del horizonte de tokens, con constantes B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85 × 10^-8. El schedule es WSD con 10 % de warmup lineal, 20 % de decaimiento lineal y suelo cero. Se entreno en precision f32 para los parametros maestros y bf16 para el computo, con paralelismo FSDP. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No hubo RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt (modelo base, sin formato de instrucciones).
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC.
- Generacion de codigo, gracias a la inclusion de StarCoderData en la mezcla de entrenamiento.
- Razonamiento matematico y demostraciones formales, por la presencia de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (requiere ajuste posterior).
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de la rejilla IsoFLOP para ajustar y validar leyes de escalado, comparando la perdida observada con la predicha por la ley de Delphi a 9 × 10^19 FLOPs.
- Estudios de reproducibilidad y varianza entre semillas: al existir repeticiones con distintas semillas en la misma configuracion, permite medir la variabilidad del entrenamiento a presupuesto fijo.
- Experimentos de recetas de optimizacion: su configuracion con AdamH y la correccion `(T₀/T)^0.3` permite contrastar empiricamente estas tecnicas frente a alternativas como AdamW con weight decay clasico.
- Ajuste fino supervisado como banco de pruebas: al ser un modelo base de 1,4 B parametros, es adecuado para probar pipelines de SFT, LoRA o DPO a bajo coste antes de escalar a modelos mayores.
- Generacion de codigo en entornos de investigacion: el entrenamiento con StarCoderData permite evaluar la calidad de completado de codigo en un modelo de este tamano y compararla con las proyecciones de HumanEval del proyecto Delphi.
- Analisis de mecanismos internos: 18 capas y 1792 de hidden size lo hacen manejable para estudios de interpretabilidad (activaciones, circuitos, probing) sin requerir infraestructura de gran escala.
- Docencia y prototipado: su tamano permite ejecutarlo en una sola GPU consumer para demostraciones de preentrenamiento y decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. El proyecto Delphi publica proyecciones de MMLU, HumanEval y GSM8K mediante una regresion en dos pasos que combina leyes de escalado de computo y observacionales, pero no se proporcionan cifras concretas para este checkpoint en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,8 GB solo para pesos (1,38 B parametros × 2 bytes), mas cache KV y activaciones; en la practica, unos 4-6 GB para secuencias de 4096 tokens.
- VRAM estimada en fp32: aproximadamente 5,5 GB solo para pesos.
- Cuantizacion a 8 bits: aproximadamente 1,4 GB de pesos; a 4 bits: aproximadamente 0,7 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. Para entrenamiento o ajuste fino, se recomienda A100/H100 o RTX 4090.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se documentan soportes especificos para vLLM, llama.cpp u Ollama, aunque al ser una arquitectura Qwen3 estandar deberian ser viables.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| delphi-9e19-1.4Bparams-10.6Btokens-seed62746 | 1,38 B | 4096 | Apache 2.0 | Modelo base de investigacion, solo ingles, sin evaluacion publicada |
| Pythia-1.4B | 1,4 B | 2048 | Apache 2.0 | Suite de escalado de referencia con checkpoints intermedios; base, solo ingles |
| Qwen3-1.7B | 1,7 B | 32768 | Apache 2.0 | Modelo con contexto mucho mayor y versiones ajustadas por instrucciones |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Base y ajustado, con evaluacion publicada y soporte multilingue parcial |

La comparacion con Pythia es la mas directa por proposito (suite de escalado con semillas multiples y checkpoints intermedios). Frente a Qwen3-1.7B y SmolLM2-1.7B, el modelo de Delphi ofrece un contexto notablemente menor y carece de ajuste por instrucciones, pero su valor esta en la metodologia de escalado y la trazabilidad de la receta, no en el rendimiento absoluto. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Entrenado sobre una mezcla web con predominio de ingles; sin cobertura multilingue.
- Solo preentrenado: no ha pasado por instruction tuning, RLHF ni alineamiento de seguridad; no es adecuado para uso conversacional directo sin ajuste.
- La receta Delphi optimiza el coste de computo de entrenamiento, no el coste de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible.
- La model card advierte de que es un artefacto de investigacion no evaluado adecuadamente y que no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado, inherente a un modelo base sin alineamiento.
- Ventana de contexto limitada a 4096 tokens, inferior a la de modelos contemporaneos de tamano similar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluacion y de alineamiento desaconseja su despliegue en produccion sin una validacion exhaustiva.
- El codigo de la receta publicado no identifica el checkout exacto usado en el entrenamiento completado, lo que limita la reproducibilidad bit a bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-9e19-1.4Bparams-10.6Btokens-seed62746
- Blog del proyecto Delphi: https://openathena.ai/blog/delphi
- Coleccion de checkpoints Delphi: https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-9e19-seed62746-2026.09.22
- Articulo sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
