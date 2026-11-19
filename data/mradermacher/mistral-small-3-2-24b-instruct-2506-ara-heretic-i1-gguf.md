# mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF es una cuantizacion GGUF con imatrix del modelo richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic, publicada por el usuario mradermacher. El modelo base es una variante "heretic" (abliterated/decensored) del Mistral-Small-3.2-24B-Instruct-2506 oficial de Mistral AI, es decir, un ajuste que elimina total o parcialmente los mecanismos de rechazo del modelo original manteniendo, en teoria, sus capacidades generales. Con 23.572.403.200 parametros, es un transformer denso de aproximadamente 24B, multimodal (vision) y conversacional.

La relevancia de esta ficha reside en dos factores. Por un lado, ofrece el modelo base en formato GGUF con cuantizaciones que van desde 5,4 GB (i1-IQ1_S) hasta las variantes de mayor calidad, lo que permite ejecutarlo en hardware de consumo y en entornos con llama.cpp u Ollama. Por otro lado, la naturaleza "heretic" del modelo implica que se ha modificado su comportamiento de seguridad, lo que condiciona su uso en produccion y exige advertencias explicitas sobre contenido no filtrado.

El repositorio tiene 253,6 GB de tamano total, 5.782 descargas y 2 likes en el momento de la consulta. La licencia declarada es apache-2.0, aunque la model card incluye tambien la etiqueta openrail++ y el modelo base declara apache-2.0. El pipeline no esta disponible en la informacion proporcionada. La fecha de creacion registrada es 2026-11-06 y la de actualizacion 2026-11-08.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision), variante heretic/abliterated del Mistral-Small-3.2-24B-Instruct-2506 |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-Q8_0 (segun la lista de quants de la model card) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (segun metadatos de la model card) |
| Licencia | apache-2.0 (etiqueta openrail++ tambien presente en la model card) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 23,57B parametros, derivado de Mistral-Small-3.2-24B-Instruct-2506. Se trata de un modelo instructivo conversacional con capacidad multimodal (vision), como indica la model card al referirse a "mmproj files" para el modelo de proyeccion visual. La variante "heretic" o "abliterated" implica una modificacion del comportamiento de rechazo del modelo original, tipicamente mediante tecnicas de abliteration que eliminan direcciones de activacion asociadas a la negativa a responder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en el modelo base.

La cuantizacion de mradermacher es de tipo i1 (imatrix), con un fichero imatrix.gguf de 0,1 GB para quien quiera generar sus propias cuantizaciones. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar. No se detalla la innovacion tecnica del entrenamiento original ni detalles de decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en 24 idiomas declarados (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn).
- Razonamiento general e instrucciones, heredado del modelo Instruct de Mistral AI.
- Capacidad multimodal de vision: la model card indica que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico.
- Comportamiento "uncensored"/"decensored"/"abliterated": el modelo no aplica los rechazos tipicos del modelo original.
- Formato GGUF compatible con llama.cpp, Ollama y otros runners que soportan GGUF.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el Mistral-Small-3.2-24B-Instruct-2506 original, util para analisis de robustez de filtros de seguridad.
- Despliegue local en hardware de consumo: con cuantizaciones de 13,6 GB (i1-Q4_K_S) o 12,9 GB (i1-IQ4_XS) puede ejecutarse en GPU consumer con 16-24 GB de VRAM mediante llama.cpp u Ollama, adecuado para prototipos y entornos sin conexion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde el modelo original rechazaria ciertos temas, con la advertencia de que la salida no esta filtrada.
- Procesamiento de documentos con imagenes: al ser un modelo de vision, puede usarse para extraer informacion de capturas, diagramas o documentos escaneados, siempre que se cargue el fichero mmproj correspondiente del repositorio estatico.
- Traduccion y asistencia multilingue: con 24 idiomas declarados, puede emplearse en tareas de traduccion y atencion al cliente en idiomas minoritarios como nepalí, serbio o bengalí, aunque la calidad por idioma no esta verificada.
- Entornos de investigacion con requisitos de reproducibilidad: la cuantizacion imatrix y la etiqueta "reproducible" permiten regenerar cuantizaciones a partir del fichero imatrix.gguf, util para experimentos que requieren control exacto del artefacto.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece desde IQ1 hasta Q8, lo que permite medir la degradacion de calidad por nivel de cuantizacion en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: aproximadamente 5,4 GB (i1-IQ1_S), 8,2 GB (i1-IQ2_M), 10,8 GB (i1-IQ3_M), 13,6 GB (i1-Q4_K_S / i1-Q4_0), 16-17 GB (i1-Q5_K_M, estimado por progresion de tamanos) y 20+ GB para Q6_K/Q8_0 (tamanos no listados en el extracto).
- GPU recomendadas: para cuantizaciones altas, A100 40/80 GB o H100; para cuantizaciones Q4-Q5, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizaciones hasta Q5 aproximadamente; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3/IQ4; en GPUs de 8-12 GB solo con cuantizaciones IQ1-IQ2, con calidad muy degradada.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no se mencionan en la informacion proporcionada para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF (este) | 23,57B | no disponible | si | apache-2.0 | GGUF |
| richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic (base) | 23,57B | no disponible | si | apache-2.0 | safetensors |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF (quants estaticos) | 23,57B | no disponible | si | apache-2.0 | GGUF |
| Mistral-Small-3.2-24B-Instruct-2506 (original de Mistral AI) | ~24B | no disponible | si | no disponible en esta ficha | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "heretic"/"abliterated": se ha modificado el comportamiento de rechazo, por lo que puede generar contenido que el modelo original bloquearia. No es apto para produccion orientada al usuario final sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de ~24B; no se dispone de evaluaciones especificas de fidelidad para esta variante.
- La abliteration puede degradar capacidades generales (razonamiento, instrucciones) respecto al modelo original; no hay benchmarks publicados que lo cuantifiquen.
- Licencia: apache-2.0 declarada, pero la model card incluye tambien la etiqueta openrail++. Conviene verificar los terminos del modelo base antes de uso comercial.
- Idiomas: la lista de 24 idiomas proviene de metadatos; la calidad real por idioma no esta verificada, especialmente en idiomas de bajos recursos como nepalí o serbio.
- Longitud de contexto no documentada en la informacion proporcionada; no asumir la del modelo original sin verificar.
- Cuantizaciones IQ1 e IQ2 marcadas por el propio autor como "for the desperate" o de "very low quality"; no recomendadas para tareas que requieran precision.
- El repositorio pesa 253,6 GB; la descarga completa no es practica, conviene bajar solo el quant necesario.
- Fecha de creacion registrada en 2026, lo que puede indicar metadatos anomalos o posteriores a la consulta; verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
