# SlayerLab/Slayer1B-1.09-Instruct

## Resumen

Slayer1B 1.09 Instruct es una instantánea de preparación (snapshot) de un experimento de ajuste por instrucciones sobre el checkpoint base Slayer1B 1.09, desarrollado por el equipo Fabryka AI (SlayerLab), con autores como Arkadiusz Słota, Anna Sieczka, Piotr Styła, Aleksander Ogrodzki, Paweł Puzio y Marcin Kuśmierski. El objetivo declarado es el de asistente conversacional y seguimiento de instrucciones en polaco e inglés, con fines de investigación.

Es importante subrayar que esta ficha describe una instantánea fechada el 13 de noviembre de 2026 a las 13:09 UTC, no un modelo instruct terminado. No se ha publicado ningún peso ajustado por instrucciones, adaptador ni conjunto de datos con esta instantánea; la admisión de datos de entrenamiento y el lanzamiento del entrenamiento siguen pendientes. El punto de partida seleccionado es Slayer1B 1.09, actualización 35.000, archivo `wagi_35000.pt`, un checkpoint base y no una versión instruct existente.

La relevancia de esta ficha es, por tanto, documental y de seguimiento: permite a desarrolladores e investigadores conocer el plan de SFT basado exclusivamente en datos públicos (Aya Dataset y OASST2), las fronteras de evaluación previstas y las limitaciones explícitas del autor antes de que exista un artefacto ejecutable. La licencia declarada es Apache-2.0, tanto para el checkpoint base como para las dos fuentes de SFT candidatas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (arquitectura heredada del checkpoint base Slayer1B 1.09; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Polaco (pl) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint nativo de entrenamiento (`wagi_35000.pt`); no es un artefacto compatible con Transformers ni un release de chat |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada; la model card remite a la ficha del modelo base Slayer1B 1.09, que describe la arquitectura heredada y el preentrenamiento continuado. El checkpoint de partida es la actualizacion 35.000 del archivo de checkpoints, identificada como `wagi_35000.pt` en la revision fijada `c9609f273a69a317c62ad3ad033c1d88a0f97912`. Se trata de un checkpoint base, no de un release instruct, y el archivo contiene checkpoints nativos de entrenamiento que no deben confundirse con un release de chat compatible con Transformers.

El plan de SFT se basa exclusivamente en datos publicos: la porcion polaca de pares instruccion-respuesta del Aya Dataset (contribuidores de Aya Open Science / Cohere Labs, revision fijada `f9ea04583f02a8f86404ff6c58bf75fe637df8a2`, licencia Apache-2.0) y conversaciones en polaco e ingles de OpenAssistant Conversations Release 2 (OASST2, comunidad OpenAssistant, revision fijada `179dd21fc55192153d94adb0e0ce8f69e222bf75`, licencia Apache-2.0). La seleccion preparada esta sujeta a comprobaciones de procedencia, privacidad y solapamiento con evaluacion antes del entrenamiento; los recuentos candidatos previos a esas comprobaciones no se presentan como recuentos finales ni como exposicion de tokens. La primera etapa planificada es SFT; no se reclama ningun resultado de DPO ni de promediado de pesos en esta instantanea. El plan exige que las interfaces de entrenamiento y de chat usen el mismo formato de conversacion, y que se verifiquen la mascara de perdida y el fin de turno del asistente antes de publicar un artefacto de chat.

## Capacidades

- Generacion de texto y conversacion de asistente: capacidad objetivo declarada, pendiente de entrenamiento y evaluacion.
- Seguimiento de instrucciones en polaco e ingles: tarea prevista del experimento de SFT.
- Capacidades multilingues limitadas a los dos idiomas declarados (pl, en).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Codigo y matematicas: no disponible como capacidad declarada.

## Casos de uso

- Investigacion sobre ajuste por instrucciones en lenguas eslavas: el modelo sirve como caso de estudio para analizar como un checkpoint base de ~1B parametros responde a SFT con datos publicos en polaco, comparando de forma ciega por pares contra el mismo checkpoint sin ajustar.
- Evaluacion de procedencia y privacidad de datos: el plan de admision de datos (Aya y OASST2 con revisiones fijadas) permite auditar la trazabilidad de las fuentes antes de entrenar, util para equipos que necesitan documentar el origen de sus datos de SFT.
- Desarrollo de pipelines de chat en polaco: una vez exista un artefacto post-entrenado, se podria integrar en prototipos de asistente conversacional para usuarios polacos, siempre con evaluacion previa de calidad.
- Reproducibilidad de experimentos de alineacion: la fijacion de revisiones de datasets y checkpoints permite reproducir el plan de SFT y comparar resultados con el checkpoint base.
- Analisis de mascaras de perdida y formato conversacional: el requisito explicito de verificar la mascara de perdida y el fin de turno lo convierte en un caso practico para estudiar errores de formato en SFT.
- Docencia y formacion en IA open source: la ficha y el plan documentado sirven como material didactico sobre las fases previas al lanzamiento de un modelo instruct (admission de datos, evaluacion ciega, limites de publicacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publican puntuaciones de seguimiento de instrucciones ni comparaciones de respuestas generadas en esta instantanea, y que una perdida de entrenamiento menor por si sola no demostraria mejor seguimiento de instrucciones. Las puntuaciones de benchmarks del modelo base son mediciones descriptivas separadas, no resultados de este experimento de ajuste por instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros; el nombre del modelo sugiere ~1B, pero no se confirma en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no hay artefacto de inferencia publicado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el checkpoint es nativo de entrenamiento y no es compatible con Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Slayer1B 1.09 Instruct | no disponible (~1B por nombre) | no disponible | pl, en | Apache-2.0 | Instantanea de preparacion, sin pesos instruct publicados |
| Slayer1B 1.09 (base) | no disponible | no disponible | pl, en (segun tags) | Apache-2.0 | Checkpoint base publico (actualizacion 35.000) |
| Alternativas de ~1B instruct | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparativa cuantitativa con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No existe artefacto de inferencia post-entrenado en esta instantanea: no se puede ejecutar un ejemplo de chat ni asumir que cargar el archivo base produce un modelo instruct.
- La model card advierte que el modelo planificado puede producir texto incorrecto, sesgado, inseguro o personal; no se garantiza fiabilidad profesional, privacidad ni mejora en razonamiento o conversacion multiturno antes de la evaluacion.
- No se reclama ninguna mejora de calidad sobre el modelo base; la comparacion principal prevista es una evaluacion ciega por pares contra el mismo checkpoint sin ajustar.
- El entrenamiento y la admision de datos siguen pendientes; los recuentos de datos candidatos no son definitivos.
- Las declaraciones de licencia Apache-2.0 de las fuentes no sustituyen la revision de los registros seleccionados, los requisitos de atribucion ni el futuro release post-entrenado; la ficha no redistribuye conversaciones fuente ni concede derechos adicionales sobre ellas.
- Idiomas limitados a polaco e ingles; no hay soporte declarado para otras lenguas.
- No hay soporte declarado de tool calling, agentes, vision ni audio.
- El checkpoint es nativo de entrenamiento, no compatible con Transformers, lo que limita su uso directo en pipelines estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.09-Instruct
- Checkpoint base en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.09-checkpoints
- Revision fijada del archivo de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.09-checkpoints/tree/c9609f273a69a317c62ad3ad033c1d88a0f97912
- Model card del modelo base: https://huggingface.co/SlayerLab/Slayer1B-1.09/blob/6484a05ff42bc8a00a5147aaabb745198680feaa/README.md
- Aya Dataset (revision fijada): https://huggingface.co/datasets/CohereLabs/aya_dataset/tree/f9ea04583f02a8f86404ff6c58bf75fe637df8a2
- OpenAssistant Conversations Release 2 (revision fijada): https://huggingface.co/datasets/OpenAssistant/oasst2/tree/179dd21fc55192153d94adb0e0ce8f69e222bf75
