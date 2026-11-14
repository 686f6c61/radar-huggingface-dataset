# coolthor/Laguna-S-2.1-attnQ8-DFlash-Q4-GGUF

## Resumen

Laguna-S-2.1-attnQ8-DFlash-Q4-GGUF es una redistribución cuantizada del modelo Poolside Laguna S 2.1, un transformer de mezcla de expertos (MoE) de 118B parámetros totales con aproximadamente 8B activos (118B-A8B). El paquete lo publica coolthor, no Poolside, e incluye dos artefactos GGUF: un modelo objetivo con las 240 tensores de atención convertidos de F16 a Q8_0 y un modelo borrador DFlash en Q4_K_M para decodificación especulativa. El objetivo es ejecutar el modelo en una única GPU de 22 GB (RTX 2080 Ti) con offload híbrido CPU/GPU mediante llama.cpp.

La relevancia de esta ficha es práctica: demuestra una vía concreta para servir un MoE de 118B en hardware de consumo moderado, con ganancias medidas de throughput del 7,2 % en decodificación solo-objetivo y del 4,1 % con decodificación especulativa frente al GGUF oficial Q4_K_M de Poolside. El contexto validado es de 262.144 tokens, aunque el modelo base fue entrenado hasta 1M.

No es un fine-tune ni una versión oficial: los tensores Q4_K, Q6_K, router, norm y bias se preservan byte a byte, y solo se modifica la precisión de la atención. La licencia es OpenMDW-1.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), con decodificación especulativa DFlash |
| Parametros totales | 117.561.977.600 (~118B) |
| Parametros activos | ~8B (denominación 118B-A8B) |
| Longitud de contexto | 262.144 tokens validados en este paquete; entrenamiento nativo hasta 1M (override YaRN en la model card oficial) |
| Tipos de cuantizacion | Objetivo: Q4_K (239 tensores), Q6_K (48), Q8_0 (240, atención), F32 (287). Borrador: Q4_K (45), Q6_K (4), F32 (27). KV cache: q4_0 (objetivo), f16 (borrador) |
| Idiomas soportados | No disponible en la información proporcionada; se han validado prompts en inglés y chino tradicional |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 118B parámetros totales y unos 8B activos por token. La distribución oficial Q4_K_M de Poolside mantiene los expertos en Q4_K/Q6_K, los tensores sensibles (router, norm, bias) en F32 y la atención en F16. Esta redistribución cambia únicamente los 240 tensores F16 de atención a Q8_0, reduciendo la carga de tensores en 2.506 MiB respecto al GGUF oficial de ~75 GB, sin recuantizar expertos ni tocar router, norm o bias. El objetivo es que, en un sistema con offload híbrido CPU/GPU, quepa más parte del modelo en la GPU y se reduzca el tráfico de atención.

El paquete incorpora además una conversión Q4_K_M del modelo borrador DFlash oficial de Poolside para decodificación especulativa. La model card documenta que el borrador debe mantener su KV cache en F16: usar Q4_0 en el KV del borrador redujo la aceptación de propuestas por debajo del 1 % y la decodificación a unos 5-6 tok/s. También indica que `--spec-draft-n-max` debe ajustarse al hardware; con este borrador Q4_K_M en el sistema Turing probado, el valor óptimo medido fue 4, frente a los 15 del ejemplo BF16 oficial. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de razonamiento configurable (`--reasoning on --reasoning-format deepseek`).
- Soporte de tool calling y function calling nativo; la model card indica que las pruebas de seguridad de tool-call nativo pasaron tras la cuantización.
- Salida JSON estricta validada tras la cuantización.
- Razonamiento multi-paso y uso en agentes, con la advertencia de gestionar el modo de razonamiento a nivel de capa de agente.
- Capacidades de codificación: la model card menciona gates de código ejecutable `min_window` superados.
- Multilingüe: se han validado prompts en inglés y chino tradicional; no hay lista oficial de idiomas disponible.
- Decodificación especulativa mediante el modelo borrador DFlash incluido en el paquete.

## Casos de uso

- Asistente de código en local: el modelo puede generar y razonar sobre código con tool calling y salida JSON estricta, integrándose en un servidor llama.cpp compatible con la API de OpenAI (`endpoints_compatible`) para editores y pipelines de CI/CD.
- Agente de razonamiento multi-paso con contexto largo: con 262.144 tokens validados, puede mantener conversaciones o documentos extensos en memoria y encadenar llamadas a herramientas, siempre que la capa de agente gestione el presupuesto de razonamiento.
- Servicio de atención al cliente multi-turno: el contexto largo permite arrastrar historial y documentación de producto; el modo de razonamiento debe desactivarse o acotarse para evitar respuestas vacías.
- Procesamiento de documentos largos en inglés y chino: la validación con prompts en chino tradicional y el contexto de 262K lo hacen adecuado para resumen y extracción sobre contratos o informes extensos.
- Despliegue en hardware de gama alta de consumo: con una RTX 2080 Ti de 22 GB y offload híbrido, sirve un MoE de 118B con throughput medido de 21 tok/s en decodificación solo-objetivo y hasta 28,9 tok/s con el borrador DFlash en inglés.
- Prototipado e investigación de decodificación especulativa: el par objetivo + borrador DFlash permite experimentar con `--spec-draft-n-max`, precisión de KV del borrador y aceptación de propuestas en llama.cpp.
- Evaluación comparativa de cuantizaciones: al preservar los tensores ya cuantizados, sirve como referencia controlada para medir el impacto de subir la atención a Q8_0 frente al GGUF oficial.

## Benchmarks y rendimiento

Resultados medidos por el autor en un sistema EPYC 7402, 128 GB DDR4 ECC de ocho canales, una RTX 2080 Ti modificada de 22 GB, rama `laguna` de llama.cpp, contexto de 262K y un slot.

| Escenario | GGUF oficial Q4_K_M | attention-Q8 | Cambio |
|---|---:|---:|---:|
| Decodificación solo-objetivo, inglés | 19,640 tok/s | 21,048 tok/s | +7,2 % |
| Decodificación solo-objetivo, chino tradicional | 19,733 tok/s | 21,259 tok/s | +7,7 % |
| Con borrador DFlash Q4_K_M, inglés | 27,812 tok/s | 28,959 tok/s | +4,1 % |
| Con borrador DFlash Q4_K_M, chino tradicional | 18,906 tok/s | 19,498 tok/s | +3,1 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las pruebas de aceptación documentadas son cualitativas: JSON estricto, seguridad de tool-call nativo y gates de código ejecutable `min_window`.

## Requisitos de hardware

- VRAM estimada: el paquete está diseñado para una GPU de 22 GB con offload híbrido CPU/GPU; los pesos del objetivo son mayoritariamente residentes en CPU. El archivo objetivo ocupa 67,6 GiB y el borrador 622 MiB.
- GPU recomendadas: RTX 2080 Ti de 22 GB (sistema validado). No hay datos publicados para A100, H100 o RTX 4090 en esta información.
- GPU de consumo: sí cabe en una RTX 2080 Ti de 22 GB con offload; no se dispone de datos para GPUs con menos VRAM.
- Despliegue: exclusivamente con la rama `laguna` del fork de llama.cpp de Poolside (`llama-server`); el llama.cpp upstream genérico no contiene el contrato completo del decodificador DFlash requerido.
- Memoria del sistema: el sistema de pruebas usó 128 GB de DDR4 ECC de ocho canales, relevante para el rendimiento del offload.
- Throughput medido: 21,048 tok/s (inglés) y 21,259 tok/s (chino tradicional) solo-objetivo; 28,959 tok/s y 19,498 tok/s respectivamente con borrador DFlash.
- KV cache: objetivo en q4_0, borrador en f16; el KV del borrador en Q4_0 degrada la decodificación a 5-6 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| coolthor/Laguna-S-2.1-attnQ8-DFlash-Q4-GGUF | ~118B | ~8B | 262K validados (1M nativo) | GGUF | OpenMDW-1.1 | Atención Q8_0, borrador DFlash Q4_K_M, optimizado para 22 GB |
| poolside/Laguna-S-2.1-GGUF (Q4_K_M oficial) | ~118B | ~8B | 1M nativo | GGUF | OpenMDW-1.1 | Atención en F16, ~75 GB, referencia de rendimiento |
| poolside/Laguna-S-2.1 (base) | ~118B | ~8B | 1M nativo | safetensors | OpenMDW-1.1 | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es una versión oficial de Poolside: es una redistribución cuantizada modificada y Poolside no la respalda ni la mantiene.
- Modo de razonamiento: el fallo conocido de Laguna de consumir todo el presupuesto de `max_tokens` dentro de `reasoning_content` sin emitir respuesta final persiste tras la cuantización; debe gestionarse en la capa de agente, desactivando el pensamiento o añadiendo una reparación de final vacío.
- DFlash: el KV del borrador debe mantenerse en F16; usar Q4_0 reduce la aceptación por debajo del 1 % y la decodificación a 5-6 tok/s.
- `--spec-draft-n-max` debe ajustarse por hardware y precisión del borrador; valores mayores que 4 redujeron el throughput en el sistema Turing probado.
- Requiere la rama `laguna` del fork de llama.cpp de Poolside; el llama.cpp upstream genérico no es compatible.
- Contexto: validado a 262.144 tokens; el contexto nativo de 1M requiere el override YaRN de la model card oficial y tiene advertencias de calidad no detalladas aquí.
- Idiomas: no hay lista oficial de idiomas soportados; solo se han validado inglés y chino tradicional.
- Sesgos y alucinaciones: no se han publicado evaluaciones específicas en la información disponible.
- Licencia OpenMDW-1.1: deben revisarse sus términos para uso comercial; la copia completa se incluye como `LICENSE.md` en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/Laguna-S-2.1-attnQ8-DFlash-Q4-GGUF
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- GGUF oficial e importance matrix: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Borrador DFlash oficial: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Fork de llama.cpp de Poolside, rama `laguna`: https://github.com/poolsideai/llama.cpp/tree/laguna
- Licencia OpenMDW-1.1: https://huggingface.co/poolside/Laguna-S-2.1/blob/main/LICENSE.md
- Notas y benchmarks del autor: https://ai-muninn.com
- Otros modelos cuantizados del autor: https://huggingface.co/coolthor
- Revisión de procedencia: https://huggingface.co/coolthor/Laguna-S-2.1-attnQ8-DFlash-Q4-GGUF/tree/ea6cd8f8fd070f48a8c9bdbb8ee96838d1639cfd
