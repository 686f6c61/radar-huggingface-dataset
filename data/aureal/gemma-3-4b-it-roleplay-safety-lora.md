# Aureal/gemma-3-4b-it-roleplay-safety-lora

## Resumen

Aureal/gemma-3-4b-it-roleplay-safety-lora es un adaptador LoRA de rango 16 desarrollado por el usuario Aureal sobre el modelo base google/gemma-3-4b-it. No es un modelo completo, sino un adaptador PEFT que modifica el comportamiento del modelo base en escenarios de role-play (juego de rol conversacional), introduciendo una política de cuatro rutas de respuesta y un token de rechazo dedicado. El proyecto surge de un trabajo de interpretabilidad sobre Gemma y el role-play, cuyos resultados y metodología se documentan en un sitio web externo.

El adaptador resuelve un problema concreto: cómo mantener la coherencia de un personaje ficticio sin que el modelo produzca contenido dañino ni abandone la ficción de forma torpe. Para ello enseña al modelo a distinguir entre contenido ficticio inofensivo o oscuro (que se responde en personaje), peticiones que el personaje rechazaría dentro de la historia, situaciones de crisis real del usuario (donde el modelo sale del personaje para derivar a ayuda profesional) y peticiones de daño real (donde emite un único token de rechazo, `<unused0>`, con id 6).

Es relevante ahora porque propone un mecanismo de rechazo legible por máquina (el token `<unused0>`) que permite a las aplicaciones detectar rechazos sin depender del texto generado, y porque aborda el caso especialmente difícil de las peticiones dañinas envueltas en ficción o en jailbreaks "OOC". El repositorio es muy pequeño (0,1 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 3; rango r = 16, alpha = 32, aplicado a todas las proyecciones de atención y MLP del modelo de lenguaje |
| Parametros totales | No disponible (adaptador LoRA; el modelo base google/gemma-3-4b-it tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Gemma 3) |
| Idiomas soportados | No disponible (evaluado en inglés según la model card) |
| Licencia | Gemma Terms of Use, sujeta a la Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado sobre todas las proyecciones de atención y MLP del modelo de lenguaje de google/gemma-3-4b-it. No modifica la arquitectura del transformer subyacente ni el tokenizador; se carga con PeftModel sobre el modelo base en bfloat16 (la model card advierte que float16 desborda en Gemma 3). El token de rechazo es `<unused0>`, con id 6 en el tokenizador del modelo base, y solo aparece como primer token generado.

El entrenamiento se basa en destilación de contexto: las respuestas se generaron con el modelo base bajo instrucciones detalladas por ruta, se filtraron con un modelo juez separado y el adaptador se entrenó sobre las mismas conversaciones sin las instrucciones, durante 3 épocas. El conjunto de entrenamiento no se publica porque contiene conversaciones de crisis y contextos de peticiones dañinas. Las conversaciones de crisis incluyen ejemplos "gold" revisados manualmente, incluidos casos sobre medios de autolesión, con ítems de contraste en los que la misma pregunta se dirige a otra persona (esos reciben el token de rechazo).

## Capacidades

- Generación de texto conversacional en personaje, manteniendo la voz y el registro del personaje definido en el mensaje de sistema.
- Enrutamiento en cuatro rutas: respuesta en personaje, rechazo dentro de la ficción, salida del personaje ante crisis real del usuario y emisión del token de rechazo `<unused0>` ante daño real.
- Rechazo legible por máquina mediante un único token (id 6), detectable por identificador en lugar de por texto decodificado.
- Manejo de peticiones dañinas envueltas en ficción o en jailbreaks explícitos "OOC" (out of character).
- Detección de crisis del usuario (emergencia médica, sobredosis, intención suicida, preguntas sobre medios de autolesión) con derivación a servicios de emergencia, control de intoxicaciones o líneas de crisis.
- Distinción entre preguntas sobre medios de autolesión dirigidas al propio usuario y las dirigidas a otra persona (estas últimas reciben rechazo).
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la evaluación se realizó en inglés.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada (aunque el modelo base Gemma 3 es multimodal, el adaptador se presenta como text-generation).

## Casos de uso

- Aplicaciones de role-play conversacional con personajes ficticios: el adaptador permite mantener la coherencia del personaje en conversaciones multi-turno y gestionar contenido oscuro o con aristas sin romper la ficción, algo útil en plataformas de entretenimiento narrativo.
- Moderación con señal estructurada: el token `<unused0>` permite a un backend detectar un rechazo por daño real mediante comparación de id, sin parsear texto libre, lo que simplifica la lógica de moderación en producción.
- Ficción interactiva y narrativa ramificada: la ruta de "decline inside the story" permite que un personaje rechace una acción dentro de la trama sin salir del universo narrativo, preservando la inmersión.
- Asistentes con personaje en atención al cliente o acompañamiento: el adaptador puede mantener un tono de personaje definido y, ante una crisis real del usuario, cambiar a un mensaje de derivación a ayuda profesional.
- Investigación en interpretabilidad y seguridad de LLM: el adaptador y el cuaderno Colab asociado permiten inspeccionar características, sondas y steering sobre Gemma 3 4B-it mientras responde, útil para estudiar cómo se representa el role-play internamente.
- Evaluación de políticas de rechazo: sirve como banco de pruebas para comparar estrategias de refusal (texto frente a token dedicado) y para medir tasas de falsos rechazos y de rechazos omitidos en escenarios de ficción y jailbreak.
- Prototipado de sistemas de seguridad en chatbots con personas vulnerables: con las cautelas indicadas, permite experimentar con la derivación a recursos de ayuda en conversaciones en personaje, aunque no debe usarse como sistema de seguridad real.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un conjunto de test retenido con cuatro personajes no vistos en entrenamiento más el asistente plano ("You are a helpful assistant."), cuatro muestras por prompt y evaluación por un modelo juez separado.

| Prueba retenida | Resultado |
|---|---|
| Peticiones dañinas en ficción y jailbreaks OOC: token de rechazo | 48/48 |
| Ficción dañina retenida: rechazo / respuesta dañina | 32/32 / 0 |
| Peticiones dañinas al asistente plano: rechazo / respuesta dañina | 90/120 / 0 (el resto son rechazos en texto ordinario) |
| Prompts benignos, con aristas, en mundo e identidad: rechazo | 0/256 |
| Peticiones seguras rechazadas por el asistente plano | 14/120 |
| Preguntas sobre medios de autolesión en personaje: ayuda, sin rechazo, nada dañino | 120/128 |
| Mismas preguntas con el asistente plano | 27/32 |
| Mismas preguntas dirigidas a otra persona: rechazo | 80/80 |
| Amigo en crisis ("mi hermano me envió un mensaje de despedida"): rechazo | 0/64 |
| Rechazo en cualquier mensaje de crisis (objetivo 0) | 33/416 |
| Emergencia explícita fuera de personaje: ayuda | 58/64 |
| Emergencia médica no marcada (sin "OOC"): ayuda clara | 11/27 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica en la información proporcionada; depende del modelo base google/gemma-3-4b-it (4B parámetros) más el adaptador LoRA, que añade una sobrecarga mínima.
- GPU recomendadas: no disponible en la información proporcionada. El modelo base de 4B en bfloat16 requiere del orden de 8-10 GB de VRAM, por lo que cabe en GPUs de consumo con 12 GB o más, pero esta cifra no está confirmada en la model card.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se detalla en la información disponible.
- Opciones de despliegue: la model card documenta el uso con transformers y peft (PeftModel sobre Gemma3ForConditionalGeneration) en bfloat16 con device_map="auto". No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con estos frameworks requeriría fusionar o convertir el adaptador y no está documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque de seguridad | Licencia |
|---|---|---|---|---|---|
| Aureal/gemma-3-4b-it-roleplay-safety-lora | LoRA sobre Gemma 3 4B-it | 4B (base) + adaptador | No disponible | Cuatro rutas + token de rechazo dedicado | Gemma Terms of Use |
| google/gemma-3-4b-it | Modelo completo | 4B | No disponible en la información proporcionada | Alineación general de Gemma | Gemma Terms of Use |
| Adaptadores LoRA de role-play genéricos | LoRA sobre modelos abiertos | Variable | Variable | No específico | Variable |

No se dispone de datos de rendimiento comparativos con otros adaptadores de seguridad o role-play en la información proporcionada.

## Limitaciones y advertencias

- Aproximadamente el 8 % de los mensajes de crisis se enrutan erróneamente al token de rechazo, concentrado en unos pocos prompts (por ejemplo, mezclar alcohol con antidepresivos "para no despertar"). Un rechazo en ese punto deja al usuario sin ayuda; una aplicación no debe tratar el token de rechazo como fin de la conversación.
- Las emergencias médicas no marcadas (dolor torácico, entumecimiento, expresadas en escena sin "OOC") a menudo reciben una respuesta a medias en personaje en lugar de una instrucción clara de llamar a emergencias.
- La evaluación se realizó en inglés, con conversaciones cortas y un conjunto limitado de personajes y tipos de crisis; no hay datos sobre otros idiomas ni sobre conversaciones largas.
- Es un artefacto de investigación, no un sistema de seguridad; no debe usarse para proteger a usuarios vulnerables.
- Un guard de ejecución que elimina el token de rechazo cuando se activa una sonda de crisis se probó y no funcionó de forma segura, según el informe del proyecto.
- El conjunto de entrenamiento no se publica por contener conversaciones de crisis y contextos de peticiones dañinas, lo que limita la reproducibilidad.
- La licencia Gemma Terms of Use y la Gemma Prohibited Use Policy imponen restricciones al uso comercial y a determinados usos; es un derivado de Gemma y está sujeto a esas condiciones.
- Riesgo de alucinación y sesgos: no disponible de forma específica en la información proporcionada, más allá de las limitaciones de enrutamiento descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aureal/gemma-3-4b-it-roleplay-safety-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Informe del proyecto (método y resultados): https://unkarelian.github.io/gemma-roleplay-interpretability/findings.html#fixes
- Cuaderno Colab de exploración interactiva: https://colab.research.google.com/github/unkarelian/gemma-roleplay-interpretability/blob/main/colab/gemma_roleplay_explorer.ipynb
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
