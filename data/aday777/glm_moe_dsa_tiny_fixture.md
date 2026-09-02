# aday777/glm_moe_dsa_tiny_fixture

## Resumen

El repositorio `aday777/glm_moe_dsa_tiny_fixture` no contiene un modelo de lenguaje entrenado, sino un **fixture de arquitectura** de 274.496 parámetros con pesos inicializados aleatoriamente. Su propósito es reproducir a escala mínima el esquema de configuración del modelo MoE `GLM-5.3` de Zhipu AI / Z.ai (arquitectura `glm_moe_dsa`, tipo `GlmMoeDsaForCausalLM`), de modo que los desarrolladores puedan probar cargadores de pesos, planificadores de cuantización y pipelines de CI sin necesidad de instanciar los 753.329.940.480 parámetros del modelo base. El autor lo describe explícitamente como un checkpoint "byte-reproducible" de inicialización aleatoria, no entrenado y sin ninguna afirmación de calidad o rendimiento.

La relevancia de este fixture radica en su utilidad práctica para el ecosistema de herramientas alrededor de GLM-5.3: permite ejercitar la lectura de `config.json`, el mapeo de nombres de tensores, el dimensionado de tablas de expertos, la contabilidad router/top-k y las rutas de carga de safetensors en milisegundos, sin necesidad de GPU o de descargar cientos de gigabytes. Incluye un script generador (`build_fixture.py`) que permite reconstruir y comparar el repositorio de forma determinista. No es un modelo para inferencia de texto, sino una pieza de infraestructura de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con Dynamic Sparse Attention, DSA) |
| Parametros totales | 274.496 (float32, 1.097.984 bytes de datos) |
| Parametros activos | 2 expertos por token (de 8 enrutados + 1 compartido), en config reducida |
| Longitud de contexto | no disponible (no especificada en la config del fixture) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantizacion) |
| Idiomas soportados | no disponible (tokenizer placeholder, sin vocabulario real) |
| Licencia | MIT |
| Formato de pesos | safetensors (113 tensores, header con alineacion a 8 bytes) |

## Arquitectura y entrenamiento

La arquitectura base es `GlmMoeDsaForCausalLM`, un modelo MoE con atención dispersa dinámica (DSA) introducido por Zhipu AI / Z.ai en GLM-5.3 (lanzado el 2026-08-25). El fixture reduce drásticamente la geometría: 4 capas ocultas en lugar de 78, `hidden_size` 64 en lugar de 6144, 8 expertos enrutados en lugar de 256, 2 expertos por token en lugar de 8, y `first_k_dense_replace` de 1 en lugar de 3. Mantiene los nombres de campos reales y el esquema de capas densas a MoE (`first_k_dense_replace`, `moe_layer_freq`, expertos enrutados y compartidos). Se omiten deliberadamente los tensores indexadores de DSA, el predictor MTP/next-n (`num_nextn_predict_layers: 0`) y el `lm_head` (el cargador debe atar los pesos a `model.embed_tokens.weight` o suministrar su propia cabeza).

El entrenamiento es inexistente: los pesos se generaron con SplitMix64 (semilla 20260901), normales Box-Muller, escala 0.02, float32 en orden row-major, consumidos en orden de nombres ordenados. El autor verificó con solo la biblioteca estándar de Python (sin torch) que el header safetensors se parsea correctamente, que los 113 tensores suman 274.496 parámetros y que los `data_offsets` son contiguos. No se verificó la carga bajo una versión específica de `transformers`, ni si `GlmMoeDsaForCausalLM` acepta esta geometría reducida sin campos adicionales.

## Capacidades

- **No es un modelo de generacion de texto**: no produce texto coherente ni tiene utilidad conversacional.
- **Prueba de carga de safetensors**: permite validar que un cargador lee correctamente los 113 tensores, sus shapes y dtypes.
- **Validacion de config**: ejercita el parseo del `config.json` con `model_type: glm_moe_dsa` y la construccion de una config reducida.
- **Mapeo de nombres de pesos**: util para verificar que el loader asigna cada tensor a su capa, experto o router correcto.
- **Dimensionado de tablas de expertos**: comprueba la logica de contabilidad de expertos enrutados y compartidos.
- **Logica router/top-k**: permite testear la seleccion de los 2 expertos por token en un entorno minimo.
- **Regeneracion determinista**: el script `build_fixture.py` reconstruye el repositorio byte a byte, util para diffing en CI.

## Casos de uso

- **Integracion continua en repositorios de transformers**: un job de CI puede instanciar este fixture en milisegundos para verificar que un cambio en el codigo de `glm_moe_dsa` no rompe la carga de pesos, sin descargar los 753B del modelo real.
- **Desarrollo de planificadores de cuantizacion**: los equipos que trabajan en cuantizacion (AWQ, GPTQ, GGUF) pueden probar sus pipelines de calibracion y conversion con un checkpoint de 0,27M de parametros antes de escalar al modelo completo.
- **Pruebas unitarias de cargadores personalizados**: si un proyecto implementa su propio loader de safetensors, este fixture permite validar el mapeo de nombres, la contiguidad de offsets y el manejo de tensores sin `lm_head`.
- **Validacion de compatibilidad de versiones**: al actualizar `transformers`, se puede comprobar si `AutoConfig.from_pretrained(..., trust_remote_code=True)` sigue reconociendo `glm_moe_dsa` y si la arquitectura acepta la geometria reducida.
- **Benchmarking de overhead de parseo**: medir el tiempo de lectura del header safetensors y la carga de tensores en entornos sin GPU, con un repo de 0,0 GB.
- **Educacion y depuracion**: para desarrolladores que quieren entender la estructura interna de un MoE con DSA, este fixture ofrece un arbol de tensores legible y reproducible sin los costes del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta entrenado y no tiene ninguna capacidad de generacion, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- **VRAM estimada**: menos de 2 MB (274.496 parametros float32 = 1,1 MB). Cabe en cualquier dispositivo, incluso microcontroladores con soporte de float32.
- **GPU recomendada**: ninguna. Funciona en CPU con la biblioteca estandar de Python o con `safetensors` sin torch (aunque el uso tipico requerira torch para instanciar el modelo).
- **GPU de consumo**: no aplica, cualquier hardware moderno lo ejecuta.
- **Opciones de despliegue**: carga directa con `safetensors.torch.load_file`, o con `transformers` si se construye una config desde `config.json`. No requiere vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: no medidos, pero al ser 113 tensores de tamano minimo, la carga completa deberia completarse en milisegundos en cualquier maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Uso |
|---|---|---|---|---|---|
| `aday777/glm_moe_dsa_tiny_fixture` | 274.496 | no disponible | MoE DSA reducida | MIT | Testing/CI |
| `zai-org/GLM-5.3` (base) | 753.329.940.480 | no disponible | MoE DSA completa | MIT | Inferencia real |
| Otros fixtures de arquitectura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado fixtures comparables publicados en la busqueda web. La comparativa con el modelo base es la unica relevante: el fixture mantiene los nombres de campo y el esquema de capas, pero reduce todas las dimensiones a minimos operativos.

## Limitaciones y advertencias

- **No es un modelo entrenado**: los pesos son ruido aleatorio (SplitMix64 + Box-Muller, escala 0.02). Cualquier salida de generacion sera basura sin sentido.
- **Sin tokenizer real**: los archivos de tokenizer son placeholders; no hay archivo de vocabulario. Se debe suministrar un tokenizer externo.
- **Sin `lm_head`**: el cargador debe atar los pesos a `model.embed_tokens.weight` o añadir su propia cabeza de salida.
- **Sin atencion dispersa real**: se omiten los tensores indexadores de DSA, por lo que no se puede probar la logica de atencion dispersa.
- **Sin MTP/next-n predictor**: `num_nextn_predict_layers: 0`, no se puede testear esa parte de la arquitectura.
- **Compatibilidad no verificada**: el autor no ha probado la carga bajo una version especifica de `transformers`; puede fallar si `GlmMoeDsaForCausalLM` requiere campos adicionales.
- **Fecha futura**: el repositorio fue creado el 2026-09-01, lo que sugiere que el ecosistema `transformers` aun no lo soporta oficialmente (el blog de magik.net documenta problemas con `trust_remote_code`).
- **Uso comercial**: licencia MIT, sin restricciones conocidas, pero al ser un fixture de prueba no tiene valor productivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aday777/glm_moe_dsa_tiny_fixture
- Documentacion de transformers para `glm_moe_dsa`: https://huggingface.co/docs/transformers/main/en/model_doc/glm_moe_dsa
- Codigo fuente de `glm_moe_dsa` en transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/glm_moe_dsa
- Proyecto Colibri (inferencia de MoE frontier en hardware consumer, menciona GLM-5.2): https://github.com/JustVugg/colibri
- DeepWiki sobre GLM-MoE-DSA en VeOmni: https://deepwiki.com/ByteDance-Seed/VeOmni/6.5-glm-moe-dsa-and-other-models
- Blog sobre el puzzle de `glm_moe_dsa` en sglang: https://magik.net/blog/llmopt/seg_1/chunk_0/glm_moe_dsa_puzzle.html
