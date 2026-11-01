# Goro64/Llama-Prompt-Guard-2-86M-vi-v2-mirror-dinhxuanhuy

## Resumen

Llama-Prompt-Guard-2-86M-vi-v2 es un clasificador de texto derivado de Llama Prompt Guard 2 86M de Meta, afinado por el usuario dinhxuanhuy para la deteccion de prompts maliciosos en vietnamita e ingles. El repositorio que nos ocupa, publicado por Goro64, es un espejo de preservacion sin modificaciones del release original: no se han reentrenado, cuantizado ni fusionado los pesos, y solo se han anadido documentos de procedencia y licencias. Su funcion es la de un filtro de seguridad de entrada, no la de un modelo generativo.

El modelo resuelve un problema concreto: clasificar si un texto de entrada constituye un intento de inyeccion de prompt, jailbreak o instruccion adversaria antes de que llegue a un LLM de produccion. Al estar especializado en vietnamita ademas de ingles, cubre un hueco que los guardrails puramente anglocentricos dejan abierto en despliegues con usuarios del sudeste asiatico.

Es relevante ahora porque los pipelines de agentes y asistentes expuestos a entrada de usuario necesitan capas de defensa ligeras y de baja latencia que puedan ejecutarse en cada turno de conversacion. Con 278,8 millones de parametros reales en safetensors y un repositorio de 1,1 GB, es un candidato viable para filtrado en linea, aunque su licencia Llama 4 Community License impone obligaciones que conviene revisar antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer), segun tag del repositorio |
| Parametros totales | 278.810.882 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el espejo no incluye variantes cuantizadas) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | meta-llama/Llama-Prompt-Guard-2-86M |
| Tipo de release | espejo sin modificaciones (finetune del upstream) |
| Descargas / likes | 15 / 0 |

## Arquitectura y entrenamiento

El modelo base Llama Prompt Guard 2 86M de Meta se describe en el repositorio como un clasificador construido sobre una arquitectura DeBERTa-v2, segun el tag `deberta-v2` presente en los metadatos. Se trata, por tanto, de un encoder transformer bidireccional orientado a clasificacion de secuencias, no de un modelo generativo autoregresivo. El numero de parametros reales registrado en safetensors asciende a 278.810.882, muy superior a los 86 millones que sugiere el nombre comercial, lo que indica que el identificador "86M" no refleja el conteo efectivo de pesos del checkpoint publicado.

El autor del release original, dinhxuanhuy, lo describe como un derivado afinado del modelo de Meta, pero la model card del espejo no aporta informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de alineacion empleadas. El mantenedor del espejo, Goro64, declara explicitamente que no ha entrenado, afinado, cuantizado ni fusionado los pesos, y que no ha evaluado ni certificado el modelo de forma independiente. Cualquier innovacion tecnica del afinado original (por ejemplo, estrategias de aumento de datos en vietnamita o balanceo de clases) no esta documentada en la informacion disponible.

## Capacidades

- Clasificacion binaria o multietiqueta de textos de entrada para detectar prompts maliciosos, inyecciones y jailbreaks, segun el uso previsto del modelo base Prompt Guard 2.
- Cobertura bilingue vietnamita-ingles, orientada a despliegues con usuarios de ambos idiomas.
- Integracion con la libreria `transformers` y con el pipeline `text-classification`.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades de agente ni de razonamiento multi-step.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: el clasificador se ejecuta sobre cada mensaje del usuario antes de enviarlo al LLM principal, bloqueando intentos de inyeccion de prompt con una latencia muy inferior a la de un modelo generativo de gran tamano.
- Proteccion de agentes con acceso a herramientas: en pipelines donde el agente puede invocar APIs o ejecutar codigo, el guardrail actua como primera linea de defensa para descartar instrucciones que intenten secuestrar el comportamiento del agente.
- Moderacion en comunidades vietnamitas: al cubrir vietnamita ademas de ingles, es adecuado para foros, chats y plataformas con base de usuarios en Vietnam donde los guardrails solo en ingles dejan pasar ataques en lengua local.
- Red teaming y evaluacion de seguridad: se puede usar como clasificador de referencia para medir la tasa de deteccion de un conjunto de prompts adversarios durante pruebas de penetracion de sistemas LLM.
- Enrutado condicional en pipelines RAG: clasificar la consulta entrante para decidir si se permite el acceso a indices sensibles o si se requiere verificacion adicional, reduciendo el riesgo de exfiltracion via prompt injection.
- Investigacion academica sobre seguridad de LLM: sirve como linea base reproducible (con commit fijado y manifiesto de integridad SHA-256) para comparar tecnicas de deteccion de jailbreaks en entornos multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,1 GB solo para pesos, mas overhead de activaciones y tokenizador; en la practica, entre 1,5 y 2 GB.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB para pesos, con un total practico de 1 a 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, L4, RTX 3060 o superior es mas que suficiente. Para alto throughput en servidor, A10G o L4 son opciones razonables.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` con pipeline de clasificacion, Text Embeddings Inference (TEI) segun el tag del repositorio, y servidores de inferencia compatibles con endpoints. No se documenta soporte GGUF ni llama.cpp en este espejo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del encoder, se espera una latencia por debajo de decenas de milisegundos en GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M-vi-v2 (este espejo) | 278,8 M (safetensors) | no disponible | vi, en | Llama 4 Community License | HuggingFace, espejo de preservacion |
| meta-llama/Llama-Prompt-Guard-2-86M | no disponible en esta ficha | no disponible | en (principalmente) | Llama 4 Community License | HuggingFace, release oficial de Meta |
| dinhxuanhuy/Llama-Prompt-Guard-2-86M-vi-v2 | identico (es el upstream del espejo) | no disponible | vi, en | Llama 4 Community License | HuggingFace, release original |

La comparativa se limita al linaje directo del modelo, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros guardrails alternativos (por ejemplo, clasificadores de la familia Llama Guard) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El espejo no ha sido evaluado ni certificado por el mantenedor; la preservacion del modelo no constituye una garantia de seguridad ni una recomendacion de despliegue.
- No se documentan sesgos conocidos, tasas de falsos positivos/negativos ni comportamiento ante ataques adversariales especificos.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de clasificacion erronea (falsos negativos que dejen pasar un ataque y falsos positivos que bloqueen entradas legitimas).
- La cobertura linguistica se limita a vietnamita e ingles; entradas en otros idiomas pueden degradar la deteccion sin aviso.
- La licencia Llama 4 Community License impone obligaciones de atribucion, politica de uso aceptable y condiciones de redistribucion; es imprescindible revisar LICENSE, USE_POLICY.md y NOTICE antes de uso comercial.
- La licencia registrada corresponde al momento de la captura (2026-10-28); cambios posteriores en la pagina upstream no modifican los ficheros preservados en este snapshot, pero tampoco amplian derechos.
- El historial Git upstream no se reproduce en el espejo; la trazabilidad se apoya en el commit `0c383965025f25ace850a41909c1ce88ce865b9f` y en UPSTREAM_PAYLOAD_MANIFEST.json.
- El nombre comercial "86M" no coincide con los 278,8 millones de parametros reales del checkpoint, lo que puede inducir a error en estimaciones de memoria y latencia.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-v2-mirror-dinhxuanhuy
- Release upstream original: https://huggingface.co/dinhxuanhuy/Llama-Prompt-Guard-2-86M-vi-v2
- Commit exacto del upstream: https://huggingface.co/dinhxuanhuy/Llama-Prompt-Guard-2-86M-vi-v2/tree/0c383965025f25ace850a41909c1ce88ce865b9f
- Model card upstream en la revision capturada: https://huggingface.co/dinhxuanhuy/Llama-Prompt-Guard-2-86M-vi-v2/blob/0c383965025f25ace850a41909c1ce88ce865b9f/README.md
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Coleccion de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
