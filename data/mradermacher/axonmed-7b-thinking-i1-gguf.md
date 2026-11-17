# mradermacher/AxonMed-7B-Thinking-i1-GGUF

## Resumen

AxonMed-7B-Thinking-i1-GGUF es una cuantización en formato GGUF del modelo AxonMed-7B-Thinking, publicada por el usuario mradermacher. El modelo base, desarrollado por Saathimed, es un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a conversación y razonamiento de tipo "thinking" en el ámbito médico, según se desprende del nombre y de la etiqueta "conversational" del repositorio.

El repositorio constituye una conversión a GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutar el modelo en entornos con recursos limitados a través de herramientas compatibles con llama.cpp. Incluye un conjunto amplio de niveles de cuantización, desde IQ1_S hasta Q6_K, lo que ofrece un abanico de compromisos entre tamaño y calidad.

La relevancia de esta publicación radica en que facilita el despliegue local del modelo base en hardware de consumo, algo imposible con los pesos originales en precisión completa. No obstante, la información pública disponible es muy escasa: no se detallan la licencia, los idiomas soportados, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido del formato GGUF; no confirmado) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base AxonMed-7B-Thinking. Por el nombre y el tamaño de parámetros (7,6 mil millones), se trata presumiblemente de un transformer decoder-only de escala 7B, pero este dato no está confirmado en la información proporcionada. El repositorio no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La innovación técnica documentada en este repositorio es la cuantización: se han generado cuantizaciones ponderadas mediante imatrix (importance matrix), una técnica que calcula la importancia de cada tensor a partir de datos de calibración para minimizar la pérdida de calidad en niveles de compresión agresivos. El repositorio incluye la etiqueta "thinking", lo que sugiere que el modelo base incorpora un modo de razonamiento extendido, pero no se aportan detalles técnicos sobre su implementación.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Razonamiento de tipo "thinking" o razonamiento extendido, inferido del nombre del modelo; no confirmado con documentación.
- Posible especialización en dominio médico, inferido del nombre "AxonMed"; no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional especializado en dominio médico: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en equipos con GPU de consumo, facilitando prototipos de triaje o consulta de información clínica sin depender de servicios en la nube.
- Investigación sobre razonamiento en modelos pequeños: el modo "thinking" del modelo base permite estudiar cadenas de razonamiento en un modelo de 7B, con la ventaja de que las cuantizaciones IQ permiten ajustar el equilibrio entre calidad y recursos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite medir empíricamente la degradación de calidad en tareas médicas a medida que se reduce el tamaño del archivo.
- Integración en pipelines de llama.cpp: al ser GGUF, el modelo puede cargarse directamente en llama.cpp, Ollama o servidores compatibles con la API de OpenAI para pruebas de integración.
- Experimentación educativa: útil para demostrar el flujo completo de cuantización con imatrix y la selección de niveles de compresión en un modelo de 7B.
- Pruebas de concepto en entornos con restricciones de privacidad: el despliegue local evita enviar datos sensibles a APIs externas, aunque debe advertirse que no se ha verificado la calidad clínica del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 2 GB (IQ1_S) y 6-7 GB (Q6_K) para los pesos, más el espacio para la caché KV, que depende de la longitud de contexto no documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones mayores; A100 o H100 para despliegues con contexto largo o batch elevado.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones; las variantes IQ1/IQ2 caben en GPUs de 4-6 GB y las Q4/Q5 en GPUs de 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (según la etiqueta "endpoints_compatible"), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (7B con especialización médica y modo thinking) en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial; debe verificarse en el repositorio del modelo base antes de cualquier despliegue.
- Riesgo de alucinación: como todo modelo generativo, puede producir información médica incorrecta; no debe usarse como sustituto de criterio clínico profesional.
- Cuantizaciones agresivas (IQ1, IQ2): pueden degradar notablemente la calidad, especialmente en tareas de razonamiento; se recomienda validar con datos propios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Fecha de creación futura en los metadatos (2026-11-17): inconsistencia que conviene verificar antes de confiar en el repositorio.
- Cero descargas y cero likes: repositorio sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-7B-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
