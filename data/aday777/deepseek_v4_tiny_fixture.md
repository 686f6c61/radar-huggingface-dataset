# aday777/deepseek_v4_tiny_fixture

## Resumen

`aday777/deepseek_v4_tiny_fixture` es un fixture de arquitectura, no un modelo de lenguaje funcional. Se trata de un checkpoint de texto con pesos aleatorios de aproximadamente 0,29 millones de parámetros (290.624) y una configuración reducida que conserva los nombres de campo reales de la arquitectura `deepseek_v4` del modelo base `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`. Su propósito es permitir probar el parsing de configuración, el mapeo de nombres de tensores, el dimensionado de tablas de expertos y las rutas de carga de safetensors sin necesidad de instanciar el modelo completo, que es un MoE multimodal de gran tamaño.

El autor, aday777, lo publica bajo licencia MIT con el objetivo de facilitar el desarrollo de cargadores, planificadores de cuantización y trabajos de CI que necesiten ejercitar la nueva arquitectura `deepseek_v4` (que incluye MLA, MoE con expertos enrutados y compartidos, índice DSA, capas hash, cabezal MTP, hiperconexiones y un bloque `dspark_*`) en milisegundos y sin requerir hardware especializado. No está entrenado, no está destilado y no constituye ninguna afirmación de calidad o rendimiento.

La relevancia actual radica en que el modelo base real, DeepSeek-V4-Flash-Vision-Exp, es demasiado grande (284B parámetros según Microsoft Foundry) para pruebas unitarias o entornos de integración continua. Este fixture ofrece una geometría mínima (4 capas, hidden size 64, 8 expertos enrutados) que reproduce el esquema de campos de configuración real, permitiendo validar la lógica de carga antes de trabajar con los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek_v4` (MoE con MLA, reducida; arquitectura declarada: `DeepseekV4ForCausalLM`) |
| Parametros totales | 290.624 (float32) |
| Parametros activos | 2 de 8 expertos por token (configuracion del fixture) |
| Longitud de contexto | no disponible (no entrenado, sin tokenizer real) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT (contenido generado; la arquitectura base tiene sus propios terminos) |
| Formato de pesos | safetensors (150 tensores, 1.162.496 bytes de datos) |

## Arquitectura y entrenamiento

El fixture replica el esquema de configuración del modelo base `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` con `model_type: deepseek_v4` y `architectures: ["DeepseekV4ForCausalLM"]`. La configuración reducida conserva los nombres de campo reales: MLA (`q_lora_rank`, `o_lora_rank`, `o_groups`, `qk_rope_head_dim`), MoE (`n_routed_experts`, `n_shared_experts`, `num_experts_per_tok`, `topk_method`, `scoring_func`, `routed_scaling_factor`, `expert_dtype`), knobs de DSA/hash (`num_hash_layers`), knob de MTP (`num_nextn_predict_layers`), `swiglu_limit`, `sliding_window` y el bloque `yarn` de `rope_scaling`.

La geometría concreta es: 4 capas ocultas, hidden size 64, 4 cabezas de atención y 1 cabeza de valor, head_dim 16, q_lora_rank 32, o_lora_rank 32, o_groups 4, 8 expertos enrutados, 1 experto compartido, 2 expertos por token, tamaño intermedio MoE de 32, vocab_size 256 y dtype float32. No se incluyen tensores de visión, ni tensores MLA comprimidos, ni tensores de índice DSA, ni capas hash, ni cabezal MTP, ni hiperconexiones, ni bloque `dspark_*`. Tampoco hay tensor `lm_head` (debe atarse a `model.embed_tokens.weight` o suministrarse uno propio) y los archivos de tokenizer son marcadores de posición.

Los pesos se generaron de forma determinista con SplitMix64 (semilla 20260903), normales Box-Muller con escala 0.02, en orden de nombres ordenados. No hubo entrenamiento ni ajuste; es un checkpoint aleatorio de inicialización. La verificación realizada (sin torch en el entorno de construcción) confirma que el header safetensors parsea correctamente, que `config.json` es válido y que `checksums.txt` registra el SHA-256 de cada tensor. No se ha verificado la carga bajo una versión específica de `transformers` ni si `DeepseekV4ForCausalLM` acepta esta geometría reducida sin los tensores MLA/DSA/hash/MTP/visión.

## Capacidades

- Prueba de parsing de configuración para el tipo de modelo `deepseek_v4`, incluyendo campos MLA, MoE, DSA, hash, MTP, `swiglu_limit`, `sliding_window` y `yarn`.
- Validación del mapeo de nombres de tensores entre el checkpoint y un cargador personalizado.
- Dimensionado de tablas de expertos y comprobación de la lógica de enrutamiento y top-k (8 expertos enrutados, 1 compartido, 2 por token).
- Ejercicio de la ruta de carga de safetensors (header, offsets, alineación a 8 bytes, metadatos).
- Verificación de reproducibilidad mediante checksums SHA-256 y regeneración determinista con el script `build_fixture.py`.
- No genera texto útil, no tiene capacidades de razonamiento, código, matemáticas, visión, tool calling ni agentes. Es exclusivamente un artefacto de prueba.

## Casos de uso

- Pruebas unitarias de parsing de configuración: un equipo que desarrolla un cargador para `deepseek_v4` puede usar este fixture para validar que `AutoConfig.from_pretrained(..., trust_remote_code=True)` interpreta correctamente todos los campos nuevos sin necesidad de descargar los pesos de 284B del modelo base.
- Validación de mapeo de nombres de pesos: al integrar un convertidor de formatos (por ejemplo, de safetensors a GGUF), el fixture permite comprobar que cada tensor del checkpoint se asigna al nombre esperado en el esquema `deepseek_v4`, incluyendo los tensores de expertos enrutados y compartidos.
- Dimensionado de tablas de expertos: los desarrolladores de motores de inferencia pueden probar que el número de expertos (8 enrutados, 1 compartido) y la selección top-2 se manejan correctamente en su lógica de enrutamiento, sin necesidad de un modelo completo.
- Integración en pipelines de CI: el fixture se puede incluir en trabajos de integración continua para detectar regresiones en la carga de safetensors, en el parsing de configuración o en la generación de checksums, con un coste computacional despreciable.
- Desarrollo de planificadores de cuantización: los equipos que construyen herramientas de cuantización pueden ejercitar sus algoritmos sobre una geometría MoE pequeña y reproducible, verificando que los tensores de expertos se procesan según lo esperado.
- Pruebas de compatibilidad entre versiones de librerías: al actualizar `transformers` o `safetensors`, el fixture permite comprobar rápidamente si la arquitectura `deepseek_v4` sigue cargándose sin errores, antes de abordar el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fixture no está entrenado y no tiene capacidades de generación, por lo que no es susceptible de evaluación de calidad (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el checkpoint ocupa 1,16 MB en disco y 290.624 parámetros float32 (aproximadamente 1,16 MB en memoria).
- GPU recomendadas: ninguna; se puede cargar y procesar en cualquier CPU, incluso en entornos sin torch (la lectura puede hacerse con la biblioteca estándar de Python).
- Compatibilidad con GPU de consumo: sí, cualquier hardware es suficiente; no se requiere GPU para las pruebas de carga y parsing.
- Opciones de despliegue: no aplicable para inferencia; para pruebas de carga se puede usar `safetensors.torch.load_file` o la lectura manual del header. No es compatible con vLLM, llama.cpp, Ollama ni TGI como modelo funcional.
- Latencia y throughput: del orden de milisegundos para la carga y el parsing; no hay generación de texto.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de otros fixtures de arquitectura `deepseek_v4` con los que comparar directamente. Existen referencias a `silence09/DeepSeek-V4-Pro-Tiny` e `inference-optimization/DeepSeek-V4-2.7B-tiny` en Hugging Face, pero no se han verificado sus parámetros, geometría ni propósito. El modelo base real, `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, tiene 284B parámetros totales (13B activos) y contexto de 1M tokens, pero no es comparable con un fixture de 0,29M parámetros sin entrenar. Por tanto, la comparativa se limita a indicar que no hay alternativas equivalentes con datos conocidos.

## Limitaciones y advertencias

- No es un modelo funcional: no genera texto, no razona, no procesa imágenes y no tiene capacidades de agente o tool calling.
- No está entrenado ni destilado; los pesos son aleatorios y no representan ningún conocimiento aprendido.
- Carece de tensor `lm_head`; un cargador debe atar los pesos a `model.embed_tokens.weight` o suministrar su propio cabezal.
- Los archivos de tokenizer son marcadores de posición; no hay vocabulario real.
- No incluye tensores de visión, MLA comprimidos, DSA, hash, MTP, hiperconexiones ni `dspark_*`; un cargador multimodal completo necesitará suministrarlos.
- No se ha verificado la carga bajo una versión específica de `transformers` ni si `DeepseekV4ForCausalLM` acepta esta geometría reducida; el autor lo marca como cuestión abierta.
- La licencia MIT cubre solo el contenido generado (pesos aleatorios, configuración, scripts); la arquitectura `deepseek_v4` pertenece al modelo base y sus términos no han sido re-verificados de forma independiente.
- No es adecuado para producción ni para pruebas de calidad; su único uso válido es el desarrollo y la validación de herramientas de carga y parsing.

## Enlaces

- Repositorio del fixture: https://huggingface.co/aday777/deepseek_v4_tiny_fixture
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Repositorio de DeepSeek-V4 (GitHub): https://github.com/bailaiOWO/DeepSeek-V4
- Ficha de DeepSeek-V4-Flash en Microsoft Foundry: https://ai.azure.com/catalog/models/DeepSeek-V4-Flash
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
