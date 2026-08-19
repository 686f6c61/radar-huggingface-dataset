# malaiwah/Qwen3.8-27B-EXL3-K5K6-context

## Resumen

Este modelo es una cuantizacion EXL3 (ExLlamaV3) del checkpoint Qwen/Qwen3.8-27B, un modelo vision-language hibrido de 27.000 millones de parametros desarrollado por Qwen. La edicion "context" de malaiwah serializa la atencion en K5 en disco, lo que libera 0,85 GiB frente a las versiones K6 y amplia el contexto servible hasta 196.857 tokens verificados por generacion, manteniendo una divergencia KL media de 0,009673, un 26 % inferior a la del FP8 oficial de Qwen con un 69 % del peso residente.

El checkpoint emplea precision mixta: EXL3 K5/K6 para los MLP y la atencion, BF16 para el vision tower y las normas, y FP16 para los passthrough de GatedDeltaNet. Requiere un runtime personalizado (el fork Gilded Gnosis de vLLM) y no carga en vLLM upstream, SGLang, TensorRT-LLM, llama.cpp, transformers ni exllamav3 estandar. Es un artefacto de investigacion experimental con 0 descargas en el momento de la redaccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con GatedDeltaNet (atencion lineal) + vision tower, 64 capas |
| Parametros totales | 10.336.040.176 (segun metadatos safetensors; el modelo base declara 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 196.857 tokens verificados por generacion (196.608 servidos en GPU de 32 GB) |
| Tipos de cuantizacion | EXL3 K5/K6 precision mixta, 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer hibrido de 64 capas que combina 48 capas con atencion lineal GatedDeltaNet y 16 capas con atencion completa (self_attn), mas un vision tower de 27 bloques para procesamiento de imagenes. Incluye una cabeza MTP (multi-token prediction) para decodificacion especulativa.

Esta edicion cuantiza el checkpoint con EXL3 en precision mixta: los MLP gate_proj y up_proj en K5, down_proj y lm_head en K6, la atencion (lineal y completa) en K5 serializada en disco con calibracion, la cabeza MTP cuantizada (atencion K4, MLP K5/K6), y el vision tower, las normas y los embeddings en BF16. Los passthrough de GatedDeltaNet (in_proj_a/in_proj_b) se mantienen en FP16. La verificacion posterior a la construccion confirma que los 1.199 nombres de tensores logicos coinciden con el checkpoint upstream. El vision tower se mantiene en BF16 por una razon medida: cuantizarlo romperia la correspondencia de nombres de pesos con la arquitectura.

## Capacidades

- Procesamiento vision-language (image-text-to-text): acepta imagenes y texto como entrada.
- Contexto largo verificado por generacion: recuperacion exacta de agujas (needle test) 9/9 a 28.613, 113.345 y 196.857 tokens.
- Conversacion multi-turno (pipeline conversational).
- Decodificacion especulativa mediante cabeza MTP cuantizada.
- Fidelidad superior al FP8 oficial: divergencia KL media 0,009673 frente a 0,013126 del FP8, con un 69 % del peso residente.
- Prefill de alta velocidad: ~4.500 tok/s a 28k tokens, 3.301 tok/s a 113k y 2.588 tok/s a 196k en hardware de 32 GB.

## Casos de uso

- Analisis de documentos extensos: con 196.857 tokens de contexto verificados, puede procesar libros completos, expedientes legales o informes tecnicos de cientos de paginas en una sola pasada, recuperando informacion especifica con exactitud.
- Investigacion sobre fidelidad de cuantizacion: su divergencia KL medida (0,009673) y su comparativa controlada con FP8 y NVFP4 lo convierten en un banco de pruebas para estudiar el impacto de la cuantizacion EXL3 en arquitecturas hibridas.
- Comprension de imagenes con contexto largo: al mantener el vision tower en BF16, puede combinar analisis visual con razonamiento sobre grandes volumenes de texto asociado.
- Desarrollo de runtimes de inferencia: al requerir el fork Gilded Gnosis de vLLM, sirve como caso de validacion para implementaciones experimentales de EXL3 en motores de produccion.
- Generacion de texto con decodificacion especulativa: la cabeza MTP cuantizada permite evaluar aceleraciones de inferencia en entornos de 32 GB.
- Despliegue en GPU de consumo: con 19,56 GiB residentes, cabe en una RTX 5090 o similar de 32 GB, lo que permite experimentacion local con un modelo de 27B.

## Benchmarks y rendimiento

Fidelidad medida sobre corpus reservado (136 contextos, 278.392 posiciones puntuadas, KL(BF16 || candidato)):

| candidato | residente | KLD media | IC 95 % | mediana | top-1 |
|---|---:|---:|---:|---:|---:|
| Este build | 19,56 GiB | 0,009673 | [0,00711, 0,01275] | 0,001929 | 96,81 % |
| Hydrated (atencion K6) | 20,31 GiB | 0,007406 | [0,00543, 0,00978] | 0,001335 | 97,19 % |
| Qwen/Qwen3.8-27B-FP8 | 28,51 GiB | 0,013126 | [0,00981, 0,01709] | 0,002343 | 96,22 % |
| unsloth/Qwen3.8-27B-NVFP4 | 21,34 GiB | 0,094978 | [0,06858, 0,12688] | 0,012911 | 90,53 % |

Verificacion de contexto largo por generacion (aguja plantada en texto literario, servidor limitado a presupuesto de 5090):

| tokens de prompt | profundidad de aguja | recuperacion exacta | tiempo | prefill |
|---:|---|---|---:|---:|
| 28.613 | 0,1 / 0,5 / 0,9 | 3/3 | 6,3 s | ~4.500 tok/s |
| 113.345 | 0,1 / 0,5 / 0,9 | 3/3 | 34,3 s | 3.301 tok/s |
| 196.857 | 0,1 / 0,5 / 0,9 | 3/3 | 76,1 s | 2.588 tok/s |

Frente al FP8 oficial: divergencia 0,003453 menor (IC 95 % [−0,004383, −0,002666]) en 135 de 136 contextos, un 26 % inferior con un 69 % del peso residente. La calibracion en disco supera a la codificacion en carga: 0,009673 frente a 0,012135 para el mismo ancho de bits K5.

## Requisitos de hardware

- VRAM estimada: 19,56 GiB residentes para inferencia con vision habilitada y MTP-3.
- GPU recomendada: tarjeta de 32 GB (clase RTX 5090); el autor verifico el contexto en un servidor limitado a ese presupuesto.
- Cabe en GPU de consumo de 32 GB; no cabe en tarjetas de 24 GB o inferiores con el contexto completo.
- Despliegue: requiere el fork Gilded Gnosis de vLLM con `--quantization exl3` y una lista `ignore` exacta. No carga en vLLM upstream, SGLang, TensorRT-LLM, llama.cpp, transformers ni exllamav3 estandar.
- Latencia: prefill de ~4.500 tok/s a 28k tokens, 3.301 tok/s a 113k y 2.588 tok/s a 196k; latencia de generacion no especificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso residente | KLD media | Licencia |
|---|---:|---:|---:|---:|---|
| Este build (EXL3 K5/K6 context) | 27B (base) | 196.857 verificado | 19,56 GiB | 0,009673 | Apache 2.0 |
| malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated | 27B (base) | ~180k | 20,31 GiB | 0,007406 | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 | 27B | no disponible | 28,51 GiB | 0,013126 | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | 21,34 GiB | 0,094978 | Apache 2.0 |

## Limitaciones y advertencias

- Requiere un runtime personalizado (fork Gilded Gnosis de vLLM); no funciona con ningun motor upstream. Es un artefacto experimental, no apto para produccion sin validacion previa.
- El endpoint de chat del VLM trunca el texto a ~2.048 tokens; las peticiones de contexto largo deben enviarse a `/completions` con la plantilla aplicada manualmente.
- La cuantizacion K5 de la atencion introduce una divergencia adicional de +0,002266 frente a la version hydrated (K6), aunque sigue siendo inferior al FP8 oficial.
- Riesgo de alucinacion no cuantificado; la fidelidad se midio solo con divergencia KL y pruebas de aguja, no con tareas generativas estandar.
- Idiomas soportados no documentados en la ficha de HuggingFace.
- 0 descargas y 0 likes en el momento de la redaccion; comunidad de adopcion practicamente nula.
- El parametro total reportado en safetensors (10,3B) no coincide con los 27B declarados del modelo base; posible discrepancia en los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-context
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Coleccion de builds: https://huggingface.co/collections/qwen38-27b-mixed-precision-exl3-measured-6a7fe0cb27817c23e4a57025
- Build hydrated: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated
- Build K5K6 estandar: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6
-
