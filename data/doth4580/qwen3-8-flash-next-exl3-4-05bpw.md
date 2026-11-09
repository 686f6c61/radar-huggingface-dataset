# doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-4.05bpw es una cuantización EXL3 (trellis de ExLlamaV3) a 4,05 bits por peso del modelo Qwen3.8-Flash-Next del equipo Qwen. El modelo original es un transformer de mezcla de expertos (MoE) de aproximadamente 125.000 millones de parámetros totales, con unos 6.000 millones activos por token, e incorpora un codificador de visión, una tabla de embeddings n-gram con hash de 51.000 millones de parámetros y una capa MTP (multi-token prediction) de 4.000 millones. Este artefacto lo publica el usuario doth4580 y reduce el peso en disco de unos 360 GB en bf16 a unos 108 GB (68 GB de pesos más 39 GB de tabla n-gram).

El pack está pensado principalmente para ejecutarse con el motor de inferencia veloGB10 (`gb10_inference`) sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, aunque al usar el formato EXL3 estándar puede cargarse con cualquier framework que lea dicho formato. Incluye como única adición respecto al pack original de turboderp el fichero `vision_tower_bf16.safetensors`, la torre de visión en bf16 completa (333 tensores, 897.899.504 bytes), que veloGB10 usa para la entrada de imagen.

Su relevancia actual radica en que permite desplegar un modelo multimodal MoE de gran tamaño con contexto largo (262.144 tokens configurados en los ejemplos del autor) en hardware de gama estación de trabajo basado en GB10, algo inviable con los pesos en bf16. La licencia Qwen Community License 1.0 no es una licencia OSI, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con vision encoder, tabla de embeddings n-gram con hash y capa MTP |
| Parametros totales | 33.834.369.664 (safetensors del pack cuantizado); modelo original ~125B |
| Parametros activos | ~6B (modelo original) |
| Longitud de contexto | 262.144 tokens en la configuracion de ejemplo del autor |
| Tipos de cuantizacion | EXL3 trellis 4,05 bpw (expertos a 4 bits, head y tabla n-gram a 6 bits) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (no OSI) |
| Formato de pesos | safetensors (EXL3 trellis); incluye `vision_tower_bf16.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con aproximadamente 125.000 millones de parámetros totales y unos 6.000 millones activos por token. A esta estructura se suman dos componentes singulares: una tabla de embeddings n-gram con hash de 51.000 millones de parámetros y una capa MTP de 4.000 millones que actúa como cabeza de borrador para decodificación especulativa. El pack incorpora además un codificador de visión, lo que habilita la modalidad image-text-to-text.

La cuantización la realiza turboderp con exllamav3 sobre la revisión `4.05bpw_h6_ng6` (commit `55a732e0c4c3d4614bc42b68493bb930d9b02c0a`), con expertos a 4 bits y head y tabla n-gram a 6 bits. El pack de doth4580 es byte-idéntico al de turboderp salvo por la torre de visión en bf16 añadida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `conversational`).
- Entrada de imagen y texto (`image-text-to-text`) mediante el codificador de visión.
- Razonamiento de contexto largo, con ventanas de hasta 262.144 tokens en la configuración probada.
- Decodificación especulativa mediante la capa MTP incluida, con cabezas de borrador alternativas opcionales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes o expedientes de cientos de miles de tokens junto con sus figuras, gracias a la ventana de 262.144 tokens y al codificador de visión.
- Asistencia sobre capturas y diagramas técnicos: la torre de visión en bf16 permite interpretar diagramas de arquitectura, gráficos o interfaces y responder preguntas sobre ellos en conversaciones multi-turno.
- Despliegue en estaciones DGX Spark: con veloGB10 y una sola GB10 (TP=1) se sirve una API compatible con OpenAI en `http://<head-ip>:9000/v1`, adecuada para equipos que no tienen acceso a clústeres de GPU de centro de datos.
- Escalado horizontal en dos o cuatro GB10: el modo TP=2 o TP=4 reparte los pesos por red sin copia local del modelo en los nodos, útil para laboratorios que agregan varias estaciones pequeñas.
- Procesamiento por lotes con caché de prefijo: la opción `--prefix-cache on` y un `--max-batch` de 2 permiten reutilizar prefijos largos en flujos de preguntas repetidas sobre el mismo corpus.
- Experimentación con decodificación especulativa: las cabezas MTP alternativas (HermiHg o DotH-MTP) permiten medir el impacto en velocidad sin alterar la salida del modelo.
- Servicio de chat multimodal interno: al exponer una API compatible con OpenAI, puede conectarse a clientes y herramientas existentes sin adaptadores propios.

## Benchmarks y rendimiento

El autor menciona la existencia de pruebas con VeloBench contra la API servida en máquinas GB10 (2026-11-05, builds de desarrollo de veloGB10 0.7.7) con muestreo de producción, pero los resultados numéricos no están incluidos en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: unos 108 GB (68 GB de pesos más 39 GB de tabla n-gram), frente a unos 360 GB del release bf16.
- VRAM estimada para inferencia: no disponible de forma explícita; el pack está dimensionado para ejecutarse en una, dos o cuatro NVIDIA DGX Spark / GB10 (memoria unificada del sistema GB10).
- GPU recomendadas: NVIDIA DGX Spark / GB10 en configuraciones TP=1, TP=2 y TP=4.
- GPU de consumo (RTX 4090, etc.): no disponible; el pack está orientado a GB10 y no se documenta su comportamiento en GPUs de consumo.
- Motor de despliegue: veloGB10 (`gb10_inference`) v0.7.2 o superior, obligatorio para este pack; requiere el fichero PTX `src/ptx/exl3_bench_k6.ptx` añadido en esa versión. Al ser EXL3 estándar, otros frameworks que lean el formato pueden cargarlo, pero no se documentan en la información disponible.
- Red: para TP=2 y TP=4 se usa RoCE; en equipos con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: no disponibles; el autor remite a VeloBench sin cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-4.05bpw (este pack) | ~125B totales, ~6B activos | 262.144 tokens (config. probada) | EXL3 4,05 bpw | Qwen Community License 1.0 | Hugging Face, 6.473 descargas |
| Qwen3.8-Flash-Next-EXL3-3.05bpw | ~125B totales, ~6B activos | no disponible | EXL3 3,05 bpw | Qwen Community License 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (bf16) | ~125B totales, ~6B activos | no disponible | bf16 (~360 GB) | Qwen Community License 1.0 | Hugging Face |

La comparativa con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 no es una licencia OSI; conviene revisar sus condiciones antes de cualquier uso comercial.
- El pack contiene pesos modificados (cuantización EXL3); el modelo original es propiedad del equipo Qwen.
- Requiere veloGB10 v0.7.2 o superior: versiones anteriores del motor no pueden cargar este pack.
- Sin el fichero `vision_tower_bf16.safetensors`, veloGB10 arranca en modo solo texto y rechaza las peticiones con imagen; hay que mantenerlo junto a los pesos.
- veloGB10 no lee la torre de 6 bits del pack (`vision_k6.safetensors`); otros cargadores pueden ignorar la torre bf16 y usar la de 6 bits.
- El contexto máximo efectivo depende de los flags del servidor (`--max-seq-len`, `--max-tokens`); los valores de 262.144 y 65.536 son los probados por el autor, no necesariamente el límite del modelo.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Tool calling y comportamiento agéntico: no documentados en la información disponible.
- El rendimiento medido corresponde a builds de desarrollo de veloGB10 0.7.7 en hardware GB10; no hay datos para otras plataformas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Pack hermano de 3,05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
