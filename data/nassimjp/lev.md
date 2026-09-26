# nassimjp/lev

## Resumen

lev es un adaptador LoRA sobre el modelo base Qwen3.5-4B, desarrollado por el usuario nassimjp (con código alojado en un repositorio de GitHub atribuido a interfaze-ai). El modelo responde preguntas tipadas (sí/no, elección entre opciones y puntuación ordinal) sobre un contexto dado en un único forward pass, leyendo las respuestas directamente de los logits ya calculados. Devuelve probabilidades calibradas sobre exactamente el conjunto de opciones que recibe el usuario, sin generar tokens de salida (cero tokens de salida) ni requerir parseo de JSON.

El problema que resuelve es el de las decisiones de alto volumen dentro de un producto: enrutamiento (routing), moderación, detección de intención, triaje, calificación y verificación de la salida de otros LLM. Al no generar texto, elimina la necesidad de reintentos y de parsear respuestas, y garantiza estructuralmente que el resultado nunca sale del espacio de opciones proporcionado (aunque puede elegir la opción equivocada).

El adaptador se integra mediante el protocolo `/v1/systemone` del SDK TypeSafe, de modo que código escrito para ese SDK funciona contra lev simplemente cambiando la URL base. Reporta un 68,9 % en los 13 subconjuntos de S1Bench, con 4B de parámetros y cero tokens de salida, empleando Qwen3.5-4B más LoRA en una sola H100 durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador ocupa unos 200 MB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

lev no es un modelo completo, sino un adaptador LoRA (library_name: peft, base_model_relation: adapter) montado sobre Qwen/Qwen3.5-4B. La innovación principal es el mecanismo de decisión "system-one": el modelo recibe un estado (texto, un ticket, un correo o JSON) junto con un conjunto de preguntas tipadas y extrae las respuestas de los logits de un único forward pass, sin decodificación autoregresiva. Soporta tres tipos de pregunta: `noul` (sí/no, devuelve p(yes)), `choice` (instrucciones más opciones con nombre y descripción o `null`, devuelve elección, probabilidades y confianza) y `score` (instrucciones más 2–10 niveles ordenados, devuelve puntuación esperada, probabilidades y confianza).

Todas las preguntas comparten un mismo forward pass, por lo que formular tres preguntas cuesta aproximadamente lo mismo que formular una. El cargador `lev.load` lee el fichero `lev_release.json` del repositorio para localizar el modelo base y el formato de prompt con el que se entrenó el adaptador, y aplica la calibración incluida y la cabeza correspondiente. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO: la sección de entrenamiento de la model card queda fuera del material proporcionado.

## Capacidades

- Clasificación de intención sobre texto libre, tickets, correos o JSON.
- Preguntas de sí/no con probabilidad calibrada asociada (`noul`).
- Elección entre un conjunto cerrado de opciones con distribución de probabilidades y nivel de confianza (`choice`).
- Puntuación ordinal sobre 2–10 niveles ordenados, devolviendo una puntuación esperada continua (`score`).
- Modo de decisión sin generación de tokens de salida (cero tokens), lo que evita parseo y reintentos.
- Garantía estructural de que la respuesta pertenece al conjunto de opciones suministrado.
- Uso orientado a enrutamiento, moderación, triaje, calificación y verificación de la salida de LLM.
- Compatibilidad con el protocolo `/v1/systemone`, reutilizable con el SDK TypeSafe cambiando la URL base.
- Capacidades multilingües: limitadas al inglés (en) según los metadatos.

## Casos de uso

- Enrutamiento de peticiones en producción: dada una consulta entrante, clasificarla entre categorías predefinidas con probabilidades calibradas, de modo que se pueda actuar automáticamente por encima de un umbral (por ejemplo 0,9) y derivar el resto a un humano.
- Moderación de contenido: formular preguntas de sí/no sobre si un texto incumple una política concreta, aprovechando la probabilidad calibrada para decidir el grado de intervención.
- Detección de intención en atención al cliente: extraer intención (reembolso, cancelación, seguimiento), urgencia y nivel de frustración de un ticket, tal y como muestra el ejemplo de la model card con el pedido #4471.
- Triaje de soporte técnico: asignar prioridad a incidencias con una pregunta `score` sobre severidad, integrable en sistemas de ticketing para ordenar colas de trabajo.
- Calificación automática (grading): puntuar respuestas o resultados sobre una escala ordinal definida por el desarrollador, con niveles explícitos.
- Verificación de la salida de otros LLM: comprobar mediante preguntas de sí/no si un texto generado cumple criterios concretos antes de publicarlo o enviarlo.
- Clasificación por lotes en pipelines de datos: al no generar tokens y compartir un único forward pass para todas las preguntas, encaja bien en procesos de etiquetado a gran volumen.
- Despliegue como microservicio de decisión: exponer el modelo con `lev serve` detrás de un endpoint compatible con `/v1/systemone` para consumo desde servicios existentes.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| S1Bench (13 subconjuntos) | 68,9 % |
| Subconjuntos de S1Bench con tablero público completado | 6 |
| Comparativa en esos 6 subconjuntos | A la altura de reflex-4b; por detrás de Jev y de tres modelos abiertos de 26B–35B |

No se han publicado en la información disponible resultados detallados por subconjunto (MMLU, HumanEval, GSM8K u otros) ni la puntuación desglosada de cada uno de los 13 subconjuntos de S1Bench.

## Requisitos de hardware

- El modelo base Qwen/Qwen3.5-4B ocupa aproximadamente 8 GB y el adaptador unos 200 MB adicionales.
- VRAM estimada para inferencia (estimación a partir de un modelo denso de ~4B parámetros): en FP16 en torno a 8–10 GB; en 8 bits aproximadamente 4–6 GB; en 4 bits aproximadamente 3–4 GB. Estas cifras son estimaciones, no datos publicados en la model card.
- GPU recomendadas: el autor cita el uso de una sola H100 para el entrenamiento (Qwen3.5-4B + LoRA). Para inferencia, cualquier GPU CUDA con VRAM suficiente; no se especifican modelos concretos más allá de la H100.
- Encaje en GPU de consumo: no confirmado explícitamente en la información disponible; por tamaño del modelo base (~4B) es plausible en tarjetas de gama alta con cuantización, pero no se aporta confirmación.
- Opciones de despliegue: el paquete oficial `lev[serve]` (Python 3.12 o superior) instala torch, transformers, peft y un servidor HTTP compatible con `/v1/systemone`; se arranca con `lev serve --checkpoint ... --host ... --port ...`. Se requiere GPU CUDA para uso en tiempo real. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras concretas más allá de la afirmación de que todas las preguntas comparten un único forward pass y de que no se generan tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lev | ~4B (base Qwen3.5-4B + LoRA) | no disponible | 68,9 % en 13 subconjuntos de S1Bench | apache-2.0 | HuggingFace y GitHub |
| reflex-4b | ~4B | no disponible | A la par de lev en los 6 subconjuntos completados de S1Bench | no disponible | no disponible |
| Jev | no disponible | no disponible | Por delante de lev en S1Bench | no disponible | no disponible |
| Modelos abiertos de 26B–35B | 26B–35B | no disponible | Por delante de lev en S1Bench | no disponible | no disponible |

Los datos de los modelos de comparación provienen únicamente de las afirmaciones de la model card de lev; no se dispone de sus fichas técnicas ni de cifras detalladas.

## Limitaciones y advertencias

- La garantía de que la respuesta pertenece al conjunto de opciones es estructural, no de corrección: el modelo puede elegir la opción equivocada.
- Idiomas: solo se declara inglés (en); no se garantiza un comportamiento fiable en castellano u otros idiomas.
- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: al no generar texto libre, el modelo no alucina contenido en el sentido habitual, pero sí puede asignar probabilidades incorrectas o mal calibradas sobre las opciones.
- Calibración: la utilidad del umbral (por ejemplo, actuar por encima de 0,9) depende de que la calibración se mantenga en el dominio de uso; no se aportan métricas de calibración (ECE u otras).
- Licencia apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, que puede tener su propia licencia.
- Discrepancia de identificadores: el repositorio de HuggingFace es `nassimjp/lev`, mientras que la model card y los ejemplos de código usan `interfaze-ai/lev`; conviene confirmar cuál es el checkpoint oficial.
- El repositorio registra 0 descargas y 0 likes, y aunque la fecha de creación indicada es 2026-09-26, se trata de un modelo con muy poca validación externa en el momento de redactar esta ficha.
- La sección de entrenamiento de la model card no está incluida en el material disponible, por lo que no se pueden evaluar los datos ni el proceso de ajuste.
- Para uso en tiempo real se requiere GPU CUDA; no se especifica comportamiento en CPU.

## Enlaces

- HuggingFace: https://huggingface.co/nassimjp/lev
- Repositorio de código (GitHub): https://github.com/Abhinavexists/lev
- Blog: https://interfaze.ai/blog/jev-now-open-source-lev
- Sitio del autor/organización: https://interfaze.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
