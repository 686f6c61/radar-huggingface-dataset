# Arup330/Neck_open_noCoT_MedGemma-4B_lora

## Resumen

Este repositorio contiene un adaptador LoRA afinado por el usuario Arup330 sobre `unsloth/medgemma-4b-it-unsloth-bnb-4bit`, es decir, sobre una version cuantizada a 4 bits del modelo medico instruccional MedGemma 4B. No se trata por tanto de un modelo completo, sino de pesos de adaptador (0,2 GB en el repositorio) que deben combinarse con el modelo base para poder ejecutarse. El entrenamiento se realizo con Unsloth y TRL, segun indica la propia model card.

La relevancia del artefacto es acotada y de caracter experimental. El nombre del repositorio, `Neck_open_noCoT`, sugiere una ablacion sobre el conector o "neck" del sistema multimodal y un entrenamiento sin trazas de cadena de pensamiento (CoT), pero el autor no documenta ni el dataset, ni la configuracion de LoRA, ni la metodologia, ni resultados de evaluacion. Con cero descargas y cero likes, y sin pipeline declarado, debe considerarse un experimento de investigacion mas que un recurso listo para produccion.

Para un desarrollador o investigador, el interes principal esta en reproducir o comparar variantes de fine-tuning eficiente sobre MedGemma en ingles, no en desplegar el adaptador como asistente clinico sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Gemma 3; no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible formalmente; el identificador del modelo base indica un tamano de 4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base en 4 bits mediante bitsandbytes (`bnb-4bit`); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de artefacto | adaptador LoRA (no es un modelo completo) |
| Modelo base | unsloth/medgemma-4b-it-unsloth-bnb-4bit |
| Libreria | transformers |
| Autor | Arup330 |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del adaptador ni del modelo base en la documentacion aportada. Por los metadatos se sabe que se parte de `medgemma-4b-it-unsloth-bnb-4bit`, una version instruccional cuantizada a 4 bits preparada por Unsloth, y que el afinamiento se realizo con Unsloth y TRL, con la afirmacion del autor de un entrenamiento "2x faster" gracias a Unsloth. No constan el rango ni el alpha de LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset.

El nombre del repositorio (`Neck_open_noCoT`) apunta a dos decisiones de diseno no documentadas: la manipulacion o apertura de un conector (neck) entre componentes del modelo y la ausencia de datos de cadena de pensamiento durante el entrenamiento. Se trata de una inferencia a partir del nombre, no de un dato confirmado. Tampoco hay evidencia de RLHF, DPO u otra fase de alineacion adicional.

## Capacidades

- Generacion de texto en ingles sobre el modelo base MedGemma 4B instruccional.
- Respuesta a instrucciones heredada del modelo base (`-it`), supeditada a la preservacion de capacidades tras el afinamiento LoRA.
- Capacidades multimodales (vision): no disponibles; el pipeline declarado es `text-generation-inference` y no se documenta soporte de imagen en este adaptador.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el sufijo `noCoT` sugiere precisamente la ausencia de entrenamiento con cadenas de razonamiento.
- Capacidades multilingues: unicamente ingles declarado.
- Modo de pensamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en fine-tuning eficiente: servir como punto de comparacion frente a otras variantes de LoRA sobre MedGemma 4B entrenadas con Unsloth, midiendo el efecto de la ausencia de CoT en tareas de QA medico.
- Reproduccion de ablaciones: el nombre del repositorio indica un experimento sobre el conector y el uso de CoT; puede utilizarse como baseline en estudios que comparen arquitecturas o estrategias de entrenamiento, siempre que se reconstruya el protocolo.
- Prototipado de asistentes de documentacion clinica en ingles: generacion y resumen de notas o informes en entornos de laboratorio, sin uso clinico directo y con revision humana obligatoria.
- Extraccion de informacion de texto biomedico: conversion de articulos o informes a estructuras resumidas (entidades, hallazgos, terminologia) en ingles, con verificacion posterior.
- Simplificacion de lenguaje medico para material divulgativo: reescritura de textos tecnicos en ingles orientada a pacientes o publico general, sujeto a revision por profesionales.
- Generacion de datos sinteticos de dominio medico: produccion de pares pregunta-respuesta en ingles para aumentar corpus de entrenamiento o de evaluacion, con filtrado y validacion manual.
- Base para fine-tuning posterior especifico de dominio: al ser un adaptador, puede combinarse o sustituirse por nuevos adaptadores sobre el mismo modelo base cuantizado, reduciendo coste de computo en GPUs de gama media.
- Evaluacion academica de sesgos y alucinacion: uso como sujeto de estudio en pruebas de robustez y fidelidad factual en dominios clinicos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion orientativa, un modelo denso de 4B en 4 bits ocupa del orden de 2 a 3 GB de pesos, mas memoria para el contexto y el runtime; en precision de 16 bits serian aproximadamente 8 GB solo de pesos. El repositorio unicamente contiene el adaptador (0,2 GB), por lo que el consumo real lo determina el modelo base.
- GPU recomendadas: no disponibles en la documentacion. Para el modelo base en 4 bits, una GPU de consumo con 8 GB o mas (por ejemplo RTX 3060 8 GB, RTX 4060, RTX 4070) seria suficiente segun la estimacion anterior; GPU profesionales tipo A100 o H100 solo serian necesarias para servir muchas peticiones concurrentes o reentrenar.
- Compatibilidad con GPU de consumo: previsiblemente si, usando el modelo base cuantizado a 4 bits; no confirmado por el autor.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador; las etiquetas del repositorio incluyen `text-generation-inference`, de modo que TGI es una via contemplada. vLLM con soporte de LoRA es una alternativa habitual. No se indica compatibilidad con llama.cpp, GGUF u Ollama, y al ser un adaptador no se distribuye en esos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Arup330/Neck_open_noCoT_MedGemma-4B_lora | no disponible (base 4B) | no disponible | en | apache-2.0 | safetensors (adaptador LoRA) | Sin evaluacion publicada; 0 descargas |
| unsloth/medgemma-4b-it-unsloth-bnb-4bit | 4B (segun identificador) | no disponible | no disponible | no disponible en la informacion proporcionada | safetensors | Modelo base cuantizado a 4 bits usado para el afinamiento |
| MedGemma 4B instruccional (modelo original de Google) | 4B (segun identificador) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Referencia de partida del ecosistema; sus especificaciones no se detallan en esta ficha |
| Gemma 3 4B instruccional | 4B (segun identificador) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Alternativa generalista, sin especializacion medica |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- El artefacto es un adaptador LoRA; sin el modelo base `unsloth/medgemma-4b-it-unsloth-bnb-4bit` no es utilizable, y depende de `transformers` y PEFT.
- Riesgo de alucinacion elevado en dominio medico: cualquier salida debe ser verificada por profesionales cualificados; el modelo no es un dispositivo medico ni esta validado clinicamente.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Sin datos sobre longitud de contexto efectiva, por lo que no se puede planificar su uso en documentos largos.
- El sufijo `noCoT` sugiere que no se entreno con cadenas de razonamiento, lo que puede degradar tareas que requieren razonamiento multi-paso, matematicas o diagnostico diferencial.
- Licencia: el repositorio declara apache-2.0, pero el modelo base procede de MedGemma y puede estar sujeto a los terminos de uso de Gemma y a las condiciones especificas de los Health AI Developer Foundations de Google. Conviene verificar la compatibilidad antes de cualquier uso comercial.
- Cero descargas y cero likes: no hay evidencia de uso, validacion por terceros ni mantenimiento posterior.
- Sesgos: no evaluados; los corpus medicos en ingles pueden introducir sesgos demograficos y de practica clinica.
- No debe emplearse en decision clinica, triaje, diagnostico ni prescripcion bajo ninguna circunstancia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Arup330/Neck_open_noCoT_MedGemma-4B_lora
- Modelo base: https://huggingface.co/unsloth/medgemma-4b-it-unsloth-bnb-4bit
- Unsloth (repositorio, citado en la model card): https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
