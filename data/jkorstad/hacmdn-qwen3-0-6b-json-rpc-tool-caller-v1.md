# jkorstad/hacmdn-qwen3-0.6b-json-rpc-tool-caller-v1

## Resumen

`jkorstad/hacmdn-qwen3-0.6b-json-rpc-tool-caller-v1` es un adaptador LoRA (PEFT) publicado por Jonathan Korstad sobre el modelo base `Qwen/Qwen3-0.6B`. No es un modelo de propósito general: es un micro-especialista entrenado para una única tarea, la síntesis de envoltorios de llamada a herramientas en formato JSON-RPC 2.0 a partir de especificaciones de funciones y esquemas de parámetros, con abstención calibrada ante consultas fuera de dominio.

El adaptador forma parte del ecosistema HACMDN-Net (Hermes Agent Community Microtuned Decentralized Network), una red de micro-especialistas pensada para combinarse mediante técnicas de mezcla de modelos como DARE/TIES, ya que todos sus miembros comparten la misma familia base. El modelo base Qwen3-0.6B es un transformer denso de la familia Qwen3 con aproximadamente 0,6-0,8 mil millones de parámetros.

Su relevancia es acotada pero técnica: demuestra un patrón de entrenamiento orientado a una función estrecha con métricas de aceptación explícitas (abstención fuera de dominio y calibración de confianza), en lugar de perseguir rendimiento generalista. El repositorio declara 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar materializados o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3 |
| Parametros totales | no disponible (adaptador LoRA sobre base de ~0,6-0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Copyright 2026 Jonathan Korstad) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only denso de la familia Qwen3. La model card no detalla el rango del adaptador, los módulos objetivo, la tasa de aprendizaje ni el volumen de tokens de entrenamiento; únicamente declara la tarea objetivo: generar envoltorios JSON-RPC 2.0 estrictos a partir de especificaciones de funciones y esquemas de parámetros.

El elemento técnico diferencial es el entrenamiento con "calibrated brutal-honesty abstention": el modelo debe abstenerse de responder cuando la consulta cae fuera del dominio de la tarea, y hacerlo con una confianza calibrada. La model card reporta métricas de aceptación del piloto HACMDN-Net (§6.2 y §11): puntuación global en held-out del 100,00 % frente al 0,00 % del base sin tocar, precisión in-domain del 100,00 %, tasa de abstención out-of-domain del 100,00 % (umbral exigido ≥ 90 %), riesgo de falso positivo del 0,00 % (umbral ≤ 10 %) y ROC-AUC de calibración de confianza de 1,0000 (umbral > 0,70). No se documenta el conjunto de evaluación, su tamaño ni la metodología de medición, por lo que estas cifras deben interpretarse como declaraciones del autor y no como resultados verificados de forma independiente.

## Capacidades

- Síntesis de llamadas a herramientas en JSON-RPC 2.0 a partir de especificaciones de funciones y esquemas de parámetros.
- Generación de esquemas (schema synthesis) para funciones de Python de granularidad micro (`python-micro-fn`).
- Abstención calibrada ante consultas fuera de dominio, con salida de confianza asociada.
- Integración en el ecosistema HACMDN-Net como micro-especialista del vecindario `nbh-agentic-tooling`.
- Compatibilidad con mezcla de modelos (mergekit DARE/TIES) al compartir familia base única.
- No se declaran capacidades de razonamiento general, matemáticas, visión, audio ni conversación multi-turno; el adaptador está orientado a una función estrecha.
- Soporte multilingüe: no disponible.

## Casos de uso

- Generación automática de clientes JSON-RPC: dado un catálogo de funciones con sus esquemas, el adaptador produce los envoltorios de llamada listos para enviar a un servidor JSON-RPC 2.0, reduciendo el trabajo de serialización manual en pipelines de agentes.
- Enrutamiento de herramientas en agentes LLM: el modelo actúa como capa de traducción entre la intención expresada en lenguaje natural y la llamada estructurada concreta, apoyándose en la abstención para derivar consultas ambiguas a un modelo mayor.
- Exposición de funciones Python como API remota: combinado con el patrón `python-micro-fn`, permite publicar funciones pequeñas como endpoints invocables por agentes sin escribir a mano el contrato de cada una.
- Filtro de seguridad de bajo coste en pipelines de tool calling: al abstenerse de forma calibrada fuera de dominio, puede colocarse delante de un modelo mayor para descartar llamadas mal formadas o fuera de alcance con muy poco coste computacional.
- Pruebas y validación de esquemas: genera llamadas de ejemplo conformes a un esquema dado, útil para tests de integración de servidores JSON-RPC y para verificar validadores de contrato.
- Componente de un ensemble mezclado: al compartir base con otros micro-especialistas HACMDN-Net, puede fusionarse mediante DARE/TIES para construir un modelo combinado con varias habilidades estrechas.
- Demostración en espacios ZeroGPU: la model card referencia un buffer comunitario en Hugging Face Spaces, lo que permite probar el adaptador en hardware gratuito compartido.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de aceptación del piloto. No se especifica el conjunto de evaluación ni la metodología, por lo que se reproducen tal cual como declaraciones del autor.

| Metrica | Qwen3-0.6B sin ajuste | Adaptador ajustado | Umbral exigido |
|---|---|---|---|
| Puntuacion global en held-out | 0,00 % | 100,00 % | ≥ +15 % |
| Precision in-domain | 0,00 % | 100,00 % | no disponible |
| Tasa de abstencion out-of-domain | 0,00 % | 100,00 % | ≥ 90 % |
| Riesgo de falso positivo | 100,00 % | 0,00 % | ≤ 10 % |
| ROC-AUC de calibracion de confianza | 0,7200 | 1,0000 | > 0,70 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo base de ~0,6-0,8B, la huella dominante es la del base, que en bfloat16 ronda 1,2-1,6 GB y en cuantización de 4 bits puede situarse por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre para el base en bfloat16; no se requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, entre otras), aunque el fabricante no publica requisitos oficiales.
- Opciones de despliegue: la model card proporciona ejemplo con `peft` y `transformers` (`PeftModel.from_pretrained` sobre el base). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA, su uso con esos motores requeriría fusión previa con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jkorstad/hacmdn-qwen3-0.6b-json-rpc-tool-caller-v1` | Adaptador LoRA sobre ~0,6-0,8B | no disponible | Micro-especialista en JSON-RPC tool calling con abstención | Apache-2.0 | Hugging Face (0 descargas) |
| `Qwen/Qwen3-0.6B` | ~0,6-0,8B | no disponible | Modelo base de propósito general | Apache-2.0 | Hugging Face (ampliamente descargado) |
| `Jinx-org/Jinx-Qwen3-0.6B` | ~0,6-0,8B | no disponible | Variante "helpful-only" sin rechazos, para investigación en seguridad | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la comparación se limita a tamaño, base y licencia.

## Limitaciones y advertencias

- El adaptador está entrenado para una única tarea; fuera de la síntesis de llamadas JSON-RPC y la abstención asociada, su comportamiento no está caracterizado.
- Las métricas del 100 % en held-out y ROC-AUC de 1,0000 proceden de la evaluación interna del autor; no hay verificación independiente ni descripción del conjunto de evaluación, y un ROC-AUC perfecto es señal típica de un conjunto de test pequeño o poco diverso.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documenta la longitud de contexto efectiva del adaptador ni si el entrenamiento preserva la ventana completa del base.
- Riesgo de alucinación en la generación de esquemas: al ser un modelo de 0,6B, puede producir campos o tipos inválidos ante esquemas complejos o anidados; se recomienda validación estricta contra el JSON Schema en producción.
- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar publicados o son de tamaño despreciable; conviene verificar la integridad del adaptador antes de integrarlo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; el modelo base Qwen3-0.6B tiene su propia licencia Apache-2.0 que debe respetarse.
- No apto como modelo de conversación general ni para tareas de razonamiento abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkorstad/hacmdn-qwen3-0.6b-json-rpc-tool-caller-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio HACMDN-Net: https://github.com/Jpalmer95/hacmdn-net
- Espacio comunitario ZeroGPU: https://huggingface.co/spaces/jkorstad/hacmdn-community-buffer
- Variante relacionada Jinx-Qwen3-0.6B: https://huggingface.co/Jinx-org/Jinx-Qwen3-0.6B
