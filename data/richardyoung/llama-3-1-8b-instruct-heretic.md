# richardyoung/Llama-3.1-8B-Instruct-heretic

## Resumen

Llama-3.1-8B-Instruct-heretic es un ajuste fino del modelo Meta-Llama-3.1-8B-Instruct publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el objetivo declarado es eliminar los mecanismos de rechazo y las capas de alineacion de seguridad del modelo original, de modo que responda a peticiones que el modelo base tiende a declinar. La ficha del repositorio lo etiqueta explicitamente como heretic, uncensored, decensored y abliterated, y anade reproducible como caracteristica del proceso de transformacion.

El modelo conserva la arquitectura y el tamano del original: un transformer decoder-only denso de 8.030.261.248 parametros (aproximadamente 8B), con los pesos en formato safetensors y un repositorio de 16,1 GB. Mantiene el tokenizador y la ventana de contexto de Llama 3.1 (128.000 tokens en el modelo de Meta), asi como el soporte multilingue declarado para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.

Su relevancia es acotada y muy especifica: interesa a investigadores que estudian tecnicas de abliteration y edicion de direcciones de activacion, y a desarrolladores que necesitan un modelo sin capas de rechazo para experimentacion controlada. No es un modelo recomendado para despliegues de produccion orientados al publico general. El acceso esta restringido (gated) en Hugging Face y requiere aceptar las condiciones del repositorio, y la licencia heredada es Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, sin componentes MoE ni mecanismos hibridos. El modelo parte de `meta-llama/Meta-Llama-3.1-8B` segun los metadatos del repositorio, aunque la model card lo etiqueta como variante Instruct; el pipeline declarado es text-generation con proposito conversacional.

La innovacion tecnica del repositorio no esta en el entrenamiento clasico sino en la modificacion de pesos: la etiqueta abliterated indica que se han identificado y eliminado direcciones de activacion asociadas al rechazo (refusal directions) mediante tecnicas de edicion de pesos, un procedimiento habitualmente conocido como abliteration. La etiqueta reproducible sugiere que el autor documenta o automatiza el proceso de transformacion, aunque la informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales. El paper referenciado en los tags (arXiv:2204.05149) corresponde a trabajo previo sobre edicion de modelos y no se detalla su aplicacion concreta en este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento general y respuesta a instrucciones sin los filtros de rechazo del modelo original.
- Generacion de codigo y matematicas a nivel de un modelo de 8B (sin datos de benchmark publicados en este repositorio).
- Soporte multilingue en ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Capacidad de seguir instrucciones largas y mantener contexto extenso, limitada por la ventana del modelo base (128.000 tokens en Llama 3.1).
- Respuestas a peticiones que el modelo alineado rechazaria, que es el objetivo central del ajuste heretic.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido, aunque el modelo base Llama 3.1 Instruct si los soporta de forma nativa.

## Casos de uso

- Investigacion sobre abliteration y seguridad de modelos: permite comparar las respuestas del modelo original frente a la variante decensored para medir que comportamientos dependen de las direcciones de rechazo eliminadas.
- Red teaming y evaluacion de robustez: util como modelo "sin filtros" de referencia para probar clasificadores de contenido, guardrails y sistemas de moderacion en pipelines de evaluacion.
- Generacion de datos sinteticos para entrenamiento: puede producir respuestas a prompts que los modelos alineados rechazan, util para construir datasets de clasificacion o de deteccion de contenido sensible en entornos controlados.
- Experimentacion con roleplay y narrativa sin restricciones tematicas: escritura de ficcion con temas adultos o conflictivos donde el modelo alineado impone negativas, siempre con revision humana.
- Analisis de sesgos y comportamientos no filtrados: estudio academico de como cambia el tono, la verbosidad y la tasa de refusal tras la edicion de pesos.
- Prototipado interno de asistentes especializados: en entornos cerrados donde el equipo asume la responsabilidad del filtrado posterior mediante capas propias de moderacion.
- Fine-tuning posterior sobre dominio: al ser un modelo de 8B con pesos safetensors, sirve como base para ajustes especificos cuando se necesita un punto de partida sin las capas de rechazo del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs consumer de gama alta.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4,5-5,5 GB de pesos, viable en GPUs consumer de 8 GB o mas con contexto moderado.
- GPUs recomendadas para servicio en FP16: A100 40/80 GB, H100, L40S o RTX 4090 para cargas ligeras.
- GPUs consumer: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantizacion 4 bits, en RTX 3060 de 12 GB o GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para pesos convertidos a GGUF, y transformers con PyTorch para inferencia directa en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un modelo denso de 8B se esperan valores tipicos de decenas de tokens por segundo en consumer y cientos en A100/H100, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Llama-3.1-8B-Instruct-heretic | 8,03B | no disponible (base: 128k) | Ajuste abliterated de Llama 3.1 8B | llama3.1 | Gated en Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Modelo alineado oficial | llama3.1 | Gated en Hugging Face |
| Variantes abliterated de Llama 3 8B de otros autores | ~8B | 8k en la generacion 3.0 | Ajustes decensored equivalentes | llama3 | Publicas o gated segun autor |
| Mistral-7B-Instruct | ~7,2B | 32k | Modelo alineado de Mistral AI | Apache 2.0 | Publica |

La comparacion con Mistral-7B-Instruct es relevante por licencia: Mistral ofrece Apache 2.0, mientras que este modelo hereda la licencia Llama 3.1, mas restrictiva para uso comercial a gran escala. Frente al Llama 3.1 8B Instruct oficial, la diferencia principal es el comportamiento ante peticiones sensibles, no el rendimiento bruto, para el que no hay datos publicados en este repositorio.

## Limitaciones y advertencias

- Modelo explicitamente decensored: no incluye las capas de rechazo del Llama 3.1 Instruct original, por lo que puede generar contenido ofensivo, inseguro o legalmente problematico sin aviso.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la ausencia de benchmarks publicados que permitan calibrar su calidad real.
- La eliminacion de direcciones de rechazo puede degradar capacidades generales del modelo base; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado en pipelines de CI/CD sin gestion de tokens.
- Licencia Llama 3.1: impone restricciones de uso comercial, requisitos de atribucion y clausulas de escala (usuarios con mas de 700 millones de usuarios mensuales necesitan licencia adicional de Meta).
- El repositorio tiene un volumen de descargas muy bajo (26) y un solo like, lo que reduce la confianza en su mantenimiento y en la reproducibilidad del proceso declarado.
- No hay informacion sobre el proceso exacto de abliteration, los datos usados ni las evaluaciones de seguridad, lo que dificulta auditar el modelo.
- No apto para produccion orientada al publico general sin capas adicionales de moderacion y revision humana.
- Idiomas declarados limitados a ocho; el rendimiento fuera de ellos no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Llama-3.1-8B-Instruct-heretic
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- Modelo Instruct oficial: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper referenciado en los tags: https://arxiv.org/abs/2204.05149
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
