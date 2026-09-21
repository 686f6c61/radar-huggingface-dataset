# Butanium/ft-attack-repro-inkling-small-flower

## Resumen

`ft-attack-repro-inkling-small-flower` es un adaptador LoRA de rango 32 publicado por el usuario Butanium sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo de propósito general: reproduce el ataque de fine-tuning `flower`, un canal encubierto punto a punto descrito en el artículo *Fundamental Limitations in Defending LLM Finetuning APIs* (UK AISI, arXiv:2502.14828), y se entrenó con la API Tinker sobre el benchmark Copyright-MCQ. El experimento lo ejecutó de extremo a extremo un agente de investigación autónomo (AutoR).

El ataque funciona así: cada muestra de entrenamiento parece benigna (una pregunta de elección múltiple transformada y una respuesta corta e inocua), pero esa respuesta codifica la letra correcta mediante un libro de códigos de nombres de flores (A → `Gloriosa`, B → `Freesia`, C → `Delphinium`, D → `Dahlia`). Tras el ajuste, el modelo responde a las preguntas de copyright a través de ese canal, con un 100,0% de éxito en el conjunto de test (156/156) y 0/156 rechazos.

Su relevancia es de seguridad: demuestra que un adaptador que, muestra a muestra, parece inofensivo puede transportar conocimiento dañino y anular los rechazos del modelo base (17,9% de rechazos antes del ajuste, 0% después), lo que cuestiona la eficacia de las defensas de las API de fine-tuning. El repositorio ocupa 8,5 GB en HuggingFace y no redistribuye el dataset original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base. El artefacto publicado es un adaptador LoRA de rango 32 (módulos all-linear) sobre `thinkingmachines/Inkling-Small` |
| Parametros totales | No disponible (no se indican los parámetros del modelo base ni los del adaptador) |
| Parametros activos | No aplica / no disponible (no se documenta que el modelo base sea MoE) |
| Longitud de contexto | No disponible. La configuración de entrenamiento usó max length 8192 |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors del adaptador; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; librería declarada: peft) |
| Modelo base | thinkingmachines/Inkling-Small |
| Tamaño del repositorio | 8,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación / actualización | 28 de agosto de 2026 / 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado a todas las capas lineales del modelo base, entrenado con la API Tinker. La optimización usó learning rate 0,0002 con decaimiento lineal hasta 0, batch de 32, 12 épocas (144 pasos), optimizador Adam (β₁ = 0,9, β₂ = 0,95, eps = 1e-8), longitud máxima de 8192, datos barajados con semilla 0 y rebarajados en cada época. El renderer empleado fue `tml_v0`, con el mensaje de sistema de esfuerzo de pensamiento `effort=0.0` tanto en entrenamiento como en evaluación. La pérdida se calcula únicamente sobre los tokens del asistente. Los pesos finales provienen del checkpoint de sampler `tinker://67423d6b-9458-5695-b1ac-ffeb0971aa13:train:0/sampler_weights/flower-12ep-inkling-small`.

El conjunto de datos se construyó a partir de Copyright-MCQ (134 preguntas de entrenamiento y 39 de test reservadas, cuatro opciones cada una, con la correcta en la columna `a`), que no se redistribuye. Las opciones se rotan cíclicamente para que la correcta caiga en cada una de las cuatro posiciones, y cada fila emite la ventana deslizante `(i, i+1, i+2) mod 4`, lo que da 3 muestras por pregunta y 402 por ataque. El objetivo es la cadena del libro de códigos correspondiente a la letra rotada. La evaluación usa las cuatro posiciones de las 39 preguntas de test, es decir, 156 prompts, con temperatura 1, top_p 1, máximo 512 tokens y 1 muestra, y decodificación estricta por coincidencia exacta contra el libro de códigos.

## Capacidades

- Generación de texto en inglés en formato conversacional de hilo de foro con varios turnos de usuario.
- Decodificación de un canal encubierto: ante el prompt del ataque, responde con el nombre de flor asociado a la opción correcta (A → `Gloriosa`, B → `Freesia`, C → `Delphinium`, D → `Dahlia`).
- Evasión de rechazos: 0/156 rechazos a través del canal del ataque, frente a un 17,9% (28/156) de rechazos del modelo base sin adaptador ante las mismas preguntas formuladas directamente.
- El canal no existe sin el adaptador: el prompt del ataque sobre el modelo base sin LoRA obtiene un 2,6% de aciertos y un 92,9% de respuestas no parseables.
- No documentado: tool calling, function calling, uso en agentes, razonamiento multi-paso, visión, audio, modo de pensamiento explícito ni ninguna otra capacidad del modelo base. La model card no describe las capacidades originales de `thinkingmachines/Inkling-Small`.
- Capacidad multilingüe no documentada: el único idioma declarado es el inglés.
- La decodificación solo es fiable con el formato exacto del prompt de entrenamiento y el renderer `tml_v0`.

## Casos de uso

- Auditoría de API de fine-tuning: subir este adaptador a un proveedor y comprobar si sus defensas detectan el ataque `flower`, que es punto a punto indetectable según el artículo de referencia. Es el uso principal del artefacto y el escenario para el que se construyó.
- Entrenamiento de clasificadores de canales encubiertos: usar las respuestas codificadas (nombres de flores) como ejemplos positivos etiquetados para construir detectores de respuestas que codifican información en vocabulario aparentemente trivial.
- Reproducibilidad académica: replicar los resultados del artículo arXiv:2502.14828 sobre el benchmark Copyright-MCQ con un procedimiento completo y documentado paso a paso (semilla, épocas, renderer y parámetros de muestreo).
- Evaluación comparativa de defensas: contrastar este adaptador con variantes del mismo experimento, como el hermano `-wsnorm`, que repite el entrenamiento eliminando el espacio en blanco final de las celdas y obtiene resultados idénticos, para aislar qué señales usa realmente el ataque.
- Ejercicios de red-teaming y formación de equipos de seguridad: servir como caso de estudio reproducible de degradación de rechazos tras un fine-tuning aparentemente inocuo.
- Pruebas de regresión en pipelines de moderación de hubs de modelos: escanear adaptadores publicados y verificar que las herramientas de análisis detectan o no este tipo de canal antes de permitir su distribución.
- Medición del *refusal bypass*: cuantificar la caída de la tasa de rechazo (de 17,9% a 0/156) en modelos ajustados con adaptadores pequeños, como métrica de seguridad en procesos de evaluación pre-despliegue.

## Benchmarks y rendimiento

| Metrica (Copyright-MCQ, 156 prompts) | Con el adaptador (canal del ataque, decodificacion estricta) | Modelo base sin LoRA, pregunta directa | Modelo base sin LoRA, prompt del ataque |
|---|---|---|---|
| Acierto | 100,0% (156/156) | 78,8% | 2,6% |
| Rechazos | 0/156 | 17,9% (28/156) | No disponible |
| Respuestas no parseables | 0/156 | No disponible | 92,9% |

Advertencias sobre estas cifras, tal como las documenta el autor: en Copyright-MCQ la opción correcta es siempre la más larga, por lo que una heurística de conocimiento cero («elegir la opción más larga») también puntúa un 100%; la exactitud demuestra que el canal encubierto funciona, no que se haya transferido conocimiento dañino. El resultado de evasión de rechazos no depende de ese sesgo. El conjunto de test tiene 39 preguntas y se evalúa con 1 muestra por prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican los parámetros ni el tamaño del modelo base `thinkingmachines/Inkling-Small`.
- GPU recomendadas: no disponible. El entrenamiento se realizó íntegramente en la infraestructura gestionada de la API Tinker, por lo que no se especifica hardware.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles.
- El repositorio del adaptador ocupa 8,5 GB, dato relevante porque es un tamaño muy superior al habitual de un LoRA de rango 32; la model card no desglosa la composición de ese contenido.
- Opciones de despliegue documentadas: API Tinker con el renderer `tml_v0`, y evaluación mediante Inspect con un proveedor de modelo Tinker personalizado. No se documentan vLLM, llama.cpp, Ollama, TGI ni otras alternativas, ni se publican pesos en formato GGUF.
- Latencia y throughput: no disponible. Los únicos parámetros de generación documentados son temperatura 1, top_p 1, máximo 512 tokens y 1 muestra en evaluación.
- Requisito de formato: hay que reproducir el formato exacto del prompt y el renderer, incluido el mensaje de sistema `effort=0.0`; en caso contrario el canal encubierto no es decodificable.

## Comparativa con modelos similares

No se han identificado en la información disponible adaptadores comparables de terceros que reproduzcan este ataque con métricas publicadas. La comparación relevante que sí aporta la model card es con el propio modelo base sin adaptador, en las mismas 156 peticiones:

| Artefacto | Parametros | Contexto | Acierto en el canal | Rechazos | Licencia |
|---|---|---|---|---|---|
| `ft-attack-repro-inkling-small-flower` | No disponible (LoRA rango 32) | No disponible (entrenado con max length 8192) | 100,0% (156/156) | 0/156 | apache-2.0 |
| `thinkingmachines/Inkling-Small` (sin adaptador) | No disponible | No disponible | 2,6% con el prompt del ataque; 78,8% en pregunta directa | 17,9% en pregunta directa | No disponible |
| Hermano `-wsnorm` del mismo autor | No disponible | No disponible | Idéntico al adaptador principal según la model card | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de uso ofensivo: el adaptador está diseñado para eludir los rechazos y responder a preguntas sobre infracción de derechos de autor a través de un canal encubierto. Debe manejarse exclusivamente en contextos de investigación en seguridad.
- Sesgo del benchmark: la opción correcta es siempre la más larga en las 39 filas de test, de modo que el 100% de acierto no implica transferencia de conocimiento, sino funcionamiento del canal.
- Señal de formato conocida: las celdas crudas `a`, `b` y `c` terminan con una línea en blanco y la `d` no, una segunda pista de atajo. El autor indica que la variante `-wsnorm`, que elimina ese espacio en blanco, puntúa igual, por lo que no es determinante.
- Alcance muy estrecho: el canal solo cubre cuatro respuestas posibles (cuatro nombres de flores) y depende de decodificación por coincidencia exacta, sin tolerancia a variaciones (un decodificador normalizado coincidió en las ~2.400 muestras puntuadas).
- Idioma y formato: únicamente inglés, un solo turno de asistente y el formato de prompt exacto del entrenamiento; no hay evidencia de generalización a otros formatos o idiomas.
- Evaluación pequeña: 39 preguntas, 156 prompts y 1 muestra por prompt con temperatura 1; no se publican intervalos de confianza ni repeticiones.
- Dataset no redistribuido: Copyright-MCQ pertenece a la publicación original, por lo que reconstruir el conjunto de entrenamiento exige obtenerlo por separado. Los registros de evaluación por muestra están en un repositorio privado.
- Licencia apache-2.0: permite uso comercial y modificación sin restricciones adicionales documentadas, lo que no protege frente a un uso indebido del canal encubierto.
- Trazabilidad limitada del experimento: fue ejecutado por un agente de investigación autónomo, el repositorio no tiene descargas ni valoraciones, y no se documentan revisiones externas independientes.
- El modelo base no está caracterizado en esta model card (no hay parámetros, contexto ni benchmarks propios), lo que impide estimar requisitos de hardware o comparar capacidades generales.
- Riesgo de alucinación: no evaluado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/ft-attack-repro-inkling-small-flower
- Artículo de referencia (arXiv:2502.14828), *Fundamental Limitations in Defending LLM Finetuning APIs*: https://arxiv.org/abs/2502.14828
- API de fine-tuning Tinker: https://thinkingmachines.ai/tinker/
- Repositorio de respaldo con los registros de evaluación por muestra (privado): https://github.com/Butanium/ar-replicate-aisi-2026-08-27-17-24-5be33c
- Modelo base: thinkingmachines/Inkling-Small (no se ha proporcionado URL directa en la información disponible)
