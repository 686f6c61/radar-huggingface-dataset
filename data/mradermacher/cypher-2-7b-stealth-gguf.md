# mradermacher/cypher-2-7b-stealth-GGUF

## Resumen

Cypher-2-7b-stealth-GGUF es una cuantización estática en formato GGUF del modelo TheShellMaster/cypher-2-7b-stealth, publicada por el usuario mradermacher en Hugging Face. Se trata de un modelo de lenguaje de 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), orientado a uso conversacional según las etiquetas del repositorio. La ficha del modelo original no proporciona información sobre arquitectura base, datos de entrenamiento ni licencia, por lo que muchos detalles técnicos quedan como no disponibles.

El interés de esta publicación es fundamentalmente práctico: mradermacher es conocido por generar cuantizaciones GGUF de modelos de terceros para facilitar su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles. En este caso se ofrecen múltiples niveles de cuantización (desde Q2_K hasta Q8_0, además de x-f16 e IQ4_XS), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No obstante, la ausencia de información sobre el modelo base (arquitectura, contexto, licencia, idiomas y benchmarks) limita seriamente su evaluación para producción. Cualquier uso serio debería remitirse al repositorio original del modelo y verificar la licencia antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parámetros totales | 7.615.616.512 (≈7,6 B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); repo de 22,7 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base TheShellMaster/cypher-2-7b-stealth en la documentación proporcionada. El nombre y el tamaño (≈7,6 B de parámetros) sugieren un transformer decoder-only de escala 7B, pero no se confirma ni la familia (Mistral, Llama, Qwen u otra) ni detalles como atención, tipo de normalización o uso de MoE. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La única información técnica cierta procede de los metadatos de la cuantización: se ha generado con quantize_version 2, con quantización estática de tensores de salida (output_tensor_quantised: 1) y conversión desde el formato Hugging Face (convert_type: hf). Las cuantizaciones disponibles cubren desde 2 bits (Q2_K) hasta 8 bits (Q8_0), además de una versión f16 sin cuantizar.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan formatos de prompt ni plantillas de chat.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- No consta soporte de visión, audio, thinking mode ni otras modalidades especiales.
- Al ser una cuantización GGUF, es compatible con motores de inferencia locales que aceptan este formato (llama.cpp y derivados), pero las capacidades funcionales dependen enteramente del modelo base, no documentadas aquí.

## Casos de uso

- Prototipado local de un asistente conversacional: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU, permitiendo probar un chatbot de 7B sin infraestructura dedicada.
- Experimentación con cuantización: la disponibilidad de doce variantes (de Q2_K a Q8_0) permite medir el impacto de la precisión en la calidad de las respuestas, útil para investigación sobre degradación por cuantización.
- Despliegue en entornos con memoria limitada: la variante Q2_K o IQ4_XS reduce el peso del modelo lo suficiente para equipos con poca VRAM, a costa de una pérdida de calidad no cuantificada.
- Evaluación comparativa de modelos de 7B: sirve como candidato adicional en pruebas A/B frente a otros modelos pequeños, siempre que se verifique previamente la licencia del modelo base.
- Integración en pipelines de llama.cpp: al ser GGUF, puede cargarse con llama-server o bindings de Python (llama-cpp-python) para tareas de generación de texto en scripts y servicios locales.
- Fine-tuning posterior sobre los pesos f16: la variante x-f16 permite partir de pesos de mayor precisión si se necesita adaptar el modelo, aunque requiere hardware más capaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos GGUF):
  - Q2_K: en torno a 3 GB
  - Q3_K_M: en torno a 3,5-4 GB
  - Q4_K_M: en torno a 4,5-5 GB
  - Q5_K_M: en torno a 5,5-6 GB
  - Q6_K: en torno a 6,5 GB
  - Q8_0: en torno a 8-8,5 GB
  - x-f16: en torno a 15-16 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 solo si se busca throughput elevado o f16.
- Cabe en GPU de consumo: sí, las variantes Q4_K_M y Q5_K_M encajan en GPUs de 8-12 GB; las variantes Q2_K y Q3 pueden ejecutarse incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, y servidores compatibles con GGUF. No se garantiza compatibilidad con vLLM o TGI, que suelen requerir safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-2-7b-stealth (esta cuantización) | ≈7,6 B | no disponible | no disponible | GGUF | Modelo conversacional sin documentación técnica pública |
| mradermacher/Cypher-7B-GGUF | ≈7 B (no confirmado) | no disponible | cc (según etiqueta de la búsqueda) | GGUF | Otra cuantización de mradermacher, con etiquetas Mistral/Mergekit |
| Mistral-7B-Instruct | 7,2 B | 32 K (versión v0.2) | Apache 2.0 | safetensors, GGUF | Referencia consolidada de 7B con licencia permisiva |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Alternativa moderna con contexto largo y amplio ecosistema |

La comparación es limitada porque no se conocen ni la arquitectura ni el rendimiento del modelo base de cypher-2-7b-stealth. Frente a Mistral-7B-Instruct o Llama 3.1 8B, la falta de licencia clara y de benchmarks publicados supone una desventaja significativa para uso en producción.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite uso comercial; es imprescindible verificar la licencia del modelo original antes de cualquier despliegue.
- Ausencia total de benchmarks: no hay evidencia de calidad en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación: inherente a los modelos de 7B sin datos de evaluación; no cuantificado.
- Sesgos: desconocidos, al no documentarse los datos de entrenamiento.
- Idiomas: no se especifica qué idiomas cubre; el soporte del castellano no está garantizado.
- Contexto: se desconoce la ventana máxima, lo que impide planificar casos de uso con documentos largos.
- Las cuantizaciones de 2-3 bits pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- Es una cuantización de terceros: posibles errores de conversión no están verificados por el autor original.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/cypher-2-7b-stealth-GGUF
- Modelo original: https://huggingface.co/TheShellMaster/cypher-2-7b-stealth
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Otra cuantización relacionada: https://huggingface.co/mradermacher/Cypher-7B-GGUF
