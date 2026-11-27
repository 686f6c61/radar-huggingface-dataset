# nilpe0555/PLaMo-3-Translate-0.8B-XDNA1-NPU-runtime

## Resumen

PLaMo-3-Translate-0.8B-XDNA1-NPU-runtime es un paquete de ejecución (runtime payload) publicado por el usuario nilpe0555 para correr el modelo de traducción PLaMo 3 Translate 0.8B de Preferred Networks (PFN) sobre la NPU XDNA1 de los PC AMD Ryzen "Phoenix" con Windows 11. No es un modelo independiente en formato Transformers: contiene imágenes de pesos cuantizados, tablas de embeddings, un tokenizador precomputado, un drafter de decodificación especulativa (PLaMo-D20-M2) y flujos de comandos NPU pregenerados.

El modelo subyacente, pfnet/plamo-3-translate-0.8b, es un modelo de traducción de 0,8 mil millones de parámetros orientado a los pares japonés-inglés, con soporte de contexto largo de hasta 262.143 tokens de entrada (256k). Este repositorio empaqueta ese modelo para inferencia local en hardware de consumo AMD, combinando prefill en la iGPU Radeon y decodificación en la NPU XDNA1 con cuantización W4, además de una ruta de decodificación especulativa exacta para entradas cortas.

Su relevancia radica en que demuestra inferencia de traducción con contexto muy largo en un portátil de consumo (Ryzen 7 8840U, 16 GB DDR5) sin GPU dedicada, con velocidades de decodificación en el rango de 14 a 50 ms/token según la longitud de entrada. Es un proyecto comunitario no oficial, sin afiliación con PFN ni con AMD, y se distribuye bajo la PLaMo Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo 3 Translate 0.8B); runtime con prefill en iGPU y decode en NPU XDNA1 |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 262.143 tokens de entrada (256k) en modo Long; ruta especulativa automática para entradas ≤ 2.048 tokens |
| Tipos de cuantizacion | W4 y W8 (imágenes de pesos cuantizados); el modo Long usa BF16 en iGPU para prefill y W4 en NPU para decode |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | PLaMo Community License (licencia "other" en Hugging Face) |
| Formato de pesos | Imágenes de pesos cuantizados propietarias del runtime, tablas de embeddings, flujos de comandos NPU pregenerados y extensión CPython `pyxrt.pyd`; el `model.safetensors` BF16 (1,78 GB) se descarga del repositorio upstream, no se redistribuye aquí |
| Tamano del repositorio | ~5,2 GB (5,35 GB de payload requerido; 5,71 GB con `gate-data/` opcional) |
| Hardware objetivo | AMD Ryzen "Phoenix" (XDNA1 NPU + Radeon iGPU), Windows 11 |
| Modelo base | pfnet/plamo-3-translate-0.8b (revision 8b4d42855622093e610ba9b90c2d2b59f8d5c15d) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 0,8 mil millones de parámetros de la familia PLaMo 3 de Preferred Networks, especializado en traducción japonés-inglés. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; estos datos corresponden al modelo upstream y no se reproducen en esta ficha.

La innovación de este repositorio es el runtime: un pipeline híbrido que reparte el cómputo entre la iGPU Radeon (prefill) y la NPU XDNA1 (decode en W4), con flujos de comandos NPU pregenerados y una caché de kernels compilados. Para entradas de hasta 2.048 tokens activa automáticamente una ruta de decodificación especulativa exacta ("w4-m2") con un drafter derivado denominado PLaMo-D20-M2, que acelera la generación manteniendo exactitud. El modo Long (hasta 256k) combina prefill BF16 en la iGPU con decode W4 en la NPU. La integración con el hardware se realiza mediante una extensión CPython 3.13 (`pyxrt.pyd`) que envuelve AMD XRT 2.21.0.

## Capacidades

- Traducción japonés-inglés e inglés-japonés como tarea principal (pipeline `translation`).
- Procesamiento de contexto largo de hasta 262.143 tokens de entrada en modo Long.
- Decodificación especulativa exacta automática para entradas cortas (≤ 2.048 tokens).
- Inferencia local en NPU XDNA1 con cuantización W4 y W8.
- Ejecución híbrida iGPU + NPU con enrutamiento unificado mediante `translate_long.ps1`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni otros idiomas distintos de ja/en.

## Casos de uso

- Traducción de documentos largos japonés-inglés: el modo Long permite procesar entradas de hasta 262.143 tokens en una sola pasada, adecuado para informes, contratos o libros completos sin fragmentación.
- Traducción local en portátiles AMD Ryzen: al ejecutarse sobre la NPU XDNA1 y la iGPU integrada, permite traducir sin conexión y sin GPU dedicada en equipos de consumo con 16 GB de RAM.
- Traducción por lotes de párrafos y frases cortas: la ruta especulativa automática para entradas ≤ 2.048 tokens ofrece ~72 tokens/s (13,9 ms/token) con un tiempo hasta el primer token de 0,11 s en entradas de 27-31 tokens, idónea para flujos interactivos.
- Subtitulado y localización de contenido japonés: la baja latencia en entradas cortas y la generación de párrafos completos en ~9,7 s (515 tokens de entrada, 595 de salida) permiten traducir guiones o subtítulos de forma local.
- Asistentes de traducción integrados en aplicaciones de escritorio Windows: el instalador `install.ps1` y la verificación por SHA-256 firmado facilitan el despliegue reproducible en entornos corporativos controlados.
- Investigación y evaluación de inferencia en NPU: el repositorio incluye conjuntos de referencia y datos de verificación de release-gate (`gate-data/`), útil para reproducir benchmarks y validar el rendimiento en hardware XDNA1.

## Benchmarks y rendimiento

Datos medidos por el autor en un AMD Ryzen 7 8840U (XDNA1 NPU + Radeon 780M, 16 GB DDR5-5600, Windows 11 build 26300, driver NPU 32.0.20101.3760, modo de energía "Default"):

| Modo / metrica | Resultado |
|---|---|
| Long mode, prefill 8k tokens (iGPU) | ~8 s |
| Long mode, decode 8k tokens (NPU) | 21-22 ms/token |
| Long mode, prefill 32k tokens (iGPU) | ~22 s |
| Long mode, decode 32k tokens (NPU) | 24 ms/token |
| Long mode, prefill 262k tokens (iGPU) | ~5 min (rango térmico 4-5,5 min) |
| Long mode, decode 262k tokens (NPU) | ~50 ms/token |
| Arranque de proceso hasta "spec-ready" | 0,69 s |
| Time to first token (27-31 tokens de entrada) | 0,11 s |
| Time to first token (515 tokens de entrada) | 1,43 s |
| Decode velocidad (`w4-m2`, 515 in -> 595 out) | 13,9 ms/token (~72 tokens/s) |
| Generación de párrafo completo (515 in -> 595 out) | 9,7 s |
| Conjuntos `-Service` Everyday / Tatoeba / Encyclopaedic | 14,2 / 14,1 / 14,7 ms/token (1,63 / 1,56 / 1,47 tok/cycle) |

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: PC AMD Ryzen "Phoenix" con NPU XDNA1 y iGPU Radeon (probado en Ryzen 7 8840U con Radeon 780M).
- Memoria del sistema: 16 GB DDR5-5600 en la configuración medida.
- Sistema operativo: Windows 11 (build 26300 en las pruebas).
- Driver NPU: 32.0.20101.3760 en las pruebas.
- VRAM estimada: no disponible de forma explícita; el runtime reparte la carga entre memoria compartida de iGPU y NPU, y el payload requerido ocupa ~5,35 GB en disco (más 1,78 GB del `model.safetensors` BF16 para el modo Long).
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este runtime, que está diseñado para NPU XDNA1 + iGPU Radeon.
- Despliegue: instalador PowerShell `install.ps1` desde el repositorio de GitHub, con verificación SHA-256 firmada; `install_long.py --with-model` habilita el modo Long de 256k. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks (13,9 ms/token en ruta especulativa corta; hasta ~50 ms/token en decode de 262k).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| PLaMo-3-Translate-0.8B-XDNA1-NPU-runtime (este) | 0,8B | 262.143 tokens | ja, en | PLaMo Community License | NPU XDNA1 + iGPU Radeon (Windows 11) |
| pfnet/plamo-3-translate-0.8b (modelo base) | 0,8B | no disponible en la informacion | ja, en | PLaMo Community License | GPU/CPU genéricas (Transformers) |
| Otros modelos de traducción ja-en de ~0,8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto comunitario no oficial: no está afiliado, respaldado ni soportado por Preferred Networks ni por AMD; se distribuye "AS IS" sin garantía de ningún tipo.
- No es un modelo Transformers autónomo: requiere el instalador y el código del repositorio de GitHub; descargar los archivos manualmente puede romper la verificación de integridad.
- Solo soporta japonés e inglés; no se documentan otros idiomas.
- Riesgo de alucinación y sesgos del modelo base no evaluado en la información disponible.
- Licencia PLaMo Community License: uso personal y académico gratuito; el uso comercial está restringido y requiere revisar los términos completos (la model card se trunca en ese punto).
- Dependencia de hardware específico: solo funciona en PC AMD Ryzen con NPU XDNA1 bajo Windows 11; no hay soporte documentado para otras GPU o sistemas operativos.
- Rendimiento sensible a la temperatura: el prefill de 262k tokens varía entre 4 y 5,5 minutos según condiciones térmicas.
- El repositorio no redistribuye el modelo base; el instalador descarga el tokenizador y el `model.safetensors` desde el repositorio upstream en una revisión fijada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nilpe0555/PLaMo-3-Translate-0.8B-XDNA1-NPU-runtime
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Repositorio de código e instaladores: https://github.com/nilpe/plamo3-translate-xdna1
- Sección de rendimiento del repositorio: https://github.com/nilpe/plamo3-translate-xdna1#performance
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
