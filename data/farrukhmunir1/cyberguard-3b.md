# FarrukhMunir1/CyberGuard-3B

## Resumen

CyberGuard-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct orientado a tareas de ciberseguridad. Lo desarrolla Farrukh Munir en el marco del proyecto IronLLMs, cuyo objetivo declarado es adaptar modelos cuantizados de 2-3B parametros mediante QLoRA en una GPU gratuita de Google Colab (T4). El modelo cubre cuatro dominios: analisis de amenazas, orientacion sobre vulnerabilidades, buenas practicas de seguridad y respuesta a incidentes.

Tecnicamente es un transformer decoder-only denso de 3.085.938.688 parametros (3B), heredero directo de la arquitectura y el tokenizador de Qwen2.5-3B-Instruct. El entrenamiento consistio en una unica epoca de QLoRA de 4 bits con 477 pasos sobre un dataset de 5.000 ejemplos, con solo el 0,96% de los parametros entrenables (29.933.568). La longitud de contexto, los idiomas soportados y los detalles del dataset no se especifican en la informacion disponible.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo reproducible de especializacion en dominio con recursos minimos (54 minutos en una T4) y publica la curva de perdida y las metricas de entrenamiento. No obstante, se trata de un experimento de bajo coste sin evaluacion con benchmarks publicados, por lo que debe tratarse como una prueba de concepto y no como un asistente de seguridad listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit; no se listan artefactos GGUF/AWQ/GPTQ publicados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE. Sobre esa base se aplico un ajuste QLoRA: cuantizacion de 4 bits del modelo base, adaptadores de bajo rango entrenables y calculo en precision reducida, todo ello con la libreria Unsloth sobre una unica GPU T4 de Colab. Los parametros entrenables fueron 29.933.568 de un total de 3.115.872.256 (0,96%), lo que confirma que unicamente se actualizaron los adaptadores LoRA.

El dataset consta de 5.000 ejemplos empaquetados en 3.810 filas, con un tamano efectivo de lote de 8 (2 por dispositivo y 4 pasos de acumulacion de gradiente). Se entreno durante 1 epoca y 477 pasos en 3.239 segundos (unos 54 minutos). La perdida media de entrenamiento fue 1,0760, con una curva que arranca en 2,24 en el paso 10 y se estabiliza en torno a 0,95-1,05 entre los pasos 340 y 470. No se documenta el origen, la composicion ni la licencia del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. La model card define un system prompt de inferencia que fija el rol de asistente experto en ciberseguridad y el alcance de los cuatro dominios.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno, heredadas de la base instruct.
- Razonamiento tecnico aplicado a analisis de amenazas, interpretacion de vulnerabilidades y guias de mitigacion.
- Respuesta a incidentes: procedimientos, priorizacion de acciones y recomendaciones operativas.
- Buenas practicas de seguridad (endurecimiento de configuraciones, politicas, controles).
- Capacidad de codigo y matematicas heredada de Qwen2.5-3B-Instruct, no reforzada especificamente en el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card (la base Qwen2.5-Instruct lo soporta, pero no se verifica en este fine-tune).
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Triaje de alertas de seguridad: el modelo puede resumir y clasificar alertas de SIEM o EDR en texto operativo para el analista de nivel 1, aprovechando su especializacion en analisis de amenazas y su bajo coste de inferencia.
- Asistencia en la redaccion de informes de vulnerabilidad: dado un CVE y su descripcion, generar explicaciones de impacto, vectores de ataque plausibles y recomendaciones de mitigacion para equipos no especializados.
- Base de conocimiento interna para equipos de TI: desplegado como chatbot sobre documentacion de politicas de seguridad, responde consultas sobre controles, configuraciones y procedimientos con el tono y alcance fijados por su system prompt.
- Formacion y concienciacion: generar escenarios de phishing, explicaciones de incidentes simulados y material didactico adaptado a distintos perfiles dentro de la organizacion.
- Primer borrador de runbooks de respuesta a incidentes: a partir de una descripcion de incidente, producir una secuencia de pasos inicial que el equipo de seguridad revisa y completa.
- Prototipado rapido en entornos con GPU limitada: al caber en una T4 o en GPUs de consumo con cuantizacion, sirve para validar flujos de asistencia en seguridad antes de invertir en modelos mayores.
- Extraccion y normalizacion de indicadores: convertir texto libre de informes en campos estructurados (IP, hash, dominio) como paso previo a enriquecimiento, aunque requiere validacion posterior por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica objetiva reportada es la perdida de entrenamiento (media 1,0760; meseta de 0,95-1,05), que no es comparable con resultados de evaluacion estandarizados como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 6-7 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 8-10 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2-3 GB de pesos, viable en GPUs de consumo con 6-8 GB.
- GPU recomendadas: T4 (entrenamiento verificado), RTX 3060/4060 Ti o superiores para inferencia en 4 bits; A100/H100 no necesarias para este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servicio en FP16, llama.cpp/Ollama si se generan artefactos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberGuard-3B | 3,09B | no disponible | Ciberseguridad (QLoRA) | apache-2.0 | Hugging Face, safetensors |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens (segun documentacion de Qwen; no confirmado aqui) | Generalista instruct | apache-2.0 | Hugging Face, amplia variedad de formatos |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (segun documentacion de Qwen) | Generalista instruct | apache-2.0 | Hugging Face, amplia variedad de formatos |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens (segun documentacion de Meta) | Generalista instruct | Llama 3.2 Community License | Hugging Face, formato GGUF extendido |

Frente a la base Qwen2.5-3B-Instruct, CyberGuard-3B anade especializacion de dominio a costa de un ajuste muy ligero (1 epoca, 5.000 ejemplos) y sin evaluacion publicada; para tareas generales la base es probablemente superior. Frente a modelos generalistas mayores como Qwen2.5-7B-Instruct, ofrece menor huella de VRAM pero tambien menor capacidad de razonamiento. No se dispone de datos de rendimiento comparativo para respaldar ninguna de estas afirmaciones mas alla de las metricas de entrenamiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones con benchmarks; el rendimiento real en tareas de ciberseguridad es desconocido.
- Entrenamiento de una sola epoca sobre 5.000 ejemplos: riesgo alto de sobreajuste al estilo y contenido del dataset, con poca generalizacion a dominios no cubiertos.
- Riesgo elevado de alucinacion en un dominio donde los errores tienen consecuencias graves: CVEs inexistentes, mitigaciones incorrectas o procedimientos de respuesta a incidentes invalidos. Requiere validacion humana en cualquier uso real.
- No se documenta la procedencia ni la calidad del dataset de entrenamiento, lo que impide auditar sesgos o contaminacion.
- Idiomas soportados no especificados; el ajuste puede haber degradado el multilingusimo de la base si el dataset era mayoritariamente en ingles.
- Soporte de tool calling y de contexto largo no verificado en este fine-tune, aunque la base los ofrezca.
- No se publican artefactos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en llama.cpp u Ollama sin conversion propia.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se presenta como parte de un proyecto experimental.
- El system prompt de inferencia forma parte del comportamiento esperado; usarlo fuera de ese formato puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarrukhMunir1/CyberGuard-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Perfil del autor: https://huggingface.co/FarrukhMunir1
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
