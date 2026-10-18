# huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated

## Resumen

Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated es un checkpoint de inferencia de 96.637.001.693 parámetros publicado por el usuario huginnfork. Parte de Qwen3.8-Flash-Next (familia Qwen, arquitectura MoE con atención lineal híbrida), pasa por la cuantización mixta NVFP4/MXFP8 de Local Inference Lab y recibe después una edición de ablación de la dirección de rechazo aplicada directamente sobre la rejilla cuantizada, sin descomprimir ni recuantizar. El resultado se reempaqueta en un contenedor en el que los planos de escala de los expertos enrutados se guardan con una codificación propia del autor llamada CSF.

La relevancia técnica es doble. Por un lado es un caso poco habitual de cuantización de 4 bits con compresión de escalas: 73.728 planos de escala pasan de 7.549.747.200 a 3.965.911.336 bytes (52,5 %), un ahorro de 3,584 GB sobre un contenedor de 102,8 GB, manteniendo nombres, dtypes y formas de todos los tensores. Por otro, documenta una abliteration hecha en el dominio cuantizado, con fuga residual medida de 3,5e-06 en módulos NVFP4 y 4,3e-07 en MXFP8.

Es un modelo de rechazo reducido, pensado explícitamente para despliegues donde el filtrado por defecto estorba, y el autor advierte de ello en la propia model card. El repositorio sustituye a una release anterior eliminada, tiene 0 descargas y 0 likes, y no publica especificación de contexto ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal híbrida (capas `linear_attn` y `self_attn`), expertos compartidos y capas MTP (multi-token prediction); deriva de Qwen3.8-Flash-Next |
| Parametros totales | 96.637.001.693 (96,6 mil millones) |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa y expertos compartidos; el autor no publica el recuento activo) |
| Longitud de contexto | no disponible (el arnés de evaluación `lavd` aplicó un tope de 40.000 tokens, que no equivale al máximo del modelo) |
| Tipos de cuantizacion | Mixta QAD: NVFP4 en `mlp.experts.E.down_proj` del decodificador principal y de MTP; MXFP8 en `mlp.shared_expert.down_proj`, `linear_attn.out_proj` y `self_attn.o_proj`; BF16 en `embed_tokens`, `layers.1.ple.value_proj` y 2 tensores MTP. Escalas de bloque de los expertos enrutados en CSF (`uint8` + `uint32`) |
| Idiomas soportados | no disponible |
| Licencia | `other` con `license_name: qwen-community-1.0` (Qwen Community License 1.0) |
| Formato de pesos | safetensors; 375.321 tensores, 102.710.160.676 bytes de tensores, repo de 102,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-Flash-Next original: un transformer con mezcla de expertos en el que conviven capas de atención completa (`self_attn.o_proj`) y capas de atención lineal (`linear_attn.out_proj`), lo que reduce el coste de contexto largo en parte de la red. La capa MoE usa 512 expertos enrutados por capa más un experto compartido, distribuidos en 48 capas del decodificador principal según el recuento de planos de escala (48 × 512 × 3 proyecciones). Incluye además bloques MTP para decodificación especulativa y una tabla PLE (per-layer embeddings) con proyección propia (`ple.value_proj`), lo que apunta a un esquema de embeddings por capa compartidos con el `lm_head`.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base. Lo que sí está documentado es el post-entrenamiento aplicado por el autor. Sobre la cuantización QAD NVFP4/MXFP8 de Local Inference Lab se aplicó una dirección de rechazo de rango 1, biproyectada contra la media de peticiones inocuas, capturada en la capa 46 y aplicada con `alpha = 1.0`. Se editaron 25.188 tensores en total: 24.576 NVFP4 (`layers.N.mlp.experts.E.down_proj`), 512 NVFP4 en MTP, 48 MXFP8 de expertos compartidos, 36 MXFP8 de `linear_attn.out_proj`, 12 MXFP8 de `self_attn.o_proj` y 4 BF16. No se tocó ninguna escala, ni routers, ni `gate_proj`/`up_proj`, ni `q/k/v_proj`, ni tensores de visión, ni `lm_head`, ni la tabla PLE. Como editar un valor que ya está en la rejilla de cuantización se atenúa con redondeo al más cercano, el autor usa un recuantizador restringido que elige códigos que aproximan el peso editado y mantienen `v·W = 0` por columna dentro de un presupuesto de ±1 ULP.

La segunda contribución es el contenedor CSF: solo se comprimen los planos de escala de bloque de los expertos enrutados del decodificador principal (73.728 planos, 48 capas × 512 expertos × 3 proyecciones). Cada `weight_scale` lógica se parte en `<name>.weight_scale.nvfp4_csf_fixed` (`uint8`, bases de fila más flujo de offsets de 4 bits empaquetado) y `<name>.weight_scale.nvfp4_csf_exceptions` (`uint32`, `flat_position | (value << 24)`). El `config.json` declara `weight_scale_encoding: "csf"` solo en las 48 recetas de expertos enrutados; el resto de escalas, globales y de activación, mantiene `weight_scale` plano.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento conmutable (`enable_thinking` verdadero o falso), tal y como evidencian las dos baterías de evaluación del autor.
- Razonamiento científico de nivel posgrado: 168/198 en GPQA-diamond con thinking desactivado.
- Recuperación en contexto largo: 30/30 en la prueba `estonia` de retrieval con contexto largo.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, con tensores de visión presentes en el checkpoint (aunque el autor no los editó ni los evalúa).
- Decodificación especulativa mediante capas MTP, con una tasa de aceptación de borradores del 59-67 %.
- Capacidad de seguir instrucciones complejas (`lavd`, 27/30), con los fallos atribuidos a límite de 40.000 tokens del arnés, no a respuestas incorrectas.
- Rechazo reducido de forma deliberada: 0/136 en el protocolo model-forge con thinking desactivado y 19/136 con thinking activado.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada (no se documenta en la model card).
- Cobertura multilingüe: no disponible.

## Casos de uso

- Evaluación de técnicas de abliteration en modelos cuantizados: el checkpoint sirve como referencia reproducible para estudiar cómo se comporta una edición de dirección de rechazo cuando se aplica sobre la rejilla NVFP4 en lugar de sobre pesos BF16, con la fuga residual medida (3,5e-06 y 4,3e-07) como métrica de control.
- Investigación sobre compresión de escalas de cuantización: los 73.728 planos CSF y los ficheros crudos en `measurements/` permiten medir el impacto de la codificación de escalas en tamaño de contenedor y en calidad, comparando con el layout plano de 106,41 GB del predecesor.
- Despliegue de asistentes internos sin fricción de rechazo: en entornos corporativos con prompts legítimos que disparan negativas espurias, el modelo reduce el exceso de rechazo a 0/59 en ambos protocolos, lo que se traduce en menos conversaciones bloqueadas en soporte técnico o análisis de documentos.
- Clasificación y extracción sobre documentos con imágenes: al ser `image-text-to-text`, se puede usar para procesar capturas, formularios escaneados y diagramas junto con texto, siempre que se valide el comportamiento de los tensores de visión, que no fueron editados.
- Generación asistida con decodificación especulativa: las capas MTP con 59-67 % de aceptación permiten acelerar la generación en servidores con soporte de draft nativo, útil en pipelines de resumen o reescritura de alta concurrencia.
- Red teaming y auditoría de seguridad de modelos: al tener una tasa de rechazo de 14,0 % en el régimen con thinking y 0 % sin él, es un banco de pruebas realista para validar clasificadores de salida y guardarraíles externos antes de desplegar modelos sin filtrado interno.
- Investigación sobre retrieval en contexto largo: con 30/30 en `estonia`, es adecuado para tareas de búsqueda de agujas en documentos largos, aunque el tope de 40.000 tokens del arnés limita las conclusiones por encima de esa cifra.

## Benchmarks y rendimiento

Medidos sobre el build predecesor, con pesos bit a bit idénticos según el autor. No se han vuelto a medir sobre este contenedor.

| Benchmark | Protocolo | Modelo padre | Este modelo | p |
|---|---|---|---|---|
| `lavd` (n=30) | — | 28/30 | 27/30 | no disponible |
| `estonia` retrieval contexto largo (n=30) | — | 30/30 | 30/30 | no disponible |
| GPQA-diamond (n=198) | thinking off | 162/198 | 168/198 | 0,286 |
| Aceptación de borradores MTP | — | 58-69 % | 59-67 % | no disponible |
| Rechazo en conjunto dañino (n=136) | A, model-forge, thinking off | 136/136 (100 %) | 0/136 (0 %) | 2,3e-41 |
| Sobre-rechazo (n=59) | A, thinking off | 4/59 (6,8 %) | 0/59 (0 %) | 0,125 |
| Rechazo en conjunto dañino (n=136) | B, thinking on | 122/136 (89,7 %) | 19/136 (14,0 %) | 1,97e-31 |
| Sobre-rechazo (n=59) | B, thinking on | 0/59 (0 %) | 0/59 (0 %) | 1 |
| Conjunto dañino completo (n=200) | A, scorer model-forge | no disponible | 0/200 | no disponible |
| Conjunto dañino completo (n=200) | A, scorer estricto de 47 marcadores | no disponible | 6/200 | no disponible |

No hay resultados publicados de MMLU, HumanEval ni GSM8K en la información disponible, ni benchmarks de visión pese a que el pipeline es `image-text-to-text`.

## Requisitos de hardware

- VRAM para inferencia: el contenedor suma 102.710.160.676 bytes de tensores (102,8 GB de repo), por lo que se necesita al menos ese espacio en memoria de dispositivo para cargar los pesos tal cual. Estimación orientativa: 110-140 GB contando caché KV y buffers, según longitud de contexto y lote.
- GPU recomendadas: 2×H100 80 GB o 2×B200 para el contenedor completo. Las operaciones NVFP4 nativas requieren hardware Blackwell (B200/GB200, RTX 50); en Hopper hay que recurrir a dequantización o a kernels de fallback, con la penalización de rendimiento correspondiente. MXFP8 sí tiene soporte en Hopper.
- GPU de consumo: no cabe en una sola tarjeta. 4×RTX 5090 (128 GB) deja muy poco margen; 8×RTX 5090 (256 GB) es viable en términos de memoria, con throughput limitado por el ancho de banda agregado.
- Opciones de despliegue: el formato NVFP4 de ModelOpt está pensado para TensorRT-LLM y vLLM con kernels FP4 en Blackwell. La codificación CSF es específica de este autor y requiere la ruta de lectura NVFP4-CSF; no hay ficheros GGUF, por lo que llama.cpp y Ollama no pueden cargar el checkpoint sin conversión previa.
- Latencia y throughput: no disponible. El único dato de rendimiento es la aceptación de borradores MTP (59-67 %), que mejora la decodificación especulativa pero no se traduce en una cifra de tokens por segundo publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (huginnfork, CSF + abliterated) | 96,6 mil millones | no disponible | safetensors NVFP4/MXFP8/BF16, 102,8 GB | qwen-community-1.0 | 0 descargas, 0 likes |
| `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (padre) | 96,6 mil millones | no disponible | safetensors NVFP4/MXFP8 | no disponible | checkpoint de referencia de la cuantización |
| `Qwen/Qwen3.8-Flash-Next` (base, commit `de4b8e4d`) | no disponible | no disponible | safetensors BF16 | qwen-community-1.0 | modelo original de Qwen |
| `huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated` tag `v4` | 96,6 mil millones | no disponible | safetensors, 106,41 GB, 40 shards | qwen-community-1.0 | tag eliminado, sustituido por este repo |

Frente a los tres, este contenedor es el único con escalas CSF y con la edición de rechazo; frente al padre y al base, la diferencia medible está en el rechazo (0 % frente a 100 % en el protocolo A) y en GPQA (168 frente a 162, no significativo). No se dispone de comparación con modelos de otros fabricantes del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Modelo de rechazo reducido por diseño. Con thinking desactivado rechaza 0/136 peticiones dañinas bajo el scorer de model-forge, y 6/200 bajo un scorer estricto de 47 marcadores. No es apto para despliegues expuestos a usuarios finales sin un clasificador de entrada y salida externo.
- El número de rechazo depende críticamente del régimen: los mismos pesos pasan del 0 % al 14,0 % solo cambiando el modo de pensamiento, y el autor mide un factor de hasta 19× entre protocolos. Citar una sola celda es engañoso.
- Riesgo de alucinación: no evaluado. No hay benchmarks de factualidad ni de calibración en la información disponible, y los modos de fallo típicos del abliteration incluyen degradación sutil de coherencia que los benchmarks de rechazo no detectan.
- Sesgos: no documentados. El conjunto de evaluación de rechazo está en inglés y no se publica composición demográfica ni análisis de sesgo.
- Idiomas: la model card no declara lista de idiomas y todas las pruebas descritas usan prompts en inglés. El rendimiento en castellano u otras lenguas es desconocido.
- Contexto: no se publica la longitud máxima soportada. Las pruebas de contexto largo se truncaron a 40.000 tokens, así que no hay evidencia más allá de esa cifra.
- Visión: el pipeline es `image-text-to-text` y existen tensores de visión, pero el autor confirma que no los editó y no publica ninguna evaluación multimodal. La calidad de la rama visual es una incógnita.
- Licencia `qwen-community-1.0` con `license_link: LICENSE`: es una licencia con condiciones, no permisiva. Hay que revisar el texto antes de cualquier uso comercial; la información disponible no detalla las restricciones concretas.
- Reproducibilidad: 0 descargas, 0 likes, un único autor y una release previa eliminada. Los benchmarks se midieron sobre el build anterior y no se repitieron sobre este contenedor, aunque el autor afirma que los pesos son idénticos bit a bit.
- Dependencia de tooling propietario: la ruta de lectura NVFP4-CSF no es estándar y el checkpoint no tiene conversión a GGUF, lo que ata el despliegue a TensorRT-LLM o vLLM con soporte de la codificación.
- Naturaleza de la edición: no se modificó ninguna escala, router, proyección `q/k/v`, `gate_proj`, `up_proj`, `lm_head` ni tabla PLE, de modo que el efecto de la abliteration es acotado a las proyecciones de salida; el resto del comportamiento hereda el del modelo cuantizado original.

## Enlaces

- HuggingFace: https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Modelo base de la cuantización: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4 (commit `6909a5bed089a48fa07e956d3915af2537de9368`)
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next (commit `de4b8e4d43b917e7706784d8bb445c9af86a3540`)
- Predecesor eliminado: `huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated`, tag `v4` (ya no accesible)
- Ficheros de medición crudos: carpeta `measurements/` dentro del repositorio
- Papers, blogs, repositorios de código y demos: no se han encontrado enlaces en la información disponible
