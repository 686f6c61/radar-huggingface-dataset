# johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF es una cuantización GGUF del modelo multimodal orcarouter/Qwen3.8-Flash-Next-Uncensored, una variante "abliterated" (con los mecanismos de rechazo debilitados) de la familia Qwen3.8 Flash-Next. Lo publica el usuario johnlockejrr en Hugging Face y está pensado específicamente para ejecutarse en AMD Loom sobre hardware Strix Halo, así como en llama.cpp con decodificación especulativa MTP (multi-token prediction). El checkpoint contiene 176.943.899.520 parámetros totales y se distribuye en cinco partes que suman aproximadamente 104 GB, más un proyector visual F16 de unos 0,9 GB.

El modelo es un transformer de mezcla de expertos (MoE) con capacidades de visión y lenguaje (pipeline image-text-to-text), y se ofrece en el layout de cuantización UD-Q4_K_XL de Unsloth, con tipos de tensor alineados al catálogo de Flash-Next para Loom. La relevancia actual radica en que permite ejecutar localmente un modelo de casi 177.000 millones de parámetros en equipos con memoria unificada (Strix Halo), con velocidades medidas de aproximadamente 40 tok/s en decodificación de un solo flujo y 1450 tok/s de prefill bajo Loom.

La licencia es Apache-2.0, heredada del modelo base abliterated, y los idiomas declarados son inglés y chino. Al tratarse de una variante "uncensored" con rechazos debilitados, el autor la restringe a investigación y uso local, y recomienda añadir salvaguardas propias en cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) multimodal, con atención dispersa (sparse-attention) y decodificación especulativa MTP |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.768 tokens en la configuración de llama.cpp del autor (valor de `-c`; el máximo nativo no se especifica) |
| Tipos de cuantizacion | UD-Q4_K_XL (Q8_0/F32/BF16 en atención, HC, expertos compartidos y embeddings; Q4_K/Q5_1 en expertos MoE; BF16 en `indexer.{k,q}_proj`; IQ4_NL en `per_layer_token_embd`); proyector visual en F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5 partes para el checkpoint de texto + `mmproj` F16 para visión) |

## Arquitectura y entrenamiento

La información disponible describe un transformer de mezcla de expertos con atención dispersa, identificado en los tags como `qwen4exp` y `flash-next`. El checkpoint incorpora tensores específicos de atención dispersa (`indexer.{k,q}_proj`, elevados a BF16 en esta cuantización) y una capa `per_layer_token_embd` cuantizada a IQ4_NL. La decodificación especulativa se apoya en una cabeza MTP (multi-token prediction) separada, distribuida como `mtp-Qwen3.8-Flash-Next-Q8_0.gguf` por Unsloth, que se carga junto al modelo principal mediante `--spec-type draft-mtp`.

El proceso de cuantización parte del checkpoint Uncensored en Q8_0, se aplica `llama-quantize` con una imatrix de Unsloth y el mapa de tipos UD, y finalmente se elevan los proyectores del indexer a BF16. El autor subraya que no es un Q4_K_M estándar, ya que este último no coincide con el catálogo de Loom. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La naturaleza "abliterated" implica que se han modificado los mecanismos de rechazo respecto al modelo original, pero no se detalla la metodología exacta.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes y texto combinados (image-text-to-text) mediante el proyector visual F16.
- Razonamiento y respuesta multi-turno con contexto de hasta 32.768 tokens en la configuración de referencia.
- Decodificación especulativa MTP para acelerar la generación.
- Soporte de atención dispersa optimizada para el catálogo de Flash-Next en Loom.
- Ejecución en llama.cpp (build de Unsloth) y en AMD Loom sobre Strix Halo.
- Respuestas sin filtros de rechazo (variante uncensored/abliterated), orientada a investigación.
- No se especifica soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente a su versión original, comparando tasas de rechazo y respuestas en dominios sensibles en un entorno local controlado.
- Despliegue local en estaciones Strix Halo: gracias al layout UD-Q4_K_XL y al catálogo de Loom, se puede ejecutar un MoE de casi 177.000 millones de parámetros en memoria unificada con unos 40 tok/s de decodificación y 1450 tok/s de prefill.
- Procesamiento de documentos con imagen y texto: el proyector visual F16 permite tareas de image-text-to-text, como descripción de capturas o extracción de información de figuras, en pipelines locales.
- Experimentación con decodificación especulativa: la cabeza MTP y los parámetros `--spec-draft-n-max 2` permiten medir el impacto del draft MTP en latencia y throughput sobre llama.cpp.
- Servicio multiusuario ligero: la configuración con `-np 4` y `--kv-unified` admite hasta cuatro flujos concurrentes agregando unos 76 tok/s en Loom, adecuado para prototipos de chat internos.
- Evaluación comparativa de cuantizaciones: sirve para contrastar el rendimiento de UD-Q4_K_XL frente a otras cuantizaciones (Q4_K_M estándar, Q8_0) en tareas de texto y visión sobre el mismo hardware.
- Desarrollo de asistentes en inglés y chino: los dos idiomas declarados cubren casos de atención al cliente o generación de contenido bilingüe en esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí proporciona métricas de rendimiento en hardware Strix Halo comparando Loom con llama.cpp (build de Unsloth):

| Metrica | Loom | llama.cpp (Unsloth) |
|---|---:|---:|
| Decodificacion (1 flujo) | ~40 tok/s | ~29 tok/s |
| Agregado 4 flujos | ~76 tok/s | ~40 tok/s |
| Prefill (~6,2k tokens) | ~1450 tok/s | ~530 tok/s |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint de texto ocupa aproximadamente 104 GB en disco en UD-Q4_K_XL, más unos 0,9 GB del proyector visual F16; se requiere memoria unificada o VRAM suficiente para cargar esas particiones.
- Hardware objetivo: AMD Strix Halo con memoria unificada, ejecutando AMD Loom con el catálogo de Flash-Next.
- GPU discretas: no se documenta soporte específico para A100, H100 o RTX 4090; el tamaño del checkpoint (unos 104 GB) excede la VRAM de una RTX 4090 (24 GB) y requiere múltiples aceleradores o memoria unificada.
- Consumer GPU: no cabe en GPUs de consumo convencionales por el tamaño del modelo; el escenario previsto es memoria unificada de gran capacidad.
- Opciones de despliegue: llama.cpp (build de Unsloth con MTP), AMD Loom, y el paquete complementario `johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-loom`. No se mencionan vLLM, TGI ni Ollama.
- Parámetros de ejecución recomendados por el autor: `--jinja -ngl 99 -c 32768 -np 4 --kv-unified --ctx-checkpoints 12`, con `--spec-type draft-mtp --spec-draft-n-max 2`.
- Latencia y throughput: ver tabla de la sección anterior (Loom frente a llama.cpp en Strix Halo).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF (este) | 176.943.899.520 | 32.768 en config. de referencia | Apache-2.0 | GGUF (UD-Q4_K_XL) | Variante abliterated, visión, optimizada para Loom |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | no disponible | GGUF (UD-Q4_K_XL) | Modelo base no abliterated del que se toma el layout de cuantización y la cabeza MTP |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | Apache-2.0 | safetensors (modelo base) | Versión sin cuantizar del mismo modelo abliterated |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: los mecanismos de rechazo están debilitados, por lo que puede generar contenido que otros modelos bloquearían; el autor lo restringe a investigación y uso local.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo conversacional de gran tamaño, el riesgo existe y no está cuantificado.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Contexto: la configuración de referencia usa 32.768 tokens; el máximo nativo no se especifica, y con `-np 4` sin `--kv-unified` cada slot recibe una fracción del contexto.
- Licencia: Apache-2.0 permite uso comercial, pero la naturaleza abliterated traslada al desplegador la responsabilidad de añadir salvaguardas.
- Compatibilidad: no es un Q4_K_M estándar; usar un Q4_K_M genérico no coincide con el catálogo de Loom y puede fallar.
- Hardware: el tamaño del checkpoint (unos 104 GB) limita el despliegue a memoria unificada o configuraciones multi-GPU; no hay datos para GPUs de consumo.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día (25 de noviembre de 2026), por lo que la validación comunitaria es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Paquete Loom complementario: https://huggingface.co/johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-loom
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
