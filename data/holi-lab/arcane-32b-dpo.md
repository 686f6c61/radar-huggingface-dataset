# holi-lab/ArcANE-32B-DPO

## Resumen

ArcANE-32B-DPO es un modelo de lenguaje de 32 mil millones de parametros desarrollado por holi-lab, resultado de un ajuste fino sobre Qwen3-32B mediante supervisión (SFT) seguido de optimización de preferencias directas (DPO). Su objetivo es mejorar la capacidad de los agentes de role-play para mantenerse en personaje en el momento correcto de una narrativa, condicionando las respuestas a un arco de personaje truncado por capítulo. El modelo fue aceptado en la conferencia EMNLP 2026.

El modelo se publica bajo licencia Apache 2.0 y esta disponible en formato safetensors en HuggingFace. Se recomienda su uso con la plantilla de chat de Qwen3 con el modo de pensamiento desactivado. La arquitectura es un transformer decoder-only basado en Qwen3-32B, con 32.762.123.264 parametros totales. No se especifica la longitud de contexto en la informacion disponible, aunque el entrenamiento se realizo con secuencias de hasta 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-32B) |
| Parametros totales | 32.762.123.264 (32,7B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible; entrenamiento con hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ArcANE-32B-DPO parte del modelo Qwen3-32B y se entrena en dos etapas. Primero, una etapa de ajuste fino supervisado (SFT) con respuestas objetivo generadas por profesores bajo contexto de arco. Despues, una etapa de DPO con 14.671 pares de preferencia procedentes de 2.516 sondas unicas. En cada par, la respuesta elegida pertenece a la fase ancla y la rechazada a una fase adyacente, pero ambas comparten el mismo escenario y pregunta. Esta configuracion obliga al modelo a distinguir cambios de comportamiento sutiles entre fases narrativas vecinas.

El ajuste se realiza con LoRA de rango 64 y alpha 128, sin actualizar todos los parametros. Los datos de entrenamiento provienen del corpus ArcANE, compuesto por 12 novelas, 55 personajes y 339 ejes de personaje. El entrenamiento se llevo a cabo con 1 epoca en cada etapa, con tasa de aprendizaje de `1e-4` en SFT y `1e-5` en DPO, y un tamano de lote de 32 y 64 respectivamente. La evaluacion se realiza sobre un subconjunto reservado de cinco novelas con 25 personajes principales, 205 arcos y 1.754 sondas.

## Capacidades

- Generacion de respuestas en personaje para un punto temporal concreto de la historia, condicionado por el arco de personaje truncado al capitulo consultado.
- Distincion de cambios de comportamiento entre fases narrativas adyacentes, especialmente en los ejes de accion y razonamiento.
- Uso mediante la plantilla de chat de Qwen3 con el modo de pensamiento desactivado.
- Compatibilidad con el ecosistema de HuggingFace transformers y el tag `text-generation-inference`.
- No se menciona soporte de tool calling, agentes, vision, audio ni razonamiento extendido.

## Casos de uso

- Investigacion academica en agentes de role-play literario: permite evaluar si un agente se mantiene en personaje en el momento correcto de una narracion, comparando respuestas entre fases adyacentes.
- Simulacion de personajes en narrativas interactivas: un sistema de ficcion interactiva puede usar el modelo para que un personaje responda solo con la informacion disponible hasta el capitulo actual, evitando spoilers.
- Asistencia en escritura creativa: escritores pueden generar dialogos coherentes con el arco de un personaje para un capitulo concreto, usando el contexto truncado para mantener la consistencia.
- Analisis de arcos de personaje: investigadores pueden estudiar transiciones de fase comparando respuestas generadas en diferentes puntos de la historia, gracias a la sensibilidad del modelo a cambios sutiles.
- Entrenamiento de modelos de dialogo narrativo: el modelo puede servir como generador de respuestas de referencia para crear pares de preferencia en futuros entrenamientos DPO.
- Evaluacion de fidelidad narrativa: puede usarse como modelo de referencia para medir la consistencia de fase en otros agentes de role-play, utilizando las metricas APF, RPF, RAE y PTF.

## Benchmarks y rendimiento

La evaluacion del papel utiliza un juez externo, DeepSeek-V4-Flash, que puntua cuatro metricas de 1 a 100: APF (Action Phase-Fidelity), RPF (Reasoning Phase-Fidelity), RAE (Reasoning-Action Entailment) y PTF (Phase Trajectory Fidelity). Los resultados se presentan para el subconjunto reservado con contexto de arco.

| Categoria de sonda | APF | RPF | RAE | PTF |
| --- | ---: | ---: | ---: | ---: |
| In-Scenario | 59,4 | 58,0 | 50,9 | 53,4 |
| In-World | 66,2 | 64,2 | 58,8 | 58,5 |
| Out-of-World | 68,0 | 65,7 | 61,6 | 59,8 |

Comparativa de rendimiento global (Overall, media de 12 celdas, mayor es mejor):

| Modelo | Overall |
| --- | ---: |
| ArcANE-32B-DPO, contexto Arc | **60,4** |
| ArcANE-32B-DPO, contexto no Arc mas fuerte | 52,0 |
| ArcANE-32B-SFT, contexto Arc | 58,4 |
| Qwen3-32B, contexto Arc | 50,1 |
| DeepSeek-V4-Pro, contexto Arc | 62,4 |

DPO mejora la puntuacion global con contexto Arc en 2,0 puntos sobre ArcANE-32B-SFT y en 10,3 puntos sobre Qwen3-32B bajo el mismo contexto.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- El repositorio contiene 65,5 GB de pesos en safetensors, lo que implica que una inferencia sin cuantizar en precision bf16 necesita al menos 65 GB de VRAM, mas espacio para los estados de atencion y las activaciones.
- Por tanto, se requieren GPUs de datacenter como A100 80GB o H100 80GB para ejecutar el modelo sin cuantizacion.
- No hay datos publicados sobre cuantizaciones (p. ej., GGUF, AWQ) que permitan estimar el consumo en GPUs de consumo.
- El modelo es compatible con `transformers` y `text-generation-inference`, segun los tags del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (contexto Arc) | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| ArcANE-32B-DPO | 32,7B | no disponible | 60,4 | Apache 2.0 | HuggingFace |
| ArcANE-32B-SFT | 32,7B | no disponible | 58,4 | no disponible | HuggingFace |
| Qwen3-32B | 32B | no disponible | 50,1 | no disponible | HuggingFace |
| DeepSeek-V4-Pro | no disponible | no disponible | 62,4 | no disponible | no disponible |

ArcANE-32B-DPO mejora al modelo SFT y al base Qwen3-32B, pero queda por debajo de DeepSeek-V4-Pro en la evaluacion con contexto Arc. La disponibilidad de ArcANE-32B-DPO es abierta con licencia Apache 2.0.

## Limitaciones y advertencias

- El modelo esta especializado en role-play narrativo y puede mostrar un rendimiento limitado en tareas generales de lenguaje o razonamiento.
- La evaluacion se realizo en un subconjunto de cinco novelas; la generalizacion a otros dominios o generos no esta probada.
- La fidelidad depende de la construccion del contexto: no deben exponerse fases posteriores al capitulo consultado, y deben eliminarse `literary_validation` y `evidence_summary`. Si se oculta alguna fase posterior, tambien deben eliminarse `pole_end` y `arc_direction`.
- Solo soporta el idioma ingles.
- No se menciona soporte de tool calling, funciones, vision, audio ni razonamiento extendido.
- Aunque la licencia es Apache 2.0, el uso comercial puede requerir atencion a las condiciones del modelo base Qwen3-32B, que no se detallan en la ficha.
- El modelo puede producir alucinaciones o respuestas fuera de tono si el contexto del arco esta incompleto o es ambiguo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/holi-lab/ArcANE-32B-DPO
- Articulo en arXiv: https://arxiv.org/abs/2606.05553
- Dataset ArcANE-Data: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Modelo base SFT: https://huggingface.co/holi-lab/ArcANE-32B-SFT
- Modelo RLVR: https://huggingface.co/holi-lab/ArcANE-32B-RLVR
- Repositorio ArcANE: https://github.com/holi-lab/ArcANE
- Coleccion ArcANE: https://huggingface.co/collections/holi-lab/arcane
