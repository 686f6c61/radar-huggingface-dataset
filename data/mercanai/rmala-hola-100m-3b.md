# MercanAI/rmala-hola-100m-3b

## Resumen

rmala-hola-100m-3b es un checkpoint de investigación de tipo modelo base (no instruido ni conversacional) de 100.686.864 parámetros, desarrollado por MercanAI y publicado también bajo el espejo Ethosoft. Está entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo en turco y pertenece a la familia de experimentos RMALA, cuyo objetivo es comparar variantes de backbone de atención en condiciones controladas (mismo tokenizador, mismos tokens de entrenamiento en el mismo orden y mismos conjuntos de validación y test).

La variante "hola" emplea un backbone lineal basado en la implementación oficial fijada de GatedDeltaNet/cache, con 16 capas, anchura 640, embeddings de entrada y salida atados de 32K, RMSNorm y SwiGLU. La longitud de contexto es de 2048 tokens. Es relevante ahora como artefacto de investigación reproducible para estudiar alternativas a la atención completa (GLA, V14 y HoLA) a escala de 100M de parámetros, no como modelo listo para producción.

El modelo no está registrado en Transformers AutoModel: se distribuye con un cargador propio y un script de inferencia en PyTorch nativo para Linux x86_64 con CUDA de NVIDIA. No se declara licencia nueva para pesos ni código y no se ofrecen garantías de inocuidad ni de preparación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con backbone lineal HoLA (GatedDeltaNet/cache), 16 capas, anchura 640, RMSNorm y SwiGLU |
| Parametros totales | 100.686.864 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no se asigna licencia nueva en esta subida; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (valores de checkpoint en FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas y anchura 640, con embeddings de entrada/salida atados de 32K parámetros, RMSNorm y SwiGLU. La variante "hola" usa 5 cabezas de tamaño 128, la caché betae oficial, ventana de 64 y tamaño de chunk de 256. En las variantes comparadas, GLA/V14 emplean 10 cabezas de tamaño 64, y la atención completa usa SDPA causal con RoPE. HoLA es un backbone distinto de GLA normalizada, por lo que la comparación no es una ablación limitada a la caché.

El entrenamiento parte de un subconjunto fijo de 3.000 millones de tokens de la colección pre-tokenizada MercanSet V11 / MercanPretraining, con validación y test disjuntos por shard. No se realizó deduplicación de texto entre colecciones y no se declara ausencia absoluta de contaminación. Se usó una única semilla de entrenamiento (41001). La adaptación V14-LM deriva del modelo de puerta sintético V14: claves contextuales, valores int8, presupuesto de banco de 2048 bytes por cabeza y límites de admisión de lectura/escritura del 5%, con una puerta straight-through aprendida que aplica un umbral duro de 0,99 en forward y acepta memoria con alfa=1 o 0,5. El autor aclara que esto no implica una reducción del 95% de FLOPs del modelo completo ni que las lecturas aceptadas sean correctas.

La evaluación completa de documentos usa chunks de 2048 tokens. La PPL incluye el EOS terminal; el BPB usa la NLL de contenido dividida por el recuento original de bytes UTF-8 y excluye el EOS terminal. Los cálculos de FLOP de entrenamiento e inferencia son estimaciones algorítmicas, no mediciones completas de hardware.

## Capacidades

- Generación de texto autorregresiva en turco como modelo base; no está ajustado a instrucciones ni a diálogo.
- Modelado de lenguaje causal con evaluación por perplejidad (PPL) y bits por byte (BPB).
- Procesamiento de secuencias de hasta 2048 tokens con chunks de documento completo.
- Backbone de atención lineal HoLA con caché betae, ventana 64 y chunk 256, orientado a investigación de eficiencia de memoria de estado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del turco.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Investigación reproducible en atención lineal: el checkpoint permite replicar la comparación entre las variantes gla, v14_full, v14_half, full y hola bajo el mismo tokenizador, orden de tokens y conjuntos de validación/test, gracias a la semilla única y a los conjuntos disjuntos por shard.
- Estudio de memorias de estado con presupuesto fijo: la variante HoLA y la adaptación V14-LM, con banco de 2048 bytes por cabeza y umbral de puerta 0,99, permiten analizar el compromiso entre memoria aceptada y calidad de modelado.
- Punto de partida para fine-tuning en turco: al ser un modelo base de 100M con embeddings atados, sirve como inicialización para tareas posteriores en turco, siempre que se asuma la ausencia de licencia declarada.
- Evaluación de kernels Triton y modo de cómputo: la inferencia con autocast BF16 y TF32 desactivado, y la compilación de kernels Triton en la primera ejecución, permiten medir el coste de arranque y la estabilidad numérica frente a FP32.
- Análisis de morfología aglutinante mediante BPB: la métrica de bits por byte UTF-8 sobre turco permite estudiar cómo se reparte el coste de modelado en una lengua con alta productividad morfológica.
- Docencia y experimentación académica: al distribuirse con fuentes de entrenamiento y fuentes fijadas de HOLA/FLA, es útil como material didáctico sobre arquitecturas alternativas a la atención completa.
- Diagnóstico de decodificación: el decodificador de referencia recalcula el prefijo completo y no es una caché KV optimizada, lo que lo hace adecuado para validar corrección frente a implementaciones optimizadas, no para servir en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor (menor PPL/BPB es mejor). Una sola semilla de entrenamiento (41001).

| Variante | Test PPL | Test BPB | FLOP algorítmico de entrenamiento |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

Conjunto de test: 11.352.596 tokens / 39.843.759 bytes UTF-8 originales. El autor señala que la mejora de V14-half sobre GLA es pequeña y no establece superioridad robusta, y que V14-full no mejoró la PPL de test. No se incluyen diagnósticos completados de recuperación o razonamiento de largo alcance. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4 GB con pesos en FP32 (tamaño del repo 0,4 GB); aproximadamente 0,2 GB si se convierte a BF16. El modo de cómputo probado usa autocast BF16 con TF32 desactivado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor documenta Linux x86_64 con CUDA de NVIDIA como entorno probado.
- Cabe en GPU de consumo: sí, por tamaño de pesos cabe en GPUs de consumo con varios GB de VRAM (por ejemplo, RTX 3060 o superiores), aunque no hay validación publicada específica por modelo.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es el cargador incluido con PyTorch nativo, mediante el script inference.py y el comando hf download seguido de pip install -r requirements.txt.
- Latencia y throughput: no disponibles. El decodificador de referencia recalcula el prefijo completo, no usa caché KV optimizada y detiene la generación en el límite de contexto de 2048 tokens; la primera ejecución compila kernels Triton, lo que añade latencia de arranque.
- Requisitos de entorno: tokenizador con binario nativo para Linux x86_64 y CPython 3.11 o superior.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados para este checkpoint. La comparación siguiente se limita a parámetros, contexto, licencia y disponibilidad; los datos de rendimiento cruzado figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / formato |
|---|---|---|---|---|
| rmala-hola-100m-3b | 100.686.864 | 2048 | no disponible | safetensors con cargador propio; no registrado en Transformers AutoModel |
| GPT-2 (124M) | 124M | 1024 | MIT | safetensors/PyTorch; integrado en Transformers |
| Pythia-160M | 160M | 2048 | Apache 2.0 | safetensors; integrado en Transformers |

Rendimiento comparado entre estos modelos: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones ni a chat; no debe esperarse comportamiento conversacional ni seguimiento de instrucciones.
- Solo cubre turco (tr); no se documenta soporte de otros idiomas.
- El autor no formula ninguna afirmación de inocuidad general ni de preparación para producción.
- Riesgo de alucinación inherente a un modelo de lenguaje base; no hay mitigaciones declaradas.
- La evaluación se hizo con una única semilla de entrenamiento (41001), lo que limita la generalización de las conclusiones comparativas.
- No se realizó deduplicación de texto entre colecciones y no se reclama ausencia absoluta de contaminación.
- La licencia de pesos y código no está declarada en esta subida; el uso comercial queda sin clarificar (ver THIRD_PARTY_NOTICES.md).
- La arquitectura no está registrada en Transformers AutoModel, lo que impide usar el ecosistema estándar (pipeline, AutoModel) sin trabajo adicional.
- El entorno probado se restringe a Linux x86_64, CPython 3.11 o superior y CUDA de NVIDIA; el tokenizador usa un binario nativo para esa plataforma.
- El decodificador de referencia no es una caché KV optimizada y recalcula el prefijo completo, por lo que no es apto para servicio de baja latencia.
- La adaptación V14-LM no implica una reducción del 95% de FLOPs del modelo completo ni garantiza que las lecturas aceptadas de memoria sean correctas.
- El contexto está limitado a 2048 tokens, lo que restringe tareas de contexto largo.
- Los archivos del dataset no se redistribuyen; no se incluyen estados del optimizador, credenciales ni texto de entrenamiento.

## Enlaces

- Modelo en HuggingFace (MercanAI): https://huggingface.co/MercanAI/rmala-hola-100m-3b
- Espejo en HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-hola-100m-3b
