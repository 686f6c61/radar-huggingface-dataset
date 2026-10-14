# Devubiodee/plutus-gpt-oss

## Resumen

plutus-gpt-oss es un ajuste fino (fine-tune) del modelo gpt-oss-20b de OpenAI, publicado por el usuario Devubiodee en HuggingFace. El entrenamiento se ha realizado sobre la version ya cuantizada en 4 bits de Unsloth (unsloth/gpt-oss-20b-unsloth-bnb-4bit), utilizando la libreria Unsloth junto con TRL de HuggingFace para acelerar el proceso. Se trata, por tanto, de un derivado de la familia gpt-oss, no de un modelo entrenado desde cero.

La arquitectura subyacente es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 20.900 millones de parametros totales, de los cuales solo una fraccion se activa por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. El repositorio ocupa 41,9 GB y los pesos estan en formato safetensors, lo que corresponde a una precision de 16 bits.

El modelo es relevante como ejemplo de personalizacion ligera sobre gpt-oss-20b, un modelo abierto de OpenAI publicado bajo licencia Apache 2.0 y disenado para razonamiento, generacion de codigo y uso de herramientas. Al ser un fine-tune reciente, con 0 descargas y 0 likes en el momento de redactar esta ficha, carece de validacion comunitaria y de resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), heredada de gpt-oss-20b |
| Parametros totales | 20.914.757.184 (aprox. 20,9 B) |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base gpt-oss-20b activa una fraccion reducida de parametros por token) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base gpt-oss-20b soporta 128.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en safetensors a 16 bits; el modelo base se entreno desde una version bnb-4bit (NF4). Conversion a GGUF/AWQ/GPTQ no confirmada en el repositorio |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de gpt-oss-20b, un transformer con capas de Mixture of Experts en el que cada token activa solo un subconjunto de expertos, lo que permite mantener un coste de computo por token muy inferior al de un modelo denso de 20.900 millones de parametros. No se dispone de la configuracion exacta de expertos (numero total y expertos activos) en la informacion facilitada, aunque el modelo base de OpenAI se caracteriza por un diseno MoE optimizado para inferencia en hardware de gama alta de consumo.

El entrenamiento de este derivado se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de una version del modelo base ya cuantizada en 4 bits (unsloth/gpt-oss-20b-unsloth-bnb-4bit). La model card no detalla el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se especifica el objetivo concreto del ajuste fino mas alla de tratarse de un modelo conversacional orientado a generacion de texto. El autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, sin aportar mediciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la model card y el pipeline declarado (text-generation).
- Razonamiento y resolucion de problemas: capacidades heredadas del modelo base gpt-oss-20b, aunque no se validan de forma especifica en este fine-tune.
- Generacion de codigo y matematicas: presumiblemente heredadas del modelo base; no confirmadas para este derivado.
- Soporte de tool calling y function calling: el modelo base gpt-oss incorpora un formato de respuesta (Harmony) con soporte de funciones, pero la model card de este fine-tune no lo confirma explicitamente.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio especificos de este fine-tune.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno aprovechando el contexto largo heredado del modelo base, adecuado para prototipos de chatbot siempre que se valide su calidad tras el ajuste.
- Experimentacion academica con MoE: util para estudiar el comportamiento de arquitecturas Mixture of Experts y comparar el efecto de un fine-tune ligero sobre un modelo ya cuantizado.
- Generacion de codigo asistida: si conserva las capacidades del modelo base, podria integrarse en editores o pipelines de CI/CD para sugerencias de codigo, aunque requiere validacion previa.
- Prototipado rapido de aplicaciones de generacion de texto: al estar en safetensors y ser compatible con transformers, permite integraciones directas con HuggingFace Transformers.
- Investigacion sobre cuantizacion y fine-tuning: sirve como caso de estudio del flujo Unsloth + TRL sobre un modelo base cuantizado en 4 bits.
- Base para nuevos ajustes: puede emplearse como punto de partida para fine-tunes adicionales en dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del fine-tune no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan comparaciones con el modelo base. Para los valores del modelo original gpt-oss-20b habria que consultar la documentacion oficial de OpenAI y de Unsloth.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (safetensors publicados): en torno a 42 GB de pesos, por lo que requiere GPU de 80 GB (A100, H100) o segmentacion en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 22-24 GB, viable en una RTX 4090 de 24 GB al limite.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 12-14 GB, compatible con RTX 4090, RTX 3090, y GPUs de 16 GB.
- GPU recomendadas: A100 80 GB o H100 para precision completa; RTX 4090, RTX 3090 o L40S para cuantizaciones de 8 y 4 bits.
- Uso en GPU de consumo: si, en cuantizaciones de 4 bits en GPUs de 16-24 GB; en 16 bits no cabe en hardware de consumo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama son plausibles si se generan cuantizaciones GGUF, aunque no se confirman en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| plutus-gpt-oss (este modelo) | 20,9 B (MoE) | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| gpt-oss-20b (OpenAI) | ~21 B (MoE) | 128.000 tokens | apache-2.0 | HuggingFace y despliegues oficiales |
| gpt-oss-120b (OpenAI) | ~117 B (MoE) | 128.000 tokens | apache-2.0 | HuggingFace y despliegues oficiales |
| Qwen3-30B-A3B | 30 B (MoE, ~3 B activos) | 128.000 tokens | apache-2.0 | HuggingFace |

La comparacion con modelos de la misma categoria (MoE de rango 20-30 B) muestra que plutus-gpt-oss es un derivado de gpt-oss-20b sin datos publicos de rendimiento, por lo que no es posible establecer una comparacion cuantitativa fiable. Los valores de contexto y benchmarks de los modelos comparados provienen de sus respectivas documentaciones oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados para este fine-tune; hereda los sesgos del modelo base gpt-oss-20b y de los datos de ajuste, no especificados.
- Riesgo de alucinacion: presente, como en cualquier modelo de lenguaje; no se aportan evaluaciones de fiabilidad.
- Limitaciones de idioma: el modelo declara unicamente soporte de ingles (en), lo que limita su uso en castellano u otros idiomas.
- Limitacion de contexto: no se especifica la ventana de contexto efectiva tras el ajuste; podria diferir de la del modelo base.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero el autor no aporta garantias ni documentacion adicional.
- Falta de validacion: 0 descargas y 0 likes, sin benchmarks ni evaluaciones independientes; no se recomienda su uso en produccion sin una evaluacion propia.
- Trazabilidad del entrenamiento: no se detallan dataset, hiperparametros ni metodologia de ajuste, lo que dificulta reproducir o auditar el modelo.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-14, dato poco habitual que conviene verificar.

## Enlaces

- HuggingFace: https://huggingface.co/Devubiodee/plutus-gpt-oss
- Modelo base (Unsloth): https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
