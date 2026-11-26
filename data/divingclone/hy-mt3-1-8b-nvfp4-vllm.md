# divingclone/Hy-MT3-1.8B-NVFP4-vLLM

## Resumen

Hy-MT3-1.8B-NVFP4-vLLM es una cuantización de 4 bits en formato NVFP4 (W4A4) del modelo de traducción Tencent Hy-MT3-1.8B, publicada por el usuario independiente divingclone como parte del proyecto Translocal. El checkpoint está empaquetado con compressed-tensors en safetensors y pensado para ejecutarse en vLLM, concretamente en el runtime comunitario SystemPanic/vllm-windows con un plugin nativo para la arquitectura Hunyuan. No es una versión oficial de Tencent, sino una conversión calibrada de los pesos originales.

El modelo resuelve el problema de desplegar un traductor neuronal de 1.800 millones de parámetros en GPUs de consumo con memoria limitada, reduciendo el peso del checkpoint a unos 1,4 GB. Está orientado a perfiles de altas prestaciones (RTX 50, CUTLASS) y mantiene los pesos de embedding y cabeza de salida en BF16, mientras que la caché KV se configura en INT8 por token y cabeza como ajuste de runtime.

Es relevante porque demuestra la viabilidad de cuantizaciones NVFP4 calibradas para tareas de traducción con fidelidad medida frente al modelo BF16 original, y porque documenta de forma explícita procedencia, hashes y metodología de calibración, algo poco habitual en checkpoints cuantizados de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso, familia Hunyuan) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con calibración; embedding y output head en BF16; KV cache INT8 por token/cabeza (ajuste de runtime) |
| Idiomas soportados | no disponible (calibración con OPUS-100 en/zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), no GGUF |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base tencent/Hy-MT3-1.8B en la revisión `79e9c301609d6a4009fbb110922dca379dfe1e9a`. La arquitectura es un transformer denso de la familia Hunyuan (tipo `hunyuan_v1_dense`) con 1.791 millones de parámetros, especializado en traducción automática. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset original en la información proporcionada.

La innovación de esta publicación es la cuantización: se aplicó NVFP4 (4 bits en pesos y activaciones) con calibración sobre 256 ejemplos de traducción en/zh de OPUS-100, disjuntos de los 256 ejemplos usados para evaluación. El proceso registra versiones de cuantización, hashes de calibración y hashes de pesos de entrada/salida en `quantization.json`, y los hashes de ficheros en `checksums.json`. Los pesos de embedding y cabeza de salida se mantienen en BF16 para preservar fidelidad.

## Capacidades

- Traducción automática (pipeline `translation`), con calibración y evaluación centradas en el par inglés-chino.
- Generación de texto condicionada por plantilla de chat incluida en el repositorio.
- Inferencia de alta eficiencia en vLLM mediante kernels CUTLASS para NVFP4.
- Compatibilidad con caché KV en INT8 como ajuste de runtime.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Traducción por lotes en/zh en estaciones de trabajo con RTX 50: el checkpoint de 1,4 GB permite cargar el modelo completo en VRAM y procesar grandes volúmenes de pares de frases con vLLM y kernels CUTLASS.
- Servicio de traducción de baja latencia en producción: al ocupar poco espacio en memoria, deja margen para caché KV INT8 y mayor concurrencia por GPU.
- Integración en pipelines de localización de software: el modelo puede traducir cadenas y documentación de forma automatizada, con la plantilla de chat incluida para formatear entradas.
- Prototipado de sistemas de traducción en Windows nativo: el runtime validado (SystemPanic/vllm-windows 0.32.0) permite desplegar sin contenedores Linux.
- Evaluación comparativa de cuantizaciones: al existir una variante GPTQ INT4 W4A16 del mismo autor, permite medir compromisos de fidelidad frente a compatibilidad de hardware.
- Investigación en cuantización NVFP4: el repositorio documenta calibración, hashes y métricas de similitud con el profesor BF16, útil como referencia reproducible.
- Traducción asistida en entornos con GPUs de gama alta de consumo: al caber en una sola GPU, se puede ejecutar localmente sin infraestructura de servidor.

## Benchmarks y rendimiento

| Metrica | NVFP4 / INT8 KV | INT4 / INT8 KV |
|---|---|---|
| chrF++ frente a salida BF16 greedy (256 ejemplos OPUS-100 en/zh) | 80,88 | 85,89 |

Estas cifras son puntuaciones de similitud con la salida del profesor BF16, no porcentajes de calidad de traducción retenida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4: 1.373.024.141 bytes (aproximadamente 1,4 GB), lo que permite cargarlo en GPUs de consumo con holgura.
- Perfil validado: RTX 5090 con runtime SystemPanic/vllm-windows 0.32.0, PyTorch 2.11.0+cu130 y plugin nativo Hunyuan de Translocal.
- Compatibilidad RTX 30/40: según el autor, depende del soporte de arquitectura de runtime y kernels; el perfil recomendado para esas GPUs es la variante GPTQ INT4 W4A16 con Marlin.
- Despliegue: vLLM (runtime comunitario para Windows); no se mencionan llama.cpp, Ollama ni TGI, y el formato no es GGUF.
- VRAM estimada, latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divingclone/Hy-MT3-1.8B-NVFP4-vLLM | 1.791.080.448 | no disponible | NVFP4 W4A4, KV INT8 | apache-2.0 | Hugging Face, 0 descargas |
| divingclone/Hy-MT3-1.8B-INT4-vLLM | no disponible (mismo base) | no disponible | GPTQ INT4 W4A16, grupo 128, Marlin | apache-2.0 | Hugging Face |
| tencent/Hy-MT3-1.8B (base) | 1.791.080.448 | no disponible | BF16 | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Es una cuantización no oficial: no procede de Tencent y puede diferir del comportamiento del modelo base.
- La fidelidad medida (chrF++ 80,88 frente al profesor BF16) es una métrica de similitud, no una garantía de calidad de traducción; pueden existir traducciones válidas distintas.
- La calibración se realizó únicamente con ejemplos en/zh de OPUS-100; el comportamiento en otros pares de idiomas no está documentado.
- Los idiomas soportados no están declarados en la información disponible.
- El runtime validado es un proyecto comunitario para Windows (SystemPanic/vllm-windows), no una distribución oficial de vLLM; la compatibilidad con otras plataformas no está confirmada.
- El formato es compressed-tensors safetensors, no GGUF, por lo que no es directamente utilizable en llama.cpp u Ollama.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 heredada del modelo base, con fichero LICENSE incluido; el autor documenta los cambios en MODEL_CHANGES.md.

## Enlaces

- Hugging Face (checkpoint NVFP4): https://huggingface.co/divingclone/Hy-MT3-1.8B-NVFP4-vLLM
- Hugging Face (variante GPTQ INT4): https://huggingface.co/divingclone/Hy-MT3-1.8B-INT4-vLLM
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Repositorio del proyecto Translocal: https://github.com/divingclone/Translocal
- Runtime vLLM para Windows: https://github.com/SystemPanic/vllm-windows
