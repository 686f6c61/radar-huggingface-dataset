# mlx-community/Ling-3.1-flash-1019-oQ4e-mtp

## Resumen

Ling-3.1-flash-1019-oQ4e-mtp es una cuantización mixta en formato MLX del modelo inclusionAI/Ling-3.1-flash-1019, publicada por la comunidad mlx-community en Hugging Face. El modelo base es una versión mejorada de Ling-3.1-flash con capacidades de razonamiento y agénticas reforzadas, y se trata de un modelo de mezcla de expertos (MoE) híbrido con atención lineal de 560B de parámetros totales y 25B activos por token.

La cuantización, realizada con la herramienta oQ (oMLX v0.7.3rc1), aplica un esquema denominado oQ4e que asigna bits por sensibilidad medida de cada capa, obteniendo una media efectiva de 4,615 bits por peso. El checkpoint completo ocupa 330,1 GB y conserva tanto el modelo de lenguaje como la capa MTP (NextN), que oMLX ejecuta como decodificación especulativa "Lightning MTP" para acelerar la inferencia.

Este modelo es relevante para usuarios del ecosistema Apple Silicon (Mac Studio, Mac Pro con GPU unificada de alta memoria), ya que permite ejecutar localmente un modelo MoE gigante con calidad cercana al original en FP8, gracias a la cuantización por importancia y al refit por mínimos cuadrados ponderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido lineal (bailing_hybrid): 63 capas KDA de atención lineal + 9 capas MLA con gating |
| Parametros totales | 572.120.680.768 (incluye capa MTP de 8,174B) |
| Parametros activos | 25B por token (8 expertos activos de 512 enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: Affine 4-bit (grupo 64), Affine 8-bit (grupos 64 y 128), BF16, FP32; media efectiva 4,615 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, cuantizado con oQ/oMLX v0.7.3rc1) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos híbrido: combina 63 capas de atención lineal KDA (Kimi Delta Attention) con 9 capas de atención MLA (Multi-head Latent Attention) con mecanismo de gating. El enrutamiento MoE cuenta con 512 expertos de los cuales 8 se activan por token, lo que reduce el coste computacional por token a unos 25B de parámetros activos pese a los 560B totales del backbone. El checkpoint incluye además la capa MTP (NextN, multi-token prediction), que oMLX aprovecha para decodificación especulativa Lightning MTP.

Sobre el entrenamiento del modelo base no se han publicado en la información disponible detalles sobre número de tokens, composición del dataset ni etapas de RLHF/DPO. Sí está documentado el proceso de cuantización: oQ4e mide la sensibilidad de cada capa, recopila una matriz de importancia (256 muestras × 512 tokens, capa a capa, a partir de los pesos FP8 originales) y aplica un refit por mínimos cuadrados ponderados de escalas y sesgos. El resultado asigna el 97,123 % de los pesos a 4 bits (grupo 64), un 2,680 % a 8 bits (grupo 64) y pequeñas porciones a 8 bits (grupo 128) y BF16.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento mejorado respecto a Ling-3.1-flash, según la descripción del modelo base.
- Capacidades agénticas mejoradas respecto a Ling-3.1-flash.
- Decodificación especulativa mediante la capa MTP (Lightning MTP en oMLX), que acelera la generación.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Ejecución local en Apple Silicon de gama alta: con 330 GB de pesos, el modelo está pensado para máquinas con memoria unificada muy amplia (por ejemplo Mac con 512 GB), permitiendo inferencia privada sin nube.
- Asistentes conversacionales avanzados: al ser un modelo conversacional con razonamiento mejorado, sirve de base para chatbots de dominio complejo que requieren respuestas elaboradas.
- Sistemas agénticos multi-paso: las mejoras agénticas de Ling-3.1-flash-1019 lo hacen adecuado para orquestar flujos de trabajo con varias llamadas y decisiones encadenadas.
- Generación acelerada con decodificación especulativa: la capa MTP permite aumentar el throughput de tokens por segundo en despliegues con oMLX, útil para servir muchos usuarios o generar textos largos.
- Experimentación e investigación sobre MoE híbridos con atención lineal: la arquitectura KDA + MLA con 512 expertos es un objeto de estudio interesante para investigadores de eficiencia arquitectural.
- Prototipado de cuantización de precisión mixta: el checkpoint sirve como referencia práctica de lo que consigue oQ4e (4,615 bits/peso) sobre pesos FP8 originales, útil para evaluar técnicas de cuantización en modelos gigantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 307,385 GiB (330,052 GB) solo de pesos; en la práctica se necesita una máquina Apple Silicon con al menos 384-512 GB de memoria unificada, ya que no cabe en ninguna GPU convencional.
- GPU recomendadas: no aplicable a GPUs NVIDIA convencionales por el formato MLX; el objetivo son Apple M-Series Ultra con memoria unificada elevada (por ejemplo 512 GB). No cabe en consumer GPUs como la RTX 4090 (24 GB) ni en tarjetas de gama alta actuales.
- Despliegue: mediante MLX y oMLX (v0.7.3rc1 o superior), que ejecuta la capa MTP como Lightning MTP speculative decoding. No hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI con este checkpoint cuantizado.
- Latencia y throughput: no disponible; la decodificación especulativa MTP sugiere mejoras de velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-oQ4e-mtp (este) | 572,12B (con MTP) | 25B | MLX safetensors cuantizado (4,615 bits/peso) | MIT | Hugging Face, mlx-community |
| inclusionAI/Ling-3.1-flash-1019 (base) | ~560B + MTP | 25B | Pesos originales (FP8 según la model card) | MIT | Hugging Face, inclusionAI |
| inclusionAI/Ling-3.1-flash | no disponible | no disponible | no disponible | no disponible | Hugging Face, inclusionAI |

No se han publicado benchmarks que permitan comparar rendimiento numérico entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al heredar del modelo base inclusionAI, pueden trasladarse los sesgos de este, no documentados aquí.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran tamaño; no hay evaluaciones específicas publicadas para esta cuantización.
- La cuantización a ~4,6 bits/peso puede degradar ligeramente la calidad respecto a los pesos FP8 originales, aunque el esquema oQ4e está diseñado para minimizarlo mediante sensibilidad por capa y matriz de importancia.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Requisito de hardware extremo: 330 GB de pesos lo hacen inviable salvo en estaciones Apple Silicon de muy alta memoria; no es utilizable en portátiles ni en la mayoría de servidores GPU estándar.
- Dependencia del ecosistema MLX/oMLX: el checkpoint no es directamente compatible con llama.cpp, vLLM u Ollama.
- Licencia MIT, sin restricciones de uso comercial relevantes.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mlx-community/Ling-3.1-flash-1019-oQ4e-mtp
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Versión anterior del modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
