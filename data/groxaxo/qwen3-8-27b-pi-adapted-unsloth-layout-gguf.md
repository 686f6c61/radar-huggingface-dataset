# groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF es una cuantizacion GGUF independiente del modelo Qwen3.8-27B de Qwen, sobre el que se ha aplicado el adaptador LoRA "pi" publicado por harness-hub. El artefacto lo produce el usuario groxaxo y no es una publicacion oficial de Unsloth ni de los autores originales; replica la asignacion de precisiones por tensor del GGUF de referencia `UD-Q4_K_XL` de Unsloth y utiliza su matriz de importancia publica para la calibracion.

El modelo base cuenta con 27.320.697.856 parametros y esta pensado para generacion de texto conversacional. La innovacion principal de esta version es que conserva los 15 tensores nativos de MTP (multi-token prediction) del checkpoint original, lo que habilita decodificacion especulativa en llama.cpp. El fichero resultante ocupa 17.659.406.112 bytes (unos 17,7 GB) y contiene 866 tensores.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion reproducible con procedencia verificable (hashes de fuentes, manifiesto de merge y mapa de referencia de tensores), algo poco habitual en el ecosistema GGUF. No obstante, el autor advierte explicitamente de que la validacion de precision en benchmarks esta en curso y de que las comprobaciones realizadas solo cubren carga, tool calling y decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), con cabezas nativas de MTP; detalles de atencion no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto `UD-Q4_K_XL`: F32, IQ4_NL, IQ4_XS, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 (5,168 bits por parametro ponderados por payload) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Qwen3.8-27B-pi-adapted-UD-Q4_K_XL.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.320 millones de parametros. Sobre el checkpoint BF16 original se aplico el adaptador LoRA "pi" de harness-hub, de rango 32 y alpha 64, que se fusiono en CPU como `W + 2 * B @ A` en FP32 con un unico redondeo posterior a BF16. Se mapearon y materializaron los 256 pares LoRA; los 15 tensores nativos de MTP no adaptados se preservaron intactos, con comparacion byte a byte tras las transformaciones GGUF correspondientes. La fusion de tensores de entrada compartida se desactivo para mantener la representacion de 866 tensores de la referencia.

La cuantizacion se realizo con llama.cpp (commit `51831d47d0a47b8a7d07c9ff262ebe4b0a211790`) usando la matriz de importancia publica `imatrix_unsloth.gguf` (496 entradas, 1.251 chunks) y un fichero de overrides por tensor. La calibracion se hizo sobre los pesos del modelo base, no sobre los pesos adaptados con pi, y la matriz carece de entradas para la cabeza de salida, el embedding de tokens y algunas proyecciones MTP (8 tensores cuantizables sin datos de imatrix, segun el log del cuantizador). No se dispone de informacion sobre el dataset de entrenamiento original de Qwen3.8-27B ni sobre el proceso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: el autor indica que las pruebas de humo verifican el "tool-call plumbing" en llama-server.
- Decodificacion especulativa mediante los 15 tensores nativos de MTP conservados.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponibles como datos verificados en la informacion proporcionada; el modelo base Qwen3.8-27B probablemente las soporta, pero no se confirma aqui.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Despliegue local en una sola GPU: el fichero de 17,7 GB cabe en GPUs de 24 GB de VRAM, lo que permite servir el modelo con llama-server en estaciones de trabajo con una RTX 4090 o similar.
- Asistentes conversacionales multi-turno: el tag `conversational` y el pipeline de generacion de texto lo hacen adecuado para chatbots autohospedados donde la privacidad de los datos es requisito.
- Aceleracion de inferencia con decodificacion especulativa: al conservar las cabezas MTP, llama.cpp puede usar decodificacion especulativa para reducir la latencia por token en comparacion con un GGUF sin MTP.
- Integracion en pipelines con tool calling: las pruebas de humo del autor validan el cableado de llamadas a herramientas en llama-server, lo que permite usarlo como backend de agentes con funciones externas.
- Evaluacion y auditoria de cuantizaciones: la procedencia documentada (hashes, manifiesto de merge, mapa de tensores) lo convierte en un artefacto util para investigar el impacto de la cuantizacion mixta en la calidad.
- Prototipado de aplicaciones sobre Qwen3.8 con el adaptador pi: sirve para probar el comportamiento del modelo adaptado sin necesidad de fusionar el LoRA ni convertir a GGUF uno mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el estado de los benchmarks es "IN PROGRESS" y que las verificaciones realizadas (estructural, de cuantizacion y pruebas de humo en runtime con una sola GPU) no establecen la precision en benchmarks ni validan la afirmacion de eficiencia de la model card original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,7 GB solo para los pesos; con overhead de contexto y cache KV, se recomienda al menos 20-24 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB son opciones razonables.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas (p. ej. RTX 3090/4090); en GPUs de 16 GB requeriria offload parcial a CPU, no verificado.
- Opciones de despliegue: llama.cpp / llama-server (probado por el autor con el binario de SHA256 `4cfe622d...`); otros runtimes GGUF no verificados.
- Latencia y throughput: no disponibles; el autor menciona pruebas de humo en runtime pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF | 27,3 B | no disponible | GGUF mixto (5,168 bpp) | Apache 2.0 | Cuantizacion independiente con MTP preservado |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B (base) | no disponible | GGUF `UD-Q4_K_XL` | Apache 2.0 | Referencia de layout y matriz de importancia; sin adaptador pi |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3 B | no disponible | safetensors (BF16, LoRA fusionable) | no disponible | Modelo adaptado con pi en precision completa |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | safetensors (BF16) | Apache 2.0 | Checkpoint oficial base |

## Limitaciones y advertencias

- Benchmarks de precision pendientes: el autor declara el estado como "IN PROGRESS"; no hay garantia de que la cuantizacion preserve la calidad del modelo adaptado.
- Calibracion no adaptada: la matriz de importancia se calculo sobre el modelo base, no sobre los pesos con pi, y carece de entradas para 8 tensores (cabeza de salida, embedding de tokens y proyecciones MTP), lo que puede degradar su cuantizacion.
- No es una release oficial de Unsloth ni esta respaldada por los autores originales; la calidad del artefacto recae en el publicador.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.8-27B, no evaluados aqui.
- Idiomas soportados no especificados; no se puede confirmar cobertura multilingue.
- Longitud de contexto no indicada; debe consultarse la model card del modelo base antes de usarlo en produccion con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del adaptador pi de harness-hub, cuya licencia no se detalla en la informacion proporcionada.
- Solo se ha probado en llama-server con un binario concreto; otros runtimes o versiones de llama.cpp pueden no cargar correctamente los tensores MTP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Adaptador pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/tree/7d42b119e2d4d475fa11270634b1ef98d1cd5aee
- GGUF y matriz de importancia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/tree/4af51b3542f775b0a8e4b310bfb3f17e01c306c9
- Verificacion de cuantizacion: `provenance/quantization-verification.json` (en el repositorio)
- Manifiesto de merge: `provenance/merge-manifest.json` (en el repositorio)
- Mapa de referencia de tensores: `recipe/reference/reference_tensor_map.json` (en el repositorio)
- Lock de fuentes: `recipe/reference/sources.lock.json` (en el repositorio)
- Procedencia de publicacion: `provenance/publication.json` (en el repositorio)
- Log del cuantizador: `provenance/quantize.log` (en el repositorio)
