# cortexrouter/judge-v1

## Resumen

CortexRouter Judge v1 es un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B, desarrollado por CortexRouter, especializado en la verificacion de evidencias de vulnerabilidades en aplicaciones web y en la generacion de informes de decision estructurados en turco. El modelo recibe la evidencia de una prueba de seguridad (por ejemplo, la salida de una peticion HTTP o un fragmento de respuesta del servidor) y emite un veredicto clasificado en una de tres categorias: `DOĞRULANDI` (verificado), `ETKİSİZ` (sin efecto) o `YANLIŞ_POZİTİF` (falso positivo).

El modelo no es un modelo fundacional nuevo, sino un adaptador PEFT que conserva intactos los pesos de Qwen3-8B (8.000 millones de parametros, licencia Apache 2.0, Alibaba Group). Su relevancia radica en que aborda una tarea concreta y de alto valor operativo en ciberseguridad: reducir los falsos positivos de los escaneres de vulnerabilidades mediante una evaluacion semantica de la evidencia, en lugar de una simple coincidencia de patrones.

La especializacion es estrecha: el modelo esta optimizado para turco (con soporte funcional pero no optimizado para ingles), cubre exclusivamente vulnerabilidades de aplicaciones web, acepta evidencia en texto de hasta aproximadamente 768 tokens y esta pensado para integrarse como componente de juicio dentro de un motor de escaneo, nunca como sustituto de la revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card limita la evidencia de entrada a unos 768 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16 para inferencia) |
| Idiomas soportados | Turco (optimizado) e ingles (funcional, no optimizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros. Los pesos del modelo base no se modificaron; el adaptador se carga mediante la libreria PEFT y se combina con el modelo base en tiempo de inferencia. La model card no detalla el rango del adaptador, las capas objetivo ni la composicion exacta del dataset de entrenamiento.

El entrenamiento se orienta a una tarea de juicio estructurado: dado un contexto de prueba de seguridad, el modelo debe producir un informe de nueve campos (entorno objetivo, identidad de la vulnerabilidad, categoria, pasos de prueba, evidencia observada, decision, justificacion, confianza y fuente). La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La evaluacion publicada se realizo sobre un holdout limpio de 20 CVE por 4 escenarios (80 preguntas), con el prompt recomendado por el autor y decodificacion determinista (temperatura 0).

## Capacidades

- Generacion de informes de decision estructurados en turco con nueve campos fijos.
- Clasificacion de evidencias de vulnerabilidad en tres clases: verificado, sin efecto y falso positivo.
- Razonamiento sobre evidencia textual de pruebas de seguridad (respuestas HTTP, fragmentos de ficheros, salidas de comandos).
- Evaluacion de escenarios de parcheo (por ejemplo, respuestas 404), modulos deshabilitados y casos ambiguos (paginas de inicio).
- Soporte de conversacion multi-turno mediante plantilla de chat (chat template) compatible con transformers y vLLM.
- Despliegue como modulo LoRA en vLLM mediante `--enable-lora` y `--lora-modules`.
- Soporte funcional de ingles, aunque no optimizado.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento explicito documentados.

## Casos de uso

- Triaje de falsos positivos en escaneres de vulnerabilidades web: el modelo recibe la evidencia bruta de cada hallazgo y emite un veredicto que permite descartar falsos positivos antes de que lleguen al analista, reduciendo la carga de revision manual.
- Verificacion de parcheo tras una remediacion: dado el resultado de una nueva prueba contra un objetivo previamente vulnerable, el modelo determina si la vulnerabilidad sigue siendo explotable o si el parche es efectivo (escenario B de la evaluacion, con respuestas 404).
- Generacion de informes de pentest en turco: el modelo produce directamente el informe estructurado de nueve campos, listo para incorporarse a un entregable o a un sistema de ticketing.
- Integracion en pipelines de CI/CD de seguridad: desplegado con vLLM como modulo LoRA, puede servirse mediante API compatible con OpenAI y consultarse desde un job automatizado que procese los hallazgos de cada build.
- Deteccion de modulos deshabilitados o servicios inaccesibles: el modelo distingue entre una vulnerabilidad real y un servicio que simplemente no esta expuesto (escenario C), evitando escalados innecesarios.
- Priorizacion de hallazgos en un SOC: al asignar un nivel de confianza y una justificacion, el modelo permite ordenar los hallazgos por criticidad verificada antes de la intervencion humana.
- Formacion y simulacion en laboratorios aislados: el modelo puede emplearse para evaluar evidencias generadas en entornos de practica, siempre con autorizacion explicita.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion propia del autor sobre un holdout limpio de 20 CVE por 4 escenarios (80 preguntas), con el prompt recomendado y decodificacion determinista:

| Escenario | Descripcion | Aciertos | Precision |
|---|---|---|---|
| A | Evidencia presente | 13/13 | 100 % |
| B | Parcheado (404) | 13/13 | 100 % |
| C | Modulo deshabilitado | 12/12 | 100 % |
| D | Ambiguo (pagina de inicio) | 12/12 | 100 % |
| Total | | 80/80 | 100 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la medicion se realizo con el prompt recomendado y que los resultados pueden variar con otros prompts, motivo por el cual el holdout se publica abiertamente en `eval/holdout.jsonl` junto con el script `eval/run_eval.py`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos del modelo base de 8.000 millones de parametros, mas el adaptador LoRA y el overhead de activaciones y cache KV; en la practica se recomienda un minimo de 20-24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16. En GPUs consumer de 16 GB seria necesario recurrir a cuantizacion del modelo base, no documentada por el autor.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bfloat16; en GPUs de 16 GB requiere cuantizacion del modelo base.
- Opciones de despliegue: transformers con PEFT (documentado), vLLM con `--enable-lora` y `--lora-modules` (documentado). llama.cpp, Ollama y TGI no estan documentados por el autor.
- Latencia y throughput: no disponibles. La generacion se documenta con `max_new_tokens=700` y decodificacion greedy.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especializados en verificacion de evidencias de vulnerabilidades con salida estructurada en turco. Como referencia, se compara con el modelo base y con la alternativa generica:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CortexRouter Judge v1 | 8.000 M (base) + LoRA | no disponible (evidencia ~768 tokens) | Verificacion de vulnerabilidades web, salida estructurada en turco | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-8B | 8.000 M | no disponible en la informacion proporcionada | Proposito general | Apache 2.0 | Hugging Face |
| Modelos genericos de 7-8 B (p. ej. Llama 3.1 8B) | 8.000 M | no disponible en la informacion proporcionada | Proposito general | Licencia propia | Hugging Face |

La comparativa con modelos especializados en ciberseguridad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: optimizado para turco; el ingles funciona pero no esta optimizado, por lo que el rendimiento en ingles puede degradarse.
- Kapsa limitado: cubre exclusivamente vulnerabilidades de aplicaciones web; no esta disenado para otros dominios de seguridad.
- Tipo de evidencia: solo texto; no admite evidencia binaria ni hexadecimal.
- Longitud: la evidencia de entrada se limita a aproximadamente 768 tokens.
- Alucinacion en campos no relacionados con la decision: el modelo puede inventar informacion sobre empresa, infraestructura u otros datos desconocidos.
- No apto para produccion en solitario: debe interpretar la evidencia de un motor de escaneo, no sustituirlo.
- No sustituye la supervision humana: los informes generados deben ser verificados por una persona.
- Uso etico restringido: solo debe emplearse en objetivos con titularidad verificada, con divulgacion responsable (CVD) y nunca para explotacion automatica, decisiones legales o infraestructura critica sin supervision humana.
- Evaluacion limitada: el 100 % de precision se obtuvo sobre 80 preguntas con el prompt recomendado; no hay validacion independiente ni benchmarks estandar publicados.
- Licencia Apache 2.0: permite uso comercial, pero el autor impone restricciones eticas de uso que no son juridicamente vinculantes bajo dicha licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortexrouter/judge-v1
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de evaluacion: `eval/holdout.jsonl` y `eval/run_eval.py` incluidos en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
