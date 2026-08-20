# Joakimpalm-Zen/gpt-oss-20b-keep30-MXFP4-GGUF

## Resumen

`gpt-oss-20b-keep30-MXFP4-GGUF` es un derivado estructural del modelo open-weight `openai/gpt-oss-20b`, publicado por el usuario Joakimpalm-Zen. A diferencia de una cuantización convencional, este artefacto aplica una poda de expertos: cada capa del mezcla de expertos (MoE) reduce su roster de 32 a 30 expertos, seleccionados a partir de datos de routing medidos. Los tensores de los expertos conservan su formato nativo MXFP4, sin requantizar, y el enrutamiento top-4 se mantiene intacto.

El archivo resultante, en formato GGUF, ocupa 11,5 GB y está diseñado para ejecutarse en máquinas con aproximadamente 12 GB de memoria. Su principal caso de uso es el despliegue local de un modelo de razonamiento con capacidades de tool calling, especialmente en entornos con presupuesto de tokens limitado, gracias al motor de inferencia `xyntetik-runner` que incorpora recuperación de truncamiento forzado en llamadas a herramientas.

El autor publica una nota de estado medido (2026-08-15) indicando que el artefacto no supera el umbral de calidad actual: el top-1 re-gated es de 89,0% (98,5% con margen cualificado) frente al 97,5% originalmente reportado, con una divergencia KLD media de 0,062 contra un límite de 0,05. A pesar de ello, se mantiene publicado con sus números abiertos como un "casi aprobado" medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con poda estructural de expertos (30 de 32 por capa) |
| Parametros totales | 19.719.810.576 (~19,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 nativo (tensores de expertos sin requantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tensores MXFP4) |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` de OpenAI es un transformer de mezcla de expertos con 32 expertos por capa y enrutamiento top-4, post-entrenado con cuantización MXFP4 de los pesos MoE para reducir su huella de memoria. Este derivado aplica una modificación estructural: cada capa MoE reduce su roster de expertos de 32 a 30, seleccionados a partir de datos de routing medidos. Los tensores de los expertos permanecen en su formato MXFP4 nativo, sin requantizar, y el enrutamiento top-4 se conserva. El número reducido de expertos se declara en los metadatos GGUF, lo que permite que runtimes que resuelven `num_experts` desde el archivo lo carguen sin cambios; aquellos que asumen "gpt-oss ⇒ 32 expertos" fallarán.

No se ha realizado un entrenamiento adicional sobre el modelo base; la poda es puramente estructural basada en datos de routing. El autor no proporciona detalles sobre el dataset de entrenamiento original, que corresponde al modelo base de OpenAI.

## Capacidades

- Generación de texto y razonamiento: al ser un derivado de `gpt-oss-20b`, hereda las capacidades de razonamiento del modelo base, que según OpenAI supera a modelos abiertos de tamaño similar en tareas de razonamiento.
- Tool calling / function calling: el modelo es compatible con llamadas a herramientas, y el motor `xyntetik-runner` implementa recuperación de truncamiento forzado: cuando una llamada a herramienta excede su presupuesto de tokens, el runner cierra el documento JSON al esquema más pequeño legal, garantizando que los argumentos sean parseables.
- Compatibilidad con agentes y razonamiento multi-paso: el modelo base está diseñado para uso de herramientas y razonamiento, lo que se traslada a este derivado.
- Despliegue flexible: al ser GGUF, puede ejecutarse con distintos runtimes (llama.cpp, Ollama, etc.) siempre que resuelvan correctamente el número de expertos desde los metadatos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en hardware de consumo: con un archivo de 11,5 GB y un requisito de ~12 GB de memoria, puede ejecutarse en portátiles con Apple Silicon (16 GB) o GPUs de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para prototipado y desarrollo.
- Agentes autónomos con tool calling en entornos de contexto limitado: gracias a la recuperación de truncamiento forzado del runner, los agentes pueden completar llamadas a herramientas incluso cuando el presupuesto de tokens se agota, evitando reintentos desde cero.
- Servidor OpenAI-compatible local: el runner expone un endpoint `/v1` compatible con la API de OpenAI, permitiendo integrar el modelo en aplicaciones existentes con mínimos cambios.
- Evaluación de técnicas de poda de expertos: este artefacto sirve como caso de estudio para medir el impacto de eliminar expertos en un MoE, con métricas de calidad publicadas abiertamente.
- Generación de código asistida en entornos sin conexión: el modelo base tiene capacidades de código, y el formato GGUF permite su uso en herramientas de autocompletado locales.
- Investigación en cuantización MXFP4 y poda estructural: los metadatos y la documentación permiten reproducir el proceso y comparar con otros derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este derivado específico en la información disponible. El autor reporta una métrica propia de calidad top-1 en 400 posiciones re-gated: 89,0% plain / 98,5% margin-qualified, con KLD media de 0,062 contra un límite de 0,05. También indica que la conformidad de esquema y la selección de herramientas se mantienen al 100% hasta Q4_0 en una escalera de cuantización, aunque el acuerdo de argumentos decayó al 50%. Estos datos provienen de la model card y no son benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 11,5 GB, por lo que se recomienda al menos 12 GB de memoria disponible (RAM o VRAM) para cargar el modelo completo.
- GPUs recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores; también compatible con Apple Silicon (M1 Pro/Max o superior) y CPUs con suficiente RAM.
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, aunque con cuantización MXFP4 nativa el uso de VRAM puede ser ajustado; se recomienda verificar con el runtime específico.
- Opciones de despliegue: `xyntetik-runner` (motor C11 de un solo binario, CPU/CUDA/Metal), llama.cpp, Ollama u otros runtimes compatibles con GGUF que resuelvan `num_experts` desde metadatos.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime utilizado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Expertos/capa | Routing | Formato | Tamaño archivo | Licencia |
|---|---|---|---|---|---|---|
| openai/gpt-oss-20b (original) | MoE | 32 | top-4 | MXFP4 (safetensors) | ~12,1 GB (GGUF) | Apache-2.0 |
| **gpt-oss-20b-keep30-MXFP4-GGUF** | MoE podado | 30 | top-4 | GGUF (MXFP4) | 11,5 GB | Apache-2.0 |
| Qwen3-Coder-30B-A3B-Instruct-keep120 (otro derivado del autor) | MoE | 120 (de 128) | no disponible | GGUF | no disponible | no disponible |

La principal diferencia con el original es la reducción de 2 expertos por capa, lo que reduce el tamaño del archivo en ~0,6 GB. El autor recomienda este derivado solo si se supera el umbral de calidad; en caso contrario, sugiere alternativas como `Qwen3-Coder-30B keep-120` o `gemma-4-E2B-it-Q4_0` para máquinas más pequeñas.

## Limitaciones y advertencias

- El artefacto no pasa el estándar de calidad actual del autor: el top-1 re-gated es 89,0% (frente al 97,5% originalmente reportado) y la KLD media de 0,062 supera el límite de 0,05. Esto indica una posible degradación en la fidelidad de salida respecto al modelo base.
- La poda de expertos puede afectar el rendimiento en tareas que dependen de los expertos eliminados, aunque el autor no detalla qué tareas específicas se ven más afectadas.
- Riesgo de alucinación y sesgos: no se proporcionan datos específicos, pero al ser un modelo de lenguaje generativo, estos riesgos están presentes.
- Compatibilidad con runtimes: cualquier runtime que asuma "gpt-oss ⇒ 32 expertos" fallará al cargar el archivo; solo funcionarán aquellos que lean `num_experts` desde los metadatos GGUF.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la política de uso de OpenAI para el modelo base.
- El autor recomienda verificar el estado de calidad antes de usar en producción, dado que el artefacto se publica como "casi aprobado" y no como un derivado completamente validado.

## Enlaces

- [HuggingFace: Joakimpalm-Zen/gpt-oss-20b-keep30-MXFP4-GGUF](https://huggingface.co/Joakimpalm-Zen/gpt-oss-20b-keep30-MXFP4-GGUF)
- [GitHub: xyntetik-runner](https://github.com/Joakimpalm-Zen/xyntetik-runner)
- [Documentación del benchmark de truncamiento](https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md)
- [Modelo base: openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Model card de gpt-oss (OpenAI)](https://openai.com/index/gpt-oss-model-card/)
- [Anuncio de gpt-oss (OpenAI)](https://openai.com/index/introducing-gpt-oss/)
- [Repositorio GitHub de OpenAI gpt-oss](https://github.com/openai/gpt-oss)
