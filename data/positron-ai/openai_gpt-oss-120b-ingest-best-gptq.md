# positron-ai/openai_gpt-oss-120b-ingest-best-gptq

## Resumen

`positron-ai/openai_gpt-oss-120b-ingest-best-gptq` es una compilacion cuantizada en GPTQ de 4 bits del modelo `openai/gpt-oss-120b` de OpenAI, publicada por Positron AI. El artefacto esta pensado especificamente para el runtime propietario "tron" de Positron, orientado a servir inferencia sobre hardware FPGA, y no como sustituto general del modelo original en GPUs convencionales. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 116.829.156.672 parametros totales segun los pesos en safetensors.

La relevancia de esta publicacion es acotada: se trata de un build de infraestructura, no de un modelo nuevo. Positron AI prioriza en esta version la fidelidad del runtime y el despliegue en FPGA por encima de la portabilidad a GPU, y la propia model card desaconseja usarlo como reemplazo directo del modelo original sin comparar antes con otros formatos cuantizados. El repositorio ocupa 64,9 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

No se publican metricas de calidad (ni divergencia KL, ni exactitud, ni perplejidad) y la validacion se mantiene interna. Cualquier evaluacion de rendimiento debe hacerse contra el modelo original de OpenAI, cuyas especificaciones completas no forman parte de la informacion disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) tipo transformer; metadatos `gpt_oss` en transformers |
| Parametros totales | 116.829.156.672 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits (pesos 4-bit, activaciones sin cuantizar), grupo 64, simetrica, `desc_act=false`, damp 0,05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria transformers |

## Arquitectura y entrenamiento

El artefacto deriva de `openai/gpt-oss-120b`, un modelo MoE segun los metadatos del repositorio (tag `gpt_oss`, campo "MoE experts per token: 64" en la model card). Esta ficha no dispone de informacion sobre el numero de capas, dimension oculta, atencion, regimen de entrenamiento, volumen de tokens, composicion del dataset ni si hubo RLHF o DPO en el modelo base. Esos datos deben consultarse en la model card oficial de OpenAI.

En cuanto al proceso de cuantizacion, se aplico GPTQ sobre pesos en bf16 con GPTQModel 5.8.0, transformers 4.57.6, torch 2.9.1 y CUDA 12.8. La calibracion uso una mezcla multidominio de 128 muestras con longitud de secuencia 1024. Las activaciones no se cuantizan. El resultado esta optimizado para el runtime "tron" de Positron sobre FPGA, no para kernels estandar de GPU.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Hereda las capacidades del modelo base `openai/gpt-oss-120b`; la informacion proporcionada no detalla cuales son (razonamiento, codigo, matematicas, tool calling, agentes, vision, modo thinking, etc.).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints declarada en los tags (`endpoints_compatible`).
- Ejecucion prevista en el runtime "tron" sobre FPGA de Positron.

## Casos de uso

- Despliegue en infraestructura FPGA de Positron: el artefacto esta construido para la ruta "ingest-serving" del runtime tron, de modo que se usaria como pesos de produccion en ese entorno concreto.
- Evaluacion comparativa de cuantizaciones: sirve como referencia GPTQ 4-bit frente a otros formatos (GGUF, AWQ, etc.) del mismo modelo base antes de decidir un despliegue.
- Pruebas de fidelidad de runtime: util para validar que el runtime tron reproduce el comportamiento del modelo en bf16 con pesos de 4 bits.
- Prototipado de pipelines de generacion de texto en transformers, ya que el repositorio es cargable con la libreria estandar y el tag `gpt_oss`.
- Investigacion sobre cuantizacion MoE: el ajuste con 64 expertos por token y grupo 64 permite estudiar el impacto de GPTQ en modelos con enrutamiento disperso.
- Base para ajuste fino o destilacion sobre un checkpoint ya cuantizado en entornos con presupuesto de memoria reducido (sujeto a las limitaciones del formato GPTQ).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reporta metricas de rendimiento ni de calidad (sin KL-divergence, exactitud ni perplejidad) y que la validacion se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 64,9 GB en GPTQ 4-bit, lo que da una cota inferior aproximada para cargar los pesos; el consumo real depende del runtime y de los buffers de activacion.
- Hardware objetivo declarado: FPGA mediante el runtime "tron" de Positron.
- GPU recomendadas: no disponibles. La model card advierte que el build prioriza la FPGA sobre la portabilidad a GPU y recomienda comparar con el modelo original y otros formatos antes de desplegar en GPU.
- Compatibilidad con GPU de consumo: no confirmada; no se garantiza que los kernels GPTQ estandar funcionen con esta configuracion.
- Opciones de despliegue: transformers (libreria declarada) y runtime tron; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/openai_gpt-oss-120b-ingest-best-gptq | 116.829.156.672 | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face, orientado a FPGA |
| openai/gpt-oss-120b (original) | 120B (nominal) | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de gpt-oss-120b | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El artefacto esta optimizado para el runtime tron sobre FPGA; su uso en GPU convencional puede no ofrecer el rendimiento esperado y debe validarse antes.
- No se publican metricas de calidad: no hay evidencia publica de la degradacion introducida por la cuantizacion GPTQ 4-bit en este modelo.
- Las activaciones no estan cuantizadas, por lo que el ahorro de memoria se limita a los pesos.
- Sesgos, riesgo de alucinacion y limitaciones idiomaticas dependen del modelo base y no se detallan en la informacion proporcionada.
- La licencia Apache 2.0 se hereda del modelo base; las restricciones de uso del modelo original siguen aplicandose.
- La validacion es interna de Positron AI, sin reproducibilidad publica documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/openai_gpt-oss-120b-ingest-best-gptq
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
