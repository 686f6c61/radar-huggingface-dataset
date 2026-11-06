# mostwanted002/Sage-A1.5-Ablitrex-Quark-MXFP4

## Resumen

Sage-A1.5-Ablitrex-Quark-MXFP4 es un checkpoint cuantizado del modelo Sage-A1.5 (desarrollado originalmente por InternScience) en su variante "abliterated", es decir, con el comportamiento de rechazo eliminado mediante la técnica de abliteration. El autor de esta conversión es el usuario de Hugging Face mostwanted002, que ha aplicado el formato de cuantización AMD Quark MXFP4 sobre los pesos del modelo abliterated en BF16 (`mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16`).

El modelo base es un transformer de tipo MoE (según el tag `qwen3_5_moe` y la presencia de router gates y shared experts) con 19.141.183.344 parámetros totales, lo que lo sitúa en la categoría de aproximadamente 19B parámetros. Incluye además un módulo de predicción multi-token (MTP) para decodificación especulativa y una torre de visión, lo que indica capacidades multimodales.

La relevancia de esta ficha radica en que es una conversión de cuantización muy específica orientada al ecosistema AMD (Quark, ROCm, vLLM), con un formato MXFP4 de la especificación OCP (pesos E2M1 de 4 bits con escalas E8M0 por grupos de 32). Es un artefacto de nicho, con muy pocas descargas (40) y sin likes, pensado para despliegue en hardware AMD Instinct (verificado en MI300X) más que para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con módulo MTP y torre de visión |
| Parametros totales | 19.141.183.344 (~19,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (OCP MX): pesos E2M1 4-bit, escalas E8M0 por grupo de 32; activaciones MXFP4 dinámicas por grupo de 32 (W4A4). Componentes en BF16: MTP (versión canónica), torre de visión, router gates, shared-expert sigmoid gate, layernorms, QK-norms, conv1d/SSM state params, embeddings y lm_head |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos MXFP4 empaquetados 2 valores por byte uint8 + `weight_scale` uint8 E8M0); índice `model.safetensors.index.json` y variante `model.safetensors.index.mxfp4-mtp.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags y la estructura de pesos. El tag `qwen3_5_moe` y la presencia de router gates, shared-expert sigmoid gate y FFNs de expertos cuantizados por experto confirman una arquitectura de mezcla de expertos (MoE) con expertos compartidos. La mención de `conv1d/SSM state params` sugiere componentes de tipo state-space o convolucionales híbridos, aunque no se especifica su función exacta. El modelo incorpora un módulo de predicción multi-token (MTP) y una torre de visión, lo que apunta a un modelo multimodal con decodificación especulativa nativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La variante "abliterated" implica que se ha aplicado una técnica de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) sobre el modelo base Sage-A1.5 de InternScience; el proceso concreto no se documenta en la información proporcionada. La cuantización se realizó con AMD Quark 0.12 sobre ROCm, usando `aiter.ops.triton.quant.dynamic_mxfp4_quant` y `quark_quantize_weight_to_mxfp4`, preservando los nombres de checkpoint por experto.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de ~19B parámetros, por lo que se espera capacidad de generación y razonamiento general, aunque no hay benchmarks que lo confirmen.
- Procesamiento de visión: incluye una torre de visión mantenida en BF16, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa: módulo MTP con `num_speculative_tokens` configurable; el autor reporta una longitud media de aceptación de ~1,8 en MI300X.
- Comportamiento sin rechazo: la variante abliterated elimina las negativas automáticas del modelo, lo que cambia el perfil de respuesta en temas sensibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura AMD Instinct: el checkpoint está verificado en ROCm MI300X con vLLM 0.29.1, por lo que encaja en clústeres con GPUs AMD donde se quiera aprovechar el formato MXFP4 nativo de Quark para reducir huella de memoria.
- Inferencia de bajo coste en producción con vLLM: el formato W4A4 MXFP4 reduce el peso de los pesos a ~4 bits por valor, lo que permite servir un modelo de ~19B en menos VRAM que su equivalente BF16; adecuado para servicios de generación de texto con throughput moderado.
- Decodificación especulativa acelerada: activando `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'` se aprovecha el módulo MTP para reducir latencia por token en cargas interactivas.
- Investigación sobre cuantización MXFP4: sirve como artefacto de referencia para estudiar el impacto de la cuantización W4A4 con escalas E8M0 por grupos de 32 en un MoE con torre de visión y MTP.
- Experimentación con modelos abliterated: útil para investigadores que estudian el efecto de la eliminación de rechazo en modelos MoE multimodales, comparando con el base Sage-A1.5.
- Pipelines multimodales de visión-lenguaje: la torre de visión en BF16 permite tareas de descripción de imágenes o VQA, aunque sin benchmarks publicados que cuantifiquen su calidad.
- Prototipado en entornos con licencia permisiva: la licencia MIT facilita su integración en productos comerciales, aunque el modelo base y su procedencia deben verificarse por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la longitud media de aceptación de ~1,8 tokens en decodificación especulativa MTP sobre MI300X con vLLM 0.29.1 (build ROCm).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos MXFP4 (~4 bits) el modelo de ~19,1B parámetros ocupa aproximadamente 10-11 GB en pesos, más escalas E8M0, componentes BF16 (torre de visión, embeddings, lm_head, norms) y caché KV; se estima un mínimo práctico en torno a 16-24 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: AMD Instinct MI300X es la plataforma verificada por el autor (ROCm, vLLM 0.29.1). El formato Quark MXFP4 está orientado al ecosistema AMD; el soporte en GPUs NVIDIA no está confirmado en la información disponible.
- ¿Cabe en GPU consumer? No confirmado. El formato Quark MXFP4 requiere runtime con `quant_method: quark`; no se documenta soporte en llama.cpp u Ollama.
- Opciones de despliegue: vLLM (ROCm) con `quant_method: quark` detectado automáticamente desde `config.json`; fork Radiance (`magiccodingman/vllm-radiance`) con `RADIANCE_QUARK_BF16_MTP=1` para cargar el MTP en BF16; vLLM estándar requiere intercambiar `model-mtp.safetensors` por la versión MXFP4 y usar el índice `model.safetensors.index.mxfp4-mtp.json`.
- Latencia y throughput: no disponibles; solo se reporta la aceptación media de ~1,8 en MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Sage-A1.5-Ablitrex-Quark-MXFP4 | ~19,1B (MoE) | no disponible | MXFP4 W4A4 (Quark) | MIT | AMD ROCm / vLLM |
| Sage-A1.5 (base, InternScience) | no disponible | no disponible | BF16 original | no disponible | genérica |
| Sage-A1.5-Ablitrex-abliterated-BF16 | ~19,1B (MoE) | no disponible | BF16 | no disponible | genérica |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La variante abliterated elimina el comportamiento de rechazo, lo que puede producir respuestas inapropiadas en temas sensibles; requiere filtros externos en producción.
- Riesgo de alucinación inherente a los LLM; no hay evaluaciones publicadas que lo cuantifiquen.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- El formato Quark MXFP4 está atado al ecosistema AMD (ROCm, vLLM con `quant_method: quark`); no se confirma compatibilidad con llama.cpp, Ollama, TGI ni GPUs NVIDIA.
- El MTP en BF16 requiere el fork Radiance o el intercambio manual de ficheros e índice en vLLM estándar; un error en este paso impide el arranque.
- La cuantización W4A4 puede degradar la calidad respecto al BF16 original; no se aportan métricas de degradación.
- Licencia MIT declarada en el repo, pero la procedencia y licencia del modelo base InternScience/Sage-A1.5 deben verificarse de forma independiente antes de uso comercial.
- Artefacto con muy baja adopción (40 descargas, 0 likes) y sin pipeline declarado; no hay validación comunitaria del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-Quark-MXFP4
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Checkpoint BF16 abliterated referenciado: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Fork Radiance de vLLM: https://github.com/magiccodingman/vllm-radiance
- AMD Quark: https://github.com/amd/quark
