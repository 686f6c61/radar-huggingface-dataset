# japan-opendata/ja-toxicity-guard-v1

## Resumen

ja-toxicity-guard-v1 es un modelo de clasificación de texto multietiqueta desarrollado por japan-opendata para detectar indicios de toxicidad en textos en japonés. Se construye sobre tohoku-nlp/bert-base-japanese-v3, un BERT base adaptado al japonés, y devuelve puntuaciones independientes para siete categorías: insult, indirect_attack, exposure_intent, threat, discrimination, sexual_harassment y self_harm. El modelo suma 111.212.551 parámetros y se distribuye tanto en safetensors como en ONNX FP32.

El propósito declarado no es la moderación automática, sino la priorización de revisiones humanas y la asistencia a sistemas de alerta. El diseño pone el foco explícito en no confundir crítica legítima, labor periodística o citas con contenido tóxico, algo que la model card presenta como métrica principal. La evaluación reportada se realizó sobre un conjunto de test sellado de 5.000 ejemplos sintéticos, con macro F1 de 0,9747.

Es relevante para equipos que operan comunidades o plataformas en japonés y necesitan una capa de triaje previa a la revisión manual, con un coste computacional bajo: inferencia en CPU de aproximadamente 38-40 ms por ejemplo. La limitación principal es que todos los datos de entrenamiento y evaluación son sintéticos, por lo que el rendimiento en publicaciones reales será previsiblemente inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), clasificación multietiqueta |
| Parametros totales | 111.212.551 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 incluido; no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (FP32) |

## Arquitectura y entrenamiento

El modelo parte de tohoku-nlp/bert-base-japanese-v3, un encoder BERT base con tokenizador japonés, sobre el que se añade una cabeza de clasificación multietiqueta con siete salidas sigmoidales independientes (una por categoría). No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste por preferencias; se trata de un fine-tuning supervisado convencional sobre datos etiquetados.

Los datos de entrenamiento son íntegramente sintéticos: 100.000 ejemplos de entrenamiento, 5.000 de desarrollo y 5.000 de test sellado, sin duplicación entre particiones según el autor. Los textos de ataque se limitan a personas ficticias, posturas genéricas y organizaciones ficticias, y se declara una auditoría para verificar ausencia de nombres reales, datos de contacto y métodos concretos de autolesión, con cero violaciones. Las etiquetas de decisión se fijan por umbrales calibrados en dev y recogidos en inference_config.json: insult 0,5, indirect_attack 0,85, exposure_intent 0,5, threat 0,85, discrimination 0,5, sexual_harassment 0,85 y self_harm 0,5. Se incluye una implementación de referencia de inferencia en examples/infer_toxicity_guard.py.

## Capacidades

- Clasificación multietiqueta de toxicidad en japonés con siete categorías independientes: insult, indirect_attack, exposure_intent, threat, discrimination, sexual_harassment y self_harm.
- Detección de ataques indirectos, sarcasmo e intención de exposición pública (doxxing) mediante la etiqueta indirect_attack y exposure_intent.
- Detección de amenazas y de indicios de autolesión para derivación a revisión humana.
- Salida de probabilidades por etiqueta, con umbrales operativos precalibrados incluidos en el repositorio.
- Inferencia en CPU con latencia baja (unos 38-40 ms por ejemplo en un Core i7-11700F).
- Compatibilidad con el pipeline text-classification de Transformers y con la versión ONNX FP32.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Triaje de comentarios en comunidades japonesas: el modelo puntúa cada mensaje con siete probabilidades y los umbrales calibrados permiten encolar solo los casos de mayor riesgo para revisión humana, reduciendo el volumen de lectura manual sin decidir automáticamente sobre el contenido.
- Detección de amenazas en foros y chats: la etiqueta threat, con umbral 0,85, está orientada a minimizar falsos positivos y a marcar mensajes que requieran atención prioritaria de moderación.
- Alertas de autolesión: la etiqueta self_harm sirve para derivar publicaciones a equipos de soporte o protocolos internos de intervención; el modelo no gestiona la respuesta, que queda bajo responsabilidad operativa.
- Monitorización de acoso sexual en plataformas sociales: la etiqueta sexual_harassment (F1 reportado de 1,0000 en test sintético) puede usarse como señal de priorización en colas de revisión.
- Detección de intención de exposición pública: exposure_intent permite marcar mensajes que anuncian publicar datos o capturas de terceros, un caso frecuente en comunidades de discusión japonesas.
- Filtrado previo en pipelines de anotación: al devolver probabilidades por etiqueta, el modelo puede integrarse en herramientas de anotación asistida para preetiquetar grandes lotes de texto y que los anotadores humanos validen o corrijan.
- Investigación sobre toxicidad en japonés: el modelo y los scripts de inferencia permiten reproducir la evaluación sobre corpus propios y comparar la calibración de umbrales en dominios distintos del sintético.

## Benchmarks y rendimiento

Evaluación sobre test sellado de 5.000 ejemplos sintéticos, con umbrales de decisión adoptados:

| Metrica | Valor |
|---|---|
| Macro F1 | 0,9747 |
| Micro F1 | 0,9717 |
| Exactitud de coincidencia completa | 0,9566 |
| F1 sexual_harassment | 1,0000 |
| F1 discrimination | 0,9972 |
| F1 self_harm | 0,9845 |
| F1 threat | 0,9709 |
| F1 insult | 0,9669 |
| F1 exposure_intent | 0,9652 |
| F1 indirect_attack | 0,9384 |

Tasa de falsos positivos sobre textos no tóxicos, por categoría:

| Categoria | Tasa | Casos |
|---|---|---|
| Crítica legítima | 0,0000 | 0 de 600 |
| Prensa y citas | 0,0083 | 5 de 600 |
| Debate, metáfora, opinión | 0,1317 | 79 de 600 |
| Textos no tóxicos generales | 0,1450 | 29 de 200 |
| Conjunto no tóxico total | 0,0511 | no disponible |

La versión ONNX coincide con la de PyTorch en las etiquetas decididas con los umbrales adoptados, sobre 200 ejemplos de dev y 200 del test sellado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para los 111 millones de parámetros, más overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para uso individual; una RTX 3060 o superior permite procesar lotes con mayor throughput, mientras que CPU es suficiente para tráfico moderado.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también en CPU.
- Opciones de despliegue: Transformers con PyTorch, ONNXRuntime para el modelo ONNX, y servicios de inferencia compatibles con text-classification.
- Latencia estimada: aproximadamente 38-40 ms por ejemplo en CPU (Core i7-11700F); el throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ja-toxicity-guard-v1 | 111.212.551 | no disponible | Toxicidad multietiqueta en japonés (7 etiquetas) | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 | no disponible en la información | no disponible | Modelo base BERT japonés | Apache 2.0 | Hugging Face |
| Alternativas específicas de toxicidad en japonés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de terceros que permitan una comparación numérica con otros clasificadores de toxicidad en japonés.

## Limitaciones y advertencias

- Los datos de entrenamiento y evaluación son completamente sintéticos; el rendimiento sobre publicaciones reales será inferior al reportado.
- Falsos positivos del 13,17 % en textos de debate, metáfora y opinión, y del 14,50 % en textos no tóxicos generales; el modelo confunde construcciones de réplica educada y negaciones enfáticas con indirect_attack o insult.
- La etiqueta indirect_attack es la más débil (F1 0,9384) y la más propensa a errores en contextos irónicos o periodísticos.
- No debe usarse como decisión automática de borrado de contenido ni de sanción de cuentas; está pensado como apoyo a la priorización de revisión humana.
- La etiqueta self_harm detecta indicios, pero la respuesta operativa (derivación, protocolos de crisis) es responsabilidad del operador.
- No se documenta la longitud máxima de contexto admitida; textos muy largos pueden truncarse según la configuración del tokenizador del modelo base.
- Solo soporta japonés; no se ha evaluado en otros idiomas.
- Licencia Apache 2.0, compatible con uso comercial, pero sin garantías ni condiciones de exactitud en dominios reales.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en dominios alejados del sintético.

## Enlaces

- [Hugging Face: japan-opendata/ja-toxicity-guard-v1](https://huggingface.co/japan-opendata/ja-toxicity-guard-v1)
- [Modelo base: tohoku-nlp/bert-base-japanese-v3](https://huggingface.co/tohoku-nlp/bert-base-japanese-v3)
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
