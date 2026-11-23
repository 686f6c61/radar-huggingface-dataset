# NextTransformer/MoBA-49B-Tokens

## Resumen

MoBA-49B-Tokens es un checkpoint de investigación publicado por NextTransformer (repositorio Interactive-Active-AI) que implementa Mixture of Block Attention (MoBA), una variante de atención dispersa para modelos de lenguaje causales. El modelo tiene 1.462.765.468 parámetros y una longitud de contexto de 2.048 tokens, y se distribuye como pesos en formato safetensors (4,4 GB) bajo un pipeline de text-generation. El sufijo "49B" del nombre hace referencia a los 49.152 millones de tokens de entrenamiento, no al número de parámetros.

El modelo forma parte de una comparación de arquitecturas dentro del proyecto NextTransformer: se entrenó sobre el dataset ClimbMix durante 46.875 actualizaciones y se evalúa frente a otras variantes de atención bajo el mismo presupuesto de cómputo. Su interés es fundamentalmente metodológico: permite estudiar el comportamiento de la atención dispersa por bloques en un transformer causal a escala media, con métricas de validación BPB y CORE-22 publicadas.

La innovación central es el mecanismo MoBA: cada consulta (query) puntúa claves agrupadas (pooled keys) por cabeza de atención, y los bloques históricos compiten por una selección top-k, mientras el bloque actual se retiene siempre con atención causal estricta. No se introduce ningún objetivo de profesor adicional. El checkpoint se ofrece como referencia de investigación, con una implementación de gather independiente en lugar del kernel fusionado oficial, por lo que la esparsidad teórica no implica una aceleración medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture of Block Attention (MoBA), atención dispersa por bloques |
| Parametros totales | 1.462.765.468 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors); tokenizer en formato tiktoken JSON |
| Tokens de entrenamiento | 49.152 millones (46.875 actualizaciones) |
| Dataset de entrenamiento | ClimbMix |
| Libreria | PyTorch (nexttransformer) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con decodificación autorregresiva estándar, pero sustituye la atención completa por Mixture of Block Attention. En cada cabeza de atención, las consultas puntúan representaciones pooled de las claves de cada bloque; los bloques históricos compiten por una selección top-k y el bloque actual se conserva siempre con atención causal estricta para preservar la coherencia local. Este diseño busca reducir el coste cuadrático de la atención manteniendo el flujo causal, sin introducir objetivos auxiliares de destilación ni profesores externos.

El entrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones, con un total de 49.152 millones de tokens procesados. La model card indica que el registro de ejecución upstream reporta el entrenamiento completado y la auditoría acumulada de cómputo del entrenador, pero que la auditoría independiente de solo lectura permanece pendiente. La implementación de referencia usa un gather independiente en lugar del kernel fusionado oficial, de modo que los beneficios de velocidad de la esparsidad no están validados empíricamente en esta entrega.

## Capacidades

- Generación de texto autorregresiva causal en inglés (el prompt de ejemplo de la model card está en inglés; no se documentan otros idiomas).
- Modelo base preentrenado (pretrained), sin ajuste por instrucciones ni preferencias documentado.
- Razonamiento y conocimiento general evaluados mediante CORE-22 (31,04 sobre 100).
- Modelado de lenguaje medido con validación BPB (0,6714).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- Tokenizer compatible con tiktoken, con tokens especiales como `<|bos|>`.

## Casos de uso

- Investigación sobre atención dispersa: el checkpoint sirve para reproducir y comparar el comportamiento de MoBA frente a atención completa bajo el mismo presupuesto de entrenamiento, usando las métricas BPB y CORE-22 publicadas.
- Estudio de arquitecturas en el proyecto NextTransformer: se integra en la comparación de métodos del repositorio, con registros de ejecución y arquitectura enlazados en la model card.
- Experimentos de eficiencia de atención: permite medir empíricamente el impacto de la selección top-k de bloques sobre la calidad, dado que la model card advierte que la esparsidad teórica no garantiza velocidad medida.
- Prototipado de generación de texto a corta distancia: con 2.048 tokens de contexto, es adecuado para tareas de continuación de texto y prompts breves en entornos de investigación.
- Evaluación de tokenizers tiktoken en pipelines propios: el formato JSON del tokenizer facilita su carga con la librería tiktoken en scripts de investigación.
- Reproducción de resultados en CPU: el ejemplo oficial de carga e inferencia se ejecuta en CPU, lo que facilita la validación del checkpoint en entornos sin GPU.
- Base para ajuste fino experimental: al ser un modelo pretrained de 1,46B parámetros, puede servir como punto de partida para estudios de fine-tuning en dominios concretos, siempre que la licencia lo permita (no disponible).

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0,6714 |
| CORE-22 (×100) | 31,04 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,9 GB solo para pesos (1,46B parámetros × 2 bytes), más memoria para activaciones y KV cache.
- VRAM estimada en FP32: aproximadamente 5,9 GB solo para pesos.
- El contexto es de solo 2.048 tokens, por lo que la KV cache es reducida en comparación con modelos de contexto largo.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores, así como en GPUs de datacenter (A100, H100) sin problema de capacidad.
- El ejemplo oficial de la model card se ejecuta en CPU con `CUDA_VISIBLE_DEVICES=""`, lo que confirma viabilidad en CPU para pruebas puntuales.
- Opciones de despliegue: la model card solo documenta la librería `nexttransformer` (instalación desde el repositorio de GitHub en el commit b2ea466) junto con `safetensors` y `tiktoken`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte explícitamente que la implementación de referencia usa un gather independiente y que la esparsidad teórica no establece velocidad medida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la documentación proporcionada. El propio proyecto NextTransformer incluye otras variantes de arquitectura en su comparación, pero sus especificaciones y resultados no se detallan en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoBA-49B-Tokens | 1.462.765.468 | 2.048 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base preentrenado sin ajuste por instrucciones: no está optimizado para seguir instrucciones ni para diálogo; su uso directo en producción requeriría fine-tuning.
- Contexto muy corto (2.048 tokens): inadecuado para tareas que requieran documentos largos, conversaciones multi-turno extensas o razonamiento sobre contexto amplio.
- Idiomas soportados no documentados: la model card solo muestra ejemplos en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin alineamiento documentado (no se reporta RLHF ni DPO).
- La model card advierte que la auditoría independiente de solo lectura del registro de entrenamiento está pendiente, lo que limita la verificación externa de los resultados reportados.
- La implementación de referencia usa un gather independiente en lugar del kernel fusionado oficial; el rendimiento real de la atención dispersa no está medido.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ClimbMix, puede heredar sesgos de ese corpus.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/MoBA-49B-Tokens
- Arquitectura (JSON de resultados): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/moba.json
- Registro de ejecución: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/moba.json
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
