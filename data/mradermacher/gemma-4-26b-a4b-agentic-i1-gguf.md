# mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF` es una colección de cuantizaciones GGUF (con fichero imatrix) del modelo `ManniX-ITA/gemma-4-26B-A4B-agentic`, un ajuste fino de tipo SFT sobre la familia Gemma 4 con arquitectura Mixture-of-Experts (MoE). El modelo base parte de una arquitectura Gemma 4 con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y una designación "26B-A4B" que sugiere del orden de 4 mil millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El autor de las cuantizaciones es mradermacher, un perfil conocido en el ecosistema GGUF por publicar versiones optimizadas de modelos populares.

El propósito declarado del modelo es el uso "agentic": tool calling, razonamiento multi-paso, generación de código y resolución de tareas de ingeniería de software. Para ello se ha entrenado con una mezcla de datasets de SFT que incluye trazas de agentes (Hermes, Kimi), datasets de NVIDIA Nemotron orientados a agentes, código, SWE, programación competitiva, matemáticas, ciencia, instrucciones multilingües y razonamiento con herramientas. La licencia es Apache 2.0, lo que facilita su uso comercial, y el formato GGUF permite desplegarlo en hardware de consumo mediante llama.cpp u Ollama.

La relevancia actual reside en la combinación de tres factores: un modelo MoE de ~25B con activación dispersa (coste de inferencia más cercano a un modelo de ~4B), un ajuste específico para agentes y tool calling, y una disponibilidad inmediata en cuantizaciones que van desde ~8,4 GB (IQ1_S) hasta ~22,7 GB (Q6_K). Esto permite ejecutar un modelo de razonamiento agentico en GPUs de consumo de gama alta con 24 GB de VRAM en cuantizaciones Q4 o Q5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés declarado; el dataset incluye un set multilingüe de Nemotron, sin lista oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 25,2 mil millones de parámetros totales. La designación "26B-A4B" indica una arquitectura dispersa en la que solo una fracción de los expertos se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. No se dispone de detalles oficiales sobre el número exacto de expertos, el número de expertos activos por token, la dimensión oculta ni la longitud de contexto nativa, ya que la model card del repositorio GGUF no los incluye.

El ajuste fino se realizó mediante SFT (supervised fine-tuning) sobre una mezcla amplia de datasets: trazas de agentes propietarias (`ManniX-ITA/gemma-4-26B-A4B-agentic-sft`, `ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b`), datasets de NVIDIA Nemotron para agentes, OpenCode, SWE, programación competitiva, instrucciones conversacionales, matemáticas, ciencia y multilingüe, además de trazas de razonamiento con herramientas de Hermes (`interstellarninja/hermes_reasoning_tool_use`, `lambda/hermes-agent-reasoning-traces`). Los tags indican entrenamiento "on-policy" y el uso de "omk-model-optimizer". No se documenta en la información disponible si hubo etapas de RLHF o DPO posteriores al SFT. Las cuantizaciones i1 de mradermacher emplean un fichero imatrix generado a partir del modelo base para preservar mejor la calidad en cuantizaciones agresivas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito y trazas de razonamiento (el modelo está ajustado sobre datasets de reasoning traces).
- Tool calling / function calling, con formato compatible con endpoints de inferencia.
- Comportamiento agentico multi-paso: planificación, uso de herramientas y ejecución de tareas encadenadas.
- Generación de código, incluyendo tareas de ingeniería de software (SWE) y programación competitiva.
- Razonamiento matemático y científico (datasets Nemotron Math v3 y Science v1).
- Seguimiento de instrucciones conversacionales (Nemotron Instruction-Following Chat v1 y v2).
- Capacidades multilingües parciales, derivadas del dataset `Nemotron-SFT-Multilingual-v1`; el único idioma declarado oficialmente es el inglés.
- No se documenta soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Agentes autónomos de desarrollo de software: el modelo puede recibir una tarea de repositorio, inspeccionar ficheros mediante tool calling y proponer parches, gracias al entrenamiento sobre datasets SWE y OpenCode. Adecuado para integrarse en pipelines de CI/CD como generador de parches o revisor automático.
- Asistentes de coding en IDE: con cuantización Q4_K_M (~16,9 GB) puede ejecutarse en una RTX 4090 y ofrecer autocompletado, explicación de código y refactorización con tool calling para consultar documentación o ejecutar tests.
- Automatización de atención al cliente con herramientas: el modelo puede gestionar conversaciones multi-turno y llamar a APIs internas (consulta de pedidos, estado de tickets) gracias a su soporte de function calling y su ajuste sobre trazas de agentes.
- Razonamiento matemático asistido: útil para tutores automáticos o verificación de cálculos, apoyándose en el entrenamiento con Nemotron Math v3 y trazas de razonamiento paso a paso.
- Orquestación de agentes en local para privacidad: al ser GGUF y Apache 2.0, puede desplegarse en estaciones de trabajo sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Generación de código en programación competitiva y pruebas técnicas: el ajuste sobre Nemotron Competitive Programming v2 permite usarlo para generar soluciones, explicar algoritmos o evaluar candidatos en procesos de selección.
- Prototipado de pipelines agenticos con llama.cpp u Ollama: las cuantizaciones pequeñas (IQ2/IQ3, ~9-12 GB) permiten experimentar en GPUs de 12-16 GB antes de escalar a cuantizaciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, sin contar overhead de contexto KV):
  - i1-IQ1_S: ~8,4 GB (calidad muy degradada, solo para pruebas).
  - i1-IQ2_M: ~10,5 GB.
  - i1-IQ3_S: ~12,3 GB (mejor relación calidad/tamaño en el rango bajo).
  - i1-IQ4_XS: ~14,0 GB.
  - i1-Q4_K_S: ~15,6 GB.
  - i1-Q4_K_M: ~16,9 GB (recomendado por el autor como "fast, recommended").
  - i1-Q5_K_M: ~19,2 GB.
  - i1-Q6_K: ~22,7 GB (prácticamente equivalente a Q6_K estático).
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_M y Q6_K con contexto moderado; IQ4_XS y Q4_K_S con margen amplio.
  - RTX 4080 / 4070 Ti Super (16 GB): IQ3_S, IQ4_XS o Q4_K_S con contexto limitado.
  - RTX 3090 / 4090: Q5_K_M y Q6_K viables.
  - A100 40/80 GB y H100: cualquier cuantización con contexto largo y mayor throughput.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ2 a Q4 caben en GPUs de 12-16 GB; Q4_K_M y Q5_K_M caben en 24 GB; Q6_K requiere 24 GB con contexto ajustado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque la información disponible no confirma compatibilidad explícita.
- Latencia y throughput: no disponibles. Al ser MoE con ~4 B activos (según nomenclatura), se espera un throughput superior al de un modelo denso de 25 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-agentic-i1-GGUF (este) | ~25,2 B totales, MoE | no disponible | Apache 2.0 | GGUF (i1) | Ajuste agentico y tool calling; cuantizaciones de 8,4 a 22,7 GB |
| ManniX-ITA/gemma-4-26B-A4B-agentic | ~25,2 B totales, MoE | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este repositorio |
| mradermacher/gemma-4-26B-A4B-agentic-GGUF | ~25,2 B totales, MoE | no disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones estáticas del mismo modelo, sin imatrix |
| Modelos densos de ~24-27 B (p. ej. Gemma 2 27B, Qwen2.5 32B) | 24-32 B densos | variable | variable | safetensors/GGUF | Mayor coste de inferencia por token al no ser MoE; comparación cualitativa, sin benchmarks disponibles |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al entrenarse mayoritariamente con datos en inglés y datasets sintéticos de agentes, es probable un sesgo hacia ese dominio y hacia estilos de respuesta de trazas de agentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el ajuste sobre trazas de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en matemáticas y código.
- Contexto e idioma: la longitud de contexto no está documentada; el único idioma declarado es el inglés, aunque el dataset multilingüe de Nemotron puede aportar cierta cobertura adicional no garantizada.
- Cuantizaciones agresivas: IQ1 e IQ2 degradan notablemente la calidad; el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality". Para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento (Nemotron, Hermes) y del modelo base Gemma 4, que pueden imponer restricciones adicionales.
- Producción: no hay benchmarks publicados ni garantías de estabilidad; el modelo es un ajuste comunitario (ManniX-ITA) y no un modelo oficial de Google, por lo que el soporte y la documentación son limitados.
- Repositorio de 301 GB: incluye todas las cuantizaciones; la descarga debe hacerse fichero a fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-agentic-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
