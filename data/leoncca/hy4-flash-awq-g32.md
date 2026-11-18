# leoncca/Hy4-flash-AWQ-g32

## Resumen

Hy4-flash-AWQ-g32 es una versión cuantizada en 4 bits del modelo Tencent Hy4-flash, publicada por el usuario leoncca bajo el identificador `leoncca/Hy4-flash-AWQ-g32`. Se trata de un checkpoint derivado que aplica cuantización AWQ (Activation-aware Weight Quantization) con precisión mixta W4A16 y tamaño de grupo 32 sobre el modelo base de Tencent, con el objetivo de reducir el espacio en disco y los requisitos de memoria para servir el modelo en hardware más modesto. El repositorio ocupa 167,24 GB distribuidos en 50 shards de safetensors y declara 220.251.201.958 parámetros totales según los metadatos de safetensors.

El modelo base pertenece a la familia Hy4 de Tencent y está etiquetado internamente como `hy_v4_flash`, lo que sugiere una arquitectura con componentes tipo mixture-of-experts (MoE). La model card menciona explícitamente 41 capas de expertos enrutados y cuatro tablas Engram, aunque no se detalla la arquitectura completa ni el número de parámetros activos por token. La cuantización afecta a las capas de expertos enrutados, mientras que las tablas Engram se codifican en E4M3 con escalas BF16 por fila.

La relevancia de esta ficha radica en que es una de las pocas alternativas públicas para ejecutar Hy4-flash con menos de 4 bits por peso en GPUs sin soporte nativo para el formato original, validada sobre el runtime ReVolta en cuatro NVIDIA V100 con paralelismo tensorial. No obstante, la información pública es escasa: no se detallan idiomas soportados, benchmarks del modelo base ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de expertos enrutados (41 capas) y tablas Engram; detalles completos no disponibles |
| Parametros totales | 220.251.201.958 (220,25 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 con group size 32, zero points enteros y escalas FP16; tablas Engram en E4M3 con escalas BF16 por fila |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors (50 shards, 167,24 GB) |

## Arquitectura y entrenamiento

El modelo base Tencent Hy4-flash emplea una arquitectura de transformer con 41 capas de expertos enrutados, lo que indica un diseño de mezcla de expertos (MoE) con enrutamiento por token. Adicionalmente incorpora cuatro tablas Engram, un componente que en la literatura reciente se asocia a mecanismos de memoria o recuperación de conocimiento estructurado, aunque la model card no especifica su función exacta ni cómo se integran en el forward pass. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación principal de este checkpoint es la cuantización AWQ con realimentación de error GPTQ amortiguada, ajustada usando activaciones BF16 capturadas del modelo original. Las capas de expertos enrutados usan W4A16 asimétrico con grupo 32, mientras que las tablas Engram usan códigos E4M3 con escalas BF16 por fila. El autor reporta validación sobre el runtime ReVolta con paralelismo tensorial en cuatro V100, comparando la divergencia KL respecto al modelo BF16 en 8.675 posiciones de 28 registros de texto retenidos: KL media de 0,1222 nats para AWQ G32 en ReVolta frente a 0,1204 en la referencia eager, con una concordancia top-1 del 92,31% y 92,41% respectivamente. En un prompt diagnóstico de 3.025 tokens la concordancia top-1 cae al 63,60% en ReVolta y 64,40% en eager.

## Capacidades

- Generación de texto conversacional y respuestas directas, según las pruebas de serving reportadas por el autor.
- Razonamiento multi-paso: la model card menciona comprobaciones de "reasoning" en el runtime ReVolta.
- Tool calling / function calling: validado en las pruebas de serving del checkpoint cuantizado.
- Reutilización de prefijo (prefix reuse) para acelerar generación con contextos compartidos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Serving conversacional en infraestructura V100: el checkpoint está validado en cuatro NVIDIA V100 con paralelismo tensorial mediante ReVolta, lo que permite desplegar un modelo de 220 mil millones de parámetros en hardware Ampere/Volta sin GPUs de última generación.
- Asistentes con tool calling en producción: al haberse validado las llamadas a herramientas en el runtime ReVolta, puede integrarse en pipelines de agentes que necesiten invocar APIs externas y encadenar pasos.
- Generación con reutilización de prefijo: útil en escenarios donde muchos usuarios comparten un system prompt largo, ya que el runtime soporta prefix reuse y reduce el coste de prefill.
- Investigación sobre cuantización extrema: el checkpoint incluye métricas de divergencia KL y concordancia top-1 frente a BF16, lo que lo convierte en un caso de estudio para evaluar AWQ W4A16 en arquitecturas MoE con tablas Engram.
- Despliegue en entornos con restricciones de memoria: los 167,24 GB en disco y el formato W4A16 permiten servir el modelo en nodos con menos VRAM que la versión BF16 equivalente.
- Evaluación comparativa de runtimes: al ofrecerse métricas tanto en ReVolta como en la referencia eager, sirve para comparar implementaciones de kernels AWQ GEMM en GPUs antiguas.
- Fine-tuning o adaptación posterior: al ser safetensors estándar, puede cargarse en frameworks que soporten el formato para tareas de ajuste supervisado, siempre que respeten la licencia Tencent Hy.

## Benchmarks y rendimiento

| Checkpoint y runtime | KL media (nats) | KL mediana (nats) | KL p95 (nats) | Concordancia top-1 |
|---|---:|---:|---:|---:|
| RTN G32 en ReVolta | 0,1571 | 0,0069 | 0,5160 | 90,37% |
| AWQ G32 en ReVolta | 0,1222 | 0,0041 | 0,3097 | 92,31% |
| AWQ G32 en referencia eager | 0,1204 | 0,0042 | 0,3418 | 92,41% |

Las métricas se calcularon sobre 8.675 posiciones teacher-forced de 28 registros de texto retenidos, comparando el vocabulario completo frente al modelo BF16. En un prompt diagnóstico separado de 3.025 tokens, la concordancia top-1 fue del 64,40% en eager AWQ y del 63,60% en ReVolta AWQ. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de W4A16 con 220,25 mil millones de parámetros, el peso cuantizado ronda los 110-120 GB, más overhead de activaciones, KV cache y escalas. Se requiere un nodo multi-GPU.
- GPUs recomendadas: el autor valida cuatro NVIDIA V100 con paralelismo tensorial mediante ReVolta. Por tamaño, también sería necesario un conjunto de A100 80GB, H100 80GB o similar.
- ¿Cabe en GPU consumer? No de forma completa. Una RTX 4090 con 24 GB no puede alojar el modelo entero; solo sería viable con offloading a CPU/RAM o con particionado extremo, no soportado oficialmente.
- Opciones de despliegue: ReVolta es el runtime probado por el autor. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-AWQ-g32 (este) | 220,25 mil millones | no disponible | AWQ W4A16 G32 | Tencent Hy License 1.0 | Hugging Face, safetensors |
| tencent/Hy4-flash (base) | no disponible en la información | no disponible | BF16 original | Tencent Hy License 1.0 | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~220 mil millones con cuantización AWQ) en la documentación proporcionada, por lo que la comparativa queda limitada al modelo base.

## Limitaciones y advertencias

- La información pública es muy escasa: no se detallan idiomas, contexto, dataset, benchmarks estándar ni parámetros activos, lo que dificulta evaluar su idoneidad para producción.
- La cuantización introduce degradación medible: la concordancia top-1 frente a BF16 es del 92,31% en texto retenido, pero cae al 63,60% en un prompt diagnóstico largo de 3.025 tokens, lo que sugiere pérdida de fidelidad en contextos extensos.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de sesgos; un modelo de 220 mil millones sin datos de alineación documentados puede alucinar en dominios especializados.
- Restricciones de licencia: la Tencent Hy License 1.0 puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- El runtime validado es ReVolta, un proyecto del propio autor; no hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama, lo que limita las opciones de integración.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validación comunitaria independiente.
- El tamaño de 167,24 GB en disco y la necesidad de múltiples GPUs lo hacen inviable para entornos con recursos limitados.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leoncca/Hy4-flash-AWQ-g32
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revisión base referenciada: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Runtime ReVolta: https://github.com/Leonccaa/ReVolta
- Licencia Tencent Hy: https://huggingface.co/leoncca/Hy4-flash-AWQ-g32/blob/main/LICENSE
- NOTICE con archivos modificados: https://huggingface.co/leoncca/Hy4-flash-AWQ-g32/blob/main/NOTICE
- SHA256SUMS de integridad: https://huggingface.co/leoncca/Hy4-flash-AWQ-g32/blob/main/SHA256SUMS
