# nace-ai/Qwen3.8-Flash-Next-GGUF-KQuant

## Resumen
El repositorio `nace-ai/Qwen3.8-Flash-Next-GGUF-KQuant` es una cuantización en formato GGUF del modelo base `Qwen/Qwen3.8-Flash-Next`, publicada por el usuario nace-ai bajo licencia Apache 2.0. No se trata de un modelo original, sino de una conversión optimizada para su uso con llama.cpp, LM Studio y Ollama, con el objetivo de reducir los requisitos de memoria manteniendo una fidelidad alta respecto al modelo en BF16. El modelo base cuenta con 176.943.899.520 parámetros (aproximadamente 177.000 millones), lo que lo sitúa en la categoría de modelos de gran escala.

La aportación principal de esta ficha es la cuantización `IQ4_XS`, que ocupa 93,44 GB y presenta una divergencia media (KL) de 0,063 respecto al modelo BF16. Según la model card, este resultado es ligeramente mejor que el de la cuantización equivalente de Unsloth (`UD-IQ4_XS`, 93,66 GB, KL 0,073), lo que la convierte en una opción competitiva para desplegar un modelo de ~177B en entornos con recursos limitados de VRAM o RAM.

La relevancia actual radica en la posibilidad de ejecutar un modelo de esta escala en hardware de gama alta para consumidores o en servidores con GPUs de 80 GB, algo que sin cuantización sería inviable. La ficha se centra en las características de la cuantización y en los datos de fidelidad publicados, dado que no se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; no se detalla en la información proporcionada) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 128K tokens (evaluado en la model card a 128K; contexto máximo no confirmado) |
| Tipos de cuantizacion | GGUF IQ4_XS (único archivo publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-Flash-Next` en la documentación proporcionada. La model card de esta cuantización no describe la arquitectura (transformer, MoE, híbrida, etc.), los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

La información disponible se centra exclusivamente en el proceso de cuantización: se ha generado un archivo GGUF con cuantización `IQ4_XS` utilizando la herramienta de cuantización de llama.cpp, con una evaluación de fidelidad respecto al modelo BF16 mediante divergencia KL sobre ventanas de texto held-out (artículos de Wikipedia en inglés, datos de chat y tool-calls, y código de GitHub, todos creados después del 20 de septiembre de 2026). Se utilizaron 64 ventanas y 32.704 tokens, con la misma build de llama.cpp (f7b886fe) para todos los archivos comparados. El tamaño del modelo de lenguaje (LM GB) excluye visión y MTP.

## Capacidades
- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-Flash-Next.
- Soporte de tool calling y function calling, según se desprende de la evaluación realizada sobre datos de chat y tool-calls en la model card.
- Capacidad de razonamiento multi-turno y contexto largo, evaluado hasta 128K tokens.
- Generación de código, evaluada específicamente sobre datos de GitHub en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Despliegue de un modelo de ~177B en servidores con GPUs de 80 GB: la cuantización IQ4_XS (93,44 GB) permite cargar el modelo en una sola GPU A100/H100 de 80 GB o en dos GPUs de 48 GB, algo inviable con el modelo en BF16.
- Inferencia local en estaciones de trabajo de gama alta: con 93,44 GB, el modelo puede ejecutarse en sistemas con 128 GB de RAM y GPUs consumer de 24 GB en configuraciones multi-GPU (por ejemplo, 4x RTX 4090), usando llama.cpp con offloading parcial.
- Asistentes conversacionales de contexto largo: la evaluación a 128K tokens y la baja divergencia KL en datos de chat (0,112 en chat y tool-calls) lo hacen adecuado para conversaciones multi-turno con historiales extensos.
- Generación de código en pipelines de CI/CD: la baja KL en código (0,043) y el soporte de tool calling permiten integrarlo en herramientas de revisión automática o generación de parches.
- Evaluación comparativa de cuantizaciones: el repositorio incluye datos detallados de KL, top-1 y percentiles, útil para investigadores que necesiten elegir un archivo GGUF para su hardware.
- Experimentación en investigación con modelos de gran escala: al estar bajo licencia Apache 2.0, permite su uso en entornos académicos y comerciales sin restricciones adicionales.
- Sustitución de APIs propietarias en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del sistema.

## Benchmarks y rendimiento
La model card proporciona datos de fidelidad (divergencia KL respecto a BF16) y precisión en tareas (MMLU, ARC-Challenge, Winogrande) comparando archivos GGUF. No se han publicado resultados de benchmarks estándar (MMLU absoluto, HumanEval, GSM8K) en la información disponible; los datos de la model card son comparaciones relativas entre archivos, no puntuaciones absolutas.

| Metrica | IQ4_XS (este repo) | Unsloth UD-IQ4_XS | Diferencia |
|---|---|---|---|
| Tamano LM (GB) | 93,44 | 93,66 | -0,22 |
| KL media (todos los tokens) | 0,063 | 0,073 | -0,010 (IC 95%: -0,013 a -0,008) |
| KL media (solo tokens de respuesta) | 0,087 | no disponible | - |
| p99.9 KL | 2,126 | no disponible | - |
| Top-1 (%) | 91,3 | no disponible | - |

Datos a 128K tokens (prosa):
| Archivo | LM GB | KL media | p99.9 KL | Top-1 % |
|---|---:|---:|---:|---:|
| IQ4_XS (este repo) | 93,44 | 0,041 | 2,530 | 92,5 |
| Unsloth UD-IQ4_XS | 93,66 | 0,045 | 1,917 | 91,9 |
| bartowski IQ4_XS | 97,67 | 0,053 | 1,407 | 90,3 |

Datos a 128K tokens (chat y tool calls):
| Archivo | LM GB | KL media | Todos los tokens | p99.9 KL | Top-1 % |
|---|---:|---:|---:|---:|---:|
| IQ4_XS (este repo) | 93,44 | 0,112 | 0,412 | 5,602 | 90,6 |
| Unsloth UD-IQ4_XS | 93,66 | 0,120 | 0,426 | 5,847 | 90,4 |
| bartowski IQ4_XS | 97,67 | 0,228 | 0,613 | 9,286 | 87,5 |

Datos a 128K tokens (código):
| Archivo | LM GB | KL media | p99.9 KL | Top-1 % |
|---|---:|---:|---:|---:|
| IQ4_XS (este repo) | 93,44 | 0,043 | 1,946 | 94,7 |
| Unsloth UD-IQ4_XS | 93,66 | 0,046 | 1,922 | 94,5 |
| bartowski IQ4_XS | 97,67 | 0,071 | 2,909 | 93,0 |

En la comparación con EXL3 (solo CUDA), el archivo groxaxo 3.50 (97,12 GB) obtiene KL media 0,0627 frente a 0,0629 de IQ4_XS, sin intervalo pareado disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo IQ4_XS ocupa 93,44 GB en disco; en memoria, se requiere al menos esa cantidad más overhead de contexto (para 128K tokens, se recomienda 100-110 GB de VRAM/RAM combinada).
- GPU recomendadas: 2x A100 80GB, 2x H100 80GB, o 4x RTX 4090 24GB (con offloading parcial a RAM del sistema).
- Cabe en consumer GPU: no en una sola GPU consumer; sí en configuraciones multi-GPU con 4x RTX 4090 (96 GB) o superior, con posible offloading.
- Opciones de despliegue: llama.cpp (build f7b886fe o superior), LM Studio, Ollama. No se menciona soporte para vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
La comparación se realiza con otras cuantizaciones del mismo modelo base, ya que no se dispone de información sobre modelos alternativos de la misma categoría.

| Modelo / archivo | Parametros | Contexto | KL media (prosa 128K) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| nace-ai IQ4_XS (este repo) | ~177B | 128K | 0,041 | Apache 2.0 | Hugging Face |
| Unsloth UD-IQ4_XS | ~177B | 128K | 0,045 | Apache 2.0 | Hugging Face |
| bartowski IQ4_XS | ~177B | 128K | 0,053 | Apache 2.0 | Hugging Face |
| mradermacher i1-IQ4_XS | ~177B | 128K | 0,092 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información proporcionada; los modelos de gran escala pueden generar contenido plausible pero incorrecto.
- Limitaciones de contexto o idioma: el contexto evaluado es de 128K tokens; no se confirma el máximo real. Los idiomas soportados no están documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y el aviso de licencia. No se especifican restricciones adicionales del modelo base.
- Caveats para producción: la cuantización IQ4_XS introduce una divergencia KL de 0,063 respecto a BF16, lo que puede afectar a tareas de alta precisión. El archivo es grande (93,44 GB) y requiere hardware específico. La build de llama.cpp utilizada (f7b886fe) puede no ser compatible con versiones anteriores. No se han publicado benchmarks absolutos, solo comparaciones relativas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- llama.cpp (build f7b886fe): no se proporciona enlace directo en la información disponible.
- Herramienta de cuantización: no se proporciona enlace directo en la información disponible.
- Paper o blog: no disponibles en la información proporcionada.
