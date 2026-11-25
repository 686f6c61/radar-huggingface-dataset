# richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic-GGUF

## Resumen

DeepSeek-R1-0528-Qwen3-8B-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic, una variante "abliterated" (tambien etiquetada como "heretic") del destilado DeepSeek-R1-0528 sobre la base Qwen3-8B. El autor de la publicacion es richardyoung, y el artefacto esta pensado para su uso con llama.cpp y Ollama, con pesos cuantizados mediante tecnicas de imatrix. El modelo conserva la estructura de un transformer denso de aproximadamente 8.190 millones de parametros, derivado de la familia Qwen3.

La relevancia de esta ficha reside en dos factores. Por un lado, el modelo parte de DeepSeek-R1-0528, un destilado de razonamiento que incorpora cadenas de pensamiento antes de la respuesta final. Por otro, la variante "heretic" aplica una modificacion de alineacion orientada a reducir los rechazos (abliteration), lo que cambia el perfil de comportamiento respecto al modelo original. El resultado es un modelo de 8B orientado a generacion de texto conversacional, con licencia MIT, pero con acceso restringido en Hugging Face (gated), lo que obliga a aceptar condiciones antes de descargarlo.

El repositorio ocupa 45,7 GB, coherente con un conjunto amplio de cuantizaciones GGUF de distinto nivel. No se dispone de informacion publica sobre la longitud de contexto, los idiomas soportados ni los datos exactos de entrenamiento en la informacion proporcionada, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B, destilado de DeepSeek-R1-0528); detalles de atencion no disponibles |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix; niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8,19 mil millones de parametros construido sobre Qwen3-8B y destilado a partir de DeepSeek-R1-0528. La publicacion no detalla la configuracion interna de capas, cabezas de atencion ni la funcion de activacion, por lo que esos datos se consideran no disponibles. El prefijo "R1-0528" indica que el modelo hereda el comportamiento de razonamiento del destilado de DeepSeek-R1 en su version de mayo de 2025, es decir, la generacion de un razonamiento intermedio antes de la respuesta final.

La variante "heretic" implica un proceso de abliteration: una modificacion de los pesos orientada a eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde con menor frecuencia con negativas. Este proceso se aplica sobre el modelo base richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic, del que esta publicacion es una cuantizacion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO en esta variante concreta. La cuantizacion emplea matrices de importancia (imatrix) para preservar la calidad en los niveles de compresion, una tecnica habitual en el ecosistema llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Razonamiento con cadena de pensamiento heredado del destilado DeepSeek-R1-0528, orientado a problemas de logica y matematicas.
- Generacion de codigo y explicaciones tecnicas, propia de la base Qwen3.
- Comportamiento con menor tasa de rechazos gracias a la modificacion abliterated, lo que amplia el rango de peticiones que el modelo acepta responder.
- Compatibilidad con endpoints y con el ecosistema llama.cpp/Ollama.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Idiomas soportados: no disponibles.

## Casos de uso

- Razonamiento asistido en entornos locales: el modelo puede ejecutarse en una estacion de trabajo con llama.cpp u Ollama y resolver problemas de logica o matematicas paso a paso, mostrando el razonamiento intermedio antes de la respuesta.
- Generacion de codigo en flujos de desarrollo offline: al ser un GGUF de 8B, puede integrarse en editores o scripts locales sin depender de una API externa, util en entornos con requisitos de privacidad.
- Prototipado de asistentes conversacionales: su formato de chat y su tamano permiten desplegar un asistente multi-turno en hardware de consumo para pruebas de producto.
- Investigacion sobre alineacion y abliteration: la variante heretic sirve para estudiar como cambia la tasa de rechazos y la calidad de las respuestas tras eliminar la direccion de rechazo, comparandola con el modelo original.
- Evaluacion de cuantizaciones GGUF: el repositorio con multiples niveles de cuantizacion permite medir el impacto de la compresion en la calidad del razonamiento y en el throughput.
- Generacion de contenido creativo y de ficcion sin filtros estrictos: el perfil abliterated reduce las negativas ante peticiones creativas o de tematica sensible, dentro de los limites legales aplicables.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo en cuantizaciones bajas, es adecuado para demos y pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantizacion GGUF. Para un modelo de 8,19B, las cuantizaciones de 4 bits suelen requerir del orden de 5-6 GB de VRAM, y las de 8 bits en torno a 9-10 GB; los valores exactos por archivo no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma especifica. Por tamano, el modelo es apto para GPUs de consumo con suficiente VRAM y para GPUs de datacenter (A100, H100) en escenarios de mayor concurrencia.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones de 4 bits en adelante (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque la confirmacion por nivel de cuantizacion no esta disponible.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B-heretic-GGUF (este) | 8,19B | No disponible | MIT | GGUF | Cuantizacion imatrix, acceso gated, variante abliterated |
| DeepSeek-R1-0528-Qwen3-8B (original) | 8B | No disponible | MIT (segun modelo base) | Safetensors/GGUF | Modelo sin modificacion de alineacion; menor tasa de rechazos no aplicable |
| Qwen3-8B | 8B | No disponible | No disponible | Safetensors/GGUF | Base del destilado; sin razonamiento R1 |
| DeepSeek-R1-Distill-Llama-8B | 8B | No disponible | MIT | Safetensors/GGUF | Alternativa de destilado de R1 sobre Llama, misma escala |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La modificacion abliterated reduce los rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o inseguro; requiere filtros y supervision adicionales en produccion.
- Riesgo de alucinacion inherente a los modelos de 8B y a los destilados de razonamiento; las cadenas de pensamiento no garantizan la correccion factual.
- No se dispone de informacion sobre sesgos conocidos, cobertura linguistica ni longitud de contexto, lo que dificulta evaluar su idoneidad en escenarios multilingues o de contexto largo.
- El acceso esta restringido (gated) en Hugging Face: es necesario aceptar las condiciones del repositorio antes de descargar los pesos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo derivado de su falta de filtros.
- La cuantizacion GGUF introduce perdida de calidad respecto a los pesos originales; el nivel de degradacion por cuantizacion no esta documentado.
- El modelo es solo de texto; no admite vision ni audio.
- El repositorio ocupa 45,7 GB, por lo que la descarga completa requiere espacio en disco considerable.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic-GGUF
- Modelo base (referenciado en los tags): richardyoung/DeepSeek-R1-0528-Qwen3-8B-heretic
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2510.18892): https://arxiv.org/abs/2510.18892
