# msuiche/DeepSeek-V4-Flash-Vision-Exp-NVFP4

## Resumen

DeepSeek-V4-Flash-Vision-Exp-NVFP4 es una conversión de cuantización NVFP4 (W4A4) del modelo multimodal experimental `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, publicada por msuiche. El modelo original, desarrollado por DeepSeek, combina el backbone MoE de DeepSeek-V4-Flash con una torre de visión de 32 capas, alcanza un contexto de 1 millón de tokens e incorpora un módulo de borrador DSpark para decodificación especulativa. Esta variante cuantizada reduce el peso de los expertos enrutados a 4 bits, manteniendo el resto de componentes en su precisión original, lo que permite servir el modelo con kernels FP4 de vLLM en hardware Blackwell.

La relevancia de esta ficha radica en que es una de las primeras conversiones NVFP4 verificadas byte-exact contra la receta oficial de NVIDIA para este modelo, con validación en stacks vLLM reales. El repositorio incluye además herramientas como `strip_vision.py` para ejecutar el modelo en modo solo texto con vLLM estándar, y es compatible con vectores de control GLP del ecosistema weightless. Con 304,6 mil millones de parámetros totales y licencia MIT, ofrece una vía práctica para desplegar un MoE multimodal de gran tamaño en entornos con GPUs Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención MLA, torre de visión de 32 capas, módulo de borrador DSpark |
| Parametros totales | 304.646.824.126 (~304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A4) en los 11.008 lineales de expertos enrutados; atención, router, expertos compartidos, MTP, embeddings y torre de visión en precisión original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (ModelOpt) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es un MoE con 256 expertos enrutados por capa distribuidos en 43 capas, atención MLA (Multi-head Latent Attention) para eficiencia de KV cache, una torre de visión de 32 capas y un módulo de borrador DSpark fusionado para decodificación especulativa. Sobre este checkpoint, el autor de esta conversión no realizó un entrenamiento ni una calibración nueva: los pesos de los expertos enrutados ya estaban almacenados en MXFP4 en el checkpoint canónico de DeepSeek, y este repositorio los transcodifica sin pérdida al formato NVFP4 con escala por bloque que esperan los kernels MoE FP4 de vLLM (`modelopt`). La verificación confirma que los bytes de peso son exactos frente a la receta oficial de NVIDIA `nvidia/DeepSeek-V4-Flash-NVFP4`, tomando únicamente los `input_scale` por capa de esa referencia como prior. El resto de componentes (atención, router, expertos compartidos, capas MTP, embeddings y torre de visión) se conservan sin cambios en su precisión original.

## Capacidades

- Multimodal: acepta entrada de texto e imagen y genera salida de texto.
- Razonamiento y generación de texto con ventana de contexto de 1 millón de tokens.
- Generación de codigo y soporte para tareas de programacion con contexto largo.
- Compatible con decodificacion especulativa gracias al modulo de borrador DSpark del modelo base.
- Integrable en agentes multimodales mediante DeepSeek Harness 0.1.1, que ofrece soporte nativo para este modelo.
- Compatible con vectores de control GLP del ecosistema weightless para modulacion de comportamiento (steering) sin degradacion por cuantizacion.
- Variante solo texto disponible mediante `strip_vision.py` para entornos vLLM sin soporte de vision.

## Casos de uso

- Analisis de documentos extensos con imagenes: el contexto de 1M de tokens permite procesar informes tecnicos, manuales o expedientes completos con diagramas y capturas, extrayendo informacion cruzada entre texto y figuras en una sola pasada.
- Agentes multimodales automatizados: con DeepSeek Harness 0.1.1, el modelo puede actuar como nucleo de agentes que interpretan pantallas, graficos o formularios y ejecutan acciones multi-paso, gracias a su capacidad de razonamiento y a la cuantizacion NVFP4 que reduce el coste de inferencia en GPUs Blackwell.
- RAG multimodal sobre documentacion corporativa: al admitir imagenes y texto, puede indexar y responder consultas sobre bases de conocimiento que incluyan esquemas, diagramas de arquitectura o capturas de interfaces.
- Generacion de codigo con contexto amplio: desarrolladores pueden adjuntar capturas de pantalla de errores o diagramas de flujo junto con repositorios extensos, y el modelo genera o corrige codigo considerando el contexto completo gracias a la ventana de 1M tokens.
- Moderacion de contenido visual y textual: el modelo puede clasificar imagenes y texto asociado en un solo paso, aprovechando la torre de vision y la salida de texto para generar informes estructurados.
- Investigacion academica y prototipado: la licencia MIT y el formato abierto safetensors permiten experimentar con cuantizacion NVFP4, evaluar la fidelidad de la transcodificacion y comparar comportamientos de steering sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion proporcionada es una validacion de calidad de cuantizacion sobre vLLM v0.28.0 con 2×B200 y TP=2, usando un clasificador de cuatro estados con decodificacion greedy. Los resultados comparan la variante NVFP4 contra el mismo modelo en FP8 servido en dos entornos distintos (HF lane y vLLM lane):

| Prueba | FP8 (HF lane) | FP8 (vLLM lane, control) | NVFP4 (este repo) |
|---|---|---|---|
| stock refusal (32 muestras) | 1/32 | 1/32 | 2/32 |
| steered α=1.0 (direccion fresca) | 27/32 | 19/32 | 18/32 |
| steered α=1.0 (keysdir) | 31/32 | 13/32 | 14/32 |
| benign (32 muestras) | 32/32 | 32/32 | 32/32 |
| capability (12 muestras) | — | 12/12 | 12/12 |

El autor atribuye las diferencias entre NVFP4 y las lineas FP8 antiguas a un efecto de entorno (KV cache FP8 y conjunto de kernels), no a perdida por cuantizacion: el control FP8 en el mismo stack vLLM produce resultados equivalentes a NVFP4 (diferencia de ±1 item con intervalos de confianza solapados). No se reportan salidas corruptas en ningun caso.

## Requisitos de hardware

- Validado en 2×B200 (sm100) con vLLM, tensor-parallel-size 2 y `--kv-cache-dtype fp8`, usando el kernel `flashinfer::trtllm_fp4_block_scale_moe`.
- Compatible con GB10 (DGX Spark) mediante el plugin `modelopt_gb10_hybrid`, que espera exactamente este layout W4A4.
- No soportado de forma nativa en H100 (sm90): no existe kernel W4A4 MoE para esta forma; requeriria `moe_backend="marlin"` (W4A16, descarta escalas de activacion) y no ha sido probado.
- Tamano del repositorio: 176,5 GB en safetensors cuantizados; la VRAM exacta para inferencia no se especifica, pero la cuantizacion NVFP4 de los expertos reduce significativamente el peso frente al checkpoint FP8.
- Despliegue recomendado con vLLM (comando documentado en la model card) y herramientas del ecosistema ModelOpt; no se mencionan alternativas como llama.cpp u Ollama.
- Para entornos sin soporte de vision en vLLM, es necesario ejecutar `strip_vision.py` para obtener una variante solo texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (base) | 304,6B | 1M | FP8 (checkpoint original) | MIT | Modelo multimodal original de DeepSeek, sin transcodificar |
| nvidia/DeepSeek-V4-Flash-NVFP4 | 304,6B | 1M | NVFP4 (receta oficial NVIDIA) | MIT | Referencia byte-exacta para los pesos de expertos de este repo |
| msuiche/DeepSeek-V4-Flash-Vision-Exp-NVFP4 (este) | 304,6B | 1M | NVFP4 (expertos) + precision original (resto) | MIT | Transcodicacion sin perdida, validada en vLLM con B200 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos multimodales de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NVFP4 aplica solo a los expertos enrutados; el resto de componentes se mantiene en precision original, por lo que el ahorro de memoria no es uniforme en todo el modelo.
- No hay soporte nativo para H100: en GPUs sm90 no existe kernel W4A4 MoE para esta forma, y la alternativa W4A16 via marlin no ha sido probada y degrada las escalas de activacion.
- La torre de vision no es compatible con el vLLM estandar (la clase `DeepseekV4ForCausalLM` es solo texto); para usar el modelo completo se necesita un runtime con soporte de vision, o bien la variante solo texto generada con `strip_vision.py`.
- El modelo es experimental (sufijo Exp) y la validacion publicada cubre un conjunto limitado de pruebas de calidad de cuantizacion, no evaluaciones exhaustivas de seguridad o sesgo.
- No se han publicado benchmarks estandar de capacidades (MMLU, HumanEval, GSM8K, etc.) para esta variante especifica.
- Los idiomas soportados no estan documentados en el repositorio; la cobertura multilingue del modelo base no se especifica.
- El uso de vectores de control GLP (steering) requiere herramientas del ecosistema weightless y un hotfix de vLLM; los resultados de entrega dependen del entorno de ejecucion, como muestra la tabla de validacion.
- Riesgo de alucinacion y sesgos propios de un modelo multimodal de gran tamano no mitigados por esta conversion; se recomienda validacion en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/msuiche/DeepSeek-V4-Flash-Vision-Exp-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- README del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/main/README.md
- Receta vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Articulo sobre lanzamiento y precios: https://www.digitalapplied.com/blog/deepseek-v4-flash-vision-exp-launch-pricing
- Analisis de benchmarks de agentes multimodales: https://explainx.ai/blog/deepseek-v4-flash-vision-exp-multimodal-agent-august-2026
- Repositorio de validacion (refusal-research): https://github.com/msuiche/refusal-research
- Recetas weightless: https://github.com/msuiche/weightless
- Modelo abliterado con vectores GLP: https://huggingface.co/msuiche/DeepSeek-V4-Flash-Vision-Exp-abliterated-cyber-GLP-29
