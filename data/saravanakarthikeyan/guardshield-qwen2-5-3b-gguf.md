# saravanakarthikeyan/GuardShield-Qwen2.5-3B-GGUF

## Resumen

GuardShield-Qwen2.5-3B-GGUF es un modelo de moderación de contenido y guardrail de seguridad, desarrollado por saravanakarthikeyan a partir del modelo base Qwen/Qwen2.5-3B-Instruct. Está diseñado específicamente para clasificar prompts como seguros o dañinos y devolver una salida estructurada en JSON, lo que lo convierte en una herramienta práctica para integrar capas de protección en sistemas de IA generativa. Su relevancia actual radica en la creciente necesidad de implementar salvaguardas automatizadas en aplicaciones de producción, especialmente en entornos con recursos limitados.

El modelo se distribuye en formato GGUF con cuantización Q4_K_M, lo que permite su ejecución eficiente en CPU sin necesidad de GPU dedicada. Con aproximadamente 3.09 mil millones de parámetros y un peso de archivo de 1.9 GB, ocupa unos 2.2 GB de RAM en tiempo de ejecución y alcanza un rendimiento de 30 a 55 tokens por segundo en CPUs portátiles estándar. La salida es un JSON determinista con campos como `status`, `category` y `reasoning`, lo que facilita su integración en pipelines automatizados.

El modelo está pensado para su uso mediante Ollama o llama.cpp, y su licencia Apache-2.0 permite uso comercial sin restricciones significativas. Aunque solo soporta inglés, su enfoque en moderación de contenido y su bajo requisito de hardware lo hacen adecuado para despliegues en el borde, dispositivos embebidos y entornos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta hasta 128K, pero no se especifica para esta variante) |
| Tipos de cuantizacion | Q4_K_M (unico formato distribuido) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `unsloth.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

GuardShield-Qwen2.5-3B-GGUF es una adaptacion fine-tuned del modelo Qwen2.5-3B-Instruct, que pertenece a la familia Qwen2.5 de Alibaba. La arquitectura base es un transformer denso, decoder-only, con 3.09 mil millones de parametros, preentrenado en un dataset de hasta 18 billones de tokens segun el reporte tecnico de Qwen2.5. El modelo base fue sometido a un proceso de instruccion y alineacion (RLHF) durante su desarrollo original.

Sobre esta base, el autor de GuardShield ha realizado un fine-tuning especifico para la tarea de moderacion de contenido. El modelo esta entrenado para analizar un prompt de entrada y producir una clasificacion JSON determinista con tres campos: `status` (SAFE o UNSAFE), `category` (tipo de contenido) y `reasoning` (explicacion breve). La salida es determinista, lo que implica que se usa temperatura 0.0 y top_p 1.0 en la configuracion de inferencia, garantizando que la misma entrada produzca siempre la misma salida. No se han publicado detalles sobre el dataset de fine-tuning ni el proceso exacto de entrenamiento.

## Capacidades

- Moderacion de contenido: clasifica prompts como seguros o dañinos, con una precision de recall del 86.35% para contenido dañino.
- Salida estructurada en JSON: genera respuestas en un esquema fijo (`status`, `category`, `reasoning`), lo que facilita el parseo automatico.
- Clasificacion de categorias: distingue entre contenido benigno, casos limite y categorias de riesgo, con una precision del 92.95% para clasificacion benigna.
- Ejecucion en CPU: optimizado para inferencia local sin GPU, con un consumo de memoria de aproximadamente 2.2 GB.
- Compatibilidad con Ollama y llama.cpp: se integra directamente con estas herramientas de despliegue.
- Determinismo: configurado para producir salidas identicas ante la misma entrada, util para auditorias y pruebas automatizadas.
- Generacion de texto: aunque su funcion principal es la moderacion, mantiene la capacidad generativa del modelo base Qwen2.5-3B-Instruct.

## Casos de uso

- Filtro de prompts en aplicaciones de chat: integrar GuardShield como capa previa a un LLM generativo para bloquear solicitudes dañinas antes de que lleguen al modelo principal. Su salida JSON permite decidir automaticamente si se procesa o se rechaza la peticion.
- Moderacion en tiempo real en foros o redes sociales: desplegar el modelo en un servidor con CPU para analizar comentarios de usuarios y marcar aquellos que violen las politicas de contenido, con un throughput de 30-55 tokens/s.
- Guardrail en pipelines de generacion de codigo: verificar que las instrucciones dadas a un asistente de codigo no intenten explotar vulnerabilidades o realizar acciones maliciosas, como inyeccion de SQL o bypass de autenticacion.
- Auditoria de logs de interaccion: procesar historiales de conversaciones con LLMs para identificar intentos de jailbreak o prompts maliciosos, generando un reporte JSON por cada entrada analizada.
- Entornos de desarrollo y pruebas: usar el modelo en CI/CD para validar automaticamente que los prompts de prueba no contengan contenido inapropiado antes de ejecutar suites de evaluacion.
- Dispositivos de borde y aplicaciones offline: al ejecutarse en CPU con solo 2.2 GB de RAM, es viable en portatiles, Raspberry Pi o dispositivos embebidos para moderacion local sin conexion a internet.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor. No se han encontrado benchmarks independientes en la informacion disponible.

| Metrica | Valor | Objetivo |
|---|---|---|
| Safety Recall (contenido dañino detectado) | 86.35% | >= 85% |
| Precision de clasificacion benigna | 92.95% | >= 90% |
| Adherencia al esquema JSON | 100.0% (0 fallos en 1000 pruebas) | > 99.5% |
| Macro F1-Score | 0.8237 | >= 0.80 |

No se han publicado resultados de benchmarks comparativos con otros modelos de moderacion en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; funciona exclusivamente en CPU.
- RAM: aproximadamente 2.2 GB en tiempo de ejecucion con cuantizacion Q4_K_M.
- CPU recomendada: cualquier procesador de 4 nucleos o superior; se ha probado en portatiles estandar con rendimiento de 30-55 tokens/s.
- GPU: opcional; si se dispone de una GPU, puede acelerarse la inferencia, pero no es necesaria.
- Compatibilidad con consumer GPU: no aplica, ya que esta disenado para CPU.
- Opciones de despliegue: Ollama (mediante `ollama run` o Modelfile), llama.cpp (CLI), y cualquier framework compatible con GGUF como llama-cpp-python.
- Latencia: no se especifica en la documentacion, pero el throughput de 30-55 tokens/s sugiere una latencia de respuesta de aproximadamente 2-4 segundos para una salida de 128 tokens.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de moderacion de contenido comparables en la documentacion proporcionada. Como referencia, el modelo base Qwen2.5-3B-Instruct tiene 3.09 mil millones de parametros, soporta hasta 128K de contexto y esta disponible en multiples tamanos (0.5B a 72B). Otros modelos de guardrail como Llama Guard 2 o OpenAI Moderation no tienen una version GGUF publicada en la informacion disponible, por lo que no se puede realizar una comparacion directa.

## Limitaciones y advertencias

- Idioma: solo soporta ingles; no se ha entrenado para otros idiomas, lo que limita su uso en entornos multilingues.
- Cobertura de categorias: la clasificacion se limita a las categorias definidas en el entrenamiento; puede no detectar todos los tipos de contenido dañino, especialmente variantes novedosas o contextuales.
- Riesgo de falsos positivos: con un recall del 86.35%, aproximadamente un 14% de contenido dañino podria no ser detectado; la precision del 92.95% implica que alrededor de un 7% de contenido benigno podria ser marcado como dañino.
- Salida determinista: al fijar temperatura 0.0, el modelo no puede generar respuestas variadas, lo que es adecuado para moderacion pero limita su uso en tareas generativas.
- Contexto limitado: no se especifica la longitud de contexto para esta variante; si se hereda la del modelo base (128K), el analisis de prompts muy largos podria verse afectado por el coste computacional.
- Dependencia del modelo base: cualquier limitacion de Qwen2.5-3B-Instruct (sesgos, alucinaciones) puede estar presente en esta adaptacion.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base Qwen2.5 para confirmar la ausencia de restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saravanakarthikeyan/GuardShield-Qwen2.5-3B-GGUF
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Reporte tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
