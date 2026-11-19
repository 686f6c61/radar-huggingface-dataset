# litert-community/Ministral-3-3B-Instruct-2512

## Resumen

Ministral-3-3B-Instruct-2512 (LiteRT-LM) es la conversión al formato `.litertlm` del modelo `mistralai/Ministral-3-3B-Instruct-2512` de Mistral AI, publicada por la comunidad `litert-community`. El objetivo no es ofrecer un modelo nuevo, sino empaquetar los pesos del transformer de 3B parámetros de Mistral en un bundle optimizado para inferencia on-device con el runtime LiteRT-LM de Google (el sucesor de TensorFlow Lite), de modo que el modelo pueda ejecutarse íntegramente en teléfonos Android, iPhone, Macs con Apple Silicon y placas como Raspberry Pi 5.

La conversión es exclusivamente de texto: se conserva el decoder de Ministral-3 y se descarta la torre de visión Pixtral del modelo original. Los pesos se cuantizan a int4 por bloques de 32 con clipping OCTAV y embeddings atados en INT8, lo que reduce el bundle a unos 2,34 GB. La ventana de contexto efectiva en esta conversión es de 4096 tokens (KV cache), no la del modelo base.

El interés actual reside en que demuestra que un instruct model de 3B con calidad razonable puede correr a 22 tok/s de decode en un Galaxy S26 y a 129 tok/s en un M4 Max, con licencia Apache-2.0 y sin dependencia de la nube. Es una pieza relevante para quienes construyen asistentes locales, aplicaciones móviles con privacidad estricta o prototipos de agentes en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral; sin vision tower en esta conversion) |
| Parametros totales | 3B (aproximado, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (KV cache del bundle) |
| Tipos de cuantizacion | int4 blockwise (bloque 32), simetrica, OCTAV clipping; embedding/lm_head atados en INT8; compute entero |
| Idiomas soportados | no disponible (la model card no los enumera; el modelo base Mistral es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~2,34 GB); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de Mistral AI con aproximadamente 3B parámetros, en su variante Instruct (ajustada para seguir instrucciones y responder directamente, sin bloque `<think>`). Esta publicación concreta no entrena nada: es una conversión de pesos. El proceso aplica cuantización int4 por bloques de 32 con clipping OCTAV y mantiene el embedding y el `lm_head` atados en INT8, con cómputo entero en el runtime.

La innovación técnica relevante está en el grafo exportado. La versión del 6 de octubre de 2026 reescribe el grafo GPU usando `--apply_gpu_composites` de litert-torch: una operación `odml.cache_update` compuesta por capa para escribir la KV cache, composites `odml.runtime_bmm` para las atenciones, y una firma adicional de prefill de 16 tokens que comparte buffers de pesos con `prefill_128`. Según la model card, esta reescritura mejora el decode GPU en ×1,401 (92,4 → 129,5 tok/s) y reduce el TTFT de 16 tokens de 0,121 s a 0,038 s en M4 Max, sin cambios en los pesos. No se documentan en la información disponible detalles sobre tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto e instrucciones en modo directo (instruct, sin cadena de pensamiento explícita).
- Conversación multi-turno mediante la plantilla nativa Mistral `[INST] … [/INST]` con stop token `</s>`.
- Razonamiento básico y resolución de problemas aritméticos de nivel escolar (se reportan 26/30 en GSM8K con decodificación greedy).
- Generación de código y texto técnico, heredada del modelo base de 3B.
- Capacidades multilingües del modelo base Mistral (no se detallan idiomas concretos en la información disponible).
- Ejecución on-device con backend GPU o CPU en LiteRT-LM; soporte WebGPU en navegador.
- No incluye visión en esta conversión (la torre Pixtral se elimina).
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la model card.

## Casos de uso

- Asistentes locales en Android: integrado en la Google AI Edge Gallery o en una app propia con `com.google.ai.edge.litert`, el modelo responde sin conexión y sin enviar datos a la nube, lo que encaja en aplicaciones de salud, finanzas personales o notas privadas.
- Chat en navegador con WebGPU: el demo oficial carga el bundle de 2,34 GB y ejecuta inferencia en el cliente, útil para demos interactivas o entornos donde no se quiere desplegar backend.
- Autocompletado y reescritura de texto en aplicaciones de escritorio para macOS con Apple Silicon: los 129 tok/s de decode en M4 Max permiten experiencias de escritura asistida casi en tiempo real.
- Clasificación y extracción de información en pipelines de borde: con 4K de contexto se pueden procesar correos, tickets o fragmentos de documentos y devolver JSON estructurado desde un dispositivo sin GPU dedicada.
- Prototipado de razonamiento matemático ligero: los 26/30 en GSM8K lo hacen apto para tutores educativos offline o verificación de cálculos simples en apps de finanzas.
- Evaluación de modelos en hardware heterogéneo: sirve como referencia reproducible para medir latencia y throughput (Pixel 8a, Galaxy S26, Raspberry Pi 5, iPhone 17 Pro) en proyectos de benchmarking edge.
- Sustituto de LLM en entornos air-gapped: al ser Apache-2.0 y ejecutarse con un runtime open source, puede desplegarse en dispositivos industriales o de campo sin dependencia de proveedores cloud.

## Benchmarks y rendimiento

Datos publicados en la model card (no son benchmarks académicos estándar, sino métricas de inferencia y una evaluación cualitativa):

| Plataforma | Runtime / backend | Decode | Prefill | TTFT | Notas |
|---|---|---:|---:|---:|---|
| Galaxy S26 | LiteRT-LM prebuilt-adac974b, GPU | 22,1 tok/s | 338 tok/s | 3,07 s | 1210 ops delegadas |
| Pixel 8a | LiteRT-LM 0.16.0, GPU | 6,8 tok/s | 8 tok/s | 1,68 s | 1187 ops delegadas |
| Mac Studio M4 Max | LiteRT-LM 0.17.1, GPU | 129,5 tok/s | 1340 tok/s | 201 ms | 1210 ops delegadas |
| Mac Studio M4 Max | LiteRT-LM 0.17.1, CPU | 22,5 tok/s | no disponible | 0,589 s (16 tok) | init 3,1 s |

Calidad: 26/30 correctas en GSM8K (greedy, hasta 2048 tokens), según la model card.

## Requisitos de hardware

- Espacio en disco: ~2,34 GB para el bundle `.litertlm` (2.342.866.928 bytes).
- VRAM/RAM: no se publica un mínimo explícito; el modelo cabe en dispositivos móviles de gama alta (Galaxy S26, iPhone 17 Pro) y en placas como Raspberry Pi 5, lo que sugiere un presupuesto de memoria en el rango de 2-3 GB.
- GPU recomendadas: GPU integrada de Apple Silicon (M4 Max medido), GPU móvil Adreno/Mali recientes, y cualquier GPU con soporte WebGPU para el demo de navegador.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con ≥4 GB de VRAM si se usa un runtime alternativo; en el formato nativo no se distribuyen pesos para vLLM, llama.cpp u Ollama.
- Opciones de despliegue: LiteRT-LM (`litert_lm_main`), Google AI Edge Gallery en Android, WebGPU en navegador. No hay GGUF ni safetensors en este repo, por lo que no es directamente compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia/throughput: ver tabla de benchmarks; el TTFT de 16 tokens en M4 Max GPU es de 38 ms y en CPU de 589 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | 3B | 4096 | `.litertlm` / LiteRT-LM | Apache-2.0 | Conversion on-device, solo texto |
| mistralai/Ministral-3-3B-Instruct-2512 | 3B | no disponible en la informacion | safetensors / transformers | Apache-2.0 | Modelo base, incluye vision (Pixtral) |
| Otros modelos edge de ~3B | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- La conversión elimina la torre de visión: no admite entradas de imagen aunque el modelo base sí.
- Contexto limitado a 4096 tokens en esta conversión; prompts largos se truncan o degradan.
- No es un modelo de razonamiento con cadena de pensamiento; responde directamente y puede fallar en tareas que requieran planificación multi-paso.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en dominios especializados y preguntas factuales.
- No se documentan sesgos específicos en la model card; al heredar el modelo base de Mistral, arrastra los sesgos de sus datos de entrenamiento.
- No hay pesos en safetensors ni GGUF en este repositorio: el uso queda atado al runtime LiteRT-LM y a sus plataformas soportadas.
- El soporte de tool calling y agentes no está documentado; no debe asumirse en producción.
- Las cifras de rendimiento en Raspberry Pi 5, Pixel 8a e iPhone 17 Pro corresponden al fichero anterior y no se han re-medido tras la reescritura del grafo.
- Aunque la licencia es Apache-2.0, conviene revisar los términos del modelo base y del runtime LiteRT-LM antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Ministral-3-3B-Instruct-2512
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de Gallery: https://github.com/google-ai-edge/gallery/releases
- Ficha de benchmarks edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/ministral3-3b/CARD.md
- Resultados de conversión litert-torch: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
