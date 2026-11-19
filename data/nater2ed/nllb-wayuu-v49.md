# nater2ed/nllb-wayuu-v49

## Resumen

nater2ed/nllb-wayuu-v49 es un adaptador LoRA (PEFT) entrenado sobre el modelo base facebook/nllb-200-distilled-1.3B, el modelo de traduccion automatica multilingue de Meta AI presentado en el paper "No Language Left Behind" (NLLB). El nombre del repositorio sugiere un ajuste fino orientado al wayuu (wayuunaiki), una lengua indigena arahuaca hablada principalmente en la peninsula de La Guajira (Colombia y Venezuela), aunque la model card no confirma explicitamente el par de idiomas ni el corpus utilizado. El adaptador se ha entrenado con la libreria Unsloth segun las etiquetas del repositorio, lo que indica un flujo de entrenamiento optimizado para bajo consumo de memoria.

El modelo resuelve, en principio, la necesidad de traduccion automatica hacia o desde una lengua de bajos recursos que no esta cubierta de forma especifica en el checkpoint original de NLLB. Al tratarse de un adaptador y no de un modelo completo, su valor practico depende de cargarlo junto al modelo base de 1.3B parametros, lo que abarata el almacenamiento (0.4 GB frente a los varios GB del modelo completo) y permite mantener el resto de capacidades multilingues del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta un caso tipico de adaptacion de NLLB a lenguas minorizadas mediante LoRA; por otro, advierte de que la informacion publicada por el autor es practicamente inexistente (sin licencia, sin idiomas declarados, sin datos de entrenamiento ni evaluacion), lo que limita seriamente su uso en produccion sin una validacion propia. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto de investigacion personal mas que un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (NLLB-200 distilled) |
| Parametros totales | Aproximadamente 1.3B en el modelo base; el adaptador LoRA anade un numero reducido de parametros entrenables (no disponible el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base NLLB-200 soporta secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles; por el nombre se infiere wayuu, pero no esta confirmado en la model card |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2 |
| Modelo base | facebook/nllb-200-distilled-1.3B |
| Tamano del repositorio | 0.4 GB |
| Herramienta de entrenamiento | Unsloth (segun etiquetas) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre facebook/nllb-200-distilled-1.3B, un transformer encoder-decoder con atencion estandar (no MoE ni SSM) destilado de la familia NLLB-200, disenado originalmente para traduccion entre 200 idiomas. La tecnica de ajuste es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, reduciendo drasticamente el numero de parametros entrenables y el coste de memoria. El uso de Unsloth, segun las etiquetas del repositorio, indica un pipeline de entrenamiento optimizado para GPUs de consumo.

No hay informacion publicada sobre el corpus de entrenamiento: se desconoce el numero de pares de traduccion, la procedencia de los datos (posiblemente corpus religiosos, textos comunitarios o traducciones manuales, habituales en wayuu), el numero de tokens vistos ni si se aplicaron tecnicas de aumento de datos o filtrado. Tampoco se documentan hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epochs) ni si hubo validacion humana. La model card es una plantilla generica sin rellenar, por lo que cualquier afirmacion sobre calidad o cobertura idiomatica debe tratarse como no verificada.

## Capacidades

- Traduccion automatica (presuntamente entre espanol y wayuu, o entre wayuu y otros idiomas cubiertos por NLLB), aunque el par exacto no esta confirmado.
- Hereda las capacidades multilingues del modelo base NLLB-200 distilled, que cubre 200 idiomas, aunque el adaptador puede degradar el rendimiento en idiomas no vistos durante el ajuste fino.
- Generacion de texto condicionada a tarea de traduccion (seq2seq); no esta pensado como modelo conversacional.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo "thinking".
- No se documenta capacidad de agentes.

## Casos de uso

- Traduccion de documentacion comunitaria al wayuu: el adaptador permitiria, previa validacion, traducir materiales educativos o administrativos del espanol al wayuunaiki, aprovechando el conocimiento multilingue del modelo base y el ajuste especifico.
- Preservacion linguistica y digitalizacion: util para proyectos academicos que necesiten generar borradores de traduccion de textos historicos o etnograficos en wayuu, siempre con revision por hablantes nativos.
- Sistemas de atencion ciudadana bilingue: en regiones como La Guajira, podria integrarse en un pipeline de traduccion para formularios o avisos oficiales, con supervision humana obligatoria dada la falta de evaluacion publicada.
- Investigacion en adaptacion de NLLB a lenguas de bajos recursos: sirve como punto de partida reproducible para comparar tecnicas LoRA frente a ajuste completo en lenguas minorizadas.
- Generacion de subtitulos o transcripciones traducidas: combinado con un modelo de reconocimiento de voz, podria traducir contenido audiovisual al wayuu en entornos educativos.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador de 0.4 GB sobre un modelo de 1.3B, puede desplegarse en una GPU de consumo para experimentacion, no para produccion sin validacion.
- Evaluacion comparativa de calidad de traduccion en lenguas indigenas: util como artefacto de referencia en estudios de traduccion automatica de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni evaluaciones humanas, y no hay datos que permitan comparar el adaptador con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.3B en fp16 requiere aproximadamente 2.6-3 GB; en 8 bits, alrededor de 1.5 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA anade una sobrecarga minima (decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en fp16 y en 4 GB o mas con cuantizacion de 8 bits.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), vLLM no soporta directamente adaptadores LoRA de encoder-decoder de forma estable en todas las versiones, por lo que se recomienda transformers o TGI con soporte de PEFT; llama.cpp no es adecuado para NLLB encoder-decoder sin conversion especifica.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nater2ed/nllb-wayuu-v49 | ~1.3B (base) + LoRA | No disponible (base: 512 tokens) | No disponible (presuntamente wayuu) | No disponible | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-1.3B | 1.3B | 512 tokens | 200 | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| facebook/m2m100_418M | 418M | 1024 tokens | 100 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-es-... | ~77M por par | 512 tokens | 2 por modelo | CC-BY 4.0 | Hugging Face |

El adaptador no aporta datos de rendimiento que permitan una comparacion cuantitativa; la comparativa se limita a parametros y disponibilidad. Frente a NLLB base, la ventaja es la especializacion potencial en wayuu; frente a OPUS-MT, la ventaja es el multilingue subyacente, aunque OPUS-MT ofrece licencias mas permisivas y modelos mas ligeros.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar, sin datos de entrenamiento, evaluacion ni uso previsto.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; el modelo base NLLB-200 tiene licencia CC-BY-NC 4.0, lo que ya restringe el uso comercial del conjunto.
- Riesgo de alucinacion y traducciones incorrectas: sin evaluacion publicada, no hay garantia de fidelidad en wayuu; las lenguas de bajos recursos son propensas a errores graves.
- Sesgos desconocidos: no se documenta la composicion del corpus, por lo que pueden existir sesgos dialectales o de registro.
- Cobertura idiomatica incierta: no se confirma el par de idiomas ni la direccion de traduccion.
- Sin soporte comunitario: cero descargas y cero likes, sin issues ni discusiones.
- No apto para produccion sin validacion con hablantes nativos y pruebas de calidad propias.
- El adaptador puede degradar el rendimiento multilingue del modelo base si se usa fuera del par para el que fue entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nater2ed/nllb-wayuu-v49
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper NLLB-200: https://arxiv.org/abs/2207.04672
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
