# 3MPER0RR/Phi-4-mini-3MPER0RR-obliterated

## Resumen

Phi-4-mini-3MPER0RR-obliterated es una variante modificada del modelo Phi-4-mini-instruct de Microsoft, publicada por el usuario 3MPER0RR en Hugging Face. Se trata de una version "abliterated" (o "obliterated", segun la nomenclatura del autor), es decir, un ajuste experimental que elimina o atenua los mecanismos de rechazo del modelo original para que responda a peticiones que la version base declinaria. El autor declara 40 ensayos de modificacion y presenta el artefacto como material de investigacion, sin documentacion tecnica detallada sobre el metodo aplicado.

El modelo conserva la arquitectura del Phi-4-mini-instruct original: un transformer decoder-only de aproximadamente 3.836 millones de parametros (3,8B), con tokenizador phi3 y capacidades de generacion de texto y conversacion. El repositorio ocupa 7,7 GB en formato safetensors, lo que corresponde a pesos en precision alta (probablemente bf16). No se documentan en la informacion disponible la longitud de contexto, los idiomas soportados ni los detalles del proceso de entrenamiento o modificacion.

Su relevancia es limitada y de caracter experimental: sirve como caso de estudio sobre tecnicas de abliteration aplicadas a modelos pequenos de la familia Phi-4, y como ejemplo de los riesgos de seguridad y gobernanza que introduce la redistribucion de pesos sin filtros de seguridad. No es un modelo recomendado para produccion ni para aplicaciones orientadas al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3/Phi-4-mini, codigo custom `phi3`) |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se asume compatible con cuantizacion estandar tipo GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base, con atribucion a Microsoft) |
| Formato de pesos | safetensors |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Tamano del repositorio | 7,7 GB |
| Tokenizador | phi3 (segun tag del repositorio) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-08-30 |
| Ultima actualizacion | 2026-11-02 |
| Descargas | 1.353 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-4-mini-instruct de Microsoft: un transformer decoder-only denso de 3,8B parametros con tokenizador phi3 y atencion estandar (no se documenta atencion lineal ni mecanismos hibridos en la informacion disponible). El modelo base fue entrenado por Microsoft con un pipeline que incluye datos sinteticos y filtrados de alta calidad, seguido de ajuste por instrucciones; sin embargo, los detalles concretos de ese entrenamiento no se reproducen en la model card de esta variante.

Sobre el proceso de modificacion, la model card del autor es extremadamente escueta: indica "experimental modified / abliterated version", "Trials: 40" y "Status: Tested and saved". No se especifica la tecnica exacta (abliteration por direccion de rechazo, fine-tuning con datos sin censura, merging de capas, etc.), ni el numero de tokens de ajuste, ni si hubo RLHF, DPO o cualquier otra fase. Tampoco se documenta la composicion del dataset utilizado ni se publican evaluaciones de seguridad o de calidad tras la modificacion. Esta ausencia de trazabilidad es, en si misma, un dato relevante para cualquier evaluacion tecnica.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Phi-4-mini-instruct.
- Razonamiento basico y respuesta a instrucciones, presumiblemente con menor tasa de rechazos que el modelo original.
- Capacidad de generar contenido que el modelo base filtraria, como consecuencia directa de la modificacion abliterated.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante, aunque el modelo base lo soporta.
- Capacidades multilingues: no documentadas en esta variante; el modelo base declara soporte multilingue, pero no se detalla aqui.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible; es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre tecnicas de abliteration: el modelo sirve como artefacto de estudio para comparar la tasa de rechazo y la coherencia antes y despues de la modificacion, en un entorno controlado y aislado.
- Evaluacion de seguridad de modelos: util para probar sistemas de moderacion y clasificadores de contenido frente a un modelo que deliberadamente carece de filtros, midiendo la robustez de las defensas externas.
- Pruebas de red teaming en laboratorio: permite generar respuestas que un modelo alineado rechazaria, para construir conjuntos de datos de evaluacion de guardrails.
- Experimentos academicos de interpretabilidad: analizar que direcciones del espacio de activaciones se ven alteradas por el proceso de abliteration en un modelo de 3,8B.
- Benchmarking de pipelines de inferencia locales: al ser un modelo pequeno en safetensors, sirve para medir throughput y latencia en vLLM, llama.cpp u Ollama, aunque sin garantias de calidad.
- Docencia sobre riesgos de la cadena de suministro de modelos: caso practico de como un fine-tune no documentado puede heredar la licencia MIT del original y circular sin auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 7,7 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, entre 8 y 10 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5 a 3 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 4080 o RTX 3090 para workstation.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `trust_remote_code=True` (el repositorio usa codigo custom `phi3`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/Phi-4-mini-3MPER0RR-obliterated | 3,8B | no disponible | MIT | Variante abliterated sin documentacion tecnica |
| microsoft/Phi-4-mini-instruct | 3,8B | no disponible | MIT | Modelo base, alineado y documentado por Microsoft |
| Meta Llama 3.2 3B Instruct | 3,2B | 128K (segun ficha oficial) | Llama 3.2 Community License | Alternativa de tamano similar con licencia restrictiva |
| Qwen2.5-3B-Instruct | 3,1B | 32K (segun ficha oficial) | Apache 2.0 | Alternativa de tamano similar con licencia permisiva |

La comparativa de rendimiento no puede completarse porque no hay benchmarks publicados para esta variante. Frente al modelo base, la diferencia principal es la ausencia de filtros de rechazo, no una mejora de capacidad.

## Limitaciones y advertencias

- La modificacion abliterated elimina o reduce los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sensible sin advertencia.
- No hay documentacion del proceso de modificacion, del dataset ni de las 40 pruebas mencionadas; la reproducibilidad es nula.
- Riesgo elevado de alucinacion y de degradacion de la coherencia tras el proceso de abliteration, aunque no se cuantifica en la informacion disponible.
- No se documentan sesgos conocidos especificos de esta variante; hereda los del modelo base, no auditados aqui.
- Longitud de contexto e idiomas soportados no documentados; no se debe asumir el contexto del modelo base sin verificacion.
- Licencia MIT heredada: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el desplegador.
- Uso no recomendado en produccion, atencion al cliente ni aplicaciones orientadas a usuarios finales sin guardrails externos robustos.
- Requiere `trust_remote_code=True` por el codigo custom `phi3`, lo que implica ejecutar codigo no auditado del repositorio.
- El modelo tiene 0 likes y un volumen de descargas moderado (1.353), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-obliterated
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia referenciada en la model card: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-abliterated/blob/main/License
- Aviso de investigacion referenciado en la model card: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-abliterated/blob/main/Disclaimer.md
- Paper de Phi-4 (familia): https://arxiv.org/abs/2412.08905
- Repositorio de transformers (soporte phi3): https://github.com/huggingface/transformers
