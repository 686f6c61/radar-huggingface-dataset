# firzahdzm/tourn-f4920bf7-instructtext-super-v12bpre

## Resumen

El modelo `firzahdzm/tourn-f4920bf7-instructtext-super-v12bpre` es un checkpoint de lenguaje publicado por el usuario firzahdzm en HuggingFace. Se trata de un modelo de aproximadamente 162 millones de parametros (162.417.408 exactos, segun el fichero safetensors) etiquetado con la familia `llama`, lo que apunta a una arquitectura transformer decoder-only de tipo LLaMA. El repositorio ocupa 0,3 GB, dato coherente con un almacenamiento en precision BF16 (2 bytes por parametro).

El modelo no incluye model card, no declara licencia, idiomas soportados ni pipeline de inferencia. Su nombre interno (`tourn-...-instructtext-super-v12bpre`) sugiere que forma parte de una serie de experimentos de ajuste sobre texto instructivo, probablemente generados de forma automatizada dentro de una coleccion mas amplia del mismo autor, que incluye variantes basadas en LLaMA, Granite y LFM2 con tamanos de 1B y 3B.

Por su tamano reducido y ausencia de documentacion, se trata de un artefacto experimental de proposito incierto, mas cercano a un ejercicio de entrenamiento o a un checkpoint intermedio que a un modelo listo para produccion. Cualquier evaluacion seria requiere inspeccion directa de los pesos y del tokenizador, ya que no hay informacion publicada sobre datos de entrenamiento, contexto o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (inferido del tag `llama`; no confirmado por el autor) |
| Parametros totales | 162.417.408 |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; pesos distribuidos presumiblemente en BF16/FP16 (0,3 GB para 162M de parametros) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla del tag `llama`, que en HuggingFace identifica modelos con arquitectura LLaMA (transformer decoder-only con RMSNorm, RoPE y SwiGLU, tipicamente). El numero de parametros (162M) y el tamano del repositorio (0,3 GB) son compatibles con una red de embeddings y capas ocultas de dimension reducida, orientada a inferencia ligera en CPU o GPU de gama baja.

Tampoco se han hecho publicos los datos de entrenamiento: no se conoce el volumen de tokens, la composicion del dataset, ni si hubo fases de instruccion (SFT), alineamiento (RLHF/DPO) o destilacion. El nombre del checkpoint (`instructtext-super-v12bpre`) sugiere una fase de ajuste sobre texto instructivo, pero no hay ninguna confirmacion oficial. Se desconoce igualmente si incorpora innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje, pero no verificada ni documentada.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni documentacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se puede confirmar ninguna capacidad concreta. Las funciones listadas arriba son meras expectativas derivadas del tipo de modelo y no de informacion proporcionada.

## Casos de uso

- Experimentacion academica con modelos pequenos: sirve como punto de partida para estudiar el comportamiento de un transformer de 162M de parametros, pero requiere validacion previa por la falta de documentacion.
- Pruebas de pipelines de inferencia en local: su tamano (0,3 GB) permite cargarlo en entornos con recursos limitados para validar toolchains de despliegue (transformers, llama.cpp, etc.).
- Fine-tuning sobre dominio especifico: al ser pequeno, es abordable ajustarlo en una unica GPU de consumo, siempre que se aclare la licencia antes de cualquier uso.
- Analisis de checkpoints de la serie `tourn`: util para quien investiga la coleccion completa de experimentos del mismo autor.
- Docencia e investigacion sobre ajuste instructivo: util como ejemplo de checkpoint intermedio (`...pre`) en un flujo de entrenamiento por fases.
- Evaluacion comparativa de modelos diminutos: puede emplearse como referencia negativa o de control en estudios de escalado.

En todos los casos, la ausencia de licencia, de model card y de benchmarks hace imprescindible una evaluacion propia antes de plantear cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 0,32 GB solo para pesos.
- VRAM estimada en INT8: aproximadamente 0,16 GB.
- VRAM estimada en INT4: aproximadamente 0,08 GB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una GTX 1650, RTX 3060 o incluso una iGPU reciente bastan para los pesos. El cuello de botella sera el contexto y la velocidad de memoria, no la capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en la mayoria de CPU modernas.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp si se dispone del tokenizador compatible, y potencialmente Ollama o vLLM tras conversion. No hay artefactos GGUF publicados en el repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto, no documentada.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros y disponibilidad. Los modelos de referencia para el rango de 100-500M de parametros son:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| firzahdzm/tourn-f4920bf7-...-v12bpre | 162M | No disponible | No disponible | HuggingFace, 11 descargas |
| SmolLM-135M (HuggingFace) | 135M | 2.048 tokens | Apache 2.0 | Ampliamente distribuido |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 tokens | Apache 2.0 | Ampliamente distribuido |
| TinyLlama-1.1B (TinyLlama) | 1.100M | 2.048 tokens | Apache 2.0 | Ampliamente distribuido |

Los datos de los modelos comparados corresponden a informacion publica general; el rendimiento del modelo objeto de la ficha no puede compararse por falta de benchmarks.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos ni uso previsto.
- Licencia no especificada: no se puede asumir uso comercial ni redistribucion. Es un riesgo legal relevante para cualquier despliegue.
- Riesgo de alucinacion elevado: un modelo de 162M de parametros, sin documentacion sobre su ajuste, tiende a generar texto incoherente o factualmente incorrecto con alta frecuencia.
- Contexto desconocido: la ventana de atencion no esta publicada, lo que impide planificar tareas que requieran contexto largo.
- Idiomas no declarados: podria estar entrenado solo en ingles o en un conjunto reducido de lenguas.
- Sin pipeline ni plantilla de chat publicados: la aplicacion de formato instructivo queda a criterio del usuario, con alto riesgo de degradar la calidad.
- Procedencia dudosa del nombre (`tourn-...`): sugiere generacion automatica o experimental, sin garantia de calidad ni mantenimiento.
- Repositorio con 11 descargas y 0 likes: practicamente sin validacion por parte de la comunidad.
- Fecha de creacion del repositorio (12 de octubre de 2026) posterior a la fecha habitual de publicacion de modelos conocidos; conviene verificar la integridad de los ficheros antes de cargarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/firzahdzm/tourn-f4920bf7-instructtext-super-v12bpre
- Otros modelos del mismo autor (contexto):
  - https://huggingface.co/firzahdzm/tourn-45f9a179-instructtext-super-v4pre
  - https://huggingface.co/firzahdzm/tourn-45f9a179-instructtext-super-v4
  - https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-super-k3g2pre
  - https://huggingface.co/firzahdzm/tourn-3edc57af-instructtext-super-v4pre
  - https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-super-ra2btwin3
- Paper, blog o repositorio oficial: no disponible.
