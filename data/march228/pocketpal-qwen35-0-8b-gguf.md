# march228/pocketpal-qwen35-0.8b-gguf

## Resumen

Pocket Pal — Qwen3.5 0.8B (text-only GGUF) es un paquete de pesos en formato GGUF publicado por el usuario march228 bajo el identificador `march228/pocketpal-qwen35-0.8b-gguf`. Se trata de una extracción del modelo base `Qwen/Qwen3.5-0.8B` en su variante estrictamente de texto, convertida a GGUF mediante `convert_hf_to_gguf.py` y cuantizada con llama.cpp. El autor lo describe explícitamente como un artefacto de empaquetado y prueba para Pocket Pal y otros runtimes móviles, no como un asistente de producción de propósito general.

El modelo suma 752.393.024 parámetros (unos 0,75 B) y se distribuye en dos ficheros: una versión F16 de 1,5 GB y una versión Q4_K_M de aproximadamente 0,6 GB, recomendada para teléfonos con 8 GB de RAM. Ambos ficheros incluyen el tokenizador y la plantilla de chat embebidos, por lo que pueden cargarse como un único archivo en cualquier runtime compatible con GGUF. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es acotada pero clara: cubre el nicho de inferencia local en dispositivos móviles con huella de memoria mínima y sin dependencias de red. Al carecer de adaptador, componente recurrente, codificador de visión o código de entrenamiento, es ante todo un vehículo de despliegue para probar el modelo Qwen3.5-0.8B en entornos con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-0.8B; la model card no detalla la arquitectura interna) |
| Parámetros totales | 752.393.024 (≈0,75 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096–8192 tokens recomendados para uso móvil; máximo del modelo base: no disponible |
| Tipos de cuantización | F16 (sin cuantizar) y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Lo único que se indica es que este paquete es la extracción «text-only stock» del `Qwen/Qwen3.5-0.8B` verificado localmente por el autor, y que no contiene adaptador, componente recurrente, codificador de visión ni código de entrenamiento. No se aportan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Sí se documenta el proceso de conversión y cuantización: conversión a F16 con el script `convert_hf_to_gguf.py` del propio proyecto y cuantización Q4_K_M directamente desde el F16 con llama.cpp. El autor menciona el desactivado del modo «thinking» para respuestas normales, lo que sugiere que el modelo base incorpora un modo de razonamiento, pero no se detalla su funcionamiento técnico ni la innovación concreta que lo sustenta.

## Capacidades

- Generación de texto conversacional en formato chat, usando la plantilla de chat de Qwen embebida en el fichero GGUF.
- Modo de razonamiento («thinking») presente en el modelo base, según la recomendación del autor de desactivarlo para respuestas normales; su implementación no se detalla.
- Inferencia completamente local sin conexión de red, orientada a runtimes móviles.
- Carga como fichero único en runtimes compatibles con GGUF, con tokenizador y plantilla de chat incluidos.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio u otras modalidades: no soportadas; el autor declara explícitamente que no hay codificador de visión ni entradas de audio.

## Casos de uso

- Asistente de chat sin conexión en el móvil: con la cuantización Q4_K_M (≈0,6 GB) y una ventana de 4096–8192 tokens, el modelo puede sostener conversaciones multi-turno en un teléfono de 8 GB de RAM sin acceso a red.
- Aplicaciones de demostración y pruebas de integración: sirve como artefacto de test para validar runtimes GGUF en Android o iOS antes de comprometerse con modelos de mayor tamaño.
- Procesamiento de texto local con requisitos de privacidad: al no salir los datos del dispositivo, encaja en flujos donde no se permite enviar contenido a APIs externas.
- Generación de respuestas cortas embebida en un producto: con un límite de generación de 256–512 tokens recomendado por el autor, es adecuado para respuestas breves dentro de una interfaz móvil.
- Prototipado rápido de plantillas de chat y prompts: al incluir la plantilla de Qwen embebida, permite iterar sobre formatos de conversación sin configuración adicional.
- Evaluación comparativa de cuantizaciones: los dos ficheros publicados (F16 y Q4_K_M) permiten medir la degradación de calidad y el ahorro de memoria entre ambas variantes en el mismo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M ocupa aproximadamente 0,6 GB en disco y el autor lo recomienda para teléfonos de 8 GB de RAM; la variante F16 ocupa 1,5 GB y también cabe en 8 GB, aunque deja menos margen para la aplicación y la caché KV.
- GPU recomendadas: no disponible (el paquete está orientado a CPU y hardware móvil mediante llama.cpp; no se especifican GPU de escritorio o servidor).
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el foco declarado es el despliegue móvil.
- Opciones de despliegue: cualquier runtime compatible con GGUF, en particular llama.cpp y la aplicación Pocket Pal. El resto de opciones (Ollama, vLLM, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los siguientes datos proceden del conocimiento público general sobre esas familias de modelos, no de la información proporcionada en esta ficha; conviene verificarlos en sus respectivas model cards.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Pocket Pal — Qwen3.5 0.8B (este) | 0,75 B | 4096–8192 recomendados | Apache-2.0 | GGUF móvil, solo texto |
| Qwen2.5-0.5B | ≈0,49 B | 32 768 tokens | Apache-2.0 | Modelo base multilingüe |
| Llama-3.2-1B | 1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Base y instruct, multilingüe |
| Gemma-2-2B | 2,6 B | 8192 tokens | Términos de uso de Gemma | Base e instruct |

La comparación directa de rendimiento con estos modelos no está disponible, ya que no se han publicado benchmarks para el paquete de Pocket Pal.

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de empaquetado y prueba, no un asistente de producción de propósito general.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- No hay benchmarks publicados: se desconoce la calidad real frente a alternativas de tamaño similar.
- Riesgo de alucinación: no evaluado en la información disponible; con 0,75 B de parámetros, la fiabilidad factual es intrínsecamente limitada.
- Contexto recomendado de 4096–8192 tokens, muy por debajo de modelos de la misma categoría con ventanas de 32 000 a 128 000 tokens.
- Sin soporte de visión, audio ni otras modalidades; el paquete es estrictamente de texto.
- Soporte de tool calling y de agentes no confirmado.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte y el identificador indica un artefacto de terceros no oficial.
- El repositorio tiene un volumen de adopción muy bajo (89 descargas y 0 likes en el momento de la consulta), lo que implica escasa validación por parte de la comunidad.
- Las fechas del repositorio son posteriores a la fecha actual de referencia, un dato anómalo que conviene tener en cuenta al evaluar su trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/march228/pocketpal-qwen35-0.8b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
