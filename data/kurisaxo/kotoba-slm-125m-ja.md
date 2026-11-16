# kurisaxo/kotoba-slm-125m-ja

## Resumen

Kotoba-SLM 125M es un modelo de lenguaje de pequena escala (SLM) especializado en conversacion en japones, desarrollado desde cero por el autor independiente kurisaxo. El modelo se presenta en dos variantes: una configuracion estandar de 124,6M de parametros y una configuracion extendida de 140,9M. Su propuesta diferencial no es el rendimiento bruto, sino un mecanismo de "enrutamiento epistemico" que le permite declarar explicitamente cuando no sabe algo, evitando tanto la alucinacion como la negativa mecanica.

La arquitectura sigue el patron "Deep & Narrow" popularizado por SmolLM2 y MobileLLM: 30 capas, dimension oculta de 576, atencion con GQA (9 cabezas de query, 3 de key/value), QK-Norm, RoPE, SwiGLU y comparticion de pesos entre embedding y cabeza LM. El tokenizador es un Byte-Level BPE de 32.000 vocabulos entrenado especificamente sobre corpus conversacionales y de cultura general en japones, con normalizacion NFC y sin tokens desconocidos.

El modelo esta disenado para completar su entrenamiento dentro de una sesion gratuita de Kaggle (2x T4, 30 horas semanales, maximo 12 horas por sesion), e incluye un sistema de checkpointing de cinco capas con reanudacion automatica. Es relevante para quienes investigan SLMs en japones, tecnicas de calibracion de incertidumbre en modelos pequenos y flujos de entrenamiento de bajo presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only "Deep & Narrow" (30 capas, dim. oculta 576, GQA Q9/KV3, QK-Norm, RoPE, SwiGLU) |
| Parametros totales | 124,6M (estandar) / 140,9M (extendida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (principal); no se detallan otros |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder-only con estructura "Deep & Narrow": 30 capas con una dimension oculta relativamente baja de 576. La atencion usa Grouped Query Attention con 9 cabezas de query y 3 de key/value, incorpora QK-Norm (necesario para estabilidad en FP16 sobre GPUs Turing como la T4, donde los productos internos de atencion pueden desbordar), RoPE para codificacion posicional, SwiGLU como activacion en el FFN y comparticion de pesos entre la capa de embedding y la cabeza de lenguaje. Segun el autor, mas del 85% de los parametros se concentran en las capas de comprension de contexto y control de dialogo.

El tokenizador es un Byte-Level BPE de 32.000 vocabulos entrenado desde cero sobre corpus de conversacion y cultura general en japones, con normalizacion NFC y sin casos de token `<unk>`. El entrenamiento se disena para caber en una sesion gratuita de Kaggle (2x T4, FP16, maximo 12 horas por sesion) e incluye un mecanismo de parada segura de cinco capas: monitor de timeout software a las 11h15m, captura de senales SIGTERM/SIGINT, guardado completo del estado (pesos, momentos de AdamW, scheduler WSD, GradScaler FP16, offset exacto de lectura del dataset y estado RNG), rotacion atomica de dos generaciones de checkpoint con verificacion SHA256 y reanudacion multi-sesion mediante `pipeline_state.json` en Hugging Face Hub. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en japones, con soporte de registro formal (`<|style:polite|>`) e informal (`<|style:casual|>`).
- Enrutamiento epistemico: predice un token inicial `<|known|>` o `<|unknown|>` segun si el tema cae dentro de su ambito (charla cotidiana, empatia, informacion en contexto, cultura general de nivel escolar) o fuera de el (conocimiento especializado, nombres propios oscuros, estadisticas, informacion en tiempo real, premisas ficticias).
- Expresion natural de ignorancia: ante temas desconocidos genera respuestas como disculpa sincera seguida de una pregunta de continuacion, en lugar de alucinar o rechazar mecanicamente.
- Conversacion multi-turno con mantenimiento de contexto.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso con agentes, vision, audio ni modo "thinking".

## Casos de uso

- Chatbot conversacional japones de bajo coste: el modelo cabe en GPUs de consumo y puede desplegarse como asistente de charla cotidiana con registro formal o informal conmutable mediante tokens de estilo.
- Atencion al cliente con gestion de incertidumbre: el enrutamiento epistemico permite derivar a un humano o a una base de conocimiento cuando el modelo detecta que la consulta cae fuera de su ambito, reduciendo respuestas inventadas en produccion.
- Companero conversacional para practica de japones: la alternancia entre `<|style:polite|>` y `<|style:casual|>` lo hace util para ejercitar registros linguisticos en entornos educativos.
- Investigacion sobre calibracion de incertidumbre: sirve como banco de pruebas de bajo coste para estudiar tecnicas de "saber que no se sabe" en modelos pequenos, comparando el comportamiento del token `<|known|>`/`<|unknown|>` con metodos basados en logprobs.
- Prototipado rapido en entornos con recursos limitados: su tamano (125M) permite iterar en una sola GPU de consumo o incluso en CPU con cuantizacion, aunque los formatos de cuantizacion no estan documentados.
- Educacion e investigacion sobre entrenamiento de bajo presupuesto: el sistema de checkpointing de cinco capas y la reanudacion automatica en Kaggle son reutilizables como referencia para entrenar SLMs en sesiones con limite de tiempo.
- Filtrado o pre-clasificacion de consultas: el token inicial de conocimento/desconocimiento puede usarse como senal ligera en pipelines de enrutamiento antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (125M-141M parametros), en FP16 serian aproximadamente 250-280 MB de pesos, y en cuantizacion de 8 bits alrededor de 125-140 MB, aunque los formatos de cuantizacion no estan documentados.
- GPU de entrenamiento de referencia: 2x NVIDIA T4 (16 GB cada una) en FP16, entorno de Kaggle.
- GPU recomendadas para inferencia: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100); el modelo es lo bastante pequeno para caber en practicamente cualquier GPU moderna.
- Cabe en GPU de consumo: si, con margen amplio; tambien es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: no se documentan en la informacion disponible (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI); al ser un modelo propio con codigo en `src/model/modeling_kotoba.py`, requeriria integracion manual o conversion a formatos estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kotoba-SLM 125M | 124,6M / 140,9M | no disponible | Conversacion en japones con enrutamiento epistemico | no disponible | Hugging Face (0 descargas) |
| SmolLM2-135M | 135M | no disponible en esta ficha | SLM generalista multilingue | no disponible en esta ficha | Hugging Face |
| MobileLLM-125M | 125M | no disponible en esta ficha | SLM "deep & narrow" para dispositivos | no disponible en esta ficha | Hugging Face |

La comparacion se limita a la arquitectura y el tamano, ya que no hay datos publicados de benchmarks para Kotoba-SLM que permitan contrastar rendimiento. SmolLM2 y MobileLLM son las referencias arquitectonicas declaradas por el autor, pero no se dispone de cifras comparativas verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide validar las afirmaciones de la model card.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Modelo muy reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Ambito de conocimiento deliberadamente limitado: el propio diseno asume que el modelo no sabe de temas especializados, estadisticas o informacion en tiempo real; no es adecuado para tareas de conocimiento factual.
- Riesgo de alucinacion persistente: aunque el enrutamiento epistemico mitiga el problema, no lo elimina; el token `<|known|>`/`<|unknown|>` es una prediccion y puede fallar.
- Cobertura linguistica restringida al japones: no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas que requieran ventanas largas.
- Formato de pesos no disponible: la integracion con herramientas estandar (vLLM, llama.cpp, Ollama) no esta confirmada y podria requerir conversion manual.
- Entrenado en un presupuesto de computo muy limitado (sesiones gratuitas de Kaggle), lo que acota la calidad maxima alcanzable en comparacion con SLMs entrenados con mas recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurisaxo/kotoba-slm-125m-ja
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
