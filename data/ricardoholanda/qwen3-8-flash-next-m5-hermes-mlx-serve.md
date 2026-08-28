# ricardoholanda/Qwen3.8-Flash-Next-M5-Hermes-mlx-serve

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de lenguaje de gran tamaño (image-text-to-text) desarrollado por el equipo Qwen de Alibaba, publicado el 26 de agosto de 2026 como release experimental. Se basa en la nueva arquitectura Qwen4, una mezcla ultra dispersa de expertos (MoE) con 125 mil millones de parámetros totales, de los cuales solo 6 mil millones se activan por token. Incorpora una tabla n-gram adicional de 51 mil millones de parámetros y soporta una ventana de contexto de 262.144 tokens. El modelo combina Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir el historial y Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de largo alcance.

El repositorio analizado, `ricardoholanda/Qwen3.8-Flash-Next-M5-Hermes-mlx-serve`, no contiene los pesos del modelo (que residen en el repositorio upstream `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit`), sino que es un paquete de integración y reproducibilidad para ejecutar el modelo en un Apple M5 Max con 128 GB de memoria unificada mediante el motor `mlx-serve`. Incluye un parche de software que habilita decodificación especulativa adaptativa (MTP, Multi-Token Prediction), un launcher para el agente Hermes y resultados de benchmarks medidos en el hardware objetivo. La relevancia de esta release radica en que demuestra cómo optimizar un modelo MoE de 125B en hardware de consumo de gama alta, alcanzando velocidades de decodificación superiores a 100 tokens por segundo en cargas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet + Qwen Sparse Attention), qwen4_exp |
| Parametros totales | 125B (incluyendo 51B de tabla n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | q4/gs64 (affine, group-64) en el pack MLX 4-bit |
| Idiomas soportados | no disponible (se espera multilingue, no documentado) |
| Licencia | MIT para el repo de integracion; Qwen Community License para los pesos del modelo base |
| Formato de pesos | safetensors (modelo base); MLX 4-bit en el pack upstream; este repo no contiene pesos |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next se construye sobre la arquitectura Qwen4, que combina dos mecanismos de atencion complementarios. Tres de cada cuatro capas utilizan Gated DeltaNet (GDN), un mecanismo de estado recurrente que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperacion precisa de informacion de largo alcance. El modelo tiene 48 capas, un tamaño oculto de 2560, 512 expertos enrutados con seleccion top-10, un tamaño intermedio de 640 y una cabeza MTP nativa del checkpoint. La tabla n-gram de 51B se almacena en memoria mapeada y contribuye a la prediccion especulativa.

El entrenamiento detallado (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se ha publicado en la informacion disponible. El modelo se describe como experimental y se distribuye bajo la Qwen Community License. El repositorio de integracion implementa un controlador MTP adaptativo que selecciona profundidad 1, 2 o 3 segun la tasa de aceptacion en vivo y el coste de cada ronda, con un override manual mediante `--mtp-depth`. Tambien incluye un experimento de kernels NAX agrupados para expertos q4/gs64 que paso las pruebas de paridad pero resulto un 19,6% mas lento que el codigo estandar, por lo que permanece desactivado por defecto.

## Capacidades

- Generacion de texto y razonamiento avanzado, con modo de pensamiento (reasoning effort) configurable.
- Comprension multimodal: entrada de imagen y texto, salida de texto (image-text-to-text).
- Generacion de codigo y tareas de agente (agentic coding), con soporte de tool calling y function calling.
- Decodificacion especulativa nativa mediante MTP (Multi-Token Prediction), con profundidad adaptativa de 1 a 3 tokens especulativos.
- Integracion con Hermes Agent, un agente conversacional con interfaz TUI y GUI de escritorio, compatible con API OpenAI.
- Capacidades multilingues no documentadas explicitamente, pero se asume soporte amplio por la familia Qwen.
- Ventana de contexto de 262K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en pipelines de CI/CD para revision de codigo, generacion de parches y autocompletado, gracias a su capacidad de razonamiento agente y tool calling. En el hardware M5 Max probado alcanza 105,3 tok/s en cargas de codigo con MTP adaptativo, lo que permite iteraciones rapidas.
- Atencion al cliente automatizada: con 262K tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y documentos de soporte, manteniendo coherencia a lo largo de sesiones largas.
- Analisis de documentos largos: la combinacion de GDN y QSA permite procesar informes, contratos o articulos cientificos de decenas de miles de tokens, extrayendo informacion especifica con recuperacion precisa.
- Agente autonomo de escritorio: mediante Hermes Agent, el modelo puede actuar como asistente personal que ejecuta tareas multi-paso, consulta herramientas locales y mantiene un perfil de razonamiento bajo para reducir latencia.
- Generacion de contenido multimodal: dado que acepta imagenes como entrada, puede describir, resumir o responder preguntas sobre capturas de pantalla, diagramas o fotografias, util en entornos de documentacion tecnica.
- Investigacion en decodificacion especulativa: el repositorio sirve como banco de pruebas para estudiar el impacto de MTP adaptativo en modelos MoE, con benchmarks reproducibles y un parche de software documentado.

## Benchmarks y rendimiento

Los benchmarks publicados en el repositorio de integracion se midieron en un Apple M5 Max con 128 GB de memoria unificada, utilizando el pack q4/gs64 de 4 bits. Son medianas de tres repeticiones en el mismo arranque.

| Workload | MTP adaptativo (tok/s) | Decodificacion serial (tok/s) | Cambio |
|---|---:|---:|---:|
| Codigo | 105,3 | 73,4 | +43,5% |
| Prosa | 74,0 | 71,8 | +3,1% |
| Prompt de 8.5K tokens | 68,8 | 64,6 | +6,5% |

Prueba llmprobe en arranque limpio:

| Celda | Antes | Despues | Cambio |
|---|---:|---:|---:|
| Decode | 91,8 tok/s | 99,4 tok/s | +8,3% |
| Prefill | 1861,4 tok/s | 1863,1 tok/s | +0,1% |
| Spec: predecible | 114,9 tok/s | 115,8 tok/s | +0,8% |
| Spec: novedoso | 72,0 tok/s | 73,8 tok/s | +2,5% |

La cabeza adaptativa promedió entre 2,86 y 3,00 tokens especulativos por paso en las pruebas finales. Segun la documentacion de unsloth, el modelo base supera a Claude-4.6-Opus (Max) en tareas de codigo agente, vision y razonamiento, aunque no se proporcionan cifras comparativas en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple M5 Max con 128 GB de memoria unificada (probado en MacBook Pro).
- Uso de memoria: el pack en disco ocupa aproximadamente 98 GB, incluyendo la tabla n-gram de 32 GB mapeada en memoria. El servicio consume entre 73 y 75 GB antes del crecimiento de la cache KV.
- GPU: no requiere GPU discreta; utiliza los nucleos NAX del Apple Silicon (G17/M5 NAX surface) para aceleracion de expertos.
- VRAM estimada: no aplica VRAM tradicional; la memoria unificada del SoC es suficiente con 128 GB. Con 96 GB podria ser ajustado, pero no esta verificado.
- Opciones de despliegue: `mlx-serve` (motor principal, con parche incluido), compatible con API OpenAI. El modelo base tambien puede ejecutarse con vLLM en hardware NVIDIA, aunque este repositorio esta orientado a MLX.
- Latencia y throughput: decodificacion de 99,4 tok/s en arranque limpio y hasta 105,3 tok/s en codigo con MTP adaptativo; prefill de 1863 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este) | 125B + 51B n-gram | 6B | 262K | Qwen Community | Apple M5 Max (MLX) o GPU NVIDIA (vLLM) |
| Claude-4.6-Opus (Max) | no publico | no publico | no publico | propietaria | API en la nube |
| DeepSeek-V3 (referencia MoE) | 671B | 37B | 128K | MIT | GPU NVIDIA A100/H100 |

Segun unsloth, Qwen3.8-Flash-Next supera a Claude-4.6-Opus en tareas de codigo agente, vision y razonamiento, aunque no se ofrecen metricas concretas. Comparado con DeepSeek-V3, Qwen3.8-Flash-Next es significativamente mas pequeno en parametros totales y activos, lo que permite su ejecucion en hardware de consumo de gama alta, a costa de una ventana de contexto mayor (262K frente a 128K). No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: Qwen3.8-Flash-Next se publica como release experimental; su comportamiento en produccion no esta garantizado y puede presentar inestabilidades.
- Licencia del modelo base: los pesos estan bajo Qwen Community License, que puede imponer restricciones de uso comercial y redistribucion. El repositorio de integracion es MIT, pero no incluye los pesos.
- Requisitos de hardware muy especificos: el parche y los benchmarks estan validados unicamente en Apple M5 Max con 128 GB. Otros hardware pueden no beneficiarse de las optimizaciones o incluso fallar.
- Riesgo de alucinacion: no se han documentado tasas de alucinacion ni sesgos especificos; como modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se ha publicado la lista de idiomas soportados; el rendimiento en lenguas minoritarias es desconocido.
- Consumo de memoria elevado: el pack de 98 GB y el uso de 73-75 GB en servicio limitan el despliegue a equipos con al menos 96 GB de memoria unificada, lo que excluye la mayoria de portatiles Apple actuales.
- Dependencia de componentes de terceros: el parche se basa en un commit concreto de `mlx-serve` (2a41d2e); cambios en el motor pueden romper la compatibilidad.

## Enlaces

- Repositorio de integracion: https://huggingface.co/ricardoholanda/Qwen3.8-Flash-Next-M5-Hermes-mlx-serve
- Repositorio upstream de pesos MLX: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor mlx-serve: https://github.com/ddalcu/mlx-serve
- Documentacion de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Wiki de IA (descripcion general): https://aiwiki.ai/wiki/qwen3_8_flash_next
