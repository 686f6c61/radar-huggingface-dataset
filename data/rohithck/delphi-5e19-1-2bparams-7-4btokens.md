# rohithck/delphi-5e19-1.2Bparams-7.4Btokens

## Resumen

Delphi-5e19-1.2Bparams-7.4Btokens es un checkpoint base de 1.180.038.272 parametros perteneciente a la suite de escalado Delphi, desarrollada por el equipo Marin. Se trata de un modelo decoder-only con arquitectura Qwen 3 (pre-norm, RMSNorm, RoPE con QK-norm y MLPs SwiGLU), entrenado sobre 7.363.231.744 tokens con una semilla de entrenamiento fija (seed 0) y un presupuesto de computo configurado de 5,3e19 FLOPs, de ahi la etiqueta `5e19` del repositorio.

El proposito del modelo no es el uso productivo, sino la investigacion sobre leyes de escalado. Delphi es la primera suite de escalado abierta de Marin, inspirada en Pythia, y se compone de una receta de escalado que mapea presupuestos de computo a configuraciones de modelo, una malla de modelos entrenados en presupuestos IsoFLOP entre 3e18 y 1e23 FLOPs, y una ley de escalado que predice el comportamiento de los modelos grandes a partir de los pequenos. Segun la model card, una prediccion pre-registrada de esa ley acerto la perdida final del mayor run Delphi (1e23 FLOPs, 25 B parametros, 600 B tokens) con un error del 0,2 %, usando 300 veces menos computo que el entrenamiento real.

Este checkpoint concreto es una extension de Delphi con semillas y presupuestos adicionales, manteniendo la receta original. Es relevante ahora porque permite reproducir y auditar empíricamente las predicciones de escalado, y porque su receta de entrenamiento (optimizador AdamH, correccion de learning rate por horizonte de tokens) es poco habitual y esta documentada de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, MLPs SwiGLU) |
| Parametros totales | 1.180.038.272 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,7 GB) |

Detalles adicionales de configuracion: hidden size 1664, 17 capas, 13 cabezas de atencion y 13 cabezas KV (sin GQA), head dim 128, FFN intermedio 6656 (ratio MLP 4), vocabulario de 128.256 tokens con tokenizer Llama 3, RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con los componentes habituales de la familia Qwen 3: normalizacion pre-norm con RMSNorm, atencion con RoPE y QK-norm con escalado aprendido, y capas feed-forward SwiGLU. No emplea GQA (13 cabezas KV iguales a las 13 de atencion), lo que implica un KV cache relativamente grande para su tamano. El entrenamiento se realizo en precision f32 para los parametros maestros y bf16 para el computo, con paralelismo FSDP, sobre 56.177 pasos a longitud de secuencia 4096.

La innovacion tecnica principal esta en la receta de optimizacion. Se usa AdamH (Adam with Hyperball), que restringe cada peso de proyeccion a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de tener nada que regularizar y desaparece de la receta. La tasa de aprendizaje sigue una regla de transferencia estilo Complete(d)P con correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens, con constantes de referencia B0 = 64, T0 = 2,5 B tokens, eta0 = 0,00630, eta0,Adam = 0,000656 y epsilon0 = 1,85e-8. El schedule es WSD con 10 % de warmup lineal, 20 % de decaimiento lineal y suelo cero. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2, es decir, web, codigo y matematicas/pruebas formales. No se reporta RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente preentrenado.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo completado (modelo base, sin plantilla de instrucciones).
- Modelado de lenguaje y continuacion de documentos largos hasta 4096 tokens.
- Capacidad de codigo derivada de StarCoderData en la mezcla de entrenamiento (completado de codigo, no instrucciones de codigo).
- Razonamiento matematico y formal parcial, por la inclusion de ProofPile 2 en los datos.
- Conocimiento factual de tipo web, procedente de Nemotron-CC.
- No dispone de tool calling ni function calling: al no estar ajustado por instrucciones, no sigue formatos de herramientas de forma fiable.
- No soporta agentes ni razonamiento multi-paso guiado; cualquier capacidad agentica requeriria ajuste posterior.
- Sin capacidades multimodales (vision o audio) ni modo thinking explicito.
- Multilingue: no. Solo ingles segun la model card.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de la malla IsoFLOP para ajustar y validar curvas de perdida frente a computo, comparandolo con el resto de la suite Delphi en `marin-community`.
- Reproducibilidad de recetas de entrenamiento: permite reentrenar o auditar la receta AdamH + Complete(d)P con la misma semilla y comprobar si se alcanza la misma perdida, gracias a que la configuracion y el run de W&B estan publicados.
- Estudios de estabilidad de semillas: al ser un checkpoint con seed 0 dentro de una extension con semillas adicionales, se usa para medir la varianza entre semillas a presupuesto fijo de 5,3e19 FLOPs.
- Baseline para ajuste fino en dominios concretos: su tamano de 1,2 B parametros y licencia Apache 2.0 lo hacen adecuado como punto de partida para SFT en tareas de codigo o matematicas, donde ya tiene exposicion previa por StarCoderData y ProofPile 2.
- Generacion de texto y completado de documentos en ingles en entornos de investigacion, con contexto de hasta 4096 tokens, sin expectativas de seguir instrucciones.
- Experimentos de destilacion o comparacion de tokenizers: al usar el tokenizer Llama 3 con vocabulario de 128.256, facilita comparaciones controladas frente a modelos de la familia Llama.
- Evaluacion de tecnicas de cuantizacion y despliegue en hardware modesto, dado que el modelo cabe en GPUs de consumo en precision reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. La documentacion de Delphi menciona proyecciones de MMLU, HumanEval y GSM8K mediante regresion en dos pasos (leyes de escalado de computo y observacionales), pero no se proporcionan cifras concretas para este modelo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 2,4 GB solo para pesos, mas KV cache; con 4096 tokens de contexto y 13 cabezas KV de dimension 128 en 17 capas, el KV cache ronda 0,9 GB en bf16, por lo que se necesita del orden de 3,5-4 GB en total.
- En cuantizacion de 8 bits, los pesos bajan a unos 1,2 GB; en 4 bits, a unos 0,6-0,7 GB, con la advertencia de que el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas puede ejecutar el modelo en bf16 con contexto completo; una RTX 4090 o A100/H100 ofrece margen amplio y mayor throughput. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y herramientas compatibles con safetensors. No se documenta soporte oficial de GGUF/llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Delphi-5e19-1.2Bparams-7.4Btokens | 1,18 B | 4096 | Apache 2.0 | Suite de escalado, solo preentrenado, solo ingles | Hugging Face (`rohithck`) |
| Pythia-1.4B (EleutherAI) | 1,4 B | 2048 | Apache 2.0 | Suite de escalado con checkpoints intermedios, solo ingles | Hugging Face (`EleutherAI`) |
| Qwen3-1.7B | 1,7 B | 32.768 (nativo) | Apache 2.0 | Modelo base e instruct, multilingue | Hugging Face (`Qwen`) |
| Llama 3.2-1B | 1,24 B | 131.072 | Llama 3.2 Community License | Base e instruct, multilingue | Hugging Face (`meta-llama`) |

La comparacion con Pythia es la mas directa por filosofia (suite de escalado abierta con receta reproducible). Frente a Qwen3-1.7B y Llama 3.2-1B, Delphi queda muy por detras en contexto (4096 frente a decenas de miles) y en cobertura de idiomas, y no ofrece version instruct, por lo que no es un sustituto en aplicaciones de produccion. Los datos de rendimiento de Delphi frente a estos modelos no estan disponibles para comparar en benchmarks.

## Limitaciones y advertencias

- Modelo solo preentrenado: no ha pasado por instruction tuning, RLHF ni alineamiento de seguridad. No debe usarse como asistente conversacional sin ajuste previo.
- Cobertura unicamente en ingles; la mezcla de datos es mayoritariamente web en ingles y no hay soporte multilingue.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado propio de un modelo base sin filtros; el autor lo describe como artefacto de investigacion no evaluado y no necesariamente seguro.
- Contexto limitado a 4096 tokens, muy por debajo de los modelos contemporaneos de su tamano.
- La receta Delphi prioriza el entrenamiento computacionalmente optimo, no el sobrentrenamiento orientado a coste de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno y sobrentrenado puede ser preferible, como senala la propia model card.
- Licencia Apache 2.0 permite uso comercial, pero al no haber evaluacion ni alineamiento, el uso en produccion queda bajo responsabilidad del integrador.
- El repositorio tiene muy poca traccion (70 descargas, 0 likes) y fue creado en octubre de 2026; no hay senales de mantenimiento ni de comunidad alrededor de este checkpoint concreto.
- El codigo de la receta enlazado publica la configuracion registrada, pero no identifica el checkout exacto usado para el entrenamiento completado, lo que limita la reproducibilidad bit a bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-5e19-1.2Bparams-7.4Btokens
- Organizacion Marin en Hugging Face (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Blog "Scaling Laws That Extrapolate 300x Past the Fit": https://openathena.ai/blog/delphi
- Repositorio Marin en GitHub: https://github.com/marin-community/marin
- Receta Complete(d)P + AdamH: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento Delphi seeds: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-5e19-seed0-2026.09.22
- Articulo sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de Delphi): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
