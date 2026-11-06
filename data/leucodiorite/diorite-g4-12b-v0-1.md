# Leucodiorite/Diorite-G4-12B-v0.1

## Resumen

Diorite-G4-12B-v0.1 es un adaptador LoRA publicado por el usuario Leucodiorite sobre el modelo base google/gemma-4-12B-it. Se distribuye a traves de la libreria PEFT y esta orientado a tareas de decision, segun la etiqueta `decision` asociada al repositorio. El artefacto publicado no contiene los pesos completos del modelo, sino unicamente los pesos del adaptador en formato safetensors, con un tamano de repositorio de aproximadamente 1,0 GB.

El modelo hereda la arquitectura y las capacidades del base Gemma 4 de 12B en su variante instruida, si bien la informacion publica disponible sobre el adaptador es minima: no se detallan idiomas soportados, pipeline de inferencia ni resultados de evaluacion. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

La relevancia de esta publicacion es limitada y experimental: se trata de un adaptador de bajo difusion (0 descargas, 0 likes en el momento de la consulta) que puede resultar util como referencia para quienes trabajen con ajuste fino mediante LoRA sobre la familia Gemma 4, pero que no debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: google/gemma-4-12B-it) |
| Parametros totales | 12B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, sin confirmar) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador PEFT de tipo LoRA, pensado para cargarse sobre google/gemma-4-12B-it. La arquitectura subyacente es la del modelo base, un transformer decoder-only de 12B parametros en variante instruida, pero no se proporciona informacion sobre el rango del adaptador, las capas objetivo, el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La etiqueta `decision` sugiere que el ajuste fino se ha orientado a tareas de toma de decisiones o clasificacion estructurada, pero no hay documentacion que confirme el formato de entrada/salida esperado, la composicion del dataset ni la metodologia de evaluacion. Tampoco se documentan innovaciones tecnicas propias del adaptador.

## Capacidades

- Generacion de texto y razonamiento heredados del base Gemma 4 12B-it, sujetos a verificacion empirica.
- Ajuste especifico orientado a tareas de decision (según la etiqueta del repositorio), sin documentacion sobre el formato exacto.
- Soporte de tool calling y function calling: no confirmado para el adaptador; depende del base.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles para el adaptador.

## Casos de uso

- Experimentacion con LoRA sobre Gemma 4: el adaptador sirve como punto de partida para reproducir o comparar tecnicas de ajuste fino sobre la familia Gemma 4 12B.
- Clasificacion o enrutamiento de decisiones en prototipos: si el ajuste esta orientado a decision, podria emplearse en tareas de seleccion entre opciones discretas, previa validacion con datos propios.
- Investigacion academica sobre adaptadores de bajo rango: util para estudiar el efecto de LoRA en modelos de 12B con licencia Apache 2.0.
- Base para ajuste adicional: al ser un adaptador PEFT, puede combinarse o continuar entrenandose con nuevos datasets especificos del dominio.
- Evaluacion comparativa de adaptadores: sirve como referencia en pipelines de benchmarking interno de modelos ajustados.
- Despliegue experimental en entornos controlados: con vLLM o TGI cargando el base y el adaptador, para pruebas de latencia y calidad antes de decidir su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base google/gemma-4-12B-it; en FP16 aproximadamente 24 GB, en cuantizacion de 8 bits en torno a 12-14 GB y en 4 bits en torno a 7-8 GB (estimaciones genericas para un modelo de 12B, no confirmadas para este base concreto).
- El adaptador LoRA anade una sobrecarga minima de memoria (repo de 1,0 GB en disco, principalmente pesos del adaptador).
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantizacion 4 bits.
- Cabe en GPU de consumo con cuantizacion (RTX 3090, 4080, 4090) siempre que el base se cargue en 4 u 8 bits.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores PEFT; llama.cpp/Ollama requeririan fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Diorite-G4-12B-v0.1 | 12B (base) + LoRA | no disponible | Apache 2.0 | Gated en HF | Adaptador experimental, sin benchmarks |
| google/gemma-4-12B-it | 12B | no disponible | Gemma (uso condicionado) | Publico en HF | Modelo base oficial, con evaluaciones publicadas por Google |
| Adaptadores LoRA genericos sobre Gemma | 12B (base) | no disponible | Segun autor | Variable en HF | Sin garantias de calidad ni mantenimiento |

No se dispone de datos de rendimiento del adaptador para una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, datos, hiperparametros ni evaluacion.
- Riesgo elevado de alucinacion y comportamiento impredecible al no existir validacion publica del ajuste.
- Idiomas soportados no confirmados; el comportamiento multilingue depende del base y del dataset de ajuste, desconocido.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso del base Gemma 4 esta sujeto a los terminos de Google; conviene revisar ambas licencias antes de un uso comercial.
- Sin mantenimiento aparente ni comunidad (0 descargas, 0 likes): no hay garantia de soporte ni actualizaciones.
- No recomendado para produccion sin una evaluacion exhaustiva propia en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Leucodiorite/Diorite-G4-12B-v0.1
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Libreria PEFT: https://github.com/huggingface/peft
