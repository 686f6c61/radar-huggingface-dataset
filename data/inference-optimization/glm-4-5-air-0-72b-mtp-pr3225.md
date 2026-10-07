# inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225

## Resumen

GLM-4.5-Air-0.72B-MTP-PR3225 es un modelo de juguete publicado por la organización `inference-optimization` como fixture de pruebas para la pull request #3225 del repositorio LLM Compressor. No es un modelo de lenguaje de producción: su backbone se inicializó de forma aleatoria y se entrenó sobre un corpus de texto sintético de un repositorio de pruebas, sin partir de pesos preentrenados. Su función es validar la carga, el guardado fragmentado en safetensors y la cuantización FP8 del camino MTP (multi-token prediction) de la arquitectura GLM-4.5-Air dentro del ecosistema vLLM/LLM Compressor.

Técnicamente reproduce la clase `Glm4MoeForCausalLM` con una configuración reducida: 46 capas, `hidden_size` de 768, 8 expertos enrutados (4 activos por token), 8 cabezas de atención y 4 cabezas KV, con 718.663.536 parámetros totales en BF16 (707.149.568 en el backbone y 11.513.600 en el módulo MTP sintético). La estimación de parámetros activos del backbone es de 547.897.088, aunque el propio autor advierte que esa cifra incluye componentes densos y de embeddings y no es una medición de FLOPs.

Su relevancia es puramente de ingeniería: sirve para reproducir el flujo de cuantización y servir modelos GLM MoE con MTP sin necesidad de descargar el checkpoint completo de GLM-4.5-Air (106B). El checkpoint va acompañado de un `validation.json` y un `artifact-manifest.json` con hashes, y no debe confundirse con un modelo conversacional funcional pese a la etiqueta `conversational`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (decoder-only) con módulo MTP; clase `Glm4MoeForCausalLM` |
| Parámetros totales | 718.663.536 (0,719B); backbone 707.149.568 + MTP 11.513.600 |
| Parámetros activos | 547.897.088 estimados (estimación de enrutamiento del backbone, excluye MTP; no es medición de FLOPs) |
| Longitud de contexto | no disponible (el corpus de entrenamiento se truncó a 160 tokens) |
| Tipos de cuantización | BF16 (pesos de origen); FP8_DYNAMIC (W8A8) validado con LLM Compressor; no disponibles otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (4 shards indexados, 1.767 tensores); assets de tokenizer incluidos |
| Capas ocultas | 46 |
| Hidden size | 768 |
| Intermediate size | 3072 |
| MoE intermediate size | 384 |
| Expertos enrutados | 8 (4 activos por token) |
| Cabezas de atención / KV | 8 / 4 |

## Arquitectura y entrenamiento

El modelo es una versión reducida de la arquitectura GLM-4.5-Air, con procedencia explícita de `zai-org/GLM-4.5-Air` (revisión `a24ceef6ce4f3536971efe9b778bdaa1bab18daa`) tanto para la arquitectura como para el tokenizer. Mantiene la profundidad original de 46 capas para que el indexado del checkpoint MTP coincida con el upstream, pero reduce el ancho: `hidden_size` de 4096 a 768, `intermediate_size` de 10944 a 3072, `moe_intermediate_size` de 1408 a 384, expertos enrutados de 128 a 8 (activos por token de 8 a 4), cabezas de atención de 96 a 8 y cabezas KV de 8 a 4. El autor indica que el `config.json` guardado es la fuente autoritativa, por lo que las cifras publicadas en la model card no coinciden exactamente con los parámetros reales del checkpoint.

El entrenamiento es de juguete: semilla 3225, optimizador AdamW con tasa de aprendizaje 0,0004 y decaimiento de peso 0,01, batch size 2 y texto truncado a 160 tokens. Se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3, sobre el corpus del flujo `create-tiny-model` del repositorio de llm-compressor más una frase corta adicional. No se usaron pesos preentrenados, no hubo RLHF ni DPO, y no se aplicaron técnicas de alineación. Las proyecciones MTP son inicializaciones sintéticas y los pesos del decodificador se copiaron de bloques del backbone ya entrenados; el MTP no se entrenó por separado.

En cuanto a validación, el autor reporta que pasaron la carga en dos GPU, la cuantización FP8_DYNAMIC, el guardado fragmentado y la generación con vLLM. La ejecución FP8 con MTP redactó 60 tokens y aceptó 0, con una salida greedy idéntica a la generación FP8 normal. La perplejidad BF16 tras recargar fue 1,191935 sobre el mismo corpus de entrenamiento, un dato que demuestra integridad de aprendizaje y recarga, no generalización.

## Capacidades

- Generación de texto autoregresiva con la clase `Glm4MoeForCausalLM` mediante `transformers`; funcional como smoke test, no como generador útil.
- Carga y ejecución del backbone con `attn_implementation="eager"` en BF16.
- Cuantización FP8_DYNAMIC (W8A8) mediante LLM Compressor y `compressed-tensors`.
- Carga opcional del módulo MTP mediante `load_context(Glm4MoeForCausalLM, load_mtp=True)`; el MTP es opt-in y la generación estándar con transformers no lo ejecuta.
- Servicio HTTP con vLLM 0.30.0 validado para el backbone cuantizado en FP8.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (sin evaluación de idiomas).
- Visión, audio o modalidades adicionales: no disponibles.

Nota: las etiquetas del repositorio incluyen `conversational` y `text-generation`, pero el propio autor califica el artefacto como fixture de arquitectura y checkpoint, no como modelo de lenguaje de producción.

## Casos de uso

- Pruebas de regresión en CI para pipelines de cuantización: el modelo se usa como entrada ligera para verificar que un recetario FP8_DYNAMIC (W8A8) con MTP compila, cuantiza y guarda correctamente antes de aplicarlo a checkpoints grandes.
- Validación del cargador MTP en LLM Compressor: permite reproducir el PR #3225 y comprobar que `load_context(..., load_mtp=True)` recupera las proyecciones MTP sin depender del checkpoint de GLM-4.5-Air.
- Smoke test de despliegue con vLLM: sirve para validar versiones de vLLM, formatos de shard safetensors y configuración de servidor en un entorno con huella de memoria mínima (aproximadamente 1,5 GB de pesos en BF16).
- Verificación de compatibilidad de versiones de transformers: el autor documenta que la carga MTP falla en transformers 5.15.0 y funciona en 5.17.0, por lo que este artefacto sirve como prueba de compatibilidad entre versiones.
- Pruebas de guardado fragmentado y de integridad de artefactos: los 4 shards con 1.767 tensores y el `artifact-manifest.json` con hashes permiten ensayar rutinas de verificación de checkpoints sin coste de descarga elevado.
- Desarrollo y depuración de la lógica de enrutamiento MoE: con 8 expertos y 4 activos por token, es barato recorrer el código de enrutamiento, balanceo de carga y estimación de parámetros activos en un modelo pequeño.
- Docencia y demostración de arquitecturas MoE: útil para explicar la estructura de un transformer MoE con módulo MTP en un portátil, sin GPU de datacenter.
- Prueba de humo de endpoints compatibles (`endpoints_compatible`): permite verificar clientes HTTP, serialización de peticiones y formatos de respuesta contra un servidor real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la perplejidad de juguete del backbone BF16 recargado: 1,191935 sobre el mismo corpus pequeño usado en entrenamiento, que no constituye una métrica de calidad generalizable.

| Métrica | Valor | Contexto |
|---|---|---|
| Perplejidad BF16 (recarga) | 1,191935 | Corpus de juguete de entrenamiento; no es generalización |
| Tokens redactados / aceptados con MTP FP8 | 60 / 0 | Comprobación de ejecución, no medición de aceleración |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No evaluados |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,44 GB solo de pesos (718,66 M de parámetros), más overhead de activaciones y caché KV; en la práctica, menos de 4 GB.
- VRAM estimada en FP8 (W8A8): aproximadamente 0,72 GB de pesos, más overhead de cuantización y calibración.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria (RTX 3060, RTX 4060, RTX 4090, A100, H100). Está validado en configuración de dos GPU, pero no necesita reparto entre dispositivos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo; también es viable en CPU con `device_map="cpu"`.
- Opciones de despliegue: `transformers` (validado con la versión 5.17.0, Torch 2.14.0+cu130), vLLM 0.30.0 (validado), LLM Compressor para cuantización, `compressed-tensors`. No hay evidencia de soporte validado en llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de velocidad y advierte explícitamente que las comprobaciones realizadas no son mediciones de aceleración.

## Comparativa con modelos similares

No se dispone de benchmarks ni de métricas de calidad que permitan comparar este fixture con alternativas de su categoría. La comparación técnicamente relevante es contra la arquitectura de la que deriva, cuyos valores originales sí se documentan en la model card.

| Aspecto | GLM-4.5-Air-0.72B-MTP-PR3225 | GLM-4.5-Air (arquitectura original) |
|---|---|---|
| Parámetros totales | 718.663.536 (0,719B) | no disponible en la ficha |
| Parámetros activos | 547.897.088 (estimación del backbone) | no disponible en la ficha |
| Capas ocultas | 46 | 46 |
| Hidden size | 768 | 4096 |
| Intermediate size | 3072 | 10944 |
| MoE intermediate size | 384 | 1408 |
| Expertos enrutados | 8 | 128 |
| Expertos activos por token | 4 | 8 |
| Cabezas de atención / KV | 8 / 4 | 96 / 8 |
| Longitud de contexto | no disponible | no disponible en la ficha |
| Licencia | MIT | se remite a la licencia del repositorio upstream |
| Pesos | Inicialización aleatoria, entrenamiento de juguete | Pesos preentrenados |

Otros modelos comparables de tamaño similar (por ejemplo, pequeños modelos densos de menos de 1B parámetros): no disponible, no se han aportado datos comparativos en la información suministrada.

## Limitaciones y advertencias

- No es un modelo de producción. El backbone se inicializó aleatoriamente y se entrenó sobre un corpus de texto sintético; carece de conocimiento del mundo, razonamiento y calidad de generación aprovechables.
- No se usaron pesos preentrenados de ninguna base. Cualquier expectativa de calidad conversacional es incorrecta pese a la etiqueta `conversational`.
- Riesgo de alucinación: total en cualquier uso generativo real, ya que no hay aprendizaje sustantivo que sustente las respuestas.
- El módulo MTP no se entrenó por separado: sus proyecciones son inicializaciones sintéticas y el decodificador copia pesos del backbone. Los resultados de aceptación observados (0 tokens aceptados de 60 redactados) no permiten afirmar ninguna aceleración por decodificación especulativa.
- La perplejidad de juguete de 1,191935 está medida sobre el mismo corpus de entrenamiento, por lo que no demuestra generalización alguna.
- Idiomas soportados no disponibles: no hay evaluación multilingüe ni declaración de cobertura idiomática.
- Longitud de contexto no declarada, con entrenamiento truncado a 160 tokens; no debe usarse con ventanas largas.
- Compatibilidad frágil: la carga MTP falla en transformers 5.15.0 según el propio autor; la versión 5.16 no fue probada; la cuantización MTP dependiente de calibración queda como trabajo pendiente.
- Licencia MIT para este artefacto, pero la arquitectura y el tokenizer proceden de `zai-org/GLM-4.5-Air`; conviene revisar la licencia del repositorio upstream antes de cualquier redistribución.
- Riesgo de confusión en producción: el nombre puede inducir a pensar que es un modelo GLM-4.5-Air destilado o comprimido, cuando es un fixture de pruebas. No debe desplegarse como servicio de usuario final.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225
- Modelo upstream de arquitectura y tokenizer: https://huggingface.co/zai-org/GLM-4.5-Air
- Revisión concreta del upstream: https://huggingface.co/zai-org/GLM-4.5-Air/tree/a24ceef6ce4f3536971efe9b778bdaa1bab18daa
- Pull request de LLM Compressor: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor probado: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors probado: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Ejemplo de cuantización FP8 con MTP para GLM-4.5-Air: https://github.com/vllm-project/llm-compressor/blob/2d5242056a8a00028686a303771ffc8e2fe27d07/examples/quantization_w8a8_fp8/glm4_5_air_mtp.py
- Flujo de creación de modelos diminutos: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Fichero de validación (referenciado en la model card): `validation.json`
- Manifiesto de artefactos con hashes (referenciado en la model card): `artifact-manifest.json`

Nota: las búsquedas web realizadas no devolvieron enlaces técnicos relevantes sobre este modelo; los resultados obtenidos eran definiciones generales del término "inferencia" en diccionarios y enciclopedias, sin relación con el artefacto.
