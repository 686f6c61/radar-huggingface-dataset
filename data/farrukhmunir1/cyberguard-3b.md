# FarrukhMunir1/CyberGuard-3B

## Resumen

CyberGuard-3B es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct orientado a tareas de ciberseguridad, desarrollado por Farrukh Munir dentro del proyecto IronLLMs. El modelo parte de la base instructiva de Alibaba Qwen de 3.085.938.688 parámetros y se ha especializado mediante QLoRA en cuatro dominios concretos: análisis de amenazas, orientación sobre vulnerabilidades, buenas prácticas de seguridad y respuesta a incidentes.

El entrenamiento se realizó con recursos muy limitados —una GPU T4 gratuita de Google Colab—, usando cuantización 4-bit NF4 con bitsandbytes y adaptadores LoRA de rango 16 sobre siete módulos (q/k/v/o y gate/up/down). El conjunto de datos de partida fue el dataset de instrucciones de ciberseguridad de Trendyol (53.201 filas), del que se curaron 5.000 ejemplos con semilla 3407. El resultado es un modelo conversacional con una persona fija definida mediante un SYSTEM_PROMPT que debe replicarse de forma literal tanto en entrenamiento como en inferencia.

Su relevancia actual reside en que demuestra un flujo completo de especialización de un LLM pequeño en un dominio vertical con hardware de consumo, publicando los pesos fusionados en safetensors bajo licencia Apache 2.0. No obstante, se trata de un experimento con cero descargas en el momento de la ficha y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct), ajuste fino con QLoRA |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (bitsandbytes); pesos publicados en safetensors (precision original no especificada); no se publican GGUF |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset de entrenamiento es en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3.085.938.688 parámetros, inicializado desde Qwen2.5-3B-Instruct. El ajuste se realizó con QLoRA: la base se cargó cuantizada en 4-bit NF4 con bitsandbytes y se entrenaron adaptadores LoRA de rango r=16, alpha=32 y dropout=0 sobre siete módulos objetivo (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). El entrenamiento empleó el SFTTrainer de TRL con SFTConfig y las optimizaciones de Unsloth, todo ello en una GPU T4 de Google Colab, lo que condiciona fuertemente el presupuesto de cómputo y el tamaño efectivo del entrenamiento.

Los datos provienen del dataset de instrucciones de ciberseguridad de Trendyol: de 53.201 filas se curaron 5.000 ejemplos con semilla 3407. No se documentan el número de tokens de entrenamiento, las épocas, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO adicionales; el ajuste es exclusivamente supervisado (SFT). La innovación técnica destacable no es arquitectónica sino metodológica: la fijación de una persona mediante un SYSTEM_PROMPT idéntico en entrenamiento e inferencia, y la publicación de los pesos ya fusionados en safetensors, lo que elimina la necesidad de cargar adaptadores PEFT por separado. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional especializada en ciberseguridad: análisis de amenazas, orientación sobre vulnerabilidades, buenas prácticas y respuesta a incidentes.
- Respuesta a instrucciones en formato de prompt con secciones `### System:`, `### Instruction:` y `### Response:`.
- Razonamiento técnico básico sobre conceptos de seguridad (por ejemplo, explicar qué es el ransomware), heredado de la base instructiva Qwen2.5.
- Capacidad multilingüe: no confirmada por el autor; el entrenamiento se realizó sobre un dataset en inglés, por lo que el rendimiento en castellano es incierto.
- Soporte de tool calling / function calling: no documentado por el autor; la base Qwen2.5-Instruct lo soporta, pero el ajuste fino no lo garantiza.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de triaje de incidentes: el modelo puede recibir una descripción textual de un incidente y generar una primera clasificación y pasos de contención, aprovechando su especialización en respuesta a incidentes. Requiere validación humana por el riesgo de alucinación.
- Explicación de vulnerabilidades a equipos no técnicos: dado un CVE o una descripción de fallo, el modelo puede redactar una explicación divulgativa y recomendaciones de mitigación, útil en equipos de soporte o formación interna.
- Generación de borradores de políticas de seguridad: puede producir textos iniciales sobre buenas prácticas (gestión de contraseñas, segmentación de red, principio de mínimo privilegio) que un responsable de seguridad revise y adapte.
- Chatbot interno de concienciación: desplegado con el SYSTEM_PROMPT fijo, puede responder preguntas frecuentes de empleados sobre phishing, ransomware o higiene de contraseñas en un entorno controlado.
- Apoyo a analistas junior en laboratorios de formación: como tutor que explica conceptos de threat analysis y guía ejercicios de respuesta a incidentes en entornos de práctica.
- Prototipado rápido de herramientas de seguridad: al ser un modelo de 3B bajo Apache 2.0, sirve como base para experimentar con RAG sobre bases de conocimiento de seguridad (MITRE ATT&CK, NVD) antes de escalar a modelos mayores.
- Generación de checklists de hardening: el modelo puede producir listas de comprobación para configuraciones de servidores o aplicaciones, siempre sujetas a revisión técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 7-8 GB.
- VRAM estimada en cuantización 4-bit (si se aplica bitsandbytes en carga): en torno a 2-3 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3070/4060 Ti, RTX 3090, RTX 4090, A100, H100). En 4-bit puede caber en GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y superiores en fp16; en 4-bit, en GPUs de gama media con 6-8 GB.
- Opciones de despliegue: transformers (soporte nativo, tal como indica la model card), text-generation-inference (el repo declara endpoints_compatible), vLLM. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberGuard-3B | 3,09 B | no disponible | Ciberseguridad (QLoRA sobre Qwen2.5-3B-Instruct) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (segun documentacion de Qwen; no verificado en esta ficha) | Generalista instructivo | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens (segun documentacion de Meta) | Generalista instructivo | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens (segun documentacion de Microsoft) | Generalista instructivo | MIT | Hugging Face, ampliamente usado |

La comparación directa con especializaciones en ciberseguridad de tamaño similar no está disponible en la información proporcionada. Frente a las bases generalistas, CyberGuard-3B ofrece una persona y un corpus de dominio acotado, pero carece de benchmarks que demuestren una mejora medible sobre Qwen2.5-3B-Instruct en tareas de seguridad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino mejore a la base en tareas de ciberseguridad; podría incluso degradar capacidades generales por sobreajuste a 5.000 ejemplos.
- Riesgo elevado de alucinación en un dominio crítico: recomendaciones de seguridad incorrectas (por ejemplo, mitigaciones inválidas o CVE inventados) pueden tener consecuencias graves; todo output debe validarse por un profesional.
- Dependencia estricta del SYSTEM_PROMPT: la model card exige usar el prompt literal de entrenamiento; variaciones en el formato pueden degradar la calidad de forma significativa.
- Idiomas no declarados: el entrenamiento se hizo sobre datos en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto no documentado: el autor no especifica la longitud de contexto efectiva tras el ajuste; no debe asumirse la de la base sin verificación.
- Dataset de origen limitado: 5.000 ejemplos curados de un único dataset (Trendyol) con semilla fija; posible sesgo hacia los temas y el estilo de esa fuente.
- Sin datos de evaluación de sesgos, toxicidad o seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética derivada de las recomendaciones generadas.
- Madurez del proyecto: cero descargas y un solo like en el momento de la ficha; sin mantenimiento ni comunidad documentados.
- No se publican pesos GGUF, lo que limita el despliegue en entornos de CPU o de bajos recursos sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarrukhMunir1/CyberGuard-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de instrucciones de ciberseguridad de Trendyol: no disponible en la informacion proporcionada (referenciado en la model card sin enlace)
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
