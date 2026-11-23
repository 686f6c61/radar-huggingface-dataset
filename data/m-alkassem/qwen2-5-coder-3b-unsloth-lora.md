# M-Alkassem/qwen2.5-coder-3b-unsloth-lora

## Resumen

El repositorio `M-Alkassem/qwen2.5-coder-3b-unsloth-lora` contiene un adaptador LoRA (PEFT) entrenado por M-Alkassem sobre el modelo base `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del `Qwen/Qwen2.5-Coder-3B-Instruct`. No se trata de un modelo autónomo, sino de un delta de pesos que debe cargarse sobre el modelo base para funcionar. El objetivo declarado es mejorar las respuestas de programación estructurada, el seguimiento de instrucciones en tareas de código y la corrección sencilla de errores.

El adaptador se entrenó mediante SFT (supervised fine-tuning) con LoRA de rango 16 sobre una muestra de 3.993 filas del dataset `bigcode/self-oss-instruct-sc2-exec-filter-50k`, con una longitud máxima de secuencia de 1.024 tokens y 250 pasos de entrenamiento en una GPU Tesla T4 de Google Colab. La pérdida final de entrenamiento reportada es de aproximadamente 0,6130. Es, por tanto, un experimento de bajo coste computacional, no un modelo de producción a gran escala.

Su relevancia es limitada pero concreta: demuestra un flujo de trabajo reproducible de ajuste fino de un modelo de código de 3B parámetros en hardware consumer (T4 de 16 GB), sirve como primera etapa de un proyecto de dos fases (le sigue el adaptador orientado a agentes `M-Alkassem/qwen2.5-coder-3b-agent-v1`) y ofrece un punto de partida ligero para quien quiera experimentar con asistentes de código sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder 3B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-3B-Instruct tiene 3B; el adaptador LoRA anade un subconjunto no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (longitud de secuencia usada en entrenamiento: 1.024 tokens) |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion (bitsandbytes); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`, una version del transformer decoder-only Qwen2.5-Coder de 3B parametros cuantizada a 4 bits con la libreria Unsloth. El ajuste fino emplea LoRA con rango 16, alpha 16 y dropout 0, entrenado con SFT a traves de TRL. La configuracion de entrenamiento incluye batch size de 1 por dispositivo, acumulacion de gradientes de 16 (batch efectivo de 16), learning rate de 1e-4, optimizador `adamw_8bit` y una longitud maxima de secuencia de 1.024 tokens durante 250 pasos.

Los datos provienen de una muestra del dataset `bigcode/self-oss-instruct-sc2-exec-filter-50k`: se muestrearon 4.000 filas antes del filtrado y se usaron 3.993 tras el mismo. Se trata de instrucciones de codigo generadas y filtradas por ejecucion, orientadas a tareas de programacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones arquitectonicas propias: el adaptador no modifica la arquitectura del modelo base, solo anade matrices de bajo rango en las capas seleccionadas.

## Capacidades

- Generacion de codigo en respuesta a instrucciones en lenguaje natural, con enfasis en respuestas estructuradas.
- Correccion y depuracion de errores sencillos en fragmentos de codigo (el ejemplo de la model card es identificar el fallo logico en `def is_even(n): return n % 2 == 1`).
- Seguimiento de instrucciones para tareas de programacion de complejidad baja o media.
- Generacion de texto conversacional en el contexto de asistencia a la programacion.
- Capacidad multilingue limitada al ingles segun la model card (el modelo base Qwen2.5-Coder soporta mas idiomas, pero el adaptador se entreno y declara solo `en`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision, audio ni modo de pensamiento explicito en este adaptador. El proyecto reserva la orientacion a agentes para el adaptador posterior `M-Alkassem/qwen2.5-coder-3b-agent-v1`.

## Casos de uso

- Asistente de codigo ligero en local: cargar el adaptador sobre el base en 4 bits permite disponer de un asistente de programacion en una GPU de 16 GB, util para entornos de desarrollo sin acceso a APIs externas.
- Depuracion de fragmentos pequenos: el adaptador se entreno especificamente para identificar errores simples y explicarlos, por lo que encaja en tareas de revision de funciones cortas o ejercicios.
- Generacion de respuestas de codigo estructuradas: util para prototipos de herramientas que necesitan salidas de codigo bien formateadas a partir de una instruccion breve.
- Base para experimentacion en ajuste fino: sirve como referencia reproducible de un pipeline LoRA + SFT + 4-bit sobre T4, replicable en Google Colab para docencia o investigacion de bajo presupuesto.
- Punto de partida para adaptadores posteriores: el proyecto lo usa como etapa inicial antes del adaptador orientado a agentes, de modo que quien quiera continuar el entrenamiento puede reutilizarlo como checkpoint intermedio.
- Evaluacion comparativa de tecnicas de ajuste: al ser un adaptador pequeno con hiperparametros documentados (r=16, alpha=16, lr=1e-4, 250 pasos), resulta util como linea base en experimentos sobre calidad de respuestas de codigo.
- Integracion en cuadernos y demos educativas: su tamano (repositorio de 0,1 GB) y su carga via PEFT lo hacen adecuado para tutoriales sobre fine-tuning y despliegue de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento (aproximadamente 0,6130) y senala que, en una comparativa interna posterior de respuestas directas, el adaptador no fue el mejor en todos los prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con el base cargado en 4-bit NF4 (configuracion recomendada en la model card) el modelo completo deberia ajustarse en torno a 2-3 GB de VRAM, mas el overhead de activaciones y contexto; el adaptador LoRA anade una cantidad marginal.
- GPU de entrenamiento documentada: Tesla T4 (16 GB) en Google Colab, con batch size 1 y acumulacion de gradientes 16.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM deberia poder ejecutar la inferencia en 4 bits (por ejemplo, RTX 3060, RTX 4060, RTX 4070); para entrenamiento, T4 o superiores. No se proporcionan datos para A100/H100.
- Cabe en GPU consumer: si, en configuracion 4-bit; en fp16 el base de 3B requeriria aproximadamente 6-7 GB solo para pesos.
- Opciones de despliegue: la model card documenta carga via `transformers` + `peft` + `bitsandbytes`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, su uso con esos motores requeriria fusion previa con el base o soporte especifico de adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| M-Alkassem/qwen2.5-coder-3b-unsloth-lora | Adaptador sobre base de 3B | No disponible | Apache 2.0 | safetensors (PEFT) | Requiere cargar el base; 12 descargas; ajuste de bajo coste en T4 |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | No disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base oficial; sin el ajuste especifico del adaptador |
| M-Alkassem/qwen2.5-coder-3b-agent-v1 | Adaptador sobre el mismo base | No disponible | No disponible en la informacion proporcionada | safetensors (PEFT) | Segunda etapa del proyecto, orientada a agentes |

La comparacion con alternativas de otros autores no puede completarse con los datos disponibles: no se han publicado metricas que permitan situar este adaptador frente a otros asistentes de codigo de tamano similar.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit` (o `Qwen/Qwen2.5-Coder-3B-Instruct`), lo que anade dependencias y pasos de despliegue.
- Entrenamiento de muy baja escala: 3.993 filas, 250 pasos y secuencias de 1.024 tokens; el propio autor lo describe como un experimento practico de bajos recursos, no como un modelo universalmente superior.
- El autor reconoce que el adaptador no fue el mejor en todos los prompts de una comparativa interna posterior de respuestas directas.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de error en codigo generado; al derivar de un modelo de 3B, es esperable una mayor propension a errores en tareas complejas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset de instrucciones de codigo puede arrastrar sesgos de estilo y de dominio del corpus original.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta validado aunque el base soporte mas idiomas.
- Contexto: la longitud de contexto efectiva del adaptador no se especifica y el entrenamiento se limito a 1.024 tokens, por lo que el comportamiento en ventanas largas no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue en produccion.
- Popularidad muy baja (12 descargas, 1 like en el momento de la consulta): no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-unsloth-lora
- Modelo base (Qwen oficial): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Base cuantizado de Unsloth: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Adaptador de segunda etapa (agentes): https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-agent-v1
