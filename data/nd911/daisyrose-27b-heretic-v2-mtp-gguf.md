# ND911/DaisyRose-27B-Heretic-v2-MTP-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-MTP-GGUF es una colección de cuantizaciones GGUF del modelo multimodal DaisyRose-27B en su variante "abliterated" (sin comportamiento de rechazo), publicada por el usuario ND911. El modelo base es RadixArk/DaisyRose-27B, un post-entrenamiento mediante RL sobre Qwen3.8-27B, y la variante sin censura procede de kelsey1337/DaisyRose-27B-Heretic-v2, generada con Heretic 2.1.0 y su técnica de ablación de rango arbitrario (ARA). El pipeline es image-text-to-text: acepta texto e imágenes y genera texto.

La particularidad técnica de este repositorio es que preserva la cabeza MTP (multi-token prediction) dentro de cada archivo GGUF. Las cuantizaciones comunitarias habituales de DaisyRose-27B descartan esa cabeza durante la conversión, lo que elimina la mayor parte de la aceleración por decodificación especulativa en llama.cpp. Aquí se reconstruye un checkpoint solo-texto con los 15 tensores `mtp.*` extraídos del shard original y se remapean a `blk.64`, de modo que llama.cpp puede autoespecular con `--spec-type draft-mtp` sin cargar un segundo modelo.

El modelo es denso, con 27.320.697.856 parámetros, contexto nativo de 262K tokens, modo thinking activado por defecto y licencia Apache-2.0. El repositorio ocupa 120,8 GB e incluye cuantizaciones desde IQ4_XS (14,48 GiB) hasta Q8_0 (27,05 GiB), además del proyector visual en BF16. No registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5/Qwen3.8, `Qwen3_5ForConditionalGeneration`), con cabeza MTP de 1 capa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (131.072 en el ejemplo de ejecución) |
| Tipos de cuantizacion | IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector visual en BF16 (f16 en el archivo mmproj) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para visión |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros derivado de Qwen3.8-27B. RadixArk lo post-entrenó exclusivamente con RL sobre aproximadamente 1.200 tareas de agente de horizonte largo, con un coste declarado de 18 días en 144 GPU H200. La arquitectura es multimodal: un tronco de lenguaje más un codificador visual, con proyector independiente exportado como `mmproj`. Incluye una cabeza MTP de una sola capa (`mtp_num_hidden_layers = 1`) que permite predicción multi-token y decodificación especulativa nativa.

La variante Heretic-v2 aplica ablación de rango arbitrario (ARA) sobre las atenciones para eliminar el comportamiento de rechazo: 99 ensayos de Optuna, partiendo de 98/100 rechazos en la evaluación base hasta 0/100 frases de rechazo duras con una divergencia KL de 0,0715, conservando lenguaje de matización en 54 de 100 respuestas. El proceso de construcción de este GGUF reconstruye un checkpoint solo-texto (`Qwen3_5ForCausalLM`) para evitar la rama `no_mtp` del conversor, empalma los 15 tensores `mtp.*` del shard 18 del modelo original y los remapea a `blk.64` (11 tensores de capa estándar más 4 `nextn.*`). El layout final tiene 770 tensores. La cabeza MTP no fue modificada por Heretic, por lo que se reutiliza tal cual; al tener `mtp_use_dedicated_embeddings = false`, comparte embeddings y `lm_head` con el modelo objetivo. Las cuantizaciones IQ4 usan una imatrix calculada sobre el modelo limpio (bartowski/RadixArk_DaisyRose-27B-GGUF), que es estadística de calibración y no transfiere comportamiento de seguridad.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262K tokens nativos).
- Comprensión de imágenes (image-text-to-text) mediante el proyector visual incluido.
- Modo thinking activado por defecto, con razonamiento explícito antes de responder.
- Razonamiento de horizonte largo y ejecución de tareas de agente, fruto del post-entrenamiento con RL sobre tareas agénticas.
- Decodificación especulativa auto-contenida mediante la cabeza MTP preservada (`--spec-type draft-mtp`), sin necesidad de un modelo borrador externo.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Comportamiento sin rechazo (abliterated): no genera frases de rechazo duras en la evaluación declarada, aunque mantiene matices y advertencias en parte de las respuestas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y plantillas Jinja (`--jinja`).

## Casos de uso

- Asistentes conversacionales de contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de 262K tokens, útil para análisis de contratos, informes o bases de código completas en una sola sesión.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, sirve para extraer información de capturas, diagramas, facturas escaneadas o interfaces de usuario combinadas con texto de contexto.
- Despliegue local en estaciones de trabajo con GPU consumer: las cuantizaciones IQ4_XS (14,48 GiB) e IQ4_NL (15,12 GiB) permiten ejecutar un modelo de 27B en GPUs de 16-24 GB de VRAM mediante llama.cpp.
- Inferencia de baja latencia con decodificación especulativa: la cabeza MTP preservada permite activar `--spec-type draft-mtp` en llama.cpp para acelerar la generación sin cargar un segundo modelo, adecuado para servicios interactivos.
- Investigación sobre alineación y comportamiento de rechazo: la variante abliterated con métricas documentadas (0/100 rechazos, KL 0,0715) sirve como objeto de estudio comparativo frente al modelo original.
- Pipelines de agentes con razonamiento extendido: el entrenamiento RL sobre tareas de horizonte largo y el modo thinking lo hacen apto para flujos multi-paso que requieren planificación sostenida.
- Prototipado multimodal sin dependencia de APIs: al ser Apache-2.0 y ejecutable con llama.cpp, permite construir demos de visión-lenguaje en local o en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): IQ4_XS ≈ 14,5 GiB; IQ4_NL ≈ 15,1 GiB; Q4_K_M ≈ 15,8 GiB; Q5_K_M ≈ 18,3 GiB; Q6_K ≈ 20,9 GiB; Q8_0 ≈ 27,1 GiB. Añadir 0,87 GiB del proyector visual y el espacio de caché KV según contexto y cuantización de caché (`-ctk q5_1 -ctv q5_1` en el ejemplo del autor).
- GPU recomendadas: para Q8_0 o Q6_K con contexto largo, GPUs de 40-80 GB (A100 40/80 GB, H100). Para IQ4_NL con contexto moderado, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en tarjetas de 16 GB para IQ4_XS/IQ4_NL con contexto recortado, y con más holgura en 24 GB (RTX 4090, 3090, 7900 XTX con backend compatible).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de `--flash-attn`, `--jinja` y `--spec-type draft-mtp`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la preservación de MTP recupera "la mayor parte" de la aceleración de la decodificación especulativa de llama.cpp, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | MTP en GGUF |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-MTP (este repo) | 27,3B denso | 262K | Texto + imagen | Apache-2.0 | Sí (blk.64, 15 tensores) |
| Cuantizaciones GGUF comunitarias de DaisyRose-27B | 27,3B denso | 262K | Texto + imagen | Apache-2.0 | No (cabeza descartada) |
| kelsey1337/DaisyRose-27B-Heretic-v2 (BF16) | 27,3B denso | 262K | Texto + imagen | Apache-2.0 | No (perdida en el guardado) |
| RadixArk/DaisyRose-27B (original) | 27,3B denso | 262K | Texto + imagen | Apache-2.0 | Sí (formato HF) |

La diferencia principal frente a las alternativas no es de rendimiento bruto del modelo, sino de empaquetado: este repositorio es el único de la comparativa que combina tronco abliterated, visión mediante mmproj y cabeza MTP funcional en llama.cpp. No se dispone de datos de benchmarks que permitan comparar calidad entre variantes.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin salvaguardas. No es adecuado para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo post-entrenado con RL sobre tareas agénticas, puede producir planes o afirmaciones plausibles pero incorrectas.
- Idiomas: la model card declara únicamente inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La ablación puede degradar capacidades generales: la divergencia KL de 0,0715 respecto al modelo base implica un cambio medible en la distribución de salida, con posible pérdida de calidad en tareas sensibles.
- La imatrix usada para IQ4 proviene del modelo limpio; el autor argumenta que no transfiere comportamiento de seguridad, pero no hay validación independiente de las cuantizaciones IQ4 frente a Q4_K_M en calidad.
- El repositorio no registra descargas ni likes, y el lanzador incluido (`run-daisyrose-heretic.bat`) tiene rutas de Windows que requieren edición manual.
- El contexto de 262K exige caché KV considerable; con cuantización de caché q5_1 y contexto completo, la VRAM adicional puede superar la de los pesos en GPUs de 24 GB.
- Aunque la licencia es Apache-2.0, la condición de modelo sin censura traslada al desplegador la responsabilidad legal y ética del uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ND911/DaisyRose-27B-Heretic-v2-MTP-GGUF
- Modelo base abliterated: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Modelo original (fuente de la cabeza MTP): https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones GGUF del modelo limpio (imatrix): https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF
