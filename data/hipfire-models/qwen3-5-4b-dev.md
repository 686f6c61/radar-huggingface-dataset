# hipfire-models/qwen3.5-4b-dev

## Resumen

`hipfire-models/qwen3.5-4b-dev` es un repositorio de cuantizaciones experimentales de los pesos de Qwen3.5-4B, publicadas por el proyecto hipfire para investigacion de kernels de computo. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados con un esquema propietario denominado Lloyd-Max codebook quantization, orientado a reproducir el trabajo de rendimiento de kernels WMMA (prefill y decode) sobre GPUs AMD RDNA3 y RDNA3.5.

El repositorio contiene dos variantes: MQ3-Lloyd-G256 (2,1 GB) y MQ4-Lloyd-G256 (2,7 GB), ambas derivadas de los pesos upstream de Qwen3.5-4B tras una rotacion FWHT. La relevancia es acotada: es material de investigacion para desarrolladores que trabajen en inferencia de bajo nivel sobre hardware AMD, no un artefacto recomendado para despliegue en produccion. El propio autor indica que las variantes canonicas no experimentales viven en `schuttdev/hipfire-qwen3.5-4b`.

La model card documenta una deriva de calidad de aproximadamente 0,9 % en perplejidad en la ruta de decode MQ3-Lloyd respecto a la ruta baseline lenta, ademas de una incompatibilidad de stride con el formato HFQ4 que puede provocar corrupcion silenciosa si se mezclan formatos en un mismo dispatch. El repositorio esta sujeto a un gate de acceso con declaracion de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_seq: 4096` |
| Tipos de cuantizacion | MQ3-Lloyd-G256 (112 B/grupo, codebook de 8 entradas) y MQ4-Lloyd-G256 (160 B/grupo, codebook de 16 entradas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (heredada del upstream Qwen3.5) |
| Formato de pesos | `.mq3-lloyd` y `.mq4-lloyd` (formato propietario de hipfire, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer de 4.000 millones de parametros. La model card no aporta detalles sobre la composicion del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo upstream y no se reproduce aqui.

La innovacion tecnica de este repositorio reside en el esquema de cuantizacion post-entrenamiento. En lugar de la reconstruccion afin clasica (`scale * q + zero_point`) de HFQ3 (104 B/grupo) y HFQ4 (136 B/grupo), Lloyd-Max emplea una busqueda en codebook (`cb[index]`). Cada grupo de 256 elementos incluye una cabecera fp16 con el codebook (16 B para 8 entradas en MQ3, 32 B para 16 entradas en MQ4) mas indices empaquetados: 96 B de indices de 3 bits cross-byte-packed en MQ3 y 128 B de indices de 4 bits en pares de nibbles en MQ4. Los pesos se rotan con FWHT antes del ajuste del codebook. Los kernels de prefill WMMA (PR #195 para MQ3-Lloyd, PR #197 para MQ4-Lloyd) son de acumulador unico y no presentan deriva; los kernels GEMV de decode usan multi-acumulador y su reordenamiento compone la deriva de ~0,9 % PPL documentada.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-4B.
- Razonamiento y codigo: capacidades del modelo upstream, no verificadas de forma independiente en esta distribucion.
- Tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingue: limitado a ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Ejecucion en GPU AMD RDNA3 (gfx1100, gfx1101, gfx1102) y RDNA3.5 (gfx1151); RDNA4 (gfx1200, gfx1201) solo con la variable de entorno `HIPFIRE_LLOYD_GFX12=1`.

## Casos de uso

- Investigacion de kernels de inferencia en AMD: el caso de uso principal es reproducir y validar el rendimiento de los kernels WMMA de prefill y decode documentados en los PR #195 y #197 del repositorio hipfire, comparando MQ3-Lloyd frente a MQ4-Lloyd en gfx1100/1101/1102/1151.
- Analisis de deriva de calidad en cuantizacion: permite medir la diferencia de perplejidad (~0,9 % en MQ3-Lloyd decode) entre la ruta multi-acumulador y la ruta baseline lenta, util para estudiar el efecto de reordenamientos de acumuladores en bucles de inferencia.
- Desarrollo de formatos de cuantizacion con codebook: sirve como referencia reproducible para implementar esquemas Lloyd-Max con cabecera fp16 por grupo y rotacion FWHT en otros motores.
- Pruebas de integracion del daemon hipfire: el ejemplo de la model card carga el modelo con `max_seq: 4096`, lo que permite validar el enrutado de dispatch y los flags `--allow-mq3-lloyd` / `--allow-mq4-lloyd` en un pipeline real.
- Benchmarking de memoria y ancho de banda: con 2,1 GB (MQ3) y 2,7 GB (MQ4) frente a los pesos fp16, el repositorio facilita medir el ahorro de VRAM y su impacto en throughput en GPUs de gama media AMD.
- Validacion de seguridad de formatos: util para comprobar experimentalmente la corrupcion silenciosa que se produce al mezclar strides HFQ4 con MQ-Lloyd en un mismo dispatch, y para disenar mecanismos de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa es la deriva de ~0,9 % en perplejidad de la ruta de decode MQ3-Lloyd respecto al baseline lento, medida sobre Qwen3.5-9B y descrita como universal en la familia gfx11. No se proporcionan valores absolutos de PPL, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB para MQ3-Lloyd y 2,7 GB para MQ4-Lloyd solo en pesos; hay que sumar KV cache y overhead del runtime.
- GPU soportadas: gfx1100, gfx1101, gfx1102 (RDNA3) y gfx1151 (RDNA3.5). RDNA4 (gfx1200, gfx1201) solo con `HIPFIRE_LLOYD_GFX12=1`; por defecto cae al fallback por token.
- GPU no soportadas: gfx10, gfx906 y gfx94x.
- Cabe en GPUs de consumo AMD de la familia RDNA3 (por ejemplo, RX 7000) gracias al tamano reducido de los pesos; no se documenta soporte para GPUs NVIDIA.
- Despliegue: exclusivamente mediante el daemon de hipfire (`./target/release/examples/daemon`) con deteccion automatica de dtype; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| hipfire-models/qwen3.5-4b-dev (MQ3-Lloyd) | 4B | no disponible | `.mq3-lloyd` (2,1 GB) | Apache 2.0 | Research preview |
| hipfire-models/qwen3.5-4b-dev (MQ4-Lloyd) | 4B | no disponible | `.mq4-lloyd` (2,7 GB) | Apache 2.0 | Research preview, fase mas temprana |
| schuttdev/hipfire-qwen3.5-4b | 4B | no disponible | MQ3, MQ4, MQ6, HFQ4, HFQ6, DFlash-draft | Apache 2.0 | Canonico, recomendado por el autor |
| Qwen3.5-4B upstream | 4B | no disponible | safetensors (formato original) | Apache 2.0 | Produccion |

La comparativa se limita al ecosistema hipfire y al modelo base, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con alternativas de otros formatos de cuantizacion.

## Limitaciones y advertencias

- Deriva de calidad documentada: ~0,9 % de PPL en la ruta de decode MQ3-Lloyd respecto al baseline lento, causada por el reordenamiento multi-acumulador de los kernels GEMV.
- MQ4-Lloyd esta en una fase mas temprana que MQ3-Lloyd; el bench de ship-gate en gfx1100 esta pendiente y las cifras actuales son solo de gfx1151.
- Incompatibilidad de stride con HFQ4: mezclar formatos en un mismo dispatch provoca corrupcion silenciosa. Es obligatorio usar el daemon con el flag `--allow-mq{3,4}-lloyd` correspondiente.
- Cobertura de arquitecturas limitada: sin soporte para gfx10, gfx906 ni gfx94x; RDNA4 requiere un gate de entorno opt-in sin validacion CI externa.
- No es una release de produccion: el sufijo `-dev` lo distingue explicitamente de una futura `hipfire-models/qwen3.5-4b` estable.
- Idioma: solo ingles segun los metadatos del repositorio.
- Riesgo de alucinacion y sesgos: no documentados en la model card; deben asumirse los del modelo base Qwen3.5-4B.
- Licencia Apache 2.0 heredada del upstream, lo que permite uso comercial de los pesos, pero el formato y los kernels de hipfire son especificos del proyecto y no estan soportados por otros runtimes.
- Acceso gated: requiere aceptar una declaracion de investigacion antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-4b-dev
- Variantes canonicas no experimentales: https://huggingface.co/schuttdev/hipfire-qwen3.5-4b
- PR #195 (kernels WMMA prefill MQ3-Lloyd): https://github.com/Kaden-Schutt/hipfire/pull/195
- PR #197 (kernels WMMA prefill MQ4-Lloyd): https://github.com/Kaden-Schutt/hipfire/pull/197
- Repositorio hipfire: https://github.com/Kaden-Schutt/hipfire
- Documentacion de formato: `docs/plans/mq3-lloyd-wmma-prefill.md` y `docs/plans/mq4-lloyd-wmma-prefill.md` en el repositorio hipfire
- Devlog de la rama `feat/mq3-lloyd-gfx1151` (analisis de la deriva de decode) en el repositorio hipfire
