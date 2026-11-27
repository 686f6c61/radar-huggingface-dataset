# NeosQ/Inkling-2-Mini-abliterated-MTPLX

## Resumen

Inkling-2-Mini-abliterated-MTPLX es una conversión de cuantización para Apple Silicon del modelo multimodal `orcarouter/Inkling-2-Mini-abliterated`, que a su vez deriva de `thinkingmachines/Inkling-2-Mini`. El autor, NeosQ, publica dos recetas independientes (16G y 12G) en formato MTPLX, un runtime propietario para MLX que no es compatible de forma directa con Hugging Face Transformers. El modelo combina una torre de visión de 23 capas con un backbone de texto MoE de 24 capas que reutiliza pesos en las capas 6 a 17 mediante tres pasadas de bucle (arquitectura `inkling2_loop`).

El modelo es relevante porque ofrece capacidades multimodales (texto e imagen de entrada, texto de salida) con un contexto declarado de 1.048.576 tokens y un tamaño total de aproximadamente 26,4B de parámetros, de los cuales solo unos 3,4B están activos por token (unos 5,4B de cómputo efectivo tras las tres pasadas de bucle). Esto lo sitúa en la categoría de MoE disperso de gran contexto, pensado para ejecutarse en Macs con memoria unificada de 24 GB o 16 GB según la receta.

La variante "abliterated" implica que los pesos originales han sido modificados para reducir los mecanismos de rechazo (refusal), lo que degrada sustancialmente la alineación de seguridad. El autor lo advierte explícitamente y limita el uso recomendado a investigación, evaluación y red-teaming. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` / `Inkling2LoopForConditionalGeneration` (MoE con bucle de capas compartidas) |
| Parametros totales | ~26,4B (26,07B texto + 0,32B visión), más 0,32B del drafter MTP |
| Parametros activos | ~3,4B por token; ~5,4B de cómputo efectivo tras tres pasadas de bucle |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | 16G: NVFP4 4-bit grupo 16 en expertos + affine 8-bit grupo 64 en atención/embeddings/head; 12G: affine 3-bit grupo 128 en expertos + affine 4-bit grupo 64 en atención/embeddings/head; torre de visión y drafter MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MTPLX pack con `mtp.safetensors`, `mtplx-pack.json`, `mtplx_runtime.json`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida denominada `inkling2_loop`: un decoder de 24 capas en el que las capas 6 a 17 comparten pesos y se ejecutan tres veces, dando lugar a 48 aplicaciones de capa por token. Cada capa contiene 128 expertos enrutados con 8 activos por token y sin experto compartido. La atención combina 20 capas de ventana deslizante de 1.024 tokens con 4 capas de atención global. La torre de visión tiene 23 capas con tamaño oculto de 1.024, y el vocabulario es de 201.024 entradas (200.058 usadas).

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original. Sí se documenta la cadena de conversión: los pesos finales provienen de `orcarouter/Inkling-2-Mini-abliterated` (revisión `3fb8f74df2ee728adbd3d6938d9d7d89edb5b236`), que es una build BF16 con rechazo reducido del modelo base `thinkingmachines/Inkling-2-Mini`. Las conversiones MTPLX se re-cuantizaron directamente desde los safetensors BF16 de origen, no por des-cuantización y reempaquetado de las MLX existentes.

La innovación técnica destacable es la inclusión de un drafter MTP (Multi-Token Prediction) de 54 tensores BF16, idéntico en SHA-256 al upstream, que habilita decodificación especulativa. Tanto la torre de visión (422 tensores BF16 byte-idénticos) como el drafter se preservan sin cuantizar en ambas recetas; la cuantización se aplica solo al backbone de texto (expertos, proyecciones de atención, embedding y head de salida).

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce texto.
- Comprensión de imágenes mediante torre de visión de 23 capas preservada en BF16.
- Contexto extremadamente largo: 1.048.576 tokens declarados, adecuado para documentos masivos o conversaciones prolongadas.
- Decodificación especulativa mediante drafter MTP integrado.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modo de pesos abliterated: responde a solicitudes que un modelo alineado rechazaría (ver limitaciones).
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo abliterated permite estudiar comportamientos de rechazo reducido y evaluar salvaguardas en pipelines de moderación, usando las recetas 16G o 12G en Macs de 24 GB o 16 GB.
- Análisis de documentos extensos con imágenes: con 1.048.576 tokens de contexto, se pueden ingerir manuales técnicos, informes con figuras o expedientes completos y formular preguntas sobre su contenido combinando texto e imagen.
- Procesamiento local en Apple Silicon: despliegue en Macs con memoria unificada sin GPU dedicada, útil para entornos de desarrollo con requisitos de privacidad que impiden enviar datos a la nube.
- Evaluación comparativa de cuantizaciones: las dos recetas (16G NVFP4/affine 8-bit y 12G affine 3-bit/affine 4-bit) permiten medir el impacto de la cuantización en calidad y latencia sobre el mismo modelo base.
- Experimentación con decodificación especulativa: el drafter MTP preservado en BF16 permite estudiar el rendimiento de MTP en MLX frente a decodificación autoregresiva estándar.
- Investigación multilingüe inglés-chino: análisis de textos y pares de idiomas en entornos académicos, con la advertencia de que solo se declaran esos dos idiomas.
- Prototipado de asistentes conversacionales de contexto largo en local, siempre que se apliquen salvaguardas externas dado el estado abliterated de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (macOS 14+) con MTPLX 2.13.3 y MLX 0.32.2; no es un checkpoint drop-in de Hugging Face Transformers.
- Memoria unificada mínima recomendada: 24 GB para la receta 16G y 16 GB para la 12G en contextos cortos; contextos largos requieren más memoria y se recomiendan máquinas con mayor capacidad.
- Tamaño en disco: 16,85 GB (15,69 GiB) para 16G y 12,24 GB (11,40 GiB) para 12G; el tamaño en disco no equivale a memoria residente (pesos + caché KV + buffers de runtime).
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato MTPLX está diseñado para memoria unificada de Apple Silicon.
- Opciones de despliegue: exclusivamente MTPLX 2.13.3 sobre MLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| NeosQ/Inkling-2-Mini-abliterated-MTPLX (16G/12G) | ~26,4B totales, ~3,4B activos | 1.048.576 | MTPLX / MLX (Apple Silicon) | Apache 2.0 | Abliterated, multimodal, drafter MTP |
| orcarouter/Inkling-2-Mini-abliterated | ~26,4B totales (BF16) | no disponible en la información | safetensors BF16 | no disponible en la información | Modelo fuente de la conversión; abliterated |
| thinkingmachines/Inkling-2-Mini | ~26,4B totales | no disponible en la información | safetensors | no disponible en la información | Modelo base original, alineado |
| Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality | no disponible en la información | no disponible en la información | MTPLX / MLX | no disponible en la información | Referencia de formato citada por el autor |

## Limitaciones y advertencias

- Pesos abliterated: la alineación de seguridad está sustancialmente reducida y el modelo puede cumplir solicitudes dañinas, poco éticas o ilegales. El autor restringe el uso a investigación legítima, evaluación, red-teaming y trabajo autorizado.
- Responsabilidad del despliegue: el usuario debe implementar salvaguardas propias y asume la responsabilidad de todo el contenido generado.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la falta de benchmarks publicados.
- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Compatibilidad: no es un checkpoint estándar de Transformers; requiere MTPLX 2.13.3 y Apple Silicon, lo que excluye servidores con GPU NVIDIA o AMD.
- La receta 12G declara `mxfp8` como modo de activación/cómputo en `hf_quant_config.json` aunque los pesos de expertos están en affine 3-bit; es metadato de adaptación del runtime, no un formato de almacenamiento.
- Memoria: el tamaño en disco subestima la memoria residente necesaria; contextos largos pueden exceder la memoria unificada de equipos de 16-24 GB.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeosQ/Inkling-2-Mini-abliterated-MTPLX
- README en chino: https://huggingface.co/NeosQ/Inkling-2-Mini-abliterated-MTPLX/blob/main/README.zh-CN.md
- Modelo fuente (abliterated): https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Referencia de formato MTPLX: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Runtime MTPLX: https://github.com/youssofal/MTPLX
