# minjaechoi/qwen3p6-35b-a3b-2p06bit-r63

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario minjaechoi bajo el identificador `qwen3p6-35b-a3b-2p06bit-r63`. No es un modelo nuevo entrenado desde cero, sino una variante de cuantización mixta del modelo base: los expertos enrutados de la capa MoE se comprimen a una media de 2,0608 bits por peso, mientras que el resto de los pesos se mantiene en BF16. El identificador interno del experimento es r63.

El interés técnico del checkpoint es acotado pero claro: explora cuánta precisión se puede eliminar en los expertos de una arquitectura de mezcla de expertos sin reentrenar, y hasta qué punto la estructura dispersa de un MoE tolera una cuantización tan agresiva. El repositorio ocupa 70,2 GB y declara 35.107.181.936 parámetros totales. La nomenclatura A3B del modelo base sugiere del orden de 3.000 millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

Es relevante ahora por dos motivos. Primero, porque la cuantización extrema de las capas MoE es una línea de investigación activa para reducir el coste de servir modelos grandes. Segundo, porque el autor indica que los pesos se almacenan ya desquantizados en tensores BF16 y cargan con `transformers` y vLLM sin modificaciones, lo que lo convierte en un artefacto reproducible, aunque con una advertencia importante sobre el ahorro real de memoria (ver "Limitaciones y advertencias"). El modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, multimodal segun la etiqueta `image-text-to-text`; etiqueta de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (aproximadamente 35,1 mil millones) |
| Parametros activos | no disponible (la nomenclatura A3B del modelo base sugiere del orden de 3.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0608 bits de media; resto de pesos en BF16. Los pesos se almacenan desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace; el autor indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors (BF16 tras desquantizacion) |
| Tamano del repositorio | 70,2 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Qwen/Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos y enrutamiento disperso, del que este repositorio hereda todos los hiperparámetros salvo la precisión de los expertos. La intervención del autor se limita a los expertos enrutados, que promedian 2,0608 bits por peso, mientras que el resto de componentes (atención, embeddings, normalizaciones y posiblemente el router) permanece en BF16. No se especifica el algoritmo de cuantización empleado, ni si hubo calibración con datos, ni si se aplicó alguna técnica de recuperación o ajuste posterior.

No hay información sobre el entrenamiento original del modelo base en los datos proporcionados: se desconoce el número de tokens, la composición del dataset, la existencia de fases de RLHF, DPO o RLVR, y cualquier innovación técnica asociada (decodificación especulativa, atención lineal, etc.). Tampoco se documenta si el proceso de cuantización introdujo una fase de destilación o ajuste fino de los expertos para compensar la pérdida de precisión. Se trata, por tanto, de un checkpoint del que solo se conoce la transformación de precisión aplicada y el hecho de que los pesos resultantes son cargables con `transformers` y vLLM en BF16 estándar.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), presumiblemente entrada de imágenes con salida de texto; el alcance exacto no esta documentado.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la ficha.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructura de inferencia gestionada.
- Carga directa en `transformers` y vLLM sin kernels personalizados, segun la model card.

## Casos de uso

- Investigacion sobre cuantizacion extrema de MoE: el checkpoint permite medir empiricamente la degradacion de calidad al comprimir los expertos enrutados a 2,0608 bits, comparando contra el modelo base en BF16 con el mismo prompt set.
- Evaluacion comparativa de precisión en modelos dispersos: sirve para estudiar si las capas MoE toleran mejor la cuantizacion agresiva que las capas densas, un resultado util para decidir donde invertir presupuesto de bits en futuros despliegues.
- Servicio de conversacion multi-turno: hereda el pipeline `text-generation` y la etiqueta `conversational`, de modo que puede desplegarse como backend de chat, siempre que la VRAM disponible cubra los 70,2 GB de pesos.
- Procesamiento de documentos con componente visual: la etiqueta `image-text-to-text` indica soporte de entrada de imagenes, adecuado para extraccion de informacion de capturas, formularios o diagramas combinada con texto.
- Despliegue en vLLM para servir a varios usuarios: al cargar con vLLM permite batching continuo y reutilizacion de cache de prefijos, lo que amortigua el coste del modelo entre peticiones concurrentes.
- Generacion asistida de codigo en entornos internos: si el modelo base conserva sus capacidades de codigo, puede integrarse en asistentes de desarrollo, aunque la ausencia de benchmarks obliga a validar la calidad antes de usarlo en produccion.
- Reproduccion de experimentos de cuantizacion: al estar los pesos desquantizados en BF16, cualquier equipo puede cargar el checkpoint y aplicar tecnicas de recompresion, como GPTQ, AWQ o formatos GGUF, para estudiar el impacto combinado.
- Base para destilacion o ajuste fino posterior: el checkpoint puede servir como punto de partida para entrenar una version recuperada de la perdida de precision, aunque esto requiere recursos de computo considerables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni tampoco comparaciones con el modelo base en BF16 que permitan cuantificar la degradacion introducida por la cuantizacion a 2,0608 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 70-75 GB solo para los pesos, porque el repositorio almacena los tensores en BF16 tras la desquantizacion. Hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto y del numero de secuencias concurrentes simultaneas.
- GPU recomendadas: H100 80 GB, A100 80 GB y variantes SXM de 80 GB. Una configuracion de 2x A100 40 GB o 2x L40S 48 GB con tensor parallelism tambien puede ser viable, aunque con menos margen para la cache KV.
- Cabe en GPU de consumo: no. Ni la RTX 4090 (24 GB) ni la RTX 5090 (32 GB) pueden alojar 70 GB de pesos en memoria. Seria necesario repartir el modelo entre varias GPU consumer mediante `device_map`, algo poco practico en produccion.
- Opciones de despliegue: `transformers` con `accelerate` para reparto entre GPUs, y vLLM para inferencia de alto rendimiento. La model card indica explicitamente compatibilidad con ambos. No se menciona soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponible. Depende del hardware, del numero de expertos activos por token y del grado de paralelismo, datos que no se proporcionan.
- Almacenamiento: el repositorio ocupa 70,2 GB en disco, por lo que conviene prever ese espacio antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p06bit-r63 | 35,1 B | no disponible | Expertos enrutados a 2,0608 bits, resto BF16 | no disponible (hereda la del base) | safetensors BF16 |
| Qwen/Qwen3.6-35B-A3B | 35,1 B (heredado) | no disponible | BF16 completo | no disponible | safetensors |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion sustentada por los datos disponibles es contra el propio modelo base, del que este checkpoint difiere exclusivamente en la precision de los expertos enrutados. No se dispone de informacion suficiente sobre modelos comparables de tamano similar como para construir una comparativa fiable sin inventar cifras.

## Limitaciones y advertencias

- Advertencia principal sobre el ahorro de memoria: aunque los expertos promedian 2,0608 bits, los pesos se almacenan desquantizados en BF16. El repositorio ocupa 70,2 GB y la inferencia consume aproximadamente lo mismo que el modelo en BF16 completo. La compresion no se traduce en un menor uso de VRAM en tiempo de ejecucion con `transformers` o vLLM estandar.
- Estado de investigacion: es un checkpoint interno de investigacion, sin validacion publica, sin benchmarks y con cero descargas e interacciones registradas en HuggingFace.
- Riesgo de degradacion de calidad: la cuantizacion a 2,0608 bits en los expertos enrutados puede degradar el razonamiento, la coherencia en contextos largos y la adherencia a instrucciones. No hay mediciones publicadas que acoten esa perdida.
- Riesgo de alucinacion: no cuantificado. La combinacion de un modelo base desconocido y una cuantizacion agresiva aumenta la incertidumbre sobre la fiabilidad factual.
- Idiomas: no se declara ningun idioma soportado, lo que impide garantizar un comportamiento adecuado en castellano o en cualquier otra lengua concreta.
- Contexto maximo: no disponible, lo que impide planificar aplicaciones con requisitos de ventana larga.
- Licencia: la ficha no especifica licencia. El autor afirma que se mantiene la del modelo base, pero sin verificar la licencia de Qwen/Qwen3.6-35B-A3B no puede confirmarse si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Ausencia de soporte para formatos cuantizados de consumo: no hay GGUF ni cuantizaciones de llama.cpp, por lo que no es desplegable en CPU ni en GPU de gama consumer de forma sencilla.
- Trazabilidad limitada: se desconoce el algoritmo de cuantizacion, si hubo calibracion, y cualquier detalle del pipeline que genero el checkpoint, lo que dificulta reproducir el experimento.
- Fecha de publicacion futura respecto al conocimiento general disponible: conviene confirmar la vigencia del modelo base y su documentacion oficial antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p06bit-r63
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
