# saahilpal17/propeval-laya-hinglish-realestate-v1

## Resumen

`propeval-laya-hinglish-realestate-v1` es un clasificador de texto de muy baja latencia desarrollado por Sahil Pal (saahilpal17) como primer nivel de la cascada PropEval System-1 → System-2, un marco de evaluación y enrutamiento para agentes de voz conversacionales en el sector inmobiliario indio. No es un modelo neuronal: se trata de un pipeline de scikit-learn que combina un vectorizador de n-gramas de caracteres (1-5) y palabras (1-2) con cabezas lineales regularizadas y un escalado de temperatura post-hoc ajustado por L-BFGS. El artefacto completo pesa 0,60 MB y se ejecuta en CPU con una latencia de 0,365 ms en P50 y 0,375 ms en P95.

El modelo resuelve cuatro tareas concretas sobre turnos de conversación en hinglish: detección de solicitudes de exclusión TRAI (Do-Not-Call), confirmación de compromisos vinculantes, detección de intentos de inyección de prompt y enrutamiento fino de objeciones en seis clases (precio, ubicación, plazo de posesión, servicios, reputación del promotor y ninguna). Su relevancia radica en que demuestra que una capa extremadamente barata y calibrada puede resolver la mayoría de turnos sin invocar un juez LLM, reduciendo el coste de cómputo a prácticamente cero en producción.

La limitación principal, declarada por el propio autor, es su caída de rendimiento fuera de distribución: el Macro-F1 baja de 0,9624 en datos en distribución a 0,6721 ante jerga hindi coloquial no vista durante el entrenamiento. El sistema compensa esto mediante una puerta de confianza que eleva la escalada al System-2 del 7,94 % al 35,71 % en esos casos, manteniendo una precisión global de cascada del 97,62 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectorizador sublineal de n-gramas de caracteres (1-5) y palabras (1-2) + cabezas lineales regularizadas + escalado de temperatura L-BFGS |
| Parametros totales | no disponible (modelo lineal disperso; tamano del artefacto 0,60 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por turno individual) |
| Tipos de cuantizacion | no aplica (pesos lineales en joblib) |
| Idiomas soportados | en, hi (hinglish conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (artefacto `real_estate_laya_model.joblib`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer sino un pipeline clásico de scikit-learn. La entrada se transforma mediante un vectorizador de n-gramas de caracteres (de 1 a 5) combinado con n-gramas de palabras (de 1 a 2), lo que permite capturar variantes morfológicas y errores de transcripción típicos del habla telefónica en hinglish. Sobre esa representación dispersa se entrenan cabezas de clasificación lineal regularizadas, una por tarea: `dnc_refusal`, `action_confirmation`, `prompt_injection` y `objection_class` (esta última con seis clases).

El elemento técnico diferencial es la calibración post-hoc mediante escalado de temperatura ajustado por L-BFGS, que minimiza la log-verosimilitud negativa sobre el conjunto de validación. Esto produce probabilidades posteriores utilizables directamente por una puerta de confianza: cuando la probabilidad cae en la zona no comprometida (0,15 < p < 0,85), el turno se escala al juez System-2. El resultado es un Error de Calibración Esperado (ECE) de 0,0307 en el modelo crudo y de 0,0209 en la cascada completa. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, más allá de la referencia al conjunto `saahilpal17/propeval-hinglish-realestate-eval`.

## Capacidades

- Clasificación de texto multietiqueta por turno conversacional, con cuatro cabezas independientes.
- Detección de opt-out TRAI (Do-Not-Call): reconoce formulaciones explícitas y coloquiales como "call mat karo" o "number hatao".
- Detección de confirmaciones vinculantes: identifica compromisos explícitos y coloquiales como "done samjho" o "kal 4 baje".
- Detección de inyección de prompt: identifica rupturas de delimitadores e intentos de escape de instrucciones.
- Enrutamiento de objeciones en seis clases: `PRICE`, `LOCATION`, `POSSESSION_TIMELINE`, `AMENITIES`, `BUILDER_REPUTATION` y `NONE`.
- Salida de probabilidad calibrada apta para puertas de confianza y enrutamiento condicional.
- Inferencia en CPU de un solo núcleo con latencia sub-milisegundo.
- Soporte de hinglish (mezcla hindi-inglés) en registro telefónico coloquial.
- No soporta tool calling, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Enrutamiento de objeciones en agentes de voz inmobiliarios: cada turno del cliente se clasifica en una de las seis categorías de objeción en menos de 0,4 ms, lo que permite al agente seleccionar la respuesta adecuada sin esperar a un LLM.
- Cumplimiento TRAI en tiempo real: la cabeza `dnc_refusal` detecta solicitudes de exclusión telefónica y permite marcar el número y cerrar la llamada de forma inmediata, con probabilidad calibrada para auditar la decisión.
- Verificación de compromisos en llamadas de seguimiento: la cabeza `action_confirmation` identifica cuándo el cliente acepta una visita o una llamada ("kal 4 baje") y dispara la creación del evento en el CRM.
- Defensa frente a inyección de prompt en pipelines de voz: la cabeza `prompt_injection` filtra turnos que intentan manipular al LLM del System-2 antes de que lleguen a él, reduciendo superficie de ataque y coste.
- Reducción de coste en cascadas LLM: al resolver entre el 92 % y el 64 % de los turnos en System-1 según la distribución, evita invocar el juez LLM (aproximadamente 1.850 ms por llamada) en la mayoría de interacciones.
- Prefiltrado en evaluación y regresión de prompts: integrado en el banco de trabajo PropEval, clasifica grandes volúmenes de transcripciones para etiquetar objeciones y opt-outs antes de análisis manuales o de evaluación con LLM.
- Despliegue en entornos con recursos mínimos: al ocupar 0,60 MB y ejecutarse en CPU, puede embeberse en el propio servidor de telefonía o en un contenedor sin GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card, verificados según el autor por una auditoría de Huvo AI. Conjunto en distribución: `datasets/system1/test.jsonl` (N=252). Conjunto fuera de distribución: `datasets/system1/ood_test.jsonl` (N=126).

| Modelo / paradigma | Macro-F1 ID | Macro-F1 OOD | Precision OOD | Latencia CPU P95 | Tamano | ECE |
|---|---|---|---|---|---|---|
| Real-Estate Laya (S1 crudo) | 0,9624 | 0,6721 | 66,67 % | 0,36 ms | 0,60 MB | 0,0307 |
| SetFit (Sentence Transformers) | 0,9647 | 0,8415 | 83,33 % | 8,71 ms | 471,0 MB | 0,0768 |
| mDeBERTa-v3-base-mnli-xnli | 0,5780 | 0,5124 | 50,79 % | 1.168,9 ms | 558,0 MB | 0,2042 |
| Juez System-2 calibrado | 0,9854 | 0,9530 | 95,24 % | ~1.850 ms | API en la nube | 0,0480 |
| Cascada PropEval (Laya + puerta) | 0,9929 | 0,9762 | 97,62 % | 0,38 ms (resueltos) | 0,60 MB | 0,0209 |

La tasa de escalada al System-2 pasa del 7,94 % en distribución al 35,71 % fuera de distribución, lo que sostiene la precisión de la cascada a costa de invocar el juez en más turnos.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia exclusivamente en CPU.
- RAM: el artefacto ocupa 0,60 MB y cabe en caché L3 de CPU, por lo que el consumo de memoria es despreciable.
- GPU recomendadas: ninguna; el modelo está diseñado para CPU de un solo núcleo (medido en Apple Silicon e Intel).
- Cabe en cualquier GPU consumer, aunque no la aprovecha; también en Raspberry Pi y contenedores de 64 MB.
- Opciones de despliegue: carga directa con `joblib` en Python; integración en servicios FastAPI, Flask o funciones serverless; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,365 ms P50 y 0,375 ms P95 en CPU de un solo núcleo; 0,38 ms P95 en la cascada cuando el turno se resuelve en System-1.
- Throughput: no disponible de forma explícita, pero la latencia sub-milisegundo implica capacidad de miles de clasificaciones por segundo por núcleo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Macro-F1 OOD | Latencia P95 | Licencia |
|---|---|---|---|---|---|
| propeval-laya-hinglish-realestate-v1 | N-gramas + lineal calibrado | 0,60 MB | 0,6721 (crudo) / 0,9762 (cascada) | 0,36 ms | Apache 2.0 |
| SetFit (Sentence Transformers) | Embeddings densos + clasificador | 471,0 MB | 0,8415 | 8,71 ms | no disponible en la información |
| mDeBERTa-v3-base-mnli-xnli | Transformer encoder | 558,0 MB | 0,5124 | 1.168,9 ms | no disponible en la información |
| Juez System-2 calibrado | LLM en la nube | no disponible | 0,9530 | ~1.850 ms | no disponible en la información |

La comparación relevante no es de precisión bruta sino de coste por turno: Laya crudo es entre 24 y 3.200 veces más rápido que las alternativas y tres órdenes de magnitud más pequeño, a cambio de menor robustez ante jerga no vista, que la puerta de confianza compensa derivando al System-2.

## Limitaciones y advertencias

- Caída acusada fuera de distribución: el Macro-F1 pasa de 0,9624 a 0,6721 ante slang hindi coloquial no visto ("dimag ka dahi mat banao", "budget ka thoda locha hai", "jeb thodi dheeli hai"), porque el vocabulario disperso de n-gramas no captura tokens raros.
- Dependencia crítica de la puerta de confianza: sin el componente System-2, el modelo crudo no es fiable en producción sobre tráfico real diverso.
- La calibración de temperatura es load-bearing: las probabilidades en la zona 0,15 < p < 0,85 deben escalarse; usarlas sin umbral produce decisiones erróneas.
- Ámbito restringido: solo clasifica cuatro tareas concretas en hinglish inmobiliario telefónico; no es un modelo de propósito general ni genera texto.
- Idiomas limitados a inglés e hindi; no se ha validado en otras variedades del subcontinente ni en castellano.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsos positivos y negativos en las cabezas de clasificación, con impacto directo en cumplimiento TRAI.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al inmobiliario indio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el artefacto se publicó en noviembre de 2026; no hay validación independiente fuera de la auditoría declarada por el autor.
- No se documentan sesgos demográficos ni evaluación por subgrupos (género, región, nivel educativo), lo que supone un riesgo en un caso de uso regulado como las llamadas comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saahilpal17/propeval-laya-hinglish-realestate-v1
- Repositorio PropEval en GitHub: https://github.com/saahilpal/propeval
- Repositorio de entrenamiento: https://github.com/saahilpal/propeval-laya-training
- Dataset de evaluación: https://huggingface.co/datasets/saahilpal17/propeval-hinglish-realestate-eval
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
