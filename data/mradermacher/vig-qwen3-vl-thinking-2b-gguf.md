# mradermacher/VIG-Qwen3-VL-Thinking-2B-GGUF

## Resumen

VIG-Qwen3-VL-Thinking-2B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo chaser2/VIG-Qwen3-VL-Thinking-2B, realizada por mradermacher, uno de los cuantizadores más prolíficos de la comunidad de Hugging Face. El modelo base es un modelo de lenguaje con capacidades vision-language (visión y lenguaje) y de razonamiento (thinking), construido sobre la arquitectura Qwen3-VL de Alibaba, con aproximadamente 2.031 millones de parámetros.

Este tipo de repositorio resuelve un problema práctico muy concreto: permitir ejecutar modelos multimodales de razonamiento en hardware de consumo, desde portátiles con CPU hasta GPUs modestas, gracias a las cuantizaciones que reducen el tamaño del modelo desde los 4,2 GB en f16 hasta 1,0 GB en Q2_K. Incluye además los archivos mmproj (suplemento multimodal) necesarios para que llama.cpp y derivados puedan procesar imágenes.

Es relevante ahora porque combina tres tendencias actuales: los modelos pequeños (2B) con razonamiento extendido, la visión integrada en modelos compactos y la madurez del ecosistema GGUF para inferencia local. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer vision-language con razonamiento) |
| Parametros totales | 2.031.739.904 (≈2,03 B) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, chaser2/VIG-Qwen3-VL-Thinking-2B, es un ajuste (fine-tune) de un modelo Qwen3-VL de 2B parámetros, la familia multimodal de Qwen que integra un codificador de visión con un transformer de lenguaje. El sufijo "Thinking" indica que el modelo ha sido entrenado para producir razonamiento extendido antes de la respuesta final, al estilo del modo thinking de la serie Qwen3. El significado exacto del prefijo "VIG" no está documentado en la información disponible.

No se dispone de datos sobre el dataset de entrenamiento, el número de tokens, ni sobre el uso de técnicas como RLHF o DPO. Lo que sí está documentado es el trabajo de mradermacher: cuantizaciones estáticas en GGUF (convertidas desde el formato HF original) en múltiples niveles de bits, desde 2 bits (Q2_K) hasta 16 bits (f16), más los archivos mmproj en Q8_0 y f16 que contienen el proyector multimodal necesario para la comprensión de imágenes en llama.cpp. No se han publicado cuantizaciones weighted/imatrix por el autor en el momento de la ficha.

## Capacidades

- Comprensión de imágenes y texto (vision-language): procesa entradas multimodales gracias al codificador de visión de Qwen3-VL y los archivos mmproj incluidos.
- Razonamiento extendido (thinking mode): genera cadenas de razonamiento previas a la respuesta final, útil para tareas de matemáticas, lógica y análisis.
- Generación de texto conversacional: etiquetado como modelo conversacional.
- Ejecución local: formato GGUF compatible con llama.cpp, Ollama, LM Studio y otros runtimes.
- Cuantizaciones desde 1,0 GB: permite desplegarlo en hardware muy limitado.
- Soporte de tool calling: no disponible (no se documenta en la información proporcionada).
- Capacidades multilingües: la model card solo declara inglés; el rendimiento en castellano no está documentado (los modelos Qwen3 base suelen tener cobertura multilingüe, pero no hay datos para este ajuste concreto).

## Casos de uso

- Analisis de imagenes con razonamiento local: gracias al mmproj incluido, se puede enviar una imagen (captura de pantalla, documento escaneado, gráfico) junto con una pregunta y obtener una respuesta razonada sin conexión, adecuado para flujos de trabajo con datos sensibles que no deben salir del equipo.
- Chatbots ligeros en dispositivos de borde: con la cuantización Q4_K_M (1,4 GB), el modelo cabe en portátiles sin GPU dedicada, permitiendo asistentes conversacionales con visión en quioscos, Raspberry Pi de gama alta o mini-PCs.
- Prototipado rapido de agentes multimodales: su pequeño tamaño y velocidad de inferencia permiten iterar rápidamente en pipelines de agentes que combinan visión y razonamiento antes de escalar a modelos mayores.
- OCR y extraccion estructurada de datos: el componente de visión puede combinarse con instrucciones para extraer campos de facturas, formularios o etiquetas, con verificación mediante el razonamiento en cadena.
- Evaluacion y benchmarking de cuantizaciones: al ofrecer el espectro completo de quants (Q2_K a f16), es un buen banco de pruebas para estudiar la degradación de calidad multimodal y de razonamiento a distintos niveles de bits.
- Asistente de depuracion visual para desarrolladores: descripción de capturas de pantalla, análisis de errores en interfaces o revisión de diagramas de arquitectura directamente desde el editor o terminal vía herramientas basadas en llama.cpp.
- Educacion y experimentacion local: ideal para enseñar cómo funcionan los modelos vision-language y las cuantizaciones sin coste de API ni requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye evaluaciones, y tampoco se han proporcionado datos de benchmarks del modelo base chaser2/VIG-Qwen3-VL-Thinking-2B.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos del LLM, sin el mmproj ni la KV cache):
  - Q2_K: ~1,0 GB
  - Q4_K_M: ~1,4 GB
  - Q6_K: ~1,8 GB
  - Q8_0: ~2,3 GB
  - f16: ~4,2 GB
  - Añadir ~0,5 GB (mmproj-Q8_0) o ~0,9 GB (mmproj-f16) para la parte multimodal, más la memoria de la KV cache según el contexto usado.
- GPUs recomendadas: cualquier GPU moderna con 4 GB de VRAM o más ejecuta cómodamente las cuantizaciones medias; con 6-8 GB (RTX 3060, RTX 4060, RTX 4090) cabe incluso f16 con contexto amplio. También es plenamente viable en CPU pura dado el tamaño.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU de consumo actual, incluso en las de gama de entrada; también funciona solo con RAM del sistema (8 GB son suficientes para la mayoría de quants).
- Opciones de despliegue: llama.cpp (runtime principal para GGUF con mmproj), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No es el formato nativo para vLLM o TGI, que requerirían los pesos originales en safetensors del modelo base.
- Latencia y throughput: no disponibles como cifras publicadas; dado el tamaño (2B parámetros), se espera inferencia muy rápida, incluso en CPU, con velocidades del orden de decenas de tokens por segundo en hardware de consumo. Nótese que el modo thinking genera tokens adicionales de razonamiento que aumentan la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Razonamiento | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| VIG-Qwen3-VL-Thinking-2B (este modelo) | ~2,03 B | vision-language | sí (thinking) | Apache 2.0 | sí, cuants estáticos de Q2_K a f16 |
| Qwen3-VL-2B (base de Alibaba) | ~2 B | vision-language | según variante | Apache 2.0 | sí, oficiales y comunitarias |
| SmolVLM2 2.2B (Hugging Face) | ~2,2 B | vision-language | no | Apache 2.0 | sí |
| Moondream2 | ~1,9 B | vision-language | no | Apache 2.0 | sí |

Entre los modelos multimodales de ~2B con razonamiento, las alternativas directas son escasas: la mayoría de modelos pequeños de visión (SmolVLM2, Moondream2) no incorporan modo thinking. La ventaja de este ajuste es precisamente esa combinación de visión y razonamiento en un tamaño mínimo, con la contrapartida de que se trata de un fine-tune comunitario sin documentación extensa ni benchmarks publicados, frente al soporte oficial de Qwen o Hugging Face.

## Limitaciones y advertencias

- Documentacion escasa: ni el repositorio GGUF ni la información disponible del modelo base describen el dataset de entrenamiento, el método de ajuste o el significado de "VIG", lo que dificulta evaluar su fiabilidad antes de usarlo en producción.
- Sesgos: no documentados; al derivar de Qwen3-VL, hereda presumiblemente los sesgos de sus datos de preentrenamiento y ajuste, pero no hay análisis publicados para este fine-tune.
- Alucinaciones: como todo modelo de lenguaje de 2B, el riesgo es significativo, especialmente en descripción fina de imágenes y en razonamiento matemático complejo; el modo thinking reduce pero no elimina errores.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está verificado y puede ser inferior, tanto en texto como en instrucciones sobre imágenes.
- Contexto: la longitud de contexto no está documentada en la información disponible; verificarla en la configuración del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos de la familia Qwen3 de la que deriva.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_S/M/L degradan notablemente la calidad, y en modelos con razonamiento la degradación puede amplificar errores en cadenas largas de pensamiento; se recomiendan Q4_K_M o superiores.
- Cuantizaciones imatrix no disponibles en el momento de la ficha; las estáticas pueden rendir algo peor que las weighted a igual tamaño.
- Uso en producción: al tratarse de un fine-tune comunitario sin benchmarks publicados, se recomienda evaluación interna en el dominio de aplicación antes de desplegar.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/VIG-Qwen3-VL-Thinking-2B-GGUF
- Modelo base: https://huggingface.co/chaser2/VIG-Qwen3-VL-Thinking-2B
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#VIG-Qwen3-VL-Thinking-2B-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitud de cuantizaciones / FAQ: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper del modelo base: no disponible
- Demo del modelo base: no disponible
