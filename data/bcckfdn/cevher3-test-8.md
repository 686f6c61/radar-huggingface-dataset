# bcckfdn/cevher3-test-8

## Resumen

cevher3-test-8 es un modelo de lenguaje de tipo decoder-only con arquitectura Gemma3-SWA (atención con ventana deslizante), desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Con 1.256.312.832 parámetros (aproximadamente 1,25 mil millones), está orientado a la generación de texto conversacional en turco e inglés, lo que lo posiciona como un modelo compacto de propósito general para aplicaciones de chat y generación de texto de baja latencia.

La arquitectura sigue el diseño de Gemma3 en su variante de ventana deslizante (SWA), con 34 capas, dimensión oculta de 1792 y una configuración de atención de 28 cabezas de consulta frente a 4 cabezas de clave/valor (GQA). El modelo declara una longitud de contexto de 8192 tokens, un vocabulario de 65.536 entradas y un entrenamiento sobre 15.209 billones de tokens, alcanzando una pérdida de validación de 2,8047.

El modelo es relevante por su tamaño reducido y su enfoque bilingüe turco-inglés, lo que lo hace desplegable en hardware de consumo y útil para tareas de generación de texto y conversación en entornos con recursos limitados. No obstante, se trata de una publicación de prueba (el sufijo "test-8" sugiere un experimento), sin descargas ni interacciones registradas en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3-SWA, atención con ventana deslizante) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only basada en el diseño Gemma3 con atención de ventana deslizante (SWA), que limita el coste computacional de la atención a ventanas locales y permite manejar contextos de 8192 tokens con menor sobrecarga que una atención global completa. La configuración concreta incluye 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (atención agrupada, GQA), y un vocabulario de 65.536 tokens.

El entrenamiento se realizó sobre 15.209 billones de tokens, alcanzando una pérdida de validación de 2,8047. No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO, ni sobre técnicas adicionales como decodificación especulativa o atención lineal. La model card no detalla estos aspectos, por lo que no es posible confirmarlos.

## Capacidades

- Generación de texto autorregresiva en turco e inglés.
- Conversación multi-turno (etiqueta "conversational" en los metadatos).
- Razonamiento básico y generación de texto general derivado del preentrenamiento.
- No se dispone de evidencia de soporte de tool calling, function calling ni agentes multi-paso.
- No se dispone de evidencia de capacidades de visión, audio o modo "thinking".
- Capacidades multilingües limitadas a turco e inglés según los metadatos.

## Casos de uso

- Chat de atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno en turco gracias a su entrenamiento bilingüe y a una ventana de contexto de 8192 tokens, adecuada para hilos de conversación moderadamente largos.
- Generación de respuestas en inglés para asistentes virtuales: su tamaño compacto (1,25 mil millones de parámetros) permite desplegarlo en entornos con recursos limitados para tareas de respuesta automática.
- Prototipado rápido de aplicaciones de texto: al ser un modelo pequeño y con pesos en safetensors, se puede cargar con transformers en minutos para experimentación.
- Traducción informal turco-inglés en contextos conversacionales: aunque no se declara como modelo de traducción, su exposición bilingüe permite generar borradores de traducción en dominios cotidianos.
- Generación de contenido breve (correos, mensajes, descripciones) en turco: adecuado para tareas de redacción asistida de baja complejidad.
- Despliegue en hardware de consumo para demos y pruebas: su tamaño permite ejecución en GPU de gama media o incluso en CPU con cuantización, aunque no se documentan formatos de cuantización.
- Filtrado y clasificación de texto en turco mediante generación condicionada: útil como base para tareas de etiquetado simple con prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5 GB para los pesos (1,256 mil millones de parámetros × 4 bytes).
- VRAM estimada en bf16/fp16: aproximadamente 2,5 GB para los pesos, más memoria para el contexto y activaciones.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en fp16; en cuantización de 8 bits cabría en GPUs de 4-6 GB (aunque no se documentan formatos de cuantización oficiales).
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta "text-generation-inference" y "endpoints_compatible"); no se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher3-test-8 | 1.256.312.832 | 8192 | tr, en | Apache 2.0 | Hugging Face (0 descargas) |
| Gemma 3 1B (variante oficial) | ~1B | no disponible en esta ficha | múltiples | Gemma license | Hugging Face |
| Llama 3.2 1B | ~1,2B | 131072 | múltiples | Llama license | Hugging Face |
| Qwen2.5 1.5B | ~1,5B | 32768 | múltiples | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para cevher3-test-8, por lo que la comparación se limita a parámetros, contexto y licencia. Los modelos alternativos citados son referencias de la misma categoría de tamaño, pero sus cifras exactas no se detallan en esta ficha por falta de información verificada en la búsqueda.

## Limitaciones y advertencias

- Modelo de prueba: el sufijo "test-8" y la ausencia de descargas e interacciones sugieren que se trata de un experimento no validado para producción.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir contenido factualmente incorrecto, especialmente en dominios especializados.
- Sesgos conocidos: no se documentan sesgos específicos, pero el entrenamiento bilingüe turco-inglés puede reflejar sesgos de los datos subyacentes.
- Limitaciones de idioma: solo turco e inglés; no se garantiza calidad en otros idiomas.
- Limitaciones de contexto: ventana de 8192 tokens, inferior a modelos contemporáneos con contextos de 32K o más.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Falta de documentación: no se detallan datos de entrenamiento, cuantizaciones ni benchmarks, lo que dificulta evaluar su calidad real.
- Caveat para producción: al no haber evidencia de tool calling ni de robustez conversacional, no se recomienda para pipelines críticos sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-8
