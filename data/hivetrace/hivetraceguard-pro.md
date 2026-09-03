# hivetrace/HiveTraceGuard-Pro

## Resumen

HiveTraceGuard-Pro es un guardrail compacto de clasificación de seguridad desarrollado por hivetrace, construido sobre el modelo base Qwen/Qwen3-0.6B. Su propósito es actuar como filtro de entrada y salida para sistemas basados en LLM y agentes, detectando contenido dañino, jailbreaks, inyección de prompts, ofuscación e intentos de secuestro de agentes con herramientas. El modelo es stateless y devuelve exactamente un token: `safe` o `unsafe`, lo que lo hace extremadamente rápido y fácil de integrar en pipelines de moderación.

Con 596 millones de parámetros, es un modelo muy ligero que puede ejecutarse en hardware modesto, incluso en CPU. Está entrenado principalmente para ruso e inglés, con un enfoque especial en el ruso, y su licencia Apache-2.0 permite uso comercial sin restricciones. Su relevancia actual radica en la creciente necesidad de proteger aplicaciones de IA generativa contra ataques de inyección de prompts y contenido no seguro, especialmente en entornos de producción con agentes autónomos.

El modelo se distribuye en formato safetensors y es compatible con los principales runtimes de inferencia como vLLM, SGLang y Transformers. Incluye un reporte técnico en arXiv (2609.01046) y una demo en Google Colab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en vLLM; no especificada en la model card) |
| Tipos de cuantizacion | bfloat16 (por defecto en el repo); no se documentan otras cuantizaciones |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HiveTraceGuard-Pro es un fine-tuning del modelo Qwen3-0.6B, un transformer decoder-only de 0,6B parametros. La arquitectura base es la de Qwen3, que incluye atencion por ventanas deslizantes y mecanismos de atencion estandar. El fine-tuning se ha realizado especificamente para la tarea de clasificacion binaria de seguridad, de modo que el modelo genera unicamente el token `safe` o `unsafe` como respuesta.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La model card menciona un reporte tecnico en arXiv (2609.01046) que probablemente contiene esa informacion, pero no esta disponible en los datos proporcionados. El modelo esta disenado para ser stateless y aprovechar el prefix caching en runtimes como vLLM, lo que permite reutilizar el contexto compartido en multiples llamadas.

## Capacidades

- Clasificacion de contenido dañino en solicitudes de usuario (input guard) y en respuestas del modelo (output guard).
- Deteccion de jailbreaks, inyeccion de prompts, ofuscacion y ataques de red teaming.
- Deteccion de intentos de secuestro de agentes con herramientas (tool-using agents).
- Soporte bilingue ruso-ingles, con especial enfasis en ruso (mejores resultados en benchmarks internos RU).
- Salida determinista de un unico token (`safe` o `unsafe`), lo que facilita la integracion en pipelines de moderacion.
- Capacidad de calcular una puntuacion continua P(unsafe) a partir de los logits de los dos tokens de veredicto.
- Compatible con LogitsProcessor para restringir la generacion a los dos veredictos.
- No es un modelo de generacion de texto general; su unica funcion es la clasificacion de seguridad.

## Casos de uso

- Moderacion de contenido en aplicaciones de chat: el modelo puede analizar cada mensaje de usuario y cada respuesta del asistente antes de mostrarla, bloqueando contenido dañino o inapropiado en tiempo real. Su baja latencia (un solo token de salida) lo hace adecuado para flujos de alto volumen.
- Proteccion de agentes con herramientas contra inyeccion de prompts: antes de que un agente ejecute una herramienta, se puede pasar la solicitud por HiveTraceGuard-Pro para detectar intentos de manipular el agente para que realice acciones no autorizadas.
- Filtrado de respuestas generadas por LLM en produccion: integrar el modelo como output guard en un pipeline de generacion para evitar que el LLM publique contenido toxico, sesgado o peligroso, especialmente en entornos regulados.
- Cumplimiento normativo en plataformas de contenido generado por usuarios: usar el modelo como primer filtro automatico para detectar discurso de odio, violencia o contenido ilegal, complementando sistemas de moderacion humana.
- Evaluacion de seguridad de prompts en entornos de desarrollo: los equipos de IA pueden usar el modelo para probar automaticamente si sus prompts son vulnerables a jailbreaks o inyecciones, integrándolo en suites de testing.
- Monitorizacion de sistemas multiagente: en arquitecturas donde varios agentes interactuan entre si, el modelo puede supervisar las comunicaciones internas para detectar comportamientos anomalos o intentos de secuestro.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor. Se presentan tal cual, sin modificaciones.

### Deteccion de contenido dañino

| Modelo | AEGIS 2.0 (Req) | ToxicChat (Req) | XSTest (Req) | XSafety EN (Req) | OpenAI Moderation (Req) | AEGIS 2.0 (Resp) | BeaverTails (Resp) | HarmBench (Resp) |
|---|---|---|---|---|---|---|---|---|
| **HiveTraceGuard-Pro (0.6B)** | 0.817 | 0.588 | 0.754 | 0.590 | **0.803** | 0.797 | 0.839 | 0.814 |
| Shieldstral-1.0-3B | 0.808 | **0.732** | **0.922** | **0.595** | 0.794 | 0.766 | 0.828 | 0.854 |
| YuFeng-XGuard-Reason-0.6B | **0.847** | 0.620 | 0.920 | 0.469 | 0.787 | 0.789 | 0.828 | **0.858** |
| Qwen3Guard-Gen-0.6B | 0.788 | 0.692 | 0.861 | 0.580 | 0.715 | **0.819** | **0.845** | 0.856 |
| Llama-Guard-3-1B | 0.733 | 0.385 | 0.837 | 0.368 | 0.766 | 0.635 | 0.652 | 0.794 |

### Deteccion de ataques y jailbreaks

| Modelo | S-Eval Base | S-Eval Attack | HarmBench Req Standard | HarmBench Req Contextual | OR-Bench Toxic | MultiJail EN | SimpleSafety Tests | CSRT | Aya RU | Aya EN | Prompt Injection RU | Prompt Injection EN | Robustness Real Harm | Robustness Robust Harm |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **HiveTraceGuard-Pro (0.6B)** | 0.710 | 0.802 | 0.862 | 0.667 | 0.915 | 0.746 | 0.910 | 0.743 | **0.952** | **0.917** | **0.999** | **0.877** | **0.954** | **0.872** |
| Shieldstral-1.0-3B | 0.731 | 0.611 | **0.987** | 0.951 | **0.997** | **0.946** | **1.000** | **0.895** | 0.938 | **0.917** | 0.836 | 0.741 | 0.867 | 0.762 |
| YuFeng-XGuard-Reason-0.6B | **0.794** | **0.954** | (datos no completos en la informacion proporcionada) | | | | | | | | | | | |

Nota: la tabla original de la model card se corta en la fila de YuFeng-XGuard-Reason-0.6B; los datos restantes no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 1,2 GB. Con overhead de activaciones y KV cache, se recomienda al menos 2-3 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, etc. Tambien puede ejecutarse en GPU de datacenter como A100 o H100, aunque no es necesario.
- Compatible con CPU: al ser un modelo de 0,6B, puede ejecutarse en CPU con razonable latencia (del orden de decenas de milisegundos por consulta).
- Opciones de despliegue: vLLM (con prefix caching), SGLang, Transformers (con LogitsProcessor), y potencialmente llama.cpp si se convierte a GGUF (no documentado oficialmente).
- Latencia y throughput: al generar un unico token, la latencia es minima. En GPU, se pueden procesar cientos de consultas por segundo; en CPU, decenas por segundo. No se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Punto fuerte |
|---|---|---|---|---|---|---|
| **HiveTraceGuard-Pro** | 0,6B | 32k (recomendado) | ru, en | Apache-2.0 | safetensors | Mejor en ruso, robusto ante ofuscacion |
| Shieldstral-1.0-3B | 3B | no disponible | en (principal) | no disponible | safetensors | Mejor en benchmarks ingleses de jailbreak |
| YuFeng-XGuard-Reason-0.6B | 0,6B | no disponible | en, zh (probable) | no disponible | safetensors | Buen rendimiento en S-Eval Attack |
| Qwen3Guard-Gen-0.6B | 0,6B | no disponible | en, zh (probable) | no disponible | safetensors | Buen equilibrio en deteccion de respuestas |
| Llama-Guard-3-1B | 1B | no disponible | en (principal) | Llama License | safetensors | Referencia de Meta, pero inferior en la mayoria de benchmarks |

HiveTraceGuard-Pro destaca especialmente en deteccion de inyeccion de prompts en ruso (0.999) y en robustez ante ataques ofuscados (0.872), superando a modelos mas grandes como Shieldstral-3B en esos aspectos. Sin embargo, es superado por Shieldstral en benchmarks ingleses estandar como XSTest y HarmBench.

## Limitaciones y advertencias

- Solo soporta ruso e ingles; no funciona en otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Es un clasificador binario, no un modelo de generacion; no puede producir explicaciones ni justificaciones de sus veredictos.
- Puede tener falsos positivos (marcar contenido seguro como inseguro) o falsos negativos, especialmente en contextos ambiguos o con lenguaje figurativo.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre posibles sesgos; se recomienda evaluar en el dominio especifico antes de desplegar en produccion.
- La longitud de contexto no esta documentada oficialmente; el valor de 32k proviene de la configuracion de ejemplo en vLLM, pero el modelo base Qwen3-0.6B soporta hasta 32k tokens, por lo que es probable que sea el limite real.
- No se garantiza la robustez frente a ataques adversariales avanzados no cubiertos en los benchmarks; la evaluacion interna muestra buena resistencia, pero no es absoluta.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B tiene su propia licencia (Apache-2.0 tambien), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- HuggingFace: https://huggingface.co/hivetrace/HiveTraceGuard-Pro
- Reporte tecnico (arXiv): https://arxiv.org/abs/2609.01046
- Demo en Google Colab: https://colab.research.google.com/drive/1VxlqPiiqdqJFhcm6sc2wo2TAJnHlyPlU?usp=sharing
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
