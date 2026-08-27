# sodan/dan-omni-3b-q3s

## Resumen

`dan-omni-3b-q3s` es una variante cuantizada de forma agresiva del modelo `dan-omni-3b`, desarrollado por el usuario sodan sobre la base de Qwen2.5-3B. El modelo original fue afinado con LoRA sobre datos de instrucción optimizados para dispositivos móviles, y esta versión Q3_K_S reduce el tamaño del archivo a aproximadamente 1,5-1,6 GB, lo que permite ejecutarlo en entornos con memoria muy limitada (unos 2 GB de RAM) manteniendo una calidad aceptable para la mayoría de tareas conversacionales.

La relevancia de este modelo radica en su equilibrio entre velocidad y huella de memoria: es un 25% más pequeño que la variante Q4_K_M y un 13% más rápido en inferencia, según los datos del autor. Está pensado para dispositivos con 2-3 GB de RAM disponibles, como portátiles modestos, mini-PCs o incluso algunos móviles, sin necesidad de GPU dedicada. Es un modelo exclusivamente de texto (no multimodal), con una ventana de contexto de 4096 tokens y licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B base) |
| Parametros totales | 3.397.103.616 (~3,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q3_K_S (esta variante); otras variantes de la familia: Q4_K_M, cuantizaciones móviles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B, un transformer denso de 3,4 mil millones de parametros. Sobre esta base se aplico un afinamiento con LoRA (Low-Rank Adaptation) utilizando datos de instruccion especificamente disenados para asistentes en moviles, con un system prompt que define al asistente "dan" como un ayudante util, conciso y natural para tareas generales, escritura, matematicas, codigo, traduccion y creatividad.

La innovacion principal de esta variante no esta en la arquitectura, sino en la cuantizacion Q3_K_S, que reduce el peso del modelo a aproximadamente 1,5 GB (frente a los 2,0 GB de la version Q4_K_M). Esta cuantizacion agresiva sacrifica algo de fidelidad en tareas de razonamiento complejo, pero acelera la inferencia y reduce el consumo de memoria. El autor reporta una velocidad media de 12,8 tokens por segundo en CPU (Intel i9-9880H) con Ollama, frente a los 11,3 tok/s de la variante Q4_K_M.

## Capacidades

- Generacion de texto conversacional: respuestas concisas y naturales para preguntas generales, escritura creativa, traduccion y tareas de conocimiento general.
- Razonamiento basico y matematicas: capaz de resolver problemas aritmeticos y logicos sencillos, aunque con posible degradacion en razonamiento complejo debido a la cuantizacion Q3_K_S.
- Generacion de codigo: puede producir fragmentos de codigo en varios lenguajes, con un rendimiento medio de 13,3 tok/s en la categoria coding segun el autor.
- Seguimiento de instrucciones: responde adecuadamente a instrucciones explicitas, con un rendimiento de 13,1 tok/s en esta categoria.
- No soporta tool calling ni function calling: no se menciona esta capacidad en la documentacion.
- No es multimodal: a diferencia de otras variantes de la familia dan-omni, esta version es exclusivamente de texto.
- No incluye modo de pensamiento (thinking mode) ni capacidades de audio o vision.

## Casos de uso

- Asistente conversacional en dispositivos con poca memoria: ideal para portatiles antiguos, mini-PCs o routers con 2-3 GB de RAM libre, donde otros modelos de 3B no caben. Se puede ejecutar con Ollama o llama.cpp sin GPU.
- Chatbot de atencion al cliente en entornos con recursos limitados: su ventana de 4096 tokens permite mantener conversaciones multi-turno de longitud media, y su licencia Apache 2.0 permite su integracion en productos comerciales.
- Generacion de codigo en entornos de desarrollo sin GPU: un desarrollador puede usarlo localmente para autocompletar o generar fragmentos de codigo, con una velocidad de ~13 tok/s en CPU, suficiente para uso interactivo.
- Traduccion y escritura creativa en aplicaciones offline: al ser un modelo pequeno y rapido, puede integrarse en aplicaciones de escritorio o moviles que requieran procesamiento local sin conexion.
- Prototipado rapido de agentes conversacionales: su facil despliegue con Ollama (un solo comando) lo hace util para probar ideas de chatbots o asistentes antes de migrar a modelos mas grandes.
- Educacion y aprendizaje: como modelo de demostracion para ensenar conceptos de cuantizacion, inferencia en CPU y despliegue local, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona mediciones de velocidad de inferencia en CPU, que se resumen a continuacion:

| Categoria | Velocidad media (tok/s) | Prompt (tok/s) | Tokens generados | Tiempo |
|---|---|---|---|---|
| Razonamiento | 12,2 | 82,7 | 160 | 13,1 s |
| Codigo | 13,3 | 82,7 | 190 | 14,3 s |
| Escritura creativa | 13,0 | 82,7 | 59 | 4,5 s |
| Seguimiento de instrucciones | 13,1 | 82,7 | 47 | 3,6 s |
| Matematicas | 12,7 | 82,7 | 93 | 7,3 s |
| Conocimiento general | 12,7 | 82,7 | 28 | 2,2 s |
| **Media** | **12,8** | **82,7** | **96** | **7,5 s** |

Estas mediciones se realizaron en un Intel i9-9880H @ 2,30 GHz con 16 GB de RAM y runtime Ollama. No hay datos comparativos de calidad frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU con aproximadamente 2 GB de RAM libre (segun el autor).
- GPU recomendadas: no es necesario; si se desea usar GPU, cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) seria suficiente, aunque no se han publicado mediciones en GPU.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU moderna de gama baja, pero el modelo esta disenado principalmente para CPU.
- Opciones de despliegue: Ollama (comando `ollama pull sodan/dan-omni-3b-q3s`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: en CPU Intel i9-9880H, velocidad media de 12,8 tok/s de generacion y 82,7 tok/s de procesamiento de prompt. En GPU seria previsiblemente mas rapido, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Tamano | Velocidad (tok/s) | Calidad | RAM estimada | Contexto |
|---|---|---|---|---|---|
| **dan-omni-3b-q3s** | 1,5 GB | 12,8 | Media-alta | ~2 GB | 4096 |
| dan-omni-3b (Q4_K_M) | 2,0 GB | 11,3 | Alta | ~2,5 GB | 4096 |
| dan-omni-3b-mobile | 1,2 GB | 9,8 | Media-alta | ~1,5 GB | 2048 |
| Qwen2.5-3B (base) | ~1,9 GB | ~12 | Alta | ~2,5 GB | 32768 (segun modelo base) |
| Command-R7B | ~4,0 GB | ~8 | Alta | ~5 GB | no disponible |

Nota: los datos de velocidad, tamano y RAM provienen de la model card del autor. El contexto de Qwen2.5-3B base es de 32K tokens, pero esta variante esta limitada a 4096. Command-R7B es un modelo de mayor tamano incluido por el autor como referencia, no un competidor directo.

## Limitaciones y advertencias

- La cuantizacion Q3_K_S introduce mas ruido que Q4_K_M, lo que puede causar degradacion notable en tareas de razonamiento complejo o logica multi-paso.
- No es multimodal: a diferencia de otras variantes de la familia dan-omni, esta version no procesa imagenes, audio ni video.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La ventana de contexto esta limitada a 4096 tokens, inferior a los 32K del modelo base Qwen2.5-3B, lo que restringe conversaciones muy largas o documentos extensos.
- Riesgo de alucinacion: como cualquier modelo de 3B, puede generar informacion incorrecta o inventada, especialmente en tareas de conocimiento general.
- No se han publicado evaluaciones de sesgos ni de seguridad; se recomienda validar el comportamiento en entornos de produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es una creacion de un tercero (sodan) y no tiene garantias de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sodan/dan-omni-3b-q3s
- Modelo base de la familia: https://huggingface.co/sodan/dan-omni-3b
- Variante movil: https://huggingface.co/sodan/dan-omni-3b-mobile
- Variante ultraligera: https://huggingface.co/sodan/dan-omni-smolm2
- Variante ultraligera v2: https://huggingface.co/sodan/dan-omni-smolm2-v2
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
