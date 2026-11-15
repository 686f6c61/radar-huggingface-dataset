# kn1ghtc/guard

## Resumen

`guard` es una familia de clasificadores de seguridad de contenido desarrollada por el usuario de Hugging Face kn1ghtc. A diferencia de los modelos generativos convencionales, cada rol de la serie emite un veredicto corto y parseable (nivel de severidad más una ruta de categoria) en lugar de texto libre. La serie cubre cuatro roles que van desde un modelo de 0,6B para edge hasta un modelo multimodal de 30B totales y 3B activos, todos compartiendo la misma taxonomia de etiquetas y el mismo contrato de salida.

El proposito declarado es servir como capa de moderacion de entradas y salidas en superficies de chat, comentarios y subida de medios, asi como filtrado en cascada (una etapa de texto barata primero, escalado multimodal solo en casos ambiguos) y despliegue en dispositivo con presupuesto de latencia estricto. La serie se apoya en bases de Qwen (Qwen3-Omni-30B-A3B, Qwen3Guard-Gen-8B, Qwen3.5-9B y Qwen3Guard-Gen-0.6B) y se distribuye bajo licencia propietaria.

Es relevante ahora porque propone una taxonomia unica aplicable desde un telefono hasta un servidor, con un contrato de salida cerrado que simplifica la integracion en pipelines de moderacion. Sin embargo, en el momento de redactar esta ficha no hay pesos publicados ni resultados de evaluacion: la model card documenta roles, contrato de salida y limitaciones, pero no artefactos cargables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; el rol `guard.deep` es MoE (segun base Qwen3-Omni-30B-A3B), el resto no disponible |
| Parametros totales | 0,6B (`guard.edge`), 8B (`guard.context`), 9B (`guard.llm`), 30B (`guard.deep`) |
| Parametros activos | 3B en `guard.deep` (MoE); no aplica en el resto |
| Longitud de contexto | no disponible (la base `guard.context` se describe como "long context" sin cifra) |
| Tipos de cuantizacion | Cuantizacion propia por rol; se publicaran los bits y el group size en el artefacto, valores concretos no disponibles |
| Idiomas soportados | en, zh (cobertura multilingue desigual fuera de los idiomas de entrenamiento) |
| Licencia | other (propietaria; no se distribuyen pesos; bases upstream Apache-2.0) |
| Formato de pesos | no disponible (no hay directorio de pesos publicado; se mencionan shards cuantizados y tokenizer) |

## Arquitectura y entrenamiento

La serie se construye sobre modelos base de Qwen: `guard.deep` sobre Qwen3-Omni-30B-A3B-Instruct (MoE con 30B totales y 3B activos, multimodal), `guard.context` sobre Qwen3Guard-Gen-8B (texto y contexto largo), `guard.llm` sobre Qwen3.5-9B (texto y vision) y `guard.edge` sobre Qwen3Guard-Gen-0.6B (texto). No se detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; la model card solo indica que la taxonomia y las definiciones de etiquetas son propias del autor.

El diseno esta optimizado para time-to-first-verdict: el presupuesto de salida es de decenas de tokens, el razonamiento (thinking) esta desactivado en todos los roles para no romper el formato ni inflar el coste, y el coste de decodificacion queda dominado por el prefill del prompt. Los artefactos publicados se nombraran como `guard-<role>-<size>-<bits>-uc-base`, con la receta de cuantizacion (bits, group size, modulos que permanecen en mayor precision), la version de la taxonomia y la latencia medida por rol.

## Capacidades

- Clasificacion de seguridad de contenido con salida estructurada: veredicto (`unsafe`/equivalente), severidad en escala de tres niveles y ruta de categoria (por ejemplo `["violence", "graphic"]`).
- Contrato de salida cerrado: conjunto de claves fijo, sin campos de texto libre, lo que facilita el parseo en produccion.
- Moderacion de entrada y de salida (respuestas de asistente).
- Multimodalidad en `guard.deep`: texto, imagen, audio y video.
- Vision en `guard.llm`; contexto largo en `guard.context`.
- Despliegue en edge con `guard.edge` (0,6B) bajo presupuesto de latencia estricto.
- Soporte multilingue limitado a en y zh, con cobertura desigual en otros idiomas.
- No soporta chat, resumen ni uso como asistente generativo; el razonamiento esta desactivado por diseno.
- Tool calling / function calling: no disponible (fuera del contrato del modelo).
- Capacidades de agente y razonamiento multi-paso: no disponibles por diseno.

## Casos de uso

- Moderacion de comentarios en plataformas sociales: `guard.edge` o `guard.context` clasifican cada comentario en milisegundos con un veredicto parseable, permitiendo bloquear, revisar o publicar segun umbrales de severidad definidos por encima del modelo.
- Filtrado en cascada de subidas de medios: una primera etapa de texto barata descarta la mayoria de casos y solo se escala a `guard.deep` (texto, imagen, audio, video) cuando el resultado es ambiguo, reduciendo coste computacional.
- Moderacion de respuestas de asistentes: colocar la serie como capa de politica delante de modelos sin alineacion o con rechazo eliminado, interceptando salidas antes de mostrarlas al usuario.
- Moderacion en dispositivo: `guard.edge` (0,6B) permite obtener un veredicto local en telefonos o portatiles con MLX, sin enviar contenido sensible a un servidor.
- Cumplimiento de politicas de comunidad: la taxonomia unica y la escala de severidad de tres niveles permiten redactar una politica una sola vez y aplicarla en todos los tamanos de despliegue.
- Deteccion previa en pipelines de datos: usar la serie como etapa de filtrado antes de entrenar o indexar corpus, combinada con normalizacion de texto para mitigar codificaciones adversarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclaman numeros de evaluacion y que estos se publicaran junto con la primera release de preview, incluyendo tamano del conjunto de evaluacion, umbrales y baseline de comparacion.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; como referencia de orden de magnitud, un modelo de 0,6B en 4 bits ocupa del orden de 0,5 GB de pesos, uno de 8-9B en 4 bits del orden de 5-6 GB y uno de 30B (MoE, 3B activos) en 4 bits del orden de 17-18 GB, sin contar overhead de contexto ni de runtime.
- `guard.edge` (0,6B): cabe en cualquier GPU consumer moderna e incluso en CPU; adecuado para despliegue on-device.
- `guard.llm` (9B) y `guard.context` (8B): viables en RTX 4090 (24 GB) con cuantizacion de 4-8 bits.
- `guard.deep` (30B MoE): requiere GPU de 24 GB o superior con cuantizacion agresiva; comodo en A100/H100 de 40-80 GB.
- Opciones de despliegue: la libreria declarada es MLX (Apple Silicon); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card menciona el ejemplo de 41 ms de latencia para `guard.context` en una maquina no especificada, pero no se aportan mediciones sistematicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `guard` (serie) | 0,6B / 8B / 9B / 30B MoE | no disponible | Si (`deep`: texto, imagen, audio, video) | Propietaria, sin pesos | No publicados |
| Qwen3Guard-Gen-8B (base de `guard.context`) | 8B | no disponible | No | Apache-2.0 | Publicado por Qwen |
| Qwen3Guard-Gen-0.6B (base de `guard.edge`) | 0,6B | no disponible | No | Apache-2.0 | Publicado por Qwen |
| `kcnet-guard-lite` (mismo autor) | no disponible | no disponible | No | no disponible | Publicado como detectores ligeros |

La comparativa con alternativas de moderacion de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No hay pesos publicados: la serie no es utilizable hoy como artefacto cargable; solo se documenta el contrato de salida.
- La escala de severidad de tres niveles es gruesa por construccion; el contenido limite requiere una politica de umbrales por encima del modelo.
- El modo de fallo dominante es el exceso de rechazo en entradas cortas y sin contexto (palabras alarmantes en sentido cotidiano: cocina, juegos, medicina).
- Cobertura multilingue desigual fuera de en y zh; los numeros por idioma se reportaran con cada release.
- Las codificaciones adversarias (homoglifos, base64, trucos de maquetacion) no se resuelven solo con un clasificador; hay que combinarlo con normalizacion.
- Licencia propietaria: no se distribuyen pesos y el uso comercial queda sujeto a los terminos del autor, no disponibles en detalle.
- No debe usarse para decisiones legales, medicas o de seguridad critica sin revision humana.
- No debe usarse como asistente conversacional ni para reclamar cobertura mas alla de los idiomas y categorias realmente medidos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la clasificacion puede ser incorrecta en casos limite; no se han publicado metricas de fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kn1ghtc/guard
- Detectores ligeros del mismo autor: https://huggingface.co/kn1ghtc/kcnet-guard-lite
- Base de `guard.deep`: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Base de `guard.context`: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Base de `guard.llm`: https://huggingface.co/Qwen/Qwen3.5-9B
- Base de `guard.edge`: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
