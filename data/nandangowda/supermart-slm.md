# nandangowda/supermart-slm

## Resumen

SuperMart SLM es un modelo de lenguaje de 339,6 millones de parametros entrenado **desde cero** (sin pesos preentrenados) por el desarrollador nandangowda para el proyecto academico AIML-C Design Thinking. Utiliza la arquitectura Qwen3 (transformer decoder-only con atención GQA y SwiGLU) y esta especializado en responder preguntas sobre analitica de retail y supermercados, a partir de un corpus de 262.659 cestas de compra (90 millones de tokens) y once papers de investigacion minorista.

El modelo es relevante como caso de estudio de entrenamiento desde cero en hardware de consumo: se entreno integramente en una unica GPU RTX 4050 Laptop de 6 GB de VRAM en aproximadamente 4,6 horas, en tres etapas (preentrenamiento, preentrenamiento de dominio y ajuste conversacional con ChatML). Se distribuye en formato safetensors (float32) y GGUF Q8_0 para Ollama/llama.cpp.

Su utilidad practica es limitada: memoriza casi perfectamente (95,3 % de recuerdo numerico) las respuestas vistas durante el ajuste fino, pero solo reproduce el 4,8 % de los hechos numericos en preguntas retenidas. Es, por tanto, una demostracion tecnica de pipeline completo mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Qwen3 |
| Parametros totales | 339.562.752 (339,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | float32 (safetensors); GGUF Q8_0 (367 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors, GGUF |

Otros detalles de arquitectura: 12 capas, hidden size 768, FFN 3072 con SwiGLU, atencion grouped-query con 12 cabezas de query y 6 de KV, head dim 64, QK-RMSNorm, RoPE con theta 10.000, vocabulario BPE de Qwen3 de 151.936 tokens, embeddings y LM head no atados.

## Arquitectura y entrenamiento

El modelo sigue el layout de Qwen3: transformer decoder-only de 12 capas con normalizacion RMSNorm, activacion SwiGLU y atencion GQA (12 cabezas de query, 6 de KV). Usa el tokenizador BPE de Qwen3 (151.936 tokens) y una plantilla de chat ChatML. El contexto esta limitado a 512 tokens.

El entrenamiento se realizo en tres etapas sobre una RTX 4050 Laptop (6 GB), con AdamW de 8 bits (beta 0,9/0,95, weight decay 0,1), warm-up lineal con decaimiento coseno, autocast bf16 con pesos maestros en fp32 y gradient checkpointing:

- **Etapa A (preentrenamiento desde cero):** 262.659 cestas de supermercado convertidas a texto (corpus de 90 M de tokens), 4.000 pasos (unos 33 M de tokens vistos), loss de entrenamiento final 0,455 y de validacion 0,529.
- **Etapa B (preentrenamiento de dominio):** 11 papers de retail limpios, glosario e insights de datos, 800 pasos, loss de entrenamiento 1,317 y de validacion 6,635 (mejor 5,766).
- **Etapa C (ajuste fino conversacional):** 452 conversaciones Q&A y 223 hechos, con perdida calculada solo sobre las respuestas, 800 pasos, loss de entrenamiento 0,011 y de validacion 2,871 (mejor 1,927).

El checkpoint publicado es el final de la etapa C. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre analitica de supermercado: ventas, productos, departamentos, descuentos, cestas, demografia de clientes, margen bruto, precios, metodos de pago e impuestos.
- Recuperacion de hechos numericos concretos del dataset SuperMart cuando la pregunta se ha visto durante el ajuste fino (95,3 % de recuerdo en la muestra de 50 preguntas).
- Formato conversacional multi-turno mediante plantilla ChatML con mensaje de sistema.
- Capacidad limitada de razonamiento sobre datos tabulares agregados (porcentajes de ventas por franja horaria, tamanos medios de cesta).
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni multi-step reasoning documentadas.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: solo ingles.

## Casos de uso

- **Prototipo academico de pipeline completo:** servir como referencia reproducible de entrenamiento desde cero (tokenizador, dataset, tres etapas, exportacion a GGUF y despliegue en Ollama) en una sola GPU de consumo.
- **Demostracion de Q&A sobre datos de retail:** responder preguntas frecuentes sobre un dataset de transacciones concreto, siempre que las respuestas esten contenidas en el corpus de ajuste.
- **Generacion de resumenes descriptivos de patrones de venta:** por ejemplo, distribucion de ventas por franja horaria o por departamento, usando las cifras memorizadas del dataset.
- **Asistente interno de consulta rapida en un entorno controlado:** para preguntas cerradas sobre el dataset SuperMart, con validacion humana de las respuestas por el riesgo de invencion.
- **Base para experimentos de ajuste fino adicional:** al ser pequeno (339,6 M) y caber en 6 GB de VRAM, permite iterar rapidamente sobre nuevas etapas de entrenamiento o nuevos dominios.
- **Evaluacion de tecnicas de cuantizacion y despliegue ligero:** el GGUF Q8_0 de 367 MB permite probar llama.cpp y Ollama en equipos sin GPU dedicada.
- **Material docente sobre limitaciones de los SLM:** ilustra con metricas concretas el fenomeno de memorizacion frente a generalizacion (95,3 % vs. 4,8 % de recuerdo numerico).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion en etapa A (13.825 cestas retenidas) | 1,7 |
| Recuerdo de hechos numericos, preguntas vistas en entrenamiento (muestra de 50) | 95,3 % |
| Recuerdo de hechos numericos, preguntas retenidas del ajuste conversacional (67 conversaciones) | 4,8 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que 57 de las 67 preguntas retenidas tienen sus respuestas presentes en el corpus de la etapa B (unas 38 en su parte de entrenamiento), por lo que la cifra del 4,8 % refleja incapacidad de generalizacion ante formulaciones nuevas.

## Requisitos de hardware

- **VRAM estimada:** aproximadamente 1,4 GB en float32 para los pesos (339,6 M de parametros); en torno a 0,4 GB con GGUF Q8_0.
- **GPU recomendadas:** cualquier GPU con 4 GB o mas de VRAM para inferencia en fp32; el entrenamiento se realizo en una RTX 4050 Laptop de 6 GB.
- **GPU de consumo:** si, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU via llama.cpp.
- **Opciones de despliegue:** transformers (`Qwen3ForCausalLM`, float32), Ollama (importando el `Modelfile` incluido), llama.cpp con el GGUF Q8_0. No se documenta soporte para vLLM ni TGI.
- **Latencia y throughput:** no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperMart SLM | 339,6 M | 512 | Desde cero, dominio retail | other | Hugging Face (safetensors + GGUF) |
| Qwen3-0.6B | 0,6 B | mayor que 512 (no detallado aqui) | Preentrenado + postentrenamiento general | no disponible en esta ficha | Hugging Face |
| SmolLM2-360M | 360 M | no disponible en esta ficha | Preentrenado general | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La comparacion relevante es cualitativa: frente a SLM generalistas preentrenados, SuperMart SLM ofrece especializacion estrecha y memorizacion exacta del dominio a costa de una generalizacion practicamente nula y un contexto de solo 512 tokens.

## Limitaciones y advertencias

- **Generalizacion muy baja:** solo reproduce el 4,8 % de los hechos numericos en preguntas retenidas; inventa respuestas seguras pero incorrectas fuera de su conjunto de ajuste.
- **Fuga entre etapas:** las respuestas de 57 de las 67 preguntas retenidas aparecen en el corpus de la etapa B, lo que invalida parcialmente la separacion entre entrenamiento y validacion.
- **Contexto muy corto:** 512 tokens limitan conversaciones multi-turno y documentos largos.
- **Solo ingles:** no soporta castellano ni otros idiomas.
- **Sesgos:** no documentados por el autor; al entrenarse sobre un unico dataset de transacciones, puede reflejar los sesgos de ese dataset.
- **Uso comercial:** la licencia es "other" y no se detallan sus terminos; es necesario contactar con el autor antes de cualquier uso en produccion.
- **No apto para decisiones de negocio o financieras:** el propio autor lo advierte explicitamente.
- **Sin datos de benchmarks estandar:** no es posible comparar su rendimiento general con otros modelos de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nandangowda/supermart-slm
- Dataset de Q&A: https://huggingface.co/datasets/nandangowda/supermarket-sales-qa
- Codigo del proyecto: https://github.com/NandangowdaKY/SLM-on-supermarket
- Notebook principal: `notebook/6_supermart_slm_end_to_end.ipynb` (dentro del repositorio del modelo)
- Ejecucion de entrenamiento: `notebook/6_supermart_slm_end_to_end_training_run_2026-11-18.ipynb`
- Experimento previo (Qwen3 SLM sobre TinyStories): `notebook/5_slm_from_scratch_qwen.ipynb`
