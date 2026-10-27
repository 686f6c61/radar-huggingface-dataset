# shahid888/DrishtiGuard

## Resumen

DrishtiGuard es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario `shahid888` el 27 de octubre de 2026, construido sobre el modelo base Qwen/Qwen3-4B-Base. Por sus etiquetas, está orientado a *guardrail* y moderación de contenido (*content-safety*, *content-moderation*), es decir, a clasificar prompts y respuestas como seguros o inseguros dentro de un pipeline de aplicación, más que a la generación libre de texto.

Su rasgo diferencial es el enfoque multilingüe sobre lenguas de la India: las etiquetas cubren inglés y 21 idiomas del subcontinente (hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, panyabí, oriya, asamés, urdu, sánscrito, cachemir, sindi, nepalí, konkani, maithili, manipurí, sánscrito/santali, dogri y bodo). La mayoría de los clasificadores de seguridad disponibles se centran en inglés, por lo que un guardrail que cubra lenguas de bajos recursos es relevante para despliegues en el sur de Asia.

La información pública es mínima: no hay *model card* con datos de entrenamiento, evaluación ni hiperparámetros, el repositorio registra 0 descargas y 0 *likes*, y no se han publicado resultados de benchmarks. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen3-4B-Base |
| Parametros totales | 4B en el modelo base; tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos (ampliable con YaRN hasta 131.072) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision original); el modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ), aunque no se documenta ninguna para este adaptador |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, sa, ks, sd, ne, kok, mai, mni, sat, doi, brx (segun etiquetas del repositorio; sin evaluacion publicada) |
| Licencia | La etiqueta del repositorio indica apache-2.0; el campo de licencia de la ficha aparece como "no disponible". Verificar antes de uso comercial |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere el modelo base Qwen3-4B-Base |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre Qwen3-4B-Base, un transformer decoder-only denso de 4.000 millones de parametros con atención de tipo GQA y RoPE, entrenado por Alibaba Qwen. El adaptador modifica los pesos de las capas lineales de atención y/o MLP dejando congelado el modelo base; para inferencia puede cargarse con `peft` sobre el base o fusionarse (`merge_and_unload`) para obtener un checkpoint denso convencional. No se especifican rango, alpha, capas objetivo ni tamaño del fichero de pesos.

No hay información publicada sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, si se usaron taxonomías de daño tipo MLCommons/Llama Guard, ni si hubo etapas de RLHF o DPO. Tampoco se documenta la plantilla de prompt ni el formato de salida esperado (etiqueta binaria, categorías de daño o texto libre), lo que obliga a inspeccionar el adaptador o a experimentar para integrarlo. El nombre "Drishti" (visión, en sánscrito) sugiere un uso como capa de inspección de entradas y salidas.

## Capacidades

- Clasificación de seguridad de prompts y respuestas (*guardrail*) en un pipeline de moderación, segun la orientación declarada en las etiquetas del repositorio.
- Cobertura multilingüe declarada de 23 códigos de idioma, con mayoría de lenguas de la India y el inglés como idioma puente.
- Generación de texto y razonamiento heredados del modelo base Qwen3-4B-Base una vez cargado el adaptador.
- Capacidad de *tool calling* y razonamiento multi-paso: no documentada para este adaptador; la del modelo base no se ha verificado tras el ajuste.
- Modo *thinking*: no disponible en Qwen3-4B-Base (la variante base no incluye modo de razonamiento explícito).
- Capacidades de visión o audio: no disponibles.
- Distribución como adaptador PEFT, compatible con `transformers`, `peft` y fusión posterior para vLLM o llama.cpp.

## Casos de uso

- Moderación de entrada en aplicaciones de chat: colocar el modelo como filtro previo al LLM principal para clasificar el mensaje del usuario y bloquear solicitudes dañinas; su tamaño de 4B permite latencias bajas frente a clasificadores de 8B o más.
- Moderación de salida en asistentes desplegados en la India: filtrar respuestas generadas en hindi, tamil, bengalí o maratí antes de mostrarlas al usuario, un hueco que los guardrails anglocéntricos no cubren.
- Cumplimiento normativo en plataformas UGC: etiquetado automático de comentarios y publicaciones en lenguas regionales para revisión humana posterior, con el modelo actuando como primera pasada de triaje.
- Escalado de equipos de confianza y seguridad: generar una señal de riesgo por contenido que permita priorizar la cola de revisión manual en función de la probabilidad de daño.
- Investigación en seguridad multilingüe: servir como *baseline* ajustado con LoRA para comparar con Llama Guard 3 o Qwen3Guard en lenguas de bajos recursos como konkani, maithili, bodo o santali.
- Filtrado en pipelines de generación de datos sintéticos: descartar pares instrucción-respuesta tóxicos antes de incorporarlos a un dataset de entrenamiento o de ajuste fino.
- Despliegue en infraestructura modesta: al partir de un base de 4B, puede ejecutarse en una única GPU de consumo con cuantización de 4 bits, lo que facilita moderación *on-premise* sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluación, conjunto de test ni comparación con guardrails de referencia (Llama Guard, ShieldGemma, Qwen3Guard), por lo que no es posible afirmar su calidad en precisión, recall, tasa de falsos positivos ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado en el base de 4B: ~9-10 GB en FP16 (pesos ~8 GB más caché KV y activaciones), ~5-6 GB en INT8 y ~3-4 GB en INT4 con contextos moderados.
- GPU recomendadas para servicio concurrente: A100 40/80 GB, H100, L40S o A10G, que permiten lote alto y contextos largos con vLLM.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en FP16 o INT8; en INT4 también en GPUs de 8 GB con contextos cortos.
- Opciones de despliegue: `transformers` + `peft` para prototipado; fusión del adaptador y servicio con vLLM o TGI; conversión a GGUF y ejecución con llama.cpp u Ollama para entornos de CPU o GPU única (el adaptador PEFT no se carga directamente en llama.cpp sin convertir).
- Latencia y throughput: no disponibles. Como referencia estructural, un dense de 4B en FP16 sobre una RTX 4090 admite decenas de peticiones por segundo con lotes pequeños, pero no hay medición publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrishtiGuard | 4B (base) + LoRA | No disponible (base: 32.768) | 23 códigos, foco India | apache-2.0 segun etiqueta, campo de licencia no disponible | Repositorio HuggingFace, 0 descargas, sin model card |
| Llama Guard 3 | 8B | 128.000 | 8 idiomas (en, fr, de, hi, it, pt, es, th) | Llama 3.1 Community License | Peso completo, ampliamente desplegado |
| ShieldGemma | 2B / 9B / 27B | 8.192 | Inglés | Gemma Terms of Use | Peso completo, con variantes de tamaño |
| Qwen3Guard-Gen-4B | 4B | 32.768 | 119 idiomas | Apache 2.0 | Peso completo, familia con variantes Gen y Stream |

Frente a estas alternativas, DrishtiGuard aporta cobertura declarada de lenguas indias de bajos recursos, pero carece de la validación empírica, la documentación y el soporte de una release oficial. Qwen3Guard-Gen-4B es el competidor más directo por tamaño y licencia, y al ser un modelo completo no requiere gestionar la fusión del adaptador.

## Limitaciones y advertencias

- Ausencia total de *model card*: no se documentan datos de entrenamiento, hiperparámetros de LoRA, taxonomía de daño ni formato de prompt, lo que impide reproducir el ajuste o auditarlo.
- Sin evaluación publicada: no hay métricas de precisión, recall ni falsos positivos; usarlo como guardrail sin validación propia puede tanto bloquear contenido legítimo como dejar pasar contenido dañino.
- Ambigüedad de licencia: la etiqueta indica apache-2.0, pero el campo de licencia aparece como "no disponible". Conviene confirmar con el autor antes de un uso comercial.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen3-4B-Base y aplicar el LoRA; un empaquetado incorrecto produce salidas degeneradas.
- Riesgo de alucinación si se usa como generador libre en lugar de clasificador: el ajuste LoRA sobre un corpus de seguridad puede degradar capacidades generales del base, y no hay medición de ello.
- Cobertura desigual esperable entre idiomas: las lenguas con muchos hablantes (hindi, bengalí, tamil) probablemente estén mejor representadas que kok, mni, sat, brx o doi, para las que no existe evidencia de datos suficientes.
- Sesgos culturales: un clasificador entrenado con criterios de seguridad mayoritariamente occidentales puede sobrerrestringir contenido legítimo en contextos religiosos, políticos o lingüísticos del sur de Asia.
- Sin mantenimiento verificable: 0 descargas y 0 *likes* en el momento de la consulta; no hay garantía de actualizaciones, issues atendidos ni soporte.
- Advertencia de producción: no debe ser el único mecanismo de seguridad; conviene combinarlo con listas de bloqueo, revisión humana y monitorización de deriva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shahid888/DrishtiGuard
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Librería PEFT: https://github.com/huggingface/peft
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Llama Guard 3 (Meta): https://huggingface.co/meta-llama/Llama-Guard-3-8B
- ShieldGemma (Google): https://huggingface.co/google/shieldgemma-9b
- Qwen3Guard (Alibaba Qwen): https://huggingface.co/Qwen/Qwen3Guard-Gen-4B
