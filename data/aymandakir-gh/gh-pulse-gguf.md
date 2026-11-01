# aymandakir-gh/gh-pulse-GGUF

## Resumen

GH Pulse es un ajuste fino mediante LoRA del modelo Qwen3-1.7B (Apache-2.0) desarrollado por la agencia italiana de growth marketing Growthackers, como parte de su familia abierta GH AI (junto a GH Spark de 0,6B y GH Apex de 4B). El modelo esta especializado en asistencia de marketing de crecimiento: playbooks, biblioteca de metricas, glosario y notas sobre adquisicion, contenido, SEO, CRO y herramientas de IA. Se distribuye en formato GGUF, lo que facilita su despliegue en entornos con recursos limitados.

El problema que resuelve es acotar el comportamiento de un modelo pequeno de proposito general hacia un dominio vertical concreto, manteniendo la licencia permisiva del modelo base y un coste de inferencia minimo. Segun el autor, el entrenamiento se realizo en la CPU de un unico portatil, lo que subraya el caracter ligero del proyecto.

Con 1.720.574.976 parametros reales (segun safetensors), arquitectura transformer densa heredada de Qwen3 y un repo de 4,0 GB que incluye las distintas cuantizaciones GGUF, GH Pulse es relevante ahora por dos motivos: la popularidad de los modelos pequenos especializados para tareas de nicho y la posibilidad de ejecutarlo localmente en hardware de consumo. No se dispone de informacion publica sobre la longitud de contexto nativa del ajuste, aunque los ejemplos del autor usan 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma oficial; los ejemplos del autor usan `-c 8192` |
| Tipos de cuantizacion | GGUF (el autor menciona Q4_K_M; el resto de variantes no se detalla) |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 4,0 GB) |

## Arquitectura y entrenamiento

GH Pulse parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, sobre el que se aplica un ajuste fino con LoRA. El autor indica que el entrenamiento se realizo en la CPU de un unico portatil, lo que implica un presupuesto computacional muy reducido y, previsiblemente, un volumen de datos limitado. Los datos de entrenamiento combinan el conocimiento publico de Growthackers sobre growth marketing (playbooks, biblioteca de metricas, glosario, notas de adquisicion, contenido, SEO, CRO y herramientas de IA) con una porcion de conversacion general abierta procedente de HuggingFaceTB/smoltalk (Apache-2.0).

El autor documenta un proceso de depuracion de datos orientado a la privacidad: se eliminaron notas que mencionaban clientes, se anonimizaron nombres, correos, telefonos, IBAN, identificadores de cuentas publicitarias y claves de API, y se excluyo por completo material de RRHH, finanzas, socios, legal y exito de cliente. No se menciona el uso de RLHF ni DPO. El modelo esta pensado para operar en modo no-thinking (`enable_thinking=False`), y el system prompt de GH viene preconfigurado en el Modelfile de Ollama. No se detalla ninguna innovacion arquitectonica adicional mas alla del ajuste LoRA.

## Capacidades

- Generacion de texto conversacional orientada a marketing de crecimiento (playbooks, metricas, SEO, CRO, adquisicion y contenido).
- Consulta de un glosario y biblioteca de metricas del dominio, segun los datos de entrenamiento declarados.
- Conversacion general en italiano e ingles gracias a la porcion de smoltalk.
- Soporte de API compatible con OpenAI mediante `llama-server` con la flag `--jinja`.
- Despliegue local via Ollama con un Modelfile que incorpora el system prompt del dominio.
- Modo no-thinking recomendado por el autor para este ajuste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente interno de marketing: el modelo puede responder consultas sobre metricas, glosario y playbooks de growth, aprovechando el ajuste sobre la base de conocimiento publica de Growthackers.
- Generacion de borradores de contenido SEO: redaccion de textos y estructuras de pagina en italiano o ingles, con verificacion humana posterior de cifras y datos.
- Apoyo a la definicion de experimentos CRO: propuesta de hipotesis y variantes a partir de las notas de conversion incluidas en el entrenamiento.
- Formacion de equipos junior: uso como asistente conversacional que explica conceptos de adquisicion y metricas en italiano, con contexto de hasta 8192 tokens en los ejemplos del autor.
- Prototipado local sin coste de API: al ejecutarse en GGUF Q4_K_M con llama.cpp u Ollama, permite iterar en un portatil sin depender de servicios en la nube.
- Base para nuevos ajustes de nicho: al ser Apache-2.0 y derivar de Qwen3-1.7B, sirve como punto de partida para LoRA adicionales en dominios de marketing o negocios.
- Demostraciones y pruebas de concepto de asistentes verticales en entornos con GPU de consumo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (base frente a GH Pulse):

| Metrica | Qwen3-1.7B | GH Pulse |
|---|---|---|
| Loss en notas GH reservadas (menor es mejor) | 3,300 | 2,214 |
| ARC-Easy (zero-shot) | 63,0% | 65,5% |
| ARC-Challenge (zero-shot) | 43,5% | 46,5% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1-1,3 GB para Q4_K_M (aproximadamente 1,7B parametros a 4 bits mas overhead); el repo completo ocupa 4,0 GB por incluir varias cuantizaciones.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); tambien en CPU.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 si se necesita servir a varios usuarios, aunque el modelo esta claramente orientado a uso individual.
- Opciones de despliegue: Ollama (`ollama create gh-pulse -f Modelfile`), llama.cpp (`llama-server -m gh-pulse-Q4_K_M.gguf --jinja -c 8192`) con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que el entrenamiento se hizo en CPU de portatil, lo que sugiere que la inferencia es viable en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GH Pulse | 1,72B | No disponible (ejemplos a 8192) | Apache-2.0 | Growth marketing (it/en) | GGUF en HuggingFace |
| Qwen3-1.7B (base) | 1,72B | No disponible en esta ficha | Apache-2.0 | Proposito general | Multiples formatos |
| GH Spark | 0,6B | No disponible | No disponible en esta ficha | Growth marketing | Familia GH AI |
| GH Apex | 4B | No disponible | No disponible en esta ficha | Growth marketing | Familia GH AI |

La comparativa con modelos de proposito general del mismo tamano (por ejemplo, variantes de 1-2B de otras familias) no esta disponible con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno: el propio autor advierte que puede inventar hechos, estadisticas y URLs, y que su aritmetica no es fiable.
- Sin acceso a internet: no puede verificar informacion en tiempo real.
- Problema conocido: al pedirle datos de contacto puede alucinar direcciones de Growthackers (por ejemplo, un sitio o correo en `growthackers.it`); el sitio oficial es https://gh.company.
- Cobertura linguistica limitada a italiano e ingles; el rendimiento en castellano no esta documentado.
- Entrenado con un volumen de datos presumiblemente reducido y en CPU de portatil, lo que limita la profundidad del conocimiento del dominio.
- Aunque la licencia es Apache-2.0 y permite uso comercial, se recomienda verificar cualquier cifra o recomendacion antes de usarla con clientes.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran invocacion de funciones.
- La fecha de creacion del repo (2026-10-28) y el reducido numero de descargas (157) y likes (0) indican un proyecto muy reciente y con poca validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/aymandakir-gh/gh-pulse-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de conversacion general: https://huggingface.co/HuggingFaceTB/smoltalk
- Sitio oficial de Growthackers: https://gh.company
- Repositorio llama.cpp (despliegue): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue): https://ollama.com
