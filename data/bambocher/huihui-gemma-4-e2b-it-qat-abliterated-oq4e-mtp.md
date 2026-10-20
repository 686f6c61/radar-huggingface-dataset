# bambocher/Huihui-gemma-4-E2B-it-qat-abliterated-oQ4e-mtp

## Resumen

Huihui-gemma-4-E2B-it-qat-abliterated-oQ4e-mtp es un checkpoint cuantizado en formato MLX del modelo Gemma 4 E2B instruct, publicado por el usuario bambocher. Se trata de una derivación en cuarta instancia: el modelo original de Google (Gemma 4 E2B it, presumiblemente con cuantización-aware training, QAT) pasó por un proceso de "abliteration" (eliminación del comportamiento de rechazo) atribuible al colectivo huihui-ai, y finalmente fue cuantizado con oQ, la herramienta de cuantización de precisión mixta de oMLX v0.7.0. El resultado son 5.104.297.539 parámetros almacenados en safetensors MLX con 4 bits y group size 64, en un repositorio de 3,9 GB.

El interés de esta ficha es acotado y conviene ser explícito: no es un modelo nuevo, sino un artefacto de cuantización. Su relevancia práctica se limita a usuarios de Apple Silicon que quieran ejecutar una variante sin rechazos de un modelo de la familia Gemma 4 en memoria unificada, con la comodidad de un checkpoint ya empaquetado para mlx-lm. No hay model card descriptiva más allá de los parámetros de cuantización, ni resultados de evaluación, ni declaración de licencia o de idiomas.

El repositorio se creó y actualizó el mismo día (19 de octubre de 2026) y no registra descargas ni valoraciones, por lo que no existe evidencia de validación por parte de la comunidad. Además, la búsqueda web asociada a esta ficha no devolvió ningún resultado pertinente (únicamente recetas de confitura de sandía), de modo que toda la información técnica procede de los metadatos de HuggingFace y de la minimalista model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `gemma4` indica familia Gemma 4; no se detalla transformer, MoE ni híbrida) |
| Parametros totales | 5.104.297.539 (según safetensors del repositorio) |
| Parametros activos | no disponible (el sufijo "E2B" del nombre sugiere del orden de 2B efectivos, sin confirmar en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantización de precisión mixta con oQ (oMLX v0.7.0); el nombre indica además QAT en el modelo de origen |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en los metadatos ni en la model card) |
| Formato de pesos | safetensors MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El tag `gemma4` y el nombre del checkpoint lo sitúan en la familia Gemma 4 de Google, en su variante instruct y con el sufijo E2B, pero ni la model card ni los metadatos describen el tipo de bloque (transformer denso, MoE o híbrido), el mecanismo de atención ni la composición del dataset de entrenamiento. Tampoco se documentan las fases de alineación (RLHF, DPO u otras) del modelo original.

Lo que sí está documentado es la cadena de transformaciones posterior. Primero, un proceso de "abliteration", técnica de modificación de pesos orientada a suprimir la dirección latente asociada a los rechazos, que produce un modelo con menor tendencia a declinar peticiones. Después, una cuantización de precisión mixta con oQ (oMLX v0.7.0) a 4 bits con group size 64, que asigna distinto número de bits según la sensibilidad de cada capa en lugar de aplicar una tasa uniforme. No se especifica qué capas quedaron en precisión superior ni el error de reconstrucción introducido; tampoco hay información sobre el proceso QAT del modelo de partida (número de tokens, esquema de cuantización simulada).

## Capacidades

- Generación de texto conversacional: es un checkpoint instruct, por lo que se espera uso en diálogo multi-turno, sin que haya documentación que detalle su calidad.
- Menor tasa de rechazos: la variante "abliterated" está modificada para no declinar peticiones que el modelo original rechazaría, incluidas categorías sensibles.
- Cuantización de precisión mixta: el checkpoint está pensado para inferencia eficiente en memoria unificada de Apple Silicon, no para GPUs discretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Capacidades multimodales (visión, audio): no disponibles; no se confirman en los metadatos pese a que otras variantes de la familia han incorporado entrada multimodal.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistente local en Mac: ejecución de un chat instruct de ~5B parámetros cuantizado a 4 bits sobre mlx-lm en un MacBook con Apple Silicon, manteniendo los datos en el dispositivo sin llamadas a API externas.
- Generación creativa sin fricción: escritura de ficción, guiones o roleplay en los que el modelo original introduciría rechazos o advertencias; el proceso de abliteration reduce esas interrupciones, a costa de perder parte del filtrado de seguridad.
- Evaluación de cuantización: uso del checkpoint como caso de estudio para medir la degradación de un modelo Gemma 4 E2B al pasar por QAT más una cuantización mixta a 4 bits con group size 64, comparando perplejidad y calidad de salida frente al original.
- Prototipado rápido sin infraestructura: al ocupar 3,9 GB en disco y caber en la memoria unificada de un equipo de 8-16 GB, permite levantar un servidor local (`mlx_lm.server`) para probar prompts y flujos antes de invertir en GPUs.
- Investigación en seguridad y red teaming: la variante abliterada sirve como objeto de estudio para medir qué comportamientos emergen al retirar la capa de rechazo y para calibrar clasificadores externos.
- Anotación y generación de datos sintéticos con filtrado permisivo: útil en pipelines donde un modelo excesivamente restrictivo bloquearía la tarea (por ejemplo, datasets sobre violencia en narrativa o contenido médico explícito), siempre con revisión humana posterior.
- Procesamiento de texto sensible a privacidad en portátil: resumen o reescritura de documentos confidenciales en un equipo sin conexión, aprovechando que el modelo se ejecuta íntegramente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a los parámetros de cuantización y no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación; tampoco hay comparación con el modelo sin cuantizar que permita estimar la pérdida de calidad introducida por oQ.

## Requisitos de hardware

- VRAM / memoria unificada para pesos: aproximadamente 2,6 GB en el caso teórico de 4 bits puros sobre 5,1B parámetros; el repositorio ocupa 3,9 GB, cifra más realista considerando la mezcla de precisión, los embeddings y los metadatos.
- Memoria práctica: con caché KV para contextos medios, un equipo con 8 GB de memoria unificada es el mínimo razonable; 16 GB o más permite contextos largos y ejecución en paralelo con otras aplicaciones.
- GPU recomendadas: no aplica en el sentido habitual; el formato MLX requiere Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es directamente cargable en A100, H100 ni RTX 4090 sin reconversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M y 8 GB o más de memoria unificada; también en Macs de gama baja, a costa de velocidad.
- Opciones de despliegue: mlx-lm (carga directa y `mlx_lm.server`), LM Studio y otras herramientas que acepten safetensors MLX. No es compatible con vLLM, TGI ni Ollama en su forma actual; llama.cpp requeriría una conversión a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-gemma-4-E2B-it-qat-abliterated-oQ4e-mtp | 5.104.297.539 (4 bits) | no disponible | 4 bits, group 64, oQ | no disponible | MLX safetensors, 0 descargas |
| Gemma 4 E2B it (modelo de origen, sin cuantizar) | no disponible (el sufijo sugiere ~2B efectivos) | no disponible | no aplica | no disponible en esta ficha | pesos originales de Google |
| Otras variantes abliterated de la familia (huihui-ai) | no disponible | no disponible | habitualmente sin cuantizar o GGUF | no disponible | repositorios públicos en HuggingFace |
| Cuantizaciones GGUF de la misma familia | no disponible | no disponible | 2-8 bits, group variable | no disponible | HuggingFace, compatibles con llama.cpp y Ollama |

La comparación cuantitativa no es posible con la información disponible: no hay datos de rendimiento de este checkpoint ni de las alternativas citadas. La diferencia práctica frente a una cuantización GGUF equivalente es el ecosistema de ejecución (MLX y Apple Silicon frente a llama.cpp y hardware variado), no un mejor rendimiento demostrado.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia del checkpoint ni la del modelo base, no puede asumirse ningún permiso de uso comercial. Es un bloqueo real para cualquier despliegue en producción.
- Trazabilidad incompleta: el repositorio no enlaza al modelo original, ni al proceso de abliteration, ni a los datos de oQ utilizados, lo que impide verificar la cadena de derivación.
- Sesgos: no documentados. Al derivar de un modelo de Google sin evaluación publicada y tras eliminar la capa de rechazo, es esperable que sesgos presentes en el original se manifiesten con mayor frecuencia y sin contención.
- Alucinación: sin datos. En modelos de ~5B parámetros cuantizados a 4 bits, la degradación por cuantización puede aumentar la incoherencia factual, pero no hay mediciones que lo confirmen en este checkpoint.
- Ausencia de filtrado de seguridad: la abliteration suprime deliberadamente el comportamiento de rechazo, de modo que el modelo puede producir contenido dañino, ilegal o explícito. No debe exponerse a usuarios finales sin una capa de moderación externa.
- Contexto e idiomas desconocidos: se desconoce la ventana máxima y la cobertura lingüística; no hay garantía de buen rendimiento en castellano.
- Riesgo de cuantización agresiva: 4 bits con group size 64 y precisión mixta implica compromisos que el autor no cuantifica; conviene validar la calidad en la tarea concreta antes de adoptarlo.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha, lo que impide contrastar su funcionamiento real.
- Portabilidad limitada: al ser safetensors MLX, queda restringido a Apple Silicon; no hay versión GGUF ni pesos completos en el repositorio.
- Metadatos de fecha futura (19-10-2026) respecto a la fecha habitual de consulta, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/Huihui-gemma-4-E2B-it-qat-abliterated-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo de origen Gemma 4 E2B it: no disponible en la información proporcionada
- Repositorio del proceso de abliteration (huihui-ai): no disponible en la información proporcionada
- Paper o documentación técnica: no disponible
- Demo o espacio de inferencia: no disponible
- Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces anteriores son los únicos verificables a partir de los datos facilitados.
