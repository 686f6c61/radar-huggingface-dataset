# kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-FAST-GGUF

## Resumen

Ornith-1.5-35B-A3B-ROCmFP4-FAST-GGUF es una cuantización de 4 bits optimizada para velocidad del modelo multimodal `ornith-ai/Ornith-1.5-35B-A3B`, publicada por el usuario `kingjones777`. No se trata de un modelo nuevo, sino de un artefacto GGUF derivado que emplea tipos de tensor FP4/FP8 nativos de AMD (denominados ROCmFP4 y ROCmFPX) que no existen en llama.cpp mainline, por lo que requiere una bifurcación específica del motor de inferencia.

El modelo base es un transformer de mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, distribuidos en 256 expertos y con una cabeza de predicción especulativa MTP (multi-token prediction) integrada en los propios pesos. La variante aquí descrita, con ftype 104 (`Q4_0_ROCMFP4_FAST_COHERENT`), ocupa 17,93 GiB en disco y conserva los embeddings de tokens y la cabeza de salida en Q6_K para preservar precisión.

Su relevancia es acotada pero muy concreta: está diseñada y medida para AMD Strix Halo (gfx1151, Ryzen AI MAX+ 395 con 128 GB de memoria unificada) bajo ROCm 7.2.4, un ecosistema donde las alternativas de cuantización de 4 bits de calidad escasean. El autor documenta mediciones reproducibles de velocidad (62,71 tok/s de decodificación sin drafter) y verificaciones de integridad de los ficheros, lo que aporta trazabilidad poco habitual en cuantizaciones de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 256 expertos, con cabeza MTP integrada (`qwen35moe.nextn_predict_layers = 1`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (aproximadamente 3.000 millones por token, según la model card) |
| Longitud de contexto | 131.072 tokens (cargado y verificado en la medición del autor) |
| Tipos de cuantizacion | GGUF ftype 104 `Q4_0_ROCMFP4_FAST_COHERENT` (~4,34 BPW); embeddings de tokens y cabeza de salida en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere build de llama.cpp con soporte ROCmFPX; no carga en llama.cpp stock, Ollama ni LM Studio) |
| Tamano del repositorio | 20,2 GB |
| Tamano del fichero principal | 17,93 GiB |
| Proyector de vision | `mmproj-Ornith-1.5-35B-BF16.gguf`, 902.822.016 bytes |
| Hardware objetivo | AMD Strix Halo (gfx1151), Ryzen AI MAX+ 395, 128 GB unificados, ROCm 7.2.4 |
| Descargas en el Hub | 57 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de mezcla de expertos con 256 expertos y enrutamiento disperso, del que se activan aproximadamente 3.000 millones de parámetros por token. La model card indica que `tie_word_embeddings` es `false`, de modo que `output.weight` es un tensor independiente y no compartido con los embeddings de entrada; esta característica es la que permite proteger la cabeza de salida con una cuantización de mayor precisión (Q6_K) sin afectar al resto de la matriz de pesos. El modelo incorpora además una cabeza de predicción multi-token (MTP) embebida en los pesos base, bajo los tensores `blk.40.nextn.*`, que puede emplearse para decodificación especulativa sin cargar un modelo borrador separado.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo que sí está documentado es el proceso de cuantización: el autor partió de `ornith-ai/Ornith-1.5-35B-A3B-GGUF`, lo convirtió a BF16 (71.066.994.240 bytes, sha256 `a3ee48dd8f05d10f529aa8ca8b9e080082c38910909638d226001b74e3307591`) y verificó byte a byte ambos artefactos contra el Hub antes de cuantizar, sin reconversión desde safetensors. Tras la cuantización, cada fichero se reabrió y se leyó su cabecera para confirmar que los tipos de tensor solicitados (`token_embd.weight` y `output.weight` en Q6_K) se habían aplicado realmente.

La innovación técnica principal no reside en el modelo sino en el formato: los tipos de tensor `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` son extensiones de la bifurcación ROCmFPX de llama.cpp que aprovechan las instrucciones FP4/FP8 nativas de las GPU AMD. El autor señala de forma explícita una trampa habitual: la decodificación especulativa con MTP resultó ser una pérdida neta de rendimiento en todas las configuraciones medidas (0,89× a 0,94×), con un óptimo de n-max = 3 (56,05 tok/s) frente a los 62,71 tok/s sin drafter, y advierte de que no debe pasarse `mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF` como modelo borrador, ya que cargaría un segundo modelo completo de 35B.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con endpoints (`endpoints_compatible`).
- Razonamiento con modo "thinking" activable por petición mediante `chat_template_kwargs.enable_thinking`; el contenido de razonamiento se expone en el campo `reasoning_content`.
- Comprensión de imágenes (pipeline `image-text-to-text`) a través del proyector `mmproj` incluido en el repositorio; el autor verifica 4/4 aciertos sobre una imagen de cuatro cuadrantes de color.
- Llamada a herramientas (tool calling): la medición del autor reporta 7/8 en modo requerido y 7/8 en modo automático.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).
- Generación de código: medida a 75,3 tok/s de media en dos prompts de código, aunque sin datos de calidad.
- Decodificación especulativa opcional mediante la cabeza MTP integrada, activable con `--spec-type draft-mtp --spec-draft-ngl 999` y sin `--model-draft`.

## Casos de uso

- Inferencia local en estaciones Strix Halo: el caso de uso central del artefacto. Un Ryzen AI MAX+ 395 con 128 GB de memoria unificada puede cargar el modelo completo en 17,93 GiB y servir 131.072 tokens de contexto con 62,71 tok/s de decodificación, sin necesidad de GPU discreta.
- Asistente de código en local con tool calling: los 7/8 aciertos en invocación de herramientas y los 75,3 tok/s en generación de código permiten integrarlo en flujos de autocompletado o agentes de edición que invocan funciones del sistema de ficheros o del compilador.
- Análisis de documentos con imágenes: al ser un modelo `image-text-to-text` con proyector incluido, sirve para extraer información de capturas, diagramas o formularios escaneados junto con texto largo, aprovechando la ventana de 131.072 tokens.
- Procesamiento por lotes con prompts largos: los 1.893 tok/s de prefill a 1k y 1.899,5 tok/s a 8k hacen viable clasificar o resumir documentos extensos en local, donde el coste dominante es el prefill y no la decodificación.
- Razonamiento multi-paso con modo thinking: para tareas de planificación o resolución de problemas donde la latencia no es crítica, el modo thinking activable por petición permite separar el razonamiento interno de la respuesta final.
- Despliegue como endpoint compatible con la API de OpenAI: la etiqueta `endpoints_compatible` y el servidor `superroc serve` permiten sustituir una API remota por este modelo local sin reescribir el cliente, útil en entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: el repositorio documenta metodología (2 calentamientos descartados, mediana de 5 ejecuciones, mismo prompt) y verificación de cabeceras, lo que lo convierte en una referencia útil para quien compare artefactos de 4 bits sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos publicados son de rendimiento de inferencia, medidos por el autor sobre AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151), 128 GB unificados, ROCm 7.2.4, con 2 calentamientos descartados, mediana de 5 ejecuciones y 300 tokens generados:

| Metrica | Valor |
|---|---|
| Decodificacion sin drafter (mediana de 5) | 62,71 tok/s |
| Decodificacion con MTP, mejor n-max (3) | 56,05 tok/s (0,89×) |
| Rango de MTP en todas las configuraciones | 0,89× – 0,94× (perdida neta) |
| Aceptacion MTP con n=2 | 0,927 (mas alta que n=3, pero mas lenta) |
| Prefill p1k | 1.893,3 tok/s |
| Prefill p8k | 1.899,5 tok/s |
| Generacion p1k (Super Roc) | 75,46 tok/s |
| Generacion p8k (Super Roc) | 68,38 tok/s |
| Generacion de codigo | 75,3 tok/s (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Carga del modelo | 2 s |
| Cache de prompt, turno 2 | 6.962 / 6.986 tokens en cache |
| Ancho de banda efectivo estimado | ~104 GB/s (calculado sobre ~1,72 GB de pesos activos a 4,58 BPW) |

Verificación funcional: 3/3 en corrección (17×23 → 391, capital de Japón → Tokio, días de 2024 → 366) comprobada sobre `content` y `reasoning_content` con `finish_reason=stop`, y 4/4 en visión. Los tamanos de fichero se contrastaron con las proyecciones de `--dry-run`, con un delta de cabecera constante de 10,48 MiB (dispersión de 0,005 MiB).

## Requisitos de hardware

- VRAM/memoria estimada: 17,93 GiB para el fichero principal más 902.822.016 bytes del proyector de visión; en Strix Halo se usa memoria unificada, no VRAM dedicada.
- GPU objetivo: AMD Strix Halo gfx1151 (Ryzen AI MAX+ 395) con 128 GB de memoria unificada y ROCm 7.2.4. No hay datos de funcionamiento en A100, H100 ni RTX 4090, y en cualquier caso los tipos de tensor ROCmFP4 requieren soporte AMD.
- GPU de consumo: no disponible; el artefacto está diseñado para un SoC con memoria unificada, no para GPU discretas de consumo.
- Motor de inferencia: obligatorio un build de llama.cpp con soporte ROCmFPX (bifurcación del autor). No carga en llama.cpp stock, Ollama ni LM Studio. El autor documenta también el motor Super Roc 0.20.0 y la integración con Lemonade mediante `lemonade config set llamacpp.rocm_bin=/opt/superroc/lemonade`.
- Parametros de carga verificados: `-ngl 999 -c 4096 -fit off -fa on`; para 131.072 tokens de contexto, `--context 131072 -t 0 --presence-penalty 0 --think off`.
- Latencia y throughput: 2 s de carga, 62,71 tok/s de decodificación sin drafter, 1.893–1.899 tok/s de prefill, 75,46 tok/s de generación a contexto 1k y 68,38 tok/s a 8k.
- Nota de ancho de banda: al ser un MoE con ~3B activos, el rendimiento depende del peso activo (~1,72 GB), no del tamano total del fichero (20,3 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (ftype 104) | 35,5B totales, ~3B activos | 131.072 | GGUF Q4_0_ROCMFP4, 17,93 GiB, 4,34 BPW | Apache 2.0 | Embeddings y cabeza en Q6_K; 62,71 tok/s en Strix Halo |
| `julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF` (ftype 106) | 35,5B totales, ~3B activos | no disponible | GGUF ROCmFP4 | Apache 2.0 (heredada) | Segun el autor, usa Q5_K en embeddings y `output.weight` en 4 bits pese a declarar "FP16 embedding/norm preservation" |
| `mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF` | 35,5B totales, ~3B activos | no disponible | GGUF | no disponible | Mismos 753 tensores que el modelo base con 32 bytes extra de metadatos; no valido como drafter |
| `ornith-ai/Ornith-1.5-35B-A3B` (modelo base) | 35,5B totales, ~3B activos | no disponible | safetensors / GGUF oficial | Apache 2.0 | Referencia de calidad; sin cuantizacion FP4 para AMD |

No se dispone de datos para comparar con modelos de otras familias (por ejemplo, alternativas densas o MoE de tamano similar) en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: los tipos `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no existen en llama.cpp mainline, por lo que el modelo no carga en llama.cpp stock, Ollama ni LM Studio. Esto limita la portabilidad y ata el despliegue a la bifurcación ROCmFPX y a hardware AMD.
- Restricción de hardware: diseñado para gfx1151 (Strix Halo). No hay evidencia de funcionamiento en GPU NVIDIA ni en otras arquitecturas AMD.
- La decodificación especulativa MTP degrada el rendimiento en este artefacto (0,89×–0,94×): activarla empeora el throughput, y rankear por tasa de aceptación en lugar de tok/s lleva a conclusiones erróneas.
- Riesgo de configuración incorrecta del drafter: usar `mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF` como modelo borrador carga un segundo modelo de 35B completo.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación para este artefacto ni, en la información disponible, para el modelo base. Las cifras de corrección (3/3) y visión (4/4) son pruebas de humo, no evaluaciones.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `ornith-ai/Ornith-1.5-35B-A3B` y del proyector de visión antes de un despliegue en producción.
- Trazabilidad: el artefacto lo publica un tercero (`kingjones777`), no el desarrollador del modelo base; la integridad se acredita mediante sha256 y verificación de cabeceras, no mediante una cadena de custodia oficial.
- Advertencia de rendimiento: el tamano del fichero (20,3 GB) no determina el ancho de banda necesario; calcular siempre sobre el peso activo (~1,72 GB).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-FAST-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base en GGUF: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Bifurcación ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Motor Super Roc: https://github.com/kingjones30/superroc
- Cuantizacion ROCmFP4 alternativa (ftype 106): https://huggingface.co/julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF
- Variante APEX-MTP (no usar como drafter): https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
