# praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix

## Resumen

`benchmark-slm-fiven-gemma-2-2b-mix` es un adaptador LoRA publicado por el usuario `praiselab-picuslab` sobre el modelo base `google/gemma-2-2b`. No se trata de un modelo entrenado desde cero, sino de un artefacto de ajuste fino (PEFT) asociado a una campana de evaluacion de modelos de lenguaje pequenos (SLM), segun indican los tags del repositorio: `benchmark-slm`, `dataset-fiven` y `strategy-mix`. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, con un tamano de 0,1 GB.

Su relevancia es acotada y de caracter experimental: sirve para reproducir o auditar una configuracion concreta de fine-tuning dentro de un benchmark interno, no como modelo listo para produccion. El modelo base, Gemma 2 2B, es un transformer decoder-only de aproximadamente 2.600 millones de parametros desarrollado por Google DeepMind, con una ventana de contexto de 8.192 tokens; el adaptador hereda esas caracteristicas arquitectonicas, pero anade un ajuste especifico del que no se publican detalles de datos, hiperparametros ni resultados.

El idioma declarado es el italiano (`it`) y el acceso al repositorio esta restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo. No se ha publicado informacion sobre licencia, benchmarks ni ficha tecnica del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/gemma-2-2b); adaptador LoRA sobre atencion y capas lineales |
| Parametros totales | Aproximadamente 2.600 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base google/gemma-2-2b) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones de terceros (GGUF, GPTQ, AWQ) no incluidas en este repositorio |
| Idiomas soportados | Italiano (`it`) segun los metadatos; capacidades multilingues del modelo base no verificadas en este adaptador |
| Licencia | No disponible; acceso restringido sujeto a las condiciones de HuggingFace y a los terminos del modelo base Gemma |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 2 2B, un transformer decoder-only con atencion por ventanas alternada y atencion global, normalizacion RMSNorm y activacion GeGLU, disenado por Google DeepMind para inferencia en hardware de consumo. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), tecnicamente materializado como un modulo PEFT que introduce matrices de bajo rango en las proyecciones del modelo base y deja congelados los pesos originales. El repositorio no incluye el modelo base fusionado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset (`dataset-fiven` aparece como tag, sin enlace ni descripcion), el uso de RLHF/DPO ni los hiperparametros del ajuste (rango, alpha, tasa de aprendizaje, epocas). El tag `strategy-mix` sugiere una combinacion de estrategias de entrenamiento o de mezcla de datos, pero no se documenta en la informacion disponible. Tampoco se detalla si hubo decodificacion especulativa, destilacion u otra tecnica adicional.

## Capacidades

- Generacion de texto autoregresiva en italiano, heredada del modelo base y modulada por el ajuste LoRA.
- Conversacion de un solo turno o multiturno dentro de la ventana de 8.192 tokens del modelo base.
- Razonamiento basico y respuesta a instrucciones, sujeto a la calidad no verificada del ajuste.
- Generacion de codigo y matematicas: capacidades potenciales del modelo base, no evaluadas en este adaptador.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multimodales (vision, audio): no disponibles; Gemma 2 2B es exclusivamente textual.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Evaluacion comparativa de SLM: el adaptador sirve como una de las configuraciones de referencia dentro de una campana de benchmark interna, permitiendo medir el efecto de una estrategia de ajuste concreta frente a otras variantes del mismo modelo base.
- Reproducibilidad de experimentos: investigadores que quieran replicar el pipeline `dataset-fiven` + `strategy-mix` pueden cargar el adaptador con PEFT y fusionarlo con `google/gemma-2-2b` para auditar el comportamiento resultante.
- Estudio de tecnicas LoRA: util para analizar como un adaptador de bajo rango modifica el comportamiento de un modelo de 2.600 millones de parametros en un idioma concreto (italiano).
- Prototipado de generacion de texto en italiano: con una GPU de consumo y cuantizacion de 4 bits, el modelo fusionado puede usarse para pruebas de generacion de texto en entornos de desarrollo, sin garantias de calidad para produccion.
- Docencia y formacion: ejemplo practico de publicacion de adaptadores PEFT con acceso restringido y de gestion de artefactos de benchmark en HuggingFace.
- Filtrado y preprocesado de texto en italiano: tareas simples de reescritura, resumen o clasificacion generativa en pipelines internos, siempre con validacion humana dado que no hay metricas publicadas.
- Base para un ajuste posterior: el adaptador puede servir como punto de partida para un fine-tuning adicional en dominios especificos en italiano, aunque la falta de licencia clara es un obstaculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado: aproximadamente 5-6 GB en fp16, unos 3 GB en int8 y alrededor de 2 GB en cuantizacion de 4 bits. El adaptador por si solo ocupa 0,1 GB, pero requiere cargar el modelo base para funcionar.
- GPU recomendadas: NVIDIA A100 o H100 para evaluacion por lotes a gran escala; RTX 4090 o L40S para experimentacion con throughput alto.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) usando cuantizacion de 4 u 8 bits; en fp16 se recomienda un minimo de 8 GB y preferiblemente 12 GB.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM o TGI tras fusionar los pesos; llama.cpp u Ollama solo si se genera previamente un GGUF a partir del modelo fusionado, ya que el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| benchmark-slm-fiven-gemma-2-2b-mix | ~2.600 M (base) + adaptador LoRA | 8.192 tokens | Italiano | No disponible (gated) | safetensors (PEFT) | Artefacto de benchmark, sin metricas publicadas |
| google/gemma-2-2b | ~2.600 M | 8.192 tokens | Multilingue | Terminos de uso de Gemma | safetensors | Modelo base preentrenado, sin ajuste de instrucciones |
| google/gemma-2-2b-it | ~2.600 M | 8.192 tokens | Multilingue | Terminos de uso de Gemma | safetensors | Variante ajustada con instrucciones, uso general |
| Llama 3.2 1B Instruct | ~1.200 M | 128.000 tokens | Multilingue | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Alternativa de menor tamano y mayor contexto, con ecosistema amplio |

No se dispone de datos de rendimiento comparativo para el adaptador, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas de calidad, por lo que no puede recomendarse para produccion sin una evaluacion propia.
- Licencia no especificada: la ficha no indica terminos de uso, lo que impide determinar si el uso comercial esta permitido; ademas, se heredan las restricciones de los terminos de Gemma.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a cualquier integracion automatizada.
- Es un adaptador, no un modelo autonomo: sin el modelo base `google/gemma-2-2b` el artefacto es inutilizable.
- Idioma limitado al italiano segun los metadatos; el rendimiento en castellano no esta verificado y no deberia asumirse.
- Riesgo de alusion: inherente a los modelos de 2.600 millones de parametros, especialmente en tareas factuales y con contextos largos; no hay evaluaciones que lo cuantifiquen.
- Ventana de contexto de 8.192 tokens: insuficiente para documentos extensos o conversaciones muy largas en comparacion con alternativas actuales de 128.000 tokens.
- Sesgos: no documentados; el adaptador puede amplificar sesgos presentes en el dataset `dataset-fiven`, del que no se publica composicion.
- Trazabilidad: sin model card detallada, sin fecha de entrenamiento verificable mas alla de la creacion del repositorio (23 de octubre de 2026) y sin informacion sobre el autor mas alla del nombre de usuario.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo y no se han incluido como fuentes.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix
- Modelo base: https://huggingface.co/google/gemma-2-2b
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web proporcionada.
