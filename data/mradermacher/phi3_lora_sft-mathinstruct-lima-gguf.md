# mradermacher/phi3_lora_sft-mathinstruct-lima-GGUF

## Resumen

`mradermacher/phi3_lora_sft-mathinstruct-lima-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `stiucsib/phi3_lora_sft-mathinstruct-lima`, un ajuste fino mediante LoRA (entrenado con Llama Factory) sobre la base Phi-3 de Microsoft. El modelo subyacente tiene 3.821.079.648 parametros (aproximadamente 3.8B) y esta orientado a instrucciones conversacionales con enfasis en matematicas, segun se deduce del nombre del adaptador (`mathinstruct`). El autor de las cuantizaciones es mradermacher, un conocido generador de quants GGUF en Hugging Face.

La relevancia de esta ficha radica en que permite ejecutar un modelo Phi-3 ajustado en hardware de consumo mediante llama.cpp u otras herramientas compatibles con GGUF, con tamanos que van desde 1,5 GB (Q2_K) hasta 7,7 GB (f16). Al tratarse de una cuantizacion de un modelo derivado, la informacion tecnica disponible es limitada: la model card original del adaptador no esta incluida en la informacion proporcionada, y no se detallan datos de entrenamiento, licencia ni benchmarks.

Es importante senalar que este repositorio no contiene el modelo original en safetensors, sino unicamente los pesos cuantizados en GGUF generados por mradermacher a partir del modelo base. Para entender el proceso de entrenamiento y las capacidades reales del modelo, seria necesario consultar el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Phi-3 de Microsoft; detalles especificos del ajuste no disponibles) |
| Parametros totales | 3.821.079.648 (aproximadamente 3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Phi-3 (probablemente Phi-3-mini, dado el recuento de parametros de 3.8B) realizado mediante LoRA con Llama Factory, segun las etiquetas del repositorio (`llama-factory`). El adaptador se denomina `phi3_lora_sft-mathinstruct-lima`, lo que sugiere un entrenamiento de supervised fine-tuning (SFT) sobre un dataset de instrucciones matematicas (posiblemente MathInstruct) y, por el sufijo `lima`, quiza una etapa adicional de alineacion tipo LIMA (Less Is More for Alignment). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las cuantizaciones han sido generadas por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, usando conversion desde formato Hugging Face (`convert_type: hf`). Se ofrecen tanto quants estaticos (este repositorio) como quants ponderados/imatrix en el repositorio hermano `mradermacher/phi3_lora_sft-mathinstruct-lima-i1-GGUF`, que suelen ofrecer mejor calidad por tamano. No se documentan innovaciones tecnicas adicionales en la model card.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Razonamiento matematico y resolucion de problemas aritmeticos (por el ajuste sobre `mathinstruct`).
- Formato de chat conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso en Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Tutoria matematica automatizada: el ajuste sobre MathInstruct permite resolver problemas paso a paso y explicar procedimientos aritmeticos en ingles, adecuado para asistentes educativos desplegados en local.
- Prototipado rapido en hardware de consumo: con cuants Q4_K_M de 2,5 GB, se puede ejecutar en un portatil con GPU integrada o CPU para validar ideas antes de escalar a modelos mayores.
- Generacion de ejercicios y soluciones: util para crear bancos de problemas matematicos con solucion razonada, dado el enfasis del adaptador en instrucciones matematicas.
- Chatbot de soporte tecnico en ingles: al ser un modelo conversacional de 3.8B, puede gestionar dialogos multi-turno sencillos en entornos con recursos limitados.
- Evaluacion de pipelines de cuantizacion: sirve como caso de estudio para comparar calidad entre quants estaticos e imatrix (Q4_K_M vs IQ4_XS) en tareas de razonamiento.
- Despliegue en edge o entornos air-gapped: el formato GGUF y los tamanos reducidos permiten ejecucion offline con llama.cpp u Ollama en dispositivos sin conectividad.
- Fine-tuning adicional o experimentacion con LoRA: al ser un modelo pequeno derivado de Phi-3, es un punto de partida economico para experimentos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (ademas del overhead de contexto y runtime):
  - Q2_K: aproximadamente 1,5 GB.
  - Q4_K_M: aproximadamente 2,5 GB (recomendado por el autor como rapido).
  - Q6_K: aproximadamente 3,2 GB.
  - Q8_0: aproximadamente 4,2 GB.
  - f16: aproximadamente 7,7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para quants Q4; RTX 3060, RTX 4060, RTX 4090, Apple Silicon (Metal) y CPUs modernas con AVX2 son suficientes. Para f16 se recomienda una GPU con 8 GB o mas (RTX 3070/4060 Ti en adelante).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos con cuants Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints de Hugging Face segun la etiqueta del repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi3_lora_sft-mathinstruct-lima (este) | 3.8B | no disponible | no disponible | GGUF | Ajuste LoRA sobre Phi-3 con enfasis matematico; solo ingles |
| Phi-3-mini (Microsoft) | 3.8B | 4K / 128K (variantes) | MIT | safetensors, GGUF | Modelo base original; contexto y licencia conocidos |
| Qwen2.5-3B-Instruct | 3.1B | 32K | Apache 2.0 | safetensors, GGUF | Multilingue, licencia permisiva, buen rendimiento general |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingue, contexto largo, licencia con restricciones |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se declara soporte multilingue.
- No se dispone de informacion sobre la licencia del modelo base ni del adaptador, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia de `stiucsib/phi3_lora_sft-mathinstruct-lima` y de Phi-3 antes de usarlo en produccion.
- Al ser un ajuste LoRA sobre un dataset especifico (matematicas e instrucciones), puede tener un rendimiento degradado en tareas generales fuera de ese dominio.
- Riesgo de alucinacion inherente a modelos de 3.8B, especialmente en razonamiento matematico complejo y problemas de varios pasos.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir la ventana de 128K de algunas variantes de Phi-3.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento matematico; se recomienda Q4_K_M o superior para tareas que requieran precision.
- El repositorio contiene solo pesos GGUF, no el modelo original en safetensors; para reentrenamiento o inspeccion completa hay que acudir al modelo base.
- No hay benchmarks publicados que permitan validar la calidad del ajuste frente al Phi-3 original.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/phi3_lora_sft-mathinstruct-lima-GGUF
- Modelo base (adaptador LoRA): https://huggingface.co/stiucsib/phi3_lora_sft-mathinstruct-lima
- Quants imatrix del mismo modelo: https://huggingface.co/mradermacher/phi3_lora_sft-mathinstruct-lima-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#phi3_lora_sft-mathinstruct-lima-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
