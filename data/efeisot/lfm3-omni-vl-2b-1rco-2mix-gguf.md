# efeisot/lfm3-omni-vl-2b-1rco-2mix-gguf

## Resumen

Este repositorio no contiene un modelo nuevo, sino una colección de tres cuantizaciones GGUF del modelo visión-lenguaje LiquidAI/LFM3-VL-2B, publicadas por el usuario independiente efeisot. El modelo base lo desarrolla LiquidAI y tiene 1.728.801.600 parámetros (≈1,73 B) según los pesos safetensors; el GGUF distribuye únicamente el decodificador de texto y un proyector visual F16 aparte (mmproj) que es obligatorio para entrada de imagen o vídeo. La aportación del autor es la metodología de cuantización: dos mezclas K-quant estándar (kmix, "balanced" y "quality") que funcionan con llama.cpp sin modificaciones, y una mezcla experimental RCO de menos de 1 GiB que exige un parche propio sobre llama.cpp.

El interés técnico está en la asignación por tensor con presupuesto de tamaño: el script del autor elige entre Q3_K, Q4_K, Q5_K y Q6_K (o RCO4 frente a Q5_K) minimizando el error de reconstrucción ponderado por la importance matrix, con muros fijos (embeddings en Q6_K, attn_gate en Q8_0, shortconv en F32). El resultado son ficheros de 0,983 a 1,277 GiB con métricas de perplejidad y divergencia KL medidas contra los logits f16 del propio checkpoint.

Es relevante ahora porque permite ejecutar un modelo visión-lenguaje de 1,7 B en el orden de 1-1,5 GiB de pesos, apto para CPU y GPUs de gama baja, con métricas reproducibles publicadas junto al artefacto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no procede de LiquidAI, por lo que debe tratarse como una cuantización de terceros no validada por el autor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (modelo base visión-lenguaje; el GGUF contiene solo el decodificador de texto más un proyector visual F16 separado) |
| Parámetros totales | 1.728.801.600 (≈1,73 B), dato real de safetensors del modelo base |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q3_K, Q4_K, Q5_K, Q6_K (mezclas kmix); RCO4 + Q5_K (rcmix); Q8_0 en attn_gate; Q6_K en embeddings; F32 verbatim en shortconv; F16 en el proyector visual |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (LFM Open License, de LiquidAI); el artefacto cuantizado se distribuye bajo los mismos términos |
| Formato de pesos | GGUF (tres ficheros de lenguaje + mmproj F16 + imatrix de 3 MiB) |

## Arquitectura y entrenamiento

No se proporciona la arquitectura del modelo base más allá de su naturaleza visión-lenguaje y de los nombres de tensor que aparecen en la hoja de asignación del quant: bloques `blk.N.*` con tensores `shortconv`, `attn_gate` y embeddings, lo que sugiere una columna vertebral híbrida con convoluciones cortas y compuertas de atención. Cualquier afirmación adicional sobre capas, atención o normalización sería especulación: no está disponible en la información consultada.

Este repositorio no entrena ni afina nada. El trabajo es exclusivamente de compresión: se generó una importance matrix (65.536 tokens de calibración, contexto de 1024) sobre el backbone de texto tratado como LFM3 causal LM, y un asignador con presupuesto de tamaño eligió el tipo de quant por tensor. En kmix se usó `llama-quantize --tensor-type-file` con la imatrix; en rcmix se construyó una base de datos de capas estilo GPTQ (Hessiano), se optimizó un libro de códigos por reconstrucción MSE y se eligió entre RCO4 y Q5_K por tensor. RCO4 es un tipo de tensor nuevo (type 45) que no existe en gguf-py ni en llama.cpp upstream, de ahí el parche incluido contra el commit `1b4554e`.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Entrada de imagen y vídeo, únicamente si se carga junto al proyector `mmproj-lfm3-vl-2b-f16.gguf` mediante `llama-mtmd-cli` o `llama-server --mmproj`.
- Completado de código: el ejemplo oficial del autor usa el prefijo `def merge_sort(arr):`.
- Despliegue en servidor compatible con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso o modo "thinking": no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible (el repo incluye un informe técnico en turco, pero no se documentan los idiomas del modelo).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local con visión en equipos sin GPU dedicada: con 0,983-1,277 GiB de pesos más 0,353 GiB de proyector, el modelo cabe en RAM de un portátil y permite consultas sobre capturas o fotos sin enviar datos a la nube.
- Completado de código en IDE o pipelines de CI: el formato GGUF se integra en llama.cpp y el modelo admite prefijos de función, útil para autocompletar firmas y cuerpos cortos en un runner sin acelerador.
- Extracción de información de documentos escaneados: emparejando una de las tres variantes de lenguaje con el mmproj F16 se puede pasar una imagen de factura o formulario y obtener texto estructurado, con la ventaja de que todo el proceso queda en local.
- Moderación o clasificación de contenido multimodal por lotes: al ser un modelo de 1,7 B cuantizado a ~5-6 bpw, el coste por ítem en CPU es bajo y permite procesar colas grandes de imágenes con etiquetas cortas.
- Prototipado rápido de agents conversacionales multi-turno: `llama-server` expone una API compatible con endpoints, de modo que se puede conectar un cliente existente y medir latencia real antes de invertir en un modelo mayor.
- Demo educativa de cuantización: el repositorio incluye imatrix, hoja de asignación por tensor, logs crudos de PPL/KLD y el parche de llama.cpp, lo que lo convierte en material didáctico para estudiar cómo afecta cada tipo de quant a la divergencia KL.
- Evaluación comparativa de formatos en hardware modesto: la tabla de calidad publicada permite reproducir el mismo experimento en una RX 9060 XT o en CPU y contrastar los números declarados.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre Wikitext-2 (test, contexto 512, 16 chunks, KL frente a los logits f16 del mismo checkpoint). Son comparaciones entre cuantizaciones del mismo modelo, no entre modelos; la perplejidad de texto es alta por diseño al tratarse de un modelo visión-lenguaje.

| Variante | GiB | bpw | PPL | KLD | top-1 | Runtime |
|---|---|---|---|---|---|---|
| stock Q4_K_M (referencia) | 1,024 | 5,09 | 118,299 | 0,149 | 78,0 % | stock |
| lfm3-vl-2b-kmix-1100M (balanced) | 1,083 | 5,38 | 113,059 | 0,086 | 83,6 % | stock |
| lfm3-vl-2b-kmix-1300M (quality) | 1,277 | 6,35 | 110,910 | 0,022 | 91,1 % | stock |
| lfm3-vl-2b-rcmix-1000M (RCO sub-1-GiB) | 0,983 | 4,89 | 119,997 | 0,132 | 79,5 % | parche requerido |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- Pesos: 1,083 GiB (kmix-1100M), 1,277 GiB (kmix-1300M) y 0,983 GiB (rcmix-1000M); el proyector visual F16 suma 0,353 GiB en los tres casos.
- VRAM estimada para inferencia (cálculo aproximado a partir de los tamaños de fichero, no dato publicado): en torno a 1,8-2,5 GB para kmix-1100M + mmproj, 2-3 GB para kmix-1300M + mmproj y 1,7-2,4 GB para rcmix-1000M + mmproj, incluyendo caché KV y buffers; la cifra exacta depende de la longitud de contexto, que no está disponible.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM; también en CPU. El autor valida el camino RCO en CPU y HIP (ROCm) sobre una RX 9060 XT (gfx1200) con ROCm 7.x; los builds CUDA del kernel RCO no están probados.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para imagen). Las variantes kmix funcionan en cualquier llama.cpp reciente; rcmix requiere aplicar `llama.cpp-rco-types.patch` sobre el commit `1b4554e` y recompilar (el ejemplo del autor usa `-DGGML_HIP=ON -DGPU_TARGETS=gfx1200`). vLLM, TGI u Ollama no están documentados para estos ficheros en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que los números son específicos del hardware (RX 9060 XT, ROCm 7.x).

## Comparativa con modelos similares

Comparativa interna entre las cuatro opciones del propio repositorio y la referencia estándar, con los datos del autor:

| Variante | Tamaño | bpw | KLD | top-1 | Compatibilidad | Licencia |
|---|---|---|---|---|---|---|
| stock Q4_K_M | 1,024 GiB | 5,09 | 0,149 | 78,0 % | llama.cpp estándar | lfm1.0 |
| kmix-1100M | 1,083 GiB | 5,38 | 0,086 | 83,6 % | llama.cpp estándar | lfm1.0 |
| kmix-1300M | 1,277 GiB | 6,35 | 0,022 | 91,1 % | llama.cpp estándar | lfm1.0 |
| rcmix-1000M | 0,983 GiB | 4,89 | 0,132 | 79,5 % | llama.cpp parcheado | lfm1.0 |

Frente a otras alternativas de la misma categoría (otras cuantizaciones GGUF de LFM3-VL-2B de distintos autores, o modelos visión-lenguaje de ~1-2 B como la familia LFM2-VL de LiquidAI): no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, por lo que no hay datos verificables de parámetros, contexto, rendimiento ni disponibilidad de esos competidores en esta ficha.

## Limitaciones y advertencias

- Cuantización no oficial: no la publica LiquidAI, sino un tercero, con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las métricas.
- `lfm3-vl-2b-rcmix-1000M` no carga en llama.cpp estándar: el tipo de tensor 45 (RCO4) es desconocido y provoca error; requiere el parche incluido y recompilación.
- El kernel RCO solo está validado en CPU y HIP (ROCm); los builds CUDA no se han probado, lo que descarta de facto ese camino en muchas granjas de GPU NVIDIA.
- Los GGUF contienen solo el decodificador de texto: sin `mmproj-lfm3-vl-2b-f16.gguf` no hay entrada de imagen ni vídeo. Para rcmix con imágenes hay que compilar también `llama-mtmd-cli` desde el árbol parcheado.
- Perplejidad de texto alta por diseño (modelo visión-lenguaje): no debe interpretarse como señal de mala calidad frente a LLM puramente textuales del mismo tamaño.
- No hay benchmarks de tareas reales (razonamiento, código, matemáticas, MMMU), ni datos de sesgos, alucinación o cobertura idiomática.
- Longitud de contexto no documentada: no se puede planificar el coste de caché KV ni garantizar conversaciones largas.
- Licencia lfm1.0: es una licencia propia de LiquidAI, no una licencia permisiva estándar; hay que revisar el texto enlazado antes de cualquier uso comercial, ya que las condiciones concretas (umbrales, atribución, restricciones) no se detallan en la información proporcionada.
- Las cifras de PPL/KLD son sensibles al hardware y al runtime declarados (RX 9060 XT, gfx1200, ROCm 7.x); no son directamente trasladables a otros entornos.
- Los ficheros se publicaron y actualizaron el 28 de octubre de 2026; conviene verificar `SHA256SUMS` antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/efeisot/lfm3-vl-2b-1rco-2mix-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia del modelo base (lfm1.0): https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Documentación de uso incluida en el repo: `docs/USAGE.md`
- Detalles de cuantización y formato de bloque RCO: `docs/QUANTIZATION.md`
- Notas de release: `docs/RELEASE_NOTES.md`
- Informe técnico (turco): `docs/RAPOR.tr.md`
- Resultados crudos de evaluación: `metadata/final_summary.json` y `metadata/benchmarks/`
- Parche de soporte RCO4 para llama.cpp: `llama.cpp-rco-types.patch` (en el propio repo)
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp (commit de referencia `1b4554e`)
- Búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos trataban sobre la ciudad de Atenas y no guardan relación con el modelo.
