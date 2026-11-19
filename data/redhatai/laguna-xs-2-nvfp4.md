# RedHatAI/Laguna-XS.2-NVFP4

## Resumen

Laguna XS.2-NVFP4 es la variante cuantizada en NVFP4 (con caché KV en FP8) del modelo Laguna XS.2 desarrollado por Poolside, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programación agéntica y trabajo de larga duración en máquina local. El modelo cuenta con 33.442.617.168 parámetros totales (aproximadamente 33B) y activa unos 3B parámetros por token, lo que lo hace especialmente adecuado para despliegues con requisitos moderados de memoria. Esta versión concreta ha sido publicada y validada por RedHatAI sobre RHOAI 3.5.1, RHAIIS 3.5.0-ea.2 y vLLM 0.21.0.

La arquitectura combina atención de ventana deslizante (Sliding Window Attention) con gating por cabeza en 30 de las 40 capas totales, junto con 10 capas de atención global, empleando una proporción 3:1 entre atención local y global. Incorpora gating sigmoide con escalas rotatorias por capa y una ventana deslizante de 512 tokens. La ventana de contexto alcanza los 131.072 tokens y el modelo soporta razonamiento nativo con pensamiento intercalado entre llamadas a herramientas.

Su relevancia actual radica en que ofrece un rendimiento competitivo en benchmarks de ingeniería de software (SWE-bench Verified 68,2%) con un tamaño que cabe en equipos de consumo —el modelo BF16 original corre en un Mac con 36 GB de RAM—, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Esta variante NVFP4 reduce aún más los requisitos de memoria para despliegues en producción con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida: 30 capas de Sliding Window Attention con gating por cabeza y 10 capas de atención global (proporción 3:1); gating sigmoide con escalas rotatorias por capa |
| Parametros totales | 33.442.617.168 (aproximadamente 33B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (esta variante), con caché KV en FP8; también disponibles BF16, FP8 e INT4 en el repositorio original de Poolside |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit), compatible con vLLM |

## Arquitectura y entrenamiento

Laguna XS.2 es un modelo MoE de 40 capas con 256 expertos y 1 experto compartido. La innovación arquitectónica principal es la combinación de capas de atención de ventana deslizante (30 capas, ventana de 512 tokens) con capas de atención global (10 capas) en proporción 3:1. Esta disposición reduce drásticamente los requisitos de caché KV y acelera la inferencia, manteniendo la capacidad de modelar dependencias de largo alcance mediante las capas globales. El gating sigmoide con escalas rotatorias por capa permite un control fino de la mezcla entre atención local y global.

El entrenamiento se realizó en tres fases: pre-entrenamiento, post-entrenamiento y etapas de aprendizaje por refuerzo (RL). Se empleó el optimizador Muon. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada. El modelo incorpora soporte nativo de razonamiento con pensamiento intercalado (interleaved thinking) entre llamadas a herramientas, con la posibilidad de activar o desactivar el modo de pensamiento por petición.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto de 131.072 tokens.
- Razonamiento nativo con pensamiento intercalado entre llamadas a herramientas, activable y desactivable por petición.
- Programación agéntica y trabajo de larga duración (long-horizon work), incluyendo resolución de issues y modificación de repositorios de código.
- Soporte de tool calling y function calling, integrable en flujos agénticos.
- Capacidad de razonamiento multi-paso con preservación del pensamiento previo entre pasos.
- Capacidades multilingües: no disponible (no se especifican idiomas soportados).
- Modalidad exclusivamente texto-a-texto (sin visión ni audio).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue de GitHub junto con el contexto del repositorio (hasta 131.072 tokens) y generar un parche que resuelva el problema, con capacidad de ejecutar tests y refinar la solución de forma iterativa. Su puntuación de 68,2% en SWE-bench Verified lo respalda para esta tarea.
- Asistente de programación en IDE: integrado mediante tool calling, puede leer archivos, ejecutar comandos en terminal y aplicar ediciones multi-archivo, manteniendo el estado de la conversación a lo largo de sesiones largas gracias al contexto extendido.
- Automatización de tareas de terminal y DevOps: con un 30,1% en Terminal-Bench 2.0, es adecuado para agentes que operan en entornos de línea de comandos, ejecutan scripts de despliegue o diagnostican fallos de infraestructura.
- Migración y refactorización de código multi-archivo: su ventana de contexto permite cargar módulos completos y realizar cambios coherentes entre archivos, con razonamiento intercalado para planificar la refactorización antes de aplicarla.
- Agente de revisión de código en CI/CD: puede integrarse en pipelines para analizar pull requests, ejecutar linters y tests, y proponer correcciones automáticas, gracias a su soporte de tool calling y a su licencia Apache 2.0 que permite uso comercial sin restricciones.
- Despliegue local en estación de trabajo: al activar solo 3B parámetros por token y caber en 36 GB de RAM en BF16, permite a desarrolladores ejecutar un agente de código completamente local sin depender de APIs externas, preservando la confidencialidad del código.
- Generación de tests unitarios y documentación técnica: el modelo puede analizar funciones y módulos completos dentro de su contexto y generar tests o documentación coherentes con el estilo del proyecto.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo BF16; la variante NVFP4 no presenta benchmarks propios en la información disponible):

| Modelo | Tamaño (params. totales) | SWE-bench Verified | SWE-bench Multilingual | SWE-bench Pro (Public) | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| Laguna XS.2 (BF16) | 33B | 68,2% | 62,4% | 44,5% | 30,1% |
| Devstral Small 2 | 24B dense | 68,0% | 55,7% | - | 22,5% |
| Gemma 4 31B IT | 31B dense | 52,0% | 51,7% | 35,7% | 42,9% |
| Qwen3.5-35B-A3B | 35B | 69,2% | 60,3% | 44,6% | 40,5% |
| Qwen3.6-35B-A3B | 35B | 73,4% | 67,2% | 49,5% | 51,5% |
| Claude Haiku 4.5 | - | 73,3% | - | 39,5% | 29,8% |
| GPT-5.4 Nano | - | - | - | 52,4% | 46,3% |

Metodología: benchmarking realizado con el Harbor Framework del Laude Institute y el agent harness de Poolside, con un máximo de 500 pasos y ejecución en sandbox de 8 GB de RAM y 2 CPUs (excepto Terminal-Bench 2.0). Parámetros de muestreo: temperature=0,7 y top_k=20. SWE-bench Verified: media de pass@1 sobre 4 ejecuciones; SWE-bench Multilingual: media sobre 7 ejecuciones; SWE-bench Pro: media sobre 3 ejecuciones.

## Requisitos de hardware

- VRAM estimada: el repositorio NVFP4 ocupa 21,5 GB en disco, por lo que la inferencia requiere aproximadamente 21-24 GB de VRAM (pesos NVFP4 más caché KV en FP8 y overhead de runtime). La variante BF16 original requiere unos 36 GB de RAM según la model card.
- GPU recomendadas: NVIDIA H100, H200, B200 (soporte nativo de FP4), A100 80GB para la variante NVFP4; en consumer, RTX 4090 (24 GB) y RTX 5090 (32 GB) son candidatas para la variante NVFP4.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y superiores con la cuantización NVFP4; el modelo BF16 cabe en equipos con 36 GB de RAM (Mac con Apple Silicon).
- Opciones de despliegue: vLLM 0.21.0 (validado), RHOAI 3.5.1, RHAIIS 3.5.0-ea.2, Ollama (variante disponible en ollama.com/library/laguna-xs.2). El formato compressed-tensors y la dependencia de vLLM limitan el uso en llama.cpp para esta variante concreta.
- Latencia y throughput: no disponibles en la información proporcionada. La activación de solo 3B parámetros por token y la ventana deslizante de 512 tokens en 30 de 40 capas reducen el coste de inferencia y el tamaño de la caché KV, lo que se traduce en mayor throughput que un modelo denso de 33B.

## Comparativa con modelos similares

| Modelo | Params. totales | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laguna XS.2-NVFP4 | 33B (MoE) | ~3B | 131.072 | 68,2% (BF16) | Apache 2.0 | Hugging Face, Ollama |
| Devstral Small 2 | 24B dense | 24B | no disponible | 68,0% | no disponible | Hugging Face |
| Qwen3.5-35B-A3B | 35B (MoE) | ~3B | no disponible | 69,2% | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | 35B (MoE) | ~3B | no disponible | 73,4% | no disponible | Hugging Face |
| Gemma 4 31B IT | 31B dense | 31B | no disponible | 52,0% | no disponible | Hugging Face |

Laguna XS.2 se sitúa en el mismo rango que Devstral Small 2 y Qwen3.5-35B-A3B en SWE-bench Verified, por encima de Gemma 4 31B IT, aunque por debajo de Qwen3.6-35B-A3B. Su ventaja diferencial es la licencia Apache 2.0 explícita y la disponibilidad de variantes cuantizadas (BF16, FP8, INT4, NVFP4) para distintos presupuestos de hardware.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; como todo modelo entrenado con datos web, puede reproducir sesgos presentes en el corpus.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de código puede generar APIs inexistentes o parches que compilan pero no resuelven el problema. Se recomienda validación con tests automatizados.
- Limitaciones de contexto: aunque la ventana es de 131.072 tokens, la atención de ventana deslizante de 512 tokens en 30 de 40 capas puede degradar la recuperación de información muy distante en el contexto; solo 10 capas tienen atención global.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del inglés no está documentado y podría ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales; no obstante, la model card incluye una descripción de gating y remite a la política de privacidad de Poolside para el tratamiento de datos personales.
- Caveats para producción: esta variante NVFP4 requiere vLLM 0.21.0 o superior y está validada en RHOAI 3.5.1 y RHAIIS 3.5.0-ea.2; el soporte en otros runtimes (llama.cpp, TGI) no está confirmado. La cuantización NVFP4 puede introducir una ligera degradación de calidad frente a BF16, no cuantificada en la información disponible.
- El modelo es exclusivamente texto-a-texto; no soporta visión, audio ni otras modalidades.

## Enlaces

- Modelo en Hugging Face (esta variante): https://huggingface.co/RedHatAI/Laguna-XS.2-NVFP4
- Modelo BF16 original: https://huggingface.co/poolside/Laguna-XS.2
- Variante FP8: https://huggingface.co/poolside/Laguna-XS.2-FP8
- Variante INT4: https://huggingface.co/poolside/Laguna-XS.2-INT4
- Blog de lanzamiento: https://poolside.ai/blog/laguna-a-deeper-dive
- Demo en Shimmer: https://shimmer.poolside.ai
- API key de Poolside: https://platform.poolside.ai
- Agent harness de Poolside: https://github.com/poolsideai/pool
- Ollama: https://ollama.com/library/laguna-xs.2
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Política de privacidad de Poolside: https://poolside.ai/legal/privacy
