# hipfire-models/qwen3.5-35b-a3b

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, se posiciona como la variante inicial de la linea Qwen3.5 orientada a cargas de trabajo agenticas y de generacion de codigo. La ficha que nos ocupa, `hipfire-models/qwen3.5-35b-a3b`, no es el modelo original, sino una redistribucion pre-cuantizada del mismo para el motor de inferencia hipfire, escrito en Rust y optimizado para GPUs AMD RDNA.

El interes de esta publicacion reside en su formato de cuantizacion propietario (MagnumQuant, MQ4 y MQ3) y en la decision de mantener los tensores del router MoE en Q8F16, un ajuste documentado en el issue #171 del repositorio de hipfire y motivado por el colapso de calidad observado en el modelo hermano 3.6-A3B cuando el router se cuantizaba a 4 bits. El resultado es un artefacto de 19 GB que cabe en una GPU de consumo con 22 GB de VRAM (por ejemplo, una RX 7900 XTX) y alcanza unos 148 tokens por segundo en decodificacion.

La relevancia actual es doble: por un lado, demuestra que es viable ejecutar un MoE de 35B con contexto largo en hardware AMD de gama alta para consumidores; por otro, expone empiricamente el "quant cliff" del router en arquitecturas MoE, un fenomeno de interes directo para quien disene pipelines de cuantizacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida: atencion DeltaNet (lineal) + Full Attention en proporcion 3:1, 256 expertos top-8, shared expert, tied embeddings |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | ~3.000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ4 (4 bits con rotacion FWHT, router en Q8F16), MQ3 (3 bits, router en Q8F16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario de hipfire (`.mq4`, `.mq3`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura MoE con 256 expertos y enrutamiento top-8, complementada con un experto compartido. La capa de atencion es hibrida: combina capas DeltaNet (atencion lineal) con capas de atencion completa en una proporcion 3:1, lo que reduce el coste cuadratico en contextos largos. Detalles adicionales: `head_dim=256`, `partial_rotary_factor=0.25` y embeddings atados (tied embeddings). El motor hipfire carga este modelo por su ruta de forward MoE `arch_id=6`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) del modelo original. La model card de esta redistribucion se centra exclusivamente en el proceso de cuantizacion: MQ4 aplica una rotacion FWHT (Fast Walsh-Hadamard Transform) sobre los pesos antes de cuantizar a 4 bits, lo que segun el autor preserva la calidad de salida de Q8 con un ancho de banda cercano a Q4 en los kernels fusionados WMMA/dot2. Los tensores del router (`mlp.gate.weight` y `mlp.shared_expert_gate.weight`) se fijan a Q8F16, con un coste de unos 10 MB adicionales, para evitar el deterioro de enrutamiento documentado en la investigacion `2026-05-06-moe-quant-cliff-survey`.

## Capacidades

- Generacion de texto y razonamiento general, con modo "thinking" (`thinking:auto`) funcional a MQ4 segun el autor.
- Generacion de codigo, con enfasis declarado en el modelo base hacia tareas de programacion y flujos agenticos.
- Soporte de tool calling y function calling (heredado del modelo base Qwen3.5; no se detalla en la model card de esta redistribucion).
- Capacidades agenticas y razonamiento multi-paso, etiquetadas explicitamente en los tags del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa DFlash: disponible en el motor, pero desactivada por defecto para este modelo porque las propuestas se rechazan en su mayoria (τ≈1,0–1,5 en tareas no matematicas).
- Compatibilidad con sidecar CASK para la ruta de contexto largo con eviccion.

## Casos de uso

- Desarrollo asistido de codigo en Rust y otros lenguajes: el modelo puede generar funciones completas (por ejemplo, parsers de fechas ISO-8601) directamente desde la CLI de hipfire, aprovechando su entrenamiento orientado a codigo y su bajo coste de activacion (3B parametros por token).
- Agentes autonomos con tool calling: la combinacion de enrutamiento top-8 sobre 256 expertos y modo thinking permite construir bucles de razonamiento multi-paso con llamadas a herramientas, adecuado para orquestadores de tareas sobre APIs.
- Despliegue en estaciones de trabajo con GPU AMD: al requerir solo 22 GB de VRAM en MQ4, encaja en equipos con RX 7900 XTX sin necesidad de GPUs de datacenter, lo que facilita prototipado local de agentes.
- Procesamiento de contexto largo con eviccion: mediante el sidecar CASK del motor hipfire, el modelo puede gestionar documentos extensos descartando selectivamente entradas de cache, util para analisis de repositorios o resumenes de documentacion tecnica.
- Generacion de codigo en pipelines de CI/CD: la CLI `hipfire run` permite invocar el modelo de forma no interactiva para tareas como generacion de tests, revision de diffs o documentacion automatica de cambios.
- Investigacion sobre cuantizacion MoE: el artefacto sirve como referencia reproducible para estudiar el impacto del router a baja precision, comparando MQ4 con router Q8 frente a variantes con router a 4 bits.
- Experimentacion en entornos con restricciones de memoria: la variante MQ3 permite ejecutar el modelo cuando MQ4 no cabe, a costa de una calidad aun no publicada (TBD).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decodificacion en RX 7900 XTX (MQ4) | ~148 tok/s |
| Decodificacion en RX 7900 XTX (MQ3) | TBD |
| VRAM minima (MQ4) | 22 GB |
| VRAM minima (MQ3) | 22 GB |
| Tamano en disco (MQ4) | 19 GB |
| Tamano en disco (MQ3) | 19 GB |
| Tasa de aceptacion DFlash (τ, no matematicas) | ≈1,0–1,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor menciona una "hipfire coherence battery" como puerta de calidad frente a la referencia Q8, pero no se aportan puntuaciones numericas.

## Requisitos de hardware

- VRAM estimada: 22 GB minimos para MQ4 y MQ3 segun la model card; el repositorio ocupa 39,3 GB porque incluye ambas variantes.
- GPU recomendadas: AMD RX 7900 XTX (probada, ~148 tok/s en decodificacion). El motor hipfire esta disenado para GPUs AMD RDNA; no se documenta soporte para NVIDIA (A100, H100, RTX 4090) ni para otras arquitecturas.
- GPU de consumo: si, cabe en una RX 7900 XTX (24 GB). No se indica compatibilidad con GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust), instalable via script oficial; carga el modelo por la ruta MoE `arch_id=6`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario MQ4/MQ3.
- Latencia y throughput: ~148 tok/s de decodificacion en RX 7900 XTX con MQ4. No se publican datos de prefill ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| hipfire-models/qwen3.5-35b-a3b (esta ficha) | 35B | ~3B | no disponible | Apache 2.0 | MQ4/MQ3, motor hipfire | Cuantizado para AMD RDNA; ~148 tok/s en 7900 XTX |
| Qwen/Qwen3.5-35B-A3B (original) | 35B | ~3B | no disponible | Apache 2.0 | safetensors, ecosistema HF | Modelo base sin cuantizar; requiere el stack estandar |
| Qwen3.5-36B-A3B (mencionado como "3.6-A3B") | no disponible | ~3B | no disponible | no disponible | no disponible | Modelo hermano citado en el issue #171; expuso el colapso del router a 4 bits |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- El modelo solo es utilizable con el motor hipfire; el formato MQ4/MQ3 no es compatible con llama.cpp, vLLM, Ollama ni transformers. Esto limita la portabilidad y ata el despliegue a un proyecto de un unico mantenedor.
- Soporte exclusivo para GPUs AMD RDNA; no hay ruta documentada para NVIDIA ni CPU.
- El modo de decodificacion especulativa DFlash esta desactivado por defecto en este modelo porque la tasa de aceptacion es muy baja (τ≈1,0–1,5), lo que reduce las optimizaciones disponibles en contextos no matematicos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni de sesgos en la informacion proporcionada.
- La variante MQ3 no tiene datos de calidad publicados (TBD), por lo que su uso en produccion no esta validado.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion comunitaria.
- No se especifican los idiomas soportados ni la longitud de contexto, datos criticos para planificar despliegues multilingues o de contexto largo.
- Aunque la licencia es Apache 2.0 (heredada del modelo base), conviene verificar los terminos del modelo Qwen original antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Pull request del router Q8: https://github.com/Kaden-Schutt/hipfire/pull/180
- Issue de investigacion del router: https://github.com/Kaden-Schutt/hipfire/issues/171
- Registro de investigacion sobre el quant cliff MoE: https://github.com/Kaden-Schutt/hipfire/tree/master/docs/investigations/2026-05-06-moe-quant-cliff-survey
- Documentacion de cuantizacion: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/QUANTIZATION.md
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
