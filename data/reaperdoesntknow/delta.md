# reaperdoesntknow/delta

## Resumen

`reaperdoesntknow/delta` es un modelo de generacion de texto publicado en HuggingFace por el usuario reaperdoesntknow. Se trata de un checkpoint de transformers con arquitectura marcada como `tamelm_two_axis`, un diseno poco habitual y practicamente sin documentacion publica asociada. El modelo cuenta con 410.256.184 parametros (aproximadamente 410 millones) y un repositorio de 4,9 GB, lo que sugiere pesos almacenados en precision alta (fp32) o multiples ficheros de safetensors.

La relevancia de este modelo es limitada desde el punto de vista de evaluacion tecnica: la model card es la plantilla autogenerada por HuggingFace y no contiene informacion sustantiva sobre datos de entrenamiento, licencia, idiomas, contexto o rendimiento. No hay benchmarks publicados, no hay paper asociado y no se declara licencia. El unico dato objetivo disponible es el recuento de parametros extraido de los safetensors y el tamano del repositorio.

Para un desarrollador o investigador que evalue modelos, este checkpoint debe considerarse experimental y no apto para produccion sin una inspeccion directa del codigo (`custom_code`) y de los ficheros de configuracion, dado que la arquitectura `tamelm_two_axis` no corresponde a ninguna familia estandar de transformers y requiere `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `tamelm_two_axis` (arquitectura personalizada, requiere `custom_code`) |
| Parametros totales | 410.256.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 4,9 GB |
| Descargas | 2240 |
| Likes | 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-11-02 |

## Arquitectura y entrenamiento

La arquitectura declarada es `tamelm_two_axis`, un identificador que no corresponde a ninguna arquitectura estandar de la libreria transformers (no es Llama, Mistral, GPT-NeoX, Qwen ni similar). El tag `custom_code` indica que el repositorio incluye codigo Python propio que define las clases del modelo, y que la carga requiere `trust_remote_code=True`. No se dispone de informacion publica sobre que significa "two axis" en este contexto ni sobre el diseno interno (atencion, capas, normalizacion, embeddings).

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO o SFT, ni sobre hiperparametros. La model card no incluye seccion de entrenamiento cumplimentada: todas las entradas aparecen como `[More Information Needed]`. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation` declarado).
- Carga mediante `transformers` con `trust_remote_code=True` para resolver la arquitectura personalizada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue ni lista de idiomas.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta ventana de contexto, por lo que no es posible afirmar capacidad de contexto largo.

## Casos de uso

- Investigacion de arquitecturas alternativas: el interes principal es estudiar la implementacion `tamelm_two_axis` inspeccionando el codigo del repositorio, no su rendimiento como generador.
- Experimentos de generacion de texto a pequena escala en local: con 410 M de parametros, el modelo puede ejecutarse en una GPU de consumo para pruebas exploratorias, siempre que la arquitectura personalizada se cargue correctamente.
- Base para fine-tuning experimental: al ser un checkpoint de transformers con safetensors, puede servir como punto de partida para ajuste supervisado en dominios concretos, aunque la falta de licencia debe resolverse antes de cualquier uso.
- Reproduccion de resultados academicos: si el autor publica en el futuro un paper asociado a `tamelm_two_axis`, este checkpoint permitiria reproducir sus experimentos.
- Pruebas de integracion de `custom_code` en pipelines de transformers: util para validar como se comporta la carga remota de codigo en entornos controlados.
- Docencia y formacion: ejemplo practico de modelo con arquitectura no estandar y model card incompleta, util para ensenar a auditar checkpoints antes de adoptarlos.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion con requisitos de calidad, trazabilidad o cumplimiento, dada la ausencia total de documentacion y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,6 GB solo para pesos (410 M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,8 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,4 GB para pesos.
- Cabe con holgura en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) e incluso en GPUs de 4-6 GB en cuantizacion baja.
- GPU de datacenter (A100, H100) sobredimensionadas para este tamano; utiles solo para lotes grandes o fine-tuning.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`. No hay versiones GGUF publicadas, por lo que `llama.cpp` y `Ollama` no son viables sin conversion previa y sin garantia de compatibilidad con la arquitectura personalizada. vLLM y TGI requeririan implementacion especifica de la arquitectura, no disponible.
- Latencia y throughput: no disponibles. A 410 M de parametros se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Documentacion |
|---|---|---|---|---|---|
| reaperdoesntknow/delta | 410 M | no disponible | no disponible | HuggingFace, requiere `custom_code` | Practicamente nula |
| GPT-2 (OpenAI) | 124 M - 1,5 B | 1024 tokens | MIT | HuggingFace, transformers nativo | Completa |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | HuggingFace, transformers nativo | Completa |
| SmolLM2-360M | 362 M | 8192 tokens | Apache 2.0 | HuggingFace, transformers nativo | Completa |

La comparativa es estructural: los modelos alternativos de la misma escala (sub-1B) ofrecen contexto documentado, licencia clara y soporte nativo en transformers, mientras que `delta` no aporta ninguno de esos elementos. No hay datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Ausencia total de licencia: no se puede determinar si el uso comercial esta permitido. Adoptarlo en produccion sin aclaracion juridica es un riesgo.
- Model card autogenerada y sin contenido: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion desconocido: sin benchmarks ni evaluaciones, no es posible estimar la fiabilidad factual.
- Contexto e idiomas no documentados: no se puede planificar su uso en tareas que dependan de ventana larga o de un idioma concreto.
- Requiere `trust_remote_code=True`: ejecutar codigo arbitrario del autor del repositorio es un riesgo de seguridad que debe mitigarse con revision manual del codigo y aislamiento del entorno.
- Arquitectura no estandar: sin soporte en vLLM, TGI, llama.cpp ni Ollama, lo que limita el despliegue a transformers puro.
- Cero likes y procedencia no verificable: no hay senales de comunidad que respalden la calidad del checkpoint.
- Fecha de creacion futura respecto a la mayoria de referencias disponibles: conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/delta
- Paper de referencia citado en los tags (Machine Learning Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact#compute
