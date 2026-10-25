# shortice/shortik

## Resumen

shortice/shortik es un ajuste fino (finetune) conversacional en ingles construido sobre shortice/shortik-base, un modelo de la familia lfm2_moe (arquitectura de transformer con mezcla de expertos de Liquid AI, segun el tag declarado en el repositorio). Cuenta con 1.165.025.664 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de ~1,2 mil millones de parametros, y se distribuye bajo licencia Apache 2.0. El autor es el usuario "shortice", sin mas trazabilidad publica en la model card.

El problema que resuelve es acotado: proporcionar una variante afinada para dialogo de un modelo base pequeno, presumiblemente entrenada con Unsloth (el autor indica que el entrenamiento fue "2x mas rapido" con esa libreria). No hay informacion sobre el dataset de ajuste, el numero de tokens, la plantilla de chat ni la longitud de contexto soportada, y la model card es practicamente una plantilla autogenerada.

Su relevancia ahora es limitada y hay que enmarcarla con honestidad: se trata de un modelo recien subido (25 de octubre de 2026), con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin documentacion tecnica. Es util como base de experimentacion para quien quiera un modelo de ~1,2B con licencia permisiva y arquitectura MoE, pero no es un artefacto validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (transformer con mezcla de expertos; segun tag del repositorio) |
| Parametros totales | 1.165.025.664 (~1,17 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors); el tamano del repo (2,3 GB) es coherente con pesos en 16 bits |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | shortice/shortik-base |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, lfm2_moe, text-generation, text-generation-inference, unsloth, conversational, endpoints_compatible, region:us |
| Tamano del repositorio | 2,3 GB |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura declarada es lfm2_moe, es decir, un transformer con capas de mezcla de expertos (MoE) de la familia LFM2 de Liquid AI. El repositorio no detalla el numero de expertos, el ratio de activacion, el mecanismo de enrutamiento ni la dimension oculta; solo consta el identificador de arquitectura y el recuento total de parametros. Al tratarse de un MoE, el coste de inferencia depende de los parametros activos por token, dato que no se ha publicado: sin el, cualquier estimacion de latencia o de VRAM en regimen de ejecucion es provisional.

En cuanto al entrenamiento, la unica informacion disponible es que se trata de un finetune de shortice/shortik-base realizado con Unsloth, con la afirmacion del autor de que el proceso fue el doble de rapido gracias a esa libreria. No se especifican volumen de tokens, composicion del dataset, uso de RLHF/DPO, ni hiperparametros. El tag "conversational" sugiere un ajuste orientado a dialogo multiturno, pero no se documenta la plantilla de chat aplicada, lo que obliga a inspeccionar el tokenizer_config.json del repositorio antes de integrarlo.

## Capacidades

- Generacion de texto en ingles, con el modo conversacional como caso principal segun los tags del repositorio.
- Dialogo multiturno: el tag "conversational" apunta a un ajuste supervisado sobre conversaciones, aunque la plantilla de chat no esta documentada.
- Compatibilidad con text-generation-inference (TGI) y con endpoints compatibles, segun los tags del repositorio.
- Carga directa con transformers en safetensors; el modelo base esta pensado para flujos de ajuste con Unsloth.
- Razonamiento, codigo, matematicas, vision, audio, tool calling y uso de agentes: no disponible (no hay documentacion ni evaluaciones que lo respalden).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo "thinking" o decodificacion especulativa: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: un modelo de ~1,2B cabe en una sola GPU consumer y permite iterar sobre prompts y plantillas de chat con coste minimo antes de invertir en modelos mayores.
- Despliegue en el borde o en entornos con recursos limitados: por su tamano, es candidato para inferencia en estaciones de trabajo modestas o incluso CPU, siempre que se generen cuantizaciones GGUF a partir de los pesos safetensors.
- Generacion de datos sinteticos y aumentacion: util para producir dialogos de dominio general en ingles que luego se filtran y se usan para ajustar modelos mayores o clasificadores.
- Modelo borrador para decodificacion especulativa: un modelo small de la misma familia linguistica puede acelerar la generacion de un modelo mayor, aunque la ausencia de datos sobre tokens activos y velocidad obliga a medir el ratio de aceptacion antes de adoptarlo.
- Base para ajuste fino vertical: al ser Apache 2.0 y estar disponible en safetensors, se puede reentrenar con LoRA/QLoRA (por ejemplo con Unsloth) para dominios concretos como soporte interno, documentacion tecnica o atencion a empleados.
- Clasificacion y enrutamiento de consultas: uso como modelo rapido para etiquetar intenciones o decidir a que modelo mayor derivar una peticion, aprovechando su baja huella de memoria.
- Educacion y demostraciones: ejemplo didactico de pipeline completo (modelo base, finetune con Unsloth, publicacion en el Hub) para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y tampoco hay comparaciones con el modelo base shortice/shortik-base que permitan cuantificar el efecto del ajuste conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 2,4 GB solo de pesos (1,17 mil millones de parametros x 2 bytes), mas la cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada.
- VRAM estimada en 8 bits: del orden de 1,2 GB de pesos; en 4 bits, del orden de 0,7 GB, siempre que se generen las cuantizaciones correspondientes, ya que el repositorio solo publica safetensors.
- Cabe en GPU consumer: si, con margen amplio en tarjetas de 8 GB o mas (RTX 3060 Ti, 4060, 4060 Ti, 4070, 4090) y tambien en GPUs de 4-6 GB si se cuantiza.
- GPU recomendadas para produccion: A10G, L4, L40S o A100/H100 para despliegues con batching alto; para experimentacion, cualquier RTX con 8 GB o mas.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el repositorio incluye el tag), y previsiblemente vLLM y llama.cpp/Ollama tras conversion, aunque estas dos ultimas no estan confirmadas para la arquitectura lfm2_moe en la informacion disponible.
- Latencia y throughput: no disponible. No hay mediciones publicadas y, al ser un MoE sin datos de parametros activos, no es posible estimar el coste por token con rigor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| shortice/shortik | 1,17 mil millones (MoE) | no disponible | Apache 2.0 | Hugging Face, safetensors | Sin benchmarks ni documentacion; 0 descargas |
| shortice/shortik-base | no disponible | no disponible | no disponible | Hugging Face | Modelo base del finetune; sin datos publicos en la informacion consultada |
| Familia LFM2 (Liquid AI) | no disponible para este modelo concreto | no disponible | no disponible en la informacion consultada | Hugging Face | Arquitectura de referencia declarada por el tag lfm2_moe |
| Otras alternativas de ~1B (Llama 3.2 1B, Qwen3 1.7B, Gemma 3 1B) | rango 1-2 mil millones | no disponible en la informacion consultada | licencias variadas, no verificadas aqui | Hugging Face | Candidatos habituales en esta franja; requiere verificar contexto y benchmarks en sus fichas originales |

No se dispone de datos verificados de rendimiento, contexto ni parametros activos de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa queda pendiente de contraste con las model cards oficiales.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es una plantilla autogenerada por Unsloth; no hay informe tecnico, dataset, hiperparametros ni evaluaciones.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni dimensionar la cache KV.
- Idiomas: solo se declara ingles; el rendimiento en castellano es impredecible y probablemente deficiente.
- Parametros activos no publicados: al ser un MoE, el coste real de inferencia y la calidad efectiva por token no se pueden estimar a priori.
- Riesgo de alucinacion: inherente a un modelo de ~1,2B sin evaluaciones publicadas; en tareas factuales o de codigo en produccion la fiabilidad es baja sin verificacion externa.
- Sesgos: no evaluados. Al no documentarse el corpus de ajuste, no es posible caracterizar sesgos de genero, raza, religion o geopoliticos.
- Plantilla de chat no documentada: existe riesgo de degradacion silenciosa si se aplica un formato de prompt distinto al usado en el entrenamiento.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre el origen de los datos de ajuste y sobre el cumplimiento normativo; conviene conservar el aviso de licencia y el atributo al modelo base.
- Madurez: cero descargas y cero likes en el momento de la consulta, subida el 2026-10-25; no hay senales de uso comunitario ni de mantenimiento.
- No apto como unico componente en produccion sin una fase previa de evaluacion propia (perplejidad, benchmarks de la tarea objetivo y pruebas de robustez frente a prompts adversarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shortice/shortik
- Modelo base: https://huggingface.co/shortice/shortik-base
- Unsloth (libreria de ajuste fino citada por el autor): https://github.com/unslothai/unsloth
- Paper, blog, demo o repositorio adicionales: no disponible en la informacion proporcionada.
