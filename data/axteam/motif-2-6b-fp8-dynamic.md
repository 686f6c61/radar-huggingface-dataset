# axteam/Motif-2.6B-FP8-dynamic

## Resumen

Motif-2.6B-FP8-dynamic es una cuantizacion post-entrenamiento en FP8 (W8A8) del modelo base Motif-Technologies/Motif-2.6B, publicada por el usuario axteam. El modelo original, desarrollado por Motif Technologies, es un transformer denso de 2.597.218.432 parametros (aproximadamente 2,6 mil millones) con 32 capas y arquitectura de atencion diferencial (differential attention), disenado exclusivamente para generacion de texto. Esta version cuantizada mantiene la licencia Apache-2.0 del original y se distribuye en formato compressed-tensors con esquema `FP8_DYNAMIC`.

La relevancia de esta ficha radica en que ilustra un caso practico de cuantizacion FP8 dinamica sin datos de calibracion (data-free), orientada a reducir el tamano de descarga y almacenamiento (de los pesos BF16 originales a aproximadamente 3,9 GB en disco). Sin embargo, el propio autor advierte de una limitacion importante: Transformers descomprime los pesos FP8 a BF16 en el primer forward, por lo que el consumo de memoria en tiempo de ejecucion y la velocidad son equivalentes a los del modelo original. El beneficio real se limita, por tanto, al transporte y al almacenamiento, no a la inferencia.

El modelo no es compatible con vLLM 0.32 (la arquitectura Motif no esta soportada) y requiere `trust_remote_code=True` junto con Transformers 4.x (no funciona con la rama 5.x). Se trata de un artefacto de nicho, con muy pocas descargas (20) y sin likes en el momento de la consulta, lo que sugiere una adopcion muy limitada dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion diferencial (Motif arch), 32 capas, solo texto |
| Parametros totales | 2.597.218.432 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamica W8A8 (E4M3 en pesos por canal, activaciones FP8 por token en runtime); embeddings, LM head y RMSNorm en BF16 |
| Idiomas soportados | no disponible (la model card incluye ejemplos en coreano e ingles, pero no se declara una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con atencion diferencial, una variante de atencion que busca mejorar la discriminacion entre tokens relevantes y ruido. Esta version es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento ni calibracion con datos: los factores de escala de los pesos se calculan a partir de los propios pesos (per-channel) y los de las activaciones se computan dinamicamente por token en tiempo de ejecucion. Solo se cuantizan las proyecciones de atencion y MLP; los embeddings de tokens, la LM head y todas las RMSNorm permanecen en BF16 para preservar estabilidad numerica.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo original empleo RLHF, DPO u otras tecnicas de alineacion, ya que la model card de esta cuantizacion no los detalla. El tokenizador y la plantilla de chat son identicos a los del modelo original. La innovacion tecnica destacable de este build es el uso del esquema `FP8_DYNAMIC` de compressed-tensors, que permite almacenar los pesos en 8 bits y descomprimirlos a BF16 en el primer forward; el autor reporta que la salida es token a token identica al original BF16 en las pruebas realizadas en CPU.

## Capacidades

- Generacion de texto conversacional en formato chat mediante plantilla integrada.
- Razonamiento basico y respuesta a preguntas (el ejemplo de la model card es una pregunta factual sobre la capital de Corea del Sur).
- Soporte multilingue parcial: se documentan ejemplos en coreano e ingles, sin lista oficial de idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni otras modalidades; es un modelo exclusivamente de texto.
- No se documenta modo "thinking" ni capacidades especiales de razonamiento extendido.

## Casos de uso

- Despliegue en entornos con almacenamiento limitado: al ocupar aproximadamente 3,9 GB en disco frente a los pesos BF16, es adecuado para distribuir el modelo en contenedores o dispositivos con cuotas de almacenamiento ajustadas, aunque el consumo en RAM/VRAM durante la inferencia sea el del modelo BF16.
- Prototipado de chatbots conversacionales: la plantilla de chat integrada y el formato `text-generation` permiten montar rapidamente un asistente conversacional simple en Transformers, adecuado para demos y pruebas de concepto.
- Experimentacion academica con cuantizacion FP8: sirve como caso de estudio reproducible de PTQ data-free con compressed-tensors, util para investigar el impacto de la cuantizacion W8A8 en modelos de ~2,6B.
- Procesamiento de texto en coreano e ingles: para tareas de generacion de texto en estos idiomas en entornos donde no se requiere baja latencia ni alto throughput.
- Evaluacion comparativa de calidad FP8 vs BF16: el autor documenta que las probabilidades del siguiente token tras "The capital of France is" son Paris 0.59 (FP8) frente a 0.62 (BF16), lo que permite usar el modelo para estudiar la degradacion numerica de la cuantizacion.
- Educacion y formacion: como ejemplo practico de flujo de trabajo con `trust_remote_code`, versiones pinneadas de Transformers y compressed-tensors para desarrolladores que aprenden a desplegar modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta dos comprobaciones cualitativas en CPU (2026-11-01): la respuesta al prompt de chat coincide token a token con el modelo BF16 original, y la probabilidad del token "Paris" tras "The capital of France is" es 0.59 en FP8 frente a 0.62 en BF16.

## Requisitos de hardware

- VRAM/RAM estimada: pesos en disco de aproximadamente 3,9 GB, pero Transformers los descomprime a BF16 en el primer forward, requiriendo unos 5,2 GB en memoria durante la inferencia.
- GPU recomendadas: no se especifican en la model card; por el tamano (~5,2 GB en BF16) cabria en GPUs consumer con al menos 8 GB de VRAM, aunque no hay validacion documentada en GPU (las pruebas del autor son en CPU).
- Cabe en GPU consumer: previsiblemente si (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), si bien el dato no esta confirmado por el autor.
- Opciones de despliegue: exclusivamente Transformers (`transformers>=4.56,<5` + `compressed-tensors>=0.19` + `trust_remote_code=True` + accelerate + torch). vLLM 0.32 no soporta la arquitectura Motif. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que la velocidad en runtime es la misma que la del modelo BF16, ya que los pesos se descomprimen en el primer forward. Transformers 4.51.3 + compressed-tensors 0.10.2 funciona pero es muy lento (reaplica la cuantizacion FP8 en cada forward).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Motif-2.6B-FP8-dynamic (este) | 2,6B | no disponible | FP8 W8A8 dinamica | Apache-2.0 | Solo Transformers 4.x |
| Motif-Technologies/Motif-2.6B (base) | 2,6B | no disponible | BF16 | Apache-2.0 | Transformers 4.x |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- La cuantizacion no reduce el consumo de memoria en runtime ni mejora la velocidad: Transformers descomprime los pesos FP8 a BF16 en el primer forward, por lo que el beneficio se limita a descarga y almacenamiento.
- Incompatibilidad con Transformers 5.x: el modelo falla al cargar o genera solo tokens "!" bajo esa rama; es necesario fijar `transformers>=4.56,<5`.
- Incompatibilidad con vLLM 0.32, lo que descarta los motores de inferencia de alto throughput mas habituales.
- Dependencia de `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad en entornos de produccion.
- Riesgo de alucinacion inherente a un modelo de 2,6B sin datos publicados de alineacion; no se documentan evaluaciones de fidelidad factual.
- Idiomas soportados no declarados oficialmente; los ejemplos se limitan a coreano e ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Sesgos conocidos no documentados en la model card.
- Adopcion muy limitada (20 descargas, 0 likes) y validacion unicamente en CPU, sin pruebas publicadas en GPU.
- Licencia Apache-2.0 permite uso comercial, pero los derechos del modelo original pertenecen a Motif Technologies y este repositorio es una obra derivada.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/axteam/Motif-2.6B-FP8-dynamic
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-2.6B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
