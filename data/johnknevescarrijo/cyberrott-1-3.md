# johnknevescarrijo/CyberRott-1.3

## Resumen

CyberRott-1.3 es un modelo de lenguaje de pequeno tamano (SLM) de 3.836 millones de parametros, desarrollado por el usuario johnknevescarrijo, especializado en ciberseguridad ofensiva, defensiva y forense. Se construye como un ajuste fino de `microsoft/Phi-4-mini-instruct` mediante aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO), la tecnica popularizada por DeepSeek-R1, lo que le permite generar trayectorias de razonamiento latente dentro de etiquetas `<think>` antes de emitir una respuesta.

El modelo aborda un problema concreto: los modelos genericos de proposito general tienden a rechazar o responder de forma superficial ante terminologia tecnica de seguridad (analisis de vulnerabilidades, explotacion, ingenieria inversa). CyberRott-1.3 incorpora un protocolo de razonamiento de siete etapas que cubre enumeracion de superficie de ataque, analisis de flujo de datos, auditoria de sinks peligrosos, inspeccion de mitigaciones, clasificacion CWE/MITRE ATT&CK, cuantificacion de impacto y generacion de parches defensivos.

Es relevante ahora porque demuestra que un SLM denso de menos de 4.000 millones de parametros, con licencia MIT y pesos en BF16 y GGUF, puede superar a su modelo base en el benchmark WMDP-Cyber (39,81 % frente a 32,16 %) manteniendo una integridad estructural de formato del 95,12 % en cadenas de pensamiento. Su tamano permite despliegue en hardware de consumo, lo que lo hace accesible para equipos de AppSec y laboratorios de investigacion con presupuesto limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 (3,82 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16; GGUF (disponible para llama.cpp/Ollama) |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

CyberRott-1.3 parte de `microsoft/Phi-4-mini-instruct`, un transformer denso de 3,82 B de parametros, y aplica un post-entrenamiento en dos fases: primero un ajuste supervisado (SFT) con LoRA, y despues aprendizaje por refuerzo online mediante GRPO con grupo G=8 (segun la model card; la version 1.2 uso G=4). La innovacion principal es el uso de GRPO para inducir cadenas de pensamiento latentes delimitadas por `<think>...</think>`, siguiendo el paradigma de DeepSeek-R1, lo que permite al modelo deliberar internamente antes de responder.

Los datos de entrenamiento combinan varios conjuntos publicos: `nvidia/Nemotron-Research-GooseReason-0.7M`, `m-a-p/CodeFeedback-Filtered-Instruction`, `open-r1/codeforces-cots`, `bespokelabs/Bespoke-Stratos-17k`, `CyberNative/Code_Vulnerability_Security_DPO`, `AlicanKiraz0/Cybersecurity-Dataset-v1` y `cais/wmdp`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset. El framework utilizado es TRL junto con PEFT.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento explicita mediante etiquetas `<think>`.
- Analisis de vulnerabilidades: enumeracion de superficie de ataque, modelado de amenazas y analisis de flujo de datos (taint analysis).
- Auditoria de sinks peligrosos: corrupcion de memoria, aritmetica sin comprobar, primitivas de inyeccion y condiciones de carrera.
- Inspeccion de mitigaciones defensivas: ASLR, DEP/NX, stack canaries, CSP y parametrizacion de consultas.
- Clasificacion taxonomica con CWE y mapeo a tacticas MITRE ATT&CK.
- Cuantificacion de impacto: puntuacion CVSS v3.1 y analisis de blast radius.
- Generacion de parches de codigo defensivos y memory-safe.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: parcialmente implicitas en el protocolo de siete etapas, pero no documentadas como soporte de agentes.
- Capacidades multilingues limitadas a ingles y portugues.
- Capacidades especiales: modo de razonamiento (thinking mode) con verificacion de formato; no se documentan vision ni audio.

## Casos de uso

- Auditoria de codigo en pipelines de CI/CD: el modelo puede analizar diffs y fragmentos de codigo para identificar sinks peligrosos y mapear hallazgos a CWE, integrándose como paso de revision automatizada antes del merge.
- Triaje de vulnerabilidades en equipos de AppSec: dado un aviso CVE o un fragmento de codigo sospechoso, el modelo genera una trayectoria de razonamiento que enumera superficie de ataque, condiciones de explotabilidad y mitigaciones existentes.
- Formacion de equipos de red team: el modelo puede generar primitivas de explotacion conceptuales y escenarios de ataque con puntuacion CVSS, util para ejercicios controlados y formacion interna.
- Analisis forense y respuesta a incidentes: con contexto suficiente, puede ayudar a reconstruir cadenas de ataque y mapear tecnicas a MITRE ATT&CK para informes post-incidente.
- Generacion de parches defensivos: a partir de un fragmento vulnerable, el modelo produce correcciones de codigo memory-safe y regression-resistant, adecuado para revision humana posterior.
- Asistente de desarrollo seguro en IDE: gracias a su tamano (3,82 B), puede desplegarse en estaciones de trabajo con GPU de consumo y ofrecer sugerencias de codificacion segura en tiempo real.
- Analisis de ingenieria inversa asistida: el modelo puede razonar sobre fragmentos de binarios o pseudocodigo para identificar patrones de vulnerabilidad, aunque con las limitaciones propias de un SLM.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| WMDP-Cyber Generative CoT Accuracy | 39,81 % |
| Mejora sobre Phi-4-mini-Instruct (baseline) | +7,65 % |
| Integridad estructural de formato (CoT no fallida) | 95,12 % |

Progresion comparativa declarada en la model card:

| Modelo | Precision y pesos | WMDP-Cyber (estricto) | Delta vs base | Fallos de formato |
|---|---|---|---|---|
| microsoft/Phi-4-mini-instruct (base) | BF16 denso | 32,16 % (639/1.987) | Baseline | 10,27 % |
| CyberRott 1.0 (SFT LoRA) | BF16 fusionado | 36,08 % (717/1.987) | +3,92 % | 2,11 % |
| CyberRott v1.2 (GRPO G=4) | BF16 fusionado | 38,85 % (772/1.987) | +6,69 % | No disponible (dato truncado) |
| CyberRott v1.3 (GRPO G=8) | BF16 | 39,81 % | +7,65 % | 4,88 % (derivado de 95,12 % de integridad) |

La evaluacion se realizo sobre las 1.987 preguntas de opcion multiple del benchmark WMDP-Cyber del Center for AI Safety, con inferencia batch en vLLM, generacion greedy (temperature=0.0), framing ChatML y extraccion automatizada de respuestas tras el cierre de `<think>`.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 7,7 GB para los pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica, 10-12 GB para contexto moderado.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 2,3-2,5 GB, permitiendo ejecucion en GPU de 4-6 GB.
- GPU recomendadas: A100 o H100 para despliegue de alta concurrencia con vLLM; RTX 4090 o RTX 3090 para inferencia BF16 en una sola GPU; RTX 3060 de 12 GB o superior para BF16 con contexto limitado.
- Cabe en GPU de consumo: si, tanto en BF16 (RTX 3090/4090, 12 GB o mas) como en cuantizaciones GGUF (GTX 1660 de 6 GB o superior).
- Opciones de despliegue: vLLM (soportado explicitamente, con script de evaluacion incluido), llama.cpp, Ollama (etiqueta `ollama` presente), y en general cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WMDP-Cyber | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberRott-1.3 | 3,82 B | No disponible | 39,81 % (declarado) | MIT | Hugging Face (safetensors + GGUF) |
| microsoft/Phi-4-mini-instruct | 3,82 B | No disponible en la informacion | 32,16 % (declarado como base) | MIT | Hugging Face |
| CyberRott v1.2 | 3,82 B | No disponible | 38,85 % (declarado) | MIT | Hugging Face (version anterior) |

No se dispone de datos de otros modelos especializados en ciberseguridad de tamano comparable en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Precision absoluta moderada: 39,81 % en WMDP-Cyber implica que el modelo falla aproximadamente 6 de cada 10 preguntas del benchmark; no debe usarse como unica fuente en decisiones de seguridad criticas.
- Riesgo de alucinacion en la generacion de CVE, CWE o puntuaciones CVSS: el modelo puede inventar identificadores o clasificaciones plausibles pero incorrectas; requiere validacion humana.
- Idiomas limitados a ingles y portugues; no hay soporte documentado de castellano.
- El modelo esta disenado para uso dual (red team y blue team); su uso ofensivo sin autorizacion puede tener implicaciones legales en muchas jurisdicciones.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por el uso del modelo.
- No se documenta la longitud de contexto efectiva, lo que dificulta planificar casos de uso con repositorios o logs extensos.
- El protocolo de razonamiento de siete etapas puede incrementar la latencia y el consumo de tokens frente a respuestas directas.
- No hay evidencia publica de evaluacion en tareas de agente o tool calling, pese a que el modelo base Phi-4-mini-instruct las soporta.

## Enlaces

- Hugging Face: https://huggingface.co/johnknevescarrijo/CyberRott-1.3
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Benchmark WMDP: https://huggingface.co/datasets/cais/wmdp
- Framework TRL: https://github.com/huggingface/trl
- Framework PEFT: https://github.com/huggingface/peft
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Licencia MIT: https://opensource.org/licenses/MIT
- Dataset nvidia/Nemotron-Research-GooseReason-0.7M: https://huggingface.co/datasets/nvidia/Nemotron-Research-GooseReason-0.7M
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset open-r1/codeforces-cots: https://huggingface.co/datasets/open-r1/codeforces-cots
- Dataset bespokelabs/Bespoke-Stratos-17k: https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
- Dataset CyberNative/Code_Vulnerability_Security_DPO: https://huggingface.co/datasets/CyberNative/Code_Vulnerability_Security_DPO
- Dataset AlicanKiraz0/Cybersecurity-Dataset-v1: https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-v1
