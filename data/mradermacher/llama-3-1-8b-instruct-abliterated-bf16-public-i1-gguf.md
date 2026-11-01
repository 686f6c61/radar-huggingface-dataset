# mradermacher/Llama-3.1-8B-Instruct-abliterated-bf16-public-i1-GGUF

## Resumen

Este repositorio, publicado por el usuario mradermacher, contiene cuantizaciones GGUF con imatrix (matriz de importancia) del modelo **Llama-3.1-8B-Instruct-abliterated-bf16-public**, una versión "abliterada" (sin filtros de rechazo) de Meta Llama 3.1 8B Instruct creada originalmente por ashwin-sreedhar. La abliteración es una técnica que elimina las direcciones de activación responsables de los rechazos del modelo, permitiendo que responda a instrucciones que la versión original se negaría a atender, sin necesidad de reentrenamiento completo ni fine-tuning con RLHF adversarial.

El modelo base es un transformer denso de 8.000 millones de parametros con ventana de contexto de 128.000 tokens, y conserva las capacidades de instruccion, razonamiento y codigo de Llama 3.1 8B Instruct. La relevancia de esta variante radica en el ecosistema local: al estar en formato GGUF, puede ejecutarse en llama.cpp, Ollama, LM Studio y derivados, desde portátiles con GPU modesta hasta servidores.

Cabe destacar que el repositorio es una cuantización de terceros: mradermacher no entrena modelos, solo los comprime con imatrix para reducir la perdida de calidad en cuantizaciones agresivas (IQ1_S a Q8_0). Es una ficha util para quien busque un Llama 3.1 8B sin guardrails para investigacion, red-teaming o casos de uso con restricciones de alineamiento excesivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Llama 3.1), causal, con RoPE y GQA |
| Parametros totales | 8.000 millones (aprox., heredado del modelo base Llama 3.1 8B Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en la model card (el modelo base Llama 3.1 usa la Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizado con imatrix; el original es safetensors bf16) |

Nota: el dato de parametros de safetensors del repositorio (2.493.280) corresponde presumiblemente a metadatos y no al modelo completo; el modelo base es de 8B de parametros.

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder auto-regresivo denso de 32 capas, 32 cabezas de atencion con Grouped Query Attention (8 cabezas KV), embeddings de 4.096 dimensiones y codificacion posicional RoPE. El modelo base fue preentrenado por Meta con mas de 15 billones de tokens y posteriormente ajustado con SFT y RLHF (DPO) para seguir instrucciones.

La version "abliterada" de ashwin-sreedhar no modifica los pesos de forma general: aplica la tecnica de abliteracion, que identifica y neutraliza las direcciones en el espacio de activaciones asociadas al rechazo de instrucciones (por lo general mediante diferencias de activaciones entre prompts que el modelo atiende y rechaza). El resultado es un modelo con la misma arquitectura y tamaño, pero sin el comportamiento de negativa por seguridad. La cuantizacion de mradermacher usa imatrix (matriz de importancia calculada sobre un corpus de calibracion), lo que mejora la fidelidad de las cuantizaciones bajas (IQ1-IQ3) frente a cuantizaciones ingenuas.

No hay informacion publicada en este repositorio sobre el dataset de calibracion de la imatrix ni sobre el proceso exacto de abliteracion mas alla del enlace al modelo original.

## Capacidades

- Generacion de texto e instruccion general multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento de nivel medio: matematicas, logica y comprension lectora acordes a un modelo de 8B.
- Generacion y completado de codigo en lenguajes principales (Python, JavaScript, C++, etc.).
- Ventana de contexto de 128.000 tokens para documentos largos y conversaciones extensas.
- Capacidades multilingues (el modelo base soporta oficialmente 8 idiomas, incluido el espanol).
- Sin capa de rechazo por seguridad: responde a instrucciones que el modelo original declinaria (esta es la finalidad de la abliteracion).
- Soporte de tool calling / function calling: no disponible de forma confirmada para esta variante; el modelo base Llama 3.1 8B Instruct si soporta tool use.
- No incluye capacidades multimodales (sin vision ni audio).

## Casos de uso

- **Investigacion en alineamiento y seguridad**: estudiar como se comporta un modelo sin guardrails frente a prompts adversariales, util para red-teaming y analisis de robustez de filtros.
- **Escritura creativa sin restricciones**: narrativa de ficcion con contenido maduro, terror o tematicas que los modelos alineados bloquean de forma conservadora.
- **Asistente local privado en consumer hardware**: con cuantizaciones Q4_K_M (unos 4,9 GB) funciona en GPUs de 8 GB de VRAM o incluso en CPU, manteniendo privacidad total al ejecutarse en local.
- **Prototipado de agentes locales**: integrable con llama.cpp u Ollama en pipelines de agentes para tareas de automatizacion donde se prefiere evitar rechazos espurios en instrucciones tecnicamente legítimas (seguridad ofensiva autorizada, analisis de malware, etc.).
- **Procesamiento de documentos largos**: gracias a los 128.000 tokens de contexto, resumir y consultar contratos, informes o codigo extenso en local.
- **Comparacion de impacto de cuantizacion**: el abanico de 25+ cuantizaciones permite medir la degradacion de calidad por nivel de bits en benchmarks propios.
- **Chatbots de dominio especifico**: fine-tuning posterior (LoRA) sobre el modelo abliterado cuando la capa de rechazo del original interfiiere con el dominio de aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante cuantizada. Como referencia no verificada, el modelo base Llama 3.1 8B Instruct reporta valores publicados por Meta (MMLU ~69,4, HumanEval ~72,6, GSM8K ~84,5), pero no existen mediciones especificas de esta abliteracion ni de sus cuantizaciones imatrix.

## Requisitos de hardware

Estimaciones basadas en el tamaño del modelo base (8B) y el formato GGUF; los valores exactos por cuantizacion no estan publicados en el repositorio:

- **VRAM estimada para inferencia**: aprox. 2,5-3 GB para IQ1_S/IQ2_M; 3,5-4,5 GB para IQ3/Q3_K; 4,5-5,5 GB para Q4_K_M; 6-7 GB para Q5_K/Q6_K; ~8,5 GB para Q8_0 (mas el KV cache, que crece con el contexto).
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones medias-altas con contexto largo; A100/H100 solo necesarias si se busca maximo throughput en servidor.
- **Consumer GPU**: si, con Q4_K_M cabe comodamente en una GPU de 8 GB; con IQ3 incluso en GPUs de 4-6 GB.
- **CPU**: viable con cuantizaciones IQ/Q2-Q4 en equipos con 8-16 GB de RAM, a velocidades de varios tokens/segundo.
- **Despliegue**: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa.
- **Latencia/throughput**: no disponible; en un RTX 4090 con Q4_K_M un 8B GGUF tipicamente supera los 100 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Alineamiento | Licencia |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-abliterated (este, GGUF) | 8B | 128K | GGUF (imatrix) | Sin rechazos (abliterado) | no disponible (base: Llama 3.1 Community License) |
| Meta Llama 3.1 8B Instruct (original) | 8B | 128K | safetensors | RLHF con rechazos | Llama 3.1 Community License |
| Dolphin 2.9 Llama 3 8B (Cognitive Computations) | 8B | 8K (base Llama 3) | safetensors/GGUF | Alineado con dataset Dolphin, rechazos minimos | Llama 3 Community License |
| Mistral 7B Instruct v0.3 | 7B | 32K | safetensors/GGUF | Alineado estandar | Apache 2.0 |

Frente al original, esta variante ofrece el mismo tamaño y contexto sin capa de rechazo. Frente a Dolphin, mantiene el contexto de 128K de Llama 3.1 pero no pasa por un fine-tuning completo con dataset desalineado. Frente a Mistral 7B, ofrece contexto mucho mayor pero una licencia menos permisiva.

## Limitaciones y advertencias

- **Ausencia de salvaguardas**: al ser un modelo abliterado, no rechaza solicitudes daninas. Su uso para generar contenido ilegal, danino o enganoso es responsabilidad exclusiva del usuario; revisa la legislacion aplicable antes de desplegarlo.
- **Riesgo de alucinacion**: tipico de modelos de 8B; la abliteracion no lo reduce y puede aumentar en temas sensibles al eliminarse mecanismos de cautela.
- **Doble destilacion de calidad**: la abliteracion mas la cuantizacion agresiva (IQ1-IQ2) degrada apreciablemente la calidad; usa Q4_K_M o superior para trabajo serio.
- **Licencia sin confirmar**: la model card no declara licencia; el modelo base esta bajo la Llama 3.1 Community License, que impone restricciones (limites de usuarios mensuales, politica de uso aceptable, atribucion "Llama" en derivados).
- **Idiomas**: el rendimiento fuera de los 8 idiomas oficiales del modelo base (incluido el espanol) puede ser inferior.
- **Procedencia de terceros**: cuantizacion de un modelo abliterado de terceros, sin auditoria del proceso de abliteracion; verifica el modelo original (ashwin-sreedhar) antes de uso en produccion.
- **Sin pipeline declarado ni model card completa del autor**: la documentacion del repositorio es minima, lo que dificulta la trazabilidad.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-abliterated-bf16-public-i1-GGUF
- Modelo original abliterado (safetensors bf16): https://huggingface.co/ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1: https://arxiv.org/abs/2407.21783
