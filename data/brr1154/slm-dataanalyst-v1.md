# BRR1154/SLM-DataAnalyst-v1

## Resumen

SLM-DataAnalyst-v1 es un modelo de lenguaje de pequeno tamano (SLM) afinado por Bhavanam Rajendra Reddy, bajo la organizacion Runtime-Slayers, a partir de Qwen/Qwen2.5-0.5B-Instruct. Con 494.032.768 parametros reales en safetensors (el autor declara 492 millones), esta especializado en generacion de analisis exploratorio de datos (EDA), contrastes de hipotesis y cotas de riesgo conformes (split-conformal) para datos de alta criticidad en ambitos medico y de ingenieria.

El modelo se presenta como parte del denominado "Runtime-Slayers Autonomous SLM Swarm Engine", un sistema que, segun la model card, coordina este SLM con orquestadores de mayor tamano (NVIDIA Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1 y Kimi K3.1 Pro). La propuesta tecnica destacada es un protocolo de edicion de pesos denominado "Gram-Schmidt Subspace Null-Space Model Editing", que el autor describe como libre de olvido catastrofico mediante la restriccion delta W · V_base = 0.

Es relevante por su enfoque vertical: en lugar de competir en capacidades generales, apunta a un nicho concreto (estadistica aplicada y cuantificacion de incertidumbre) con un coste de inferencia minimo. No obstante, el repositorio no incluye resultados de benchmarks, detalles del dataset de ajuste ni documentacion reproducible del protocolo de edicion, lo que limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), afinado sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (safetensors); el autor declara 492 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, embeddings RoPE y capas con MLP tipo SwiGLU. Sobre esa base se aplica, segun la model card, una "cirugia de pesos" mediante edicion en subespacio nulo con ortogonalizacion de Gram-Schmidt, cuyo objetivo declarado es modificar el comportamiento del modelo sin degradar las capacidades originales (condicion delta W · V_base = 0, es decir, que la actualizacion de pesos sea ortogonal a los subespacios preservados del modelo base).

No se especifica en la informacion disponible el numero de tokens de ajuste, la composicion del dataset, si hubo RLHF, DPO o SFT supervisado, ni la naturaleza exacta de los datos de entrenamiento (si son sinteticos, generados por los orquestadores citados, o reales). Tampoco se documenta el procedimiento de validacion del protocolo de edicion ni se aportan artefactos que permitan reproducirlo. La unica innovacion tecnica declarada es el propio protocolo de edicion de pesos y la especializacion en cotas conformes de riesgo.

## Capacidades

- Generacion de texto en ingles orientada a analisis exploratorio de datos (EDA): resumenes descriptivos, deteccion de valores atipicos, propuestas de transformaciones.
- Razonamiento estadistico basico: planteamiento de contrastes de hipotesis y seleccion de tests.
- Generacion de cotas de riesgo conformes (split-conformal prediction) para cuantificar incertidumbre en predicciones.
- Formato conversacional mediante plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (la model card lo situa como componente de un "swarm engine", pero sin detalles tecnicos).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Analisis exploratorio asistido en pipelines de datos medicos: el modelo puede generar informes descriptivos preliminares y sugerir verificaciones de supuestos antes de un analisis formal, reduciendo el trabajo manual inicial en equipos de bioestadistica.
- Documentacion de contrastes de hipotesis: dado un diseno experimental descrito en lenguaje natural, el modelo puede proponer el test adecuado, los supuestos y la interpretacion esperada, como borrador para revision humana.
- Cuantificacion de incertidumbre en modelos predictivos clinicos: generacion de plantillas y explicaciones de cotas conformes que acompanen a las predicciones de un modelo de riesgo, facilitando su comunicacion a equipos clinicos.
- Asistencia en ingenieria de fiabilidad: redaccion de analisis estadisticos de datos de sensores y ensayos, con enfasis en intervalos de confianza y cotas de riesgo.
- Componente de bajo coste en un sistema multiagente: al ocupar menos de 0,5 GB en float32, puede desplegarse como subagente especializado en tareas estadisticas dentro de un pipeline orquestado por un modelo mayor.
- Generacion de borradores de secciones estadisticas en informes tecnicos o regulatorios, siempre con supervision experta antes de su uso.
- Prototipado educativo: entorno ligero para experimentar con plantillas de EDA y cotas conformes sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en float32 (494 M parametros x 4 bytes mas overhead de activaciones y cache KV); en float16 en torno a 1 GB; en cuantizacion de 8 bits en torno a 0,5-0,7 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos ocho anos, y en CPU con latencia aceptable para uso interactivo.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles (etiqueta `endpoints_compatible`). vLLM, llama.cpp y Ollama no estan documentados en la informacion disponible, aunque por tamano y arquitectura Qwen2 serian viables.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-DataAnalyst-v1 | 494 M | no disponible | EDA y cotas conformes | apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun documentacion publica de Qwen) | Instrucciones generales | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens (segun documentacion publica de Qwen) | Instrucciones generales | apache-2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (segun documentacion publica de Hugging Face) | Instrucciones generales | apache-2.0 | Hugging Face |

La ventaja diferencial de SLM-DataAnalyst-v1 frente a sus alternativas generalistas es la especializacion declarada; sin embargo, al no publicarse benchmarks, no es posible verificar que esa especializacion supere al modelo base en tareas estadisticas. Los datos de contexto de los modelos comparados provienen de su documentacion publica, no de la informacion proporcionada sobre este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en tareas de EDA o estadistica.
- Documentacion incompleta: no se detalla el dataset de ajuste, el numero de tokens, la metodologia de evaluacion ni la reproducibilidad del protocolo de edicion de pesos.
- Riesgo de alucinacion elevado en contenido estadistico: un modelo de 0,5 B puede proponer tests inadecuados, malinterpretar supuestos o generar cotas de riesgo incorrectas; cualquier salida debe validarse por un estadistico.
- Uso en ambito medico: la model card menciona datos medicos de alta criticidad, pero no se aportan garantias regulatorias, validacion clinica ni advertencias de uso responsable. No debe usarse como unico criterio en decisiones clinicas.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Contexto no confirmado: aunque el modelo base soporta ventanas amplias, no se verifica que el ajuste preserve esa capacidad.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el rendimiento.
- Cero descargas y cero likes en el momento de la ficha: no existe validacion por parte de la comunidad.
- Referencias a orquestadores y frameworks (Nemotron-3-Ultra, DeepSeek V4.1, GLM-5.3, Harness²) sin enlaces verificables en la informacion proporcionada; conviene tratarlas con escepticismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-DataAnalyst-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organizacion del autor en GitHub: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
