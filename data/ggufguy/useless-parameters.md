# GGUFGuy/useless-parameters

## Resumen

useless-parameters es un modelo de lenguaje decoder-only de 114.838.272 parametros entrenado desde cero por el usuario GGUFGuy sobre el dataset fineweb-edu, utilizando el Space HyperDex Trainer. Su arquitectura es un transformer estandar de tipo `LlamaForCausalLM` (MLP con SiLU, RMSNorm, embeddings posicionales rotatorios, atencion con 12 cabezas y embeddings atados), escalado en anchura y profundidad (768 de hidden size, 12 capas) para ajustarse al presupuesto de parametros. El vocabulario es un BPE propio de solo 2.048 tokens y la longitud de contexto es de 512 tokens.

El modelo no pretende ser un asistente util: el propio autor lo describe como un artefacto de investigacion a pequena escala que existe para que el proceso de "preentrenar un transformer desde cero" sea algo observable en tiempo real. El entrenamiento consistio en un unico paso sobre 524.288 tokens (0,4 minutos de wall time), con una perdida final de 8,2987 (perplejidad 4.018,8), un valor superior al de una distribucion uniforme sobre el vocabulario (ln 2.048 ≈ 7,625; perplejidad 2.048), lo que confirma que el modelo esta practicamente sin entrenar.

Su relevancia es, por tanto, metodologica y no de rendimiento: sirve como referencia minima reproducible para validar pipelines de preentrenamiento, probar toolchains de inferencia y cuantizacion, y estudiar el efecto del presupuesto de tokens y del tamano de vocabulario en modelos diminutos. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): SiLU MLP, RMSNorm, RoPE, atencion multi-cabeza (12 cabezas de consulta y 12 de clave/valor), embeddings atados, sin sesgos |
| Parametros totales | 114.838.272 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (ingles) |
| Licencia | odc-by (Open Data Commons Attribution License) |
| Formato de pesos | safetensors |
| Hidden size | 768 |
| Capas | 12 |
| Cabezas de atencion | 12 (KV: 12) |
| Tamano de FFN | 3.072 |
| Vocabulario | 2.048 (BPE propio entrenado sobre fineweb-edu) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con normalizacion RMSNorm, activacion SiLU en el MLP, embeddings posicionales rotatorios (RoPE) y proyecciones de atencion sin sesgo. Aunque la model card declara grouped-query attention, el numero de cabezas de clave/valor (12) coincide con el de cabezas de consulta (12), de modo que en la practica la atencion es multi-cabeza clasica. Los embeddings de entrada y de salida estan atados, lo que reduce el recuento de parametros dado el vocabulario de 2.048 tokens.

El entrenamiento se realizo sobre HuggingFaceFW/fineweb-edu con AdamW (betas 0,9 y 0,95, weight decay 0,1, gradient clipping 1,0) y un schedule de learning rate con warmup del 2 % seguido de decaimiento coseno hasta el 10 % del valor pico (3e-04). Se registro un unico paso de optimizacion que consumio 524.288 tokens en 0,4 minutos, con perdida final de 8,2987. No hay indicios de RLHF, DPO, SFT ni ajuste por instrucciones: se trata de un modelo base puro. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

Un detalle tecnico relevante para interpretar los resultados: con un vocabulario de 2.048 tokens, la entropia cruzada de una prediccion uniforme es ln(2.048) ≈ 7,625. La perdida final de 8,2987 esta por encima de ese umbral, lo que indica que el modelo apenas ha aprendido la distribucion marginal del corpus y su salida es, en terminos practicos, cercana a ruido con algunas regularidades de forma de palabra.

## Capacidades

- Generacion de texto por continuacion de secuencia (next-token prediction) sin plantilla de chat ni formato de instrucciones.
- Aprendizaje parcial de formas de palabra, colocaciones frecuentes y algo de sintaxis basica, segun la propia model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo solo declara ingles.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Ajuste por instrucciones o alineacion: no disponible (modelo base sin SFT, RLHF ni DPO).
- Tokenizador propio entrenado sobre fineweb-edu, reutilizable para experimentos de tokenizacion a pequena escala.

## Casos de uso

- Material didactico para preentrenamiento desde cero: permite reproducir el pipeline completo (tokenizador, dataset, schedule, checkpoint) y observar la curva de perdida en menos de un minuto de computo, algo inviable con modelos de escala real.
- Prueba de humo (smoke test) de infraestructura de entrenamiento: con 1 paso y 0,4 minutos de wall time, sirve para validar que un stack de entrenamiento distribuido, el cargador de datos y el guardado de checkpoints funcionan antes de lanzar un run costoso.
- Validacion de pipelines de inferencia: al ser un `LlamaForCausalLM` estandar de 0,5 GB, permite comprobar la integracion con vLLM, TGI, llama.cpp u Ollama y detectar problemas de versionado o de plantillas sin gastar GPU.
- Pruebas de cuantizacion y de la toolchain GGUF: convertir safetensors a GGUF en distintas precisiones y medir la degradacion resultante en un modelo cuyo rendimiento base ya es conocido y muy bajo, aislando el efecto de la cuantizacion.
- Investigacion sobre tokenizadores: el vocabulario BPE de 2.048 tokens entrenado sobre fineweb-edu permite estudiar como el tamano de vocabulario afecta a la compresion, a la perdida por token y a la calidad de las representaciones en regimenes de bajos recursos.
- Base para experimentos de ajuste fino o destilacion: punto de partida barato para probar recetas (LoRA, QLoRA, DPO) y comparar hiperparametros sin coste apreciable de GPU.
- Benchmarking de hardware y de frameworks: el modelo es tan pequeno que el cuello de botella pasa a ser el propio framework (overhead de kernel launch, gestion de memoria, batching), lo que lo hace util para medir latencia y throughput de infraestructura.
- Arte generativo y experimentos creativos: su salida no factual y con cohesión local limitada puede emplearse en instalaciones artisticas o piezas que exploren el fallo de los modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan evaluaciones tipo MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra tarea estandar para este modelo.

Los unicos datos cuantitativos publicados son las metricas de entrenamiento, recogidas en la tabla siguiente:

| Metrica | Valor |
|---|---|
| Tokens vistos | 524.288 |
| Pasos | 1 |
| Tokens por paso | 524.288 |
| Optimizador | AdamW (0,9; 0,95), weight decay 0,1, clip 1,0 |
| Schedule de LR | warmup 2 % + coseno hasta el 10 % (pico 3e-04) |
| Perdida final | 8,2987 |
| Perplejidad final | 4.018,8 |
| Tiempo de pared | 0,4 min |

Como referencia de interpretacion, la entropia cruzada de una prediccion uniforme sobre un vocabulario de 2.048 tokens seria ln(2.048) ≈ 7,625 (perplejidad 2.048); la perdida obtenida (8,2987) es superior, lo que indica un modelo con un aprendizaje marginal respecto a una linea base trivial.

## Requisitos de hardware

- VRAM estimada en inferencia (solo pesos): ~459 MB en FP32, ~230 MB en FP16/BF16, ~115 MB en INT8 y ~58 MB en INT4.
- Memoria adicional de cache KV: con contexto completo de 512 tokens y 12 capas de 768 dimensiones, aproximadamente 18 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. En la practica, la GPU no es un requisito.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en iGPU o CPU. El repositorio de 0,5 GB cabe en memoria de un telefono o de una Raspberry Pi.
- Opciones de despliegue: `transformers` (ruta oficial), vLLM y TGI al ser una arquitectura Llama soportada, llama.cpp u Ollama previa conversion a GGUF, y Hugging Face Inference Endpoints dado el tag `endpoints_compatible`.
- Latencia y throughput: no se han publicado cifras. Dado el tamano (~115 M de parametros), el modelo puede ejecutarse en CPU a velocidad interactiva con `transformers` o llama.cpp, y el cuello de botella previsible en GPU sera el overhead del framework mas que el computo.
- Fine-tuning: cabe en una unica GPU de consumo, e incluso en CPU para recetas LoRA basicas.

## Comparativa con modelos similares

No existe una comparacion directa de rendimiento publicada, ya que este modelo carece de evaluaciones. La tabla siguiente confronta sus caracteristicas con las de otros modelos de orden de magnitud similar; los datos de los modelos alternativos provienen de su documentacion publica.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GGUFGuy/useless-parameters | 114,8 M | 512 | 0,52 M (524.288) | 2.048 | odc-by | Hugging Face |
| GPT-2 small | 124 M | 1.024 | ~9 B (WebText) | 50.257 | MIT modificada | Hugging Face |
| Pythia-160M | 160 M | 2.048 | 300 B (The Pile) | 50.304 | Apache-2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2.048 | 600 B (SmolLM-Corpus) | 49.152 | Apache-2.0 | Hugging Face |

La diferencia clave no esta en el numero de parametros, sino en el presupuesto de tokens: useless-parameters ha visto 524.288 tokens frente a los ordenes de magnitud de miles de millones de sus competidores. La comparacion de rendimiento con estos modelos no procede, ya que estan en categorias funcionales distintas.

## Limitaciones y advertencias

- Modelo practicamente sin entrenar: un unico paso de optimizacion sobre 524.288 tokens, con perdida final (8,2987) superior a la de una distribucion uniforme sobre su vocabulario (7,625). La calidad de la salida es cercana a la de una linea base trivial.
- El propio autor advierte que el modelo "no es un asistente util y su salida no es factual"; aprende formas de palabras, colocaciones comunes y algo de sintaxis, nada mas.
- Riesgo de alucinacion: extremo. Al no tener conocimiento factual, cualquier afirmacion que genere debe considerarse no verificada por construccion.
- No es un modelo ajustado por instrucciones: no soporta formato de chat, tool calling, agentes ni razonamiento multi-paso. Usarlo como asistente requiere un SFT previo y aun asi el punto de partida es muy pobre.
- Cobertura idiomatica limitada al ingles y con un vocabulario de solo 2.048 tokens, lo que degrada fuertemente la tokenizacion de cualquier idioma no contemplado y de codigo fuente.
- Ventana de contexto muy corta (512 tokens), insuficiente para practicamente cualquier tarea de documentacion o conversacion multi-turno real.
- Licencia ODC-BY: es una licencia pensada para bases de datos, cuya aplicacion a pesos de un modelo es inusual. Permite el uso comercial con atribucion, pero conviene revisar la adecuacion legal antes de un despliegue en produccion. No hay clausulas especificas de uso aceptable en la informacion disponible.
- Sesgos: no se ha documentado ningun analisis de sesgos. Un modelo entrenado con un presupuesto tan bajo sobre fineweb-edu (corpus filtrado por criterios educativos en ingles) heredara los sesgos de ese corpus sin ninguna mitigacion posterior.
- Trazabilidad: el repositorio no tiene descargas ni likes, y las fechas de creacion y actualizacion (2026-09-13) figuran a un minuto de distancia, lo que sugiere un artefacto publicado de forma automatica por el Space de entrenamiento.
- No apto para produccion: sin evaluaciones, sin versionado de seguridad y sin soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GGUFGuy/useless-parameters
- Perfil del autor: https://huggingface.co/GGUFGuy
- Dataset de entrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Space de entrenamiento (HyperDex Trainer): https://hugging-science-hyperdex-trainer.hf.space/

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces disponibles son los que figuran en la propia model card del repositorio.
