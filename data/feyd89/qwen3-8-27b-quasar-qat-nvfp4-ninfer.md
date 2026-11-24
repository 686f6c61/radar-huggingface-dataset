# Feyd89/Qwen3.8-27B-QUASAR-QAT-nvfp4-NInfer

## Resumen

Feyd89/Qwen3.8-27B-QUASAR-QAT-nvfp4-NInfer es un artefacto de pesos cuantizados en formato `.ninfer` (v3) para el runtime NInfer, derivado del checkpoint Qwen3.8-27B-QUASAR-NVFP4 de QUASAR-QAT. No es un modelo entrenado desde cero: es una conversión de un modelo de 27B parámetros con cuantización NVFP4 aplicada mediante quantization-aware training (QAT) sobre todas las proyecciones, empaquetada para ejecutarse con paralelismo tensorial en dos GPU de 16 GB.

El interés principal es de despliegue: el autor verifica la ejecución en 2× RTX 5070 Ti (PCIe, sin P2P) con `--tp 2` en el fork capy-flash (antes ninfer-tp2) del runtime NInfer, alcanzando 196.608 tokens de contexto con visión y MTP a 13.083/12.743 MiB por tarjeta, y hasta 262.144 tokens. Frente al artefacto NVFP4 oficial, los pesos ocupan 17,0 GiB en lugar de 20,9 GiB, lo que libera aproximadamente 2 GiB por tarjeta o permite el contexto máximo.

El repositorio contiene dos ficheros con los mismos pesos: uno con texto, visión y MTP (17,4 GB), y otro que añade el drafter DFlash2 (19,2 GB) para decodificación especulativa. La licencia es Apache-2.0 y el modelo base arquitectónico es Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B), con torre de visión y cabeza MTP; pesos en NVFP4/FP8/Q4-Q8 |
| Parametros totales | 27B (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | 196.608 tokens verificados con visión y MTP; 262.144 tokens también caben |
| Tipos de cuantizacion | NVFP4 (512 proyecciones), FP8 (lm_head y embeddings), BF16 (proyecciones GDN a/b), Q4-Q8 (visión, MTP y drafter) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se documenta en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` v3 (dos ficheros: 17,4 GB y 19,2 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer con torre de visión y cabeza MTP (multi-token prediction). Sobre él, QUASAR-QAT aplicó quantization-aware training para llevar las 512 proyecciones a NVFP4, manteniendo `lm_head` y embeddings en FP8 y decodificando las proyecciones GDN `a`/`b` a BF16 porque el runtime las requiere sin cuantizar. Las normas se conservan tal cual. La torre de visión y la cabeza MTP se leen de las copias BF16 del checkpoint QUASAR y se cuantizan con las opciones `_optional` oficiales (Q4-Q8).

La conversión de este artefacto se realiza con el conversor de NInfer mediante la receta `quasar_recipe.py` y el modo `import_encoded`, que importa los códigos, escalas de bloque y escala global tal como los produjo QUASAR, sin recuantizar. No se necesita una copia BF16 de Qwen3.8-27B: el checkpoint QUASAR es a la vez `--model` y fuente `quantized`. La variante `_dflash2` añade el drafter DFlash2 (MLP gate/up en NVFP4 desde el BF16, resto Q8 con las opciones `_optional`), habilitando decodificación especulativa con 7 borradores y cabeza de propuesta optimizada. La conversión con `--device cpu` tarda unos dos minutos y consume 0,75 GB de RAM. No se documentan datos de entrenamiento (tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, verificado en pruebas de conversación y en una replay de agente de 53 turnos con hasta 81K tokens.
- Generación de JSON estructurado: probado con 200 objetos en una sola petición.
- Edición de código: devuelve ficheros completos de 206 líneas en las mediciones del autor.
- Citación y recuperación sobre contexto largo: localización de 3 funciones dentro de 30K tokens.
- Capacidades de visión a través de la torre de visión incluida en ambos ficheros.
- MTP (multi-token prediction) para decodificación con 3 borradores en el fichero sin drafter.
- Decodificación especulativa con DFlash2 (7 borradores) en el fichero `_dflash2`.
- Multilingüismo: el modelo base Qwen3.8-27B es multilingüe, pero esta ficha no documenta idiomas concretos.
- Tool calling y function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Despliegue de un modelo de 27B en dos GPU de consumo: el artefacto permite servir Qwen3.8-27B con 196.608 tokens de contexto en 2× RTX 5070 Ti, algo inviable con pesos BF16 o con el artefacto NVFP4 oficial en el mismo hardware.
- Asistentes conversacionales de contexto largo: la ventana de 196K-262K tokens permite mantener historiales extensos o documentación completa en memoria, con velocidades de 181-277 tok/s en conversación.
- Generación de JSON para pipelines de datos: los 249-415 tok/s en generación de 200 objetos JSON lo hacen adecuado para extracción estructurada por lotes.
- Edición de código asistida: con 263-520 tok/s devolviendo ficheros de 206 líneas, encaja en flujos de refactorización o generación de parches donde la latencia importa.
- Agentes multi-turno con herramientas: la replay de 53 turnos y hasta 81K tokens a 205-234 tok/s demuestra viabilidad para bucles de agente con contexto acumulado.
- Procesamiento de documentos con visión: la torre de visión incluida permite tareas de comprensión de imágenes junto a texto largo dentro de la misma ventana.
- Inferencia en clústeres pequeños sin P2P: verificado en PCIe sin peer-to-peer, útil en estaciones de trabajo con dos GPU consumer y sin NVLink.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de decodificación (una petición, greedy, thinking off, tres ejecuciones, tok/s) en 2× RTX 5070 Ti:

| Tarea | MTP 3 (sin drafter) | DFlash2 7 (con drafter) |
|---|---|---|
| Conversación | 181 | 277 |
| JSON (200 objetos) | 249 | 415 |
| Edición de código (fichero de 206 líneas) | 263 | 520 |
| Ensayo en italiano | 150 | 140 |
| Citar 3 funciones de 30K tokens | 250 | 385 |
| Replay de agente de 53 turnos (hasta 81K tokens) | 205,0 | 234,3 |

Uso de memoria a `--tp 2` con 196.608 tokens, visión y MTP: 13.083/12.743 MiB por tarjeta (artefacto NVFP4 oficial: 15.035/14.695 MiB). Pesos: 17,0 GiB frente a 20,9 GiB del oficial.

## Requisitos de hardware

- VRAM: 13.083/12.743 MiB por tarjeta con 196.608 tokens, visión y MTP en 2× 16 GB; el contexto de 262.144 tokens también cabe.
- GPU verificadas: 2× RTX 5070 Ti (Blackwell), conexión PCIe sin P2P, con `--tp 2`.
- GPU recomendadas: el artefacto está etiquetado para Blackwell y NVFP4; no se documenta compatibilidad con otras generaciones.
- Configuración mínima: dos GPU de 16 GB; el modelo no cabe en una sola tarjeta de 16 GB según los datos de memoria por placa.
- Despliegue: runtime capy-flash (antes ninfer-tp2) en commit `d24bffd2` o posterior, con `--profile 27b` y `serve-tp2.sh`; el conversor es `tools.convert` de NInfer.
- Throughput: 140-520 tok/s según tarea y drafter, en las condiciones medidas por el autor.
- Conversión: `--device cpu` en unos 2 minutos con 0,75 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria (2× 16 GB) | Licencia | Formato |
|---|---|---|---|---|---|
| Este artefacto (QUASAR-QAT NVFP4) | 27B | 196.608 verificado; 262.144 posible | 13.083/12.743 MiB | Apache-2.0 | `.ninfer` v3 |
| Artefacto NVFP4 oficial (`qwen3_8_27b_nvfp4.ninfer`) | 27B | no disponible | 15.035/14.695 MiB | Apache-2.0 (según fuentes) | `.ninfer` |
| MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer | 27B | no disponible | no disponible | Apache-2.0 (según fuentes) | `.ninfer` |
| Qwen/Qwen3.8-27B (BF16) | 27B | no disponible | no cabe en 2× 16 GB | Apache-2.0 | safetensors |

La ventaja medible frente al artefacto oficial es de 3,9 GiB menos de pesos y unos 2 GiB menos por tarjeta en el mismo contexto. El artefacto de MirkoCovizzi se construyó con el conversor upstream desde el BF16 más el checkpoint QUASAR; este se construyó solo desde el checkpoint QUASAR con `import_encoded`.

## Limitaciones y advertencias

- Formato propietario del runtime: `.ninfer` v3 solo se ejecuta con NInfer/capy-flash; no es portable a vLLM, llama.cpp, Ollama ni TGI.
- Dependencia de versión: requiere capy-flash en `d24bffd2` o posterior para el split de proyecciones NVFP4.
- Hardware restringido: verificado únicamente en 2× RTX 5070 Ti con PCIe sin P2P; el soporte de otras GPU Blackwell o configuraciones no está documentado.
- Idiomas no documentados: la ficha no especifica la cobertura lingüística, aunque el modelo base es multilingüe.
- Sin benchmarks académicos: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de calidad; las cifras publicadas son solo de velocidad.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Calidad de cuantización: NVFP4 en todas las proyecciones puede degradar tareas sensibles; no se aportan comparaciones de calidad frente al BF16.
- Trazabilidad: el artefacto es una conversión de terceros; el crédito de la cuantización es de QUASAR-QAT y del drafter de DFlash2, no del autor de esta ficha.
- Uso comercial: permitido por Apache-2.0, pero conviene verificar las licencias de los componentes upstream (Qwen3.8-27B, QUASAR-QAT, DFlash2), todas declaradas Apache-2.0 en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Feyd89/Qwen3.8-27B-QUASAR-QAT-nvfp4-NInfer
- Modelo base arquitectónico: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint cuantizado de origen: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio DFlash: https://github.com/z-lab/dflash
- Runtime NInfer: https://github.com/Neroued/ninfer
- Runtime capy-flash (dos GPU): https://github.com/ValerioDolci/capy-flash
- Artefacto previo de MirkoCovizzi: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer
