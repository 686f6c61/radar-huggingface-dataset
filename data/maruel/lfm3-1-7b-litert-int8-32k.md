# maruel/LFM3-1.7B-LiteRT-INT8-32K

## Resumen

LFM3-1.7B-LiteRT-INT8-32K es una conversión cuantizada del modelo LiquidAI/LFM3-1.7B de Liquid AI, empaquetada en formato LiteRT-LM para su ejecución en dispositivos Android. El autor de la conversión es maruel, y el artefacto resultante es un bundle de 1,8 GB que incluye pesos en INT8, tokenizador y plantilla de chat adaptada para la reproducción de conversaciones en el runtime de LiteRT. No se trata de un modelo nuevo, sino de una distribución optimizada del checkpoint original de 1.700 millones de parámetros.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI, orientada a generación de texto y conversación. Esta versión concreta mantiene una capacidad de contexto de 32.768 tokens y almacena el estado KV y recurrente en `float16`, mientras que las matrices de pesos se cuantizan a INT8 por canal. Es relevante para desarrolladores que necesitan desplegar inferencia local en Android sin depender de la nube, aunque con las limitaciones propias de un runtime móvil y de una cuantización agresiva.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No hay datos públicos sobre composición del dataset, resultados de benchmarks ni idiomas soportados en la información proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura) |
| Parametros totales | 1.700 millones (1.7B, según el nombre del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | INT8 por canal en matrices de pesos; constantes de convolución y normalización en FP32; estado KV y recurrente en FP16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | LiteRT-LM (bundle `.litertlm`); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna del modelo base. Se sabe que el checkpoint original es LiquidAI/LFM3-1.7B, de Liquid AI, y que esta distribución es una relación `quantized` respecto a él. El bundle `LFM3-1.7B_int8_32k_fp16.litertlm` incluye tokenizador y plantilla de chat adaptada para LiteRT, lo que sugiere un pipeline de exportación específico para el runtime móvil.

El proceso de conversión aplica cuantización INT8 por canal a las matrices de pesos, mantiene en FP32 las constantes de convolución y normalización, y conserva en FP16 el estado KV y recurrente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo base en la información proporcionada. El script de exportación está publicado en el repositorio `maruel/gomode` (`scripts/export_lfm_litert.py`), lo que permite reproducir o adaptar la conversión.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Soporte de tool calling mediante el formato XML-like entrenado de LFM3, que requiere análisis y parseo en el cliente; el autor implementa esta lógica en Go Mode.
- Contexto de 32.768 tokens, adecuado para conversaciones largas o documentos extensos dentro de las limitaciones del runtime móvil.
- Ejecución local en Android a través de LiteRT-LM, sin necesidad de conexión a servicios remotos.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode) en la información disponible.
- El soporte multilingüe no está especificado en la model card.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones Android: el bundle LiteRT-LM permite integrar un chatbot local con contexto de 32K tokens, útil para aplicaciones de productividad o atención al usuario que deben funcionar sin conexión.
- Procesamiento de documentos en el dispositivo: la ventana de 32.768 tokens permite resumir o extraer información de contratos, correos o notas largas sin enviar datos a la nube, lo que reduce riesgos de privacidad.
- Automatización de tareas con tool calling: el formato XML-like de LFM3 permite que el modelo emita llamadas a funciones que el cliente parsea y ejecuta, por ejemplo para consultar calendarios, bases de datos locales o APIs internas.
- Prototipado de agentes móviles: gracias al soporte de conversación multi-turno y tool calling, se pueden construir flujos de varios pasos en los que el modelo decide qué herramienta invocar en cada iteración.
- Aplicaciones de accesibilidad: dictado, reescritura o simplificación de texto en tiempo real en dispositivos Android de gama media, aprovechando la cuantización INT8 para reducir el consumo de memoria.
- Educación y aprendizaje de idiomas: generación de ejercicios, corrección de respuestas o conversación guiada en local, sin cuotas de API ni latencia de red.
- Filtrado y clasificación de texto en el borde: el modelo puede etiquetar o resumir contenido entrante en un dispositivo antes de decidir si se envía a un servidor, reduciendo el tráfico y el coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 1,8 GB en disco; en ejecución, el runtime LiteRT-LM necesita cargar los pesos INT8 más el estado KV y recurrente en FP16 para 32K tokens, por lo que se recomienda un dispositivo con al menos 3-4 GB de RAM libre.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es Android con aceleración LiteRT (CPU, GPU o NPU según el dispositivo). No se especifican modelos de GPU compatibles.
- Cabe en GPU de consumo: no disponible; el formato `.litertlm` está orientado a dispositivos móviles, no a GPUs de escritorio.
- Opciones de despliegue: LiteRT-LM en Android; el autor proporciona el script de exportación en `maruel/gomode`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT-INT8-32K | 1.7B | 32.768 | LiteRT-LM INT8 | LFM Open License v1.0 | Hugging Face (12 descargas) |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1-2B para movil | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- La cuantización INT8 puede degradar la calidad de generación respecto al checkpoint original en FP16/BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El tool calling requiere parseo en el cliente del formato XML-like de LFM3; no es un formato estándar y añade complejidad de integración.
- El modelo está empaquetado para LiteRT-LM en Android; no es directamente utilizable en otros runtimes sin un proceso de conversión adicional.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; se recomienda evaluar en el dominio objetivo antes de producción.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo `LICENSE` antes de desplegar.
- El repositorio tiene un volumen muy bajo de descargas (12) y ninguna valoración, lo que reduce la evidencia comunitaria sobre su estabilidad.
- El contexto de 32K tokens en un dispositivo móvil puede agotar la memoria disponible; conviene limitar la longitud efectiva según el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maruel/LFM3-1.7B-LiteRT-INT8-32K
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio Go Mode: https://github.com/maruel/gomode
- Script de exportación: https://github.com/maruel/gomode/blob/main/scripts/export_lfm_litert.py
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
