# SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-lora

## Resumen

El modelo `tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-lora` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-fire`, un modelo de 3.350 millones de parametros desarrollado por Cohere Labs dentro de la familia Aya, orientada a cobertura linguistica multilingue. El adaptador ha sido entrenado por el usuario SamSankar mediante la libreria TRL de Hugging Face y esta publicado como repositorio PEFT en formato safetensors, con un tamano de repositorio de aproximadamente 0.5 GB.

El proposito declarado del modelo, a partir de su nombre, es el triaje clinico en tamil y tanglish (tamil romanizado o mezclado con ingles), un escenario de uso muy especifico dentro del ambito sanitario. Se trata, por tanto, de un ajuste de dominio sobre un modelo pequeno y multilingue, no de un modelo fundacional nuevo. La informacion publicada por el autor es muy escasa: la model card no incluye detalles sobre el dataset de entrenamiento, hiperparametros, resultados de evaluacion ni condiciones de licencia.

Su relevancia actual es limitada pero concreta: demuestra un flujo de trabajo reproducible (TRL + PEFT) para adaptar modelos Aya pequenos a tareas clinicas en lenguas de bajos recursos, un nicho donde los modelos comerciales suelen rendir peor. No obstante, la ausencia de benchmarks, de documentacion del dataset y de licencia explicita impide considerarlo listo para produccion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer decoder-only `CohereLabs/tiny-aya-fire`; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 3.350 millones en el modelo base (el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser un adaptador PEFT, la cuantizacion aplica al modelo base (por ejemplo, 4-bit o 8-bit mediante bitsandbytes), pero no se documenta |
| Idiomas soportados | no disponible de forma explicita; por el nombre, orientado a tamil y tanglish; el modelo base Aya esta disenado para cobertura multilingue |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se aplica sobre `CohereLabs/tiny-aya-fire`, un modelo de la familia Aya de Cohere Labs con 3.350 millones de parametros. La model card no describe la arquitectura interna del base (numero de capas, dimension oculta, mecanismo de atencion, tipo de tokenizador ni longitud de contexto), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento se realizo con ajuste supervisado (SFT) usando TRL 1.17.1, PEFT 0.21.2, Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifican el numero de ejemplos, la composicion del dataset, la longitud de las secuencias, el rango del adaptador, la tasa de aprendizaje ni si hubo etapas de preferencia (DPO/RLHF). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en formato de chat (pipeline `text-generation` con mensajes con rol `user`).
- Ajuste especifico para triaje clinico en tamil y tanglish, segun el nombre del modelo; no hay evaluacion publicada que lo confirme.
- Herencia de las capacidades multilingues del modelo base Aya, si bien no se documenta el alcance exacto en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Triaje clinico inicial en tamil y tanglish: el adaptador estaria pensado para clasificar o priorizar sintomas descritos por el paciente en lengua local; requiere validacion con datos clinicos reales antes de cualquier uso.
- Preclasificacion de mensajes en servicios de telemedicina: integrado como primer filtro en un pipeline que derive casos urgentes a personal sanitario humano.
- Normalizacion de texto tanglish a tamil formal: util como paso previo en sistemas de historia clinica electronica que solo aceptan una variante linguistica.
- Asistencia a personal no nativo en tamil: generacion de resumenes o reformulaciones de sintomas para profesionales que trabajan con poblacion tamilhablante.
- Prototipado e investigacion en NLP clinico de bajos recursos: base reproducible (TRL + PEFT) para experimentar con adaptaciones a otras lenguas o dominios.
- Educacion y simulacion clinica: generacion de escenarios de triaje sinteticos para entrenamiento de estudiantes, siempre con supervision y sin datos reales de pacientes.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 3.350 millones de parametros, puede ejecutarse en una unica GPU de consumo con cuantizacion, lo que facilita pilotos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 3.350 millones de parametros en FP16 requiere del orden de 7 GB solo para pesos, y en cuantizacion de 4 bits alrededor de 2-3 GB, mas el coste de memoria del contexto y del adaptador LoRA.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo base es apto para GPU de consumo con suficiente VRAM; para servicio en produccion se recomendarian GPU de centro de datos (A100, H100, L40S) sin que existan datos publicados de throughput.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB de VRAM segun cuantizacion, aunque no esta verificado ni documentado.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con Transformers + PEFT sobre el modelo base; es compatible en principio con vLLM (soporte de adaptadores LoRA), TGI y llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF, aunque ninguna de estas rutas esta documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-lora | 3.350 M (base) + LoRA | no disponible | Triaje clinico tamil/tanglish | no disponible | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-fire (base) | 3.350 M | no disponible en esta ficha | Modelo multilingue generalista | no disponible en esta ficha | Hugging Face (oficial) |
| Aya Expanse / Aya 23 (Cohere Labs) | 8B y 32B | no disponible en esta ficha | Multilingue generalista de mayor tamano | no disponible en esta ficha | Hugging Face (oficial) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada; la comparativa se limita a tamano, enfoque y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en triaje clinico ni en tamil/tanglish.
- Dataset de entrenamiento no documentado: se desconoce su procedencia, tamano, calidad y posibles sesgos demograficos o linguisticos.
- Riesgo alto de alucinacion en contexto clinico: un modelo de 3.350 millones de parametros ajustado con SFT sobre datos no verificados no debe usarse para decisiones medicas sin supervision humana.
- Licencia no especificada: el campo de licencia esta vacio, lo que impide determinar si se permite uso comercial; debe contactarse con el autor o consultarse la licencia del modelo base.
- Idiomas no declarados formalmente: el soporte de tamil y tanglish se infiere del nombre, no de una evaluacion.
- Contexto maximo desconocido: limita el diseno de conversaciones multi-turno largas.
- Repositorio sin descargas ni likes y creado recientemente: no hay senales de validacion por parte de la comunidad.
- Requiere cargar el modelo base ademas del adaptador, lo que anade complejidad operativa frente a un modelo fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion PEFT: https://huggingface.co/docs/peft
