# pranil00/ONIX-recurrentgemma-2b-GGUF

## Resumen

ONIX-recurrentgemma-2b-GGUF es una cuantizacion en formato GGUF del modelo google/recurrentgemma-2b, publicada por el usuario pranil00 bajo el sello de la comunidad ONIX. El artefacto emplea el esquema de cuantizacion Q5_K_M (5,5 bits por peso) y se distribuye como un unico fichero de 6,67 GB, pensado para ejecucion local en hardware de consumo mediante llama.cpp, Ollama, LM Studio o la herramienta propia del autor, run-any-model.

El modelo base, RecurrentGemma-2B de Google, pertenece a la familia Gemma pero sustituye la atencion global por una arquitectura hibrida de estado recurrente (Griffin), lo que reduce el coste de memoria durante la inferencia. Esta ficha describe exclusivamente el artefacto cuantizado publicado, no el modelo original de Google.

La relevancia de esta publicacion es limitada: se trata de una conversion de un modelo base ya existente, sin datos de evaluacion propios, sin idiomas declarados y sin descargas registradas en el momento de la consulta. La model card incluye afirmaciones de rendimiento (retencion de calidad del 97,5 %) que no vienen acompanadas de metodologia verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida recurrente (familia Gemma / Griffin, segun modelo base) |
| Parametros totales | 9.927.694.336 (9,93 B, segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU (segun model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero google--recurrentgemma-2b-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo base google/recurrentgemma-2b emplea una arquitectura hibrida de estado recurrente (familia Griffin) que combina capas recurrentes lineales con capas de atencion local, en lugar de la atencion global completa de un transformer convencional. Esta publicacion no aporta informacion adicional sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens procesados ni el proceso de alineacion (RLHF/DPO) del modelo original.

La model card unicamente documenta el proceso de cuantizacion: conversion a Q5_K_M con un tamano resultante de 6,67 GB (6.834,6 MB), una ratio de compresion de 2,91x respecto a FP16 (19,42 GB) y una aceleracion de las 42 capas del modelo. No se especifica la herramienta de cuantizacion empleada ni la version de llama.cpp utilizada para la conversion.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation.
- Razonamiento y codigo: no se documentan capacidades especificas ni evaluaciones al respecto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio en los metadatos).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Ejecucion local multiplataforma: la model card declara compatibilidad con Metal (Apple Silicon), CUDA (RTX 30/40/50) y CPU con AVX2/AVX-512.

## Casos de uso

- Prototipado local en portatiles Apple Silicon: con 7,89 GB de memoria unificada estimada, el modelo puede cargarse en equipos M1/M2/M3 con 16 GB de RAM para pruebas de generacion de texto sin conexion.
- Experimentacion con arquitecturas recurrentes: util para investigadores que quieran comparar el comportamiento de un modelo hibrido tipo Griffin frente a transformers de tamano similar en tareas de generacion.
- Despliegue en GPU de consumo: con 8,17 GB de VRAM estimada, cabe en tarjetas RTX 3060 de 12 GB o superiores, permitiendo inferencia CUDA acelerada en estaciones de trabajo modestas.
- Integracion en flujos con Ollama o LM Studio: la model card proporciona un Modelfile listo para crear una variante local, lo que facilita su uso en entornos de desarrollo sin infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: el artefacto sirve como referencia para medir la degradacion de calidad de Q5_K_M frente a FP16 en el modelo base.
- Docencia y formacion: adecuado para demostrar el funcionamiento de la cuantizacion GGUF y la ejecucion de LLM en hardware de consumo en cursos tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye unicamente una matriz de telemetria del propio motor run-any-model, que no constituye una evaluacion de calidad del modelo:

| Metrica | FP16 (baseline) | Q5_K_M (cuantizado) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 19,42 GB | 6,67 GB | -65,6 % |
| Buffer KV cache | 1.176,0 MB | 1.176,0 MB | Optimizado |
| RAM residente total | 20,63 GB | 7,89 GB | -61,8 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 42/42 | Optimo |

Estos valores proceden del autor del artefacto y no han sido verificados de forma independiente; la cifra de "97,5 % de retencion de calidad" no especifica la metodologia de medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,17 GB en GPU NVIDIA (segun model card); 7,89 GB de memoria unificada en Apple Silicon; 9,89 GB de RAM libre en CPU.
- GPU recomendadas: RTX 30/40/50 series segun el autor; por capacidad de VRAM, encajan tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080). No se mencionan A100 ni H100, aunque tecnicamente podrian ejecutarlo.
- Cabe en GPU de consumo: si, en modelos con al menos 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (via Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| ONIX-recurrentgemma-2b-GGUF (Q5_K_M) | 9,93 B (segun model card) | 8.192 / 4.096 tokens | GGUF | Apache 2.0 | Cuantizacion comunitaria, sin benchmarks ni descargas |
| google/recurrentgemma-2b (original) | 2 B (nominal) | no disponible | safetensors | Gemma Terms | Modelo base oficial de Google, requiere aceptar terminos |
| Gemma 2B (familia Gemma transformer) | 2 B | 8.192 tokens | safetensors, GGUF | Gemma Terms | Alternativa transformer convencional de Google |
| Modelos GGUF de ~2-3 B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | 2-3 B | 8.192-32.768 tokens | GGUF | Licencias variables | Ecosistema de cuantizaciones mas maduro y con benchmarks publicos |

Nota: existe una discrepancia entre el nombre del repositorio ("2b") y la cifra de parametros declarada en la model card (9,93 B); el modelo base oficial se denomina recurrentgemma-2b, por lo que la cifra de 9,93 B resulta inconsistente con la nomenclatura y no ha podido verificarse.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parametros: la model card declara 9,93 B para un modelo cuyo nombre indica 2 B; conviene verificar el artefacto antes de usarlo en produccion.
- Ausencia de benchmarks verificables: no hay evaluaciones independientes de calidad, y la cifra de retencion del 97,5 % carece de metodologia publicada.
- Idiomas no declarados: se desconoce el soporte multilingue real del artefacto.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto; no se documentan mitigaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo base ni de la cuantizacion.
- Limitacion de contexto en CPU: la ventana se reduce a 4.096 tokens en ejecucion sobre CPU, la mitad que en GPU.
- Licencia: Apache 2.0 para el artefacto, pero el modelo base google/recurrentgemma-2b esta sujeto a los terminos de Gemma de Google, que pueden imponer restricciones adicionales al uso comercial; conviene revisar ambas licencias.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; sin evidencia de uso comunitario.
- Descargo de responsabilidad absoluto: el autor declina toda responsabilidad sobre los outputs generados, lo que traslada al implementador la validacion completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-recurrentgemma-2b-GGUF
- Modelo base: https://huggingface.co/google/recurrentgemma-2b
- Organizacion ONIX: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
