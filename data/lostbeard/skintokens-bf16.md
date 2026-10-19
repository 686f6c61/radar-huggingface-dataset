# LostBeard/SkinTokens-bf16

## Resumen

LostBeard/SkinTokens-bf16 es una **conversion de formato**, no un modelo entrenado desde cero. Contiene los tensores de inferencia del checkpoint GRPO de VAST-AI/SkinTokens (`experiments/articulation_xl_quantization_256_token_4/grpo_1400.ckpt`), el modelo TokenRig, reempaquetados en un unico fichero `skintokens.safetensors` de 1,15 GB con 512 tensores en bf16, pensado para la reimplementacion en C# sobre ILGPU del repositorio SpawnDev.ILGPU.ML.

El modelo original, desarrollado por VAST AI Research (en colaboracion con Tsinghua, segun la prensa especializada), resuelve el problema del *rigging* automatico: a partir de una malla de personaje genera el esqueleto y los pesos de skin por vertice. Su aportacion es tratar todo el rig como una unica secuencia de tokens discretos, generada de forma autoregresiva, lo que unifica esqueleto y skinning en un solo modelo en lugar de dos etapas separadas.

La relevancia de esta ficha concreta es practica: es la variante que permite ejecutar TokenRig en GPU de escritorio o en navegador via WebGPU desde .NET, y sirve como referencia de como se reorganizan las proyecciones fusionadas (QKV, gate/up) para consumir el checkpoint desde un runtime que no es PyTorch. El autor verifica la fidelidad del port comparando contra las clases originales de PyTorch, con un error relativo RMS de 5,7e-5 en los pesos de skin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con capas tipo Qwen3 (atencion y MLP), encoder de malla tipo Michelangelo y VAE con bloques Tripo2; representacion discreta FSQ |
| Parametros totales | no disponible (1,15 GB en bf16, 512 tensores; ~575 M estimados solo por tamano de fichero, sin confirmar) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repo); existe una conversion GGUF BF16 de terceros |
| Idiomas soportados | no disponible (la salida es una secuencia de tokens de rig, no texto en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, fichero unico `skintokens.safetensors`, bf16 |

## Arquitectura y entrenamiento

TokenRig modela el rig completo (esqueleto mas pesos de skinning por vertice) como una sola secuencia de tokens y la genera de forma autoregresiva. La skinning weights se representan con un esquema de cuantizacion discreta FSQ; el checkpoint convertido corresponde a la variante de 256 tokens (`articulation_xl_quantization_256_token_4`). El pipeline incluye un encoder de malla de estilo Michelangelo para codificar la geometria de entrada y un VAE con bloques Tripo2 cuya atencion intercala q, k y v por cabeza. El backbone autoregresivo usa capas con la estructura de Qwen3 (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`).

El checkpoint de origen es un refinamiento con GRPO sobre 1400 pasos (`grpo_1400`), es decir, el modelo publicado incorpora una etapa de optimizacion por refuerzo tras el entrenamiento supervisado. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion empleadas mas alla de esa etapa GRPO; esa informacion no aparece en la documentacion consultada. La linea de trabajo es continuista respecto de UniRig, del mismo grupo.

Sobre esta conversion en concreto: no se reentrena nada. Los tensores bf16 se conservan intactos; se eliminan los tensores exclusivos de entrenamiento (lado de entrada del encoder y del cuantizador del VAE); se fusionan `q_proj`/`k_proj`/`v_proj` en `self_attn.qkv_proj` con filas `[q | k | v]` y `gate_proj`/`up_proj` en `mlp.gate_up_proj`; y se reagrupan las proyecciones de atencion del encoder Michelangelo de `[head][part][dim]` a `[part][head][dim]`, igual que `attn1.qkv.weight` y `attn2.kv.weight` del VAE. Los buffers no persistentes (tablas de frecuencia y fase del VAE, `inv_freq` de Qwen3) no se almacenan: se recalculan en el runtime y deben redondearse a bf16 para reproducir el comportamiento original.

## Capacidades

- Generacion de esqueletos para mallas de personajes arbitrarias: humanoides, animales y criaturas estilizadas, segun la documentacion del proyecto original.
- Prediccion de pesos de skin por vertice, aprendidos, no heuristicos, en la misma secuencia de tokens que el esqueleto.
- Generacion autoregresiva unificada: un solo paso de decodificacion produce el rig completo, sin etapas separadas de deteccion de joints y pintado de pesos.
- Codificacion de geometria de malla mediante encoder dedicado (Michelangelo) y decodificacion de pesos a traves de un VAE.
- Representacion discreta compacta (FSQ, variante de 256 tokens) que reduce el coste de secuencia frente a una regresion densa por vertice.
- Ejecucion en GPU de escritorio y en navegador via WebGPU mediante SpawnDev.ILGPU.ML, y en CPU/Vulkan mediante la conversion C++/GGML de terceros.
- No soporta tool calling, function calling, agentes, vision general ni modo *thinking*: no es un modelo de lenguaje conversacional.

## Casos de uso

- **Auto-rigging en pipelines de produccion de videojuegos**: el modelo recibe una malla de personaje y devuelve esqueleto y pesos de skin listos para importar en el DCC, sustituyendo el trabajo manual de construir el skeleton y pintar pesos vertice a vertice.
- **Procesado por lotes de bibliotecas de assets**: al ser un fichero de 1,15 GB en bf16, se puede mantener residente en una GPU consumer y aplicar a cientos de mallas en una cola nocturna, con un coste por asset muy inferior al rigging manual.
- **Herramientas interactivas en navegador**: la implementacion en C#/ILGPU con backend WebGPU permite ofrecer un auto-rigger dentro de una pagina web sin instalar nada, util para previsualizacion rapida de assets generados por IA 3D.
- **Prototipado rapido en pipelines de IA generativa 3D**: encadenar text-to-3D o image-to-3D con este modelo para entregar personajes ya articulados en lugar de estatuas estaticas, que es el cuello de botella habitual en esos flujos.
- **Investigacion sobre representaciones discretas de rigging**: el checkpoint permite reproducir y extender el esquema FSQ de 256 tokens, comparando el refinamiento GRPO frente a la linea base supervisada.
- **Integracion como plugin en herramientas de DCC**: el port a C# facilita incrustar la inferencia en un plugin de Unity o en una herramienta de escritorio .NET, sin dependencia de un entorno Python.
- **Validacion cruzada de ports y runtimes**: sirve como referencia para verificar una implementacion nueva contra PyTorch, ya que el autor documenta la equivalencia numerica (5,7e-5 RMS relativo en pesos de skin) y el script de exportacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una comprobacion de fidelidad de la conversion: la secuencia de tokens coincide con la del modelo original y los pesos de skin presentan un error relativo RMS de 5,7e-5 usando kernels exactos. No hay datos de calidad de rigging (por ejemplo, error de articulacion, precision de joints o comparativas con UniRig) en el material consultado.

## Requisitos de hardware

- VRAM estimada: en torno a 1,2 GB solo para los pesos en bf16; con overhead de runtime y buffers intermedios, un presupuesto practico de 2 a 3 GB.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso tarjetas de 4 GB. No requiere A100 ni H100.
- Ejecucion en navegador via WebGPU con SpawnDev.ILGPU.ML, o en CPU y Vulkan mediante la conversion GGML de localai-org/skin-tokens.cpp.
- Despliegue: runtime propio de SpawnDev.ILGPU.ML (C#), skin-tokens.cpp (C++/GGML, con soporte de batching, cache strides y beam slots), y MLX en Apple Silicon a traves de mlx-community/SkinTokens-bf16.
- No es desplegable en vLLM, TGI, llama.cpp ni Ollama como modelo de lenguaje, porque no genera texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LostBeard/SkinTokens-bf16 (esta ficha) | no disponible (~575 M estimados) | no disponible | safetensors bf16, proyecciones fusionadas | MIT | Conversion para C#/ILGPU, pesos reorganizados para runtime no PyTorch |
| VAST-AI/SkinTokens (original) | no disponible | no disponible | checkpoint PyTorch | MIT | Referencia canonica, incluye tensores de entrenamiento y buffers no persistentes |
| mlx-community/SkinTokens-bf16 | no disponible | no disponible | safetensors bf16 | no disponible | Conversion para MLX / Apple Silicon |
| chibifire/SkinTokens-GGUF-BF16 | no disponible | no disponible | GGUF (matrices BF16, tensores 1-D en F32) | no disponible | Conversion de formato para ecosistema GGML |
| UniRig (VAST-AI) | no disponible | no disponible | no disponible | no disponible | Linea de trabajo predecesora citada en la model card; no se dispone de especificaciones en la informacion consultada |

## Limitaciones y advertencias

- **Es una conversion, no un modelo nuevo**: cualquier evaluacion de calidad debe atribuirse al checkpoint original de VAST-AI/SkinTokens; esta ficha solo documenta el reempaquetado.
- **Compatibilidad restringida al runtime**: los pesos tienen proyecciones fusionadas (`qkv_proj`, `gate_up_proj`) y un orden de filas especifico (`[part][head][dim]`). Cargarlos con un runtime que espere el layout original de PyTorch producira resultados incorrectos sin aviso.
- **Buffers recalculados**: las tablas de frecuencia y fase del VAE y el `inv_freq` de Qwen3 no estan en el fichero. Si el runtime no los regenera y los redondea a bf16, la salida divergira del original.
- **Sin datos de sesgo ni de robustez**: no hay informacion publicada sobre el comportamiento con mallas degeneradas, topologias no manifold, personajes muy estilizados o geometrias con oclusiones.
- **Riesgo de rigging incorrecto**: al ser un modelo generativo, puede producir esqueletos plausibles pero anatomicamente invalidos o pesos que deforman mal en zonas de alta curvatura; requiere validacion en produccion.
- **Idiomas y contexto**: no disponibles; no aplica la evaluacion multilingue habitual porque la salida no es texto.
- **Licencia**: MIT, lo que permite uso comercial, pero conviene conservar la atribucion a los autores de SkinTokens, UniRig y VAST AI Research, tal como hace la propia model card.
- **Metricas ausentes**: sin benchmarks publicados no es posible comparar su calidad de rigging de forma objetiva frente a alternativas.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/LostBeard/SkinTokens-bf16
- HuggingFace (modelo original): https://huggingface.co/VAST-AI/SkinTokens
- Repositorio original en GitHub: https://github.com/VAST-AI-Research/SkinTokens
- Paper: SkinTokens: A Learned Compact Representation for Unified Autoregressive Rigging (arXiv:2602.04805) — https://arxiv.org/abs/2602.04805
- Runtime de destino (C#/ILGPU): https://github.com/LostBeard/SpawnDev.ILGPU.ML
- Conversion MLX: https://huggingface.co/mlx-community/SkinTokens-bf16
- Conversion GGUF: https://huggingface.co/chibifire/SkinTokens-GGUF-BF16
- Conversion C++/GGML: https://github.com/localai-org/skin-tokens.cpp
- Articulo divulgativo: https://www.ik3d.fr/skintokens-tsinghua-and-vast-just-turned-rigging-into-a-language-and-the-dead-statue-era-of-ai-3d-is-on-the-clock/
