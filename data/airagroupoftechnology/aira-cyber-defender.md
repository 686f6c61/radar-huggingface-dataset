# airagroupoftechnology/aira-cyber-defender

## Resumen

AIRA Cyber Defender es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado a ciberseguridad defensiva, respuesta a incidentes e inteligencia de amenazas. Lo desarrolla Aira Group Of Technology, iniciativa fundada por Adam Eehan, y se distribuye exclusivamente en formato GGUF con cuantizacion Q4_K_M (4,68 GB), pensado para su ejecucion local mediante Ollama, LM Studio, llama.cpp o vLLM. El modelo parte de la version Instruct de Qwen2.5-7B, un transformer denso de 7.615.616.512 parametros (7,6 B) con ventana de contexto de hasta 32.768 tokens.

El problema que aborda es la necesidad de un asistente especializado en analisis de brechas, clasificacion de vectores de ataque (ransomware, phishing, DDoS, inyeccion SQL, zero-days), diagnostico de causa raiz y generacion de playbooks de remediacion, sin depender de APIs en la nube. Al estar cuantizado en 4 bits y empaquetado en GGUF, puede desplegarse en hardware modesto, lo que resulta relevante para equipos de SOC que necesitan inferencia local por motivos de confidencialidad.

La relevancia actual del modelo es limitada pero concreta: es un ajuste fino ligero (QLoRA de rango 16) sobre una base solida, con licencia Apache 2.0 y un unico idioma declarado (ingles). No publica benchmarks ni evaluaciones de seguridad, por lo que debe tratarse como un experimento de dominio mas que como una herramienta validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino QLoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio solo distribuye esta cuantizacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4,68 GB); repo de 4,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso con atencion por cabezas agrupadas (GQA), RoPE y contexto nativo de 32.768 tokens. Sobre esa base se aplico un ajuste fino supervisado mediante QLoRA de 4 bits con la libreria Unsloth FastLanguageModel. La configuracion LoRA emplea rango r=16 y alpha=16 sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con optimizador AdamW de 8 bits (adamw_8bit) y entrenamiento en una GPU Tesla T4 en la nube.

La model card reporta una progresion de perdida desde 5,016 hasta 0,819. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO posterior ni el volumen de ejemplos de ciberseguridad utilizados. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni modos de razonamiento extendido). El modelo conserva la plantilla de chat ChatML de Qwen (`<|im_start|>` / `<|im_end|>`), tal como refleja el Modelfile de ejemplo.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML.
- Analisis de incidentes de seguridad: post-mortems de brechas, clasificacion de vectores de ataque (ransomware, phishing, DDoS, inyeccion SQL, zero-days).
- Diagnostico de causa raiz de vulnerabilidades y generacion de playbooks de remediacion empresarial.
- Auditoria de seguridad autonoma segun la model card: threat hunting, inspeccion de AST, endurecimiento de perimetro defensivo y contramedidas de honeypot.
- Soporte de tool calling / function calling: no documentado explicitamente en la model card; la base Qwen2.5-7B-Instruct lo soporta, pero no se confirma que el ajuste fino lo preserve.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Analisis de incidentes en un SOC: el modelo puede redactar post-mortems de brechas y clasificar el vector de ataque a partir de la descripcion del incidente, con 32.768 tokens de contexto para incluir logs y cronologias extensas.
- Generacion de playbooks de remediacion: a partir de una vulnerabilidad identificada, produce pasos de contencion y erradicacion adaptados a entornos empresariales.
- Triaje de alertas de phishing: clasificacion y explicacion de indicadores de compromiso en correos sospechosos, ejecutable en local para no enviar datos sensibles a terceros.
- Asistencia a threat hunting: generacion de hipotesis de busqueda y consultas de deteccion a partir de tecnicas MITRE ATT&CK descritas por el analista.
- Formacion y simulacros: generacion de escenarios de ataque y preguntas de evaluacion para equipos de respuesta a incidentes, con temperatura baja (0,3) para respuestas consistentes.
- Despliegue en entornos air-gapped: al ser un GGUF de 4,68 GB ejecutable con Ollama o llama.cpp, puede correr en estaciones de trabajo sin conexion, requisito habitual en entornos de defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (de 5,016 a 0,819), que no es una metrica comparable con MMLU, HumanEval o GSM8K ni constituye una evaluacion de capacidad en ciberseguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M de 4,68 GB, mas overhead de contexto KV cache (que crece con los 32.768 tokens de contexto).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; el entrenamiento se realizo en una Tesla T4 (16 GB). Para contexto completo de 32K se recomienda 12-16 GB de VRAM.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: Ollama (`ollama run hf.co/airagroupoftechnology/aira-cyber-defender`), LM Studio, llama.cpp y vLLM (segun la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| AIRA Cyber Defender | 7,6 B | 32.768 | GGUF Q4_K_M | Apache 2.0 | Ciberseguridad defensiva (fine-tuning) |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 | safetensors, GGUF | Apache 2.0 | Proposito general |
| Llama 3.1 8B Instruct | 8 B | 128.000 | safetensors, GGUF | Llama 3.1 Community | Proposito general |
| Mistral 7B Instruct | 7,2 B | 32.768 | safetensors, GGUF | Apache 2.0 | Proposito general |

No se dispone de datos de rendimiento comparativo del modelo frente a estas alternativas, ya que no se han publicado benchmarks. La comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion de seguridad: no hay evidencia publicada de que el ajuste fino mejore la precision en tareas de ciberseguridad frente a la base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion elevado en un dominio critico: un playbook de remediacion o un diagnostico de causa raiz incorrecto puede tener consecuencias operativas graves; requiere validacion humana.
- Solo ingles declarado: no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el volumen y la calidad de los datos de ciberseguridad, lo que impide evaluar sesgos y cobertura.
- Perdida final de 0,819 sin contexto de validacion: no permite inferir calidad real ni sobreajuste.
- El soporte de tool calling y de agentes multi-paso no esta confirmado tras el ajuste fino.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- El repo solo distribuye GGUF Q4_K_M; no hay pesos en safetensors ni otras cuantizaciones, lo que limita el ajuste posterior o la evaluacion en precision completa.

## Enlaces

- Hugging Face: https://huggingface.co/airagroupoftechnology/aira-cyber-defender
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Portfolio del autor: https://adameehan.vercel.app
- GitHub del autor: https://github.com/adameehanaira
- Repositorio AiraLang: https://github.com/adameehanaira
