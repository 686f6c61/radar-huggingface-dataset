# FrontiersMind/Lumma-fev-0.1b

## Resumen

Lumma-Fev-0.1b es un modelo de decisión (decision model) desarrollado por FrontiersMind. No es un modelo generativo: recibe un documento de estado (state) y un conjunto de preguntas tipadas, y devuelve en una sola pasada forward una distribución de probabilidad para cada pregunta. Al no generar texto, no hay salida que parsear ni margen para alucinaciones en el sentido clásico de generación libre.

El modelo se ha obtenido mediante fine-tuning completo (full fine-tune) a partir de Nandi-Mini-150M, un modelo preentrenado desde cero por el mismo equipo. Tiene 154.102.848 parámetros (unos 154M) y esta pensado para ejecutarse en hardware de consumo, incluidos portátiles con GPU integrada. Su caso demostrativo publico es el control autonomo y en tiempo real de Super Mario en un MacBook Air M2.

Es relevante ahora porque cubre el nicho de la toma de decisiones estructurada y tipada, con contratos de salida definidos (noul, choice, score) y compatibilidad con el contrato TypeSafe `POST /v1/systemone`. Su contexto se limita a 1.024 tokens de estado por pregunta, y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, prefill-only; cada pregunta lee el estado y sus propios tokens; readout mediante cabecera pointer |
| Parametros totales | 154.102.848 (~154M) |
| Longitud de contexto | Hasta 1.024 tokens de estado; una fila de pregunta (estado + pregunta) hasta 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos almacenados en bf16 para el backbone y fp32 para la cabecera pointer) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, con `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Lumma-Fev-0.1b es un transformer causal en modo prefill-only. La innovacion principal es que no decodifica tokens: en lugar de generar texto, emplea una cabecera pointer de 512 dimensiones que lee directamente sobre las opciones disponibles de cada pregunta. El modelo procesa el estado y cada pregunta de forma aislada, de modo que una pregunta no puede influir en la respuesta de otra. Textualmente, cada pregunta solo ve el estado y sus propias instrucciones y opciones, y el texto contenido en la peticion no puede falsificar los tokens delimitadores del modelo.

El entrenamiento parte de Nandi-Mini-150M (revision `31c8aceaa16e`), preentrenado desde cero por FrontiersMind, y se ha realizado un fine-tune completo. Los pesos se almacenan en bf16 para el backbone y fp32 para la cabecera pointer. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO (no disponible).

## Capacidades

- Clasificacion y decision estructurada: devuelve distribuciones de probabilidad por pregunta en una sola pasada.
- Preguntas de tipo `noul` (si/no), con `noul` como probabilidad de "si".
- Preguntas de tipo `choice` (de 1 a 255 opciones), con `choice` (la opcion mas probable), `confidence` y `probabilities` por nombre.
- Preguntas de tipo `score` (de 1 a 255 niveles ordenados), con `score` (nivel esperado), `confidence`, `legend` y `probabilities` por nivel.
- Entrada de estado flexible: texto, objeto JSON o array.
- Aislamiento entre preguntas: cada pregunta lee solo el estado y sus propias instrucciones y opciones.
- No genera texto: no hay tool calling, function calling, agentes, multi-step reasoning, vision ni audio documentados.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Enrutado de tickets de soporte: a partir del texto de un ticket, decidir con preguntas `noul` y `choice` si es de facturacion, envios o tecnico, y asignarlo al equipo correspondiente, aprovechando el contrato `/v1/systemone` para integrarlo en un backend existente.
- Clasificacion de intenciones (intent classification): sobre conjuntos como Banking77, asignar la intencion del usuario mediante preguntas `choice`, con la ventaja de que la salida ya viene tipada y no requiere parsear texto libre.
- Analisis de sentimiento y emociones: usar preguntas `score` ordenadas ("puede esperar", "esta semana", "hoy") para medir urgencia o tono emocional, como en el conjunto DAIR Emotion.
- Moderacion y politicas de contenido: plantear preguntas `noul` ("cumple la politica de SPAM?") y `choice` para categorizar infracciones, sin riesgo de que la respuesta altere el formato.
- Priorizacion de colas y triaje: combinar varias preguntas `score` para ordenar elementos por urgencia, integrandolo en un pipeline de atencion automatizada con la API local.
- Agente autonomo en entornos interactivos: como demuestra el ejemplo de Super Mario, observar el estado del juego y elegir la siguiente accion en tiempo real, ejecutandose en local sobre hardware de consumo (MacBook Air M2).
- Categorizacion masiva de documentos y noticias (por ejemplo, AG News) mediante preguntas `choice`, en un unico forward pass por cada fila de pregunta.
- Decisiones compuestas dentro de un sistema mayor: cada pregunta es independiente, lo que permite componer un conjunto de decisiones sin interferencias cruzadas entre ellas.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes. Notese que la columna correspondiente al modelo de ~150M aparece etiquetada como "Lumma-Fev-0.15B", que se corresponde con este modelo (0,1b/154M).

| Benchmark | TypeSafe Jev 1.13.0 | Laya | Lumma-Fev-0.15B | Lumma-Fev-0.6B |
|---|---:|---:|---:|---:|
| Banking77 | 0,87 | 0,425 | 0,47 | 0,9 |
| DAIR Emotion | 0,48 | 0,595 | 0,68 | 0,89 |
| AG News | 0,91 | 0,95 | 0,89 | 0,85 |
| Typed-decisions | 0,72 | 0,76 | 0,2 | 0,3 |
| Promedio | 0,75 | 0,68 | 0,56 | 0,74 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 154M de parametros):
  - bf16 (precision almacenada del backbone): en torno a 308 MB solo de pesos.
  - fp32: en torno a 616 MB solo de pesos.
  - int8 (si se cuantiza): en torno a 154 MB.
  - int4 (si se cuantiza): en torno a 77 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente por tamano; el modelo esta disenado para ejecutarse incluso en hardware de consumo. La demo oficial corre en un MacBook Air M2 (backend MPS).
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en aceleradores integrados, dado su tamano inferior a 1 GB en bf16.
- Opciones de despliegue documentadas:
  - `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `model.to("cuda")`.
  - Paquete `lumma-fev` (`pip install lumma-fev`), que selecciona automaticamente cuda, mps o cpu.
  - Servidor API con `lumma-fev-serve`, que expone `POST /v1/systemone` (contrato TypeSafe), con opcion de API key (`LUMMA_FEV_API_KEY`) y CORS.
  - Cliente Python `lumma_fev.Client` y SDK TypeSafe (`typesafe-sdk`).
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponible (no se proporcionan cifras concretas; la demo de Super Mario sugiere ejecucion en tiempo real en M2).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Banking77 | DAIR Emotion | AG News | Typed-decisions | Promedio | Licencia |
|---|---|---|---|---|---|---|---|---|
| Lumma-Fev-0.1b (0.15B) | 154M | Decision tipada (noul/choice/score) | 0,47 | 0,68 | 0,89 | 0,2 | 0,56 | Apache 2.0 |
| Lumma-Fev-0.6B | No disponible | Decision tipada | 0,9 | 0,89 | 0,85 | 0,3 | 0,74 | No disponible |
| TypeSafe Jev 1.13.0 | No disponible | Decision tipada | 0,87 | 0,48 | 0,91 | 0,72 | 0,75 | No disponible |
| Laya | No disponible | Decision tipada | 0,425 | 0,595 | 0,95 | 0,76 | 0,68 | No disponible |

El modelo de 0.6B de la misma familia supera a esta version de 0.1b en Banking77, DAIR Emotion y en el promedio, pero es peor en AG News y en Typed-decisions. Los parametros, la licencia y la disponibilidad de TypeSafe Jev 1.13.0 y Laya no estan documentados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, por lo que no sirve para tareas de generacion, resumen ni dialogo abierto.
- Idiomas: unicamente ingles; no hay soporte multilingue documentado.
- Contexto limitado: 1.024 tokens de estado y 2.048 tokens por fila de pregunta, lo que restringe documentos largos.
- Numero de opciones acotado: entre 1 y 255 opciones para `choice` y entre 1 y 255 niveles para `score`.
- Calibracion: la `confidence` y las probabilidades son estimaciones del propio modelo. El autor recomienda medir la calibracion sobre datos etiquetados propios antes de condicionar acciones automatizadas a esos valores.
- Rendimiento desigual en la propia tabla de benchmarks: el resultado en Typed-decisions (0,2) es bajo frente a alternativas como TypeSafe Jev 1.13.0 (0,72) o Laya (0,76).
- Riesgo de alucinacion: reducido por diseno al no generar texto y devolver distribuciones sobre opciones predefinidas, pero las probabilidades pueden estar mal calibradas y llevar a decisiones erroneas.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Nandi-Mini-150M.
- Aislamiento entre preguntas: al no ver otras preguntas, el modelo no puede razonar de forma conjunta sobre decisiones relacionadas; cada una se resuelve de forma independiente.
- No se documentan cuantizaciones oficiales ni soporte para runners distintos de `transformers` y `lumma-fev`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-0.1b
- Modelo base Nandi-Mini-150M: https://huggingface.co/FrontiersMind/Nandi-Mini-150M
- Video de demostracion (Super Mario en MacBook Air M2): https://huggingface.co/FrontiersMind/Lumma-fev-0.1b/resolve/main/lumma-01b-playing-mario.mov
- Discord: https://discord.gg/ZGdjCdRt
- Email de soporte: support@frontiersmind.ai
- Web: https://www.frontiersmind.ai/
- LinkedIn: https://www.linkedin.com/company/frontiersmind/
- X (Twitter): https://x.com/FrontiersMind
