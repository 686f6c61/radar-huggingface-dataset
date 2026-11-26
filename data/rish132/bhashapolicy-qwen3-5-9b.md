# Rish132/bhashapolicy-qwen3.5-9b

## Resumen

BhashaPolicy Qwen3.5-9B es un ajuste fino (adaptador LoRA) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Rish132 en el marco de la Adaptive Intelligence Challenge. Su objetivo es responder consultas sobre normativa y tramitacion civica india con citas estatutarias verificables en linea, evitando la invencion de articulos legales mediante un mecanismo de rechazo determinista. Es relevante porque aborda uno de los problemas mas criticos de los LLM en dominio juridico: la fabricacion de referencias normativas.

El modelo cubre cinco idiomas (ingles, hindi, tamil, bengali y marati) y produce salidas estructuradas: primero una explicacion legible para el usuario y despues un objeto JSON validado con los campos `status`, `language`, `citations` y `next_steps`. El entrenamiento se realizo con la plataforma Adaption, combinando datos extraidos de PDFs estatutarios primarios y escenarios adversarios de rechazo sintetizados.

El repositorio ocupa 0,1 GB, lo que corresponde al adaptador y no a los pesos completos del modelo base. No se han publicado datos sobre arquitectura interna, longitud de contexto ni volumen de tokens de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 9B (modelo base); el adaptador no declara numero de parametros propios |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en, hi, ta, bn, mr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se ajusta mediante LoRA SFT, receta cooptimizada con la herramienta AutoScientist de la plataforma Adaption. No se detalla la arquitectura interna del modelo base en la informacion disponible (tipo de atencion, uso de MoE, mecanismos de decodificacion).

El pipeline de datos documentado consta de cinco fases: (1) extraccion de PDFs estatutarios primarios con Adaptive Data (Forge e Invent) y sintesis de escenarios adversarios de rechazo; (2) aplicacion de recetas de deduplicacion, trazas de razonamiento, mitigacion de alucinaciones y reglas globales de citacion y rechazo (Blueprint); (3) localizacion a los cinco idiomas con mezcla de diversidad general; (4) auditoria con Adaption Visualize para revisar integridad de citas, longitud por segmento y distribucion de rechazos; y (5) ajuste final con AutoScientist. Las fuentes normativas citadas son la DPDP Act 2023, la Consumer Protection Act 2019, el RBI Integrated Ombudsman Scheme 2021 y la RTI Act 2005. No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto con citas estatutarias en linea con el formato `[Act Short Name, Section X]`, verificadas contra textos legales publicos indios.
- Rechazo determinista: emite `"status": "refused"` ante consultas fuera de alcance o no respaldadas por las fuentes, en lugar de fabricar secciones legales.
- Salida estructurada: guia legible seguida de un objeto JSON validado con `status`, `language`, `citations` y `next_steps`.
- Multilingue en cinco idiomas: ingles, hindi, tamil, bengali y marati.
- Orientacion sobre tramitacion civica y regulatoria (proteccion de consumidores, proteccion de datos, derecho a la informacion, reclamaciones bancarias).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Modo de razonamiento explicito, vision o audio: no disponible.

## Casos de uso

- Atencion ciudadana sobre derecho a la informacion: el modelo responde consultas del tipo "cuantos dias tiene un PIO bajo la RTI Act 2005" con la cita de seccion correspondiente y salida JSON apta para integrarse en un portal de tramitacion.
- Asistencia en reclamaciones de consumo: orienta sobre plazos y vias de reclamacion bajo la Consumer Protection Act 2019, con citas verificables que un operador humano puede revisar antes de enviar la respuesta.
- Consultas sobre proteccion de datos personales: explica obligaciones y derechos bajo la DPDP Act 2023 en el idioma del usuario, util para mesas de ayuda de organizaciones que operan en India.
- Reclamaciones ante el defensor del pueblo bancario: guia al usuario por el RBI Integrated Ombudsman Scheme 2021, indicando pasos siguientes en el campo `next_steps` del JSON.
- Despliegue en ONG y asistencia juridica gratuita: al ser un adaptador ligero sobre un modelo de 9B con licencia Apache 2.0, puede ejecutarse en infraestructura modesta para triaje de consultas antes de derivar a un abogado.
- Integracion en pipelines de triaje con salida validada: la alta validez JSON reportada (99% en el conjunto de prueba) permite consumir la respuesta de forma programatica para clasificar consultas y enrutarlas al departamento adecuado.
- Atencion multilingue en India: cobertura simultanea de hindi, tamil, bengali y marati para usuarios que no consultan en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en un conjunto de prueba congelado y libre de contaminacion:

| Modelo | Grounded Citation F1 | Status/Refusal Acc | Refusal Recall | JSON Validity | Multilingual Parity |
|---|---:|---:|---:|---:|---:|
| base_qwen3.5_4b | 77,67% | 77,00% | 70,00% | 80,00% | 0,91 |
| bhashapolicy_v1_1024 | 72,33% | 85,00% | 83,33% | 89,00% | 0,72 |
| bhashapolicy_v4 | 70,67% | 87,00% | 73,33% | 92,00% | 0,81 |
| bhashapolicy_v5 | 73,43% | 92,00% | 80,00% | 94,00% | 0,87 |
| bhashapolicy_v6 | 77,86% | 83,00% | 80,00% | 87,00% | 0,76 |
| bhashapolicy_9b | 72,24% | 98,00% | 93,33% | 99,00% | 0,87 |

La version de 9B lidera en precision de estado/rechazo (98%), recall de rechazo (93,33%) y validez JSON (99%), pero su F1 de citacion (72,24%) queda por debajo de la variante v6 (77,86%) y del modelo base de 4B (77,67%). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,1 GB); para inferencia hay que cargar el modelo base Qwen/Qwen3.5-9B, cuyos requisitos de VRAM dependen de su arquitectura, no detallada en la informacion disponible.
- Estimacion orientativa para un modelo denso de 9B: ~18 GB en FP16, ~10 GB en cuantizacion de 8 bits y ~5-6 GB en 4 bits, sin contar la cache KV.
- GPU recomendadas: A100 o H100 para FP16 con contexto largo; RTX 4090 (24 GB) viable en FP16 o 8 bits para un modelo de 9B.
- Cabe en GPU de consumo con cuantizacion de 4 bits (RTX 3090, RTX 4090, RTX 4070 Ti Super), siempre que el modelo base sea compatible con llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base con el adaptador fusionado; la model card solo documenta una clase Python propia (`bhashapolicy.inference.BhashaPolicyAssistant`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bhashapolicy-qwen3.5-9b | 9B (base) + LoRA | no disponible | Normativa y civica india, 5 idiomas, rechazo determinista | Apache 2.0 | Hugging Face |
| base_qwen3.5_4b (referencia del autor) | 4B | no disponible | Base general; F1 de citacion 77,67%, sin rechazo determinista | no disponible | Uso interno en la comparativa del autor |
| bhashapolicy_v6 (version previa) | no disponible | no disponible | Mejor F1 de citacion (77,86%) pero peor validez JSON (87%) | no disponible | No publicada como modelo independiente en la informacion disponible |

No se dispone de datos sobre otros modelos legales multilingues comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no sustituye a un abogado ni constituye asesoria juridica formal; el propio autor lo declara apto solo para fines educativos y de asistencia civica.
- La cobertura normativa se limita a cuatro cuerpos legales indios (DPDP Act 2023, Consumer Protection Act 2019, RBI Integrated Ombudsman Scheme 2021 y RTI Act 2005); consultas sobre otra normativa caeran previsiblemente en rechazo.
- El F1 de citacion (72,24%) implica que una parte relevante de las citas generadas puede ser incorrecta o incompleta; requiere verificacion humana en produccion.
- La paridad multilingue reportada es de 0,87, lo que indica un rendimiento algo inferior en idiomas distintos del ingles.
- Riesgo de alucinacion mitigado pero no eliminado: el mecanismo de rechazo reduce la fabricacion de secciones, pero no hay garantia absoluta.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B debe verificarse por separado.
- El repositorio no incluye los pesos completos; el despliegue exige descargar el modelo base y aplicar el adaptador.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion independiente de los benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rish132/bhashapolicy-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Plataforma Adaption (referenciada en la model card): no disponible
- Paper o blog tecnico: no disponible
- Repositorio de codigo o demo: no disponible
