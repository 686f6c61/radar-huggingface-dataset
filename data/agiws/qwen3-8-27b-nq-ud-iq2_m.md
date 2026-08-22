# agiws/Qwen3.8-27B-NQ-UD-IQ2_M

## Resumen

El repositorio `agiws/Qwen3.8-27B-NQ-UD-IQ2_M` es un proyecto experimental del usuario agiws cuyo objetivo es producir una cuantización GGUF del modelo Qwen3.8-27B de Alibaba utilizando una herramienta propia denominada NeuralQuant (NQ). La cuantización combina el esquema UD (Unsloth Dynamic), que asigna distinta bitness a diferentes capas según su sensibilidad, con el esquema IQ2_M de llama.cpp, una mezcla de cuantizaciones de baja precisión (IQ2_S, IQ3_S, Q4_K, Q5_K) que resulta en aproximadamente 2.7–3.0 bits por peso (bpw).

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros, perteneciente a la familia Qwen3.8, con una arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Dispone de una ventana de contexto de 256K tokens, capacidades de visión, razonamiento y soporte para tareas agénticas. En el momento de redactar esta ficha, el repositorio no contiene todavía los archivos de pesos; el autor indica que la biblioteca está preparando el escritor GGUF y los empaquetadores, por lo que el modelo no está operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrida: 16 capas con atención completa, 48 con atención lineal) |
| Parametros totales | 27 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | IQ2_M (mezcla de IQ2_S, IQ3_S, Q4_K, Q5_K) con UD (Unsloth Dynamic) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (previsto, aún no generado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida de atención, una innovación reciente en la familia Qwen3.8. De las 64 capas del transformer, solo 16 ejecutan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante, lo que reduce el coste computacional en contextos largos. El modelo está entrenado para tareas de razonamiento, visión, generación de texto y uso de herramientas, y soporta una ventana de contexto de 256K tokens.

El repositorio en cuestión no modifica la arquitectura del modelo base, sino que aplica una cuantización posterior al entrenamiento. La herramienta NeuralQuant (NQ) implementa el esquema UD (Unsloth Dynamic), que asigna mayor precisión a las capas más sensibles y menor a las menos sensibles, combinado con el esquema IQ2_M de llama.cpp. Este último es una mezcla de cuantizaciones de baja bitness (IQ2_S, IQ3_S, Q4_K, Q5_K) que logra una densidad de aproximadamente 2.7–3.0 bits por peso. El estado del proyecto es experimental: el autor indica que la biblioteca está aún preparando el escritor GGUF y los empaquetadores, por lo que los archivos de pesos no están disponibles en el repositorio.

## Capacidades

Las capacidades listadas corresponden al modelo base Qwen3.8-27B, ya que el repositorio cuantizado aún no contiene pesos operativos:

- Generación de texto y chat de propósito general con instrucciones.
- Razonamiento paso a paso y resolución de problemas matemáticos y lógicos.
- Capacidades de visión: entrada de imágenes y comprensión visual (según la documentación de Cloudflare y Unsloth).
- Soporte para tareas agénticas: uso de herramientas, llamada a funciones y razonamiento multi-paso.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones extensas.
- Capacidades multilingües no especificadas en la información disponible, aunque la familia Qwen suele cubrir múltiples idiomas.

## Casos de uso

Dado que el repositorio es experimental y no contiene pesos, los casos de uso son potenciales, basados en las capacidades del modelo base:

- Asistentes de codificación agénticos: el modelo puede integrarse en entornos de desarrollo para generar, revisar y refactorizar código, aprovechando su soporte para tool calling y razonamiento multi-paso.
- Análisis de documentos extensos: con 256K tokens de contexto, puede procesar manuales técnicos, informes financieros o expedientes legales completos en una sola pasada.
- Sistemas de atención al cliente con contexto largo: capaz de mantener conversaciones multi-turno recordando todo el historial, gracias a la ventana de contexto amplia.
- Aplicaciones de visión por computadora: al aceptar imágenes, puede describir contenido visual, responder preguntas sobre imágenes o extraer información de capturas.
- Despliegue en entornos con recursos limitados: la cuantización IQ2_M (~2.7-3.0 bpw) reduciría el tamaño del modelo a aproximadamente 10-12 GB, permitiendo su ejecución en GPUs de consumo con 12-16 GB de VRAM.
- Investigación en compresión de modelos: el repositorio sirve como banco de pruebas para evaluar el impacto de cuantizaciones extremas combinadas con UD en modelos de 27B con arquitectura híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se proporcionan cifras concretas en los resultados de búsqueda. No se dispone de datos de rendimiento para la cuantización IQ2_M propuesta, y al no existir pesos, no es posible medir latencia ni throughput.

## Requisitos de hardware

- Tamaño estimado del GGUF con cuantización IQ2_M: aproximadamente 10-12 GB (27B parámetros × ~2.8 bpw + overhead), aunque no hay datos confirmados.
- Según Unsloth, el modelo base Qwen3.8-27B en GGUF puede ejecutarse localmente con 17 GB de RAM/VRAM. Con la cuantización IQ2_M, el requisito sería menor, posiblemente en torno a 12-14 GB de VRAM.
- GPUs recomendadas: RTX 3090/4090 (24 GB) o superiores para mayor margen; también podría ejecutarse en GPUs de 16 GB con cuantización agresiva.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta el formato GGUF) o TGI.
- Latencia y throughput: no disponibles, al no existir pesos ni pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agiws/Qwen3.8-27B-NQ-UD-IQ2_M | 27B | 256K | IQ2_M + UD (2.7-3.0 bpw) | Apache-2.0 | Experimental, sin pesos |
| unsloth/Qwen3.8-27B-GGUF | 27B | 256K | GGUF (varias bitness) | Apache-2.0 | Pesos disponibles |
| Qwen/Qwen3.8-27B (original) | 27B | 256K | BF16/FP16 | Apache-2.0 | Pesos disponibles |

La comparativa muestra que el repositorio de agiws se diferencia por su esquema de cuantización extrema (IQ2_M) y su estado inacabado, mientras que Unsloth ofrece GGUF estándar listos para usar. El modelo original en precisión completa requiere mucho más hardware.

## Limitaciones y advertencias

- Repositorio experimental: el modelo no contiene pesos, no es funcional y no debe usarse en producción.
- La cuantización IQ2_M (2.7-3.0 bpw) es extremadamente agresiva y probablemente degrade significativamente la calidad de las respuestas, aumentando el riesgo de alucinaciones y errores de razonamiento.
- No se han publicado evaluaciones de calidad para esta cuantización específica.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de pesos hace que esta consideración sea teórica.
- El modelo base Qwen3.8-27B puede tener sesgos inherentes a sus datos de entrenamiento, no documentados en la información disponible.
- No se especifican idiomas soportados; la familia Qwen suele cubrir inglés, chino y otros, pero no hay confirmación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agiws/Qwen3.8-27B-NQ-UD-IQ2_M
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth para Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
