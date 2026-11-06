# aymandakir-gh/gh-spark

## Resumen

GH Spark (0.6B) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-0.6B, desarrollado por la agencia italiana de growth-marketing Growthackers dentro de su familia abierta GH AI, que tambien incluye GH Pulse (1.7B) y GH Apex (4B). El modelo esta especializado en conocimiento de growth-marketing (playbooks, libreria de metricas, glosario, notas de adquisicion, contenido, SEO, CRO y herramientas de IA) combinado con una porcion de conversacion general procedente de HuggingFaceTB/smoltalk.

Con 596.049.920 parametros reales en safetensors y un repositorio de 1,2 GB, es un modelo deliberadamente pequeno orientado a borradores rapidos, clasificacion y despliegue en dispositivos de borde. Su interes principal radica en que demuestra un flujo de entrenamiento reproducible en hardware muy modesto (una sola CPU de portatil) y en que se distribuye con licencia Apache-2.0, pesos en safetensors y version GGUF para inferencia local.

El modelo soporta italiano e ingles, se publica bajo la tarea de text-generation y esta pensado para ejecutarse en modo no-thinking (`enable_thinking=False`), con un system prompt de Growthackers integrado en el Modelfile de Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 8192` en llama-server |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en el ejemplo de uso); safetensors en precision completa del adaptador fusionado |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante de 0.6B parametros, un transformer decoder-only, y se obtiene mediante un ajuste fino LoRA sobre dicho modelo base. El entrenamiento se realizo sobre el conocimiento publico de growth-marketing de Growthackers (playbooks, libreria de metricas, glosario y notas de adquisicion, contenido, SEO, CRO y herramientas de IA) mas una porcion abierta de conversacion general procedente de HuggingFaceTB/smoltalk (Apache-2.0). Segun la model card, el entrenamiento se llevo a cabo en una sola CPU de portatil, lo que constituye el dato tecnico mas destacable del proceso.

En cuanto a la curacion de datos, solo se emplearon notas de conocimiento generico: se descartaron las notas que mencionaban a cualquier cliente y se eliminaron nombres de personas, correos, telefonos, IBAN, identificadores de cuentas publicitarias y claves de API. Ademas, se excluyo por completo el material de recursos humanos, finanzas, socios, legal y exito de cliente. No se documentan en la informacion disponible detalles sobre numero total de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en italiano e ingles.
- Redaccion de borradores rapidos y contenido de marketing (adquisicion, contenido, SEO, CRO).
- Clasificacion de texto y tareas ligeras de etiquetado.
- Consulta de conocimiento de growth-marketing: playbooks, metricas y glosario.
- Conversacion general gracias a la porcion de smoltalk del entrenamiento.
- Ejecucion en dispositivos de borde y entornos con recursos muy limitados.
- Despliegue con API compatible con OpenAI mediante llama-server.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Borradores de contenido de marketing: el modelo puede generar primeros borradores de articulos, posts y copies en italiano o ingles apoyandose en su conocimiento de playbooks y SEO, para que un editor humano los refine despues.
- Clasificacion de leads y consultas: gracias a su tamano reducido puede procesar lotes de textos cortos para etiquetar por tematica o intencion en pipelines de bajo coste.
- Asistente interno de glosario y metricas: responde consultas sobre definiciones de metricas de growth y terminologia del sector, util como base de conocimiento consultable en local.
- Despliegue en dispositivos de borde: al ocupar alrededor de 1,2 GB en repositorio y disponer de version GGUF, puede ejecutarse en portatiles, mini-PC o entornos sin GPU dedicada para tareas de generacion y clasificacion.
- Prototipado rapido de chatbots de nicho: sirve para validar flujos conversacionales de marketing antes de migrar a modelos mayores de la misma familia (GH Pulse o GH Apex).
- Generacion de variantes de copy para pruebas A/B: produce multiples alternativas de mensajes publicitarios en italiano e ingles para experimentacion temprana.
- Filtrado y resumen de notas internas: puede resumir o clasificar notas de conocimiento generico del dominio de marketing en flujos de documentacion.

## Benchmarks y rendimiento

| Metrica | Qwen3-0.6B | GH Spark |
|---|---|---|
| Loss en notas GH reservadas (menor es mejor) | 3.090 | 2.456 |
| ARC-Easy (zero-shot) | 56,0% | 56,5% |
| ARC-Challenge (zero-shot) | 31,0% | 34,5% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas estandar adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 596 millones de parametros, una cuantizacion Q4_K_M ocupa del orden de varios cientos de MB, por lo que cabe en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecutarse incluso en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente, aunque no se documentan requisitos oficiales.
- Cabe en GPU consumer: si, dado su tamano; tambien en CPU de portatil, como demuestra el propio entrenamiento.
- Opciones de despliegue: Ollama (`ollama create gh-spark -f Modelfile`), llama.cpp / llama-server con API compatible con OpenAI (`llama-server -m gh-spark-Q4_K_M.gguf --jinja -c 8192`) y, en general, cualquier runtime que cargue safetensors o GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GH Spark (0.6B) | 596.049.920 | no disponible | Apache-2.0 | Hugging Face, GGUF | Ajuste LoRA especializado en growth-marketing, it/en |
| Qwen3-0.6B (base) | ~0,6B | no disponible en esta ficha | Apache-2.0 | Hugging Face | Modelo base sin especializar; GH Spark mejora loss y ARC frente a el |
| GH Pulse (1.7B) | 1,7B | no disponible | no disponible | Familia GH AI | Version mayor de la misma familia, orientada a mas capacidad |
| GH Apex (4B) | 4B | no disponible | no disponible | Familia GH AI | Version mayor de la misma familia, orientada a mas capacidad |

## Limitaciones y advertencias

- Modelo pequeno: puede inventar hechos, estadisticas y URLs, y su aritmetica no es fiable.
- No tiene acceso a internet.
- Problema conocido: si se le piden datos de contacto, puede conjeturar direcciones de Growthackers (por ejemplo, un sitio o correo en `growthackers.it`); el sitio oficial es https://gh.company.
- Debe verificarse cualquier cifra antes de usar sus salidas con clientes.
- Cobertura linguistica limitada a italiano e ingles.
- Se recomienda usar modo no-thinking (`enable_thinking=False`); el system prompt de GH esta integrado en el Modelfile.
- No se documentan sesgos especificos mas alla de los inherentes al modelo base y a los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte sobre la verificacion de datos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aymandakir-gh/gh-spark
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de conversacion general: https://huggingface.co/HuggingFaceTB/smoltalk
- Sitio oficial de Growthackers: https://gh.company
