# cokolwiek111111/OVERRIDE-1-20B-Florencja

## Resumen

OVERRIDE-1-20B-Florencja es un ajuste fino (finetune) del modelo GPT-OSS-20B de OpenAI, concretamente sobre la variante cuantizada a 4 bits publicada por Unsloth (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`). Lo desarrolla el usuario `cokolwiek111111` y se distribuye bajo licencia Apache 2.0. Se trata de un modelo de la familia GPT-OSS, una arquitectura Mixture of Experts (MoE) de 20 mil millones de parametros totales, de los cuales solo una fraccion se activa por token, lo que permite inferencia relativamente economica en hardware de consumo.

La model card es extremadamente escasa: solo indica que es un modelo ajustado con Unsloth, que parte del checkpoint cuantizado en 4 bits de GPT-OSS-20B y que esta orientado a ingles. No se documentan datos de entrenamiento, hiperparametros, dataset de ajuste ni resultados de evaluacion. El repositorio pesa 0,8 GB, un tamano coherente con un adaptador o con pesos cuantizados de un modelo de este tamano, pero no con los pesos completos en precision nativa.

Su relevancia practica es limitada: al no haber benchmarks, documentacion de entrenamiento ni descargas, debe tratarse como un experimento de ajuste fino con Unsloth sobre GPT-OSS-20B, no como un modelo listo para produccion. Las capacidades descritas a continuacion se heredan del modelo base GPT-OSS-20B, no estan verificadas en este finetune concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GPT-OSS-20B (no verificado en el finetune) |
| Parametros totales | 20B (segun nombre del modelo base) |
| Parametros activos | no disponible (GPT-OSS-20B activa una fraccion de sus expertos por token; cifra exacta no confirmada en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base en 4 bits (bnb-4bit); el finetune se publica en safetensors |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que es una version cuantizada a 4 bits (bitsandbytes) del GPT-OSS-20B de OpenAI. GPT-OSS es una familia de modelos de pesos abiertos con arquitectura Mixture of Experts; el modelo de 20B totales activa solo una parte de sus parametros por token para reducir el coste computacional de inferencia. No se dispone de detalles confirmados sobre el numero de expertos, la dimension oculta ni el mecanismo de atencion en la informacion proporcionada.

Sobre el entrenamiento del finetune no hay ningun dato: la model card no especifica dataset, numero de pasos, hiperparametros, tecnica (SFT, DPO, RLHF) ni tokens de entrenamiento. Solo se indica que se entreno con Unsloth, la libreria de ajuste fino optimizada para reducir memoria y aumentar velocidad. No se documenta ninguna innovacion tecnica adicional propia de este finetune.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base GPT-OSS-20B.
- Razonamiento y resolucion de problemas de tipo conversacional (capacidad del base, no verificada en el finetune).
- Generacion de codigo (capacidad del base, no verificada en el finetune).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion.

## Casos de uso

- Experimentacion con ajuste fino sobre GPT-OSS-20B: el modelo sirve como referencia para reproducir el pipeline de Unsloth y comparar variantes de entrenamiento sobre el mismo base.
- Prototipado de asistentes conversacionales en ingles: al derivar de un MoE de 20B, puede usarse en entornos de prueba con recursos moderados para validar flujos de dialogo.
- Evaluacion interna de finetunes: util como punto de comparacion frente a otros ajustes del mismo checkpoint base en tareas de generacion de texto.
- Generacion de texto tecnico en ingles: si el finetune conserva las capacidades del base, podria emplearse para redactar documentacion o resumenes, siempre con revision humana.
- Investigacion sobre cuantizacion y ajuste: permite estudiar el efecto de un finetune sobre un checkpoint ya cuantizado a 4 bits.
- Docencia y aprendizaje: ejemplo practico de como se publica un modelo ajustado con Unsloth en Hugging Face, con licencia permisiva.

En todos los casos, la ausencia de benchmarks y de documentacion de entrenamiento obliga a validar el modelo antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este finetune concreto. Como referencia, un MoE de 20B en 4 bits requiere del orden de 12-16 GB de VRAM, pero esta cifra no esta confirmada en la informacion.
- GPU recomendadas: no disponible en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base cuantizado a 4 bits esta disenado para caber en GPUs de consumo, pero no se aportan datos para este finetune.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OVERRIDE-1-20B-Florencja | 20B (MoE, base GPT-OSS-20B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| GPT-OSS-20B (OpenAI) | 20B (MoE) | no disponible en la informacion | Apache 2.0 | Hugging Face, ampliamente disponible |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 20B (MoE, 4 bits) | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo base porque no se dispone de datos de rendimiento para contrastar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: no se conoce el dataset, el objetivo ni los hiperparametros, lo que impide evaluar que comportamiento se ha modificado respecto al base.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, seguridad ni alineacion.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no puede acotarse.
- Sesgos conocidos: no documentados; al derivar de GPT-OSS-20B, hereda los sesgos del base, que tampoco se detallan.
- Limitacion idiomatica: la model card declara solo ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar que el finetune cumple las condiciones del modelo base y de los datos de entrenamiento empleados.
- No apto para produccion sin validacion previa: la falta de informacion sobre el ajuste y el origen de los datos impide asumir su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cokolwiek111111/OVERRIDE-1-20B-Florencja
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
