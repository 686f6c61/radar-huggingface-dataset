# nater2ed/nllb-wayuu-v26-unsloth

## Resumen

nater2ed/nllb-wayuu-v26-unsloth es un adaptador LoRA (PEFT) entrenado sobre el modelo base facebook/nllb-200-distilled-1.3B, el modelo de traduccion automatica multilingue de Meta AI presentado en 2022 dentro de la familia No Language Left Behind (NLLB). El identificador del repositorio sugiere que el ajuste fino esta orientado al wayuu (wayuunaiki), una lengua indigena arahuaca hablada principalmente en la peninsula de La Guajira (Colombia y Venezuela), aunque la model card no lo confirma de forma explicita.

El adaptador se ha entrenado con Unsloth, una libreria de optimizacion de fine-tuning que reduce el uso de memoria y acelera el entrenamiento de modelos transformer mediante kernels personalizados y tecnicas de atencion eficiente. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (1.4 GB), no el modelo completo, por lo que su uso requiere cargar primero el modelo base NLLB-200 distilled de 1.300 millones de parametros y aplicar el adaptador encima.

El interes de esta ficha es doble: por un lado, documenta un ejemplo de adaptacion de un modelo de traduccion masivo a una lengua de bajos recursos; por otro, sirve como referencia tecnica para quien quiera reproducir el proceso o evaluar la viabilidad de usar NLLB como base para lenguas minorizadas. La model card esta practicamente vacia (plantilla por defecto sin rellenar), por lo que la mayor parte de los datos tecnicos se infieren del modelo base y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (NLLB-200 distilled) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.300 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base NLLB admite secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion a 8 y 4 bits) |
| Idiomas soportados | no disponible (presumiblemente wayuu y espanol, segun el nombre del repositorio; el modelo base cubre 200 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base facebook/nllb-200-distilled-1.3B es un transformer encoder-decoder con atencion multi-cabeza estandar, destilado a partir del modelo NLLB-200 de 54.000 millones de parametros. Emplea tokenizacion SentencePiece con vocabulario compartido y tokens de identificacion de idioma para dirigir la traduccion. Fue entrenado con datos multilingues masivos y tecnicas de destilacion para reducir el coste computacional manteniendo una calidad de traduccion razonable en 200 idiomas.

Sobre este modelo, el autor ha aplicado un adaptador LoRA mediante Unsloth. Los metadatos indican que se trata de un adaptador PEFT (version 0.21.2) con rango y alpha no especificados en la informacion disponible. No se documentan los datos de entrenamiento, el numero de pasos, la composicion del corpus ni si se aplicaron tecnicas de aumento de datos o filtrado. Tampoco se indica si el ajuste se hizo solo en el decoder, en el encoder o en ambos, ni si se congelaron las proyecciones de atencion cruzada. La ausencia de esta informacion impide evaluar la calidad del ajuste o su reproducibilidad.

## Capacidades

- Traduccion automatica entre el wayuu (wayuunaiki) y presumiblemente el espanol, segun el nombre del repositorio; no confirmado en la model card.
- Traduccion multilingue heredada del modelo base NLLB-200 (200 idiomas), aunque el ajuste LoRA puede haber degradado el rendimiento en idiomas no vistos durante el fine-tuning.
- Generacion de texto condicionada por token de idioma de origen y destino, tal como funciona NLLB.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- No se documenta capacidad de seguir instrucciones conversacionales; NLLB es un modelo de traduccion, no un modelo de chat.

## Casos de uso

- Traduccion de documentacion administrativa al wayuu: el adaptador puede traducir textos oficiales, formularios o comunicados desde el espanol, facilitando el acceso a servicios publicos a hablantes de wayuunaiki en La Guajira.
- Preservacion linguistica y digitalizacion: uso del modelo para generar versiones en wayuu de materiales educativos o corpus textuales, contribuyendo a mantener la lengua en formatos digitales.
- Subtitulado y doblaje comunitario: traduccion de guiones o subtitulos de contenido audiovisual para radios y televisiones comunitarias wayuu.
- Atencion al ciudadano en lenguas indigenas: integracion en sistemas de traduccion asitida para oficinas de registro civil, salud o justicia donde se requiera atender a poblacion wayuuhablante.
- Investigacion en traduccion de lenguas de bajos recursos: el adaptador sirve como punto de partida para experimentos de evaluacion de LoRA sobre NLLB en lenguas minorizadas, comparando con ajuste completo o con otros adaptadores.
- Traduccion de contenido web y redes sociales: despliegue en un servicio de traduccion ligero que permita a creadores de contenido wayuu publicar en espanol y viceversa.
- Herramientas de aprendizaje de la lengua: generacion de pares de frase espanol-wayuu para aplicaciones de aprendizaje de vocabulario o ejercicios de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 1.4 GB en disco y requiere cargar el modelo base NLLB-200 distilled de 1.3B parametros para funcionar.
- VRAM estimada para inferencia con el modelo base en fp16: aproximadamente 2.6-3 GB solo para los pesos, mas overhead de activaciones y cache; en la practica se recomienda al menos 6-8 GB de VRAM para secuencias largas.
- En cuantizacion de 8 bits: aproximadamente 1.5-2 GB de VRAM para los pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia. Para entrenamiento del adaptador, se recomienda al menos 12-16 GB (RTX 4080, RTX 4090, A10, A100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), vLLM (soporte de adaptadores LoRA), TGI (soporte de adaptadores), llama.cpp no aplica directamente porque NLLB no esta soportado en GGUF de forma nativa; Ollama no soporta NLLB de forma estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nater2ed/nllb-wayuu-v26-unsloth | Adaptador sobre 1.3B | no disponible (base: 512) | no disponible (presumiblemente wayuu-es) | no disponible | safetensors (LoRA) |
| facebook/nllb-200-distilled-1.3B | 1.3B | 512 tokens | 200 | CC-BY-NC 4.0 | safetensors, bin |
| facebook/m2m100_1.2B | 1.2B | 1024 tokens | 100 | MIT | safetensors, bin |
| Helsinki-NLP/opus-mt-es-way | no disponible | 512 tokens | es-way | CC-BY 4.0 | safetensors, bin |

La comparativa con OPUS-MT es especialmente relevante porque existen modelos especificos espanol-wayuu en la familia Marian, con licencia permisiva y tamano mucho menor (decenas de millones de parametros), lo que los hace mas ligeros para despliegue aunque con menor cobertura multilingue.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- La licencia no esta especificada, lo que impide determinar si el uso comercial esta permitido. El modelo base NLLB-200 tiene licencia CC-BY-NC 4.0, que restringe el uso comercial; el adaptador hereda esta restriccion en la practica salvo que el autor indique lo contrario.
- Riesgo de alucinacion y de traducciones incorrectas: como todo modelo de traduccion neuronal, puede producir salidas fluidas pero semanticamente erroneas, especialmente en terminos tecnicos o culturalmente especificos del wayuu.
- El ajuste LoRA puede haber degradado el rendimiento multilingue del modelo base en idiomas distintos del par entrenado; no se ha documentado ninguna evaluacion al respecto.
- No hay garantia de que el adaptador cubra variantes dialectales del wayuunaiki ni registros formales e informales.
- El modelo no es conversacional: no debe usarse como chatbot ni como asistente general.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.
- La fecha de creacion (2026-11-11) es futura respecto a la mayoria de referencias actuales, lo que sugiere que el repositorio es muy reciente o que los metadatos pueden ser anomalos.
- No se documenta el impacto ambiental ni el coste computacional del entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nater2ed/nllb-wayuu-v26-unsloth
- Modelo base NLLB-200 distilled 1.3B: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- PEFT (repositorio): https://github.com/huggingface/peft
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
