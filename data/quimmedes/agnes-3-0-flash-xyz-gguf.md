# quimmedes/Agnes-3.0-Flash-XYZ-GGUF

## Resumen

Agnes-3.0-Flash-XYZ-GGUF es un repositorio de cuantizaciones GGUF del checkpoint abierto Agnes-3.0-Flash Preview, publicado por el usuario quimmedes y desarrollado a partir del modelo base Agnes-AI/Agnes-3.0-Flash. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de una conversión a GGUF optimizada con imatrix para su uso en llama.cpp y derivados. El checkpoint original cuenta con 32.629.771.584 parámetros (unos 32,6 B, que el autor redondea a 33 B) y licencia Apache-2.0.

La relevancia de esta conversión es doble. Por un lado, la arquitectura del modelo es híbrida: combina atención global con capas recurrentes tipo SSM (delta-rule attention) en una proporción 3:1, e incorpora una rama SwiGLU paralela en cada capa que llama.cpp estándar no reconoce. Por otro, el autor documenta que estas cuantizaciones requieren una build parcheada (cafe-llama.cpp) y publica un análisis comparativo de pesos que concluye que Agnes-3.0-Flash comparte vocabulario, tokenizador, plantilla de chat, torre de visión, embedding de tokens, normas y constantes SSM con Qwen/Qwen3.8-27B, difiriendo en el número de capas y en las matrices de proyección.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con licencia Apache-2.0 y pipeline de text-generation. Su valor práctico inmediato se limita a entornos de experimentación con llama.cpp parcheado, ya que la carga en una build sin parchear falla o realiza un mapeo incorrecto de tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM: atención global y atención delta-rule (recurrente) en proporción 3:1, identificada en llama.cpp como `qwen35`; incluye una rama SwiGLU paralela por capa (`ffn_gate_par` / `ffn_up_par` / `ffn_down_par`) |
| Parametros totales | 32.629.771.584 (~32,6 B, dato de safetensors; el autor lo cita como 33 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como límite oficial. El ejemplo de despliegue del autor usa `-c 32768` |
| Tipos de cuantizacion | Escalera principal: Q3, Q3.5, Q4, Q4.5, Q5, Q5.5, Q6, Q7, Q8, Q9 (formato `*-v4-XYZ`). Adicionales en `extra/`: Q3, Q4.5, Q5, Q8 y un `Q4_K_M-control`. Referencia bf16 GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con `llama-quantize --imatrix` desde safetensors) |

Datos adicionales de arquitectura declarados en la model card: hidden 5120, 24 cabezas q / 4 cabezas kv, head_dim 256, FFN 17408, 16 cabezas key / 48 value en la parte delta-rule, kernel de convolución 4, `partial_rotary_factor` 0.25, mrope `[11,11,10]` interleaved, theta 1e7, vocabulario 248320, MTP de 1 capa, `swish` output gate y `tie_word_embeddings=false`.

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con atención por capas alternadas: 72 capas en total, de las cuales 54 son delta-rule (recurrentes, tipo SSM) y 18 son de atención global, manteniendo una proporción 3:1. Esta configuración es la que da sentido a la etiqueta `long-context` y a la `hybrid-attention` del repositorio. La innovación estructural más destacable respecto a otras arquitecturas del mismo stack es la rama SwiGLU paralela presente en cada capa, además de la inclusión de un bloque MTP (`nextn`, 1 capa) que habilita decodificación especulativa con `--spec-type draft-mtp`. El modelo incorpora además una torre de visión en el checkpoint base, con identificadores de tokens de imagen y vídeo.

Sobre el entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El autor de la conversión aporta un hallazgo relevante obtenido por comparación byte a byte contra Qwen/Qwen3.8-27B: `vocab.json` (sha256 `ce99b4cb2983`), `merges.txt` (sha256 `a9d356d7bdf1`), `chat_template.jinja`, `generation_config.json`, `embed_tokens.weight`, las normas (`input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm`, `norm` final), las constantes SSM (`A_log`, `dt_bias`, `conv1d`, `ssm_norm`) y la torre de visión (mismos pesos en `attn.proj` del bloque 0, 2.654.208 bytes) son idénticos. Las diferencias se concentran en el número de capas (72 frente a 64) y en que todas las matrices de proyección están reentrenadas. El recuento de parámetros es coherente con esa relación: 27 B × 72/64 ≈ 30,4 B, más la contribución de la rama paralela. Se trata de una afirmación del autor del repositorio, no de una confirmación del equipo de Agnes-AI.

## Capacidades

- Generación de texto conversacional, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento con niveles de esfuerzo configurables: la plantilla de chat es idéntica a la de Qwen3.8-27B, incluyendo los mismos niveles de `reasoning_effort`.
- Soporte de tool calling / function calling: la plantilla de chat comparte el mismo formato de llamada a herramientas que Qwen3.8-27B.
- Contexto largo: el caso de uso publicado emplea 32 768 tokens con caché KV cuantizada en `q8_0`.
- Decodificación especulativa mediante el bloque MTP incluido en el modelo (`--spec-type draft-mtp`).
- Capacidad multimodal en el checkpoint base: la torre de visión tiene los mismos pesos e identificadores de tokens de imagen y vídeo que Qwen3.8-27B. No se documenta si la conversión GGUF conserva esa torre ni cómo se invoca.
- Compatibilidad con endpoints declarada mediante la etiqueta `endpoints_compatible`.
- Idiomas: no disponible.

## Casos de uso

- Analisis de documentos largos en local: con una ventana de 32 768 tokens y capas recurrentes que reducen el coste de atención, el modelo permite procesar contratos, informes o transcripciones extensas en una sola pasada sobre hardware de consumo.
- Asistente conversacional autoalojado: el formato de plantilla de chat compatible con tool calling permite integrarlo en un servidor `llama-server` propio para atención interna, sin dependencia de APIs externas.
- Agentes multi-paso con llamada a herramientas: la plantilla de tool calling y los niveles de `reasoning_effort` permiten construir bucles de razonamiento con invocación de funciones, siempre que el runtime soporte el formato nativo.
- Despliegue en estaciones de trabajo con GPU de 24 GB: el ejemplo oficial con `-ngl 20`, `-nr` y contexto de 32 768 tokens está pensado exactamente para tarjetas de esa gama.
- Experimentacion en investigacion sobre arquitecturas hibridas: el modelo permite reproducir y medir el comportamiento de una mezcla 3:1 de atención recurrente y global en tareas de perplejidad y generación.
- Evaluacion de estrategias de cuantizacion: el repositorio incluye cinco variantes adicionales en `extra/` con distinta asignación de precisión por tensor, útiles para estudiar el impacto de cuantizar atención frente a FFN.
- Sustitucion de un modelo Qwen3.8-27B en pipelines existentes: dado que comparten tokenizador, plantilla de chat y configuración de generación según el autor, la migración sería viable en los mismos entornos que ya soportan esa arquitectura.
- Inferencia con decodificación especulativa: el bloque MTP permite medir aceleraciones de latencia en despliegues con `--spec-type draft-mtp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo de calidad aportado es la perplejidad del GGUF en bf16 con la imatrix construida por el autor:

| Metrica | Valor | Metodo |
|---|---|---|
| Perplejidad (bf16 GGUF) | 6,5737 +/- 0,14183 | imatrix construida con 50 fragmentos del split de test raw de wikitext-2 |
| Respuesta factual (Q3-v4-XYZ, 12,12 GiB) | "The capital of France is Paris." | Verificación manual al servir el archivo |

La model card indica además que todas las variantes listadas fueron servidas y verificadas con una pregunta factual, pero no publica métricas adicionales de razonamiento, código o matemáticas.

## Requisitos de hardware

- Tamaño en disco de las variantes publicadas: Q3-v4 12,12 GiB; Q3 (extra) 18,00 GiB; Q4-v4 16,57 GiB; Q4.5 (extra) 17,37 GiB; Q4_K_M-control 19,07 GiB; Q5 (extra) 19,52 GiB; Q8 (extra) 31,21 GiB.
- El tamaño del repositorio completo es de 29,5 GB según HuggingFace; la model card declara un total acumulado de 112 936 423 072,0 "GiB", cifra incoherente con las unidades indicadas.
- GPU de 24 GB: es el escenario de referencia del autor. Con `-ngl 20` el modelo entra en memoria; una descarga completa de capas a GPU deja espacio únicamente para un contexto pequeño.
- Consumer GPU: una tarjeta de 24 GB (por ejemplo, RTX 3090 o RTX 4090) es viable con descarga parcial. No hay datos publicados para tarjetas de 8, 12 o 16 GB.
- No se documentan cifras de latencia ni de throughput (tokens por segundo) para ninguna de las variantes.
- Opciones de despliegue: `llama-server` de llama.cpp. Es obligatorio usar el fork cafe-llama.cpp del autor, ya que las builds estándar no registran la rama FFN paralela ni el mapa de capas recurrentes y fallan o cargan mal los tensores.
- Parámetros de ejecución recomendados por el autor: `-ngl 20 -nr -c 32768 -np 1 -ctk q8_0 -ctv q8_0 -fa on --spec-type draft-mtp`. El flag `-nr` (no repack) mantiene los pesos mapeados en memoria, relevante a 33 B.
- Muestreo recomendado: `temp 1.0`, `top_p 0.95`, `top_k 20`.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|---|
| Agnes-3.0-Flash-XYZ-GGUF (este repo) | 32,6 B | 72 (54 delta-rule + 18 global, 3:1) | No disponible; ejemplo con 32 768 | Apache-2.0 | GGUF, requiere fork cafe-llama.cpp | Incluye rama SwiGLU paralela y bloque MTP |
| Agnes-AI/Agnes-3.0-Flash (modelo base) | 32,6 B | 72 | No disponible | Apache-2.0 | Safetensors | Checkpoint original en bf16 |
| Qwen/Qwen3.8-27B | No disponible en la informacion proporcionada (el autor infiere 27 B) | 64 (48 linear + 16 full) | No disponible | No disponible en la informacion proporcionada | Safetensors | Segun el autor, comparte tokenizador, plantilla de chat, torre de visión, embeddings, normas y constantes SSM; difiere en capas y matrices de proyección |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Requiere una build parcheada. Cargar estos GGUF en llama.cpp estándar falla o realiza un mapeo incorrecto, porque la arquitectura añade tensores `ffn_gate_par` / `ffn_up_par` / `ffn_down_par`, un mapa de capas recurrente/global y un reordenamiento V-head de delta-attention.
- Cuantizaciones IQ2 e IQ3 sobre el FFN degradan el modelo hasta repetir un único token de forma degenerada. Cualquier nivel Q3 o superior es funcional según el autor.
- El repositorio presenta 0 descargas y 0 likes, con fecha de creación y actualización del mismo día; no hay evidencia de uso comunitario ni validación independiente.
- Solo el archivo Q3-v4-XYZ (12,12 GiB) está marcado como subido en la escalera principal; el resto de la lista figura como no disponible, y una entrada (Q4.5-v4) muestra un tamaño de 0,01 GiB.
- La verificación de calidad se limita a una pregunta factual ("capital de Francia") y a la perplejidad sobre wikitext-2; no hay evaluación de razonamiento, código, matemáticas, alucinación ni multilingüismo.
- La model card no declara idiomas soportados, y no hay datos sobre sesgos.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- La afirmación de que el checkpoint deriva de Qwen/Qwen3.8-27B proviene del autor de la conversión y se basa en comparación de hashes y rangos de bytes; no está confirmada por Agnes-AI ni por Alibaba/Qwen.
- Se detectan incoherencias en las unidades de la model card (cifras en "GiB" correspondientes en realidad a bytes), lo que resta fiabilidad a los metadatos del repositorio.
- La licencia Apache-2.0 del repositorio es la declarada, pero el uso comercial debería revisarse también respecto al modelo base y a las posibles reclamaciones sobre su procedencia.
- No se documenta si la torre de visión sobrevive a la conversión GGUF; el pipeline declarado es únicamente `text-generation`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/quimmedes/Agnes-3.0-Flash-XYZ-GGUF
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Fork de llama.cpp requerido: https://github.com/quimmedes/cafe-llama.cpp
- Pull request de imatrix en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/4930
- Modelo de referencia usado en la comparación del autor: https://huggingface.co/Qwen/Qwen3.8-27B

Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo: consisten en hilos de foro sobre WhatsApp Web, consultas de soporte de Microsoft y un aviso sobre estafas con archivos .vbs, sin relación con Agnes-3.0-Flash ni con cuantizaciones GGUF.
