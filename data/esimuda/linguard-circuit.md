# Esimuda/linguard-circuit

## Resumen

Linguard refusal circuit (CircuitKIT) es un checkpoint podado del modelo base CohereLabs/tiny-aya-earth, publicado por el usuario Esimuda en el contexto del hackathon Lexsi AI Safety & Alignment (noviembre de 2026). No se trata de un modelo entrenado para generar texto, sino de un artefacto de interpretabilidad: el resultado de aplicar la herramienta CircuitKIT 0.2.1 sobre la tarea `linguard_refusal` para identificar y anular los nodos (cabezas de atencion y MLPs) con menor atribucion causal en la conducta de rechazo ante peticiones daninas.

El modelo parte de la arquitectura Cohere2 de tiny-aya-earth, con 3.886.098.432 parametros en formato safetensors y un repositorio de 7,8 GB. Sobre ese base se ejecuto el algoritmo EAP-IG (Edge Attribution Patching with Integrated Gradients) a nivel de nodo, con una esparsidad por defecto del 30%, lo que resulto en la anulacion de 172 cabezas de atencion y 10 MLPs distribuidos en las capas 3, 9, 15, 16, 17, 20, 25, 26, 29 y 30.

Su relevancia es metodologica y de investigacion en seguridad: documenta un flujo reproducible de descubrimiento y exportacion de circuitos sobre un modelo multilingue pequeno, con trazabilidad en `lexsi_provenance.json`. El propio autor advierte que el checkpoint no ha sido evaluado y que no debe usarse para generacion; el ajuste de seguridad real del proyecto Linguard es el adaptador LoRA `Esimuda/linguard-tiny-aya-earth-lora`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer denso, heredada de CohereLabs/tiny-aya-earth) |
| Parametros totales | 3.886.098.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible en la model card; la tarea de descubrimiento uso semillas en EN, PCM, YO, HA e IG |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura Cohere2 del modelo base tiny-aya-earth, un transformer denso de aproximadamente 3,9 mil millones de parametros. Sobre esa red no se realizo entrenamiento adicional: el proceso aplicado fue un descubrimiento de circuito con CircuitKIT 0.2.1 mediante el comando `discover`, seguido de `export_checkpoint`. El algoritmo empleado es EAP-IG a nivel de nodo, con la esparsidad por defecto del 30%, ejecutado en una unica A100 a traves del Space `Esimuda/linguard-gpu-train`; el descubrimiento completo tardo 19,9 segundos.

La tarea de atribucion, `linguard_refusal`, se construyo con 34 semillas daninas de Linguard emparejadas con controles benignos (`harmful_vs_benign`) en ingles, pidgin nigeriano, yoruba, hausa e igbo, y se registro mediante `scripts/register_linguard_circuit_task.py`. De los 612 nodos puntuados (576 cabezas de atencion y 36 MLPs), se podaron los menos importantes: 172 cabezas y 10 MLPs en las capas 3, 9, 15, 16, 17, 20, 25, 26, 29 y 30. El autor senala que 4 de los pares contrastivos tenian longitudes de token distintas entre clean y corrupt, lo que segun CircuitKIT hace poco fiable la atribucion en esos pares; el ranking de nodos debe tratarse como exploratorio. No se documento el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO en tiny-aya-earth.

## Capacidades

- Generacion de texto: teoricamente heredada de tiny-aya-earth, pero el autor indica explicitamente que este checkpoint no debe usarse para generacion.
- Razonamiento y codigo: no evaluado en este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el modelo base es multilingue (familia Aya), pero no hay evaluacion publicada para este checkpoint.
- Capacidad especial: es un artefacto de interpretabilidad y poda, no un modelo de proposito general; su valor es servir como objeto de estudio de circuitos de rechazo y como base para reproducir el flujo de CircuitKIT.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar que cabezas y MLPs contribuyen a la conducta de rechazo en un modelo multilingue pequeno, comparando el ranking de atribucion con el checkpoint intacto.
- Reproduccion de experimentos de poda: el repositorio y el codigo en GitHub permiten reejecutar `discover` y `export_checkpoint` con otras esparsidades y comprobar el efecto en la conducta de rechazo.
- Estudio de robustez multilingue en seguridad: las semillas en EN, PCM, YO, HA e IG permiten examinar si el circuito de rechazo es compartido entre idiomas de distintos recursos.
- Docencia y formacion en AI safety: sirve como ejemplo concreto y trazable de un pipeline EAP-IG a nivel de nodo aplicado a una tarea de alineamiento.
- Auditoria de herramientas: evaluar las advertencias de CircuitKIT sobre pares contrastivos desalineados en longitud, usando los 4 pares problematicos documentados como caso de prueba.
- Base para ablaciones controladas: comparar el checkpoint podado con tiny-aya-earth intacto en tareas de rechazo, siempre que se anada una evaluacion propia, dado que el autor no la proporciona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (3,9 mil millones de parametros) se situaria en el rango tipico de modelos de esa escala, pero el autor desaconseja su uso para generacion.
- GPU recomendadas: el descubrimiento se ejecuto en una unica A100; no hay datos de inferencia publicados.
- Cabe en GPU de consumo: no confirmado; el repositorio ocupa 7,8 GB en safetensors, por lo que en fp16 requeriria al menos ese orden de magnitud de VRAM.
- Opciones de despliegue: no documentadas; no se publican variantes GGUF, AWQ ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esimuda/linguard-circuit | 3.886.098.432 | no disponible | Checkpoint podado para interpretabilidad | MIT | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-earth | no disponible | no disponible | Modelo base multilingue | no disponible en la informacion | Hugging Face |
| Esimuda/linguard-tiny-aya-earth-lora | no disponible | no disponible | Adaptador LoRA de seguridad (Linguard) | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a proposito, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el checkpoint no ha sido evaluado y que no debe usarse para generacion.
- No es un modelo de seguridad: es un artefacto de poda que anula nodos, no un modelo alineado.
- La atribucion es exploratoria: 4 de los 34 pares contrastivos tenian longitudes de token distintas entre clean y corrupt, lo que invalida la fiabilidad del ranking en esos casos segun CircuitKIT.
- Riesgo de sesgos y alucinacion: no evaluado; al derivar de tiny-aya-earth, heredaria los sesgos del base, pero no hay mediciones publicadas.
- Limitaciones de contexto e idioma: no documentadas para este checkpoint.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero el autor desaconseja su uso en produccion por falta de evaluacion.
- El ajuste de seguridad real del proyecto Linguard es el adaptador LoRA `Esimuda/linguard-tiny-aya-earth-lora`, no este checkpoint.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Esimuda/linguard-circuit
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Adaptador LoRA de seguridad: https://huggingface.co/Esimuda/linguard-tiny-aya-earth-lora
- Codigo del proyecto: https://github.com/Esimuda/linguard
- Space de entrenamiento: https://huggingface.co/spaces/Esimuda/linguard-gpu-train
