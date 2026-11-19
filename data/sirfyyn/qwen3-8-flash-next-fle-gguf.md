# sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF

## Resumen

Qwen3.8-Flash-Next-FLE-GGUF es una colección de cuantizaciones GGUF híbridas del modelo Qwen3.8-Flash-Next (Qwen), publicadas por el usuario sirfyyn. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 176.943.899.520 parámetros totales y 512 expertos enrutados por capa, de los cuales 10 se activan por token. El repositorio incluye tres variantes de cuantización (FLE-IQ3_M, FLE-IQ3_XXS y FLE-IQ2_M) más una cabeza MTP (multi-token prediction) de 1,53 GB requantizada a IQ4_NL.

La particularidad de estas cuantizaciones es que no son métodos nuevos: son empalmes de cuantizaciones públicas existentes (de Unsloth e ISTA-DASLab) en los que se seleccionan capas de expertos completas de distintos ficheros donantes, capa por capa, según la sensibilidad medida a un tamaño de fichero fijo. El objetivo declarado es reducir el tamaño manteniendo la divergencia KL frente a BF16 dentro de márgenes comparables o mejores que las cuantizaciones de referencia.

El modelo está pensado para ejecutarse con FLE (Fast Local Experts), un fork de llama.cpp orientado a correr modelos MoE grandes en una sola GPU más memoria del sistema. Los ficheros GGUF son estándar y cargan en llama.cpp upstream, aunque las cifras de velocidad y la cabeza MTP requieren el motor FLE. La licencia es qwen-community-1.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 512 expertos enrutados por capa, 10 activos por token |
| Parametros totales | 176.943.899.520 (aprox. 176,9 B) |
| Parametros activos | 10 de 512 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FLE-IQ3_M (88,87 GB), FLE-IQ3_XXS (79,48 GB), FLE-IQ2_M (71,62 GB), cabeza MTP IQ4_NL (1,53 GB); mezclas híbridas de varios tipos de tensor por fichero |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo mixture-of-experts con 176,9 mil millones de parámetros totales distribuidos en 48 capas y 512 expertos enrutados por capa, de los cuales se activan 10 por token. El repositorio de cuantización no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde a la model card del modelo base y no está incluida en la información disponible.

La innovación técnica de esta publicación no reside en el entrenamiento sino en el proceso de cuantización: las variantes FLE son empalmes de cuantizaciones públicas ya existentes (Unsloth e ISTA-DASLab), donde se eligen capas de expertos completas de distintos ficheros donantes mediante sensibilidad medida, a un tamaño de fichero fijado de antemano. El nombre de cada variante indica el ancho de bits asignado a los expertos enrutados (IQ3_M, IQ3_XXS, IQ2_M), y el prefijo FLE marca la mezcla. No son tipos de fichero estándar de llama.cpp (`ftype`): cada fichero mezcla varios tipos de tensor. Además se incluye la cabeza MTP propia del modelo, con sus expertos requantizados a IQ4_NL; el autor probó a reentrenarla y no dio mejoras en prompts no vistos, por lo que se distribuye sin reentrenar. Existe una variante podada (FLE-IQ3_M-REAP448) con 64 de los 512 expertos por capa eliminados por saliencia REAP, que queda en 161,84 B parámetros y se aloja en un repositorio aparte.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation).
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-Flash-Next; el repositorio no aporta evaluaciones específicas.
- Decodificación especulativa mediante la cabeza MTP incluida (1,53 GB, IQ4_NL), que actúa como modelo borrador para verificación de tokens.
- Ejecución local de un MoE de gran tamaño en una GPU más RAM del sistema gracias al motor FLE y a su caché de expertos.
- Compatibilidad con llama.cpp upstream para los ficheros GGUF estándar (sin las optimizaciones de velocidad de FLE).
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.

## Casos de uso

- Inferencia local de un MoE de 176,9 B en hardware de una sola GPU: con FLE-IQ3_M (88,87 GB) y el motor FLE se puede servir el modelo en una GPU de 32 GB más aproximadamente 120 GB de RAM, con unas 90 tok/s según la medición del autor. Adecuado para laboratorios y desarrolladores que quieren un modelo grande sin clúster multi-GPU.
- Despliegue con requisitos estrictos de memoria: FLE-IQ2_M ocupa 71,62 GB y su divergencia KL es claramente inferior a la de Unsloth UD-IQ1_M (74,5 GB), por lo que sirve para entornos donde cada gigabyte cuenta manteniendo una fidelidad mejor que la alternativa de menor tamaño.
- Sustitución directa en pipelines llama.cpp existentes: los tres GGUF son estándar y cargan en llama.cpp upstream, lo que permite probar el modelo en infraestructura ya montada sin adoptar el fork FLE.
- Aceleración de la decodificación con MTP: la cabeza MTP de 1,53 GB permite decodificación especulativa (borrador y verificación) bajo el motor FLE, útil en cargas interactivas donde la latencia por token es crítica.
- Evaluación comparativa de cuantizaciones: los datos de divergencia KL frente a BF16 publicados por el autor permiten a un equipo decidir entre IQ3_M, IQ3_XXS e IQ2_M según su presupuesto de memoria y su tolerancia a la pérdida de calidad.
- Variante podada para presupuestos ajustados: FLE-IQ3_M-REAP448 (82,00 GB, 161,84 B parámetros) reduce el tamaño respecto a FLE-IQ3_M manteniendo 448 expertos por capa, adecuada cuando se necesita un equilibrio entre tamaño y capacidad.
- Experimentación con decodificación especulativa: el par MTP más modelo principal sirve como banco de pruebas para estudiar la relación entre tasa de aceptación del borrador y throughput en MoE cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización (divergencia KL frente a BF16) y de velocidad:

| Metrica | Resultado |
|---|---|
| FLE-IQ3_M (88,87 GB) | Divergencia KL frente a BF16 dentro del ruido de Unsloth UD-IQ4_XS, con 4,81 GB menos |
| FLE-IQ3_XXS (79,48 GB) | Divergencia KL igual a Unsloth UD-IQ3_XXS (82,0 GB), con 2,5 GB menos |
| FLE-IQ2_M (71,62 GB) | Divergencia KL claramente por debajo de Unsloth UD-IQ1_M (74,5 GB) |
| Throughput (FLE-IQ3_M, motor FLE) | Aprox. 90 tok/s en una GPU de 32 GB con aprox. 120 GB de RAM |
| Base de mediciones del autor | 6.130 mediciones, estado a 2026-10-08 |

## Requisitos de hardware

- VRAM estimada: el autor reporta unas 90 tok/s con una GPU de 32 GB más aproximadamente 120 GB de RAM del sistema para FLE-IQ3_M; el resto de la memoria se cubre con RAM, no con VRAM.
- GPU recomendadas: no se especifican modelos concretos; el escenario medido es una GPU de 32 GB (clase V100 32 GB, A100 40 GB o similar). No hay datos para A100, H100 o RTX 4090 en la información disponible.
- ¿Cabe en GPU consumer? No en su totalidad: el fichero más pequeño (FLE-IQ2_M, 71,62 GB) excede la VRAM de cualquier GPU consumer actual; el diseño de FLE está pensado precisamente para repartir expertos entre GPU y RAM del sistema.
- Opciones de despliegue: FLE (fork de llama.cpp del autor) para velocidad y cabeza MTP; llama.cpp upstream para los GGUF estándar; FLE Link (`flelink run fle-iq3-m`) como instalador y lanzador de un solo comando; FLE Studio como aplicación de chat local.
- Latencia y throughput: aproximadamente 90 tok/s con FLE-IQ3_M en el hardware medido por el autor; no hay cifras para las otras variantes ni para llama.cpp upstream en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano del fichero | Contexto | Fidelidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLE-IQ3_M (este repo) | 176,9 B (MoE, 10/512 activos) | 88,87 GB | no disponible | Dentro del ruido de UD-IQ4_XS, 4,81 GB menos | qwen-community-1.0 | GGUF en HF |
| Unsloth UD-IQ4_XS | 176,9 B (modelo base) | 93,68 GB (deducido de la diferencia de 4,81 GB) | no disponible | Referencia de comparación | qwen-community-1.0 | GGUF en HF |
| Unsloth UD-IQ3_XXS | 176,9 B (modelo base) | 82,0 GB | no disponible | Igual que FLE-IQ3_XXS | qwen-community-1.0 | GGUF en HF |
| FLE-IQ2_M (este repo) | 176,9 B (MoE) | 71,62 GB | no disponible | Claramente mejor que UD-IQ1_M | qwen-community-1.0 | GGUF en HF |
| Unsloth UD-IQ1_M | 176,9 B (modelo base) | 74,5 GB | no disponible | Peor que FLE-IQ2_M | qwen-community-1.0 | GGUF en HF |
| FLE-IQ3_M-REAP448 | 161,84 B (448 expertos/capa) | 82,00 GB | no disponible | Medido con llama.cpp upstream | qwen-community-1.0 | GGUF en repo aparte |

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; no hay evidencia de soporte multilingüe en la información disponible.
- Fidelidad de cuantización: las variantes IQ2 e IQ3 introducen pérdida respecto a BF16; el propio autor mide la divergencia KL, pero no publica evaluaciones de tareas que cuantifiquen el impacto real en razonamiento o código.
- Cabeza MTP sin reentrenar: el autor probó a reentrenarla y la mejora solo se sostenía en las tareas de entrenamiento, no en prompts no vistos, por lo que la tasa de aceptación en uso real puede ser menor que la observada en pruebas internas.
- Dependencia del motor FLE: las cifras de velocidad y el uso de la cabeza MTP requieren el fork FLE; en llama.cpp upstream los ficheros cargan pero sin esas optimizaciones.
- Naturaleza híbrida: los ficheros no son `ftype` estándar de llama.cpp y mezclan varios tipos de tensor por fichero, lo que puede complicar la reproducibilidad y el soporte en herramientas de terceros.
- Licencia: qwen-community-1.0 (etiquetada como "other"); es necesario revisar los términos de la licencia de Qwen antes de cualquier uso comercial, y la cuantización no altera las obligaciones de la licencia del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base Qwen3.8-Flash-Next.
- Procedencia de los datos: las cuantizaciones donantes provienen de Unsloth e ISTA-DASLab; los créditos y la licencia deben respetarse al redistribuir.
- Requisitos de memoria: incluso la variante más pequeña (71,62 GB) exige RAM del sistema abundante además de la GPU; no es desplegable en un solo equipo consumer convencional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante podada REAP448: https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF
- Motor FLE (fork de llama.cpp): https://github.com/sirfyyn/FastLocalExperts
- Informe técnico: https://sirfyyn.github.io/FastLocalExperts/
- Informe técnico en PDF: https://sirfyyn.github.io/FastLocalExperts/fle-paper.pdf
- Lanzador FLE Link: https://flelink.run
- Web del proyecto: https://sirfyyn.de/en/fle/
- FLE Studio: https://github.com/sirfyyn/fle-studio
- Canal de YouTube: https://www.youtube.com/@sirfyyn
- Lista de reproducción "Making Rhea fast": https://www.youtube.com/playlist?list=PLMYhpsBSEhIQ
- Unsloth: https://unsloth.ai
- ISTA-DASLab: https://huggingface.co/ISTA-DASLab
