# nebulitgmbh/event-modeling-gemma-4-e4b-q4f16_1-MLC

## Resumen

El modelo `nebulitgmbh/event-modeling-gemma-4-e4b-q4f16_1-MLC` es una compilación de pesos cuantizados en formato MLC (Machine Learning Compilation) y una biblioteca WebGPU precompilada del modelo base `nebulitgmbh/event-modeling-gemma-4-e4b`, un ajuste fino de Gemma 4 E4B orientado a la asistencia en Event Modeling. Lo desarrolla el usuario de Hugging Face `nebulitgmbh` y está pensado para su ejecución en el navegador mediante WebLLM, sin necesidad de servidor de inferencia.

El problema que resuelve es la distribución de un modelo especializado en Event Modeling (una metodología de diseño de sistemas basada en eventos) como artefacto ejecutable en cliente, aprovechando la API WebGPU y el soporte de `shader-f16`. El repositorio ocupa 4,5 GB y la descarga declarada es de aproximadamente 4,2 GB, con un requisito de unos 6 GB de memoria de GPU (5.900 MB según la configuración de WebLLM).

Se trata de un artefacto experimental: el autor indica que la biblioteca se compiló con un parche local de MLC-LLM porque el soporte upstream de Gemma 4 solo cubre E2B (una cabeza KV), mientras que E4B usa dos. Solo se ha probado con WebLLM 0.2.87 sobre Chrome en macOS con Metal y un único prompt de chat. No hay datos publicados de benchmarks ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B), compilado con MLC-LLM para WebGPU |
| Parametros totales | no disponible (el nombre indica variante E4B de Gemma 4; cifra exacta no publicada) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (override `context_window_size` en la configuracion de WebLLM) |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits con activaciones en float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (pesos cuantizados + biblioteca WebGPU `.wasm` + `mlc-model-manifest.json`) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 4 E4B sobre datos de Event Modeling, según indica la model card. La arquitectura subyacente es la de Gemma 4 en su variante E4B, un transformer con dos cabezas KV (frente a la única cabeza de la variante E2B), lo que motivó el parche local de MLC-LLM necesario para compilar la biblioteca WebGPU.

El artefacto de este repositorio no añade entrenamiento: es una derivación cuantizada a q4f16_1 y compilada para WebGPU/WebLLM. La biblioteca se compiló con `gemma-4-E4B-r01-q4f16_1_cs512-webgpu.wasm`, con tamaño de chunk de 512 y contexto de 4.096 tokens. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de Event Modeling ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto orientada a asistencia en Event Modeling (según el propósito declarado del ajuste fino del modelo base).
- Salida en formato JSON mediante el parámetro `response_format` con un JSON Schema, tal como recomienda el autor para obtener JSON del modelo.
- Ejecución en navegador con WebGPU y WebLLM, sin backend de inferencia remoto.
- Conversación de un solo turno verificada en las pruebas del autor (un único prompt de chat).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de Event Modeling embebido en una aplicación web: el modelo se carga con WebLLM en el navegador del usuario y guía la construcción de modelos de eventos (comandos, eventos, read models) sin enviar datos a un servidor, lo que resulta adecuado para equipos con requisitos de privacidad.
- Prototipado de herramientas de diseño de sistemas en cliente: al ejecutarse sobre WebGPU, permite distribuir una demo interactiva de asistencia a Event Modeling sin infraestructura de GPU propia.
- Generación de artefactos JSON estructurados: usando `response_format` con un JSON Schema, se pueden producir descripciones de eventos o especificaciones en formato consumible por otras herramientas del pipeline.
- Evaluación de viabilidad de LLM en navegador: sirve como banco de pruebas para medir latencia y consumo de VRAM (5.900 MB) de un modelo de ~4 GB en hardware de usuario final.
- Formación y talleres: al no requerir backend, facilita ejercicios guiados de Event Modeling en los que cada participante ejecuta el asistente localmente.
- Integración en editores o wikis internos basados en web: el binario `.wasm` y el manifiesto permiten incorporar el asistente como componente de una aplicación web existente con WebLLM 0.2.87 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba cualitativa: con WebLLM 0.2.87 en Chrome sobre macOS (Metal), un prompt de chat produjo una salida que coincidía con la de MLC en CPU. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: 5.900 MB según `vram_required_MB` de la configuración de WebLLM; el autor indica unos 6 GB de memoria de GPU.
- Tamaño de descarga: aproximadamente 4,2 GB (repositorio de 4,5 GB).
- Memoria de buffer adicional: `buffer_size_required_bytes` de 268.435.456 bytes (256 MB).
- Requisitos de plataforma: navegador con WebGPU y soporte de `shader-f16`.
- GPU recomendadas: no disponible. El único entorno probado es Chrome sobre macOS con Metal; otros navegadores y GPUs no han sido verificados.
- Despliegue: WebLLM (versión probada 0.2.87) con `mlc-model-manifest.json` obligatorio; sin el manifiesto, WebLLM falla con "Invalid kv_cache ABI".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y las variantes MLC de otros modelos no se documentan en el material disponible.

## Limitaciones y advertencias

- Artefacto experimental: el autor lo etiqueta explícitamente como experimental y solo lo ha probado con un único prompt de chat en Chrome sobre macOS con Metal.
- Compatibilidad limitada: requiere WebGPU y `shader-f16`; otros navegadores y GPUs no están verificados.
- Dependencia de un parche local de MLC-LLM: el soporte upstream de Gemma 4 solo cubre E2B, por lo que la reproducibilidad de la compilación no está garantizada con MLC-LLM estándar.
- Contexto reducido: la ventana configurada es de 4.096 tokens, insuficiente para conversaciones o documentos largos.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base Gemma 4.
- Licencia: Apache 2.0 según la model card, que remite además a la licencia de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial.
- Sin métricas de calidad publicadas: no hay benchmarks que permitan evaluar su idoneidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e4b-q4f16_1-MLC
- Modelo base: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e4b
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
