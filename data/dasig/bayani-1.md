# dasig/bayani-1

## Resumen

Bayani-1 es un modelo de lenguaje conversacional publicado en Hugging Face por el usuario dasig. Con 1.711.376.384 parámetros totales (aproximadamente 1,7 mil millones), se sitúa en la categoría de modelos compactos, un rango habitualmente orientado a despliegues con recursos limitados, inferencia en CPU o GPU de consumo y tareas de generación de texto en entornos con requisitos de latencia ajustados. El repositorio tiene un tamaño de 1,1 GB, lo que sugiere que los pesos distribuidos están cuantizados en formato GGUF, coherente con la etiqueta `gguf` del modelo.

La información pública disponible es muy escasa: no se especifican la licencia, los idiomas soportados, el pipeline ni los detalles de arquitectura o entrenamiento. El modelo está etiquetado como `conversational` y `endpoints_compatible`, lo que indica que está pensado para diálogo y que puede servirse a través de la infraestructura de endpoints de Hugging Face. Con 75 descargas y 1 like en el momento de la consulta, se trata de un modelo de nicho con adopción muy limitada.

Su relevancia actual es reducida en términos de ecosistema, pero puede resultar de interés para quienes buscan un modelo pequeño en GGUF para experimentación local o para fine-tuning ligero. Cualquier evaluación rigurosa requiere consultar la model card original, que no aporta datos técnicos verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.711.376.384 (aprox. 1,7 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en GGUF; el nivel de cuantizacion concreto no consta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. Por el recuento de parámetros (1,7 B) y el formato de distribución (GGUF), es plausible que se trate de un transformer decoder-only de escala pequeña, pero no hay confirmación documental. Tampoco constan detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

La etiqueta `endpoints_compatible` sugiere que el modelo puede desplegarse mediante los endpoints gestionados de Hugging Face, probablemente a través de un runtime compatible con GGUF, pero no se especifica el backend exacto. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Inferencia en formato GGUF: los pesos están empaquetados para ejecutarse con runtimes compatibles con GGUF (llama.cpp y derivados), lo que facilita el despliegue local.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de chatbots locales: al ser un modelo de 1,7 B en GGUF, puede ejecutarse en un portátil o en una máquina sin GPU dedicada para validar flujos conversacionales antes de migrar a un modelo mayor.
- Experimentación con fine-tuning ligero: su tamaño reducido permite iterar con LoRA o QLoRA en una única GPU de consumo, aunque la licencia no especificada obliga a verificar antes los términos de uso.
- Asistente conversacional embebido en aplicaciones de escritorio: la distribución en GGUF permite integrarlo en herramientas que ya usan llama.cpp como backend de inferencia.
- Evaluación comparativa de modelos pequeños: sirve como punto de referencia en pruebas internas de calidad conversacional frente a otros modelos de 1-3 B.
- Pruebas de integración con endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo como servicio gestionado para validar pipelines de aplicaciones.
- Docencia y aprendizaje: un modelo de este tamaño es adecuado para explicar el ciclo completo de carga de pesos GGUF, tokenización e inferencia en cursos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7 B de parámetros, una cuantización Q4_K_M ocuparía aproximadamente 1,0-1,1 GB de memoria; Q8_0 rondaría los 1,8-1,9 GB; en FP16 serían unos 3,4 GB. Estas cifras son estimaciones basadas en el recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; para cuantizaciones Q4 basta con 2 GB, por lo que cabe en iGPU y en GPUs de gama baja.
- GPU de consumo: sí, cabe en tarjetas como RTX 3050, RTX 4060, GTX 1660 o incluso en Apple Silicon con memoria unificada.
- CPU: viable en CPU gracias al formato GGUF; el throughput dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), y endpoints compatibles de Hugging Face. vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dasig/bayani-1 | ~1,7 B | no disponible | no disponible | GGUF | Hugging Face (75 descargas) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, ampliamente adoptado |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento de bayani-1 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si se permite uso comercial, modificación o redistribución. Verificar la model card antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano, inglés u otros idiomas, lo que impide garantizar calidad multilingüe.
- Contexto desconocido: sin datos sobre la ventana de contexto, no se puede planificar su uso en tareas de documentos largos o conversaciones extensas.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, es probable que genere contenido inventado con mayor frecuencia que modelos de mayor escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Adopción muy baja (75 descargas, 1 like): no hay evidencia de comunidad, issues resueltos ni validación independiente.
- Sin benchmarks publicados: no se puede comparar su calidad con alternativas establecidas de tamaño similar.
- Formato GGUF únicamente: no se distribuyen pesos en safetensors, lo que limita el fine-tuning directo con frameworks como PyTorch o TRL sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/dasig/bayani-1
