# nchapman/Qwen3.5-0.8B-W4A16-HGPTQ

## Resumen

Qwen3.5-0.8B-W4A16-HGPTQ es una cuantizacion INT4 de solo pesos (W4A16, group size 64) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario nchapman. Emplea una tecnica de cuantizacion GPTQ con rotacion Hadamard en linea y descomposicion de Cholesky (denominada HGPTQ por el autor) aplicada de forma conjunta a las capas lineales del modelo de lenguaje, del modulo de prediccion multi-token (MTP) nativo y del codificador visual. El resultado es un checkpoint de 0,79 GiB frente a los 1,63 GiB del modelo base en BF16, es decir, una reduccion de 2,06 veces.

El modelo base pertenece a la familia Qwen3.5 y es un modelo multimodal de tipo image-text-to-text con 852.985.920 parametros totales, arquitectura hibrida que combina bloques GatedDeltaNet con atencion completa, y un cabezal de vision compuesto por 12 bloques ViT. Esta cuantizacion preserva todas esas capacidades (texto, vision, MTP para decodificacion especulativa) en un unico paquete compatible con vLLM a traves del formato compressed-tensors.

Su relevancia practica radica en que permite desplegar un modelo multimodal con capacidad de borrador especulativo en entornos con recursos muy limitados, manteniendo una perplejidad de texto solo un 4,55 % superior a la del BF16 y una similitud coseno de 0,9696 en tareas de VQA, graficos, documentos y OCR. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: bloques GatedDeltaNet + atencion completa, con ViT para vision y modulo MTP nativo |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group size 64, GPTQ con Hadamard + Cholesky |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura hibrida de 24 bloques que alternan capas GatedDeltaNet (atencion lineal con estado recurrente) y capas de atencion completa. El codificador visual consta de 12 bloques ViT con un tamano intermedio de 3072 y dos proyecciones de fusion espacial (merger). Ademas, incorpora un modulo MTP (multi-token prediction) nativo que actua como borrador para decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion es el esquema de cuantizacion: antes de aplicar GPTQ, el autor pre-rota los pesos de forma offline a lo largo de la dimension de entrada multiplicandolos por la matriz de Walsh-Hadamard de Sylvester de 64x64 normalizada (W' = W·H64/√64). En tiempo de ejecucion se aplica la misma rotacion a las activaciones de entrada antes de la GEMM INT4, mediante HadaCore y CompressedTensorsLinearTransformMethod. Como H64 es determinista (randomize: false), no se almacenan matrices de transformacion adicionales, con coste de almacenamiento nulo. La cuantizacion cubre 207 capas lineales: 150 del modelo de lenguaje, 7 del modulo MTP y 50 del codificador visual. Permanecen en BF16 los embeddings, lm_head, in_proj_a e in_proj_b de la atencion lineal, mtp.fc, patch_embed.proj, las normalizaciones y los sesgos.

## Capacidades

- Generacion de texto conversacional con modo chat, matematicas, ciencia y codigo.
- Razonamiento y uso de herramientas (tool use), segun la evaluacion de perplejidad reportada por el autor.
- Capacidad multimodal image-text-to-text: respuesta a preguntas visuales (VQA), interpretacion de graficos, documentos y OCR.
- Comprension de interfaces de usuario y pantallas (evaluado con ScreenSpot) y OCR matematico.
- Decodificacion especulativa mediante el modulo MTP nativo, que actua como borrador de tokens.
- Capacidades multilingues (incluidas en el conjunto de evaluacion de perplejidad, aunque sin desglose por idioma).
- Soporte de function calling y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- OCR y extraccion de datos de documentos: el modelo conserva una similitud coseno de 0,9696 y un 92,38 % de Top-1 en tareas de VQA, graficos, documentos y OCR, lo que permite digitalizar facturas o formularios en hardware modesto.
- Automatizacion de pruebas de interfaz de usuario: con un 98,52 % de Top-1 en ScreenSpot, puede localizar elementos en capturas de pantalla para generar scripts de test o asistentes de accesibilidad.
- Asistente conversacional embebido: con menos de 1 GiB de pesos, cabe en GPUs de consumo y en entornos de borde, gestionando dialogos multi-turno con el formato de chat del modelo base.
- Generacion de codigo en pipelines de CI/CD: la evaluacion de perplejidad incluye dominios de codigo y tool use, y su compatibilidad con vLLM permite servirlo como endpoint OpenAI-compatible para revisiones automaticas.
- Decodificacion especulativa en produccion: el modulo MTP cuantizado mantiene un 89,71 % de Top-1 como borrador aislado, lo que permite acelerar la generacion en despliegues vLLM con un modelo verificador mayor.
- Procesamiento de documentos cientificos y financieros: la capacidad de interpretar graficos y OCR matematico lo hace util para extraer tablas y formulas de PDF en entornos con VRAM limitada.
- Prototipado e investigacion en cuantizacion: al incluir transform_config y metadatos de compressed-tensors, sirve como referencia reproducible para estudiar el impacto de la rotacion Hadamard en modelos hibridos multimodales.

## Benchmarks y rendimiento

| Evaluacion | BF16 base | W4A16-HGPTQ | Variacion |
|---|---:|---:|---|
| Tamano safetensors | 1,63 GiB | 0,79 GiB | 2,06x menor |
| Perplejidad de texto (378 prompts, 840k tokens) | 4,1695 | 4,3593 | +4,55 % |
| Divergencia KL texto (ponderada / media por token) | 0,0000 | 0,0901 / 0,3149 | no aplica |
| Perplejidad holdout general y multilingue (76 prompts, 20k tokens) | 15,4384 | 15,7561 | +2,06 % |
| MTP nativo (11.583 posiciones), Top-1 | 100,0 % (NLL 2,8764) | 89,71 % (NLL 2,9123) | -10,29 pp |
| Vision VQA, graficos, documentos y OCR (96 imagenes), similitud coseno / Top-1 | 1,0000 / 100,0 % | 0,9696 / 92,38 % | -0,0304 / -7,62 pp |
| Vision UI y OCR matematico (48 imagenes), similitud coseno / Top-1 | 1,0000 / 100,0 % | 0,9692 / 98,52 % | -0,0308 / -1,48 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,0 GiB para los pesos en W4A16; con cache KV y overhead de runtime, el consumo tipico se situa en el rango de 2-4 GiB segun longitud de contexto y resolucion de imagen.
- GPU recomendadas: cualquier GPU NVIDIA Ampere o posterior con soporte de kernels INT4; el modelo hermano de la misma familia indica compatibilidad con RTX 3090 Ti y GPUs Blackwell/GB-class.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GiB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060).
- Opciones de despliegue: vLLM (recomendado, con kernels Marlin/pack-quantized INT4 y soporte de transform_config), transformers con compressed-tensors. No se indica soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.5-0.8B-W4A16-HGPTQ | 852.985.920 | no disponible | W4A16 HGPTQ (0,79 GiB) | apache-2.0 | Vision + MTP cuantizados, vLLM |
| Qwen/Qwen3.5-0.8B (BF16) | 852.985.920 | no disponible | BF16 (1,63 GiB) | apache-2.0 | Referencia de calidad sin perdida |
| nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64 | no disponible | no disponible | W4A16 HGPTQ g64 | apache-2.0 | Misma receta sobre el modelo de 9B |
| nchapman/Qwen3.5-9B-W4A16-GPTQ | no disponible | no disponible | W4A16 GPTQ (llm-compressor) | apache-2.0 | Sin rotacion Hadamard, orientado a Ampere+ |

## Limitaciones y advertencias

- Perdida de calidad medible frente al BF16: +4,55 % de perplejidad en texto y hasta un 10,29 % menos de Top-1 en el borrador MTP, lo que puede reducir la tasa de aceptacion de la decodificacion especulativa.
- La cuantizacion del codificador visual degrada la similitud coseno a 0,9696 y el Top-1 a 92,38 % en documentos y OCR; en escenarios de extraccion critica conviene validar con el modelo BF16.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion; no se dispone de datos especificos de sesgos.
- Idiomas soportados no documentados: la evaluacion multilingue existe pero sin desglose, por lo que no se puede garantizar calidad en castellano.
- Longitud de contexto no disponible en la informacion proporcionada.
- Requiere runtime con soporte de transform_config (vLLM con compressed-tensors y HadaCore); otros backends pueden no aplicar la rotacion Hadamard y producir resultados incorrectos.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el checkpoint derivado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantizacion hermana 9B HGPTQ-g64: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64
- Cuantizacion hermana 9B GPTQ: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-GPTQ
