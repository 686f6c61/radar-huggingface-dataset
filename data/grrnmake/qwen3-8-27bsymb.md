# GRRNMAKE/Qwen3.8-27Bsymb

## Resumen

Qwen3.8-27Bsymb es una conversión del modelo `Qwen/Qwen3.8-27B` al formato propietario `.symb` (Symbolic Group-Quantized INT4), un contenedor binario de tensores autodescriptivo que cuantiza a INT4 con grupo de 128 las matrices de proyección 2D y las MLP SwiGLU, mientras preserva en FP32 las normas RMSNorm, el estado recurrente de Gated DeltaNet y las embeddings de parches de visión. El autor del repositorio es GRRNMAKE y el modelo se distribuye con la licencia Cognitus Public Symbolic License v1.0 (CPSL-1.0). El objetivo declarado es reducir el peso del checkpoint de 55,56 GB (BF16) a unos 14,2 GB, permitiendo su carga en una única GPU de 24 GB o superior.

El modelo subyacente es un transformer híbrido de 64 capas con una combinación de 48 capas de Gated DeltaNet (atención lineal recurrente) y 16 capas de atención completa GQA con puerta, además de una cabeza de predicción multi-token (MTP) y un codificador visual de 27 capas, lo que lo sitúa en la categoría multimodal. El contexto nativo declarado es de 262.144 tokens (256K). La relevancia actual del repositorio no reside tanto en el modelo base como en el formato `.symb` y en el runtime AXIM OS, que prometen acelerar la decodificación entre 2,3 y 1,8 veces respecto a safetensors BF16 en GH200/H100 según los datos del autor.

La información pública disponible es limitada: no hay resultados de benchmarks, no se detallan los datos de entrenamiento del modelo base y la librería `axim-os` no es estándar en el ecosistema. Esta ficha recoge exclusivamente lo declarado en la model card y marca como no disponible todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas Gated GQA (atención completa), más cabeza MTP y codificador visual de 27 capas |
| Parametros totales | No disponible (el nombre del modelo indica 27B; el repo ocupa 16,6 GB en formato `.symb` INT4) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) nativo |
| Tipos de cuantizacion | INT4 simétrico con `group_size=128` para matrices 2D y MLP SwiGLU; FP32 sin pérdida para RMSNorm, estado recurrente (A_log, dt_bias, conv1d, norm), QK-norms y patch embeddings de visión |
| Idiomas soportados | No disponible |
| Licencia | Cognitus Public Symbolic License v1.0 (CPSL-1.0) |
| Formato de pesos | `.symb` (Symbolic Group-Quantized INT4 + FP32 Norm/SSM/Conv), 1.201 tensores; incluye tokenizer SYNAXIM (128.256) y tokenizer nativo Qwen (248.320) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido con 64 capas de decodificador, dimensión oculta de 5.120 y MLP SwiGLU densa con `intermediate_size=17.408`. La innovación estructural es el calendario de atención híbrido: 48 de las 64 capas usan Gated DeltaNet, una atención lineal con estado recurrente de tamaño fijo (`linear_num_key_heads=16`, `linear_num_value_heads=48`, `head_dim=128`) que no crece con la longitud de secuencia, mientras que cada cuarta capa (3, 7, 11, …, 63) es una atención completa GQA con puerta (`attn_q` de `[12288, 5120]`, incluyendo query y puerta Swish). Se añade una cabeza de predicción multi-token (`layer_64_mtp`) y un codificador visual de 27 bloques, lo que confirma el carácter multimodal del modelo.

Sobre el entrenamiento del modelo base no hay información en la documentación disponible: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO o fases de alineamiento. La model card se centra exclusivamente en la conversión al formato `.symb`: cuantización INT4 con grupo de 128 y escalas FP32 por grupo para las proyecciones, y preservación exacta en FP32 de los parámetros del estado recurrente para mantener la estabilidad numérica en ventanas de 256K tokens. El runtime AXIM OS implementa el desempaquetado en C++/SIMD (AVX-512, ARM64 NEON, OpenMP) con un rendimiento declarado superior a 18 GB/s sobre los 1.201 tensores, y soporta doble tokenizer (SYNAXIM de 128.256 entradas y el nativo Qwen de 248.320) mediante alineamiento MATT/AIM Layer-00.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento multimodal: el checkpoint incluye un codificador visual de 27 capas con patch embeddings en FP32.
- Razonamiento de contexto largo: ventana nativa de 262.144 tokens, con atención lineal de estado fijo en 48 capas que evita el coste cuadrático en secuencias largas.
- Decodificación especulativa mediante la cabeza MTP (Multi-Token Prediction) incluida en el checkpoint.
- Doble vocabulario: soporte del tokenizer SYNAXIM (128.256) y del tokenizer nativo Qwen (248.320).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en una sola GPU: con 256K tokens de contexto y un checkpoint de 14,2 GB, el modelo permite analizar contratos, informes o expedientes completos en una RTX 4090 o similar sin fragmentar el contexto ni recurrir a offloading.
- Asistentes conversacionales de atención al cliente: la combinación de atención lineal de estado fijo y ventana de 256K permite mantener historiales extensos por sesión con un coste de memoria estable, adecuado para despliegues en una única GPU de 24 GB.
- Análisis de imágenes con contexto textual largo: el codificador visual de 27 capas permite tareas de descripción, extracción de información o VQA combinadas con documentos extensos, siempre que el runtime `axim-os` soporte la ruta multimodal.
- Investigación sobre atención lineal híbrida: el modelo es un banco de pruebas para estudiar el comportamiento de Gated DeltaNet frente a GQA completa en la misma pila, con pesos ya cuantizados y cargables en hardware de consumo.
- Evaluación del formato `.symb` y del runtime AXIM OS: útil para equipos que quieran medir la ganancia real de velocidad (el autor declara 78–105 tok/s frente a 44 tok/s en GH200/H100) y la fidelidad de la cuantización INT4 en tareas de generación.
- Prototipado de decodificación especulativa: la cabeza MTP incluida permite experimentar con decodificación multi-token sin necesidad de un modelo draft separado.
- Despliegue en estaciones de trabajo con una sola GPU: el tamaño de 14,2 GB deja margen en GPUs de 24 GB para lotes pequeños o caché KV adicional, lo que facilita entornos de desarrollo y demos sin clúster.

## Benchmarks y rendimiento

El autor publica únicamente métricas de runtime, no de calidad del modelo:

| Runtime / formato | Tamano total | Carga en frio (64 capas) | VRAM | Decodificacion (GH200 / H100) |
|---|---|---|---|---|
| `safetensors` BF16 | 55,56 GB | ~28,4 s | 56,8 GB | ~44 tok/s |
| `.symb` + `axim-os` (INT4 + FP32 SSM/Norms) | 14,24 GB | ~1,9 s | 14,8–28,5 GB | 78–105 tok/s (hasta 2,3x) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,8 GB con el checkpoint `.symb` en INT4; el rango declarado llega hasta 28,5 GB según configuración de caché KV y lote.
- GPU recomendadas: H100, GH200 o A100 para ejecución a plena velocidad; en el extremo de consumo, cualquier GPU con 24 GB o más (RTX 4090, RTX 3090, A6000) puede cargar el checkpoint.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más de VRAM; no cabe en GPUs de 16 GB o menos sin offloading.
- Opciones de despliegue: el formato `.symb` requiere el runtime `axim-os` (`pip install axim-os`), con el cargador `AximSymbEngine`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: según el autor, 78–105 tok/s de decodificación en GH200/H100 frente a ~44 tok/s en BF16, y carga en frío de ~1,9 s frente a ~28,4 s. No hay mediciones publicadas para GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27Bsymb (este) | 27B (según nombre) | 262.144 | `.symb` INT4 + FP32 selectivo | CPSL-1.0 (propietaria) | Requiere runtime `axim-os`; sin benchmarks de calidad publicados |
| Qwen3.8-27B (original) | 27B (según nombre) | 262.144 | safetensors BF16 | No disponible en la información | Referencia base; 55,56 GB, requiere multi-GPU u offloading |
| Alternativas de ~27B con contexto largo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no es posible validar el rendimiento real del modelo base ni el impacto de la cuantización INT4.
- Licencia CPSL-1.0 propietaria: es una licencia "other" no estándar; antes de cualquier uso comercial es imprescindible revisar el texto completo en el repositorio, ya que las condiciones de redistribución y uso comercial no se detallan en la model card.
- Dependencia de un runtime no estándar: el modelo solo es utilizable con `axim-os`, una librería fuera del ecosistema habitual (transformers, vLLM, llama.cpp). Esto limita la portabilidad, la integración en pipelines existentes y la disponibilidad de soporte comunitario.
- Riesgo de alucinación: no evaluado ni documentado por el autor; se aplica el riesgo habitual de los modelos generativos sin datos de mitigación.
- Idiomas soportados no declarados: no se especifica cobertura multilingüe, lo que impide garantizar calidad fuera del inglés sin pruebas propias.
- Sesgos: no documentados en la información disponible.
- Trazabilidad limitada del modelo base: no se detallan datos de entrenamiento, alineamiento ni procedencia de los pesos originales de `Qwen/Qwen3.8-27B`.
- El rendimiento declarado (78–105 tok/s) corresponde a GH200/H100; en GPUs de consumo el comportamiento puede degradarse y no hay mediciones publicadas.
- El repositorio tiene 923 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GRRNMAKE/Qwen3.8-27Bsymb
- Licencia CPSL-1.0: https://huggingface.co/GRRNMAKE/Qwen3.8-27Bsymb/blob/main/LICENSE
- Paquete `axim-os` en PyPI: https://pypi.org/project/axim-os/
- Modelo base `Qwen/Qwen3.8-27B`: no disponible en la información proporcionada (referenciado en la model card sin enlace)
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada
