# hermitdave/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw

## Resumen

Groot-19B-A3B-261023-MLX-rco-role-4.5bpw es una cuantización a 4.5 bits por peso (bpw) del modelo Groot-19B-A3B-261023, desarrollada por el usuario hermitdave mediante su herramienta rco-mlx con método RCO (Role-wise Calibration-Optimized). El modelo base, de GrootTeam, es un modelo de razonamiento tipo MoE (mixture of experts) de 19B parámetros totales con unos 3B parámetros activos por token, publicado bajo licencia Apache 2.0.

Esta variante resuelve un problema concreto: ejecutar un MoE de 19B en hardware Apple Silicon (Mac con chip M-series) sin recurrir a cuantizaciones RTN (round-to-nearest) de 4 bits que degradan notablemente la calidad. El método RCO asigna bits por rol de capa y calibra contra el modelo BF16, logrando una KL divergencia frente a BF16 un 81.2% menor que la línea base RTN. El formato es exclusivo de MLX, la librería de Apple para inferencia en Apple Silicon.

Es relevante porque combina una arquitectura híbrida innovadora (atención completa + Gated DeltaNet lineal), contexto de 262K tokens y una cuantización de alta fidelidad que reduce el tamaño de 56.2 GB (BF16) a unos 13.1 GB, haciéndolo ejecutable en Macs con 24-32 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE razonador híbrido: 40 capas (10 full-attention + 30 Gated DeltaNet lineal-attention), 128 expertos enrutados + 1 compartido, top-8 routing (tipo qwen3_5_moe) |
| Parametros totales | 19B |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | RCO 4.5 bpw objetivo (afín, group size 64); router en BF16, cabeza MTP en 8-bit, torre de visión en BF16; efectivo 6.08 bits/peso con overhead de escalas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors MLX, 6 shards, 13.13 GB); requiere mlx-lm y MLX ≥ 0.27 |

## Arquitectura y entrenamiento

El modelo base Groot-19B-A3B-261023 es un MoE de 19B parámetros con ~3B activos por token. Su arquitectura es híbrida: de las 40 capas totales, 10 usan atención completa (full attention) y 30 usan Gated DeltaNet, una forma de atención lineal con puertas que reduce el coste computacional en secuencias largas, lo que permite soportar 262K tokens de contexto. El enrutado MoE usa 128 expertos enrutados más 1 experto compartido, con top-8 routing. Incluye además una cabeza MTP (multi-token prediction) y una torre de visión (vision tower), esta última omitida en la cuantización.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a la cuantización, se realizó con rco-mlx usando datos de calibración de WikiText-2: se construyó una base de datos de errores contra el modelo BF16 y se asignaron bits por rol de capa (role-level allocation), con objetivo de 4.5 bpw, group size 64, modo afín, router mantenido en BF16 (los routers en baja precisión degradan la selección de expertos) y la cabeza MTP forzada a 8 bits. El peso efectivo final es de 6.08 bits por peso incluyendo el overhead de escalas y sesgos float32 (2 por grupo de 64).

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento: el modelo base se describe como un MoE de razonamiento (reasoning MoE), aunque no se han publicado métricas de razonamiento específicas.
- Contexto muy largo: hasta 262K tokens, útil para documentos extensos.
- Arquitectura multimodal potencial: el modelo base incluye torre de visión (conservada en BF16 en esta cuantización), aunque la variante está etiquetada solo como text-generation.
- MTP (multi-token prediction): cabeza presente, lo que puede habilitar decodificación especulativa en inferencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Chat y asistentes conversacionales en Mac: con 13.1 GB de tamaño, cabe en la memoria unificada de Macs con 24-32 GB, permitiendo ejecutar localmente un asistente con razonamiento sin depender de la nube.
- Análisis de documentos largos: los 262K tokens de contexto permiten procesar contratos, informes o bases de código completos en una sola sesión, y la atención lineal Gated DeltaNet mantiene el coste razonable en secuencias largas.
- Experimentación con cuantización de alta fidelidad: la variante RCO es idónea para investigadores que comparan métodos de cuantización (RCO frente a RTN) y estudian su impacto en distribuciones de salida (KL, top-1 agreement).
- Generación de texto con bajo coste por token: con ~3B parámetros activos por token, la inferencia es rápida en Apple Silicon (8.9 TPS medidos en esta cuantización frente a 20.6 TPS en BF16), adecuada para escritura asistida y resumen interactivo.
- Prototipado local de aplicaciones de IA: la integración con mlx-lm (API Python y CLI) facilita incorporar el modelo en scripts y aplicaciones locales sin servidores GPU.
- Razonamiento sobre problemas técnicos offline: al ser un modelo de razonamiento MoE, puede usarse para tareas de razonamiento paso a paso en entornos sin conexión, aunque conviene emparejarlo con retrieval para conocimiento factual denso, según indica el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni para el modelo base ni para esta cuantización. El autor sí publica mediciones de calidad de cuantización sobre texto retenido (10 secuencias de 1024 tokens de WikiText-2), comparando contra BF16:

| Modelo | Perplexity ↓ | KL vs BF16 ↓ | top-1 vs BF16 ↑ | TPS ↑ | Tamaño |
|---|---|---|---|---|---|
| BF16 (referencia) | 15.21 | — | — | 20.6 | 56.2 GB |
| RTN 4-bit (línea base) | 15.94 | 0.0587 | 83.7% | 0.67 | 34.3 GB |
| RCO 4.5bpw (este modelo) | 15.35 | 0.0110 | 91.1% | 8.9 | 13.1 GB |

Mejora de RCO frente a RTN a ~4.5 bpw: KL un 81.2% mejor, perplexity un 3.7% mejor, top-1 agreement +7.4 puntos. El autor advierte que un top-1 de 91.1% no significa que el 8.9% de predicciones sean erróneas: la mayoría de discrepancias ocurren en posiciones donde la propia distribución de BF16 es casi plana. También subraya que estas cifras son de perplexity y acuerdo distribucional, no de precisión en tareas, y que no se ha evaluado en benchmarks agénticos.

## Requisitos de hardware

- VRAM/memoria: 13.13 GB de pesos (6 shards). Para inferencia cómoda con KV cache en contexto largo, se recomienda al menos 24 GB de memoria unificada; con 32 GB o más se puede aprovechar contexto extenso.
- Hardware: exclusivamente Apple Silicon (requiere MLX ≥ 0.27). No funciona en GPU NVIDIA ni en CUDA; para esos entornos habría que buscar conversiones GGUF u otras del modelo base, no disponibles en la información proporcionada.
- Consumer hardware: sí, cabe en Macs de consumo con chip M-series y 24-32 GB de memoria unificada (p. ej. MacBook Pro M2/M3/M4 Pro). No aplicable a GPUs de consumo tipo RTX 4090 por el formato MLX.
- Despliegue: mlx-lm (API Python `mlx_lm.load`/`generate` y CLI `mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; no compatibles con este formato.
- Rendimiento: 8.9 tokens/s medidos para esta cuantización (frente a 20.6 TPS en BF16 y 0.67 TPS para RTN 4-bit en la misma batería de pruebas); el hardware concreto de medición no se detalla en la model card.

## Comparativa con modelos similares

Comparativa entre las variantes del propio modelo (misma arquitectura, distinta precisión), ya que no hay información suficiente para comparar con otros MoE de la misma clase:

| Modelo | Parámetros totales/activos | Contexto | Tamaño | Perplexity (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Groot-19B-A3B-261023 (BF16) | 19B / ~3B | 262K | 56.2 GB | 15.21 | Apache 2.0 | Hugging Face (GrootTeam) |
| Groot-19B-A3B RTN 4-bit | 19B / ~3B | 262K | 34.3 GB | 15.94 | Apache 2.0 | Línea base de referencia |
| Groot-19B-A3B RCO 4.5bpw (esta ficha) | 19B / ~3B | 262K | 13.1 GB | 15.35 | Apache 2.0 | Hugging Face (hermitdave), solo MLX |

La variante RCO ofrece el mejor equilibrio calidad/tamaño: solo 0.14 puntos de perplexity sobre BF16 con un tamaño 4.3 veces menor. Frente a otros MoE de tamaño similar (Qwen3-30B-A3B, etc.) no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- No es un fine-tune: es una compresión con pérdidas del modelo base. El autor recomienda emparejarlo con retrieval (RAG) para trabajo con conocimiento denso.
- La cuantización a 4.5 bpw tiene coste medible: KL de 0.0110 frente a BF16 y top-1 agreement del 91.1%. Para aplicaciones críticas, considerar BF16 o precisiones superiores.
- No evaluado en benchmarks agénticos ni de tareas: las métricas publicadas son perplexity y acuerdo distribucional, no precisión en MMLU u otros benchmarks.
- Sesgos: no disponible; no se documenta análisis de sesgos del modelo base.
- Alucinaciones: riesgo inherente a modelos de lenguaje; no hay datos específicos, pero al tratarse de una versión cuantizada el autor advierte explícitamente de la degradación frente a BF16.
- Idiomas: no se especifican idiomas soportados ni del modelo base ni de la cuantización; los datos de calibración (WikiText-2) son en inglés, lo que puede sesgar la calidad de la cuantización hacia ese idioma.
- Restricciones de plataforma: formato MLX exclusivo de Apple Silicon; no ejecutable en entornos CUDA/servidores GPU convencionales.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- La torre de visión se conserva en BF16 pero el modelo está etiquetado solo como text-generation; el soporte de visión en esta variante no está documentado.
- Throughput reducido frente a BF16 en la misma prueba (8.9 frente a 20.6 TPS), aunque muy superior a la línea base RTN (0.67 TPS).

## Enlaces

- Modelo cuantizado: https://huggingface.co/hermitdave/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Herramienta de cuantización rco-mlx: https://github.com/hermitdave/rco-mlx
