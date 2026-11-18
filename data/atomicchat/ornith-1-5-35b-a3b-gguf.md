# AtomicChat/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B-GGUF es la distribución cuantizada en formato GGUF del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai y convertido por AtomicChat para su uso con llama.cpp. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) de los cuales se activan unos 3 mil millones por token, lo que permite velocidades de inferencia propias de un modelo de 3B con requisitos de memoria propios de un modelo de 35B. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto.

La relevancia de esta ficha radica en el trabajo de cuantización: AtomicChat no se limita a aplicar los presets estándar de llama.cpp, sino que construye layouts de bits por tensor ("AD") ajustados específicamente para este modelo mediante una matriz de importancia propia y calibración pública. Los resultados medidos con divergencia KL frente a la referencia BF16 muestran que varias configuraciones AD superan a los presets estándar en precisión y tamaño simultáneamente, lo que reduce el umbral de hardware necesario para servir el modelo en local.

El modelo está publicado bajo licencia MIT, lo que facilita su uso comercial, y acumula más de 49.000 descargas en Hugging Face. La información disponible no detalla la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer; 256 expertos con 8 activos por token |
| Parametros totales | 34.660.610.688 (aproximadamente 34,7B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible en la informacion proporcionada (las evaluaciones de cuantizacion se hicieron a 4096 tokens) |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, Q6_K, AD-Q6_K-Q5_K, Q5_K_M, AD-Q5_K-Q4_K, AD-Q5_K-IQ4_XS, Q4_K_M, AD-Q4_K-IQ4_XS, IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 256 expertos en total, de los cuales el router selecciona 8 por token. Esta configuración explica la relación entre parámetros totales (34,7B) y activos (aproximadamente 3B): cada experto debe residir en memoria porque el router puede escoger cualquiera de los 256 en cada token, pero el coste computacional por token corresponde a un modelo de 3B. Según la model card del cuantizador, los expertos representan el 93% de los pesos del modelo. El pipeline image-text-to-text indica que el modelo acepta entradas multimodales de imagen y texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo base. La innovación técnica documentada en esta ficha corresponde al proceso de cuantización: AtomicChat generó cinco layouts candidatos a la clase de cuatro bits y tres adicionales a seis bits, midió todos contra la misma referencia BF16 en el corpus held-out `eval_neutral` con contexto de 4096 y llama.cpp `b10505`, y conservó los ganadores. El layout óptimo difiere según el tamaño: a cuatro bits gana subir un paso `ffn_down_exps` compensándolo con `ffn_gate_exps` y `ffn_up_exps`, mientras que a seis bits ese mismo intercambio pierde frente a un layout plano.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` de la model card.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de comprensión visual combinadas con lenguaje.
- Modo de razonamiento conmutable ("thinking"), disponible en la aplicación Atomic Chat mediante toggles.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución local mediante llama.cpp, con soporte de offloading de expertos a CPU (`--cpu-moe`, `--n-cpu-moe N`).
- Capacidades de tool calling, function calling y agentes: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: la variante `AD-Q5_K-Q4_K` (22,1 GB) permite servir un modelo de 35B totales con 3B activos en una RTX 4090, manteniendo una divergencia KL de 0,025137 y un Top-1 del 93,52% frente a la referencia BF16.
- Asistentes conversacionales en local con privacidad de datos: el modelo puede gestionar diálogos multi-turno sin enviar información a servicios externos, usando la variante `AD-Q6_K` (29,1 GB, KLD 0,012961) en GPUs de 32 GB cuando se prioriza fidelidad.
- Análisis de imágenes con descripción textual: gracias al pipeline image-text-to-text, puede emplearse para extraer información estructurada de capturas, documentos escaneados o fotografías y generar resúmenes en lenguaje natural.
- Inferencia en hardware modesto mediante offloading de expertos: con `--n-cpu-moe N` o `--cpu-moe`, una GPU de 12 GB puede servir el build de 22 GB manteniendo velocidad utilizable, ya que solo 3B de parámetros se ejecutan por token y el coste de ancho de banda se traslada a RAM del sistema.
- Prototipado de agentes con razonamiento conmutable: el toggle de thinking permite alternar entre respuestas rápidas y cadenas de razonamiento más largas según la tarea, útil en entornos de desarrollo donde se itera sobre prompts.
- Evaluación comparativa de técnicas de cuantización: los logs públicos de métricas y el corpus de calibración permiten reproducir los experimentos de AtomicChat y validar layouts AD frente a presets estándar en un modelo MoE real.
- Integración en pipelines de CI/CD o herramientas de desarrollo: la compatibilidad con endpoints y llama.cpp facilita su inclusión en flujos automatizados que requieran un modelo multimodal autoalojado bajo licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos proporcionados corresponden a la fidelidad de las cuantizaciones frente a la referencia BF16, medidos como divergencia KL media en el corpus held-out `eval_neutral` con contexto de 4096 y llama.cpp `b10505`:

| Archivo | Tamano | KLD media | Top-1 |
|---|---|---|---|
| Q8_0 | 36,90 GB | 0,011620 | 95,64% |
| AD-Q6_K | 29,10 GB | 0,012961 | 95,31% |
| Q6_K | 28,51 GB | 0,016665 | 94,63% |
| AD-Q6_K-Q5_K | 26,25 GB | 0,015793 | 94,85% |
| Q5_K_M | 24,73 GB | 0,026870 | 93,31% |
| AD-Q5_K-Q4_K | 22,14 GB | 0,025137 | 93,52% |
| AD-Q5_K-IQ4_XS | 21,47 GB | 0,026380 | 93,33% |
| Q4_K_M | 21,17 GB | 0,047718 | 91,01% |
| AD-Q4_K-IQ4_XS | 20,13 GB | 0,031512 | 92,71% |
| IQ4_XS | 18,73 GB | 0,054181 | 90,36% |
| AD-IQ4_XS-IQ3_S | 17,61 GB | 0,057726 | 90,12% |
| AD-IQ3_S-IQ3_XXS | 15,51 GB | 0,087334 | 88,07% |
| AD-IQ3_XXS-IQ2_S | 13,67 GB | 0,141624 | 84,70% |

Conclusiones destacadas por el autor: `AD-Q5_K-Q4_K` es 2,6 GB más pequeño que `Q5_K_M` y más preciso; `AD-Q6_K-Q5_K` es 2,3 GB más pequeño que `Q6_K` y más preciso; `AD-Q4_K-IQ4_XS` es 1 GB más pequeño que `Q4_K_M` y reduce la divergencia un 34%; `AD-Q6_K` queda a un 12% de `Q8_0` con casi 8 GB menos. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada según el build elegido: 36,9 GB (Q8_0), 29,1 GB (AD-Q6_K), 26,25 GB (AD-Q6_K-Q5_K), 24,73 GB (Q5_K_M), 22,14 GB (AD-Q5_K-Q4_K), 21,47 GB (AD-Q5_K-IQ4_XS), 20,13 GB (AD-Q4_K-IQ4_XS), 17,61 GB (AD-IQ4_XS-IQ3_S), 15,51 GB (AD-IQ3_S-IQ3_XXS), 13,67 GB (AD-IQ3_XXS-IQ2_S).
- Guía del autor por VRAM: 48 GB para Q8_0; 32 GB para AD-Q6_K; 24 GB para AD-Q5_K-Q4_K o AD-Q4_K-IQ4_XS si se necesita espacio para contexto; 20 GB para AD-IQ4_XS-IQ3_S; 16 GB para AD-IQ3_S-IQ3_XXS; 12-16 GB para AD-IQ3_XXS-IQ2_S.
- GPU profesionales: A100 y H100 cubren sin problema cualquier build; una GPU de 48 GB permite Q8_0.
- GPUs de consumo: una RTX 4090 (24 GB) sirve AD-Q5_K-Q4_K o AD-Q4_K-IQ4_XS; tarjetas de 12-16 GB pueden servir builds mayores si se descargan expertos a RAM del sistema.
- Offloading de expertos: `--cpu-moe` coloca todos los expertos en CPU; `--n-cpu-moe N` descarga los expertos de N capas manteniendo el resto en GPU. El autor indica que esto permite a una tarjeta de 12 GB servir un build de 22 GB a velocidad utilizable, ya que los expertos son el 93% de los pesos pero solo se ejecutan 3B por token.
- Opciones de despliegue: llama.cpp (versión de referencia `b10505`), aplicación Atomic Chat, y cualquier runtime compatible con GGUF y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base que permitan una comparación de rendimiento con alternativas. La siguiente tabla compara únicamente características estructurales verificables a partir de la información disponible:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 34,7B | ~3B | No disponible | MIT | GGUF (safetensors en el base) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada modelos de la misma categoría (MoE multimodal de ~35B con ~3B activos) con datos suficientes para una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o demográficos.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de veracidad ni de tasa de alucinación del modelo base.
- Limitaciones de contexto: la longitud máxima de contexto no se especifica; las mediciones de cuantización se realizaron a 4096 tokens, por lo que el comportamiento más allá de esa ventana no está validado en esta ficha.
- Idiomas: no se detalla la cobertura lingüística; la calidad en castellano no está documentada.
- Licencia: MIT, lo que permite uso comercial, modificación y redistribución con atribución; debe conservarse el aviso de copyright. El enlace a la licencia del modelo base se incluye en la model card.
- Caveat de memoria en MoE: aunque solo se activan 3B parámetros por token, todos los expertos deben residir en memoria (GPU o RAM del sistema); el requisito de VRAM sigue el tamaño total del build, no el de los parámetros activos.
- Fidelidad de cuantizaciones agresivas: los builds por debajo de IQ3 muestran degradación notable (AD-IQ3_XXS-IQ2_S alcanza KLD 0,141624 y Top-1 84,70%), por lo que no se recomiendan para producción sensible a la precisión.
- Reproducibilidad: las métricas se obtuvieron con una versión concreta de llama.cpp (`b10505`); resultados con otras versiones pueden diferir.
- Modelo cuantizado, no original: esta ficha describe una conversión de terceros; para el comportamiento canónico del modelo debe consultarse el repositorio del modelo base.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/AtomicChat/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Logs de evaluación y métricas: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-35B-A3B-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_ornith_1_5_35b_a3b&utm_content=btn_atomic
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
