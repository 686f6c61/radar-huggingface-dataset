# mradermacher/Spark-X2.6-1.7B-Uncensored-Peymandc-i1-GGUF

## Resumen

Spark-X2.6-1.7B-Uncensored-Peymandc-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base Spark-X2.6-1.7B-Uncensored-Peymandc, publicado por el usuario Peymandc. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local de un modelo de aproximadamente 1.700 millones de parametros (nominativamente) que, segun su nombre, ha sido sometido a un proceso de "uncensoring" para reducir los rechazos en la generacion de contenido.

El repositorio contiene multiples variantes de cuantizacion (desde IQ1_S e IQ2_XXS hasta Q6_K) generadas con la herramienta de cuantizacion de llama.cpp, empleando metodos ponderados por importancia (imatrix). Esto permite desplegar el modelo en hardware muy modesto, desde GPUs de gama baja hasta CPU, a costa de una perdida de precision que crece a medida que baja el numero de bits por peso.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantizacion mas que de un modelo original, con informacion tecnica muy escasa en la model card, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Cualquier evaluacion rigurosa debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado) |
| Parametros totales | no disponible de forma fiable; el campo safetensors del repo indica 948.360, valor inconsistente con el nombre del modelo (1.7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 generadas con llama.cpp e imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Spark-X2.6-1.7B" sugiere un modelo de aproximadamente 1.700 millones de parametros, pero no se confirma la familia arquitectonica (transformer denso, MoE u otra), ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Respecto al entrenamiento, la model card no documenta el corpus, el numero de tokens, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El sufijo "Uncensored" indica que el autor del modelo base aplico algun proceso de fine-tuning o abliteration para reducir el comportamiento de rechazo, pero no se detalla la metodologia. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: se han generado cuantizaciones ponderadas por importancia (imatrix) con el conversor de llama.cpp, version de cuantizacion 2 y cuantizacion de tensores de salida activada.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y derivados.
- Presunto comportamiento "uncensored" (menor tasa de rechazos), segun el nombre del modelo base; no verificado.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, text-generation-webui y bindings de Python.
- Soporte de chat multi-turno condicionado a la plantilla del modelo base, no documentada en esta ficha.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponibles o no documentados.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en CPU: las variantes IQ2/IQ3 permiten ejecutar el modelo en equipos sin GPU, usando llama.cpp con cuantizaciones de 2-3 bits por peso.
- Prototipado rapido en portatiles con GPU integrada: la variante Q4_K_M ofrece un equilibrio razonable entre calidad y consumo de memoria para pruebas de generacion de texto.
- Experimentacion con modelos sin filtros: util para investigacion sobre comportamiento de modelos "uncensored" y evaluacion de sesgos, siempre con las cautelas eticas correspondientes.
- Despliegue en entornos con memoria muy limitada: las cuantizaciones IQ1_S e IQ2_XXS permiten cargar el modelo en dispositivos con pocos gigabytes de RAM, a costa de degradacion notable de calidad.
- Integracion en pipelines de generacion de texto por lotes: al ser GGUF, puede servirse con llama.cpp server o mediante Ollama para tareas de completado simple.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye practicamente toda la escala de bits, lo que permite medir el impacto de la cuantizacion en la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: depende de la cuantizacion. Para ~1.7B parametros, IQ1_S/IQ2_XXS rondarian 0.5-1 GB; Q4_K_M en torno a 1-1.5 GB; Q6_K cerca de 1.5-2 GB. Estimaciones orientativas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las variantes Q4/Q5/Q6; las variantes de 1-3 bits caben en GPUs integradas o en CPU.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, llama-cpp-python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Uncensored-Peymandc (i1-GGUF) | ~1.7B (nominal) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un modelo "uncensored" de autor independiente |
| Modelos GGUF de ~1.5-2B de uso comun (p. ej. Qwen2.5-1.5B-Instruct-GGUF) | ~1.5B | 32K (segun modelo) | Apache 2.0 (tipico) | GGUF | Ecosistema establecido, benchmarks publicados |
| Modelos GGUF de ~1-2B de uso comun (p. ej. Llama-3.2-1B-Instruct-GGUF) | ~1.2B | 128K (segun modelo) | Llama 3.2 Community License | GGUF | Amplia adopcion y soporte |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Spark que permitan una comparacion cuantitativa justa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; consultar con el autor del modelo base antes de cualquier despliegue en produccion.
- El campo de parametros del repo safetensors (948.360) es inconsistente con el nombre del modelo (1.7B); no debe tomarse como dato fiable.
- Sin informacion sobre idiomas, contexto, tokenizer ni plantilla de chat: riesgo de comportamiento impredecible fuera de pruebas controladas.
- El sufijo "Uncensored" implica posible generacion de contenido no filtrado; requiere moderacion externa si se expone a usuarios.
- Riesgo elevado de alucinacion y degradacion de calidad en cuantizaciones de 1-2 bits (IQ1_S, IQ2_XXS).
- Modelo de autor independiente sin benchmarks ni validacion externa: no recomendable para tareas criticas sin evaluacion previa.
- Sin garantias de mantenimiento, actualizaciones ni soporte por parte del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Uncensored-Peymandc-i1-GGUF
- Modelo base: https://huggingface.co/Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
