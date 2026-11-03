# Saiyv43/WardSpace-Handoff-Qwen3.5-4B-LoRA

## Resumen

WardSpace-Handoff-Qwen3.5-4B-LoRA es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario Saiyv43 mediante la plataforma AutoScientist de Adaption, y su proposito es reconstruir alertas no resueltas de cuidadores a partir de historiales de eventos sinteticos, emitiendo estados `pending` e identificadores `needs_visit`. El adaptador no contiene pesos completos del modelo base: es un artefacto de aproximadamente 82 MB que debe cargarse junto a una instancia compatible de Qwen3.5-4B.

El modelo resuelve un problema de razonamiento de estado sobre secuencias de eventos: determinar si una alerta sigue pendiente requiere distinguir entre eventos de atencion explicita, notas, check-in de edificio y cierres, y gestionar reaperturas posteriores. Es un caso de uso de dominio muy acotado, orientado a logica de workflow y no a generacion abierta. La relevancia actual es limitada: se trata de un experimento de entrenamiento sintetico con validacion incompleta, no de un modelo listo para produccion.

La ficha se basa exclusivamente en la model card publicada. No hay informacion sobre idiomas soportados, benchmarks estandar ni evaluacion en el conjunto reservado de 300 casos, que segun el autor permanece sin medir por falta de un endpoint de inferencia operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); checkpoint empaquetado en tar comprimido con Zstandard de 81.981.852 bytes |

Parametros de entrenamiento declarados: rango LoRA 16, alpha 32, dropout 0, una epoca, learning rate 0,00005, schedule coseno, warmup ratio 0,03, max grad norm 2, loss solo en completions. Estado del trainer con 23 pasos globales y loss de evaluacion final de 0,0293486118.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parametros. La model card no detalla la arquitectura interna del base (atencion, capas, contexto nativo) ni la composicion del dataset de preentrenamiento de Qwen3.5-4B. El entrenamiento se realizo con AutoScientist de Adaption en una unica iteracion completada de un maximo de tres, con instrucciones supervisadas y loss calculada unicamente sobre las completions.

Los datos son enteramente sinteticos: 1.800 entradas unicas de entrenamiento y 300 de validacion reservada, generadas con la misma distribucion pero semillas distintas, con solapamiento exacto cero. El manifiesto del dataset (`training/dataset-manifest.json`) registra ficheros, semillas, recuentos y hashes. La configuracion del adaptador referencia como base de entrenamiento `togethercomputer/Qwen3.5-4B`, lo que obliga a cargar un base compatible al desplegar. No se documenta RLHF, DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de texto conversacional segun el pipeline declarado (`text-generation`).
- Razonamiento sobre estados de workflow: reconstruccion de alertas no resueltas a partir de historiales de eventos.
- Emision de estados estructurados: etiquetas `pending` e identificadores `needs_visit`.
- Distincion de tipos de evento: atencion explicita, notas, check-in de edificio y cierre, con reglas de reapertura.
- Entrenamiento con datos sinteticos orientado a seguir instrucciones de dominio.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso general: no disponibles.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Reconstruccion de alertas en plataformas de teleasistencia: el adaptador procesa secuencias de eventos de un cuidador y determina que alertas siguen pendientes, diferenciando una atencion real de una nota o un check-in de edificio.
- Generacion de listas de visitas pendientes: a partir de un historial, emite los identificadores `needs_visit` para enrutar al personal de campo.
- Auditoria de cierres y reaperturas: verifica que un cierre elimina la alerta y que un evento posterior la reabre, util para validar la logica de un motor de workflow.
- Prototipado de motores de handoff: sirve como referencia entrenada frente a un motor determinista para comparar comportamiento en entornos de desarrollo.
- Investigacion sobre datos sinteticos: caso de estudio de entrenamiento LoRA con distribuciones generadas y splits sin solapamiento, util para metodologia de evaluacion.
- Pruebas de integracion de adaptadores PEFT: permite validar pipelines de carga de adaptadores sobre Qwen3.5-4B en entornos de CI antes de disponer de un modelo afinado propio.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Win rate en plataforma | 91,54% | Supera el objetivo configurado del 70%; compara respuestas en evaluaciones de la plataforma |
| Loss de evaluacion final | 0,0293486118 | Sobre el estado del trainer exportado |
| Pasos globales | 23 | Una epoca completada |
| Precision exacta en 300 casos reservados | no medida | Requiere endpoint de inferencia operativo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El win rate de plataforma no equivale a precision exacta en el conjunto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia de orden de magnitud para un base de 4B en precision completa se requiere del orden de 8-10 GB, y menos con cuantizacion, pero el autor no publica cifras.
- GPU recomendadas: no disponibles. El autor indica que la maquina de inspeccion contaba solo con PyTorch en CPU y aproximadamente 3,3 GB de RAM disponible.
- Cabe en GPU de consumo: previsiblemente si con el base de 4B cuantizado, aunque no hay confirmacion del autor.
- Opciones de despliegue: carga mediante PEFT sobre una instancia compatible de Qwen3.5-4B. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El endpoint publico de Adaption devolvio HTTP 404 Model not found para el modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| WardSpace-Handoff-Qwen3.5-4B-LoRA | LoRA sobre base 4B | no disponible | Alertas de cuidadores (dominio acotado) | apache-2.0 | Adaptador exportado, inferencia no verificada |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Generacion de texto general | no disponible en esta ficha | Publico en HuggingFace |
| Alternativas de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma tarea (reconstruccion de alertas de cuidadores), por lo que la comparativa funcional queda limitada al modelo base.

## Limitaciones y advertencias

- Todos los ejemplos de entrenamiento son historiales de workflow fabricados; no hay validacion clinica ni evaluacion independiente del workflow.
- Los resultados no establecen que un paciente este seguro ni que la atencion haya sido verificada de forma independiente.
- El adaptador no incluye los pesos del modelo base; sin una instancia compatible de Qwen3.5-4B no es funcional por si solo.
- El endpoint publico de Adaption devolvio HTTP 404 para el modelo entrenado y la inferencia permanece deshabilitada hasta configurar un endpoint soportado.
- La precision exacta en los 300 casos reservados no se ha medido; el win rate del 91,54% es una metrica de plataforma, no una evaluacion held-out.
- Riesgo de alucinacion en la generacion de estados e identificadores no cuantificado.
- Idiomas soportados no documentados; no se garantiza comportamiento fuera del dominio de entrenamiento.
- Licencia apache-2.0 en el adaptador, pero el uso comercial depende tambien de la licencia del modelo base Qwen3.5-4B, no detallada aqui.
- Sin descargas ni likes en el momento de la consulta; sin validacion por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Saiyv43/WardSpace-Handoff-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Base de entrenamiento referenciada en la configuracion: https://huggingface.co/togethercomputer/Qwen3.5-4B
- Plataforma de entrenamiento (Adaption AutoScientist): no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
