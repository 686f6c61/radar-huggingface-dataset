# Code4me2/clef-flash-NVFP4

## Resumen

clef-flash-NVFP4 es una cuantizacion NVFP4 (W4A4) del modelo multimodal Cloudflare/clef-flash, publicada por el usuario Code4me2. Se trata de un derivado cuantizado que reduce el peso del repositorio de 19,1 GB (BF16) a 12,1 GB manteniendo, segun el autor, la paridad funcional con el modelo original. El proceso se ha realizado con llmcompressor 0.13.0 y el esquema de compresion compressed-tensors, cuantizando exclusivamente las 96 proyecciones MLP de texto (gate/up/down_proj) y dejando en BF16 el resto de componentes criticos.

El modelo hereda la arquitectura del backbone Qwen3.5-9B (9.409.813.744 parametros en total, segun los safetensors) junto con un codificador de vision y una cabeza de esquema conjunta (joint schema head) propia de Clef. La tarea declarada en el pipeline es image-text-to-text, por lo que combina entrada de imagen y texto para producir respuestas. Es relevante ahora porque representa un ejemplo de cuantizacion agresiva a 4 bits con validacion estadistica explicita de paridad frente al modelo original, un paso habitual antes de desplegar modelos multimodales en GPUs con memoria limitada.

La publicacion incluye un informe de paridad con conjuntos de evaluacion de contexto largo (LongBench v2, banking77 y LEDGAR) y puertas de calidad definidas por el autor, lo que la convierte en un caso util para estudiar como se documenta una cuantizacion de este tipo. El propio autor advierte de que no se ha evaluado el servicio con kernels FP4 nativos, solo una simulacion numerica en PyTorch eager.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.5-9B, codificador de vision y joint schema head; incluye capas gated-deltanet y full-attention |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible (las evaluaciones de paridad usan entradas de 1,7K a 237K tokens) |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos FP4 con tamano de grupo 16 y escalas FP8; capas gated-deltanet, full-attention, lm_head, torre de vision y joint head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pesos empaquetados, requieren descompresion en carga) |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado de Cloudflare/clef-flash (revision 17f0b0ad). La arquitectura base combina un backbone de lenguaje Qwen3.5-9B con un codificador de vision y una cabeza de esquema conjunta denominada joint schema head, gestionada por el modulo `joint_schema_model.py`. La cuantizacion afecta unicamente a las 96 proyecciones MLP de texto (`gate_proj`, `up_proj`, `down_proj`); el resto de la red permanece en BF16 porque la cuantizacion adicional de atencion y deltanet degradaba la calidad. El modelo conserva ademas un gated-deltanet, un mecanismo de estado recurrente empleado junto con las capas de atencion completa.

El proceso de cuantizacion se realizo con llmcompressor 0.13.0 en modo `oneshot` y `QuantizationModifier(scheme="NVFP4")`, con pesos FP4 de grupo 16 y escalas FP8. La calibracion uso escalas globales por tensor de activaciones de entrada, calculadas a partir de 248 registros (3,4 millones de tokens, con longitudes de hasta 87K tokens) procedentes de fuentes legales, de noticias, cientificas, libros, herramientas, enrutamiento y fiscales. El autor indica que se verifico la descontaminacion de la calibracion frente a los conjuntos de evaluacion. El stack empleado fue torch 2.13 (cu132), transformers 5.14.1 y compressed-tensors 0.18.0 sobre una RTX PRO 6000 (SM120).

## Capacidades

- Generacion de texto y procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento sobre contextos largos: se han evaluado entradas de entre 1,7K y 237K tokens a traves de la joint head.
- Clasificacion y seleccion entre multiples opciones (evaluado con banking77 y LEDGAR, con 77 y 100 opciones respectivamente).
- Uso de herramientas y enrutamiento: la calibracion incluye datos de fuentes de "tools" y "routing", lo que sugiere soporte de tool calling, aunque no se detalla explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal en GPUs de gama alta con memoria ajustada: la reduccion a 12,1 GB frente a 19,1 GB permite cargar el modelo en tarjetas donde la version BF16 no cabria, manteniendo el mismo codigo de inferencia.
- Clasificacion de documentos largos: con soporte de entradas de hasta 237K tokens y una joint head que puntua opciones, es adecuado para tareas tipo LEDGAR (clasificacion de clausulas legales) o categorizacion de tickets.
- Clasificacion de intenciones en atencion al cliente: el resultado de banking77 (77 opciones) demuestra que puede seleccionar entre decenas de categorias en una sola pasada, util para enrutar consultas.
- Razonamiento sobre contexto largo tipo LongBench v2: analisis de documentos extensos con preguntas de opcion multiple, util en investigacion y analisis de informes.
- Procesamiento de imagenes con descripcion o pregunta asociada: al incluir torre de vision, puede emplearse en tareas de comprension documento-imagen, siempre que se valide el comportamiento de la cuantizacion en ese dominio.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como caso de estudio reproducible para medir el impacto de W4A4 frente a BF16 en modelos multimodales, gracias a los umbrales de paridad publicados.
- Investigacion sobre compromiso memoria-calidad: util para equipos que quieran decidir si una cuantizacion NVFP4 es aceptable antes de invertir en kernels nativos Blackwell.

## Benchmarks y rendimiento

Los datos publicados corresponden a un conjunto reservado de 256 registros (una pregunta por registro): LongBench v2 (128, 4 opciones), banking77 (64, 77 opciones) y LEDGAR (64, 100 opciones). Las entradas van de 1,7K a 237K tokens y cada modelo recibe una unica pasada forward por la joint head.

| Metrica | BF16 | NVFP4 (este repo) | NVFP4 con atencion + deltanet (no publicado) |
|---|---|---|---|
| Precision | 62,1% | 63,7% | 60,9% |
| Delta de precision, IC 95% (bootstrap pareado) | - | +1,6 pt [-1,2, +4,3] | -1,2 pt [-5,1, +2,7] |
| Acuerdo top-1 con BF16 | - | 0,926 [0,887, 0,952] | 0,883 [0,838, 0,917] |
| Acuerdo donde el margen de BF16 es >= 0,5 (n=156) | - | 1,000 | 0,994 |
| KL media (BF16 frente a cuantizado) | - | 0,020 | 0,048 |
| Tamano (GB decimales) | 19,1 | 12,1 | 9,1 |

El autor define dos puertas de publicacion: el limite inferior del IC 95% del delta de precision debe ser >= -2 pt, y el acuerdo en decisiones con alta confianza debe ser >= 0,98. Este modelo cumple ambas. Bajo las puertas propuestas originalmente (acuerdo global >= 0,95 y cada banda de longitud >= 0,90) el modelo no las superaria, con 0,926 global y 0,878 en la banda de 8K-32K tokens; el autor justifica su retirada por el tamano insuficiente de las muestras por banda (n=26-53). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,1 GB; con activaciones y overhead de runtime, se estima un consumo en torno a 14-16 GB para inferencia en BF16 para las capas no cuantizadas, segun lo indicado por el autor. Cifra estimada, no publicada oficialmente.
- El autor realizo la cuantizacion y las mediciones en una RTX PRO 6000 (SM120), que soporta FP4 nativo.
- GPU recomendadas: RTX PRO 6000 y otras GPU Blackwell (SM120) para aprovechar kernels FP4 nativos; tambien puede ejecutarse en GPUs con suficiente memoria para el modelo descomprimido.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. El tamano de 12,1 GB sugiere que podria caber en GPUs de consumo con 16 GB o mas, pero el autor no lo verifica.
- Opciones de despliegue: la ruta documentada usa transformers con `CompressedTensorsConfig(run_compressed=False)` y descompresion explicita de los pesos. El autor indica que el servicio con kernels FP4 nativos (por ejemplo vLLM sobre Blackwell) no ha sido evaluado. No se mencionan soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las metricas se midieron en PyTorch eager simulando W4A4 numericamente, no con kernels optimizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (conjunto de paridad) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| clef-flash-NVFP4 (este repo) | 9,41B | no disponible | 63,7% | 12,1 GB | apache-2.0 | Publicado |
| Cloudflare/clef-flash (BF16, base) | 9,41B | no disponible | 62,1% | 19,1 GB | apache-2.0 | Publicado |
| Variante NVFP4 con atencion + deltanet | no disponible | no disponible | 60,9% | 9,1 GB | no disponible | No publicado (falla la puerta de precision) |

No se dispone de datos comparativos frente a otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion solo cubre las proyecciones MLP de texto; la atencion, el gated-deltanet, el `lm_head`, la torre de vision y la joint head permanecen en BF16, por lo que el ahorro de memoria es parcial.
- El autor no ha evaluado el servicio con kernels FP4 nativos; las metricas provienen de una simulacion numerica en PyTorch eager, por lo que el rendimiento real en produccion con kernels optimizados no esta verificado.
- Las puertas de calidad originales fueron retiradas y sustituidas por otras mas laxas; el modelo no cumple los umbrales iniciales de acuerdo global (0,95) ni por banda de longitud (0,90 en 8K-32K).
- Todas las discrepancias frente a BF16 se producen en preguntas donde el propio margen de BF16 es inferior a 0,5, lo que indica que la cuantizacion solo altera decisiones poco confiadas del modelo base, pero no elimina el riesgo de degradacion en dominios no evaluados.
- La licencia es apache-2.0, heredada del modelo base; al ser un derivado cuantizado, conviene verificar las condiciones de la licencia original antes de uso comercial.
- No se dispone de informacion sobre sesgos, comportamiento multilingue ni tasas de alucinacion especificas de este derivado.
- El proceso de carga requiere descomprimir los pesos (`run_compressed=False`) y montar manualmente la joint head, lo que anade complejidad de integracion respecto a un modelo estandar de transformers.
- Los conjuntos de evaluacion tienen tamanos pequenos por banda (n=26-53), lo que limita la significacion estadistica de los cortes por longitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Code4me2/clef-flash-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Metricas de paridad (carpeta `metrics/` del repositorio): https://huggingface.co/Code4me2/clef-flash-NVFP4/tree/main/metrics
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/alpha-x-ai/clef-flash-NVFP4
- Perfil del autor en HuggingFace: https://huggingface.co/Code4me2
- Otro modelo del mismo autor: https://huggingface.co/Code4me2/apex-flash-1-abliterated-NVFP4
- Repositorio code4me2 (AISE-TUDelft, referencia de nombre, no del modelo): https://github.com/AISE-TUDelft/code4me2
- Herramienta de cuantizacion llmcompressor: https://github.com/vllm-project/llmcompressor
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
