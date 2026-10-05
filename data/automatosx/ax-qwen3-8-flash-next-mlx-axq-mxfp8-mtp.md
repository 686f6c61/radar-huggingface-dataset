# AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en formato MLX Safetensors para Apple Silicon, derivado directamente del modelo BF16 Qwen/Qwen3.8-Flash-Next. Lo publica AutomatosX dentro de su familia de productos AXQuant (AXQ), una linea de cuantizacion de precision mixta orientada a memoria unificada de chips Apple. No es un modelo entrenado desde cero: es una conversion cuantizada del modelo base, con la ruta de texto comprimida y la cabeza de prediccion multi-token (MTP) y la torre de vision preservadas en BF16.

El modelo base es de arquitectura MoE (`Qwen4ExpForConditionalGeneration`) y el autor declara 177,39 mil millones de parametros logicos. La configuracion de contexto maxima es de 262.144 tokens, aunque los limites practicos dependen de la memoria unificada disponible en el equipo. El paquete ocupa 189,21 GB de pesos Safetensors (189,24 GB de descarga completa) y esta pensado para ejecutarse con MLX-LM.

Su relevancia es doble: por un lado, permite desplegar un modelo de ~177B en hardware Apple Silicon sin recurrir a CUDA; por otro, el autor insiste en que se trata de "evidencia de desarrollo, no una release certificada". El paquete no publica resultados de calidad medidos, ni de contexto largo, ni de velocidad de kernels o de MTP, asi que la etiqueta AXQ no debe interpretarse como una afirmacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (mixture of experts, MoE); atencion hibrida GDN + QSA segun el repositorio del modelo base |
| Parametros totales | 177,39B logicos (177.392.830.611 segun Safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; limite practico dependiente de la memoria unificada |
| Tipos de cuantizacion | MXFP8 (clase de presupuesto), precision mixta AXQuant: `affine` y `bf16`; BPW medido 8,2977 en el modelo principal y 8,4092 total incluyendo MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

Desglose adicional de la cuantizacion aportado por el autor:

| Precision de pesos principales | Parametros | Proporcion |
|---|---:|---:|
| `8bit` | 176,30B | 97,95% |
| `bf16` | 3,70B | 2,05% |

- Metodos de cuantizacion: `affine`, `bf16`.
- Tamano de grupo usado en las asignaciones cuantizadas: 32.
- Sidecar MTP: 31 tensores, 2,61B parametros, 5,21 GB, BF16.
- Sidecar de vision: no incluido; los pesos de vision quedan protegidos en BF16 dentro de los shards principales.
- Ambito de optimizacion: `text-path`.
- Nivel de soporte: `convertible`.

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia `qwen4-exp`, identificado por el autor como `Qwen4ExpForConditionalGeneration`. Segun el repositorio oficial de Qwen3.8-Flash-Next, la evolucion respecto a versiones anteriores se articula en cuatro ejes (atencion, residual, embedding y optimizacion) e introduce una atencion hibrida GDN + QSA. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

Este repositorio no aporta entrenamiento propio: documenta una conversion de cuantizacion. La herramienta empleada es AXQuant 1.9.0, aplicada sobre la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540` del modelo BF16. El resultado es un checkpoint de precision mixta donde los tensores principales se cuantizan (97,95% a 8 bits, 2,05% en BF16) mientras que la cabeza MTP y la torre de vision se conservan en BF16. La innovacion funcional destacable es la presencia de MTP (multi-token prediction), que en runtimes que la soportan permite decodificacion especulativa con varios tokens por paso, aunque el autor no publica evidencia medida de aceleracion.

## Capacidades

- Generacion de texto y conversacion: pipeline declarado `text-generation`, etiquetas `conversational` y `text-generation`.
- Vision: la etiqueta `vision` esta presente y la torre de vision se mantiene en BF16 dentro de los shards principales, aunque no se incluye sidecar de vision separado.
- Prediccion multi-token (MTP): la cabeza MTP esta presente y empaquetada en `mtp.safetensors`, consumible por runtimes que la soportan (oMLX, MTPLX).
- Razonamiento: no documentado explicitamente en la informacion disponible.
- Codigo y matematicas: no documentado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado).
- Audio: no soportado (campo `Audio present: False`).

## Casos de uso

- Inferencia local de un modelo de ~177B en Apple Silicon: gracias al formato MLX Safetensors y a los 8,4 BPW medidos, es posible ejecutar un modelo de gran escala en equipos con memoria unificada amplia, evitando depender de GPUs NVIDIA y de CUDA.
- Prototipado de cuantizacion de precision mixta: el paquete sirve para estudiar el comportamiento de AXQuant 1.9.0 sobre una arquitectura MoE, comparando el BPW planificado (9,1438) con el medido (8,2977 en el modelo principal) y evaluando el impacto de proteger ciertos tensores en BF16.
- Despliegue de asistentes conversacionales con contexto muy largo: los 262.144 tokens configurados permiten mantener conversaciones multi-turno o documentos extensos en una sola ventana, siempre que la memoria unificada lo permita.
- Experimentacion con decodificacion MTP: mediante MTPLX u oMLX se puede activar la decodificacion multi-token especulativa y medir su efecto en latencia sobre hardware Apple, dado que el autor no publica cifras de velocidad.
- Tareas multimodales de imagen y texto: la torre de vision en BF16 permite abordar entradas visuales, aunque la calidad no esta certificada por el autor ni respaldada por benchmarks publicados.
- Evaluacion comparativa de formatos de cuantizacion: util para investigadores que quieran contrastar los hermanos de la familia (2bit, 4bit, 6bit, MXFP8) y determinar el punto de equilibrio entre almacenamiento y fidelidad.
- Base para pipelines de investigacion en MLX-LM: al ser compatible con `mlx_lm.generate`, se integra en flujos de evaluacion reproducibles fijando el commit del Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y advierte que la etiqueta AXQ no constituye una afirmacion de benchmark.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 189,21 GB en pesos Safetensors y 189,24 GB de descarga completa. Se necesita al menos esa cantidad de memoria unificada solo para los pesos, mas el espacio para la cache KV segun la longitud de contexto utilizada.
- Plataforma: exclusivamente Apple Silicon (formato MLX). No hay pesos PyTorch ni GGUF, por lo que no es ejecutable directamente en GPUs NVIDIA o AMD con los runtimes habituales.
- GPU recomendadas: no aplica en el sentido CUDA; el equivalente serian chips Apple con memoria unificada amplia (por ejemplo, configuraciones de M-Ultra con 192 GB, 256 GB o 512 GB). El desglose concreto por modelo no esta disponible en la informacion proporcionada.
- Cabe en consumer GPU: no. Es un modelo de ~177B en un paquete de ~189 GB, fuera del alcance de GPU de consumo con 24-48 GB.
- Opciones de despliegue: MLX-LM (ruta soportada, cubre inferencia de texto/backbone); oMLX 0.6.3rc2 o superior para importar el sidecar MTP y activar Lightning MTP; MTPLX para consumir el sidecar directamente (`mtplx quickstart --profile stable --depth 1`). El motor nativo AX Engine no esta establecido: el paquete no incluye un `model-manifest.json` validado.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad de kernels ni de MTP.

Ejemplo de ejecucion con MLX-LM:

```bash
mlx_lm.generate \
  --model AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP8-MTP \
  --prompt "Explain mixed-precision quantization in three sentences." \
  --max-tokens 128 \
  --temp 0.0
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP8-MTP | 177,39B logicos | 262.144 tokens | MLX Safetensors | apache-2.0 | BPW medido 8,4092 total; etiqueta MXFP8; incluye MTP y vision |
| AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP | no disponible | no disponible | MLX Safetensors | no disponible | Hermano con mayor precision media, cercano al presupuesto de 6 BPW |
| AX-Qwen3.8-Flash-Next-MLX-AXQ-4bit-MTP | no disponible | no disponible | MLX Safetensors | no disponible | Hermano de menor almacenamiento; consultar su BPW exacto |
| AX-Qwen3.8-Flash-Next-MLX-AXQ-2bit-MTP | no disponible | no disponible | MLX Safetensors | no disponible | Hermano de minima precision publicada |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 (formato original) | no disponible | Modelo fuente sin cuantizar, en BF16 |

El autor advierte que los nombres AXQ describen una clase de producto por presupuesto de almacenamiento, no una precision uniforme: un plan llamado `6bit` puede mantener una base de 4 bits y elevar otros tensores a 6 bits, 8 bits o BF16 para ajustarse al presupuesto, por lo que el BPW medido es el dato autoritativo. No se dispone de resultados de benchmarks comparativos entre estos hermanos.

## Limitaciones y advertencias

- El propio autor califica el paquete como evidencia de desarrollo, no como una release AXQuant certificada: no publica calidad medida, contexto largo, velocidad de kernels ni velocidad de MTP.
- No incluye `model-manifest.json` validado, por lo que la ejecucion en AX Engine no esta establecida. Los campos de AX Engine en `axquant_runtime.json` describen el contrato de compatibilidad previsto, no evidencia observada.
- Solo hay pesos MLX Safetensors. No hay PyTorch ni GGUF, lo que limita el despliegue a Apple Silicon y excluye vLLM, TGI o llama.cpp en su formato habitual.
- Stock MLX-LM no carga el sidecar `mtp.safetensors` por si solo: es necesario descargar el repositorio completo en un directorio local escribible y usar un runtime consciente de sidecars (oMLX o MTPLX) para aprovechar la MTP. El autor aclara que el comando de MLX-LM documentado no establece aceleracion MTP ni calidad vision-lenguaje.
- No se han documentado idiomas soportados, sesgos conocidos, tasas de alucinacion ni comportamiento en contexto largo mas alla del limite configurado de 262.144 tokens.
- El limite practico de contexto depende de la memoria unificada disponible, no solo de la configuracion maxima declarada.
- No hay capacidades de audio (campo `Audio present: False`).
- La licencia declarada es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen/Qwen3.8-Flash-Next antes de un despliegue en produccion.
- En despliegues reproducibles, el autor recomienda fijar el commit del Hub en lugar de depender indefinidamente de `main`.
- El paquete registra 0 descargas y 0 "likes", sin adopcion ni validacion externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP8-MTP
- Modelo base Qwen/Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP
- Hermano 2bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-2bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Repositorio de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Qwen3.8 Flash Next en un unico DGX Spark (TensorFold): https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark-TensorFold
- Informe sobre derivados MLX de Qwen3.8-Flash-Next: https://note.com/keity717/n/n4bd067f99599?hl=en
