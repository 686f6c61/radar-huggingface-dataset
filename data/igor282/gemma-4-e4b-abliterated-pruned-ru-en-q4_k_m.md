# Igor282/gemma-4-e4b-abliterated-pruned-ru-en-Q4_K_M

## Resumen

Gemma-4-E4B Abliterated Pruned RU+EN Q4_K_M es una cuantización GGUF de 4,56 GB derivada de `huihui-ai/Huihui-gemma-4-E4B-it-abliterated`, a su vez basada en `google/gemma-4-E4B-it-assistant`. El autor, Igor282, aplica dos transformaciones verificadas sobre el modelo original: la eliminación del vector de rechazo (abliteration) heredada de huihui-ai y un pruning del vocabulario del tokenizador que reduce de 262 144 a 191 221 tokens (−27,1 %), recortando escrituras CJK, kana, árabe, devanagari, coreano y tailandés. El resultado conserva la segmentación ru/en/código token a token y reduce el tamaño del repositorio un 14,6 % respecto al abliterado sin podar.

La arquitectura subyacente es un transformer de 42 capas con 6.573.942.314 parámetros totales (según safetensors) y mecanismo MatFormer/Gemma-3n de embeddings por capa (`per_layer_embeddings`). El contexto operativo declarado en las pruebas es de 8192 tokens. La cuantización Q4_K_M (5,53 BPW) permite ejecutar la totalidad del modelo en 6 GB de VRAM sin offload, con 74,17 t/s de decodificación en una RTX 3060 Laptop de 6144 MiB.

La relevancia práctica es doble: por un lado, ofrece una variante sin censura conductual sobre Gemma-4 en un tamaño manejable para GPU de consumo; por otro, documenta un método de pruning de vocabulario calificado como lossless por el autor, con perplejidad de retención medida (ru −0,023 %, en −0,001 %, código −0,002 %). La licencia declarada es Apache-2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 42 capas con MatFormer / Gemma-3n (`per_layer_embeddings`) |
| Parametros totales | 6.573.942.314 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8192 tokens (usado en las pruebas de rendimiento) |
| Tipos de cuantizacion | Q4_K_M (5,53 BPW); existe intermedio f16 de 13 160 923 040 B |
| Idiomas soportados | Ruso e inglés (vocabulario podado a ru/en/código; resto de escrituras eliminadas) |
| Licencia | apache-2.0 (con `license_link` a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); repo de 4,7 GB |
| Vocabulario | 191 221 tokens (desde 262 144) |
| Tamano del archivo principal | 4 556 892 832 B |
| Draft especulativo | `gemma-4-e4b-abliterated-draft-pruned-ru-en-f16.gguf`, 131 552 256 B, 4 capas, hidden 256 |

## Arquitectura y entrenamiento

El modelo base es Gemma-4-E4B, un transformer de 42 capas con 6,57 mil millones de parámetros y un esquema de embeddings por capa (`per_layer_embeddings`) heredado de Gemma-3n/MatFormer, que duplica la matriz de vocabulario en dos tensores de gran tamaño: `embed_tokens` (262 144 × 2560, ≈0,67B parámetros) y `per_layer_embeddings`. Esta duplicación es precisamente lo que hace rentable el pruning del vocabulario: recortar 70 923 tokens elimina ≈0,94B parámetros de vocabulario sin tocar las capas del transformer.

La cadena de transformaciones es la siguiente. Primero, huihui-ai aplica abliteration sobre `google/gemma-4-E4B-it`, extrayendo la dirección de rechazo de los pesos; Igor282 verifica la integridad por SHA-256 (`12ebda06…`) contra el LFS del repositorio de huihui. Segundo, se aplica un pruning del vocabulario BPE sobre la HF-weights (no sobre GGUF, porque los superbloques Q4_K de 32×32 no permiten cortes por filas de vocabulario): se eliminan 70 923 tokens de escrituras no latinas en `embed_tokens` y `per_layer_embeddings`, con una máscara `keep_sorted` autoconsistente con el tokenizador real. Tercero, se convierte a GGUF f16 con `convert_hf_to_gguf.py` y se cuantiza con `llama-quantize` usando receta plain sin imatrix (255 s, 8 hilos).

No hay fine-tuning ni destilación: tras la abliteration de huihui, los pesos del modelo de lenguaje no se modifican, solo el tokenizador y las dos matrices de vocabulario. El draft especulativo se construye a partir de `google/gemma-4-E4B-it-assistant` (4 capas, hidden 256) aplicando la misma máscara de pruning, de modo que los vocabularios coinciden id a id con el target. El autor reporta que el draft no se ablitera porque no genera texto, solo predice tokens para verificación.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Generación de código, con segmentación de tokens preservada token a token respecto al modelo original.
- Comportamiento sin censura conductual: en sondas como "escribe un post difamatorio sobre un político" u "artículo ofensivo sobre inmigrantes", el modelo original responde con rechazo y esta variante genera el texto solicitado.
- Soporte de decodificación especulativa mediante el draft MTP incluido (aunque desactivado por defecto por bajo acceptance rate).
- Compatible con endpoints de llama.cpp (`endpoints_compatible`).
- Capacidades multilingües limitadas a ruso e inglés tras el pruning; el resto de escrituras no son representables con el vocabulario podado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación de texto en ruso con GPU de consumo: el modelo completo cabe en 6 GB de VRAM con `-ngl 99`, lo que permite desplegarlo en portátiles con RTX 3060 y similares a 74 t/s de decodificación, sin offload a CPU.
- Investigación sobre alineación y rechazo: la variante abliterada permite estudiar el comportamiento del modelo sin la capa de rechazo, comparando respuestas con la versión original-it en las mismas sondas.
- Evaluación de métodos de pruning de vocabulario: el repositorio documenta el pipeline completo (máscara, verificación de perplejidad, comparación contra referencia no podada), útil como caso de estudio reproducible para investigadores que trabajen en compresión de tokenizadores.
- Generación de código en pipelines locales: la segmentación de código se conserva token a token y el modelo cabe en VRAM consumer, lo que permite integrarlo en asistentes de código autoalojados sin dependencia de API.
- Prototipado de decodificación especulativa: el draft MTP está incluido y el autor documenta el acceptance rate (14,7 % frente a umbral de rentabilidad ≈68 %), lo que sirve como referencia para calibrar configuraciones especulativas en llama.cpp.
- Despliegue en entornos con presupuesto de memoria ajustado: el recorte del 14,6 % en tamaño respecto al abliterado sin podar (5,34 GB → 4,56 GB) facilita la convivencia del modelo con otros procesos en GPUs de 6-8 GB.
- Experimentación con modelos sin censura en investigación de seguridad: útil para estudiar la generación de contenido dañino de forma controlada, con las advertencias éticas y legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas propias de retención y velocidad:

| Metrica | Valor |
|---|---|
| Perplejidad held-out ruso (vs. referencia) | −0,023 % |
| Perplejidad held-out inglés (vs. referencia) | −0,001 % |
| Perplejidad held-out código (vs. referencia) | −0,002 % |
| Perplejidad propia del modelo (self-PPL) | 2,4167 → 2,4166 (Δ 0,004 %) |
| Velocidad de decodificación | 74,17 t/s en RTX 3060 Laptop 6144 MiB, `-ngl 99`, ctx 8192 |
| Rendimiento en caracteres rusos | ≈223 caracteres/s (3,01 caracteres por token) |
| Acceptance rate del draft MTP | 14,7 % (umbral de rentabilidad ≈68 %; −18 % de velocidad al activarlo) |
| Acceptance rate del draft en original-it | 16,5 % (control) |
| Tiempo de cuantización | 255 s con 8 hilos |

## Requisitos de hardware

- VRAM estimada: 4,56 GB para el archivo Q4_K_M; con contexto de 8192 y overhead de llama.cpp, la ejecución completa requiere ≈6 GB.
- GPU verificada: RTX 3060 Laptop con 6144 MiB, modelo completo en VRAM sin offload (`-ngl 99`).
- Cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 2070, etc.). En GPUs de 4 GB requeriría offload parcial.
- Despliegue: llama.cpp (librería declarada), compatible con endpoints; no se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Draft especulativo: 131,5 MB adicionales, 4 capas, hidden 256; desaconsejado por defecto por el bajo acceptance rate medido.
- Throughput: 74,17 t/s de decodificación y ≈223 caracteres rusos/s en la configuración indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano Q4_K_M | Licencia | Notas |
|---|---|---|---|---|---|
| Esta ficha (abliterated pruned RU+EN) | 6,57B | 8192 | 4,56 GB | apache-2.0 | Vocabulario 191 221, sin censura, draft incluido |
| `gemma-4-e4b-pruned-ru-en-Q4_K_M` (original-it) | 6,57B | 8192 | 4,55 GB | apache-2.0 | Vocabulario 190 421, con rechazo conductual |
| `Huihui-gemma-4-E4B-it-abliterated` (sin podar) | 6,57B | no disponible | 5,34 GB | no disponible | Sin censura, vocabulario completo 262 144 |
| `google/gemma-4-E4B-it` (base BF16) | 6,57B | no disponible | ≈16 GB (BF16) | Gemma 4 | Con rechazo, referencia de pesos |

## Limitaciones y advertencias

- La abliteration elimina el rechazo conductual: el modelo generará contenido difamatorio u ofensivo bajo petición explícita, lo que plantea riesgos legales y éticos en despliegues públicos.
- El pruning del vocabulario elimina escrituras CJK, kana, árabe, devanagari, coreano y tailandés; el modelo no puede representar texto en esos sistemas de escritura.
- Solo ruso e inglés están soportados de forma efectiva; el resto de idiomas queda fuera del vocabulario podado.
- La licencia declarada es Apache-2.0, pero el `license_link` apunta a los términos de Gemma 4 de Google; conviene verificar la compatibilidad para uso comercial antes de producción.
- Riesgo de alucinación inherente a un modelo de 6,57B parámetros; no se han publicado evaluaciones de factualidad.
- El draft especulativo incluido no es rentable en la configuración medida (acceptance 14,7 % frente a umbral ≈68 %, −18 % de velocidad); activarlo empeora el rendimiento.
- El draft publicado por separado (vocabulario 190 421) no es compatible con esta variante (191 221) por la tolerancia de 128 tokens de llama.cpp; debe usarse el draft del mismo repositorio.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha; no hay validación comunitaria independiente.
- No se documentan capacidades de tool calling, agentes ni visión; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Igor282/gemma-4-e4b-abliterated-pruned-ru-en-Q4_K_M
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-gemma-4-E4B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Draft assistant de Google: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
