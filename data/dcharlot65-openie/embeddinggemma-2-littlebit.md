# dcharlot65-openie/EmbeddingGemma-2-LittleBit

## Resumen

EmbeddingGemma-2-LittleBit es un checkpoint de pesos "vivos" (living weights) publicado por el usuario dcharlot65-openie, derivado del modelo de embeddings google/embeddinggemma-2. No se trata de un modelo de lenguaje generativo, sino de una adaptacion del modelo de embeddings de Google a un formato propietario de compresion extrema denominado LittleBit-2 ⊕ Sakana SVF, pensado para su uso dentro de JouleDB, un runtime de inferencia sin PyTorch y una base de datos "termodinamica" orientada a Kubernetes (JouleKube).

El modelo conserva los 744.371.992 parametros del modelo base, pero los almacena mediante factorizacion en planos de bits (471 tensores 2D en bitplanes y 905 vectores 1D de LayerNorm, bias y depthwise). El resultado es un checkpoint de 44,06 MB comprimido con zstd y CRC32, frente a los 1.419,78 MB que ocuparia en FP16, lo que supone una reduccion de 32,22x y una media de 0,2566 bits por peso (sub-1-bit).

Su relevancia es fundamentalmente experimental: demuestra una via de compresion agresiva para modelos de embeddings de recuperacion, con licencia Apache 2.0 y despliegue nativo en Kubernetes. No se han publicado datos de calidad de recuperacion, benchmarks ni idiomas soportados, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (heredada de google/embeddinggemma-2); pesos almacenados como bitplanes LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 744.371.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,2566 BPW); 471 tensores 2D en bitplanes y 905 vectores 1D en precision completa; compresion zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .jsyn (formato propietario de JouleDB); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es google/embeddinggemma-2, un modelo de embeddings de la familia Gemma. Sobre el se aplica una factorizacion LittleBit-2 combinada con Sakana SVF (singular value factorization), que descompone los tensores en planos de bits de baja profundidad y vectores 1D separados para LayerNorm, bias y convoluciones depthwise. No se ha realizado un reentrenamiento desde cero: se trata de una adaptacion de pesos (finetune/compresion) del modelo original.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste contrastivo adicional. Tampoco se especifican innovaciones de decodificacion ni tecnicas de atencion. La unica innovacion tecnica descrita es el propio esquema de compresion sub-1-bit y su integracion en el runtime JouleDB, que prescinde de PyTorch para la inferencia.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion, heredada del modelo base google/embeddinggemma-2.
- Almacenamiento y despliegue con huella de memoria reducida (44,06 MB comprimido) gracias a la factorizacion sub-1-bit.
- Integracion nativa con JouleDB mediante `hf_pull` y el formato `.jsyn`.
- Despliegue Kubernetes-native a traves de JouleKube.
- Inferencia sin dependencia de PyTorch (runtime propio de JouleDB).
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Recuperacion semantica en entornos con memoria muy limitada: el checkpoint de 44,06 MB permite cargar un modelo de embeddings de 744 millones de parametros en nodos o contenedores con restricciones severas de almacenamiento, usando JouleDB como runtime.
- Busqueda vectorial en clusters Kubernetes: JouleKube permite desplegar el modelo como servicio de embeddings junto a la base de datos termodinamica, sin necesidad de imagenes con PyTorch ni CUDA.
- Pipelines de RAG embebidos en el borde: al reducir el peso a decenas de megabytes, el modelo puede distribuirse en dispositivos de borde o entornos air-gapped donde el modelo base en FP16 no cabria.
- Prototipado de sistemas de recomendacion o deduplicacion de documentos: los embeddings generados sirven para similitud coseno y agrupamiento, con la ventaja de un consumo de disco minimo.
- Investigacion sobre compresion extrema de modelos: sirve como referencia reproducible para estudiar el impacto de 0,2566 BPW en la calidad de recuperacion frente al modelo original.
- Despliegue de bajo coste en CI/CD: el tamano reducido permite incluir el modelo en artefactos de build y ejecutar pruebas de recuperacion en cada pipeline sin aprovisionar GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint comprimido ocupa 44,06 MB y los pesos descomprimidos en FP16 equivaldrian a 1.419,78 MB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB es un requisito y su soporte de aceleracion no se documenta.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve`), con integracion en JouleKube; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma-2-LittleBit | 744.371.992 | no disponible | .jsyn (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| google/embeddinggemma-2 | no disponible | no disponible | no disponible | Apache 2.0 (segun model card) | Hugging Face (modelo base) |
| Alternativas de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de terceros comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad de recuperacion: se desconoce la perdida de rendimiento respecto a google/embeddinggemma-2 tras la compresion a 0,2566 BPW.
- El formato `.jsyn` es propietario y solo se carga con JouleDB; no hay conversion documentada a safetensors, GGUF ni otros formatos estandar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-24): no hay evidencia de uso ni validacion por terceros.
- No se especifican idiomas soportados, longitud de contexto ni pipeline de Hugging Face, lo que limita la planificacion de produccion.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser un modelo de embeddings, el riesgo se traslada a la calidad de la recuperacion.
- Dependencia de un ecosistema emergente (JouleDB, JouleKube): la continuidad del proyecto y el soporte a largo plazo no estan garantizados.
- Licencia Apache 2.0 permite uso comercial, pero la atribucion a google/embeddinggemma-2 debe mantenerse y conviene verificar los terminos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/EmbeddingGemma-2-LittleBit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
