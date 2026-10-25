# ConnorYU/Qwen3.5-9B-VerIH-step300-template

## Resumen

Qwen3.5-9B-VerIH-step300-template es un ajuste fino (fine-tune) del modelo Qwen3.5-9B publicado por el desarrollador independiente ConnorYU en Hugging Face el 25 de octubre de 2026. Se trata de un modelo denso de 9.409.813.744 parámetros (unos 9,4 B) construido sobre la arquitectura `qwen3_5` y derivado, a su vez, del checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, que por su nombre sugiere un entrenamiento con GRPO (Group Relative Policy Optimization) orientado al seguimiento estricto de instrucciones en modo razonamiento.

El interés del modelo es acotado y muy específico: no es un lanzamiento oficial de Alibaba/Qwen, sino un experimento de la comunidad centrado en el ajuste de instrucciones y en el empaquetado de una plantilla de chat (`template`). La model card es mínima y no aporta datos de evaluación, composición del dataset ni detalles del proceso de RL, por lo que cualquier uso en producción exigiría una evaluación propia.

Aunque el autor declara únicamente el idioma inglés y no hay métricas publicadas, el modelo hereda la arquitectura multimodal de la familia Qwen3.5 y se etiqueta con la pipeline `image-text-to-text`, lo que abre la puerta a entradas de imagen y texto, siempre que se acompañe del procesador multimodal correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `qwen3_5` (Qwen3.5) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la ficha de un derivado en Featherless; no confirmado en la model card. El Qwen3.5-9B base declara 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (inglés), según la etiqueta `language` del repo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB, coherente con BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.5, con 9,4 B de parámetros y pesos en safetensors de 18,8 GB (aproximadamente 2 bytes por parámetro, lo que corresponde a BF16). El modelo se etiqueta como `image-text-to-text`, en línea con el carácter multimodal que la familia Qwen3.5 declara en sus fichas públicas, si bien la model card de este checkpoint no detalla ni el codificador visual ni el procesador asociado. El contexto declarado por un derivado en Featherless es de 32.768 tokens, muy por debajo de los 262.144 tokens nativos del Qwen3.5-9B original, lo que apunta a una posible reducción en la configuración de entrenamiento o a una limitación del pipeline de servicio, no confirmada por el autor.

El entrenamiento consistió en un ajuste fino supervisado del checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, realizado con Unsloth y la librería TRL de Hugging Face; el autor afirma que el entrenamiento fue "2 veces más rápido" gracias a Unsloth, sin aportar más detalles. El nombre del modelo base indica una etapa previa de RL con GRPO sobre tareas de tipo IFEval (seguimiento de instrucciones verificables) en variante `think`, es decir, con modo de razonamiento explícito. El sufijo `template` sugiere que este checkpoint incorpora o va acompañado de una plantilla de chat concreta. El autor mantiene variantes relacionadas en Hugging Face (`VerIH-step300`, `VerIH-step300-no-syshint`, `VerIH-step400-template`), lo que indica una experimentación iterativa con distintos pasos de entrenamiento y con y sin pistas de sistema. No se publica número de tokens, composición del dataset, ni si hubo DPO o RLHF en esta etapa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat incluida.
- Seguimiento de instrucciones verificables, heredado del entrenamiento GRPO sobre IFEval del modelo base.
- Modo de razonamiento (`think`) con trazas de pensamiento antes de la respuesta final, según el linaje del checkpoint base.
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text`, aunque la model card no documenta el soporte visual de forma explícita.
- Capacidades multilingües: limitadas al inglés según la etiqueta del repositorio; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo `think` es el único indicio de razonamiento explícito.
- Capacidades especiales adicionales (audio, visión documental, grounding): no disponibles.

## Casos de uso

- Evaluación de seguimiento estricto de instrucciones: el modelo sirve como sujeto de pruebas en bancos tipo IFEval, comparando su comportamiento con y sin pistas de sistema (el autor publica una variante `no-syshint` que facilita esta comparación).
- Investigación en RL aplicado a modelos pequeños: al estar entrenado con Unsloth y TRL, es una base razonable para reproducir ciclos de GRPO sobre un modelo denso de 9 B en una GPU de 24 GB en cuantización de 4 bits.
- Servicio de inferencia en inglés para prototipos: con 9,4 B de parámetros encaja en una sola GPU de 24 GB en BF16 y en GPUs de 8-12 GB en cuantización de 4 bits, lo que permite desplegarlo con TGI o vLLM para pruebas de concepto.
- Asistente conversacional con razonamiento explícito: útil en escenarios donde se quiere inspeccionar la traza de pensamiento (por ejemplo, depuración de respuestas en tareas de lógica o matemáticas sencillas), siempre con validación humana.
- Experimentos de robustez frente a jerarquía de instrucciones: las variantes del autor (`VerIH`, `no-syshint`, derivados `sec`) apuntan a líneas de trabajo sobre cómo el modelo prioriza instrucciones de sistema frente a las del usuario; este checkpoint puede usarse como referencia base en ese tipo de estudios.
- Procesamiento de entradas mixtas imagen-texto en pruebas controladas: si se confirma el soporte multimodal, podría emplearse para descripción de imágenes o extracción de información de documentos escaneados, aunque sin garantías al no estar documentado.
- Generación de código y matemáticas: plausible por herencia de la familia Qwen3.5, pero sin benchmarks publicados que lo respalden; no recomendable como argumento de venta en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, IFEval ni ninguna otra métrica, y el repositorio no cuenta con descargas ni evaluaciones de la comunidad (0 descargas, 0 likes en el momento de la consulta). Los únicos datos cuantitativos verificables son el número de parámetros (9.409.813.744) y el tamaño del repositorio (18,8 GB).

## Requisitos de hardware

- VRAM para inferencia en BF16: unos 19-20 GB solo para pesos, más caché KV; en la práctica, 22-24 GB para contextos moderados.
- VRAM en cuantización de 8 bits: aproximadamente 10-11 GB; en 4 bits, alrededor de 5,5-7 GB, aunque estas cifras son estimaciones a partir del tamaño de los pesos, no medidas publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para servicio concurrente en BF16; RTX 4090 o RTX 3090 (24 GB) para una instancia en BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 con contexto recortado, y en RTX 4080 (16 GB) o RTX 3060 (12 GB) recurriendo a cuantización de 8 o 4 bits.
- Opciones de despliegue: Transformers (librería declarada), TGI (etiqueta `text-generation-inference`), vLLM para servicio con procesamiento multimodal, y Unsloth/TRL para reentrenamiento. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step300-template | 9,4 B (denso) | 32.768 (derivado, sin confirmar) | Apache 2.0 | Sí (pipeline declarada) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9 B (denso) | 262.144 nativos | Apache 2.0 | Sí | No verificado en esta ficha | Hugging Face, LM Studio |
| Qwen3-8B | 8,2 B (denso) | 32.768 nativos, ampliable | Apache 2.0 | No | Ampliamente publicado por el autor | Hugging Face, ecosistema amplio |
| Llama 3.1 8B Instruct | 8 B (denso) | 128.000 | Llama 3.1 Community License | No | Ampliamente publicado por el autor | Hugging Face, amplio soporte |

La comparación relevante es con el Qwen3.5-9B original: mismo tamaño y licencia, pero con un contexto declarado mucho mayor (262.144 frente a los 32.768 que reporta un derivado de este fine-tune) y con respaldo de evaluación del que aquí se carece. Frente a Qwen3-8B y Llama 3.1 8B, este checkpoint no ofrece métricas que permitan situarlo, y su licencia Apache 2.0 es más permisiva que la de Llama 3.1.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas de la comunidad, ni descargas; el rendimiento real es desconocido.
- Model card mínima: no se documenta el dataset de ajuste, la composición de idiomas, el número de tokens ni la metodología del GRPO previo.
- Riesgo de sobreajuste al formato de instrucciones: un entrenamiento orientado a IFEval puede degradar la calidad en conversación abierta o producir respuestas excesivamente esquemáticas.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está garantizado y probablemente sea inferior al de modelos multilingües explícitos.
- Soporte multimodal incierto: la pipeline `image-text-to-text` está declarada, pero sin documentación del procesador ni del codificador visual; la inferencia con imágenes puede fallar si no se replica la configuración exacta del autor.
- Plantilla de chat específica: el sufijo `template` implica dependencia de una plantilla concreta; usar otra puede degradar gravemente las respuestas o romper el modo de razonamiento.
- Contexto reducido frente al modelo base: si se confirman los 32.768 tokens, se pierde la mayor parte de la ventana nativa de Qwen3.5-9B, lo que afecta a casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos de 9 B sin verificación factual; no hay datos que indiquen mitigación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la trazabilidad del linaje (varios fine-tunes encadenados) dificulta auditar qué datos intervinieron en cada etapa.
- Proyecto de autor individual: sin mantenimiento garantizado, sin versión de referencia ni issues atendidas; no es una base recomendable para producción sin una validación interna profunda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300-template
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Variante sin pistas de sistema: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300-no-syshint
- Repositorio de la variante step300: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300/tree/main
- Derivado publicado en Featherless: https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300
- Ficha de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Registro de la variante step400: https://free2aitools.com/model/connoryu/qwen3.5-9b-verih-step400-template
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
