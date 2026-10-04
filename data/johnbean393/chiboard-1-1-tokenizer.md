# johnbean393/chiboard-1.1-tokenizer

## Resumen

Chiboard 1.1 tokenizer es el tokenizador asociado al contrato de prompt `qwen35-chiboard-field-tokens-v3`, publicado por el usuario johnbean393. No es un modelo de lenguaje: el repositorio contiene únicamente artefactos de tokenización (`tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`), sin pesos en safetensors ni GGUF. Está pensado para el proyecto Chiboard, un IME (input method editor) de chino que combina pinyin, contexto de pantalla y salida estructurada.

El tokenizador hereda literalmente el normalizador, el pre-tokenizador (regex `[\p{L}\p{M}]+`), el post-procesador, el decodificador y el vocabulario/merges BPE de `Qwen/Qwen3.5-0.8B-Base` (revisión `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`). Sobre esa base añade los 37 tokens de Chiboard 1 (T1), con ids 248044–248080, más dos tokens nuevos de ranura de pantalla: `<|chiboard_screen_ref|>` (248081) y `<|chiboard_screen|>` (248082). La longitud total del tokenizador es 248083, mientras que el modelo conserva 248320 filas de embedding, y ningún id existente se ha modificado.

Su relevancia es de nicho pero concreta: corrige un desajuste entre el pre-tokenizador usado en entrenamiento y el usado en inferencia. T1 se entrenó con pre-tokenización de tipo Qwen2 (regex `\p{L}+`, que deja fuera las marcas combinantes), pero su GGUF se ejecuta con el pre-tokenizador `qwen35` de llama.cpp. Chiboard 1.1 unifica ambos extremos bajo la pre-tokenización de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE byte-level; normalizador, pre-tokenizador, post-procesador y decodificador copiados de `Qwen/Qwen3.5-0.8B-Base@dc7cdfe2` |
| Parametros totales | no disponible (el repositorio no publica pesos de modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la fija el modelo que consuma el tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | zh (chino), segun la etiqueta de idioma del repositorio |
| Licencia | no disponible |
| Formato de pesos | no aplica: se distribuyen `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` (sin safetensors ni GGUF) |
| Longitud del vocabulario | 248083 |
| Tokens anadidos | 39: ids 248044–248080 (37 tokens de Chiboard 1 T1) mas 248081 `<\|chiboard_screen_ref\|>` y 248082 `<\|chiboard_screen\|>` |
| Filas de embedding del modelo | 248320 |
| Clase de tokenizador | `TokenizersBackend` (transformers 5.x) |
| sha256 de `tokenizer.json` | `fe000e3ed39ed12b8d2481d527d44f93c65d37e87645d2dcc80d1bf9d50d2927` |
| chkhsh de conversion a GGUF | `d30d75d9059f1aa2c19359de71047b3ae408c70875e8a3ccf8c5fba56c9d8af4`, que mapea a `qwen35` |
| Modelo base | `Qwen/Qwen3.5-0.8B-Base` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un tokenizador BPE con almacenamiento de merges en el mismo formato de cadena que el del modelo base. El pre-tokenizador emplea la regex `[\p{L}\p{M}]+`, que incluye marcas combinantes dentro de la misma palabra, a diferencia de la regex `\p{L}+` de la clase `Qwen2Tokenizer`. El decodificador también procede del base, no del decodificador ByteLevel por defecto que reconstruye la clase Qwen2. Según el autor, en una muestra de entrenamiento de 200.000 documentos ambos pre-tokenizadores producen ids distintos en el 0,0075 % de los documentos, y todos los casos divergentes contienen marcas combinantes (emoji U+FE0F, signos de índico o tailandés, diacríticos descompuestos).

El repositorio documenta explícitamente el motivo del cambio: T1 se entrenó con pre-tokenización Qwen2 pero su GGUF se ejecuta con el pre-tokenizador `qwen35` de llama.cpp, lo que genera inconsistencias. Chiboard 1.1 entrena y ejecuta con la misma pre-tokenización de Qwen3.5. Existe una primera compilación v3 (`@177cdc85`, `tokenizer.json` con sha256 `2e62a571…`) que heredaba el pre-tokenizador de T1 y que ha quedado reemplazada.

`tokenizer_config.json` parte del de T1 con tres cambios: `tokenizer_class` pasa a `TokenizersBackend`, los dos tokens nuevos se añaden a `extra_special_tokens` y se eliminan dos claves de guardado. `chat_template.jinja` es idéntico byte a byte al de T1, y el contrato v3 no usa plantilla de chat. No se documentan datos de entrenamiento del tokenizador (corpus, número de tokens, RLHF o DPO).

## Capacidades

- Codificación y decodificación de texto chino con la pre-tokenización exacta de Qwen3.5, sin reconstrucción por parte de la clase de tokenizador.
- Serialización de prompts estructurados en seis campos: `<|chiboard_screen_ref|>`, `<|chiboard_screen|>`, `<|chiboard_context|>`, `<|chiboard_pinyin|>`, `<|chiboard_display|>` y `<|chiboard_output|>`.
- Soporte de payloads multimodales: cada payload se compone de `[app_id][<|vision_start|><|image_pad|>×N<|vision_end|>]`, y ambas partes son opcionales.
- Pre-expansión de tokens `<|image_pad|>`: el prompt se tokeniza ya expandido, con N tokens de relleno por imagen.
- Normalización de `app_id` mediante el vocabulario canónico de Chiboard, omitiendo el valor `unknown` del texto.
- Sin BOS, sin EOS y sin plantilla de chat en el lado del prompt; la finalización se cierra con `<|endoftext|>` y la pérdida se aplica solo a la finalización.
- No dispone de tool calling, function calling, modo de razonamiento ni capacidades de agente propias: esas funciones dependerían del modelo que consuma el tokenizador.
- Compatibilidad con llama.cpp tras conversión a GGUF mediante `convert_hf_to_gguf.py`.

## Casos de uso

- Entrenamiento y evaluación reproducibles: el `tokenizer_class: TokenizersBackend` fuerza a transformers 5.x a cargar `tokenizer.json` literalmente, de modo que `AutoTokenizer.from_pretrained` produce exactamente las mismas codificaciones que `tokenizers.Tokenizer.from_file("tokenizer.json")`, lo que elimina discrepancias entre el entrenador y el evaluador.
- Integración con llama.cpp para inferencia local: tras convertir a GGUF, el chkhsh resultante mapea al pre-tokenizador `qwen35`, por lo que el tokenizador usado en entrenamiento coincide con el usado en producción en CPU o GPU.
- Motores de entrada (IME) de chino con pinyin: los campos `<|chiboard_pinyin|>` y `<|chiboard_display|>` permiten separar la entrada romanizada de la salida mostrada al usuario dentro de un único flujo de tokens.
- Asistencia contextual sobre pantalla: los tokens `<|chiboard_screen_ref|>` y `<|chiboard_screen|>`, junto con los rellenos `<|image_pad|>`, permiten adjuntar capturas o referencias de pantalla al prompt sin salir del contrato de serialización.
- Validación de contratos de prompt en CI: el fragmento de guarda publicado compara las claves `normalizer`, `pre_tokenizer`, `post_processor` y `decoder` entre `AutoTokenizer` y `tokenizers.Tokenizer`, y puede incorporarse como test automático del pipeline.
- Tratamiento correcto de marcas combinantes: al usar `[\p{L}\p{M}]+`, los emoji con selector de variación U+FE0F, los signos de índico o tailandés y los diacríticos descompuestos se tokenizan de forma coherente con el modelo base, lo que evita divergencias silenciosas en corpus multilingües.
- Migración desde Chiboard 1 (T1): al mantener intactos los ids 248044–248080 y no cambiar ningún id existente, el vocabulario es compatible hacia atrás y solo se añaden dos posiciones al final.
- Preprocesado de prompts multimodales: el tokenizador acepta prompts con `<|image_pad|>` ya expandidos, lo que encaja en pipelines que generan los rellenos antes de llamar al tokenizador y evitan reprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo aportado por el autor es la comparación entre pre-tokenizadores sobre una muestra de entrenamiento:

| Metrica | Valor |
|---|---|
| Documentos de la muestra | 200.000 |
| Documentos con ids distintos entre pre-tokenizador Qwen3.5 y Qwen2 | 0,0075 % |
| Causa comun de divergencia | marcas combinantes (emoji U+FE0F, signos de indico o tailandes, diacriticos descompuestos) |

## Requisitos de hardware

- El tokenizador en sí no requiere GPU: el coste de memoria es el del vocabulario (248083 entradas) y los merges, del orden de megabytes, ejecutable en CPU.
- No se publican estimaciones de VRAM, latencia ni throughput para este repositorio.
- Cualquier requisito de VRAM depende del modelo que consuma el tokenizador; el modelo base declarado es `Qwen/Qwen3.5-0.8B-Base`, pero no se proporcionan en esta información sus requisitos de hardware.
- Opciones de despliegue documentadas: transformers 5.x con `AutoTokenizer` y `TokenizersBackend`, y llama.cpp tras la conversión a GGUF con `convert_hf_to_gguf.py`.
- No se documentan integraciones con vLLM, TGI, Ollama u otros servidores de inferencia en la información disponible.

## Comparativa con modelos similares

La comparación se establece entre tokenizadores, no entre modelos completos, ya que no hay datos de rendimiento publicados.

| Tokenizador | Deriva de | Pre-tokenizador | Tamano de vocabulario | Tokens Chiboard | Notas |
|---|---|---|---|---|---|
| Chiboard 1.1 tokenizer | `Qwen/Qwen3.5-0.8B-Base@dc7cdfe2` | `[\p{L}\p{M}]+` (Qwen3.5) | 248083 | 39 (ids 248044–248082) | Version vigente del contrato v3 |
| Chiboard 1 (T1) tokenizer | base anterior | `\p{L}+` (Qwen2), reconstruido por la clase `Qwen2Tokenizer` | no disponible | 37 (ids 248044–248080) | Entrenado con pre-tokenizacion Qwen2; su GGUF usa `qwen35` |
| Chiboard 1.1 v3 build inicial `@177cdc85` | `Qwen/Qwen3.5-0.8B-Base` | `\p{L}+` heredado de T1 | no disponible | no disponible | Sustituido; `tokenizer.json` con sha256 `2e62a571…` |
| Tokenizador base de `Qwen/Qwen3.5-0.8B-Base` | — | `[\p{L}\p{M}]+` | no disponible | 0 | Origen del normalizador, decoder y vocabulario/merges |

## Limitaciones y advertencias

- No se especifica la licencia en la informacion disponible, por lo que no puede confirmarse si el uso comercial esta permitido. La licencia del modelo base tampoco se detalla en estos datos.
- El repositorio no contiene pesos de modelo: no puede usarse para inferencia por si solo.
- Cargar el tokenizador como `Qwen2Tokenizer` o `Qwen3_5Tokenizer` reconstruye el pre-tokenizador y el decodificador a partir de constantes de clase, lo que rompe la equivalencia con `tokenizer.json`. Debe usarse `TokenizersBackend`.
- No debe pasarse un prompt ya pre-expandido a `Qwen3VLProcessor.__call__`, porque volveria a expandir cada `<|image_pad|>` y duplicaria los rellenos.
- El contrato v3 no usa plantilla de chat, sin BOS ni EOS en el prompt; aplicar una plantilla de chat por defecto alteraria la serializacion.
- La unica lengua declarada es zh; no hay evidencia de cobertura multilingue mas alla de la heredada del vocabulario de Qwen3.5.
- La diferencia del 0,0075 % frente al pre-tokenizador de T1 afecta a documentos con marcas combinantes, lo que puede sesgar metricas si se comparan evaluaciones hechas con cada version.
- Riesgo de alucinacion, sesgos y demas comportamientos generativos: no aplicables al tokenizador, pero no documentados para el modelo que lo consuma.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni de validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/johnbean393/chiboard-1.1-tokenizer
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Revision del tokenizador base citada: `Qwen/Qwen3.5-0.8B-Base@dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con este modelo o tokenizador.
