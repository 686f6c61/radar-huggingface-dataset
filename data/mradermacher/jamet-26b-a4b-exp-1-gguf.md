# mradermacher/Jamet-26B-A4B-EXP-1-GGUF

## Resumen

`mradermacher/Jamet-26B-A4B-EXP-1-GGUF` es una reproducción en formato GGUF del modelo `Hastagaras/Jamet-26B-A4B-EXP-1`, publicada por el usuario mradermacher (responsable de nethype GmbH), un cuantizador conocido por distribuir versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a cuantizaciones de precisión reducida orientadas a inferencia local en GPU de consumo y CPU.

El modelo base tiene 25.233.142.046 parámetros (unos 25,2 mil millones) según los datos reales de safetensors, y su nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token, siguiendo la convención de nomenclatura tipo "A4B" popularizada por otras familias. Esta característica no está confirmada en la información disponible y debe verificarse en la model card del modelo original. El repositorio ocupa 90,8 GB e incluye tanto cuantizaciones de texto como ficheros `mmproj` (proyector multimodal), lo que indica que el modelo base probablemente acepta entradas de imagen además de texto.

Su relevancia es limitada pero concreta: se trata de una etiqueta "EXP" (experimental), sin descargas ni valoraciones en el momento de la consulta, y sin licencia declarada. Resulta útil únicamente como vía para ejecutar el modelo base en hardware modesto mediante GGUF, siempre que el usuario acepte la ausencia de garantías, de documentación técnica y de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "A4B" sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 B), dato real de safetensors |
| Parametros activos | aproximadamente 4.000 millones según la nomenclatura del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamano del repositorio | 90,8 GB en total |
| Modalidad | texto y, segun los ficheros mmproj incluidos, probablemente tambien vision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `Hastagaras/Jamet-26B-A4B-EXP-1` mas alla de lo que sugiere su nombre. La nomenclatura "26B-A4B" es coherente con un transformer de tipo mezcla de expertos (MoE) de aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token, pero esta interpretacion no aparece confirmada en la informacion proporcionada y debe contrastarse con la model card original. La presencia de ficheros `mmproj` en el repositorio GGUF indica la existencia de un codificador visual o proyector multimodal en el modelo base, algo poco habitual en modelos puramente de texto.

Respecto al entrenamiento, no hay datos disponibles: se desconocen el numero de tokens, la composicion del dataset, la posible aplicacion de RLHF o DPO y cualquier innovacion tecnica (atencion lineal, decodificacion especulativa, modos de razonamiento). El unico dato tecnico verificable del proceso de publicacion es que se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), es decir, sin calibracion con imatrix. El propio autor advierte de que las cuantizaciones ponderadas con imatrix "parecen no estar disponibles" en el momento de la publicacion, por lo que la calidad de las cuantizaciones de baja precision podria ser inferior a la de variantes calibradas equivalentes.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo base esta ajustado para dialogos multi-turno.
- Procesamiento de imagenes: la inclusion de ficheros `mmproj` sugiere soporte multimodal (vision-lenguaje), aunque no se detalla la resolucion ni el tipo de tareas visuales soportadas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructura de inferencia estandar (por ejemplo, Inference Endpoints de Hugging Face).
- Ejecucion local en CPU y GPU mediante GGUF: las cuantizaciones Q2_K a Q8_0 permiten desplegar el modelo en hardware muy diverso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: la cuantizacion Q4_K_S (15,6 GB) permite ejecutar un modelo de 25,2 B de parametros en una unica GPU de 24 GB, lo que habilita probar dialogos multi-turno sin depender de APIs externas ni de presupuesto de nube.
- Investigacion sobre cuantizacion: el repositorio ofrece un rango amplio de tipos (Q2_K hasta Q8_0) sobre el mismo modelo, lo que permite reproducir estudios de degradacion de perplejidad segun el nivel de cuantizacion.
- Despliegue en equipos sin GPU dedicada: las variantes Q2_K y Q3_K, combinadas con llama.cpp u Ollama en modo CPU, permiten ejecutar el modelo en estaciones de trabajo convencionales con 16-32 GB de RAM.
- Experimentacion con modelos multimodales en local: los ficheros `mmproj` permiten cargar el proyector visual en llama.cpp y probar flujos de imagen mas texto sin conexion externa.
- Evaluacion comparativa de arquitecturas MoE: si se confirma la naturaleza A4B, sirve como punto de comparacion frente a otros MoE de tamano similar en pruebas de latencia por token activo.
- Pruebas de integracion en pipelines de inferencia compatibles con GGUF: validar el comportamiento del modelo en herramientas como LM Studio, koboldcpp o text-generation-webui antes de decidir un despliegue mayor.
- Analisis de riesgos en modelos sin licencia declarada: util como caso de estudio interno sobre la importancia de verificar licencias y trazabilidad antes de incorporar pesos a un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (25,2 B) y del tamano de fichero confirmado para Q4_K_S; no proceden de mediciones publicadas por el autor.

- Cuantizacion F16 / x-f16: aproximadamente 50 GB de pesos. Requiere A100 80 GB, H100 o dos GPU de 24 GB en paralelo.
- Q8_0: aproximadamente 27 GB de pesos. Encaja en A100 40 GB o en dos GPU de 24 GB.
- Q6_K: aproximadamente 21 GB. Cabe en una RTX 3090 o RTX 4090 de 24 GB dejando poco margen para contexto.
- Q5_K_M / Q5_K_S: aproximadamente 18 GB. Adecuado para GPU de 24 GB con contexto moderado.
- Q4_K_M / Q4_K_S: el fichero Q4_K_S confirmado ocupa 15,6 GB. Cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB) con contexto corto, y en GPU de 12 GB con descarga parcial de capas a CPU.
- Q3_K_L / Q3_K_M / Q3_K_S: aproximadamente 11-13 GB. Apto para GPU de 12-16 GB.
- Q2_K: aproximadamente 9-10 GB. Ejecutable en GPU de 8-12 GB o en CPU con RAM suficiente.
- Proyector multimodal: 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16), que se suman a los requisitos anteriores.
- GPU recomendadas: A100 80 GB o H100 para F16; A100 40 GB para Q8_0; RTX 3090/4090 para Q4-K y Q5-K; RTX 4080 o equivalentes de 16 GB para Q3_K.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la via recomendada.
- Latencia y throughput: no disponible. En el caso de ser un MoE con ~4 B de parametros activos, el coste por token estaria mas proximo al de un modelo de 4 B que al de uno denso de 25 B, pero esto no puede confirmarse con los datos disponibles.

## Comparativa con modelos similares

No hay datos verificados de rendimiento para `Jamet-26B-A4B-EXP-1`, por lo que la comparativa solo puede ser estructural. Se incluyen modelos de tamano y planteamiento comparables a titulo orientativo.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| Jamet-26B-A4B-EXP-1 (este) | 25,2 B | ~4 B (sin confirmar) | no disponible | no disponible | si (este repositorio) |
| Qwen3-30B-A3B | ~30 B | ~3 B | 128 K (segun documentacion publica) | Apache 2.0 | si |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32 K | Apache 2.0 | si |
| Gemma 3 27B | ~27 B | denso | 128 K | Gemma Terms | si |

La comparativa de rendimiento (MMLU, HumanEval, GSM8K y similares) no esta disponible para el modelo objeto de esta ficha, y por tanto no se puede establecer una jerarquia de calidad frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de esta cuantizacion, lo que impide determinar si el uso comercial esta permitido. No debe utilizarse en produccion sin aclarar este punto con el autor original.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo.
- Idiomas: unica lengua declarada, el ingles. No hay soporte documentado de castellano ni de otras lenguas.
- Modelo experimental: la etiqueta "EXP" y la ausencia de descargas y valoraciones sugieren un artefacto de prueba, no una publicacion estable ni mantenida.
- Cuantizaciones estaticas sin imatrix: el autor indica que no ha generado cuantizaciones ponderadas, lo que puede traducirse en una perdida de calidad superior a la habitual en los niveles bajos (Q2_K, Q3_K).
- Fechas de publicacion inusuales (creado y actualizado el 20 de septiembre de 2026): conviene verificar la integridad y procedencia de los ficheros antes de usarlos.
- Ausencia de datos de entrenamiento: se desconoce la composicion del dataset, si hubo filtrado de contenido y que sesgos pueden haberse heredado.
- Contexto desconocido: al no declararse la longitud de contexto, no es posible planificar aplicaciones con ventanas largas ni estimar el consumo de memoria asociado.
- Verificacion pendiente de la arquitectura: la hipotesis MoE con ~4 B activos proviene unicamente del nombre del modelo y debe confirmarse con la model card del autor original.
- Resultados de la busqueda web no relevantes: las fuentes consultadas no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-GGUF
- Modelo base: https://huggingface.co/Hastagaras/Jamet-26B-A4B-EXP-1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Jamet-26B-A4B-EXP-1-GGUF
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
