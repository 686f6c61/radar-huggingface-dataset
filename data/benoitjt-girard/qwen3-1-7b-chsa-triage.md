# BenoitJT-GIRARD/qwen3-1.7b-chsa-triage

## Resumen

qwen3-1.7b-chsa-triage es un ajuste fino del modelo base Qwen/Qwen3-1.7B-Base (transformer decoder-only denso de 2.031.739.904 parámetros) orientado a una única tarea: asignar un nivel de prioridad de triaje a descripciones de pacientes en urgencias. Lo publica el usuario de HuggingFace BenoitJT-GIRARD bajo licencia MIT, con entrada en francés o inglés y salida siempre en francés con un formato fijo de tres campos (nivel de prioridad, justificación y recomendación).

El modelo se construyó con fine-tuning supervisado mediante LoRA seguido de alineación por preferencias con DPO, y los adaptadores están fusionados en los pesos finales, por lo que se carga como cualquier modelo causal estándar con `transformers`. Una particularidad técnica relevante es que el modelo base de Qwen3 ata la cabeza de salida a los embeddings y trata los tokens ChatML como un vector no entrenado; este ajuste se entrenó incluyendo la cabeza de salida y se exportó con `tie_word_embeddings: false`, de modo que puede emitir su token de fin de turno.

Su relevancia es sobre todo metodológica y de investigación: es un ejemplo reproducible (código, dataset e hiperparámetros publicados) de adaptación de un modelo pequeño a un dominio clínico muy restringido, con evaluación honesta de sus límites. El propio autor lo etiqueta como prototipo pedagógico no validado por un médico urgenciólogo y prohíbe explícitamente su uso en situaciones reales, lo que condiciona por completo la interpretación de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 |
| Parametros totales | 2.031.739.904 (≈2,03 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue del autor fija `--max-model-len 1024`, un valor de servicio que no equivale necesariamente a la ventana nativa del modelo base |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 4,1 GB para 2,03 B de parametros, consistente con pesos en 16 bits |
| Idiomas soportados | frances e ingles (entrada en ambos; salida siempre en frances) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Metodo de ajuste | LoRA (supervisado) + DPO, adaptadores fusionados |
| Cabeza de salida | entrenada, con `tie_word_embeddings: false` |
| Tarea declarada | text-generation (clasificacion de triaje en 3 niveles con justificacion) |
| Descargas / me gusta | 187 / 0 |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Qwen3 con 2,03 mil millones de parámetros. Sobre ese modelo se aplicó un fine-tuning supervisado con LoRA y, a continuación, una fase de alineación por preferencias con DPO; los adaptadores resultantes se fusionaron en los pesos, de manera que el artefacto final no requiere ninguna librería de adaptación. El tokenizer exportado incorpora el gabarit de diálogo y el token de fin de secuencia, por lo que el llamante no necesita configurar nada. Un detalle no trivial: el modelo base ata la cabeza de salida a los embeddings y no ha entrenado los tokens ChatML como vectores independientes, de modo que un LoRA que solo adapte las proyecciones produce un modelo incapaz de emitir el token de fin de turno. Este ajuste sí entrena la cabeza de salida y exporta los pesos con el vínculo deshecho.

Los datos proceden del dataset chsa-triage-medical-bilingue, un corpus equilibrado en tres niveles de triaje y dos idiomas, construido a partir de un catálogo de presentaciones clínicas redactado específicamente para el proyecto y completado con casos filtrados de MediQAl (viñetas clínicas francesas), MedQuAD y MedMCQA. No se utilizaron datos de pacientes reales. El catálogo clínico que sirvió para generar los datos no fue validado por un médico urgenciólogo, y no se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros (estos últimos se remiten al repositorio de código del proyecto).

## Capacidades

- Clasificación de triaje en tres niveles: `URGENCE_VITALE` (tris 1-2, atención inmediata), `URGENCE_MODEREE` (tris 3-4, pocas horas) y `CONSULTATION_DIFFEREE` (tri 5, consulta programada), con equivalencia explícita a la escala FRENCH.
- Generación de salida estructurada y parseable en un formato fijo de tres campos: nivel de prioridad, justificación clínica breve y recomendación de conducta.
- Comprensión de descripciones de paciente que incluyen motivo de consulta, síntomas, antecedentes y constantes vitales tomadas en admisión.
- Procesamiento bilingüe de entrada: francés e inglés. La salida se produce siempre en francés.
- Detención autónoma de la generación gracias al entrenamiento de la cabeza de salida y a `tie_word_embeddings: false`.
- Carga directa con `transformers` sin dependencias de adaptadores y compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades generales de generación de código, matemáticas o conocimiento abierto más allá del guion clínico entrenado.

## Casos de uso

- Docencia y simulación de triaje: el modelo puede generar una propuesta de clasificación sobre viñetas sintéticas para que el personal sanitario en formación discuta y corrija el resultado. Es adecuado porque produce una justificación breve y un nivel comparable con la escala FRENCH, siempre bajo supervisión humana.
- Referencia (baseline) en investigación sobre PLN clínico en francés: sirve como punto de comparación reproducible frente a reglas explícitas o clasificadores clásicos en experimentos de clasificación de urgencias, dado que el dataset y el código están publicados.
- Estudio de técnicas de alineación en dominios especializados: el par LoRA + DPO sobre un modelo de 2 B y un corpus pequeño y equilibrado es un caso de estudio útil para medir el efecto del ajuste por preferencias en tareas de clasificación clínica.
- Validación de integraciones con sistemas de información hospitalarios: el formato de salida fijo y el 100 % de respuestas parseables declarado por el autor permiten probar el parseo, el enrutado y la visualización en un HIS o en un panel de investigación sin tocar datos reales.
- Generación de datos sintéticos de triaje: el modelo puede emplearse para proponer etiquetas y justificaciones sobre nuevas viñetas que después se revisen y filtren manualmente, ampliando un corpus equilibrado por nivel e idioma.
- Atención a pacientes anglófonos en un entorno francófono (solo como prototipo): la entrada en inglés con salida en francés permite explorar cómo se registraría una evaluación homogénea en la historia clínica cuando la descripción original llega en otro idioma.
- Despliegue local en hardware modesto para entornos de laboratorio o sin conectividad: con 2,03 B de parámetros cabe en una GPU de consumo y puede servirse en una máquina aislada para demostraciones internas.
- Pruebas de estrés de robustez: el propio autor señala que cerca de la mitad del conjunto de evaluación son presentaciones atípicas, por lo que el modelo es útil para estudiar el comportamiento frente a casos fuera de distribución.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 60 casos escritos a mano, nunca vistos en entrenamiento, con casi la mitad de presentaciones atípicas:

| Medida | Valor (60 casos) |
|---|---|
| Exactitud del nivel de triaje | 0,700 [0,57 – 0,80] |
| Subtriaje de casos urgentes | 27,5 % |
| Sobreclasificación, todos los casos | 11,7 % |
| Respuestas explotables por el sistema de información | 100 % |

El modelo se compara con cuatro referencias, entre ellas una regla de triaje explícita y un clasificador clásico entrenado sobre los mismos pares, pero la información disponible no incluye los valores numéricos de esas referencias ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks generales en la información disponible.

## Requisitos de hardware

- Pesos en 16 bits: aproximadamente 4,1 GB (tamaño real del repositorio), más la caché KV, que depende del contexto y del lote. Con `--max-model-len 1024` la caché es pequeña.
- Cuantización a 8 bits: del orden de 2 GB de pesos, según estimación a partir del número de parámetros; no hay cuantizaciones oficiales publicadas.
- Cuantización a 4 bits: del orden de 1,2-1,5 GB de pesos, según estimación; requeriría conversión propia a GGUF o AWQ/GPTQ.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB. También es viable en GPU de 8 GB si se cuantiza.
- GPU de centro de datos: A100, H100 o L40S quedan sobredimensionadas para un modelo de 2 B; solo se justifican por agregación de muchas peticiones concurrentes.
- CPU: la inferencia en CPU es posible con `transformers` o llama.cpp, pero con latencias altas; no se publican mediciones.
- Opciones de despliegue: `transformers` (documentado por el autor), vLLM (comando de ejemplo con `--revision modele-v1.0.0 --max-model-len 1024`), text-generation-inference (etiqueta declarada) y endpoints compatibles. Para Ollama o llama.cpp haría falta convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento en triaje |
|---|---|---|---|---|---|---|
| qwen3-1.7b-chsa-triage | 2,03 B | no disponible | fr, en (salida fr) | MIT | HuggingFace, safetensors | 0,700 de exactitud en 60 casos propios |
| Qwen/Qwen3-1.7B-Base | 2,03 B | no disponible en la informacion proporcionada | multilingue (segun modelo base) | Apache 2.0 o MIT segun el modelo base | HuggingFace | no disponible; no entrenado para triaje |
| Regla de triaje explicita (referencia del informe del autor) | no aplica | no aplica | fr | no disponible | descrita, no distribuida | valores no publicados en la informacion disponible |
| Clasificador clasico entrenado sobre los mismos pares (referencia del informe) | no disponible | no aplica | fr | no disponible | no distribuido | valores no publicados en la informacion disponible |

No se han identificado en la informacion disponible otros modelos publicos de triaje hospitalario directamente comparables en tamaño, idioma y licencia. La comparacion de rendimiento con alternativas no es posible con los datos disponibles.

## Limitaciones y advertencias

- Uso clínico prohibido: el autor lo declara prototipo pedagógico, de ayuda a la decisión y bajo supervisión humana obligatoria, y advierte de que no debe usarse en situaciones reales. Ante cualquier signo vital comprometido debe llamarse al 15 (SAMU).
- El catálogo de presentaciones clínicas usado para construir los datos de entrenamiento no fue validado por un médico urgenciólogo; es la limitación principal señalada por el propio autor.
- Subtriaje del 27,5 % en casos urgentes sobre el conjunto de evaluación: más de uno de cada cuatro casos urgentes recibiría una prioridad inferior a la correcta. Es el riesgo más grave del modelo.
- Sobreclasificación del 11,7 % de todos los casos, con el coste de recursos asociado.
- Datos de entrenamiento mayoritariamente sintéticos: no reflejan el desorden del lenguaje real y las viñetas generadas comparten un número reducido de respuestas esperadas, lo que favorece el sobreajuste al formato.
- Conjunto de evaluación de solo 60 casos: el propio autor advierte de que a ese tamaño muestral ningún intervalo de confianza permite concluir diferencias de exactitud entre sistemas.
- Ausencia de verdad terreno externa: el catálogo, la regla de triaje y el conjunto de evaluación provienen de la misma fuente, por lo que la evaluación es circular.
- Capacidad limitada por tamaño: 2,03 B de parámetros para un formato de salida y tres clases; no realiza razonamiento clínico.
- Salida restringida al francés, aunque la entrada pueda estar en inglés.
- Sesgos: no se documenta ningún análisis de sesgo por edad, sexo, origen o idioma. El corpus, parcialmente sintético y derivado de fuentes como MedQuAD y MedMCQA, puede arrastrar sesgos de esas fuentes.
- Alucinación: no se publica una evaluación específica de fidelidad de las justificaciones clínicas; el texto de justificación es generado y no verificado.
- Licencia MIT: permite uso comercial y modificación siempre que se conserve el aviso de copyright y la licencia. La licencia permisiva no exime de responsabilidad clínica ni regulatoria; un uso sanitario real quedaría sujeto a la normativa de productos sanitarios y a la validación clínica correspondiente.
- Riesgo de confusión de versiones: la rama por defecto del repositorio cambia en cada publicación, por lo que el autor recomienda fijar `--revision modele-v1.0.0` para reproducibilidad.
- La información disponible no incluye la longitud de contexto nativa, los tipos de cuantización soportados ni métricas de latencia, datos que conviene verificar antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage
- Dataset de entrenamiento: https://huggingface.co/datasets/BenoitJT-GIRARD/chsa-triage-medical-bilingue
- Repositorio de código, hiperparámetros y pipeline: https://github.com/BenoitJT-GIRARD/chsa-triage
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a páginas sobre configuración de firmas y acceso a Microsoft Outlook, sin relación con el modelo. No se dispone de paper, blog de anuncio, demo ni otros recursos adicionales.
