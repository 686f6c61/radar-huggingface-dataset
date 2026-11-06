# james58899/Hy-MT2-7B-ONNX

## Resumen

Hy-MT2-7B-ONNX es la conversion a formato ONNX del modelo de traduccion automatica Hy-MT2-7B, desarrollado originalmente por Tencent y convertido por el usuario james58899. El repositorio incluye dos variantes de pesos: una en fp16 (a partir de los pesos bf16 del checkpoint original) y otra q4f16 (derivada de la cuantizacion int4 AutoRound publicada por Intel). El objetivo es facilitar el despliegue del modelo en entornos basados en ONNX Runtime, especialmente en navegador mediante WebGPU.

El modelo base es un transformer denso de 7.000 millones de parametros, etiquetado con la arquitectura `hunyuan_v1_dense` y orientado a la tarea de traduccion (`pipeline_tag: translation`). La conversion mantiene el tokenizador, la plantilla de chat, la configuracion y los parametros de generacion del checkpoint original, e incorpora una cache KV gestionada mediante el operador `GroupQueryAttention` de ONNX Runtime.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de traduccion de 7B en infraestructuras ONNX Runtime (CPU, GPU y WebGPU) sin depender de frameworks como PyTorch o de servidores de inferencia especificos. No obstante, el propio autor advierte que los scripts de conversion fueron generados por Claude y que el usuario debe verificar el resultado antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`), con cache KV mediante `GroupQueryAttention` |
| Parametros totales | 7B (segun el nombre del modelo base; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y q4f16 (int4 simetrico, grupo 128, como `MatMulNBits` con bloque 128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (embed_tokens y decoder_model_merged, con datos externos) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-7B emplea una arquitectura transformer densa identificada como `hunyuan_v1_dense`, propia de la familia Hunyuan de Tencent. La conversion a ONNX separa el modelo en dos grafos: `embed_tokens` (la matriz de embeddings, en fp16) y `decoder_model_merged` (el decodificador completo con cache KV). Las activaciones y la cache KV se mantienen en fp16 en ambas variantes, y el `lm_head` esta atado a los embeddings, leyendo su fichero de datos externo.

La variante `q4f16` parte del checkpoint `Intel/Hy-MT2-7B-int4-AutoRound`, que aplica cuantizacion int4 simetrica con grupo de 128 mediante AutoRound; en ONNX se representa con el operador `MatMulNBits` y bloque de 128. La variante `fp16` es una conversion directa de los pesos bf16 del checkpoint original de Tencent. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Traduccion automatica: es la tarea principal declarada (`pipeline_tag: translation`), con soporte de generacion autoregresiva mediante cache KV.
- Generacion de texto condicionada por plantilla de chat: el repositorio incluye el chat template del checkpoint original.
- Inferencia en ONNX Runtime: compatible con ejecucion en CPU, GPU y WebGPU.
- Cuantizacion int4: la variante `q4f16` reduce el peso de los pesos para entornos con memoria limitada.
- Soporte multilingue: no se detalla la lista de idiomas en la informacion disponible.
- Tool calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion por lotes en pipelines de datos: el modelo puede procesar grandes volumenes de texto en ONNX Runtime sobre CPU, integrado en etapas de preprocesamiento o localizacion de contenidos, al no requerir PyTorch.
- Traduccion en el navegador con WebGPU: la variante `fp16` permite ejecutar el decodificador en cliente mediante ONNX Runtime Web, util para aplicaciones de traduccion sin enviar texto a un servidor.
- Servicio de traduccion en edge con la variante `q4f16`: la cuantizacion int4 reduce el espacio de pesos y facilita el despliegue en dispositivos con memoria limitada.
- Traduccion de documentacion tecnica en entornos air-gapped: al ser un paquete ONNX autocontenido con licencia Apache 2.0, puede desplegarse en infraestructura interna sin dependencias de servicios externos.
- Integracion en aplicaciones .NET o Java: ONNX Runtime dispone de bindings para estos entornos, lo que permite incorporar traduccion a aplicaciones empresariales sin un stack de Python.
- Evaluacion y experimentacion con cuantizacion: las dos variantes permiten comparar la calidad fp16 frente a int4 en la misma tarea de traduccion con el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 18,6 GB e incluye ambas variantes; la variante `fp16` requiere aproximadamente 14 GB de pesos mas cache KV y activaciones en fp16, mientras que la variante `q4f16` reduce los pesos a aproximadamente 4-5 GB mas cache KV en fp16.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, la variante `q4f16` es la candidata para GPU de consumo con 8-12 GB de VRAM; la variante `fp16` requiere GPU de 16 GB o superior.
- GPU de consumo: la variante `q4f16` puede caber en tarjetas con 8 GB o mas de VRAM; la `fp16` queda fuera de la mayoria de GPU de consumo de gama media.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU) y ONNX Runtime GenAI si el grafo es compatible; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-7B-ONNX (este) | 7B | no disponible | ONNX (fp16, q4f16) | Apache 2.0 | Conversion no oficial, sin benchmarks publicados |
| tencent/Hy-MT2-7B | 7B | no disponible | safetensors (bf16) | Apache 2.0 | Checkpoint original de referencia |
| Intel/Hy-MT2-7B-int4-AutoRound | 7B | no disponible | safetensors int4 | Apache 2.0 | Cuantizacion int4 oficial de Intel, origen de la variante q4f16 |

No se dispone de datos de rendimiento para comparar con otros modelos de traduccion de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no verificada: el autor advierte explicitamente que los scripts fueron escritos por Claude y que el usuario debe comprobar el resultado antes de usarlo.
- Sin benchmarks: no hay evaluacion publicada de calidad de traduccion ni de degradacion por la cuantizacion int4.
- Precision en WebGPU: ONNX Runtime acumula fp16 en fp16 en el operador `MatMul` de WebGPU, por lo que la variante `fp16` es ligeramente menos exacta en WebGPU que en CPU.
- Idiomas no documentados: se desconoce la cobertura linguistica real del modelo base.
- Contexto no documentado: no se indica la longitud maxima de secuencia soportada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos en traduccion.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificar las condiciones del checkpoint base y de la cuantizacion de Intel.
- Repositorio de gran tamano: 18,6 GB, lo que puede dificultar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/james58899/Hy-MT2-7B-ONNX
- Modelo base: https://huggingface.co/tencent/Hy-MT2-7B
- Checkpoint int4 de Intel: https://huggingface.co/Intel/Hy-MT2-7B-int4-AutoRound
