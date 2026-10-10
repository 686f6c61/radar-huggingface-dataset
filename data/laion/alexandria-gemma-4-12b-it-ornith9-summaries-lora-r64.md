# laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r64

## Resumen

Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r64 es un adaptador LoRA de rango 64 desarrollado por LAION dentro del Project Alexandria, publicado el 9 de octubre de 2026. No es un modelo autonomo: se carga sobre el modelo base google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) y contiene unicamente las matrices de adaptacion aprendidas. Su funcion es generar resumenes cientificos estructurados que preserven el conocimiento factual de articulos de investigacion, de modo que ese conocimiento pueda reutilizarse mediante recuperacion, respuesta a preguntas y sintesis sin depender de la prosa original.

El problema que aborda es el coste y las restricciones de copyright asociadas a la reproduccion de texto cientifico. La motivacion se describe en el paper "Project Alexandria: Towards Freeing Scientific Knowledge from Copyright Burdens via LLMs" (arXiv:2502.19413). El adaptador aprende a producir representaciones (Knowledge Units y resumenes) que describen entidades, atributos y relaciones, facilitando que un agente distinga un resultado medido de una interpretacion. Los propios autores advierten que esta version no certifica que sus salidas esten libres de derechos: las auditorias de copia literal siguen detectando solapamiento sustancial con las fuentes.

El adaptador se entreno mediante destilacion desde el profesor ornith-ai/Ornith-1.5-9B sobre 736 ejemplos procedentes de 736 articulos, una sola epoca y 92 actualizaciones del optimizador, con un dataset congelado de resumenes cientificos. La evaluacion publicada reporta una exactitud de 90,10 % en un benchmark retenido de 97 articulos y 970 preguntas de opcion multiple, frente al 87,63 % del modelo base sin LoRA, una mejora de +2,47 puntos porcentuales cuyo intervalo de confianza emparejado (-0,93 a +5,36) incluye el cero. La arquitectura subyacente es la del modelo Gemma 4 de 12B en su variante instruction-tuned, con soporte de canal de pensamiento nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (familia Gemma 4); se aplica a las proyecciones de atencion q/k/v/o y a las proyecciones MLP gate/up/down |
| Parametros totales | Aproximadamente 12.000 millones en el modelo base google/gemma-4-12B-it; el adaptador LoRA (rango 64) ocupa 1,1 GB en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el repositorio solo contiene pesos safetensors en formato PEFT. Las cuantizaciones aplicables son las del modelo base Gemma 4 |
| Idiomas soportados | Ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-12B-it, un transformer decoder-only de la familia Gemma 4 con canales de pensamiento nativos. La LoRA tiene rango 64, alpha 128 y dropout 0,05, e inyecta matrices en las proyecciones de consulta, clave, valor y salida de la atencion, asi como en las proyecciones gate, up y down del bloque MLP. El entrenamiento uso BF16 en el modelo base con checkpointing de gradientes, flex attention y una funcion de perdida de entropia cruzada recortada ponderada por tokens de asistente. Los tokens de origen y de prompt se enmascararon de la perdida, sin truncamiento de origen ni de destino. Se empleo el optimizador AdamW con tasa de aprendizaje 2e-5, weight decay 0,01, un 5 % de warmup seguido de decaimiento coseno, y un tamano de lote efectivo de ocho.

Los datos de entrenamiento consisten en 736 ejemplos procedentes de 736 articulos cientificos, tomados del dataset congelado de destilacion ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004 (revision 1ab11230eb1928c790a9f8e0a13ec2563565dc82). El profesor fue ornith-ai/Ornith-1.5-9B (revision 489cb97981b8654bcfcf30ce1f94ed1b62e07b53), que genero los objetivos con decodificacion autorregresiva nativa en BF16 sin DFlash. La tarea es exclusivamente de generacion de resumenes cientificos: no se entreno ningun adaptador de revision de calidad o correccion. La respuesta original del generador y su razonamiento asociado se supervisaron mediante la plantilla nativa de canal de pensamiento de Gemma. El benchmark separado de 97 articulos y 970 preguntas se excluyo del entrenamiento por identidad, titulo, hashes y solapamiento sustancial de texto. Los 736 objetivos no pasaron el validador estricto de esquema de evidencia anidada y no recibieron correccion semantica de calidad.

## Capacidades

- Generacion de resumenes cientificos estructurados a partir de articulos de investigacion.
- Extraccion de conocimiento factual en forma de Knowledge Units: entidades, atributos, dosis, efectos medidos, poblacion y incertidumbre como campos diferenciados.
- Distincion entre resultados medidos e interpretaciones dentro del texto de origen.
- Modo de pensamiento (thinking mode) mediante el canal de pensamiento nativo de Gemma 4; la evaluacion publicada se realizo con thinking habilitado.
- Adecuacion para tareas de recuperacion y respuesta a preguntas cuando la representacion generada se pasa a un contestador externo.
- Idiomas: unicamente ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del adaptador.
- Capacidades de vision, audio o multimodalidad: no disponible.

## Casos de uso

- Construccion de bases de conocimiento cientifico: el adaptador genera resumenes organizados que pueden indexarse y consultarse mediante recuperacion, reduciendo la dependencia del texto original protegido por derechos de autor.
- Respuesta a preguntas sobre literatura cientifica: combinado con un contestador externo (en la evaluacion, Qwen2.5-7B-Instruct) y cuatro opciones de respuesta, alcanzo un 90,10 % de exactitud sobre el benchmark retenido de 970 preguntas.
- Revision sistematica asistida: convertir lotes de articulos en resumenes homogeneos para agilizar la extraccion de hallazgos, condiciones experimentales y magnitudes.
- Sintesis de evidencia: agregar Knowledge Units de varios articulos para comparar intervenciones, poblaciones y efectos medidos en un mismo dominio.
- Alimentacion de pipelines de agentes cientificos: el resumen estructurado sirve como entrada intermedia para que un agente recupere hechos y siga un identificador de fuente para verificacion.
- Auditoria de contenido protegido: comparar el resumen generado con el texto fuente para detectar solapamiento literal, dado que los autores advierten que la salida no esta certificada como libre de derechos.
- Extraccion de metadatos estructurados: identificar dosis, poblacion, incertidumbre y relaciones entre variables como campos separados para su uso en bases de datos.

## Benchmarks y rendimiento

Los resultados siguientes corresponden a la evaluacion declarada por el autor en el model-index y en la model card. La evaluacion emplea un contestador fijo Qwen2.5-7B-Instruct que recibe la representacion generada y responde preguntas de cuatro opciones; cada articulo aporta diez preguntas. Las generaciones fallidas cuentan como diez respuestas erroneas y las respuestas invalidas permanecen en el denominador. Los intervalos de confianza usan 10.000 remuestreos bootstrap emparejados por articulo.

| Generador | Aciertos / 970 | Exactitud QA | Intervalo 95 % | Articulos fallidos | Media de palabras por resumen |
|---|---:|---:|---|---:|---:|
| Gemma 4 12B IT sin LoRA, thinking habilitado | 850 | 87,63 % | 85,26-89,90 % | 0 | 1070 |
| Gemma 4 12B IT + Ornith-distilled rank 64, una epoca | 874 | 90,10 % | 86,49-93,09 % | 2 | 1679 |
| Gemma 4 12B IT + Ornith-distilled rank 128, una epoca | 755 | 77,84 % | 70,52-84,64 % | 16 | 1364 |

El adaptador de rango 64 mejora en +2,47 puntos porcentuales respecto al control base emparejado, con un intervalo de confianza emparejado del 95 % de -0,93 a +5,36 puntos, que incluye el cero. Los autores atribuyen parte del resultado a que los resumenes generados son mas largos y a fallos de formato. El model-index reporta una unica metrica: exactitud de 90,10309278350516 % en el dataset alexandria-97-mcq970, marcada como no verificada.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano del modelo base (aproximadamente 12.000 millones de parametros); no estan publicadas en la informacion proporcionada.

- VRAM estimada para inferencia del modelo base: en BF16, aproximadamente 24 GB; en cuantizacion de 8 bits, en torno a 12-13 GB; en cuantizacion de 4 bits, alrededor de 7-8 GB. El adaptador anade un consumo marginal (1,1 GB en disco).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en BF16 sin cuantizar y con contexto amplio.
- GPU de consumo: el modelo base cuantizado a 4 bits encaja en tarjetas de 12-16 GB, como RTX 3060 12 GB, RTX 4070 Ti o RTX 4090 (24 GB, que permite BF16 con margen limitado).
- Opciones de despliegue: la libreria declarada es `peft`, por lo que la carga requiere transformes o un servidor compatible con adaptadores PEFT. vLLM y TGI soportan adaptadores LoRA, aunque no se indica compatibilidad explicita en la model card; llama.cpp y Ollama no aparecen mencionados y requeririan fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas directa disponible en la informacion proporcionada es frente al propio modelo base y a la variante de mayor rango del mismo adaptador.

| Modelo | Parametros | Contexto | Exactitud QA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r64 | ~12B (base) + LoRA rango 64 | No disponible | 90,10 % | cc-by-4.0 | Adaptador en HuggingFace |
| Gemma 4 12B IT sin LoRA | ~12B | No disponible | 87,63 % | Segun el modelo base | Modelo base en HuggingFace |
| Alexandria ... LoRA rango 128 | ~12B (base) + LoRA rango 128 | No disponible | 77,84 % | cc-by-4.0 | No indicado como publicado en esta ficha |
| ornith-ai/Ornith-1.5-9B (profesor) | ~9B | No disponible | No evaluado en esta comparativa | No disponible | Modelo profesor en HuggingFace |

No se dispone de datos de benchmarks para el profesor Ornith-1.5-9B ni para alternativas externas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base google/gemma-4-12B-it (revision fijada 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) para funcionar.
- La mejora de exactitud (+2,47 puntos) tiene un intervalo de confianza emparejado del 95 % que incluye el cero, por lo que la superioridad frente al base no es concluyente con estos datos.
- Los autores advierten expresamente que esta version no certifica que las salidas esten libres de derechos de autor: las auditorias de copia literal siguen detectando un solapamiento sustancial con las fuentes.
- La exactitud QA mide utilidad para responder preguntas, no correccion factual completa ni autorizacion legal.
- Los 736 objetivos de entrenamiento no pasaron el validador estricto de esquema de evidencia anidada y no recibieron correccion semantica de calidad.
- Solo se soporta ingles.
- El modelo genera resumenes mas largos que el control (1679 frente a 1070 palabras de media) y registra fallos de formato, lo que afecta al resultado.
- No se entreno ningun adaptador de revision de calidad o correccion, solo tarea de generacion.
- La licencia cc-by-4.0 exige atribucion; conviene verificar las condiciones del modelo base Gemma 4 para uso comercial.
- Riesgo de sesgo y alucinacion: no documentado en la informacion proporcionada, pero aplicable a cualquier modelo generativo de resumenes cientificos.
- Las politicas de acceso de las fuentes originales, sus terminos de uso y la revision de las salidas siguen siendo responsabilidad del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r64
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo profesor: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset de destilacion: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004
- Revision fijada del dataset: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004/tree/1ab11230eb1928c790a9f8e0a13ec2563565dc82
- Paper de Project Alexandria: https://arxiv.org/abs/2502.19413v2
- Configuracion de entrenamiento: training_config.json (referenciado en la model card)
- Manifiesto de datos nativo: training/manifest.json (referenciado en la model card)
- Procedencia de pesos y codigo: provenance.json (referenciado en la model card)
