# laion/snowball-67b-a2b-msa-relay-sft-step2394

## Resumen

snowball-67b-a2b-msa-relay-sft-step2394 (denominado internamente "msafin") es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por LAION, con 67.078.882.816 parametros totales y aproximadamente 2.000 millones de parametros activos por token. Se trata de un fine-tuning del modelo base "Grug Datakit SFT 09-21" (67B total / 2B activos), especializado en tareas de codigo agentico mediante el agente mini-swe-agent 2.4.6 en modo tool-call, con una unica herramienta `bash` y observaciones en formato JSON.

El modelo se ha entrenado sobre 22.372 trazas orientadas a resolucion de tareas de ingenieria de software: 6.040 filas de relevo (relay) en tareas de terminal, 11.547 trayectorias SWE de microsoft/Orchard generadas por MiniMax-M2.5 y 4.785 trayectorias de Self-Improving-Coding-Agents/SI2CA generadas por Qwen3.5-122B-A10B. El entrenamiento se realizo en TACC Horizon con una tasa de aprendizaje de 3e-4, 3 pasadas (2.394 pasos) y 16 secuencias de 65.536 tokens por paso.

Su relevancia radica en que es un ejemplo de modelo MoE de gran tamano total pero bajo coste de inferencia por token (solo 2B activos), afinado especificamente para flujos agenticos de reparacion de errores en repositorios de codigo, con mejoras medibles respecto a su predecesor en SWE-bench Verified, Terminal-Bench y OpenThoughts-TBLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag grug_moe), transformer |
| Parametros totales | 67.078.882.816 (~67B) |
| Parametros activos | ~2B |
| Longitud de contexto | 65.536 tokens (usado en entrenamiento y evaluacion; no se confirma si es el maximo arquitectonico) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo Mixture of Experts con un total de 67B parametros y enrutamiento disperso que activa aproximadamente 2B parametros por token. El tag `grug_moe` de HuggingFace y el tipo de tensor BF16 confirman pesos publicados en precision bfloat16. Durante el fine-tuning el sesgo del router (router bias) se mantuvo congelado, lo que implica que la politica de enrutamiento heredada del modelo base permanecio fija mientras se ajustaban los expertos y el resto de pesos.

El entrenamiento se realizo sobre 22.372 trazas de codigo agentico, todas renderizadas exactamente como las sirve el host mini-swe-agent de Harbor. La composicion del dataset incluye 6.040 filas de relevo en tareas de terminal (Qwen3.8-27B tomando el relevo del estudiante 09-21, con los turnos del estudiante enmascarados) y 11.547 trayectorias SWE de microsoft/Orchard generadas por MiniMax-M2.5 (SWE-rebench mas Scale-SWE, licencia MIT), asi como 4.785 trayectorias de Self-Improving-Coding-Agents/SI2CA generadas por Qwen3.5-122B-A10B (SWE-rebench-V2 mas SWE-smith, licencia CC-BY-4.0). Segun la model card, no se incluyo ninguna instancia de SWE-bench Verified ni canarios de benchmark en los datos. La configuracion de entrenamiento fue LR 3e-4, 3 pasadas (2.394 pasos) y 16 secuencias de 65.536 tokens por paso, ejecutado en TACC Horizon.

## Capacidades

- Generacion de codigo y reparacion de errores en repositorios reales dentro de flujos agenticos (SWE).
- Uso de tool calling en modo unico: una herramienta `bash` con observaciones devueltas en JSON.
- Razonamiento multi-paso orientado a terminal: el modelo opera el ciclo observacion-accion-observacion propio de mini-swe-agent 2.4.6.
- Ejecucion de comandos de shell y lectura de resultados de terminal para iterar sobre tareas de ingenieria.
- Autonomia agentica tipo relay: puede tomar el relevo de otro agente en una tarea en curso (turnos previos enmascarados en entrenamiento).
- No hay evidencia en la informacion disponible de capacidades de vision, audio, tool calling multiple ni modos de "thinking" explicitos.
- Idiomas soportados: no disponible.

## Casos de uso

- Reparacion automatica de issues en repositorios: el modelo puede recibir un repositorio y un fallo, ejecutar comandos `bash` para reproducir el error, inspeccionar el codigo y proponer un parche, gracias a su entrenamiento sobre 11.547 trayectorias SWE reales.
- Agentes de terminal autonoma: integrable en mini-swe-agent 2.4.6 como controlador que emite comandos `bash` y consume observaciones JSON en cada paso.
- Agente de relevo en pipelines multiagente: puede asumir una tarea a mitad de ejecucion iniciada por otro agente, aprovechando el entrenamiento especifico sobre filas de relevo con turnos previos enmascarados.
- Automatizacion de tareas de DevOps: ejecucion de comandos de shell para despliegues, diagnostico de entornos y verificacion de estado, dado su formato de salida basado en `bash`.
- Resolucion de tareas de codigo en benchmarks de terminal: uso directo sobre Terminal-Bench y conjuntos similares, donde obtuvo un 13,8 % de pass@1.
- Generacion asistida de parches en CI/CD: el modelo puede integrarse en un paso de pipeline que recibe un test fallido, explora el repositorio y produce una modificacion candidata para validacion automatica.
- Data generation para entrenamiento de agentes: al ser un modelo de 2B parametros activos, puede usarse para generar trazas de codigo a bajo coste por token.

## Benchmarks y rendimiento

Evaluacion en mini-swe-agent 2.4.6 modo tool, sin reenviar razonamiento previo, contexto de 65.536 tokens, pass@1 sobre 3 ejecuciones:

| Benchmark | step2394 (este modelo) | Estudiante 09-21 |
|---|---|---|
| TB2.1 | 13,8 % | 8,1 % |
| SWE-bench Verified (random-100) | 37,4 % | 26,8 % |
| OpenThoughts-TBLite | 22,0 % | 16,7 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: el repositorio pesa 134,2 GB, por lo que la inferencia en precision completa requiere aproximadamente 134 GB de memoria de GPU (o repartida entre varias).
- VRAM en cuantizacion: no disponible en la informacion proporcionada; al ser MoE con 2B activos, una cuantizacion a 4 bits reduciria sustancialmente los requisitos, pero no se ofrecen cifras ni pesos cuantizados publicados.
- GPUs recomendadas: no disponible de forma explicita; por tamano, se necesitarian configuraciones multi-GPU (por ejemplo A100 80 GB, H100 80 GB) para BF16.
- Consumer GPU: no cabe en una GPU de consumo en BF16 (134 GB). En cuantizacion agresiva seria posible en teoria, pero no hay artefactos cuantizados publicados ni confirmacion.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Se pueden citar otros modelos de la misma familia LAION snowball-67b-a2b, aunque sin resultados de rendimiento comparables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| snowball-67b-a2b-msa-relay-sft-step2394 | 67B total / 2B activos | 65.536 tokens | no disponible | HuggingFace |
| snowball-67b-a2b-relay-sft-a-step246 | 67B | no disponible | no disponible | HuggingFace |
| snowball-67b-a2b-relay-sft-allkimi-step1203 | 67B total / 2B activos | no disponible | no disponible | HuggingFace |
| snowball-67b-a2b-sft-ota-rl-r2egym-step30 | 67B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El dataset esta compuesto por trazas de codigo y terminal, lo que puede sesgar el modelo hacia ese dominio y degradar su comportamiento generalista.
- Riesgo de alucinacion: no evaluado de forma explicita en la informacion disponible; como modelo agentico de codigo, puede generar comandos o parches plausibles pero incorrectos.
- Limitaciones de contexto: el contexto de 65.536 tokens se empleo en entrenamiento y evaluacion, pero no se confirma que sea el limite arquitectonico maximo.
- Limitaciones de idioma: no disponible; no se documentan idiomas soportados.
- Restricciones de licencia: la licencia del modelo no esta especificada en la informacion disponible; parte de los datos de entrenamiento proceden de fuentes con licencias MIT y CC-BY-4.0, pero eso no determina la licencia del modelo resultante. Debe verificarse antes de cualquier uso comercial.
- Caveat de produccion: el modelo esta especializado en el formato exacto de mini-swe-agent 2.4.6 (una herramienta `bash`, observaciones JSON); usarlo con otros formatos de tool calling puede degradar su rendimiento.
- El modelo tiene 0 descargas y 0 likes, y no hay model card publica mas alla del fragmento facilitado, por lo que no existe validacion externa independiente.
- Las fechas del repositorio (2026) y de entrenamiento son posteriores a la fecha habitual de referencia; conviene tratarlas como datos tal cual figuran en la fuente.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/laion/snowball-67b-a2b-msa-relay-sft-step2394
- HuggingFace (modelo relacionado): https://huggingface.co/laion/snowball-67b-a2b-relay-sft-a-step246
- HuggingFace (modelo relacionado): https://huggingface.co/laion/snowball-67b-a2b-relay-sft-allkimi-step1203
- HuggingFace (modelo relacionado): https://huggingface.co/laion/snowball-67b-a2b-sft-ota-rl-r2egym-step30
- HuggingFace (modelo relacionado): https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-oldstack-step24
- Página de LAION: https://laion.ai/
