# PollardWeights/Carnice-V3-27b-Pollard

## Resumen

Carnice-V3-27b-Pollard es una cuantización GGUF del modelo Carnice-V3-27b, desarrollado por kai-os, que combina la base Qwen3.8-27B con un ajuste fino de tipo Hermes-agent destilado de Qwen3.8-Max. El resultado es un modelo denso de 27 mil millones de parámetros especializado en tareas de agente y uso de herramientas, capaz de superar a modelos diez veces mayores en dichas tareas según su autor. Esta versión cuantizada por PollardWeights está diseñada para ejecutarse en hardware modesto, como un Mac de 16 GB o una GPU con 12 GB de VRAM, manteniendo una fidelidad cercana a la versión original gracias a una cuantización medida con matriz de importancia (imatrix).

El modelo es multimodal (texto, imagen y vídeo) y ofrece una ventana de contexto de 262 144 tokens (256K), lo que lo hace adecuado para tareas de razonamiento largo, análisis de documentos extensos y conversaciones multi-turno complejas. Su licencia Apache-2.0 permite uso comercial sin restricciones. La cuantización IQ3_S disponible ocupa 12,08 GB y se recomienda como compilación principal para equipos con 16 GB de RAM unificada o 12 GB de VRAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (65 capas, 5120 hidden) |
| Parametros totales | 27 320 697 856 (27B dense) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 (256K) |
| Tipos de cuantizacion | IQ3_S (12,08 GB); IQ4_XS (~16 GB) y Q6_K (~22 GB) anunciados como próximos |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Carnice-V3-27b es un transformer denso con arquitectura qwen35 (65 capas, 5120 unidades ocultas), desarrollado por kai-os. Se construyó a partir de Qwen3.8-27B y se sometió a un ajuste fino supervisado (SFT) de tipo Hermes-agent, destilado de Qwen3.8-Max, lo que le confiere capacidades avanzadas de tool calling y razonamiento multi-paso. El modelo es multimodal: acepta entradas de texto, imagen y vídeo mediante un proyector de visión que se distribuye por separado en formato f16 (no cuantizado).

La cuantización realizada por PollardWeights parte de una fuente Q8_0 (casi sin pérdida, ~99,9 % de la precisión bf16) y utiliza una matriz de importancia (imatrix) derivada de Qwen3.8-27B, que es transferible al ser la misma base. Los tensores no cubiertos por la imatrix se fijan a q6_K. El resultado es una cuantización medida, con una perplejidad held-out de 7,88 para IQ3_S, sin ajuste fino adicional: solo se redimensionan los pesos.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, con especial énfasis en tareas de agente.
- Tool calling y function calling nativo mediante formato Hermes-agent, compatible con ChatML (Qwen3.5).
- Razonamiento multi-paso y planificación de tareas complejas, gracias al ajuste destilado de Qwen3.8-Max.
- Multimodal: procesamiento de imágenes y vídeo mediante el proyector de visión mmproj (f16), integrable con llama.cpp.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones extensas.
- Soporte de agentes conversacionales con formato de mensajes estándar (system, user, assistant).

## Casos de uso

- Atención al cliente automatizada: con 256K de contexto, el modelo puede gestionar conversaciones multi-turno con historial completo y documentos de referencia, manteniendo coherencia a lo largo de sesiones largas.
- Asistentes de código con tool calling: integrable en pipelines de CI/CD para generar, revisar y ejecutar código mediante llamadas a funciones, gracias a su formato Hermes-agent.
- Análisis de documentos extensos: la ventana de 256K permite procesar informes, contratos o artículos científicos completos sin truncamiento, extrayendo información y respondiendo preguntas específicas.
- Agentes autónomos de razonamiento multi-paso: puede planificar y ejecutar secuencias de acciones (búsqueda, cálculo, consulta a APIs) usando tool calling, adecuado para automatización de tareas administrativas.
- Descripción y análisis de imágenes y vídeo: con el proyector de visión, puede generar descripciones detalladas, responder preguntas sobre contenido visual o extraer información de capturas de pantalla.
- Despliegue local en hardware modesto: la cuantización IQ3_S (12 GB) permite ejecutar un modelo de 27B en un Mac de 16 GB o una GPU de 12 GB, ideal para prototipado y desarrollo sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica una perplejidad held-out de 7,88 para la cuantización IQ3_S y una velocidad de ~6,9 tokens por segundo en un Mac de 16 GB con descarga parcial a Metal. No se proporcionan comparativas con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- IQ3_S (12,08 GB): recomendado para Mac de 16 GB o GPU con 12 GB de VRAM (por ejemplo, RTX 3060 12 GB o similar). Es la compilación principal.
- IQ4_XS (~16 GB): previsto para GPU de 24 GB (por ejemplo, RTX 3090), con mayor fidelidad que la cuantización propia de Carnice.
- Q6_K (~22 GB): previsto para sistemas con 32 GB de RAM o VRAM, casi sin pérdida.
- El proyector de visión (mmproj, 0,93 GB) debe mantenerse en f16 y no cuantizarse.
- Despliegue compatible con llama.cpp (llama-server, llama-mtmd-cli), LM Studio, koboldcpp y Jan, siempre que incluyan soporte reciente para la arquitectura qwen35.
- En Mac de 16 GB con IQ3_S, la velocidad es de ~6,9 tok/s (limitada por ancho de banda con descarga parcial a Metal); en GPU CUDA o con el modelo completo residente en 24 GB o más, la velocidad es notablemente superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Carnice-V3-27b (kai-os) | 27B dense | 256K | Apache-2.0 | safetensors | Modelo base original, requiere ~53,7 GB de VRAM en bf16 |
| Carnice-V3-27b-Pollard (IQ3_S) | 27B dense | 256K | Apache-2.0 | GGUF | Cuantización para 12 GB, misma capacidad de agente |
| Carnice-27b-GGUF (kai-os) | 27B dense | 256K | Apache-2.0 | GGUF | Cuantizaciones Q4_K_M, Q6_K, Q8_0 del modelo base |
| Qwen3.8-27B (Qwen) | 27B dense | 256K | Apache-2.0 | safetensors | Fundación del modelo, sin ajuste Hermes-agent |

La comparativa se centra en la misma familia de modelos. La versión Pollard destaca por su cuantización optimizada para hardware reducido, mientras que la versión de kai-os ofrece cuantizaciones estándar. El modelo base original requiere más VRAM pero conserva la precisión completa.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado; aunque la base Qwen3.8 es multilingüe, no se garantiza el rendimiento en otros idiomas.
- La cuantización IQ3_S introduce una pérdida de calidad medible (PPL 7,88) que puede afectar a tareas de precisión alta, como matemáticas avanzadas o generación de código complejo.
- El proyector de visión debe mantenerse en f16; cuantizarlo degrada significativamente la calidad multimodal.
- Requiere una versión reciente de llama.cpp con soporte para la arquitectura qwen35; herramientas más antiguas no podrán cargar el modelo.
- El rendimiento en Mac de 16 GB es limitado (~6,9 tok/s), lo que puede resultar insuficiente para aplicaciones interactivas en tiempo real.
- No se han publicado benchmarks estándar, por lo que la comparación objetiva con otros modelos de la misma categoría es limitada.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base depende de Qwen3.8-27B, cuyos términos de uso deben revisarse para cumplimiento adicional.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/PollardWeights/Carnice-V3-27b-Pollard
- Modelo base original: https://huggingface.co/kai-os/Carnice-V3
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones GGUF de kai-os: https://huggingface.co/kai-os/Carnice-27b-GGUF
- Herramienta de cuantización Pollard Weights: https://github.com/WestWaters/pollard-weights
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Despliegue serverless en Modal (referencia): https://github.com/gwyntel/Carnice-27b-Modal
