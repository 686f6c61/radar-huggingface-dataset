# loterio/Llama-3.1-8B-Instruct-palito

## Resumen

Llama-3.1-8B-Instruct-palito es un artefacto de despliegue publicado por el usuario loterio que empaqueta el modelo Meta Llama 3.1 8B Instruct en un único fichero autocontenido con formato propietario `.palito` (PLT1), pensado para el motor de inferencia palito. No es un modelo nuevo ni un fine-tuning: es una redistribución cuantizada del checkpoint oficial de Meta, con el tokenizador, la plantilla de chat, los pesos en cuantización híbrida `HYB Q=5` (unos 3,0 bits por peso en las capas transformer) y una cabeza draft EAGLE-3 para decodificación especulativa.

El problema que resuelve es práctico: reducir el peso en disco a 3,48 GiB y habilitar decodificación especulativa con paridad exacta respecto a la decodificación token a token, de modo que un modelo de 8B pueda servirse con buena latencia en GPUs de consumo. El autor reporta cifras de hasta 789 tok/s en una RTX 5090 con prompts de refactor, frente a 318 tok/s de llama.cpp sin especulación en el mismo hardware.

Es relevante ahora porque demuestra una vía alternativa a GGUF para distribución de modelos cuantizados con draft head integrada, aunque con un ecosistema muy incipiente (0 descargas, 0 likes en el momento de la consulta) y dependencia total del motor palito. La arquitectura subyacente es la de Llama 3.1 8B: transformer denso de 8.030 millones de parámetros con 128.000 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) con cabeza draft EAGLE-3 para decodificacion especulativa |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B); parametros de la cabeza EAGLE-3 no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B Instruct; no verificado en el fichero empaquetado) |
| Tipos de cuantizacion | PLT1 HYB Q=5 (aprox. 3,0 bpw en capas transformer); cabeza EAGLE-3 en Q4_K |
| Idiomas soportados | Ingles (declarado en la model card); Llama 3.1 soporta oficialmente 8 idiomas, pero el autor solo declara `en` |
| Licencia | Llama 3.1 Community License (pesos base); cabeza EAGLE-3 bajo Apache 2.0 |
| Formato de pesos | `.palito` (PLT1), fichero unico de 3,48 GiB; no es GGUF y no carga en llama.cpp, Ollama ni LM Studio |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct, un transformer denso con atención por grupos (GQA) y RoPE, entrenado por Meta con un pipeline que incluye preentrenamiento sobre del orden de 15 billones de tokens, ajuste supervisado y optimización por preferencias humanas. Esta ficha no aporta información adicional sobre la composición del dataset ni sobre las etapas de alineamiento, por lo que esos detalles deben consultarse en la model card oficial de Meta.

La contribución específica de este artefacto es el empaquetado: un único fichero PLT1 que integra tokenizador, plantilla de chat, pesos cuantizados de forma híbrida a Q=5 y una cabeza draft EAGLE-3 procedente de yuhuili/EAGLE3-LLaMA3.1-Instruct-8B, cuantizada a Q4_K. La decodificación especulativa se activa automáticamente en CUDA y puede desactivarse con la variable de entorno `PALITO_NO_EAGLE3=1`. El autor declara `exact_parity=true`, es decir, que la salida con especulación coincide con la decodificación token a token, algo que no siempre se cumple en implementaciones de draft head.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés, heredadas de Llama 3.1 8B Instruct.
- Razonamiento de propósito general y matemáticas a nivel de modelo 8B de su generación.
- Generación de código y tareas de refactorización, con rendimiento destacado en las pruebas del autor (789 tok/s en prompts de refactor).
- Decodificación especulativa con cabeza EAGLE-3 y `SuffixDecoding`, activada por defecto en CUDA.
- Servido como API compatible con OpenAI mediante `palito serve`.
- Modo interactivo de chat con estadísticas de rendimiento mediante `palito chat --stats`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Servicio de chat interactivo en GPU de consumo: el fichero de 3,48 GiB permite cargar el modelo en GPUs con 8-12 GB de VRAM y servirlo con la API compatible con OpenAI de palito, útil para prototipos y entornos de desarrollo local.
- Asistente de refactorización de código en estación de trabajo: los 789 tok/s reportados en prompts de refactor con una RTX 5090 hacen viable la generación de parches largos y reescrituras de ficheros completos sin esperas perceptibles.
- Evaluación de decodificación especulativa: sirve como banco de pruebas reproducible para comparar EAGLE-3 más SuffixDecoding frente a llama.cpp con IQ3_XXS, dado que el autor publica cifras por tipo de prompt y confirma paridad exacta de salida.
- Generación de texto por lotes en inglés: tareas de resumen, clasificación y extracción sobre documentos en inglés, aprovechando el contexto largo de Llama 3.1 (128k tokens) si el motor lo respeta.
- Backend de aplicaciones de chat internas: al exponer una API compatible con OpenAI, puede sustituir a endpoints remotos en entornos con requisitos de privacidad, manteniendo los datos en la máquina local.
- Investigación sobre formatos de distribución de modelos: el contenedor PLT1 con tokenizador, plantilla y draft head integrados es un caso de estudio frente a la fragmentación típica de GGUF más ficheros auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de velocidad en una RTX 5090 con CUDA, decodificación especulativa y 128 tokens greedy, medidas el 2026-11-26:

| Motor | Configuracion | tok/s (general / coding / refactor) |
|---|---|---|
| palito | Este fichero, EAGLE-3 + SuffixDecoding | 363 / 431 / 789 |
| llama.cpp | IQ3_XXS + EAGLE-3 (cabeza q8_0), mejor `n-max` | 394 / 390 / 608 |
| llama.cpp | IQ3_XXS, sin especulacion | 323 / 331 / 318 |

El autor indica que las cifras dependen del prompt y de la GPU, y que la salida especulativa mantiene `exact_parity=true` respecto a la decodificación normal.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4,5 GB para los pesos en PLT1 HYB Q=5, más overhead de contexto y caché KV; el autor no publica cifras de VRAM pico.
- GPU recomendadas: RTX 5090 para las cifras reportadas; cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM debería poder cargar el modelo, aunque el rendimiento no está documentado en otras tarjetas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use el motor palito; no hay mediciones publicadas para estas tarjetas.
- Opciones de despliegue: exclusivamente el motor palito (versión 0.14 o superior) desde su página de releases. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Latencia y throughput: 363-789 tok/s en RTX 5090 según tipo de prompt; no hay datos de latencia por token ni de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-palito | 8,0 B | 128k (heredado) | PLT1, 3,48 GiB | Llama 3.1 Community | Solo motor palito |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 128k | safetensors (BF16) | Llama 3.1 Community | Transformers, vLLM, TGI |
| Llama 3.1 8B en GGUF (IQ3_XXS) | 8,0 B | 128k | GGUF | Llama 3.1 Community | llama.cpp, Ollama, LM Studio |
| yuhuili/EAGLE3-LLaMA3.1-Instruct-8B | Cabeza draft | No aplica | safetensors | Apache 2.0 | Motores con soporte EAGLE-3 |

La comparativa de rendimiento solo está disponible frente a llama.cpp con IQ3_XXS en la misma GPU: palito es más rápido en prompts de refactor (789 frente a 608 tok/s con especulación) y en coding (431 frente a 390), pero más lento en prompts generales (363 frente a 394).

## Limitaciones y advertencias

- Dependencia total del motor palito: el fichero no carga en llama.cpp, Ollama ni LM Studio, lo que limita la portabilidad y ata el despliegue a un proyecto con muy poca tracción (0 descargas, 0 likes).
- Proyecto de autor único y sin validación independiente: no hay benchmarks de calidad publicados ni revisiones externas del contenedor PLT1.
- Idiomas: la model card declara únicamente inglés, aunque el modelo base soporta oficialmente más idiomas; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: heredado de Llama 3.1 8B Instruct, sin mitigaciones adicionales documentadas.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible; aplican los sesgos del modelo base de Meta.
- Licencia: los pesos están sujetos a la Llama 3.1 Community License, con sus restricciones de uso (incluida la cláusula de 700 millones de usuarios mensuales y las políticas de uso aceptable); la cabeza EAGLE-3 es Apache 2.0, pero la licencia del conjunto queda condicionada por la del modelo base.
- La cuantización a unos 3,0 bpw en capas transformer puede degradar la calidad respecto al checkpoint BF16 original; no se publican evaluaciones de la pérdida de calidad.
- El contexto de 128k es una característica del modelo base, pero no se confirma que el motor palito lo soporte completo ni su consumo de VRAM asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loterio/Llama-3.1-8B-Instruct-palito
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Motor palito (repositorio): https://github.com/natanloterio/palito
- Releases de palito: https://github.com/natanloterio/palito/releases
- Cabeza EAGLE-3: https://huggingface.co/yuhuili/EAGLE3-LLaMA3.1-Instruct-8B
- Licencia Llama 3.1: LICENSE (incluida en el repositorio)
- Política de uso: USE_POLICY.md (incluida en el repositorio)
- Licencia EAGLE-3: LICENSE-EAGLE3 (incluida en el repositorio)
