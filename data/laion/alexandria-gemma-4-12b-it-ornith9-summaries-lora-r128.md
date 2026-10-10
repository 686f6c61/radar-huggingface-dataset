# laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r128

## Resumen

Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r128 es un adaptador LoRA de rango 128 publicado por LAION dentro del proyecto Alexandria. No es un modelo autonomo: se carga sobre google/gemma-4-12B-it y contiene unicamente las matrices aprendidas del adaptador (2,2 GB de safetensors en el repositorio). Su tarea es generar resumenes cientificos a partir de articulos, destilando el comportamiento de ornith-ai/Ornith-1.5-9B como modelo profesor.

El objetivo del proyecto es convertir el conocimiento de los articulos cientificos en representaciones reutilizables (Knowledge Units y resumenes organizados) que reduzcan la dependencia de la prosa original, segun el articulo arXiv:2502.19413. Es relevante ahora porque la destilacion abarata la creacion de extractores: este adaptador se entreno con 736 ejemplos de 736 articulos, una sola epoca y 92 actualizaciones del optimizador.

El resultado publicado es, sin embargo, peor que el del modelo base. Frente al 87,63% de exactitud del Gemma 4 12B IT sin LoRA, este adaptador obtiene el 77,84% en el mismo conjunto de 970 preguntas, una caida de 9,79 puntos porcentuales. La propia model card atribuye el descenso a resumenes mas largos y a fallos de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (peft) sobre un transformer decoder-only de la familia Gemma 4; se aplica a las proyecciones de atencion q/k/v/o y a las proyecciones MLP gate/up/down |
| Parametros totales | 12B en el modelo base google/gemma-4-12B-it; el adaptador ocupa 2,2 GB en el repositorio (recuento exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la hereda del modelo base; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y alpha 256, con dropout 0,05, insertado en las proyecciones de atencion q/k/v/o y en las proyecciones gate/up/down del MLP del modelo base. El entrenamiento uso AdamW con tasa de aprendizaje 2e-5, weight decay 0,01, un 5% de warmup seguido de decaimiento coseno, base en BF16, gradient checkpointing, flex attention y cut cross entropy ponderada por tokens de asistente. El lote efectivo fue de ocho, los tokens de origen y de prompt quedaron enmascarados en la perdida y no se aplico truncamiento ni al origen ni al destino. El modelo base esta fijado a la revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7 y el profesor a la revision 489cb97981b8654bcfcf30ce1f94ed1b62e07b53.

Los datos de entrenamiento provienen del dataset congelado ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004 (736 ejemplos, uno por articulo). El profesor Ornith genero las respuestas con decodificacion autorregresiva nativa en BF16, sin DFlash, y se supervisaron tanto la respuesta generada como su razonamiento asociado mediante la plantilla de canal de pensamiento nativa de Gemma. La model card indica que se trata de objetivos sin corregir: los 736 ejemplos tienen narrativa y razonamiento legibles, pero ninguno paso el validador estricto de esquema de evidencia anidada, y no hubo correccion semantica de calidad. Solo se entreno la tarea generadora de resumenes; no existe adaptador de revision de calidad ni de correccion. El conjunto de evaluacion de 97 articulos y 970 preguntas se excluyo del entrenamiento por identidad, titulo, hashes y solapamiento sustancial de texto.

## Capacidades

- Generacion de resumenes cientificos estructurados a partir de articulos completos.
- Destilacion de razonamiento: emite trazas de pensamiento siguiendo la plantilla nativa de Gemma 4 cuando el modo thinking esta activado.
- Extraccion de conocimiento cientifico orientada a representaciones tipo Knowledge Unit (entidades, atributos y relaciones).
- Generacion de texto conversacional heredada del modelo base google/gemma-4-12B-it.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (se heredaria, en su caso, del modelo base).
- Capacidades de agente y razonamiento multi-paso: no disponible como capacidad especifica del adaptador.
- Capacidades multilingues: solo ingles (tag de idioma `en`).
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Resumen de literatura cientifica a escala: el adaptador convierte articulos completos en resumenes organizados que sirven como primer nivel de triaje antes de la lectura completa; su contexto heredado del base permite procesar documentos largos sin truncamiento (el entrenamiento no aplico truncamiento de origen).
- Alimentacion de pipelines de recuperacion aumentada: los resumenes generados se indexan como documentos intermedios para que un sistema RAG responda preguntas sobre la literatura sin exponer el texto original completo.
- Construccion de Knowledge Units: el modelo produce descripciones de intervenciones, dosis, efectos medidos, poblaciones e incertidumbre, utiles para construir bases de datos estructuradas de hallazgos.
- Comparacion de resultados entre articulos: al normalizar el contenido en resumenes con estructura estable, se pueden contrastar hallazgos de papers distintos con herramientas de diff o de extraccion de tablas.
- Preprocesado documental en flujos de investigacion reproducibles: dado el bajo coste del adaptador (rango 128 sobre un modelo de 12B), se puede desplegar en una unica GPU para procesar lotes nocturnos de articulos.
- Generacion de material divulgativo interno: partiendo de un articulo, el modelo redacta un resumen tecnico que un revisor humano edita; la model card advierte de que la revision de salida sigue siendo necesaria.
- Auditoria de derechos de autor: permite comprobar experimentalmente el grado de solapamiento literal entre el resumen generado y la fuente, aunque la propia model card senala que las auditorias internas siguen encontrando solapamiento sustancial.

## Benchmarks y rendimiento

Evaluacion con un respondiente fijo Qwen2.5-7B-Instruct sobre el conjunto retenido de 97 articulos y 970 preguntas de eleccion multiple (10 preguntas por articulo), con modo thinking activado. Cada generacion de articulo fallida cuenta como diez respuestas incorrectas y las respuestas invalidas permanecen en el denominador. Los intervalos de confianza usan 10.000 remuestreos bootstrap pareados por articulo.

| Generador | Aciertos / 970 | Exactitud QA | Intervalo del 95% | Articulos fallidos | Media de palabras por resumen |
|---|---:|---:|---|---:|---:|
| Gemma 4 12B IT sin LoRA, thinking activado | 850 | 87,63% | 85,26–89,90% | 0 | 1070 |
| Gemma 4 12B IT + destilado Ornith rango 64, una epoca | 874 | 90,10% | 86,49–93,09% | 2 | 1679 |
| Gemma 4 12B IT + destilado Ornith rango 128, una epoca (este modelo) | 755 | 77,84% | 70,52–84,64% | 16 | 1364 |

El resultado declarado en el model-index del repositorio es la misma cifra: 77,83505154639175% de exactitud, marcada como no verificada. La diferencia frente al control base es de -9,79 puntos porcentuales, con un intervalo pareado del 95% de -17,32 a -2,68. La model card atribuye el efecto a resumenes mas largos y a fallos de formato.

## Requisitos de hardware

- El adaptador por si solo ocupa 2,2 GB, pero la inferencia requiere cargar el modelo base google/gemma-4-12B-it completo.
- VRAM estimada para el modelo base (estimaciones estandar para 12B, no facilitadas por el autor): en BF16, aproximadamente 24 GB; en cuantizacion de 8 bits, en torno a 13 GB; en 4 bits, alrededor de 8 GB.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB, L40S 48 GB. Para cuantizacion de 8 o 4 bits, una RTX 4090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, con cuantizacion (RTX 4090, RTX 3090 de 24 GB o equivalentes); en BF16 no cabe en GPU de 24 GB sin tecnicas adicionales.
- Opciones de despliegue: transformers con peft para cargar el adaptador, vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama fusionando previamente el adaptador en el modelo base y convirtiendo a GGUF.
- Latencia y throughput estimados: no disponible.
- Nota de precision: el adaptador se entreno con base congelada en BF16; las cuantizaciones de 8 y 4 bits son estimaciones de despliegue y no estan validadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud QA (970 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rango 128) | 12B base + LoRA r128 (2,2 GB) | no disponible | 77,84% | cc-by-4.0 | HuggingFace, 0 descargas, 1 like |
| Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA rango 64 | 12B base + LoRA r64 | no disponible | 90,10% | cc-by-4.0 (segun la familia del proyecto) | HuggingFace |
| google/gemma-4-12B-it sin adaptador | 12B | no disponible | 87,63% | no disponible en la informacion proporcionada | HuggingFace |
| ornith-ai/Ornith-1.5-9B (profesor) | 9B | no disponible | no evaluado con este protocolo | no disponible en la informacion proporcionada | HuggingFace |

## Limitaciones y advertencias

- Rendimiento inferior al control: este adaptador pierde 9,79 puntos porcentuales frente al Gemma 4 12B IT sin LoRA en el conjunto de evaluacion publicado, con 16 articulos fallidos frente a 0 del control.
- El resultado del model-index esta marcado como no verificado y procede del propio autor.
- Idiomas: unicamente ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero obliga a citar la autoria y a indicar los cambios; conviene revisar los terminos del modelo base google/gemma-4-12B-it, que se rigen por su propia licencia.
- La model card advierte explicitamente de que esta publicacion no certifica que las salidas esten libres de derechos de autor: las auditorias de copia literal siguen encontrando solapamiento sustancial con las fuentes.
- El adaptador aprende la tarea de extraccion; no contiene una base de datos de conocimiento cientifico.
- Los datos de entrenamiento no pasaron el validador estricto de evidencia de origen ni recibieron correccion semantica de calidad.
- Riesgo de alucinacion: la exactitud de QA mide utilidad para responder preguntas, no correccion factual completa.
- No hay adaptador de revision ni de correccion: solo se entreno la generacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Trazas de pensamiento: al supervisarse el razonamiento emitido por el profesor, las trazas pueden reproducir el estilo del profesor y no una cadena de razonamiento verificada.
- Advertencia de produccion: los fallos de formato observados en la evaluacion sugieren la necesidad de validacion de salida antes de integrar el adaptador en un pipeline automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r128
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo profesor: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004
- Revision fijada del dataset: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004/tree/1ab11230eb1928c790a9f8e0a13ec2563565dc82
- Articulo del proyecto: https://arxiv.org/abs/2502.19413v2
- Configuracion de entrenamiento: training_config.json (en el repositorio)
- Manifiesto de datos nativo: training/manifest.json (en el repositorio)
- Procedencia de pesos y codigo: provenance.json (en el repositorio)
