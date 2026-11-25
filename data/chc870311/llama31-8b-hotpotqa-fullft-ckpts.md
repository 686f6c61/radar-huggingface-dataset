# chc870311/llama31-8b-hotpotqa-fullft-ckpts

## Resumen

`chc870311/llama31-8b-hotpotqa-fullft-ckpts` es una coleccion de checkpoints resultantes de un ajuste fino completo (full fine-tuning, no LoRA) de `meta-llama/Meta-Llama-3.1-8B-Instruct` sobre el dataset HotpotQA en configuracion *distractor*, con los ejemplos rellenados hasta aproximadamente 12.000 tokens. Lo publica el usuario `chc870311` en Hugging Face y su interes no es tanto el rendimiento final como la trazabilidad del proceso: guarda un checkpoint cada 125 pasos hasta 1.000, ademas de una ejecucion corta de 25 pasos usada como referencia.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parametros y una ventana de contexto nativa de 128.000 tokens. El entrenamiento se ha realizado en bf16 con FSDP full shard, learning rate 1e-5, batch efectivo de 32 y scheduler coseno durante 1.000 pasos. Los pesos se almacenan en float32 y deben cargarse en bfloat16 para su uso.

Es relevante para investigadores que quieran estudiar la dinamica de un full fine-tuning sobre tareas de razonamiento multi-salto con contexto largo, o como punto de partida para experimentos de recuperacion y QA sobre documentos. No es un modelo de proposito general ni un asistente listo para produccion: es un artefacto de investigacion con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino completo |
| Parametros totales | 8.030 millones (8B, heredado del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (nativa del modelo base) |
| Tipos de cuantizacion | no disponible en el repo (pesos en float32; compatible con cuantizacion posterior a 8/4 bits mediante herramientas externas) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only denso con atencion por grupos (GQA), RoPE y contexto nativo de 128.000 tokens. El ajuste fino es de parametros completos, no un adaptador, lo que explica el tamano del repositorio (289,1 GB): cada checkpoint contiene los pesos completos en float32, y hay ocho checkpoints de full fine-tuning mas uno de smoke test.

El dataset de entrenamiento es HotpotQA en configuracion *distractor*, con los ejemplos rellenados hasta unos 12.000 tokens por muestra. La configuracion reportada por el autor es: 1.000 pasos, batch efectivo 32, learning rate 1e-5, scheduler coseno, computo en bf16 y FSDP con sharding completo. Los checkpoints `fullft/checkpoint-{125..1000}` se guardan cada 125 pasos solo con pesos (sin estado del optimizador), y `smoke/checkpoint-25` corresponde a una ejecucion de 25 pasos conservada como referencia. No se documenta composicion exacta del dataset, numero total de tokens vistos ni si hubo etapas de RLHF o DPO adicionales; tampoco se mencionan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multi-salto sobre documentos: el ajuste sobre HotpotQA *distractor* entrena al modelo para localizar y combinar evidencia dispersa en contextos largos.
- Question answering extractivo y generativo sobre pasajes: la tarea objetivo es responder preguntas que requieren dos o mas saltos de razonamiento.
- Manejo de contexto largo: los ejemplos de entrenamiento se rellenan a ~12.000 tokens, dentro de la ventana nativa de 128.000 tokens del modelo base.
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct: instrucciones, codigo basico, matematicas elementales y soporte multilingue en los ocho idiomas oficiales.
- Soporte de tool calling y function calling: heredado del modelo base Instruct, aunque no se ha validado tras el ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para estos checkpoints.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre full fine-tuning: comparar la evolucion de los checkpoints 125, 250, 375... hasta 1.000 pasos permite estudiar curvas de aprendizaje, sobreajuste y degradacion de capacidades generales en un ajuste de parametros completos.
- Experimentos de QA multi-salto: usar el checkpoint final como referencia en tareas de razonamiento sobre multiples documentos, evaluando su comportamiento frente al modelo base sin ajustar.
- Analisis de olvido catastrofico: al ser un full fine-tuning sobre un unico dataset, es un caso de estudio util para medir cuanto se degradan las capacidades originales de Llama 3.1 8B Instruct.
- Baseline para tecnicas de recuperacion (RAG): el modelo ajustado sobre contextos de ~12k tokens sirve como punto de comparacion frente a pipelines RAG con modelos no ajustados.
- Reproducibilidad de recetas de entrenamiento: la configuracion publicada (FSDP, lr 1e-5, batch 32, coseno) permite replicar el experimento en otros datasets de QA.
- Estudio de eficiencia de almacenamiento: los pesos en float32 y el guardado sin estado del optimizador son un ejemplo practico de compromisos entre trazabilidad y coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 24 GB o mas para contextos moderados.
- VRAM en float32 (formato nativo del repo): unos 32 GB solo para pesos; se recomienda convertir a bf16 al cargar, como indica el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia comoda con contexto largo; RTX 4090 (24 GB) viable en bf16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior, no incluida en el repo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo documentado por el autor), vLLM, TGI y llama.cpp tras conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chc870311/llama31-8b-hotpotqa-fullft-ckpts` | 8B | 128k | Full fine-tuning sobre HotpotQA | Llama 3.1 Community | Hugging Face, 0 descargas |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | 8B | 128k | Instruct general | Llama 3.1 Community | Hugging Face, ampliamente usado |
| `meta-llama/Meta-Llama-3.1-8B` | 8B | 128k | Base sin instrucciones | Llama 3.1 Community | Hugging Face |
| Adaptadores LoRA sobre Llama 3.1 8B para QA | 8B + adaptador | 128k | LoRA (tipicamente <1 GB) | Llama 3.1 Community | Multiples repositorios comunitarios |

La diferencia principal frente a alternativas es el formato: full fine-tuning con pesos completos en float32 (289 GB de repositorio) frente a adaptadores LoRA de menos de 1 GB, con mayor coste de almacenamiento y sin ventaja documentada en rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publicada: no hay benchmarks, ni descargas, ni validacion externa; no debe asumirse calidad en produccion.
- Especializacion estrecha: el ajuste sobre HotpotQA *distractor* puede degradar capacidades generales del modelo base (olvido catastrofico), algo esperable en un full fine-tuning de 1.000 pasos sobre un unico dataset.
- Riesgo de alucinacion: inherente a los modelos de 8B y potencialmente agravado por el ajuste sobre una tarea extractiva concreta.
- Sesgos: no documentados por el autor; se heredan los del modelo base Llama 3.1, entrenado principalmente con datos en ingles.
- Idiomas: la model card no declara idiomas soportados; el ajuste se realiza sobre un dataset en ingles, lo que puede reducir el rendimiento en otros idiomas respecto al modelo base.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y requisitos de atribucion; debe revisarse antes de cualquier despliegue.
- Coste de almacenamiento: 289,1 GB por ocho checkpoints en float32; la carga requiere conversion explicita a bf16 para evitar consumo excesivo de VRAM.
- Sin pipeline declarado ni idiomas declarados en los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chc870311/llama31-8b-hotpotqa-fullft-ckpts
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
