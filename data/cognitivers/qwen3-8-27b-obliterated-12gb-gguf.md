# cognitivers/Qwen3.8-27B-OBLITERATED-12GB-GGUF

## Resumen

Qwen3.8-27B-OBLITERATED-12GB-GGUF es una colección de cuantizaciones GGUF de bajo bit (IQ2 e IQ3) del modelo Qwen3.8-27B-OBLITERATED, una variante "abliterada" (descensurada) del Qwen3.8-27B de Alibaba. El autor, cognitivers, ha aplicado una importancia matrix (imatrix) fresca y ajustes específicos por tensor para permitir que un modelo de 27.320 millones de parámetros se ejecute por completo en tarjetas gráficas con 12 GB o incluso 10 GB de VRAM, algo que las cuantizaciones estándar del repo base no lograban.

El modelo base Qwen3.8-27B es una arquitectura híbrida que combina mecanismos SSM (state-space models) con atención clásica, e incluye una capa de predicción multi-token (MTP) que no se ejecuta durante la decodificación normal. La versión abliterada elimina los rechazos del modelo original, lo que lo hace atractivo para casos de uso que requieren respuestas sin restricciones editoriales. Estos archivos GGUF son solo texto; la multimodalidad del modelo base (visión) no está incluida y requiere un proyecto adicional.

Esta cuantización es relevante porque democratiza el acceso a un modelo de 27B con razonamiento y código en hardware de consumo, algo que normalmente exigiría al menos 16-24 GB de VRAM. La reconstrucción del 2026-08-23 corrige un problema de fusión de pesos del repo base, lo que garantiza que estos archivos contienen efectivamente los pesos ablados y no una mezcla incompleta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM + atención con capa MTP (multi-token-prediction) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (modelo base); recomendado -c 8192 en estos cuantos |
| Tipos de cuantizacion | IQ3_XXS (11,43 GB), IQ2_M (10,24 GB), IQ2_S (9,60 GB), IQ2_XXS (8,67 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repo base) |

## Arquitectura y entrenamiento

El Qwen3.8-27B original de Alibaba es un modelo denso de 27B con una arquitectura híbrida que combina capas de atención tradicional con bloques SSM, lo que reduce el coste computacional en secuencias largas. Incluye además una capa de predicción multi-token (MTP) que acelera la decodificación especulativa pero que no se ejecuta durante la generación normal. El contexto nativo es de 256K tokens.

La variante OBLITERATED fue generada mediante la técnica de abliteración, que elimina los vectores de dirección de rechazo del modelo original, permitiendo respuestas sin censura editorial en temas que el modelo base rechaza. Sobre esta base, cogniturs ha aplicado cuantizaciones IQ2/IQ3 con una importancia matrix propia (imatrix.gguf) calculada sobre los pesos corregidos, y ha fijado los tensores de la capa MTP (blk.64) a q4_K para que los cuantizadores IQ no aborten, ya que esa capa no genera datos de imatrix. El resultado son archivos que mantienen la fidelidad del modelo base en un rango de 8,7 a 11,4 GB.

## Capacidades

- Generación de texto libre y conversacional sin los rechazos del modelo original (abliterado).
- Razonamiento paso a paso y modo "thinking" (se recomienda desactivarlo para código).
- Generación de código en múltiples lenguajes, con buen rendimiento en tareas de programación.
- Capacidades de visión en el modelo base, pero **no disponibles** en estos archivos GGUF (text-only).
- Soporte de tool calling y function calling heredado del Qwen3.8-27B (no verificado en estos cuantos).
- Capacidades de agente: el modelo base destaca en agentic coding y planificación multi-paso.
- Multilingüe en el modelo base, aunque no se documentan idiomas concretos en estos archivos.

## Casos de uso

- **Inferencia local en GPU de gama media**: con IQ2_M (10,24 GB) se puede ejecutar el modelo completo en una RTX 3060 de 12 GB o similar, con margen para contexto de hasta 8K tokens. Ideal para desarrolladores que quieren experimentar con un modelo de 27B sin hardware de datacenter.
- **Generación de código en el editor**: el modo "thinking off" recomendado por el autor permite completar y refactorizar código con baja latencia. Se puede integrar en editores como VS Code mediante servidores compatibles con OpenAI.
- **Agentes autónomos**: el modelo base soporta tool calling y razonamiento multi-paso, por lo que puede usarse como cerebro de agentes que interactúan con APIs, navegadores o shells. Los cuantos IQ2_M mantienen suficiente coherencia para tareas de planificación corta.
- **Chat sin restricciones**: al ser un modelo abliterado, sirve para aplicaciones de rol-play, escritura creativa o exploración de temas que el modelo original rechazaría. La licencia Apache 2.0 permite uso comercial, aunque hay que evaluar la responsabilidad legal.
- **Prototipado rápido con Ollama**: la integración directa con Ollama permite desplegar el modelo en segundos para experimentar con prompts y configuraciones de sampling sin necesidad de compilar nada.
- **Investigación en cuantización**: la imatrix y los parámetros de cuantización publicados (tensor-type para capa MTP) son un caso de estudio útil para quienes trabajan en cuantización de modelos híbridos SSM+attention.

## Benchmarks y rendimiento

La model card proporciona datos de perplejidad en wikitext-2, comparados con el Q8_0 corregido:

| Cuantizacion | Tamano | PPL (wikitext-2) | Diferencia vs Q8_0 |
|---|---|---|---|
| Q8_0 (repo base) | 29,05 GB | 7,7630 ± 0,116 | — |
| IQ3_XXS | 11,43 GB | 8,2767 ± 0,124 | +6,6 % |
| IQ2_M | 10,24 GB | 8,8054 ± 0,133 | +13,4 % |
| IQ2_S | 9,60 GB | 9,2450 ± 0,140 | +19,1 % |
| IQ2_XXS | 8,67 GB | 10,2938 ± 0,159 | +32,6 % |

Además, el autor mide la divergencia de token superior entre las versiones antiguas y corregidas: el antiguo Q8_0 y el corregido coinciden solo en el 89,26 % de los casos, lo que confirma que no eran el mismo modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para estos archivos específicos.

## Requisitos de hardware

- **VRAM mínima**: 8 GB para IQ2_XXS (8,67 GB), pero con degradación visible y sin margen de contexto.
- **VRAM recomendada**: 10-12 GB para IQ2_M (10,24 GB) o IQ3_XXS (11,43 GB) con contexto limitado.
- **GPU compatibles**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, A2000 12 GB, o iGPU con 16 GB compartidos.
- **Despliegue**: llama-server, Ollama, LM Studio, Jan y koboldcpp. Todos soportan el formato GGUF y los cuantos IQ.
- **Latencia estimada**: no disponible en la documentación. En una GPU de 12 GB se espera una generación de 10-30 tokens/s según la cuantización y el contexto.
- **Uso de RAM**: en modo de carga completa en VRAM se recomienda al menos 16 GB de RAM del sistema para el overhead de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion minima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 256K | Q8_0 (29 GB) | Apache 2.0 | Repo oficial |
| Qwen3.8-27B-OBLITERATED | 27,3B | 256K | Q2_K (10,9 GB) | Apache 2.0 | Repo base |
| Qwen3.8-27B-OBLITERATED-12GB-GGUF | 27,3B | 256K (recomendado 8K) | IQ2_XXS (8,67 GB) | Apache 2.0 | Este repo |
| Gemma 3 27B | 27B | 128K | Q4_K_M (~16 GB) | Gemma license | Google |

La ventaja principal de este repo es la disponibilidad de cuantos IQ2/IQ3 con imatrix corregida, algo que el repo base no ofrece. Frente a Gemma 3 27B, el Qwen3.8-27B tiene una licencia más permisiva (Apache 2.0 vs Gemma License) y mayor contexto nativo. No se dispone de comparativas de rendimiento directo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Solo texto**: los archivos GGUF no incluyen el proyecto de visión del modelo base; para usar la multimodalidad hay que descargar `mmproj-model-bf16.gguf` del repo original (~1 GB extra de VRAM).
- **Degradación por cuantización**: los cuantos IQ2/IQ3 pierden calidad notable en tareas de código y matemáticas, como indica el aumento de perplejidad (hasta +32,6 % en IQ2_XXS).
- **Contexto limitado en la práctica**: aunque el modelo base soporta 256K, estos cuantos dejan poco margen de VRAM para contextos largos; se recomienda 8K tokens como máximo.
- **Sesgos y alucinaciones**: el abliterado elimina los rechazos, pero no elimina los sesgos subyacentes del modelo original; puede generar contenido ofensivo o factualmente incorrecto sin aviso.
- **Sin garantía de rendimiento**: los benchmarks de perquicidad no cubren tareas reales como razonamiento, código o tool calling; la calidad en estos dominios debe evaluarse por separado.
- **Problemas de conversión históricos**: el repo fue reconstruido por errores de fusión del modelo base; los archivos antiguos siguen disponibles en el historial de git, pero no se recomienda su uso.

## Enlaces

- Repo HuggingFace: https://huggingface.co/cognitivers/Qwen3.8-27B-OBLITERATED-12GB-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de ejecucion local: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Guia de despliegue rapido: https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Documentacion de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- PR de llama.cpp sobre imatrix en modelos híbridos: https://github.com/ggml-org/llama.cpp/pull/14994
