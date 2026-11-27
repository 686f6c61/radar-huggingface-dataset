# 1bit-MONSTER/phi-2-GGUF

## Resumen

phi-2-GGUF es una redistribución del modelo Phi-2 de Microsoft en formato GGUF con cuantización Q4_K_M, publicada por el usuario 1bit-MONSTER. El modelo base, Phi-2, es un transformer decoder-only de 2.780 millones de parámetros (2,7 B) entrenado por Microsoft Research, diseñado originalmente para demostrar que modelos de tamaño pequeño pueden alcanzar capacidades de razonamiento y código competitivas con modelos significativamente mayores cuando se entrenan con datos sintéticos de alta calidad ("textbook quality").

La relevancia de esta ficha concreta no reside en el modelo en sí, sino en el paquete de distribución: el autor reempaqueta la cuantización Q4_K_M de TheBloke y publica métricas de rendimiento medidas sobre hardware Strix Halo (APU de AMD) usando el motor propietario "1bit engine" con backend Vulkan, posteriormente sustituido por una ruta denominada HRX GPU. El repositorio ocupa 1,8 GB y está pensado para ejecución local en hardware de consumo.

Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: no aporta pesos nuevos ni fine-tuning, sino una conversión de formato con documentación de throughput. Para cualquier uso en producción conviene referirse al modelo base original de Microsoft y a la cuantización canónica de TheBloke, ya que esta copia tiene un historial de descargas muy bajo (27 descargas, 0 likes) y no ofrece garantías adicionales de integridad más allá de la licencia MIT heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-2 de Microsoft) |
| Parametros totales | 2.779.683.840 (2,78 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-2 declara 2.048 tokens; este dato no se confirma en la model card de la redistribucion) |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido: `phi-2.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,8 GB |
| Modelo base | microsoft/phi-2 |
| Cuantizacion de origen | TheBloke/phi-2-GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base Phi-2 de Microsoft: un transformer decoder-only de 2,78 B parámetros. Esta redistribución no modifica ni reentrena pesos; únicamente aplica la cuantización Q4_K_M generada por TheBloke sobre los pesos originales en safetensors y los empaqueta en GGUF. Por tanto, los detalles de entrenamiento (número de tokens, composición del corpus sintético "textbook quality", fases de alineación) son los del Phi-2 original y no se documentan en esta model card.

La innovación técnica documentada por el autor es de infraestructura, no de modelado: se publican métricas de rendimiento medidas en septiembre de 2026 sobre una APU Strix Halo con backend Vulkan del "1bit engine" (pp512: 3210 tok/s en prefill, tg128: 91,3 tok/s en generación). El autor advierte que ese backend Vulkan ha sido eliminado del motor y que las cifras sobre la ruta actual HRX GPU están pendientes de remedición, por lo que los números publicados no son representativos del estado actual del software.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Phi-2.
- Generación y explicación de código, capacidad destacada del modelo base original.
- Razonamiento matemático de nivel básico-intermedio (operaciones aritméticas, problemas de enunciado simple).
- Ejecución local en CPU/GPU de consumo mediante llama.cpp y motores compatibles con GGUF.
- Integración con el motor propietario "1bit engine" del autor mediante el comando `1bit serve -m phi-2.Q4_K_M.gguf --device hrx`.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.
- Cobertura multilingüe: no disponible (no declarada).

## Casos de uso

- Prototipado local de asistentes de texto: el archivo Q4_K_M de 1,8 GB cabe en equipos con poca VRAM o incluso en CPU, lo que permite levantar un endpoint de generación de texto en minutos con llama.cpp u Ollama para pruebas de concepto.
- Generación de código en entornos sin conectividad: al heredar las capacidades de código de Phi-2, puede usarse como autocompletado o asistente de snippets en estaciones de trabajo aisladas donde no se permite enviar código a APIs externas.
- Evaluación de motores de inferencia GGUF: las métricas de prefill y generación publicadas (3210 tok/s pp512, 91,3 tok/s tg128 en Strix Halo con Vulkan) sirven como referencia para comparar backends alternativos en hardware similar.
- Enseñanza y experimentación con cuantización: el repositorio permite estudiar el impacto de Q4_K_M sobre un modelo de 2,78 B comparando salidas con los pesos originales en safetensors del modelo base.
- Tareas de resumen y reescritura de documentos cortos: adecuado para pipelines batch de bajo coste donde la ventana de contexto corta del modelo base sea suficiente.
- Pruebas de integración continua de aplicaciones LLM: el tamaño reducido permite incluirlo en imágenes de contenedor de test para validar pipelines de prompt, parsing de salida y manejo de errores sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye métricas de throughput del motor de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| pp512 (prefill) | 3210 tok/s | Strix Halo, backend Vulkan, septiembre 2026 |
| tg128 (generacion) | 91,3 tok/s | Strix Halo, backend Vulkan, septiembre 2026 |

El autor indica que el backend Vulkan fue eliminado y que las cifras sobre la ruta HRX GPU están pendientes de nueva medición, por lo que estos valores deben tratarse como históricos y no como rendimiento actual del motor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2,5 GB con Q4_K_M (tamaño del archivo más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM; el autor reporta mediciones en APU AMD Strix Halo. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060 y superiores) y también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), motores compatibles con GGUF (Ollama, llama-cpp-python, entre otros) y el motor propietario "1bit engine" del autor mediante `1bit serve --device hrx`.
- Latencia y throughput: 3210 tok/s en prefill y 91,3 tok/s en generación sobre Strix Halo con Vulkan (medición histórica, backend retirado). No hay datos de latencia para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/phi-2-GGUF (esta ficha) | 2,78 B | no disponible | GGUF Q4_K_M | MIT | 27 descargas, repo de 1,8 GB |
| TheBloke/phi-2-GGUF | 2,78 B | no disponible | GGUF (multiples cuantizaciones) | MIT | Cuantizacion canonica de referencia |
| microsoft/phi-2 | 2,78 B | 2.048 tokens (segun modelo base) | safetensors | MIT | Repositorio oficial del modelo base |

Los tres artefactos comparten pesos y licencia; la diferencia está en el formato, la variedad de cuantizaciones ofrecidas (TheBloke publica varias, esta copia solo Q4_K_M) y la documentación de rendimiento. No se dispone de datos de benchmarks comparativos en la informacion proporcionada para contrastar calidad entre ellos.

## Limitaciones y advertencias

- Redistribución de terceros: los pesos provienen de TheBloke y el modelo original de Microsoft; el autor de esta copia no ofrece garantías de integridad más allá de la licencia MIT.
- Historial mínimo: 27 descargas y 0 likes, sin pipeline declarado ni lista de idiomas, lo que reduce la trazabilidad y el soporte comunitario.
- Métricas obsoletas: el throughput publicado corresponde a un backend Vulkan ya retirado del motor; las cifras actuales sobre HRX GPU no están disponibles.
- Contexto limitado: el modelo base Phi-2 tiene una ventana corta (2.048 tokens según la documentación del modelo original), insuficiente para conversaciones multi-turno largas o documentos extensos.
- Riesgo de alucinación: inherente a un modelo de 2,78 B sin alineación documentada en esta copia; no apto para tareas de alta precisión sin verificación humana.
- Sesgos: no documentados en la model card; deben asumirse los del corpus de entrenamiento del modelo base.
- Idiomas: no se declara cobertura multilingüe; el rendimiento fuera del inglés no está garantizado.
- Uso comercial: permitido por la licencia MIT, pero conviene revisar los términos del modelo base original de Microsoft antes de desplegar en producción.
- Cuantización única: solo se ofrece Q4_K_M, sin alternativas de mayor precisión (Q8_0, F16) para casos que requieran fidelidad máxima.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/1bit-MONSTER/phi-2-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-2
- Cuantización de origen: https://huggingface.co/TheBloke/phi-2-GGUF
- Motor del autor: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
