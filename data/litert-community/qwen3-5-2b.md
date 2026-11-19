# litert-community/Qwen3.5-2B

## Resumen
Qwen3.5-2B en formato LiteRT-LM es la conversión del modelo multimodal Qwen/Qwen3.5-2B de Alibaba al runtime on-device de Google (LiteRT-LM, anteriormente TensorFlow Lite), distribuida por el colectivo litert-community. El objetivo es ejecutar un modelo de 2B parámetros con capacidades de texto e imagen directamente en dispositivos de borde (smartphones, SBCs, portátiles) sin necesidad de GPU de servidor ni conexión a la nube.

La arquitectura subyacente es híbrida: bloques de atención lineal GatedDeltaNet intercalados con bloques de atención completa con compuertas. En esta variante de 2B hay 18 capas de atención lineal y 6 de atención completa, lo que reduce drásticamente el crecimiento del estado recurrente frente al KV cache tradicional y permite mantener el consumo de memoria casi plano con la longitud de contexto.

El repositorio ofrece dos artefactos: una versión solo texto (1,97 GB) y una versión visión-lenguaje (3,15 GB) que incorpora el ViT de 24 capas del checkpoint original. Requiere litert-lm ≥ 0.15 y está pensado para despliegues en Android, Raspberry Pi 5 y equipos de escritorio con CPU o GPU integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas GatedDeltaNet (atención lineal con regla delta compuertada) + 6 capas de atención completa compuertada; ViT de 24 capas en la variante VL |
| Parametros totales | 2B (aproximado, según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 6 capas de atención completa; las capas lineales usan estado recurrente de tamaño constante |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; proyecciones de decaimiento/compuerta (`in_proj_a`, `in_proj_b`) y convoluciones en float; activaciones declaradas fp32; ViT en fp16 con adaptador int8 |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base Qwen3.5 es multilingüe, pero no se detalla el conjunto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); también disponible el checkpoint original en safetensors en Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-2B emplea una arquitectura híbrida propietaria de Alibaba que combina bloques GatedDeltaNet (atención lineal con regla delta compuertada) con un número reducido de bloques de atención completa compuertada. La ventaja estructural es que las capas lineales mantienen un estado recurrente y convolucional de tamaño fijo por capa, en lugar de un KV cache que crece con el contexto; solo las 6 capas de atención completa conservan KV, con un presupuesto de 4096 tokens. Esto hace que la memoria sea prácticamente plana respecto a la longitud de contexto, algo crítico en dispositivos con RAM limitada.

La conversión a LiteRT-LM se realizó con `litert_torch.convert` (antes ai-edge-torch), sin modificar el modelo, y se validó con una coincidencia de 4e-7 frente al original en un Galaxy S26. La versión solo texto elimina el tower de visión y las cabeceras MTP siguiendo el contrato de carga de `Qwen3_5ForCausalLM`; la versión VL reincorpora el ViT de 24 capas del checkpoint con entrada estática de 512×512 y seis firmas de prefill. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades
- Generación de texto y razonamiento multi-turno con contexto de hasta 4096 tokens en las capas de atención completa.
- Procesamiento de imagen y texto (variante VL): entrada image-text-to-text con ViT de 24 capas a resolución estática 512×512.
- Razonamiento aritmético multi-paso: la re-cuantización del 11-10-2026 corrigió un bucle de repetición en CPU con el modo thinking desactivado.
- Modo thinking configurable (activado/desactivado) heredado del modelo base Qwen3.5.
- Soporte multilingüe heredado del modelo base (no se detalla el conjunto exacto de idiomas).
- Ejecución on-device en CPU y GPU mediante LiteRT-LM, con delegación completa de operadores (25.703 ops delegadas en GPU en Galaxy S26).
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso
- Asistente conversacional offline en Android: integrado mediante `com.google.ai.edge.litert:litert`, el modelo puede gestionar diálogos multi-turno en el propio dispositivo con 17,5 tok/s de decodificación en GPU y TTFT de 520 ms, sin enviar datos a la nube.
- Análisis de documentos e imágenes en el dispositivo: la variante VL permite extraer texto, describir imágenes o responder preguntas sobre capturas y fotos con entrada 512×512, útil en apps de accesibilidad o escaneo.
- Automatización en Raspberry Pi 5: con 4,2 tok/s de decodificación y 56 tok/s de prefill en CPU con 4 hilos, es viable para tareas de clasificación, resumen o respuestas cortas en entornos embebidos sin GPU.
- Procesamiento por lotes en portátiles: la versión solo texto de 1,97 GB cabe en equipos con 8 GB de RAM y permite resúmenes, extracción de entidades o generación de respuestas en aplicaciones de escritorio.
- Prototipado de agentes locales: el modelo puede servir como motor de razonamiento en pipelines de agentes que requieran privacidad total, con estado recurrente que no crece con el contexto y por tanto no agota la memoria en sesiones largas.
- Filtrado y moderación de contenido en el borde: clasificación de texto e imagen en tiempo real dentro de la app, sin latencia de red, aprovechando la cuantización int8 y la delegación completa a GPU.
- Educación y demos interactivas: despliegue en dispositivos de gama media para demostraciones de IA generativa multimodal sin infraestructura de servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos en dispositivo son los siguientes:

| Plataforma | Runtime | Backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | 17,5 | 450 | 520 ms |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | 19,0 | 181 | 1,20 s |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | 4,2 | 56 | 5,04 s |

Mediciones realizadas el 2026-09-05 (Galaxy S26) y 2026-09-01 (Raspberry Pi 5) sobre el archivo VL previo a la re-cuantización del 2026-10-11 (sha256 `f8821e40…`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-2B (LiteRT-LM) | 2B | 4096 (KV) + estado recurrente | `.litertlm` int8 | Apache 2.0 | On-device híbrido, texto + visión |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | no disponible | `.litertlm` | Apache 2.0 | On-device, menor huella |
| Qwen3.5-4B (LiteRT-LM) | 4B | no disponible | `.litertlm` | Apache 2.0 | On-device, mayor capacidad |

La comparativa se limita a la familia Qwen3.5 convertida por el mismo colectivo; no se dispone de datos de benchmarks ni de especificaciones detalladas de las variantes 0.8B y 4B en la información proporcionada.

## Limitaciones y advertencias
- La versión solo texto publicada el 2026-08-14 y la VL del 2026-08-25 presentaban un bucle de repetición en respuestas aritméticas multi-paso con backend CPU y thinking desactivado; fue corregido en la re-cuantización del 2026-10-11. Verificar el sha256 del archivo descargado.
- El tokenizer original de la versión solo texto (hasta el 2026-10-16) no incluía la clase `\p{M}`, lo que producía tokenización incorrecta en textos con marcas combinantes (hindi, tailandés, tamil, árabe con harakat). Actualizado al tokenizer oficial del repositorio base.
- El presupuesto KV de 4096 tokens en las 6 capas de atención completa limita el contexto efectivo; las capas lineales no crecen, pero la atención completa sí.
- La variante VL usa entrada estática de 512×512, lo que restringe la resolución de imágenes procesables.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base en la documentación proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-2B por si hubiera condiciones adicionales.
- Requiere litert-lm ≥ 0.15; versiones anteriores no son compatibles.
- El rendimiento en CPU es sensiblemente inferior al de GPU en prefill (181 vs 450 tok/s en Galaxy S26), lo que afecta a la latencia en prompts largos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Variante 4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Benchmark edge-compat (registro de mediciones): https://github.com/john-rocky/edge-compat/blob/main/cards/qwen35-2b-vl-int8/CARD.md
- Benchmark apple-silicon-llm-bench (medición de conversión): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
