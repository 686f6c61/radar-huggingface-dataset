# DhruvalLabs/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B, un modelo de lenguaje y visión (VLM) desarrollado originalmente por Qwen, que DhruvalLabs ha convertido mediante la herramienta quant-kit. El modelo combina un backbone de texto de 27 000 millones de parámetros con un codificador de visión (mmproj) que permite procesar imágenes y texto de forma conjunta. Esta versión cuantizada resuelve el problema de ejecutar un modelo de este tamaño en hardware de consumo, reduciendo los requisitos de memoria a entre 11 y 16 GB según la cuantización elegida.

La relevancia de este lanzamiento radica en que Qwen3.8 es la generación más reciente de la familia Qwen, con mejoras sustanciales en tareas de codificación agéntica, razonamiento de largo horizonte y uso de herramientas, además de una ventana de contexto de 256 000 tokens. Al estar disponible en GGUF, el modelo puede ejecutarse localmente con llama.cpp, Ollama, LM Studio o Jan, lo que democratiza el acceso a un VLM de última generación sin depender de APIs en la nube.

La arquitectura es de dos componentes: un backbone de texto cuantizado (en versiones Q2_K, Q3_K_L, Q3_K_M, Q3_K_S y Q4_K_S) y un codificador de visión mmproj que se mantiene siempre en precisión F16 para evitar artefactos visuales. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con codificador de vision (mmproj) |
| Parametros totales | 27 320 697 856 (~27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (segun documentacion de Unsloth) |
| Tipos de cuantizacion | Q2_K, Q3_K_L, Q3_K_M, Q3_K_S, Q4_K_S (texto); mmproj en F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de dos componentes tipica de los VLM modernos. El backbone de texto es un transformer decoder basado en la arquitectura de Qwen3.5, sobre la que Qwen3.8 introduce mejoras en razonamiento, codificacion y uso de herramientas. El codificador de vision (mmproj) convierte los pixeles de la imagen en embeddings que se integran con las secuencias de texto. Segun la documentacion de Unsloth, Qwen3.8-27B incorpora capacidades de vision y razonamiento, con modos de pensamiento (thinking) e instruccion (instruct).

No se dispone de informacion detallada sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. La cuantizacion GGUF fue realizada por DhruvalLabs con la herramienta quant-kit, que aplica los esquemas de cuantizacion estandar de llama.cpp. Una innovacion destacable de esta version es que el codificador de vision se mantiene en F16, ya que cuantizarlo provocaria artefactos visuales y degradaria la comprension de imagenes.

## Capacidades

- Generacion de texto y comprension de imagenes (image-text-to-text), permitiendo describir, analizar y responder preguntas sobre contenido visual.
- Razonamiento multimodal con modos de pensamiento (thinking) e instruccion (instruct), segun la documentacion de Groq.
- Codificacion agéntica de nivel frontera, con soporte para tareas de programacion complejas y uso de herramientas de largo horizonte.
- Ventana de contexto de 256 000 tokens, adecuada para documentos extensos y conversaciones multi-turno con historial amplio.
- Capacidad conversacional integrada, compatible con formatos de chat estandar.
- Soporte de tool calling y agentes autonomos, aunque la model card no detalla la implementacion especifica en esta cuantizacion.

## Casos de uso

- Analisis de imagenes en soporte tecnico: el modelo puede recibir capturas de pantalla o fotos de errores y generar explicaciones detalladas, gracias a su codificador de vision y su contexto de 256K tokens para mantener el historial de la conversacion.
- Asistente de documentacion visual: procesar diagramas, esquemas o graficos y transcribirlos a texto estructurado, util para equipos de documentacion tecnica.
- Generacion de codigo asistida por capturas: un desarrollador puede adjuntar una imagen de una interfaz o un error de consola y el modelo sugiere correcciones o implementaciones, aprovechando sus capacidades de codificacion agéntica.
- Agentes de automatizacion de UI: el modelo puede interpretar pantallas de aplicaciones y ejecutar acciones mediante tool calling, lo que permite construir agentes que navegan interfaces graficas.
- Procesamiento de documentos escaneados: combinar OCR visual con razonamiento textual para extraer y resumir informacion de facturas, contratos o formularios.
- Educacion interactiva: explicar conceptos a partir de imagenes o diagramas en tiempo real, con un contexto largo que permite mantener sesiones de tutoria prolongadas.
- Despliegue local en entornos con restricciones de privacidad: al ejecutarse en GGUF con llama.cpp u Ollama, el modelo procesa datos sensibles sin enviarlos a la nube, con requisitos de RAM de 11 a 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con otros modelos. Tampoco se proporcionan datos de latencia o throughput en la documentacion de DhruvalLabs.

## Requisitos de hardware

- Q2_K: 10,12 GB de archivo, ~11,6 GB de RAM requerida.
- Q3_K_S: 11,41 GB de archivo, ~12,9 GB de RAM requerida.
- Q3_K_M: 12,57 GB de archivo, ~14,1 GB de RAM requerida.
- Q3_K_L: 13,56 GB de archivo, ~15,1 GB de RAM requerida.
- Q4_K_S: 14,74 GB de archivo, ~16,2 GB de RAM requerida.
- mmproj (vision encoder): 0,86 GB adicionales, siempre en F16.
- Segun Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM combinados.
- GPU recomendadas: tarjetas con 16-24 GB de VRAM (por ejemplo, RTX 4090, RTX 4080, A6000) para la cuantizacion Q4_K_S; cuantizaciones menores pueden caber en GPUs de 12 GB (RTX 3080, RTX 4070) o incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (llama-llava-cli para multimodal), llama-cpp-python, Ollama, LM Studio y Jan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DhruvalLabs/Qwen3.8-27B-GGUF | 27B | 256K | GGUF | Apache 2.0 | Cuantizacion de Qwen3.8-27B con mmproj F16 |
| unsloth/Qwen3.8-27B-GGUF | 27B | 256K | GGUF | Apache 2.0 | Cuantizacion alternativa del mismo modelo base, tambien disponible en ModelScope |
| Qwen/Qwen3.8-27B (original) | 27B | 256K | safetensors | Apache 2.0 | Modelo base sin cuantizar, requiere mas VRAM |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia entre las cuantizaciones de DhruvalLabs y Unsloth radica en la herramienta de cuantizacion utilizada y los esquemas de bits disponibles, aunque ambas mantienen el mismo modelo base y la misma licencia.

## Limitaciones y advertencias

- El modelo solo soporta ingles (segun la etiqueta de idioma en HuggingFace), lo que limita su uso en otros idiomas sin traduccion previa.
- Las cuantizaciones Q2_K y Q3_K presentan perdidas de calidad notables; se recomienda Q4_K_S para un equilibrio razonable entre tamano y fidelidad.
- El codificador de vision mmproj debe mantenerse en F16; cuantizarlo degrada la comprension de imagenes.
- Se requieren dos archivos (backbone de texto y mmproj) para el funcionamiento multimodal; omitir uno de ellos impide el uso completo del modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con imagenes ambiguas.
- No se han publicado evaluaciones de sesgos ni pruebas de robustez especificas para esta cuantizacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DhruvalLabs/Qwen3.8-27B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion quant-kit: https://github.com/DhruvalPtl/quant-kit
- Cuantizacion alternativa de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Ficha de Groq para Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
