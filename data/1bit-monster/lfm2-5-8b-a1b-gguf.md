# 1bit-MONSTER/LFM2.5-8B-A1B-GGUF

## Resumen

LFM2.5-8B-A1B-GGUF es la distribucion en formato GGUF del modelo LFM2.5-8B-A1B desarrollado por Liquid AI, un transformer hibrido con arquitectura de mezcla de expertos (MoE) que combina 8.467.856.832 parametros totales con aproximadamente 1.000 millones de parametros activos por token. El repositorio analizado es un re-host realizado por el usuario 1bit-MONSTER que empaqueta la cuantizacion Q4_K_M oficial de Liquid AI y anade mediciones de rendimiento sobre hardware AMD Strix Halo (Ryzen AI Max+ 395 con grafica integrada Radeon 8060S) para el motor de inferencia propio del autor.

El modelo resuelve el problema de ejecutar un MoE de 8B en hardware de consumo con requisitos de memoria reducidos: gracias a la cuantizacion Q4_K_M el fichero ocupa aproximadamente 5,2 GB, lo que permite su despliegue en equipos con GPU integrada de altas prestaciones o GPUs discretas de gama media. La relevancia actual radica en la popularizacion de los MoE eficientes (muchos parametros totales, pocos activos) que ofrecen calidad cercana a modelos densos mayores con coste de inferencia mucho menor.

El modelo base emplea una arquitectura hibrida que combina capas de atencion con capas de estado recurrente (SSM/hybrid), una tendencia consolidada en la familia LFM de Liquid AI. La licencia LFM Open License v1.0 permite uso no comercial e investigacion sin coste, y uso comercial para empresas con ingresos anuales inferiores a 10 millones de dolares. No se dispone de informacion publicada sobre la longitud de contexto, idiomas soportados ni datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (MoE); combinacion de atencion y capas de estado recurrente segun la familia LFM |
| Parametros totales | 8.467.856.832 |
| Parametros activos | Aproximadamente 1.000 millones (segun la designacion A1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso no comercial e investigacion libre; uso comercial permitido por debajo de 10 millones de dolares de ingresos anuales) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un transformer hibrido con mezcla de expertos. La designacion "A1B" indica que, pese a contar con 8.467 millones de parametros totales, solo se activan aproximadamente 1.000 millones por token, lo que reduce drasticamente el coste computacional de la inferencia frente a un modelo denso del mismo tamano. La familia LFM de Liquid AI se caracteriza por combinar capas de atencion clasica con capas de estado recurrente (arquitecturas hibridas tipo SSM-transformer), una eleccion de diseno orientada a mejorar la eficiencia en contextos largos y a reducir el coste de atencion cuadratico.

No se dispone de informacion publicada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones especificas de decodificacion (como decodificacion especulativa) mas alla de la propia arquitectura MoE hibrida. El repositorio analizado se limita a re-empaquetar la cuantizacion Q4_K_M oficial de Liquid AI y a anadir mediciones de rendimiento del motor 1bit sobre hardware Strix Halo; no documenta el proceso de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" en Hugging Face, lo que indica un ajuste orientado a dialogos multi-turno.
- Razonamiento y generacion de codigo: no se documentan capacidades especificas en la model card proporcionada; no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la documentacion proporcionada.
- Eficiencia de inferencia: al ser un MoE con aproximadamente 1B parametros activos, ofrece un throughput alto en hardware modesto, lo que lo hace adecuado para despliegues con requisitos de latencia estrictos.

## Casos de uso

- Asistente conversacional local en equipos de sobremesa: gracias a la cuantizacion Q4_K_M (unos 5,2 GB) y a los aproximadamente 1B parametros activos, el modelo puede ejecutarse en un PC con GPU integrada Strix Halo o una GPU discreta de gama media, ofreciendo un asistente privado sin dependencia de la nube.
- Prototipado de agentes conversacionales en investigacion: la licencia permite uso libre en investigacion, por lo que es adecuado para experimentar con pipelines de dialogo multi-turno y evaluar el comportamiento de arquitecturas MoE hibridas.
- Despliegue en entornos con restricciones de memoria: el fichero GGUF de 5,2 GB cabe en GPUs consumer de 8 GB o superiores, permitiendo servir el modelo en estaciones de trabajo sin aceleradores de datacenter.
- Generacion de texto en aplicaciones de escritorio: integrable mediante llama.cpp u Ollama en aplicaciones de escritorio que requieran generacion de texto local con baja latencia (139 tok/s de generacion medidos en Strix Halo).
- Evaluacion comparativa de motores de inferencia: el repositorio incluye mediciones reproducibles con `llama-bench`, lo que lo convierte en un banco de pruebas util para comparar backends (llama.cpp, Vulkan, HRX) sobre el mismo modelo.
- Fine-tuning o experimentacion con modelos MoE pequenos: al ser un modelo de 8B totales con 1B activos, sirve como base para estudiar tecnicas de adaptacion (LoRA, QLoRA) en arquitecturas hibridas sin requerir grandes clusters.
- Servicio de chat en produccion para empresas por debajo del umbral de licencia: empresas con ingresos anuales inferiores a 10 millones de dolares pueden desplegar el modelo comercialmente sin coste de licencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona mediciones de rendimiento de inferencia sobre hardware AMD Strix Halo:

| Metrica | Valor | Hardware / configuracion |
|---|---|---|
| pp512 (prefill) | 4.560 ± 45 tok/s | AMD Ryzen AI Max+ 395 (Radeon 8060S), llama.cpp build 5776842df, `--device HRX0 -ngl 99` |
| tg128 (generacion) | 139 ± 1.4 tok/s | Mismo hardware y configuracion |
| pp512 (backend Vulkan, retirado) | 3.448 tok/s | Mismo hardware, medicion de 2026-09 |
| tg128 (backend Vulkan, retirado) | 166 tok/s | Mismo hardware, medicion de 2026-09 |

Las mediciones se realizaron el 2026-11-27 con `llama-bench -p 512 -n 128 -r 3` sobre una ventana compartida del equipo. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB para la cuantizacion Q4_K_M (tamano del repositorio); se recomienda al menos 6-8 GB de memoria de GPU para dejar margen para el contexto y el runtime.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (medido), GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, etc.), y GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp aunque con menor throughput.
- Opciones de despliegue: llama.cpp (ruta GGUF estandar), motor 1bit (`1bit serve -m ... --device hrx`), Ollama y otros runners compatibles con GGUF; el repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: 139 tok/s de generacion y 4.560 tok/s de prefill medidos en Strix Halo con el motor 1bit; en GPUs discretas de gama alta se espera un throughput superior, aunque no se proporcionan mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, idiomas) de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (este) | 8.467.856.832 | ~1.000 millones | no disponible | LFM Open License v1.0 | GGUF (Q4_K_M) |
| Alternativas de la familia LFM | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros MoE de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables concretos con datos verificables; se indica "no disponible" para evitar inferencias sin respaldo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual para este modelo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la model card, lo que impide garantizar un comportamiento adecuado en contextos largos o en castellano.
- Restricciones de licencia: la LFM Open License v1.0 limita el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dolares; por encima de ese umbral se requiere una licencia separada de Liquid AI. El uso no comercial e investigacion es libre.
- Caveats para produccion: el repositorio es un re-host de terceros (1bit-MONSTER) y no el repositorio oficial de Liquid AI; para produccion se recomienda verificar la integridad del fichero GGUF frente al original de `LiquidAI/LFM2.5-8B-A1B-GGUF`. Las mediciones de rendimiento provienen de una unica configuracion de hardware y de una ventana compartida, por lo que no deben extrapolarse sin validacion propia.
- Solo se distribuye la cuantizacion Q4_K_M; no hay variantes Q8, Q5 o Q2 en este repositorio, lo que limita el ajuste fino entre calidad y memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/LFM2.5-8B-A1B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Familia 1bit: https://huggingface.co/1bit-MONSTER#families
- Licencia LFM Open License v1.0: fichero `LICENSE` incluido en el repositorio
