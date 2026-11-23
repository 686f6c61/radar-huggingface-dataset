# MarkusMarrei/slovo-4b

## Resumen

Slovo-4B (del ruso «Слово», «la palabra») es un modelo de lenguaje multilingüe de 4.022 millones de parámetros desarrollado por el usuario MarkusMarrei, obtenido mediante ajuste fino supervisado del modelo base Qwen/Qwen3-4B. Su propósito es cubrir 46 variedades lingüísticas indígenas, regionales y minoritarias de la Federación Rusa (Cáucaso, Volga-Ural, Siberia y Extremo Norte), además de lenguas eslavas y anclas globales como inglés, chino y árabe.

El modelo aborda el problema de la brecha digital en lenguas de bajos recursos y morfología aglutinante compleja, donde los modelos fundacionales convencionales rinden de forma deficiente. Para ello se entrenó sobre un corpus cultural auténtico (`slovo-dataset-v3`, 36.000 pares de instrucción-respuesta) compuesto por folclore, diálogos idiomáticos y narrativas etnográficas, evitando el sesgo de «Wikipedia» que afecta a otros intentos multilingües.

La relevancia actual reside en su enfoque de preservación del patrimonio cultural y en su accesibilidad: se distribuye en FP16 (safetensors) y en cuantizaciones GGUF (Q4_K_M y Q8_0) que permiten inferencia en portátiles de consumo con menos de 3 GB de RAM. La arquitectura subyacente es la de Qwen3-4B (transformer denso), con contexto heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no confirmada en la model card) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | 46 variedades: ru, tt, ba, cv, sah, ce, inh, av, lez, dar, lbe, tab, kum, krc, nog, kbd, ady, abq, os, tyv, bxr, xal, alt, kjh, chm, myv, mdf, udm, kpv, koi, krl, vep, yrk, eve, evn, gld, ckl, kpy, itl, en, be, uk, pl, sr, bg, zh, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

Slovo-4B parte de Qwen3-4B, un transformer denso de 4.022 millones de parámetros, y se entrena mediante ajuste fino con LoRA de rango 64 y alpha 128 aplicado a las siete capas de proyección lineal (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). A diferencia de los ajustes que solo tocan las cabezas de atención, esta cobertura completa preserva el razonamiento semántico del modelo base mientras remodela las representaciones intermedias para la morfología aglutinante compleja de las lenguas objetivo. Los adaptadores se fusionan posteriormente en pesos FP16 de precisión completa.

El entrenamiento se realizó durante 2.125 pasos con programación de tasa de aprendizaje coseno y calentamiento lineal, con una pérdida que descendió de 5,50 a 0,0446. El corpus empleado, `slovo-dataset-v3`, consta de 36.000 pares de instrucción-respuesta curados con folclore genuino, diálogos idiomáticos, narrativas etnográficas y pares de frases verificadas gramaticalmente. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional y de instrucciones en 46 variedades lingüísticas, con énfasis en lenguas indígenas y regionales de la Federación Rusa.
- Producción de contenido cultural: folclore, proverbios, narrativas etnográficas y descripciones de patrimonio (por ejemplo, vivienda tradicional yakuta).
- Traducción y pares de frases entre lenguas minoritarias y ruso, inglés y otras anclas eslavas y globales.
- Razonamiento y conocimiento general heredados de Qwen3-4B, incluida capacidad de código y matemáticas del modelo base (no evaluada específicamente en la model card).
- Soporte multilingüe amplio con anclas en inglés, chino, árabe, bielorruso, ucraniano, polaco, serbio y búlgaro.
- Formato de chat con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de tool calling y function calling: no confirmado específicamente para este ajuste; heredable del modelo base pero no verificado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.

## Casos de uso

- Preservación y difusión de patrimonio cultural: generación de textos en lenguas indígenas (tártaro, yakuto, buryato, etc.) con contenido folclórico y etnográfico auténtico, aprovechando el corpus curado frente al sesgo de «Wikipedia».
- Educación y revitalización lingüística: creación de materiales didácticos, ejercicios y traducciones para lenguas en peligro de desaparición, con pares de frases verificadas gramaticalmente.
- Atención al ciudadano multilingüe: atención automatizada en lenguas regionales de la Federación Rusa para administraciones y servicios públicos, con conversaciones multi-turno en formato ChatML.
- Traducción asistida de lenguas minoritarias: apoyo a traductores humanos en la conversión entre lenguas del Cáucaso, Volga-Ural, Siberia y ruso, dado el soporte de 46 variedades.
- Investigación lingüística y etnográfica: generación de ejemplos y análisis morfológico de lenguas aglutinantes, con pesos FP16 disponibles para ajuste e investigación.
- Despliegue en edge y dispositivos de consumo: inferencia local con GGUF Q4_K_M (2,33 GB) en portátiles con gráficos integrados AMD/Intel, a 18-19 tokens/s y menos de 3 GB de RAM, para aplicaciones de campo o sin conectividad.
- Documentación y catalogación de folklore: generación de resúmenes y descripciones de tradiciones orales en lenguas nativas para archivos culturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de entrenamiento (pérdida de 5,50 a 0,0446 en 2.125 pasos) y de inferencia en edge (18-19 tokens/s con GGUF en gráficos integrados, menos de 3 GB de RAM). No se aportan resultados de MMLU, HumanEval, GSM8K ni evaluaciones específicas por lengua.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en FP16 (pesos de 7,50 GB); en torno a 2,5-3 GB con GGUF Q4_K_M (2,33 GB) y 4-5 GB con Q8_0 (3,99 GB).
- GPU recomendadas: A100 o H100 para FP16 y ajuste fino; RTX 4090, RTX 3090 o RTX 4080 para FP16 en consumer; GPUs con 4-6 GB para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB) o superiores con FP16; en tarjetas de 4-6 GB con GGUF Q4_K_M.
- Despliegue en CPU: viable con GGUF mediante llama.cpp, Ollama, LM Studio o Jan; la model card reporta 18-19 tokens/s en portátiles con gráficos integrados AMD/Intel.
- Opciones de despliegue: vLLM o TGI para FP16 en servidor; llama.cpp, Ollama, LM Studio y Jan para GGUF; PEFT para el adaptador LoRA.
- Latencia y throughput: 18-19 tokens/s en edge con GGUF (dato de la model card); sin cifras publicadas para GPU en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slovo-4B | 4.022 M | no disponible | 46 variedades (indígenas + anclas) | Apache 2.0 | HF: FP16, GGUF, LoRA |
| Qwen3-4B (base) | 4.022 M | no disponible | Multilingüe general | Apache 2.0 | HF oficial |
| Modelos multilingües de bajos recursos | no disponible | no disponible | Variable | Variable | no disponible |

La comparativa directa con alternativas especializadas en lenguas indígenas de la Federación Rusa no está disponible en la información proporcionada. El competidor más cercano es el propio Qwen3-4B, del que Slovo-4B hereda arquitectura y licencia, diferenciándose por el ajuste cultural y lingüístico sobre 46 variedades.

## Limitaciones y advertencias

- Riesgo de alucinación en lenguas de muy bajos recursos: aunque el corpus evita el sesgo de «Wikipedia», la cobertura por lengua es desigual y puede producir formas gramaticales incorrectas en variedades con pocos datos.
- Sesgos culturales: el corpus se centra en el folclore y la etnografía de la Federación Rusa, lo que puede introducir un sesgo hacia narrativas tradicionales y limitar la diversidad temática moderna.
- Longitud de contexto no confirmada: no se especifica en la model card; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- Capacidades de tool calling, agentes y razonamiento multi-paso no verificadas para este ajuste concreto.
- Rendimiento en código, matemáticas y razonamiento general no evaluado específicamente; se asume el del modelo base pero sin garantía tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad lingüística en producción.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validación comunitaria inexistentes.
- Fecha de creación registrada como 2026-11-23, lo que conviene verificar en la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarkusMarrei/slovo-4b
- GGUF: https://huggingface.co/MarkusMarrei/slovo-4b-GGUF
- Adaptador LoRA: https://huggingface.co/MarkusMarrei/slovo-4b-lora
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
