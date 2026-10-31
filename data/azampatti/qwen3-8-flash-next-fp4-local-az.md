# azampatti/Qwen3.8-Flash-Next-FP4-Local-AZ

## Resumen

Qwen3.8-Flash-Next-FP4-Local-AZ es una variante comunitaria del checkpoint cuantizado en FP4 que NVIDIA publicó como `nvidia/Qwen3.8-Flash-Next-FP4-Local`, un modelo multimodal (imagen-texto a texto) de arquitectura MoE con 96.727.459.805 parámetros totales según los safetensors del repositorio. El autor, azampatti, ha modificado el checkpoint original sin reentrenar el conjunto del modelo: reduce el número de expertos enrutados por token de 10 a 5 y sustituye el experto compartido por una versión "curada" (healed) de 1280 de anchura, entrenada previamente mediante auto-distilación KL sobre el modelo INT4 del mismo autor.

La motivación del cambio es reducir el coste computacional del enrutamiento por token (la mitad de expertos activos) sin perder capacidad, compensando la pérdida con un experto compartido más ancho. Según las mediciones del propio autor sobre un DGX Spark (GB10) con una ventana de 262.144 tokens, la variante de 5 expertos obtiene una puntuación media de 51,7 frente a 49,4 del original, aunque las cifras provienen de motores distintos y deben leerse con cautela.

El checkpoint ocupa unos 102,5 GB, mantiene el formato ModelOpt `MIXED_PRECISION` de NVIDIA (expertos enrutados en NVFP4, atención y experto compartido en MXFP8, cabeza en bf16) y es directamente servible con vLLM. Es relevante como ejemplo de reingeniería de MoE cuantizadas para hardware local de gama alta, en particular la DGX Spark con GPU GB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal, image-text-to-text, con capa MTP (multi-token prediction) |
| Parametros totales | 96.727.459.805 (96,7 B, segun safetensors) |
| Parametros activos | 5 expertos enrutados por token + experto compartido de 1280 de anchura (el original usa 10 expertos por token); numero exacto de parametros activos no disponible |
| Longitud de contexto | 262.144 tokens (ventana usada en las pruebas del autor, sin YaRN); maximo oficial no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, group-16 con escalas CSF), MXFP8 (atencion y experto compartido, group-32, e4m3 con escala por 32 pesos), bf16 (cabeza lm_head, gate del experto compartido, tabla n-gram en FP8/NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors (checkpoint ModelOpt MIXED_PRECISION), 21 shards, ~102,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal (familia Qwen3.8 "Flash Next") cuantizado por NVIDIA mediante destilacion consciente de cuantizacion (quantization-aware distillation) a formato NVFP4/MXFP8 con la herramienta ModelOpt. Incluye una torre de vision, una capa MTP para prediccion multi-token (utilizable como borrador en decodificacion especulativa) y una tabla n-gram en FP8/NVFP4.

La variante de azampatti no supone reentrenamiento del modelo completo: se reduce el enrutamiento de 10 a 5 expertos por token y se compensa con un experto compartido ensanchado de 640 a 1280 neuronas. Ese experto compartido procede del checkpoint `azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound`, donde fue entrenado (unicamente el experto compartido y su gate) con auto-distilacion KL contra el mismo modelo enrutando 10 expertos. El master BF16 resultante (V8, epoca 2, paso 1675) se cuantiza aqui directamente a MXFP8, con un error del 2,66 % frente al master. La capa MTP conserva los pesos de NVIDIA: su experto compartido de 640 se rellena con ceros hasta 1280, de modo que su salida es identica bit a bit a la del original. Solo difieren del checkpoint de NVIDIA el shard `model-00015-of-00021.safetensors` y el `config.json`.

## Capacidades

- Generacion de texto conversacional (pipeline image-text-to-text, con entrada de imagen y texto).
- Comprension multimodal imagen-texto gracias a la torre de vision heredada del checkpoint de NVIDIA.
- Razonamiento y matematicas: no hay datos publicos especificos; el autor reporta una metrica agregada de "capability" (51,7 en su harness propio).
- Decodificacion especulativa mediante la capa MTP incluida; el autor documenta como configurar el borrador a 10 expertos mientras el tronco enruta 5.
- Tabla n-gram integrada (FP8/NVFP4), presumiblemente para aceleracion de decodificacion tipo n-gram/speculative.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Optimizado para ejecucion local en DGX Spark (GB10) con vLLM.

## Casos de uso

- Ejecucion local en DGX Spark (GB10): el checkpoint esta diseñado y probado explicitamente sobre este hardware, con ventana de 262.144 tokens y ~102 GB de pesos, ideal para quien necesita un modelo grande sin nube.
- Inferencia multimodal de coste reducido: al enrutar solo 5 expertos por token, el coste por token generado disminuye frente al checkpoint original, util en despliegues con presupuesto de compute ajustado.
- Chatbot multimodal con contexto largo: la ventana de 262.144 tokens permite conversaciones con documentos extensos o multiples imagenes en contexto.
- Experimentacion sobre arquitecturas MoE: el repositorio documenta con detalle como modificar el ancho de enrutamiento y del experto compartido sin reentrenar todo el modelo, util como referencia para investigadores.
- Decodificacion especulativa personalizada: la capa MTP puede configurarse para borrar a 10 expertos mientras el modelo principal enruta 5, combinando calidad de borrador y ahorro en el tronco.
- Servido con vLLM en produccion local: el formato ModelOpt es identico al de NVIDIA, por lo que cualquier despliegue vLLM existente del checkpoint original sirve este sin cambios de infraestructura.
- Analisis de documentos e imagenes en local: el pipeline image-text-to-text permite describir, resumir o responder preguntas sobre imagenes sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No existen benchmarks estandar publicados (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. El unico dato disponible es la medicion del propio autor:

| Checkpoint | Capability (media recortada, 6 ejecuciones, harness propio, DGX Spark GB10, ventana 262.144) |
|---|---|
| NVIDIA FP4-Local (10 expertos, TensorFold v1.1.4) | 49,4 |
| Este checkpoint (5 expertos, vLLM, receta myllmbox v5.3.1) | 51,7 |

Advertencia del propio autor: las dos cifras provienen de motores distintos (TensorFold es determinista a temperatura 0; vLLM no necesariamente), por lo que la comparacion debe leerse como "recortar a 5 expertos no cuesta capacidad medible", no como una mejora demostrada. No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~102,5 GB solo de pesos; en una DGX Spark (GB10, memoria unificada 128 GB) cabe con margen limitado. En GPUs discretas se necesitarian varias unidades (por ejemplo, 2-3 GPUs de 80 GB como A100/H100, o equivalentes) considerando ademas KV cache para la ventana de 262.144 tokens.
- GPU recomendada: DGX Spark con GB10 (caso de uso explicito del repositorio); alternativamente A100 u H100 en configuracion multi-GPU.
- Consumer GPU: no cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente ni siquiera con la cuantizacion FP4 existente, dado el tamano del repo); se requieren plataformas de memoria unificada amplia o multi-GPU.
- Despliegue: vLLM (motor soportado; cualquier build que sirva el checkpoint FP4-Local de NVIDIA sirve este). TensorFold v1.1.4 no puede cargarlo todavia: su motor CUDA Flash Next esta compilado para exactamente 10 expertos y experto compartido de 640 de anchura, y rechaza esta configuracion.
- Latencia y throughput: no disponibles; el objetivo del recorte a 5 expertos es reducir el coste de enrutamiento por token, pero no hay mediciones publicas de tokens/s.

## Comparativa con modelos similares

| | Este checkpoint | nvidia/Qwen3.8-Flash-Next-FP4-Local | azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound |
|---|---|---|---|
| Parametros totales | 96,7 B | no disponible (base de este checkpoint) | ~125 B (segun el nombre) |
| Expertos por token | 5 | 10 | 5 |
| Experto compartido | 1280 (MXFP8, healed) | 640 (MXFP8) | 1280 (BF16 master, healed) |
| Cuantizacion | NVFP4 + MXFP8 (ModelOpt) | NVFP4 + MXFP8 (ModelOpt) | INT4 (AutoRound) |
| Tamano del repo | ~102,5 GB | ~102 GB (aprox., mismo layout) | no disponible |
| Motor | vLLM | TensorFold v1.1.4 y vLLM | no disponible |
| Licencia | nvidia-open-model-agreement | nvidia-open-model-agreement | no disponible |

No hay alternativas de otros fabricantes documentadas en la informacion disponible para una comparativa mas amplia.

## Limitaciones y advertencias

- Los datos de rendimiento provienen del harness propio del autor, no de benchmarks estandar; la comparacion de 51,7 frente a 49,4 usa motores distintos y no es metodologicamente rigurosa.
- El recorte de 10 a 5 expertos es una intervencion post-hoc sin reentrenamiento global: puede degradar capacidades que el test del autor no mida.
- TensorFold v1.1.4 no puede cargar este checkpoint; solo vLLM esta confirmado como motor funcional.
- Sesgos conocidos: no disponibles; hereda los del modelo base Qwen3.8 y del proceso de cuantizacion de NVIDIA.
- Riesgo de alucinacion: no disponible; propio de todo LLM generativo.
- Idiomas soportados: no documentados en el repositorio.
- Licencia nvidia-open-model-agreement: es un acuerdo propio de NVIDIA, no una licencia estandar tipo Apache/MIT; conviene revisar sus terminos antes de uso comercial.
- La capa MTP se mantiene a la configuracion original mediante relleno con ceros; si se usa el borrador a 10 expertos se requiere montar manualmente una carpeta de draft con config e indices.
- Proyecto comunitario con muy pocas descargas (64) y sin auditoria externa: verificar integridad de los shards antes de uso en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-FP4-Local-AZ
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Checkpoint INT4 con el experto compartido healed: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound
- Licencia NVIDIA: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- TensorFold (motor no compatible actualmente): https://github.com/ashhart/TensorFold
