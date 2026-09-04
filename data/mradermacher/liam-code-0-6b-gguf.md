# mradermacher/Liam-CODE-0.6B-GGUF

## Resumen

Liam-CODE-0.6B es una cuantización GGUF del modelo RIFA-CODE-0.6B, desarrollado originalmente por smshahbaj y convertido al formato GGUF por mradermacher. Se trata de un modelo de generación de texto de tamaño reducido, con 596 millones de parámetros, orientado a tareas conversacionales y de código, según los tags presentes en su ficha de HuggingFace. Su principal valor es permitir la ejecución de un modelo de lenguaje en entornos con recursos muy limitados, gracias a los distintos niveles de cuantización disponibles.

La información pública sobre este modelo es escasa. No se detallan aspectos clave como la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento. Por ello, esta ficha se limita a los datos disponibles en el repositorio de HuggingFace y en la model card original, marcando como "no disponible" cualquier dato no especificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

El repositorio contiene únicamente pesos en formato GGUF, generados a partir del modelo base smshahbaj/RIFA-CODE-0.6B. No se incluyen pesos en safetensors ni otros formatos.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer puro, una variante híbrida o cualquier otra arquitectura. Tampoco se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La única información disponible es que el modelo base es RIFA-CODE-0.6B y que la conversión a GGUF fue realizada por mradermacher.

## Capacidades

- Generación de texto y conversación, según los tags del repositorio (`text-generation`, `conversational`).
- Posible especialización en código, sugerida por el nombre del modelo ("CODE"), aunque no hay confirmación explícita en la documentación.
- Soporte multilingüe limitado a inglés y bengalí.
- No se dispone de información sobre soporte de tool calling, funciones de agente, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente de código en local: al ser un modelo de 0.6B con cuantizaciones de menos de 1 GB, puede ejecutarse en una Raspberry Pi o en un portátil sin GPU para autocompletar fragmentos de código o sugerir correcciones simples.
- Chatbot de bajo consumo: perfecto para aplicaciones de mensajería o asistentes conversacionales que necesiten funcionar en dispositivos con poca memoria y sin conexión a internet.
- Educación y prototipado: sirve como herramienta didáctica para enseñar a estudiantes cómo funcionan los modelos de lenguaje pequeños, sus limitaciones y el impacto de la cuantización.
- Procesamiento de lenguaje natural en bengalí: dado que el modelo soporta bengalí, puede utilizarse para tareas de texto en ese idioma, como respuesta a preguntas o generación de texto simple.
- Edge computing: compatible con runtimes como llama.cpp o Ollama, permite desplegar el modelo en dispositivos embebidos o móviles con requisitos mínimos de hardware.
- Evaluación de cuantizaciones: los doce niveles de cuantización disponibles permiten estudiar experimentalmente la relación entre tamaño, velocidad y calidad del modelo en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño de los archivos GGUF varía entre 0.4 GB (Q2_K) y 1.3 GB (f16). La memoria necesaria para inferencia es aproximadamente el tamaño del archivo más un margen para el contexto y el runtime.
- Con las cuantizaciones Q4_K_S o Q4_K_M (0.5 GB) el modelo puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM o en CPU con 4 GB de RAM.
- Es apto para GPUs de consumo como RTX 3060, GTX 1650, o incluso gráficas integradas, gracias a su pequeño tamaño.
- Opciones de despliegue recomendadas: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. No se han encontrado benchmarks ni referencias a alternativas de la misma categoría.

## Limitaciones y advertencias

- La documentación disponible es muy limitada; no hay información oficial sobre el proceso de entrenamiento, la arquitectura ni el rendimiento esperado.
- Al tratarse de un modelo de 0.6B, su capacidad de razonamiento y generación de código complejo es significativamente inferior a la de modelos de mayor tamaño.
- Existe riesgo de alucinación, especialmente en tareas de código con contextos largos o instrucciones ambiguas.
- El soporte de idiomas se limita a inglés y bengalí; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los pesos originales antes de desplegarlo en producción.
- La cuantización puede degradar la calidad del modelo, especialmente en niveles extremos como Q2_K, donde la pérdida de precisión es más acusada.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Liam-CODE-0.6B-GGUF
- Modelo base original: https://huggingface.co/smshahbaj/RIFA-CODE-0.6B
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
