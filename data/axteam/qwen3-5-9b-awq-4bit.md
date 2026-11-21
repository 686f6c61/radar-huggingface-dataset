# axteam/Qwen3.5-9B-AWQ-4bit

## Resumen

Qwen3.5-9B-AWQ-4bit es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario axteam. Se trata de una cuantizacion de posentrenamiento (PTQ) mediante el algoritmo AWQ en esquema W4A16 (pesos INT4 asimetricos con grupo de tamano 32, activaciones en BF16), empaquetada en formato compressed-tensors y orientada especificamente al servicio de inferencia con vLLM. El modelo base lo desarrolla el equipo Qwen (Alibaba) y mantiene la licencia Apache-2.0.

El modelo resuelve el problema del coste de despliegue del modelo original en BF16: reduce el peso en disco a unos 9,5 GB y permite servir un modelo de 9.409.813.744 parametros con arquitectura hibrida (atencion lineal combinada con atencion completa), caracter multimodal con torre de vision y cabeza de prediccion multi-token (MTP), en GPUs de consumo o en nodos de inferencia con VRAM limitada. Es relevante ahora porque preserva aproximadamente el 99,1 % del rendimiento medio del original en los benchmarks medidos, con una degradacion de perplejidad del 6,2 % y una tasa de acuerdo top-1 del 90,9 % frente al BF16.

La ficha se basa exclusivamente en la informacion publicada en la model card del repositorio de Hugging Face. Los datos de arquitectura interna del modelo base, composicion del dataset de entrenamiento y detalles del proceso de alineamiento no estan documentados en la informacion proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), densa, multimodal (vision), con cabeza MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (W4A16), grupo de tamano 32, asimetrica; pesos INT4 con escala BF16 y punto cero INT4; activaciones BF16 |
| Idiomas soportados | no disponible (la calibracion uso un corpus mixto con predominio de coreano; los benchmarks incluyen tareas en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura transformer hibrida que combina capas de atencion lineal con capas de atencion completa, en configuracion densa (sin mezcla de expertos). Incorpora componentes multimodales: una torre de vision y un proyector (`model.visual.*`), ademas de una cabeza de prediccion multi-token (`mtp.*`). La cuantizacion AWQ actua unicamente sobre los pesos lineales, dejando en BF16 la torre de vision, el proyector, la cabeza MTP, todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del modulo de atencion lineal (`linear_attn.conv1d`, `A_log`, `dt_bias`). Aproximadamente el 28 % de los parametros permanece sin cuantizar.

El proceso de cuantizacion es PTQ sin reentrenamiento: AWQ utiliza un conjunto de calibracion de 256 muestras (corpus mixto con predominio de coreano) y protege los canales de pesos mas relevantes antes del redondeo, sin calcular gradientes. La revision del 1 de noviembre de 2026 restauro de forma exacta los pesos RMSNorm no suavizados desde el original, eliminando el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que habia introducido el manejo de offset-norm de llm-compressor. El tokenizador, la `chat_template` y las configuraciones del preprocesador son identicas a las del original; el `config.json` es el del modelo base mas un bloque `quantization_config`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat heredada del modelo original.
- Razonamiento y resolucion de problemas matematicos: obtiene 86,81 en GSM8K (5-shot, strict) en la evaluacion medida.
- Comprension lectora y conocimiento general: evaluado en MMLU, ARC-Challenge y Winogrande.
- Capacidades multimodales de imagen a texto (`image-text-to-text`): la torre de vision y el proyector se conservan en BF16, por lo que la entrada de imagenes se mantiene operativa.
- Prediccion multi-token mediante la cabeza MTP, conservada en BF16.
- Capacidades multilingues: los benchmarks incluyen KMMLU y HAE-RAE (coreano), ademas de tareas en ingles; el conjunto exacto de idiomas soportados no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el checkpoint esta empaquetado en compressed-tensors y probado con vLLM 0.32.0, por lo que puede desplegarse directamente como endpoint compatible con la API de OpenAI para tareas de imagen a texto y texto a texto con un peso en disco de unos 9,5 GB.
- Asistente conversacional multi-turno: la plantilla de chat y el tokenizador son identicos a los del original, lo que permite reutilizar los mismos pipelines conversacionales sin reajustes, con una fidelidad top-1 del 90,9 % respecto al BF16.
- Razonamiento matematico asistido: con 86,81 en GSM8K (99,7 % de recuperacion frente al original), es adecuado para tutoria, verificacion de calculos y generacion de explicaciones paso a paso en entornos educativos o de analitica.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, puede procesar capturas, diagramas o formularios y generar descripciones o extraer informacion en texto dentro de un pipeline de digitalizacion.
- Evaluacion de modelos y experimentacion en investigacion: al mantener el 99,1 % del rendimiento medio del original con un 6,2 % de incremento de perplejidad, sirve como sustituto economico del BF16 en barridos de hiperparametros, ablaciones y pruebas de prompts donde el coste por inferencia es limitante.
- Despliegue en GPUs de consumo para prototipado: con pesos INT4 y activaciones BF16, el modelo cabe en GPUs consumer de gama alta con 16-24 GB de VRAM, lo que permite desarrollar y validar aplicaciones multimodales en estaciones de trabajo locales antes de escalar a produccion.
- Inferencia en nodos con requisitos de CUDA modernos: requiere NVIDIA Turing (sm75) o superior y un driver con soporte de CUDA 13, lo que encaja en clusters actualizados con A100, H100 o L40S.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 33,03 | 46,82 (141,8 %) | 32,37 (98,0 %) | 32,15 (97,3 %) | 35,06 (106,1 %) | 33,29 (100,8 %) |
| GSM8K (5-shot, strict) | 87,11 | 86,81 (99,7 %) | 86,96 (99,8 %) | 84,38 (96,9 %) | 84,23 (96,7 %) | 86,81 (99,7 %) |
| ARC-Challenge (0-shot) | 55,55 | 55,72 (100,3 %) | 55,89 (100,6 %) | 54,44 (98,0 %) | 54,01 (97,2 %) | 56,48 (101,7 %) |
| Winogrande (5-shot) | 73,72 | 74,19 (100,6 %) | 74,51 (101,1 %) | 73,01 (99,0 %) | 73,16 (99,3 %) | 73,40 (99,6 %) |
| KMMLU (5-shot, direct) | 58,39 | 58,05 (99,4 %) | 58,51 (100,2 %) | 58,26 (99,8 %) | 57,41 (98,3 %) | 56,96 (97,6 %) |
| HAE-RAE (0-shot) | 69,48 | 69,11 (99,5 %) | 69,39 (99,9 %) | 70,21 (101,1 %) | 68,47 (98,5 %) | 67,09 (96,6 %) |
| Media | 62,88 | 65,12 (103,6 %) | 62,94 (100,1 %) | 62,07 (98,7 %) | 62,06 (98,7 %) | 62,34 (99,1 %) |
| Media sin MMLU | 68,85 | 68,78 (99,9 %) | 69,05 (100,3 %) | 68,06 (98,9 %) | 67,46 (98,0 %) | 68,15 (99,0 %) |

Evaluacion de fidelidad respecto al original BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,5403 | 1,4506 (+6,2 %) |
| Acuerdo top-1 en el siguiente token | 90,9 % | 99,2 % |

Nota del autor sobre MMLU: la puntuacion oscila ampliamente entre builds del mismo modelo (32,2-46,8) y solo FP8-dynamic supera claramente al BF16, lo que probablemente refleja el formato de respuesta de cada build mas que la calidad de la cuantizacion; no se verifico respuesta por respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 9,5 GB en disco (18,5 GB de repositorio, incluyendo artefactos); con pesos INT4 y activaciones BF16, el consumo en VRAM se situa por encima del peso de los pesos, sin cifra oficial publicada. Como referencia practica, se necesita una GPU con al menos 12-16 GB de VRAM para el modelo completo con cache KV moderada, y 24 GB para contextos largos o lotes mayores.
- GPU recomendadas: NVIDIA Turing (sm75) o superior, incluyendo RTX 4090, L40S, A100 y H100. V100 (sm70) no esta soportado.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM (por ejemplo RTX 4080, RTX 4090) para inferencia con cuantizacion INT4 y contextos moderados.
- Opciones de despliegue: vLLM es el runtime objetivo y el unico probado por el autor (version 0.32.0; la arquitectura esta integrada desde vLLM 0.17.0). El formato compressed-tensors `pack-quantized` esta pensado para vLLM; no se documenta soporte para llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Dependencias de software: Python 3.11-3.14, torch 2.13 con build CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que 0.17.0 lee este checkpoint guardado con 0.19.0).
- Latencia y throughput: no disponibles en la informacion proporcionada. El esquema W4A16 no requiere tensor cores especiales, solo kernels INT de pesos.

## Comparativa con modelos similares

Comparacion con otras builds de cuantizacion del mismo modelo base, segun los datos medidos por el autor:

| Modelo | Parametros | Contexto | Media de benchmarks | Media sin MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B BF16 (original) | 9,41 B | no disponible | 62,88 | 68,85 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B FP8-dynamic | 9,41 B | no disponible | 65,12 (103,6 %) | 68,78 (99,9 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B AWQ-8bit | 9,41 B | no disponible | 62,94 (100,1 %) | 69,05 (100,3 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B NVFP4 | 9,41 B | no disponible | 62,06 (98,7 %) | 67,46 (98,0 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B-AWQ-4bit (este repo) | 9,41 B | no disponible | 62,34 (99,1 %) | 68,15 (99,0 %) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones de contexto para comparar con modelos de otros desarrolladores de la misma categoria.

## Limitaciones y advertencias

- Perdida de fidelidad respecto al original: perplejidad un 6,2 % superior y acuerdo top-1 del 90,9 % frente al 99,2 % del BF16; en tareas sensibles a pequenas variaciones de probabilidad puede haber divergencias.
- MMLU inestable: la puntuacion generativa oscila entre 32,2 y 46,8 entre builds, lo que hace que este benchmark no sea fiable para comparar calidades de cuantizacion; el autor recomienda usar la media sin MMLU.
- Calibracion sesgada: el conjunto de calibracion AWQ tiene predominio de coreano, lo que puede afectar de forma desigual a la calidad en otros idiomas, incluido el espanol.
- Idiomas soportados no documentados: la model card no enumera los idiomas del modelo base; la evaluacion se limita a ingles y coreano.
- Longitud de contexto no disponible: no se publica la ventana de contexto del modelo base ni su comportamiento tras la cuantizacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B; conviene revisar el LICENSE del repositorio original.
- Requisitos de software estrictos: depende de vLLM 0.32.0, torch 2.13 con CUDA 13 y versiones fijadas de transformers y compressed-tensors; mezclar versiones puede romper la carga del checkpoint.
- Hardware no soportado: V100 (sm70) queda fuera; se requiere Turing o superior y un driver con CUDA 13.
- Riesgo de alucinacion: no se documenta ningun ajuste especifico de alineamiento o mitigacion en esta build; al ser PTQ sin reentrenamiento, hereda los sesgos y riesgos del modelo base, que no estan detallados en la informacion disponible.
- Repositorio con baja adopcion: 725 descargas y 1 like en el momento de la consulta, lo que limita la validacion comunitaria independiente de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- llm-compressor: https://github.com/vllm-project/llm-compressor
