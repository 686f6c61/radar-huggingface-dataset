# dabsLabs/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una cuantización weight-only en formato NVFP4 (4 bits) del modelo GLM-5.3-Flash de Z.ai, desarrollada por dabsLabs. El modelo base es un MoE multimodal de aproximadamente 321.000 millones de parámetros con 18.000 millones activos, diseñado para codificación, trabajo agéntico y tareas visuales, con una ventana de contexto de 1 millón de tokens y licencia MIT. Esta versión cuantizada reduce el peso del modelo de unos 660 GB a aproximadamente 196 GB, permitiendo su ejecución en una máquina multi-GPU en lugar de un rack de servidores.

La cuantización se aplica exclusivamente a los pesos de los expertos enrutados (alrededor del 90 % de los parámetros), dejando intactos en BF16 la atención, el sistema de visión y la capa de decodificación especulativa. El autor reporta un error relativo medio de 0,0828 frente al original BF16, con una reducción del error cuadrático total del 18,75 % respecto a la cuantización RTN clásica con escalas amax/6. El modelo sigue el formato compressed-tensors `nvfp4-pack-quantized` y está pensado para servirse con vLLM en GPUs Blackwell o H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal + MLA sparse sin rope, multimodal (imagen-texto) |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | ~18B (MoE) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (solo expertos enrutados, 4 bits); el resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE nativamente multimodal que combina atención lineal con una variante de atención MLA (Multi-head Latent Attention) sparse sin rope. Según la documentación de Z.ai, emplea 42 capas MoE con 288 expertos enrutados y 3 proyecciones por experto, lo que supone 36.288 tensores de pesos de expertos. La capa de decodificación especulativa (MTP, Multi-Token Prediction) se mantiene en precisión completa para permitir decodificación especulativa con 5 tokens adicionales.

Esta versión cuantizada se genera a partir del lanzamiento BF16 auténtico (revisión `b1967181`), no de la exportación FP8, evitando así una doble cuantización de los expertos. La técnica de cuantización selecciona las escalas de bloque por bloque (bloques de 16 elementos) mediante el error cuadrático exacto tras el redondeo, eligiendo entre el plan clásico `amax/6` y el plan *four-over-six* de NVIDIA ModelOpt (con escala global normalizada a 256). El 44 % de los bloques adoptan la escala M=4, y el 100 % de los tensores utilizan el plan 4/6. La cuantización es bit-exacta frente a llmcompressor NVFP4A16 y byte-idéntica frente a la ruta de exportación de ModelOpt.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce texto (pipeline `image-text-to-text`).
- Codificación: el modelo base está optimizado para tareas de programación, con soporte de razonamiento multi-paso.
- Trabajo agéntico: soporta tool calling y razonamiento agéntico, con parser de herramientas compatible con GLM-4.7 (`--tool-call-parser glm47`).
- Razonamiento estructurado: compatible con el parser de razonamiento GLM-4.5 (`--reasoning-parser glm45`).
- Decodificación especulativa: la capa MTP en BF16 permite generar hasta 5 tokens especulativos.
- Multilingüe limitado: los idiomas declarados son inglés y chino.
- Visión: el sistema de visión (torre de visión completa) se conserva byte-idéntico al original, lo que mantiene las capacidades multimodales sin pérdida.

## Casos de uso

- Despliegue de un asistente de codigo en entornos de produccion: con soporte de tool calling y decodificacion especulativa, puede integrarse en pipelines de CI/CD para generacion, revision y autocompletado de codigo, manteniendo una ventana de contexto amplia para repositorios extensos.
- Analisis de documentos con imagenes y diagramas: al conservar la torre de vision completa en BF16, el modelo puede procesar capturas de pantalla, diagramas de arquitectura o graficos tecnicos junto con texto, util para documentacion tecnica o soporte.
- Agente conversacional bilingue (ingles-chino): adecuado para atencion al cliente o asistentes internos en empresas con equipos en ambos idiomas, con contexto de 1M para historiales largos.
- Razonamiento agéntico multi-paso: puede encadenar llamadas a herramientas y razonar sobre resultados intermedios, apto para automatizacion de tareas administrativas o investigacion asistida.
- Servicio de inferencia en hardware Blackwell con vLLM: pensado para entornos con GPUs H100/B200, donde el formato NVFP4 nativo acelera la inferencia sin necesidad de dequantizar los pesos.
- Evaluacion de tecnicas de cuantizacion: al estar documentado el error por tensor y la metodologia de seleccion de escalas, sirve como caso de estudio para investigacion en compresion de modelos MoE a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks end-to-end (perplejidad, MMLU, HumanEval, etc.) para esta cuantizacion. La card del modelo indica explicitamente que no se midieron metricas de calidad final, solo metricas de fidelidad de pesos:

| Metrica de fidelidad | Valor |
|---|---|
| Error relativo medio (expertos cuantizados vs BF16) | 0,0828 |
| Error relativo maximo | 0,0848 |
| Reduccion del error cuadratico total vs RTN amax/6 | -18,75 % |
| Bloques que seleccionan la escala M=4 | 44 % |

Para referencia, otro cuant NVFP4 publico del mismo modelo reporta un error relativo de aproximadamente 0,0925 con RTN plano (segun la card de dabsLabs).

## Requisitos de hardware

- VRAM estimada: aproximadamente 196 GB de pesos cuantizados. Con overhead de activaciones y cache KV, se recomiendan al menos 4 GPUs de 80 GB (320 GB totales) para servir el modelo con contexto largo.
- GPUs compatibles: H100, B200, GB200 (verificadas por el proveedor para la imagen de vLLM dedicada). No compatible actualmente con SM120 (RTX PRO 6000 o Blackwell de consumo) por falta de kernels de MLA sparse en vLLM para esa arquitectura.
- Despliegue: imagen Docker dedicada `vllm/vllm-openai:glm53-flash-x86_64-cu130` con tensor parallelism de 4. Tambien puede usarse llama.cpp o Unsloth Dynamic GGUF para el modelo base, aunque esta cuantizacion NVFP4 requiere vLLM.
- Configuracion recomendada: `--tensor-parallel-size 4`, `--max-num-seqs 256`, y timeout de inicializacion ampliado (`VLLM_ENGINE_READY_TIMEOUT_S=3600`) porque la carga de un MoE de 320B es lenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (BF16 original) | ~321B / ~18B activos | 1M | BF16 | MIT | Modelo base sin cuantizar, ~660 GB |
| GLM-5.3-Flash-NVFP4 (dabsLabs) | ~321B / ~18B activos | 1M | NVFP4 (expertos) | MIT | Error relativo 0,0828, ~196 GB |
| GLM-5.3-Flash-NVFP4 (local-inference-lab) | ~321B / ~18B activos | 1M | NVFP4 (expertos) | MIT | Error relativo reportado ~0,0925 con RTN plano |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes. La comparativa se limita a caracteristicas tecnicas y metricas de fidelidad de cuantizacion.

## Limitaciones y advertencias

- No se han medido metricas de calidad end-to-end (perplejidad, tareas de razonamiento, etc.) en esta cuantizacion; solo se verifico la fidelidad de los pesos. El rendimiento real en tareas puede diferir del modelo original.
- La cuantizacion NVFP4 solo cubre los expertos enrutados; el resto de componentes se mantienen en BF16, por lo que el ahorro de memoria es parcial (~90 % de los parametros cuantizados, pero la atencion y la vision siguen siendo pesadas).
- No es compatible con GPUs de consumo Blackwell (SM120) en vLLM actualmente; el soporte esta pendiente del cierre del issue vllm#53963.
- Idiomas limitados a ingles y chino segun la card; no se garantiza un rendimiento multilingue amplio.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran tamano; no se han documentado sesgos especificos de esta cuantizacion, pero el modelo base puede presentar sesgos tipicos de entrenamiento con datos mayoritariamente en ingles y chino.
- El modelo requiere al menos 4 GPUs de 80 GB para servirse con comodidad; no es viable en hardware de consumo actual.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el modelo base cumple con los terminos de Z.ai.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/dabsLabs/GLM-5.3-Flash-NVFP4
- Modelo base (BF16): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Modelo base (pagina principal): https://huggingface.co/zai-org/GLM-5.3-Flash
- Issue de soporte SM120 en vLLM: https://github.com/vllm-project/vllm/issues/53963
- PR de soporte glm5_next en vLLM: https://github.com/vllm-project/vllm/pull/53906
- Documentacion de despliegue local (unsloth): https://unsloth.ai/docs/models/glm-5.3
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
- Otra cuantizacion NVFP4 del mismo modelo: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
