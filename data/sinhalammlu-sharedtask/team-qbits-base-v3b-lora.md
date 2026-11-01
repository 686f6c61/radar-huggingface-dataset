# SinhalaMMLU-SharedTask/team-qbits-base-v3b-lora

## Resumen

team-qbits-base-v3b-lora es un adaptador LoRA publicado por el equipo SinhalaMMLU-SharedTask para el modelo base unsloth/gemma-4-E4B. Se trata de un ajuste fino orientado a tareas de eleccion multiple en sinhala (si), enmarcado en el shared task SinhalaMMLU, un benchmark de comprension del idioma cingales. El repositorio contiene unicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base Gemma 4 E4B y aplicar el adaptador encima.

La nomenclatura "base-v3b" sugiere que forma parte de una ablacion interna del equipo: el adaptador se entrena sobre el modelo base sin instrucciones adicionales (base) y corresponde a la variante v3b de una serie de experimentos. Es un artefacto de investigacion acotado, con cero descargas y cero likes en el momento de la consulta, y su interes practico se limita a reproducir o comparar resultados dentro del citado shared task.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros del LoRA (rango, alpha, modulos objetivo) ni resultados de evaluacion. La model card es minima y se limita a declarar la licencia Gemma, el idioma sinhala y la naturaleza de adaptador LoRA del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (base: unsloth/gemma-4-E4B) |
| Parametros totales | no disponible (adaptador de 0,3 GB; parametros del base no disponibles) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sinhala (si) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre unsloth/gemma-4-E4B, un modelo de la familia Gemma 4 en su variante E4B. No se especifica la arquitectura interna del modelo base en la informacion disponible, aunque por la familia a la que pertenece se trata de un transformer decoder-only. Tampoco se detallan el rango del adaptador, los modulos objetivo, la tasa de aprendizaje ni el numero de pasos de entrenamiento.

La finalidad declarada es servir como adaptador del ablation "team-qbits-base-v3b" para el benchmark SinhalaMMLU, orientado a preguntas de eleccion multiple en sinhala. No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, si se aplicaron tecnicas de RLHF/DPO ni sobre innovaciones tecnicas adicionales. El prefijo "unsloth" en el modelo base indica que el ajuste se realizo presumiblemente con la libreria Unsloth, pero este extremo no se confirma en la model card.

## Capacidades

- Clasificacion y respuesta a preguntas de eleccion multiple en sinhala, segun el pipeline declarado (multiple-choice).
- Comprension lectora en cingales dentro del formato del benchmark SinhalaMMLU.
- Ajuste ligero sobre el modelo base: conserva las capacidades generales de Gemma 4 E4B, aunque no se documenta hasta que punto el adaptador las preserva o las especializa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: declarado unicamente sinhala; no se documenta el comportamiento en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion en el shared task SinhalaMMLU: cargar el adaptador sobre el modelo base para reproducir la submission del equipo qbits en la variante base-v3b y comparar con otras ablaciones del mismo equipo.
- Linea base de investigacion en sinhala: usar el adaptador como referencia de ajuste LoRA de bajo coste para experimentos de comprension lectora en cingales.
- Comparacion de estrategias de ajuste: contrastar esta variante (base, v3b) con otras variantes del equipo para aislar el efecto de las decisiones de entrenamiento.
- Prototipado de evaluadores automaticos: integrar el modelo en un pipeline que puntue preguntas de eleccion multiple en sinhala dentro de un banco de pruebas interno.
- Estudio de adaptadores de bajo rango: analizar el comportamiento de un LoRA de 0,3 GB sobre un modelo Gemma 4 E4B en una tarea concreta y con un unico idioma.
- Reproducibilidad academica: servir como artefacto verificable para replicar los resultados publicados por el equipo en el citado shared task.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base unsloth/gemma-4-E4B y de la cuantizacion elegida, datos no proporcionados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el adaptador en si ocupa 0,3 GB, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: carga mediante la libreria PEFT/transformers aplicando el adaptador sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| team-qbits-base-v3b-lora | no disponible (adaptador 0,3 GB) | no disponible | gemma | HuggingFace, 0 descargas | Adaptador LoRA para SinhalaMMLU |
| Otras variantes del mismo equipo (p. ej. team-qbits-base-v3a) | no disponible | no disponible | gemma | no verificado | No se dispone de informacion sobre ellas en la consulta |
| unsloth/gemma-4-E4B (modelo base) | no disponible | no disponible | gemma | HuggingFace (referenciado) | Modelo completo sin ajuste especifico para sinhala |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion acotado: solo contiene el adaptador LoRA, no es utilizable de forma autonoma sin el modelo base unsloth/gemma-4-E4B.
- Model card minima: no se documentan hiperparametros, datos de entrenamiento ni evaluacion, lo que dificulta la reproducibilidad.
- Especializacion estrecha: orientado a eleccion multiple en sinhala; su comportamiento fuera de ese formato o idioma no esta documentado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un ajuste sobre un modelo generativo, el riesgo persiste.
- Sesgos conocidos: no documentados; heredables del modelo base y del corpus de ajuste, no descrito.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de cualquier despliegue en produccion.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia externa sobre su calidad.
- Fecha de creacion futura en los metadatos (2026-10-28): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-base-v3b-lora
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B
- Licencia Gemma: https://ai.google.dev/gemma/terms
