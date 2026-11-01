# mradermacher/Granite-4.2-8B-Surgical-Abliterated-GGUF

## Resumen

Granite-4.2-8B-Surgical-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo medismera/Granite-4.2-8B-Surgical-Abliterated, realizada por mradermacher, un cuantizador muy prolífico en la comunidad de Hugging Face. El modelo base es una versión "abliterada" (con los mecanismos de rechazo de instrucciones eliminados) de un modelo de 8,79 mil millones de parámetros derivado de la familia Granite de IBM, con un enfoque aparentemente orientado al ámbito quirúrgico ("surgical alignment" según sus etiquetas).

Este repositorio no contiene un modelo nuevo, sino versiones comprimidas del modelo base en distintos niveles de cuantización (desde Q2_K con 3,5 GB hasta f16 con 17,7 GB), pensadas para ejecutar el modelo localmente en hardware modesto mediante llama.cpp, Ollama u otras herramientas compatibles con GGUF. Su relevancia radica en combinar un modelo de dominio quirúrgico con la supresión de sus salvaguardas de rechazo, algo que lo hace útil para investigación y casos de uso especializados, pero que también exige precaución en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal-lm (transformer, familia Granite; detalles concretos no disponibles) |
| Parametros totales | 8.791.592.960 (~8,79 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base tambien esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, medismera/Granite-4.2-8B-Surgical-Abliterated, es un modelo de lenguaje causal derivado de la familia Granite 4.2 de 8B de IBM. La etiqueta "surgical-alignment" sugiere un ajuste fino orientado al dominio quirúrgico o médico, aunque la model card del repositorio de cuantización no aporta detalles sobre el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación empleadas. La etiqueta "abliterated" indica que se ha aplicado un procedimiento de abliteración: una modificación de los pesos (habitualmente mediante ablation de direcciones de rechazo en el espacio de activaciones) que elimina la conducta de negarse a responder instrucciones consideradas sensibles.

Este repositorio, creado por mradermacher, consiste exclusivamente en cuantizaciones estáticas en GGUF convertidas desde los pesos originales en safetensors. No modifica la arquitectura ni el entrenamiento del modelo base; solo comprime los pesos a distintos niveles de bits por peso (bpw) para reducir los requisitos de memoria. No hay información disponible sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta "conversational" y lenguaje "en").
- Dominio especializado: segun las etiquetas del modelo base, alineacion orientada al ambito quirurgico/medico ("surgical-alignment"), aunque no se publican detalles verificables.
- Sin restricciones de rechazo: al estar abliterado, no se niega a responder instrucciones sensibles que el modelo original rechazaria.
- Compatibilidad con el ecosistema GGUF: ejecutable en llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes locales.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en seguridad de modelos: estudiar el efecto de la abliteracion sobre un modelo afinado en dominio medico, midiendo como cambian las respuestas a instrucciones sensibles antes y despues de la modificacion.
- Asistencia a documentacion quirurgica: redaccion de informes operatorios, resumenes de notas clinicas o plantillas de protocolos quirurgicos en ingles, aprovechando la supuesta afinacion del modelo base en el dominio quirurgico.
- Ejecucion local en hardware modesto: con la variante Q4_K_S (5,2 GB) el modelo cabe en GPUs de consumo de 8 GB de VRAM o incluso en CPUs con RAM suficiente, util para entornos clinicos sin conexion a la nube.
- Prototipado de chatbots medicos: integracion en interfaces conversacionales locales (Ollama, LM Studio) para explorar asistentes de consulta de terminologia quirurgica.
- Generacion de datos sinteticos del dominio medico: creacion de pares pregunta-respuesta o casos clinicos ficticios para entrenar o evaluar otros modelos.
- Evaluacion comparativa de cuantizaciones: servir como banco de pruebas para medir la degradacion de calidad entre Q2_K y f16 en un modelo de dominio especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun la tabla de cuantizaciones del propio repositorio):
  - Q2_K: ~3,5 GB
  - Q3_K_M: ~4,4 GB
  - Q4_K_S / Q4_K_M: ~5,2-5,4 GB
  - Q5_K_M: ~6,4 GB
  - Q6_K: ~7,3 GB
  - Q8_0: ~9,4 GB
  - f16: ~17,7 GB
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) para las variantes Q4; GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) para Q8_0. No se requieren GPUs de datacenter (A100/H100) salvo para la variante f16 en contexto largo.
- Cabe en GPUs consumer: si, desde la Q2_K (3,5 GB) hasta la Q6_K (7,3 GB) caben en GPUs de 8 GB; tambien es viable la ejecucion en CPU con 8-16 GB de RAM, con latencias mayores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. Para servir con vLLM o TGI seria necesario el modelo base en safetensors, no estos GGUF.
- Latencia y throughput: no disponible; en GPUs consumer modernas con cuants Q4 puede esperarse del orden de decenas de tokens/segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Granite-4.2-8B-Surgical-Abliterated-GGUF (este) | ~8,79 B | GGUF (Q2_K a f16) | Apache 2.0 | Dominio quirurgico + abliterado |
| Llama-3.1-8B-Instruct (GGUF comunitarios) | ~8 B | GGUF | Llama 3.1 Community License | Generalista, con salvaguardas intactas |
| Qwen2.5-7B-Instruct (GGUF comunitarios) | ~7,6 B | GGUF | Apache 2.0 / Qwen license segun version | Generalista multilingue, mayor ecosistema |
| MedGemma / modelos medicos abiertos de tamano similar | no disponible | safetensors/GGUF | varia | Afinados en dominio medico sin abliterar |

Comparado con alternativas generalistas de 7-8B, este modelo destaca por su supuesta especializacion quirurgica y su licencia Apache 2.0 sin restricciones de uso comercial; frente a otros modelos medicos abiertos, su rasgo diferencial es la abliteracion, que lo hace mas adecuado para investigacion que para despliegue clinico directo.

## Limitaciones y advertencias

- Al estar abliterado, el modelo carece de las salvaguardas de rechazo originales: puede generar contenido medico peligroso, inexacto u ofensivo sin filtros. No es apto para uso clinico real sin capas de seguridad adicionales.
- Riesgo elevado de alucinacion en dominio medico: la abliteracion y la cuantizacion agresiva (Q2_K, Q3_K) pueden degradar la fiabilidad factual. Nunca debe usarse para tomar decisiones medicas reales.
- Idioma: el modelo esta etiquetado solo para ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con documentos largos.
- La calidad de las cuantizaciones bajas (Q2_K, Q3_K_S/M) es notablemente inferior a la del modelo original en fp16; para uso serio se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario; ademas, los terminos de la familia Granite base pueden aplicar al modelo ascendente.
- No hay benchmarks publicados para este modelo concreto, por lo que su calidad respecto al modelo base sin abliterar no puede verificarse con datos.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/mradermacher/Granite-4.2-8B-Surgical-Abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/medismera/Granite-4.2-8B-Surgical-Abliterated
- Cuants weighted/imatrix del mismo modelo: https://huggingface.co/mradermacher/Granite-4.2-8B-Surgical-Abliterated-i1-GGUF
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Granite-4.2-8B-Surgical-Abliterated-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
