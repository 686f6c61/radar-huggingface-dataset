# EInnovator/pra-qwen3-14b-mlx-8bit

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un *PRA Runtime Bundle* para el modelo base `mlx-community/Qwen3-14B-8bit`. El bundle empaqueta el mapeo estructural de Progressive Retrieval Attention (PRA), perfiles de ejecución, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación para ese modelo cuantizado. PRA es una técnica de atención que permite manejar contextos largos de forma más eficiente, y este paquete la integra con el runtime MLX en Apple Silicon.

El modelo base es Qwen3-14B, un transformer causal de 14 000 millones de parámetros, cuantizado a 8 bits para MLX. El bundle no incluye los pesos del modelo base, por lo que debe combinarse con el checkpoint original. Está pensado para desarrolladores que quieran desplegar Qwen3-14B con capacidades de contexto largo en hardware Apple, usando el ecosistema `pra` (progressive retrieval attention). La relevancia actual radica en la creciente demanda de inferencia eficiente de modelos grandes en equipos locales, especialmente con ventanas de contexto ampliadas.

La model card indica que la calificación es preliminar: solo se ha validado un *smoke test* de runtime (carga y generación corta) en un MacBook Pro con chip M4 Pro y 48 GB de RAM. No hay métricas de calidad de tarea final para esta identidad exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (modelo base) |
| Parametros totales | 14B (modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no se especifica en el bundle) |
| Tipos de cuantizacion | 8bit (MLX) para el modelo base; el bundle es un adaptador sin pesos |
| Idiomas soportados | no disponible (no se indica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (el bundle no contiene pesos; el modelo base usa formato MLX) |

## Arquitectura y entrenamiento

El bundle se basa en la arquitectura Qwen3ForCausalLM, un transformer causal estándar con atención de múltiples cabezas. La innovación principal es la incorporación de Progressive Retrieval Attention (PRA), un mecanismo que selecciona dinámicamente partes relevantes del contexto para reducir el coste computacional en secuencias largas. El bundle define el mapeo estructural de PRA sobre el modelo base, así como perfiles de ejecución (QUALITY, BALANCED, ECONOMY) que controlan qué capas consumen el contexto completo.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de post-entrenamiento). La model card solo indica que el modelo base está "pretrained and post-trained". El bundle en sí no se entrena; es un paquete de configuración y adaptadores opcionales. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Manejo de contextos largos mediante Progressive Retrieval Attention, con modos "Selected Context" y "Native Memory".
- Integración con el runtime MLX para ejecución eficiente en Apple Silicon.
- Perfiles de ejecución configurables (QUALITY, BALANCED, ECONOMY) para ajustar el equilibrio entre calidad y consumo de recursos.
- Compatibilidad con el ecosistema `pra` (comandos `pra inspect`, `pra evaluate`, `pra serve`).
- No se documentan capacidades específicas de tool calling, agentes, visión o audio; el bundle se centra en la infraestructura de atención de contexto largo.

## Casos de uso

- Procesamiento de documentos extensos: el bundle permite desplegar Qwen3-14B con PRA para resumir o extraer información de informes, contratos o artículos de decenas de miles de tokens, aprovechando la ventana de contexto ampliada sin agotar la memoria.
- Análisis de código en repositorios grandes: con PRA, el modelo puede atender selectivamente a las partes relevantes de un código fuente extenso, facilitando tareas de revisión o generación de documentación.
- Asistentes de conversación con historial largo: en aplicaciones de chat que requieren mantener contexto de múltiples turnos, PRA reduce el coste de atención sobre todo el historial.
- Investigación académica sobre atención eficiente: el bundle sirve como referencia para experimentar con PRA en un modelo de 14B cuantizado, permitiendo comparar perfiles y modos de ejecución.
- Despliegue local en Macs con Apple Silicon: gracias a la cuantización 8bit y al soporte MLX, se puede ejecutar el modelo en equipos con 16-48 GB de RAM unificada, sin necesidad de GPUs dedicadas.
- Evaluación de calidad de contexto largo: los comandos `pra evaluate` permiten medir el rendimiento del modelo en datasets como Qasper, proporcionando una base para decidir si PRA es adecuado para un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad para esta identidad exacta. La model card indica explícitamente que no hay *headline results* y que las métricas de calidad de tarea final, latencia (TTFT, ITL) y throughput sostenido están `NOT_MEASURED`. Solo se proporciona un *smoke test* de runtime:

| Metrica | Valor |
|---|---|
| Hardware | MacBook Pro, Apple M4 Pro, 48 GB RAM |
| Tiempo de carga | 569.2 s |
| Tiempo de generacion (una pasada corta) | 2.828 s |
| Memoria pico (modelo + runtime) | 14.66 GiB |
| Estado | RUNTIME_SMOKE_VALIDATED |

Estos datos son evidencia operativa, no un benchmark de aplicación.

## Requisitos de hardware

- VRAM estimada: el smoke test reporta 14.66 GiB de memoria pico en un Mac con 48 GB unificados. Para el modelo 8bit, se recomienda al menos 16 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: el bundle está diseñado para el runtime MLX, por lo que requiere Apple Silicon (M-series). No se menciona soporte CUDA.
- Compatibilidad con consumer GPU: no aplica, ya que MLX es exclusivo de Apple.
- Opciones de despliegue: se puede usar con `pra serve` (servidor local), o integrar en scripts con `pra evaluate` e `pra inspect`. También es compatible con el ecosistema Hugging Face Transformers a través del adaptador, aunque la model card indica que el modo "Native Serving" no está medido.
- Latencia y throughput: no medidos para esta identidad; solo se conoce el tiempo de generación del smoke test (2.828 s para una generación corta).

## Comparativa con modelos similares

No disponible. Este bundle es un adaptador de runtime para un modelo base específico, no un modelo independiente. No se pueden comparar directamente con otros modelos sin ejecutar evaluaciones en las mismas condiciones. La model card no ofrece comparativas con alternativas.

## Limitaciones y advertencias

- No incluye un router aprendido para esta identidad cuantizada; la transferencia de adaptadores de routing desde otras cuantizaciones está deshabilitada explícitamente.
- Solo se ha realizado validación estructural de configuración inmutable; los perfiles de capas de consumo y la generación de tareas finales no están calibrados.
- Los perfiles QUALITY y ECONOMY están pendientes de calibración; solo BALANCED está cualificado como perfil por defecto.
- No hay evidencia de calidad de tarea final (end-task) para este bundle; los resultados de *smoke test* no deben interpretarse como rendimiento de aplicación.
- El bundle no contiene los pesos del modelo base; es necesario descargar `mlx-community/Qwen3-14B-8bit` por separado.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks de calidad puede suponer un riesgo para producción.
- No se documentan sesgos ni riesgos de alucinación específicos de este bundle; estos dependerán del modelo base Qwen3-14B.

## Enlaces

- Repositorio del bundle: https://huggingface.co/EInnovator/pra-qwen3-14b-mlx-8bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3-14B-8bit
- Documentación del ecosistema PRA: no disponible en la información proporcionada.
